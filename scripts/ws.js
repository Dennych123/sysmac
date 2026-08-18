// Folder kerja (workspace) - satu-satunya tempat aplikasi lokal boleh membaca dan menulis.
//
// Kenapa ada batas sama sekali, padahal servernya cuma di 127.0.0.1: "baca tulis bebas" berarti
// APA PUN yang jalan di mesin ini - termasuk halaman web lain yang kebetulan terbuka - bisa
// meminta berkas apa pun lewat HTTP, termasuk `tools/opcua/pki/` (kunci privat), kredensial, dan
// project pelanggan di folder lain. Batasnya bukan soal tidak percaya penggunanya; batasnya yang
// membuat "server lokal" tetap alat, bukan pintu terbuka.
//
// Root-nya bisa diganti sesuka hati - lewat env `SUSMAX_WS`, argumen `--ws`, atau dari UI
// (`setRoot`). Yang tidak bisa: keluar dari root yang sedang aktif.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO = path.join(__dirname, '..');

// Folder kerja yang dipilih DIINGAT antar-restart. Tanpa ini, tiap kali server dimatikan
// (atau komputernya di-restart) pilihannya balik ke folder repo - dan yang terjadi berikutnya
// bukan "salah folder" yang kelihatan, melainkan path relatif yang disimpan halaman jadi
// menunjuk berkas yang tidak ada, dengan pesan yang menyalahkan berkasnya.
//
// Disimpan di folder pengguna, bukan di dalam repo: setelan mesin ini bukan bagian dari kode,
// dan berkas setelan di dalam repo ikut muncul di `git status` tiap kali dipakai.
// Lokasinya bisa dialihkan lewat `SUSMAX_SETTINGS` - itu yang dipakai TES. Tanpa itu tes
// menimpa setelan asli penggunanya: folder kerjanya berubah jadi folder temp yang sudah
// dihapus, dan server berikutnya mulai dengan folder kerja yang tidak ada.
const SETELAN = process.env.SUSMAX_SETTINGS ||
                path.join(os.homedir(), '.susmax', 'settings.json');

function bacaSetelan() {
  try { return JSON.parse(fs.readFileSync(SETELAN, 'utf8')); } catch (e) { return {}; }
}

function simpanSetelan(isi) {
  try {
    fs.mkdirSync(path.dirname(SETELAN), { recursive: true });
    fs.writeFileSync(SETELAN, JSON.stringify(isi, null, 2), 'utf8');
  } catch (e) { /* setelan itu kenyamanan - gagal menyimpannya tidak boleh menghentikan apa pun */ }
}

/**
 * Urutannya sengaja: yang DIKETIK saat menjalankan menang atas yang tersimpan.
 *
 *   --ws  >  SUSMAX_WS  >  setelan tersimpan  >  folder repo
 *
 * Kalau yang tersimpan menang, orang yang menjalankan `--ws lain` diam-diam dapat folder lama -
 * dan itu tidak kelihatan sampai ada yang menulis ke tempat yang salah.
 */
function tentukanRoot() {
  const i = process.argv.indexOf('--ws');
  if (i >= 0 && process.argv[i + 1]) return path.resolve(process.argv[i + 1]);
  if (process.env.SUSMAX_WS) return path.resolve(process.env.SUSMAX_WS);
  const simpan = bacaSetelan().root;
  if (simpan) {
    // Folder yang sudah tidak ada TIDAK dipakai: server yang mulai dengan folder kerja
    // menggantung bikin tiap permintaan gagal dengan pesan yang tidak menyebut sebabnya.
    try { if (fs.statSync(simpan).isDirectory()) return path.resolve(simpan); } catch (e) {}
  }
  return REPO;
}

let ROOT = tentukanRoot();

const getRoot = () => ROOT;

function setRoot(dir) {
  const abs = path.resolve(String(dir || ''));
  const st = fs.statSync(abs);                       // melempar kalau tidak ada
  if (!st.isDirectory()) throw new Error('bukan folder: ' + abs);
  ROOT = abs;
  simpanSetelan(Object.assign(bacaSetelan(), { root: abs, saved: new Date().toISOString() }));
  return ROOT;
}

/**
 * Ubah path dari klien jadi path absolut yang DIJAMIN di dalam root.
 *
 * Pemeriksaannya dilakukan SETELAH resolve, bukan dengan menyaring '..' di teksnya: penyaringan
 * teks selalu bisa dilewati (`..%2f`, `....//`, symlink), sedangkan hasil resolve tidak bisa
 * berbohong soal di mana berkasnya benar-benar berada.
 *
 * `realpath` dipakai kalau berkasnya ada - symlink di dalam root yang menunjuk keluar root itu
 * jalan keluar yang paling gampang terlewat.
 */
function amanPath(p) {
  const abs = path.resolve(ROOT, String(p || ''));
  let cek = abs;
  try { cek = fs.realpathSync(abs); } catch (e) { /* belum ada - dicek dari path resolve saja */ }
  let akar = ROOT;
  try { akar = fs.realpathSync(ROOT); } catch (e) { /* biarkan apa adanya */ }
  const rel = path.relative(akar, cek);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('di luar folder kerja: ' + p + '   (folder kerja sekarang: ' + ROOT + ')');
  }
  return abs;
}

/** Daftar isi folder, sudah diurut: folder dulu, lalu berkas. */
function list(rel) {
  const dir = amanPath(rel || '.');
  const out = [];
  for (const nama of fs.readdirSync(dir)) {
    let st;
    try { st = fs.statSync(path.join(dir, nama)); } catch (e) { continue; }
    out.push({
      name: nama,
      dir: st.isDirectory(),
      size: st.isDirectory() ? 0 : st.size,
      mtime: st.mtimeMs,
    });
  }
  out.sort((a, b) => (a.dir === b.dir ? a.name.localeCompare(b.name) : (a.dir ? -1 : 1)));
  return { root: ROOT, dir: path.relative(ROOT, dir) || '.', entries: out };
}

const MAX_BACA = 8 * 1024 * 1024;

function baca(rel) {
  const f = amanPath(rel);
  const st = fs.statSync(f);
  if (st.size > MAX_BACA) throw new Error('terlalu besar (' + st.size + ' byte)');
  return fs.readFileSync(f, 'utf8');
}

/** Isi mentah - buat `.smc2` dan berkas biner lain. */
function bacaBiner(rel) {
  const f = amanPath(rel);
  return fs.readFileSync(f);
}

/**
 * Tulis berkas teks. Yang lama SELALU dicadangkan dulu ke `.bak` bertanggal.
 *
 * Cadangan tidak pernah menimpa cadangan sebelumnya: yang menimpa berkas dua kali berturut-turut
 * kehilangan versi aslinya justru di cadangan yang dibuat untuk menyelamatkannya.
 */
function tulis(rel, isi) {
  const f = amanPath(rel);
  let backup = null;
  if (fs.existsSync(f)) {
    const cap = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    backup = f + '.' + cap + '.bak';
    let n = 0;
    while (fs.existsSync(backup)) backup = f + '.' + cap + '-' + (++n) + '.bak';
    fs.copyFileSync(f, backup);
  }
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, String(isi), 'utf8');
  return { path: path.relative(ROOT, f), bytes: Buffer.byteLength(String(isi)), backup:
    backup ? path.relative(ROOT, backup) : null };
}

/** Cari berkas menurut pola sederhana (mis. `*.smc2`), rekursif tapi berbatas. */
function cari(pola, maks) {
  const re = new RegExp('^' + String(pola || '*').replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
  const hasil = [];
  const batas = maks || 200;
  // Folder yang isinya ribuan berkas hasil build atau dependensi tidak pernah jadi jawaban yang
  // dicari, dan menelusurinya bikin permintaan yang seharusnya seketika jadi berdetik-detik.
  const lewati = new Set(['node_modules', '.git', 'outputs', 'pki']);
  (function jalan(dir, dalam) {
    if (hasil.length >= batas || dalam > 6) return;
    let isi = [];
    try { isi = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const d of isi) {
      if (hasil.length >= batas) return;
      if (d.isDirectory()) {
        if (lewati.has(d.name)) continue;
        jalan(path.join(dir, d.name), dalam + 1);
      } else if (re.test(d.name)) {
        hasil.push(path.relative(ROOT, path.join(dir, d.name)));
      }
    }
  })(ROOT, 0);
  return hasil;
}

module.exports = { REPO, SETELAN, getRoot, setRoot, amanPath, list, baca, bacaBiner, tulis, cari };
