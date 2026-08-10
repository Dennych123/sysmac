// Jalanin semua suite. Satu perintah, satu exit code.
//   node tests/run.js
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
let failed = 0;

for (const f of files) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const skipped = /SKIP/.test(out) && !/OK |BAD /.test(out);
  const ok = r.status === 0;
  if (!ok) failed++;
  console.log((ok ? (skipped ? '  SKIP  ' : '  PASS  ') : '  FAIL  ') + f.replace(/\.test\.js$/, ''));
  if (!ok) {
    console.log(out.split('\n').filter(l => /BAD|GAGAL|Error/.test(l)).slice(0, 10)
      .map(l => '          ' + l).join('\n'));
  }
}

console.log('');
// fixture selalu jalan (project tiruan ikut di-commit). Suite ber-SKIP di atas
// cuma yang butuh SKALA project sungguhan - ribuan rung, ribuan variabel.
if (!fs.existsSync(path.join(__dirname, '..', 'sample.smc2'))) {
  console.log('catatan: bentuk parser sudah dijaga suite "fixture".');
  console.log('         taruh sebuah project sebagai sample.smc2 di root repo kalau mau');
  console.log('         menguji skalanya juga - suite ber-SKIP di atas yang butuh itu.');
}
console.log(failed ? failed + ' dari ' + files.length + ' suite GAGAL'
                   : 'Semua ' + files.length + ' suite lulus');
process.exit(failed ? 1 : 0);
