# `.smc2` → project JSON + FLOW PROCESS DIAGRAM

```bash
node scripts/smc2_project.js "Ce Insert Track.smc2" project.json --doc flow.html --company "PT. X" --dwg E0-...
node scripts/flowdoc.js project.json flow.html          # dokumen saja, dari JSON yang sudah ada
node scripts/core.js project.json out/                   # JSON yang sama dibuka generator
```

Buka `flow.html` di browser → Ctrl+P → A3, landscape, margin none → PDF.

Program mesin lahir dari generator lalu disunting tangan berbulan-bulan di Studio. IO list dan
`motionSequences` yang dulu dipakai men-generate sudah tidak mewakili yang jalan; skrip ini
membaca ulang yang jalan.

## Acuan gaya

Lembar flow chart Denso `E0-5505-M024` (Auto Gel Press). Berkasnya ada di `docs/ref/` tapi
**tidak ikut git**: bertanda CONFIDENTIAL dan repo ini publik. Yang ditiru darinya:

| unsur | di acuan | di `flowdoc.js` |
|---|---|---|
| kertas | A3 landscape, bingkai, tabel revisi kanan atas, title block kanan bawah | sama; `--company`, `--dwg`, `--subject` mengisi title block |
| halaman 1 | MAIN CIRCUIT (P010): AUTO RUN → AUTORUN `LB120` → kotak program station "(Refer to the operation diagram)" → `LB499_on 1 Cycle Complete` | sama, syarat autorun di bawahnya sebagai daftar berkurung dengan bus naik ke jalur utama |
| halaman station | kotak judul `PRESS MOTION (P011)`, urutan dalam bingkai | satu bingkai per VARIAN (bit LB401, LB402, ...) |
| alur | MENGULAR: baris habis → turun → balik ke kiri → baris berikutnya | sama; lapisan yang tidak muat pindah baris |
| masuk / keluar | kotak kecil berlabel `LB400` / `LB499` | sama |
| syarat varian | kotak bersudut panah "[NAMA] Unit Motion Condition" + bit gate di kiri bawah | sama |
| motion | teks aktuator + `SOL <alamat> on` → sensor `on`, bit step biru di atas panah | nama aktuator + kanal IO (`CH5_02 on`) → sensor AS |
| judgement | diamond, Y ke kanan, N ke bawah | sama; label = komentar coil keluaran pertama |
| detail syarat | kotak putus-putus `[ LB300 ... ]`, pohon kontak ber-panah | sama, 3 per baris di bawah bingkai |
| warna | bit/alamat BIRU, `off` MERAH, sisanya hitam | sama |

Yang TIDAK ditiru: tabel pokayoke dan gambar produk (tidak ada di `.smc2`), tanda tangan/stempel.

## Pola dari lima lembar acuan (dipelajari 25 Sep 2026)

Selain `E0-5505-M024`, empat lembar flow chart Denso lain dibaca: ATS ECU (`6451-M011`, 4 lbr),
P&P Magnetizing ACGS (`E0-5514-M017`, 2 lbr - salinan kedua di folder AddOn nomornya sama),
ULCV Final Inspection (`E0-7211-M005`), Coil Winding (`E0-5501-M027`). Letaknya di mesin ini:
`D:\Denny\Download\...` - tidak ikut repo, alasan yang sama dengan `docs/ref/`.

**Yang KONSISTEN di semua lembar - itu standarnya, dan itu yang ditiru:**

| | |
|---|---|
| main circuit | atas: syarat berkurung (PC/PLC NORMAL, FUSE NORMAL, SAFETY, NO FAULT) → `PB MASTER ON` → `SOL on AIR SOURCE on` → `PS1` → bus TEGAK turun ke jalur AUTORUN, input lain (CRMC1 MASTER ON, SS1 AUTO/IND, LB029 AUTO STOP) masuk ke bus dari kiri, label bus = bit penampungnya (`LB119`). Bawah: bus syarat naik (`LB109`: PL_AUTO_COND, LB099 homepos, ...) |
| siklus station | `AUTORUN LB120` → LINGKARAN → kotak program `(Refer to the operation diagram)` → loop balik ke lingkaran, dengan umpan `LB499_on 1 Cycle Complete` dan `LB121_off No Cycle Stop` |
| baris putus | LINGKARAN BERHURUF: baris berakhir di (A), baris berikut mulai dari (A). Tidak ada garis balik panjang |
| alamat | sensor dan solenoid ditulis dengan ALAMAT HARDWIRE: `AS3200.00`, `SOL Ch.100.00 on`, `PX0000_21`, `AS_CH0001_12`, `IO: 101.04` - itu yang dicari teknisi di panel |
| bit step | LB kecil biru di atas panah; kotak masuk `LB400` di kiri, kotak keluar `LB499` di kanan |
| judgement | diamond, Y ke kanan, N ke bawah. N yang MENUNGGU digambar sebagai loop kembali ke masukan diamond; N yang GAGAL turun ke `(0.5 sec) T100 → AL0001[110] ... FAULT (Cycle Stop)` |
| aksi samping | `SET LB810 "Memory ..."` / `RESET ...` / `IO: 100.04 "Buzzer On"` bercabang dari satu langkah, panah pendek ke bawah |
| servo / subproses | kotak `SM2_P&P X AXIS FORWARD/BACKWARD / BACKWARD POS. (LB1201 on)`; kotak bersisi ganda = subproses (`Call Prog 5`, `Winding Running`) |
| syarat gate | kotak putus-putus `[ LB300 ... CONDITION ]` di KIRI BAWAH, bus naik ke kotak masuk; tanda `AND`/`OR` pada percabangan kontak |

**Yang TIDAK benar / tidak konsisten di acuan - jangan ditiru:**

- huruf konektor dipakai DUA KALI di satu lembar (ATS lbr 4: P, Q, P) - huruf harus unik per lembar;
- panah input ke bus TANPA label (ULCV & Coil Winding: tiga panah kosong ke `LB119`);
- format alamat campur di satu lembar (`CH00.004 (PB3)`, `SS00.005`, `PH3100.02`) - pakai satu bentuk;
- label bit kadang sebelum elemen, kadang sesudah - di sini: sebelum elemen, kecuali di titik gabung
  paralel (di situ label di ujung ASAL, kalau tidak semua label jatuh di satu titik dan bertumpuk);
- `on` / `off` merah kadang ditulis, kadang tidak - di sini selalu ditulis, `off` selalu merah;
- kotak syarat tanpa tanda AND/OR (Coil Winding) - daftar datar tidak bisa dibedakan dari OR.

**Belum diikuti di `flowdoc.js`** (ada di acuan, belum ada datanya/rautnya): tanda AND/OR di kotak
syarat (sekarang daftar kontak saja; ekspresi aslinya ada di `expr` JSON), loop N-menunggu pada
diamond, cabang aksi samping SET/RESET memory, kotak servo dengan posisi `(LB1201 on)`.

## Aturan ekstraksi yang tidak kelihatan dari kode

**Rantai langkah dibaca dari data, bukan dari nomor LB.** Langkah B sesudah A kalau rung B memuat
kontak NO dari coil yang DITULIS rung A di section yang sama, dan rung A ada di atasnya. Kontak ke
rung di bawah = penutup siklus sebelumnya, tidak ikut dirantai.

**Rung `1 cycle complete` ditulis DI ATAS langkah-langkahnya**, jadi semua kontaknya menunjuk ke
bawah dan tersaring aturan di atas. Dibaca terpisah: coil langkah yang dibacanya = jalan keluar.
Tanpa itu cabang N judgement (`LB411_B` cycle stop) hilang dari gambar tanpa tanda.

**Pendahulu dicatat per BIT, bukan per rung.** `LB401 OR LB405` dua-duanya ditulis rung varian yang
sama; didedup per rung, varian `LB405` (buffering dua tipe sekaligus) kosong.

**Variabel lokal per PROGRAM.** `LB411` ST1 dan `LB411` ST3 dua variabel lain dengan komen lain.
`reader/src/smc2.js` sekarang memberi medan `program` ke tiap variabel lokal (entity `Variables`
anak entity `Program` di `.oem`); peta cmd → aktuator (`Auto_Output`) dan LSC → sensor
(`LS_Combination`) juga dibangun per program. Dulu tercampur: ST3 tergambar menggerakkan stopper ST1.

**Kolom jenis IO ditebak dengan genname generator sendiri**: jenis yang menghasilkan nama simbol
persis sama dengan di program. Simbol diambil HANYA dari rung pemetaan murni (1 kontak NO → 1
coil) di mana pun; kanal yang disetir logika (`MSTR_RDY AND /SOL_VIBRATOR_ON -> CH6_07`) tidak
diberi simbol palsu dan tidak masuk `io`.

**`motionSequences` = proyeksi `flow`**, dengan nama solenoid yang AKAN diberikan generator (dari
komen kanal), bukan nama di program; generator menamai ulang dari komen, jadi nama program
berujung "unknown solenoid". Langkah tunggu/judgement/servo tidak bisa dinyatakan editor generator:
dilewati, rantainya disambung, dan dicatat di `generatorSkipped`. Program yang di-generate ulang
dari JSON ini TIDAK memuat langkah-langkah itu.

**Varian yang lebih tinggi dari satu halaman dikecilkan, bukan dipotong.** Potongan di halaman
berikut memutus panah di tengah jalan.

Tes: `tests/flowdoc.test.js` (project sintetis untuk tiap aturan di atas + project mesin kalau ada).
