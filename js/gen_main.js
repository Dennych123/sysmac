// ===== Generate Sysmac XML: P010_Main (koordinator antar station) =====
// Input msg.payload = TSV opsional: NamaStation<TAB>Keterangan  (kosong -> ST1,ST2,ST3)
var raw = (msg.payload && typeof msg.payload === "string") ? msg.payload.trim() : "";
var stations = raw ? raw.split('\n').filter(function(r){return r.trim()!=="";}).map(function(r){
        var c=r.split('\t'); return { name:(c[0]||"").trim(), doc:(c[1]||"").trim() };
    }).filter(function(s){return s.name;})
  : [ {name:"ST1",doc:"Hopper 4 lane + divider"}, {name:"ST2",doc:"Servo shuttle"}, {name:"ST3",doc:"Pusher ejector"} ];

var ext=[], priv=[], glob=[];
function addG(n,t,d){ var v=vr(n,t,d); glob.push("      "+v); ext.push("      "+v); }
function addP(n,t,d){ priv.push("      "+vr(n,t,d)); }

// Bit global per station yang di-export Station_out tiap unit
stations.forEach(function(s,i){
    var w = String(Math.floor(i)+1).padStart(3,"0");
    addG("GB"+w+"_000","BOOL",s.name+" Home Position");
    addG("GB"+w+"_001","BOOL",s.name+" Emergency Stop Fault OFF");
    addG("GB"+w+"_002","BOOL",s.name+" Auto Stop Fault OFF");
    addG("GB"+w+"_003","BOOL",s.name+" Cycle Stop Fault OFF");
    addG("GB"+w+"_004","BOOL",s.name+" Fault Stopping OFF");
    addG("GB"+w+"_005","BOOL",s.name+" Machine Abeyance");
    addG("GB"+w+"_006","BOOL",s.name+" Auto Operation Complete");
    addG("GB"+w+"_010","BOOL",s.name+" Auto Operation Start (dari Main)");
});
function gb(i,bit){ return "GB"+String(i+1).padStart(3,"0")+"_"+String(bit).padStart(3,"0"); }

["NOT_EMG_STOP","FUSE_GOOD","AIR_SC_CONF","SAFE_CONF","MSTR_RDY","PB_MSTR_ON","PB_AUTO_RUN","PB_CYCL_STOP",
 "PB_FLT_RST","PB_MC_STOP","SS_AUTO_IND","PWR_ON","PLC_GOOD","GSB000",
 "PL_MSTR_ON","PL_AUTO_RUN","BZ_BUZZER1","PL_TWR_RED","PL_TWR_YLW","PL_TWR_GRN","EMER_INTLK"
].forEach(function(n){ addG(n,"BOOL",n); });

// ---------- 1. Master ON ----------
var s1=[],o=1;
s1.push(series(o++,[["PLC_GOOD",false],["PWR_ON",false]],"GSB000","Always ON untuk equipment setting"));
s1.push(latch(o++,[["PB_MSTR_ON",false]],"LB128",[["MSTR_RDY",false],["LB129",true]],"Master ON latch"));
s1.push(series(o++,[["MSTR_RDY",true]],"LB129","Master OFF"));
s1.push(series(o++,[["LB134",false]],"EMER_INTLK","Emergency stop interlock output"));
addP("LB128","BOOL","Master ON Latch"); addP("LB129","BOOL","Master OFF");

// ---------- 2. Mode ----------
var s2=[]; o=1;
s2.push(series(o++,[["SS_AUTO_IND",false],["MSTR_RDY",false]],"AUTO_MODE","AUTO mode (selector ON + master ready)"));
s2.push(series(o++,[["SS_AUTO_IND",true],["MSTR_RDY",false]],"IND_MODE","IND mode"));
addG("AUTO_MODE","BOOL","Auto Mode"); addG("IND_MODE","BOOL","Individual Mode");

// ---------- 3. Machine Condition (dual-aux Denso) ----------
var s3=[]; o=1;
s3.push(dualAux(o,"GSB000","LB280","GSB000","LB281","LB284","MACHINE ABEYANCE")); o+=3;
var homeConds = stations.map(function(s,i){ return [gb(i,0), false]; });
s3.push(series(o++,homeConds,"LB285","Semua station di home position"));
s3.push(series(o++,[["GSB000",false]],"LB286"));
s3.push(series(o++,[["LB285",false],["LB286",false]],"LB289","MACHINE HOME POSITION"));
s3.push(dualAux(o,"GSB000","LB290","GSB000","LB291","LB294","AUTOSTART COND EXC HOME POS")); o+=3;
s3.push(series(o++,[["LB289",false],["LB294",false],["LB284",false]],"LB309","AUTORUN CONDITION"));
["LB280","LB281","LB284","LB285","LB286","LB289","LB290","LB291","LB294","LB309"].forEach(function(b){ addP(b,"BOOL","Condition aux "+b); });

// ---------- 4. Auto Main Loop ----------
var s4=[]; o=1;
s4.push(series(o++,[["AUTO_MODE",false],["MSTR_RDY",false],["LB134",false],["LB139",false]],"LB1110","Auto running cond aux"));
s4.push(series(o++,[["LB1110",false]],"LB1119","AUTO RUNNING COND"));
s4.push(latch(o++,[["PB_AUTO_RUN",false]],"LB1200",[["LB1119",false],["LB289",false],["LB294",false],["LB1201",true]],"AUTO RUNNING latch"));
s4.push(latch(o++,[["PB_CYCL_STOP",false],["LB144",true]],"LB1201",[["LB1200",false]],"CYCLE STOP latch"));
["LB1110","LB1119","LB1200","LB1201"].forEach(function(b){ addP(b,"BOOL","Auto main "+b); });
// Station start/complete berantai: ST(n) start = autorun cond & bukan cycle stop; complete dari GB
stations.forEach(function(s,i){
    var st = "LB"+(1210+i*2), cp = "LB"+(1211+i*2);
    addP(st,"BOOL",s.name+" Auto Operation Start"); addP(cp,"BOOL",s.name+" Auto Operation Complete");
    s4.push(latch(o++,[["LB309",false]],st,[["LB1200",false],["LB1201",true],[cp,true]],s.name+" AUTO START"));
    s4.push(latch(o++,[[gb(i,6),false]],cp,[[st,false]],s.name+" AUTO COMPLETE"));
    s4.push(series(o++,[[st,false]],gb(i,10),s.name+" start command ke unit"));
});

// ---------- 5. Fault Integration (kumpulkan fault-off tiap station) ----------
var s5=[]; o=1;
var lv = [ {bit:1,aux1:"LB130",aux2:"LB131",out:"LB134",nm:"Emergency Stop"},
           {bit:2,aux1:"LB135",aux2:"LB136",out:"LB139",nm:"Auto Stop"},
           {bit:3,aux1:"LB140",aux2:"LB141",out:"LB144",nm:"Cycle Stop"},
           {bit:4,aux1:"LB145",aux2:"LB146",out:"LB149",nm:"Fault Stop"} ];
lv.forEach(function(L){
    var conds = stations.map(function(s,i){ return [gb(i,L.bit), false]; });
    s5.push(series(o++,conds,L.aux1,L.nm+" : semua station OK"));
    s5.push(series(o++,[["GSB000",false]],L.aux2));
    s5.push(series(o++,[[L.aux1,false],[L.aux2,false]],L.out,L.nm+" OFF"));
    addP(L.aux1,"BOOL",L.nm+" aux1"); addP(L.aux2,"BOOL",L.nm+" aux2"); addP(L.out,"BOOL",L.nm+" OFF");
});
s5.push(series(o++,[["LB134",false],["LB139",false],["LB144",false],["LB149",false]],"LB160","NO FAULT"));
s5.push(latch(o++,[["PB_FLT_RST",false]],"LB161",[["LB160",true]],"Alarm reset fault"));
s5.push(series(o++,[["LB160",false]],"LB168","NORMAL"));
s5.push(series(o++,[["LB160",true],["LB161",true]],"LB169","BUZZER"));
["LB160","LB161","LB168","LB169"].forEach(function(b){ addP(b,"BOOL","Fault integration "+b); });

// ---------- 6. Main Output (tower lamp / pilot lamp) ----------
var s6=[]; o=1;
s6.push(series(o++,[["LB128",false]],"PL_MSTR_ON","PL Master ON"));
s6.push(series(o++,[["LB1200",false]],"PL_AUTO_RUN","PL Auto Running"));
s6.push(series(o++,[["LB169",false]],"BZ_BUZZER1","Buzzer"));
s6.push(series(o++,[["LB160",true]],"PL_TWR_RED","Tower RED = ada fault"));
s6.push(series(o++,[["LB1201",false]],"PL_TWR_YLW","Tower YELLOW = cycle stop"));
s6.push(series(o++,[["LB1200",false],["LB160",false]],"PL_TWR_GRN","Tower GREEN = running normal"));

// ---------- 7. HMI Main ----------
var s7=[]; o=1;
[["LB1200","W_HMI_AUTO_RUN","Auto Running"],["LB1201","W_HMI_CYC_STOP","Cycle Stop"],
 ["LB168","W_HMI_NORMAL","Normal"],["LB289","W_HMI_HOME","Machine Home"]].forEach(function(x){
    s7.push(series(o++,[[x[0],false]],x[1],"HMI "+x[2])); addG(x[1],"BOOL","HMI "+x[2]);
});

var sections = [ sect("Master_ON",1,s1), sect("Mode",2,s2), sect("Machine_Condition",3,s3),
                 sect("Auto_Main_Loop",4,s4), sect("Fault_Integration",5,s5),
                 sect("Main_Output",6,s6), sect("HMI_Main",7,s7) ];
msg.payload = { xml: prog("P010_Main", ext, priv, sections, glob), stations: stations.map(function(s){return s.name;}).join(", ") };
return msg;
