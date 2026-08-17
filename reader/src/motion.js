// Pengenalan langkah gerakan dari pola rung, dan perantaiannya.
//
// Yang TIDAK dilakukan di sini: menebak. Rung yang tidak cocok pola dibiarkan
// tak terpetakan dengan alasannya, dan langkah yang rantainya tidak tertelusuri
// dibiarkan menunjuk bit aslinya. Flowchart yang memuat urutan palsu lebih
// berbahaya daripada flowchart yang kurang lengkap: yang kurang lengkap
// kelihatan, yang palsu tidak.

// ============================================ rekonstruksi urutan gerakan
// Pola satu langkah gerakan punya bentuk rung yang khas:
//
//   x0y0 prevBit -- x1y0 /confirm ----------> Coil cmd
//                   x1y1 sol - x2y1 lsc ----> Coil confirm
//                   x1y2 confirm (seal)
//
// Pembeda dari rung berkoil-dua yang LAIN - terutama mutex pemilih varian, yang
// juga punya dua coil dan sama-sama menyeal diri - adalah hanya SATU coil yang
// di-gate kontak NC. Pada mutex keduanya saling mengunci, dan itu memang bukan
// langkah gerakan. Ditolak, bukan dipaksa masuk.
const MOTION_SECT = /auto.*runn|autorunn|motion/i;
const COND_SECT = /condition/i;

/**
 * Kontak yang benar-benar mengumpani SATU coil di rung berkoil banyak.
 *
 * Rung pemilih varian punya beberapa coil bertumpuk (LB401..LB404), masing-masing
 * dengan barisan kontaknya sendiri. Tanpa dipisah per coil, seluruh kontak rung
 * terbaca sebagai umpan setiap coil - dan LB401 kelihatan digerbang LB300 SEKALIGUS
 * LB301, LB302, LB303. Batasnya: dari baris coil ini sampai tepat sebelum coil
 * berikutnya.
 */
function coilBand(rung, coil) {
  const coils = rung.elements.filter(e => e.kind === 'Coil' && e.var)
                             .map(e => e.y || 0).sort((a, b) => a - b);
  const y0 = coil.y || 0;
  const next = coils.find(y => y > y0);
  const yEnd = next === undefined ? Infinity : next - 1;
  return rung.elements.filter(e => e.kind === 'Contact' && e.var &&
                                   (e.y || 0) >= y0 && (e.y || 0) <= yEnd);
}

/**
 * Bit syarat pemilih varian, diambil dari section Condition.
 *
 * Bit yang justru digerbang bit syarat LAIN dibuang - itu gerbang gabungan
 * (LB309 = LB300 OR LB301 OR ...), bukan pemilih varian. Kalau ikut terpakai,
 * semua varian jatuh ke syarat yang sama.
 */
function conditionBits(prog) {
  const raw = new Set(), rungOf = new Map();
  for (const s of prog.sections) {
    if (!COND_SECT.test(s.name)) continue;
    for (const r of s.rungs) {
      for (const e of r.elements) {
        if (e.kind === 'Coil' && e.var) { raw.add(e.var); rungOf.set(e.var, [r, e]); }
      }
    }
  }
  const out = new Set();
  raw.forEach(bit => {
    const [r, coil] = rungOf.get(bit);
    if (!coilBand(r, coil).some(c => raw.has(c.var))) out.add(bit);
  });
  return out;
}

/**
 * Peta bit-gerbang-varian -> bit syarat yang menyalakannya.
 *
 * Ini inti pemisahan varian. Urutan gerak dipilih lewat rung mutex: LB401 nyala
 * kalau LB300 nyala, LB402 dari LB301, dan seterusnya. Jadi "varian mana" dijawab
 * dengan menelusuri SIAPA yang menyalakan bit awal langkah itu - bukan dengan
 * menebak dari urutan nomor LB, dan bukan dengan menelusuri rantai sampai mentok
 * (penelusuran bebas malah nyasar lewat plumbing LB499/LB570 dan mendarat di
 * langkah acak).
 */
function variantGates(prog) {
  const cond = conditionBits(prog);
  const gates = new Map();
  for (const s of prog.sections) {
    for (const r of s.rungs) {
      for (const e of r.elements) {
        if (e.kind !== 'Coil' || !e.var || gates.has(e.var)) continue;
        const hit = [...new Set(coilBand(r, e).map(c => c.var))].filter(v => cond.has(v));
        if (hit.length === 1) gates.set(e.var, hit[0]);
      }
    }
  }
  return { gates, cond };
}

function findMotionSteps(section) {
  const steps = [], unmapped = [];
  section.rungs.forEach((r, idx) => {
    const coils = r.elements.filter(e => e.kind === 'Coil' && e.var);
    const cts = r.elements.filter(e => e.kind === 'Contact' && e.var);
    if (coils.length !== 2) { unmapped.push('bukan 2 coil'); return; }
    const ncs = new Set(cts.filter(c => c.nc).map(c => c.var));
    const cand = coils.filter(c => ncs.has(c.var));
    if (cand.length !== 1) {
      unmapped.push(cand.length === 2 ? 'dua coil saling mengunci (mutex), bukan langkah gerakan'
                                      : 'tidak ada coil yang di-gate kontak NC');
      return;
    }
    const confirm = cand[0], cmd = coils.find(c => c !== confirm);
    const p0 = cts.find(c => (c.y || 0) === 0 && (c.x || 0) === 0);
    if (!p0) { unmapped.push('tidak ada kontak di kolom 0 baris 0 (prevBit)'); return; }
    const row = confirm.y || 0;
    const band = cts.filter(c => (c.y || 0) === row &&
                                 c.var !== p0.var && c.var !== cmd.var && c.var !== confirm.var)
                    .sort((a, b) => (a.x || 0) - (b.x || 0));
    if (band.length < 2) { unmapped.push('tidak ketemu pasangan solenoid+sensor di baris confirm'); return; }
    steps.push({ rung: idx + 1, prev: p0.var, sol: band[0].var, lsc: band[1].var,
                 cmd: cmd.var, confirm: confirm.var, comment: r.comment || '' });
  });
  return { steps, unmapped };
}

// Rantai antar langkah sering TIDAK langsung: confirm sebuah langkah kerap tidak
// jadi prevBit langkah berikutnya, melainkan lewat rung perantara. Jadi prevBit
// ditelusuri mundur lewat rung yang menulisnya. Yang tetap tidak ketemu dibiarkan
// menunjuk bit aslinya - bukan disembunyikan, supaya kelihatan perlu dicek.
function chainSteps(section, steps, gates) {
  gates = gates || new Map();
  const byConfirm = new Map();
  steps.forEach((st, i) => byConfirm.set(st.confirm, i));
  const writers = new Map();
  section.rungs.forEach(r => {
    const ins = r.elements.filter(e => e.kind === 'Contact' && e.var).map(e => e.var);
    r.elements.filter(e => e.kind === 'Coil' && e.var).forEach(c => {
      if (!writers.has(c.var)) writers.set(c.var, []);
      writers.get(c.var).push(ins);
    });
  });
  function trace(bit, depth, seen) {
    if (byConfirm.has(bit)) return { idx: byConfirm.get(bit), ok: true };
    // BERHENTI di bit gerbang varian. Bit ini memang awal sebuah urutan - bukan
    // sesuatu yang menunggu langkah lain. Diteruskan, penelusuran malah menyusup
    // ke plumbing global (LB401 -> LB400 -> LB400_A -> LB499 -> LB570 -> LB415)
    // dan mendarat di langkah acak: semua langkah lalu terlihat berantai, satu
    // section jadi satu urutan panjang, dan variannya hilang.
    if (gates.has(bit)) return { bit, ok: false };
    if (depth <= 0 || seen.has(bit)) return { bit, ok: false };
    seen.add(bit);
    for (const ins of (writers.get(bit) || [])) {
      for (const src of ins) {
        if (src === bit) continue;
        const g = trace(src, depth - 1, seen);
        if (g.ok) return g;
      }
    }
    return { bit, ok: false };
  }
  const chain = steps.map(st => {
    const g = trace(st.prev, 6, new Set());
    return Object.assign({}, st, g.ok ? { afterIdx: g.idx } : { afterBit: st.prev });
  });

  // Urutan gerak itu MELINGKAR: langkah terakhir memicu langkah pertama lagi di
  // siklus berikutnya. Kalau semua sambungan diperlakukan sama, tidak ada langkah
  // yang jadi awal - grafnya jadi lingkaran tanpa ujung, START terpaksa ditarik ke
  // SEMUA langkah dan END dari semuanya. Gambarnya lalu tidak menceritakan urutan
  // apa pun.
  //
  // Pembedanya ada di datanya sendiri: dependensi normal menunjuk langkah yang
  // ditulis LEBIH AWAL di section (n2 di rung 7 menunggu n1 di rung 6). Yang
  // menunjuk rung LEBIH AKHIR berarti menunggu langkah dari siklus SEBELUMNYA -
  // itu penutup lingkaran, bukan urutan di dalam satu siklus.
  //
  // Sambungan itu ditandai `loop`, bukan dibuang: informasinya tetap ada (viewer
  // menggambarnya putus-putus), tapi tidak lagi ikut menentukan mana awal urutan.
  chain.forEach(st => {
    if ('afterIdx' in st && chain[st.afterIdx].rung > st.rung) st.loop = true;
  });

  // Aturan rung saja belum cukup. Masih tersisa bentuk yang tidak tertangkap -
  // paling sering langkah yang penelusurannya berujung ke DIRINYA SENDIRI (kontak
  // seal-nya sendiri yang ketemu duluan). Rung-nya tidak "lebih akhir", jadi tidak
  // ikut tertandai, dan lingkarannya tetap utuh.
  //
  // Sisa lingkaran dipatahkan di anggota ber-rung PALING AWAL: dalam konvensi
  // penulisan Denso langkah gerak ditulis berurutan (LB410 ke atas), jadi yang
  // rung-nya paling awal memang awal urutannya.
  for (;;) {
    const cyc = findChainCycle(chain);
    if (!cyc) break;
    let at = cyc[0];
    cyc.forEach(i => { if (chain[i].rung < chain[at].rung) at = i; });
    chain[at].loop = true;
  }
  return chain;
}

/**
 * Cari satu lingkaran pada rantai, abaikan sambungan yang sudah ditandai `loop`.
 * Tiap langkah punya paling banyak SATU sambungan keluar, jadi cukup ditelusuri
 * lurus sampai bertemu simpul yang sedang dilalui.
 */
function findChainCycle(chain) {
  const state = new Array(chain.length).fill(0);   // 0 belum, 1 sedang, 2 selesai
  for (let s = 0; s < chain.length; s++) {
    if (state[s]) continue;
    const path = [];
    let i = s;
    while (i !== undefined && state[i] === 0) {
      state[i] = 1;
      path.push(i);
      const st = chain[i];
      i = ('afterIdx' in st && !st.loop) ? st.afterIdx : undefined;
    }
    const hit = i !== undefined && state[i] === 1;
    path.forEach(j => { state[j] = 2; });
    if (hit) return path.slice(path.indexOf(i));
  }
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = { MOTION_SECT, COND_SECT, coilBand, conditionBits, variantGates,
                     findMotionSteps, chainSteps, findChainCycle };
}
