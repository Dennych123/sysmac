// scripts/nb_apply.js - satu-satunya bagian repo ini yang MENULIS ke folder orang lain.
// Yang diuji bukan isi CSV-nya (itu urusan hmi.test.js), tapi sifat yang kalau rusak bikin
// project NB rusak tanpa bisa dikembalikan:
//   - tanpa --write tidak boleh ada satu byte pun berubah
//   - yang lama selalu dicadangkan dulu, dan cadangan tidak pernah ditimpa cadangan lain
//   - folder yang bukan project NB ditolak, bukan diisi berkas asing
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };
const run = (...a) => spawnSync(process.execPath, [path.join(root, 'scripts', 'nb_apply.js'), ...a], { encoding: 'utf8' });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nbapply-'));
const proj = path.join(tmp, 'project.json');
// Tab-nya ditulis sebagai kode karakter, bukan escape. Berkas ini pernah ditulis lewat heredoc
// yang memakan backslash-nya: regex penggantinya berubah arti diam-diam dan seluruh IO list masuk
// sebagai satu kolom - kegagalannya muncul jauh di dalam validate, bukan di baris ini.
const BS = String.fromCharCode(92), TAB = String.fromCharCode(9);
fs.writeFileSync(proj, JSON.stringify({
  io: fs.readFileSync(path.join(root, 'scripts', 'test.js'), 'utf8')
        .match(/const IO=`([^`]*)`;/)[1].split(BS + 't').join(TAB)
}));

// Folder pembungkus berisi folder project - bentuk yang dipakai NB-Designer sungguhan.
const luar = path.join(tmp, 'NB'), dalam = path.join(luar, 'Proj');
fs.mkdirSync(dalam, { recursive: true });
fs.writeFileSync(path.join(dalam, 'Proj.nbp'), '<NBProject/>');
const target = path.join(dalam, 'AlarmLib.csv');
// Sengaja LEBIH BANYAK dari yang bakal digenerate: itu keadaan yang harus diperingatkan,
// karena kelebihannya hilang dari panel begitu ditimpa.
const lamaRows = Array.from({ length: 300 }, (_, i) => 'BARIS LAMA ' + i);
fs.writeFileSync(target, ['Alarm Lib,V103', 'HDR'].concat(lamaRows).join('\n') + '\n');
const isi = () => fs.readFileSync(target, 'utf8');
const baks = () => fs.readdirSync(dalam).filter(f => /\.bak$/.test(f));

// --- tanpa --write ---
const kering = run(proj, luar);
chk('berhasil jalan', kering.status === 0, (kering.stderr || '').slice(0, 120));
chk('menemukan folder project di dalam pembungkusnya', /Proj\.nbp/.test(kering.stdout));
chk('tanpa --write, berkasnya TIDAK disentuh', /BARIS LAMA 299/.test(isi()) && !/AL001_/.test(isi()));
chk('tanpa --write, tidak bikin cadangan', baks().length === 0, baks().join(' '));
chk('memberi tahu belum menulis apa-apa', /Belum ada yang ditulis/.test(kering.stdout));
chk('mengingatkan menutup NB-Designer dulu', /Tutup NB-Designer/.test(kering.stdout));
// Alarm lama yang tidak punya pengganti = hilang dari panel. Harus disebut, bukan didiamkan.
chk('memperingatkan baris lama yang bakal hilang', /TIDAK punya penggantinya/.test(kering.stdout));

// --- dengan --write ---
const tulis = run(proj, luar, '--write');
chk('menulis dengan --write', tulis.status === 0 && /DITULIS/.test(tulis.stdout), (tulis.stderr || '').slice(0, 120));
chk('isinya berganti', /AL001_/.test(isi()));
chk('BOM UTF-8 ikut tertulis', isi().charCodeAt(0) === 0xFEFF);
chk('yang lama dicadangkan utuh', baks().length === 1 && /BARIS LAMA 299/.test(fs.readFileSync(path.join(dalam, baks()[0]), 'utf8')),
    baks().join(' '));
// Cadangan yang ketimpa cadangan berikutnya sama saja dengan tidak punya cadangan.
run(proj, luar, '--write');
chk('jalan kedua bikin cadangan BARU, tidak menimpa yang lama', baks().length === 2, baks().join(' '));

// --- yang harus ditolak ---
const bukan = path.join(tmp, 'bukanNB'); fs.mkdirSync(bukan);
const r1 = run(proj, bukan);
chk('folder tanpa .nbp ditolak', r1.status !== 0 && /bukan folder project NB/.test(r1.stderr), r1.stderr.slice(0, 90));
chk('dan tidak meninggalkan berkas apa pun di situ', fs.readdirSync(bukan).length === 0, fs.readdirSync(bukan).join(' '));
const r2 = run(proj, path.join(tmp, 'tidak-ada'));
chk('folder tidak ada ditolak', r2.status !== 0 && /folder tidak ada/.test(r2.stderr), r2.stderr.slice(0, 90));
const r3 = run(path.join(tmp, 'bukan.json'), luar);
chk('project JSON rusak ditolak sebelum menyentuh apa pun',
    r3.status !== 0 && /project JSON tidak terbaca/.test(r3.stderr), r3.stderr.slice(0, 90));
// Peta HMI mati = tidak ada alamat = tidak ada yang bisa ditempel. Jangan menulis berkas kosong.
const projOff = path.join(tmp, 'off.json');
fs.writeFileSync(projOff, JSON.stringify(Object.assign(JSON.parse(fs.readFileSync(proj, 'utf8')), { hmiMap: { enabled: false } })));
const r4 = run(projOff, luar, '--write');
chk('peta HMI mati: menolak, bukan menulis berkas kosong',
    r4.status !== 0 && /peta HMI/.test(r4.stderr), (r4.stderr || '').slice(0, 90));

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
