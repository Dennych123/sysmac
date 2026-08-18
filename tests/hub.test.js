// Penjaga jalan masuk: `home.html` itu halaman UTAMA - daftar seluruh alat repo.
//
// Kenapa perlu tesnya sendiri: taut yang mati TIDAK menggagalkan apa pun. Halamannya tetap
// terbuka, kartunya tetap tergambar, tombolnya tetap ada - yang terjadi cuma "file not found"
// waktu diklik, dan itu terbaca seperti alatnya yang hilang, bukan seperti tautnya yang salah.
// Persis kelas kegagalan yang bikin generator dan pembaca .smc2 hidup terpisah selama ini.
//
// Empat hal yang dijaga:
//   1. tiap taut relatif di home.html menunjuk berkas yang MEMANG ada
//   2. tiap perintah di kartu menunjuk skrip yang MEMANG ada
//   3. yang dilayani aplikasi lokal MENUTUP semua taut itu - kalau tidak, halaman yang sama
//      hidup waktu dibuka dari file:// dan 404 waktu dilayani server (atau sebaliknya)
//   4. generator dan pembaca menaut BALIK ke halaman utama - tiga halaman yang tidak saling
//      menyebut itu keadaan awal yang mau dihilangkan
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const homePath = path.join(ROOT, 'home.html');
if (!fs.existsSync(homePath)) {
  console.log('>>BAD home.html tidak ada - build dulu: python scripts/build_html.py');
  process.exit(1);
}
const home = fs.readFileSync(homePath, 'utf8');
const gen = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'scripts', 'app.js'), 'utf8');

chk('halaman utama punya kartu alat', (home.match(/class="tool"/g) || []).length >= 8,
    (home.match(/class="tool"/g) || []).length + ' kartu');
chk('menyebut pembaca .smc2', /reader\/smc2-viewer\.html/.test(home));
chk('menyebut generator', /href="index\.html"/.test(home));
chk('menyebut aplikasi lokal', /127\.0\.0\.1:7654/.test(home));

// --------------------------------------------------------------- 1. taut relatif
const hrefs = [...home.matchAll(/href="([^"#][^"]*)"/g)].map(m => m[1])
  .filter(h => !/^https?:/.test(h));
chk('ada taut relatif buat diperiksa', hrefs.length >= 6, hrefs.length + ' taut');
for (const h of [...new Set(hrefs)]) {
  chk('taut hidup: ' + h, fs.existsSync(path.join(ROOT, h)));
}

// --------------------------------------------------------------- 2. perintah CLI
// Perintah di kartu ditulis buat disalin dan ditempel. Yang menunjuk skrip yang sudah pindah
// tetap tersalin dengan rapi dan baru gagal di terminal orang lain.
const cmds = [...home.matchAll(/class="cmd">([^<]+)</g)].map(m => m[1].trim());
chk('kartu membawa perintah CLI', cmds.length >= 5, cmds.length + ' perintah');
for (const c of cmds) {
  const m = /^(?:node|pwsh|python)\s+(\S+)/.exec(c);
  if (!m) { chk('perintah dikenali bentuknya: ' + c, false); continue; }
  chk('skrip ada: ' + m[1], fs.existsSync(path.join(ROOT, m[1])), c);
}

// ------------------------------------------------- 3. taut yang sama hidup lewat server
for (const h of [...new Set(hrefs)]) {
  chk('dilayani aplikasi lokal juga: /' + h, app.includes("'/" + h + "'"), 'tambahkan ke HALAMAN_STATIS');
}
chk('akar / melayani halaman utama, bukan generator', /'\/': \{ berkas: 'home\.html'/.test(app));
chk('generator tetap bisa dibuka di /index.html', /'\/index\.html': \{ berkas: 'index\.html'/.test(app));
chk('halaman alat NB ada di /tools', /'\/tools'/.test(app));

// -------------------------------------------------------------- 4. taut balik
chk('generator menaut balik ke halaman utama', /href="home\.html"/.test(gen));
const viewer = path.join(ROOT, 'reader', 'smc2-viewer.html');
if (fs.existsSync(viewer)) {
  const v = fs.readFileSync(viewer, 'utf8');
  chk('pembaca .smc2 menaut balik ke halaman utama', /\.\.\/home\.html/.test(v),
      'tambahkan di reader/viewer/shell.html lalu: cd reader && node build.js');
} else {
  chk('smc2-viewer.html sudah dibuild', false, 'cd reader && node build.js');
}

console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
