// Tempel alarm ke project NB-Designer.
//
//   node scripts/nb_apply.js <sumber> <folder project NB>           lihat dulu, TIDAK menulis
//   node scripts/nb_apply.js <sumber> <folder project NB> --write   benar-benar menulis
//
// <sumber> boleh dua-duanya:
//   project JSON  -> alarmnya digenerate di sini, selalu sinkron dengan program
//   AlarmLib.csv  -> berkas yang sudah diunduh dari panel web, dipakai apa adanya
// Yang kedua ada karena yang memakai panel web sudah memegang berkasnya; memaksa mereka
// mencari project JSON-nya lagi cuma bikin perintah ini salah ketik.
//
// Kenapa ada: 190 teks alarm tidak perlu diketik ulang satu per satu di NB-Designer.
//
// PENTING soal cara masuknya. Alarm NB TIDAK dibaca dari berkas di folder project - tempatnya
// di dalam .nbp sendiri, sebagai elemen <AlarmObject>. CSV ini format Export/Import dialog
// "Alarm Setting", jadi memasukkannya lewat tombol Import di dialog itu, BUKAN dengan menyalin
// berkas ke folder project. Menyalin ke folder tidak mengubah apa pun di NB - itu sudah dicoba,
// dan yang berubah cuma berkas milik orang yang kebetulan bernama sama.
//
// Jadi yang dikerjakan skrip ini: menyiapkan berkasnya di sebelah project supaya gampang
// ditemukan waktu menekan Import. Namanya sengaja BUKAN AlarmLib.csv - nama itu sering sudah
// dipakai berkas ekspor milik orangnya sendiri.
'use strict';
const fs = require('fs');
const path = require('path');
const core = require(path.join(__dirname, 'core.js'));
const { findNbProject } = require(path.join(__dirname, 'nb_common.js'));

const args = process.argv.slice(2);
const write = args.includes('--write');
const rest = args.filter(a => a !== '--write');
if (rest.length < 2) {
  console.error('pakai: node scripts/nb_apply.js <project.json | AlarmLib.csv> <folder project NB> [--write]');
  process.exit(2);
}
const [srcPath, nbArg] = rest;

const found = findNbProject(nbArg);
if (found.err) { console.error(found.err); process.exit(2); }

// Sumbernya dibedakan dari isinya, bukan dari nama berkasnya: orang menyimpan project JSON
// dengan nama apa saja, dan CSV yang diunduh browser kadang jadi "AlarmLib (1).csv".
const warns = [];
let srcRaw;
try { srcRaw = fs.readFileSync(srcPath, 'utf8'); }
catch (e) { console.error('sumber tidak terbaca: ' + e.message); process.exit(2); }
let csv, asal;
if (/^﻿?Alarm Lib,/.test(srcRaw)) {
  csv = { xml: srcRaw };
  asal = 'berkas CSV apa adanya';
} else {
  let project;
  try { project = JSON.parse(srcRaw); }
  catch (e) { console.error('sumber bukan AlarmLib.csv dan bukan JSON yang sah: ' + e.message); process.exit(2); }
  const out = core.generate(project, { onWarn: w => warns.push(w) });
  csv = out.files.find(f => f.name === 'AlarmLib.csv');
  if (!csv) {
    console.error('generator tidak menghasilkan AlarmLib.csv - peta HMI kemungkinan dimatikan di project JSON.');
    process.exit(1);
  }
  asal = 'digenerate dari ' + path.basename(srcPath);
}

// Nama berkasnya sengaja dibedakan. AlarmLib.csv sering sudah ada di folder project sebagai
// hasil Export milik orangnya - menimpanya tidak menambah apa pun ke NB (alarmnya di .nbp),
// yang hilang cuma catatan mereka.
const target = path.join(found.dir, 'AlarmLib-generated.csv');
const rowsOf = s => s.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean).slice(2);
const baru = rowsOf(csv.xml);
const lama = fs.existsSync(target) ? rowsOf(fs.readFileSync(target, 'utf8')) : null;
// Kolom 15 alamat, kolom 5 teks - tapi teks boleh mengandung koma, jadi tidak boleh split polos.
function cell(line, n) {
  let i = 0, k = 0, c = '', q = false;
  for (; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { if (k === n) return c; k++; c = ''; }
    else c += ch;
  }
  return k === n ? c : '';
}

console.log('project NB : ' + found.dir);
console.log('berkas .nbp: ' + found.nbp);
console.log('sasaran    : ' + target);
console.log('sumber     : ' + asal);
console.log('');
console.log('alarm sekarang di project : lihat sendiri di NB-Designer, Alarm Setting'
  + (lama === null ? '' : '   (berkas ini sebelumnya berisi ' + lama.length + ' baris)'));
console.log('alarm hasil generate      : ' + baru.length
  + '   ' + cell(baru[0], 15) + ' .. ' + cell(baru[baru.length - 1], 15));
console.log('');
console.log('Import MENGGANTI seluruh daftar alarm di project, bukan menambah. Alarm lama yang');
console.log('tidak ada di daftar ini akan hilang - pakai Export dulu kalau mau menyimpannya.');
console.log('');
console.log('tiga baris pertama yang akan ditulis:');
baru.slice(0, 3).forEach(r => console.log('   ' + cell(r, 15) + '   ' + cell(r, 5)));
warns.filter(w => w.code === 'nb_area_unknown').forEach(w => console.log('\nPERINGATAN: ' + w.message));

if (!write) {
  console.log('');
  console.log('Belum ada yang ditulis. Tambahkan --write kalau sudah cocok.');
  process.exit(0);
}

if (lama !== null) {
  // Nama cadangan bertanggal, dan TIDAK pernah menimpa cadangan yang sudah ada - cadangan yang
  // ketimpa oleh percobaan kedua sama saja dengan tidak punya cadangan.
  const t = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  let bak = target + '.' + t + '.bak', n = 1;
  while (fs.existsSync(bak)) bak = target + '.' + t + '-' + (++n) + '.bak';
  fs.copyFileSync(target, bak);
  console.log('cadangan   : ' + bak);
}
fs.writeFileSync(target, csv.xml, 'utf8');
console.log('DITULIS    : ' + baru.length + ' alarm ke ' + target);
console.log('');
console.log('Cara memasukkannya ke NB-Designer:');
console.log('  1. buka project, menu alarm -> Alarm Setting');
console.log('  2. tombol Export dulu kalau daftar yang sekarang masih mau disimpan');
console.log('  3. tombol Import, pilih berkas di atas');
console.log('  4. OK, lalu simpan project');
