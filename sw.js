const C='lifestory-v3',F=['./','index.html','css/main.css','js/data.js','js/engine.js','js/events2.js','js/events3.js','js/sound.js','data/countries.json','data/careers.json','data/activities.json','data/properties.json','data/education.json','manifest.webmanifest','assets/icons/icon.svg','js/save.js','js/ui.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).then(r=>{const x=r.clone();caches.open(C).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request))));
