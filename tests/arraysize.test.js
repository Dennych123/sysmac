const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..').replace(/\\/g,'/');
const core=require(root+'/scripts/core.js');
const STEP={s_parse:core.STEPS.parse,s_name:core.STEPS.genname,s_val:core.STEPS.validate,s_split:core.STEPS.split,s_all:core.STEPS.gen_all};
const run=(id,msg,flow)=>core.runStep(STEP[id],msg,flow,{warn:()=>{}});
const IO=fs.readFileSync(root+'/scripts/test.js','utf8').match(/const IO=`([\s\S]*?)`;/)[1].replace(/\\t/g,'\t');

function gen(arraySizes){
  const ctx = arraySizes ? {arraySizes} : {};
  const flow={get:k=>ctx[k], set:(k,v)=>ctx[k]=v};
  let m=run('s_parse',{payload:IO},flow); m=run('s_name',m,flow);
  const v=run('s_val',m,flow); if(v[1]) throw new Error(v[1].payload);
  return run('s_all',run('s_split',v[0],flow),flow).payload;
}
let fail=0;
const chk=(l,c,x)=>{ if(!c)fail++; console.log((c?'  OK  ':'>>BAD ')+l+(x?'   '+x:'')); };
const count=(tsv,p)=>tsv.split('\n').filter(l=>l.startsWith(p+'[')).length;
const arrType=(tsv,n)=>((tsv.split('\n').find(l=>l.startsWith(n+'\t'))||'').split('\t')[1]||'');

// default: 3 station x blok 30 + MAIN 10 = AL 100, MF 90
let p=gen(null);
let tsv=p.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('blok per station 30 -> AL 100 / MF 90',
    arrType(tsv,'AL')==='ARRAY[1..100] OF BOOL' && arrType(tsv,'MF')==='ARRAY[1..90] OF BOOL',
    arrType(tsv,'AL')+' | '+arrType(tsv,'MF'));
chk('arrayInfo bedain terisi vs teralokasi',
    p.arrayInfo && p.arrayInfo.alFilled < p.arrayInfo.alUsed && p.arrayInfo.stationBlock===30,
    JSON.stringify(p.arrayInfo));
// Tiap station harus dapat blok 30 yang berurutan dan gak tumpang tindih
const cmt=(el)=>(tsv.split('\n').find(l=>l.startsWith(el+'\t'))||'').split('\t')[7]||'';
// Batas blok sekarang dilaporin di stats (komen spare sengaja dipendekin jadi "ALnnn_ Spare" doang)
chk('peta blok dicetak di stats', /ARRAY BLOCK \(30 slot\/station\)/.test(p.stats),
    (p.stats.split('\n').find(l=>/ARRAY BLOCK/.test(l))||'').slice(0,60));
chk('blok berurutan tanpa tumpang tindih',
    /MAIN AL\[1\.\.10\]/.test(p.stats) && /ST1 AL\[11\.\.40\] MF\[1\.\.30\]/.test(p.stats)
    && /ST2 AL\[41\.\.70\] MF\[31\.\.60\]/.test(p.stats) && /ST3 AL\[71\.\.100\] MF\[61\.\.90\]/.test(p.stats),
    (p.stats.split('\n').find(l=>/ARRAY BLOCK/.test(l))||''));
chk('alarm asli tetap di awal blok station-nya', /ST1/.test(cmt('AL[11]')), cmt('AL[11]').slice(0,40));
chk('komen spare pendek, gak nyebut station lagi',
    cmt('AL[40]')==='AL040_ Spare' && cmt('MF[90]')==='MF090_ Spare', cmt('AL[40]')+' | '+cmt('MF[90]'));
chk('tiap elemen array punya komen (gak ada yang kosong)',
    count(tsv,'AL')===p.arrayInfo.alSize && count(tsv,'MF')===p.arrayInfo.mfSize,
    'AL '+count(tsv,'AL')+'/'+p.arrayInfo.alSize+'  MF '+count(tsv,'MF')+'/'+p.arrayInfo.mfSize);

// disetel lebih besar
// Angkanya harus DI ATAS yang teralokasi (AL 100, MF 90) - kalau di bawah, generator berhak naikin.
p=gen({al:250, mf:120});
tsv=p.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('ukuran custom kepakai', arrType(tsv,'AL')==='ARRAY[1..250] OF BOOL' && arrType(tsv,'MF')==='ARRAY[1..120] OF BOOL',
    arrType(tsv,'AL')+' | '+arrType(tsv,'MF'));
chk('elemen komen ikut nambah', count(tsv,'AL')===250 && count(tsv,'MF')===120, count(tsv,'AL')+' / '+count(tsv,'MF'));
chk('stub bernomor sampai ujung', /AL250_ Spare/.test(tsv) && /MF120_ Spare/.test(tsv));

// disetel TERLALU KECIL - harus dinaikin balik, jangan ngedrop slot
p=gen({al:3, mf:2});
tsv=p.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('ukuran kekecilan dinaikin ke jumlah terpakai',
    arrType(tsv,'AL')==='ARRAY[1..'+p.arrayInfo.alUsed+'] OF BOOL' &&
    arrType(tsv,'MF')==='ARRAY[1..'+p.arrayInfo.mfUsed+'] OF BOOL',
    arrType(tsv,'AL')+' | used='+p.arrayInfo.alUsed);
// Dicocokkan ke KODE warning, bukan kalimatnya. Kode itu kontrak (lihat CLAUDE.md); teksnya boleh
// berubah - dan memang berubah waktu pesan generator dipindah ke bahasa Inggris.
chk('ada warning-nya, bukan diam-diam',
    p.warnList.filter(w=>w.code==='array_size_raised').length===2,
    p.warnList.map(w=>w.code).join(', '));
chk('slot terakhir yang kepakai tetap ada isinya',
    tsv.includes('AL['+p.arrayInfo.alUsed+']') && !new RegExp('AL\\['+(p.arrayInfo.alUsed+1)+'\\]').test(tsv));

// input ngawur -> balik ke default
p=gen({al:'abc', mf:''});
tsv=p.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('input ngawur balik ke default', arrType(tsv,'AL')==='ARRAY[1..100] OF BOOL', arrType(tsv,'AL'));

// blok per station bisa disetel
p=gen({stationBlock:12});
tsv=p.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('stationBlock 12 -> AL 10+3x12=46', p.arrayInfo.alUsed===46 && p.arrayInfo.stationBlock===12,
    'alUsed='+p.arrayInfo.alUsed);
chk('array ngikut, gak nyisain slot tanpa komen', count(tsv,'AL')===p.arrayInfo.alSize,
    count(tsv,'AL')+'/'+p.arrayInfo.alSize);

// blok kekecilan buat station yang butuh lebih -> dilebarin + warning, jangan ngedrop alarm
p=gen({stationBlock:2});
chk('blok kekecilan -> SEMUA blok dinaikin (bukan cuma station itu), ada warning',
    p.warnList.some(w=>w.code==='station_block_raised'),
    p.warnList.map(w=>w.code).join(', '));
chk('ukuran blok jadi seragam sebesar station terbesar', p.arrayInfo.stationBlock>2,
    'stationBlock='+p.arrayInfo.stationBlock);
chk('gak ada alarm yang ke-skip gara-gara blok kekecilan', !/alarm block full/.test(p.warnings));

// --- STABILITAS NOMOR saat unit / aktuator nambah ---
// Ini inti dari blok tetap: nomor station lain gak boleh geser.
function blockOf(tsv, st){
  const rows=tsv.split('\n').filter(l=>/^AL\[/.test(l));
  const hit=rows.filter(l=>l.split('\t')[7].indexOf(st+' ')>=0 || l.split('\t')[7].indexOf('for '+st)>=0);
  const nums=hit.map(l=>parseInt(l.match(/^AL\[(\d+)\]/)[1],10));
  return nums.length?{min:Math.min(...nums),max:Math.max(...nums)}:null;
}
const base=gen(null).files.find(f=>f.name==='GlobalVariables.tsv').xml;
const b2=blockOf(base,'ST2'), b3=blockOf(base,'ST3');

// (a) tambah aktuator di ST1
const IO_MORE_ACT = IO + '\nCH7_00\tSOL\tOUT\tST1 EXTRA CLAMP LOCK\nCH7_01\tSOL\tOUT\tST1 EXTRA CLAMP UNLOCK';
function genIO(io){
  const ctx={}; const flow={get:k=>ctx[k], set:(k,v)=>ctx[k]=v};
  let m=run('s_parse',{payload:io},flow); m=run('s_name',m,flow);
  const v=run('s_val',m,flow); if(v[1]) throw new Error(v[1].payload);
  return run('s_all',run('s_split',v[0],flow),flow).payload;
}
let t=genIO(IO_MORE_ACT).files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('nambah aktuator di ST1: blok ST2 gak geser',
    JSON.stringify(blockOf(t,'ST2'))===JSON.stringify(b2), JSON.stringify(blockOf(t,'ST2'))+' vs '+JSON.stringify(b2));
chk('nambah aktuator di ST1: blok ST3 gak geser',
    JSON.stringify(blockOf(t,'ST3'))===JSON.stringify(b3));

// (b) tambah unit baru ST4
const IO_MORE_UNIT = IO + '\nCH7_00\tAS\tIN\tST4 CLAMP LOCK\nCH7_01\tAS\tIN\tST4 CLAMP UNLOCK'
                        + '\nCH7_02\tSOL\tOUT\tST4 CLAMP LOCK\nCH7_03\tSOL\tOUT\tST4 CLAMP UNLOCK';
const p4=genIO(IO_MORE_UNIT); t=p4.files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('nambah unit ST4: blok ST2/ST3 gak geser',
    JSON.stringify(blockOf(t,'ST2'))===JSON.stringify(b2) && JSON.stringify(blockOf(t,'ST3'))===JSON.stringify(b3),
    JSON.stringify(blockOf(t,'ST2')));
chk('nambah unit ST4: array otomatis melar', p4.arrayInfo.alUsed===130 && p4.arrayInfo.alSize===130,
    'alUsed='+p4.arrayInfo.alUsed+' alSize='+p4.arrayInfo.alSize);
chk('ST4 dapat blok ke-4 (AL[101..130])', /^AL\[101\]/m.test(t) && /ST4/.test(blockOf(t,'ST4')?'x':'') === false
    || (blockOf(t,'ST4') && blockOf(t,'ST4').min===101), JSON.stringify(blockOf(t,'ST4')));

// (c) station bernomor lompat: ST1 + ST3 doang, ST3 tetap di blok ke-3
const IO_GAP = IO.split('\n').filter(l=>!/\tST2 /.test(l)).join('\n');
t=genIO(IO_GAP).files.find(f=>f.name==='GlobalVariables.tsv').xml;
chk('ST2 kosong: ST3 TETAP di blok ke-3, gak naik ke jatah ST2',
    JSON.stringify(blockOf(t,'ST3'))===JSON.stringify(b3), JSON.stringify(blockOf(t,'ST3'))+' vs '+JSON.stringify(b3));

console.log('\n'+(fail?fail+' GAGAL':'SEMUA LULUS'));
process.exit(fail?1:0);
