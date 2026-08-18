// Dialog "pilih berkas / pilih folder" milik Windows, dibuka dari SERVER.
//
// Kenapa dari server dan bukan dari halaman: `<input type="file">` di browser TIDAK PERNAH
// memberi path lengkap - itu batas keamanan browser, bukan sesuatu yang bisa disiasati. Yang
// tersisa cuma menyalin path dengan tangan, dan itu jalur paling sering salah ketik di seluruh
// alat ini. Server ini jalan di desktop orangnya sendiri, jadi dia boleh membuka dialog aslinya.
//
// Dijalankan lewat PowerShell dengan `-STA`: dialog WinForms menolak tampil di apartment MTA,
// dan penolakannya berupa proses yang selesai tanpa hasil - dari luar tidak bisa dibedakan dari
// "penggunanya menekan Cancel".
'use strict';
const { spawn } = require('child_process');
const os = require('os');

const BISA = process.platform === 'win32';

// Jendela pemilik yang BENAR-BENAR DITAMPILKAN dulu.
//
// Ini sudah salah sekali: `ShowDialog(New-Object Form ...)` memakai form yang tidak pernah
// di-Show sebagai pemilik. Form tanpa handle jendela bukan pemilik yang sah - dialognya tidak
// muncul sama sekali, dan dari halaman yang kelihatan cuma "menunggu dialog..." selamanya.
//
// Form kecil ber-TopMost ini yang membuat dialognya naik ke depan. Tanpa pemilik ber-TopMost,
// dialog dari proses anak muncul DI BELAKANG jendela browser - sama tidak kelihatannya.
const OWNER =
  'Add-Type -AssemblyName System.Windows.Forms;' +
  'Add-Type -AssemblyName System.Drawing;' +
  '$owner = New-Object System.Windows.Forms.Form;' +
  '$owner.TopMost = $true; $owner.ShowInTaskbar = $false;' +
  '$owner.Size = New-Object System.Drawing.Size(1,1);' +
  '$owner.StartPosition = ' + "'CenterScreen';" +
  '$owner.Show() | Out-Null; $owner.Activate();';

// Pemiliknya ditutup lagi apa pun hasilnya - jendela 1x1 yang tertinggal itu tetap sebuah
// jendela: dia menahan proses PowerShell-nya hidup, dan pemantau berikutnya menunggu selamanya.
const TUTUP = '$owner.Close(); $owner.Dispose();';

function jalankanPs(skrip, timeoutMs) {
  return new Promise((resolve, reject) => {
    const p = spawn('powershell', ['-NoProfile', '-STA', '-NonInteractive', '-Command', skrip],
                    { windowsHide: false });
    let out = '', err = '';
    p.stdout.on('data', d => out += d);
    p.stderr.on('data', d => err += d);
    // Dialog yang dibiarkan terbuka menahan permintaan HTTP-nya selamanya. Dibatasi, dan yang
    // habis waktunya dilaporkan sebagai "tidak jadi memilih" - bukan digantung tanpa kabar.
    const jam = setTimeout(() => { try { p.kill(); } catch (e) {} }, timeoutMs || 180000);
    p.on('error', e => { clearTimeout(jam); reject(e); });
    p.on('close', () => {
      clearTimeout(jam);
      const hasil = out.trim();
      if (!hasil) return resolve(null);            // Cancel, atau habis waktu
      if (/^GAGAL:/.test(hasil)) return reject(new Error(hasil.slice(6).trim() || err.trim()));
      resolve(hasil);
    });
  });
}

/**
 * @param opts.filter mis. 'Project Sysmac (*.smc2)|*.smc2|Semua berkas (*.*)|*.*'
 * @param opts.start  folder awal
 */
function berkas(opts) {
  if (!BISA) return Promise.reject(new Error('dialog cuma tersedia di Windows'));
  const o = opts || {};
  const skrip = OWNER +
    '$d = New-Object System.Windows.Forms.OpenFileDialog;' +
    '$d.Filter = ' + psStr(o.filter || 'Semua berkas (*.*)|*.*') + ';' +
    '$d.Title = ' + psStr(o.title || 'Pilih berkas') + ';' +
    (adaTeks(o.start) ? '$d.InitialDirectory = ' + psStr(o.start) + ';' : '') +
    'if ($d.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) ' +
    '{ Write-Output $d.FileName };' + TUTUP;
  return jalankanPs(skrip, o.timeout);
}

function folder(opts) {
  if (!BISA) return Promise.reject(new Error('dialog cuma tersedia di Windows'));
  const o = opts || {};
  const skrip = OWNER +
    '$d = New-Object System.Windows.Forms.FolderBrowserDialog;' +
    '$d.Description = ' + psStr(o.title || 'Pilih folder') + ';' +
    '$d.ShowNewFolderButton = $true;' +
    (adaTeks(o.start) ? '$d.SelectedPath = ' + psStr(o.start) + ';' : '') +
    'if ($d.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) ' +
    '{ Write-Output $d.SelectedPath };' + TUTUP;
  return jalankanPs(skrip, o.timeout);
}

/**
 * Teks jadi literal PowerShell yang aman.
 *
 * Bukan kehati-hatian umum: judul dan folder awal datang dari halaman, dan teks yang ditempel
 * apa adanya ke perintah PowerShell itu jalan masuk buat menjalankan perintah lain. Kutip
 * tunggal PowerShell tidak menafsirkan apa pun; yang perlu di-escape cuma kutipnya sendiri.
 */
function psStr(v) {
  return "'" + String(v == null ? '' : v).replace(/'/g, "''") + "'";
}

function adaTeks(v) { return !!(v && String(v).trim()); }

// OWNER/TUTUP ikut diekspor supaya BISA DIUJI tanpa memunculkan dialog di layar orang: tesnya
// menjalankan bagian pembuat jendelanya saja. Dialog yang cuma diperiksa dengan mata berarti
// tidak pernah diperiksa lagi setelah hari ini.
module.exports = { berkas, folder, BISA, OWNER, TUTUP, psStr, HOME: os.homedir() };
