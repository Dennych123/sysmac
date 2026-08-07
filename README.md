# plc-reader

Membaca program PLC dari file project-nya langsung, tanpa membuka software
vendornya. Saat ini mendukung **Omron Sysmac Studio (`.smc2`)**.

Sysmac Studio bisa meng-*import* XML tapi **tidak bisa meng-export**-nya. Jadi
sekilas program yang sudah jadi seperti tidak bisa dibaca dari luar. Ternyata
bisa: `.smc2` itu container ZIP berisi XML, dan isinya tetap terbaca.

## Untuk apa

**Bertanya ke AI sebelum memodifikasi program orang lain.** Perintah `--llm`
mengekstrak SELURUH konteks jadi satu berkas Markdown: logika tiap rung dalam
bentuk ekspresi boolean, komentar rung, arti tiap bit, dan silang-rujuk siapa
menulis siapa membaca. Berkas itu tinggal disuap ke LLM.

```
$ python read_smc2.py project.smc2 --llm program.md
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
$ python read_smc2.py project.smc2 --xref MASTER_READY

MASTER_READY                 1    44  Master ON Confirmation
        TULIS  P000_Main/Device_Input#6
        baca   P000_Main/Timers#2
        baca   P000_Main/Fault#20
        ...
```

**Memetakan program jadi graf**, supaya alur sinyal antar program dan section
kelihatan tanpa membuka ladder-nya:

```
$ python read_smc2.py project.smc2 --graph graph.json
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

Pada project uji, **77% rung** terekonstruksi tepat. Sisanya cabang bersarang
yang disederhanakan jadi satu tingkat — dan **selalu ditandai `~`**, supaya tidak
ada yang mengira presisi penuh padahal bukan. Ini penting: ekspresi yang salah
susun tetap terlihat masuk akal, dan itulah yang berbahaya kalau dipercaya
mentah-mentah oleh engineer maupun LLM.

## Pakai

```bash
python read_smc2.py project.smc2                  # ringkasan program & section
python read_smc2.py project.smc2 --operands       # inventaris operand + komen
python read_smc2.py project.smc2 --xref           # ditulis di mana, dibaca di mana
python read_smc2.py project.smc2 --xref LB800     # difilter, sekalian lokasinya
python read_smc2.py project.smc2 --llm prog.md    # SELURUH konteks buat LLM
python read_smc2.py project.smc2 --graph g.json   # node + edge
python read_smc2.py project.smc2 --json out.json  # dump mentah
```

Python 3, tanpa dependensi — `zipfile` dan `ElementTree` sudah bawaan.

### Versi browser

Buka **`smc2-viewer.html`** langsung di browser (tidak perlu server), lalu
jatuhkan file `.smc2`-nya. Menampilkan pohon program, rung, operand, dan tabel
variabel, semuanya bisa dicari.

Satu file, tanpa library. Struktur ZIP dibaca manual dan dekompresinya memakai
`DecompressionStream` yang sudah ada di browser. **File tidak dikirim ke mana
pun** — dibaca lokal, penting karena isinya program mesin.

## ⚠️ Baca saja

Format di dalam `.smc2` **tidak didokumentasikan Omron** dan sudah terbukti
berubah antar versi Studio. Karena itu:

- **Jangan pernah menulis balik** ke `.smc2`. Project bisa rusak tanpa cara
  memperbaikinya.
- Kalau perlu membuat program, pakai jalur import XML yang resmi didukung.
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

Keduanya **skip** (bukan gagal) kalau file `.smc2` contohnya tidak ada, jadi
tetap aman dijalankan di mesin yang tidak punya project Sysmac. Taruh sebuah
project sebagai `sample.smc2` di root repo untuk mengaktifkannya.

Terverifikasi pada dua project sungguhan: **1207 rung / 62 section** (Studio
1.56) dan **2276 rung / 101 section / 6850 variabel** (Studio 1.66).

## Rencana

- Rekonstruksi cabang bersarang (sekarang disederhanakan satu tingkat)
- Pembaca untuk CX-Programmer, Keyence, dan Mitsubishi
- Pembanding dua project — apa yang berubah antar revisi
