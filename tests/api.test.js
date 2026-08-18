// API aplikasi lokal (`scripts/api.js` + `scripts/ws.js`): berkas, .smc2, dan git.
//
// Ini bagian yang MENULIS ke disk dan MENJALANKAN git, jadi yang diuji sifat-sifat yang kalau
// rusak berbahaya - bukan tampilannya:
//
//   1. tidak ada jalan keluar dari folder kerja (path traversal, path absolut)
//   2. yang ditimpa selalu dicadangkan dulu
//   3. riwayat git dibuat di repo SENDIRI - bukan menumpang repo yang kebetulan ada di atasnya.
//      Ini sudah kejadian: `C:/Users/<nama>` ternyata sebuah repo git, jadi folder riwayat di
//      bawah home menampilkan riwayat home dan `git add` menyentuh index-nya.
//   4. `.smc2` bisa dikembalikan PERSIS byte-nya dari riwayat
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const FIX = path.join(root, 'reader', 'tests', 'fixtures', 'synthetic.smc2');
if (!fs.existsSync(FIX)) {
  console.log('  SKIP  fixture .smc2 tidak ada - bikin: node reader/tests/fixtures/make_fixture.js');
  process.exit(0);
}

// Folder kerja uji dibuat di temp: tesnya menulis berkas, dan menulis di dalam repo bikin
// `git status` repo ini kotor tiap kali tes jalan.
const WS = fs.mkdtempSync(path.join(os.tmpdir(), 'susmax-ws-'));
process.env.SUSMAX_WS = WS;
// Setelan dialihkan ke temp: tes yang memanggil `ws/set` TIDAK boleh menimpa folder kerja
// yang dipakai orangnya sehari-hari - dan itu sudah kejadian sekali.
process.env.SUSMAX_SETTINGS = path.join(WS, 'settings-uji.json');
const ws = require(path.join(root, 'scripts', 'ws.js'));
const api = require(path.join(root, 'scripts', 'api.js'));

fs.copyFileSync(FIX, path.join(WS, 'demo.smc2'));
fs.writeFileSync(path.join(WS, 'catatan.txt'), 'isi awal\n', 'utf8');

const panggil = (nama, isi) => api.panggil(nama, isi);
const gagal = (nama, isi) => panggil(nama, isi).then(
  () => ({ ok: true }), e => ({ ok: false, error: e.message }));

(async () => {
  chk('folder kerja dipakai dari SUSMAX_WS', ws.getRoot() === fs.realpathSync(WS) ||
      ws.getRoot() === WS, ws.getRoot() + ' vs ' + WS);

  // ------------------------------------------------------------ 1. kurungan
  for (const jahat of ['../rahasia.txt', '../../Windows/win.ini', 'sub/../../keluar.txt']) {
    const r = await gagal('fs/read', { path: jahat });
    chk('ditolak keluar folder kerja: ' + jahat, !r.ok && /folder kerja/.test(r.error), r.error);
  }
  const abs = await gagal('fs/read', { path: path.join(root, 'CLAUDE.md') });
  chk('path absolut ke luar juga ditolak', !abs.ok, abs.error);
  const dalam = await panggil('fs/read', { path: 'catatan.txt' });
  chk('berkas di dalam folder kerja terbaca', dalam.text === 'isi awal\n', JSON.stringify(dalam.text));

  const daftar = await panggil('fs/list', { dir: '.' });
  chk('daftar isi folder jalan', daftar.entries.some(e => e.name === 'demo.smc2'),
      daftar.entries.map(e => e.name).join(','));
  const temu = await panggil('fs/find', { pattern: '*.smc2' });
  chk('pencarian berkas jalan', temu.files.includes('demo.smc2'), temu.files.join(','));

  // ------------------------------------------------------------ 2. cadangan
  const tulis1 = await panggil('fs/write', { path: 'catatan.txt', content: 'isi baru\n' });
  chk('menulis berkas jalan', fs.readFileSync(path.join(WS, 'catatan.txt'), 'utf8') === 'isi baru\n');
  chk('yang lama dicadangkan', !!tulis1.backup && fs.existsSync(path.join(WS, tulis1.backup)),
      String(tulis1.backup));
  chk('isi cadangan = isi sebelum ditimpa',
      fs.readFileSync(path.join(WS, tulis1.backup), 'utf8') === 'isi awal\n');
  const tulis2 = await panggil('fs/write', { path: 'catatan.txt', content: 'isi ketiga\n' });
  chk('cadangan kedua tidak menimpa cadangan pertama', tulis2.backup !== tulis1.backup,
      tulis1.backup + ' vs ' + tulis2.backup);
  const baru = await panggil('fs/write', { path: 'baru/anak.txt', content: 'x' });
  chk('folder induk dibuat kalau belum ada', fs.existsSync(path.join(WS, 'baru', 'anak.txt')));
  chk('berkas baru tidak punya cadangan', baru.backup === null, String(baru.backup));

  // -------------------------------------------------------------- 3. .smc2
  const ring = await panggil('smc2/summary', { path: 'demo.smc2' });
  chk('ringkasan .smc2 terbaca', ring.programs.length >= 2 && ring.variables > 0,
      ring.programs.length + ' program, ' + ring.variables + ' variabel');
  const sec = ring.programs[1].sections.find(s => s.rungs) || ring.programs[0].sections[0];
  const isi = await panggil('smc2/read',
    { path: 'demo.smc2', program: ring.programs[1].name, section: sec.name });
  chk('satu section bisa diambil sendiri', Array.isArray(isi.rungs) && isi.section === sec.name,
      isi.section + ' ' + (isi.rungs || []).length + ' rung');
  const salah = await gagal('smc2/read', { path: 'demo.smc2', program: 'X', section: 'Y' });
  chk('section yang tidak ada ditolak rapi', !salah.ok && /tidak ketemu/.test(salah.error), salah.error);

  const d = await panggil('smc2/diff', { a: 'demo.smc2', b: 'demo.smc2' });
  chk('diff project dengan dirinya sendiri: tidak ada perubahan',
      d.summary === 'tidak ada perubahan', d.summary);

  // ---------------------------------------------------------------- 4. git
  const t1 = await panggil('git/track', { path: 'demo.smc2', message: 'versi awal' });
  chk('riwayat pertama tercatat', t1.changed === true, JSON.stringify(t1));
  const histDir = path.join(WS, t1.dir);
  chk('riwayat jadi repo git SENDIRI, bukan menumpang yang di atasnya',
      fs.existsSync(path.join(histDir, '.git')), t1.dir);
  chk('berkas .smc2 aslinya ikut disimpan di riwayat',
      fs.existsSync(path.join(histDir, 'project.smc2')));
  chk('teks hasil ekstrak ikut - itu yang bikin git diff kebaca',
      fs.existsSync(path.join(histDir, 'program.txt')) &&
      fs.existsSync(path.join(histDir, 'variables.tsv')));

  const t2 = await panggil('git/track', { path: 'demo.smc2', message: 'tanpa perubahan' });
  chk('track tanpa perubahan tidak bikin commit kosong', t2.changed === false, JSON.stringify(t2));

  // Versi kedua: berkas .smc2 diganti isinya.
  const lain = path.join(root, 'reader', 'tests', 'fixtures', 'synthetic.smc2');
  const asli = fs.readFileSync(lain);
  fs.writeFileSync(path.join(WS, 'demo.smc2'), Buffer.concat([asli, Buffer.from('X')]));
  const t3 = await panggil('git/track', { path: 'demo.smc2', message: 'versi kedua' });
  chk('perubahan .smc2 tercatat jadi commit baru', t3.changed === true, JSON.stringify(t3));

  const log = await panggil('git/log', { dir: t1.dir });
  chk('riwayat terbaca', log.repo && log.entries.length === 2, JSON.stringify(log).slice(0, 120));
  chk('judul commit ikut', log.entries.some(e => e.subject === 'versi awal'),
      log.entries.map(e => e.subject).join(' | '));
  chk('tanggal ikut', log.entries.every(e => /\d{4}-\d{2}-\d{2}/.test(e.date || '')));

  const revAwal = log.entries[log.entries.length - 1].hash;
  const show = await panggil('git/show', { dir: t1.dir, rev: revAwal });
  chk('isi satu commit bisa dibaca', /commit|diff|\+\+\+/.test(show.diff), show.diff.slice(0, 60));
  const revJahat = await gagal('git/show', { dir: t1.dir, rev: '--upload-pack=calc' });
  chk('rev yang bukan hash ditolak', !revJahat.ok && /hash/.test(revJahat.error), revJahat.error);

  // Ini inti dari "pakai git supaya bisa balik": byte-nya harus PERSIS sama, bukan mirip.
  const kembali = await panggil('git/restore',
    { dir: t1.dir, rev: revAwal, to: 'demo.smc2' });
  chk('pemulihan melaporkan sumbernya', kembali.from === revAwal, JSON.stringify(kembali));
  chk('.smc2 kembali PERSIS byte-nya',
      fs.readFileSync(path.join(WS, 'demo.smc2')).equals(asli),
      fs.readFileSync(path.join(WS, 'demo.smc2')).length + ' vs ' + asli.length);
  chk('yang ditimpa saat memulihkan ikut dicadangkan',
      fs.readdirSync(WS).some(f => /^demo\.smc2\..*\.bak$/.test(f)),
      fs.readdirSync(WS).join(','));

  const fileJahat = await gagal('git/restore',
    { dir: t1.dir, rev: revAwal, to: 'demo.smc2', file: '../luar.smc2' });
  chk('nama berkas berisi folder ditolak', !fileJahat.ok && /tanpa folder/.test(fileJahat.error),
      fileJahat.error);

  // Folder yang BUKAN repo sendiri tidak boleh meminjam riwayat repo di atasnya.
  fs.mkdirSync(path.join(WS, 'bukan-repo'), { recursive: true });
  const kosong = await panggil('git/log', { dir: 'bukan-repo' });
  chk('folder tanpa repo sendiri: riwayat kosong, bukan riwayat orang lain',
      kosong.repo === false && kosong.entries.length === 0, JSON.stringify(kosong));

  // ------------------------------------------------- pantau otomatis + catatan susulan
  // Yang diuji: pemantauan mencatat keadaan SEBELUM disunting (versi itulah yang dicari waktu
  // suntingannya ternyata salah), lalu mencatat lagi sendiri begitu berkasnya berubah dan diam.
  fs.copyFileSync(FIX, path.join(WS, 'pantau.smc2'));
  const w1 = await panggil('watch/start', { path: 'pantau.smc2' });
  chk('pemantauan hidup', w1.watching === true, JSON.stringify(w1).slice(0, 80));
  chk('keadaan sebelum disunting ikut dicatat, tidak menunggu simpanan pertama',
      w1.initial && w1.initial.changed === true, JSON.stringify(w1.initial).slice(0, 90));

  const asliP = fs.readFileSync(FIX);
  fs.writeFileSync(path.join(WS, 'pantau.smc2'), Buffer.concat([asliP, Buffer.from('Z')]));
  // Pemantau menunggu berkasnya DIAM dulu (3 detik) sebelum mencatat - commit di tengah tulisan
  // menyimpan ZIP separuh, dan yang separuh baru ketahuan waktu dibutuhkan.
  await new Promise(r => setTimeout(r, 9000));
  const w2 = await panggil('watch/status', { path: 'pantau.smc2' });
  chk('perubahan tercatat sendiri tanpa ada yang menekan tombol', w2.commits >= 1,
      JSON.stringify(w2).slice(0, 120));
  chk('judul commit dihitung, bukan "auto-save"',
      /^otomatis: /.test(w2.lastMessage || ''), String(w2.lastMessage));

  const logP = await panggil('git/log', { dir: 'pantau-history' });
  chk('riwayat berisi versi sebelum DAN sesudah', logP.entries.length >= 2,
      logP.entries.map(e => e.subject).join(' | '));

  const revP = logP.entries[0].hash;
  await panggil('git/message', { dir: 'pantau-history', rev: revP, message: 'coba tambah alarm' });
  const logP2 = await panggil('git/log', { dir: 'pantau-history' });
  chk('catatan susulan tersimpan', logP2.entries[0].note === 'coba tambah alarm',
      JSON.stringify(logP2.entries[0]));
  // Catatan dipasang sebagai git notes: hash TIDAK boleh berubah, kalau tidak tombol
  // "Kembalikan" di sebelahnya menunjuk versi yang sudah tidak ada.
  chk('hash commit tidak berubah gara-gara catatan', logP2.entries[0].hash === revP,
      revP + ' -> ' + logP2.entries[0].hash);
  chk('judul otomatisnya tetap ada di samping catatan',
      /^otomatis: /.test(logP2.entries[0].subject), logP2.entries[0].subject);

  const daftarTrack = await panggil('track/list', {});
  chk('project yang dipantau masuk daftar - halaman lain tinggal memilih',
      daftarTrack.items.some(x => x.smc2 === 'pantau.smc2'),
      JSON.stringify(daftarTrack.items).slice(0, 90));

  const w3 = await panggil('watch/stop', { path: 'pantau.smc2' });
  chk('pemantauan bisa dihentikan', w3.watching === false, JSON.stringify(w3));

  // ------------------------------------------- dialog pilih berkas (tanpa memunculkan dialog)
  // Yang diuji bagian yang TIDAK menunggu manusia: jendela pemiliknya benar-benar dibuat dan
  // ditampilkan. Ini sudah salah sekali - dulu `ShowDialog()` diberi Form yang tidak pernah
  // di-Show, dan Form tanpa handle jendela bukan pemilik yang sah: dialognya tidak muncul sama
  // sekali, dan dari halaman yang kelihatan cuma "menunggu dialog..." selamanya.
  const pick = require(path.join(root, 'scripts', 'pick.js'));
  if (pick.BISA) {
    const { spawnSync } = require('child_process');
    const skrip = pick.OWNER + "$d = New-Object System.Windows.Forms.FolderBrowserDialog; " +
                  "Write-Output 'siap'; " + pick.TUTUP;
    const r = spawnSync('powershell', ['-NoProfile', '-STA', '-NonInteractive', '-Command', skrip],
                        { encoding: 'utf8' });
    chk('jendela pemilik dialog benar-benar bisa dibuat', /siap/.test(r.stdout || ''),
        (r.stderr || '').trim().slice(0, 120));
    chk('pemiliknya ditampilkan dulu, bukan cuma dibuat', /\$owner\.Show\(\)/.test(pick.OWNER));
    chk('pemiliknya ditutup lagi - jendela 1x1 yang tertinggal menahan prosesnya hidup',
        /Close\(\)/.test(pick.TUTUP) && /Dispose\(\)/.test(pick.TUTUP));
    // Judul dan folder awal datang dari halaman: yang ditempel apa adanya ke perintah PowerShell
    // itu jalan masuk buat menjalankan perintah lain.
    chk('teks dari halaman dikutip aman', pick.psStr("a'; calc; '") === "'a''; calc; '''",
        pick.psStr("a'; calc; '"));
  } else {
    console.log('  SKIP  dialog cuma ada di Windows');
  }

  // ------------------------------------------------- folder kerja diingat antar-restart
  // Tanpa ini pilihannya balik ke folder repo tiap kali server dimatikan, dan yang terjadi
  // berikutnya BUKAN "salah folder" yang kelihatan: path relatif yang disimpan halaman jadi
  // menunjuk berkas yang tidak ada, dengan pesan yang menyalahkan berkasnya.
  const wsLain = fs.mkdtempSync(path.join(os.tmpdir(), 'susmax-ws2-'));
  await panggil('ws/set', { dir: wsLain });
  const setelan = JSON.parse(fs.readFileSync(ws.SETELAN, 'utf8'));
  chk('folder kerja tersimpan ke setelan pengguna',
      path.resolve(setelan.root) === path.resolve(wsLain), setelan.root + ' vs ' + wsLain);
  chk('setelan disimpan di luar repo - bukan bagian dari kode',
      !ws.SETELAN.startsWith(root), ws.SETELAN);
  await panggil('ws/set', { dir: WS });          // dikembalikan buat tes berikutnya

  // Pesan galat menyebut folder kerjanya. "tidak ketemu" tanpa menyebut dicari di mana itu
  // menyalahkan berkasnya, padahal yang pindah folder kerjanya.
  const hilang = await gagal('smc2/summary', { path: 'tidak-ada-project.smc2' });
  chk('galat .smc2 menyebut folder kerja tempat dicarinya',
      !hilang.ok && /folder kerja/.test(hilang.error), hilang.error);
  const luar = await gagal('fs/read', { path: path.join(wsLain, 'x.txt') });
  chk('galat "di luar folder kerja" ikut menyebut folder kerjanya sekarang',
      !luar.ok && /folder kerja sekarang/.test(luar.error), luar.error);
  try { fs.rmSync(wsLain, { recursive: true, force: true }); } catch (e) {}

  const takKenal = await gagal('tidak/ada', {});
  chk('api tak dikenal ditolak', !takKenal.ok && /tidak dikenal/.test(takKenal.error), takKenal.error);

  try { fs.rmSync(WS, { recursive: true, force: true }); } catch (e) {}
  console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('>>BAD ' + e.stack); process.exit(1); });
