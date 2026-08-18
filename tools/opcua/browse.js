// Penjelajah OPC UA buat simulator Sysmac Studio.
//
//   node tools/opcua/browse.js                          daftar variabel yang dipublikasi
//   node tools/opcua/browse.js --filter AL              cuma yang namanya memuat AL
//   node tools/opcua/browse.js --watch AL[1] GSB000     pantau nilainya, berubah -> dicetak
//   node tools/opcua/browse.js --write GSB000=true      tulis satu nilai
//
// Kenapa ini ada: simulator Studio membuka OPC UA server (menu Simulation -> Use the OPC UA
// Server for the simulator), dan OPC UA itu standar terbuka. Jadi program NX yang sedang
// disimulasikan bisa disambungkan ke simulasi fisika di luar tanpa menyentuh apa pun yang
// tertutup di Studio.
//
// Node.js-nya dipasang di tools/opcua/, bukan di akar repo: node_modules 123 paket tidak ada
// urusannya dengan generator, dan generator harus tetap jalan tanpa satu pun dependensi.
'use strict';
const { OPCUAClient, AttributeIds, TimestampsToReturn, DataType } = require('node-opcua-client');

const args = process.argv.slice(2);
function opt(nama) {
  const i = args.indexOf('--' + nama);
  return i < 0 ? null : args.slice(i + 1).filter(a => !a.startsWith('--'));
}
const ENDPOINT = (opt('endpoint') || ['opc.tcp://127.0.0.1:4840'])[0];
const FILTER = (opt('filter') || [null])[0];
const WATCH = opt('watch');
const WRITE = opt('write');

// Address space Sysmac bisa dalam: telusuri sampai dasar, tapi berhenti di kedalaman yang
// masuk akal supaya tidak tersesat di node standar OPC UA (Types, Views, dst).
// Address space server OPC UA memuat ribuan node standar (Types, Views, diagnostik Server).
// Telusuran tanpa batas menghabiskan menit tanpa menghasilkan apa pun yang dicari, jadi:
// mulai dari Objects, lewati cabang standar, dan berhenti di pagu keras.
const LEWATI = /^(Types|Views|Server|Aliases|Locations|DataTypes|EventTypes|ObjectTypes|ReferenceTypes|VariableTypes)$/;
let dikunjungi = 0;
const PAGU = 4000;
async function telusuri(sesi, node, jalur, keluar, dalam) {
  if (dalam > 5 || dikunjungi > PAGU) return;
  let hasil;
  try { hasil = await sesi.browse(node); } catch (e) { return; }
  for (const ref of hasil.references || []) {
    if (dikunjungi++ > PAGU) return;
    const nama = ref.browseName.name;
    if (LEWATI.test(nama)) continue;
    const j = jalur ? jalur + '.' + nama : nama;
    if (ref.nodeClass === 2) keluar.push({ jalur: j, id: ref.nodeId.toString() });
    else if (ref.nodeClass === 1) await telusuri(sesi, ref.nodeId, j, keluar, dalam + 1);
  }
}

(async () => {
  const klien = OPCUAClient.create({ endpointMustExist: false, connectionStrategy: { maxRetry: 1 } });
  try {
    await klien.connect(ENDPOINT);
  } catch (e) {
    console.error('tidak bisa menyambung ke ' + ENDPOINT);
    console.error('  ' + e.message);
    console.error('Pastikan simulator jalan dan OPC UA server-nya dinyalakan:');
    console.error('  Sysmac Studio -> menu Simulation -> Use the OPC UA Server for the simulator');
    process.exit(1);
  }
  const sesi = await klien.createSession();
  console.log('tersambung : ' + ENDPOINT);

  const keluar = [];
  await telusuri(sesi, 'ObjectsFolder', '', keluar, 0);
  if (dikunjungi > PAGU) console.log('(berhenti di pagu ' + PAGU + ' node)');
  // Node standar OPC UA tidak menarik; yang dicari variabel milik project.
  const punyaKita = keluar.filter(v => !/^Root\.(Types|Views)/.test(v.jalur) && !/\.Server\./.test(v.jalur));
  const tampil = FILTER ? punyaKita.filter(v => v.jalur.indexOf(FILTER) >= 0) : punyaKita;

  console.log('variabel   : ' + punyaKita.length + ' ditemukan'
    + (FILTER ? '   (' + tampil.length + ' cocok "' + FILTER + '")' : ''));
  console.log('');

  if (WRITE && WRITE.length) {
    for (const pasangan of WRITE) {
      const [nm, nilai] = pasangan.split('=');
      const v = punyaKita.find(x => x.jalur.endsWith(nm));
      if (!v) { console.log('  tidak ketemu: ' + nm); continue; }
      const bool = /^(true|false)$/i.test(nilai);
      await sesi.write({
        nodeId: v.nodeId || v.id,
        attributeId: AttributeIds.Value,
        value: { value: { dataType: bool ? DataType.Boolean : DataType.Double,
                          value: bool ? /^true$/i.test(nilai) : Number(nilai) } },
      });
      console.log('  ditulis: ' + v.jalur + ' = ' + nilai);
    }
  }

  if (WATCH && WATCH.length) {
    const sub = await sesi.createSubscription2({
      requestedPublishingInterval: 200, requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10, publishingEnabled: true,
    });
    let dipantau = 0;
    for (const nm of WATCH) {
      const v = punyaKita.find(x => x.jalur.endsWith(nm));
      if (!v) { console.log('  tidak ketemu: ' + nm); continue; }
      const item = await sub.monitor({ nodeId: v.id, attributeId: AttributeIds.Value },
        { samplingInterval: 100, queueSize: 10, discardOldest: true }, TimestampsToReturn.Both);
      item.on('changed', d => console.log(new Date().toISOString().slice(11, 19) + '  ' + v.jalur + ' = ' + d.value.value));
      dipantau++;
    }
    console.log('memantau ' + dipantau + ' variabel. Ctrl+C buat berhenti.');
    return;   // sengaja tidak menutup sesi
  }

  // Nilainya ikut dibaca: daftar nama saja tidak membuktikan servernya benar-benar menyajikan
  // data - node bisa ada tapi Read-nya ditolak.
  const potong = tampil.slice(0, 60);
  for (const v of potong) {
    let nilai = '?';
    try {
      const d = await sesi.read({ nodeId: v.id, attributeId: AttributeIds.Value });
      nilai = d.statusCode.isGood() ? String(d.value.value) : d.statusCode.name;
    } catch (e) { nilai = 'gagal dibaca'; }
    console.log('  ' + v.jalur.padEnd(46).slice(0, 46) + ' = ' + nilai);
  }
  if (tampil.length > potong.length) console.log('  ... ' + (tampil.length - potong.length) + ' lagi');

  await sesi.close();
  await klien.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
