# -*- coding: utf-8 -*-
"""Baca project Sysmac Studio (.smc2) tanpa Sysmac Studio.

Sysmac Studio TIDAK punya export XML - cuma import. Tapi file .smc2 itu sendiri
container ZIP berisi XML, jadi isinya tetap bisa dibaca dari luar.

  python read_smc2.py project.smc2                  # ringkasan program & section
  python read_smc2.py project.smc2 --operands       # inventaris operand + komen
  python read_smc2.py project.smc2 --xref           # ditulis di mana, dibaca di mana
  python read_smc2.py project.smc2 --xref LB800     # sama, tapi difilter + lokasinya
  python read_smc2.py project.smc2 --llm prog.md    # SELURUH konteks buat disuap ke LLM
  python read_smc2.py project.smc2 --graph g.json   # node+edge buat dipetakan
  python read_smc2.py project.smc2 --json out.json  # dump mentah

PERINGATAN - format ini TIDAK didokumentasikan Omron dan bisa berubah di versi
Studio mana pun. Karena itu:
  * HANYA BACA. Jangan pernah nulis balik ke .smc2 - project bisa rusak dan gak
    ada cara memperbaikinya.
  * Jangan taruh di jalur kritis. Menulis program tetap lewat import XML yang
    resmi didukung (itu yang dihasilkan generator). Pembaca ini alat ANALISIS.
Kalau suatu saat formatnya berubah, yang berhenti jalan cuma audit - bukan
kemampuan generate.

Peta format (hasil reverse engineering, diverifikasi pada Sysmac Studio 1.56):

  .smc2                     ZIP
   +- <sol>/<sol>.manifest  nama solution, versi schema
   +- <sol>/<sol>.oem       POHON PROJECT  <- kunci pemetaannya
   +- <sol>/<guid>.xml      isi: <LadderDiagram> atau <data><StructuredText>

  Pohon di .oem bersarang lewat <ChildEntities>:
    Entity[Solution]
      Entity[Group subtype=IecPous]
        Entity[Group subtype=IecPrograms]
          Entity[Program subtype=MultipartLadder]  name = NAMA PROGRAM
            Entity[PouBody subtype=Ladder]         name = NAMA SECTION
                                                   id   = nama file <id>.xml

  JEBAKAN: yang jadi nama file ladder itu id milik PouBody SENDIRI. Di bawahnya
  ada Entity[PouBodySourceHolder] yang juga punya id dan juga punya file .xml -
  tapi isinya CxilVariable (variabel bantu hasil compile), bukan ladder. Ketuker
  di sini hasilnya bukan error, cuma 0 rung di semua section - dan itu terlihat
  seperti "file-nya kosong" padahal salah alamat.

  Di dalam <LadderDiagram>:
    DiagramElement i:type="Rung"     -> Elements -> DiagramElement per objek
      Contact : Variable, NormallyClosed, Positive/NegativeTransitionSensing
      Coil    : Variable, Negated, Set, Reset, Positive/NegativeTransitionSensing
      LeftPowerRail / RightPowerRail / Connection / FunctionElement / ...

  Komentar dipakai bersama gaya DataContract: kemunculan pertama membawa teks
  dengan z:Id, kemunculan berikutnya cuma z:Ref ke id itu. Jadi harus diresolusi,
  kalau tidak sebagian besar komentar kebaca kosong.
"""
import zipfile, sys, json, re, collections
from xml.etree import ElementTree as ET

NS_I = '{http://www.w3.org/2001/XMLSchema-instance}type'
NS_Z_ID = '{http://schemas.microsoft.com/2003/10/Serialization/}Id'
NS_Z_REF = '{http://schemas.microsoft.com/2003/10/Serialization/}Ref'


# --------------------------------------------------------------- pohon project
def read_tree(z):
    """Kembalikan [(program, section, xml_id)] dari .oem."""
    oem = [x for x in z.namelist() if x.endswith('.oem')]
    if not oem:
        return []
    root = ET.fromstring(z.read(oem[0]))
    out = []

    def walk(node, prog=None, sect=None):
        t, nm, i = node.get('type'), node.get('name') or '', node.get('id') or ''
        if t == 'Program':
            prog = nm or prog
        elif t == 'PouBody':
            sect = nm or sect
            # id PouBody SENDIRI = nama file XML ladder-nya. Bukan anaknya.
            out.append((prog or '(tanpa program)', sect or '(tanpa nama)', i))
        kids = node.find('ChildEntities')
        if kids is not None:
            for ch in kids:
                if ch.tag == 'Entity':
                    walk(ch, prog, sect)

    for e in root:
        if e.tag == 'Entity':
            walk(e)
    return out


# ------------------------------------------------------------------- komentar
def comment_map(root):
    """z:Id -> teks. Kemunculan pertama bawa teks, sisanya cuma z:Ref."""
    m = {}
    for e in root.iter():
        if not e.tag.endswith('Comment'):
            continue
        zid = e.get(NS_Z_ID)
        if zid and e.text and e.text.strip():
            m[zid] = e.text.strip()
    return m


def comment_of(el, cmap):
    c = el.find('Comment')
    if c is None:
        return ''
    if c.text and c.text.strip():
        return c.text.strip()
    ref = c.get(NS_Z_REF)
    return cmap.get(ref, '') if ref else ''


# ---------------------------------------------------------------------- ladder
def flag(el, tag):
    c = el.find(tag)
    return bool(c is not None and (c.text or '').strip().lower() == 'true')


def read_ladder(xml_bytes):
    """[{comment, elements:[{kind, var, nc, neg, set, reset, edge}]}] per rung."""
    root = ET.fromstring(xml_bytes)
    cmap = comment_map(root)
    rungs = []
    for r in root.iter('DiagramElement'):
        if r.get(NS_I) != 'Rung':
            continue
        els = []
        holder = r.find('Elements')
        for e in (list(holder) if holder is not None else []):
            k = e.get(NS_I)
            item = {'kind': k}
            v = e.find('Variable')
            if v is not None and v.text:
                item['var'] = v.text.strip()
            if k == 'Contact':
                item['nc'] = flag(e, 'NormallyClosed')
            elif k == 'Coil':
                item['neg'] = flag(e, 'Negated')
                item['set'] = flag(e, 'Set')
                item['reset'] = flag(e, 'Reset')
            if flag(e, 'PositiveTransitionSensing'):
                item['edge'] = 'rising'
            elif flag(e, 'NegativeTransitionSensing'):
                item['edge'] = 'falling'
            c = comment_of(e, cmap)
            if c:
                item['comment'] = c
            els.append(item)
        rungs.append({'comment': comment_of(r, cmap), 'elements': els})
    return rungs


def read_st(xml_bytes):
    root = ET.fromstring(xml_bytes)
    t = root.find('.//StructuredText/Text')
    return t.text if t is not None and t.text else None


# ------------------------------------------------- ladder JSON (Studio >= 1.66)
# Mulai Sysmac Studio 1.66 ladder TIDAK lagi disimpan sebagai <LadderDiagram>
# DataContract XML, melainkan sebagai deretan objek JSON - satu objek per rung:
#
#   {"CLs":[...], "LRI":7, "RRI":8, "VLs":[{"Ix":9,"X":1}], "CMT":"komen rung"}
#
#   CLs  daftar elemen rangkaian
#          __type  LD = kontak, ST = coil, F = fungsi/FB, HL = link horizontal
#          Var     operand
#          Not     true = NC (kontak) / negated (coil)
#          X, Y    posisi grid: kolom, baris. Baris 0 = jalur utama.
#   LRI/RRI index rel kiri/kanan
#   VLs  link vertikal = titik cabang paralel
#
# Format ini justru lebih gampang dibaca daripada yang lama: tata letaknya
# eksplisit lewat X/Y, tidak perlu menelusuri edge GUID.
KIND_JSON = {'LD': 'Contact', 'ST': 'Coil', 'F': 'Function', 'HL': 'HLink', 'PF': 'PowerFlow'}


def read_ladder_json(text):
    dec = json.JSONDecoder()
    rungs, i, n = [], 0, len(text)
    while i < n:
        while i < n and text[i] in ' \r\n\t':
            i += 1
        if i >= n:
            break
        try:
            obj, i = dec.raw_decode(text, i)
        except ValueError:
            break
        els = []
        for e in obj.get('CLs', []):
            t = e.get('__type')
            item = {'kind': KIND_JSON.get(t, t)}
            if e.get('Var'):
                item['var'] = e['Var']
            if e.get('Not'):
                item['nc' if t == 'LD' else 'neg'] = True
            if e.get('Name'):
                item['func'] = e['Name']
            for k in ('X', 'Y'):
                if k in e:
                    item[k.lower()] = e[k]
            els.append(item)
        rungs.append({'comment': obj.get('CMT', '') or '', 'elements': els,
                      'vlinks': obj.get('VLs', [])})
    return rungs


# ------------------------------------------------ tabel variabel global (SLWD)
# Berkas teks berpenanda "[SLWD version=1.0]", satu variabel per baris:
#   ++D=BOOL <TAB> N=CH0000_00 <TAB> AT=IOBus://... <TAB> G=VAR_GLOBAL <TAB> Com=PB EMERGENCY STOP
# Ini praktis IO list-nya: nama, tipe, alamat fisik, dan komentar sekaligus.
def read_variables(z):
    out = []
    for x in z.namelist():
        if x.endswith('/'):
            continue
        b = z.read(x)
        if b[:6] != b'[SLWD ' and b[:9] != b'\xef\xbb\xbf[SLWD ':
            continue
        for line in b.decode('utf-8-sig', 'ignore').split('\n'):
            line = line.strip()
            if not line.startswith('++D='):
                continue
            rec = {}
            for part in line[2:].split('\t'):
                if '=' in part:
                    k, v = part.split('=', 1)
                    rec[k.strip()] = v.strip()
            if rec.get('N'):
                out.append({'name': rec.get('N'), 'type': rec.get('D'),
                            'address': rec.get('AT'), 'group': rec.get('G'),
                            'comment': rec.get('Com', '')})
    return out


# ----------------------------------------------------------------------- utama
def read_project(path):
    z = zipfile.ZipFile(path)
    by_id = {}
    for n in z.namelist():
        if n.endswith('.xml'):
            by_id[n.rsplit('/', 1)[-1][:-4]] = n

    sol = ''
    man = [x for x in z.namelist() if x.endswith('.manifest')]
    if man:
        m = re.search(r'solutionName="([^"]+)"', z.read(man[0]).decode('utf-8', 'ignore'))
        if m:
            sol = m.group(1)

    proj = {'solution': sol, 'file': path, 'programs': []}
    seen_prog = {}
    for prog, sect, xid in read_tree(z):
        entry = seen_prog.setdefault(prog, {'name': prog, 'sections': []})
        if prog not in [p['name'] for p in proj['programs']]:
            proj['programs'].append(entry)
        n = by_id.get(xid)
        s = {'name': sect, 'id': xid, 'kind': None, 'rungs': [], 'st': None}
        if n:
            b = z.read(n)
            head = b.decode('utf-8-sig', 'ignore').lstrip()[:400]
            # Bentuk ladder beda antar versi Studio - dua-duanya didukung.
            if '<LadderDiagram' in head:
                s['kind'] = 'ladder'                     # Studio <= 1.56
                s['rungs'] = read_ladder(b)
            elif head[:1] == '{' and '"CLs"' in head:
                s['kind'] = 'ladder'                     # Studio >= 1.66
                s['rungs'] = read_ladder_json(b.decode('utf-8-sig', 'ignore'))
            elif '<StructuredText' in head:
                s['kind'] = 'st'
                s['st'] = read_st(b)
        entry['sections'].append(s)
    proj['variables'] = read_variables(z)
    return proj


# ------------------------------------------------- rekonstruksi logika rung
# Format JSON (Studio >= 1.66) menyimpan posisi grid tiap elemen: X = kolom,
# Y = baris (0 = jalur utama). Dari situ seri/paralel bisa disusun ulang tanpa
# menelusuri sambungan:
#   - satu baris, kolom menaik   -> seri  (AND)
#   - baris > 0 yang menutupi rentang kolom yang sama -> cabang paralel (OR)
#
# Hasilnya ekspresi boolean yang bisa dibaca manusia MAUPUN LLM, mis.
#   (/LB010 OR GB012_015) AND LB011 AND LB050  ->  LB300
#
# Untuk ladder bercabang bertingkat, hasilnya pendekatan - cabang yang bersarang
# dalam cabang disederhanakan jadi satu tingkat. Ditandai di keluaran biar tidak
# dikira presisi penuh.
def rung_expr(rung):
    els = [e for e in rung['elements'] if e.get('var') or e.get('func')]
    if not els:
        return '', [], False

    def label(e):
        if e.get('func'):
            return e['func'] + '()'
        v = e['var']
        return ('/' + v) if (e.get('nc') or e.get('neg')) else v

    outs = [e for e in els if e['kind'] == 'Coil']
    ins = [e for e in els if e['kind'] != 'Coil']
    if not ins:
        return '', [label(e) for e in outs], False

    # Tanpa koordinat (format XML lama, atau rung satu kolom) pakai urutan dokumen.
    # Ditandai perkiraan HANYA kalau elemennya lebih dari satu - kalau cuma satu,
    # urutan tidak bisa salah dan menandainya cuma bikin ragu tanpa alasan.
    if not any('x' in e or 'y' in e for e in ins):
        return ' AND '.join(label(e) for e in ins), [label(e) for e in outs], len(ins) > 1

    grid = {}
    for e in ins:
        grid.setdefault(e.get('y', 0), {})[e.get('x', 0)] = e
    maxc = max(max(r) for r in grid.values())

    # cabang: deretan kolom bersambung pada baris > 0
    branches = []
    for y in sorted(k for k in grid if k):
        cols = sorted(grid[y])
        run = [cols[0]]
        for c in cols[1:]:
            if c == run[-1] + 1:
                run.append(c)
            else:
                branches.append((run[0], run[-1], y)); run = [c]
        branches.append((run[0], run[-1], y))

    main = grid.get(0, {})
    parts, c, approx = [], 0, False
    while c <= maxc:
        here = [b for b in branches if b[0] == c]
        if here:
            end = max(b[1] for b in here)
            alts = []
            m = [label(main[i]) for i in range(c, end + 1) if i in main]
            if m:
                alts.append(' AND '.join(m))
            for b0, b1, y in here:
                alts.append(' AND '.join(label(grid[y][i]) for i in range(b0, b1 + 1) if i in grid[y]))
            if len(here) > 1 or len([b for b in branches if b[0] > c and b[0] <= end]):
                approx = True
            parts.append('(' + ' OR '.join(a for a in alts if a) + ')')
            c = end + 1
        else:
            if c in main:
                parts.append(label(main[c]))
            c += 1
    return ' AND '.join(parts), [label(e) for e in outs], approx


# --------------------------------------------------- rekonstruksi flowchart
# Pola motion step (satu langkah gerakan) punya bentuk rung yang khas:
#
#   x0y0 prevBit --- x1y0 /confirm ------------> Coil cmd
#                    x1y1 sol - x2y1 lsc ------> Coil confirm
#                    x1y2 confirm (seal)
#
# Pembeda dari rung berkoil-dua yang LAIN (mis. mutex pemilih varian, yang juga
# punya dua coil dan sama-sama nyeal diri): pada motion step hanya SATU coil yang
# muncul sebagai kontak NC. Di rung mutex, kedua coil saling mengunci lewat NC,
# jadi tidak ada yang unik - dan rung seperti itu memang bukan langkah gerakan.
MOTION_SECT = re.compile(r'auto.*runn|autorunn|motion', re.I)


def find_motion_steps(section):
    """[(idx, prevBit, sol, lsc, cmd, confirm, comment)] + daftar rung tak terpetakan."""
    steps, unmapped = [], []
    for i, r in enumerate(section['rungs'], 1):
        els = r['elements']
        coils = [e for e in els if e['kind'] == 'Coil' and e.get('var')]
        cts = [e for e in els if e['kind'] == 'Contact' and e.get('var')]
        if len(coils) != 2:
            unmapped.append((i, 'bukan 2 coil'))
            continue
        ncs = {c['var'] for c in cts if c.get('nc')}
        cand = [c for c in coils if c['var'] in ncs]
        if len(cand) != 1:
            unmapped.append((i, 'dua coil saling mengunci (mutex), bukan langkah gerakan'
                                if len(cand) == 2 else 'tidak ada coil yang di-gate kontak NC'))
            continue
        confirm = cand[0]
        cmd = [c for c in coils if c is not confirm][0]

        # prevBit = kontak paling kiri di jalur utama
        main0 = [c for c in cts if (c.get('y', 0) == 0 and c.get('x', 0) == 0)]
        if not main0:
            unmapped.append((i, 'tidak ada kontak di kolom 0 baris 0 (prevBit)'))
            continue
        prev = main0[0]['var']

        # sol & lsc = kontak sebaris dengan coil confirm, selain prev/cmd/confirm
        row = confirm.get('y', 0)
        band = [c for c in cts if c.get('y', 0) == row
                and c['var'] not in (prev, cmd['var'], confirm['var'])]
        band.sort(key=lambda c: c.get('x', 0))
        if len(band) < 2:
            unmapped.append((i, 'tidak ketemu pasangan solenoid+sensor di baris confirm'))
            continue
        steps.append({'rung': i, 'prev': prev, 'sol': band[0]['var'], 'lsc': band[1]['var'],
                      'cmd': cmd['var'], 'confirm': confirm['var'],
                      'comment': r.get('comment', '')})
    return steps, unmapped


def flowchart(p, out):
    """Susun ulang urutan gerakan jadi motionSequences JSON (siap diimpor editor).

    Rantai langkahnya diambil dari prevBit: kalau prevBit sebuah langkah sama
    dengan confirm langkah lain, berarti langkah itu menunggu langkah tersebut.
    Kalau prevBit bukan milik langkah manapun, dia dibiarkan sebagai rujukan bit
    apa adanya - editor akan menampilkannya sebagai blok syarat, jadi informasinya
    tidak hilang.
    """
    result, report = {}, []
    for prog in p['programs']:
        for s in prog['sections']:
            if not MOTION_SECT.search(s['name']) or not s['rungs']:
                continue
            steps, unmapped = find_motion_steps(s)
            key = '%s/%s' % (prog['name'], s['name'])
            report.append((key, len(s['rungs']), len(steps), unmapped, 0))
            if not steps:
                continue
            by_confirm = {st['confirm']: 'n%d' % k for k, st in enumerate(steps, 1)}

            # Rantai langkah TIDAK selalu langsung: confirm sebuah langkah sering
            # tidak jadi prevBit langkah berikutnya, melainkan lewat rung perantara
            #   #10  LB420 AND ... -> LB428, LB429      <- penghasil step-enable
            #   #11  LB429 AND ... -> LB430, LB431      <- langkah gerakannya
            # Jadi prevBit ditelusuri MUNDUR lewat rung yang menulisnya sampai
            # ketemu confirm langkah lain. Tanpa ini semua langkah terlihat
            # berangkat sendiri-sendiri - flowchart yang rapi tapi bohong.
            writers = collections.defaultdict(list)
            for r in s['rungs']:
                ins = [e['var'] for e in r['elements']
                       if e['kind'] == 'Contact' and e.get('var')]
                for e in r['elements']:
                    if e['kind'] == 'Coil' and e.get('var'):
                        writers[e['var']].append(ins)

            def trace(bit, depth=6, seen=None):
                """Telusuri mundur dari `bit` sampai ketemu confirm langkah lain."""
                seen = seen or set()
                if bit in by_confirm:
                    return by_confirm[bit], True
                if depth <= 0 or bit in seen:
                    return bit, False
                seen.add(bit)
                for ins in writers.get(bit, []):
                    for src in ins:
                        if src == bit:
                            continue
                        got, ok = trace(src, depth - 1, seen)
                        if ok:
                            return got, True
                return bit, False

            nodes, chained = [], 0
            for k, st in enumerate(steps, 1):
                ref, ok = trace(st['prev'])
                if ok:
                    chained += 1
                nodes.append({
                    'id': 'n%d' % k, 'type': 'motion', 'sol': st['sol'],
                    'after': [ref], 'join': 'AND',
                    'x': 20 + ((k - 1) % 4) * 175,
                    'y': 75 + ((k - 1) // 4) * 75,
                })
            report[-1] = (key, len(s['rungs']), len(steps), unmapped, chained)
            result[key] = [{'condition': '', 'comment': s['name'],
                            'conditionComments': {}, 'conditionPositions': {}, 'nodes': nodes}]

    with open(out, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print('WROTE %s' % out)
    print()
    print('%-40s %5s %5s %8s %s' % ('SECTION', 'RUNG', 'STEP', 'BERANTAI', 'TAK TERPETAKAN'))
    print('-' * 78)
    tot_s = tot_u = tot_c = 0
    for key, nr, ns, un, ch in report:
        print('%-40s %5d %5d %8s %5d' % (key[:40], nr, ns,
                                         ('%d/%d' % (ch, ns)) if ns else '-', len(un)))
        tot_s += ns
        tot_u += len(un)
        tot_c += ch
    print()
    print('%d langkah gerakan terpetakan, %d di antaranya berhasil dirantai.' % (tot_s, tot_c))
    if tot_s and tot_c < tot_s:
        print('Langkah yang TIDAK berantai dibiarkan menunjuk bit aslinya - di editor akan')
        print('muncul sebagai blok syarat, bukan disembunyikan. Urutannya perlu dicek manual.')
    print()
    print('%d rung tidak terpetakan. Itu BUKAN berarti salah - kebanyakan memang bukan' % tot_u)
    print('langkah gerakan (mutex varian, output, interlock). Alasan per rung:')
    alasan = collections.Counter(a for _, _, _, un, _ in report for _, a in un)
    for a, c in alasan.most_common():
        print('   %4d  %s' % (c, a))


def llm_dump(p, out):
    """Ekspor SELURUH konteks program jadi satu berkas Markdown.

    Tujuannya: engineer bisa bertanya ke AI sebelum memodifikasi program orang
    lain. Yang dibutuhkan untuk itu bukan cuma ladder-nya, tapi konteksnya -
    komentar rung, arti tiap bit, siapa menulis siapa membaca. Semuanya
    dikumpulkan di sini dalam bentuk teks biasa supaya bisa langsung disuap ke
    LLM atau di-index alat lain.
    """
    cmt = {v['name']: v.get('comment', '') for v in (p.get('variables') or [])}
    addr = {v['name']: v.get('address', '') for v in (p.get('variables') or [])}

    wr = collections.defaultdict(list)
    rd = collections.defaultdict(list)
    for prog in p['programs']:
        for s in prog['sections']:
            for i, r in enumerate(s['rungs'], 1):
                loc = '%s/%s#%d' % (prog['name'], s['name'], i)
                for e in r['elements']:
                    if e.get('var'):
                        (wr if e['kind'] == 'Coil' else rd)[e['var']].append(loc)

    L = []
    A = L.append
    A('# Program PLC: %s\n' % (p.get('solution') or '(tanpa nama)'))
    A('Diekstrak dari file project Sysmac. Berkas ini memuat seluruh konteks yang')
    A('dibutuhkan untuk memahami program: logika tiap rung, komentarnya, arti tiap')
    A('bit, dan silang-rujuk siapa menulis siapa membaca.\n')
    A('- Program: %d' % len(p['programs']))
    A('- Section: %d' % sum(len(x['sections']) for x in p['programs']))
    A('- Rung: %d' % sum(len(s['rungs']) for x in p['programs'] for s in x['sections']))
    A('- Variabel: %d\n' % len(p.get('variables') or []))

    A('## Cara membaca\n')
    A('`/BIT` berarti kontak normally-closed (kebalikan). `->` menunjuk keluaran')
    A('(coil). Baris bertanda `~` artinya susunan cabangnya disederhanakan.\n')

    for prog in p['programs']:
        A('\n---\n')
        A('# PROGRAM %s\n' % prog['name'])
        for s in prog['sections']:
            if not s['rungs'] and not s.get('st'):
                continue
            A('\n## %s / %s\n' % (prog['name'], s['name']))
            if s.get('st'):
                A('```\n%s\n```\n' % (s['st'] or '').strip()[:4000])
                continue
            for i, r in enumerate(s['rungs'], 1):
                expr, outs, approx = rung_expr(r)
                if r.get('comment'):
                    A('\n**%d. %s**' % (i, r['comment']))
                else:
                    A('\n**%d.**' % i)
                if expr or outs:
                    A('```')
                    A(('~ ' if approx else '') + (expr or 'TRUE') +
                      ('  ->  ' + ', '.join(outs) if outs else ''))
                    A('```')
                # arti tiap bit yang dipakai di rung ini - inilah konteks yang
                # biasanya hilang kalau cuma membaca ladder
                seen, gloss = set(), []
                for e in r['elements']:
                    v = e.get('var')
                    if not v or v in seen:
                        continue
                    seen.add(v)
                    c = cmt.get(v, '')
                    a = addr.get(v, '')
                    if c or a:
                        gloss.append('- `%s` %s%s' % (v, c, (' [%s]' % a) if a else ''))
                if gloss:
                    A('\n'.join(gloss))

    A('\n---\n')
    A('# Silang-rujuk operand\n')
    A('| Operand | Arti | Ditulis di | Dibaca (kali) |')
    A('|---|---|---|---|')
    for v in sorted(set(list(wr) + list(rd))):
        A('| `%s` | %s | %s | %d |' % (v, cmt.get(v, ''),
                                       ', '.join(wr[v][:3]) or '(tidak ditulis di project ini)',
                                       len(rd[v])))

    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))
    print('WROTE %s  (%d baris)' % (out, len(L)))


def xref(p, only=None):
    """Cross-reference: tiap operand DITULIS di mana, DIBACA di mana.

    Ini artefak paling menolong waktu membaca program orang lain. Pertanyaan
    pertama yang selalu muncul - "bit ini siapa yang nyalain?" - kejawab langsung,
    tanpa menyisir section satu per satu.
    """
    wr = collections.defaultdict(list)
    rd = collections.defaultdict(list)
    for prog in p['programs']:
        for s in prog['sections']:
            for i, r in enumerate(s['rungs'], 1):
                loc = '%s/%s#%d' % (prog['name'], s['name'], i)
                for e in r['elements']:
                    v = e.get('var')
                    if not v:
                        continue
                    (wr if e['kind'] == 'Coil' else rd)[v].append(loc)

    cmt = {v['name']: v.get('comment', '') for v in (p.get('variables') or [])}
    keys = sorted(set(list(wr) + list(rd)))
    if only:
        keys = [k for k in keys if only.lower() in k.lower()]

    print('%-24s %5s %5s  %s' % ('OPERAND', 'TULIS', 'BACA', 'KOMEN'))
    print('-' * 78)
    for k in keys:
        print('%-24s %5d %5d  %s' % (k[:24], len(wr[k]), len(rd[k]), cmt.get(k, '')[:34]))
        if only:
            for l in wr[k]:
                print('        TULIS  %s' % l)
            for l in rd[k][:40]:
                print('        baca   %s' % l)
    print()
    yatim = sum(1 for k in keys if rd[k] and not wr[k])
    print('%d operand. Dibaca tapi tidak pernah ditulis di project ini: %d' % (len(keys), yatim))


def graph(p, out):
    """Ekspor graf (node + edge) supaya program bisa dipetakan alat lain / LLM.

    Bentuknya sengaja datar: program & section jadi wadah, operand jadi simpul,
    dan arah edge menyatakan siapa menulis siapa membaca. Dari situ alur sinyal
    antar section kelihatan tanpa perlu membuka ladder-nya.
    """
    nodes, edges, seen = [], [], set()

    def node(nid, kind, label, **extra):
        if nid in seen:
            return
        seen.add(nid)
        d = {'id': nid, 'kind': kind, 'label': label}
        d.update(extra)
        nodes.append(d)

    cmt = {v['name']: v.get('comment', '') for v in (p.get('variables') or [])}
    addr = {v['name']: v.get('address', '') for v in (p.get('variables') or [])}

    for prog in p['programs']:
        pid = 'prog:' + prog['name']
        node(pid, 'program', prog['name'])
        for s in prog['sections']:
            sid = 'sect:%s/%s' % (prog['name'], s['name'])
            node(sid, 'section', s['name'], program=prog['name'], rungs=len(s['rungs']))
            edges.append({'from': pid, 'to': sid, 'rel': 'contains'})
            for r in s['rungs']:
                for e in r['elements']:
                    v = e.get('var')
                    if not v:
                        continue
                    vid = 'var:' + v
                    node(vid, 'operand', v, comment=cmt.get(v, ''), address=addr.get(v, ''))
                    if e['kind'] == 'Coil':
                        edges.append({'from': sid, 'to': vid, 'rel': 'writes'})
                    else:
                        edges.append({'from': vid, 'to': sid, 'rel': 'read_by'})

    # buang edge kembar - satu operand bisa dibaca puluhan kali di section yang sama
    uniq = {(e['from'], e['to'], e['rel']): e for e in edges}
    g = {'solution': p.get('solution', ''), 'nodes': nodes, 'edges': list(uniq.values())}
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(g, f, ensure_ascii=False, indent=2)
    print('WROTE %s  (%d node, %d edge)' % (out, len(nodes), len(g['edges'])))


def summarise(p):
    print('SOLUTION : %s' % (p['solution'] or '(tanpa nama)'))
    print('FILE     : %s' % p['file'])
    tot_r = tot_s = 0
    print()
    for prog in p['programs']:
        lad = [s for s in prog['sections'] if s['kind'] == 'ladder']
        st = [s for s in prog['sections'] if s['kind'] == 'st']
        n = sum(len(s['rungs']) for s in lad)
        tot_r += n
        tot_s += len(prog['sections'])
        print('PROGRAM %-34s %2d section, %4d rung' % (prog['name'][:34], len(prog['sections']), n))
        for s in prog['sections']:
            mark = '%4d rung' % len(s['rungs']) if s['kind'] == 'ladder' else \
                   ('ST %d char' % len(s['st'] or '')) if s['kind'] == 'st' else '(kosong)'
            print('    %-38s %s' % (s['name'][:38], mark))
    print()
    v = p.get('variables') or []
    withaddr = sum(1 for x in v if x.get('address'))
    print('TOTAL    : %d program, %d section, %d rung' % (len(p['programs']), tot_s, tot_r))
    print('VARIABEL : %d (%d punya alamat IO)' % (len(v), withaddr))


def operands(p):
    use = collections.Counter()
    cmt = {}
    for prog in p['programs']:
        for s in prog['sections']:
            for r in s['rungs']:
                for e in r['elements']:
                    if e.get('var'):
                        use[e['var']] += 1
                        if e.get('comment') and e['var'] not in cmt:
                            cmt[e['var']] = e['comment']
    print('operand unik: %d' % len(use))
    print()
    print('%-26s %6s  %s' % ('OPERAND', 'DIPAKAI', 'KOMEN'))
    for v, c in use.most_common():
        print('%-26s %6d  %s' % (v[:26], c, cmt.get(v, '')[:44]))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    p = read_project(sys.argv[1])
    if '--json' in sys.argv:
        i = sys.argv.index('--json')
        out = sys.argv[i + 1] if len(sys.argv) > i + 1 else 'smc2.json'
        with open(out, 'w', encoding='utf-8') as f:
            json.dump(p, f, ensure_ascii=False, indent=2)
        print('WROTE', out)
    elif '--flowchart' in sys.argv:
        i = sys.argv.index('--flowchart')
        flowchart(p, sys.argv[i + 1] if len(sys.argv) > i + 1 else 'motionSequences.json')
    elif '--llm' in sys.argv:
        i = sys.argv.index('--llm')
        llm_dump(p, sys.argv[i + 1] if len(sys.argv) > i + 1 else 'program.md')
    elif '--graph' in sys.argv:
        i = sys.argv.index('--graph')
        graph(p, sys.argv[i + 1] if len(sys.argv) > i + 1 else 'graph.json')
    elif '--xref' in sys.argv:
        i = sys.argv.index('--xref')
        only = sys.argv[i + 1] if len(sys.argv) > i + 1 and not sys.argv[i + 1].startswith('-') else None
        xref(p, only)
    elif '--operands' in sys.argv:
        operands(p)
    else:
        summarise(p)
