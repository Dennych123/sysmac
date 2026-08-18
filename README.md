# Susmax Program Generator

**IO list masuk, program PLC Omron Sysmac yang siap di-import keluar.** Ditambah
alat-alat yang dipakai setelah programnya masuk mesin: pembaca project `.smc2`,
pembanding dua versi, sinkron alarm ke HMI NB-Designer, dan jembatan OPC UA ke
simulator.

Buka **`home.html`** - dari situ semua alatnya ketemu. Tanpa dependensi, tanpa server, jalan
offline dari `file://`.

```
tanpa npm install  ·  tanpa node_modules  ·  35 suite tes  ·  divalidasi ke XSD resmi Omron
```

---

## Sekali jalan, dari 85 baris IO list

```bash
node scripts/core.js project.json out/          # 0,24 detik
```

| keluar | isi |
|---|---|
| **6 program, 591 rung** | MAIN, Initial, HMI, dan satu program per station - lengkap dengan section Device_Input, LSCombination, Individual, AutoRunning, Auto_Output, Fault, HMI_Output |
| **394 variabel global** | nama, tipe, komentar, kolom **AT**, dan **Retain** - ikut di dalam XML, bukan ditempel tangan |
| **190 alarm + motion fault** | teks alarmnya jadi, nomornya stabil, siap disinkronkan ke layar NB |
| **AlarmLib.csv** | 89 medan per baris, format Import dialog Alarm Setting NB-Designer |

Yang di layar sama persis dengan yang di CLI: `index.html` dan `scripts/core.js`
menjalankan `js/*.js` yang sama, bukan dua salinan yang mirip.

---

## Yang bikin ini bukan sekadar penghasil template

Sysmac Studio menolak import dengan pesan yang **tidak menyebut sebabnya** -
kadang tanpa nomor baris sama sekali. Jadi tiap kelas kesalahan punya penjaganya
sendiri, dan semuanya ikut `node tests/run.js`:

| gerbang | menangkap | kalau lolos, Studio bilang |
|---|---|---|
| `xsd` | bentuk elemen salah | `(Import failed)`, tanpa baris |
| `instr` | FUN dikasih instance / FB tanpa instance / minta ENO yang tidak ada | `(DefinitionError)<nama>` |
| `rungwire` | ref ke id yang tidak ada, titik keluar nganggur | "invalid connection" - atau **rung kosong tanpa keluhan** |
| `declared` | operand dipakai tapi tidak dideklarasi di program itu | tidak bilang apa-apa; variabelnya merah setelah semua masuk |

Tiap gerbang **menguji dirinya sendiri**: satu berkas yang sengaja dirusak harus
tertangkap. Validator yang berhenti memvalidasi kelihatannya persis sama dengan
yang lulus.

Dan yang lebih menentukan lagi: **bentuk XML-nya tidak ditebak.** Susunan pin tiap
instruksi dibaca dari project yang JALAN DI MESIN lewat `--probe-fb`, XSD-nya milik
Sysmac Studio sendiri, dan yang belum terbukti import bersih tetap dimatikan
(`ADV_OK`). Yang sudah dicoba dan TIDAK bisa juga dicatat - lengkap dengan
kontrolnya - supaya tidak dicoba lagi tahun depan.

---

## Alat di repo ini

Semuanya bisa dibuka dari `index.html` (panel **All tools & docs** di bawah halaman),
atau dijalankan sendiri dari terminal.

| alat | buat apa |
|---|---|
| **[Generator](index.html)** | IO list + flowchart &rarr; XML importable + tabel variabel |
| **[Pembaca `.smc2`](reader/)** | buka project Sysmac **tanpa Sysmac Studio**, tampilannya seperti Studio: pohon project yang bisa disembunyikan, satu section sekali jalan, dan Cross Reference yang tiap barisnya melompat ke rung-nya |
| **`scripts/smc2_diff.js`** | bandingkan dua `.smc2`: rung logika vs geser kanvas vs **alamat/nomor alarm yang bergeser** |
| **`scripts/smc2_extract.js`** | `.smc2` jadi teks deterministik yang bisa di-commit - `git diff` akhirnya menunjukkan rung mana yang berubah, bukan "binary files differ" |
| **`scripts/nb_sync.js`** | komen alarm `.smc2` &rarr; project NB-Designer, langsung ke `.nbp` |
| **`scripts/nb_apply.js`** | siapkan `AlarmLib-generated.csv` buat tombol Import di dialog Alarm Setting |
| **`scripts/smc2_comment.js`** | komen elemen `AL[n]`/`MF[n]` ditulis balik ke `.smc2` - satu-satunya jalan, karena Studio membuang `smcext:VariableComment` waktu import |
| **`tools/opcua/browse.js`** | baca/tulis variabel program NX yang sedang **disimulasikan**, lewat OPC UA |
| **`scripts/mcp.js`** | server MCP tanpa dependensi - 13 alat: generator, berkas, baca/banding `.smc2`, dan riwayat git |
| **Edit assistance** (`/edit`) | catat versi `.smc2` sebelum menyunting, lihat riwayatnya, kembalikan persis byte-nya |
| **`scripts/validate_xml.ps1`** | validasi ke XSD resmi yang dipasang Sysmac Studio |
| **`scripts/app.js`** + `Susmax.cmd` | aplikasi lokal 127.0.0.1: semua di atas lewat halaman, tanpa mengetik path |
| **[docs/SYSMAC_INSTRUCTIONS.md](docs/SYSMAC_INSTRUCTIONS.md)** | 353 instruksi, kolom FUN/FB, susunan pin - dari manual W560, dicocokkan ke project nyata |

Editornya punya **undo/redo** (Ctrl+Z / Ctrl+Shift+Z) - snapshot seluruh state, jadi tidak ada
jalur mutasi yang bisa terlewat diam-diam. Di panel hasil, tiap generate langsung menyebut apa yang jadi: **program, section, dan jumlah
rung per section** - section yang tidak punya satu rung pun ditandai kuning, karena yang kosong
itulah yang perlu dilihat dan di XML mentah bentuknya cuma ketiadaan. Baris **warning bisa
diklik**: langsung melompat ke aktuator atau station yang diadukan, dengan sorotan sesaat.

Yang menulis berkas **tidak menulis apa pun tanpa `--write`**, dan selalu
mencadangkan yang lama ke `.bak` bertanggal yang tidak pernah menimpa cadangan
sebelumnya.

---

## Lingkarannya tertutup

```
   IO list  ──▶  flowchart  ──▶  XML  ──▶  Sysmac Studio  ──▶  MESIN
                                              │
        smc2_diff  ◀── .smc2 ◀── disunting di Studio
        nb_sync    ──▶  layar NB-Designer (alarm, nomor, teks)
        OPC UA     ◀──▶  simulator NX  ◀──▶  simulasi fisika di luar
```

Generator bukan cuma kepakai di awal project. Begitu mesin jalan, `.smc2`-nya bisa
dibaca balik, dibandingkan dengan versi kemarin, dan alarmnya disinkronkan ke HMI -
tanpa Sysmac Studio, tanpa menyalin apa pun dengan tangan.

Pembangun XML-nya **dipakai bersama** (`js/lib.js`), bukan disalin: parser `.smc2`
pernah ditulis dua kali dan diam-diam drift, dan drift di sisi TULIS menghasilkan
berkas yang ter-import mulus tapi salah.

---

## Mulai

```bash
python scripts/build_html.py     # js/*.js + template  ->  index.html
node tests/run.js                # 27 suite generator
cd reader && node tests/run.js   # 8 suite pembaca .smc2
```

### Pindah ke laptop lain

```bash
git clone <repo> && cd repo
node scripts/doctor.js       # periksa Node, git, halaman yang sudah dibuild, XSD Studio, dll
python scripts/build_html.py
cd reader && node build.js && cd ..
```

Tanpa Docker, dan itu disengaja: dialog pilih berkas, XSD resmi Sysmac Studio, project `.smc2`
dan `.nbp` semuanya ada di mesin Windows-nya. Yang bisa dibungkus container justru bagian yang
sudah tanpa dependensi. Riwayat project ikut pindah bersama folder project-nya; folder kerja dan
pendaftaran MCP disetel ulang sekali per mesin.

### Menjalankan aplikasinya

```bash
node scripts/app.js                          # folder kerja = folder repo ini
node scripts/app.js --ws "C:/kerja/mesinA"   # folder kerja = folder project
```

Atau klik dua kali **`Susmax.cmd`** (argumen diteruskan: `Susmax.cmd --ws "C:/kerja/mesinA"`),
lalu buka <http://127.0.0.1:7654>. Dari situ generator, pembaca `.smc2`, alat NB-Designer, dan
Edit assistance semuanya ketemu. Tiap halaman menampilkan sendiri apakah servernya hidup dan
folder kerjanya yang mana &mdash; ditanyakan ke servernya, bukan ditebak.

`home.html` dan pembaca `.smc2` tetap bisa dibuka langsung dari disk; yang butuh baca/tulis
berkas menyala begitu servernya jalan.

**Dua git, dan sengaja terpisah:** repo ini menyimpan KODE-nya; tiap project mesin punya repo
riwayatnya sendiri di dalam folder kerja, dibuat otomatis waktu `.smc2`-nya dicatat. Riwayat
program mesin pelanggan bukan bagian dari kode alat.

Sebelum mengubah kode, baca **[CLAUDE.md](CLAUDE.md)** - isinya jebakan yang tidak
kelihatan dari kode dan menyebabkan kerusakan senyap kalau dilanggar. Pekerjaan yang
belum selesai ada di **[TODO.md](TODO.md)**.

---

## Alur pipeline

```
IO list (TSV)  ->  Parse  ->  Generate Name  ->  Validate  ->  Split per Station
                                                                    |
                                        Prg001_MAIN.xml  <----------+
                                        Prg010_ST1.xml
                                        Prg011_ST2.xml   (jumlah unit dinamis)
                                        ...
                                        AllPrograms.xml       (semua program jadi satu)
                                        GlobalVariables.tsv   (paste ke tabel global Sysmac)
```

Kolom IO list: `Alamat | Jenis | IN/OUT | Komentar`, dipisah TAB.
Komentar yang memuat `ST<n>` (`ST1`, `ST2`, ..., tidak dibatasi 3) masuk ke program
unit, sisanya masuk ke program MAIN.

Standar penamaan, alokasi alarm, dan bentuk section mengikuti standar pemrograman
terstruktur PT. Denso Indonesia - dibaca dari project mesin yang jalan, bukan dari
dokumentasi.

## Perintah

```bash
python scripts/build_html.py            # -> index.html standalone
node tests/run.js                       # SELURUH suite: pipeline + harness per-area
node scripts/core.js project.json out/  # generate dari CLI, tanpa browser
node scripts/app.js                     # aplikasi lokal (atau klik dua kali Susmax.cmd)
pwsh scripts/validate_xml.ps1           # outputs/*.xml -> XSD resmi Sysmac
```

Setelah program masuk mesin:

```bash
node scripts/smc2_diff.js LAMA.smc2 BARU.smc2                    # apa yang berubah di Studio
node scripts/nb_sync.js <project.smc2> <project NB> [--rebuild]  # komen alarm -> Alarm + Event Setting
node scripts/smc2_comment.js <project.smc2> <ArrayComments.tsv>  # komen elemen AL/MF -> .smc2
node scripts/nb_apply.js <csv|json> <project NB>                 # siapkan AlarmLib.csv buat Import
```

`tests/run.js` membaca `index.html`, jadi **build dulu baru test**. Suite-nya menolak
jalan kalau `index.html` tidak memuat isi `js/*.js` yang terakhir - dicek lewat isi,
bukan tanggal berkas.

`index.html` itu hasil build. Jangan diedit langsung: edit `js/*.js` atau
`scripts/build_html.py` lalu build ulang.

---

# Detail

Bagian di bawah ini rinciannya - fitur per fitur, format JSON-nya, dan batasannya.

### Pengaturan (nama station, timer default)

Setelah Generate, tiap station dapat kotak nama bebas (opsional, mis. "ST1
Conveyor Feed") - ngikut ke SEMUA komentar yang nyebut identitas station,
bukan cuma satu tempat: `LB400_A`/`LB400_B` ("ST1 Conveyor Feed, Automatic
motion start seal"), broadcast status ke program lain (`GB0xx_00` dkk,
"ST1 Conveyor Feed unit at home position"), referensi ke station LAIN di
Station_Input program masing-masing, sampai status bit di MAIN. Nama-nya
juga nempel ke **nama Program Sysmac-nya sendiri** dan nama file XML-nya
(`Prg010_ST1_Conveyor_Feed`, bukan cuma `Prg010_ST1`) - spasi/karakter
aneh di nama otomatis diganti underscore (Sysmac tidak terima spasi di nama
Program). Timer
debounce PH/PX (`T#200MS`) dan motion-fault (`T#5S`) juga bisa disetel
di sini, berlaku buat SEMUA station - format harus persis `T#<angka><unit>`
(`MS`/`S`/`M`/`H`, mis. `T#150MS`), salah format dibalikin ke default +
warning (nilainya ditempel langsung jadi XML attribute tanpa escape, jadi
divalidasi ketat).

### Aktuator servo N-posisi (`SRV_LS`/`SRV_CMD`)

Buat aktuator yang bukan silinder FWD/BWD dua-posisi (mis. servo axis
3-posisi LEFT/RIGHT/CENTER) - dua jenis IO baru: `SRV_LS` (input, limit
switch/feedback per posisi) dan `SRV_CMD` (output, command per posisi).
Beda dari silinder biasa: tiap `SRV_CMD` itu **aktuator mandiri satu-satu**
(gak lewat `pairUp` dua-dua kayak CR/SOL - kalau jumlahnya ganjil, yang
sisa bakal DI-DROP diam-diam sama pairUp, ini yang bikin salah satu posisi
gak keliatan sama sekali di section Individual sebelumnya). Tiap `SRV_CMD`
otomatis dicocokin ke `SRV_LS` yang komennya PALING mirip (skor tertinggi
menang - butuh presisi karena kandidat kayak LEFT/RIGHT/CENTER biasanya
banyak kata sama, cuma beda satu kata arah/posisi). Hasilnya bisa dipakai
di Motion Sequence persis kayak solenoid biasa (`sol` = nama `SRV_CMD`-nya),
dapat motion-fault detection satu-sisi (bukan dual-sensor-fault kayak
silinder, gak ada exclusivity dua-state buat dicek), dan tombol jog sendiri
di Individual (bukan pasangan M/R - "arah" servo itu pilihan posisi, bukan
gerak dua arah).

### Confirm Mode per aktuator (opsional)

Panel di bawah nama station - buat tiap output CR/SOL/SRV_CMD, pilih:
**Auto** (default, pencocokan sensor otomatis kayak biasa), **Open-loop**
(aktuator sengaja gak punya sensor by design - mis. DANDORI LOCK/UNLOCK,
PART FEEDER START - skip fault-detection DAN skip warning "no matching
limit switch" sama sekali, gak makan slot MF), atau **Manual** (override
pencocokan otomatis yang salah/low-confidence, isi sendiri nama bit
konfirmasinya). Aktuator Open-loop gak bisa dipakai di Motion Sequence
(TR0 cmd+confirm butuh bit konfirmasi buat lanjut ke step berikutnya).

### Project JSON (simpan/pulihkan semua sekaligus)

Kotak "Project JSON" (di bawah Pengaturan) nyimpen/mulihin SATU project
utuh - IO list, Motion Sequence semua station, Condition semua station,
nama station, timer default, Confirm Mode per aktuator - dalam satu blob,
gak perlu export per-station satu-satu. Import langsung generate ulang
pakai IO list di dalamnya dan GANTI seluruh project yang lagi kebuka. Format:
```json
{
  "io": "CH0_00\tPB\tIN\t...",
  "stationNames": {"ST1": "Conveyor Feed"},
  "timerDefaults": {"phpx": "T#200MS", "motion": "T#5S"},
  "actuatorOverrides": {"SOL_ST1_DDR_TYP1_LCK": {"mode": "openloop"}},
  "motionSequences": {"ST1": [...]},
  "conditionDefs": {"ST1": [...]}
}
```
`motionSequences`/`conditionDefs` tiap station-nya persis format array yang
sama kayak kotak JSON per-station (lihat bawah) - cuma dibungkus per `stKey`.

### Condition (bit bernama, tanpa batas 3)

Panel "Condition" muncul buat tiap station setelah klik Generate. Dulu
Condition section cuma punya 3 slot cadangan generik (`LB300`-`LB302`,
gerbangnya sama semua - `LB105 AND LB160 AND AUTO_MODE`). Sekarang tiap
station boleh punya sejumlah bit Condition **bernama**, masing-masing bit
= OR dari beberapa **OR group**, tiap group = AND dari beberapa **term**
(bit + tombol AND/NOT buat toggle negate) - persis pola Denso PATTERN 3 di
project asli (`P&P Take Out Lowering Auto Start Condition` = groupA OR
groupB, tiap group AND beberapa sensor/status bit). "+ Condition" nambah
bit baru, "+ OR group" nambah kombinasi syarat baru, "+ term" nambah
syarat di dalam satu group. Term boleh nunjuk bit Condition LAIN di station
yang sama (referensi silang - condition ke-2 boleh makein bit condition
ke-1 sebagai salah satu term-nya), sensor, atau bit apapun; kalau belum
kedeklarasi di manapun otomatis dibikinin placeholder biar gak error pas
import (logic yang beneran drive bit itu tetap ditulis manual). Bit boleh
diberi nama alamat sendiri (kosongin field "Bit" = auto `LB300`, `LB301`,
dst sesuai urutan). Station yang gak disentuh tetap dapat 3 slot cadangan
generik lama, zero regresi.

**Import/Export JSON**, sama polanya kayak Motion Sequence:
```json
[
  { "name": "P&P Take Out Lowering Auto Start Condition", "bit": "", "groups": [
    [ {"bit":"LB206","neg":false}, {"bit":"LB211","neg":false}, {"bit":"LB1000","neg":true}, {"bit":"LB175","neg":false} ],
    [ {"bit":"LB202","neg":false}, {"bit":"LB203","neg":false} ]
  ] }
]
```
Import mengganti SELURUH Condition station itu. Comparator/counter block
(`=`, `TST` dkk, kayak "Data Ok For Auto Running" di project asli) BUKAN
bagian fitur ini - kalau butuh bit hasil perbandingan, tulis manual lalu
rujuk namanya sebagai term biasa (sama kayak bit eksternal lainnya).

### Motion Sequence (urutan gerak AutoRunning)

Setelah klik Generate, panel "Motion Sequence" muncul di `index.html` kalau
ada station dengan actuator. Tiap station boleh punya beberapa **varian**
sequence ("+ Variant") - tiap varian punya Condition bit sendiri (kosongin
= selalu aktif) dan graph node-nya sendiri, kayak pemilihan TIPE di FSM:
cuma varian yang kondisinya true yang jalan (lihat `PATTERN 3` condition
select di skill referensi CX-Programmer -> Susmax).

Di dalam satu varian: klik solenoid buat drop node, seret dari bulatan
kuning di node ke node LAIN (arah bebas, asal gak muter balik jadi loop)
buat bikin panah dependency ("node ini nunggu node itu selesai"). Beberapa
node boleh nunjuk ke predecessor yang sama (paralel - jalan bareng), satu
node boleh punya 2+ panah masuk (badge AND muncul otomatis, klik buat
toggle ke OR - AND = nunggu semua, OR = nunggu salah satu). "+ Condition/bit"
nambah node rujukan bit yang sudah ada (`LB300` dkk di section Condition,
sensor, atau operand lain) sebagai sumber panah, bukan solenoid. Klik
node/panah buat select (kuning), tekan **Delete/Backspace** buat hapus yang
keselect (bersih otomatis nge-hapus panah yang nempel). Posisi node bisa
diseret, itu kosmetik doang. Tiap perubahan struktur langsung regenerate
ladder AutoRunning station itu.

**Import/Export JSON** - tiap station-box punya kotak JSON di bawah, buat
isi/ambil seluruh sequence station itu tanpa drag-drop manual (mis. hasil
generate AI, atau nulis/nyalin langsung). Format persis bentuk yang dikirim
ke `gen_all.js`:
```json
[
  { "condition": "", "comment": "", "nodes": [
    { "id": "n1", "sol": "SOL_ST1_STP5_CHK", "after": [], "join": "AND" },
    { "id": "n2", "sol": "SOL_ST1_STP5_UCHK", "after": ["n1"], "join": "AND" }
  ] }
]
```
`after` boleh nunjuk id node lain di varian yang sama, atau bit apapun yang
sudah dideklarasi (Condition section, sensor) - kalau bit itu gak match id
node manapun di JSON-nya, node "condition" otomatis dibikin biar kegambar.
Import mengganti SELURUH varian station itu; Export nulis balik state
sekarang ke textarea (bisa disalin/disimpan). Posisi node hasil import
dihitung dari **urutan topologis** (dependency selalu di-array sebelum
yang gantung ke dia) dipasang ke **grid tetap 4 kolom** (index ke-N =
kolom `N%4`, baris `floor(N/4)`) - bukan urutan array mentah JSON, dan
bukan tata-letak dinamis per-kedalaman (percobaan sebelumnya, kerasa gak
absolut karena kolom bisa geser ngikutin bentuk graph) - jadi posisinya
selalu sama tiap import JSON yang sama persis, dan tetap kebaca top-to-
bottom biar urutan JSON-nya acak. Graph juga selalu gambar node lingkaran
kecil **START** (nyambung ke tiap node yang gak nunjuk node lain - awal
sequence) dan **END** (disambungin DARI tiap node yang gak ditunjuk node
lain manapun - akhir sequence) di atas dan bawah, port di ATAS/BAWAH
lingkaran (vertikal) biar kabelnya gak numpuk sama kabel antar-node biasa
(horizontal, port kiri/kanan) - murni visual, dihitung ulang tiap render,
gak kesimpen di JSON/state, gak bisa diklik/digeser/dihapus.

`comment` (opsional, boleh kosong) - keterangan bebas per varian ("TYPE 1 -
lane 1&2", dst), muncul di kotak "Comment" panel UI DAN sebagai teks comment
rung XML-nya ("Sequence variant "..." - gate: ..."). Ngisi `comment` tanpa
ngisi `condition` tetap bikin satu gate rung sendiri (fungsinya cuma lewatin
LB400 apa adanya) biar tetap ada tempat nempelin keterangannya di XML.

Penting: `condition` cuma otomatis ke-AND ke node yang `after`-nya KOSONG
(node root varian). Node yang `after`-nya nunjuk bit eksternal (bukan node
lain) HARUS nyantumin sendiri bit condition itu di `after`-nya kalau memang
mau ikut ke-gate - lihat contoh ST1 di bawah (`after: ["LB300", "PH_..."]`).

**Komen per condition-bit** - tiap node "+ Condition/bit" (bit eksternal,
kotak putus-putus di graph) boleh dikasih komen bebas (isi pas nambah node,
atau klik node-nya buat munculin kotak edit "Komen bit ..." di bawah graph).
Kepake buat jelasin ARTI bit itu (mis. `LB300` -> "type1 aktif") tanpa perlu
nebak dari nama doang. Komen ke-simpan di `conditionComments` (map bit->teks)
tiap varian pas Export JSON, dan ke-baca balik pas Import. Muncul di XML
CUMA kalau bit itu ikut kena-materialize jadi rung (node yang dependency-nya
2+ , alias join AND/OR) - kalau bit itu satu-satunya dependency sebuah node,
gak ada rung yang dibikin buat dia (langsung passthrough), jadi komennya
cuma nempel di editor/JSON, gak ikut ke XML.

Bit eksternal (Condition/kondisi, `after` refs) yang direferensikan graph
tapi belum kedeklarasi di manapun (bukan device/global asli, bukan spare
Condition section) OTOMATIS dideklarasikan sebagai private BOOL placeholder
biar Sysmac tidak menolak "operand tidak terdeklarasi" - logic yang bener-bener
nge-drive nilainya (kondisi, counter, dst) tetap harus ditulis manual di
section lain. Deklarasi ini muncul cuma kalau bit itu kepake jadi kontak di
rung beneran (root/prev satu-satunya sebuah node, atau bagian dari join).

Codegen: idiom Denso TR0 cmd+confirm (`js/lib.js` -> `motionStep`) tetap
dipakai per node - cmd bit break-nya `ANDNOT` bit confirm node itu sendiri
(bukan `ANDNOT` LSC), jadi cmd tetap ON sampai posisi beneran kekonfirmasi.
Kalau sebuah node punya 2+ dependency, satu rung AND (`series`) atau OR
(`orMany`) dibikin dulu buat gabungin jadi satu bit, baru bit itu jadi TR0
buat `motionStep`-nya. Graph di-topological-sort di `gen_all.js` sebelum
diproses, jadi urutan drag-connect di editor gak ngaruh ke kebenaran hasil.
Tiap varian yang punya Condition dipilih pakai pola Denso PATTERN 3
select+latch (bukan gerbang pass-through biasa): sekali di cycle start
(`LB400`), kondisi-nya di-sample (`LB400 AND <condition>`), lalu di-LATCH
ke bit sendiri (`LB401`, `LB402`, dst - satu per varian ber-condition) yang
saling ANDNOT (mutual exclusion - varian lain gak bisa ikut ke-latch kalau
salah satu udah menang) dan reset otomatis begitu `LB400` drop (cycle
selesai/CYCLE_STOP). Root node varian itu jadi nempel ke bit LATCH-nya,
bukan hasil sample mentah - jadi kalau condition-nya flicker di tengah
cycle, motion yang lagi jalan gak ikut keputus. Varian tanpa Condition
tetap ke `LB400` langsung (gak ikut mutual exclusion). Semua varian nge-OR
ke `LB499` "1 cycle motion complete" bareng - rung `LB499` ini ditaruh
DI ANTARA rung LB400/mutex-group (LB401-LB40x) dan motion step pertama
(LB410), bukan di paling atas atau paling bawah section. Station yang gak
disentuh di panel ini tetap dapat kerangka placeholder biasa (lihat
`Batasan`). Import JSON nolak `"join"` yang bukan persis `"AND"`/`"OR"`
(mis. typo `"or"`) - error, bukan kesilent-defaultkan ke AND.

Pencocokan solenoid <-> limit switch (`findLsc`, dipakai buat motion fault
dan `motionStep`) dicatat di `msg.payload.lscAudit` (satu baris per match,
"<komentar device> -> <LSC>, score <n>") - kecek beneran matching-nya siapa
ke siapa, jangan cuma percaya "gak ada warning". Match dengan score pas-pasan
(2, cuma 2 kata komentar yang sama) otomatis juga masuk `warnings` biar
kecek manual - kepercayaan cocoknya lemah, gampang salah pasang device mirip.

## Struktur

| Berkas | Isi |
|---|---|
| `js/lib.js` | Pembangun XML: `Rung`, `series`, `orMany`, `latch`, `orOfAnds`, `ls2`, `merge2`, `chunkNot`, `ton`, `Rung.ton`, `portName`, `vr`, `sect`, `prog` |
| `js/parse.js` | TSV menjadi array perangkat |
| `js/genname.js` | Jenis dan komentar menjadi nama simbol |
| `js/validate.js` | Kolom kosong, IN/OUT, alamat ganda |
| `js/split.js` | Pemisahan per station |
| `js/gen_all.js` | Pembangkit seluruh program |
| `scripts/build_html.py` | Perakit `index.html` standalone |
| `scripts/core.js` | Runner pipeline headless (modul + CLI) |
| `scripts/test.js` | Uji pipeline end-to-end |
| `tests/run.js` | Penjalan seluruh suite |
| `tests/*.test.js` | Harness per-area (editor, warning, array, blok, JSON, grid IO, taut panel Tools) |
| `index.html` | Hasil build, jangan diedit langsung |
| `reader/` | Pembaca `.smc2` + ekspor balik ke XML importable. Suite sendiri: `cd reader && node tests/run.js` |
| `scripts/nb_sync.js` | Komen alarm `.smc2` -> `.nbp` (Alarm + Event Setting), dicocokkan lewat penanda AL[n] |
| `scripts/nb_apply.js` | Menyiapkan `AlarmLib-generated.csv` di folder project NB buat tombol Import |
| `scripts/nb_common.js` | Pencari project NB - satu aturan, dipakai dua skrip di atas |
| `scripts/smc2_comment.js` | Komen elemen AL/MF ditulis balik ke `.smc2` |
| `scripts/smc2_write.js` | Pengemas ulang container `.smc2` (ZIP) |
| `scripts/smc2_diff.js` + `reader/diff.js` | Bandingkan dua `.smc2` - hanya baca; memisahkan perubahan logika, tata letak, dan alamat/nomor alarm yang bergeser |
| `scripts/app.js` + `Susmax.cmd` | Aplikasi lokal: yang di CLI, lewat halaman; sekaligus melayani generator, pembaca, dan dokumen |
| `tests/hub.test.js` | Menjaga tiap taut dan tiap perintah di panel Tools `index.html` benar-benar hidup |

## Uji yang dijalankan `test.js`

1. Seluruh rantai node berjalan tanpa galat, tiga skenario (stub tanpa
   Motion Sequence, diseed dengan graph multi-varian: linear, fork,
   AND-join, OR-gate, condition select-latch; dan diseed dengan
   Condition section dinamis: bit bernama, OR-of-AND-groups, referensi
   silang antar Condition)
2. Setiap operand pada rung terdeklarasi di program tersebut
3. Setiap `ExternalVars` punya padanan pada tabel global
4. Tidak ada kontak menggantung (penyebab `import failed` di Sysmac Studio)
5. Blok array AL/MF gak pernah penuh walau actuator/AS-pair banyak (ukuran
   dinamis, bukan lebar tetap)

Selain itu ada skrip terpisah (dibangun ulang tiap sesi kerja, gak
di-commit) yang men-dispatch event mouse/keyboard beneran (`mousedown`/
`mousemove`/`mouseup`/`keydown`) ke elemen SVG hasil `index.html`, bukan
manggil fungsi state-nya langsung - buat mastiin drag-connect, penolakan
cycle, dan hapus via keyboard bener-bener jalan lewat kode yang sama yang
dipanggil browser, bukan cuma lewat jalur pintas testing.

## Urutan import ke Sysmac Studio

1. Import `AllPrograms.xml` - nama, tipe, komen, **AT**, dan **Retain** ikut di dalamnya
2. Komen elemen `AL[n]`/`MF[n]`: jalankan `scripts/smc2_comment.js` ke `.smc2`-nya,
   atau tempel `ArrayComments.tsv` setelah arraynya di-expand. Komen elemen TIDAK bisa
   lewat import XML - Studio membuang `smcext:VariableComment`, sudah diuji.
3. Alarm NB: `scripts/nb_sync.js` langsung ke `.nbp`, atau Import `AlarmLib.csv` di
   dialog Alarm Setting

Kalau masih memakai jalur lama - tempel `GlobalVariables.tsv` dulu, baru import program -
urutannya tidak boleh terbalik: Studio menjawab "A global variable corresponding to the
external variable has not been registered".

## Batasan

- Urutan gerak pada `AutoRunning` cuma dibangkitkan buat station yang
  disusun lewat panel Motion Sequence di `index.html`. Station yang belum
  disentuh tetap dapat kerangka placeholder `LB410` ke atas.
- Motion Sequence belum mendukung overlay step-mode manual (`PB_STEP_MODE`
  di project Denso asli - tombol jog per step).
- Aktuator yang gak punya alamat CH fisik (servo axis, dll) bisa dimasukin
  sebagai baris IO list "virtual" (alamat bebas asal gak bentrok, mis.
  `VS0_00`) - buat servo N-posisi (LEFT/RIGHT/CENTER dst) pakai jenis
  `SRV_LS`/`SRV_CMD` (lihat bagian "Aktuator servo N-posisi" di atas), buat
  silinder FWD/BWD dua-posisi biasa tetap AS/CR/SOL kayak biasa. JANGAN
  taruh keterangan "(virtual)" dkk di kolom komentar - itu ikut kepotong
  jadi bagian nama simbol (genname makein semua kata di komentar). Catat
  virtual-nya di luar IO list aja (dokumentasi terpisah).
- Kalau satu nama solenoid dipakai di lebih dari satu node motion (sengaja
  atau gak), `Auto_Output` cuma nge-OR command node yang PALING TERAKHIR
  diproses ke solenoid fisiknya - node sebelumnya yang solenoid-nya sama
  tetap jalan motion-nya (chain-nya benar) tapi gak ikut ngedrive output.
- Interlock pada `Individual` masih `GSB000`, harus ditulis manual
- `Condition` unit yang gak disetel lewat panel tetap fallback ke tiga slot
  cadangan generik (`LB300`-`LB302`) - lihat bagian Condition di atas buat
  bikin bit bernama sendiri
- `HMI_Input` sengaja kosong
- Pemasangan solenoid dengan sensor memakai kemiripan kata pada komentar
- Penetapan port fisik tetap manual melalui I/O Map
- Tombol Individual station-level: home-return = `PB004_<SN dua digit>R`
  (mis. `PB004_01R` buat ST1), staging/motion = `PB004_<SN dua digit>M`
  (mis. `PB004_02M` buat ST2). Kontak `LB319` (bukan `LB320`) yang jadi
  interlock ke koil command individual tiap aktuator (`LB340`/`LB341`+);
  `LB320` sendiri (staging latch) tetap dipakai buat gerbang `LB400` di
  AutoRunning, gak diganti - itu bit yang beda maksud

