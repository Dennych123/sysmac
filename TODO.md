# Yang belum dikerjakan

Diurut dari yang paling berdampak. Tiap butir menyertakan alasannya, supaya bisa
dinilai ulang — bukan sekadar daftar perintah.

Konvensi dan jebakan proyek ada di [CLAUDE.md](CLAUDE.md).

---

## 1. Undo / redo di editor flowchart

**Kenapa penting.** Satu-satunya cara membatalkan kesalahan sekarang adalah
mengulang manual. Menghapus node juga menghapus semua panah yang menempel padanya
— tidak bisa dikembalikan.

**Kenapa belum dikerjakan.** Undo/redo yang setengah jadi lebih berbahaya daripada
tidak ada: kalau ada satu jalur mutasi yang terlewat, undo menghasilkan graph yang
tidak konsisten tanpa tanda apa pun. Harus lengkap atau tidak sama sekali.

**Rancangan yang disepakati.** Satu titik masuk `mutate(fn)` yang menyimpan
snapshot `motionState` + `conditionState` sebelum tiap perubahan, lalu Ctrl+Z /
Ctrl+Shift+Z. **Semua** pemanggil harus lewat situ:

`addMotionNode` `addBlockNode` `addConditionNode` `removeNode` `addEdge`
`removeEdge` `moveNode` `toggleJoin` `setNodeField` `setNodeComment`
`addVariant` `removeVariant` `setVariantCondition` `setVariantComment`
`importSequenceJSON` `importConditionJSON` `importProjectJSON`
plus drag START/END (`variant.startPos` / `endPos`).

Kelengkapan daftar itu bagian yang paling menentukan. Sebaiknya ditutup dengan
tes yang memeriksa tiap fungsi mutasi benar-benar menambah satu entri riwayat.

---

## 2. Panel hasil

**Keadaan sekarang.** Tiap file XML tampil sebagai textarea mentah. Untuk menilai
hasil generate, satu-satunya cara adalah men-scroll XML.

**Yang diusulkan.** Ringkasan per program: jumlah rung per section, daftar bit
yang dipakai, dan tautan lompat ke section. XML tetap bisa dibuka, tapi bukan
lagi tampilan utama.

---

## 3. Server MCP

**Prasyaratnya sudah ada** — `scripts/core.js` (headless) dan warning terstruktur.
Yang tersisa tinggal pembungkus tipis.

Tool yang direncanakan:

```
list_devices(io)        daftar device per station + nama solenoid yang SAH
get_project()           project JSON sekarang
validate_project(json)  dry-run: warnings terstruktur, TANPA nulis file
generate(json)          XML + GlobalVariables.tsv
```

`list_devices` bukan opsional: tanpa itu LLM mengarang nama solenoid dan yang
didapat cuma warning `unknown_solenoid`, langkahnya hilang diam-diam.

**Aturan yang harus dipegang.** LLM **tidak pernah** menyentuh XML atau ladder —
ruang keluarannya dibatasi ke project JSON. Topologi rung, penamaan, alokasi
AL/MF, seal logic, pencocokan LSC tetap milik generator. Itu yang membuat
hasilnya taat aturan.

---

## 4. Node condition yatim hilang saat export

Node bertipe `condition` yang **tidak dirujuk `after` node manapun** lenyap saat
export/import. Penyebabnya desain: node condition tidak disimpan di array `nodes`,
melainkan dibangun ulang dari rujukan `after`, jadi yang menggantung sendirian
tidak punya jejak.

Keterbatasan lama, bukan regresi. Terasa kalau alur kerjanya bolak-balik
export–import (mis. lewat MCP).

---

## 5. Manfaatkan pembaca `.smc2` (repo **plc-reader**)

Pembacanya sudah jadi dan pindah ke repo tersendiri. Yang belum: memakainya.

1. **Audit standar program vendor.** Vendor kirim `.smc2`, tools laporkan
   penamaan menyimpang, section hilang, alokasi alarm salah. Ini menjawab
   langsung masalah vendor yang jadi alasan utama SS.
2. **Verifikasi hasil generate.** Generate -> import -> baca balik -> bandingkan.
   Ketahuan kalau ada yang mengedit tangan dan menyimpang dari standar.
3. **Tarik IO list dari mesin lama** untuk mesin copy atau retrofit.

Rekonstruksi logika rung (seri/paralel) belum dikerjakan; belum diperlukan untuk
audit penamaan, baru perlu kalau mau membandingkan logika.

## 6. Panel warning bisa diklik

Warning sudah dikelompokkan per station dan membawa `code` + `device`. Langkah
berikutnya yang murah: klik satu baris warning → gulirkan ke aktuator atau node
yang bersangkutan. Datanya sudah tersedia, tinggal penyambungnya.

---

## Sudah selesai (jangan dikerjakan ulang)

- Pencocokan LSC — dulu `STOPPER-2/3/4` semua tersambung ke sensor `STOPPER-5`
- Blok flowchart: IF/ELSE (hold + mutex), SET/RESET memory, ALARM
- Posisi node dan START/END bertahan lewat export–import
- Ukuran array AL/MF dan slot per station bisa disetel; blok dinomori per station
- Warning terstruktur (`code`, `station`, `device`)
- Editor IO list mode tabel dengan dropdown jenis
- Node-RED dicabut; pipeline jalan langsung dari `js/` lewat `scripts/core.js`
- Penjaga build: karakter kontrol + `node --check`
