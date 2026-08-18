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
  var { VCMT, VGLOB, cmtOf, isGlobal, addrOf } = require('./symbols.js');
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
// Ukuran dirapatkan supaya satu section kebaca seperti di layar Studio: rung berikutnya
// menempel, dan rung pendek tidak memakan lebar sampai ke kanan layar.
//
//   CW  jarak antar kolom. 150 dulu bikin rung 3 kontak selebar 1000px - coil-nya jatuh
//       di luar layar dan harus digulir mendatar padahal rung-nya pendek.
//   RH  tinggi baris MINIMUM. Batas bawahnya bukan selera: nama boleh 2 baris di ATAS
//       simbol (18 + 11) dan komentar 4 baris di BAWAH (22 + 11*3) - totalnya 84px.
//       Di bawah itu komentar rung ini bertumpuk dengan nama rung berikutnya.
//   NW/CmtW ikut turun bersama CW; kalau tidak, teks kolom bersebelahan saling tindih.
const CMT_LN = 4;                    // maksimal baris komentar di bawah simbol
const LAD = { CW: 118, RH: 88, PAD: 4, HG: 8, AR: 12,
              NW: 18, CmtW: 17,          // batas karakter per baris nama / komentar
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

  // Lebar minimum 3 kolom + 1 coil. Pitch kolomnya tetap sama untuk semua rung, jadi
  // kontak tetap lurus segaris antar rung - itu yang bikin satu section kebaca sebagai
  // satu aliran. Yang diturunkan cuma minimumnya: dulu 6 kolom, jadi rung berisi dua
  // kontak pun memaksa rel kanan ke ~1000px dan coil-nya jatuh di luar layar.
  maxc = Math.max(maxc, 2);

  // Coil ditaruh di barisnya sendiri. Rung langkah gerakan punya DUA coil di
  // baris berbeda - kalau ditumpuk jadi satu sel, urutannya hilang.
  const crow = outs.map((o, i) => (hasXY ? (o.y || 0) : i));
  crow.forEach(y => { if (y > maxr) maxr = y; });

  const { CW: CW_MIN, RH: RH_MIN, PAD, HG, AR, NW, CmtW, FBW, HDR, PINH } = LAD;

  // Blok fungsi tidak muat di sel biasa, dan dua bagiannya keluar dari kotak gambar:
  //
  //   ke KIRI   operand tiap pin masukan ditulis di luar kotak (`UINT#27`, `NL20[44]`).
  //             Dengan rel kiri di 8px, teks itu jatuh di koordinat NEGATIF - di luar
  //             viewBox, jadi terpotong. Yang kelihatan cuma potongan ekornya, dan itu
  //             terbaca seperti nama yang salah baca, bukan seperti gambar yang kekecilan.
  //   ke BAWAH  kotak setinggi jumlah pin. Instruksi berpin banyak (AryByteTo: In, Size,
  //             Order, OutVal) lebih tinggi dari satu baris ladder dan terpotong rung
  //             berikutnya.
  //
  // Jadi dua-duanya dihitung DULU, sebelum satu garis pun digambar.
  const fbs = els.filter(e => e.kind === 'Function');
  const panjangOpd = (e, sisi) => Math.max(0, ...(((e.pins && e.pins[sisi]) || [])
    .map(pi => String((pi && pi.operand) || '').length)));
  const fbRows = fbs.reduce((m, e) => Math.max(m,
    ((e.pins && e.pins.in) || []).length, ((e.pins && e.pins.out) || []).length, 1), 1);
  // Nama instance FB ditulis DI ATAS kotak (seperti Studio: `LT012` di atas `TON`), jadi
  // baris itu butuh ruang tambahan di atas - kalau tidak, namanya keluar dari gambar.
  const fbH = fbs.length ? HDR + fbRows * PINH + 4 : 0;
  const RH = Math.max(RH_MIN, fbH + 42);

  const opdKiri = fbs.reduce((m, e) => Math.max(m, panjangOpd(e, 'in')), 0);
  const opdKanan = fbs.reduce((m, e) => Math.max(m, panjangOpd(e, 'out')), 0);
  // Lebar kotak DIBATASI sendiri, tidak lagi ikut lebar kolom. Dulu `w = CW - 8`: melebarkan
  // kolom ikut melebarkan kotaknya, jadi ruang buat operand tidak pernah bertambah dan
  // teksnya tetap menabrak komentar kolom sebelah - persis "AIR SOURCE CON#3S" yang terbaca
  // seperti nama rusak, padahal dua teks yang bertumpuk.
  const fbW = fbs.length
    ? Math.min(FBW + 46, Math.max(FBW, ...fbs.map(e => String(e.func || e.var || '?').length * 7 + 20)))
    : 0;
  // Lebar kolom dihitung PER KOLOM, bukan satu angka untuk seluruh rung. Kolom berisi blok
  // fungsi butuh ruang buat kotaknya plus operand di kiri dan kanan pin; kolom kontak tidak.
  // Satu lebar untuk semua bikin rung 4 kolom berisi satu TON jadi ~760px - kolom kontaknya
  // ikut melebar tanpa alasan, dan rung yang seharusnya muat malah butuh gulir mendatar.
  const colW = [];
  for (let c = 0; c <= maxc + 1; c++) {
    const isi = [];
    for (let r = 0; r <= maxr; r++) { const e = at.get(r + ':' + c); if (e) isi.push(e); }
    const fbDiSini = isi.filter(e => e.kind === 'Function');
    colW[c] = fbDiSini.length
      ? Math.max(CW_MIN, fbW +
          (Math.max(0, ...fbDiSini.map(e => panjangOpd(e, 'in'))) +
           Math.max(0, ...fbDiSini.map(e => panjangOpd(e, 'out')))) * 6.4 + 54)
      : CW_MIN;
  }
  const CW = CW_MIN;                       // dipakai buat ukuran yang tidak bergantung kolom
  const cw = c => colW[c] || CW_MIN;

  // Rel kiri digeser hanya kalau blok fungsi berdiri di KOLOM 0 - di situ operand pin
  // masukannya jatuh di luar gambar (koordinat negatif) dan terpotong.
  const fbDiKolom0 = fbs.some(e => (hasXY ? (e.x || 0) : ins.indexOf(e)) === 0);
  const padKiri = fbDiKolom0 ? Math.max(0, opdKiri * 6.4 + 18 - (cw(0) / 2 - fbW / 2 + 12)) : 0;

  const railL = PAD + 4 + padKiri;
  const colX = c => { let x = railL + 12; for (let i = 0; i < c; i++) x += cw(i); return x; };
  const coilC = maxc + 1;
  const railR = colX(coilC) + cw(coilC);
  const W = railR + PAD + 4, H = PAD * 2 + (maxr + 1) * RH;
  const rowY = r => PAD + RH / 2 + r * RH;
  const cx = c => colX(c) + cw(c) / 2;

  const o = [];
  const line = (x1, y1, x2, y2, cls) =>
    o.push(`<line class="${cls || 'w'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);

  // NAMA di atas simbol. Kalau butuh dua baris, baris TERAKHIR yang menempel ke
  // simbol - biar jarak nama-ke-simbol selalu sama berapa pun panjang namanya.
  function nameAbove(x, y, t, cls) {
    const ln = ladWrap(t, NW);
    // Stabilo di belakang nama - SVG tidak punya background untuk teks, jadi kotaknya digambar
    // sendiri lebih dulu. Lebarnya diperkirakan dari jumlah karakter (Consolas 11px ~ 6.2px
    // per karakter); dilebihkan sedikit supaya tidak memotong huruf terakhir.
    if (cls && cls.indexOf('at') >= 0) {
      const wMax = Math.max(...ln.map(s => s.length)) * 6.2 + 8;
      o.push(`<rect class="hl" x="${x - wMax / 2}" y="${y - 18 - (ln.length - 1) * 11 - 10}" ` +
             `width="${wMax}" height="${ln.length * 11 + 3}"/>`);
    }
    ln.forEach((s, i) => o.push(
      `<text class="nm ${cls || ''}" x="${x}" y="${y - 18 - (ln.length - 1 - i) * 11}">${esc(s)}</text>`));
  }
  // KOMENTAR di bawah simbol, hijau, dipatah per KATA (komentar itu kalimat,
  // bukan nama - dipatah di tengah kata jadi tidak kebaca).
  function cmtBelow(x, y, v) {
    const t = cmtOf(v);
    if (!t) return;
    const words = String(t).split(/\s+/), ln = [];
    let cur = '';
    for (const w of words) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= CmtW) cur += ' ' + w;
      // 4 baris, bukan 3. Komentar Denso rutin sepanjang "Auto start condition indication,
      // page 2" - dipotong di baris ketiga, yang hilang justru penunjuk halamannya, dan
      // potongannya tidak ditandai apa pun: kelihatan seperti komentar yang memang segitu.
      else { ln.push(cur); cur = w; if (ln.length === CMT_LN - 1) break; }
    }
    if (ln.length < CMT_LN && cur) ln.push(cur);
    ln.slice(0, CMT_LN).forEach((s, i) => o.push(
      `<text class="cmt" x="${x}" y="${y + 22 + i * 11}">${esc(s)}</text>`));
  }
  // Warna operand = apa yang Studio tunjukkan, bukan selera:
  //   hitam   variabel lokal program itu
  //   ungu    variabel global
  //   merah + stabilo   variabel yang PUNYA AT (dipetakan ke alamat memori/IO)
  // Yang terakhir itu penanda paling penting di layar: operand ber-AT dibaca/ditulis dari
  // luar program (HMI, unit IO), jadi mengubahnya tidak pernah cuma urusan program ini.
  const opClass = v => (addrOf(v) ? 'at' : (isGlobal(v) ? 'og' : ''));

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
  // Operand yang menempel di pin blok fungsi (`PD071_CUR`, `LT012`) itu OPERAND PENUH, sama
  // seperti kontak biasa - jadi harus bisa diklik buat silang-rujuk. Sebelumnya cuma kotaknya
  // yang bisa diklik, dan justru operand di pin itu yang paling sering ditanya ("angka ini
  // ditulis siapa?"). Konstanta (`T#3S`, `UINT#44`) TIDAK dijadikan sasaran: itu nilai, bukan
  // variabel, dan silang-rujuknya selalu kosong.
  const konstanta = v => /#/.test(v) || /^[-\d]/.test(v) || /^(TRUE|FALSE)$/i.test(v);
  function opdText(v, x, y, kanan) {
    const t = `<text class="opd${kanan ? ' r' : ''}" x="${x}" y="${y}">${esc(v)}</text>`;
    if (konstanta(v)) { o.push(t); return; }
    const wTeks = String(v).length * 6.2 + 6;
    o.push(`<g class="el" data-var="${esc(v)}">` +
           `<rect class="hit" x="${kanan ? x - wTeks : x - 3}" y="${y - 11}" ` +
           `width="${wTeks}" height="14"/>` + t + '</g>');
  }

  function fbox(e, c, r) {
    const X = cx(c), Y = rowY(r);
    const nm = String(e.func || e.var || '?');
    const pins = e.pins || {}, pin = { in: pins.in || [], out: pins.out || [] };
    const rows = Math.max(pin.in.length, pin.out.length, 0);
    const wNeed = Math.max(FBW, nm.length * 7 + 20,
      ...Array.from({ length: rows }, (_, i) =>
        ((pin.in[i] && pin.in[i].name || '').length + (pin.out[i] && pin.out[i].name || '').length) * 6.2 + 26));
    const w = Math.min(fbW || cw(c) - 8, Math.max(wNeed, fbW || 0));
    const top = Y - HDR - PINH / 2, h = HDR + Math.max(rows, 1) * PINH + 4;
    o.push(`<rect class="fb" x="${X - w / 2}" y="${top}" width="${w}" height="${h}"/>`);
    o.push(`<line class="fbsep" x1="${X - w / 2}" y1="${top + HDR}" x2="${X + w / 2}" y2="${top + HDR}"/>`);
    o.push(`<text class="fn" x="${X}" y="${top + 13}">${esc(nm)}</text>`);
    // Nama INSTANCE di atas kotak, seperti Studio (`LT012` di atas `TON`). Tanpa itu dua
    // timer berbeda tergambar sama persis, dan yang membaca tidak punya cara tahu timer mana
    // yang sedang dilihat - padahal instance-nya yang menentukan preset dan status.
    if (e.var && e.func && e.var !== e.func) {
      o.push(`<text class="nm" x="${X}" y="${top - 6}">${esc(e.var)}</text>`);
    }
    for (let i = 0; i < rows; i++) {
      const py = top + HDR + PINH / 2 + i * PINH + 4;
      const pi = pin.in[i], po = pin.out[i];
      if (pi) {
        o.push(`<text class="pin" x="${X - w / 2 + 5}" y="${py}">${esc(pi.name)}</text>`);
        line(X - w / 2 - 12, py - 4, X - w / 2, py - 4);
        if (pi.operand) opdText(pi.operand, X - w / 2 - 15, py, true);
      }
      if (po) {
        o.push(`<text class="pin r" x="${X + w / 2 - 5}" y="${py}">${esc(po.name)}</text>`);
        line(X + w / 2, py - 4, X + w / 2 + 12, py - 4);
        if (po.operand) opdText(po.operand, X + w / 2 + 15, py, false);
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

  // Tiap elemen dibungkus <g data-var> berikut satu kotak transparan seukuran selnya.
  // Tanpa kotak itu yang bisa diklik cuma garis simbol setebal 1,6px dan teks namanya -
  // meleset satu piksel berarti kliknya tidak terjadi, dan itu terbaca seperti fitur yang
  // tidak jalan, bukan seperti sasaran yang kekecilan.
  function grup(e, c, r, gambar) {
    const i = o.length;
    gambar();
    const nama = e.var || e.func;
    if (!nama) return;
    const X = cx(c), Y = rowY(r);
    o.splice(i, 0,
      `<g class="el" data-var="${esc(nama)}"><rect class="hit" x="${X - cw(c) / 2}" ` +
      `y="${Y - RH / 2 + 2}" width="${cw(c)}" height="${RH - 4}"/>`);
    o.push('</g>');
  }

  for (let r = 0; r <= maxr; r++) {
    for (let c = 0; c <= maxc; c++) {
      const e = at.get(r + ':' + c);
      if (e) grup(e, c, r, () => (e.kind === 'Function' ? fbox : contact)(e, c, r));
    }
  }
  outs.forEach((c, i) => grup(c, coilC, crow[i], () => coil(c, crow[i])));

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

  // Palang cabang: PAKAI DATANYA kalau ada. `.smc2` Studio >= 1.66 membawa `VLs` - daftar
  // ruas vertikal, satu ruas menyambung baris Y dan Y+1 di TEPI KIRI kolom X. Itu susunan
  // yang sebenarnya, bukan tebakan, jadi gambarnya sama persis dengan layar Studio.
  //
  // Heuristik di bawahnya tetap ada untuk berkas Studio <= 1.56 yang tidak menyimpan VLs
  // maupun koordinat. Jangan dihapus: yang lama tidak punya sumber lain buat ditebak.
  // Studio MENGHILANGKAN X/Y kalau nilainya 0 - `{"Ix":9,"X":3}` itu palang di kolom 3 baris 0.
  // Menuntut keduanya ada bikin palang baris pertama terbuang diam-diam, dan yang tersisa cuma
  // palang paling kanan: cabangnya tergambar sebagai satu kotak besar sampai ujung rung.
  const vls = (rung.vlinks || []).map(v => ({ X: v.X || 0, Y: v.Y || 0 }));
  if (hasXY && vls.length) {
    // Occupancy per baris dihitung dari SELURUH elemen rung - termasuk HLink yang disaring
    // dari daftar gambar karena tidak punya nama.
    // Satu baris bisa punya BEBERAPA potongan yang tidak bersambung: seal di kolom 0-2 dan,
    // di baris yang sama, satu kontak cabang OR di kolom 4. Diambil min-max, dua potongan itu
    // jadi satu kabel panjang yang melintasi ruang kosong di antaranya - kabel yang di Studio
    // memang tidak ada, dan pembacanya jadi mengira dua cabang itu satu jalur.
    const occ = new Map();
    (rung.elements || []).forEach(e => {
      const x = e.x || 0, y = e.y || 0;
      if (!occ.has(y)) occ.set(y, new Set());
      occ.get(y).add(x);
    });
    const potongan = r => {
      const cols = [...(occ.get(r) || [])].sort((a, b) => a - b);
      const out = [];
      for (const c of cols) {
        const last = out[out.length - 1];
        if (last && c === last[1] + 1) last[1] = c; else out.push([c, c]);
      }
      return out;
    };
    vls.forEach(v => line(colX(v.X), rowY(v.Y), colX(v.X), rowY(v.Y + 1)));
    for (let r = 1; r <= maxr; r++) {
      // Baris cabang membentang dari palang paling kiri yang menyentuhnya sampai palang
      // paling kanan - ditambah sel elemen yang berdiri di baris itu. Diambil dari titik
      // yang MEMANG tersambung, jadi tidak ada ujung yang menggantung di udara.
      // Tiap potongan digambar sendiri-sendiri, dari pembukanya sampai penutupnya.
      //
      // Kolom kosong di dalam satu potongan diisi Studio dengan elemen HLink - tanpa nama, jadi
      // tidak ikut digambar, tapi POSISINYA yang menyatakan sampai kolom mana kabelnya nyambung.
      // Penutupnya selalu tepi kiri kolom BERIKUTNYA, yaitu tempat palang berdiri.
      const pot = potongan(r);
      if (!pot.length) continue;
      pot.forEach(([c0, c1]) => {
        const kiri = c0 === 0 ? railL : colX(c0);
        const kanan = crow.includes(r) && c1 >= coilC - 1 ? railR : colX(c1 + 1);
        wire(r, kiri, kanan);
      });
    }
    return `<div class="lad"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ` +
           `xmlns="http://www.w3.org/2000/svg">${o.join('')}</svg></div>`;
  }

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
      const x0 = colX(b.c0), x1 = colX(end) + cw(end);
      wire(r, x0, x1);
      line(x0, rowY(0), x0, rowY(r));                 // titik cabang masuk
      // Kalau baris ini berakhir di coil sendiri, dia TIDAK balik ke jalur
      // utama - jadi jangan digambar seolah balik.
      if (!(hasCoil && b.last)) line(x1, rowY(0), x1, rowY(r));
    });
    if (hasCoil) {
      const from = runs.length
        ? colX(groupEnd.get(runs[runs.length - 1].c0)) + cw(groupEnd.get(runs[runs.length - 1].c0))
        : railL;
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
