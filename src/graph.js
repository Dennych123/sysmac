// Mesin flowchart - diport dari Susmax program generator
// (github.com/Dennych123/sysmac, scripts/build_html.py).
//
// Geometri, pemilihan sisi sambungan panah, aturan START/END, dan tata letak
// grid 4 kolom dari urutan topologis sengaja SAMA PERSIS dengan editor di sana.
// Alasannya bukan kosmetik: urutan yang DIBACA dari mesin dan urutan yang
// DITULIS di editor jadi bisa ditumpuk dan dibandingkan langsung.
//
// Yang diport cuma bagian murni + penggambarnya. Editornya TIDAK - alat ini baca
// saja. Untuk mengubah urutan, ekspor --flowchart lalu impor ke generator.
if (typeof require !== 'undefined') {
  var { esc } = require('./env.js');
  var { VCMT } = require('./symbols.js');
}

// ====================================== mesin flowchart (port dari Susmax generator)
// Diambil dari https://github.com/Dennych123/sysmac (scripts/build_html.py) supaya
// urutan gerak yang DIBACA dari mesin tampil dalam bentuk yang sama persis dengan
// urutan gerak yang DITULIS di editor generator. Kalau bentuknya beda, dua gambar
// untuk mesin yang sama jadi tidak bisa dibandingkan - padahal itu justru gunanya.
//
// Yang diport CUMA bagian murni + gambarnya. Editornya TIDAK: pembaca ini alat baca,
// tidak ada state yang boleh diubah dari sini. Node tetap bisa dipindah/disambung di
// generator - hasil `--flowchart` diimpor ke sana.
const NODE_W = 110, NODE_H = 32, ANCHOR_R = 15, ANCHOR_TOP_MARGIN = 55;
const ALARM_CAT_LABEL = { emergency: 'Emergency stop', autostop: 'Auto stop',
                          cyclestop: 'Cycle stop', faultstop: 'Fault stop', warning: 'Warning' };

// Cabang decision dirujuk "idNode#Y" / "idNode#N". Pemisahnya '#', BUKAN '.', karena
// alamat bit PLC sendiri pakai titik (mis. "0001.06").
function refBase(ref) { const s = String(ref), i = s.indexOf('#'); return i < 0 ? s : s.slice(0, i); }

// Label aktuator pakai KOMENTAR IO-nya, bukan nama simbol: "STOPPER-1 UP pos" langsung
// kebayang bendanya, "CR_ST2_STP1_UP_POS" harus diterjemahkan dulu di kepala. Prefix
// "ST<n>" dibuang karena kotaknya memang sudah milik station itu.
function deviceLabel(sym) {
  const k = VCMT.get(sym);
  if (!k) return sym;
  return String(k).replace(/^ST\s*\d+\s*/i, '').replace(/\s+/g, ' ').trim() || sym;
}

function nodeLabel(n) {
  const t = n.type || 'motion', c = (n.comment || '').trim(), tail = c ? ' - ' + c : '';
  if (t === 'condition') return n.bit + (c ? ' *' : '');
  if (t === 'motion')    return deviceLabel(n.sol);
  if (t === 'decision')  return '? ' + (n.cond || '(bit?)') + tail;
  if (t === 'setmem')    return 'SET ' + (n.bit || '(bit?)') + tail;
  if (t === 'resetmem')  return 'RST ' + (n.bit || '(bit?)') + tail;
  if (t === 'alarm')     return 'ALARM ' + (ALARM_CAT_LABEL[n.category] || n.category || 'faultstop') + tail;
  return t;
}

// Lebar ikut panjang label - label TIDAK dipotong. Dulu dipangkas 15 char jadi
// "SOL_ST1_STP4_.." dan dua stopper berbeda kelihatan sama persis. Angka 6.1 terikat
// ke font-size .gnode-text (10.5px Consolas) - ubah satu, ubah dua-duanya.
function nodeW(n) { return Math.max(NODE_W, Math.ceil(nodeLabel(n).length * 6.1) + 18); }
function nodeCenter(n) { return { x: n.x + nodeW(n) / 2, y: n.y + NODE_H / 2 }; }

// Titik sambung kabel = SISI node yang paling searah ke lawan bicaranya, bukan selalu
// kanan->kiri. Bandingkan kemiringan garis pusat-ke-pusat dengan diagonal node.
function sideAnchor(n, towardX, towardY) {
  const w = nodeW(n), cx = n.x + w / 2, cy = n.y + NODE_H / 2;
  const dx = towardX - cx, dy = towardY - cy;
  if (Math.abs(dx) * NODE_H >= Math.abs(dy) * w) return { x: dx >= 0 ? n.x + w : n.x, y: cy };
  return { x: cx, y: dy >= 0 ? n.y + NODE_H : n.y };
}

// Titik masuk (root) dan titik akhir (leaf). refBase() WAJIB: rujukan cabang "d1#Y"
// tanpa dikupas port-nya tidak match id node manapun, jadi node yang SUDAH menunggu
// hasil judgement terbaca sebagai root dan ikut ditarik START - gambarnya lalu bohong.
// Yang dikecualikan cuma "condition": itu penanda bit rujukan, bukan langkah.
function graphEnds(nodes) {
  const ids = {}; nodes.forEach(n => { ids[n.id] = true; });
  const isStep = n => (n.type || 'motion') !== 'condition';
  const referenced = {};
  nodes.forEach(n => (n.after || []).forEach(r => { const b = refBase(r); if (ids[b]) referenced[b] = true; }));
  const roots = nodes.filter(n => isStep(n) && !(n.after || []).some(r => ids[refBase(r)]));
  const leaves = nodes.filter(n => isStep(n) && !referenced[n.id]);
  return { roots, leaves,
           targets: roots.length ? roots : nodes.filter(isStep),
           sources: leaves.length ? leaves : nodes.filter(isStep) };
}

// Posisi murni dari urutan TOPOLOGIS (DFS postorder - dependency selalu digambar
// sebelum yang gantung ke dia), lalu grid tetap 4 kolom. Bukan urutan array mentah:
// kalau JSON-nya acak, panahnya nyilang-nyilang dan langkahnya tidak kebaca.
function layoutVariantNodes(nodes) {
  const byId = {}; nodes.forEach(n => { byId[n.id] = n; });
  const seen = {}, order = [];
  function visit(n) {
    if (seen[n.id]) return;
    seen[n.id] = true;
    (n.after || []).forEach(r => { const t = byId[refBase(r)]; if (t) visit(t); });
    order.push(n);
  }
  nodes.forEach(visit);
  order.forEach((n, i) => {
    n.x = 20 + (i % 4) * 175;
    n.y = ANCHOR_TOP_MARGIN + 20 + Math.floor(i / 4) * 90;
  });
  return nodes;
}

// Hasil chainSteps -> ARRAY varian motionSequences, sama persis dengan yang dibaca
// editor generator: satu section boleh punya beberapa urutan yang dipilih lewat bit
// syarat masing-masing (pemilihan TIPE). Satu bentuk data untuk dibaca, digambar,
// dan diekspor - bukan tiga bentuk yang mirip-mirip.
//
// Varian dipisah lewat KOMPONEN TERHUBUNG: semua langkah yang saling terkait
// lewat `afterIdx` masuk satu varian, dan gerbangnya diambil dari bit yang
// ditunggu anggota paling awal yang memang menunggu bit.
//
// Kenapa bukan "telusuri mundur sampai akar": urutan gerak MESIN SUNGGUHAN itu
// MELINGKAR - langkah terakhir memicu langkah pertama lagi. Penelusuran mundur
// tidak punya akar di situ; dia berhenti di tempat berbeda tergantung mulai dari
// mana, jadi langkah-langkah dari satu lingkaran yang sama bisa jatuh ke varian
// berbeda. Akibatnya rujukan `after` menunjuk node di varian lain: versi Python
// mati dengan KeyError, dan versi JS diam-diam menulis "nundefined". Komponen
// terhubung tidak punya masalah itu - siklus tetap satu komponen.
function splitVariants(chain, gates) {
  gates = gates || new Map();
  const par = chain.map((_, i) => i);
  const find = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) par[b] = a; };
  chain.forEach((st, i) => { if ('afterIdx' in st) union(i, st.afterIdx); });

  const by = new Map();          // akar komponen -> daftar langkah
  const gate = new Map();        // akar komponen -> bit gerbang
  chain.forEach((st, i) => {
    const k = find(i);
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(st);
    if (!gate.has(k) && 'afterBit' in st) gate.set(k, st.afterBit);
  });

  // Satu varian bisa punya BEBERAPA rantai paralel yang berangkat dari gerbang
  // yang sama (mis. dua stopper yang jalan bareng). Komponennya terpisah, tapi
  // variannya satu - jadi digabung menurut gerbangnya, bukan ditimpa. Versi lama
  // memakai Map ber-key gerbang tanpa menggabung, jadi komponen kedua MENIMPA
  // yang pertama dan langkah-langkahnya hilang diam-diam.
  const out = new Map();
  by.forEach((steps, k) => {
    // Gerbang diterjemahkan ke bit SYARAT-nya (LB401 -> LB300), supaya varian
    // memakai nama yang sama dengan yang dipakai editor generator.
    const g = gate.get(k);
    const key = (g && gates.get(g)) || g || '(tanpa syarat)';
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(...steps);
  });
  // Urutkan lagi menurut nomor rung: penggabungan komponen mengacak urutannya.
  out.forEach(steps => steps.sort((a, b) => a.rung - b.rung));
  return out;
}

// Kembalikan [{gate, steps, variant}]. `variant` bentuknya PERSIS motionSequences
// (siap diekspor ke editor generator); `steps` dibiarkan terpisah, bukan ditempel
// ke dalam variant - kalau ditempel, dia ikut terbawa waktu diekspor dan JSON-nya
// tidak lagi sama bentuk dengan yang dibaca generator.
function stepsToVariants(chain, sectName, gates) {
  gates = gates || new Map();          // project tanpa section Condition: tidak ada gerbang
  const groups = splitVariants(chain, gates);
  const out = [];
  groups.forEach((steps, gate) => {
    // Nomor node dihitung ulang PER VARIAN - rujukan `after` harus menunjuk id di
    // varian yang sama, kalau tidak node-nya tidak ketemu dan panahnya hilang.
    const pos = new Map();
    steps.forEach((st, i) => pos.set(chain.indexOf(st), 'n' + (i + 1)));
    const nodes = steps.map((st, i) => {
      const n = { id: 'n' + (i + 1), type: 'motion', sol: st.sol, join: 'AND',
                  comment: st.comment || '' };
      if (st.loop) {
        // Penutup lingkaran: langkah ini AWAL urutan, dan sambungannya ke langkah
        // terakhir cuma menandai bahwa siklusnya berulang. `after` dikosongkan -
        // itu bentuk "node akar" yang sama dengan yang dipakai generator.
        n.after = [];
        n.loopAfter = pos.get(st.afterIdx) || '';
      } else if ('afterBit' in st && gates.has(st.afterBit)) {
        // Langkah ini menunggu bit GERBANG variannya sendiri - berarti dia akar
        // urutan, bukan langkah yang menunggu sesuatu di dalam varian. Syaratnya
        // sudah tercatat di `condition`, jadi `after` dikosongkan; kalau tidak,
        // gerbangnya digambar ulang sebagai kotak syarat dan tiap varian
        // kelihatan menunggu bit yang sebetulnya adalah dirinya sendiri.
        n.after = [];
      } else {
        n.after = ['afterIdx' in st ? (pos.get(st.afterIdx) || st.prev) : st.afterBit];
      }
      return n;
    });
    // Rujukan yang bukan id node = bit di luar rantai. Dibikinkan node "condition"
    // supaya tetap kegambar - disembunyikan justru bikin urutannya kelihatan utuh
    // padahal ada mata rantai yang tidak tertelusuri.
    const ids = new Set(nodes.map(n => n.id));
    const extra = [];
    nodes.forEach(n => n.after.forEach(r => {
      const b = refBase(r);
      if (ids.has(b) || extra.some(e => e.id === b)) return;
      extra.push({ id: b, type: 'condition', bit: b, after: [], comment: VCMT.get(b) || '' });
    }));
    // Nama varian diambil dari komentar rung langkahnya sendiri: generator menulis
    // "[Buffering type 1] Motion 3: ..." di tiap rung, jadi namanya ada di sana
    // apa adanya. Tabel variabel TIDAK bisa dipakai untuk ini - `LB300` itu nama
    // LOKAL, dan tiap program punya LB300 sendiri dengan arti berbeda; di tabel
    // yang datar semuanya bertumpuk dan yang terbaca punya program lain.
    const tag = steps.map(s => (s.comment || '').match(/^\s*\[([^\]]+)\]/))
                     .filter(Boolean).map(m => m[1].trim())[0] || '';
    const label = tag || VCMT.get(gate) || '';
    out.push({ gate, steps, variant: {
      condition: gate === '(tanpa syarat)' ? '' : gate,
      comment: label || sectName || '',
      conditionComments: label && gate !== '(tanpa syarat)' ? { [gate]: label } : {},
      nodes: layoutVariantNodes(extra.concat(nodes)) } });
  });
  return out;
}

// Gambar varian jadi SVG. Versi BACA SAJA: tanpa drag, tanpa handle, tanpa tombol
// hapus. Geometri, warna, dan aturan START/END-nya sama dengan editor generator.
function graphSvg(variant, key) {
  const nodes = variant.nodes;
  if (!nodes.length) return '';
  let maxY = 40, maxX = 0;
  nodes.forEach(n => {
    if (n.y + NODE_H > maxY) maxY = n.y + NODE_H;
    if (n.x + nodeW(n) > maxX) maxX = n.x + nodeW(n);
  });

  const ends = graphEnds(nodes);
  const avgX = (list, fb) => list.length
    ? list.reduce((s, n) => s + nodeCenter(n).x, 0) / list.length : fb;
  const startA = { x: avgX(ends.targets, 20 + NODE_W / 2) - ANCHOR_R, y: 18 - ANCHOR_R };
  const endA = { x: avgX(ends.sources, 20 + NODE_W / 2) - ANCHOR_R, y: maxY + 22 };

  const W = Math.max(620, Math.max(maxX, startA.x + ANCHOR_R * 2, endA.x + ANCHOR_R * 2) + 40);
  const H = Math.max(160, Math.max(maxY, endA.y + ANCHOR_R * 2) + 30);
  const mk = 'ar-' + key;
  const o = [`<defs><marker id="${mk}" markerWidth="8" markerHeight="8" refX="7" refY="4" ` +
             `orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#666"/></marker></defs>`];
  const edge = (x1, y1, x2, y2, cls) =>
    o.push(`<line class="gedge-line${cls || ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ` +
           `marker-end="url(#${mk})"/>`);

  // START/END: murni visual, tidak pernah jadi rung. Sambungannya dihitung dari graph
  // sekarang - START ke tiap root, END dari tiap leaf.
  const sC = { x: startA.x + ANCHOR_R, y: startA.y + ANCHOR_R };
  const eC = { x: endA.x + ANCHOR_R, y: endA.y + ANCHOR_R };
  ends.targets.forEach(n => { const p = sideAnchor(n, sC.x, sC.y); edge(sC.x, sC.y + ANCHOR_R, p.x, p.y, ' anchor'); });
  ends.sources.forEach(n => { const p = sideAnchor(n, eC.x, eC.y); edge(p.x, p.y, eC.x, eC.y - ANCHOR_R, ' anchor'); });
  [[sC, 'START'], [eC, 'END']].forEach(([c, t]) => {
    o.push(`<circle class="gnode-rect anchor" cx="${c.x}" cy="${c.y}" r="${ANCHOR_R}"/>` +
           `<text class="gnode-text" x="${c.x}" y="${c.y + 3}" text-anchor="middle">${t}</text>`);
  });

  const byId = new Map(nodes.map(n => [n.id, n]));
  nodes.forEach(n => {
    if ((n.type || 'motion') === 'condition') return;
    (n.after || []).forEach(ref => {
      const from = byId.get(refBase(ref));
      if (!from) return;
      const p1 = sideAnchor(from, nodeCenter(n).x, nodeCenter(n).y);
      const p2 = sideAnchor(n, nodeCenter(from).x, nodeCenter(from).y);
      edge(p1.x, p1.y, p2.x, p2.y, '');
    });
    // Sambungan penutup lingkaran digambar putus-putus: siklusnya memang berulang,
    // tapi itu bukan langkah berikutnya di dalam satu siklus. Disembunyikan sama
    // sekali berarti membuang fakta bahwa urutannya memang melingkar.
    const lf = n.loopAfter && byId.get(refBase(n.loopAfter));
    if (lf) {
      const p1 = sideAnchor(lf, nodeCenter(n).x, nodeCenter(n).y);
      const p2 = sideAnchor(n, nodeCenter(lf).x, nodeCenter(lf).y);
      edge(p1.x, p1.y, p2.x, p2.y, ' loop');
    }
  });

  nodes.forEach(n => {
    const t = n.type || 'motion', w = nodeW(n);
    const tip = t === 'motion' ? n.sol + (VCMT.get(n.sol) ? ' — ' + VCMT.get(n.sol) : '')
              : t === 'condition' ? 'Syarat: ' + n.bit + (n.comment ? ' — ' + n.comment : '')
              : (n.comment || '');
    o.push(`<g class="gnode" transform="translate(${n.x},${n.y})">` +
           (tip ? `<title>${esc(tip)}</title>` : '') +
           `<rect class="gnode-rect${t === 'motion' ? '' : ' ' + t}" width="${w}" height="${NODE_H}" rx="6"/>` +
           `<text class="gnode-text" x="6" y="${NODE_H / 2 + 3}">${esc(nodeLabel(n))}</text>` +
           // Badge AND/OR cuma muncul kalau memang ada 2+ dependency yang harus digabung.
           (t !== 'condition' && (n.after || []).length >= 2
             ? `<g class="gjoin-badge" transform="translate(${w / 2 - 16},${NODE_H + 4})">` +
               `<rect width="32" height="14" rx="3"/><text x="16" y="10">${n.join === 'OR' ? 'OR' : 'AND'}</text></g>`
             : '') + '</g>');
  });

  return `<svg class="graph-canvas" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ` +
         `xmlns="http://www.w3.org/2000/svg">${o.join('')}</svg>`;
}

if (typeof module !== 'undefined') {
  module.exports = { NODE_W, NODE_H, ANCHOR_R, ANCHOR_TOP_MARGIN, ALARM_CAT_LABEL, refBase,
                     deviceLabel, nodeLabel, nodeW, nodeCenter, sideAnchor, graphEnds,
                     layoutVariantNodes, splitVariants, stepsToVariants, graphSvg };
}
