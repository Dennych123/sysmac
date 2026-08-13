// Pembungkus Node untuk ekspor XML. Logikanya ada di src/xmlout.js (murni, dipakai
// browser juga); di sini cuma satu hal: MENYUNTIKKAN pembangun XML milik generator.
//
// js/lib.js itu skrip polos (dipakai dengan cara di-inline ke index.html), jadi
// dimuat dengan new Function - persis cara scripts/core.js memuatnya. Sengaja
// dipinjam, bukan disalin: kalau bentuk XML-nya berubah, generator dan exporter
// ikut berubah bersamaan. Parser .smc2 dulu ditulis dua kali dan diam-diam drift,
// dan drift di sisi TULIS menghasilkan berkas yang ter-import mulus tapi salah.
//
// Di browser suntikannya datang dari build.js, yang meng-inline js/lib.js yang
// SAMA sebagai namespace SGLIB.
'use strict';
const fs = require('fs');
const path = require('path');

const X = require('./src/xmlout.js');

function loadLib(libPath) {
  const p = libPath || path.join(__dirname, '..', 'js', 'lib.js');
  if (!fs.existsSync(p)) {
    throw new Error('js/lib.js tidak ketemu di ' + p + ' - exporter memakai pembangun ' +
                    'XML milik generator, bukan salinannya.');
  }
  const src = fs.readFileSync(p, 'utf8');
  return new Function(src + '\n;return { Rung: Rung, sect: sect, prog: prog, vr: vr, esc: esc };')();
}

const exportProject = (p, opts) => X.exportProject(p, loadLib(opts && opts.libPath));

module.exports = Object.assign({}, X, { exportProject, loadLib });
