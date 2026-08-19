// smc2_section.js - menambah section ladder langsung ke .smc2.
//
// Penjaga utamanya bukan "tidak error" melainkan "bentuknya SAMA dengan tulisan Studio". Rung
// yang bentuknya meleset tetap menghasilkan berkas yang bisa dibuka - section-nya muncul di
// Multiview Explorer dengan rung KOSONG, dan yang tercatat cuma "No instruction in rung". Itu
// kelas kegagalan yang tidak bisa dibedakan dari section yang memang belum diisi.
//
// Rung acuan di bawah disalin dari project mesin sungguhan (P011_ST1_Supply_Feeder /
// AutoRunning rung 1), bukan dikarang - termasuk tiga sifat yang paling gampang salah:
// Ix penghitung global, HL yang TIDAK ikut menghabiskan Ix, dan X/Y/Ix yang dihilangkan
// waktu bernilai 0.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { bangunRung, namaSah, tambahSection } = require(path.join(__dirname, '..', 'scripts', 'smc2_section.js'));

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

// --- bentuk rung SAMA PERSIS dengan tulisan Studio -------------------------------------------
const ACUAN = {
  CLs: [
    { __type: 'LD', Var: 'LB309' },
    { __type: 'LD', Ix: 1, Not: true, Var: 'LB499', X: 1 },
    { __type: 'LD', Ix: 2, Not: true, Var: 'CYCLE_STOP', X: 2 },
    { __type: 'LD', Ix: 3, Var: 'LB400_A', Y: 1 },
    { __type: 'HL', X: 1, Y: 1 },
    { __type: 'HL', X: 2, Y: 1 },
    { __type: 'LD', Ix: 4, Var: 'AUTO_RUN', X: 3 },
    { __type: 'LD', Ix: 5, Not: true, Var: 'LB400_B', X: 4 },
    { __type: 'ST', Ix: 6, Var: 'LB400_A', X: 5 },
  ],
  CMT: 'Start motion process: unit seal auto motion start',
  LRI: 7, RRI: 8,
  VLs: [{ Ix: 9, X: 3 }],
};
const dibuat = JSON.parse(bangunRung({
  cmt: 'Start motion process: unit seal auto motion start',
  seri: ['LB309', '/LB499', '/CYCLE_STOP'],
  seal: ['LB400_A'],
  ekor: ['AUTO_RUN', '/LB400_B'],
  coil: 'LB400_A',
}));
chk('rung latch sama persis dengan tulisan Studio',
    JSON.stringify(dibuat) === JSON.stringify(ACUAN),
    JSON.stringify(dibuat).slice(0, 90));

// Tiga sifat itu diuji sendiri-sendiri juga - kalau perbandingan besar di atas suatu saat
// disesuaikan, yang menjaga sifatnya tetap ada.
chk('HL tidak ikut menghabiskan Ix', dibuat.CLs.every(e => e.__type !== 'HL' || !('Ix' in e)));
chk('Ix/X/Y dihilangkan waktu bernilai 0',
    !('Ix' in dibuat.CLs[0]) && !('X' in dibuat.CLs[0]) && !('Y' in dibuat.CLs[0]));
chk('LRI/RRI/VL melanjutkan penghitung Ix yang sama',
    dibuat.LRI === 7 && dibuat.RRI === 8 && dibuat.VLs[0].Ix === 9);
// Palang penutup cabang ada di TEPI KIRI kolom titik gabung. Digeser satu kolom, gambarnya
// tetap wajar tapi menceritakan rangkaian LAIN dari yang dijalankan mesin.
chk('palang cabang di kolom titik gabung', dibuat.VLs[0].X === 3);

// rung seri polos: tidak boleh ada VLs sama sekali
const polos = JSON.parse(bangunRung({ cmt: 'seri', seri: ['A', '/B'], coil: 'C' }));
chk('rung tanpa cabang tidak punya VLs', polos.VLs.length === 0);
chk('rung tanpa cabang tidak punya HL', polos.CLs.every(e => e.__type !== 'HL'));

// --- nama section: aturan diambil dari pesan Studio -----------------------------------------
// Nama yang ditolak baru ketahuan SETELAH project dibuka, dan saat itu berkasnya sudah ditulis.
[['CE_Refill', null], ['Main_Out', null], ['A1', null],
 ['_PRB1', 'diawali'], ['1Refill', 'diawali'], ['P_Refill', 'P_'],
 ['Refill_', 'diakhiri'], ['CE__Refill', 'dua garis bawah'], ['CE Refill', 'huruf, angka']]
  .forEach(([n, harus]) => {
    const r = namaSah(n);
    chk('nama "' + n + '" ' + (harus ? 'ditolak' : 'diterima'),
        harus ? !!(r && r.indexOf(harus) >= 0) : r === null, r || '');
  });

// --- ke .smc2 sungguhan (fixture) ------------------------------------------------------------
const FIX = path.join(__dirname, '..', 'reader', 'tests', 'fixtures', 'synthetic.smc2');
(async () => {
  if (fs.existsSync(FIX)) {
    const buf = fs.readFileSync(FIX);
    const { buf: keluar, entries } = await tambahSection(buf, {
      program: 'P000_Main',
      sections: [{
        name: 'CE_Refill',
        rungs: [
          { cmt: 'mode refill dilatch', seri: ['^PB2_REFILL'], seal: ['LB413'], coil: 'LB413' },
          { cmt: 'banding string', seri: ['LB413'], st: 'LB416 := (RecvStringDat = QR_KANBAN);' },
        ],
      }],
    });

    const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
    const files = await unzip(keluar.buffer.slice(keluar.byteOffset, keluar.byteOffset + keluar.byteLength));
    chk('entri bertambah (ladder + artefak compile)', files.size === (await unzip(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))).size + 2,
        files.size + ' entri');

    let oem = '', ladder = null;
    for (const [n, f] of files) {
      const d = Buffer.from(await inflate(f));
      if (n.endsWith('.oem')) oem = d.toString('utf8');
      const s = d.toString('utf8');
      if (s.indexOf('"CMT":"mode refill dilatch"') >= 0) ladder = s;
    }
    chk('section terdaftar di .oem', /name="CE_Refill"/.test(oem));
    chk('kotak inline ST punya entity pasangannya di .oem',
        (oem.match(/subtype="StructuredText"/g) || []).length >= 1);
    // INI penjaga bug yang sudah terbukti: LF menghasilkan section yang muncul tapi rungnya
    // kosong, dan Studio cuma bilang "No instruction in rung".
    chk('berkas ladder berakhiran CRLF, bukan LF', !!ladder && /\}\r\n$/.test(ladder),
        ladder ? JSON.stringify(ladder.slice(-4)) : 'tidak ketemu');
    chk('tiap rung diakhiri CRLF', !!ladder && (ladder.match(/\r\n/g) || []).length === 2);
    chk('berkas ladder diawali BOM', !!ladder && ladder.charCodeAt(0) === 0xFEFF);

    // reader harus bisa membacanya balik - kalau tidak, yang ditulis bukan .smc2 yang sah
    const { readProject } = require(path.join(__dirname, '..', 'reader', 'src', 'smc2.js'));
    const proj = await readProject(keluar, b => require(path.join(__dirname, '..', 'reader', 'src', 'zip.js')).unzip(b));
    const p = proj.programs.find(x => x.name === 'P000_Main');
    const sec = p && p.sections.find(s => s.name === 'CE_Refill');
    chk('reader membaca balik section barunya', !!sec && sec.rungs.length === 2,
        sec ? sec.rungs.length + ' rung' : 'tidak ketemu');

    // nama yang ditolak Studio harus ditolak DI SINI, sebelum apa pun ditulis
    let tolak = null;
    try { await tambahSection(buf, { program: 'P000_Main', sections: [{ name: '_Salah', rungs: [] }] }); }
    catch (e) { tolak = e.message; }
    chk('nama section tidak sah ditolak sebelum menulis', !!tolak && /ditolak Studio/.test(tolak), tolak || '');

    let dobel = null;
    try { await tambahSection(buf, { program: 'P000_Main', sections: [{ name: 'Timers', rungs: [] }] }); }
    catch (e) { dobel = e.message; }
    chk('section yang sudah ada ditolak', !!dobel && /sudah ada/.test(dobel), dobel || '');

    let hantu = null;
    try { await tambahSection(buf, { program: 'P999_Hantu', sections: [{ name: 'X', rungs: [] }] }); }
    catch (e) { hantu = e.message; }
    chk('program yang tidak ada ditolak', !!hantu && /tidak ada di project/.test(hantu), hantu || '');
  } else {
    chk('fixture synthetic.smc2 tidak ada - tes container dilewati', true);
  }

  console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
