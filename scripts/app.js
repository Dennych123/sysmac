// Aplikasi lokal: yang di CLI, tapi lewat halaman - tanpa mengetik path dan tanpa mengingat flag.
//
//   node scripts/app.js          lalu buka http://127.0.0.1:7654
//   (atau klik dua kali Susmax.cmd di akar repo)
//
// Kenapa server lokal dan bukan halaman biasa: halaman yang dibuka lewat file:// tidak boleh
// membaca atau menulis berkas di folder mana pun. Server kecil ini yang punya izin itu, dan
// dia cuma mendengar di 127.0.0.1 - tidak ada yang bisa menyentuhnya dari jaringan.
//
// Yang dikerjakan tombolnya SAMA PERSIS dengan perintah CLI-nya: skripnya dijalankan sebagai
// proses anak dan keluarannya ditampilkan apa adanya. Sengaja begitu - kalau halaman ini punya
// salinan logikanya sendiri, dua jalur itu akan berbeda hasil dan yang satu diam-diam salah.
'use strict';
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
// Port bisa disetel lewat lingkungan supaya tes memakai port acak. Dipatok satu angka, tes
// jadi bentrok dengan server yang kebetulan masih hidup - dan yang lebih buruk, DIAM-DIAM
// menguji server itu alih-alih kode ini.
const PORT = +(process.env.SUSMAX_PORT || 7654);

// Cuma perintah yang terdaftar yang boleh jalan. Tanpa daftar ini, apa pun yang dikirim ke
// server bisa dieksekusi - dan server yang menjalankan sembarang perintah bukan alat, itu lubang.
const PERINTAH = {
  sync:  { skrip: 'scripts/nb_sync.js',  arg: ['smc2', 'nb'],   flag: ['rebuild', 'write'] },
  alarm: { skrip: 'scripts/nb_apply.js', arg: ['sumber', 'nb'], flag: ['write'] },
  gen:   { skrip: 'scripts/core.js',     arg: ['project', 'out'], flag: [] },
};

function jalankan(nama, isi, selesai) {
  const p = PERINTAH[nama];
  if (!p) return selesai(2, '', 'perintah tidak dikenal: ' + nama);
  const argv = [path.join(ROOT, p.skrip)];
  for (const a of p.arg) { if (isi[a]) argv.push(String(isi[a])); }
  for (const f of p.flag) { if (isi[f]) argv.push('--' + f); }
  const kid = spawn(process.execPath, argv, { cwd: ROOT });
  let out = '', err = '';
  kid.stdout.on('data', d => out += d);
  kid.stderr.on('data', d => err += d);
  kid.on('close', code => selesai(code, out, err));
  kid.on('error', e => selesai(1, '', e.message));
}

const HALAMAN = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<title>Susmax - alarm ke NB</title><style>
 body{font:14px/1.5 system-ui,Segoe UI,sans-serif;max-width:920px;margin:24px auto;padding:0 16px;color:#111827}
 h1{font-size:19px;margin:0 0 4px} .sub{color:#4b5563;margin:0 0 20px}
 fieldset{border:1px solid #d6dbe3;border-radius:8px;padding:14px 16px;margin:0 0 16px}
 legend{font-weight:600;padding:0 6px}
 label{display:block;margin:10px 0 4px;color:#374151}
 input[type=text]{width:100%;padding:7px 9px;border:1px solid #d6dbe3;border-radius:6px;font:13px ui-monospace,Consolas,monospace}
 .row{display:flex;gap:14px;align-items:center;margin-top:12px;flex-wrap:wrap}
 button{padding:8px 16px;border-radius:6px;border:1px solid #2563eb;background:#2563eb;color:#fff;font-size:14px;cursor:pointer}
 button.ghost{background:#fff;color:#2563eb}
 .chk{display:flex;align-items:center;gap:6px;color:#374151}
 pre{background:#f1f4f8;border:1px solid #d6dbe3;border-radius:8px;padding:12px;overflow-x:auto;white-space:pre-wrap;min-height:60px}
 .hint{color:#4b5563;font-size:12.5px;margin:6px 0 0}
 .bahaya{color:#b91c1c}
</style></head><body>
<h1>Alarm Sysmac &rarr; NB-Designer</h1>
<p class="sub">Tempel path-nya, tekan Lihat dulu. Tidak ada yang ditulis sampai kamu tekan Tulis.</p>

<fieldset><legend>Sinkron komen alarm</legend>
 <label>Project Sysmac (.smc2)</label>
 <input id="smc2" type="text" placeholder="C:\Users\...\New Project.smc2">
 <label>Project NB-Designer (folder atau .nbp)</label>
 <input id="nb" type="text" placeholder="C:\Users\...\Prepare HMI CE INSERTl">
 <div class="row">
  <label class="chk"><input id="rebuild" type="checkbox"> buang semua alarm lama, isi ulang dari .smc2</label>
 </div>
 <p class="hint">Tanpa centang: alarm dicocokkan satu-satu lewat penanda AL[n]/MF[n], yang tidak dikenali dibiarkan.
  Dengan centang: seluruh daftar diganti - <span class="bahaya">alarm yang bukan dari .smc2 ikut hilang</span>.
  Tutup NB-Designer dulu sebelum menulis.</p>
 <div class="row">
  <button class="ghost" onclick="run('sync',0)">Lihat dulu</button>
  <button onclick="run('sync',1)">Tulis ke .nbp</button>
 </div>
</fieldset>

<fieldset><legend>Siapkan berkas Import (AlarmLib.csv)</legend>
 <label>Sumber: project JSON atau AlarmLib.csv</label>
 <input id="sumber" type="text" placeholder="C:\Users\...\project-susmax.json">
 <p class="hint">Menulis AlarmLib-generated.csv di folder project NB (kolom di atas), untuk dimasukkan lewat
  tombol Import di dialog Alarm Setting.</p>
 <div class="row">
  <button class="ghost" onclick="run('alarm',0)">Lihat dulu</button>
  <button onclick="run('alarm',1)">Tulis berkasnya</button>
 </div>
</fieldset>

<pre id="out">siap.</pre>
<script>
function v(id){ return document.getElementById(id).value.trim(); }
function run(cmd, tulis){
  var isi = { smc2:v('smc2'), nb:v('nb'), sumber:v('sumber'),
              rebuild:document.getElementById('rebuild').checked, write:!!tulis };
  var o = document.getElementById('out');
  o.textContent = 'jalan...';
  fetch('/run/' + cmd, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(isi) })
    .then(function(r){ return r.json(); })
    .then(function(j){
      var NL = String.fromCharCode(10);
      o.textContent = (j.out || '') + (j.err ? NL + j.err : '') || '(tidak ada keluaran)';
    })
    .catch(function(e){ o.textContent = 'gagal menghubungi server: ' + e.message; });
}
</script></body></html>`;

http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HALAMAN);
  }
  if (req.method === 'POST' && req.url.startsWith('/run/')) {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 1e6) req.destroy(); });
    return req.on('end', () => {
      let isi = {};
      try { isi = JSON.parse(body || '{}'); } catch (e) {}
      jalankan(req.url.slice(5), isi, (code, out, err) => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ code, out, err }));
      });
    });
  }
  res.writeHead(404); res.end('tidak ada');
// Cuma 127.0.0.1. Server ini menjalankan perintah dan menulis berkas - didengarkan di alamat
// jaringan berarti siapa pun sejaringan bisa menulis ke project HMI dari mesin lain.
}).listen(PORT, '127.0.0.1', () => {
  console.log('Susmax siap di  http://127.0.0.1:' + PORT);
  console.log('Tutup jendela ini kalau sudah selesai.');
});
