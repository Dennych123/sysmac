// Rung "Master on and off confirmation" di MAIN -> Fault.
// Bentuk yang benar (mengikuti program asli Ndeso): SATU rung, DUA coil.
//
//      MSTR_RDY   PB_MSTR_ON              /LB009        (LB008)
// rail-+--| |--------| |------+-----------|/|------------( )
//      |                      |
//      +--| |----------------+-----------|/|------------( )
//         LB008                           /MSTR_RDY      (LB009)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..').replace(/\\/g, '/');
const core = require(root + '/scripts/core.js');
const IO = fs.readFileSync(root + '/scripts/test.js', 'utf8')
  .match(/const IO=`([\s\S]*?)`;/)[1].replace(/\\t/g, '\t');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const r = core.generate({ io: IO });
const main = r.files.find(f => /Prg001_MAIN/.test(f.name)).xml;

const i = main.indexOf('Master on and off confirmation');
chk('rung "Master on and off confirmation" ada', i >= 0);
const s = main.lastIndexOf('<Rung', i), e = main.indexOf('</Rung>', i);
const rung = main.slice(s, e);

// --- parse objek rung jadi bentuk yang gampang dicek ---
const objs = rung.split('<LdObject').slice(1).map(o => ({
  type: (o.match(/xsi:type="(\w+)"/) || [])[1],
  op:   (o.match(/operand="([^"]+)"/) || [])[1] || '',
  neg:  /negated="true"/.test(o),
  ins:  (o.match(/refConnectionPointOutId="(\d+)"/g) || []).map(x => x.match(/\d+/)[0]),
  out:  (o.match(/connectionPointOutId="(\d+)"/) || [])[1],
}));
const by = (t, op) => objs.filter(o => o.type === t && (op === undefined || o.op === op));
const coils = by('Coil');

console.log('--- isi rung ---');
objs.forEach(o => console.log('   ' + String(o.type).padEnd(16) + String(o.op).padEnd(14) +
  (o.neg ? '/NEG ' : '     ') + 'in[' + o.ins.join(',') + '] out[' + (o.out || '-') + ']'));
console.log('');

chk('dua coil dalam SATU rung', coils.length === 2, coils.map(c => c.op).join(', '));
chk('coil-nya LB008 dan LB009',
    coils.map(c => c.op).sort().join(',') === 'LB008,LB009', coils.map(c => c.op).join(','));

const rail = by('LeftPowerRail')[0];
const mstr = by('Contact', 'MSTR_RDY').filter(o => !o.neg)[0];
const pb   = by('Contact', 'PB_MSTR_ON')[0];
const seal = by('Contact', 'LB008')[0];
const nLb9 = by('Contact', 'LB009').filter(o => o.neg)[0];
const nMst = by('Contact', 'MSTR_RDY').filter(o => o.neg)[0];

chk('urutan MSTR_RDY lalu PB_MSTR_ON (bukan sebaliknya)',
    !!mstr && !!pb && mstr.ins.indexOf(rail.out) >= 0 && pb.ins.indexOf(mstr.out) >= 0,
    'MSTR_RDY in[' + (mstr ? mstr.ins : '?') + '] rail=' + rail.out);

// Inti perbaikannya: seal LB008 mem-bypass MSTR_RDY DAN PB_MSTR_ON, jadi titiknya di RAIL.
chk('seal LB008 bercabang dari RAIL (bypass MSTR_RDY + PB_MSTR_ON)',
    !!seal && seal.ins.indexOf(rail.out) >= 0, 'LB008 in[' + (seal ? seal.ins : '?') + '] rail=' + rail.out);
chk('seal TIDAK nyambung sesudah MSTR_RDY',
    !!seal && seal.ins.indexOf(mstr.out) < 0);

// Kedua jalur (trigger & seal) harus masuk ke KEDUA kontak keluaran
chk('/LB009 menerima jalur trigger DAN seal',
    !!nLb9 && nLb9.ins.indexOf(pb.out) >= 0 && nLb9.ins.indexOf(seal.out) >= 0,
    '/LB009 in[' + (nLb9 ? nLb9.ins : '?') + ']  pb=' + pb.out + ' seal=' + seal.out);
chk('/MSTR_RDY menerima jalur trigger DAN seal',
    !!nMst && nMst.ins.indexOf(pb.out) >= 0 && nMst.ins.indexOf(seal.out) >= 0,
    '/MSTR_RDY in[' + (nMst ? nMst.ins : '?') + ']');

const c008 = coils.filter(c => c.op === 'LB008')[0];
const c009 = coils.filter(c => c.op === 'LB009')[0];
chk('LB008 digerakkan lewat /LB009', !!c008 && !!nLb9 && c008.ins.indexOf(nLb9.out) >= 0);
chk('LB009 digerakkan lewat /MSTR_RDY', !!c009 && !!nMst && c009.ins.indexOf(nMst.out) >= 0);

// Regresi: LB009 tidak boleh lagi punya rung sendiri yang isinya cuma /MSTR_RDY
const sisa = main.slice(e);
chk('tidak ada lagi rung terpisah yang nge-drive LB009',
    !/xsi:type="Coil"[^>]*operand="LB009"/.test(sisa) &&
    !/xsi:type="Coil"[^>]*operand="LB009"/.test(main.slice(0, s)),
    'LB009 cuma di-drive dari rung gabungan');

console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
process.exit(fail ? 1 : 0);
