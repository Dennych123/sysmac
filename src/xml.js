// Pembaca XML kecil - cukup buat bentuk yang dipakai .smc2, tidak lebih.
//
// Kenapa tidak pakai DOMParser: DOMParser cuma ada di browser. Selama jalur XML
// (Studio <= 1.56) bergantung padanya, jalur itu TIDAK BISA diuji di Node sama
// sekali - dan memang selama ini nol tes. Satu pembaca sendiri bikin jalur lama
// dan jalur baru sama-sama teruji, di dua lingkungan, dengan hasil yang sama.
//
// Yang didukung: elemen, atribut (kutip tunggal/ganda), tag menutup-sendiri,
// teks, komentar, CDATA, dan deklarasi <?...?>. Namespace TIDAK diurai - nama
// atribut disimpan apa adanya ("i:type", "z:Id"), persis seperti tertulis di
// berkas. Itu memang yang dibutuhkan di sini, dan bikin perilakunya gampang
// ditebak. Yang TIDAK didukung: DTD, entity buatan sendiri, xml:space.

const XML_ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function xmlUnesc(s) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X'
        ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return XML_ENT[e] !== undefined ? XML_ENT[e] : m;
  });
}

/** Simpul XML: {tag, attrs, kids, text}. `text` = gabungan teks langsung anaknya. */
function XmlNode(tag) { return { tag, attrs: {}, kids: [], text: '' }; }

/**
 * Urai teks XML jadi satu simpul akar.
 * Melempar Error kalau tag tidak menutup - lebih baik berhenti daripada
 * mengembalikan pohon separuh yang nanti kebaca sebagai "project kosong".
 */
function xmlParse(src) {
  // Normalisasi akhir baris WAJIB menurut spesifikasi XML: "\r\n" dan "\r"
  // tunggal jadi "\n". Tanpa ini isi ST dan komentar multi-baris kebaca dengan
  // "\r" nyangkut - kelihatan sama di layar, tapi beda begitu dibandingkan,
  // di-diff, atau dijadikan kunci.
  src = src.replace(/\r\n?/g, '\n');
  const root = XmlNode('#root');
  const stack = [root];
  let i = 0;
  const n = src.length;

  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt < 0) break;
    if (lt > i) {
      const t = src.slice(i, lt);
      if (t.trim()) stack[stack.length - 1].text += xmlUnesc(t);
    }

    if (src.startsWith('<!--', lt)) { i = src.indexOf('-->', lt); i = i < 0 ? n : i + 3; continue; }
    if (src.startsWith('<![CDATA[', lt)) {
      const end = src.indexOf(']]>', lt);
      stack[stack.length - 1].text += src.slice(lt + 9, end < 0 ? n : end);
      i = end < 0 ? n : end + 3;
      continue;
    }
    if (src.startsWith('<?', lt)) { i = src.indexOf('?>', lt); i = i < 0 ? n : i + 2; continue; }
    if (src.startsWith('<!', lt)) { i = src.indexOf('>', lt); i = i < 0 ? n : i + 1; continue; }

    if (src[lt + 1] === '/') {                       // tag penutup
      const gt = src.indexOf('>', lt);
      if (stack.length > 1) stack.pop();
      i = gt < 0 ? n : gt + 1;
      continue;
    }

    // tag pembuka: cari '>' yang TIDAK di dalam nilai atribut berkutip
    let j = lt + 1, q = null;
    for (; j < n; j++) {
      const c = src[j];
      if (q) { if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === '>') break;
    }
    if (j >= n) throw new Error('XML: tag tidak ditutup di posisi ' + lt);

    let body = src.slice(lt + 1, j);
    const selfClose = body.endsWith('/');
    if (selfClose) body = body.slice(0, -1);

    const sp = body.search(/[\s]/);
    const tag = (sp < 0 ? body : body.slice(0, sp)).trim();
    const node = XmlNode(tag);
    if (sp >= 0) {
      const re = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
      let m;
      while ((m = re.exec(body))) {
        node.attrs[m[1]] = xmlUnesc(m[3] !== undefined ? m[3] : m[4]);
      }
    }
    stack[stack.length - 1].kids.push(node);
    if (!selfClose) stack.push(node);
    i = j + 1;
  }
  return root.kids.length === 1 ? root.kids[0] : root;
}

/** Anak LANGSUNG pertama bertag `tag` (null kalau tidak ada). */
function xmlChild(node, tag) {
  for (const k of node.kids) if (k.tag === tag) return k;
  return null;
}

/** Semua keturunan bertag `tag`, termasuk simpulnya sendiri. */
function xmlFindAll(node, tag, out) {
  out = out || [];
  if (node.tag === tag) out.push(node);
  for (const k of node.kids) xmlFindAll(k, tag, out);
  return out;
}

/** Teks anak langsung bertag `tag`, sudah di-trim ('' kalau tidak ada). */
function xmlChildText(node, tag) {
  const c = xmlChild(node, tag);
  return c ? c.text.trim() : '';
}

if (typeof module !== 'undefined') {
  module.exports = { xmlParse, xmlChild, xmlChildText, xmlFindAll, xmlUnesc };
}
