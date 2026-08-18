// Bandingkan DUA project .smc2 - "apa yang berubah di Studio".
//
//   node cli.js LAMA.smc2 --diff BARU.smc2
//   node cli.js LAMA.smc2 --diff BARU.smc2 --diff-json out.json
//
// HANYA BACA. Tidak menulis satu byte pun ke .smc2 mana pun.
//
// Kenapa ada: begitu mesin jalan, perubahan terjadi di Studio dan tidak ada yang
// mencatat apa. `.smc2` itu ZIP - `git diff` cuma bilang "berkas biner berubah",
// jadi riwayatnya kosong justru waktu paling dibutuhkan.
//
// Tiga kelas perubahan sengaja DIPISAH, karena akibatnya beda jauh:
//
//   logika    susunan elemen rung berubah    -> mesin bergerak lain
//   tata letak cuma koordinat/komentar rung  -> tidak ada akibat runtime
//   alamat    AT sebuah variabel bergeser    -> NB menunjuk bit lain, DIAM
//
// Yang ketiga itu alasan utama berkas ini ada. Nomor alarm dan alamat tombol
// tercetak di layar NB dan lembar troubleshooting; kalau bergeser, tidak ada
// satu pun yang mengeluh - layar NB tetap menyala, cuma menunjuk bit lain.
'use strict';

// -------------------------------------------------------------------- sidik
// Dua sidik per rung. Yang LOGIKA membuang koordinat, jadi rung yang cuma
// digeser di kanvas tidak dilaporkan sebagai perubahan program - kalau tidak,
// tiap kali seseorang merapikan tata letak seluruh section tampak berubah dan
// laporan ini berhenti dibaca.
function rungLogic(r) {
  const els = ((r && r.elements) || []).map(e => [
    e.kind || '', e.var || '', e.func || '',
    e.nc ? 'nc' : '', e.neg ? 'neg' : '', e.set ? 'set' : '', e.reset ? 'rst' : '',
    e.edge || '',
    e.pins ? [].concat(e.pins.in || [], e.pins.out || [])
               .map(p => (p && (p.name || p.Name || p.var)) || '').join(',') : '',
  ].join('|'));
  // Diurut supaya penomoran ulang elemen di berkas tidak terbaca sebagai
  // perubahan - yang dinilai isi rung, bukan urutan penyimpanannya.
  return els.slice().sort().join(';') + '#' + (((r && r.vlinks) || []).length);
}

function rungFull(r) {
  return rungLogic(r) + '@' + ((r && r.elements) || [])
    .map(e => (e.x || 0) + ',' + (e.y || 0)).join(' ') + '/' + ((r && r.comment) || '');
}

// ------------------------------------------------------------------ section
const sectKey = (prog, sect) => prog + ' / ' + sect;

function sectionMap(p) {
  const m = new Map();
  for (const prog of p.programs || []) {
    for (const s of prog.sections || []) {
      m.set(sectKey(prog.name, s.name),
            { prog: prog.name, sect: s.name, kind: s.kind, rungs: s.rungs || [], st: s.st || null });
    }
  }
  return m;
}

function progMap(p) {
  const m = new Map();
  for (const prog of p.programs || []) {
    m.set(prog.name, {
      name: prog.name,
      sections: (prog.sections || []).length,
      rungs: (prog.sections || []).reduce((a, s) => a + (s.rungs || []).length, 0),
    });
  }
  return m;
}

// ---------------------------------------------------------------- variabel
function varMap(p) {
  const m = new Map();
  for (const v of p.variables || []) m.set(v.name, v);
  return m;
}

/**
 * Komen per elemen array (AL[n]/MF[n]) dari SELURUH variabel, dipipihkan jadi
 * satu peta "AL[12]" -> teks. Ini satu-satunya tempat teks alarm tersimpan di
 * dalam .smc2, dan nomornya yang tercetak di layar NB.
 */
function elemMap(p) {
  const m = new Map();
  for (const v of p.variables || []) {
    if (!v.elementComments) continue;
    for (const k of Object.keys(v.elementComments)) {
      m.set(v.name + '[' + k + ']', v.elementComments[k]);
    }
  }
  return m;
}

/**
 * Alarm yang PINDAH NOMOR: teks yang sama muncul di indeks lain.
 *
 * Dilaporkan terpisah dari "teks berubah" karena akibatnya beda - teks berubah
 * cuma perlu sinkron ulang ke NB, sedangkan nomor bergeser membuat SELURUH
 * lembar troubleshooting dan tiap layar NB yang menyebut nomor itu salah.
 */
function shifts(oldM, newM) {
  const byTextNew = new Map();
  for (const [k, t] of newM) {
    if (!t) continue;
    if (!byTextNew.has(t)) byTextNew.set(t, []);
    byTextNew.get(t).push(k);
  }
  const out = [];
  for (const [k, t] of oldM) {
    if (!t || newM.get(k) === t) continue;               // masih di tempatnya
    const cand = (byTextNew.get(t) || []).filter(n => oldM.get(n) !== t);
    // Cuma yang tidak ambigu. Dua alarm berteks sama persis di dua tempat baru
    // tidak bisa dipastikan yang mana pindahannya - dan tebakan di sini justru
    // menutupi perubahan yang sebenarnya.
    if (cand.length === 1) out.push({ from: k, to: cand[0], text: t });
  }
  return out;
}

// -------------------------------------------------------------------- utama
/**
 * @param a project hasil readProject() - versi LAMA
 * @param b project hasil readProject() - versi BARU
 * @returns struktur diff; tidak menyentuh berkas apa pun
 */
function diffProjects(a, b) {
  const d = {
    solution: { from: a.solution || '', to: b.solution || '' },
    studio: { from: a.studio || '', to: b.studio || '' },
    programs: { added: [], removed: [] },
    sections: { added: [], removed: [], changed: [] },
    variables: { added: [], removed: [], changed: [] },
    elements: { added: [], removed: [], changed: [], moved: [] },
    counts: { rungLogic: 0, rungCosmetic: 0 },
  };

  const pa = progMap(a), pb = progMap(b);
  for (const [n, v] of pb) if (!pa.has(n)) d.programs.added.push(v);
  for (const [n, v] of pa) if (!pb.has(n)) d.programs.removed.push(v);

  const sa = sectionMap(a), sb = sectionMap(b);
  for (const [k, v] of sb) if (!sa.has(k)) d.sections.added.push(v);
  for (const [k, v] of sa) if (!sb.has(k)) d.sections.removed.push(v);

  for (const [k, x] of sa) {
    const y = sb.get(k);
    if (!y) continue;
    if (x.kind === 'st' || y.kind === 'st') {
      if ((x.st || '') !== (y.st || '')) {
        d.sections.changed.push({ prog: x.prog, sect: x.sect, kind: 'st',
                                  from: (x.st || '').length, to: (y.st || '').length,
                                  logic: 1, cosmetic: 0 });
        d.counts.rungLogic++;
      }
      continue;
    }
    let logic = 0, cosmetic = 0;
    const n = Math.max(x.rungs.length, y.rungs.length);
    for (let i = 0; i < n; i++) {
      const rx = x.rungs[i], ry = y.rungs[i];
      if (!rx || !ry) { logic++; continue; }
      if (rungLogic(rx) !== rungLogic(ry)) logic++;
      else if (rungFull(rx) !== rungFull(ry)) cosmetic++;
    }
    if (logic || cosmetic || x.rungs.length !== y.rungs.length) {
      d.sections.changed.push({ prog: x.prog, sect: x.sect, kind: 'ladder',
                                from: x.rungs.length, to: y.rungs.length, logic, cosmetic });
      d.counts.rungLogic += logic;
      d.counts.rungCosmetic += cosmetic;
    }
  }

  const va = varMap(a), vb = varMap(b);
  for (const [n, v] of vb) if (!va.has(n)) d.variables.added.push(v);
  for (const [n, v] of va) if (!vb.has(n)) d.variables.removed.push(v);
  for (const [n, x] of va) {
    const y = vb.get(n);
    if (!y) continue;
    const fields = [];
    for (const f of ['type', 'address', 'group', 'comment']) {
      if ((x[f] || '') !== (y[f] || '')) fields.push({ field: f, from: x[f] || '', to: y[f] || '' });
    }
    if (fields.length) d.variables.changed.push({ name: n, fields });
  }

  const ea = elemMap(a), eb = elemMap(b);
  for (const [k, t] of eb) if (!ea.has(k)) d.elements.added.push({ key: k, text: t });
  for (const [k, t] of ea) if (!eb.has(k)) d.elements.removed.push({ key: k, text: t });
  for (const [k, t] of ea) {
    if (eb.has(k) && eb.get(k) !== t) d.elements.changed.push({ key: k, from: t, to: eb.get(k) });
  }
  d.elements.moved = shifts(ea, eb);

  d.empty = !d.programs.added.length && !d.programs.removed.length &&
            !d.sections.added.length && !d.sections.removed.length &&
            !d.sections.changed.length && !d.variables.added.length &&
            !d.variables.removed.length && !d.variables.changed.length &&
            !d.elements.added.length && !d.elements.removed.length &&
            !d.elements.changed.length;
  return d;
}

// -------------------------------------------------------------------- cetak
const padR = (s, n) => String(s).padEnd(n);
const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));

/** Satu baris ringkas - dipakai sebagai pesan commit oleh watcher (TODO 3b). */
function diffLine(d) {
  if (d.empty) return 'tidak ada perubahan';
  const bits = [];
  const pm = d.programs.added.length + d.programs.removed.length;
  if (pm) bits.push(pm + ' program');
  if (d.counts.rungLogic) bits.push(d.counts.rungLogic + ' rung logika');
  if (d.counts.rungCosmetic) bits.push(d.counts.rungCosmetic + ' rung tata letak');
  const vm = d.variables.added.length + d.variables.removed.length + d.variables.changed.length;
  if (vm) bits.push(vm + ' variabel');
  const em = d.elements.added.length + d.elements.removed.length + d.elements.changed.length;
  if (em) bits.push(em + ' komen alarm');
  if (d.elements.moved.length) bits.push(d.elements.moved.length + ' alarm BERGESER');
  return bits.join(', ');
}

function diffReport(d, fileA, fileB) {
  const L = [];
  L.push('DIFF  ' + (fileA || 'lama') + '  ->  ' + (fileB || 'baru'));
  if (d.solution.from !== d.solution.to) {
    L.push('      solution: ' + d.solution.from + ' -> ' + d.solution.to);
  }
  if (d.studio.from !== d.studio.to) {
    L.push('      Studio  : ' + d.studio.from + ' -> ' + d.studio.to);
  }
  L.push('');
  if (d.empty) { L.push('TIDAK ADA PERUBAHAN.'); return L.join('\n'); }

  const sect = (title, lines) => {
    if (!lines.length) return;
    L.push(title);
    lines.forEach(l => L.push('  ' + l));
    L.push('');
  };

  sect('PROGRAM', [].concat(
    d.programs.added.map(p => '+ ' + padR(p.name, 34) + p.sections + ' section, ' + p.rungs + ' rung'),
    d.programs.removed.map(p => '- ' + padR(p.name, 34) + p.sections + ' section, ' + p.rungs + ' rung')));

  sect('SECTION', [].concat(
    d.sections.added.map(s => '+ ' + padR(sectKey(s.prog, s.sect), 44) + (s.rungs || []).length + ' rung'),
    d.sections.removed.map(s => '- ' + padR(sectKey(s.prog, s.sect), 44) + (s.rungs || []).length + ' rung'),
    d.sections.changed.map(s => '~ ' + padR(sectKey(s.prog, s.sect), 44) +
      (s.kind === 'st' ? s.from + ' -> ' + s.to + ' char ST'
                       : s.from + ' -> ' + s.to + ' rung   (' + s.logic + ' logika, ' +
                         s.cosmetic + ' tata letak)'))));

  sect('VARIABEL', [].concat(
    d.variables.added.map(v => '+ ' + padR(v.name, 26) + padR(v.type, 12) + (v.address || '')),
    d.variables.removed.map(v => '- ' + padR(v.name, 26) + padR(v.type, 12) + (v.address || '')),
    [].concat(...d.variables.changed.map(v => v.fields.map(f =>
      '~ ' + padR(v.name, 26) + padR(f.field, 9) + clip(f.from || '(kosong)', 24) +
      ' -> ' + clip(f.to || '(kosong)', 24))))));

  // Ini yang paling mahal kalau terlewat: nomor alarm tercetak di layar NB.
  sect('ALARM BERGESER NOMOR', d.elements.moved.map(m =>
    '! ' + padR(m.from + ' -> ' + m.to, 24) + clip(m.text, 46)));

  sect('KOMEN ELEMEN (AL/MF)', [].concat(
    d.elements.added.map(e => '+ ' + padR(e.key, 12) + clip(e.text, 58)),
    d.elements.removed.map(e => '- ' + padR(e.key, 12) + clip(e.text, 58)),
    d.elements.changed.map(e => '~ ' + padR(e.key, 12) + clip(e.from, 28) + ' -> ' + clip(e.to, 28))));

  L.push('RINGKASAN: ' + diffLine(d));
  if (d.elements.moved.length) {
    L.push('           alarm bergeser nomor - layar NB dan lembar troubleshooting');
    L.push('           yang menyebut nomor lama ikut salah. Sinkronkan lagi: scripts/nb_sync.js');
  }
  return L.join('\n');
}

module.exports = { diffProjects, diffReport, diffLine, rungLogic, rungFull };
