// ================================================================== tampilan
// Cuma UI. Semua parsing dan penggambaran ada di src/*.js, yang di-inline ke
// berkas ini oleh build.js dan di-require apa adanya oleh cli.js - satu sumber,
// dipakai browser maupun baris perintah.
//   node build.js        -> smc2-viewer.html
// Jangan mengedit smc2-viewer.html langsung: itu hasil build.
let PROJ = null;
let RAW = null;      // isi berkas .smc2 apa adanya - dibutuhkan tab Blok fungsi,
                     // yang membaca bentuk MENTAH elemen, bukan hasil parse
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
  // Digambar terpisah (drawRungs), bukan di sini: tab ini menampilkan SATU section, dan yang
  // menentukan section mana bukan kotak cari melainkan pohon project di kirinya.
  drawTree();
  drawRungs();

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

  // --- silang-rujuk ---
  // Kotak cari dipakai sebagai FILTER, sama persis dengan `--xref LB800` di CLI.
  // Tanpa filter daftarnya ribuan baris dan tidak ada yang membacanya utuh; yang
  // dicari orang selalu satu bit ("ini siapa yang menyalakan?").
  $('#t-xref').textContent = xref(p, $('#q').value.trim() || null);

  // --- variabel ---
  const vs = p.variables.filter(v => hit(v.name) || hit(v.comment) || hit(v.address));
  let vh = '<tr><th>Nama</th><th>Tipe</th><th>Alamat IO</th><th>Grup</th><th>Komen</th></tr>';
  vs.slice(0, 4000).forEach(v => {
    vh += `<tr><td class="mono">${esc(v.name)}</td><td class="mono">${esc(v.type)}</td>` +
          `<td class="mono">${esc(v.address)}</td><td>${esc(v.group)}</td><td>${esc(v.comment)}</td></tr>`;
  });
  $('#t-var').innerHTML = vh;
}


// ======================================================== tab Rung gaya Sysmac Studio
// Satu section tampil sekali jalan. Project sungguhan punya ribuan rung di puluhan section;
// menumpuk semuanya jadi satu daftar panjang bikin "buka section X" berarti menggulir mencari
// judulnya, dan kotak cari jadi satu-satunya cara berpindah - padahal yang dicari orang di tab
// ini bukan kata, melainkan tempat.
let SEL = null;        // { prog, sect } yang sedang dibuka
let TREE_HIDE = false;
let XREF_ON = false;

function sectionsOf(p) {
  const out = [];
  (p.programs || []).forEach(pr => (pr.sections || []).forEach(s => out.push({ pr, s })));
  return out;
}

function findSection(prog, sect) {
  const hit = sectionsOf(PROJ).filter(x => x.pr.name === prog && x.s.name === sect)[0];
  return hit || null;
}

function drawTree() {
  const el = $('#rungTree');
  if (!el) return;
  // Section pertama yang BERISI rung yang dipilih otomatis - section kosong sebagai tampilan
  // pertama terbaca seperti pembacanya gagal, padahal cuma kebetulan section pertama kosong.
  if (!SEL || !findSection(SEL.prog, SEL.sect)) {
    const first = sectionsOf(PROJ).filter(x => (x.s.rungs || []).length)[0] || sectionsOf(PROJ)[0];
    SEL = first ? { prog: first.pr.name, sect: first.s.name } : null;
  }
  let h = '<div class="grp">Programming</div>';
  (PROJ.programs || []).forEach(pr => {
    const tot = (pr.sections || []).reduce((a, x) => a + (x.rungs || []).length, 0);
    h += `<div class="pg" data-prog="${esc(pr.name)}"><span class="caret">&#9660;</span>` +
         `${esc(pr.name)}<span class="cnt">${tot || ''}</span></div>`;
    (pr.sections || []).forEach(x => {
      const n = (x.rungs || []).length;
      const on = SEL && SEL.prog === pr.name && SEL.sect === x.name;
      h += `<div class="sc${on ? ' on' : ''}${n ? '' : ' empty'}" data-prog="${esc(pr.name)}" ` +
           `data-sect="${esc(x.name)}" title="${esc(x.kind || 'kosong')}">${esc(x.name)}` +
           `<span class="cnt">${n || (x.kind === 'st' ? 'ST' : '')}</span></div>`;
    });
  });
  el.innerHTML = h;
  el.className = 'ptree' + (TREE_HIDE ? ' hide' : '');
}

function drawRungs(jumpTo) {
  const box = $('#t-rung');
  if (!box) return;
  const q = ($('#q').value || '').toLowerCase();
  const hit = v => !q || String(v).toLowerCase().includes(q);
  const cur = SEL && findSection(SEL.prog, SEL.sect);
  $('#rungPath').textContent = cur ? SEL.prog + ' \u203a ' + SEL.sect : 'pilih section di kiri';
  if (!cur) { box.innerHTML = '<div class="rung"><i>project belum dibuka</i></div>'; return; }

  if (cur.s.kind === 'st') {
    box.innerHTML = '<pre class="rep" style="margin:0;padding:10px">' + esc(cur.s.st || '') + '</pre>';
    return;
  }
  const list = (cur.s.rungs || []);
  let r = '';
  list.forEach((x, i) => {
    // Pencarian MENYOROT, bukan menyaring: rung yang hilang dari daftar bikin nomor rung di
    // layar tidak lagi sama dengan nomor rung di Studio, dan nomor itu yang dipakai orang
    // waktu bicara satu sama lain.
    const cocok = q && (hit(x.comment) || (x.elements || []).some(e => hit(e.var) || hit(e.func)));
    const { expr, outs, approx } = rungExpr(x);
    const tip = (expr || 'TRUE') + (outs.length ? '  \u2192  ' + outs.join(', ') : '') +
                (approx ? '\n\n~ susunan cabangnya disederhanakan satu tingkat, jadi ini pendekatan.' : '');
    r += `<div class="rung${cocok ? ' hitrow' : ''}" id="rung-${i}" title="${esc(tip)}">` +
         `<div class="n">${i}${approx ? '<b class="ap">~</b>' : ''}</div><div class="b">` +
         (x.comment ? `<div class="c">${esc(x.comment)}</div>` : '') +
         ladderHtml(x) + '</div></div>';
  });
  box.innerHTML = r || '<div class="rung"><i>section ini tidak punya rung</i></div>';

  if (typeof jumpTo === 'number' && box.querySelector) {
    const t = box.querySelector('#rung-' + jumpTo);
    if (t && t.scrollIntoView) {
      t.scrollIntoView({ block: 'center' });
      t.className += ' jumped';
      setTimeout(() => { t.className = t.className.replace(/ ?jumped/, ''); }, 1700);
    }
  }
}

// Silang-rujuk terstruktur: bukan teks laporan, karena tiap barisnya harus bisa DILOMPATI.
// Laporan `xref()` di tab sebelah tetap ada - itu buat dibaca, yang ini buat diklik.
function xrefRows(name) {
  const rows = [];
  if (!name || !PROJ) return rows;
  (PROJ.programs || []).forEach(pr => (pr.sections || []).forEach(s => {
    (s.rungs || []).forEach((r, i) => {
      (r.elements || []).forEach(e => {
        if (e.var !== name) return;
        rows.push({
          prog: pr.name, sect: s.name, rung: i,
          write: e.kind === 'Coil',
          ref: e.kind === 'Coil' ? (e.set ? '-(S)-' : e.reset ? '-(R)-' : '-( )-')
                                 : (e.nc ? '-|/|-' : '-| |-'),
        });
      });
    });
  }));
  return rows;
}

function drawXref(name) {
  const t = $('#xrefTable');
  if (!t) return;
  const rows = xrefRows(name);
  let h = '<tr><th>Item</th><th>Location</th><th>Detail</th><th>Reference</th></tr>';
  if (!name) {
    h += '<tr><td colspan="4"><i>klik nama operand di rung, atau ketik namanya di atas</i></td></tr>';
  } else if (!rows.length) {
    h += `<tr><td colspan="4"><i>${esc(name)} tidak dipakai di rung manapun</i></td></tr>`;
  } else {
    rows.forEach(r => {
      h += `<tr class="hit" data-prog="${esc(r.prog)}" data-sect="${esc(r.sect)}" data-rung="${r.rung}">` +
           `<td class="mono">${esc(name)}</td><td>${esc(r.prog)}.${esc(r.sect)}</td>` +
           `<td>${r.rung}</td><td class="${r.write ? 'w' : 'r'}">${esc(r.ref)}</td></tr>`;
    });
  }
  t.innerHTML = h;
}

function openXref(name) {
  XREF_ON = true;
  $('#xrefDock').style.display = 'flex';
  $('#xrefToggle').className = 'sbtn on';
  if (name !== undefined) $('#xrefTarget').value = name;
  drawXref($('#xrefTarget').value.trim());
}

// Klik di pohon: pilih section. Klik nama program: buka section pertamanya, bukan tidak
// melakukan apa-apa - judul yang tidak bisa diklik terbaca seperti fitur yang belum jadi.
$('#rungTree').addEventListener('click', ev => {
  const sc = ev.target.closest ? ev.target.closest('.sc') : null;
  if (sc) {
    SEL = { prog: sc.getAttribute('data-prog'), sect: sc.getAttribute('data-sect') };
    drawTree(); drawRungs();
    return;
  }
  const pg = ev.target.closest ? ev.target.closest('.pg') : null;
  if (pg) {
    const nama = pg.getAttribute('data-prog');
    const pr = (PROJ.programs || []).filter(x => x.name === nama)[0];
    const s = pr && ((pr.sections || []).filter(x => (x.rungs || []).length)[0] || pr.sections[0]);
    if (s) { SEL = { prog: nama, sect: s.name }; drawTree(); drawRungs(); }
  }
});

$('#treeToggle').addEventListener('click', () => {
  TREE_HIDE = !TREE_HIDE;
  $('#rungTree').className = 'ptree' + (TREE_HIDE ? ' hide' : '');
});

$('#xrefToggle').addEventListener('click', () => {
  XREF_ON = !XREF_ON;
  $('#xrefDock').style.display = XREF_ON ? 'flex' : 'none';
  $('#xrefToggle').className = 'sbtn' + (XREF_ON ? ' on' : '');
  if (XREF_ON) drawXref($('#xrefTarget').value.trim());
});
$('#xrefClose').addEventListener('click', () => {
  XREF_ON = false;
  $('#xrefDock').style.display = 'none';
  $('#xrefToggle').className = 'sbtn';
});
$('#xrefTarget').addEventListener('input', () => drawXref($('#xrefTarget').value.trim()));

// Klik nama operand di dalam ladder -> jadikan Reference Target. Ini yang bikin pertanyaan
// pertama waktu membaca program orang ("bit ini siapa yang nyalain?") kejawab tanpa berpindah tab.
$('#t-rung').addEventListener('click', ev => {
  const el = ev.target;
  if (!el) return;
  // Elemen dibungkus <g class="el" data-var>, jadi klik di simbolnya, di namanya, di
  // komentarnya, atau di ruang kosong selnya sama-sama kena. Teks nama tetap diterima
  // sebagai cadangan - rung yang digambar sebelum pembungkusnya ada tetap bisa diklik.
  const g = el.closest ? el.closest('g.el') : null;
  const cls = el.getAttribute ? (el.getAttribute('class') || '') : '';
  const nama = g ? g.getAttribute('data-var')
             : (cls.indexOf('nm') >= 0 ? (el.textContent || '').trim() : '');
  if (nama) openXref(nama);
});

// Baris silang-rujuk diklik -> pindah section DAN gulir ke rungnya. Tanpa yang kedua,
// lompatannya mendarat di awal section dan yang dicari tetap harus dicari lagi.
$('#xrefTable').addEventListener('click', ev => {
  const tr = ev.target.closest ? ev.target.closest('tr.hit') : null;
  if (!tr) return;
  SEL = { prog: tr.getAttribute('data-prog'), sect: tr.getAttribute('data-sect') };
  drawTree();
  drawRungs(+tr.getAttribute('data-rung'));
});

// ---------------------------------------------------------------- kejadian
async function load(file) {
  $('#err').textContent = '';
  $('#drop .big').textContent = 'Membaca ' + file.name + ' ...';
  try {
    RAW = await file.arrayBuffer();
    FB_DONE = false;
    $('#t-exp').textContent = '';
    PROJ = await readProject(RAW, unzip);
    PROJ.file = file.name;
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

let FB_DONE = false;

document.querySelectorAll('button.tab').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('button.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('on'));
  b.classList.add('active');
  $('#p-' + b.dataset.p).classList.add('on');
  // Probe blok fungsi membaca ULANG seluruh berkas mentah, jadi dihitung waktu
  // tabnya dibuka - bukan tiap kali ada yang mengetik di kotak cari.
  if (b.dataset.p === 'fb' && !FB_DONE && RAW) {
    FB_DONE = true;
    $('#t-fb').textContent = 'membaca bentuk mentah elemen fungsi ...';
    probeFb(RAW, unzip).then(s => { $('#t-fb').textContent = s; })
                       .catch(e => { $('#t-fb').textContent = 'Gagal: ' + e.message; FB_DONE = false; });
  }
}));

let t = null;
$('#q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 180); });

// ------------------------------------------------------------------- ekspor
// Tiap perintah cli.js yang menghasilkan BERKAS punya tombolnya di sini, dan
// isinya dihitung modul yang SAMA (src/reports.js, src/xmlout.js). Menghitungnya
// sendiri di UI berarti dua jawaban untuk satu pertanyaan, dan yang tampilannya
// bagus yang dipercaya orang.
function download(name, data, mime) {
  const b = new Blob([data], { type: mime || 'text/plain' });
  const u = URL.createObjectURL(b), a = document.createElement('a');
  a.href = u; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  // Jangan dicabut seketika: waktu beberapa berkas diunduh beruntun, sebagian
  // browser membatalkan yang URL-nya sudah hilang sebelum unduhannya mulai.
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}
const stem = () => (PROJ.solution || 'sysmac').replace(/[^\w.-]+/g, '_');

$('#x-json').addEventListener('click', () =>
  download(stem() + '.json', JSON.stringify(PROJ, null, 2), 'application/json'));

$('#x-llm').addEventListener('click', () => {
  const md = llmDump(PROJ);
  download(stem() + '.md', md, 'text/markdown');
  $('#t-exp').textContent = 'WROTE ' + stem() + '.md  (' + md.split('\n').length + ' baris)';
});

$('#x-graph').addEventListener('click', () => {
  const g = graphData(PROJ);
  download(stem() + '-graph.json', JSON.stringify(g, null, 2), 'application/json');
  $('#t-exp').textContent = 'WROTE ' + stem() + '-graph.json  (' +
    g.nodes.length + ' node, ' + g.edges.length + ' edge)';
});

$('#x-flow').addEventListener('click', () => {
  const { result, report } = flowchart(PROJ);
  download(stem() + '-motionSequences.json', JSON.stringify(result, null, 2), 'application/json');
  $('#t-exp').textContent = 'WROTE ' + stem() + '-motionSequences.json\n\n' + flowchartReport(report);
});

$('#x-xml').addEventListener('click', () => {
  const { files, report } = exportProject(PROJ, SGLIB);
  // Laporannya ditulis DULUAN, sebelum unduhan mulai - di situ tertulis berapa
  // rung yang jadi lubang dan kenapa. Berkas yang diambil tanpa membaca itu
  // tampak lengkap padahal tidak.
  $('#t-exp').textContent = 'WROTE ' + files.length + ' berkas\n\n' + exportReport(report);
  // ponytail: diunduh satu per satu, bukan dibungkus ZIP - src/zip.js cuma bisa
  // MEMBACA zip. Kalau jumlah programnya bikin ini mengganggu, baru tulis
  // pembungkus ZIP stored (butuh CRC32, sekitar 40 baris).
  files.forEach((f, i) => setTimeout(() => download(f.name, f.xml, 'application/xml'), i * 300));
});

if (!window.DecompressionStream) {
  $('#err').textContent = 'Browser ini belum mendukung DecompressionStream. Pakai Chrome/Edge versi baru.';
}
