// Satu halaman kerja: pilih FOLDER PROJECT sekali, sisanya mengikuti.
//
// Sebelumnya alatnya tersebar - riwayat di satu halaman, sinkron NB di halaman lain, dan tiap
// halaman meminta path yang sama dipilih ulang. Yang terjadi bukan cuma repot: folder HMI yang
// dipilih di satu halaman tidak diingat halaman lain, jadi tiap bolak-balik memilih lagi - dan
// salah pilih sekali berarti alarm ditulis ke project HMI yang salah.
//
// Sekarang yang dipilih SATU folder, yaitu folder mesinnya. PLC (.smc2) dan HMI (.nbp) dicari
// di dalamnya, dan pilihannya diingat. Urutan halaman mengikuti cara kerjanya: pilih folder ->
// pantau + riwayat -> alarm ke HMI. Yang jarang dipakai dilipat ke "Lanjutan".
'use strict';

const HALAMAN_EDIT = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Susmax - Project</title><style>
 :root{--fg:#111827;--muted:#4b5563;--faint:#6b7280;--line:#d6dbe3;--line-soft:#e6eaf0;
       --card:#fff;--bg:#f1f4f8;--accent:#2563eb;--accent-dk:#1d4ed8;--accent-soft:#eff5ff;
       --ok:#15803d;--warn:#b45309;--danger:#b91c1c}
 *{box-sizing:border-box}
 body{font:14px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--fg);background:var(--bg);
      max-width:940px;margin:0 auto;padding:20px 20px 60px}
 h1{font-size:19px;margin:0 0 3px}
 .lede{color:var(--muted);font-size:12.5px;margin:0 0 14px}
 .nav{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}
 .nav a{font-size:12.5px;color:var(--accent);text-decoration:none;border:1px solid var(--line);
        background:var(--card);border-radius:6px;padding:5px 10px}
 .nav a:hover{border-color:var(--accent);background:var(--accent-soft)}
 .step{background:var(--card);border:1px solid var(--line);border-radius:9px;padding:14px 16px;margin:0 0 12px}
 .step.mati{opacity:.5}
 .step h2{font-size:14px;margin:0 0 3px;display:flex;align-items:center;gap:8px}
 .step h2 .no{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;
              border-radius:50%;background:var(--accent);color:#fff;font-size:11.5px;flex:none}
 .apa{font-size:12.5px;color:var(--muted);margin:0 0 10px}
 .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:9px}
 input[type=text]{flex:1;min-width:230px;padding:7px 9px;border:1px solid var(--line);border-radius:6px;
                  font:12.5px Consolas,monospace;background:var(--card);color:var(--fg)}
 select{flex:1;min-width:200px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-size:12.5px}
 button{padding:7px 13px;border-radius:6px;border:1px solid var(--accent);background:var(--accent);
        color:#fff;font-size:12.5px;cursor:pointer}
 button.ghost{background:var(--card);color:var(--accent)}
 button.danger{background:var(--card);color:var(--danger);border-color:var(--danger)}
 .sw{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:var(--muted);cursor:pointer}
 .live{display:inline-block;width:8px;height:8px;border-radius:50%;background:#cbd5e1;flex:none}
 .live.on{background:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.15)}
 .status{font-size:12.5px;color:var(--muted);margin-top:8px}
 .status.ok{color:var(--ok)} .status.bad{color:var(--danger)}
 .isi{font-family:Consolas,monospace;font-size:12px;color:var(--muted);margin-top:8px;line-height:1.7}
 .isi b{color:var(--fg)}
 table{border-collapse:collapse;width:100%;font-size:12.5px;margin-top:8px}
 th{text-align:left;font-weight:600;color:var(--faint);font-size:11px;text-transform:uppercase;
    letter-spacing:.04em;padding:0 8px 5px 0;border-bottom:1px solid var(--line)}
 td{padding:5px 8px 5px 0;border-bottom:1px solid var(--line-soft);vertical-align:top}
 td.mono{font-family:Consolas,monospace}
 .note{cursor:pointer;border-bottom:1px dashed var(--line);color:var(--muted)}
 .note:hover{color:var(--accent);border-color:var(--accent)}
 pre{background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:10px;overflow:auto;
     max-height:300px;font-size:12px;white-space:pre-wrap;margin:10px 0 0}
 details{margin:16px 0 0;border-top:1px solid var(--line);padding-top:12px}
 summary{cursor:pointer;font-size:13px;color:var(--muted)}
 .kecil{font-size:12px;color:var(--faint);margin:7px 0 0}
 .kecil b{color:var(--warn)}
</style></head><body>

<div class="nav">
 <a href="/">Semua alat</a><a href="/index.html">Generator</a>
 <a href="/reader/smc2-viewer.html">Pembaca .smc2</a>
</div>

<div id="basi" style="display:none"></div>
<h1>Project</h1>
<p class="lede">Pilih folder mesinnya sekali. PLC dan HMI di dalamnya dikenali sendiri, dan
pilihannya diingat &mdash; termasuk sesudah server dimatikan.</p>

<div class="step" id="s1">
  <h2><span class="no">1</span>Folder project</h2>
  <p class="apa">Satu folder per mesin: berkas <code>.smc2</code> dan folder project NB-Designer
  ada di dalamnya.</p>
  <div class="row">
    <input id="folder" type="text" placeholder="belum dipilih" readonly>
    <button onclick="pilihFolder()">Pilih folder&hellip;</button>
  </div>
  <div class="isi" id="isiFolder"></div>
  <div class="row" id="barisPilih" style="display:none">
    <select id="selPlc" onchange="simpanPilihan()"></select>
    <select id="selHmi" onchange="simpanPilihan()"></select>
  </div>
</div>

<div class="step mati" id="s2">
  <h2><span class="no">2</span>Pantau &amp; riwayat</h2>
  <p class="apa">Tiap kali Studio atau NB-Designer menyimpan, versinya tercatat sendiri &mdash;
  PLC dan HMI sekaligus, dalam satu riwayat.</p>
  <div class="row">
    <button id="watchBtn" onclick="togglePantau()"><span class="live" id="live"></span>&nbsp;Pantau otomatis</button>
    <label class="sw"><input type="checkbox" id="autoNb" onchange="ubahAutoNb()">
      alarm ikut ditulis ke HMI tiap PLC disimpan</label>
    <button class="ghost" onclick="track()">Catat sekarang</button>
    <button class="ghost" onclick="bukaVsCode()">Buka riwayat di VS Code</button>
  </div>
  <div id="watchInfo" class="status"></div>
  <table id="riwayat"><tr><td class="kecil">pilih folder project dulu</td></tr></table>
  <pre id="isiDiff" style="display:none"></pre>
  <p class="kecil">Keadaan <b>sebelum</b> disunting ikut dicatat begitu pemantauan dinyalakan.
  Yang tidak pernah dicatat tidak bisa dikembalikan.</p>
</div>

<div class="step mati" id="s3">
  <h2><span class="no">3</span>Alarm ke HMI</h2>
  <p class="apa">Teks alarm dari PLC dikirim ke project NB-Designer yang sama.</p>
  <div class="row">
    <button class="ghost" onclick="nbSync(0)">Lihat perubahannya</button>
    <button onclick="nbSync(1)">Tulis ke HMI sekarang</button>
  </div>
  <div id="nbStatus" class="status"></div>
  <p class="kecil">Tutup NB-Designer selama ini dipakai: dia menulis ulang berkasnya waktu
  project disimpan, jadi hasil sinkron bisa tertimpa. Yang lama selalu dicadangkan dulu.</p>
</div>

<pre id="log">siap.</pre>

<details>
  <summary>Lanjutan &mdash; jarang dipakai</summary>
  <div class="step">
    <h2>Berkas Import AlarmLib.csv</h2>
    <p class="apa">Kalau alarmnya mau dimasukkan lewat tombol Import di dialog Alarm Setting,
    bukan ditulis langsung ke .nbp. Sumbernya project JSON generator.</p>
    <div class="row">
      <input id="sumberCsv" type="text" placeholder="project-susmax.json">
      <button class="ghost" onclick="pilihSumber()">Pilih&hellip;</button>
      <button class="ghost" onclick="alarmCsv(0)">Lihat dulu</button>
      <button class="ghost" onclick="alarmCsv(1)">Tulis berkasnya</button>
    </div>
  </div>
  <div class="step">
    <h2>Jalankan dari terminal</h2>
    <p class="apa">Alat yang sama lewat MCP &mdash; buat minta bantuan AI dengan konsol penuh dan
    ganti model.</p>
    <pre style="margin:0" id="cmdMcp">-</pre>
    <p class="kecil">Folder kerjanya lewat <b>env</b>, bukan <code>--ws</code>: PowerShell memakan
    <code>--</code> sebelum sampai ke perintahnya.</p>
  </div>
</details>

<script>
var PLC = '', HMI = '', HIST = '', PANTAU = false;

function $(id){ return document.getElementById(id); }
function log(t, buruk){ var l=$('log'); l.textContent=t; l.className = buruk?'bad':''; }
function aktif(id, ya){ $(id).className = 'step' + (ya ? '' : ' mati'); }

function api(nama, isi, metode){
  var opt = { method: metode || 'POST', headers:{'Content-Type':'application/json'} };
  var url = '/api/' + nama;
  if (opt.method === 'GET') {
    var q = Object.keys(isi||{}).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(isi[k]); });
    url += q.length ? '?' + q.join('&') : ''; delete opt.headers;
  } else { opt.body = JSON.stringify(isi||{}); }
  return fetch(url, opt).then(function(r){ return r.json(); }).then(function(j){
    // Satu jalur gagal buat semua pemanggil. Yang dicek per tempat selalu ada yang lupa, dan
    // yang lupa itu diam: tombolnya kelihatan berhasil padahal tidak terjadi apa-apa.
    if (!j.ok) throw new Error(j.error || 'gagal');
    return j.result;
  });
}

// -------------------------------------------------------------- folder project
// Folder project SEKALIGUS folder kerja: semua baca-tulis dikurung ke situ. Satu folder per
// mesin memang cara orangnya menyimpan pekerjaan, jadi tidak ada konsep kedua yang harus
// diingat - dan tidak ada lagi "folder kerja" yang bisa berbeda dari project yang dibuka.
// Server yang jalan pakai kode lama itu penyebab paling membingungkan di sini: halamannya
// tampil, tombolnya ada, cuma perilakunya versi sebelumnya. Ditanyakan tiap 10 detik.
function cekVersi(){
  fetch('/api/ping', { cache:'no-store' }).then(function(r){ return r.json(); }).then(function(j){
    var el = $('basi');
    if (!j.stale) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.className = 'step';
    el.style.borderColor = '#fecaca';
    el.style.background = '#fef2f2';
    el.innerHTML = '<b>Server jalan pakai kode lama.</b> Ada berkas yang berubah sesudah server ' +
      'ini dijalankan - Node memuat kode sekali waktu start, jadi perubahan itu belum berlaku. ' +
      'Tutup jendela Susmax lalu jalankan lagi.';
  }, function(){});
}

function muatFolder(){
  api('ws/get',{},'GET').then(function(r){
    $('folder').value = r.root;
    perbaruiPerintah(r.root);
    pindai();
  });
}

function pilihFolder(){
  log('menunggu dialog... (kalau tidak kelihatan, cek taskbar)');
  api('pick/folder',{title:'Pilih folder project mesin'}).then(function(r){
    if (!r.path) return log('tidak jadi memilih');
    return api('ws/set',{dir:r.path}).then(function(w){
      $('folder').value = w.root;
      perbaruiPerintah(w.root);
      PLC=''; HMI=''; HIST=''; aktif('s2',false); aktif('s3',false);
      log('folder project: ' + w.root + '  (tersimpan, ikut terpakai lain kali)');
      pindai();
    });
  }, function(e){ log('gagal: ' + e.message, true); });
}

function pindai(){
  api('project/scan',{dir:'.'},'GET').then(function(r){
    var pilihan = r.dipilih || {};
    isiSelect('selPlc', r.smc2, pilihan.smc2);
    isiSelect('selHmi', r.hmi, pilihan.nb);
    // Dropdown cuma muncul kalau memang ada yang harus dipilih. Folder yang isinya satu PLC dan
    // satu HMI - yaitu hampir semuanya - tidak perlu satu pun pilihan.
    var perlu = r.smc2.length > 1 || r.hmi.length > 1;
    $('barisPilih').style.display = perlu ? 'flex' : 'none';

    PLC = pilihan.smc2 || r.smc2[0] || '';
    HMI = pilihan.nb || r.hmi[0] || '';
    $('isiFolder').innerHTML =
      'PLC : ' + (PLC ? '<b>' + PLC + '</b>' : '<i>tidak ada .smc2 di folder ini</i>') + '<br>' +
      'HMI : ' + (HMI ? '<b>' + HMI + '</b>' : '<i>tidak ada project NB-Designer di folder ini</i>');

    if (!PLC) { aktif('s2', false); aktif('s3', false); return; }
    HIST = PLC.replace(/\\.smc2$/i,'') + '-history';
    aktif('s2', true); aktif('s3', !!HMI);
    simpanPilihan(true);
    muatRiwayat(); cekPantau();
  }, function(e){ log('gagal memindai folder: ' + e.message, true); });
}

function isiSelect(id, daftar, terpilih){
  var sel = $(id);
  sel.innerHTML = '';
  daftar.forEach(function(x){
    var o = document.createElement('option');
    o.value = x; o.textContent = x;
    if (x === terpilih) o.selected = true;
    sel.appendChild(o);
  });
}

function simpanPilihan(diam){
  if ($('barisPilih').style.display !== 'none') {
    PLC = $('selPlc').value || PLC;
    HMI = $('selHmi').value || HMI;
    HIST = PLC.replace(/\\.smc2$/i,'') + '-history';
  }
  if (!PLC) return;
  api('project/set',{smc2:PLC, nb:HMI, dir:HIST, folder:'.'}).then(function(){
    if (!diam) { log('pilihan disimpan'); muatRiwayat(); cekPantau(); }
  }, function(){});
}

function perbaruiPerintah(root){
  $('cmdMcp').textContent =
    'claude mcp add-json susmax -s user "{\\\\"command\\\\":\\\\"node\\\\",' +
    '\\\\"args\\\\":[\\\\"' + location.origin.replace(/^https?:\\/\\//,'') + '/scripts/mcp.js\\\\"],' +
    '\\\\"env\\\\":{\\\\"SUSMAX_WS\\\\":\\\\"' + root.replace(/\\\\/g,'/') + '\\\\"}}"';
}

// ------------------------------------------------------------------ pantau
function cekPantau(){
  if (!PLC) return;
  api('watch/status',{path:PLC, nb:HMI},'GET').then(function(r){
    PANTAU = !!r.watching;
    $('watchBtn').className = PANTAU ? '' : 'ghost';
    $('live').className = 'live' + (PANTAU ? ' on' : '');
    var bagian = [];
    bagian.push(PANTAU ? ((r.commits||0) + ' versi tercatat sejak dipantau')
                       : 'pemantauan mati - versinya cuma tercatat kalau ditekan manual');
    if (r.hmi && r.hmi.watching) bagian.push('HMI ikut dipantau');
    if (r.pending) bagian.push('berkas sedang berubah...');
    if (r.lastError) bagian.push('gagal: ' + r.lastError);
    $('watchInfo').className = 'status' + (r.lastError ? ' bad' : '');
    $('watchInfo').textContent = bagian.join('  |  ');
    if (r.nb) {
      $('nbStatus').className = 'status ' + (r.nb.code === 0 ? 'ok' : 'bad');
      $('nbStatus').textContent = r.nb.code === 0
        ? ('tersinkron otomatis: ' + (r.nb.out || 'selesai'))
        : ('sinkron otomatis GAGAL: ' + (r.nb.err || 'tidak diketahui'));
    }
  }, function(){});
}

function togglePantau(){
  if (!PLC) return log('pilih folder project dulu', true);
  var isi = { path: PLC, nb: HMI };
  if ($('autoNb').checked) isi.nbWrite = true; else isi.nbWrite = false;
  api(PANTAU ? 'watch/stop' : 'watch/start', isi).then(function(r){
    if (r && r.dir) HIST = r.dir;
    log(PANTAU ? 'pemantauan dihentikan'
               : 'dipantau - sunting di Studio/NB seperti biasa, tiap simpanan tercatat sendiri');
    cekPantau(); muatRiwayat();
  }, function(e){ log('gagal: ' + e.message, true); });
}

function ubahAutoNb(){
  if (!PLC) { $('autoNb').checked = false; return log('pilih folder project dulu', true); }
  if ($('autoNb').checked && !HMI) {
    $('autoNb').checked = false;
    return log('folder project ini tidak punya project NB-Designer', true);
  }
  // Menyalakannya berarti .nbp DITULIS tiap kali Studio menyimpan - dikatakan sekali di depan,
  // bukan disembunyikan di balik kata "otomatis".
  if ($('autoNb').checked &&
      !confirm('Tiap kali Studio menyimpan PLC-nya, alarmnya langsung DITULIS ke\\n' + HMI +
               '\\n\\nYang lama tetap dicadangkan. Tutup NB-Designer selama ini aktif.')) {
    $('autoNb').checked = false;
    return;
  }
  // Setelannya DIKIRIM sekarang juga, tidak menunggu pemantauan dinyalakan ulang dan tidak
  // bergantung pada tebakan halaman soal sedang dipantau atau tidak. Dulu di sini ada
  // "if (!PANTAU) return" - dan PANTAU baru disegarkan tiap 8 detik, jadi mencentang tepat
  // sesudah menyalakan pemantauan diam-diam tidak berlaku sama sekali.
  api('watch/start',{path:PLC, nb:HMI, nbWrite:$('autoNb').checked}).then(function(){
    log($('autoNb').checked
      ? 'tulis otomatis ke HMI aktif - simpan di Studio, alarmnya menyusul sendiri'
      : 'tulis otomatis ke HMI dimatikan');
    cekPantau();
  }, function(e){ log('gagal: ' + e.message, true); });
}

// ------------------------------------------------------------------ riwayat
function track(){
  if (!PLC) return log('pilih folder project dulu', true);
  log('mencatat...');
  api('git/track',{path:PLC, nb:HMI}).then(function(r){
    HIST = r.dir;
    log(r.changed ? ('tercatat: ' + r.message) : 'tidak ada perubahan sejak catatan terakhir');
    muatRiwayat();
  }, function(e){ log('gagal mencatat: ' + e.message, true); });
}

// Diff yang enak dibaca ada di VS Code - panel Source Control dan Timeline-nya memang dibikin
// buat itu. Halaman ini tidak perlu jadi penampil git kedua yang lebih buruk; tabel di bawah
// cukup buat tahu ADA berapa versi dan mengembalikan salah satunya.
function bukaVsCode(){
  if (!HIST) return log('belum ada riwayat buat dibuka', true);
  api('open/vscode',{dir:HIST}).then(function(r){
    log('dibuka di VS Code: ' + r.opened + '  (panel Source Control menampilkan tiap perubahan)');
  }, function(e){ log('gagal membuka VS Code: ' + e.message, true); });
}

function muatRiwayat(){
  if (!HIST) return;
  api('git/log',{dir:HIST,limit:'30'},'GET').then(function(r){
    var t = $('riwayat');
    if (!r.repo || !r.entries.length){
      t.innerHTML = '<tr><td class="kecil">belum ada catatan - nyalakan pantau otomatis, ' +
                    'atau tekan "Catat sekarang"</td></tr>';
      return;
    }
    var h = '<tr><th>Versi</th><th>Waktu</th><th>Apa yang berubah</th><th>Catatan</th><th>Kembalikan</th></tr>';
    r.entries.forEach(function(e){
      var note = (e.note || '').replace(/"/g,'&quot;');
      h += '<tr><td class="mono">' + e.hash + '</td>' +
           '<td>' + String(e.date||'').slice(0,16) + '</td>' +
           '<td>' + e.subject + '</td>' +
           '<td><span class="note" data-note="' + note + '" data-rev="' + e.hash +
           '" onclick="ubahCatatan(this)">' + (e.note ? e.note : '+ catatan') + '</span></td>' +
           '<td><button class="ghost" data-rev="' + e.hash + '" onclick="lihat(this)">Lihat</button> ' +
           '<button class="danger" data-rev="' + e.hash + '" onclick="pulihkan(this,0)">PLC</button> ' +
           (HMI ? '<button class="danger" data-rev="' + e.hash + '" onclick="pulihkan(this,1)">HMI</button>' : '') +
           '</td></tr>';
    });
    t.innerHTML = h;
  }, function(e){ log(e.message, true); });
}

// Catatan susulan disimpan sebagai git notes - hash-nya TIDAK berubah, jadi tombol Kembalikan
// di sebelahnya tetap menunjuk versi yang sama persis.
function ubahCatatan(el){
  var rev = el.getAttribute('data-rev');
  var teks = prompt('Catatan buat versi ' + rev + ':', el.getAttribute('data-note') || '');
  if (teks === null) return;
  api('git/message',{dir:HIST, rev:rev, message:teks}).then(function(){ muatRiwayat(); },
    function(e){ log('gagal menyimpan catatan: ' + e.message, true); });
}

function lihat(el){
  api('git/show',{dir:HIST,rev:el.getAttribute('data-rev')},'GET').then(function(r){
    var box = $('isiDiff'); box.style.display='block'; box.textContent = r.diff || '(kosong)';
  }, function(e){ log(e.message, true); });
}

// PLC dan HMI dikembalikan TERPISAH: yang salah biasanya cuma salah satunya, dan mengembalikan
// dua-duanya membuang pekerjaan yang tidak ada hubungannya.
function pulihkan(el, hmi){
  var rev = el.getAttribute('data-rev');
  var apa = hmi ? 'HMI (.nbp)' : 'PLC (.smc2)';
  if (!confirm('Kembalikan ' + apa + ' ke versi ' + rev + '?\\n\\nBerkas sekarang dicadangkan ' +
               'dulu, tapi ' + (hmi ? 'NB-Designer' : 'Sysmac Studio') + ' harus DITUTUP - kalau ' +
               'tidak, versi di memorinya menimpa lagi waktu disimpan.')) return;
  var isi = hmi ? { dir:HIST, rev:rev, file:'hmi.nbp', to:HMI }
                : { dir:HIST, rev:rev, file:'project.smc2', to:PLC };
  api('git/restore', isi).then(function(r){
    log(apa + ' dikembalikan ke ' + r.from + ' (' + r.bytes + ' byte). Buka lagi aplikasinya.');
    muatRiwayat();
  }, function(e){ log('gagal mengembalikan: ' + e.message, true); });
}

// ----------------------------------------------------------------------- HMI
function nbSync(tulis){
  if (!PLC) return log('pilih folder project dulu', true);
  if (!HMI) return log('folder project ini tidak punya project NB-Designer', true);
  $('nbStatus').className = 'status';
  $('nbStatus').textContent = tulis ? 'menulis ke HMI...' : 'memeriksa...';
  api('nb/sync',{smc2:PLC, nb:HMI, write:!!tulis}).then(function(r){
    $('nbStatus').className = 'status ' + (r.code === 0 ? 'ok' : 'bad');
    $('nbStatus').textContent = (r.code === 0 ? '' : 'GAGAL: ') + (r.err || 'selesai');
    $('log').textContent = r.out || r.err || '';
  }, function(e){
    $('nbStatus').className = 'status bad';
    $('nbStatus').textContent = 'gagal: ' + e.message;
  });
}

// ------------------------------------------------------------------ lanjutan
function pilihSumber(){
  api('pick/file',{title:'Pilih project JSON atau AlarmLib.csv',
                   filter:'Project JSON / CSV (*.json;*.csv)|*.json;*.csv|Semua berkas (*.*)|*.*'})
    .then(function(r){ if (r.path) $('sumberCsv').value = r.path; },
          function(e){ log('dialog gagal: ' + e.message, true); });
}
function alarmCsv(tulis){
  var sumber = $('sumberCsv').value.trim();
  if (!sumber) return log('isi sumbernya dulu (project JSON)', true);
  if (!HMI) return log('folder project ini tidak punya project NB-Designer', true);
  log(tulis ? 'menulis AlarmLib-generated.csv...' : 'memeriksa...');
  api('nb/alarm',{source:sumber, nb:HMI, write:!!tulis}).then(function(r){
    log(r.out || r.err || 'selesai', r.code !== 0);
  }, function(e){ log('gagal: ' + e.message, true); });
}

// Selama dipantau, riwayat dan statusnya ikut disegarkan sendiri - versi yang barusan tercatat
// harus kelihatan tanpa ada yang menekan tombol.
setInterval(function(){
  if (!PLC) return;
  cekPantau();
  if (PANTAU) muatRiwayat();
}, 8000);

muatFolder();
cekVersi();
setInterval(cekVersi, 10000);
</script></body></html>`;

module.exports = { HALAMAN_EDIT };
