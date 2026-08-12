// Tabel simbol project: arti tiap operand, alamat fisiknya, dan mana yang global.
//
// Dipisah jadi modul sendiri karena penggambar ladder DAN penggambar flowchart
// sama-sama butuh: ladder menulis komentar hijau di bawah tiap simbol, flowchart
// memakai komentar IO sebagai label kotaknya. Dulu ini variabel global di dalam
// viewer, jadi tidak bisa dipakai CLI sama sekali.
const VCMT = new Map();     // nama -> komentar
const VADDR = new Map();    // nama -> alamat fisik (AT=...)
const VGLOB = new Set();    // nama yang G=-nya VAR_GLOBAL

/** Isi ulang tabel dari daftar variabel hasil parse. Selalu mengosongkan dulu. */
function setSymbols(vars) {
  VCMT.clear(); VADDR.clear(); VGLOB.clear();
  (vars || []).forEach(v => {
    if (v.comment) VCMT.set(v.name, v.comment);
    if (v.address) VADDR.set(v.name, v.address);
    // Studio mewarnai operand global beda dari yang lokal. Datanya ada di kolom
    // G= tabel SLWD, jadi ikut dipakai daripada mengarang aturan warna sendiri.
    if ((v.group || '').indexOf('GLOBAL') >= 0) VGLOB.add(v.name);
  });
}

if (typeof module !== 'undefined') module.exports = { VCMT, VADDR, VGLOB, setSymbols };
