// Input: TSV 4 kolom -> Alamat | Jenis | IN/OUT | Komen
var raw = msg.payload || "";
var rows = raw.trim().split('\n').filter(function(r){return r.trim() !== "";});
msg.payload = rows.map(function(r, i){
    var c = r.split('\t');
    return { row:i+1, address:(c[0]||"").trim(), jenis:(c[1]||"").trim().toUpperCase(),
             io:(c[2]||"").trim().toUpperCase(), komen:(c[3]||"").trim() };
});
return msg;
