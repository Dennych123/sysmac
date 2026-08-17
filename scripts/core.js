// ===== Headless core =====
// Jalanin pipeline generator LANGSUNG dari js/*.js, tanpa perantara flow Node-RED.
// Dulu satu-satunya cara ngejalanin pipeline di luar browser adalah lewat outputs/*-flow.json yang
// dibangun build.py - jadi tiap ganti js/ harus rebuild flow dulu, dan formatnya kebawa-bawa bentuk
// node Node-RED padahal tool-nya sendiri sudah gak pakai Node-RED sama sekali.
//
// Tiap file di js/ itu badan fungsi Node-RED: baca `msg`, `flow`, `node`, lalu `return msg`.
// Kontrak itu dipertahankan (bukan Node-RED-nya, cuma bentuk fungsinya) supaya file yang sama tetap
// bisa di-inline ke index.html oleh build_html.py tanpa diubah sedikit pun.
const fs = require('fs');
const path = require('path');

const JS_DIR = path.join(__dirname, '..', 'js');
const read = (f) => fs.readFileSync(path.join(JS_DIR, f), 'utf8');

const LIB = read('lib.js');
const STEPS = {
  parse:    read('parse.js'),
  genname:  read('genname.js'),
  validate: read('validate.js'),
  split:    read('split.js'),
  // gen_all butuh helper dari lib.js - di build_html.py juga digabung begini
  gen_all:  LIB + '\n' + read('gen_all.js'),
};

function runStep(code, msg, flow, node) {
  return new Function('msg', 'flow', 'node', 'return (function(){' + code + '})()')(msg, flow, node);
}

// Context flow sederhana: cuma get/set, sama seperti yang dipakai browser (flowStore).
function makeFlow(seed) {
  const ctx = Object.assign({}, seed || {});
  return { get: (k) => ctx[k], set: (k, v) => { ctx[k] = v; }, _ctx: ctx };
}

// project: { io, stationNames, timerDefaults, arraySizes, actuatorOverrides, motionSequences, conditionDefs }
// Balikin { files, warnings, stats, arrayInfo, lscAudit, split } atau lempar Error kalau validate gagal.
function generate(project, opts) {
  const o = opts || {};
  const warn = o.onWarn || (() => {});
  const flow = makeFlow({
    stationNames:      project.stationNames || {},
    timerDefaults:     project.timerDefaults || {},
    arraySizes:        project.arraySizes || {},
    actuatorOverrides: project.actuatorOverrides || {},
    motionSequences:   project.motionSequences || {},
    conditionDefs:     project.conditionDefs || {},
    // Dua ini sempat tidak diteruskan, jadi CLI diam-diam menghasilkan program yang BEDA
    // dari yang keluar di browser dengan project JSON yang sama: peta HMI balik ke default
    // dan instruksi lanjutan selalu mati. Setiap kunci baru yang dibaca gen_all lewat
    // flow.get() harus ditambahkan di sini juga.
    hmiMap:            project.hmiMap || {},
    advancedInstructions: !!project.advancedInstructions,
  });
  const node = { warn };

  let msg = runStep(STEPS.parse, { payload: project.io || '' }, flow, node);
  msg = runStep(STEPS.genname, msg, flow, node);

  // validate punya 2 output: [ok, error]
  const v = runStep(STEPS.validate, msg, flow, node);
  if (v[1]) {
    const err = new Error('Validate gagal: ' + v[1].payload);
    err.validation = v[1].payload;
    throw err;
  }

  const sp = runStep(STEPS.split, v[0], flow, node);
  const out = runStep(STEPS.gen_all, sp, flow, node);
  return Object.assign({}, out.payload, { split: sp.summary });
}

module.exports = { generate, makeFlow, runStep, STEPS };

// ===== CLI =====
//   node scripts/core.js project.json [outdir]
// Tanpa outdir, file cuma dihitung dan diringkas - berguna buat cek cepat tanpa nulis apa-apa.
if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('pakai: node scripts/core.js <project.json> [outdir]');
    process.exit(2);
  }
  let project;
  try {
    project = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  } catch (e) {
    console.error('gagal baca project JSON: ' + e.message);
    process.exit(2);
  }
  let res;
  try {
    res = generate(project);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  console.log(res.stats);
  if (res.warnings) console.log('\nWARN:\n' + res.warnings);
  if (args[1]) {
    fs.mkdirSync(args[1], { recursive: true });
    res.files.forEach((f) => fs.writeFileSync(path.join(args[1], f.name), f.xml));
    console.log('\nWROTE ' + res.files.length + ' file ke ' + args[1]);
  }
}
