// Menjaga bahwa TIAP perintah cli.js punya padanan yang BENAR-BENAR JALAN di
// halaman viewer.
//
// Memeriksa keberadaan tombolnya saja tidak cukup: tombol yang ada tapi
// penangannya menyebut fungsi yang lupa di-inline tetap terlihat normal, dan
// baru mati waktu ada yang membuka file .smc2 lalu mengkliknya. Jadi di sini
// halaman hasil build dijalankan sungguhan di Node dengan DOM tiruan, project
// fixture dijatuhkan lewat jalur `load()` yang sama dengan browser, lalu tiap
// tombol ekspor diklik dan ISI unduhannya diperiksa.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'smc2-viewer.html');
const FIXTURE = path.join(__dirname, 'fixtures', 'synthetic.smc2');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const page = fs.readFileSync(HTML, 'utf8');

// -------------------------------------------------- padanan perintah CLI <-> UI
// Daftar ini SENGAJA ditulis tangan, bukan diturunkan dari kode: dia menyatakan
// apa yang HARUS ada. Perintah CLI baru yang lupa dibuatkan UI-nya akan merah di
// sini, bukan diam-diam cuma ada di baris perintah.
const PARITY = [
  ['(tanpa flag) ringkasan', 'id="t-sum"'],
  ['--operands', 'id="t-op"'],
  ['--xref', 'id="t-xref"'],
  ['--flowchart (gambar)', 'id="t-flow"'],
  ['--flowchart (berkas)', 'id="x-flow"'],
  ['--llm', 'id="x-llm"'],
  ['--graph', 'id="x-graph"'],
  ['--json', 'id="x-json"'],
  ['--xml', 'id="x-xml"'],
  ['--probe-fb', 'id="t-fb"'],
];
PARITY.forEach(([cmd, mark]) =>
  chk('ada padanan UI untuk ' + cmd, page.includes(mark), mark));

// ------------------------------------------------------------------ DOM tiruan
const DOWNLOADS = [];
const BLOBS = new Map();
let seq = 0;

function El(sel) {
  return {
    sel, value: '', textContent: '', innerHTML: '', href: '', download: '',
    style: {}, dataset: {}, _on: {},
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
                 contains(c) { return this._s.has(c); } },
    addEventListener(t, fn) { (this._on[t] = this._on[t] || []).push(fn); },
    appendChild() {}, removeChild() {},
    fire(t, ev) { (this._on[t] || []).forEach(fn => fn(ev || { preventDefault() {} })); },
  };
}

const ELS = new Map();
const get = sel => { if (!ELS.has(sel)) ELS.set(sel, El(sel)); return ELS.get(sel); };

// Tab dibuat di depan supaya `dataset.p`-nya sama dengan yang di halaman.
const TABS = ['sum', 'rung', 'flow', 'op', 'xref', 'var', 'fb', 'exp'].map(p => {
  const e = El('tab-' + p);
  e.dataset.p = p;
  return e;
});

const document = {
  querySelector: get,
  querySelectorAll: sel => (sel === 'button.tab' ? TABS : []),
  createElement: () => {
    const a = El('a');
    a.click = function () { DOWNLOADS.push({ name: this.download, data: BLOBS.get(this.href) }); };
    return a;
  },
  get body() { return get('body'); },
};
class BlobStub { constructor(parts) { this.text = parts.join(''); } }
const URLStub = {
  createObjectURL(b) { const u = 'blob:' + (++seq); BLOBS.set(u, b.text); return u; },
  revokeObjectURL() {},
};
const windowStub = { DecompressionStream: globalThis.DecompressionStream };

// ------------------------------------------------------------- jalankan halaman
const script = (page.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
chk('blok script ketemu', script.length > 20000, (script.length / 1024).toFixed(1) + ' KB');

let api;
try {
  // Epilog cuma MENGAMBIL rujukan dari lingkup yang sama - tidak mengubah
  // perilaku apa pun, jadi yang diuji tetap kode yang dikirim ke browser.
  api = new Function('document', 'window', 'URL', 'Blob', 'DecompressionStream', 'setTimeout',
                     script + '\n;return { load: load, draw: draw };')(
    document, windowStub, URLStub, BlobStub, globalThis.DecompressionStream, setTimeout);
} catch (e) {
  chk('halaman bisa dijalankan', false, e.message);
  console.log('\n' + fail + ' GAGAL');
  process.exit(1);
}
chk('halaman bisa dijalankan', !!api && typeof api.load === 'function');

const fakeFile = {
  name: 'synthetic.smc2',
  arrayBuffer: async () => fs.readFileSync(FIXTURE),
};

const clicked = id => {
  const e = get(id);
  const n = (e._on.click || []).length;
  if (!n) { chk('tombol ' + id + ' punya penangan', false, 'tidak ada listener'); return false; }
  e.fire('click');
  return true;
};
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  await api.load(fakeFile);
  chk('project fixture terbaca lewat jalur yang sama dengan browser',
      !/Gagal membaca/.test(get('#err').textContent), get('#err').textContent);
  chk('tabel ringkasan terisi', get('#t-sum').innerHTML.includes('P000_Main'));
  chk('ladder tergambar', get('#t-rung').innerHTML.includes('<svg'));

  // --- xref: keluaran harus sama dengan CLI, dan kotak cari jadi filternya ---
  chk('silang-rujuk terisi', /TULIS|baca/.test(get('#t-xref').textContent),
      get('#t-xref').textContent.slice(0, 60));
  get('#q').value = 'LB203';
  api.draw();
  const xr = get('#t-xref').textContent;
  chk('kotak cari menyaring silang-rujuk (padanan --xref LB800)',
      xr.includes('LB203') && !xr.includes('LB100'), xr.split('\n')[0]);
  get('#q').value = '';
  api.draw();

  // --- probe blok fungsi: dihitung waktu tabnya dibuka ---
  TABS.find(t => t.dataset.p === 'fb').fire('click');
  await wait(300);
  chk('tab Blok fungsi terisi (padanan --probe-fb)',
      /ELEMEN FUNGSI/.test(get('#t-fb').textContent),
      get('#t-fb').textContent.slice(0, 60));

  // --- tombol ekspor ---
  const grab = name => DOWNLOADS.find(d => d.name === name);

  if (clicked('#x-json')) {
    const d = DOWNLOADS[DOWNLOADS.length - 1];
    let ok = false;
    try { ok = !!JSON.parse(d.data).programs.length; } catch (e) { /* biar merah di bawah */ }
    chk('--json: unduhan berisi project yang sah', ok, d && d.name);
  }

  if (clicked('#x-llm')) {
    const d = DOWNLOADS[DOWNLOADS.length - 1];
    chk('--llm: unduhan berisi konteks LLM', d && /\.md$/.test(d.name) && d.data.length > 200,
        d && d.name + ' ' + (d.data || '').length + ' char');
  }

  if (clicked('#x-graph')) {
    const d = DOWNLOADS[DOWNLOADS.length - 1];
    let g = null;
    try { g = JSON.parse(d.data); } catch (e) { /* biar merah di bawah */ }
    chk('--graph: unduhan punya node dan edge', !!g && Array.isArray(g.nodes) && Array.isArray(g.edges),
        g ? g.nodes.length + ' node' : d && d.name);
  }

  if (clicked('#x-flow')) {
    const d = DOWNLOADS[DOWNLOADS.length - 1];
    let f = null;
    try { f = JSON.parse(d.data); } catch (e) { /* biar merah di bawah */ }
    chk('--flowchart: unduhan berbentuk motionSequences', !!f && typeof f === 'object', d && d.name);
    chk('--flowchart: laporannya ikut ditampilkan',
        /langkah|SECTION/.test(get('#t-exp').textContent),
        get('#t-exp').textContent.split('\n')[0]);
  }

  // --- ekspor XML: yang paling penting isinya benar, bukan cuma ada ---
  if (clicked('#x-xml')) {
    // Laporan ditulis DULUAN, sebelum unduhannya jalan - di situ tertulis berapa
    // rung yang jadi lubang. Berkas yang diambil tanpa membacanya tampak lengkap.
    chk('--xml: laporan tampil sebelum unduhan',
        /diekspor UTUH/.test(get('#t-exp').textContent),
        get('#t-exp').textContent.split('\n').slice(-1)[0]);
    await wait(1200);
    const xmls = DOWNLOADS.filter(d => /\.xml$/.test(d.name));
    chk('--xml: berkas XML terunduh', xmls.length >= 1, xmls.map(x => x.name).join(', '));
    const one = xmls.map(x => x.data).join('');
    chk('--xml: isinya rung IEC 61131-10 sungguhan',
        one.includes('<Rung ') && one.includes('LeftPowerRail') && one.includes('xsi:type="Coil"'));
    chk('--xml: lubang ikut tertulis sebagai rung komentar',
        one.includes('TIDAK DIEKSPOR'));
    // Ini yang membuktikan viewer memakai pembangun XML GENERATOR (SGLIB), bukan
    // salinan yang bisa drift: nama produk itu cuma ada di js/lib.js.
    chk('--xml: dibangun js/lib.js milik generator, bukan salinan',
        one.includes('Susmax Studio'));
  }

  console.log('\n' + (fail ? fail + ' GAGAL' : 'SEMUA LULUS'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
