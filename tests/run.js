// Jalanin SEMUA suite: pipeline generator + harness per-area. Satu perintah, satu exit code.
//   node tests/run.js
// Tiap suite adalah proses sendiri supaya satu yang crash gak nyeret yang lain, dan supaya
// exit code-nya kebaca apa adanya.
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const suites = [
  ['pipeline generator', path.join(ROOT, 'scripts', 'test.js')],
  ...fs.readdirSync(__dirname)
    .filter((f) => f.endsWith('.test.js'))
    .sort()
    .map((f) => [f.replace(/\.test\.js$/, ''), path.join(__dirname, f)]),
];

// Harness editor membaca index.html hasil build, jadi build-nya harus segar. Kalau lupa build,
// tesnya bakal nguji versi lama dan lulus/gagal buat alasan yang salah.
if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error('index.html belum ada - jalanin: python scripts/build_html.py');
  process.exit(2);
}

// index.html BASI itu kegagalan yang paling menipu di repo ini. Suite generator membaca
// js/*.js lewat scripts/core.js, jadi semuanya tetap hijau - sementara browser menjalankan
// salinan lama yang ikut ke index.html. Yang di layar orang tidak berubah sama sekali, dan
// tidak ada satu pun tes yang mengeluh. Sudah kejadian.
//
// Dicek lewat ISI, bukan tanggal berkas: git checkout menyetel ulang mtime, dan perbandingan
// tanggal bakal ribut di kloning segar tanpa ada yang salah. Sumbernya ditanam sebagai string
// JSON (json.dumps, ensure_ascii) - di-parse balik, dibandingkan huruf per huruf.
(function checkStale() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // gen_all.js ditanam SETELAH lib.js dalam satu string, jadi yang diperiksa "memuat", bukan "sama".
  const embed = [['PARSE_JS', ['parse.js']], ['GENNAME_JS', ['genname.js']], ['VALIDATE_JS', ['validate.js']],
                 ['SPLIT_JS', ['split.js']], ['GEN_ALL_JS', ['lib.js', 'gen_all.js']]];
  const basi = [];
  embed.forEach(([varName, files]) => {
    const m = new RegExp('var ' + varName + '\\s*=\\s*("(?:[^"\\\\]|\\\\.)*")').exec(html);
    if (!m) { basi.push(varName + ' tidak ketemu di index.html'); return; }
    let src;
    try { src = JSON.parse(m[1]); } catch (e) { basi.push(varName + ' tidak bisa di-parse'); return; }
    files.forEach((f) => {
      const disk = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').replace(/\r\n/g, '\n');
      if (src.replace(/\r\n/g, '\n').indexOf(disk) < 0) basi.push('js/' + f);
    });
  });
  if (basi.length) {
    console.error('index.html BASI - tidak memuat versi terakhir dari: ' + basi.join(', '));
    console.error('jalanin dulu: python scripts/build_html.py');
    console.error('(suite generator bakal tetap hijau tanpa ini - yang lama cuma jalan di browser)');
    process.exit(2);
  }
})();

let failed = 0;
suites.forEach(([name, file]) => {
  const r = spawnSync(process.execPath, [file], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const ok = r.status === 0;
  if (!ok) failed++;
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name);
  if (!ok) console.log(out.split('\n').filter((l) => /BAD|GAGAL|Error|error/.test(l)).slice(0, 12).map((l) => '          ' + l).join('\n'));
});

console.log('');
console.log(failed ? failed + ' dari ' + suites.length + ' suite GAGAL' : 'Semua ' + suites.length + ' suite lulus');
process.exit(failed ? 1 : 0);
