// smc2_task.js - menugaskan program ke task langsung di dalam .smc2.
//
// Penjaganya bukan "tidak error". Penugasan yang salah bentuk tetap menghasilkan project yang
// dibuka Studio tanpa keluhan, dengan program yang TIDAK DIEKSEKUSI - satu-satunya gejalanya
// mesin yang diam. Jadi yang diuji: hasil tool ini sama dengan tulisan Studio sendiri.
//
// Caranya GOLDEN, bukan tiruan: project mesin sungguhan diambil, SATU penugasan yang memang
// ditulis Studio dicopot dari keempat tempatnya, lalu dipasang lagi oleh tool ini dan diadu ke
// aslinya. Yang dibandingkan isinya - IniFileTrackingId, SequenceNumber, subtype, DN - bukan
// id/tanggal yang memang baru tiap kali.
//
// Project mesinnya berkas pelanggan, tidak ikut repo: kalau tidak ada, suite ini SKIP dan
// mencetak alasannya. SKIP yang lewat diam-diam sama saja dengan tidak punya tes.
const fs = require('fs');
const path = require('path');
const { tugaskan, daftar } = require(path.join(__dirname, '..', 'scripts', 'smc2_task.js'));
const { unzip, inflate } = require(path.join(__dirname, '..', 'reader', 'src', 'zip.js'));
const { packZip } = require(path.join(__dirname, '..', 'scripts', 'smc2_write.js'));

let fail = 0;
const chk = (l, c, x) => { if (!c) fail++; console.log((c ? '  OK  ' : '>>BAD ') + l + (x ? '   ' + x : '')); };

const KANDIDAT = [
  path.join(__dirname, '..', '..', '..', 'track', 'Ce Insert Track.smc2'),
  path.join(__dirname, '..', '..', '..', 'Ce Insert Track.smc2'),
  path.join(__dirname, '..', 'scratchpad', 'Ce Insert Track.smc2'),
];

async function bacaEntries(buf) {
  const out = [];
  for (const [nama, e] of unzip(buf)) out.push({ name: nama, data: Buffer.from(await inflate(e)) });
  return out;
}

// Atribut satu tag Entity, buat membandingkan isi tanpa ikut membandingkan id/tanggal.
const attr = tag => Object.fromEntries([...tag.matchAll(/(\w+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const asProgTags = s => [...s.matchAll(/<Entity type="NexAssociatedProgram"[^>]*>/g)]
  .map(m => attr(m[0])).map(a => a.name + '|' + (a.subtype || '') + '|' + (a.DN || ''));
const rowsTask = s => [...s.matchAll(/<AssociatedProgramData[^>]*\/>/g)].map(m => m[0].replace(/\s+/g, ' '));

(async () => {
  const smc = KANDIDAT.find(p => fs.existsSync(p));
  if (!smc) {
    console.log('  SKIP  project mesin (Ce Insert Track.smc2) tidak ada di mesin ini - tidak ada penugasan Studio buat diadu');
    console.log('0 GAGAL');
    return;
  }

  const asli = fs.readFileSync(smc);
  const entriesAsli = await bacaEntries(asli);
  const oemAsli = entriesAsli.find(e => e.name.endsWith('.oem'));
  const dir = oemAsli.name.split('/')[0];
  const oemText = oemAsli.data.toString('utf8');

  const d = daftar(oemText);
  chk('project kebaca: ada program dan task', d.programs.length > 0 && d.tasks.length > 0,
      d.programs.length + ' program, ' + d.tasks.length + ' task');
  const task = d.tasks.find(t => t.programs.length);
  if (!task) { console.log('  SKIP  tidak ada task yang punya program - tidak ada yang bisa diadu'); console.log(fail + ' GAGAL'); return; }

  // Program TERAKHIR di daftar task: SequenceNumber-nya paling besar, jadi waktu dipasang ulang
  // tool ini (yang memakai max+1) harus dapat nomor yang sama persis dengan aslinya.
  const nama = task.programs[task.programs.length - 1];

  // --- copot penugasannya dari keempat tempat ---------------------------------------------
  const mAs = new RegExp('<Entity type="NexAssociatedProgram"[^>]*name="' + nama + '"[\\s\\S]*?</Entity>').exec(oemText);
  chk('penugasan asli ketemu di .oem', !!mAs, nama);
  if (!mAs) { console.log(fail + ' GAGAL'); process.exitCode = 1; return; }
  const aidLama = attr(mAs[0]).id;
  const oemTanpa = oemText.slice(0, mAs.index) + oemText.slice(mAs.index + mAs[0].length);

  const fTask = entriesAsli.find(e => e.name === dir + '/' + task.id + '.xml');
  const taskAsli = fTask.data.toString('utf8');
  const barisRow = taskAsli.split(/\r?\n/).filter(l => l.includes('ProgramName="' + nama + '"'));
  chk('baris AssociatedProgramData asli ketemu', barisRow.length === 1, barisRow[0] ? barisRow[0].trim().slice(0, 70) : '-');
  const taskTanpa = taskAsli.split(/\r?\n/).filter(l => !l.includes('ProgramName="' + nama + '"')).join('\r\n');

  const entriesTanpa = entriesAsli
    .filter(e => e.name !== dir + '/' + aidLama + '.xml')
    .map(e => {
      if (e.name === oemAsli.name) return { name: e.name, data: Buffer.from(oemTanpa, 'utf8') };
      if (e.name === fTask.name) return { name: e.name, data: Buffer.from(taskTanpa, 'utf8') };
      return e;
    });
  const bufTanpa = packZip(entriesTanpa);

  const dTanpa = daftar(oemTanpa);
  chk('sesudah dicopot, program itu terdaftar sebagai TIDAK ditugaskan', dTanpa.yatim.includes(nama), nama);

  // --- pasang lagi pakai tool ---------------------------------------------------------------
  const r = await tugaskan(bufTanpa, { program: nama, task: task.name });
  chk('tool melaporkan menulis, bukan "sudah ada"', r.sudah === false, 'lapor: ' + r.lapor.length + ' tempat');

  const hasil = await bacaEntries(r.buf);
  const oemBaru = hasil.find(e => e.name.endsWith('.oem')).data.toString('utf8');
  const taskBaru = hasil.find(e => e.name === fTask.name).data.toString('utf8');

  // 1. .oem: daftar penugasan task itu harus sama isinya dengan aslinya (urutan ikut)
  const blokAsli = oemText.slice(...(() => { const i = oemText.indexOf('<Entity type="NexTask"'); return [i, oemText.length]; })());
  chk('.oem: daftar penugasan sama isinya dengan tulisan Studio',
      JSON.stringify(asProgTags(oemBaru)) === JSON.stringify(asProgTags(oemText)),
      asProgTags(oemBaru).find((x, i) => x !== asProgTags(oemText)[i]) || 'sama');

  // 2. berkas AssociatedProgramModel ada, isinya nama programnya
  const model = hasil.find(e => /<PouInstanceName>/.test(e.data.toString('utf8')) && e.data.toString('utf8').includes('>' + nama + '<'));
  chk('berkas AssociatedProgramModel ditulis', !!model, model ? path.basename(model.name) : 'tidak ada');

  // 3. baris task: SAMA PERSIS dengan yang ditulis Studio - IniFileTrackingId dan SequenceNumber
  //    termasuk. Ini satu-satunya tempat yang menentukan programnya dieksekusi.
  chk('berkas task: baris AssociatedProgramData sama persis dengan aslinya',
      JSON.stringify(rowsTask(taskBaru)) === JSON.stringify(rowsTask(taskAsli)),
      rowsTask(taskBaru).find((x, i) => x !== rowsTask(taskAsli)[i]) || 'sama');

  // 4. tidak ada entri lain yang berubah - yang disentuh cuma .oem, berkas task, OPC UA sim,
  //    plus satu berkas baru. Berkas mesin yang ikut berubah diam-diam itu kelas kegagalan yang
  //    paling mahal di sini.
  const petaTanpa = new Map(entriesTanpa.map(e => [e.name, e.data]));
  const berubah = hasil.filter(e => !petaTanpa.has(e.name) || !petaTanpa.get(e.name).equals(e.data)).map(e => path.basename(e.name));
  const bolehBerubah = new Set([path.basename(oemAsli.name), path.basename(fTask.name)]);
  const liar = berubah.filter(n => !bolehBerubah.has(n) && !hasil.some(e => path.basename(e.name) === n && /AssociatedProgramModel|OpcUa|<Node /.test(e.data.toString('utf8'))));
  chk('tidak ada berkas lain yang ikut berubah', liar.length === 0, liar.join(', ') || (berubah.length + ' berkas disentuh, semuanya memang sasarannya'));

  // --- jalan kedua kalinya = no-op -----------------------------------------------------------
  const r2 = await tugaskan(r.buf, { program: nama, task: task.name });
  chk('dijalankan lagi: menolak mendobel penugasan', r2.sudah === true, 'sudah=' + r2.sudah);

  // --- yang tidak ada ditolak, bukan ditebak -------------------------------------------------
  let tolakProg = null, tolakTask = null;
  try { await tugaskan(bufTanpa, { program: 'PROGRAM_YANG_TIDAK_ADA', task: task.name }); } catch (e) { tolakProg = e.message; }
  try { await tugaskan(bufTanpa, { program: nama, task: 'TaskYangTidakAda' }); } catch (e) { tolakTask = e.message; }
  chk('program yang tidak ada ditolak', !!tolakProg, tolakProg || 'LOLOS - ini yang bahaya');
  chk('task yang tidak ada ditolak', !!tolakTask, tolakTask || 'LOLOS - ini yang bahaya');

  console.log(fail + ' GAGAL');
  if (fail) process.exitCode = 1;
})().catch(e => { console.log('>>BAD exception: ' + e.message); process.exitCode = 1; });
