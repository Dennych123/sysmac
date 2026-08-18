// Server MCP (`scripts/mcp.js`) - jalan masuk buat AI.
//
// AI sekarang BOLEH membaca dan menulis berkas - XML dan `.smc2` sekalian - di dalam folder
// kerja. Yang menggantikan larangan lama adalah jaring pengaman, dan itu yang diuji di sini:
// kurungan folder kerja, `track_smc2` sebelum mengubah, dan `restore_smc2` yang mengembalikan
// byte-nya persis. Peringatannya tetap: ladder yang salah tetap ter-import bersih, dan empat
// gerbang memeriksa BENTUK, bukan maksud - jadi riwayat git yang jadi penyelamatnya.
//
// Dua sifat lain yang gampang runtuh diam-diam:
//   * `validate_project` TIDAK BOLEH menulis berkas. Alat "dry-run" yang diam-diam menulis bikin
//     orang menjalankannya di folder project sungguhan.
//   * daftar device harus datang dari pipeline yang SAMA dengan generator. Daftar yang beda
//     sedikit justru penyebab yang mau dicegah: nama yang kelihatan sah di sini, tidak dikenali
//     waktu generate, dan langkahnya hilang tanpa keluhan.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const SERVER = path.join(root, 'scripts', 'mcp.js');
const PROJ = path.join(root, 'outputs', 'sample-project.json');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const src = fs.readFileSync(SERVER, 'utf8');
// Aturan lama ("AI tidak boleh menyentuh XML") sudah dicabut atas permintaan pemiliknya. Yang
// menggantikannya bukan larangan tapi JARING PENGAMAN, dan itu yang diuji di sini: semua path
// dikurung ke folder kerja, `track_smc2` mencatat versi sekarang sebelum apa pun diubah, dan
// `restore_smc2` mengembalikannya persis byte-nya. Peringatannya tetap ditulis di berkasnya -
// ladder yang salah tetap ter-import bersih, dan empat gerbang memeriksa BENTUK, bukan maksud.
chk('peringatan "ter-import bersih tapi salah" tetap ditulis',
    /TER-IMPORT BERSIH DAN SALAH/.test(src));
chk('alat berkas lewat folder kerja + api bersama, bukan fs langsung',
    /require\('\.\/ws\.js'\)/.test(src) && /require\('\.\/api\.js'\)/.test(src));

// `validate_project` itu dry-run, dan yang memakainya menjalankannya di folder project sungguhan.
// Satu tulis di jalur ini menimpa berkas orang tanpa ada yang meminta.
const badanValidate = (/validate_project\(args\) \{[\s\S]*?\n  \},/.exec(src) || [''])[0];
chk('validate_project tidak menulis berkas apa pun',
    badanValidate && !/writeFileSync|mkdirSync|rmSync|appendFileSync/.test(badanValidate),
    badanValidate ? '' : 'badan validate_project tidak ketemu - periksa bentuk berkasnya');
chk('cuma generate yang boleh menulis',
    (src.match(/writeFileSync/g) || []).length === 1,
    (src.match(/writeFileSync/g) || []).length + ' tempat menulis');

if (!fs.existsSync(PROJ)) {
  console.log('  SKIP  outputs/sample-project.json tidak ada - tidak ada project buat diuji');
  process.exit(fail ? 1 : 0);
}

// Semua permintaan dikirim sekaligus lalu jawabannya dicocokkan lewat id - server harus tahan
// pipelining. Klien MCP sungguhan memang mengirim begitu.
function tanya(reqs, cb) {
  const p = spawn(process.execPath, [SERVER], { cwd: root });
  let out = '', err = '';
  p.stdout.on('data', d => out += d);
  p.stderr.on('data', d => err += d);
  p.on('close', () => {
    const byId = {};
    out.trim().split('\n').filter(Boolean).forEach(l => {
      try { const m = JSON.parse(l); byId[m.id] = m; } catch (e) { /* baris bukan JSON */ }
    });
    cb(byId, out, err);
  });
  reqs.forEach(r => p.stdin.write(JSON.stringify(r) + '\n'));
  // Notifikasi tanpa id: server tidak boleh menjawabnya sama sekali.
  p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  p.stdin.write('{ ini bukan json }\n');
  setTimeout(() => p.stdin.end(), 6000);
}

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-gen-'));

tanya([
  { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} },
  { jsonrpc: '2.0', id: 2, method: 'tools/list' },
  { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'list_devices', arguments: { project_path: PROJ } } },
  { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'validate_project', arguments: { project_path: PROJ } } },
  { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'tidak_ada', arguments: {} } },
  { jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'validate_project', arguments: {} } },
  { jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name: 'generate', arguments: { project_path: PROJ, out_dir: outDir } } },
  { jsonrpc: '2.0', id: 8, method: 'metode/ngawur' },
], (r, raw, err) => {
  const isi = id => { try { return JSON.parse(r[id].result.content[0].text); } catch (e) { return null; } };

  chk('initialize dijawab', r[1] && r[1].result && r[1].result.protocolVersion,
      r[1] ? JSON.stringify(r[1]).slice(0, 90) : 'tidak ada jawaban. stderr: ' + err.slice(0, 120));
  chk('server mengaku punya kemampuan tools',
      r[1] && r[1].result.capabilities && r[1].result.capabilities.tools);

  const tools = r[2] && r[2].result && r[2].result.tools;
  const nama = (tools || []).map(t => t.name);
  chk('tools/list menyebut alat generator DAN alat berkas/smc2/git',
      tools && tools.length >= 12, nama.join(','));
  for (const w of ['read_file', 'write_file', 'read_smc2', 'diff_smc2',
                   'track_smc2', 'history', 'restore_smc2', 'nb_sync', 'nb_alarm']) {
    chk('alat ada: ' + w, nama.includes(w), nama.join(','));
  }
  chk('list_devices ada - tanpa itu LLM mengarang nama solenoid',
      tools && tools.some(t => t.name === 'list_devices'));
  chk('tiap alat punya inputSchema', tools && tools.every(t => t.inputSchema && t.inputSchema.type === 'object'));

  const dev = isi(3);
  chk('list_devices mengembalikan station', dev && Object.keys(dev).length >= 2,
      dev ? Object.keys(dev).join(' ') : '-');
  const st = dev && Object.keys(dev).filter(k => k !== 'MAIN')[0];
  chk('station punya daftar solenoid', st && dev[st].solenoids.length > 0,
      st ? st + ': ' + dev[st].solenoids.length : '-');
  chk('nama solenoid berupa nama simbol, bukan komentar',
      st && dev[st].solenoids.every(s => /^[A-Za-z0-9_]+$/.test(s.name)),
      st ? dev[st].solenoids.slice(0, 2).map(s => s.name).join(', ') : '-');
  chk('komentar device ikut - itu yang bikin LLM bisa memilih yang benar',
      st && dev[st].solenoids.some(s => s.comment));

  const val = isi(4);
  chk('validate_project jalan', val && val.ok === true, val ? JSON.stringify(val).slice(0, 90) : '-');
  chk('validate mengembalikan ringkasan program', val && val.summary && val.summary.rungs > 50,
      val && val.summary ? val.summary.rungs + ' rung' : '-');
  chk('warning terstruktur, bukan teks gabungan',
      val && Array.isArray(val.warnings) && val.warnings.every(w => typeof w.code === 'string'),
      val ? (val.warnings[0] ? JSON.stringify(val.warnings[0]).slice(0, 80) : 'tidak ada warning') : '-');

  chk('alat tak dikenal ditolak, bukan didiamkan', r[5] && r[5].error, JSON.stringify(r[5] || {}).slice(0, 80));
  // Galat ALAT dikirim sebagai isi ber-isError supaya klien menampilkannya ke model dan model
  // bisa memperbaikinya sendiri; galat protokol biasanya mematikan sambungan.
  chk('argumen kurang jadi isError, bukan galat protokol',
      r[6] && r[6].result && r[6].result.isError === true, JSON.stringify(r[6] || {}).slice(0, 90));

  const gen = isi(7);
  chk('generate menulis berkas', gen && gen.written && gen.written.length > 3,
      gen ? (gen.written || []).length + ' berkas' : '-');
  chk('berkasnya benar-benar ada di disk',
      gen && gen.written.every(n => fs.existsSync(path.join(outDir, n))));
  chk('AllPrograms.xml ikut', gen && gen.written.some(n => /AllPrograms/.test(n)),
      gen ? gen.written.join(' ') : '-');

  chk('method tak dikenal dijawab galat, server tetap hidup', r[8] && r[8].error);
  chk('notifikasi TIDAK dijawab', !raw.split('\n').some(l => /notifications/.test(l)));
  chk('baris JSON rusak tidak mematikan server - permintaan sesudahnya tetap dijawab',
      !!r[7], 'jawaban id 7 ' + (r[7] ? 'ada' : 'hilang'));

  try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (e) {}
  console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
  process.exit(fail ? 1 : 0);
});
