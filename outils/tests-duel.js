#!/usr/bin/env node
/* Duel d'Helvara : un vrai duel en ligne entre deux navigateurs séparés (deux profils), sans réseau. Environ 2 minutes.
   Usage : node outils/tests-duel.js          (code de sortie 1 si un test échoue)
   Le salon Supabase est remplacé par un salon simulé (cloud.js factice) : les messages passent par Node, dans l'ordre, avec 20 à 220 ms de délai.
   Vérifie : graine commune (même tirage chez les deux, hôte tricheur refusé, revanche), coups scellés (aucun joueur ne voit les coups de l'autre avant d'avoir fini), parties identiques des deux côtés,
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
  window.claude={ async use(n){ if(n==="lobby") return makeRoom("lobby"); if(n==="db") return {mmSeek:(v,r)=>window.__mm(v,r), mmLeave:()=>window.__mmLeave(), duelEnter:(r,g,ro,v)=>window.__dEnter(r,g,ro,v), duelReport:(r,g,ro,res,h,rec)=>window.__dReport(r,g,ro,res,h,rec)};
    return typeof n==="string"&&n.startsWith("room:")?makeRoom(n.slice(5)):null; } }; })();`;
/* File d'attente de la base simulée : mêmes règles que mm_seek (file-attente.sql) */
const MM={};
function mmSeek(who,ver,room){ const now=Date.now(); for(const k in MM) if(now-MM[k].seen>20000) delete MM[k];
  const mine=MM[who]; if(mine&&mine.room){ delete MM[who]; return {ok:true,room:mine.room,role:"guest"}; }
  if(!mine) MM[who]={ver,joined:now,seen:now,room:null}; else { mine.seen=now; mine.ver=ver; }
  const foe=Object.keys(MM).filter(k=>k!==who&&MM[k].ver===ver&&!MM[k].room&&now-MM[k].seen<8000).sort((a,b)=>MM[a].joined-MM[b].joined)[0];
  if(foe){ MM[foe].room=room; MM[foe].seen=now; delete MM[who]; return {ok:true,room,role:"host"}; }
  return {ok:true,room:null,waiting:Object.keys(MM).filter(k=>k!==who&&MM[k].ver===ver).length,other_ver:false}; }
/* Duels validés simulés : mêmes règles que duel_enter / duel_report (duels-valides.sql) ; « who » joue le rôle du compte */
const DG={};
function dEnter(who,room,g,role){ const k=room+"|"+g, d=DG[k]=DG[k]||{host:null,guest:null,status:"open"}; const o=role==="host"?"guest":"host";
  if(d[role]==null&&d[o]!==who){ d[role]=who; return {ok:true}; } return d[role]===who?{ok:true}:{ok:false,reason:"taken"}; }
function dReport(who,room,g,role,res,hash){ const d=DG[room+"|"+g]; if(!d) return {ok:false,reason:"unknown"}; if(d[role]!==who) return {ok:false,reason:"not_player"};
  const r=role[0]; if(d.status!=="open"||d[r+"res"]) return {ok:true,status:d.status}; d[r+"res"]=res; d[r+"hash"]=hash; const o=role==="host"?"g":"h";
  if(!d[o+"res"]) return {ok:true,status:"open"}; const m={win:"lose",lose:"win",draw:"draw"}[res];
  d.status=d[o+"res"]===m&&d[o+"hash"]===hash?"valid":"conflict"; return {ok:true,status:d.status}; }
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
    await pg.exposeFunction("__dEnter",(r,g,ro)=>dEnter(who,r,g,ro)); await pg.exposeFunction("__dReport",(r,g,ro,res,h)=>dReport(who,r,g,ro,res,h));
    await pg.exposeFunction("__mm",(v,r)=>mmSeek(who,v,r)); await pg.exposeFunction("__mmLeave",()=>{ delete MM[who]; });
    await pg.exposeFunction("__send",m=>{ const o=pages[who==="A"?1:0]; return o&&o.evaluate(x=>window.__recv(x),m).catch(()=>{}); });
    await pg.goto(`http://127.0.0.1:${port}/index.html`); await pg.waitForFunction(()=>document.readyState==="complete"&&typeof render==="function"&&typeof P==="object");
    await pg.evaluate(n=>{ P.name=n; P.tuto=true; P.owned=POOL.slice(); const ok=POOL.filter(id=>REL(id)&&!ULof(id)&&!CARDS[id].base); for(let i=ok.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ok[i],ok[j]]=[ok[j],ok[i]]; } P.deck=ok.slice(0,12); },"Joueur"+who);
    pages.push(pg); }
  const [A,B]=pages; const st=pg=>pg.evaluate(()=>S&&S.mp?{turn:S.turn,busy:S.busy,over:S.over&&S.over.res,locked:S.mp.locked,bad:S.mp.bad||0}:null);
  const until=async(f,ms=60000)=>{ const t0=Date.now(); while(Date.now()-t0<ms){ if(await f()) return true; await new Promise(r=>setTimeout(r,100)); } return false; };
  const deal=pg=>pg.evaluate(()=>S&&S.mp&&JSON.stringify(S.mp.deal));
  let resumeBtn="";
  async function game(cheatTurn,reloadTurn,rematch){
    await A.evaluate(()=>mpCreate()); const code=await A.evaluate(()=>myMp.code); await B.evaluate(c=>mpJoinCode(c),code);
    if(!await until(async()=>{ const a=await st(A), b=await st(B); return a&&b&&a.turn===1&&b.turn===1&&!a.busy&&!b.busy; })) throw new Error("le duel ne démarre pas");
    const deals=[[await deal(A),await deal(B)]];
    let peek=[], cheat=null;
    for(let m=0;m<(rematch?2:1);m++){
    if(m===1){ for(const pg of [A,B]) await pg.evaluate(()=>{ S.mp.wantAgain=true; mpPush({again:myMp.g}); mpTick(); });   /* revanche dans le même salon */
      if(!await until(async()=>{ const a=await st(A), b=await st(B); return a&&b&&a.turn===1&&b.turn===1&&!a.over&&!b.over&&!a.busy&&!b.busy; })) throw new Error("la revanche ne démarre pas");
      deals.push([await deal(A),await deal(B)]); }
    for(let t=1;t<=6;t++){
      await B.evaluate(STAGE, t===cheatTurn); if(t===cheatTurn) cheat=await B.evaluate(()=>window.__cheat);
      await until(async()=>(await A.evaluate(()=>S.mp.oppLocked)),10000);
      if(t===reloadTurn){ await B.reload(); await A.evaluate(()=>window.__drop()); await B.waitForFunction(()=>document.readyState==="complete"&&typeof render==="function"&&typeof P==="object"); resumeBtn=await B.evaluate(()=>{ if(S&&S.mp) return "déjà repris"; screen="home"; render(); const b=document.querySelector('button.play[data-act="mpresume"]'); if(!b) return "absent"; b.click(); return b.textContent; });
        if(!await until(async()=>{ const b=await st(B); return b&&b.turn===t&&b.locked&&!b.busy; },20000)) throw new Error("reprise ratée "+JSON.stringify(await st(B))); }
      peek.push(await A.evaluate(t=>{ const o=mpOpp(); return !!(o&&o.presence.mp.hist&&o.presence.mp.hist[t]); },t));   /* A voit-il les coups de B avant d'avoir fini ? */
      await A.evaluate(STAGE,false);
      if(!await until(async()=>{ const a=await st(A), b=await st(B); return a&&b&&!a.busy&&!b.busy&&((a.turn>t&&b.turn>t)||(a.over&&b.over)); },90000)) throw new Error("tour "+t+" bloqué "+JSON.stringify([await st(A),await st(B)]));
    } }
    await until(async()=>{ const x=await A.evaluate(()=>S.mp.srv), y=await B.evaluate(()=>S.mp.srv); return x&&y&&x!=="open"&&y!=="open"; },25000);
    const fin=pg=>pg.evaluate(()=>({srv:S.mp.srv,res:S.over&&S.over.res,tot:[0,1,2].map(li=>[total("p",li),total("e",li)]),bad:S.mp.bad||0,log:S.log.filter(l=>/refus/.test(l))}));
    const a=await fin(A), b=await fin(B);
    await A.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; }); await B.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; });
    for(const pg of [A,B]) await pg.evaluate(()=>{ P.owned=POOL.slice(); if(P.deck.length!==12) P.deck=POOL.filter(id=>REL(id)&&!ULof(id)&&!CARDS[id].base).slice(0,12); });
    return {a,b,peek,cheat,deals};
  }
  const mirror=(a,b)=>a.tot.every((x,i)=>x[0]===b.tot[i][1]&&x[1]===b.tot[i][0]), opp={win:"lose",lose:"win",draw:"draw"};
  const res=[]; const T=(n,ok,d)=>res.push([n,!!ok,d]);
  const same=(r)=>mirror(r.a,r.b)&&opp[r.a.res]===r.b.res;
  /* ===== Lot B : « Jouer » cherche un humain 15 s s'il y en a un de libre, sinon l'IA tout de suite ===== */
  { const home=pg=>pg.evaluate(()=>{ if(S&&S.mp) mpClear(); mpSaveSession(null); S=null; sheet=null; screen="home"; render(); });
    const play=async pg=>{ await pg.evaluate(()=>{ sheet="play"; render(); }); await pg.evaluate(()=>document.querySelector('.sheet [data-act="play"]').click()); };
    const mode=pg=>pg.evaluate(()=>S&&!S.over?(S.mp?"humain":"ia"):(mq&&mq.jouer?"recherche":"rien"));
    await home(A); await home(B);
    const seen=await until(()=>A.evaluate(()=>lobFree()===1),10000);
    T("Présence : chaque jeu voit l'autre joueur libre, sans identifiant de compte",seen&&await A.evaluate(()=>lob.peers().every(p=>p.by==null||p.sameTab||!/^[0-9a-f-]{36}$/.test(p.by))),"");
    await play(A); const searching=await mode(A)==="recherche", sheetTxt=await A.evaluate(()=>document.querySelector(".modesheet")?.textContent||"");
    const banner=await until(()=>B.evaluate(()=>/Un joueur cherche un adversaire/.test(homeNotes())),5000);
    T("Jouer : un joueur libre en ligne, la recherche démarre avec un compte à rebours",searching&&/Recherche d'un adversaire… \d+ s/.test(sheetTxt),sheetTxt);
    T("Jouer : l'autre joueur voit « Un joueur cherche un adversaire » à l'accueil",banner,"");
    await play(B);
    const met=await until(async()=>(await mode(A))==="humain"&&(await mode(B))==="humain",20000);
    T("Jouer : les deux appuient sur Jouer, ils se retrouvent en duel (pas contre l'IA)",met&&await A.evaluate(()=>JSON.stringify(S.mp.deal))===await B.evaluate(()=>JSON.stringify(S.mp.deal)),JSON.stringify([await mode(A),await mode(B)]));
    await home(A); await home(B); await until(()=>A.evaluate(()=>lobFree()===1),10000);
    const t0=Date.now(); await play(A); const ai=await until(async()=>(await mode(A))==="ia",25000), waited=Date.now()-t0;
    T("Jouer : l'autre est en ligne mais ne joue pas, l'IA après 15 s d'attente",ai&&waited>=14000&&waited<20000,waited+" ms");
    await home(A); await until(()=>A.evaluate(()=>lobFree()===1),10000);
    await play(A); await new Promise(r=>setTimeout(r,800)); await A.evaluate(()=>document.querySelector('[data-act="seekai"]').click()); const now=await mode(A), left=Object.keys(MM).length;
    T("Jouer : « Jouer contre l'IA maintenant » arrête la recherche et lance l'IA",now==="ia"&&left===0,now+" "+left);
    await home(A); await B.evaluate(()=>{ lobFull=true; lobClose(); }); await until(()=>A.evaluate(()=>lobFree()===0),10000);
    const t1=Date.now(); await play(A); const ai2=(await mode(A))==="ia";
    T("Jouer : personne d'autre en ligne, partie contre l'IA tout de suite",ai2&&Date.now()-t1<2000,(await mode(A))+" "+(Date.now()-t1)+" ms");
    await home(A); await B.evaluate(()=>{ lobFull=false; lobOpen(); }); await until(()=>A.evaluate(()=>lobFree()===1),10000); }
  { const r=await game(0,0); T("Duel honnête : même partie sur les deux téléphones, aucun refus",same(r)&&!r.a.bad&&!r.b.bad,JSON.stringify([r.a.res,r.b.res,r.a.bad,r.b.bad]));
    T("Résultat validé : partie honnête validée par le serveur chez les deux joueurs",r.a.srv==="valid"&&r.b.srv==="valid",JSON.stringify([r.a.srv,r.b.srv]));
    T("Coups scellés : aucun joueur ne voit les coups de l'autre avant d'avoir fini son tour",!r.peek.some(Boolean),JSON.stringify(r.peek)); }
  { const r=await game(0,0,true); T("Revanche dans le même salon : nouvelle partie, nouveau tirage, identique des deux côtés, validée",same(r)&&r.a.srv==="valid"&&r.deals.length===2&&r.deals.every(([x,y])=>x&&x===y)&&r.deals[0][0]!==r.deals[1][0],JSON.stringify(r.deals));
    T("Graine commune : même graine et mêmes lieux chez les deux joueurs",r.deals[0][0]===r.deals[0][1],JSON.stringify(r.deals[0])); }
  { /* hôte tricheur : il révèle un autre nombre que celui annoncé (pour choisir sa graine après avoir vu celui de l'invité) */
    await A.evaluate(()=>{ const f=mpHostDeal; mpHostDeal=om=>{ if(mpSecret) mpSecret.r="triche"+mpSecret.r.slice(6); return f(om); }; });
    await A.evaluate(()=>mpCreate()); const code=await A.evaluate(()=>myMp.code); await B.evaluate(c=>mpJoinCode(c),code);
    const refused=await until(()=>B.evaluate(()=>mpMsg===MP_DEAL_MSG),15000); await new Promise(r=>setTimeout(r,1500)); const bS=await st(B);
    T("Graine commune : hôte qui change son nombre après avoir vu celui de l'invité, partie refusée chez l'invité",refused&&!bS,JSON.stringify(bS));
    await A.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; location.reload(); }); await A.waitForFunction(()=>document.readyState==="complete"&&typeof render==="function"&&typeof P==="object");
    await A.evaluate(()=>{ P.owned=POOL.slice(); if(P.deck.length!==12) P.deck=POOL.filter(id=>REL(id)&&!ULof(id)&&!CARDS[id].base).slice(0,12); });
    await B.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; }); }
  { /* invité tricheur : client modifié qui envoie un deck avec une carte pas encore sortie */
    const bad=await B.evaluate(()=>{ const later=POOL.find(id=>CARDS[id].rel&&CARDS[id].rel>"2027-01-05"&&!ULof(id)); mpDeckWhy=()=>""; const keep=P.deck.slice(); P.deck=[later,...keep.filter(x=>x!==later)].slice(0,12); window.__keep=keep; return later; });
    await A.evaluate(()=>mpCreate()); const code=await A.evaluate(()=>myMp.code); await B.evaluate(c=>mpJoinCode(c),code);
    const refused=await until(()=>A.evaluate(()=>/^Deck adverse refusé \(.+ pas encore sortie\)/.test(mpMsg)),15000); await new Promise(r=>setTimeout(r,1500));
    const started=[await st(A),await st(B)];
    T("Deck adverse : carte pas encore sortie refusée par l'hôte, aucune partie ne démarre",refused&&!started[0]&&!started[1],JSON.stringify([bad,started]));
    await B.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; location.reload(); }); await B.waitForFunction(()=>document.readyState==="complete"&&typeof render==="function"&&typeof P==="object");
    await B.evaluate(()=>{ P.owned=POOL.slice(); if(P.deck.length!==12) P.deck=POOL.filter(id=>REL(id)&&!ULof(id)&&!CARDS[id].base).slice(0,12); });
    await A.evaluate(()=>{ mpClear(); mpSaveSession(null); S=null; screen="home"; }); }
  { const r=await game(0,3); T("Reprise : rechargement en plein tour (coups scellés, pas encore révélés), la partie continue à l'identique",same(r)&&!r.a.bad&&!r.b.bad,JSON.stringify([r.a.res,r.b.res]));
    T("Reprise : après rechargement, le gros bouton de l'accueil devient « Reprendre le duel » et reprend la partie",resumeBtn==="Reprendre le duel",resumeBtn);
    T("Résultat validé : aussi après un rechargement en plein tour",r.a.srv==="valid"&&r.b.srv==="valid",JSON.stringify([r.a.srv,r.b.srv])); }
  { const r=await game(2,0); T("Tricheur : carte posée sans assez d'énergie, refusée et notée chez l'adversaire",r.a.bad===1&&r.a.log.some(l=>/^Coup adverse refusé : .+ \(énergie insuffisante\)$/.test(l)),JSON.stringify([r.cheat,r.a.log]));
    T("Résultat validé : partie avec un coup tricheur en désaccord, jamais validée",r.a.srv==="conflict"&&r.b.srv==="conflict",JSON.stringify([r.a.srv,r.b.srv])); }
  let bad=0; for(const [n,ok,d] of res){ if(!ok) bad++; console.log(`${ok?"ok      ":"PAS OK  "} ${n}${ok?"":"  → "+d}`); }
  if(errs.length){ bad++; console.log("PAS OK   erreurs de la page : "+errs.slice(0,3).join(" | ")); }
  console.log(`\n${res.length-bad} sur ${res.length} tests valides.`);
  await browser.close(); srv.close(); process.exit(bad?1:0);
})().catch(e=>{ console.error("ÉCHEC",e.message); process.exit(1); });
