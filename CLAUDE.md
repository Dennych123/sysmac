# Catatan kerja untuk Claude

Baca ini dulu sebelum mengubah apa pun. Isinya hal-hal yang tidak kelihatan dari
kode tapi menyebabkan kerusakan senyap kalau dilanggar.

Daftar pekerjaan yang belum selesai ada di [TODO.md](TODO.md).

## Perintah

```bash
python scripts/build_html.py           # js/*.js + template  ->  index.html
node tests/run.js                      # SELURUH suite (pipeline + 16 harness)
node scripts/core.js project.json out/ # generate dari CLI, tanpa browser
pwsh scripts/validate_xml.ps1          # outputs/*.xml  ->  XSD resmi Sysmac
node scripts/nb_apply.js <csv|json> <folderNB>          # lihat dulu, TIDAK menulis
node scripts/nb_apply.js <csv|json> <folderNB> --write  # tempel ke project NB, backup dulu
```

`node tests/run.js` membaca `index.html`, jadi **build dulu baru test**. Sekarang
suite-nya menolak jalan kalau `index.html` tidak memuat isi `js/*.js` yang
terakhir — dicek lewat isi, bukan tanggal berkas. Penjaga ini ada karena
kegagalannya paling menipu di repo ini: suite generator membaca `js/*.js` lewat
`scripts/core.js`, jadi SEMUANYA tetap hijau sementara browser menjalankan
salinan lama yang ikut ke `index.html`. Yang di layar tidak berubah sama sekali
dan tidak ada satu pun tes yang mengeluh.

**Semua `open()` di `build_html.py` harus menyebut `encoding='utf-8'`.** Tanpa
itu Python memakai encoding bawaan OS — cp1252 di Windows — dan berkas js yang
UTF-8 dibaca sebagai byte cp1252: `■` di `gen_all.js` masuk ke `index.html`
sebagai `â– `. Tidak ada error, tidak ada peringatan, cuma karakter yang salah
di layar. Penjaga isi di atas ikut menangkap ini.

### Empat gerbang sebelum XML dibawa ke Studio

Studio menolak dengan pesan yang tidak menyebut sebab, jadi tiap kelas kesalahan
punya penjaganya sendiri. Semuanya sudah ikut `node tests/run.js`:

| Suite | Menangkap | Kalau lolos, Studio bilang |
|---|---|---|
| `xsd` | bentuk elemen salah | `(Import failed)`, tanpa baris |
| `instr` | FUN dikasih instance / FB tanpa instance / minta ENO yang tidak ada | `(DefinitionError)<nama>` |
| `rungwire` | ref ke id yang tidak ada, titik keluar nganggur, rel kanan putus | "invalid connection" atau **rung kosong tanpa keluhan** |
| `declared` | operand dipakai tapi tidak ada di ExternalVars program itu | tidak bilang apa-apa; variabelnya merah setelah semua masuk |

Suite `xsd` **SKIP** kalau Sysmac atau `pwsh` tidak ada di mesin — XSD-nya milik
Studio, tidak boleh disalin ke repo. SKIP selalu mencetak alasannya; kalau lewat
diam-diam berarti ada yang rusak.

Tiap gerbang menguji dirinya sendiri: satu berkas/rung/kotak yang sengaja dirusak
harus tertangkap. Validator yang berhenti memvalidasi kelihatannya persis sama
dengan yang lulus.

## Alarm NB-Designer

Alarm NB **TIDAK dibaca dari berkas di folder project**. Tempatnya di dalam `.nbp` sendiri,
sebagai elemen `<AlarmObject>`. CSV yang dihasilkan generator itu format **Export/Import**
dialog "Alarm Setting", jadi masuknya lewat tombol **Import** di dialog itu.

Ini sempat salah dikira satu sesi penuh: kebetulan ada `AlarmLib.csv` di folder project - milik
orangnya, hasil Export sendiri - dan disangka itu yang dibaca NB. Menyalin berkas ke folder
**tidak mengubah apa pun** di NB; yang berubah cuma berkas orang lain yang kebetulan bernama
sama. Makanya `scripts/nb_apply.js` menulis ke `AlarmLib-generated.csv`, bukan `AlarmLib.csv`.

Medan CSV-nya cocok satu-satu dengan atribut `<AlarmObject>` di `.nbp`, dan itu yang memastikan
bentuknya benar:

```
<AddressType SystemID="56">H_bit</AddressType>                 TrigAddrType + token area
<AddressValue Type="Bit" CodeType="0">416.00</AddressValue>    TrigAddr
<Font Size="16" Color="0xff0000">AL257</Font>                  TextSize, TextColor, TextContent
```

**Import MENGGANTI seluruh daftar alarm, bukan menambah.** Export dulu kalau daftar yang
sekarang masih dipakai.

Empat hal yang menentukan berkasnya diterima atau tidak, semuanya dibaca dari project NB yang
jalan di mesin (`Prepare HMI CE INSERTl`), bukan dikarang:

| | |
|---|---|
| 89 medan per baris | disimpan sebagai DAFTAR medan di `NB_ROW`, bukan satu string - sebagai string, satu potongan yang terlewat memendekkan baris tanpa kelihatan dan semua kolom setelahnya bergeser |
| koma di teks alarm | WAJIB dikutip. `"Dual sensor fault, both ends detected"` itu teks nyata; tanpa dikutip satu koma menggeser semua medan, dan yang paling parah bergeser alamat pemicunya |
| BOM UTF-8 | ada di berkas acuan; itu yang dipakai NB-Designer mengenali encoding-nya |
| kode area | H=`56`/`H_bit`, W=`53`/`W_bit`. Dua medan menyebut area dan HARUS cocok. Area lain belum pernah dilihat, jadi dilewati + warning `nb_area_unknown`, bukan ditebak |

**Aritmetika alamatnya WAJIB sama dengan `hmiClaimRange()`** - fungsi yang menaruh blok AT
AL/MF di PLC. Beda sedikit, teks alarmnya benar tapi bit yang dipantau lain, dan tidak ada yang
memberi tahu. Ada tes yang mengadu baris pertama CSV ke kolom AT di TSV.

`nb_apply.js` **tidak menulis apa-apa tanpa `--write`**, dan yang lama selalu disalin dulu ke
`.bak` bertanggal yang tidak pernah menimpa cadangan sebelumnya. Menimpa `AlarmLib.csv`
menghapus alarm yang tidak ada di daftar baru, dan itu baru ketahuan waktu layar NB dibuka.
Tutup NB-Designer dulu: dia memuat berkas itu waktu project dibuka dan menulisnya lagi waktu
disimpan.

## Aturan yang tidak boleh dilanggar

**Jangan edit `index.html`.** Itu hasil build. Edit `js/*.js` atau
`scripts/build_html.py` lalu build ulang.

**Escape di `build_html.py` harus ditulis dobel.** Template HTML-nya string Python
**biasa**, bukan raw. Escape yang ditulis tunggal dimakan Python duluan:

| ditulis | jadi | akibat |
|---|---|---|
| `'\n'` | baris baru sungguhan | literal JS terputus, komentar terpotong |
| `"\25B8"` | karakter kontrol oktal | CSS jadi `content:"B8"` |

Tulis `'\\n'`, `"\\25B8"`. Jebakan ini kena **empat kali** dalam satu sesi,
termasuk di dalam komentar yang memperingatkannya. Build sekarang menolak
menulis output kalau ada karakter kontrol, dan menjalankan `node --check` pada
tiap blok `<script>` — tapi lebih murah tidak membuatnya sejak awal.

**`js/*.js` berbentuk badan fungsi** yang menerima `msg`, `flow`, `node` dan
mengembalikan `msg`. Itu warisan bentuk Node-RED (Node-RED-nya sendiri sudah
dicabut) dan **dipertahankan** karena itu yang membuat file yang sama bisa
di-inline ke `index.html` sekaligus dijalankan `scripts/core.js` tanpa diubah.

**Seal contact wajib menyambung ke titik setelah `prevBit`, bukan ke power rail.**
Lihat PATTERN 4 di `js/lib.js`. Salah di sini tetap ter-import Sysmac tanpa
keluhan, tapi bit-nya nyangkut selamanya. `judgeBranch()` dan `motionStep()`
sama-sama bergantung pada ini, dan ada tes yang memeriksa titik sambungnya.

**`ExternalVars` itu per-program, bukan warisan.** Simbol yang sudah dibangun di
`P000_Initial` dan sudah ada di `GlobalVariables.tsv` TETAP tidak dikenal di
program lain kalau program itu tidak mendeklarasikannya sendiri. Pakai `G()`
milik builder yang bersangkutan di tempat simbolnya dipakai. Yang lupa lolos
XSD, lolos import, dan baru kelihatan sebagai variabel merah di Studio —
`aP_0_1s` di section Timers kena persis begini. Suite `declared` menjaganya.

**Slot cadangan itu slot UTUH, bukan jatah alamat kosong.** Tiap slot punya semua yang
dipunya slot terpakai: tombol `PB4xx_nM/R`, lampu `PL4xx_nM/R`, reed switch `AS4xx_nM/R`,
kombinasi `LSC4xx_nM/R`, alarm `ALL REED SWITCH ON`, `MOTION FAULT`, interlock, bit command,
dan barisnya di Individual / HMI_Output / Auto_Output. Menambah aktuator nanti berarti
mengganti sumber sinyal, bukan menulis slot dari nol — dan tidak ada alamat yang bergeser.

Tiga hal yang menempel padanya dan gampang salah:

- **Reed switch cadangan disetir `GSB001` (selalu OFF), bukan `GSB000`.** Dua reed switch
  yang sama-sama ON itu justru kondisi alarmnya; disetir ON, tiap slot cadangan mengalarm
  sejak scan pertama.
- **LSC cadangan TIDAK boleh masuk `homeConds`.** Sumbernya `GSB001`, jadi LSC sisi return
  selamanya OFF — dimasukkan ke syarat home position, station itu tidak pernah dinyatakan
  di home dan mesin **tidak pernah bisa start**.
- **Slot AL dan MF-nya diambil SEKARANG**, bukan nanti waktu aktuatornya dipasang.
  Dialokasi belakangan, nomor alarm semua yang di belakangnya bergeser — dan nomor itu
  tercetak di layar NB dan lembar troubleshooting.

Menekan tombol M slot cadangan MEMANG memunculkan motion fault setelah timernya habis. Itu
jawaban yang benar: slot diperintah bergerak dan tidak bergerak, karena belum ada silindernya.

**Kode warning adalah kontrak.** `W(code, station, message, {device})` di
`js/gen_all.js`. UI dan konsumen luar menyantol ke `code` dan `device`, bukan ke
teks pesan. Mengganti kalimat aman; mengganti kode memutus penyorotan blok merah
di panel Confirm Mode.

**Blok AL/MF dinomori dari NOMOR station**, bukan urutan kemunculan — ST3 selalu
blok ke-3 walau ST1/ST2 kosong. Itu yang membuat nomor alarm tidak bergeser saat
aktuator atau unit ditambah. Ukuran blok harus **seragam**; kalau satu station
butuh lebih, semuanya dinaikkan.

## XSD resminya ADA di komputer ini — pakai, jangan menebak

Sysmac Studio memasang skema XML import-nya sendiri berikut satu berkas contoh:

```
C:\Program Files\OMRON\Sysmac Studio\Sample\IEC 61131-10 XML\Controller\
    IEC61131_10_Ed1_0_Spc1_0.xsd          skema utama
    IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd  perluasan Omron (AddData/smcext)
    Sample.xml                            contoh berisi Function, FB, Timer, R_TRIG
```

```bash
pwsh scripts/validate_xml.ps1              # semua outputs/*.xml ke XSD di atas
```

Sekarang ini sudah otomatis lewat `tests/xsd.test.js`; perintah di atas untuk
memeriksa berkas yang sudah ditulis ke `outputs/` atau ke mana pun. Daftar berkas
boleh ditulis polos setelah nama skrip, sebanyak apa pun.

**Jalankan ini sebelum membawa apa pun ke Studio.** Studio cuma bilang
"(Import failed)" tanpa nomor baris; validator menyebut elemen dan barisnya. Yang
XSD TIDAK periksa: nama instruksi yang tidak ada di library tetap lolos di sini
dan baru ditolak Studio sebagai `(DefinitionError)`. Jadi dua-duanya perlu — XSD
untuk bentuk, Studio untuk resolusi nama.

`Sample.xml` itu jawaban untuk pertanyaan "bentuk yang benar seperti apa", ditulis
Omron sendiri. **Tiru rung-nya, jangan karang sendiri.** Satu rung di situ —
`Function0` — menjawab tiga hal yang masing-masing sempat kutebak dan salah:

```
DataSource var2 ──▶ <InOutVariable> ──▶ DataSink var2      variabel yang SAMA
OutputVariable ""  ──▶ RightPowerRail
ENO tidak ditulis sama sekali
```

1. **Pin in-out punya elemennya sendiri**, `<InOutVariables>`, di urutan paling
   depan. BUKAN didaftar dua kali di `<InputVariables>` + `<OutputVariables>`.
   Yang dua kali itu bentuk model internal Studio (yang dilaporkan `--probe-fb`),
   bukan bentuk XML import. Salah di sini → `The function name is not defined`.
2. **Sisi keluar pin in-out menulis balik ke variabel yang sama.** Itu arti
   "in-out": satu operand, dibaca dan ditulis.
3. **Pin yang tidak dipakai TIDAK ditulis.** `Function0` punya `EN` tapi tidak
   menulis `ENO` sama sekali. Sebaliknya, pin yang ditulis WAJIB ada yang memakai:
   di seluruh `Sample.xml` tidak ada satu pun `connectionPointOutId` yang tidak
   dirujuk. Pin nganggur → `The function or the function block has invalid
   connection. Imported as an empty rung.` — rung-nya hilang, bukan cuma merah.

Cara memeriksanya satu perintah, dan lebih murah daripada satu putaran ke Studio:

```bash
python -c "import re,io;s=io.open('x.xml',encoding='utf-8-sig').read();
[print(m.group(0)[:60], [i for i in re.findall(r'connectionPointOutId=\"(\d+)\"',m.group(0))
 if i not in re.findall(r'refConnectionPointOutId=\"(\d+)\"',m.group(0))])
 for m in re.finditer(r'<Rung\b[\s\S]*?</Rung>',s)]"
```

Tiga pesan error Studio, tiga sebab yang BEDA — jangan tertukar:

| pesan | artinya | ciri |
|---|---|---|
| `(DefinitionError)` / `The function name is not defined` | susunan pin tidak cocok definisi | kotak tergambar, merah |
| `invalid connection ... empty rung` | ada pin ditulis tanpa yang memakai | rung hilang, kosong |
| `(Import failed)` | XML-nya sendiri ditolak | rung jadi komentar |

Yang sudah dibaca dari XSD dan belum tentu kepikiran dari kode:

| | |
|---|---|
| urutan anak `FbdObject` | `InOutVariables` → `InputVariables` → `OutputVariables`, terikat `xsd:sequence` |
| coil Set/Reset | atribut `latch="set"` / `latch="reset"` (default `none`) |
| kontak/coil edge | atribut `edge`, default `none` |

### Tabel Global Variable ikut di XML — AT dan Retain TERBUKTI jalan

Kolom yang dulu ditempel tangan dari TSV punya tempatnya sendiri di XML import. Dua
sudah **dibuktikan di Studio**, satu belum:

| kolom | caranya | status |
|---|---|---|
| AT | `<Address address="%W461.00" />`, anak `VariableDecl` **sesudah** `Type` | terbukti jalan |
| Retain | atribut `retain="true"` di **kontainer** `<GlobalVars>` | terbukti jalan |
| Comment | `<Documentation xsi:type="SimpleText">` | sudah lama dipakai |
| Comment per elemen | `<smcext:ElementComment>` | **TIDAK BISA — sudah diuji, jangan dicoba lagi** |

Retain kelihatan mustahil per-variabel karena atributnya di kontainer. Bukan: `GlobalVars`
itu `maxOccurs="unbounded"`, jadi yang retain masuk kontainer `retain="true"` dan sisanya
kontainer polos. `Sample.xml` Omron memakai EMPAT kontainer untuk tiap kombinasi
`constant` × `retain` — jadi ini bentuk yang mereka niatkan.

Urutan anak `Variable` terikat `xsd:sequence`, dan urutannya TIDAK sama dengan urutan
kolom di tabel Studio:

```
Documentation  →  AddData  →  Type  →  Address
```

**Cuma `AllPrograms.xml` yang membawa tabelnya.** Bukan pilihan gaya: tabelnya baru lengkap
di titik itu. AT untuk `AL`/`MF` diklaim paling akhir, dan komen alarm station terakhir belum
ada sampai builder terakhir jalan. Berkas per-program yang dirender lebih dulu membawa versi
setengah jadi, dan dua berkas yang saling menimpa waktu di-import lebih buruk daripada satu
berkas yang benar. Berkas per-program tetap membawa daftar nama saja.

`prog()` menerima tiga bentuk `glob`: array objek (tabel penuh), array string (markup
`<Variable>` jadi, dipakai exporter reader yang tidak punya alamat maupun retain), dan
string (markup kontainer jadi, buat penyusun tabel sendiri).

**Komen per elemen array TIDAK bisa lewat import. Sudah dibuktikan, jangan diulang.**
`Sample.xml` memakai `<smcext:ElementComment>` dan XSD-nya menerimanya, tapi Studio
**membuang seluruh `smcext:VariableComment`** waktu import — komen elemen maupun komen
variabel. Diuji dengan tujuh varian sekaligus (`_Probe_GlobalVars.xml`, sudah dihapus):
lima bentuk `ElementComment` yang berbeda semuanya kosong, dan yang menutup perkara adalah
kontrolnya — varian yang memakai `VariableComment` TANPA `ElementComment` ikut kosong,
sementara varian `<Documentation>` biasa terisi. Jadi bukan bentuk `ElementComment`-nya yang
salah; jalur `AddData` untuk komen memang tidak dipakai.

Bandingkan: `AddData` yang LAIN jelas dipakai — `smcext:ConnectionPointInOrder` di rung dan
`smcext:DeviceInfo` di header. Yang diabaikan khusus `VariableComment`.

Konsekuensinya `ArrayComments.tsv` tetap satu-satunya jalan buat komen `AL[n]`/`MF[n]`,
ditempel setelah arraynya di-expand di Studio.

### Cara membuat probe yang menjawab

Berlaku untuk pertanyaan apa pun yang cuma bisa dijawab Studio. Empat aturannya, ketiganya
pernah dilanggar dan tiap pelanggaran memakan satu putaran:

1. **Semua tebakan dalam SATU berkas**, tiap tebakan pada objek bernama sendiri
   (`PV2_TANPADOC`, bukan "varian 2"). Namanya kebaca di Studio tanpa membuka berkasnya.
2. **Tiap varian beda SATU hal saja** dari tetangganya. Dua perbedaan sekaligus = jawaban
   yang tidak bisa dibaca.
3. **Sertakan kontrol yang PASTI jalan.** Kalau kontrolnya ikut gagal, berkasnya yang tidak
   ter-import dan hasil lainnya tidak berarti apa-apa.
4. **Objeknya harus DIPAKAI di ladder.** Variabel global yang tidak dirujuk rung manapun
   bisa hilang waktu import — probe-nya masuk, tabelnya kosong, dan yang tercatat jadi
   "bentuknya ditolak" padahal variabelnya tidak pernah ada.

## Instruksi di luar kontak/coil — FUN vs FB

Daftar lengkap 353 instruksi + kolom FUN/FB ada di
[docs/SYSMAC_INSTRUCTIONS.md](docs/SYSMAC_INSTRUCTIONS.md), ditarik dari manual
W560 dan dicocokkan ke project `.smc2` nyata. **Lihat tabel itu dulu sebelum
menulis blok baru.** Yang di bawah ini aturan yang tidak kelihatan dari tabelnya.

**FB punya nama instance, FUN tidak.** Itu pembeda pertama dan penyebab utama
`(DefinitionError)` waktu import:

| | contoh | `instanceName` | dideklarasi di tabel variabel |
|---|---|---|---|
| **FB** | `TON` `TOF` `CTU` `MC_*` `EC_*` | wajib | ya, bertipe FB-nya |
| **FUN** | `MOVE` `Inc` `=` `<` `Get1sClk` `ADD` | tidak boleh | tidak |

**Nama pin harus PERSIS sama dengan definisinya — termasuk yang tidak punya
nama.** Studio mencocokkan blok ke library lewat nama + susunan pin sekaligus.
Kalau satu pin salah nama atau kelebihan/kekurangan, hasilnya `(DefinitionError)`
tanpa penjelasan apa pun — bukan "pin X tidak dikenal".

Bentuk sebenarnya, dibaca dari `Prepare CE insert3.smc2` (project yang jalan di
mesin, jadi ini bukan tebakan):

| kelas | pin masuk | pin keluar |
|---|---|---|
| `MOVE` | `EN`, `In` | `ENO`, `Out` |
| `ADD` `SUB` `MUL` `DIV` (`+ - * /`) | `EN`, `In1`, `In2` | `ENO`, **pin hasil tanpa nama** |
| pembanding `=` `<>` `<` `<=` `>` `>=` | `EN`, `In1`, `In2` | **satu pin aliran daya tanpa nama — TIDAK ada ENO** |
| `Get1sClk` `Get10msClk` `Get100msClk` | `EN` | **satu pin tanpa nama — TIDAK ada ENO** |
| `Inc` `Dec` `Clear` | `EN` + `InOut` di `<InOutVariables>` | `ENO`, pin BOOL tanpa nama |
| `TON` (FB) | `In`, `PT` | `Q`, `ET` |

Tiga hal yang gampang salah di situ:

1. **Pembanding dan `Get**Clk` tidak punya `ENO`.** Meminta `ENO` = ditolak.
   Rung diteruskan lewat pin hasilnya, bukan lewat ENO.
2. **Pin `InOut` ditulis di `<InOutVariables>`**, bukan di daftar masuk/keluar.
   Laporan `--probe-fb` memang menampilkannya di kedua daftar — itu model internal
   Studio, bukan bentuk XML import. Lihat `Function0` di bagian XSD di atas.
3. **Project nyata memakai nama simbol** (`<`, `<=`, `<>`, `=`, `>=`), bukan
   `LT`/`LE`/`NE`/`EQ`/`GE`. Manual bilang dua-duanya sah; yang terbukti
   ter-import cuma yang simbol. Di XML `<` ditulis `&lt;`.

Awalan `@` = varian diferensiasi naik (`@Inc`, `@MOVE`) — instruksi yang sama,
cuma jalan di scan pertama saja.

**Yang belum terbukti tetap mati.** `ADV_OK` di `js/gen_all.js` menahan semua
blok di luar kontak/coil/TON. Menyalakannya butuh bukti import bersih, bukan
kecocokan dengan tabel di atas: `_Probe_Instructions.xml` di-import ke project
KOSONG, lalu dicatat varian mana yang tidak bertanda `(DefinitionError)` /
`(Import failed)`. Yang sudah lulus sejauh ini: **MOVE** (`EN`,`In` → `ENO`,`Out`).

## Peta alamat HMI — aturan yang tidak kelihatan dari kode

**Retain menyala untuk H dan D, mati untuk W.** H itu Holding: alarm yang hilang waktu
power cycle bukan alarm. D menampung angka yang diketik operator — target counter,
preset timer, hitungan berjalan; tanpa retain, setelan itu balik ke nol tiap listrik
mati dan mesin jalan dengan target 0 tanpa satu pun keluhan. W area kerja tombol/lampu,
ditulis ulang tiap scan, jadi retain di situ justru salah. `retainOf()` di `gen_all.js`.

**Bit dan angka di area TERPISAH.** Satu UDINT makan DUA word. Kalau blok angka ditaruh
di area yang sama dengan tombol, satu array counter menimpa 20 word tombol dan
tabrakannya tidak kelihatan — yang satu dibaca sebagai bit, yang satu sebagai angka.
Default: tombol/lampu di W, AL/MF di H, angka di D.

**Jatah alamat menyertakan spare (default 30%).** Dipaskan ke IO list hari ini, aktuator
pertama yang ditambah setelah mesin jalan mendorong alamat semua yang di belakangnya —
dan tiap screen NB yang sudah digambar ikut salah tunjuk. Lubangnya disisakan DI DALAM
jatah tiap station, jadi penambahan mengisi lubang, bukan menggeser station lain.

**Nama array mengikuti standar Denso, dibaca dari project mesin** (`Prepare CE insert3`,
`autowelding`): `PD071_SET1` target counter, `PD071_SET2` ambang peringatan, `PD071_CUR`
hitungan berjalan, `PD081_SET`/`PD081_CUR` timer, `PL71`/`PL72` lampu counter, `PL081`
lampu timer, `GCT`/`GTM` pemicu. Jangan dikarang nama baru — layar NB yang sudah ada
mencari nama itu.

**Counter dibatasi konstanta, bukan targetnya.** `PD071_CUR < UDINT#99999999`, dan lampu
UP yang menandai target tercapai. Dibatasi target, counter berhenti tepat di target dan
kelebihan produksi tidak terhitung. Dua project mesin sama-sama begitu.

**Timer: edge ada di kontak CLOCK, bukan di GTM.** GTM itu "timer ini sedang jalan"
(penahan); yang mencacah pulsa clock. Ketuker, timernya menghitung sekali seumur hidup —
dan itu tidak kelihatan sama sekali dari jumlah rung maupun dari hasil import.

**Kedua TSV itu berkas TEMPEL, bukan berkas baca.** `GlobalVariables.tsv` tanpa baris judul
(Studio menempelkannya jadi variabel bernama `Name` bertipe `Data type`) dan tanpa baris
elemen array (`AL[61]` baru bisa diisi SETELAH arraynya di-expand; ratusan baris itu bikin
blok variabel skalar tidak sejajar dengan yang kebuka di layar). Elemen punya berkasnya
sendiri, `ArrayComments.tsv`, urutannya persis urutan expand.

## MAIN — alasan di balik gerbang yang tidak kelihatan dari rungnya

**Angin punya DUA alarm.** `AL[3]` tekanan jatuh dan `AL[5]` pressure switch rusak. Yang
kedua bukan hiasan: switch yang mati nyangkut di posisi "angin ada" TIDAK PERNAH memicu
`AL[3]` — alarmnya diam selamanya dan mesin jalan tanpa penjaga tekanan. Detektornya
membandingkan switch dengan perintahnya, simetris dua arah (`MSTR_RDY`+tanpa angin,
tanpa `MSTR_RDY`+ada angin), lewat SATU timer `T_AIRPS` (3 detik). Tanpa timer, alarm
menyala tiap master di-ON — tangki sedang mengisi — dan operator belajar mengabaikannya.

**`AL[3]` digerbang `(LB009 · SAFE_CONF · LB019) + LB002`, bukan `LB001`.** Angin dinilai
HANYA saat angin memang seharusnya ada. Dengan `LB001` (jeda power-on) saja, E-stop ditekan
atau pintu safety dibuka pun tetap dinilai — padahal di situ anginnya memang SENGAJA dibuang.

**`LB019`, bukan kontak tombol E-stop.** Ini berlaku di dua tempat: gerbang `AL[3]` dan coil
`EMER_INTLK`. Tombolnya cuma SATU dari lima sebab grup emergency menyala. Dari
`NOT_EMG_STOP`, interlock lepas begitu tombol ditarik walau fuse masih putus atau safety
masih terbuka — itu bukan interlock, itu salinan tombol. `LB019` memuat `/AL[3]` di dalamnya
tapi itu bukan lingkaran: coil `LB019` jauh di bawah rung `AL[3]`, jadi yang terbaca hasil
scan sebelumnya.

**Tombol silence buzzer namanya `PB_ALM_RST`.** Tiga latch (`LB061`/`LB063`/`LB065`) semuanya
membungkam alarm, tidak pernah me-reset fault. `genname.js` memetakan keempat ejaan IO list
(`ALARM RESET`, `ALM RESET`, `FAULT RESET`, `FLT RESET`) ke nama itu.

## Membaca project Sysmac (.smc2) — `reader/`

Ada di [reader/](reader/) (dulu repo terpisah `Universal_Ladder`/`plc-reader`,
digabung balik supaya lingkarannya tertutup: **baca → sunting → import**).
Punya suite sendiri, jalankan terpisah:

```bash
cd reader && node tests/run.js     # 6 suite; build dulu kalau src/ berubah
cd reader && node build.js         # src/ + viewer/  ->  smc2-viewer.html
```

Membaca `.smc2` (container ZIP berisi XML) tanpa Sysmac Studio — pohon program,
rung, operand, cross-reference, tabel variabel — dan bisa **mengekspor rung jadi
XML yang bisa di-import balik** (`--xml`). Dokumentasi format hasil reverse
engineering ada di [reader/README.md](reader/README.md).

**Exporter memakai `js/lib.js` milik generator, bukan salinannya.** Di Node
lewat `new Function` (`reader/xml_out.js`, persis cara `scripts/core.js`); di
browser di-inline oleh `reader/build.js` sebagai namespace `SGLIB`. Jangan pernah
menyalin pembangun rung ke sisi reader: parser `.smc2` dulu ditulis dua kali dan
diam-diam drift, dan drift di sisi TULIS menghasilkan berkas yang ter-import
mulus tapi salah.

Konsekuensinya: **`js/lib.js` berubah → `cd reader && node build.js` juga.**
Kalau tidak, viewer mengekspor pakai bentuk XML yang lama sementara CLI pakai
yang baru. `reader/tests/build.test.js` menangkap ini (dia build ulang lalu
membandingkan), tapi cuma kalau suite reader ikut dijalankan.

`SGLIB` dibungkus IIFE, bukan ditempel polos — `lib.js` punya `function esc`
sendiri dan `reader/src/env.js` punya `const esc`; keduanya di satu lingkup bikin
seluruh halaman mati dengan "Identifier 'esc' has already been declared".

**Yang tidak eksak, ditolak — bukan ditebak.** `reader/src/net.js` menyusun
netlist dari koordinat + `VLs` (link vertikal), lalu memeriksa tiap simpul ada
penyetirnya dan cuma coil yang menyentuh rel kanan. Rung yang tidak lolos, dan
rung berblok fungsi, jadi **rung komentar** berisi alasan + logika aslinya —
tempatnya tetap ada, jadi nomor rung tidak bergeser dan lubangnya kelihatan di
layar Studio. Cakupan sekarang ~54% rung (sisanya blok fungsi, belum didukung).

**`--probe-fb` itu sumber kebenaran bentuk blok fungsi.** Dia mendaftar tiap
kotak fungsi di project nyata beserta pin-nya (`PF` = pin aliran daya, `PRM` =
parameter, `IO:true` = in-out) — bukan gambar, melainkan model internal Studio.
Sebelum menebak bentuk XML sebuah instruksi, jalankan ini dulu ke project yang
memang memakai instruksi itu:

```bash
cd reader && node cli.js "Prepare CE insert3.smc2" --probe-fb
```

`rungExpr()` di `src/ladder.js` itu hal LAIN: dia menebak bentuk rangkaian dari
koordinat saja dan menandai hasilnya `~`. Cukup untuk dibaca manusia, TIDAK boleh
dipakai untuk menulis program.

## Peta file

| File | Isi |
|---|---|
| `js/parse.js` `genname.js` `validate.js` `split.js` | tahap awal pipeline |
| `js/lib.js` | pembangun rung XML (Rung, series, latch, motionStep, judgeBranch) |
| `js/gen_all.js` | seluruh pembangkit program, ~1100 baris, inti proyek |
| `scripts/build_html.py` | template + seluruh UI editor, meng-inline `js/*.js` |
| `scripts/core.js` | runner pipeline headless (modul + CLI) |
| `scripts/test.js` | uji pipeline end-to-end |
| `tests/*.test.js` | harness per-area, jalan tanpa browser |
| `docs/SYSMAC_INSTRUCTIONS.md` | 353 instruksi + FUN/FB + pin, dari manual W560 |

## Cara harness UI bekerja

`tests/editor.test.js` dan `iogrid.test.js` **mengekstrak fungsi dari
`index.html`** dengan pencocokan kurung kurawal, lalu menjalankannya di Node
dengan stub seperlunya. Konsekuensinya:

- Menambah dependensi baru ke sebuah fungsi berarti menambahkannya ke daftar
  `names` di harness, kalau tidak muncul `ReferenceError`.
- `index.html` juga memuat `gen_all.js` sebagai string JSON. Kalau nama fungsi
  bentrok (`refBase` ada di dua tempat), `extract()` melewati versi yang
  tanda kutipnya ter-escape. Jangan hapus penjagaan itu.

## Kebiasaan yang terbukti berguna

Ketika sebuah tes gagal, **periksa dulu apakah tesnya yang salah.** Sepanjang
sesi ini beberapa "kegagalan" ternyata ekspektasi tes yang usang atau regex yang
keliru, bukan cacat produk — dan sebaliknya, satu kali gambar di kanvas berbohong
sementara ladder-nya benar. Buktikan dulu mana yang salah sebelum memperbaiki.
