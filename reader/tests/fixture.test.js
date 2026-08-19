// Uji terhadap project TIRUAN yang ikut di-commit (tests/fixtures/synthetic.smc2).
//
// Kenapa ada: semua suite lain SKIP kalau sample.smc2 tidak ada, dan project
// sungguhan tidak boleh masuk repo karena isinya program mesin pelanggan.
// Hasilnya suite yang hijau tanpa pernah menjalankan parser sekali pun - bug
// koordinat X/Y di viewer lolos persis lewat celah itu.
//
// Suite ini GAGAL, bukan skip. Fixture-nya ada di repo, jadi tidak ada alasan
// untuk tidak jalan. Bikin ulang fixture-nya:
//   node tests/fixtures/make_fixture.js
//
// Angka di bawah sengaja dipatok tepat - fixture-nya tetap, jadi perubahan
// angka berarti perilaku parser berubah, bukan datanya.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { load } = require('./lib/viewer');

const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'cli.js');
const FIXTURE = path.join(__dirname, 'fixtures', 'synthetic.smc2');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };
const die = m => { console.log('>>BAD ' + m); process.exit(1); };

if (!fs.existsSync(FIXTURE)) {
  die('tests/fixtures/synthetic.smc2 tidak ada - bikin: node tests/fixtures/make_fixture.js');
}

if (typeof DecompressionStream === 'undefined') die('butuh Node 18+ (DecompressionStream)');

const run = (...args) => {
  const r = spawnSync(process.execPath, [CLI, FIXTURE, ...args], { encoding: 'utf8' });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
};

// ------------------------------------------------------------------------ CLI
const sum = run();
chk('CLI jalan tanpa error', sum.status === 0, 'exit ' + sum.status);
chk('pohon project terbaca', /TOTAL\s*:\s*2 program, 4 section, 11 rung/.test(sum.out),
    (sum.out.match(/TOTAL.*/) || [''])[0]);
// Kalau id PouBody ketuker dengan PouBodySourceHolder, yang kebaca file decoy
// berisi CxilVariable - hasilnya 0 rung, dan itu kelihatan seperti project
// kosong, bukan seperti salah alamat. Fixture menaruh decoy itu di 8888/9999.xml.
// \b penting: tanpa itu "10 rung" ikut kena sebagai "0 rung" dan tesnya merah
// karena salah cocok, bukan karena pemetaan id-nya salah.
chk('jebakan PouBodySourceHolder tidak kena', !/\b0 rung/.test(sum.out));
chk('nama section terbaca, bukan GUID',
    /Device_Input/.test(sum.out) && /AutoRunning/.test(sum.out) && /Calc/.test(sum.out) &&
    /Timers/.test(sum.out));
chk('section ST dikenali', /Calc\s+ST \d+ char/.test(sum.out));
chk('tabel variabel terbaca', /VARIABEL\s*:\s*12 \(7 punya alamat IO\)/.test(sum.out),
    (sum.out.match(/VARIABEL.*/) || [''])[0]);

// --- ekspresi boolean ---
const md = path.join(os.tmpdir(), 'ulad-fixture.md');
run('--llm', md);
const dump = fs.readFileSync(md, 'utf8');
fs.unlinkSync(md);

const PY_EXPR = {
  'seri': 'LB100 AND LB101  ->  LB102',
  'cabang paralel': '(LB110 OR LB111) AND LB112  ->  LB113',
};
for (const [k, v] of Object.entries(PY_EXPR)) chk('ekspresi ' + k, dump.includes(v), v);

// Rung langkah gerakan PUNYA cabang bersarang - harus ditandai `~`, bukan
// disajikan seolah presisi penuh.
chk('rung bercabang bersarang ditandai perkiraan', /~ LB200 AND \(/.test(dump),
    (dump.match(/~ LB200[^\n]*/) || [''])[0]);
chk('rung tanpa cabang TIDAK ditandai perkiraan', !/~ LB100/.test(dump));

// Komentar DataContract dipakai bersama: rung ke-2 cuma punya z:Ref. Kalau tidak
// diresolusi, komentarnya kebaca kosong dan tidak ada error apa pun.
chk('komentar z:Ref teresolusi',
    (dump.match(/Master ON confirmation/g) || []).length >= 2,
    (dump.match(/Master ON confirmation/g) || []).length + ' kemunculan');
chk('komentar elemen ikut kebaca', /PB Master ON/.test(dump));
chk('alamat fisik ikut di glosarium', /IOBus:\/\/unit#2\/Input Bit 03/.test(dump));
chk('isi ST ikut diekspor', /W_COUNT := W_COUNT \+ 1;/.test(dump));

// --- flowchart urutan gerakan ---
const mj = path.join(os.tmpdir(), 'ulad-fixture.json');
const fc = run('--flowchart', mj);
const seq = JSON.parse(fs.readFileSync(mj, 'utf8'));
fs.unlinkSync(mj);

chk('langkah gerakan dikenali',
    /2 langkah gerakan terpetakan jadi 1 varian urutan, 1 langkah berhasil dirantai/.test(fc.out),
    (fc.out.match(/\d+ langkah gerakan.*/) || [''])[0]);
chk('mutex ditolak, bukan dipaksakan masuk',
    /dua coil saling mengunci \(mutex\), bukan langkah gerakan/.test(fc.out));

const nodes = (seq['P011_WIP_Transfer/AutoRunning'] || [{}])[0].nodes || [];
const motion = nodes.filter(n => n.type === 'motion');
const byS = s => motion.find(n => n.sol === s);
chk('dua node motion diekspor', motion.length === 2, motion.length + ' motion');
chk('node punya bentuk yang dipahami editor',
    nodes.every(n => n.id && Array.isArray(n.after) &&
                     (n.type === 'condition' ? n.bit : n.type === 'motion' && n.sol && n.join)),
    JSON.stringify(nodes.map(n => n.type)));
// Langkah 2 menunggu langkah 1 lewat bit perantara LB210 - penelusuran mundur
// harus menemukannya, kalau tidak flowchart-nya rapi tapi urutannya bohong.
chk('langkah 2 berantai ke langkah 1 lewat bit perantara',
    byS('SOL_LIFT_UP') && byS('SOL_LIFT_UP').after[0] === byS('SOL_CLAMP_FWD').id,
    byS('SOL_LIFT_UP') ? byS('SOL_LIFT_UP').after[0] : '-');
// Langkah 1 TIDAK berantai. Bit aslinya dibiarkan tampak sebagai node syarat -
// bukan disembunyikan, supaya mata rantai yang tidak tertelusuri kelihatan.
// Project ini tidak punya section Condition, jadi LB200 memang bukan gerbang
// varian - dia tetap dirujuk apa adanya.
chk('langkah 1 tetap menunjuk bit aslinya',
    byS('SOL_CLAMP_FWD') && byS('SOL_CLAMP_FWD').after[0] === 'LB200',
    byS('SOL_CLAMP_FWD') ? byS('SOL_CLAMP_FWD').after[0] : '-');
chk('bit di luar rantai ikut diekspor sebagai node syarat',
    nodes.some(n => n.type === 'condition' && n.bit === 'LB200'));

// ------------------------------------------------------------------ sisi viewer
const M = load(['unzip', 'inflate', 'text', 'pinList', 'parseLadderJson', 'parseVars', 'readStText',
                'elLabel', 'rungExpr', 'findMotionSteps', 'chainSteps',
                'esc', 'LAD', 'ladWrap', 'ladderHtml',
                // VCMT/VADDR/VGLOB satu deklarasi - ambil sekali, kembalikan tiga.
                'VCMT', 'NODE_W', 'ALARM_CAT_LABEL', 'refBase', 'deviceLabel',
                'nodeLabel', 'nodeW', 'nodeCenter', 'sideAnchor', 'graphEnds',
                'layoutVariantNodes', 'splitVariants', 'stepsToVariants', 'graphSvg',
                'findChainCycle', 'coilBand', 'conditionBits', 'variantGates'],
               ['MOTION_SECT', 'VCMT', 'VGLOB']);

// Link cabang = garis KABEL yang vertikal. Rel (class rail) dan batang kontak
// (class sy) juga vertikal, jadi keduanya harus dikecualikan - kalau tidak,
// tes ini lulus untuk alasan yang salah.
const vlines = svg => (svg.match(/<line class="w"[^>]*>/g) || [])
  .filter(l => { const m = l.match(/x1="([\d.]+)"[^>]*x2="([\d.]+)"/); return m && m[1] === m[2]; });

(async () => {
  const buf = fs.readFileSync(FIXTURE);
  const files = await M.unzip(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  chk('ZIP kebaca tanpa library', files.size === 13, files.size + ' entri');

  // Dua section ladder JSON sekarang (AutoRunning 1111, Timers 4444) - dipetakan
  // per nama berkas, bukan "yang terakhir menang".
  const lad = new Map();
  let vars = [];
  for (const [n, f] of files) {
    if (n.endsWith('/')) continue;
    const b = await M.inflate(f);           // entri vars.slwd sengaja STORED, sisanya deflate
    const head = M.text(b.subarray(0, 400)).replace(/^\s+/, '');
    if (head[0] === '{' && head.includes('"CLs"')) lad.set(n.split('/').pop(), M.parseLadderJson(M.text(b)));
    else if (head.startsWith('[SLWD ')) vars = vars.concat(M.parseVars(M.text(b)));
  }
  const json = lad.get('1111.xml'), fbRungs = lad.get('4444.xml');

  chk('ladder JSON terbaca', json && json.length === 7, json ? json.length + ' rung' : 'tidak ada');
  chk('section ladder kedua terbaca', fbRungs && fbRungs.length === 2);
  chk('tabel variabel terbaca', vars.length === 12, vars.length + ' variabel');
  // Medan EC= (komen per elemen array) itu satu-satunya sumber teks alarm di dalam .smc2.
  // Kalau berhenti terbaca, nb_sync melapor "tidak ada yang bisa disinkronkan" - kalimat yang
  // terbaca seperti project tanpa alarm, bukan seperti pembaca yang rusak.
  const al = vars.find(v => v.name === 'AL');
  chk('komen per elemen array terbaca', !!(al && al.elementComments && al.elementComments[1]),
      al ? JSON.stringify(al.elementComments) : 'AL tidak ada');
  chk('alamat IO ikut kebaca', vars.filter(v => v.address).length === 7);

  // INI penjaga bug-nya. Viewer pernah tidak menyalin X/Y dari CLs, dan akibatnya
  // ladder tidak pernah tergambar sama sekali sementara semua rung ditandai
  // perkiraan - tanpa satu pun error.
  const els = json.flatMap(r => r.elements);
  chk('koordinat X/Y ikut disalin', els.every(e => 'x' in e && 'y' in e),
      els.filter(e => !('x' in e)).length + ' elemen tanpa koordinat');
  chk('link vertikal (VLs) ikut disimpan', json.some(r => r.vlinks && r.vlinks.length));

  // Ekspresi viewer harus SAMA PERSIS dengan ekspresi CLI. Dua implementasi, satu
  // jawaban - kalau berbeda, yang tampilannya bagus yang dipercaya orang.
  const e1 = M.rungExpr(json[0]), e2 = M.rungExpr(json[1]), e3 = M.rungExpr(json[2]);
  chk('viewer: ekspresi seri sama dengan CLI', e1.expr === 'LB100 AND LB101', e1.expr);
  chk('viewer: ekspresi cabang sama dengan CLI', e2.expr === '(LB110 OR LB111) AND LB112', e2.expr);
  chk('viewer: rung sederhana tidak ditandai perkiraan', e1.approx === false && e2.approx === false);
  chk('viewer: cabang bersarang ditandai perkiraan', e3.approx === true);
  chk('viewer: coil ikut terbaca', e1.outs.join() === 'LB102', e1.outs.join());

  // --- gambar ladder ---
  // Ladder digambar dari koordinat yang sama. Kalau kabelnya tidak ikut
  // tergambar, yang tampil cuma simbol mengambang - dan cabang paralel jadi
  // tidak bisa dibedakan dari kontak seri.
  const g1 = M.ladderHtml(json[0]), g2 = M.ladderHtml(json[1]), g3 = M.ladderHtml(json[2]);
  chk('ladder tergambar (SVG, bukan kosong)', /<svg/.test(g1), g1.slice(0, 24));
  chk('rel kiri & kanan ada', (g1.match(/class="rail"/g) || []).length === 2);
  chk('kabel mendatar tersambung antar simbol',
      (g1.match(/<line class="w"/g) || []).length >= 3,
      (g1.match(/<line class="w"/g) || []).length + ' segmen');
  chk('rung seri TIDAK punya link vertikal cabang', vlines(g1).length === 0,
      vlines(g1).length + ' garis vertikal');
  // SATU palang, bukan dua. Studio cuma menyimpan palang PENUTUP cabang (`VLs`); pembukanya
  // rel kiri itu sendiri, karena kedua baris berangkat dari rel. Dulu di sini dua, waktu
  // palangnya masih DITEBAK dari koordinat - sekarang digambar dari VLs, jadi jumlahnya sama
  // dengan yang ada di berkasnya.
  chk('rung paralel PUNYA link vertikal cabang', vlines(g2).length === 1,
      vlines(g2).length + ' garis vertikal');
  // Dan cabangnya harus benar-benar menempel ke rel kiri - kalau mulai di colX(0), ada celah
  // 12px dan cabangnya tergambar menggantung.
  chk('cabang menempel ke rel kiri', /<line class="w" x1="8"/.test(g2),
      (g2.match(/<line class="w" x1="[\d.]+" y1="[\d.]+"/g) || []).slice(0, 3).join(' '));
  chk('kontak NC dibedakan warnanya', /class="sy ncc"/.test(g3));
  // Studio menggambar coil sebagai LINGKARAN penuh, bukan dua busur "( )".
  chk('coil digambar sebagai lingkaran penuh', /<circle class="sy co"/.test(g1));
  chk('rung 2 coil menggambar dua-duanya',
      (g3.match(/<circle class="sy co"/g) || []).length === 2,
      (g3.match(/<circle class="sy co"/g) || []).length + ' lingkaran');
  chk('nama operand ikut tergambar', /LB100/.test(g1) && /LB102/.test(g1));

  // Studio <= 1.56 tidak punya koordinat sama sekali. Dulu ladder-nya TIDAK
  // digambar sama sekali - sekarang digambar seri menurut urutan dokumen.
  const noxy = M.ladderHtml({ elements: [
    { kind: 'Contact', var: 'PB013_003' },
    { kind: 'Contact', var: 'MASTER_READY', nc: true },
    { kind: 'Coil', var: 'MASTER_READY' }] });
  chk('rung tanpa koordinat tetap digambar', /<svg/.test(noxy));
  chk('rung tanpa koordinat digambar lurus', vlines(noxy).length === 0);

  // --- susunan ala Sysmac Studio: nama DI ATAS, komentar hijau DI BAWAH ---
  vars.forEach(v => {
    if (v.comment) M.VCMT.set(v.name, v.comment);
    if ((v.group || '').indexOf('GLOBAL') >= 0) M.VGLOB.add(v.name);
  });
  const gy = s => {                       // y tiap teks per kelas
    const out = {};
    (s.match(/<text class="([^"]+)"[^>]*y="([-\d.]+)"/g) || []).forEach(t => {
      // Kelas pertama saja: operand global kelasnya "nm og", yang biasa "nm ".
      const m = t.match(/class="([^"]+)"[^>]*y="([-\d.]+)"/);
      const k = m[1].trim().split(/\s+/)[0];
      (out[k] = out[k] || []).push(Number(m[2]));
    });
    return out;
  };
  const mot = M.ladderHtml(json[2]);      // rung langkah gerakan: nama + komentar lengkap
  chk('komentar operand tergambar hijau di ladder', /class="cmt"/.test(mot));
  chk('operand global diwarnai beda', /class="nm og"/.test(mot));
  chk('komentar dipatah per KATA, bukan tengah kata',
      !/>[a-z]+-<\/text>/i.test(mot) && /Solenoid/.test(mot));

  // Urutan vertikal diperiksa dalam SATU baris. Kalau dibandingkan lintas baris,
  // nama di baris 2 memang lebih rendah dari komentar di baris 1 - dan tesnya
  // gagal karena salah membandingkan, bukan karena tata letaknya salah.
  const oneRow = M.ladderHtml({ elements: [
    { kind: 'Contact', var: 'SOL_CLAMP_FWD', x: 0, y: 0 },
    { kind: 'Contact', var: 'LSC_CLAMP_FWD', x: 1, y: 0 },
    { kind: 'Coil', var: 'SOL_LIFT_UP', x: 2, y: 0 } ] });
  const ty = gy(oneRow);
  const symY = Number((oneRow.match(/class="sy"[^>]*y1="([-\d.]+)"/) || [0, 0])[1]) + 11;
  chk('nama operand DI ATAS simbol', Math.max(...ty['nm']) < symY,
      'nama y=' + ty['nm'].join() + '  simbol y=' + symY);
  chk('komentar DI BAWAH simbol', Math.min(...ty['cmt']) > symY,
      'komen y=' + ty['cmt'].join() + '  simbol y=' + symY);
  chk('tiap operand berkomentar dapat nama DAN komentar',
      ty['nm'].length === 3 && ty['cmt'].length >= 3,
      ty['nm'].length + ' nama, ' + ty['cmt'].length + ' baris komen');

  // --- kotak fungsi: pin diparse dari bentuk Sysmac ASLI ---
  // Bentuk In/Out {__type PF|PRM, Arg, Var, Type} diambil dari project sungguhan
  // lewat `--probe-fb`, bukan dikarang. Fixture memakai bentuk yang sama persis.
  const ton = fbRungs[0].elements.find(e => e.kind === 'Function');
  chk('pin fungsi ikut diparse', !!(ton && ton.pins), ton ? JSON.stringify(ton.pins) : 'tidak ada');
  chk('pin aliran daya (EN/ENO) ditandai flow',
      ton.pins.in[0].name === 'EN' && ton.pins.in[0].flow === true &&
      ton.pins.out[0].name === 'ENO' && ton.pins.out[0].flow === true);
  chk('pin parameter bawa operand',
      ton.pins.in[1].name === 'PT' && ton.pins.in[1].operand === 't#30s' &&
      ton.pins.in[1].flow === false,
      JSON.stringify(ton.pins.in[1]));
  chk('komentar blok (EC) ikut terbaca', ton.comment === 'Power on delay', ton.comment);

  const fb = M.ladderHtml(fbRungs[0]);
  chk('kotak fungsi punya kepala bernama', /class="fn"[^>]*>TON</.test(fb));
  chk('garis pemisah kepala digambar', /class="fbsep"/.test(fb));
  chk('pin masukan & keluaran tergambar',
      /class="pin"[^>]*>EN</.test(fb) && /class="pin r"[^>]*>ENO</.test(fb) &&
      /class="pin"[^>]*>PT</.test(fb) && /class="pin r"[^>]*>ET</.test(fb));
  chk('operand nempel di pin-nya', /class="opd r"[^>]*>t#30s</.test(fb) &&
      /class="opd"[^>]*>W_ELAPSED</.test(fb));
  // Tanpa data pin, kotaknya TETAP digambar - tapi kosong. Menggambar pin yang
  // ditebak lebih berbahaya daripada kotak polos: kelihatan seperti fakta.
  const fb0 = M.ladderHtml({ elements: [
    { kind: 'Contact', var: 'GSB000', x: 0, y: 0 },
    { kind: 'Function', func: 'ResetPLCError', x: 1, y: 0 } ] });
  chk('kotak fungsi tanpa data pin tetap digambar, tanpa pin karangan',
      /class="fn"[^>]*>ResetPLCError</.test(fb0) && !/class="pin/.test(fb0));

  // --- Structured Text: nama pembungkusnya beda antar versi Studio ---
  // Kalau cuma satu nama yang dicocokkan, badan program terbaca KOSONG tanpa
  // error apa pun - di ringkasan cuma tertulis "ST 0 char", dan itu tampak
  // seperti section yang memang kosong. Satu project sungguhan kehilangan 942
  // karakter persis lewat celah ini.
  const stBody = 'IF X THEN\n  Y := 1;\nEND_IF;';
  const wrap = tag => '<?xml version="1.0" encoding="utf-8"?>\n<' + tag +
    ' xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><Text>' + stBody +
    '</Text></' + tag + '>';
  chk('ST terbaca dari <StructuredText>', M.readStText(wrap('StructuredText')) === stBody,
      JSON.stringify(M.readStText(wrap('StructuredText'))));
  chk('ST terbaca dari <StructuredTextModel>',
      M.readStText(wrap('StructuredTextModel')) === stBody,
      JSON.stringify(M.readStText(wrap('StructuredTextModel'))));
  // Blok deklarasi variabel juga punya <Text>. Kalau diambil yang pertama di mana
  // pun, isinya jadi daftar variabel, bukan programnya.
  const withDecl = '<StructuredTextModel><Declarations><Text>arrData : ARRAY[1..9] OF INT;' +
                   '</Text></Declarations><Text>' + stBody + '</Text></StructuredTextModel>';
  chk('deklarasi variabel tidak tertukar dengan badan program',
      M.readStText(withDecl) === stBody, JSON.stringify(M.readStText(withDecl)).slice(0, 60));

  // Nama panjang dipatah, bukan dipotong diam-diam.
  chk('nama panjang dipatah di pemisahnya',
      M.ladWrap('PLC_ERR_STA.PLC_ERR_BOOL[7]', 20).length === 2,
      M.ladWrap('PLC_ERR_STA.PLC_ERR_BOOL[7]', 20).join(' | '));
  chk('nama pendek tidak dipatah', M.ladWrap('LB100', 20).length === 1);

  // Pengenalan langkah gerakan harus menghasilkan angka yang sama dengan CLI.
  const sec = { name: 'AutoRunning', rungs: json };
  const { steps } = M.findMotionSteps(sec);
  chk('viewer menemukan langkah sebanyak CLI', steps.length === 2, steps.length + ' langkah');
  chk('viewer merantai sebanyak CLI',
      M.chainSteps(sec, steps).filter(x => 'afterIdx' in x).length === 1);

  // --- mesin flowchart (port dari generator Susmax) ---
  // Bentuk node HARUS sama dengan yang ditulis `--flowchart`, kalau tidak gambar
  // di viewer dan JSON yang diimpor editor menceritakan urutan yang berbeda.
  vars.forEach(v => M.VCMT.set(v.name, v.comment));
  const chain = M.chainSteps(sec, steps);
  const vs = M.stepsToVariants(chain, 'AutoRunning');
  chk('satu varian untuk fixture ini', vs.length === 1, vs.length + ' varian');
  const v = vs[0].variant;

  // Varian dipisah per AKAR rantai: dua urutan yang berangkat dari bit syarat
  // berbeda tidak boleh digabung - kalau digabung, dua urutan yang tidak pernah
  // jalan bersamaan terbaca seperti satu alur panjang.
  const twoGates = M.splitVariants([
    { sol: 'A', afterBit: 'LB300' },
    { sol: 'B', afterIdx: 0 },
    { sol: 'C', afterBit: 'LB301' },
    { sol: 'D', afterIdx: 2 } ]);
  chk('dua bit syarat -> dua varian', twoGates.size === 2,
      [...twoGates.keys()].join(' | '));
  chk('langkah ikut akar rantainya, bukan urutan array',
      twoGates.get('LB300').map(s => s.sol).join('') === 'AB' &&
      twoGates.get('LB301').map(s => s.sol).join('') === 'CD',
      [...twoGates.values()].map(g => g.map(s => s.sol).join('')).join(' / '));
  // Nomor node dihitung ulang per varian - "n1" di varian lain bukan node yang sama.
  const vs2 = M.stepsToVariants([
    { sol: 'A', afterBit: 'LB300', comment: '' },
    { sol: 'B', afterIdx: 0, comment: '' },
    { sol: 'C', afterBit: 'LB301', comment: '' },
    { sol: 'D', afterIdx: 2, comment: '' } ], 'X');
  chk('tiap varian menomori node dari n1',
      vs2.every(x => x.variant.nodes.some(n => n.id === 'n1')));
  chk('rujukan antar node tetap di dalam variannya',
      vs2[1].variant.nodes.find(n => n.sol === 'D').after[0] === 'n1',
      vs2[1].variant.nodes.find(n => n.sol === 'D').after.join());
  chk('syarat varian ikut tercatat',
      vs2.map(x => x.variant.condition).join() === 'LB300,LB301',
      vs2.map(x => x.variant.condition).join());

  // Urutan gerak mesin SUNGGUHAN itu MELINGKAR: langkah terakhir memicu langkah
  // pertama lagi. Pemisahan varian harus tahan itu. Versi lama menelusuri mundur
  // "sampai akar" - di graf melingkar tidak ada akar, penelusurannya berhenti di
  // tempat berbeda tergantung mulai dari mana, dan langkah dari lingkaran yang
  // sama jatuh ke varian berbeda. Akibatnya `after` menunjuk node di varian lain.
  const loop = [
    { sol: 'A', afterBit: 'LB400', comment: '' },
    { sol: 'B', afterIdx: 0, comment: '' },
    { sol: 'C', afterIdx: 1, comment: '' },
    { sol: 'D', afterIdx: 2, comment: '' },
  ];
  loop[0] = { sol: 'A', afterIdx: 3, comment: '' };     // D -> A: lingkarannya menutup
  const vloop = M.stepsToVariants(loop, 'Loop');
  chk('urutan melingkar tetap SATU varian', vloop.length === 1, vloop.length + ' varian');
  const ids = new Set(vloop[0].variant.nodes.map(n => n.id));
  const refs = vloop[0].variant.nodes.flatMap(n => n.after).filter(a => /^n\d+$/.test(a));
  chk('tidak ada rujukan yang menunjuk keluar varian',
      refs.every(a => ids.has(a)), refs.join(','));
  chk('tidak ada rujukan "nundefined"',
      !JSON.stringify(vloop).includes('nundefined'));
  chk('semua langkah lingkaran ikut terbawa',
      vloop[0].steps.length === 4, vloop[0].steps.length + ' langkah');

  // --- pemisahan varian lewat bit syarat (bukan lewat urutan nomor LB) ---
  // Satu section AutoRunning bisa memuat beberapa urutan yang dipilih rung mutex:
  // LB401 nyala kalau LB300 nyala, LB402 dari LB301, dst. Jadi "varian mana"
  // dijawab dengan mencari SIAPA yang menyalakan bit awal langkah itu.
  const mutex = { comment: 'mutex', elements: [
    { kind: 'Contact', var: 'LB400', x: 0, y: 0 },
    { kind: 'Contact', var: 'LB300', x: 1, y: 0 },
    { kind: 'Contact', var: 'LB401', x: 1, y: 1 },
    { kind: 'Contact', var: 'LB402', nc: true, x: 2, y: 0 },
    { kind: 'Coil', var: 'LB401', x: 3, y: 0 },
    { kind: 'Contact', var: 'LB301', x: 1, y: 2 },
    { kind: 'Contact', var: 'LB402', x: 1, y: 3 },
    { kind: 'Contact', var: 'LB401', nc: true, x: 2, y: 2 },
    { kind: 'Coil', var: 'LB402', x: 3, y: 2 } ] };
  const condSec = { name: 'Condition', rungs: [
    { comment: '', elements: [{ kind: 'Contact', var: 'LB3113' }, { kind: 'Coil', var: 'LB300', x: 1 }] },
    { comment: '', elements: [{ kind: 'Contact', var: 'LB3114' }, { kind: 'Coil', var: 'LB301', x: 1 }] },
    // Gerbang gabungan: digerbang bit syarat LAIN, jadi BUKAN pemilih varian.
    { comment: '', elements: [{ kind: 'Contact', var: 'LB300' },
                              { kind: 'Contact', var: 'LB301', y: 1 },
                              { kind: 'Coil', var: 'LB309', x: 1 }] } ] };
  const prog = { name: 'P', sections: [condSec, { name: 'AutoRunning', rungs: [mutex] }] };

  chk('bit syarat diambil dari section Condition',
      [...M.conditionBits(prog)].sort().join() === 'LB300,LB301',
      [...M.conditionBits(prog)].sort().join());
  chk('gerbang gabungan (LB309) tidak dianggap bit syarat',
      !M.conditionBits(prog).has('LB309'));

  // Tanpa pemisahan per coil, seluruh kontak rung terbaca sebagai umpan SETIAP
  // coil - LB401 lalu kelihatan digerbang LB300 sekaligus LB301.
  const coil401 = mutex.elements.find(e => e.kind === 'Coil' && e.var === 'LB401');
  chk('umpan coil dipisah per baris coil-nya',
      M.coilBand(mutex, coil401).map(c => c.var).join() === 'LB400,LB300,LB401,LB402',
      M.coilBand(mutex, coil401).map(c => c.var).join());

  const vg = M.variantGates(prog).gates;
  chk('gerbang varian ketemu syaratnya', vg.get('LB401') === 'LB300' && vg.get('LB402') === 'LB301',
      'LB401<-' + vg.get('LB401') + '  LB402<-' + vg.get('LB402'));

  // Penelusuran WAJIB berhenti di bit gerbang. Diteruskan, dia menyusup ke
  // plumbing global dan mendarat di langkah acak - semua langkah lalu terlihat
  // berantai, dan seluruh section jadi satu urutan panjang tanpa varian.
  const gated = M.chainSteps({ rungs: [] },
    [{ rung: 1, prev: 'LB401', sol: 'A', confirm: 'LB411', comment: '[V1] Motion 1' },
     { rung: 2, prev: 'LB411', sol: 'B', confirm: 'LB413', comment: '[V1] Motion 2' },
     { rung: 3, prev: 'LB402', sol: 'C', confirm: 'LB415', comment: '[V2] Motion 3' }], vg);
  chk('penelusuran berhenti di gerbang varian',
      gated[0].afterBit === 'LB401' && gated[2].afterBit === 'LB402',
      JSON.stringify(gated.map(x => x.afterBit || 'n' + (x.afterIdx + 1))));

  const vlist = M.stepsToVariants(gated, 'AutoRunning', vg);
  chk('dua gerbang -> dua varian', vlist.length === 2, vlist.length + ' varian');
  chk('varian memakai bit SYARAT, bukan bit gerbang',
      vlist.map(v => v.variant.condition).join() === 'LB300,LB301',
      vlist.map(v => v.variant.condition).join());
  chk('nama varian diambil dari komentar rung "[...]"',
      vlist.map(v => v.variant.comment).join() === 'V1,V2',
      vlist.map(v => v.variant.comment).join());
  chk('langkah berantai ikut variannya', vlist[0].steps.length === 2 && vlist[1].steps.length === 1,
      vlist.map(v => v.steps.length).join());

  // Dua rantai paralel yang berangkat dari gerbang yang sama itu SATU varian.
  // Versi lama memakai Map ber-key gerbang tanpa menggabung, jadi rantai kedua
  // menimpa yang pertama dan langkahnya hilang tanpa jejak.
  const par = M.stepsToVariants(M.chainSteps({ rungs: [] },
    [{ rung: 1, prev: 'LB401', sol: 'A', confirm: 'C1', comment: '' },
     { rung: 2, prev: 'LB401', sol: 'B', confirm: 'C2', comment: '' },
     { rung: 3, prev: 'C1', sol: 'C', confirm: 'C3', comment: '' },
     { rung: 4, prev: 'C2', sol: 'D', confirm: 'C4', comment: '' }], vg), 'X', vg);
  chk('rantai paralel se-gerbang digabung jadi satu varian', par.length === 1, par.length + ' varian');
  chk('tidak ada langkah yang hilang waktu digabung',
      par[0].steps.length === 4, par[0].steps.length + ' dari 4');
  chk('urutan langkah tetap menurut rung',
      par[0].steps.map(s => s.sol).join() === 'A,B,C,D', par[0].steps.map(s => s.sol).join());

  // Lingkaran harus DIPATAHKAN, bukan cuma dibiarkan satu varian. Kalau tidak,
  // tidak ada langkah yang jadi awal: graphEnds tidak menemukan root maupun leaf,
  // lalu START ditarik ke SEMUA langkah dan END dari semuanya. Gambarnya jadi
  // jaring laba-laba yang tidak menceritakan urutan apa pun.
  const emptyChain = M.chainSteps({ rungs: [] }, []);
  chk('chainSteps tahan section kosong', Array.isArray(emptyChain) && emptyChain.length === 0);

  // Dibangun manual supaya persis bentuk yang bikin bug: n1(rung 6) menunggu
  // n4(rung 9) - menunggu langkah yang ditulis LEBIH AKHIR = penutup siklus.
  const loopChain = [
    { rung: 6, sol: 'PSH_FWD', afterIdx: 3 },
    { rung: 7, sol: 'EJC_FWD', afterIdx: 0 },
    { rung: 8, sol: 'EJC_BWD', afterIdx: 1 },
    { rung: 9, sol: 'PSH_BWD', afterIdx: 2 },
  ];
  loopChain.forEach(st => { if (loopChain[st.afterIdx].rung > st.rung) st.loop = true; });
  const lv = M.stepsToVariants(loopChain, 'AutoRunning')[0].variant;
  const le = M.graphEnds(lv.nodes);
  chk('lingkaran dipatahkan: ada tepat satu awal', le.roots.length === 1,
      le.roots.map(n => n.sol).join(','));
  chk('awal urutan = langkah ber-rung paling awal', le.roots[0].sol === 'PSH_FWD',
      le.roots[0] && le.roots[0].sol);
  chk('ada tepat satu akhir', le.leaves.length === 1, le.leaves.map(n => n.sol).join(','));
  chk('penutup siklus tetap dicatat, bukan dibuang',
      lv.nodes.some(n => n.loopAfter), JSON.stringify(lv.nodes.map(n => n.loopAfter)));
  chk('penutup siklus digambar putus-putus, beda dari panah urutan',
      /gedge-line loop/.test(M.graphSvg(lv, 'lp')));

  // Langkah yang penelusurannya berujung ke DIRINYA SENDIRI juga lingkaran -
  // rung-nya tidak "lebih akhir", jadi aturan rung saja tidak menangkapnya.
  const self = [{ rung: 3, sol: 'A', afterIdx: 0 }, { rung: 4, sol: 'B', afterIdx: 0 }];
  chk('lingkaran diri-sendiri terdeteksi', !!M.findChainCycle(self),
      JSON.stringify(M.findChainCycle(self)));

  chk('node motion sebanyak langkah', v.nodes.filter(n => n.type === 'motion').length === 2);
  // Bit di luar rantai TIDAK disembunyikan - dia jadi node syarat yang kelihatan.
  chk('bit di luar rantai jadi node condition',
      v.nodes.some(n => n.type === 'condition' && n.bit === 'LB200'),
      v.nodes.map(n => n.id + ':' + n.type).join(' '));
  chk('posisi node sama dengan grid CLI (20/195/370, y=75)',
      v.nodes.map(n => n.x + ',' + n.y).join(' ') === '20,75 195,75 370,75',
      v.nodes.map(n => n.x + ',' + n.y).join(' '));

  const ends = M.graphEnds(v.nodes);
  chk('node condition tidak ikut jadi root/leaf',
      !ends.roots.some(n => n.type === 'condition') && !ends.leaves.some(n => n.type === 'condition'));

  // refBase WAJIB: rujukan cabang "d1#Y" yang tidak dikupas port-nya bikin node yang
  // SUDAH menunggu judgement terbaca sebagai root, lalu ikut ditarik START. Gambarnya
  // jadi bilang "jalan barengan" padahal ladder-nya menunggu.
  chk('refBase mengupas port cabang', M.refBase('d1#Y') === 'd1' && M.refBase('LB300') === 'LB300');
  const br = [{ id: 'n1', type: 'motion', sol: 'S', after: [], join: 'AND', x: 0, y: 0 },
              { id: 'd1', type: 'decision', cond: 'X', after: ['n1'], join: 'AND', x: 0, y: 0 },
              { id: 'a1', type: 'alarm', category: 'warning', after: ['d1#N'], join: 'AND', x: 0, y: 0 }];
  chk('node yang menunggu cabang BUKAN root', M.graphEnds(br).roots.map(n => n.id).join() === 'n1',
      M.graphEnds(br).roots.map(n => n.id).join());

  // Label pakai komentar IO, bukan nama simbol - itu yang bikin kotaknya kebaca.
  chk('label motion pakai komentar IO',
      M.nodeLabel({ type: 'motion', sol: 'SOL_CLAMP_FWD' }) === 'Solenoid clamp forward',
      M.nodeLabel({ type: 'motion', sol: 'SOL_CLAMP_FWD' }));
  chk('simbol tanpa komentar tetap tampil apa adanya',
      M.deviceLabel('SOL_TIDAK_ADA') === 'SOL_TIDAK_ADA');
  chk('label alarm bawa kategori + komen',
      M.nodeLabel({ type: 'alarm', category: 'warning', comment: 'NG' }) === 'ALARM Warning - NG');
  chk('label tanpa komen tidak menyisakan " - "',
      M.nodeLabel({ type: 'decision', cond: 'LB9' }) === '? LB9');
  chk('node melebar ikut label, tidak dipotong',
      M.nodeW({ type: 'motion', sol: 'SANGAT_PANJANG_SEKALI_NAMANYA_INI' }) > M.NODE_W);

  // Kabel nempel ke SISI node yang searah, bukan selalu kanan->kiri.
  const nb = { type: 'motion', sol: 'S', x: 100, y: 100 };
  chk('anchor ke kanan', M.sideAnchor(nb, 900, 116).x === 100 + M.nodeW(nb));
  chk('anchor ke bawah', M.sideAnchor(nb, 155, 900).y === 132);

  const gv = M.graphSvg(v, 'uji');
  chk('graph tergambar sebagai SVG', /<svg class="graph-canvas"/.test(gv));
  chk('START & END digambar', (gv.match(/gnode-rect anchor/g) || []).length === 2);
  chk('panah pakai marker', /marker-end="url\(#ar-uji\)"/.test(gv));
  chk('node condition dibedakan kelasnya', /class="gnode-rect condition"/.test(gv));
  chk('badge AND cuma muncul kalau dependency 2+', !/gjoin-badge/.test(gv));
  const gj = M.graphSvg({ nodes: M.layoutVariantNodes([
    { id: 'a', type: 'motion', sol: 'S1', after: [], join: 'AND' },
    { id: 'b', type: 'motion', sol: 'S2', after: [], join: 'AND' },
    { id: 'c', type: 'motion', sol: 'S3', after: ['a', 'b'], join: 'OR' }]) }, 'uji2');
  chk('dependency 2+ dapat badge, isinya ikut join', /gjoin-badge/.test(gj) && />OR</.test(gj));

  console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('>>BAD error: ' + e.message); process.exit(1); });
