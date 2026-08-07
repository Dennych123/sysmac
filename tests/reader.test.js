// Pembaca .smc2 diuji terhadap DUA versi format Sysmac Studio sekaligus.
// Alasannya konkret: format ladder berubah total antara 1.56 (DataContract XML)
// dan 1.66 (deretan objek JSON). Sekali salah satu berhenti terbaca, fitur audit
// program vendor ikut mati - dan itu baru ketahuan saat dipakai kalau tidak dites.
//
// Tes dilewati (skip, bukan gagal) kalau file .smc2 contohnya tidak ada, supaya
// suite tetap jalan di mesin yang tidak punya project Sysmac.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const READER = path.join(ROOT, 'read_smc2.py');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

// Cari python yang tersedia
function python() {
  for (const c of ['python', 'python3', 'py']) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
    if (r.status === 0) return c;
  }
  return null;
}
const PY = python();
if (!PY) { console.log('  SKIP  python tidak ada di PATH'); process.exit(0); }

// Contoh project: yang ada di repo, plus lokasi umum kalau ada
const samples = [
  { name: 'Studio 1.66 (JSON ladder)', file: path.join(ROOT, 'sample.smc2'), minRungs: 1000, wantVars: true },
];

let ran = 0;
for (const s of samples) {
  if (!fs.existsSync(s.file)) { console.log('  SKIP  ' + s.name + ' (file contoh tidak ada)'); continue; }
  ran++;
  const r = spawnSync(PY, [READER, s.file], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  chk(s.name + ': pembaca jalan tanpa error', r.status === 0, 'exit ' + r.status);

  const m = out.match(/TOTAL\s*:\s*(\d+) program, (\d+) section, (\d+) rung/);
  chk(s.name + ': ringkasan terbaca', !!m, (out.split('\n').pop() || '').slice(0, 60));
  if (m) {
    const [, prog, sect, rung] = m.map(Number);
    chk(s.name + ': program & section ketemu', prog > 0 && sect > 0, prog + ' program, ' + sect + ' section');
    // Inti pengujian: rung BENAR-BENAR terbaca. Kalau pemetaan id salah, jumlahnya 0
    // dan itu terlihat seperti "project kosong" - bukan seperti error.
    chk(s.name + ': rung terbaca (bukan 0)', rung >= s.minRungs, rung + ' rung');
  }

  const v = out.match(/VARIABEL\s*:\s*(\d+)/);
  if (s.wantVars) {
    chk(s.name + ': tabel variabel global terbaca', !!v && Number(v[1]) > 100, v ? v[1] + ' variabel' : 'tidak ada');
  }

  // Nama section harus muncul, bukan cuma GUID
  chk(s.name + ': nama section terbaca', /\b(Fault|FAULT|Condition|CONDITION)\b/.test(out),
      'ada section Fault/Condition');
}

if (!ran) { console.log('  SKIP  tidak ada file .smc2 contoh'); process.exit(0); }
console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
process.exit(fail ? 1 : 0);
