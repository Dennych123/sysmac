var devices = msg.payload || [];
var errors = [];
devices.forEach(function(d){
    if(!d.address||!d.jenis||!d.io) errors.push("Baris "+d.row+": alamat/jenis/IN-OUT kosong");
    if(d.io && d.io!=="IN" && d.io!=="OUT") errors.push("Baris "+d.row+": kolom IN/OUT harus IN atau OUT, ketemu "+d.io);
});
var cnt = {};
devices.forEach(function(d){ if(!d.address||!d.io) return; var k=d.io+"|"+d.address; cnt[k]=(cnt[k]||0)+1; });
Object.keys(cnt).forEach(function(k){ if(cnt[k]>1){ var p=k.split("|"); errors.push("Address "+p[1]+" ("+p[0]+") dipakai lebih dari 1 kali"); } });
if(errors.length){ msg.payload = errors.join("\n"); return [null,msg]; }
return [msg,null];
