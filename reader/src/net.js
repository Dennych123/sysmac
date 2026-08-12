// Netlist rung yang EKSAK - dipakai untuk mengekspor ladder jadi XML importable.
//
// Bedanya dengan rungExpr() di ladder.js: rungExpr MENEBAK bentuk rangkaian dari
// koordinat saja (cabang bersarang disederhanakan satu tingkat, ditandai '~').
// Tebakan itu cukup untuk DIBACA manusia, tapi TIDAK cukup untuk ditulis balik
// jadi program - rangkaian yang salah susun tetap ter-import Sysmac tanpa keluhan
// dan mesinnya yang salah jalan.
//
// Untungnya tidak perlu menebak: format JSON (Studio >= 1.66) menyimpan LINK
// VERTIKAL-nya sendiri di `VLs`, dan itu topologi paralel yang sebenarnya.
//
//   {"Ix":9,"X":2}          palang di TEPI KIRI kolom 2, menyambung baris 0 & 1
//   {"Ix":9,"X":2,"Y":1}    ruas berikutnya palang yang SAMA (Ix sama), baris 1 & 2
//
// Jadi rung dimodelkan sebagai rangkaian listrik biasa di atas grid:
//
//   TITIK (y,b)  = simpul kawat di baris y, batas kolom b (b = tepi KIRI kolom b)
//   elemen (y,x) = komponen dari titik (y,x) ke titik (y,x+1)
//   HL           = kawat lurus, menyambung (y,x) dengan (y,x+1)
//   VL {X,Y}     = palang tegak, menyambung (Y,X) dengan (Y+1,X)
//   rel kiri     = SEMUA titik (y,0) - relnya satu batang tegak
//   rel kanan    = SEMUA titik (y,maxB)
//
// Simpul yang tersambung digabung pakai union-find, lalu hasilnya diperiksa:
// tiap masukan harus ADA yang menyetir, dan cuma coil yang boleh menyentuh rel
// kanan. Rung yang tidak lolos DITOLAK, bukan dipaksakan - rung yang salah baca
// jauh lebih berbahaya daripada rung yang tidak jadi diekspor, karena yang salah
// tetap ter-import dengan mulus.
if (typeof require !== 'undefined') {
  // (tidak ada dependensi - modul ini murni)
}

// Elemen yang bisa dijadikan rangkaian. Sisanya (F, FB, IST, JMP) butuh bentuk
// XML sendiri per instruksi dan BELUM didukung - lihat catatan di xml_out.js.
const NET_KINDS = { Contact: 1, Coil: 1, HLink: 1 };

/**
 * Susun netlist sebuah rung.
 * @returns {{ok:true, parts:Array, leftNet:string, rightNet:string, maxB:number}}
 *          | {{ok:false, why:string}}
 *   parts[i] = { el, idx, y, x, inNet, outNet }  untuk tiap Contact/Coil
 *              (HLink tidak ikut - dia cuma kawat, bukan komponen)
 */
function rungNet(rung) {
  const all = (rung.elements || []).filter(e => e && e.kind);
  if (!all.length) return { ok: false, why: 'rung kosong' };

  const odd = all.find(e => !NET_KINDS[e.kind]);
  if (odd) return { ok: false, why: 'blok fungsi / ST sisipan / jump', what: odd.func || odd.kind };

  // Studio <= 1.56 tidak menyimpan koordinat sama sekali. Tata letaknya tidak bisa
  // dipulihkan, jadi rangkaiannya juga tidak - kecuali rung sepele satu elemen.
  const hasXY = all.some(e => 'x' in e || 'y' in e);
  if (!hasXY && all.length > 1) return { ok: false, why: 'tanpa koordinat (Studio <= 1.56)' };

  const X = e => e.x || 0, Y = e => e.y || 0;
  let maxB = 0, maxY = 0;
  all.forEach(e => {
    if (X(e) + 1 > maxB) maxB = X(e) + 1;
    if (Y(e) > maxY) maxY = Y(e);
  });

  // Dua elemen di sel yang sama berarti gridnya salah baca - jangan diterka.
  const cell = new Set();
  for (const e of all) {
    const k = Y(e) + ':' + X(e);
    if (cell.has(k)) return { ok: false, why: 'dua elemen di sel yang sama (' + k + ')' };
    cell.add(k);
  }

  const par = new Map();
  const find = k => {
    if (!par.has(k)) { par.set(k, k); return k; }
    let r = k;
    while (par.get(r) !== r) r = par.get(r);
    while (par.get(k) !== r) { const nx = par.get(k); par.set(k, r); k = nx; }
    return r;
  };
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) par.set(b, a); };
  const P = (y, b) => y + ':' + b;

  for (let y = 1; y <= maxY; y++) union(P(0, 0), P(y, 0));          // rel kiri
  for (let y = 1; y <= maxY; y++) union(P(0, maxB), P(y, maxB));    // rel kanan
  all.forEach(e => { if (e.kind === 'HLink') union(P(Y(e), X(e)), P(Y(e), X(e) + 1)); });
  for (const v of (rung.vlinks || [])) {
    const vy = v.Y || 0, vx = v.X || 0;
    if (vx > maxB) return { ok: false, why: 'VL di luar rung (X=' + vx + ')' };
    union(P(vy, vx), P(vy + 1, vx));
  }

  const leftNet = find(P(0, 0)), rightNet = find(P(0, maxB));
  if (leftNet === rightNet) return { ok: false, why: 'rel kiri dan kanan terhubung (korslet)' };

  const parts = [];
  all.forEach((e, idx) => {
    if (e.kind === 'HLink') return;
    parts.push({ el: e, idx, y: Y(e), x: X(e),
                 inNet: find(P(Y(e), X(e))), outNet: find(P(Y(e), X(e) + 1)) });
  });
  if (!parts.length) return { ok: false, why: 'rung tanpa kontak/coil' };
  if (!parts.some(p => p.el.kind === 'Coil')) return { ok: false, why: 'rung tanpa coil' };

  // Elemen yang kedua ujungnya di simpul yang sama = terhubung singkat. Selain
  // memang mustahil sebagai rangkaian, ini juga yang bisa membuat "penyetir"
  // sebuah simpul berada di KANAN pemakainya - dan penulis XML mengandalkan
  // penyetir selalu lebih dulu (lihat urutan kolom di xml_out.js).
  for (const p of parts) {
    if (p.inNet === p.outNet) return { ok: false, why: 'ada elemen terhubung singkat' };
  }

  // Cuma coil yang boleh menyentuh rel kanan - kontak yang menyentuhnya berarti
  // gridnya salah baca (kontak nyambung langsung ke rel = korslet).
  for (const p of parts) {
    if (p.outNet === rightNet && p.el.kind !== 'Coil') {
      return { ok: false, why: 'kontak menyentuh rel kanan' };
    }
    if (p.el.kind === 'Coil' && p.outNet !== rightNet) {
      return { ok: false, why: 'coil tidak sampai rel kanan' };
    }
  }

  // Tiap masukan harus ada yang menyetir. Simpul tanpa penyetir = potongan rung
  // yang tidak terbaca, dan mengekspornya diam-diam membuang logika.
  const driven = new Set([leftNet]);
  parts.forEach(p => { if (p.el.kind !== 'Coil') driven.add(p.outNet); });
  for (const p of parts) {
    if (!driven.has(p.inNet)) return { ok: false, why: 'ada bagian rung yang tidak tersambung' };
  }

  return { ok: true, parts, leftNet, rightNet, maxB };
}

if (typeof module !== 'undefined') module.exports = { rungNet, NET_KINDS };
