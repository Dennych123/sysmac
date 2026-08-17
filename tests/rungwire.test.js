// Kabel di dalam rung: tiap titik sambung harus punya penyetir DAN pemakai.
//
// Ini kelas kesalahan ketiga, di luar jangkauan dua gerbang lain. XSD melihat bentuk elemen,
// bukan angka di dalam atribut - refConnectionPointOutId="99" ke titik yang tidak ada tetap
// lolos XSD dan tetap ditolak Studio. Daftar instruksi melihat nama kotak, bukan sambungannya.
//
// Yang dijaga, dan bunyi galat Studio-nya masing-masing:
//
//   ref ke id yang tidak ada          -> "Rung conversion failed ... invalid connection"
//   titik keluar tanpa pemakai        -> rung masuk sebagai RUNG KOSONG, diam-diam
//   rung tanpa rel kanan / rel kosong -> logikanya tidak pernah dieksekusi
//   id kembar dalam satu rung         -> sambungan nyasar ke elemen yang salah
//
// Yang ketiga paling berbahaya: importnya BERHASIL, jumlah rung-nya benar, isinya hilang.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..').replace(/\\/g, '/');
const core = require(root + '/scripts/core.js');
const STEP = { s_parse: core.STEPS.parse, s_name: core.STEPS.genname, s_val: core.STEPS.validate,
               s_split: core.STEPS.split, s_all: core.STEPS.gen_all };
const IO = fs.readFileSync(root + '/scripts/test.js', 'utf8')
             .match(/const IO=`([\s\S]*?)`;/)[1].replace(/\\t/g, '\t');

function gen(seed) {
  const ctx = Object.assign({}, seed || {});
  const flow = { get: k => ctx[k], set: (k, v) => ctx[k] = v };
  const run = (id, m) => core.runStep(STEP[id], m, flow, { warn: () => {} });
  let m = run('s_parse', { payload: IO }); m = run('s_name', m);
  const v = run('s_val', m); if (v[1]) throw new Error(v[1].payload);
  return run('s_all', run('s_split', v[0])).payload;
}
let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

// Periksa satu rung, balikin daftar pelanggaran (kosong = sehat).
function periksaRung(rg) {
  const bad = [];
  const ids = [...rg.matchAll(/connectionPointOutId="(\d+)"/g)].map(m => m[1]);
  const refs = [...rg.matchAll(/refConnectionPointOutId="(\d+)"/g)].map(m => m[1]);
  const punya = new Set(ids);

  const kembar = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (kembar.length) bad.push('id kembar: ' + [...new Set(kembar)].join(','));

  const hilang = [...new Set(refs)].filter(r => !punya.has(r));
  if (hilang.length) bad.push('ref ke id yang tidak ada: ' + hilang.join(','));

  // Pin nilai balik sebuah FUN yang memang tidak dipakai (parameterName kosong) boleh
  // menganggur - Inc dan Dec punya itu. Pin-nya WAJIB tetap ditulis lengkap dengan titik
  // sambungnya: dibuang -> "The function name is not defined", titik sambungnya saja yang
  // dibuang -> "invalid connection" dan rung jadi kosong.
  const boleh = new Set([...rg.matchAll(
    /<OutputVariable parameterName=""><ConnectionPointOut connectionPointOutId="(\d+)"/g)].map(m => m[1]));
  const dipakai = new Set(refs);
  const nganggur = [...new Set(ids)].filter(i => !dipakai.has(i) && !boleh.has(i));
  if (nganggur.length) bad.push('titik keluar tanpa pemakai: ' + nganggur.join(','));

  const rel = (rg.match(/xsi:type="RightPowerRail"/g) || []).length;
  if (rel !== 1) bad.push('rel kanan ada ' + rel + ', harus 1');
  const kiri = (rg.match(/xsi:type="LeftPowerRail"/g) || []).length;
  if (kiri !== 1) bad.push('rel kiri ada ' + kiri + ', harus 1');

  const relXml = /<LdObject xsi:type="RightPowerRail">([\s\S]*?)<\/LdObject>/.exec(rg);
  if (!relXml) bad.push('rel kanan tanpa isi');
  else if (!/refConnectionPointOutId/.test(relXml[1])) bad.push('rel kanan tidak tersambung, rung kosong');

  return bad;
}

const varian = [
  ['default', null],
  ['instruksi lanjutan', { advancedInstructions: true }],
  ['lanjutan + peta HMI', { advancedInstructions: true, hmiMap: { mode: 'generate' } }],
  ['lanjutan + spare 100%', { advancedInstructions: true, hmiMap: { mode: 'generate', spare: 100 } }],
];
let totalRung = 0;
const rusak = [];
varian.forEach(([label, seed]) => {
  gen(seed).files.filter(f => /\.xml$/.test(f.name) && f.name !== 'AllPrograms.xml').forEach(f => {
    (f.xml.match(/<Rung [\s\S]*?<\/Rung>/g) || []).forEach(rg => {
      totalRung++;
      const eo = (/evaluationOrder="(\d+)"/.exec(rg) || [])[1];
      periksaRung(rg).forEach(b => rusak.push(f.name + ' [' + label + '] rung ' + eo + ': ' + b));
    });
  });
});
chk('ada rung yang diperiksa', totalRung > 500, totalRung + ' rung');
chk('semua kabel rung sehat', rusak.length === 0, rusak.slice(0, 8).join('\n        '));

// ---------------------------------------------------------------- harness harus bisa gagal
// Empat aturan di atas nol pelanggaran bisa berarti dua hal: rung-nya sehat, atau pemeriksanya
// buta. Tiap aturan diadu ke rung yang dirusak sesuai aturannya.
const sehat = '<Rung evaluationOrder="1">'
  + '<LdObject xsi:type="LeftPowerRail"><ConnectionPointOut connectionPointOutId="1" /></LdObject>'
  + '<LdObject xsi:type="Contact" operand="A"><ConnectionPointIn><Connection refConnectionPointOutId="1" /></ConnectionPointIn>'
  + '<ConnectionPointOut connectionPointOutId="2" /></LdObject>'
  + '<LdObject xsi:type="Coil" operand="B"><ConnectionPointIn><Connection refConnectionPointOutId="2" /></ConnectionPointIn>'
  + '<ConnectionPointOut connectionPointOutId="3" /></LdObject>'
  + '<LdObject xsi:type="RightPowerRail"><ConnectionPointIn><Connection refConnectionPointOutId="3" /></ConnectionPointIn></LdObject>'
  + '</Rung>';
chk('rung sehat dinyatakan sehat', periksaRung(sehat).length === 0, periksaRung(sehat).join(' | '));
const kasus = [
  ['ref ke id yang tidak ada', sehat.replace('refConnectionPointOutId="2"', 'refConnectionPointOutId="77"'), /tidak ada/],
  ['titik keluar tanpa pemakai', sehat.replace('<Connection refConnectionPointOutId="3" />', ''), /tanpa pemakai|rung kosong/],
  ['rel kanan hilang', sehat.replace(/<LdObject xsi:type="RightPowerRail">[\s\S]*?<\/LdObject>/, ''), /rel kanan/],
  ['id kembar', sehat.replace('connectionPointOutId="3"', 'connectionPointOutId="2"'), /kembar/],
];
kasus.forEach(([nama, xml, pola]) => {
  const b = periksaRung(xml);
  chk('harness menangkap: ' + nama, b.some(s => pola.test(s)), b.join(' | ') || '(tidak ada temuan)');
});

console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
