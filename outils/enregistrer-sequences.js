#!/usr/bin/env node
/* Duel d'Helvara : enregistre des séquences de jeu sur écran de téléphone (390 × 844, rendu ×2) pour la page itch.io et le trailer (24 novembre).
   Usage : node outils/enregistrer-sequences.js [nom-du-clip] [dossier]   (par défaut : tous les clips, dans /tmp/helvara-video)
   Clips : 1-accueil-tirage-ultra, 2-partie-serment-croise (rejoué jusqu'à une victoire avec Serment croisé tenu), 3-chronique-boss-trone, 4-collection-holo.
   Vidéos .webm sans son (le navigateur de test n'enregistre pas l'audio) et captures .png dans <dossier>/itch. Profil fictif, rien n'est sauvegardé chez un joueur.
   Conversion en MP4 : ffmpeg -i clip.webm -c:v libx264 -crf 20 -pix_fmt yuv420p -r 30 clip.mp4 */
function loadPlaywright(){ for(const p of ["playwright","/opt/node-tools/node_modules/playwright"]){ try{ return require(p); }catch(e){ /* suivant */ } } console.error("Playwright introuvable (voir CLAUDE.md, section Tests)."); process.exit(1); }
const {chromium}=loadPlaywright(); const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'), OUT=path.resolve(process.argv[3]||'/tmp/helvara-video'), TODAY='2026-12-16';
fs.mkdirSync(path.join(OUT,'itch'),{recursive:true});
const T={".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",".json":"application/json",".woff2":"font/woff2",".mp3":"audio/mpeg",".png":"image/png",".jpg":"image/jpeg"};
const which=process.argv[2]||'all';
(async()=>{
 const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0])); if(f.endsWith('/'))f+='index.html'; fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(0);
 const URL0=`http://127.0.0.1:${srv.address().port}/index.html?apercu=1`;
 const b=await chromium.launch();
 const prep=async ctx=>{ await ctx.route('**/vendor/supabase.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.supabase=undefined'})); await ctx.addInitScript(d=>{ window.__today=d; },TODAY); };
 /* profil propre : tutoriel fait, toute la collection, un deck prêt, rang Héraut */
 const sctx=await b.newContext(); await prep(sctx); const sp=await sctx.newPage(); await sp.goto(URL0); await sp.waitForFunction(()=>typeof newGame==='function');
 await sp.evaluate(()=>{ P.tuto=true; P.starter=true; P.name="Kanoew"; P.avatar="nyx"; P.owned=Object.keys(CARDS).filter(id=>!CARDS[id].token); P.deck=PRECONS.find(x=>x.id==="miser").cards.slice(); P.chf=2840; P.lv=13; P.w=40; P.l=22; P.sw=12; P.sl=6; P.cine=true; P.cd={day:today(),id:"",got:true}; P.maj=MAJ[0].id; save(); });
 const state=await sctx.storageState(); await sctx.close();
 const clip=async(name,fn)=>{ if(which!=='all'&&which!==name) return;
   const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,storageState:state,recordVideo:{dir:OUT,size:{width:780,height:1688}}}); await prep(ctx);
   const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
   await pg.goto(URL0); await pg.waitForFunction(()=>typeof newGame==='function'); await pg.waitForTimeout(800);
   let ok=true; try{ ok=await fn(pg)!==false; }catch(e){ ok=false; errs.push('script: '+e.message.split('\n')[0]); }
   const v=pg.video(); await ctx.close(); const src=await v.path();
   if(ok){ fs.renameSync(src,path.join(OUT,name+'.webm')); } else fs.unlinkSync(src);
   console.log(name, ok?'enregistré':'raté', errs.slice(0,3).join(' | ')); return ok; };
 const W=(pg,ms)=>pg.waitForTimeout(ms);
 const idle=pg=>pg.waitForFunction(()=>S&&!S.busy&&!document.querySelector('.oathcer'),null,{timeout:60000}).catch(()=>{});
 /* un tour joué par les vrais boutons : l'IA « joueur » choisit, le script touche la carte puis le lieu */
 async function playTurn(pg,{oath}={}){
   await idle(pg); await W(pg,500);
   if(oath){ const done=await pg.evaluate(()=>S.oath!=null); if(!done){
       if(await pg.$('[data-act="oathcross"]')){ await pg.click('[data-act="oathcross"]'); await W(pg,1300); await pg.screenshot({path:path.join(OUT,'itch','capture-serment-croise.png')}); await W(pg,3500); }
       else if(oath==='any'){ const li=await pg.evaluate(()=>{ let best=0,bv=-99; for(let i=0;i<3;i++){ if(!S.locs[i].rev) continue; const v=total("p",i)-total("e",i); if(v>bv){bv=v;best=i;} } return best; });
         await pg.click('[data-act="oathmode"]'); await W(pg,500); await pg.click(`[data-act="oathpick"][data-li="${li}"]`); await W(pg,700); await pg.click('[data-act="oathok"]'); await W(pg,4800); } } }
   const plan=await pg.evaluate(()=>aiPlan("p",6).map(x=>({uid:x.c.uid,li:x.li})));
   for(const m of plan){ const h=await pg.$(`[data-act="hand"][data-uid="${m.uid}"]`); if(!h) continue; await h.click(); await W(pg,450); await pg.click(`.loc[data-li="${m.li}"]`); await W(pg,650); }
   await W(pg,400); await pg.click('[data-act="end"]'); await W(pg,600); await idle(pg); }
 async function playGame(pg,opt={}){ for(let t=0;t<8;t++){ if(await pg.evaluate(()=>!!S.over)) break; await playTurn(pg,{oath:opt.oath&&t>=1&&t<=4?opt.oath:null}); }
   await pg.waitForFunction(()=>S.over&&!S.over.hold,null,{timeout:20000}).catch(()=>{}); await W(pg,2500); return pg.evaluate(()=>S.over&&S.over.res); }

 /* 1. Accueil puis Tirage avec une ultra-légendaire */
 await clip('1-accueil-tirage-ultra',async pg=>{
   await W(pg,1500); await pg.mouse.wheel(0,500); await W(pg,1500); await pg.mouse.wheel(0,-500); await W(pg,800);
   await pg.click('.tabbar [data-to="shop"], [data-act="go"][data-to="shop"]').catch(()=>{}); await W(pg,1500);
   await pg.evaluate(()=>ouvrirTirage({res:[{id:"ulya",isNew:true},{id:"lilith",isNew:true},{id:"coursier",isNew:false,v:10}],name:"La Brèche",img:"images/packs/breche.webp",pid:"breche",price:300}));
   await W(pg,1600); const bx=await (await pg.$('.t-pack')).boundingBox();
   await pg.mouse.move(bx.x+20,bx.y+bx.height*0.3); await pg.mouse.down(); for(let i=1;i<=20;i++){ await pg.mouse.move(bx.x+20+(bx.width-40)*i/20,bx.y+bx.height*0.3+Math.sin(i/3)*6); await W(pg,35); } await pg.mouse.up();
   await pg.waitForFunction(()=>/choisis|touche/i.test((document.querySelector('.t-status')||{}).textContent||''),null,{timeout:15000}).catch(()=>{}); await W(pg,800);
   const order=await pg.evaluate(()=>[...document.querySelectorAll('.t-slot')].map((e,i)=>({i,u:/h-U/.test(e.className)})).sort((a,b)=>a.u-b.u).map(x=>x.i));
   for(const i of order){ await pg.click(`.t-slot >> nth=${i}`,{force:true}).catch(()=>{}); await W(pg,i===order[order.length-1]?7000:2600); await pg.mouse.click(195,420); await W(pg,1200); }
   await pg.waitForSelector('.t-end:not([hidden])',{timeout:15000}).catch(()=>{}); await W(pg,2500); });

 /* 2. Partie classée : l'adversaire jure, tu relèves son Serment (Serment croisé) — on garde une victoire */
 for(let k=0;k<12;k++){ const ok=await clip('2-partie-serment-croise',async pg=>{
   await pg.click('button.play'); await W(pg,900); await pg.click('[data-act="play"]').catch(()=>{}); await W(pg,1200);
   await pg.evaluate(()=>{ if(S&&S.rival) S.rival.mood="zele"; S.aiTier=Math.min(S.aiTier,3); });
   const r=await playGame(pg,{oath:'cross'}); const ok=await pg.evaluate(()=>S.oath!=null&&S.oath===S.aiOath&&leader(S.oath)==="p"); if(r==='win'&&ok){ await pg.screenshot({path:path.join(OUT,'itch','capture-victoire.png')}); await W(pg,1500); } return r==='win'&&ok; }); if(ok||which!=='all'&&which!=='2-partie-serment-croise') break; }

 /* 3. Chronique : le boss sur le Trône (×2), victoire, puis bilan */
 for(let k=0;k<6;k++){ const ok=await clip('3-chronique-boss-trone',async pg=>{
   await pg.evaluate(()=>{ P.ch={run:{step:2,deck:P.deck.slice(),over:false,tries:0},paid:2,done:0,title:false}; screen="chron"; render(); }); await W(pg,1800);
   await pg.click('[data-act="chplay"]'); await W(pg,1200); await pg.evaluate(()=>{ S.aiTier=2; });
   const r=await playGame(pg,{oath:'any'}); if(r!=='win') return false;
   await pg.click('.result [data-act="go"][data-to="chron"]').catch(()=>{}); await W(pg,3500); return true; }); if(ok||which!=='all'&&which!=='3-chronique-boss-trone') break; }

 /* 4. Collection : défilement, une ultra-légendaire holo agrandie */
 await clip('4-collection-holo',async pg=>{
   await pg.click('[data-act="go"][data-to="deck"]').catch(()=>{}); await W(pg,1500);
   for(let i=0;i<4;i++){ await pg.mouse.wheel(0,350); await W(pg,700); }
   await pg.evaluate(()=>{ zoomId="ananke"; render(); }); await W(pg,1500);
   const box=await pg.$('.zoom, .bigcard, .holo, canvas'); const bb=box?await box.boundingBox():{x:100,y:200,width:190,height:300};
   for(let i=0;i<60;i++){ await pg.mouse.move(bb.x+bb.width*(0.2+0.6*(0.5+0.5*Math.sin(i/8))),bb.y+bb.height*(0.3+0.4*(0.5+0.5*Math.cos(i/10)))); await W(pg,60); }
   await W(pg,1000); });
 await b.close(); srv.close();
})();
