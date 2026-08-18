// Aplikasi lokal: yang di CLI, tapi lewat halaman - tanpa mengetik path dan tanpa mengingat flag.
//
//   node scripts/app.js          lalu buka http://127.0.0.1:7654
//   (atau klik dua kali Susmax.cmd di akar repo)
//
// Kenapa server lokal dan bukan halaman biasa: halaman yang dibuka lewat file:// tidak boleh
// membaca atau menulis berkas di folder mana pun. Server kecil ini yang punya izin itu, dan
// dia cuma mendengar di 127.0.0.1 - tidak ada yang bisa menyentuhnya dari jaringan.
//
// Yang dikerjakan tombolnya SAMA PERSIS dengan perintah CLI-nya: skripnya dijalankan sebagai
// proses anak dan keluarannya ditampilkan apa adanya. Sengaja begitu - kalau halaman ini punya
// salinan logikanya sendiri, dua jalur itu akan berbeda hasil dan yang satu diam-diam salah.
'use strict';
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const api = require('./api.js');
const ws = require('./ws.js');
const { HALAMAN_EDIT } = require('./edit_page.js');

const ROOT = path.join(__dirname, '..');

/**
 * Kode termuda yang ada di disk.
 *
 * Node memuat modul SEKALI waktu start: berkas yang diubah sesudah itu tidak berpengaruh apa pun
 * sampai servernya dijalankan ulang. Yang terjadi di layar bukan "belum berubah" yang jelas -
 * halamannya tetap tampil, tombolnya tetap ada, cuma perilakunya versi lama. Sudah kejadian:
 * halaman yang sudah ditulis ulang tetap menampilkan susunan lama, dan yang kelihatan seperti
 * fitur yang tidak jadi.
 *
 * Jadi umur kodenya dilaporkan lewat /api/ping, dan halaman menyebutkan sendiri kalau servernya
 * ketinggalan.
 */
function kodeTermuda() {
  let paling = 0;
  for (const dir of [__dirname, path.join(ROOT, 'reader', 'src')]) {
    let isi = [];
    try { isi = fs.readdirSync(dir); } catch (e) { continue; }
    for (const f of isi) {
      if (!/\.js$/.test(f)) continue;
      try { paling = Math.max(paling, fs.statSync(path.join(dir, f)).mtimeMs); } catch (e) {}
    }
  }
  return paling;
}

const KODE_SAAT_MULAI = kodeTermuda();
// Port bisa disetel lewat lingkungan supaya tes memakai port acak. Dipatok satu angka, tes
// jadi bentrok dengan server yang kebetulan masih hidup - dan yang lebih buruk, DIAM-DIAM
// menguji server itu alih-alih kode ini.
const PORT = +(process.env.SUSMAX_PORT || 7654);

// Cuma perintah yang terdaftar yang boleh jalan. Tanpa daftar ini, apa pun yang dikirim ke
// server bisa dieksekusi - dan server yang menjalankan sembarang perintah bukan alat, itu lubang.
const PERINTAH = {
  sync:  { skrip: 'scripts/nb_sync.js',  arg: ['smc2', 'nb'],   flag: ['rebuild', 'write'] },
  alarm: { skrip: 'scripts/nb_apply.js', arg: ['sumber', 'nb'], flag: ['write'] },
  gen:   { skrip: 'scripts/core.js',     arg: ['project', 'out'], flag: [] },
  // Pembanding dua .smc2 - HANYA BACA, jadi tidak punya flag tulis sama sekali.
  diff:  { skrip: 'scripts/smc2_diff.js', arg: ['lama', 'baru'], flag: [] },
};

// Berkas yang boleh dilayani, DIDAFTAR SATU-SATU. Bukan folder statis: server ini jalan di
// folder repo yang juga memuat kunci OPC UA dan project pelanggan, dan "layani seluruh folder"
// berarti apa pun di situ - termasuk yang tidak pernah dimaksudkan - bisa diambil lewat HTTP.
// Path dari URL TIDAK PERNAH dipakai membentuk nama berkas; yang dipakai nilai di peta ini.
const HALAMAN_STATIS = {
  // `/` itu halaman UTAMA (daftar alat), bukan generator. Generator satu halaman kerja panjang;
  // menaruhnya di akar bikin alat lain cuma ketemu kalau seseorang menggulir sampai bawah.
  '/': { berkas: 'home.html', tipe: 'text/html; charset=utf-8' },
  '/home.html': { berkas: 'home.html', tipe: 'text/html; charset=utf-8' },
  '/index.html': { berkas: 'index.html', tipe: 'text/html; charset=utf-8' },
  '/reader/smc2-viewer.html': { berkas: 'reader/smc2-viewer.html', tipe: 'text/html; charset=utf-8' },
  '/README.md': { berkas: 'README.md', tipe: 'text/plain; charset=utf-8' },
  '/CLAUDE.md': { berkas: 'CLAUDE.md', tipe: 'text/plain; charset=utf-8' },
  '/TODO.md': { berkas: 'TODO.md', tipe: 'text/plain; charset=utf-8' },
  '/docs/SYSMAC_INSTRUCTIONS.md': { berkas: 'docs/SYSMAC_INSTRUCTIONS.md', tipe: 'text/plain; charset=utf-8' },
  '/reader/README.md': { berkas: 'reader/README.md', tipe: 'text/plain; charset=utf-8' },
};

function jalankan(nama, isi, selesai) {
  const p = PERINTAH[nama];
  if (!p) return selesai(2, '', 'perintah tidak dikenal: ' + nama);
  const argv = [path.join(ROOT, p.skrip)];
  for (const a of p.arg) { if (isi[a]) argv.push(String(isi[a])); }
  for (const f of p.flag) { if (isi[f]) argv.push('--' + f); }
  const kid = spawn(process.execPath, argv, { cwd: ROOT });
  let out = '', err = '';
  kid.stdout.on('data', d => out += d);
  kid.stderr.on('data', d => err += d);
  kid.on('close', code => selesai(code, out, err));
  kid.on('error', e => selesai(1, '', e.message));
}

// Halaman alat NB yang dulu di sini SUDAH DIBUANG, bukan disimpan "untuk jaga-jaga": isinya
// pindah ke /edit, dan halaman kedua yang meminta project yang sama dipilih ulang justru
// masalah yang mau dihilangkan. `/tools` sekarang mengalihkan ke sana.

http.createServer((req, res) => {
  // Query string dibuang dulu. Tanpa itu "/index.html?x=1" tidak cocok satu pun kunci peta
  // dan halaman generator-nya balas 404 - kelihatan seperti berkasnya hilang.
  const url = (req.url || '').split('?')[0];

  if (req.method === 'GET' && url === '/edit') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HALAMAN_EDIT);
  }
  // Halaman alat NB yang lama DIGABUNG ke /edit. Dibiarkan hidup sebagai halaman kedua, dua
  // tempat memilih project yang sama tetap ada - dan yang dipilih di satu tempat tidak pernah
  // diingat yang lain. Taut lama tetap jalan, cuma mendarat di halaman yang benar.
  if (req.method === 'GET' && (url === '/tools' || url === '/edit')) {
    if (url === '/tools') {
      res.writeHead(302, { Location: '/edit' });
      return res.end();
    }
  }
  if (req.method === 'GET' && HALAMAN_STATIS[url]) {
    const s = HALAMAN_STATIS[url];
    const p = path.join(ROOT, s.berkas);
    let isi;
    try { isi = fs.readFileSync(p); } catch (e) {
      // index.html itu HASIL BUILD dan tidak ikut ter-commit di semua salinan repo. Yang
      // hilang harus menyebut cara membuatnya; 404 polos terbaca seperti server yang rusak.
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('tidak ada: ' + s.berkas + '\n\nbuild dulu:  python scripts/build_html.py' +
                     (s.berkas.indexOf('reader/') === 0 ? '\n             cd reader && node build.js' : ''));
    }
    res.writeHead(200, { 'Content-Type': s.tipe });
    return res.end(isi);
  }
  // ------------------------------------------------------------------ API
  // Yang bikin alat-alat ini berhenti jadi "halaman yang menunggu berkasnya di-drag": halaman
  // menyebut PATH, server yang membaca dan menulis. Semua path dikurung ke folder kerja
  // (scripts/ws.js) - server lokal tanpa batas itu bukan alat, itu pintu terbuka buat apa pun
  // yang kebetulan jalan di mesin ini.
  // Penanda "server hidup" buat halaman yang dibuka dari file://. Cuma INI yang boleh
  // dipanggil lintas asal, dan jawabannya tidak memuat data apa pun selain versi + folder kerja:
  // membuka seluruh API ke lintas asal berarti halaman web mana pun yang kebetulan terbuka bisa
  // membaca dan menulis folder kerja lewat browser ini.
  if (url === '/api/ping') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    return res.end(JSON.stringify({
      ok: true, app: 'susmax', port: PORT, root: ws.getRoot(),
      // `stale` = ada berkas kode yang lebih baru daripada saat server ini mulai. Halaman
      // memakai ini buat bilang "restart dulu" alih-alih membiarkan orang menyimpulkan sendiri
      // bahwa fiturnya tidak jadi.
      stale: kodeTermuda() > KODE_SAAT_MULAI,
      since: KODE_SAAT_MULAI,
    }));
  }

  if (url.startsWith('/api/')) {
    const nama = url.slice(5);
    // Permintaan dari asal LAIN ditolak. Tanpa ini, halaman web mana pun yang sedang terbuka di
    // browser yang sama bisa menyuruh server ini membaca/menulis berkas - server lokal yang
    // menerima perintah dari luar itu bukan alat, itu lubang.
    const asal = req.headers.origin;
    if (asal && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(asal)) {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: 'permintaan dari asal lain ditolak: ' + asal }));
    }
    const kirim = (kode, isi) => {
      res.writeHead(kode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(isi));
    };
    const jalan = (isi) => api.panggil(nama, isi)
      .then(hasil => kirim(200, { ok: true, result: hasil }))
      // Galat dikirim sebagai JSON ber-ok:false, bukan HTTP 500 polos: halaman perlu ALASANNYA
      // ("di luar folder kerja", "section tidak ketemu"), dan 500 tanpa isi cuma bikin orang
      // menebak - biasanya menebak servernya yang rusak.
      .catch(e => kirim(200, { ok: false, error: e.message }));

    if (req.method === 'GET') {
      const q = {};
      const qs = (req.url.split('?')[1] || '').split('&');
      qs.forEach(pair => {
        if (!pair) return;
        const i = pair.indexOf('=');
        const k = decodeURIComponent(i < 0 ? pair : pair.slice(0, i));
        q[k] = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
      });
      return jalan(q);
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', d => { body += d; if (body.length > 32e6) req.destroy(); });
      return req.on('end', () => {
        let isi = {};
        try { isi = JSON.parse(body || '{}'); } catch (e) { return kirim(200, { ok: false, error: 'JSON rusak' }); }
        jalan(isi);
      });
    }
    return kirim(405, { ok: false, error: 'metode tidak didukung' });
  }

  if (req.method === 'POST' && url.startsWith('/run/')) {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 1e6) req.destroy(); });
    return req.on('end', () => {
      let isi = {};
      try { isi = JSON.parse(body || '{}'); } catch (e) {}
      jalankan(url.slice(5), isi, (code, out, err) => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ code, out, err }));
      });
    });
  }
  res.writeHead(404); res.end('tidak ada');
// Cuma 127.0.0.1. Server ini menjalankan perintah dan menulis berkas - didengarkan di alamat
// jaringan berarti siapa pun sejaringan bisa menulis ke project HMI dari mesin lain.
// Port yang sudah dipakai itu keadaan yang PALING sering terjadi di sini: jendela Susmax lama
// masih hidup, lalu yang baru diklik. Tanpa penanganan, yang muncul stack trace Node yang tidak
// menyebut sama sekali apa yang harus dilakukan - dan yang membacanya menyimpulkan aplikasinya
// rusak, bukan bahwa versinya sudah jalan.
}).on('error', (e) => {
  if (e.code !== 'EADDRINUSE') throw e;
  console.log('');
  console.log('Susmax SUDAH JALAN di http://127.0.0.1:' + PORT + ' - jendela ini tidak perlu.');
  console.log('');
  console.log('  * mau memakai yang sudah jalan : buka http://127.0.0.1:' + PORT);
  console.log('  * mau memakai kode terbaru     : tutup jendela Susmax yang lama dulu,');
  console.log('    lalu jalankan lagi. Node memuat kode sekali waktu start, jadi server lama');
  console.log('    tetap memakai kode lama walau berkasnya sudah berubah.');
  console.log('  * mau dua-duanya jalan         : SUSMAX_PORT=7655 node scripts/app.js');
  console.log('');
  process.exit(1);
}).listen(PORT, '127.0.0.1', () => {
  console.log('Susmax siap di  http://127.0.0.1:' + PORT);
  console.log('Folder kerja    ' + ws.getRoot() + '   (ganti: --ws <folder> atau SUSMAX_WS)');
  console.log('Tutup jendela ini kalau sudah selesai.');
});
