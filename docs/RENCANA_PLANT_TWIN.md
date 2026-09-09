# Rencana: digital twin SPM untuk analisa cycle time

Catatan ide, bukan pekerjaan yang sudah jalan. Ditulis 9 September 2026, setelah sel robot
di `blurobot/` selesai dan jalan.

Kalimatnya sengaja pendek.

## 1. Apa yang mau dijawab

Tiga pertanyaan. Semua tentang waktu, bukan tentang gambar.

1. Cycle time-nya berapa? Habis di mana?
2. Aktuator mana yang lebih lambat dari rencana?
3. Siapa menunggu siapa?

Kalau tiga ini terjawab sebelum mesinnya dibuat, twin-nya berguna. Kalau cuma bergerak
bagus di layar, itu animasi.

## 2. Bukan physics engine

Godaannya besar: pakai mesin fisika rigid-body di browser. Jangan.

Alasannya tiga:

- Fisika yang dibutuhkan SPM cuma orde satu. Posisi, kecepatan, batas, sensor, transfer
  benda. Di blurobot tidak sekali pun butuh gaya atau gesekan.
- Solver kontak hasilnya beda tiap kali dijalankan. Di sini determinisme lebih penting
  daripada realisme. Hasil yang tidak bisa diulang tidak bisa dipakai menjawab "kenapa
  PLC-nya begitu".
- Yang mahal bukan fisikanya. Yang mahal plumbing tag, generator, tes, dan daftar jebakan.
  Itu semua sudah ada.

## 3. Plant di ST, bukan di browser

Balik arah yang sekarang.

```
sekarang :  ST menjalankan sekuens   ->  browser menggambar
rencana  :  ST menjalankan PLANT     <-  program mesin yang asli mendorongnya
            (silinder, servo, sensor)  ->  browser menggambar
```

Nilainya: **program yang di-generate bisa diuji sebelum mesinnya ada.**

Kenapa plant-nya di ST, bukan di browser: bridge OPC UA mengambil sampel 50 ms. Reed
switch dan interlock hidup di orde milidetik. Plant di browser berarti sensor telat 50 ms.
Program aslinya lalu melihat mesin yang tidak pernah ada. Plant di ST jalan di task yang
sama, 4 ms, dan tidak lewat jaringan sama sekali.

Browser tetap jadi mata. Bukan otak. Sama seperti sekarang.

## 4. Sumbernya IO list, bukan config baru

`js/parse.js` dan `js/genname.js` sudah membaca IO list. Hasilnya sudah berisi station,
aktuator M/R, reed switch, solenoid.

Daftar yang sama bisa melahirkan dua keluaran:

```
IO list ─┬─→ program mesin        (sudah ada hari ini)
         └─→ plant sim            (SOL_* dibaca, AS_* ditulis)
```

Satu sumber, dua keluaran. Pola yang sudah dipakai di seluruh repo ini.

## 5. Device yang sudah terbukti berulang

Ditulis dari yang SUDAH muncul dua kali atau lebih, bukan dari tebakan.

| device | isinya | sudah dipakai |
|---|---|---|
| sumbu ke target | trapesium, soft limit, home | 2x (sumbu robot, jari gripper) |
| aktuator 2 posisi | stroke, waktu, 2 reed switch, gagal bergerak | pola slot generator |
| stasiun proses | waktu proses, syarat mulai, isi/kosong | 4x |
| penutup / klem | engsel, interlock zona, syarat proses | 4x |
| benda kerja | ikut gripper, duduk, hilang, jatuh | 1x, dan bug-nya sudah kena |

Konveyor, indexer, rotary table, vision: belum pernah dipakai. Tambahkan waktu ketemu.
Jangan sekarang.

## 6. Tiga lapis pengukuran

Lapis 1 dan 2 sudah ada datanya di blurobot. Tinggal dicatat.

| lapis | yang diukur | caranya |
|---|---|---|
| 1 | waktu tiap langkah | `SIM_CYCLE_STEP` sudah ada. Catat lama tiap nomor langkah |
| 1 | siapa menunggu | tandai tiap langkah: bergerak / gripper / menunggu. Jumlahkan per jenis |
| 1 | mesin nganggur | per stasiun: proses, selesai belum diambil, kosong menunggu isi |
| 2 | aktuator meleset | PLC hitung waktu teori (jarak / kecepatan + kecepatan / akselerasi). Bandingkan dengan waktu nyata |
| 3 | rencana vs nyata | tabel waktu rencana di config, dibandingkan per langkah |

Lapis 2 yang paling berguna. Sumbu diminta 900 mm/s tapi nyatanya 620 mm/s: angkanya
langsung kelihatan. Di mesin nyata itu tanda tekanan angin turun, seal aus, atau beban
berubah.

Cycle time keluar-ke-keluar sudah jalan di blurobot (`SIM_CT_LAST`, `SIM_CT_AVG10`).
Aturannya ada di `blurobot/README.md`: produk pertama tidak dihitung, jam berhenti waktu
siklus berhenti, rata-rata dibagi jumlah sampel.

## 7. Tampilannya

- Satu batang per siklus. Dipecah per langkah. Warna: bergerak / gripper / menunggu.
- Daftar "paling boros", diurutkan dari selisih terbesar.
- Angka pemakaian: robot bergerak 62 %, menunggu 38 %. ICC 1 proses 71 %, nganggur 29 %.

Dari situ pertanyaan "robotnya yang kurang atau mesin tesnya" terjawab sendiri.

## 8. Urutan pengerjaan

**Jangan bikin frameworknya dulu.** Kita baru punya satu mesin. Framework dari satu contoh
selalu salah menebak mana yang berubah dan mana yang tetap.

1. Mesin #2 dengan cara MENYALIN. Silinder, dari IO list nyata.
2. Catat apa yang benar-benar berulang waktu menyalin. Bukan yang kelihatannya akan
   berulang.
3. Baru difaktorkan jadi `plant/`: katalog device + generator dari IO list.

Bukti paling kecil, dan yang harus dikerjakan duluan: **satu silinder.**

```
plant baca  SOL_xxx           -> silinder bergerak 0..100 % selama waktu strokenya
plant tulis AS_xxx_M / _R     -> reed switch menyala di ujungnya
mode gagal  macet di tengah   -> motion fault muncul di program aslinya
```

Kalau motion fault itu muncul, lingkarannya tertutup: program yang di-generate mendeteksi
kesalahan mesin yang besinya belum ada.

## 9. Yang sudah ada dan tinggal dipakai

Dari `blurobot/` (repo `rb4axis`):

| | |
|---|---|
| `bridge/bridge.js` | satu sesi OPC UA, SSE, mode CLI. Salin apa adanya |
| `tools/gen_xml.js` | ST + tabel variabel -> XML import Studio. Bentuknya tidak berubah antar mesin |
| `tools/gen_sim.js` | pola: penanda blok DIBANGKITKAN, `--check`, satu daftar -> tiga keluaran |
| `web/robot.js` | bagian SSE, penghalusan, panel. Yang diganti cuma scene-nya |
| `tests/` | pola suite: `--check` byte per byte, gambar diadu ke hitungan |

Cara kerjanya dan daftar jebakannya: [SIMULASI_3D_OPCUA.md](SIMULASI_3D_OPCUA.md).

## 10. Yang perlu diwaspadai

- **Twin bukan bukti.** Yang diuji programnya terhadap MODEL mesin. Model yang salah
  memberi rasa aman yang salah. Tulis batas modelnya di layar, jangan di kepala.
- **Angka rencana harus punya asal.** Kalau waktu rencana dikarang, "meleset dari rencana"
  tidak berarti apa-apa. Ambil dari kecepatan dan jarak, atau dari mesin yang sudah jalan.
- **Jangan menaruh plant di program mesin yang dikirim.** Plant itu project terpisah, atau
  program yang tidak ditugaskan ke task waktu dikirim ke besi.
