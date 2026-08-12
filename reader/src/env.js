// Lapisan tipis yang bikin modul yang sama jalan di BROWSER dan di NODE.
//
// Kenapa perlu: sebelumnya parser .smc2 ditulis DUA KALI - sekali Python buat CLI,
// sekali JavaScript buat viewer. Keduanya lalu drift, dan drift-nya diam: viewer
// berhenti menyalin koordinat X/Y, jadi ladder tidak pernah tergambar sama sekali
// dan semua rung ditandai perkiraan - tanpa satu pun error. Satu sumber, satu
// kebenaran; beda lingkungan cuma ditambal di berkas ini.
//
// Aturan bentuk berkas src/*.js (dipakai semua modul):
//   * cuma deklarasi `function` dan `const` tingkat atas - TANPA import/export
//   * kebutuhan dari modul lain diambil lewat blok `if (typeof require ...)`
//     memakai `var` (hoisted, jadi tetap terlihat di seluruh berkas)
//   * ditutup blok `module.exports` yang dijaga `typeof module`
// Di browser berkas-berkas ini DIGABUNG jadi satu <script> oleh build.js, jadi
// semuanya satu lingkup. Di Node tiap berkas di-`require` biasa.
// Konsekuensinya: nama tingkat atas harus UNIK antar berkas.

// Impor khusus Node dikumpulkan DI SINI, di dalam satu blok berpenjaga - bukan
// disebar di dalam badan fungsi. build.js membuang blok ini waktu menggabung
// berkas buat browser; `require` yang nyempil di tempat lain ikut terbawa ke
// halaman dan bikin halamannya mati.
if (typeof require !== 'undefined') {
  var _zlib = require('zlib');
}

// --- dekompresi ---
// Browser punya DecompressionStream (async), Node punya zlib (sync). Dua-duanya
// dibungkus jadi satu API async supaya pemanggilnya tidak perlu tahu bedanya.
async function inflateRaw(bytes) {
  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('deflate-raw');
    const w = ds.writable.getWriter();
    w.write(bytes); w.close();
    const parts = [];
    const rd = ds.readable.getReader();
    for (;;) {
      const { value, done } = await rd.read();
      if (done) break;
      parts.push(value);
    }
    let n = 0;
    parts.forEach(p => { n += p.length; });
    const out = new Uint8Array(n);
    let at = 0;
    parts.forEach(p => { out.set(p, at); at += p.length; });
    return out;
  }
  return new Uint8Array(_zlib.inflateRawSync(Buffer.from(bytes)));
}

const _dec = new TextDecoder('utf-8');
/** Byte -> teks UTF-8, BOM dibuang. */
function text(bytes) {
  const s = _dec.decode(bytes);
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

/** Lolos-kan teks buat ditempel ke HTML. */
const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

if (typeof module !== 'undefined') module.exports = { inflateRaw, text, esc };
