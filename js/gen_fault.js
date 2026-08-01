// ===== Generate Sysmac XML: Fault section per unit (AL/MF + integrasi + Station_out GB) =====
var devices = flow.get("lastDevices") || [];
var stName  = flow.get("stName") || "ST1";
if(!devices.length){ msg.payload = { xml:"", warnings:"Belum ada data. Generate Unit Sections dulu." }; return msg; }

var warnings=[];
function has(n){ return devices.some(function(d){return d.name===n;}); }
function res(n,label){ if(!has(n)){ warnings.push('Device "'+n+'" ('+label+') tidak ada -> pakai P_Off.'); return "P_Off"; } return n; }
function stripAS(n){ return n.replace(/^AS_/,""); }
function AL(n){ return "AL"+String(n).padStart(3,"0"); }
function MF(n){ return "MF"+String(n).padStart(3,"0"); }

var sEmg=res("NOT_EMG_STOP","Emergency Stop NC"), sFuse=res("FUSE_GOOD","Fuse"),
    sAir=res("AIR_SC_CONF","Air Source"), sSafe=res("SAFE_CONF","Safety"),
    sRst=res("PB_FLT_RST","PB Fault Reset"), sPwr=has("PWR_ON")?"PWR_ON":"GSB000";

var ext=[],priv=[],glob=[];
function addG(n,t,d){ var v=vr(n,t,d); glob.push("      "+v); ext.push("      "+v); }
function addP(n,t,d){ priv.push("      "+vr(n,t,d)); }
["GSB000","P_Off",sEmg,sFuse,sAir,sSafe,sRst].forEach(function(n){ if(n!=="P_Off") addG(n,"BOOL",n); });

// --- Emergency Stop AL001-AL020 ---
var rA=[], o=1, alUsed=[];
function alarm(n,conds,cmt,noLatch){
    var t = AL(n); alUsed.push(t); addP(t,"BOOL",t+" "+cmt);
    if(noLatch) rA.push(series(o++,conds.concat([[sRst,true]]),t,cmt));
    else rA.push(latch(o++,[[ "__TRIG__",false]],t,[],cmt)); // placeholder tidak dipakai
    return t;
}
// pakai latch eksplisit supaya jelas
function alarmLatch(n,conds,cmt){
    var t=AL(n); alUsed.push(t); addP(t,"BOOL",t+" "+cmt);
    var r=new Rung(o++,cmt); var rail=r.rail();
    var cur=rail; conds.forEach(function(c){ cur=r.ct(c[0],cur,c[1]); });
    var self=r.ct(t,rail);
    var x=r.clm(t,[cur,self]); r.rr([x]); rA.push(r.build()); return t;
}
function alarmWarn(n,conds,cmt){
    var t=AL(n); alUsed.push(t); addP(t,"BOOL",t+" "+cmt);
    var r=new Rung(o++,cmt); var rail=r.rail();
    var cur=rail; conds.forEach(function(c){ cur=r.ct(c[0],cur,c[1]); });
    var self=r.ct(t,rail);
    var g=r.ctm(sRst,[cur,self],true);
    var x=r.cl(t,g); r.rr([x]); rA.push(r.build()); return t;
}
alarmLatch(1,[[sPwr,false],[sEmg,true]],"AL001 EMERGENCY STOP");
alarmLatch(2,[[sPwr,false],[sFuse,true]],"AL002 FUSE OFF");
alarmLatch(3,[[sPwr,false],[sAir,true]],"AL003 AIR SOURCE OFF");
alarmLatch(4,[[sPwr,false],[sSafe,true]],"AL004 SAFETY OPEN");
var emgList = alUsed.slice();

// --- Dual AS Fault AL061.. ---
var asDev = devices.filter(function(d){return d.jenis==="AS";}).sort(function(a,b){return a.row-b.row;});
var pairs=[]; for(var i=0;i<asDev.length;i+=2){ if(asDev[i+1]) pairs.push([asDev[i],asDev[i+1]]); }
var fltList=[], aln=61;
pairs.forEach(function(p){
    if(aln>80) return;
    fltList.push(alarmLatch(aln,[[p[0].name,false],[p[1].name,false]],AL(aln)+" DUAL AS : "+p[0].komen+" / "+p[1].komen));
    aln++;
});

// --- Cylinder Motion Fault MF001.. (SOL ON tapi LSC tidak confirm) ---
// pasangkan solenoid output ke AS pair via kemiripan token
function tok(d){ if(!d) return []; return (d.name+" "+(d.komen||"")).toUpperCase().split(/[^A-Z0-9]+/)
    .filter(function(w){ return w.length>1 && ["AS","CR","SOL","PB","OUT","IN","SPARE","ST1","ST2","ST3"].indexOf(w)<0; }); }
function score(a,b){ var t1=tok(a),t2=tok(b),m=0; t1.forEach(function(t){ if(t2.indexOf(t)>=0) m++; }); return m; }
var sols = devices.filter(function(d){ return d.io==="OUT" && (d.jenis==="CR"||d.jenis==="SOL"); });
var avail = sols.slice(), mfn=1;
pairs.forEach(function(p){
    if(mfn>16) return;
    var bA=null,mA=0,bB=null,mB=0;
    avail.forEach(function(s){ var v=score(p[0],s); if(v>mA){mA=v;bA=s;} });
    if(bA) avail = avail.filter(function(s){return s!==bA;});
    avail.forEach(function(s){ var v=score(p[1],s); if(v>mB){mB=v;bB=s;} });
    if(bB) avail = avail.filter(function(s){return s!==bB;});
    if(!(bA&&bB&&mA>0&&mB>0)) return;
    var mf=MF(mfn), tmr="TMR_"+mf, lscA="LSC_"+stripAS(p[0].name), lscB="LSC_"+stripAS(p[1].name);
    addP(mf,"BOOL",mf+" MOTION FAULT "+bA.komen+" / "+bB.komen);
    addP(tmr,"_sTimer","Timer motion fault "+mf);
    addG(lscA,"BOOL","LSC "+p[0].komen); addG(lscB,"BOOL","LSC "+p[1].komen);
    // (SOL_A ANDNOT LSC_A) OR (SOL_B ANDNOT LSC_B) OR MF -> MF_TRIG
    var trg = mf+"_TRIG"; addP(trg,"BOOL","Trigger "+mf);
    var r=new Rung(o++,mf+" motion fault trigger : "+bA.komen+" / "+bB.komen);
    var rail=r.rail();
    var a1=r.ct(bA.name,rail); var a2=r.ct(lscA,a1,true);
    var b1=r.ct(bB.name,rail); var b2=r.ct(lscB,b1,true);
    var x=r.clm(trg,[a2,b2]); r.rr([x]); rA.push(r.build());
    // MF = TRIG delayed (TON dipasang manual di Sysmac; sementara langsung latch)
    rA.push(latch(o++,[[trg,false]],mf,[],mf+" latch (pasang TON "+tmr+" 500ms di Sysmac utk delay)"));
    fltList.push(mf); mfn++;
});

// --- Warning AL081 (auto-clear) ---
alarmWarn(81,[["P_Off",false]],"AL081 SPARE WARNING");
var warnList=["AL081"];

// --- Integrasi per level (chunk max 6) ---
var rI=[], oi=1, auxSink=[];
function integ(list,aux1,aux2,out,label){
    if(!list.length){ rI.push(series(oi++,[["GSB000",false]],aux1,label+" (tidak ada alarm)")); }
    else { var c=chunkNot(oi,list,aux1,aux1,label+" integration",auxSink); rI.push(c.xml); oi+=c.n; }
    rI.push(series(oi++,[["GSB000",false]],aux2));
    rI.push(series(oi++,[[aux1,false],[aux2,false]],out,label+" OFF"));
    [aux1,aux2,out].forEach(function(b){ addP(b,"BOOL",label+" "+b); });
}
integ(emgList,"LB130","LB131","LB134","Emergency Stop");
integ([],"LB135","LB136","LB139","Auto Stop");
integ([],"LB140","LB141","LB144","Cycle Stop");
integ(fltList,"LB145","LB146","LB149","Fault Stop");
integ(warnList,"LB150","LB151","LB154","Warning");
auxSink.forEach(function(b){ addP(b,"BOOL","Integration chunk aux"); });
rI.push(series(oi++,[["LB134",false],["LB139",false],["LB144",false],["LB149",false]],"LB160","NO FAULT"));
rI.push(series(oi++,[["LB154",false]],"LB162","NO WARNING"));
rI.push(series(oi++,[["LB160",false],["LB162",false]],"LB168","NORMAL"));
rI.push(series(oi++,[["LB160",true]],"LB169","BUZZER"));
["LB160","LB162","LB168","LB169"].forEach(function(b){ addP(b,"BOOL","Buzzer/status "+b); });

// --- Station_out : export GB ke Main ---
var stIdx = parseInt(stName.replace(/\D/g,""),10) || 1;
function gbn(bit){ return "GB"+String(stIdx).padStart(3,"0")+"_"+String(bit).padStart(3,"0"); }
var rS=[], os=1;
[["LB119",0,"Home Position"],["LB134",1,"Emergency Stop Fault OFF"],["LB139",2,"Auto Stop Fault OFF"],
 ["LB144",3,"Cycle Stop Fault OFF"],["LB149",4,"Fault Stopping OFF"],["LB284",5,"Machine Abeyance"],
 ["LB499",6,"Auto Operation Complete"]].forEach(function(x){
    rS.push(series(os++,[[x[0],false]],gbn(x[1]),stName+" "+x[2]));
    addG(gbn(x[1]),"BOOL",stName+" "+x[2]);
});
["LB119","LB284","LB499"].forEach(function(b){ addG(b,"BOOL","dari section lain "+b); });

var sections=[ sect("Fault",1,rA), sect("Fault_Integration",2,rI), sect("Station_Out",3,rS) ];
msg.payload = {
    xml: prog("P0"+stIdx+"1_"+stName+"_Fault", ext, priv, sections, glob),
    warnings: warnings.join("\n"), alCount: alUsed.length, mfCount: mfn-1, pairCount: pairs.length
};
return msg;
