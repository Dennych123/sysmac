# Simulasi mesin: program NX di simulator + viz 3D lewat OPC UA

Cara kerjanya, urutan pengerjaannya, dan daftar jebakannya — supaya mesin berikutnya tidak
dimulai dari nol.

Semuanya di sini **sudah dijalankan**, bukan rancangan: sel robot 4 sumbu di
[`blurobot/`](../blurobot/) (repo sendiri: <https://github.com/Dennych123/rb4axis>) —
kinematik diangkat dari project mesin nyata, dijalankan di simulator NX102, digambar 3D di
browser, dengan sekuens pick-and-place enam stasiun, panel selector/E-STOP/Autorun/cycle
stop, penjaga tabrakan, dan override kecepatan. Tiap baris "jebakan" di bawah ini pernah
memakan waktu — sebagian satu putaran penuh ke Studio.

Baca [`blurobot/CLAUDE.md`](../blurobot/CLAUDE.md) untuk versi khusus mesin itu; dokumen ini
yang **berlaku umum**.

---

## 1. Bentuknya

```
project mesin .smc2 ──(reader/)──▶ algoritma ST verbatim        HANYA BACA
                                   + tabel variabelnya

robot.config.json ──(gen_sim)──▶ blok init ST + tabel variabel + daftar tag
   satu-satunya                    │
   tempat angka                    ├──(gen_xml)──▶ SATU berkas XML import Studio
                                   │
                                   ▼
                    Sysmac Studio ▸ Build ▸ tugaskan ke task ▸ Run simulator
                                   │
                                   ▼  OPC UA  opc.tcp://127.0.0.1:4840
                            bridge.js  (satu sesi, SSE ke halaman, POST buat menulis)
                                   │
                                   ▼
                          halaman three.js: menggambar, bukan memutuskan
```

Empat hal yang menentukan ini tetap benar setelah berbulan-bulan, dan ketiganya soal
**siapa yang memiliki apa**:

| | |
|---|---|
| **PLC memiliki kebenaran** | sekuens, syarat aman, tabrakan, waktu proses — semuanya di ST. Yang dipindah ke halaman berhenti diuji simulator, dan tidak ikut waktu tombol yang sama ditekan dari HMI sungguhan |
| **Halaman cuma menggambar** | dan selalu mengatakan sumbernya: tersambung PLC, atau mode offline (kinematik JS). Mode offline yang tidak ditandai bikin orang menyimpulkan hal yang salah dari gambar yang benar |
| **Satu sesi OPC UA** | dipakai halaman DAN CLI. Alat kedua buat "cek cepat" selalu berakhir jadi jalur yang perilakunya berbeda diam-diam |
| **Satu sumber tiap angka dan tiap daftar** | config → literal ST → tabel Studio → daftar tag, semuanya dibangkitkan. Daftar kedua yang ditulis tangan pasti drift, dan driftnya diam: halaman menulis ke tag yang tidak ada, bridge menjawab OK, tidak ada yang bergerak |

## 2. Yang bisa disalin, yang harus ditulis ulang

| berkas di `blurobot/` | mesin berikutnya |
|---|---|
| `bridge/bridge.js` | **salin apa adanya**. Yang khas mesin cuma `tags.json`, dan itu dibangkitkan |
| `web/robot.js` bagian bridge/SSE/smoothing/panel | **salin**, ganti bagian scene-nya |
| `tools/gen_sim.js` | **salin kerangkanya**: penanda blok DIBANGKITKAN, `--check`, satu daftar global → tiga keluaran |
| `tools/gen_xml.js` | **salin**. Bentuk XML-nya (POU ST, ArrayTypeSpec, GlobalVars, networkPublish) tidak berubah antar mesin |
| `tests/run.js` + pola suite | **salin**. Yang berubah isinya, bukan bentuknya |
| `sim/PRG_SIM_ROBOT.st` | **tulis ulang** — ini mesinnya. Tapi tiru kerangkanya: init → tepi tombol → mode/aman → sekuenser → penjaga → motion → status |
| `sim/robot.config.json` | tulis ulang, pertahankan sifatnya: satu-satunya tempat angka |
| `web/kin.js`, `web/robot.js` bagian scene | tulis ulang sesuai mekanismenya |
| `extract/` | khusus mesin yang punya algoritma untuk diangkat. Kalau tidak ada, lewati |

**Yang paling mahal untuk ditemukan ulang bukan kodenya — daftar jebakan di bawah.**

## 3. Urutan, dan bukti tiap langkahnya

Tiap langkah punya **bukti sendiri**. "Halamannya kebuka" bukan bukti.

| | langkah | dinyatakan berhasil kalau |
|---|---|---|
| M1 | ekstrak algoritma dari `.smc2` (kalau ada) | jalan dua kali → berkas identik; isi ST cocok byte-per-byte dengan yang di ZIP |
| M2 | `sim/` + generator + tabel variabel | suite lulus tanpa Studio; `--check` hijau di klon segar |
| M3 | import ke Studio, Build, tugaskan task, Run simulator | `SIM_HEARTBEAT` **naik** — itu bukti program dieksekusi task, bukan cuma ada di project |
| M4 | bridge | `bridge.js --list` menampilkan tag DAN nilainya masuk akal; `--write` menggerakkan sumbu |
| M5 | viz | tombol di halaman → nilai berubah di `--watch` **dan** gambar ikut bergerak; simulator dimatikan → halaman menandai putus, tidak membeku |

Urutan itu penting: M1–M2 bisa diperiksa penuh **tanpa membuka Studio**, jadi kesalahan
bentuk ketemu sebelum ada yang menunggu satu putaran import.

## 4. Jebakan Sysmac Studio

Semua sudah kena, semua gagalnya menipu.

| | |
|---|---|
| **nama POU diawali `P_`** | Studio menamai ulang jadi `PR_...` **tanpa satu pun pesan**. Sesudah itu penugasan task dan tiap rujukan menunjuk POU yang tidak ada. Aturan sama untuk nama section |
| **array milik instance FB tidak boleh diindeks** | `IK2.ROBOT_POS_OUTPUT[i]` ditolak waktu **Build** (bukan import): *"Cannot use an element of array or a member of structure..."*. Anggota skalar tidak kena. Salin arraynya UTUH ke variabel lokal dulu |
| **`ARRAY[..] OF X` sebagai `<TypeName>`** | LOLOS XSD (TypeName itu `xsd:string` apa saja), ditolak Studio. Yang benar `<InstantlyDefinedType xsi:type="ArrayTypeSpec">` |
| **penugasan task tidak ada di XSD** | tidak bisa lewat XML sama sekali. Tetap langkah tangan, dan program yang tidak ditugaskan **tidak dieksekusi tanpa keluhan** — gejalanya persis sama dengan "tag tidak terbaca" |
| **Constant** | konstanta yang ditempel tanpa kolom Constant bikin Build gagal "cannot assign to constant" begitu init menulisinya |
| **baris judul TSV** | ikut tertempel jadi variabel bernama `Name` bertipe `Data type` |
| **CRLF vs LF** | jalur `.smc2` (tulis ke dalam ZIP) **wajib CRLF**; `<ST>` di dalam XML **LF**, karena pembaca XML menormalkan CRLF→LF (XML 1.0 §2.11). Dua jalur, dua aturan |

Bentuk XML-nya **ditiru dari `Sample.xml` milik Omron**, bukan dikarang:
`C:\Program Files\OMRON\Sysmac Studio\Sample\IEC 61131-10 XML\Controller\`. Validasi dulu
sebelum ke Studio — `pwsh scripts/validate_xml.ps1 <berkas>` menyebut elemen dan barisnya,
Studio cuma bilang `(Import failed)`.

## 5. Jebakan OPC UA

| | |
|---|---|
| **menu OPC UA abu-abu** | simulator belum Run. Bukan soal model controller — NX1P2 maupun NX102 bisa |
| **Security policy `None` belum dicentang** | klien ditolak dengan pesan yang **terlihat seperti salah password** |
| **`networkPublish` jangan dianggap otomatis** | project yang dibuat dari nol bisa tidak memublikasikan satu tag pun. Tulis `PublishOnly` di XML, dan uji bahwa tiap tag yang dicari halaman memang ter-publish |
| **`OPCUACertificateManager` wajib `rootFolder` eksplisit** | dibiarkan implisit, `node-opcua` menggantung selamanya di *"Creating default certificate"* — dua kali 150 detik tanpa hasil. Kelasnya di paket `node-opcua-certificate-manager`, bukan re-export `node-opcua-client` |
| **browse WAJIB `browseNext`** | tanpa continuation point, node hilang diam-diam dan yang tercatat jadi "tag tidak ada" padahal ada. Ini pernah kusalahkan ke Network Publish, dan salah |
| **array lewat JSON jadi `{"0":..}`** | `node-opcua` memberi typed array; `JSON.stringify` menulisnya sebagai objek tanpa `length`, `Array.from` mengembalikan `[]`, geometri jadi NaN — **tanpa satu pun error**, lengannya cuma hilang. Normalkan di sumber DAN toleransi di penerima |
| **kejadian sesaat** | publikasikan sebagai **pencacah**, bukan pulsa: sampling 50 ms tidak akan pernah melihat pulsa satu scan (4 ms). Penerima membandingkan dengan angka terakhir, dan pesan pertama cuma menyelaraskan |
| **`pki/` di-ignore** | isinya private key. Pernah ikut ter-commit sekali |

## 6. Jebakan menulis program simulasinya (ST)

Ini yang paling tidak kelihatan dari kode, dan paling mahal ditemukan ulang.

**Bit "sudah sampai" dihitung di AKHIR scan.** Memerintah dan memeriksanya di scan yang
SAMA berarti membaca jawaban scan sebelumnya — dan sesudah robot berhenti jawabannya TRUE.
Kena sekali di Home: `SIM_HOMED` menyala tanpa lengan bergerak satu milimeter, jadi syarat
"wajib home dulu" hilang tanpa satu pun tanda. Sekuenser tidak kena karena perintah dan
penungguannya di langkah — dan scan — yang berbeda; pertahankan pola itu.

**Perintah yang DITOLAK tidak menggerakkan apa pun — dan bit "sudah sampai" tetap TRUE.**
Sekuenser yang menunggu "sumbu berhenti" saja akan melangkah maju seolah sampai, dan
waypoint yang terlewat biasanya justru yang menjaga keselamatan (approach). Tiap penantian
sesudah permintaan gerak harus menuntut DUA hal: sumbu berhenti DAN perintahnya diterima.

**Gerbang syarat ditunggu SEBELUM perintahnya diminta, bukan sesudahnya.** Menunggu
sesudah berarti perintah dikirim ke keadaan yang belum siap, ditolak dengan benar, dan
penolakan itu tidak kelihatan sebagai apa pun — kombinasi dengan jebakan di atas
menghasilkan langkah yang dilewati tanpa satu pun keluhan.

**Benda yang bergerak (penutup, pintu, klem) butuh DUA arah penjagaan.** Satu: dia jadi
badan tabrakan — tapi biasanya hanya di sebagian keadaannya (penutup yang terbuka penuh
tidak menghalangi apa pun; menganggapnya selalu menghalangi bikin robot tidak pernah bisa
masuk). Dua: interlock supaya dia tidak bergerak selama ada bagian robot di ruang
sapuannya, dan berbalik kalau ada yang masuk di tengah jalan. Ruang itu dihitung dari
posisi robot SEKARANG, bukan ditebak dari nomor langkah — jog dan gerakan tangan tidak
punya nomor langkah.

**Berhenti karena sentuhan/tabrakan cuma di TEPI-nya.** Menahan selama masih menempel bikin
perintah ditimpa posisi tiap scan: benda terkunci di dalam yang ditabraknya, tanpa arah
keluar.

**Penjaga ditulis SEKALI, dipakai dua arah.** Satu loop memeriksa titik pose yang DIMINTA
(ditolak sebelum bergerak) dan titik pose SEKARANG (deteksi sentuhan). Rumus yang sama
ditulis dua kali pasti berbeda pendapat suatu hari.

**Kotak/geometri penjaga = kotak yang DIGAMBAR.** Ukuran kedua untuk penjaga bikin alat
berhenti di udara atau menembus benda yang kelihatan — dua-duanya terbaca sebagai bug yang
lain.

**Urutan pencarian pekerjaan ITU logika selnya.** Di sel ICC/DW: isi buffer dulu →
kosongkan yang selesai ke luar → pindahkan yang selesai ke mesin berikutnya. Ditukar, empat
mesin penuh saling mengunci — dan macetnya cuma terlihat sebagai robot yang diam, bukan
sebagai kesalahan.

**Tiap mesin menghitung waktunya sendiri.** Satu penghitung bersama memaksa satu produk di
seluruh sel; buffer jadi tidak ada artinya sementara kodenya tetap kelihatan benar.

**Syarat aman ditegakkan di PLC, halaman cuma mengirim TEPI tombol.** Halaman yang menulis
"sedang jalan" langsung berarti syarat (sudah home, selector di AUTO, tidak emergency)
ditegakkan di browser — tempat yang tidak dijalankan simulator.

**Jepitan/pemegang berhenti di UKURAN BENDA, bukan di nol.** Jari yang bertemu di nol
menembus barang yang sedang dipegangnya, dan di layar itu cuma terlihat seperti jepitan
yang rapat.

**Yang sedang dipegang bertahan lewat semua berhenti**, berikut ingatan pekerjaannya —
kalau tidak, tiap pemulihan menjatuhkan barang, dan pekerjaan yang hilang bikin langkah
berikutnya mengantar barang yang tidak ada.

**Angka override/setelan dijepit DI PLC.** Tag bisa ditulis dari mana saja; 500 % yang lolos
bikin sumbu melompati targetnya tiap scan, dan di layar itu terlihat seperti kedipan, bukan
seperti setelan yang salah.

**Gerakan pakai profil trapesium.** Berangkat dan berhenti pada kecepatan penuh dalam satu
scan terlihat patah-patah begitu angkanya lewat jaringan — dan yang ditanyakan orang jadi
soal jaringan, padahal sebabnya profil gerakan.

**Blok init dibangkitkan, dibatasi penanda.** `// <<< DIBANGKITKAN ... // >>> DIBANGKITKAN`,
sisanya tulis tangan. Plus `--check` yang menolak kalau yang ter-commit sudah basi.

## 7. Jebakan viz 3D

| | |
|---|---|
| **gambar dari fungsi yang sama dengan yang dihitung** | rantai/posisi digambar dari fungsi kinematik yang dipakai PLC (port JS-nya), bukan rumus kedua di halaman. Rumus kedua bebas melenceng sambil tetap menggambar benda yang tampak wajar — dan tidak ada yang mengeluh |
| **skala benda dibagi UKURAN GEOMETRINYA sendiri** | menganggapnya 1 itu aturan tak tertulis yang harus diingat di tiap `new BoxGeometry`. Sekali urutan argumen tertukar, ruas tergambar 46× lebih panjang — dan tidak ada satu pun angka di panel yang berubah, karena kinematiknya memang benar |
| **pemetaan sumbu di SATU fungsi** | PLC (x,y,z) → three (x,z,y). Ketukar: benda rebah, rel berdiri — gambar yang tetap "masuk akal" sampai angkanya dibandingkan |
| **pose stasiun dibaca dari tag PLC** | bukan dari config. Kalau keduanya beda, salahnya kelihatan sebagai alat yang turun di sebelah mesin, bukan tersembunyi di balik dua angka yang masing-masing benar |
| **kotak bayangan meliputi seluruh sel** | mesin di ujung kehilangan bayangan dan terbaca seperti melayang |
| **label digambar ulang cuma kalau teksnya berubah** | tiap frame = tekstur baru tiap frame |
| **benda dibuat SEKALI lalu diskalakan** | membangun ulang mesh tiap kali pose berubah bikin pengumpul sampah bekerja terus |

## 7b. Panel yang MENJELASKAN — kalau simulasinya buat ditunjukkan ke orang

Kalau viz-nya dipakai menjelaskan (demo, wawancara, melatih operator), panel penjelas
jauh lebih berharga daripada gambar yang bagus. Satu aturan yang menentukan panel itu
berguna atau berbahaya:

**Panel penjelas TIDAK BOLEH menghitung apa pun sendiri.** Fungsi kinematiknya dipecah
supaya nilai antaranya ikut keluar (`fkSteps`, `ikSteps` di blurobot), dan fungsi yang
dipakai menggambar MEMANGGIL fungsi yang sama. Panel yang menghitung sendiri adalah cara
paling halus untuk berbohong: gambarnya benar, angkanya benar, penjelasannya salah — dan
yang membacanya justru orang yang belum bisa menilai mana yang benar. Dijaga dua tes:
hasil kedua jalur diadu bit per bit, dan halaman ditolak kalau memuat `acos/atan/asin`
sama sekali.

Yang terbukti layak ditampilkan, dan kenapa:

| | |
|---|---|
| **koordinat NOL tiap kerangka** | world, tiap sumbu, tool. "Zero" berhenti jadi kata dan jadi titik yang kelihatan di 3D (triad merah/hijau/biru) |
| **tiap suku rumus, terpisah** | `L2·cos a1`, `L3·cos a2`, `L4·cos a3` masing-masing — itu yang bikin rumus berhenti terlihat seperti mantra |
| **langkah IK apa adanya, dengan NAMA YANG SAMA dengan di ST** | `Y3`, `Z3`, `R`, `BETA`, `GAMMA`, `ALFA` — panel dan berkas ST bisa dibaca berdampingan tanpa menerjemahkan |
| **vonis, bukan cuma angka** | "di luar jangkauan", "lolos tapi menembus soft limit", "elbow down, di dalam batas" |
| **di mana GAGALNYA** | pose yang ditolak sebelum ACOS tetap mengembalikan `R` — panel bisa menunjukkan sebabnya, bukan cuma bahwa gagal |
| **round-trip FK(IK(x)) − x** | memperlihatkan lantai galat konstanta (~5e-6 derajat). Angka yang jujur lebih meyakinkan daripada nol yang dikarang |
| **geometrinya di 3D** | segitiga L2–L3–R digambar di tempatnya. Rumus cosinus jadi masuk akal begitu segitiganya kelihatan |
| **kalimatnya sependek mungkin** | sasarannya orang yang baru kenal trigonometri, bukan yang sudah tahu. "cos itu bagian menyamping, sin bagian ke atas" mengajarkan lebih banyak daripada satu paragraf yang benar tapi padat. Paragraf panjang di panel = tidak dibaca sama sekali |

Dan aturan panel yang lain tetap berlaku: bentuknya dibangun sekali, teksnya saja yang
diganti, throttle ~8 Hz.

## 8. Jebakan kehalusan dan panel

**Ramalkan dari KECEPATAN yang dipublikasikan PLC, jangan mengejar posisi.** Kabar datang
tiap ~50 ms, layar menggambar tiap ~16 ms. Yang mengejar posisi terakhir selalu tertinggal,
dan makin cepat gerakannya makin jauh tertinggal — itu yang terbaca sebagai "laggy".
**Batasi ramalannya** (~120 ms): tanpa batas, kabar yang berhenti datang bikin benda terbang
menjauh, dan itu terlihat seperti mesin yang kabur alih-alih sambungan yang putus.

**Panel jangan digambar dari tiap pesan.** ~20 pesan/detik × puluhan elemen `innerHTML` yang
disusun ulang = layout ulang di tengah frame, dan yang tersendat justru animasi 3D-nya.
Bangun bentuknya sekali, ganti teksnya saja, throttle ~8 Hz.

**Yang dihaluskan cuma GAMBAR.** Panel menampilkan angka PLC apa adanya — itu satu-satunya
tempat membandingkan layar dengan simulator.

**Pixel ratio dibatasi ~1.5.** Di layar 4K, 2 berarti empat kali lipat piksel yang dibayangi
tiap frame, dan kehalusan gerakan lebih berharga daripada tepi yang sedikit lebih tajam.

**Warna teks punya PASANGAN terang/gelap.** Abu-abu yang enak dilihat di layar terang jadi
3:1 di mode gelap, tepat di teks kecil yang paling perlu dibaca.

**Keterangan panjang dilipat di balik ringkasan.** Alasan tiap keputusan tetap ada — dihapus,
orang berikutnya mengubahnya jadi salah lagi — tapi tidak memenuhi panel yang dipakai
menjalankan mesin.

## 9. Pola tes yang terbukti

* **Suite terpisah** dari gerbang XML repo ini. Simulasi tidak ada urusannya dengan empat
  gerbang generator, dan suite simulasi harus boleh SKIP waktu project mesinnya tidak ada.
* **SKIP selalu bersuara.** SKIP yang diam tidak bisa dibedakan dari lulus.
* **`--check` byte-per-byte** untuk tiap berkas yang dibangkitkan. Berkas basi tetap sah,
  tetap lolos XSD, cuma isinya project yang sudah tidak ada.
* **Gambar diadu ke perhitungan**: titik ujung yang digambar vs keluaran FK.
* **Pose yang dipakai sekuenser diadu ke IK**: stasiun yang tidak terjangkau baru ketahuan
  sebagai robot yang diam di langkah 11, tanpa galat — karena IK memang menolak dengan benar.
* **Kalau ada dua versi algoritma** (verbatim dari mesin vs yang dibetulkan): tiap cacat
  punya DUA tes — satu menuntut perilaku lama, satu menuntut yang baru — plus satu yang
  membuktikan keduanya beda di pose yang sama.
* **Nama yang disebut ST diadu ke tabel variabel yang ikut ditempel.** Satu huruf salah
  ketik = satu putaran penuh ke Studio.
* **Kalau tes gagal, periksa dulu apakah TESNYA yang salah.** Beberapa "kegagalan" ternyata
  ekspektasi tes yang keliru, bukan cacat produk.

## 10. Kalau harus bertanya ke Studio: bikin probe yang menjawab

Empat aturan, semuanya pernah dilanggar, tiap pelanggaran memakan satu putaran:

1. **Semua tebakan dalam SATU berkas**, tiap tebakan pada objek bernama sendiri
   (`PV2_TANPADOC`, bukan "varian 2") — namanya kebaca di Studio tanpa membuka berkasnya.
2. **Tiap varian beda SATU hal saja** dari tetangganya. Dua perbedaan = jawaban yang tidak
   bisa dibaca.
3. **Sertakan kontrol yang PASTI jalan.** Kalau kontrolnya ikut gagal, berkasnya yang tidak
   ter-import dan hasil lainnya tidak berarti apa-apa.
4. **Objeknya harus DIPAKAI.** Variabel global yang tidak dirujuk bisa hilang waktu import —
   probe-nya masuk, tabelnya kosong, dan yang tercatat jadi "bentuknya ditolak" padahal
   objeknya tidak pernah ada.

## 11. Mulai mesin berikutnya

```bash
git clone https://github.com/Dennych123/rb4axis   sim-mesinB
cd sim-mesinB
rm -rf extract                     # kalau tidak mengangkat algoritma dari project lain
# tulis ulang: sim/robot.config.json, sim/PRG_SIM_*.st, web/kin.js, bagian scene web/robot.js
node tools/gen_sim.js && node tools/gen_xml.js && node tests/run.js
cd bridge && npm install && cd ..
node bridge/bridge.js
```

Yang **tidak** perlu disentuh: `bridge/bridge.js`, kerangka `tools/gen_xml.js`, pola
`tests/run.js`, bagian SSE/penghalusan/panel di `web/robot.js`.

Urutan di Studio (satu-satunya bagian yang tidak bisa diotomatiskan):
import XML → **Build** → **tugaskan program ke task** → Run simulator (F5) →
Simulation ▸ Use the OPC UA Server for the simulator → Security policy `None` →
Transfer to simulator.

## 12. Batasnya — supaya tidak dikira lebih dari yang ada

* **Mode offline bukan bukti.** Yang diuji cuma port JS-nya, bukan program di PLC.
* **Motion model bukan dinamika.** Trapesium kecepatan/akselerasi; tanpa massa, inersia,
  jerk, atau kepatuhan mekanis.
* **Benda yang bergerak tapi tidak ada di penjaga tabrakan** (penutup mesin, pintu,
  konveyor) dijaga oleh URUTAN LANGKAH, bukan geometri: robot cuma turun sesudah
  penutupnya terbuka penuh. Itu keputusan sadar — menambahkannya ke penjaga berarti
  penjaga harus tahu bentuk yang berubah tiap scan.
* **Proses baru boleh menghitung waktu setelah kondisi fisiknya tercapai** (penutup
  rapat, klem menekan). Menghitung lebih awal berarti mesin mengaku menguji barang yang
  belum tersentuh probe — dan tetap melaporkan lulus.
* **Tabrakan yang diperiksa cuma titik yang dipilih** (di blurobot: TCP + pangkal gripper vs
  kotak mesin dan lantai). Siku, ruas lengan, dan benda yang dipegang tidak ikut. Ini penjaga
  terhadap perintah yang salah, bukan mesin fisika.
* **Benda kerja itu penanda, bukan benda fisik.** Tidak ada gaya jepit, tidak ada jatuh
  karena selip.
* **Mesin di sel tidak mensimulasikan apa pun** selain penundaan — tidak ada hasil tes,
  tidak ada yang bisa GAGAL.
* **Rung ladder tetap TIDAK boleh ditulis dari tebakan.** Yang dipakai di jalur ini ST,
  bukan ladder hasil terjemahan — lihat aturan reader di [`../CLAUDE.md`](../CLAUDE.md).
* **Penugasan task tetap manual.** Tidak ada di XSD, dan program yang tidak ditugaskan diam
  tanpa keluhan.
