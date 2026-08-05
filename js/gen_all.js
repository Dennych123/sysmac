// ===== Generate program XML per station + main, jumlah unit dinamis =====
var groups   = flow.get("groups") || {};
var PER_PAGE = 8;
var files = [], warnings = [], lscAudit = [];
var GLOBALS = {};
// Timer default (debounce PH/PX, motion-fault) bisa disetel lewat web UI - format harus "T#<angka><unit>"
// (MS/S/M/H), soalnya nilainya ditempel LANGSUNG jadi XML attribute tanpa escape (lihat lib.js ton()) -
// input sembarangan bisa ngerusak XML, jadi divalidasi ketat, salah format jatuh ke default + warning.
var timerDefaults = flow.get("timerDefaults") || {};
function validTimer(v, fallback, label){
    v=(v||"").trim();
    if(!v) return fallback;
    if(!/^T#\d+(\.\d+)?(MS|S|M|H)$/i.test(v)){ warnings.push('Timer default '+label+' "'+v+'" invalid format (expected e.g. T#200MS), using default '+fallback+'.'); return fallback; }
    return v.toUpperCase();
}
var T_PHPX   = validTimer(timerDefaults.phpx, "T#200MS", "PH/PX debounce");
var T_MOTION = validTimer(timerDefaults.motion, "T#5S", "motion fault");
var ARRAY_ELEMENTS = {}; // "AL[61]" -> comment, buat baris per elemen di GlobalVariables.tsv

// Nama status global mengikuti standar Ndeso (MSTR_RDY, bukan MSTR_READY)
var MAIN_EXPORTS = ["PWR_ON","PLC_GOOD","AUTO_MODE","IND_MODE","NO_FAULT","HOME_POST","AUTO_RUN","CYCLE_STOP","MSTR_RDY"];

function stripAS(n){ return n.replace(/^AS_/,""); }
function pad(n,w){ return ("0000"+n).slice(-w); }
// Token komen buat matching sensor. Dipecah per KATA (spasi) doang, tanda baca di dalam kata dibuang tapi
// angkanya tetap nempel ke kata induknya: "STOPPER-2" -> "STOPPER2", bukan ["STOPPER","2"]. Dua alasan:
//  1. angka itu satu-satunya pembeda antar unit sejenis (STOPPER-2 vs STOPPER-5, POSITION-1 vs POSITION-2).
//     Dulu kepecah lalu kebuang filter length>2, semua kandidat seri skor dan yang menang cuma yang paling
//     awal di daftar I/O - salah sambung tanpa warning.
//  2. kalau angkanya jadi token lepas, "TYPE-2"/"FEEDER-2" ikut nyantol ke "STOPPER-2" cuma gara-gara
//     sama-sama punya "2" - cukup buat nembus ambang skor>=2 padahal gak ada hubungannya.
// Gak ada filter panjang: kata arah 2 huruf (UP, DN, IN) justru sering jadi satu-satunya pembeda.
// Aturan pecah katanya sengaja sama persis sama buildName() di genname.js biar konsisten sama penamaan.
function cmtTokens(d){ return (d.komen||"").toUpperCase().split(/\s+/).map(function(w){ return w.replace(/[^A-Z0-9]/g,""); }).filter(Boolean); }
function cmtScore(x,y){ var a1=cmtTokens(x),b1=cmtTokens(y),m=0; a1.forEach(function(w){ if(b1.indexOf(w)>=0) m++; }); return m; }
// Stem nama tanpa prefix jenis. genname.js nurunin nama dari komen doang (prefix cuma ikut jenis), jadi
// sensor dan aktuator dari komen yang sama pasti sestem: SOL_ST1_STP2_CHK <-> AS_ST1_STP2_CHK.
// CR ikut dilucuti: aktuator gak selalu jenis SOL, solList emang nerima CR juga (mis. ST2 STOPPER-1 UP).
function nameStem(n){ return (n||"").replace(/^(?:SOL|SRV|AS|LSC|LS|CR)_/,""); }

// Cari LSC (limit switch combination) buat device (dipakai buat motion fault dan AutoRunning).
// Exact stem match duluan (deterministik), fuzzy komen cuma fallback kalau penamaannya beda.
function findLsc(dev,asPairs){
    var target=nameStem(dev.name), exact=null;
    asPairs.forEach(function(p){
        p.forEach(function(asDev){
            if(!exact && nameStem(asDev.name)===target) exact="LSC_"+stripAS(asDev.name);
        });
    });
    if(exact){ lscAudit.push(dev.komen+" -> "+exact+" (exact name stem)"); return exact; }

    var best=null,bestScore=0,tied=[];
    asPairs.forEach(function(p){
        p.forEach(function(asDev){
            var s=cmtScore(dev,asDev), nm="LSC_"+stripAS(asDev.name);
            if(s<2) return;
            if(s>bestScore){ bestScore=s; best=nm; tied=[nm]; }
            else if(s===bestScore && tied.indexOf(nm)<0){ tied.push(nm); }
        });
    });
    if(best){
        lscAudit.push(dev.komen+" -> "+best+" (score "+bestScore+")");
        // Seri skor = matcher gak punya dasar buat milih, cuma kepilih gara-gara urutan I/O. Ini yang dulu
        // bikin STOPPER-2/3/4 semua nyantol ke sensor STOPPER-5 tanpa satupun warning keluar.
        if(tied.length>1) warnings.push('LSC match for "'+dev.komen+'" is AMBIGUOUS: '+tied.length+' candidates tied at score '+bestScore+' ('+tied.join(", ")+'), picked "'+best+'" by I/O order only - verify manually.');
        else if(bestScore===2) warnings.push('LSC match for "'+dev.komen+'" -> "'+best+'" is low-confidence (score 2, only 2 shared comment words) - verify manually.');
    }
    return best;
}
function pairUp(l){ var p=[]; for(var i=0;i<l.length;i+=2){ if(l[i+1]) p.push([l[i],l[i+1]]); } return p; }
function AL(n,cmt){ var t="AL["+n+"]"; if(cmt) ARRAY_ELEMENTS[t]=cmt; return t; }
function MF(n,cmt){ var t="MF["+n+"]"; if(cmt) ARRAY_ELEMENTS[t]=cmt; return t; }
// Nama station custom (opsional, disetel di panel "Pengaturan" web UI) - dipakein ke SEMUA komen yang
// nyebut identitas station (bukan cuma LB400_A/B), termasuk broadcast status lintas-program (MAIN dan
// station lain), biar konsisten satu ladder gak setengah-setengah ada nama setengah cuma "ST1".
var stationNamesMap = flow.get("stationNames") || {};
function labelOf(k){ var n=(stationNamesMap[k]||"").trim(); return k+(n?(" "+n):""); }
// Susmax Program name gak boleh ada spasi (ganti underscore), cuma alfanumerik+underscore aman -
// dipakai buat akhiran nama Program/ContentHeader DAN nama file download-nya (Prg010_ST1_ConveyorFeed).
function sanitizeIdent(s){ return (s||"").trim().replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,""); }

// urutan station dinamis: apa saja yang muncul di komen
var ukeys = Object.keys(groups).filter(function(k){ return k!=="MAIN" && groups[k].length; })
                  .sort(function(a,b){ return parseInt(a.replace(/\D/g,""),10)-parseInt(b.replace(/\D/g,""),10); });
var STMAP = {};
ukeys.forEach(function(k,i){
    var n = parseInt(k.replace(/\D/g,""),10) || (i+1);
    var nameSuffix = sanitizeIdent(stationNamesMap[k]);
    STMAP[k] = { prg:"Prg"+pad(10+i,3)+"_"+k+(nameSuffix?("_"+nameSuffix):""), gb:"GB"+pad(10+i,3), n:n };
});

// AL/MF: index 1..AL_MAIN_RESERVED buat alarm MAIN, sisanya blok per station UKURAN DINAMIS
// (persis sebesar jumlah AS-pair / actuator-pair station itu sendiri) - bukan lebar tetap, biar
// station dengan banyak actuator gak kehabisan slot dan station kecil gak buang-buang array.
var AL_MAIN_RESERVED = 10;
var AL_BLOCK = {}, MF_BLOCK = {};
(function computeArrayBlocks(){
    var alCursor = AL_MAIN_RESERVED, mfCursor = 0;
    ukeys.forEach(function(k){
        var devs = groups[k];
        var asCount = pairUp(devs.filter(function(d){return d.jenis==="AS";}).sort(function(a,b){return a.row-b.row;})).length;
        // servo SRV_CMD itu mandiri (1 MF slot per command, gak dipair) - beda dari actus yang 1 pair = 1 slot
        var actCount = pairUp(devs.filter(function(d){return d.io==="OUT" && (d.jenis==="CR"||d.jenis==="SOL");})).length
                     + devs.filter(function(d){return d.io==="OUT" && d.jenis==="SRV_CMD";}).length;
        // Alarm yang dipasang user lewat blok "alarm" di flowchart AutoRunning ikut makan slot AL,
        // jadi HARUS kehitung di sini. Kalau enggak, blok station kekecilan dan alarm flowchart-nya
        // bakal ke-skip gara-gara "AL alarm block full" padahal array-nya masih bisa digedein.
        var alarmCount = 0;
        (((flow.get("motionSequences")||{})[k])||[]).forEach(function(v){
            ((v&&v.nodes)||[]).forEach(function(n){ if(n && n.type==="alarm") alarmCount++; });
        });
        AL_BLOCK[k] = { start: alCursor+1, end: alCursor+asCount+alarmCount };
        alCursor += asCount + alarmCount;
        MF_BLOCK[k] = { start: mfCursor+1, end: mfCursor+actCount };
        mfCursor += actCount;
    });
    AL_SIZE = Math.max(100, alCursor);
    MF_SIZE = Math.max(16, mfCursor);
})();
var AL_TYPE = "ARRAY[1.."+AL_SIZE+"] OF BOOL";
var MF_TYPE = "ARRAY[1.."+MF_SIZE+"] OF BOOL";

// ============================================================ UNIT
function buildUnit(stKey, devs){
    var inf=STMAP[stKey], GB=inf.gb, SN=inf.n;
    var stLabel=labelOf(stKey);
    var inputs  = devs.filter(function(d){return d.io==="IN";});
    var outputs = devs.filter(function(d){return d.io==="OUT";});
    var phpx    = inputs.filter(function(d){return d.jenis==="PH"||d.jenis==="PX";});
    var asPairs = pairUp(devs.filter(function(d){return d.jenis==="AS";}).sort(function(a,b){return a.row-b.row;}));
    var solList = outputs.filter(function(d){return d.jenis==="CR"||d.jenis==="SOL";});
    var actus   = pairUp(solList);
    if(solList.length%2) warnings.push(stKey+": solenoid count is odd, last output is not paired into an actuator.");

    // Servo N-posisi (SRV_CMD/SRV_LS): tiap CMD itu aktuator MANDIRI (satu output, satu feedback),
    // BUKAN pasangan FWD/BWD dual-sensor kayak actus - gak lewat pairUp, dicocokin ke SRV_LS yang
    // komennya PALING mirip (skor tertinggi menang, bukan skor>=2 kayak findLsc biasa - kandidat servo
    // biasanya banyak kata sama, cuma beda 1 kata arah/posisi, jadi butuh presisi match tertinggi).
    var srvCmds = outputs.filter(function(d){return d.jenis==="SRV_CMD";});
    var srvLsList = inputs.filter(function(d){return d.jenis==="SRV_LS";});
    var srvActus = srvCmds.map(function(cmd){
        var best=null, bestScore=-1, tied=[];
        srvLsList.forEach(function(ls){
            var m=cmtScore(cmd,ls);
            if(m>bestScore){ bestScore=m; best=ls; tied=[ls.name]; }
            else if(m===bestScore && tied.indexOf(ls.name)<0){ tied.push(ls.name); }
        });
        if(bestScore>0 && tied.length>1) warnings.push(stKey+': servo feedback for "'+cmd.komen+'" is AMBIGUOUS: '+tied.length+' candidates tied at score '+bestScore+' ('+tied.join(", ")+'), picked "'+best.name+'" by I/O order only - verify manually.');
        return { cmd:cmd, ls:(bestScore>0?best:null) };
    });
    var srvLscOf={}; srvActus.forEach(function(sa){ if(sa.ls) srvLscOf[sa.cmd.name]=sa.ls.name; });

    // Override per-aktuator (disetel di panel web "Confirm mode") - openloop: sengaja gak ada sensor
    // (mis. DANDORI LOCK, PART FEEDER START), skip fault-detection + skip warning sama sekali. manual:
    // findLsc auto-match salah/gak yakin, user nunjuk langsung bit konfirmasinya. Key-nya nama device
    // pertama di actus pair (sama kayak yang dipakein di pesan warning-nya).
    var actuatorOverrides = flow.get("actuatorOverrides") || {};

    var ext=[],priv=[],glob=[],seen={},pseen={},nameCI={};
    // Susmax Studio nolak 2 variable yang beda cuma di huruf besar/kecil (mis. "LB232" vs "lb232")
    // sebagai "name already used" - simbol private/external eksternal (mis. bit condition yang
    // diketik user via node "+ Condition/bit") bisa kebetulan nabrak bit auto-generated (mis.
    // interlock Individual). Dedup case-insensitive di sini, nama pertama yang menang.
    function G(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; seen[n]=1; var v=vr(n,t,d); glob.push("      "+v); ext.push("      "+v); GLOBALS[n]={t:t||"BOOL",d:d||""}; }
    function P(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; pseen[n]=1; priv.push("      "+vr(n,t,d)); }
    G("GSB000","BOOL","Equipment design coil, constant ON");
    MAIN_EXPORTS.forEach(function(n){ G(n,"BOOL","Machine status from main program"); });
    G("AL",AL_TYPE,"Alarm bit table"); G("MF",MF_TYPE,"Cylinder motion fault table");
    var allDevs=[]; Object.keys(groups).forEach(function(k){ allDevs=allDevs.concat(groups[k]); });
    allDevs.forEach(function(d){ G(portName(d.address),"BOOL",d.komen); G(d.name,"BOOL",d.komen); });

    // 1. Station_Input : khusus komunikasi antar unit
    var S1=[],o=1;
    var others = ukeys.filter(function(k){ return k!==stKey; });
    others.forEach(function(k,i){
        var g=STMAP[k].gb, lb1="LB"+pad(70+i*2,3), lb2="LB"+pad(71+i*2,3);
        P(lb1,"BOOL",labelOf(k)+" reported at home position"); P(lb2,"BOOL",labelOf(k)+" reported cycle complete");
        G(g+"_00","BOOL",labelOf(k)+" unit at home position"); G(g+"_20","BOOL",labelOf(k)+" automatic operation complete");
        S1.push(series(o++,[[g+"_00",false]],lb1, i===0?"Status exchanged between unit programs":null));
        S1.push(series(o++,[[g+"_20",false]],lb2,null));
    });

    // 2. Device_Input
    var S2=[]; o=1;
    inputs.forEach(function(d,i){ S2.push(series(o++,[[portName(d.address),false]],d.name, i===0?"Physical input to symbol":null)); });

    // 3. HMI_Input
    var S3=[]; o=1;
    P("HMI_INPUT_NOP","BOOL","No operation, reserved for HMI input");
    S3.push(series(o++,[["GSB000",false]],"HMI_INPUT_NOP","HMI input not yet implemented, placeholder to keep section non-empty"));

    // 4. Timers
    var S4=[]; o=1;
    phpx.forEach(function(d,i){
        var lOn=d.name+"_ON", lOff=d.name+"_OFF";
        var tOn="LT"+pad(100+i*2,3), tOff="LT"+pad(101+i*2,3);
        P(tOn,"TON","On delay timer for "+d.komen); P(tOff,"TON","Off delay timer for "+d.komen);
        G(lOn,"BOOL",d.komen+" confirmed present"); G(lOff,"BOOL",d.komen+" confirmed absent");
        S4.push(ton(o++,[d.name,false],T_PHPX,tOn,lOn, i===0?"Photo sensor debounce, on and off delay":null));
        S4.push(ton(o++,[d.name,true],T_PHPX,tOff,lOff,null));
    });

    // 5. LS_Combination
    var S5=[]; o=1; var homeConds=[];
    asPairs.forEach(function(p,i){
        var lf="LSC_"+stripAS(p[0].name), lb="LSC_"+stripAS(p[1].name);
        G(lf,"BOOL",p[0].komen+" position confirmed"); G(lb,"BOOL",p[1].komen+" position confirmed");
        S5.push(ls2(o,p[0].name,p[1].name,lf,lb, i===0?"Limit switch combination, one valid position at a time":null));
        o+=2; homeConds.push([lb,false]);
    });

    // 6. Fault
    // AL/MF global buat semua program, tiap station dapat blok index dinamis (AL_BLOCK/MF_BLOCK,
    // dihitung dari jumlah AS-pair/actuator station itu sendiri) biar gak tabrakan bit sama station lain
    var S6=[]; o=1; var fltList=[];
    var alCap=AL_BLOCK[stKey].end, alN=AL_BLOCK[stKey].start;
    var mfCap=MF_BLOCK[stKey].end, mfN=MF_BLOCK[stKey].start;
    asPairs.forEach(function(p,i){
        if(alN>alCap){ warnings.push(stKey+": AL alarm block full, dual sensor fault for "+p[0].komen+" skipped."); return; }
        var cmt="Dual sensor fault, both ends detected at the same time: "+p[0].komen+" / "+p[1].komen;
        var t=AL(alN,cmt);
        var r=new Rung(o++, cmt);
        var rail=r.rail(); var c=r.ct(p[1].name,r.ct(p[0].name,rail));
        var x=r.clm(t,[c,r.ct(t,rail)]); r.rr([x]); S6.push(r.build());
        fltList.push(t); alN++;
    });
    var faultTimerIdx=0;
    actus.forEach(function(a,i){
        var ov=actuatorOverrides[a[0].name]||actuatorOverrides[a[1].name];
        if(ov && ov.mode==="openloop") return; // sengaja gak ada sensor by design - skip diam-diam, gak makan slot MF, gak warning
        if(mfN>mfCap){ warnings.push(stKey+": MF motion-fault block full, actuator "+a[0].komen+" skipped."); return; }
        var lscA, lscB;
        if(ov && ov.mode==="manual" && ov.lscA && ov.lscB){ lscA=ov.lscA; lscB=ov.lscB; }
        else { lscA=findLsc(a[0],asPairs); lscB=findLsc(a[1],asPairs); }
        if(!lscA||!lscB){ warnings.push(stKey+": no matching limit switch for actuator "+a[0].komen+", motion fault skipped."); return; }
        var cmt="Cylinder motion fault, solenoid energised but position not confirmed: "+a[0].komen+" / "+a[1].komen;
        var mf=MF(mfN,cmt), tmr="LT"+pad(200+faultTimerIdx,3); faultTimerIdx++;
        P(tmr,"TON","Motion timeout for "+a[0].komen);
        // 1 rung: (SOL_M ANDNOT LSC_M) OR (SOL_R ANDNOT LSC_R) -> TON -> MF, OR digabung langsung di pin In TON
        var r=new Rung(o++, cmt);
        var rail=r.rail();
        var c1=r.ct(lscA,r.ct(a[0].name,rail),true);
        var c2=r.ct(lscB,r.ct(a[1].name,rail),true);
        var coil=r.ton([c1,c2],T_MOTION,tmr,mf);
        r.rr([coil]); S6.push(r.build());
        fltList.push(mf); mfN++;
    });
    // Servo (srvActus): motion-fault SATU SISI (cmd energised ANDNOT confirm) - gak ada konsep "dual
    // sensor fault" (AL) karena gak ada pasangan dua-state buat dicek exclusivity-nya kayak silinder.
    srvActus.forEach(function(sa){
        var ov=actuatorOverrides[sa.cmd.name];
        if(ov && ov.mode==="openloop") return;
        if(mfN>mfCap){ warnings.push(stKey+": MF motion-fault block full, servo command "+sa.cmd.komen+" skipped."); return; }
        var lsc=(ov && ov.mode==="manual" && ov.lscA) ? ov.lscA : srvLscOf[sa.cmd.name];
        if(!lsc){ warnings.push(stKey+": no matching limit switch for servo command "+sa.cmd.komen+", motion fault skipped."); return; }
        var cmt="Servo motion fault, command energised but position not confirmed: "+sa.cmd.komen;
        var mf=MF(mfN,cmt), tmr="LT"+pad(200+faultTimerIdx,3); faultTimerIdx++;
        P(tmr,"TON","Motion timeout for "+sa.cmd.komen);
        var r=new Rung(o++, cmt);
        var rail=r.rail();
        var c1=r.ct(lsc,r.ct(sa.cmd.name,rail),true);
        var coil=r.ton([c1],T_MOTION,tmr,mf);
        r.rr([coil]); S6.push(r.build());
        fltList.push(mf); mfN++;
    });
    // ===== Alarm dari blok flowchart (AutoRunning) =====
    // Bit-nya WAJIB dialokasi di sini, SEBELUM integ() dipanggil di bawah: integ() yang merangkai
    // "grup alarm bersih" (chunkNot semua bit alarm -> LB13x/LB14x/LB15x). Kalau alarm baru dibikin
    // pas section AutoRunning digenerate (jauh di bawah), dia gak akan pernah kebawa ke grup manapun,
    // jadi coil-nya nyala tapi mesin gak berhenti - persis jenis kegagalan diam yang paling bahaya.
    // Rung coil-nya sendiri tetap dibikin nanti di AutoRunning, pakai bit hasil alokasi di sini.
    var ALARM_GROUPS = { emergency:[], autostop:[], cyclestop:[], faultstop:[], warning:[] };
    var alarmBitOf = {};
    (((flow.get("motionSequences")||{})[stKey])||[]).forEach(function(v,vIdx){
        ((v&&v.nodes)||[]).forEach(function(n){
            if(!n || n.type!=="alarm") return;
            var cat = n.category;
            if(!ALARM_GROUPS[cat]){
                if(cat) warnings.push(stKey+': flowchart alarm "'+(n.comment||n.id)+'" has unknown category "'+cat+'", treated as faultstop.');
                cat = "faultstop";
            }
            if(alN>alCap){ warnings.push(stKey+': AL alarm block full, flowchart alarm "'+(n.comment||n.id)+'" skipped.'); return; }
            var cmt = "Flowchart alarm ("+cat+"): "+(n.comment||n.id);
            var bit = AL(alN, cmt); alN++;
            alarmBitOf[vIdx+"/"+n.id] = bit;
            ALARM_GROUPS[cat].push(bit);
        });
    });

    var chunkAux=[];
    function integ(list,a1,a2,out,label){
        if(!list.length){ S6.push(series(o++,[["GSB000",false]],a1,label)); }
        else { var c=chunkNot(o,list,a1,a1,label,chunkAux); S6.push(c.xml); o+=c.n; }
        S6.push(series(o++,[["GSB000",false]],a2,null));
        S6.push(series(o++,[[a1,false],[a2,false]],out,null));
        P(a1,"BOOL",label+" detection auxiliary"); P(a2,"BOOL",label+" design auxiliary"); P(out,"BOOL",label+" clear");
    }
    integ(ALARM_GROUPS.emergency,"LB130","LB131","LB134","Emergency stop group");
    integ(ALARM_GROUPS.autostop,"LB135","LB136","LB139","Auto stop group");
    integ(ALARM_GROUPS.cyclestop,"LB140","LB141","LB144","Cycle stop group");
    integ(fltList.concat(ALARM_GROUPS.faultstop),"LB145","LB146","LB149","Fault stop group");
    integ(ALARM_GROUPS.warning,"LB150","LB151","LB154","Warning notice group");
    chunkAux.forEach(function(b){ P(b,"BOOL","Partial alarm group result"); });
    S6.push(series(o++,[["LB134",false],["LB139",false],["LB144",false],["LB149",false]],"LB160","No fault present in this unit"));
    P("LB160","BOOL","No fault present in this unit");

    // 7. Preparation
    var S7=[]; o=1;
    S7.push(series(o++, homeConds.length?homeConds:[["GSB000",false]], "LB100","All actuators at origin position"));
    S7.push(series(o++,[["LB100",false],["LB160",false]],"LB105",null));
    P("LB100","BOOL","All actuators at origin position"); P("LB105","BOOL","Unit returned to home position");

    // 8. Condition : lewat panel web, tiap station boleh punya sejumlah bit Condition BERNAMA,
    // masing-masing = OR dari beberapa kombinasi AND-syarat (groups) - persis pola Ndeso PATTERN 3
    // (mis. LB300 "P&P Take Out Lowering Auto Start Condition" = (grupA) OR (grupB)). Station yang
    // belum disetel lewat panel tetap dapat 3 slot cadangan generik lama (LB300-LB302), zero regresi.
    var S8=[]; o=1;
    var condDefs=((flow.get("conditionDefs")||{})[stKey])||[];
    var condBits=[];
    if(condDefs.length){
        condBits=condDefs.map(function(def,i){ return def.bit||("LB"+pad(300+i,3)); });
        // pass 1: deklarasikan semua bit Condition bernama dulu (biar referensi silang antar
        // Condition, mis. LB301 makein LB300, gak ke-declare-external-placeholder duluan)
        condDefs.forEach(function(def,i){ P(condBits[i],"BOOL",def.name||("Unit motion condition "+(i+1))); });
        // pass 2: bikin rung OR-of-AND-groups tiap Condition, deklarasikan bit syarat eksternal yang belum kekenal
        condDefs.forEach(function(def,i){
            var groups=(def.groups&&def.groups.length)?def.groups:[[["LB105",false],["LB160",false],["AUTO_MODE",false]]];
            // Normalisasi bentuk term - JSON/panel web ngirim {bit,neg} (readable), orOfAnds & sisa
            // lib.js makein convention [operand,negated] pair (sama kayak series()/latch() dkk).
            groups=groups.map(function(g){ return g.map(function(t){ return Array.isArray(t) ? t : [t.bit, !!t.neg]; }); });
            groups.forEach(function(g){ g.forEach(function(c){ if(!GLOBALS[c[0]]) P(c[0],"BOOL","External condition term for "+condBits[i]+" - define driving logic separately"); }); });
            S8.push(orOfAnds(o++, groups, condBits[i], i===0?"Unit motion conditions":(def.name||null)));
        });
    } else {
        condBits=["LB300","LB301","LB302"];
        condBits.forEach(function(b,i){
            P(b,"BOOL","Unit motion condition "+(i+1)+", spare, to be defined per product type");
            S8.push(series(o++,[["LB105",false],["LB160",false],["AUTO_MODE",false]],b,
                i===0?"Unit motion conditions, spare slots to be defined per product type":null));
        });
    }
    var doneBit="LB309";
    if(condBits.length===1){
        S8.push(series(o++,[[condBits[0],false]],doneBit,"One cycle motion condition established"));
    } else {
        var r9=new Rung(o++,null); var rl9=r9.rail();
        var x9=r9.clm(doneBit,condBits.map(function(b){return r9.ct(b,rl9);}));
        r9.rr([x9]); S8.push(r9.build());
    }
    P(doneBit,"BOOL","One cycle motion condition established");
    P("LB309","BOOL","One cycle motion condition established");

    // 9. Individual
    var S9=[]; o=1;
    ["LB310","LB319","LB320","LB339"].forEach(function(b,i){
        P(b,"BOOL",["Individual operation condition auxiliary","Individual operation condition",
                    "Individual cycle running","Process home return command"][i]);
    });
    G("PB004_"+pad(SN,2)+"M","BOOL","Individual staging button");
    G("PB004_"+pad(SN,2)+"R","BOOL","Process home return button");
    S9.push(series(o++,[["IND_MODE",false],["NO_FAULT",false],["MSTR_RDY",false]],"LB310","Individual operation permitted"));
    S9.push(series(o++,[["LB310",false],["LB134",false],["LB139",false]],"LB319",null));
    S9.push(latch(o++,[["PB004_"+pad(SN,2)+"M",false]],"LB320",[["LB319",false],["LB309",false]],null));
    S9.push(series(o++,[["PB004_"+pad(SN,2)+"R",false],["LB319",false]],"LB339","Return all actuators to home position"));
    var indM=[], indR=[];
    actus.forEach(function(a,i){
        var pg=1+Math.floor(i/PER_PAGE), nn=(i%PER_PAGE)+1;
        var pbM="PB4"+SN+pg+"_"+nn+"M", pbR="PB4"+SN+pg+"_"+nn+"R";
        var ilM="LB"+pad(232+i*2,3), ilR="LB"+pad(233+i*2,3);
        var oM ="LB"+pad(340+i*2,3), oR ="LB"+pad(341+i*2,3);
        G(pbM,"BOOL","Individual button, "+a[0].komen); G(pbR,"BOOL","Individual button, "+a[1].komen);
        P(ilM,"BOOL","Motion interlock for "+a[0].komen); P(ilR,"BOOL","Return interlock for "+a[1].komen);
        P(oM,"BOOL","Individual command, "+a[0].komen);  P(oR,"BOOL","Individual command, "+a[1].komen);
        indM.push(oM); indR.push(oR);
        S9.push(series(o++,[["GSB000",false]],ilM,"Screen "+SN+pg+" actuator "+nn+" : "+a[0].komen+" / interlock to be defined"));
        S9.push(series(o++,[[pbM,false],[pbR,true],[ilM,false],["LB319",false]],oM,null));
        S9.push(series(o++,[["GSB000",false]],ilR,null));
        var rr=new Rung(o++,null); var rl2=rr.rail();
        var cur=rr.ctm(pbM,[rr.ct(pbR,rl2),rr.ct("LB339",rl2)],true);
        cur=rr.ct(ilR,cur); cur=rr.ct("LB319",cur);
        rr.rr([rr.cl(oR,cur)]); S9.push(rr.build());
    });
    // Servo (srvActus): 1 tombol jog per command, BUKAN pasangan M/R - "arah" servo itu PILIHAN posisi
    // (LEFT/RIGHT/CENTER), bukan gerak dua-arah kayak silinder. Nomor Screen/actuator LANJUT dari
    // actus (idx=actus.length+i) dan alamat LB interlock/command LANJUT dari range punya actus juga,
    // biar gak tabrakan nama sama sekali. Ini yang bikin SEMUA posisi servo keliatan di Individual
    // (dulu kalau SRV_CMD kepaksa lewat pairUp yang butuh genap, sisa ganjil-nya didiemin/ke-drop).
    var indSrv=[];
    srvActus.forEach(function(sa,i){
        var idx=actus.length+i, pg=1+Math.floor(idx/PER_PAGE), nn=(idx%PER_PAGE)+1;
        var pb="PB4"+SN+pg+"_"+nn+"S";
        var il="LB"+pad(232+actus.length*2+i,3);
        var oS="LB"+pad(340+actus.length*2+i,3);
        G(pb,"BOOL","Individual button, "+sa.cmd.komen);
        P(il,"BOOL","Motion interlock for "+sa.cmd.komen);
        P(oS,"BOOL","Individual command, "+sa.cmd.komen);
        indSrv.push(oS);
        S9.push(series(o++,[["GSB000",false]],il,"Screen "+SN+pg+" actuator "+nn+" : "+sa.cmd.komen+" / interlock to be defined"));
        S9.push(series(o++,[[pb,false],[il,false],["LB319",false]],oS,null));
    });

    // 10. AutoRunning : unit menerima AUTO_RUN dari main lalu mengurut sendiri
    // Urutan gerak diambil dari flow.get("motionSequences")[stKey] (diisi di web UI index.html
    // sebelum generate ulang). Station yang belum dikonfigurasi tetap pakai placeholder lama.
    var S10=[]; o=1;
    P("LB400","BOOL","Automatic motion start");
    P("LB400_A","BOOL",stLabel+", Automatic motion start seal");
    P("LB400_B","BOOL",stLabel+", Automatic motion complete seal");
    // START MOTION PROCESS (Ndeso Autorun.cxr). POSISI SEAL yang bikin pasangan LB400_A/LB400_B ini
    // bener - salah taruh titik sambung seal-nya bikin ladder yang keliatan mirip tapi gak pernah
    // reset / gak pernah latch:
    //   LB400_A = (LB309 ANDNOT LB499 ANDNOT CYCLE_STOP  OR  seal LB400_A) AND AUTO_RUN ANDNOT LB400_B
    // seal LB400_A nyambung balik ke INPUT AUTO_RUN (bukan ke input LB499) - jadi LB499/CYCLE_STOP
    // cuma nge-block START, bukan mutus seal; yang mutus seal cuma AUTO_RUN drop atau LB400_B nyala.
    //   LB400_B = (LB499 AND LB400  OR  seal LB400_B) AND LB400_A
    // seal LB400_B nyambung balik ke LEFT RAIL (paralel LB499+LB400), dan LB400_A ada di UJUNG
    // sebagai gate - jadi begitu LB400_A drop (karena LB400_B tadi nyala), LB400_B ikut drop dan
    // pasangannya balik idle bareng - gak perlu blok reset terpisah. Rung LB400_B baca LB400 dari
    // scan SEBELUMNYA (rung yang ngedefine LB400 jalan setelah ini) - disengaja, sama kayak Autorun.cxr.
    (function(){
        var rA=new Rung(o++,"Start motion process: unit seal auto motion start");
        var railA=rA.rail();
        var trigA=rA.ct("CYCLE_STOP",rA.ct("LB499",rA.ct("LB309",railA),true),true);
        var sealA=rA.ct("LB400_A",railA);
        var curA=rA.ct("LB400_B",rA.ctm("AUTO_RUN",[trigA,sealA]),true);
        rA.rr([rA.cl("LB400_A",curA)]);
        S10.push(rA.build());
    })();
    (function(){
        var rB=new Rung(o++,"Start motion process: unit seal motion completed");
        var railB=rB.rail();
        var trigB=rB.ct("LB400",rB.ct("LB499",railB));
        var sealB=rB.ct("LB400_B",railB);
        rB.rr([rB.cl("LB400_B",rB.ctm("LB400_A",[trigB,sealB]))]);
        S10.push(rB.build());
    })();
    S10.push(orMany(o++,["LB400_A","LB320"],"LB400",
        "Autorun condition running: auto motion start"));

    // motionSequences[stKey] = daftar VARIAN sequence: [{condition, nodes:[{id,sol,after,join},...]}].
    // Tiap varian punya graph sendiri, digerbangi opsional oleh bit Condition (mis. LB300 - PATTERN 3
    // condition-select: cuma varian yang kondisinya true yang jalan). Varian tanpa condition = selalu
    // aktif (root langsung LB400) - kasus sequence tunggal biasa. Semua varian nge-OR ke LB499 bareng.
    // after boleh rujuk node MANAPUN di varian yang sama (bukan cuma yang lebih dulu dibikin) - graph
    // di-topological-sort dulu di sini, jadi urutan drag-connect di editor gak ngaruh ke kebenarannya.
    // after.length>1 dimaterialisasi jadi 1 rung AND/OR dulu sebelum motionStep-nya.
    var variants=((flow.get("motionSequences")||{})[stKey])||[];
    var solByName={}; actus.forEach(function(a){ solByName[a[0].name]=a[0]; solByName[a[1].name]=a[1]; });
    srvActus.forEach(function(sa){ solByName[sa.cmd.name]=sa.cmd; });
    var stepCount=0, joinN=0, varN=0, decN=0, cmdBitOf={}, variantDoneBits=[];
    // Memory set/reset dikumpulin se-STATION (bukan per varian): satu bit memory boleh di-SET di varian
    // A dan di-RESET di varian B, dan dua-duanya harus ketemu di SATU rung latch. Kalau tiap varian
    // bikin rung sendiri buat bit yang sama, coil-nya dobel dan yang belakangan menang - bug senyap.
    var memSets={}, memResets={}, memCmt={};

    // Cabang blok decision dirujuk pakai "idNode#Y" / "idNode#N". Sengaja '#', BUKAN '.', karena alamat
    // bit PLC sendiri pakai titik (mis. "0001.06") - kalau titik dipakai jadi pemisah port, alamat
    // kayak gitu bakal kepotong jadi id "0001" + port "06".
    function refBase(ref){ var s=String(ref), i=s.indexOf("#"); return i<0?s:s.slice(0,i); }
    function refPort(ref){ var s=String(ref), i=s.indexOf("#"); return i<0?"":s.slice(i+1); }

    function topoSort(nodes){
        var byId={}; nodes.forEach(function(n){ byId[n.id]=n; });
        var visited={}, visiting={}, out=[];
        function visit(n){
            if(visited[n.id]||visiting[n.id]) return; // cycle guard - editor sudah cegah, ini jaga-jaga
            visiting[n.id]=true;
            (n.after||[]).forEach(function(ref){ var b=byId[refBase(ref)]; if(b) visit(b); });
            visiting[n.id]=false; visited[n.id]=true; out.push(n);
        }
        nodes.forEach(visit);
        return out;
    }

    // PATTERN 3 Ndeso "Autorun Condition Running": semua varian ber-condition digabung jadi SATU
    // rung mutual-exclusion (satu network, N baris kondisi, N coil sejajar di 1 RightPowerRail) -
    // bukan rung terpisah per varian. LB400 gerbang bareng di depan tiap baris: (condition OR
    // seal-diri) ANDNOT latch varian lain yang juga ber-condition -> coil LB40x sendiri. LB400 di
    // depan seal loop juga, jadi tiap latch otomatis reset pas LB400 drop (cycle selesai/di-stop).
    // Nomor coil LB401, LB402, ... mengikuti urutan KE-BERAPA di antara varian ber-condition (ci),
    // BUKAN posisi mentah vIdx di array variants penuh - kalau ada varian tanpa condition sebelum
    // varian ber-condition pertama, vIdx bakal geser (mis. LB402 buat condition pertama, bukan
    // LB401) padahal user ngarepin condition ke-1 = LB401, condition ke-2 = LB402, dst berurutan.
    var latchBitOf={}, condTrigOf={};
    var condIdx=variants.map(function(v,j){ return j; }).filter(function(j){ return variants[j].condition; });
    var condLatchBits=condIdx.map(function(vIdx,ci){ return "LB"+pad(401+ci,3); });
    if(condIdx.length){
        // Kontak trigger tiap baris mutual-exclusion HARUS bit Condition section (LB300, LB301, ...),
        // bukan coil latch-nya sendiri: baris ke-ci itu "(LB30x OR seal LB40x) ANDNOT latch lain ->
        // LB40x". Kalau trigger-nya diketik sama kayak coil-nya (mis. condition "LB401" di baris yang
        // coil-nya juga LB401), yang kegambar jadi "LB401 nge-hold LB401" - trigger dan seal bit yang
        // sama, latch-nya gak akan pernah bisa nyala dari luar (dan kontaknya ke-render pake komen
        // COIL-nya karena dedup nameCI nge-skip P() buat condition-nya). Ini selalu salah data-entry,
        // jadi di-remap otomatis ke bit Condition ke-ci (pakai bit asli dari Condition section station
        // ini kalau ada, kalau gak LB300+ci), skip bit yang udah kepake varian lain, plus warning.
        var usedConds={}; condIdx.forEach(function(j){ usedConds[variants[j].condition]=true; });
        function freeCondBit(ci){
            var cands=[condBits[ci]||("LB"+pad(300+ci,3))];
            for(var k=0;k<100;k++) cands.push("LB"+pad(300+k,3));
            for(var i=0;i<cands.length;i++) if(cands[i] && !usedConds[cands[i]]) return cands[i];
            return "LB"+pad(300+ci,3);
        }
        var mxBranches=condIdx.map(function(vIdx,ci){
            var v=variants[vIdx];
            var latchBit=condLatchBits[ci];
            latchBitOf[vIdx]=latchBit;
            var trigBit=v.condition;
            if(condLatchBits.indexOf(trigBit)>=0){
                var fixed=freeCondBit(ci); usedConds[fixed]=true;
                warnings.push(stKey+': motion sequence variant condition "'+trigBit+'" is the same as one of its own mutual-exclusion coils ('+condLatchBits.join(", ")+') - a latch cannot be triggered by itself, so it was remapped to '+fixed+'. Define the driving logic for '+fixed+' in the Condition section.');
                trigBit=fixed;
            }
            condTrigOf[vIdx]=trigBit;
            P(latchBit,"BOOL",v.comment||trigBit);
            if(!GLOBALS[trigBit]) P(trigBit,"BOOL","External condition bit for motion sequence variant select - define driving logic separately");
            var others=condLatchBits.filter(function(b,j){ return j!==ci; }).map(function(b){ return [b,true]; });
            return { trigs:[[trigBit,false]], bit:latchBit, blocks:others };
        });
        var condTxts=condIdx.map(function(vIdx){ return condTrigOf[vIdx]; }).join(", ");
        S10.push(mutexGroup(o++,["LB400",false],mxBranches,
            "Unit motion condition running (mutual exclusion): "+condTxts));
    }
    // Titik sisip LB499 diinget di sini: setelah rung LB400/mutex-group (LB401..LB40x) kelar, SEBELUM
    // motion step pertama (LB410) - bukan paling atas section, bukan di ujung akhir.
    var lb499InsertAt=S10.length;

    variants.forEach(function(variant,vIdx){
        var nodes=topoSort(variant.nodes||[]);
        var nodeIds={}; nodes.forEach(function(n){ nodeIds[n.id]=true; });
        var confirmBitOf={}, referenced={}, branchBitOf={}, stepDone={};
        function resolveBit(ref){
            var b=refBase(ref), p=refPort(ref);
            if(!nodeIds[b]) return ref;                       // bit eksternal, dipakai apa adanya
            if(branchBitOf[b]) return branchBitOf[b][p==="N"?"N":"Y"];
            return confirmBitOf[b];
        }
        var condComments=variant.conditionComments||{};
        function bitTxt(ref){ return nodeIds[refBase(ref)] ? ref : (condComments[ref] ? (ref+" ["+condComments[ref]+"]") : ref); }
        // Bit eksternal (bukan node id di varian ini) dipakai langsung jadi kontak beneran di rung
        // (motionStep/join) - kalau belum kedeklarasi di manapun (bukan device/global, bukan spare
        // Condition section), deklarasikan sebagai private BOOL placeholder biar gak "operand tidak
        // terdeklarasi" pas import Susmax. Logic yang benar-benar drive bit ini tetap harus ditulis manual.
        function declareExternal(ref){
            if(nodeIds[ref]||GLOBALS[ref]) return;
            P(ref,"BOOL","External condition bit for motion sequence"+(condComments[ref]?": "+condComments[ref]:"")+" - define driving logic separately");
        }

        var rootBit="LB400";
        var label=variant.comment?('"'+variant.comment+'" - '):"";
        // Dipakein di komen "Motion N" biar keliatan itu langkah punya varian yang mana - "Motion N"
        // doang ambigu kalau lebih dari 1 varian (nomornya global se-station, bukan per-varian).
        var variantLabel=variant.comment||variant.condition||("Variant "+(vIdx+1));
        if(variant.condition){
            // Coil-nya udah dibikin di rung mutual-exclusion gabungan sebelum loop ini (lihat
            // latchBitOf di atas) - di sini tinggal declare external condition bit-nya kalau perlu.
            // Pakai condTrigOf: bisa beda dari variant.condition kalau tadi di-remap (trigger diketik
            // sama kayak coil latch-nya sendiri).
            declareExternal(condTrigOf[vIdx]||variant.condition);
            rootBit=latchBitOf[vIdx];
        } else if(variant.comment){
            var gateBit2="LB"+pad(550+varN,3); varN++;
            P(gateBit2,"BOOL","Motion sequence variant: "+label+"always active");
            S10.push(series(o++,[["LB400",false]], gateBit2, "Sequence variant "+label+"gate: always active"));
            rootBit=gateBit2;
        }

        var variantEndBits=[], portRef={};
        function nodeTitle(n){
            var t=n.type||"motion";
            if(t==="motion")   return n.sol;
            if(t==="decision") return 'judgement "'+(n.comment||n.cond||n.id)+'"';
            if(t==="setmem")   return 'set memory "'+(n.bit||n.id)+'"';
            if(t==="resetmem") return 'reset memory "'+(n.bit||n.id)+'"';
            if(t==="alarm")    return 'alarm "'+(n.comment||n.id)+'"';
            return t+' "'+n.id+'"';
        }

        nodes.forEach(function(node){
            var ntype=node.type||"motion";
            // Node "condition" cuma penanda bit rujukan di editor - gak punya rung sendiri.
            if(ntype==="condition") return;

            var dev=null, lsc=null;
            if(ntype==="motion"){
                dev=solByName[node.sol];
                if(!dev){ warnings.push(stKey+': motion sequence references unknown solenoid "'+node.sol+'", step skipped.'); return; }
                var devOv=actuatorOverrides[dev.name];
                lsc=(devOv && devOv.mode==="manual" && devOv.lscA) ? devOv.lscA : (srvLscOf[dev.name] || findLsc(dev,asPairs));
                if(!lsc){ warnings.push(stKey+': no matching limit switch for "'+node.sol+'" in motion sequence, step skipped.'); return; }
            }

            var after=(node.after||[]).filter(function(ref){
                var b=refBase(ref);
                if(nodeIds[b] && !stepDone[b]){
                    warnings.push(stKey+': flowchart step '+nodeTitle(node)+' depends on a skipped step "'+ref+'", dependency ignored.');
                    return false;
                }
                return true;
            });
            after.forEach(function(ref){ if(!nodeIds[refBase(ref)]) declareExternal(ref); });

            var stepLabel = (ntype==="motion") ? dev.komen : nodeTitle(node);
            var prevBit;
            if(!after.length){
                prevBit=rootBit;
            } else if(after.length===1){
                prevBit=resolveBit(after[0]);
            } else {
                var joinBit="LB"+pad(500+joinN,3); joinN++;
                P(joinBit,"BOOL",(node.join==="OR"?"Any of":"All of")+" "+after.length+" condition(s) before "+stepLabel);
                var bits=after.map(resolveBit);
                var commented=after.filter(function(ref){ return !nodeIds[refBase(ref)] && condComments[ref]; });
                var jcmt="Join ("+(node.join==="OR"?"OR":"AND")+") before "+stepLabel+
                    (commented.length ? " ["+commented.map(bitTxt).join(", ")+"]" : "");
                if(node.join==="OR") S10.push(orMany(o++, bits, joinBit, jcmt));
                else S10.push(series(o++, bits.map(function(b){return [b,false];}), joinBit, jcmt));
                prevBit=joinBit;
            }
            after.forEach(function(ref){
                var b=refBase(ref);
                if(!nodeIds[b]) return;
                referenced[b]=true;
                portRef[b+"#"+(refPort(ref)==="N"?"N":"Y")]=true;
            });

            if(ntype==="motion"){
                var cmdBit="LB"+pad(410+stepCount*2,3), confirmBit="LB"+pad(411+stepCount*2,3);
                P(cmdBit,"BOOL","Automatic command, "+dev.komen); P(confirmBit,"BOOL","Automatic complete, "+dev.komen);
                S10.push(motionStep(o++, prevBit, node.sol, lsc, cmdBit, confirmBit, "["+variantLabel+"] Motion "+(stepCount+1)+": "+dev.komen));
                // Akumulasi, JANGAN overwrite - satu solenoid fisik bisa dikomando dari node di lebih
                // dari 1 varian mutual-exclusion (mis. "single seal" vs "double seal" pakai aktuator
                // sama) - semua cmdBit-nya wajib nyampe ke AutoOutput, bukan cuma varian yang belakangan.
                (cmdBitOf[node.sol]=cmdBitOf[node.sol]||[]).push(cmdBit);
                confirmBitOf[node.id]=confirmBit; stepCount++; stepDone[node.id]=true;

            } else if(ntype==="decision"){
                // IF-ELSE pola Ndeso: satu titik masuk, dua step-bit keluar (Y dan N) yang saling
                // eksklusif karena dibedain kontak kondisi normal vs negated. Penyatuan cabangnya
                // TIDAK dipaksa di sini - node hilirnya tinggal nunjuk "id#Y" dan "id#N" sekaligus
                // dengan join OR, jadi mekanisme join yang sudah ada yang ngerjain (LB421/LB422 -> OR).
                var cbit=String(node.cond||"").trim();
                if(!cbit){ warnings.push(stKey+': decision block '+nodeTitle(node)+' has no condition bit, block skipped.'); return; }
                declareExternal(cbit);
                var yBit="LB"+pad(600+decN,3), nBit="LB"+pad(601+decN,3); decN+=2;
                if(decN>100){ warnings.push(stKey+": decision block range LB600-LB699 exhausted, later judgement blocks will collide."); }
                var dlabel=node.comment||cbit;
                P(yBit,"BOOL","Judgement YES: "+dlabel); P(nBit,"BOOL","Judgement NO: "+dlabel);
                S10.push(series(o++,[[prevBit,false],[cbit,false]],yBit,"["+variantLabel+"] Judgement "+dlabel+" -> YES ("+cbit+" on)"));
                S10.push(series(o++,[[prevBit,false],[cbit,true]],nBit,"["+variantLabel+"] Judgement "+dlabel+" -> NO ("+cbit+" off)"));
                branchBitOf[node.id]={Y:yBit,N:nBit}; stepDone[node.id]=true;

            } else if(ntype==="setmem"||ntype==="resetmem"){
                // Rung-nya TIDAK dibikin di sini: semua trigger set/reset buat satu bit dikumpulin dulu,
                // baru dijadiin SATU rung latch di bawah. Dua coil buat bit yang sama di rung berbeda
                // bakal saling timpa tiap scan (yang terakhir menang) - itu bug klasik ladder.
                var mbit=String(node.bit||"").trim();
                if(!mbit){ warnings.push(stKey+': '+nodeTitle(node)+' has no target bit, block skipped.'); return; }
                (((ntype==="setmem")?memSets:memResets)[mbit]=((ntype==="setmem")?memSets:memResets)[mbit]||[]).push(prevBit);
                if(!memCmt[mbit] && node.comment) memCmt[mbit]=node.comment;
                confirmBitOf[node.id]=prevBit; stepDone[node.id]=true;   // aksi seketika, hilir lanjut dari step yang sama

            } else if(ntype==="alarm"){
                var abit=alarmBitOf[vIdx+"/"+node.id];
                if(!abit){ warnings.push(stKey+': '+nodeTitle(node)+' did not get an AL slot, block skipped.'); return; }
                // Self-latch, sama persis kayak rung AL dual-sensor fault di section Fault: alarm harus
                // nyangkut walau penyebabnya cuma sekejap, bukan ikut padam pas step-nya lewat.
                S10.push(latch(o++,[[prevBit,false]],abit,[], "["+variantLabel+"] Alarm: "+(node.comment||node.id)));
                confirmBitOf[node.id]=prevBit; stepDone[node.id]=true;

            } else {
                warnings.push(stKey+': unknown flowchart block type "'+ntype+'" on node "'+node.id+'", block skipped.');
            }
        });
        nodes.forEach(function(n){
            if(!stepDone[n.id] || (n.type==="condition")) return;
            if(branchBitOf[n.id]){
                if(!portRef[n.id+"#Y"]) variantEndBits.push(branchBitOf[n.id].Y);
                if(!portRef[n.id+"#N"]) variantEndBits.push(branchBitOf[n.id].N);
            } else if(confirmBitOf[n.id]!==undefined && !referenced[n.id]){
                variantEndBits.push(confirmBitOf[n.id]);
            }
        });

        // Blok set/reset memory nerusin prevBit apa adanya, jadi dua blok yang nempel di step yang sama
        // bisa ngasih end-bit kembar. Dibuang dulu biar rung "variant complete" gak punya kontak dobel.
        variantEndBits=variantEndBits.filter(function(b,i){ return variantEndBits.indexOf(b)===i; });

        if(variantEndBits.length===1){
            variantDoneBits.push(variantEndBits[0]);
        } else if(variantEndBits.length>1){
            var doneBit="LB"+pad(570+varN,3);
            P(doneBit,"BOOL","Sequence variant complete, all parallel branches finished");
            S10.push(series(o++, variantEndBits.map(function(b){return [b,false];}), doneBit,
                "Sequence variant complete: all parallel branches finished"));
            variantDoneBits.push(doneBit);
        }
    });

    // ===== Rung memory (SET/RESET) =====
    // Satu bit memory = SATU rung latch: (semua trigger SET, atau bit itu sendiri) ANDNOT tiap trigger
    // RESET. Ini yang bikin bit-nya bertahan lintas scan sampai di-reset eksplisit - persis LB800/LB801
    // "MEMORY PRESS OK/NG" yang baru hilang pas blok RESET MEMORY OK-NG jalan.
    Object.keys(memSets).concat(Object.keys(memResets)).filter(function(b,i,arr){ return arr.indexOf(b)===i; })
        .forEach(function(mbit){
            var sets=memSets[mbit]||[], resets=memResets[mbit]||[];
            if(!sets.length){
                warnings.push(stKey+': memory bit "'+mbit+'" only has RESET blocks and is never set from this flowchart - verify that something else sets it.');
            }
            if(!GLOBALS[mbit]) P(mbit,"BOOL","Flowchart memory"+(memCmt[mbit]?": "+memCmt[mbit]:""));
            S10.push(latch(o++, sets.map(function(b){return [b,false];}), mbit,
                resets.map(function(b){return [b,true];}),
                "Memory "+mbit+(memCmt[mbit]?" ("+memCmt[mbit]+")":"")+
                ": set by "+(sets.length?sets.join(", "):"nothing")+
                (resets.length?", reset by "+resets.join(", "):"")));
        });

    var preLB499Count=S10.length;
    P("LB499","BOOL","Automatic operation complete");
    if(variantDoneBits.length===1){
        S10.push(series(o++,[[variantDoneBits[0],false]],"LB499","1 cycle motion complete"));
    } else if(variantDoneBits.length>1){
        S10.push(orMany(o++, variantDoneBits, "LB499", "1 cycle motion complete, any active sequence variant finished"));
    } else {
        actus.forEach(function(a,i){
            var sM="LB"+pad(410+i*2,3), sR="LB"+pad(411+i*2,3);
            P(sM,"BOOL","Automatic command, "+a[0].komen); P(sR,"BOOL","Automatic command, "+a[1].komen);
        });
        P("LB409","BOOL","Unit cycle completed");
        S10.push(series(o++,[["LB400",false],["LB105",false]],"LB409","Motion steps to be written here using LB410 onwards, or configure a motion sequence in the web UI"));
        S10.push(series(o++,[["LB409",false]],"LB499",null));
    }
    // LB499 dipindah ke antara rung LB400/mutex-group (LB401..) dan motion step pertama (LB410) -
    // BUKAN paling atas section. Valid, PLC scan siklik jadi rung boleh nunjuk bit yang baru
    // di-compute rung LAIN di bawahnya (kepakein nilai scan sebelumnya). evaluationOrder di-renumber
    // ulang 1..N ngikutin urutan array yang baru, biar urutan tampil di Susmax Studio (yang ngikutin
    // evaluationOrder, bukan cuma posisi di XML) bener.
    S10.splice.apply(S10, [lb499InsertAt, 0].concat(S10.splice(preLB499Count)));
    S10 = S10.map(function(rungXml,idx){ return rungXml.replace(/evaluationOrder="\d+"/, 'evaluationOrder="'+(idx+1)+'"'); });

    // 11. Auto_Output
    var S11=[]; o=1;
    if(stepCount){
        var firstOut=true;
        actus.forEach(function(a,i){
            [[a[0],indM[i]],[a[1],indR[i]]].forEach(function(pair){
                var dev=pair[0], indBit=pair[1];
                // cmdBitOf[dev.name] bisa lebih dari 1 (dikomando dari beberapa varian mutual-
                // exclusion yang beda) - semua wajib di-OR ke solenoid, bukan cuma salah satu.
                var allBits=(cmdBitOf[dev.name]||[]).concat([indBit]);
                var cmt=firstOut?"Automatic and individual command merged to solenoid":null;
                S11.push(allBits.length>1 ? orMany(o++, allBits, dev.name, cmt)
                                           : series(o++,[[allBits[0],false]],dev.name,cmt));
                firstOut=false;
            });
        });
    } else {
        actus.forEach(function(a,i){
            S11.push(merge2(o++,"LB"+pad(410+i*2,3),indM[i],a[0].name, i===0?"Automatic and individual command merged to solenoid":null));
            S11.push(merge2(o++,"LB"+pad(411+i*2,3),indR[i],a[1].name,null));
        });
    }
    // Servo (srvActus): auto command (cmdBitOf dari motion sequence kalau dipakai di sana) + individual
    // command (indSrv), digabung ke output fisik langsung - gak lewat cabang stepCount/stub actus di
    // atas (nomor LB410+i*2 di situ udah kepakai buat step motion sequence beneran begitu srv dipakai).
    // Kalau srv ini gak dipakai di motion sequence manapun, cmdBitOf-nya kosong = individual-only control.
    srvActus.forEach(function(sa,i){
        var allBits=(cmdBitOf[sa.cmd.name]||[]).concat([indSrv[i]]);
        S11.push(allBits.length>1 ? orMany(o++, allBits, sa.cmd.name, null)
                                   : series(o++,[[allBits[0],false]],sa.cmd.name,null));
    });
    var used={}; actus.forEach(function(a){ used[a[0].name]=1; used[a[1].name]=1; });
    srvActus.forEach(function(sa){ used[sa.cmd.name]=1; });
    outputs.filter(function(d){return !used[d.name];}).forEach(function(d,i){
        var ab="LB"+pad(480+i,3); P(ab,"BOOL","Automatic command, "+d.komen);
        S11.push(merge2(o++,ab,null,d.name,null));
    });

    // 12. HMI_Output
    var S12=[]; o=1;
    asPairs.forEach(function(p,i){
        var pg=1+Math.floor(i/PER_PAGE), nn=(i%PER_PAGE)+1;
        var pM="PL4"+SN+pg+"_"+nn+"M", pR="PL4"+SN+pg+"_"+nn+"R";
        G(pM,"BOOL","Lamp, "+p[0].komen); G(pR,"BOOL","Lamp, "+p[1].komen);
        S12.push(series(o++,[[p[0].name,false]],pM, i===0?"Actuator position feedback to operation panel":null));
        S12.push(series(o++,[[p[1].name,false]],pR,null));
    });

    // 13. Device_Output
    var S13=[]; o=1;
    outputs.forEach(function(d,i){ S13.push(series(o++,[[d.name,false]],portName(d.address), i===0?"Symbol to physical output":null)); });

    // 14. Station_Output
    var S14=[]; o=1;
    [["LB105","00","unit at home position"],["LB134","01","emergency stop clear"],["LB139","02","auto stop clear"],
     ["LB144","03","cycle stop clear"],["LB149","04","fault stop clear"],["LB154","05","warning clear"],
     ["LB309","06","unit motion condition established"],["LB499","20","automatic operation complete"]].forEach(function(x,i){
        G(GB+"_"+x[1],"BOOL",stLabel+" "+x[2]);
        S14.push(series(o++,[[x[0],false]],GB+"_"+x[1], i===0?"Unit status broadcast to other programs":null));
    });
    G(GB+"_09","BOOL",stLabel+" unit is stopped");
    S14.push(series(o++,[["LB400",true]],GB+"_09",null));

    var secs=[sect("Station_Input",1,S1),sect("Device_Input",2,S2),sect("HMI_Input",3,S3),sect("Timers",4,S4),
      sect("LS_Combination",5,S5),sect("Fault",6,S6),sect("Preparation",7,S7),sect("Condition",8,S8),
      sect("Individual",9,S9),sect("AutoRunning",10,S10),sect("Auto_Output",11,S11),sect("HMI_Output",12,S12),
      sect("Device_Output",13,S13),sect("Station_Output",14,S14)];
    return { name:inf.prg+".xml", xml:prog(inf.prg,ext,priv,secs,glob),
             stats:stKey+": in="+inputs.length+" out="+outputs.length+" actuator="+actus.length+" lsPair="+asPairs.length+" phpx="+phpx.length };
}

// ============================================================ MAIN
function buildMain(devs){
    var inputs  = devs.filter(function(d){return d.io==="IN";});
    var outputs = devs.filter(function(d){return d.io==="OUT";});
    var ext=[],priv=[],glob=[],seen={},pseen={},nameCI={};
    function G(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; seen[n]=1; var v=vr(n,t,d); glob.push("      "+v); ext.push("      "+v); GLOBALS[n]={t:t||"BOOL",d:d||""}; }
    function P(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; pseen[n]=1; priv.push("      "+vr(n,t,d)); }
    G("GSB000","BOOL","Equipment design coil, constant ON");
    G("GSB001","BOOL","Equipment design coil, constant OFF");
    MAIN_EXPORTS.forEach(function(n){ G(n,"BOOL","Machine status broadcast to all units"); });
    G("AL",AL_TYPE,"Alarm bit table"); G("MF",MF_TYPE,"Cylinder motion fault table");
    var allDevs=[]; Object.keys(groups).forEach(function(k){ allDevs=allDevs.concat(groups[k]); });
    allDevs.forEach(function(d){ G(portName(d.address),"BOOL",d.komen); G(d.name,"BOOL",d.komen); });
    ukeys.forEach(function(k){
        var gb=STMAP[k].gb;
        ["00","01","02","03","04","05","06","09","20"].forEach(function(b){ G(gb+"_"+b,"BOOL",labelOf(k)+" status bit"); });
    });
    function has(n){ return devs.some(function(d){return d.name===n;}); }
    function req(n,l){ if(!has(n)){ warnings.push('MAIN: "'+n+'" ('+l+') not found in IO list, GSB000 used instead.'); return "GSB000"; } return n; }
    var sEmg=req("NOT_EMG_STOP","emergency stop"), sFuse=req("FUSE_GOOD","fuse"), sAir=req("AIR_SC_CONF","air source"),
        sSafe=req("SAFE_CONF","safety"), sMstr=req("MSTR_RDY","master on confirm"), sPbMstr=req("PB_MSTR_ON","master on button"),
        sSel=req("SS_AUTO_IND","auto individual selector"), sPbAuto=req("PB_AUTO_RUN","auto start button"),
        sPbCyc=req("PB_CYCL_STOP","cycle stop button"), sPbRst=req("PB_FLT_RST","alarm reset button"),
        sPbStop=req("PB_MC_STOP","machine stop button");

    // 1. Station_Input
    var S1=[],o=1;
    ukeys.forEach(function(k,i){
        var gb=STMAP[k].gb, lb="LB"+pad(70+i,3);
        P(lb,"BOOL",labelOf(k)+" reported at home position");
        S1.push(series(o++,[[gb+"_00",false]],lb, i===0?"Unit status received from station programs":null));
    });

    // 2. Device_Input
    var S2=[]; o=1;
    inputs.forEach(function(d,i){ S2.push(series(o++,[[portName(d.address),false]],d.name, i===0?"Physical input to symbol":null)); });

    // 3. HMI_Input
    var S3=[]; o=1;
    P("HMI_INPUT_NOP","BOOL","No operation, reserved for HMI input");
    S3.push(series(o++,[["GSB000",false]],"HMI_INPUT_NOP","HMI input not yet implemented, placeholder to keep section non-empty"));

    // 4. Timers
    var S4=[]; o=1;
    P("LT000","TON","Power on delay"); P("LB001","BOOL","Power on delay elapsed");
    P("LT001","TON","Master ready delay"); P("LB002","BOOL","Master ready delay elapsed");
    P("LT004","TON","Auto mode delay"); P("LB004","BOOL","Auto mode delay elapsed");
    P("LT005","TON","Individual mode delay"); P("LB005","BOOL","Individual mode delay elapsed");
    P("LB006","BOOL","Auto mode selected and master ready");
    P("LB007","BOOL","Individual mode selected and master ready");
    S4.push(ton(o++,null,"T#5S","LT000","LB001","Machine power up and mode selection delays","GSB000"));
    S4.push(ton(o++,[sMstr,false],"T#1S","LT001","LB002",null));
    S4.push(series(o++,[[sSel,false],["LB002",false]],"LB006",null));
    S4.push(ton(o++,["LB006",false],"T#500MS","LT004","LB004",null));
    S4.push(series(o++,[[sSel,true],["LB002",false]],"LB007",null));
    S4.push(ton(o++,["LB007",false],"T#500MS","LT005","LB005",null));

    // 5. Fault
    var S5=[]; o=1;
    S5.push(latch(o++,[[sPbMstr,false]],"LB008",[[sMstr,false],["LB009",true]],"Master on and off confirmation"));
    S5.push(series(o++,[[sMstr,true]],"LB009",null));
    P("LB008","BOOL","Master on confirmed"); P("LB009","BOOL","Master off confirmed");
    var emg=[];
    [[1,sEmg,"Emergency stop button pressed"],[2,sFuse,"Fuse disconnected"],
     [3,sAir,"Air source pressure lost"],[4,sSafe,"Safety cover or light curtain open"]].forEach(function(x,i){
        var t=AL(x[0],x[2]); emg.push(t);
        var r=new Rung(o++, i===0?"Emergency stop group, latched until alarm reset: "+x[2]:x[2]);
        var rail=r.rail(); var c=r.ct(x[1],r.ct("LB001",rail),true);
        r.rr([r.clm(t,[c,r.ct(t,rail)])]); S5.push(r.build());
    });
    var chunkAux=[];
    function integSelf(list,a1,a2,out,label){
        if(!list.length){ S5.push(series(o++,[["GSB000",false]],a1,label)); }
        else { var c=chunkNot(o,list,a1,a1,label,chunkAux); S5.push(c.xml); o+=c.n; }
        S5.push(series(o++,[["GSB000",false]],a2,null));
        S5.push(series(o++,[[a1,false],[a2,false]],out,null));
        P(a1,"BOOL",label+" detection auxiliary"); P(a2,"BOOL",label+" design auxiliary"); P(out,"BOOL",label+" clear");
    }
    function integUnit(bit,a1,a2,out,label){
        var c=ukeys.map(function(k){ return [STMAP[k].gb+"_"+bit,false]; });
        S5.push(series(o++, c.length?c:[["GSB000",false]], a1, label));
        S5.push(series(o++,[["GSB000",false]],a2,null));
        S5.push(series(o++,[[a1,false],[a2,false]],out,null));
        P(a1,"BOOL",label+" detection auxiliary"); P(a2,"BOOL",label+" design auxiliary"); P(out,"BOOL",label+" clear");
    }
    integSelf(emg,"LB010","LB011","LB019","Emergency stop group integration");
    integUnit("02","LB020","LB021","LB029","Auto stop group integration");
    integUnit("03","LB030","LB031","LB039","Cycle stop group integration");
    integUnit("04","LB040","LB041","LB049","Fault stop group integration");
    integUnit("05","LB050","LB051","LB059","Warning notice group integration");
    chunkAux.forEach(function(b){ P(b,"BOOL","Partial alarm group result"); });
    S5.push(series(o++,[["LB019",false],["LB029",false],["LB039",false],["LB049",false]],"LB060","Buzzer and buzzer silence"));
    S5.push(latch(o++,[[sPbRst,false]],"LB061",[["LB060",true],["LB001",false]],null));
    S5.push(series(o++,[["LB059",false]],"LB062",null));
    S5.push(latch(o++,[[sPbRst,false]],"LB063",[["LB062",true],["LB001",false]],null));
    S5.push(series(o++,[["GSB000",false]],"LB064",null));
    S5.push(latch(o++,[[sPbRst,false]],"LB065",[["LB064",true],["LB001",false]],null));
    S5.push(series(o++,[["LB060",false],["LB062",false]],"LB068",null));
    var rb=new Rung(o++,null); var rl=rb.rail();
    rb.rr([rb.clm("LB069",[ rb.ct("LB061",rb.ct("LB060",rl,true),true),
                            rb.ct("LB063",rb.ct("LB062",rl,true),true),
                            rb.ct("LB065",rb.ct("LB064",rl,true),true) ])]);
    S5.push(rb.build());
    [["LB060","No fault present"],["LB061","Fault alarm silenced by operator"],["LB062","No warning present"],
     ["LB063","Warning alarm silenced by operator"],["LB064","No battery alarm"],["LB065","Battery alarm silenced by operator"],
     ["LB068","Machine condition normal"],["LB069","Buzzer output"]].forEach(function(x){ P(x[0],"BOOL",x[1]); });

    // 6. Master_Preparation
    var S6=[]; o=1;
    S6.push(latch(o++,[[sPbStop,false]],"LB078",[[sMstr,false]],"Machine stop request handling"));
    S6.push(series(o++,[["LB078",false],["LB120",true]],"LB079",null));
    P("LB078","BOOL","Machine stop requested"); P("LB079","BOOL","Machine stop effective");

    // 7. Condition
    var S7=[]; o=1;
    function grp(bit,a1,a2,out,label){
        var c=ukeys.map(function(k){ return [STMAP[k].gb+"_"+bit,false]; });
        S7.push(series(o++, c.length?c:[["GSB000",false]], a1, label));
        S7.push(series(o++,[["GSB000",false]],a2,null));
        return out;
    }
    grp("09","LB080","LB081","LB089","Machine abeyance, every unit is stopped");
    S7.push(series(o++,[["LB080",false],["LB081",false]],"LB089",null));
    grp("00","LB090","LB091","LB099","All machine home position");
    S7.push(series(o++,[["LB090",false],["LB091",false]],"LB099",null));
    grp("06","LB100","LB101","LB109","Auto start condition excluding home position");
    S7.push(series(o++,[["LB100",false],["LB101",false],["LB060",false]],"LB109",null));
    [["LB080","All units stopped auxiliary"],["LB081","Machine abeyance design auxiliary"],["LB089","Machine abeyance"],
     ["LB090","All units at home auxiliary"],["LB091","Home position design auxiliary"],["LB099","All machine home position"],
     ["LB100","Unit motion conditions auxiliary"],["LB101","Start condition design auxiliary"],
     ["LB109","Auto start condition excluding home position"]].forEach(function(x){ P(x[0],"BOOL",x[1]); });

    // 8. Auto_Main_Loop : tanpa station sequencing
    var S8=[]; o=1;
    S8.push(series(o++,[[sSafe,false],[sMstr,false],["LB004",false],["LB019",false],["LB029",false]],"LB110","Automatic motion looping"));
    S8.push(series(o++,[["LB110",false]],"LB119",null));
    var ra=new Rung(o++,null); var rl2=ra.rail();
    var chain=ra.ct("LB109",ra.ct("LB099",ra.ct(sPbAuto,rl2)));
    var afterOr=ra.ctm("LB119",[chain,ra.ct("LB120",rl2)]);
    var blk=ra.ctm("GSB000",[ ra.ct("LB121",afterOr,true), ra.ct("LB089",afterOr,true), ra.ct("LB099",afterOr,true) ]);
    ra.rr([ra.cl("LB120",blk)]); S8.push(ra.build());
    var rc=new Rung(o++,null); var rl3=rc.rail();
    var cur=rc.ctm("LB120",[ rc.ct(sPbCyc,rl3), rc.ct("LB039",rl3,true), rc.ct("LB121",rl3),
                             rc.ct("GSB001",rc.ct("PL_CYCLE_STOP",rl3)) ]);
    rc.rr([rc.cl("LB121",cur)]); S8.push(rc.build());
    G("PL_CYCLE_STOP","BOOL","Cycle stop lamp on operation panel");
    [["LB110","Auto running condition auxiliary"],["LB119","Auto running condition"],
     ["LB120","Auto running"],["LB121","Cycle stopping"]].forEach(function(x){ P(x[0],"BOOL",x[1]); });

    // 9. Main_Out
    var S9=[]; o=1;
    var mapped={};
    outputs.forEach(function(d){
        var k=(d.komen||"").toUpperCase(), src=null, cmt=null;
        if(d.jenis==="BZ"||/BUZZER/.test(k)){ src="LB069"; cmt="Buzzer driven by buzzer silence logic"; }
        else if(/EMERGENCY|EMER/.test(k)){ src=sEmg; cmt="Emergency stop interlock follows the emergency stop input"; }
        else if(/AUTO RUN/.test(k)){ src="LB120"; }
        else if(/MASTER ON/.test(k)){ src=sMstr; }
        else if(/CYCLE STOP/.test(k)){ src="LB121"; }
        if(src){ mapped[d.name]=1; S9.push(series(o++,[[src,false]],d.name,cmt)); }
    });
    var firstAuto=true;
    outputs.filter(function(d){ return !mapped[d.name]; }).forEach(function(d,i){
        var ab="LB"+pad(410+i,3); P(ab,"BOOL","Automatic command, "+d.komen);
        S9.push(merge2(o++,ab,null,d.name, firstAuto?"Main program automatic outputs":null)); firstAuto=false;
    });

    // 10. HMI_Output
    var S10=[]; o=1;
    [["LB120","PL_HMI_AUTO_RUN","Auto running indication"],["LB121","PL_HMI_CYCLE_STOP","Cycle stopping indication"],
     [sMstr,"PL_HMI_MASTER_ON","Master on indication"],["LB060","PL_HMI_NO_FAULT","No fault indication"],
     ["LB099","PL_HMI_ALL_HOME","All machine home indication"],["LB069","PL_HMI_BUZZER","Buzzer indication"]].forEach(function(x,i){
        G(x[1],"BOOL",x[2]);
        S10.push(series(o++,[[x[0],false]],x[1], i===0?"Machine status to operation panel":null));
    });

    // 11. Device_Output
    var S11=[]; o=1;
    outputs.forEach(function(d,i){ S11.push(series(o++,[[d.name,false]],portName(d.address), i===0?"Symbol to physical output":null)); });

    // 12. Station_Output
    var S12=[]; o=1;
    [["LB001","PWR_ON"],["GSB000","PLC_GOOD"],["LB004","AUTO_MODE"],["LB005","IND_MODE"],["LB060","NO_FAULT"],
     ["LB099","HOME_POST"],["LB120","AUTO_RUN"],["LB121","CYCLE_STOP"],["LB002","MSTR_RDY"]].forEach(function(x,i){
        S12.push(series(o++,[[x[0],false]],x[1], i===0?"Machine status broadcast to all unit programs":null));
    });

    var secs=[sect("Station_Input",1,S1),sect("Device_Input",2,S2),sect("HMI_Input",3,S3),sect("Timers",4,S4),
      sect("Fault",5,S5),sect("Master_Preparation",6,S6),sect("Condition",7,S7),sect("Auto_Main_Loop",8,S8),
      sect("Main_Out",9,S9),sect("HMI_Output",10,S10),sect("Device_Output",11,S11),sect("Station_Output",12,S12)];
    return { name:"Prg001_MAIN.xml", xml:prog("Prg001_MAIN",ext,priv,secs,glob),
             stats:"MAIN: in="+inputs.length+" out="+outputs.length+" unit="+ukeys.length };
}

// ---- file gabungan ----
function extractProgram(xml){
    var i=xml.indexOf("<Program name="), j=xml.lastIndexOf("</Program>")+10;
    return (i>=0&&j>10)?xml.slice(i,j):"";
}
function progMulti(title,blocks,globVars){
    return '<?xml version="1.0"?>\n<Project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
     +'         xmlns:smcext="https://www.ia.omron.com/Smc"\n'
     +'         xsi:schemaLocation="https://www.ia.omron.com/Smc IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd"\n'
     +'         schemaVersion="1"\n         xmlns="www.iec.ch/public/TC65SC65BWG7TF10">\n'
     +'  <FileHeader companyName="PT. Ndeso Indonesia" productName="Susmax Studio" productVersion="1.30.0.0" />\n'
     +'  <ContentHeader name="'+title+'" creationDateTime="2026-07-30T00:00:00">\n'
     +'    <AddData><Data name="https://www.ia.omron.com/Smc IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd" handleUnknown="discard">'
     +'<smcext:DeviceInfo modelName="NX1P2" version="1.40" /></Data></AddData>\n  </ContentHeader>\n'
     +'  <Types><GlobalNamespace>\n'+blocks.join("\n")+'\n  </GlobalNamespace></Types>\n'
     +'  <Instances><Configuration name="Machine"><Resource name="MainResource" resourceTypeName="">\n'
     +'    <GlobalVars>\n'+globVars.join("\n")+'\n    </GlobalVars>\n'
     +'  </Resource></Configuration></Instances>\n</Project>\n';
}

if(!groups.MAIN||!groups.MAIN.length) warnings.push("No MAIN devices found, every comment contains a station tag.");
files.push(buildMain(groups.MAIN||[]));
ukeys.forEach(function(k){ files.push(buildUnit(k,groups[k])); });

// Index yang direservasi tapi belum kepakai (blok MAIN dan blok tiap station) tetap diisi komen "Spare"
// biar keliatan di tabel Global Variable itu slot cadangan, bukan ketinggalan/hilang
(function fillSpareArrayComments(){
    function fillRange(fn,start,end,label){
        for(var n=start;n<=end;n++){ var t=fn(n); if(!ARRAY_ELEMENTS[t]) ARRAY_ELEMENTS[t]="Spare, reserved for "+label; }
    }
    fillRange(AL,1,AL_MAIN_RESERVED,"MAIN alarm group");
    ukeys.forEach(function(k){
        fillRange(AL, AL_BLOCK[k].start, AL_BLOCK[k].end, labelOf(k)+" alarm group");
        fillRange(MF, MF_BLOCK[k].start, MF_BLOCK[k].end, labelOf(k)+" motion fault group");
    });
})();

var gnames=Object.keys(GLOBALS).sort();
var elNames=Object.keys(ARRAY_ELEMENTS).sort(function(a,b){
    var ma=a.match(/^(\D+)\[(\d+)\]$/), mb=b.match(/^(\D+)\[(\d+)\]$/);
    return ma[1]===mb[1] ? (ma[2]-mb[2]) : ma[1]<mb[1]?-1:1;
});
// baris array-level (AL, MF) buat paste awal ke tabel Global Variable, baris per elemen (AL[61], ...) buat isi Comment
// setelah array di-expand di Susmax Studio - lihat README bagian import
var tsv="Name\tData type\tInitial value\tAT\tRetain\tConstant\tNetwork Publish\tComment\n"
      + gnames.map(function(n){ var g=GLOBALS[n];
            return [n,g.t,"","","False","False","Do not publish",g.d].join("\t"); }).join("\n")
      + (elNames.length ? "\n" + elNames.map(function(n){
            return [n,"BOOL","","","False","False","Do not publish",ARRAY_ELEMENTS[n]].join("\t"); }).join("\n") : "");
files.push({ name:"GlobalVariables.tsv", xml:tsv, stats:"GLOBAL: "+gnames.length+" variable, "+elNames.length+" array element comment" });

var globVars=gnames.map(function(n){ return "      "+vr(n,GLOBALS[n].t,GLOBALS[n].d); });
var blocks=files.filter(function(f){ return f.name.slice(-4)===".xml"; }).map(function(f){ return extractProgram(f.xml); }).filter(Boolean);
files.unshift({ name:"AllPrograms.xml", xml:progMulti("AllPrograms",blocks,globVars),
                stats:"COMBINED: "+blocks.length+" program and "+gnames.length+" global variable in one file" });

msg.payload={ files:files, warnings:warnings.join("\n"), unitCount:ukeys.length,
              stats:files.map(function(f){return f.stats;}).join("\n"),
              lscAudit:lscAudit.join("\n") };
return msg;
