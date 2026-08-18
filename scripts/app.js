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
const fs = require('fs');
const { spawn } = require('child_process');
const api = require('./api.js');
const ws = require('./ws.js');
const { HALAMAN_EDIT } = require('./edit_page.js');

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
  // Pembanding dua .smc2 - HANYA BACA, jadi tidak punya flag tulis sama sekali.
  diff:  { skrip: 'scripts/smc2_diff.js', arg: ['lama', 'baru'], flag: [] },
};

// Berkas yang boleh dilayani, DIDAFTAR SATU-SATU. Bukan folder statis: server ini jalan di
// folder repo yang juga memuat kunci OPC UA dan project pelanggan, dan "layani seluruh folder"
// berarti apa pun di situ - termasuk yang tidak pernah dimaksudkan - bisa diambil lewat HTTP.
// Path dari URL TIDAK PERNAH dipakai membentuk nama berkas; yang dipakai nilai di peta ini.
const HALAMAN_STATIS = {
  // `/` itu halaman UTAMA (daftar alat), bukan generator. Generator satu halaman kerja panjang;
  // menaruhnya di akar bikin alat lain cuma ketemu kalau seseorang menggulir sampai bawah.
  '/': { berkas: 'home.html', tipe: 'text/html; charset=utf-8' },
  '/home.html': { berkas: 'home.html', tipe: 'text/html; charset=utf-8' },
  '/index.html': { berkas: 'index.html', tipe: 'text/html; charset=utf-8' },
  '/reader/smc2-viewer.html': { berkas: 'reader/smc2-viewer.html', tipe: 'text/html; charset=utf-8' },
  '/README.md': { berkas: 'README.md', tipe: 'text/plain; charset=utf-8' },
  '/CLAUDE.md': { berkas: 'CLAUDE.md', tipe: 'text/plain; charset=utf-8' },
  '/TODO.md': { berkas: 'TODO.md', tipe: 'text/plain; charset=utf-8' },
  '/docs/SYSMAC_INSTRUCTIONS.md': { berkas: 'docs/SYSMAC_INSTRUCTIONS.md', tipe: 'text/plain; charset=utf-8' },
  '/reader/README.md': { berkas: 'reader/README.md', tipe: 'text/plain; charset=utf-8' },
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
 .nav{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
 .nav a{font-size:12.5px;color:#2563eb;text-decoration:none;border:1px solid #d6dbe3;border-radius:6px;padding:5px 10px}
 .nav a:hover{border-color:#2563eb;background:#eff5ff}
 .aman{color:#15803d;font-weight:600}
 select{padding:6px 8px;border:1px solid #d6dbe3;border-radius:6px;font-size:12.5px}
</style></head><body>
<!-- Tiap halaman di repo ini menyebut yang lain. Sebelumnya generator dan pembaca .smc2 tidak
     pernah bertaut sama sekali: yang membuka salah satunya tidak punya cara tahu yang lain ada. -->
<div class="nav">
 <a href="/">&larr; Semua alat</a>
 <a href="/index.html">Generator</a>
 <a href="/reader/smc2-viewer.html">Pembaca .smc2</a>
 <a href="/README.md">README</a>
 <a href="/TODO.md">TODO</a>
 <a href="/docs/SYSMAC_INSTRUCTIONS.md">353 instruksi</a>
</div>
<h1>Alarm Sysmac &rarr; NB-Designer</h1>
<div class="row" style="margin:0 0 10px">
 <span class="hint" style="margin:0">Folder kerja:</span>
 <input id="wsdir" type="text" style="flex:1;min-width:240px" readonly>
 <button class="ghost" onclick="pilihWs()">Pindah&hellip;</button>
</div>
<p class="sub">Tempel path-nya, tekan Lihat dulu. Tidak ada yang ditulis sampai kamu tekan Tulis.</p>

<fieldset><legend>Sinkron komen alarm</legend>
 <label>Project Sysmac (.smc2)</label>
 <div class="row">
  <select id="tracked" style="flex:1;min-width:220px" onchange="pakaiTracked()">
   <option value="">- project yang sudah dipantau Edit assistance -</option>
  </select>
  <button class="ghost" onclick="pilihSmc2()">Pilih berkas&hellip;</button>
 </div>
 <input id="smc2" type="text" placeholder="C:\Users\...\New Project.smc2">
 <label>Project NB-Designer (folder atau .nbp)</label>
 <div class="row">
  <input id="nb" type="text" style="flex:1;min-width:260px" placeholder="C:\Users\...\Prepare HMI CE INSERTl">
  <button class="ghost" onclick="pilihNb()">Pilih folder&hellip;</button>
 </div>
 <div class="row">
  <label class="chk"><input id="rebuild" type="checkbox"> buang semua alarm lama, isi ulang dari .smc2</label>
 </div>
 <p class="hint">Tanpa centang: alarm dicocokkan satu-satu lewat penanda AL[n]/MF[n], yang tidak dikenali dibiarkan.
  Dengan centang: seluruh daftar diganti - <span class="bahaya">alarm yang bukan dari .smc2 ikut hilang</span>.
  Tutup NB-Designer dulu sebelum menulis.</p>
 <div class="row">
  <button class="ghost" onclick="run('sync',0)">Lihat dulu</button>
  <button onclick="run('sync',1)">Tulis ke .nbp</button>
  <button id="contBtn" class="ghost" onclick="toggleCont()">Sinkron berkelanjutan: MATI</button>
  <span id="contInfo" class="hint" style="margin:0"></span>
 </div>
 <p class="hint">Sinkron berkelanjutan memakai pemicu yang SAMA dengan Edit assistance: begitu
 Studio menyimpan .smc2-nya, versinya dicatat ke riwayat lalu alarmnya ditulis ke NB. Satu
 pemantau untuk satu berkas &mdash; dua pemantau pasti berbeda pendapat soal "sudah selesai
 ditulis belum", dan yang satu akan membaca project yang separuh.</p>
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

<fieldset><legend>Bandingkan dua project Sysmac <span class="aman">(hanya baca)</span></legend>
 <label>Versi LAMA (.smc2)</label>
 <input id="lama" type="text" placeholder="C:\Users\...\Prepare CE insert3 - kemarin.smc2">
 <label>Versi BARU (.smc2)</label>
 <input id="baru" type="text" placeholder="C:\Users\...\Prepare CE insert3.smc2">
 <p class="hint">Urutannya lama dulu. Ketuker, tambah dan hapus ikut ketuker dan laporannya membaca terbalik.
  Yang dicari terutama satu: <b>alamat AT atau nomor alarm yang bergeser</b> - itu satu-satunya perubahan
  yang tidak kelihatan di layar Studio maupun di layar NB, dua-duanya tetap menyala menunjuk bit lain.</p>
 <div class="row">
  <button class="ghost" onclick="run('diff',0)">Bandingkan</button>
 </div>
</fieldset>

<pre id="out">siap.</pre>
<script>
function v(id){ return document.getElementById(id).value.trim(); }
function el(id){ return document.getElementById(id); }

function api(nama, isi, metode){
  var opt = { method: metode || 'POST', headers:{'Content-Type':'application/json'} };
  var url = '/api/' + nama;
  if (opt.method === 'GET') {
    var q = Object.keys(isi||{}).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(isi[k]); });
    url += q.length ? '?' + q.join('&') : ''; delete opt.headers;
  } else { opt.body = JSON.stringify(isi||{}); }
  return fetch(url, opt).then(function(r){ return r.json(); }).then(function(j){
    if (!j.ok) throw new Error(j.error || 'gagal'); return j.result;
  });
}

// Project yang sudah dicatat Edit assistance muncul di sini apa adanya. Tanpa ini, path yang
// sama harus diketik ulang di dua halaman - dan yang diketik ulang itu yang salah ketik.
function muatWsBar(){
  api('ws/get',{},'GET').then(function(r){ el('wsdir').value = r.root; }, function(){});
}
// Folder kerja bisa dipindah dari sini juga. Bolak-balik ke halaman lain cuma buat memindahnya
// bikin orang lupa folder mana yang sedang aktif - dan path relatif yang tersimpan di halaman
// ini berubah arti begitu folder kerjanya lain.
function pilihWs(){
  el('out').textContent = 'menunggu dialog...';
  api('pick/folder',{title:'Pilih folder kerja'}).then(function(r){
    if (!r.path) { el('out').textContent = 'tidak jadi memilih'; return; }
    return api('ws/set',{dir:r.path}).then(function(w){
      el('wsdir').value = w.root;
      el('out').textContent = 'folder kerja: ' + w.root + ' (tersimpan, ikut terpakai lain kali)';
      el('tracked').length = 1;
      muatTracked();
    });
  }, function(e){ el('out').textContent = 'gagal: ' + e.message; });
}

function muatTracked(){
  api('track/list',{},'GET').then(function(r){
    var sel = el('tracked');
    r.items.forEach(function(it){
      var o = document.createElement('option');
      o.value = it.smc2;
      o.textContent = it.smc2 + '   (' + String(it.last||'').slice(0,10) + ')';
      sel.appendChild(o);
    });
  }, function(){});
}
function pakaiTracked(){
  var p = el('tracked').value;
  if (p) { el('smc2').value = p; cekCont(); }
}
function pilihSmc2(){
  el('out').textContent = 'menunggu dialog... (kalau tidak kelihatan, cek taskbar)';
  api('pick/file',{title:'Pilih project .smc2'}).then(function(r){
    if (!r.path) { el('out').textContent = 'tidak jadi memilih'; return; }
    el('smc2').value = r.path;
    el('out').textContent = 'dipilih: ' + el('smc2').value;
    cekCont();
  }, function(e){ el('out').textContent = 'dialog gagal: ' + e.message; });
}
function pilihNb(){
  el('out').textContent = 'menunggu dialog...';
  api('pick/folder',{title:'Pilih folder project NB-Designer'}).then(function(r){
    if (!r.path) { el('out').textContent = 'tidak jadi memilih'; return; }
    el('nb').value = r.path;
    el('out').textContent = 'dipilih: ' + el('nb').value;
  }, function(e){ el('out').textContent = 'dialog gagal: ' + e.message; });
}

var CONT = false;
function cekCont(){
  var p = v('smc2');
  if (!p) return;
  api('watch/status',{path:p},'GET').then(function(r){
    CONT = !!r.watching;
    el('contBtn').textContent = 'Sinkron berkelanjutan: ' + (CONT ? 'HIDUP' : 'MATI');
    el('contBtn').className = CONT ? '' : 'ghost';
    el('contInfo').textContent = CONT
      ? ((r.commits||0) + ' versi tercatat' +
         (r.nb ? '  |  NB: ' + (r.nb.code === 0 ? (r.nb.out || 'tersinkron') : 'GAGAL ' + r.nb.err) : ''))
      : '';
  }, function(){});
}
function toggleCont(){
  var p = v('smc2');
  if (!p) { el('out').textContent = 'isi path .smc2 dulu'; return; }
  if (!CONT && !v('nb')) { el('out').textContent = 'isi juga folder project NB-nya'; return; }
  // Menyalakannya berarti NB DITULIS tiap kali Studio menyimpan - dikatakan sekali di depan,
  // bukan disembunyikan di balik kata "berkelanjutan".
  if (!CONT && !confirm('Tiap kali Studio menyimpan ' + p + ', alarmnya langsung DITULIS ke ' +
      v('nb') + '.\\n\\nTutup NB-Designer selama ini aktif - dia menulis ulang berkasnya waktu ' +
      'project disimpan, jadi hasil sinkron bisa tertimpa.')) return;
  api(CONT ? 'watch/stop' : 'watch/start', { path: p, nb: v('nb'), nbWrite: true }).then(function(){
    el('out').textContent = CONT ? 'sinkron berkelanjutan dimatikan'
                                 : 'aktif - simpan di Studio, alarmnya menyusul sendiri';
    cekCont();
  }, function(e){ el('out').textContent = 'gagal: ' + e.message; });
}
setInterval(function(){ if (v('smc2')) cekCont(); }, 8000);
window.addEventListener('load', function(){ muatWsBar(); muatTracked(); cekCont(); });
function run(cmd, tulis){
  var isi = { smc2:v('smc2'), nb:v('nb'), sumber:v('sumber'), lama:v('lama'), baru:v('baru'),
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
  // Query string dibuang dulu. Tanpa itu "/index.html?x=1" tidak cocok satu pun kunci peta
  // dan halaman generator-nya balas 404 - kelihatan seperti berkasnya hilang.
  const url = (req.url || '').split('?')[0];

  if (req.method === 'GET' && url === '/edit') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HALAMAN_EDIT);
  }
  if (req.method === 'GET' && url === '/tools') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HALAMAN);
  }
  if (req.method === 'GET' && HALAMAN_STATIS[url]) {
    const s = HALAMAN_STATIS[url];
    const p = path.join(ROOT, s.berkas);
    let isi;
    try { isi = fs.readFileSync(p); } catch (e) {
      // index.html itu HASIL BUILD dan tidak ikut ter-commit di semua salinan repo. Yang
      // hilang harus menyebut cara membuatnya; 404 polos terbaca seperti server yang rusak.
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('tidak ada: ' + s.berkas + '\n\nbuild dulu:  python scripts/build_html.py' +
                     (s.berkas.indexOf('reader/') === 0 ? '\n             cd reader && node build.js' : ''));
    }
    res.writeHead(200, { 'Content-Type': s.tipe });
    return res.end(isi);
  }
  // ------------------------------------------------------------------ API
  // Yang bikin alat-alat ini berhenti jadi "halaman yang menunggu berkasnya di-drag": halaman
  // menyebut PATH, server yang membaca dan menulis. Semua path dikurung ke folder kerja
  // (scripts/ws.js) - server lokal tanpa batas itu bukan alat, itu pintu terbuka buat apa pun
  // yang kebetulan jalan di mesin ini.
  // Penanda "server hidup" buat halaman yang dibuka dari file://. Cuma INI yang boleh
  // dipanggil lintas asal, dan jawabannya tidak memuat data apa pun selain versi + folder kerja:
  // membuka seluruh API ke lintas asal berarti halaman web mana pun yang kebetulan terbuka bisa
  // membaca dan menulis folder kerja lewat browser ini.
  if (url === '/api/ping') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    return res.end(JSON.stringify({ ok: true, app: 'susmax', port: PORT, root: ws.getRoot() }));
  }

  if (url.startsWith('/api/')) {
    const nama = url.slice(5);
    // Permintaan dari asal LAIN ditolak. Tanpa ini, halaman web mana pun yang sedang terbuka di
    // browser yang sama bisa menyuruh server ini membaca/menulis berkas - server lokal yang
    // menerima perintah dari luar itu bukan alat, itu lubang.
    const asal = req.headers.origin;
    if (asal && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(asal)) {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: 'permintaan dari asal lain ditolak: ' + asal }));
    }
    const kirim = (kode, isi) => {
      res.writeHead(kode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(isi));
    };
    const jalan = (isi) => api.panggil(nama, isi)
      .then(hasil => kirim(200, { ok: true, result: hasil }))
      // Galat dikirim sebagai JSON ber-ok:false, bukan HTTP 500 polos: halaman perlu ALASANNYA
      // ("di luar folder kerja", "section tidak ketemu"), dan 500 tanpa isi cuma bikin orang
      // menebak - biasanya menebak servernya yang rusak.
      .catch(e => kirim(200, { ok: false, error: e.message }));

    if (req.method === 'GET') {
      const q = {};
      const qs = (req.url.split('?')[1] || '').split('&');
      qs.forEach(pair => {
        if (!pair) return;
        const i = pair.indexOf('=');
        const k = decodeURIComponent(i < 0 ? pair : pair.slice(0, i));
        q[k] = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
      });
      return jalan(q);
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', d => { body += d; if (body.length > 32e6) req.destroy(); });
      return req.on('end', () => {
        let isi = {};
        try { isi = JSON.parse(body || '{}'); } catch (e) { return kirim(200, { ok: false, error: 'JSON rusak' }); }
        jalan(isi);
      });
    }
    return kirim(405, { ok: false, error: 'metode tidak didukung' });
  }

  if (req.method === 'POST' && url.startsWith('/run/')) {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 1e6) req.destroy(); });
    return req.on('end', () => {
      let isi = {};
      try { isi = JSON.parse(body || '{}'); } catch (e) {}
      jalankan(url.slice(5), isi, (code, out, err) => {
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
  console.log('Folder kerja    ' + ws.getRoot() + '   (ganti: --ws <folder> atau SUSMAX_WS)');
  console.log('Tutup jendela ini kalau sudah selesai.');
});
