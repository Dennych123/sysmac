// Rung "Master on and off confirmation" di MAIN -> Fault.
// Bentuk yang benar (mengikuti program asli Ndeso): SATU rung, DUA coil.
//
//      MSTR_RDY  /PB_MSTR_ON             /LB009        (LB008)
// rail-+--| |--------|/|------+-----------|/|------------( )
//      |                      |
//      +--| |----------------+-----------|/|------------( )
//         LB008                           /MSTR_RDY      (LB009)
//
// PB_MSTR_ON kontak NC - tombolnya diwiring normally-closed.
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
chk('MSTR_RDY kontak NO', !!mstr && !mstr.neg);
chk('PB_MSTR_ON kontak NC (tombol diwiring normally-closed)', !!pb && pb.neg,
    pb ? ('negated=' + pb.neg) : 'tidak ketemu');

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

// ---------------------------------------------------------------- angin punya DUA alarm
// AL[3] tekanan jatuh, AL[5] pressure switch rusak. Yang kedua menangkap apa yang tidak bisa
// ditangkap yang pertama: switch yang mati nyangkut di "angin ada" tidak pernah memicu AL[3],
// jadi alarmnya diam selamanya dan mesin jalan tanpa penjaga tekanan.
const airFall = /operand="AL\[3\]"/.test(main);
const airPs   = /operand="AL\[5\]"/.test(main);
chk('alarm tekanan angin jatuh tetap ada (AL[3])', airFall);
chk('alarm pressure switch angin ada (AL[5])', airPs);
const psI = main.indexOf('Air source pressure switch fault');
chk('rung PS fault ada', psI >= 0);
if (psI >= 0) {
  const ps = main.slice(main.lastIndexOf('<Rung', psI), main.indexOf('</Rung>', psI));
  const c = (main.slice(main.lastIndexOf('<Rung', psI), main.indexOf('</Rung>', psI))
    .match(/<LdObject xsi:type="Contact"[^>]*>/g) || [])
    .map(o => ((/operand="([^"]+)"/.exec(o) || [])[1] || '') + (/negated="true"/.test(o) ? '/' : ''));
  // Dua cabang simetris: master hidup tapi tidak ada angin, DAN master mati tapi angin masih ada.
  chk('dua cabang, masing-masing satu kontak dibalik',
      c.length === 4 && c.filter(x => /\/$/.test(x)).length === 2, c.join(' '));
  chk('cabangnya membandingkan MSTR_RDY dengan AIR_SC_CONF',
      c.filter(x => x.indexOf('MSTR_RDY') === 0).length === 2
      && c.filter(x => x.indexOf('AIR_SC_CONF') === 0).length === 2, c.join(' '));
  // Lewat timer, bukan langsung: selisih sesaat itu normal (tangki mengisi), yang tidak normal
  // itu selisih yang bertahan. Langsung ke coil, alarmnya nyala tiap master di-ON.
  chk('lewat TON, bukan langsung ke coil',
      /typeName="TON" instanceName="LT012"/.test(ps) && /identifier="T#3S"/.test(ps),
      (/identifier="(T#[^"]+)"/.exec(ps) || [])[1] || 'tidak ada preset');
  chk('ikut grup emergency stop, jadi mesin berhenti',
      new RegExp('operand="AL\\[5\\]"[\\s\\S]*?operand="LB010"').test(main)
      || /negated="true" operand="AL\[5\]"/.test(main), 'AL[5] -> LB010');
}
// Kedua sinyalnya WAJIB ada. Kalau salah satu tidak ada, req() memberi GSB000 dan cabang kedua
// berubah jadi "NOT MSTR_RDY" telanjang - alarm tiap kali master mati. Lebih baik tidak dibuat.
const IO_NO_AIR = IO.split('\n').filter(l => !/AIR SOURCE/.test(l)).join('\n');
const rNoAir = core.generate({ io: IO_NO_AIR });
const mNoAir = rNoAir.files.find(f => /Prg001_MAIN/.test(f.name)).xml;
chk('tanpa AIR_SC_CONF, rung PS fault tidak dibuat', mNoAir.indexOf('pressure switch fault') < 0);
chk('dan tidak dibuang diam-diam - ada warningnya',
    rNoAir.warnList.some(w => w.code === 'air_ps_fault_skipped'),
    rNoAir.warnList.map(w => w.code).join(', '));

// ---------------------------------------------------------------- silence buzzer: PB_ALM_RST
// Tombolnya membungkam alarm, bukan me-reset fault, dan nama standarnya PB_ALM_RST.
// Dihitung di dalam section Fault saja - di Device_Input tombolnya muncul sekali lagi sebagai
// salinan port ke simbol, dan itu bukan latch silence.
const fi = main.indexOf('name="Fault"');
const flt = main.slice(fi, main.indexOf('<BodyContent', fi + 10));
chk('tiga latch silence buzzer pakai PB_ALM_RST',
    (flt.match(/operand="PB_ALM_RST"/g) || []).length === 3,
    (flt.match(/operand="PB_ALM_RST"/g) || []).length + ' pemakaian di Fault');
chk('PB_FLT_RST tidak dipakai lagi', !/operand="PB_FLT_RST"/.test(main));
chk('PB_ALM_RST dideklarasi di MAIN', /<Variable name="PB_ALM_RST"/.test(main));

console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
process.exit(fail ? 1 : 0);
