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
node scripts/app.js                    # aplikasi lokal, 127.0.0.1:7654 (atau klik Susmax.cmd)
node scripts/nb_sync.js <smc2> <folderNB> [--rebuild] [--write]   # komen alarm .smc2 -> .nbp
node scripts/nb_apply.js <csv|json> <folderNB>          # lihat dulu, TIDAK menulis
node scripts/nb_apply.js <csv|json> <folderNB> --write  # tempel ke project NB, backup dulu
node scripts/smc2_diff.js LAMA.smc2 BARU.smc2           # apa yang berubah di Studio (hanya baca)
node scripts/smc2_rename.js x.smc2 LAMA=BARU [--write]   # ganti nama program (task ikut)
node scripts/smc2_section.js x.smc2 spec.json [--write] # tambah section ladder ke .smc2
node scripts/smc2_extract.js x.smc2 history/ --clean    # .smc2 -> teks yang kebaca `git diff`
node scripts/app.js --ws C:/kerja                      # aplikasi lokal + API, folder kerja disetel
node scripts/mcp.js --ws C:/kerja                      # server MCP, folder kerja yang sama
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

**Elemen ke-n dihitung dari BIT AT-nya, bukan dari word-nya saja.** Array kedua hampir tidak
pernah mulai di bit 0: di project mesin ini `MF` ber-AT `%H406.04`, tepat menyambung `AL` yang
berakhir di `406.03`. `nb_sync.js` sempat memakai word saja, jadi `MF[1]` jatuh di `406.00` -
90 alarm bergeser empat bit DAN menabrak alamat `AL` yang sah, dengan teks yang tetap benar di
layar. Sekarang alamat ganda menghentikan skrip, bukan cuma diperingatkan.

**Alarm dan Event Setting diisi dari sumber yang SAMA.** Satu komen elemen di `.smc2` jadi satu
baris di dua daftar itu. Kalau salah satunya kosong, `--rebuild` meminjam cetakan dari cadangan
`.nbp.*.bak` di folder yang sama - BUKAN dari daftar sebelah: `<EventObject>` punya `Condition`
dan `Function` yang menentukan kapan event tercatat, dan `<AlarmObject>` tidak punya keduanya.
NB-Designer memang bisa mengosongkan Event Setting sendiri waktu project disimpan (dia menulis
`<EventObjects/>`), jadi ini bukan kejadian sekali.

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

Di sisi BACA, komen elemen itu didaftar ke tabel simbol dengan nama yang dipakai rung -
`AL[3]`, bukan `AL` (`setSymbols` di `reader/src/symbols.js`). Salah kunci = rung yang memegang
`AL[3]` tergambar tanpa komentar sementara Studio menampilkannya, dan itu terbaca seperti
komennya memang tidak ada.

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

## Simulator NX lewat OPC UA — terbuka, sudah terbukti

Simulator Sysmac Studio bisa membuka OPC UA server: menu **Simulation → Use the OPC UA Server
for the simulator**, endpoint `opc.tcp://127.0.0.1:4840`. OPC UA itu standar terbuka, jadi
program NX yang sedang disimulasikan bisa disambungkan ke simulasi fisika di luar (Gazebo, web
sim) **tanpa reverse engineering apa pun**.

Klien ada di `tools/opcua/browse.js` — terpisah dari repo utama supaya 123 paket
`node_modules`-nya tidak masuk; generator tetap tanpa dependensi.

```bash
node tools/opcua/browse.js --anon --filter PB4        # daftar + nilainya
node tools/opcua/browse.js --anon --watch GSB000 LB400   # pantau perubahan
node tools/opcua/browse.js --anon --write PB411_1M=true  # tekan tombol dari luar
```

Empat hal yang masing-masing sempat memakan waktu, semuanya sudah dibuktikan di mesin ini:

| | |
|---|---|
| **Global variable ter-publish OTOMATIS** | Tidak perlu menyetel Network Publish satu-satu, dan generator TIDAK perlu menulis `networkPublish`. Path-nya `GlobalVars.<nama>` — `GlobalVars.GSB000`, `GlobalVars.PB411_1M` |
| **Jalankan simulasinya DULU** | Menu "Use the OPC UA Server for the simulator" abu-abu selama simulator belum jalan. Run (F5) dulu, baru pilihannya hidup |
| **NX1P2 BISA** | Sempat kucatat di sini bahwa OPC UA cuma ada di NX102 ke atas — **salah**, dan penyebab menu abu-abunya bukan model melainkan simulasi yang belum jalan. Tidak perlu mengganti device |
| **Centang `None` di Security policy, lalu Transfer to simulator** | Tanpa `None`, sambungan wajib Sign + sertifikat klien dipercaya lewat Certificate management. Yang ditolak karena sertifikat memberi pesan yang **terlihat seperti salah password** — itu yang bikin UaExpert kelihatan rusak |
| **Anonymous login = Permit** | Kalau Prohibit, pakai `--user <nama> --pass <sandi>`. Kredensial controller, jangan ditulis di repo |

Jebakan di sisi klien: `node-opcua` berhenti selamanya di *"Creating default certificate"*
kalau sertifikatnya dibiarkan implisit — dua kali 150 detik tanpa hasil. Beri
`OPCUACertificateManager` dengan `rootFolder` sendiri; kelasnya ada di paket
`node-opcua-certificate-manager`, **bukan** diekspor ulang oleh `node-opcua-client`.

Folder `tools/opcua/pki/` di-ignore: isinya private key. Pernah ikut ter-commit sekali.

Langkah berikutnya ada di [TODO.md](TODO.md) butir 3f — bridge OPC UA ke simulasi luar, mulai
dari SATU silinder: sensor dari sim ditulis ke `AS_*`, `SOL_*` dibaca balik buat menggerakkan
aktuatornya di sana.

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

**Menulis balik ke `.smc2` SUDAH TERBUKTI — tapi cuma untuk komen elemen.**
`scripts/smc2_comment.js` mengganti medan `EC=` di tabel variabel lalu mengemas ulang
containernya; hasilnya dibuka Sysmac Studio utuh dan komennya berubah. Itu menghapus tempel
terakhir (`ArrayComments.tsv`), yang tidak bisa lewat XML import karena Studio membuang
`smcext:VariableComment`.

Yang membuatnya aman, dan jangan dihilangkan: container baru **dibongkar ulang dan
dibandingkan entri per entri SEBELUM berkas aslinya disentuh**. ZIP rusak baru mengumumkan
diri waktu Studio menolak membuka project, dan saat itu berkasnya sudah tertimpa. Semua entri
lain (`.manifest`, `.oem`, `.log`, XML) dikemas ulang byte per byte.

**Nama program juga bisa ditulis — `scripts/smc2_rename.js`.** Kelas yang sama: teks di dalam
ZIP, rung tidak disentuh. Yang bikin ini beda dari mengganti komen: nama program TERIKAT di
beberapa tempat sekaligus, dan yang paling menentukan bukan pohon project.

| peran | di mana | kalau terlewat |
|---|---|---|
| pohon project | `.oem` `Entity type="Program"` `name=` + `DN=` | programnya hilang dari layar |
| simpul penugasan | `.oem` `Entity type="NexAssociatedProgram"` `name=` + `DN=` | tautan task putus |
| **penugasan task** | `<task>.xml` `<AssociatedProgramData ProgramName= InstanceName=>` | **program BERHENTI DIEKSEKUSI, Studio tidak mengeluh** |
| instance | `<id>.xml` `<PouInstanceName>` | tautan task putus |
| qualifier variabel | `<VariableName>NAMA.var</VariableName>` | data trace / kondisi monitor menunjuk yang tidak ada |
| cache build | `NexBuildVerifierGroup` `<a:Key>` | Studio rebuild — tidak berbahaya, tapi jadi tidak konsisten |

Karena itu penggantiannya dihitung PER PERAN dan tiap peran dilaporkan sendiri: peran yang
angkanya nol itu tanda ada tempat terlewat, bukan tanda tidak ada yang perlu diganti. Cari-ganti
buta memberi total besar yang menyenangkan sambil melewatkan satu peran — dan peran itu biasanya
penugasan task, satu-satunya yang kegagalannya tidak kelihatan dari mana pun.

`SequenceNumber` **tidak disentuh**. Nomor di nama program itu label, bukan urutan; menyamakan
keduanya berarti diam-diam menyusun ulang urutan jalan mesin. Di project `Ce Insert Track`
nomornya justru tidak searah dengan urutan eksekusi (`P010_Main` jalan sebelum `P002_Servo`) —
itu memang begitu, bukan kesalahan.

Penomoran yang dipakai = standar Denso ditambah satu konvensi yang TIDAK tertulis di dokumen
tapi konsisten di project-project nyata: **motion/servo selalu program 2, HMI selalu 3**.

```
P001_Initial   P002_Servo   P003_HMI   P010_Main   P011..P042 station   P700-P999 khas mesin
```

### SECTION BARU juga bisa ditulis langsung — `scripts/smc2_section.js`

Dibuktikan di Studio 19 Agustus 2026, lewat satu berkas probe berisi empat varian berdampingan.
Ini **menambah** section yang seluruh isinya kita susun sendiri — bukan menyunting rung yang
sudah ada, yang tetap terlarang karena reader cuma menerjemahkan ~54% rung dengan eksak.

**Akhiran baris WAJIB CRLF.** Ini penemuan yang membalik probe pertama, dan bentuk kegagalannya
paling menipu: berkas ladder yang berakhir `}\n` menghasilkan section yang **MUNCUL di Multiview
Explorer dengan rung KOSONG**, dan Studio mengeluh `No instruction in rung` — bukan "berkas
rusak". Varian LF dan CRLF diuji berdampingan, sisanya identik: yang CRLF terisi, yang LF kosong.
Tiap rung diakhiri CRLF, termasuk yang terakhir.

Dua hal lain yang ikut terjawab probe itu, dan dua-duanya menghemat tebakan:

| | |
|---|---|
| urutan entri di ZIP | **tidak berpengaruh**. Varian yang ditaruh sesudah `.oem` sama berhasilnya dengan yang sebelum |
| kotak inline ST (`__type:"IST"`) | **jalan**. Itu jalan keluar untuk yang di ladder butuh blok belum-terbukti — perbandingan `STRING`, misalnya |

Bentuk JSON rung-nya ditiru dari tulisan Studio sendiri, dan tiga sifatnya gampang salah:

```
Ix       penghitung GLOBAL satu rung: elemen dulu, lalu LRI, lalu RRI, lalu tiap VL
HL       pengisi kolom kosong di baris cabang - TIDAK ikut menghabiskan Ix
X, Y, Ix DIHILANGKAN kalau nilainya 0
```

`tests/smc2section.test.js` mengadu keluaran builder ke rung sungguhan dari project mesin
(`P011_ST1_Supply_Feeder/AutoRunning` rung 1) — sampai `VLs:[{Ix:9,X:3}]`.

**Nama section dibatasi Studio, dan pelanggarannya baru kelihatan setelah project dibuka:**
tidak boleh diawali garis bawah / angka / `P_`, tidak boleh diakhiri garis bawah, tidak boleh
dua garis bawah berturut-turut, maksimal 127 byte. Diperiksa sebelum menulis, bukan sesudah.

Satu section = tiga entity di `.oem` (`PouBody` + `SourceHolder` + `PouBodySourceHolder`, plus
satu `Inline/StructuredText` per kotak ST) dan dua berkas: `<PouBody-id>.xml` berisi rung, dan
`<PouBodySourceHolder-id>.xml` berisi artefak compile. Artefaknya ditulis versi paling tipis —
Studio membangunnya ulang waktu Build.

**Rung tetap TIDAK boleh ditulis.** Reader cuma menerjemahkan ~54% rung dengan eksak, dan rung
yang ditulis atas tebakan ter-import mulus lalu salah waktu mesin bergerak — kelas kegagalan
yang seluruh empat gerbang dibangun untuk menangkalnya. Itu butuh buktinya sendiri.

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

## Pindah laptop - yang perlu dan yang TIDAK perlu

```bash
git clone <repo>            # atau salin foldernya
node scripts/doctor.js      # periksa kesiapan mesin, sebelum bingung sendiri
python scripts/build_html.py
cd reader && node build.js && cd ..
node scripts/app.js --ws "<folder project>"
```

**Docker TIDAK dipakai, dan itu keputusan sadar.** Yang bikin repo ini butuh mesin Windows-nya
justru bagian yang paling dipakai:

| | |
|---|---|
| dialog pilih berkas | WinForms lewat PowerShell - tidak ada di container Linux |
| XSD resmi | milik Sysmac Studio yang terpasang di mesin (`C:\Program Files\OMRON\...`), tidak boleh disalin ke repo |
| project `.smc2` dan `.nbp` | ada di disk Windows; container butuh bind mount + terjemahan path, dan tiap path yang salah jadi berkas yang tidak ketemu |
| NB-Designer & Studio | aplikasi Windows yang memang harus dibuka orangnya |

Yang dibungkus Docker tinggal generator headless - bagian yang justru sudah tanpa dependensi dan
jalan di mana saja. Jadi Docker menambah lapisan tepat di tempat yang tidak bermasalah, dan
mematikan tepat di tempat yang bermasalah.

Yang IKUT pindah sendiri: riwayat project (`*-history/`) dan `.susmax-tracked.json` ada di dalam
folder project. Yang TIDAK ikut: folder kerja tersimpan (`~/.susmax/settings.json`) dan
pendaftaran MCP - dua-duanya setelan per-mesin, tinggal disetel ulang sekali.

`scripts/doctor.js` memeriksa yang di luar repo: Node >= 18 (DecompressionStream - pembaca
`.smc2` bergantung padanya), `git` di PATH, halaman yang sudah dibuild, plus yang opsional
(Python buat build ulang, PowerShell buat dialog, XSD Studio, CLI claude buat MCP). Yang gagal
di mesin baru hampir tidak pernah kodenya - selalu hal di luar repo, dan gejalanya menyesatkan.

## Menjalankan aplikasi lokal

```bash
node scripts/app.js                        # folder kerja = folder repo ini
node scripts/app.js --ws "C:/kerja/mesinA" # folder kerja = folder project
SUSMAX_WS=C:/kerja/mesinA node scripts/app.js
```

Atau klik dua kali `Susmax.cmd` (meneruskan argumen: `Susmax.cmd --ws "C:/kerja/mesinA"`).
Lalu buka <http://127.0.0.1:7654> - dari situ generator, pembaca `.smc2`, alat NB, dan
Edit assistance semuanya ketemu.

**DUA git, jangan tertukar:**

| | isinya | dibuat oleh |
|---|---|---|
| git repo INI | kode generator/reader/scripts | kamu, seperti biasa |
| git repo per PROJECT | riwayat `.smc2` satu mesin: berkas aslinya + teks ekstraknya | otomatis oleh `git/track`, di dalam folder kerja |

Yang kedua sengaja repo TERPISAH dan berada di folder project, bukan di dalam repo ini: riwayat
program mesin pelanggan bukan bagian dari kode alat, dan ukurannya megabyte per commit.
`git/track` menuntut folder riwayat jadi repo SENDIRI - lihat catatan di bawah soal home yang
ternyata sebuah repo git.

**Halaman menampilkan status server sendiri** (`/api/ping`). Ditanyakan ke servernya, BUKAN
ditebak dari `location.protocol`: halaman sering dibuka dari `file://` sementara servernya jalan,
dan tebakan dari protokol bikin alat yang siap dipakai kelihatan mati. `/api/ping` satu-satunya
yang boleh dipanggil lintas asal; sisanya menolak `Origin` asing - server lokal yang menerima
perintah dari halaman web mana pun itu lubang, bukan alat.

## Keadaan sekarang (sesi 18 Agustus 2026)

Aplikasi lokal sudah jadi jalan utama. Yang HARUS diingat sebelum menyentuh apa pun:

| | |
|---|---|
| server memuat kode SEKALI | ubah `scripts/*.js` -> **tutup jendela Susmax, jalankan lagi**. `/api/ping` melaporkan `stale:true` dan halaman menampilkan spanduk merah, tapi itu penanda - bukan pemuat ulang |
| port 7654 dipakai | jendela lama masih hidup. Pesannya menyebut tiga jalan keluar; jangan tambahkan retry otomatis |
| tes JANGAN menyentuh setelan asli | `SUSMAX_SETTINGS` dialihkan ke temp di `tests/api.test.js`. Sudah pernah kejadian: folder kerja penggunanya berubah jadi folder temp yang lalu dihapus |
| uji dengan SALINAN project | `git/track`, `nb/sync --write`, `git/restore` semuanya menulis. Uji di `scratchpad`, bukan di `C:/Users/denny/Downloads/testintegrate` |

Yang sudah terbukti jalan end-to-end (diuji di salinan project mesin):

```
project/scan  -> PLC + HMI dari satu folder
Studio simpan -> tercatat "otomatis: 2 program, 403 rung logika, 903 variabel, 425 komen alarm"
              -> HMI ditulis: 50 teks, 200 alamat (cadangan .bak dibuat)
git/restore   -> .smc2 kembali persis byte-nya
```

**Setelan pemantauan yang diganti WAJIB berlaku.** `watcher.mulai()` dulu menjawab "sudah
dipantau" dan tetap memakai callback lama, jadi mencentang "alarm ikut ditulis ke HMI" SESUDAH
pemantauan menyala tidak berpengaruh apa pun: centangnya menyala, pemantauannya hidup, dan tidak
ada yang menulis ke HMI - tanpa satu pun pesan galat. Sekarang `mulai()` mengganti `pesanFn`/
`catatFn` pemantau yang ada, dan fungsi itu dibaca dari state (bukan dipegang closure) supaya
yang baru benar-benar dipakai putaran berikutnya. Halaman juga tidak lagi menunggu tebakannya
sendiri soal "sedang dipantau atau tidak" - setelannya langsung dikirim.

## Satu FOLDER PROJECT, bukan daftar path

Halaman `/edit` meminta SATU folder: folder mesinnya. `.smc2` dan folder project NB-Designer
dicari di dalamnya (`project/scan`), dan pilihannya disimpan di `.susmax-tracked.json` DI DALAM
folder itu - jadi ikut pindah bersama project-nya.

Folder project SEKALIGUS folder kerja. Dua konsep terpisah ("folder kerja" dan "project") berarti
dua tempat yang bisa berbeda, dan yang terjadi: path relatif yang disimpan halaman menunjuk
berkas di folder yang lain, dengan pesan yang menyalahkan berkasnya.

Folder `*-history` DILEWATI waktu memindai. Di dalamnya ada salinan `.smc2` dan `.nbp`; kalau
ikut terpindai, yang dipantau bisa jadi salinan riwayatnya sendiri - dan suntingan di Studio
tidak pernah tercatat lagi.

**HMI ikut dicatat.** `git/track` menyalin `.nbp` ke riwayat sebagai `hmi.nbp` (XML polos, jadi
`git diff`-nya langsung kebaca). Tanpa itu, mengembalikan PLC ke versi kemarin meninggalkan HMI
di versi hari ini: alamat yang dipantaunya tidak lagi cocok, dan tidak ada yang memberi tahu.
Pemulihannya TERPISAH (`file: project.smc2` vs `hmi.nbp`) - yang salah biasanya cuma salah
satunya, dan mengembalikan dua-duanya membuang pekerjaan yang tidak ada hubungannya.

**Diff-nya dibaca di VS Code, bukan di halaman.** Tombol "Buka riwayat di VS Code"
(`open/vscode`) membuka folder riwayat; panel Source Control-nya memang dibikin buat itu.
Halaman ini tidak perlu jadi penampil git kedua yang lebih buruk - tabelnya cukup buat tahu ada
berapa versi dan mengembalikan salah satunya.

Halaman alat NB yang lama DIBUANG, `/tools` mengalihkan ke `/edit`. Dua halaman yang meminta
project yang sama dipilih ulang itu justru masalah yang mau dihilangkan.

## Pantau otomatis: dipicu simpanan Studio, bukan penjadwal

`watch/start` memantau berkas `.smc2` dan mencatat versinya sendiri tiap kali Studio menyimpan.
Empat keputusan yang menentukan catatannya benar:

| | |
|---|---|
| POLLING stat, bukan `fs.watch` | Studio menulis berkas sementara lalu me-rename. Penonton yang menempel ke inode berhenti dapat kabar setelah rename pertama, dan berhentinya DIAM |
| tunggu berkasnya DIAM 3 detik | menyimpan project 5 MB butuh waktu; commit di tengah tulisan menyimpan ZIP separuh, dan itu baru ketahuan waktu dibutuhkan |
| `readProject` DULU sebelum commit | kalau tidak bisa dibuka, berkasnya belum utuh - jangan dicatat sebagai versi yang sah |
| catat keadaan SEBELUM disunting saat pemantauan dimulai | versi itulah yang dicari waktu suntingannya salah; menunggu simpanan pertama berarti versi itu tidak pernah ada di riwayat |

Judul commit DIHITUNG dari diff terhadap versi sebelumnya, bukan "auto-save" - riwayat berisi
seratus baris "auto-save" tidak menjawab satu pun pertanyaan yang bikin orang membukanya.

**Judul menyusul pakai `git notes`, BUKAN `commit --amend`.** Amend mengganti hash, dan hash yang
berubah bikin daftar riwayat yang sedang dilihat orang menunjuk commit yang sudah tidak ada -
termasuk tombol "Kembalikan" di sebelahnya.

Sinkron NB berkelanjutan menumpang pemicu yang SAMA (`watch/start` dengan `nb`). Dua pemantau
untuk satu berkas pasti berbeda pendapat soal "sudah selesai ditulis belum", dan yang satu akan
membaca project yang separuh.

## Dialog pilih berkas dibuka SERVER

**Dialognya butuh jendela pemilik yang BENAR-BENAR DITAMPILKAN.** `ShowDialog(New-Object Form)`
memakai form tanpa handle jendela - itu bukan pemilik yang sah, dialognya tidak muncul sama
sekali, dan dari halaman yang kelihatan cuma "menunggu dialog..." selamanya. Form 1x1 ber-TopMost
di-`Show()` dulu, lalu ditutup lagi (jendela yang tertinggal menahan proses PowerShell-nya hidup).

**`claude` TIDAK boleh dijalankan lewat `shell: true` maupun sebagai `.cmd`.** Yang pertama
memunculkan DEP0190 - argumen tidak di-escape, cuma disambung; pesan obrolan datang dari halaman,
dan pesan yang memuat `&` di jalur shell itu jalan masuk buat menjalankan perintah lain. Yang
kedua ditolak Node versi baru (EINVAL), justru karena alasan yang sama. Yang dipakai
`bin/claude.exe` milik paketnya, dicari sekali lalu diingat.

`<input type="file">` tidak pernah memberi path lengkap - itu batas keamanan browser, bukan
sesuatu yang bisa disiasati. Yang tersisa cuma menyalin path dengan tangan, dan itu jalur paling
sering salah ketik di seluruh alat ini. `pick/file` dan `pick/folder` membuka dialog Windows lewat
PowerShell `-STA` (WinForms menolak tampil di MTA, dan penolakannya berupa proses yang selesai
tanpa hasil - tidak bisa dibedakan dari "menekan Cancel"). `TopMost` wajib: tanpa itu dialognya
muncul di BELAKANG browser dan yang kelihatan cuma halaman yang menggantung.

## AI dikerjakan dari TERMINAL, bukan dari kotak chat di halaman

Kotak chat di halaman sempat ada (`chat/ask`, jembatan ke `claude -p`) lalu **dicabut**. Tiga
alasannya, dan ketiganya tidak bisa diperbaiki dengan menambah tombol:

1. tidak bisa ganti model, tidak ada konsol penuh, tidak ada riwayat yang bisa dibaca ulang
2. konteksnya nyasar - `claude -p` dengan `cwd` folder kerja ikut membaca riwayat git folder
   induk, jadi jawabannya menyebut project lain yang kebetulan ada di repo home
3. satu kotak teks tidak bisa menampilkan apa yang sedang dikerjakan alatnya

Gantinya: terminal memakai server MCP yang sama dengan halaman.

```bash
claude mcp add susmax -e SUSMAX_WS=<folder project> -- node "<repo>/scripts/mcp.js"
```

**Folder kerjanya lewat `-e SUSMAX_WS`, BUKAN `--ws`.** `claude mcp add` ikut mem-parse flag
sesudah `--`, jadi `--ws` ditolaknya duluan (`error: unknown option '--ws'`) dan tidak pernah
sampai ke skripnya. `--ws` tetap jalan kalau `mcp.js` dipanggil langsung dari terminal.

Alat yang dipanggilnya PERSIS sama dengan tombol di halaman (`watch_start`, `diff_smc2`,
`restore_smc2`, `nb_sync`, ...) karena dua-duanya lewat `scripts/api.js`. Itu yang membuat hasil
lewat terminal dan lewat halaman tidak bisa berbeda.


## Aplikasi lokal: server, folder kerja, dan riwayat git

Alat-alat repo ini bukan lagi halaman yang menunggu berkasnya di-drag. `scripts/app.js` melayani
semuanya dan punya API yang dipakai halaman MAUPUN MCP:

| | |
|---|---|
| `scripts/ws.js` | folder kerja + `amanPath()` - satu-satunya tempat baca/tulis diizinkan |
| `scripts/api.js` | `fs/*`, `smc2/*`, `git/*` - satu modul, dipakai dua jalur masuk |
| `scripts/edit_page.js` | halaman `/edit`: pantau otomatis, riwayat, pemulihan, panel tanya AI |
| `scripts/watcher.js` | pemantau simpanan Studio (polling + tunggu diam + buka dulu) |
| `scripts/pick.js` | dialog pilih berkas/folder Windows, dibuka server |
| `nb/sync`, `nb/alarm` | alat NB-Designer ikut di API dan MCP, bukan cuma tombol di `/tools` |
| `scripts/mcp.js` | 13 alat MCP; yang berkas/smc2/git disalurkan ke `api.js` yang sama |

**Aturan lama "AI tidak boleh menyentuh XML" SUDAH DICABUT** atas permintaan pemilik repo. AI
boleh membaca dan menulis berkas apa pun - XML, `.smc2` - selama di dalam folder kerja.

Yang menggantikannya jaring pengaman, bukan larangan:

1. `track_smc2` mencatat versi sekarang SEBELUM apa pun diubah - berikut berkas `.smc2`-nya
   sendiri, bukan cuma teks ekstraknya.
2. `restore_smc2` mengembalikannya PERSIS byte-nya.
3. Semua tulis dicadangkan ke `.bak` bertanggal yang tidak pernah menimpa cadangan sebelumnya.

Peringatannya tetap berlaku dan tetap ditulis di `mcp.js`: ladder yang salah tetap **ter-import
bersih dan salah waktu mesin bergerak**, dan empat gerbang memeriksa BENTUK, bukan maksud. Bedanya
sekarang kesalahan itu bisa dibatalkan, bukan dicegah.

**`git/track` WAJIB memakai repo SENDIRI, bukan repo yang kebetulan ada di atasnya.** Ini sudah
kejadian di mesin ini: `C:/Users/denny` ternyata sebuah repo git, jadi folder riwayat di bawah
home menampilkan riwayat home dan `git add` menyentuh index-nya. Pemeriksaannya bukan
"apakah di dalam work tree" melainkan "`rev-parse --show-toplevel` PERSIS folder ini".

**Kurungan folder kerja diperiksa SETELAH `resolve`, bukan dengan menyaring `..` di teksnya.**
Penyaringan teks selalu bisa dilewati (`..%2f`, symlink); hasil resolve tidak bisa berbohong soal
di mana berkasnya benar-benar berada. `realpath` dipakai kalau berkasnya ada - symlink di dalam
root yang menunjuk keluar itu jalan keluar yang paling gampang terlewat.


## Undo/redo editor: snapshot, dan penjaga yang WAJIB ada

`checkpoint()` menyimpan snapshot SELURUH state editor lalu membandingkannya dengan yang terakhir
dicatat; kalau sama, tidak mencatat apa-apa. Itu sebabnya titik pemanggilannya tidak perlu
lengkap - panggilan berlebih no-op, yang terlewat cuma menggabung langkah. Undo yang menyusun
kebalikan tiap operasi TIDAK dipakai: satu jalur mutasi yang terlewat di situ menghasilkan graph
tidak konsisten tanpa tanda apa pun.

**`histRestoring` jangan dihapus.** `histApply()` memanggil `regenerate()`, dan `regenerate()`
memanggil `checkpoint()`. Tanpa penjaga itu, undo mencatat dirinya sendiri sebagai perubahan baru:
riwayatnya tumbuh tiap kali di-undo dan Ctrl+Z tidak pernah sampai ke awal. Bentuk kegagalannya
bukan tes merah melainkan tes yang MENGGANTUNG (`while (undo())` tidak pernah habis) - itu yang
terjadi waktu ditulis.

## Tiga halaman, satu jalan masuk: home.html

| berkas | isi | dibangun oleh |
|---|---|---|
| `home.html` | halaman UTAMA - daftar seluruh alat repo | `scripts/build_html.py` |
| `index.html` | generator, dengan navigasi sampingnya sendiri | `scripts/build_html.py` |
| `reader/smc2-viewer.html` | pembaca `.smc2` | `cd reader && node build.js` |

`scripts/app.js` melayani `/` = `home.html`, `/index.html` = generator, `/tools` = halaman alat NB.
Kartu alat cuma ada di SATU tempat (`TOOLS_CARDS` di `build_html.py`); disalin ke dua halaman,
yang satu selalu ketinggalan dan menampilkan perintah yang sudah pindah.

Navigasi samping generator hilang total di bawah 1100px - sekarang bersembunyi di balik tombol
`#navToggle`, bukan `display:none`. Nav yang lenyap tanpa jejak terbaca seperti fitur rusak.

## Pembaca `.smc2`: gambar ladder punya batas ANGKA, bukan selera

`src/ladder.js` menggambar rung. Tiga angka di `LAD` tidak boleh diubah tanpa menghitung ulang,
dan ketiganya sudah pernah salah:

| | |
|---|---|
| `RH` >= 73 | nama boleh 2 baris di ATAS simbol (18+11), komentar 3 baris di BAWAH (22+11+11). Di bawah 73, komentar rung ini bertumpuk dengan nama rung berikutnya |
| minimum kolom = 2 | dulu 5, jadi rung berisi dua kontak pun memaksa rel kanan ke ~1000px dan coil-nya jatuh di luar layar |
| `railL` ikut operand kiri blok fungsi | operand pin masukan ditulis di LUAR kotak, ke kiri. Tanpa ruang tambahan, teksnya jatuh di koordinat NEGATIF - di luar viewBox dan terpotong, dan yang kelihatan cuma ekornya |

Tinggi rung ikut kotak blok fungsi (`HDR + pin*PINH`), bukan tetap - instruksi berpin banyak
(`AryByteTo`: In/Size/Order/OutVal) lebih tinggi dari satu baris ladder dan pin bawahnya terpotong
rung berikutnya.

**Studio MENGHILANGKAN `X`/`Y` yang nilainya 0.** `{"Ix":9,"X":3}` itu palang di kolom 3 baris 0.
Menuntut kedua medan ada bikin palang baris pertama terbuang diam-diam, dan yang tersisa cuma
palang paling kanan - cabangnya tergambar jadi satu kotak besar sampai ujung rung. Aturan ini
berlaku untuk elemen juga: elemen di kolom 0 tidak punya `X`.

**Satu baris bisa punya BEBERAPA potongan yang tidak bersambung** - seal di kolom 0-2 dan kontak
cabang OR di kolom 4, di baris yang sama. Diambil min-max, dua potongan itu jadi satu kabel
panjang melintasi ruang kosong: kabel yang di Studio tidak ada, dan yang membacanya mengira dua
cabang itu satu jalur. Tiap potongan digambar sendiri, dari pembukanya (rel kalau mulai kolom 0,
kalau tidak palang di kolom itu) sampai tepi kiri kolom berikutnya.

**Panjang kabel baris cabang ditentukan `HLink`, bukan palang yang melintasinya.** Studio mengisi
kolom kosong sebuah baris dengan elemen `HLink` (tanpa nama, jadi tidak digambar) - posisinya yang
menyatakan sampai kolom mana kabelnya nyambung. Palang yang menyambung baris 0-2 LEWAT DI ATAS
baris 1; dianggap batas kanan baris 1, cabang pendek tergambar sampai ujung rung.

**Palang cabang digambar dari `VLs`, bukan ditebak.** `.smc2` Studio >= 1.66 membawa daftar ruas
vertikal: satu ruas menyambung baris Y dan Y+1 di TEPI KIRI kolom X. Itu susunan yang sebenarnya.
Yang ditebak dari koordinat menaruh titik gabung di kolom yang salah - gambarnya tetap tampak
wajar, cuma menceritakan rangkaian LAIN dari yang dijalankan mesin. Heuristik lama tetap ada buat
berkas Studio <= 1.56 yang memang tidak menyimpan VLs; jangan dihapus.

**Studio cuma menyimpan palang PENUTUP cabang.** Pembukanya rel kiri itu sendiri - kedua baris
berangkat dari rel. Kabel baris cabang karena itu harus dimulai dari `railL`, bukan `colX(0)`:
selisih 12px-nya bikin cabang tergambar menggantung, seolah tidak tersambung ke mana-mana.

**Lebar kolom dihitung PER KOLOM.** Kolom berisi blok fungsi butuh ruang buat kotak + operand pin
di kiri dan kanan; kolom kontak tidak. Satu lebar untuk seluruh rung bikin satu `TON` melebarkan
kolom kontaknya juga - rung 4 kolom jadi ~760px dan butuh gulir mendatar tanpa alasan. Lebar
kotaknya sendiri DIBATASI terpisah (`fbW`), tidak lagi `CW - 8`: kalau ikut lebar kolom,
melebarkan kolom ikut melebarkan kotak dan ruang operand tidak pernah bertambah - itu yang bikin
`AIR SOURCE CONF` dan `T#3S` tertumpuk jadi `AIR SOURCE CON#3S`.

**Nama instance FB ditulis di atas kotak** (`LT012` di atas `TON`), seperti Studio. Tanpa itu dua
timer berbeda tergambar sama persis.

**Komentar operand punya DUA tingkat, dan yang kedua gampang terlupa.** `cmtOf()` di
`reader/src/symbols.js`: komen per ELEMEN (`AL[3]`, medan `EC=`) menang; kalau tidak ada, dipakai
komen ARRAY-nya (`PL032` → semua `PL032[n]`), persis seperti yang ditampilkan Studio. Tanpa
tingkat kedua, seluruh rung lampu/tombol tergambar tanpa komentar dan terbaca seperti project
yang memang tidak berkomentar. Arraynya JANGAN di-expand ke tabel simbol - ada array 4000 elemen
di project nyata.

**Komentar dipatah maksimal 4 baris** (`CMT_LN`). Dulu 3, dan komentar Denso rutin sepanjang
"Auto start condition indication, page 2": yang hilang justru penunjuk halamannya, tanpa tanda
apa pun - dua lampu yang bedanya cuma nomor halaman terbaca sama persis. `RH` ikut naik ke 88
karena itu.

**Warna operand itu INFORMASI, bukan hiasan** - dan tiga-tiganya harus ikut ke elemen array:

| tampilan | artinya |
|---|---|
| hitam | variabel lokal program itu |
| ungu | variabel global |
| merah + stabilo | punya AT - dipetakan ke alamat memori/IO, jadi dibaca/ditulis dari luar program (HMI, unit IO) |

`isGlobal()` dan `addrOf()` di `symbols.js` MEWARISKAN dari nama array: `PL031[2]` ikut `PL031`.
Tanpa pewarisan, operand yang dibaca HMI tergambar hitam seolah bit internal program itu sendiri.
Stabilo digambar sebagai `<rect class="hl">` sendiri - SVG tidak punya background buat teks.

**Operand di PIN blok fungsi juga sasaran klik**, bukan cuma kotaknya. Justru operand di pin yang
paling sering ditanya ("angka ini ditulis siapa?"). Konstanta (`T#3S`, `UINT#44`, angka) dilewati:
itu nilai, bukan variabel, dan silang-rujuknya selalu kosong - dibuat bisa diklik cuma
menghasilkan panel kosong yang terbaca seperti fitur rusak.

**Sasaran klik itu `<rect class="hit">` transparan seukuran sel, bukan teks namanya.**
`fill:transparent`, BUKAN `fill:none` - yang kedua tidak menerima klik sama sekali di SVG, jadi
kotaknya ada tapi tidak pernah kena. Tanpa kotak itu yang bisa diklik cuma garis setebal 1,6px.

Tab Rung disusun seperti Studio: pohon project (bisa disembunyikan), SATU section sekali jalan,
satu scrollbar mendatar di bawah (`.srungs{overflow:auto}` + `.rung{width:max-content}` - tanpa
yang kedua rung lebar cuma meluber tanpa scrollbar dan sisi kanannya tidak bisa dicapai), dan dok
Cross Reference yang tiap barisnya melompat ke program/section/rung-nya.

## Membandingkan dua .smc2 - `reader/diff.js`

`node scripts/smc2_diff.js LAMA.smc2 BARU.smc2` (hanya baca; `--brief` = satu baris, `--json`
= terstruktur). Yang dipisah dengan sengaja, karena akibatnya beda jauh:

| kelas | artinya |
|---|---|
| logika | susunan elemen rung berubah - mesin bergerak lain |
| tata letak | cuma koordinat/komentar rung - tidak ada akibat runtime |
| alamat | AT bergeser, atau nomor alarm pindah - **NB menunjuk bit lain, tanpa satu pun keluhan** |

Pemisahan itu bukan hiasan: kalau rung yang cuma digeser di kanvas ikut dihitung perubahan
logika, tiap kali orang merapikan tata letak seluruh section tampak berubah dan laporannya
berhenti dibaca - lalu perubahan yang sungguhan tenggelam di dalamnya.

Alarm yang PINDAH NOMOR dilaporkan terpisah dari yang teksnya disunting, dan cuma kalau
pindahannya tidak ambigu (satu kandidat). Nomor alarm tercetak di layar NB dan lembar
troubleshooting; yang bergeser membuat semuanya salah tunjuk sekaligus.

## `.smc2` supaya `git diff`-nya kebaca - `scripts/smc2_extract.js`

`.smc2` itu ZIP; di-commit apa adanya git cuma bilang "binary files differ". Skrip ini membongkar
isinya jadi teks: satu berkas per section, plus `program.txt`, `variables.tsv`, dan
`arraycomments.tsv`. Commit folder itu DI SAMPING `.smc2`-nya.

Tiga keputusan bentuknya, dan ketiganya menentukan riwayatnya berguna atau tidak:

| | |
|---|---|
| satu berkas per section | satu berkas raksasa bikin tiap perubahan kecil tampil sebagai diff panjang, dan yang berubah tenggelam |
| urutan dipatok (baris, kolom) | ikut urutan simpan Studio = menyimpan ulang tanpa mengubah apa pun sudah menghasilkan diff palsu, dan riwayat penuh diff palsu berhenti dibaca |
| koordinat TIDAK ikut | menggeser kotak di kanvas bukan perubahan program. Beda tata letak ada di `smc2_diff.js`, yang memang memisahkannya |

Flag yang mengubah ARTI rung (NC, Set/Reset, edge) WAJIB ikut tertulis. Yang terlewat bikin dua
program berbeda menghasilkan teks yang sama - diff bersih, mesin bergerak lain.
`tests/smc2extract.test.js` menjaga itu, plus sifat yang paling menentukan: **jalan dua kali harus
menghasilkan berkas yang sama persis.**

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
| `scripts/nb_sync.js` | komen alarm `.smc2` -> `.nbp`, Alarm + Event Setting |
| `scripts/nb_apply.js` `nb_common.js` | menyiapkan AlarmLib.csv, pencari project NB |
| `scripts/smc2_comment.js` `smc2_write.js` | menulis balik komen elemen ke `.smc2` |
| `scripts/smc2_rename.js` | ganti nama program di `.smc2` - tujuh peran sekaligus, termasuk penugasan task |
| `scripts/smc2_section.js` | tambah section ladder ke `.smc2` - CRLF wajib, inline ST didukung |
| `scripts/smc2_diff.js` `reader/diff.js` | bandingkan dua `.smc2`, hanya baca |
| `scripts/smc2_extract.js` | `.smc2` -> teks deterministik buat di-commit |
| `scripts/mcp.js` | server MCP: 13 alat (generator + berkas + smc2 + git) |
| `scripts/ws.js` `api.js` | folder kerja + API bersama halaman dan MCP |
| `scripts/edit_page.js` | halaman `/edit`: catat, lihat riwayat, kembalikan |
| `scripts/app.js` + `Susmax.cmd` | aplikasi lokal 127.0.0.1, membungkus skrip di atas |

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
