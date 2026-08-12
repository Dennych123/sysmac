// .smc2  ->  XML yang bisa DI-IMPORT balik ke Sysmac Studio.
//
// Ini penutup lingkarannya: Studio bisa meng-import XML tapi tidak bisa meng-export,
// jadi program yang sudah jadi selama ini cuma bisa dibaca. Dengan ini rung-nya bisa
// dikeluarkan lagi dalam bentuk yang Studio terima - buat mesin copy, retrofit, atau
// buat menaruh program lama berdampingan dengan hasil generator.
//
// Pembangun XML-nya BUKAN salinan: modul ini memuat `js/lib.js` milik generator apa
// adanya. Kalau bentuk XML-nya berubah, dua-duanya ikut berubah bersamaan. Dulu
// parser .smc2 sempat ditulis dua kali dan diam-diam drift; jangan diulang di sisi
// tulis, karena drift di sini menghasilkan berkas yang ter-import mulus tapi salah.
//
// ================================ YANG BELUM DIEKSPOR ================================
// Cuma rung yang murni KONTAK / COIL / LINK yang ditulis. Rung yang memuat blok
// fungsi (MOVE, TON, pembanding, FB motion) atau ST sisipan DILEWATI - bentuk XML
// tiap instruksi harus diverifikasi lewat import sungguhan dulu, dan menebaknya
// menghasilkan berkas yang ter-import tanpa keluhan tapi jalannya lain.
//
// Rung yang dilewati TIDAK dihapus diam-diam: tempatnya tetap ada sebagai rung
// berisi KOMENTAR yang menuliskan alasan dan logika aslinya. Jadi nomor rung tidak
// bergeser, dan lubangnya kelihatan di layar Studio - bukan hilang tanpa jejak.
'use strict';
const fs = require('fs');
const path = require('path');

const { rungNet } = require('./src/net.js');
const { rungExpr } = require('./src/ladder.js');

// ---------------------------------------------- pinjam pembangun XML generator
// js/lib.js itu skrip polos (dipakai dengan cara di-inline ke index.html), jadi
// dimuat dengan new Function - persis cara scripts/core.js memuatnya.
function loadLib(libPath) {
  const p = libPath || path.join(__dirname, '..', 'js', 'lib.js');
  if (!fs.existsSync(p)) {
    throw new Error('js/lib.js tidak ketemu di ' + p + ' - exporter memakai pembangun ' +
                    'XML milik generator, bukan salinannya.');
  }
  const src = fs.readFileSync(p, 'utf8');
  return new Function(src + '\n;return { Rung: Rung, sect: sect, prog: prog, vr: vr, esc: esc };')();
}

// ------------------------------------------------------------------ satu rung
/**
 * Netlist -> <Rung> XML.
 * Penyetir tiap simpul dikumpulkan sambil berjalan dari kolom kiri ke kanan.
 * Urutan itu yang menjamin penyetir sebuah simpul SELALU sudah tertulis sebelum
 * pemakainya - rungNet() sudah menolak rung yang bisa melanggarnya.
 * @returns {{xml:string}|{skip:string}}
 */
function rungToXml(L, order, rung, net) {
  const R = new L.Rung(order, rung.comment || '');
  const drv = new Map([[net.leftNet, [R.rail()]]]);
  const add = (n, id) => { if (!drv.has(n)) drv.set(n, []); drv.get(n).push(id); };

  const parts = net.parts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const coils = [];
  for (const p of parts) {
    const e = p.el;
    const refs = drv.get(p.inNet);
    if (!refs || !refs.length) return { skip: 'simpul tanpa penyetir' };
    const op = String(e.var || '');
    if (!op) return { skip: 'elemen tanpa operand' };

    if (e.kind === 'Coil') {
      // Coil Set/Reset punya atribut XML sendiri yang belum diverifikasi lewat
      // import sungguhan. Menulisnya sebagai coil BIASA akan ter-import mulus dan
      // mengubah arti rung total (bit yang harusnya nyangkut jadi ikut lepas).
      if (e.set) return { skip: 'coil Set belum didukung' };
      if (e.reset) return { skip: 'coil Reset belum didukung' };
      coils.push(R.clm(op, refs, !!e.neg));
    } else {
      // Kontak edge butuh atribut `edge`, dan pembangunnya cuma menerima SATU
      // sambungan masuk - kontak edge di titik gabungan belum bisa ditulis.
      let id;
      if (e.edge) {
        if (refs.length > 1) return { skip: 'kontak edge di titik gabungan' };
        id = R.ct(op, refs[0], !!e.nc, e.edge);
      } else {
        id = R.ctm(op, refs, !!e.nc);
      }
      add(p.outNet, id);
    }
  }
  if (!coils.length) return { skip: 'rung tanpa coil' };
  R.rr(coils);
  return { xml: R.build() };
}

/** Rung pengganti: cuma komentar, supaya lubangnya kelihatan dan nomor rung tetap. */
function holeRung(L, order, rung, why) {
  const { expr, outs, approx } = rungExpr(rung);
  const logic = expr || outs.length ? (expr + (outs.length ? '  ->  ' + outs.join(', ') : '')) : '';
  const head = (rung.comment ? rung.comment.replace(/\s+/g, ' ').trim() + ' | ' : '');
  return new L.Rung(order,
    head + '[TIDAK DIEKSPOR: ' + why + '] ' + (approx ? '~' : '') + logic).build();
}

// ------------------------------------------------------- nama variabel & tipe
// Operand boleh menunjuk BAGIAN sebuah variabel (Struct.B[3], Ary[7]). Yang
// dideklarasikan itu variabel DASARnya, bukan potongannya.
const baseName = op => String(op || '').split(/[.[]/)[0];

const safeName = s => String(s || '').replace(/[^A-Za-z0-9_]/g, '_').replace(/^(\d)/, '_$1');

/**
 * Ekspor satu project jadi kumpulan berkas XML (satu per program) + laporan.
 * @returns {{files:Array<{name:string,xml:string}>, report:Object}}
 */
function exportProject(p, opts) {
  const L = loadLib(opts && opts.libPath);
  const gvar = new Map((p.variables || []).map(v => [v.name, v]));

  const files = [];
  const report = { programs: [], total: 0, exact: 0, holes: 0,
                   skipWhy: new Map(), skipWhat: new Map(), undeclared: new Set() };

  p.programs.forEach((prog, pi) => {
    const secs = [];
    const used = new Set();
    const prep = { name: prog.name, sections: [], exact: 0, total: 0, holes: 0 };

    prog.sections.forEach((s, si) => {
      if (s.kind !== 'ladder') {
        // Section ST tidak punya padanan LdSection. Dilewati seluruhnya, dan
        // dicatat - kalau tidak, program hasil ekspor tampak lengkap padahal
        // sebagian logikanya memang tidak ikut.
        if (s.kind === 'st') prep.sections.push({ name: s.name, kind: 'st', total: 0, exact: 0 });
        return;
      }
      const rungs = [];
      let exact = 0;
      s.rungs.forEach((r, ri) => {
        const order = ri + 1;
        const net = rungNet(r);
        let out = net.ok ? rungToXml(L, order, r, net) : { skip: net.why, what: net.what };
        if (out.xml) {
          exact++;
          rungs.push(out.xml);
          r.elements.forEach(e => { if (e.var) used.add(e.var); });
        } else {
          rungs.push(holeRung(L, order, r, out.skip));
          report.skipWhy.set(out.skip, (report.skipWhy.get(out.skip) || 0) + 1);
          if (out.what) report.skipWhat.set(out.what, (report.skipWhat.get(out.what) || 0) + 1);
        }
      });
      secs.push(L.sect(safeName(s.name), si + 1, rungs));
      prep.sections.push({ name: s.name, kind: 'ladder', total: s.rungs.length, exact });
      prep.total += s.rungs.length;
      prep.exact += exact;
      prep.holes += s.rungs.length - exact;
    });

    if (!secs.length) return;

    // Variabel: yang ada di tabel global project dipakai APA ADANYA (tipe dan
    // komentarnya ikut). Yang tidak ada di tabel cuma boleh dianggap BOOL kalau
    // namanya utuh - operand yang menunjuk bagian struct/array tipenya tidak bisa
    // disimpulkan, jadi dibiarkan TIDAK dideklarasikan dan dilaporkan. Studio akan
    // menolaknya waktu import - dan penolakan yang berisik jauh lebih baik daripada
    // deklarasi tebakan yang lolos diam-diam dengan tipe salah.
    const ext = [], glob = [], priv = [], seen = new Set();
    [...used].sort().forEach(op => {
      const b = baseName(op);
      if (seen.has(b)) return;
      seen.add(b);
      const g = gvar.get(b);
      if (g) {
        const v = '      ' + L.vr(b, g.type || 'BOOL', g.comment || '');
        ext.push(v); glob.push(v);
      } else if (b === op) {
        priv.push('      ' + L.vr(b, 'BOOL', ''));
      } else {
        report.undeclared.add(b);
      }
    });

    const name = 'Prg' + String(pi + 1).padStart(3, '0') + '_' + safeName(prog.name);
    files.push({ name: name + '.xml', xml: L.prog(name, ext, priv, secs, glob) });
    report.programs.push(prep);
    report.total += prep.total;
    report.exact += prep.exact;
    report.holes += prep.holes;
  });

  return { files, report };
}

// ------------------------------------------------------------------- laporan
const padR = (s, n) => String(s).slice(0, n).padEnd(n);
const padL = (s, n) => String(s).padStart(n);

function exportReport(report) {
  const L = [];
  L.push('PROGRAM / SECTION                            RUNG  EKSAK  LUBANG');
  for (const p of report.programs) {
    L.push(padR(p.name, 44) + padL(p.total, 5) + padL(p.exact, 7) + padL(p.holes, 8));
    for (const s of p.sections) {
      const mark = s.kind === 'st' ? '(ST - tidak diekspor)'
                 : padL(s.total, 5) + padL(s.exact, 7) + padL(s.total - s.exact, 8);
      L.push('    ' + padR(s.name, 40) + mark);
    }
  }
  const pct = report.total ? (100 * report.exact / report.total).toFixed(1) : '0.0';
  L.push('');
  L.push(report.exact + ' dari ' + report.total + ' rung diekspor UTUH (' + pct + '%).');
  if (report.holes) {
    L.push('');
    L.push(report.holes + ' rung jadi LUBANG - tempatnya tetap ada sebagai rung komentar,');
    L.push('lengkap dengan logika aslinya, jadi nomor rung tidak bergeser dan lubangnya');
    L.push('kelihatan di layar Studio. Alasannya:');
    [...report.skipWhy.entries()].sort((a, b) => b[1] - a[1]).forEach(([w, c]) =>
      L.push('   ' + padL(c, 5) + '  ' + w));
    if (report.skipWhat.size) {
      const top = [...report.skipWhat.entries()].sort((a, b) => b[1] - a[1]);
      L.push('');
      L.push('Instruksi yang paling sering bikin rung dilewati (' + report.skipWhat.size + ' jenis):');
      top.slice(0, 12).forEach(([w, c]) => L.push('   ' + padL(c, 5) + '  ' + w));
      if (top.length > 12) {
        L.push('   ' + padL(top.slice(12).reduce((a, b) => a + b[1], 0), 5) +
               '  (' + (top.length - 12) + ' instruksi lain)');
      }
    }
  }
  if (report.undeclared.size) {
    L.push('');
    L.push(report.undeclared.size + ' variabel dipakai tapi TIDAK ada di tabel global project,');
    L.push('dan tipenya tidak bisa disimpulkan (operand menunjuk bagian struct/array).');
    L.push('Dibiarkan tanpa deklarasi - Studio akan menolaknya waktu import. Deklarasikan');
    L.push('manual, jangan ditebak:');
    [...report.undeclared].sort().slice(0, 20).forEach(v => L.push('   ' + v));
    if (report.undeclared.size > 20) L.push('   ... dan ' + (report.undeclared.size - 20) + ' lagi');
  }
  L.push('');
  L.push('SEBELUM DIPAKAI: import ke project KOSONG dulu, lalu bandingkan rung-nya');
  L.push('dengan viewer (smc2-viewer.html) sebelah-menyebelah. Berkas ini hasil');
  L.push('rekonstruksi, bukan export resmi Omron.');
  return L.join('\n');
}

module.exports = { exportProject, exportReport, rungToXml, holeRung, loadLib, baseName, safeName };
