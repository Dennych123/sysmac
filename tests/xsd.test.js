// XML hasil generate diadu ke XSD RESMI milik Sysmac Studio, otomatis, tiap kali suite jalan.
//
// Selama ini XSD cuma dipanggil manual lewat scripts/validate_xml.ps1, dan yang manual
// gampang dilupakan justru waktu paling dibutuhkan - sehabis mengubah bentuk rung. Kalau
// bentuknya salah, Studio cuma bilang "(Import failed)": tanpa nama elemen, tanpa nomor
// baris. Di sini kesalahan yang sama keluar sebagai baris:kolom.
//
// Suite ini SKIP (lulus) kalau Sysmac Studio atau pwsh tidak ada di mesin ini - XSD-nya milik
// Studio, tidak boleh disalin ke repo, jadi tidak semua mesin bisa menjalankannya. Yang
// disengaja: SKIP tidak boleh menyamar jadi lulus, makanya alasannya selalu dicetak.
//
// XSD memeriksa BENTUK saja. Nama instruksi yang tidak ada di library tetap lolos di sini dan
// baru ditolak Studio sebagai (DefinitionError) - itu urusan docs/SYSMAC_INSTRUCTIONS.md.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
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
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '\n' + x : '')); };
const skip = (why) => { console.log('  SKIP  validasi XSD dilewati: ' + why); process.exit(0); };

const SCHEMA = 'C:\\Program Files\\OMRON\\Sysmac Studio\\Sample\\IEC 61131-10 XML\\Controller';
if (!fs.existsSync(path.join(SCHEMA, 'IEC61131_10_Ed1_0_Spc1_0.xsd'))) skip('XSD Sysmac tidak ada di ' + SCHEMA);
if (spawnSync('pwsh', ['-NoProfile', '-Command', 'exit 0'], { encoding: 'utf8' }).status !== 0) skip('pwsh tidak bisa dijalankan');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sysgen-xsd-'));
// Varian yang mengubah BENTUK XML-nya, bukan cuma isinya. advancedInstructions yang
// memunculkan Block/DataSource/DataSink - bagian yang paling sering ditolak XSD.
const varian = [
  ['default', null],
  ['instruksi lanjutan', { advancedInstructions: true }],
  ['lanjutan + peta HMI', { advancedInstructions: true, hmiMap: { mode: 'generate' } }],
];
const files = [];
varian.forEach(([label, seed], vi) => {
  const dir = path.join(tmp, 'v' + vi);
  fs.mkdirSync(dir);
  gen(seed).files.filter(f => /\.xml$/.test(f.name)).forEach(f => {
    const p = path.join(dir, f.name);
    fs.writeFileSync(p, f.xml);
    files.push(p);
  });
  console.log('  ..    ' + label + ': ' + fs.readdirSync(dir).length + ' berkas');
});

// Satu pemanggilan buat semua berkas: mengompilasi XSD-nya yang mahal, bukan memvalidasinya.
const r = spawnSync('pwsh', ['-NoProfile', '-File', path.join(root, 'scripts', 'validate_xml.ps1'), ...files],
                    { encoding: 'utf8' });
const out = ((r.stdout || '') + (r.stderr || '')).trim();
if (r.status === 2) skip('scripts/validate_xml.ps1 tidak menemukan XSD-nya');
chk('semua XML lolos XSD resmi (' + files.length + ' berkas)', r.status === 0,
    r.status === 0 ? '' : out.split('\n').slice(0, 20).map(l => '        ' + l).join('\n'));

// Kontrol negatif. Validator yang selalu bilang OK - XSD gagal dimuat, jalur salah, exit code
// ketelan - kelihatannya sama persis dengan validator yang bekerja. Satu berkas yang SEHARUSNYA
// ditolak memisahkan keduanya: elemen asing disisipkan ke dalam Rung, sebuah bentuk yang
// dipastikan XSD-nya tolak.
const rusak = path.join(tmp, 'rusak.xml');
fs.writeFileSync(rusak, fs.readFileSync(files[0], 'utf8').replace('<Rung', '<TidakAdaElemenIni /><Rung'));
const rb = spawnSync('pwsh', ['-NoProfile', '-File', path.join(root, 'scripts', 'validate_xml.ps1'), rusak],
                     { encoding: 'utf8' });
chk('validator menolak XML yang memang salah', rb.status === 1,
    rb.status === 1 ? '' : '        exit=' + rb.status + '  ' + ((rb.stdout || '') + (rb.stderr || '')).trim());

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
