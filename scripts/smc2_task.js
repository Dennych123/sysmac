// Menugaskan program ke TASK di dalam `.smc2`, tanpa Sysmac Studio.
//
//   node scripts/smc2_task.js x.smc2                      # daftar program + task (hanya baca)
//   node scripts/smc2_task.js x.smc2 P011_ST1             # lihat dulu, TIDAK menulis
//   node scripts/smc2_task.js x.smc2 P011_ST1 --write     # tugaskan ke PrimaryTask
//   node scripts/smc2_task.js x.smc2 P011_ST1 --task PeriodicTask0 --write
//
// INI yang selama ini jadi langkah tangan terakhir. XML import bisa membawa program, tabel
// variabel, section, rung - tapi TIDAK penugasan task: XSD-nya tidak punya elemennya. Dan
// program yang tidak ditugaskan **TIDAK DIEKSEKUSI tanpa satu pun keluhan**: dia tergambar
// rapi di Multiview Explorer, Build-nya bersih, rung-nya benar, mesinnya diam.
//
// Bentuk yang ditulis dibaca dari project mesin yang jalan (`Ce Insert Track.smc2`), bukan
// dikarang, dan cocok dengan yang dicatat project manufacturing_io waktu men-diff satu
// penugasan tangan di Studio 1.66/NJ501. EMPAT tempat, dan semuanya wajib:
//
//   1. `.oem`            anak `<Entity type="NexAssociatedProgram">` di bawah entity task
//   2. `<id anak>.xml`   `<AssociatedProgramModel><PouInstanceName>`
//   3. `<id task>.xml`   `<AssociatedProgramData ... IniFileTrackingId=... SequenceNumber=...>`
//   4. OPC UA sim        `<Node Name="<program>" IsPublished="false" />` di bawah node task
//
// Yang menentukan program itu JALAN atau tidak cuma nomor 3. Nomor 1, 2, 4 yang membuat Studio
// menampilkannya sebagai penugasan dan bukan sebagai berkas yatim. Melewatkan salah satunya
// tidak pernah memunculkan pesan galat - itu sebabnya tiap tempat dilaporkan sendiri di bawah.
//
// `IniFileTrackingId` = trackingId entity Program-nya, TANPA tanda hubung. Diambil dari .oem,
// tidak boleh dikarang: yang salah membuat Studio menautkan artefak compile ke POU lain.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
const { packZip } = require(path.join(__dirname, 'smc2_write.js'));
const { batasEntity } = require(path.join(__dirname, 'smc2_section.js'));

const BOM = '﻿';
const guid = () => crypto.randomUUID();
const xesc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function capStamp() {
  const d = new Date();
  const p2 = n => String(n).padStart(2, '0');
  return p2(d.getMonth() + 1) + '/' + p2(d.getDate()) + '/' + d.getFullYear() + ' '
    + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
}

// Atribut satu baris <Entity ...>. Dipakai buat baca, bukan buat tulis.
const atribut = tag => Object.fromEntries([...tag.matchAll(/(\w+)="([^"]*)"/g)].map(m => [m[1], m[2]]));

// Entity BERNAMA `nama` dengan tipe tertentu: dicari lewat posisi atribut name=, lalu mundur ke
// pembuka "<Entity " terdekat. Mencocokkan seluruh tag sekaligus dengan satu regex gampang salah
// karena urutan atribut tidak sama di tiap versi Studio.
function cariEntity(oem, tipe, nama) {
  const re = new RegExp('<Entity type="' + tipe + '"[^>]*?name="' + nama.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>', 'g');
  const m = re.exec(oem);
  if (!m) return null;
  return { mulai: m.index, tag: m[0], attr: atribut(m[0]), akhir: batasEntity(oem, m.index) };
}

// Daftar isi project: program mana ada, task mana menjalankan apa, dan - yang paling dicari -
// program mana yang TIDAK dijalankan siapa pun.
function daftar(oem) {
  const programs = [...oem.matchAll(/<Entity type="Program"[^>]*>/g)].map(m => {
    const a = atribut(m[0]);
    return { name: a.name, subtype: a.subtype || '', trackingId: a.trackingId };
  });
  const tasks = [];
  for (const m of oem.matchAll(/<Entity type="NexTask"[^>]*>/g)) {
    const a = atribut(m[0]);
    const akhir = batasEntity(oem, m.index);
    const blok = oem.slice(m.index, akhir < 0 ? oem.length : akhir);
    tasks.push({
      name: a.name, id: a.id,
      programs: [...blok.matchAll(/<Entity type="NexAssociatedProgram"[^>]*>/g)].map(x => atribut(x[0]).name),
    });
  }
  const ditugaskan = new Set([].concat(...tasks.map(t => t.programs)));
  return { programs, tasks, yatim: programs.map(p => p.name).filter(n => !ditugaskan.has(n)) };
}

/**
 * buf   : isi .smc2
 * spec  : { program, task }        task default "PrimaryTask"
 * hasil : { buf, entries, lapor }  lapor = daftar tempat yang beneran diubah
 */
async function tugaskan(buf, spec) {
  const task = spec.task || 'PrimaryTask';
  const now = capStamp();

  const asli = [];
  let oemName = null, oemText = null;
  for (const [nama, e] of unzip(buf)) {
    const data = Buffer.from(await inflate(e));
    if (nama.endsWith('.oem')) { oemName = nama; oemText = data.toString('utf8'); }
    asli.push({ name: nama, data });
  }
  if (!oemText) throw new Error('.oem tidak ketemu - ini bukan project Sysmac');
  const dir = oemName.split('/')[0];

  const prog = cariEntity(oemText, 'Program', spec.program);
  if (!prog) throw new Error('program "' + spec.program + '" tidak ada di project ini');
  const tid = prog.attr.trackingId;
  if (!tid) throw new Error('program "' + spec.program + '" tidak punya trackingId di .oem');

  const t = cariEntity(oemText, 'NexTask', task);
  if (!t) throw new Error('task "' + task + '" tidak ada (lihat Task Settings di Studio)');
  if (t.akhir < 0) throw new Error('batas entity task "' + task + '" tidak ketemu');

  const blokTask = oemText.slice(t.mulai, t.akhir);
  if (new RegExp('<Entity type="NexAssociatedProgram"[^>]*name="' + spec.program + '"').test(blokTask)) {
    return { buf: null, entries: asli, sudah: true, lapor: [], task, program: spec.program };
  }

  const lapor = [];
  const aid = guid();

  // --- 1. .oem: anak NexAssociatedProgram di bawah task ---
  // subtype-nya IKUT program (MultipartLadder buat ladder, StructuredText buat ST). Disamakan
  // semua ke satu nilai, Studio menampilkan ikon yang salah dan penugasannya tetap jalan - jadi
  // salahnya tidak kelihatan sampai ada yang membuka daftarnya.
  // DN wajib ikut (Studio menulisnya di penugasan yang dibuat sendiri), dan ent() cuma
  // menambahkannya buat PouBody - jadi tagnya disusun di sini, bukan ditambal sesudahnya.
  const anak = '<Entity type="NexAssociatedProgram" subtype="' + (prog.attr.subtype || '')
    + '" id="' + aid + '" name="' + xesc(spec.program) + '" version="0" dateCreated="' + now
    + '" dateLastModified="' + now + '" trackingId="' + guid() + '" DN="' + xesc(spec.program) + '">'
    + '<AccessInfos /><ChildEntities /></Entity>';
  let oemBaru;
  // ChildEntities MILIK TASK ITU = yang PERTAMA sesudah tag pembukanya. Mencari "<ChildEntities />"
  // di mana saja dalam blok task salah: tiap anak punya ChildEntities sendiri, dan yang pertama
  // kosong biasanya milik anak - penugasan baru jadi tersarang di dalam penugasan lain, yang
  // tergambar wajar di .oem dan tidak pernah kebaca sebagai penugasan.
  const sesudahTag = t.mulai + t.tag.length;
  const mCE = /<ChildEntities\s*\/>|<ChildEntities\s*>/.exec(oemText.slice(sesudahTag, t.akhir));
  if (!mCE) throw new Error('ChildEntities task "' + task + '" tidak ketemu');
  if (mCE[0].endsWith('/>')) {
    // Task yang belum punya anak sama sekali ditulis Studio sebagai <ChildEntities />.
    const at = sesudahTag + mCE.index;
    oemBaru = oemText.slice(0, at) + '<ChildEntities>' + anak + '</ChildEntities>' + oemText.slice(at + mCE[0].length);
  } else {
    // Sudah ada anak: sisip sebelum penutup ChildEntities TASK-nya, yaitu penutup terakhir
    // sebelum </Entity> task - anak-anaknya sudah tertutup duluan di dalamnya.
    const tutup = oemText.lastIndexOf('</ChildEntities>', t.akhir);
    if (tutup < t.mulai) throw new Error('ChildEntities task "' + task + '" tidak ketemu');
    oemBaru = oemText.slice(0, tutup) + anak + oemText.slice(tutup);
  }
  lapor.push({ tempat: '.oem', isi: 'NexAssociatedProgram ' + spec.program + ' di bawah ' + task });

  // --- 2. berkas anak: AssociatedProgramModel ---
  const modelXml = '<AssociatedProgramModel xmlns="http://schemas.datacontract.org/2004/07/Omron.Cxap.Modules.TaskConfiguration.Models"'
    + ' xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><PouInstanceName>' + xesc(spec.program) + '</PouInstanceName></AssociatedProgramModel>';
  const berkasBaru = [{ name: dir + '/' + aid + '.xml', data: Buffer.from(modelXml, 'utf8') }];
  lapor.push({ tempat: aid + '.xml', isi: 'PouInstanceName ' + spec.program });

  // --- 3. berkas task: AssociatedProgramData ---
  // INI yang menentukan programnya dieksekusi. SequenceNumber diambil dari nomor tertinggi yang
  // sudah ada + 1 - bukan dari jumlah baris: nomor yang dobel bikin Studio menyusun ulang sendiri.
  const iTask = asli.findIndex(e => e.name === dir + '/' + t.attr.id + '.xml');
  if (iTask < 0) throw new Error('berkas task ' + t.attr.id + '.xml tidak ada di container');
  const teksTask = asli[iTask].data.toString('utf8');
  const CRLF = /\r\n/.test(teksTask) ? '\r\n' : '\n';
  const barisTask = teksTask.split(/\r?\n/);
  const seq = Math.max(0, ...barisTask.map(l => +((/SequenceNumber="(\d+)"/.exec(l) || [0, 0])[1]))) + 1;
  const row = '    <AssociatedProgramData ProgramName="' + xesc(spec.program) + '" InstanceName="' + xesc(spec.program)
    + '" IniFileTrackingId="' + tid.replace(/-/g, '') + '" StartupSetting="TRUE" SequenceNumber="' + seq
    + '" IsDebugProgram="false" />';
  const iTutup = barisTask.findIndex(l => l.trim() === '</Programs>');
  const iKosong = barisTask.findIndex(l => l.trim() === '<Programs />');
  if (iTutup >= 0) barisTask.splice(iTutup, 0, row);
  else if (iKosong >= 0) barisTask.splice(iKosong, 1, '  <Programs>', row, '  </Programs>');
  else throw new Error('berkas task tidak punya daftar <Programs>');
  asli[iTask] = { name: asli[iTask].name, data: Buffer.from(barisTask.join(CRLF), 'utf8') };
  lapor.push({ tempat: t.attr.id + '.xml', isi: 'AssociatedProgramData, SequenceNumber ' + seq + ' (INI yang bikin dieksekusi)' });

  // --- 4. OPC UA simulation settings ---
  // Opsional: project yang belum pernah membuka setelannya tidak punya node task-nya, dan Studio
  // menambahkannya sendiri waktu dibuka. Jadi tidak ada di sini BUKAN kegagalan - tapi tetap
  // dilaporkan, supaya "kok tagnya gak kelihatan di simulator" tidak jadi tebak-tebakan.
  const mOpc = /<Entity type="OpcUaServerSimulationSettings"[^>]*id="([^"]+)"/.exec(oemBaru);
  if (mOpc) {
    const iOpc = asli.findIndex(e => e.name === dir + '/' + mOpc[1] + '.xml');
    if (iOpc >= 0) {
      const teksOpc = asli[iOpc].data.toString('utf8');
      const nlOpc = /\r\n/.test(teksOpc) ? '\r\n' : '\n';
      const barisOpc = teksOpc.split(/\r?\n/);
      const k = barisOpc.findIndex(l => l.trim() === '<Node Name="' + task + '">' || l.trim() === '<Node Name="' + task + '" />');
      if (k >= 0) {
        const ind = /^ */.exec(barisOpc[k])[0];
        if (barisOpc[k].trim().endsWith('/>')) barisOpc.splice(k, 1, ind + '<Node Name="' + task + '">', ind + '</Node>');
        const tutupOpc = barisOpc.indexOf(ind + '</Node>', k);
        barisOpc.splice(tutupOpc < 0 ? k + 1 : tutupOpc, 0, ind + '  <Node Name="' + xesc(spec.program) + '" IsPublished="false" />');
        asli[iOpc] = { name: asli[iOpc].name, data: Buffer.from(barisOpc.join(nlOpc), 'utf8') };
        lapor.push({ tempat: mOpc[1] + '.xml', isi: 'node OPC UA simulator di bawah ' + task });
      } else {
        lapor.push({ tempat: 'OPC UA sim', isi: 'node "' + task + '" belum ada - Studio menambahkannya sendiri waktu setelannya dibuka' });
      }
    }
  }

  const entries = asli.map(e => (e.name === oemName ? { name: oemName, data: Buffer.from(oemBaru, 'utf8') } : e));
  entries.push(...berkasBaru);
  return { buf: packZip(entries), entries, sudah: false, lapor, task, program: spec.program, seq };
}

module.exports = { tugaskan, daftar };

// ------------------------------------------------------------------------------------ CLI
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const write = args.includes('--write');
    const iTask = args.indexOf('--task');
    const task = iTask >= 0 ? args[iTask + 1] : 'PrimaryTask';
    // iTask < 0 berarti --task tidak dipakai; tanpa penjaga ini "i !== iTask + 1" membuang
    // argumen ke-0, yaitu nama berkasnya sendiri.
    const rest = args.filter((a, i) => a !== '--write' && a !== '--task' && !(iTask >= 0 && i === iTask + 1));
    const smcPath = rest[0], program = rest[1];
    if (!smcPath) {
      console.error('pakai: node scripts/smc2_task.js <project.smc2> [NAMA_PROGRAM] [--task PrimaryTask] [--write]');
      process.exit(2);
    }
    const buf = fs.readFileSync(smcPath);

    if (!program) {
      let oem = null;
      for (const [nama, e] of unzip(buf)) if (nama.endsWith('.oem')) oem = Buffer.from(await inflate(e)).toString('utf8');
      if (!oem) throw new Error('.oem tidak ketemu - ini bukan project Sysmac');
      const d = daftar(oem);
      console.log('.smc2   : ' + path.basename(smcPath));
      console.log('program : ' + d.programs.length);
      d.tasks.forEach(t => {
        console.log('');
        console.log('task ' + t.name + ' (' + t.programs.length + ' program):');
        t.programs.forEach((n, i) => console.log('  ' + String(i + 1).padStart(2) + '. ' + n));
      });
      if (d.yatim.length) {
        console.log('');
        console.log('TIDAK DITUGASKAN ke task manapun - program ini TIDAK dieksekusi, dan Studio tidak mengeluh:');
        d.yatim.forEach(n => console.log('  ! ' + n));
      }
      return;
    }

    const r = await tugaskan(buf, { program, task });
    console.log('.smc2   : ' + path.basename(smcPath));
    console.log('program : ' + program);
    console.log('task    : ' + task);
    if (r.sudah) { console.log(''); console.log('Sudah ditugaskan. Tidak ada yang perlu diubah.'); return; }
    console.log('');
    r.lapor.forEach(l => console.log('  + ' + l.tempat.padEnd(42) + l.isi));

    if (!write) {
      console.log('');
      console.log('Belum ada yang ditulis. Tambahkan --write kalau sudah cocok.');
      console.log('Tutup Sysmac Studio dulu - project yang sedang dibuka akan menimpa balik.');
      return;
    }

    // Dibongkar ulang dan dibandingkan SEBELUM berkas aslinya disentuh. ZIP rusak baru
    // mengumumkan diri waktu Studio menolak membuka project, dan saat itu berkasnya sudah
    // tertimpa.
    let cek = 0;
    for (const [nama, e] of unzip(r.buf)) {
      const d = Buffer.from(await inflate(e));
      const a = r.entries.find(x => x.name === nama);
      if (!a || !d.equals(a.data)) { console.error('GAGAL: hasil kemasan beda di ' + nama); process.exit(1); }
      cek++;
    }
    if (cek !== r.entries.length) { console.error('GAGAL: entri hilang (' + cek + ' vs ' + r.entries.length + ')'); process.exit(1); }
    console.log('');
    console.log('periksa ulang: ' + cek + ' entri dibongkar balik, isinya sama persis');

    const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    let bak = smcPath + '.' + ts + '.bak', n = 1;
    while (fs.existsSync(bak)) bak = smcPath + '.' + ts + '-' + (++n) + '.bak';
    fs.copyFileSync(smcPath, bak);
    fs.writeFileSync(smcPath, r.buf);
    console.log('cadangan : ' + bak);
    console.log('DITULIS  : ' + program + ' -> ' + task + ' (SequenceNumber ' + r.seq + ')');
    console.log('Buka di Studio, lalu Build.');
  })().catch(e => { console.error('GAGAL: ' + e.message); process.exit(1); });
}
