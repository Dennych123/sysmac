// Ekstrak fungsi murni dari index.html hasil build, lalu uji round-trip posisi + anchor + label.
const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');

// gen_all.js ikut tertanam di index.html sebagai string JSON (kutipnya jadi \"), dan sekarang dia
// punya fungsi bernama sama (refBase/refPort). Jadi ambil kemunculan PERTAMA yang bukan blob itu.
function extract(name){
    const sig='function '+name+'(';
    let from=0;
    for(;;){
        const i=html.indexOf(sig,from);
        if(i<0) throw new Error('gak ketemu (versi UI): '+name);
        let d=0,started=false,body=null;
        for(let j=html.indexOf('{',i); j<html.length; j++){
            if(html[j]==='{'){ d++; started=true; }
            else if(html[j]==='}'){ d--; if(started&&d===0){ body=html.slice(i,j+1); break; } }
        }
        if(body && body.indexOf('\\"')<0) return body;
        from=i+sig.length;
    }
}

const names=['nodeLabel','nodeW','sideAnchor','nodeCenter','conditionCommentsOf',
             'conditionPositionsOf','variantsToJSON','layoutVariantNodes','importSequenceJSON','vKey',
             'conditionBitOptions','serializeNode','refBase','refPort','graphEnds',
             'setNodeField','findNode','nodeIndex','pad3','deviceLabel'];
const src='var NODE_W=110,NODE_H=32,ANCHOR_TOP_MARGIN=55;'
        + "var BLOCK_TYPES=['motion','decision','setmem','resetmem','alarm'];"
        + "var ALARM_CATS=['emergency','autostop','cyclestop','faultstop','warning'];"
        + "var ALARM_CAT_LABEL={emergency:'Emergency stop',autostop:'Auto stop',cyclestop:'Cycle stop',faultstop:'Fault stop',warning:'Warning'};"
        + 'var motionState={},motionCounters={},selected=null,conditionState={},devKomen={};'
        + names.map(extract).join('\n')
        + '\nreturn {motionState:function(){return motionState;},setState:function(s){motionState=s;},'
        + 'setCond:function(c){conditionState=c;},conditionBitOptions:conditionBitOptions,'
        + 'graphEnds:graphEnds,setNodeField:setNodeField,deviceLabel:deviceLabel,'
        + 'setKomen:function(m){devKomen=m;},'
        + 'nodeLabel:nodeLabel,nodeW:nodeW,sideAnchor:sideAnchor,'
        + 'variantsToJSON:variantsToJSON,importSequenceJSON:importSequenceJSON};';
const M=new Function(src)();

let fail=0;
function chk(label,cond,extra){ if(!cond) fail++; console.log((cond?'  OK  ':'>>BAD ')+label+(extra?'   '+extra:'')); }

// --- 1. label gak dipotong ---
const long={type:'motion',sol:'SOL_ST1_STP4_UCHK',x:0,y:0};
chk('label utuh (gak ada "..")', M.nodeLabel(long)==='SOL_ST1_STP4_UCHK', M.nodeLabel(long));
// 17 char masih muat di 110px (9px Consolas ~5px/char), jadi lebarnya memang gak perlu nambah.
// Yang harus melebar itu label yang beneran lebih panjang dari kotak default.
const longer={type:'motion',sol:'SOL_ST1_RGT_DIV_BWD_EXTRA',x:0,y:0};
chk('lebar node ikut label panjang', M.nodeW(longer)>110, 'w='+M.nodeW(longer));
chk('label pendek tetap lebar minimum', M.nodeW({type:'motion',sol:'AB',x:0,y:0})===110);

// --- 2. anchor nempel ke sisi yang bener ---
const base={type:'motion',sol:'SOL_X',x:100,y:100}; // w=110, h=32 -> center (155,116)
const w=M.nodeW(base);
let a=M.sideAnchor(base,500,116);  chk('lawan di KANAN -> sisi kanan', a.x===100+w&&a.y===116, JSON.stringify(a));
a=M.sideAnchor(base,-300,116);     chk('lawan di KIRI  -> sisi kiri',  a.x===100&&a.y===116, JSON.stringify(a));
a=M.sideAnchor(base,155,600);      chk('lawan di BAWAH -> sisi bawah', a.y===100+32&&a.x===155, JSON.stringify(a));
a=M.sideAnchor(base,155,-400);     chk('lawan di ATAS  -> sisi atas',  a.y===100&&a.x===155, JSON.stringify(a));

// --- 3. round-trip posisi: export -> import harus identik ---
const asli=[{condition:'',comment:'',nodes:[
  // LB300 harus DIRUJUK sama `after`, karena node condition emang cuma dibangun ulang dari rujukan itu
  {id:'n1',type:'motion',sol:'SOL_ST1_STP4_CHK',after:['LB300'],join:'AND',x:37,y:211},
  {id:'n2',type:'motion',sol:'SOL_ST1_STP5_CHK',after:['n1'],join:'AND',x:402,y:88},
  {id:'LB300',type:'condition',bit:'LB300',comment:'syarat',x:255,y:333}
]}];
M.setState({ST1:asli});
const json=M.variantsToJSON('ST1');
chk('export bawa x/y node motion', /"x": 37/.test(json)&&/"y": 211/.test(json));
chk('export bawa conditionPositions', /"conditionPositions"/.test(json)&&/"y": 333/.test(json));

const err=M.importSequenceJSON('ST2',json);
chk('import tanpa error', err===null, String(err));
const back=M.motionState().ST2[0].nodes;
const pos=o=>o.map(n=>n.id+'@'+n.x+','+n.y).sort().join(' | ');
chk('posisi identik setelah import', pos(back)===pos(asli[0].nodes), '\n     sebelum: '+pos(asli[0].nodes)+'\n     sesudah: '+pos(back));

// --- 3b. node condition YATIM (belum disambung ke node manapun) ikut selamat ---
// Node condition tidak disimpan di array `nodes`, melainkan dibangun ulang dari rujukan `after`.
// Yang belum dirujuk siapa pun karena itu tidak punya jejak sama sekali - dan yang hilang bukan
// cuma kotaknya: komentarnya ikut, padahal komentar itu justru alasan kotaknya ditaruh duluan.
const yatim=[{condition:'',comment:'',nodes:[
  {id:'n1',type:'motion',sol:'SOL_ST1_STP4_CHK',after:['LB300'],join:'AND',x:10,y:20},
  {id:'LB300',type:'condition',bit:'LB300',comment:'dirujuk n1',x:100,y:200},
  {id:'LB399',type:'condition',bit:'LB399',comment:'belum disambung',x:300,y:400}
]}];
M.setState({STY:yatim});
const yj=M.variantsToJSON('STY');
chk('export menyebut bit yatim', /LB399/.test(yj), /LB399/.test(yj)?'':'tidak ada LB399 di JSON');
const yerr=M.importSequenceJSON('STZ',yj);
chk('import varian bernode yatim tanpa error', yerr===null, String(yerr));
const yback=M.motionState().STZ[0].nodes;
const yatimBack=yback.filter(n=>n.id==='LB399')[0];
chk('node condition yatim tidak hilang setelah round-trip', !!yatimBack,
    yback.map(n=>n.id).join(' '));
chk('komentar node yatim ikut selamat', yatimBack&&yatimBack.comment==='belum disambung',
    yatimBack?JSON.stringify(yatimBack.comment):'-');
chk('posisi node yatim ikut selamat', yatimBack&&yatimBack.x===300&&yatimBack.y===400,
    yatimBack?yatimBack.x+','+yatimBack.y:'-');
// Yang dirujuk `after` tetap dibangun seperti dulu - perbaikannya tidak boleh bikin node dobel.
chk('bit yang dirujuk tidak jadi dua node',
    yback.filter(n=>n.id==='LB300').length===1, yback.map(n=>n.id).join(' '));

// --- 4. JSON lama tanpa x/y tetap jalan (auto-layout) ---
const lawas='[{"condition":"","nodes":[{"id":"n1","sol":"SOL_A","after":[],"join":"AND"},{"id":"n2","sol":"SOL_B","after":["n1"],"join":"AND"}]}]';
const err2=M.importSequenceJSON('ST3',lawas);
chk('import JSON tanpa x/y tetap sukses', err2===null, String(err2));
const st3=M.motionState().ST3[0].nodes;
chk('auto-layout kasih posisi (bukan 0,0 numpuk)', st3[0].y>0&&!(st3[0].x===st3[1].x&&st3[0].y===st3[1].y),
    st3.map(n=>n.id+'@'+n.x+','+n.y).join(' '));

// --- 5. dropdown condition ---
M.setCond({ST1:[
  {name:'Take Out Lowering',bit:'LB300',groups:[[]]},
  {name:'',bit:'LB301',groups:[[]]},
  {name:'Belum diisi bit',bit:'',groups:[[]]},   // bit kosong -> jangan masuk dropdown
  {name:'Duplikat',bit:'LB300',groups:[[]]}      // bit sama -> jangan dobel
]});
let opts=M.conditionBitOptions('ST1','');
// Bit kosong di baris ke-3 TIDAK di-skip: generator ngasih LB302 buat baris itu, jadi dropdown harus
// nampilin bit yang sama. Yang duplikat tetap dibuang.
chk('bit kosong dapat nama auto, duplikat dibuang', opts.length===3, JSON.stringify(opts.map(o=>o.value)));
// Kalau baris itu punya nama, label pakai namanya (lebih informatif). Penanda "auto" cuma muncul
// kalau nama DAN bit sama-sama kosong - kalau nggak, gak ada yang bisa dipakai buat ngenalin barisnya.
chk('label pakai nama condition-nya', /Belum diisi bit/.test(opts[2].label), opts[2].label);
M.setCond({STZ:[{name:'',bit:'',groups:[[]]}]});
chk('tanpa nama DAN tanpa bit -> ditandai auto', /auto/.test(M.conditionBitOptions('STZ','')[0].label),
    M.conditionBitOptions('STZ','')[0].label);
chk('label bawa nama condition', opts[0].label==='LB300 - Take Out Lowering', opts[0].label);
chk('tanpa nama -> label bit doang', opts[1].label==='LB301', opts[1].label);

opts=M.conditionBitOptions('ST1','LB999');
chk('nilai kepasang di luar daftar tetap jadi opsi',
    opts.some(o=>o.value==='LB999'&&/di luar daftar/.test(o.label)), JSON.stringify(opts.map(o=>o.label)));
opts=M.conditionBitOptions('ST1','LB300');
chk('nilai kepasang yg ADA di daftar gak digandain',
    opts.filter(o=>o.value==='LB300').length===1, JSON.stringify(opts.map(o=>o.value)));
// Station tanpa Condition custom TETAP dapat LB300-LB302 dari generator, jadi dropdown-nya gak boleh
// kosong - itu bug yang bikin LB300 ketulis "(di luar daftar)" padahal bit-nya jelas dibikin.
const spare=M.conditionBitOptions('ST9','');
chk('station tanpa condition tetap dapat 3 slot cadangan',
    spare.length===3 && spare.map(o=>o.value).join(',')==='LB300,LB301,LB302',
    JSON.stringify(spare.map(o=>o.value)));
chk('LB300 TIDAK ditandai "di luar daftar" lagi',
    !/di luar daftar/.test(JSON.stringify(M.conditionBitOptions('ST9','LB300'))),
    JSON.stringify(M.conditionBitOptions('ST9','LB300').map(o=>o.label)));

// --- 6. round-trip blok flowchart baru (decision / setmem / alarm) ---
const blk=[{condition:'',comment:'',nodes:[
  {id:'n1',type:'motion',  sol:'SOL_A',after:[],join:'AND',x:10,y:20},
  {id:'d1',type:'decision',cond:'PH_X',comment:'JUDGEMENT OK',after:['n1'],join:'AND',x:30,y:40},
  {id:'s1',type:'setmem',  bit:'LB800',comment:'OK',after:['d1#Y'],join:'AND',x:50,y:60},
  {id:'a1',type:'alarm',   category:'warning',comment:'NG',after:['d1#N'],join:'AND',x:70,y:80}
]}];
M.setState({STB:blk});
const bj=M.variantsToJSON('STB');
chk('export bawa 4 blok (bukan cuma motion)', JSON.parse(bj)[0].nodes.length===4, JSON.parse(bj)[0].nodes.length+' node');
chk('export simpan type+cond+bit+category',
    /"type": "decision"/.test(bj)&&/"cond": "PH_X"/.test(bj)&&/"bit": "LB800"/.test(bj)&&/"category": "warning"/.test(bj));
const be=M.importSequenceJSON('STC',bj);
chk('import blok baru tanpa error', be===null, String(be));
const bn=M.motionState().STC[0].nodes;
chk('semua tipe kebawa balik', bn.map(n=>n.type).join(',')==='motion,decision,setmem,alarm', bn.map(n=>n.type).join(','));
chk('rujukan cabang #Y/#N utuh', bn[2].after[0]==='d1#Y'&&bn[3].after[0]==='d1#N', bn[2].after+' / '+bn[3].after);
chk('gak ada node hantu "d1#Y"', bn.length===4, bn.map(n=>n.id).join(','));
chk('posisi blok baru ikut kejaga', bn[1].x===30&&bn[1].y===40, bn[1].x+','+bn[1].y);
chk('label decision bawa komen', M.nodeLabel(bn[1])==='? PH_X - JUDGEMENT OK', M.nodeLabel(bn[1]));
chk('label setmem bawa komen', M.nodeLabel(bn[2])==='SET LB800 - OK', M.nodeLabel(bn[2]));
chk('label alarm bawa kategori + komen', M.nodeLabel(bn[3])==='ALARM Warning - NG', M.nodeLabel(bn[3]));
chk('tanpa komen labelnya tetap bersih (gak ada " - " nyangkut)',
    M.nodeLabel({type:'alarm',category:'faultstop'})==='ALARM Fault stop' &&
    M.nodeLabel({type:'decision',cond:'LB9'})==='? LB9',
    M.nodeLabel({type:'alarm',category:'faultstop'}));
chk('node melebar ngikutin label berkomen', M.nodeW(bn[3])>M.nodeW({type:'alarm',category:'warning'}),
    M.nodeW(bn[3])+' vs '+M.nodeW({type:'alarm',category:'warning'}));
chk('type gak dikenal ditolak',
    /type/.test(String(M.importSequenceJSON('STD','[{"nodes":[{"id":"x","type":"ngawur"}]}]'))));

// --- 7. START/END: node yang nunggu cabang if-else JANGAN dikira root ---
// Persis grafik di layar: srv (root) -> d1 judgement -> Y: cr, N: alarm
const scr=[
  {id:'srv',type:'motion',  sol:'SRV_ST2_SRV_LFT_POS2',after:[],       join:'AND',x:0,y:0},
  {id:'d1', type:'decision',cond:'Lb231',              after:['srv'],  join:'AND',x:0,y:0},
  {id:'cr', type:'motion',  sol:'CR_ST2_STP1_UP_POS',  after:['d1#Y'], join:'AND',x:0,y:0},
  {id:'al', type:'alarm',   category:'faultstop',      after:['d1#N'], join:'AND',x:0,y:0}
];
const e=M.graphEnds(scr);
chk('START cuma ke 1 root (srv), bukan 3', e.roots.length===1, 'roots='+e.roots.map(n=>n.id).join(','));
chk('node yang nunggu cabang Y BUKAN root', !e.roots.some(n=>n.id==='cr'), e.roots.map(n=>n.id).join(','));
chk('blok alarm juga bukan root', !e.roots.some(n=>n.id==='al'));
chk('decision kehitung sudah dirujuk (bukan leaf)', !e.leaves.some(n=>n.id==='d1'), 'leaves='+e.leaves.map(n=>n.id).join(','));
chk('END dari cr dan al (dua ujung)', e.leaves.map(n=>n.id).sort().join(',')==='al,cr', e.leaves.map(n=>n.id).join(','));
// sequence boleh dimulai dari judgement
const e2=M.graphEnds([{id:'d0',type:'decision',cond:'X',after:[],join:'AND',x:0,y:0}]);
chk('varian yang mulai dari judgement tetap dapat START', e2.roots.length===1&&e2.roots[0].id==='d0');
// node "condition" bukan langkah, jangan ikut START/END
const e3=M.graphEnds([{id:'LB300',type:'condition',bit:'LB300',after:[],x:0,y:0},
                      {id:'m1',type:'motion',sol:'S',after:['LB300'],join:'AND',x:0,y:0}]);
chk('node condition gak ikut jadi root/leaf',
    !e3.roots.some(n=>n.id==='LB300') && !e3.leaves.some(n=>n.id==='LB300'),
    'roots='+e3.roots.map(n=>n.id)+' leaves='+e3.leaves.map(n=>n.id));

// --- 8. posisi START/END manual ikut round-trip, dan hanya kalau memang digeser ---
M.setState({STE:[{condition:'',comment:'',nodes:[{id:'n1',type:'motion',sol:'S',after:[],join:'AND',x:5,y:5}]}]});
chk('belum digeser -> JSON gak nulis startPos/endPos',
    !/startPos|endPos/.test(M.variantsToJSON('STE')));
M.motionState().STE[0].startPos={x:222,y:33};
M.motionState().STE[0].endPos={x:444,y:555};
const ej=M.variantsToJSON('STE');
chk('setelah digeser -> ikut diekspor', /"startPos"/.test(ej)&&/"y": 555/.test(ej));
M.importSequenceJSON('STF',ej);
const vf=M.motionState().STF[0];
chk('posisi START/END identik setelah import',
    vf.startPos.x===222&&vf.startPos.y===33&&vf.endPos.x===444&&vf.endPos.y===555,
    JSON.stringify([vf.startPos,vf.endPos]));
M.importSequenceJSON('STG','[{"nodes":[{"id":"a","sol":"S"}],"startPos":{"x":"ngawur"}}]');
chk('startPos ngaco diabaikan (balik ke otomatis), bukan dipaksa 0,0',
    M.motionState().STG[0].startPos===undefined, JSON.stringify(M.motionState().STG[0].startPos));

// --- 9. edit blok setelah dibuat, tanpa mutusin panah yang nyambung ---
M.setState({STH:[{condition:'',comment:'',nodes:[
  {id:'d1',type:'decision',cond:'LB1', comment:'lama', after:[],      join:'AND',x:0,y:0},
  {id:'a1',type:'alarm', category:'warning',comment:'',after:['d1#Y'],join:'AND',x:0,y:0}
]}]});
M.setNodeField('STH',0,'d1','cond','  LB999  ');
M.setNodeField('STH',0,'d1','comment','JUDGEMENT baru');
M.setNodeField('STH',0,'a1','category','emergency');
const eh=JSON.parse(M.variantsToJSON('STH'))[0].nodes;
chk('cond kebetulin + spasi ke-trim', eh[0].cond==='LB999', JSON.stringify(eh[0].cond));
chk('komen kebetulin', eh[0].comment==='JUDGEMENT baru', eh[0].comment);
chk('kategori alarm kebetulin', eh[1].category==='emergency', eh[1].category);
chk('panah ke cabang TETAP nyambung setelah diedit', eh[1].after[0]==='d1#Y', eh[1].after.join(','));
chk('label ikut berubah', M.nodeLabel(M.motionState().STH[0].nodes[0])==='? LB999 - JUDGEMENT baru',
    M.nodeLabel(M.motionState().STH[0].nodes[0]));

// --- 10. label kanvas pakai komen IO, bukan nama simbol ---
M.setKomen({ 'SRV_ST2_SRV_CTR_POS1':'ST2 SERVO CENTER POS1',
             'CR_ST2_STP1_UP_POS':'ST2  STOPPER-1 UP pos',
             'SOL_X':'' });
chk('label pakai komen IO', M.deviceLabel('SRV_ST2_SRV_CTR_POS1')==='SERVO CENTER POS1',
    M.deviceLabel('SRV_ST2_SRV_CTR_POS1'));
chk('prefix ST<n> dibuang (kotaknya sudah per station)',
    M.deviceLabel('CR_ST2_STP1_UP_POS')==='STOPPER-1 UP pos', M.deviceLabel('CR_ST2_STP1_UP_POS'));
chk('spasi dobel dirapikan', M.deviceLabel('CR_ST2_STP1_UP_POS').indexOf('  ')<0);
chk('komen kosong -> balik ke nama simbol', M.deviceLabel('SOL_X')==='SOL_X');
chk('simbol gak dikenal -> apa adanya', M.deviceLabel('SOL_BELUM_ADA')==='SOL_BELUM_ADA');
chk('nodeLabel motion ikut pakai komen',
    M.nodeLabel({type:'motion',sol:'SRV_ST2_SRV_CTR_POS1'})==='SERVO CENTER POS1',
    M.nodeLabel({type:'motion',sol:'SRV_ST2_SRV_CTR_POS1'}));
// serialisasi HARUS tetap simbol - kalau ikut jadi komen, JSON-nya gak bisa dibaca generator lagi
M.setState({STL:[{condition:'',comment:'',nodes:[
  {id:'n1',type:'motion',sol:'SRV_ST2_SRV_CTR_POS1',after:[],join:'AND',x:0,y:0}]}]});
chk('JSON tetap nyimpen nama SIMBOL, bukan komen',
    /"sol": "SRV_ST2_SRV_CTR_POS1"/.test(M.variantsToJSON('STL')),
    (M.variantsToJSON('STL').match(/"sol":[^,]*/)||[''])[0]);

console.log('\n'+(fail?fail+' GAGAL':'SEMUA LULUS'));
process.exit(fail?1:0);
