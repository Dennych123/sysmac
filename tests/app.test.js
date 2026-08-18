// scripts/app.js - server lokal yang MENJALANKAN PERINTAH dan MENULIS BERKAS.
// Yang diuji sifat yang kalau rusak berbahaya, bukan tampilannya:
//   - cuma perintah terdaftar yang boleh jalan
//   - cuma mendengar di 127.0.0.1
//   - tanpa centang tulis, tidak ada yang ditulis
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const src = fs.readFileSync(path.join(root, 'scripts', 'app.js'), 'utf8');
// Daftar putih itu bedanya alat dan lubang: tanpa itu apa pun yang dikirim bisa dieksekusi.
chk('perintah dibatasi daftar putih', /const PERINTAH = {/.test(src) && /perintah tidak dikenal/.test(src));
chk('hanya mendengar di 127.0.0.1', /listen\(PORT, '127" + "\.0\.0\.1'/.test(src.replace('127.0.0.1', '127.0.0.1')) || /'127\.0\.0\.1'/.test(src));
chk('tidak pernah memanggil shell', !/shell:\s*true/.test(src) && !/\bexec\(/.test(src));

// Port yang sudah dipakai bikin server uji ini gagal bind DIAM-DIAM, dan seluruh tes di bawah
// lalu menguji server milik orang lain - semuanya hijau, tidak satu pun menguji kode ini.
// Kejadian waktu tesnya ditulis: sebuah app.js dari percobaan manual masih hidup.
// Susmax.cmd - satu-satunya bagian yang diklik orang, bukan diketik. Diuji karena pernah
// rusak justru di situ: berkasnya ditulis pakai printf, dan \\a di scripts\\app.js itu escape
// BELL - yang mendarat 'scripts<BEL>pp.js'. Node bilang MODULE_NOT_FOUND, dan sebabnya tidak
// kelihatan sama sekali dari pesan galatnya.
// Pemeriksa kesiapan mesin: yang dipakai waktu pindah laptop. Yang diuji dia JALAN dan menyebut
// hal-hal yang memang menentukan - pemeriksa yang diam soal Node atau git tidak menolong siapa
// pun di mesin baru.
const dok = spawnSync(process.execPath, [path.join(root, 'scripts', 'doctor.js')],
                      { encoding: 'utf8', cwd: root });
chk('doctor jalan', dok.status === 0, 'exit ' + dok.status + ' ' + (dok.stderr || '').slice(0, 80));
for (const hal of ['Node >= 18', 'git ada di PATH', 'index.html', 'smc2-viewer.html', 'XSD']) {
  chk('doctor memeriksa: ' + hal, (dok.stdout || '').includes(hal),
      (dok.stdout || '').slice(0, 60));
}

const cmd = fs.readFileSync(path.join(root, 'Susmax.cmd'), 'utf8');
chk('Susmax.cmd menunjuk scripts\\app.js dengan utuh',
    cmd.indexOf('scripts' + String.fromCharCode(92) + 'app.js') >= 0,
    (/node [^\r\n]*/.exec(cmd) || ['tidak ketemu'])[0]);
chk('tidak ada karakter kontrol nyasar di Susmax.cmd',
    !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(cmd),
    JSON.stringify(cmd.slice(0, 60)));
chk('Susmax.cmd pakai CRLF', cmd.indexOf(String.fromCharCode(13, 10)) >= 0);
chk('Susmax.cmd pindah ke foldernya sendiri dulu', cmd.indexOf('cd /d') >= 0);

// Port acak: tes ini tidak boleh bergantung pada 7654 kosong, dan tidak boleh menabrak
// aplikasi yang sedang dipakai orang di mesin yang sama.
const PORT = 7700 + Math.floor(Math.random() * 200);
let srv;
process.on('exit', () => { try { srv && srv.kill(); } catch (e) {} });
['SIGINT','SIGTERM','SIGPIPE'].forEach(sig => process.on(sig, () => process.exit(1)));
srv = spawn(process.execPath, [path.join(root, 'scripts', 'app.js')],
  { cwd: root, env: Object.assign({}, process.env, { SUSMAX_PORT: String(PORT) }) });
let siap = '', galat = '';
srv.stdout.on('data', d => siap += d);
srv.stderr.on('data', d => galat += d);
function post(url, body) {
  return new Promise(res => {
    const data = JSON.stringify(body);
    const r = http.request({ host: '127.0.0.1', port: PORT, path: url, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      resp => { let s = ''; resp.on('data', d => s += d); resp.on('end', () => { try { res(JSON.parse(s)); } catch (e) { res({ err: s }); } }); });
    r.on('error', e => res({ err: e.message }));
    r.write(data); r.end();
  });
}
function getWithHeaders(p, headers) {
  return new Promise(res => {
    http.get({ host: '127.0.0.1', port: PORT, path: p, headers: headers }, resp => {
      let s = ''; resp.on('data', d => s += d); resp.on('end', () => res({ code: resp.statusCode, body: s }));
    }).on('error', e => res({ code: 0, body: e.message }));
  });
}
function get(p) {
  return new Promise(res => {
    http.get({ host: '127.0.0.1', port: PORT, path: p }, resp => {
      let s = ''; resp.on('data', d => s += d); resp.on('end', () => res({ code: resp.statusCode, body: s }));
    }).on('error', e => res({ code: 0, body: e.message }));
  });
}
(async () => {
  for (let i = 0; i < 40 && !/siap di/.test(siap); i++) await new Promise(r => setTimeout(r, 100));
  if (/EADDRINUSE/.test(galat)) {
    console.log('>>BAD port ' + PORT + ' dipakai proses lain - tes ini tidak boleh menguji server orang.');
    srv.kill(); process.exit(1);
  }
  chk('server hidup', /siap di/.test(siap), (siap + galat).trim().slice(0, 80));

  // `/` sekarang halaman GENERATOR (index.html), dan halaman alat NB pindah ke /tools.
  // Alasannya: index.html itu satu-satunya halaman yang dibuka orang duluan, jadi di situ
  // jalan masuk ke seluruh alat repo berada. Sebelum ini generator dan pembaca .smc2 tidak
  // pernah saling menyebut - dua halaman yang tidak bertaut sama sekali.
  const home = await get('/');
  chk('halaman utama (daftar alat) terkirim di /', home.code === 200 && /Sysmac toolkit/.test(home.body),
      'HTTP ' + home.code);
  chk('halaman utama menaut ke generator dan pembaca',
      /href="index\.html"/.test(home.body) && /reader\/smc2-viewer\.html/.test(home.body));

  const gen = await get('/index.html');
  chk('generator terkirim di /index.html', gen.code === 200 && /Susmax Program Generator/.test(gen.body),
      'HTTP ' + gen.code);
  chk('generator menaut balik ke daftar alat', /href="home\.html"/.test(gen.body));

  // Halaman alat NB digabung ke /edit. Dua halaman yang meminta project yang sama dipilih ulang
  // itu masalah yang mau dihilangkan, jadi yang lama MENGALIHKAN - taut lama tetap jalan, cuma
  // mendarat di halaman yang benar.
  const alih = await get('/tools');
  chk('/tools mengalihkan ke /edit', alih.code === 302, 'HTTP ' + alih.code);

  const edit = await get('/edit');
  chk('halaman project terkirim', edit.code === 200 && /Susmax - Project/.test(edit.body),
      'HTTP ' + edit.code);

  // Satu halaman, tiga langkah, dan urutannya mengikuti cara kerjanya.
  for (const langkah of ['Folder project', 'Pantau', 'Alarm ke HMI']) {
    chk('halaman project punya langkah: ' + langkah, edit.body.includes(langkah));
  }
  chk('PLC dan HMI dikenali dari satu folder', /project\/scan/.test(edit.body));
  chk('pilihan project disimpan, bukan diminta ulang', /project\/set/.test(edit.body));
  chk('riwayat bisa dibuka di VS Code', /open\/vscode/.test(edit.body));
  chk('PLC dan HMI bisa dikembalikan terpisah',
      /file:'hmi\.nbp'|file: *'hmi\.nbp'/.test(edit.body) || /hmi\.nbp/.test(edit.body));

  const skripEdit2 = (/<script>([\s\S]*?)<\/script>/.exec(edit.body) || [])[1] || '';
  let editOk2 = false, sebab2 = '';
  try { new Function(skripEdit2); editOk2 = true; } catch (e) { sebab2 = e.message; }
  chk('skrip halaman project bisa di-parse', editOk2, sebab2);

  // ------------------------------------------------------------------ API
  // Satu jalur dipakai halaman DAN MCP, jadi yang dijaga di sini sifat jalurnya - bukan isi
  // jawabannya.
  const ping = await get('/api/ping');
  chk('ping menjawab dan menyebut folder kerja',
      ping.code === 200 && /"ok":true/.test(ping.body) && /"root"/.test(ping.body),
      ping.body.slice(0, 90));
  // Server yang jalan pakai kode lama itu penyebab paling membingungkan waktu mengembangkan:
  // halamannya tampil, tombolnya ada, cuma perilakunya versi sebelumnya. Servernya yang harus
  // memberi tahu, bukan orangnya yang menyimpulkan sendiri bahwa fiturnya tidak jadi.
  chk('ping melaporkan apakah kodenya sudah ketinggalan', /"stale":/.test(ping.body),
      ping.body.slice(0, 100));
  chk('port yang sudah dipakai dijelaskan, bukan dilempar sebagai stack trace',
      /EADDRINUSE/.test(src) && /SUDAH JALAN/.test(src));

  // Hanya ping yang boleh lintas asal. Kalau seluruh API ikut terbuka, halaman web mana pun yang
  // kebetulan terbuka di browser yang sama bisa membaca dan menulis folder kerja lewat server ini.
  const asalLain = await getWithHeaders('/api/fs/list', { Origin: 'https://jahat.example' });
  chk('API selain ping menolak permintaan dari asal lain',
      asalLain.code === 403 && /asal lain/.test(asalLain.body),
      asalLain.code + ' ' + asalLain.body.slice(0, 70));
  const jahat = await get('/api/fs/read?path=../../../Windows/win.ini');
  chk('API menolak keluar folder kerja',
      /"ok":false/.test(jahat.body) && /folder kerja/.test(jahat.body), jahat.body.slice(0, 90));

  const asing = await post('/run/rm', { smc2: 'x' });
  chk('perintah di luar daftar ditolak', /tidak dikenal/.test((asing.err || '') + (asing.out || '')), JSON.stringify(asing).slice(0, 80));

  const kosong = await post('/run/sync', {});
  chk('sync tanpa path: gagal rapi, bukan crash', kosong.code !== 0 && /pakai:|tidak ada/.test((kosong.err || '') + (kosong.out || '')),
      ((kosong.err || '') + (kosong.out || '')).slice(0, 70));

  const buruk = await get('/tidak-ada');
  chk('URL asing dapat 404', buruk.code === 404, 'HTTP ' + buruk.code);

  srv.kill();
  console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
  process.exit(fail ? 1 : 0);
})();
