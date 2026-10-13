#!/usr/bin/env node
/* Test du service worker (PWA) : node outils/tests-pwa.js
   Copie le jeu dans un dossier temporaire, le sert en HTTP, puis vérifie : création des caches, préchargement du deck dans le cache,
   partie contre l'IA HORS LIGNE, aucune requête externe (Supabase) en cache, et mise à jour : après un « nouveau déploiement » (fichier modifié
   + outils/versions.js), la page reçoit la nouvelle version (mais pas pendant l'ouverture d'un paquet) et l'ancien cache est supprimé ;
   enfin l'interrupteur de secours (outils/sw-secours.js) vide les caches et se désinstalle sans boucle de rechargement. Nécessite Playwright (voir CLAUDE.md). */
"use strict";
const {chromium}=require('/opt/node-tools/node_modules/playwright');const os=require('os');const http=require('http'),fs=require('fs'),path=require('path'),cp=require('child_process');
const SRC=path.resolve(__dirname,'..'),ROOT=fs.mkdtempSync(path.join(os.tmpdir(),'helvara-pwa-')),T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.woff2':'font/woff2','.json':'application/json'};
fs.cpSync(SRC,ROOT,{recursive:true,filter:s=>!/[\\/](\.git|node_modules)([\\/]|$)|[\\/]images[\\/]readme/.test(s)});fs.writeFileSync(path.join(ROOT,'vendor/supabase.js'),'window.supabase=undefined');
const hits={};const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);hits[u]=(hits[u]||0)+1;let f=path.join(ROOT,u);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream','cache-control':'max-age=600'});r.end(d)})}).listen(0);
let bad=0;const ok=(n,c,d='')=>(c||bad++,console.log((c?'ok       ':'PAS OK   ')+n+(c?'':'  → '+JSON.stringify(d))));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false})});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const url=`http://127.0.0.1:${srv.address().port}/index.html`;
await p.goto(url);await p.waitForFunction(()=>typeof newGame==='function');
await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller||true);
await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
let keys=await p.evaluate(()=>caches.keys());ok('deux caches créés (core + media)',keys.length===2&&keys.some(k=>k.startsWith('helvara-core-'))&&keys.some(k=>k.startsWith('helvara-media-')),keys);
const core1=keys.find(k=>k.startsWith('helvara-core-'));
// deck + préchargement
await p.evaluate(()=>{P.owned=Object.keys(CARDS).filter(id=>!CARDS[id].token);P.deck=Object.keys(CARDS).filter(id=>!CARDS[id].token&&!ULof(id)&&(CARDS[id].rel||'')<'2099').slice(0,12);P.tuto=true;tutoStep=-1;P.starter=false;save();preloadDeck()});
await p.waitForTimeout(3000);
const cached=await p.evaluate(async()=>{const k=(await caches.keys()).find(k=>k.includes('media'));const c=await caches.open(k);const ks=await c.keys();return ks.map(r=>r.url.replace(/.*127.0.0.1:\d+\//,''))});
ok('les illustrations du deck sont en cache media',P_has(cached,'images/'+'passante')||cached.some(u=>/^images\/[a-z_]+\.webp/.test(u)),cached.length);
ok('la musique de partie préchargée est en cache',cached.some(u=>/^audio\/partie/.test(u)),cached.filter(u=>/audio/.test(u)));
ok('polices et icônes préchargées à l\'installation',cached.some(u=>/fonts\/.*woff2/.test(u))&&cached.some(u=>/icones\//.test(u)),'');
const all=await p.evaluate(async()=>{const o=[];for(const k of await caches.keys()){const c=await caches.open(k);for(const r of await c.keys())o.push(r.url)}return o});
ok('rien d\'externe (Supabase) dans les caches',!all.some(u=>!u.includes('127.0.0.1')),all.filter(u=>!u.includes('127.0.0.1')));
const nAv=await p.evaluate(async()=>{for(let i=0;i<40;i++){const k=(await caches.keys()).find(k=>k.includes('media'));const n=(await (await caches.open(k)).keys()).filter(r=>/avatars\//.test(r.url)).length;if(n>=200)return n;await new Promise(r=>setTimeout(r,500))}return -1});
ok('tous les avatars (miniatures du plateau, adversaire compris) sont rangés en arrière-plan',nAv>=200,nAv);
// hors ligne
await ctx.setOffline(true);
await p.reload();await p.waitForFunction(()=>typeof newGame==='function',null,{timeout:15000});
ok('hors ligne : la page se recharge depuis le cache',await p.evaluate(()=>!!document.querySelector('#app')&&document.querySelector('#app').children.length>0),'');
await p.evaluate(()=>{document.querySelector('[data-act=play]').click()});await p.waitForTimeout(1500);
ok('hors ligne : une partie contre l\'IA démarre',await p.evaluate(()=>!!S&&screen==='play'&&S.hand.p.length>0),'');
const imgOK=await p.evaluate(()=>[...document.querySelectorAll('.hc .art')].every(e=>getComputedStyle(e).backgroundImage!=='none'));
ok('hors ligne : la main s\'affiche avec ses illustrations',imgOK,'');
await p.evaluate(()=>{S.board.e[0].push(mk(Object.keys(CARDS).filter(id=>!CARDS[id].token&&!P.deck.includes(id))[0]));S.board.e[0][0].rev=true;render()});
const oppOK=await p.evaluate(async()=>{const el=document.querySelector('.side.foe .art');if(!el)return 'pas de miniature';const u=getComputedStyle(el).backgroundImage.match(/url\("?(.*?)"?\)/);if(!u)return 'pas d\'image';const r=await fetch(u[1]).catch(()=>null);return !!r&&r.ok});
ok('hors ligne : une carte adverse jamais vue s\'affiche aussi sur le plateau',oppOK===true,oppOK);
await p.screenshot({path:path.join(ROOT,'pwa-hors-ligne.png')});
await ctx.setOffline(false);
// nouvelle version
fs.appendFileSync(path.join(ROOT,'js/interface.js'),'\nwindow.__v2=1;\n');cp.execSync('node outils/versions.js',{cwd:ROOT});
await p.evaluate(()=>{S=null;screen='home';packOpen={res:[],name:'essai'};render()});   /* un paquet est en cours d'ouverture */
await p.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>r.update()));
await p.waitForTimeout(6000);
ok('protection : pas de rechargement pendant l\'ouverture d\'un paquet',await p.evaluate(()=>window.__v2!==1&&!!packOpen),'');
await p.evaluate(()=>{packOpen=null});
await p.waitForFunction(()=>window.__v2===1,null,{timeout:20000}).catch(()=>{});
await p.waitForTimeout(1500);
ok('nouvelle version : la page a rechargé les nouveaux fichiers',await p.evaluate(()=>window.__v2===1),'');
keys=await p.evaluate(()=>caches.keys());
ok('nouvelle version : ancien cache core supprimé',!keys.includes(core1)&&keys.filter(k=>k.startsWith('helvara-core-')).length===1,keys);
// interrupteur de secours
let navs=0;p.on('framenavigated',f=>{if(f===p.mainFrame())navs++});
fs.copyFileSync(path.join(ROOT,'outils/sw-secours.js'),path.join(ROOT,'sw.js'));
await p.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>r&&r.update()));
await p.waitForTimeout(8000);
keys=await p.evaluate(()=>caches.keys());
ok('secours : tous les caches du jeu sont supprimés',!keys.some(k=>k.startsWith('helvara-')),keys);
const regs=await p.evaluate(()=>navigator.serviceWorker.getRegistrations().then(r=>r.length));
ok('secours : plus aucun service worker actif après coup',regs===0||await p.evaluate(()=>!navigator.serviceWorker.controller),regs);
ok('secours : la page s\'est rechargée une fois, sans boucle',navs>=1&&navs<=2,navs);
await p.waitForFunction(()=>typeof newGame==='function',null,{timeout:10000}).catch(()=>{});
ok('secours : le jeu fonctionne normalement ensuite',await p.evaluate(()=>typeof newGame==='function'&&document.querySelector('#app').children.length>0),'');
ok('aucune erreur de page',errs.length===0,errs.slice(0,3));
await b.close();srv.close();fs.rmSync(ROOT,{recursive:true,force:true});process.exit(bad?1:0)})();
function P_has(a,s){return a.some(u=>u.includes(s))}
