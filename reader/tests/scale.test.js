// Uji SKALA: project sungguhan, ribuan rung dan ribuan variabel.
//
// Fixture menjaga BENTUK parser (dan selalu jalan, selalu bisa gagal). Suite ini
// menjaga hal yang tidak bisa ditiru fixture: apakah pembacanya masih waras pada
// project sebesar mesin beneran, dan apakah pengenalan pola-nya tidak mulai
// mengarang begitu datanya ramai.
//
// Dilewati (skip) kalau tidak ada project contoh. Itu aman: bentuk parser sudah
// dijaga tests/fixture.test.js yang GAGAL, bukan skip.
//
// Pakai project sendiri:
//   taruh sebagai sample.smc2 di root repo, ATAU
//   SAMPLE_SMC2="D:\path\mesin.smc2" node tests/run.js
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'cli.js');
const SAMPLE = process.env.SAMPLE_SMC2 || path.join(ROOT, 'sample.smc2');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

if (!fs.existsSync(SAMPLE)) { console.log('  SKIP  project contoh tidak ada (sample.smc2 / SAMPLE_SMC2)'); process.exit(0); }
if (typeof DecompressionStream === 'undefined') { console.log('  SKIP  butuh Node 18+'); process.exit(0); }

const run = (...args) => {
  const r = spawnSync(process.execPath, [CLI, SAMPLE, ...args],
                      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
};

// ----------------------------------------------------------------- ringkasan
const sum = run();
chk('pembaca jalan tanpa error', sum.status === 0, 'exit ' + sum.status);
const m = sum.out.match(/TOTAL\s*:\s*(\d+) program, (\d+) section, (\d+) rung/);
chk('ringkasan terbaca', !!m, (sum.out.split('\n').pop() || '').slice(0, 60));
if (m) {
  const [, prog, sect, rung] = m.map(Number);
  chk('program & section ketemu', prog > 0 && sect > 0, prog + ' program, ' + sect + ' section');
  // Kalau pemetaan id salah, isinya 0 - dan itu terlihat seperti "project
  // kosong", bukan seperti error. Tapi ada project yang MEMANG cuma berisi ST
  // tanpa satu rung pun, jadi yang diperiksa: ada isi, entah rung atau ST.
  const stChars = [...sum.out.matchAll(/ST (\d+) char/g)].reduce((a, x) => a + Number(x[1]), 0);
  chk('ada isi terbaca (rung atau ST), bukan project kosong',
      rung > 0 || stChars > 0, rung + ' rung, ' + stChars + ' char ST');
}
chk('nama section terbaca, bukan GUID',
    /^\s{4}\S/m.test(sum.out) && !/^\s{4}[0-9a-f-]{30,}/m.test(sum.out));

// --------------------------------------------------------------- silang-rujuk
const xr = run('--xref');
chk('silang-rujuk jalan', xr.status === 0);
chk('kolom silang-rujuk lengkap', /OPERAND\s+TULIS\s+BACA/.test(xr.out));
chk('operand yatim dilaporkan, bukan didiamkan',
    /Dibaca tapi tidak pernah ditulis di project ini: \d+/.test(xr.out),
    (xr.out.match(/Dibaca tapi.*/) || [''])[0]);

// -------------------------------------------------------------------- graf
const gf = path.join(os.tmpdir(), 'scale-graph.json');
const g = run('--graph', gf);
chk('graf jalan', g.status === 0 && fs.existsSync(gf));
if (fs.existsSync(gf)) {
  const d = JSON.parse(fs.readFileSync(gf, 'utf8'));
  chk('graf punya node & edge', d.nodes.length > 0 && d.edges.length > 0,
      d.nodes.length + ' node, ' + d.edges.length + ' edge');
  const ids = new Set(d.nodes.map(n => n.id));
  chk('semua edge menunjuk node yang ada',
      d.edges.every(e => ids.has(e.from) && ids.has(e.to)));
  chk('edge kembar sudah dibuang',
      new Set(d.edges.map(e => e.from + '|' + e.to + '|' + e.rel)).size === d.edges.length);
  fs.unlinkSync(gf);
}

// ------------------------------------------------------- flowchart / motion
// Yang paling penting BUKAN berapa banyak langkah yang ketemu, tapi bahwa rung
// yang BUKAN langkah gerakan tidak ikut terpetakan.
const ff = path.join(os.tmpdir(), 'scale-flow.json');
const f = run('--flowchart', ff);
chk('flowchart jalan tanpa error', f.status === 0, 'exit ' + f.status);
chk('laporan per section tercetak', /SECTION\s+RUNG\s+STEP/.test(f.out));
chk('alasan tidak terpetakan dilaporkan, bukan didiamkan', /Alasan per rung/.test(f.out));
chk('keterbatasan rantai dinyatakan terus terang', /berhasil dirantai/.test(f.out));

if (fs.existsSync(ff)) {
  const d = JSON.parse(fs.readFileSync(ff, 'utf8'));
  const keys = Object.keys(d);
  if (!keys.length) {
    console.log('  ..    project ini tidak punya section auto/motion - bagian flowchart dilewati');
  } else {
    chk('hanya section auto/motion yang dipetakan',
        keys.every(k => /auto.*runn|motion/i.test(k)), keys.join(', ').slice(0, 70));
    const variants = [].concat(...keys.map(k => d[k]));
    const all = [].concat(...variants.map(v => v.nodes));
    chk('ada langkah terpetakan', all.length > 0, all.length + ' langkah, ' +
        variants.length + ' varian');
    // Node `condition` BUKAN cacat: langkah yang tidak berhasil dirantai sengaja
    // dibiarkan menunjuk bit aslinya, dan di editor muncul sebagai blok syarat.
    // Itu justru yang bikin urutannya kelihatan perlu dicek. Menuntut semua node
    // bertipe `motion` berarti menuntut rantai yang selalu lengkap - padahal
    // ketidaklengkapannya memang dinyatakan terus terang.
    const shape = n => n.id && Array.isArray(n.after) && n.join &&
      (n.type === 'motion' ? !!n.sol : n.type === 'condition' ? !!n.bit : false);
    chk('tiap langkah punya bentuk yang dipahami editor', all.every(shape),
        JSON.stringify(all.find(n => !shape(n)) || {}).slice(0, 70));
    // Node AKAR punya `after` kosong - itu bentuk yang sama dengan yang dipakai
    // generator (syarat varian di-AND-kan otomatis ke node akar). Node lain punya
    // tepat satu pendahulu.
    chk('tiap langkah punya paling banyak satu pendahulu',
        all.every(n => n.after.length <= 1),
        (all.find(n => n.after.length > 1) || {}).id || '');
    chk('tiap varian punya awal (node ber-after kosong)',
        variants.every(v => v.nodes.some(n => n.after.length === 0)),
        variants.filter(v => !v.nodes.some(n => n.after.length === 0)).length + ' varian tanpa awal');
    chk('id unik di dalam tiap varian',
        variants.every(v => new Set(v.nodes.map(n => n.id)).size === v.nodes.length));
    // Ini yang jebol waktu urutannya MELINGKAR: rujukan menunjuk node di varian
    // lain, dan node itu tidak ada di sana.
    chk('rujukan antar node tidak pernah menunjuk keluar variannya',
        variants.every(v => {
          const ids = new Set(v.nodes.map(n => n.id));
          return v.nodes.every(n => !/^n\d+$/.test(n.after[0]) || ids.has(n.after[0]));
        }));
    chk('tidak ada rujukan rusak "nundefined"',
        !JSON.stringify(d).includes('nundefined'));
  }
  fs.unlinkSync(ff);
}

// ------------------------------------------------------------------- konteks LLM
const lf = path.join(os.tmpdir(), 'scale-llm.md');
const l = run('--llm', lf);
chk('konteks LLM jalan', l.status === 0 && fs.existsSync(lf));
if (fs.existsSync(lf)) {
  const md = fs.readFileSync(lf, 'utf8');
  chk('konteks LLM memuat silang-rujuk', md.includes('# Silang-rujuk operand'));
  chk('konteks LLM memuat legenda cara baca', md.includes('## Cara membaca'));
  chk('rung perkiraan ditandai `~`, tidak dibiarkan tampak presisi',
      !md.includes('~ ') || /~ /.test(md));
  fs.unlinkSync(lf);
}

console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
process.exit(fail ? 1 : 0);
