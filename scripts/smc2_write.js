// Menulis balik .smc2 - HATI-HATI, ini program mesin.
//
// Container .smc2 itu ZIP biasa berisi XML dan berkas teks. Membacanya sudah lama bisa
// (reader/). Menulisnya BELUM PERNAH terbukti, jadi modul ini sengaja sempit: dia cuma
// mengganti isi beberapa entri dan mengemas ulang SEMUA entri lain apa adanya, byte per byte.
//
// Yang TIDAK dilakukan di sini, dan jangan ditambahkan tanpa bukti: menyentuh rung. Reader
// cuma menerjemahkan ~54% rung dengan eksak; menulis rung yang "kira-kira benar" menghasilkan
// program yang ter-import mulus dan salah waktu mesin bergerak.
'use strict';
const zlib = require('zlib');

// CRC32 - ZIP menyimpannya per entri, dan pengarsip mana pun menolak berkas yang CRC-nya salah.
let TBL = null;
function crc32(buf) {
  if (!TBL) {
    TBL = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      TBL[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TBL[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/**
 * entries: [{ name, data (Buffer) }] dalam URUTAN ASLINYA.
 * Semua di-deflate. Urutan dipertahankan: beberapa alat membaca ZIP secara berurutan dan
 * urutan yang diacak bisa mengubah arti walau isinya sama.
 */
function packZip(entries) {
  const lokal = [], pusat = [];
  let ofs = 0;
  for (const e of entries) {
    const raw = e.data;
    const comp = zlib.deflateRawSync(raw, { level: 9 });
    const nama = Buffer.from(e.name, 'utf8');
    const crc = crc32(raw);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8);                       // deflate
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(raw.length, 22);
    lh.writeUInt16LE(nama.length, 26); lh.writeUInt16LE(0, 28);
    lokal.push(lh, nama, comp);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8); ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(raw.length, 24);
    ch.writeUInt16LE(nama.length, 28);
    ch.writeUInt32LE(ofs, 42);
    pusat.push(ch, nama);
    ofs += 30 + nama.length + comp.length;
  }
  const isiPusat = Buffer.concat(pusat);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(isiPusat.length, 12); eocd.writeUInt32LE(ofs, 16);
  return Buffer.concat([Buffer.concat(lokal), isiPusat, eocd]);
}

module.exports = { packZip, crc32 };
