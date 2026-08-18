// Klik satu baris warning -> lompat ke aktuator/station yang dimaksud.
//
// Kenapa dijaga: lompatan yang mendarat di tempat SALAH lebih buruk daripada tidak ada lompatan.
// Warning "no matching limit switch for actuator X" yang mendarat di aktuator lain bikin orang
// menyetel Confirm Mode barang yang tidak bermasalah - dan yang bermasalah tetap begitu.
//
// Yang diuji perilakunya, bukan tampilannya: fungsi warnTarget diambil dari index.html hasil
// build lalu dijalankan dengan DOM tiruan seadanya.
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

// DOM tiruan: cukup yang dipakai warnTarget - querySelector dan querySelectorAll dengan
// pemilih atribut. Sengaja tidak memakai pustaka DOM: yang diuji aturan pemilihannya, dan
// pustaka yang toleran justru menutupi pemilih yang salah tulis.
function makeDoc(nodes) {
  const cocok = sel => {
    const m = /\[([a-z-]+)="([^"]*)"\]/.exec(sel);
    if (!m) return [];
    return nodes.filter(n => n[m[1]] === m[2]);
  };
  return { querySelector: s => cocok(s)[0] || null, querySelectorAll: s => cocok(s) };
}

const src = extract('warnTarget');
const run = (doc, w) => new Function('document', src + '; return warnTarget;')(doc)(w);

const rowST1 = { 'data-dev': 'SOL_ST1_A', 'data-st': 'ST1', className: 'stname-lbl cm-row' };
const rowST1b = { 'data-dev': 'SOL_ST1_B', 'data-st': 'ST1', className: 'stname-lbl cm-row' };
const boxST1 = { 'data-st': 'ST1', className: 'station-box' };
const boxST2 = { 'data-st': 'ST2', className: 'station-box' };
const doc = makeDoc([rowST1, rowST1b, boxST1, boxST2]);

chk('warning ber-device mendarat di aktuator itu',
    run(doc, { code: 'no_lsc', station: 'ST1', device: 'SOL_ST1_B' }) === rowST1b);

// Yang paling gampang salah: warning tingkat station mendarat di baris Confirm Mode pertama
// milik station itu - yaitu aktuator acak yang kebetulan diurutkan duluan.
chk('warning tanpa device mendarat di kotak station, bukan aktuator pertama',
    run(doc, { code: 'hmi_budget', station: 'ST1' }) === boxST1);

chk('station lain tidak ikut kepilih',
    run(doc, { code: 'x', station: 'ST2' }) === boxST2);

chk('device yang tidak ada di panel jatuh balik ke station',
    run(doc, { code: 'x', station: 'ST1', device: 'SOL_TIDAK_ADA' }) === boxST1);

chk('tanpa station dan tanpa device: tidak ada tujuan, bukan galat',
    run(doc, { code: 'x' }) === null);

chk('station yang tidak punya panel: tidak ada tujuan',
    run(doc, { code: 'x', station: 'ST9' }) === null);

// ------------------------------------------------------- penanda harus benar-benar ditulis
// warnTarget mencari [data-dev] dan [data-st]. Kalau pembuat panelnya berhenti menulis penanda
// itu, fungsinya tetap benar dan tetap lulus tes di atas - yang hilang cuma lompatannya.
chk('baris Confirm Mode menulis data-dev', /setAttribute\('data-dev', d\.name\)/.test(html));
chk('baris Confirm Mode menulis data-st', /setAttribute\('data-st', stKey\)/.test(html));
chk('kotak station Motion menulis data-st',
    /box\.setAttribute\('data-st', stKey\)/.test(html));
chk('baris warning dipasangi klik cuma kalau ada tujuannya',
    /var target = warnTarget\(w\);[\s\S]{0,200}if \(target\)/.test(html));
chk('jumpTo membuka <details> pembungkusnya',
    /function jumpTo[\s\S]{0,400}tagName === 'DETAILS'/.test(html));

console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
process.exit(fail ? 1 : 0);
