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

  const hal = await get('/tools');
  chk('halaman terkirim', hal.code === 200 && /Alarm Sysmac/.test(hal.body), 'HTTP ' + hal.code);
  chk('halaman alat menaut balik ke generator', /href="\/"/.test(hal.body));

  // Berkas statis didaftar satu-satu, bukan folder. Server ini jalan di folder repo yang juga
  // memuat kunci privat OPC UA dan project pelanggan - "layani seluruh folder" berarti semuanya
  // itu bisa diambil lewat HTTP oleh apa pun yang jalan di mesin ini.
  const edit = await get('/edit');
  chk('halaman Edit assistance terkirim', edit.code === 200 && /Edit assistance/.test(edit.body),
      'HTTP ' + edit.code);
  const skripEdit = (/<script>([\s\S]*?)<\/script>/.exec(edit.body) || [])[1] || '';
  let editOk = false, sebabEdit = '';
  try { new Function(skripEdit); editOk = true; } catch (e) { sebabEdit = e.message; }
  chk('skrip halaman Edit bisa di-parse', editOk, sebabEdit);
  chk('halaman Edit mengingatkan menutup Studio sebelum memulihkan',
      /DITUTUP/.test(edit.body));

  // API dipakai halaman Edit DAN oleh MCP - satu jalur, jadi tidak bisa berbeda perilaku.
  const apiWs = await get('/api/ws/get');
  chk('API menjawab JSON', apiWs.code === 200 && /"ok":true/.test(apiWs.body), apiWs.body.slice(0, 80));
  const apiJahat = await get('/api/fs/read?path=../../../Windows/win.ini');
  chk('API menolak keluar folder kerja',
      /"ok":false/.test(apiJahat.body) && /folder kerja/.test(apiJahat.body), apiJahat.body.slice(0, 90));
  // /api/ping itu penanda "server hidup" buat halaman yang dibuka dari file://. Dia SATU-SATUNYA
  // yang boleh dipanggil lintas asal, dan isinya tidak boleh memuat data selain versi + folder
  // kerja - kalau seluruh API ikut terbuka, halaman web mana pun yang kebetulan terbuka di
  // browser yang sama bisa membaca dan menulis folder kerja lewat server ini.
  const ping = await get('/api/ping');
  chk('ping menjawab dan menyebut folder kerja',
      ping.code === 200 && /"ok":true/.test(ping.body) && /"root"/.test(ping.body),
      ping.body.slice(0, 90));
  chk('ping boleh lintas asal', /susmax/.test(ping.body));

  const asalLain = await getWithHeaders('/api/fs/list', { Origin: 'https://jahat.example' });
  chk('API selain ping menolak permintaan dari asal lain',
      asalLain.code === 403 && /asal lain/.test(asalLain.body), asalLain.code + ' ' + asalLain.body.slice(0, 70));
  const asalSendiri = await getWithHeaders('/api/ws/get', { Origin: 'http://127.0.0.1:' + PORT });
  chk('permintaan dari halaman sendiri tetap diterima',
      asalSendiri.code === 200 && /"ok":true/.test(asalSendiri.body), asalSendiri.body.slice(0, 70));

  const apiAsing = await get('/api/tidak/ada');
  chk('API tak dikenal ditolak rapi', /"ok":false/.test(apiAsing.body), apiAsing.body.slice(0, 80));

  chk('halaman Edit punya tombol pantau otomatis', /watchBtn/.test(edit.body));
  // Kotak chat di halaman DICABUT atas permintaan pemiliknya: tidak bisa ganti model, tidak ada
  // konsol penuh, dan konteksnya nyasar (dia membaca riwayat git folder induk, bukan project
  // yang dipilih). Yang tersisa penunjuk ke terminal - dan penunjuk itu harus benar-benar ada,
  // kalau tidak halaman ini cuma menghilangkan fiturnya tanpa memberi tahu ke mana perginya.
  chk('kotak chat sudah tidak ada di halaman', !/id="obrolan"/.test(edit.body));
  chk('halaman menunjuk jalur terminal (MCP)', /claude mcp add susmax/.test(edit.body));
  const chatStat = await get('/api/chat/status');
  chk('API chat ikut dicabut', /"ok":false/.test(chatStat.body), chatStat.body.slice(0, 80));

  const tools = await get('/tools');
  chk('halaman NB menawarkan project yang sudah dipantau', /id="tracked"/.test(tools.body));
  chk('halaman NB punya sinkron berkelanjutan', /contBtn/.test(tools.body));
  chk('halaman NB punya dialog pilih berkas/folder',
      /pilihSmc2/.test(tools.body) && /pilihNb/.test(tools.body));

  const doc = await get('/TODO.md');
  chk('berkas dalam daftar putih terkirim', doc.code === 200 && doc.body.length > 100, 'HTTP ' + doc.code);
  for (const jahat of ['/../CLAUDE.md', '/reader/../../secret', '/tools/opcua/pki/own/private/key.pem',
                       '/package.json', '/scripts/app.js']) {
    const r = await get(jahat);
    chk('di luar daftar putih ditolak: ' + jahat, r.code === 404, 'HTTP ' + r.code);
  }
  // Halaman terkirim bukan berarti halaman JALAN. Tombolnya pernah diam total: HALAMAN itu
  // template literal di app.js, escape baris-baru yang ditulis tunggal jadi baris baru
  // sungguhan, literal JS-nya putus, dan run() tidak pernah terdefinisi. Tidak ada error di
  // halaman, tidak ada di server - tombolnya cuma tidak melakukan apa-apa.
  const skrip = (/<script>([\s\S]*?)<\/script>/.exec(hal.body) || [])[1] || '';
  let sintaksOk = false, sebab = '';
  try { new Function(skrip); sintaksOk = true; } catch (e) { sebab = e.message; }
  chk('skrip di halaman bisa di-parse', sintaksOk, sebab);
  chk('run() benar-benar terdefinisi di skripnya', /function run\(/.test(skrip));
  // 5 = 2 sync + 2 alarm + 1 diff. Angkanya dipatok supaya tombol yang ditambah tanpa jalur
  // run()-nya (atau sebaliknya) ketahuan - tombol mati itu kegagalan yang paling sering di sini.
  chk('tiap tombol memanggil run()', (hal.body.match(/onclick="run\(/g) || []).length === 5,
      (hal.body.match(/onclick="run\(/g) || []).length + ' tombol');
  chk('halaman menyebut risiko rebuild', /ikut hilang/.test(hal.body));
  chk('halaman mengingatkan menutup NB-Designer', /Tutup NB-Designer/.test(hal.body));

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
