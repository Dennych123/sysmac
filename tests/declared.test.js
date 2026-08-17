// Tiap operand yang dipakai sebuah program harus dideklarasi DI PROGRAM ITU.
//
// ExternalVars itu per-program, bukan warisan: simbol yang sudah ada di GlobalVariables.tsv
// dan sudah dideklarasi di P000_Initial TETAP tidak dikenal di Prg003_HMI kalau tidak
// didaftarkan lagi di sana. Kegagalannya senyap - XML-nya sah menurut XSD, importnya jalan,
// yang muncul cuma variabel merah di Studio setelah semuanya masuk. Persis yang kejadian
// dengan aP_0_1s / aP_1s di section Timers.
//
// Tes ini menyapu SEMUA program di SEMUA varian setting, bukan cuma kasus yang sudah ketahuan:
// yang dijaga aturannya, bukan satu simbolnya.
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

// Literal (UDINT#0, T#100ms, 16#FF, 0) bukan variabel. P_On dan _* punya sistem, tidak
// pernah dideklarasi. Indeks array dibuang: PD071_CUR[3] dideklarasi sebagai PD071_CUR.
const LIT = /^(T#|LT#|UDINT#|UINT#|INT#|DINT#|LINT#|SINT#|USINT#|ULINT#|WORD#|DWORD#|LWORD#|BYTE#|BOOL#|REAL#|LREAL#|TIME#|TRUE$|FALSE$|\d|16#|8#|2#)/i;
const SYS = /^(P_|_)/;
const baseName = v => v.replace(/\[[^\]]*\]/g, '');

// Balikin daftar "dipakai tapi tidak dideklarasi" per program.
function undeclared(xml) {
  const out = [];
  for (const [, name, body] of xml.matchAll(/<Program name="([^"]+)">([\s\S]*?)<\/Program>/g)) {
    const decl = new Set([...body.matchAll(/<Variable name="([^"]+)"/g)].map(m => m[1]));
    const used = new Map();
    const add = (v, how) => {
      const b = baseName(v);
      if (b && !LIT.test(v) && !SYS.test(b) && !used.has(b)) used.set(b, how);
    };
    // Tiga cara sebuah simbol muncul di rung: kontak/coil, kotak data di kaki instruksi,
    // dan instance FB. Ketiganya harus punya deklarasi.
    [...body.matchAll(/operand="([^"]+)"/g)].forEach(m => add(m[1], 'kontak/coil'));
    [...body.matchAll(/xsi:type="Data(?:Source|Sink)" identifier="([^"]+)"/g)].forEach(m => add(m[1], 'DataSource/Sink'));
    [...body.matchAll(/instanceName="([^"]+)"/g)].forEach(m => add(m[1], 'instance FB'));
    [...used].filter(([v]) => !decl.has(v)).forEach(([v, how]) => out.push(name + ': ' + v + ' (' + how + ')'));
  }
  return out;
}

// Varian yang mengubah program mana yang terbangun dan instruksi mana yang dipakai. Yang
// penting advancedInstructions: itu yang memunculkan rung Timers/Counters pemakai clock.
const varian = [
  ['default', null],
  ['instruksi lanjutan', { advancedInstructions: true }],
  ['lanjutan + peta HMI', { advancedInstructions: true, hmiMap: { mode: 'generate' } }],
  ['lanjutan + HMI mati', { advancedInstructions: true, hmiMap: { enabled: false } }],
  ['lanjutan + spare 0%', { advancedInstructions: true, hmiMap: { mode: 'generate', spare: 0 } }],
  ['lanjutan + spare 100%', { advancedInstructions: true, hmiMap: { mode: 'generate', spare: 100 } }],
];
varian.forEach(([label, seed]) => {
  const p = gen(seed);
  const miss = [];
  p.files.filter(f => /\.xml$/.test(f.name)).forEach(f => {
    undeclared(f.xml).forEach(m => miss.push(f.name + ' -> ' + m));
  });
  chk('semua operand punya deklarasi (' + label + ')', miss.length === 0, miss.slice(0, 6).join(' | '));
});

// Kasus yang bikin tes ini ada. Diperiksa langsung supaya kalau harness di atas lumpuh
// (regex meleset, files kosong) kegagalannya tetap kelihatan.
const hp = gen({ advancedInstructions: true }).files.find(f => f.name === 'Prg003_HMI.xml').xml;
const ext = /<ExternalVars>([\s\S]*?)<\/ExternalVars>/.exec(hp)[1];
chk('Prg003_HMI mendeklarasi aP_0_1s', /name="aP_0_1s"/.test(ext));
chk('Prg003_HMI mendeklarasi aP_1s', /name="aP_1s"/.test(ext));
chk('clock dipakai sebagai kontak di Timers', /operand="aP_0_1s"/.test(hp) && /operand="aP_1s"/.test(hp));

// Harness-nya sendiri harus bisa gagal. Kalau deklarasi aP_1s dihapus dari teks, undeclared()
// wajib melihatnya - kalau tidak, tes di atas cuma lulus karena regex-nya tidak pernah cocok.
const rusak = hp.replace(/<Variable name="aP_1s"[\s\S]*?<\/Variable>/, '');
chk('harness mendeteksi deklarasi yang hilang',
    undeclared(rusak).some(s => /aP_1s/.test(s)), undeclared(rusak).join(' | '));

console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
