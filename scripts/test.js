const fs=require('fs');
const flowJson=JSON.parse(fs.readFileSync('/mnt/user-data/outputs/sysmac-program-generator-flow.json'));
const byId={}; flowJson.forEach(n=>byId[n.id]=n);
const ctx={}; const flow={get:k=>ctx[k], set:(k,v)=>ctx[k]=v};
const run=(id,msg)=>new Function('msg','flow','node','return (function(){'+byId[id].func+'})()')(msg,flow,{warn:console.warn});

const IO=`CH000_00\tPB\tIN\tNOT EMERGENCY STOP
CH000_01\tCR\tIN\tFUSE GOOD CONF
CH000_02\tCR\tIN\tAIR SOURCE CONF
CH000_03\tLS\tIN\tSAFETY CONF
CH000_04\tSS\tIN\tAUTO IND
CH000_05\tPB\tIN\tMASTER ON
CH000_06\tCR\tIN\tMASTER ON CONF
CH000_07\tPB\tIN\tAUTO RUNNING
CH000_08\tPB\tIN\tMACHINE STOP
CH000_09\tPB\tIN\tCYCLE STOP
CH000_12\tPB\tIN\tFAULT RESET
CH000_13\tPH\tIN\tST3 SHUTTER-1 EXIST
CH000_14\tPH\tIN\tST3 SHUTTER-2 EXIST
CH010_01\tPH\tIN\tST3 SHUTTER-1 FLOW OUT
CH010_05\tPH\tIN\tST3 SHUTTER FULL
CH002_00\tPH\tIN\tST2 INSERT FLOW OUT
CH002_01\tPH\tIN\tST1 INSERT FLOW OUT
CH002_02\tPH\tIN\tST1 SHUTTER-1 FULL
CH002_14\tAS\tIN\tST1 STOPPER-5 CHUCK
CH002_15\tAS\tIN\tST1 STOPPER-5 UNCHUCK
CH003_00\tAS\tIN\tST3 EJECTOR FORWARD
CH003_01\tAS\tIN\tST3 EJECTOR BACKWARD
CH003_02\tAS\tIN\tST3 PUSHER FORWARD
CH003_03\tAS\tIN\tST3 PUSHER BACKWARD
CH003_04\tAS\tIN\tST2 STOPPER-1 UP
CH003_05\tAS\tIN\tST2 STOPPER-1 DOWN
CH003_06\tAS\tIN\tST1 LEFT DIVIDER BACKWARD
CH003_07\tAS\tIN\tST1 LEFT DIVIDER FORWARD
CH001_02\tPL\tOUT\tMASTER ON
CH001_03\tBZ\tOUT\tBUZZER-1
CH005_00\tCR\tOUT\tST3 EJECTOR FORWARD
CH005_01\tCR\tOUT\tST3 EJECTOR BACKWARD
CH005_02\tCR\tOUT\tST3 PUSHER FORWARD
CH005_03\tCR\tOUT\tST3 PUSHER BACKWARD
CH005_04\tCR\tOUT\tST2 STOPPER-1 UP
CH005_05\tCR\tOUT\tST2 STOPPER-1 DOWN
CH005_06\tCR\tOUT\tSOL LEFT DIVIDER BACKWARD
CH005_07\tCR\tOUT\tSOL LEFT DIVIDER FORWARD
CH006_00\tSOL\tOUT\tST1 STOPPER-5 CHUCK
CH006_01\tSOL\tOUT\tST1 STOPPER-5 UNCHUCK
CH006_07\tCR\tOUT\tPART FEEDER-1 START`;


let m=run('s_parse',{payload:IO}); m=run('s_name',m);
const v=run('s_val',m); if(v[1]){ console.log('VALIDATE ERR:',v[1].payload); process.exit(1); }
const sp=run('s_split',v[0]); console.log('SPLIT:',sp.summary);
const r=run('s_all',sp);
console.log(r.payload.stats);
if(r.payload.warnings) console.log('WARN:\n'+r.payload.warnings);
r.payload.files.forEach(f=>fs.writeFileSync('/tmp/'+f.name,f.xml));
console.log('FILES:',r.payload.files.map(f=>f.name).join(', '));

// ---- cek silang: tiap operand harus terdeklarasi di file itu (ExternalVars/Vars) ----
const files = r.payload.files.filter(f=>f.name.endsWith('.xml'));
const glob = new Set(r.payload.files.find(f=>f.name.endsWith('.tsv')).xml
    .split('\n').slice(1).map(l=>l.split('\t')[0]).filter(Boolean));
let bad = 0;
files.forEach(f=>{
    const decl = new Set([...f.xml.matchAll(/<Variable name="([^"]+)"/g)].map(m=>m[1]));
    const ops  = new Set([...f.xml.matchAll(/operand="([^"]+)"/g)].map(m=>m[1]));
    [...f.xml.matchAll(/xsi:type="DataSink" identifier="([^"]+)"/g)].forEach(m=>ops.add(m[1]));
    [...f.xml.matchAll(/instanceName="([^"]+)"/g)].forEach(m=>ops.add(m[1]));
    const base = o => o.replace(/\[[^\]]*\]$/,'');   // AL[3] -> AL
    const miss = [...ops].filter(o=>!decl.has(o) && !decl.has(base(o)) && !/^(P_On|P_Off)$/.test(o));
    const notGlobal = [...decl].filter(d=>false);
    if(miss.length){ bad++; console.log('UNDECLARED in '+f.name+':', miss.join(', ')); }
});
// cek tiap ExternalVars punya padanan di tabel global
files.forEach(f=>{
    const ext = f.xml.slice(f.xml.indexOf('<ExternalVars>'), f.xml.indexOf('</ExternalVars>'));
    const en  = [...ext.matchAll(/<Variable name="([^"]+)"/g)].map(m=>m[1]);
    const miss = en.filter(n=>!glob.has(n) && !glob.has(n.replace(/\[[^\]]*\]$/,'')));
    if(miss.length){ bad++; console.log('EXTERNAL tanpa global di '+f.name+':', miss.slice(0,10).join(', ')); }
});
console.log(bad? 'CEK GAGAL: '+bad+' masalah' : 'CEK OK: semua operand terdeklarasi, semua external punya global');

// ---- cek kontak menggantung: penyebab "import failed" di Sysmac ----
let dang = 0;
files.forEach(f=>{
    [...f.xml.matchAll(/<Rung [\s\S]*?<\/Rung>/g)].map(m=>m[0]).forEach(rg=>{
        const outs = [...rg.matchAll(/connectionPointOutId="(\d+)"/g)].map(m=>m[1]);
        const refs = new Set([...rg.matchAll(/refConnectionPointOutId="(\d+)"/g)].map(m=>m[1]));
        const unused = outs.filter(i=>!refs.has(i));
        if(unused.length){ dang++; console.log('DANGLING di '+f.name+' rung:', unused.join(',')); }
    });
});
console.log(dang? 'DANGLING GAGAL: '+dang+' rung' : 'DANGLING OK: tidak ada kontak menggantung');
