// Komen alarm dari Sysmac (.smc2) langsung ke project NB-Designer (.nbp).
//
//   node scripts/nb_sync.js <project.smc2> <project.nbp>           lihat dulu, TIDAK menulis
//   node scripts/nb_sync.js <project.smc2> <project.nbp> --write   benar-benar menulis
//
// Kenapa langsung ke .nbp, bukan lewat Export/Import: itu enam klik tiap kali satu komen
// diubah, dan yang enam klik tiap kali akhirnya tidak dikerjakan. Alarm NB tersimpan di dalam
// .nbp sebagai elemen <AlarmObject>, dan .nbp itu XML polos - jadi teksnya bisa diganti di
// tempat, tanpa NB-Designer.
//
// Arahnya SATU: PLC yang jadi acuan, NB yang ikut. Teks DAN alamat diambil dari .smc2, karena
// alamat alarm ditentukan tabel variabel PLC - NB cuma membacanya. Menyamakan dengan mengubah
// sisi PLC berarti menyesuaikan mesin ke layar, terbalik.
//
// Dicocokkan lewat NAMA ELEMEN (AL[3]) yang ditulis di depan teks alarm, bukan lewat alamat:
// alamatnya justru yang sedang diganti. Konvensi itu memang sudah dipakai project NB aslinya,
// dan teks hasil sinkron ditulis ulang dengan penanda yang sama supaya sambungannya bertahan.
// Alarm NB yang tidak punya penanda dibiarkan dan dihitung, tidak ditebak berdasarkan urutan.
'use strict';
const fs = require('fs');
const path = require('path');
const { unzip } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
const { readProject } = require(path.join(__dirname, '..', 'reader', 'src', 'smc2.js'));
const { findNbProject } = require(path.join(__dirname, 'nb_common.js'));

const args = process.argv.slice(2);
const write = args.includes('--write');
const rest = args.filter(a => a !== '--write');
if (rest.length < 2) {
  console.error('pakai: node scripts/nb_sync.js <project.smc2> <project.nbp> [--write]');
  process.exit(2);
}
const [smcPath, nbArg] = rest;
// Boleh menunjuk berkas .nbp atau folder project - yang ditunjuk orang biasanya foldernya.
const found = findNbProject(nbArg);
if (found.err) { console.error(found.err); process.exit(2); }
const nbpPath = found.nbpPath;

// ---- sisi Sysmac: tabel variabel .smc2 ----------------------------------------------------
// Bentuknya bukan XML melainkan teks berbaris "[SLWD version=1.0]", satu variabel satu baris:
//   ++D=ARRAY[1..100] OF BOOL<TAB>N=AL<TAB>AT=%W400.00<TAB>G=VAR_GLOBAL<TAB>EC=<ECs>...
// Komen per elemen ada di dalam EC=, sebagai <EC EK="[11]" C="..." />.
// Pembacaan .smc2 dikerjakan reader/, bukan diulang di sini. Parser .smc2 pernah ditulis dua
// kali di repo ini dan diam-diam drift; komen elemen sekarang jadi bagian dari readProject().
async function bacaSmc(buf) {
  const p = await readProject(buf, unzip);
  const out = [];
  const tanpaKomen = [];
  (p.variables || []).forEach(v => {
    const at0 = /^%[A-Z]+\d+\.\d+$/.test(v.address || '');
    // Array ber-AT tapi komen elemennya kosong: bukan dilewatkan diam-diam, dilaporkan. Di
    // .smc2 uji, MF punya AT %H320.00 tapi nol komen - kalau tidak disebut, orang mengira
    // MF-nya gagal disinkronkan padahal memang belum ada teksnya.
    if (at0 && !v.elementComments && /^(AL|MF)$/.test(v.name)) tanpaKomen.push(v.name + ' @' + v.address);
    if (!v.elementComments) return;
    const m = /^%([A-Z]+)(\d+)\.(\d+)$/.exec(v.address || '');
    if (!m) return;   // tanpa AT tidak ada alamat buat dicocokkan ke NB
    out.push({ nama: v.name, area: m[1], word: +m[2], bit: +m[3], els: v.elementComments });
  });
  out.tanpaKomen = tanpaKomen;
  return out;
}
// ---- sisi NB: <AlarmObject> di .nbp --------------------------------------------------------
// Yang diganti HANYA teks di dalam <Font ...>...</Font>. Sisanya - font, warna, alamat, id -
// tidak disentuh sama sekali: .nbp itu seluruh project HMI, dan yang tidak dimengerti tidak
// boleh ditulis ulang.
const RE_OBJ = /<AlarmObject\b[\s\S]*?<\/AlarmObject>/g;
const RE_ADDR = /<AddressValue\b[^>]*>(\d+)\.(\d+)<\/AddressValue>/;
const RE_TEXT = /(<Font\b[^>]*>)([\s\S]*?)(<\/Font>)/;
function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

(async function main() {
  let smcBuf, nbp;
  try { smcBuf = fs.readFileSync(smcPath); } catch (e) { console.error('.smc2 tidak terbaca: ' + e.message); process.exit(2); }
  try { nbp = fs.readFileSync(nbpPath, 'utf8'); } catch (e) { console.error('.nbp tidak terbaca: ' + e.message); process.exit(2); }
  if (nbp.indexOf('<AlarmObject') < 0) {
    console.error('tidak ada satu pun <AlarmObject> di ' + nbpPath + ' - ini bukan project NB-Designer, atau alarmnya belum pernah dibuat.');
    process.exit(2);
  }

  const arrays = await bacaSmc(smcBuf);
  if (!arrays.length) {
    console.error('tidak ada array ber-komen-elemen yang punya AT di .smc2 - tidak ada yang bisa disinkronkan.');
    process.exit(1);
  }
  // Kunci pencocokan NAMA ELEMEN (AL[3]), bukan alamat. Alamatnya justru yang mau diganti:
  // PLC yang jadi acuan, NB yang ikut. Nama elemen ditulis di depan teks alarm - itu memang
  // konvensi project NB aslinya ("AL[1]Emergency stop..."), dan gunanya persis ini: jadi
  // sambungan yang bertahan walau alamat maupun teksnya berubah.
  const peta = {};
  arrays.forEach(a => {
    Object.keys(a.els).forEach(k => {
      const i = +k - 1;
      peta[a.nama + '[' + k + ']'] = {
        addr: (a.word + Math.floor(i / 16)) + '.' + String(i % 16).padStart(2, '0'),
        teks: a.els[k], area: a.area
      };
    });
  });
  console.log('.smc2 : ' + arrays.map(a => a.nama + ' ' + Object.keys(a.els).length + ' komen @%' + a.area + a.word + '.' + String(a.bit).padStart(2, '0')).join('   '));
  (arrays.tanpaKomen || []).forEach(x => console.log('        ' + x + ' punya alamat tapi BELUM ada komen elemennya - dilewati'));

  let cocok = 0, ubahTeks = 0, pindahAlamat = 0, takKetemu = 0;
  const contoh = [], sudah = {};
  const baru = nbp.replace(RE_OBJ, blok => {
    const tm = RE_TEXT.exec(blok);
    if (!tm) return blok;
    // Nama elemen dibaca dari depan teks alarm yang sekarang - satu-satunya penanda yang
    // bertahan justru ketika alamatnya yang sedang diganti.
    const km = /^(AL|MF)\[(\d+)\]/.exec(tm[2]);
    const kunci = km ? km[1] + '[' + km[2] + ']' : null;
    const d = kunci && peta[kunci];
    if (!d) { takKetemu++; return blok; }
    cocok++; sudah[kunci] = 1;
    const am = RE_ADDR.exec(blok);
    const alamatLama = am ? am[1] + '.' + am[2] : '?';
    // Teks ditulis ulang DENGAN penanda di depannya. Tanpa itu, sekali sinkron sambungannya
    // putus dan sinkron berikutnya tidak menemukan apa pun.
    const teksBaru = escXml(kunci + d.teks);
    let hasil = blok;
    if (am && alamatLama !== d.addr) {
      pindahAlamat++;
      hasil = hasil.replace(RE_ADDR, m0 => m0.replace(alamatLama, d.addr));
    }
    if (tm[2] !== teksBaru) {
      ubahTeks++;
      hasil = hasil.replace(RE_TEXT, (_, x, __, z) => x + teksBaru + z);
    }
    // Contohnya dikumpulkan SEMUA dulu, dipilih belakangan. Diambil enam pertama menurut
    // urutan berkas, yang tampil justru deretan Spare - urutan <AlarmObject> di .nbp tidak
    // ada hubungannya dengan urutan yang menarik buat dibaca.
    if (hasil !== blok) {
      contoh.push({ kunci, dari: alamatLama, ke: d.addr,
                    teksLama: tm[2], teksBaru: kunci + d.teks });
    }
    return hasil;
  });
  const belumAda = Object.keys(peta).filter(k => !sudah[k]);

  const total = (nbp.match(RE_OBJ) || []).length;
  // Area diambil dari <AlarmObject> saja. Diambil dari seluruh berkas, yang kena justru
  // AddressType pertama milik screen - di project uji itu 'LB', dan laporannya jadi bohong.
  const objPertama = (nbp.match(RE_OBJ) || [])[0] || '';
  const areaNb = (/<AddressType[^>]*>([^<]+)<\/AddressType>/.exec(objPertama) || [])[1] || '?';
  console.log('.nbp  : ' + found.nbp + '   ' + total + ' alarm, area ' + areaNb);
  // Yang dicocokkan cuma ANGKA word.bit, bukan areanya. Nama area di kedua alat memang beda
  // (Sysmac %W400.00, NB H_bit 400.00) dan tidak ada peta resmi antara keduanya, jadi menebak
  // padanannya lebih berbahaya daripada menyebutkan bedanya dan membiarkan orang memutuskan.
  if (areaNb.toUpperCase().indexOf(arrays[0].area) < 0) {
    console.log('');
    console.log('CATATAN: area di kedua sisi beda - Sysmac %' + arrays[0].area + ', NB ' + areaNb + '.');
    console.log('         Yang dicocokkan cuma angka word.bit. Pastikan dua area itu memang menunjuk');
    console.log('         memori yang sama sebelum --write.');
  }
  console.log('');
  console.log('alamatnya ketemu di .smc2 : ' + cocok);
  console.log('tidak ada di .smc2        : ' + takKetemu + (takKetemu ? '   (dibiarkan apa adanya)' : ''));
  console.log('teks yang berubah         : ' + ubahTeks);
  console.log('alamat yang dipindah      : ' + pindahAlamat + '   (NB ikut PLC, bukan sebaliknya)');
  if (belumAda.length) console.log('ada di .smc2 tapi belum ada alarmnya di NB : ' + belumAda.length
    + '   (' + belumAda.slice(0, 4).join(' ') + (belumAda.length > 4 ? ' ...' : '') + ')');
  // Yang teksnya berubah didahulukan: itu yang perlu dibaca orang. Yang cuma pindah alamat
  // cukup satu baris - mencetak teks lama dan baru yang sama persis bikin bingung.
  if (contoh.length) {
    console.log('');
    const urut = contoh.slice().sort((x, y) =>
      (y.teksLama !== y.teksBaru ? 1 : 0) - (x.teksLama !== x.teksBaru ? 1 : 0));
    urut.slice(0, 6).forEach(c => {
      console.log('  ' + c.kunci + '   ' + c.dari + ' -> ' + c.ke
        + (c.teksLama === c.teksBaru ? '   (teks tetap)' : ''));
      if (c.teksLama !== c.teksBaru) {
        console.log('      lama: ' + c.teksLama);
        console.log('      baru: ' + c.teksBaru);
      }
    });
    if (contoh.length > 6) console.log('  ... ' + (contoh.length - 6) + ' lagi');
  }
  if (!cocok) {
    // Nol cocok hampir selalu berarti base word-nya beda, bukan berkasnya salah. Yang
    // berguna bukan 'tidak ketemu' melainkan ANGKA yang bikin ketemu, jadi jangkauan
    // alamat kedua sisi dicetak berikut base yang seharusnya dipakai.
    const wordNb = [...nbp.matchAll(/<AddressValue\b[^>]*>(\d+)\.\d+<\/AddressValue>/g)]
                     .map(m => +m[1]).sort((x, y) => x - y);
    console.log('');
    console.log('TIDAK ADA yang cocok - base word-nya beda, bukan berkasnya yang salah.');
    console.log('  NB     : word ' + wordNb[0] + ' .. ' + wordNb[wordNb.length - 1]);
    arrays.forEach(a => {
      const akhir = a.word + Math.floor((Math.max.apply(null, Object.keys(a.els).map(Number)) - 1) / 16);
      console.log('  Sysmac : ' + a.nama + ' word ' + a.word + ' .. ' + akhir);
    });
    console.log('');
    console.log('Samakan salah satu sisi. Yang biasanya benar: setel base di panel HMI ke angka NB,');
    console.log('generate ulang, import lagi ke Sysmac - PLC dan NB ikut bergeser bersamaan.');
    console.log('  ' + arrays.map(a => a.nama.toLowerCase() + 'Base = ' + wordNb[0]).join('   '));
  }

  if (!write) {
    console.log('');
    console.log('Belum ada yang ditulis. Tambahkan --write kalau sudah cocok.');
    console.log('Tutup NB-Designer dulu - .nbp yang sedang dibuka akan ditimpa balik waktu disimpan.');
    return;
  }
  if (!ubah) { console.log('\nTidak ada yang perlu diubah.'); return; }
  // .nbp itu SELURUH project HMI - layar, tag, setelan. Cadangan wajib, dan tidak boleh
  // menimpa cadangan sebelumnya.
  const t = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  let bak = nbpPath + '.' + t + '.bak', n = 1;
  while (fs.existsSync(bak)) bak = nbpPath + '.' + t + '-' + (++n) + '.bak';
  fs.copyFileSync(nbpPath, bak);
  fs.writeFileSync(nbpPath, baru, 'utf8');
  console.log('\ncadangan : ' + bak);
  console.log('DITULIS  : ' + ubahTeks + ' teks, ' + pindahAlamat + ' alamat di ' + nbpPath);
})().catch(e => { console.error(e.message); process.exit(1); });
