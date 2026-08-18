// scripts/app.js - server lokal yang MENJALANKAN PERINTAH dan MENULIS BERKAS.
// Yang diuji sifat yang kalau rusak berbahaya, bukan tampilannya:
//   - cuma perintah terdaftar yang boleh jalan
//   - cuma mendengar di 127.0.0.1
//   - tanpa centang tulis, tidak ada yang ditulis
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
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

  const hal = await get('/');
  chk('halaman terkirim', hal.code === 200 && /Alarm Sysmac/.test(hal.body), 'HTTP ' + hal.code);
  // Halaman terkirim bukan berarti halaman JALAN. Tombolnya pernah diam total: HALAMAN itu
  // template literal di app.js, escape baris-baru yang ditulis tunggal jadi baris baru
  // sungguhan, literal JS-nya putus, dan run() tidak pernah terdefinisi. Tidak ada error di
  // halaman, tidak ada di server - tombolnya cuma tidak melakukan apa-apa.
  const skrip = (/<script>([\s\S]*?)<\/script>/.exec(hal.body) || [])[1] || '';
  let sintaksOk = false, sebab = '';
  try { new Function(skrip); sintaksOk = true; } catch (e) { sebab = e.message; }
  chk('skrip di halaman bisa di-parse', sintaksOk, sebab);
  chk('run() benar-benar terdefinisi di skripnya', /function run\(/.test(skrip));
  chk('tiap tombol memanggil run()', (hal.body.match(/onclick="run\(/g) || []).length === 4,
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
