// Pantau berkas `.smc2` dan catat sendiri tiap kali Sysmac Studio menyimpannya.
//
// Kenapa polling, bukan `fs.watch`: Studio tidak menulis di tempat - dia menulis berkas
// sementara lalu me-rename-nya. Penonton yang menempel ke INODE berkas lama berhenti dapat
// kabar setelah rename pertama, dan berhentinya diam-diam: pemantauan tampak jalan, tapi tidak
// ada lagi yang tercatat. Polling stat tidak bisa kehilangan berkasnya.
//
// Tiga hal yang menentukan catatannya benar, dan ketiganya bukan pilihan gaya:
//
//   1. TUNGGU SAMPAI DIAM. Menyimpan project 5 MB butuh waktu; commit di tengah tulisan
//      menyimpan ZIP separuh - dan yang separuh itu tidak bisa dibuka lagi waktu dibutuhkan.
//   2. BUKA DULU SEBELUM DICATAT. Kalau `readProject` gagal, berkasnya belum utuh (atau memang
//      rusak) - jangan dicatat sebagai versi yang sah.
//   3. PESANNYA DIHITUNG, bukan "auto-save". Diff terhadap versi sebelumnya jadi judul commit,
//      jadi riwayatnya kebaca tanpa membuka satu commit pun. Judulnya boleh diganti belakangan.
'use strict';
const fs = require('fs');
const path = require('path');

const AKTIF = new Map();     // path absolut -> keadaan pemantauan

const INTERVAL = 2000;       // seberapa sering stat dibaca
const DIAM = 3000;           // berapa lama berkas harus tidak berubah sebelum dianggap selesai

function cap(f) {
  try {
    const st = fs.statSync(f);
    return st.mtimeMs + ':' + st.size;
  } catch (e) { return null; }
}

/**
 * @param opts.file    path absolut .smc2
 * @param opts.rel     path relatif (buat dilaporkan ke halaman)
 * @param opts.catat   async (pesanOtomatis) -> hasil track; dipanggil setelah berkasnya diam
 * @param opts.pesan   async () -> judul commit hasil hitungan (boleh null)
 */
function mulai(opts) {
  const kunci = path.resolve(opts.file);

  // Sudah dipantau: setelannya DIGANTI, bukan diabaikan.
  //
  // Dulu di sini `return status(kunci)` - permintaan kedua dengan setelan baru (mis. "alarm ikut
  // ditulis ke HMI" yang baru dicentang) dijawab "sudah dipantau" dan callback lamanya tetap
  // dipakai. Akibatnya persis yang paling menyesatkan: centangnya menyala, pemantauannya hidup,
  // dan tidak ada satu pun yang menulis ke HMI - tanpa pesan galat.
  const ada = AKTIF.get(kunci);
  if (ada) {
    ada.rel = opts.rel || ada.rel;
    ada.pesanFn = opts.pesan;
    ada.catatFn = opts.catat;
    return status(kunci);
  }

  const st = {
    file: kunci, rel: opts.rel, sejak: Date.now(),
    terakhirCap: cap(kunci), berubahPada: 0, menunggu: false,
    commit: 0, gagal: 0, pesanTerakhir: null, galatTerakhir: null, nbTerakhir: null, sibuk: false,
    // Disimpan di state, bukan dipegang closure: setelan yang diganti harus benar-benar dipakai
    // putaran berikutnya, bukan cuma tercatat di suatu tempat.
    pesanFn: opts.pesan, catatFn: opts.catat,
  };

  st.timer = setInterval(async () => {
    if (st.sibuk) return;
    const c = cap(kunci);
    if (c === null) return;                       // berkasnya sedang di-rename Studio
    if (c !== st.terakhirCap) {
      st.terakhirCap = c;
      st.berubahPada = Date.now();
      st.menunggu = true;
      return;
    }
    if (!st.menunggu || Date.now() - st.berubahPada < DIAM) return;

    st.sibuk = true;
    try {
      const judul = await st.pesanFn();
      const hasil = await st.catatFn(judul);
      if (hasil && hasil.changed) {
        st.commit++;
        st.pesanTerakhir = hasil.message;
        st.galatTerakhir = null;
        // Hasil sinkron NB ikut dicatat. Sinkron yang GAGAL tidak boleh cuma lewat di log
        // server: yang memakainya melihat panel, dan panel yang bilang "tercatat" sementara
        // NB-nya tidak ikut berubah itu kabar yang menyesatkan.
        if (hasil.nb) st.nbTerakhir = hasil.nb;
      }
      st.menunggu = false;
    } catch (e) {
      // Gagal TIDAK menghentikan pemantauan: penyebab paling sering itu berkas yang belum
      // selesai ditulis, dan itu hilang sendiri di putaran berikutnya. Yang berhenti diam-diam
      // justru yang berbahaya - orang menyunting seharian menyangka semuanya tercatat.
      st.gagal++;
      st.galatTerakhir = e.message;
      st.menunggu = true;
    } finally {
      st.sibuk = false;
    }
  }, INTERVAL);
  // Timer pemantau tidak boleh menahan proses tetap hidup waktu servernya diminta berhenti.
  if (st.timer.unref) st.timer.unref();

  AKTIF.set(kunci, st);
  return status(kunci);
}

function berhenti(file) {
  const kunci = path.resolve(file);
  const st = AKTIF.get(kunci);
  if (!st) return { watching: false };
  clearInterval(st.timer);
  AKTIF.delete(kunci);
  return { watching: false, file: st.rel, commits: st.commit };
}

function status(file) {
  if (file) {
    const st = AKTIF.get(path.resolve(file));
    return st ? satu(st) : { watching: false };
  }
  return { watching: AKTIF.size > 0, files: [...AKTIF.values()].map(satu) };
}

function satu(st) {
  return {
    watching: true, file: st.rel, since: st.sejak,
    pending: st.menunggu, commits: st.commit, errors: st.gagal,
    lastMessage: st.pesanTerakhir, lastError: st.galatTerakhir,
    nb: st.nbTerakhir || null,
  };
}

module.exports = { mulai, berhenti, status, INTERVAL, DIAM };
