// Menjaga HASIL BUILD (smc2-viewer.html), bukan logikanya.
//
// Sejak logika pindah ke src/*.js, semua suite lain menguji src langsung. Itu
// bikin satu celah baru: build.js bisa rusak - penanda salah ketik, urutan modul
// kebalik, blok require kebawa - dan SEMUA tes tetap hijau sementara halamannya
// mati begitu dibuka. Suite ini menutup celah itu.
//
// Yang diperiksa: halaman hasil build masih sinkron dengan src/, sintaksnya sah,
// tidak ada sisa require/module.exports, dan fungsi kuncinya benar-benar ada.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MODULES } = require('./lib/viewer');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'smc2-viewer.html');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

chk('smc2-viewer.html ada', fs.existsSync(HTML));
if (!fs.existsSync(HTML)) { console.log('\n1 GAGAL'); process.exit(1); }

// Build ulang ke berkas sementara lalu bandingkan: kalau beda, berarti ada yang
// mengedit smc2-viewer.html langsung atau lupa build setelah mengubah src/.
const before = fs.readFileSync(HTML, 'utf8');
execFileSync(process.execPath, [path.join(ROOT, 'build.js')], { encoding: 'utf8' });
const after = fs.readFileSync(HTML, 'utf8');
chk('hasil build sudah mutakhir (src/ dan viewer/ sinkron dengan HTML)',
    before === after, before === after ? '' : 'jalankan: node build.js');

const script = (after.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
// Komentar dibuang dulu di SEMUA pemeriksaan pola di bawah: komentar di src/*.js
// memang menyebut "<script>", "require", dan "module.exports" untuk menjelaskan
// aturan bentuk berkasnya - kalau ikut dihitung, tesnya merah karena salah
// cocok, bukan karena hasil build-nya salah.
const code = after.replace(/^\s*\/\/.*$/gm, '');
chk('ada tepat satu blok <script>', (code.match(/<script>/g) || []).length === 1,
    (code.match(/<script>/g) || []).length + ' tag');
chk('blok script tidak kosong', script.length > 20000, (script.length / 1024).toFixed(1) + ' KB');

// Sintaks diperiksa sungguhan, bukan dicocokkan pola. Stub DOM secukupnya supaya
// bisa di-compile tanpa dijalankan.
let syntax = '';
try { new Function('document', 'window', 'URL', 'Blob', 'DecompressionStream', script); }
catch (e) { syntax = e.message; }
chk('sintaks JavaScript halaman sah', !syntax, syntax);

// Tiap modul src harus benar-benar ikut ter-inline.
MODULES.forEach(m => chk('modul ikut ter-inline: src/' + m + '.js',
                         after.includes('src/' + m + '.js')));

for (const f of ['function readProject', 'function parseLadderXml', 'function parseLadderJson',
                 'function rungExpr', 'function ladderHtml', 'function graphSvg',
                 'function stepsToVariants', 'function draw']) {
  chk('fungsi kunci ada: ' + f.replace('function ', ''), after.includes(f));
}

// Blok khusus Node harus DIBUANG - kalau ikut terbawa, halaman mati di baris
// pertama dengan "require is not defined" atau bentrok deklarasi `esc`.
chk('tidak ada sisa require(', !/\brequire\(/.test(code));
chk('tidak ada sisa module.exports', !/module\.exports/.test(code));
chk('tidak ada penanda build yang belum tergantikan',
    !after.includes('__SRC__') && !after.includes('__UI__'));

// Viewer harus tetap satu berkas offline: tidak boleh menarik apa pun dari luar.
chk('tidak ada <script src=> ke luar', !/<script[^>]+src=/i.test(after));
chk('tidak ada <link rel=stylesheet> ke luar', !/<link[^>]+stylesheet/i.test(after));
chk('tidak ada URL http(s) yang di-fetch',
    !/fetch\(|XMLHttpRequest|import\(/.test(code));

console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
process.exit(fail ? 1 : 0);
