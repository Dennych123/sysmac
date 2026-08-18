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

## 3. Watcher: Sysmac → git → flowchart

Idenya: sambil menyunting di Sysmac, Ctrl+S memicu pembacaan, perubahannya dicatat dan
di-commit, flowchart ikut diperbarui.

**Yang sudah diketahui.** Tidak ada penyimpanan project Sysmac yang auto-update di mesin ini
— yang ada berkas `.smc2` lepas di `Downloads`, dan `New Project.smc2` tertulis pada jam
kerja, jadi kemungkinan itu project hidup yang di-Ctrl+S. **Belum diverifikasi**: buka
Studio, Ctrl+S, lihat apakah timestamp berkas itu berubah. Kalau ya, watcher-nya tinggal
memantau satu berkas; kalau tidak, pemicunya harus "Save As" berkala.

**Keputusan desain yang lebih penting daripada pemicunya: arah kepercayaan harus timpang.**
Git boleh mencatat SEMUA — itu cuma berkas. Yang boleh balik masuk ke flowchart hanya yang
bisa diwakili PERSIS. Reader menutup ~54% rung; kalau feedback dipaksa penuh, satu rung yang
diedit tangan di Studio hilang diam-diam waktu flowchart di-generate ulang — lebih buruk
daripada tidak ada watcher. Prinsipnya sudah ada di `reader/src/net.js`: yang tidak eksak
ditolak, bukan ditebak. Rung yang tidak terwakili ditandai "berubah di Studio, perlu
ditinjau".

**Bagian yang murah dan berdiri sendiri: commit isi yang ter-ekstrak, bukan `.smc2`-nya.**
`.smc2` itu ZIP — commit binernya bikin `git diff` tidak menunjukkan apa-apa. Ekstrak XML-nya
(atau dump teks ternormalisasi dari reader) dan commit ITU di sampingnya. Baru kelihatan rung
mana yang berubah.

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
- `docs/SYSMAC_INSTRUCTIONS.md`: 353 instruksi, kolom FUN/FB dan pin, dari manual W560

## Sudah dicoba dan TIDAK bisa (jangan dicoba lagi)

- **Komen per elemen array lewat import XML.** `smcext:ElementComment` ada di XSD dan dipakai
  `Sample.xml`, tapi Studio membuang seluruh `smcext:VariableComment` waktu import. Diuji tujuh
  varian sekaligus; yang menutup perkara kontrolnya — varian yang memakai `VariableComment`
  TANPA `ElementComment` ikut kosong, sementara `<Documentation>` biasa terisi. Jadi bukan
  bentuk `ElementComment`-nya. Komen `AL[n]`/`MF[n]` tetap lewat `ArrayComments.tsv`.
