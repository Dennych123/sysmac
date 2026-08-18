# Yang belum dikerjakan

Diurut dari yang paling berdampak. Tiap butir menyertakan alasannya, supaya bisa
dinilai ulang — bukan sekadar daftar perintah.

Konvensi dan jebakan proyek ada di [CLAUDE.md](CLAUDE.md).

---

## 1. NB-Designer: alarm langsung dari generator

**Format sudah diketahui, tidak perlu reverse engineering.** Project NB-Designer itu folder
biasa berisi `.nbp` (XML polos) dan **`AlarmLib.csv`** — CSV apa adanya. Contoh nyata ada di
`C:\Users\denny\Downloads\Prepare HMI CE INSERTl\`, 494 baris, dan isinya sudah teks
generator ini:

```
Alarm Lib,V103
HMIID,AlarmState,BeepDelay,UseTextLib,TextTagName,TextContent,...,TrigAddrType,TrigAddr,...
0,1,0,0,,AL[3]Air source pressure lost,16,ff0000,0,,0,,0,1,56,400.02,0,0,0,H_bit,...
                └ TextContent                                    └ TrigAddr = word.bit
```

Cuma dua kolom yang berubah per baris: `TextContent` (dari `ARRAY_ELEMENTS`) dan `TrigAddr`
(dari `HMI_CFG.alBase`/`mfBase`, ditulis `word.bit` desimal TANPA awalan `%`). Sisanya
konstan — `TrigAddrType=56` untuk area H, font, warna. Menghasilkan berkas ini mekanis penuh
dan bisa diadu ke project NB yang sudah ada sebagai acuan.

Ini yang menghapus salin-tempel alarm ke NB, dan tidak butuh satu pun putaran ke Studio.

---

## 2. Server MCP — jalan masuk buat AI

Alasan sebenarnya bukan kenyamanan: **tools ini tidak akan pernah 100% benar sekali jadi**,
jadi harus ada tempat untuk fleksibilitas. Yang fleksibel itu INPUT-nya.

**Aturan yang tidak boleh dilanggar: AI tidak pernah menyentuh XML atau ladder.** Ruang
keluarannya dibatasi ke project JSON. Topologi rung, penamaan, alokasi AL/MF, seal logic,
pencocokan LSC tetap milik generator.

Alasannya bukan kehati-hatian umum. AI yang menulis rung langsung menghasilkan ladder yang
**ter-import bersih dan salah waktu jalan** — dan tidak satu pun dari empat gerbang bisa
menangkap itu, karena bentuknya sah semua. Lewat project JSON, apa pun yang dikarang tetap
keluar sebagai rung yang sudah teruji.

**Prasyaratnya sudah ada** — `scripts/core.js` (headless) dan warning terstruktur. Yang
tersisa tinggal pembungkus tipis:

```
list_devices(io)        daftar device per station + nama solenoid yang SAH
get_project()           project JSON sekarang
validate_project(json)  dry-run: warnings terstruktur, TANPA nulis file
generate(json)          XML + GlobalVariables.tsv
```

`list_devices` bukan opsional: tanpa itu LLM mengarang nama solenoid dan yang didapat cuma
warning `unknown_solenoid` — langkahnya hilang diam-diam.

---

## 3. Lingkaran tertutup: project JSON jadi acuan, mesin jadi hasil build

Keluhan yang jadi asalnya: generator cuma kepakai di awal project. Begitu mesin jalan,
perubahan terjadi di Studio, tidak ada yang mencatat apa yang berubah, dan AI tidak punya
tempat masuk.

**Keputusan yang harus diambil sadar dulu: siapa pemilik program setelah mesin jalan.**
Kalau `.smc2` yang jadi acuan, buntu - reader cuma menerjemahkan ~54% rung dengan eksak, jadi
rung hasil edit tangan tidak bisa dibawa balik tanpa kehilangan sebagian. Kalau **project
JSON** yang jadi acuan, semua perubahan lewat situ dan `.smc2` jadi hasil build. Rencana di
bawah menuju yang kedua, bertahap, dan tiap langkah berguna sendiri walau langkah berikutnya
tidak pernah dikerjakan.

### 3a. `smc2_diff` - menjawab "apa yang berubah"

Bandingkan dua `.smc2`, atau `.smc2` vs yang akan digenerate. Keluarannya: variabel
ditambah/dihapus, komen berubah, jumlah rung per section, alokasi AL/MF bergeser.

Tidak menulis apa pun, jadi tidak ada risikonya. Bahannya sudah lengkap: `readProject()`
sudah mengembalikan variabel berikut `elementComments`, dan `core.generate()` menghasilkan
sisi pembandingnya.

### 3b. Git yang diff-nya kebaca

`.smc2` itu ZIP - commit binernya bikin `git diff` tidak menunjukkan apa-apa. Yang di-commit
harus **isi yang diekstrak** (atau dump teks ternormalisasi dari reader), di samping
`.smc2`-nya. Baru kelihatan rung mana yang berubah.

Lalu watcher: tiap save `.smc2` -> ekstrak -> commit dengan pesan hasil `smc2_diff`. Belum
diverifikasi apakah Ctrl+S di Studio memperbarui berkas `.smc2` yang bisa dipantau - buka
Studio, Ctrl+S, lihat apakah timestamp-nya berubah. Kalau tidak, pemicunya "Save As" berkala.

### 3c. MCP (lihat butir 2)

AI menyunting project JSON, empat gerbang memvalidasi, `smc2_diff` menunjukkan akibatnya
sebelum apa pun masuk mesin.

### 3d. Reader mendukung rung blok fungsi (butir 7a)

Sampai cakupannya cukup, `.smc2` tidak bisa dibaca balik utuh. Ini yang paling besar dan
paling akhir - dan yang membuat pilihan "project JSON jadi acuan" berhenti terasa memaksa.

**Aturan yang tidak berubah di seluruh rencana ini:** yang boleh balik masuk ke flowchart cuma
yang bisa diwakili PERSIS. Rung yang tidak terwakili ditandai "berubah di Studio, perlu
ditinjau", bukan diam-diam ditimpa. Git boleh mencatat semua - itu cuma berkas.

---

## 3e. Kumpulan project mesin sebagai sumber kebenaran

Tiap kali sesuatu di repo ini benar, itu karena dibaca dari project yang JALAN DI MESIN,
bukan dari dokumentasi: bentuk pin FUN/FB dari `--probe-fb`, nama array Denso
(`PD071_SET1`, `GTM`), offset lampu +23, edge di kontak clock, 89 medan AlarmLib.csv,
kolom `EC=` di tabel variabel. Yang ditebak, salah - berkali-kali.

Jadi menambah project ke repo ini menambah kemampuannya secara langsung. Yang berguna
dilakukan dengan tiap project baru:

1. `cd reader && node cli.js <project>.smc2 --probe-fb` - bentuk pin instruksi yang belum
   pernah dilihat. Ini yang membuka instruksi baru buat generator.
2. Bandingkan penamaan dan alokasi alarmnya dengan standar di CLAUDE.md. Yang menyimpang:
   entah standarnya yang kurang lengkap, entah project itu yang salah - dua-duanya perlu
   diketahui.
3. Pola rung yang belum didukung generator, ditulis sebagai catatan + tes, bukan diingat.

**Yang membuatnya jadi pengetahuan, bukan tumpukan berkas: hasilnya ditulis ke CLAUDE.md
atau jadi tes.** Project yang cuma disalin ke folder tidak menambah apa-apa - yang menambah
itu aturan yang ditarik darinya. Sesi berikutnya membaca CLAUDE.md, bukan berkas .smc2 satu
per satu.

Project besar jangan di-commit ke repo (ukurannya megabyte dan isinya milik pelanggan);
cukup fixture kecil di `reader/tests/fixtures/` plus catatannya.

---

## 3f. Simulasi terbuka lewat OPC UA - pintunya SUDAH ADA, tidak perlu reverse engineering

Simulator Sysmac Studio bisa membuka **OPC UA server**: menu Simulation -> "Use the OPC UA
Server for the simulator". Terbukti jalan di mesin ini - endpoint `opc.tcp://127.0.0.1:4840`,
address space selesai dibangun. OPC UA itu standar terbuka; kliennya matang dan bebas
(`node-opcua` buat Node, `asyncua` buat Python, jalur ke Gazebo).

Artinya simulasi fisika di luar (Gazebo, atau web sim sendiri) bisa disambungkan dua arah ke
program NX yang sedang disimulasikan, TANPA menyentuh internal Studio sama sekali.

**Sudah terbukti jalan di NX1P2.** Dugaan awal bahwa OPC UA cuma ada di NX102 ke atas
salah, dan sudah dicoret di CLAUDE.md. Tidak perlu mengganti device.

### Sambungannya ke generator: kolom Network Publish

OPC UA hanya menampilkan variabel yang **dipublikasi**. Sekarang kita menulis kebalikannya -
`tsvRow()` di `js/gen_all.js` selalu `"Do not publish"`. Plumbing-nya sudah ada dan belum
terpakai: `gvr()` di `js/lib.js` bisa menulis

```xml
<smcext:GlobalVariableAdditionalProperties networkPublish="PublishOnly" />
```

Jadi tinggal satu setelan (mis. "publikasikan simbol yang punya AT") dan seluruh
tombol/lampu/AL/MF kelihatan dari OPC UA tanpa diklik satu per satu di Studio.

### Urutannya - tiap langkah membuktikan yang berikutnya

1. Publikasikan SATU variabel manual, sambungkan klien apa pun (UaExpert, atau 20 baris
   `node-opcua`). Nilainya kebaca = jalurnya terbukti.
2. Tulis `networkPublish` massal dari generator.
3. Bridge: OPC UA <-> simulasi luar. Mulai dari satu silinder, bukan seluruh mesin.

Kalau ternyata buntu, cadangannya "Start NS Integrated Simulation" - jalur internal ke
simulator HMI, jauh lebih tertutup. Baru di situ reverse engineering masuk akal.

---

## 4. Undo / redo di editor flowchart

**Kenapa penting.** Satu-satunya cara membatalkan kesalahan sekarang adalah
mengulang manual. Menghapus node juga menghapus semua panah yang menempel padanya
— tidak bisa dikembalikan.

**Kenapa belum dikerjakan.** Undo/redo yang setengah jadi lebih berbahaya daripada
tidak ada: kalau ada satu jalur mutasi yang terlewat, undo menghasilkan graph yang
tidak konsisten tanpa tanda apa pun. Harus lengkap atau tidak sama sekali.

**Rancangan yang disepakati.** Satu titik masuk `mutate(fn)` yang menyimpan
snapshot `motionState` + `conditionState` sebelum tiap perubahan, lalu Ctrl+Z /
Ctrl+Shift+Z. **Semua** pemanggil harus lewat situ:

`addMotionNode` `addBlockNode` `addConditionNode` `removeNode` `addEdge`
`removeEdge` `moveNode` `toggleJoin` `setNodeField` `setNodeComment`
`addVariant` `removeVariant` `setVariantCondition` `setVariantComment`
`importSequenceJSON` `importConditionJSON` `importProjectJSON`
plus drag START/END (`variant.startPos` / `endPos`).

Kelengkapan daftar itu bagian yang paling menentukan. Sebaiknya ditutup dengan
tes yang memeriksa tiap fungsi mutasi benar-benar menambah satu entri riwayat.

---

## 5. Panel hasil

**Keadaan sekarang.** Tiap file XML tampil sebagai textarea mentah. Untuk menilai
hasil generate, satu-satunya cara adalah men-scroll XML.

**Yang diusulkan.** Ringkasan per program: jumlah rung per section, daftar bit
yang dipakai, dan tautan lompat ke section. XML tetap bisa dibuka, tapi bukan
lagi tampilan utama.

---

## 6. Node condition yatim hilang saat export

Node bertipe `condition` yang **tidak dirujuk `after` node manapun** lenyap saat
export/import. Penyebabnya desain: node condition tidak disimpan di array `nodes`,
melainkan dibangun ulang dari rujukan `after`, jadi yang menggantung sendirian
tidak punya jejak.

Keterbatasan lama, bukan regresi. Terasa kalau alur kerjanya bolak-balik
export–import (mis. lewat MCP).

---

## 7. Manfaatkan pembaca `.smc2` ([reader/](reader/))

Pembacanya sudah jadi dan sekarang ada di dalam repo ini. Yang belum: memakainya.

1. **Audit standar program vendor.** Vendor kirim `.smc2`, tools laporkan
   penamaan menyimpang, section hilang, alokasi alarm salah. Ini menjawab
   langsung masalah vendor yang jadi alasan utama SS.
2. **Verifikasi hasil generate.** Generate -> import -> baca balik -> bandingkan.
   Ketahuan kalau ada yang mengedit tangan dan menyimpang dari standar.
3. **Tarik IO list dari mesin lama** untuk mesin copy atau retrofit.

### 7a. Ekspor XML: blok fungsi (lanjutan `--xml`)

`reader/cli.js --xml` sudah menulis rung kontak/coil jadi XML yang bisa di-import
Studio, dan itu **~54% rung**. Sisanya rung berblok fungsi — `MOVE`, `TON`,
pembanding (`=`, `<`, `<=`), FB motion — yang untuk sekarang jadi rung komentar.

Elemen `F`/`FB` sudah membawa daftar pinnya sendiri (`In`/`Out`, `__type` `PF`
untuk pin aliran daya dan `PRM` untuk parameter), dan `js/lib.js` sudah punya
contoh bentuk XML-nya di `ton()`. Jadi bahannya lengkap; yang kurang **bukti**.

Bahannya sekarang bertambah: daftar FUN/FB seluruh instruksi ada di
[docs/SYSMAC_INSTRUCTIONS.md](docs/SYSMAC_INSTRUCTIONS.md), dan susunan pin yang
sebenarnya bisa dibaca dari project mesin lewat `node cli.js x.smc2 --probe-fb`.
Yang masih dicari tinggal satu: **bagaimana pin tanpa nama ditulis di XML
import** — pembanding dan `Get**Clk` pin hasilnya memang tidak bernama.
`_Probe_Instructions.xml` ronde 2 menguji itu.

Urutannya harus: ekspor SATU rung TON -> import ke project kosong di Studio ->
lihat apakah bentuknya sama -> baru digeneralkan. Jangan dibalik. Instruksi yang
bentuk XML-nya ditebak akan ter-import tanpa keluhan dan salah waktu jalan, dan
itu jenis kesalahan yang tidak kelihatan sampai mesinnya bergerak.

Yang masih ditolak: **kontak edge di titik gabungan** — `Rung.ct()` cuma menerima satu
sambungan masuk, sementara `ctm()` (banyak sambungan) belum menerima atribut `edge`.

## 8. Panel warning bisa diklik

Warning sudah dikelompokkan per station dan membawa `code` + `device`. Langkah
berikutnya yang murah: klik satu baris warning → gulirkan ke aktuator atau node
yang bersangkutan. Datanya sudah tersedia, tinggal penyambungnya.

---

## Sudah selesai (jangan dikerjakan ulang)

- Pencocokan LSC — dulu `STOPPER-2/3/4` semua tersambung ke sensor `STOPPER-5`
- Blok flowchart: IF/ELSE (hold + mutex), SET/RESET memory, ALARM
- Posisi node dan START/END bertahan lewat export–import
- Ukuran array AL/MF dan slot per station bisa disetel; blok dinomori per station
- Warning terstruktur (`code`, `station`, `device`)
- Editor IO list mode tabel dengan dropdown jenis
- Node-RED dicabut; pipeline jalan langsung dari `js/` lewat `scripts/core.js`
- Penjaga build: karakter kontrol + `node --check`
- Empat gerbang sebelum Studio: `xsd`, `instr`, `rungwire`, `declared` — semuanya ikut
  `node tests/run.js`, semuanya menguji dirinya sendiri
- `index.html` basi ditolak suite (dicek lewat isi, bukan tanggal berkas)
- `build_html.py` membaca js dengan `encoding='utf-8'` — sebelumnya cp1252 merusak `■`
- AT dan Retain ikut di XML import, terbukti di Studio
- Slot cadangan jadi slot utuh: reed switch, LSC, AL, MF, output
- Angin dua alarm (tekanan jatuh + pressure switch rusak); `EMER_INTLK` dari `LB019`
- Alarm + Event NB disinkronkan langsung dari .smc2 (`scripts/nb_sync.js`), AlarmLib.csv digenerate
- Komen elemen ditulis balik ke .smc2 - terbukti dibuka Studio utuh (`scripts/smc2_comment.js`)
- Aplikasi lokal `Susmax.cmd`: yang di CLI tanpa mengetik path maupun mengingat flag
- `docs/SYSMAC_INSTRUCTIONS.md`: 353 instruksi, kolom FUN/FB dan pin, dari manual W560

## Sudah dicoba dan TIDAK bisa (jangan dicoba lagi)

- **Komen per elemen array lewat import XML.** `smcext:ElementComment` ada di XSD dan dipakai
  `Sample.xml`, tapi Studio membuang seluruh `smcext:VariableComment` waktu import. Diuji tujuh
  varian sekaligus; yang menutup perkara kontrolnya — varian yang memakai `VariableComment`
  TANPA `ElementComment` ikut kosong, sementara `<Documentation>` biasa terisi. Jadi bukan
  bentuk `ElementComment`-nya. Komen `AL[n]`/`MF[n]` tetap lewat `ArrayComments.tsv`.
