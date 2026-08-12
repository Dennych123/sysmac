// ================================================================== tampilan
// Cuma UI. Semua parsing dan penggambaran ada di src/*.js, yang di-inline ke
// berkas ini oleh build.js dan di-require apa adanya oleh cli.js - satu sumber,
// dipakai browser maupun baris perintah.
//   node build.js        -> smc2-viewer.html
// Jangan mengedit smc2-viewer.html langsung: itu hasil build.
let PROJ = null;
const $ = s => document.querySelector(s);

function render() {
  const p = PROJ;
  setSymbols(p.variables);
  let secs = 0, rungs = 0;
  p.programs.forEach(pr => { secs += pr.sections.length; pr.sections.forEach(s => rungs += s.rungs.length); });
  const withAddr = p.variables.filter(v => v.address).length;

  $('#meta').innerHTML =
    `<div>Solution<b>${esc(p.solution || '-')}</b></div>` +
    `<div>Sysmac Studio<b>${esc(p.studio || '-')}</b></div>` +
    `<div>Program<b>${p.programs.length}</b></div>` +
    `<div>Section<b>${secs}</b></div>` +
    `<div>Rung<b>${rungs}</b></div>` +
    `<div>Variabel<b>${p.variables.length}</b></div>` +
    `<div>Beralamat IO<b>${withAddr}</b></div>`;

  $('#out').style.display = 'block';
  draw();
}

function draw() {
  const q = ($('#q').value || '').toLowerCase();
  const hit = s => !q || String(s).toLowerCase().includes(q);
  const p = PROJ;

  // --- ringkasan ---
  let h = '<tr><th>Program / Section</th><th class="num">Rung</th><th>Jenis</th></tr>';
  p.programs.forEach(pr => {
    const rows = pr.sections.filter(s => hit(s.name) || hit(pr.name));
    if (!rows.length) return;
    const tot = pr.sections.reduce((a, s) => a + s.rungs.length, 0);
    h += `<tr class="prog"><td>${esc(pr.name)}</td><td class="num">${tot}</td><td>${pr.sections.length} section</td></tr>`;
    rows.forEach(s => {
      h += `<tr><td style="padding-left:26px">${esc(s.name)}</td><td class="num">${s.rungs.length || ''}</td>` +
           `<td><span class="tag">${s.kind || 'kosong'}</span></td></tr>`;
    });
  });
  $('#t-sum').innerHTML = h;

  // --- rung ---
  let r = '';
  p.programs.forEach(pr => pr.sections.forEach(s => {
    if (!s.rungs.length) return;
    const list = s.rungs.filter(x => !q || hit(x.comment) || x.elements.some(e => hit(e.var)));
    if (!list.length) return;
    r += `<div class="sec-h">${esc(pr.name)} &rsaquo; ${esc(s.name)} &mdash; ${list.length} rung</div>`;
    list.slice(0, 200).forEach((x, i) => {
      // Ekspresi boolean TIDAK lagi dicetak sebagai baris sendiri - barisnya
      // memutus aliran antar rung, dan yang dicari orang di tab ini bentuk
      // ladder-nya. Tapi tanda `~` (susunan cabang cuma pendekatan) TIDAK boleh
      // hilang: dia pindah jadi penanda kecil di kolom nomor, dan ekspresi
      // lengkapnya jadi tooltip. Terlihat kalau dicari, tidak mengganggu kalau
      // tidak - yang penting bukan disembunyikan.
      const { expr, outs, approx } = rungExpr(x);
      const tip = (expr || 'TRUE') + (outs.length ? '  →  ' + outs.join(', ') : '') +
                  (approx ? '\n\n~ susunan cabangnya disederhanakan satu tingkat, jadi ini pendekatan.' : '');
      // Tidak ada lagi daftar alamat per rung. Komentarnya sudah tergambar hijau
      // di bawah tiap simbol; barisnya cuma memutus aliran antar rung. Alamat
      // fisiknya tetap ada di tab Variabel dan di tooltip.
      r += `<div class="rung" title="${esc(tip)}">` +
           `<div class="n">${i + 1}${approx ? '<b class="ap">~</b>' : ''}</div><div class="b">` +
           (x.comment ? `<div class="c">${esc(x.comment)}</div>` : '') +
           ladderHtml(x) + '</div></div>';
    });
    if (list.length > 200) r += `<div class="rung"><i>... ${list.length - 200} rung lagi disembunyikan (pakai pencarian untuk menyaring)</i></div>`;
  }));
  $('#t-rung').innerHTML = r || '<div class="rung"><i>tidak ada rung yang cocok</i></div>';

  // --- flowchart urutan gerakan ---
  let f = '';
  let anySect = false;
  p.programs.forEach(pr => pr.sections.forEach(s => {
    if (!MOTION_SECT.test(s.name) || !s.rungs.length) return;
    if (/output/i.test(s.name)) return;          // itu keluaran, bukan urutan
    anySect = true;
    const { steps, unmapped } = findMotionSteps(s);
    // Varian dihitung dari rantai LENGKAP - `afterIdx` itu index ke dalamnya,
    // jadi menyaringnya dulu bikin rujukan antar node meleset. Pencariannya
    // menyaring VARIAN mana yang ditampilkan, bukan langkah mana yang dihitung.
    // Gerbang varian dicari per PROGRAM - bit syaratnya ditulis di section
    // Condition, bukan di AutoRunning.
    const { gates } = variantGates(pr);
    const chain = chainSteps(s, steps, gates);
    const vars = stepsToVariants(chain, s.name, gates);
    const shown = vars.filter(v => !q || hit(s.name) || hit(pr.name) || hit(v.gate) ||
      v.steps.some(st => hit(st.sol) || hit(st.lsc) || hit(st.comment) || hit(VCMT.get(st.sol) || '')));
    if (!shown.length) return;

    f += `<div class="sec-h">${esc(pr.name)} &rsaquo; ${esc(s.name)} &mdash; ` +
         `${steps.length} langkah dari ${s.rungs.length} rung` +
         (vars.length > 1 ? ` &mdash; ${vars.length} varian urutan` : '') + '</div>';

    // Satu graph PER VARIAN, digambar mesin flowchart yang sama dengan editor
    // generator. Satu section boleh punya beberapa urutan yang dipilih lewat bit
    // syaratnya masing-masing (pemilihan TIPE) - digabung jadi satu graph, dua
    // urutan yang tidak pernah jalan bersamaan malah terlihat seperti satu alur.
    shown.forEach((v, vi) => {
      const key = (pr.name + '-' + s.name + '-' + vi).replace(/\W+/g, '_');
      f += '<div class="fc">' +
        `<div class="fc-head">Varian ${vi + 1} dari ${vars.length}` +
        (v.variant.condition
          ? ` &mdash; syarat <code>${esc(v.variant.condition)}</code>` +
            (VCMT.get(v.variant.condition) ? ' <i>' + esc(VCMT.get(v.variant.condition)) + '</i>' : '')
          : ' &mdash; <i>tanpa bit syarat (akar rantainya tidak tertelusuri)</i>') +
        `  &middot;  ${v.steps.length} langkah</div>` +
        graphSvg(v.variant, key) +
        '<div class="fc-note">Kotak biru = langkah gerakan (solenoid). Kotak ungu putus-putus = ' +
        'bit syarat di luar rantai. Panah = "menunggu selesainya". START/END murni penanda, ' +
        'bukan bagian program.</div>' +
        '<table class="fc-tab"><tr><th>#</th><th>rung</th><th>solenoid</th><th>sensor</th>' +
        '<th>perintah</th><th>selesai</th><th>menunggu</th></tr>' +
        v.steps.map((st, i) => `<tr><td>n${i + 1}</td><td>${st.rung}</td>` +
          `<td>${esc(st.sol)}<i>${esc(VCMT.get(st.sol) || '')}</i></td>` +
          `<td>${esc(st.lsc)}<i>${esc(VCMT.get(st.lsc) || '')}</i></td>` +
          `<td>${esc(st.cmd)}</td><td>${esc(st.confirm)}</td>` +
          // Langkah yang berantai selalu menunggu langkah di VARIAN YANG SAMA -
          // itu memang definisi variannya (seakar), jadi index lokalnya pasti ada.
          `<td>${'afterIdx' in st ? 'n' + (v.steps.indexOf(chain[st.afterIdx]) + 1)
                                  : esc(st.afterBit) + ' <b>(di luar rantai)</b>'}</td></tr>`).join('') +
        '</table></div>';
    });

    if (unmapped.length) {
      const why = {};
      unmapped.forEach(u => { why[u] = (why[u] || 0) + 1; });
      f += '<div class="fc-skip">' + s.rungs.length + ' rung, ' + steps.length +
           ' dikenali sebagai langkah. Sisanya bukan langkah gerakan: ' +
           Object.entries(why).map(([k, v]) => v + '&times; ' + esc(k)).join(', ') + '</div>';
    }
  }));
  if (anySect) {
    const nc = [];
    p.programs.forEach(pr => pr.sections.forEach(s => {
      if (!MOTION_SECT.test(s.name) || /output/i.test(s.name) || !s.rungs.length) return;
      const { steps } = findMotionSteps(s);
      const ch = chainSteps(s, steps, variantGates(pr).gates);
      nc.push([steps.length, ch.filter(x => 'afterIdx' in x).length]);
    }));
    const tot = nc.reduce((a, b) => a + b[0], 0), chd = nc.reduce((a, b) => a + b[1], 0);
    if (tot && chd < tot) {
      f = `<div class="fc-warn"><b>${chd} dari ${tot} langkah berhasil dirantai.</b> Sisanya berangkat ` +
          `dari bit syarat (kotak ungu) karena rantainya lewat rung perantara yang tidak tertelusuri. ` +
          `Urutannya perlu dicek manual &mdash; yang ditampilkan di sini adalah apa yang benar-benar ` +
          `terbaca dari program, bukan urutan yang dikarang.</div>` + f;
    }
  }
  $('#t-flow').innerHTML = f ||
    '<div class="fc"><i>tidak ada section AutoRunning dengan pola langkah gerakan yang dikenali</i></div>';

  // --- operand ---
  const use = new Map(), cmt = new Map();
  p.programs.forEach(pr => pr.sections.forEach(s => s.rungs.forEach(x => x.elements.forEach(e => {
    if (!e.var) return;
    use.set(e.var, (use.get(e.var) || 0) + 1);
  }))));
  p.variables.forEach(v => { if (v.comment) cmt.set(v.name, v.comment); });
  const ops = [...use.entries()].filter(([v]) => hit(v) || hit(cmt.get(v) || '')).sort((a, b) => b[1] - a[1]);
  let o = `<tr><th>Operand</th><th class="num">Dipakai</th><th>Komen dari tabel variabel</th></tr>`;
  ops.slice(0, 3000).forEach(([v, c]) => {
    o += `<tr><td class="mono">${esc(v)}</td><td class="num">${c}</td><td>${esc(cmt.get(v) || '')}</td></tr>`;
  });
  $('#t-op').innerHTML = o;

  // --- variabel ---
  const vs = p.variables.filter(v => hit(v.name) || hit(v.comment) || hit(v.address));
  let vh = '<tr><th>Nama</th><th>Tipe</th><th>Alamat IO</th><th>Grup</th><th>Komen</th></tr>';
  vs.slice(0, 4000).forEach(v => {
    vh += `<tr><td class="mono">${esc(v.name)}</td><td class="mono">${esc(v.type)}</td>` +
          `<td class="mono">${esc(v.address)}</td><td>${esc(v.group)}</td><td>${esc(v.comment)}</td></tr>`;
  });
  $('#t-var').innerHTML = vh;
}

// ---------------------------------------------------------------- kejadian
async function load(file) {
  $('#err').textContent = '';
  $('#drop .big').textContent = 'Membaca ' + file.name + ' ...';
  try {
    PROJ = await readProject(await file.arrayBuffer(), unzip);
    $('#drop .big').textContent = file.name;
    $('#drop .sub').textContent = 'klik untuk ganti file';
    render();
  } catch (e) {
    $('#drop .big').textContent = 'Jatuhkan file .smc2 di sini';
    $('#err').textContent = 'Gagal membaca: ' + e.message;
    console.error(e);
  }
}

$('#drop').addEventListener('click', () => $('#file').click());
$('#file').addEventListener('change', e => { if (e.target.files[0]) load(e.target.files[0]); });
['dragenter', 'dragover'].forEach(t => $('#drop').addEventListener(t, e => {
  e.preventDefault(); $('#drop').classList.add('over');
}));
['dragleave', 'drop'].forEach(t => $('#drop').addEventListener(t, e => {
  e.preventDefault(); $('#drop').classList.remove('over');
}));
$('#drop').addEventListener('drop', e => { if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

document.querySelectorAll('button.tab').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('button.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('on'));
  b.classList.add('active');
  $('#p-' + b.dataset.p).classList.add('on');
}));

let t = null;
$('#q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 180); });

$('#dl').addEventListener('click', () => {
  const b = new Blob([JSON.stringify(PROJ, null, 2)], { type: 'application/json' });
  const u = URL.createObjectURL(b), a = document.createElement('a');
  a.href = u; a.download = (PROJ.solution || 'sysmac') + '.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
});

if (!window.DecompressionStream) {
  $('#err').textContent = 'Browser ini belum mendukung DecompressionStream. Pakai Chrome/Edge versi baru.';
}
