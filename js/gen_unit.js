// ===== Generate Sysmac XML: DeviceInput / DeviceOutput / LSCombination / Individual / AutoOutput / HMIOutput =====
var devices = msg.payload;
var stName  = (flow.get("stName") || "ST1");
var unit    = flow.get("hmiUnit") || 1;
var inputs  = devices.filter(function(d){return d.io==="IN";});
var outputs = devices.filter(function(d){return d.io==="OUT";});
flow.set("lastDevices", devices);
flow.set("lastOutDevices", outputs);

// Sysmac tidak pakai alamat langsung: alamat fisik jadi variable I_x_xx / Q_x_xx, di-assign via I/O Map
function portVar(d){ return (d.io==="IN"?"I_":"Q_") + d.address.replace(/\./g,"_"); }

var ext=[], glob=[], priv=[];
function addG(n,t,doc){ var v=vr(n,t,doc); glob.push("      "+v); ext.push("      "+v); }
function addP(n,t,doc){ priv.push("      "+vr(n,t,doc)); }

devices.forEach(function(d){
    addG(portVar(d),"BOOL","PORT "+d.address+" : "+d.komen);
    addG(d.name,"BOOL",d.komen);
});

// --- DeviceInput ---
var rIn=[], o=1;
inputs.forEach(function(d){ rIn.push(series(o++,[[portVar(d),false]],d.name,"IN "+d.address+" : "+d.komen)); });

// --- DeviceOutput ---
var rOut=[]; o=1;
outputs.forEach(function(d){ rOut.push(series(o++,[[d.name,false]],portVar(d),"OUT "+d.address+" : "+d.komen)); });

// --- LSCombination (pasangkan AS berurutan 2-2) ---
function stripAS(n){ return n.replace(/^AS_/,""); }
var asDev = devices.filter(function(d){return d.jenis==="AS";}).sort(function(a,b){return a.row-b.row;});
var pairs=[];
for(var i=0;i<asDev.length;i+=2){ if(asDev[i+1]) pairs.push([asDev[i],asDev[i+1]]); }
var rLsc=[]; o=1;
var lscNames=[];
pairs.forEach(function(p){
    var lf="LSC_"+stripAS(p[0].name), lb="LSC_"+stripAS(p[1].name);
    rLsc.push(ls2(o,p[0].name,p[1].name,lf,lb,"LSC : "+p[0].komen+" / "+p[1].komen));
    o+=2; lscNames.push(lf); lscNames.push(lb);
    addG(lf,"BOOL","LSC "+p[0].komen); addG(lb,"BOOL","LSC "+p[1].komen);
});
// Home position = AND semua LSC sisi pertama tiap pasangan
if(pairs.length){
    var homeConds = pairs.map(function(p){ return ["LSC_"+stripAS(p[1].name), false]; });
    rLsc.push(series(o++, homeConds, "LB119", "HOME POSITION (semua actuator di posisi origin)"));
    addP("LB119","BOOL","Home Position Confirm");
}

// --- Individual (manual jog per solenoid output) ---
var rInd=[]; o=1; var indBits=[];
rInd.push(series(o++,[["IND_MODE",false],["LB134",false],["LB139",false]],"LB319","Individual mode allowed"));
addP("LB319","BOOL","Individual Operation Allowed");
outputs.forEach(function(d,idx){
    var indBit = "LB"+(1500+idx*1);
    var btn = "PB_IND_"+d.name;
    indBits.push(indBit);
    addP(indBit,"BOOL","IND CMD "+d.komen);
    addG(btn,"BOOL","PB Individual "+d.komen);
    rInd.push(series(o++,[[btn,false],["LB319",false]],indBit,"IND : "+d.komen));
});

// --- AutoOutput (merge auto + individual) ---
var rAo=[]; o=1;
outputs.forEach(function(d,idx){
    var autoBit = "LB"+(410+idx);
    addP(autoBit,"BOOL","AUTO CMD "+d.komen);
    rAo.push(merge2(o++, autoBit, indBits[idx], d.name, "OUTPUT : "+d.komen));
});

// --- HMIOutput (mirror pasangan AS ke lampu HMI) ---
var rHmi=[]; o=1;
function lastNum(a){ var m=(a||"").match(/(\d+)(?!.*\d)/); return m?parseInt(m[1],10):0; }
pairs.forEach(function(p,idx){
    var page = 1 + Math.floor(idx/4), act = (idx%4)+1;
    var odd = lastNum(p[0].address)%2===1;
    var mDev = odd?p[1]:p[0], rDev = odd?p[0]:p[1];
    var sM = "PL4"+unit+page+"_"+act+"M", sR = "PL4"+unit+page+"_"+act+"R";
    rHmi.push(series(o++,[[mDev.name,false]],sM,"HMI "+mDev.komen));
    rHmi.push(series(o++,[[rDev.name,false]],sR,"HMI "+rDev.komen));
    addG(sM,"BOOL",mDev.komen); addG(sR,"BOOL",rDev.komen);
});
addG("LB134","BOOL","Emergency Stop OFF (dari Fault)");
addG("LB139","BOOL","Auto Stop OFF (dari Fault)");
addG("IND_MODE","BOOL","Individual Mode");

var sections = [
    sect("DeviceInput",1,rIn),
    sect("LSCombination",2,rLsc),
    sect("Individual",3,rInd),
    sect("AutoOutput",4,rAo),
    sect("DeviceOutput",5,rOut),
    sect("HMIOutput",6,rHmi)
];
msg.payload = {
    xml: prog("P0"+stName.replace(/\D/g,"")+"0_"+stName, ext, priv, sections, glob),
    stName: stName, inCount: inputs.length, outCount: outputs.length, pairCount: pairs.length
};
return msg;
