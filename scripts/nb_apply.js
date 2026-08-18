// Tempel alarm hasil generate ke project NB-Designer.
//
//   node scripts/nb_apply.js project.json "C:\...\project NB"           lihat dulu, TIDAK menulis
//   node scripts/nb_apply.js project.json "C:\...\project NB" --write   benar-benar menulis
//
// Kenapa ada: alarm NB disimpan sebagai AlarmLib.csv biasa di dalam folder project, jadi 190
// teks alarm tidak perlu diketik ulang satu per satu di NB-Designer. Yang dikerjakan skrip ini
// cuma menaruh berkasnya di tempat yang benar - isinya dibuat generator, sama persis dengan
// yang keluar di browser.
//
// Default TIDAK menulis. Menimpa AlarmLib.csv menghapus alarm yang tidak ada di daftar baru,
// dan itu tidak ketahuan sampai layar NB dibuka. Jadi jalan pertama selalu memperlihatkan apa
// yang akan berubah; --write baru mengerjakannya, dan yang lama disalin dulu ke .bak bertanggal.
'use strict';
const fs = require('fs');
const path = require('path');
const core = require(path.join(__dirname, 'core.js'));

const args = process.argv.slice(2);
const write = args.includes('--write');
const rest = args.filter(a => a !== '--write');
if (rest.length < 2) {
  console.error('pakai: node scripts/nb_apply.js <project.json> <folder project NB> [--write]');
  process.exit(2);
}
const [projPath, nbArg] = rest;

// Folder project NB itu yang MEMUAT berkas .nbp. Orang biasanya menunjuk folder pembungkusnya
// (namanya sering sama persis), jadi kalau .nbp tidak ada di situ, dicari satu tingkat ke dalam.
function findNbDir(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return { err: 'folder tidak ada: ' + dir };
  const nbp = d => fs.readdirSync(d).filter(f => f.toLowerCase().endsWith('.nbp'));
  if (nbp(dir).length) return { dir: dir, nbp: nbp(dir)[0] };
  const subs = fs.readdirSync(dir)
    .filter(f => { try { return fs.statSync(path.join(dir, f)).isDirectory() && f !== 'temp'; } catch (e) { return false; } })
    .map(f => path.join(dir, f))
    .filter(d => nbp(d).length);
  if (subs.length === 1) return { dir: subs[0], nbp: nbp(subs[0])[0] };
  if (subs.length > 1) return { err: 'ada ' + subs.length + ' folder project NB di dalam sini, tunjuk salah satu:\n  ' + subs.join('\n  ') };
  return { err: 'tidak ada berkas .nbp di ' + dir + ' maupun satu tingkat di dalamnya - ini bukan folder project NB-Designer' };
}
const found = findNbDir(path.resolve(nbArg));
if (found.err) { console.error(found.err); process.exit(2); }

let project;
try { project = JSON.parse(fs.readFileSync(projPath, 'utf8')); }
catch (e) { console.error('project JSON tidak terbaca: ' + e.message); process.exit(2); }

const warns = [];
const out = core.generate(project, { onWarn: w => warns.push(w) });
const csv = out.files.find(f => f.name === 'AlarmLib.csv');
if (!csv) {
  console.error('generator tidak menghasilkan AlarmLib.csv - peta HMI kemungkinan dimatikan di project JSON.');
  process.exit(1);
}

const target = path.join(found.dir, 'AlarmLib.csv');
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
console.log('');
console.log('alarm sekarang di project : ' + (lama === null ? '(belum ada AlarmLib.csv)' : lama.length));
console.log('alarm hasil generate      : ' + baru.length
  + '   ' + cell(baru[0], 15) + ' .. ' + cell(baru[baru.length - 1], 15));
if (lama && lama.length > baru.length) {
  console.log('');
  console.log('PERHATIAN: ' + (lama.length - baru.length) + ' baris yang ada sekarang TIDAK punya penggantinya.');
  console.log('           Menimpa berarti alarm itu hilang dari panel. Periksa dulu apakah masih dipakai.');
}
console.log('');
console.log('tiga baris pertama yang akan ditulis:');
baru.slice(0, 3).forEach(r => console.log('   ' + cell(r, 15) + '   ' + cell(r, 5)));
warns.filter(w => w.code === 'nb_area_unknown').forEach(w => console.log('\nPERINGATAN: ' + w.message));

if (!write) {
  console.log('');
  console.log('Belum ada yang ditulis. Tambahkan --write kalau sudah cocok.');
  console.log('Tutup NB-Designer dulu: dia memuat AlarmLib.csv waktu project dibuka dan');
  console.log('menulisnya lagi waktu disimpan, jadi perubahan bisa ketimpa balik.');
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
console.log('Buka project di NB-Designer, lihat Alarm Library.');
