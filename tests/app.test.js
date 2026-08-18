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
const srv = spawn(process.execPath, [path.join(root, 'scripts', 'app.js')], { cwd: root });
let siap = '', galat = '';
srv.stdout.on('data', d => siap += d);
srv.stderr.on('data', d => galat += d);
function post(url, body) {
  return new Promise(res => {
    const data = JSON.stringify(body);
    const r = http.request({ host: '127.0.0.1', port: 7654, path: url, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      resp => { let s = ''; resp.on('data', d => s += d); resp.on('end', () => { try { res(JSON.parse(s)); } catch (e) { res({ err: s }); } }); });
    r.on('error', e => res({ err: e.message }));
    r.write(data); r.end();
  });
}
function get(p) {
  return new Promise(res => {
    http.get({ host: '127.0.0.1', port: 7654, path: p }, resp => {
      let s = ''; resp.on('data', d => s += d); resp.on('end', () => res({ code: resp.statusCode, body: s }));
    }).on('error', e => res({ code: 0, body: e.message }));
  });
}
(async () => {
  for (let i = 0; i < 40 && !/siap di/.test(siap); i++) await new Promise(r => setTimeout(r, 100));
  if (/EADDRINUSE/.test(galat)) {
    console.log('>>BAD port 7654 sudah dipakai proses lain - matikan dulu, tes ini tidak boleh');
    console.log('      menguji server yang bukan miliknya.');
    srv.kill(); process.exit(1);
  }
  chk('server hidup', /siap di/.test(siap), (siap + galat).trim().slice(0, 80));

  const hal = await get('/');
  chk('halaman terkirim', hal.code === 200 && /Alarm Sysmac/.test(hal.body), 'HTTP ' + hal.code);
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
