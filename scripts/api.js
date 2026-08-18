// API aplikasi lokal: berkas, project .smc2, dan git.
//
// Ini yang membuat alat-alat repo berhenti jadi "halaman yang menunggu di-drag berkasnya" dan
// jadi aplikasi: halaman bisa MENYEBUT path, servernya yang membaca dan menulis.
//
// Semua path lewat `ws.amanPath()` - dikurung ke satu folder kerja. Yang boleh diganti sesuka
// hati adalah ROOT-nya; yang tidak boleh adalah keluar dari root yang sedang aktif.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ws = require('./ws.js');
const REPO = ws.REPO;
const { unzip } = require(path.join(REPO, 'reader', 'src', 'zip.js'));
const { readProject } = require(path.join(REPO, 'reader', 'src', 'smc2.js'));
const D = require(path.join(REPO, 'reader', 'diff.js'));
const watcher = require('./watcher.js');
const pick = require('./pick.js');
const { findNbProject } = require('./nb_common.js');

const DAFTAR = '.susmax-tracked.json';

/** Path absolut jadi relatif ke folder kerja, kalau memang di dalamnya. */
function relatifKeRoot(p) {
  const rel = path.relative(ws.getRoot(), p);
  return (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) ? rel : null;
}

function bacaDaftar() {
  try { return JSON.parse(fs.readFileSync(path.join(ws.getRoot(), DAFTAR), 'utf8')); }
  catch (e) { return []; }
}

/**
 * Catat project yang barusan di-track ke daftar di folder kerja.
 *
 * Daftarnya BERKAS, bukan ingatan proses: server yang di-restart tidak boleh membuat project
 * yang sudah dicatat berminggu-minggu hilang dari pilihan halaman lain.
 */
function tulisDaftar(smc2Rel, dirRel, tambahan) {
  const lama = bacaDaftar().find(x => x.smc2 === smc2Rel) || {};
  const isi = bacaDaftar().filter(x => x.smc2 !== smc2Rel);
  // Yang sudah tersimpan DIPERTAHANKAN (mis. folder project NB-nya). Ditulis ulang dari nol,
  // folder HMI yang sudah dipilih hilang tiap kali versinya dicatat - dan orangnya harus
  // memilih folder yang sama lagi, tiap kali.
  isi.unshift(Object.assign({}, lama, tambahan || {},
                            { smc2: smc2Rel, dir: dirRel, last: new Date().toISOString() }));
  try {
    fs.writeFileSync(path.join(ws.getRoot(), DAFTAR),
                     JSON.stringify(isi.slice(0, 50), null, 2), 'utf8');
  } catch (e) { /* daftar itu kenyamanan - gagal menulisnya tidak boleh menggagalkan track */ }
  return isi;
}

// ------------------------------------------------------------------ .smc2
async function bacaSmc2(rel) {
  let isi;
  try {
    isi = ws.bacaBiner(rel);
  } catch (e) {
    // Path RELATIF yang disimpan halaman jadi salah begitu folder kerjanya pindah, dan pesan
    // ENOENT polos menyalahkan berkasnya - padahal berkasnya ada, cuma folder kerjanya lain.
    if (e.code === 'ENOENT') {
      throw new Error('.smc2 tidak ketemu: ' + rel + '   (dicari di folder kerja: ' +
                      ws.getRoot() + ')');
    }
    throw e;
  }
  const p = await readProject(isi, unzip);
  p.file = rel;
  return p;
}

/** Ringkasan project - dipakai daftar/pohon, jauh lebih kecil daripada dump penuh. */
function ringkas(p) {
  return {
    solution: p.solution, studio: p.studio, file: p.file,
    programs: (p.programs || []).map(pr => ({
      name: pr.name,
      sections: (pr.sections || []).map(s => ({
        name: s.name, kind: s.kind, rungs: (s.rungs || []).length,
        st: s.kind === 'st' ? (s.st || '').length : 0,
      })),
    })),
    variables: (p.variables || []).length,
  };
}

// -------------------------------------------------------------------- git
//
// Git dijalankan sebagai proses anak DENGAN argumen terpisah (bukan string shell): pesan commit
// datang dari luar, dan pesan yang memuat tanda kutip atau `&&` di jalur shell itu jalan masuk
// buat menjalankan perintah lain.
function git(args, cwd) {
  const r = spawnSync('git', args, { cwd: cwd, encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

/**
 * Folder ini repo git SENDIRI - bukan kebetulan berada DI DALAM repo orang lain.
 *
 * Bedanya menentukan, dan ini sudah kejadian: `C:/Users/denny` ternyata sebuah repo git, jadi
 * folder riwayat mana pun di bawah home dianggap milik repo itu. Akibatnya `git log` menampilkan
 * riwayat home, dan `git add -A` menyentuh index-nya - riwayat project jadi tercampur ke repo
 * yang tidak ada hubungannya, dan pemiliknya tidak pernah diberi tahu.
 *
 * Karena itu yang diperiksa bukan "apakah di dalam work tree", tapi "apakah toplevel-nya PERSIS
 * folder ini".
 */
function repoSendiri(dir) {
  const r = git(['rev-parse', '--show-toplevel'], dir);
  if (r.code !== 0 || !r.out) return false;
  return path.resolve(r.out) === path.resolve(dir);
}

/**
 * Isi sebuah FOLDER PROJECT: mana PLC-nya, mana HMI-nya.
 *
 * Satu folder per mesin itu cara orangnya menyimpan pekerjaan, jadi itu juga yang dipakai di
 * sini - bukan meminta path .smc2 dan folder .nbp dipilih satu-satu. Yang dipilih satu folder;
 * sisanya dibaca dari isinya.
 *
 * Folder riwayat (`*-history`) dilewati: di dalamnya ADA salinan .smc2 dan .nbp, dan kalau ikut
 * terpindai, project yang dipantau bisa jadi salinan riwayatnya sendiri - yang berarti
 * suntingan di Studio tidak pernah tercatat lagi.
 */
function pindaiProject(dirRel) {
  const dir = ws.amanPath(dirRel || '.');
  const smc2 = [], hmi = [];

  (function jalan(d, dalam) {
    if (dalam > 2) return;
    let isi = [];
    try { isi = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
    for (const x of isi) {
      const penuh = path.join(d, x.name);
      if (x.isDirectory()) {
        if (/-history$/i.test(x.name) || x.name.toLowerCase() === 'temp' ||
            x.name === 'node_modules' || x.name === '.git') continue;
        // Folder yang memuat .nbp itu project NB. Ditandai di sini, isinya tidak ditelusuri
        // lebih dalam - project NB memuat ratusan berkas layar yang tidak ada gunanya di sini.
        let punyaNbp = false;
        try { punyaNbp = fs.readdirSync(penuh).some(f => /\.nbp$/i.test(f)); } catch (e) {}
        if (punyaNbp) { hmi.push(path.relative(ws.getRoot(), penuh)); continue; }
        jalan(penuh, dalam + 1);
      } else if (/\.smc2$/i.test(x.name)) {
        smc2.push(path.relative(ws.getRoot(), penuh));
      } else if (/\.nbp$/i.test(x.name)) {
        const rel = path.relative(ws.getRoot(), d);
        if (hmi.indexOf(rel) < 0) hmi.push(rel);
      }
    }
  })(dir, 0);

  const simpan = bacaDaftar().find(x => x.folder === path.relative(ws.getRoot(), dir));
  return {
    folder: path.relative(ws.getRoot(), dir) || '.',
    smc2, hmi,
    // Yang sudah pernah dipilih menang atas hasil tebakan - folder yang isinya dua project
    // tidak boleh berganti sendiri tiap halaman dibuka.
    dipilih: simpan ? { smc2: simpan.smc2, nb: simpan.nb } : null,
  };
}

const ALAT = {
  // ---------------------------------------------------------------- berkas
  'fs/list': (q) => ws.list(q.dir || '.'),
  'fs/find': (q) => ({ root: ws.getRoot(), files: ws.cari(q.pattern || '*.smc2', +q.limit || 200) }),
  'fs/read': (q) => ({ path: q.path, text: ws.baca(q.path) }),
  'fs/write': (b) => ws.tulis(b.path, b.content == null ? '' : b.content),
  'ws/get': () => ({ root: ws.getRoot() }),
  'ws/set': (b) => ({ root: ws.setRoot(b.dir) }),

  // ----------------------------------------------------------------- smc2
  'smc2/summary': async (q) => ringkas(await bacaSmc2(q.path)),
  'smc2/read': async (q) => {
    const p = await bacaSmc2(q.path);
    // Satu section saja kalau diminta - project nyata 800+ rung, dan mengirim semuanya tiap kali
    // membuka satu section bikin halaman menunggu megabyte JSON yang 99%-nya tidak dipakai.
    if (q.program && q.section) {
      const pr = (p.programs || []).find(x => x.name === q.program);
      const s = pr && (pr.sections || []).find(x => x.name === q.section);
      if (!s) throw new Error('section tidak ketemu: ' + q.program + ' / ' + q.section);
      return { solution: p.solution, program: pr.name, section: s.name, kind: s.kind,
               rungs: s.rungs || [], st: s.st || null, variables: p.variables };
    }
    return p;
  },
  'smc2/diff': async (q) => {
    const a = await bacaSmc2(q.a), b = await bacaSmc2(q.b);
    const d = D.diffProjects(a, b);
    return { summary: D.diffLine(d), report: D.diffReport(d, q.a, q.b), diff: d };
  },

  // -------------------------------------------------------------- NB-Designer
  // Skripnya dijalankan APA ADANYA sebagai proses anak, sama seperti tombol di halaman alat.
  // Kalau API ini punya salinan logikanya sendiri, dua jalur itu akan berbeda hasil dan yang
  // satu diam-diam salah - dan yang salah di sini menulis ke project HMI orang.
  'nb/sync': (b) => {
    if (!b.smc2 || !b.nb) throw new Error('butuh "smc2" dan "nb"');
    const argv = [path.join(REPO, 'scripts', 'nb_sync.js'), ws.amanPath(b.smc2), ws.amanPath(b.nb)];
    if (b.rebuild) argv.push('--rebuild');
    // `write` HARUS diminta eksplisit. Tanpa itu skripnya cuma melaporkan apa yang AKAN
    // dilakukan - dan itu yang bikin alat ini aman dipanggil buat melihat dulu.
    if (b.write) argv.push('--write');
    const r = spawnSync(process.execPath, argv, { encoding: 'utf8', cwd: REPO });
    return { code: r.status, wrote: !!b.write, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
  },
  'nb/alarm': (b) => {
    if (!b.source || !b.nb) throw new Error('butuh "source" (project JSON / AlarmLib.csv) dan "nb"');
    const argv = [path.join(REPO, 'scripts', 'nb_apply.js'), ws.amanPath(b.source), ws.amanPath(b.nb)];
    if (b.write) argv.push('--write');
    const r = spawnSync(process.execPath, argv, { encoding: 'utf8', cwd: REPO });
    return { code: r.status, wrote: !!b.write, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
  },

  // ------------------------------------------------------------- dialog pilih
  // Path diketik tangan itu jalur paling sering salah di seluruh alat ini. Browser TIDAK BOLEH
  // memberi path lengkap dari `<input type=file>` (batas keamanannya, bukan bug), jadi dialognya
  // dibuka SERVER - dia memang jalan di desktop orangnya sendiri.
  'pick/file': async (b) => {
    const p = await pick.berkas({
      title: b.title || 'Pilih berkas .smc2',
      filter: b.filter || 'Project Sysmac (*.smc2)|*.smc2|Semua berkas (*.*)|*.*',
      start: b.start || ws.getRoot(),
    });
    return { path: p, relative: p ? relatifKeRoot(p) : null };
  },
  'pick/folder': async (b) => {
    const p = await pick.folder({ title: b.title || 'Pilih folder', start: b.start || ws.getRoot() });
    return { path: p, relative: p ? relatifKeRoot(p) : null };
  },

  // Daftar project yang PERNAH dicatat - supaya halaman lain (alat NB) tinggal memilih, bukan
  // meminta path yang sama diketik ulang. Dibaca dari berkas daftar, bukan ditebak dari nama
  // folder: folder bernama `*-history` belum tentu isinya benar.
  'project/scan': (q) => pindaiProject(q.dir || '.'),
  'project/set': (b) => {
    if (!b.smc2) throw new Error('butuh "smc2"');
    const dirRel = b.dir || (path.basename(String(b.smc2)).replace(/\.smc2$/i, '') + '-history');
    const isi = tulisDaftar(String(b.smc2), dirRel,
                            { nb: b.nb || '', folder: b.folder || '' });
    return { item: isi[0] };
  },
  // Buka folder riwayat di VS Code. Yang menampilkan perubahan paling enak itu editor yang
  // memang dibikin buat itu - halaman ini tidak perlu jadi penampil git kedua yang lebih buruk.
  // `code.cmd` disebut langsung, bukan lewat shell: Node menolak `.cmd` tanpa shell, dan shell
  // menyambung argumen tanpa escape - path project rutin memuat spasi.
  'open/vscode': (b) => {
    const dir = ws.amanPath(b.dir || '.');
    const bin = process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')
      : 'code';
    const ada = process.platform !== 'win32' || fs.existsSync(bin);
    if (!ada) throw new Error('VS Code tidak ketemu di ' + bin);
    const r = spawnSync(bin, [dir], { encoding: 'utf8', shell: process.platform === 'win32' });
    if (r.status !== 0 && r.error) throw new Error(r.error.message);
    return { opened: path.relative(ws.getRoot(), dir) || '.' };
  },

  'track/list': () => ({ root: ws.getRoot(), items: bacaDaftar() }),
  'track/get': (q) => ({ item: bacaDaftar().find(x => x.smc2 === q.smc2) || null }),
  // Setelan per PROJECT (folder NB-nya) disimpan di daftar yang sama. Per project, bukan global:
  // satu folder kerja bisa memuat beberapa mesin, dan folder HMI tiap mesin beda.
  'track/set': (b) => {
    if (!b.smc2) throw new Error('butuh "smc2"');
    const dirRel = b.dir || (path.basename(String(b.smc2)).replace(/\.smc2$/i, '') + '-history');
    const isi = tulisDaftar(String(b.smc2), dirRel, b.nb !== undefined ? { nb: b.nb } : {});
    return { item: isi[0] };
  },

  // ---------------------------------------------------------- pantau otomatis
  //
  // Sysmac Studio tidak punya kait "sesudah menyimpan", jadi yang dipantau berkasnya. Begitu
  // `.smc2` berubah DAN sudah diam beberapa detik, versinya dicatat sendiri - tanpa perlu ada
  // yang ingat menekan tombol. Yang tidak pernah dicatat tidak bisa dikembalikan, dan itu selalu
  // baru ketahuan waktu perubahannya ternyata salah.
  'watch/start': (b) => {
    const file = ws.amanPath(b.path);
    const rel = String(b.path);
    const outRel = b.out || (path.basename(rel).replace(/\.smc2$/i, '') + '-history');

    // Keadaan SEBELUM disunting dicatat langsung, jangan menunggu simpanan pertama. Justru versi
    // inilah yang dicari waktu suntingannya ternyata salah - dan kalau baru dicatat sesudah
    // Studio menyimpan, versi itu tidak pernah ada di riwayat.
    let awal = null;
    try {
      awal = ALAT['git/track']({ path: rel, out: outRel, nb: b.nb,
                                 message: 'otomatis: sebelum disunting' });
    } catch (e) { awal = { changed: false, error: e.message }; }

    // Satu fungsi pencatat dipakai DUA pemantau (PLC dan HMI). Yang dicatat selalu dua-duanya
    // sekaligus, dari sisi mana pun yang barusan disimpan: PLC yang dikembalikan ke versi
    // kemarin sementara HMI tetap versi hari ini itu pasangan yang alamatnya tidak lagi cocok,
    // dan tidak ada yang memberi tahu.
    const catat = async (judul) => {
      await readProject(fs.readFileSync(file), unzip);   // .smc2 harus utuh dulu
      const hasil = ALAT['git/track']({ path: rel, out: outRel, nb: b.nb, message: judul });
      if (hasil.changed && b.nb && b.nbWrite !== false) {
        try {
          const nb = ALAT['nb/sync']({ smc2: rel, nb: b.nb, rebuild: !!b.nbRebuild, write: true });
          hasil.nb = { code: nb.code, wrote: true,
                       out: (nb.out || '').split('\n').filter(Boolean).slice(-1)[0] || '',
                       err: nb.err };
        } catch (e) { hasil.nb = { code: 1, wrote: false, out: '', err: e.message }; }
      }
      return hasil;
    };

    const pesanPlc = async () => {
      try {
        const lama = ws.amanPath(path.join(outRel, 'project.smc2'));
        if (!fs.existsSync(lama)) return 'otomatis: catatan pertama';
        const a = await readProject(fs.readFileSync(lama), unzip);
        const bb = await readProject(fs.readFileSync(file), unzip);
        return 'otomatis: ' + D.diffLine(D.diffProjects(a, bb));
      } catch (e) {
        return 'otomatis: PLC tersimpan ' + new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
    };

    const st = watcher.mulai({ file, rel, pesan: pesanPlc, catat });

    // HMI ikut dipantau kalau folder NB-nya diketahui. `.nbp` itu satu berkas XML - perubahannya
    // kelihatan langsung di `git diff`, tanpa perlu diekstrak.
    let hmi = null;
    if (b.nb) {
      const nbp = findNbProject(ws.amanPath(b.nb));
      if (!nbp.err) {
        hmi = watcher.mulai({
          file: nbp.nbpPath,
          rel: path.relative(ws.getRoot(), nbp.nbpPath),
          pesan: async () => 'otomatis: HMI disimpan ' +
                             new Date().toISOString().slice(11, 19),
          catat,
        });
      }
    }
    return Object.assign({ dir: outRel, initial: awal, hmi }, st);
  },

  'watch/stop': (b) => {
    const hasil = watcher.berhenti(ws.amanPath(b.path));
    // Pemantau HMI ikut dihentikan. Yang tertinggal hidup terus mencatat sendiri sesudah
    // orangnya menekan "berhenti" - dan riwayat yang bertambah tanpa diminta bikin orang
    // berhenti percaya pada tombolnya.
    if (b.nb) {
      const nbp = findNbProject(ws.amanPath(b.nb));
      if (!nbp.err) hasil.hmi = watcher.berhenti(nbp.nbpPath);
    }
    return hasil;
  },

  'watch/status': (q) => {
    if (!q.path) return watcher.status();
    const st = watcher.status(ws.amanPath(q.path));
    if (q.nb) {
      const nbp = findNbProject(ws.amanPath(q.nb));
      if (!nbp.err) st.hmi = watcher.status(nbp.nbpPath);
    }
    return st;
  },

  // ------------------------------------------------------------------ git
  // Jejak perubahan .smc2 supaya `git diff`-nya kebaca: ekstrak jadi teks, lalu commit.
  // `.smc2` itu ZIP - di-commit apa adanya git cuma bilang "binary files differ".
  'git/track': (b) => {
    const smc2 = ws.amanPath(b.path);
    const outRel = b.out || (path.basename(String(b.path)).replace(/\.smc2$/i, '') + '-history');
    const out = ws.amanPath(outRel);
    const ekstrak = spawnSync(process.execPath,
      [path.join(REPO, 'scripts', 'smc2_extract.js'), smc2, out, '--clean'],
      { encoding: 'utf8' });
    if (ekstrak.status !== 0) throw new Error((ekstrak.stderr || ekstrak.stdout || '').trim());

    // Berkas `.smc2` ASLINYA ikut disimpan di dalam riwayat. Teks hasil ekstrak itu buat
    // DIBACA (dan buat `git diff`), bukan buat dipulihkan - dia tidak memuat segalanya, jadi
    // riwayat yang cuma berisi teks bisa dibaca tapi tidak bisa dikembalikan.
    fs.mkdirSync(out, { recursive: true });
    fs.copyFileSync(smc2, path.join(out, 'project.smc2'));

    // HMI ikut dicatat kalau folder NB-nya diketahui. `.nbp` itu XML polos, jadi `git diff`-nya
    // langsung kebaca tanpa perlu diekstrak dulu - dan tanpa ini, mengembalikan PLC ke versi
    // kemarin meninggalkan HMI di versi hari ini: alamat yang dipantaunya jadi tidak cocok,
    // dan tidak ada yang memberi tahu.
    if (b.nb) {
      const nbp = findNbProject(ws.amanPath(b.nb));
      if (!nbp.err) fs.copyFileSync(nbp.nbpPath, path.join(out, 'hmi.nbp'));
    }

    if (!repoSendiri(out)) git(['init'], out);
    git(['add', '-A'], out);
    const status = git(['status', '--porcelain'], out);
    if (!status.out) return { changed: false, dir: outRel, message: 'tidak ada perubahan' };

    // Pesan commit-nya hasil smc2_diff kalau ada versi sebelumnya - itu yang bikin riwayatnya
    // bisa dibaca tanpa membuka satu commit pun.
    const pesan = b.message || ('smc2: ' + new Date().toISOString().slice(0, 19).replace('T', ' '));
    const c = git(['-c', 'user.name=Susmax', '-c', 'user.email=susmax@local',
                   'commit', '-m', pesan], out);
    tulisDaftar(String(b.path), outRel, b.nb ? { nb: b.nb } : {});
    return { changed: true, dir: outRel, message: pesan, commit: c.out.split('\n')[0] || c.err };
  },
  'git/log': (q) => {
    const dir = ws.amanPath(q.dir);
    // Bukan repo SENDIRI = tidak punya riwayat, bukan 'pinjam riwayat repo di atasnya'.
    if (!repoSendiri(dir)) return { repo: false, entries: [] };
    // Pemisah medan DIBANGUN dengan fromCharCode, bukan ditulis apa adanya di sumber:
    // karakter kontrol di dalam berkas kode tidak kelihatan di editor mana pun dan hilang
    // begitu berkasnya lewat alat yang merapikan teks - pemisahnya lenyap tanpa tanda.
    const US = String.fromCharCode(31);
    // %N = catatan susulan (git notes). Judul asli TETAP ditampilkan - catatan menambahi, bukan
    // menggantikan: yang mau tahu "apa yang berubah" tetap butuh ringkasan otomatisnya.
    const r = git(['log', '--pretty=format:%h' + US + '%ad' + US + '%s' + US + '%N',
                   '--date=iso', '-n', String(+q.limit || 30)], dir);
    return {
      repo: true,
      entries: r.out ? r.out.split('\n').filter(Boolean).map(l => {
        const [hash, date, subject, note] = l.split(US);
        return { hash, date, subject, note: (note || '').trim() };
      }) : [],
    };
  },
  // Judul menyusul. Dipasang sebagai `git notes`, BUKAN `commit --amend`: amend mengganti hash,
  // dan hash yang berubah bikin daftar riwayat yang sedang dilihat orang menunjuk commit yang
  // sudah tidak ada - termasuk tombol "Kembalikan" di sebelahnya.
  'git/message': (b) => {
    const dir = ws.amanPath(b.dir);
    if (!repoSendiri(dir)) throw new Error('bukan repo git sendiri: ' + b.dir);
    const rev = String(b.rev || '');
    if (!/^[0-9a-f]{4,40}$/i.test(rev)) throw new Error('bukan hash commit: ' + rev);
    const r = git(['-c', 'user.name=Susmax', '-c', 'user.email=susmax@local',
                   'notes', 'add', '-f', '-m', String(b.message || ''), rev], dir);
    if (r.code !== 0) throw new Error(r.err || 'gagal menulis catatan');
    return { rev, message: String(b.message || '') };
  },

  'git/show': (q) => {
    const dir = ws.amanPath(q.dir);
    if (!repoSendiri(dir)) throw new Error('bukan repo git sendiri: ' + q.dir);
    // Nama commit divalidasi ketat: yang masuk ke argumen git harus benar-benar hash, bukan
    // apa pun yang bisa dibaca git sebagai opsi (`--upload-pack=...`).
    const rev = String(q.rev || '');
    if (!/^[0-9a-f]{4,40}$/i.test(rev)) throw new Error('bukan hash commit: ' + rev);
    const r = git(['show', '--stat', '--patch', rev], dir);
    return { rev, diff: r.out.slice(0, 400000) };
  },

  // Kembalikan `.smc2` ke versi mana pun yang pernah dicatat. Ini yang bikin "coba, gagal,
  // balik" jadi murah - tanpa ini riwayatnya cuma bisa DIBACA, tidak bisa dipakai.
  //
  // Yang dipulihkan berkas `.smc2` ASLINYA (ikut disimpan apa adanya di dalam riwayat), bukan
  // rekonstruksi dari teks ekstrak: teks itu buat dibaca manusia dan tidak memuat segalanya.
  'git/restore': (b) => {
    const dir = ws.amanPath(b.dir);
    if (!repoSendiri(dir)) throw new Error('bukan repo git sendiri: ' + b.dir);
    const rev = String(b.rev || '');
    if (!/^[0-9a-f]{4,40}$/i.test(rev)) throw new Error('bukan hash commit: ' + rev);
    const nama = String(b.file || 'project.smc2');
    // Dua-duanya ditolak, bukan cuma '/': di Windows pemisahnya '\' dan yang lolos di situ
    // bisa menunjuk berkas lain di dalam commit.
    if (nama.indexOf('/') >= 0 || nama.indexOf('\\') >= 0) {
      throw new Error('nama berkas saja, tanpa folder: ' + nama);
    }
    const r = spawnSync('git', ['show', rev + ':' + nama], { cwd: dir });
    if (r.status !== 0) throw new Error((r.stderr || '').toString().trim() || 'git show gagal');
    const tujuan = ws.amanPath(b.to);
    // Yang ditimpa DICADANGKAN dulu. Memulihkan versi lama di atas versi yang belum sempat
    // dicatat menghapus justru pekerjaan yang belum masuk riwayat.
    if (fs.existsSync(tujuan)) {
      const cap = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      fs.copyFileSync(tujuan, tujuan + '.' + cap + '.bak');
    }
    fs.writeFileSync(tujuan, r.stdout);
    return { restored: b.to, from: rev, bytes: r.stdout.length };
  },
};

/** Jalankan satu alat. Selalu mengembalikan Promise. */
function panggil(nama, isi) {
  const fn = ALAT[nama];
  if (!fn) return Promise.reject(new Error('api tidak dikenal: ' + nama));
  return Promise.resolve().then(() => fn(isi || {}));
}

module.exports = { ALAT, panggil, ringkas, bacaSmc2 };
