# Ekstrak "Ce Insert Track" — pola untuk fitur generator / standar baru

Sumber: `C:\Users\denny\Downloads\track\Ce Insert Track.smc2` (28 Agu 2026). Project NYATA yang
jalan di line: awalnya di-generate Susmax, lalu ditambah tangan banyak untuk menyesuaikan mesin
sebenarnya. Dibaca lewat `reader/` + `scripts/smc2_extract.js` (bukan tebakan — teks eksak dari ZIP).

Ukuran: **10 program, 76 section, 877 rung, 2593 variabel (292 punya AT)**.

Isi dokumen ini: yang ADA di project nyata tapi BELUM ada / beda di generator, ditulis sebagai
kandidat standar. Yang butuh bukti import sebelum di-generate ditandai **[butuh probe]**.

## Peta program — mana yang novel

| Program | Section | Status vs generator |
|---|---|---|
| `P001_Initial` | Design_Coil, Adjust_Coil | sama (GSB000/GSB001 + spare) |
| `P002_Servo` | Process, Initial, Fault, SV_Ready, SV_Adjust, MD_Out, HMI_Out | **BARU — servo/motion, belum ada** |
| `P003_HMI` | TP_Control, Counters, Setup | **Counters terbukti** (generator masih placeholder), TP_Control baru |
| `P010_Main` | 12 section standar | sama pola |
| `P011..P013_STx` | 14-15 section standar | sama pola |
| `P900_QR_Scan` | Device_port_setting, NX_Serial_Rcv, Restart | **BARU — QR scanner via NX serial** |
| `P004_CE_Refill` | ST wiring | **BARU — traceability kanban/box** |
| (FB tanpa program) | ST `FbCeSetup`, `FbCeRefill` | **BARU — function block ST** |

Konfirmasi konvensi CLAUDE.md yang sudah dicatat: **motion/servo = program 2, HMI = program 3.**
Betul di project ini (P002 servo, P003 HMI).

---

## 1. Servo = program 2 (`P002_Servo`) — belum ada di generator [butuh probe]

Program servo penuh, 7 section, 155 rung. Ini kelas instruksi yang di generator masih ditahan
`ADV_OK` — semua di luar kontak/coil/TON. Yang dipakai project nyata:

**FB motion Omron (semua FB, punya instance):**
| FB | pin | dipakai di |
|---|---|---|
| `MC_Power` | Axis, Enable → Status, Busy, Error, ErrorID | SV_Ready, per-axis enable |
| `MC_Reset` | Axis, Execute → Done, Busy, Failure, Error, ErrorID | reset alarm axis |
| `MC_Stop` | Axis, Execute, Deceleration, Jerk, BufferMode → ... | stop saat single-axis |
| `MD_FLT_Reset50` (custom) | FLT, FLT_Reset → NoFLT | Fault section |

**Struktur data sistem yang dirujuk langsung** (bukan variabel biasa — ini variabel sistem NX):
- `_MC_AX[n]` array axis: `.Details.Idle`, `.Status.Coordinated`, `.Cfg.NodeAddress`
- `_EC_PDSlavTbl[node]`, `_EC_CommErrTbl[node]` — tabel EtherCAT slave / comm error
- `_MC_COM.Status.RunMode`
- `MC_ERR_STA.B[n]` — bit-access word status, dipetakan ke level fault:
  `.B[7]`→MAJOR, `.B[6]`→PARTIAL, `.B[5]`→MINOR, `.B[4]`→OBSERVATION

**Pola servo-lock chain (SV_Ready):** per grup axis 1-8 / 9-15 / all → `LB064`/`LB065`/`LB066`
(servo lock), `LB070`/`LB071`/`LB072` (auto-mode). Brake output `SMx_BKIR` per axis (MD_Out,
`LB126[n]` → `SMn_BKIR`), sampai 15 axis.

**Adjust modes (SV_Adjust/Initial):** JOG / PC / brake adjust — tiap mode latch 3-rung
(set/seal/reset) yang persis pola PATTERN Denso, di-interlock antar mode (`LB012` valid ↔ `LB020`
↔ `LB024`), plus `PB_GET_POS`/`PL_GET_POS` teaching (MOVE posisi sekarang ke preset).

**Standar yang bisa diambil:**
- Naming `LB000 ARRAY[1..32] OF BOOL` "USE AXIS", `LB030` transfer-mode, `LB046/047` axis alarm.
- Section servo tetap: `Initial / SV_Ready / SV_Adjust / Fault / MD_Out / HMI_Out`.
- Level fault MAJOR/PARTIAL/MINOR/OBSERVATION dari `MC_ERR_STA.B[7..4]`.

**Jalan ke generator:** `_Probe_Instructions.xml` untuk `MC_Power/MC_Reset/MC_Stop` ke project
KOSONG dulu, catat yang tidak `(DefinitionError)`. Baru buka `ADV_OK` untuk FB itu. Sebelum itu,
servo tetap section komentar.

---

## 2. Traceability QR / kanban (`P900_QR_Scan` + `P004_CE_Refill` + FB ST) — baru

Rantai lengkap scanner → verifikasi part number → unlock feeder. Semua logika di **ST function
block**, ladder cuma wiring.

**Akuisisi (P900):**
- `NX_SerialRcv` FB (Execute, DevicePort, RcvDat, Size... → Done, Busy, Error, ErrorID, RcvSize).
- Device port di-set lewat **inline ST (IST)** + variabel `N1_Node_location_information` yang
  ditarik dari property "Node Location Information" NX-CIF (didokumen di komen rung).
- `AryToString` byte→string, reset trigger, `Clear` di first-run.

**Verifikasi (FB `FbCeRefill`):** parsing string POSISI TETAP, bukan match seluruh string —
kanban dan box beda teks, yang sama cuma part number di posisi tetap:
```
kanban "267735-8301A   000480030000017"  30 char : part 1..11 (ada dash di ch7), seq 7..24
box    "26773583018N0048...  SC16HR11"    44 char : part 1..10 (dash DIBUANG), lot 25..32, type 37..44
```
- Beda kanban vs box dideteksi dari **dash di ch7** (`MID(qr,1,7)='-'`), jadi salah scan = pesan
  sendiri, bukan NG membingungkan.
- Bandingkan `runNoDash := CONCAT(LEFT(runPart,6), MID(runPart,4,8))` untuk box.
- **Tabel error-id + error-text SATU sumber** (kode DAN kalimat dari satu blok IF, dicek urut
  paling-blocking dulu). Layar tidak simpan salinan arti.
- `errTxt STRING[40]`, teks **dijaga ≤36 char** — lewat batas terpotong diam-diam.

**Standar yang bisa diambil:**
- STRING di-size ke isi nyata, bukan dibulatkan: `CE_RUN_PART/KBN_PART/TRC_PART STRING[16]`,
  `CE_TRC_LOT STRING[10]`, `CE_KBN_SEQ STRING[8]`, `CE_ERR_TXT STRING[40]`, `CE_LAST_QR STRING[48]`
  ("25 words, needs TWO NB displays").
- HMI Text Display baca **byte-buffer** (`CE_*_RAW : ARRAY OF BYTE`, di-`StringToAry`, di-nol-in
  dulu tiap scan biar ekor value lama tidak nyisa) — bukan STRING langsung.
- **Sim path di SAMPING scanner, bukan menimpa**: `NX_SerialRcv_FB_done` punya coil di P900 rung 2,
  jadi tulisan luar ketimpa 1 scan. Sim pakai bit sendiri (`CE_SIM_SCAN`/`CE_SIM_QR`), + lampu
  `CE_SIM_USED` yang direset fault-reset biar mode simulasi tak pernah tak kelihatan.
- Publish antar-program: `NX_SerialRcv_FB_done/err/errID` di-declare `VAR_GLOBAL` + `VAR_EXTERNAL`
  (dibaca P004). FB instance sendiri `VAR` lokal.
- Custom struct `CeSetupRec`, tabel `CE_SETUP : ARRAY[0..49] OF CeSetupRec` (50 baris part→feeder).

**Jalan ke generator:** template ST FB opsional (bukan auto dari IO list). Kotak inline ST
(`__type:"IST"`) sudah terbukti lewat `smc2_section.js` — jalur import-nya ada. Escape ST panjang
(`
` dst) wajib, lihat catatan `jsonStudio()`.

---

## 3. Counters (`P003_HMI/Counters`) — konfirmasi pola + 1 bug ketemu

Membuktikan catatan counter di CLAUDE.md, dengan bentuk eksak:
```
rung: GCT00n [RISING] · < (CUR < konst) → @Inc(CUR)        ; hitung, dibatasi KONSTANTA
rung: <>(CUR<>0) · <=(CUR>=warn) · PL71[odd] NC → PL71[even]  ; lampu WARNING
rung: <>(CUR<>0) · <=(CUR>=target) → PL71[odd]                ; lampu UP
```
- `PL71[]`/`PL72[]` array lampu, 2 bit per counter (WARNING genap, UP ganjil). 10 counter.
- Timing hitung pakai sinyal periodik setara task HMI (komen tiap rung).

**Bug di project nyata (bukan generator):** counter 4 rung `Contact PL71[6] [NC] → Coil PL71[6]`
— gate ke NC dirinya sendiri, harusnya `PL71[7]`. Semua counter lain konsisten pasangan n/n+1.
Reader yang menangkap ini. Layak dibetulkan di project-nya, dan generator (kalau counter
diaktifkan) harus pakai indeks pasangan yang benar.

**Jalan ke generator:** section Counters generator masih placeholder (ditahan `ADV_OK`, butuh
import `Inc`/pembanding bersih). Pola di atas = cetakan yang tinggal dipakai begitu `@Inc` + `<`/
`<>`/`<=` lolos probe. `MOVE` sudah lolos.

---

## 4. TP_Control (`P003_HMI/TP_Control`) — agregasi kondisi ke top page

Pola deterministik, MUDAH masuk generator:
- Mirror status → lampu top-page: `MSTR_RDY→PL_TP_MSTR_RDY`, `AUTO_RUN→PL_TP_AUTO_RUN`, dst.
- **Agregasi array kondisi** dipecah chunk 7: `PL21[0..6]→LB001`, `[7..13]→LB002`, `[14..15]→LB003`,
  lalu `LB001·LB002·LB003·MSTR_RDY → PL_TP_MSTR_COND`. Sama untuk autostart `PL031[0..15]`+
  `PL032[0..15]` → `LB010..LB016` → `PL_AUTO_COND`.
- Switch screen HMI: `@MOVE` (differensiasi naik) nomor screen ke register HMI di EDGE tombol/status
  (`PB_MSTR_ON` falling, `AUTO_RUN` rising, `NO_FAULT` falling).

Generator sudah punya `PL031/PL032` condition array + `PL_AUTO_COND` (lihat `gen_all.js`), tinggal
tambah rung agregasi chunk-of-7 + mirror lamp + screen-switch @MOVE.

---

## 5. GB handshake antar-program pakai indeks bit

`MD_Out` servo menulis `GB002_001/003/005/006/010/011/012` (mis. `GB002_011` = "MOTION CONTROLLER
ALL AXIS SERVO ON"). Ini persis pola station-output GB yang baru dikasih **spare 32-bit** di
`gen_all.js`. Nyata: satu word GB jadi jalur status antar-program, bit-nya tersebar (bukan 0..n
rapat) — jadi cadangan bit yang dideklarasi penuh (bukan diisi belakangan) memang benar, nomor bit
tak boleh geser.

---

## 6. Konvensi tabel variabel

- Komen dua kolom dipisah `$t` (tab): `"AXIS ALARM RESET$tAXIS ALARM RESET"` — kolom Name-comment
  dan Description Studio.
- AT area-D untuk angka & string HMI: `CE_RUN_PART %D2190`, `CE_ERR_TXT %D2311` (cocok catatan
  "angka/string di D, retain nyala" di CLAUDE.md).
- FB instance = `VAR` lokal; bit hasilnya yang dibaca program lain = `VAR_GLOBAL` + `VAR_EXTERNAL`
  di dua sisi.
- Custom struct/FB type: `CeSetupRec`, `FbCeSetup`, `FbCeRefill`, `NX_SerialRcv`.

---

## Rekomendasi urut prioritas — STATUS

1. **TP_Control screen-switch + mirror lamp — SUDAH (28 Agu 2026).** Rung switch screen NB pakai MOVE
   POLOS (terbukti) + kontak edge (= perilaku @MOVE), nulis `HMI_SCREEN` di edge MSTR_RDY/AUTO_RUN/
   NO_FAULT. Digerbang `advancedInstructions` (nomor screen + register khas NB tiap mesin). Agregasi
   kondisi + mirror lamp memang sudah ada sebelumnya di `buildHmi()`.
2. **Counters — SUDAH (28 Agu 2026), default ON.** Tidak lagi di balik `advancedInstructions`:
   `Inc`/`<`/`<>`/`>=` terbukti ke-import bersih di project nyata ini. GCT trigger eksternal (bukan
   clock), jadi counter mandiri. Timers TETAP gated (butuh clock pulse). Bug indeks counter-4 project
   asli TIDAK ditiru — generator pakai pasangan n/n+1 yang benar.
3. **Traceability QR — TIDAK dibangun (arahan pemilik: belum tentu ada tiap mesin).** Yang common &
   reusable diambil terpisah: **`FbTextNb`** (buffer byte buat Text Display NB — zero-fill + StringToAry)
   dan **FB `Setup`** (bekas `FbCeSetup`, nama di-universal-kan: recipe/setup data yang HAMPIR selalu
   ada, bukan "Ce"). Belum digenerate — kandidat template FB berikutnya.
4. **Servo program 2 (`P002_Servo`) — SUDAH (28 Agu 2026), tabel terpadu.** Satu tabel axis dipakai
   dua tipe: **`io`** = kontak/coil nyata (enable dari master, command→output fisik, feedback←input
   fisik, servo-fault) — dipilih pemilik untuk servo non-motion; **`ethercat`** = bit terpadu + GB002
   handshake dipesan, rung MC_*  PLACEHOLDER + warning (**[butuh probe]** import MC_Power/Reset/Stop).
   UI: panel "Servo axes" (add/hapus, name/label/type/station/input/output addr) di generator,
   round-trip ke `project.servoAxes`. Test: `tests/servo.test.js`.

**Aturan yang tidak berubah:** rung yang ditulis atas tebakan ter-import mulus lalu salah waktu
mesin bergerak. Yang masih **[butuh probe]**: MC_* (EtherCAT servo), @-varian, clock pulse, timers.
Counter + MOVE sudah terbukti (project nyata / probe), jadi boleh default.
