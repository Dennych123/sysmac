// P000_Initial, Counters, dan gerbang "instruksi lanjutan".
//
// Kenapa gerbangnya penting: kontak/coil/TON sudah terbukti ter-import Susmax Studio, MOVE /
// pembanding / Inc / Get*Clk BELUM. Satu elemen yang ditolak bisa bikin SELURUH file gagal
// di-import, jadi defaultnya harus penanda - bukan tebakan yang ikut ke program mesin.
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
const file = (p, n) => p.files.find(f => f.name === n);
const secList = (x) => (x.match(/name="([A-Za-z_]+)" evaluationOrder="\d+"/g) || [])
  .map(m => /name="([A-Za-z_]+)"/.exec(m)[1]);
const dangling = (x) => (x.match(/<Rung [\s\S]*?<\/Rung>/g) || []).filter(rg => {
  const outs = [...rg.matchAll(/connectionPointOutId="(\d+)"/g)].map(a => a[1]);
  const refs = new Set([...rg.matchAll(/refConnectionPointOutId="(\d+)"/g)].map(a => a[1]));
  return outs.some(i => !refs.has(i));
}).length;

// ---------------------------------------------------------------- default: aman
let p = gen(null);
const ini = file(p, 'P000_Initial.xml');
chk('P000_Initial digenerate', !!ini);
chk('section Design_Coil + Adjust_Coil',
    ini && secList(ini.xml).join(' ') === 'Design_Coil Adjust_Coil',
    ini ? secList(ini.xml).join(' ') : '');
// Ini yang menutup bug lama: GSB000/GSB001 dipakai puluhan rung tapi tidak pernah dibuat
chk('GSB000 digerakkan P_On, GSB001 oleh P_Off',
    /operand="P_On"[\s\S]{0,400}operand="GSB000"/.test(ini.xml)
    && /operand="P_Off"[\s\S]{0,400}operand="GSB001"/.test(ini.xml));
const tsv = file(p, 'GlobalVariables.tsv').xml;
chk('GSB000/GSB001 jadi global beneran', /^GSB000\t/m.test(tsv) && /^GSB001\t/m.test(tsv));
chk('coil cadangan sampai GSB025', /^GSB025\t/m.test(tsv));
// AllPrograms.xml sengaja ditaruh paling depan sebagai file gabungan, jadi yang diperiksa urutan
// program TERPISAHNYA: P000 harus di depan MAIN, karena dia yang mendefinisikan GSB000.
const prgOrder = p.files.map(f => f.name).filter(n => /^(P0|Prg)/.test(n));
chk('P000_Initial di depan program lain', prgOrder[0] === 'P000_Initial.xml', prgOrder.join(' '));

chk('probe ikut keluar waktu instruksi lanjutan mati', !!file(p, '_Probe_Instructions.xml'));
chk('probe TIDAK ikut ke AllPrograms.xml',
    file(p, 'AllPrograms.xml').xml.indexOf('P999_Probe') < 0);
chk('Counters masih penanda',
    /COUNTER_NOP/.test(file(p, 'Prg003_HMI.xml').xml)
    && p.warnList.some(w => w.code === 'counters_not_generated'));
chk('default: nol blok fungsi selain TON di program mesin',
    !/typeName="(MOVE|Inc|Get\w*Clk|&lt;|&gt;=|&lt;&gt;)"/.test(file(p, 'AllPrograms.xml').xml));

// ---------------------------------------------------------------- instruksi lanjutan menyala
let a = gen({ advancedInstructions: true });
const hx = file(a, 'Prg003_HMI.xml').xml;
const cnt = hx.slice(hx.indexOf('name="Counters"'), hx.indexOf('name="Setup"'));
chk('counter digenerate: 10 counter x 3 rung',
    (cnt.match(/<Rung /g) || []).length === 30, (cnt.match(/<Rung /g) || []).length + ' rung');
// Pembandingnya pakai nama SIMBOL, bukan LT/NE/GE - itu yang tersimpan di project mesin
// dan `<` `>` di atribut XML ditulis sebagai entitas. Kalau ini balik jadi nama kata,
// Studio menjawab (DefinitionError) dan rung-nya hilang tanpa penjelasan.
chk('pembanding pakai nama simbol + Inc',
    ['&lt;', 'Inc', '&lt;&gt;', '&gt;='].every(b => cnt.indexOf('typeName="' + b + '"') >= 0));
// Pembanding TIDAK punya ENO; pin hasilnya tanpa nama. Meminta ENO di sini adalah bug
// yang pernah terjadi dan bentuk gagalnya tidak kelihatan dari jumlah rung.
chk('pembanding tidak minta pin ENO',
    !/typeName="&lt;[^"]*"><InputVariables>[\s\S]{0,600}?parameterName="ENO"/.test(cnt));
chk('Inc bawa InOut di sisi masuk dan keluar',
    (cnt.match(/<InputVariable parameterName="InOut"/g) || []).length === 10
    && (cnt.match(/<OutputVariable parameterName="InOut"/g) || []).length === 10);
chk('probe gak ikut keluar lagi', !file(a, '_Probe_Instructions.xml'));
chk('clock pulse digenerate', /typeName="Get1sClk"/.test(file(a, 'P000_Initial.xml').xml));

// Pin output yang dideklarasi tapi tidak disambung = titik menggantung. Itu yang paling gampang
// bikin Studio menolak file, dan pernah kejadian waktu pin Out ikut dideklarasi tapi tak dipakai.
a.files.filter(f => f.name.endsWith('.xml')).forEach(f => {
  chk('tidak ada pin menggantung di ' + f.name, dangling(f.xml) === 0, dangling(f.xml) + ' rung');
});

console.log(fail ? ('\n' + fail + ' GAGAL') : '\ninitial: semua OK');
process.exit(fail ? 1 : 0);
