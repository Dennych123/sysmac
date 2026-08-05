// Uji logika editor IO list mode tabel (parse/serialize/validasi/station) tanpa DOM.
const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function extract(name){
    const sig='function '+name+'(';
    let from=0;
    for(;;){
        const i=html.indexOf(sig,from);
        if(i<0) throw new Error('gak ketemu: '+name);
        let d=0,started=false,body=null;
        for(let j=html.indexOf('{',i); j<html.length; j++){
            if(html[j]==='{'){d++;started=true;}
            else if(html[j]==='}'){d--;if(started&&d===0){body=html.slice(i,j+1);break;}}
        }
        if(body && body.indexOf('\\"')<0) return body;
        from=i+sig.length;
    }
}
const names=['ioParseText','ioRowsToText','ioStationOf','ioProblems'];
const M=new Function(
   "var IO_LINE_RE=new RegExp('[\\r\\n]+');var ioRows=[];"
 + names.map(extract).join('\n')
 + '\nreturn {ioParseText:ioParseText,ioRowsToText:ioRowsToText,ioStationOf:ioStationOf,'
 + 'problems:function(rows){ioRows=rows;return ioProblems();}};')();

let fail=0;
const chk=(l,c,x)=>{ if(!c)fail++; console.log((c?'  OK  ':'>>BAD ')+l+(x?'   '+x:'')); };

// --- parse & round-trip ---
const txt="CH0_00\tPB\tIN\tNOT EMERGENCY STOP\nCH1_01\tPL\tOUT\tST1 LAMP\n";
const rows=M.ioParseText(txt);
chk('parse 4 kolom', rows.length===2 && rows[0].address==='CH0_00' && rows[0].jenis==='PB'
    && rows[0].io==='IN' && rows[0].komen==='NOT EMERGENCY STOP', JSON.stringify(rows[0]));
chk('jenis & IN/OUT dinaikin ke huruf besar',
    M.ioParseText("a\tpb\tin\tx")[0].jenis==='PB' && M.ioParseText("a\tpb\tin\tx")[0].io==='IN');
chk('baris kosong dibuang', M.ioParseText("a\tPB\tIN\tx\n\n\nb\tPL\tOUT\ty").length===2);
chk('CRLF ikut kepecah (paste dari Excel Windows)',
    M.ioParseText("a\tPB\tIN\tx\r\nb\tPL\tOUT\ty").length===2);
chk('round-trip teks -> baris -> teks utuh',
    M.ioParseText(M.ioRowsToText(rows)).length===2 &&
    M.ioRowsToText(rows).split('\n')[0]===mkline(rows[0]), M.ioRowsToText(rows).split('\n')[0]);
function mkline(r){ return [r.address,r.jenis,r.io,r.komen].join('\t'); }

// --- station diturunkan dari komen, sama seperti split ---
chk('ST1 kedeteksi', M.ioStationOf('ST1 STOPPER-2 CHUCK')==='ST1');
chk('ST10 kedeteksi (bukan cuma 1 digit)', M.ioStationOf('ST10 CLAMP')==='ST10', M.ioStationOf('ST10 CLAMP'));
chk('tanpa ST -> MAIN', M.ioStationOf('NOT EMERGENCY STOP')==='MAIN');
chk('spasi setelah ST tetap kebaca', M.ioStationOf('ST 2 PUSHER')==='ST2', M.ioStationOf('ST 2 PUSHER'));

// --- validasi: harus persis yang ditolak validate.js ---
let p=M.problems([{address:'',jenis:'PB',io:'IN',komen:'x'}]);
chk('alamat kosong ditandai', !!p[0], JSON.stringify(p));
p=M.problems([{address:'a',jenis:'',io:'IN',komen:'x'}]);
chk('jenis kosong ditandai', !!p[0]);
p=M.problems([{address:'a',jenis:'PB',io:'',komen:'x'}]);
chk('IN/OUT kosong ditandai', !!p[0]);
p=M.problems([{address:'CH0_00',jenis:'PB',io:'IN',komen:'x'},
              {address:'CH0_00',jenis:'PB',io:'IN',komen:'y'}]);
chk('alamat ganda: KEDUA baris ditandai, bukan cuma yang kedua',
    !!p[0] && !!p[1], JSON.stringify(Object.keys(p)));
p=M.problems([{address:'CH0_00',jenis:'PB',io:'IN',komen:'x'},
              {address:'CH0_00',jenis:'PL',io:'OUT',komen:'y'}]);
chk('alamat sama beda arah IN/OUT itu SAH (bukan ganda)',
    Object.keys(p).length===0, JSON.stringify(p));
p=M.problems(rows);
chk('data valid -> gak ada masalah', Object.keys(p).length===0, JSON.stringify(p));

console.log('\n'+(fail?fail+' GAGAL':'SEMUA LULUS'));
process.exit(fail?1:0);
