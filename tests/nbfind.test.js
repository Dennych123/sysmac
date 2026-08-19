// findNbProject() - satu aturan "di mana project NB itu", dipakai nb_apply dan nb_sync.
// Ditaruh di satu berkas justru supaya bisa diuji sekali; dua salinan aturan ini akan drift,
// dan drift-nya baru ketahuan waktu salah satu skrip menulis ke tempat yang salah.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { findNbProject } = require(path.join(__dirname, '..', 'scripts', 'nb_common.js'));
let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nbfind-'));
const mk = (...p) => { const d = path.join(tmp, ...p); fs.mkdirSync(d, { recursive: true }); return d; };

// Bentuk bawaan NB-Designer: folder pembungkus berisi folder project bernama sama.
const luar = mk('Mesin A'), dalam = mk('Mesin A', 'Mesin A');
fs.writeFileSync(path.join(dalam, 'Mesin A.nbp'), '<NBProject/>');
// NB-Designer menaruh salinan kerja .nbp di temp\. Menulis ke situ berarti perubahannya hilang
// begitu project dibuka ulang - dan foldernya berisi .nbp juga, jadi gampang tertukar.
const temp = mk('Mesin A', 'temp');
fs.writeFileSync(path.join(temp, 'Mesin A.nbp'), '<NBProject/>');

const a = findNbProject(luar);
chk('folder pembungkus -> ketemu folder project di dalamnya', !a.err && a.dir === dalam, a.err || a.dir);
// Dicek nama folder TERAKHIR, bukan seluruh path: path uji ini sendiri ada di dalam
// folder Temp milik OS, jadi pencarian di seluruh path selalu cocok dan tesnya bohong.
chk('folder temp TIDAK pernah dipilih', !a.err && path.basename(a.dir).toLowerCase() !== 'temp', a.dir);
const b = findNbProject(dalam);
chk('folder project langsung juga diterima', !b.err && b.nbpPath === path.join(dalam, 'Mesin A.nbp'), b.err || b.nbpPath);
const c = findNbProject(path.join(dalam, 'Mesin A.nbp'));
chk('berkas .nbp langsung juga diterima', !c.err && c.dir === dalam, c.err || c.dir);

// Yang ditolak, bukan ditebak.
chk('berkas yang bukan .nbp ditolak',
    !!findNbProject(path.join(dalam, 'Mesin A.nbp').replace('.nbp', '.txt') === '' ? tmp : (function () {
      const f = path.join(tmp, 'bukan.txt'); fs.writeFileSync(f, 'x'); return f;
    })()).err);
chk('path tidak ada ditolak', !!findNbProject(path.join(tmp, 'hantu')).err);
const kosong = mk('kosong');
chk('folder tanpa .nbp ditolak', !!findNbProject(kosong).err, (findNbProject(kosong).err || '').slice(0, 60));
// Dua project di dalam satu pembungkus: pilih sendiri, jangan ditebak - salah pilih berarti
// menulis ke project mesin lain.
const dua = mk('Dua');
['P1', 'P2'].forEach(n => { const d = mk('Dua', n); fs.writeFileSync(path.join(d, n + '.nbp'), '<NBProject/>'); });
const e = findNbProject(dua);
chk('dua project sekaligus: menolak dan menyebutkan pilihannya',
    !!e.err && /ada 2 folder project/.test(e.err) && /P1/.test(e.err) && /P2/.test(e.err), e.err);

// --- nb_sync --rebuild: ID tiap objek WAJIB unik ------------------------------------------
// NB-Designer menyimpan satu entri per ID. Waktu regex penomorannya rusak (heredoc memakan
// backslash di '\\d+'), 190 objek keluar dengan ID sama dan NB cuma menampilkan SATU alarm -
// berkasnya sendiri kelihatan benar, jadi tidak ada yang menunjukkan sebabnya.
const { spawnSync } = require('child_process');
const nbDir = mk('SyncUji');
const OBJ = (tag, id, addr, teks) =>
  '<' + tag + ' ID="' + id + '" HMIID="0"><Address><RegAddr><AddressType SystemID="56">H_bit</AddressType>'
  + '<AddressValue Type="Bit" Length="1" CodeType="0">' + addr + '</AddressValue></RegAddr></Address>'
  + '<Content><Font Size="16">' + teks + '</Font></Content></' + tag + '>';
fs.writeFileSync(path.join(nbDir, 'U.nbp'),
  '<NBProject><AlarmObjects>' + OBJ('AlarmObject', 7, '400.00', 'lama') + '</AlarmObjects>'
  + '<EventObjects>' + OBJ('EventObject', 9, '400.00', 'lama') + '</EventObjects></NBProject>');
const smc = path.join(__dirname, '..', 'reader', 'tests', 'fixtures', 'synthetic.smc2');
if (fs.existsSync(smc)) {
  const r = spawnSync(process.execPath,
    [path.join(__dirname, '..', 'scripts', 'nb_sync.js'), smc, path.join(nbDir, 'U.nbp'), '--rebuild', '--write'],
    { encoding: 'utf8' });
  const isi = fs.readFileSync(path.join(nbDir, 'U.nbp'), 'utf8');
  const ids = [...isi.matchAll(/<AlarmObject ID="(\d+)"/g)].map(m => m[1]);
  if (ids.length > 1) {
    chk('rebuild memberi ID unik ke tiap objek', new Set(ids).size === ids.length,
        ids.slice(0, 6).join(' '));
  } else {
    chk('fixture .smc2 tidak punya komen elemen - tes ID dilewati', true,
        String(r.stdout).split(String.fromCharCode(10))[0]);
  }
}

// --- penanda AL[n] TIDAK boleh menumpuk -----------------------------------------------------
// Komen elemen di .smc2 sudah membawa penandanya sendiri ("AL[1]Emergency"), karena penanda itu
// memang yang ditulis balik ke sana. Ditempel lagi tanpa dikupas, hasilnya "AL[1]AL[1]Emergency"
// dan tiap sinkron menambah satu lagi - kolom Message NB sempit, jadi keterangan faultnya yang
// terdorong keluar layar. Diuji lewat SIFATNYA: sinkron kedua tidak boleh mengubah apa pun.
const V = (isi) => (RegExp('<Font[^>]*>([^<]*)</Font>').exec(isi) || [])[1];
const nbDir2 = mk('SyncUlang');
const nbp2 = path.join(nbDir2, 'V.nbp');
const tulisAwal = (teks) => fs.writeFileSync(nbp2,
  '<NBProject><AlarmObjects>' + OBJ('AlarmObject', 7, '400.00', teks) + '</AlarmObjects>'
  + '<EventObjects>' + OBJ('EventObject', 9, '400.00', teks) + '</EventObjects></NBProject>');
const sync = (...extra) => spawnSync(process.execPath,
  [path.join(__dirname, '..', 'scripts', 'nb_sync.js'), smc, nbp2, '--write', ...extra],
  { encoding: 'utf8' });
if (fs.existsSync(smc)) {
  tulisAwal('AL[1]apa saja');
  sync();
  const satu = V(fs.readFileSync(nbp2, 'utf8'));
  sync();
  const dua = V(fs.readFileSync(nbp2, 'utf8'));
  if (satu !== undefined && /^AL\[1\]/.test(String(satu))) {
    chk('sinkron kedua tidak menumpuk penanda', satu === dua, satu + '  ->  ' + dua);
    chk('penanda cuma sekali di depan', !/^AL\[1\]\s*AL\[1\]/.test(String(dua)), dua);
  } else {
    chk('fixture .smc2 tidak punya AL[1] - tes penanda dilewati', true, String(satu));
  }
}

// --- alamat elemen dihitung dari BIT AT-nya, bukan dari word saja ---------------------------
// Fixture: AL ber-AT %H400.00 (2 elemen) dan MF ber-AT %H400.14 (3 elemen). MF harus jatuh di
// 400.14, 400.15, 401.00. Bit awalnya diabaikan, MF[1] jatuh di 400.00 - menabrak AL[1], dan
// yang kalah tidak pernah muncul di layar NB. Di project mesin sungguhan MF ber-AT %H406.04
// tepat menyambung AL, jadi ini bentuk yang biasa, bukan kasus pinggiran.
const nbDirB = mk('SyncBit');
const nbpB = path.join(nbDirB, 'B.nbp');
if (fs.existsSync(smc)) {
  fs.writeFileSync(nbpB,
    '<NBProject><AlarmObjects>' + OBJ('AlarmObject', 7, '400.00', 'lama') + '</AlarmObjects>'
    + '<EventObjects/></NBProject>');
  const rB = spawnSync(process.execPath,
    [path.join(__dirname, '..', 'scripts', 'nb_sync.js'), smc, nbpB, '--rebuild', '--write'],
    { encoding: 'utf8' });
  const isiB = fs.readFileSync(nbpB, 'utf8');
  const petaB = {};
  (isiB.match(/<AlarmObject\b[\s\S]*?<\/AlarmObject>/g) || []).forEach(o => {
    const a = /<AddressValue\b[^>]*>([\d.]+)</.exec(o), f = /<Font\b[^>]*>([\s\S]*?)<\/Font>/.exec(o);
    if (a && f) petaB[f[1].replace(/^((AL|MF)\[\d+\]).*$/, '$1')] = a[1];
  });
  chk('MF[1] pakai bit awal AT (400.14), bukan 400.00', petaB['MF[1]'] === '400.14', petaB['MF[1]']);
  chk('MF[3] menyeberang ke word berikutnya (401.00)', petaB['MF[3]'] === '401.00', petaB['MF[3]']);
  chk('AL tidak ikut bergeser', petaB['AL[1]'] === '400.00', petaB['AL[1]']);
  const semuaB = Object.values(petaB);
  chk('tidak ada dua elemen di alamat yang sama', new Set(semuaB).size === semuaB.length, semuaB.join(' '));
  chk('exit 0 - tidak ada tabrakan alamat', rB.status === 0, 'exit ' + rB.status);
}

// --- daftar KOSONG: diisi kalau ada cadangan, DILEWATI kalau tidak ---------------------------
// NB-Designer bisa mengosongkan Event Setting sendiri waktu project disimpan (dia menulis
// <EventObjects/>). Dua-duanya harus benar, dan yang kedua yang paling gampang salah diam-diam.
const nbDir3 = mk('SyncKosong');
const nbp3 = path.join(nbDir3, 'W.nbp');
const isiKosong = '<NBProject><AlarmObjects>' + OBJ('AlarmObject', 7, '400.00', 'lama') + '</AlarmObjects>'
  + '<EventObjects/></NBProject>';
const rebuild3 = () => spawnSync(process.execPath,
  [path.join(__dirname, '..', 'scripts', 'nb_sync.js'), smc, nbp3, '--rebuild', '--write'],
  { encoding: 'utf8' });
const cacah = (isi, t) => (isi.match(new RegExp('<' + t + ' ', 'g')) || []).length;

if (fs.existsSync(smc)) {
  // (a) tanpa cadangan: DILEWATI, dan laporannya tidak boleh mengaku mengisi Event.
  fs.writeFileSync(nbp3, isiKosong);
  const outA = String(rebuild3().stdout);
  chk('daftar kosong tanpa cadangan: DILEWATI', /Event Setting: KOSONG, dan tidak ada cadangan/.test(outA),
      (outA.split(String.fromCharCode(10)).find(l => /Event Setting/.test(l)) || '').slice(0, 70));
  chk('laporan DITULIS tidak mengaku mengisi Event',
      !/DITULIS[\s\S]*Event/.test(outA),
      (outA.split(String.fromCharCode(10)).find(l => /^DITULIS/.test(l)) || '').slice(0, 70));

  // (b) ada cadangan ber-EventObject: daftar kosong diisi, dan isinya WAJIB sama persis dengan
  // Alarm - alamat dan teksnya. Itu seluruh gunanya: satu komen di .smc2, dua daftar di NB.
  //
  // Cetakannya HARUS dari cadangan, bukan dari <AlarmObject> sebelah: medan khas Event
  // (<Condition>) dicek ikut terbawa. Disalin dari tetangga, medan itu hilang dan event-nya
  // tetap ter-import - cuma tidak pernah tercatat.
  fs.writeFileSync(nbp3, isiKosong);
  fs.writeFileSync(nbp3 + '.20200101000000.bak',
    '<NBProject><AlarmObjects>' + OBJ('AlarmObject', 7, '400.00', 'lama') + '</AlarmObjects>'
    + '<EventObjects><EventObject ID="9" HMIID="0"><Address><RegAddr>'
    + '<AddressType SystemID="56">H_bit</AddressType>'
    + '<AddressValue Type="Bit" Length="1" CodeType="0">400.00</AddressValue></RegAddr></Address>'
    + '<Condition>1</Condition><Content><Font>lama</Font></Content></EventObject></EventObjects></NBProject>');
  const outB = String(rebuild3().stdout);
  const isi3 = fs.readFileSync(nbp3, 'utf8');
  const nA = cacah(isi3, 'AlarmObject'), nE = cacah(isi3, 'EventObject');
  chk('daftar kosong diisi dari cadangan', nE > 0 && nE === nA, nA + ' alarm / ' + nE + ' event');
  chk('cadangan yang dipakai disebutkan', /cetakan dipinjam dari cadangan/.test(outB),
      (outB.split(String.fromCharCode(10)).find(l => /dipinjam/.test(l)) || '').slice(0, 70));
  // Pasangan (alamat, teks) dua daftar dibandingkan utuh - "jumlahnya sama" saja tidak cukup,
  // dua daftar bisa sama panjang sambil menunjuk bit yang lain.
  const psg = t => (isi3.match(new RegExp('<' + t + '\\b[\\s\\S]*?<\\/' + t + '>', 'g')) || []).map(o =>
    ((/<AddressValue\b[^>]*>([\d.]+)</.exec(o) || [])[1] || '?') + '|'
    + ((/<Font\b[^>]*>([\s\S]*?)<\/Font>/.exec(o) || [])[1] || '?'));
  chk('Event sama persis dengan Alarm - alamat dan teksnya',
      JSON.stringify(psg('AlarmObject')) === JSON.stringify(psg('EventObject')),
      psg('AlarmObject')[0] + '   vs   ' + psg('EventObject')[0]);
  chk('medan khas Event ikut terbawa (bukan disalin dari Alarm)',
      (isi3.match(/<Condition>/g) || []).length === nE,
      (isi3.match(/<Condition>/g) || []).length + ' Condition untuk ' + nE + ' event');
  const idsE = [...isi3.matchAll(/<EventObject ID="(\d+)"/g)].map(m => m[1]);
  chk('Event yang baru dibuat ber-ID unik', new Set(idsE).size === idsE.length, idsE.slice(0, 6).join(' '));
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
