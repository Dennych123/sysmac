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
  body{font-family:Segoe UI,Arial,sans-serif;max-width:980px;margin:20px auto;padding:0 12px;color:#222}
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
  .variant-box{border:1px solid #eee;border-radius:4px;padding:6px;margin-bottom:10px;background:#fdfdfd}
  .variant-head{display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap}
  .variant-head b{font-size:11px;color:#555}
  .variant-head input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid #ccc;border-radius:3px;width:140px}
  .variant-head .rm-variant{background:#c0392b;padding:3px 8px;margin:0;font-size:10px}
  .variant-head .rm-variant:hover{background:#922b21}
  .add-variant{background:#2c3e50;padding:5px 10px;font-size:11px}
  .add-variant:hover{background:#1a242f}
  .graph-toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}
  .avail-btn{background:#eee;color:#222;padding:4px 8px;margin:0;font-size:11px;font-family:Consolas,monospace}
  .avail-btn:hover{background:#ddd}
  .graph-toolbar input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid #ccc;border-radius:3px}
  .graph-toolbar .add-cond{background:#8e44ad;padding:4px 10px;margin:0;font-size:11px}
  .graph-toolbar .add-cond:hover{background:#6c3483}
  svg.graph-canvas{border:1px solid #ccc;border-radius:4px;background:#fbfbfb;display:block;max-width:100%}
  .gnode-rect{fill:#2196f3;stroke:#1565c0;stroke-width:1;cursor:move}
  .gnode-rect.condition{fill:#8e44ad;stroke:#5b2c6f;stroke-dasharray:4,2}
  .gnode-rect.selected{stroke:#f1c40f;stroke-width:3}
  .gnode-text{fill:#fff;font-size:9px;font-family:Consolas,monospace}
  .gnode-del{fill:#c0392b;cursor:pointer}
  .gnode-del-text{fill:#fff;font-size:9px;text-anchor:middle;font-family:Consolas,monospace}
  .gnode-handle{fill:#f1c40f;stroke:#333;stroke-width:1;cursor:crosshair}
  .gedge-line{stroke:#666;stroke-width:2;cursor:pointer}
  .gedge-line:hover{stroke:#c0392b}
  .gedge-line.selected{stroke:#f1c40f;stroke-width:3}
  .gtemp-line{stroke:#2196f3;stroke-width:2;stroke-dasharray:4,2}
  .gjoin-badge{cursor:pointer}
  .gjoin-badge rect{fill:#333}
  .gjoin-badge text{fill:#fff;font-size:8px;text-anchor:middle;font-family:Consolas,monospace}
  .json-io{border-top:1px dashed #ccc;margin-top:8px;padding-top:8px}
  .json-io textarea{height:90px;font-size:10px}
  .json-io .row{display:flex;gap:6px;margin-top:4px}
  .json-io button{font-size:11px;padding:5px 10px;margin:0}
  .json-io .json-import{background:#27ae60}
  .json-io .json-import:hover{background:#1e8449}
  .json-io .json-export{background:#2c3e50}
  .json-io .json-export:hover{background:#1a242f}
  .json-io .json-msg{font-size:10px;margin-top:4px;white-space:pre-wrap}
  .json-io .json-msg.ok{color:#1e8449}
  .json-io .json-msg.err{color:#c0392b}
</style>
</head>
<body>
<h1>Sysmac Program Generator</h1>
<p class="hint">Tempel IO list: Alamat / Jenis / IN-OUT / Komen (pisah TAB). Komen ada ST1/ST2/ST3 -&gt; masuk program unit. Tanpa ST -&gt; program MAIN.</p>
<textarea id="ioText" placeholder="CH000_00&#9;PB&#9;IN&#9;NOT EMERGENCY STOP"></textarea>
<div><button id="genBtn">Generate Program</button></div>
<div id="err"></div>

<h2>Motion Sequence (AutoRunning, opsional)</h2>
<p class="hint">Tiap station boleh punya beberapa VARIAN sequence ("+ Variant"), masing-masing punya
Condition bit sendiri (kosongin = selalu aktif) - kayak pemilihan TIPE di FSM: cuma varian yang
kondisinya true yang jalan. Di dalam satu varian: klik solenoid buat drop node, seret dari bulatan
kuning ke node LAIN (boleh ke arah manapun, asal gak muter balik) buat bikin dependency. Node dgn
2+ dependency dapat badge AND/OR - klik toggle. "+ Condition/bit" bikin node rujukan bit yang sudah
ada (Condition section LB300 dkk, sensor). Klik node/panah buat SELECT (kuning), tekan Delete/
Backspace buat hapus yang keselect. Seret node cuma buat rapihin posisi. Station yang gak disentuh
tetap pakai kerangka placeholder biasa. Tiap station juga punya kotak <b>Import/Export JSON</b> di
bawah - bisa tempel JSON hasil AI atau bikinan sendiri (format: array varian
<code>[{"condition":"","nodes":[{"id":"n1","sol":"SOL_...","after":[],"join":"AND"}]}]</code>),
gak wajib drag-drop manual.</p>
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
// motionState[station] = [ variant, ... ]
// variant = { condition: '' | 'LB300', nodes: [ node, ... ] }
// node (motion)    = {id, type:'motion', sol, after:[id-or-bit,...], join:'AND'|'OR', x, y}
// node (condition) = {id, type:'condition', bit, x, y}   -- id IS the bit name itself, so when a
//   motion node's `after` references it, gen_all.js's resolveBit() falls through to using that
//   string as a literal external operand. Condition nodes are stripped before sending to gen_all.js.
var motionState = {};
var motionCounters = {}; // key "station#variantIdx" -> next motion node number
var svgRefs = {};        // key "station#variantIdx" -> current svg element
var dragState = null;
var selected = null;     // {stKey, vIdx, kind:'node'|'edge', id, fromId, toId}

var NODE_W = 110, NODE_H = 32;
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

function nextPos(st, vIdx) {
  var idx = motionState[st][vIdx].nodes.length;
  return { x: 20 + (idx % 4) * 145, y: 20 + Math.floor(idx / 4) * 75 };
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
function hasPath(st, vIdx, fromId, targetId, visited) {
  if (fromId === targetId) return true;
  visited = visited || {};
  if (visited[fromId]) return false;
  visited[fromId] = true;
  var n = findNode(st, vIdx, fromId);
  if (!n || !n.after) return false;
  for (var i = 0; i < n.after.length; i++) {
    if (hasPath(st, vIdx, n.after[i], targetId, visited)) return true;
  }
  return false;
}

function addEdge(st, vIdx, fromId, toId) {
  if (fromId === toId) return false;
  var fi = nodeIndex(st, vIdx, fromId), ti = nodeIndex(st, vIdx, toId);
  if (fi < 0 || ti < 0) return false;
  var target = motionState[st][vIdx].nodes[ti];
  if (target.type !== 'motion') return false;
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
  variant.nodes.forEach(function (n) { if (n.after) n.after = n.after.filter(function (a) { return a !== id; }); });
  if (selected && selected.stKey === st && selected.vIdx === vIdx && selected.id === id) selected = null;
}

function toggleJoin(st, vIdx, id) {
  var n = findNode(st, vIdx, id);
  if (n) n.join = (n.join === 'OR') ? 'AND' : 'OR';
}

function moveNode(st, vIdx, id, x, y) {
  var n = findNode(st, vIdx, id);
  if (n) { n.x = Math.max(0, x); n.y = Math.max(0, y); }
}

function nodeLabel(n) {
  var t = n.type === 'condition' ? n.bit : n.sol;
  t = t.length > 15 ? t.slice(0, 13) + '..' : t;
  if (n.type === 'condition' && n.comment) t += ' *';
  return t;
}

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

function variantsToJSON(stKey) {
  var variants = (motionState[stKey] || []).map(function (v) {
    var motionNodes = v.nodes.filter(function (n) { return n.type === 'motion'; });
    return {
      condition: v.condition || '',
      comment: v.comment || '',
      conditionComments: conditionCommentsOf(v),
      nodes: motionNodes.map(function (n) { return { id: n.id, sol: n.sol, after: n.after.slice(), join: n.join }; })
    };
  });
  return JSON.stringify(variants, null, 2);
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
    var idx = 0;
    for (var ni = 0; ni < raw.nodes.length; ni++) {
      var n = raw.nodes[ni] || {};
      if (!n.id || !n.sol) return 'Varian ke-' + (vi + 1) + ' node ke-' + (ni + 1) + ' butuh "id" dan "sol"';
      var pos = { x: 20 + (idx % 4) * 145, y: 20 + Math.floor(idx / 4) * 75 }; idx++;
      v.nodes.push({
        id: String(n.id), type: 'motion', sol: String(n.sol),
        after: Array.isArray(n.after) ? n.after.map(String) : [],
        join: n.join === 'OR' ? 'OR' : 'AND', x: pos.x, y: pos.y
      });
    }
    // auto-bikin node "condition" buat tiap `after` yang gak match id node motion manapun di varian ini
    var motionIds = {}; v.nodes.forEach(function (n) { motionIds[n.id] = true; });
    var extraBits = [];
    v.nodes.forEach(function (n) { n.after.forEach(function (ref) { if (!motionIds[ref] && extraBits.indexOf(ref) < 0) extraBits.push(ref); }); });
    var cc = (raw.conditionComments && typeof raw.conditionComments === 'object') ? raw.conditionComments : {};
    extraBits.forEach(function (bit) {
      var pos = { x: 20 + (idx % 4) * 145, y: 20 + Math.floor(idx / 4) * 75 }; idx++;
      v.nodes.push({ id: bit, type: 'condition', bit: bit, comment: String(cc[bit] || '').trim(), x: pos.x, y: pos.y });
    });
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
    var variants = motionState[st]
      .map(function (v) {
        var motionNodes = v.nodes.filter(function (n) { return n.type === 'motion'; });
        return { condition: v.condition || '', comment: v.comment || '', conditionComments: conditionCommentsOf(v), nodes: motionNodes.map(function (n) {
          return { id: n.id, sol: n.sol, after: n.after.slice(), join: n.join };
        }) };
      })
      .filter(function (v) { return v.nodes.length; });
    if (variants.length) flowStore.motionSequences[st] = variants;
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

function renderVariantGraph(stKey, vIdx) {
  var variant = motionState[stKey][vIdx];
  var nodes = variant.nodes;
  var key = vKey(stKey, vIdx);
  var maxY = 40;
  nodes.forEach(function (n) { if (n.y + NODE_H > maxY) maxY = n.y + NODE_H; });

  var svg = svgEl('svg', { class: 'graph-canvas', width: 620, height: Math.max(160, maxY + 40) });
  var markerId = 'arrow-' + stKey + '-' + vIdx;
  var defs = svgEl('defs');
  var marker = svgEl('marker', { id: markerId, markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', fill: '#666' }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  nodes.forEach(function (n) {
    if (n.type !== 'motion') return;
    (n.after || []).forEach(function (fromId) {
      var from = findNode(stKey, vIdx, fromId);
      if (!from) return;
      var isSel = selected && selected.kind === 'edge' && selected.stKey === stKey && selected.vIdx === vIdx &&
        selected.fromId === fromId && selected.toId === n.id;
      var line = svgEl('line', {
        class: 'gedge-line' + (isSel ? ' selected' : ''), x1: from.x + NODE_W, y1: from.y + NODE_H / 2, x2: n.x, y2: n.y + NODE_H / 2,
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
      svg.appendChild(svgEl('line', {
        class: 'gtemp-line', x1: src.x + NODE_W, y1: src.y + NODE_H / 2, x2: dragState.x, y2: dragState.y
      }));
    }
  }

  nodes.forEach(function (n) {
    var g = svgEl('g', { transform: 'translate(' + n.x + ',' + n.y + ')' });
    var isSelNode = selected && selected.kind === 'node' && selected.stKey === stKey && selected.vIdx === vIdx && selected.id === n.id;

    if (n.type === 'condition' && n.comment) {
      var titleEl = svgEl('title'); titleEl.textContent = n.comment; g.appendChild(titleEl);
    }

    var rect = svgEl('rect', { class: 'gnode-rect' + (n.type === 'condition' ? ' condition' : '') + (isSelNode ? ' selected' : ''), width: NODE_W, height: NODE_H, rx: 6 });
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

    var delC = svgEl('circle', { class: 'gnode-del', cx: NODE_W, cy: 0, r: 7 });
    delC.addEventListener('mousedown', function (ev) { ev.stopPropagation(); });
    delC.addEventListener('click', function (ev) {
      ev.stopPropagation(); removeNode(stKey, vIdx, n.id); renderMotionPanel(); regenerate();
    });
    g.appendChild(delC);
    var delT = svgEl('text', { class: 'gnode-del-text', x: NODE_W, y: 3 });
    delT.textContent = 'x';
    g.appendChild(delT);

    var handle = svgEl('circle', { class: 'gnode-handle', cx: NODE_W, cy: NODE_H / 2, r: 6 });
    handle.addEventListener('mousedown', function (ev) {
      ev.stopPropagation();
      dragState = { mode: 'connect', stKey: stKey, vIdx: vIdx, fromId: n.id, x: n.x + NODE_W, y: n.y + NODE_H / 2 };
    });
    g.appendChild(handle);

    if (n.type === 'motion' && (n.after || []).length >= 2) {
      var badgeG = svgEl('g', { class: 'gjoin-badge', transform: 'translate(' + (NODE_W / 2 - 16) + ',' + (NODE_H + 4) + ')' });
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
        return mx >= n.x && mx <= n.x + NODE_W && my >= n.y && my <= n.y + NODE_H;
      })[0];
      if (target) addEdge(dragState.stKey, dragState.vIdx, dragState.fromId, target.id);
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

    motionState[stKey].forEach(function (variant, vIdx) {
      var vbox = document.createElement('div'); vbox.className = 'variant-box';

      var head = document.createElement('div'); head.className = 'variant-head';
      var lbl = document.createElement('b'); lbl.textContent = 'Variant ' + (vIdx + 1) + ' - Condition:';
      var condInput = document.createElement('input'); condInput.placeholder = '(kosong = selalu aktif)'; condInput.value = variant.condition;
      condInput.addEventListener('change', function () { setVariantCondition(stKey, vIdx, condInput.value); regenerate(); });
      var cmtLbl = document.createElement('b'); cmtLbl.textContent = 'Comment:'; cmtLbl.style.marginLeft = '8px';
      var cmtInput = document.createElement('input'); cmtInput.placeholder = '(nama/keterangan varian, muncul di JSON+XML)'; cmtInput.value = variant.comment || ''; cmtInput.style.width = '220px';
      cmtInput.addEventListener('change', function () { setVariantComment(stKey, vIdx, cmtInput.value); regenerate(); });
      var rmV = document.createElement('button'); rmV.className = 'rm-variant'; rmV.textContent = 'Remove variant';
      rmV.addEventListener('click', function () { removeVariant(stKey, vIdx); renderMotionPanel(); regenerate(); });
      head.appendChild(lbl); head.appendChild(condInput); head.appendChild(cmtLbl); head.appendChild(cmtInput); head.appendChild(rmV);
      vbox.appendChild(head);

      var toolbar = document.createElement('div'); toolbar.className = 'graph-toolbar';
      names.forEach(function (n) {
        var btn = document.createElement('button'); btn.className = 'avail-btn'; btn.textContent = '+ ' + n;
        btn.addEventListener('click', function () { addMotionNode(stKey, vIdx, n); renderMotionPanel(); regenerate(); });
        toolbar.appendChild(btn);
      });
      var condBitInput = document.createElement('input'); condBitInput.placeholder = 'LB300 / bit lain';
      var condCmtInput = document.createElement('input'); condCmtInput.placeholder = 'komen bit ini (opsional)'; condCmtInput.style.width = '160px';
      var condBtn = document.createElement('button'); condBtn.className = 'add-cond'; condBtn.textContent = '+ Condition/bit';
      condBtn.addEventListener('click', function () {
        if (addConditionNode(stKey, vIdx, condBitInput.value, condCmtInput.value)) {
          condBitInput.value = ''; condCmtInput.value = ''; renderMotionPanel(); regenerate();
        }
      });
      toolbar.appendChild(condBitInput); toolbar.appendChild(condCmtInput); toolbar.appendChild(condBtn);
      vbox.appendChild(toolbar);

      vbox.appendChild(renderVariantGraph(stKey, vIdx));

      if (selected && selected.kind === 'node' && selected.stKey === stKey && selected.vIdx === vIdx) {
        var selNode = findNode(stKey, vIdx, selected.id);
        if (selNode && selNode.type === 'condition') {
          var editRow = document.createElement('div'); editRow.className = 'row';
          var editLbl = document.createElement('b'); editLbl.textContent = 'Komen bit "' + selNode.bit + '":';
          var editInput = document.createElement('input'); editInput.value = selNode.comment || ''; editInput.placeholder = '(opsional)'; editInput.style.width = '260px';
          editInput.addEventListener('change', function () { setNodeComment(stKey, vIdx, selNode.id, editInput.value); regenerate(); });
          editRow.appendChild(editLbl); editRow.appendChild(editInput);
          vbox.appendChild(editRow);
        }
      }

      box.appendChild(vbox);
    });

    var addVBtn = document.createElement('button'); addVBtn.className = 'add-variant'; addVBtn.textContent = '+ Variant';
    addVBtn.addEventListener('click', function () { addVariant(stKey); renderMotionPanel(); });
    box.appendChild(addVBtn);

    var jsonBox = document.createElement('div'); jsonBox.className = 'json-io';
    var jsonLabel = document.createElement('div'); jsonLabel.className = 'hint';
    jsonLabel.textContent = 'Import/Export JSON (array varian) - ganti seluruh sequence station ini:';
    var jsonTa = document.createElement('textarea');
    jsonTa.placeholder = '[{"condition":"","comment":"","nodes":[{"id":"n1","sol":"' + (names[0] || 'SOL_...') + '","after":[],"join":"AND"}]}]';
    var jsonRow = document.createElement('div'); jsonRow.className = 'row';
    var jsonMsg = document.createElement('div'); jsonMsg.className = 'json-msg';
    var importBtn = document.createElement('button'); importBtn.className = 'json-import'; importBtn.textContent = 'Import JSON';
    importBtn.addEventListener('click', function () {
      var err = importSequenceJSON(stKey, jsonTa.value);
      if (err) { jsonMsg.className = 'json-msg err'; jsonMsg.textContent = err; return; }
      jsonMsg.className = 'json-msg ok'; jsonMsg.textContent = 'Imported.';
      renderMotionPanel(); regenerate();
    });
    var exportBtn = document.createElement('button'); exportBtn.className = 'json-export'; exportBtn.textContent = 'Export JSON';
    exportBtn.addEventListener('click', function () { jsonTa.value = variantsToJSON(stKey); jsonMsg.className = 'json-msg'; jsonMsg.textContent = ''; });
    jsonRow.appendChild(importBtn); jsonRow.appendChild(exportBtn);
    jsonBox.appendChild(jsonLabel); jsonBox.appendChild(jsonTa); jsonBox.appendChild(jsonRow); jsonBox.appendChild(jsonMsg);
    box.appendChild(jsonBox);

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
  selected = null;
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
