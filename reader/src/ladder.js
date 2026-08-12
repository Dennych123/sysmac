// Rekonstruksi logika rung + penggambar ladder SVG.
//
// Dua hal yang dijaga di sini:
//   1. Ekspresi boolean-nya JUJUR - cabang bersarang yang disederhanakan SELALU
//      ditandai, karena ekspresi yang salah susun tetap terlihat masuk akal, dan
//      itulah yang berbahaya kalau dipercaya mentah-mentah engineer maupun LLM.
//   2. Gambarnya mengikuti tata letak Sysmac Studio - nama operand di atas
//      simbol, komentar hijau di bawah - supaya rung yang sama bisa ditaruh
//      berdampingan dengan layar Studio dan langsung dibandingkan.
if (typeof require !== 'undefined') {
  var { esc } = require('./env.js');
  var { VCMT, VGLOB } = require('./symbols.js');
}

// =================================================== rekonstruksi logika rung
// Format JSON (Studio >= 1.66) menyimpan posisi grid: X = kolom, Y = baris
// (0 = jalur utama). Dari situ seri/paralel bisa disusun ulang tanpa menelusuri
// sambungan: satu baris kolom menaik = seri (AND); baris >0 yang menutupi
// rentang kolom yang sama = cabang paralel (OR).
// Cabang bersarang disederhanakan jadi satu tingkat dan ditandai '~'.
function elLabel(e) {
  if (e.func) return e.func + '()';
  return (e.nc || e.neg ? '/' : '') + e.var;
}
function rungExpr(rung) {
  const els = rung.elements.filter(e => e.var || e.func);
  const outs = els.filter(e => e.kind === 'Coil').map(elLabel);
  const ins = els.filter(e => e.kind !== 'Coil');
  if (!ins.length) return { expr: '', outs, approx: false };

  const hasXY = ins.some(e => 'x' in e || 'y' in e);
  if (!hasXY) return { expr: ins.map(elLabel).join(' AND '), outs, approx: ins.length > 1 };

  const grid = new Map();
  let maxc = 0;
  ins.forEach(e => {
    const y = e.y || 0, x = e.x || 0;
    if (!grid.has(y)) grid.set(y, new Map());
    grid.get(y).set(x, e);
    if (x > maxc) maxc = x;
  });

  const branches = [];
  [...grid.keys()].filter(y => y).sort((a, b) => a - b).forEach(y => {
    const cols = [...grid.get(y).keys()].sort((a, b) => a - b);
    let run = [cols[0]];
    for (let i = 1; i < cols.length; i++) {
      if (cols[i] === run[run.length - 1] + 1) run.push(cols[i]);
      else { branches.push([run[0], run[run.length - 1], y]); run = [cols[i]]; }
    }
    branches.push([run[0], run[run.length - 1], y]);
  });

  const main = grid.get(0) || new Map();
  const parts = [];
  let c = 0, approx = false;
  while (c <= maxc) {
    const here = branches.filter(b => b[0] === c);
    if (here.length) {
      const end = Math.max(...here.map(b => b[1]));
      const alts = [];
      const m = [];
      for (let i = c; i <= end; i++) if (main.has(i)) m.push(elLabel(main.get(i)));
      if (m.length) alts.push(m.join(' AND '));
      here.forEach(([b0, b1, y]) => {
        const seg = [];
        for (let i = b0; i <= b1; i++) if (grid.get(y).has(i)) seg.push(elLabel(grid.get(y).get(i)));
        if (seg.length) alts.push(seg.join(' AND '));
      });
      if (here.length > 1 || branches.some(b => b[0] > c && b[0] <= end)) approx = true;
      parts.push('(' + alts.join(' OR ') + ')');
      c = end + 1;
    } else {
      if (main.has(c)) parts.push(elLabel(main.get(c)));
      c++;
    }
  }
  return { expr: parts.join(' AND '), outs, approx };
}

// Gambar ladder sebagai SVG dari grid yang sama. Bukan replika Sysmac Studio,
// tapi harus JUJUR soal bentuk rangkaian - dan itu berarti kabelnya benar-benar
// digambar: garis mendatar antar elemen, dan LINK VERTIKAL di titik cabang.
// Tanpa link vertikal, empat kontak paralel tampak seperti empat kontak lepas
// yang tidak nyambung ke mana pun. Itu bukan sekadar jelek - itu salah baca.
// Tata letaknya mengikuti Sysmac Studio: NAMA operand di ATAS simbol, KOMENTAR
// (hijau) di BAWAHnya. Bukan sekadar selera - itu yang bikin rung kebaca tanpa
// menghafal nama bit, dan itu juga yang dilihat orang di layar Studio, jadi dua
// gambar untuk rung yang sama bisa dibandingkan langsung.
const LAD = { CW: 150, RH: 86, PAD: 12, HG: 8, AR: 12,
              NW: 23, CmtW: 21,          // batas karakter per baris nama / komentar
              FBW: 104, HDR: 18, PINH: 16 };

/** Potong nama jadi maksimal 2 baris, patah di titik/kurung kalau bisa. */
function ladWrap(s, n) {
  s = String(s || '');
  if (s.length <= n) return [s];
  // Nama PLC panjang biasanya berstruktur (PLC_ERR_STA.PLC_ERR_BOOL[7]) -
  // patah di pemisahnya jauh lebih kebaca daripada dipotong di tengah kata.
  // Titik dan kurung memisahkan BAGIAN nama, garis bawah cuma memisahkan kata,
  // jadi titik/kurung didahulukan biar patahannya jatuh di batas yang berarti.
  let cut = -1;
  for (const seps of ['.[', '_']) {
    for (let i = 0; i < s.length; i++) {
      if (seps.includes(s[i]) && i <= n && i > n / 3) cut = i;
    }
    if (cut >= 0) break;
  }
  if (cut < 0) cut = n;
  const a = s.slice(0, cut), b = s.slice(cut);
  return [a, b.length > n ? b.slice(0, n - 1) + '…' : b];
}

function ladderHtml(rung) {
  const els = (rung.elements || []).filter(e => e.var || e.func);
  const ins = els.filter(e => e.kind !== 'Coil');
  const outs = els.filter(e => e.kind === 'Coil');
  if (!ins.length && !outs.length) return '';

  // Studio <= 1.56 tidak menyimpan koordinat sama sekali. Tata letaknya tidak
  // bisa dipulihkan, jadi digambar seri menurut urutan dokumen - ekspresi di
  // atasnya sudah ditandai `~`, jadi tidak ada yang mengira ini presisi.
  const hasXY = els.some(e => 'x' in e || 'y' in e);

  const at = new Map();
  let maxc = 0, maxr = 0;
  ins.forEach((e, i) => {
    const x = hasXY ? (e.x || 0) : i, y = hasXY ? (e.y || 0) : 0;
    at.set(y + ':' + x, e);
    if (x > maxc) maxc = x;
    if (y > maxr) maxr = y;
  });
  if (maxc > 13) return '';   // rung raksasa: ekspresinya saja lebih terbaca

  // Lebar BAKU 6 kontak + 1 coil, seperti Studio. Rung pendek tetap memakai
  // pitch kolom yang sama, jadi rung berurutan lurus segaris dan coil-nya
  // sekolom - itu yang bikin satu section kebaca sebagai satu aliran, bukan
  // sebagai kotak-kotak yang lebarnya beda-beda. Rung yang memang lebih panjang
  // dari 6 kolom tetap dibiarkan memanjang.
  maxc = Math.max(maxc, 5);

  // Coil ditaruh di barisnya sendiri. Rung langkah gerakan punya DUA coil di
  // baris berbeda - kalau ditumpuk jadi satu sel, urutannya hilang.
  const crow = outs.map((o, i) => (hasXY ? (o.y || 0) : i));
  crow.forEach(y => { if (y > maxr) maxr = y; });

  const { CW, RH, PAD, HG, AR, NW, CmtW, FBW, HDR, PINH } = LAD;
  const railL = PAD + 4;
  const colX = c => railL + 12 + c * CW;
  const coilC = maxc + 1;
  const railR = colX(coilC) + CW;
  const W = railR + PAD + 4, H = PAD * 2 + (maxr + 1) * RH;
  const rowY = r => PAD + 34 + r * RH;
  const cx = c => colX(c) + CW / 2;

  const o = [];
  const line = (x1, y1, x2, y2, cls) =>
    o.push(`<line class="${cls || 'w'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);

  // NAMA di atas simbol. Kalau butuh dua baris, baris TERAKHIR yang menempel ke
  // simbol - biar jarak nama-ke-simbol selalu sama berapa pun panjang namanya.
  function nameAbove(x, y, t, cls) {
    const ln = ladWrap(t, NW);
    ln.forEach((s, i) => o.push(
      `<text class="nm ${cls || ''}" x="${x}" y="${y - 18 - (ln.length - 1 - i) * 11}">${esc(s)}</text>`));
  }
  // KOMENTAR di bawah simbol, hijau, dipatah per KATA (komentar itu kalimat,
  // bukan nama - dipatah di tengah kata jadi tidak kebaca).
  function cmtBelow(x, y, v) {
    const t = VCMT.get(v);
    if (!t) return;
    const words = String(t).split(/\s+/), ln = [];
    let cur = '';
    for (const w of words) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= CmtW) cur += ' ' + w;
      else { ln.push(cur); cur = w; if (ln.length === 2) break; }
    }
    if (ln.length < 3 && cur) ln.push(cur);
    ln.slice(0, 3).forEach((s, i) => o.push(
      `<text class="cmt" x="${x}" y="${y + 22 + i * 11}">${esc(s)}</text>`));
  }
  const opClass = v => VGLOB.has(v) ? 'og' : '';

  // --- rel kiri & kanan, setinggi seluruh rung ---
  line(railL, rowY(0) - 14, railL, rowY(maxr) + 14, 'rail');
  line(railR, rowY(0) - 14, railR, rowY(maxr) + 14, 'rail');

  // --- simbol ---
  const gap = [];                       // [baris, x0, x1] potongan kabel yang TIDAK digambar
  function contact(e, c, r) {
    const X = cx(c), Y = rowY(r), nc = !!e.nc, k = nc ? 'sy ncc' : 'sy';
    line(X - HG, Y - 11, X - HG, Y + 11, k);
    line(X + HG, Y - 11, X + HG, Y + 11, k);
    if (nc) line(X - HG - 3, Y + 10, X + HG + 3, Y - 10, k);
    if (e.edge) o.push(`<text class="ed" x="${X}" y="${Y + 4}">${e.edge === 'rising' ? '↑' : '↓'}</text>`);
    nameAbove(X, Y, e.var, opClass(e.var));
    cmtBelow(X, Y, e.var);
    gap.push([r, X - HG, X + HG]);
  }

  // Blok fungsi digambar seperti di Studio: kotak dengan NAMA instruksi di kepala
  // dan PIN bernama di kiri (masukan) dan kanan (keluaran). Operand yang nempel
  // ke tiap pin ditulis di sebelah pin-nya. Kalau file-nya tidak membawa daftar
  // pin, kotaknya tetap digambar dengan nama saja - lebih jujur daripada menebak
  // pin apa yang dipunya instruksi itu.
  function fbox(e, c, r) {
    const X = cx(c), Y = rowY(r);
    const nm = String(e.func || e.var || '?');
    const pins = e.pins || {}, pin = { in: pins.in || [], out: pins.out || [] };
    const rows = Math.max(pin.in.length, pin.out.length, 0);
    const wNeed = Math.max(FBW, nm.length * 7 + 20,
      ...Array.from({ length: rows }, (_, i) =>
        ((pin.in[i] && pin.in[i].name || '').length + (pin.out[i] && pin.out[i].name || '').length) * 6.2 + 26));
    const w = Math.min(CW - 8, wNeed);
    const top = Y - HDR - PINH / 2, h = HDR + Math.max(rows, 1) * PINH + 4;
    o.push(`<rect class="fb" x="${X - w / 2}" y="${top}" width="${w}" height="${h}"/>`);
    o.push(`<line class="fbsep" x1="${X - w / 2}" y1="${top + HDR}" x2="${X + w / 2}" y2="${top + HDR}"/>`);
    o.push(`<text class="fn" x="${X}" y="${top + 13}">${esc(nm)}</text>`);
    for (let i = 0; i < rows; i++) {
      const py = top + HDR + PINH / 2 + i * PINH + 4;
      const pi = pin.in[i], po = pin.out[i];
      if (pi) {
        o.push(`<text class="pin" x="${X - w / 2 + 5}" y="${py}">${esc(pi.name)}</text>`);
        line(X - w / 2 - 12, py - 4, X - w / 2, py - 4);
        if (pi.operand) o.push(`<text class="opd r" x="${X - w / 2 - 15}" y="${py}">${esc(pi.operand)}</text>`);
      }
      if (po) {
        o.push(`<text class="pin r" x="${X + w / 2 - 5}" y="${py}">${esc(po.name)}</text>`);
        line(X + w / 2, py - 4, X + w / 2 + 12, py - 4);
        if (po.operand) o.push(`<text class="opd" x="${X + w / 2 + 15}" y="${py}">${esc(po.operand)}</text>`);
      }
    }
    gap.push([r, X - w / 2, X + w / 2]);
  }

  // Coil = LINGKARAN PENUH, seperti di Studio. Dulu digambar dua busur "( )" -
  // itu gaya cetak mnemonic, bukan yang dilihat di layar Studio.
  function coil(c, r) {
    const X = cx(coilC), Y = rowY(r);
    const m = c.set ? 'S' : c.reset ? 'R' : c.neg ? '/' : '';
    o.push(`<circle class="sy co" cx="${X}" cy="${Y}" r="${AR}"/>`);
    if (m) o.push(`<text class="cm" x="${X}" y="${Y + 4}">${m}</text>`);
    nameAbove(X, Y, c.var, opClass(c.var));
    cmtBelow(X, Y, c.var);
    gap.push([r, X - AR, X + AR]);
  }

  for (let r = 0; r <= maxr; r++) {
    for (let c = 0; c <= maxc; c++) {
      const e = at.get(r + ':' + c);
      if (e) (e.kind === 'Function' ? fbox : contact)(e, c, r);
    }
  }
  outs.forEach((c, i) => coil(c, crow[i]));

  // --- kabel mendatar, dipotong di tempat simbolnya berdiri ---
  const wire = (r, x1, x2) => {
    const g = gap.filter(t => t[0] === r).map(t => [t[1], t[2]]).sort((a, b) => a[0] - b[0]);
    let x = x1;
    for (const [a, b] of g) {
      if (b <= x1 || a >= x2) continue;
      if (a > x) line(x, rowY(r), a, rowY(r));
      x = Math.max(x, b);
    }
    if (x < x2) line(x, rowY(r), x2, rowY(r));
  };

  wire(0, railL, railR);

  // Cabang yang MULAI di kolom sama itu satu grup alternatif (OR) - dan grup itu
  // menutup di kolom yang sama, yaitu ujung cabang terpanjang di grupnya. Tanpa
  // ini kontak seal satu-kolom menutup kekurangan satu kolom dari cabang di
  // atasnya, dan gambarnya jadi tidak nyambung. Aturannya PERSIS sama dengan
  // yang dipakai rungExpr waktu menyusun ekspresi, jadi gambar dan ekspresi
  // tidak pernah bercerita beda.
  const allRuns = [];
  for (let r = 1; r <= maxr; r++) {
    const cols = [];
    for (let c = 0; c <= maxc; c++) if (at.has(r + ':' + c)) cols.push(c);
    const runs = [];
    for (const c of cols) {
      const last = runs[runs.length - 1];
      if (last && c === last[1] + 1) last[1] = c; else runs.push([c, c]);
    }
    runs.forEach(([c0, c1], i) => allRuns.push({ r, c0, c1, last: i === runs.length - 1 }));
  }
  const groupEnd = new Map();
  allRuns.forEach(b => groupEnd.set(b.c0, Math.max(groupEnd.get(b.c0) ?? b.c1, b.c1)));

  for (let r = 1; r <= maxr; r++) {
    const runs = allRuns.filter(b => b.r === r);
    const hasCoil = crow.includes(r);
    runs.forEach(b => {
      const end = b.last ? groupEnd.get(b.c0) : b.c1;
      const x0 = colX(b.c0), x1 = colX(end) + CW;
      wire(r, x0, x1);
      line(x0, rowY(0), x0, rowY(r));                 // titik cabang masuk
      // Kalau baris ini berakhir di coil sendiri, dia TIDAK balik ke jalur
      // utama - jadi jangan digambar seolah balik.
      if (!(hasCoil && b.last)) line(x1, rowY(0), x1, rowY(r));
    });
    if (hasCoil) {
      const from = runs.length ? colX(groupEnd.get(runs[runs.length - 1].c0)) + CW : railL;
      if (!runs.length) line(railL, rowY(0), railL, rowY(r));
      wire(r, from, railR);
    }
  }

  return `<div class="lad"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ` +
         `xmlns="http://www.w3.org/2000/svg">${o.join('')}</svg></div>`;
}

if (typeof module !== 'undefined') {
  module.exports = { elLabel, rungExpr, LAD, ladWrap, ladderHtml };
}
