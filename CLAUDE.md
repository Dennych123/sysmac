# Catatan kerja untuk Claude

Baca ini dulu sebelum mengubah apa pun. Isinya hal-hal yang tidak kelihatan dari
kode tapi menyebabkan kerusakan senyap kalau dilanggar.

Daftar pekerjaan yang belum selesai ada di [TODO.md](TODO.md).

## Perintah

```bash
python scripts/build_html.py           # js/*.js + template  ->  index.html
node tests/run.js                      # SELURUH suite (pipeline + 6 harness)
node scripts/core.js project.json out/ # generate dari CLI, tanpa browser
```

`node tests/run.js` membaca `index.html`, jadi **build dulu baru test** kalau yang
diubah ada di `scripts/build_html.py`. Kalau tidak, yang diuji versi lama dan
hasil lulus/gagalnya menyesatkan.

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

**Kode warning adalah kontrak.** `W(code, station, message, {device})` di
`js/gen_all.js`. UI dan konsumen luar menyantol ke `code` dan `device`, bukan ke
teks pesan. Mengganti kalimat aman; mengganti kode memutus penyorotan blok merah
di panel Confirm Mode.

**Blok AL/MF dinomori dari NOMOR station**, bukan urutan kemunculan — ST3 selalu
blok ke-3 walau ST1/ST2 kosong. Itu yang membuat nomor alarm tidak bergeser saat
aktuator atau unit ditambah. Ukuran blok harus **seragam**; kalau satu station
butuh lebih, semuanya dinaikkan.

## Membaca project Sysmac (.smc2)

Sysmac Studio **tidak punya export XML**, cuma import. Tapi `.smc2` itu container
ZIP berisi XML, jadi isinya tetap bisa dibaca dari luar —
`python scripts/read_smc2.py project.smc2`.

**Hanya baca.** Format ini tidak didokumentasikan Omron. Jangan pernah menulis
balik ke `.smc2`. Menulis program tetap lewat import XML yang resmi didukung.

Peta format (hasil reverse engineering):

```
.smc2                     ZIP
 +- <sol>/<sol>.manifest   nama solution
 +- <sol>/<sol>.oem        POHON PROJECT  <- kuncinya di sini
 +- <sol>/<guid>.xml       isi section
```

Pohon di `.oem` bersarang lewat `<ChildEntities>`:
`Solution` → `Group[IecPous]` → `Group[IecPrograms]` → `Program` →
**`PouBody`** (nama section, **dan id-nya = nama file `<id>.xml`**).

**Jebakan:** di bawah `PouBody` ada `PouBodySourceHolder` yang juga punya id dan
juga punya file `.xml` — tapi isinya `CxilVariable` (variabel bantu compiler),
bukan ladder. Ketukar di sini hasilnya bukan error, melainkan **0 rung di semua
section** — dan itu terlihat seperti "project kosong", bukan seperti bug.

**Format ladder berubah antar versi Studio**, dan ini sudah terjadi:

| Studio | Bentuk | Isi |
|---|---|---|
| ≤ 1.56 | `<LadderDiagram>` DataContract XML | `Contact`/`Coil` dengan `Variable`, `NormallyClosed`, `Negated`, `Set`, `Reset` |
| ≥ 1.66 | deretan objek JSON per rung | `CLs` (LD/ST/F/HL), `Var`, `Not`, `X`/`Y` grid, `VLs`, `CMT` |

Yang JSON justru lebih mudah: tata letaknya eksplisit lewat `X`/`Y`, tidak perlu
menelusuri edge GUID. Komentar di format XML dipakai bersama gaya DataContract
(`z:Id` sekali, `z:Ref` seterusnya) — harus diresolusi atau sebagian besar
komentar terbaca kosong.

Studio ≥ 1.66 juga menyimpan **tabel variabel global** sebagai teks berpenanda
`[SLWD version=1.0]`, satu baris per variabel dengan nama, tipe, alamat IO, dan
komentar — praktis IO list yang bisa ditarik langsung.

`tests/smc2.test.js` menguji kedua format sekaligus. Kalau tidak ada file `.smc2`
contoh, tesnya skip, bukan gagal.

## Peta file

| File | Isi |
|---|---|
| `js/parse.js` `genname.js` `validate.js` `split.js` | tahap awal pipeline |
| `js/lib.js` | pembangun rung XML (Rung, series, latch, motionStep, judgeBranch) |
| `js/gen_all.js` | seluruh pembangkit program, ~1100 baris, inti proyek |
| `scripts/build_html.py` | template + seluruh UI editor, meng-inline `js/*.js` |
| `scripts/core.js` | runner pipeline headless (modul + CLI) |
| `scripts/read_smc2.py` | pembaca project Sysmac `.smc2` (baca saja) |
| `scripts/test.js` | uji pipeline end-to-end |
| `tests/*.test.js` | harness per-area, jalan tanpa browser |

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
