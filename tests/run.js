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
if (!fs.existsSync(path.join(__dirname, '..', 'sample.smc2'))) {
  console.log('catatan: taruh sebuah project sebagai sample.smc2 di root repo');
  console.log('         supaya tes benar-benar menguji parsing, bukan sekadar skip.');
}
console.log(failed ? failed + ' dari ' + files.length + ' suite GAGAL'
                   : 'Semua ' + files.length + ' suite lulus');
process.exit(failed ? 1 : 0);
