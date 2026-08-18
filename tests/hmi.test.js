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

function genIO(io,seed){
  const ctx=Object.assign({},seed||{});
  const flow={get:k=>ctx[k], set:(k,v)=>ctx[k]=v};
  let m=run('s_parse',{payload:io},flow); m=run('s_name',m,flow);
  const v=run('s_val',m,flow); if(v[1]) throw new Error(v[1].payload);
  return run('s_all',run('s_split',v[0],flow),flow).payload;
}
function gen(seed){ return genIO(IO,seed); }
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
tsv.split('\n').forEach(l=>{
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
const atCells=tsv.split('\n').map(l=>l.split('\t')[3]).filter(Boolean);
chk('semua AT diawali %', atCells.length>0 && atCells.every(v=>v.charAt(0)==='%'),
    atCells.length+' AT, contoh '+atCells.slice(0,2).join(' '));

// Baris array-level TANPA komen: komen generik "Alarm bit table" nutupin kolom Comment dan bikin
// orang mengira arraynya belum dikomen per elemen.
const cmtOf=(t,n)=>((t.split('\n').find(l=>l.startsWith(n+'\t'))||'').split('\t')[7]||'');
chk('AL/MF array-level tanpa komen', cmtOf(tsv,'AL')==='' && cmtOf(tsv,'MF')==='',
    '['+cmtOf(tsv,'AL')+'] ['+cmtOf(tsv,'MF')+']');
chk('AL/MF array-level tetap dapat AT', atOf(tsv,'AL')==='%H300.00', atOf(tsv,'AL'));

// GlobalVariables.tsv itu berkas TEMPEL. Baris judul mendarat sebagai variabel bernama "Name"
// bertipe "Data type", dan baris elemen array (AL[61]) tidak bisa ditempel sebelum arraynya
// di-expand - keduanya bikin blok yang ditempel tidak lagi sejajar dengan yang kebuka di layar.
const gLines=tsv.split('\n');
chk('GlobalVariables.tsv tanpa baris judul', !/^Name\tData type/.test(tsv), gLines[0].split('\t')[0]);
chk('GlobalVariables.tsv tanpa elemen array',
    !gLines.some(l=>/^(AL|MF)\[\d+\]\t/.test(l)),
    (gLines.filter(l=>/^(AL|MF)\[\d+\]\t/.test(l))[0]||'').split('\t')[0]);
chk('baris array-level AL dan MF tetap ada', gLines.some(l=>/^AL\t/.test(l)) && gLines.some(l=>/^MF\t/.test(l)));
chk('tiap baris punya 8 kolom', gLines.every(l=>l.split('\t').length===8),
    (gLines.find(l=>l.split('\t').length!==8)||'').slice(0,40));
chk('globalRows ikut di payload buat panel UI',
    Array.isArray(p.globalRows) && p.globalRows.length===gLines.length,
    p.globalRows?p.globalRows.length+' baris vs '+gLines.length+' baris TSV':'kosong');

// ---- tabel Global Variable ikut di AllPrograms.xml ---------------------------------------
// AT lewat <Address>, retain lewat atribut KONTAINER (makanya kontainernya dua). Dua-duanya
// sudah dibuktikan terisi waktu import di Studio, bukan cuma lolos XSD.
//
// Komen per ELEMEN array sengaja TIDAK ada di sini: Studio membuang smcext:VariableComment
// waktu import - sudah diuji dengan tujuh varian, termasuk kontrol tanpa ElementComment yang
// ikut kosong. Komen elemen tetap lewat ArrayComments.tsv. Jangan ditambahkan lagi ke XML.
const allx=p.files.find(f=>f.name==='AllPrograms.xml').xml;
const gvBlocks=allx.match(/<GlobalVars[^>]*>/g)||[];
chk('AllPrograms.xml punya dua kontainer GlobalVars', gvBlocks.length===2, gvBlocks.join(' '));
chk('satu kontainer retain="true"', gvBlocks.filter(b=>/retain="true"/.test(b)).length===1, gvBlocks.join(' '));
const gvRet=(/<GlobalVars retain="true">([\s\S]*?)<\/GlobalVars>/.exec(allx)||['',''])[1];
const gvPln=(/<GlobalVars>([\s\S]*?)<\/GlobalVars>/.exec(allx)||['',''])[1];
const namesIn=s=>(s.match(/<Variable name="([^"]+)"/g)||[]).map(v=>/name="([^"]+)"/.exec(v)[1]);
const retNames=namesIn(gvRet), plnNames=namesIn(gvPln);
// Aturannya sama dengan kolom Retain di TSV: apa pun yang duduk di H atau D.
const atOfName={}; tsv.split('\n').forEach(l=>{const c=l.split('\t'); atOfName[c[0]]=c[3]||'';});
const mestiRetain=Object.keys(atOfName).filter(n=>/^%(H|D)/.test(atOfName[n]));
chk('semua simbol H/D masuk kontainer retain',
    mestiRetain.length>0 && mestiRetain.every(n=>retNames.indexOf(n)>=0),
    mestiRetain.filter(n=>retNames.indexOf(n)<0).join(' ')||mestiRetain.join(' '));
chk('tidak ada simbol W yang ikut kena retain',
    !retNames.some(n=>/^%W/.test(atOfName[n]||'')),
    retNames.filter(n=>/^%W/.test(atOfName[n]||'')).join(' '));
chk('semua simbol ada di salah satu kontainer',
    retNames.length+plnNames.length===tsv.split('\n').length,
    (retNames.length+plnNames.length)+' vs '+tsv.split('\n').length+' baris TSV');
// Satu AT di TSV = satu <Address> di XML. Kalau meleset, ada kolom yang cuma ada di satu jalur.
const atCount=(allx.match(/<Address address="/g)||[]).length;
chk('tiap AT punya <Address> di XML', atCount===p.hmiMap.rows.length,
    atCount+' Address vs '+p.hmiMap.rows.length+' baris peta HMI');
// Urutan anak terikat xsd:sequence - Documentation, Type, Address. Ketuker = ditolak XSD.
const alVar=(/<Variable name="AL">([\s\S]*?)<\/Variable>/.exec(gvRet)||['',''])[1];
chk('urutan anak Variable sesuai xsd:sequence',
    (alVar.match(/<(Documentation|AddData|Type|Address)\b/g)||[]).join(' ')
      === '<Documentation <Type <Address',
    (alVar.match(/<(Documentation|AddData|Type|Address)\b/g)||[]).join(' '));
// Regresi: jalur yang sudah terbukti dibuang Studio jangan sampai kembali diam-diam. Selain
// tidak berguna, 190 ElementComment bikin AllPrograms.xml membengkak tanpa hasil apa pun.
chk('tidak ada komen elemen di XML (Studio membuangnya)',
    !/smcext:(VariableComment|ElementComment)/.test(allx),
    (allx.match(/smcext:\w+/g)||[]).filter((v,i,a)=>a.indexOf(v)===i).join(' '));
chk('komen elemen tetap ada di ArrayComments.tsv',
    /AL\[11\]\t[^\t]*\t[^\t]*\t[^\t]*\t[^\t]*\t[^\t]*\t[^\t]*\tAL011_/.test(
      p.files.find(f=>f.name==='ArrayComments.tsv').xml));
// Berkas per-program tetap bentuk lama: tabelnya baru LENGKAP di AllPrograms, dan dua berkas
// yang membawa versi setengah jadi bakal saling menimpa waktu di-import.
const one=p.files.find(f=>/^Prg0\d\d_ST/.test(f.name)).xml;
chk('berkas per-program tetap satu kontainer polos',
    (one.match(/<GlobalVars[^>]*>/g)||[]).join('')==='<GlobalVars>',
    (one.match(/<GlobalVars[^>]*>/g)||[]).join(' '));
chk('berkas per-program tidak membawa Address', !/<Address /.test(one));

// ---- AlarmLib.csv buat NB-Designer -------------------------------------------------------
// Alarm NB disimpan sebagai CSV biasa di folder project, jadi 190 alarm bisa masuk sekali
// timpa - tidak diketik ulang satu per satu. Bentuknya diambil dari project NB yang jalan di
// mesin, dan yang dijaga di sini sifat-sifat yang kalau rusak bikin alarm menempel ke bit yang
// salah tanpa ada yang protes.
function csvRow(line){
  const o=[]; let c='',q=false;
  for(let i=0;i<line.length;i++){ const ch=line[i];
    if(q){ if(ch==='"'){ if(line[i+1]==='"'){c+='"';i++;} else q=false; } else c+=ch; }
    else if(ch==='"') q=true;
    else if(ch===','){ o.push(c); c=''; }
    else c+=ch; }
  o.push(c); return o;
}
const nbCsv=p.files.find(f=>f.name==='AlarmLib.csv');
chk('AlarmLib.csv digenerate', !!nbCsv);
if(nbCsv){
  const nl=nbCsv.xml.split('\n').filter(Boolean);
  chk('baris judul persis punya NB-Designer', nl[0]==='Alarm Lib,V103', nl[0]);
  chk('satu baris per elemen AL dan MF',
      nl.length-2===p.arrayInfo.alSize+p.arrayInfo.mfSize,
      (nl.length-2)+' vs '+(p.arrayInfo.alSize+p.arrayInfo.mfSize));
  // 89 medan per baris - dihitung dari project NB nyata. Kurang atau lebih satu saja, seluruh
  // kolom setelahnya bergeser dan yang paling parah bergeser itu alamat pemicunya.
  const widths=new Set(nl.slice(2).map(l=>csvRow(l).length));
  chk('tiap baris 89 medan, tidak ada yang bergeser', widths.size===1 && widths.has(89),
      [...widths].join(' '));
  const r0=csvRow(nl[2]), rAl17=csvRow(nl[18]), rMf1=csvRow(nl[2+p.arrayInfo.alSize]);
  // Alamat di NB HARUS sama dengan blok AT yang dipakai PLC. Beda sedikit, teksnya benar tapi
  // yang dipantau bit yang lain - dan tidak ada yang memberi tahu.
  const alAt=parseAt(atOf(tsv,'AL')), mfAt=parseAt(atOf(tsv,'MF'));
  chk('alamat alarm pertama = blok AT AL di PLC',
      r0[15]===alAt.w+'.'+String(alAt.b).padStart(2,'0'), r0[15]+' vs '+atOf(tsv,'AL'));
  chk('MF mulai di blok AT MF',
      rMf1[15]===mfAt.w+'.'+String(mfAt.b).padStart(2,'0'), rMf1[15]+' vs '+atOf(tsv,'MF'));
  chk('elemen ke-17 pindah word, bukan bit ke-16',
      rAl17[15]===(alAt.w+1)+'.00', rAl17[15]);
  chk('kode area dan token area cocok', r0[14]==='56' && r0[19]==='H_bit', r0[14]+' '+r0[19]);
  // Satu teks di dua tempat: yang dibaca operator di layar sama dengan yang dicari di program.
  const acx=p.files.find(f=>f.name==='ArrayComments.tsv').xml.split('\n');
  const cmtOf=n=>(acx.find(l=>l.startsWith(n+'\t'))||'').split('\t')[7]||'';
  chk('teks alarm sama persis dengan komen elemen di Sysmac',
      r0[5]===cmtOf('AL[1]') && rMf1[5]===cmtOf('MF[1]'), r0[5]+' | '+cmtOf('AL[1]'));
  chk('slot cadangan ikut, biar nomornya tidak bergeser waktu dipakai',
      csvRow(nl[nl.length-1])[5]===cmtOf('MF['+p.arrayInfo.mfSize+']'));
}
// Koma di teks alarm itu jebakan yang nyata: "Dual sensor fault, both ends detected" ada di
// project NB acuan. Tanpa dikutip, satu koma menggeser semua medan setelahnya - alarmnya
// menempel ke bit yang salah, dan CSV-nya tetap kelihatan wajar.
// Komanya ditaruh di bagian yang DIPAKAI BERSAMA kedua reed switch: teks alarmnya dibangun
// devBase(), yang cuma mengambil kata-kata awal yang sama persis dari pasangannya.
const IO_KOMA=IO.replace(/\tST1 STOPPER-2 /g,'\tST1 "A,B" STOPPER-2 ');
const pk=genIO(IO_KOMA);
const nbk=pk.files.find(f=>f.name==='AlarmLib.csv');
const wk=new Set(nbk.xml.split('\n').filter(Boolean).slice(2).map(l=>csvRow(l).length));
chk('koma dan kutip di teks alarm tidak menggeser medan', wk.size===1 && wk.has(89), [...wk].join(' '));
chk('teks berkoma dan berkutip utuh setelah di-parse balik',
    nbk.xml.split('\n').some(l=>csvRow(l)[5] && csvRow(l)[5].indexOf('"A,B"')>=0),
    (nbk.xml.split('\n').map(l=>csvRow(l)[5]).find(t=>t&&/A,B/.test(t))||'tidak ketemu'));
// Peta HMI mati = tidak ada alamat = tidak ada yang bisa ditempel ke NB.
chk('tanpa peta HMI, AlarmLib.csv tidak dibuat',
    !gen({hmiMap:{enabled:false}}).files.some(f=>f.name==='AlarmLib.csv'));
// Kode area NB cuma diketahui buat H dan W - dibaca dari project nyata. Yang lain tidak ditebak.
const pd=gen({hmiMap:{alArea:'D',mfArea:'D'}});
chk('area yang kode NB-nya tidak diketahui dilewati, bukan ditebak',
    pd.warnList.some(w=>w.code==='nb_area_unknown'),
    pd.warnList.map(w=>w.code).join(', '));

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
// Jatah yang dilebarkan tapi tidak diisi simbol = cadangan tanpa wujud: tabel Global Variable
// berhenti di aktuator terakhir dan yang menggambar screen NB tidak punya apa pun untuk
// ditempel di slot kosong. Jadi tombol DAN lampu cadangannya harus benar-benar ada, beralamat.
function spares(pp,pre){
  return (pp.files.find(f=>f.name==='GlobalVariables.tsv').xml.split('\n'))
    .filter(l=>l.startsWith(pre) && /Spare/.test(l))
    .map(l=>({ n:l.split('\t')[0], at:l.split('\t')[3] }));
}
const spBtn=spares(sp100,'PB4'), spLamp=spares(sp100,'PL4');
chk('slot cadangan punya tombol PB4xx sungguhan', spBtn.length>0, spBtn.map(x=>x.n).join(' '));
chk('tiap tombol cadangan beralamat', spBtn.every(x=>/^%W\d+\.\d\d$/.test(x.at)),
    spBtn.map(x=>x.n+'='+(x.at||'kosong')).join(' '));
chk('tiap tombol cadangan punya lampu cadangan', spLamp.length===spBtn.length,
    spBtn.length+' tombol vs '+spLamp.length+' lampu');
// Lampu cadangan harus di BIT yang sama dengan tombolnya, cuma beda word - aturan yang sama
// dengan slot terpakai, kalau tidak switch NB di slot itu baca dan tulis device yang beda.
const bitOf=s=>s.slice(s.indexOf('.'));
chk('lampu cadangan sejajar bit dengan tombolnya',
    spBtn.every((b,i)=>bitOf(b.at)===bitOf(spLamp[i].at)),
    spBtn.map((b,i)=>b.at+'/'+spLamp[i].at).join(' '));
chk('spare 0% tidak menyisakan slot sama sekali', spares(sp0,'PB4').length===0,
    spares(sp0,'PB4').map(x=>x.n).join(' '));

// Simbol saja belum cukup - slot cadangan harus punya RUNG-nya juga di Individual dan
// HMI_Output. Tanpa itu tombolnya ada di tabel tapi tidak menggerakkan apa pun dan lampunya
// tidak pernah menyala, jadi yang menambah aktuator nanti tetap harus menulis slot dari nol.
const stXml=sp100.files.filter(f=>/^Prg0\d\d_ST/.test(f.name)).map(f=>f.xml).join('');
function sectionOf(xml,name){
  const i=xml.indexOf('name="'+name+'"'); if(i<0) return '';
  const j=xml.indexOf('<BodyContent', i+10);
  return xml.slice(i, j<0?xml.length:j);
}
const indAll=sp100.files.filter(f=>/^Prg0\d\d_ST/.test(f.name)).map(f=>sectionOf(f.xml,'Individual')).join('');
const outAll=sp100.files.filter(f=>/^Prg0\d\d_ST/.test(f.name)).map(f=>sectionOf(f.xml,'HMI_Output')).join('');
chk('tiap tombol cadangan dipakai di rung Individual',
    spBtn.every(b=>indAll.indexOf('operand="'+b.n+'"')>=0),
    spBtn.filter(b=>indAll.indexOf('operand="'+b.n+'"')<0).map(b=>b.n).join(' ') || 'semua ada');
chk('tiap lampu cadangan punya coil di HMI_Output',
    spLamp.every(l=>outAll.indexOf('xsi:type="Coil" operand="'+l.n+'"')>=0),
    spLamp.filter(l=>outAll.indexOf('xsi:type="Coil" operand="'+l.n+'"')<0).map(l=>l.n).join(' ') || 'semua ada');
// Bentuk rungnya harus SAMA dengan slot terpakai - termasuk saling-kunci M/R dan LB339.
// Kalau dibedakan, slot cadangan yang nanti dipakai harus ditulis ulang dari nol.
chk('rung cadangan pakai saling-kunci dan LB339 seperti slot terpakai',
    spBtn.filter(b=>/R$/.test(b.n)).every(b=>
      new RegExp('operand="'+b.n+'"[\\s\\S]{0,400}?operand="LB339"').test(indAll)),
    'saling-kunci M/R + return-all');
chk('lampu cadangan mengikuti bit command, bukan sensor',
    /Spare slot indication/.test(outAll));

// ---- mode cadangan: jumlah tetap per station, bukan persen -------------------------------
// Persen menskalakan diri ke ukuran station, dan itu justru salah arah buat station kecil:
// 30% dari 1 aktuator cuma 1 slot, padahal station kecil yang paling sering ditambahi.
const spN=gen({hmiMap:{mode:'generate',spareMode:'count',spareCount:3}});
chk('mode count terbaca', spN.hmiMap.cfg.spareMode==='count' && spN.hmiMap.cfg.spareCount===3,
    spN.hmiMap.cfg.spareMode+' '+spN.hmiMap.cfg.spareCount);
function spareCountPerStation(pp){
  const c={};
  // PB4<station><page>_<slot><M|R> - digit station ada di posisi ke-4, bukan ke-3 ('4' itu
  // awalan tetap buat blok tombol individual.
  spares(pp,'PB4').forEach(x=>{ const st=x.n.slice(3,4); c[st]=(c[st]||0)+1; });
  return c;   // 2 simbol (M dan R) per slot
}
const cnt=spareCountPerStation(spN);
chk('tiap station dapat 3 slot cadangan, tidak peduli besarnya',
    Object.keys(cnt).length>1 && Object.keys(cnt).every(k=>cnt[k]===6),
    JSON.stringify(cnt));
// Yang membedakan mode ini dari persen: station kecil ikut kebagian. Dengan persen, station
// yang aktuatornya sedikit dapat cadangan sedikit pula - dan itu yang mau dihindari.
const cntPct=spareCountPerStation(gen({hmiMap:{mode:'generate',spare:30}}));
chk('mode persen memang tidak seragam (jadi mode count ada gunanya)',
    Object.keys(cntPct).some(k=>cntPct[k]!==cntPct[Object.keys(cntPct)[0]]),
    JSON.stringify(cntPct));
chk('spareCount 0 tidak menyisakan slot',
    spares(gen({hmiMap:{mode:'generate',spareMode:'count',spareCount:0}}),'PB4').length===0);

// ---- slot cadangan itu slot UTUH, bukan cuma tombol -------------------------------------
// Reed switch, kombinasi LS, alarm dual sensor, sampai baris output. Menambah aktuator nanti
// berarti mengganti sumber sinyalnya, bukan menulis slotnya dari nol.
const stN=spN.files.filter(f=>/^Prg0\d\d_ST/.test(f.name));
const devIn=stN.map(f=>sectionOf(f.xml,'Device_Input')).join('');
const lsAll=stN.map(f=>sectionOf(f.xml,'LS_Combination')).join('');
const fltAll=stN.map(f=>sectionOf(f.xml,'Fault')).join('');
const autoOut=stN.map(f=>sectionOf(f.xml,'Auto_Output')).join('');
const spTsv=spN.files.find(f=>f.name==='GlobalVariables.tsv').xml.split('\n');
const spAs=spTsv.filter(l=>/^AS4\d/.test(l)).map(l=>l.split('\t')[0]);
const spSol=spTsv.filter(l=>/^SOL4\d/.test(l)).map(l=>l.split('\t')[0]);
chk('slot cadangan punya reed switch sendiri', spAs.length===6*stN.length, spAs.length+' simbol AS');
chk('reed switch cadangan disetir GSB001, bukan port',
    spAs.every(n=>new RegExp('operand="GSB001"[\\s\\S]{0,300}?xsi:type="Coil" operand="'+n+'"').test(devIn)),
    spAs.filter(n=>devIn.indexOf('operand="'+n+'"')<0).join(' ')||'semua ada');
chk('slot cadangan punya kombinasi LS',
    spAs.every(n=>lsAll.indexOf('operand="'+n+'"')>=0)
    && /LSC4\d+_\dM/.test(lsAll) && /LSC4\d+_\dR/.test(lsAll));
// LSC cadangan TIDAK boleh masuk syarat home position: sumbernya GSB001, jadi selamanya OFF -
// station itu tidak akan pernah dinyatakan di home dan mesin tidak pernah bisa start.
const prep=stN.map(f=>sectionOf(f.xml,'Preparation')).join('')
          + stN.map(f=>sectionOf(f.xml,'Condition')).join('');
chk('LSC cadangan TIDAK ikut syarat home position', !/LSC4\d+_\d[MR]/.test(prep),
    (prep.match(/LSC4\d+_\d[MR]/g)||[]).slice(0,3).join(' '));
chk('slot cadangan punya alarm ALL REED SWITCH ON',
    /SPARE \d+ ALL REED SWITCH ON/i.test(fltAll),
    (fltAll.match(/[A-Z0-9 _]+ALL REED SWITCH ON/g)||[]).slice(-2).join(' | '));
chk('slot cadangan punya motion fault',
    /SPARE \d+ MOTION FAULT/i.test(fltAll)
    && spSol.every(n=>fltAll.indexOf('operand="'+n+'"')>=0),
    (fltAll.match(/[A-Z0-9 _]+MOTION FAULT/g)||[]).slice(-2).join(' | '));
chk('motion fault cadangan pakai TON seperti aktuator nyata',
    (fltAll.match(/typeName="TON"/g)||[]).length >= 6*stN.length/2,
    (fltAll.match(/typeName="TON"/g)||[]).length+' TON');
chk('slot cadangan punya baris output ke coil placeholder',
    spSol.length===6*stN.length
    && spSol.every(n=>autoOut.indexOf('xsi:type="Coil" operand="'+n+'"')>=0),
    spSol.length+' simbol SOL');

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
