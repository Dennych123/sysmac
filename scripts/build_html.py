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
  .station-box{border:1px solid #ddd;border-radius:4px;padding:8px;margin-bottom:14px}
  .station-title{font-weight:bold;margin-bottom:6px}
  .graph-toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}
  .avail-btn{background:#eee;color:#222;padding:4px 8px;margin:0;font-size:11px;font-family:Consolas,monospace}
  .avail-btn:hover{background:#ddd}
  .graph-toolbar input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid #ccc;border-radius:3px}
  .graph-toolbar .add-cond{background:#8e44ad;padding:4px 10px;margin:0;font-size:11px}
  .graph-toolbar .add-cond:hover{background:#6c3483}
  svg.graph-canvas{border:1px solid #ccc;border-radius:4px;background:#fbfbfb;display:block;max-width:100%}
  .gnode-rect{fill:#2196f3;stroke:#1565c0;stroke-width:1;cursor:move}
  .gnode-rect.condition{fill:#8e44ad;stroke:#5b2c6f;stroke-dasharray:4,2}
  .gnode-text{fill:#fff;font-size:9px;font-family:Consolas,monospace}
  .gnode-del{fill:#c0392b;cursor:pointer}
  .gnode-del-text{fill:#fff;font-size:9px;text-anchor:middle;font-family:Consolas,monospace}
  .gnode-handle{fill:#f1c40f;stroke:#333;stroke-width:1;cursor:crosshair}
  .gedge-line{stroke:#666;stroke-width:2;cursor:pointer}
  .gedge-line:hover{stroke:#c0392b}
  .gtemp-line{stroke:#2196f3;stroke-width:2;stroke-dasharray:4,2}
  .gjoin-badge{cursor:pointer}
  .gjoin-badge rect{fill:#333}
  .gjoin-badge text{fill:#fff;font-size:8px;text-anchor:middle;font-family:Consolas,monospace}
</style>
</head>
<body>
<h1>Sysmac Program Generator</h1>
<p class="hint">Tempel IO list: Alamat / Jenis / IN-OUT / Komen (pisah TAB). Komen ada ST1/ST2/ST3 -&gt; masuk program unit. Tanpa ST -&gt; program MAIN.</p>
<textarea id="ioText" placeholder="CH000_00&#9;PB&#9;IN&#9;NOT EMERGENCY STOP"></textarea>
<div><button id="genBtn">Generate Program</button></div>
<div id="err"></div>

<h2>Motion Sequence (AutoRunning, opsional)</h2>
<p class="hint">Klik solenoid buat nambah node ke kanvas. Seret dari bulatan kuning di sisi kanan
node ke node LAIN yang lebih baru buat bikin urutan gerak (panah = "harus nunggu ini dulu").
Node dgn 2+ panah masuk dapat badge AND/OR - klik buat toggle. "+ Condition/bit" nambah node
rujukan bit yang sudah ada (Condition section, sensor, dll) sebagai sumber - bukan solenoid.
Seret node buat rapihin posisi (kosmetik doang). Klik "x" di pojok node buat hapus, klik garis
panah buat hapus koneksi itu. Station yang gak disentuh tetap pakai kerangka placeholder biasa.</p>
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

// ===== Motion Sequence graph state =====
// motionState[station] = [ {id, type:'motion', sol, after:[id-or-bit,...], join:'AND'|'OR', x, y}
//                        | {id, type:'condition', bit, x, y} , ... ]
// A condition node's id IS the bit name itself, so when a motion node's `after` references it,
// gen_all.js's own resolveBit() falls through to using that string as a literal external operand -
// condition nodes are never sent to gen_all.js, only referenced by id/bit-name.
var motionState = {};
var motionCounters = {};
var svgRefs = {};
var dragState = null;

var NODE_W = 110, NODE_H = 32;
var SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs) {
  var el = document.createElementNS(SVG_NS, tag);
  if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
  return el;
}

function ensureStation(st) {
  if (!motionState[st]) motionState[st] = [];
  if (!motionCounters[st]) motionCounters[st] = 1;
}

function nextPos(st) {
  var idx = motionState[st].length;
  return { x: 20 + (idx % 4) * 145, y: 20 + Math.floor(idx / 4) * 75 };
}

function addMotionNode(st, sol) {
  ensureStation(st);
  var id = 'n' + (motionCounters[st]++);
  var pos = nextPos(st);
  motionState[st].push({ id: id, type: 'motion', sol: sol, after: [], join: 'AND', x: pos.x, y: pos.y });
  return id;
}

function addConditionNode(st, bitName) {
  ensureStation(st);
  bitName = (bitName || '').trim();
  if (!bitName) return null;
  if (motionState[st].some(function (n) { return n.id === bitName; })) return null;
  var pos = nextPos(st);
  motionState[st].push({ id: bitName, type: 'condition', bit: bitName, x: pos.x, y: pos.y });
  return bitName;
}

function nodeIndex(st, id) {
  var arr = motionState[st] || [];
  for (var i = 0; i < arr.length; i++) { if (arr[i].id === id) return i; }
  return -1;
}

function findNode(st, id) {
  var i = nodeIndex(st, id);
  return i < 0 ? null : motionState[st][i];
}

function addEdge(st, fromId, toId) {
  var fi = nodeIndex(st, fromId), ti = nodeIndex(st, toId);
  if (fi < 0 || ti < 0 || fi >= ti) return false; // hanya boleh nunjuk ke node yg lebih baru (cegah cycle)
  var target = motionState[st][ti];
  if (target.type !== 'motion') return false;
  if (target.after.indexOf(fromId) >= 0) return false;
  target.after.push(fromId);
  return true;
}

function removeEdge(st, fromId, toId) {
  var target = findNode(st, toId);
  if (!target || !target.after) return;
  target.after = target.after.filter(function (a) { return a !== fromId; });
}

function removeNode(st, id) {
  motionState[st] = motionState[st].filter(function (n) { return n.id !== id; });
  motionState[st].forEach(function (n) { if (n.after) n.after = n.after.filter(function (a) { return a !== id; }); });
}

function toggleJoin(st, id) {
  var n = findNode(st, id);
  if (n) n.join = (n.join === 'OR') ? 'AND' : 'OR';
}

function moveNode(st, id, x, y) {
  var n = findNode(st, id);
  if (n) { n.x = Math.max(0, x); n.y = Math.max(0, y); }
}

function nodeLabel(n) {
  var t = n.type === 'condition' ? n.bit : n.sol;
  return t.length > 15 ? t.slice(0, 13) + '..' : t;
}

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
    var motionNodes = motionState[st].filter(function (n) { return n.type === 'motion'; });
    if (motionNodes.length) {
      flowStore.motionSequences[st] = motionNodes.map(function (n) {
        return { id: n.id, sol: n.sol, after: n.after.slice(), join: n.join };
      });
    }
  });
  try {
    // Salinan wrapper baru tiap panggil - gen_all.js nge-reassign msg.payload di baris terakhirnya,
    // kalau lastSplitMsg dipakai langsung, groups di dalamnya keganti hasil generate pas dipanggil lagi.
    var msg = runNode(GEN_ALL_JS, { payload: lastSplitMsg.payload }, flowStore);
    renderResults(msg.payload);
  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
  }
}

function renderStationGraph(stKey) {
  ensureStation(stKey);
  var nodes = motionState[stKey];
  var maxY = 40;
  nodes.forEach(function (n) { if (n.y + NODE_H > maxY) maxY = n.y + NODE_H; });

  var svg = svgEl('svg', { class: 'graph-canvas', width: 620, height: Math.max(160, maxY + 40) });
  var markerId = 'arrow-' + stKey;
  var defs = svgEl('defs');
  var marker = svgEl('marker', { id: markerId, markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', fill: '#666' }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  nodes.forEach(function (n) {
    if (n.type !== 'motion') return;
    (n.after || []).forEach(function (fromId) {
      var from = findNode(stKey, fromId);
      if (!from) return;
      var line = svgEl('line', {
        class: 'gedge-line', x1: from.x + NODE_W, y1: from.y + NODE_H / 2, x2: n.x, y2: n.y + NODE_H / 2,
        'marker-end': 'url(#' + markerId + ')'
      });
      line.addEventListener('click', function (ev) {
        ev.stopPropagation(); removeEdge(stKey, fromId, n.id); renderMotionPanel(); regenerate();
      });
      svg.appendChild(line);
    });
  });

  if (dragState && dragState.mode === 'connect' && dragState.stKey === stKey) {
    var src = findNode(stKey, dragState.fromId);
    if (src) {
      svg.appendChild(svgEl('line', {
        class: 'gtemp-line', x1: src.x + NODE_W, y1: src.y + NODE_H / 2, x2: dragState.x, y2: dragState.y
      }));
    }
  }

  nodes.forEach(function (n) {
    var g = svgEl('g', { transform: 'translate(' + n.x + ',' + n.y + ')' });

    var rect = svgEl('rect', { class: 'gnode-rect' + (n.type === 'condition' ? ' condition' : ''), width: NODE_W, height: NODE_H, rx: 6 });
    rect.addEventListener('mousedown', function (ev) {
      ev.stopPropagation();
      var bb = svg.getBoundingClientRect();
      dragState = { mode: 'move', stKey: stKey, id: n.id, offX: ev.clientX - bb.left - n.x, offY: ev.clientY - bb.top - n.y };
    });
    g.appendChild(rect);

    var text = svgEl('text', { class: 'gnode-text', x: 6, y: NODE_H / 2 + 3 });
    text.textContent = nodeLabel(n);
    g.appendChild(text);

    var delC = svgEl('circle', { class: 'gnode-del', cx: NODE_W, cy: 0, r: 7 });
    delC.addEventListener('mousedown', function (ev) { ev.stopPropagation(); });
    delC.addEventListener('click', function (ev) {
      ev.stopPropagation(); removeNode(stKey, n.id); renderMotionPanel(); regenerate();
    });
    g.appendChild(delC);
    var delT = svgEl('text', { class: 'gnode-del-text', x: NODE_W, y: 3 });
    delT.textContent = 'x';
    g.appendChild(delT);

    var handle = svgEl('circle', { class: 'gnode-handle', cx: NODE_W, cy: NODE_H / 2, r: 6 });
    handle.addEventListener('mousedown', function (ev) {
      ev.stopPropagation();
      dragState = { mode: 'connect', stKey: stKey, fromId: n.id, x: n.x + NODE_W, y: n.y + NODE_H / 2 };
    });
    g.appendChild(handle);

    if (n.type === 'motion' && (n.after || []).length >= 2) {
      var badgeG = svgEl('g', { class: 'gjoin-badge', transform: 'translate(' + (NODE_W / 2 - 16) + ',' + (NODE_H + 4) + ')' });
      badgeG.appendChild(svgEl('rect', { width: 32, height: 14, rx: 3 }));
      var badgeText = svgEl('text', { x: 16, y: 10 });
      badgeText.textContent = n.join === 'OR' ? 'OR' : 'AND';
      badgeG.appendChild(badgeText);
      badgeG.addEventListener('click', function (ev) {
        ev.stopPropagation(); toggleJoin(stKey, n.id); renderMotionPanel(); regenerate();
      });
      g.appendChild(badgeG);
    }

    svg.appendChild(g);
  });

  svgRefs[stKey] = svg;
  return svg;
}

function onDocMouseMove(ev) {
  if (!dragState) return;
  var svg = svgRefs[dragState.stKey];
  if (!svg) return;
  var bb = svg.getBoundingClientRect();
  if (dragState.mode === 'move') {
    moveNode(dragState.stKey, dragState.id, ev.clientX - bb.left - dragState.offX, ev.clientY - bb.top - dragState.offY);
    renderMotionPanel();
  } else if (dragState.mode === 'connect') {
    dragState.x = ev.clientX - bb.left; dragState.y = ev.clientY - bb.top;
    renderMotionPanel();
  }
}

function onDocMouseUp(ev) {
  if (!dragState) return;
  if (dragState.mode === 'connect') {
    var svg = svgRefs[dragState.stKey];
    if (svg) {
      var bb = svg.getBoundingClientRect();
      var mx = ev.clientX - bb.left, my = ev.clientY - bb.top;
      var target = motionState[dragState.stKey].filter(function (n) {
        return mx >= n.x && mx <= n.x + NODE_W && my >= n.y && my <= n.y + NODE_H;
      })[0];
      if (target) addEdge(dragState.stKey, dragState.fromId, target.id);
    }
  }
  var wasMoveOrConnect = !!dragState;
  dragState = null;
  if (wasMoveOrConnect) { renderMotionPanel(); regenerate(); }
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
    ensureStation(stKey);

    var box = document.createElement('div'); box.className = 'station-box';
    var title = document.createElement('div'); title.className = 'station-title'; title.textContent = stKey;
    box.appendChild(title);

    var toolbar = document.createElement('div'); toolbar.className = 'graph-toolbar';
    names.forEach(function (n) {
      var btn = document.createElement('button'); btn.className = 'avail-btn'; btn.textContent = '+ ' + n;
      btn.addEventListener('click', function () { addMotionNode(stKey, n); renderMotionPanel(); regenerate(); });
      toolbar.appendChild(btn);
    });
    var condInput = document.createElement('input'); condInput.placeholder = 'LB300 / bit lain';
    var condBtn = document.createElement('button'); condBtn.className = 'add-cond'; condBtn.textContent = '+ Condition/bit';
    condBtn.addEventListener('click', function () {
      if (addConditionNode(stKey, condInput.value)) { condInput.value = ''; renderMotionPanel(); regenerate(); }
    });
    toolbar.appendChild(condInput); toolbar.appendChild(condBtn);
    box.appendChild(toolbar);

    box.appendChild(renderStationGraph(stKey));
    motionPanelEl.appendChild(box);
  });

  motionPanelEl.style.display = any ? 'block' : 'none';
}

function runFullPipeline() {
  errEl.textContent = ''; resEl.innerHTML = ''; statsEl.textContent = ''; warnEl.textContent = '';
  flowStore = {};
  lastSplitMsg = null;
  motionState = {};
  motionCounters = {};
  svgRefs = {};
  dragState = null;
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
document.addEventListener('mousemove', onDocMouseMove);
document.addEventListener('mouseup', onDocMouseUp);
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
