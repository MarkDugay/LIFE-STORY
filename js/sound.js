(function(){'use strict';let ctx,mt,on=false;const N=[261.6,293.7,329.6,392,440,523.3];
function c(){try{if(!ctx){const A=globalThis.AudioContext||globalThis.webkitAudioContext;if(!A)return null;ctx=new A()}if(ctx.state==='suspended')ctx.resume();return ctx}catch(e){return null}}
function tone(f,d,v,t){const x=c();if(!x)return;const o=x.createOscillator(),g=x.createGain();o.type=t||'sine';o.frequency.value=f;g.gain.setValueAtTime(v,x.currentTime);g.gain.exponentialRampToValueAtTime(.0001,x.currentTime+d);o.connect(g);g.connect(x.destination);o.start();o.stop(x.currentTime+d)}
globalThis.Snd={click(){tone(520,.08,.05)},good(){tone(660,.12,.06);setTimeout(()=>tone(880,.15,.06),90)},bad(){tone(220,.3,.07,'triangle')},playing(){return on},
 music(v){on=!!v;clearInterval(mt);if(on)mt=setInterval(()=>{if(on)tone(N[Math.floor(Math.random()*N.length)],1.6,.03)},1200)}}})();
