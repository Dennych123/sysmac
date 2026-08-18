// Tabel simbol project: arti tiap operand, alamat fisiknya, dan mana yang global.
//
// Dipisah jadi modul sendiri karena penggambar ladder DAN penggambar flowchart
// sama-sama butuh: ladder menulis komentar hijau di bawah tiap simbol, flowchart
// memakai komentar IO sebagai label kotaknya. Dulu ini variabel global di dalam
// viewer, jadi tidak bisa dipakai CLI sama sekali.
const VCMT = new Map();     // nama -> komentar
const VADDR = new Map();    // nama -> alamat fisik (AT=...)
const VGLOB = new Set();    // nama yang G=-nya VAR_GLOBAL

/** Isi ulang tabel dari daftar variabel hasil parse. Selalu mengosongkan dulu. */
function setSymbols(vars) {
  VCMT.clear(); VADDR.clear(); VGLOB.clear();
  (vars || []).forEach(v => {
    if (v.comment) VCMT.set(v.name, v.comment);
    if (v.address) VADDR.set(v.name, v.address);
    // Studio mewarnai operand global beda dari yang lokal. Datanya ada di kolom
    // G= tabel SLWD, jadi ikut dipakai daripada mengarang aturan warna sendiri.
    if ((v.group || '').indexOf('GLOBAL') >= 0) VGLOB.add(v.name);
    // Komen PER ELEMEN array didaftar dengan nama yang dipakai rung: `AL[3]`, bukan `AL`.
    // Di sinilah teks alarm tinggal - satu-satunya tempatnya di dalam .smc2 (medan EC=), dan
    // `scripts/nb_sync.js` memang sudah membacanya dari situ. Tanpa baris ini, rung yang
    // memegang AL[3] tergambar TANPA komentar sementara Studio menampilkannya - kelihatan
    // seperti komentarnya memang tidak ada, padahal cuma tidak dipetakan.
    const els = v.elementComments;
    if (els) {
      Object.keys(els).forEach(k => {
        const nama = v.name + '[' + k + ']';
        if (els[k]) VCMT.set(nama, els[k]);
        if (VGLOB.has(v.name)) VGLOB.add(nama);
      });
    }
  });
}

/**
 * Komentar sebuah OPERAND, dengan aturan array-nya.
 *
 * Dua tingkat, dan tingkat keduanya yang sempat hilang:
 *   1. komen per ELEMEN (`AL[3]`) - medan EC= tabel variabel, tempat teks alarm tinggal
 *   2. komen ARRAY-nya (`PL032`) - berlaku untuk SEMUA elemennya, persis seperti yang
 *      ditampilkan Studio di tiap `PL032[12]`, `PL032[13]`, ...
 *
 * Tanpa tingkat kedua, seluruh rung lampu/tombol tergambar tanpa komentar sementara Studio
 * menampilkannya - dan itu terbaca seperti project yang memang tidak berkomentar.
 *
 * Arraynya TIDAK di-expand jadi ratusan entri di tabel simbol: ada array 4000 elemen di
 * project nyata, dan yang dibutuhkan cuma jawaban buat operand yang benar-benar dipakai rung.
 */
function cmtOf(name) {
  if (!name) return '';
  const tepat = VCMT.get(name);
  if (tepat) return tepat;
  const m = /^(.+?)\[[^\]]*\]$/.exec(String(name));
  return (m && VCMT.get(m[1])) || '';
}

/** Nama array dari sebuah operand elemen: `PL031[2]` -> `PL031`. Bukan elemen -> null. */
function arrayBase(name) {
  const m = /^(.+?)\[[^\]]*\]$/.exec(String(name || ''));
  return m ? m[1] : null;
}

/**
 * Operand ini global? Elemen array MEWARISI dari arraynya.
 *
 * Tanpa pewarisan, `PL031[2]` tergambar hitam (seolah variabel lokal) sementara `PL031`
 * ada di tabel global - dan warna itu satu-satunya penanda di layar bahwa sebuah operand
 * dipakai bersama program lain.
 */
function isGlobal(name) {
  if (VGLOB.has(name)) return true;
  const b = arrayBase(name);
  return !!(b && VGLOB.has(b));
}

/** Alamat AT operand, dengan pewarisan yang sama. `PL031[2]` -> alamat `PL031`. */
function addrOf(name) {
  const a = VADDR.get(name);
  if (a) return a;
  const b = arrayBase(name);
  return (b && VADDR.get(b)) || '';
}

if (typeof module !== 'undefined') {
  module.exports = { VCMT, VADDR, VGLOB, setSymbols, cmtOf, isGlobal, addrOf, arrayBase };
}
