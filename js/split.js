// Split device list: komen ada ST1/ST2/ST3 -> unit; sisanya -> MAIN
var devices = msg.payload || [];
var groups = { MAIN: [] };
devices.forEach(function(d){
    var m = (d.komen||"").toUpperCase().match(/\bST\s?(\d+)\b/);
    var key = m ? ("ST"+m[1]) : "MAIN";
    if(!groups[key]) groups[key]=[];
    groups[key].push(d);
});
flow.set("groups", groups);
msg.payload = groups;
msg.summary = Object.keys(groups).map(function(k){ return k+"="+groups[k].length; }).join("  ");
return msg;
