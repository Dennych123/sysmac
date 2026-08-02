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
<title>Sysmac Program Generator</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;max-width:960px;margin:20px auto;padding:0 12px;color:#222}
  h1{font-size:18px}
  h2{font-size:14px;margin:18px 0 4px}
  textarea{width:100%;box-sizing:border-box;font-family:Consolas,monospace;font-size:12px}
  #ioText{height:220px}
  button{padding:8px 16px;font-size:13px;cursor:pointer;background:#2196f3;color:#fff;border:none;border-radius:4px;margin-top:8px}
  button:hover{background:#1976d2}
  button.dl{background:#2c3e50;padding:4px 10px;margin:0}
  button.dl:hover{background:#1a242f}
  .hint{font-size:11px;color:#666;margin:4px 0}
  #err{white-space:pre-wrap;color:#c0392b;font-family:Consolas,monospace;font-size:12px;margin-top:12px}
  #stats{white-space:pre-wrap;color:#2c3e50;font-family:Consolas,monospace;font-size:11px;margin-top:12px}
  #warn{white-space:pre-wrap;color:#c0392b;font-family:Consolas,monospace;font-size:11px}
  .single{background:#e8f4fd;border:1px solid #2196f3;border-radius:4px;padding:10px;margin:14px 0}
  .single .t{font-weight:bold;margin-bottom:2px}
  .single .d{font-size:11px;color:#555;margin-bottom:8px}
  .file{margin-bottom:12px;border:1px solid #ddd;border-radius:4px;padding:8px}
  .file .row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap}
  .file b{font-family:Consolas,monospace}
  .file textarea{height:140px;margin-top:6px;font-size:10px;white-space:pre;overflow:auto}
  #motionPanel{display:none;margin:10px 0}
  .station-box{border:1px solid #ddd;border-radius:4px;padding:8px;margin-bottom:10px}
  .station-title{font-weight:bold;margin-bottom:6px}
  .avail-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
  .avail-btn{background:#eee;color:#222;padding:4px 8px;margin:0;font-size:11px;font-family:Consolas,monospace}
  .avail-btn:hover{background:#ddd}
  .seq-list{list-style:decimal;margin:0;padding-left:22px}
  .seq-list li{display:flex;align-items:center;gap:6px;margin-bottom:4px}
  .seq-name{font-family:Consolas,monospace;font-size:12px;flex:1}
  .seq-btn{padding:2px 8px;margin:0;font-size:11px;background:#888}
  .seq-btn:hover{background:#666}
  .seq-btn:disabled{background:#ccc;cursor:default}
</style>
</head>
<body>
<h1>Sysmac Program Generator</h1>
<p class="hint">Tempel IO list: Alamat / Jenis / IN-OUT / Komen (pisah TAB). Komen ada ST1/ST2/ST3 -&gt; masuk program unit. Tanpa ST -&gt; program MAIN.</p>
<textarea id="ioText" placeholder="CH000_00&#9;PB&#9;IN&#9;NOT EMERGENCY STOP"></textarea>
<div><button id="genBtn">Generate Program</button></div>
<div id="err"></div>

<h2>Motion Sequence (AutoRunning, opsional)</h2>
<p class="hint">Klik solenoid di "Available" buat nambah ke urutan gerak. Naik/turun/hapus buat susun ulang.
Station yang gak disentuh di sini tetap pakai kerangka placeholder biasa.</p>
<div id="motionPanel"></div>

<div id="results"></div>
<div id="stats"></div>
<div id="warn"></div>

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

function downloadFile(name, text) {
  var b = new Blob([text], {type:'text/plain'});
  var u = URL.createObjectURL(b);
  var a = document.createElement('a');
  a.href = u; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(u);
}

function actuatorNamesForStation(devices) {
  return (devices || [])
    .filter(function (d) { return d.io === 'OUT' && (d.jenis === 'CR' || d.jenis === 'SOL'); })
    .map(function (d) { return d.name; })
    .filter(Boolean);
}

var errEl, resEl, statsEl, warnEl, motionPanelEl;
var flowStore = {};
var lastSplitMsg = null;
var motionState = {}; // station -> [solenoid name, ...] urutan gerak

function renderResults(payload) {
  resEl.innerHTML = '';
  statsEl.textContent = payload.stats;
  warnEl.textContent = payload.warnings || '';

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
    resEl.appendChild(div);
  });
}

function regenerate() {
  if (!lastSplitMsg) return;
  flowStore.motionSequences = {};
  Object.keys(motionState).forEach(function (st) {
    if (motionState[st].length) flowStore.motionSequences[st] = motionState[st];
  });
  try {
    // Salinan wrapper baru tiap panggil - gen_all.js nge-reassign msg.payload di baris terakhirnya,
    // kalau lastSplitMsg dipakai langsung, groups di dalamnya keganti hasil generate pas dipanggil kedua kali.
    var msg = runNode(GEN_ALL_JS, { payload: lastSplitMsg.payload }, flowStore);
    renderResults(msg.payload);
  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
  }
}

function moveItem(arr, from, to) {
  var t = arr[from]; arr[from] = arr[to]; arr[to] = t;
}

function renderMotionPanel() {
  motionPanelEl.innerHTML = '';
  if (!lastSplitMsg) { motionPanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; });
  var any = false;

  stations.forEach(function (stKey) {
    var names = actuatorNamesForStation(groups[stKey]);
    if (!names.length) return;
    any = true;
    if (!motionState[stKey]) motionState[stKey] = [];

    var box = document.createElement('div'); box.className = 'station-box';
    var title = document.createElement('div'); title.className = 'station-title'; title.textContent = stKey;
    box.appendChild(title);

    var avail = document.createElement('div'); avail.className = 'avail-row';
    names.forEach(function (n) {
      var btn = document.createElement('button'); btn.className = 'avail-btn'; btn.textContent = '+ ' + n;
      btn.addEventListener('click', function () { motionState[stKey].push(n); renderMotionPanel(); regenerate(); });
      avail.appendChild(btn);
    });
    box.appendChild(avail);

    var ol = document.createElement('ol'); ol.className = 'seq-list';
    motionState[stKey].forEach(function (n, idx) {
      var li = document.createElement('li');
      var span = document.createElement('span'); span.className = 'seq-name'; span.textContent = n;
      var up = document.createElement('button'); up.className = 'seq-btn'; up.textContent = 'Up';
      up.disabled = idx === 0;
      up.addEventListener('click', function () { moveItem(motionState[stKey], idx, idx - 1); renderMotionPanel(); regenerate(); });
      var down = document.createElement('button'); down.className = 'seq-btn'; down.textContent = 'Down';
      down.disabled = idx === motionState[stKey].length - 1;
      down.addEventListener('click', function () { moveItem(motionState[stKey], idx, idx + 1); renderMotionPanel(); regenerate(); });
      var rm = document.createElement('button'); rm.className = 'seq-btn'; rm.textContent = 'Remove';
      rm.addEventListener('click', function () { motionState[stKey].splice(idx, 1); renderMotionPanel(); regenerate(); });
      li.appendChild(span); li.appendChild(up); li.appendChild(down); li.appendChild(rm);
      ol.appendChild(li);
    });
    box.appendChild(ol);
    motionPanelEl.appendChild(box);
  });

  motionPanelEl.style.display = any ? 'block' : 'none';
}

function runFullPipeline() {
  errEl.textContent = ''; resEl.innerHTML = ''; statsEl.textContent = ''; warnEl.textContent = '';
  flowStore = {};
  lastSplitMsg = null;
  motionState = {};
  renderMotionPanel();

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
  regenerate();
}

errEl = document.getElementById('err');
resEl = document.getElementById('results');
statsEl = document.getElementById('stats');
warnEl = document.getElementById('warn');
motionPanelEl = document.getElementById('motionPanel');
document.getElementById('genBtn').addEventListener('click', runFullPipeline);
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
