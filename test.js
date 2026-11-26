require('./js/data.js');require('./js/engine.js');require('./js/events2.js');require('./js/events3.js');require('./js/sound.js');const L=globalThis.LS;
let deaths=0,ev=0,gens=0,maxAge=0;
for(let t=0;t<300;t++){let g=L.newLife({first:'A',last:'B',gen:'M',country:'United States',city:'Austin',cls:t%7,diff:'Normal'});
 let guard=0;while(!g.dead&&guard++<200){
  if(g.event){const e=L.eventInfo(g);let i=0;for(let k=0;k<e.ch.length;k++)if(L.canChoose(g,k)){i=k;break}L.resolveEvent(g,i);ev++}
  if(g.age===18&&g.edu>=1)L.enroll(g,'Computer Science',2);
  if(g.age>=18&&!g.job){const j=L.findJobs(g);if(j.length)L.applyJob(g,j.length-1,j)}
  if(g.age===25)L.meet(g,'partner');if(g.age===27){const p=g.people.find(x=>x.role==='partner');if(p){p.str=90;L.rel(g,p.id,'propose');L.haveChild(g)}}
  if(g.age===30)L.buy(g,'house',true);if(g.age===30)L.startBiz(g,'Retail Shop',6000);
  L.ageUp(g);
  if(!isFinite(g.cash)||g.cash<0||g.debt<0||Object.values(g.s).some(v=>v<0||v>100||isNaN(v)))throw new Error('bad state '+JSON.stringify(g.s)+g.cash);
 }
 if(g.dead){deaths++;maxAge=Math.max(maxAge,g.age);L.summary(g);const h=L.heirs(g);if(h.length){const n=L.nextGen(g,h[0].id);if(!L.validate(n))throw 1;gens++}}
}
const g=L.newLife({first:'A',last:'B',gen:'M',country:'Japan',city:'Tokyo',cls:3});
const s=JSON.stringify(g);if(!L.validate(JSON.parse(s)))throw 'val';
console.log({runs:300,deaths,events:ev,gens,maxAge,evCount:L.EVCOUNT,validJSON:true});
// every event must have a choice that needs no cash (no soft-lock at $0)
const g0=L.newLife({first:'A',last:'B',gen:'M',country:'United States',city:'Austin',cls:0});
const ids=L.EV.map(e=>e.id);
ids.forEach(id=>{g0.event=id;const e=L.eventInfo(g0);if(!e.ch.some((c,i)=>L.canChoose(g0,i)))throw new Error('softlock: '+id)});
console.log('no soft-locks across',ids.length,'events');
// new systems
const h=L.newLife({first:'A',last:'B',gen:'M',country:'United States',city:'Austin',cls:6});h.age=30;h.cash=2e6;h.job={title:'x',ladder:['x'],rank:0,sal:1e5,perf:80,yrs:1};
console.log('relatives:',h.people.filter(p=>/grandparent|relative/.test(p.role)).length);
console.log(L.buy(h,'house',false),'|',L.renovate(h,0),'|',L.startBiz(h,'Retail Shop',50000),'|',L.bizLoan(h,10000),'|',L.expandBiz(h));
let ok=0,den=0;for(let i=0;i<40;i++){h.cash=1e6;h.country='United States';const r=L.relocate(h,'Japan');/approved/.test(r)?ok++:den++}console.log('visa approved/denied',ok,den);
console.log('total events',L.EVCOUNT,'generated',L.generatedEvents);
