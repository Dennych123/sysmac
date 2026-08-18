// Halaman "Edit assistance": folder kerja, pemantauan otomatis, riwayat .smc2, dan tombol
// kembali ke versi mana pun.
//
// Ini bagian yang bikin menyunting jadi murah: versi sekarang dicatat SEBELUM apa pun diubah -
// berikut berkas `.smc2`-nya sendiri, bukan cuma teks ekstraknya. Yang ternyata salah tinggal
// dikembalikan; yang benar tinggal dilanjutkan.
//
// Halamannya sengaja tipis: semua yang dikerjakan tombolnya lewat /api/* yang sama dengan yang
// dipakai MCP. Kalau halaman ini punya jalur sendiri, dua jalur itu akan berbeda perilaku dan
// yang satu diam-diam salah - persis alasan tombol di halaman alat memanggil skrip CLI apa adanya.
'use strict';

const HALAMAN_EDIT = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Susmax - Edit assistance</title><style>
 :root{--fg:#111827;--muted:#4b5563;--faint:#6b7280;--line:#d6dbe3;--card:#fff;--bg:#f1f4f8;
       --accent:#2563eb;--accent-dk:#1d4ed8;--accent-soft:#eff5ff;--ok:#15803d;--warn:#b45309;--danger:#b91c1c}
 *{box-sizing:border-box}
 body{font:14px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--fg);background:var(--bg);
      max-width:1180px;margin:0 auto;padding:22px 20px 60px}
 h1{font-size:20px;margin:0 0 2px} .sub{color:var(--muted);margin:0 0 16px;font-size:13px}
 .nav{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
 .nav a{font-size:12.5px;color:var(--accent);text-decoration:none;border:1px solid var(--line);
        background:var(--card);border-radius:6px;padding:5px 10px}
 .nav a:hover{border-color:var(--accent);background:var(--accent-soft)}
 .card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:13px 15px;margin:0 0 14px}
 .card h2{font-size:14px;margin:0 0 8px}
 label{display:block;font-size:12.5px;color:var(--muted);margin:8px 0 3px}
 input[type=text]{width:100%;padding:6px 9px;border:1px solid var(--line);border-radius:6px;
                  font:12.5px Consolas,monospace}
 .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px}
 button{padding:6px 13px;border-radius:6px;border:1px solid var(--accent);background:var(--accent);
        color:#fff;font-size:12.5px;cursor:pointer}
 button.ghost{background:var(--card);color:var(--accent)}
 button.danger{background:var(--card);color:var(--danger);border-color:var(--danger)}
 table{border-collapse:collapse;width:100%;font-size:12.5px}
 th{text-align:left;font-weight:600;color:var(--faint);font-size:11.5px;text-transform:uppercase;
    letter-spacing:.04em;padding:0 8px 5px 0;border-bottom:1px solid var(--line)}
 td{padding:5px 8px 5px 0;border-bottom:1px solid #eef2f7;vertical-align:top}
 td.mono,.mono{font-family:Consolas,monospace}
 pre{background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:10px;overflow:auto;
     max-height:340px;font-size:12px;white-space:pre-wrap}
 .files{max-height:190px;overflow:auto;border:1px solid var(--line);border-radius:7px;background:var(--bg)}
 .files div{padding:4px 9px;cursor:pointer;font-family:Consolas,monospace;font-size:12.5px}
 .files div:hover{background:var(--accent-soft)}
 .files div.on{background:var(--accent);color:#fff}
 .hint{font-size:12.5px;color:var(--muted);margin:6px 0 0}
 .hint b{color:var(--warn)}
 .ok{color:var(--ok)} .bad{color:var(--danger)}
 .note{cursor:pointer;border-bottom:1px dashed var(--line);color:var(--muted)}
 .note:hover{color:var(--accent);border-color:var(--accent)}
 .live{display:inline-block;width:8px;height:8px;border-radius:50%;background:#cbd5e1;margin-right:6px}
 .live.on{background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.15)}
</style></head><body>

<div class="nav">
 <a href="/">&larr; Semua alat</a><a href="/index.html">Generator</a>
 <a href="/reader/smc2-viewer.html">Pembaca .smc2</a><a href="/tools">Alat NB</a>
</div>

<h1>Edit assistance</h1>
<p class="sub">Nyalakan pemantauan, lalu sunting di Studio seperti biasa &mdash; tiap simpanan
tercatat sendiri. Yang disimpan berkas <b>.smc2 aslinya</b> berikut teks hasil ekstrak, jadi
<code>git diff</code> kebaca DAN pemulihannya persis byte-nya.</p>

<div class="card">
  <h2>Folder kerja</h2>
  <div class="row">
    <input id="wsdir" type="text" style="flex:1;min-width:260px" placeholder="C:\\Users\\...\\project">
    <button class="ghost" onclick="pilihFolder()">Pilih folder&hellip;</button>
    <button class="ghost" onclick="setWs()">Pindah</button>
  </div>
  <p class="hint">Semua baca-tulis dikurung ke folder ini. Di luar itu ditolak &mdash; server lokal
  tanpa batas berarti apa pun yang jalan di mesin ini bisa meminta berkas apa pun.</p>
</div>

<div class="card">
  <h2>Project .smc2</h2>
  <div class="row">
    <button class="ghost" onclick="cari()">Cari .smc2 di folder kerja</button>
    <button class="ghost" onclick="pilihBerkas()">Pilih berkas&hellip;</button>
    <span id="carimsg" class="hint"></span>
  </div>
  <div class="files" id="daftar"></div>
  <label>Yang dipilih</label>
  <input id="smc2" type="text" placeholder="pilih di atas, atau tekan Pilih berkas">
  <div class="row">
    <button id="watchBtn" class="ghost" onclick="togglePantau()"><span class="live" id="live"></span>Pantau otomatis: MATI</button>
    <span id="watchInfo" class="hint"></span>
  </div>
  <div class="row">
    <input id="pesan" type="text" style="flex:1;min-width:220px" placeholder="catatan (boleh dikosongkan - bisa diisi belakangan)">
    <button class="ghost" onclick="track()">Catat sekarang</button>
    <button class="ghost" onclick="muatRiwayat()">Muat riwayat</button>
  </div>
  <p class="hint">Pemantauan mencatat versi <b>sebelum</b> disunting begitu dinyalakan, lalu tiap
  kali Studio menyimpan. Judulnya dihitung dari bedanya dengan versi sebelumnya; kolom Catatan
  bisa diisi belakangan. <b>Yang tidak pernah dicatat tidak bisa dikembalikan.</b></p>
</div>

<div class="card">
  <h2>Riwayat</h2>
  <table id="riwayat"><tr><td class="hint">belum dimuat</td></tr></table>
  <pre id="isi" style="display:none"></pre>
</div>

<div class="card">
  <h2>Minta bantuan AI</h2>
  <p class="hint" style="margin:0">Dikerjakan dari <b>terminal</b>, bukan dari halaman ini: di
  terminal ada ganti model, konsol penuh, dan riwayat percakapan yang bisa dibaca ulang &mdash;
  tiga hal yang tidak bisa ditiru kotak chat di halaman. Alat yang dipakainya SAMA persis dengan
  tombol-tombol di atas:</p>
  <pre style="margin:8px 0 0">claude mcp add susmax -e SUSMAX_WS=FOLDER_KERJA -- node "REPO/scripts/mcp.js"</pre>
  <p class="hint">Folder kerjanya lewat <b>-e SUSMAX_WS</b>, bukan <code>--ws</code>: <code>claude mcp add</code> ikut mem-parse flag sesudah <code>--</code>, jadi <code>--ws</code> ditolak sebelum sampai ke skripnya (<i>unknown option</i>).</p>
  <p class="hint">Sesudah itu, dari terminal mana pun: <i>"pakai susmax: catat versi mesinA.smc2,
  lalu bandingkan dengan versi kemarin"</i>. Yang dijalankannya <code>watch_start</code>, <code>diff_smc2</code>,
  <code>restore_smc2</code> &mdash; alat yang sama dengan halaman ini, jadi hasilnya tidak bisa berbeda.</p>
</div>

<pre id="log">siap.</pre>

<script>
var HIST = '';
var PANTAU = false;
function $(id){ return document.getElementById(id); }
function tulisLog(t, buruk){ var l=$('log'); l.textContent=t; l.className = buruk?'bad':''; }

function api(nama, isi, metode){
  var opt = { method: metode || 'POST', headers:{'Content-Type':'application/json'} };
  var url = '/api/' + nama;
  if (opt.method === 'GET') {
    var q = Object.keys(isi||{}).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(isi[k]); });
    url += q.length ? '?' + q.join('&') : ''; delete opt.headers;
  } else { opt.body = JSON.stringify(isi||{}); }
  return fetch(url, opt).then(function(r){ return r.json(); }).then(function(j){
    // Galat dari server dilempar sebagai Error supaya SEMUA pemanggil punya satu jalur gagal.
    // Yang dicek per tempat selalu ada yang lupa, dan yang lupa itu diam - tombolnya kelihatan
    // berhasil padahal tidak terjadi apa-apa.
    if (!j.ok) throw new Error(j.error || 'gagal');
    return j.result;
  });
}

function muatWs(){ api('ws/get',{},'GET').then(function(r){ $('wsdir').value = r.root; }); }
function setWs(){
  api('ws/set',{dir:$('wsdir').value.trim()}).then(function(r){
    tulisLog('folder kerja: ' + r.root); cari();
  }, function(e){ tulisLog('gagal pindah folder: ' + e.message, true); });
}

// Dialog dibuka SERVER, bukan browser: <input type=file> tidak pernah memberi path lengkap
// (batas keamanan browser), dan menyalin path dengan tangan itu jalur paling sering salah ketik
// di seluruh alat ini.
function pilihFolder(){
  tulisLog('menunggu dialog... (kalau tidak kelihatan, cek taskbar)');
  api('pick/folder',{title:'Pilih folder kerja', start:$('wsdir').value.trim()}).then(function(r){
    if (!r.path) return tulisLog('tidak jadi memilih');
    $('wsdir').value = r.path; setWs();
  }, function(e){ tulisLog('dialog gagal: ' + e.message, true); });
}
function pilihBerkas(){
  tulisLog('menunggu dialog... (kalau tidak kelihatan, cek taskbar)');
  api('pick/file',{title:'Pilih project .smc2', start:$('wsdir').value.trim()}).then(function(r){
    if (!r.path) return tulisLog('tidak jadi memilih');
    // Yang di LUAR folder kerja dikatakan SEKARANG, bukan nanti waktu tombolnya ditekan dan
    // servernya menolak dengan pesan yang tidak nyambung dengan apa yang barusan diklik.
    if (!r.relative) {
      return tulisLog('berkas itu di luar folder kerja: ' + r.path +
                      '  -  tekan "Pilih folder" dulu dan arahkan ke induknya', true);
    }
    // Path ABSOLUT yang dipakai, bukan yang relatif: yang relatif berubah arti begitu folder
    // kerjanya pindah, dan yang terjadi berikutnya bukan "salah folder" yang kelihatan
    // melainkan berkas dicari di tempat lain dengan pesan yang menyalahkan berkasnya.
    pakaiBerkas(r.path);
  }, function(e){ tulisLog('dialog gagal: ' + e.message, true); });
}

function pakaiBerkas(rel){
  $('smc2').value = rel;
  HIST = rel.replace(/\\.smc2$/i,'') + '-history';
  tulisLog('dipilih: ' + rel);
  muatRiwayat(); cekPantau();
}

function cari(){
  $('carimsg').textContent = 'mencari...';
  api('fs/find',{pattern:'*.smc2',limit:'100'},'GET').then(function(r){
    var d = $('daftar'); d.innerHTML = '';
    $('carimsg').textContent = r.files.length + ' berkas';
    r.files.forEach(function(f){
      var el = document.createElement('div');
      el.textContent = f;
      el.onclick = function(){
        var lama = d.querySelector('.on'); if (lama) lama.className='';
        el.className='on'; pakaiBerkas(f);
      };
      d.appendChild(el);
    });
  }, function(e){ $('carimsg').textContent = e.message; });
}

function track(){
  var p = $('smc2').value.trim();
  if (!p) return tulisLog('pilih berkas .smc2 dulu', true);
  tulisLog('mencatat...');
  api('git/track',{path:p, message:$('pesan').value.trim()}).then(function(r){
    HIST = r.dir;
    tulisLog(r.changed ? ('tercatat: ' + r.message + '  (' + r.dir + ')')
                       : 'tidak ada perubahan sejak catatan terakhir');
    muatRiwayat();
  }, function(e){ tulisLog('gagal mencatat: ' + e.message, true); });
}

function cekPantau(){
  var p = $('smc2').value.trim();
  if (!p) return;
  api('watch/status',{path:p},'GET').then(function(r){
    PANTAU = !!r.watching;
    $('watchBtn').className = PANTAU ? '' : 'ghost';
    $('watchBtn').innerHTML = '<span class="live' + (PANTAU?' on':'') + '"></span>Pantau otomatis: ' +
                              (PANTAU ? 'HIDUP' : 'MATI');
    $('watchInfo').textContent = PANTAU
      ? ((r.commits||0) + ' versi tercatat sejak dipantau') +
        (r.pending ? '  |  berkas sedang berubah...' : '') +
        (r.lastError ? '  |  terakhir gagal: ' + r.lastError : '')
      : '';
  }, function(){});
}

function togglePantau(){
  var p = $('smc2').value.trim();
  if (!p) return tulisLog('pilih berkas .smc2 dulu', true);
  var mau = PANTAU ? 'watch/stop' : 'watch/start';
  api(mau, {path:p}).then(function(r){
    if (r.dir) HIST = r.dir;
    tulisLog(PANTAU ? 'pemantauan dihentikan'
                    : 'dipantau - sunting di Studio seperti biasa, tiap simpanan tercatat sendiri');
    cekPantau(); muatRiwayat();
  }, function(e){ tulisLog('gagal: ' + e.message, true); });
}

// Selama dipantau, riwayatnya ikut disegarkan sendiri - versi yang barusan tercatat harus
// kelihatan tanpa perlu ada yang menekan "Muat riwayat".
setInterval(function(){
  if (!$('smc2').value.trim()) return;
  cekPantau();
  if (PANTAU) muatRiwayat();
}, 8000);

function muatRiwayat(){
  var p = $('smc2').value.trim();
  if (!HIST && p) HIST = p.replace(/\\.smc2$/i,'') + '-history';
  if (!HIST) return;
  api('git/log',{dir:HIST,limit:'40'},'GET').then(function(r){
    var t = $('riwayat');
    if (!r.repo || !r.entries.length){
      t.innerHTML = '<tr><td class="hint">belum ada catatan buat berkas ini &mdash; nyalakan pemantauan atau tekan "Catat sekarang"</td></tr>';
      return;
    }
    var h = '<tr><th>Versi</th><th>Waktu</th><th>Apa yang berubah</th><th>Catatan</th><th></th></tr>';
    r.entries.forEach(function(e){
      var note = (e.note || '').replace(/"/g,'&quot;');
      h += '<tr><td class="mono">' + e.hash + '</td><td>' + e.date + '</td>' +
           '<td>' + e.subject + '</td>' +
           '<td><span class="note" data-note="' + note + '" onclick="ubahCatatan(this)" data-rev="' + e.hash + '">' +
           (e.note ? e.note : '<i>+ tambah catatan</i>') + '</span></td>' +
           '<td><button class="ghost" data-rev="' + e.hash + '" onclick="lihat(this)">Lihat</button> ' +
           '<button class="danger" data-rev="' + e.hash + '" onclick="pulihkan(this)">Kembalikan</button></td></tr>';
    });
    t.innerHTML = h;
  }, function(e){ tulisLog(e.message, true); });
}

// Judul menyusul. Disimpan sebagai git notes - hash commit-nya TIDAK berubah, jadi tombol
// "Kembalikan" di sebelahnya tetap menunjuk versi yang sama persis.
function ubahCatatan(el){
  var rev = el.getAttribute('data-rev');
  var teks = prompt('Catatan buat versi ' + rev + ':', el.getAttribute('data-note') || '');
  if (teks === null) return;
  api('git/message',{dir:HIST, rev:rev, message:teks}).then(function(){
    tulisLog('catatan disimpan buat ' + rev); muatRiwayat();
  }, function(e){ tulisLog('gagal menyimpan catatan: ' + e.message, true); });
}

function lihat(el){
  api('git/show',{dir:HIST,rev:el.getAttribute('data-rev')},'GET').then(function(r){
    var box = $('isi'); box.style.display='block'; box.textContent = r.diff || '(kosong)';
  }, function(e){ tulisLog(e.message, true); });
}

function pulihkan(el){
  var rev = el.getAttribute('data-rev');
  var p = $('smc2').value.trim();
  // Konfirmasi karena ini MENIMPA berkas project yang sedang dipakai. Yang ditimpa tetap
  // dicadangkan server, tapi yang mengklik tanpa sadar tetap kehilangan konteks kerjanya.
  if (!confirm('Kembalikan ' + p + ' ke versi ' + rev + '?\\n\\nBerkas sekarang dicadangkan dulu, ' +
               'tapi Sysmac Studio harus DITUTUP - kalau tidak, versi di memori Studio menimpa ' +
               'lagi waktu disimpan.')) return;
  api('git/restore',{dir:HIST,rev:rev,to:p}).then(function(r){
    tulisLog('dikembalikan ke ' + r.from + ' (' + r.bytes + ' byte). Buka lagi di Studio.');
    muatRiwayat();
  }, function(e){ tulisLog('gagal mengembalikan: ' + e.message, true); });
}

muatWs();
cari();
</script></body></html>`;

module.exports = { HALAMAN_EDIT };
