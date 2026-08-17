// ===== Generate program XML per station + main, jumlah unit dinamis =====
var groups   = flow.get("groups") || {};
var PER_PAGE;   // aktuator per screen HMI - disetel di blok "Peta alamat HMI" di bawah
var files = [], warnings = [], lscAudit = [];

// ===== Warning terstruktur =====
// warnings[] (string) tetap dipertahankan - itu yang dipakai panel warning lama dan gampang dibaca
// manusia. Tapi string doang gak cukup buat konsumen mesin: mau ngelompokin per station, mau
// nyaring per jenis, atau (nanti) mau LLM yang mutusin gimana nanganin tiap masalah - semuanya
// butuh KODE yang stabil, bukan nebak dari teks bahasa Indonesia/Inggris yang bisa berubah kapan aja.
// W() nulis ke dua-duanya sekaligus, jadi gak ada jalur yang kelewat.
//   level : "warn" (default) | "info"
//   code  : slug stabil, JANGAN diubah sembarangan - konsumen luar nyantol ke sini
var warnList = [];
function W(code, station, message, extra){
    var w = { level: (extra && extra.level) || "warn", code: code, station: station || "", message: message };
    if(extra && extra.device) w.device = extra.device;
    warnList.push(w);
    warnings.push(message);
    return w;
}
var GLOBALS = {};
// Timer default (debounce PH/PX, motion-fault) bisa disetel lewat web UI - format harus "T#<angka><unit>"
// (MS/S/M/H), soalnya nilainya ditempel LANGSUNG jadi XML attribute tanpa escape (lihat lib.js ton()) -
// input sembarangan bisa ngerusak XML, jadi divalidasi ketat, salah format jatuh ke default + warning.
var timerDefaults = flow.get("timerDefaults") || {};
function validTimer(v, fallback, label){
    v=(v||"").trim();
    if(!v) return fallback;
    if(!/^T#\d+(\.\d+)?(MS|S|M|H)$/i.test(v)){ W("timer_format","",'Timer default '+label+' "'+v+'" invalid format (expected e.g. T#200MS), using default '+fallback+'.'); return fallback; }
    return v.toUpperCase();
}
var T_PHPX   = validTimer(timerDefaults.phpx, "T#200MS", "PH/PX debounce");
var T_MOTION = validTimer(timerDefaults.motion, "T#5S", "motion fault");
// Selisih waktu yang WAJAR antara master di-ON dan pressure switch angin ikut naik. Di bawah
// ini bukan kerusakan, cuma tangki lagi mengisi; di atasnya switch-nya yang bermasalah.
var T_AIRPS  = validTimer(timerDefaults.airPs, "T#3S", "air pressure switch fault");
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
        if(tied.length>1) W("lsc_ambiguous","",'LSC match for "'+dev.komen+'" is AMBIGUOUS: '+tied.length+' candidates tied at score '+bestScore+' ('+tied.join(", ")+'), picked "'+best+'" by I/O order only - verify manually.',{device:dev.name});
        else if(bestScore===2) W("lsc_low_confidence","",'LSC match for "'+dev.komen+'" -> "'+best+'" is low-confidence (score 2, only 2 shared comment words) - verify manually.',{device:dev.name});
    }
    return best;
}
function pairUp(l){ var p=[]; for(var i=0;i<l.length;i+=2){ if(l[i+1]) p.push([l[i],l[i+1]]); } return p; }
// Nama device buat teks alarm: ambil kata-kata AWAL yang sama dari dua komen pasangan
// ("ST1 STOPPER-5 CHUCK" + "ST1 STOPPER-5 UNCHUCK" -> "ST1 STOPPER-5"). Dipotong per KATA,
// bukan per karakter, kalau tidak "CLAMP" vs "CLAMP2" kepotong di tengah kata jadi nama palsu.
// Spasi ganda di komen sumber ("ST2  STOPPER-1") sekalian dirapikan jadi satu spasi.
function words(s){ return String(s||"").trim().split(/\s+/).filter(Boolean); }
function devBase(a,b){
    var wa=words(a), wb=words(b), i=0;
    while(i<wa.length && i<wb.length && wa[i]===wb[i]) i++;
    return (i?wa.slice(0,i):wa).join(" ");
}
// Komen elemen AL/MF selalu diawali stub bernomor (AL071_, MF007_) - gaya yang sama dengan baris
// Spare di fillSpareArrayComments(), biar satu tabel Global Variable seragam dan slot kepakai /
// cadangan sama-sama kebaca nomornya tanpa lihat kolom Name. Komen rung TIDAK pakai stub ini.
function AL(n,cmt){ var t="AL["+n+"]"; if(cmt) ARRAY_ELEMENTS[t]="AL"+pad(n,3)+"_ "+cmt; return t; }
function MF(n,cmt){ var t="MF["+n+"]"; if(cmt) ARRAY_ELEMENTS[t]="MF"+pad(n,3)+"_ "+cmt; return t; }
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
// *_USED = slot yang DIALOKASI (termasuk padding spare) - ini batas minimum ukuran array.
// *_FILLED = slot yang beneran keisi alarm/fault - cuma buat rekomendasi di web UI.
var AL_SIZE, MF_SIZE, AL_USED = 0, MF_USED = 0, AL_FILLED = 0, MF_FILLED = 0, STATION_BLOCK = 30;
// Tiap station dapat blok BERUKURAN TETAP, dipadding spare sampai segini. Sebelumnya blok dipas-pasin
// ke jumlah aktuator, jadi nambah satu silinder di ST1 nggeser nomor AL/MF SEMUA station sesudahnya -
// komen yang sudah dilengkapi orang di Susmax Studio jadi nunjuk alarm yang salah. Dengan blok tetap,
// nomor per station stabil dan tiap station punya ruang tumbuh sendiri.
var STATION_BLOCK_DEFAULT = 30;
(function computeArrayBlocks(){
    var sb = parseInt((flow.get("arraySizes")||{}).stationBlock, 10);
    if(!isFinite(sb) || sb <= 0) sb = STATION_BLOCK_DEFAULT;
    // --- 1. hitung kebutuhan tiap station dulu, belum bagi-bagi nomor ---
    var need = {};
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
        need[k] = { al: asCount + alarmCount, mf: actCount };
        AL_FILLED += need[k].al; MF_FILLED += need[k].mf;
    });
    AL_FILLED += AL_MAIN_RESERVED;

    // --- 2. ukuran blok SERAGAM buat semua station ---
    // Seragam itu syarat, bukan selera: nomor blok dihitung dari NOMOR station (lihat langkah 3), dan
    // itu cuma mungkin kalau tiap blok sama besar. Kalau ada satu station yang butuhnya lebih dari
    // setelan, SEMUA blok dinaikin - bukan cuma station itu - biar rumusnya tetap berlaku.
    var maxNeed = 0;
    ukeys.forEach(function(k){ maxNeed = Math.max(maxNeed, need[k].al, need[k].mf); });
    if(maxNeed > sb){
        W("station_block_raised","","A station needs "+maxNeed+" slots, more than 'Slots per station' ("+sb+") - raised to "+maxNeed+
                      " for EVERY station so the numbering stays uniform. Raise the setting if you want spare room again.");
        sb = maxNeed;
    }
    STATION_BLOCK = sb;

    // --- 3. nomor blok dari NOMOR station, BUKAN urutan kemunculan ---
    // ukeys cuma memuat station yang PUNYA device. Dulu blok dibagi berurutan dari daftar itu, jadi
    // kalau ST2 belum ada isinya, ST3 makai jatah ST2 - dan begitu ST2 diisi, semua nomor ST3 geser.
    // Sekarang ST3 selalu blok ke-3 apa pun isi ST1/ST2: nambah unit baru atau ngosongin unit lama
    // gak nggeser nomor station manapun. Ongkosnya cuma slot bolong kalau penomoran station lompat.
    var idxOf = {}, maxIdx = 0;
    ukeys.forEach(function(k){
        var m = /(\d+)/.exec(k);
        if(m){ idxOf[k] = parseInt(m[1], 10); maxIdx = Math.max(maxIdx, idxOf[k]); }
    });
    var extra = maxIdx;   // station tanpa angka di namanya ditaruh sesudah yang bernomor
    ukeys.forEach(function(k){ if(idxOf[k] === undefined){ idxOf[k] = ++extra; maxIdx = extra; } });

    ukeys.forEach(function(k){
        var i = idxOf[k] - 1;
        AL_BLOCK[k] = { start: AL_MAIN_RESERVED + i*sb + 1, end: AL_MAIN_RESERVED + (i+1)*sb };
        MF_BLOCK[k] = { start: i*sb + 1,                     end: (i+1)*sb };
    });
    // Panjang array ngikut nomor station TERTINGGI, bukan jumlah station - ST1 dan ST5 doang tetap
    // bikin array sepanjang 5 blok, karena ST5 memang nempatin blok ke-5.
    AL_USED = AL_MAIN_RESERVED + maxIdx*sb;
    MF_USED = maxIdx*sb;
    // Ukuran array boleh disetel user lewat panel "Ukuran array" di web UI. Tapi TIDAK PERNAH boleh
    // turun di bawah yang beneran kepakai - kalau dipaksa, alarm/motion-fault paling belakang bakal
    // nunjuk index di luar array dan itu error pas import, bukan sekadar kurang rapi. Jadi angkanya
    // dinaikin balik + warning, bukan diam-diam ngedrop slot.
    var want = flow.get("arraySizes") || {};
    function pickSize(raw, dflt, used, name){
        var v = parseInt(raw, 10);
        if(!isFinite(v) || v <= 0) return Math.max(dflt, used);
        if(v < used){
            W("array_size_raised","","Array "+name+" was asked for "+v+" elements but "+used+" slots are already in use - raised to "+used+".");
            return used;
        }
        return v;
    }
    AL_SIZE = pickSize(want.al, 100, AL_USED, "AL");
    MF_SIZE = pickSize(want.mf, 16, MF_USED, "MF");
})();
var AL_TYPE = "ARRAY[1.."+AL_SIZE+"] OF BOOL";
var MF_TYPE = "ARRAY[1.."+MF_SIZE+"] OF BOOL";

// ============================================================ PETA ALAMAT HMI
// NX dan NB cuma bisa ngobrol lewat ALAMAT MEMORI, bukan tag/network variable - driver di project
// HMI-nya "OMRON CJ/CS/NJ Series Ethernet UDP" (FINS). Jadi tiap simbol yang disentuh HMI wajib
// punya AT specification ke area CJ-series Unit memory, dan kolom AT di GlobalVariables.tsv itu
// SATU-SATUNYA penyambung antara dua sisi. Simbol tanpa AT = tombol yang gak nyambung ke mana-mana.
//
// Skema word-nya bukan karangan: dibaca balik dari project HMI produksi (Prepare HMI CE INSERT),
// dari unit 1, 2, 6, 7, 8 yang alamatnya masih bersih:
//
//   tombol station n (HMI -> PLC, "Write" di switch NB) : W(PB_BASE + n*STRIDE)
//   lampu  station n (PLC -> HMI, "Read"  di switch NB) : word tombol + RD_OFFSET   <- selalu +23
//   bit di dalam word : tiap slot grid 2 bit (M lalu R), page 1 isi .00-.07, page 2 .08-.15
//
// Unit 3/4/5 di project itu JANGAN dicontoh: tiga screen (0431, 0441, 0451) nulis W465 bit per bit
// sama persis, jadi tombol di screen unit 4 dan 5 menggerakkan aktuator unit 3. Yang dipakai di
// sini formula bersihnya, dan hmiClaim() di bawah nolak dua simbol berbagi satu alamat - persis
// jenis kesalahan yang bikin project itu rusak diam-diam.
var HMI_AT = {};     // nama simbol -> string AT ("W461.00"), dipakai kolom AT di TSV
var HMI_ROWS = [];   // baris peta buat panel HMI di web UI
var HMI_OWNER = {};  // string AT -> nama simbol yang sudah nempatin, buat deteksi tabrakan
var HMI_CFG = (function(){
    var c = flow.get("hmiMap") || {};
    function num(v, dflt, label, min, max){
        if(v === undefined || v === null || v === "") return dflt;
        var n = parseInt(v, 10);
        if(!isFinite(n) || n < min || n > max){
            W("hmi_cfg_range","","HMI map: "+label+' = "'+v+'" is outside '+min+".."+max+", using default "+dflt+".");
            return dflt;
        }
        return n;
    }
    // Area memori dipisah per blok: tombol/lampu di W (itu yang dipakai screen NB), AL/MF di H
    // (bit retentif - alarm gak boleh hilang pas power cycle). Cuma area CJ-series Unit memory
    // yang boleh, karena cuma itu yang kejangkau FINS dari NB.
    function area(v, dflt, label){
        var a = String(v||"").trim().toUpperCase();
        if(!a) return dflt;
        if(["W","H","D","CIO"].indexOf(a) < 0){
            W("hmi_cfg_range","","HMI map: "+label+' area = "'+v+'" is not W/H/D/CIO, using default '+dflt+".");
            return dflt;
        }
        return a;
    }
    return {
        on      : c.enabled === undefined ? true : !!c.enabled,
        // "manual" = screen NB dikelola orang, tool cuma nyocokin diri ke situ, jadi alamat HARAM
        // digeser diam-diam. "generate" = tool yang bikin screen-nya, geser boleh karena screen
        // ikut dibikin ulang. Default manual: itu yang gak pernah merusak project yang sudah jalan.
        mode    : c.mode === "generate" ? "generate" : "manual",
        btnArea : area(c.btnArea, "W", "tombol/lampu"),
        alArea  : area(c.alArea,  "H", "AL"),
        mfArea  : area(c.mfArea,  "H", "MF"),
        pbBase  : num(c.pbBase,   460, "base word tombol",    0, 511),
        rdOfs   : num(c.rdOffset,  23, "offset word lampu",   1, 511),
        // Lampu status MAIN dan array lampu kondisi duduk di bawah blok lampu station. Angkanya
        // dari peta mesin: W481 master condition (screen 0021), W482 auto start (0031). W480
        // dipakai lampu status MAIN supaya tidak menabrak keduanya, W483 buat halaman kedua
        // auto start. Blok station mulai W484 ke atas, jadi tidak bertabrakan.
        lampBase: num(c.lampBase, 480, "base word lampu MAIN", 0, 511),
        condBase: num(c.condBase, 481, "base word lampu kondisi", 0, 511),
        cntBase : num(c.cntBase,  494, "base word lampu counter", 0, 511),
        alBase  : num(c.alBase,   300, "base word AL",        0, 511),
        mfBase  : num(c.mfBase,   320, "base word MF",        0, 511),
        perPage : num(c.perPage,    4, "aktuator per screen", 1, 8),
        stride  : num(c.stride,     1, "word per station",    1, 16),
        // Nilai angka (target counter, preset timer, hitungan berjalan) bukan bit - satu UDINT
        // makan DUA word. Ditaruh di area terpisah dari tombol/lampu supaya blok bit tidak
        // pernah bertabrakan dengan blok angka.
        numArea : area(c.numArea, "D", "data angka"),
        numBase : num(c.numBase,  100, "base word data angka", 0, 4095),
        // Jatah cadangan per station. Tanpa ini alamat dipaskan ke IO list hari ini, dan aktuator
        // yang ditambah setelah mesin jalan menggeser alamat semua yang di belakangnya - tiap
        // screen NB yang sudah jadi ikut salah tunjuk. Lebih murah menyisakan lubang sejak awal.
        //
        // Dua cara menghitungnya, dan bedanya nyata:
        //   percent - persen dari jumlah aktuator station itu. Station besar dapat cadangan
        //             besar, station kecil sedikit. Cocok kalau penambahan diperkirakan
        //             sebanding dengan ukuran station.
        //   count   - jumlah TETAP per station, berapa aktuator yang mau ditambahkan. Station
        //             satu aktuator tetap dapat jatah yang sama dengan station sepuluh - dan
        //             station kecil justru yang paling sering ditambahi. 30% dari 1 aktuator
        //             cuma 1 slot; "tambah 2" memang 2.
        spareMode : (String(c.spareMode||"percent").toLowerCase()==="count" ? "count" : "percent"),
        spare     : num(c.spare,      30, "spare aktuator (%)",        0, 300),
        spareCount: num(c.spareCount,  2, "spare aktuator (per station)", 0, 32)
    };
})();
PER_PAGE = HMI_CFG.perPage;

// Tiap station butuh 2 bit per aktuator. Yang dilakukan kalau ada station yang gak muat di jatah
// word-nya BEDA per mode, dan bedanya penting:
//
//   generate - tool yang bikin screen NB, jadi jatah dinaikin buat SEMUA station (bukan cuma yang
//              kepepet: word dihitung dari NOMOR station, rumus itu cuma berlaku kalau jatahnya
//              seragam). Alamat bergeser, tapi screen-nya ikut dibikin ulang jadi tetap cocok.
//   manual   - screen NB dikelola orang. Menggeser alamat di sini artinya semua screen yang sudah
//              ada tiba-tiba nunjuk bit yang salah, dan gak ada yang protes sampai mesin gerak.
//              Jadi jatah DIPERTAHANKAN, dan aktuator yang gak kebagian slot dilaporin satu-satu
//              lewat hmi_slot_overflow - kurang tombol itu keliatan, salah alamat enggak.
// Jatah dihitung dari jumlah aktuator PLUS spare, bukan dari yang ada sekarang saja.
// Mode count berlaku juga buat station yang aktuatornya NOL - station yang belum diisi IO
// tetap dapat slotnya, dan itu memang gunanya. Mode percent tidak bisa: 30% dari nol tetap nol.
function hmiSlotsNeeded(n){
    return HMI_CFG.spareMode==="count" ? n + HMI_CFG.spareCount
                                       : n + Math.ceil(n*HMI_CFG.spare/100);
}
function spareLabel(){
    return HMI_CFG.spareMode==="count" ? HMI_CFG.spareCount+" slot per station"
                                       : HMI_CFG.spare+"%";
}
(function fitHmiStride(){
    if(!HMI_CFG.on) return;
    var maxWords = 0, worst = "";
    ukeys.forEach(function(k){
        var devs = groups[k] || [];
        var n = pairUp(devs.filter(function(d){ return d.io==="OUT" && (d.jenis==="CR"||d.jenis==="SOL"); })).length
              + devs.filter(function(d){ return d.io==="OUT" && d.jenis==="SRV_CMD"; }).length;
        var w = Math.ceil(hmiSlotsNeeded(n)*2/16);
        if(w > maxWords){ maxWords = w; worst = k+" ("+n+" actuators + "+(hmiSlotsNeeded(n)-n)+" spare)"; }
    });
    if(maxWords <= HMI_CFG.stride) return;
    if(HMI_CFG.mode === "generate"){
        W("hmi_stride_raised","","HMI map: "+worst+" needs "+maxWords+" button words, more than the "+HMI_CFG.stride+" allowed - "+
          "raised to "+maxWords+" for EVERY station so the numbering stays uniform. "+
          "NB screens will be regenerated at the new addresses.");
        HMI_CFG.stride = maxWords;
    } else {
        W("hmi_stride_fixed","","HMI map (manual mode): "+worst+" needs "+maxWords+" button words but only "+HMI_CFG.stride+" is allowed. "+
          "Lower the spare allowance ("+spareLabel()+") if you would rather keep one word per station. "+
          "The budget is NOT raised, so the existing NB screens keep pointing at the right bits - the actuators "+
          "that miss out are listed below. Raise 'Words per station' yourself if the screens are going to be "+
          "re-addressed, or switch to Generate mode.");
    }
})();

// Tanda "%" itu WAJIB. Sysmac nolak "W485.01" (baris jadi merah di tabel Global Variable) tapi
// nerima "%W485.01". Dibuktikan langsung di Sysmac Studio, bukan dari dokumentasi.
function atBit(area, word, bit){ return "%"+area+word+"."+pad(bit,2); }
// Alamat WORD (bukan bit) - dipakai nilai angka yang dibaca/ditulis HMI. Tanpa ".nn".
function atWord(area, word){ return "%"+area+word; }

// Array lampu kondisi yang dibaca screen HMI. Indeksnya 0-based (beda dari AL/MF yang 1-based) -
// itu bentuk yang dipakai project produksi dan yang diharapkan screen-nya. Ukurannya 16 = satu
// word penuh, jadi tiap array pas satu word dan tidak ada bit nyasar ke array sebelahnya.
// seed[] mengisi elemen yang memang bisa diturunkan dari bit yang sudah ada; sisanya stub.

// Instruksi di luar kontak/coil/TON (MOVE, pembanding, Inc, Get*Clk) bentuk XML-nya BELUM
// diverifikasi ke Susmax Studio. Satu elemen salah bisa bikin SELURUH file gagal di-import, jadi
// defaultnya mati: yang keluar rung penanda, bukan tebakan. Nyalakan setelah _Probe_Instructions.xml
// ter-import bersih. Lihat TODO.md 5a.
var ADV_OK = !!(flow.get("advancedInstructions"));

// Counter Denso: satu counter = 3 rung, dan bentuknya sama untuk semua counter.
//   1. trigger (diferensiasi naik) AND (hitungan < batas)  -> tambah 1
//   2. hitungan <> 0 AND >= ambang peringatan              -> lampu WARNING (mati kalau UP nyala)
//   3. hitungan <> 0 AND >= target                         -> lampu UP
// Lampu dipetakan ke PL71 (8 counter, 2 bit tiap counter) lalu lanjut ke PL72 (2 counter).
//
// Nama arraynya mengikuti standar Denso, dibaca dari dua project mesin yang jalan
// (Prepare CE insert3, autowelding) - bukan dikarang: PD071_SET1 target, PD071_SET2 ambang
// peringatan, PD071_CUR hitungan berjalan, semuanya ARRAY 1-based OF UDINT.
//
// Batas di rung 1 itu KONSTANTA besar, bukan targetnya. Dua project itu sama-sama begitu, dan
// bedanya nyata: dibatasi target, counter berhenti tepat di target dan kelebihan produksi
// tidak terhitung; dibatasi konstanta, counter terus jalan dan lampu UP yang menandai target
// tercapai.
var CNT_SET = "PD071_SET1", CNT_WARN = "PD071_SET2", CNT_CUR = "PD071_CUR";
var CNT_MAX = "UDINT#99999999";
var CNT_N = 10;
var CNT_LAMPS = [ { name:"PL71", size:16, screen:"0071" }, { name:"PL72", size:4, screen:"0072" } ];
// Slot lampu ke-k (0-based) -> array mana, bit ke berapa. Dua bit per counter: WARNING lalu UP.
function cntLamp(k){
    var bit=k*2, i=0;
    while(i<CNT_LAMPS.length && bit>=CNT_LAMPS[i].size){ bit-=CNT_LAMPS[i].size; i++; }
    return i<CNT_LAMPS.length ? { arr:CNT_LAMPS[i].name, warn:bit, up:bit+1 } : null;
}
// Timer HMI Denso: bentuknya sama dengan counter, cuma yang menghitung pulsa clock, bukan
// trigger dari mesin. Dibaca dari P003_HMI/Timers di autowelding.smc2.
//   1. GTM00n AND pulsa clock (naik) AND (hitungan < batas)  -> tambah 1
//   2. preset <> 0 AND preset <= hitungan                    -> lampu timer up
// GTM-nya kontak biasa (dia penahan, bukan pemicu); yang berdiferensiasi naik justru kontak
// pulsa clock-nya - itu yang membuat satu pulsa = satu hitungan.
var TMR_N = 6;
var TMR_SET = "PD081_SET", TMR_CUR = "PD081_CUR", TMR_LAMP = "PL081";
var TMR_MAX = "UDINT#9999";
// Timer 1-2 berbasis 0,1 detik, sisanya 1 detik - pembagian yang dipakai project mesin.
// aP_0_1s itu nama clock 100 ms milik generator ini; di autowelding namanya aP_100ms, sinyal
// yang sama. Dipakai nama sendiri supaya tidak ada dua clock 100 ms di satu project.
function tmrClock(i){ return i < 2 ? "aP_0_1s" : "aP_1s"; }
var COND_ARRAYS = [
    { name:"PL21",  size:16, screen:"0021", doc:"Master on condition indication",
      seed:{} },
    { name:"PL031", size:16, screen:"0031", doc:"Auto start condition indication, page 1",
      seed:{ 1:"AUTO_MODE" } },
    { name:"PL032", size:16, screen:"0031", doc:"Auto start condition indication, page 2",
      seed:{} }
];
// Berapa elemen per bit rangkuman. Project produksi memakai 7/7/2 buat PL21 dan 5/5/5/1 buat
// PL031 - dua-duanya tanpa aturan yang bisa diturunkan, jadi tidak bisa ditiru generator.
// Dipakai ukuran seragam: rangkumannya jadi bisa dihitung dari nomor elemen.
var COND_CHUNK = 8;
// Satu-satunya pintu buat nempatin simbol ke alamat. Nolak - bukan menimpa - kalau alamatnya sudah
// dipakai simbol lain, karena dua simbol di satu bit itu justru cacat yang lagi kita hindari.
function hmiClaim(sym, at, dir, screen, komen){
    if(!HMI_CFG.on) return;
    var owner = HMI_OWNER[at];
    if(owner && owner !== sym){
        W("hmi_at_conflict","","HMI map: address "+at+" requested by "+sym+" is already owned by "+owner+" - "+sym+" skipped.",{device:sym});
        return;
    }
    HMI_OWNER[at] = sym; HMI_AT[sym] = at;
    HMI_ROWS.push({ sym:sym, at:at, dir:dir, screen:screen||"", komen:komen||"" });
}
// Blok bit berurutan (AL, MF) - satu variabel ARRAY nempatin banyak bit sekaligus. Dicek dulu
// SELURUH rentangnya baru ditandai, biar blok yang nabrak gak nyisain separuh klaim di peta.
function hmiClaimRange(sym, area, word0, bits, dir, screen, komen){
    if(!HMI_CFG.on || bits<=0) return;
    function at(i){ return atBit(area, word0+Math.floor(i/16), i%16); }
    for(var i=0;i<bits;i++){
        var owner=HMI_OWNER[at(i)];
        if(owner && owner!==sym){
            W("hmi_at_conflict","","HMI map: block "+sym+" ("+bits+" bits from "+area+word0+") clashes with "+owner+" at "+at(i)+" - "+sym+" gets no address.",{device:sym});
            return;
        }
    }
    for(var j=0;j<bits;j++) HMI_OWNER[at(j)]=sym;
    HMI_AT[sym]=at(0);
    HMI_ROWS.push({ sym:sym, at:at(0)+" .. "+at(bits-1), dir:dir, screen:screen||"", komen:komen||"" });
}
// Blok WORD berurutan buat array angka (target counter, preset timer, hitungan berjalan).
// Satu UDINT = 2 word, jadi ARRAY[1..10] OF UDINT makan 20 word. Dikembalikan word berikutnya
// yang masih bebas, supaya pemanggilnya bisa menumpuk blok tanpa menghitung sendiri.
function hmiClaimWords(sym, area, word0, words, dir, screen, komen){
    if(!HMI_CFG.on || words<=0) return word0;
    for(var i=0;i<words;i++){
        var owner=HMI_OWNER[atWord(area,word0+i)];
        if(owner && owner!==sym){
            W("hmi_at_conflict","","HMI map: numeric block "+sym+" ("+words+" words from "+area+word0+") clashes with "+
              owner+" at "+atWord(area,word0+i)+" - "+sym+" gets no address.",{device:sym});
            return word0+words;
        }
    }
    for(var j=0;j<words;j++) HMI_OWNER[atWord(area,word0+j)]=sym;
    HMI_AT[sym]=atWord(area,word0);
    HMI_ROWS.push({ sym:sym, at:atWord(area,word0)+" .. "+atWord(area,word0+words-1),
                    dir:dir, screen:screen||"", komen:komen||"" });
    return word0+words;
}
// Slot grid buat aktuator ke-idx (0-based) di satu station. Dua bit per slot: M lalu R.
function hmiSlot(stationNo, idx){
    var tb = idx*2, wOfs = Math.floor(tb/16);
    return {
        pg   : 1 + Math.floor(idx/PER_PAGE),
        nn   : (idx % PER_PAGE) + 1,
        word : HMI_CFG.pbBase + stationNo*HMI_CFG.stride + wOfs,
        bit  : tb % 16,
        over : wOfs >= HMI_CFG.stride
    };
}

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
    if(solList.length%2) W("solenoid_count_odd",stKey,stKey+": solenoid count is odd, last output is not paired into an actuator.");

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
        if(bestScore>0 && tied.length>1) W("servo_feedback_ambiguous",stKey,stKey+': servo feedback for "'+cmd.komen+'" is AMBIGUOUS: '+tied.length+' candidates tied at score '+bestScore+' ('+tied.join(", ")+'), picked "'+best.name+'" by I/O order only - verify manually.',{device:cmd.name});
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
    // Baris array-level AL/MF sengaja TANPA komen. Komen yang berarti ada di tiap ELEMEN
    // (AL[11] "AL011_ ST1 STOPPER-5 ALL REED SWITCH ON"); komen array-level cuma nutupin
    // kolom Comment di tabel Sysmac dengan teks generik yang sama buat 100 baris.
    G("AL",AL_TYPE,""); G("MF",MF_TYPE,"");
    var allDevs=[]; Object.keys(groups).forEach(function(k){ allDevs=allDevs.concat(groups[k]); });
    allDevs.forEach(function(d){ G(portName(d.address),"BOOL",d.komen); G(d.name,"BOOL",d.komen); });

    // Slot cadangan. Bit alamatnya sudah disisakan waktu jatah word dihitung, tapi jatah yang
    // tidak diisi apa-apa itu cadangan tanpa wujud: tabel Global Variable berhenti di aktuator
    // terakhir, dan yang menggambar screen NB tidak punya apa pun untuk ditempel di slot kosong.
    // Jadi slotnya dibuat UTUH - tombol, lampu, interlock, reed switch, kombinasi LS, alarm dual
    // sensor, sampai baris output - persis seperti slot terpakai, cuma belum ada barangnya.
    // Menambah aktuator nanti tinggal mengganti sumber sinyalnya; alamatnya tidak bergeser.
    //
    // Direncanakan DI SINI, sebelum section mana pun ditulis, karena wujudnya nyebar: reed switch
    // masuk Device_Input, LSC ke LS_Combination, alarmnya ke Fault, output ke Auto_Output. Dulu
    // ini duduk di tengah section Individual dan cuma bisa menyentuh section itu.
    var spareList=[];
    (function planSpares(){
        var used = actus.length + srvActus.length;
        var want = hmiSlotsNeeded(used);
        // Nomor LB LANJUT dari yang dipakai aktuator dan servo, jadi tidak ada yang bertabrakan.
        var lbBase = actus.length*2 + srvActus.length;
        for(var k=used; k<want; k++){
            var slot=hmiSlot(SN,k);
            if(slot.over){
                W("hmi_spare_overflow",stKey,stKey+": spare slot "+(k-used+1)+" does not fit this station's HMI word budget.");
                break;
            }
            var j=k-used, nm="4"+SN+slot.pg+"_"+slot.nn, tag=stLabel+" spare "+(j+1);
            var s={ nm:nm, tag:tag, slot:slot, pg:slot.pg, nn:slot.nn,
                    pbM:"PB"+nm+"M", pbR:"PB"+nm+"R", plM:"PL"+nm+"M", plR:"PL"+nm+"R",
                    asM:"AS"+nm+"M", asR:"AS"+nm+"R", lscM:"LSC"+nm+"M", lscR:"LSC"+nm+"R",
                    solM:"SOL"+nm+"M", solR:"SOL"+nm+"R",
                    ilM:"LB"+pad(232+lbBase+j*2,3), ilR:"LB"+pad(233+lbBase+j*2,3),
                    oM :"LB"+pad(340+lbBase+j*2,3), oR :"LB"+pad(341+lbBase+j*2,3) };
            spareList.push(s);
            // Sumber reed switch cadangan. Dideklarasi di sini, di tempat pemakaian - ExternalVars
            // itu per-program, dan yang sudah ada di P000_Initial tetap tidak dikenal di sini.
            G("GSB001","BOOL","Equipment design coil, constant OFF");
            G(s.pbM,"BOOL","Spare individual button, "+tag);
            G(s.pbR,"BOOL","Spare individual button, "+tag);
            G(s.plM,"BOOL","Spare lamp, "+tag);
            G(s.plR,"BOOL","Spare lamp, "+tag);
            G(s.asM,"BOOL","Spare reed switch, "+tag+", motion side");
            G(s.asR,"BOOL","Spare reed switch, "+tag+", return side");
            G(s.lscM,"BOOL",tag+" motion position confirmed");
            G(s.lscR,"BOOL",tag+" return position confirmed");
            G(s.solM,"BOOL","Spare output, "+tag+", motion side");
            G(s.solR,"BOOL","Spare output, "+tag+", return side");
            P(s.ilM,"BOOL","Spare motion interlock, "+tag);
            P(s.ilR,"BOOL","Spare return interlock, "+tag);
            P(s.oM,"BOOL","Spare individual command, "+tag);
            P(s.oR,"BOOL","Spare individual command, "+tag);
            hmiClaim(s.pbM, atBit(HMI_CFG.btnArea,slot.word,slot.bit),   "HMI->PLC","04"+SN+slot.pg, tag);
            hmiClaim(s.pbR, atBit(HMI_CFG.btnArea,slot.word,slot.bit+1), "HMI->PLC","04"+SN+slot.pg, tag);
            var rw=slot.word+HMI_CFG.rdOfs;
            hmiClaim(s.plM, atBit(HMI_CFG.btnArea,rw,slot.bit),   "PLC->HMI","04"+SN+slot.pg, tag);
            hmiClaim(s.plR, atBit(HMI_CFG.btnArea,rw,slot.bit+1), "PLC->HMI","04"+SN+slot.pg, tag);
        }
    })();

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
    // Reed switch slot cadangan belum punya port, jadi sumbernya GSB001 - koil rangka yang
    // selalu OFF. Sengaja OFF, bukan ON: dua reed switch yang sama-sama ON itu justru kondisi
    // alarm "ALL REED SWITCH ON". Yang perlu diganti nanti cuma kontak di rung ini.
    spareList.forEach(function(s,j){
        S2.push(series(o++,[["GSB001",false]],s.asM,
            j===0?"Spare reed switch, no port yet - replace GSB001 with the real input":null));
        S2.push(series(o++,[["GSB001",false]],s.asR,null));
    });

    // 3. HMI_Input
    // Tombol HMI gak butuh rung: NB nulis LANGSUNG ke word-nya, dan variabel PB station ini
    // di-AT ke word yang sama (kolom AT di GlobalVariables.tsv). Rung di bawah penanda peta
    // alamatnya, biar yang buka ladder tahu word mana milik station ini tanpa buka TSV dulu.
    var S3=[]; o=1;
    P("HMI_INPUT_NOP","BOOL","No operation, reserved for HMI input");
    S3.push(series(o++,[["GSB000",false]],"HMI_INPUT_NOP",
        HMI_CFG.on ? "HMI buttons arrive by AT specification, no logic needed : write "+HMI_CFG.btnArea+(HMI_CFG.pbBase+SN*HMI_CFG.stride)
                     +", lamp "+HMI_CFG.btnArea+(HMI_CFG.pbBase+SN*HMI_CFG.stride+HMI_CFG.rdOfs)+", "+PER_PAGE+" actuators per screen"
                   : "HMI address map disabled, no HMI input"));

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
    // Slot cadangan dapat kombinasi yang sama persis. TAPI TIDAK ikut homeConds: reed switch-nya
    // masih GSB001, jadi LSC sisi return-nya selamanya OFF - dimasukkan ke syarat home position,
    // station itu tidak akan pernah dinyatakan di home dan mesin tidak pernah bisa start. Baru
    // dimasukkan kalau sensornya sudah nyata, dan itu keputusan yang harus disengaja.
    spareList.forEach(function(s,j){
        S5.push(ls2(o,s.asM,s.asR,s.lscM,s.lscR,
            j===0?"Spare slot limit switch combination, kept out of the home condition until a real sensor exists":null));
        o+=2;
    });

    // 6. Fault
    // AL/MF global buat semua program, tiap station dapat blok index dinamis (AL_BLOCK/MF_BLOCK,
    // dihitung dari jumlah AS-pair/actuator station itu sendiri) biar gak tabrakan bit sama station lain
    var S6=[]; o=1; var fltList=[];
    var alCap=AL_BLOCK[stKey].end, alN=AL_BLOCK[stKey].start;
    var mfCap=MF_BLOCK[stKey].end, mfN=MF_BLOCK[stKey].start;
    asPairs.forEach(function(p,i){
        if(alN>alCap){ W("al_block_full",stKey,stKey+": AL alarm block full, dual sensor fault for "+p[0].komen+" skipped."); return; }
        var cmt=devBase(p[0].komen,p[1].komen)+" ALL REED SWITCH ON";
        var t=AL(alN,cmt);
        var r=new Rung(o++, cmt);
        var rail=r.rail(); var c=r.ct(p[1].name,r.ct(p[0].name,rail));
        var x=r.clm(t,[c,r.ct(t,rail)]); r.rr([x]); S6.push(r.build());
        fltList.push(t); alN++;
    });
    // Alarm dual sensor buat slot cadangan. Rungnya sama, dan slot AL-nya memang dipakai sekarang:
    // kalau baru dialokasi waktu aktuatornya dipasang, nomor alarm semua yang di belakangnya
    // bergeser - dan nomor alarm itu yang tercetak di layar NB dan di lembar troubleshooting.
    spareList.forEach(function(s){
        if(alN>alCap){ W("al_block_full",stKey,stKey+": AL alarm block full, dual sensor fault for "+s.tag+" skipped."); return; }
        var cmt=s.tag.toUpperCase()+" ALL REED SWITCH ON";
        var t=AL(alN,cmt);
        var r=new Rung(o++, cmt);
        var rail=r.rail(); var c=r.ct(s.asR,r.ct(s.asM,rail));
        var x=r.clm(t,[c,r.ct(t,rail)]); r.rr([x]); S6.push(r.build());
        fltList.push(t); alN++;
    });
    // LSC tiap aktuator dihitung SEKALI di sini, bukan di dalam loop Fault seperti dulu. Fault
    // (motion fault) dan HMI_Output (lampu posisi di screen individual) sama-sama butuh angka ini;
    // kalau masing-masing menghitung sendiri, aturan override cuma soal waktu sebelum beda dan
    // lampu di HMI bakal nunjuk sensor yang lain dari yang dipakai deteksi fault-nya.
    function lscFor(a){
        var ov=actuatorOverrides[a[0].name]||actuatorOverrides[a[1].name];
        if(ov && ov.mode==="openloop") return { open:true };
        if(ov && ov.mode==="manual" && ov.lscA && ov.lscB) return { a:ov.lscA, b:ov.lscB };
        return { a:findLsc(a[0],asPairs), b:findLsc(a[1],asPairs) };
    }
    var faultTimerIdx=0;
    actus.forEach(function(a,i){
        var L=lscFor(a);
        if(L.open) return; // sengaja gak ada sensor by design - skip diam-diam, gak makan slot MF, gak warning
        if(mfN>mfCap){ W("mf_block_full",stKey,stKey+": MF motion-fault block full, actuator "+a[0].komen+" skipped."); return; }
        var lscA=L.a, lscB=L.b;
        // device diisi nama SIMBOL (bukan komen) - itu kunci yang dipakai actuatorOverrides dan panel
        // Confirm Mode, jadi UI bisa nyorot aktuator yang tepat tanpa nebak-nebak dari teks pesan.
        if(!lscA||!lscB){ W("lsc_not_found",stKey,stKey+": no matching limit switch for actuator "+a[0].komen+", motion fault skipped.",{device:a[0].name}); return; }
        var cmt=devBase(a[0].komen,a[1].komen)+" Motion Fault";
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
        if(mfN>mfCap){ W("mf_block_full",stKey,stKey+": MF motion-fault block full, servo command "+sa.cmd.komen+" skipped."); return; }
        var lsc=(ov && ov.mode==="manual" && ov.lscA) ? ov.lscA : srvLscOf[sa.cmd.name];
        if(!lsc){ W("lsc_not_found",stKey,stKey+": no matching limit switch for servo command "+sa.cmd.komen+", motion fault skipped.",{device:sa.cmd.name}); return; }
        var cmt=words(sa.cmd.komen).join(" ")+" Motion Fault";
        var mf=MF(mfN,cmt), tmr="LT"+pad(200+faultTimerIdx,3); faultTimerIdx++;
        P(tmr,"TON","Motion timeout for "+sa.cmd.komen);
        var r=new Rung(o++, cmt);
        var rail=r.rail();
        var c1=r.ct(lsc,r.ct(sa.cmd.name,rail),true);
        var coil=r.ton([c1],T_MOTION,tmr,mf);
        r.rr([coil]); S6.push(r.build());
        fltList.push(mf); mfN++;
    });
    // Motion fault slot cadangan. Bentuknya sama dengan aktuator nyata, dan slot MF-nya diambil
    // SEKARANG - alasan yang sama dengan AL: dialokasi belakangan waktu aktuatornya dipasang,
    // nomor MF semua yang di belakangnya bergeser, dan nomor itu yang tercetak di layar NB.
    //
    // Yang perlu diketahui waktu memakainya: menekan tombol M slot cadangan MEMANG memunculkan
    // motion fault setelah timernya habis. Perintahnya keluar, LSC-nya tidak pernah balas -
    // karena belum ada silindernya. Itu jawaban yang benar, bukan cacat: slot itu diperintah
    // bergerak dan tidak bergerak. Begitu aktuatornya dipasang, rung yang sama langsung jadi
    // motion fault sungguhan tanpa satu baris pun ditulis ulang.
    spareList.forEach(function(s){
        if(mfN>mfCap){ W("mf_block_full",stKey,stKey+": MF motion-fault block full, "+s.tag+" skipped."); return; }
        var cmt=s.tag.toUpperCase()+" MOTION FAULT";
        var mf=MF(mfN,cmt), tmr="LT"+pad(200+faultTimerIdx,3); faultTimerIdx++;
        P(tmr,"TON","Motion timeout for "+s.tag);
        var r=new Rung(o++, cmt);
        var rail=r.rail();
        var c1=r.ct(s.lscM,r.ct(s.solM,rail),true);
        var c2=r.ct(s.lscR,r.ct(s.solR,rail),true);
        r.rr([r.ton([c1,c2],T_MOTION,tmr,mf)]); S6.push(r.build());
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
                if(cat) W("alarm_unknown_category",stKey,stKey+': flowchart alarm "'+(n.comment||n.id)+'" has unknown category "'+cat+'", treated as faultstop.');
                cat = "faultstop";
            }
            if(alN>alCap){ W("al_block_full",stKey,stKey+': AL alarm block full, flowchart alarm "'+(n.comment||n.id)+'" skipped.'); return; }
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
    // Tombol screen IND._OPER._MAIN (004) dikumpulin di SATU word (base tombol, sebelum blok station),
    // 2 bit per station - screen-nya memang satu buat semua station.
    (function(){
        var b=(SN-1)*2;
        if(b+1 > 15){ W("hmi_slot_overflow",stKey,stKey+": station number "+SN+" is above 8, screen 004 buttons get no address."); return; }
        hmiClaim("PB004_"+pad(SN,2)+"M", atBit(HMI_CFG.btnArea,HMI_CFG.pbBase,b),   "HMI->PLC", "004", stLabel+" individual staging");
        hmiClaim("PB004_"+pad(SN,2)+"R", atBit(HMI_CFG.btnArea,HMI_CFG.pbBase,b+1), "HMI->PLC", "004", stLabel+" process home return");
    })();
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
        var slot=hmiSlot(SN,i);
        if(slot.over) W("hmi_slot_overflow",stKey,stKey+": actuator "+a[0].komen+" does not fit this station's HMI word budget, its buttons get no address.",{device:a[0].name});
        else {
            hmiClaim(pbM, atBit(HMI_CFG.btnArea,slot.word,slot.bit),   "HMI->PLC", "04"+SN+slot.pg, a[0].komen);
            hmiClaim(pbR, atBit(HMI_CFG.btnArea,slot.word,slot.bit+1), "HMI->PLC", "04"+SN+slot.pg, a[1].komen);
        }
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
        // Servo makan satu SLOT penuh (2 bit) walau tombolnya cuma satu, biar slot grid di screen NB
        // tetap sejajar antara tombol dan lampu. Bit kedua sengaja dibiarkan kosong.
        var sslot=hmiSlot(SN,idx);
        if(sslot.over) W("hmi_slot_overflow",stKey,stKey+": servo "+sa.cmd.komen+" does not fit this station's HMI word budget, its button gets no address.",{device:sa.cmd.name});
        else hmiClaim(pb, atBit(HMI_CFG.btnArea,sslot.word,sslot.bit), "HMI->PLC", "04"+SN+sslot.pg, sa.cmd.komen);
        P(il,"BOOL","Motion interlock for "+sa.cmd.komen);
        P(oS,"BOOL","Individual command, "+sa.cmd.komen);
        indSrv.push(oS);
        S9.push(series(o++,[["GSB000",false]],il,"Screen "+SN+pg+" actuator "+nn+" : "+sa.cmd.komen+" / interlock to be defined"));
        S9.push(series(o++,[[pb,false],[il,false],["LB319",false]],oS,null));
    });

    spareList.forEach(function(s,j){
        // Bentuk rungnya SAMA persis dengan slot terpakai - termasuk saling-kunci M/R dan
        // LB339 (return all). Kalau bentuknya dibedakan, slot cadangan yang nanti dipakai harus
        // ditulis ulang dari nol, dan itu justru yang mau dihindari.
        S9.push(series(o++,[["GSB000",false]],s.ilM,
            "Screen "+SN+s.pg+" actuator "+s.nn+" : "+s.tag+" / no actuator yet, interlock to be defined"));
        S9.push(series(o++,[[s.pbM,false],[s.pbR,true],[s.ilM,false],["LB319",false]],s.oM,null));
        S9.push(series(o++,[["GSB000",false]],s.ilR,null));
        var sr=new Rung(o++,null); var srl=sr.rail();
        var scur=sr.ctm(s.pbM,[sr.ct(s.pbR,srl),sr.ct("LB339",srl)],true);
        scur=sr.ct(s.ilR,scur); scur=sr.ct("LB319",scur);
        sr.rr([sr.cl(s.oR,scur)]); S9.push(sr.build());
    });

    // 10. AutoRunning : unit menerima AUTO_RUN dari main lalu mengurut sendiri
    // Urutan gerak diambil dari flow.get("motionSequences")[stKey] (diisi di web UI index.html
    // sebelum generate ulang). Station yang belum dikonfigurasi tetap pakai placeholder lama.
    var S10=[]; o=1;
    P("LB400","BOOL","Automatic motion start");
    P("LB400_A","BOOL",stLabel+", Automatic motion start");
    P("LB400_B","BOOL",stLabel+", Automatic motion complete");
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
        var rA=new Rung(o++,"Start motion process: "+stLabel+", auto motion start");
        var railA=rA.rail();
        var trigA=rA.ct("CYCLE_STOP",rA.ct("LB499",rA.ct("LB309",railA),true),true);
        var sealA=rA.ct("LB400_A",railA);
        var curA=rA.ct("LB400_B",rA.ctm("AUTO_RUN",[trigA,sealA]),true);
        rA.rr([rA.cl("LB400_A",curA)]);
        S10.push(rA.build());
    })();
    (function(){
        var rB=new Rung(o++,"Start motion process: "+stLabel+", motion completed");
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
                W("variant_condition_remapped",stKey,stKey+': motion sequence variant condition "'+trigBit+'" is the same as one of its own mutual-exclusion coils ('+condLatchBits.join(", ")+') - a latch cannot be triggered by itself, so it was remapped to '+fixed+'. Define the driving logic for '+fixed+' in the Condition section.');
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
                if(!dev){ W("unknown_solenoid",stKey,stKey+': motion sequence references unknown solenoid "'+node.sol+'", step skipped.'); return; }
                var devOv=actuatorOverrides[dev.name];
                lsc=(devOv && devOv.mode==="manual" && devOv.lscA) ? devOv.lscA : (srvLscOf[dev.name] || findLsc(dev,asPairs));
                if(!lsc){ W("lsc_not_found",stKey,stKey+': no matching limit switch for "'+node.sol+'" in motion sequence, step skipped.',{device:dev.name}); return; }
            }

            var after=(node.after||[]).filter(function(ref){
                var b=refBase(ref);
                if(nodeIds[b] && !stepDone[b]){
                    W("dependency_skipped",stKey,stKey+': flowchart step '+nodeTitle(node)+' depends on a skipped step "'+ref+'", dependency ignored.');
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
                if(!cbit){ W("decision_no_condition",stKey,stKey+': decision block '+nodeTitle(node)+' has no condition bit, block skipped.'); return; }
                declareExternal(cbit);
                var yBit="LB"+pad(600+decN,3), nBit="LB"+pad(601+decN,3); decN+=2;
                if(decN>100){ W("decision_range_full",stKey,stKey+": decision block range LB600-LB699 exhausted, later judgement blocks will collide."); }
                var dlabel=node.comment||cbit;
                P(yBit,"BOOL","Judgement YES (held): "+dlabel); P(nBit,"BOOL","Judgement NO (held): "+dlabel);
                S10.push(judgeBranch(o++,prevBit,cbit,false,yBit,nBit,"["+variantLabel+"] Judgement "+dlabel+" -> YES ("+cbit+" on), held, interlocked with "+nBit));
                S10.push(judgeBranch(o++,prevBit,cbit,true, nBit,yBit,"["+variantLabel+"] Judgement "+dlabel+" -> NO ("+cbit+" off), held, interlocked with "+yBit));
                branchBitOf[node.id]={Y:yBit,N:nBit}; stepDone[node.id]=true;

            } else if(ntype==="setmem"||ntype==="resetmem"){
                // Rung-nya TIDAK dibikin di sini: semua trigger set/reset buat satu bit dikumpulin dulu,
                // baru dijadiin SATU rung latch di bawah. Dua coil buat bit yang sama di rung berbeda
                // bakal saling timpa tiap scan (yang terakhir menang) - itu bug klasik ladder.
                var mbit=String(node.bit||"").trim();
                if(!mbit){ W("memory_no_bit",stKey,stKey+': '+nodeTitle(node)+' has no target bit, block skipped.'); return; }
                (((ntype==="setmem")?memSets:memResets)[mbit]=((ntype==="setmem")?memSets:memResets)[mbit]||[]).push(prevBit);
                if(!memCmt[mbit] && node.comment) memCmt[mbit]=node.comment;
                confirmBitOf[node.id]=prevBit; stepDone[node.id]=true;   // aksi seketika, hilir lanjut dari step yang sama

            } else if(ntype==="alarm"){
                var abit=alarmBitOf[vIdx+"/"+node.id];
                if(!abit){ W("alarm_no_slot",stKey,stKey+': '+nodeTitle(node)+' did not get an AL slot, block skipped.'); return; }
                // Self-latch, sama persis kayak rung AL dual-sensor fault di section Fault: alarm harus
                // nyangkut walau penyebabnya cuma sekejap, bukan ikut padam pas step-nya lewat.
                S10.push(latch(o++,[[prevBit,false]],abit,[], "["+variantLabel+"] Alarm: "+(node.comment||node.id)));
                confirmBitOf[node.id]=prevBit; stepDone[node.id]=true;

            } else {
                W("unknown_block_type",stKey,stKey+': unknown flowchart block type "'+ntype+'" on node "'+node.id+'", block skipped.');
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

    // ===== Section Memory (SET/RESET) =====
    // Satu bit memory = SATU rung latch: (semua trigger SET, atau bit itu sendiri) ANDNOT tiap trigger
    // RESET. Ini yang bikin bit-nya bertahan lintas scan sampai di-reset eksplisit - persis LB800/LB801
    // "MEMORY PRESS OK/NG" yang baru hilang pas blok RESET MEMORY OK-NG jalan.
    //
    // Rungnya punya SECTION SENDIRI, bukan nempel di ekor AutoRunning seperti dulu. Alasannya bukan
    // kerapian: bit memory hidup LINTAS step dan sering lintas siklus, sementara AutoRunning dibaca
    // orang sebagai urutan gerak dari atas ke bawah. Latch yang nyempil di antara step bikin orang
    // mengira bit itu bagian dari urutan. Program produksi (Prg012_ST3_CE_Eject) juga menaruhnya
    // di section Memory tersendiri, di antara HMI_Output dan Device_Output.
    var SMEM=[], om=1;
    Object.keys(memSets).concat(Object.keys(memResets)).filter(function(b,i,arr){ return arr.indexOf(b)===i; })
        .forEach(function(mbit){
            var sets=memSets[mbit]||[], resets=memResets[mbit]||[];
            if(!sets.length){
                W("memory_reset_only",stKey,stKey+': memory bit "'+mbit+'" only has RESET blocks and is never set from this flowchart - verify that something else sets it.');
            }
            if(!GLOBALS[mbit]) P(mbit,"BOOL","Flowchart memory"+(memCmt[mbit]?": "+memCmt[mbit]:""));
            SMEM.push(latch(om++, sets.map(function(b){return [b,false];}), mbit,
                resets.map(function(b){return [b,true];}),
                "Memory "+mbit+(memCmt[mbit]?" ("+memCmt[mbit]+")":"")+
                ": set by "+(sets.length?sets.join(", "):"nothing")+
                (resets.length?", reset by "+resets.join(", "):"")));
        });
    // Section kosong tampil polos di Susmax Studio dan gak kebedain antara "memang belum ada memory"
    // dan "gagal ke-generate". Satu rung penanda menghilangkan keraguan itu - pola yang sama dipakai
    // HMI_Input.
    if(!SMEM.length){
        P("MEMORY_NOP","BOOL","No operation, reserved for memory latch");
        SMEM.push(series(om++,[["GSB000",false]],"MEMORY_NOP",
            "No memory block in this station's motion sequence yet - add SET/RESET MEMORY blocks in the web UI"));
    }

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
    // Slot cadangan belum punya solenoid, jadi barisnya berhenti di simbol output kosong -
    // NOP yang tempatnya sudah benar. Sisi otomatisnya sengaja dikosongkan (merge2 argumen
    // pertama null-nya diisi perintah individual): slot ini belum ada di urutan gerak mana pun.
    // Yang diganti nanti cuma nama coil-nya, bentuk rungnya sudah betul.
    spareList.forEach(function(s,j){
        S11.push(merge2(o++,s.oM,null,s.solM,
            j===0?"Spare slot command to output, no solenoid yet - point the coil at the real output when one is wired":null));
        S11.push(merge2(o++,s.oR,null,s.solR,null));
    });

    // 12. HMI_Output
    // Lampu diindeks per AKTUATOR, bukan per AS-pair. Di screen NB, satu slot grid memuat tombol dan
    // lampunya sekaligus - switch-nya baca W48x dan nulis W46x di BIT yang sama. Kalau lampu dihitung
    // dari daftar AS-pair sementara tombol dari daftar aktuator, dua daftar itu beda panjang begitu
    // ada aktuator tanpa sensor, dan mulai slot itu lampu di layar nunjuk device yang lain dari
    // tombolnya. Sumber nyalanya LSC yang sama dengan yang dipakai motion fault (lihat lscFor).
    var S12=[]; o=1;
    actus.forEach(function(a,i){
        var slot=hmiSlot(SN,i);
        var pM="PL4"+SN+slot.pg+"_"+slot.nn+"M", pR="PL4"+SN+slot.pg+"_"+slot.nn+"R";
        var L=lscFor(a);
        // Aktuator openloop gak punya sensor by design, jadi lampunya nampilin PERINTAH - bukan
        // posisi. Itu tetap informasi yang benar buat operator, dan lebih baik daripada slot gelap.
        var srcM=L.open?a[0].name:L.a, srcR=L.open?a[1].name:L.b;
        G(pM,"BOOL","Lamp, "+a[0].komen); G(pR,"BOOL","Lamp, "+a[1].komen);
        if(slot.over) W("hmi_slot_overflow",stKey,stKey+": lamp "+a[0].komen+" does not fit this station's HMI word budget.",{device:a[0].name});
        else {
            var rw=slot.word+HMI_CFG.rdOfs;
            hmiClaim(pM, atBit(HMI_CFG.btnArea,rw,slot.bit),   "PLC->HMI", "04"+SN+slot.pg, a[0].komen);
            hmiClaim(pR, atBit(HMI_CFG.btnArea,rw,slot.bit+1), "PLC->HMI", "04"+SN+slot.pg, a[1].komen);
        }
        if(!srcM||!srcR){ W("hmi_lamp_no_source",stKey,stKey+": lamp "+a[0].komen+" has no position sensor, its HMI slot stays dark.",{device:a[0].name}); return; }
        S12.push(series(o++,[[srcM,false]],pM, i===0?"Actuator position feedback to operation panel":null));
        S12.push(series(o++,[[srcR,false]],pR,null));
    });
    srvActus.forEach(function(sa,i){
        var idx=actus.length+i, slot=hmiSlot(SN,idx);
        var pS="PL4"+SN+slot.pg+"_"+slot.nn+"S";
        G(pS,"BOOL","Lamp, "+sa.cmd.komen);
        var src=srvLscOf[sa.cmd.name]||sa.cmd.name;
        if(!slot.over) hmiClaim(pS, atBit(HMI_CFG.btnArea,slot.word+HMI_CFG.rdOfs,slot.bit), "PLC->HMI", "04"+SN+slot.pg, sa.cmd.komen);
        S12.push(series(o++,[[src,false]],pS,null));
    });

    // Lampu slot cadangan: sumbernya bit COMMAND, bukan sensor - belum ada sensornya. Sama
    // seperti aktuator openloop, dan lebih baik daripada slot yang gelap di layar.
    spareList.forEach(function(s,j){
        S12.push(series(o++,[[s.oM,false]],s.plM, j===0?"Spare slot indication, follows the command until a sensor exists":null));
        S12.push(series(o++,[[s.oR,false]],s.plR,null));
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
      // Memory duduk antara HMI_Output dan Device_Output - urutan yang sama dengan program produksi
      sect("Memory",13,SMEM),sect("Device_Output",14,S13),sect("Station_Output",15,S14)];
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
    // Baris array-level AL/MF sengaja TANPA komen. Komen yang berarti ada di tiap ELEMEN
    // (AL[11] "AL011_ ST1 STOPPER-5 ALL REED SWITCH ON"); komen array-level cuma nutupin
    // kolom Comment di tabel Sysmac dengan teks generik yang sama buat 100 baris.
    G("AL",AL_TYPE,""); G("MF",MF_TYPE,"");
    var allDevs=[]; Object.keys(groups).forEach(function(k){ allDevs=allDevs.concat(groups[k]); });
    allDevs.forEach(function(d){ G(portName(d.address),"BOOL",d.komen); G(d.name,"BOOL",d.komen); });
    ukeys.forEach(function(k){
        var gb=STMAP[k].gb;
        ["00","01","02","03","04","05","06","09","20"].forEach(function(b){ G(gb+"_"+b,"BOOL",labelOf(k)+" status bit"); });
    });
    function has(n){ return devs.some(function(d){return d.name===n;}); }
    function req(n,l){ if(!has(n)){ W("main_bit_missing","MAIN",'MAIN: "'+n+'" ('+l+') not found in IO list, GSB000 used instead.'); return "GSB000"; } return n; }
    var sEmg=req("NOT_EMG_STOP","emergency stop"), sFuse=req("FUSE_GOOD","fuse"), sAir=req("AIR_SC_CONF","air source"),
        sSafe=req("SAFE_CONF","safety"), sMstr=req("MSTR_RDY","master on confirm"), sPbMstr=req("PB_MSTR_ON","master on button"),
        sSel=req("SS_AUTO_IND","auto individual selector"), sPbAuto=req("PB_AUTO_RUN","auto start button"),
        sPbCyc=req("PB_CYCL_STOP","cycle stop button"), sPbRst=req("PB_ALM_RST","alarm reset button"),
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

    // 3. HMI_Input - lihat catatan yang sama di buildUnit: tombol masuk lewat AT, bukan rung.
    var S3=[]; o=1;
    P("HMI_INPUT_NOP","BOOL","No operation, reserved for HMI input");
    S3.push(series(o++,[["GSB000",false]],"HMI_INPUT_NOP",
        HMI_CFG.on ? "HMI buttons arrive by AT specification, no logic needed : screen 004 buttons "+HMI_CFG.btnArea+HMI_CFG.pbBase
                     +", status lamps "+HMI_CFG.btnArea+(HMI_CFG.pbBase+HMI_CFG.rdOfs)
                   : "HMI address map disabled, no HMI input"));

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
    // Master on/off confirmation: SATU rung, DUA coil, persis pola Ndeso di program asli.
    //
    //        MSTR_RDY  /PB_MSTR_ON               /LB009        (LB008)
    //   rail-+--| |--------|/|------+-------------|/|------------( )
    //        |                      |
    //        +--| |----------------+-------------|/|------------( )
    //           LB008                             /MSTR_RDY      (LB009)
    //
    // Tiga hal yang beda dari versi lama, semuanya disengaja:
    //
    // 1. PB_MSTR_ON dipakai sebagai kontak NC (negated), sesuai program aslinya. Tombolnya
    //    diwiring normally-closed, jadi input PLC-nya TRUE saat tombol tidak ditekan. Kontak NC
    //    di ladder membuat rung ini kembali TRUE begitu tombol dilepas - dan karena LB008 nyeal
    //    dirinya sendiri, penekanan tombol tetap yang mengawali, bukan yang menahannya.
    //
    // 2. Seal LB008 mem-bypass MSTR_RDY *dan* PB_MSTR_ON, bukan cuma PB-nya. Titik cabangnya di
    //    RAIL. Dulu MSTR_RDY diseri SESUDAH gerbang OR, jadi begitu master ready hilang sekejap
    //    (mis. drop tegangan kontrol) seal-nya ikut lepas dan konfirmasi master hilang diam-diam.
    //
    // 3. LB009 sekarang diambil dari simpul BERSAMA, bukan rung terpisah berisi /MSTR_RDY saja.
    //    Efeknya LB009 = (master pernah on) DAN master ready hilang. Versi lama LB009 = /MSTR_RDY
    //    doang, artinya "master off confirmed" nyala sejak PLC baru hidup - padahal master-nya
    //    belum pernah dinyalakan sama sekali. Itu status palsu yang bisa dipakai logic lain.
    (function(){
        var r=new Rung(o++, "Master on and off confirmation");
        var rail=r.rail();
        var trig=r.ct(sPbMstr, r.ct(sMstr, rail), true);   // MSTR_RDY -> /PB_MSTR_ON (NC)
        var seal=r.ct("LB008", rail);                      // seal, langsung dari rail
        var onCoil =r.cl("LB008", r.ctm("LB009",[trig,seal],true));   // ANDNOT LB009
        var offCoil=r.cl("LB009", r.ctm(sMstr,   [trig,seal],true));  // ANDNOT MSTR_RDY
        r.rr([onCoil,offCoil]);
        S5.push(r.build());
    })();
    P("LB008","BOOL","Master on confirmed"); P("LB009","BOOL","Master off confirmed");
    var emg=[];
    [[1,sEmg,"Emergency stop button pressed"],[2,sFuse,"Fuse disconnected"],
     [3,sAir,"Air source pressure lost"],[4,sSafe,"Safety cover or light curtain open"]].forEach(function(x,i){
        var t=AL(x[0],x[2]); emg.push(t);
        var r=new Rung(o++, i===0?"Emergency stop group, latched until alarm reset: "+x[2]:x[2]);
        var rail=r.rail(), c;
        if(x[0]===3){
            // Angin dinilai HANYA saat angin memang seharusnya ada, bukan sepanjang PLC hidup.
            // Bentuknya diambil dari program mesin:
            //
            //   LB009 -- SAFE_CONF -- LB019 --+-- /AIR_SC_CONF --+-- ( AL[3] )
            //   LB002 ------------------------+                  |
            //   AL[3] --------------------------------------------+
            //
            // Dua cabang, dua keadaan yang sah-sah saja punya angin: mesin sudah selesai
            // dimatikan tapi tetap aman dan bertegangan, atau master sudah hidup cukup lama.
            //
            // LB019 itu hasil SELURUH grup emergency yang sudah bersih, bukan kontak tombol
            // E-stop. Tombolnya cuma satu dari lima sebab grup itu menyala; dipakai langsung,
            // angin tetap dinilai padahal fuse masih putus atau safety masih terbuka. LB019
            // memang memuat /AL[3] di dalamnya, tapi itu bukan lingkaran: coil LB019 ada jauh
            // di bawah rung ini, jadi yang terbaca hasil scan sebelumnya. Efeknya justru benar -
            // begitu satu alarm emergency menyala, alarm angin tidak ikut menumpuk, dan yang
            // sudah menyala tetap ditahan seal-nya.
            // Gerbang lamanya cuma LB001 (jeda power-on 5 detik) dan itu terlalu kasar - dengan
            // itu, E-stop ditekan atau pintu safety dibuka pun tetap dinilai, padahal di situ
            // anginnya memang SENGAJA dibuang. Alarm yang menyala karena mesin bekerja sesuai
            // rancangannya lama-lama diabaikan operator, dan alarm yang diabaikan sama saja
            // dengan tidak ada.
            //
            // Sebelum master pernah dinyalakan sekali pun, LB009 masih OFF dan LB002 belum
            // pernah jalan - jadi tidak ada yang dinilai. Itu benar: belum ada yang mencoba
            // menghidupkan mesin, belum ada yang perlu dikeluhkan soal angin.
            var b1=r.ct("LB019", r.ct(sSafe, r.ct("LB009", rail)));
            var b2=r.ct("LB002", rail);
            c=r.ctm(x[1],[b1,b2],true);
        } else {
            c=r.ct(x[1],r.ct("LB001",rail),true);
        }
        r.rr([r.clm(t,[c,r.ct(t,rail)])]); S5.push(r.build());
    });
    // Angin punya DUA alarm, bukan satu, dan keduanya ada di program mesin:
    //
    //   AL[3]  tekanan angin jatuh   - pressure switch bilang angin hilang. Level, di-latch.
    //   AL[5]  pressure switch rusak - switch-nya TIDAK SEPAKAT dengan perintahnya.
    //
    // Yang kedua menangkap apa yang tidak bisa ditangkap yang pertama. Pressure switch yang
    // mati nyangkut di posisi "angin ada" tidak pernah memicu AL[3] - alarmnya diam selamanya
    // dan mesin jalan tanpa penjaga tekanan. Bentuk detektornya sengaja simetris:
    //
    //   MSTR_RDY  AND NOT AIR   master hidup, switch bilang tidak ada angin
    //   NOT MSTR_RDY  AND AIR   master mati, switch masih bilang ada angin
    //
    // Dua-duanya lewat SATU timer: selisih sesaat itu normal (tangki mengisi, angin membuang),
    // yang tidak normal itu selisih yang bertahan. Tanpa timer, alarm ini menyala tiap kali
    // master di-ON dan langsung dianggap gangguan palsu oleh operator.
    (function(){
        // Butuh DUA sinyal yang saling dibandingkan. Kalau salah satunya tidak ada di IO list,
        // req() mengembalikan GSB000 dan pembandingnya berubah arti: cabang kedua jadi
        // "NOT MSTR_RDY AND GSB000" = alarm tiap kali master mati. Lebih baik tidak dibuat -
        // tapi dilaporkan, karena alarm yang hilang tanpa kabar itu justru yang berbahaya.
        if(sAir==="GSB000" || sMstr==="GSB000"){
            W("air_ps_fault_skipped","MAIN","MAIN: air source pressure switch fault needs both AIR_SC_CONF and MSTR_RDY in the I/O list - "
              +"only the pressure-fall alarm AL[3] is generated, so a pressure switch stuck at 'air present' stays undetected.");
            return;
        }
        var t=AL(5,"Air source pressure switch fault"); emg.push(t);
        P("LT012","TON","Air source pressure switch disagreement");
        var r=new Rung(o++, "Air source pressure switch fault: sensor disagrees with the master command");
        var rail=r.rail();
        var c1=r.ct(sAir, r.ct(sMstr, rail),      true);
        var c2=r.ct(sAir, r.ct(sMstr, rail, true), false);
        r.rr([r.ton([c1,c2], T_AIRPS, "LT012", t)]);
        S5.push(r.build());
    })();
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
        // Interlock E-stop mengikuti LB019 - hasil SELURUH grup emergency yang sudah bersih -
        // bukan kontak tombolnya langsung. Tombolnya cuma satu dari lima sebab grup itu menyala;
        // dari NOT_EMG_STOP, interlock lepas begitu tombol dilepas walau fuse masih putus, angin
        // masih hilang, atau safety masih terbuka. Lewat LB019 interlock baru lepas setelah semua
        // sebabnya hilang DAN alarmnya di-reset - dan itu memang arti "interlock".
        else if(/EMERGENCY|EMER/.test(k)){ src="LB019"; cmt="Emergency stop interlock follows the emergency group result, not the button alone"; }
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
        hmiClaim(x[1], atBit(HMI_CFG.btnArea,HMI_CFG.lampBase,i), "PLC->HMI", "001", x[2]);
        S10.push(series(o++,[[x[0],false]],x[1], i===0?"Machine status to operation panel":null));
    });
    // Array lampu kondisi: satu rung per elemen, isinya stub GSB000 (selalu ON) kecuali yang bisa
    // diturunkan dari bit yang memang sudah ada. Di program produksi bentuknya persis begini -
    // "GSB000 -> PL21[n]" - karena syarat tiap mesin beda dan diisi belakangan. Yang penting
    // rung + elemennya SUDAH ADA supaya screen 0021/0031 punya bit buat dibaca, bukan kosong.
    COND_ARRAYS.forEach(function(ca,ai){
        G(ca.name, "ARRAY[0.."+(ca.size-1)+"] OF BOOL", ca.doc);
        hmiClaimRange(ca.name, HMI_CFG.btnArea, HMI_CFG.condBase+ai, ca.size, "PLC->HMI", ca.screen, ca.doc);
        for(var i2=0;i2<ca.size;i2++){
            var src = ca.seed[i2] || "GSB000";
            S10.push(series(o++,[[src,false]],ca.name+"["+i2+"]", i2===0?ca.doc:null));
        }
    });

    // 11. Memory
    // MAIN gak punya flowchart, jadi belum ada latch yang digenerate ke sini. Section-nya tetap
    // dibikin supaya SEMUA program punya tempat baku buat bit memory - kalau tidak, orang menaruhnya
    // di section lain dan tiap program jadi beda tempat.
    var SMEM=[]; o=1;
    P("MEMORY_NOP","BOOL","No operation, reserved for memory latch");
    SMEM.push(series(o++,[["GSB000",false]],"MEMORY_NOP",
        "Machine-level memory latches belong here - none generated yet"));

    // 12. Device_Output
    var S11=[]; o=1;
    outputs.forEach(function(d,i){ S11.push(series(o++,[[d.name,false]],portName(d.address), i===0?"Symbol to physical output":null)); });

    // 13. Station_Output
    var S12=[]; o=1;
    [["LB001","PWR_ON"],["GSB000","PLC_GOOD"],["LB004","AUTO_MODE"],["LB005","IND_MODE"],["LB060","NO_FAULT"],
     ["LB099","HOME_POST"],["LB120","AUTO_RUN"],["LB121","CYCLE_STOP"],["LB002","MSTR_RDY"]].forEach(function(x,i){
        S12.push(series(o++,[[x[0],false]],x[1], i===0?"Machine status broadcast to all unit programs":null));
    });

    var secs=[sect("Station_Input",1,S1),sect("Device_Input",2,S2),sect("HMI_Input",3,S3),sect("Timers",4,S4),
      sect("Fault",5,S5),sect("Master_Preparation",6,S6),sect("Condition",7,S7),sect("Auto_Main_Loop",8,S8),
      sect("Main_Out",9,S9),sect("HMI_Output",10,S10),
      sect("Memory",11,SMEM),sect("Device_Output",12,S11),sect("Station_Output",13,S12)];
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



// ============================================================ probe instruksi
// File kecil berisi SATU rung per instruksi baru. Gunanya cuma satu: di-import ke project kosong
// di Susmax Studio buat membuktikan bentuk XML-nya benar, SEBELUM 30 rung counter digenerate
// dengan bentuk yang sama. Kalau file ini ditolak, yang rugi cuma project kosong; kalau bentuk
// yang salah ikut ke program mesin, ketahuannya baru pas mesin bergerak.
function buildProbe(){
    var ext=[],priv=[],glob=[],nameCI={};
    function G(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; var v=vr(n,t,d); glob.push("      "+v); ext.push("      "+v); GLOBALS[n]={t:t||"BOOL",d:d||""}; }
    G("PRB_TRIG","BOOL","Probe trigger");
    G("PRB_LAMP","BOOL","Probe result lamp");
    G("PRB_A","UDINT","Probe value A");
    G("PRB_B","UDINT","Probe value B");
    var S=[], o=1;
    // Tiap rung SATU varian bentuk XML. Komennya diberi nomor supaya waktu sebagian ditolak,
    // yang perlu dilaporkan cuma "varian nomor sekian yang selamat" - bukan menebak lagi.
    // Rung yang ditolak Studio jadi rung komentar bertanda "(Import failed)"; kalau kotaknya
    // tergambar tapi bertanda "(DefinitionError)", nama + susunan pin-nya yang tidak cocok.
    function P1(label, fn){ var r=new Rung(o, "V"+o+" "+label); fn(r); S.push(r.build()); o++; }

    // RONDE 2. Ronde 1 menebak susunan pin; hasilnya cuma MOVE yang lulus. Ronde ini tidak
    // menebak lagi - susunan pin diambil dari project mesin lewat `--probe-fb`, yang sisa
    // pertanyaannya tinggal SATU: bagaimana pin tanpa nama itu ditulis di XML import.
    // Rinciannya di CLAUDE.md "Instruksi di luar kontak/coil".

    // V1 kontrol: satu-satunya bentuk yang sudah terbukti. Kalau yang ini ikut gagal,
    // yang salah bukan susunan pin-nya melainkan filenya secara keseluruhan.
    P1("MOVE - EN,In -> ENO,Out  [terbukti di ronde 1]", function(r){
        var e=r.ct("PRB_TRIG", r.rail());
        var b=r.blk("MOVE",null,[["EN",e],["In",r.src("PRB_A")]],["ENO","Out"]);
        r.sink("PRB_B", b.Out);
        r.rr([b.ENO]);
    });

    // ---- pembanding: TIDAK punya ENO, pin hasilnya tanpa nama ----
    // Yang diuji: pin tanpa nama ditulis parameterName="" atau "Out", dan nama simbol vs kata.
    P1("< (simbol) - EN,In1,In2 -> pin hasil tanpa nama", function(r){
        var b=r.blk("<",null,[["EN",r.rail()],["In1",r.src("PRB_A")],["In2",r.src("PRB_B")]],[""]);
        r.rr([r.cl("PRB_LAMP", b[""])]);
    });
    P1("< (simbol) - EN,In1,In2 -> Out", function(r){
        var b=r.blk("<",null,[["EN",r.rail()],["In1",r.src("PRB_A")],["In2",r.src("PRB_B")]],["Out"]);
        r.rr([r.cl("PRB_LAMP", b.Out)]);
    });
    P1("LT (kata) - EN,In1,In2 -> pin hasil tanpa nama", function(r){
        var b=r.blk("LT",null,[["EN",r.rail()],["In1",r.src("PRB_A")],["In2",r.src("PRB_B")]],[""]);
        r.rr([r.cl("PRB_LAMP", b[""])]);
    });
    P1("= (simbol) - EN,In1,In2 -> pin hasil tanpa nama", function(r){
        var b=r.blk("=",null,[["EN",r.rail()],["In1",r.src("PRB_A")],["In2",r.src("PRB_B")]],[""]);
        r.rr([r.cl("PRB_LAMP", b[""])]);
    });

    // ---- clock: EN masuk, satu pin keluar tanpa nama, tanpa ENO ----
    P1("Get1sClk - EN -> pin hasil tanpa nama", function(r){
        var b=r.blk("Get1sClk",null,[["EN",r.rail()]],[""]);
        r.rr([r.cl("PRB_LAMP", b[""])]);
    });
    // Anggota lain keluarga yang sama: memisahkan "bentuknya salah" dari "nama itu tidak ada".
    P1("Get100msClk - EN -> pin hasil tanpa nama", function(r){
        var b=r.blk("Get100msClk",null,[["EN",r.rail()]],[""]);
        r.rr([r.cl("PRB_LAMP", b[""])]);
    });

    // ---- Inc: pin in-out ----
    // Bentuk yang dipakai generator sekarang, disalin dari Function0 di Sample.xml:
    // <InOutVariables> di depan, sisi keluarnya ke DataSink dengan variabel yang SAMA,
    // dan pin yang tidak dipakai tidak ditulis sama sekali.
    P1("Inc - InOut lewat <InOutVariables>, ENO ke rel", function(r){
        var e=r.ct("PRB_TRIG", r.rail());
        var b=r.blk("Inc",null,[["EN",e]],["ENO"],[["InOut",r.src("PRB_A")]]);
        r.sink("PRB_A", b.InOut);
        r.rr([b.ENO]);
    });
    // Persis pola Function0: ENO tidak ditulis, yang menyambung ke rel kanan justru pin
    // nilai balik tanpa nama.
    P1("Inc - tanpa ENO, pin tanpa nama yang ke rel", function(r){
        var e=r.ct("PRB_TRIG", r.rail());
        var b=r.blk("Inc",null,[["EN",e]],[""],[["InOut",r.src("PRB_A")]]);
        r.sink("PRB_A", b.InOut);
        r.rr([b[""]]);
    });
    // Ketiga pin keluar ditulis semua dan dua-duanya ada yang memakai.
    P1("Inc - ENO ke rel + nilai balik ke coil", function(r){
        var e=r.ct("PRB_TRIG", r.rail());
        var b=r.blk("Inc",null,[["EN",e]],["ENO",""],[["InOut",r.src("PRB_A")]]);
        r.sink("PRB_A", b.InOut);
        // Coil-nya ikut ke rel kanan. Coil yang berhenti di udara bikin rung ini masuk KOSONG,
        // dan probe yang rung-nya kosong menuduh bentuk pin Inc padahal yang salah kabelnya.
        var lamp=r.cl("PRB_LAMP", b[""]);
        r.rr([b.ENO, lamp]);
    });

    // ---- aritmatika: punya ENO, TAPI pin hasilnya tanpa nama ----
    P1("+ (simbol) - EN,In1,In2 -> ENO + hasil tanpa nama", function(r){
        var e=r.ct("PRB_TRIG", r.rail());
        var b=r.blk("+",null,[["EN",e],["In1",r.src("PRB_A")],["In2",r.src("UDINT#1")]],["ENO",""]);
        r.sink("PRB_B", b[""]);
        r.rr([b.ENO]);
    });
    P1("ADD (kata) - EN,In1,In2 -> ENO,Out", function(r){
        var e=r.ct("PRB_TRIG", r.rail());
        var b=r.blk("ADD",null,[["EN",e],["In1",r.src("PRB_A")],["In2",r.src("UDINT#1")]],["ENO","Out"]);
        r.sink("PRB_B", b.Out);
        r.rr([b.ENO]);
    });

    return { name:"_Probe_Instructions.xml", xml:prog("P999_Probe",ext,priv,[sect("Probe",1,S)],glob),
             stats:"PROBE ronde 2: "+S.length+" varian (MOVE, pembanding, Get**Clk, Inc, ADD) - import ke "
                  +"project KOSONG, catat nomor V yang TIDAK bertanda (DefinitionError) / (Import failed)" };
}


// ============================================================ P000_Initial
// Bit rangka yang dipakai SELURUH program: GSB000 selalu ON, GSB001 selalu OFF, lalu deretan
// coil cadangan. Sebelum ini generator memakai GSB000 di puluhan rung sebagai penanda tapi tidak
// pernah membuatnya - hasil generate di-import ke project kosong, bitnya tidak ada, dan semua
// rung penanda itu mati tanpa ada yang protes. Program ini yang menutup lubang itu.
//
// Isinya nol machine-specific: sama persis untuk mesin apa pun.
var GSB_DESIGN_LAST = 9;    // GSB002..GSB009 cadangan desain
var GSB_ADJUST_LAST = 25;   // GSB010..GSB025 cadangan penyetelan
function buildInitial(){
    var ext=[],priv=[],glob=[],nameCI={};
    function G(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; var v=vr(n,t,d); glob.push("      "+v); ext.push("      "+v); GLOBALS[n]={t:t||"BOOL",d:d||""}; }

    // 1. Design_Coil
    var S1=[], o=1;
    G("GSB000","BOOL","Equipment design coil, constant ON");
    G("GSB001","BOOL","Equipment design coil, constant OFF");
    // P_On / P_Off itu system variable Susmax - selalu ada, tidak perlu dideklarasi ulang.
    S1.push(series(o++,[["P_On",false]],"GSB000","Bits held permanently on and off by design"));
    S1.push(series(o++,[["P_Off",false]],"GSB001",null));
    for(var d=2; d<=GSB_DESIGN_LAST; d++){
        var gd="GSB"+pad(d,3);
        G(gd,"BOOL","For machine design, spare "+(d-1));
        S1.push(series(o++,[["GSB001",false]],gd, d===2?"Design spare coils":null));
    }
    // Clock pulse. Get**Clk itu instruksi, bukan kontak. Bentuknya: EN masuk, SATU pin keluar
    // TANPA NAMA - keluarga ini tidak punya ENO sama sekali (docs/SYSMAC_INSTRUCTIONS.md).
    // Minta "ENO" di sini persis yang bikin Studio menjawab (DefinitionError)Get1sClk.
    var clocks=[["aP_1s","Get1sClk","1 second clock pulse"],
                ["aP_0_1s","Get100msClk","0.1 second clock pulse"],
                ["aP_0_01s","Get10msClk","0.01 second clock pulse"]];
    clocks.forEach(function(c,i){
        G(c[0],"BOOL",c[2]);
        if(ADV_OK){
            var r=new Rung(o++, i===0?"Clock pulses":null);
            var rail=r.rail();
            var out=r.blk(c[1],null,[["EN",rail]],[""]);
            r.rr([r.cl(c[0],out[""])]);
            S1.push(r.build());
        } else {
            S1.push(series(o++,[["GSB001",false]],c[0],
                i===0?"Clock pulses need "+c[1]+"() - enable advanced instructions to generate them":null));
        }
    });

    // 2. Adjust_Coil
    var S2=[]; o=1;
    for(var a=GSB_DESIGN_LAST+1; a<=GSB_ADJUST_LAST; a++){
        var ga="GSB"+pad(a,3);
        G(ga,"BOOL","For machine adjustment, spare "+(a-GSB_DESIGN_LAST));
        S2.push(series(o++,[["GSB001",false]],ga, a===GSB_DESIGN_LAST+1?"Adjustment spare coils":null));
    }

    var secs=[sect("Design_Coil",1,S1),sect("Adjust_Coil",2,S2)];
    return { name:"P000_Initial.xml", xml:prog("P000_Initial",ext,priv,secs,glob),
             stats:"INITIAL: GSB000/GSB001 + "+(GSB_ADJUST_LAST-1)+" spare coil, "
                  +(ADV_OK?"clock pulses generated":"clock pulses placeholder") };
}

// ============================================================ Prg003_HMI
// Program khusus antarmuka operator. Isinya bukan logika mesin: dia merangkum bit yang sudah
// dihitung program lain jadi bentuk yang dibaca panel - lampu status, rangkuman syarat master /
// auto start, dan (nanti) counter. Dipisah dari MAIN karena tugasnya memang beda: MAIN yang
// memutuskan mesin boleh jalan atau tidak, program ini cuma MENAMPILKAN kenapa.
function buildHmi(){
    var ext=[],priv=[],glob=[],nameCI={};
    function G(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; var v=vr(n,t,d); glob.push("      "+v); ext.push("      "+v); GLOBALS[n]={t:t||"BOOL",d:d||""}; }
    function P(n,t,d){ var k=n.toUpperCase(); if(nameCI[k]) return; nameCI[k]=n; priv.push("      "+vr(n,t,d)); }
    G("GSB000","BOOL","Equipment design coil, constant ON");
    MAIN_EXPORTS.forEach(function(n){ G(n,"BOOL","Machine status broadcast to all units"); });
    COND_ARRAYS.forEach(function(ca){ G(ca.name,"ARRAY[0.."+(ca.size-1)+"] OF BOOL",ca.doc); });

    // 1. TP_Control
    var S1=[], o=1, tpBit=6;
    // Mirror status ke lampu panel. Sengaja lewat simbol PL_TP_* sendiri, bukan langsung memakai
    // bit statusnya: panel dan ladder jadi bisa berubah sendiri-sendiri tanpa saling menyeret.
    [["MSTR_RDY","PL_TP_MSTR_RDY","Master ready indication"],
     ["AUTO_RUN","PL_TP_AUTO_RUN","Auto running indication"],
     ["HOME_POST","PL_TP_HOME_POS","All machine home indication"],
     ["IND_MODE","PL_TP_IND_MODE","Individual mode indication"],
     ["NO_FAULT","PL_TP_NO_FLT","No fault indication"]].forEach(function(x,i){
        G(x[1],"BOOL",x[2]);
        // Lanjut dari bit sisa word lampu MAIN - PL_HMI_* memakai .00-.05, jadi PL_TP_* mulai .06.
        // Satu word buat semua lampu status, gampang dibaca sekali lihat di NB.
        hmiClaim(x[1], atBit(HMI_CFG.btnArea,HMI_CFG.lampBase,tpBit++), "PLC->HMI", "001", x[2]);
        S1.push(series(o++,[[x[0],false]],x[1], i===0?"Machine status to touch panel":null));
    });
    // Rangkuman tiap array kondisi: elemen dipecah per COND_CHUNK jadi bit antara, lalu bit-bit
    // antara itu di-AND jadi satu bit "semua syarat terpenuhi". Dipecah karena satu rung dengan
    // 16 kontak seri tidak terbaca di layar Susmax Studio, dan operator yang mencari syarat mana
    // yang belum jalan bisa langsung lihat kelompok mana yang mati.
    var condSummary={};
    COND_ARRAYS.forEach(function(ca,ai){
        var parts=[];
        for(var s=0;s<ca.size;s+=COND_CHUNK){
            var grp=[];
            for(var i2=s;i2<Math.min(s+COND_CHUNK,ca.size);i2++) grp.push([ca.name+"["+i2+"]",false]);
            var pb="LB"+pad(1+ai*10+s/COND_CHUNK,3);
            P(pb,"BOOL",ca.doc+" group "+(s/COND_CHUNK+1));
            S1.push(series(o++,grp,pb, s===0?("■ "+ca.doc):null));
            parts.push([pb,false]);
        }
        var all="LB"+pad(8+ai*10,3);
        P(all,"BOOL",ca.doc+", all groups established");
        S1.push(series(o++,parts,all,null));
        condSummary[ca.name]=all;
    });
    G("PL_TP_MSTR_COND","BOOL","Master on condition established indication");
    hmiClaim("PL_TP_MSTR_COND", atBit(HMI_CFG.btnArea,HMI_CFG.lampBase,tpBit++), "PLC->HMI", "001", "Master on condition established indication");
    S1.push(series(o++,[[condSummary.PL21,false],["MSTR_RDY",false]],"PL_TP_MSTR_COND","Master on condition established"));
    G("PL_TP_AUTO_COND","BOOL","Auto start condition established indication");
    hmiClaim("PL_TP_AUTO_COND", atBit(HMI_CFG.btnArea,HMI_CFG.lampBase,tpBit++), "PLC->HMI", "001", "Auto start condition established indication");
    S1.push(series(o++,[[condSummary.PL031,false],[condSummary.PL032,false]],"PL_TP_AUTO_COND","Auto start condition established"));

    // 2. Counters
    // Pola counter Denso butuh pembanding (`<`, `<>`, `>=`) dan Inc() - di luar kontak/coil/TON.
    // Susunan pin-nya sudah pasti (docs/SYSMAC_INSTRUCTIONS.md + `--probe-fb`), yang belum pasti
    // cuma cara menulis pin tanpa nama di XML import. Karena itu tetap di balik ADV_OK sampai
    // _Probe_Instructions.xml ter-import bersih: XML yang ditebak masuk tanpa keluhan lalu salah
    // waktu jalan, dan itu baru ketahuan pas mesinnya bergerak. Lihat TODO.md 5a.
    var S2=[]; o=1;
    G("GCT","ARRAY[1.."+CNT_N+"] OF BOOL","Counter count trigger");
    G(CNT_CUR, "ARRAY[1.."+CNT_N+"] OF UDINT","Counter present value");
    G(CNT_SET, "ARRAY[1.."+CNT_N+"] OF UDINT","Counter target value");
    G(CNT_WARN,"ARRAY[1.."+CNT_N+"] OF UDINT","Counter warning threshold");
    CNT_LAMPS.forEach(function(cl,ci){
        G(cl.name,"ARRAY[0.."+(cl.size-1)+"] OF BOOL","Counter indication, screen "+cl.screen);
        hmiClaimRange(cl.name, HMI_CFG.btnArea, HMI_CFG.cntBase+ci, cl.size, "PLC->HMI", cl.screen, "Counter indication");
    });
    // Nilai angkanya ikut dipublish: target dan ambang diketik operator di HMI, hitungan
    // berjalan dibaca balik. Tanpa alamat, layar counter di NB tidak punya apa-apa untuk
    // ditempel. Satu UDINT = 2 word, jadi blok-bloknya ditumpuk berurutan.
    var numW = HMI_CFG.numBase;
    numW = hmiClaimWords(CNT_SET,  HMI_CFG.numArea, numW, CNT_N*2, "HMI<->PLC", "0071", "Counter target value");
    numW = hmiClaimWords(CNT_WARN, HMI_CFG.numArea, numW, CNT_N*2, "HMI<->PLC", "0071", "Counter warning threshold");
    numW = hmiClaimWords(CNT_CUR,  HMI_CFG.numArea, numW, CNT_N*2, "PLC->HMI",  "0071", "Counter present value");
    if(!ADV_OK){
        P("COUNTER_NOP","BOOL","No operation, reserved for counter circuits");
        S2.push(series(o++,[["GSB000",false]],"COUNTER_NOP",
            "Counter circuits need MOVE / compare / Inc - turn on advanced instructions after the probe file imports cleanly"));
        W("counters_not_generated","","Prg003_HMI: the Counters section is still a placeholder. Import _Probe_Instructions.xml into Studio first; if it comes in clean, turn on 'Advanced instructions' and the counters get generated for real.",{level:"info"});
    } else {
        for(var ci2=0; ci2<CNT_N; ci2++){
            var slot=cntLamp(ci2);
            if(!slot){ W("counter_lamp_full","","Counter "+(ci2+1)+" got no lamp slot, skipped."); continue; }
            var n1=ci2+1, act=CNT_CUR+"["+n1+"]", set=CNT_SET+"["+n1+"]", wrn=CNT_WARN+"["+n1+"]";
            var lw=slot.arr+"["+slot.warn+"]", lu=slot.arr+"["+slot.up+"]";
            // Rantai power-flow murni: kontak -> pembanding -> Inc -> rail. Bentuk pin-nya
            // BUKAN tebakan, diambil dari project mesin lewat `reader/cli.js --probe-fb`:
            //   pembanding  EN,In1,In2 -> satu pin TANPA NAMA, TIDAK punya ENO
            //   Inc         EN + InOut di <InOutVariables> -> ENO
            // Nama instruksinya pakai simbol (`<`, `<>`, `>=`), sama seperti yang tersimpan di
            // project nyata; lib.js yang meng-escape `<` jadi &lt; waktu menulis XML.
            var ZERO="UDINT#0";   // literal bertipe - PD071_CUR itu UDINT, "0" telanjang ambigu
            // 1. hitung naik sampai batas cacah, BUKAN sampai target - lihat catatan CNT_MAX.
            var r1=new Rung(o++, "Counter "+n1+" : count up");
            // Kontak trigger DIFERENSIASI NAIK. Tanpa itu Inc jalan tiap scan selama GCT
            // masih nyala, jadi satu tekan tombol menambah puluhan hitungan - dan itu tidak
            // kelihatan waktu import, cuma waktu operator memakainya.
            var g1=r1.ct("GCT["+n1+"]", r1.rail(), false, "rising");
            var lt=r1.blk("<",null,[["EN",g1],["In1",r1.src(act)],["In2",r1.src(CNT_MAX)]],[""]);
            // InOut ditulis sebagai <InOutVariables>, BUKAN didaftar dua kali di Input dan
            // Output. Bentuk ini disalin dari Function0 di contoh resmi Omron (Sample.xml):
            // DataSource -> pin in-out -> DataSink dengan variabel YANG SAMA. Mendaftarnya
            // dua kali bikin Studio melihat 2 masuk + 3 keluar padahal definisinya 1 masuk +
            // 1 keluar + 1 in-out, dan jawabannya "The function name is not defined".
            // Pin nilai balik yang tidak dipakai TIDAK ditulis - contoh Omron pun tidak
            // menulis ENO waktu ENO-nya tidak dipakai. Pin yang ditulis wajib ada yang
            // memakai; kalau tidak: "invalid connection" dan rung-nya ter-import kosong.
            var inc=r1.blk("Inc",null,[["EN",lt[""]]],["ENO"],[["InOut",r1.src(act)]]);
            r1.sink(act, inc.InOut);
            r1.rr([inc.ENO]); S2.push(r1.build());
            // 2. lampu WARNING - padam begitu UP nyala, biar operator gak lihat dua lampu bareng
            var r2=new Rung(o++, "Counter "+n1+" : warning reached");
            var rl2=r2.rail();
            var ne=r2.blk("<>",null,[["EN",rl2],["In1",r2.src(act)],["In2",r2.src(ZERO)]],[""]);
            var ge=r2.blk(">=",null,[["EN",ne[""]],["In1",r2.src(act)],["In2",r2.src(wrn)]],[""]);
            r2.rr([r2.cl(lw, r2.ct(lu, ge[""], true))]); S2.push(r2.build());
            // 3. lampu UP
            var r3=new Rung(o++, "Counter "+n1+" : target reached");
            var rl3=r3.rail();
            var ne3=r3.blk("<>",null,[["EN",rl3],["In1",r3.src(act)],["In2",r3.src(ZERO)]],[""]);
            var ge3=r3.blk(">=",null,[["EN",ne3[""]],["In1",r3.src(act)],["In2",r3.src(set)]],[""]);
            r3.rr([r3.cl(lu, ge3[""])]); S2.push(r3.build());
        }
    }

    // 3. Timers - bentuknya sama dengan counter, yang dihitung pulsa clock
    var S3=[]; o=1;
    for(var ti=0; ti<TMR_N; ti++) G("GTM"+pad(ti+1,3),"BOOL","Timer "+(ti+1)+" count");
    G(TMR_SET,"ARRAY[0..15] OF UDINT","Timer preset value");
    G(TMR_CUR,"ARRAY[0..15] OF UDINT","Timer present value");
    G(TMR_LAMP,"ARRAY[0..9] OF BOOL","Timer up indication, screen 0081");
    // Clock pulse dibangun di P000_Initial, tapi program yang MEMAKAI-nya tetap harus
    // mendeklarasikan sendiri: ExternalVars itu per-program, bukan warisan.
    // Komentarnya diambil dari deklarasi Initial kalau ada, supaya satu simbol tidak punya
    // dua keterangan berbeda di dua berkas.
    if(ADV_OK){
        var tclk={}; for(var tc=0; tc<TMR_N; tc++) tclk[tmrClock(tc)]=1;
        Object.keys(tclk).forEach(function(c){
            G(c,"BOOL",(GLOBALS[c]&&GLOBALS[c].d)||((c==="aP_0_1s"?"0.1":"1")+" second clock pulse"));
        });
    }
    hmiClaimRange(TMR_LAMP, HMI_CFG.btnArea, HMI_CFG.cntBase+CNT_LAMPS.length, 10, "PLC->HMI", "0081", "Timer up indication");
    numW = hmiClaimWords(TMR_SET, HMI_CFG.numArea, numW, 32, "HMI<->PLC", "0081", "Timer preset value");
    numW = hmiClaimWords(TMR_CUR, HMI_CFG.numArea, numW, 32, "PLC->HMI",  "0081", "Timer present value");
    if(!ADV_OK){
        P("TIMER_NOP","BOOL","No operation, reserved for timer circuits");
        S3.push(series(o++,[["GSB000",false]],"TIMER_NOP",
            "Timer circuits need compare / Inc - turn on advanced instructions after the probe file imports cleanly"));
    } else {
        for(var t2=0; t2<TMR_N; t2++){
            var cur=TMR_CUR+"["+t2+"]", pre=TMR_SET+"["+t2+"]", lmp=TMR_LAMP+"["+t2+"]";
            var Z="UDINT#0";
            // 1. GTM menahan, pulsa clock yang mencacah. Edge ada di kontak CLOCK, bukan di GTM:
            // GTM itu "timer ini sedang jalan", jadi kalau edge-nya ditaruh di situ timernya
            // cuma menghitung satu kali seumur hidup.
            var q1=new Rung(o++, "Timer "+(t2+1)+" : count up while running");
            var gt=q1.ct("GTM"+pad(t2+1,3), q1.rail());
            var ck=q1.ct(tmrClock(t2), gt, false, "rising");
            var lt2=q1.blk("<",null,[["EN",ck],["In1",q1.src(cur)],["In2",q1.src(TMR_MAX)]],[""]);
            var inc2=q1.blk("Inc",null,[["EN",lt2[""]]],["ENO"],[["InOut",q1.src(cur)]]);
            q1.sink(cur, inc2.InOut);
            q1.rr([inc2.ENO]); S3.push(q1.build());
            // 2. lampu timer up: preset <> 0 DAN preset sudah tercapai. Syarat "preset <> 0"
            // yang menjaga timer yang belum disetel supaya lampunya tidak langsung menyala.
            var q2=new Rung(o++, "Timer "+(t2+1)+" : preset reached");
            var nz=q2.blk("<>",null,[["EN",q2.rail()],["In1",q2.src(Z)],["In2",q2.src(pre)]],[""]);
            var le=q2.blk("<=",null,[["EN",nz[""]],["In1",q2.src(pre)],["In2",q2.src(cur)]],[""]);
            q2.rr([q2.cl(lmp, le[""])]); S3.push(q2.build());
        }
    }

    // 4. Setup
    var S4=[]; o=1;
    P("SETUP_NOP","BOOL","No operation, reserved for setup handling");
    S4.push(series(o++,[["GSB000",false]],"SETUP_NOP","Product setup / recipe handling belongs here"));

    // 5. Memory
    var S5=[]; o=1;
    P("MEMORY_NOP","BOOL","No operation, reserved for memory latch");
    S5.push(series(o++,[["GSB000",false]],"MEMORY_NOP","HMI-level memory latches belong here - none generated yet"));

    var secs=[sect("TP_Control",1,S1),sect("Counters",2,S2),sect("Timers",3,S3),
              sect("Setup",4,S4),sect("Memory",5,S5)];
    return { name:"Prg003_HMI.xml", xml:prog("Prg003_HMI",ext,priv,secs,glob),
             stats:"HMI: "+COND_ARRAYS.length+" condition array x"+COND_ARRAYS[0].size
                  +", "+CNT_N+" counters, "+TMR_N+" timers"+(ADV_OK?"":" (placeholder)") };
}

if(!groups.MAIN||!groups.MAIN.length) W("no_main_devices","","No MAIN devices found, every comment contains a station tag.");
files.push(buildInitial());
if(!ADV_OK) files.push(buildProbe());
files.push(buildMain(groups.MAIN||[]));
files.push(buildHmi());
ukeys.forEach(function(k){ files.push(buildUnit(k,groups[k])); });

// Index yang direservasi tapi belum kepakai (blok MAIN dan blok tiap station) tetap diisi komen "Spare"
// biar keliatan di tabel Global Variable itu slot cadangan, bukan ketinggalan/hilang
(function fillSpareArrayComments(){
    // Tiap slot kosong dikasih stub nama ber-nomor (AL069_, MF007_) di depan keterangannya. Gunanya
    // biar pas dipakai nanti tinggal dilengkapin jadi nama beneran (AL069_PRESS_NG) - dan yang lebih
    // penting, slot yang gak kepakai jadi PUNYA baris di TSV. Sebelum ini ekor array di luar blok
    // MAIN/station gak dikomen sama sekali, jadi elemennya gak ke-emit dan di Susmax Studio
    // kelihatan kosong melompong - gak kebedain antara "cadangan" dan "kelewat".
    // Komennya sengaja PENDEK: cuma stub bernomor + kata "Spare". Versi panjang dulu ("Spare, reserved
    // for ST1 alarm group") kebaca ratusan kali di tabel dan malah bikin baris yang beneran penting
    // tenggelam. Station pemiliknya gak hilang informasinya - itu kebaca dari nomornya sendiri lewat
    // peta blok yang dicetak di stats, dan blok tiap station sekarang tetap (gak geser-geser lagi).
    function fillRange(fn,prefix,start,end){
        for(var n=start;n<=end;n++){
            var t=fn(n);
            if(!ARRAY_ELEMENTS[t]) ARRAY_ELEMENTS[t]=prefix+pad(n,3)+"_ Spare";
        }
    }
    fillRange(AL,"AL",1,AL_SIZE);
    fillRange(MF,"MF",1,MF_SIZE);
})();

// AL/MF di-AT ke area W supaya Alarm Display dan Event Display di NB bisa baca blok bit-nya
// langsung, tanpa rung penyalin. AT dipasang di variabel ARRAY-nya - elemen array gak bisa di-AT
// satu-satu - jadi AL[1] jatuh di bit .00 word base, AL[17] di .00 word base+1, dan seterusnya.
hmiClaimRange("AL", HMI_CFG.alArea, HMI_CFG.alBase, AL_SIZE, "PLC->HMI", "005/0091", "AL[1.."+AL_SIZE+"]");
hmiClaimRange("MF", HMI_CFG.mfArea, HMI_CFG.mfBase, MF_SIZE, "PLC->HMI", "005/0091", "MF[1.."+MF_SIZE+"]");

var gnames=Object.keys(GLOBALS).sort();
var elNames=Object.keys(ARRAY_ELEMENTS).sort(function(a,b){
    var ma=a.match(/^(\D+)\[(\d+)\]$/), mb=b.match(/^(\D+)\[(\d+)\]$/);
    return ma[1]===mb[1] ? (ma[2]-mb[2]) : ma[1]<mb[1]?-1:1;
});
var TSV_HEAD="Name\tData type\tInitial value\tAT\tRetain\tConstant\tNetwork Publish\tComment";
// Retain menyala untuk apa pun yang duduk di H atau D. H itu Holding - alarm dan bit memori
// tidak boleh hilang waktu power cycle, itu memang gunanya. D menampung angka yang diketik
// operator (target counter, preset timer); tanpa retain, setelan itu balik ke nol tiap
// listrik mati dan mesin jalan dengan target 0 tanpa ada yang memberitahu.
// W biarkan False: itu area kerja tombol/lampu, ditulis ulang tiap scan.
function retainOf(at){ return /^%(H|D)/.test(String(at||"")) ? "True" : "False"; }
function tsvRow(n,t,at,cmt){ return [n,t,"",at||"",retainOf(at),"False","Do not publish",cmt||""].join("\t"); }
// GlobalVariables.tsv itu berkas TEMPEL, bukan berkas baca. Isinya baris saja:
//   - tanpa baris judul. Sysmac menempelkan apa yang ada di clipboard mulai dari sel yang
//     sedang dipilih; baris judul mendarat sebagai variabel bernama "Name" bertipe "Data type".
//   - tanpa baris per elemen (AL[61], MF[7], ...). Elemen array baru bisa diisi SETELAH
//     arraynya di-expand di Studio, jadi di tempelan pertama baris-baris itu tidak punya
//     tujuan - dan ratusan di antaranya bikin blok variabel skalar tidak lagi sejajar dengan
//     apa yang kebuka di layar. Tempatnya di panel AL/MF sendiri.
var tsv=gnames.map(function(n){ var g=GLOBALS[n]; return tsvRow(n,g.t,HMI_AT[n],g.d); }).join("\n");

// File TERPISAH khusus elemen array. Di tabel Global Variable Sysmac, komen elemen baru bisa diisi
// SETELAH array-nya di-expand, dan waktu itu yang kelihatan cuma blok AL[1..n]/MF[1..n] berurutan.
// Kalau yang ditempel file gabungan, ratusan baris variabel skalar ikut kebawa dan barisnya gak
// sejajar sama blok yang lagi kebuka. Makanya elemen dipisah, urutannya persis urutan expand.
var elemTsv = TSV_HEAD+"\n" + elNames.map(function(n){ return tsvRow(n,"BOOL","",ARRAY_ELEMENTS[n]); }).join("\n");
// Baris yang sama dalam bentuk terstruktur, buat panel spreadsheet di web UI
var ARRAY_ROWS = elNames.map(function(n){
    var m=/^(\D+)\[(\d+)\]$/.exec(n);
    return { arr:m?m[1]:n, idx:m?parseInt(m[2],10):0, name:n, komen:ARRAY_ELEMENTS[n] };
});
// Baris global dalam bentuk terstruktur, buat panel Global variables di web UI. Kolomnya sama
// persis dengan yang ditulis tsvRow, jadi yang di layar dan yang di berkas tidak bisa beda.
var GLOBAL_ROWS = gnames.map(function(n){
    var g=GLOBALS[n], at=HMI_AT[n]||"";
    return { name:n, type:g.t, at:at, retain:retainOf(at), komen:g.d||"" };
});
// Peta blok dicetak di stats, bukan diulang-ulang di tiap komen spare: satu baris ini nggantiin
// ratusan "reserved for ST1 alarm group" dan lebih gampang dibaca sekali lihat.
var blockMap = "MAIN AL[1.."+AL_MAIN_RESERVED+"]  |  " + ukeys.map(function(k){
    return k+" AL["+AL_BLOCK[k].start+".."+AL_BLOCK[k].end+"] MF["+MF_BLOCK[k].start+".."+MF_BLOCK[k].end+"]";
}).join("  |  ");
files.push({ name:"ArrayComments.tsv", xml:elemTsv,
             stats:"ARRAY COMMENT: "+elNames.length+" element (AL+MF), buat paste ke tabel yang arraynya sudah di-expand" });
HMI_ROWS.sort(function(a,b){ return a.at<b.at?-1:a.at>b.at?1:0; });
files.push({ name:"GlobalVariables.tsv", xml:tsv,
             stats:"GLOBAL: "+gnames.length+" variable (tanpa header, tanpa elemen array)"
                  +"\nARRAY BLOCK ("+STATION_BLOCK+" slot/station): "+blockMap
                  +(HMI_CFG.on ? "\nHMI AT: "+HMI_ROWS.length+" symbol mapped, buttons "+HMI_CFG.btnArea+HMI_CFG.pbBase
                                 +"+, lamps +"+HMI_CFG.rdOfs+", AL "+HMI_CFG.alArea+HMI_CFG.alBase+", MF "+HMI_CFG.mfArea+HMI_CFG.mfBase
                                 +", "+PER_PAGE+" actuators/screen, "+HMI_CFG.stride+" word/station"
                               : "\nHMI AT: disabled") });

var globVars=gnames.map(function(n){ return "      "+vr(n,GLOBALS[n].t,GLOBALS[n].d); });
// Probe SENGAJA tidak ikut ke AllPrograms.xml. Dia alat uji buat project KOSONG; kalau ikut
// masuk file gabungan, program uji itu ikut ke-import ke project mesin.
var blocks=files.filter(function(f){ return f.name.slice(-4)===".xml" && f.name.indexOf("_Probe")!==0; })
                .map(function(f){ return extractProgram(f.xml); }).filter(Boolean);
files.unshift({ name:"AllPrograms.xml", xml:progMulti("AllPrograms",blocks,globVars),
                stats:"COMBINED: "+blocks.length+" program and "+gnames.length+" global variable in one file" });

msg.payload={ files:files, warnings:warnings.join("\n"), warnList:warnList, unitCount:ukeys.length,
              stats:files.map(function(f){return f.stats;}).join("\n"),
              // Dipakai web UI buat nampilin rekomendasi ukuran array (minimal = yang kepakai sekarang)
              arrayInfo:{ alUsed:AL_USED, mfUsed:MF_USED, alSize:AL_SIZE, mfSize:MF_SIZE,
                          alFilled:AL_FILLED, mfFilled:MF_FILLED, stationBlock:STATION_BLOCK },
              // Peta alamat HMI buat panel "HMI" di web UI dan buat generator screen NB-Designer
              hmiMap:{ cfg:HMI_CFG, rows:HMI_ROWS },
              // Elemen AL/MF buat panel spreadsheet - dipakai buat nyalin kolom Comment ke Sysmac
              arrayRows:ARRAY_ROWS,
              // Baris tabel Global Variable buat panelnya sendiri di web UI
              globalRows:GLOBAL_ROWS,
              lscAudit:lscAudit.join("\n") };
return msg;
