#!/usr/bin/env node
// .smc2 -> project JSON: IO list + flowchart, dari program yang SUDAH JALAN di mesin.
//
//   node scripts/smc2_project.js x.smc2 project.json
//   node scripts/smc2_project.js x.smc2 project.json --doc flow.html [--company "PT. X"] [--dwg NO]
//
// Kebalikan generator. Program mesin biasanya lahir dari generator lalu disunting tangan berbulan-
// bulan di Studio; IO list + motionSequences yang dulu dipakai men-generate sudah tidak mewakili
// apa yang jalan. Skrip ini membaca ulang yang jalan.
//
// Bentuk keluarannya = project JSON generator (io, stationNames, motionSequences, conditionDefs)
// DITAMBAH `ioTable` dan `flow`. Dua yang terakhir diabaikan generator; dipakai scripts/flowdoc.js.
//
// Dua lapis flowchart dari graf yang SAMA:
//   flow             SEMUA rung AutoRunning jadi langkah: motion, tunggu, delay, judgement,
//                    cabang paralel dan gabungannya. Untuk DIBACA orang (scripts/flowdoc.js), jadi
//                    rung yang tidak berpola tetap muncul - dengan syarat aslinya - bukan hilang.
//   motionSequences  proyeksi `flow` ke bentuk editor generator: cuma langkah motion, solenoid
//                    ditulis dengan nama yang AKAN diberikan generator (bukan nama di program -
//                    generator menamai ulang dari komen IO). Yang tidak terbawa -> generatorSkipped.
//
// Rantai antar langkah TIDAK ditebak dari nomor LB: langkah B sesudah langkah A kalau rung B
// memuat kontak NO dari coil yang ditulis rung A di section yang sama. Kontak ke rung yang lebih
// BAWAH (A ditulis sesudah B) itu penutup siklus sebelumnya, bukan urutan - tidak ikut dirantai.
'use strict';
const fs = require('fs');
const path = require('path');

const RD = path.join(__dirname, '..', 'reader', 'src');
const { unzip } = require(path.join(RD, 'zip.js'));
const { readProject } = require(path.join(RD, 'smc2.js'));
const { setSymbols, cmtOf } = require(path.join(RD, 'symbols.js'));
const { rungExpr } = require(path.join(RD, 'ladder.js'));
const M = require(path.join(RD, 'motion.js'));
const { runStep, STEPS } = require('./core.js');

const coilsOf = r => r.elements.filter(e => e.kind === 'Coil' && e.var);
const contactsOf = r => r.elements.filter(e => e.kind === 'Contact' && e.var);
const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const isEmpty = c => !c || /^\(?empty\)?$/i.test(c);

// ============================================================== IO list
// Variabel ber-AT ke unit IO (bukan %W/%H/%D memori). Arah dari path port-nya sendiri.
function ioVars(vars) {
  return vars.filter(v => v.address && !v.address.startsWith('%') && /^bool$/i.test(v.type)
                       && /(input|output)/i.test(v.address))
    .map(v => ({ ch: v.name, addr: v.address, io: /output/i.test(v.address) ? 'OUT' : 'IN',
                 komen: clean(v.comment) }));
}

// Nama simbol tiap kanal dibaca dari rung Device_Input/Output: `CH0_05 -> PB_MSTR_ON`,
// `EMER_INTLK -> CH1_00`. Bukan dari komen - komen kanal dan nama simbolnya sering sudah beda.
function ioSymbols(p, chs) {
  const sym = new Map(), logic = new Map();
  for (const pr of p.programs) for (const s of pr.sections) for (const r of s.rungs) {
    const co = coilsOf(r), ct = contactsOf(r);
    // Cuma rung pemetaan MURNI (1 kontak NO -> 1 coil). Kanal yang disetir logika lain
    // (`MSTR_RDY AND /SOL_VIBRATOR_ON -> CH6_07`) tidak punya simbol perangkat; mengambil
    // kontak pertamanya memberi nama yang salah dengan penampilan yang meyakinkan.
    const pure = co.length === 1 && ct.length === 1 && !ct[0].nc && !r.elements.some(e => e.func);
    if (pure && chs.has(ct[0].var) && !chs.has(co[0].var) && !sym.has(ct[0].var)) sym.set(ct[0].var, co[0].var);
    if (pure && chs.has(co[0].var) && !chs.has(ct[0].var) && !sym.has(co[0].var)) sym.set(co[0].var, ct[0].var);
    if (!pure) co.forEach(c => { if (chs.has(c.var) && !logic.has(c.var)) logic.set(c.var, rungExpr(r).expr); });
  }
  logic.forEach((v, k) => { if (sym.has(k)) logic.delete(k); });
  return { sym, logic };
}

// Kolom "jenis" tidak disimpan di .smc2. Ditebak dengan menjalankan genname.js generator SENDIRI:
// jenis yang menghasilkan nama simbol yang sama persis dengan yang ada di program, itu jawabannya.
// Jadi IO list keluaran ini, kalau di-generate ulang, memberi nama simbol yang sama.
const JENIS = ['PB', 'PL', 'PH', 'PX', 'LS', 'AS', 'CR', 'SOL', 'SS', 'BZ', 'SW', 'SM', 'SV', 'MTR'];
function genName(jenis, io, komen) {
  const out = runStep(STEPS.genname, { payload: [{ jenis, io, komen }] }, { get() {}, set() {} }, { warn() {} });
  return out.payload[0].name;
}
function guessJenis(sym, io, komen) {
  const pre = (/^([A-Z]+)_/.exec(sym) || [])[1];
  const cands = [...new Set([pre, ...JENIS].filter(Boolean))];
  for (const j of cands) if (genName(j, io, komen) === sym) return { jenis: j, exact: true };
  return { jenis: pre && pre.length <= 4 ? pre : (io === 'OUT' ? 'CR' : 'PB'), exact: false };
}

function ioTable(p) {
  const rows = ioVars(p.variables);
  const { sym, logic } = ioSymbols(p, new Set(rows.map(r => r.ch)));
  return rows.map(r => {
    const s = sym.get(r.ch) || '';
    if (logic.has(r.ch)) r.logic = logic.get(r.ch);
    const g = s ? guessJenis(s, r.io, r.komen) : { jenis: '', exact: false };
    return Object.assign(r, { symbol: s, jenis: g.jenis, nameMatch: g.exact });
  });
}

// ============================================================== station
function stationKey(progName) {
  const m = /^P0*\d+_(ST\d+)_?(.*)$/i.exec(progName);
  return m ? { key: m[1].toUpperCase(), name: m[2] } : null;
}

// Kotak fungsi di rung: timer ditulis sebagai "Delay PT" di dokumen, sisanya namanya saja.
function fbsOf(r) {
  return r.elements.filter(e => e.func).map(e => {
    const pin = n => ((e.pins && e.pins.in) || []).find(x => x.name === n);
    const pt = pin('PT');
    return { func: e.func, inst: e.var || '', pt: pt ? pt.operand : '' };
  });
}

// Satu section AutoRunning -> graf langkah per varian.
function stationFlow(prog, sect, ctx) {
  const { gates } = M.variantGates(prog);
  const R = sect.rungs.map((r, i) => ({
    i, r, coils: coilsOf(r).map(c => c.var), cts: contactsOf(r), fbs: fbsOf(r), comment: clean(r.comment),
  }));
  const writer = new Map();
  R.forEach(x => x.coils.forEach(c => { if (!writer.has(c)) writer.set(c, x.i); }));
  const pred = x => {
    const out = [];
    x.cts.forEach(c => {
      if (c.nc || x.coils.includes(c.var) || !writer.has(c.var)) return;
      const w = writer.get(c.var);
      // per BIT, bukan per rung: `LB401 OR LB405` dua-duanya dari rung varian yang sama,
      // dan tiap bit itu membuka varian sendiri.
      if (w < x.i && !out.some(o => o.bit === c.var)) out.push({ i: w, bit: c.var });
    });
    return out;
  };
  R.forEach(x => { x.pred = pred(x); });

  const varRung = R.find(x => x.coils.length && x.coils.some(c => gates.has(c)));
  if (!varRung) return null;
  const entry = (varRung.pred[0] || {}).bit || '';
  const done = R.find(x => x.coils.some(c => /99$/.test(c))) ||
               R.find(x => /complete/i.test(x.comment) && !/seal/i.test(x.comment));
  const plumbing = new Set(R.filter(x => x.i <= varRung.i).map(x => x.i));
  // Rung "1 cycle complete" ditulis DI ATAS langkah-langkahnya, jadi semua kontaknya menunjuk
  // rung yang lebih bawah dan tersaring oleh pred(). Dibaca terpisah: coil langkah yang dibaca
  // rung ini = jalan keluar ke complete (akhir normal, atau cabang cycle stop).
  const endBits = new Set(done ? done.cts.filter(c => !c.nc).map(c => c.var) : []);

  const succ = new Map(R.map(x => [x.i, []]));
  R.forEach(x => x.pred.forEach(p => succ.get(p.i).push({ i: x.i, bit: p.bit })));

  const node = x => {
    const own = new Set(x.coils);
    const predBits = new Set(x.pred.map(p => p.bit));
    const seal = x.coils.filter(c => x.cts.some(k => k.var === c && !k.nc));
    const act = x.coils.map(c => ctx.cmd.get(c)).find(Boolean);
    const lsc = x.cts.find(c => !c.nc && /^LSC_/.test(c.var));
    const outs = x.coils.filter(c => (succ.get(x.i) || []).some(s => s.bit === c) || endBits.has(c));
    const e = rungExpr(x.r);
    const n = {
      id: 'r' + (x.i + 1), rung: x.i + 1, comment: x.comment, coils: x.coils,
      after: [], expr: e.expr, approx: !!e.approx,
      conds: x.cts.filter(c => !own.has(c.var) && !predBits.has(c.var) && c.var !== (lsc && lsc.var))
        .map(c => ({ var: c.var, nc: !!c.nc, edge: c.edge || '', cmt: cmtOf(c.var) || '' })),
      timer: x.fbs.find(f => /^TON|^TOF|^TP$/i.test(f.func)) || null,
      fbs: x.fbs.filter(f => !/^TON|^TOF|^TP$/i.test(f.func)).map(f => f.func),
    };
    // dedup: kontak yang sama bisa muncul di dua cabang rung
    n.conds = n.conds.filter((c, k, a) => a.findIndex(d => d.var === c.var && d.nc === c.nc) === k);
    const cmd = x.coils.find(c => ctx.cmd.has(c));
    if (act && cmd) {
      n.kind = 'motion';
      n.cmd = cmd; n.done = seal.find(c => c !== cmd) || x.coils.find(c => c !== cmd) || '';
      n.act = act; n.actCmt = cmtOf(act) || ''; n.actCh = ctx.chOf.get(act) || '';
      if (lsc) { n.lsc = lsc.var; n.lscCmt = cmtOf(lsc.var) || ''; n.sensor = ctx.sensorOf.get(lsc.var) || ''; }
      n.label = clean(n.actCmt || n.comment.replace(/^\[[^\]]*\]\s*/, '').replace(/^Motion \d+:\s*/i, ''));
    } else if (outs.length >= 2) {
      n.kind = 'judge';
      n.label = n.comment || 'JUDGEMENT';
    } else {
      n.kind = n.timer && !n.conds.length ? 'delay' : 'wait';
      n.label = n.comment || x.coils.map(c => cmtOf(c)).filter(Boolean)[0] || x.coils.join(', ');
    }
    n.outs = x.coils.map(c => ({ bit: c, cmt: cmtOf(c) || '' }));
    return n;
  };

  const variants = varRung.coils.map(vb => {
    const gate = gates.get(vb);
    const seen = new Map();
    const q = R.filter(x => !plumbing.has(x.i) && x.pred.some(p => p.bit === vb)).map(x => x.i);
    while (q.length) {
      const i = q.shift();
      if (seen.has(i) || (done && i === done.i)) continue;
      seen.set(i, true);
      succ.get(i).forEach(s => { if (!plumbing.has(s.i)) q.push(s.i); });
    }
    const ids = [...seen.keys()].sort((a, b) => a - b);
    const nodes = ids.map(i => {
      const n = node(R[i]);
      n.after = R[i].pred.filter(p => seen.has(p.i)).map(p => ({ id: 'r' + (p.i + 1), bit: p.bit }))
        .filter((a, k, arr) => arr.findIndex(b => b.id === a.id) === k);
      if (R[i].pred.some(p => p.bit === vb)) n.after.unshift({ id: 'start', bit: vb });
      n.toEnd = R[i].coils.filter(c => endBits.has(c));
      return n;
    });
    return { bit: vb, bitCmt: cmtOf(vb) || '', gate: gate || '', name: clean(cmtOf(gate) || cmtOf(vb) || vb),
             gateExpr: ctx.condExpr(prog, gate), nodes };
  });
  return {
    section: sect.name, entry, entryCmt: cmtOf(entry) || '',
    complete: done ? done.coils[0] : '', completeCmt: done ? (cmtOf(done.coils[0]) || done.comment) : '',
    variants,
  };
}

// Rung penulis sebuah bit di section Condition, dijabarkan jadi daftar kontak + anak-anaknya
// (bit internal yang ditulis program yang sama dijabarkan lagi, sampai `depth`).
function condTree(prog, bit, depth, seen) {
  seen = seen || new Set();
  if (!bit || depth < 0 || seen.has(bit)) return null;
  seen.add(bit);
  let hit = null;
  for (const s of prog.sections) for (const r of s.rungs) {
    if (!hit && coilsOf(r).some(c => c.var === bit)) hit = r;
  }
  if (!hit) return null;
  const e = rungExpr(hit);
  const own = new Set(coilsOf(hit).map(c => c.var));
  const items = contactsOf(hit).filter(c => !own.has(c.var))
    .filter((c, k, a) => a.findIndex(d => d.var === c.var && d.nc === c.nc) === k)
    .map(c => {
      const kid = /^(GSB00\d|P_On|P_Off)$/.test(c.var) ? null : condTree(prog, c.var, depth - 1, seen);
      return Object.assign({ var: c.var, nc: !!c.nc, cmt: cmtOf(c.var) || '' }, kid ? { kids: kid.items, expr: kid.expr } : {});
    });
  return { bit, cmt: cmtOf(bit) || clean(hit.comment), expr: e.expr, approx: !!e.approx, items };
}

// Main circuit (P010): rung autorun yang meng-seal dirinya di section *Main_Loop*.
function mainFlow(prog) {
  const s = prog.sections.find(x => /main.?loop/i.test(x.name));
  if (!s) return null;
  const sealed = s.rungs.filter(r => coilsOf(r).some(c => contactsOf(r).some(k => k.var === c.var && !k.nc)));
  const ar = sealed[0];
  if (!ar) return null;
  const bit = coilsOf(ar)[0].var;
  const tree = condTree(prog, bit, 3);
  return { program: prog.name, section: s.name, autorun: bit, autorunCmt: cmtOf(bit) || '', tree,
           stop: sealed[1] ? condTree(prog, coilsOf(sealed[1])[0].var, 1) : null };
}

// ============================================================== motionSequences (generator)
// Editor generator cuma mengenal langkah MOTION (satu solenoid, satu konfirmasi). Langkah tunggu /
// judgement / servo dilewati - rantainya disambung lewat langkah itu, supaya motion sesudahnya
// tetap menunggu motion sebelumnya - dan TIAP yang dilewati dicatat di `generatorSkipped`:
// program yang di-generate ulang dari JSON ini tidak memuat langkah-langkah itu.
function toGenerator(v, genName, skipped, stKey) {
  const by = new Map(v.nodes.map(n => [n.id, n]));
  const keep = new Map();
  v.nodes.forEach(n => {
    const sol = n.kind === 'motion' ? genName(n.act) : '';
    if (sol) keep.set(n.id, sol);
    else skipped.push({ station: stKey, variant: v.bit, rung: n.rung, kind: n.kind,
                        why: n.kind === 'motion' ? n.act + ' tidak punya kanal IO (servo/internal)' : 'bukan langkah motion',
                        label: n.label });
  });
  // pendahulu motion terdekat, menembus langkah yang dilewati
  const motionPred = (n, seen) => n.after.flatMap(a => {
    if (a.id === 'start' || seen.has(a.id)) return [];
    seen.add(a.id);
    return keep.has(a.id) ? [a.id] : motionPred(by.get(a.id), seen);
  });
  const nodes = v.nodes.filter(n => keep.has(n.id)).map(n => ({
    id: n.id, type: 'motion', sol: keep.get(n.id),
    after: [...new Set(motionPred(n, new Set()))], join: 'AND',
  }));
  return { condition: v.gate || v.bit, comment: v.name, conditionComments: {}, conditionPositions: {}, nodes };
}

// ============================================================== conditionDefs (generator)
// Cuma rung syarat yang SERI murni (satu grup AND). Yang bercabang tidak diterjemahkan: salah
// susun di sini ikut ter-generate jadi rung syarat yang lain.
function conditionDefsOf(prog) {
  const out = [];
  for (const s of prog.sections) {
    if (!M.COND_SECT.test(s.name)) continue;
    for (const r of s.rungs) {
      const co = coilsOf(r);
      if (co.length !== 1 || !/^LB3\d\d$/.test(co[0].var)) continue;
      const e = rungExpr(r);
      if (e.approx || /\bOR\b|\(/.test(e.expr) || r.elements.some(x => x.func)) continue;
      out.push({ name: clean(cmtOf(co[0].var) || r.comment) || co[0].var, bit: co[0].var,
                 groups: [contactsOf(r).map(c => ({ bit: c.var, neg: !!c.nc }))] });
    }
  }
  return out;
}

// ============================================================== satukan
// Komentar dibaca dalam LINGKUP satu program: global + lokal program itu (lokal menang).
// LB411 di ST1 dan LB411 di ST3 dua variabel berbeda dengan komen berbeda.
function scope(p, progName) {
  setSymbols(p.variables.filter(v => !v.program).concat(p.variables.filter(v => v.program === progName)));
}

function extract(p, file) {
  setSymbols(p.variables);
  const table = ioTable(p);
  const chOf = new Map(table.filter(r => r.symbol).map(r => [r.symbol, r.ch]));

  const stationNames = {}, stations = [];
  let main = null;
  for (const pr of p.programs) {
    scope(p, pr.name);
    const st = stationKey(pr.name);
    if (!st && !main) main = mainFlow(pr);
    if (!st) continue;
    stationNames[st.key] = st.name;
    // cmd (bit perintah otomatis) -> keluaran, dari *Auto_Output*; LSC -> sensor dari
    // *LS_Combination*. PER PROGRAM: LB412 di tiap station itu variabel lokal yang lain.
    const cmd = new Map(), sensorOf = new Map();
    for (const s of pr.sections) for (const r of s.rungs) {
      if (/auto.?output/i.test(s.name)) coilsOf(r).forEach(c => contactsOf(r).forEach(k => { if (!k.nc && !cmd.has(k.var)) cmd.set(k.var, c.var); }));
      if (/ls.?comb/i.test(s.name)) coilsOf(r).forEach(c => {
        const k = contactsOf(r).find(x => !x.nc && chOf.has(x.var));
        if (k && !sensorOf.has(c.var)) sensorOf.set(c.var, k.var);
      });
    }
    const ctx = { cmd, chOf, sensorOf, condExpr: (prog, bit) => condTree(prog, bit, 1) };
    const sect = pr.sections.find(s => M.MOTION_SECT.test(s.name) && s.rungs.length);
    const f = sect ? stationFlow(pr, sect, ctx) : null;
    stations.push(Object.assign({ program: pr.name, key: st.key, name: st.name }, f || { variants: [] }));
  }
  setSymbols(p.variables);

  const io = table.filter(r => r.symbol && !isEmpty(r.komen))
    .map(r => [r.ch, r.jenis, r.io, r.komen].join('\t')).join('\n');

  // Nama yang AKAN diberikan generator ke tiap kanal - dihitung dengan genname.js-nya sendiri,
  // sekali untuk seluruh daftar (dia menomori nama kembar berurutan, jadi per baris bisa beda).
  const gen = runStep(STEPS.genname, runStep(STEPS.parse, { payload: io }, { get() {}, set() {} }, {}), { get() {}, set() {} }, {}).payload;
  const genOfCh = new Map(gen.map(d => [d.address, d.name]));
  const motionSequences = {}, skipped = [];
  stations.forEach(st => {
    const vs = st.variants.map(v => toGenerator(v, sym => genOfCh.get(chOf.get(sym)), skipped, st.key)).filter(x => x.nodes.length);
    if (vs.length) motionSequences[st.key] = vs;
  });
  const conditionDefs = {};
  for (const pr of p.programs) {
    const st = stationKey(pr.name);
    scope(p, pr.name);
    const defs = st ? conditionDefsOf(pr) : [];
    if (defs.length) conditionDefs[st.key] = defs;
  }

  return {
    source: { file: path.basename(file || ''), solution: p.solution || '', studio: p.studio || '' },
    io, stationNames, motionSequences, conditionDefs,
    ioTable: table,
    // simbol -> kanal IO, buat alamat hardwire di dokumen (AS/PH/SOL ditulis dengan alamatnya)
    flow: { main, stations, addr: Object.fromEntries(chOf) },
    generatorSkipped: skipped,
  };
}

async function fromFile(file) {
  return extract(await readProject(fs.readFileSync(file), unzip), file);
}

function report(j) {
  const t = j.ioTable, used = t.filter(r => r.symbol && !isEmpty(r.komen));
  const L = [];
  L.push('IO       ' + used.length + ' kanal masuk io (dari ' + t.length + ' ber-AT unit IO)');
  const miss = t.filter(r => !r.symbol && !r.logic && !isEmpty(r.komen));
  const lg = t.filter(r => r.logic);
  if (lg.length) L.push('         ' + lg.length + ' kanal disetir LOGIKA, bukan simbol perangkat (tidak masuk io): '
    + lg.map(r => r.ch + ' <- ' + r.logic).join(' | '));
  if (miss.length) L.push('         ' + miss.length + ' berkomen tapi tidak dipakai rung mana pun (dilewati): ' + miss.map(r => r.ch).join(' '));
  const guess = used.filter(r => !r.nameMatch);
  if (guess.length) L.push('         ' + guess.length + ' nama simbol beda dari komen kanal (disunting di Studio) - jenis dari awalan nama, generate ulang memberi nama lain: '
    + guess.map(r => r.ch + '=' + r.symbol).join(' '));
  for (const s of j.flow.stations) {
    const n = s.variants.reduce((a, v) => a + v.nodes.length, 0);
    const k = {};
    s.variants.forEach(v => v.nodes.forEach(x => { k[x.kind] = (k[x.kind] || 0) + 1; }));
    L.push('FLOW     ' + s.program.padEnd(28) + s.variants.length + ' varian, ' + n + ' langkah  '
      + Object.entries(k).map(([a, b]) => a + ' ' + b).join(', '));
  }
  if (j.flow.main) L.push('MAIN     ' + j.flow.main.program + ' autorun ' + j.flow.main.autorun);
  if (j.generatorSkipped.length) L.push('         ' + j.generatorSkipped.length + ' langkah TIDAK terbawa ke motionSequences generator (tunggu/judgement/servo) - lihat generatorSkipped di JSON');
  L.push('GEN      motionSequences: ' + Object.entries(j.motionSequences).map(([k, v]) => k + '=' + v.length).join(' ')
    + '   conditionDefs: ' + Object.entries(j.conditionDefs).map(([k, v]) => k + '=' + v.length).join(' '));
  return L.join('\n');
}

module.exports = { extract, fromFile, report, ioTable, stationFlow, guessJenis };

if (require.main === module) {
  const a = process.argv.slice(2);
  if (a.length < 2) {
    console.error('pakai: node scripts/smc2_project.js <x.smc2> <out.json> [--doc out.html [--company X] [--dwg X] [--subject X]]');
    process.exit(2);
  }
  fromFile(a[0]).then(j => {
    fs.writeFileSync(a[1], JSON.stringify(j, null, 2), 'utf8');
    console.log('WROTE ' + a[1]);
    console.log(report(j));
    const val = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
    const d = a.indexOf('--doc');
    if (d >= 0 && a[d + 1]) {
      const { render } = require('./flowdoc.js');
      fs.writeFileSync(a[d + 1], render(j, { company: val('--company'), dwg: val('--dwg'), subject: val('--subject') }), 'utf8');
      console.log('WROTE ' + a[d + 1]);
    }
  }).catch(e => { console.error('GAGAL: ' + (e && e.stack || e)); process.exit(1); });
}
