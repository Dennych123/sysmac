#!/usr/bin/env node
// project JSON (smc2_project.js) -> dokumen FLOW PROCESS DIAGRAM, A3 landscape, siap cetak.
//
//   node scripts/flowdoc.js project.json flow.html [--company "PT. X"] [--dwg E0-...] [--subject "..."]
//
// Gayanya ditiru dari lembar flow chart Denso (E0-5505-M024, docs/ref/): garis hitam tipis,
// bit dan alamat BIRU, "off" MERAH, langkah MENGULAR (baris habis -> turun -> balik ke kiri ->
// baris berikutnya), kotak masuk/keluar kecil, kotak syarat bersudut panah, diamond judgement,
// kotak syarat putus-putus di bawah, title block + tabel revisi di pojok.
//
// Halaman 1 = main circuit (P010). Sesudahnya satu station per halaman (lebih kalau penuh), tiap
// varian urutan dalam bingkainya sendiri. Semua isi dibaca dari `flow` - tidak ada yang dikarang
// di sini; langkah yang tidak berpola digambar sebagai kotak berisi syarat aslinya.
'use strict';
const fs = require('fs');

// ------------------------------------------------------------------ kanvas
const PW = 1600, PH = 1131;                    // A3 landscape, 1 unit ~ 0.26 mm
const FX = 36, FY = 28, FW = PW - 72, FH = PH - 60;
const CONTENT_TOP = 120, CONTENT_BOTTOM = FY + FH - 120;
const FONT = "'MS Gothic','Osaka-Mono','Consolas','Courier New',monospace";
const CW = 0.6;                                // lebar huruf monospace / ukuran font

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tw = (s, fs) => String(s).length * fs * CW;

function wrap(s, n, max) {
  const words = String(s || '').replace(/\s+/g, ' ').trim().split(' ');
  const out = [];
  let cur = '';
  words.forEach(w => {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= n) cur += ' ' + w;
    else { out.push(cur); cur = w; }
  });
  if (cur) out.push(cur);
  if (max && out.length > max) { out.length = max; out[max - 1] = out[max - 1].slice(0, n - 1) + '…'; }
  return out.length ? out : [''];
}

// Teks bertumpuk kecil: [{t, c}] per baris, c = 'b' biru / 'r' merah / '' hitam.
function spans(x, y, parts, fs, anchor) {
  const t = parts.map(p => `<tspan${p.c === 'b' ? ' class="b"' : p.c === 'r' ? ' class="r"' : ''}>${esc(p.t)}</tspan>`).join('');
  return `<text x="${x}" y="${y}" font-size="${fs}"${anchor ? ` text-anchor="${anchor}"` : ''}>${t}</text>`;
}
const txt = (x, y, s, fs, cls, anchor) =>
  `<text x="${x}" y="${y}" font-size="${fs}"${cls ? ` class="${cls}"` : ''}${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(s)}</text>`;
const line = (pts, extra) => `<polyline points="${pts.map(p => p.join(',')).join(' ')}"${extra || ''}/>`;
const arrow = (pts, extra) => line(pts, ' marker-end="url(#ah)"' + (extra || ''));

// Alamat HARDWIRE sebuah simbol (kanal IO). Bit turunan `PH_X_ON`/`PH_X_OFF` ikut alamat
// sensor aslinya `PH_X` - di lembar acuan sensor selalu ditulis dengan alamatnya (AS3200.00,
// PH3100.02), karena alamat itu yang dicari teknisi di panel, bukan nama variabelnya.
let ADDR = {};
const addrOf = v => ADDR[v] || ADDR[String(v || '').replace(/_(ON|OFF)$/, '')] || '';

// Kondisi satu kontak: "[CH2_02] VAR on_KOMEN" / "... off_KOMEN" - cara lembar acuan menulisnya.
function condParts(c, n) {
  const cm = (c.cmt || '').replace(/\s+/g, ' ').trim();
  const rest = cm ? '_' + cm : '';
  const a = addrOf(c.var);
  const room = Math.max(4, (n || 40) - c.var.length - 4 - (a ? a.length + 1 : 0));
  return (a ? [{ t: a, c: 'b' }, { t: ' ' }] : []).concat([{ t: c.var, c: 'b' }, { t: ' ' }, { t: c.nc ? 'off' : 'on', c: c.nc ? 'r' : '' },
          { t: rest.length > room ? rest.slice(0, room - 1) + '…' : rest }]);
}

// Konektor halaman: lingkaran berhuruf. Baris yang putus berakhir di (A) dan baris berikutnya
// mulai dari (A) - pola SEMUA lembar acuan. Garis balik panjang antarbaris dulu dipakai di sini,
// dan dengan empat lajur paralel jadi empat garis sejajar yang tidak bisa diikuti mata.
function connector(cx, cy, label) {
  return `<circle cx="${cx}" cy="${cy}" r="10" class="ln wh"/>` + txt(cx, cy + 4, label, 11, '', 'middle');
}
const letterOf = n => (n >= 26 ? letterOf(Math.floor(n / 26) - 1) : '') + String.fromCharCode(65 + n % 26);

// ------------------------------------------------------------------ bingkai halaman
function frame(opt, sheet, total, heading, headY) {
  const tb = { x: FX + FW - 600, y: FY + FH - 104, w: 600, h: 104 };
  const rv = { x: FX + FW - 330, y: FY, w: 330, h: 84 };
  const o = [];
  o.push(`<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" class="fr"/>`);
  // tabel revisi
  o.push(`<rect x="${rv.x}" y="${rv.y}" width="${rv.w}" height="${rv.h}" class="thin"/>`);
  const cols = [0, 30, 220, 255, 290, 330];
  cols.slice(1, -1).forEach(c => o.push(line([[rv.x + c, rv.y], [rv.x + c, rv.y + rv.h]], ' class="thin"')));
  [21, 42, 63].forEach(r => o.push(line([[rv.x, rv.y + r], [rv.x + rv.w, rv.y + r]], ' class="thin"')));
  ['SYM', 'REVISION RECORD', 'ISSUE', 'DATE', 'DR'].forEach((h, i) =>
    o.push(txt(rv.x + (cols[i] + cols[i + 1]) / 2, rv.y + 14, h, 8, '', 'middle')));
  [21, 42, 63].forEach(r => o.push(`<path d="M${rv.x + 4},${rv.y + r + 18} L${rv.x + 15},${rv.y + r + 4} L${rv.x + 26},${rv.y + r + 18} Z" class="thin"/>`));
  // title block
  o.push(`<rect x="${tb.x}" y="${tb.y}" width="${tb.w}" height="${tb.h}" class="thin"/>`);
  o.push(line([[tb.x, tb.y + 36], [tb.x + tb.w, tb.y + 36]], ' class="thin"'));
  o.push(line([[tb.x + 330, tb.y + 36], [tb.x + 330, tb.y + tb.h]], ' class="thin"'));
  o.push(line([[tb.x + 330, tb.y + 70], [tb.x + tb.w, tb.y + 70]], ' class="thin"'));
  o.push(line([[tb.x + 520, tb.y + 36], [tb.x + 520, tb.y + 70]], ' class="thin"'));
  o.push(line([[tb.x, tb.y + 56], [tb.x + 330, tb.y + 56]], ' class="thin"'));
  o.push(txt(tb.x + 6, tb.y + 11, 'TITLE', 7));
  o.push(txt(tb.x + 10, tb.y + 30, opt.title || 'FLOW PROCESS DIAGRAM', 18, 'ttl'));
  o.push(txt(tb.x + 10, tb.y + 51, opt.company || '', 12, 'ttl'));
  ['APPROVED', 'CHECKED', 'CHECKED', 'DESIGNED', 'DRAWN'].forEach((h, i) => {
    o.push(txt(tb.x + 4 + i * 66, tb.y + 65, h, 7));
    if (i) o.push(line([[tb.x + i * 66, tb.y + 56], [tb.x + i * 66, tb.y + tb.h]], ' class="thin"'));
  });
  o.push(txt(tb.x + 336, tb.y + 45, 'DRAWING NO.', 7));
  o.push(txt(tb.x + 336, tb.y + 64, opt.dwg || '', 15));
  o.push(txt(tb.x + 526, tb.y + 45, 'SHEET', 7));
  o.push(txt(tb.x + 560, tb.y + 64, sheet + '/' + total, 13, '', 'middle'));
  o.push(txt(tb.x + 336, tb.y + 79, 'SUBJECT', 7));
  wrap(opt.subject || '', 30, 2).forEach((l, i) => o.push(txt(tb.x + 465, tb.y + 88 + i * 12, l, 11, '', 'middle')));
  if (opt.company) o.push(txt(FX + 4, FY + FH + 18, opt.company.replace(/^PT\.?\s*/i, '').split(/\s+/)[0], 16, 'ttl'));
  o.push(txt(FX + FW, FY + FH + 18, 'CONFIDENTIAL', 12, '', 'end'));
  // kepala halaman: kotak nama program, seperti "PRESS MOTION (P011)"
  if (heading) {
    const w = tw(heading, 16) + 40;
    const hy = headY || FY + 22;
    o.push(`<rect x="${FX + 20}" y="${hy}" width="${w}" height="36" class="hd"/>`);
    o.push(txt(FX + 20 + w / 2, hy + 24, heading, 16, '', 'middle'));
  }
  return o.join('\n');
}

// ------------------------------------------------------------------ ukuran node
const LANE_GAP = 26, COL_GAP = 66;
function measure(n) {
  if (n.kind === 'motion') {
    const act = wrap(n.label, 18, 2);
    n._act = act;
    const sens = n.sensor || n.lsc || '';
    n._sens = sens;
    n._sensCh = addrOf(sens);
    const aw = Math.max(140, ...act.map(l => tw(l, 12)), tw(n.act || '', 10), tw((n.actCh || '') + ' on', 12)) + 4;
    n._aw = aw;
    n.w = aw + (sens ? 36 + Math.max(tw(sens + ' on', 10), tw(n._sensCh, 12), 30) + 6 : 0);
    n.h = 18 + act.length * 15 + 26;
  } else if (n.kind === 'judge') {
    const q = n.comment || ((n.outs || [])[0] || {}).cmt;
    n._t = wrap(q ? q.toUpperCase() + ' ?' : 'JUDGEMENT', 14, 3);
    n.w = 150; n.h = 70;
  } else if (n.kind === 'delay') {
    n.w = 130; n.h = 40;
  } else {
    n._t = wrap(n.label, 34, 2);
    const conds = n.conds.slice(0, 6);
    n._c = conds; n._more = n.conds.length - conds.length;
    n.w = 280;
    n.h = 12 + n._t.length * 15 + conds.length * 13 + (n._more > 0 ? 13 : 0) + (n.timer ? 14 : 0) + 10;
  }
  return n;
}
const outY = n => n.y + (n.kind === 'wait' ? 18 : n.h / 2);   // baris masuk/keluar

// ------------------------------------------------------------------ satu varian
// Susun lapisan (layer = 1 + lapisan pendahulu terjauh), lajur (paralel ditumpuk ke bawah),
// lalu potong jadi BARIS supaya mengular: lapisan yang tidak muat lanjut di baris berikutnya.
function layoutVariant(v, station, width) {
  const nodes = v.nodes.map(n => measure(Object.assign({}, n)));
  const by = new Map(nodes.map(n => [n.id, n]));
  const START = { id: 'start', w: 250, h: 70, layer: 0, lane: 0 };
  nodes.forEach(n => {
    const ps = n.after.map(a => a.id === 'start' ? START : by.get(a.id)).filter(Boolean);
    n.layer = 1 + Math.max(0, ...ps.map(p => p.layer));
  });
  const layers = [];
  nodes.forEach(n => { (layers[n.layer] = layers[n.layer] || []).push(n); });
  // lajur: warisi lajur pendahulu pertama kalau kosong, kalau tidak lajur bebas berikutnya
  layers.forEach(L => {
    if (!L) return;
    const used = new Set();
    L.forEach(n => {
      const p = n.after.map(a => a.id === 'start' ? null : by.get(a.id)).find(Boolean);
      let want = p ? p.lane : 0;
      if (n.after.length > 1) want = Math.min(...n.after.map(a => (by.get(a.id) || START).lane));
      while (used.has(want)) want++;
      n.lane = want; used.add(want);
    });
  });
  const nl = Math.max(1, ...nodes.map(n => n.lane + 1));
  const laneH = Array.from({ length: nl }, (_, l) => Math.max(70, ...nodes.filter(n => n.lane === l).map(n => n.h)));
  const laneY = []; laneH.reduce((y, h, l) => { laneY[l] = y; return y + h + LANE_GAP; }, 0);
  const bandH = laneY[nl - 1] + laneH[nl - 1];
  const colW = layers.map(L => L ? Math.max(...L.map(n => n.w)) : 0);
  colW[0] = START.w;

  // potong jadi baris
  const rows = [[]];
  let x = 0;
  colW.forEach((w, li) => {
    if (li && x + w + COL_GAP > width && rows[rows.length - 1].length) { rows.push([]); x = 60; }
    rows[rows.length - 1].push({ li, x });
    x += w + COL_GAP;
  });
  const ROW_GAP = 50;
  const colPos = new Map();
  rows.forEach((r, ri) => r.forEach(c => colPos.set(c.li, { x: c.x, y: ri * (bandH + ROW_GAP), row: ri })));
  START.x = 20; START.y = 0; START.row = 0;
  nodes.forEach(n => {
    const c = colPos.get(n.layer);
    n.row = c.row;
    n.x = c.x + (colW[n.layer] - n.w) / 2 * 0; // rata kiri, supaya panah antarlapisan lurus
    n.y = c.y + laneY[n.lane] + (n.kind === 'wait' ? 0 : (Math.min(laneH[n.lane], 70) - n.h) / 2 + (n.h < 70 ? 0 : 0));
    n.colR = c.x + colW[n.layer];
  });
  const height = rows.length * bandH + (rows.length - 1) * ROW_GAP;
  return { nodes, by, START, rows, height, bandH, ROW_GAP, colW, station, v, conn: { n: 0 } };
}

function drawVariant(L, ox, oy, width) {
  const { nodes, by, START, station, v } = L;
  const o = [];
  const X = x => ox + x, Y = y => oy + y;

  // --- blok awal: kotak masuk + kotak syarat bersudut panah
  const sy = Y(START.y + 35);
  o.push(`<rect x="${X(0)}" y="${sy - 7}" width="14" height="14" class="ln"/>`);
  o.push(txt(X(2), sy - 12, station.entry || '', 11, 'b'));
  o.push(arrow([[X(-30), sy], [X(0), sy]]));
  o.push(arrow([[X(14), sy], [X(38), sy]]));
  const bx = X(40), bw = 190, bh = 64, by0 = sy - 16;
  o.push(`<path d="M${bx},${by0} H${bx + bw - 12} L${bx + bw},${by0 + 12} V${by0 + bh} H${bx} Z" class="ln"/>`);
  wrap('[' + v.name + ']', 24, 2).forEach((l, i) => o.push(txt(bx + 5, by0 + 14 + i * 14, l, 12, 'ttl')));
  o.push(txt(bx + 5, by0 + 44, 'Unit Motion Condition', 11));
  if (v.gate) o.push(txt(bx + 5, by0 + bh - 5, v.gate, 11, 'b'));
  const startOut = [bx + bw, sy];

  // --- node
  nodes.forEach(n => {
    const x = X(n.x), y = Y(n.y), oyy = Y(outY(n));
    n._in = [x, oyy];
    if (n.kind === 'motion') {
      const ty = y + 14;
      n._act.forEach((l, i) => o.push(txt(x + 2, ty + i * 15, l, 12)));
      const ly = ty + n._act.length * 15;
      o.push(txt(x + 2, ly, n.act || '', 10, 'b'));
      o.push(spans(x + 2, ly + 14, [{ t: n.actCh || '', c: 'b' }, { t: (n.actCh ? ' ' : '') + 'on' }], 12));
      n._in = [x - 2, Y(n.y) + 10];
      n._out = [x + n._aw, Y(n.y) + 10];
      if (n._sens) {
        const sx = x + n._aw + 36;
        o.push(arrow([[x + n._aw, Y(n.y) + 10], [sx - 4, Y(n.y) + 10]]));
        // alamat hardwire di baris pertama (yang dicari di panel), nama simbolnya di bawah
        if (n._sensCh) {
          o.push(spans(sx, Y(n.y) + 14, [{ t: n._sensCh, c: 'b' }, { t: ' on' }], 12));
          o.push(txt(sx, Y(n.y) + 28, n._sens, 10, 'b'));
        } else {
          o.push(txt(sx, Y(n.y) + 14, n._sens, 11, 'b'));
          o.push(txt(sx, Y(n.y) + 28, 'on', 12));
        }
        n._out = [sx + Math.max(tw(n._sensCh + ' on', 12), tw(n._sens, 11)) + 4, Y(n.y) + 10];
      }
      if (n.timer) o.push(txt(x + 2, y + n.h + 2, 'Delay ' + n.timer.pt + ' ' + n.timer.inst, 10, 'b'));
    } else if (n.kind === 'judge') {
      const cx = x + n.w / 2, cy = y + n.h / 2;
      o.push(`<path d="M${x},${cy} L${cx},${y} L${x + n.w},${cy} L${cx},${y + n.h} Z" class="ln"/>`);
      n._t.forEach((l, i) => o.push(txt(cx, cy - 2 + (i - (n._t.length - 1) / 2) * 13 + 4, l, 11, '', 'middle')));
      n._in = [x, cy]; n._out = [x + n.w, cy]; n._down = [cx, y + n.h];
      if (n.timer) o.push(txt(x, y - 4, 'Delay ' + n.timer.pt + ' ' + n.timer.inst, 10, 'b'));
    } else if (n.kind === 'delay') {
      o.push(txt(x + 2, y + 18, 'Delay ' + (n.timer ? n.timer.pt : ''), 12));
      o.push(txt(x + 2, y + 32, n.timer ? n.timer.inst : '', 11, 'b'));
      n._in = [x - 2, y + 14]; n._out = [x + n.w - 10, y + 14];
    } else {
      o.push(`<rect x="${x}" y="${y}" width="${n.w}" height="${n.h}" class="ln"/>`);
      let yy = y + 15;
      n._t.forEach(l => { o.push(txt(x + 5, yy, l, 12, 'ttl')); yy += 15; });
      if (n.timer) { o.push(txt(x + 5, yy, 'Delay ' + n.timer.pt + '  ' + n.timer.inst, 11, 'b')); yy += 14; }
      n._c.forEach(c => { o.push(spans(x + 12, yy, condParts(c, 38), 10)); o.push(line([[x + 5, yy - 4], [x + 10, yy - 4]], ' class="thin"')); yy += 13; });
      if (n._more > 0) o.push(txt(x + 12, yy, '+' + n._more + ' more (rung ' + n.rung + ')', 10));
      n._in = [x, y + 18]; n._out = [x + n.w, y + 18];
    }
  });

  // --- panah antarlangkah. Label bit di ruas terakhir, dekat tujuan - seperti LB412 di acuan.
  nodes.forEach(n => {
    const ins = n.after.map(a => ({ a, p: a.id === 'start' ? START : by.get(a.id) })).filter(z => z.p);
    ins.forEach(({ a, p }, k) => {
      const src = p === START ? startOut : (p.kind === 'judge' && p._down && a.bit !== (p.outs[0] || {}).bit ? p._down : p._out);
      const dst = n._in;
      const down = p.kind === 'judge' && src === p._down;
      // Label bit: di ujung TUJUAN kalau cuma satu panah masuk; di ujung ASAL kalau beberapa
      // panah bertemu di satu titik (gabungan paralel) - di tujuan semuanya jatuh di koordinat
      // yang sama dan bertumpuk jadi satu tulisan yang tidak terbaca (LB427 di atas LB429).
      const join = n.after.length > 1;
      if ((p === START ? 0 : p.row) === n.row) {
        const xm = Math.max(src[0] + 8, dst[0] - 52);
        const pts = down ? [src, [src[0], dst[1]], [dst[0], dst[1]]]
          : Math.abs(src[1] - dst[1]) < 1 ? [src, dst] : [src, [xm, src[1]], [xm, dst[1]], dst];
        o.push(arrow(pts));
        if (join) o.push(txt(down ? src[0] + 4 : src[0] + 4, down ? src[1] + 14 : src[1] - 4, a.bit, 10, 'b'));
        else o.push(txt(dst[0] - 6, dst[1] - 4, a.bit, 10, 'b', 'end'));
      } else {
        // Pindah baris: konektor berhuruf di dua ujung, bukan garis balik.
        const lab = letterOf(L.conn.n++);
        if (down) {
          o.push(arrow([src, [src[0], src[1] + 20]]));
          o.push(connector(src[0], src[1] + 30, lab));
          o.push(txt(src[0] + 14, src[1] + 16, a.bit, 10, 'b'));
        } else {
          o.push(arrow([src, [src[0] + 50, src[1]]]));
          o.push(connector(src[0] + 60, src[1], lab));
          o.push(txt(src[0] + 2, src[1] - 5, a.bit, 10, 'b'));
        }
        o.push(connector(dst[0] - 44, dst[1], lab));
        o.push(arrow([[dst[0] - 34, dst[1]], dst]));
      }
      if (join && k === 0) o.push(txt(dst[0] - 8, dst[1] - 16, 'AND', 10, '', 'end'));
    });
    // jalan keluar ke "1 cycle complete"
    const hasSucc = nodes.some(m => m.after.some(a => a.id === n.id));
    (n.toEnd || []).forEach(bit => {
      const toSide = !hasSucc || (n.kind !== 'judge');
      if (toSide && !hasSucc) {
        const [sx, sy2] = n._out;
        const ex = sx + 48;
        o.push(arrow([[sx, sy2], [ex, sy2]]));
        o.push(`<rect x="${ex}" y="${sy2 - 7}" width="14" height="14" class="ln"/>`);
        o.push(txt(ex - 2, sy2 - 11, bit, 10, 'b', 'end'));
        o.push(txt(ex + 20, sy2 + 4, station.complete || '', 11, 'b'));
      } else {
        const s = n._down || [n._out[0] - 20, Y(n.y + n.h)];
        const ey = s[1] + 24;
        o.push(arrow([s, [s[0], ey], [s[0] + 26, ey]]));
        const cm = ((n.outs || []).find(x => x.bit === bit) || {}).cmt || '';
        o.push(spans(s[0] + 30, ey + 4, [{ t: bit, c: 'b' }, { t: ' on' + (cm ? '_' + cm : '') + '  → ' }, { t: station.complete || '', c: 'b' }], 10));
        if (n.kind === 'judge') o.push(txt(s[0] + 4, s[1] + 12, 'N', 10));
      }
    });
    if (n.kind === 'judge') o.push(txt(n._out[0] + 3, n._out[1] - 5, 'Y', 10));
  });
  return o.join('\n');
}

// Kotak putus-putus berisi syarat bit gerbang varian: "[ LB300 ... ]".
function condBox(tree, x, y, w) {
  const items = (tree && tree.items) || [];
  const o = [];
  const lines = [];
  items.forEach(it => {
    lines.push({ lvl: 0, c: it });
    (it.kids || []).slice(0, 6).forEach(k => lines.push({ lvl: 1, c: k }));
  });
  const shown = lines.slice(0, 14);
  const h = 38 + shown.length * 16 + (lines.length > shown.length ? 14 : 0) + 8;
  o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="dash"/>`);
  o.push(txt(x + 10, y + 20, '[ ' + tree.bit + ' ' + (tree.cmt || '').toUpperCase() + ' ]', 12, 'ttl'));
  let yy = y + 42;
  const tx = x + 20;
  if (shown.length) o.push(line([[tx, y + 30], [tx, yy + (shown.length - 1) * 16 - 4]], ' class="thin"'));
  shown.forEach(l => {
    const lx = tx + (l.lvl ? 24 : 0);
    if (l.lvl) o.push(line([[tx + 16, yy - 16], [tx + 16, yy - 4]], ' class="thin"'));
    o.push(arrow([[lx + 26, yy - 4], [lx + 2, yy - 4]], ' class="thin"'));
    o.push(spans(lx + 30, yy, condParts(l.c, Math.floor((w - (lx - x) - 40) / 6)), 11));
    yy += 16;
  });
  if (lines.length > shown.length) o.push(txt(tx + 30, yy, '+' + (lines.length - shown.length) + ' more', 10));
  return { svg: o.join('\n'), h };
}

// ------------------------------------------------------------------ halaman station
function stationPages(st, opt) {
  const heading = (st.name || st.key).replace(/_/g, ' ').toUpperCase() + ' (' + (st.program.split('_')[0]) + ')';
  const innerW = FW - 120;
  const blocks = [];
  const conn = { n: 0 };
  st.variants.forEach(v => {
    if (!v.nodes.length) return;
    const L = layoutVariant(v, st, innerW - 40);
    L.conn = conn;
    const h = L.height + 64;
    blocks.push({ h, draw: (y) => {
      const x0 = FX + 50;
      return [
        `<rect x="${x0}" y="${y}" width="${innerW}" height="${h - 16}" class="thin"/>`,
        spans(x0 + 8, y + 16, [{ t: v.bit, c: 'b' }, { t: '  ' + (v.bitCmt || v.name) }], 11),
        drawVariant(L, x0 + 40, y + 34, innerW - 60),
      ].join('\n');
    } });
  });
  if (!blocks.length) blocks.push({ h: 40, draw: y => txt(FX + 50, y + 20, 'No automatic sequence found in section ' + (st.section || 'AutoRunning') + '.', 13) });

  // kotak syarat gerbang, disusun mengalir 3 per baris
  const trees = st.variants.map(v => v.gateExpr).filter(t => t && t.items && t.items.length)
    .filter((t, i, a) => a.findIndex(u => u.bit === t.bit) === i);
  const bw = 440, per = 3;
  for (let i = 0; i < trees.length; i += per) {
    const row = trees.slice(i, i + per).map(t => condBox(t, 0, 0, bw));
    const h = Math.max(...row.map(r => r.h)) + 20;
    const grp = trees.slice(i, i + per);
    blocks.push({ h, draw: (y) => grp.map((t, k) => condBox(t, FX + 50 + k * (bw + 30), y, bw).svg).join('\n') });
  }
  return paginate(blocks, heading);
}

function paginate(blocks, heading) {
  const pages = [];
  const cap = CONTENT_BOTTOM - CONTENT_TOP;
  let cur = [], y = CONTENT_TOP;
  blocks.forEach(b => {
    // Varian yang lebih tinggi dari satu halaman (4 lajur paralel, misalnya) DIKECILKAN, bukan
    // dipotong: potongan di halaman berikutnya memutus panah di tengah jalan.
    const k = b.h > cap ? cap / b.h : 1;
    const h = b.h * k;
    if (cur.length && y + h > CONTENT_BOTTOM) { pages.push(cur); cur = []; y = CONTENT_TOP; }
    cur.push(k < 1 ? `<g transform="translate(${FX + 50} ${y}) scale(${k.toFixed(4)}) translate(${-(FX + 50)} ${-y})">${b.draw(y)}</g>` : b.draw(y));
    y += h + 14;
  });
  if (cur.length) pages.push(cur);
  return pages.map(p => ({ heading, body: p.join('\n') }));
}

// ------------------------------------------------------------------ halaman main
// Susunan lembar acuan MAIN CIRCUIT (P010), dari atas:
//   [PLC NORMAL / FUSE NORMAL / SAFETY OK / NO FAULT]  ->  PB MASTER ON -> MASTER ON CONF ->
//   AIR SOURCE (PS) -> bus TEGAK turun ke jalur AUTORUN; input lain (SS AUTO/IND, auto stop, ...)
//   masuk ke bus yang sama dari kiri. Bus itu berlabel bit penampungnya (LB119).
//   AUTO RUN ----- AUTORUN LB120 ---> (O) -> [program station] --+
//                                      ^-------------------------+  <- LB499_on / LB121_off
//   Di bawah jalur: grup syarat berkurung (home position, auto condition) dengan bus naik.
// Rantai MASTER memakai nama simbol STANDAR generator (genname std) - itulah yang membuatnya
// bisa dikenali di program mana pun yang lahir dari generator. Yang tidak ada, dilewati.
const TRIVIAL = /^(GSB00\d|P_On|P_Off)$/;
function hasVar(it, v) { return it.var === v || (it.kids || []).some(k => hasVar(k, v)); }
const withAddr = (v, cm) => [{ t: v, c: 'b' }].concat(addrOf(v) ? [{ t: ' (' + addrOf(v) + ')', c: 'b' }] : [], [{ t: '  ' + (cm || '') }]);

function mainPage(flow) {
  const m = flow.main;
  if (!m) return [];
  const o = [];
  o.push(txt(FX + 30, FY + 40, 'FLOW PROCESS', 15, 'ul'));
  const items = ((m.tree && m.tree.items) || []).filter(it => !TRIVIAL.test(it.var));
  const pb = items.find(it => /^PB_/.test(it.var) && !it.nc);
  // grup "loop otomatis" = item yang di dalamnya ada konfirmasi master (LB119 -> LB110 -> MSTR_RDY)
  const loop = items.find(it => it !== pb && (it.kids || []).length && hasVar(it, 'MSTR_RDY'));
  const conds = items.filter(it => it !== pb && it !== loop && it.var !== m.autorun && !it.nc)
    .filter((it, i, a) => a.findIndex(x => x.var === it.var) === i);
  const Ym = 440, xs = FX + 960;
  let xb = FX + 640;

  // --- jalur AUTO RUN
  if (pb) o.push(spans(FX + 40, Ym + 4, withAddr(pb.var, pb.cmt), 13));
  o.push(line([[FX + 70 + tw(pb ? pb.var + ' (' + addrOf(pb.var) + ')  ' + (pb.cmt || '') : '', 13), Ym], [xs - 110, Ym]], ' class="ln"'));
  o.push(txt(xs - 170, Ym - 8, 'AUTORUN', 13));
  o.push(txt(xs - 170, Ym + 16, m.autorun, 13, 'b'));

  // --- bagian MASTER + bus LB119
  if (loop) {
    let g = loop;
    while ((g.kids || []).length === 1 && (g.kids[0].kids || []).length) g = g.kids[0];
    const leaves = (g.kids || []).filter(x => !TRIVIAL.test(x.var) && !x.nc)
      .filter((x, i, a) => a.findIndex(y => y.var === x.var) === i);
    const chain = ['PB_MSTR_ON', 'MSTR_RDY', 'AIR_SC_CONF'].filter(v => ADDR[v] || leaves.some(x => x.var === v));
    const inputs = leaves.filter(x => chain.indexOf(x.var) < 0);
    let y = 150;
    const topBus = y + 110;
    if (chain.length) {
      // syarat berkurung di atas rantai master
      const pre = ['PLC NORMAL'].concat(
        ADDR.FUSE_GOOD ? ['FUSE NORMAL (' + ADDR.FUSE_GOOD + ')'] : [],
        ADDR.SAFE_CONF ? ['SAFETY OK (' + ADDR.SAFE_CONF + ')'] : [],
        ADDR.NOT_EMG_STOP ? ['EMERGENCY STOP PB off (' + ADDR.NOT_EMG_STOP + ')'] : [], ['NO FAULT']);
      const px = FX + 150, bw = 250;
      pre.forEach((t, i) => o.push(txt(px, y + i * 17, t, 12)));
      const bb = y + (pre.length - 1) * 17 + 6;
      o.push(`<path d="M${px + bw - 8},${y - 16} q8,4 8,12 V${bb - 6} q0,8 -8,12" class="thin"/>`);
      const my = bb + 50;
      const xArrow = px + bw + 40;
      o.push(arrow([[px + bw, (y - 16 + bb + 6) / 2], [xArrow, (y - 16 + bb + 6) / 2], [xArrow, my - 2]], ' class="thin"'));
      // rantai: PB MASTER ON -> MSTR_RDY -> AIR SOURCE -> bus. Posisi dihitung dulu, bus-nya
      // ditaruh SESUDAH ujung rantai - kalau tidak, garis bus menembus teks elemen terakhir.
      let cx = FX + 40;
      const pos = chain.map((v, i) => {
        const it = leaves.find(x => x.var === v) || { var: v, cmt: '' };
        const label = { PB_MSTR_ON: 'MASTER ON', MSTR_RDY: 'MASTER ON CONF', AIR_SC_CONF: 'AIR SOURCE on' }[v] || (it.cmt || v) + ' on';
        const w = Math.max(tw(v + ' ' + addrOf(v), 12), tw(label, 11));
        const x = i === 1 ? Math.max(cx, xArrow + 24) : cx;
        cx = x + w + 60;
        return { v, label, w, x };
      });
      xb = Math.min(Math.max(xb, cx - 10), xs - 190);
      pos.forEach((p, i) => {
        o.push(spans(p.x, my + 4, [{ t: p.v, c: 'b' }].concat(addrOf(p.v) ? [{ t: ' ' + addrOf(p.v), c: 'b' }] : []), 12));
        o.push(txt(p.x, my + 19, p.label, 11));
        o.push(arrow([[p.x + p.w + 6, my], [(i === pos.length - 1 ? xb : pos[i + 1].x) - 4, my]]));
      });
      y = my;
    }
    // input lain ke bus
    let iy = Math.max(y + 36, topBus);
    inputs.forEach(x => {
      const parts = condParts(x, 50);
      const w = tw(parts.map(p => p.t).join(''), 12);
      o.push(spans(xb - 56 - w, iy + 4, parts, 12));
      o.push(arrow([[xb - 48, iy], [xb - 2, iy]], ' class="thin"'));
      iy += 24;
    });
    o.push(arrow([[xb, Math.min(y, topBus)], [xb, Ym - 2]]));
    o.push(txt(xb - 4, Ym - 14, loop.var, 10, 'b', 'end'));
  }

  // --- station: lingkaran siklus -> kotak -> loop balik dengan umpan complete / cycle stop
  const sts = flow.stations;
  const cx = xs - 90;
  o.push(arrow([[xs - 110, Ym], [cx - 11, Ym]]));
  o.push(`<circle cx="${cx}" cy="${Ym}" r="10" class="ln wh"/>`);
  const top = Ym - (sts.length - 1) * 30, bw = 300;
  o.push(line([[cx + 10, Ym], [xs - 40, Ym]], ' class="ln"'));
  if (sts.length > 1) o.push(line([[xs - 40, top], [xs - 40, top + (sts.length - 1) * 60]], ' class="ln"'));
  const xr = xs + bw + 30, yl = top + (sts.length - 1) * 60 + 110;
  sts.forEach((s, i) => {
    const y = top + i * 60;
    o.push(arrow([[xs - 40, y], [xs - 6, y]]));
    o.push(`<rect x="${xs}" y="${y - 20}" width="${bw}" height="40" class="ln"/>`);
    o.push(`<rect x="${xs - 5}" y="${y - 5}" width="10" height="10" class="ln wh"/>`);
    o.push(`<rect x="${xs + bw - 5}" y="${y - 5}" width="10" height="10" class="ln wh"/>`);
    o.push(txt(xs + bw / 2, y - 3, s.program, 13, '', 'middle'));
    o.push(txt(xs + bw / 2, y + 13, '(Refer to the operation diagram)', 10, '', 'middle'));
    o.push(line([[xs + bw + 5, y], [xr, y]], ' class="ln"'));
  });
  o.push(line([[xr, top], [xr, yl], [cx, yl]], ' class="ln"'));
  o.push(arrow([[cx, yl], [cx, Ym + 12]]));
  const cpl = (sts.find(s => s.complete) || {}).complete || 'LB499';
  const fb = [[cpl + '_on', '1 Cycle Complete']].concat(m.stop ? [[m.stop.bit + '_off', 'No Cycle Stop']] : []);
  fb.forEach(([b, t], i) => {
    const y = top + (sts.length - 1) * 60 + 48 + i * 24;
    o.push(arrow([[cx + 26, y], [cx + 2, y]], ' class="thin"'));
    o.push(spans(cx + 30, y + 4, [{ t: b, c: 'b' }, { t: ' ' + t }], 12));
  });

  // --- grup syarat di bawah jalur, bus naik
  const COLW = 380, GAP = 30, TOPY = Ym + 56;
  let col = 0, gy = TOPY;
  const busBottom = [];
  conds.forEach(c => {
    const lines = [{ lvl: 0, c }].concat((c.kids || []).filter(k => !TRIVIAL.test(k.var)).flatMap(k =>
      [{ lvl: 1, c: k }].concat((k.kids || []).filter(g => !TRIVIAL.test(g.var)).slice(0, 6).map(g => ({ lvl: 2, c: g })))));
    const shown = lines.slice(0, 16);
    const h = shown.length < 2 ? 24 : 26 + (shown.length - 1) * 15 + (lines.length > shown.length ? 14 : 0) + 12;
    if (gy + h > CONTENT_BOTTOM && gy > TOPY) { col++; gy = TOPY; }
    const gx = FX + 40 + col * (COLW + GAP), w = COLW - 10;
    o.push(spans(gx, gy, condParts(c, 56), 12));
    const by0 = gy + 10, by1 = gy + h - 10;
    if (shown.length > 1) {
      o.push(`<path d="M${gx + 8},${by0} q-8,4 -8,12 V${by1 - 12} q0,8 8,12" class="thin"/>`);
      o.push(`<path d="M${gx + w - 8},${by0} q8,4 8,12 V${by1 - 12} q0,8 -8,12" class="thin"/>`);
      const lastTop = [by0 + 12, by0 + 12, 0];
      shown.slice(1).forEach((l, i) => {
        const ly = by0 + 22 + i * 15, lx = gx + 18 + (l.lvl - 1) * 22;
        o.push(line([[lx, lastTop[l.lvl] || ly - 19], [lx, ly - 4], [lx + 14, ly - 4]], ' class="thin"'));
        lastTop[l.lvl] = ly - 4;
        if (l.lvl === 1) lastTop[2] = ly;
        o.push(spans(lx + 18, ly, condParts(l.c, Math.floor((w - (lx - gx) - 30) / 6.6)), 11));
      });
      if (lines.length > shown.length) o.push(txt(gx + 36, by0 + 22 + (shown.length - 1) * 15 + 14, '+' + (lines.length - shown.length) + ' more', 10));
    }
    const busX = gx + COLW + 6, my = gy - 4;
    o.push(line([[Math.min(busX - 4, gx + tw(c.var + ' on_' + (c.cmt || ''), 12) + 8 + (addrOf(c.var) ? 60 : 0)), my], [busX, my]], ' class="thin"'));
    busBottom[col] = Math.max(busBottom[col] || 0, my);
    gy += h + 14;
  });
  busBottom.forEach((yb, c) => {
    const busX = FX + 40 + c * (COLW + GAP) + COLW + 6;
    o.push(arrow([[busX, yb], [busX, Ym + 2]], ' class="thin"'));
  });
  return [{ heading: 'MAIN CIRCUIT (' + m.program.split('_')[0] + ')', headY: FY + 62, body: o.join('\n') }];
}

// ------------------------------------------------------------------ dokumen
const CSS = `
@page{size:A3 landscape;margin:0}
html,body{margin:0;background:#8a8f98}
body{font-family:${FONT}}
.page{width:420mm;height:297mm;margin:10mm auto;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.35);break-after:page;page-break-after:always}
.page svg{width:100%;height:100%;display:block}
@media print{html,body{background:#fff}.page{margin:0;box-shadow:none}}
svg text{font-family:${FONT};fill:#000}
svg .b{fill:#1a3fc4} svg .r{fill:#d0021b} svg .ttl{font-weight:bold} svg .ul{text-decoration:underline}
svg polyline,svg path,svg rect,svg circle{fill:none;stroke:#000;stroke-width:1.1}
svg .thin{stroke-width:.8} svg .fr{stroke-width:1.6} svg .hd{stroke:#1a3fc4;stroke-width:1.2}
svg .dash{stroke-dasharray:4 3;stroke-width:.9} svg .wh{fill:#fff}
svg #ah path{fill:#000;stroke:none}
`;

function render(j, opt) {
  // flag CLI yang tidak diisi datang sebagai undefined - jangan sampai menimpa bawaannya
  const given = Object.fromEntries(Object.entries(opt || {}).filter(([, v]) => v !== undefined));
  opt = Object.assign({ title: 'FLOW PROCESS DIAGRAM', subject: (j.source && j.source.solution) || '' }, given);
  const flow = j.flow || { stations: [] };
  ADDR = Object.assign({}, flow.addr || {});
  if (!flow.addr) (j.ioTable || []).forEach(r => { if (r.symbol) ADDR[r.symbol] = r.ch; });
  const pages = [].concat(mainPage(flow), ...flow.stations.map(s => stationPages(s, opt)));
  const svgs = pages.map((p, i) => `<div class="page"><svg viewBox="0 0 ${PW} ${PH}" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 Z"/></marker></defs>
${frame(opt, i + 1, pages.length, p.heading, p.headY)}
${p.body}
</svg></div>`);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(opt.subject || 'Flow Process')} - Flow Process Diagram</title>
<style>${CSS}</style></head>
<body>
${svgs.join('\n')}
</body></html>
`;
}

module.exports = { render, layoutVariant, wrap };

if (require.main === module) {
  const a = process.argv.slice(2);
  if (a.length < 2) {
    console.error('pakai: node scripts/flowdoc.js <project.json> <out.html> [--company X] [--dwg X] [--subject X]');
    process.exit(2);
  }
  const val = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const j = JSON.parse(fs.readFileSync(a[0], 'utf8'));
  if (!j.flow) { console.error('JSON ini tidak punya `flow` - buat dulu dengan scripts/smc2_project.js'); process.exit(2); }
  fs.writeFileSync(a[1], render(j, { company: val('--company'), dwg: val('--dwg'), subject: val('--subject') }), 'utf8');
  console.log('WROTE ' + a[1] + '  (buka di browser, Ctrl+P -> A3 landscape, margin none)');
}
