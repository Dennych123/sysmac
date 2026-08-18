// Bongkar project Sysmac (.smc2) jadi TEKS yang bisa di-commit dan dibaca `git diff`.
//
//   node scripts/smc2_extract.js project.smc2 folder-tujuan/
//   node scripts/smc2_extract.js project.smc2 folder-tujuan/ --clean   buang berkas lama dulu
//
// HANYA BACA sisi .smc2. Yang ditulis cuma berkas teks di folder tujuan.
//
// Kenapa ada: `.smc2` itu container ZIP. Di-commit apa adanya, `git diff` cuma bilang "binary
// files differ" - riwayatnya kosong justru waktu paling dibutuhkan, yaitu waktu mesin sudah
// jalan dan program mulai disunting langsung di Studio. Isi yang diekstrak inilah yang membuat
// "rung mana yang berubah" bisa dijawab tanpa membuka Studio.
//
// Tiga aturan bentuk keluarannya, dan ketiganya menentukan `git diff`-nya berguna atau tidak:
//
//   1. SATU BERKAS PER SECTION. Satu berkas raksasa bikin tiap perubahan kecil tampil sebagai
//      diff panjang, dan yang berubah tenggelam.
//   2. URUTANNYA DIPATOK. Elemen rung diurutkan (baris, kolom, jenis, operand) - kalau ikut
//      urutan penyimpanan Studio, menyimpan ulang tanpa mengubah apa pun sudah menghasilkan
//      diff palsu, dan riwayat yang penuh diff palsu berhenti dibaca.
//   3. KOORDINAT TIDAK IKUT. Menggeser kotak di kanvas tidak mengubah program. Yang butuh
//      beda tata letak pakai `scripts/smc2_diff.js`, yang memang memisahkan keduanya.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { unzip } = require(path.join(ROOT, 'reader', 'src', 'zip.js'));
const { readProject } = require(path.join(ROOT, 'reader', 'src', 'smc2.js'));

const argv = process.argv.slice(2);
const files = argv.filter(a => !a.startsWith('--'));
const clean = argv.indexOf('--clean') >= 0;

if (files.length < 2) {
  console.error('pakai: node scripts/smc2_extract.js project.smc2 folder-tujuan/ [--clean]');
  process.exit(2);
}
if (!fs.existsSync(files[0])) { console.error('tidak ada: ' + files[0]); process.exit(2); }

// Nama program/section jadi nama berkas. Yang di luar daftar aman diganti '_' - nama section
// boleh memuat spasi, '/' dan karakter lain yang di Windows bikin berkasnya gagal ditulis
// (atau, lebih buruk, mendarat di folder lain).
const safe = s => String(s).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'tanpa_nama';

/**
 * Satu rung jadi beberapa baris teks, urutannya dipatok.
 *
 * Yang ditulis: jenis elemen, operand, dan flag yang MENGUBAH ARTI (NC, set/reset, edge).
 * Flag itu tidak boleh dilewat - coil Set yang terbaca sebagai coil biasa menghasilkan teks
 * yang sama persis padahal programnya lain, dan diff-nya bersih sementara mesinnya berubah.
 */
function rungLines(r, i) {
  const L = [];
  L.push('rung ' + String(i + 1).padStart(4, '0') + (r.comment ? '  ; ' + r.comment.replace(/\s+/g, ' ') : ''));
  // Diurut per baris lalu kolom - itu urutan BACA ladder-nya, jadi teksnya masih masuk akal
  // dibaca manusia, bukan cuma stabil buat git. Yang tidak punya koordinat (bentuk DataContract
  // lama) jatuh ke urutan teks, dan itu tetap dipatok - yang penting tidak ikut urutan simpan.
  const urut = (r.elements || []).slice().sort((a, b) =>
    (a.y || 0) - (b.y || 0) || (a.x || 0) - (b.x || 0) ||
    ((a.kind || '') + (a.var || '') > (b.kind || '') + (b.var || '') ? 1 : -1));
  const els = urut.map(e => {
    const flag = [];
    if (e.nc) flag.push('NC');
    if (e.neg) flag.push('NEG');
    if (e.set) flag.push('SET');
    if (e.reset) flag.push('RESET');
    if (e.edge) flag.push(e.edge.toUpperCase());
    const pins = e.pins
      ? ' (' + [].concat(e.pins.in || [], e.pins.out || [])
          .map(p => (p && (p.name || p.Name || p.var)) || '?').join(', ') + ')'
      : '';
    return '    ' + (e.kind || '?').padEnd(8) + (e.func || e.var || '') + pins +
           (flag.length ? '  [' + flag.join(' ') + ']' : '');
  });
  return L.concat(els);
}

(async () => {
  const p = await readProject(fs.readFileSync(files[0]), unzip);
  const out = files[1];
  fs.mkdirSync(out, { recursive: true });

  if (clean) {
    // Berkas lama dibuang HANYA di folder tujuan dan hanya yang berakhiran .txt/.tsv - tanpa
    // itu, section yang dihapus di Studio tetap tertinggal di sini dan riwayatnya bohong.
    // Folder tujuan yang isinya bukan hasil ekstrak ini tidak boleh ikut kena.
    const buang = d => {
      for (const n of fs.readdirSync(d)) {
        const f = path.join(d, n);
        if (fs.statSync(f).isDirectory()) { buang(f); try { fs.rmdirSync(f); } catch (e) {} }
        else if (/\.(txt|tsv)$/.test(n)) fs.unlinkSync(f);
      }
    };
    buang(out);
  }

  const tulis = (rel, isi) => {
    const f = path.join(out, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    // LF, bukan CRLF: berkasnya dibaca `git diff` di mesin mana pun, dan campur akhir baris
    // bikin seluruh berkas tampil berubah padahal isinya sama.
    fs.writeFileSync(f, isi.replace(/\r\n/g, '\n'), 'utf8');
  };

  let nSect = 0, nRung = 0;
  const pohon = [];
  pohon.push('solution : ' + (p.solution || '(tanpa nama)'));
  pohon.push('studio   : ' + (p.studio || '?'));
  pohon.push('');
  for (const prog of p.programs) {
    pohon.push(prog.name);
    for (const s of prog.sections) {
      const n = (s.rungs || []).length;
      pohon.push('    ' + (s.name + '').padEnd(38) +
                 (s.kind === 'st' ? 'ST ' + (s.st || '').length + ' char'
                  : s.kind === 'ladder' ? n + ' rung' : '(kosong)'));
      nSect++;
      const rel = path.join(safe(prog.name), safe(s.name) + '.txt');
      if (s.kind === 'st') { tulis(rel, (s.st || '') + '\n'); continue; }
      const L = [];
      (s.rungs || []).forEach((r, i) => { L.push(...rungLines(r, i)); nRung++; });
      tulis(rel, L.join('\n') + '\n');
    }
  }
  tulis('program.txt', pohon.join('\n') + '\n');

  // Tabel variabel diurut per nama, bukan per urutan simpan: menambah satu variabel di Studio
  // bisa menggeser seluruh tabel, dan diff-nya jadi ratusan baris buat satu penambahan.
  const vars = (p.variables || []).slice().sort((a, b) => (a.name > b.name ? 1 : -1));
  tulis('variables.tsv',
        vars.map(v => [v.name, v.type, v.address, v.group, (v.comment || '').replace(/\s+/g, ' ')]
                        .join('\t')).join('\n') + '\n');

  // Komen elemen array (AL[n]/MF[n]) berkas sendiri - itu teks alarm, dan yang paling sering
  // ditanya "kapan berubah jadi ini".
  const el = [];
  for (const v of vars) {
    if (!v.elementComments) continue;
    for (const k of Object.keys(v.elementComments).sort((a, b) => a - b)) {
      el.push(v.name + '[' + k + ']\t' + v.elementComments[k]);
    }
  }
  tulis('arraycomments.tsv', el.join('\n') + (el.length ? '\n' : ''));

  console.log('WROTE ' + out);
  console.log('  ' + p.programs.length + ' program, ' + nSect + ' section, ' + nRung + ' rung, ' +
              vars.length + ' variabel, ' + el.length + ' komen elemen');
  console.log('');
  console.log('Commit folder ini di samping .smc2-nya. Diff-nya baru kebaca dari sini;');
  console.log('.smc2 sendiri ZIP, jadi git cuma bisa bilang "binary files differ".');
})().catch(e => { console.error('GAGAL: ' + e.message); process.exit(1); });
