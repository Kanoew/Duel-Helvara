#!/usr/bin/env node
/* Duel d'Helvara : un vrai duel en ligne entre deux navigateurs séparés (deux profils), sans réseau. Environ 2 minutes.
   Usage : node outils/tests-duel.js          (code de sortie 1 si un test échoue)
   Le salon Supabase est remplacé par un salon simulé (cloud.js factice) : les messages passent par Node, dans l'ordre, avec 20 à 220 ms de délai.
   Vérifie : coups scellés (aucun joueur ne voit les coups de l'autre avant d'avoir fini), parties identiques des deux côtés,
   reprise après rechargement en plein tour, et refus d'un coup tricheur (carte posée sans assez d'énergie). */
const fs=require("fs"),path=require("path"),http=require("http");
const ROOT=path.resolve(__dirname,"..");
function loadPlaywright(){ for(const p of ["playwright","/opt/node-tools/node_modules/playwright"]){ try{ return require(p); }catch(e){} } console.error("Playwright introuvable (voir CLAUDE.md, section Tests)."); process.exit(1); }
const {chromium}=loadPlaywright();
const TYPES={".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",".png":"image/png",".mp3":"audio/mpeg",".json":"application/json"};
const FAKE=`(function(){ const rooms={}; window.__recv=m=>{ const r=rooms[m.name]; if(r) r.recv(m); }; window.__drop=()=>{ for(const r of Object.values(rooms)) r.dropAll(); };
  function makeRoom(name){ const key="t"+Math.random().toString(36).slice(2,8); let state={}, others={}, cb=null, q=Promise.resolve();
    const send=type=>{ const msg={name,key,type,p:JSON.parse(JSON.stringify(state))}; q=q.then(()=>new Promise(r=>setTimeout(r,20+Math.random()*200))).then(()=>window.__send(msg)); };
    const room={list:[], rebuild(){ room.list=[{by:"me",presence:state,sameTab:true,isMe:true},...Object.entries(others).map(([k,p])=>({by:k,presence:p,sameTab:false,isMe:false}))]; if(cb) cb(); },
      recv(m){ if(m.key===key) return; if(m.type==="leave") delete others[m.key]; else { others[m.key]=m.p; if(m.type==="hello") send("state"); } room.rebuild(); },
      presence(patch){ state=Object.assign({},state,patch); send("state"); setTimeout(()=>room.rebuild(),0); return Promise.resolve(); },
      peers(){ return room.list; }, dropAll(){ others={}; room.rebuild(); }, onPeers(c){ cb=c; if(room.list.length) c(); }, leave(){ cb=null; send("leave"); delete rooms[name]; } };
    rooms[name]=room; send("hello"); return room; }
  window.claude={ async use(n){ return typeof n==="string"&&n.startsWith("room:")?makeRoom(n.slice(5)):null; } }; })();`;
const STAGE=(cheat)=>{ S.staged=[]; if(cheat){ const c=S.hand.p.slice().sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; window.__cheat=c&&{id:c.id,cost:CARDS[c.id].cost,en:S.energy}; if(c){ S.hand.p=S.hand.p.filter(x=>x!==c); S.staged.push({c,li:0}); } }
  else for(let k=0;k<10;k++){ const c=S.hand.p[Math.floor(Math.random()*S.hand.p.length)], li=Math.floor(Math.random()*3); if(!c||!canStage(c,li)) continue;
    const fx=(c.id==="ulya"||c.id==="ereshkigal_n")?costFor("p",c.id,li,S.staged.length===0):null; S.hand.p=S.hand.p.filter(x=>x!==c); S.staged.push(fx!=null?{c,li,fixed:fx}:{c,li}); }
  endTurn(); };
(async()=>{
  const srv=http.createServer((q,r)=>{ let f=path.join(ROOT,decodeURIComponent(q.url.split("?")[0])); if(f.endsWith("/")) f+="index.html";
    fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{"content-type":TYPES[path.extname(f)]||"application/octet-stream"}); r.end(d); }); }).listen(0);
  const port=srv.address().port, browser=await chromium.launch(); const pages=[], errs=[];
  for(const who of ["A","B"]){ const ctx=await browser.newContext({serviceWorkers:"block"}); const pg=await ctx.newPage();
    pg.on("pageerror",e=>errs.push(who+": "+e.message));
    await pg.route("**/vendor/supabase.js*",r=>r.fulfill({contentType:"text/javascript",body:"window.supabase=undefined"}));
    await pg.route("**/cloud.js*",r=>r.fulfill({contentType:"text/javascript",body:FAKE}));
    await pg.addInitScript(()=>{ window.__today="2026-12-31"; });
    await pg.exposeFunction("__send",m=>{ const o=pages[who==="A"?1:0]; return o&&o.evaluate(x=>window.__recv(x),m).catch(()=>{}); });
    await pg.goto(`http://127.0.0.1:${port}/index.html`); await pg.waitForFunction(()=>typeof mpCreate==="function"&&typeof P==="object");
    await pg.evaluate(n=>{ P.name=n; P.owned=POOL.slice(); const ok=POOL.filter(id=>!ULof(id)&&!CARDS[id].base); for(let i=ok.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ok[i],ok[j]]=[ok[j],ok[i]]; } P.deck=ok.slice(0,12); },"Joueur"+who);
    pages.push(pg); }
  const [A,B]=pages; const st=pg=>pg.evaluate(()=>S&&S.mp?{turn:S.turn,busy:S.busy,over:S.over&&S.over.res,locked:S.mp.locked,bad:S.mp.bad||0}:null);
  const until=async(f,ms=60000)=>{ const t0=Date.now(); while(Date.now()-t0<ms){ if(await f()) return true; await new Promise(r=>setTimeout(r,100)); } return false; };
  async function game(cheatTurn,reloadTurn){
    await A.evaluate(()=>mpCreate()); const code=await A.evaluate(()=>myMp.code); await B.evaluate(c=>mpJoinCode(c),code);
    if(!await until(async()=>{ const a=await st(A), b=await st(B); return a&&b&&a.turn===1&&b.turn===1&&!a.busy&&!b.busy; })) throw new Error("le duel ne démarre pas");
    let peek=[], cheat=null;
    for(let t=1;t<=6;t++){
      await B.evaluate(STAGE, t===cheatTurn); if(t===cheatTurn) cheat=await B.evaluate(()=>window.__cheat);
      await until(async()=>(await A.evaluate(()=>S.mp.oppLocked)),10000);
      if(t===reloadTurn){ await B.reload(); await A.evaluate(()=>window.__drop()); await B.waitForFunction(()=>typeof mpResume==="function"&&typeof P==="object"); await B.evaluate(()=>{ if(!(S&&S.mp)) mpResume(); });
        if(!await until(async()=>{ const b=await st(B); return b&&b.turn===t&&b.locked&&!b.busy; },20000)) throw new Error("reprise ratée "+JSON.stringify(await st(B))); }
      peek.push(await A.evaluate(t=>{ const o=mpOpp(); return !!(o&&o.presence.mp.hist&&o.presence.mp.hist[t]); },t));   /* A voit-il les coups de B avant d'avoir fini ? */
      await A.evaluate(STAGE,false);
      if(!await until(async()=>{ const a=await st(A), b=await st(B); return a&&b&&!a.busy&&!b.busy&&((a.turn>t&&b.turn>t)||(a.over&&b.over)); },90000)) throw new Error("tour "+t+" bloqué "+JSON.stringify([await st(A),await st(B)]));
    }
    const fin=pg=>pg.evaluate(()=>({res:S.over&&S.over.res,tot:[0,1,2].map(li=>[total("p",li),total("e",li)]),bad:S.mp.bad||0,log:S.log.filter(l=>/refus/.test(l))}));
    const a=await fin(A), b=await fin(B);
    await A.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; }); await B.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; });
    for(const pg of [A,B]) await pg.evaluate(()=>{ P.owned=POOL.slice(); if(P.deck.length!==12) P.deck=POOL.filter(id=>!ULof(id)&&!CARDS[id].base).slice(0,12); });
    return {a,b,peek,cheat};
  }
  const mirror=(a,b)=>a.tot.every((x,i)=>x[0]===b.tot[i][1]&&x[1]===b.tot[i][0]), opp={win:"lose",lose:"win",draw:"draw"};
  const res=[]; const T=(n,ok,d)=>res.push([n,!!ok,d]);
  const same=(r)=>mirror(r.a,r.b)&&opp[r.a.res]===r.b.res;
  { const r=await game(0,0); T("Duel honnête : même partie sur les deux téléphones, aucun refus",same(r)&&!r.a.bad&&!r.b.bad,JSON.stringify([r.a.res,r.b.res,r.a.bad,r.b.bad]));
    T("Coups scellés : aucun joueur ne voit les coups de l'autre avant d'avoir fini son tour",!r.peek.some(Boolean),JSON.stringify(r.peek)); }
  { const r=await game(0,3); T("Reprise : rechargement en plein tour (coups scellés, pas encore révélés), la partie continue à l'identique",same(r)&&!r.a.bad&&!r.b.bad,JSON.stringify([r.a.res,r.b.res])); }
  { const r=await game(2,0); T("Tricheur : carte posée sans assez d'énergie, refusée et notée chez l'adversaire",r.a.bad===1&&r.a.log.some(l=>/^Coup adverse refusé : .+ \(énergie insuffisante\)$/.test(l)),JSON.stringify([r.cheat,r.a.log])); }
  let bad=0; for(const [n,ok,d] of res){ if(!ok) bad++; console.log(`${ok?"ok      ":"PAS OK  "} ${n}${ok?"":"  → "+d}`); }
  if(errs.length){ bad++; console.log("PAS OK   erreurs de la page : "+errs.slice(0,3).join(" | ")); }
  console.log(`\n${res.length-bad} sur ${res.length} tests valides.`);
  await browser.close(); srv.close(); process.exit(bad?1:0);
})().catch(e=>{ console.error("ÉCHEC",e.message); process.exit(1); });
