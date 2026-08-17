// Penyambungan HTML <-> JS di index.html hasil build.
//
// Kenapa ada tes ini: badan HTML pernah ditulis ulang dan tombol "Open file" di kotak Project JSON
// mati diam-diam. Penyebabnya toolbar itu DIBANGUN dari JS lalu ditempel ke <div id="projectJsonRow">,
// sementara HTML barunya memakai id lain. Tidak ada yang error di console - elemennya cuma tidak
// ketemu, jadi toolbarnya tidak pernah muncul. Halaman kelihatan normal, fiturnya hilang.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..').replace(/\\/g, '/');
const html = fs.existsSync(root + '/index.html') ? fs.readFileSync(root + '/index.html', 'utf8') : '';

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

chk('index.html ada (build dulu kalau gagal)', !!html);
if (!html) { console.log('\n1 GAGAL'); process.exit(1); }

// Tiap getElementById harus ketemu elemennya. Ini yang menangkap kasus di atas.
const wanted = new Set();
(html.match(/getElementById\('([^']+)'\)/g) || []).forEach(m => wanted.add(/'([^']+)'/.exec(m)[1]));
const missing = [...wanted].filter(id => html.indexOf('id="' + id + '"') < 0);
chk('semua getElementById punya elemennya', !missing.length, missing.join(', '));
chk('jumlah elemen yang dicari masuk akal', wanted.size >= 30, wanted.size + ' id');

// Tidak ada id dobel - getElementById diam-diam ambil yang pertama
const dupes = {};
(html.match(/id="([^"]+)"/g) || []).forEach(m => {
  const id = /"([^"]+)"/.exec(m)[1];
  dupes[id] = (dupes[id] || 0) + 1;
});
const dup = Object.keys(dupes).filter(k => dupes[k] > 1);
chk('tidak ada id dobel', !dup.length, dup.join(', '));

// Kotak Project JSON: toolbarnya ditempel ke row, pesannya ke msg, isinya dari textarea.
['projectJsonTa', 'projectJsonRow', 'projectJsonMsg'].forEach(id => {
  chk('Project JSON: #' + id + ' ada', html.indexOf('id="' + id + '"') >= 0);
});
chk('toolbar Project JSON dipasang ke row',
    /getElementById\('projectJsonRow'\)\.appendChild/.test(html));
chk('buildJsonIORow dipakai buat Project JSON',
    /buildJsonIORow\(ta, msg, exportProjectJSON/.test(html));
// buildJsonIORow yang bikin tombol Open file / Paste / Copy / Download
chk('buildJsonIORow bikin input file', /type = 'file'|type="file"/.test(html));

// Tombol utama harus ada handler-nya
[['genBtn', 'Generate'], ['ioTabGrid', 'tab tabel'], ['ioTabText', 'tab teks'],
 ['ioAddRow', 'tambah baris'], ['ioPaste', 'tempel']].forEach(x => {
  chk('tombol ' + x[1] + ' punya listener',
      new RegExp("getElementById\\('" + x[0] + "'\\)[\\s\\S]{0,60}addEventListener").test(html));
});

console.log(fail ? ('\n' + fail + ' GAGAL') : '\nui: semua OK');
process.exit(fail ? 1 : 0);
