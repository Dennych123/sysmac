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

## Membaca project Sysmac (.smc2) — `reader/`

Ada di [reader/](reader/) (dulu repo terpisah `Universal_Ladder`/`plc-reader`,
digabung balik supaya lingkarannya tertutup: **baca → sunting → import**).
Punya suite sendiri, jalankan terpisah:

```bash
cd reader && node tests/run.js     # 5 suite; build dulu kalau src/ berubah
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
