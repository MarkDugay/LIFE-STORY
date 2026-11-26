(function(){'use strict';const K='lifestory_slot_',N=3;
const Save={slots:N,
 list(){const o=[];for(let i=1;i<=N;i++){try{const r=localStorage.getItem(K+i);if(!r){o.push(null);continue}const d=JSON.parse(r);o.push(LS.validate(d.g)?d:{corrupt:true})}catch(e){o.push({corrupt:true})}}return o},
 write(i,g){try{const d={ver:1,at:Date.now(),g:JSON.parse(JSON.stringify(g))};if(!LS.validate(d.g))return false;const s=JSON.stringify(d);JSON.parse(s);
   const old=localStorage.getItem(K+i);if(old)localStorage.setItem(K+i+'_bak',old);localStorage.setItem(K+i,s);return true}catch(e){return false}},
 del(i){localStorage.removeItem(K+i);localStorage.removeItem(K+i+'_bak')},
 restore(i){const b=localStorage.getItem(K+i+'_bak');if(!b)return false;try{if(!LS.validate(JSON.parse(b).g))return false;localStorage.setItem(K+i,b);return true}catch(e){return false}},
 exp(g){return JSON.stringify({ver:1,g},null,1)},
 imp(txt){try{const d=JSON.parse(txt);const g=d.g||d;if(!LS.validate(g))return null;return g}catch(e){return null}},
 ach(){try{return JSON.parse(localStorage.getItem('lifestory_ach')||'{}')}catch(e){return{}}},
 addAch(g){const a=Save.ach();Object.keys(g.achs).forEach(k=>a[k]=a[k]||Date.now());try{localStorage.setItem('lifestory_ach',JSON.stringify(a))}catch(e){}},
 set(){try{return JSON.parse(localStorage.getItem('lifestory_set')||'{}')}catch(e){return{}}},
 putSet(s){try{localStorage.setItem('lifestory_set',JSON.stringify(s))}catch(e){}}};
window.Save=Save})();
