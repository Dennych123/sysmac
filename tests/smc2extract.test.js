// `scripts/smc2_extract.js` - .smc2 jadi teks yang bisa di-commit.
//
// Satu sifat yang menentukan alat ini berguna atau tidak: **jalan dua kali harus menghasilkan
// berkas yang SAMA PERSIS**. Kalau tidak, tiap ekstrak menghasilkan diff palsu, riwayat git-nya
// penuh perubahan yang bukan perubahan, dan orang berhenti membacanya - persis masalah yang mau
// diselesaikan alat ini.
//
// Yang kedua: elemen yang mengubah ARTI rung (NC, Set/Reset, edge) harus ikut tertulis. Yang
// terlewat menghasilkan teks yang sama persis untuk dua program yang berbeda - diff-nya bersih
// sementara mesinnya bergerak lain, dan itu kelas kegagalan paling mahal di repo ini.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const SCRIPT = path.join(root, 'scripts', 'smc2_extract.js');
const FIX = path.join(root, 'reader', 'tests', 'fixtures', 'synthetic.smc2');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

if (!fs.existsSync(FIX)) {
  console.log('  SKIP  reader/tests/fixtures/synthetic.smc2 tidak ada');
  console.log('        bikin: node reader/tests/fixtures/make_fixture.js');
  process.exit(0);
}

const run = (dir, ...extra) =>
  spawnSync(process.execPath, [SCRIPT, FIX, dir, ...extra], { encoding: 'utf8' });

// Isi seluruh folder jadi satu peta - dibandingkan per berkas, bukan per folder, supaya yang
// gagal menyebut berkasnya.
function snap(dir) {
  const out = {};
  (function walk(d, pre) {
    for (const n of fs.readdirSync(d).sort()) {
      const f = path.join(d, n);
      if (fs.statSync(f).isDirectory()) walk(f, pre + n + '/');
      else out[pre + n] = fs.readFileSync(f, 'utf8');
    }
  })(dir, '');
  return out;
}

const a = fs.mkdtempSync(path.join(os.tmpdir(), 'smc2ex-a-'));
const b = fs.mkdtempSync(path.join(os.tmpdir(), 'smc2ex-b-'));
const r1 = run(a);
chk('ekstrak jalan', r1.status === 0, (r1.stderr || '').trim().slice(0, 120));
run(b);

const A = snap(a), B = snap(b);
chk('menulis berkas', Object.keys(A).length >= 5, Object.keys(A).length + ' berkas');
chk('program.txt ada', !!A['program.txt']);
chk('variables.tsv ada', !!A['variables.tsv']);
chk('satu berkas per section, di folder programnya',
    Object.keys(A).some(k => /\/.+\.txt$/.test(k)), Object.keys(A).join(' ').slice(0, 100));

// --------------------------------------------------------------- deterministik
const beda = Object.keys(A).filter(k => A[k] !== B[k]);
chk('dua kali jalan menghasilkan isi yang sama persis', !beda.length, beda.join(', '));
chk('daftar berkasnya juga sama',
    Object.keys(A).join('|') === Object.keys(B).join('|'));

// ------------------------------------------------------------- isi yang penting
const all = Object.keys(A).map(k => A[k]).join('\n');
chk('flag NC ikut tertulis', /\[NC\]/.test(all));
chk('flag Set/Reset ikut tertulis', /\[SET\]|\[RESET\]/.test(all));
chk('flag edge ikut tertulis', /\[RISING\]|\[FALLING\]/.test(all));
chk('komentar rung ikut', /rung 0001 +; /.test(all));

// Koordinat sengaja TIDAK ikut: menggeser kotak di kanvas bukan perubahan program, dan kalau
// ikut, tiap perapian tata letak muncul sebagai diff. Bedanya tata letak ada di smc2_diff.js.
chk('koordinat tidak ikut ke berkas teks', !/\bX=|\bY=|"x":/.test(all));

// Akhir baris LF - berkas ini dibaca `git diff` di mesin mana pun, dan campur CRLF/LF bikin
// seluruh berkas tampil berubah padahal isinya sama.
chk('semua berkas berakhiran LF, bukan CRLF', !Object.keys(A).some(k => /\r\n/.test(A[k])),
    Object.keys(A).filter(k => /\r\n/.test(A[k])).join(', '));

// Jumlah rung di berkas teks harus sama dengan yang dilaporkan CLI - kalau satu section
// terlewat ditulis, ringkasannya tetap tampak wajar dan yang hilang tidak kelihatan.
const dilapor = /(\d+) rung,/.exec(r1.stdout);
const tertulis = Object.keys(A).filter(k => k.indexOf('/') > 0)
  .reduce((n, k) => n + (A[k].match(/^rung /gm) || []).length, 0);
chk('jumlah rung yang ditulis cocok dengan yang dilaporkan',
    dilapor && +dilapor[1] === tertulis, (dilapor ? dilapor[1] : '?') + ' vs ' + tertulis);

// ------------------------------------------------------------------- --clean
// Section yang dihapus di Studio harus ikut hilang dari folder ekstrak. Kalau tidak, riwayat
// git-nya menunjukkan section yang sudah tidak ada lagi - dan itu bohong yang tidak kelihatan.
const basi = path.join(a, 'SectionYangSudahDihapus.txt');
fs.writeFileSync(basi, 'isi lama\n');
run(a);
chk('tanpa --clean, berkas lama dibiarkan', fs.existsSync(basi));
run(a, '--clean');
chk('--clean membuang berkas lama', !fs.existsSync(basi));
chk('--clean tidak ikut membuang hasil ekstraknya sendiri',
    fs.existsSync(path.join(a, 'program.txt')) && fs.existsSync(path.join(a, 'variables.tsv')));

const kurang = spawnSync(process.execPath, [SCRIPT, FIX], { encoding: 'utf8' });
chk('argumen kurang ditolak rapi', kurang.status === 2 && /pakai:/.test(kurang.stderr));
const hilang = spawnSync(process.execPath, [SCRIPT, 'tidak-ada.smc2', a], { encoding: 'utf8' });
chk('berkas tidak ada ditolak rapi', hilang.status === 2 && /tidak ada/.test(hilang.stderr));

for (const d of [a, b]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
