// Pembaca ZIP tanpa library. `.smc2` itu container ZIP biasa, jadi isinya bisa
// dibuka dari luar tanpa Sysmac Studio - itu premis seluruh alat ini.
//
// Dibaca manual (bukan pakai pustaka) supaya viewer tetap SATU berkas HTML yang
// jalan offline dari file://, tanpa server dan tanpa unduhan apa pun.
if (typeof require !== 'undefined') {
  var { inflateRaw } = require('./env.js');
}

/**
 * ArrayBuffer/Uint8Array -> Map<nama, {method, raw}>.
 * Entri direktori (nama berakhiran '/') dibuang.
 */
function unzip(buf) {
  if (buf instanceof Uint8Array) {
    buf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  const dv = new DataView(buf), u8 = new Uint8Array(buf);

  // End of Central Directory dicari MUNDUR dari ekor: komentar ZIP panjangnya
  // bebas (maks 65535), jadi posisinya tidak tetap.
  let eo = -1;
  for (let i = buf.byteLength - 22; i >= 0 && i > buf.byteLength - 65558; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eo = i; break; }
  }
  if (eo < 0) throw new Error('Bukan file ZIP yang valid (EOCD tidak ketemu).');

  const count = dv.getUint16(eo + 10, true);
  let p = dv.getUint32(eo + 16, true);

  const files = new Map();
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true);
    const elen = dv.getUint16(p + 30, true);
    const clen = dv.getUint16(p + 32, true);
    const off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + elen + clen;
    if (name.endsWith('/')) continue;
    // Header lokal dibaca ulang: panjang nama & extra di sana BISA beda dengan
    // yang di central directory, jadi offset datanya harus dihitung dari sana.
    const ln = dv.getUint16(off + 26, true), le = dv.getUint16(off + 28, true);
    const start = off + 30 + ln + le;
    files.set(name, { method, raw: u8.subarray(start, start + csize) });
  }
  return files;
}

/** Entri ZIP -> byte isinya. */
async function inflate(f) {
  if (f.method === 0) return f.raw;                    // stored
  if (f.method !== 8) throw new Error('metode kompresi ' + f.method + ' tidak didukung');
  return inflateRaw(f.raw);
}

if (typeof module !== 'undefined') module.exports = { unzip, inflate };
