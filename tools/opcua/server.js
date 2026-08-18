// Penjelajah OPC UA lewat halaman - melihat isi simulator NX tanpa mengetik perintah.
//
//   node tools/opcua/server.js        lalu buka http://127.0.0.1:7655
//
// Satu sesi OPC UA dipegang server ini dan dipakai bersama halaman. Membuat sesi baru tiap klik
// berarti menunggu handshake berkali-kali, dan simulator melihat belasan klien.
//
// TIDAK ada backslash di berkas ini, dan itu disengaja. Berkas di repo ini berkali-kali ditulis
// lewat lapisan yang memakan escape lalu rusak diam-diam - lima kali dalam satu sesi. Baris baru
// dari String.fromCharCode(10), pola angka pakai [0-9].
'use strict';
const http = require('http');
const path = require('path');
const { OPCUAClient, AttributeIds, DataType, MessageSecurityMode, SecurityPolicy } = require('node-opcua-client');
const { OPCUACertificateManager } = require('node-opcua-certificate-manager');

const PORT = +(process.env.UA_UI_PORT || 7655);
const NL = String.fromCharCode(10);
let klien = null, sesi = null, daftar = [];

// Cabang standar OPC UA dilewati, dan ada pagu keras. Tanpa itu telusuran menghabiskan menit di
// node diagnostik yang tidak ada hubungannya dengan program mesin.
const LEWATI = /^(Types|Views|Server|Aliases|Locations|DataTypes|EventTypes|ObjectTypes|ReferenceTypes|VariableTypes)$/;
let dikunjungi = 0;

async function telusuri(node, jalur, dalam) {
  if (dalam > 5 || dikunjungi > 6000) return;
  let hasil;
  try { hasil = await sesi.browse(node); } catch (e) { return; }
  for (const ref of hasil.references || []) {
    if (dikunjungi++ > 6000) return;
    const nama = ref.browseName.name;
    if (LEWATI.test(nama)) continue;
    const j = jalur ? jalur + '.' + nama : nama;
    if (ref.nodeClass === 2) daftar.push({ jalur: j, nama, id: ref.nodeId.toString() });
    else if (ref.nodeClass === 1) await telusuri(ref.nodeId, j, dalam + 1);
  }
}

async function putus() {
  try { if (sesi) await sesi.close(); } catch (e) {}
  try { if (klien) await klien.disconnect(); } catch (e) {}
  sesi = null; klien = null;
}

async function sambung(cfg) {
  await putus();
  // Sertifikat dibuatkan di folder tetap. Dibiarkan implisit, node-opcua berhenti selamanya di
  // "Creating default certificate" - dua kali 150 detik tanpa hasil.
  const cm = new OPCUACertificateManager({
    rootFolder: path.join(__dirname, 'pki'),
    automaticallyAcceptUnknownCertificate: true,
  });
  await cm.initialize();
  const sign = cfg.security === 'sign';
  klien = OPCUAClient.create({
    endpointMustExist: false,
    connectionStrategy: { maxRetry: 1 },
    clientCertificateManager: cm,
    // None itu yang dicentang di Security Settings simulator, dan dengan None tidak ada urusan
    // saling percaya sertifikat. Kalau None dimatikan, sertifikat klien harus dipercaya dulu
    // lewat Certificate management - penolakannya terlihat seperti salah password.
    securityMode: sign ? MessageSecurityMode.Sign : MessageSecurityMode.None,
    securityPolicy: sign ? SecurityPolicy.Basic256Sha256 : SecurityPolicy.None,
  });
  await klien.connect(cfg.endpoint);
  sesi = cfg.user ? await klien.createSession({ userName: cfg.user, password: cfg.pass })
                  : await klien.createSession();
  daftar = []; dikunjungi = 0;
  await telusuri('ObjectsFolder', '', 0);
  return daftar.length;
}

async function nilaiDari(sub) {
  const keluar = [];
  for (const v of sub) {
    let nilai = '?', ok = false;
    try {
      const d = await sesi.read({ nodeId: v.id, attributeId: AttributeIds.Value });
      ok = d.statusCode.isGood();
      nilai = ok ? String(d.value.value) : d.statusCode.name;
    } catch (e) { nilai = 'gagal dibaca'; }
    keluar.push({ jalur: v.jalur, nama: v.nama, nilai, ok });
  }
  return keluar;
}

const HAL = [
  '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>OPC UA - simulator NX</title><style>',
  ' body{font:14px/1.5 system-ui,Segoe UI,sans-serif;max-width:1000px;margin:20px auto;padding:0 16px;color:#111827}',
  ' h1{font-size:19px;margin:0 0 4px} .sub{color:#4b5563;margin:0 0 16px}',
  ' fieldset{border:1px solid #d6dbe3;border-radius:8px;padding:12px 14px;margin:0 0 14px}',
  ' legend{font-weight:600;padding:0 6px}',
  ' input[type=text],input[type=password]{padding:6px 8px;border:1px solid #d6dbe3;border-radius:6px;font:13px ui-monospace,Consolas,monospace}',
  ' input.lebar{width:290px}',
  ' .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}',
  ' button{padding:7px 14px;border-radius:6px;border:1px solid #2563eb;background:#2563eb;color:#fff;cursor:pointer}',
  ' button.ghost{background:#fff;color:#2563eb}',
  ' table{border-collapse:collapse;width:100%;font:13px ui-monospace,Consolas,monospace}',
  ' th,td{border-bottom:1px solid #e6eaf0;padding:4px 8px;text-align:left}',
  ' th{background:#f1f4f8;position:sticky;top:0}',
  ' td.v{color:#15803d} td.bad{color:#b91c1c}',
  ' .wrap{max-height:58vh;overflow:auto;border:1px solid #d6dbe3;border-radius:8px;margin-top:8px}',
  ' .msg{color:#4b5563;font-size:12.5px}',
  '</style></head><body>',
  '<h1>OPC UA - simulator NX</h1>',
  '<p class="sub">Jalankan simulasinya dulu (F5), lalu Simulation &rarr; Use the OPC UA Server for the simulator.</p>',
  '<fieldset><legend>Sambungan</legend>',
  ' <div class="row"><input id="ep" class="lebar" type="text" value="opc.tcp://127.0.0.1:4840">',
  '  <label><input id="anon" type="checkbox" checked> anonim</label>',
  '  <input id="user" type="text" placeholder="user" size="10">',
  '  <input id="pass" type="password" placeholder="sandi" size="10">',
  '  <button onclick="sambung()">Sambung</button><span id="stat" class="msg"></span></div>',
  '</fieldset>',
  '<fieldset><legend>Variabel</legend>',
  ' <div class="row"><input id="f" type="text" class="lebar" placeholder="saring: PB4, AL, GSB, LB4 ...">',
  '  <button class="ghost" onclick="muat()">Tampilkan</button>',
  '  <button class="ghost" onclick="mulaiPantau()">Pantau</button>',
  '  <button class="ghost" onclick="stopPantau()">Berhenti</button>',
  '  <span id="info" class="msg"></span></div>',
  ' <div class="wrap"><table id="t"><tr><th>Nama</th><th>Nilai</th><th></th></tr></table></div>',
  '</fieldset>',
  '<script>',
  'var timer=null;',
  'function el(i){return document.getElementById(i);}',
  'function post(u,b){return fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},',
  '  body:JSON.stringify(b)}).then(function(r){return r.json();});}',
  'function sambung(){',
  ' el("stat").textContent="menyambung...";',
  ' post("/connect",{endpoint:el("ep").value,anon:el("anon").checked,',
  '   user:el("user").value,pass:el("pass").value}).then(function(j){',
  '  el("stat").textContent=j.err?("gagal: "+j.err):(j.n+" variabel ditemukan");',
  '  if(!j.err) muat();',
  ' });',
  '}',
  'function muat(){',
  ' post("/vars",{filter:el("f").value}).then(function(j){',
  '  if(j.err){el("info").textContent=j.err;return;}',
  '  el("info").textContent=j.total+" cocok"+(j.rows.length<j.total?(", tampil "+j.rows.length):"");',
  '  var t=el("t"); t.innerHTML="<tr><th>Nama</th><th>Nilai</th><th></th></tr>";',
  '  j.rows.forEach(function(r){',
  '   var tr=t.insertRow();',
  '   tr.insertCell().textContent=r.nama;',
  '   var c=tr.insertCell(); c.textContent=r.nilai; c.className=r.ok?"v":"bad";',
  '   var b=document.createElement("button"); b.className="ghost"; b.textContent="set";',
  '   b.onclick=function(){ tulis(r.nama); };',
  '   tr.insertCell().appendChild(b);',
  '  });',
  ' });',
  '}',
  'function tulis(nama){',
  ' var v=prompt("nilai baru buat "+nama+"  (true / false / angka)");',
  ' if(v===null) return;',
  ' post("/write",{nama:nama,nilai:v}).then(function(j){',
  '  el("info").textContent=j.err||("ditulis: "+nama+" = "+v); muat();',
  ' });',
  '}',
  'function mulaiPantau(){ stopPantau(); timer=setInterval(muat,700); }',
  'function stopPantau(){ if(timer){ clearInterval(timer); timer=null; } }',
  '</script></body></html>',
].join(NL);

function jsonBody(req, cb) {
  let b = '';
  req.on('data', d => { b += d; if (b.length > 1e6) req.destroy(); });
  req.on('end', () => { try { cb(JSON.parse(b || '{}')); } catch (e) { cb({}); } });
}
function balas(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HAL);
  }
  if (req.method === 'POST' && req.url === '/connect') {
    return jsonBody(req, async (isi) => {
      try {
        const n = await sambung({
          endpoint: isi.endpoint || 'opc.tcp://127.0.0.1:4840',
          user: isi.anon ? null : isi.user, pass: isi.pass, security: isi.security });
        balas(res, { n });
      } catch (e) { balas(res, { err: e.message }); }
    });
  }
  if (req.method === 'POST' && req.url === '/vars') {
    return jsonBody(req, async (isi) => {
      if (!sesi) return balas(res, { err: 'belum tersambung' });
      const f = (isi.filter || '').trim();
      const cocok = f ? daftar.filter(v => v.jalur.indexOf(f) >= 0) : daftar;
      // Dipotong 120: membaca 1176 nilai satu per satu tiap 700 ms membuat halamannya
      // menunggu lebih lama daripada jeda pantauannya sendiri.
      try { balas(res, { total: cocok.length, rows: await nilaiDari(cocok.slice(0, 120)) }); }
      catch (e) { balas(res, { err: e.message }); }
    });
  }
  if (req.method === 'POST' && req.url === '/write') {
    return jsonBody(req, async (isi) => {
      if (!sesi) return balas(res, { err: 'belum tersambung' });
      const v = daftar.find(x => x.nama === isi.nama);
      if (!v) return balas(res, { err: 'tidak ketemu: ' + isi.nama });
      const bool = /^(true|false)$/i.test(isi.nilai);
      try {
        await sesi.write({
          nodeId: v.id, attributeId: AttributeIds.Value,
          value: { value: {
            dataType: bool ? DataType.Boolean : DataType.Double,
            value: bool ? /^true$/i.test(isi.nilai) : Number(isi.nilai) } } });
        balas(res, { ok: true });
      } catch (e) { balas(res, { err: e.message }); }
    });
  }
  res.writeHead(404); res.end('tidak ada');
  // 127.0.0.1 saja: server ini bisa MENULIS ke controller yang sedang disimulasikan.
}).listen(PORT, '127.0.0.1', () => {
  console.log('Penjelajah OPC UA siap di  http://127.0.0.1:' + PORT);
  console.log('Tutup jendela ini kalau sudah selesai.');
});
