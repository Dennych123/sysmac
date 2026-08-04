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
  .variant-head .rm-variant{background:#b91c1c;padding:3px 8px;margin:0;font-size:10px}
  .variant-head .rm-variant:hover{background:#8f1717}
  .add-variant{background:#37424f;padding:5px 10px;font-size:11px}
  .add-variant:hover{background:#232a33}
  .graph-toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}
  .avail-btn{background:#eceff3;color:var(--fg);padding:4px 8px;margin:0;font-size:11px;font-family:Consolas,monospace}
  .avail-btn:hover{background:#dde2e8}
  .graph-toolbar input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px}
  .graph-toolbar .add-cond{background:#7c3aed;padding:4px 10px;margin:0;font-size:11px}
  .graph-toolbar .add-cond:hover{background:#6527c9}
  svg.graph-canvas{border:1px solid var(--line);border-radius:6px;background:#fbfbfc;display:block;max-width:100%}
  .gnode-rect{fill:var(--accent);stroke:var(--accent-dk);stroke-width:1;cursor:move}
  .gnode-rect.condition{fill:#7c3aed;stroke:#5b21b6;stroke-dasharray:4,2}
  .gnode-rect.selected{stroke:#f1c40f;stroke-width:3}
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
  .json-io .row{display:flex;gap:6px;margin-top:4px}
  .json-io button{font-size:11px;padding:5px 10px;margin:0}
  .json-io .json-import{background:#1e8449}
  .json-io .json-import:hover{background:#166638}
  .json-io .json-export{background:#37424f}
  .json-io .json-export:hover{background:#232a33}
  .json-io .json-msg{font-size:10px;margin-top:4px;white-space:pre-wrap}
  .json-io .json-msg.ok{color:#1e8449}
  .json-io .json-msg.err{color:#b91c1c}
  details.project-json{border:1px solid var(--line);border-radius:6px;padding:8px 10px;margin:10px 0;background:var(--card)}
  details.project-json>summary{font-size:12px;font-weight:600;color:var(--fg)}
  .project-json textarea{height:160px}
</style>
</head>
<body>
<h1>Sysmac Program Generator</h1>
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

<details class="json-io project-json">
  <summary>Project JSON (Import/Export SEMUA - IO list, Motion Sequence, Condition, nama station, timer default sekaligus)</summary>
  <p class="hint">Simpan/pulihkan seluruh kerjaan sekali tempel, gak perlu per-station. Import langsung
  jalanin Generate ulang pakai IO list di dalamnya, GANTI seluruh project yang lagi ke-buka.</p>
  <textarea id="projectJsonTa" placeholder='{"io":"CH0_00\\tPB\\tIN\\t...","stationNames":{"ST1":"Conveyor Feed"},"timerDefaults":{"phpx":"T#200MS","motion":"T#5S"},"motionSequences":{"ST1":[...]},"conditionDefs":{"ST1":[...]}}'></textarea>
  <div class="row">
    <button id="projectImportBtn" class="json-import">Import Project JSON</button>
    <button id="projectExportBtn" class="json-export">Export Project JSON</button>
  </div>
  <div id="projectJsonMsg" class="json-msg"></div>
</details>

<h2>Condition (opsional)</h2>
<p class="hint">Tiap station boleh punya sejumlah bit Condition BERNAMA (gak dibatasin 3 slot lama) -
tiap bit = OR dari beberapa kombinasi AND-syarat ("+ OR group", "+ term" per group, klik badge
AND/NOT buat toggle negate) - persis pola Denso PATTERN 3 (mis. bit "P&amp;P Take Out Lowering Auto
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
ada (Condition section LB300 dkk, sensor). Klik node/panah buat SELECT (kuning), tekan Delete/
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

// Object.keys(groups) ngikutin urutan device pertama kali MUNCUL di IO list, bukan urutan angka ST -
// kalau IO list-nya nulis ST3 duluan baru ST1, panel bakal kegambar ST3 duluan. Sort numerik di sini.
function sortStations(keys) {
  return keys.slice().sort(function (a, b) {
    return (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0);
  });
}

var errEl, resEl, statsEl, warnEl, warnBoxEl, motionPanelEl, conditionPanelEl, stationNamesPanelEl, timerPhpxEl, timerMotionEl;
var flowStore = {};
var lastSplitMsg = null;
var stationNames = {}; // key station -> nama bebas (opsional), ngikut ke komen program (LB400_A/B dkk)
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

// Posisi node hasil import JSON dulu ngikutin urutan array MENTAH di JSON-nya (grid 4 kolom) - kalau
// urutan array gak ngikutin urutan dependency (`after`), gambarnya berantakan (panah nyilang-nyilang,
// gak kebaca step-nya). Sekarang posisi dihitung dari KEDALAMAN topologi (depth = berapa hop `after`
// dari root) buat Y, dan kolom paralel di depth yang sama buat X - jadi hasil import selalu kegambar
// top-to-bottom ngikutin urutan gerak beneran, forks kesebar ke samping, gak peduli urutan di JSON-nya.
function layoutVariantNodes(nodes) {
  var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
  var depthCache = {}, visiting = {};
  function depthOf(id) {
    if (depthCache[id] !== undefined) return depthCache[id];
    if (visiting[id]) return 0; // cycle guard - gak seharusnya kejadian dari JSON import, jaga-jaga
    visiting[id] = true;
    var n = byId[id], d = 0;
    if (n && n.after && n.after.length) {
      var maxD = -1;
      n.after.forEach(function (ref) { if (byId[ref]) maxD = Math.max(maxD, depthOf(ref)); });
      d = maxD + 1;
    }
    visiting[id] = false;
    depthCache[id] = d;
    return d;
  }
  var col = {};
  nodes.forEach(function (n) {
    var d = depthOf(n.id);
    var c = col[d] || 0; col[d] = c + 1;
    n.x = 20 + c * 145;
    n.y = 20 + d * 90;
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
    for (var ni = 0; ni < raw.nodes.length; ni++) {
      var n = raw.nodes[ni] || {};
      if (!n.id || !n.sol) return 'Varian ke-' + (vi + 1) + ' node ke-' + (ni + 1) + ' butuh "id" dan "sol"';
      if (n.join !== undefined && n.join !== 'AND' && n.join !== 'OR') {
        return 'Varian ke-' + (vi + 1) + ' node "' + n.id + '": "join" harus persis "AND" atau "OR" (ketemu ' + JSON.stringify(n.join) + ')';
      }
      v.nodes.push({
        id: String(n.id), type: 'motion', sol: String(n.sol),
        after: Array.isArray(n.after) ? n.after.map(String) : [],
        join: n.join === 'OR' ? 'OR' : 'AND', x: 0, y: 0
      });
    }
    // auto-bikin node "condition" buat tiap `after` yang gak match id node motion manapun di varian ini
    var motionIds = {}; v.nodes.forEach(function (n) { motionIds[n.id] = true; });
    var extraBits = [];
    v.nodes.forEach(function (n) { n.after.forEach(function (ref) { if (!motionIds[ref] && extraBits.indexOf(ref) < 0) extraBits.push(ref); }); });
    var cc = (raw.conditionComments && typeof raw.conditionComments === 'object') ? raw.conditionComments : {};
    extraBits.forEach(function (bit) {
      v.nodes.push({ id: bit, type: 'condition', bit: bit, comment: String(cc[bit] || '').trim(), x: 0, y: 0 });
    });
    layoutVariantNodes(v.nodes);
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

// ===== Condition section: bit bernama, tiap bit = OR dari beberapa AND-group (PATTERN 3 Denso) =====
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
        var motionNodes = v.nodes.filter(function (n) { return n.type === 'motion'; });
        return { condition: v.condition || '', comment: v.comment || '', conditionComments: conditionCommentsOf(v), nodes: motionNodes.map(function (n) {
          return { id: n.id, sol: n.sol, after: n.after.slice(), join: n.join };
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
      var condInput = document.createElement('input'); condInput.placeholder = '(kosong = selalu aktif, mis. LB300)'; condInput.title = 'Bit Condition section (LB300, LB301, ...) yang nge-select varian ini. Jangan diisi LB401/LB402 - itu coil latch yang dibikin otomatis.'; condInput.value = variant.condition;
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

    var jsonKey = 'motion:' + stKey;
    var jsonBox = document.createElement('details'); jsonBox.className = 'json-io';
    if (jsonBoxOpen[jsonKey]) jsonBox.open = true;
    jsonBox.addEventListener('toggle', function () { jsonBoxOpen[jsonKey] = jsonBox.open; });
    var jsonLabel = document.createElement('summary');
    jsonLabel.textContent = 'Import/Export JSON (array varian)';
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
      nameInput.addEventListener('change', function () { setConditionDefName(stKey, di, nameInput.value); regenerate(); });
      var bitLbl = document.createElement('b'); bitLbl.textContent = 'Bit:'; bitLbl.style.marginLeft = '8px';
      var bitInput = document.createElement('input'); bitInput.placeholder = '(kosong = auto LB30' + di + ')'; bitInput.value = def.bit;
      bitInput.addEventListener('change', function () { setConditionDefBit(stKey, di, bitInput.value); regenerate(); });
      var rmD = document.createElement('button'); rmD.className = 'rm-variant'; rmD.textContent = 'Remove condition';
      rmD.addEventListener('click', function () { removeConditionDef(stKey, di); renderConditionPanel(); regenerate(); });
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
    var jsonRow = document.createElement('div'); jsonRow.className = 'row';
    var jsonMsg = document.createElement('div'); jsonMsg.className = 'json-msg';
    var importBtn = document.createElement('button'); importBtn.className = 'json-import'; importBtn.textContent = 'Import JSON';
    importBtn.addEventListener('click', function () {
      var err = importConditionJSON(stKey, jsonTa.value);
      if (err) { jsonMsg.className = 'json-msg err'; jsonMsg.textContent = err; return; }
      jsonMsg.className = 'json-msg ok'; jsonMsg.textContent = 'Imported.';
      renderConditionPanel(); regenerate();
    });
    var exportBtn = document.createElement('button'); exportBtn.className = 'json-export'; exportBtn.textContent = 'Export JSON';
    exportBtn.addEventListener('click', function () { jsonTa.value = conditionDefsToJSON(stKey); jsonMsg.className = 'json-msg'; jsonMsg.textContent = ''; });
    jsonRow.appendChild(importBtn); jsonRow.appendChild(exportBtn);
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

  var errs = [];
  Object.keys(parsed.motionSequences || {}).forEach(function (st) {
    var err = importSequenceJSON(st, JSON.stringify(parsed.motionSequences[st]));
    if (err) errs.push('motionSequences.' + st + ': ' + err);
  });
  Object.keys(parsed.conditionDefs || {}).forEach(function (st) {
    var err = importConditionJSON(st, JSON.stringify(parsed.conditionDefs[st]));
    if (err) errs.push('conditionDefs.' + st + ': ' + err);
  });

  renderMotionPanel(); renderConditionPanel(); renderStationNamesPanel();
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
timerPhpxEl = document.getElementById('timerPhpx');
timerMotionEl = document.getElementById('timerMotion');
timerPhpxEl.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
timerMotionEl.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
document.getElementById('genBtn').addEventListener('click', runFullPipeline);
document.getElementById('projectExportBtn').addEventListener('click', function () {
  document.getElementById('projectJsonTa').value = exportProjectJSON();
  var m = document.getElementById('projectJsonMsg'); m.className = 'json-msg'; m.textContent = '';
});
document.getElementById('projectImportBtn').addEventListener('click', function () {
  var m = document.getElementById('projectJsonMsg');
  var err = importProjectJSON(document.getElementById('projectJsonTa').value);
  if (err) { m.className = 'json-msg err'; m.textContent = err; return; }
  m.className = 'json-msg ok'; m.textContent = 'Imported.';
});
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
