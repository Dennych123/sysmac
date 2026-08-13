// Uji ekspor .smc2 -> XML importable.
//
// Cara mengujinya BUKAN dengan mencocokkan potongan teks XML - itu cuma menguji
// bahwa penulisnya konsisten dengan dirinya sendiri. Yang diuji: XML hasil ekspor
// DIBACA BALIK sebagai rangkaian (telusuri connectionPointOutId dari coil ke rel
// kiri), lalu ekspresi booleannya dibandingkan dengan logika yang seharusnya.
//
// Itu penting justru karena kesalahan di sini TIDAK berisik: nomor sambungan yang
// salah tetap menghasilkan XML yang sah, tetap ter-import Sysmac tanpa keluhan,
// dan baru ketahuan waktu mesinnya jalan.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const { unzip } = require(path.join(ROOT, 'src', 'zip.js'));
const { readProject } = require(path.join(ROOT, 'src', 'smc2.js'));
const { xmlParse, xmlFindAll } = require(path.join(ROOT, 'src', 'xml.js'));
const { rungNet } = require(path.join(ROOT, 'src', 'net.js'));
const { rungToXml } = require(path.join(ROOT, 'src', 'xmlout.js'));
const { exportProject, loadLib } = require(path.join(ROOT, 'xml_out.js'));

let bad = 0;
const chk = (name, ok, info) => {
  console.log((ok ? 'OK  ' : 'BAD ') + name + (info ? '   ' + info : ''));
  if (!ok) bad++;
};

// ------------------------------------------------- baca balik <Rung> jadi ekspresi
/**
 * Telusuri graf sambungan sebuah <Rung>: tiap objek punya connectionPointOutId,
 * dan menunjuk ke hulunya lewat refConnectionPointOutId. Dari tiap coil ditelusuri
 * mundur sampai LeftPowerRail.
 * @returns {{coils: Array<{op:string, expr:string}>, dangling: number}}
 */
function readRung(rungNode) {
  const byOut = new Map();
  const objs = [];
  for (const o of rungNode.kids) {
    const ty = o.attrs['xsi:type'];
    if (!ty) continue;
    const outs = xmlFindAll(o, 'ConnectionPointOut')
      .map(c => c.attrs.connectionPointOutId).filter(Boolean);
    const ins = xmlFindAll(o, 'Connection')
      .map(c => c.attrs.refConnectionPointOutId).filter(Boolean);
    const rec = { ty, op: o.attrs.operand || '', neg: o.attrs.negated === 'true',
                  edge: o.attrs.edge || '', outs, ins };
    objs.push(rec);
    outs.forEach(id => byOut.set(id, rec));
  }

  let dangling = 0;
  objs.forEach(o => o.ins.forEach(id => { if (!byOut.has(id)) dangling++; }));

  const seen = new Set();
  function upstream(ids) {
    const parts = ids.map(id => expr(byOut.get(id))).filter(s => s !== null);
    if (!parts.length) return null;
    return parts.length === 1 ? parts[0] : '(' + parts.join(' OR ') + ')';
  }
  function expr(o) {
    if (!o) return null;
    if (o.ty === 'LeftPowerRail') return '';
    const key = o.outs.join(',');
    if (seen.has(key)) return '?LOOP';      // rangkaian melingkar - jangan menggantung
    seen.add(key);
    const up = upstream(o.ins);
    seen.delete(key);
    const me = (o.neg ? '/' : '') + o.op + (o.edge ? '^' + o.edge : '');
    if (up === null) return null;
    return up ? up + ' AND ' + me : me;
  }

  const coils = objs.filter(o => o.ty === 'Coil').map(o => ({
    op: (o.neg ? '/' : '') + o.op,
    expr: upstream(o.ins),
  }));
  return { coils, dangling };
}

function rungsOf(xml) {
  return xmlFindAll(xmlParse(xml), 'Rung');
}
const commentOf = r => {
  const c = xmlFindAll(r, 'Content')[0];
  return c ? c.text : '';
};

// =========================================================== fixture (selalu jalan)
const fixture = path.join(__dirname, 'fixtures', 'synthetic.smc2');
const proj = readProject(fs.readFileSync(fixture), unzip);

(async () => {
  const p = await proj;
  const { files, report } = exportProject(p);

  chk('menghasilkan berkas XML', files.length >= 1, files.length + ' berkas');

  const all = files.flatMap(f => rungsOf(f.xml));
  const srcRungs = p.programs.reduce((a, pr) =>
    a + pr.sections.reduce((b, s) => b + (s.kind === 'ladder' ? s.rungs.length : 0), 0), 0);
  // Rung yang dilewati tetap menempati tempatnya sebagai rung komentar. Kalau
  // jumlahnya menyusut, ada logika yang hilang diam-diam dan nomor rung bergeser.
  chk('jumlah rung utuh (lubang tetap menempati tempatnya)', all.length === srcRungs,
      all.length + ' vs ' + srcRungs + ' rung sumber');

  const dang = all.reduce((a, r) => a + readRung(r).dangling, 0);
  chk('tidak ada sambungan menggantung', dang === 0, dang + ' ref tanpa tujuan');

  // --- logika tiap rung, dibaca BALIK dari XML ---
  const got = new Map();
  all.forEach(r => readRung(r).coils.forEach(c => {
    if (c.expr !== null) got.set(c.op + '@' + (got.has(c.op) ? 'b' : 'a'), c.expr);
  }));
  const one = op => {
    const hits = all.flatMap(r => readRung(r).coils).filter(c => c.op === op && c.expr !== null);
    return hits.length === 1 ? hits[0].expr : hits.length + ' coil bernama ' + op;
  };

  chk('seri: LB100 AND LB101 -> LB102', one('LB102') === 'LB100 AND LB101', one('LB102'));
  chk('cabang: (LB110 OR LB111) AND LB112 -> LB113',
      one('LB113') === '(LB110 OR LB111) AND LB112', one('LB113'));

  // Langkah gerakan: cmd digerbang NC confirm; confirm menyeal diri lewat titik
  // SETELAH prevBit - kalau sealnya tersambung ke rel kiri, bitnya nyangkut
  // selamanya dan itu tetap ter-import tanpa keluhan.
  chk('motion: cmd = prev ANDNOT confirm',
      one('LB202') === 'LB200 AND /LB203', one('LB202'));
  // Urutan cabang OR mengikuti urutan penulisan (kolom, lalu baris): kontak seal
  // di kolom 1 tertulis sebelum LSC di kolom 2. Urutannya tidak mengubah arti,
  // tapi dipatok di sini supaya perubahan urutan penulisan ketahuan.
  chk('motion: confirm menyeal SETELAH prevBit, bukan dari rel kiri',
      one('LB203') === '(LB200 AND LB203 OR LB200 AND SOL_CLAMP_FWD AND LSC_CLAMP_FWD)',
      one('LB203'));

  // --- lubang ---
  const holes = all.map(commentOf).filter(c => /TIDAK DIEKSPOR/.test(c));
  chk('coil Set/Reset ditolak, tidak ditulis sebagai coil biasa',
      holes.some(c => /coil Set/.test(c)), holes.join(' | ').slice(0, 120));
  chk('rung blok fungsi jadi lubang', holes.some(c => /blok fungsi/.test(c)));
  chk('lubang menuliskan logika aslinya', holes.every(c => c.length > 20));
  chk('jumlah lubang cocok dengan laporan', holes.length === report.holes,
      holes.length + ' vs ' + report.holes);

  // Kontak edge dan coil Set/Reset harus terbaca di KEDUA format: JSON (>= 1.66,
  // lewat flag S/RS/Up/Dwn) dan DataContract (<= 1.56, lewat elemen Set/Reset/
  // PositiveTransitionSensing). Di JSON dua-duanya sempat tidak dibaca sama sekali,
  // jadi coil Set terbaca sebagai coil biasa - tanpa error, cuma artinya lain.
  const els = p.programs.flatMap(pr => pr.sections).flatMap(s => s.rungs || [])
    .flatMap(r => r.elements);
  const edge = els.filter(e => e.edge);
  chk('kontak edge terbaca (JSON + DataContract)', edge.length === 3,
      edge.map(e => e.var + ':' + e.edge).join(' '));
  const sets = els.filter(e => e.set || e.reset);
  chk('coil Set/Reset terbaca (JSON + DataContract)', sets.length === 3,
      sets.map(e => e.var + (e.set ? ':S' : ':R')).join(' '));

  // ============================================ net.js: kasus tepi (unit murni)
  // Rung buatan langsung, tanpa lewat pipeline .smc2 - lebih murah daripada
  // menambah fixture bersama (indeksnya dipakai banyak tes lain di sini dan di
  // fixture.test.js) dan lebih tepat sasaran: yang diuji cuma net.js/xmlout.js.
  const L = loadLib();

  // VL yang X-nya di luar rentang kolom rung. rungNet() harus MENOLAK, bukan
  // diam-diam mengabaikan palang itu - palang yang diabaikan berarti cabang
  // yang seharusnya nyambung malah lepas, dan itu lolos tanpa error import.
  {
    const rung = { comment: '', elements: [
      { kind: 'Contact', var: 'A', x: 0, y: 0 }, { kind: 'Coil', var: 'B', x: 1, y: 0 },
    ], vlinks: [{ Ix: 1, X: 9, Y: 0 }] };
    const net = rungNet(rung);
    chk('VL di luar rentang kolom rung ditolak', !net.ok && /luar rung/.test(net.why), JSON.stringify(net));
  }

  // Coil negated (bukan kontak negated) - jalur `neg` di rungToXml() belum
  // pernah dilewati satu pun tes sebelum ini.
  {
    const rung = { comment: '', elements: [
      { kind: 'Contact', var: 'A', x: 0, y: 0 }, { kind: 'Coil', var: 'B', x: 1, y: 0, neg: true },
    ], vlinks: [] };
    const net = rungNet(rung);
    chk('coil negated: netlist diterima', net.ok, net.why);
    if (net.ok) {
      const out = rungToXml(L, 1, rung, net);
      chk('coil negated: xml ditulis dan membawa negated="true"',
          !!out.xml && /xsi:type="Coil"[^>]*negated="true"/.test(out.xml), out.xml || out.skip);
    }
  }

  // Dua VL BERSARANG independen (bukan pola motion baku) dalam satu rung -
  // (A OR B) AND (C OR D) -> E. Palang di batas kolom SETELAH tiap pasangan
  // paralel - X=1 menggabung A/B (batas antara kolom 0 dan 1), X=2 menggabung
  // C/D (batas antara kolom 1 dan 2, sebelum coil).
  {
    const rung = { comment: '', elements: [
      { kind: 'Contact', var: 'A', x: 0, y: 0 }, { kind: 'Contact', var: 'B', x: 0, y: 1 },
      { kind: 'Contact', var: 'C', x: 1, y: 0 }, { kind: 'Contact', var: 'D', x: 1, y: 1 },
      { kind: 'Coil', var: 'E', x: 2, y: 0 },
    ], vlinks: [{ Ix: 1, X: 1, Y: 0 }, { Ix: 2, X: 2, Y: 0 }] };
    const net = rungNet(rung);
    chk('dua VL bersarang independen: netlist diterima', net.ok, net.why);
    if (net.ok) {
      // VL pertama menjembatani baris SEBELUM C/D, jadi A dan B dua-duanya
      // menyetir C dan D secara terpisah (bukan digabung jadi satu kontak "C OR
      // D"). VL kedua menggabung KELUARAN C dan D di satu titik sebelum coil.
      // Hasilnya secara ALJABAR sama dengan (A OR B) AND (C OR D), tapi
      // reader.js membacanya APA ADANYA dari topologi - tidak menyederhanakan -
      // dan itu yang justru dijaga: dua rangkaian yang secara elektrik sama
      // tapi tersusun beda harus terbaca beda, bukan dipaksa jadi satu bentuk.
      const out = rungToXml(L, 1, rung, net);
      const got = out.xml ? readRung(rungsOf(out.xml)[0]).coils[0].expr : null;
      chk('dua VL bersarang independen: ekspresi sesuai topologi (tidak disederhanakan)',
          got === '((A OR B) AND C OR (A OR B) AND D)', got);
    }
  }

  // ================================================ project sungguhan (opsional)
  const sample = fs.existsSync(path.join(ROOT, 'sample.smc2'))
    ? path.join(ROOT, 'sample.smc2') : process.env.SAMPLE_SMC2;
  if (!sample || !fs.existsSync(sample)) {
    console.log('SKIP skala: taruh sample.smc2 di root reader/ atau set SAMPLE_SMC2');
  } else {
    const big = await readProject(fs.readFileSync(sample), unzip);
    const r2 = exportProject(big);
    const rungs2 = r2.files.flatMap(f => rungsOf(f.xml));
    let dang2 = 0, loops = 0, empty = 0, coils = 0;
    for (const r of rungs2) {
      const rr = readRung(r);
      dang2 += rr.dangling;
      for (const c of rr.coils) {
        coils++;
        if (c.expr === null) empty++;
        else if (/\?LOOP/.test(c.expr)) loops++;
      }
    }
    chk('skala: tidak ada sambungan menggantung', dang2 === 0, dang2 + ' ref');
    chk('skala: tidak ada rangkaian melingkar', loops === 0, loops + ' coil');
    chk('skala: tiap coil punya jalur ke rel kiri', empty === 0, empty + ' dari ' + coils);
    chk('skala: ada yang benar-benar diekspor', r2.report.exact > 0,
        r2.report.exact + '/' + r2.report.total + ' rung');
  }

  console.log(bad ? bad + ' GAGAL' : 'semua lulus');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
