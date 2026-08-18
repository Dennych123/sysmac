// Undo / redo di editor flowchart.
//
// Yang disimpan snapshot SELURUH state, bukan operasi terbaliknya. Itu keputusan yang bikin
// fitur ini bisa dikerjakan sama sekali: undo yang menyusun kebalikan tiap operasi salah begitu
// ada SATU jalur mutasi yang terlewat, dan salahnya berupa graph tidak konsisten tanpa tanda apa
// pun. Tes ini menjaga sifat-sifat yang bikin snapshot tetap benar:
//
//   1. checkpoint() yang tidak menemukan perubahan TIDAK mencatat apa-apa. Kalau ini runtuh,
//      riwayatnya penuh langkah kosong dan Ctrl+Z terasa "tidak melakukan apa-apa" beberapa kali
//      sebelum akhirnya bekerja - dan orang berhenti memakainya.
//   2. undo mengembalikan state SEBELUM perubahan, redo mengembalikannya lagi.
//   3. perubahan baru MEMBUANG jalur redo. Kalau tidak, redo menempelkan potongan state dari
//      cabang lain dan hasilnya campuran yang tidak pernah ada.
//   4. riwayatnya dibatasi - tidak tumbuh tanpa batas sepanjang sesi.
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.existsSync(path.join(root, 'index.html'))
  ? fs.readFileSync(path.join(root, 'index.html'), 'utf8') : '';

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

chk('index.html ada (build dulu kalau gagal)', !!html);
if (!html) { console.log('\n1 GAGAL'); process.exit(1); }

function extract(name) {
  const sig = 'function ' + name + '(';
  let from = 0;
  for (;;) {
    const i = html.indexOf(sig, from);
    if (i < 0) throw new Error('gak ketemu (versi UI): ' + name);
    let d = 0, started = false, body = null;
    for (let j = html.indexOf('{', i); j < html.length; j++) {
      if (html[j] === '{') { d++; started = true; }
      else if (html[j] === '}') { d--; if (started && d === 0) { body = html.slice(i, j + 1); break; } }
    }
    if (body && body.indexOf('\\"') < 0) return body;
    from = i + sig.length;
  }
}

// Panel dan generator distub - yang diuji riwayatnya, bukan gambarnya. Stub-nya menghitung
// panggilan supaya bisa dipastikan undo BENAR-BENAR menggambar ulang; state yang pulih tapi
// layar yang tidak ikut adalah bug yang kelihatan persis seperti undo yang tidak jalan.
const src = 'var motionState={},conditionState={},stationNames={},actuatorOverrides={},motionCounters={};'
  + 'var selected=null,renders=0;'
  + 'function renderMotionPanel(){renders++;}function renderConditionPanel(){}'
  + 'function renderStationNamesPanel(){}function regenerate(){checkpoint();}'
  // Deklarasi riwayat DIAMBIL dari halaman, bukan ditulis ulang di sini - termasuk HIST_MAX.
  // Salinan yang ditulis ulang tetap lulus sementara batas yang sungguhan berubah, dan yang
  // diuji jadi angka milik tes ini sendiri.
  + (/var histPast[^\n]*\n/.exec(html) || [''])[0]
  + (/var HIST_MAX[^\n]*\n/.exec(html) || [''])[0]
  + "var document={getElementById:function(){return null;}};"
  + [ 'histSnap', 'histApply', 'checkpoint', 'undo', 'redo', 'updateUndoButtons' ].map(extract).join('\n')
  + ';return {checkpoint:checkpoint,undo:undo,redo:redo,'
  + 'set:function(m){motionState=m;},get:function(){return motionState;},'
  + 'setCond:function(c){conditionState=c;},getCond:function(){return conditionState;},'
  + 'renders:function(){return renders;},past:function(){return histPast.length;},'
  + 'future:function(){return histFuture.length;},max:function(){return HIST_MAX;}}';
const M = new Function(src)();

const node = (id, sol) => ({ id: id, type: 'motion', sol: sol, after: [], join: 'AND', x: 0, y: 0 });

// Titik nol, sama seperti yang dipanggil sekali waktu halaman selesai dimuat.
M.set({ ST1: [{ condition: '', comment: '', nodes: [node('n1', 'SOL_A')] }] });
M.checkpoint();
chk('titik nol tidak dihitung sebagai langkah', M.past() === 0, M.past() + ' langkah');

M.checkpoint();
chk('checkpoint tanpa perubahan tidak mencatat apa-apa', M.past() === 0, M.past() + ' langkah');

// --- satu perubahan ---
M.get().ST1[0].nodes.push(node('n2', 'SOL_B'));
M.checkpoint();
chk('perubahan tercatat satu langkah', M.past() === 1, M.past() + ' langkah');

const sebelumUndo = M.renders();
chk('undo berhasil', M.undo() === true);
chk('state kembali ke sebelum perubahan', M.get().ST1[0].nodes.length === 1,
    JSON.stringify(M.get().ST1[0].nodes.map(n => n.id)));
chk('undo menggambar ulang panelnya', M.renders() > sebelumUndo,
    sebelumUndo + ' -> ' + M.renders());
chk('redo tersedia setelah undo', M.future() === 1, M.future() + '');

chk('redo berhasil', M.redo() === true);
chk('state kembali maju', M.get().ST1[0].nodes.length === 2,
    JSON.stringify(M.get().ST1[0].nodes.map(n => n.id)));
chk('redo habis setelah dipakai', M.future() === 0, M.future() + '');

// --- perubahan setelah undo membuang jalur redo ---
M.undo();
chk('ada redo yang menunggu', M.future() === 1);
M.get().ST1[0].nodes.push(node('n9', 'SOL_LAIN'));
M.checkpoint();
chk('perubahan baru membuang jalur redo', M.future() === 0, M.future() + '');
chk('redo setelah dibuang tidak melakukan apa-apa', M.redo() === false);
chk('state tidak tercampur cabang lama',
    M.get().ST1[0].nodes.map(n => n.id).join(',') === 'n1,n9',
    M.get().ST1[0].nodes.map(n => n.id).join(','));

// --- Condition ikut, bukan cuma motion ---
// Kalau salah satu bagian state ketinggalan dari snapshot, undo mengembalikan SEBAGIAN saja -
// dan graph yang setengah lama setengah baru itu justru keadaan yang tidak pernah ada.
M.setCond({ ST1: [{ name: 'A', bit: 'LB300', groups: [[]] }] });
M.checkpoint();
M.setCond({ ST1: [] });
M.checkpoint();
M.undo();
chk('Condition ikut dipulihkan undo', (M.getCond().ST1 || []).length === 1,
    JSON.stringify(M.getCond()));

// --- undo di riwayat kosong tidak meledak ---
while (M.undo()) { /* sampai habis */ }
chk('undo di riwayat kosong mengembalikan false, bukan galat', M.undo() === false);
chk('state tetap utuh setelah undo habis', !!M.get().ST1);

// --- batas riwayat ---
const max = M.max();
chk('ada batas riwayat', typeof max === 'number' && max > 5 && max < 1000, String(max));
for (let i = 0; i < max + 25; i++) {
  M.get().ST1[0].nodes.push(node('x' + i, 'SOL_X'));
  M.checkpoint();
}
chk('riwayat tidak tumbuh tanpa batas', M.past() <= max, M.past() + ' > ' + max);
chk('undo masih jalan setelah batas terlampaui', M.undo() === true);

// --- penyambungannya di halaman ---
chk('regenerate memanggil checkpoint', /function regenerate\(\)\s*\{[\s\S]{0,400}checkpoint\(\)/.test(html));
chk('Ctrl+Z tersambung', /ctrlKey \|\| ev\.metaKey[\s\S]{0,500}undo\(\)/.test(html));
chk('Ctrl+Z dilewat kalau fokus di kotak isian',
    /ctrlKey[\s\S]{0,200}activeElement[\s\S]{0,120}input\|textarea/.test(html));
// Yang dijaga: checkpoint() dipanggil di jalur boot, SESUDAH listener dipasang. Jendelanya
// dilonggarkan karena blok boot memang bertambah isi (mis. penanda status server); yang tidak
// boleh hilang cuma panggilannya - tanpa titik nol, perubahan PERTAMA tidak bisa di-undo, dan
// itu justru yang paling sering mau dibatalkan.
chk('titik nol riwayat dipanggil waktu halaman dimuat',
    /addEventListener\('keydown', onDocKeyDown\);[\s\S]{0,3000}\ncheckpoint\(\);/.test(html));
chk('tombol Undo/Redo ada di halaman',
    html.indexOf('id="undoBtn"') > 0 && html.indexOf('id="redoBtn"') > 0);

console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
