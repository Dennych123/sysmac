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
ada station dengan actuator. Tiap station boleh punya beberapa **varian**
sequence ("+ Variant") - tiap varian punya Condition bit sendiri (kosongin
= selalu aktif) dan graph node-nya sendiri, kayak pemilihan TIPE di FSM:
cuma varian yang kondisinya true yang jalan (lihat `PATTERN 3` condition
select di skill referensi CX-Programmer -> Sysmac).

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
  { "condition": "", "nodes": [
    { "id": "n1", "sol": "SOL_ST1_STP5_CHK", "after": [], "join": "AND" },
    { "id": "n2", "sol": "SOL_ST1_STP5_UCHK", "after": ["n1"], "join": "AND" }
  ] }
]
```
`after` boleh nunjuk id node lain di varian yang sama, atau bit apapun yang
sudah dideklarasi (Condition section, sensor) - kalau bit itu gak match id
node manapun di JSON-nya, node "condition" otomatis dibikin biar kegambar.
Import mengganti SELURUH varian station itu; Export nulis balik state
sekarang ke textarea (bisa disalin/disimpan).

Codegen: idiom Denso TR0 cmd+confirm (`js/lib.js` -> `motionStep`) tetap
dipakai per node - cmd bit break-nya `ANDNOT` bit confirm node itu sendiri
(bukan `ANDNOT` LSC), jadi cmd tetap ON sampai posisi beneran kekonfirmasi.
Kalau sebuah node punya 2+ dependency, satu rung AND (`series`) atau OR
(`orMany`) dibikin dulu buat gabungin jadi satu bit, baru bit itu jadi TR0
buat `motionStep`-nya. Graph di-topological-sort di `gen_all.js` sebelum
diproses, jadi urutan drag-connect di editor gak ngaruh ke kebenaran hasil.
Tiap varian yang punya Condition di-gerbang `LB400 AND <condition>` duluan
sebelum root node-nya; semua varian nge-OR ke `LB499` "1 cycle motion
complete" bareng. Station yang gak disentuh di panel ini tetap dapat
kerangka placeholder biasa (lihat `Batasan`).

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

1. Seluruh rantai node berjalan tanpa galat, dua skenario (stub tanpa Motion
   Sequence, dan diseed dengan graph multi-varian: linear, fork, AND-join,
   OR-gate, condition-gate)
2. Setiap operand pada rung terdeklarasi di program tersebut
3. Setiap `ExternalVars` punya padanan pada tabel global
4. Tidak ada kontak menggantung (penyebab `import failed` di Sysmac Studio)
5. Blok array AL/MF gak pernah penuh walau actuator/AS-pair banyak (ukuran
   dinamis, bukan lebar tetap)

Selain itu ada skrip terpisah (dibangun ulang tiap sesi kerja, gak
di-commit) yang men-dispatch event mouse/keyboard beneran (`mousedown`/
`mousemove`/`mouseup`/`keydown`) ke elemen SVG hasil `index.html`, bukan
manggil fungsi state-nya langsung - buat mastiin drag-connect, penolakan
cycle, dan hapus via keyboard bener-bener jalan lewat kode yang sama yang
dipanggil browser, bukan cuma lewat jalur pintas testing.

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
  di project Denso asli - tombol jog per step). Juga belum mendukung
  confirm selain solenoid+LSC (mis. servo).
- Kalau satu nama solenoid dipakai di lebih dari satu node motion (sengaja
  atau gak), `Auto_Output` cuma nge-OR command node yang PALING TERAKHIR
  diproses ke solenoid fisiknya - node sebelumnya yang solenoid-nya sama
  tetap jalan motion-nya (chain-nya benar) tapi gak ikut ngedrive output.
- Interlock pada `Individual` masih `GSB000`, harus ditulis manual
- `Condition` unit berisi tiga slot cadangan (`LB300`-`LB302`) - inilah
  yang biasa dipakai sebagai Condition bit varian Motion Sequence
- `HMI_Input` sengaja kosong
- Pemasangan solenoid dengan sensor memakai kemiripan kata pada komentar
- Penetapan port fisik tetap manual melalui I/O Map
