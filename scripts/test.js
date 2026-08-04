const fs=require('fs');
const path=require('path');
const flowJson=JSON.parse(fs.readFileSync(path.join(__dirname,'..','outputs','sysmac-program-generator-flow.json')));
const byId={}; flowJson.forEach(n=>byId[n.id]=n);
const run=(id,msg,flow)=>new Function('msg','flow','node','return (function(){'+byId[id].func+'})()')(msg,flow,{warn:console.warn});

const IO=`CH0_00\tPB\tIN\tNOT EMERGENCY STOP
CH0_01\tCR\tIN\tFUSE GOOD CONF
CH0_02\tCR\tIN\tAIR SOURCE CONF
CH0_03\tLS\tIN\tSAFETY CONF
CH0_04\tSS\tIN\tAUTO IND
CH0_05\tPB\tIN\tMASTER ON
CH0_06\tCR\tIN\tMASTER ON CONF
CH0_07\tPB\tIN\tAUTO RUNNING
CH0_08\tPB\tIN\tMACHINE STOP
CH0_09\tPB\tIN\tCYCLE STOP
CH0_10\tPB\tIN\tDANDORI LOCK-UNLOCK
CH0_11\tPB\tIN\tSCAN ENABLE
CH0_12\tPB\tIN\tFAULT RESET
CH0_13\tPH\tIN\tST3  SHUTTER-1 EXIST
CH0_14\tPH\tIN\tST3  SHUTTER-2 EXIST
CH0_15\tPH\tIN\tST3  SHUTTER-3 EXIST
CH0_16\tPH\tIN\tST3  SHUTTER-4 EXIST
CH0_17\tPH\tIN\tST3  SHUTTER-1 FLOW OUT
CH0_18\tPH\tIN\tST3  SHUTTER-2 FLOW OUT
CH0_19\tPH\tIN\tST3  SHUTTER-3 FLOW OUT
CH0_20\tPH\tIN\tST3  SHUTTER-4 FLOW OUT
CH0_21\tPH\tIN\tST3  SHUTTER FULL
CH1_00\tCR\tOUT\tEMERGENCY STOP INTERLOCK
CH1_01\tPL\tOUT\tAUTO RUNNING
CH1_02\tPL\tOUT\tMASTER ON
CH1_03\tBZ\tOUT\tBUZZER-1
CH1_04\tPL\tOUT\tTOWER LAMP RED
CH1_05\tPL\tOUT\tTOWER LAMP YELLOW
CH1_06\tPL\tOUT\tTOWER LAMP GREEN
CH1_08\tPL\tOUT\t2PB DANDORI LOCK-UNLOCK
CH1_09\tPL\tOUT\t2PB SCAN ENABLE
CH1_10\tPL\tOUT\t2PB FAULT
CH1_11\tBZ\tOUT\t2PB BUZZER-2
CH1_12\tPL\tOUT\t2PB KANBAN  OK
CH1_13\tPL\tOUT\t2PB KANBAN  NG
CH1_14\tPL\tOUT\t2PB TRACE  OK
CH1_15\tPL\tOUT\t2PB TRACE  NG
CH2_00\tPH\tIN\tST2 INSERT FLOW OUT
CH2_01\tPH\tIN\tST1 INSERT FLOW OUT
CH2_02\tPH\tIN\tST1  SHUTTER-1 FULL
CH2_03\tPH\tIN\tST1  SHUTTER-2 FULL
CH2_04\tPH\tIN\tST1  SHUTTER-3 FULL
CH2_05\tPH\tIN\tST1  SHUTTER-4 FULL
CH2_14\tAS\tIN\tST1 STOPPER-5 CHUCK
CH2_15\tAS\tIN\tST1 STOPPER-5 UNCHUCK
CH3_00\tAS\tIN\tST3 EJECTOR FORWARD
CH3_01\tAS\tIN\tST3 EJECTOR BACKWARD
CH3_02\tAS\tIN\tST3 PUSHER FORWARD
CH3_03\tAS\tIN\tST3 PUSHER BACKWARD
CH3_04\tAS\tIN\tST2 STOPPER-1 UP
CH3_05\tAS\tIN\tST2 STOPPER-1 DOWN
CH3_06\tAS\tIN\tST1 LEFT DIVIDER BACKWARD
CH3_07\tAS\tIN\tST1 LEFT DIVIDER FORWARD
CH3_08\tAS\tIN\tST1 RIGHT DIVIDER BACKWARD
CH3_09\tAS\tIN\tST1 RIGHT DIVIDER FORWARD
CH3_10\tAS\tIN\tST1 STOPPER-2 CHUCK
CH3_11\tAS\tIN\tST1 STOPPER-2 UNCHUCK
CH3_12\tAS\tIN\tST1 STOPPER-3 CHUCK
CH3_13\tAS\tIN\tST1 STOPPER-3 UNCHUCK
CH3_14\tAS\tIN\tST1 STOPPER-4 CHUCK
CH3_15\tAS\tIN\tST1 STOPPER-4 UNCHUCK
CH5_00\tCR\tOUT\tST3  EJECTOR FORWARD
CH5_01\tCR\tOUT\tST3  EJECTOR BACKWARD
CH5_02\tCR\tOUT\tST3  PUSHER FORWARD
CH5_03\tCR\tOUT\tST3  PUSHER BACKWARD
CH5_04\tCR\tOUT\tST2  STOPPER-1 UP
CH5_05\tCR\tOUT\tST2  STOPPER-1 DOWN
CH5_06\tCR\tOUT\tST1 LEFT DIVIDER BACKWARD
CH5_07\tCR\tOUT\tST1 LEFT DIVIDER FORWARD
CH5_08\tCR\tOUT\tST1 RIGHT DIVIDER BACKWARD
CH5_09\tCR\tOUT\tST1 RIGHT DIVIDER FORWARD
CH5_10\tSOL\tOUT\tST1 STOPPER-2 CHUCK
CH5_11\tSOL\tOUT\tST1  STOPPER-2 UNCHUCK
CH5_12\tSOL\tOUT\tST1  STOPPER-3 CHUCK
CH5_13\tSOL\tOUT\tST1  STOPPER-3 UNCHUCK
CH5_14\tSOL\tOUT\tST1  STOPPER-4 CHUCK
CH5_15\tSOL\tOUT\tST1  STOPPER-4 UNCHUCK
CH6_00\tSOL\tOUT\tST1  STOPPER-5 CHUCK
CH6_01\tSOL\tOUT\tST1  STOPPER-5 UNCHUCK
CH6_02\tSOL\tOUT\tST1 DANDORI  TYPE-1 LOCK
CH6_03\tSOL\tOUT\tST1 DANDORI  TYPE-1 UNLOCK
CH6_04\tSOL\tOUT\tST1 DANDORI  TYPE-2 LOCK
CH6_05\tSOL\tOUT\tST1 DANDORI  TYPE-2 UNLOCK
CH6_07\tCR\tOUT\tST1 PART FEEDER-1 START
CH6_08\tCR\tOUT\tST1 PART FEEDER-2 START`;

// ---- cek silang + dangling-contact, dipakai buat kedua skenario (stub dan motion-sequence) ----
function validate(label, files) {
    const xmlFiles = files.filter(f=>f.name.endsWith('.xml'));
    const glob = new Set(files.find(f=>f.name.endsWith('.tsv')).xml
        .split('\n').slice(1).map(l=>l.split('\t')[0]).filter(Boolean));
    let bad = 0;
    xmlFiles.forEach(f=>{
        const decl = new Set([...f.xml.matchAll(/<Variable name="([^"]+)"/g)].map(m=>m[1]));
        const ops  = new Set([...f.xml.matchAll(/operand="([^"]+)"/g)].map(m=>m[1]));
        [...f.xml.matchAll(/xsi:type="DataSink" identifier="([^"]+)"/g)].forEach(m=>ops.add(m[1]));
        [...f.xml.matchAll(/instanceName="([^"]+)"/g)].forEach(m=>ops.add(m[1]));
        const base = o => o.replace(/\[[^\]]*\]$/,'');   // AL[3] -> AL
        const miss = [...ops].filter(o=>!decl.has(o) && !decl.has(base(o)) && !/^(P_On|P_Off)$/.test(o));
        if(miss.length){ bad++; console.log('['+label+'] UNDECLARED in '+f.name+':', miss.join(', ')); }
    });
    xmlFiles.forEach(f=>{
        const ext = f.xml.slice(f.xml.indexOf('<ExternalVars>'), f.xml.indexOf('</ExternalVars>'));
        const en  = [...ext.matchAll(/<Variable name="([^"]+)"/g)].map(m=>m[1]);
        const miss = en.filter(n=>!glob.has(n) && !glob.has(n.replace(/\[[^\]]*\]$/,'')));
        if(miss.length){ bad++; console.log('['+label+'] EXTERNAL tanpa global di '+f.name+':', miss.slice(0,10).join(', ')); }
    });
    console.log('['+label+']', bad? 'CEK GAGAL: '+bad+' masalah' : 'CEK OK: semua operand terdeklarasi, semua external punya global');

    let dang = 0;
    xmlFiles.forEach(f=>{
        [...f.xml.matchAll(/<Rung [\s\S]*?<\/Rung>/g)].map(m=>m[0]).forEach(rg=>{
            const outs = [...rg.matchAll(/connectionPointOutId="(\d+)"/g)].map(m=>m[1]);
            const refs = new Set([...rg.matchAll(/refConnectionPointOutId="(\d+)"/g)].map(m=>m[1]));
            const unused = outs.filter(i=>!refs.has(i));
            if(unused.length){ dang++; console.log('['+label+'] DANGLING di '+f.name+' rung:', unused.join(',')); }
        });
    });
    console.log('['+label+']', dang? 'DANGLING GAGAL: '+dang+' rung' : 'DANGLING OK: tidak ada kontak menggantung');
    return bad===0 && dang===0;
}

// ---- bongkar 1 rung (dicari lewat komennya) jadi list objek {type,op,neg,ins,out} ----
// Buat ngecek TOPOLOGI rung, bukan cuma "operand-nya ada": di rung latch, titik sambung seal
// (nyambung balik ke rail? ke output kontak yang mana?) itu yang nentuin latch-nya bener atau
// gak pernah reset - dan itu gak keliatan sama sekali dari daftar operand.
function rungObjs(xml, cmtRe) {
    const m = xml.match(new RegExp('<Rung[^>]*>(?:(?!</Rung>)[\\s\\S])*?' + cmtRe + '[\\s\\S]*?</Rung>'));
    if (!m) return [];
    return [...m[0].matchAll(/xsi:type="(Contact|Coil)"( negated="true")? operand="([^"]*)"><ConnectionPointIn>((?:<Connection refConnectionPointOutId="\d+" \/>)*)<\/ConnectionPointIn><ConnectionPointOut connectionPointOutId="(\d+)"/g)]
        .map(o => ({ type:o[1], op:o[3], neg:!!o[2], ins:[...o[4].matchAll(/"(\d+)"/g)].map(x=>x[1]), out:o[5] }));
}

// ---- pipeline: parse -> genname -> validate -> split -> generate, flow context bisa diseed ----
// (motionSequences diisi manual di sini buat simulasikan apa yang bakal disetel user lewat
// UI "Motion Sequence" di index.html sebelum klik Regenerate)
function runPipeline(seed) {
    const ctx = Object.assign({}, seed);
    const flow = {get:k=>ctx[k], set:(k,v)=>ctx[k]=v};
    let m=run('s_parse',{payload:IO},flow); m=run('s_name',m,flow);
    const v=run('s_val',m,flow); if(v[1]){ console.log('VALIDATE ERR:',v[1].payload); process.exit(1); }
    const sp=run('s_split',v[0],flow); console.log('SPLIT:',sp.summary);
    const r=run('s_all',sp,flow);
    console.log(r.payload.stats);
    if(r.payload.warnings) console.log('WARN:\n'+r.payload.warnings);
    console.log('FILES:',r.payload.files.map(f=>f.name).join(', '));
    return r.payload;
}

// Skenario 1: tanpa motionSequences - AutoRunning tiap station harus tetap placeholder lama
// (regresi nol). Dataset ST1 sekarang 9 actuator/6 AS-pair - sebelum AL/MF block dinamis ini
// bikin "MF motion-fault block full" (block lama cuma 4 slot tetap per station).
console.log('=== Skenario stub (belum diatur motion sequence) ===');
const stub = runPipeline({});
const outdir=path.join(__dirname,'..','outputs'); fs.mkdirSync(outdir,{recursive:true});
stub.files.forEach(f=>fs.writeFileSync(path.join(outdir,f.name),f.xml));
const okStub = validate('stub', stub.files);
const noMfFull = !/MF motion-fault block full/.test(stub.warnings||'');
console.log(noMfFull ? 'MF BLOCK OK: semua actuator ST1 kebagian slot (block dinamis)'
                      : 'MF BLOCK GAGAL: masih ada actuator yang gak kebagian slot');

// START MOTION PROCESS - cek TITIK SAMBUNG seal-nya, bukan cuma daftar operand (Autorun.cxr):
//   LB400_A: seal LB400_A dari RAIL, ketemu jalur trigger (LB309 -/LB499 -/CYCLE_STOP) tepat di
//            input AUTO_RUN -> LB499/CYCLE_STOP cuma nge-block start, gak mutus seal; yang mutus
//            cuma AUTO_RUN drop / LB400_B nyala. Kalau seal-nya kesambung di input LB499 (bekas
//            latch() generik), LB499 ikut mutus seal -> pasangan LB400_A/LB400_B salah reset.
//   LB400_B: seal LB400_B dari RAIL paralel (LB499 AND LB400), LB400_A jadi GATE di ujung ->
//            LB400_B ikut drop pas LB400_A drop. Kalau seal-nya nyambung setelah LB499 dan
//            LB400_A ikut ke-bypass seal, LB400_B nyangkut nyala.
const stubSt1 = stub.files.find(f=>f.name==='Prg010_ST1.xml');
const objA = rungObjs(stubSt1.xml, 'Start motion process: unit seal auto motion start');
const fA = op => objA.filter(o=>o.op===op);
const aSeal=fA('LB400_A')[0], aCoil=objA.find(o=>o.type==='Coil'&&o.op==='LB400_A');
const aCyc=fA('CYCLE_STOP')[0], aAuto=fA('AUTO_RUN')[0], aDone=fA('LB400_B')[0];
const sealAOk = !!(aSeal && aCoil && aCyc && aAuto && aDone) && aSeal.type==='Contact'
    && aSeal.ins.join()==='1' && aCyc.neg && aDone.neg
    && aAuto.ins.length===2 && aAuto.ins.includes(aSeal.out) && aAuto.ins.includes(aCyc.out)
    && aDone.ins.join()===aAuto.out && aCoil.ins.join()===aDone.out;
const objB = rungObjs(stubSt1.xml, 'Start motion process: unit seal motion completed');
const fB = op => objB.filter(o=>o.op===op);
const bSeal=fB('LB400_B')[0], bCoil=objB.find(o=>o.type==='Coil'&&o.op==='LB400_B');
const b400=fB('LB400')[0], bGate=fB('LB400_A')[0];
const sealBOk = !!(bSeal && bCoil && b400 && bGate) && bSeal.type==='Contact'
    && bSeal.ins.join()==='1' && bGate.ins.length===2
    && bGate.ins.includes(bSeal.out) && bGate.ins.includes(b400.out)
    && bCoil.ins.join()===bGate.out;
console.log((sealAOk && sealBOk) ? 'START MOTION SEAL OK: LB400_A seal masuk di AUTO_RUN, LB400_B seal dari rail + gate LB400_A'
                                 : 'START MOTION SEAL GAGAL: titik sambung seal LB400_A/LB400_B salah posisi');

// Skenario 2: motionSequences bentuk baru - LIST OF VARIANTS per station, tiap varian punya
// condition gate opsional + graph sendiri (PATTERN 3 condition-select).
// Variant 1 (ST1, tanpa condition = selalu aktif): linear + fork (n1/n3 paralel dari LB400) +
//   AND-join (n4 nunggu n2 dan n3) + OR-gate (n5: n2 OR GSB000, gaya akses Condition/sensor).
// Variant 2 (ST1, condition "LB300"): sequence terpisah pakai actuator lain (divider), cuma
//   aktif kalau LB300 true - buktiin condition-gating dan multi-varian jalan bareng di 1 station.
console.log('\n=== Skenario motion sequence multi-varian (ST1: 2 varian, fork+AND+OR) ===');
const seeded = runPipeline({ motionSequences: { ST1: [
    { condition: '', nodes: [
        { id:'n1', sol:'SOL_ST1_STP5_CHK',  after:[],              join:'AND' },
        { id:'n2', sol:'SOL_ST1_STP5_UCHK', after:['n1'],          join:'AND' },
        { id:'n3', sol:'SOL_ST1_STP2_CHK',  after:[],              join:'AND' },
        { id:'n4', sol:'SOL_ST1_STP2_UCHK', after:['n2','n3'],     join:'AND' },
        { id:'n5', sol:'SOL_ST1_STP3_CHK',  after:['n2','GSB000'], join:'OR'  },
    ] },
    { condition: 'LB300', nodes: [
        { id:'m1', sol:'CR_ST1_LFT_DIV_FWD', after:[],     join:'AND' },
        { id:'m2', sol:'CR_ST1_LFT_DIV_BWD', after:['m1'], join:'AND' },
    ] },
] } });
const okSeeded = validate('seeded', seeded.files);

// AutoRunning wajib punya semua 7 rung "Motion N" (5 varian-1 + 2 varian-2), rung Join AND dan OR,
// dan varian ber-condition (LB300) wajib pakai PATTERN 3 mutual-exclusion group DALAM 1 RUNG:
// LB400 gerbang bareng di depan, lalu (LB300 OR seal LB401) nge-OR ke coil LB401 sendiri (varian
// ber-condition PERTAMA = LB401, terlepas dari posisi mentahnya di array variants) - bukan rung
// sample terpisah, bukan placeholder stub lama.
const st1 = seeded.files.find(f=>f.name==='Prg010_ST1.xml');
const hasAllMotions = st1 && [1,2,3,4,5,6,7].every(n => new RegExp('Motion '+n+': ').test(st1.xml));
const hasJoins = st1 && /Join \(AND\)/.test(st1.xml) && /Join \(OR\)/.test(st1.xml);
const mxRungMatch = st1 && st1.xml.match(/<Rung[^>]*>(?:(?!<\/Rung>)[\s\S])*?Unit motion condition running \(mutual exclusion\)[\s\S]*?<\/Rung>/);
const mxRung = mxRungMatch ? mxRungMatch[0] : '';
const hasLatch = /Unit motion condition running \(mutual exclusion\).*LB300/.test(mxRung) && /<Variable name="LB401">/.test(st1.xml);
// Satu rung: LB400 gerbang di depan operand LB300 (bukan rung sample terpisah), dan coil LB401
// punya 2 connection masuk (LB300 DAN seal LB401 sendiri, OR-merge langsung ke coil).
const gateOrder = /operand="LB400"[\s\S]*?operand="LB300"/.test(mxRung);
const oneRung = !/Sample condition at cycle start/.test(st1.xml);
const sealsIntoCoil = /<LdObject xsi:type="Coil"[^>]*operand="LB401"[^>]*><ConnectionPointIn>(?:<Connection[^>]*\/>){2}<\/ConnectionPointIn>/.test(mxRung);
const usedRealSequence = hasAllMotions && hasJoins && hasLatch && gateOrder && oneRung && sealsIntoCoil && !/Motion steps to be written here/.test(st1.xml);
console.log(usedRealSequence ? 'MOTION SEQUENCE OK: ST1 pakai 2 varian (fork+AND+OR+condition select-latch), bukan stub'
                              : 'MOTION SEQUENCE GAGAL: ST1 masih stub atau graph gak lengkap kepakai');

// Skenario 3: conditionDefs - Condition section dinamis, bukan 3 slot cadangan generik. LB300 = OR
// dari 2 AND-group (persis pola Denso PATTERN 3 dari screenshot: "(A AND B ANDNOT C) OR (D AND E)"),
// LB301 = 1 AND-group doang, ikut makein LB300 sebagai salah satu term-nya (referensi silang antar
// Condition, buktiin urutan declare gak masalah). Term dikirim sebagai OBJECT {bit,neg} - PERSIS
// bentuk yang beneran dikirim build_html.py (conditionDefsToJSON/regenerate), BUKAN [bit,neg] array
// pair - kepakean object-shape ini nemuin bug asli (gen_all.js awalnya expect array pair, c[0]/c[1]
// di object jadi undefined, semua term keluar sebagai operand "undefined" pas diimport user).
console.log('\n=== Skenario conditionDefs (Condition section dinamis, OR-of-AND-groups) ===');
const seededCond = runPipeline({ conditionDefs: { ST1: [
    { name: 'P&P Take Out Lowering Auto Start Condition', groups: [
        [{bit:'LB206',neg:false},{bit:'LB211',neg:false},{bit:'LB1000',neg:true},{bit:'LB175',neg:false}],
        [{bit:'LB202',neg:false},{bit:'LB203',neg:false}],
    ] },
    { name: 'Lowering Insert Auto Start Condition', groups: [
        [{bit:'LB206',neg:false},{bit:'LB211',neg:false},{bit:'LB300',neg:false}],
    ] },
] } });
const okSeededCond = validate('conditionDefs', seededCond.files);
const st1c = seededCond.files.find(f=>f.name==='Prg010_ST1.xml');
const hasNamedConds = st1c && /<Variable name="LB300">.*?P&amp;P Take Out Lowering Auto Start Condition/.test(st1c.xml.replace(/\n/g,''));
const hasOrOfAnd = st1c && /P&amp;P Take Out Lowering Auto Start Condition/.test(st1c.xml) && /Lowering Insert Auto Start Condition/.test(st1c.xml);
const noOldSpareStub = st1c && !/Unit motion conditions, spare slots to be defined per product type/.test(st1c.xml);
// Kritis: cek TIAP term-nya beneran muncul sebagai operand aslinya di rung, bukan cuma nama Condition-nya
// doang. Kalau shape-mismatch kejadian lagi, operand bakal jadi literal "undefined" - dicek eksplisit gak boleh ada.
const termNames = ['LB206','LB211','LB1000','LB175','LB202','LB203'];
const hasAllTermOperands = st1c && termNames.every(function(b){ return new RegExp('operand="'+b+'"').test(st1c.xml); });
const noUndefinedOperand = st1c && !/operand="undefined"/.test(st1c.xml) && !/<Variable name="undefined">/.test(st1c.xml);
const usedConditionDefs = hasNamedConds && hasOrOfAnd && noOldSpareStub && hasAllTermOperands && noUndefinedOperand;
console.log(usedConditionDefs ? 'CONDITION DEFS OK: bit bernama + OR-of-AND-groups kepakai (term operand bener, bukan "undefined")'
                               : 'CONDITION DEFS GAGAL: masih fallback ke spare generik, nama gak nyantol, atau term jadi "undefined"');
if(!hasAllTermOperands || !noUndefinedOperand) console.log('  term operands found:', [...(st1c ? st1c.xml.matchAll(/operand="([^"]+)"/g) : [])].map(m=>m[1]).filter(o=>!/^(LB105|LB160|AUTO_MODE)$/.test(o)).join(', '));

// Skenario 4: condition varian diketik SAMA kayak coil mutual-exclusion-nya sendiri (LB401/LB402) -
// kasus data-entry yang bikin "LB401 nge-hold LB401": trigger dan seal bit yang sama, latch-nya gak
// akan pernah bisa nyala dari luar. Harus auto-remap ke bit Condition section (LB300, LB301, ...)
// plus warning, bukan digambar apa adanya.
console.log('\n=== Skenario condition = coil-nya sendiri (harus auto-remap ke LB300/LB301) ===');
const seededTypo = runPipeline({ motionSequences: { ST1: [
    { condition: 'LB401', nodes: [ { id:'a1', sol:'CR_ST1_LFT_DIV_FWD', after:[], join:'AND' } ] },
    { condition: 'LB402', nodes: [ { id:'b1', sol:'CR_ST1_LFT_DIV_BWD', after:[], join:'AND' } ] },
] } });
const okSeededTypo = validate('condition-typo', seededTypo.files);
const st1t = seededTypo.files.find(f=>f.name==='Prg010_ST1.xml');
const mxObjs = rungObjs(st1t.xml, 'Unit motion condition running \\(mutual exclusion\\)');
const mxGate = mxObjs.find(o=>o.op==='LB400');
// Kontak yang nyambung langsung ke output gate LB400 = trigger + seal tiap baris. Harus persis
// 4 (2 baris x [trigger LB30x, seal LB40x]) - trigger-nya LB300/LB301, seal-nya LB401/LB402,
// dan LB401/LB402 GAK BOLEH muncul dua kali di situ (itu tanda dia jadi trigger-nya sendiri).
const mxHead = mxGate ? mxObjs.filter(o=>o.type==='Contact' && o.ins.join()===mxGate.out).map(o=>o.op) : [];
const cnt = op => mxHead.filter(x=>x===op).length;
const remapped = mxHead.length===4 && cnt('LB300')===1 && cnt('LB301')===1 && cnt('LB401')===1 && cnt('LB402')===1;
const warnedRemap = /remapped to LB300/.test(seededTypo.warnings||'') && /remapped to LB301/.test(seededTypo.warnings||'');
const remapDeclared = /<Variable name="LB300">/.test(st1t.xml) && /<Variable name="LB301">/.test(st1t.xml);
const typoOk = remapped && warnedRemap && remapDeclared;
console.log(typoOk ? 'CONDITION REMAP OK: trigger jadi LB300/LB301 (bukan LB401 nge-hold LB401), ada warning + deklarasi'
                   : 'CONDITION REMAP GAGAL: trigger mutual-exclusion masih coil-nya sendiri atau gak kedeklarasi');
if(!typoOk) console.log('  kontak di output gate LB400:', mxHead.join(', '));

if(!okStub || !noMfFull || !sealAOk || !sealBOk || !okSeeded || !usedRealSequence
   || !okSeededCond || !usedConditionDefs || !okSeededTypo || !typoOk) process.exit(1);
