// Pembaca format project Sysmac Studio (.smc2). Hasil reverse engineering,
// diverifikasi pada Studio 1.56 dan 1.66.
//
//   .smc2                     ZIP
//    +- <sol>/<sol>.manifest  nama solution
//    +- <sol>/<sol>.log       versi Sysmac Studio
//    +- <sol>/<sol>.oem       POHON PROJECT  <- kuncinya
//    +- <sol>/<guid>.xml      isi tiap section
//
// PERINGATAN - format ini TIDAK didokumentasikan Omron dan bisa berubah di versi
// Studio mana pun. Karena itu HANYA BACA: jangan pernah menulis balik ke .smc2,
// project bisa rusak tanpa cara memperbaikinya. Membuat program tetap lewat
// jalur import XML yang resmi didukung.
if (typeof require !== 'undefined') {
  var { inflate } = require('./zip.js');
  var { text } = require('./env.js');
  var { xmlParse, xmlChild, xmlChildText, xmlFindAll, xmlUnesc } = require('./xml.js');
}

// ------------------------------------------------------------- pohon project
// Pohon di .oem bersarang lewat <ChildEntities>:
//   Entity[Program]            name = NAMA PROGRAM
//     Entity[PouBody]          name = NAMA SECTION, id = nama file <id>.xml
//
// JEBAKAN: yang jadi nama file ladder itu id milik PouBody SENDIRI. Di bawahnya
// ada Entity[PouBodySourceHolder] yang JUGA punya id dan JUGA punya berkas .xml -
// tapi isinya CxilVariable (variabel bantu hasil compile), bukan ladder. Salah
// ambil tidak menghasilkan error apa pun, cuma 0 rung di semua section - dan itu
// terlihat seperti "project-nya kosong", bukan seperti salah alamat.
function parseTree(oemText) {
  const root = xmlParse(oemText);
  const out = [];
  function walk(node, prog, sect) {
    const t = node.attrs.type, nm = node.attrs.name || '', id = node.attrs.id || '';
    if (t === 'Program') prog = nm || prog;
    else if (t === 'PouBody') {
      sect = nm || sect;
      out.push({ prog: prog || '(tanpa program)', sect: sect || '(tanpa nama)', id });
    }
    const kids = xmlChild(node, 'ChildEntities');
    if (kids) for (const ch of kids.kids) if (ch.tag === 'Entity') walk(ch, prog, sect);
  }
  for (const e of root.kids) if (e.tag === 'Entity') walk(e, null, null);
  return out;
}

// --------------------------------------------- ladder DataContract (Studio <= 1.56)
// Komentar dipakai bersama gaya DataContract: kemunculan PERTAMA membawa teks
// dengan z:Id, kemunculan berikutnya cuma z:Ref ke id itu. Harus diresolusi,
// kalau tidak sebagian besar komentar terbaca kosong - tanpa error apa pun.
function parseLadderXml(src) {
  const root = xmlParse(src);

  const cmap = new Map();
  for (const c of xmlFindAll(root, 'Comment')) {
    const id = c.attrs['z:Id'];
    if (id && c.text.trim()) cmap.set(id, c.text.trim());
  }
  const cmt = el => {
    const c = xmlChild(el, 'Comment');
    if (!c) return '';
    if (c.text.trim()) return c.text.trim();
    const r = c.attrs['z:Ref'];
    return r ? (cmap.get(r) || '') : '';
  };
  const flag = (el, tag) => xmlChildText(el, tag).toLowerCase() === 'true';

  const rungs = [];
  for (const r of xmlFindAll(root, 'DiagramElement')) {
    if (r.attrs['i:type'] !== 'Rung') continue;
    const holder = xmlChild(r, 'Elements');
    const els = [];
    if (holder) {
      for (const e of holder.kids) {
        // Sebagian DiagramElement memang TIDAK punya i:type (rujukan balik gaya
        // DataContract). Ditulis null eksplisit, bukan undefined - undefined
        // hilang diam-diam waktu di-JSON-kan, dan elemennya jadi "{}" kosong
        // yang tidak bisa dibedakan dari elemen rusak.
        const k = e.attrs['i:type'] || null;
        const it = { kind: k };
        const v = xmlChildText(e, 'Variable');
        if (v) it.var = v;
        if (k === 'Contact') it.nc = flag(e, 'NormallyClosed');
        if (k === 'Coil') {
          it.neg = flag(e, 'Negated');
          it.set = flag(e, 'Set');
          it.reset = flag(e, 'Reset');
        }
        if (flag(e, 'PositiveTransitionSensing')) it.edge = 'rising';
        else if (flag(e, 'NegativeTransitionSensing')) it.edge = 'falling';
        const c = cmt(e);
        if (c) it.comment = c;
        els.push(it);
      }
    }
    rungs.push({ comment: cmt(r), elements: els });
  }
  return rungs;
}

// ------------------------------------------------ ladder JSON (Studio >= 1.66)
// Mulai 1.66 ladder TIDAK lagi disimpan sebagai <LadderDiagram> DataContract XML,
// melainkan sebagai deretan objek JSON - satu objek per rung:
//
//   {"CLs":[...], "LRI":7, "RRI":8, "VLs":[{"Ix":9,"X":1}], "CMT":"komen rung"}
//
//   CLs  daftar elemen: __type LD kontak / ST coil / F fungsi / HL link mendatar
//        Var operand, Not true = NC (kontak) atau negated (coil)
//        X kolom, Y baris (baris 0 = jalur utama)
//   VLs  link vertikal = titik cabang paralel
//
// Bentuk ini justru lebih mudah dibaca daripada yang lama: tata letaknya eksplisit
// lewat X/Y, tidak perlu menelusuri edge GUID.
// FB = instance blok fungsi (TON, CTU, ...) - Var-nya nama instance, Name-nya tipe.
// Bentuknya sama saja dengan F di layar (kotak berpin), jadi dipetakan sama; kalau
// tidak, kotak TON tergambar sebagai KONTAK dan ikut terbaca sebagai syarat rung.
const KIND_JSON = { LD: 'Contact', ST: 'Coil', F: 'Function', FB: 'Function',
                    HL: 'HLink', PF: 'PowerFlow' };

// Kotak fungsi membawa daftar PIN-nya sendiri lewat In/Out:
//   {__type, Arg, Var, Type}
//   __type PF  = pin aliran daya (EN/ENO) - nyambung ke kabel rung, tanpa operand
//   __type PRM = parameter biasa, operandnya di Var
const pinList = l => (l || []).map(p => ({
  name: p.Arg || '', operand: p.Var || '', flow: p.__type === 'PF', type: p.Type || '',
}));

function parseLadderJson(t) {
  const rungs = [];
  let i = 0;
  while (i < t.length) {
    while (i < t.length && /\s/.test(t[i])) i++;
    if (t[i] !== '{') break;
    // Pindai kurung kurawal sambil MENGHORMATI string dan escape - komentar rung
    // bisa memuat '{' dan '}', dan penghitung naif berhenti di tempat yang salah.
    let d = 0, j = i, ins = false, esc2 = false;
    for (; j < t.length; j++) {
      const c = t[j];
      if (esc2) { esc2 = false; continue; }
      if (c === '\\') { esc2 = true; continue; }
      if (c === '"') ins = !ins;
      else if (!ins) { if (c === '{') d++; else if (c === '}' && --d === 0) { j++; break; } }
    }
    let o;
    try { o = JSON.parse(t.slice(i, j)); } catch (e) { break; }
    i = j;
    const els = (o.CLs || []).map(e => {
      const it = { kind: KIND_JSON[e.__type] || e.__type || null };
      if (e.Var) it.var = e.Var;
      if (e.Not) { if (e.__type === 'LD') it.nc = true; else it.neg = true; }
      // Coil Set/Reset dan kontak edge dibedakan lewat flag TERSENDIRI, bukan lewat
      // __type - jadi tanpa membacanya, coil Set terbaca sebagai coil biasa dan
      // kontak naik-turun sebagai kontak biasa. Dua-duanya salah tanpa tanda apa
      // pun: rung-nya tetap tergambar wajar, cuma artinya lain.
      if (e.S) it.set = true;
      if (e.RS) it.reset = true;
      if (e.Up) it.edge = 'rising';
      else if (e.Dwn) it.edge = 'falling';
      if (e.Name) it.func = e.Name;
      if (e.In || e.Out) it.pins = { in: pinList(e.In), out: pinList(e.Out) };
      if (e.EC) it.comment = e.EC;             // komentar blok (English comment)
      // X/Y = kolom/baris. Tanpa ini ladder tidak bisa digambar sama sekali dan
      // SEMUA rung ikut ditandai perkiraan - padahal koordinatnya ada di berkas.
      if ('X' in e) it.x = e.X;
      if ('Y' in e) it.y = e.Y;
      return it;
    });
    rungs.push({ comment: o.CMT || '', elements: els, vlinks: o.VLs || [] });
  }
  return rungs;
}

// ------------------------------------------------------------- Structured Text
/**
 * Ambil badan program ST dari isi berkas section.
 *
 * Nama elemen pembungkusnya BEDA antar versi Studio: ada yang `<StructuredText>`,
 * ada yang `<StructuredTextModel>`. Mencocokkan salah satu saja bikin badan
 * program-nya terbaca KOSONG - tanpa error, tanpa tanda apa pun; di ringkasan
 * cuma tertulis "ST 0 char" dan itu tampak seperti section yang memang kosong.
 *
 * Pembungkusnya tetap harus dicari: mengambil `<Text>` pertama di mana pun bikin
 * blok deklarasi variabel yang kepungut, jadi isinya "ARRAY[1..N] OF INT" bukan
 * programnya.
 */
function readStText(src) {
  let holder = null;
  (function walk(n) {
    if (holder || !n) return;
    if (typeof n.tag === 'string' && n.tag.indexOf('StructuredText') === 0) { holder = n; return; }
    n.kids.forEach(walk);
  })(xmlParse(src));
  if (!holder) return '';
  // Badan program itu <Text> anak LANGSUNG pembungkusnya. Blok deklarasi variabel
  // juga punya <Text> dan sering ditulis lebih dulu - pencarian keturunan biasa
  // memungutnya duluan, jadi isinya "ARRAY[1..N] OF INT" bukan programnya.
  const d = xmlChild(holder, 'Text') || xmlFindAll(holder, 'Text')[0];
  return d ? d.text : '';
}

// ------------------------------------------ tabel variabel global (SLWD)
// Berkas teks berpenanda "[SLWD version=1.0]", satu variabel per baris:
//   ++D=BOOL <TAB> N=CH0000_00 <TAB> AT=IOBus://... <TAB> G=VAR_GLOBAL <TAB> Com=PB EMERGENCY STOP
// Ini praktis IO list-nya: nama, tipe, alamat fisik, grup, dan komentar sekaligus.
function parseVars(t) {
  const out = [];
  for (const line of t.split('\n')) {
    const s = line.trim();
    if (!s.startsWith('++D=')) continue;
    const rec = {};
    for (const part of s.slice(2).split('\t')) {
      const k = part.indexOf('=');
      if (k > 0) rec[part.slice(0, k).trim()] = part.slice(k + 1).trim();
    }
    if (rec.N) {
      out.push({ name: rec.N, type: rec.D || '', address: rec.AT || '',
                 group: rec.G || '', comment: rec.Com || '' });
    }
  }
  return out;
}

// ------------------------------------------------------------------- utama
async function readProject(buf, unzipFn) {
  const files = unzipFn(buf);
  const get = async n => text(await inflate(files.get(n)));

  let oemName = null, manName = null, logName = null;
  const byId = new Map();
  for (const n of files.keys()) {
    if (n.endsWith('.oem')) oemName = n;
    else if (n.endsWith('.manifest')) manName = n;
    else if (n.endsWith('.log')) logName = n;
    if (n.endsWith('.xml')) byId.set(n.split('/').pop().slice(0, -4), n);
  }
  if (!oemName) throw new Error('Bukan project Sysmac: entri .oem tidak ketemu di dalam ZIP.');

  const proj = { solution: '', studio: '', file: '', programs: [], variables: [] };
  if (manName) {
    const m = (await get(manName)).match(/solutionName="([^"]+)"/);
    // Nama solution boleh memuat & dan < - di XML itu ditulis &amp; / &lt;.
    // Tanpa di-decode, nama project tampil "HDI Line 2 Air Gap &amp; Off Gap".
    if (m) proj.solution = xmlUnesc(m[1]);
  }
  if (logName) {
    // Deklarasi <?xml version="1.0"?> juga punya atribut `version` dan letaknya
    // paling depan - regex polos selalu kena itu duluan, jadi versi Studio-nya
    // SELALU terbaca "1.0". Deklarasinya dibuang dulu.
    const m = (await get(logName)).replace(/<\?[\s\S]*?\?>/g, '').match(/version="([\d.]+)"/);
    if (m) proj.studio = m[1];
  }

  const seen = new Map();
  for (const t of parseTree(await get(oemName))) {
    let entry = seen.get(t.prog);
    if (!entry) { entry = { name: t.prog, sections: [] }; seen.set(t.prog, entry); proj.programs.push(entry); }
    const s = { name: t.sect, id: t.id, kind: null, rungs: [], st: null };
    const fn = byId.get(t.id);
    if (fn) {
      const body = await get(fn);
      const head = body.replace(/^\s+/, '').slice(0, 400);
      // Bentuk ladder beda antar versi Studio - dua-duanya didukung.
      if (head.includes('<LadderDiagram')) { s.kind = 'ladder'; s.rungs = parseLadderXml(body); }
      else if (head[0] === '{' && head.includes('"CLs"')) { s.kind = 'ladder'; s.rungs = parseLadderJson(body); }
      else if (head.includes('<StructuredText')) { s.kind = 'st'; s.st = readStText(body); }
    }
    entry.sections.push(s);
  }

  for (const [n, f] of files) {
    const b = await inflate(f);
    if (b.length > 6 && text(b.subarray(0, 8)).startsWith('[SLWD ')) {
      proj.variables.push(...parseVars(text(b)));
    }
  }
  return proj;
}

if (typeof module !== 'undefined') {
  module.exports = { parseTree, parseLadderXml, parseLadderJson, parseVars, pinList,
                     readStText, readProject, KIND_JSON };
}
