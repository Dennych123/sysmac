// smc2_rename.js - ganti nama program di dalam .smc2.
//
// Yang dijaga di sini bukan "namanya berubah" melainkan "SEMUA PERAN ikut berubah". Nama
// program mengikat di beberapa tempat, dan yang paling menentukan bukan pohon project
// melainkan penugasan task: pohonnya diganti sendirian, program itu tetap ada di layar Studio
// tapi BERHENTI DIEKSEKUSI - tanpa error, tanpa tanda apa pun. Tes yang cuma memeriksa pohon
// project lulus persis di kegagalan itu.
//
// Fixture-nya membawa ketiga peran (lihat reader/tests/fixtures/make_fixture.js): .oem,
// penugasan task, dan satu AssociatedProgramModel per program.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const FIX = path.join(__dirname, '..', 'reader', 'tests', 'fixtures', 'synthetic.smc2');
const SCRIPT = path.join(__dirname, '..', 'scripts', 'smc2_rename.js');
if (!fs.existsSync(FIX)) {
  console.log('>>BAD fixture synthetic.smc2 tidak ada - bikin: node reader/tests/fixtures/make_fixture.js');
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'smc2rename-'));
const salin = () => { const p = path.join(tmp, 'x' + Math.random().toString(36).slice(2) + '.smc2'); fs.copyFileSync(FIX, p); return p; };
const jalan = (p, ...a) => spawnSync(process.execPath, [SCRIPT, p, ...a], { encoding: 'utf8' });

const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
async function isiSemua(p) {
  const b = fs.readFileSync(p);
  const files = await unzip(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  let s = '';
  for (const [, f] of files) {
    const d = Buffer.from(await inflate(f));
    const t = d.toString('utf8');
    if (Buffer.from(t, 'utf8').equals(d)) s += t + '\n';
  }
  return s;
}

(async () => {
  // --- tanpa --write TIDAK boleh menyentuh berkasnya --------------------------------------
  // Sifat yang sama dengan nb_apply/nb_sync, dan alasannya sama: ini program mesin, jadi
  // "lihat dulu" harus benar-benar tidak menulis, bukan menulis lalu memberi tahu.
  const p0 = salin();
  const sebelum = fs.readFileSync(p0);
  const r0 = jalan(p0, 'P000_Main=P010_Main');
  chk('tanpa --write berkasnya tidak berubah sama sekali', fs.readFileSync(p0).equals(sebelum));
  chk('lihat-dulu melaporkan tempat yang akan diganti', /pohon project \(name=\)/.test(r0.stdout),
      (r0.stdout.split('\n').find(l => /pohon project/.test(l)) || '').trim());

  // --- SEMUA peran ikut diganti ------------------------------------------------------------
  const p1 = salin();
  const r1 = jalan(p1, 'P000_Main=P010_Main', 'P011_WIP_Transfer=P012_WIP_Transfer', '--write');
  chk('rename jalan sampai selesai', r1.status === 0, (r1.stderr || '').slice(0, 80));
  const isi = await isiSemua(p1);

  chk('nama lama HABIS di seluruh container', !/P000_Main|P011_WIP_Transfer/.test(isi),
      (isi.match(/.{0,40}(P000_Main|P011_WIP_Transfer).{0,20}/) || [''])[0]);
  chk('pohon project memakai nama baru', /name="P010_Main"/.test(isi));
  // INI penjaga bug-nya. Kalau penugasan task terlewat, program tetap tergambar di Studio dan
  // tidak pernah dijalankan - dan itu tidak kelihatan dari mana pun kecuali dari sini.
  chk('penugasan task ikut diganti (ProgramName)', /ProgramName="P010_Main"/.test(isi));
  chk('penugasan task ikut diganti (InstanceName)', /InstanceName="P010_Main"/.test(isi));
  chk('AssociatedProgramModel ikut diganti', /<PouInstanceName>P010_Main<\/PouInstanceName>/.test(isi));
  // Urutan eksekusi BUKAN urusan rename. Nomor di nama itu label; menyamakannya dengan
  // SequenceNumber berarti diam-diam menyusun ulang urutan jalan mesin.
  chk('SequenceNumber TIDAK ikut berubah',
      /ProgramName="P010_Main"[^>]*SequenceNumber="1"/.test(isi)
      && /ProgramName="P012_WIP_Transfer"[^>]*SequenceNumber="2"/.test(isi));

  // --- reader masih bisa membaca hasilnya --------------------------------------------------
  const { readProject } = require(path.join(__dirname, '..', 'reader', 'src', 'smc2.js'));
  const b1 = fs.readFileSync(p1);
  const proj = await readProject(b1, buf => require(path.join(__dirname, '..', 'reader', 'src', 'zip.js')).unzip(buf));
  const nama = proj.programs.map(x => x.name);
  chk('container hasil tulis masih terbaca reader', nama.includes('P010_Main'), nama.join(' '));
  const rung = proj.programs.reduce((n, p) => n + p.sections.reduce((m, s) => m + (s.rungs || []).length, 0), 0);
  chk('jumlah rung tidak berubah', rung > 0, rung + ' rung');

  // --- cadangan dibuat, dan tidak menimpa yang sebelumnya ----------------------------------
  const baks = fs.readdirSync(path.dirname(p1)).filter(f => f.startsWith(path.basename(p1)) && f.endsWith('.bak'));
  chk('cadangan bertanggal dibuat', baks.length === 1, baks.join(' '));

  // --- yang ditolak, bukan ditebak ---------------------------------------------------------
  // Nama yang tidak sah baru ditolak Studio waktu project dibuka, dan saat itu berkasnya sudah
  // ditulis. Ditolak di sini, sebelum apa pun disentuh.
  const p2 = salin(), asli2 = fs.readFileSync(p2);
  const r2 = jalan(p2, 'P000_Main=010 Main', '--write');
  chk('nama baru tidak sah ditolak', r2.status !== 0 && /identifier IEC/.test(r2.stderr));
  chk('berkas tidak disentuh waktu ditolak', fs.readFileSync(p2).equals(asli2));

  const p3 = salin();
  const r3 = jalan(p3, 'P000_Main=SAMA', 'P011_WIP_Transfer=SAMA', '--write');
  chk('dua nama baru yang kembar ditolak', r3.status !== 0 && /kembar/.test(r3.stderr));

  const p4 = salin(), asli4 = fs.readFileSync(p4);
  const r4 = jalan(p4, 'TIDAK_ADA=P999_X', '--write');
  chk('nama lama yang tidak ada dilaporkan, bukan menulis kosong',
      r4.status !== 0 && /tidak ada yang cocok/i.test(r4.stdout));
  chk('berkas tidak disentuh waktu tidak ada yang cocok', fs.readFileSync(p4).equals(asli4));

  // --- peran yang KOSONG harus kelihatan ---------------------------------------------------
  // Laporan yang cuma memberi total besar sambil melewatkan satu peran itu laporan yang
  // menyesatkan. Peran ber-nol ditandai, bukan disembunyikan.
  chk('peran yang tidak kena satu pun ditandai', /!!\s+0\s+qualifier variabel/.test(r1.stdout),
      (r1.stdout.split('\n').find(l => /qualifier variabel/.test(l)) || '').trim());

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fail ? '\n' + fail + ' GAGAL' : '\nsemua lulus');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e.stack || e.message); process.exit(1); });
