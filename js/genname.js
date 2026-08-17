// Generate nama symbol dari Jenis + Komen (sama persis dengan flow CX supaya nama konsisten)
var PRE = {PB:"PB_",CR:"CR_",LS:"LS_",SS:"SS_","2P":"P2_",PH:"PH_",PX:"PX_",PL:"PL_",BZ:"BZ_",AS:"AS_",SOL:"SOL_",SRV_LS:"LS_",SRV_CMD:"SRV_"};
var ABBR = {CONFIRM:"CNF",CONF:"CNF",CLOSE:"CLS",OPEN:"OPN",FORWARD:"FWD",BACKWARD:"BWD",POSITION:"POS",SENSOR:"SNR",
WORKPIECE:"WP",WORK:"WP",PIECE:"PC",DETECT:"DET",PRESENCE:"PRS",READY:"RDY",START:"STR",STOP:"STP",EMERGENCY:"EMG",
MASTER:"MST",BUTTON:"BTN",SWITCH:"SW",PRESSURE:"PRS",LOW:"LOW",HIGH:"HI",LEFT:"LFT",RIGHT:"RGT",FRONT:"FRN",REAR:"RER",
CYLINDER:"CYL",COVER:"CVR",PLATE:"PLT",UP:"UP",DOWN:"DN",HOME:"HM",CENTER:"CTR",CENTRE:"CTR",AUTO:"AUT",MANUAL:"MAN",
FAULT:"FLT",DANDORI:"DDR",SCAN:"SCN",TRANSFER:"TRF",EJECT:"EJC",EJECTOR:"EJC",PUSH:"PSH",PUSHER:"PSH",SHUTTER:"SHT",
FLOW:"FLW",OUT:"OUT",IN:"IN",INSERT:"INS",EXIST:"EXS",STOPPER:"STP",CHUCK:"CHK",UNCHUCK:"UCHK",DIVIDER:"DIV",
SAFETY:"SFT",INTERLOCK:"INTLK",FEEDER:"FDR",TOWER:"TWR",LAMP:"LMP",GREEN:"GRN",YELLOW:"YLW",RED:"RED",FULL:"FULL",
RUNNING:"RUN",MACHINE:"MC",CYCLE:"CYC",RESET:"RST",ENABLE:"ENB",LOCK:"LCK",UNLOCK:"ULCK",KANBAN:"KBN",TRACE:"TRC",
SOURCE:"SRC",GOOD:"GOOD",FUSE:"FUSE",PART:"PART",TYPE:"TYP"};
function shortenWord(w){
    var u = w.toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(!u) return "";
    var m = u.match(/^([A-Z]+)(\d*)$/);
    if(m){ var b=m[1], n=m[2];
        if(ABBR[b]) return ABBR[b]+n;
        if(b.length>4){ b = b[0] + b.slice(1).replace(/[AEIOU]/g,""); if(b.length>4) b=b.slice(0,4); }
        return b+n; }
    return u;
}
function prefixFor(j){ if(PRE[j]) return PRE[j]; if(!j) return "X_"; var p=j.replace(/[^A-Z0-9]/g,""); if(/^[0-9]/.test(p)) p="T"+p; return p+"_"; }
function buildName(pre,k){ return pre + k.split(/\s+/).filter(Boolean).map(shortenWord).filter(Boolean).join("_"); }
function std(jenis,io,komen){
    var k = komen.toUpperCase().replace(/[^A-Z0-9\s]/g,"");
    if(k.indexOf("EMERGENCY")>=0||k.indexOf("EMER STOP")>=0){
        if(io==="OUT"||k.indexOf("INTERLOCK")>=0||k.indexOf("INTLK")>=0) return "EMER_INTLK";
        return "NOT_EMG_STOP"; }
    if(k.indexOf("FUSE GOOD")>=0) return "FUSE_GOOD";
    if(k.indexOf("AIR SOURCE")>=0||k.indexOf("AIR SC")>=0) return "AIR_SC_CONF";
    if(k.indexOf("SAFETY CONF")>=0||k.indexOf("SAFE CONF")>=0) return "SAFE_CONF";
    if(k.indexOf("PLC GOOD")>=0) return "PLC_GOOD";
    if(k.indexOf("POWER ON")>=0||k.indexOf("PWR ON")>=0) return "PWR_ON";
    // Satu tombol, empat cara IO list menuliskannya. Simbolnya PB_ALM_RST - itu nama standarnya,
    // dan tombol ini memang membungkam alarm, bukan cuma fault.
    if(k.indexOf("ALARM RESET")>=0||k.indexOf("ALM RESET")>=0
       ||k.indexOf("FAULT RESET")>=0||k.indexOf("FLT RESET")>=0) return "PB_ALM_RST";
    if(k.indexOf("MACHINE STOP")>=0) return "PB_MC_STOP";
    if(k.indexOf("HOME POS")>=0) return "HOME_POS";
    if(k.indexOf("MASTER ON")>=0){
        if(jenis==="PB") return "PB_MSTR_ON";
        if(jenis==="PL") return "PL_MSTR_ON";
        if(k.indexOf("CONF")>=0||k.indexOf("RDY")>=0||jenis==="CR") return "MSTR_RDY";
        return null; }
    if(k.indexOf("AUTO RUN")>=0||k.indexOf("AUTO RUNNING")>=0){
        if(jenis==="PB") return "PB_AUTO_RUN";
        if(jenis==="PL") return "PL_AUTO_RUN";
        return "AUTO_RUN"; }
    if(k.indexOf("AUTO IND")>=0||k.indexOf("AUTO MODE")>=0) return "SS_AUTO_IND";
    if(k.indexOf("CYCLE STOP")>=0||k.indexOf("CYC STOP")>=0) return "PB_CYCL_STOP";
    return null;
}
var devices = msg.payload || [];
var used = {};
devices.forEach(function(d){
    var f = std(d.jenis,d.io,d.komen||"");
    if(!f) f = buildName(prefixFor(d.jenis), d.komen||"NONAME");
    var base=f, n=2;
    while(used[f]){ f = base+"_"+n; n++; }
    d.name = f; used[f]=1;
});
msg.payload = devices;
return msg;
