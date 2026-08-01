// ===== CX-Programmer: Generate P010_Main.cxr (bagian yang belum ada di flow CX lama) =====
// Input msg.payload = TSV opsional: NamaStation<TAB>Keterangan  (kosong -> ST1,ST2,ST3)
var raw = (msg.payload && typeof msg.payload==="string") ? msg.payload.trim() : "";
var stations = raw ? raw.split('\n').filter(function(r){return r.trim()!=="";}).map(function(r){
        var c=r.split('\t'); return {name:(c[0]||"").trim(), doc:(c[1]||"").trim()};
    }).filter(function(s){return s.name;})
  : [{name:"ST1",doc:"Hopper 4 lane + divider"},{name:"ST2",doc:"Servo shuttle"},{name:"ST3",doc:"Pusher ejector"}];

var m="", G="", L="";
function H(t){ m += "      '  "+t+"\n"; }
function R(lines){ lines.forEach(function(l){ m += "      "+l+"\n"; }); m += "      ^^^\n"; }
function gs(n,c){ G += "      "+n+"\tBOOL\t\t"+c+"\t\t0\t\n"; }
function ls(n,c){ L += "      "+n+"\tBOOL\t\t"+c+"\t\t0\t\n"; }
function gb(i,bit){ return "GB"+String(i+1).padStart(3,"0")+"_"+String(bit).padStart(3,"0"); }

// --- Symbol global dari tiap station ---
stations.forEach(function(s,i){
    gs(gb(i,0), s.name+" Home Position");
    gs(gb(i,1), s.name+" Emergency Stop Fault OFF");
    gs(gb(i,2), s.name+" Auto Stop Fault OFF");
    gs(gb(i,3), s.name+" Cycle Stop Fault OFF");
    gs(gb(i,4), s.name+" Fault Stopping OFF");
    gs(gb(i,5), s.name+" Machine Abeyance");
    gs(gb(i,6), s.name+" Auto Operation Complete");
    gs(gb(i,10), s.name+" Auto Operation Start (dari Main)");
});
["NOT_EMG_STOP","FUSE_GOOD","AIR_SC_CONF","SAFE_CONF","MSTR_RDY","PB_MSTR_ON","PB_AUTO_RUN","PB_CYCL_STOP",
 "PB_FLT_RST","SS_AUTO_IND","PWR_ON","PLC_GOOD","GSB000","PL_MSTR_ON","PL_AUTO_RUN","BZ_BUZZER1",
 "PL_TWR_RED","PL_TWR_YLW","PL_TWR_GRN","EMER_INTLK","AUTO_RUN"].forEach(function(n){ gs(n,n); });
G += "      n253_13\tBOOL\tCF113\tAlways ON\t\t0\t\n";
G += "      AUTO_MODE\tTIMER\t\t\t0\t\n";
G += "      IND_MODE\tTIMER\t\t\t0\t\n";
G += "      LT001\tTIMER\t\tMaster On Delay\t\t0\t\n";

// --- 1. MASTER ON ---
H("MASTER ON\\n=================================");
R(["LD PLC_GOOD","AND PWR_ON","OUT GSB000"]);
R(["LD MSTR_RDY","ANDNOT PB_MSTR_ON","OR LB128","OUT TR0","ANDNOT LB129","OUT LB128",
   "LD TR0","ANDNOT MSTR_RDY","OUT LB129"]);
R(["LD n253_13","TIM LT001 #20"]);
ls("LB128","Master ON Latch"); ls("LB129","Master OFF");

// --- 2. MODE ---
H("AUTO / IND MODE\\n=================================");
R(["LD SS_AUTO_IND","AND MSTR_RDY","TIM AUTO_MODE #10"]);
R(["LDNOT SS_AUTO_IND","AND MSTR_RDY","TIM IND_MODE #10"]);

// --- 3. MACHINE CONDITION ---
H("MACHINE ABEYANCE\\n=================================");
R(["LD GSB000","OUT LB280"]); R(["LD GSB000","OUT LB281"]); R(["LD LB280","AND LB281","OUT LB284"]);
H("MACHINE HOME POSITION\\n=================================");
var hl=["LD "+gb(0,0)]; stations.forEach(function(s,i){ if(i>0) hl.push("AND "+gb(i,0)); }); hl.push("OUT LB285");
R(hl); R(["LD GSB000","OUT LB286"]); R(["LD LB285","AND LB286","OUT LB289"]);
H("AUTOSTART COND EXC HOME POS\\n=================================");
R(["LD GSB000","OUT LB290"]); R(["LD GSB000","OUT LB291"]); R(["LD LB290","AND LB291","OUT LB294"]);
R(["LD LB289","AND LB294","AND LB284","OUT LB309"]);
["LB280","LB281","LB284","LB285","LB286","LB289","LB290","LB291","LB294","LB309"].forEach(function(b){ ls(b,"Condition aux "+b); });

// --- 4. AUTO MAIN LOOP ---
H("AUTO RUNNING CONDITION\\n=================================");
R(["LD AUTO_MODE","AND MSTR_RDY","AND LB134","AND LB139","OUT LB1110"]);
R(["LD LB1110","OUT LB1119"]);
H("AUTO RUNNING latch\\n=================================");
R(["LD AUTO_MODE","@AND PB_AUTO_RUN","AND LB289","AND LB294","OR LB1200","AND LB1119",
   "LDNOT LB1201","ORNOT LB284","ANDLD","OUT LB1200"]);
R(["LD PB_CYCL_STOP","ORNOT LB144","OR LB1201","AND LB1200","OUT LB1201"]);
R(["LD LB1200","OUT AUTO_RUN"]);
["LB1110","LB1119","LB1200","LB1201"].forEach(function(b){ ls(b,"Auto main "+b); });
H("STATION LOOPING\\n=================================");
stations.forEach(function(s,i){
    var st="LB"+(1210+i*2), cp="LB"+(1211+i*2);
    ls(st, s.name+" Auto Operation Start"); ls(cp, s.name+" Auto Operation Complete");
    R(["LD LB309","ANDNOT "+cp,"ANDNOT LB1201","OR "+st,"AND LB1200","OUT "+st]);
    R(["LD "+gb(i,6),"OR "+cp,"AND "+st,"OUT "+cp]);
    R(["LD "+st,"OUT "+gb(i,10)]);
});

// --- 5. FAULT INTEGRATION ---
H("FAULT INTEGRATION (dari tiap station)\\n=================================");
[[1,"LB130","LB131","LB134","Emergency Stop"],[2,"LB135","LB136","LB139","Auto Stop"],
 [3,"LB140","LB141","LB144","Cycle Stop"],[4,"LB145","LB146","LB149","Fault Stop"]].forEach(function(L2){
    var lines=["LD "+gb(0,L2[0])];
    stations.forEach(function(s,i){ if(i>0) lines.push("AND "+gb(i,L2[0])); });
    lines.push("OUT "+L2[1]); R(lines);
    R(["LD GSB000","OUT "+L2[2]]);
    R(["LD "+L2[1],"AND "+L2[2],"OUT "+L2[3]]);
    ls(L2[1],L2[4]+" aux1"); ls(L2[2],L2[4]+" aux2"); ls(L2[3],L2[4]+" OFF");
});
R(["LD LB134","AND LB139","AND LB144","AND LB149","OUT LB160"]);
R(["LD PB_FLT_RST","OR LB161","ANDNOT LB160","OUT LB161"]);
R(["LD LB160","OUT LB168"]);
R(["LDNOT LB160","ANDNOT LB161","AND LT001","OUT LB169"]);
["LB160","LB161","LB168","LB169"].forEach(function(b){ ls(b,"Fault/buzzer "+b); });

// --- 6. MAIN OUTPUT ---
H("MAIN OUTPUT\\n=================================");
R(["LD LB128","OUT PL_MSTR_ON"]);
R(["LD LB1200","OUT PL_AUTO_RUN"]);
R(["LD LB169","OUT BZ_BUZZER1"]);
R(["LD LB134","OUT EMER_INTLK"]);
R(["LDNOT LB160","OUT PL_TWR_RED"]);
R(["LD LB1201","OUT PL_TWR_YLW"]);
R(["LD LB1200","AND LB160","OUT PL_TWR_GRN"]);

var cxr = "<LIBRARY>\n  <PLCTYPE>\n    CJ2M\n  </PLCTYPE>\n  <SECTION>\n    <MNEMONIC>\n"
        + m.replace(/\s+$/,"") + "\n    </MNEMONIC>\n    <GLOBALSYMBOL>\n"
        + G.replace(/\s+$/,"") + "\n    </GLOBALSYMBOL>\n    <LOCALSYMBOL>\n"
        + L.replace(/\s+$/,"") + "\n    </LOCALSYMBOL>\n  </SECTION>\n</LIBRARY>";
msg.payload = { cxr: cxr, mnemonic: m, stations: stations.map(function(s){return s.name;}).join(", ") };
return msg;
