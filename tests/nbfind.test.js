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

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
