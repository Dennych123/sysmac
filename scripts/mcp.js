// Server MCP - jalan masuk buat AI, lewat stdio. TANPA dependensi.
//
//   node scripts/mcp.js            (dijalankan oleh klien MCP, bukan diketik manusia)
//
// Contoh pendaftaran di klien MCP:
//   { "mcpServers": { "susmax": { "command": "node",
//     "args": ["C:/.../repo/scripts/mcp.js", "--ws", "C:/kerja"] } } }
//
// AI boleh membaca dan menulis berkas - termasuk XML dan `.smc2` - di dalam FOLDER KERJA.
// Batas itu satu-satunya yang tersisa, dan bukan soal percaya: server yang bisa menulis ke
// mana saja berarti satu path salah ketik menimpa berkas yang tidak ada hubungannya.
//
// YANG PERLU DIINGAT, bukan sebagai larangan tapi sebagai sifat alatnya: ladder yang ditulis
// langsung bisa TER-IMPORT BERSIH DAN SALAH WAKTU MESIN BERGERAK - empat gerbang (xsd, instr,
// rungwire, declared) memeriksa BENTUK, bukan maksud. Karena itu jaring pengamannya git:
// `track_smc2` mencatat versi sekarang (berikut berkas .smc2-nya sendiri) sebelum apa pun
// diubah, dan `restore_smc2` mengembalikannya persis byte-nya kalau hasilnya ternyata salah.
// Alur yang disarankan: track dulu -> ubah -> validate -> kalau meragukan, restore.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const core = require(path.join(__dirname, 'core.js'));

const PROTOCOL = '2024-11-05';
const SERVER = { name: 'susmax-generator', version: '1.0.0' };

// ------------------------------------------------------------------ alat
//
// `list_devices` BUKAN tambahan enak-enak: tanpa itu LLM mengarang nama solenoid, dan yang
// didapat cuma warning `unknown_solenoid` - langkahnya hilang diam-diam dari program yang
// dihasilkan, tanpa ada yang gagal.
const ws = require('./ws.js');
const api = require('./api.js');

const TOOLS = [
  {
    name: 'list_files',
    description: 'Daftar isi folder di dalam folder kerja. Pakai ini dulu buat tahu ada apa.',
    inputSchema: { type: 'object', properties: { dir: { type: 'string', description: 'relatif ke folder kerja; kosong = akar' } } },
  },
  {
    name: 'find_files',
    description: 'Cari berkas menurut pola (mis. "*.smc2", "*.xml") di dalam folder kerja.',
    inputSchema: { type: 'object', properties: { pattern: { type: 'string' }, limit: { type: 'number' } } },
  },
  {
    name: 'read_file',
    description: 'Baca berkas teks (XML, TSV, JSON, md) dari folder kerja.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
  },
  {
    name: 'write_file',
    description:
      'Tulis berkas teks ke folder kerja. Yang lama SELALU dicadangkan dulu ke .bak bertanggal ' +
      'yang tidak pernah menimpa cadangan sebelumnya.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' }, content: { type: 'string' } },
      required: ['path', 'content'],
    },
  },
  {
    name: 'read_smc2',
    description:
      'Baca project Sysmac (.smc2) tanpa Sysmac Studio. Tanpa program/section: ringkasan pohon ' +
      'program. Dengan keduanya: rung section itu berikut tabel variabel.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' }, program: { type: 'string' }, section: { type: 'string' } },
      required: ['path'],
    },
  },
  {
    name: 'diff_smc2',
    description:
      'Bandingkan dua .smc2. Memisahkan perubahan logika rung, perubahan tata letak, dan ' +
      'pergeseran alamat/nomor alarm - yang terakhir tidak kelihatan di layar Studio maupun NB.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      required: ['a', 'b'],
    },
  },
  {
    name: 'track_smc2',
    description:
      'Catat versi .smc2 sekarang ke riwayat git (berikut berkas .smc2-nya sendiri dan teks ' +
      'hasil ekstrak yang bisa dibaca git diff). JALANKAN INI SEBELUM MENGUBAH APA PUN - itu ' +
      'yang bikin perubahan yang ternyata salah bisa dibatalkan.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' }, out: { type: 'string' }, message: { type: 'string' } },
      required: ['path'],
    },
  },
  {
    name: 'history',
    description: 'Riwayat commit folder yang dicatat track_smc2.',
    inputSchema: { type: 'object', properties: { dir: { type: 'string' }, limit: { type: 'number' } }, required: ['dir'] },
  },
  {
    name: 'restore_smc2',
    description:
      'Kembalikan .smc2 ke salah satu versi di riwayat, PERSIS byte-nya. Yang ditimpa ' +
      'dicadangkan dulu.',
    inputSchema: {
      type: 'object',
      properties: { dir: { type: 'string' }, rev: { type: 'string' }, to: { type: 'string' } },
      required: ['dir', 'rev', 'to'],
    },
  },

  {
    name: 'watch_start',
    description:
      'Pantau .smc2 dan catat versinya SENDIRI tiap kali Sysmac Studio menyimpannya. Keadaan ' +
      'sebelum disunting ikut dicatat begitu pemantauan dimulai. Isi "nb" (folder project ' +
      'NB-Designer) kalau alarmnya mau ikut disinkronkan tiap simpanan.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' }, out: { type: 'string' },
        nb: { type: 'string', description: 'opsional: folder project NB buat sinkron berkelanjutan' },
        nbRebuild: { type: 'boolean' },
      },
      required: ['path'],
    },
  },
  {
    name: 'watch_stop',
    description: 'Hentikan pemantauan sebuah .smc2.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
  },
  {
    name: 'watch_status',
    description: 'Keadaan pemantauan: berapa versi tercatat, apa judul terakhirnya, hasil sinkron NB.',
    inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
  },
  {
    name: 'tracked_list',
    description: 'Daftar project .smc2 yang pernah dicatat di folder kerja ini.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'set_message',
    description:
      'Isi/ganti catatan sebuah versi di riwayat (judul menyusul). Disimpan sebagai git notes, ' +
      'jadi hash commit-nya TIDAK berubah dan pemulihan tetap menunjuk versi yang sama.',
    inputSchema: {
      type: 'object',
      properties: { dir: { type: 'string' }, rev: { type: 'string' }, message: { type: 'string' } },
      required: ['dir', 'rev', 'message'],
    },
  },
  {
    name: 'nb_sync',
    description:
      'Sinkronkan komen alarm dari .smc2 ke project NB-Designer (.nbp). TANPA write:true dia ' +
      'cuma melaporkan apa yang AKAN dilakukan. Tutup NB-Designer dulu sebelum menulis - dia ' +
      'memuat berkasnya waktu project dibuka dan menulisnya lagi waktu disimpan.',
    inputSchema: {
      type: 'object',
      properties: {
        smc2: { type: 'string' }, nb: { type: 'string', description: 'folder project NB atau .nbp' },
        rebuild: { type: 'boolean', description: 'buang semua alarm lama - yang bukan dari .smc2 ikut hilang' },
        write: { type: 'boolean' },
      },
      required: ['smc2', 'nb'],
    },
  },
  {
    name: 'nb_alarm',
    description:
      'Siapkan AlarmLib-generated.csv (format Import dialog Alarm Setting) di folder project NB. ' +
      'Sumbernya project JSON atau AlarmLib.csv. Import MENGGANTI seluruh daftar alarm di NB.',
    inputSchema: {
      type: 'object',
      properties: { source: { type: 'string' }, nb: { type: 'string' }, write: { type: 'boolean' } },
      required: ['source', 'nb'],
    },
  },
  {
    name: 'list_devices',
    description:
      'Daftar station dan nama device yang SAH dari sebuah IO list (TSV). Nama solenoid yang ' +
      'dipakai di motionSequences HARUS diambil dari sini - nama karangan cuma menghasilkan ' +
      'warning unknown_solenoid dan langkahnya hilang diam-diam dari program.',
    inputSchema: {
      type: 'object',
      properties: {
        io: { type: 'string', description: 'Isi IO list TSV: Alamat<TAB>Jenis<TAB>IN/OUT<TAB>Komentar' },
        project_path: { type: 'string', description: 'Alternatif: path project JSON, IO list-nya diambil dari situ' },
      },
    },
  },
  {
    name: 'get_project',
    description: 'Baca berkas project JSON dari disk dan kembalikan isinya.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Path berkas project JSON' } },
      required: ['path'],
    },
  },
  {
    name: 'validate_project',
    description:
      'Jalankan seluruh pipeline generator pada sebuah project JSON TANPA menulis berkas apa pun. ' +
      'Mengembalikan warning terstruktur (code, station, device), ringkasan program, dan alokasi ' +
      'AL/MF. Pakai ini sebelum generate.',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'object', description: 'Project JSON (io, stationNames, motionSequences, conditionDefs, ...)' },
        project_path: { type: 'string', description: 'Alternatif: path berkas project JSON' },
      },
    },
  },
  {
    name: 'generate',
    description:
      'Hasilkan XML program + GlobalVariables.tsv ke sebuah folder. Menulis berkas, jadi jalankan ' +
      'validate_project dulu dan pastikan foldernya memang yang dimaksud.',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'object', description: 'Project JSON' },
        project_path: { type: 'string', description: 'Alternatif: path berkas project JSON' },
        out_dir: { type: 'string', description: 'Folder tujuan; dibuat kalau belum ada' },
      },
      required: ['out_dir'],
    },
  },
];

function bacaProject(args) {
  if (args.project && typeof args.project === 'object') return args.project;
  if (args.project_path) {
    // Dibiarkan melempar apa adanya - "berkasnya tidak ada" harus sampai ke klien sebagai galat,
    // bukan jadi project kosong yang tetap digenerate dan menghasilkan program tanpa station.
    return JSON.parse(fs.readFileSync(args.project_path, 'utf8'));
  }
  throw new Error('butuh "project" (objek) atau "project_path" (path berkas JSON)');
}

function jalankan(project) {
  const warnList = [];
  const hasil = core.generate(project, { onWarn: () => {} });
  (hasil.warnList || []).forEach(w => warnList.push(w));
  return { hasil, warnList };
}

function ringkas(hasil) {
  const files = (hasil.files || []).map(f => ({ name: f.name, bytes: (f.xml || '').length }));
  const gabungan = (hasil.files || []).filter(f => /\.xml$/i.test(f.name))[0];
  const rung = gabungan ? (gabungan.xml.match(/<Rung\b/g) || []).length : 0;
  return {
    programs: gabungan ? (gabungan.xml.match(/<Program\b/g) || []).length : 0,
    rungs: rung,
    globals: (hasil.globalRows || []).length,
    arrayInfo: hasil.arrayInfo || null,
    files: files,
  };
}

// Alat berkas/smc2/git disalurkan ke `scripts/api.js` - modul yang sama dengan yang dipakai
// aplikasi lokal. Dua jalur dengan logika sendiri-sendiri pasti berbeda perilaku, dan yang
// berbeda diam-diam itu yang paling mahal: hasil lewat MCP tidak sama dengan hasil lewat halaman.
const KE_API = {
  list_files: 'fs/list', find_files: 'fs/find', read_file: 'fs/read', write_file: 'fs/write',
  read_smc2: 'smc2/read', diff_smc2: 'smc2/diff',
  track_smc2: 'git/track', history: 'git/log', restore_smc2: 'git/restore',
  nb_sync: 'nb/sync', nb_alarm: 'nb/alarm',
  watch_start: 'watch/start', watch_stop: 'watch/stop', watch_status: 'watch/status',
  tracked_list: 'track/list', set_message: 'git/message',
};

const ALAT = {
  list_devices(args) {
    let io = args.io;
    if (!io && args.project_path) io = JSON.parse(fs.readFileSync(args.project_path, 'utf8')).io;
    if (!io) throw new Error('butuh "io" (TSV) atau "project_path"');
    // Pipeline dijalankan sampai tahap SPLIT saja, memakai potongan yang sama persis dengan yang
    // dipakai generator (core.STEPS) - bukan parser sendiri. Daftar nama yang berbeda sedikit
    // dari yang dipakai generator justru penyebab yang mau dicegah alat ini: nama yang kelihatan
    // sah di sini tapi tidak dikenali waktu generate, dan langkahnya hilang tanpa keluhan.
    const flow = core.makeFlow({});
    const node = { warn: () => {} };
    let m = core.runStep(core.STEPS.parse, { payload: io }, flow, node);
    m = core.runStep(core.STEPS.genname, m, flow, node);
    const v = core.runStep(core.STEPS.validate, m, flow, node);
    if (v[1]) throw new Error('IO list ditolak validate: ' + v[1].payload);
    const split = core.runStep(core.STEPS.split, v[0], flow, node).payload || {};
    const out = {};
    Object.keys(split).forEach(st => {
      const devs = split[st] || [];
      out[st] = {
        // Nama solenoid dipisah sendiri: cuma ini yang boleh masuk motionSequences[].nodes[].sol.
        solenoids: devs.filter(d => d.io === 'OUT' && ['CR', 'SOL', 'SRV_CMD'].indexOf(d.jenis) >= 0)
                       .map(d => ({ name: d.name, comment: d.komen || '', type: d.jenis })),
        sensors: devs.filter(d => d.io === 'IN')
                     .map(d => ({ name: d.name, comment: d.komen || '', type: d.jenis })),
      };
    });
    return out;
  },

  get_project(args) {
    if (!args.path) throw new Error('butuh "path"');
    return JSON.parse(fs.readFileSync(args.path, 'utf8'));
  },

  validate_project(args) {
    const project = bacaProject(args);
    try {
      const { hasil, warnList } = jalankan(project);
      return { ok: true, summary: ringkas(hasil), warnings: warnList,
               lscAudit: hasil.lscAudit || [] };
    } catch (e) {
      // Kegagalan validate BUKAN kegagalan protokol - itu jawaban yang berguna, dan klien harus
      // bisa membacanya sebagai data, bukan sebagai error transport.
      return { ok: false, error: e.message, validation: e.validation || null };
    }
  },

  generate(args) {
    const project = bacaProject(args);
    if (!args.out_dir) throw new Error('butuh "out_dir"');
    const { hasil, warnList } = jalankan(project);
    fs.mkdirSync(args.out_dir, { recursive: true });
    const ditulis = [];
    (hasil.files || []).forEach(f => {
      fs.writeFileSync(path.join(args.out_dir, f.name), f.xml, 'utf8');
      ditulis.push(f.name);
    });
    return { written: ditulis, out_dir: args.out_dir, summary: ringkas(hasil), warnings: warnList };
  },
};

// -------------------------------------------------------------- JSON-RPC
function kirim(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }

function tangani(msg) {
  // Notifikasi (tanpa id) tidak boleh dibalas sama sekali. Membalasnya bikin sebagian klien
  // menutup sambungan karena menerima jawaban untuk permintaan yang tidak pernah mereka kirim.
  const punyaId = Object.prototype.hasOwnProperty.call(msg, 'id') && msg.id !== null;

  if (msg.method === 'initialize') {
    return punyaId && kirim({ jsonrpc: '2.0', id: msg.id, result: {
      protocolVersion: PROTOCOL, capabilities: { tools: {} }, serverInfo: SERVER,
    } });
  }
  if (msg.method === 'tools/list') {
    return punyaId && kirim({ jsonrpc: '2.0', id: msg.id, result: { tools: TOOLS } });
  }
  if (msg.method === 'tools/call') {
    const nama = msg.params && msg.params.name;
    const fn = ALAT[nama] || (KE_API[nama] ? (a => api.panggil(KE_API[nama], a)) : null);
    if (!fn) {
      return punyaId && kirim({ jsonrpc: '2.0', id: msg.id,
        error: { code: -32601, message: 'alat tidak dikenal: ' + nama } });
    }
    let hasil;
    try { hasil = fn(msg.params.arguments || {}); }
    catch (e) {
      // Galat alat dikirim sebagai isi ber-isError, bukan galat JSON-RPC: klien MCP
      // menampilkannya ke model supaya bisa diperbaiki sendiri, sementara galat protokol
      // biasanya mematikan sambungan.
      return punyaId && kirim({ jsonrpc: '2.0', id: msg.id, result: {
        content: [{ type: 'text', text: 'GAGAL: ' + e.message }], isError: true,
      } });
    }
    // Sebagian alat mengembalikan Promise (yang lewat api.js). Dijawab setelah selesai -
    // menjawab duluan bikin klien menerima "{}" dan menyangka alatnya tidak menghasilkan apa-apa.
    return punyaId && Promise.resolve(hasil).then(
      h => kirim({ jsonrpc: '2.0', id: msg.id, result: {
        content: [{ type: 'text', text: JSON.stringify(h, null, 2) }],
      } }),
      e => kirim({ jsonrpc: '2.0', id: msg.id, result: {
        content: [{ type: 'text', text: 'GAGAL: ' + e.message }], isError: true,
      } }));
  }
  if (msg.method && msg.method.indexOf('notifications/') === 0) return;   // diam, memang begitu
  if (punyaId) {
    kirim({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'method tidak dikenal: ' + msg.method } });
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => {
  buf += d;
  for (;;) {
    const i = buf.indexOf('\n');
    if (i < 0) break;
    const baris = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!baris) continue;
    let msg;
    try { msg = JSON.parse(baris); }
    catch (e) {
      // Baris rusak tidak boleh mematikan server: klien yang mengirim satu baris cacat lalu
      // kehilangan seluruh sesi jauh lebih sulit didiagnosis daripada satu galat parse.
      kirim({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON rusak' } });
      continue;
    }
    try { tangani(msg); }
    catch (e) {
      if (msg && msg.id != null) {
        kirim({ jsonrpc: '2.0', id: msg.id, error: { code: -32603, message: e.message } });
      }
    }
  }
});
process.stdin.on('end', () => process.exit(0));
