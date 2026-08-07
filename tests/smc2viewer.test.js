// Uji mesin parsing di smc2-viewer.html memakai file .smc2 sungguhan.
//
// Yang diuji di sini: pembaca ZIP (tanpa library, pakai DecompressionStream),
// parser ladder JSON (Studio >= 1.66), dan parser tabel variabel SLWD. Ketiganya
// tidak butuh DOM, jadi bisa dijalankan di Node apa adanya.
//
// Yang TIDAK bisa diuji di sini: parser ladder XML (Studio <= 1.56) karena
// memakai DOMParser yang cuma ada di browser. Jalur itu sudah dibuktikan lewat
// scripts/read_smc2.py yang logikanya sama dan diuji di tests/smc2.test.js.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'smc2-viewer.html');
const SAMPLE = path.join(ROOT, 'mdf ats new.smc2');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

if (!fs.existsSync(SAMPLE)) { console.log('  SKIP  file contoh .smc2 tidak ada'); process.exit(0); }
if (typeof DecompressionStream === 'undefined') { console.log('  SKIP  Node tanpa DecompressionStream'); process.exit(0); }

const src = fs.readFileSync(HTML, 'utf8');
function extract(name) {
  const sig = 'function ' + name + '(';
  let i = src.indexOf(sig);
  if (i < 0) throw new Error('gak ketemu: ' + name);
  // ikutkan kata kunci `async` kalau ada - kalau terpotong, `await` di dalamnya
  // jadi ilegal dan errornya menyesatkan ("missing ) after argument list")
  const start = src.lastIndexOf('async ', i) ;
  if (start >= 0 && src.slice(start, i).trim() === 'async') i = start;
  // Penghitung kurung harus MELEWATI string dan komentar. parseLadderJson sendiri
  // memuat karakter '{' dan '}' di dalam literal string - penghitung naif berhenti
  // di tempat yang salah dan bilang "brace gak nutup".
  let d = 0, started = false, q = null, esc = false, line = false, block = false;
  for (let j = src.indexOf('{', i); j < src.length; j++) {
    const c = src[j], n = src[j + 1];
    if (line) { if (c === '\n') line = false; continue; }
    if (block) { if (c === '*' && n === '/') { block = false; j++; } continue; }
    if (q) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === q) q = null;
      continue;
    }
    if (c === '/' && n === '/') { line = true; j++; continue; }
    if (c === '/' && n === '*') { block = true; j++; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') { d++; started = true; }
    else if (c === '}') { d--; if (started && d === 0) return src.slice(i, j + 1); }
  }
  throw new Error('brace gak nutup: ' + name);
}

const names = ['unzip', 'inflate', 'text', 'parseLadderJson', 'parseVars'];
const M = new Function(
  "const dec=new TextDecoder('utf-8');" +
  "const KIND={LD:'Contact',ST:'Coil',F:'Function',HL:'HLink',PF:'PowerFlow'};" +
  names.map(extract).join('\n') +
  '\nreturn {unzip,inflate,text,parseLadderJson,parseVars};')();

(async () => {
  const buf = fs.readFileSync(SAMPLE);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

  // --- ZIP ---
  const files = await M.unzip(ab);
  chk('ZIP kebaca tanpa library', files.size > 100, files.size + ' entri');
  chk('ada entri .oem (penanda project Sysmac)', [...files.keys()].some(n => n.endsWith('.oem')));

  // --- ladder JSON ---
  let lad = 0, rungs = 0, withVar = 0, withCmt = 0, nc = 0, coils = 0;
  let vars = [];
  for (const [n, f] of files) {
    if (n.endsWith('/')) continue;
    const b = await M.inflate(f);
    const head = M.text(b.subarray(0, 400)).replace(/^\s+/, '');
    if (head[0] === '{' && head.includes('"CLs"')) {
      lad++;
      const rs = M.parseLadderJson(M.text(b));
      rungs += rs.length;
      for (const r of rs) {
        if (r.comment) withCmt++;
        for (const e of r.elements) {
          if (e.var) withVar++;
          if (e.nc) nc++;
          if (e.kind === 'Coil') coils++;
        }
      }
    } else if (head.startsWith('[SLWD ')) {
      vars = vars.concat(M.parseVars(M.text(b)));
    }
  }

  chk('section ladder ketemu', lad > 10, lad + ' section');
  chk('rung terbaca (bukan 0)', rungs > 1000, rungs + ' rung');
  chk('operand terbaca', withVar > 1000, withVar + ' elemen beroperand');
  chk('coil terbaca', coils > 100, coils + ' coil');
  chk('kontak NC terbaca (polaritas kebaca)', nc > 0, nc + ' kontak NC');
  chk('komen rung terbaca', withCmt > 0, withCmt + ' rung berkomen');

  // --- variabel ---
  chk('tabel variabel terbaca', vars.length > 1000, vars.length + ' variabel');
  const addr = vars.filter(v => v.address);
  chk('ada variabel beralamat IO', addr.length > 50, addr.length + ' beralamat');
  chk('alamat IO berbentuk wajar', addr.length > 0 && /IOBus|unit/i.test(addr[0].address),
      addr.length ? addr[0].name + ' -> ' + addr[0].address.slice(0, 40) : '');
  chk('komen variabel ikut kebaca', vars.some(v => v.comment),
      (vars.find(v => v.comment) || {}).comment || '');

  console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('>>BAD error: ' + e.message); process.exit(1); });
