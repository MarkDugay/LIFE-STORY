(function(root){'use strict';
const D=root.DATA,STAT=['health','happiness','intel','looks','conf','disc','social','stress','rep'];
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v)),pick=a=>a[R(0,a.length-1)];
const cty=g=>D.countries[g.country],EDU=['No diploma','High School','Bachelor','Graduate'];
const mk=(role,age,last,gen)=>{gen=gen||pick(['M','F']);return{id:Math.random().toString(36).slice(2,9),name:pick(gen==='M'?D.mNames:D.fNames)+' '+(last||pick(D.last)),role,age,gen,str:R(40,80),trait:pick(D.traits),alive:true,argued:false}};
const nw=g=>Math.round(g.cash+g.assets.reduce((s,a)=>s+a.value-(a.mortgage||0),0)+(g.biz?g.biz.val:0)-g.debt+g.assets.reduce((s,a)=>s+(a.mortgage||0),0)-g.assets.reduce((s,a)=>s+(a.mortgage||0),0));
const log=(g,t)=>{g.log.unshift({age:g.age,t});if(g.log.length>400)g.log.pop()};
const earn=(g,n)=>{n=Math.round(n);g.cash+=n;g.tot.inc+=n;g.yr.inc+=n};
const spend=(g,n)=>{n=Math.round(n);g.tot.exp+=n;g.yr.exp+=n;if(g.cash>=n)g.cash-=n;else{g.debt+=n-g.cash;g.cash=0}};
function newLife(o,heir){
 const cls=D.classes[o.cls],c=D.countries[o.country],st={};
 STAT.forEach(k=>st[k]=R(35,80));st.stress=R(5,30);st.rep=R(30,60);st.health=R(60,95);st.happiness=R(55,90);
 const g={v:1,first:o.first,mid:o.mid||'',last:o.last,gen:o.gen,country:o.country,city:o.city,cls:o.cls,age:0,s:st,cash:0,debt:0,edu:0,
  grade:60,uni:null,degree:null,job:null,workYears:0,retired:false,pension:0,people:[],assets:[],biz:null,log:[],flags:{},recent:[],actUsed:0,
  event:null,dead:false,cause:'',generation:1,hist:[],tot:{inc:0,exp:0,jobs:0,props:0,rel:0,marr:0,kids:0,peak:0,biz:0},yr:{inc:0,exp:0},diff:o.diff||'Normal',achs:{},seen:{}};
 const ps=[mk('mother',R(22,38),o.last,'F'),mk('father',R(22,40),o.last,'M')];ps.forEach(p=>p.str=R(60,90));
 g.people=ps;if(Math.random()<.5)g.people.push(mk('sibling',R(0,10),o.last));
 {const gp=[mk('grandparent',R(58,80),o.last,'M'),mk('grandparent',R(56,78),null,'F'),mk('relative',R(25,60),null)];gp.forEach(p=>p.str=R(35,75));g.people.push(...gp)}
 if(heir){g.generation=heir.generation;g.hist=heir.hist;g.cash=heir.cash;g.assets=heir.assets;g.s.rep=heir.rep}
 log(g,`${o.first} was born in ${o.city}, ${o.country}, to a ${D.classes[o.cls].n.toLowerCase()} family.`);return g}
function fx(g,f){const m=cty(g).cost;for(const k in f){const v=f[k];
 if(STAT.includes(k))g.s[k]=cl(g.s[k]+v);else if(k==='cash')v>=0?earn(g,v*m):spend(g,-v*m);
 else if(k==='perf'){if(g.job)g.job.perf=cl(g.job.perf+v)}else if(k==='friends')g.people.forEach(p=>{if(/friend/.test(p.role))p.str=cl(p.str+v)});
 else if(k==='family')g.people.forEach(p=>{if(/mother|father|sibling|child/.test(p.role))p.str=cl(p.str+v)});
 else if(k==='med')spend(g,v*m*(g.ins?.2:1));else if(k==='spouse'){const sp=g.people.find(p=>p.role==='spouse'&&p.alive);if(sp)sp.str=cl(sp.str+v)}else if(k==='risk'){fx(g,Math.random()<v[0]?v[1]:v[2])}else if(k==='prison'){g.jail=v;g.job=null;g.flags.record=1;g.s.rep=cl(g.s.rep-10);log(g,`You were sentenced to ${v} year(s) in prison.`)}else if(k==='reunite'){const ex=g.people.find(p=>p.role==='ex'&&p.alive);if(ex){ex.role='spouse';ex.str=60}}else if(k==='grade')g.grade=cl(g.grade+v);else if(k==='flag')g.flags[v]=1;else if(k==='fired'&&g.job){log(g,`You lost your job as ${g.job.title}.`);g.job=null}}}
const has=(g,r)=>g.people.find(p=>p.role===r&&p.alive);
const E=(id,t,d,min,max,w,cond,ch)=>({id,t,d,min,max,w,cond:cond||(()=>true),ch:ch.map(c=>({t:c[0],fx:c[1],m:c[2]}))});
const EV=[
E('walk','First Steps','You are wobbling toward your parents.',1,2,9,null,[['Keep going',{happiness:3,health:1},'You walked!'],['Sit down and cry',{happiness:-1},'Maybe tomorrow.']]),
E('words','First Words','Everyone is waiting to hear what you say.',1,3,9,null,[['Say "Mama"',{happiness:2,family:5},'Mom is thrilled.'],['Say "Dada"',{happiness:2,family:5},'Dad is thrilled.']]),
E('friend_k','New Friend','A kid at the playground wants to share toys.',3,10,8,null,[['Share your toys',{social:4,happiness:3},'You made a friend.'],['Keep the toys',{social:-2,conf:1},'The kid walks away.']]),
E('bully','School Bully','A bigger kid keeps picking on you.',6,16,8,null,[['Stand up to them',{conf:5,health:-3,rep:2},'It was scary but they backed off.'],['Tell a teacher',{stress:-3,rep:1},'The teacher handled it.'],['Say nothing',{conf:-5,happiness:-6,stress:5},'It keeps happening.']]),
E('fight','Parents Arguing','You hear your parents shouting downstairs.',4,16,6,null,[['Hide in your room',{stress:4,happiness:-3},'You wait it out.'],['Try to calm them',{conf:2,stress:3,family:3},'They stop, embarrassed.']]),
E('hobby','A New Hobby','You get curious about something new.',6,17,7,null,[['Take up sports',{health:6,social:3,disc:2},'You joined a team.'],['Learn an instrument',{intel:3,disc:4,cash:-80},'You practice every day.'],['Draw and paint',{happiness:4,intel:2},'You fill sketchbooks.']]),
E('compete','School Competition','Your teacher signs you up for a competition.',7,17,6,g=>g.s.intel>45,[['Compete seriously',{intel:3,rep:4,stress:4,grade:3},'You placed well!'],['Skip it',{stress:-2},'You stay home.']]),
E('exam','Big Exam','A major exam is coming.',10,17,7,null,[['Study hard',{grade:6,stress:6,disc:2},'You did great.'],['Wing it',{grade:-3,stress:-2},'Risky...'],['Cheat',{grade:5,rep:-6,flag:'cheated'},'You got away with it—this time.']]),
E('moveh','Moving House','Your family has to move.',4,15,4,null,[['Embrace it',{conf:2,social:-1},'New start.'],['Resist',{happiness:-5},'You sulk for months.']]),
E('sibfight','Sibling Quarrel','Your sibling broke something of yours.',5,17,6,g=>!!has(g,'sibling'),[['Forgive them',{happiness:1,family:3},'You made up.'],['Get revenge',{happiness:2,family:-6},'Mom grounds you both.']]),
E('party_t','Teen Party','Friends invite you to a wild party.',14,19,7,null,[['Go and have fun',{happiness:5,social:4,health:-3,rep:-1},'Memorable night.'],['Stay home',{stress:-2},'Quiet night.'],['Go and drink',{happiness:3,health:-6,rep:-4,flag:'drinker'},'You regret it the next morning.']]),
E('shoplift','Shoplifting Dare','Your friends dare you to steal from a shop.',12,19,5,null,[['Do it',{cash:30,flag:'record_maybe'},''],['Refuse',{conf:2,friends:-3},'They tease you.']]),
E('prom','Dance Invitation','Someone asks you to the school dance.',15,18,6,null,[['Say yes',{happiness:6,social:3},'Lovely night.'],['Say no',{stress:-1},'You pass.']]),
E('jobchat','Manager Wants to Talk','Your manager calls you into their office after noticing your recent performance.',18,70,9,g=>!!g.job,[['Ask about a promotion',{perf:-3,conf:2},'They say "maybe next year."'],['Ask for feedback',{perf:8,intel:1},'Useful advice.'],['Stay quiet and listen',{perf:3},'Nothing changes.']]),
E('overtime','Overtime Request','Your boss needs someone to stay late.',18,64,7,g=>!!g.job,[['Volunteer',{cash:900,perf:6,stress:7,health:-2},'Extra pay, extra tired.'],['Decline',{perf:-4,stress:-2},'Boss is disappointed.']]),
E('coworker','Coworker Conflict','A coworker takes credit for your work.',18,64,6,g=>!!g.job,[['Confront them',{perf:2,rep:2,stress:5,conf:3},'They apologize.'],['Report to HR',{rep:3,stress:3},'HR investigates.'],['Let it go',{stress:8,happiness:-3},'It still bothers you.']]),
E('headhunt','Job Offer','A recruiter offers you a better-paying job.',22,58,5,g=>!!g.job,[['Take it (+15% pay)',{flag:'newjob'},'You switched employers!'],['Stay loyal',{perf:4,rep:1},'Your boss appreciates it.']]),
E('layoff','Company Layoffs','Your company is cutting costs.',22,62,4,g=>!!g.job&&g.job.perf<55,[['Beg for your job',{stress:6,fired:1},'It did not work.'],['Accept your fate',{stress:3,fired:1,cash:2000},'You get a severance check.']]),
E('windfall','Unexpected Windfall','A distant relative leaves you some money.',18,80,3,null,[['Save it',{cash:5000,disc:2},'Wise.'],['Spend it',{cash:2500,happiness:6},'Fun while it lasted.']]),
E('repair','Emergency Expense','Something big breaks at home.',18,85,8,null,[['Pay for repairs',{cash:-1800,stress:3},'Costly but fixed.'],['Fix it yourself',{stress:5,health:-2,disc:1},'It mostly works, at the cost of your weekends.']]),
E('flu','Sick Season','You come down with a bad flu.',1,95,8,null,[['See a doctor',{med:150,health:-2},'You recover quickly.'],['Tough it out',{health:-8,stress:3},'It drags on.']]),
E('injury','Injury','You hurt yourself in an accident.',8,90,5,null,[['Go to the hospital',{med:2500,health:-4},'Treated and healed.'],['Rest at home',{health:-10},'Recovery is slow.']]),
E('chronic','Chronic Condition','A checkup shows early signs of a long-term condition.',35,90,5,g=>g.s.health<75,[['Follow treatment',{med:900,health:4,disc:2},'You are managing it.'],['Ignore it',{health:-12,stress:5},'It worsens.']]),
E('friendcrisis','Friend in Need','A close friend asks to borrow money.',18,80,6,g=>g.people.some(p=>p.role==='friend'&&p.alive),[['Lend $500',{cash:-500,friends:8,rep:2},'They are grateful.'],['Refuse',{friends:-8},'It stings.']]),
E('reunion','Old Friend Reconnects','An old friend contacts you.',18,85,5,null,[['Meet up',{happiness:5,social:3,friends:3},'Great catch-up.'],['Ignore',{social:-2},'The moment passes.']]),
E('invest','Investment Tip','A coworker pitches a "sure thing" investment.',22,70,5,g=>g.cash>3000,[['Invest $3000',{flag:'gamble'},''],['Pass',{disc:1},'Probably wise.']]),
E('lottery','Scratch-off Ticket','You find a lottery ticket.',18,90,3,null,[['Scratch it',{flag:'lotto'},''],['Ignore it',{},'Nothing happens.']]),
E('retire_r','Retirement Reflections','You think about how you want to spend your later years.',60,90,7,null,[['Spend time with family',{happiness:6,family:6},'Warm days.'],['Travel the world',{happiness:8,cash:-3000,health:1},'Unforgettable.'],['Pick up a hobby',{happiness:5,intel:2},'You stay sharp.']]),
E('grandkid','Grandchild Visit','Your grandchild comes to visit.',55,95,6,g=>g.people.some(p=>p.role==='child'&&p.age>=22),[['Spoil them',{happiness:7,cash:-200},'They adore you.'],['Tell stories',{happiness:5,family:3},'A lovely day.']]),
E('burnout','Burnout','Work and life pile up.',20,60,5,g=>g.s.stress>65,[['Take time off',{stress:-20,cash:-800,perf:-3},'You feel better.'],['Push through',{health:-8,stress:5},'You are exhausted.']]),
E('scam','Online Scam','Someone offers a suspiciously good deal.',18,85,5,null,[['Fall for it',{cash:-1200,stress:4,intel:-1},'You lose money.'],['Report it',{rep:1,intel:1},'You avoided it.']]),
E('thief','Police Investigation','Police are looking into a theft you were involved in.',16,60,2,g=>g.flags.record_maybe,[['Cooperate',{rep:-8,stress:3,flag:'record'},'Community service and a criminal record.'],['Hire a lawyer',{cash:-4000,rep:-3},'Charges reduced.']])];
function pickEvent(g){const el=EV.filter(e=>g.age>=e.min&&g.age<=e.max&&e.cond(g)&&!(g.seen[e.id]&&/^(walk|words)$/.test(e.id)));if(!el.length)return null;
 const ws=el.map(e=>e.w*(g.recent.includes(e.id)?.08:1)),tot=ws.reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(let i=0;i<el.length;i++){r-=ws[i];if(r<=0)return el[i]}return el[0]}
const eventInfo=g=>EV.find(e=>e.id===g.event);
function resolveEvent(g,i){const ev=eventInfo(g);if(!ev)return'';const c=ev.ch[i];if(!c)return'';const m=cty(g).cost;let msg=c.m;
 if(c.fx.cash<0&&g.cash<-c.fx.cash*m)return'You cannot afford that.';
 fx(g,c.fx);
 if(c.fx.flag==='record_maybe'){if(Math.random()<.5){msg='You got caught! Reputation damaged.';fx(g,{rep:-8,happiness:-4})}else{msg='You got away with it.'}}
 if(c.fx.flag==='newjob'&&g.job)g.job.sal=Math.round(g.job.sal*1.15);
 if(c.fx.flag==='gamble'){if(Math.random()<.45){fx(g,{cash:7000});msg='The investment paid off: +$4,000 profit!'}else{fx(g,{cash:-3000});msg='The investment collapsed.'}}
 if(c.fx.flag==='lotto'){const r=Math.random();if(r<.02){fx(g,{cash:100000});msg='JACKPOT! +$100,000'}else if(r<.3){fx(g,{cash:50});msg='Won $50.'}else msg='Not a winner.'}
 g.recent.push(ev.id);if(g.recent.length>8)g.recent.shift();g.seen[ev.id]=1;g.event=null;log(g,`${ev.t}: ${msg}`);return msg}
const canChoose=(g,i)=>{const c=eventInfo(g).ch[i],f=c.fx.cash;return!(f<0&&g.cash<-f*cty(g).cost)};
function deathCheck(g){const a=g.age,h=g.s.health;let p=a<45?.0006:Math.pow((a-40)/70,3)*.4;if(h<50)p+=(50-h)/500;if(h<=5)p+=.5;if(a>=112)p=1;if(g.s.stress>85)p+=.01;
 if(a>14&&Math.random()<.0008)p=1;if(Math.random()<p){g.dead=true;g.cause=a>=112?'extreme old age':(h<30?(a>60?pick(['heart failure','pneumonia','a stroke']):'a serious illness'):(a>60?pick(['old age','heart failure','natural causes']):(a<45?'a tragic accident':'a sudden illness')));log(g,`You died at age ${a} of ${g.cause}.`);return true}return false}
function ageUp(g){if(g.dead||g.event)return;if(!g.job)g.people.forEach(p=>{if(/boss|coworker/.test(p.role))p.alive=false});
 const D_=g.diff==='Hard'?1.25:g.diff==='Easy'?.8:1,c=cty(g),a=++g.age;g.yr={inc:0,exp:0};g.actUsed=0;
 g.s.health=cl(g.s.health-(a>40?(a-40)/18:0)-(g.s.stress>70?2:0)+(a<30?.5:0));
 g.s.stress=cl(g.s.stress-2);if(a>50)g.s.looks=cl(g.s.looks-1);if(a<25)g.s.intel=cl(g.s.intel+1);
 if(g.debt>20000)g.s.stress=cl(g.s.stress+4);
 g.people.forEach(p=>{if(!p.alive)return;p.age++;p.argued=false;if(/friend|sibling|partner|spouse|grandparent|relative/.test(p.role)&&Math.random()<.6)p.str=cl(p.str-R(1,5));
  if(p.age>70&&Math.random()<Math.pow((p.age-65)/60,3)){p.alive=false;log(g,`${p.name} (${p.role}) passed away at ${p.age}.`);fx(g,{happiness:-10,stress:8})}
  if(p.role==='child'&&p.age===18)log(g,`${p.name} turned 18 and became independent.`)});
 const kin=g.people.filter(p=>p.alive&&/mother|father|spouse|partner|best friend/.test(p.role));
 if(kin.length)g.s.happiness=cl(g.s.happiness+(kin.reduce((s,p)=>s+p.str,0)/kin.length-55)/12);
 if(a>=5&&a<18&&!g.dropped){g.grade=cl(g.grade+(g.s.intel-50)/12+(g.s.disc-50)/12+R(-6,6));if(a===5)log(g,'You started school.');
  if(a>=14&&g.grade<20&&Math.random()<.3){g.dropped=1;log(g,'You were expelled for poor grades.')}}
 if(a===18){if(!g.dropped&&g.grade>=35){g.edu=1;log(g,`You graduated high school (grade ${Math.round(g.grade)}).`)}else log(g,'You did not graduate high school.');
  const h=Math.round(D.classes[g.cls].help*c.sal);if(h>0){earn(g,h);log(g,`Your family gave you $${h.toLocaleString()} for adulthood.`)}}
 if(g.uni){const u=g.uni,tu=Math.round((u.lvl===3?15000:9000)*c.cost*(g.grade>80?.5:1));spend(g,tu);
  g.grade=cl(g.grade+(g.s.intel-50)/12+(g.s.disc-50)/10+R(-6,6));u.left--;
  if(g.grade<22&&Math.random()<.5){log(g,'You dropped out of university due to failing grades.');g.uni=null}
  else if(u.left<=0){g.edu=u.lvl;g.degree=u.major;g.s.intel=cl(g.s.intel+4);g.s.rep=cl(g.s.rep+4);log(g,`You graduated with a ${u.lvl===3?'graduate degree':"bachelor's degree"} in ${u.major}.`);g.uni=null}}
 if(g.job){const j=g.job;j.yrs++;g.workYears++;j.perf=cl(j.perf+(g.s.disc-50)/20+(g.s.intel-50)/30+R(-8,8)-(g.s.stress>70?3:0));
  earn(g,j.sal*.8);j.sal=Math.round(j.sal*(1.02+(j.perf>60?.015:0)));
  if(j.yrs>=2&&j.perf>65&&j.rank<j.ladder.length-1&&Math.random()<.35){j.rank++;j.title=j.ladder[j.rank];j.sal=Math.round(j.sal*1.25);g.s.happiness=cl(g.s.happiness+4);log(g,`Promotion! You became ${j.title} earning $${j.sal.toLocaleString()}.`)}
  if(j.perf<18&&Math.random()<.5){log(g,`You were fired from your job as ${j.title}.`);g.s.rep=cl(g.s.rep-5);g.s.happiness=cl(g.s.happiness-8);g.job=null}
  else if(a>=70){log(g,`You retired from ${j.title} after ${g.workYears} years.`);g.pension=Math.round(j.sal*.4*(g.workYears>=10?1:.3));g.job=null;g.retired=true}}
 if(g.jail>0){g.jail--;g.s.happiness=cl(g.s.happiness-5);g.s.health=cl(g.s.health-2);if(g.jail===0)log(g,'You were released from prison.')}
 const sp0=g.people.find(p=>p.role==='spouse'&&p.alive);if(sp0&&sp0.str<15){sp0.role='ex';sp0.str=20;g.s.happiness=cl(g.s.happiness-12);log(g,`${sp0.name} left you. Your marriage ended.`)}
 if(g.ins&&a>=1)spend(g,1200*c.cost*D_);
 if(g.retired&&g.pension)earn(g,g.pension);
 if(g.biz){const b=g.biz,pr=b.val*(R(-25,35)/100)*(.7+g.s.disc/150)*(b.rep/60);if(pr>0)earn(g,pr*.5);b.val=Math.round(b.val+(pr<0?pr:pr*.5));b.rep=cl(b.rep+R(-4,5));
  log(g,`${b.name} ${pr>=0?'earned':'lost'} $${Math.abs(Math.round(pr)).toLocaleString()} this year.`);if(b.val<2000){log(g,`${b.name} went bankrupt.`);g.biz=null;g.s.rep=cl(g.s.rep-8)}}
 let rentIncome=0,ownsHome=false;g.assets.forEach(x=>{const d=D.props.find(p=>p.id===x.id);x.value=Math.round(x.value*(d.k==='car'?.89:1.03));x.cond=cl((x.cond==null?70:x.cond)-3);if(x.cond<35)x.value=Math.round(x.value*.97);spend(g,x.value*d.up*D_);
  if(d.k==='home')ownsHome=true;if(d.rent)rentIncome+=x.value*d.rent;
  if(x.mortgage>0){const pay=Math.min(x.mortgage,Math.round(x.price*.04));x.mortgage-=pay;spend(g,pay);g.debt=Math.max(0,g.debt-pay)}});
 if(rentIncome)earn(g,rentIncome);
 if(a>=18){const sp=g.people.find(p=>p.role==='spouse'&&p.alive);let l=9000*c.cost*D_*(sp?.7:1);if(ownsHome)l*=.55;spend(g,l)}
 else{const al=D.classes[g.cls].allow*c.sal;if(a>=6&&al>0)earn(g,al)}
 g.people.filter(p=>p.role==='child'&&p.age<18&&p.alive).forEach(()=>spend(g,3200*c.cost*D_));
 if(g.debt>0){const i=Math.round(g.debt*.06);g.debt+=i;g.tot.exp+=i;g.yr.exp+=i}
 if(g.debt>0&&g.cash>2000){const pay=Math.min(g.debt,g.cash-1000);g.cash-=pay;g.debt-=pay}
 if(g.debt>300000*c.sal){log(g,'You declared bankruptcy. Assets seized.');g.assets=[];g.debt=0;g.cash=0;g.s.rep=cl(g.s.rep-15);g.s.stress=cl(g.s.stress+15);g.flags.bankrupt=1}
 if(g.debt>0&&g.cash===0)g.s.happiness=cl(g.s.happiness-3);
 g.tot.peak=Math.max(g.tot.peak,nw(g));(g.nwh=g.nwh||[]).push([a,nw(g)]);if(g.nwh.length>120)g.nwh.shift();
 if(deathCheck(g))return;
 if(Math.random()<(g.diff==='Hard'?.95:g.diff==='Easy'?.7:.85)){const e=pickEvent(g);if(e)g.event=e.id}
 checkAch(g)}
function toggleIns(g){g.ins=!g.ins;return g.ins?'Health insurance on (-$1,200/yr, 80% off medical bills).':'Insurance cancelled.'}
function enroll(g,major,lvl){if(g.uni)return'Already enrolled.';if(g.dropped)return'You left school.';if(lvl===2&&(g.edu<1||g.age<17))return'You need a high school diploma.';if(lvl===3&&g.edu<2)return'You need a bachelor degree first.';
 g.uni={major,lvl,left:lvl===2?4:2};log(g,`You enrolled in ${lvl===3?'graduate school':'university'} for ${major}.`);return'Enrolled. Tuition is charged yearly (loans if you lack cash).'}
function dropOut(g){if(g.uni){g.uni=null;log(g,'You dropped out of university.');g.s.happiness=cl(g.s.happiness-3);return'Dropped out.'}if(g.age>=16&&g.age<18&&!g.dropped){g.dropped=1;log(g,'You dropped out of high school.');return'Dropped out.'}return'Nothing to drop.'}
function findJobs(g){if(g.age<16)return[];const c=cty(g);return D.jobs.filter(j=>g.age>=j.a&&g.edu>=j.e&&(!j.d||j.d.includes(g.degree))).map(j=>({...j,sal:Math.round(j.b*c.sal)}))}
function applyJob(g,idx,list){const j=list[idx];if(!j)return'Job not found.';if(g.job)return'Resign from your current job first.';if(g.jail>0)return'You are in prison.';if(g.retired)return'You are retired.';
 const ch=.35+g.s.intel/250+g.s.social/300+g.s.rep/400+(g.edu>j.e?.15:0)+(j.free?.2:0);
 if(Math.random()<ch){g.job={title:j.l[0],ladder:j.l,rank:0,sal:j.sal,perf:55,yrs:0,field:j.f};g.tot.jobs++;g.people.forEach(p=>{if(/boss|coworker/.test(p.role))p.alive=false});{const b=mk('boss',R(35,60),null),w=mk('coworker',R(22,45),null);b.str=R(35,60);w.str=R(35,65);g.people.push(b,w)}log(g,`You were hired as ${j.t} at $${j.sal.toLocaleString()}/year.`);g.s.happiness=cl(g.s.happiness+4);return`Hired as ${j.t}!`}
 g.s.conf=cl(g.s.conf-2);return'The interview went badly. Rejected.'}
function quit(g){if(!g.job)return'You have no job.';log(g,`You resigned as ${g.job.title}.`);g.job=null;return'You resigned.'}
function raise(g){if(!g.job)return'No job.';if(g.job.perf>70&&Math.random()<.5){g.job.sal=Math.round(g.job.sal*1.1);return'Raise granted: +10%'}g.job.perf=cl(g.job.perf-4);return'Request denied.'}
function retire(g){if(!g.job)return'No job.';if(g.age<60)return'Too young to retire (60+).';g.pension=Math.round(g.job.sal*.4*(g.workYears>=10?1:.3));log(g,`You retired from ${g.job.title}.`);g.job=null;g.retired=true;return`Retired. Pension: $${g.pension.toLocaleString()}/yr`}
function doAct(g,id){const a=D.acts.find(x=>x.id===id);if(!a)return'?';if(a.a&&g.age<a.a)return'Too young.';if(g.jail>0)return'You are in prison.';if(g.actUsed>=4)return'You are too busy (4 activities per year).';
 const c=Math.round(a.c*cty(g).cost);if(c>g.cash)return'Not enough cash.';g.actUsed++;if(c)spend(g,c);fx(g,a.fx);if(id==='trip')g.flags.trips=(g.flags.trips||0)+1;log(g,`Activity: ${a.n}.`);return a.n+' done.'}
function relocate(g,country){if(g.jail>0)return'You are in prison.';const c=D.countries[country];
 if(country===g.country){const ci=c.cities.filter(x=>x!==g.city);if(!ci.length)return'Nowhere else to go.';const cost=Math.round(1500*c.cost);if(g.cash<cost)return`You need $${cost.toLocaleString()}.`;spend(g,cost);g.city=pick(ci);log(g,`You moved to ${g.city}.`);return'Moved to a new city.'}
 const fee=Math.round(2500*c.cost+800);if(g.cash<fee)return`The visa application costs $${fee.toLocaleString()}.`;spend(g,fee);
 const ch=.3+g.edu*.12+(g.job?.12:0)+(g.cash>20000?.1:0)+g.s.rep/400-(g.flags.record?.25:0);
 if(Math.random()>ch){g.s.stress=cl(g.s.stress+4);log(g,`Your visa application for ${country} was denied.`);return'Visa denied. The fee is lost.'}
 spend(g,Math.round(3000*c.cost));g.country=country;g.city=pick(c.cities);g.job=null;g.flags.moved=(g.flags.moved||0)+1;log(g,`Visa approved! You immigrated to ${g.city}, ${country}. Your job did not come with you.`);return'Visa approved. Welcome!'}
function renovate(g,i){const a=g.assets[i];if(!a)return'?';if(!/apt|house|lux|mansion|rent1/.test(a.id))return'Only properties can be renovated.';const c=Math.round(a.price*.1);if(g.cash<c)return`Renovation costs $${c.toLocaleString()}.`;spend(g,c);a.cond=cl((a.cond==null?70:a.cond)+25);a.value=Math.round(a.value*1.08);log(g,`You renovated your ${a.n}.`);return'Renovated: condition up, value +8%.'}
function bizLoan(g,amt){if(!g.biz)return'You have no business.';amt=Math.round(amt);const mx=Math.round(g.biz.val*1.5-(g.biz.loan||0));if(!(amt>0))return'Enter an amount.';if(amt>mx)return`The bank will lend at most $${Math.max(0,mx).toLocaleString()}.`;
 g.biz.loan=(g.biz.loan||0)+amt;g.debt+=amt;g.biz.val+=amt;g.tot.inc+=0;log(g,`Your business took a $${amt.toLocaleString()} loan (6% interest).`);return'Loan approved; funds added to the business.'}
function expandBiz(g){if(!g.biz)return'No business.';const c=Math.round(g.biz.val*.2);if(g.cash<c)return`Expansion costs $${c.toLocaleString()}.`;spend(g,c);g.biz.val=Math.round(g.biz.val+c*1.3);g.biz.rep=cl(g.biz.rep+3);log(g,`${g.biz.name} expanded.`);return'Expanded.'}
function meet(g,role){if(g.age<5)return'Too young.';if(g.people.filter(p=>/friend|partner/.test(p.role)&&p.alive).length>14)return'Your social circle is full.';
 if(role==='partner'){if(g.age<16)return'Too young to date.';if(g.people.some(p=>/partner|spouse/.test(p.role)&&p.alive))return'You are already in a relationship.';
  const p=mk('partner',Math.max(16,g.age+R(-4,4)),null);p.str=R(30,60);g.people.push(p);g.tot.rel++;g.s.happiness=cl(g.s.happiness+3);log(g,`You started dating ${p.name}.`);return`You met ${p.name} (${p.trait}).`}
 const p=mk('friend',Math.max(5,g.age+R(-3,3)),null);p.str=R(35,60);g.people.push(p);g.tot.rel++;log(g,`You became friends with ${p.name}.`);return`You met ${p.name} (${p.trait}).`}
function rel(g,id,kind){const p=g.people.find(x=>x.id===id);if(!p||!p.alive)return'Not available.';const ch=cty(g).cost;let m='';
 switch(kind){case'talk':p.str=cl(p.str+R(2,6)+g.s.social/60);m=`You talked with ${p.name}.`;break;
 case'time':p.str=cl(p.str+R(5,9));g.s.happiness=cl(g.s.happiness+3);m=`You spent time with ${p.name}.`;break;
 case'gift':{const c=Math.round(80*ch);if(g.cash<c)return'Not enough cash for a gift.';spend(g,c);p.str=cl(p.str+R(6,12));m=`You gave ${p.name} a gift.`;break}
 case'compliment':p.str=cl(p.str+R(1,5));m=`You complimented ${p.name}.`;break;
 case'argue':p.str=cl(p.str-R(10,22));p.argued=true;g.s.stress=cl(g.s.stress+4);m=`You argued with ${p.name}.`;break;
 case'apologize':if(p.argued||p.str<50){p.str=cl(p.str+R(8,16));p.argued=false;m=`${p.name} accepted your apology.`}else m=`${p.name} was confused by your apology.`;break;
 case'borrow':{if(p.str<55){p.str=cl(p.str-8);m=`${p.name} refused to lend you money.`;break}const amt=Math.round((500+p.str*10)*ch);earn(g,amt);p.str=cl(p.str-6);m=`${p.name} lent you $${amt.toLocaleString()}.`;break}
 case'lend':{const c=Math.round(300*ch);if(g.cash<c)return'Not enough cash.';spend(g,c);p.str=cl(p.str+10);m=`You lent ${p.name} $${c}.`;break}
 case'end':if(/mother|father/.test(p.role))return'You cannot end that relationship.';if(p.role==='spouse'){p.role='ex';p.str=30;const half=Math.round(Math.max(0,g.cash)/2);g.cash-=half;g.s.happiness=cl(g.s.happiness-12);m=`You divorced ${p.name}. Settlement: -$${half.toLocaleString()}.`}else{p.alive=false;m=`You ended things with ${p.name}.`}break;
 case'propose':if(p.role!=='partner')return'Only partners.';if(p.str<65||g.age<18)return`${p.name} isn't ready (need bond ≥65 and age 18+).`;
  {const w=Math.round(5000*ch);if(g.cash<w)return`The wedding costs $${w.toLocaleString()}.`;spend(g,w);p.role='spouse';p.str=cl(p.str+10);g.tot.marr++;g.s.happiness=cl(g.s.happiness+10);m=`You married ${p.name}!`;break}}
 log(g,m);return m}
function haveChild(g,adopt){const sp=g.people.find(p=>/spouse|partner/.test(p.role)&&p.alive);if(g.age<18)return'Too young.';if(!adopt&&!sp)return'You need a partner to have a child.';
 if(adopt){const cost=Math.round(9000*cty(g).cost);if(g.cash<cost)return`Adoption costs $${cost.toLocaleString()}.`;spend(g,cost)}else if(g.age>48||sp.age>50)return'Too old for pregnancy.';
 const k=mk('child',0,g.last);k.str=80;g.people.push(k);g.tot.kids++;g.s.happiness=cl(g.s.happiness+8);g.s.stress=cl(g.s.stress+4);log(g,`${adopt?'You adopted':'You had'} a child: ${k.name}.`);return`Welcome ${k.name}!`}
function buy(g,id,mort){const d=D.props.find(p=>p.id===id);if(!d)return'?';const price=Math.round(d.p*cty(g).cost);
 if(d.k!=='car'&&mort){const down=Math.round(price*.2);if(g.cash<down)return`Need $${down.toLocaleString()} down payment.`;if(!g.job&&!g.biz)return'The bank requires income for a mortgage.';
  g.cash-=down;g.tot.exp+=down;g.assets.push({id,n:d.n,price,value:price,mortgage:price-down});g.debt+=price-down}
 else{if(g.cash<price)return`Need $${price.toLocaleString()}.`;g.cash-=price;g.tot.exp+=price;g.assets.push({id,n:d.n,price,value:price,mortgage:0})}
 g.tot.props++;g.s.happiness=cl(g.s.happiness+3);log(g,`You bought a ${d.n} for $${price.toLocaleString()}${mort?' (mortgage)':''}.`);return`Bought ${d.n}.`}
function sell(g,i){const a=g.assets[i];if(!a)return'?';g.assets.splice(i,1);g.debt=Math.max(0,g.debt-(a.mortgage||0));g.cash+=a.value;log(g,`You sold ${a.n} for $${a.value.toLocaleString()}.`);
 if(g.cash<0){g.debt-=g.cash;g.cash=0}return`Sold ${a.n}.`}
function startBiz(g,type,inv){if(g.biz)return'You already own a business.';inv=Math.round(inv);if(g.age<18)return'Too young.';if(!(inv>=5000))return'Minimum investment $5,000.';if(inv>g.cash)return'Not enough cash.';g.cash-=inv;g.tot.exp+=inv;g.tot.biz++;
 g.biz={name:`${g.last} ${type}`,type,val:inv,rep:50};log(g,`You founded ${g.biz.name}.`);return'Business started.'}
function sellBiz(g){if(!g.biz)return'No business.';const v=g.biz.val;g.cash+=v;log(g,`You sold ${g.biz.name} for $${v.toLocaleString()}.`);g.biz=null;return'Business sold.'}
function payDebt(g){if(g.debt<=0)return'No debt.';const p=Math.min(g.debt,g.cash);if(p<=0)return'No cash.';g.cash-=p;g.debt-=p;return`Paid $${p.toLocaleString()}.`}
const ACH=[['first_job','First Job',g=>g.tot.jobs>=1],['uni','University Graduate',g=>g.edu>=2],['mil','First Million',g=>nw(g)>=1e6],['bil','Billionaire',g=>nw(g)>=1e9],
['biz','Business Owner',g=>!!g.biz&&g.biz.val>=100000],['marry','Happily Married',g=>g.people.some(p=>p.role==='spouse'&&p.alive&&p.str>=75)],
['fam','Large Family',g=>g.tot.kids>=3],['trav','World Traveler',g=>(g.flags.trips||0)>=5],['career','Successful Career',g=>!!g.job&&g.job.rank>=2],
['free','Financial Freedom',g=>g.cash>=500000&&g.debt===0],['cent','100 Years Old',g=>g.age>=100],['legacy','Multi-Generation Legacy',g=>g.generation>=3]];
function checkAch(g){ACH.forEach(([id,t,f])=>{if(!g.achs[id]&&f(g)){g.achs[id]=g.age;log(g,`🏆 Achievement: ${t}`);(g.newAch=g.newAch||[]).push(t)}})}
function summary(g){const kids=g.people.filter(p=>p.role==='child');
 const legacy=Math.round(Math.max(0,nw(g))/10000+g.age+kids.length*8+g.edu*6+g.s.rep/4+Object.keys(g.achs).length*10+g.tot.marr*3-(g.flags.record?10:0));
 return{years:g.age,edu:g.degree?`${g.degree} (${EDU[g.edu]})`:EDU[g.edu],career:g.job?g.job.title:(g.retired?'Retired':'Unemployed'),earn:g.tot.inc,peak:g.tot.peak,props:g.tot.props,kids:kids.length,
 marr:g.tot.marr,ach:Object.keys(g.achs).map(k=>ACH.find(a=>a[0]===k)[1]),mistakes:[g.flags.record&&'Criminal record',g.flags.bankrupt&&'Bankruptcy',g.flags.drinker&&'Heavy drinking',g.flags.cheated&&'Cheated in school'].filter(Boolean),legacy,cause:g.cause,nw:nw(g)}}
const heirs=g=>g.people.filter(p=>p.role==='child'&&p.alive&&p.age>=16);
function nextGen(g,childId){const k=g.people.find(p=>p.id===childId);if(!k)return null;const[first,...rest]=k.name.split(' ');
 const est=Math.max(0,g.cash+g.assets.reduce((s,a)=>s+a.value-(a.mortgage||0),0)+(g.biz?g.biz.val:0)-g.debt);const cash=Math.round(est*.85/Math.max(1,heirs(g).length));
 const n=newLife({first,mid:'',last:rest.join(' '),gen:k.gen,country:g.country,city:g.city,cls:g.cls,diff:g.diff},{generation:g.generation+1,hist:g.hist.concat([{name:g.first+' '+g.last,age:g.age,legacy:summary(g).legacy}]),cash:0,assets:[],rep:Math.round(g.s.rep*.7)});
 n.age=k.age;n.cash=cash;n.edu=k.age>=18?1:0;n.log=[];n.people=n.people.map((p,i)=>i<2?{...p,age:p.age+k.age}:p);
 log(n,`${first} continues the family story (generation ${n.generation}) and inherits $${cash.toLocaleString()}.`);return n}
function validate(g){try{return!!g&&typeof g==='object'&&typeof g.v==='number'&&typeof g.age==='number'&&g.age>=0&&!!g.s&&STAT.every(k=>typeof g.s[k]==='number')&&Array.isArray(g.people)&&Array.isArray(g.assets)&&Array.isArray(g.log)&&typeof g.cash==='number'&&isFinite(g.cash)&&!!D.countries[g.country]&&typeof g.first==='string'}catch(e){return false}}
root.LS={D,STAT,EDU,R,pick,newLife,ageUp,resolveEvent,eventInfo,canChoose,nw,enroll,dropOut,findJobs,applyJob,quit,raise,retire,doAct,relocate,meet,rel,haveChild,buy,sell,startBiz,sellBiz,payDebt,summary,heirs,nextGen,validate,ACH,renovate,bizLoan,expandBiz,EV,E,fx,log,has,toggleIns,get EVCOUNT(){return EV.length},cty};
})(typeof window!=='undefined'?window:globalThis);
