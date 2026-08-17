// Rakit smc2-viewer.html dari viewer/shell.html + src/*.js + viewer/ui.js.
//
//   node build.js
//
// JANGAN mengedit smc2-viewer.html langsung - itu hasil build, dan suntingannya
// hilang begitu build berikutnya jalan. Edit src/*.js atau viewer/*.
//
// Kenapa ada tahap build sama sekali: viewer harus tetap SATU berkas yang bisa
// dibuka dari file:// tanpa server. Modul ES tidak bisa dipakai di file://
// (diblok CORS), jadi berkasnya digabung jadi satu <script>.
//
// Berkas src/*.js sengaja ditulis supaya jalan di DUA tempat:
//   * di Node lewat `require` biasa
//   * di browser sebagai satu <script> gabungan
// Blok `require` dan `module.exports` di tiap berkas DIBUANG waktu digabung -
// kalau tidak, `var { esc } = require(...)` bentrok dengan `const esc` milik
// env.js dan seluruh halaman mati dengan "Identifier 'esc' has already been
// declared".
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
// Urutan penting: yang dipakai duluan harus dideklarasikan duluan.
const ORDER = ['env.js', 'xml.js', 'zip.js', 'symbols.js', 'smc2.js',
               'ladder.js', 'motion.js', 'graph.js', 'net.js', 'xmlout.js',
               'reports.js'];

// Pembangun XML milik GENERATOR, dipinjam apa adanya supaya viewer bisa
// mengekspor XML yang PERSIS sama dengan yang ditulis cli.js dan generator.
// Dibungkus IIFE, bukan ditempel polos: lib.js punya `function esc` sendiri dan
// src/env.js punya `const esc` - dua-duanya di lingkup yang sama bikin seluruh
// halaman mati dengan "Identifier 'esc' has already been declared", persis
// jebakan yang sama yang bikin blok require/module.exports harus dibuang.
const LIB = path.join(ROOT, '..', 'js', 'lib.js');

function libSource() {
  if (!fs.existsSync(LIB)) {
    throw new Error('js/lib.js tidak ketemu di ' + LIB + ' - viewer memakai pembangun ' +
                    'XML milik generator, bukan salinannya.');
  }
  return '// ' + '-'.repeat(60) + ' js/lib.js (generator)\n' +
         'const SGLIB = (function () {\n' +
         fs.readFileSync(LIB, 'utf8').trim() + '\n' +
         'return { Rung: Rung, sect: sect, prog: prog, vr: vr, esc: esc };\n})();';
}

/** Buang blok `if (typeof X !== 'undefined') { ... }` di tingkat atas. */
function stripGuard(src, what) {
  const sig = "if (typeof " + what + " !== 'undefined')";
  for (;;) {
    const i = src.indexOf(sig);
    if (i < 0) return src;
    let d = 0, j = src.indexOf('{', i);
    if (j < 0) return src;
    for (; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}' && --d === 0) { j++; break; }
    }
    src = src.slice(0, i) + src.slice(j);
  }
}

function moduleSource(f) {
  let s = fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
  s = stripGuard(s, 'require');
  s = stripGuard(s, 'module');
  return '// ' + '-'.repeat(66) + ' src/' + f + '\n' + s.replace(/\n{3,}/g, '\n\n').trim();
}

const shell = fs.readFileSync(path.join(ROOT, 'viewer', 'shell.html'), 'utf8');
const ui = fs.readFileSync(path.join(ROOT, 'viewer', 'ui.js'), 'utf8').trim();
const src = [libSource()].concat(ORDER.map(moduleSource)).join('\n\n');

let out = shell.replace('/*__SRC__*/', () => "'use strict';\n\n" + src)
               .replace('/*__UI__*/', () => ui);

// Penjagaan: satu kesalahan ketik di penanda bikin halaman diam-diam kehilangan
// seluruh logikanya, dan itu cuma kelihatan waktu file .smc2 dijatuhkan.
for (const must of ['function readProject', 'function ladderHtml', 'function graphSvg',
                    'function draw', "$('#drop')",
                    // Tiap perintah CLI harus punya padanannya di halaman. Kalau
                    // salah satu modulnya lepas dari ORDER, tombolnya tetap ada
                    // tapi mati waktu diklik - dan itu cuma ketahuan kalau ada
                    // yang membuka file .smc2 lalu mengklik tab yang tepat.
                    'const SGLIB', 'function rungNet', 'function exportProject',
                    'function xref', 'function llmDump', 'function graphData',
                    'function probeFb']) {
  if (!out.includes(must)) throw new Error('hasil build kehilangan: ' + must);
}
if (out.includes('/*__SRC__*/') || out.includes('/*__UI__*/')) {
  throw new Error('penanda tidak tergantikan - periksa viewer/shell.html');
}
// Diperiksa pada kode SAJA - komentar boleh menyebut `require`/`module.exports`
// (dan memang menyebutnya, buat menjelaskan aturan bentuk berkas src/*.js).
const code = out.replace(/^\s*\/\/.*$/gm, '');
const leak = code.match(/\brequire\(|module\.exports/);
if (leak) {
  const at = code.slice(Math.max(0, code.indexOf(leak[0]) - 90), code.indexOf(leak[0]) + 60);
  throw new Error('sisa require/module.exports ikut terbawa ke halaman:\n   ...' + at.trim());
}

fs.writeFileSync(path.join(ROOT, 'smc2-viewer.html'), out);
console.log('WROTE smc2-viewer.html  (' + out.split('\n').length + ' baris, ' +
            (out.length / 1024).toFixed(1) + ' KB)');
console.log('       ' + ORDER.length + ' modul src + ui, ' +
            src.split('\n').length + ' baris logika');
