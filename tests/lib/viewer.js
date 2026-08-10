// Akses ke logika viewer buat tes.
//
// Dulu fungsi DIPOTONG dari smc2-viewer.html pakai pemindai kurung, karena
// logikanya memang tinggal di dalam berkas HTML itu. Sekarang logikanya ada di
// src/*.js dan smc2-viewer.html cuma hasil build, jadi tes meng-`require`
// langsung - tanpa pemindai, tanpa stub, tanpa nama yang harus didaftar ulang
// tiap ada dependensi baru.
//
// Yang menjaga hasil build-nya sendiri: tests/build.test.js.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const HTML = path.join(ROOT, 'smc2-viewer.html');

const MODULES = ['env', 'xml', 'zip', 'symbols', 'smc2', 'ladder', 'motion', 'graph'];

const ALL = {};
for (const m of MODULES) Object.assign(ALL, require(path.join(ROOT, 'src', m + '.js')));

/**
 * Ambil sekumpulan nama dari src/*.js.
 * `extras` cuma ada demi kecocokan dengan pemanggil lama - sekarang semua nama
 * diperlakukan sama, karena semuanya benar-benar diekspor modulnya.
 */
function load(names, extras) {
  const out = {};
  for (const n of (names || []).concat(extras || [])) {
    if (!(n in ALL)) throw new Error('tidak diekspor src/*.js: ' + n);
    out[n] = ALL[n];
  }
  return out;
}

module.exports = {
  load, all: ALL, MODULES, HTML,
  /** Isi smc2-viewer.html hasil build - dipakai buat mengambil CSS di pratinjau. */
  get src() { return fs.readFileSync(HTML, 'utf8'); },
};
