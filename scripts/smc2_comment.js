// Tulis komen elemen AL/MF langsung ke .smc2 - menghapus tempel ArrayComments.tsv.
//
//   node scripts/smc2_comment.js <project.smc2> <ArrayComments.tsv|project.json>          lihat
//   node scripts/smc2_comment.js <project.smc2> <ArrayComments.tsv|project.json> --write  tulis
//
// BELUM TERBUKTI. Ini menulis ke PROGRAM MESIN, bukan ke layar HMI: .smc2 yang rusak jauh lebih
// mahal daripada .nbp yang rusak. Buktikan dulu dengan --write ke SALINAN, buka di Studio,
// pastikan project-nya utuh dan komennya berubah. Baru dipakai ke yang asli.
//
// Yang disentuh CUMA medan EC= di baris tabel variabel - teks polos di dalam ZIP, kelas yang
// sama dengan mengganti <Font> di .nbp. Rung TIDAK disentuh sama sekali, dan jangan
// ditambahkan tanpa bukti: reader cuma menerjemahkan ~54% rung dengan eksak.
'use strict';
const fs = require('fs');
const path = require('path');
const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
const { packZip } = require(path.join(__dirname, 'smc2_write.js'));

const args = process.argv.slice(2);
const write = args.includes('--write');
const rest = args.filter(a => a !== '--write');
if (rest.length < 2) {
  console.error('pakai: node scripts/smc2_comment.js <project.smc2> <ArrayComments.tsv|project.json> [--write]');
  process.exit(2);
}
const [smcPath, srcPath] = rest;

// Komen sumber: dari ArrayComments.tsv (kolom 1 nama, kolom 8 komen) atau digenerate dari
// project JSON. Dibedakan dari isinya, bukan nama berkasnya.
function bacaSumber(p) {
  const raw = fs.readFileSync(p, 'utf8');
  const peta = {};
  if (raw.indexOf('\t') >= 0 && /^(Name\t|AL\[|MF\[)/m.test(raw)) {
    raw.split(/\r?\n/).forEach(l => {
      const c = l.split('\t');
      if (/^(AL|MF)\[\d+\]$/.test(c[0]) && c[7]) peta[c[0]] = c[7];
    });
    return { peta, dari: 'ArrayComments.tsv' };
  }
  const core = require(path.join(__dirname, 'core.js'));
  const out = core.generate(JSON.parse(raw));
  const tsv = out.files.find(f => f.name === 'ArrayComments.tsv');
  tsv.xml.split(/\r?\n/).forEach(l => {
    const c = l.split('\t');
    if (/^(AL|MF)\[\d+\]$/.test(c[0]) && c[7]) peta[c[0]] = c[7];
  });
  return { peta, dari: 'digenerate dari ' + path.basename(p) };
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

(async function main() {
  let buf;
  try { buf = fs.readFileSync(smcPath); } catch (e) { console.error('.smc2 tidak terbaca: ' + e.message); process.exit(2); }
  const { peta, dari } = bacaSumber(srcPath);
  const jml = Object.keys(peta).length;
  if (!jml) { console.error('tidak ada komen elemen AL/MF di sumbernya.'); process.exit(1); }

  // SEMUA entri dibaca dan disimpan apa adanya. Yang tidak dimengerti tidak ditulis ulang -
  // .manifest, .oem, .log dan XML lain ikut byte per byte.
  const entries = [];
  let ubah = 0, sentuh = [];
  for (const [nama, e] of unzip(buf)) {
    const data = Buffer.from(await inflate(e));
    let s = null;
    try { s = data.toString('utf8'); } catch (err) { s = null; }
    if (s && s.indexOf('[SLWD version') >= 0 && s.indexOf('EC=<ECs>') >= 0) {
      const baru = s.replace(/(\tN=(AL|MF)\t[^\n]*?EC=)(<ECs>[\s\S]*?<\/ECs>)/g, (m, kepala, arr, ecs) => {
        const isi = ecs.replace(/<EC EK="\[(\d+)\]" C="([^"]*)"/g, (m2, idx, lama) => {
          const k = arr + '[' + idx + ']';
          if (!(k in peta) || peta[k] === lama) return m2;
          ubah++;
          if (sentuh.length < 5) sentuh.push('  ' + k + '   ' + lama + '   ->   ' + peta[k]);
          return '<EC EK="[' + idx + ']" C="' + escAttr(peta[k]) + '"';
        });
        return kepala + isi;
      });
      if (baru !== s) { entries.push({ name: nama, data: Buffer.from(baru, 'utf8') }); continue; }
    }
    entries.push({ name: nama, data });
  }

  console.log('.smc2  : ' + path.basename(smcPath) + '   ' + entries.length + ' entri di dalam container');
  console.log('sumber : ' + dari + '   ' + jml + ' komen elemen');
  console.log('komen yang berubah : ' + ubah);
  sentuh.forEach(x => console.log(x));
  if (!ubah) { console.log('\nTidak ada yang perlu diubah.'); return; }

  if (!write) {
    console.log('');
    console.log('Belum ada yang ditulis. Tambahkan --write kalau sudah cocok.');
    console.log('COBA KE SALINAN DULU. Ini program mesin - .smc2 yang rusak jauh lebih mahal');
    console.log('daripada .nbp yang rusak, dan menulis ke .smc2 BELUM pernah dibuktikan.');
    console.log('Tutup Sysmac Studio dulu sebelum menulis.');
    return;
  }

  const keluar = packZip(entries);
  // Diperiksa SEBELUM berkas aslinya disentuh: dibongkar ulang dan dibandingkan. ZIP yang
  // rusak baru ketahuan waktu Studio menolak membuka project, dan waktu itu berkasnya sudah
  // tertimpa.
  let cek = 0;
  for (const [nama, e] of unzip(keluar)) {
    const d = Buffer.from(await inflate(e));
    const asli = entries.find(x => x.name === nama);
    if (!asli || !d.equals(asli.data)) { console.error('GAGAL: hasil kemasan tidak sama isinya di ' + nama); process.exit(1); }
    cek++;
  }
  if (cek !== entries.length) { console.error('GAGAL: entri hilang waktu dikemas (' + cek + ' vs ' + entries.length + ')'); process.exit(1); }
  console.log('periksa ulang: ' + cek + ' entri dibongkar balik, isinya sama persis');

  const t = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  let bak = smcPath + '.' + t + '.bak', n = 1;
  while (fs.existsSync(bak)) bak = smcPath + '.' + t + '-' + (++n) + '.bak';
  fs.copyFileSync(smcPath, bak);
  fs.writeFileSync(smcPath, keluar);
  console.log('cadangan : ' + bak);
  console.log('DITULIS  : ' + ubah + ' komen di ' + smcPath);
  console.log('Buka di Sysmac Studio dan PASTIKAN project-nya utuh sebelum memakainya.');
})().catch(e => { console.error(e.message); process.exit(1); });
