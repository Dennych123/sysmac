// Uji `--diff` - pembanding dua project .smc2.
//
// Yang dijaga di sini bukan "ada keluaran", tapi tiga pembedaan yang justru jadi
// alasan berkas ini ada, dan tiga-tiganya gampang runtuh diam-diam:
//
//   1. rung yang cuma DIGESER di kanvas TIDAK boleh dihitung perubahan logika.
//      Kalau runtuh, tiap kali orang merapikan tata letak seluruh section tampak
//      berubah - laporannya jadi bising dan berhenti dibaca, dan perubahan
//      logika yang sungguhan tenggelam di dalamnya.
//   2. alamat AT yang bergeser HARUS muncul. Itu satu-satunya perubahan yang
//      tidak kelihatan di layar Studio maupun di layar NB - dua-duanya tetap
//      menyala, cuma menunjuk bit lain.
//   3. alarm yang PINDAH NOMOR dilaporkan sebagai pindah, bukan sebagai dua
//      komen berubah. Nomornya tercetak di lembar troubleshooting.
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'cli.js');
const FIXTURE = path.join(__dirname, 'fixtures', 'synthetic.smc2');
const { unzip } = require(path.join(ROOT, 'src', 'zip.js'));
const { readProject } = require(path.join(ROOT, 'src', 'smc2.js'));
const D = require(path.join(ROOT, 'diff.js'));

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

if (!fs.existsSync(FIXTURE)) {
  console.log('>>BAD tests/fixtures/synthetic.smc2 tidak ada - bikin: node tests/fixtures/make_fixture.js');
  process.exit(1);
}

// --------------------------------------------------------------- CLI: sama
const self = spawnSync(process.execPath, [CLI, FIXTURE, '--diff', FIXTURE], { encoding: 'utf8' });
chk('CLI --diff jalan', self.status === 0, 'exit ' + self.status + ' ' + (self.stderr || '').trim());
chk('project vs dirinya sendiri: tidak ada perubahan',
    /TIDAK ADA PERUBAHAN/.test(self.stdout), (self.stdout || '').split('\n')[2]);

const missing = spawnSync(process.execPath, [CLI, FIXTURE, '--diff'], { encoding: 'utf8' });
chk('--diff tanpa berkas kedua ditolak, bukan crash',
    missing.status === 2 && /butuh berkas/.test(missing.stderr), 'exit ' + missing.status);

// ------------------------------------------------------ unit: project tiruan
(async () => {
  const base = await readProject(fs.readFileSync(FIXTURE), unzip);
  const clone = () => JSON.parse(JSON.stringify(base));

  chk('fixture punya bahan yang diuji',
      base.programs.length >= 2 && base.variables.length >= 3);

  // 1. GESER KOORDINAT saja -----------------------------------------------
  const moved = clone();
  // Harus section ladder JSON (>= 1.66) - cuma bentuk itu yang membawa koordinat.
  // Section DataContract lama tidak punya X/Y sama sekali, jadi "digeser" di situ
  // tidak berarti apa-apa dan tesnya lulus tanpa menguji apa pun.
  const withXY = s => (s.rungs || []).some(r => (r.elements || []).some(e => 'y' in e));
  const sect = moved.programs.map(p => p.sections.find(withXY)).find(Boolean);
  sect.rungs[0].elements.forEach(e => { if ('y' in e) e.y = (e.y || 0) + 5; });
  let d = D.diffProjects(base, moved);
  chk('geser kanvas TIDAK dihitung perubahan logika', d.counts.rungLogic === 0,
      d.counts.rungLogic + ' logika');
  chk('geser kanvas tercatat sebagai tata letak', d.counts.rungCosmetic === 1,
      d.counts.rungCosmetic + ' tata letak');

  // 2. LOGIKA berubah - satu operand kontak diganti -------------------------
  const logic = clone();
  const ls = logic.programs.map(p => p.sections.find(s => (s.rungs || []).length)).find(Boolean);
  const target = ls.rungs[0].elements.find(e => e.var);
  target.var = target.var + '_LAIN';
  d = D.diffProjects(base, logic);
  chk('operand diganti = perubahan LOGIKA', d.counts.rungLogic === 1 && d.counts.rungCosmetic === 0,
      d.counts.rungLogic + ' logika, ' + d.counts.rungCosmetic + ' tata letak');
  chk('section yang berubah disebut namanya',
      /\/ /.test(D.diffReport(d, 'a', 'b')) && D.diffReport(d, 'a', 'b').includes(ls.name));

  // 3. ALAMAT AT bergeser ---------------------------------------------------
  const addr = clone();
  const withAddr = addr.variables.find(v => v.address) || addr.variables[0];
  withAddr.address = 'IOBus://rack#0/slot#0/Ch1_99';
  d = D.diffProjects(base, addr);
  const rep = D.diffReport(d, 'a', 'b');
  chk('AT bergeser dilaporkan', d.variables.changed.length === 1 &&
      d.variables.changed[0].fields.some(f => f.field === 'address'),
      JSON.stringify(d.variables.changed).slice(0, 90));
  chk('nama variabelnya ikut tercetak', rep.includes(withAddr.name));

  // 4. VARIABEL ditambah / dihapus -----------------------------------------
  const vmix = clone();
  vmix.variables.push({ name: 'ZZ_BARU', type: 'BOOL', address: '', group: '', comment: '' });
  const gone = vmix.variables.shift();
  d = D.diffProjects(base, vmix);
  chk('variabel baru terdeteksi', d.variables.added.some(v => v.name === 'ZZ_BARU'));
  chk('variabel hilang terdeteksi', d.variables.removed.some(v => v.name === gone.name));

  // 5. ALARM PINDAH NOMOR ---------------------------------------------------
  // Dibedakan dari "teks berubah": yang pindah nomor bikin lembar troubleshooting
  // dan tiap layar NB yang menyebut nomor lama ikut salah.
  const A = { programs: [], variables: [{ name: 'AL', type: 'ARRAY[0..99] OF BOOL', address: '',
              group: '', comment: '', elementComments: { 3: 'Air source pressure lost',
                                                         4: 'Safety door open' } }] };
  const B = JSON.parse(JSON.stringify(A));
  B.variables[0].elementComments = { 3: 'Emergency stop pressed',
                                     4: 'Air source pressure lost',
                                     5: 'Safety door open' };
  d = D.diffProjects(A, B);
  chk('alarm pindah nomor terdeteksi sebagai PINDAH', d.elements.moved.length === 2,
      JSON.stringify(d.elements.moved.map(m => m.from + '->' + m.to)));
  chk('pindahnya ke nomor yang benar',
      d.elements.moved.some(m => m.from === 'AL[3]' && m.to === 'AL[4]'),
      JSON.stringify(d.elements.moved.map(m => m.from + '->' + m.to)));
  const rep5 = D.diffReport(d, 'a', 'b');
  chk('laporan memperingatkan layar NB ikut salah', /nb_sync/.test(rep5) && /BERGESER/.test(rep5));

  // Teks yang cuma BERUBAH (tidak muncul lagi di tempat lain) bukan "pindah" -
  // kalau ini runtuh, tiap penyuntingan teks alarm dilaporkan sebagai pergeseran
  // nomor dan peringatan yang paling mahal itu jadi tidak berarti apa-apa.
  const C = JSON.parse(JSON.stringify(A));
  C.variables[0].elementComments[3] = 'Air pressure low';
  d = D.diffProjects(A, C);
  chk('teks disunting BUKAN pindah nomor',
      d.elements.moved.length === 0 && d.elements.changed.length === 1,
      d.elements.moved.length + ' pindah, ' + d.elements.changed.length + ' berubah');

  // 6. PROGRAM ditambah / dihapus ------------------------------------------
  const pdrop = clone();
  const dropped = pdrop.programs.pop();
  d = D.diffProjects(base, pdrop);
  chk('program hilang terdeteksi', d.programs.removed.some(p => p.name === dropped.name));
  chk('section miliknya tidak ikut dilaporkan dua kali sebagai "berubah"',
      d.sections.changed.length === 0, d.sections.changed.length + ' section berubah');

  // 7. Ringkasan satu baris - dipakai jadi pesan commit (TODO 3b) -----------
  chk('ringkasan satu baris tidak kosong', D.diffLine(d).length > 0 && !/\n/.test(D.diffLine(d)),
      D.diffLine(d));
  chk('ringkasan project identik berbunyi "tidak ada perubahan"',
      D.diffLine(D.diffProjects(base, clone())) === 'tidak ada perubahan');

  console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('>>BAD ' + e.stack); process.exit(1); });
