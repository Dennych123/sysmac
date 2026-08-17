// Smoke test: JALANKAN seluruh skrip index.html di DOM tiruan dan pastikan tidak ada yang throw.
//
// Kenapa perlu, padahal sudah ada ui.test.js: ui.test.js cuma membaca SUMBER - id ada, listener
// terpasang, semuanya lulus. Tapi satu ReferenceError di tengah init (applyI18n memanggil t()
// yang sudah diganti nama jadi tr()) menghentikan sisa skrip, dan toolbar Project JSON yang
// dipasang di baris terakhir tidak pernah muncul. Halaman kelihatan normal, fiturnya hilang.
// Cuma menjalankan skripnya yang bisa menangkap itu.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..').replace(/\\/g, '/');
const html = fs.readFileSync(root + '/index.html', 'utf8');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

// ---- DOM tiruan: cukup buat init, tidak berpura-pura jadi browser ----
const ids = new Set((html.match(/id="([^"]+)"/g) || []).map(m => /"([^"]+)"/.exec(m)[1]));
const made = [];
function El(tag, id) {
  const el = {
    tag, id: id || '', className: '', textContent: '', value: '', checked: false,
    style: {}, children: [], attrs: {}, _h: {}, open: false, disabled: false, readOnly: false,
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild(c) { this.children.push(c); return c; },
    insertBefore(c) { this.children.push(c); return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; },
    remove() {},
    addEventListener(ev, fn) { (this._h[ev] = this._h[ev] || []).push(fn); },
    removeEventListener() {},
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; },
    removeAttribute(k) { delete this.attrs[k]; },
    hasAttribute(k) { return this.attrs[k] !== undefined; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 20, right: 100, bottom: 20 }; },
    closest() { return null; },
    focus() {}, select() {}, click() { (this._h.click || []).forEach(f => f()); },
    scrollIntoView() {}
  };
  made.push(el);
  return el;
}
const byId = {};
global.document = {
  createElement: (t) => El(t),
  createElementNS: (ns, t) => El(t),
  createTextNode: (t) => ({ nodeValue: t }),
  // Semua id yang ADA di halaman dikembalikan sebagai elemen; yang tidak ada tetap null,
  // supaya salah ketik id tetap ketahuan sebagai TypeError - bukan ditutupi tiruan ini.
  getElementById: (id) => ids.has(id) ? (byId[id] = byId[id] || El('div', id)) : null,
  querySelector: () => null,
  // querySelectorAll HARUS mengembalikan elemen beneran buat selector i18n. Versi pertama tes ini
  // mengembalikan array kosong, jadi applyI18n() tidak pernah menjalankan callback-nya dan bug
  // "t is not a function" di dalam callback itu lolos - tesnya hijau padahal halamannya rusak.
  querySelectorAll: (sel) => {
    if (sel === '.lang-b') return [El('button'), El('button')];
    const m = /^\[(data-i18n(?:-tip|-ph)?)\]$/.exec(sel);
    if (m) {
      const attr = m[1];
      const keys = [...new Set((html.match(new RegExp(attr + '="([^"]+)"', 'g')) || [])
        .map(a => /="([^"]+)"/.exec(a)[1]))];
      return keys.map(k => { const e = El('span'); e.attrs[attr] = k; return e; });
    }
    return [];
  },
  addEventListener() {},
  body: El('body'),
  documentElement: El('html')
};
global.window = { addEventListener() {}, alert() {}, matchMedia: () => ({ matches: false, addListener() {} }) };
global.navigator = {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.Blob = function () {};
global.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
global.FileReader = function () {};
global.requestAnimationFrame = (fn) => fn();
global.alert = () => {};
global.getComputedStyle = () => ({ getPropertyValue: () => '' });

// ---- ambil isi <script> terakhir (skrip aplikasinya) ----
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
chk('ada blok script di index.html', scripts.length > 0, scripts.length + ' blok');
const src = scripts[scripts.length - 1];
chk('skrip aplikasi ukurannya masuk akal', src.length > 20000, src.length + ' char');

// importProjectJSON dibocorkan keluar supaya jalur import bisa dipanggil langsung dari tes.
// Itu jalur yang paling sering putus (tiga kali: t/tr ketutup variabel lokal), dan putusnya
// selalu di dalam fungsi yang cuma jalan SETELAH orang menekan tombol - tidak kelihatan dari
// tes yang hanya menjalankan init.
let err = null;
let api = null;
try {
  api = new Function(src + '\nreturn { importProjectJSON: importProjectJSON, exportProjectJSON: exportProjectJSON };')();
} catch (e) {
  err = e;
}
chk('skrip init jalan sampai habis tanpa error', !err, err ? (err.name + ': ' + err.message) : '');

if (!err) {
  // Toolbar Project JSON dipasang di baris paling akhir init - kalau ada yang throw di tengah,
  // dia yang pertama hilang. Jadi ini penanda paling bagus bahwa init benar-benar selesai.
  const host = byId['projectJsonRow'];
  chk('toolbar Project JSON kepasang', host && host.children.length > 0,
      host ? host.children.length + ' anak' : 'elemen gak kebentuk');
  // buildJsonIORow mengembalikan satu div berisi tombol-tombolnya, lalu div itu yang ditempel
  const row = host && host.children[0];
  const btns = row ? row.children.filter(c => c.tag === 'button') : [];
  chk('tombolnya lengkap (5)', btns.length === 5,
      btns.map(b => b.textContent).join(' | '));
  chk('ada tombol buka file', btns.some(b => /file/i.test(b.textContent)),
      btns.map(b => b.textContent).join(' | '));

  // Import project beneran, pakai file contoh yang sama dengan yang dipakai orang.
  const sample = root + '/outputs/sample-project.json';
  if (fs.existsSync(sample)) {
    let impErr = null, thrown = null;
    try { impErr = api.importProjectJSON(fs.readFileSync(sample, 'utf8')); }
    catch (e) { thrown = e; }
    chk('import project JSON tidak melempar', !thrown, thrown ? (thrown.name + ': ' + thrown.message) : '');
    chk('import project JSON tidak mengembalikan error', !impErr, String(impErr || ''));
    // Export balik harus menghasilkan JSON yang masih bisa di-parse - kalau ada yang throw di
    // tengah, biasanya hasilnya potongan yang tidak valid.
    let out = null, expErr = null;
    try { out = api.exportProjectJSON(); } catch (e) { expErr = e; }
    chk('export project JSON tidak melempar', !expErr, expErr ? expErr.message : '');
    let ok = false;
    try { ok = !!JSON.parse(out || '').io; } catch (e) { ok = false; }
    chk('hasil export valid dan ada IO list-nya', ok, out ? out.slice(0, 60) : 'kosong');
  } else {
    chk('outputs/sample-project.json ada buat diuji', false, sample);
  }
}

console.log(fail ? ('\n' + fail + ' GAGAL') : '\nboot: semua OK');
process.exit(fail ? 1 : 0);
