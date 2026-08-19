// Ganti NAMA PROGRAM di dalam .smc2 - bukan cuma di pohon project.
//
//   node scripts/smc2_rename.js <project.smc2> LAMA=BARU [LAMA=BARU ...]           lihat
//   node scripts/smc2_rename.js <project.smc2> --peta rename.txt                   lihat
//   ... --write                                                                    tulis
//
// BELUM TERBUKTI, kelas yang sama dengan smc2_comment.js. Buktikan ke SALINAN dulu: buka di
// Studio, pastikan kedelapan program muncul, Task Settings masih memuat semuanya, dan Build
// bersih. Baru dipakai ke yang asli.
//
// Kenapa ini tidak boleh dikerjakan dengan cari-ganti biasa: nama program TERIKAT di tujuh
// tempat, dan yang paling berbahaya bukan pohon project melainkan penugasan task.
//
//   .oem   Entity type="Program"             name= + DN=      pohon project
//   .oem   Entity type="NexAssociatedProgram" name= + DN=     simpul penugasan
//   <task>.xml  <AssociatedProgramData ProgramName= InstanceName=  PENUGASAN TASK
//   <id>.xml    <PouInstanceName>                              satu berkas per program
//   mana pun    <VariableName>NAMA.var</VariableName>          qualifier variabel
//   NexBuildVerifierGroup  <a:Key>NAMA</a:Key>                 cache hash build
//
// Ganti pohonnya saja, penugasan task masih menunjuk nama lama - programnya BERHENTI
// DIEKSEKUSI dan Studio tidak mengeluh sama sekali, karena dua-duanya berkas yang sah.
// Makanya penggantian di sini dihitung per PERAN, dan tiap peran dilaporkan sendiri: peran
// yang jumlahnya nol itu tanda ada tempat yang terlewat, bukan tanda tidak ada yang perlu.
//
// `SequenceNumber` TIDAK disentuh - urutan eksekusi task tidak ikut berubah. Nomor di nama
// program itu label, bukan urutan; menyamakan keduanya berarti diam-diam menyusun ulang
// eksekusi mesin.
'use strict';
const fs = require('fs');
const path = require('path');
const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
const { packZip } = require(path.join(__dirname, 'smc2_write.js'));

const args = process.argv.slice(2);
const write = args.includes('--write');
const rest = args.filter(a => a !== '--write');
if (rest.length < 2) {
  console.error('pakai: node scripts/smc2_rename.js <project.smc2> LAMA=BARU [...] [--write]');
  console.error('   or: node scripts/smc2_rename.js <project.smc2> --peta rename.txt [--write]');
  process.exit(2);
}
const smcPath = rest[0];

// ---- peta rename -------------------------------------------------------------------------
const peta = {};
(function bacaPeta() {
  const sisa = rest.slice(1);
  let pasangan = sisa;
  if (sisa[0] === '--peta') {
    if (!sisa[1]) { console.error('--peta butuh nama berkas'); process.exit(2); }
    pasangan = fs.readFileSync(sisa[1], 'utf8').split(/\r?\n/)
      .map(l => l.replace(/#.*$/, '').trim()).filter(Boolean);
  }
  pasangan.forEach(p => {
    const i = p.indexOf('=');
    if (i < 1) { console.error('bentuknya LAMA=BARU, bukan: ' + p); process.exit(2); }
    peta[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  });
})();

const LAMA = Object.keys(peta);
if (!LAMA.length) { console.error('tidak ada pasangan rename.'); process.exit(2); }

// Nama program itu identifier IEC: huruf/angka/garis bawah, tidak boleh mulai angka. Nama
// yang ditolak Studio baru ketahuan waktu project dibuka, dan saat itu berkasnya sudah ditulis.
const salah = Object.values(peta).filter(n => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(n));
if (salah.length) { console.error('nama baru tidak sah sebagai identifier IEC: ' + salah.join(' ')); process.exit(2); }
// Dua program bernama sama = project yang tidak bisa dibuka. Diperiksa di sini, bukan di Studio.
const baruSet = new Set(Object.values(peta));
if (baruSet.size !== LAMA.length) { console.error('ada nama baru yang kembar.'); process.exit(2); }

// ---- peran: tiap pola diberi nama supaya laporannya bisa dibaca ---------------------------
// Sengaja per-peran dan bukan satu regex global: kalau salah satu peran tidak pernah kena,
// itu HARUS kelihatan. Cari-ganti buta memberi angka besar yang menyenangkan sambil melewatkan
// satu peran yang justru menentukan programnya jalan atau tidak.
function polaPeran(lama) {
  const q = lama.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    ['pohon project (name=)',      new RegExp('(\\bname=")' + q + '(")', 'g')],
    ['pohon project (DN=)',        new RegExp('(\\bDN=")' + q + '(")', 'g')],
    ['penugasan task (ProgramName=)',  new RegExp('(\\bProgramName=")' + q + '(")', 'g')],
    ['penugasan task (InstanceName=)', new RegExp('(\\bInstanceName=")' + q + '(")', 'g')],
    ['PouInstanceName',            new RegExp('(<PouInstanceName>)' + q + '(</PouInstanceName>)', 'g')],
    ['qualifier variabel',         new RegExp('(<VariableName>)' + q + '(\\.)', 'g')],
    ['cache build (a:Key)',        new RegExp('(<a:Key>)' + q + '(</a:Key>)', 'g')],
  ];
}

(async function main() {
  let buf;
  try { buf = fs.readFileSync(smcPath); } catch (e) { console.error('.smc2 tidak terbaca: ' + e.message); process.exit(2); }

  const entries = [];
  const hitung = {};            // peran -> jumlah
  const perProgram = {};        // lama -> jumlah
  const berubah = new Set();
  let sisaLama = 0;             // kemunculan nama lama yang TIDAK kena satu pun peran

  for (const [nama, e] of unzip(buf)) {
    const data = Buffer.from(await inflate(e));
    let s;
    // Entri biner (.dat, .stsdb4, .zip bersarang) tidak ikut disentuh. Decode-nya diperiksa
    // bolak-balik: kalau tidak persis sama, berkasnya bukan UTF-8 dan menulis ulang hasil
    // decode akan MERUSAKNYA tanpa suara.
    try {
      s = data.toString('utf8');
      if (!Buffer.from(s, 'utf8').equals(data)) { entries.push({ name: nama, data }); continue; }
    } catch (err) { entries.push({ name: nama, data }); continue; }

    let baru = s;
    LAMA.forEach(lama => {
      polaPeran(lama).forEach(([peranNama, re]) => {
        baru = baru.replace(re, (m, a, b) => {
          hitung[peranNama] = (hitung[peranNama] || 0) + 1;
          perProgram[lama] = (perProgram[lama] || 0) + 1;
          return a + peta[lama] + b;
        });
      });
    });
    if (baru !== s) { berubah.add(nama.split('/').pop()); entries.push({ name: nama, data: Buffer.from(baru, 'utf8') }); }
    else entries.push({ name: nama, data });
    // Nama lama yang masih tersisa di entri ini - dihitung SESUDAH penggantian, jadi yang
    // terhitung memang yang tidak dikenali peran mana pun.
    LAMA.forEach(lama => { sisaLama += (baru.split(lama).length - 1); });
  }

  console.log('.smc2 : ' + path.basename(smcPath) + '   ' + entries.length + ' entri di dalam container');
  console.log('');
  LAMA.forEach(l => console.log('  ' + l.padEnd(26) + ' -> ' + peta[l].padEnd(26)
    + (perProgram[l] || 0) + ' tempat'));
  console.log('');
  console.log('per PERAN:');
  polaPeran(LAMA[0]).forEach(([p]) => {
    const n = hitung[p] || 0;
    console.log('  ' + (n ? '     ' : '  !! ') + String(n).padStart(3) + '  ' + p
      + (n ? '' : '   <- TIDAK ADA satu pun. Periksa: ini peran yang bikin program berhenti jalan.'));
  });
  console.log('');
  console.log('entri yang berubah : ' + berubah.size + '   ' + [...berubah].slice(0, 8).join(' '));
  if (sisaLama) {
    console.log('');
    console.log('SISA : ' + sisaLama + ' kemunculan nama lama yang tidak dikenali peran mana pun.');
    console.log('       Jangan ditulis sebelum tahu itu apa - nama program yang tinggal separuh');
    console.log('       diganti lebih buruk daripada yang tidak diganti sama sekali.');
  }

  const total = Object.values(perProgram).reduce((a, b) => a + b, 0);
  if (!total) { console.log('\nTidak ada yang cocok - nama lamanya tidak ada di project ini.'); process.exit(1); }

  if (!write) {
    console.log('');
    console.log('Belum ada yang ditulis. Tambahkan --write kalau sudah cocok.');
    console.log('COBA KE SALINAN DULU, lalu buka di Sysmac Studio dan pastikan:');
    console.log('  1. semua program muncul dengan nama barunya');
    console.log('  2. Task Settings masih memuat SEMUA program (ini yang paling gampang putus)');
    console.log('  3. Build bersih');
    console.log('Tutup Sysmac Studio dulu sebelum menulis.');
    return;
  }

  const keluar = packZip(entries);
  // Dibongkar ulang dan dibandingkan entri per entri SEBELUM berkas aslinya disentuh. ZIP yang
  // rusak baru mengumumkan diri waktu Studio menolak membuka project - dan saat itu berkasnya
  // sudah tertimpa.
  let cek = 0;
  for (const [nama, e] of unzip(keluar)) {
    const d = Buffer.from(await inflate(e));
    const asli = entries.find(x => x.name === nama);
    if (!asli || !d.equals(asli.data)) { console.error('GAGAL: hasil kemasan tidak sama isinya di ' + nama); process.exit(1); }
    cek++;
  }
  if (cek !== entries.length) { console.error('GAGAL: entri hilang waktu dikemas (' + cek + ' vs ' + entries.length + ')'); process.exit(1); }
  console.log('periksa ulang: ' + cek + ' entri dibongkar balik, isinya sama persis');

  const t = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  let bak = smcPath + '.' + t + '.bak', n = 1;
  while (fs.existsSync(bak)) bak = smcPath + '.' + t + '-' + (++n) + '.bak';
  fs.copyFileSync(smcPath, bak);
  fs.writeFileSync(smcPath, keluar);
  console.log('cadangan : ' + bak);
  console.log('DITULIS  : ' + total + ' tempat di ' + smcPath);
  console.log('Buka di Sysmac Studio: cek Task Settings memuat semua program, lalu Build.');
})().catch(e => { console.error(e.message); process.exit(1); });
