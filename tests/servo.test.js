// Tabel axis servo terpadu (P002_Servo): satu daftar buat axis I/O (kontak/coil) DAN EtherCAT
// (reserved sampai MC_* terbukti). Yang diuji: program cuma ada kalau ada axis, io-axis dapat rung
// nyata (enable/feedback/fault/output), ethercat cuma reserved + warning, dan GB002 handshake keluar.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..').replace(/\\/g, '/');
const core = require(root + '/scripts/core.js');
const STEP = { s_parse: core.STEPS.parse, s_name: core.STEPS.genname, s_val: core.STEPS.validate, s_split: core.STEPS.split, s_all: core.STEPS.gen_all };
const IO = fs.readFileSync(root + '/scripts/test.js', 'utf8').match(/const IO=`([\s\S]*?)`;/)[1].replace(/\\t/g, '\t');

function gen(seed) {
  const ctx = Object.assign({}, seed || {});
  const flow = { get: (k) => ctx[k], set: (k, v) => (ctx[k] = v) };
  const run = (id, msg) => core.runStep(STEP[id], msg, flow, { warn: () => {} });
  let m = run('s_parse', { payload: IO }); m = run('s_name', m);
  const v = run('s_val', m); if (v[1]) throw new Error(v[1].payload);
  return run('s_all', run('s_split', v[0])).payload;
}
const file = (p, n) => (p.files.find((f) => f.name === n) || {}).xml || '';
const CT = (x, op) => new RegExp('Contact"[^>]*operand="' + op + '"').test(x);
const CTNEG = (x, op) => new RegExp('Contact" negated="true" operand="' + op + '"').test(x);
const COIL = (x, op) => new RegExp('<LdObject xsi:type="Coil"[^>]*operand="' + op + '"').test(x);
const rungWith = (hay, needle) => { const i = hay.indexOf(needle); if (i < 0) return ''; const s = hay.lastIndexOf('<Rung', i), e = hay.indexOf('</Rung>', i); return s < 0 || e < 0 ? '' : hay.slice(s, e); };

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '\n         ' + x : '')); };

// --- default: TANPA servoAxes tidak ada program servo ---
const d = gen({});
chk('tanpa servoAxes: tidak ada P002_Servo', !file(d, 'P002_Servo.xml'));

// --- dengan axis io + ethercat ---
const p = gen({ servoAxes: [
  { name: 'FEED', label: 'CE FEEDER SERVO', type: 'io', station: 'ST1', inAddr: 'CH3_00', outAddr: 'CH12_00' },
  { name: 'PRESS', label: 'PRESS AXIS', type: 'ethercat', station: 'ST2', axis: 0 },
] });
const sx = file(p, 'P002_Servo.xml');
chk('P002_Servo digenerate saat ada axis', !!sx);
chk('lima section servo', ['Servo_Input', 'SV_Ready', 'Fault', 'MD_Out', 'HMI_Out']
  .every((n) => sx.indexOf('name="' + n + '"') >= 0));

// io axis SV01
chk('io: enable READY dari MSTR_RDY', CT(rungWith(sx, 'operand="SV01_READY"'), 'MSTR_RDY') && COIL(sx, 'SV01_READY'));
chk('io: feedback dari port fisik (CH3_00)', CT(rungWith(sx, 'operand="SV01_FB"'), 'CH3_00') && COIL(sx, 'SV01_FB'));
const fltR = rungWith(sx, 'operand="SV01_FLT"');
chk('io: servo fault = CMD ANDNOT FB', CT(fltR, 'SV01_CMD') && CTNEG(fltR, 'SV01_FB'));
chk('io: command -> output fisik (CH12_00) di-gate READY+CMD',
  COIL(sx, 'CH12_00') && CT(rungWith(sx, 'operand="CH12_00"'), 'SV01_READY') && CT(rungWith(sx, 'operand="CH12_00"'), 'SV01_CMD'));

// ethercat axis SV02: reserved, tidak ada output port, ada warning
chk('ethercat: bit terpadu tetap dideklarasi', /operand="SV02_READY"/.test(sx));
chk('ethercat: TIDAK menulis coil output fisik palsu', !COIL(sx, 'CH000_00'));
chk('ethercat: warning reserved keluar', (p.warnList || []).some((w) => w.code === 'servo_ethercat_placeholder'));

// GB handshake ke program lain
chk('GB002 servo-on handshake (coil)', COIL(sx, 'GB002_001'));

// program 2: servo sebelum HMI di AllPrograms
const all = file(p, 'AllPrograms.xml');
chk('servo sebelum HMI di AllPrograms', all.indexOf('name="P002_Servo"') >= 0
  && all.indexOf('name="P002_Servo"') < all.indexOf('name="P003_HMI"'));

console.log(fail ? ('\n' + fail + ' GAGAL') : '\nsemua servo lulus');
process.exit(fail ? 1 : 0);
