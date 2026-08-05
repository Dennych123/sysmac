import json, os

_D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda f: open(os.path.join(_D, 'js', f)).read()

PARSE   = J('parse.js')
GENNAME = J('genname.js')
VALIDATE = J('validate.js')
SPLIT   = J('split.js')
LIB     = J('lib.js')
GEN_ALL = LIB + "\n" + J('gen_all.js')

HTML = '''<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Susmax Program Generator</title>
<style>
  :root{--fg:#1c2430;--muted:#5c6673;--line:#dde1e7;--card:#fff;--bg:#f4f6f8;--accent:#2563eb;--accent-dk:#1d4ed8;--radius:8px}
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;max-width:1040px;margin:24px auto;padding:0 16px;color:var(--fg);background:var(--bg);line-height:1.45}
  h1{font-size:19px;font-weight:600;margin:0 0 4px}
  h2{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;color:var(--muted);margin:22px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--line)}
  textarea{width:100%;box-sizing:border-box;font-family:Consolas,Menlo,monospace;font-size:12px;border:1px solid var(--line);border-radius:6px;padding:8px}
  #ioText{height:220px}
  button{padding:8px 16px;font-size:13px;cursor:pointer;background:var(--accent);color:#fff;border:none;border-radius:6px;margin-top:8px;transition:background .12s}
  button:hover{background:var(--accent-dk)}
  button.dl{background:#37424f;padding:4px 10px;margin:0}
  button.dl:hover{background:#232a33}
  .hint{font-size:11px;color:var(--muted);margin:4px 0}
  #err{white-space:pre-wrap;color:#b91c1c;font-family:Consolas,monospace;font-size:12px;margin-top:10px}
  #stats{white-space:pre-wrap;color:var(--fg);font-family:Consolas,monospace;font-size:11px;margin-top:12px;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:10px}

  .warn-box{display:none;background:#fff8e6;border:1px solid #f0c36d;border-left:4px solid #e6a817;border-radius:6px;padding:10px 12px;margin-top:10px}
  .warn-box b{color:#8a5a00;font-size:12px}
  #warn{white-space:pre-wrap;color:#7a4a00;font-family:Consolas,monospace;font-size:11px;margin-top:4px}

  .settings-row{display:flex;flex-wrap:wrap;gap:14px;margin:6px 0}
  .settings-row label{font-size:11px;color:var(--muted);display:flex;flex-direction:column;gap:3px}
  .settings-row input{font-family:Consolas,monospace;font-size:12px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;width:130px}
  .stname-panel{display:none;flex-wrap:wrap;gap:10px;margin:8px 0}
  .stname-lbl{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);background:var(--card);border:1px solid var(--line);border-radius:6px;padding:5px 8px}
  .stname-lbl b{color:var(--fg);font-family:Consolas,monospace}
  .stname-input{font-family:Segoe UI,Arial,sans-serif;font-size:12px;padding:4px 6px;border:1px solid var(--line);border-radius:4px;width:160px}
  .cm-row{flex-direction:column;align-items:flex-start;gap:4px}
  .cm-row select{font-family:Segoe UI,Arial,sans-serif;font-size:11px;padding:3px 5px;border:1px solid var(--line);border-radius:4px}
  .cm-row .cm-manual{display:flex;gap:4px}
  .cm-row .cm-manual input{font-family:Consolas,monospace;font-size:11px;padding:3px 5px;border:1px solid var(--line);border-radius:4px;width:110px}

  .single{background:#eef4ff;border:1px solid #bcd3f9;border-radius:var(--radius);padding:12px 14px;margin:14px 0}
  .single .t{font-weight:600;margin-bottom:2px}
  .single .d{font-size:11px;color:var(--muted);margin-bottom:8px}
  details.per-program{margin-top:10px}
  details.per-program>summary{cursor:pointer;font-size:12px;color:var(--muted);padding:6px 2px;list-style:none}
  details.per-program>summary::-webkit-details-marker{display:none}
  details.per-program>summary::before{content:"▸ ";color:var(--accent)}
  details.per-program[open]>summary::before{content:"▾ "}
  .file{margin-bottom:12px;border:1px solid var(--line);border-radius:6px;padding:8px;background:var(--card)}
  .file .row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap}
  .file b{font-family:Consolas,monospace}
  .file textarea{height:140px;margin-top:6px;font-size:10px;white-space:pre;overflow:auto}

  #motionPanel{display:none;margin:10px 0}
  #conditionPanel{display:none;margin:10px 0}
  .cond-group-box{border:1px dashed #c7ccd4;border-radius:6px;padding:6px;margin:6px 0;display:flex;flex-wrap:wrap;align-items:center;gap:4px}
  .cond-or-label{font-weight:bold;color:#c2670a;font-size:11px;margin-right:4px}
  .cond-term{display:inline-flex;align-items:center;background:#eef2ff;border-radius:4px;padding:2px 2px 2px 4px;font-family:Consolas,monospace;font-size:11px;gap:3px}
  .cond-neg{background:var(--accent);color:#fff;padding:2px 6px;margin:0;font-size:9px;border-radius:3px}
  .cond-neg.active{background:#b91c1c}
  .cond-neg:hover{opacity:0.85}
  .cond-term-bit{padding:0 2px}
  .cond-rm-term{background:#9aa3ad;color:#fff;padding:1px 6px;margin:0;font-size:10px;border-radius:3px}
  .cond-rm-term:hover{background:#7c848d}
  .cond-term-input{font-family:Consolas,monospace;font-size:11px;padding:3px 5px;border:1px solid var(--line);border-radius:4px;width:130px}
  .station-box{border:2px solid #b7c0cc;border-radius:var(--radius);padding:10px 12px;margin-bottom:16px;background:var(--card);box-shadow:0 1px 3px rgba(20,30,50,.06)}
  .station-title{font-weight:600;font-size:13px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--line)}
  .variant-box{border:1px solid var(--line);border-radius:6px;padding:8px;margin-bottom:10px;background:#fbfcfd}
  .variant-head{display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap}
  .variant-head b{font-size:11px;color:var(--muted)}
  .variant-head input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px;width:140px}
  .variant-head select{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px;background:#fff;max-width:230px}
  .variant-head .rm-variant{background:#b91c1c;padding:3px 8px;margin:0;font-size:10px}
  .variant-head .rm-variant:hover{background:#8f1717}
  .add-variant{background:#37424f;padding:5px 10px;font-size:11px}
  .add-variant:hover{background:#232a33}
  .graph-toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}
  .avail-btn{background:#eceff3;color:var(--fg);padding:4px 8px;margin:0;font-size:11px;font-family:Consolas,monospace}
  .avail-btn:hover{background:#dde2e8}
  .graph-toolbar input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px}
  .graph-toolbar select{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px;background:#fff;max-width:230px}
  .graph-toolbar .add-cond{background:#7c3aed;padding:4px 10px;margin:0;font-size:11px}
  .graph-toolbar .add-cond:hover{background:#6527c9}
  svg.graph-canvas{border:1px solid var(--line);border-radius:6px;background:#fbfbfc;display:block;max-width:100%}
  .gnode-rect{fill:var(--accent);stroke:var(--accent-dk);stroke-width:1;cursor:move}
  .gnode-rect.condition{fill:#7c3aed;stroke:#5b21b6;stroke-dasharray:4,2}
  .gnode-rect.decision{fill:#0f766e;stroke:#0b544e}
  .gnode-rect.setmem{fill:#b45309;stroke:#8a4008}
  .gnode-rect.resetmem{fill:#7c2d12;stroke:#5c210d}
  .gnode-rect.alarm{fill:#b91c1c;stroke:#8f1717}
  .gnode-handle.port-n{fill:#e5e7eb}
  .gport-text{font-size:8px;fill:#111;font-family:Consolas,monospace;pointer-events:none;text-anchor:middle}
  .graph-hint{font-size:11px;color:#8a4008;background:#fff7ed;border:1px solid #fed7aa;border-radius:4px;padding:5px 8px;margin-top:4px}
  .gnode-rect.selected{stroke:#f1c40f;stroke-width:3}
  .gnode-rect.anchor{fill:#37424f;stroke:#232a33;cursor:move;rx:14}
  .gedge-line.anchor{stroke:#9aa3ad;stroke-dasharray:3,2}
  .gnode-text{fill:#fff;font-size:9px;font-family:Consolas,monospace}
  .gnode-del{fill:#b91c1c;cursor:pointer}
  .gnode-del-text{fill:#fff;font-size:9px;text-anchor:middle;font-family:Consolas,monospace}
  .gnode-handle{fill:#f1c40f;stroke:#333;stroke-width:1;cursor:crosshair}
  .gedge-line{stroke:#8a93a0;stroke-width:2;cursor:pointer}
  .gedge-line:hover{stroke:#b91c1c}
  .gedge-line.selected{stroke:#f1c40f;stroke-width:3}
  .gtemp-line{stroke:var(--accent);stroke-width:2;stroke-dasharray:4,2}
  .gjoin-badge{cursor:pointer}
  .gjoin-badge rect{fill:#333}
  .gjoin-badge text{fill:#fff;font-size:8px;text-anchor:middle;font-family:Consolas,monospace}
  details.json-io{border-top:1px dashed var(--line);margin-top:8px;padding-top:6px}
  details.json-io>summary{cursor:pointer;font-size:11px;color:var(--muted);list-style:none;padding:2px 0}
  details.json-io>summary::-webkit-details-marker{display:none}
  details.json-io>summary::before{content:"▸ ";color:var(--accent)}
  details.json-io[open]>summary::before{content:"▾ "}
  .json-io textarea{height:90px;font-size:10px;margin-top:6px}
  .json-io .row{display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;align-items:center}
  .json-io button{font-size:11px;padding:5px 10px;margin:0}
  .json-io .json-import{background:#1e8449}
  .json-io .json-import:hover{background:#166638}
  .json-io .json-export{background:#37424f}
  .json-io .json-export:hover{background:#232a33}
  .json-io .json-alt{background:#0369a1}
  .json-io .json-alt:hover{background:#025782}
  .json-io .row-sep{width:1px;align-self:stretch;background:var(--line);margin:0 2px}
  .json-io .json-msg{font-size:10px;margin-top:4px;white-space:pre-wrap}
  .json-io .json-msg.ok{color:#1e8449}
  .json-io .json-msg.err{color:#b91c1c}
  details.project-json{border:1px solid var(--line);border-radius:6px;padding:8px 10px;margin:10px 0;background:var(--card)}
  details.project-json>summary{font-size:12px;font-weight:600;color:var(--fg)}
  .project-json textarea{height:160px}
</style>
</head>
<body>
<h1>Susmax Program Generator</h1>
<p class="hint">Tempel IO list: Alamat / Jenis / IN-OUT / Komen (pisah TAB). Komen ada ST1/ST2/ST3 -&gt; masuk program unit. Tanpa ST -&gt; program MAIN.</p>
<textarea id="ioText" placeholder="CH000_00&#9;PB&#9;IN&#9;NOT EMERGENCY STOP"></textarea>
<div><button id="genBtn">Generate Program</button></div>
<div id="err"></div>
<div id="warnBox" class="warn-box"><b>Warning</b><div id="warn"></div></div>

<h2>Pengaturan (opsional)</h2>
<p class="hint">Timer default berlaku ke semua station - format harus <code>T#&lt;angka&gt;&lt;unit&gt;</code>
(mis. <code>T#200MS</code>, <code>T#1S</code>), salah format dibalikin ke default + warning. Nama
station (opsional) ikut ke komentar program yang di-generate (mis. <code>LB400_A</code>/<code>LB400_B</code>).</p>
<div class="settings-row">
  <label>Timer debounce PH/PX <input id="timerPhpx" placeholder="T#200MS"></label>
  <label>Timer motion-fault <input id="timerMotion" placeholder="T#5S"></label>
</div>
<div id="stationNamesPanel" class="stname-panel"></div>

<h2>Confirm Mode per aktuator (opsional)</h2>
<p class="hint">Default (Auto) - pencocokan sensor otomatis (findLsc buat silinder, best-match komen buat
servo). <b>Open-loop</b> - aktuator sengaja gak punya sensor by design (mis. DANDORI LOCK, PART FEEDER
START) - skip fault-detection DAN skip warning "no matching limit switch" sama sekali. <b>Manual</b> -
override pencocokan otomatis yang salah/low-confidence, isi sendiri nama bit konfirmasinya. Kalau
distel Open-loop, aktuator itu gak bisa dipakai di Motion Sequence (butuh bit konfirmasi buat lanjut
ke step berikutnya).</p>
<div id="confirmModePanel" class="stname-panel"></div>

<details class="json-io project-json">
  <summary>Project JSON (Import/Export SEMUA - IO list, Motion Sequence, Condition, nama station, timer default sekaligus)</summary>
  <p class="hint">Simpan/pulihkan seluruh kerjaan sekali tempel, gak perlu per-station. Import langsung
  jalanin Generate ulang pakai IO list di dalamnya, GANTI seluruh project yang lagi ke-buka.</p>
  <textarea id="projectJsonTa" placeholder='{"io":"CH0_00\\tPB\\tIN\\t...","stationNames":{"ST1":"Conveyor Feed"},"timerDefaults":{"phpx":"T#200MS","motion":"T#5S"},"motionSequences":{"ST1":[...]},"conditionDefs":{"ST1":[...]}}'></textarea>
  <div id="projectJsonRow"></div>
  <div id="projectJsonMsg" class="json-msg"></div>
</details>

<h2>Condition (opsional)</h2>
<p class="hint">Tiap station boleh punya sejumlah bit Condition BERNAMA (gak dibatasin 3 slot lama) -
tiap bit = OR dari beberapa kombinasi AND-syarat ("+ OR group", "+ term" per group, klik badge
AND/NOT buat toggle negate) - persis pola Ndeso PATTERN 3 (mis. bit "P&amp;P Take Out Lowering Auto
Start Condition" = grupA OR grupB). Bit boleh ngerujuk bit Condition LAIN (referensi silang, mis.
condition ke-2 makein bit condition ke-1 sebagai salah satu term), sensor, atau bit apapun yang
sudah ada - kalau belum kedeklarasi, otomatis dibikinin placeholder biar gak error pas import.
Station yang gak disentuh tetap dapat 3 slot cadangan generik lama. Kotak <b>Import/Export JSON</b>
di bawah - format: array condition
<code>[{"name":"","bit":"","groups":[[{"bit":"LB206","neg":false}]]}]</code>.</p>
<div id="conditionPanel"></div>

<h2>Motion Sequence (AutoRunning, opsional)</h2>
<p class="hint">Tiap station boleh punya beberapa VARIAN sequence ("+ Variant"), masing-masing punya
Condition bit sendiri (kosongin = selalu aktif) - kayak pemilihan TIPE di FSM: cuma varian yang
kondisinya true yang jalan. Di dalam satu varian: klik solenoid buat drop node, seret dari bulatan
kuning ke node LAIN (boleh ke arah manapun, asal gak muter balik) buat bikin dependency. Node dgn
2+ dependency dapat badge AND/OR - klik toggle. "+ Condition/bit" bikin node rujukan bit yang sudah
ada: tinggal PILIH dari dropdown Condition yang kamu bikin di kotak Condition di bawah (daftarnya
ikut ke-update otomatis), atau pilih "bit lain (ketik manual)" buat nunjuk sensor/bit di luar itu.
Dropdown yang sama juga dipakai buat Condition pemilih varian.</p>
<p class="hint">Baris <b>Blok:</b> nambahin langkah non-motion: <b>IF/ELSE</b> (judgement - satu masuk,
dua keluar lewat port <b>Y</b> kanan dan <b>N</b> bawah; cabangnya nge-HOLD sekali keputusan diambil
dan saling interlock jadi mustahil nyala barengan), <b>SET/RESET mem</b> (bit memory latching - semua
trigger set dan reset buat satu bit digabung jadi SATU rung, jadi gak ada coil dobel), dan
<b>ALARM</b> (dapat slot AL[] otomatis, nyangkut sendiri, lalu masuk grup kategori yang dipilih).
Buat nyatuin cabang seperti pola Ndeso, tarik <b>kedua</b> port Y dan N ke node yang sama lalu klik
badge-nya jadi <b>OR</b>. Klik satu blok buat nampilin panel <b>Edit blok</b> di bawah kanvas - bit,
kategori, dan komennya bisa dibetulin tanpa hapus-bikin-ulang. Bulatan <b>START</b>/<b>END</b> bisa
diseret; klik ganda buat balikin ke posisi otomatis. Klik node/panah buat SELECT (kuning), tekan Delete/
Backspace buat hapus yang keselect. Seret node cuma buat rapihin posisi. Station yang gak disentuh
tetap pakai kerangka placeholder biasa. Tiap station juga punya kotak <b>Import/Export JSON</b> di
bawah - bisa tempel JSON hasil AI atau bikinan sendiri (format: array varian
<code>[{"condition":"","nodes":[{"id":"n1","sol":"SOL_...","after":[],"join":"AND"}]}]</code>),
gak wajib drag-drop manual.</p>
<div id="motionPanel"></div>

<div id="results"></div>
<div id="stats"></div>

<script>
var PARSE_JS    = __PARSE_JS__;
var GENNAME_JS  = __GENNAME_JS__;
var VALIDATE_JS = __VALIDATE_JS__;
var SPLIT_JS    = __SPLIT_JS__;
var GEN_ALL_JS  = __GEN_ALL_JS__;

function runNode(code, msg, flowStore) {
  var flow = { get: function(k){ return flowStore[k]; }, set: function(k,v){ flowStore[k]=v; } };
  var node = { warn: function(m){ console.warn(m); } };
  return new Function('msg','flow','node','return (function(){'+code+'})()')(msg, flow, node);
}

// ===== Clipboard + file, buat toolbar Import/Export JSON =====
// Tool ini dipakai offline lewat file:// . Chrome ngitung file:// sebagai secure context jadi
// navigator.clipboard biasanya jalan, TAPI browser lain / kebijakan kantor bisa nolak, dan
// readText() masih bisa ditolak user lewat prompt izin. Jadi tiap jalur clipboard WAJIB punya
// fallback yang jelas - jangan sampai tombolnya diem tanpa kabar dan user ngira datanya kesalin.
function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  return new Promise(function (resolve, reject) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) resolve(); else reject(new Error('browser nolak perintah copy'));
    } catch (e) { reject(e); }
  });
}

function readTextFromClipboard() {
  if (navigator.clipboard && navigator.clipboard.readText) return navigator.clipboard.readText();
  return Promise.reject(new Error('browser ini gak ngizinin baca clipboard'));
}

function pickTextFile() {
  return new Promise(function (resolve, reject) {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json,text/plain';
    inp.style.display = 'none';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) { reject(new Error('gak ada file kepilih')); return; }
      var fr = new FileReader();
      fr.onload = function () { resolve({ name: f.name, text: String(fr.result) }); };
      fr.onerror = function () { reject(new Error('gagal baca file ' + f.name)); };
      fr.readAsText(f);
    });
    document.body.appendChild(inp); inp.click(); document.body.removeChild(inp);
  });
}

// Bikin baris tombol Import/Export standar buat satu kotak JSON.
//   ta       : textarea-nya (tetap jadi permukaan edit manual - jalur offline utama)
//   msg      : elemen buat nampilin status
//   getText  : () -> string JSON yang mau diekspor
//   doImport : (text) -> string error, atau null kalau sukses (sekalian ngurus render ulang)
//   fileName : nama default file download
function buildJsonIORow(ta, msg, getText, doImport, fileName) {
  var row = document.createElement('div'); row.className = 'row';
  function say(cls, t) { msg.className = 'json-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
  function runImport(text, src) {
    ta.value = text;
    var e = doImport(text);
    if (e) say('err', e); else say('ok', 'Imported dari ' + src + '.');
  }
  function btn(cls, label, fn) {
    var b = document.createElement('button'); b.className = cls; b.textContent = label;
    b.addEventListener('click', fn); row.appendChild(b); return b;
  }

  btn('json-import', 'Import (kotak)', function () { runImport(ta.value, 'kotak'); });
  btn('json-alt', 'Import file...', function () {
    pickTextFile().then(function (f) { runImport(f.text, f.name); })
                  .catch(function (e) { say('err', 'Gagal: ' + e.message); });
  });
  btn('json-alt', 'Import clipboard', function () {
    readTextFromClipboard().then(function (t) {
      if (!t || !t.trim()) { say('err', 'Clipboard kosong.'); return; }
      runImport(t, 'clipboard');
    }).catch(function (e) {
      say('err', 'Gagal baca clipboard (' + e.message + '). Tempel manual ke kotak lalu klik "Import (kotak)".');
    });
  });

  var sep = document.createElement('div'); sep.className = 'row-sep'; row.appendChild(sep);

  btn('json-export', 'Copy', function () {
    var t = getText(); ta.value = t;
    copyTextToClipboard(t).then(function () { say('ok', 'Kesalin ke clipboard.'); })
      .catch(function (e) { say('err', 'Gagal nyalin (' + e.message + '). JSON-nya udah ada di kotak, salin manual.'); });
  });
  btn('json-export', 'Download .json', function () {
    var t = getText(); ta.value = t;
    downloadFile(fileName, t); say('ok', 'Diunduh: ' + fileName);
  });

  return row;
}

function downloadFile(name, text) {
  var b = new Blob([text], {type:'text/plain'});
  var u = URL.createObjectURL(b);
  var a = document.createElement('a');
  a.href = u; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(u);
}

// SRV_CMD ikut masuk palette sequence: tiap command servo itu aktuator MANDIRI di gen_all.js
// (srvActus -> solByName), jadi node-nya valid dipakai sebagai langkah motion persis kayak SOL/CR.
// Tanpa SRV_CMD di sini, station yang aktuatornya servo doang gak kegambar sama sekali di panel.
function actuatorNamesForStation(devices) {
  return (devices || [])
    .filter(function (d) { return d.io === 'OUT' && (d.jenis === 'CR' || d.jenis === 'SOL' || d.jenis === 'SRV_CMD'); })
    .map(function (d) { return d.name; })
    .filter(Boolean);
}

// Object.keys(groups) ngikutin urutan device pertama kali MUNCUL di IO list, bukan urutan angka ST -
// kalau IO list-nya nulis ST3 duluan baru ST1, panel bakal kegambar ST3 duluan. Sort numerik di sini.
function sortStations(keys) {
  return keys.slice().sort(function (a, b) {
    return (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0);
  });
}

var errEl, resEl, statsEl, warnEl, warnBoxEl, motionPanelEl, conditionPanelEl, stationNamesPanelEl, timerPhpxEl, timerMotionEl, confirmModePanelEl;
var flowStore = {};
var lastSplitMsg = null;
var stationNames = {}; // key station -> nama bebas (opsional), ngikut ke komen program (LB400_A/B dkk)
// key nama device (SOL_.../CR_.../SRV_...) -> {mode:'auto'|'openloop'|'manual', lscA, lscB}. 'auto' =
// gak disetel/default (findLsc/auto-match servo jalan kayak biasa). 'openloop' = sengaja gak ada
// sensor (DANDORI LOCK, PART FEEDER START dkk) - skip fault-detection + skip warning. 'manual' = user
// nunjuk langsung bit konfirmasinya (buat overrule findLsc yang salah tebak / low-confidence).
var actuatorOverrides = {};
// renderMotionPanel/renderConditionPanel/renderResults nge-rebuild DOM-nya total (innerHTML='') tiap
// ada interaksi apapun (regenerate() dipanggil hampir di semua event) - <details> baru selalu closed
// kalau gak dijagain manual, jadi state open/closed disimpen di sini, LUAR elemen DOM-nya sendiri.
var jsonBoxOpen = {}; // key "motion:ST1" / "cond:ST1" -> bool
var perProgramOpen = false;

// ===== Motion Sequence graph state =====
// motionState[station] = [ variant, ... ]
// variant = { condition: '' | 'LB300', nodes: [ node, ... ] }
// node (motion)    = {id, type:'motion', sol, after:[id-or-bit,...], join:'AND'|'OR', x, y}
// node (condition) = {id, type:'condition', bit, x, y}   -- id IS the bit name itself, so when a
//   motion node's `after` references it, gen_all.js's resolveBit() falls through to using that
//   string as a literal external operand. Condition nodes are stripped before sending to gen_all.js.
var motionState = {};
var conditionState = {}; // key station -> [{name,bit,groups:[[{bit,neg},...],...]},...]
var motionCounters = {}; // key "station#variantIdx" -> next motion node number
var svgRefs = {};        // key "station#variantIdx" -> current svg element
var dragState = null;
var selected = null;     // {stKey, vIdx, kind:'node'|'edge', id, fromId, toId}

var NODE_W = 110, NODE_H = 32;
var ANCHOR_R = 15, ANCHOR_TOP_MARGIN = 55; // Start/Finish: radius lingkaran kecil + ruang di atas row 0
var SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs) {
  var el = document.createElementNS(SVG_NS, tag);
  if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
  return el;
}

function vKey(st, vIdx) { return st + '#' + vIdx; }

function ensureStation(st) {
  if (!motionState[st]) motionState[st] = [{ condition: '', comment: '', nodes: [] }];
}

function addVariant(st) {
  ensureStation(st);
  motionState[st].push({ condition: '', comment: '', nodes: [] });
}

function removeVariant(st, vIdx) {
  if (!motionState[st]) return;
  motionState[st].splice(vIdx, 1);
  if (selected && selected.stKey === st && selected.vIdx === vIdx) selected = null;
}

function setVariantCondition(st, vIdx, text) {
  var v = motionState[st] && motionState[st][vIdx];
  if (v) v.condition = (text || '').trim();
}

function setVariantComment(st, vIdx, text) {
  var v = motionState[st] && motionState[st][vIdx];
  if (v) v.comment = (text || '').trim();
}

// Jarak kolom 175 (dulu 145): node sekarang melebar ngikutin label penuh, nama solenoid panjang
// kayak SOL_ST1_RGT_DIV_BWD bisa ~150px - dengan 145 node baru bakal saling tindih pas ditaruh.
function nextPos(st, vIdx) {
  var idx = motionState[st][vIdx].nodes.length;
  return { x: 20 + (idx % 4) * 175, y: ANCHOR_TOP_MARGIN + 20 + Math.floor(idx / 4) * 75 };
}

function addMotionNode(st, vIdx, sol) {
  ensureStation(st);
  var key = vKey(st, vIdx);
  if (!motionCounters[key]) motionCounters[key] = 1;
  var id = 'n' + (motionCounters[key]++);
  var pos = nextPos(st, vIdx);
  motionState[st][vIdx].nodes.push({ id: id, type: 'motion', sol: sol, after: [], join: 'AND', x: pos.x, y: pos.y });
  return id;
}

// Blok flowchart non-motion (decision / set memory / reset memory / alarm). Id-nya ikut penomoran
// yang sama dengan node motion supaya gak pernah tabrakan.
function addBlockNode(st, vIdx, spec) {
  ensureStation(st);
  var key = vKey(st, vIdx);
  if (!motionCounters[key]) motionCounters[key] = 1;
  var id = 'n' + (motionCounters[key]++);
  var pos = nextPos(st, vIdx);
  var node = { id: id, after: [], join: 'AND', x: pos.x, y: pos.y };
  Object.keys(spec).forEach(function (k) { node[k] = spec[k]; });
  motionState[st][vIdx].nodes.push(node);
  return id;
}

// ===== Pemilih bit Condition (dropdown) =====
// Dulu bit Condition diketik manual di input teks: gampang typo, dan user harus inget sendiri bit apa
// aja yang udah dia bikin di kotak Condition. Sekarang daftarnya ditarik langsung dari conditionState
// station itu. Opsi ketik-manual tetap disediain, karena `after` node maupun condition varian sah juga
// nunjuk bit DI LUAR Condition section (sensor, LSC, atau bit warisan dari JSON import).
function conditionBitOptions(stKey, current) {
  var out = [], seen = {};
  (conditionState[stKey] || []).forEach(function (d) {
    if (!d.bit || seen[d.bit]) return;
    seen[d.bit] = true;
    out.push({ value: d.bit, label: d.bit + (d.name ? ' - ' + d.name : '') });
  });
  // Nilai yang LAGI kepasang tapi gak ada di daftar (hasil import JSON, atau Condition-nya keburu
  // dihapus) wajib tetap muncul sebagai opsi. Kalau nggak, select jatuh ke opsi pertama dan diam-diam
  // ngubah setelan user tiap panel dirender ulang.
  if (current && !seen[current]) out.push({ value: current, label: current + '  (di luar daftar)' });
  return out;
}

var BIT_MANUAL = '(manual)';

// Pesan sekali-pakai di bawah kanvas varian tertentu, mis. alasan sambungan ditolak.
// Bentuknya {key: vKey, text}. Dibersihin tiap kali ada aksi sambung berikutnya.
var graphHint = null;

// Sengaja cuma dengerin 'change', bukan 'input': handler-nya manggil regenerate(), dan kalau dipasang
// di 'input' tiap ketikan bakal ngerender ulang panel lalu ngerebut fokus dari kolomnya sendiri.
function makeBitPicker(stKey, current, emptyLabel, onPick) {
  var wrap = document.createElement('span');
  wrap.style.display = 'inline-flex'; wrap.style.gap = '4px'; wrap.style.alignItems = 'center';
  var sel = document.createElement('select');
  function opt(v, t) { var o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); }
  opt('', emptyLabel);
  conditionBitOptions(stKey, current).forEach(function (o) { opt(o.value, o.label); });
  opt(BIT_MANUAL, 'bit lain (ketik manual)...');
  sel.value = current || '';

  var manual = document.createElement('input');
  manual.placeholder = 'nama bit'; manual.style.width = '120px'; manual.style.display = 'none';

  function val() { return sel.value === BIT_MANUAL ? manual.value.trim() : sel.value; }
  sel.addEventListener('change', function () {
    var man = sel.value === BIT_MANUAL;
    manual.style.display = man ? '' : 'none';
    if (man) { manual.value = ''; manual.focus(); }
    if (onPick) onPick(val());
  });
  manual.addEventListener('change', function () { if (onPick) onPick(val()); });

  wrap.appendChild(sel); wrap.appendChild(manual);
  return {
    el: wrap, get: val,
    reset: function () { sel.value = ''; manual.value = ''; manual.style.display = 'none'; }
  };
}

function addConditionNode(st, vIdx, bitName, comment) {
  ensureStation(st);
  bitName = (bitName || '').trim();
  if (!bitName) return null;
  if (motionState[st][vIdx].nodes.some(function (n) { return n.id === bitName; })) return null;
  var pos = nextPos(st, vIdx);
  motionState[st][vIdx].nodes.push({ id: bitName, type: 'condition', bit: bitName, comment: (comment || '').trim(), x: pos.x, y: pos.y });
  return bitName;
}

function setNodeComment(st, vIdx, id, text) {
  var n = findNode(st, vIdx, id);
  if (n) n.comment = (text || '').trim();
}

function nodeIndex(st, vIdx, id) {
  var arr = (motionState[st] && motionState[st][vIdx] && motionState[st][vIdx].nodes) || [];
  for (var i = 0; i < arr.length; i++) { if (arr[i].id === id) return i; }
  return -1;
}

function findNode(st, vIdx, id) {
  var i = nodeIndex(st, vIdx, id);
  return i < 0 ? null : motionState[st][vIdx].nodes[i];
}

// Ada path fromId -> ... -> targetId lewat rantai `after` (dependency)?
// refBase() dipakai di sini: rujukan cabang "d1#Y" dan "d1#N" itu node yang SAMA buat urusan cycle.
// Kalau port-nya gak dikupas, d1#Y -> X -> d1#N gak kedeteksi muter padahal jelas muter.
function hasPath(st, vIdx, fromId, targetId, visited) {
  var from = refBase(fromId), target = refBase(targetId);
  if (from === target) return true;
  visited = visited || {};
  if (visited[from]) return false;
  visited[from] = true;
  var n = findNode(st, vIdx, from);
  if (!n || !n.after) return false;
  for (var i = 0; i < n.after.length; i++) {
    if (hasPath(st, vIdx, n.after[i], target, visited)) return true;
  }
  return false;
}

function addEdge(st, vIdx, fromId, toId) {
  var fromBase = refBase(fromId);
  if (fromBase === toId) return false;
  var fi = nodeIndex(st, vIdx, fromBase), ti = nodeIndex(st, vIdx, toId);
  if (fi < 0 || ti < 0) return false;
  var target = motionState[st][vIdx].nodes[ti];
  // Node "condition" itu SUMBER (penanda bit rujukan), gak pernah jadi tujuan panah.
  if ((target.type || 'motion') === 'condition') return false;
  if (target.after.indexOf(fromId) >= 0) return false;
  // Cegah cycle: kalau fromId udah (transitif) tergantung ke toId, nambah toId->depends-on->fromId bikin muter.
  if (hasPath(st, vIdx, fromId, toId)) return false;
  target.after.push(fromId);
  return true;
}

function removeEdge(st, vIdx, fromId, toId) {
  var target = findNode(st, vIdx, toId);
  if (!target || !target.after) return;
  target.after = target.after.filter(function (a) { return a !== fromId; });
}

function removeNode(st, vIdx, id) {
  var variant = motionState[st][vIdx];
  variant.nodes = variant.nodes.filter(function (n) { return n.id !== id; });
  // Buang juga rujukan cabang "id#Y" / "id#N", bukan cuma yang persis "id"
  variant.nodes.forEach(function (n) { if (n.after) n.after = n.after.filter(function (a) { return refBase(a) !== id; }); });
  if (selected && selected.stKey === st && selected.vIdx === vIdx && selected.id === id) selected = null;
}

// Ubah satu field blok yang lagi keselect (sol / cond / bit / category / comment). Sebelum ini blok
// cuma bisa dibikin, gak bisa dibetulin - salah pilih bit berarti hapus lalu bikin ulang, dan semua
// panah yang udah nyambung ke situ ikut hilang.
function setNodeField(st, vIdx, id, key, value) {
  var n = findNode(st, vIdx, id);
  if (n) n[key] = typeof value === 'string' ? value.trim() : value;
}

function toggleJoin(st, vIdx, id) {
  var n = findNode(st, vIdx, id);
  if (n) n.join = (n.join === 'OR') ? 'AND' : 'OR';
}

function moveNode(st, vIdx, id, x, y) {
  var n = findNode(st, vIdx, id);
  if (n) { n.x = Math.max(0, x); n.y = Math.max(0, y); }
}

// Tipe blok yang boleh muncul di array "nodes" JSON. "condition" sengaja TIDAK di sini - dia bukan
// blok berung, cuma penanda bit rujukan yang dibangun ulang dari `after`.
var BLOCK_TYPES = ['motion', 'decision', 'setmem', 'resetmem', 'alarm'];
var ALARM_CATS = ['emergency', 'autostop', 'cyclestop', 'faultstop', 'warning'];
var ALARM_CAT_LABEL = { emergency: 'Emergency stop', autostop: 'Auto stop', cyclestop: 'Cycle stop',
                        faultstop: 'Fault stop', warning: 'Warning' };

// Cabang decision dirujuk "idNode#Y" / "idNode#N". Pemisahnya '#', BUKAN '.', karena alamat bit PLC
// sendiri pakai titik (mis. "0001.06") - harus sama persis dengan refBase/refPort di gen_all.js.
function refBase(ref) { var s = String(ref), i = s.indexOf('#'); return i < 0 ? s : s.slice(0, i); }
function refPort(ref) { var s = String(ref), i = s.indexOf('#'); return i < 0 ? '' : s.slice(i + 1); }

// Komen blok ikut tampil di label, bukan cuma kesimpen di state. Tanpa ini semua blok alarm kelihatan
// "ALARM Fault stop" persis sama dan semua judgement cuma beda nama bit - padahal justru komennya yang
// bilang blok itu ngapain. Node melebar sendiri ngikutin label (nodeW), jadi aman dipanjangin.
function nodeLabel(n) {
  var t = n.type || 'motion';
  var c = (n.comment || '').trim();
  var tail = c ? ' - ' + c : '';
  if (t === 'condition') return n.bit + (c ? ' *' : '');
  if (t === 'motion')    return n.sol;
  if (t === 'decision')  return '? ' + (n.cond || '(bit?)') + tail;
  if (t === 'setmem')    return 'SET ' + (n.bit || '(bit?)') + tail;
  if (t === 'resetmem')  return 'RST ' + (n.bit || '(bit?)') + tail;
  if (t === 'alarm')     return 'ALARM ' + (ALARM_CAT_LABEL[n.category] || n.category || 'faultstop') + tail;
  return t;
}

// Lebar node ngikutin panjang label, gak dipotong lagi. Dulu label dipangkas 15 char jadi
// "SOL_ST1_STP4_.." - dua stopper beda kelihatan sama persis di canvas, gak bisa dibedain.
// Font .gnode-text 9px monospace = ~5.4px/char; +16 buat padding kiri-kanan. Minimal tetap
// NODE_W biar node berlabel pendek gak jadi kotak kecil.
function nodeW(n) { return Math.max(NODE_W, Math.ceil(nodeLabel(n).length * 5.4) + 16); }

// Titik sambung kabel dipilih dinamis: SISI node yang paling searah ke lawan bicaranya (atas, bawah,
// kiri, atau kanan), bukan selalu kanan->kiri kayak dulu. Bandingin kemiringan garis pusat-ke-pusat
// sama kemiringan diagonal node: lebih landai -> sisi kiri/kanan, lebih curam -> sisi atas/bawah.
// Pakai nodeW(n) bukan NODE_W biar tetap nempel pas node-nya melebar ngikutin label.
function sideAnchor(n, towardX, towardY) {
  var w = nodeW(n), cx = n.x + w / 2, cy = n.y + NODE_H / 2;
  var dx = towardX - cx, dy = towardY - cy;
  if (Math.abs(dx) * NODE_H >= Math.abs(dy) * w) return { x: dx >= 0 ? n.x + w : n.x, y: cy };
  return { x: cx, y: dy >= 0 ? n.y + NODE_H : n.y };
}
function nodeCenter(n) { return { x: n.x + nodeW(n) / 2, y: n.y + NODE_H / 2 }; }

// ===== Import/Export JSON, buat isi graph tanpa drag-drop manual (mis. hasil AI) =====
// Format: array varian [{condition, nodes:[{id,sol,after,join}]}] - SAMA PERSIS bentuk yang
// dikirim ke gen_all.js lewat flow.get("motionSequences"). `after` boleh nunjuk node id lain DI
// VARIAN YANG SAMA, atau bit apapun yang sudah ada (Condition section, sensor) - kalau bit itu
// gak match id node manapun di JSON-nya, otomatis dibikinin node "condition" biar kegambar.
function conditionCommentsOf(v) {
  var out = {};
  v.nodes.forEach(function (n) { if (n.type === 'condition' && n.comment) out[n.bit] = n.comment; });
  return out;
}

// Node "condition" gak ikut array `nodes` (dia dibikin ulang pas import dari `after` yang nggantung),
// jadi posisinya dititipin di map terpisah - sejajar sama conditionComments.
function conditionPositionsOf(v) {
  var out = {};
  v.nodes.forEach(function (n) {
    if (n.type === 'condition') out[n.bit] = { x: Math.round(n.x), y: Math.round(n.y) };
  });
  return out;
}

// x/y IKUT diekspor biar export -> import balik lagi ke tata letak yang sama persis. Ini murni buat
// editor: regenerate() bikin payload-nya sendiri tanpa x/y, jadi gen_all.js tetap gak pernah lihat
// field ini. Import lama juga tetap jalan - JSON tanpa x/y otomatis jatuh ke auto-layout.
// Blok flowchart selain "condition" semuanya node beneran yang punya rung sendiri, jadi wajib ikut
// array `nodes`. Node "condition" TETAP dikecualikan - dia cuma penanda bit rujukan, dibangun ulang
// pas import dari `after` yang nggantung (posisi+komennya lewat conditionPositions/conditionComments).
function serializeNode(n) {
  var t = n.type || 'motion';
  var out = { id: n.id, type: t, after: (n.after || []).slice(), join: n.join || 'AND',
              x: Math.round(n.x), y: Math.round(n.y) };
  if (t === 'motion') out.sol = n.sol;
  else if (t === 'decision') { out.cond = n.cond || ''; out.comment = n.comment || ''; }
  else if (t === 'setmem' || t === 'resetmem') { out.bit = n.bit || ''; out.comment = n.comment || ''; }
  else if (t === 'alarm') { out.category = n.category || 'faultstop'; out.comment = n.comment || ''; }
  return out;
}

function variantsToJSON(stKey) {
  var variants = (motionState[stKey] || []).map(function (v) {
    var motionNodes = v.nodes.filter(function (n) { return (n.type || 'motion') !== 'condition'; });
    var out = {
      condition: v.condition || '',
      comment: v.comment || '',
      conditionComments: conditionCommentsOf(v),
      conditionPositions: conditionPositionsOf(v),
      nodes: motionNodes.map(serializeNode)
    };
    // Cuma ditulis kalau user beneran pernah nggeser. Kalau selalu ditulis, posisi hasil hitung
    // otomatis jadi beku - graph berubah tapi START/END-nya nyangkut di tempat lama.
    if (v.startPos) out.startPos = { x: Math.round(v.startPos.x), y: Math.round(v.startPos.y) };
    if (v.endPos) out.endPos = { x: Math.round(v.endPos.x), y: Math.round(v.endPos.y) };
    return out;
  });
  return JSON.stringify(variants, null, 2);
}

// CADANGAN doang sekarang: cuma kepanggil kalau JSON-nya gak bawa x/y (mis. JSON tulisan tangan atau
// hasil AI). JSON dari tombol Export selalu bawa posisi, jadi tata letaknya dipertahankan apa adanya.
// Posisi node hasil import JSON dulu ngikutin urutan array MENTAH di JSON-nya (grid 4 kolom) - kalau
// urutan array gak ngikutin urutan dependency (`after`), gambarnya berantakan (panah nyilang-nyilang,
// gak kebaca step-nya). Sekarang posisi dihitung dari KEDALAMAN topologi (depth = berapa hop `after`
// dari root) buat Y, dan kolom paralel di depth yang sama buat X - jadi hasil import selalu kegambar
// top-to-bottom ngikutin urutan gerak beneran, forks kesebar ke samping, gak peduli urutan di JSON-nya.
// Grid MURNI berdasarkan urutan topologis (DFS postorder - dependency SELALU kegambar sebelum yang
// gantung ke dia), posisi tiap node = index-nya doang di urutan itu, wrap 4 kolom - PERSIS rumus grid
// lama (idx-based), cuma urutannya sekarang bukan urutan array JSON mentah lagi. Ini SENGAJA gak
// makein "kedalaman"/kolom-paralel dinamis (percobaan sebelumnya) - itu bikin posisi kerasa gak
// absolut karena kolom tiap depth bisa geser tergantung graph shape; grid index-based ini simpel,
// satu-satunya input yang nentuin posisi ya urutan topologis-nya, gak ada faktor lain.
function layoutVariantNodes(nodes) {
  var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
  var visited = {}, order = [];
  function visit(n) {
    if (visited[n.id]) return;
    visited[n.id] = true;
    (n.after || []).forEach(function (ref) { if (byId[ref]) visit(byId[ref]); });
    order.push(n);
  }
  nodes.forEach(visit);
  var COLS = 4;
  order.forEach(function (n, idx) {
    n.x = 20 + (idx % COLS) * 175;
    n.y = ANCHOR_TOP_MARGIN + 20 + Math.floor(idx / COLS) * 90;
  });
}

function importSequenceJSON(stKey, jsonText) {
  var parsed;
  try { parsed = JSON.parse(jsonText); }
  catch (e) { return 'JSON gak valid: ' + e.message; }
  if (!Array.isArray(parsed)) return 'JSON harus array varian: [{"condition":"","nodes":[...]}]';

  var newVariants = [];
  for (var vi = 0; vi < parsed.length; vi++) {
    var raw = parsed[vi] || {};
    if (!Array.isArray(raw.nodes)) return 'Varian ke-' + (vi + 1) + ' butuh field "nodes" (array)';
    var v = { condition: String(raw.condition || '').trim(), comment: String(raw.comment || '').trim(), nodes: [] };
    var allPositioned = true; // turun jadi false begitu ada satu node tanpa x/y valid
    // Posisi START/END manual ikut kebawa. Kalau JSON-nya gak bawa (atau angkanya ngaco), dibiarkan
    // kosong supaya balik ke penempatan otomatis - bukan dipaksa ke 0,0 di pojok.
    ['startPos', 'endPos'].forEach(function (k) {
      var p = raw[k];
      if (!p) return;
      var ax = Number(p.x), ay = Number(p.y);
      if (isFinite(ax) && isFinite(ay)) v[k] = { x: Math.max(0, ax), y: Math.max(0, ay) };
    });
    for (var ni = 0; ni < raw.nodes.length; ni++) {
      var n = raw.nodes[ni] || {};
      var where = 'Varian ke-' + (vi + 1) + ' node ke-' + (ni + 1);
      var t = n.type || 'motion';   // JSON lama gak punya "type" - semuanya motion
      if (!n.id) return where + ' butuh "id"';
      if (BLOCK_TYPES.indexOf(t) < 0) return where + ' (' + n.id + ') punya type "' + t + '" yang gak dikenal (' + BLOCK_TYPES.join('/') + ')';
      if (t === 'motion' && !n.sol) return where + ' bertipe motion, butuh "sol"';
      if (t === 'decision' && !n.cond) return where + ' bertipe decision, butuh "cond" (bit yang dicek)';
      if ((t === 'setmem' || t === 'resetmem') && !n.bit) return where + ' bertipe ' + t + ', butuh "bit"';
      if (n.join !== undefined && n.join !== 'AND' && n.join !== 'OR') {
        return 'Varian ke-' + (vi + 1) + ' node "' + n.id + '": "join" harus persis "AND" atau "OR" (ketemu ' + JSON.stringify(n.join) + ')';
      }
      var px = Number(n.x), py = Number(n.y);
      var hasXY = isFinite(px) && isFinite(py);
      if (!hasXY) allPositioned = false;
      var node = {
        id: String(n.id), type: t,
        after: Array.isArray(n.after) ? n.after.map(String) : [],
        join: n.join === 'OR' ? 'OR' : 'AND',
        x: hasXY ? Math.max(0, px) : 0, y: hasXY ? Math.max(0, py) : 0
      };
      if (t === 'motion') node.sol = String(n.sol);
      else if (t === 'decision') { node.cond = String(n.cond); node.comment = String(n.comment || '').trim(); }
      else if (t === 'setmem' || t === 'resetmem') { node.bit = String(n.bit); node.comment = String(n.comment || '').trim(); }
      else if (t === 'alarm') {
        node.category = ALARM_CATS.indexOf(n.category) >= 0 ? n.category : 'faultstop';
        node.comment = String(n.comment || '').trim();
      }
      v.nodes.push(node);
    }
    // auto-bikin node "condition" buat tiap `after` yang gak match id node motion manapun di varian ini
    var motionIds = {}; v.nodes.forEach(function (n) { motionIds[n.id] = true; });
    var extraBits = [];
    // refBase() WAJIB dipakai di sini: rujukan cabang decision bentuknya "d1#Y". Tanpa dikupas
    // port-nya, "d1#Y" gak match id node manapun dan bakal disalahartikan jadi bit condition -
    // muncul node hantu bernama "d1#Y" di kanvas.
    v.nodes.forEach(function (n) {
      n.after.forEach(function (ref) {
        var b = refBase(ref);
        if (!motionIds[b] && extraBits.indexOf(b) < 0) extraBits.push(b);
      });
    });
    var cc = (raw.conditionComments && typeof raw.conditionComments === 'object') ? raw.conditionComments : {};
    var cp = (raw.conditionPositions && typeof raw.conditionPositions === 'object') ? raw.conditionPositions : {};
    extraBits.forEach(function (bit) {
      var p = cp[bit] || {};
      var bx = Number(p.x), by = Number(p.y);
      var okXY = isFinite(bx) && isFinite(by);
      if (!okXY) allPositioned = false;
      v.nodes.push({
        id: bit, type: 'condition', bit: bit, comment: String(cc[bit] || '').trim(),
        x: okXY ? Math.max(0, bx) : 0, y: okXY ? Math.max(0, by) : 0
      });
    });
    // Auto-layout cuma kalau ada node yang posisinya gak kebawa. Sekali ada yang hilang, SELURUH varian
    // ditata ulang - jangan campur posisi asli sama hasil hitungan, itu malah numpuk di titik acak.
    if (!allPositioned) layoutVariantNodes(v.nodes);
    newVariants.push(v);
  }

  motionState[stKey] = newVariants.length ? newVariants : [{ condition: '', nodes: [] }];
  // motionCounters dipakai buat generate id "n1","n2",... lewat tombol +solenoid - naikkin biar
  // gak collide sama id yang barusan diimport (mis. JSON-nya juga pake id "n1").
  motionState[stKey].forEach(function (v, vIdx) {
    var maxN = 0;
    v.nodes.forEach(function (n) {
      var m = /^n(\d+)$/.exec(n.id);
      if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
    });
    motionCounters[vKey(stKey, vIdx)] = maxN + 1;
  });
  selected = null;
  return null;
}

// ===== Condition section: bit bernama, tiap bit = OR dari beberapa AND-group (PATTERN 3 Ndeso) =====
// Station yang gak disentuh (conditionState[st] kosong/gak ada) tetap dapat 3 slot cadangan generik
// lama - lihat gen_all.js section 8. Beda dari Motion Sequence: gak ada topologi graph/chaining,
// cuma daftar bit -> daftar OR-group -> daftar AND-term (bit + NOT), jadi list editor biasa cukup.
function ensureConditionStation(st) { if (!conditionState[st]) conditionState[st] = []; }

function addConditionDef(st) { ensureConditionStation(st); conditionState[st].push({ name: '', bit: '', groups: [[]] }); }

function removeConditionDef(st, di) { if (conditionState[st]) conditionState[st].splice(di, 1); }

function setConditionDefName(st, di, text) { var d = conditionState[st] && conditionState[st][di]; if (d) d.name = (text || '').trim(); }

function setConditionDefBit(st, di, text) { var d = conditionState[st] && conditionState[st][di]; if (d) d.bit = (text || '').trim(); }

function addOrGroup(st, di) { var d = conditionState[st] && conditionState[st][di]; if (d) d.groups.push([]); }

function removeOrGroup(st, di, gi) { var d = conditionState[st] && conditionState[st][di]; if (d) d.groups.splice(gi, 1); }

function addTerm(st, di, gi, bitName) {
  bitName = (bitName || '').trim();
  var d = conditionState[st] && conditionState[st][di];
  if (!d || !bitName) return false;
  d.groups[gi].push({ bit: bitName, neg: false });
  return true;
}

function removeTerm(st, di, gi, ti) { var d = conditionState[st] && conditionState[st][di]; if (d) d.groups[gi].splice(ti, 1); }

function toggleTermNeg(st, di, gi, ti) { var d = conditionState[st] && conditionState[st][di]; if (d) { var t = d.groups[gi][ti]; t.neg = !t.neg; } }

function conditionDefsToJSON(stKey) {
  return JSON.stringify((conditionState[stKey] || []).map(function (d) {
    return {
      name: d.name || '', bit: d.bit || '',
      groups: d.groups.map(function (g) { return g.map(function (t) { return { bit: t.bit, neg: !!t.neg }; }); })
    };
  }), null, 2);
}

function importConditionJSON(stKey, jsonText) {
  var parsed;
  try { parsed = JSON.parse(jsonText); }
  catch (e) { return 'JSON gak valid: ' + e.message; }
  if (!Array.isArray(parsed)) return 'JSON harus array condition: [{"name":"","bit":"","groups":[[{"bit":"LB1","neg":false}]]}]';

  var defs = [];
  for (var i = 0; i < parsed.length; i++) {
    var raw = parsed[i] || {};
    if (!Array.isArray(raw.groups) || !raw.groups.length) return 'Condition ke-' + (i + 1) + ' butuh field "groups" (array, minimal 1 OR-group)';
    var groups = [];
    for (var gi = 0; gi < raw.groups.length; gi++) {
      var rg = raw.groups[gi];
      if (!Array.isArray(rg)) return 'Condition ke-' + (i + 1) + ' group ke-' + (gi + 1) + ' harus array term';
      var terms = [];
      for (var ti = 0; ti < rg.length; ti++) {
        var rt = rg[ti] || {};
        if (!rt.bit) return 'Condition ke-' + (i + 1) + ' group ke-' + (gi + 1) + ' term ke-' + (ti + 1) + ' butuh "bit"';
        terms.push({ bit: String(rt.bit), neg: !!rt.neg });
      }
      groups.push(terms);
    }
    defs.push({ name: String(raw.name || '').trim(), bit: String(raw.bit || '').trim(), groups: groups });
  }
  conditionState[stKey] = defs;
  return null;
}

function renderResults(payload) {
  resEl.innerHTML = '';
  statsEl.textContent = payload.stats;
  warnEl.textContent = payload.warnings || '';
  warnBoxEl.style.display = payload.warnings ? 'block' : 'none';

  if (payload.files.length) {
    var single = document.createElement('div');
    single.className = 'single';
    single.innerHTML = '<div class="t">Import sekali jalan</div>' +
      '<div class="d">Semua program dan global variable dalam 1 file XML.</div>';
    var dlBtn = document.createElement('button');
    dlBtn.className = 'dl'; dlBtn.textContent = 'Download Single XML';
    dlBtn.addEventListener('click', function () { downloadFile(payload.files[0].name, payload.files[0].xml); });
    single.appendChild(dlBtn);
    resEl.appendChild(single);
  }

  // Per-program file (MAIN, tiap station, GlobalVariables.tsv) - kotaknya makan tempat (tiap satu
  // punya textarea gede), disembunyiin default di balik <details>. AllPrograms.xml single-download
  // di atas udah cukup buat kebanyakan kasus.
  var details = document.createElement('details'); details.className = 'per-program';
  if (perProgramOpen) details.open = true;
  details.addEventListener('toggle', function () { perProgramOpen = details.open; });
  var summary = document.createElement('summary'); summary.textContent = 'Download per program (' + payload.files.length + ' file)';
  details.appendChild(summary);
  payload.files.forEach(function (f) {
    var div = document.createElement('div');
    div.className = 'file';
    var row = document.createElement('div');
    row.className = 'row';
    var b = document.createElement('b'); b.textContent = f.name;
    var btn = document.createElement('button'); btn.className = 'dl'; btn.textContent = 'Download';
    btn.addEventListener('click', function () { downloadFile(f.name, f.xml); });
    row.appendChild(b); row.appendChild(btn);
    var ta = document.createElement('textarea'); ta.readOnly = true; ta.value = f.xml;
    div.appendChild(row); div.appendChild(ta);
    details.appendChild(div);
  });
  resEl.appendChild(details);
}

function regenerate() {
  if (!lastSplitMsg) return;
  flowStore.motionSequences = {};
  Object.keys(motionState).forEach(function (st) {
    var variants = motionState[st]
      .map(function (v) {
        var motionNodes = v.nodes.filter(function (n) { return (n.type || 'motion') !== 'condition'; });
        return { condition: v.condition || '', comment: v.comment || '', conditionComments: conditionCommentsOf(v), nodes: motionNodes.map(function (n) {
          // x/y sengaja dibuang di sini - generator gak perlu tata letak, itu murni data editor
          var s = serializeNode(n); delete s.x; delete s.y; return s;
        }) };
      })
      .filter(function (v) { return v.nodes.length; });
    if (variants.length) flowStore.motionSequences[st] = variants;
  });
  flowStore.conditionDefs = {};
  Object.keys(conditionState).forEach(function (st) {
    var defs = (conditionState[st] || [])
      .map(function (d) {
        return {
          name: d.name || '', bit: d.bit || '',
          groups: d.groups.filter(function (g) { return g.length; }).map(function (g) {
            return g.map(function (t) { return { bit: t.bit, neg: !!t.neg }; });
          })
        };
      })
      .filter(function (d) { return d.groups.length; });
    if (defs.length) flowStore.conditionDefs[st] = defs;
  });
  flowStore.stationNames = stationNames;
  flowStore.timerDefaults = { phpx: timerPhpxEl ? timerPhpxEl.value : '', motion: timerMotionEl ? timerMotionEl.value : '' };
  flowStore.actuatorOverrides = actuatorOverrides;
  try {
    // Salinan wrapper baru tiap panggil - gen_all.js nge-reassign msg.payload di baris terakhirnya,
    // kalau lastSplitMsg dipakai langsung, groups di dalamnya keganti hasil generate pas dipanggil lagi.
    var msg = runNode(GEN_ALL_JS, { payload: lastSplitMsg.payload }, flowStore);
    renderResults(msg.payload);
  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
  }
}

// Titik masuk (root) dan titik akhir (leaf) sebuah varian. Dipisah dari renderVariantGraph biar bisa
// diuji tanpa DOM - ini logika yang nentuin ke mana panah START dan END digambar, dan salah sedikit
// aja gambarnya langsung nyeritain alur yang beda dari ladder-nya.
function graphEnds(nodes) {
  var nodeIds = {}; nodes.forEach(function (n) { nodeIds[n.id] = true; });
  var isStep = function (n) { return (n.type || 'motion') !== 'condition'; };
  var referencedIds = {};
  nodes.forEach(function (n) {
    (n.after || []).forEach(function (ref) { var b = refBase(ref); if (nodeIds[b]) referencedIds[b] = true; });
  });
  var roots = nodes.filter(function (n) {
    return isStep(n) && !(n.after || []).some(function (ref) { return nodeIds[refBase(ref)]; });
  });
  var leaves = nodes.filter(function (n) { return isStep(n) && !referencedIds[n.id]; });
  return {
    nodeIds: nodeIds, roots: roots, leaves: leaves,
    targets: roots.length ? roots : nodes.filter(isStep),
    sources: leaves.length ? leaves : nodes.filter(isStep)
  };
}

function renderVariantGraph(stKey, vIdx) {
  var variant = motionState[stKey][vIdx];
  var nodes = variant.nodes;
  var key = vKey(stKey, vIdx);
  var maxY = 40, maxX = 0;
  nodes.forEach(function (n) {
    if (n.y + NODE_H > maxY) maxY = n.y + NODE_H;
    if (n.x + nodeW(n) > maxX) maxX = n.x + nodeW(n);
  });

  // Node "Start"/"Finish" - MURNI visual, gak ikut jadi rung. Sambungannya dihitung tiap render dari
  // graph SEKARANG, tapi POSISINYA bisa digeser dan disimpan (variant.startPos/endPos) - selama belum
  // pernah digeser, posisinya ngikut rata-rata node tujuan/asal seperti dulu.
  // Start nyambung ke tiap node yang gak nunjuk node
  // lain (root), Finish nyambung DARI tiap node yang gak ada yang nunjuk dia (leaf) -
  // biar kelihatan jelas dari mana mulai dan kemana berakhirnya sequence-nya. Lingkaran kecil (logo
  // flowchart terminal biasa). Titik sambungnya ikut sideAnchor kayak kabel antar-node: karena Start
  // selalu di atas dan Finish di bawah, sisi yang kepilih ya tetap atas/bawah - tapi sekarang nempel
  // ke sisi terdekat kalau node-nya digeser jauh ke samping, gak lagi maksa ke tengah atas/bawah.
  // refBase() WAJIB di sini. Rujukan cabang decision bentuknya "d1#Y" - tanpa dikupas port-nya dia
  // gak match id node manapun, jadi node yang SUDAH nunggu hasil judgement kebaca sebagai root dan
  // ikut ditarik START. Gambarnya lalu bohong: kelihatan jalan barengan padahal ladder-nya nunggu.
  // Semua tipe blok ikut dihitung (bukan cuma motion): sequence sah dimulai dari judgement, dan sah
  // berakhir di alarm. Yang dikecualikan cuma "condition" - itu penanda bit rujukan, bukan langkah.
  var ends = graphEnds(nodes);
  var nodeIds = ends.nodeIds;
  var fallbackTargets = ends.targets, fallbackSources = ends.sources;
  // Posisi START/END: kalau user pernah nggeser, pakai yang disimpan; kalau belum, hitung otomatis
  // dari rata-rata node tujuan/asal seperti sebelumnya.
  var startFixed = variant.startPos, endFixed = variant.endPos;
  function avgCenterX(list, fallbackX) {
    if (!list.length) return fallbackX;
    var sum = 0; list.forEach(function (n) { sum += nodeCenter(n).x; });
    return sum / list.length;
  }
  var startAnchor = startFixed
    ? { x: startFixed.x, y: startFixed.y }
    : { x: avgCenterX(fallbackTargets, 20 + NODE_W / 2) - ANCHOR_R, y: 18 - ANCHOR_R };
  var finishAnchor = endFixed
    ? { x: endFixed.x, y: endFixed.y }
    : { x: avgCenterX(fallbackSources, 20 + NODE_W / 2) - ANCHOR_R, y: maxY + 22 };

  // Kanvas harus ikut melar kalau START/END digeser ke luar batas node - kalau enggak, bulatannya
  // kepotong dan gak bisa diseret balik.
  var needW = Math.max(maxX, startAnchor.x + ANCHOR_R * 2, finishAnchor.x + ANCHOR_R * 2);
  var needH = Math.max(maxY, startAnchor.y + ANCHOR_R * 2, finishAnchor.y + ANCHOR_R * 2);
  var svg = svgEl('svg', { class: 'graph-canvas', width: Math.max(620, needW + 40), height: Math.max(160, needH + 30) });
  var markerId = 'arrow-' + stKey + '-' + vIdx;
  var defs = svgEl('defs');
  var marker = svgEl('marker', { id: markerId, markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', fill: '#666' }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  function anchorEdgeDown(fromCx, fromCy, toNode) {
    var p = sideAnchor(toNode, fromCx, fromCy);
    svg.appendChild(svgEl('line', {
      class: 'gedge-line anchor', x1: fromCx, y1: fromCy, x2: p.x, y2: p.y,
      'marker-end': 'url(#' + markerId + ')'
    }));
  }
  function anchorEdgeUp(fromNode, toCx, toCy) {
    var p = sideAnchor(fromNode, toCx, toCy);
    svg.appendChild(svgEl('line', {
      class: 'gedge-line anchor', x1: p.x, y1: p.y, x2: toCx, y2: toCy,
      'marker-end': 'url(#' + markerId + ')'
    }));
  }
  function anchorNode(pos, label, which) {
    var cx = pos.x + ANCHOR_R, cy = pos.y + ANCHOR_R;
    var g = svgEl('g');
    var circle = svgEl('circle', { class: 'gnode-rect anchor', cx: cx, cy: cy, r: ANCHOR_R });
    g.appendChild(circle);
    var t = svgEl('text', { class: 'gnode-text', x: cx, y: cy + 3, 'text-anchor': 'middle' });
    t.textContent = label;
    g.appendChild(t);
    var tip = svgEl('title');
    tip.textContent = label + ' - seret buat mindahin, klik ganda buat balikin ke posisi otomatis';
    g.appendChild(tip);
    g.addEventListener('mousedown', function (ev) {
      ev.stopPropagation();
      var bb = svg.getBoundingClientRect();
      dragState = { mode: 'anchor', stKey: stKey, vIdx: vIdx, which: which,
                    offX: ev.clientX - bb.left - pos.x, offY: ev.clientY - bb.top - pos.y };
    });
    // Klik ganda = lupakan posisi manual, balik ngikut rata-rata node lagi.
    g.addEventListener('dblclick', function (ev) {
      ev.stopPropagation();
      var v = motionState[stKey][vIdx];
      if (which === 'start') delete v.startPos; else delete v.endPos;
      renderMotionPanel();
    });
    svg.appendChild(g);
    return { cx: cx, cy: cy };
  }
  var startC = anchorNode(startAnchor, 'START', 'start');
  fallbackTargets.forEach(function (n) { anchorEdgeDown(startC.cx, startC.cy + ANCHOR_R, n); });
  var finishC = anchorNode(finishAnchor, 'END', 'end');
  fallbackSources.forEach(function (n) { anchorEdgeUp(n, finishC.cx, finishC.cy - ANCHOR_R); });

  nodes.forEach(function (n) {
    if ((n.type || 'motion') === 'condition') return;
    (n.after || []).forEach(function (fromId) {
      // fromId bisa "d1#Y" - node sumbernya tetap "d1"
      var from = findNode(stKey, vIdx, refBase(fromId));
      if (!from) return;
      var isSel = selected && selected.kind === 'edge' && selected.stKey === stKey && selected.vIdx === vIdx &&
        selected.fromId === fromId && selected.toId === n.id;
      var p1 = sideAnchor(from, nodeCenter(n).x, nodeCenter(n).y);
      var p2 = sideAnchor(n, nodeCenter(from).x, nodeCenter(from).y);
      var line = svgEl('line', {
        class: 'gedge-line' + (isSel ? ' selected' : ''), x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        'marker-end': 'url(#' + markerId + ')'
      });
      line.addEventListener('click', function (ev) {
        ev.stopPropagation();
        selected = { stKey: stKey, vIdx: vIdx, kind: 'edge', fromId: fromId, toId: n.id };
        renderMotionPanel();
      });
      svg.appendChild(line);
    });
  });

  if (dragState && dragState.mode === 'connect' && dragState.stKey === stKey && dragState.vIdx === vIdx) {
    var src = findNode(stKey, vIdx, dragState.fromId);
    if (src) {
      var sp = sideAnchor(src, dragState.x, dragState.y);
      svg.appendChild(svgEl('line', {
        class: 'gtemp-line', x1: sp.x, y1: sp.y, x2: dragState.x, y2: dragState.y
      }));
    }
  }

  nodes.forEach(function (n) {
    var g = svgEl('g', { transform: 'translate(' + n.x + ',' + n.y + ')' });
    var isSelNode = selected && selected.kind === 'node' && selected.stKey === stKey && selected.vIdx === vIdx && selected.id === n.id;

    // Tooltip buat SEMUA blok berkomen, bukan cuma condition - berguna kalau komennya panjang dan
    // label di kanvas jadi lebar; hover tetap nampilin teks utuhnya. Node syarat SELALU dapat tooltip
    // walau gak berkomen, isinya arah sambungan - itu yang paling sering bikin bingung: dia cuma bisa
    // jadi SUMBER, dan nyeret ke arah dia bakal ditolak diam-diam.
    var tipTxt = n.comment || '';
    if (ntype === 'condition') {
      // Backslash-nya WAJIB dobel di sini. HTML di build_html.py itu string Python BIASA (bukan raw),
      // jadi escape tunggal bakal ditelan Python jadi baris baru beneran dan literal JS-nya kebuka.
      // Konvensi yang sama dipakai placeholder JSON di atas (tab-nya juga ditulis dobel).
      tipTxt = 'Syarat: ' + n.bit + (n.comment ? ' - ' + n.comment : '') +
        '\\nTarik dari bulatan kuning ke langkah yang harus NUNGGU bit ini.' +
        '\\nGak bisa jadi tujuan panah: bit ini didrive di luar flowchart (Condition section / sensor).';
    }
    if (tipTxt) {
      var titleEl = svgEl('title'); titleEl.textContent = tipTxt; g.appendChild(titleEl);
    }

    var w = nodeW(n);
    var ntype = n.type || 'motion';
    var rect = svgEl('rect', { class: 'gnode-rect' + (ntype === 'motion' ? '' : ' ' + ntype) + (isSelNode ? ' selected' : ''), width: w, height: NODE_H, rx: 6 });
    rect.addEventListener('mousedown', function (ev) {
      ev.stopPropagation();
      selected = { stKey: stKey, vIdx: vIdx, kind: 'node', id: n.id };
      var bb = svg.getBoundingClientRect();
      dragState = { mode: 'move', stKey: stKey, vIdx: vIdx, id: n.id, moved: false, offX: ev.clientX - bb.left - n.x, offY: ev.clientY - bb.top - n.y };
      renderMotionPanel();
    });
    g.appendChild(rect);

    var text = svgEl('text', { class: 'gnode-text', x: 6, y: NODE_H / 2 + 3 });
    text.textContent = nodeLabel(n);
    g.appendChild(text);

    var delC = svgEl('circle', { class: 'gnode-del', cx: w, cy: 0, r: 7 });
    delC.addEventListener('mousedown', function (ev) { ev.stopPropagation(); });
    delC.addEventListener('click', function (ev) {
      ev.stopPropagation(); removeNode(stKey, vIdx, n.id); renderMotionPanel(); regenerate();
    });
    g.appendChild(delC);
    var delT = svgEl('text', { class: 'gnode-del-text', x: w, y: 3 });
    delT.textContent = 'x';
    g.appendChild(delT);

    // Blok decision punya DUA port keluar: Y (kanan, kuning) dan N (bawah, abu). Tiap port nyeret
    // rujukan "id#Y"/"id#N" - itu yang bikin generator tau cabang mana yang nyambung ke node hilir.
    function addHandle(port, hx, hy) {
      var h = svgEl('circle', { class: 'gnode-handle' + (port === 'N' ? ' port-n' : ''), cx: hx, cy: hy, r: 6 });
      h.addEventListener('mousedown', function (ev) {
        ev.stopPropagation();
        dragState = { mode: 'connect', stKey: stKey, vIdx: vIdx, fromId: n.id + (port ? '#' + port : ''),
                      x: n.x + hx, y: n.y + hy };
      });
      g.appendChild(h);
      if (port) {
        var pt = svgEl('text', { class: 'gport-text', x: hx, y: hy + 3 });
        pt.textContent = port; g.appendChild(pt);
      }
    }
    if (ntype === 'decision') { addHandle('Y', w, NODE_H / 2); addHandle('N', w / 2, NODE_H); }
    else { addHandle('', w, NODE_H / 2); }

    if (ntype !== 'condition' && (n.after || []).length >= 2) {
      var badgeG = svgEl('g', { class: 'gjoin-badge', transform: 'translate(' + (w / 2 - 16) + ',' + (NODE_H + 4) + ')' });
      badgeG.appendChild(svgEl('rect', { width: 32, height: 14, rx: 3 }));
      var badgeText = svgEl('text', { x: 16, y: 10 });
      badgeText.textContent = n.join === 'OR' ? 'OR' : 'AND';
      badgeG.appendChild(badgeText);
      badgeG.addEventListener('click', function (ev) {
        ev.stopPropagation(); toggleJoin(stKey, vIdx, n.id); renderMotionPanel(); regenerate();
      });
      g.appendChild(badgeG);
    }

    svg.appendChild(g);
  });

  svgRefs[key] = svg;
  return svg;
}

function onDocMouseMove(ev) {
  if (!dragState) return;
  var key = vKey(dragState.stKey, dragState.vIdx);
  var svg = svgRefs[key];
  if (!svg) return;
  var bb = svg.getBoundingClientRect();
  if (dragState.mode === 'move') {
    dragState.moved = true;
    moveNode(dragState.stKey, dragState.vIdx, dragState.id, ev.clientX - bb.left - dragState.offX, ev.clientY - bb.top - dragState.offY);
    renderMotionPanel();
  } else if (dragState.mode === 'connect') {
    dragState.x = ev.clientX - bb.left; dragState.y = ev.clientY - bb.top;
    renderMotionPanel();
  } else if (dragState.mode === 'anchor') {
    var variant = motionState[dragState.stKey] && motionState[dragState.stKey][dragState.vIdx];
    if (!variant) return;
    var pos = { x: Math.max(0, Math.round(ev.clientX - bb.left - dragState.offX)),
                y: Math.max(0, Math.round(ev.clientY - bb.top - dragState.offY)) };
    if (dragState.which === 'start') variant.startPos = pos; else variant.endPos = pos;
    renderMotionPanel();
  }
}

function onDocMouseUp(ev) {
  if (!dragState) return;
  if (dragState.mode === 'connect') {
    var key = vKey(dragState.stKey, dragState.vIdx);
    var svg = svgRefs[key];
    if (svg) {
      var bb = svg.getBoundingClientRect();
      var mx = ev.clientX - bb.left, my = ev.clientY - bb.top;
      var nodes = motionState[dragState.stKey][dragState.vIdx].nodes;
      var target = nodes.filter(function (n) {
        return mx >= n.x && mx <= n.x + nodeW(n) && my >= n.y && my <= n.y + NODE_H;
      })[0];
      // Penolakan sambungan dulu diem total - user cuma lihat panahnya ilang tanpa tau kenapa.
      graphHint = null;
      if (target) {
        var ok = addEdge(dragState.stKey, dragState.vIdx, dragState.fromId, target.id);
        if (!ok) {
          graphHint = { key: key, text: (target.type || 'motion') === 'condition'
            ? 'Blok syarat "' + target.bit + '" gak bisa jadi TUJUAN panah - dia sumber. '
              + 'Tarik dari bulatan kuningnya ke langkah yang harus nunggu bit ini.'
            : 'Sambungan ditolak: tujuannya sama dengan sumbernya, panahnya sudah ada, atau bakal bikin alur muter.' };
        }
      }
    }
  }
  dragState = null;
  renderMotionPanel();
  regenerate();
}

function onDocKeyDown(ev) {
  if ((ev.key === 'Delete' || ev.key === 'Backspace') && selected) {
    if (document.activeElement && /input|textarea/i.test(document.activeElement.tagName || '')) return;
    ev.preventDefault && ev.preventDefault();
    if (selected.kind === 'node') removeNode(selected.stKey, selected.vIdx, selected.id);
    else if (selected.kind === 'edge') removeEdge(selected.stKey, selected.vIdx, selected.fromId, selected.toId);
    selected = null;
    renderMotionPanel();
    regenerate();
  }
}

function renderMotionPanel() {
  motionPanelEl.innerHTML = '';
  if (!lastSplitMsg) { motionPanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  var any = false;

  stations.forEach(function (stKey) {
    var names = actuatorNamesForStation(groups[stKey]);
    if (!names.length) return;
    any = true;
    ensureStation(stKey);

    var box = document.createElement('div'); box.className = 'station-box';
    var title = document.createElement('div'); title.className = 'station-title'; title.textContent = stKey + (stationNames[stKey] ? ' - ' + stationNames[stKey] : '');
    box.appendChild(title);

    motionState[stKey].forEach(function (variant, vIdx) {
      var vbox = document.createElement('div'); vbox.className = 'variant-box';

      var head = document.createElement('div'); head.className = 'variant-head';
      var lbl = document.createElement('b'); lbl.textContent = 'Variant ' + (vIdx + 1) + ' - Condition:';
      // Isi bit Condition section (LB300, LB301, ...), BUKAN coil latch varian-nya (LB401, LB402, ...) -
      // coil latch dibikin otomatis oleh generator; kalau diketik coil-nya sendiri, generator remap
      // balik ke LB30x + kasih warning (latch gak bisa nge-trigger dirinya sendiri).
      var condPick = makeBitPicker(stKey, variant.condition, '(kosong = selalu aktif)', function (val) {
        setVariantCondition(stKey, vIdx, val); regenerate();
      });
      condPick.el.title = 'Bit Condition section (LB300, LB301, ...) yang nge-select varian ini. Jangan diisi LB401/LB402 - itu coil latch yang dibikin otomatis.';
      var cmtLbl = document.createElement('b'); cmtLbl.textContent = 'Comment:'; cmtLbl.style.marginLeft = '8px';
      var cmtInput = document.createElement('input'); cmtInput.placeholder = '(nama/keterangan varian, muncul di JSON+XML)'; cmtInput.value = variant.comment || ''; cmtInput.style.width = '220px';
      cmtInput.addEventListener('change', function () { setVariantComment(stKey, vIdx, cmtInput.value); regenerate(); });
      var rmV = document.createElement('button'); rmV.className = 'rm-variant'; rmV.textContent = 'Remove variant';
      rmV.addEventListener('click', function () { removeVariant(stKey, vIdx); renderMotionPanel(); regenerate(); });
      head.appendChild(lbl); head.appendChild(condPick.el); head.appendChild(cmtLbl); head.appendChild(cmtInput); head.appendChild(rmV);
      vbox.appendChild(head);

      var toolbar = document.createElement('div'); toolbar.className = 'graph-toolbar';
      names.forEach(function (n) {
        var btn = document.createElement('button'); btn.className = 'avail-btn'; btn.textContent = '+ ' + n;
        btn.addEventListener('click', function () { addMotionNode(stKey, vIdx, n); renderMotionPanel(); regenerate(); });
        toolbar.appendChild(btn);
      });
      var condCmtInput = document.createElement('input'); condCmtInput.placeholder = 'komen bit ini (opsional)'; condCmtInput.style.width = '160px';
      // Pilih Condition yang udah dibikin -> komennya ikut keisi dari nama Condition-nya, selama user
      // belum ngetik komen sendiri (jangan nimpa yang udah diketik).
      var condNodePick = makeBitPicker(stKey, '', '-- pilih condition --', function (val) {
        if (condCmtInput.value.trim()) return;
        var def = (conditionState[stKey] || []).filter(function (d) { return d.bit === val; })[0];
        if (def && def.name) condCmtInput.value = def.name;
      });
      var condBtn = document.createElement('button'); condBtn.className = 'add-cond'; condBtn.textContent = '+ Syarat/bit';
      condBtn.title = 'Taruh bit yang SUDAH ada (Condition section, sensor, memory) sebagai SYARAT. '
        + 'Tarik dari bulatan kuningnya ke langkah yang harus nunggu bit itu ON. '
        + 'Arahnya satu jalur: dia sumber, gak bisa jadi tujuan panah - logic yang nyalain bit itu ditulis di luar flowchart.';
      condBtn.addEventListener('click', function () {
        if (addConditionNode(stKey, vIdx, condNodePick.get(), condCmtInput.value)) {
          condNodePick.reset(); condCmtInput.value = ''; renderMotionPanel(); regenerate();
        }
      });
      toolbar.appendChild(condNodePick.el); toolbar.appendChild(condCmtInput); toolbar.appendChild(condBtn);
      vbox.appendChild(toolbar);

      // ===== Baris blok flowchart: IF-ELSE / SET / RESET / ALARM =====
      // Bit yang dipakai (kondisi judgement, target memory) dipilih lewat dropdown yang sama dengan
      // Condition - jadi sensor, bit Condition, atau bit custom semuanya bisa dipakai.
      var blockBar = document.createElement('div'); blockBar.className = 'graph-toolbar';
      var blkLbl = document.createElement('b'); blkLbl.textContent = 'Blok:'; blkLbl.style.fontSize = '11px';
      blockBar.appendChild(blkLbl);

      var blkPick = makeBitPicker(stKey, '', '-- pilih bit --', null);
      var blkCmt = document.createElement('input'); blkCmt.placeholder = 'komen blok (opsional)'; blkCmt.style.width = '150px';
      blockBar.appendChild(blkPick.el); blockBar.appendChild(blkCmt);

      function addBlk(spec, needBit) {
        var bit = blkPick.get();
        if (needBit && !bit) { window.alert('Pilih dulu bit-nya di dropdown "-- pilih bit --".'); return; }
        spec.comment = blkCmt.value.trim();
        addBlockNode(stKey, vIdx, spec);
        blkPick.reset(); blkCmt.value = '';
        renderMotionPanel(); regenerate();
      }
      function blkBtn(label, title, cls, fn) {
        var b = document.createElement('button'); b.className = cls; b.textContent = label; b.title = title;
        b.addEventListener('click', fn); blockBar.appendChild(b);
      }
      blkBtn('+ IF/ELSE', 'Blok judgement: satu masuk, dua keluar (port Y kanan, port N bawah)', 'add-cond',
        function () { addBlk({ type: 'decision', cond: blkPick.get() }, true); });
      blkBtn('+ SET mem', 'Set bit memory (latch, bertahan sampai di-reset)', 'add-cond',
        function () { addBlk({ type: 'setmem', bit: blkPick.get() }, true); });
      blkBtn('+ RESET mem', 'Reset bit memory', 'add-cond',
        function () { addBlk({ type: 'resetmem', bit: blkPick.get() }, true); });

      var alarmSel = document.createElement('select');
      ALARM_CATS.forEach(function (c) {
        var o = document.createElement('option'); o.value = c; o.textContent = ALARM_CAT_LABEL[c]; alarmSel.appendChild(o);
      });
      alarmSel.value = 'faultstop';
      blockBar.appendChild(alarmSel);
      blkBtn('+ ALARM', 'Trigger alarm: dapat slot AL[] otomatis dan masuk grup kategori yang dipilih', 'add-cond',
        function () { addBlk({ type: 'alarm', category: alarmSel.value }, false); });

      vbox.appendChild(blockBar);

      vbox.appendChild(renderVariantGraph(stKey, vIdx));

      if (graphHint && graphHint.key === vKey(stKey, vIdx)) {
        var hintEl = document.createElement('div');
        hintEl.className = 'graph-hint';
        hintEl.textContent = graphHint.text;
        vbox.appendChild(hintEl);
      }

      if (selected && selected.kind === 'node' && selected.stKey === stKey && selected.vIdx === vIdx) {
        var selNode = findNode(stKey, vIdx, selected.id);
        if (selNode) {
          // Panel edit blok terpilih. Semua handler pakai event 'change' (kejadiannya pas blur), jadi
          // renderMotionPanel() di sini gak ngerebut fokus di tengah ngetik - dan perlu dipanggil biar
          // label di kanvas ikut berubah, karena komen sekarang ditampilin di sana.
          var selType = selNode.type || 'motion';
          var editRow = document.createElement('div'); editRow.className = 'graph-toolbar';
          var editLbl = document.createElement('b');
          editLbl.textContent = 'Edit blok "' + nodeLabel(selNode) + '":';
          editLbl.style.fontSize = '11px';
          editRow.appendChild(editLbl);

          function applyEdit(key, value) {
            setNodeField(stKey, vIdx, selNode.id, key, value);
            renderMotionPanel(); regenerate();
          }

          if (selType === 'motion') {
            var solSel = document.createElement('select');
            names.forEach(function (nm) {
              var o = document.createElement('option'); o.value = nm; o.textContent = nm; solSel.appendChild(o);
            });
            solSel.value = selNode.sol;
            solSel.addEventListener('change', function () { applyEdit('sol', solSel.value); });
            editRow.appendChild(solSel);

          } else if (selType === 'decision') {
            editRow.appendChild(makeBitPicker(stKey, selNode.cond || '', '-- kondisi --',
              function (val) { applyEdit('cond', val); }).el);

          } else if (selType === 'setmem' || selType === 'resetmem') {
            editRow.appendChild(makeBitPicker(stKey, selNode.bit || '', '-- bit memory --',
              function (val) { applyEdit('bit', val); }).el);

          } else if (selType === 'alarm') {
            var catSel = document.createElement('select');
            ALARM_CATS.forEach(function (c) {
              var o = document.createElement('option'); o.value = c; o.textContent = ALARM_CAT_LABEL[c]; catSel.appendChild(o);
            });
            catSel.value = selNode.category || 'faultstop';
            catSel.addEventListener('change', function () { applyEdit('category', catSel.value); });
            editRow.appendChild(catSel);
          }

          // Node "condition" id-nya SAMA dengan nama bitnya, jadi bitnya gak bisa diubah di sini -
          // itu bakal ngubah id dan mutusin semua panah yang nyambung. Hapus lalu bikin ulang.
          if (selType !== 'motion') {
            var editInput = document.createElement('input');
            editInput.value = selNode.comment || '';
            editInput.placeholder = 'komen blok (opsional)';
            editInput.style.width = '220px';
            editInput.addEventListener('change', function () { applyEdit('comment', editInput.value); });
            editRow.appendChild(editInput);
          }
          vbox.appendChild(editRow);
        }
      }

      box.appendChild(vbox);
    });

    var addVBtn = document.createElement('button'); addVBtn.className = 'add-variant'; addVBtn.textContent = '+ Variant';
    addVBtn.addEventListener('click', function () { addVariant(stKey); renderMotionPanel(); });
    box.appendChild(addVBtn);

    var jsonKey = 'motion:' + stKey;
    var jsonBox = document.createElement('details'); jsonBox.className = 'json-io';
    if (jsonBoxOpen[jsonKey]) jsonBox.open = true;
    jsonBox.addEventListener('toggle', function () { jsonBoxOpen[jsonKey] = jsonBox.open; });
    var jsonLabel = document.createElement('summary');
    jsonLabel.textContent = 'Import/Export JSON (array varian)';
    var jsonTa = document.createElement('textarea');
    jsonTa.placeholder = '[{"condition":"","comment":"","nodes":[{"id":"n1","sol":"' + (names[0] || 'SOL_...') + '","after":[],"join":"AND"}]}]';
    var jsonMsg = document.createElement('div'); jsonMsg.className = 'json-msg';
    var jsonRow = buildJsonIORow(jsonTa, jsonMsg,
      function () { return variantsToJSON(stKey); },
      function (text) {
        var err = importSequenceJSON(stKey, text);
        if (err) return err;
        renderMotionPanel(); regenerate();
        return null;
      },
      'motion-' + stKey + '.json');
    jsonBox.appendChild(jsonLabel); jsonBox.appendChild(jsonTa); jsonBox.appendChild(jsonRow); jsonBox.appendChild(jsonMsg);
    box.appendChild(jsonBox);

    motionPanelEl.appendChild(box);
  });

  motionPanelEl.style.display = any ? 'block' : 'none';
}

function renderConditionPanel() {
  conditionPanelEl.innerHTML = '';
  if (!lastSplitMsg) { conditionPanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  if (!stations.length) { conditionPanelEl.style.display = 'none'; return; }

  stations.forEach(function (stKey) {
    ensureConditionStation(stKey);

    var box = document.createElement('div'); box.className = 'station-box';
    var title = document.createElement('div'); title.className = 'station-title'; title.textContent = stKey + (stationNames[stKey] ? ' - ' + stationNames[stKey] : '');
    box.appendChild(title);
    if (!conditionState[stKey].length) {
      var hint = document.createElement('div'); hint.className = 'hint';
      hint.textContent = 'Belum ada Condition custom - pakai 3 slot cadangan generik (LB300-LB302).';
      box.appendChild(hint);
    }

    conditionState[stKey].forEach(function (def, di) {
      var dbox = document.createElement('div'); dbox.className = 'variant-box';

      var head = document.createElement('div'); head.className = 'variant-head';
      var nameLbl = document.createElement('b'); nameLbl.textContent = 'Condition ' + (di + 1) + ' - Name:';
      var nameInput = document.createElement('input'); nameInput.placeholder = 'mis. P&P Take Out Lowering Auto Start Condition'; nameInput.value = def.name; nameInput.style.width = '260px';
      // renderMotionPanel() ikut dipanggil: dropdown Condition di panel Motion ngambil isinya dari
      // conditionState, jadi tiap nama/bit berubah daftarnya harus dibangun ulang biar gak basi.
      // Aman dari rebutan fokus - yang dirender ulang panel Motion, bukan panel Condition ini.
      nameInput.addEventListener('change', function () { setConditionDefName(stKey, di, nameInput.value); renderMotionPanel(); regenerate(); });
      var bitLbl = document.createElement('b'); bitLbl.textContent = 'Bit:'; bitLbl.style.marginLeft = '8px';
      var bitInput = document.createElement('input'); bitInput.placeholder = '(kosong = auto LB30' + di + ')'; bitInput.value = def.bit;
      bitInput.addEventListener('change', function () { setConditionDefBit(stKey, di, bitInput.value); renderMotionPanel(); regenerate(); });
      var rmD = document.createElement('button'); rmD.className = 'rm-variant'; rmD.textContent = 'Remove condition';
      rmD.addEventListener('click', function () { removeConditionDef(stKey, di); renderConditionPanel(); renderMotionPanel(); regenerate(); });
      head.appendChild(nameLbl); head.appendChild(nameInput); head.appendChild(bitLbl); head.appendChild(bitInput); head.appendChild(rmD);
      dbox.appendChild(head);

      def.groups.forEach(function (group, gi) {
        var gbox = document.createElement('div'); gbox.className = 'cond-group-box';
        if (gi > 0) { var orLbl = document.createElement('div'); orLbl.className = 'cond-or-label'; orLbl.textContent = 'OR'; gbox.appendChild(orLbl); }

        group.forEach(function (term, ti) {
          var trow = document.createElement('span'); trow.className = 'cond-term';
          var negBtn = document.createElement('button'); negBtn.className = 'cond-neg' + (term.neg ? ' active' : ''); negBtn.textContent = term.neg ? 'NOT' : 'AND';
          negBtn.title = 'klik buat toggle NOT';
          negBtn.addEventListener('click', function () { toggleTermNeg(stKey, di, gi, ti); renderConditionPanel(); regenerate(); });
          var termLbl = document.createElement('span'); termLbl.className = 'cond-term-bit'; termLbl.textContent = term.bit;
          var rmT = document.createElement('button'); rmT.className = 'cond-rm-term'; rmT.textContent = 'x';
          rmT.addEventListener('click', function () { removeTerm(stKey, di, gi, ti); renderConditionPanel(); regenerate(); });
          trow.appendChild(negBtn); trow.appendChild(termLbl); trow.appendChild(rmT);
          gbox.appendChild(trow);
        });

        var termInput = document.createElement('input'); termInput.placeholder = 'nama bit (mis. LB206)'; termInput.className = 'cond-term-input';
        var addTBtn = document.createElement('button'); addTBtn.className = 'avail-btn'; addTBtn.textContent = '+ term';
        addTBtn.addEventListener('click', function () {
          if (addTerm(stKey, di, gi, termInput.value)) { termInput.value = ''; renderConditionPanel(); regenerate(); }
        });
        gbox.appendChild(termInput); gbox.appendChild(addTBtn);

        if (def.groups.length > 1) {
          var rmG = document.createElement('button'); rmG.className = 'cond-rm-term'; rmG.textContent = 'hapus grup';
          rmG.addEventListener('click', function () { removeOrGroup(stKey, di, gi); renderConditionPanel(); regenerate(); });
          gbox.appendChild(rmG);
        }
        dbox.appendChild(gbox);
      });

      var addGBtn = document.createElement('button'); addGBtn.className = 'avail-btn'; addGBtn.textContent = '+ OR group';
      addGBtn.addEventListener('click', function () { addOrGroup(stKey, di); renderConditionPanel(); regenerate(); });
      dbox.appendChild(addGBtn);

      box.appendChild(dbox);
    });

    var addDBtn = document.createElement('button'); addDBtn.className = 'add-variant'; addDBtn.textContent = '+ Condition';
    addDBtn.addEventListener('click', function () { addConditionDef(stKey); renderConditionPanel(); });
    box.appendChild(addDBtn);

    var jsonKey = 'cond:' + stKey;
    var jsonBox = document.createElement('details'); jsonBox.className = 'json-io';
    if (jsonBoxOpen[jsonKey]) jsonBox.open = true;
    jsonBox.addEventListener('toggle', function () { jsonBoxOpen[jsonKey] = jsonBox.open; });
    var jsonLabel = document.createElement('summary');
    jsonLabel.textContent = 'Import/Export JSON (array condition)';
    var jsonTa = document.createElement('textarea');
    jsonTa.placeholder = '[{"name":"","bit":"","groups":[[{"bit":"LB206","neg":false}]]}]';
    var jsonMsg = document.createElement('div'); jsonMsg.className = 'json-msg';
    var jsonRow = buildJsonIORow(jsonTa, jsonMsg,
      function () { return conditionDefsToJSON(stKey); },
      function (text) {
        var err = importConditionJSON(stKey, text);
        if (err) return err;
        renderConditionPanel(); renderMotionPanel(); regenerate();
        return null;
      },
      'condition-' + stKey + '.json');
    jsonBox.appendChild(jsonLabel); jsonBox.appendChild(jsonTa); jsonBox.appendChild(jsonRow); jsonBox.appendChild(jsonMsg);
    box.appendChild(jsonBox);

    conditionPanelEl.appendChild(box);
  });

  conditionPanelEl.style.display = 'block';
}

function renderStationNamesPanel() {
  stationNamesPanelEl.innerHTML = '';
  if (!lastSplitMsg) { stationNamesPanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  if (!stations.length) { stationNamesPanelEl.style.display = 'none'; return; }
  stations.forEach(function (stKey) {
    var lbl = document.createElement('label'); lbl.className = 'stname-lbl';
    var b = document.createElement('b'); b.textContent = stKey;
    var input = document.createElement('input'); input.className = 'stname-input';
    input.placeholder = 'nama (opsional, mis. Conveyor Feed)';
    input.value = stationNames[stKey] || '';
    input.addEventListener('change', function () {
      stationNames[stKey] = input.value.trim();
      renderMotionPanel(); renderConditionPanel(); regenerate();
    });
    lbl.appendChild(b); lbl.appendChild(input);
    stationNamesPanelEl.appendChild(lbl);
  });
  stationNamesPanelEl.style.display = 'flex';
}

function renderConfirmModePanel() {
  confirmModePanelEl.innerHTML = '';
  if (!lastSplitMsg) { confirmModePanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  var any = false;
  stations.forEach(function (stKey) {
    var devs = (groups[stKey] || []).filter(function (d) { return d.io === 'OUT' && (d.jenis === 'CR' || d.jenis === 'SOL' || d.jenis === 'SRV_CMD'); });
    devs.forEach(function (d) {
      any = true;
      var ov = actuatorOverrides[d.name] || { mode: 'auto' };
      var row = document.createElement('div'); row.className = 'stname-lbl cm-row';
      var head = document.createElement('div');
      var b = document.createElement('b'); b.textContent = stKey + ' / ' + d.name;
      head.appendChild(b);
      row.appendChild(head);
      var sel = document.createElement('select');
      ['auto', 'openloop', 'manual'].forEach(function (m) {
        var opt = document.createElement('option'); opt.value = m;
        opt.textContent = m === 'auto' ? 'Auto (default)' : (m === 'openloop' ? 'Open-loop (no sensor)' : 'Manual (pick bit)');
        if (ov.mode === m) opt.selected = true;
        sel.appendChild(opt);
      });
      var manualBox = document.createElement('div'); manualBox.className = 'cm-manual';
      var lscAInput = document.createElement('input'); lscAInput.placeholder = 'bit konfirmasi'; lscAInput.value = ov.lscA || '';
      var lscBInput = document.createElement('input'); lscBInput.placeholder = 'bit B (opsional, pair)'; lscBInput.value = ov.lscB || '';
      manualBox.appendChild(lscAInput); manualBox.appendChild(lscBInput);
      manualBox.style.display = ov.mode === 'manual' ? 'flex' : 'none';
      function commit() {
        var mode = sel.value;
        if (mode === 'auto') { delete actuatorOverrides[d.name]; }
        else if (mode === 'openloop') { actuatorOverrides[d.name] = { mode: 'openloop' }; }
        else { actuatorOverrides[d.name] = { mode: 'manual', lscA: lscAInput.value.trim(), lscB: lscBInput.value.trim() }; }
        regenerate();
      }
      sel.addEventListener('change', function () { manualBox.style.display = sel.value === 'manual' ? 'flex' : 'none'; commit(); });
      lscAInput.addEventListener('change', commit);
      lscBInput.addEventListener('change', commit);
      row.appendChild(sel); row.appendChild(manualBox);
      confirmModePanelEl.appendChild(row);
    });
  });
  confirmModePanelEl.style.display = any ? 'flex' : 'none';
}

// ===== Project JSON: SEMUA state (IO list + motionSequences + conditionDefs + nama station + timer
// default) jadi satu blob - format field motionSequences/conditionDefs SAMA PERSIS bentuk yang
// dipakai per-station box, cuma dibungkus per stKey biar satu file nyimpen semuanya sekaligus. =====
function exportProjectJSON() {
  var motionSequences = {};
  Object.keys(motionState).forEach(function (st) {
    var arr = JSON.parse(variantsToJSON(st));
    if (arr.some(function (v) { return v.nodes.length; })) motionSequences[st] = arr;
  });
  var conditionDefs = {};
  Object.keys(conditionState).forEach(function (st) {
    var arr = JSON.parse(conditionDefsToJSON(st));
    if (arr.some(function (d) { return d.groups.length; })) conditionDefs[st] = arr;
  });
  return JSON.stringify({
    io: document.getElementById('ioText').value,
    stationNames: stationNames,
    timerDefaults: { phpx: timerPhpxEl ? timerPhpxEl.value : '', motion: timerMotionEl ? timerMotionEl.value : '' },
    actuatorOverrides: actuatorOverrides,
    motionSequences: motionSequences,
    conditionDefs: conditionDefs
  }, null, 2);
}

function importProjectJSON(jsonText) {
  var parsed;
  try { parsed = JSON.parse(jsonText); }
  catch (e) { return 'JSON gak valid: ' + e.message; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'JSON harus object: {"io":"","stationNames":{},"timerDefaults":{},"motionSequences":{},"conditionDefs":{}}';
  }
  if (typeof parsed.io !== 'string' || !parsed.io.trim()) return 'Field "io" (IO list, string) wajib ada dan gak boleh kosong';

  document.getElementById('ioText').value = parsed.io;
  runFullPipeline(); // parse+split+generate dulu biar station-nya kekenal sebelum import motion/condition per-station
  if (errEl.textContent) return 'Generate IO list dari project JSON gagal: ' + errEl.textContent;

  stationNames = {};
  Object.keys(parsed.stationNames || {}).forEach(function (k) { stationNames[k] = String(parsed.stationNames[k] || '').trim(); });
  if (timerPhpxEl) timerPhpxEl.value = (parsed.timerDefaults && parsed.timerDefaults.phpx) || '';
  if (timerMotionEl) timerMotionEl.value = (parsed.timerDefaults && parsed.timerDefaults.motion) || '';
  actuatorOverrides = {};
  Object.keys(parsed.actuatorOverrides || {}).forEach(function (k) { actuatorOverrides[k] = parsed.actuatorOverrides[k]; });

  var errs = [];
  Object.keys(parsed.motionSequences || {}).forEach(function (st) {
    var err = importSequenceJSON(st, JSON.stringify(parsed.motionSequences[st]));
    if (err) errs.push('motionSequences.' + st + ': ' + err);
  });
  Object.keys(parsed.conditionDefs || {}).forEach(function (st) {
    var err = importConditionJSON(st, JSON.stringify(parsed.conditionDefs[st]));
    if (err) errs.push('conditionDefs.' + st + ': ' + err);
  });

  renderMotionPanel(); renderConditionPanel(); renderStationNamesPanel(); renderConfirmModePanel();
  regenerate();
  return errs.length ? errs.join('\\n') : null;
}

function runFullPipeline() {
  errEl.textContent = ''; resEl.innerHTML = ''; statsEl.textContent = ''; warnEl.textContent = ''; warnBoxEl.style.display = 'none';
  flowStore = {};
  lastSplitMsg = null;
  motionState = {};
  conditionState = {};
  motionCounters = {};
  svgRefs = {};
  dragState = null;
  selected = null;
  renderMotionPanel();
  renderConditionPanel();
  renderStationNamesPanel();
  renderConfirmModePanel();

  try {
    var msg = { payload: document.getElementById('ioText').value };
    msg = runNode(PARSE_JS, msg, flowStore);
    msg = runNode(GENNAME_JS, msg, flowStore);
    var v = runNode(VALIDATE_JS, msg, flowStore);
    if (v[1]) { errEl.textContent = v[1].payload; return; }
    msg = runNode(SPLIT_JS, v[0], flowStore);
    lastSplitMsg = msg;
  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
    return;
  }

  renderMotionPanel();
  renderConditionPanel();
  renderStationNamesPanel();
  renderConfirmModePanel();
  regenerate();
}

errEl = document.getElementById('err');
resEl = document.getElementById('results');
statsEl = document.getElementById('stats');
warnEl = document.getElementById('warn');
warnBoxEl = document.getElementById('warnBox');
motionPanelEl = document.getElementById('motionPanel');
conditionPanelEl = document.getElementById('conditionPanel');
stationNamesPanelEl = document.getElementById('stationNamesPanel');
confirmModePanelEl = document.getElementById('confirmModePanel');
timerPhpxEl = document.getElementById('timerPhpx');
timerMotionEl = document.getElementById('timerMotion');
timerPhpxEl.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
timerMotionEl.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
document.getElementById('genBtn').addEventListener('click', runFullPipeline);
(function () {
  var ta = document.getElementById('projectJsonTa');
  var msg = document.getElementById('projectJsonMsg');
  var row = buildJsonIORow(ta, msg, exportProjectJSON, function (text) {
    return importProjectJSON(text);
  }, 'project-susmax.json');
  document.getElementById('projectJsonRow').appendChild(row);
})();
document.addEventListener('mousemove', onDocMouseMove);
document.addEventListener('mouseup', onDocMouseUp);
document.addEventListener('keydown', onDocKeyDown);
</script>
</body>
</html>
'''

out = (HTML
       .replace('__PARSE_JS__', json.dumps(PARSE))
       .replace('__GENNAME_JS__', json.dumps(GENNAME))
       .replace('__VALIDATE_JS__', json.dumps(VALIDATE))
       .replace('__SPLIT_JS__', json.dumps(SPLIT))
       .replace('__GEN_ALL_JS__', json.dumps(GEN_ALL)))

outpath = os.path.join(_D, 'index.html')
open(outpath, 'w', encoding='utf-8').write(out)
print("WROTE", outpath, len(out), "bytes")
