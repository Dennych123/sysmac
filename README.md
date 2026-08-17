# Susmax-program-generator

Generator program Imron Susmax Studio (IEC 61131-10 XML) dari IO list,
mengikuti standar pemrograman terstruktur PT. Ndeso Indonesia.
Dipaketkan sebagai `index.html` standalone - satu file, tanpa dependensi
eksternal, tanpa server, jalan offline dari `file://`.

Arah sebaliknya ada di **[reader/](reader/)**: membaca project `.smc2` yang sudah
jadi tanpa Sysmac Studio, dan mengekspor rung-nya balik jadi XML yang bisa
di-import. Jadi lingkarannya tertutup - **baca program yang ada → sunting →
import balik**, bukan cuma bikin dari nol. Pembangun XML-nya dipakai bersama
(`js/lib.js`), bukan disalin.

## Alur

```
IO list (TSV)  ->  Parse  ->  Generate Name  ->  Validate  ->  Split per Station
                                                                    |
                                        Prg001_MAIN.xml  <----------+
                                        Prg010_ST1.xml
                                        Prg011_ST2.xml   (jumlah unit dinamis)
                                        ...
                                        AllPrograms.xml       (semua program jadi satu)
                                        GlobalVariables.tsv   (paste ke tabel global Susmax)
```

Kolom IO list: `Alamat | Jenis | IN/OUT | Komentar`, dipisah TAB.
Komentar yang memuat `ST<n>` (`ST1`, `ST2`, ..., gak dibatasin 3) masuk ke program unit,
sisanya masuk ke program MAIN.

## Cara build

```bash
python3 scripts/build_html.py           # -> index.html standalone, tinggal dibuka di browser
node tests/run.js                       # SELURUH suite: pipeline + harness per-area
node scripts/core.js project.json out/  # generate dari CLI, tanpa browser
```

`tests/run.js` membaca `index.html`, jadi build dulu baru test kalau yang diubah
ada di `scripts/build_html.py`.

Sebelum mengubah kode, baca **[CLAUDE.md](CLAUDE.md)** - berisi jebakan yang tidak
kelihatan dari kode (escape Python di template, aturan seal contact, kontrak kode
warning). Daftar pekerjaan yang belum selesai ada di **[TODO.md](TODO.md)**.

`index.html` menempel semua logic `js/*.js` jadi satu file lewat `build_html.py` -
tempel IO list, klik Generate, download hasilnya. Jangan edit `index.html`
langsung: edit `js/*.js` lalu build ulang.

`scripts/core.js` menjalankan pipeline yang sama di Node, langsung dari `js/*.js`
tanpa build apa pun. Dipakai `test.js`, dan bisa dipakai sendiri buat batch/CI.
`js/gen_all.js` butuh helper dari `js/lib.js` - keduanya digabung otomatis, jadi
jangan menyalin isi lib ke file generator.

### Pengaturan (nama station, timer default)

Setelah Generate, tiap station dapat kotak nama bebas (opsional, mis. "ST1
Conveyor Feed") - ngikut ke SEMUA komentar yang nyebut identitas station,
bukan cuma satu tempat: `LB400_A`/`LB400_B` ("ST1 Conveyor Feed, Automatic
motion start seal"), broadcast status ke program lain (`GB0xx_00` dkk,
"ST1 Conveyor Feed unit at home position"), referensi ke station LAIN di
Station_Input program masing-masing, sampai status bit di MAIN. Nama-nya
juga nempel ke **nama Program Susmax-nya sendiri** dan nama file XML-nya
(`Prg010_ST1_Conveyor_Feed`, bukan cuma `Prg010_ST1`) - spasi/karakter
aneh di nama otomatis diganti underscore (Susmax gak terima spasi di nama
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
(bit + tombol AND/NOT buat toggle negate) - persis pola Ndeso PATTERN 3 di
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
biar Susmax gak nolak "operand tidak terdeklarasi" - logic yang bener-bener
nge-drive nilainya (kondisi, counter, dst) tetap harus ditulis manual di
section lain. Deklarasi ini muncul cuma kalau bit itu kepake jadi kontak di
rung beneran (root/prev satu-satunya sebuah node, atau bagian dari join).

Codegen: idiom Ndeso TR0 cmd+confirm (`js/lib.js` -> `motionStep`) tetap
dipakai per node - cmd bit break-nya `ANDNOT` bit confirm node itu sendiri
(bukan `ANDNOT` LSC), jadi cmd tetap ON sampai posisi beneran kekonfirmasi.
Kalau sebuah node punya 2+ dependency, satu rung AND (`series`) atau OR
(`orMany`) dibikin dulu buat gabungin jadi satu bit, baru bit itu jadi TR0
buat `motionStep`-nya. Graph di-topological-sort di `gen_all.js` sebelum
diproses, jadi urutan drag-connect di editor gak ngaruh ke kebenaran hasil.
Tiap varian yang punya Condition dipilih pakai pola Ndeso PATTERN 3
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
| `tests/*.test.js` | Harness per-area (editor, warning, array, blok, JSON, grid IO) |
| `index.html` | Hasil build, jangan diedit langsung |
| `reader/` | Pembaca `.smc2` + ekspor balik ke XML importable. Suite sendiri: `cd reader && node tests/run.js` |

## Uji yang dijalankan `test.js`

1. Seluruh rantai node berjalan tanpa galat, tiga skenario (stub tanpa
   Motion Sequence, diseed dengan graph multi-varian: linear, fork,
   AND-join, OR-gate, condition select-latch; dan diseed dengan
   Condition section dinamis: bit bernama, OR-of-AND-groups, referensi
   silang antar Condition)
2. Setiap operand pada rung terdeklarasi di program tersebut
3. Setiap `ExternalVars` punya padanan pada tabel global
4. Tidak ada kontak menggantung (penyebab `import failed` di Susmax Studio)
5. Blok array AL/MF gak pernah penuh walau actuator/AS-pair banyak (ukuran
   dinamis, bukan lebar tetap)

Selain itu ada skrip terpisah (dibangun ulang tiap sesi kerja, gak
di-commit) yang men-dispatch event mouse/keyboard beneran (`mousedown`/
`mousemove`/`mouseup`/`keydown`) ke elemen SVG hasil `index.html`, bukan
manggil fungsi state-nya langsung - buat mastiin drag-connect, penolakan
cycle, dan hapus via keyboard bener-bener jalan lewat kode yang sama yang
dipanggil browser, bukan cuma lewat jalur pintas testing.

## Urutan import ke Susmax Studio

1. Paste `GlobalVariables.tsv` ke tabel Global Variables
2. Import berkas program

Terbalik akan memunculkan galat
"A global variable corresponding to the external variable has not been registered".

## Batasan

- Urutan gerak pada `AutoRunning` cuma dibangkitkan buat station yang
  disusun lewat panel Motion Sequence di `index.html`. Station yang belum
  disentuh tetap dapat kerangka placeholder `LB410` ke atas.
- Motion Sequence belum mendukung overlay step-mode manual (`PB_STEP_MODE`
  di project Ndeso asli - tombol jog per step).
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

