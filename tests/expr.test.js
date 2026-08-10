// Uji rekonstruksi logika rung dari koordinat grid.
//
// Ini bagian yang paling menentukan nilai alat ini: kalau seri/paralel disusun
// salah, ekspresi yang keluar TETAP terlihat masuk akal - dan justru itu yang
// berbahaya, karena engineer (atau LLM) akan mempercayainya.
const { load } = require('./lib/viewer');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const M = load(['elLabel', 'rungExpr']);

const C = (v, o = {}) => Object.assign({ kind: 'Contact', var: v }, o);
const O = (v, o = {}) => Object.assign({ kind: 'Coil', var: v }, o);
const R = els => ({ comment: '', elements: els });

// --- seri lurus ---
let r = M.rungExpr(R([C('A'), C('B', { x: 1 }), C('C', { x: 2 }), O('Z', { x: 3 })]));
chk('seri jadi AND berurutan', r.expr === 'A AND B AND C', r.expr);
chk('keluaran terbaca', r.outs.join() === 'Z', r.outs.join());
chk('seri lurus tidak ditandai perkiraan', !r.approx);

// --- NC ditandai ---
r = M.rungExpr(R([C('A', { nc: true }), O('Z', { x: 1 })]));
chk('kontak NC diberi awalan /', r.expr === '/A', r.expr);

// --- paralel satu kolom ---
r = M.rungExpr(R([C('A'), C('B', { y: 1 }), C('C', { x: 1 }), O('Z', { x: 2 })]));
chk('paralel satu kolom jadi OR', r.expr === '(A OR B) AND C', r.expr);
chk('paralel sederhana tidak ditandai perkiraan', !r.approx, 'approx=' + r.approx);

// --- cabang paralel yang panjangnya beberapa kolom ---
r = M.rungExpr(R([C('A'), C('B', { x: 1 }), C('P', { y: 1 }), C('Q', { y: 1, x: 1 }), C('C', { x: 2 })]));
chk('cabang multi-kolom tetap satu grup OR', r.expr === '(A AND B OR P AND Q) AND C', r.expr);

// --- pola one-shot: (trigger OR seal) ANDNOT diri sendiri ---
r = M.rungExpr(R([C('PB'), C('SEAL', { y: 1 }), C('X', { x: 1, nc: true }), O('X', { x: 2 })]));
chk('pola latch terbaca utuh', r.expr === '(PB OR SEAL) AND /X' && r.outs.join() === 'X', r.expr + ' -> ' + r.outs);

// --- dua cabang di kolom sama: disederhanakan, WAJIB ditandai ---
r = M.rungExpr(R([C('A'), C('B', { y: 1 }), C('C', { y: 2 }), O('Z', { x: 1 })]));
chk('tiga jalur paralel tergabung', r.expr === '(A OR B OR C)', r.expr);
chk('kasus bertingkat DITANDAI perkiraan', r.approx, 'approx=' + r.approx);

// --- tanpa koordinat (format XML lama) ---
r = M.rungExpr(R([{ kind: 'Contact', var: 'A' }, { kind: 'Contact', var: 'B' }, { kind: 'Coil', var: 'Z' }]));
chk('tanpa koordinat pakai urutan dokumen', r.expr === 'A AND B', r.expr);
chk('tanpa koordinat + banyak elemen ditandai perkiraan', r.approx);
r = M.rungExpr(R([{ kind: 'Contact', var: 'A' }, { kind: 'Coil', var: 'Z' }]));
chk('satu elemen tidak ditandai perkiraan (urutan tidak bisa salah)', !r.approx);

// --- fungsi/FB ---
r = M.rungExpr(R([C('A'), { kind: 'Function', func: 'MOVE', x: 1 }, O('Z', { x: 2 })]));
chk('fungsi tampil sebagai NAMA()', r.expr === 'A AND MOVE()', r.expr);

console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
process.exit(fail ? 1 : 0);
