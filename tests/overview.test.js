// Ringkasan hasil generate (panel "Hasil generate" di atas daftar berkas).
//
// Kenapa perlu dijaga: angka yang SALAH lebih buruk daripada tidak ada angka sama sekali.
// Panel ini dibaca buat memutuskan "generate-nya benar atau tidak" tanpa membuka XML; kalau
// hitungannya meleset, keputusan itu diambil dari angka karangan dan tidak ada yang tahu.
//
// Jadi angkanya diadu ke XML yang BENAR-BENAR dihasilkan pipeline (lewat scripts/core.js),
// bukan ke contoh yang ditulis di tes ini - contoh buatan tetap cocok walaupun bentuk XML-nya
// berubah, dan justru perubahan bentuk itu yang bikin regexnya berhenti mencocokkan.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const html = fs.existsSync(path.join(root, 'index.html'))
  ? fs.readFileSync(path.join(root, 'index.html'), 'utf8') : '';

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

chk('index.html ada (build dulu kalau gagal)', !!html);
if (!html) { console.log('\n1 GAGAL'); process.exit(1); }

// Diambil dari index.html hasil build, bukan dari js/ - yang dipakai browser itu yang di
// index.html, dan salinan yang basi di situ persis kelas kegagalan yang paling menipu di repo ini.
function extract(name) {
  const sig = 'function ' + name + '(';
  let from = 0;
  for (;;) {
    const i = html.indexOf(sig, from);
    if (i < 0) throw new Error('gak ketemu (versi UI): ' + name);
    let d = 0, started = false, body = null;
    for (let j = html.indexOf('{', i); j < html.length; j++) {
      if (html[j] === '{') { d++; started = true; }
      else if (html[j] === '}') { d--; if (started && d === 0) { body = html.slice(i, j + 1); break; } }
    }
    // index.html juga memuat gen_all.js sebagai string JSON - versi yang tanda kutipnya
    // ter-escape itu bukan kode yang jalan, jadi dilewati.
    if (body && body.indexOf('\\"') < 0) return body;
    from = i + sig.length;
  }
}

const programOverview = new Function(extract('programOverview') + '; return programOverview;')();

// ---------------------------------------------------- XML dari pipeline yang sungguhan
const proj = path.join(root, 'outputs', 'sample-project.json');
if (!fs.existsSync(proj)) {
  console.log('  SKIP  outputs/sample-project.json tidak ada - tidak ada XML acuan buat diadu.');
  process.exit(0);
}
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'susmax-ov-'));
const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'core.js'), proj, out],
                    { encoding: 'utf8' });
chk('generate acuan jalan', r.status === 0, (r.stderr || '').trim().slice(0, 120));

const all = path.join(out, 'AllPrograms.xml');
chk('AllPrograms.xml ditulis', fs.existsSync(all));
if (!fs.existsSync(all)) { console.log('\n' + (fail + 1) + ' GAGAL'); process.exit(1); }
const xml = fs.readFileSync(all, 'utf8');

const ov = programOverview(xml);
chk('tiap program di XML ada di ringkasan',
    ov.length === (xml.match(/<Program\b/g) || []).length, ov.length + ' program');

// Jumlah rung total HARUS sama persis dengan yang ada di berkas. Kalau sebuah rung jatuh di
// luar batas program mana pun (mis. pemotongan blok salah), totalnya jadi lebih kecil dan
// itu tidak kelihatan dari mana pun kecuali diadu begini.
const rungTotal = (xml.match(/<Rung\b/g) || []).length;
const ovTotal = ov.reduce((a, p) => a + p.rungs, 0);
chk('jumlah rung total cocok dengan XML', ovTotal === rungTotal, ovTotal + ' vs ' + rungTotal);

const sectTotal = (xml.match(/<BodyContent\b/g) || []).length;
const ovSect = ov.reduce((a, p) => a + p.sections.length, 0);
chk('jumlah section cocok dengan XML', ovSect === sectTotal, ovSect + ' vs ' + sectTotal);

chk('nama program terbaca utuh', ov.every(p => p.name && !/[<>"]/.test(p.name)),
    ov.map(p => p.name).join(' ').slice(0, 90));
chk('program MAIN ketemu dan berisi', ov.some(p => /MAIN/.test(p.name) && p.rungs > 10),
    ov.map(p => p.name + ':' + p.rungs).join(' '));
chk('section punya nama, bukan kosong', ov[0].sections.every(s => s.name.length > 1),
    JSON.stringify(ov[0].sections.slice(0, 3)));

// Rung yang dihitung per section harus menjumlah jadi rung program - kalau tidak, ada rung
// yang jatuh sebelum section pertama dan penomoran chip-nya bergeser diam-diam.
chk('rung per section menjumlah jadi rung program',
    ov.every(p => p.sections.reduce((a, s) => a + s.rungs, 0) === p.rungs));

// Berkas tanpa program sama sekali tidak boleh bikin panelnya meledak - GlobalVariables.tsv
// dan berkas non-XML lain ikut lewat sini.
chk('XML tanpa Program menghasilkan daftar kosong, bukan galat',
    programOverview('<x/>').length === 0);

try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) {}
console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
