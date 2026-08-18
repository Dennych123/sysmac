# Yang belum dikerjakan

## BESOK (19 Agustus 2026) - dua hal, urutannya begini

**1. MCP dipakai sungguhan.** Servernya sudah terdaftar di scope user dan `✓ Connected`:

```bash
claude mcp add-json susmax -s user '{"command":"node","args":["<repo>/scripts/mcp.js"],"env":{"SUSMAX_WS":"<folder project>"}}'
```

Yang belum pernah dijalankan: alur nyata dari terminal. Cobanya begini, dan yang dicari bukan
"jawabannya bagus" tapi apakah alatnya dipilih dengan benar - `track_smc2` SEBELUM mengubah,
`validate_project` sebelum `generate`, `restore_smc2` waktu hasilnya salah. Kalau modelnya
melewatkan track dulu, deskripsi alatnya yang perlu diperbaiki, bukan orangnya yang diminta
mengingat.

Yang masih kurang di sisi alat: **menyunting project JSON per bagian** (mis. `add_motion_step`).
Sekarang AI harus mengirim project JSON UTUH - satu salah ketik di bagian yang tidak disentuh
ikut terkirim.

**2. Simulator ke simulasi fisika (butir 3f).** Pintunya sudah terbukti terbuka: simulator Sysmac
membuka OPC UA di `opc.tcp://127.0.0.1:4840`, variabel global ter-publish otomatis
(`GlobalVars.<nama>`), dan `tools/opcua/browse.js` sudah bisa baca/tulis/pantau.

Mulai dari SATU silinder, bukan seluruh mesin:

```
sim fisika  --(sensor)-->  tulis AS_*        di NX yang sedang disimulasikan
sim fisika  <--(aktuator)- baca SOL_*        -> gerakkan silindernya di sim
```

Kalau satu silinder sudah bergerak dua arah dengan reed switch yang benar, sisanya cuma
pengulangan. Jangan mulai dengan seluruh station: yang gagal di sana tidak bisa dibedakan antara
salah alamat, salah arah, atau fisika sim-nya sendiri.

Sebelum mulai: jalankan simulasinya DULU (menu OPC UA abu-abu selama simulator belum Run), dan
centang `None` di Security policy lalu Transfer to simulator.

---


Diurut dari yang paling berdampak. Tiap butir menyertakan alasannya, supaya bisa
dinilai ulang — bukan sekadar daftar perintah.

Konvensi dan jebakan proyek ada di [CLAUDE.md](CLAUDE.md).

---

## 1. NB-Designer: alarm langsung dari generator - SUDAH

`node scripts/nb_apply.js <project.json|AlarmLib.csv> <folder NB> [--write]` menyiapkan
`AlarmLib-generated.csv` (89 medan per baris, koma di teks dikutip, BOM UTF-8) buat tombol
Import di dialog Alarm Setting. `node scripts/nb_sync.js <x.smc2> <folder NB> [--write]` menulis
komen alarm langsung ke `.nbp`. Dua-duanya tidak menulis apa pun tanpa `--write` dan selalu
mencadangkan yang lama.

Yang perlu diingat dan sudah salah sekali: **alarm NB tidak dibaca dari berkas di folder
project**; masuknya lewat tombol Import. Menyalin berkas ke folder tidak mengubah apa pun. Detail
bentuk medannya ada di CLAUDE.md bagian "Alarm NB-Designer".

---


## 2. Server MCP - SUDAH, dan batasnya sudah dicabut

`node scripts/mcp.js --ws <folder kerja>`, JSON-RPC 2.0 di atas stdio, tanpa dependensi.
**13 alat**: generator (`list_devices`, `get_project`, `validate_project`, `generate`), berkas
(`list_files`, `find_files`, `read_file`, `write_file`), project (`read_smc2`, `diff_smc2`), dan
riwayat (`track_smc2`, `history`, `restore_smc2`).

Aturan lama "AI tidak boleh menyentuh XML" **dicabut** atas permintaan pemilik repo. AI boleh
membaca dan menulis berkas apa pun di dalam folder kerja. Yang menggantikan larangan itu jaring
pengaman: catat dulu (`track_smc2`), ubah, validasi, dan kalau salah kembalikan persis byte-nya
(`restore_smc2`). Semua tulis dicadangkan ke `.bak` bertanggal.

Alat berkas/smc2/git DISALURKAN ke `scripts/api.js` - modul yang sama dengan yang dipakai halaman
`/edit`. Dua jalur dengan logika sendiri-sendiri pasti berbeda perilaku, dan yang berbeda
diam-diam itu yang paling mahal.

Yang belum: alat MENYUNTING project JSON per bagian (mis. `add_motion_step`) - sekarang AI
mengirim project JSON utuh.

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

### 3a. `smc2_diff` - SUDAH ADA

`node scripts/smc2_diff.js LAMA.smc2 BARU.smc2` (juga `cd reader && node cli.js A --diff B`,
dan tombol "Bandingkan" di aplikasi lokal). Melaporkan program/section ditambah-dihapus, rung
per section, variabel ditambah-dihapus-berubah (tipe, AT, grup, komen), komen elemen AL/MF, dan
alarm yang PINDAH NOMOR. Hanya baca. Suite `reader/tests/diff.test.js`.

Yang belum: sisi `.smc2` **vs yang akan digenerate**. Bahannya ada - `core.generate()`
menghasilkan XML + TSV, tinggal dibaca jadi bentuk yang sama dengan `readProject()`. Itu yang
membuat "apa yang berubah di Studio sejak generate terakhir" bisa dijawab tanpa menyimpan
salinan `.smc2` kemarin.

### 3b. Git yang diff-nya kebaca - SEBAGIAN SUDAH

`node scripts/smc2_extract.js x.smc2 history/ --clean` membongkar `.smc2` jadi teks deterministik
(satu berkas per section, variabel dan komen alarm terurut, koordinat tidak ikut). Commit folder
itu di samping `.smc2`-nya dan `git diff` menunjukkan rung mana yang berubah.
`tests/smc2extract.test.js` menjaga sifat yang paling menentukan: jalan dua kali harus
menghasilkan berkas yang sama persis - kalau tidak, riwayatnya penuh diff palsu dan berhenti
dibaca.

Yang belum: **watcher**. Tiap `.smc2` disimpan -> ekstrak -> commit dengan pesan hasil
`smc2_diff --brief`. Dan yang harus diperiksa dulu di mesin: apakah Ctrl+S di Studio memang
memperbarui berkas `.smc2` yang bisa dipantau (buka Studio, Ctrl+S, lihat timestamp-nya). Kalau
tidak, pemicunya "Save As" berkala.


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

**Sudah terbukti jalan di NX1P2.** Menunya abu-abu selama simulasi belum di-Run - itu sebabnya,
bukan modelnya. Dugaan awal soal NX102 salah dan sudah dicoret di CLAUDE.md.

### Kolom Network Publish - TERNYATA TIDAK PERLU

Dugaan awal: OPC UA cuma menampilkan variabel yang dipublikasi, jadi generator harus menulis
`networkPublish`. **Salah** - di simulator, variabel global ter-publish OTOMATIS dengan path
`GlobalVars.<nama>`; sudah dibuktikan di mesin ini (lihat CLAUDE.md). Jadi butir ini dicoret,
dan `tsvRow()` boleh tetap `"Do not publish"`.

Yang masih terbuka: apakah controller SUNGGUHAN (bukan simulator) juga begitu. Kalau tidak,
`gvr()` di `js/lib.js` sudah bisa menulis `<smcext:GlobalVariableAdditionalProperties
networkPublish="PublishOnly" />` - tinggal satu setelan, bukan pekerjaan baru.

### Urutannya - tiap langkah membuktikan yang berikutnya

1. Publikasikan SATU variabel manual, sambungkan klien apa pun (UaExpert, atau 20 baris
   `node-opcua`). Nilainya kebaca = jalurnya terbukti.
2. Tulis `networkPublish` massal dari generator.
3. Bridge: OPC UA <-> simulasi luar. Mulai dari satu silinder, bukan seluruh mesin.

Kalau ternyata buntu, cadangannya "Start NS Integrated Simulation" - jalur internal ke
simulator HMI, jauh lebih tertutup. Baru di situ reverse engineering masuk akal.

---

## 4. Undo / redo di editor flowchart - SUDAH

Ctrl+Z / Ctrl+Shift+Z (dan Ctrl+Y), plus tombol Undo/Redo di kepala panel Motion sequence.

**Rancangannya diganti dari yang tertulis dulu, dan itu yang bikin bisa selesai.** Rencana lama
menuntut SEMUA pemanggil lewat satu `mutate(fn)` - dan kelengkapan daftar itu bagian yang paling
gampang gagal diam-diam. Yang dipakai sekarang: `checkpoint()` menyimpan SNAPSHOT seluruh state
(motion, condition, nama station, override aktuator, counter) dan membandingkannya dengan yang
terakhir dicatat. Kalau sama, tidak mencatat apa-apa.

Akibatnya titik pemanggilan tidak perlu lengkap: panggilan berlebih jadi no-op, dan panggilan
yang TERLEWAT cuma menggabungkan dua perubahan jadi satu langkah undo - tidak pernah menghasilkan
state yang tidak konsisten. Satu panggilan di `regenerate()` sudah menutup hampir semua jalur,
karena tiap perubahan yang sampai ke layar lewat situ.

Satu jebakan yang sudah kena dan dijaga tesnya: `histApply()` memanggil `regenerate()`, yang
memanggil `checkpoint()` - tanpa penjaga `histRestoring`, undo mencatat dirinya sendiri sebagai
langkah baru dan riwayatnya tumbuh tiap kali di-undo (Ctrl+Z tidak pernah sampai ke awal).
Ketahuan sebagai tes yang menggantung, bukan sebagai tes merah.

`tests/undo.test.js` menjaga: langkah kosong tidak dicatat, undo/redo memulihkan state DAN
menggambar ulang, perubahan baru membuang jalur redo, Condition ikut dipulihkan, dan riwayatnya
dibatasi.


## 5. Panel hasil - SEBAGIAN SUDAH

Ringkasan per program sudah ada di paling atas hasil: program, section, jumlah rung per section,
dan section kosong ditandai. Dihitung dari XML yang BARU ditulis, bukan dari hitungan terpisah -
dua sumber angka untuk hal yang sama selalu berakhir beda. Dijaga `tests/overview.test.js`, yang
mengadu angkanya ke XML sungguhan hasil `scripts/core.js`.

Yang belum: **daftar bit yang dipakai per section**, dan **tautan lompat ke section** di dalam
XML. Yang kedua butuh XML-nya ditampilkan bukan sebagai textarea mentah.

---

## 6. Node condition yatim hilang saat export - SUDAH

Node `condition` yang tidak dirujuk `after` node manapun sekarang ikut selamat, berikut komentar
dan posisinya. Tidak perlu medan JSON baru: `conditionPositions`/`conditionComments` sudah ditulis
buat SEMUA node condition waktu export, termasuk yang yatim - yang kurang cuma pembacaannya waktu
import. Dijaga `tests/editor.test.js` bagian 3b, dan sudah dibuktikan tesnya memang menangkap:
dijalankan ke versi TANPA perbaikan, node yatimnya hilang.

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

## 8. Panel warning bisa diklik - SUDAH

Klik satu baris warning melompat ke aktuatornya (baris Confirm Mode) atau ke kotak station di
panel Motion, membuka `<details>` yang menutupinya, lalu menyorotnya sesaat. Pencocokannya lewat
penanda `data-dev`/`data-st`, bukan lewat teks yang tampil - teks judul ikut nama station yang
diketik orang. `tests/warnjump.test.js` menjaganya, termasuk kasus yang paling gampang salah:
warning tingkat station TIDAK boleh mendarat di aktuator pertama milik station itu.

Yang belum: lompat ke NODE motion yang bersangkutan (bukan cuma kotak stationnya).

---

## Sudah selesai (jangan dikerjakan ulang)

- `smc2_diff`: bandingkan dua `.smc2`, memisahkan perubahan logika / tata letak / alamat, dan
  menandai alarm yang pindah nomor (butir 3a)
- `smc2_extract`: `.smc2` jadi teks deterministik yang bisa di-commit, `git diff`-nya kebaca (3b)
- Undo/redo editor flowchart lewat snapshot state + `checkpoint()` diff-based (butir 4)
- Server MCP tanpa dependensi: 13 alat (generator + berkas + smc2 + git), folder kerja terkurung
- Aplikasi lokal jadi server penuh: API `fs/smc2/git`, halaman `/edit` buat catat-lihat-kembalikan
- Riwayat `.smc2` lewat git: `track_smc2` menyimpan berkas aslinya, `restore_smc2` mengembalikan persis byte-nya
- Node condition yatim ikut selamat lewat export-import (butir 6)
- Ringkasan hasil generate + warning yang bisa diklik (butir 5 dan 8)
- Satu jalan masuk: panel **All tools & docs** di `index.html` + `scripts/app.js` melayani
  generator, pembaca `.smc2`, dan dokumen; `tests/hub.test.js` menjaga tautnya tetap hidup

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
