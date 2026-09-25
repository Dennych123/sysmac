// smc2_project.js + flowdoc.js: .smc2 -> project JSON (io + flow) -> dokumen flow chart.
//
// Bagian 1 memakai project SINTETIS yang dibentuk seperti keluaran readProject(): tiap aturan
// yang dijaga punya kasusnya sendiri, dan tidak ada yang bergantung pada berkas pelanggan.
// Bagian 2 menjalankan project mesin sungguhan kalau ada di mesin ini - kalau tidak, SKIP
// dan bilang kenapa.
'use strict';
const fs = require('fs');
const path = require('path');
const P = require('../scripts/smc2_project.js');
const { render } = require('../scripts/flowdoc.js');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const C = (v, o) => Object.assign({ kind: 'Contact', var: v }, o || {});
const K = v => ({ kind: 'Coil', var: v });
const rung = (els, comment) => ({ comment: comment || '', elements: els, vlinks: [] });
const V = (name, comment, extra) => Object.assign({ name, type: 'BOOL', address: '', group: 'VAR_GLOBAL', comment }, extra || {});

// Satu station dengan: varian LB401 (syarat LB300) -> motion maju -> judgement -> motion mundur
// -> complete, dan cabang N judgement (LB411_B) langsung ke complete.
function station(name, cylCmt, judgeCmt) {
  return {
    name,
    sections: [
      { name: 'Condition', rungs: [rung([C('PH_EXIST'), K('LB300')])] },
      { name: 'LS_Combination', rungs: [rung([C('AS_FWD'), K('LSC_FWD')]), rung([C('AS_BWD'), K('LSC_BWD')])] },
      { name: 'AutoRunning', rungs: [
        rung([C('LB400_A'), K('LB400')], 'auto motion start'),
        rung([C('LB400'), C('LB300'), K('LB401')], 'Unit motion condition'),
        rung([C('LB415'), C('LB411_B'), K('LB499')], '1 cycle motion complete'),
        rung([C('LB401'), C('LB411', { nc: true }), C('CR_FWD'), C('LSC_FWD'), C('LB411'), K('LB410'), K('LB411')], '[x] Motion 1: ' + cylCmt),
        rung([C('LB411'), C('PH_EXIST'), C('LB411_A', { nc: true }), K('LB411_A'), K('LB411_B')]),
        rung([C('LB411_A'), C('LB415', { nc: true }), C('CR_BWD'), C('LSC_BWD'), C('LB415'), K('LB414'), K('LB415')], '[x] Motion 2'),
      ] },
      { name: 'Auto_Output', rungs: [rung([C('LB410'), K('CR_FWD')]), rung([C('LB414'), K('CR_BWD')])] },
    ],
    vars: [V('LB411_A', judgeCmt, { group: 'VAR', program: name }), V('LB411_B', 'Cycle stop', { group: 'VAR', program: name })],
  };
}
const st1 = station('P011_ST1_Feeder', 'ST1 PUSHER FORWARD', 'Shutter full ST1');
const st2 = station('P012_ST2_Buffer', 'ST2 PUSHER FORWARD', 'Part ready ST2');
const proj = {
  solution: 'Uji', studio: '1.66',
  programs: [
    { name: 'P010_Main', sections: [
      { name: 'Device_Input', rungs: [rung([C('CH0_05'), K('PB_MSTR_ON')]), rung([C('CH0_10'), K('AS_FWD')])] },
      { name: 'Device_Output', rungs: [rung([C('CR_FWD'), K('CH1_00')]), rung([C('MSTR_RDY'), C('X', { nc: true }), K('CH1_01')])] },
      { name: 'Auto_Main_Loop', rungs: [rung([C('SAFE_CONF'), C('MSTR_RDY'), K('LB110')]), rung([C('PB_AUTO_RUN'), C('LB120'), C('LB099'), C('LB110'), K('LB120')])] },
      { name: 'Condition', rungs: [rung([C('GB010_00'), K('LB099')])] },
    ] },
    { name: st1.name, sections: st1.sections },
    { name: st2.name, sections: st2.sections },
  ],
  variables: [
    V('CH0_05', 'MASTER ON', { address: 'BuiltInIO://cpu/#0/Input_Bit_05' }),
    V('CH0_10', 'ST1 PUSHER FORWARD END', { address: 'BuiltInIO://cpu/#0/Input_Bit_10' }),
    V('CH1_00', 'ST1 PUSHER FORWARD', { address: 'IOBus://unit#5/Output Bit 16 bits/Output Bit 00' }),
    V('CH1_01', 'VIBRATOR ON', { address: 'IOBus://unit#5/Output Bit 16 bits/Output Bit 01' }),
    V('CH1_02', '(empty)', { address: 'IOBus://unit#5/Output Bit 16 bits/Output Bit 02' }),
    V('LB300', 'Supply type 1'),
  ].concat(st1.vars, st2.vars),
};

console.log('[1] project sintetis');
const j = P.extract(proj, 'uji.smc2');
const row = ch => j.ioTable.find(r => r.ch === ch);
chk('IO: jenis ditemukan lewat genname generator (CH0_05 -> PB_MSTR_ON = PB)', row('CH0_05').jenis === 'PB' && row('CH0_05').nameMatch, JSON.stringify(row('CH0_05')));
chk('IO: kanal keluar dipetakan dari rung Device_Output', row('CH1_00').symbol === 'CR_FWD' && row('CH1_00').io === 'OUT');
chk('IO: kanal disetir LOGIKA tidak diberi simbol palsu', !row('CH1_01').symbol && /MSTR_RDY/.test(row('CH1_01').logic || ''));
chk('IO: TSV io tanpa kanal kosong/logika', j.io.split('\n').length === 3 && /^CH0_05\tPB\tIN\tMASTER ON$/m.test(j.io), JSON.stringify(j.io));
chk('stationNames dari nama program', j.stationNames.ST1 === 'Feeder' && j.stationNames.ST2 === 'Buffer');

const s1 = j.flow.stations.find(s => s.key === 'ST1');
chk('entry & complete dikenali', s1.entry === 'LB400' && s1.complete === 'LB499', s1.entry + ' ' + s1.complete);
const v = s1.variants[0];
chk('varian LB401 dari gate LB300', v && v.bit === 'LB401' && v.gate === 'LB300');
const kinds = v.nodes.map(n => n.kind).join(',');
chk('urutan langkah motion -> judge -> motion', kinds === 'motion,judge,motion', kinds);
const [m1, jd, m2] = v.nodes;
chk('motion: aktuator dari Auto_Output + kanal IO + sensor dari LS_Combination',
  m1.act === 'CR_FWD' && m1.actCh === 'CH1_00' && m1.lsc === 'LSC_FWD' && m1.sensor === 'AS_FWD' && m1.cmd === 'LB410' && m1.done === 'LB411',
  JSON.stringify({ act: m1.act, ch: m1.actCh, lsc: m1.lsc, cmd: m1.cmd, done: m1.done }));
chk('rantai lewat bit step, bukan nomor rung', jd.after[0].id === m1.id && jd.after[0].bit === 'LB411' && m2.after[0].bit === 'LB411_A');
chk('judgement: cabang N ke complete tertangkap walau rung complete ada DI ATAS', jd.toEnd.join() === 'LB411_B', jd.toEnd.join());
chk('langkah terakhir keluar ke complete', m2.toEnd.join() === 'LB415');
chk('komentar lokal dibaca per PROGRAM (LB411_A ST1 vs ST2)',
  (jd.outs[0] || {}).cmt === 'Shutter full ST1' &&
  j.flow.stations.find(s => s.key === 'ST2').variants[0].nodes[1].outs[0].cmt === 'Part ready ST2');
chk('main: bit autorun + syarat dijabarkan', j.flow.main && j.flow.main.autorun === 'LB120' &&
  j.flow.main.tree.items.some(i => i.var === 'LB099' && i.kids && i.kids[0].var === 'GB010_00'));

const ms = (j.motionSequences.ST1 || [])[0] || { nodes: [] };
chk('motionSequences: solenoid ditulis dengan nama GENERATOR (dari komen kanal), bukan nama di program',
  ms.condition === 'LB300' && ms.nodes.length === 1 && ms.nodes[0].sol === 'CR_ST1_PSH_FWD' && ms.nodes[0].sol !== 'CR_FWD',
  JSON.stringify(ms.nodes));
chk('motionSequences: judgement + motion tanpa kanal IO dicatat di generatorSkipped',
  j.generatorSkipped.some(x => x.kind === 'judge') && j.generatorSkipped.some(x => /CR_BWD/.test(x.why)));
const warns = [];
try { require('../scripts/core.js').generate(j, { onWarn: w => warns.push(w) }); } catch (e) { warns.push('THROW ' + e.message); }
chk('generator memakan JSON-nya tanpa "unknown solenoid"', !warns.some(w => /unknown solenoid|THROW/.test(w)), warns.filter(w => /solenoid|THROW/.test(w)).join(' | '));

const html = render(j, { company: 'PT. UJI' });
const pages = (html.match(/class="page"/g) || []).length;
chk('dokumen: 1 halaman main + 1 per station', pages === 3, pages + ' halaman');
chk('dokumen: tidak ada NaN/undefined di SVG', !/NaN|undefined/.test(html));
chk('dokumen: diamond + cabang N + bit biru', /L\d+(\.\d+)?,\d+(\.\d+)? Z" class="ln"/.test(html) && html.includes('LB411_B') && html.includes('class="b"'));
chk('dokumen: A3 landscape', html.includes('size:A3 landscape'));
chk('dokumen: sensor ditulis dengan alamat HARDWIRE-nya (AS_FWD -> CH0_10)', j.flow.addr.AS_FWD === 'CH0_10' && />CH0_10</.test(html));
chk('dokumen: rantai MASTER ON di halaman main', /PB_MSTR_ON/.test(html.split('class="page"')[1] || ''));

// ---------------------------------------------------------------- project mesin sungguhan
console.log('[2] project mesin');
const KANDIDAT = [
  path.join(__dirname, '..', '..', '..', 'ceinsert', 'ceinsert', 'Ce Insert Track.smc2'),
  path.join(__dirname, '..', '..', '..', 'track', 'Ce Insert Track.smc2'),
  path.join(__dirname, '..', '..', '..', 'Ce Insert Track.smc2'),
];
const smc = KANDIDAT.find(f => fs.existsSync(f));
(async () => {
  if (!smc) {
    console.log('  SKIP  Ce Insert Track.smc2 tidak ada di mesin ini - bagian project nyata tidak diuji');
  } else {
    const r = await P.fromFile(smc);
    const st3 = r.flow.stations.find(s => s.key === 'ST3');
    chk('tiga station terbaca, semuanya punya varian', r.flow.stations.length === 3 && r.flow.stations.every(s => s.variants.length));
    chk('ST3 memakai aktuator ST3 SENDIRI (variabel lokal tidak tercampur antar program)',
      st3 && st3.variants[0].nodes[0].act === 'CR_ST3_PSH_FWD', st3 && st3.variants[0].nodes[0].act);
    chk('ST3 judgement cycle stop -> complete', st3.variants[0].nodes.some(n => n.kind === 'judge' && n.toEnd.includes('LB411_B')));
    chk('IO list cukup lengkap (>= 80 kanal)', r.io.split('\n').length >= 80, r.io.split('\n').length);
    const h = render(r, {});
    chk('dokumen project nyata tanpa NaN/undefined', !/NaN|undefined/.test(h));
    // baris yang putus disambung KONEKTOR berhuruf, bukan garis balik antarbaris
    chk('baris putus memakai konektor A/B/C', (h.match(/<circle[^>]*\/><text[^>]*>[A-Z]+<\/text>/g) || []).length >= 4);
  }
  console.log(fail + ' GAGAL');
  process.exit(fail ? 1 : 0);
})();
