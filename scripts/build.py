import json, os
_D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if '__file__' in dir() else '.'
_D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda f: open(os.path.join(_D,'js',f)).read()
LIB = J('lib.js')
TAB, UT, G1 = "susmaxgen_tab_01", "susmax_uitab_01", "sg_g1"
nodes = []
H = {"s_in":[12,10], "s_out":[12,22], "s_warn":[12,5], "s_err":[12,3]}

def fn(i,n,c,x,y,w,outs=1,lib=False):
    nodes.append({"id":i,"type":"function","z":TAB,"name":n,"func":(LIB+"\n"+c) if lib else c,
        "outputs":outs,"timeout":"","noerr":0,"initialize":"","finalize":"","libs":[],"x":x,"y":y,"wires":w})
def tpl(i,n,o,f,x,y,w):
    nodes.append({"id":i,"type":"ui_template","z":TAB,"group":G1,"name":n,"order":o,"width":H.get(i,[0,0])[0],"height":H.get(i,[0,0])[1],
        "format":f,"storeOutMessages":True,"fwdInMessages":True,"resendOnRefresh":True,
        "templateScope":"local","className":"","x":x,"y":y,"wires":w})

nodes.append({"id":TAB,"type":"tab","label":"Susmax Program Generator","disabled":False,"info":"","env":[]})

tpl("s_in","Input: Alamat/Jenis/IO/Komen",1,
 '<div style="padding:6px">\n  <p style="margin:4px 0"><b>Tempel IO list: Alamat / Jenis / IN-OUT / Komen</b></p>\n'
 '  <p style="margin:4px 0;font-size:11px;color:#666">Komen ada ST1/ST2/ST3 -> masuk program unit. Tanpa ST -> program MAIN.</p>\n'
 '  <textarea ng-model="ioText" rows="12" style="width:100%;box-sizing:border-box;font-family:monospace;font-size:12px" placeholder="CH000_00&#9;PB&#9;IN&#9;NOT EMERGENCY STOP"></textarea>\n'
 '  <md-button class="md-raised md-primary" ng-click="send({payload: ioText})" style="margin-top:4px">Generate Program</md-button>\n</div>',130,120,[["s_parse"]])

fn("s_parse","Parse TSV",J('parse.js'),350,120,[["s_name"]])
fn("s_name","Generate Name",J('genname.js'),510,120,[["s_val"]])
fn("s_val","Validate",J('validate.js'),670,120,[["s_split"],["s_err"]],outs=2)
fn("s_split","Split per Station",J('split.js'),840,120,[["s_all"]])
fn("s_all","Generate Program XML",J('gen_all.js'),1050,120,[["s_out","s_warn"]],lib=True)

tpl("s_err","Error display",3,
 '<div style="padding:6px;color:#c0392b;white-space:pre-wrap;font-family:monospace;font-size:12px">\n{{msg.payload}}\n</div>',
 840,200,[[]])
tpl("s_warn","Peringatan + Statistik",4,
 '<div style="padding:6px;font-family:monospace;font-size:11px">\n'
 '  <div style="white-space:pre-wrap;color:#2c3e50">{{msg.payload.stats}}</div>\n'
 '  <div style="white-space:pre-wrap;color:#c0392b;margin-top:6px" ng-if="msg.payload.warnings">{{msg.payload.warnings}}</div>\n</div>',
 1050,220,[[]])

tpl("s_out","Hasil: program XML + tabel Global Variables",4,
 '<div style="padding:6px;box-sizing:border-box;width:100%">\n'
 '  <div ng-if="msg.payload.files.length" style="background:#e8f4fd;border:1px solid #2196f3;border-radius:4px;padding:10px;margin-bottom:14px;box-sizing:border-box">\n'
 '    <div style="font-weight:bold;margin-bottom:2px">Import sekali jalan</div>\n'
 '    <div style="font-size:11px;color:#555;margin-bottom:8px">Semua program dan global variable dalam 1 file XML.</div>\n'
 '    <md-button class="md-raised md-primary" ng-click="dl(msg.payload.files[0])" style="margin:0">Download Single XML</md-button>\n'
 '  </div>\n'
 '  <div ng-repeat="f in msg.payload.files" style="margin-bottom:12px;border:1px solid #ddd;border-radius:4px;padding:8px;box-sizing:border-box">\n'
 '    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap">\n'
 '      <b style="font-family:monospace">{{f.name}}</b>\n'
 '      <md-button class="md-raised md-primary" ng-click="dl(f)" style="margin:0">Download</md-button>\n'
 '    </div>\n'
 '    <textarea rows="8" readonly style="width:100%;box-sizing:border-box;margin-top:6px;font-family:monospace;font-size:10px;white-space:pre;overflow:auto">{{f.xml}}</textarea>\n'
 '  </div>\n</div>\n'
 '<script>\n(function(scope){scope.dl=function(f){var b=new Blob([f.xml],{type:"text/xml"});var u=URL.createObjectURL(b);'
 'var a=document.createElement("a");a.href=u;a.download=f.name;document.body.appendChild(a);a.click();'
 'document.body.removeChild(a);URL.revokeObjectURL(u);};})(scope);\n</script>',1300,120,[[]])

nodes.append({"id":G1,"type":"ui_group","name":"Susmax Program Generator (MAIN + ST1..ST3)","tab":UT,
              "order":1,"disp":True,"width":"12","collapse":False})
nodes.append({"id":UT,"type":"ui_tab","name":"Susmax Generator","icon":"dashboard","order":1,"disabled":False,"hidden":False})
nodes.append({"id":"gcfg_01","type":"global-config","env":[],"modules":{"node-red-dashboard":"3.6.6"}})

outdir = os.path.join(_D,'outputs')
os.makedirs(outdir, exist_ok=True)
out = os.path.join(outdir,'susmax-program-generator-flow.json')
json.dump(nodes, open(out,'w'), indent=4)
print("WROTE",out,len(nodes),"nodes")
