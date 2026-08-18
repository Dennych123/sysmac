// Menulis balik .smc2 - satu-satunya tempat repo ini menyentuh PROGRAM MESIN.
// Yang diuji bukan hasilnya di Studio (itu cuma Studio yang bisa bilang), tapi sifat yang
// kalau rusak menghasilkan container yang tidak bisa dibuka sama sekali:
//   - tiap entri kembali utuh setelah dikemas ulang
//   - jumlah dan urutan entri tidak berubah
//   - yang tidak disentuh tetap byte per byte
const fs = require('fs');
const os = require('os');
const path = require('path');
const { packZip } = require(path.join(__dirname, '..', 'scripts', 'smc2_write.js'));
const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

(async () => {
  const isi = [
    { name: 'a/satu.xml', data: Buffer.from('<x>halo</x>', 'utf8') },
    { name: 'a/dua.txt', data: Buffer.from('[SLWD version=1.0]' + String.fromCharCode(10) + 'baris', 'utf8') },
    { name: 'kosong.bin', data: Buffer.alloc(0) },
    // Non-ASCII dan byte biner: .smc2 memuat keduanya, dan kerusakan encoding di sini muncul
    // sebagai project yang terbuka tapi isinya kacau - jauh lebih sulit dilacak.
    { name: 'unicode.txt', data: Buffer.from('11軸PB_JOG+ ±5mm', 'utf8') },
    { name: 'biner.dat', data: Buffer.from([0, 1, 2, 253, 254, 255, 0, 10, 13]) },
  ];
  const zip = packZip(isi);
  const balik = unzip(zip);
  chk('jumlah entri sama', balik.size === isi.length, balik.size + ' vs ' + isi.length);
  chk('urutan entri dipertahankan', [...balik.keys()].join('|') === isi.map(e => e.name).join('|'),
      [...balik.keys()].join(' '));
  let sama = true, beda = '';
  for (const e of isi) {
    const d = Buffer.from(await inflate(balik.get(e.name)));
    if (!d.equals(e.data)) { sama = false; beda = beda || e.name; }
  }
  chk('tiap entri kembali byte per byte', sama, beda);
  // Berkas kosong itu kasus yang paling sering bikin penulis ZIP rusak diam-diam.
  chk('entri kosong tetap kosong, bukan hilang',
      balik.has('kosong.bin') && Buffer.from(await inflate(balik.get('kosong.bin'))).length === 0);

  // Tanda tangan ZIP: kalau ini salah, pengarsip mana pun menolak sebelum sempat dibaca.
  chk('berawalan PK local header', zip.readUInt32LE(0) === 0x04034b50);
  chk('diakhiri EOCD', zip.readUInt32LE(zip.length - 22) === 0x06054b50);

  console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
  process.exit(fail ? 1 : 0);
})();
