#!/usr/bin/env node
// Baca project Sysmac Studio (.smc2) tanpa Sysmac Studio.
//
// Sysmac Studio TIDAK punya export XML - cuma import. Tapi berkas .smc2 itu
// sendiri container ZIP berisi XML/JSON, jadi isinya tetap bisa dibaca dari luar.
//
//   node cli.js project.smc2                  ringkasan program & section
//   node cli.js project.smc2 --operands       inventaris operand + komen
//   node cli.js project.smc2 --xref           ditulis di mana, dibaca di mana
//   node cli.js project.smc2 --xref LB800     sama, tapi difilter + lokasinya
//   node cli.js project.smc2 --llm prog.md    SELURUH konteks buat disuap ke LLM
//   node cli.js project.smc2 --flowchart m.json   urutan gerakan -> motionSequences
//   node cli.js project.smc2 --graph g.json   node + edge buat dipetakan
//   node cli.js project.smc2 --xml out/       rung -> XML yang bisa DI-IMPORT Studio
//   node cli.js project.smc2 --json out.json  dump mentah
//   node cli.js project.smc2 --probe-fb       bentuk mentah kotak fungsi/FB
//
// PERINGATAN - format ini TIDAK didokumentasikan Omron dan bisa berubah di versi
// Studio mana pun. Karena itu:
//   * HANYA BACA. Jangan pernah menulis balik ke .smc2 - project bisa rusak dan
//     tidak ada cara memperbaikinya.
//   * Jangan taruh di jalur kritis. Menulis program tetap lewat import XML yang
//     resmi didukung. Pembaca ini alat ANALISIS.
'use strict';
const fs = require('fs');
const path = require('path');

const { unzip, inflate } = require('./src/zip.js');
const { text } = require('./src/env.js');
const { readProject } = require('./src/smc2.js');
const { setSymbols } = require('./src/symbols.js');
const R = require('./src/reports.js');

const argv = process.argv.slice(2);
if (!argv.length) {
  const doc = fs.readFileSync(__filename, 'utf8').split('\n')
    .slice(1).filter(l => l.startsWith('//')).map(l => l.slice(3));
  console.log(doc.join('\n'));
  process.exit(2);
}

const file = argv[0];
const flag = name => argv.indexOf(name);
const argAfter = (i, dflt) => (argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[i + 1] : dflt);
const write = (out, s) => { fs.writeFileSync(out, s, 'utf8'); return out; };

(async () => {
  if (flag('--probe-fb') >= 0) { await probeFb(file); return; }

  const p = await readProject(fs.readFileSync(file), unzip);
  p.file = file;
  setSymbols(p.variables);

  let i;
  if ((i = flag('--json')) >= 0) {
    const out = argAfter(i, 'smc2.json');
    write(out, JSON.stringify(p, null, 2));
    console.log('WROTE ' + out);
  } else if ((i = flag('--flowchart')) >= 0) {
    const out = argAfter(i, 'motionSequences.json');
    const { result, report } = R.flowchart(p);
    write(out, JSON.stringify(result, null, 2));
    console.log('WROTE ' + out);
    console.log('');
    console.log(R.flowchartReport(report));
  } else if ((i = flag('--llm')) >= 0) {
    const out = argAfter(i, 'program.md');
    const md = R.llmDump(p);
    write(out, md);
    console.log('WROTE ' + out + '  (' + md.split('\n').length + ' baris)');
  } else if ((i = flag('--xml')) >= 0) {
    const dir = argAfter(i, 'xml-out');
    const { files, report } = require('./xml_out.js').exportProject(p);
    fs.mkdirSync(dir, { recursive: true });
    files.forEach(f => fs.writeFileSync(path.join(dir, f.name), f.xml, 'utf8'));
    console.log('WROTE ' + files.length + ' berkas ke ' + dir);
    console.log('');
    console.log(require('./xml_out.js').exportReport(report));
  } else if ((i = flag('--graph')) >= 0) {
    const out = argAfter(i, 'graph.json');
    const g = R.graphData(p);
    write(out, JSON.stringify(g, null, 2));
    console.log('WROTE ' + out + '  (' + g.nodes.length + ' node, ' + g.edges.length + ' edge)');
  } else if ((i = flag('--xref')) >= 0) {
    console.log(R.xref(p, argAfter(i, null)));
  } else if (flag('--operands') >= 0) {
    console.log(R.operands(p));
  } else {
    console.log(R.summarise(p));
  }
})().catch(e => { console.error('GAGAL: ' + e.message); process.exit(1); });

// Tunjukkan bentuk MENTAH elemen fungsi/FB, langsung dari project sungguhan.
// Kotak fungsi di Studio (TON, MOVE, MD_FLT_Reset400, ...) punya PIN bernama
// beserta operand yang menempel di tiap pin. Kalau suatu saat ada bentuk yang
// belum dikenali, dibaca dulu dari project sungguhan - bukan ditebak.
// Keluarannya aman ditempel ke chat: cuma nama field, nama instruksi, dan
// beberapa contoh objek - bukan seluruh program.
async function probeFb(file) {
  const files = unzip(fs.readFileSync(file));
  const keys = new Map(), instr = new Map(), samples = [];
  const xmlSample = [];

  for (const [n, f] of files) {
    if (!n.endsWith('.xml')) continue;
    const t = text(await inflate(f));
    const head = t.replace(/^\s+/, '').slice(0, 400);

    if (head[0] === '{' && head.includes('"CLs"')) {
      let i = 0;
      while (i < t.length) {
        while (i < t.length && /\s/.test(t[i])) i++;
        if (t[i] !== '{') break;
        let d = 0, j = i, ins = false, esc2 = false;
        for (; j < t.length; j++) {
          const c = t[j];
          if (esc2) { esc2 = false; continue; }
          if (c === '\\') { esc2 = true; continue; }
          if (c === '"') ins = !ins;
          else if (!ins) { if (c === '{') d++; else if (c === '}' && --d === 0) { j++; break; } }
        }
        let o;
        try { o = JSON.parse(t.slice(i, j)); } catch (e) { break; }
        i = j;
        for (const e of (o.CLs || [])) {
          if (e.__type !== 'F') continue;
          Object.keys(e).forEach(k => keys.set(k, (keys.get(k) || 0) + 1));
          const nm = e.Name || '(tanpa nama)';
          instr.set(nm, (instr.get(nm) || 0) + 1);
          samples.push(e);
        }
      }
    } else if (head.includes('<LadderDiagram') && xmlSample.length < 2) {
      const m = t.match(/<DiagramElement[^>]*i:type="Function[^"]*"[\s\S]{0,1200}/);
      if (m) xmlSample.push(m[0]);
    }
  }

  const total = [...instr.values()].reduce((a, b) => a + b, 0);
  console.log('ELEMEN FUNGSI (JSON, Studio >= 1.66): ' + total);
  if (keys.size) {
    console.log('');
    console.log('FIELD            MUNCUL');
    [...keys.entries()].sort((a, b) => b[1] - a[1])
      .forEach(([k, c]) => console.log(k.padEnd(16) + String(c).padStart(6)));
    console.log('');
    console.log('INSTRUKSI yang dipakai (' + instr.size + ' jenis):');
    [...instr.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)
      .forEach(([k, c]) => console.log('   ' + String(c).padStart(5) + '  ' + k));
    samples.sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length);
    console.log('');
    console.log('CONTOH objek terkaya (maks 3):');
    samples.slice(0, 3).forEach(e => {
      console.log(JSON.stringify(e, null, 2).slice(0, 1500));
      console.log('   ---');
    });
  }
  if (xmlSample.length) {
    console.log('');
    console.log('CONTOH FunctionElement (XML, Studio <= 1.56):');
    xmlSample.forEach(s => { console.log(s); console.log('   ---'); });
  }
  if (!keys.size && !xmlSample.length) console.log('Tidak ada elemen fungsi di project ini.');
}
