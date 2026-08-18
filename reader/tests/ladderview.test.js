// Geometri gambar ladder (src/ladder.js) - yang menentukan rung-nya KEBACA atau tidak.
//
// Tiga kegagalan yang semuanya pernah terjadi dan tidak satupun bikin apa pun error:
//
//   1. rung pendek digambar selebar rung penuh (minimum 6 kolom), jadi rung berisi dua kontak
//      pun memaksa rel kanan ke ~1000px dan coil-nya jatuh di luar layar.
//   2. blok fungsi menulis operand pin masukan di LUAR kotaknya, ke kiri. Dengan rel kiri di
//      8px, teks itu jatuh di koordinat NEGATIF - di luar viewBox, jadi terpotong. Yang
//      kelihatan cuma ekornya, dan itu terbaca seperti nama yang salah baca.
//   3. kotak blok fungsi berpin banyak lebih tinggi dari satu baris ladder, jadi pin bawahnya
//      terpotong rung berikutnya.
//
// Semuanya soal ANGKA, jadi diuji sebagai angka - bukan "ada svg-nya".
'use strict';
const path = require('path');
const { ladderHtml, LAD } = require(path.join(__dirname, '..', 'src', 'ladder.js'));

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const ukuran = h => {
  const m = /width="([\d.]+)" height="([\d.]+)"/.exec(h);
  return m ? { w: +m[1], h: +m[2] } : null;
};

// ----------------------------------------------------------------- rung biasa
const pendek = { comment: 'seri', elements: [
  { kind: 'Contact', var: 'LB100', x: 0, y: 0 },
  { kind: 'Contact', var: 'LB101', x: 1, y: 0 },
  { kind: 'Coil', var: 'LB102', x: 2, y: 0 },
] };
const h1 = ladderHtml(pendek);
const u1 = ukuran(h1);
chk('rung tergambar', !!u1, h1.slice(0, 60));
// Batasnya bukan angka cantik: panel rung di viewer berbagi lebar dengan pohon project
// (250px) di layar 1366px, jadi rung 3 elemen yang lebih lebar dari ~700px sudah memaksa
// gulir mendatar untuk sesuatu yang seharusnya muat.
chk('rung pendek tidak melebar sampai butuh gulir mendatar', u1.w < 700, u1.w + 'px');
chk('tinggi rung serapat mungkin tanpa menumpuk',
    u1.h < 110 && u1.h >= 84, u1.h + 'px');

// Nama 2 baris di ATAS simbol (18 + 11) dan komentar 4 baris di BAWAH (22 + 11*3).
// Di bawah 84px, komentar rung ini bertumpuk dengan nama rung berikutnya.
chk('tinggi baris masih memuat nama 2 baris + komentar 4 baris', LAD.RH >= 84, LAD.RH + 'px');

// -------------------------------------------------- tiap elemen bisa diklik
const grup = [...h1.matchAll(/<g class="el" data-var="([^"]*)"/g)].map(m => m[1]);
chk('tiap elemen dibungkus grup yang bisa diklik', grup.length === 3, grup.join(','));
chk('grup membawa nama operandnya', grup.join(',') === 'LB100,LB101,LB102', grup.join(','));
// Tanpa kotak transparan, yang bisa diklik cuma garis setebal 1,6px dan teksnya - meleset
// satu piksel berarti kliknya tidak terjadi.
chk('tiap grup punya kotak sasaran klik', (h1.match(/class="hit"/g) || []).length === 3);
chk('kotak sasaran selebar selnya',
    new RegExp('class="hit"[^>]*width="' + LAD.CW + '"').test(h1));
chk('nama operand tetap tergambar', /class="nm/.test(h1) && h1.includes('LB100'));

// ------------------------------------------------------------- blok fungsi
const fb = { comment: '', elements: [{ kind: 'Function', func: 'AryByteTo', x: 0, y: 0, pins: {
  in: [{ name: 'EN' }, { name: 'In', operand: 'OUT_TO_NL20[0]' },
       { name: 'Size', operand: 'UINT#44' }, { name: 'Order', operand: 'ByteOrder_LOW_HIGH' }],
  out: [{ name: 'ENO' }, { name: 'OutVal', operand: 'LD43' }],
} }] };
const h2 = ladderHtml(fb);
const u2 = ukuran(h2);
chk('rung blok fungsi tergambar', !!u2);
chk('tidak ada koordinat negatif - operand kiri tidak terpotong',
    !/[xy]="-[\d.]/.test(h2), (/[xy]="-[\d.]+"/.exec(h2) || [''])[0]);
chk('operand pin masukan ikut tergambar utuh',
    h2.includes('ByteOrder_LOW_HIGH') && h2.includes('UINT#44'));

// Kotaknya HDR + 4 pin * PINH + 4; rung-nya harus lebih tinggi dari itu, kalau tidak pin
// paling bawah terpotong rung berikutnya.
const tinggiKotak = LAD.HDR + 4 * LAD.PINH + 4;
chk('rung cukup tinggi untuk kotak blok fungsi', u2.h > tinggiKotak,
    u2.h + 'px vs kotak ' + tinggiKotak + 'px');
const rect = /<rect class="fb"[^>]*y="([\d.]+)"[^>]*height="([\d.]+)"/.exec(h2);
chk('kotak blok fungsi utuh di dalam gambar',
    rect && (+rect[1] + +rect[2]) <= u2.h, rect ? (+rect[1] + +rect[2]) + ' <= ' + u2.h : '-');
chk('blok fungsi juga bisa diklik', /<g class="el" data-var="AryByteTo"/.test(h2));

// Operand yang menempel di PIN itu operand penuh, sama seperti kontak - dan justru itu yang
// paling sering ditanya ("angka ini ditulis siapa?"). Sebelumnya cuma kotak FB-nya yang bisa
// diklik, jadi `PD071_CUR` di pin InOut tidak punya jalan ke silang-rujuk sama sekali.
const sasaran = h => [...h.matchAll(/data-var="([^"]*)"/g)].map(m => m[1]);
chk('operand di pin masukan bisa diklik', sasaran(h2).includes('OUT_TO_NL20[0]'), sasaran(h2).join(','));
chk('operand di pin keluaran bisa diklik', sasaran(h2).includes('LD43'), sasaran(h2).join(','));
// Konstanta itu NILAI, bukan variabel: silang-rujuknya selalu kosong, jadi dibuat bisa diklik
// cuma menghasilkan panel kosong yang terbaca seperti fitur rusak.
chk('konstanta ber-# TIDAK dijadikan sasaran klik',
    !sasaran(h2).some(v => v.indexOf('#') >= 0), sasaran(h2).join(','));
// Enum bernama (`ByteOrder_LOW_HIGH`) TETAP sasaran: itu nama, bukan angka - dan di project
// nyata namanya memang muncul di tabel variabel.
chk('enum bernama tetap bisa diklik', sasaran(h2).includes('ByteOrder_LOW_HIGH'));

// ------------------------------------------------- palang cabang DARI DATA, bukan tebakan
// `.smc2` Studio >= 1.66 membawa `VLs`: satu ruas vertikal menyambung baris Y dan Y+1 di tepi
// KIRI kolom X. Sebelum ini palangnya ditebak dari koordinat, dan tebakan itu menaruh titik
// gabung di kolom yang salah - gambarnya tetap tampak wajar, cuma menceritakan rangkaian lain.
const vlineList = svg => (svg.match(/<line class="w"[^>]*>/g) || [])
  .filter(l => { const m = /x1="([\d.]+)"[^>]*x2="([\d.]+)"/.exec(l); return m && m[1] === m[2]; })
  .map(l => +(/x1="([\d.]+)"/.exec(l)[1]));

const cabang = { comment: 'seal', elements: [
  { kind: 'Contact', var: 'LB009', x: 0, y: 0 },
  { kind: 'Contact', var: 'LB019', x: 1, y: 0 },
  { kind: 'Contact', var: 'AIR_SC_CONF', nc: true, x: 2, y: 0 },
  { kind: 'Coil', var: 'AL[3]', x: 3, y: 0 },
  { kind: 'Contact', var: 'LB002', x: 0, y: 1 },
], vlinks: [{ Ix: 1, X: 2, Y: 0 }] };
const h3 = ladderHtml(cabang);
const vs = vlineList(h3);
chk('palang cabang sebanyak yang ada di VLs, tidak lebih', vs.length === 1, vs.join(','));
// Palang di tepi kiri kolom 2. Kalau digeser satu kolom, LB019 ikut masuk ke dalam cabang -
// rangkaian yang tergambar jadi lain sama sekali dari yang dijalankan mesin.
chk('palang berdiri di tepi kolom yang disebut VLs', vs[0] > 200 && vs[0] < 300, String(vs[0]));
// Studio hanya menyimpan palang PENUTUP; pembukanya rel kiri itu sendiri.
chk('cabang menempel ke rel kiri, tidak menggantung',
    /<line class="w" x1="8"/.test(h3), 'tidak ada kabel yang mulai di rel');

const tanpaVL = ladderHtml({ comment: '', elements: cabang.elements, vlinks: [] });
chk('berkas lama tanpa VLs tetap digambar (heuristik lama masih dipakai)',
    /<svg/.test(tanpaVL) && vlineList(tanpaVL).length >= 1,
    vlineList(tanpaVL).length + ' palang');

// ------------------------------------- bentuk data SUNGGUHAN: X/Y dihilangkan kalau 0
// Studio tidak menulis `X`/`Y` yang nilainya 0. Rung di bawah disalin dari project mesin
// (`Prg001_MAIN/Fault` rung "Air source pressure lost") - persis begitu bentuknya:
//   VLs: [{Ix:9,X:3}, {Ix:10,X:4}, {Ix:10,X:4,Y:1}]
// Menuntut X dan Y dua-duanya ada bikin palang baris pertama terbuang DIAM-DIAM, dan yang
// tersisa cuma palang paling kanan: cabangnya tergambar jadi satu kotak besar sampai ujung
// rung. Tidak ada yang error; gambarnya cuma menceritakan rangkaian lain.
const nyata = { comment: 'Air source pressure lost', elements: [
  { kind: 'Contact', var: 'LB009' },                      // x,y hilang = 0,0
  { kind: 'Contact', var: 'SAFE_CONF', x: 1 },
  { kind: 'Contact', var: 'LB019', x: 2 },
  { kind: 'Contact', var: 'LB002', y: 1 },
  { kind: 'HLink', x: 1, y: 1 }, { kind: 'HLink', x: 2, y: 1 },
  { kind: 'Contact', var: 'AIR_SC_CONF', nc: true, x: 3 },
  { kind: 'Contact', var: 'AL[3]', y: 2 },
  { kind: 'HLink', x: 1, y: 2 }, { kind: 'HLink', x: 2, y: 2 }, { kind: 'HLink', x: 3, y: 2 },
  { kind: 'Coil', var: 'AL[3]', x: 4 },
], vlinks: [{ Ix: 9, X: 3 }, { Ix: 10, X: 4 }, { Ix: 10, X: 4, Y: 1 }] };
const hn = ladderHtml(nyata);
const garis = [...hn.matchAll(/<line class="w" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)]
  .map(m => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] }));
const palang = garis.filter(l => l.x1 === l.x2);
chk('palang dengan Y dihilangkan tetap digambar', palang.length === 3,
    palang.map(l => 'x' + l.x1).join(','));
const xPalang = [...new Set(palang.map(l => l.x1))].sort((a, b) => a - b);
chk('palang berdiri di DUA kolom berbeda, bukan satu di ujung', xPalang.length === 2,
    xPalang.join(','));

// Panjang kabel cabang ditentukan ISI barisnya (termasuk HLink pengisi kolom kosong), bukan
// palang yang kebetulan MELINTASINYA. Palang kolom 4 menyambung baris 0-2, jadi dia lewat di
// atas baris 1 - dianggap batas kanan baris 1, cabang pendek itu tergambar sampai ujung rung.
const barisY = [...new Set(garis.filter(l => l.y1 === l.y2).map(l => l.y1))].sort((a, b) => a - b);
const ujung = y => Math.max(...garis.filter(l => l.y1 === l.y2 && l.y1 === y).map(l => l.x2));
chk('baris cabang berhenti di palangnya sendiri, tidak ikut palang yang melintas',
    ujung(barisY[1]) === xPalang[0], ujung(barisY[1]) + ' vs palang ' + xPalang[0]);
chk('baris seal berhenti di palang berikutnya',
    ujung(barisY[2]) === xPalang[1], ujung(barisY[2]) + ' vs palang ' + xPalang[1]);
chk('kedua baris cabang menempel ke rel kiri',
    garis.filter(l => l.y1 === l.y2 && l.x1 === 8).length >= 2);

// ------------------------------- satu baris, DUA potongan yang tidak bersambung
// Disalin dari `Prg001_MAIN/Auto_Main_Loop` rung 2 project mesin: baris 1 memuat seal LB120
// di kolom 0-2 DAN kontak cabang OR (LB089) di kolom 4 - dua potongan terpisah. Diambil
// min-max, keduanya jadi satu kabel panjang yang melintasi ruang kosong di antaranya: kabel
// yang di Studio memang tidak ada, dan yang membacanya mengira dua cabang itu satu jalur.
const duaPotong = { comment: '', elements: [
  { kind: 'Contact', var: 'PB_AUTO_RUN' }, { kind: 'Contact', var: 'LB099', x: 1 },
  { kind: 'Contact', var: 'LB109', x: 2 },
  { kind: 'Contact', var: 'LB120', y: 1 }, { kind: 'HLink', x: 1, y: 1 }, { kind: 'HLink', x: 2, y: 1 },
  { kind: 'Contact', var: 'LB119', x: 3 },
  { kind: 'Contact', var: 'LB121', nc: true, x: 4 },
  { kind: 'Contact', var: 'LB089', nc: true, x: 4, y: 1 },
  { kind: 'Contact', var: 'LB099', nc: true, x: 4, y: 2 },
  { kind: 'Contact', var: 'GSB000', x: 5 },
  { kind: 'Coil', var: 'LB120', x: 6 },
], vlinks: [{ Ix: 12, X: 3 }, { Ix: 13, X: 4 }, { Ix: 13, X: 4, Y: 1 },
            { Ix: 14, X: 5 }, { Ix: 14, X: 5, Y: 1 }] };
const hd = ladderHtml(duaPotong);
const gd = [...hd.matchAll(/<line class="w" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)]
  .map(m => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] }));
const barisY2 = [...new Set(gd.filter(l => l.y1 === l.y2).map(l => l.y1))].sort((a, b) => a - b);
const seg = y => gd.filter(l => l.y1 === l.y2 && l.y1 === y).sort((a, b) => a.x1 - b.x1);
const b1 = seg(barisY2[1]);
// Kabel yang MELINTASI ruang kosong antara potongan pertama dan kedua = bug yang dicari.
const bolong = b1.some(l => l.x1 < 400 && l.x2 > 460);
chk('dua potongan di satu baris tidak disambung jadi satu kabel', !bolong,
    b1.map(l => l.x1.toFixed(0) + '-' + l.x2.toFixed(0)).join(' '));
chk('potongan seal berhenti di palang kolom 3',
    b1.some(l => Math.abs(l.x2 - 374) < 1), b1.map(l => l.x2.toFixed(0)).join(','));
chk('potongan cabang OR berdiri di antara dua palangnya',
    b1.some(l => l.x1 >= 490) && b1.every(l => l.x2 <= 611),
    b1.map(l => l.x1.toFixed(0) + '-' + l.x2.toFixed(0)).join(' '));
// Baris paling bawah cuma punya cabang OR - tidak boleh ikut menempel ke rel kiri.
const b2 = seg(barisY2[2]);
chk('baris yang tidak menyentuh kolom 0 tidak ditarik ke rel',
    b2.every(l => l.x1 > 400), b2.map(l => l.x1.toFixed(0) + '-' + l.x2.toFixed(0)).join(' '));

// ---------------------------------------------------------- kolom melebar HANYA di blok fungsi
const ton = { comment: '', elements: [
  { kind: 'Contact', var: 'MSTR_RDY', x: 0, y: 0 },
  { kind: 'Contact', var: 'AIR_SC_CONF', nc: true, x: 1, y: 0 },
  { kind: 'Function', func: 'TON', var: 'LT012', x: 2, y: 0,
    pins: { in: [{ name: 'In' }, { name: 'PT', operand: 'T#3S' }],
            out: [{ name: 'Q' }, { name: 'ET' }] } },
  { kind: 'Coil', var: 'AL[5]', x: 3, y: 0 },
], vlinks: [] };
const h4 = ladderHtml(ton);
const u4 = ukuran(h4);
chk('nama instance FB tergambar di atas kotaknya', h4.includes('>LT012<'));
chk('operand pin ikut tergambar', h4.includes('T#3S'));
// Dulu SATU lebar kolom dipakai untuk seluruh rung, jadi satu TON melebarkan kolom kontaknya
// juga dan rung 4 kolom jadi ~760px - butuh gulir mendatar untuk rung yang seharusnya muat.
chk('kolom kontak tidak ikut melebar gara-gara satu blok fungsi', u4.w < 620, u4.w + 'px');

// ------------------------------------------- komen PER ELEMEN array (AL[n]/MF[n])
// Teks alarm cuma tinggal di satu tempat di dalam .smc2: medan `EC=` tabel variabel, per
// ELEMEN array. `scripts/nb_sync.js` sudah lama membacanya dari situ. Yang sempat hilang cuma
// pemetaannya ke tabel simbol viewer: kuncinya harus `AL[3]` (nama yang dipakai rung), bukan
// `AL`. Tanpa itu rung yang memegang AL[3] tergambar TANPA komentar sementara Studio
// menampilkannya - terbaca seperti komennya memang tidak ada.
const { setSymbols, VCMT, cmtOf, isGlobal, addrOf } =
  require(path.join(__dirname, '..', 'src', 'symbols.js'));
setSymbols([
  { name: 'AL', type: 'ARRAY[1..100] OF BOOL', address: '%H300.00', group: 'VAR_GLOBAL',
    comment: '', elementComments: { 3: 'AL003_ Air source pressure lost' } },
  { name: 'LB009', type: 'BOOL', address: '', group: 'VAR_GLOBAL', comment: 'Master off confirmed' },
]);
chk('komen elemen array terdaftar dengan nama yang dipakai rung',
    VCMT.get('AL[3]') === 'AL003_ Air source pressure lost', String(VCMT.get('AL[3]')));
chk('komen variabel biasa tetap jalan', VCMT.get('LB009') === 'Master off confirmed');

const hc = ladderHtml({ comment: '', elements: [
  { kind: 'Contact', var: 'LB009' }, { kind: 'Coil', var: 'AL[3]', x: 1 },
], vlinks: [] });
// Komen ARRAY berlaku untuk SEMUA elemennya - itu yang ditampilkan Studio di tiap PL032[12],
// PL032[13], ... Tanpa tingkat kedua ini, seluruh rung lampu/tombol tergambar tanpa komentar
// sementara Studio menampilkannya, dan itu terbaca seperti project yang memang tidak
// berkomentar. Arraynya TIDAK di-expand jadi ratusan entri: ada array 4000 elemen di project
// nyata, dan yang dibutuhkan cuma jawaban buat operand yang dipakai rung.
setSymbols([
  { name: 'PL032', type: 'ARRAY[0..15] OF BOOL', address: '%W483.00', group: 'VAR_GLOBAL',
    comment: 'Auto start condition indication, page 2' },
  { name: 'AL', type: 'ARRAY[1..100] OF BOOL', address: '', group: 'VAR_GLOBAL', comment: '',
    elementComments: { 3: 'AL003_ Air source pressure lost' } },
]);
chk('elemen array tanpa komen sendiri memakai komen ARRAY-nya',
    cmtOf('PL032[12]') === 'Auto start condition indication, page 2', String(cmtOf('PL032[12]')));
chk('komen per elemen tetap menang atas komen array',
    cmtOf('AL[3]') === 'AL003_ Air source pressure lost', String(cmtOf('AL[3]')));
chk('elemen array yang arraynya juga tanpa komen tetap kosong, bukan menebak',
    cmtOf('AL[7]') === '', JSON.stringify(cmtOf('AL[7]')));
chk('operand yang tidak ada di tabel tidak bikin galat', cmtOf('TIDAK_ADA') === '');
const hp = ladderHtml({ comment: '', elements: [
  { kind: 'Contact', var: 'GSB000' }, { kind: 'Coil', var: 'PL032[12]', x: 1 },
], vlinks: [] });
// Komentarnya dipatah per kata, jadi yang diperiksa POTONGANNYA - dan yang paling penting
// potongan TERAKHIR: dulu dipotong di baris ketiga dan "page 2" hilang tanpa tanda apa pun,
// jadi dua lampu yang bedanya cuma nomor halaman terbaca sama persis.
const barisKomen = [...hp.matchAll(/class="cmt"[^>]*>([^<]*)</g)].map(m => m[1]);
chk('komen array tergambar di bawah elemennya', barisKomen.length >= 3, barisKomen.join(' | '));
chk('komen panjang tidak terpotong di tengah', barisKomen.join(' ').includes('page 2'),
    barisKomen.join(' | '));

chk('komen elemen ikut tergambar di bawah simbolnya',
    hc.includes('Air source') && /class="cmt"/.test(hc),
    (hc.match(/class="cmt"[^>]*>([^<]*)/g) || []).join(' ').slice(0, 60));

// ------------------------------------------- warna operand: global & AT ikut ke elemen array
// Studio mewarnai operand menurut ASALNYA, dan itu satu-satunya penanda di layar:
//   hitam  lokal   |   ungu  global   |   merah + stabilo  punya AT (dipetakan ke memori/IO)
// Elemen array MEWARISI dari arraynya. Tanpa pewarisan, `PL031[2]` tergambar hitam seolah
// variabel lokal, padahal `PL031` global ber-AT %W482.00 - operand yang dibaca/ditulis HMI
// tampak seperti bit internal program itu sendiri.
setSymbols([
  { name: 'PL031', type: 'ARRAY[0..15] OF BOOL', address: '%W482.00', group: 'VAR_GLOBAL',
    comment: 'Auto start condition indication, page 1' },
  { name: 'GSB000', type: 'BOOL', address: '', group: 'VAR_GLOBAL',
    comment: 'Equipment design coil, constant ON' },
  { name: 'LB009', type: 'BOOL', address: '', group: '', comment: 'Master off confirmed' },
]);
chk('elemen array mewarisi status global arraynya', isGlobal('PL031[2]') === true);
chk('elemen array mewarisi AT arraynya', addrOf('PL031[2]') === '%W482.00', addrOf('PL031[2]'));
chk('variabel lokal tetap lokal', isGlobal('LB009') === false);
chk('global tanpa AT tidak dianggap ber-AT', addrOf('GSB000') === '');

const hw = ladderHtml({ comment: '', elements: [
  { kind: 'Contact', var: 'GSB000' }, { kind: 'Contact', var: 'LB009', x: 1 },
  { kind: 'Coil', var: 'PL031[2]', x: 2 },
], vlinks: [] });
const kelas = [...hw.matchAll(/class="nm ([a-z]*)"/g)].map(m => m[1] || 'lokal');
chk('global tanpa AT diwarnai ungu (og)', kelas.includes('og'), kelas.join(','));
chk('operand ber-AT diwarnai merah (at)', kelas.includes('at'), kelas.join(','));
chk('operand lokal tidak diwarnai', kelas.includes('lokal'), kelas.join(','));
// Stabilo digambar sendiri: SVG tidak punya background untuk teks.
chk('operand ber-AT dapat stabilo, dan cuma dia',
    (hw.match(/class="hl"/g) || []).length === 1,
    (hw.match(/class="hl"/g) || []).length + ' stabilo');

// ------------------------------------------------------- rung raksasa tetap ditolak
const raksasa = { comment: '', elements: Array.from({ length: 20 }, (_, i) =>
  ({ kind: 'Contact', var: 'X' + i, x: i, y: 0 })) };
chk('rung yang terlalu lebar tetap dilewati, bukan digambar melebar tak terbatas',
    ladderHtml(raksasa) === '');

console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
