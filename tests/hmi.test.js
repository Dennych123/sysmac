// Peta alamat HMI (AT specification) - satu-satunya penyambung NX <-> NB, karena driver FINS di
// project NB cuma bisa alamat memori, bukan tag. Yang diuji di sini bukan sekadar "ada isinya",
// tapi sifat-sifat yang kalau rusak bikin tombol nyambung ke aktuator yang salah tanpa keluhan:
//   - tombol dan lampu di SLOT yang sama harus di BIT yang sama, cuma beda word
//   - satu bit cuma boleh punya satu pemilik
//   - offset lampu tetap +23 (dibaca dari project HMI produksi)
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..').replace(/\\/g,'/');
const core=require(root+'/scripts/core.js');
const STEP={s_parse:core.STEPS.parse,s_name:core.STEPS.genname,s_val:core.STEPS.validate,s_split:core.STEPS.split,s_all:core.STEPS.gen_all};
const run=(id,msg,flow)=>core.runStep(STEP[id],msg,flow,{warn:()=>{}});
const IO=fs.readFileSync(root+'/scripts/test.js','utf8').match(/const IO=`([\s\S]*?)`;/)[1].replace(/\\t/g,'\t');

function gen(seed){
  const ctx=Object.assign({},seed||{});
  const flow={get:k=>ctx[k], set:(k,v)=>ctx[k]=v};
  let m=run('s_parse',{payload:IO},flow); m=run('s_name',m,flow);
  const v=run('s_val',m,flow); if(v[1]) throw new Error(v[1].payload);
  return run('s_all',run('s_split',v[0],flow),flow).payload;
}
let fail=0;
const chk=(l,c,x)=>{ if(!c)fail++; console.log((c?'  OK  ':'>>BAD ')+l+(x?'   '+x:'')); };
const atOf=(tsv,n)=>((tsv.split('\n').find(l=>l.startsWith(n+'\t'))||'').split('\t')[3]||'');
const parseAt=(s)=>{ const m=/^%(W|H|D|CIO)(\d+)\.(\d+)$/.exec(s||''); return m?{a:m[1],w:+m[2],b:+m[3]}:null; };

let p=gen(null);
let tsv=p.files.find(f=>f.name==='GlobalVariables.tsv').xml;
const map=p.hmiMap;

chk('peta HMI ikut di payload', !!(map && map.rows && map.rows.length>0), map?map.rows.length+' baris':'kosong');
chk('default: 4 aktuator per screen, lampu +23',
    map.cfg.perPage===4 && map.cfg.rdOfs===23 && map.cfg.pbBase===460,
    JSON.stringify({perPage:map.cfg.perPage,rdOfs:map.cfg.rdOfs,pbBase:map.cfg.pbBase}));

// Tombol dan lampu satu slot: bit HARUS sama, word beda persis rdOfs. Ini yang bikin satu switch
// NB (Read=W48x, Write=W46x di bit yang sama) nunjuk device yang sama di dua arah.
let slotOk=true, slotBad='', paired=0;
tsv.split('\n').forEach(l=>{
  const c=l.split('\t'); const n=c[0]||'';
  if(!/^PB4\d+_\d+[MRS]$/.test(n)) return;
  const plAt=atOf(tsv,'PL'+n.slice(2));
  const pb=parseAt(c[3]), pl=parseAt(plAt);
  // Aktuator yang kehabisan slot (mode manual) memang gak dapat alamat - itu keputusan, bukan
  // cacat. Yang gak boleh: SATU sisi dapat alamat dan sisi lain enggak, karena berarti tombol
  // dan lampu di slot yang sama ambil keputusan yang beda.
  if(!pb && !pl) return;
  if(!pb || !pl){ slotOk=false; slotBad=slotBad||(n+' cuma sebelah dapat alamat: PB="'+c[3]+'" PL="'+plAt+'"'); return; }
  paired++;
  if(pb.b!==pl.b || pl.w-pb.w!==map.cfg.rdOfs){ slotOk=false; slotBad=slotBad||(n+' '+c[3]+' vs '+plAt); }
});
chk('tombol dan lampu sejajar: bit sama, word +offset', slotOk && paired>0, slotBad||(paired+' pasang'));

// Satu bit satu pemilik. Ini persis cacat yang ada di project HMI produksi (tiga screen nulis
// W465 yang sama), jadi wajib ada tes yang jaga generator gak mengulanginya.
const own={}; let dup='';
tsv.split('\n').slice(1).forEach(l=>{
  const c=l.split('\t'); if(!c[3]||/\.\./.test(c[3])) return;
  if(own[c[3]] && !dup) dup=c[3]+' dipakai '+own[c[3]]+' dan '+c[0];
  own[c[3]]=c[0];
});
chk('gak ada dua simbol di satu alamat', !dup, dup);

// AL/MF harus dapat AT blok, kalau enggak Alarm Display NB gak bisa baca apa-apa
// AL/MF di area H, bukan W: bit retentif, alarm gak boleh hilang pas power cycle
chk('AL dan MF dapat AT blok di area H', atOf(tsv,'AL')==='%H300.00' && atOf(tsv,'MF')==='%H320.00',
    atOf(tsv,'AL')+' | '+atOf(tsv,'MF'));
// Lampu status MAIN pindah ke W480: W481/W482/W483 dipakai array lampu kondisi PL21/PL031/PL032
// (peta mesin: 0021 di W481, 0031 di W482), dan blok lampu station mulai W484.
chk('lampu status MAIN dapat AT di W480', /^%W480\.0\d$/.test(atOf(tsv,'PL_HMI_AUTO_RUN')), atOf(tsv,'PL_HMI_AUTO_RUN'));
chk('array lampu kondisi dapat AT berurutan',
    atOf(tsv,'PL21')==='%W481.00' && atOf(tsv,'PL031')==='%W482.00' && atOf(tsv,'PL032')==='%W483.00',
    [atOf(tsv,'PL21'),atOf(tsv,'PL031'),atOf(tsv,'PL032')].join(' '));
chk('tombol screen 004 dapat AT di base word',
    atOf(tsv,'PB004_01M')==='%W460.00' && atOf(tsv,'PB004_02M')==='%W460.02', atOf(tsv,'PB004_01M'));

// ST1 punya 9 aktuator = 18 bit, gak muat satu word. Apa yang terjadi HARUS beda per mode, dan
// beda itu inti fiturnya: mode manual gak boleh menggeser alamat screen yang sudah ada.
chk('default mode manual', map.cfg.mode==='manual', map.cfg.mode);
chk('mode manual: stride TIDAK digeser, overflow dilaporin per aktuator',
    map.cfg.stride===1 && /hmi_stride_fixed/.test(JSON.stringify(p.warnList))
    && /hmi_slot_overflow/.test(JSON.stringify(p.warnList)),
    'stride='+map.cfg.stride);
// Alamat station di mode manual harus tetap sama persis dengan peta mesin: ST1=W461, ST2=W462
chk('mode manual: alamat cocok peta mesin (ST1 W461, ST2 W462)',
    atOf(tsv,'PB411_1M')==='%W461.00' && atOf(tsv,'PB421_1M')==='%W462.00',
    atOf(tsv,'PB411_1M')+' | '+atOf(tsv,'PB421_1M'));

let pg=gen({hmiMap:{mode:'generate'}});
let tsvg=pg.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('mode generate: stride dinaikin seragam buat SEMUA station',
    pg.hmiMap.cfg.stride===2 && /hmi_stride_raised/.test(JSON.stringify(pg.warnList)),
    'stride='+pg.hmiMap.cfg.stride);
chk('mode generate: gak ada aktuator yang kehabisan slot',
    !/hmi_slot_overflow/.test(JSON.stringify(pg.warnList)) && atOf(tsvg,'PB413_1M')==='%W463.00',
    atOf(tsvg,'PB413_1M'));

// Base bisa disetel - ini yang dipakai kalau peta mesin lain beda
let p2=gen({hmiMap:{pbBase:100, rdOffset:10, alBase:200, mfBase:250, perPage:2, stride:1}});
let tsv2=p2.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('base alamat bisa disetel', atOf(tsv2,'AL')==='%H200.00' && atOf(tsv2,'PB004_01M')==='%W100.00',
    atOf(tsv2,'AL')+' | '+atOf(tsv2,'PB004_01M'));
chk('perPage nyetir nomor screen di nama simbol',
    /^PB41\d_[12]M$/.test((tsv2.split('\n').map(l=>l.split('\t')[0]).find(n=>/^PB41/.test(n))||'')),
    (tsv2.split('\n').map(l=>l.split('\t')[0]).filter(n=>/^PB41/.test(n))||[]).slice(0,4).join(' '));

let p5=gen({hmiMap:{btnArea:'CIO', alArea:'D', mfArea:'D'}});
let tsv5=p5.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('area bisa diubah per blok',
    /^%CIO\d+\.\d\d$/.test(atOf(tsv5,'PB004_01M')) && atOf(tsv5,'AL')==='%D300.00' && atOf(tsv5,'MF')==='%D320.00',
    atOf(tsv5,'PB004_01M')+' | '+atOf(tsv5,'AL'));
let p6=gen({hmiMap:{alArea:'X'}});
chk('area ngawur ditolak + warning',
    p6.hmiMap.cfg.alArea==='H' && /hmi_cfg_range/.test(JSON.stringify(p6.warnList)), p6.hmiMap.cfg.alArea);

// Setelan ngawur jatuh ke default + warning, bukan bikin alamat sampah
let p3=gen({hmiMap:{pbBase:9999}});
chk('base di luar jangkauan jatuh ke default + warning',
    p3.hmiMap.cfg.pbBase===460 && /hmi_cfg_range/.test(JSON.stringify(p3.warnList)),
    'pbBase='+p3.hmiMap.cfg.pbBase);

// Bisa dimatikan total - project yang gak pakai HMI gak boleh kepaksa punya kolom AT
let p4=gen({hmiMap:{enabled:false}});
let tsv4=p4.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('peta bisa dimatikan', atOf(tsv4,'PB004_01M')==='' && p4.hmiMap.rows.length===0,
    'rows='+p4.hmiMap.rows.length);

// Tanda "%" itu yang membedakan AT diterima Sysmac atau baris jadi merah. Dibuktikan di Sysmac
// Studio: "W485.01" ditolak, "%W485.01" diterima. Tes ini yang jaga tanda itu gak hilang lagi.
const atCells=tsv.split('\n').slice(1).map(l=>l.split('\t')[3]).filter(Boolean);
chk('semua AT diawali %', atCells.length>0 && atCells.every(v=>v.charAt(0)==='%'),
    atCells.length+' AT, contoh '+atCells.slice(0,2).join(' '));

// Baris array-level TANPA komen: komen generik "Alarm bit table" nutupin kolom Comment dan bikin
// orang mengira arraynya belum dikomen per elemen.
const cmtOf=(t,n)=>((t.split('\n').find(l=>l.startsWith(n+'\t'))||'').split('\t')[7]||'');
chk('AL/MF array-level tanpa komen', cmtOf(tsv,'AL')==='' && cmtOf(tsv,'MF')==='',
    '['+cmtOf(tsv,'AL')+'] ['+cmtOf(tsv,'MF')+']');
chk('AL/MF array-level tetap dapat AT', atOf(tsv,'AL')==='%H300.00', atOf(tsv,'AL'));

// File terpisah buat paste ke tabel yang arraynya sudah di-expand
const ac=p.files.find(f=>f.name==='ArrayComments.tsv');
chk('ArrayComments.tsv ada', !!ac);
if(ac){
  const lines=ac.xml.split('\n');
  const names=lines.slice(1).map(l=>l.split('\t')[0]);
  chk('isinya HANYA elemen array, gak ada variabel skalar',
      names.length>0 && names.every(n=>/^(AL|MF)\[\d+\]$/.test(n)), names.length+' baris');
  chk('urutannya AL 1..n lalu MF 1..n (urutan expand di Sysmac)',
      names[0]==='AL[1]' && names[p.arrayInfo.alSize-1]==='AL['+p.arrayInfo.alSize+']'
      && names[p.arrayInfo.alSize]==='MF[1]',
      names[0]+' .. '+names[p.arrayInfo.alSize-1]+' | '+names[p.arrayInfo.alSize]);
  chk('tiap baris punya komen', lines.slice(1).every(l=>(l.split('\t')[7]||'').length>0));
}
chk('arrayRows ikut di payload buat panel UI',
    Array.isArray(p.arrayRows) && p.arrayRows.length===p.arrayInfo.alSize+p.arrayInfo.mfSize,
    p.arrayRows?p.arrayRows.length+' baris':'kosong');


// Section Memory wajib ada di SEMUA program, bukan cuma station yang kebetulan punya blok memory
// di flowchart-nya. Tempat baku itu gunanya: kalau tidak ada, tiap orang menaruh bit memory di
// section lain dan tiap program jadi beda tempat. Urutannya mengikuti program produksi:
// antara HMI_Output dan Device_Output.
const secList=(x)=>(x.match(/name="([A-Za-z_]+)" evaluationOrder="\d+"/g)||[])
  .map(m=>/name="([A-Za-z_]+)"/.exec(m)[1]);
p.files.filter(f=>/^Prg\d+_/.test(f.name)).forEach(f=>{
  const secs=secList(f.xml);
  const i=secs.indexOf('Memory');
  chk(f.name+': punya section Memory', i>=0, secs.join(' '));
  // Posisi baku itu cuma berlaku buat program yang PUNYA dua section itu. Prg003_HMI tidak
  // punya Device_Output sama sekali - dia bukan program mesin, jadi Memory di akhir.
  if(i>=0 && secs.indexOf('Device_Output')>=0)
    chk(f.name+': Memory antara HMI_Output dan Device_Output',
        secs[i-1]==='HMI_Output' && secs[i+1]==='Device_Output',
        secs[i-1]+' | Memory | '+secs[i+1]);
  chk(f.name+': evaluationOrder section urut 1..n',
      secs.every((n,k)=>new RegExp('name="'+n+'" evaluationOrder="'+(k+1)+'"').test(f.xml)), secs.length+' section');
});


// Prg003_HMI: program antarmuka operator. Yang diuji sifat strukturalnya - kalau array kondisi
// tidak ada elemennya atau rangkumannya tidak menyentuh semua elemen, screen 0021/0031 nyala
// padahal syaratnya belum tentu terpenuhi, dan itu tidak kelihatan dari layar.
const hmiPrg=p.files.find(f=>f.name==='Prg003_HMI.xml');
chk('Prg003_HMI digenerate', !!hmiPrg);
if(hmiPrg){
  const hx=hmiPrg.xml;
  chk('section: TP_Control, Counters, Timers, Setup, Memory',
      secList(hx).join(' ')==='TP_Control Counters Timers Setup Memory', secList(hx).join(' '));
  ['PL21','PL031','PL032'].forEach(function(a){
    // tiap elemen 0..15 harus punya rung, kalau bolong bit itu tidak pernah di-drive
    const miss=[];
    for(let i=0;i<16;i++) if(hx.indexOf('operand="'+a+'['+i+']"')<0) miss.push(i);
    chk(a+': 16 elemen semuanya kepakai', !miss.length, 'bolong: '+miss.join(','));
    chk(a+': array dideklarasi 0-based', /ARRAY\[0\.\.15\] OF BOOL/.test(
        (tsv.split('\n').find(l=>l.startsWith(a+'\t'))||'')));
  });
  chk('rangkuman kondisi jadi PL_TP_MSTR_COND dan PL_TP_AUTO_COND',
      /operand="PL_TP_MSTR_COND"/.test(hx) && /operand="PL_TP_AUTO_COND"/.test(hx));
  chk('lampu PL_TP_* dapat AT di word lampu MAIN',
      /^%W480\.\d\d$/.test(atOf(tsv,'PL_TP_MSTR_RDY')), atOf(tsv,'PL_TP_MSTR_RDY'));
  // Counters sengaja belum digenerate - harus JELAS placeholder, bukan diam-diam kosong
  chk('Counters masih placeholder + warning',
      /COUNTER_NOP/.test(hx) && /counters_not_generated/.test(JSON.stringify(p.warnList)));
}

// --- Nilai angka (target counter, preset timer) ikut dipublish ---
// Ini kebutuhan nyata layar counter di NB: tanpa alamat, kotak angkanya tidak punya apa-apa
// untuk ditempel. Satu UDINT = DUA word, jadi blok 10 counter makan 20 word, bukan 10.
const wordAt=(n)=>atOf(tsv,n);
['PD071_SET1','PD071_SET2','PD071_CUR','PD081_SET','PD081_CUR'].forEach(n=>{
  chk('nilai angka '+n+' punya alamat', /^%D\d+$/.test(wordAt(n)), wordAt(n)||'kosong');
});
// Alamat WORD tidak boleh ada ".nn"-nya - itu alamat bit, dan NB akan membacanya sebagai bit.
chk('alamat angka itu word, bukan bit', !/\./.test(wordAt('PD071_SET1')), wordAt('PD071_SET1'));
const nb=(n)=>parseInt((wordAt(n)||'%D0').slice(2),10);
chk('blok angka tidak tumpang tindih (1 UDINT = 2 word)',
    nb('PD071_SET2')-nb('PD071_SET1')===20 && nb('PD071_CUR')-nb('PD071_SET2')===20
    && nb('PD081_SET')-nb('PD071_CUR')===20 && nb('PD081_CUR')-nb('PD081_SET')===32,
    ['PD071_SET1','PD071_SET2','PD071_CUR','PD081_SET','PD081_CUR'].map(n=>n+'='+wordAt(n)).join(' '));
// Blok angka di area SENDIRI - kalau nyasar ke area tombol, satu UDINT menimpa 2 word tombol
// dan tabrakannya tidak kelihatan karena yang satu bit yang satu angka.
chk('blok angka terpisah dari area tombol', map.cfg.numArea!==map.cfg.btnArea,
    map.cfg.numArea+' vs '+map.cfg.btnArea);

// --- Retain untuk H dan D ---
// H itu Holding: alarm yang hilang waktu power cycle bukan alarm. D menampung angka yang
// diketik operator; tanpa retain, target counter balik ke nol tiap listrik mati dan mesin
// jalan dengan target 0 tanpa ada yang memberitahu.
const retOf=(n)=>((tsv.split('\n').find(l=>l.startsWith(n+'\t'))||'').split('\t')[4]||'');
['AL','MF'].forEach(n=>chk('retain ON buat '+n+' (H area)', retOf(n)==='True', retOf(n)||'baris tidak ada'));
// Set DAN current dua-duanya - bukan cuma set. Current yang hilang waktu power cycle bikin
// hitungan produksi balik ke nol, dan itu ketahuannya baru pas laporan shift.
['PD071_SET1','PD071_SET2','PD071_CUR','PD081_SET','PD081_CUR'].forEach(n=>
  chk('retain ON buat '+n+' (D area)', retOf(n)==='True', retOf(n)||'baris tidak ada'));
// W itu area kerja tombol/lampu, ditulis ulang tiap scan - retain di situ salah.
const wRow=tsv.split('\n').filter(l=>/\t%W/.test(l));
chk('retain OFF buat alamat W', wRow.length>0 && wRow.every(l=>l.split('\t')[4]==='False'),
    wRow.length+' baris W');

// --- Spare: jatah alamat TIDAK dipaskan ke IO list hari ini ---
chk('default spare 30%', map.cfg.spare===30, String(map.cfg.spare));
let sp0=gen({hmiMap:{mode:'generate',spare:0}});
let sp100=gen({hmiMap:{mode:'generate',spare:100}});
chk('spare besar menaikkan jatah word per station',
    sp100.hmiMap.cfg.stride > sp0.hmiMap.cfg.stride,
    'spare 0 -> stride '+sp0.hmiMap.cfg.stride+', spare 100 -> stride '+sp100.hmiMap.cfg.stride);
// Yang penting bukan angkanya, tapi jaraknya: tiap station maju sebanyak stride, jadi lubang
// cadangan itu ada DI DALAM jatah station - menambah aktuator nanti mengisi lubang, tidak
// mendorong station di belakangnya.
// Station diambil dari KODE SCREEN (04<station><halaman>), bukan dari teks komen: tombol
// staging di program MAIN komennya juga diawali "ST1 ..." padahal duduk di word MAIN.
function stationWords(pp){
  const w={};
  (pp.hmiMap.rows||[]).forEach(r=>{
    const s=/^04(\d)\d$/.exec(String(r.screen||'')); const a=/^%W(\d+)\./.exec(r.at||'');
    if(s && a && r.dir==='HMI->PLC'){ const k='ST'+s[1], n=+a[1]; if(w[k]===undefined||n<w[k]) w[k]=n; }
  });
  return w;
}
const g0=stationWords(sp0), g100=stationWords(sp100);
chk('jarak antar station = jatah word per station',
    (g0.ST2-g0.ST1)===sp0.hmiMap.cfg.stride && (g100.ST2-g100.ST1)===sp100.hmiMap.cfg.stride,
    'spare 0: '+JSON.stringify(g0)+' stride '+sp0.hmiMap.cfg.stride
    +' | spare 100: '+JSON.stringify(g100)+' stride '+sp100.hmiMap.cfg.stride);

// Sisi UI. Panel-nya di-inline lewat build_html.py, jadi yang dicek index.html HASIL BUILD - bukan
// template-nya - supaya ketahuan kalau panelnya kepental waktu build. Setelan yang gak ikut ke
// export project JSON itu kegagalan diam: orang nyetel base address, export, import, dan angkanya
// balik ke default tanpa ada yang bilang apa-apa.
const html=fs.existsSync(root+'/index.html')?fs.readFileSync(root+'/index.html','utf8'):'';
chk('index.html ada (build dulu kalau gagal)', !!html);
if(html){
  const inputs=['hmiMode','hmiBtnArea','hmiAlArea','hmiPbBase','hmiRdOffset','hmiAlBase','hmiMfBase','hmiPerPage','hmiStride','hmiEnabled','hmiNumArea','hmiNumBase','hmiSpare'];
  const missing=inputs.filter(id=>html.indexOf('id="'+id+'"')<0);
  chk('semua input panel HMI ada di build', !missing.length, missing.join(', '));
  chk('setelan HMI ikut ke project JSON export', /hmiMap:\s*hmiSettings\(\)/.test(html));
  chk('setelan HMI dibaca balik waktu import', /hmiPbBaseEl\.value\s*=\s*hm\.pbBase/.test(html));
  chk('setelan HMI dikirim ke generator', /flowStore\.hmiMap\s*=\s*hmiSettings\(\)/.test(html));
  chk('peta dirender tiap generate', /renderHmiMap\(payload\.hmiMap\)/.test(html));
  // Spreadsheet AL/MF harus berada di PANEL HASIL dan DI LUAR fold "Download per program" -
  // itu keluhan aslinya: tabelnya ada tapi ngumpet, jadi tidak ada gunanya.
  chk('sheet dibangun dari lastArrayRows', /function buildArraySheet\(\)/.test(html));
  chk('sheet ditaruh sebelum fold per-program',
      /var sheet = buildArraySheet\(\);[\s\S]{0,80}resEl\.appendChild\(sheet\);[\s\S]{0,220}per-program/.test(html));
  chk('tombol salin kolom Comment ada', /Salin kolom Comment/.test(html));
  chk('tombol salin semua kolom ada', /Salin semua kolom/.test(html));
  chk('filter + sembunyikan Spare ada', /arrayFilter = sel\.value/.test(html) && /arrayHideSpare = cb\.checked/.test(html));
  // Ganti filter cuma render ulang tabel, tidak generate ulang seluruh project
  chk('filter tidak memicu regenerate', /arraySheetRefresh\(\);/.test(html) && !/renderArrayPanel/.test(html));
  // navigator.clipboard tidak ada di file://, jadi jalur cadangan wajib ada
  chk('salin punya fallback execCommand', /execCommand\('copy'\)/.test(html));
}

console.log(fail?('\n'+fail+' GAGAL'):'\nhmi: semua OK');
process.exit(fail?1:0);
