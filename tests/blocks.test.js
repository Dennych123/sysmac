// Flowchart meniru pola Denso: motion -> JUDGEMENT -> (Y: set OK / reset NG) (N: set NG + alarm)
// -> OR menyatu -> motion lanjut.
const fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..').replace(/\\/g,'/');
const core=require(root+'/scripts/core.js');
const STEP={s_parse:core.STEPS.parse,s_name:core.STEPS.genname,s_val:core.STEPS.validate,s_split:core.STEPS.split,s_all:core.STEPS.gen_all};
const warns=[];
const run=(id,msg,flow)=>core.runStep(STEP[id],msg,flow,{warn:m=>warns.push(m)});
const src=fs.readFileSync(root+'/scripts/test.js','utf8');
const IO=src.match(/const IO=`([\s\S]*?)`;/)[1].replace(/\\t/g,'\t');

const JUDGE='PH_ST1_INS_FLW_OUT_ON';   // sensor beneran dari IO list
const ctx={ motionSequences:{ ST1:[{ condition:'', comment:'Press cycle', nodes:[
  {id:'n1', type:'motion',   sol:'SOL_ST1_STP2_CHK', after:[],        join:'AND'},
  {id:'d1', type:'decision', cond:JUDGE, comment:'JUDGEMENT OK', after:['n1'], join:'AND'},
  {id:'s1', type:'setmem',   bit:'LB800', comment:'MEMORY PRESS OK',  after:['d1#Y'], join:'AND'},
  {id:'r1', type:'resetmem', bit:'LB801', comment:'MEMORY PRESS NG',  after:['d1#Y'], join:'AND'},
  {id:'s2', type:'setmem',   bit:'LB801', comment:'MEMORY PRESS NG',  after:['d1#N'], join:'AND'},
  {id:'a1', type:'alarm',    category:'faultstop', comment:'Press judgement NG', after:['d1#N'], join:'AND'},
  {id:'n3', type:'motion',   sol:'SOL_ST1_STP4_CHK', after:['d1#Y'],    join:'AND'},   // nunggu cabang Y saja
  {id:'n2', type:'motion',   sol:'SOL_ST1_STP3_CHK', after:['s1','a1'], join:'OR'}
]}]}};
const flow={get:k=>ctx[k], set:(k,v)=>ctx[k]=v};
let m=run('s_parse',{payload:IO},flow); m=run('s_name',m,flow);
const v=run('s_val',m,flow); if(v[1]){ console.log('VALIDATE ERR:',v[1].payload); process.exit(1); }
const r=run('s_all',run('s_split',v[0],flow),flow);
const xml=r.payload.files.find(f=>/Prg010_ST1/.test(f.name)).xml;
const auto=xml.split('AutoRunning')[1]||'';

let fail=0;
const chk=(l,c,x)=>{ if(!c)fail++; console.log((c?'  OK  ':'>>BAD ')+l+(x?'\n         '+x:'')); };
const rungWith=(hay,needle)=>{                      // ambil 1 rung yang memuat needle
  const i=hay.indexOf(needle); if(i<0) return '';
  const s=hay.lastIndexOf('<Rung',i); const e=hay.indexOf('</Rung>',i);
  return s<0||e<0?'':hay.slice(s,e);
};

// --- decision: dua rung, kondisi normal vs negated, dari step-bit yang sama ---
// esc() nge-escape '>' jadi '&gt;' di komen rung, dan atribut XML-nya "Contact" operand=..." -
// ada tanda kutip penutup xsi:type di antaranya.
const CT=(op)=>new RegExp('Contact"[^>]*operand="'+op.replace(/[[\]]/g,'\\$&')+'"');
const CTNEG=(op)=>new RegExp('Contact" negated="true" operand="'+op.replace(/[[\]]/g,'\\$&')+'"');
const yR=rungWith(auto,'-&gt; YES'), nR=rungWith(auto,'-&gt; NO');
chk('rung cabang YES ada', !!yR);
chk('rung cabang NO ada', !!nR);
chk('YES pakai kontak kondisi NORMAL', CT(JUDGE).test(yR) && !CTNEG(JUDGE).test(yR));
chk('NO pakai kontak kondisi NEGATED', CTNEG(JUDGE).test(nR));
const yBit=(yR.match(/Coil[^>]*operand="(LB\d+)"/)||[])[1];
const nBit=(nR.match(/Coil[^>]*operand="(LB\d+)"/)||[])[1];
chk('dua cabang dapat bit berbeda', yBit && nBit && yBit!==nBit, 'Y='+yBit+' N='+nBit);
const yPrev=(yR.match(/Contact"[^>]*operand="(LB\d+)"/)||[])[1];
const nPrev=(nR.match(/Contact"[^>]*operand="(LB\d+)"/)||[])[1];
chk('dua cabang berangkat dari step-bit yang SAMA', yPrev===nPrev, yPrev+' vs '+nPrev);

// --- memory: SATU rung latch per bit, bukan coil dobel ---
const coilCount=(bit)=>(auto.match(new RegExp('<LdObject xsi:type="Coil"[^>]*operand="'+bit+'"','g'))||[]).length;
chk('LB800 cuma punya 1 coil (gak dobel)', coilCount('LB800')===1, 'coil='+coilCount('LB800'));
chk('LB801 cuma punya 1 coil walau di-set DAN di-reset', coilCount('LB801')===1, 'coil='+coilCount('LB801'));
const m800=rungWith(auto,'Memory LB800');
chk('LB800 self-latch (kontak dirinya sendiri ada)', CT('LB800').test(m800));
const m801=rungWith(auto,'Memory LB801');
chk('LB801 punya kontak reset ter-negasi', /Contact" negated="true" operand="LB6\d\d"/.test(m801));
chk('LB801 di-set dari cabang N, di-reset dari cabang Y',
    m801.includes('set by '+nBit) && m801.includes('reset by '+yBit),
    (m801.match(/set by [^<]*/)||[''])[0]);

// --- alarm: AL[] dialokasi, latching, dan MASUK grup fault stop ---
const alBit=(auto.match(/operand="(AL\[\d+\])"/)||[])[1];
chk('alarm dapat slot AL[]', !!alBit, String(alBit));
const aR=rungWith(auto,'Alarm: Press judgement NG');
chk('rung alarm ada', !!aR);
chk('alarm self-latch', !!aR && CT(alBit).test(aR));
const fault=xml.split('AutoRunning')[0];
chk('AL alarm nyambung ke grup Fault stop (LB145)',
    new RegExp('operand="'+alBit.replace(/[[\]]/g,'\\$&')+'"').test(rungWith(fault,'Fault stop group')) ||
    fault.includes(alBit), 'alBit='+alBit);

// --- merge OR: node hilir nyatuin kedua cabang ---
const jR=rungWith(auto,'Join (OR)');
chk('ada rung join OR', !!jR);
chk('join OR nyatuin bit cabang Y dan N',
    jR.includes('operand="'+yBit+'"') && jR.includes('operand="'+nBit+'"'), (jR.match(/operand="LB\d+"/g)||[]).join(' '));

// --- node yang cuma gantung ke cabang Y: prevBit-nya HARUS bit cabang, bukan rootBit LB400 ---
// Nomor "Motion N" ngikutin urutan topologis, jadi jangan dipatok - cari lewat nama devicenya.
const n3R=rungWith(auto,'STOPPER-4 CHUCK');
chk('rung motion penunggu cabang ada', !!n3R, (n3R.match(/Motion \d+[^<]*/)||[''])[0]);
chk('berangkat dari bit cabang Y, BUKAN LB400', CT(yBit).test(n3R) && !CT('LB400').test(n3R),
    'yBit='+yBit+' ada='+CT(yBit).test(n3R)+' LB400='+CT('LB400').test(n3R));

// --- HOLD + MUTEX di blok judgement ---
chk('cabang Y nge-seal dirinya sendiri (HOLD)', CT(yBit).test(yR), yBit);
chk('cabang N nge-seal dirinya sendiri (HOLD)', CT(nBit).test(nR), nBit);
chk('cabang Y interlock ANDNOT cabang N (MUTEX)', CTNEG(nBit).test(yR));
chk('cabang N interlock ANDNOT cabang Y (MUTEX)', CTNEG(yBit).test(nR));
// Seal WAJIB nyambung SETELAH prevBit, bukan langsung dari LeftPowerRail (PATTERN 4 di lib.js) -
// kalau salah, cabangnya nyangkut selamanya dan gak pernah lepas pas cycle kelar.
const railOut=(yR.match(/LeftPowerRail"><ConnectionPointOut connectionPointOutId="(\d+)"/)||[])[1];
const prevOut=(yR.match(new RegExp('Contact" operand="'+yPrev+'"[\\s\\S]*?connectionPointOutId="(\\d+)"'))||[])[1];
const sealIn=(yR.match(new RegExp('Contact" operand="'+yBit+'"><ConnectionPointIn><Connection refConnectionPointOutId="(\\d+)"'))||[])[1];
chk('seal refIn ke titik SETELAH prevBit, bukan ke power rail',
    sealIn===prevOut && sealIn!==railOut, 'rail='+railOut+' prev='+prevOut+' seal='+sealIn);

console.log('\nWARN generator:'); (r.payload.warnings||'(kosong)').split('\n').forEach(w=>w&&console.log('   '+w));
console.log('\n'+(fail?fail+' GAGAL':'SEMUA LULUS'));
process.exit(fail?1:0);
