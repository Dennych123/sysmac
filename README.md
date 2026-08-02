# sysmac-program-generator

Generator program Omron Sysmac Studio (IEC 61131-10 XML) dari IO list,
mengikuti standar pemrograman terstruktur PT. Denso Indonesia.
Dipaketkan sebagai `index.html` standalone (tanpa Node-RED) dan sebagai
flow Node-RED dashboard.

## Alur

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
Komentar yang memuat `ST1` / `ST2` / `ST3` masuk ke program unit,
sisanya masuk ke program MAIN.

## Cara build

```bash
python3 scripts/build_html.py   # -> index.html standalone, tinggal dibuka di browser
python3 scripts/build.py        # -> flow JSON, siap di-import ke Node-RED
node scripts/test.js            # jalankan seluruh node tanpa Node-RED, lalu validasi hasil
```

`index.html` (buka langsung, tidak butuh server) menempel semua logic `js/*.js`
jadi satu file lewat `build_html.py` - tempel IO list, klik Generate, download
hasilnya. `build.py` juga menempelkan `js/lib.js` ke setiap node generator
secara otomatis. Jangan menyalin isi lib ke file generator, dan jangan edit
`index.html` langsung - edit `js/*.js` lalu build ulang.

## Struktur

| Berkas | Isi |
|---|---|
| `js/lib.js` | Pembangun XML: `Rung`, `series`, `latch`, `ls2`, `merge2`, `chunkNot`, `ton`, `Rung.ton`, `portName`, `vr`, `sect`, `prog` |
| `js/parse.js` | TSV menjadi array perangkat |
| `js/genname.js` | Jenis dan komentar menjadi nama simbol |
| `js/validate.js` | Kolom kosong, IN/OUT, alamat ganda |
| `js/split.js` | Pemisahan per station |
| `js/gen_all.js` | Pembangkit seluruh program |
| `scripts/build_html.py` | Perakit `index.html` standalone |
| `scripts/build.py` | Perakit flow JSON Node-RED |
| `scripts/test.js` | Uji jalan dan validasi |
| `index.html` | Hasil build, jangan diedit langsung |

## Uji yang dijalankan `test.js`

1. Seluruh rantai node berjalan tanpa galat
2. Setiap operand pada rung terdeklarasi di program tersebut
3. Setiap `ExternalVars` punya padanan pada tabel global
4. Tidak ada kontak menggantung (penyebab `import failed` di Sysmac Studio)

## Urutan import ke Sysmac Studio

1. Paste `GlobalVariables.tsv` ke tabel Global Variables
2. Import berkas program

Terbalik akan memunculkan galat
"A global variable corresponding to the external variable has not been registered".

## Batasan

- Urutan gerak pada `AutoRunning` belum dibangkitkan, hanya kerangka `LB410` ke atas
- Interlock pada `Individual` masih `GSB000`, harus ditulis manual
- `Condition` unit berisi tiga slot cadangan
- `HMI_Input` sengaja kosong
- Pemasangan solenoid dengan sensor memakai kemiripan kata pada komentar
- Penetapan port fisik tetap manual melalui I/O Map
