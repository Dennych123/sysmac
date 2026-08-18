import json, os

_D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# encoding WAJIB disebut. Tanpa itu Python pakai encoding bawaan OS - cp1252 di Windows - dan
# berkas js yang UTF-8 dibaca sebagai byte cp1252: '■' di gen_all.js masuk ke index.html
# sebagai 'a-'. Tidak ada error, tidak ada peringatan, cuma karakter yang salah di layar.
J = lambda f: open(os.path.join(_D, 'js', f), encoding='utf-8').read()

PARSE   = J('parse.js')
GENNAME = J('genname.js')
VALIDATE = J('validate.js')
SPLIT   = J('split.js')
LIB     = J('lib.js')
GEN_ALL = LIB + "\n" + J('gen_all.js')

HTML = '''<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Susmax Program Generator</title>
<style>
  /* Tool ini dipakai di layar PC dan isinya padat teks. Dua keputusan dasar di sini:
     (1) lebar ikut layar sampai 1680px - tabel IO, kanvas flowchart, dan JSON semuanya butuh ruang
         horizontal; dikurung 1040px bikin semuanya kesempitan dan sering wrap gak perlu.
     (2) teks sekunder DINAIKIN kontras dan ukurannya. Sebelumnya .hint 11px warna #5c6673 - itu
         gabungan terburuk: kecil DAN pudar, padahal isinya penjelasan yang justru perlu dibaca. */
  :root{
    --fg:#111827;--muted:#4b5563;--faint:#6b7280;
    --line:#d6dbe3;--line-soft:#e6eaf0;--card:#fff;--bg:#f1f4f8;
    --accent:#2563eb;--accent-dk:#1d4ed8;--accent-soft:#eff5ff;
    --ok:#15803d;--warn:#b45309;--danger:#b91c1c;
    --radius:8px;--shadow:0 1px 2px rgba(16,24,40,.06),0 1px 3px rgba(16,24,40,.08);
  }
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
       max-width:1680px;margin:0 auto;padding:24px 28px 64px;color:var(--fg);background:var(--bg);
       font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
  h1{font-size:22px;font-weight:650;margin:0 0 2px;letter-spacing:-.01em}
  /* Judul section: teks penuh kontras + garis aksen di kiri, bukan huruf kapital abu-abu kecil yang
     dulu malah kebaca lebih lemah dari isinya. */
  h2{font-size:15px;font-weight:650;color:var(--fg);margin:32px 0 8px;padding:0 0 0 10px;
     border-left:3px solid var(--accent);line-height:1.3}
  code{font-family:Consolas,Menlo,monospace;font-size:.92em;background:var(--accent-soft);
       border:1px solid #dbe6fb;border-radius:4px;padding:1px 4px}
  textarea{width:100%;box-sizing:border-box;font-family:Consolas,Menlo,monospace;font-size:12.5px;
           line-height:1.5;border:1px solid var(--line);border-radius:6px;padding:10px;background:var(--card);
           color:var(--fg)}
  textarea:focus,input:focus,select:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:var(--accent)}
  #ioText{height:240px}

  /* ===== Editor IO list mode tabel ===== */
  .io-tabs{display:flex;align-items:center;gap:6px;margin:8px 0 6px}
  .io-tab{background:transparent;color:var(--muted);border:1px solid var(--line);padding:6px 14px;margin:0;
          font-size:13px;font-weight:500;border-radius:6px}
  .io-tab:hover{background:#e8edf5;color:var(--fg)}
  .io-tab.active{background:var(--accent);border-color:var(--accent);color:#fff}
  .io-count{margin-left:auto;font-size:12.5px;color:var(--muted)}
  .io-grid-scroll{max-height:460px;overflow:auto;border:1px solid var(--line);border-radius:7px;background:var(--card)}
  #ioGrid{border-collapse:separate;border-spacing:0;width:100%;font-size:12.5px}
  #ioGrid th{position:sticky;top:0;z-index:1;background:#eef2f8;text-align:left;font-weight:600;font-size:12px;
             color:var(--muted);padding:8px 8px;border-bottom:1px solid var(--line);white-space:nowrap}
  #ioGrid td{padding:3px 6px;border-bottom:1px solid var(--line-soft);vertical-align:middle}
  #ioGrid tr:last-child td{border-bottom:none}
  #ioGrid tr:hover td{background:#f8fafc}
  #ioGrid .rn{color:var(--faint);font-size:11px;text-align:right;width:38px;font-family:Consolas,monospace}
  #ioGrid input,#ioGrid select{font-size:12.5px;padding:5px 6px;border:1px solid var(--line);border-radius:5px;
                               background:#fff;color:var(--fg);width:100%}
  #ioGrid input{font-family:Consolas,monospace}
  #ioGrid .c-addr{width:130px}
  /* Selebar label terpanjang ("SRV_CMD - Servo command (N positions)"). Kesempitan sedikit saja
     dan Windows memotong teksnya jadi "...(dipas" - pilihannya jadi tidak bisa dibedakan. */
  #ioGrid .c-jenis{width:270px}
  #ioGrid .c-io{width:92px}
  #ioGrid .c-st{width:64px}
  #ioGrid .c-del{width:34px}
  #ioGrid .bad input,#ioGrid .bad select{border-color:var(--danger);background:#fef2f2}
  #ioGrid .st-tag{display:inline-block;font-family:Consolas,monospace;font-size:11px;padding:1px 6px;border-radius:4px;
                  background:#eef2ff;color:#3730a3;border:1px solid #dbe0fb}
  #ioGrid .st-tag.main{background:#f1f5f9;color:#475569;border-color:#e2e8f0}
  #ioGrid .rm{background:#e5e7eb;color:#374151;padding:3px 8px;margin:0;font-size:12px;line-height:1}
  #ioGrid .rm:hover{background:var(--danger);color:#fff}
  .io-grid-bar{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap}
  .io-add{background:#374151;padding:6px 12px;margin:0;font-size:12.5px}
  .io-add:hover{background:#1f2937}
  .io-problems{font-size:12.5px;color:var(--danger);font-weight:500}
  .io-problems.ok{color:var(--ok);font-weight:400}
  button{padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;background:var(--accent);color:#fff;
         border:none;border-radius:6px;margin-top:8px;transition:background .12s,box-shadow .12s}
  button:hover{background:var(--accent-dk)}
  button:focus-visible{outline:2px solid var(--fg);outline-offset:2px}
  button.dl{background:#374151;padding:5px 11px;margin:0}
  button.dl:hover{background:#1f2937}
  #genBtn{font-size:14px;padding:10px 22px;box-shadow:var(--shadow)}
  .hint{font-size:12.5px;color:var(--muted);margin:6px 0;max-width:110ch}
  #err{white-space:pre-wrap;color:var(--danger);font-family:Consolas,monospace;font-size:12.5px;margin-top:10px}
  #stats{white-space:pre-wrap;color:var(--fg);font-family:Consolas,monospace;font-size:12px;line-height:1.6;
         margin-top:14px;background:var(--card);border:1px solid var(--line);border-radius:7px;padding:12px 14px;
         box-shadow:var(--shadow);overflow-x:auto}

  .warn-box{display:none;background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #d97706;
            border-radius:7px;padding:12px 14px;margin-top:12px}
  .warn-box b{color:#92400e;font-size:13px}
  #warn{color:#78350f;font-size:12.5px;line-height:1.6;margin-top:6px}
  .warn-grp{font-weight:650;color:#92400e;margin:8px 0 2px;font-size:12.5px}
  .warn-grp:first-child{margin-top:2px}
  .warn-item{display:flex;gap:8px;align-items:baseline;padding:2px 0 2px 4px}
  .warn-code{flex:none;font-family:Consolas,monospace;font-size:11px;background:#fef3c7;border:1px solid #fcd34d;
             border-radius:3px;padding:0 5px;color:#92400e}

  .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .brand h1{margin:0}
  .by{font-size:12px;color:var(--muted);margin-top:2px}
  .by a{color:var(--muted);text-decoration:none;border-bottom:1px dotted var(--line)}
  .by a:hover{color:var(--fg)}
  .foot{margin:34px 0 8px;padding-top:14px;border-top:1px solid var(--line);
        font-size:12px;color:var(--muted);display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  .foot a{color:var(--muted);text-decoration:none;border-bottom:1px dotted var(--line)}
  .foot a:hover{color:var(--fg)}
  .foot .dot{opacity:.5}
  .sec-head{display:flex;align-items:center;gap:2px;margin:26px 0 6px}
  .sec-head h2{margin:0}
  /* Ikon bantuan: teks panjang pindah ke sini supaya halaman tetap terbaca sekali lihat.
     Tooltip-nya CSS murni - tidak ada JS yang bisa nyangkut, dan tetap jalan di file://. */
  .help{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;
        border-radius:9px;border:1px solid var(--line);color:var(--muted);font-size:11px;font-weight:700;
        cursor:help;position:relative;margin-left:6px;vertical-align:middle;user-select:none}
  .help:hover{border-color:var(--muted);color:var(--fg)}
  .help::after{content:attr(data-tip);position:absolute;left:0;top:calc(100% + 7px);
        width:340px;max-width:76vw;background:var(--card);color:var(--fg);border:1px solid var(--line);
        border-radius:8px;padding:9px 11px;font-size:12.5px;font-weight:400;line-height:1.55;text-align:left;
        box-shadow:0 8px 24px rgba(0,0,0,.20);opacity:0;visibility:hidden;transition:opacity .12s;
        z-index:60;pointer-events:none}
  .help:hover::after{opacity:1;visibility:visible}
  .settings-row label .help{margin-left:4px}
  .settings-row{display:flex;flex-wrap:wrap;gap:16px;margin:10px 0}
  .settings-row label{font-size:12.5px;color:var(--muted);display:flex;flex-direction:column;gap:4px;font-weight:500}
  .settings-row input,.settings-row select{font-family:Consolas,monospace;font-size:13px;padding:7px 9px;
                      border:1px solid var(--line);border-radius:6px;width:140px;background:var(--card);color:var(--fg)}
  .settings-row select{width:auto;min-width:220px}
  .settings-row label.chk{flex-direction:row;align-items:center;gap:7px;align-self:flex-end;padding-bottom:8px}
  .settings-row label.chk input{width:auto}
  .hmi-map{max-height:340px;overflow:auto;margin-top:8px;border:1px solid var(--line);border-radius:7px}
  .btn-sm{align-self:flex-end;font-size:12.5px;padding:7px 12px;border:1px solid var(--line);border-radius:6px;
          background:var(--card);color:var(--fg);cursor:pointer;font-weight:600}
  .btn-sm:hover{border-color:var(--muted)}
  .array-sheet .row{flex-wrap:wrap;gap:8px;align-items:center}
  .array-sheet .hint{margin:4px 0 0}
  .sheet-ctl{font-family:Consolas,monospace;font-size:12.5px;padding:5px 8px;border:1px solid var(--line);
             border-radius:6px;background:var(--card);color:var(--fg)}
  .sheet-chk{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted)}
  .sheet-msg{font-size:12.5px;color:var(--muted);min-width:120px}
  /* Perintah CLI ditampilkan apa adanya biar bisa diblok manual - tombol salin butuh
     clipboard API, dan di file:// API itu tidak ada sama sekali. */
  .nb-cmd{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;background:var(--bg);
    border:1px solid var(--line);border-radius:6px;padding:6px 8px;margin:6px 0;
    overflow-x:auto;white-space:pre;user-select:all}
  .sheet-wrap{max-height:420px;overflow:auto;margin-top:8px;border:1px solid var(--line);border-radius:7px}
  .sheet{border-collapse:collapse;width:100%;font-family:Consolas,monospace;font-size:12px}
  .sheet th{position:sticky;top:0;z-index:1;background:var(--card);text-align:left;padding:6px 9px;
            border:1px solid var(--line);color:var(--muted);font-weight:600}
  .sheet td{padding:3px 9px;border:1px solid var(--line);white-space:nowrap}
  .sheet td.n{text-align:right;color:var(--muted);width:1%}
  .sheet td.k{font-weight:600}
  .sheet td.c{white-space:normal;min-width:280px}
  .sheet tr.spare td{color:var(--muted)}
  .sheet tr:hover td{background:rgba(127,127,127,.10)}
  .hmi-tbl{border-collapse:collapse;width:100%;font-family:Consolas,monospace;font-size:12px}
  .hmi-tbl th{position:sticky;top:0;background:var(--card);text-align:left;padding:6px 9px;
              border-bottom:1px solid var(--line);color:var(--muted);font-weight:600}
  .hmi-tbl td{padding:4px 9px;border-bottom:1px solid var(--line);white-space:nowrap}
  .hmi-tbl td:first-child{font-weight:600;color:var(--fg)}
  .hmi-tbl tr.hmi-in td:nth-child(3){color:#1d7a4c}
  .hmi-tbl tr.hmi-out td:nth-child(3){color:#8a5a00}
  .stname-panel{display:none;flex-wrap:wrap;gap:10px;margin:10px 0}
  .stname-lbl{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);background:var(--card);
              border:1px solid var(--line);border-radius:7px;padding:7px 10px;box-shadow:var(--shadow)}
  .stname-lbl b{color:var(--fg);font-family:Consolas,monospace;font-size:12.5px}
  .stname-input{font-family:inherit;font-size:12.5px;padding:5px 8px;border:1px solid var(--line);border-radius:5px;width:180px}
  .cm-row{flex-direction:column;align-items:flex-start;gap:5px;min-width:230px;border-left:3px solid transparent}
  .cm-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  /* Merah = generator gak nemu sensornya sama sekali, harus disetel. Kuning = ketemu tapi tebakannya
     lemah, jalan tapi layak dicek. Aktuator yang sudah dioverride balik netral. */
  .cm-row.cm-missing{border-left-color:var(--danger);background:#fef2f2;border-color:#fca5a5}
  .cm-row.cm-check{border-left-color:#d97706;background:#fffbeb;border-color:#fcd34d}
  .cm-badge{font-size:10.5px;font-weight:600;padding:1px 6px;border-radius:3px;white-space:nowrap}
  .cm-badge-missing{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5}
  .cm-badge-check{background:#fef3c7;color:#92400e;border:1px solid #fcd34d}
  .cm-row select{font-family:inherit;font-size:12.5px;padding:5px 7px;border:1px solid var(--line);border-radius:5px;background:#fff}
  .cm-row .cm-manual{display:flex;gap:5px}
  .cm-row .cm-manual input{font-family:Consolas,monospace;font-size:12px;padding:5px 7px;border:1px solid var(--line);border-radius:5px;width:130px}

  .single{background:#eef4ff;border:1px solid #bcd3f9;border-radius:var(--radius);padding:12px 14px;margin:14px 0}
  .single .t{font-weight:600;margin-bottom:2px}
  .single .d{font-size:11px;color:var(--muted);margin-bottom:8px}
  details.per-program{margin-top:10px}
  details.per-program>summary{cursor:pointer;font-size:13px;color:var(--fg);font-weight:500;padding:7px 2px;list-style:none}
  details.per-program>summary::-webkit-details-marker{display:none}
  details.per-program>summary::before{content:"▸ ";color:var(--accent)}
  details.per-program[open]>summary::before{content:"▾ "}
  .file{margin-bottom:12px;border:1px solid var(--line);border-radius:6px;padding:8px;background:var(--card)}
  .file .row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap}
  .file b{font-family:Consolas,monospace}
  .file textarea{height:140px;margin-top:6px;font-size:10px;white-space:pre;overflow:auto}

  #motionPanel{display:none;margin:10px 0}
  #conditionPanel{display:none;margin:10px 0}
  .cond-group-box{border:1px dashed #c7ccd4;border-radius:6px;padding:6px;margin:6px 0;display:flex;flex-wrap:wrap;align-items:center;gap:4px}
  .cond-or-label{font-weight:bold;color:#c2670a;font-size:11px;margin-right:4px}
  .cond-term{display:inline-flex;align-items:center;background:#eef2ff;border-radius:4px;padding:2px 2px 2px 4px;font-family:Consolas,monospace;font-size:11px;gap:3px}
  .cond-neg{background:var(--accent);color:#fff;padding:2px 6px;margin:0;font-size:9px;border-radius:3px}
  .cond-neg.active{background:#b91c1c}
  .cond-neg:hover{opacity:0.85}
  .cond-term-bit{padding:0 2px}
  .cond-rm-term{background:#9aa3ad;color:#fff;padding:1px 6px;margin:0;font-size:10px;border-radius:3px}
  .cond-rm-term:hover{background:#7c848d}
  .cond-term-input{font-family:Consolas,monospace;font-size:11px;padding:3px 5px;border:1px solid var(--line);border-radius:4px;width:130px}
  .station-box{border:2px solid #b7c0cc;border-radius:var(--radius);padding:10px 12px;margin-bottom:16px;background:var(--card);box-shadow:0 1px 3px rgba(20,30,50,.06)}
  .station-title{font-weight:600;font-size:13px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--line)}
  .variant-box{border:1px solid var(--line);border-radius:6px;padding:8px;margin-bottom:10px;background:#fbfcfd}
  .variant-head{display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap}
  .variant-head b{font-size:11px;color:var(--muted)}
  .variant-head input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px;width:140px}
  .variant-head select{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px;background:#fff;max-width:230px}
  .variant-head .rm-variant{background:#b91c1c;padding:3px 8px;margin:0;font-size:10px}
  .variant-head .rm-variant:hover{background:#8f1717}
  .add-variant{background:#37424f;padding:5px 10px;font-size:11px}
  .add-variant:hover{background:#232a33}
  .graph-toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}
  .avail-btn{background:#eceff3;color:var(--fg);padding:4px 8px;margin:0;font-size:11px;font-family:Consolas,monospace}
  .avail-btn:hover{background:#dde2e8}
  .graph-toolbar input{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px}
  .graph-toolbar select{font-family:Consolas,monospace;font-size:11px;padding:4px 6px;border:1px solid var(--line);border-radius:4px;background:#fff;max-width:230px}
  .graph-toolbar .add-cond{background:#7c3aed;padding:4px 10px;margin:0;font-size:11px}
  .graph-toolbar .add-cond:hover{background:#6527c9}
  svg.graph-canvas{border:1px solid var(--line);border-radius:6px;background:#fbfbfc;display:block;max-width:100%}
  .gnode-rect{fill:var(--accent);stroke:var(--accent-dk);stroke-width:1;cursor:move}
  .gnode-rect.condition{fill:#7c3aed;stroke:#5b21b6;stroke-dasharray:4,2}
  .gnode-rect.decision{fill:#0f766e;stroke:#0b544e}
  .gnode-rect.setmem{fill:#b45309;stroke:#8a4008}
  .gnode-rect.resetmem{fill:#7c2d12;stroke:#5c210d}
  .gnode-rect.alarm{fill:#b91c1c;stroke:#8f1717}
  .gnode-handle.port-n{fill:#e5e7eb}
  .gport-text{font-size:8px;fill:#111;font-family:Consolas,monospace;pointer-events:none;text-anchor:middle}
  .graph-hint{font-size:11px;color:#8a4008;background:#fff7ed;border:1px solid #fed7aa;border-radius:4px;padding:5px 8px;margin-top:4px}
  .gnode-rect.selected{stroke:#f1c40f;stroke-width:3}
  .gnode-rect.anchor{fill:#37424f;stroke:#232a33;cursor:move;rx:14}
  .gedge-line.anchor{stroke:#9aa3ad;stroke-dasharray:3,2}
  .gnode-text{fill:#fff;font-size:10.5px;font-family:Consolas,monospace}
  .gnode-del{fill:#b91c1c;cursor:pointer}
  .gnode-del-text{fill:#fff;font-size:9px;text-anchor:middle;font-family:Consolas,monospace;pointer-events:none}
  .gnode-handle{fill:#f1c40f;stroke:#333;stroke-width:1;cursor:crosshair}
  /* Tombol hapus dan bulatan sambung cuma muncul pas kursor di atas node-nya (atau node lagi
     keselect). Dulu semuanya kelihatan sekaligus - di flowchart 8 node itu 16 bulatan berwarna yang
     bersaing perhatian sama isi diagramnya sendiri. pointer-events ikut dimatikan pas tersembunyi,
     biar gak ada target klik tak kasatmata. */
  .gnode .gnode-del,.gnode .gnode-del-text,.gnode .gnode-handle,.gnode .gport-text{
    opacity:0;pointer-events:none;transition:opacity .1s}
  .gnode:hover .gnode-del,.gnode:hover .gnode-handle,
  .gnode.sel .gnode-del,.gnode.sel .gnode-handle{opacity:1;pointer-events:auto}
  .gnode:hover .gnode-del-text,.gnode:hover .gport-text,
  .gnode.sel .gnode-del-text,.gnode.sel .gport-text{opacity:1}
  .gedge-line{stroke:#8a93a0;stroke-width:2;cursor:pointer}
  .gedge-line:hover{stroke:#b91c1c}
  .gedge-line.selected{stroke:#f1c40f;stroke-width:3}
  .gtemp-line{stroke:var(--accent);stroke-width:2;stroke-dasharray:4,2}
  .gjoin-badge{cursor:pointer}
  .gjoin-badge rect{fill:#333}
  .gjoin-badge text{fill:#fff;font-size:8px;text-anchor:middle;font-family:Consolas,monospace}
  details.json-io{border-top:1px dashed var(--line);margin-top:8px;padding-top:6px}
  details.json-io>summary{cursor:pointer;font-size:11px;color:var(--muted);list-style:none;padding:2px 0}
  details.json-io>summary::-webkit-details-marker{display:none}
  details.json-io>summary::before{content:"▸ ";color:var(--accent)}
  details.json-io[open]>summary::before{content:"▾ "}
  .json-io textarea{height:90px;font-size:10px;margin-top:6px}
  .json-io .row{display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;align-items:center}
  .json-io button{font-size:11px;padding:5px 10px;margin:0}
  .json-io .json-import{background:#1e8449}
  .json-io .json-import:hover{background:#166638}
  .json-io .json-export{background:#37424f}
  .json-io .json-export:hover{background:#232a33}
  .json-io .json-alt{background:#0369a1}
  .json-io .json-alt:hover{background:#025782}
  .json-io .row-sep{width:1px;align-self:stretch;background:var(--line);margin:0 2px}
  .json-io .json-msg{font-size:10px;margin-top:4px;white-space:pre-wrap}
  .json-io .json-msg.ok{color:#1e8449}
  .json-io .json-msg.err{color:#b91c1c}
  details.project-json{border:1px solid var(--line);border-radius:8px;padding:12px 14px;margin:14px 0;
                       background:var(--card);box-shadow:var(--shadow)}
  details.project-json>summary{font-size:13.5px;font-weight:600;color:var(--fg);cursor:pointer}
  /* Kotaknya sengaja pendek. Tidak ada yang mengetik project JSON di sini - masuknya lewat
     tombol Open file atau Paste. Yang dibutuhkan cuma beberapa baris buat memastikan isinya
     benar; 180px cuma mendorong seluruh halaman ke bawah tanpa ada yang membacanya. */
  .project-json textarea{height:72px}

  /* Section yang bisa dilipat (mis. Confirm Mode). Dipakai buat bagian OPSIONAL yang kalau selalu
     kebuka cuma makan tinggi layar - ringkasannya tetap kelihatan di summary jadi gak perlu dibuka
     kecuali memang mau diubah. */
  details.fold{border:1px solid var(--line);border-radius:8px;background:var(--card);margin:14px 0;
               padding:0 14px;box-shadow:var(--shadow)}
  details.fold>summary{cursor:pointer;padding:12px 0;list-style:none;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
  details.fold>summary::-webkit-details-marker{display:none}
  details.fold>summary::before{content:"\\25B8";color:var(--accent);font-size:12px}
  details.fold[open]>summary::before{content:"\\25BE"}
  details.fold[open]{padding-bottom:14px}
  .fold-t{font-size:15px;font-weight:650;color:var(--fg)}
  .fold-sub{font-size:12.5px;color:var(--faint)}
  .fold-sub.attn{color:var(--warn);font-weight:600}

  /* Navigasi samping. Halamannya satu kolom panjang, dan bagian yang paling sering dituju -
     tombol download - ada di paling bawah. Sebelum ini, tiap habis import project harus
     menggulir melewati seluruh IO list dan kanvas motion cuma buat mengunduh. */
  .sidenav{position:fixed;top:0;left:0;bottom:0;width:186px;padding:22px 12px;overflow-y:auto;
           background:var(--card);border-right:1px solid var(--line);z-index:40}
  .sidenav .nav-t{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
                  color:var(--faint);padding:0 10px 8px}
  .sidenav a{display:block;padding:7px 10px;margin-bottom:2px;border-radius:6px;font-size:13px;
             color:var(--muted);text-decoration:none;border-left:2px solid transparent;line-height:1.3}
  .sidenav a:hover{background:var(--accent-soft);color:var(--accent-dk)}
  .sidenav a.on{background:var(--accent-soft);color:var(--accent-dk);font-weight:600;
                border-left-color:var(--accent)}
  /* Tanda jumlah di samping "Results" - sekaligus penanda bahwa generate sudah jalan. */
  .sidenav .n{float:right;font-size:11px;color:var(--faint);font-weight:400}
  .sidenav a.on .n{color:var(--accent-dk)}
  body{padding-left:214px}
  /* Layar sempit: nav-nya disembunyikan, bukan dipaksa muat. Halamannya tetap bisa dipakai
     dengan menggulir seperti sebelum ada nav. */
  @media (max-width:1100px){ .sidenav{display:none} body{padding-left:28px} }
</style>
</head>
<body>
<nav class="sidenav" id="sideNav">
  <div class="nav-t">Sections</div>
  <a href="#sec-project">Project file</a>
  <a href="#sec-io">I/O list</a>
  <a href="#sec-settings">Settings</a>
  <a href="#hmiBox">HMI address map</a>
  <a href="#confirmModeBox">Confirm mode</a>
  <a href="#sec-cond">Conditions</a>
  <a href="#sec-motion">Motion sequence</a>
  <a href="#results">Results <span class="n" id="navFileCount"></span></a>
</nav>
<div class="topbar">
  <div class="brand">
    <h1>Susmax Program Generator</h1>
    <div class="by"><span>by</span>
      <a href="https://github.com/Dennych123" target="_blank" rel="noopener">Dennych123</a></div>
  </div>

</div>

<details class="json-io project-json" id="sec-project" open>
  <summary><span>Project file</span>
    <span class="help" data-tip="Everything in one file: I/O list, motion sequences, conditions, station names, timers and the HMI map. Loading a file replaces the whole project that is open and runs Generate again.">?</span></summary>
  <textarea id="projectJsonTa" spellcheck="false"
    placeholder='{"io":"...","stationNames":{},"motionSequences":{},"conditionDefs":{}}'></textarea>
  <div id="projectJsonRow"></div>
  <span class="json-msg" id="projectJsonMsg"></span>
</details>

<div class="sec-head" id="sec-io">
  <h2>I/O list</h2>
  <span class="help" data-tip="Four columns: Address, Type, IN/OUT, Comment. A comment containing ST1 / ST2 / ST3 goes into that unit program; no ST tag goes into MAIN. Table mode gives you dropdowns so Type and IN/OUT cannot be mistyped. Text mode takes a TAB-separated paste straight from Excel. Both hold the same list, switch any time.">?</span>
</div>
<div class="io-tabs">
  <button type="button" class="io-tab active" id="ioTabGrid">Table</button>
  <button type="button" class="io-tab" id="ioTabText">Text (TSV)</button>
  <span class="io-count" id="ioCount"></span>
</div>
<div id="ioGridWrap">
  <div class="io-grid-scroll"><table id="ioGrid"><tbody></tbody></table></div>
  <div class="io-grid-bar">
    <button type="button" class="io-add" id="ioAddRow">+ Row</button>
    <button type="button" class="io-add" id="ioPaste">Paste</button>
    <span class="io-problems" id="ioProblems"></span>
  </div>
</div>
<textarea id="ioText" placeholder="CH000_00&#9;PB&#9;IN&#9;NOT EMERGENCY STOP"></textarea>
<div><button id="genBtn">Generate</button></div>
<div id="err"></div>
<div id="warnBox" class="warn-box"><b>Warnings</b><div id="warn"></div></div>

<div class="sec-head" id="sec-settings">
  <h2>Settings</h2>
  <span class="help" data-tip="These apply to every station. Timer format is T#<number><unit> - T#200MS, T#1S, T#2M. A wrong format falls back to the default and raises a warning instead of going into the ladder. Station names are optional and only show up in the generated comments.">?</span>
</div>
<div class="settings-row">
  <label><span>PH/PX debounce</span> <input id="timerPhpx" placeholder="T#200MS"></label>
  <label><span>Motion fault time</span> <input id="timerMotion" placeholder="T#5S"></label>
  <label><span>AL array size</span> <input id="alSize" type="number" min="1" placeholder="100"></label>
  <label><span>MF array size</span> <input id="mfSize" type="number" min="1" placeholder="16"></label>
  <label><span>Slots per station</span> <input id="stationBlock" type="number" min="1" placeholder="30"></label>
  <label class="chk"><input id="advInstr" type="checkbox"> <span>Advanced instructions</span>
    <span class="help" data-tip="Off by default. Contacts, coils and TON are proven to import. MOVE, comparisons, Inc and the clock functions are not - one bad element can make the whole file fail to import. Generate first with this off, import _Probe_Instructions.xml into an EMPTY project, and only turn this on once that comes in clean. Then the counters and clock pulses get generated for real.">?</span></label>
</div>
<div id="arraySizeHint" class="hint" style="margin-top:2px"></div>
<div id="stationNamesPanel" class="stname-panel"></div>

<details id="hmiBox" class="fold">
<summary><span class="fold-t">HMI address map</span>
  <span class="help" data-tip="The PLC and the NB panel only talk through memory addresses - there are no tags. Every button and lamp gets an AT address, written into the AT column of GlobalVariables.tsv. Buttons for station n sit at base + n words, lamps at the same word plus the offset. Inside one word each grid slot takes 2 bits: page 1 uses .00 to .07, page 2 uses .08 to .15.">?</span>
  <span class="fold-sub" id="hmiSummary">not generated yet</span></summary>
<div class="settings-row">
  <label><span>Screen source</span>
    <span class="help" data-tip="Manual - you maintain the NB screens, so addresses are never shifted on their own; an actuator that does not fit is reported instead. Generate - the tool builds the screens, so the word budget may grow and the screens follow the new addresses.">?</span>
    <select id="hmiMode">
      <option value="manual">Manual - I maintain the screens</option>
      <option value="generate">Generate - tool builds the screens</option>
    </select></label>
  <label><span>Button/lamp area</span> <select id="hmiBtnArea">
    <option value="W">W</option><option value="H">H</option><option value="D">D</option><option value="CIO">CIO</option>
  </select></label>
  <label><span>Button base word</span> <input id="hmiPbBase" type="number" min="0" max="511" placeholder="460"></label>
  <label><span>Lamp word offset</span> <input id="hmiRdOffset" type="number" min="1" max="511" placeholder="23"></label>
  <label><span>AL/MF area</span> <select id="hmiAlArea">
    <option value="H">H</option><option value="W">W</option><option value="D">D</option><option value="CIO">CIO</option>
  </select></label>
  <label><span>AL base word</span> <input id="hmiAlBase" type="number" min="0" max="511" placeholder="300"></label>
  <label><span>MF base word</span> <input id="hmiMfBase" type="number" min="0" max="511" placeholder="320"></label>
  <label><span>Actuators per screen</span> <input id="hmiPerPage" type="number" min="1" max="8" placeholder="4"></label>
  <label><span>Words per station</span> <input id="hmiStride" type="number" min="1" max="16" placeholder="1"></label>
  <label><span>Spare slots</span>
    <span class="help" data-tip="Extra actuator slots kept free in every station. Without them the addresses fit the current I/O list exactly, and the first actuator added after the machine is running pushes every address behind it - every NB screen already drawn then points at the wrong bit. Percent scales with the station: 30% of 6 actuators reserves room for 8, but 30% of 1 reserves only 1. Fixed count gives every station the same room, which is usually what a small station needs.">?</span>
    <select id="hmiSpareMode">
    <option value="percent">percent of actuators</option><option value="count">fixed count per station</option>
  </select></label>
  <label><span>Spare (%)</span>
    <input id="hmiSpare" type="number" min="0" max="300" placeholder="30"></label>
  <label><span>Spare (slots/station)</span>
    <input id="hmiSpareCount" type="number" min="0" max="32" placeholder="2"></label>
  <label><span>Number area</span>
    <span class="help" data-tip="Where counter targets, timer presets and running values live. These are numbers, not bits - one UDINT takes two words - so they get their own area and can never collide with the button and lamp blocks.">?</span>
    <select id="hmiNumArea">
    <option value="D">D</option><option value="W">W</option><option value="H">H</option><option value="CIO">CIO</option>
  </select></label>
  <label><span>Number base word</span> <input id="hmiNumBase" type="number" min="0" max="4095" placeholder="100"></label>
  <label class="chk"><input id="hmiEnabled" type="checkbox" checked> <span>Fill AT column</span></label>
</div>
<div id="hmiMapPanel" class="hmi-map"></div>
</details>

<details id="confirmModeBox" class="fold">
<summary><span class="fold-t">Actuator confirm mode</span>
  <span class="help" data-tip="Auto - the sensor is matched for you. Open-loop - the actuator has no sensor by design (DANDORI LOCK, PART FEEDER START); fault detection is skipped and so is the no-sensor warning, but it can no longer be used in a motion sequence because there is no confirm bit to step on. Manual - the automatic match picked the wrong sensor, so you name the confirm bits yourself.">?</span>
  <span class="fold-sub" id="confirmModeSummary">optional</span></summary>
<div id="confirmModePanel" class="stname-panel"></div>
</details>

<div class="sec-head" id="sec-cond">
  <h2>Conditions</h2>
  <span class="help" data-tip="Each station can have as many named condition bits as it needs. One bit = several AND groups joined by OR - the same shape as a Denso condition rung. A term can point at a sensor, any existing bit, or another condition bit. A bit that does not exist yet gets a placeholder so the import never fails. Stations you never touch keep the three generic spare slots.">?</span>
</div>
<div id="conditionPanel"></div>

<div class="sec-head" id="sec-motion">
  <h2>Motion sequence</h2>
  <span class="help" data-tip="A station can hold several sequence variants, each with its own condition bit - leave it empty and the variant always runs. Only the variant whose condition is true will run. Click a solenoid to drop a step, then drag from the yellow dot to another step to say what has to finish first. A step waiting on two or more others gets an AND/OR badge you can toggle. Drag steps only to tidy the layout.">?</span>
  <span class="help" data-tip="IF/ELSE - one in, two out (Y on the right, N below). Once the decision is taken the branch holds, and the two sides interlock so they can never be on together. SET/RESET memory - a latching bit; every set and reset trigger for one bit is merged into a single rung, so there is no double coil. ALARM - takes an AL slot automatically, latches itself and joins the category group you pick. To merge two branches, drag both Y and N into the same step and set its badge to OR. Click a step to edit its bit, category and comment. Select and press Delete to remove.">blocks</span>
</div>
<div id="motionPanel"></div>

<div id="results"></div>
<footer class="foot">
  <span>Made by</span>
  <a href="https://github.com/Dennych123" target="_blank" rel="noopener">Dennych123</a>
  <span class="dot">/</span>
  <a href="https://github.com/Dennych123/sysmac" target="_blank" rel="noopener">github.com/Dennych123/sysmac</a>
</footer>
<div id="stats"></div>

<script>
var PARSE_JS    = __PARSE_JS__;
var GENNAME_JS  = __GENNAME_JS__;
var VALIDATE_JS = __VALIDATE_JS__;
var SPLIT_JS    = __SPLIT_JS__;
var GEN_ALL_JS  = __GEN_ALL_JS__;

function runNode(code, msg, flowStore) {
  var flow = { get: function(k){ return flowStore[k]; }, set: function(k,v){ flowStore[k]=v; } };
  var node = { warn: function(m){ console.warn(m); } };
  return new Function('msg','flow','node','return (function(){'+code+'})()')(msg, flow, node);
}


// ===== Clipboard + file, buat toolbar Import/Export JSON =====
// Tool ini dipakai offline lewat file:// . Chrome ngitung file:// sebagai secure context jadi
// navigator.clipboard biasanya jalan, TAPI browser lain / kebijakan kantor bisa nolak, dan
// readText() masih bisa ditolak user lewat prompt izin. Jadi tiap jalur clipboard WAJIB punya
// fallback yang jelas - jangan sampai tombolnya diem tanpa kabar dan user ngira datanya kesalin.
function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
  return new Promise(function (resolve, reject) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) resolve(); else reject(new Error('browser nolak perintah copy'));
    } catch (e) { reject(e); }
  });
}

function readTextFromClipboard() {
  if (navigator.clipboard && navigator.clipboard.readText) return navigator.clipboard.readText();
  return Promise.reject(new Error('browser ini gak ngizinin baca clipboard'));
}

function pickTextFile() {
  return new Promise(function (resolve, reject) {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json,text/plain';
    inp.style.display = 'none';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) { reject(new Error('gak ada file kepilih')); return; }
      var fr = new FileReader();
      fr.onload = function () { resolve({ name: f.name, text: String(fr.result) }); };
      fr.onerror = function () { reject(new Error('gagal baca file ' + f.name)); };
      fr.readAsText(f);
    });
    document.body.appendChild(inp); inp.click(); document.body.removeChild(inp);
  });
}

// Bikin baris tombol Import/Export standar buat satu kotak JSON.
//   ta       : textarea-nya (tetap jadi permukaan edit manual - jalur offline utama)
//   msg      : elemen buat nampilin status
//   getText  : () -> string JSON yang mau diekspor
//   doImport : (text) -> string error, atau null kalau sukses (sekalian ngurus render ulang)
//   fileName : nama default file download
function buildJsonIORow(ta, msg, getText, doImport, fileName) {
  var row = document.createElement('div'); row.className = 'row';
  function say(cls, t) { msg.className = 'json-msg' + (cls ? ' ' + cls : ''); msg.textContent = t; }
  function runImport(text, src) {
    ta.value = text;
    var e = doImport(text);
    if (e) say('err', e); else say('ok', 'Loaded from' + ' ' + src);
  }
  function btn(cls, label, fn) {
    var b = document.createElement('button'); b.className = cls; b.textContent = label;
    b.addEventListener('click', fn); row.appendChild(b); return b;
  }

  btn('json-import', 'Load from box', function () { runImport(ta.value, 'the box'); });
  btn('json-alt', 'Open file', function () {
    pickTextFile().then(function (f) { runImport(f.text, f.name); })
                  .catch(function (e) { say('err', 'Failed:' + ' ' + e.message); });
  });
  btn('json-alt', 'Paste', function () {
    readTextFromClipboard().then(function (txt) {
      if (!txt || !txt.trim()) { say('err', 'Clipboard is empty'); return; }
      runImport(txt, 'clipboard');
    }).catch(function (e) {
      say('err', 'Cannot read clipboard, paste into the box then press Load from box' + ' (' + e.message + ')');
    });
  });

  var sep = document.createElement('div'); sep.className = 'row-sep'; row.appendChild(sep);

  // Variabel lokalnya JANGAN dinamai t: itu nama fungsi terjemahan, dan begitu ketutup
  // 'Copied to clipboard' malah memanggil string hasil export. Handler-nya mati diam-diam.
  btn('json-export', 'Copy', function () {
    var json = getText(); ta.value = json;
    copyTextToClipboard(json).then(function () { say('ok', 'Copied to clipboard'); })
      .catch(function (e) { say('err', 'Copy failed, the JSON is in the box - copy it by hand' + ' (' + e.message + ')'); });
  });
  btn('json-export', 'Save file', function () {
    var json = getText(); ta.value = json;
    downloadFile(fileName, json); say('ok', 'Saved:' + ' ' + fileName);
  });

  return row;
}

// ===== Editor IO list mode tabel =====
// Textarea TSV tetap jadi SUMBER KEBENARAN - seluruh pipeline, Project JSON, dan import/export
// membacanya. Tabel ini murni permukaan edit yang baca-tulis teks yang sama, jadi gak ada satu pun
// jalur lama yang perlu diubah dan tempel-massal dari Excel tetap jalan lewat mode Teks.
// Daftar jenis diambil dari PRE di genname.js - kalau ada jenis baru di sana, tambahin di sini juga.
// 2P ("tombol 2 tangan") sengaja TIDAK ada di daftar ini: tidak pernah dipakai dan cuma bikin
// daftarnya panjang. Prefiksnya masih ada di PRE (genname.js) supaya berkas lama yang terlanjur
// memakainya tetap terbaca - yang dibuang cuma pilihannya, bukan dukungannya.
var IO_JENIS = [
  ['PB', 'Push button'], ['SS', 'Selector switch'], ['LS', 'Limit switch'],
  ['CR', 'Relay / contactor'], ['PH', 'Photo sensor'], ['PX', 'Proximity sensor'],
  ['AS', 'Auto switch (cylinder, 2 ends)'], ['SRV_LS', 'Servo position feedback'],
  ['PL', 'Pilot lamp'], ['BZ', 'Buzzer'],
  ['SOL', 'Solenoid valve'], ['SRV_CMD', 'Servo command (N positions)']
];
var IO_IN_ONLY = { PB:1, SS:1, LS:1, PH:1, PX:1, AS:1, SRV_LS:1, '2P':1 };
var IO_OUT_ONLY = { PL:1, BZ:1, SOL:1, SRV_CMD:1 };   // CR bisa dua-duanya

var ioRows = [];        // [{address,jenis,io,komen}]
var ioView = 'grid';

// Pemisah baris dibikin lewat new RegExp dari string, bukan regex literal. Alasannya: HTML di
// build_html.py itu string Python biasa, jadi escape baris-baru yang ditulis tunggal bakal ditelan
// Python duluan dan regex literal-nya rusak. Di dalam string, escape-nya ditulis dobel dan aman.
var IO_LINE_RE = new RegExp('[\\r\\n]+');

function ioParseText(txt) {
  return String(txt || '').split(IO_LINE_RE).filter(function (l) { return l.trim() !== ''; })
    .map(function (l) {
      var c = l.split('\\t');
      return { address: (c[0] || '').trim(), jenis: (c[1] || '').trim().toUpperCase(),
               io: (c[2] || '').trim().toUpperCase(), komen: (c[3] || '').trim() };
    });
}
function ioRowsToText(rows) {
  return rows.map(function (r) { return [r.address, r.jenis, r.io, r.komen].join('\\t'); }).join('\\n');
}
// Station diturunkan dari komen persis seperti split.js, biar yang kelihatan di tabel = yang bakal
// kejadian pas generate, bukan tebakan terpisah yang bisa beda.
function ioStationOf(komen) {
  var m = /\\bST\\s*(\\d+)/i.exec(String(komen || ''));
  return m ? 'ST' + m[1] : 'MAIN';
}

// SATU-SATUNYA cara yang benar buat ngeset IO list dari kode. Nulis langsung ke textarea gak cukup:
// mode Tabel itu tampilan default, dan dia baca dari ioRows - kalau gak di-reload, pipeline jalan
// pakai teks baru (aktuator muncul) tapi tabelnya masih nampilin isi lama. Persis itu yang kejadian
// waktu import Project JSON.
function setIoText(text) {
  var ta = document.getElementById('ioText');
  if (ta) ta.value = String(text || '');
  ioLoadFromText();
  renderIoGrid();
}

function ioSyncToText() {
  var ta = document.getElementById('ioText');
  if (ta) ta.value = ioRowsToText(ioRows);
}
function ioLoadFromText() {
  var ta = document.getElementById('ioText');
  ioRows = ioParseText(ta ? ta.value : '');
}

// Masalah yang dicek SAMA dengan validate.js - tujuannya user lihat errornya di baris yang salah,
// sebelum klik Generate, bukan sebagai satu blok teks sesudahnya.
function ioProblems() {
  var bad = {}, seen = {}, dup = {};
  ioRows.forEach(function (r, i) {
    var miss = !r.address || !r.jenis || !r.io;
    if (miss) bad[i] = 'Address, Type and IN/OUT are required';
    if (r.address && r.io) {
      var k = r.io + '|' + r.address;
      if (seen[k] !== undefined) { dup[k] = true; bad[i] = 'Alamat ' + r.address + ' (' + r.io + ') dipakai lebih dari sekali'; bad[seen[k]] = bad[seen[k]] || ('Alamat ' + r.address + ' (' + r.io + ') dipakai lebih dari sekali'); }
      else seen[k] = i;
    }
  });
  return bad;
}

function renderIoGrid() {
  var tb = document.querySelector('#ioGrid tbody');
  if (!tb) return;
  var bad = ioProblems();
  tb.innerHTML = '';

  var thead = document.querySelector('#ioGrid thead');
  if (!thead) {
    thead = document.createElement('thead');
    var hr = document.createElement('tr');
    ['#', 'Address', 'Type', 'IN/OUT', 'Comment', 'Program', ''].forEach(function (h) {
      var th = document.createElement('th'); th.textContent = h; hr.appendChild(th);
    });
    thead.appendChild(hr);
    document.getElementById('ioGrid').insertBefore(thead, tb);
  }

  ioRows.forEach(function (r, i) {
    var rowEl = document.createElement('tr');
    if (bad[i]) { rowEl.className = 'bad'; rowEl.title = bad[i]; }

    var tdN = document.createElement('td'); tdN.className = 'rn'; tdN.textContent = (i + 1); rowEl.appendChild(tdN);

    function cell(cls) { var td = document.createElement('td'); td.className = cls; rowEl.appendChild(td); return td; }
    function commit() { ioSyncToText(); renderIoGrid(); ioUpdateCount(); }

    var addr = document.createElement('input');
    addr.value = r.address; addr.placeholder = 'CH0_00';
    addr.addEventListener('change', function () { r.address = addr.value.trim(); commit(); });
    cell('c-addr').appendChild(addr);

    var sel = document.createElement('select');
    var blank = document.createElement('option'); blank.value = ''; blank.textContent = '- pick -'; sel.appendChild(blank);
    IO_JENIS.forEach(function (j) {
      var o = document.createElement('option'); o.value = j[0]; o.textContent = j[0] + ' - ' + j[1]; sel.appendChild(o);
    });
    // Jenis di luar daftar (mis. dari file lama) tetap dimunculin, kalau nggak nilainya ilang diam-diam
    if (r.jenis && !IO_JENIS.some(function (j) { return j[0] === r.jenis; })) {
      var ox = document.createElement('option'); ox.value = r.jenis; ox.textContent = r.jenis + ' - tidak dikenal'; sel.appendChild(ox);
    }
    sel.value = r.jenis || '';
    sel.addEventListener('change', function () {
      r.jenis = sel.value;
      // Jenis yang cuma masuk akal satu arah langsung ngisi IN/OUT-nya - satu sumber salah input hilang
      if (IO_IN_ONLY[r.jenis]) r.io = 'IN';
      else if (IO_OUT_ONLY[r.jenis]) r.io = 'OUT';
      commit();
    });
    cell('c-jenis').appendChild(sel);

    var ioSel = document.createElement('select');
    ['', 'IN', 'OUT'].forEach(function (v) {
      var o = document.createElement('option'); o.value = v; o.textContent = v || '- pilih -'; ioSel.appendChild(o);
    });
    ioSel.value = r.io || '';
    ioSel.addEventListener('change', function () { r.io = ioSel.value; commit(); });
    cell('c-io').appendChild(ioSel);

    var km = document.createElement('input');
    km.value = r.komen; km.placeholder = 'ST1 STOPPER-2 CHUCK';
    km.addEventListener('change', function () { r.komen = km.value.trim(); commit(); });
    cell('').appendChild(km);

    var st = ioStationOf(r.komen);
    var tag = document.createElement('span');
    tag.className = 'st-tag' + (st === 'MAIN' ? ' main' : ''); tag.textContent = st;
    tag.title = st === 'MAIN' ? 'Komen gak menyebut ST<n>, masuk program MAIN' : 'Masuk program ' + st;
    cell('c-st').appendChild(tag);

    var rm = document.createElement('button');
    rm.type = 'button'; rm.className = 'rm'; rm.textContent = 'x'; rm.title = 'Hapus baris';
    rm.addEventListener('click', function () { ioRows.splice(i, 1); commit(); });
    cell('c-del').appendChild(rm);

    tb.appendChild(rowEl);
  });
  ioUpdateCount();
}

function ioUpdateCount() {
  var bad = ioProblems();
  var n = Object.keys(bad).length;
  var cnt = document.getElementById('ioCount');
  if (cnt) cnt.textContent = ioRows.length + ' baris';
  var pr = document.getElementById('ioProblems');
  if (pr) {
    pr.textContent = n ? (n + ' baris bermasalah - lihat kotak merah') : (ioRows.length ? 'Semua baris valid' : '');
    pr.className = 'io-problems' + (n ? '' : ' ok');
  }
}

function setIoView(v) {
  ioView = v;
  var grid = document.getElementById('ioGridWrap'), ta = document.getElementById('ioText');
  var tg = document.getElementById('ioTabGrid'), tt = document.getElementById('ioTabText');
  if (v === 'grid') { ioLoadFromText(); renderIoGrid(); }
  else { ioSyncToText(); }
  grid.style.display = v === 'grid' ? 'block' : 'none';
  ta.style.display = v === 'grid' ? 'none' : 'block';
  tg.className = 'io-tab' + (v === 'grid' ? ' active' : '');
  tt.className = 'io-tab' + (v === 'text' ? ' active' : '');
}

function downloadFile(name, text) {
  var b = new Blob([text], {type:'text/plain'});
  var u = URL.createObjectURL(b);
  var a = document.createElement('a');
  a.href = u; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(u);
}

// SRV_CMD ikut masuk palette sequence: tiap command servo itu aktuator MANDIRI di gen_all.js
// (srvActus -> solByName), jadi node-nya valid dipakai sebagai langkah motion persis kayak SOL/CR.
// Tanpa SRV_CMD di sini, station yang aktuatornya servo doang gak kegambar sama sekali di panel.
function actuatorNamesForStation(devices) {
  return (devices || [])
    .filter(function (d) { return d.io === 'OUT' && (d.jenis === 'CR' || d.jenis === 'SOL' || d.jenis === 'SRV_CMD'); })
    .map(function (d) { return d.name; })
    .filter(Boolean);
}

// Object.keys(groups) ngikutin urutan device pertama kali MUNCUL di IO list, bukan urutan angka ST -
// kalau IO list-nya nulis ST3 duluan baru ST1, panel bakal kegambar ST3 duluan. Sort numerik di sini.
function sortStations(keys) {
  return keys.slice().sort(function (a, b) {
    return (parseInt(a.replace(/\D/g, ''), 10) || 0) - (parseInt(b.replace(/\D/g, ''), 10) || 0);
  });
}

var errEl, resEl, statsEl, warnEl, warnBoxEl, motionPanelEl, conditionPanelEl, stationNamesPanelEl, timerPhpxEl, timerMotionEl, confirmModePanelEl, alSizeEl, mfSizeEl, stationBlockEl, arraySizeHintEl, navFileCountEl;
var advInstrEl;
var hmiModeEl, hmiBtnAreaEl, hmiAlAreaEl, hmiPbBaseEl, hmiRdOffsetEl, hmiAlBaseEl, hmiMfBaseEl, hmiPerPageEl, hmiStrideEl, hmiEnabledEl, hmiMapPanelEl, hmiSummaryEl, hmiNumAreaEl, hmiNumBaseEl, hmiSpareEl, hmiSpareModeEl, hmiSpareCountEl;
// Dua kotak angka spare, cuma satu yang berlaku. Yang tidak berlaku disembunyikan, bukan
// dibiarkan aktif: dua kotak yang sama-sama bisa diisi bikin orang mengisi yang salah lalu
// bingung kenapa jumlah slotnya tidak berubah.
function spareModeSync() {
  if (!hmiSpareModeEl) return;
  var byCount = hmiSpareModeEl.value === 'count';
  if (hmiSpareEl && hmiSpareEl.parentNode) hmiSpareEl.parentNode.style.display = byCount ? 'none' : '';
  if (hmiSpareCountEl && hmiSpareCountEl.parentNode) hmiSpareCountEl.parentNode.style.display = byCount ? '' : 'none';
}
// Setelan peta HMI dikumpulin di satu tempat - dipakai regenerate(), export project JSON, dan import.
// Tiga pemanggil yang harus setuju bentuknya; dulu pola begini kelewat satu tempat dan setelan
// diam-diam gak ikut ke-export.
function hmiSettings() {
  return {
    enabled: hmiEnabledEl ? hmiEnabledEl.checked : true,
    mode: hmiModeEl ? hmiModeEl.value : 'manual',
    btnArea: hmiBtnAreaEl ? hmiBtnAreaEl.value : 'W',
    alArea: hmiAlAreaEl ? hmiAlAreaEl.value : 'H',
    mfArea: hmiAlAreaEl ? hmiAlAreaEl.value : 'H',
    pbBase: hmiPbBaseEl ? hmiPbBaseEl.value : '',
    rdOffset: hmiRdOffsetEl ? hmiRdOffsetEl.value : '',
    alBase: hmiAlBaseEl ? hmiAlBaseEl.value : '',
    mfBase: hmiMfBaseEl ? hmiMfBaseEl.value : '',
    perPage: hmiPerPageEl ? hmiPerPageEl.value : '',
    stride: hmiStrideEl ? hmiStrideEl.value : '',
    numArea: hmiNumAreaEl ? hmiNumAreaEl.value : 'D',
    numBase: hmiNumBaseEl ? hmiNumBaseEl.value : '',
    spareMode: hmiSpareModeEl ? hmiSpareModeEl.value : 'percent',
    spare: hmiSpareEl ? hmiSpareEl.value : '',
    spareCount: hmiSpareCountEl ? hmiSpareCountEl.value : ''
  };
}
// Spreadsheet komen elemen AL/MF. Ditaruh di PANEL HASIL, bukan di dalam fold Pengaturan:
// yang dicari orang setelah klik Generate itu hasilnya, dan panel yang ngumpet di tempat lain
// sama saja dengan tidak ada. Kontrolnya dibuat dari JS (bukan id statis di template) supaya
// seluruh blok ini hidup-mati bareng datanya - kalau tidak ada elemen array, tidak ada sisa
// tombol yatim yang menempel di halaman.
var lastArrayRows = [];
// Cuma AL saja atau MF saja - gabungan AL+MF sengaja tidak ada. Kolom Comment ditempel ke
// SATU array yang sedang kebuka di Sysmac; daftar gabungan berarti separuh barisnya meleset
// satu blok penuh, dan itu tidak kelihatan sampai alarm salah nomor muncul di layar NB.
var arrayFilter = 'AL', arrayHideSpare = false, arraySheetBodyEl = null, arrayMsgEl = null;
function arrayRowsShown() {
  return lastArrayRows.filter(function (r) {
    if (r.arr !== arrayFilter) return false;
    if (arrayHideSpare && / Spare$/.test(r.komen || '')) return false;
    return true;
  });
}
function arraySheetTable() {
  var rows = arrayRowsShown();
  var t = document.createElement('table');
  t.className = 'sheet';
  var hd = document.createElement('tr');
  ['#', 'Name', 'Data Type', 'Comment'].forEach(function (h) {
    var th = document.createElement('th'); th.textContent = h; hd.appendChild(th);
  });
  t.appendChild(hd);
  rows.forEach(function (r, i) {
    var rowEl = document.createElement('tr');
    if (/ Spare$/.test(r.komen || '')) rowEl.className = 'spare';
    [[String(i + 1), 'n'], [r.name, 'k'], ['BOOL', ''], [r.komen || '', 'c']].forEach(function (c) {
      var td = document.createElement('td'); td.textContent = c[0]; if (c[1]) td.className = c[1];
      rowEl.appendChild(td);
    });
    t.appendChild(rowEl);
  });
  return t;
}
function arraySheetRefresh() {
  if (!arraySheetBodyEl) return;
  arraySheetBodyEl.textContent = '';
  arraySheetBodyEl.appendChild(arraySheetTable());
}
function buildArraySheet() {
  if (!lastArrayRows.length) return null;
  var box = document.createElement('div');
  box.className = 'file array-sheet';
  var row = document.createElement('div'); row.className = 'row';
  var b = document.createElement('b');
  b.textContent = 'AL / MF element comments (' + lastArrayRows.length + ')';
  row.appendChild(b);

  var sel = document.createElement('select'); sel.className = 'sheet-ctl';
  [['AL', 'AL saja'], ['MF', 'MF saja']].forEach(function (o) {
    var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op);
  });
  sel.value = arrayFilter;
  sel.addEventListener('change', function () { arrayFilter = sel.value; arraySheetRefresh(); });
  row.appendChild(sel);

  var lbl = document.createElement('label'); lbl.className = 'sheet-chk';
  var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = arrayHideSpare;
  cb.addEventListener('change', function () { arrayHideSpare = cb.checked; arraySheetRefresh(); });
  lbl.appendChild(cb); lbl.appendChild(document.createTextNode(' sembunyikan Spare'));
  row.appendChild(lbl);

  [['Salin kolom Comment', true], ['Salin semua kolom', false]].forEach(function (o) {
    var btn = document.createElement('button'); btn.className = 'dl'; btn.textContent = o[0];
    btn.addEventListener('click', function () { arrayCopy(o[1]); });
    row.appendChild(btn);
  });
  arrayMsgEl = document.createElement('span'); arrayMsgEl.className = 'sheet-msg';
  row.appendChild(arrayMsgEl);

  var hint = document.createElement('div'); hint.className = 'hint';
  hint.textContent = 'Urutannya persis urutan array setelah di-expand di Sysmac. '
    + 'Salin kolom Comment lalu paste ke kolom Comment - satu kolom, sejajar baris demi baris.';

  arraySheetBodyEl = document.createElement('div'); arraySheetBodyEl.className = 'sheet-wrap';
  arraySheetBodyEl.appendChild(arraySheetTable());
  box.appendChild(row); box.appendChild(hint); box.appendChild(arraySheetBodyEl);
  return box;
}
// Panel tabel Global Variable, berdiri sendiri di panel hasil. Sebelumnya GlobalVariables.tsv
// cuma satu textarea di dalam fold "Files" bareng delapan berkas XML - padahal ini berkas yang
// paling sering dipakai, dan yang dilakukan orang dengannya bukan membaca melainkan MENYALIN.
// Kolomnya persis kolom tabel Global Variable Sysmac, urutannya sama, jadi hasil paste sejajar.
var lastGlobalRows = [];
var globalQuery = '', globalSheetBodyEl = null, globalMsgEl = null, globalCountEl = null;
function globalRowsShown() {
  var q = globalQuery.trim().toUpperCase();
  if (!q) return lastGlobalRows;
  return lastGlobalRows.filter(function (r) {
    return (r.name + ' ' + (r.at || '') + ' ' + (r.komen || '')).toUpperCase().indexOf(q) >= 0;
  });
}
function globalSheetTable() {
  var rows = globalRowsShown();
  var t = document.createElement('table');
  t.className = 'sheet';
  var hd = document.createElement('tr');
  ['#', 'Name', 'Data Type', 'AT', 'Retain', 'Comment'].forEach(function (h) {
    var th = document.createElement('th'); th.textContent = h; hd.appendChild(th);
  });
  t.appendChild(hd);
  rows.forEach(function (r, i) {
    var rowEl = document.createElement('tr');
    [[String(i + 1), 'n'], [r.name, 'k'], [r.type || 'BOOL', ''], [r.at || '', 'k'],
     [r.retain === 'True' ? 'True' : '', ''], [r.komen || '', 'c']].forEach(function (c) {
      var td = document.createElement('td'); td.textContent = c[0]; if (c[1]) td.className = c[1];
      rowEl.appendChild(td);
    });
    t.appendChild(rowEl);
  });
  return t;
}
function globalSheetRefresh() {
  if (!globalSheetBodyEl) return;
  globalSheetBodyEl.textContent = '';
  globalSheetBodyEl.appendChild(globalSheetTable());
  if (globalCountEl) globalCountEl.textContent = globalRowsShown().length + ' / ' + lastGlobalRows.length + ' baris';
}
function globalTsvText() {
  return globalRowsShown().map(function (r) {
    return [r.name, r.type || 'BOOL', '', r.at || '', r.retain || 'False', 'False', 'Do not publish', r.komen || ''].join('\\t');
  }).join('\\n');
}
function buildGlobalSheet() {
  if (!lastGlobalRows.length) return null;
  var box = document.createElement('div');
  box.className = 'file array-sheet';
  var row = document.createElement('div'); row.className = 'row';
  var b = document.createElement('b');
  b.textContent = 'Global variables (' + lastGlobalRows.length + ')';
  row.appendChild(b);

  var q = document.createElement('input'); q.type = 'text'; q.className = 'sheet-ctl';
  q.placeholder = 'cari nama / alamat / komen';
  q.value = globalQuery;
  q.addEventListener('input', function () { globalQuery = q.value; globalSheetRefresh(); });
  row.appendChild(q);

  var cp = document.createElement('button'); cp.className = 'dl'; cp.textContent = 'Salin semua kolom';
  cp.addEventListener('click', function () { globalCopy(); });
  row.appendChild(cp);
  var dl = document.createElement('button'); dl.className = 'dl'; dl.textContent = 'Download TSV';
  dl.addEventListener('click', function () { downloadFile('GlobalVariables.tsv', globalTsvText()); });
  row.appendChild(dl);
  globalCountEl = document.createElement('span'); globalCountEl.className = 'sheet-msg';
  row.appendChild(globalCountEl);
  globalMsgEl = document.createElement('span'); globalMsgEl.className = 'sheet-msg';
  row.appendChild(globalMsgEl);

  var hint = document.createElement('div'); hint.className = 'hint';
  hint.textContent = 'Tanpa baris judul dan tanpa elemen array - keduanya bikin tempelan meleset. '
    + 'Komen per elemen AL/MF ada di panel di bawahnya, ditempel setelah arraynya di-expand.';

  globalSheetBodyEl = document.createElement('div'); globalSheetBodyEl.className = 'sheet-wrap';
  box.appendChild(row); box.appendChild(hint); box.appendChild(globalSheetBodyEl);
  globalSheetRefresh();
  return box;
}
function globalCopy() {
  var text = globalTsvText(), n = globalRowsShown().length;
  function done(ok) {
    if (!globalMsgEl) return;
    globalMsgEl.textContent = ok ? (n + ' baris disalin') : 'gagal menyalin, blok manual dari tabel';
    setTimeout(function () { if (globalMsgEl) globalMsgEl.textContent = ''; }, 4000);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
  } else {
    done(fallbackCopy(text));
  }
}
// Panel alarm NB-Designer. Berkasnya sendiri sudah ada di fold Files, tapi di situ dia satu dari
// sepuluh dan yang paling gampang terlewat - padahal ini yang menggantikan mengetik 190 alarm
// satu per satu di NB-Designer.
//
// Tidak ada tombol "tulis langsung ke folder project": browser tidak boleh menulis ke folder
// sembarang, dan showDirectoryPicker butuh secure context sementara index.html dibuka lewat
// file://. Jadi yang disediakan dua jalur jujur - unduh berkasnya, atau salin perintah CLI yang
// mengerjakan penempelannya berikut cadangannya.
var nbMsgEl = null;
function nbCsvCell(line, n) {
  var i = 0, k = 0, c = '', q = false;
  for (; i < line.length; i++) {
    var ch = line[i];
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { if (k === n) return c; k++; c = ''; }
    else c += ch;
  }
  return k === n ? c : '';
}
function buildNbPanel(files) {
  var f = null;
  files.forEach(function (x) { if (x.name === 'AlarmLib.csv') f = x; });
  if (!f) return null;
  // Escape di baris ini ditulis dobel dengan sengaja: templatenya string Python biasa.
  var rows = f.xml.replace(/^\\uFEFF/, '').split('\\n').filter(function (l) { return l; }).slice(2);
  if (!rows.length) return null;

  var box = document.createElement('div');
  box.className = 'file array-sheet';
  var row = document.createElement('div'); row.className = 'row';
  var b = document.createElement('b');
  b.textContent = 'Alarm NB-Designer (' + rows.length + ')';
  row.appendChild(b);
  var dl = document.createElement('button'); dl.className = 'dl'; dl.textContent = 'Download AlarmLib.csv';
  dl.addEventListener('click', function () { downloadFile('AlarmLib.csv', f.xml); });
  row.appendChild(dl);
  var cp = document.createElement('button'); cp.className = 'dl'; cp.textContent = 'Salin perintah';
  cp.addEventListener('click', function () { nbCopyCmd(); });
  row.appendChild(cp);
  nbMsgEl = document.createElement('span'); nbMsgEl.className = 'sheet-msg';
  row.appendChild(nbMsgEl);

  var hint = document.createElement('div'); hint.className = 'hint';
  hint.textContent = 'Taruh di folder project NB-Designer, sebelah berkas .nbp - namanya harus tetap '
    + 'AlarmLib.csv. Tutup NB-Designer dulu: dia memuat berkas ini waktu project dibuka dan menulisnya '
    + 'lagi waktu disimpan. Menimpa akan menghapus alarm yang tidak ada di daftar ini.';

  var cmd = document.createElement('div'); cmd.className = 'nb-cmd';
  cmd.textContent = nbCmdText();

  var wrap = document.createElement('div'); wrap.className = 'sheet-wrap';
  var t = document.createElement('table'); t.className = 'sheet';
  var hd = document.createElement('tr');
  ['#', 'Alamat', 'Teks alarm'].forEach(function (h) {
    var th = document.createElement('th'); th.textContent = h; hd.appendChild(th);
  });
  t.appendChild(hd);
  rows.forEach(function (r, i) {
    var teks = nbCsvCell(r, 5), rowEl = document.createElement('tr');
    if (/ Spare$/.test(teks)) rowEl.className = 'spare';
    [[String(i + 1), 'n'], [nbCsvCell(r, 15), 'k'], [teks, 'c']].forEach(function (c) {
      var td = document.createElement('td'); td.textContent = c[0]; td.className = c[1];
      rowEl.appendChild(td);
    });
    t.appendChild(rowEl);
  });
  wrap.appendChild(t);
  box.appendChild(row); box.appendChild(hint); box.appendChild(cmd); box.appendChild(wrap);
  return box;
}
function nbCmdText() {
  return 'node scripts/nb_apply.js project.json "C:\\\\path\\\\ke\\\\project NB" --write';
}
function nbCopyCmd() {
  var text = nbCmdText();
  function done(ok) {
    if (!nbMsgEl) return;
    nbMsgEl.textContent = ok ? 'perintah disalin' : 'gagal menyalin, blok manual dari teks di bawah';
    setTimeout(function () { if (nbMsgEl) nbMsgEl.textContent = ''; }, 4000);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
  } else {
    done(fallbackCopy(text));
  }
}
function arrayCopy(commentOnly) {
  var rows = arrayRowsShown();
  var text = rows.map(function (r) {
    return commentOnly ? (r.komen || '')
      : [r.name, 'BOOL', '', '', 'False', 'False', 'Do not publish', r.komen || ''].join('\\t');
  }).join('\\n');
  function done(ok) {
    if (!arrayMsgEl) return;
    arrayMsgEl.textContent = ok ? (rows.length + ' baris disalin') : 'gagal menyalin, blok manual dari tabel';
    setTimeout(function () { if (arrayMsgEl) arrayMsgEl.textContent = ''; }, 4000);
  }
  // navigator.clipboard butuh https/localhost. index.html sering dibuka lewat file:// - di situ
  // API-nya tidak ada sama sekali, jadi harus ada jalur cadangan atau tombolnya diam-diam mati.
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
  } else {
    done(fallbackCopy(text));
  }
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.top = '-1000px';
  document.body.appendChild(ta); ta.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}
function renderHmiMap(map) {
  if (!hmiMapPanelEl) return;
  hmiMapPanelEl.textContent = '';
  if (!map || !map.rows || !map.rows.length) {
    if (hmiSummaryEl) hmiSummaryEl.textContent = map && map.cfg && !map.cfg.on ? 'kolom AT dimatikan' : 'belum di-generate';
    return;
  }
  if (hmiSummaryEl) {
    hmiSummaryEl.textContent = (map.cfg.mode === 'generate' ? 'generate' : 'manual') + ' - '
      + map.rows.length + ' simbol - tombol ' + map.cfg.btnArea + map.cfg.pbBase + '+, lampu +'
      + map.cfg.rdOfs + ', ' + map.cfg.perPage + ' aktuator/screen, ' + map.cfg.stride + ' word/station';
  }
  var t = document.createElement('table');
  t.className = 'hmi-tbl';
  var hd = document.createElement('tr');
  ['Address', 'Symbol', 'Direction', 'Screen', 'Device'].forEach(function (h) {
    var th = document.createElement('th'); th.textContent = h; hd.appendChild(th);
  });
  t.appendChild(hd);
  map.rows.forEach(function (r) {
    var rowEl = document.createElement('tr');
    rowEl.className = r.dir === 'HMI->PLC' ? 'hmi-in' : 'hmi-out';
    [r.at, r.sym, r.dir, r.screen, r.komen].forEach(function (v) {
      var td = document.createElement('td'); td.textContent = v || ''; rowEl.appendChild(td);
    });
    t.appendChild(rowEl);
  });
  hmiMapPanelEl.appendChild(t);
}
// Warning generate terakhir. warnList = versi terstruktur ({level,code,station,message}); string-nya
// cuma disimpen buat fallback. Konsumen di sini WAJIB nyantol ke `code`, bukan nyocokin teks pesan -
// teksnya bisa berubah kapan saja tanpa siapa pun sadar ada yang rusak.
var lastWarnings = '';
var lastWarnList = [];
// Sekali user buka/tutup Confirm Mode sendiri, kita berhenti maksa bukain - keputusannya dia.
var confirmModeTouched = false;
var flowStore = {};
var lastSplitMsg = null;
var stationNames = {}; // key station -> nama bebas (opsional), ngikut ke komen program (LB400_A/B dkk)
// key nama device (SOL_.../CR_.../SRV_...) -> {mode:'auto'|'openloop'|'manual', lscA, lscB}. 'auto' =
// gak disetel/default (findLsc/auto-match servo jalan kayak biasa). 'openloop' = sengaja gak ada
// sensor (DANDORI LOCK, PART FEEDER START dkk) - skip fault-detection + skip warning. 'manual' = user
// nunjuk langsung bit konfirmasinya (buat overrule findLsc yang salah tebak / low-confidence).
var actuatorOverrides = {};
// renderMotionPanel/renderConditionPanel/renderResults nge-rebuild DOM-nya total (innerHTML='') tiap
// ada interaksi apapun (regenerate() dipanggil hampir di semua event) - <details> baru selalu closed
// kalau gak dijagain manual, jadi state open/closed disimpen di sini, LUAR elemen DOM-nya sendiri.
var jsonBoxOpen = {}; // key "motion:ST1" / "cond:ST1" -> bool
var perProgramOpen = false;

// ===== Motion Sequence graph state =====
// motionState[station] = [ variant, ... ]
// variant = { condition: '' | 'LB300', nodes: [ node, ... ] }
// node (motion)    = {id, type:'motion', sol, after:[id-or-bit,...], join:'AND'|'OR', x, y}
// node (condition) = {id, type:'condition', bit, x, y}   -- id IS the bit name itself, so when a
//   motion node's `after` references it, gen_all.js's resolveBit() falls through to using that
//   string as a literal external operand. Condition nodes are stripped before sending to gen_all.js.
var motionState = {};
var conditionState = {}; // key station -> [{name,bit,groups:[[{bit,neg},...],...]},...]
var motionCounters = {}; // key "station#variantIdx" -> next motion node number
var svgRefs = {};        // key "station#variantIdx" -> current svg element
var dragState = null;
var selected = null;     // {stKey, vIdx, kind:'node'|'edge', id, fromId, toId}

var NODE_W = 110, NODE_H = 32;
var ANCHOR_R = 15, ANCHOR_TOP_MARGIN = 55; // Start/Finish: radius lingkaran kecil + ruang di atas row 0
var SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs) {
  var el = document.createElementNS(SVG_NS, tag);
  if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
  return el;
}

function vKey(st, vIdx) { return st + '#' + vIdx; }

function ensureStation(st) {
  if (!motionState[st]) motionState[st] = [{ condition: '', comment: '', nodes: [] }];
}

function addVariant(st) {
  ensureStation(st);
  motionState[st].push({ condition: '', comment: '', nodes: [] });
}

function removeVariant(st, vIdx) {
  if (!motionState[st]) return;
  motionState[st].splice(vIdx, 1);
  if (selected && selected.stKey === st && selected.vIdx === vIdx) selected = null;
}

function setVariantCondition(st, vIdx, text) {
  var v = motionState[st] && motionState[st][vIdx];
  if (v) v.condition = (text || '').trim();
}

function setVariantComment(st, vIdx, text) {
  var v = motionState[st] && motionState[st][vIdx];
  if (v) v.comment = (text || '').trim();
}

// Jarak kolom 175 (dulu 145): node sekarang melebar ngikutin label penuh, nama solenoid panjang
// kayak SOL_ST1_RGT_DIV_BWD bisa ~150px - dengan 145 node baru bakal saling tindih pas ditaruh.
function nextPos(st, vIdx) {
  var idx = motionState[st][vIdx].nodes.length;
  return { x: 20 + (idx % 4) * 175, y: ANCHOR_TOP_MARGIN + 20 + Math.floor(idx / 4) * 75 };
}

function addMotionNode(st, vIdx, sol) {
  ensureStation(st);
  var key = vKey(st, vIdx);
  if (!motionCounters[key]) motionCounters[key] = 1;
  var id = 'n' + (motionCounters[key]++);
  var pos = nextPos(st, vIdx);
  motionState[st][vIdx].nodes.push({ id: id, type: 'motion', sol: sol, after: [], join: 'AND', x: pos.x, y: pos.y });
  return id;
}

// Blok flowchart non-motion (decision / set memory / reset memory / alarm). Id-nya ikut penomoran
// yang sama dengan node motion supaya gak pernah tabrakan.
function addBlockNode(st, vIdx, spec) {
  ensureStation(st);
  var key = vKey(st, vIdx);
  if (!motionCounters[key]) motionCounters[key] = 1;
  var id = 'n' + (motionCounters[key]++);
  var pos = nextPos(st, vIdx);
  var node = { id: id, after: [], join: 'AND', x: pos.x, y: pos.y };
  Object.keys(spec).forEach(function (k) { node[k] = spec[k]; });
  motionState[st][vIdx].nodes.push(node);
  return id;
}

// ===== Pemilih bit Condition (dropdown) =====
// Dulu bit Condition diketik manual di input teks: gampang typo, dan user harus inget sendiri bit apa
// aja yang udah dia bikin di kotak Condition. Sekarang daftarnya ditarik langsung dari conditionState
// station itu. Opsi ketik-manual tetap disediain, karena `after` node maupun condition varian sah juga
// nunjuk bit DI LUAR Condition section (sensor, LSC, atau bit warisan dari JSON import).
function pad3(n) { return ('000' + n).slice(-3); }

function conditionBitOptions(stKey, current) {
  var out = [], seen = {};
  function add(bit, label) {
    if (!bit || seen[bit]) return;
    seen[bit] = true;
    out.push({ value: bit, label: label });
  }
  // Bit yang dikosongin di panel Condition TETAP dibikin generator, namanya LB300+i (gen_all section 8).
  // Jadi baris itu gak boleh di-skip di dropdown - kalau di-skip, bit yang beneran ada malah gak kelihatan.
  (conditionState[stKey] || []).forEach(function (d, i) {
    var bit = d.bit || ('LB' + pad3(300 + i));
    add(bit, bit + (d.name ? ' - ' + d.name : (d.bit ? '' : ' - auto (bit dikosongin)')));
  });
  // Station tanpa Condition custom tetap dapat 3 slot cadangan generik LB300-LB302 dari generator.
  // Tanpa ini, LB300 yang jelas-jelas dibikin malah ketulis "(di luar daftar)" - persis kebalikan
  // dari kenyataannya.
  for (var s = 0; s < 3; s++) add('LB' + pad3(300 + s), 'LB' + pad3(300 + s) + ' - slot cadangan');
  // Nilai yang LAGI kepasang tapi gak ada di daftar (hasil import JSON, atau Condition-nya keburu
  // dihapus) wajib tetap muncul sebagai opsi. Kalau nggak, select jatuh ke opsi pertama dan diam-diam
  // ngubah setelan user tiap panel dirender ulang.
  if (current && !seen[current]) out.push({ value: current, label: current + '  (di luar daftar)' });
  return out;
}

var BIT_MANUAL = '(manual)';

// Pesan sekali-pakai di bawah kanvas varian tertentu, mis. alasan sambungan ditolak.
// Bentuknya {key: vKey, text}. Dibersihin tiap kali ada aksi sambung berikutnya.
var graphHint = null;

// Sengaja cuma dengerin 'change', bukan 'input': handler-nya manggil regenerate(), dan kalau dipasang
// di 'input' tiap ketikan bakal ngerender ulang panel lalu ngerebut fokus dari kolomnya sendiri.
function makeBitPicker(stKey, current, emptyLabel, onPick) {
  var wrap = document.createElement('span');
  wrap.style.display = 'inline-flex'; wrap.style.gap = '4px'; wrap.style.alignItems = 'center';
  var sel = document.createElement('select');
  function opt(v, t) { var o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); }
  opt('', emptyLabel);
  conditionBitOptions(stKey, current).forEach(function (o) { opt(o.value, o.label); });
  opt(BIT_MANUAL, 'bit lain (ketik manual)...');
  sel.value = current || '';

  var manual = document.createElement('input');
  manual.placeholder = 'nama bit'; manual.style.width = '120px'; manual.style.display = 'none';

  function val() { return sel.value === BIT_MANUAL ? manual.value.trim() : sel.value; }
  sel.addEventListener('change', function () {
    var man = sel.value === BIT_MANUAL;
    manual.style.display = man ? '' : 'none';
    if (man) { manual.value = ''; manual.focus(); }
    if (onPick) onPick(val());
  });
  manual.addEventListener('change', function () { if (onPick) onPick(val()); });

  wrap.appendChild(sel); wrap.appendChild(manual);
  return {
    el: wrap, get: val,
    reset: function () { sel.value = ''; manual.value = ''; manual.style.display = 'none'; }
  };
}

function addConditionNode(st, vIdx, bitName, comment) {
  ensureStation(st);
  bitName = (bitName || '').trim();
  if (!bitName) return null;
  if (motionState[st][vIdx].nodes.some(function (n) { return n.id === bitName; })) return null;
  var pos = nextPos(st, vIdx);
  motionState[st][vIdx].nodes.push({ id: bitName, type: 'condition', bit: bitName, comment: (comment || '').trim(), x: pos.x, y: pos.y });
  return bitName;
}

function setNodeComment(st, vIdx, id, text) {
  var n = findNode(st, vIdx, id);
  if (n) n.comment = (text || '').trim();
}

function nodeIndex(st, vIdx, id) {
  var arr = (motionState[st] && motionState[st][vIdx] && motionState[st][vIdx].nodes) || [];
  for (var i = 0; i < arr.length; i++) { if (arr[i].id === id) return i; }
  return -1;
}

function findNode(st, vIdx, id) {
  var i = nodeIndex(st, vIdx, id);
  return i < 0 ? null : motionState[st][vIdx].nodes[i];
}

// Ada path fromId -> ... -> targetId lewat rantai `after` (dependency)?
// refBase() dipakai di sini: rujukan cabang "d1#Y" dan "d1#N" itu node yang SAMA buat urusan cycle.
// Kalau port-nya gak dikupas, d1#Y -> X -> d1#N gak kedeteksi muter padahal jelas muter.
function hasPath(st, vIdx, fromId, targetId, visited) {
  var from = refBase(fromId), target = refBase(targetId);
  if (from === target) return true;
  visited = visited || {};
  if (visited[from]) return false;
  visited[from] = true;
  var n = findNode(st, vIdx, from);
  if (!n || !n.after) return false;
  for (var i = 0; i < n.after.length; i++) {
    if (hasPath(st, vIdx, n.after[i], target, visited)) return true;
  }
  return false;
}

function addEdge(st, vIdx, fromId, toId) {
  var fromBase = refBase(fromId);
  if (fromBase === toId) return false;
  var fi = nodeIndex(st, vIdx, fromBase), ti = nodeIndex(st, vIdx, toId);
  if (fi < 0 || ti < 0) return false;
  var target = motionState[st][vIdx].nodes[ti];
  // Node "condition" itu SUMBER (penanda bit rujukan), gak pernah jadi tujuan panah.
  if ((target.type || 'motion') === 'condition') return false;
  if (target.after.indexOf(fromId) >= 0) return false;
  // Cegah cycle: kalau fromId udah (transitif) tergantung ke toId, nambah toId->depends-on->fromId bikin muter.
  if (hasPath(st, vIdx, fromId, toId)) return false;
  target.after.push(fromId);
  return true;
}

function removeEdge(st, vIdx, fromId, toId) {
  var target = findNode(st, vIdx, toId);
  if (!target || !target.after) return;
  target.after = target.after.filter(function (a) { return a !== fromId; });
}

function removeNode(st, vIdx, id) {
  var variant = motionState[st][vIdx];
  variant.nodes = variant.nodes.filter(function (n) { return n.id !== id; });
  // Buang juga rujukan cabang "id#Y" / "id#N", bukan cuma yang persis "id"
  variant.nodes.forEach(function (n) { if (n.after) n.after = n.after.filter(function (a) { return refBase(a) !== id; }); });
  if (selected && selected.stKey === st && selected.vIdx === vIdx && selected.id === id) selected = null;
}

// Ubah satu field blok yang lagi keselect (sol / cond / bit / category / comment). Sebelum ini blok
// cuma bisa dibikin, gak bisa dibetulin - salah pilih bit berarti hapus lalu bikin ulang, dan semua
// panah yang udah nyambung ke situ ikut hilang.
function setNodeField(st, vIdx, id, key, value) {
  var n = findNode(st, vIdx, id);
  if (n) n[key] = typeof value === 'string' ? value.trim() : value;
}

function toggleJoin(st, vIdx, id) {
  var n = findNode(st, vIdx, id);
  if (n) n.join = (n.join === 'OR') ? 'AND' : 'OR';
}

function moveNode(st, vIdx, id, x, y) {
  var n = findNode(st, vIdx, id);
  if (n) { n.x = Math.max(0, x); n.y = Math.max(0, y); }
}

// Tipe blok yang boleh muncul di array "nodes" JSON. "condition" sengaja TIDAK di sini - dia bukan
// blok berung, cuma penanda bit rujukan yang dibangun ulang dari `after`.
var BLOCK_TYPES = ['motion', 'decision', 'setmem', 'resetmem', 'alarm'];
var ALARM_CATS = ['emergency', 'autostop', 'cyclestop', 'faultstop', 'warning'];
var ALARM_CAT_LABEL = { emergency: 'Emergency stop', autostop: 'Auto stop', cyclestop: 'Cycle stop',
                        faultstop: 'Fault stop', warning: 'Warning' };

// Cabang decision dirujuk "idNode#Y" / "idNode#N". Pemisahnya '#', BUKAN '.', karena alamat bit PLC
// sendiri pakai titik (mis. "0001.06") - harus sama persis dengan refBase/refPort di gen_all.js.
function refBase(ref) { var s = String(ref), i = s.indexOf('#'); return i < 0 ? s : s.slice(0, i); }
function refPort(ref) { var s = String(ref), i = s.indexOf('#'); return i < 0 ? '' : s.slice(i + 1); }

// Komen blok ikut tampil di label, bukan cuma kesimpen di state. Tanpa ini semua blok alarm kelihatan
// "ALARM Fault stop" persis sama dan semua judgement cuma beda nama bit - padahal justru komennya yang
// bilang blok itu ngapain. Node melebar sendiri ngikutin label (nodeW), jadi aman dipanjangin.
// Peta nama simbol -> komen IO list. Dibangun ulang tiap pipeline jalan.
var devKomen = {};
function rebuildDevKomen() {
  devKomen = {};
  if (!lastSplitMsg) return;
  var g = lastSplitMsg.payload;
  Object.keys(g).forEach(function (k) {
    (g[k] || []).forEach(function (d) { if (d.name) devKomen[d.name] = d.komen || ''; });
  });
}

// Nama aktuator di kanvas pakai KOMEN IO-nya, bukan nama simbol. "ST2 SERVO CENTER POS1" langsung
// kebayang bendanya; "SRV_ST2_SRV_CTR_POS1" harus diterjemahin dulu di kepala tiap kali baca.
// Prefix "ST2 " dibuang karena kotak diagramnya memang sudah milik station itu - ngulang nomornya di
// tiap node cuma makan lebar. Nama simbolnya tetap ada di tooltip, dan yang dipakai JSON maupun
// generator tetap simbol - ini murni yang dilihat mata.
function deviceLabel(sym) {
  var k = devKomen[sym];
  if (!k) return sym;
  var s = String(k).replace(/^ST\\s*\\d+\\s*/i, '').replace(/\\s+/g, ' ').trim();
  return s || sym;
}

function nodeLabel(n) {
  var t = n.type || 'motion';
  var c = (n.comment || '').trim();
  var tail = c ? ' - ' + c : '';
  if (t === 'condition') return n.bit + (c ? ' *' : '');
  if (t === 'motion')    return deviceLabel(n.sol);
  if (t === 'decision')  return '? ' + (n.cond || '(bit?)') + tail;
  if (t === 'setmem')    return 'SET ' + (n.bit || '(bit?)') + tail;
  if (t === 'resetmem')  return 'RST ' + (n.bit || '(bit?)') + tail;
  if (t === 'alarm')     return 'ALARM ' + (ALARM_CAT_LABEL[n.category] || n.category || 'faultstop') + tail;
  return t;
}

// Lebar node ngikutin panjang label, gak dipotong lagi. Dulu label dipangkas 15 char jadi
// "SOL_ST1_STP4_.." - dua stopper beda kelihatan sama persis di canvas, gak bisa dibedain.
// Font .gnode-text 10.5px Consolas = ~6.1px/char (advance monospace ~0.55em, dilebihin dikit biar
// aman); +18 buat padding kiri-kanan. Minimal tetap NODE_W biar node berlabel pendek gak jadi kotak
// kecil. ANGKA INI TERIKAT ke font-size .gnode-text - ubah salah satu, ubah dua-duanya.
function nodeW(n) { return Math.max(NODE_W, Math.ceil(nodeLabel(n).length * 6.1) + 18); }

// Titik sambung kabel dipilih dinamis: SISI node yang paling searah ke lawan bicaranya (atas, bawah,
// kiri, atau kanan), bukan selalu kanan->kiri kayak dulu. Bandingin kemiringan garis pusat-ke-pusat
// sama kemiringan diagonal node: lebih landai -> sisi kiri/kanan, lebih curam -> sisi atas/bawah.
// Pakai nodeW(n) bukan NODE_W biar tetap nempel pas node-nya melebar ngikutin label.
function sideAnchor(n, towardX, towardY) {
  var w = nodeW(n), cx = n.x + w / 2, cy = n.y + NODE_H / 2;
  var dx = towardX - cx, dy = towardY - cy;
  if (Math.abs(dx) * NODE_H >= Math.abs(dy) * w) return { x: dx >= 0 ? n.x + w : n.x, y: cy };
  return { x: cx, y: dy >= 0 ? n.y + NODE_H : n.y };
}
function nodeCenter(n) { return { x: n.x + nodeW(n) / 2, y: n.y + NODE_H / 2 }; }

// ===== Import/Export JSON, buat isi graph tanpa drag-drop manual (mis. hasil AI) =====
// Format: array varian [{condition, nodes:[{id,sol,after,join}]}] - SAMA PERSIS bentuk yang
// dikirim ke gen_all.js lewat flow.get("motionSequences"). `after` boleh nunjuk node id lain DI
// VARIAN YANG SAMA, atau bit apapun yang sudah ada (Condition section, sensor) - kalau bit itu
// gak match id node manapun di JSON-nya, otomatis dibikinin node "condition" biar kegambar.
function conditionCommentsOf(v) {
  var out = {};
  v.nodes.forEach(function (n) { if (n.type === 'condition' && n.comment) out[n.bit] = n.comment; });
  return out;
}

// Node "condition" gak ikut array `nodes` (dia dibikin ulang pas import dari `after` yang nggantung),
// jadi posisinya dititipin di map terpisah - sejajar sama conditionComments.
function conditionPositionsOf(v) {
  var out = {};
  v.nodes.forEach(function (n) {
    if (n.type === 'condition') out[n.bit] = { x: Math.round(n.x), y: Math.round(n.y) };
  });
  return out;
}

// x/y IKUT diekspor biar export -> import balik lagi ke tata letak yang sama persis. Ini murni buat
// editor: regenerate() bikin payload-nya sendiri tanpa x/y, jadi gen_all.js tetap gak pernah lihat
// field ini. Import lama juga tetap jalan - JSON tanpa x/y otomatis jatuh ke auto-layout.
// Blok flowchart selain "condition" semuanya node beneran yang punya rung sendiri, jadi wajib ikut
// array `nodes`. Node "condition" TETAP dikecualikan - dia cuma penanda bit rujukan, dibangun ulang
// pas import dari `after` yang nggantung (posisi+komennya lewat conditionPositions/conditionComments).
function serializeNode(n) {
  var t = n.type || 'motion';
  var out = { id: n.id, type: t, after: (n.after || []).slice(), join: n.join || 'AND',
              x: Math.round(n.x), y: Math.round(n.y) };
  if (t === 'motion') out.sol = n.sol;
  else if (t === 'decision') { out.cond = n.cond || ''; out.comment = n.comment || ''; }
  else if (t === 'setmem' || t === 'resetmem') { out.bit = n.bit || ''; out.comment = n.comment || ''; }
  else if (t === 'alarm') { out.category = n.category || 'faultstop'; out.comment = n.comment || ''; }
  return out;
}

function variantsToJSON(stKey) {
  var variants = (motionState[stKey] || []).map(function (v) {
    var motionNodes = v.nodes.filter(function (n) { return (n.type || 'motion') !== 'condition'; });
    var out = {
      condition: v.condition || '',
      comment: v.comment || '',
      conditionComments: conditionCommentsOf(v),
      conditionPositions: conditionPositionsOf(v),
      nodes: motionNodes.map(serializeNode)
    };
    // Cuma ditulis kalau user beneran pernah nggeser. Kalau selalu ditulis, posisi hasil hitung
    // otomatis jadi beku - graph berubah tapi START/END-nya nyangkut di tempat lama.
    if (v.startPos) out.startPos = { x: Math.round(v.startPos.x), y: Math.round(v.startPos.y) };
    if (v.endPos) out.endPos = { x: Math.round(v.endPos.x), y: Math.round(v.endPos.y) };
    return out;
  });
  return JSON.stringify(variants, null, 2);
}

// CADANGAN doang sekarang: cuma kepanggil kalau JSON-nya gak bawa x/y (mis. JSON tulisan tangan atau
// hasil AI). JSON dari tombol Export selalu bawa posisi, jadi tata letaknya dipertahankan apa adanya.
// Posisi node hasil import JSON dulu ngikutin urutan array MENTAH di JSON-nya (grid 4 kolom) - kalau
// urutan array gak ngikutin urutan dependency (`after`), gambarnya berantakan (panah nyilang-nyilang,
// gak kebaca step-nya). Sekarang posisi dihitung dari KEDALAMAN topologi (depth = berapa hop `after`
// dari root) buat Y, dan kolom paralel di depth yang sama buat X - jadi hasil import selalu kegambar
// top-to-bottom ngikutin urutan gerak beneran, forks kesebar ke samping, gak peduli urutan di JSON-nya.
// Grid MURNI berdasarkan urutan topologis (DFS postorder - dependency SELALU kegambar sebelum yang
// gantung ke dia), posisi tiap node = index-nya doang di urutan itu, wrap 4 kolom - PERSIS rumus grid
// lama (idx-based), cuma urutannya sekarang bukan urutan array JSON mentah lagi. Ini SENGAJA gak
// makein "kedalaman"/kolom-paralel dinamis (percobaan sebelumnya) - itu bikin posisi kerasa gak
// absolut karena kolom tiap depth bisa geser tergantung graph shape; grid index-based ini simpel,
// satu-satunya input yang nentuin posisi ya urutan topologis-nya, gak ada faktor lain.
function layoutVariantNodes(nodes) {
  var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
  var visited = {}, order = [];
  function visit(n) {
    if (visited[n.id]) return;
    visited[n.id] = true;
    (n.after || []).forEach(function (ref) { if (byId[ref]) visit(byId[ref]); });
    order.push(n);
  }
  nodes.forEach(visit);
  var COLS = 4;
  order.forEach(function (n, idx) {
    n.x = 20 + (idx % COLS) * 175;
    n.y = ANCHOR_TOP_MARGIN + 20 + Math.floor(idx / COLS) * 90;
  });
}

function importSequenceJSON(stKey, jsonText) {
  var parsed;
  try { parsed = JSON.parse(jsonText); }
  catch (e) { return 'JSON gak valid: ' + e.message; }
  if (!Array.isArray(parsed)) return 'JSON harus array varian: [{"condition":"","nodes":[...]}]';

  var newVariants = [];
  for (var vi = 0; vi < parsed.length; vi++) {
    var raw = parsed[vi] || {};
    if (!Array.isArray(raw.nodes)) return 'Varian ke-' + (vi + 1) + ' butuh field "nodes" (array)';
    var v = { condition: String(raw.condition || '').trim(), comment: String(raw.comment || '').trim(), nodes: [] };
    var allPositioned = true; // turun jadi false begitu ada satu node tanpa x/y valid
    // Posisi START/END manual ikut kebawa. Kalau JSON-nya gak bawa (atau angkanya ngaco), dibiarkan
    // kosong supaya balik ke penempatan otomatis - bukan dipaksa ke 0,0 di pojok.
    ['startPos', 'endPos'].forEach(function (k) {
      var p = raw[k];
      if (!p) return;
      var ax = Number(p.x), ay = Number(p.y);
      if (isFinite(ax) && isFinite(ay)) v[k] = { x: Math.max(0, ax), y: Math.max(0, ay) };
    });
    for (var ni = 0; ni < raw.nodes.length; ni++) {
      var n = raw.nodes[ni] || {};
      var where = 'Varian ke-' + (vi + 1) + ' node ke-' + (ni + 1);
      var t = n.type || 'motion';   // JSON lama gak punya "type" - semuanya motion
      if (!n.id) return where + ' butuh "id"';
      if (BLOCK_TYPES.indexOf(t) < 0) return where + ' (' + n.id + ') punya type "' + t + '" yang gak dikenal (' + BLOCK_TYPES.join('/') + ')';
      if (t === 'motion' && !n.sol) return where + ' bertipe motion, butuh "sol"';
      if (t === 'decision' && !n.cond) return where + ' bertipe decision, butuh "cond" (bit yang dicek)';
      if ((t === 'setmem' || t === 'resetmem') && !n.bit) return where + ' bertipe ' + t + ', butuh "bit"';
      if (n.join !== undefined && n.join !== 'AND' && n.join !== 'OR') {
        return 'Varian ke-' + (vi + 1) + ' node "' + n.id + '": "join" harus persis "AND" atau "OR" (ketemu ' + JSON.stringify(n.join) + ')';
      }
      var px = Number(n.x), py = Number(n.y);
      var hasXY = isFinite(px) && isFinite(py);
      if (!hasXY) allPositioned = false;
      var node = {
        id: String(n.id), type: t,
        after: Array.isArray(n.after) ? n.after.map(String) : [],
        join: n.join === 'OR' ? 'OR' : 'AND',
        x: hasXY ? Math.max(0, px) : 0, y: hasXY ? Math.max(0, py) : 0
      };
      if (t === 'motion') node.sol = String(n.sol);
      else if (t === 'decision') { node.cond = String(n.cond); node.comment = String(n.comment || '').trim(); }
      else if (t === 'setmem' || t === 'resetmem') { node.bit = String(n.bit); node.comment = String(n.comment || '').trim(); }
      else if (t === 'alarm') {
        node.category = ALARM_CATS.indexOf(n.category) >= 0 ? n.category : 'faultstop';
        node.comment = String(n.comment || '').trim();
      }
      v.nodes.push(node);
    }
    // auto-bikin node "condition" buat tiap `after` yang gak match id node motion manapun di varian ini
    var motionIds = {}; v.nodes.forEach(function (n) { motionIds[n.id] = true; });
    var extraBits = [];
    // refBase() WAJIB dipakai di sini: rujukan cabang decision bentuknya "d1#Y". Tanpa dikupas
    // port-nya, "d1#Y" gak match id node manapun dan bakal disalahartikan jadi bit condition -
    // muncul node hantu bernama "d1#Y" di kanvas.
    v.nodes.forEach(function (n) {
      n.after.forEach(function (ref) {
        var b = refBase(ref);
        if (!motionIds[b] && extraBits.indexOf(b) < 0) extraBits.push(b);
      });
    });
    var cc = (raw.conditionComments && typeof raw.conditionComments === 'object') ? raw.conditionComments : {};
    var cp = (raw.conditionPositions && typeof raw.conditionPositions === 'object') ? raw.conditionPositions : {};
    extraBits.forEach(function (bit) {
      var p = cp[bit] || {};
      var bx = Number(p.x), by = Number(p.y);
      var okXY = isFinite(bx) && isFinite(by);
      if (!okXY) allPositioned = false;
      v.nodes.push({
        id: bit, type: 'condition', bit: bit, comment: String(cc[bit] || '').trim(),
        x: okXY ? Math.max(0, bx) : 0, y: okXY ? Math.max(0, by) : 0
      });
    });
    // Auto-layout cuma kalau ada node yang posisinya gak kebawa. Sekali ada yang hilang, SELURUH varian
    // ditata ulang - jangan campur posisi asli sama hasil hitungan, itu malah numpuk di titik acak.
    if (!allPositioned) layoutVariantNodes(v.nodes);
    newVariants.push(v);
  }

  motionState[stKey] = newVariants.length ? newVariants : [{ condition: '', nodes: [] }];
  // motionCounters dipakai buat generate id "n1","n2",... lewat tombol +solenoid - naikkin biar
  // gak collide sama id yang barusan diimport (mis. JSON-nya juga pake id "n1").
  motionState[stKey].forEach(function (v, vIdx) {
    var maxN = 0;
    v.nodes.forEach(function (n) {
      var m = /^n(\d+)$/.exec(n.id);
      if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
    });
    motionCounters[vKey(stKey, vIdx)] = maxN + 1;
  });
  selected = null;
  return null;
}

// ===== Condition section: bit bernama, tiap bit = OR dari beberapa AND-group (PATTERN 3 Ndeso) =====
// Station yang gak disentuh (conditionState[st] kosong/gak ada) tetap dapat 3 slot cadangan generik
// lama - lihat gen_all.js section 8. Beda dari Motion Sequence: gak ada topologi graph/chaining,
// cuma daftar bit -> daftar OR-group -> daftar AND-term (bit + NOT), jadi list editor biasa cukup.
function ensureConditionStation(st) { if (!conditionState[st]) conditionState[st] = []; }

function addConditionDef(st) { ensureConditionStation(st); conditionState[st].push({ name: '', bit: '', groups: [[]] }); }

function removeConditionDef(st, di) { if (conditionState[st]) conditionState[st].splice(di, 1); }

function setConditionDefName(st, di, text) { var d = conditionState[st] && conditionState[st][di]; if (d) d.name = (text || '').trim(); }

function setConditionDefBit(st, di, text) { var d = conditionState[st] && conditionState[st][di]; if (d) d.bit = (text || '').trim(); }

function addOrGroup(st, di) { var d = conditionState[st] && conditionState[st][di]; if (d) d.groups.push([]); }

function removeOrGroup(st, di, gi) { var d = conditionState[st] && conditionState[st][di]; if (d) d.groups.splice(gi, 1); }

function addTerm(st, di, gi, bitName) {
  bitName = (bitName || '').trim();
  var d = conditionState[st] && conditionState[st][di];
  if (!d || !bitName) return false;
  d.groups[gi].push({ bit: bitName, neg: false });
  return true;
}

function removeTerm(st, di, gi, ti) { var d = conditionState[st] && conditionState[st][di]; if (d) d.groups[gi].splice(ti, 1); }

function toggleTermNeg(st, di, gi, ti) { var d = conditionState[st] && conditionState[st][di]; if (d) { var t = d.groups[gi][ti]; t.neg = !t.neg; } }

function conditionDefsToJSON(stKey) {
  return JSON.stringify((conditionState[stKey] || []).map(function (d) {
    return {
      name: d.name || '', bit: d.bit || '',
      groups: d.groups.map(function (g) { return g.map(function (t) { return { bit: t.bit, neg: !!t.neg }; }); })
    };
  }), null, 2);
}

function importConditionJSON(stKey, jsonText) {
  var parsed;
  try { parsed = JSON.parse(jsonText); }
  catch (e) { return 'JSON gak valid: ' + e.message; }
  if (!Array.isArray(parsed)) return 'JSON harus array condition: [{"name":"","bit":"","groups":[[{"bit":"LB1","neg":false}]]}]';

  var defs = [];
  for (var i = 0; i < parsed.length; i++) {
    var raw = parsed[i] || {};
    if (!Array.isArray(raw.groups) || !raw.groups.length) return 'Condition ke-' + (i + 1) + ' butuh field "groups" (array, minimal 1 OR-group)';
    var groups = [];
    for (var gi = 0; gi < raw.groups.length; gi++) {
      var rg = raw.groups[gi];
      if (!Array.isArray(rg)) return 'Condition ke-' + (i + 1) + ' group ke-' + (gi + 1) + ' harus array term';
      var terms = [];
      for (var ti = 0; ti < rg.length; ti++) {
        var rt = rg[ti] || {};
        if (!rt.bit) return 'Condition ke-' + (i + 1) + ' group ke-' + (gi + 1) + ' term ke-' + (ti + 1) + ' butuh "bit"';
        terms.push({ bit: String(rt.bit), neg: !!rt.neg });
      }
      groups.push(terms);
    }
    defs.push({ name: String(raw.name || '').trim(), bit: String(raw.bit || '').trim(), groups: groups });
  }
  conditionState[stKey] = defs;
  return null;
}

// Warning dikelompokkan per station. Sebelumnya cuma satu blok teks panjang - kalau 3 station
// masing-masing ngeluh, semuanya nyampur dan susah tau mana punya siapa. Kode-nya ikut ditampilin
// karena itu yang stabil dan bisa dicari, teks pesannya bisa berubah.
function renderWarnings(list, raw) {
  warnEl.innerHTML = '';
  if (!list || !list.length) { warnEl.textContent = raw || ''; return; }
  var byStation = {};
  list.forEach(function (w) { var k = w.station || 'Umum'; (byStation[k] = byStation[k] || []).push(w); });
  Object.keys(byStation).sort().forEach(function (st) {
    var h = document.createElement('div'); h.className = 'warn-grp';
    h.textContent = st + ' - ' + byStation[st].length + ' warning';
    warnEl.appendChild(h);
    byStation[st].forEach(function (w) {
      var d = document.createElement('div'); d.className = 'warn-item';
      var c = document.createElement('span'); c.className = 'warn-code'; c.textContent = w.code;
      d.appendChild(c);
      // Prefix "ST1: " dibuang - sudah jadi judul grupnya, gak perlu diulang tiap baris
      d.appendChild(document.createTextNode(w.message.replace(/^[A-Za-z0-9_]+:\\s*/, '')));
      warnEl.appendChild(d);
    });
  });
}

function renderResults(payload) {
  resEl.innerHTML = '';
  statsEl.textContent = payload.stats;
  // Rekomendasi ukuran array dihitung dari generate BARUSAN, bukan ditebak: alUsed/mfUsed itu jumlah
  // slot yang beneran keisi. Angka di kotak input dibiarin apa adanya - user yang mutusin, kita cuma
  // ngasih tau minimalnya berapa dan berapa yang lagi kepakai.
  if (arraySizeHintEl) {
    var ai = payload.arrayInfo;
    // Rekomendasi = tepat sebesar yang DIALOKASI (blok per-station sudah termasuk padding spare),
    // dibulatkan ke atas kelipatan 10. Nambahin kelonggaran lagi di atas padding cuma bikin ratusan
    // baris spare yang gak ada gunanya.
    arraySizeHintEl.textContent = ai
      ? 'Terisi: AL ' + ai.alFilled + ', MF ' + ai.mfFilled + ' slot. '
        + 'Dialokasi (termasuk spare ' + ai.stationBlock + '/station): AL ' + ai.alUsed + ', MF ' + ai.mfUsed + '. '
        + 'Array dibuat: AL[1..' + ai.alSize + '], MF[1..' + ai.mfSize + ']. '
        + 'Rekomendasi minimal AL ' + Math.ceil(ai.alUsed / 10) * 10 + ', MF ' + Math.ceil(ai.mfUsed / 10) * 10 + '.'
      : '';
  }
  lastArrayRows = payload.arrayRows || [];
  lastGlobalRows = payload.globalRows || [];
  renderHmiMap(payload.hmiMap);
  lastWarnings = payload.warnings || '';
  lastWarnList = payload.warnList || [];
  // Jumlah berkas ditulis di sebelah "Results" di nav samping - dari situ kelihatan generate
  // sudah jalan tanpa perlu menggulir ke bawah dulu buat memastikan.
  if (navFileCountEl) navFileCountEl.textContent = payload.files.length ? payload.files.length : '';
  renderWarnings(lastWarnList, lastWarnings);
  warnBoxEl.style.display = payload.warnings ? 'block' : 'none';
  // Panel Confirm Mode diwarnai dari warnList generate INI - kalau gak dirender ulang di sini,
  // sorotan merahnya nyangkut di hasil generate sebelumnya.
  if (lastSplitMsg && confirmModePanelEl) renderConfirmModePanel();

  if (payload.files.length) {
    var single = document.createElement('div');
    single.className = 'single';
    single.innerHTML = '<div class="t">Import sekali jalan</div>' +
      '<div class="d">Semua program dan global variable dalam 1 file XML.</div>';
    var dlBtn = document.createElement('button');
    dlBtn.className = 'dl'; dlBtn.textContent = 'Download combined XML';
    dlBtn.addEventListener('click', function () { downloadFile(payload.files[0].name, payload.files[0].xml); });
    single.appendChild(dlBtn);
    resEl.appendChild(single);
  }

  // Per-program file (MAIN, tiap station, GlobalVariables.tsv) - kotaknya makan tempat (tiap satu
  // punya textarea gede), disembunyiin default di balik <details>. AllPrograms.xml single-download
  // di atas udah cukup buat kebanyakan kasus.
  // Spreadsheet AL/MF ditaruh SEBELUM fold "Download per program" dan di luar fold itu. Waktu masih
  // di dalam fold, tabelnya cuma kelihatan sebagai textarea mentah yang ke-scroll - persis yang mau
  // dihindari, karena yang dibutuhkan itu menyalin satu kolom, bukan membaca TSV.
  var gsheet = buildGlobalSheet();
  if (gsheet) resEl.appendChild(gsheet);
  var nbp = buildNbPanel(payload.files);
  if (nbp) resEl.appendChild(nbp);
  var sheet = buildArraySheet();
  if (sheet) resEl.appendChild(sheet);

  var details = document.createElement('details'); details.className = 'per-program';
  if (perProgramOpen) details.open = true;
  details.addEventListener('toggle', function () { perProgramOpen = details.open; });
  var summary = document.createElement('summary'); summary.textContent = 'Files (' + payload.files.length + ' file)';
  details.appendChild(summary);
  payload.files.forEach(function (f) {
    var div = document.createElement('div');
    div.className = 'file';
    var row = document.createElement('div');
    row.className = 'row';
    var b = document.createElement('b'); b.textContent = f.name;
    var btn = document.createElement('button'); btn.className = 'dl'; btn.textContent = 'Download';
    btn.addEventListener('click', function () { downloadFile(f.name, f.xml); });
    row.appendChild(b); row.appendChild(btn);
    var ta = document.createElement('textarea'); ta.readOnly = true; ta.value = f.xml;
    div.appendChild(row); div.appendChild(ta);
    details.appendChild(div);
  });
  resEl.appendChild(details);
}

function regenerate() {
  if (!lastSplitMsg) return;
  flowStore.motionSequences = {};
  Object.keys(motionState).forEach(function (st) {
    var variants = motionState[st]
      .map(function (v) {
        var motionNodes = v.nodes.filter(function (n) { return (n.type || 'motion') !== 'condition'; });
        return { condition: v.condition || '', comment: v.comment || '', conditionComments: conditionCommentsOf(v), nodes: motionNodes.map(function (n) {
          // x/y sengaja dibuang di sini - generator gak perlu tata letak, itu murni data editor
          var s = serializeNode(n); delete s.x; delete s.y; return s;
        }) };
      })
      .filter(function (v) { return v.nodes.length; });
    if (variants.length) flowStore.motionSequences[st] = variants;
  });
  flowStore.conditionDefs = {};
  Object.keys(conditionState).forEach(function (st) {
    var defs = (conditionState[st] || [])
      .map(function (d) {
        return {
          name: d.name || '', bit: d.bit || '',
          groups: d.groups.filter(function (g) { return g.length; }).map(function (g) {
            return g.map(function (t) { return { bit: t.bit, neg: !!t.neg }; });
          })
        };
      })
      .filter(function (d) { return d.groups.length; });
    if (defs.length) flowStore.conditionDefs[st] = defs;
  });
  flowStore.stationNames = stationNames;
  flowStore.timerDefaults = { phpx: timerPhpxEl ? timerPhpxEl.value : '', motion: timerMotionEl ? timerMotionEl.value : '' };
  flowStore.arraySizes = { al: alSizeEl ? alSizeEl.value : '', mf: mfSizeEl ? mfSizeEl.value : '',
                           stationBlock: stationBlockEl ? stationBlockEl.value : '' };
  flowStore.hmiMap = hmiSettings();
  flowStore.advancedInstructions = advInstrEl ? advInstrEl.checked : false;
  flowStore.actuatorOverrides = actuatorOverrides;
  try {
    // Salinan wrapper baru tiap panggil - gen_all.js nge-reassign msg.payload di baris terakhirnya,
    // kalau lastSplitMsg dipakai langsung, groups di dalamnya keganti hasil generate pas dipanggil lagi.
    var msg = runNode(GEN_ALL_JS, { payload: lastSplitMsg.payload }, flowStore);
    renderResults(msg.payload);
  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
  }
}

// Titik masuk (root) dan titik akhir (leaf) sebuah varian. Dipisah dari renderVariantGraph biar bisa
// diuji tanpa DOM - ini logika yang nentuin ke mana panah START dan END digambar, dan salah sedikit
// aja gambarnya langsung nyeritain alur yang beda dari ladder-nya.
function graphEnds(nodes) {
  var nodeIds = {}; nodes.forEach(function (n) { nodeIds[n.id] = true; });
  var isStep = function (n) { return (n.type || 'motion') !== 'condition'; };
  var referencedIds = {};
  nodes.forEach(function (n) {
    (n.after || []).forEach(function (ref) { var b = refBase(ref); if (nodeIds[b]) referencedIds[b] = true; });
  });
  var roots = nodes.filter(function (n) {
    return isStep(n) && !(n.after || []).some(function (ref) { return nodeIds[refBase(ref)]; });
  });
  var leaves = nodes.filter(function (n) { return isStep(n) && !referencedIds[n.id]; });
  return {
    nodeIds: nodeIds, roots: roots, leaves: leaves,
    targets: roots.length ? roots : nodes.filter(isStep),
    sources: leaves.length ? leaves : nodes.filter(isStep)
  };
}

function renderVariantGraph(stKey, vIdx) {
  var variant = motionState[stKey][vIdx];
  var nodes = variant.nodes;
  var key = vKey(stKey, vIdx);
  var maxY = 40, maxX = 0;
  nodes.forEach(function (n) {
    if (n.y + NODE_H > maxY) maxY = n.y + NODE_H;
    if (n.x + nodeW(n) > maxX) maxX = n.x + nodeW(n);
  });

  // Node "Start"/"Finish" - MURNI visual, gak ikut jadi rung. Sambungannya dihitung tiap render dari
  // graph SEKARANG, tapi POSISINYA bisa digeser dan disimpan (variant.startPos/endPos) - selama belum
  // pernah digeser, posisinya ngikut rata-rata node tujuan/asal seperti dulu.
  // Start nyambung ke tiap node yang gak nunjuk node
  // lain (root), Finish nyambung DARI tiap node yang gak ada yang nunjuk dia (leaf) -
  // biar kelihatan jelas dari mana mulai dan kemana berakhirnya sequence-nya. Lingkaran kecil (logo
  // flowchart terminal biasa). Titik sambungnya ikut sideAnchor kayak kabel antar-node: karena Start
  // selalu di atas dan Finish di bawah, sisi yang kepilih ya tetap atas/bawah - tapi sekarang nempel
  // ke sisi terdekat kalau node-nya digeser jauh ke samping, gak lagi maksa ke tengah atas/bawah.
  // refBase() WAJIB di sini. Rujukan cabang decision bentuknya "d1#Y" - tanpa dikupas port-nya dia
  // gak match id node manapun, jadi node yang SUDAH nunggu hasil judgement kebaca sebagai root dan
  // ikut ditarik START. Gambarnya lalu bohong: kelihatan jalan barengan padahal ladder-nya nunggu.
  // Semua tipe blok ikut dihitung (bukan cuma motion): sequence sah dimulai dari judgement, dan sah
  // berakhir di alarm. Yang dikecualikan cuma "condition" - itu penanda bit rujukan, bukan langkah.
  var ends = graphEnds(nodes);
  var nodeIds = ends.nodeIds;
  var fallbackTargets = ends.targets, fallbackSources = ends.sources;
  // Posisi START/END: kalau user pernah nggeser, pakai yang disimpan; kalau belum, hitung otomatis
  // dari rata-rata node tujuan/asal seperti sebelumnya.
  var startFixed = variant.startPos, endFixed = variant.endPos;
  function avgCenterX(list, fallbackX) {
    if (!list.length) return fallbackX;
    var sum = 0; list.forEach(function (n) { sum += nodeCenter(n).x; });
    return sum / list.length;
  }
  var startAnchor = startFixed
    ? { x: startFixed.x, y: startFixed.y }
    : { x: avgCenterX(fallbackTargets, 20 + NODE_W / 2) - ANCHOR_R, y: 18 - ANCHOR_R };
  var finishAnchor = endFixed
    ? { x: endFixed.x, y: endFixed.y }
    : { x: avgCenterX(fallbackSources, 20 + NODE_W / 2) - ANCHOR_R, y: maxY + 22 };

  // Kanvas harus ikut melar kalau START/END digeser ke luar batas node - kalau enggak, bulatannya
  // kepotong dan gak bisa diseret balik.
  var needW = Math.max(maxX, startAnchor.x + ANCHOR_R * 2, finishAnchor.x + ANCHOR_R * 2);
  var needH = Math.max(maxY, startAnchor.y + ANCHOR_R * 2, finishAnchor.y + ANCHOR_R * 2);
  var svg = svgEl('svg', { class: 'graph-canvas', width: Math.max(620, needW + 40), height: Math.max(160, needH + 30) });
  var markerId = 'arrow-' + stKey + '-' + vIdx;
  var defs = svgEl('defs');
  var marker = svgEl('marker', { id: markerId, markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
  marker.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', fill: '#666' }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  function anchorEdgeDown(fromCx, fromCy, toNode) {
    var p = sideAnchor(toNode, fromCx, fromCy);
    svg.appendChild(svgEl('line', {
      class: 'gedge-line anchor', x1: fromCx, y1: fromCy, x2: p.x, y2: p.y,
      'marker-end': 'url(#' + markerId + ')'
    }));
  }
  function anchorEdgeUp(fromNode, toCx, toCy) {
    var p = sideAnchor(fromNode, toCx, toCy);
    svg.appendChild(svgEl('line', {
      class: 'gedge-line anchor', x1: p.x, y1: p.y, x2: toCx, y2: toCy,
      'marker-end': 'url(#' + markerId + ')'
    }));
  }
  function anchorNode(pos, label, which) {
    var cx = pos.x + ANCHOR_R, cy = pos.y + ANCHOR_R;
    var g = svgEl('g');
    var circle = svgEl('circle', { class: 'gnode-rect anchor', cx: cx, cy: cy, r: ANCHOR_R });
    g.appendChild(circle);
    var t = svgEl('text', { class: 'gnode-text', x: cx, y: cy + 3, 'text-anchor': 'middle' });
    t.textContent = label;
    g.appendChild(t);
    var tip = svgEl('title');
    tip.textContent = label + ' - seret buat mindahin, klik ganda buat balikin ke posisi otomatis';
    g.appendChild(tip);
    g.addEventListener('mousedown', function (ev) {
      ev.stopPropagation();
      var bb = svg.getBoundingClientRect();
      dragState = { mode: 'anchor', stKey: stKey, vIdx: vIdx, which: which,
                    offX: ev.clientX - bb.left - pos.x, offY: ev.clientY - bb.top - pos.y };
    });
    // Klik ganda = lupakan posisi manual, balik ngikut rata-rata node lagi.
    g.addEventListener('dblclick', function (ev) {
      ev.stopPropagation();
      var v = motionState[stKey][vIdx];
      if (which === 'start') delete v.startPos; else delete v.endPos;
      renderMotionPanel();
    });
    svg.appendChild(g);
    return { cx: cx, cy: cy };
  }
  var startC = anchorNode(startAnchor, 'START', 'start');
  fallbackTargets.forEach(function (n) { anchorEdgeDown(startC.cx, startC.cy + ANCHOR_R, n); });
  var finishC = anchorNode(finishAnchor, 'END', 'end');
  fallbackSources.forEach(function (n) { anchorEdgeUp(n, finishC.cx, finishC.cy - ANCHOR_R); });

  nodes.forEach(function (n) {
    if ((n.type || 'motion') === 'condition') return;
    (n.after || []).forEach(function (fromId) {
      // fromId bisa "d1#Y" - node sumbernya tetap "d1"
      var from = findNode(stKey, vIdx, refBase(fromId));
      if (!from) return;
      var isSel = selected && selected.kind === 'edge' && selected.stKey === stKey && selected.vIdx === vIdx &&
        selected.fromId === fromId && selected.toId === n.id;
      var p1 = sideAnchor(from, nodeCenter(n).x, nodeCenter(n).y);
      var p2 = sideAnchor(n, nodeCenter(from).x, nodeCenter(from).y);
      var line = svgEl('line', {
        class: 'gedge-line' + (isSel ? ' selected' : ''), x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        'marker-end': 'url(#' + markerId + ')'
      });
      line.addEventListener('click', function (ev) {
        ev.stopPropagation();
        selected = { stKey: stKey, vIdx: vIdx, kind: 'edge', fromId: fromId, toId: n.id };
        renderMotionPanel();
      });
      svg.appendChild(line);
    });
  });

  if (dragState && dragState.mode === 'connect' && dragState.stKey === stKey && dragState.vIdx === vIdx) {
    var src = findNode(stKey, vIdx, dragState.fromId);
    if (src) {
      var sp = sideAnchor(src, dragState.x, dragState.y);
      svg.appendChild(svgEl('line', {
        class: 'gtemp-line', x1: sp.x, y1: sp.y, x2: dragState.x, y2: dragState.y
      }));
    }
  }

  nodes.forEach(function (n) {
    var isSelNode = selected && selected.kind === 'node' && selected.stKey === stKey && selected.vIdx === vIdx && selected.id === n.id;
    // class "gnode" yang bikin aturan hover di CSS kena; "sel" nahan kontrolnya tetap kelihatan
    // selama node-nya keselect, jadi habis diklik gak perlu cari-cari bulatannya lagi.
    var g = svgEl('g', { class: 'gnode' + (isSelNode ? ' sel' : ''), transform: 'translate(' + n.x + ',' + n.y + ')' });

    // Tooltip buat SEMUA blok berkomen, bukan cuma condition - berguna kalau komennya panjang dan
    // label di kanvas jadi lebar; hover tetap nampilin teks utuhnya. Node syarat SELALU dapat tooltip
    // walau gak berkomen, isinya arah sambungan - itu yang paling sering bikin bingung: dia cuma bisa
    // jadi SUMBER, dan nyeret ke arah dia bakal ditolak diam-diam.
    var tipTxt = n.comment || '';
    // Node motion: tooltip nampilin nama simbol yang sebenarnya, karena label di kanvas sekarang
    // pakai komen. Itu yang dipakai di JSON dan ladder, jadi harus tetap gampang dilihat.
    if (ntype === 'motion') {
      tipTxt = n.sol + (devKomen[n.sol] ? '\\n' + devKomen[n.sol] : '');
    }
    if (ntype === 'condition') {
      // Backslash-nya WAJIB dobel di sini. HTML di build_html.py itu string Python BIASA (bukan raw),
      // jadi escape tunggal bakal ditelan Python jadi baris baru beneran dan literal JS-nya kebuka.
      // Konvensi yang sama dipakai placeholder JSON di atas (tab-nya juga ditulis dobel).
      tipTxt = 'Syarat: ' + n.bit + (n.comment ? ' - ' + n.comment : '') +
        '\\nTarik dari bulatan kuning ke langkah yang harus NUNGGU bit ini.' +
        '\\nGak bisa jadi tujuan panah: bit ini didrive di luar flowchart (Condition section / sensor).';
    }
    if (tipTxt) {
      var titleEl = svgEl('title'); titleEl.textContent = tipTxt; g.appendChild(titleEl);
    }

    var w = nodeW(n);
    var ntype = n.type || 'motion';
    var rect = svgEl('rect', { class: 'gnode-rect' + (ntype === 'motion' ? '' : ' ' + ntype) + (isSelNode ? ' selected' : ''), width: w, height: NODE_H, rx: 6 });
    rect.addEventListener('mousedown', function (ev) {
      ev.stopPropagation();
      selected = { stKey: stKey, vIdx: vIdx, kind: 'node', id: n.id };
      var bb = svg.getBoundingClientRect();
      dragState = { mode: 'move', stKey: stKey, vIdx: vIdx, id: n.id, moved: false, offX: ev.clientX - bb.left - n.x, offY: ev.clientY - bb.top - n.y };
      renderMotionPanel();
    });
    g.appendChild(rect);

    var text = svgEl('text', { class: 'gnode-text', x: 6, y: NODE_H / 2 + 3 });
    text.textContent = nodeLabel(n);
    g.appendChild(text);

    var delC = svgEl('circle', { class: 'gnode-del', cx: w, cy: 0, r: 7 });
    delC.addEventListener('mousedown', function (ev) { ev.stopPropagation(); });
    delC.addEventListener('click', function (ev) {
      ev.stopPropagation(); removeNode(stKey, vIdx, n.id); renderMotionPanel(); regenerate();
    });
    g.appendChild(delC);
    var delT = svgEl('text', { class: 'gnode-del-text', x: w, y: 3 });
    delT.textContent = 'x';
    g.appendChild(delT);

    // Blok decision punya DUA port keluar: Y (kanan, kuning) dan N (bawah, abu). Tiap port nyeret
    // rujukan "id#Y"/"id#N" - itu yang bikin generator tau cabang mana yang nyambung ke node hilir.
    function addHandle(port, hx, hy) {
      var h = svgEl('circle', { class: 'gnode-handle' + (port === 'N' ? ' port-n' : ''), cx: hx, cy: hy, r: 6 });
      h.addEventListener('mousedown', function (ev) {
        ev.stopPropagation();
        dragState = { mode: 'connect', stKey: stKey, vIdx: vIdx, fromId: n.id + (port ? '#' + port : ''),
                      x: n.x + hx, y: n.y + hy };
      });
      g.appendChild(h);
      if (port) {
        var pt = svgEl('text', { class: 'gport-text', x: hx, y: hy + 3 });
        pt.textContent = port; g.appendChild(pt);
      }
    }
    if (ntype === 'decision') { addHandle('Y', w, NODE_H / 2); addHandle('N', w / 2, NODE_H); }
    else { addHandle('', w, NODE_H / 2); }

    if (ntype !== 'condition' && (n.after || []).length >= 2) {
      var badgeG = svgEl('g', { class: 'gjoin-badge', transform: 'translate(' + (w / 2 - 16) + ',' + (NODE_H + 4) + ')' });
      badgeG.appendChild(svgEl('rect', { width: 32, height: 14, rx: 3 }));
      var badgeText = svgEl('text', { x: 16, y: 10 });
      badgeText.textContent = n.join === 'OR' ? 'OR' : 'AND';
      badgeG.appendChild(badgeText);
      badgeG.addEventListener('click', function (ev) {
        ev.stopPropagation(); toggleJoin(stKey, vIdx, n.id); renderMotionPanel(); regenerate();
      });
      g.appendChild(badgeG);
    }

    svg.appendChild(g);
  });

  svgRefs[key] = svg;
  return svg;
}

function onDocMouseMove(ev) {
  if (!dragState) return;
  var key = vKey(dragState.stKey, dragState.vIdx);
  var svg = svgRefs[key];
  if (!svg) return;
  var bb = svg.getBoundingClientRect();
  if (dragState.mode === 'move') {
    dragState.moved = true;
    moveNode(dragState.stKey, dragState.vIdx, dragState.id, ev.clientX - bb.left - dragState.offX, ev.clientY - bb.top - dragState.offY);
    renderMotionPanel();
  } else if (dragState.mode === 'connect') {
    dragState.x = ev.clientX - bb.left; dragState.y = ev.clientY - bb.top;
    renderMotionPanel();
  } else if (dragState.mode === 'anchor') {
    var variant = motionState[dragState.stKey] && motionState[dragState.stKey][dragState.vIdx];
    if (!variant) return;
    var pos = { x: Math.max(0, Math.round(ev.clientX - bb.left - dragState.offX)),
                y: Math.max(0, Math.round(ev.clientY - bb.top - dragState.offY)) };
    if (dragState.which === 'start') variant.startPos = pos; else variant.endPos = pos;
    renderMotionPanel();
  }
}

function onDocMouseUp(ev) {
  if (!dragState) return;
  if (dragState.mode === 'connect') {
    var key = vKey(dragState.stKey, dragState.vIdx);
    var svg = svgRefs[key];
    if (svg) {
      var bb = svg.getBoundingClientRect();
      var mx = ev.clientX - bb.left, my = ev.clientY - bb.top;
      var nodes = motionState[dragState.stKey][dragState.vIdx].nodes;
      var target = nodes.filter(function (n) {
        return mx >= n.x && mx <= n.x + nodeW(n) && my >= n.y && my <= n.y + NODE_H;
      })[0];
      // Penolakan sambungan dulu diem total - user cuma lihat panahnya ilang tanpa tau kenapa.
      graphHint = null;
      if (target) {
        var ok = addEdge(dragState.stKey, dragState.vIdx, dragState.fromId, target.id);
        if (!ok) {
          graphHint = { key: key, text: (target.type || 'motion') === 'condition'
            ? 'Blok syarat "' + target.bit + '" gak bisa jadi TUJUAN panah - dia sumber. '
              + 'Tarik dari bulatan kuningnya ke langkah yang harus nunggu bit ini.'
            : 'Sambungan ditolak: tujuannya sama dengan sumbernya, panahnya sudah ada, atau bakal bikin alur muter.' };
        }
      }
    }
  }
  dragState = null;
  renderMotionPanel();
  regenerate();
}

function onDocKeyDown(ev) {
  if ((ev.key === 'Delete' || ev.key === 'Backspace') && selected) {
    if (document.activeElement && /input|textarea/i.test(document.activeElement.tagName || '')) return;
    ev.preventDefault && ev.preventDefault();
    if (selected.kind === 'node') removeNode(selected.stKey, selected.vIdx, selected.id);
    else if (selected.kind === 'edge') removeEdge(selected.stKey, selected.vIdx, selected.fromId, selected.toId);
    selected = null;
    renderMotionPanel();
    regenerate();
  }
}

function renderMotionPanel() {
  motionPanelEl.innerHTML = '';
  if (!lastSplitMsg) { motionPanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  var any = false;

  stations.forEach(function (stKey) {
    var names = actuatorNamesForStation(groups[stKey]);
    if (!names.length) return;
    any = true;
    ensureStation(stKey);

    var box = document.createElement('div'); box.className = 'station-box';
    var title = document.createElement('div'); title.className = 'station-title'; title.textContent = stKey + (stationNames[stKey] ? ' - ' + stationNames[stKey] : '');
    box.appendChild(title);

    motionState[stKey].forEach(function (variant, vIdx) {
      var vbox = document.createElement('div'); vbox.className = 'variant-box';

      var head = document.createElement('div'); head.className = 'variant-head';
      var lbl = document.createElement('b'); lbl.textContent = 'Variant ' + (vIdx + 1) + ' - Condition:';
      // Isi bit Condition section (LB300, LB301, ...), BUKAN coil latch varian-nya (LB401, LB402, ...) -
      // coil latch dibikin otomatis oleh generator; kalau diketik coil-nya sendiri, generator remap
      // balik ke LB30x + kasih warning (latch gak bisa nge-trigger dirinya sendiri).
      var condPick = makeBitPicker(stKey, variant.condition, '(kosong = selalu aktif)', function (val) {
        setVariantCondition(stKey, vIdx, val); regenerate();
      });
      condPick.el.title = 'Bit Condition section (LB300, LB301, ...) yang nge-select varian ini. Jangan diisi LB401/LB402 - itu coil latch yang dibikin otomatis.';
      var cmtLbl = document.createElement('b'); cmtLbl.textContent = 'Comment:'; cmtLbl.style.marginLeft = '8px';
      var cmtInput = document.createElement('input'); cmtInput.placeholder = '(nama/keterangan varian, muncul di JSON+XML)'; cmtInput.value = variant.comment || ''; cmtInput.style.width = '220px';
      cmtInput.addEventListener('change', function () { setVariantComment(stKey, vIdx, cmtInput.value); regenerate(); });
      var rmV = document.createElement('button'); rmV.className = 'rm-variant'; rmV.textContent = 'Remove variant';
      rmV.addEventListener('click', function () { removeVariant(stKey, vIdx); renderMotionPanel(); regenerate(); });
      head.appendChild(lbl); head.appendChild(condPick.el); head.appendChild(cmtLbl); head.appendChild(cmtInput); head.appendChild(rmV);
      vbox.appendChild(head);

      var toolbar = document.createElement('div'); toolbar.className = 'graph-toolbar';
      names.forEach(function (n) {
        var btn = document.createElement('button'); btn.className = 'avail-btn';
        // Sama seperti label node: yang dibaca komen, simbolnya di tooltip
        btn.textContent = '+ ' + deviceLabel(n);
        btn.title = n + (devKomen[n] ? ' - ' + devKomen[n] : '');
        btn.addEventListener('click', function () { addMotionNode(stKey, vIdx, n); renderMotionPanel(); regenerate(); });
        toolbar.appendChild(btn);
      });
      var condCmtInput = document.createElement('input'); condCmtInput.placeholder = 'komen bit ini (opsional)'; condCmtInput.style.width = '160px';
      // Pilih Condition yang udah dibikin -> komennya ikut keisi dari nama Condition-nya, selama user
      // belum ngetik komen sendiri (jangan nimpa yang udah diketik).
      var condNodePick = makeBitPicker(stKey, '', '-- pilih condition --', function (val) {
        if (condCmtInput.value.trim()) return;
        var def = (conditionState[stKey] || []).filter(function (d) { return d.bit === val; })[0];
        if (def && def.name) condCmtInput.value = def.name;
      });
      var condBtn = document.createElement('button'); condBtn.className = 'add-cond'; condBtn.textContent = '+ Condition/bit';
      condBtn.title = 'Taruh bit yang SUDAH ada (Condition section, sensor, memory) sebagai SYARAT. '
        + 'Tarik dari bulatan kuningnya ke langkah yang harus nunggu bit itu ON. '
        + 'Arahnya satu jalur: dia sumber, gak bisa jadi tujuan panah - logic yang nyalain bit itu ditulis di luar flowchart.';
      condBtn.addEventListener('click', function () {
        if (addConditionNode(stKey, vIdx, condNodePick.get(), condCmtInput.value)) {
          condNodePick.reset(); condCmtInput.value = ''; renderMotionPanel(); regenerate();
        }
      });
      toolbar.appendChild(condNodePick.el); toolbar.appendChild(condCmtInput); toolbar.appendChild(condBtn);
      vbox.appendChild(toolbar);

      // ===== Baris blok flowchart: IF-ELSE / SET / RESET / ALARM =====
      // Bit yang dipakai (kondisi judgement, target memory) dipilih lewat dropdown yang sama dengan
      // Condition - jadi sensor, bit Condition, atau bit custom semuanya bisa dipakai.
      var blockBar = document.createElement('div'); blockBar.className = 'graph-toolbar';
      var blkLbl = document.createElement('b'); blkLbl.textContent = 'Blocks:'; blkLbl.style.fontSize = '11px';
      blockBar.appendChild(blkLbl);

      var blkPick = makeBitPicker(stKey, '', '-- pilih bit --', null);
      var blkCmt = document.createElement('input'); blkCmt.placeholder = 'komen blok (opsional)'; blkCmt.style.width = '150px';
      blockBar.appendChild(blkPick.el); blockBar.appendChild(blkCmt);

      function addBlk(spec, needBit) {
        var bit = blkPick.get();
        if (needBit && !bit) { window.alert('Pilih dulu bit-nya di dropdown "-- pilih bit --".'); return; }
        spec.comment = blkCmt.value.trim();
        addBlockNode(stKey, vIdx, spec);
        blkPick.reset(); blkCmt.value = '';
        renderMotionPanel(); regenerate();
      }
      function blkBtn(label, title, cls, fn) {
        var b = document.createElement('button'); b.className = cls; b.textContent = label; b.title = title;
        b.addEventListener('click', fn); blockBar.appendChild(b);
      }
      blkBtn('+ IF/ELSE', 'Blok judgement: satu masuk, dua keluar (port Y kanan, port N bawah)', 'add-cond',
        function () { addBlk({ type: 'decision', cond: blkPick.get() }, true); });
      blkBtn('+ SET mem', 'Set bit memory (latch, bertahan sampai di-reset)', 'add-cond',
        function () { addBlk({ type: 'setmem', bit: blkPick.get() }, true); });
      blkBtn('+ RESET mem', 'Reset bit memory', 'add-cond',
        function () { addBlk({ type: 'resetmem', bit: blkPick.get() }, true); });

      var alarmSel = document.createElement('select');
      ALARM_CATS.forEach(function (c) {
        var o = document.createElement('option'); o.value = c; o.textContent = ALARM_CAT_LABEL[c]; alarmSel.appendChild(o);
      });
      alarmSel.value = 'faultstop';
      blockBar.appendChild(alarmSel);
      blkBtn('+ ALARM', 'Trigger alarm: dapat slot AL[] otomatis dan masuk grup kategori yang dipilih', 'add-cond',
        function () { addBlk({ type: 'alarm', category: alarmSel.value }, false); });

      vbox.appendChild(blockBar);

      vbox.appendChild(renderVariantGraph(stKey, vIdx));

      if (graphHint && graphHint.key === vKey(stKey, vIdx)) {
        var hintEl = document.createElement('div');
        hintEl.className = 'graph-hint';
        hintEl.textContent = graphHint.text;
        vbox.appendChild(hintEl);
      }

      if (selected && selected.kind === 'node' && selected.stKey === stKey && selected.vIdx === vIdx) {
        var selNode = findNode(stKey, vIdx, selected.id);
        if (selNode) {
          // Panel edit blok terpilih. Semua handler pakai event 'change' (kejadiannya pas blur), jadi
          // renderMotionPanel() di sini gak ngerebut fokus di tengah ngetik - dan perlu dipanggil biar
          // label di kanvas ikut berubah, karena komen sekarang ditampilin di sana.
          var selType = selNode.type || 'motion';
          var editRow = document.createElement('div'); editRow.className = 'graph-toolbar';
          var editLbl = document.createElement('b');
          editLbl.textContent = 'Edit block "' + nodeLabel(selNode) + '":';
          editLbl.style.fontSize = '11px';
          editRow.appendChild(editLbl);

          function applyEdit(key, value) {
            setNodeField(stKey, vIdx, selNode.id, key, value);
            renderMotionPanel(); regenerate();
          }

          if (selType === 'motion') {
            var solSel = document.createElement('select');
            names.forEach(function (nm) {
              var o = document.createElement('option'); o.value = nm;
              o.textContent = deviceLabel(nm) + (devKomen[nm] ? '  (' + nm + ')' : '');
              solSel.appendChild(o);
            });
            solSel.value = selNode.sol;
            solSel.addEventListener('change', function () { applyEdit('sol', solSel.value); });
            editRow.appendChild(solSel);

          } else if (selType === 'decision') {
            editRow.appendChild(makeBitPicker(stKey, selNode.cond || '', '-- kondisi --',
              function (val) { applyEdit('cond', val); }).el);

          } else if (selType === 'setmem' || selType === 'resetmem') {
            editRow.appendChild(makeBitPicker(stKey, selNode.bit || '', '-- bit memory --',
              function (val) { applyEdit('bit', val); }).el);

          } else if (selType === 'alarm') {
            var catSel = document.createElement('select');
            ALARM_CATS.forEach(function (c) {
              var o = document.createElement('option'); o.value = c; o.textContent = ALARM_CAT_LABEL[c]; catSel.appendChild(o);
            });
            catSel.value = selNode.category || 'faultstop';
            catSel.addEventListener('change', function () { applyEdit('category', catSel.value); });
            editRow.appendChild(catSel);
          }

          // Node "condition" id-nya SAMA dengan nama bitnya, jadi bitnya gak bisa diubah di sini -
          // itu bakal ngubah id dan mutusin semua panah yang nyambung. Hapus lalu bikin ulang.
          if (selType !== 'motion') {
            var editInput = document.createElement('input');
            editInput.value = selNode.comment || '';
            editInput.placeholder = 'komen blok (opsional)';
            editInput.style.width = '220px';
            editInput.addEventListener('change', function () { applyEdit('comment', editInput.value); });
            editRow.appendChild(editInput);
          }
          vbox.appendChild(editRow);
        }
      }

      box.appendChild(vbox);
    });

    var addVBtn = document.createElement('button'); addVBtn.className = 'add-variant'; addVBtn.textContent = '+ Variant';
    addVBtn.addEventListener('click', function () { addVariant(stKey); renderMotionPanel(); });
    box.appendChild(addVBtn);

    var jsonKey = 'motion:' + stKey;
    var jsonBox = document.createElement('details'); jsonBox.className = 'json-io';
    if (jsonBoxOpen[jsonKey]) jsonBox.open = true;
    jsonBox.addEventListener('toggle', function () { jsonBoxOpen[jsonKey] = jsonBox.open; });
    var jsonLabel = document.createElement('summary');
    jsonLabel.textContent = 'Sequence JSON';
    var jsonTa = document.createElement('textarea');
    jsonTa.placeholder = '[{"condition":"","comment":"","nodes":[{"id":"n1","sol":"' + (names[0] || 'SOL_...') + '","after":[],"join":"AND"}]}]';
    var jsonMsg = document.createElement('div'); jsonMsg.className = 'json-msg';
    var jsonRow = buildJsonIORow(jsonTa, jsonMsg,
      function () { return variantsToJSON(stKey); },
      function (text) {
        var err = importSequenceJSON(stKey, text);
        if (err) return err;
        renderMotionPanel(); regenerate();
        return null;
      },
      'motion-' + stKey + '.json');
    jsonBox.appendChild(jsonLabel); jsonBox.appendChild(jsonTa); jsonBox.appendChild(jsonRow); jsonBox.appendChild(jsonMsg);
    box.appendChild(jsonBox);

    motionPanelEl.appendChild(box);
  });

  motionPanelEl.style.display = any ? 'block' : 'none';
}

function renderConditionPanel() {
  conditionPanelEl.innerHTML = '';
  if (!lastSplitMsg) { conditionPanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  if (!stations.length) { conditionPanelEl.style.display = 'none'; return; }

  stations.forEach(function (stKey) {
    ensureConditionStation(stKey);

    var box = document.createElement('div'); box.className = 'station-box';
    var title = document.createElement('div'); title.className = 'station-title'; title.textContent = stKey + (stationNames[stKey] ? ' - ' + stationNames[stKey] : '');
    box.appendChild(title);
    if (!conditionState[stKey].length) {
      var hint = document.createElement('div'); hint.className = 'hint';
      hint.textContent = 'Belum ada Condition custom - pakai 3 slot cadangan generik (LB300-LB302).';
      box.appendChild(hint);
    }

    conditionState[stKey].forEach(function (def, di) {
      var dbox = document.createElement('div'); dbox.className = 'variant-box';

      var head = document.createElement('div'); head.className = 'variant-head';
      var nameLbl = document.createElement('b'); nameLbl.textContent = 'Condition ' + (di + 1) + ' - Name:';
      var nameInput = document.createElement('input'); nameInput.placeholder = 'mis. P&P Take Out Lowering Auto Start Condition'; nameInput.value = def.name; nameInput.style.width = '260px';
      // renderMotionPanel() ikut dipanggil: dropdown Condition di panel Motion ngambil isinya dari
      // conditionState, jadi tiap nama/bit berubah daftarnya harus dibangun ulang biar gak basi.
      // Aman dari rebutan fokus - yang dirender ulang panel Motion, bukan panel Condition ini.
      nameInput.addEventListener('change', function () { setConditionDefName(stKey, di, nameInput.value); renderMotionPanel(); regenerate(); });
      var bitLbl = document.createElement('b'); bitLbl.textContent = 'Bit:'; bitLbl.style.marginLeft = '8px';
      var bitInput = document.createElement('input'); bitInput.placeholder = '(kosong = auto LB30' + di + ')'; bitInput.value = def.bit;
      bitInput.addEventListener('change', function () { setConditionDefBit(stKey, di, bitInput.value); renderMotionPanel(); regenerate(); });
      var rmD = document.createElement('button'); rmD.className = 'rm-variant'; rmD.textContent = 'Remove condition';
      rmD.addEventListener('click', function () { removeConditionDef(stKey, di); renderConditionPanel(); renderMotionPanel(); regenerate(); });
      head.appendChild(nameLbl); head.appendChild(nameInput); head.appendChild(bitLbl); head.appendChild(bitInput); head.appendChild(rmD);
      dbox.appendChild(head);

      def.groups.forEach(function (group, gi) {
        var gbox = document.createElement('div'); gbox.className = 'cond-group-box';
        if (gi > 0) { var orLbl = document.createElement('div'); orLbl.className = 'cond-or-label'; orLbl.textContent = 'OR'; gbox.appendChild(orLbl); }

        group.forEach(function (term, ti) {
          var trow = document.createElement('span'); trow.className = 'cond-term';
          var negBtn = document.createElement('button'); negBtn.className = 'cond-neg' + (term.neg ? ' active' : ''); negBtn.textContent = term.neg ? 'NOT' : 'AND';
          negBtn.title = 'klik buat toggle NOT';
          negBtn.addEventListener('click', function () { toggleTermNeg(stKey, di, gi, ti); renderConditionPanel(); regenerate(); });
          var termLbl = document.createElement('span'); termLbl.className = 'cond-term-bit'; termLbl.textContent = term.bit;
          var rmT = document.createElement('button'); rmT.className = 'cond-rm-term'; rmT.textContent = 'x';
          rmT.addEventListener('click', function () { removeTerm(stKey, di, gi, ti); renderConditionPanel(); regenerate(); });
          trow.appendChild(negBtn); trow.appendChild(termLbl); trow.appendChild(rmT);
          gbox.appendChild(trow);
        });

        var termInput = document.createElement('input'); termInput.placeholder = 'nama bit (mis. LB206)'; termInput.className = 'cond-term-input';
        var addTBtn = document.createElement('button'); addTBtn.className = 'avail-btn'; addTBtn.textContent = '+ term';
        addTBtn.addEventListener('click', function () {
          if (addTerm(stKey, di, gi, termInput.value)) { termInput.value = ''; renderConditionPanel(); regenerate(); }
        });
        gbox.appendChild(termInput); gbox.appendChild(addTBtn);

        if (def.groups.length > 1) {
          var rmG = document.createElement('button'); rmG.className = 'cond-rm-term'; rmG.textContent = 'remove group';
          rmG.addEventListener('click', function () { removeOrGroup(stKey, di, gi); renderConditionPanel(); regenerate(); });
          gbox.appendChild(rmG);
        }
        dbox.appendChild(gbox);
      });

      var addGBtn = document.createElement('button'); addGBtn.className = 'avail-btn'; addGBtn.textContent = '+ OR group';
      addGBtn.addEventListener('click', function () { addOrGroup(stKey, di); renderConditionPanel(); regenerate(); });
      dbox.appendChild(addGBtn);

      box.appendChild(dbox);
    });

    var addDBtn = document.createElement('button'); addDBtn.className = 'add-variant'; addDBtn.textContent = '+ Condition';
    addDBtn.addEventListener('click', function () { addConditionDef(stKey); renderConditionPanel(); });
    box.appendChild(addDBtn);

    var jsonKey = 'cond:' + stKey;
    var jsonBox = document.createElement('details'); jsonBox.className = 'json-io';
    if (jsonBoxOpen[jsonKey]) jsonBox.open = true;
    jsonBox.addEventListener('toggle', function () { jsonBoxOpen[jsonKey] = jsonBox.open; });
    var jsonLabel = document.createElement('summary');
    jsonLabel.textContent = 'Condition JSON';
    var jsonTa = document.createElement('textarea');
    jsonTa.placeholder = '[{"name":"","bit":"","groups":[[{"bit":"LB206","neg":false}]]}]';
    var jsonMsg = document.createElement('div'); jsonMsg.className = 'json-msg';
    var jsonRow = buildJsonIORow(jsonTa, jsonMsg,
      function () { return conditionDefsToJSON(stKey); },
      function (text) {
        var err = importConditionJSON(stKey, text);
        if (err) return err;
        renderConditionPanel(); renderMotionPanel(); regenerate();
        return null;
      },
      'condition-' + stKey + '.json');
    jsonBox.appendChild(jsonLabel); jsonBox.appendChild(jsonTa); jsonBox.appendChild(jsonRow); jsonBox.appendChild(jsonMsg);
    box.appendChild(jsonBox);

    conditionPanelEl.appendChild(box);
  });

  conditionPanelEl.style.display = 'block';
}

function renderStationNamesPanel() {
  stationNamesPanelEl.innerHTML = '';
  if (!lastSplitMsg) { stationNamesPanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  if (!stations.length) { stationNamesPanelEl.style.display = 'none'; return; }
  stations.forEach(function (stKey) {
    var lbl = document.createElement('label'); lbl.className = 'stname-lbl';
    var b = document.createElement('b'); b.textContent = stKey;
    var input = document.createElement('input'); input.className = 'stname-input';
    input.placeholder = 'nama (opsional, mis. Conveyor Feed)';
    input.value = stationNames[stKey] || '';
    input.addEventListener('change', function () {
      stationNames[stKey] = input.value.trim();
      renderMotionPanel(); renderConditionPanel(); regenerate();
    });
    lbl.appendChild(b); lbl.appendChild(input);
    stationNamesPanelEl.appendChild(lbl);
  });
  stationNamesPanelEl.style.display = 'flex';
}

// Status satu aktuator menurut generate terakhir, dipakai buat mewarnai bloknya di panel Confirm Mode.
//   missing = generator gak nemu sensor sama sekali (lsc_not_found) -> WAJIB disetel Open-loop/Manual
//   check   = ketemu tapi gak yakin (ambigu / skor rendah) -> jalan, tapi layak diverifikasi
// Dicocokin lewat warnList[].device, jadi kalau kalimat warning-nya diubah, penyorotan ini gak ikut
// rusak - itu inti dari kenapa warning distruktur.
var CM_MISSING = { lsc_not_found: 1 };
var CM_CHECK = { lsc_ambiguous: 1, lsc_low_confidence: 1, servo_feedback_ambiguous: 1 };
function ioFlagOf(deviceName) {
  var hit = null;
  lastWarnList.forEach(function (w) {
    if (w.device !== deviceName) return;
    if (CM_MISSING[w.code]) hit = { kind: 'missing', message: w.message };
    else if (CM_CHECK[w.code] && (!hit || hit.kind !== 'missing')) hit = { kind: 'check', message: w.message };
  });
  // Sudah disetel manual/open-loop = keluhannya sudah diurus, jangan disorot lagi
  if (hit && actuatorOverrides[deviceName]) return null;
  return hit;
}

function renderConfirmModePanel() {
  confirmModePanelEl.innerHTML = '';
  if (!lastSplitMsg) { confirmModePanelEl.style.display = 'none'; return; }
  var groups = lastSplitMsg.payload;
  var stations = sortStations(Object.keys(groups).filter(function (k) { return k !== 'MAIN' && groups[k].length; }));
  var any = false;
  stations.forEach(function (stKey) {
    var devs = (groups[stKey] || []).filter(function (d) { return d.io === 'OUT' && (d.jenis === 'CR' || d.jenis === 'SOL' || d.jenis === 'SRV_CMD'); });
    devs.forEach(function (d) {
      any = true;
      var ov = actuatorOverrides[d.name] || { mode: 'auto' };
      // Warna blok = status aktuator ini, dicocokin lewat warnList[].device (nama simbol), bukan
      // dari teks warning. Angka "3 aktuator belum ketemu sensornya" gak ada gunanya kalau yang mana
      // -nya harus dicari sendiri di daftar panjang.
      var flag = ioFlagOf(d.name);
      var row = document.createElement('div'); row.className = 'stname-lbl cm-row' + (flag ? ' cm-' + flag.kind : '');
      if (flag) row.title = flag.message;
      var head = document.createElement('div'); head.className = 'cm-head';
      var b = document.createElement('b'); b.textContent = stKey + ' / ' + d.name;
      head.appendChild(b);
      if (flag) {
        var badge = document.createElement('span');
        badge.className = 'cm-badge cm-badge-' + flag.kind;
        badge.textContent = flag.kind === 'missing' ? 'tanpa sensor' : 'perlu dicek';
        head.appendChild(badge);
      }
      row.appendChild(head);
      var sel = document.createElement('select');
      ['auto', 'openloop', 'manual'].forEach(function (m) {
        var opt = document.createElement('option'); opt.value = m;
        opt.textContent = m === 'auto' ? 'Auto (default)' : (m === 'openloop' ? 'Open-loop (no sensor)' : 'Manual (pick bit)');
        if (ov.mode === m) opt.selected = true;
        sel.appendChild(opt);
      });
      var manualBox = document.createElement('div'); manualBox.className = 'cm-manual';
      var lscAInput = document.createElement('input'); lscAInput.placeholder = 'bit konfirmasi'; lscAInput.value = ov.lscA || '';
      var lscBInput = document.createElement('input'); lscBInput.placeholder = 'bit B (opsional, pair)'; lscBInput.value = ov.lscB || '';
      manualBox.appendChild(lscAInput); manualBox.appendChild(lscBInput);
      manualBox.style.display = ov.mode === 'manual' ? 'flex' : 'none';
      function commit() {
        var mode = sel.value;
        if (mode === 'auto') { delete actuatorOverrides[d.name]; }
        else if (mode === 'openloop') { actuatorOverrides[d.name] = { mode: 'openloop' }; }
        else { actuatorOverrides[d.name] = { mode: 'manual', lscA: lscAInput.value.trim(), lscB: lscBInput.value.trim() }; }
        regenerate();
      }
      sel.addEventListener('change', function () { manualBox.style.display = sel.value === 'manual' ? 'flex' : 'none'; commit(); });
      lscAInput.addEventListener('change', commit);
      lscBInput.addEventListener('change', commit);
      row.appendChild(sel); row.appendChild(manualBox);
      confirmModePanelEl.appendChild(row);
    });
  });
  confirmModePanelEl.style.display = any ? 'flex' : 'none';
  updateConfirmModeSummary(stations.length);
}

// Section Confirm Mode itu OPSIONAL dan panjang - kalau selalu kebuka dia dorong Motion Sequence jauh
// ke bawah padahal seringnya gak disentuh sama sekali. Jadi dia dilipat, TAPI ringkasannya tetap
// kebaca di summary, dan otomatis kebuka kalau ada yang beneran perlu diurus (aktuator tanpa sensor
// yang belum disetel). Sekali sudah disetel, dia gak maksa buka lagi - itu arti "collapse setelah
// selesai confirm": yang nutup bukan timer, tapi hilangnya alasan buat kebuka.
function updateConfirmModeSummary(stationCount) {
  var box = document.getElementById('confirmModeBox');
  var sub = document.getElementById('confirmModeSummary');
  if (!box || !sub) return;
  var total = 0, over = 0;
  if (lastSplitMsg) {
    var g = lastSplitMsg.payload;
    Object.keys(g).forEach(function (k) {
      if (k === 'MAIN') return;
      (g[k] || []).forEach(function (d) {
        if (d.io === 'OUT' && (d.jenis === 'CR' || d.jenis === 'SOL' || d.jenis === 'SRV_CMD')) {
          total++;
          if (actuatorOverrides[d.name]) over++;
        }
      });
    });
  }
  // "Perlu perhatian" = generator gak nemu limit switch buat aktuator yang masih Auto. Dicek lewat
  // KODE warning, bukan nyocokin kalimatnya - kalau teksnya diubah, pencocokan teks bakal diam-diam
  // berhenti jalan dan section ini gak pernah kebuka lagi padahal ada yang perlu diurus.
  var needs = lastWarnList.filter(function (w) { return w.code === 'lsc_not_found'; }).length;
  if (!total) { sub.textContent = 'run Generate first to see the actuator list'; sub.className = 'fold-sub'; return; }
  // Sebutin NAMA aktuatornya, bukan cuma jumlahnya - angka doang bikin user harus nyisir daftar
  // sendiri. Bloknya juga diwarnai merah di panel, jadi ketemunya cepat.
  var missing = lastWarnList.filter(function (w) {
    return w.code === 'lsc_not_found' && w.device && !actuatorOverrides[w.device];
  }).map(function (w) { return w.device; });
  missing = missing.filter(function (d, i) { return missing.indexOf(d) === i; });
  var check = lastWarnList.filter(function (w) {
    return CM_CHECK[w.code] && w.device && !actuatorOverrides[w.device];
  }).map(function (w) { return w.device; });
  check = check.filter(function (d, i) { return check.indexOf(d) === i && missing.indexOf(d) < 0; });

  if (missing.length) {
    var shown = missing.slice(0, 3).join(', ') + (missing.length > 3 ? ', +' + (missing.length - 3) + ' lagi' : '');
    sub.textContent = missing.length + ' tanpa sensor (blok merah): ' + shown + ' - setel Open-loop atau Manual';
    sub.className = 'fold-sub attn';
    if (!confirmModeTouched) box.open = true;
  } else if (check.length) {
    sub.textContent = check.length + ' cocokan sensor perlu dicek (blok kuning): ' + check.slice(0, 3).join(', ');
    sub.className = 'fold-sub attn';
  } else {
    sub.textContent = over + ' dari ' + total + ' aktuator dioverride, sisanya Auto - semua sensor ketemu';
    sub.className = 'fold-sub';
  }
}

// ===== Project JSON: SEMUA state (IO list + motionSequences + conditionDefs + nama station + timer
// default) jadi satu blob - format field motionSequences/conditionDefs SAMA PERSIS bentuk yang
// dipakai per-station box, cuma dibungkus per stKey biar satu file nyimpen semuanya sekaligus. =====
function exportProjectJSON() {
  var motionSequences = {};
  Object.keys(motionState).forEach(function (st) {
    var arr = JSON.parse(variantsToJSON(st));
    if (arr.some(function (v) { return v.nodes.length; })) motionSequences[st] = arr;
  });
  var conditionDefs = {};
  Object.keys(conditionState).forEach(function (st) {
    var arr = JSON.parse(conditionDefsToJSON(st));
    if (arr.some(function (d) { return d.groups.length; })) conditionDefs[st] = arr;
  });
  return JSON.stringify({
    io: document.getElementById('ioText').value,
    stationNames: stationNames,
    timerDefaults: { phpx: timerPhpxEl ? timerPhpxEl.value : '', motion: timerMotionEl ? timerMotionEl.value : '' },
    arraySizes: { al: alSizeEl ? alSizeEl.value : '', mf: mfSizeEl ? mfSizeEl.value : '',
                  stationBlock: stationBlockEl ? stationBlockEl.value : '' },
    hmiMap: hmiSettings(),
    advancedInstructions: advInstrEl ? advInstrEl.checked : false,
    actuatorOverrides: actuatorOverrides,
    motionSequences: motionSequences,
    conditionDefs: conditionDefs
  }, null, 2);
}

function importProjectJSON(jsonText) {
  var parsed;
  try { parsed = JSON.parse(jsonText); }
  catch (e) { return 'JSON gak valid: ' + e.message; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'JSON harus object: {"io":"","stationNames":{},"timerDefaults":{},"motionSequences":{},"conditionDefs":{}}';
  }
  if (typeof parsed.io !== 'string' || !parsed.io.trim()) return 'Field "io" (IO list, string) wajib ada dan gak boleh kosong';

  setIoText(parsed.io);   // WAJIB lewat setIoText - tabel IO harus ikut kebaca ulang, bukan cuma textarea
  runFullPipeline(); // parse+split+generate dulu biar station-nya kekenal sebelum import motion/condition per-station
  if (errEl.textContent) return 'Generate IO list dari project JSON gagal: ' + errEl.textContent;

  stationNames = {};
  Object.keys(parsed.stationNames || {}).forEach(function (k) { stationNames[k] = String(parsed.stationNames[k] || '').trim(); });
  if (timerPhpxEl) timerPhpxEl.value = (parsed.timerDefaults && parsed.timerDefaults.phpx) || '';
  if (timerMotionEl) timerMotionEl.value = (parsed.timerDefaults && parsed.timerDefaults.motion) || '';
  if (alSizeEl) alSizeEl.value = (parsed.arraySizes && parsed.arraySizes.al) || '';
  if (mfSizeEl) mfSizeEl.value = (parsed.arraySizes && parsed.arraySizes.mf) || '';
  if (stationBlockEl) stationBlockEl.value = (parsed.arraySizes && parsed.arraySizes.stationBlock) || '';
  if (advInstrEl) advInstrEl.checked = !!parsed.advancedInstructions;
  var hm = parsed.hmiMap || {};
  if (hmiModeEl) hmiModeEl.value = hm.mode === 'generate' ? 'generate' : 'manual';
  if (hmiBtnAreaEl) hmiBtnAreaEl.value = hm.btnArea || 'W';
  if (hmiAlAreaEl) hmiAlAreaEl.value = hm.alArea || 'H';
  if (hmiPbBaseEl) hmiPbBaseEl.value = hm.pbBase || '';
  if (hmiRdOffsetEl) hmiRdOffsetEl.value = hm.rdOffset || '';
  if (hmiAlBaseEl) hmiAlBaseEl.value = hm.alBase || '';
  if (hmiMfBaseEl) hmiMfBaseEl.value = hm.mfBase || '';
  if (hmiPerPageEl) hmiPerPageEl.value = hm.perPage || '';
  if (hmiStrideEl) hmiStrideEl.value = hm.stride || '';
  if (hmiNumAreaEl) hmiNumAreaEl.value = hm.numArea || 'D';
  if (hmiNumBaseEl) hmiNumBaseEl.value = hm.numBase || '';
  if (hmiSpareModeEl) hmiSpareModeEl.value = hm.spareMode === 'count' ? 'count' : 'percent';
  if (hmiSpareEl) hmiSpareEl.value = hm.spare || '';
  if (hmiSpareCountEl) hmiSpareCountEl.value = hm.spareCount || '';
  spareModeSync();
  // Project lama gak punya blok hmiMap sama sekali - default-nya AKTIF, bukan mati, biar import
  // project lama tetap keluar kolom AT tanpa harus dicentang manual.
  if (hmiEnabledEl) hmiEnabledEl.checked = hm.enabled === undefined ? true : !!hm.enabled;
  actuatorOverrides = {};
  Object.keys(parsed.actuatorOverrides || {}).forEach(function (k) { actuatorOverrides[k] = parsed.actuatorOverrides[k]; });

  var errs = [];
  Object.keys(parsed.motionSequences || {}).forEach(function (st) {
    var err = importSequenceJSON(st, JSON.stringify(parsed.motionSequences[st]));
    if (err) errs.push('motionSequences.' + st + ': ' + err);
  });
  Object.keys(parsed.conditionDefs || {}).forEach(function (st) {
    var err = importConditionJSON(st, JSON.stringify(parsed.conditionDefs[st]));
    if (err) errs.push('conditionDefs.' + st + ': ' + err);
  });

  renderMotionPanel(); renderConditionPanel(); renderStationNamesPanel(); renderConfirmModePanel();
  regenerate();
  return errs.length ? errs.join('\\n') : null;
}

function runFullPipeline() {
  errEl.textContent = ''; resEl.innerHTML = ''; statsEl.textContent = ''; warnEl.textContent = ''; warnBoxEl.style.display = 'none';
  flowStore = {};
  lastSplitMsg = null;
  motionState = {};
  conditionState = {};
  motionCounters = {};
  svgRefs = {};
  dragState = null;
  selected = null;
  renderMotionPanel();
  renderConditionPanel();
  renderStationNamesPanel();
  renderConfirmModePanel();

  try {
    var msg = { payload: document.getElementById('ioText').value };
    msg = runNode(PARSE_JS, msg, flowStore);
    msg = runNode(GENNAME_JS, msg, flowStore);
    var v = runNode(VALIDATE_JS, msg, flowStore);
    if (v[1]) { errEl.textContent = v[1].payload; return; }
    msg = runNode(SPLIT_JS, v[0], flowStore);
    lastSplitMsg = msg;
    rebuildDevKomen();   // label kanvas ambil komen dari sini, harus segar sebelum panel dirender
  } catch (e) {
    errEl.textContent = 'Error: ' + e.message;
    return;
  }

  renderMotionPanel();
  renderConditionPanel();
  renderStationNamesPanel();
  renderConfirmModePanel();
  regenerate();
}

errEl = document.getElementById('err');
resEl = document.getElementById('results');
navFileCountEl = document.getElementById('navFileCount');
statsEl = document.getElementById('stats');
warnEl = document.getElementById('warn');
warnBoxEl = document.getElementById('warnBox');
motionPanelEl = document.getElementById('motionPanel');
conditionPanelEl = document.getElementById('conditionPanel');
stationNamesPanelEl = document.getElementById('stationNamesPanel');
confirmModePanelEl = document.getElementById('confirmModePanel');
(function () {
  var cmBox = document.getElementById('confirmModeBox');
  if (cmBox) cmBox.addEventListener('toggle', function () { confirmModeTouched = true; });
})();
alSizeEl = document.getElementById('alSize');
mfSizeEl = document.getElementById('mfSize');
stationBlockEl = document.getElementById('stationBlock');
arraySizeHintEl = document.getElementById('arraySizeHint');
advInstrEl = document.getElementById('advInstr');
advInstrEl.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
hmiModeEl = document.getElementById('hmiMode');
hmiBtnAreaEl = document.getElementById('hmiBtnArea');
hmiAlAreaEl = document.getElementById('hmiAlArea');
hmiPbBaseEl = document.getElementById('hmiPbBase');
hmiRdOffsetEl = document.getElementById('hmiRdOffset');
hmiAlBaseEl = document.getElementById('hmiAlBase');
hmiMfBaseEl = document.getElementById('hmiMfBase');
hmiPerPageEl = document.getElementById('hmiPerPage');
hmiStrideEl = document.getElementById('hmiStride');
hmiEnabledEl = document.getElementById('hmiEnabled');
hmiNumAreaEl = document.getElementById('hmiNumArea');
hmiNumBaseEl = document.getElementById('hmiNumBase');
hmiSpareEl = document.getElementById('hmiSpare');
hmiSpareModeEl = document.getElementById('hmiSpareMode');
hmiSpareCountEl = document.getElementById('hmiSpareCount');
if (hmiSpareModeEl) hmiSpareModeEl.addEventListener('change', spareModeSync);
spareModeSync();
hmiMapPanelEl = document.getElementById('hmiMapPanel');
hmiSummaryEl = document.getElementById('hmiSummary');
[alSizeEl, mfSizeEl, stationBlockEl, hmiModeEl, hmiBtnAreaEl, hmiAlAreaEl, hmiPbBaseEl, hmiRdOffsetEl, hmiAlBaseEl, hmiMfBaseEl,
 hmiPerPageEl, hmiStrideEl, hmiEnabledEl, hmiNumAreaEl, hmiNumBaseEl, hmiSpareEl,
 hmiSpareModeEl, hmiSpareCountEl].forEach(function (el) {
  el.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
});
timerPhpxEl = document.getElementById('timerPhpx');
timerMotionEl = document.getElementById('timerMotion');
timerPhpxEl.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
timerMotionEl.addEventListener('change', function () { if (lastSplitMsg) regenerate(); });
document.getElementById('ioTabGrid').addEventListener('click', function () { setIoView('grid'); });
document.getElementById('ioTabText').addEventListener('click', function () { setIoView('text'); });
document.getElementById('ioAddRow').addEventListener('click', function () {
  ioRows.push({ address: '', jenis: '', io: '', komen: '' });
  ioSyncToText(); renderIoGrid();
});
document.getElementById('ioPaste').addEventListener('click', function () {
  readTextFromClipboard().then(function (t) {
    var rows = ioParseText(t);
    if (!rows.length) { window.alert('Clipboard has no TSV rows (Address / Type / IN-OUT / Comment)'); return; }
    // Ditambahin, bukan nimpa - biar tempelan kedua gak diam-diam ngapus yang pertama
    ioRows = ioRows.concat(rows);
    ioSyncToText(); renderIoGrid();
  }).catch(function (e) {
    window.alert('Gagal baca clipboard (' + e.message + '). Pakai mode "Teks (TSV)" lalu tempel manual.');
  });
});
// Textarea diedit langsung -> tabel ikut, biar dua mode gak pernah beda isi
document.getElementById('ioText').addEventListener('change', function () {
  if (ioView === 'text') { ioLoadFromText(); ioUpdateCount(); }
});
setIoView('grid');
document.getElementById('genBtn').addEventListener('click', function () {
  // Mode tabel: pastiin textarea sudah sinkron sebelum pipeline baca isinya
  if (ioView === 'grid') ioSyncToText();
  runFullPipeline();
});
(function () {
  var ta = document.getElementById('projectJsonTa');
  var msg = document.getElementById('projectJsonMsg');
  var row = buildJsonIORow(ta, msg, exportProjectJSON, function (text) {
    return importProjectJSON(text);
  }, 'project-susmax.json');
  document.getElementById('projectJsonRow').appendChild(row);
})();
// --- Navigasi samping ---
// Klik = gulir halus ke bagiannya; kalau bagian itu <details> yang tertutup, dibuka dulu -
// menggulir ke fold yang tertutup cuma memindahkan layar ke garis kosong.
// Sorotan mengikuti bagian TERAKHIR yang sudah lewat garis 130px dari atas layar. Dipakai
// ambang, bukan "yang paling dekat tengah", supaya bagian pendek seperti Settings tidak
// terlewat begitu saja waktu digulir cepat.
(function () {
  var nav = document.getElementById('sideNav');
  if (!nav) return;
  var links = Array.prototype.slice.call(nav.getElementsByTagName('a'));
  var targets = links.map(function (a) {
    return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (t) { return t.el; });

  targets.forEach(function (t) {
    t.a.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (t.el.tagName === 'DETAILS' && !t.el.open) t.el.open = true;
      t.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var pending = false;
  function mark() {
    pending = false;
    var cur = targets[0];
    targets.forEach(function (t) {
      if (t.el.getBoundingClientRect().top <= 130) cur = t;
    });
    targets.forEach(function (t) { t.a.className = (t === cur) ? 'on' : ''; });
  }
  // Handler scroll jalan puluhan kali per detik; membaca getBoundingClientRect tiap kali
  // memaksa layout dan bikin halaman tersendat waktu kanvas motion sedang besar.
  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(mark);
  });
  mark();
})();

document.addEventListener('mousemove', onDocMouseMove);
document.addEventListener('mouseup', onDocMouseUp);
document.addEventListener('keydown', onDocKeyDown);
</script>
</body>
</html>
'''

out = (HTML
       .replace('__PARSE_JS__', json.dumps(PARSE))
       .replace('__GENNAME_JS__', json.dumps(GENNAME))
       .replace('__VALIDATE_JS__', json.dumps(VALIDATE))
       .replace('__SPLIT_JS__', json.dumps(SPLIT))
       .replace('__GEN_ALL_JS__', json.dumps(GEN_ALL)))

# HTML di atas itu string Python BIASA, bukan raw. Jadi escape yang dimaksudkan buat JS atau CSS
# (\n, \t, \25B8) diterjemahkan Python duluan dan hasilnya rusak diam-diam: \n jadi baris baru
# sungguhan yang mutus literal JS, \25 jadi karakter kontrol oktal yang bikin CSS-nya salah. Sudah
# kejadian tiga kali, jadi sekarang dijaga di sini: escape buat JS/CSS WAJIB ditulis dobel (\\n),
# dan build gagal keras kalau ada karakter kontrol nyasar di output.
bad = [(i, ord(c)) for i, c in enumerate(out) if ord(c) < 32 and c not in '\n\r\t']
if bad:
    ctx = out[max(0, bad[0][0] - 70):bad[0][0] + 30].replace('\n', ' ')
    raise SystemExit(
        "BUILD GAGAL: %d karakter kontrol di output (escape ketelan Python - tulis dobel, mis. \\\\n).\n"
        "  offset %d, kode %d\n  konteks: ...%s..." % (len(bad), bad[0][0], bad[0][1], ctx))

# Cek karakter kontrol di atas TIDAK menangkap kasus \n dan \r yang ketelan, karena baris baru itu
# karakter yang sah - yang rusak cuma STRUKTUR JS-nya (literal kebuka, komentar kepotong dua). Jadi
# outputnya dicek sintaks beneran pakai `node --check`. Kalau node gak ada, dilewat dengan pesan -
# build tetap jalan, tapi jaringnya berkurang.
import re as _re, subprocess as _sp, tempfile as _tf, shutil as _sh
_scripts = _re.findall(r'<script>(.*?)</script>', out, _re.S)
if _sh.which('node'):
    for _i, _js in enumerate(_scripts):
        _fh = _tf.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8')
        _fh.write(_js); _fh.close()
        _r = _sp.run(['node', '--check', _fh.name], capture_output=True, text=True)
        os.unlink(_fh.name)
        if _r.returncode != 0:
            raise SystemExit("BUILD GAGAL: blok <script> #%d sintaksnya rusak.\n%s" % (_i + 1, _r.stderr.strip()))
else:
    print("catatan: node tidak ada di PATH, cek sintaks JS dilewati")

outpath = os.path.join(_D, 'index.html')
open(outpath, 'w', encoding='utf-8').write(out)
print("WROTE", outpath, len(out), "bytes")
