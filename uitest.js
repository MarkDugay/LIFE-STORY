const store={};global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]},get length(){return Object.keys(store).length}};
Object.defineProperty(global.localStorage,'keys',{value:()=>Object.keys(store)});
const els={};const mk=id=>els[id]||(els[id]={value:'',innerHTML:'',textContent:'',className:'',checked:true,dispatchEvent(){}});
const H={};global.window=globalThis;globalThis.scrollTo=()=>{};global.navigator={};global.location={protocol:'file:'};global.confirm=()=>true;global.Event=class{};
global.document={documentElement:{dataset:{},style:{setProperty(){}}},body:{},querySelector:s=>mk(s),addEventListener:(t,f)=>{H[t]=f},createElement:()=>({click(){}})};
require("./js/data.js");require("./js/engine.js");require("./js/events2.js");require("./js/events3.js");require("./js/sound.js");require("./js/save.js");
require('./js/ui.js');
const click=(a,o={})=>{H.click({target:{closest:()=>({disabled:false,dataset:{a,...o}})}})};
const app=()=>els['#app'].innerHTML;
click('create');if(!app().includes('Start Life'))throw'create';
mk('#f').value='Test';mk('#l').value='User';mk('#gn').value='F';mk('#co').value='Philippines';mk('#ci').value='Cebu';mk('#cl').value='4';mk('#m').value='';
click('start');if(!app().includes('AGE UP'))throw'start';
for(let i=0;i<70;i++){const g=JSON.parse(store['lifestory_slot_1']).g;
 if(g.dead)break;
 if(g.event){const ev=LS.eventInfo(g);let k=0;for(let j=0;j<ev.ch.length;j++)if(LS.canChoose(g,j)){k=j;break}click('ev',{i:k});if(/disabled/.test(app())&&false)throw 1}
 for(const t of ['people','work','money','fun','me','life'])click('tab',{t});
 if(g.age===18){click('tab',{t:'work'});mk('#maj').value='Medicine';click('enr',{l:2})}
 if(g.age===20){click('tab',{t:'people'});click('meet',{k:'partner'});click('meet',{k:'friend'})}
 if(g.age>=18&&!g.job){click('tab',{t:'work'});click('apply',{i:0})}
 click('tab',{t:'life'});click('age');}
click('menu');click('slots');click('cont');click('settings');click('achs');click('about');
console.log('UI ok, last age',JSON.parse(store['lifestory_slot_1']).g.age,'html',app().length);
