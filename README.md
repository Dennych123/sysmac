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

### Motion Sequence (urutan gerak AutoRunning)

Setelah klik Generate, panel "Motion Sequence" muncul di `index.html` kalau
ada station dengan actuator - berupa kanvas graph, bukan list linear. Klik
solenoid buat nambah node, seret dari bulatan kuning di node ke node lain
yang LEBIH BARU buat bikin panah dependency ("node ini nunggu node itu
selesai"). Beberapa node boleh nunjuk ke node yang sama (paralel - jalan
bareng), satu node boleh punya 2+ panah masuk (badge AND muncul otomatis,
klik buat toggle ke OR - AND = nunggu semua, OR = nunggu salah satu).
"+ Condition/bit" nambah node rujukan bit yang sudah ada (`LB300` dkk di
section Condition, sensor, atau operand lain) sebagai sumber panah, bukan
solenoid. Posisi node bisa diseret, itu kosmetik doang. Tiap perubahan
struktur graph langsung regenerate ladder AutoRunning station itu.

Codegen: idiom Denso TR0 cmd+confirm (`js/lib.js` -> `motionStep`) tetap
dipakai per node; kalau sebuah node punya 2+ dependency, satu rung AND
(`series`) atau OR (`orMany`) dibikin dulu buat gabungin jadi satu bit,
baru bit itu jadi TR0 buat `motionStep`-nya. Node yang gak ada yang
nunjuk ke dia (ujung cabang paralel) semuanya di-AND jadi `LB499`
"1 cycle motion complete". Station yang gak disentuh di panel ini tetap
dapat kerangka placeholder biasa (lihat `Batasan`).

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

- Urutan gerak pada `AutoRunning` cuma dibangkitkan buat station yang
  disusun lewat panel Motion Sequence di `index.html`. Station yang belum
  disentuh tetap dapat kerangka placeholder `LB410` ke atas.
- Motion Sequence belum mendukung overlay step-mode manual (`PB_STEP_MODE`
  di project Denso asli) - cmd bit langsung `TR0 ANDNOT LSC`, tanpa tombol
  step. Juga belum mendukung confirm selain solenoid+LSC (mis. servo).
- Interlock pada `Individual` masih `GSB000`, harus ditulis manual
- `Condition` unit berisi tiga slot cadangan
- `HMI_Input` sengaja kosong
- Pemasangan solenoid dengan sensor memakai kemiripan kata pada komentar
- Penetapan port fisik tetap manual melalui I/O Map
