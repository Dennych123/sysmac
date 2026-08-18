// Menemukan project NB-Designer dari path yang diberikan orang.
//
// Dipakai nb_apply.js dan nb_sync.js. Ditaruh di satu berkas karena dua salinan aturan
// "di mana project NB itu" akan drift, dan drift-nya baru ketahuan waktu salah satu skrip
// menulis ke tempat yang salah.
'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Terima apa saja yang masuk akal: berkas .nbp langsung, folder yang memuatnya, atau folder
 * pembungkus yang di dalamnya ada folder project (namanya sering sama persis - itu bentuk
 * bawaan NB-Designer, dan yang paling sering ditunjuk orang).
 * Balikin { dir, nbp, nbpPath } atau { err }.
 */
function findNbProject(arg) {
  const p = path.resolve(arg);
  if (!fs.existsSync(p)) return { err: 'tidak ada: ' + p };
  const st = fs.statSync(p);
  if (st.isFile()) {
    if (!/\.nbp$/i.test(p)) return { err: 'bukan berkas .nbp: ' + p };
    return { dir: path.dirname(p), nbp: path.basename(p), nbpPath: p };
  }
  const nbpIn = d => { try { return fs.readdirSync(d).filter(f => /\.nbp$/i.test(f)); } catch (e) { return []; } };
  const jadi = d => ({ dir: d, nbp: nbpIn(d)[0], nbpPath: path.join(d, nbpIn(d)[0]) });
  if (nbpIn(p).length) return jadi(p);
  // 'temp' dilewati: NB-Designer menaruh salinan kerja .nbp di situ, dan menulis ke salinan
  // kerja berarti perubahannya hilang begitu project dibuka ulang.
  const subs = fs.readdirSync(p)
    .filter(f => { try { return fs.statSync(path.join(p, f)).isDirectory() && f.toLowerCase() !== 'temp'; } catch (e) { return false; } })
    .map(f => path.join(p, f))
    .filter(d => nbpIn(d).length);
  if (subs.length === 1) return jadi(subs[0]);
  if (subs.length > 1) return { err: 'ada ' + subs.length + ' folder project NB di dalam sini, tunjuk salah satu:\n  ' + subs.join('\n  ') };
  return { err: 'tidak ada berkas .nbp di ' + p + ' maupun satu tingkat di dalamnya - ini bukan folder project NB-Designer' };
}

module.exports = { findNbProject };
