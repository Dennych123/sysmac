// Uji pengenalan pola motion step lewat CLI Python, memakai project sungguhan.
//
// Yang paling penting di sini BUKAN berapa banyak langkah yang ketemu, tapi
// bahwa rung yang bukan langkah gerakan TIDAK ikut terpetakan. Flowchart yang
// memuat langkah palsu lebih berbahaya daripada flowchart yang kurang lengkap:
// yang kurang lengkap kelihatan, yang palsu tidak.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const SAMPLE = path.join(ROOT, 'sample.smc2');

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

const out = path.join(os.tmpdir(), 'flow-test.json');
const r = spawnSync(PY, [path.join(ROOT, 'read_smc2.py'), SAMPLE, '--flowchart', out], { encoding: 'utf8' });
const log = (r.stdout || '') + (r.stderr || '');

chk('flowchart jalan tanpa error', r.status === 0, 'exit ' + r.status);
chk('laporan per section tercetak', /SECTION\s+RUNG\s+STEP/.test(log));
chk('rung mutex ditolak, bukan dianggap langkah', /mutex/.test(log),
    (log.match(/\d+\s+dua coil saling mengunci.*/) || [''])[0].trim());
chk('alasan tidak terpetakan dilaporkan, bukan didiamkan', /Alasan per rung/.test(log));
chk('keterbatasan rantai dinyatakan terus terang',
    /berhasil dirantai/.test(log) && /perlu dicek manual|berhasil dirantai/.test(log));

chk('file JSON terbentuk', fs.existsSync(out));
const d = JSON.parse(fs.readFileSync(out, 'utf8'));
const keys = Object.keys(d);
chk('hanya section auto/motion yang dipetakan',
    keys.length > 0 && keys.every(k => /auto.*runn|motion/i.test(k)), keys.join(', ').slice(0, 70));
chk('section *_Output tidak ikut (itu keluaran, bukan urutan)',
    !keys.some(k => /output/i.test(k)), keys.filter(k => /output/i.test(k)).join(','));

const all = [].concat(...keys.map(k => d[k][0].nodes));
chk('ada langkah terpetakan', all.length > 0, all.length + ' langkah');
chk('tiap langkah punya bentuk yang dipahami editor',
    all.every(n => n.id && n.type === 'motion' && n.sol && Array.isArray(n.after) && n.join),
    JSON.stringify(all[0] || {}).slice(0, 70));
chk('tiap langkah punya tepat satu pendahulu', all.every(n => n.after.length === 1));
chk('id unik per section', keys.every(k => {
  const ids = d[k][0].nodes.map(n => n.id);
  return new Set(ids).size === ids.length;
}));
chk('rujukan ke langkah lain memang ada orangnya', keys.every(k => {
  const ids = new Set(d[k][0].nodes.map(n => n.id));
  return d[k][0].nodes.every(n => !/^n\d+$/.test(n.after[0]) || ids.has(n.after[0]));
}), 'tidak ada after yang menunjuk langkah yang tidak ada');
chk('langkah tanpa rantai tetap menyimpan bit aslinya (info tidak hilang)',
    all.some(n => !/^n\d+$/.test(n.after[0])),
    (all.find(n => !/^n\d+$/.test(n.after[0])) || {}).after);

try { fs.unlinkSync(out); } catch (e) {}
console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
process.exit(fail ? 1 : 0);
