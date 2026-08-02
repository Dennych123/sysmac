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

### Node Motion Sequencer (opsional, buat urutan gerak AutoRunning)

`nodered-nodes/motion-sequencer/` adalah custom Node-RED node beneran (bukan
`function` node inline kayak `js/*.js`), jadi butuh diinstall terpisah -
import `flow.json` saja TIDAK cukup buat node ini muncul di palette:

```bash
cd ~/.node-red
npm install /path/ke/repo/nodered-nodes/motion-sequencer
# restart Node-RED
```

Node ini duduk di antara "Split per Station" dan "Generate Program XML".
Double-click, tambah station (ST1/ST2/...), ketik nama solenoid persis
(mis. `SOL_ST1_STP5_CHK`, sama seperti yang muncul di `GlobalVariables.tsv`),
drag buat urutkan. Station yang tidak dikonfigurasi di node ini tetap dapat
placeholder `LB410 onwards` seperti sebelumnya - lihat `Batasan`.

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
| `nodered-nodes/motion-sequencer/` | Custom Node-RED node: urutan motion AutoRunning per station |

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
  dikonfigurasi lewat node Motion Sequencer (lihat di atas). Station yang
  belum dikonfigurasi tetap dapat kerangka placeholder `LB410` ke atas.
- Motion Sequencer belum mendukung overlay step-mode manual (`PB_STEP_MODE`
  di project Denso asli) - cmd bit langsung `TR0 ANDNOT LSC`, tanpa tombol
  step. Juga belum mendukung confirm selain solenoid+LSC (mis. servo).
- Interlock pada `Individual` masih `GSB000`, harus ditulis manual
- `Condition` unit berisi tiga slot cadangan
- `HMI_Input` sengaja kosong
- Pemasangan solenoid dengan sensor memakai kemiripan kata pada komentar
- Penetapan port fisik tetap manual melalui I/O Map
