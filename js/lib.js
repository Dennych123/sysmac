// ===== SG LIB : Susmax IEC61131-10 XML builder (shared, jangan diedit per-node) =====
// Non-ASCII (di luar &<>) ditulis sebagai entitas numerik &#xNNNN;, BUKAN dibuang.
// Dulu dibuang - aman selama input cuma yang diketik user di editor, tapi sejak
// reader/ menyuntikkan fungsi ini buat menulis komentar rung/variabel dari
// project SUNGGUHAN (reader/xml_out.js), komentar bermuatan '\u00b15mm', '80\u00b0C', atau
// kutip pintar bekas tempel dari Word hilang diam-diam - tanpa error, tanpa tanda
// di laporan. Entitas numerik tetap XML 1.0 yang sah apa pun deklarasi encoding-nya,
// jadi tidak ada informasi yang hilang.
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\u2013\u2014]/g,'-').replace(/\u2192/g,'->').replace(/[^\x00-\x7F]/g,function(c){return '&#x'+c.codePointAt(0).toString(16).toUpperCase()+';';});}
function Rung(o,c){this.o=o;this.c=c;this.a=[];this.n=1;}
Rung.prototype.rail=function(){var i=this.n++;this.a.push('<LdObject xsi:type="LeftPowerRail"><ConnectionPointOut connectionPointOutId="'+i+'" /></LdObject>');return i;};
Rung.prototype.ct=function(op,ref,neg,edge){var i=this.n++;this.a.push('<LdObject xsi:type="Contact"'+(neg?' negated="true"':'')+(edge?' edge="'+edge+'"':'')+' operand="'+op+'"><ConnectionPointIn><Connection refConnectionPointOutId="'+ref+'" /></ConnectionPointIn><ConnectionPointOut connectionPointOutId="'+i+'" /></LdObject>');return i;};
Rung.prototype.ctm=function(op,refs,neg){var i=this.n++;var r=refs.map(function(x){return '<Connection refConnectionPointOutId="'+x+'" />';}).join('');this.a.push('<LdObject xsi:type="Contact"'+(neg?' negated="true"':'')+' operand="'+op+'"><ConnectionPointIn>'+r+'</ConnectionPointIn><ConnectionPointOut connectionPointOutId="'+i+'" /></LdObject>');return i;};
Rung.prototype.cl=function(op,ref,neg,edge){var i=this.n++;this.a.push('<LdObject xsi:type="Coil"'+(neg?' negated="true"':'')+(edge?' edge="'+edge+'"':'')+' operand="'+op+'"><ConnectionPointIn><Connection refConnectionPointOutId="'+ref+'" /></ConnectionPointIn><ConnectionPointOut connectionPointOutId="'+i+'" /></LdObject>');return i;};
Rung.prototype.clm=function(op,refs,neg){var i=this.n++;var r=refs.map(function(x){return '<Connection refConnectionPointOutId="'+x+'" />';}).join('');this.a.push('<LdObject xsi:type="Coil"'+(neg?' negated="true"':'')+' operand="'+op+'"><ConnectionPointIn>'+r+'</ConnectionPointIn><ConnectionPointOut connectionPointOutId="'+i+'" /></LdObject>');return i;};
// ===== Function block / instruksi umum =====
// Bentuknya DITURUNKAN dari ton() di bawah - blok fungsi pertama yang terbukti ter-import
// Susmax Studio. Yang dipakai ulang: pembungkus AddData buat urutan pin, DataSource buat
// nilai masuk, dan ConnectionPointOut buat nilai keluar.
//
// SUDAH TERBUKTI ter-import: MOVE, bentuk EN,In -> ENO,Out (lewat _Probe_Instructions.xml).
//
// Daftar pin tiap instruksi ada di docs/SYSMAC_INSTRUCTIONS.md; yang WAJIB diingat waktu
// memanggil blk() - dan yang bikin percobaan pertama ditolak semua:
//   * FB butuh instanceName, FUN tidak boleh punya.
//   * Pembanding (=, <, <=, <>, >=) dan Get**Clk TIDAK punya ENO. Minta "ENO" = ditolak.
//     Pin hasilnya tidak bernama, jadi namanya ditulis "" (string kosong).
//   * Pin In-out (Inc, Dec, Clear) muncul di daftar masuk DAN daftar keluar sekaligus,
//     operandnya sama.
// Bentuk-bentuk itu dibaca dari project nyata (`reader/cli.js x.smc2 --probe-fb`), tapi
// PEMETAANNYA ke XML import masih diuji - lihat buildProbe() di js/gen_all.js.
Rung.prototype.ad=function(tag,ord){return '<AddData><Data name="https://www.ia.omron.com/Smc IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd" handleUnknown="discard"><smcext:'+tag+' order="'+ord+'" /></Data></AddData>';};
// Nilai masuk: konstanta ("16#0", "K100") atau nama variabel
Rung.prototype.src=function(v){var i=this.n++;this.a.push('<FbdObject xsi:type="DataSource" identifier="'+esc(String(v))+'"><ConnectionPointOut connectionPointOutId="'+i+'" /></FbdObject>');return i;};
// Nilai keluar ditulis ke variabel
Rung.prototype.sink=function(v,ref){var i=this.n++;this.a.push('<FbdObject xsi:type="DataSink" identifier="'+esc(String(v))+'"><ConnectionPointIn><Connection refConnectionPointOutId="'+ref+'" /></ConnectionPointIn></FbdObject>');return i;};
// blk("MOVE", null, [["EN",enId],["In",srcId]], ["ENO","Out"]) -> { ENO:id, Out:id }
//
// Nama pin "" (kosong) itu SAH: pembanding dan Get**Clk memang punya pin hasil tanpa nama.
// Hasilnya diambil dari outIds[""].
//
// inouts (opsional) = [["InOut", refId]] -> <InOutVariables>. BELUM TERBUKTI; dipakai probe
// saja. Alternatifnya yang juga diuji: pin yang sama ditaruh di ins DAN outs sekaligus,
// yang itu bentuk yang dipakai model internal Studio.
Rung.prototype.blk=function(typeName,instanceName,ins,outs,inouts){
  var self=this, outIds={};
  var xin=ins.map(function(p,k){
    return '<InputVariable parameterName="'+esc(p[0])+'"><ConnectionPointIn>'+self.ad('ConnectionPointInOrder',k+1)
         + '<Connection refConnectionPointOutId="'+p[1]+'" /></ConnectionPointIn></InputVariable>';
  }).join('');
  var xout=outs.map(function(nm,k){
    var id=self.n++; outIds[nm]=id;
    return '<OutputVariable parameterName="'+esc(nm)+'"><ConnectionPointOut connectionPointOutId="'+id+'">'
         + self.ad('ConnectionPointOutOrder',k+1)+'</ConnectionPointOut></OutputVariable>';
  }).join('');
  var xio=(inouts||[]).map(function(p,k){
    var id=self.n++; outIds[p[0]]=id;
    return '<InOutVariable parameterName="'+esc(p[0])+'">'
         + '<ConnectionPointIn>'+self.ad('ConnectionPointInOrder',ins.length+k+1)
         + '<Connection refConnectionPointOutId="'+p[1]+'" /></ConnectionPointIn>'
         + '<ConnectionPointOut connectionPointOutId="'+id+'">'
         + self.ad('ConnectionPointOutOrder',outs.length+k+1)+'</ConnectionPointOut></InOutVariable>';
  }).join('');
  this.a.push('<FbdObject xsi:type="Block" typeName="'+esc(typeName)+'"'
   +(instanceName?' instanceName="'+instanceName+'"':'')+'>'
   +'<InputVariables>'+xin+'</InputVariables>'
   +'<OutputVariables>'+xout+'</OutputVariables>'
   +(xio?'<InOutVariables>'+xio+'</InOutVariables>':'')+'</FbdObject>');
  return outIds;
};
Rung.prototype.rr=function(refs){this.a.push('<LdObject xsi:type="RightPowerRail">'+refs.map(function(x){return '<ConnectionPointIn><Connection refConnectionPointOutId="'+x+'" /></ConnectionPointIn>';}).join('')+'</LdObject>');};
Rung.prototype.build=function(){var c=this.c?'<CommonObject xsi:type="Comment"><Content xsi:type="SimpleText">'+esc(this.c)+'</Content></CommonObject>':'';return '<Rung evaluationOrder="'+this.o+'">'+c+this.a.join('')+'</Rung>';};

// conds = [[operand, negated], ...]  -> AND series -> 1 coil
function series(o,conds,out,cmt,outNeg,edge){var r=new Rung(o,cmt);var cur=r.rail();conds.forEach(function(c){cur=r.ct(c[0],cur,c[1]);});var x=r.cl(out,cur,outNeg,edge);r.rr([x]);return r.build();}
// bits = [operand, ...]  -> OR (parallel dari rail) -> 1 coil, kebalikan AND-nya series()
function orMany(o,bits,out,cmt){var r=new Rung(o,cmt);var rail=r.rail();var ids=bits.map(function(b){return r.ct(b,rail);});var x=r.clm(out,ids);r.rr([x]);return r.build();}
// self-latch: (OR trigs OR bit) AND blocks -> bit
function latch(o,trigs,bit,blocks,cmt){var r=new Rung(o,cmt);var rail=r.rail();var ids=trigs.map(function(t){return r.ct(t[0],rail,t[1]);});ids.push(r.ct(bit,rail));blocks=blocks||[];if(!blocks.length){var x=r.clm(bit,ids);r.rr([x]);return r.build();}var cur=r.ctm(blocks[0][0],ids,blocks[0][1]);for(var i=1;i<blocks.length;i++)cur=r.ct(blocks[i][0],cur,blocks[i][1]);var y=r.cl(bit,cur);r.rr([y]);return r.build();}
// mutual-exclusion group: SATU rung, satu kontak gate dipakai bareng (mis. LB400), tiap branches[i]
// = {trigs:[[op,neg],...], bit:coilBit, blocks:[[op,neg],...]} jadi cabang paralel dari gate ->
// (OR trigs OR seal-diri sendiri) -> AND blocks (interlock ANDNOT branch lain) -> coil sendiri.
// Semua coil nyambung ke SATU RightPowerRail (banyak ConnectionPointIn) - persis network Ndeso
// "Autorun Condition Running" (LB400 di kiri, N baris kondisi mutual exclusion, N coil sejajar).
function mutexGroup(o,gate,branches,cmt){
    var r=new Rung(o,cmt); var rail=r.rail();
    var start=gate?r.ct(gate[0],rail,gate[1]):rail;
    var coilRefs=branches.map(function(br){
        var ids=(br.trigs||[]).map(function(t){return r.ct(t[0],start,t[1]);});
        ids.push(r.ct(br.bit,start));
        var blocks=br.blocks||[];
        if(!blocks.length) return r.clm(br.bit,ids);
        var cur=r.ctm(blocks[0][0],ids,blocks[0][1]);
        for(var i=1;i<blocks.length;i++) cur=r.ct(blocks[i][0],cur,blocks[i][1]);
        return r.cl(br.bit,cur);
    });
    r.rr(coilRefs);
    return r.build();
}
// groups = [[[operand,negated],...], ...] -> tiap group AND-series jadi 1 cabang, semua cabang OR -> 1 coil
// (Condition section: satu bit boleh dinyalain lewat beberapa kombinasi syarat berbeda)
function orOfAnds(o,groups,out,cmt){var r=new Rung(o,cmt);var rail=r.rail();var ends=groups.map(function(g){var cur=rail;g.forEach(function(c){cur=r.ct(c[0],cur,c[1]);});return cur;});var x=ends.length>1?r.clm(out,ends):r.cl(out,ends[0]);r.rr([x]);return r.build();}
// dual-aux confirm Ndeso (3 rung)
function dualAux(o,sa,aa,sb,ab,out,cmt){return series(o,[[sa,false]],aa,cmt)+series(o+1,[[sb,false]],ab)+series(o+2,[[aa,false],[ab,false]],out);}
// LS Combination 2 posisi (2 rung)
function ls2(o,af,ab,lf,lb,cmt){return series(o,[[af,false],[ab,true]],lf,cmt)+series(o+1,[[ab,false],[af,true]],lb);}
// AutoOutput merge: LD auto OR ind OUT sol
function merge2(o,a,b,out,cmt){var r=new Rung(o,cmt);var rail=r.rail();var ids=[r.ct(a,rail)];if(b)ids.push(r.ct(b,rail));var x=(ids.length>1)?r.clm(out,ids):r.cl(out,ids[0]);r.rr([x]);return r.build();}
// AND banyak kontak NOT -> 1 coil, dipecah max 6 per rung (anti rung kepanjangan)
function chunkNot(o,list,outBit,auxPrefix,cmt,vsink){var m='',bits=[],ch=[],i;for(i=0;i<list.length;i+=6)ch.push(list.slice(i,i+6));if(ch.length===1){return {xml:series(o,ch[0].map(function(x){return [x,true];}),outBit,cmt),n:1};}
ch.forEach(function(c,idx){var b=auxPrefix+'_'+(idx+1);bits.push(b);if(vsink)vsink.push(b);m+=series(o+idx,c.map(function(x){return [x,true];}),b,idx===0?cmt:null);});
m+=series(o+ch.length,bits.map(function(b){return [b,false];}),outBit);return {xml:m,n:ch.length+1};}
// Motion step Ndeso (AutoRunning): TR0=prevBit. cmd = TR0 ANDNOT confirm (bukan ANDNOT lsc - cmd
// harus tetap ON sampai confirm sendiri jadi TRUE, biar solenoid gak drop pas posisi baru kesentuh
// dikit; ini persis idiom project asli Autorun.cxr sekali step-mode overlay-nya dibuang).
// confirm = TR0 AND (sol AND lsc OR confirm). Confirm self-latch WAJIB refIn ke TR0, bukan
// LeftPowerRail - PATTERN 4, salah ini bikin ladder salah tanpa error import.
function motionStep(o,prevBit,sol,lsc,cmdBit,confirmBit,cmt){
  var r=new Rung(o,cmt); var rail=r.rail();
  var tr0=r.ct(prevBit,rail);
  var cmdCoil=r.cl(cmdBit,r.ct(confirmBit,tr0,true));
  var solLsc=r.ct(lsc,r.ct(sol,tr0));
  var confAux=r.ct(confirmBit,tr0);
  var confCoil=r.clm(confirmBit,[solLsc,confAux]);
  r.rr([cmdCoil,confCoil]);
  return r.build();
}
// Satu cabang blok judgement (IF-ELSE), sepasang dipakai bareng buat Y dan N:
//   prevBit AND (kondisi OR cabang-ini) ANDNOT cabang-lawan -> cabang-ini
// Tiga sifat yang bikin ini beda dari series() biasa:
//   HOLD  - begitu keputusan diambil, cabangnya nyangkut lewat seal. Tanpa ini, kondisi yang kedip
//           (sensor mantul, benda bergetar) bikin cabang lepas di tengah jalan dan langkah sesudahnya
//           ikut mati.
//   MUTEX - ANDNOT cabang lawan, jadi Y dan N MUSTAHIL nyala barengan sekali salah satu ngunci.
//   RESET - seal-nya seri di belakang prevBit, jadi pas step sebelumnya drop (cycle kelar/di-stop)
//           dua-duanya lepas sendiri, gak perlu rung reset terpisah.
// Seal-nya WAJIB refIn ke titik SETELAH prevBit (tr0), bukan ke LeftPowerRail - PATTERN 4, sama
// kayak confirm di motionStep(); salah di sini bikin cabang nyangkut selamanya tanpa error import.
function judgeBranch(o,prevBit,condBit,condNeg,bit,otherBit,cmt){
  var r=new Rung(o,cmt); var rail=r.rail();
  var tr0=r.ct(prevBit,rail);
  var trig=r.ct(condBit,tr0,condNeg);
  var seal=r.ct(bit,tr0);
  var gate=r.ctm(otherBit,[trig,seal],true);
  var coil=r.cl(bit,gate);
  r.rr([coil]);
  return r.build();
}
function vr(n,t,d){return '<Variable name="'+n+'"><Documentation xsi:type="SimpleText">'+esc(d||'')+'</Documentation><Type><TypeName>'+(t||'BOOL')+'</TypeName></Type></Variable>';}
function sect(n,o,rungs){return '<BodyContent xsi:type="smcext:LdSection" name="'+esc(n)+'" evaluationOrder="'+o+'">'+rungs.join('')+'</BodyContent>';}
function prog(name,ext,priv,sections,glob){
return '<?xml version="1.0"?>\n<Project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n         xmlns:smcext="https://www.ia.omron.com/Smc"\n         xsi:schemaLocation="https://www.ia.omron.com/Smc IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd"\n         schemaVersion="1"\n         xmlns="www.iec.ch/public/TC65SC65BWG7TF10">\n  <FileHeader companyName="PT. Ndeso Indonesia" productName="Susmax Studio" productVersion="1.30.0.0" />\n  <ContentHeader name="'+name+'" creationDateTime="2026-07-30T00:00:00">\n    <AddData><Data name="https://www.ia.omron.com/Smc IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd" handleUnknown="discard"><smcext:DeviceInfo modelName="NX1P2" version="1.40" /></Data></AddData>\n  </ContentHeader>\n  <Types><GlobalNamespace><Program name="'+name+'">\n    <ExternalVars>\n'+ext.join('\n')+'\n    </ExternalVars>\n    <Vars accessSpecifier="private">\n'+priv.join('\n')+'\n    </Vars>\n    <MainBody>\n'+sections.join('\n')+'\n    </MainBody>\n  </Program></GlobalNamespace></Types>\n  <Instances><Configuration name="CE_Feeder_Machine"><Resource name="MainResource" resourceTypeName="">\n    <GlobalVars>\n'+glob.join('\n')+'\n    </GlobalVars>\n  </Resource></Configuration></Instances>\n</Project>\n';}

// ===== TON timer rung (Block typeName=TON + instanceName, Q -> coil) =====
function ton(o,gate,preset,tmrInst,doneBit,cmt,alwaysOn){
  var r=new Rung(o,cmt); var rail=r.rail(); var inId;
  if(gate) inId=r.ct(gate[0],rail,gate[1]); else inId=r.ct(alwaysOn||'GSB000',rail);
  var ptId=r.n++; r.a.push('<FbdObject xsi:type="DataSource" identifier="'+preset+'"><ConnectionPointOut connectionPointOutId="'+ptId+'" /></FbdObject>');
  var qId=r.n++;
  var AD=function(tag,ord){return '<AddData><Data name="https://www.ia.omron.com/Smc IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd" handleUnknown="discard"><smcext:'+tag+' order="'+ord+'" /></Data></AddData>';};
  r.a.push('<FbdObject xsi:type="Block" typeName="TON" instanceName="'+tmrInst+'">'
   +'<InputVariables>'
   +'<InputVariable parameterName="In"><ConnectionPointIn>'+AD('ConnectionPointInOrder',1)+'<Connection refConnectionPointOutId="'+inId+'" /></ConnectionPointIn></InputVariable>'
   +'<InputVariable parameterName="PT"><ConnectionPointIn>'+AD('ConnectionPointInOrder',2)+'<Connection refConnectionPointOutId="'+ptId+'" /></ConnectionPointIn></InputVariable>'
   +'</InputVariables>'
   +'<OutputVariables>'
   +'<OutputVariable parameterName="Q"><ConnectionPointOut connectionPointOutId="'+qId+'">'+AD('ConnectionPointOutOrder',1)+'</ConnectionPointOut></OutputVariable>'
   +'</OutputVariables></FbdObject>');
  var coilId=r.cl(doneBit,qId);
  r.rr([coilId]);
  return r.build();
}

// alamat -> nama variable port. "0.00"->CH000_00 ; "CH000_00" dibiarkan
function portName(addr){
  var a=String(addr||'').trim();
  if(/^[A-Za-z]/.test(a)) return a.replace(/\./g,'_');
  var m=a.match(/^(\d+)\.(\d+)$/);
  if(m) return 'CH'+('000'+m[1]).slice(-3)+'_'+('00'+m[2]).slice(-2);
  return 'CH'+a.replace(/\./g,'_');
}

// ===== TON menempel di rung yang sudah ada: inId (atau [inId,...] untuk OR-merge langsung di pin In) -> TON -> coil doneBit =====
Rung.prototype.ton=function(inId,preset,inst,doneBit){
  var ptId=this.n++;
  this.a.push('<FbdObject xsi:type="DataSource" identifier="'+preset+'"><ConnectionPointOut connectionPointOutId="'+ptId+'" /></FbdObject>');
  var qId=this.n++;
  var AD=function(tag,ord){return '<AddData><Data name="https://www.ia.omron.com/Smc IEC61131_10_Ed1_0_SmcExt1_0_Spc1_0.xsd" handleUnknown="discard"><smcext:'+tag+' order="'+ord+'" /></Data></AddData>';};
  var ins=Array.isArray(inId)?inId:[inId];
  var inConns=ins.map(function(x){return '<Connection refConnectionPointOutId="'+x+'" />';}).join('');
  this.a.push('<FbdObject xsi:type="Block" typeName="TON" instanceName="'+inst+'">'
   +'<InputVariables>'
   +'<InputVariable parameterName="In"><ConnectionPointIn>'+AD('ConnectionPointInOrder',1)+inConns+'</ConnectionPointIn></InputVariable>'
   +'<InputVariable parameterName="PT"><ConnectionPointIn>'+AD('ConnectionPointInOrder',2)+'<Connection refConnectionPointOutId="'+ptId+'" /></ConnectionPointIn></InputVariable>'
   +'</InputVariables>'
   +'<OutputVariables>'
   +'<OutputVariable parameterName="Q"><ConnectionPointOut connectionPointOutId="'+qId+'">'+AD('ConnectionPointOutOrder',1)+'</ConnectionPointOut></OutputVariable>'
   +'</OutputVariables></FbdObject>');
  return this.cl(doneBit,qId);
};
