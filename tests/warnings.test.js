const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..').replace(/\\/g,'/');
const core=require(root+'/scripts/core.js');
const IO=fs.readFileSync(root+'/scripts/test.js','utf8').match(/const IO=`([\s\S]*?)`;/)[1].replace(/\\t/g,'\t');

let fail=0;
const chk=(l,c,x)=>{ if(!c)fail++; console.log((c?'  OK  ':'>>BAD ')+l+(x?'   '+x:'')); };

const r=core.generate({io:IO});
console.log('warnList: '+r.warnList.length+' entri');
r.warnList.forEach(w=>console.log('   ['+w.level+'] '+w.code.padEnd(26)+(w.station||'-').padEnd(7)+w.message.slice(0,56)));
console.log('');

chk('warnList terisi', r.warnList.length>0, r.warnList.length+' entri');
chk('jumlahnya sama dengan versi string',
    r.warnList.length===r.warnings.split('\n').filter(Boolean).length,
    r.warnList.length+' vs '+r.warnings.split('\n').filter(Boolean).length);
chk('tiap entri punya level+code+station+message',
    r.warnList.every(w=>w.level&&w.code&&typeof w.station==='string'&&w.message));
chk('code-nya slug stabil (huruf kecil + underscore)',
    r.warnList.every(w=>/^[a-z][a-z0-9_]*$/.test(w.code)),
    r.warnList.map(w=>w.code).filter(c=>!/^[a-z][a-z0-9_]*$/.test(c)).join(','));
chk('station keisi buat warning per-station',
    r.warnList.filter(w=>w.code==='lsc_not_found').every(w=>w.station==='ST1'),
    r.warnList.filter(w=>w.code==='lsc_not_found').map(w=>w.station).join(','));
chk('versi string tetap ada (kompatibel panel lama)', typeof r.warnings==='string' && r.warnings.length>0);

// bisa dikelompokkan per station dan per kode - inti dari kenapa ini distruktur
const byStation={}; r.warnList.forEach(w=>{ (byStation[w.station||'GLOBAL']=byStation[w.station||'GLOBAL']||[]).push(w); });
chk('bisa dikelompokkan per station', Object.keys(byStation).length>0, JSON.stringify(Object.keys(byStation)));
const byCode={}; r.warnList.forEach(w=>{ byCode[w.code]=(byCode[w.code]||0)+1; });
chk('bisa dihitung per kode', Object.keys(byCode).length>0, JSON.stringify(byCode));

// skenario yang mestinya keluar kode spesifik
const r2=core.generate({io:IO, arraySizes:{al:3}});
chk('array kekecilan -> code array_size_raised',
    r2.warnList.some(w=>w.code==='array_size_raised'), r2.warnList.map(w=>w.code).join(','));
const r3=core.generate({io:IO, timerDefaults:{phpx:'ngawur'}});
chk('timer salah format -> code timer_format',
    r3.warnList.some(w=>w.code==='timer_format'), r3.warnList.map(w=>w.code).join(','));

// --- device: kunci buat nyorot aktuator yang mana di panel Confirm Mode ---
console.log('\n--- device per warning ---');
r.warnList.forEach(w=>console.log('   '+w.code.padEnd(24)+(w.device||'(tanpa device)')));
const miss=r.warnList.filter(w=>w.code==='lsc_not_found');
chk('tiap lsc_not_found bawa nama device', miss.length>0 && miss.every(w=>w.device),
    miss.map(w=>w.device).join(', '));
chk('device itu nama SIMBOL, bukan komen (biar cocok sama actuatorOverrides)',
    miss.every(w=>/^[A-Z][A-Z0-9_]*$/.test(w.device)), miss.map(w=>w.device).join(', '));
chk('device unik per aktuator', new Set(miss.map(w=>w.device)).size===miss.length,
    miss.map(w=>w.device).join(', '));

// Override harus mematikan keluhannya - itu yang bikin sorotan merah hilang setelah disetel
const ov={}; miss.forEach(w=>{ ov[w.device]={mode:'openloop'}; });
const rOv=core.generate({io:IO, actuatorOverrides:ov});
chk('setelah disetel openloop, lsc_not_found hilang',
    rOv.warnList.filter(w=>w.code==='lsc_not_found').length===0,
    rOv.warnList.map(w=>w.code).join(',')||'(bersih)');

console.log('\n'+(fail?fail+' GAGAL':'SEMUA LULUS'));
process.exit(fail?1:0);
