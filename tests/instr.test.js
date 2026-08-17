// Tiap kotak instruksi diadu ke daftar instruksi resmi di docs/SYSMAC_INSTRUCTIONS.md.
//
// XSD tidak bisa menangkap kesalahan kelas ini: `<FbdObject xsi:type="Block" typeName="Inc"
// instanceName="x">` itu XML yang SAH. Yang salah cuma isinya - Inc itu FUN, dan FUN tidak
// punya instance. Studio menjawabnya dengan `(DefinitionError)Inc` tanpa menyebut sebabnya,
// dan itu memakan satu sesi penuh untuk ditemukan. Tiga aturan yang dijaga di sini:
//
//   1. typeName-nya ada di manual. Salah ketik = nama yang tidak ada di library.
//   2. FB WAJIB punya instanceName, FUN WAJIB tidak punya.
//   3. Instruksi tanpa ENO tidak boleh dimintai pin ENO - keluarga pembanding dan Get**Clk
//      cuma punya pin hasil tanpa nama.
//
// Sumbernya dokumen, bukan daftar tempelan di tes ini: kalau manualnya ditarik ulang dan
// sebuah instruksi berubah kelas, tes ini ikut berubah sendiri.
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

// ---------------------------------------------------------------- daftar instruksi
// Baris tabelnya: | `Instruksi` | `Simbol` | Nama | FUN/FB | ENO | Pin | Halaman |
// Simbol didaftarkan juga karena rung memakai `<` dan `>=`, bukan `LT` dan `GE` - itu yang
// dipakai project mesin nyata, dan Studio memang menerima keduanya.
const DOC = fs.readFileSync(root + '/docs/SYSMAC_INSTRUCTIONS.md', 'utf8');
const kelas = new Map();          // nama harfiah -> { kind:'FUN'|'FB', eno:true|false|null }
const keluarga = [];              // { re, v } untuk nama ber-`**`
[...DOC.matchAll(/^\| `([^`]+)` \| (?:`([^`]+)`)? \| [^|]* \| (FUN|FB|—) \| ([^|]*)\|/gm)]
  .forEach(([, nama, simbol, kind, eno]) => {
    if (kind === '—') return;
    const e = /\bya\b/.test(eno) ? true : (/\btidak\b/.test(eno) ? false : null);
    const v = { kind, eno: e };
    // `**` itu tanda keluarga: manual menulis Get**Clk sekali untuk Get1sClk, Get100msClk,
    // dan seterusnya. Diperlakukan harfiah, tiap anggotanya jadi "nama yang tidak ada".
    if (nama.includes('**')) {
      keluarga.push({ re: new RegExp('^' + nama.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                                                .replace(/\\\*\\\*(\\\*)?/g, '\\w+') + '$'), v });
    } else {
      kelas.set(nama, v);
    }
    if (simbol && !simbol.includes('*')) kelas.set(simbol, v);
  });
// Nama harfiah menang atas keluarga: CTU punya barisnya sendiri di samping CTU_**.
const lihat = (n) => kelas.get(n) || (keluarga.find(k => k.re.test(n)) || {}).v;
chk('daftar instruksi terbaca', kelas.size > 200, kelas.size + ' entri + ' + keluarga.length + ' keluarga');
chk('anggota keluarga Get**Clk dikenali', !!lihat('Get1sClk') && !!lihat('Get100msClk'));
chk('nama asal masih ditolak', !lihat('GetTidakAdaClk2'), 'wildcard tidak boleh jadi lolos-semua');
chk('Inc terdaftar FUN', kelas.get('Inc') && kelas.get('Inc').kind === 'FUN');
chk('TON terdaftar FB', kelas.get('TON') && kelas.get('TON').kind === 'FB');
chk('simbol < terdaftar (bukan cuma LT)', !!kelas.get('<'));

// ---------------------------------------------------------------- sapu semua kotak
const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const varian = [
  ['default', null],
  ['instruksi lanjutan', { advancedInstructions: true }],
  ['lanjutan + peta HMI', { advancedInstructions: true, hmiMap: { mode: 'generate' } }],
];
let totalKotak = 0;
const takKenal = [], salahKelas = [], enoHantu = [];
varian.forEach(([label, seed]) => {
  gen(seed).files.filter(f => /\.xml$/.test(f.name) && f.name !== 'AllPrograms.xml').forEach(f => {
    // Blok tidak pernah bersarang, jadi sampai `</FbdObject>` pertama itu badan kotaknya.
    for (const [blok, tn, inst] of f.xml.matchAll(
        /<FbdObject xsi:type="Block" typeName="([^"]+)"(?: instanceName="([^"]+)")?>([\s\S]*?)<\/FbdObject>/g)) {
      const nm = unesc(tn);
      totalKotak++;
      const d = lihat(nm);
      const di = f.name + ' [' + label + ']: ' + nm;
      if (!d) { takKenal.push(di); continue; }
      if (d.kind === 'FB' && !inst) salahKelas.push(di + ' FB tanpa instanceName');
      if (d.kind === 'FUN' && inst) salahKelas.push(di + ' FUN dikasih instanceName="' + inst + '"');
      if (d.eno === false && /<OutputVariable parameterName="ENO"/.test(blok)) enoHantu.push(di);
    }
  });
});
chk('ada kotak instruksi yang diperiksa', totalKotak > 0, totalKotak + ' kotak');
chk('semua typeName ada di manual', takKenal.length === 0, [...new Set(takKenal)].slice(0, 6).join(' | '));
chk('FB punya instance, FUN tidak', salahKelas.length === 0, [...new Set(salahKelas)].slice(0, 6).join(' | '));
chk('tidak ada yang minta ENO padahal tidak punya', enoHantu.length === 0, [...new Set(enoHantu)].slice(0, 6).join(' | '));

// ---------------------------------------------------------------- harness harus bisa gagal
// Tiga aturan di atas cuma berguna kalau penyapunya benar-benar melihat kotaknya. Regex yang
// tidak pernah cocok memberi nol pelanggaran juga.
const contoh = '<FbdObject xsi:type="Block" typeName="Inc" instanceName="salah"><InputVariables />'
             + '<OutputVariables><OutputVariable parameterName="ENO" /></OutputVariables></FbdObject>';
const m = /<FbdObject xsi:type="Block" typeName="([^"]+)"(?: instanceName="([^"]+)")?>([\s\S]*?)<\/FbdObject>/.exec(contoh);
chk('harness melihat instanceName pada kotak', !!m && m[2] === 'salah');
const cmp = '<FbdObject xsi:type="Block" typeName="&lt;"><InputVariables /></FbdObject>';
const m2 = /typeName="([^"]+)"/.exec(cmp);
chk('harness membaca typeName ter-escape', unesc(m2[1]) === '<' && !!lihat(unesc(m2[1])));

console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
