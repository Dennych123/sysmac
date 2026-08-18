// Bandingkan dua project Sysmac (.smc2) - apa yang berubah di Studio.
//
//   node scripts/smc2_diff.js LAMA.smc2 BARU.smc2
//   node scripts/smc2_diff.js LAMA.smc2 BARU.smc2 --json out.json
//   node scripts/smc2_diff.js LAMA.smc2 BARU.smc2 --brief    satu baris saja
//
// HANYA BACA. Tidak menulis apa pun ke .smc2 mana pun.
//
// Isinya tipis dengan sengaja: seluruh logikanya milik reader/diff.js, dan berkas ini cuma
// jalan masuk dari akar repo supaya perintahnya sejajar dengan skrip lain (nb_sync, nb_apply,
// smc2_comment) dan bisa dipanggil aplikasi lokal tanpa merakit flag `--diff` sendiri.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { unzip } = require(path.join(ROOT, 'reader', 'src', 'zip.js'));
const { readProject } = require(path.join(ROOT, 'reader', 'src', 'smc2.js'));
const D = require(path.join(ROOT, 'reader', 'diff.js'));

const argv = process.argv.slice(2);
const files = argv.filter(a => !a.startsWith('--'));
const has = f => argv.indexOf('--' + f) >= 0;
const after = f => {
  const i = argv.indexOf('--' + f);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[i + 1] : null;
};

if (files.length < 2) {
  console.error('pakai: node scripts/smc2_diff.js LAMA.smc2 BARU.smc2 [--json out.json] [--brief]');
  console.error('');
  console.error('Urutannya lama dulu, baru kemudian. Ketuker, "+" dan "-" ikut ketuker dan');
  console.error('laporannya membaca terbalik tanpa satu pun tanda.');
  process.exit(2);
}

for (const f of files.slice(0, 2)) {
  if (!fs.existsSync(f)) { console.error('tidak ada: ' + f); process.exit(2); }
}

(async () => {
  const a = await readProject(fs.readFileSync(files[0]), unzip);
  const b = await readProject(fs.readFileSync(files[1]), unzip);
  const d = D.diffProjects(a, b);

  const out = after('json');
  if (out) { fs.writeFileSync(out, JSON.stringify(d, null, 2), 'utf8'); console.log('WROTE ' + out); }

  console.log(has('brief') ? D.diffLine(d) : D.diffReport(d, files[0], files[1]));
})().catch(e => { console.error('GAGAL: ' + e.message); process.exit(1); });
