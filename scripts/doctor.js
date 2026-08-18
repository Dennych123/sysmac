// Periksa kesiapan mesin ini - dipakai waktu pindah laptop.
//
//   node scripts/doctor.js
//
// Kenapa ada: yang bikin repo ini gagal jalan di mesin lain hampir tidak pernah kodenya. Yang
// gagal selalu hal di luar repo - Node terlalu tua, `git` tidak ada di PATH, `index.html` belum
// di-build, Sysmac Studio tidak terpasang jadi XSD-nya tidak ada. Semuanya kelihatan sebagai
// gejala yang menyesatkan: halaman kosong, tombol yang diam, tes yang SKIP tanpa dibaca.
//
// Jadi masing-masing diperiksa DI SINI, satu baris satu jawaban, dan yang tidak wajib disebut
// tidak wajib - bukan disamakan dengan yang bikin alatnya tidak jalan sama sekali.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const { spawnSync } = require('child_process');

const REPO = path.join(__dirname, '..');
let wajibGagal = 0;

const baris = (ok, wajib, judul, ket) => {
  if (!ok && wajib) wajibGagal++;
  const tanda = ok ? ' OK ' : (wajib ? 'GAGAL' : 'catat');
  console.log('[' + tanda + '] ' + judul + (ket ? '   ' + ket : ''));
};

function versiPerintah(cmd, args) {
  try {
    const r = spawnSync(cmd, args || ['--version'], { encoding: 'utf8' });
    if (r.status !== 0) return null;
    return (r.stdout || r.stderr || '').split('\n')[0].trim();
  } catch (e) { return null; }
}

console.log('Susmax - periksa kesiapan mesin');
console.log('repo: ' + REPO);
console.log('');

// ------------------------------------------------------------------- wajib
const nodeMayor = +process.versions.node.split('.')[0];
// Node 18 itu batas nyata, bukan angka pilihan: pembaca .smc2 memakai DecompressionStream buat
// membuka ZIP-nya tanpa satu pun dependensi. Di bawah itu, tiap project gagal dibuka dengan
// pesan yang tidak menyebut Node sama sekali.
baris(nodeMayor >= 18, true, 'Node >= 18', 'v' + process.versions.node +
      (typeof DecompressionStream === 'undefined' ? '   (DecompressionStream TIDAK ADA)' : ''));

const git = versiPerintah('git');
// Riwayat project (`track`, `restore`) seluruhnya jalan di atas git. Tanpa git, alat-alat lain
// tetap jalan - tapi yang paling menentukan waktu menyunting justru hilang.
baris(!!git, true, 'git ada di PATH', git || 'tidak ketemu - riwayat & pemulihan .smc2 mati');

// ------------------------------------------------------- hasil build halaman
const halaman = [
  ['index.html', 'python scripts/build_html.py'],
  ['home.html', 'python scripts/build_html.py'],
  [path.join('reader', 'smc2-viewer.html'), 'cd reader && node build.js'],
];
for (const [f, cara] of halaman) {
  const ada = fs.existsSync(path.join(REPO, f));
  baris(ada, true, 'halaman ' + f, ada ? '' : 'belum dibuild - jalankan: ' + cara);
}

// ----------------------------------------------------------------- opsional
const py = versiPerintah('python') || versiPerintah('python3');
// Python CUMA dipakai buat MEMBANGUN index.html. Yang cuma memakai aplikasinya tidak perlu.
baris(!!py, false, 'python (buat build ulang index.html)', py || 'tidak ada - halaman yang sudah dibuild tetap jalan');

if (process.platform === 'win32') {
  const ps = versiPerintah('powershell', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']);
  baris(!!ps, false, 'PowerShell (dialog pilih berkas)', ps || 'tidak ada - path harus diketik tangan');
} else {
  baris(false, false, 'dialog pilih berkas', 'cuma ada di Windows - path diketik tangan');
}

// XSD-nya MILIK Sysmac Studio dan tidak boleh disalin ke repo. Tanpa Studio, suite `xsd` SKIP -
// dan SKIP yang tidak dibaca sama menipunya dengan tes yang lulus tanpa menguji apa pun.
const xsd = path.join('C:', 'Program Files', 'OMRON', 'Sysmac Studio', 'Sample',
                      'IEC 61131-10 XML', 'Controller', 'IEC61131_10_Ed1_0_Spc1_0.xsd');
const adaXsd = process.platform === 'win32' && fs.existsSync(xsd);
baris(adaXsd, false, 'XSD resmi Sysmac Studio', adaXsd ? xsd : 'tidak ada - suite `xsd` akan SKIP');

const claude = versiPerintah('claude');
baris(!!claude, false, 'Claude Code CLI (buat MCP)', claude || 'tidak ada - alat MCP tidak bisa didaftarkan');

// ------------------------------------------------------------ setelan mesin
const setelan = path.join(os.homedir(), '.susmax', 'settings.json');
if (fs.existsSync(setelan)) {
  let root = '(tidak terbaca)';
  try { root = JSON.parse(fs.readFileSync(setelan, 'utf8')).root || '(kosong)'; } catch (e) {}
  const adaRoot = root !== '(kosong)' && fs.existsSync(root);
  baris(adaRoot, false, 'folder kerja tersimpan', root + (adaRoot ? '' : '   - foldernya tidak ada di mesin ini'));
} else {
  baris(false, false, 'folder kerja tersimpan', 'belum ada - pilih lewat halaman, atau --ws waktu menjalankan');
}

// Port yang sudah dipakai bikin server kedua gagal bind, dan yang membuka 127.0.0.1:7654
// diam-diam memakai server LAIN - termasuk server dengan folder kerja yang lain.
const PORT = +(process.env.SUSMAX_PORT || 7654);
const uji = net.createServer();
uji.once('error', () => {
  baris(false, false, 'port ' + PORT + ' bebas', 'sudah dipakai - kemungkinan Susmax lain masih jalan');
  tutup();
});
uji.once('listening', () => { uji.close(); baris(true, false, 'port ' + PORT + ' bebas', ''); tutup();
});
uji.listen(PORT, '127.0.0.1');

function tutup() {
  console.log('');
  if (wajibGagal) {
    console.log(wajibGagal + ' hal WAJIB belum siap - perbaiki dulu sebelum dipakai.');
    process.exit(1);
  }
  console.log('Siap. Jalankan:  node scripts/app.js --ws "<folder project>"');
  console.log('(atau klik dua kali Susmax.cmd)');
}
