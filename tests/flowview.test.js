// Pengenalan langkah gerakan ada di DUA tempat: CLI Python dan viewer browser.
// Tes ini memastikan keduanya menghasilkan angka yang SAMA terhadap project yang
// sama. Kalau berbeda, salah satunya berbohong - dan yang paling mungkin dipercaya
// orang justru yang tampilannya bagus.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const SAMPLE = path.join(ROOT, 'sample.smc2');
const HTML = path.join(ROOT, 'smc2-viewer.html');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

function python() {
  for (const c of ['python', 'python3', 'py']) {
    if (spawnSync(c, ['--version'], { encoding: 'utf8' }).status === 0) return c;
  }
  return null;
}
const PY = python();
if (!PY) { console.log('  SKIP  python tidak ada di PATH'); process.exit(0); }
if (!fs.existsSync(SAMPLE)) { console.log('  SKIP  sample.smc2 tidak ada'); process.exit(0); }
if (typeof DecompressionStream === 'undefined') { console.log('  SKIP  Node tanpa DecompressionStream'); process.exit(0); }

const src = fs.readFileSync(HTML, 'utf8');
function extract(name) {
  const sig = 'function ' + name + '(';
  let i = src.indexOf(sig);
  if (i < 0) throw new Error('gak ketemu: ' + name);
  const st = src.lastIndexOf('async ', i);
  if (st >= 0 && src.slice(st, i).trim() === 'async') i = st;
  let d = 0, started = false, q = null, esc = false, line = false, block = false;
  for (let j = src.indexOf('{', i); j < src.length; j++) {
    const c = src[j], n = src[j + 1];
    if (line) { if (c === '\n') line = false; continue; }
    if (block) { if (c === '*' && n === '/') { block = false; j++; } continue; }
    if (q) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === q) q = null; continue; }
    if (c === '/' && n === '/') { line = true; j++; continue; }
    if (c === '/' && n === '*') { block = true; j++; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') { d++; started = true; }
    else if (c === '}') { d--; if (started && d === 0) return src.slice(i, j + 1); }
  }
  throw new Error('brace gak nutup: ' + name);
}

const names = ['unzip', 'inflate', 'text', 'parseLadderJson', 'parseVars', 'parseTree',
               'findMotionSteps', 'chainSteps'];
const M = new Function(
  "const dec=new TextDecoder('utf-8');" +
  "const KIND={LD:'Contact',ST:'Coil',F:'Function',HL:'HLink',PF:'PowerFlow'};" +
  "const MOTION_SECT=/auto.*runn|autorunn|motion/i;" +
  "const DOMParser=null;" +
  names.map(extract).join('\n') +
  '\nreturn {unzip,inflate,text,parseLadderJson,findMotionSteps,chainSteps,MOTION_SECT};')();

(async () => {
  // --- sisi viewer ---
  const buf = fs.readFileSync(SAMPLE);
  const files = await M.unzip(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  let vSteps = 0, vChain = 0;
  for (const [n, f] of files) {
    if (n.endsWith('/')) continue;
    const b = await M.inflate(f);
    const head = M.text(b.subarray(0, 400)).replace(/^\s+/, '');
    if (head[0] !== '{' || !head.includes('"CLs"')) continue;
    const sec = { name: 'Auto_Running', rungs: M.parseLadderJson(M.text(b)) };
    const { steps } = M.findMotionSteps(sec);
    if (!steps.length) continue;
    const ch = M.chainSteps(sec, steps);
    vSteps += steps.length;
    vChain += ch.filter(x => 'afterIdx' in x).length;
  }

  // --- sisi CLI Python ---
  const out = path.join(os.tmpdir(), 'fv.json');
  const r = spawnSync(PY, [path.join(ROOT, 'read_smc2.py'), SAMPLE, '--flowchart', out], { encoding: 'utf8' });
  const log = (r.stdout || '') + (r.stderr || '');
  const m = log.match(/(\d+) langkah gerakan terpetakan, (\d+) di antaranya berhasil dirantai/);
  chk('CLI melaporkan jumlahnya', !!m, (log.split('\n').find(l => /terpetakan/.test(l)) || '').trim());

  if (m) {
    const [, pSteps, pChain] = m.map(Number);
    // Viewer memindai SEMUA file ladder, CLI hanya section bernama auto/motion -
    // jadi viewer boleh menemukan lebih, tapi tidak boleh menemukan LEBIH SEDIKIT.
    chk('viewer menemukan langkah minimal sebanyak CLI', vSteps >= pSteps,
        'viewer ' + vSteps + ' vs CLI ' + pSteps);
    chk('rantai viewer minimal sebanyak CLI', vChain >= pChain,
        'viewer ' + vChain + ' vs CLI ' + pChain);
    chk('keduanya menemukan langkah (bukan nol)', vSteps > 0 && pSteps > 0,
        'viewer ' + vSteps + ', CLI ' + pSteps);
    chk('rantai tidak pernah melebihi jumlah langkah', vChain <= vSteps && pChain <= pSteps);
  }
  try { fs.unlinkSync(out); } catch (e) {}

  console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('>>BAD error: ' + e.message); process.exit(1); });
