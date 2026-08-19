// Tambah SECTION LADDER langsung ke .smc2 - tanpa lewat XML import.
//
//   node scripts/smc2_section.js <project.smc2> <spec.json>           lihat dulu
//   node scripts/smc2_section.js <project.smc2> <spec.json> --write   tulis
//
// SUDAH DIBUKTIKAN DI STUDIO (probe 2, 19 Agustus 2026). Tiga hal yang dijawab probe itu, dan
// ketiganya menentukan berkasnya diterima atau tidak:
//
//   1. AKHIRAN BARIS WAJIB CRLF. Ini bukan selera. Berkas yang berakhir "}\n" menghasilkan
//      section yang MUNCUL di Multiview Explorer dengan rung KOSONG, dan Studio mengeluh
//      "No instruction in rung" - bukan "berkas rusak". Varian LF dan CRLF diuji berdampingan
//      di satu berkas; yang CRLF terisi, yang LF kosong. Sisanya identik.
//   2. Urutan entri di dalam ZIP TIDAK berpengaruh. Varian yang ditaruh sesudah .oem sama
//      berhasilnya dengan yang sebelum.
//   3. Kotak inline ST (__type IST) JALAN. Itu jalan keluar untuk operasi yang di ladder butuh
//      blok yang belum terbukti - perbandingan STRING, misalnya.
//
// Nama section dibatasi Studio, dan pelanggarannya baru kelihatan setelah project dibuka:
// tidak boleh diawali garis bawah, angka, atau "P_"; tidak boleh diakhiri garis bawah; tidak
// boleh ada dua garis bawah berturut-turut; maksimal 127 byte. Diperiksa di sini, sebelum
// apa pun ditulis.
//
// Yang TIDAK dilakukan: menyunting rung yang sudah ada. Menambah section baru itu menulis
// sesuatu yang sepenuhnya kita susun sendiri; menyunting rung lama berarti memahami dulu rung
// yang cuma ~54% bisa diterjemahkan reader dengan eksak. Dua hal yang berbeda jauh risikonya.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
const { packZip } = require(path.join(__dirname, 'smc2_write.js'));

const BOM = '﻿';
const guid = () => crypto.randomUUID();

// ---- nama section ------------------------------------------------------------------------
// Aturannya diambil dari pesan Studio sendiri, bukan ditebak.
function namaSah(n) {
  if (!n || Buffer.byteLength(n, 'utf8') > 127) return 'panjang 1..127 byte';
  if (/^[0-9_]/.test(n)) return 'tidak boleh diawali angka atau garis bawah';
  if (/^P_/.test(n)) return 'tidak boleh diawali "P_"';
  if (/_$/.test(n)) return 'tidak boleh diakhiri garis bawah';
  if (/__/.test(n)) return 'tidak boleh dua garis bawah berturut-turut';
  if (/[^A-Za-z0-9_]/.test(n)) return 'cuma huruf, angka, dan garis bawah';
  return null;
}

// ---- penyusun rung -------------------------------------------------------------------------
// Bentuk JSON-nya ditiru dari rung yang ditulis Studio sendiri (P011/AutoRunning rung 1), bukan
// dikarang. Tiga sifat yang gampang terlewat dan semuanya menentukan:
//
//   * `Ix` itu penghitung GLOBAL satu rung: elemen dulu, lalu LRI, lalu RRI, lalu tiap VL.
//   * `HL` (pengisi kolom kosong di baris cabang) TIDAK ikut menghabiskan Ix.
//   * `X`, `Y`, dan `Ix` DIHILANGKAN kalau nilainya 0 - itu yang Studio lakukan, dan menuliskan
//     nol secara eksplisit membuat berkasnya beda dari tulisan Studio tanpa alasan.
function bangunRung(spec) {
  const cls = [];
  let ix = 0;
  const pakaiIx = () => ix++;
  const taruh = (o, x, y) => { if (x) o.X = x; if (y) o.Y = y; cls.push(o); return o; };

  // kontak: "NAMA" biasa, "/NAMA" NC, "^NAMA" naik, "vNAMA" turun
  const kontak = (t, x, y) => {
    let v = String(t), not = false, up = false, dwn = false;
    if (v[0] === '/') { not = true; v = v.slice(1); }
    else if (v[0] === '^') { up = true; v = v.slice(1); }
    else if (v[0] === 'v') { dwn = true; v = v.slice(1); }
    const o = { __type: 'LD' };
    const i = pakaiIx(); if (i) o.Ix = i;
    if (not) o.Not = true;
    if (up) o.Up = true;
    if (dwn) o.Dwn = true;
    o.Var = v;
    return taruh(o, x, y);
  };
  const hl = (x, y) => taruh({ __type: 'HL' }, x, y);
  const coil = (t, x, y) => {
    let v = String(t), neg = false, set = false, rst = false;
    if (v[0] === '/') { neg = true; v = v.slice(1); }
    else if (v[0] === 'S') { set = true; v = v.slice(1); }
    else if (v[0] === 'R') { rst = true; v = v.slice(1); }
    const o = { __type: 'ST' };
    const i = pakaiIx(); if (i) o.Ix = i;
    if (neg) o.Neg = true;
    if (set) o.S = true;
    if (rst) o.RS = true;
    o.Var = v;
    return taruh(o, x, y);
  };
  const ist = (txt, x, y) => {
    const o = { __type: 'IST', EID: spec._eid };
    const i = pakaiIx(); if (i) o.Ix = i;
    // Baris ST dipisah CRLF, bukan LF - sama seperti berkas section-nya sendiri.
    o.H = spec.h || 80; o.TXT = String(txt).replace(/\r?\n/g, '\r\n'); o.W = spec.w || 600;
    return taruh(o, x, y);
  };

  const seri = spec.seri || [];
  const seal = spec.seal || [];          // cabang OR di baris 1, bergabung sesudah `seri`
  const ekor = spec.ekor || [];          // kontak sesudah titik gabung
  const vls = [];

  // baris 0 sampai titik gabung
  seri.forEach((t, i) => kontak(t, i, 0));
  let x = seri.length;

  if (seal.length) {
    // Baris cabang: kontaknya dulu, lalu HL mengisi SISA kolom sampai titik gabung. Tanpa HL,
    // jalur baris itu putus di tengah - bukan "nyambung saja".
    seal.forEach((t, i) => kontak(t, i, 1));
    for (let k = seal.length; k < x; k++) hl(k, 1);
  }

  ekor.forEach((t, i) => kontak(t, x + i, 0));
  x += ekor.length;

  if (spec.st) ist(spec.st, x, 0), x += 1;
  if (spec.coil) coil(spec.coil, x, 0), x += 1;

  const lri = pakaiIx(), rri = pakaiIx();
  // Palang penutup cabang: satu ruas di TEPI KIRI kolom titik gabung, menyambung baris 0 dan 1.
  // Studio cuma menyimpan palang PENUTUP - pembukanya rel kiri itu sendiri.
  if (seal.length) { const o = { Ix: pakaiIx(), X: seri.length }; vls.push(o); }

  return jsonStudio({ CLs: cls, CMT: spec.cmt || '', LRI: lri, RRI: rri, VLs: vls });
}

// Studio menulis JSON-nya dengan escape yang LEBIH PANJANG dari yang wajib: baris baru sebagai
// backslash-u000d backslash-u000a (bukan backslash-r backslash-n), tab sebagai backslash-u0009,
// dan garis miring sebagai backslash-slash. Bentuk pendek tetap JSON yang sah, tapi pembaca
// Studio tidak mengenalinya - dan cara gagalnya menipu:
//
//   seluruh TXT kotak inline ST terbaca sebagai SATU baris. Karena baris pertama biasanya
//   komentar '//', semuanya jadi komentar, dan Studio mengeluh
//   "There must be at least one line of valid code (excluding comments)" di line 1 column 0 -
//   bukan "escape tidak dikenal". Sudah kejadian sekali; jangan dipendekkan lagi.
//
// Aman dilakukan sesudah stringify: ketiga urutan itu cuma muncul di dalam string, tidak pernah
// jadi bagian struktur JSON-nya.
function jsonStudio(o) {
  return JSON.stringify(o)
    .replace(/\\r/g, '\\u000d')
    .replace(/\\n/g, '\\u000a')
    .replace(/\\t/g, '\\u0009')
    .replace(/\//g, '\\/');
}

// ---- .oem ----------------------------------------------------------------------------------
const ent = (tipe, sub, id, nama, isi, now) =>
  '<Entity type="' + tipe + '"' + (sub === null ? '' : ' subtype="' + sub + '"')
  + ' id="' + id + '" name="' + nama + '" version="0" dateCreated="' + now
  + '" dateLastModified="' + now + '" trackingId="' + guid() + '"'
  + (tipe === 'PouBody' ? ' DN="' + nama + '"' : '') + '>'
  + '<AccessInfos />' + (isi ? '<ChildEntities>' + isi + '</ChildEntities>' : '<ChildEntities />')
  + '</Entity>';

// Batas elemen dicari dengan menghitung kedalaman <Entity>, bukan mencocokkan teks: entity
// bersarang beberapa tingkat dan <Entity ... /> yang menutup sendiri tidak boleh ikut dihitung.
// Salah batas = section nyasar ke program lain, dan itu tidak kelihatan sampai project dibuka.
function batasEntity(s, mulai) {
  const re = /<Entity\b[^>]*?(\/)?>|<\/Entity>/g;
  re.lastIndex = mulai;
  let d = 0, m;
  while ((m = re.exec(s))) {
    if (m[0] === '</Entity>') { d--; if (d === 0) return m.index; }
    else if (!m[1]) d++;
  }
  return -1;
}

// ---- tabel variabel program ----------------------------------------------------------------
// Bentuknya teks berbaris "[SLWD version=1.0]", satu variabel satu baris, dikelompokkan:
//   +GN=VAR            GVT=DefaultGroup
//   +GN=VAR_EXTERNAL   GA=External  GVT=ExternalGroup
// Baris baru diselipkan di AKHIR grupnya masing-masing, bukan di akhir berkas: baris VAR yang
// nyasar ke bawah kepala VAR_EXTERNAL ikut jadi external, dan bedanya tidak kelihatan sampai
// simbolnya dipakai rung.
//
// `ExternalVars` itu per-program. Simbol global yang tidak didaftar di program ini TETAP tidak
// dikenal walau sudah ada di tabel global - lolos semua pemeriksaan, lalu muncul merah di
// Studio. Itu sebabnya penambahan variabel dan penambahan section dikerjakan sekali jalan:
// rung yang memakai simbol yang belum didaftar tidak akan pernah benar.
function sisipVars(teks, vars, grupPaksa) {
  const CRLF = '\r\n';
  const baris = teks.split(/\r?\n/);
  const tambah = [];
  vars.forEach(v => {
    const grup = grupPaksa || (v.external ? 'VAR_EXTERNAL' : 'VAR');
    // Nama tanpa TAB di belakang juga dianggap sudah ada: baris terakhir sebuah variabel boleh
    // berakhir tepat sesudah namanya (tanpa Com=), dan yang begitu tetap tidak boleh didobel.
    if (new RegExp('\\tN=' + v.name + '(\\t|$)', 'm').test(teks)) { tambah.push({ v, sudah: true }); return; }
    // akhir grup = baris terakhir sebelum kepala grup berikutnya (atau akhir berkas)
    let mulai = baris.findIndex(l => l.indexOf('+GN=' + grup + '\t') === 0);
    if (mulai < 0) throw new Error('grup ' + grup + ' tidak ada di tabel variabel program ini');
    let akhir = mulai + 1;
    while (akhir < baris.length && !/^\+GN=/.test(baris[akhir])) akhir++;
    while (akhir > mulai + 1 && !baris[akhir - 1].trim()) akhir--;
    // Urutan medan terikat, dan ini urutan yang dipakai Studio sendiri:
    //   D  ->  N  ->  AT  ->  R  ->  G  ->  Com
    // Retain (R=1) itu medan per-variabel di sini, bukan atribut kontainer seperti di XML
    // import - dua jalur yang sama-sama sah tapi bentuknya beda, jangan tertukar.
    let l = '++D=' + (v.type || 'BOOL') + '\tN=' + v.name;
    if (v.at) l += '\tAT=' + v.at;
    if (v.retain) l += '\tR=1';
    l += '\tG=' + grup + '\tCom=' + (v.cmt || '');
    baris.splice(akhir, 0, l);
    tambah.push({ v, sudah: false });
  });
  // Berkas ini CRLF dan diakhiri CRLF - sama seperti berkas ladder, dan alasannya sama.
  let hasil = baris.join(CRLF);
  if (!/\r\n$/.test(hasil)) hasil += CRLF;
  return { teks: hasil, tambah };
}

/**
 * spec: { program, vars: [ {name, type, cmt, external} ], sections: [ { name, rungs: [rungSpec] } ] }
 * rungSpec: { cmt, seri:[], seal:[], ekor:[], st:'kode ST', coil:'NAMA' }
 */
async function tambahSection(buf, spec) {
  const now = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    .replace(/,/, '') + ' ' + new Date().toTimeString().slice(0, 8);

  const asli = [];
  let oemName = null, oemText = null;
  for (const [nama, e] of unzip(buf)) {
    const data = Buffer.from(await inflate(e));
    if (nama.endsWith('.oem')) { oemName = nama; oemText = data.toString('utf8'); }
    asli.push({ name: nama, data });
  }
  if (!oemText) throw new Error('.oem tidak ketemu - ini bukan project Sysmac');
  const dir = oemName.split('/')[0];

  const iProg = oemText.indexOf('name="' + spec.program + '"');
  if (iProg < 0) throw new Error('program "' + spec.program + '" tidak ada di project ini');
  const mulai = oemText.lastIndexOf('<Entity ', iProg);
  const akhir = batasEntity(oemText, mulai);
  if (akhir < 0) throw new Error('batas entity ' + spec.program + ' tidak ketemu');
  const tutup = oemText.lastIndexOf('</ChildEntities>', akhir);
  if (tutup < mulai) throw new Error('ChildEntities ' + spec.program + ' tidak ketemu');

  // trackingId program dipakai artefak compile - dibaca dari .oem, bukan dikarang.
  const tid = (/trackingId="([^"]+)"/.exec(oemText.slice(mulai, iProg + 400)) || [])[1] || guid();

  // Tabel variabel program: entity Variables/Ladder di dalam program ini. Id-nya dibaca dari
  // .oem, bukan dicari dengan menebak isi berkas - dua program bisa punya tabel yang mirip.
  const mVar = /<Entity type="Variables" subtype="Ladder" id="([^"]+)"/.exec(oemText.slice(mulai, akhir));
  const varId = mVar && mVar[1];
  let varTambah = [];
  if (spec.vars && spec.vars.length) {
    if (!varId) throw new Error('tabel variabel ' + spec.program + ' tidak ketemu di .oem');
    const idx = asli.findIndex(e => e.name === dir + '/' + varId + '.xml');
    if (idx < 0) throw new Error('berkas tabel variabel tidak ada di container');
    const r = sisipVars(asli[idx].data.toString('utf8'), spec.vars);
    asli[idx] = { name: asli[idx].name, data: Buffer.from(r.teks, 'utf8') };
    varTambah = r.tambah;
  }

  // Tabel GLOBAL berkas tersendiri (Entity Variables/Global), satu untuk seluruh project.
  // Variabel global yang dipakai program ini TETAP harus didaftar lagi sebagai VAR_EXTERNAL di
  // tabel programnya - dua tempat, dua tujuan, dan yang lupa didaftar muncul merah di Studio
  // tanpa satu pun pemeriksaan lain mengeluh.
  let globTambah = [];
  if (spec.globals && spec.globals.length) {
    const mg = /<Entity type="Variables" subtype="Global" id="([^"]+)"/.exec(oemText);
    if (!mg) throw new Error('tabel variabel global tidak ketemu di .oem');
    const gi = asli.findIndex(e => e.name === dir + '/' + mg[1] + '.xml');
    if (gi < 0) throw new Error('berkas tabel global tidak ada di container');
    const r = sisipVars(asli[gi].data.toString('utf8'), spec.globals, 'VAR_GLOBAL');
    asli[gi] = { name: asli[gi].name, data: Buffer.from(r.teks, 'utf8') };
    globTambah = r.tambah;
  }

  const berkasBaru = [];
  let sisip = '';
  const lapor = [];

  for (const s of spec.sections) {
    const salah = namaSah(s.name);
    if (salah) throw new Error('nama section "' + s.name + '" ditolak Studio: ' + salah);
    if (oemText.slice(mulai, akhir).indexOf('name="' + s.name + '"') >= 0)
      throw new Error('section "' + s.name + '" sudah ada di ' + spec.program);

    const pbId = guid(), shId = guid(), pbshId = guid();
    const baris = [];
    let anakIST = '';
    s.rungs.forEach(r => {
      if (r.st) { r._eid = guid(); anakIST += ent('Inline', 'StructuredText', r._eid, 'InlineST', '', now); }
      baris.push(bangunRung(r));
    });
    // CRLF, dan baris terakhir JUGA diakhiri CRLF - itu bentuk tulisan Studio, dan LF membuat
    // rung-nya hilang tanpa berkasnya dianggap rusak.
    const isi = BOM + baris.map(b => b + '\r\n').join('');
    berkasBaru.push({ name: dir + '/' + pbId + '.xml', data: Buffer.from(isi, 'utf8') });
    berkasBaru.push({
      name: dir + '/' + pbshId + '.xml',
      data: Buffer.from(BOM + '<?xml version="1.0" encoding="utf-8"?><data><SectionUsingMCOrMcr>false</SectionUsingMCOrMcr>'
        + '<CxilVariableGroup POUTrackingId="' + tid + '" /></data>', 'utf8'),
    });
    sisip += ent('PouBody', 'Ladder', pbId, s.name,
      ent('SourceHolder', '', shId, 'Source', '', now)
      + ent('PouBodySourceHolder', '', pbshId, 'PouBodySourceHolder', '', now)
      + anakIST, now);
    lapor.push({ name: s.name, rungs: s.rungs.length, ist: s.rungs.filter(r => r.st).length });
  }

  const oemBaru = oemText.slice(0, tutup) + sisip + oemText.slice(tutup);
  const entries = [];
  for (const e of asli) {
    if (e.name === oemName) { entries.push(...berkasBaru); entries.push({ name: oemName, data: Buffer.from(oemBaru, 'utf8') }); }
    else entries.push(e);
  }
  return { buf: packZip(entries), entries, lapor, varTambah, globTambah };
}

module.exports = { tambahSection, bangunRung, namaSah };

// ------------------------------------------------------------------------------------ CLI
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const write = args.includes('--write');
    const rest = args.filter(a => a !== '--write');
    if (rest.length < 2) {
      console.error('pakai: node scripts/smc2_section.js <project.smc2> <spec.json> [--write]');
      process.exit(2);
    }
    const [smcPath, specPath] = rest;
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const buf = fs.readFileSync(smcPath);
    const { buf: keluar, entries, lapor, varTambah, globTambah } = await tambahSection(buf, spec);

    console.log('.smc2   : ' + path.basename(smcPath));
    console.log('program : ' + spec.program);
    lapor.forEach(l => console.log('  + ' + l.name.padEnd(20) + l.rungs + ' rung'
      + (l.ist ? '   (' + l.ist + ' kotak inline ST)' : '')));
    if (globTambah && globTambah.length) {
      console.log('');
      console.log('variabel GLOBAL:');
      globTambah.forEach(t => console.log('  ' + (t.sudah ? '  = ' : '  + ') + t.v.name.padEnd(14)
        + (t.v.type || 'BOOL').padEnd(26) + (t.v.at ? 'AT=' + t.v.at + ' ' : '')
        + (t.v.retain ? 'retain ' : '') + (t.sudah ? '  sudah ada, dilewati' : '')));
    }
    if (varTambah && varTambah.length) {
      console.log('');
      console.log('variabel:');
      varTambah.forEach(t => console.log('  ' + (t.sudah ? '  = ' : '  + ') + t.v.name.padEnd(22)
        + (t.v.external ? 'VAR_EXTERNAL' : 'VAR').padEnd(14)
        + (t.sudah ? 'sudah ada, dilewati' : (t.v.cmt || ''))));
    }

    if (!write) {
      console.log('');
      console.log('Belum ada yang ditulis. Tambahkan --write kalau sudah cocok.');
      console.log('Tutup Sysmac Studio dulu - project yang sedang dibuka akan menimpa balik.');
      return;
    }

    // Dibongkar ulang dan dibandingkan SEBELUM berkas aslinya disentuh.
    let cek = 0;
    for (const [nama, e] of unzip(keluar)) {
      const d = Buffer.from(await inflate(e));
      const a = entries.find(x => x.name === nama);
      if (!a || !d.equals(a.data)) { console.error('GAGAL: hasil kemasan beda di ' + nama); process.exit(1); }
      cek++;
    }
    if (cek !== entries.length) { console.error('GAGAL: entri hilang (' + cek + ' vs ' + entries.length + ')'); process.exit(1); }
    console.log('periksa ulang: ' + cek + ' entri dibongkar balik, isinya sama persis');

    const t = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    let bak = smcPath + '.' + t + '.bak', n = 1;
    while (fs.existsSync(bak)) bak = smcPath + '.' + t + '-' + (++n) + '.bak';
    fs.copyFileSync(smcPath, bak);
    fs.writeFileSync(smcPath, keluar);
    console.log('cadangan : ' + bak);
    console.log('DITULIS  : ' + lapor.length + ' section di ' + smcPath);
    console.log('Buka di Studio, lalu Build.');
  })().catch(e => { console.error('GAGAL: ' + e.message); process.exit(1); });
}
