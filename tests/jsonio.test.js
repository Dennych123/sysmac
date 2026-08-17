// Uji buildJsonIORow dengan DOM tiruan minimal: tombol apa saja yang dibuat, dan tiap tombol
// benar-benar manggil getText/doImport yang mana.
const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function extract(name){
    const i=html.indexOf('function '+name+'(');
    if(i<0) throw new Error('gak ketemu: '+name);
    let d=0,started=false;
    for(let j=html.indexOf('{',i);j<html.length;j++){
        if(html[j]==='{'){d++;started=true;}
        else if(html[j]==='}'){d--;if(started&&d===0)return html.slice(i,j+1);}
    }
    throw new Error('brace gak nutup: '+name);
}

// --- DOM tiruan ---
function El(tag){
    return { tag, className:'', textContent:'', value:'', style:{}, children:[], _h:{},
        appendChild(c){ this.children.push(c); return c; },
        removeChild(c){ const i=this.children.indexOf(c); if(i>=0)this.children.splice(i,1); return c; },
        addEventListener(ev,fn){ (this._h[ev]=this._h[ev]||[]).push(fn); },
        click(){ (this._h['click']||[]).forEach(f=>f()); },
        focus(){}, select(){} };
}
const created=[];
global.document={ createElement:t=>{const e=El(t);created.push(e);return e;}, body:El('body'),
                  execCommand:()=>true };
global.navigator={};                       // clipboard API absen -> paksa jalur fallback
global.Blob=function(){}; global.URL={createObjectURL:()=>'blob:x',revokeObjectURL(){}};
global.FileReader=function(){};

const M=new Function(extract('copyTextToClipboard')+extract('readTextFromClipboard')
    +extract('pickTextFile')+extract('downloadFile')+extract('buildJsonIORow')
    +'\nreturn {buildJsonIORow:buildJsonIORow,copyTextToClipboard:copyTextToClipboard,'
    +'readTextFromClipboard:readTextFromClipboard};')();

let fail=0;
const chk=(l,c,x)=>{ if(!c)fail++; console.log((c?'  OK  ':'>>BAD ')+l+(x?'   '+x:'')); };

const ta=El('textarea'), msg=El('div');
let exported=0, importedWith=null, importErr=null;
const row=M.buildJsonIORow(ta,msg,
    ()=>{ exported++; return '{"hasil":"export"}'; },
    (t)=>{ importedWith=t; return importErr; },
    'test.json');

const labels=row.children.filter(c=>c.tag==='button').map(c=>c.textContent);
chk('5 tombol kebentuk', labels.length===5, JSON.stringify(labels));
// Label tombol ditulis langsung di sumber (lapisan terjemahan sudah dibuang), jadi tesnya
// mencocokkan teks apa adanya.
const LBL={'prj.copy':'Copy','prj.download':'Save file','prj.importFile':'Open file',
           'prj.importClip':'Paste','prj.import':'Load from box','prj.loaded':'Loaded from'};
const L=k=>LBL[k];
chk('ada Copy', labels.includes(L('prj.copy')), labels.join(' | '));
chk('ada Download', labels.includes(L('prj.download')));
chk('ada Open file', labels.includes(L('prj.importFile')));
chk('ada Paste', labels.includes(L('prj.importClip')));
chk('ada Load from box', labels.includes(L('prj.import')));
chk('ada pemisah visual', row.children.some(c=>c.className==='row-sep'));

const byLabel=l=>row.children.filter(c=>c.textContent===l)[0];

// Copy -> panggil getText, isi textarea, pakai fallback execCommand (navigator.clipboard absen)
byLabel(L('prj.copy')).click();
chk('Copy manggil getText', exported===1, 'exported='+exported);
chk('Copy naruh JSON ke textarea', ta.value==='{"hasil":"export"}', ta.value);

// Download -> panggil getText juga
byLabel(L('prj.download')).click();
chk('Download manggil getText', exported===2, 'exported='+exported);

// Import (kotak) sukses
ta.value='{"mau":"diimport"}';
byLabel(L('prj.import')).click();
chk('Import kirim isi textarea ke doImport', importedWith==='{"mau":"diimport"}', String(importedWith));
chk('pesan sukses', msg.textContent.indexOf(L('prj.loaded'))===0&&/ok/.test(msg.className), msg.textContent);

// Import (kotak) gagal -> pesan error dari doImport
importErr='JSON gak valid: boom';
byLabel(L('prj.import')).click();
chk('error diteruskan apa adanya', msg.textContent==='JSON gak valid: boom'&&/err/.test(msg.className), msg.textContent);

// clipboard read ditolak kalau API-nya gak ada
M.readTextFromClipboard().then(()=>chk('readText harusnya ditolak',false))
 .catch(e=>{
    chk('readText ditolak rapi saat API absen', /gak ngizinin/.test(e.message), e.message);
    console.log('\n'+(fail?fail+' GAGAL':'SEMUA LULUS'));
    process.exit(fail?1:0);
 });
