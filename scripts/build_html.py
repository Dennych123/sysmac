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
</style>
</head>
<body>
<h1>Sysmac Program Generator</h1>
<p class="hint">Tempel IO list: Alamat / Jenis / IN-OUT / Komen (pisah TAB). Komen ada ST1/ST2/ST3 -&gt; masuk program unit. Tanpa ST -&gt; program MAIN.</p>
<textarea id="ioText" placeholder="CH000_00&#9;PB&#9;IN&#9;NOT EMERGENCY STOP"></textarea>
<div><button id="genBtn">Generate Program</button></div>
<div id="err"></div>
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

document.getElementById('genBtn').addEventListener('click', function() {
  var errEl = document.getElementById('err'), resEl = document.getElementById('results'),
      statsEl = document.getElementById('stats'), warnEl = document.getElementById('warn');
  errEl.textContent = ''; resEl.innerHTML = ''; statsEl.textContent = ''; warnEl.textContent = '';

  var flowStore = {};
  var msg;
  try {
    msg = { payload: document.getElementById('ioText').value };
    msg = runNode(PARSE_JS, msg, flowStore);
    msg = runNode(GENNAME_JS, msg, flowStore);
    var v = runNode(VALIDATE_JS, msg, flowStore);
    if (v[1]) { errEl.textContent = v[1].payload; return; }
    msg = runNode(SPLIT_JS, v[0], flowStore);
    msg = runNode(GEN_ALL_JS, msg, flowStore);
  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
    return;
  }

  var payload = msg.payload;
  statsEl.textContent = payload.stats;
  if (payload.warnings) warnEl.textContent = payload.warnings;

  if (payload.files.length) {
    var single = document.createElement('div');
    single.className = 'single';
    single.innerHTML = '<div class="t">Import sekali jalan</div>' +
      '<div class="d">Semua program dan global variable dalam 1 file XML.</div>';
    var dlBtn = document.createElement('button');
    dlBtn.className = 'dl'; dlBtn.textContent = 'Download Single XML';
    dlBtn.addEventListener('click', function() { downloadFile(payload.files[0].name, payload.files[0].xml); });
    single.appendChild(dlBtn);
    resEl.appendChild(single);
  }

  payload.files.forEach(function(f) {
    var div = document.createElement('div');
    div.className = 'file';
    var row = document.createElement('div');
    row.className = 'row';
    var b = document.createElement('b'); b.textContent = f.name;
    var btn = document.createElement('button'); btn.className = 'dl'; btn.textContent = 'Download';
    btn.addEventListener('click', function() { downloadFile(f.name, f.xml); });
    row.appendChild(b); row.appendChild(btn);
    var ta = document.createElement('textarea'); ta.readOnly = true; ta.value = f.xml;
    div.appendChild(row); div.appendChild(ta);
    resEl.appendChild(div);
  });
});
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
