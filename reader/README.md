# plc-reader

Membaca program PLC dari file project-nya langsung, tanpa membuka software
vendornya. Saat ini mendukung **Omron Sysmac Studio (`.smc2`)**.

Sysmac Studio bisa meng-*import* XML tapi **tidak bisa meng-export**-nya. Jadi
sekilas program yang sudah jadi seperti tidak bisa dibaca dari luar. Ternyata
bisa: `.smc2` itu container ZIP berisi XML, dan isinya tetap terbaca.

> Dulu repo tersendiri (`Universal_Ladder`), sekarang bagian dari repo
> [Susmax program generator](../README.md) — supaya lingkarannya tertutup:
> **baca program yang ada → sunting → import balik**. Pembangun XML-nya dipakai
> BERSAMA generator (`js/lib.js`), bukan disalin.

## Untuk apa

**Bertanya ke AI sebelum memodifikasi program orang lain.** Perintah `--llm`
mengekstrak SELURUH konteks jadi satu berkas Markdown: logika tiap rung dalam
bentuk ekspresi boolean, komentar rung, arti tiap bit, dan silang-rujuk siapa
menulis siapa membaca. Berkas itu tinggal disuap ke LLM.

```
$ node cli.js project.smc2 --llm program.md
WROTE program.md  (13703 baris)
```

Isinya seperti ini — ladder yang sudah jadi kalimat logika, lengkap dengan arti
tiap bit yang dipakai:

```
**12. Master ON confirmation**
(PB013_003 OR P_First_Run) AND /GB000[100]  ->  GB000[100]
- `PB013_003` PB Master ON [IOBus://unit#2/Input Bit 03]
- `P_First_Run` First scan after RUN
```

**Memahami program orang lain tanpa berhari-hari.** Pertanyaan pertama yang
selalu muncul — *"bit ini siapa yang menyalakan?"* — dijawab satu perintah:

```
$ node cli.js project.smc2 --xref MASTER_READY

MASTER_READY                 1    44  Master ON Confirmation
        TULIS  P000_Main/Device_Input#6
        baca   P000_Main/Timers#2
        baca   P000_Main/Fault#20
        ...
```

**Memetakan program jadi graf**, supaya alur sinyal antar program dan section
kelihatan tanpa membuka ladder-nya:

```
$ node cli.js project.smc2 --graph graph.json
WROTE graph.json  (2586 node, 6396 edge)
```

**Audit standar penamaan** pada program yang datang dari vendor, tanpa membuka
satu per satu di Studio.

**Menarik IO list dari mesin lama** untuk mesin copy atau retrofit — Studio
versi baru menyimpan tabel variabel lengkap dengan alamat fisik dan komentar.

## Rekonstruksi logika rung

Format Studio ≥ 1.66 menyimpan posisi grid tiap elemen (`X` kolom, `Y` baris),
jadi seri dan paralel bisa disusun ulang tanpa menelusuri sambungan:

- satu baris, kolom menaik → seri (`AND`)
- baris > 0 yang menutupi rentang kolom yang sama → cabang paralel (`OR`)
- `/BIT` = kontak normally-closed

Pada project sungguhan yang diuji, **87–91% rung** terekonstruksi tepat (1413
rung dan 694 rung). Sisanya cabang bersarang yang disederhanakan jadi satu
tingkat — dan **selalu ditandai `~`**, supaya tidak ada yang mengira presisi
penuh padahal bukan. Ini penting: ekspresi yang salah susun tetap terlihat masuk
akal, dan itulah yang berbahaya kalau dipercaya mentah-mentah oleh engineer
maupun LLM.

## Ekspor balik: `.smc2` → XML yang bisa di-import

```
$ node cli.js project.smc2 --xml out/
WROTE 10 berkas ke out/

PROGRAM / SECTION                            RUNG  EKSAK  LUBANG
P000_Main                                     321    260      61
    Device_Input                               25     25       0
    Timers                                      7      0       7
...
1410 dari 2276 rung diekspor UTUH (61.9%).
```

Ini yang menutup lingkarannya. Studio cuma punya import, jadi program yang sudah
jadi selama ini satu arah saja. Sekarang rung-nya bisa dikeluarkan lagi dalam
bentuk yang Studio terima — buat mesin copy, retrofit, atau menaruh program lama
berdampingan dengan hasil generator.

### Topologinya EKSAK, bukan tebakan

Bagian yang membaca (`rungExpr`) menebak seri/paralel dari koordinat saja dan
menandai hasilnya `~`. Tebakan itu cukup untuk dibaca manusia, tapi **tidak boleh
dipakai untuk menulis program**: rangkaian yang salah susun tetap ter-import
tanpa keluhan, dan mesinnya yang salah jalan.

Untungnya tidak perlu menebak. Format JSON menyimpan link vertikalnya sendiri di
`VLs`, dan itu topologi paralel yang sebenarnya:

```
{"Ix":9,"X":2}          palang di TEPI KIRI kolom 2, menyambung baris 0 & 1
{"Ix":9,"X":2,"Y":1}    ruas berikutnya palang yang SAMA (Ix sama), baris 1 & 2
```

Jadi rung dimodelkan sebagai rangkaian listrik biasa (`src/net.js`): titik simpul
di tiap batas kolom, elemen sebagai komponen antar titik, `HL` sebagai kawat
lurus, `VL` sebagai palang tegak, rel kiri dan kanan masing-masing satu batang.
Semuanya digabung union-find, lalu **diperiksa**: tiap masukan harus ada yang
menyetir, cuma coil yang boleh menyentuh rel kanan, dan tidak boleh ada elemen
yang terhubung singkat.

Diuji pada **5 project sungguhan, 4192 rung** kontak/coil: semuanya lolos
pemeriksaan itu, **nol penolakan topologi**. Lalu XML hasilnya dibaca BALIK dan
ditelusuri dari tiap coil sampai rel kiri — 1547 coil, nol sambungan menggantung.

### Yang belum diekspor, dan kenapa dibiarkan berlubang

Cuma rung murni **kontak / coil / link** yang ditulis — sekitar **54%** rung pada
project sungguhan. Sisanya memuat blok fungsi (`MOVE`, `TON`, pembanding, FB
motion), ST sisipan, atau jump; bentuk XML tiap instruksi harus diverifikasi lewat
import sungguhan dulu, dan menebaknya menghasilkan berkas yang ter-import mulus
tapi jalannya lain.

Rung yang dilewati **tidak dihapus diam-diam**. Tempatnya tetap ada sebagai rung
berisi komentar yang menuliskan alasan dan logika aslinya:

```
[TIDAK DIEKSPOR: blok fungsi / ST sisipan / jump] ~GSB000 AND TON()  ->  PWR_ON
```

Jadi nomor rung tidak bergeser dan lubangnya kelihatan di layar Studio. Berkas
yang rung-nya diam-diam hilang jauh lebih berbahaya: yang hilang tidak kelihatan,
yang berlubang kelihatan.

Yang juga ditolak, dengan alasan yang sama: **coil Set/Reset** dan **kontak edge
di titik gabungan**.

Variabel yang dipakai diambil dari tabel global project lengkap dengan tipe dan
komentarnya. Operand yang menunjuk bagian struct/array tapi variabel dasarnya
tidak ada di tabel **dibiarkan tanpa deklarasi** dan dilaporkan — Studio akan
menolaknya waktu import, dan penolakan yang berisik jauh lebih baik daripada
deklarasi tebakan yang lolos diam-diam dengan tipe salah.

> **Sebelum dipakai:** import ke project KOSONG dulu, lalu bandingkan rung-nya
> dengan viewer sebelah-menyebelah. Ini hasil rekonstruksi, bukan export resmi
> Omron.

## Rekonstruksi flowchart urutan gerakan

`--flowchart` mengenali pola motion step di section AutoRunning dan menyusunnya
jadi `motionSequences` JSON — format yang sama dengan editor flowchart generator,
jadi bisa langsung diimpor.

```
$ node cli.js project.smc2 --flowchart motion.json

SECTION                                   RUNG  STEP BERANTAI TAK TERPETAKAN
P011_WIP_Transfer/AutoRunning               28     4      2/4    24
P012_ATS3_Unit/Auto_Running                148    46     8/46   102

50 langkah gerakan terpetakan, 10 di antaranya berhasil dirantai.
```

Pola yang dikenali:

```
x0y0 prevBit -- x1y0 /confirm ----------> Coil cmd
                x1y1 sol - x2y1 lsc ----> Coil confirm
                x1y2 confirm (seal)
```

Pembedanya dari rung berkoil-dua yang lain — mis. mutex pemilih varian, yang juga
punya dua coil dan sama-sama menyeal diri — adalah **hanya satu coil yang di-gate
kontak NC**. Pada mutex keduanya saling mengunci, dan rung seperti itu memang
bukan langkah gerakan. Ditolak, bukan dipaksakan masuk.

### Memisahkan varian urutan

Satu section `AutoRunning` sering memuat BEBERAPA urutan yang dipilih lewat bit
syarat — buffering tipe 1, discharging tipe 1, dan seterusnya. Digabung jadi satu,
dua urutan yang tidak pernah jalan bersamaan terbaca seperti satu alur panjang.

Pemisahannya tidak menebak dari urutan nomor LB, tapi **menelusuri siapa yang
menyalakan bit awal tiap langkah**:

```
Condition:    LB3113 ──┤├──────────────( LB300 )      bit syarat
AutoRunning:  LB400 ─┤├─ LB300 ─┤├─ ... ( LB401 )     gerbang varian
              LB401 ─┤├─ /LB411 ────── ( LB410 )      langkah 1
```

`LB401` dinyalakan `LB300` → semua langkah yang berangkat dari `LB401` masuk
varian `LB300`. Bit syaratnya diambil dari section `Condition`; gerbang gabungan
(`LB309` = LB300 OR LB301 OR …) dikecualikan karena dia digerbang bit syarat lain,
jadi bukan pemilih varian.

Rung mutex punya beberapa coil bertumpuk, jadi kontak yang mengumpani tiap coil
dipisah per baris coil-nya. Tanpa itu `LB401` terbaca digerbang `LB300` SEKALIGUS
`LB301`, `LB302`, `LB303`.

Penelusuran rantai juga **berhenti** di bit gerbang. Diteruskan, dia menyusup ke
plumbing global (`LB401 → LB400 → LB400_A → LB499 → LB570 → LB415`) lalu mendarat
di langkah acak — semua langkah terlihat berantai, dan variannya hilang.

Diverifikasi pada satu project yang dibuat generator: **10 varian di 3 program,
semuanya cocok** dengan `motionSequences` milik generator — bit syarat, nama, jumlah
langkah, dan jumlah titik awal.

### Yang jujur perlu diketahui

**Rantai antar langkah sering tidak lengkap.** `confirm` sebuah langkah tidak
selalu langsung menjadi `prevBit` langkah berikutnya — banyak program memakai bit
perantara. Penelusuran mundur lewat rung penulisnya menemukan sebagian, tapi tidak
semua (10 dari 50 pada project uji).

Langkah yang tidak berhasil dirantai **dibiarkan menunjuk bit aslinya**, bukan
disembunyikan — di editor akan muncul sebagai blok syarat. Jadi informasinya utuh
dan urutannya kelihatan perlu dicek, bukan diam-diam salah.

Ini disengaja: flowchart yang memuat urutan palsu lebih berbahaya daripada
flowchart yang kurang lengkap. Yang kurang lengkap kelihatan; yang palsu tidak.

### Mesin gambarnya sama dengan editor generator

Viewer menggambar urutan gerak pakai **mesin flowchart yang diport dari
[Susmax program generator](https://github.com/Dennych123/sysmac)**
(`scripts/build_html.py`) — geometri node, pemilihan sisi sambungan panah,
aturan START/END, tata letak grid 4 kolom dari urutan topologis, sampai warna
tiap jenis blok. Alasannya bukan kosmetik: urutan yang **dibaca** dari mesin dan
urutan yang **ditulis** di editor jadi bisa ditumpuk dan dibandingkan langsung.
Kalau bentuknya beda, dua gambar untuk mesin yang sama tidak bisa dibandingkan —
padahal itu justru gunanya.

Yang diport cuma bagian murni dan penggambarnya. **Editornya tidak**: alat ini
baca saja. Untuk mengubah urutannya, ekspor `--flowchart` lalu impor ke
generator — di sana node bisa diseret, disambung, dan di-regenerate jadi ladder.

Blok yang dikenali mesin itu ikut terbawa: `motion`, `decision` (cabang `#Y`/`#N`),
`setmem`, `resetmem`, `alarm`, plus node `condition` untuk bit di luar rantai.
Pembaca `.smc2` sendiri baru menghasilkan `motion` dan `condition` — sisanya
tergambar kalau JSON-nya datang dari editor.
## Pakai

```bash
node cli.js project.smc2                     # ringkasan program & section
node cli.js project.smc2 --operands          # inventaris operand + komen
node cli.js project.smc2 --xref              # ditulis di mana, dibaca di mana
node cli.js project.smc2 --xref LB800        # difilter, sekalian lokasinya
node cli.js project.smc2 --llm prog.md       # SELURUH konteks buat LLM
node cli.js project.smc2 --flowchart m.json  # urutan gerakan -> motionSequences
node cli.js project.smc2 --graph g.json      # node + edge
node cli.js project.smc2 --xml out/          # rung -> XML yang bisa DI-IMPORT
node cli.js project.smc2 --json out.json     # dump mentah
node cli.js project.smc2 --probe-fb          # bentuk mentah kotak fungsi/FB
```

`--probe-fb` dipakai waktu menambah dukungan blok yang belum dikenali: dia
menunjukkan field apa saja yang benar-benar ada di elemen fungsi project ini,
supaya bentuknya dibaca dari file, bukan ditebak. Keluarannya aman ditempel ke
chat — cuma nama field, nama instruksi, dan beberapa contoh objek.

Node 18+, tanpa dependensi — ZIP dan XML dibaca sendiri, tidak ada `npm install`.

Satu bahasa untuk semuanya: CLI dan viewer memakai modul yang SAMA di `src/*.js`.
Dulu parsernya ditulis dua kali (Python untuk CLI, JavaScript untuk viewer) dan
keduanya sempat drift — viewer berhenti menyalin koordinat `X`/`Y`, jadi ladder
tidak pernah tergambar sama sekali dan semua rung ditandai perkiraan, tanpa satu
pun error.

### Versi browser

Buka **`smc2-viewer.html`** langsung di browser (tidak perlu server), lalu
jatuhkan file `.smc2`-nya. Menampilkan pohon program, ladder beserta komentarnya,
**flowchart urutan gerakan**, inventaris operand, dan tabel variabel — semuanya bisa
dicari.

Ladder-nya digambar SVG dengan susunan yang sama seperti Sysmac Studio: **nama
operand di atas simbol, komentarnya hijau di bawah**, nomor rung di kolom kiri,
komentar rung sebagai pita kuning, coil sebagai lingkaran penuh, dan kotak
fungsi lengkap dengan **pin bernama** (`EN`/`ENO`, `In`/`Out`, `PT`/`ET`) beserta
operand yang menempel di tiap pin. Daftar pin dibaca dari field `In`/`Out` milik
elemen fungsi — `__type` `PF` berarti pin aliran daya (nyambung ke kabel rung,
tanpa operand), `PRM` berarti parameter biasa dengan operand di `Var`.

Alasan susunannya disamakan: rung yang sama bisa ditaruh berdampingan dengan
layar Studio dan langsung dibandingkan. Kalau tata letaknya beda, tiap
perbandingan butuh terjemahan di kepala dulu — dan di situlah salah baca masuk.

Satu file, tanpa library. Struktur ZIP dibaca manual dan dekompresinya memakai
`DecompressionStream` yang sudah ada di browser. **File tidak dikirim ke mana
pun** — dibaca lokal, penting karena isinya program mesin.

## ⚠️ Baca saja

Format di dalam `.smc2` **tidak didokumentasikan Omron** dan sudah terbukti
berubah antar versi Studio. Karena itu:

- **Jangan pernah menulis balik** ke `.smc2`. Project bisa rusak tanpa cara
  memperbaikinya.
- Kalau perlu membuat program, pakai jalur import XML yang resmi didukung —
  itulah yang dilakukan `--xml`: dia **tidak menyentuh `.smc2` sama sekali**,
  cuma membacanya dan menulis berkas XML terpisah.
- Kalau formatnya berubah lagi, yang berhenti jalan cuma pembacaan ini — bukan
  program yang sudah ada.

## Peta format (hasil reverse engineering)

```
.smc2                      ZIP
 +- <sol>/<sol>.manifest    nama solution
 +- <sol>/<sol>.oem         POHON PROJECT  <- kuncinya
 +- <sol>/<sol>.log         versi Sysmac Studio
 +- <sol>/<guid>.xml        isi tiap section
```

Pohon di `.oem` bersarang lewat `<ChildEntities>`:

```
Solution
  Group[IecPous]
    Group[IecPrograms]
      Program[MultipartLadder]   name = nama program
        PouBody[Ladder]          name = nama section
                                 id   = nama file <id>.xml   <-- ladder-nya
```

**Jebakan.** Di bawah `PouBody` ada `PouBodySourceHolder` yang **juga** punya id
dan **juga** punya file `.xml` — tapi isinya `CxilVariable`, variabel bantu hasil
compile, bukan ladder. Salah ambil tidak menghasilkan error apa pun, cuma **0
rung di semua section** — dan itu terlihat seperti "project-nya kosong", bukan
seperti salah alamat.

### Bentuk ladder berubah antar versi Studio

| Studio | Bentuk | Isi |
|---|---|---|
| ≤ 1.56 | `<LadderDiagram>` DataContract XML | `Contact` / `Coil` dengan `Variable`, `NormallyClosed`, `Negated`, `Set`, `Reset` |
| ≥ 1.66 | deretan objek JSON, satu per rung | `CLs` (`LD`/`ST`/`F`/`HL`), `Var`, `Not`, koordinat `X`/`Y`, `VLs`, `CMT` |

Yang JSON justru lebih mudah dibaca: tata letaknya eksplisit lewat koordinat,
tidak perlu menelusuri edge GUID seperti format lama.

Pada format XML, komentar dipakai bersama gaya DataContract — kemunculan pertama
membawa teks dengan `z:Id`, sisanya cuma `z:Ref` ke id itu. Harus diresolusi,
kalau tidak sebagian besar komentar terbaca kosong.

### Tabel variabel global (Studio ≥ 1.66)

Disimpan sebagai teks berpenanda `[SLWD version=1.0]`, satu baris per variabel:

```
++D=BOOL	N=CH0000_00	AT=IOBus://unit#2/Input Bit 00	G=VAR_GLOBAL	Com=PB EMERGENCY STOP
```

Nama, tipe, **alamat fisik**, grup, dan komentar — praktis IO list siap pakai.

## Uji

```bash
node tests/run.js            # semua suite
```

Suite **`fixture`** selalu jalan dan **gagal, bukan skip**. Dia menguji CLI dan
viewer sekaligus terhadap project tiruan yang ikut di-commit
(`tests/fixtures/synthetic.smc2` — isinya karangan, bukan program mesin
pelanggan). Bikin ulang kalau perlu:

```bash
node tests/fixtures/make_fixture.js
```

Fixture-nya sengaja memuat tiap jebakan format: ladder JSON berkoordinat,
ladder DataContract XML dengan komentar `z:Ref`, section ST, tabel `[SLWD ...]`,
dan file decoy `PouBodySourceHolder`.

Suite **`build`** memastikan `smc2-viewer.html` masih sinkron dengan `src/` —
sintaksnya sah, tiap modul benar-benar ter-inline, dan tidak ada sisa `require`
yang membuat halaman mati begitu dibuka.

Suite **`scale`** menguji project SUNGGUHAN — ribuan rung, ribuan variabel —
jadi **skip** kalau tidak ada contohnya. Itu aman: bentuk parser sudah dijaga
`fixture` yang selalu jalan. Pakai project sendiri:

```bash
SAMPLE_SMC2="D:\path\mesin.smc2" node tests/run.js   # atau taruh sebagai sample.smc2
```

> Sebelumnya SEMUA suite skip tanpa `sample.smc2`. Suite yang hijau tanpa
> pernah menjalankan parser tidak menjaga apa pun — bug koordinat `X`/`Y` di
> viewer (ladder tidak pernah tergambar, semua rung ditandai perkiraan) lolos
> persis lewat celah itu.

Terverifikasi pada 17 project sungguhan, sampai **1413 rung / 2490 variabel**.

## Struktur

```
src/          modul inti - dipakai CLI DAN viewer
  env.js        beda lingkungan (dekompresi, teks) - satu-satunya tempat
  xml.js        pembaca XML kecil (bukan DOMParser: itu cuma ada di browser)
  zip.js        pembaca ZIP tanpa library
  smc2.js       format .smc2: pohon project, ladder XML & JSON, tabel variabel
  symbols.js    tabel simbol: komentar, alamat, mana yang global
  ladder.js     rekonstruksi logika rung (PERKIRAAN, '~') + penggambar ladder SVG
  net.js        netlist EKSAK dari koordinat + VLs - dasar ekspor XML
  motion.js     pengenalan langkah gerakan + perantaian
  graph.js      mesin flowchart (port dari generator)
  reports.js    keluaran CLI: ringkasan, xref, graf, konteks LLM, flowchart
viewer/       cangkang HTML + kode UI
cli.js        baris perintah
xml_out.js    ekspor rung -> XML importable (Node saja, pinjam ../js/lib.js)
build.js      src/ + viewer/ -> smc2-viewer.html
```

`ladder.js` dan `net.js` sengaja dipisah, dan bedanya penting: `ladder.js`
MENEBAK bentuk rangkaian buat DIBACA (ditandai `~` kalau disederhanakan),
`net.js` menyusunnya EKSAK buat DITULIS dan menolak yang tidak yakin. Menggabung
keduanya berarti tebakan ikut mengalir ke berkas yang di-import ke controller.

`xml_out.js` sengaja di luar `src/` karena dia BUKAN modul isomorfik: dia
membaca `../js/lib.js` dari disk, jadi cuma jalan di Node, bukan di viewer.

`smc2-viewer.html` adalah **hasil build — jangan diedit langsung**. Edit
`src/*.js` atau `viewer/*`, lalu:

```bash
node build.js
```

## Rencana

Tujuannya satu lapisan universal: baca program merek apa pun, lihat di satu
viewer, lalu konversi ke merek lain.

- **Ekspor XML untuk blok fungsi** — sekarang `--xml` baru menulis rung
  kontak/coil (~54%). `F`/`FB` sudah membawa daftar pinnya sendiri dan
  `js/lib.js` sudah punya contoh bentuknya di `ton()`, jadi bahannya lengkap;
  yang kurang BUKTI. Urutannya: ekspor satu rung TON → import ke project kosong
  → bandingkan → baru digeneralkan. Jangan dibalik.
- **ULIR** — lapisan universal antar merek: rung jadi POHON (seri/paralel),
  bukan daftar datar, supaya mnemonic merek lain bisa dikeluarkan dengan benar.
  Bahan dasarnya sudah ada: `src/net.js` menyusun rangkaiannya secara EKSAK dari
  `VLs`, tinggal dijadikan pohon — dan sekalian bisa dipakai membuang tanda `~`
  dari `rungExpr` yang sampai sekarang masih menebak dari koordinat saja.
- ~~Satu parser untuk CLI dan viewer~~ — **selesai**: keduanya memakai
  `src/*.js` yang sama.
- Pembaca **CX-Programmer** (CXT/CXR), lalu Keyence dan Mitsubishi.
- **Konversi Sysmac → CX-Programmer** dengan LAPORAN: apa yang persis, apa yang
  perkiraan, apa yang wajib dicek manusia. Timer paling berbahaya — basis
  waktunya beda, programnya tetap jalan tapi lama tahannya salah.
- Konteks AI yang **terfokus** di sekitar satu rung (sekarang `--llm` membuang
  seluruh project, 650 KB, kebesaran buat jendela konteks) + `lint` untuk
  memeriksa balik mnemonic usulan AI sebelum diketik ke Studio.
- Pembanding dua project — apa yang berubah antar revisi
