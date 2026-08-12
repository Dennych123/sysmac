// Bikin project Sysmac TIRUAN buat uji - bukan program mesin pelanggan.
//
// Project asli tidak boleh masuk repo (isinya program mesin orang), jadi tes
// dulu cuma SKIP kalau tidak ada contoh. Tes yang skip tidak menjaga apa pun:
// bug koordinat X/Y di viewer lolos berbulan-bulan lewat celah itu.
//
// Berkas ini menghasilkan .smc2 kecil yang isinya karangan tapi BENTUKNYA persis
// seperti aslinya, jadi tes bisa GAGAL, bukan skip.
//
//   node tests/fixtures/make_fixture.js
//
// Yang sengaja dimasukkan (tiap satu menjaga satu bagian pembaca):
//
//   * ladder JSON Studio >= 1.66 lengkap dengan koordinat X/Y - seri, cabang
//     paralel, pola langkah gerakan, dan mutex yang HARUS ditolak
//   * kotak fungsi dengan pin In/Out bentuk asli (PF = aliran daya, PRM =
//     parameter) - bentuknya diambil dari project sungguhan lewat --probe-fb
//   * ladder DataContract XML Studio <= 1.56 dengan komentar dipakai bersama
//     (z:Id sekali, sisanya z:Ref) - kalau tidak diresolusi komentarnya kosong
//   * section ST
//   * tabel variabel [SLWD ...] dengan alamat fisik, entri STORED (bukan deflate)
//     supaya dua jalur dekompresi sama-sama teruji
//   * JEBAKAN PouBodySourceHolder: id anaknya juga punya .xml tapi isinya
//     CxilVariable. Salah ambil id -> 0 rung, dan itu kelihatan seperti project
//     kosong, bukan seperti bug. Fixture ini bikin salah-ambil jadi tes merah.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SOL = 'SyntheticLine';
const OUT = path.join(__dirname, 'synthetic.smc2');

const MANIFEST = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<Manifest solutionName=\"SyntheticLine\" schemaVersion=\"1.0\" />\n";

const LOG = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<Log version=\"1.66.0\" application=\"Sysmac Studio\" />\n";

const OEM = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<Solution>\n  <Entity type=\"Group\" subtype=\"IecPous\" name=\"POUs\" id=\"g0\">\n    <ChildEntities>\n      <Entity type=\"Group\" subtype=\"IecPrograms\" name=\"Programs\" id=\"g1\">\n        <ChildEntities>\n          <Entity type=\"Program\" subtype=\"MultipartLadder\" name=\"P000_Main\" id=\"p0\">\n            <ChildEntities>\n              <Entity type=\"PouBody\" subtype=\"Ladder\" name=\"Device_Input\" id=\"2222\">\n                <ChildEntities>\n                  <Entity type=\"PouBodySourceHolder\" name=\"source\" id=\"8888\" />\n                </ChildEntities>\n              </Entity>\n              <Entity type=\"PouBody\" subtype=\"Ladder\" name=\"Timers\" id=\"4444\" />\n              <Entity type=\"PouBody\" subtype=\"ST\" name=\"Calc\" id=\"3333\" />\n            </ChildEntities>\n          </Entity>\n          <Entity type=\"Program\" subtype=\"MultipartLadder\" name=\"P011_WIP_Transfer\" id=\"p1\">\n            <ChildEntities>\n              <Entity type=\"PouBody\" subtype=\"Ladder\" name=\"AutoRunning\" id=\"1111\">\n                <ChildEntities>\n                  <Entity type=\"PouBodySourceHolder\" name=\"source\" id=\"9999\" />\n                </ChildEntities>\n              </Entity>\n            </ChildEntities>\n          </Entity>\n        </ChildEntities>\n      </Entity>\n    </ChildEntities>\n  </Entity>\n</Solution>\n";

// Isi berkas .xml milik PouBodySourceHolder - variabel bantu hasil compile,
// BUKAN ladder. Ada di sini justru supaya salah-ambil id ketahuan.
const DECOY = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<ArrayOfCxilVariable>\n  <CxilVariable><Name>_TMP_0001</Name><Type>BOOL</Type></CxilVariable>\n  <CxilVariable><Name>_TMP_0002</Name><Type>WORD</Type></CxilVariable>\n</ArrayOfCxilVariable>\n";

// ------------------------------------------------------- ladder JSON (>= 1.66)
// Satu objek JSON per rung, beruntun tanpa pemisah. X = kolom, Y = baris.
// Baris 0 = jalur utama; baris > 0 = cabang paralel.
const LADDER_JSON = "{\"CMT\":\"Seri sederhana\",\"LRI\":0,\"RRI\":9,\"VLs\":[],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"LB100\",\"X\":0,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"LB101\",\"X\":1,\"Y\":0},\n{\"__type\":\"ST\",\"Var\":\"LB102\",\"X\":2,\"Y\":0}]}\n{\"CMT\":\"Cabang paralel\",\"LRI\":0,\"RRI\":9,\"VLs\":[{\"Ix\":1,\"X\":0}],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"LB110\",\"X\":0,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"LB112\",\"X\":1,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"LB111\",\"X\":0,\"Y\":1},\n{\"__type\":\"ST\",\"Var\":\"LB113\",\"X\":2,\"Y\":0}]}\n{\"CMT\":\"MOTION 1 : Clamp Forward\",\"LRI\":0,\"RRI\":9,\"VLs\":[{\"Ix\":1,\"X\":1}],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"LB200\",\"X\":0,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"LB203\",\"Not\":true,\"X\":1,\"Y\":0},\n{\"__type\":\"ST\",\"Var\":\"LB202\",\"X\":3,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"SOL_CLAMP_FWD\",\"X\":1,\"Y\":1},\n{\"__type\":\"LD\",\"Var\":\"LSC_CLAMP_FWD\",\"X\":2,\"Y\":1},\n{\"__type\":\"ST\",\"Var\":\"LB203\",\"X\":3,\"Y\":1},\n{\"__type\":\"LD\",\"Var\":\"LB203\",\"X\":1,\"Y\":2}]}\n{\"CMT\":\"Bit perantara - langkah 2 tidak menunggu confirm langsung\",\"LRI\":0,\"RRI\":9,\"VLs\":[],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"LB203\",\"X\":0,\"Y\":0},\n{\"__type\":\"ST\",\"Var\":\"LB210\",\"X\":1,\"Y\":0}]}\n{\"CMT\":\"MOTION 2 : Lift Up\",\"LRI\":0,\"RRI\":9,\"VLs\":[{\"Ix\":1,\"X\":1}],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"LB210\",\"X\":0,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"LB213\",\"Not\":true,\"X\":1,\"Y\":0},\n{\"__type\":\"ST\",\"Var\":\"LB212\",\"X\":3,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"SOL_LIFT_UP\",\"X\":1,\"Y\":1},\n{\"__type\":\"LD\",\"Var\":\"LSC_LIFT_UP\",\"X\":2,\"Y\":1},\n{\"__type\":\"ST\",\"Var\":\"LB213\",\"X\":3,\"Y\":1},\n{\"__type\":\"LD\",\"Var\":\"LB213\",\"X\":1,\"Y\":2}]}\n{\"CMT\":\"Mutex varian - dua coil saling mengunci, BUKAN langkah gerakan\",\"LRI\":0,\"RRI\":9,\"VLs\":[],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"LB221\",\"Not\":true,\"X\":0,\"Y\":0},\n{\"__type\":\"ST\",\"Var\":\"LB220\",\"X\":1,\"Y\":0},\n{\"__type\":\"LD\",\"Var\":\"LB220\",\"Not\":true,\"X\":0,\"Y\":1},\n{\"__type\":\"ST\",\"Var\":\"LB221\",\"X\":1,\"Y\":1}]}\n";

// Kotak fungsi. Bentuk pin-nya diambil dari project Sysmac SUNGGUHAN lewat
// --probe-fb, bukan dikarang:
//   In/Out : [{__type, Arg, Var, Type}]
//   __type PF  = pin aliran daya (EN/ENO) - nyambung ke kabel rung, tanpa operand
//   __type PRM = parameter biasa, operandnya di Var
//   EC         = komentar blok
const LADDER_FB = "{\"CMT\":\"Power on delay\",\"LRI\":0,\"RRI\":9,\"VLs\":[],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"GSB000\",\"X\":0,\"Y\":0},\n{\"__type\":\"F\",\"Name\":\"TON\",\"Ix\":2,\"X\":1,\"Y\":0,\"EC\":\"Power on delay\",\n \"In\":[{\"__type\":\"PF\",\"Arg\":\"EN\"},{\"__type\":\"PRM\",\"Arg\":\"PT\",\"Ix\":3,\"Type\":\"TIME\",\"Var\":\"t#30s\"}],\n \"Out\":[{\"__type\":\"PF\",\"Arg\":\"ENO\"},{\"__type\":\"PRM\",\"Arg\":\"ET\",\"Ix\":4,\"Type\":\"TIME\",\"Var\":\"W_ELAPSED\"}]},\n{\"__type\":\"ST\",\"Var\":\"PWR_ON\",\"X\":3,\"Y\":0}]}\n{\"CMT\":\"Salin status error PLC\",\"LRI\":0,\"RRI\":9,\"VLs\":[],\"CLs\":[\n{\"__type\":\"LD\",\"Var\":\"GSB000\",\"X\":0,\"Y\":0},\n{\"__type\":\"F\",\"Name\":\"MOVE\",\"Ix\":5,\"X\":1,\"Y\":0,\n \"In\":[{\"__type\":\"PF\",\"Arg\":\"EN\"},{\"__type\":\"PRM\",\"Arg\":\"In\",\"Ix\":6,\"Type\":\"ANY\",\"Var\":\"WORD#16#0001\"}],\n \"Out\":[{\"__type\":\"PF\",\"Arg\":\"ENO\"},{\"__type\":\"PRM\",\"Arg\":\"Out\",\"Ix\":7,\"Type\":\"ANY\",\"Var\":\"W_COUNT\"}]}]}\n";

// ------------------------------------------------- ladder DataContract (<=1.56)
// Komentar dipakai bersama: kemunculan pertama bawa teks + z:Id, sisanya cuma
// z:Ref. Kalau tidak diresolusi, rung kedua komentarnya kebaca kosong.
const LADDER_XML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<LadderDiagram xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"\n               xmlns:z=\"http://schemas.microsoft.com/2003/10/Serialization/\">\n  <Elements>\n    <DiagramElement i:type=\"Rung\">\n      <Comment z:Id=\"c1\">Master ON confirmation</Comment>\n      <Elements>\n        <DiagramElement i:type=\"LeftPowerRail\" />\n        <DiagramElement i:type=\"Contact\">\n          <Variable>PB013_003</Variable>\n          <NormallyClosed>false</NormallyClosed>\n          <Comment z:Id=\"c2\">PB Master ON</Comment>\n        </DiagramElement>\n        <DiagramElement i:type=\"Contact\">\n          <Variable>MASTER_READY</Variable>\n          <NormallyClosed>true</NormallyClosed>\n        </DiagramElement>\n        <DiagramElement i:type=\"Coil\">\n          <Variable>MASTER_READY</Variable>\n          <Negated>false</Negated><Set>false</Set><Reset>false</Reset>\n        </DiagramElement>\n        <DiagramElement i:type=\"RightPowerRail\" />\n      </Elements>\n    </DiagramElement>\n    <DiagramElement i:type=\"Rung\">\n      <Comment z:Ref=\"c1\" />\n      <Elements>\n        <DiagramElement i:type=\"Contact\">\n          <Variable>P_First_Run</Variable>\n          <NormallyClosed>false</NormallyClosed>\n          <PositiveTransitionSensing>true</PositiveTransitionSensing>\n          <Comment z:Ref=\"c2\" />\n        </DiagramElement>\n        <DiagramElement i:type=\"Coil\">\n          <Variable>LB001</Variable>\n          <Negated>false</Negated><Set>true</Set><Reset>false</Reset>\n        </DiagramElement>\n      </Elements>\n    </DiagramElement>\n  </Elements>\n</LadderDiagram>\n";

const ST = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<data>\n  <StructuredText>\n    <Text>IF LB102 THEN\n  W_COUNT := W_COUNT + 1;\nEND_IF;</Text>\n  </StructuredText>\n</data>\n";

// Tabel variabel global. Baris pakai TAB sebagai pemisah - jangan diganti spasi.
const VARS = '[SLWD version=1.0]\n' + [
  "++D=BOOL\tN=PB013_003\tAT=IOBus://unit#2/Input Bit 03\tG=VAR_GLOBAL\tCom=PB Master ON",
  "++D=BOOL\tN=MASTER_READY\tG=VAR_GLOBAL\tCom=Master ON confirmed",
  "++D=BOOL\tN=SOL_CLAMP_FWD\tAT=IOBus://unit#3/Output Bit 00\tG=VAR_GLOBAL\tCom=Solenoid clamp forward",
  "++D=BOOL\tN=LSC_CLAMP_FWD\tAT=IOBus://unit#2/Input Bit 08\tG=VAR_GLOBAL\tCom=LS clamp forward confirm",
  "++D=BOOL\tN=SOL_LIFT_UP\tAT=IOBus://unit#3/Output Bit 01\tG=VAR_GLOBAL\tCom=Solenoid lift up",
  "++D=BOOL\tN=LSC_LIFT_UP\tAT=IOBus://unit#2/Input Bit 09\tG=VAR_GLOBAL\tCom=LS lift up confirm",
  "++D=WORD\tN=W_COUNT\tG=VAR_GLOBAL\tCom=Cycle counter",
  "++D=BOOL\tN=GSB000\tG=VAR_GLOBAL\tCom=Always ON",
  "++D=BOOL\tN=PWR_ON\tG=VAR_GLOBAL\tCom=Power on delay done",
  "++D=BOOL\tN=LB102\tCom=Local flag, bukan global",
].join('\n') + '\n';

// (nama di dalam zip, isi, dikompres?)
const ENTRIES = [
  [SOL + '/' + SOL + '.manifest', MANIFEST, true],
  [SOL + '/' + SOL + '.log', LOG, true],
  [SOL + '/' + SOL + '.oem', OEM, true],
  [SOL + '/1111.xml', LADDER_JSON, true],
  [SOL + '/2222.xml', LADDER_XML, true],
  [SOL + '/3333.xml', ST, true],
  [SOL + '/4444.xml', LADDER_FB, true],
  [SOL + '/8888.xml', DECOY, true],
  [SOL + '/9999.xml', DECOY, true],
  // STORED, bukan deflate - pembacanya punya dua jalur, dua-duanya diuji.
  [SOL + '/vars.slwd', VARS, false],
];

// --- penulis ZIP kecil -------------------------------------------------------
// Ditulis sendiri (bukan pakai pustaka) supaya proyek ini tetap tanpa dependensi,
// sama seperti pembacanya di src/zip.js.
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return b => {
    let c = -1;
    for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function buildZip(entries) {
  const chunks = [], central = [];
  let offset = 0;
  // Tanggal dipatok (1 Jan 2020) supaya hasilnya sama tiap kali dibuat.
  const DOS_TIME = 0, DOS_DATE = ((2020 - 1980) << 9) | (1 << 5) | 1;

  for (const [name, body, deflate] of entries) {
    const raw = Buffer.from(body, 'utf8');
    const data = deflate ? zlib.deflateRawSync(raw, { level: 9 }) : raw;
    const nm = Buffer.from(name, 'utf8');
    const crc = CRC(raw);

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);                       // versi minimal
    lh.writeUInt16LE(0, 6);                        // flag
    lh.writeUInt16LE(deflate ? 8 : 0, 8);          // metode
    lh.writeUInt16LE(DOS_TIME, 10);
    lh.writeUInt16LE(DOS_DATE, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(data.length, 18);
    lh.writeUInt32LE(raw.length, 22);
    lh.writeUInt16LE(nm.length, 26);
    lh.writeUInt16LE(0, 28);
    chunks.push(lh, nm, data);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);                       // versi pembuat
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(deflate ? 8 : 0, 10);
    ch.writeUInt16LE(DOS_TIME, 12);
    ch.writeUInt16LE(DOS_DATE, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(data.length, 20);
    ch.writeUInt32LE(raw.length, 24);
    ch.writeUInt16LE(nm.length, 28);
    ch.writeUInt32LE(0o644 << 16, 38);             // atribut luar
    ch.writeUInt32LE(offset, 42);
    central.push(ch, nm);

    offset += lh.length + nm.length + data.length;
  }

  const cd = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, cd, eocd]);
}

function build(out) {
  out = out || OUT;
  fs.writeFileSync(out, buildZip(ENTRIES));
  return out;
}

if (require.main === module) {
  const p = build();
  console.log('WROTE ' + p + ' (' + fs.statSync(p).size + ' byte)');
}

module.exports = { build, buildZip, ENTRIES };
