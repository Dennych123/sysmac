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
