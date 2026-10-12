/* Duel d'Helvara : boutique, Blitz, duels entre amis et file d'attente en ligne.
   Extrait d'index.html le 12 octobre 2026 sans aucun changement de code : les fichiers js/ se chargent dans l'ordre d'index.html et partagent la même portée globale. */
/* ======= BOUTIQUE ======= */
function rollRarity(odds){ let x=Math.random()*100; for(const [r,w] of odds){ if(x<w) return r; x-=w; } return odds[0][0]; }
function starterRoll(){
  const pool=PACK().filter(id=>CARDS[id].r!=="L");
  for(let t=0;t<500;t++){
    const ep=shuffle(pool.filter(id=>CARDS[id].r==="E")).slice(0,2);
    const rest=shuffle(pool.filter(id=>CARDS[id].r!=="E")).slice(0,10);
    const d=[...ep,...rest], cheap=d.filter(id=>CARDS[id].cost<=2).length, big=d.filter(id=>CARDS[id].cost>=5).length;
    if(cheap>=4&&big>=2&&big<=4) return d;
  }
  return [...STARTER];
}
/* Un paquet peut-il être acheté maintenant ? (même règle pour le bouton de la boutique et « Ouvrir un autre paquet ») */
function packBuyable(pk){
  if(!pk) return false;
  if(!pk.starter&&!PACK(pk.id).some(id=>!P.owned.includes(id)&&pk.odds.some(o=>o[0]===CARDS[id].r))) return false;
  return !(P.chf<pk.price||(pk.starter&&P.starter)||!inWin(pk.win)||(!pk.starter&&!P.starter));
}
function buyPack(pid){
  const pk=PACKS.find(x=>x.id===pid); if(!packBuyable(pk)) return;
  P.chf-=pk.price;
  let got;
  if(pk.starter){ got=starterRoll(); P.starter=true; hlStarter=false; }
  else {
    const allowed=pk.odds.map(o=>o[0]);
    got=[]; for(let i=0;i<pk.n;i++){ const r=rollRarity(pk.odds); got.push(pickRand(PACK(pk.id).filter(id=>CARDS[id].r===r))); }
    const missing=PACK(pk.id).filter(id=>!P.owned.includes(id)&&allowed.includes(CARDS[id].r));
    const exc=PACK(pk.id).filter(id=>CARDS[id].ex===pk.id&&!P.owned.includes(id)); if(exc.length&&!got.some(id=>CARDS[id].ex===pk.id)) got[2]=pickRand(exc);
    if(missing.length && !got.some(id=>missing.includes(id))){
      const r=rollRarity(pk.odds); const m=missing.filter(id=>CARDS[id].r===r);
      got[0]=pickRand(m.length?m:missing);
    }
  }
  const res=[]; let refund=0; const seen=new Set();
  for(const id of got){
    if(P.owned.includes(id)||seen.has(id)){ const v=ECO.dup[CARDS[id].r]||10; refund+=v; res.push({id,isNew:false,v}); }
    else { P.owned.push(id); seen.add(id); res.push({id,isNew:true}); }
  }
  if(pk.starter && P.deck.length<ECO.deckSize){ const pick=[...new Set([...P.deck,...got])].filter(id=>P.owned.includes(id)); P.deck=pick.slice(0,ECO.deckSize); }
  P.chf+=refund; lastPack={res,refund,name:pk.name,pid}; packOpen={res,name:pk.name,img:pk.img};
  save();
  render();
  ouvrirTirage({res,name:pk.name,img:pk.img,pid,price:pk.price}); /* js/ouverture.js : « Le Tirage » (les sons sont joués pendant l'animation) */
}


/* ======= ÉCHOPPE DU JOUR ======= */
const STALL={R:200,E:400};
function hashStr(t){ let h=2166136261; for(const ch of t){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
function stallPick(){ const day=today(), rnd=mulberry(hashStr(day+"|"+(lbUid||"local")));
  const pool=r=>PACK().filter(id=>CARDS[id].r===r&&!CARDS[id].ex);
  const pick=(arr,n)=>{ const a=[...arr].sort(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } const fresh=a.filter(id=>!P.owned.includes(id)); return [...fresh,...a.filter(id=>P.owned.includes(id))].slice(0,n); };
  return [...pick(pool("R"),2),...pick(pool("E"),1)]; }
let stallCache={day:"",ids:[]};
function stallIds(){ const d=today()+"|"+(lbUid||"local"); if(stallCache.day!==d){ stallCache={day:d,ids:stallPick()}; } return stallCache.ids; }
function stallBuy(id){ if(!stallIds().includes(id)||P.owned.includes(id)||!P.starter) return; const pr=STALL[CARDS[id].r]; if(!pr||P.chf<pr) return;
  if(P.sb.day!==today()) P.sb={day:today(),ids:[]}; P.chf-=pr; P.owned.push(id); P.sb.ids.push(id); save(); sfx(CARDS[id].r==="E"?"legend":"rare"); zoomId=id; render(); }
function stallHTML(){ if(!P.starter) return ""; const ids=stallIds();
  return `<section class="sec stall"><div class="deckhead"><h2>Échoppe du jour</h2><span class="hint">Nouvelle sélection dans ${hoursToReset()} h</span></div>
    <p class="hint">Trois cartes au choix chaque jour, à prix fixe : ${STALL.R} CHF la Rare, ${STALL.E} CHF l'Épique. Les cartes que tu n'as pas passent en priorité.</p>
    <div class="stallgrid">${ids.map(id=>{ const own=P.owned.includes(id), pr=STALL[CARDS[id].r];
      return `<div class="cell"><button class="zoombtn" data-act="zoom" data-id="${id}" aria-label="Agrandir ${CARDS[id].name}">${fullCard(id)}</button>
        <button class="primary small" data-act="stallbuy" data-id="${id}" ${own||P.chf<pr?"disabled":""}>${own?"Déjà à toi":P.chf<pr?`${pr} CHF · il en manque ${pr-P.chf}`:`Acheter · ${pr} CHF`}</button></div>`; }).join("")}</div></section>`; }

/* ======= BLITZ ======= */
const BZ={start:["coursier","felix","celeste","izzy"], tiers:[2,4,6], gain:[0,75,150,300], price:75};
const bzFree=()=>!P.bz||P.bz.day!==today()||!P.bz.used;
function bzRoll(deck){ const chars=new Set(deck.map(charOf)); const pool=shuffle(POOL.filter(id=>REL(id)&&CARDS[id].r!=="U"&&!chars.has(charOf(id))&&!(id==="yarden_d"&&chars.has("yarden")))); const out=[], seen=new Set();
  for(const id of pool){ if(out.length>=4) break; if(seen.has(charOf(id))) continue; seen.add(charOf(id)); out.push(id); } return out; }
function bzStart(){ if(P.bz.run&&!P.bz.run.over) return;
  if(bzFree()){ P.bz.day=today(); P.bz.used=true; } else { if(P.chf<BZ.price) return; P.chf-=BZ.price; }
  const deck=[...BZ.start]; P.bz.run={deck,opts:bzRoll(deck),wins:0,over:false,gain:0}; save(); sfx("pack"); render(); }
function bzPick(id){ const r=P.bz.run; if(!r||r.over||!r.opts.includes(id)||r.deck.length>=12) return; r.deck.push(id); r.opts=r.deck.length<12?bzRoll(r.deck):[]; save(); sfx("select"); render(); }
function bzEndRun(){ const r=P.bz.run; if(!r||r.over) return; r.over=true; r.gain=BZ.gain[r.wins]; P.chf+=r.gain; save(); if(r.gain) setTimeout(()=>sfx("coin"),500); }
function bzGame(){ const r=P.bz.run; if(!r||r.over||r.deck.length<12) return;
  RNG=Math.random; const locIds=shuffle(locPool()).slice(0,3); games++;
  const t=BZ.tiers[r.wins];
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:locIds.map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:shuffle(r.deck.map(mk)), e:[]}, aiTier:t, aiFac:null,
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null, blitz:true};
  const ai=aiDeck(t,true); S.deck.e=shuffle(ai.deck.map(mk)); S.aiFac=ai.fac;
  for(let i=0;i<3;i++){draw("p");draw("e");}
  log(`Blitz · match ${r.wins+1}/3 · adversaire ${FAC[ai.fac].n}, niveau ${TIERS[t]}`);
  screen="play"; startTurn(); }
function blitzHTML(){
  const r=P.bz.run, free=bzFree();
  const ladder=`<div class="bzladder">${[1,2,3].map(n=>`<div class="bzstep ${r&&r.wins>=n?"on":""}"><b>${BZ.gain[n]} CHF</b><span>${n} victoire${n>1?"s":""} · IA ${TIERS[BZ.tiers[n-1]]}</span></div>`).join("")}</div>`;
  const strip=r?`<div class="strip">${Array.from({length:12},(_,i)=>r.deck[i]?thumb(r.deck[i],`data-act="zoom" data-id="${r.deck[i]}"`):`<div class="thumb empty"></div>`).join("")}</div>`:"";
  let body;
  if(!r) body=`<section class="sec"><h2>Blitz</h2>
    <p>Construis un deck sur le moment et enchaîne 3 matchs de plus en plus durs. Tu commences avec le Coursier du Flon, Félix, Céleste et Izzy, puis tu choisis 8 cartes, une parmi 4 à chaque fois. Toutes les cartes sorties peuvent apparaître, même celles que tu n'as pas. Pas d'ultra-légendaire.</p>
    <p>Une défaite termine le Blitz. Tu repars avec la récompense du palier atteint. Le Blitz ne compte pas pour ton rang.</p>
    ${ladder}
    <button class="play" data-act="bzstart" ${free||P.chf>=BZ.price?"":"disabled"}>${free?"Lancer le Blitz du jour · gratuit":P.chf>=BZ.price?`Lancer un Blitz · ${BZ.price} CHF`:`Il manque ${BZ.price-P.chf} CHF`}</button>
    <div class="hint">${free?"Une partie gratuite par jour.":`Ta partie gratuite revient dans ${hoursToReset()} h.`}</div></section>`;
  else if(r.over) body=`<section class="sec"><h2>Blitz terminé</h2>
    <div class="reward">${r.gain?`+${r.gain} CHF`:"Aucune récompense"}</div>
    <p>${r.wins} victoire${r.wins>1?"s":""} sur 3${r.wins===3?" : Blitz parfait.":"."}</p>${ladder}${strip}
    <button class="play" data-act="bzclear">Terminer</button></section>`;
  else if(r.deck.length<12) body=`<section class="sec"><div class="deckhead"><h2>Choix ${r.deck.length-3} / 8</h2><span class="count">${r.deck.length} / 12</span></div>
    <p>Choisis une carte. Appui sur une carte de ton deck pour la revoir.</p>
    <div class="bzopts">${r.opts.map(id=>`<button class="pick" data-act="bzpick" data-id="${id}">${fullCard(id)}</button>`).join("")}</div></section>
    <section class="sec"><h2>Ton deck</h2>${strip}</section>`;
  else body=`<section class="sec"><h2>Match ${r.wins+1} / 3</h2>
    <p>Adversaire de niveau <b>${TIERS[BZ.tiers[r.wins]]}</b>. ${r.wins?`Tu tiens déjà ${BZ.gain[r.wins]} CHF.`:"Gagne pour décrocher ta première récompense."}</p>
    ${ladder}<button class="play" data-act="bzplay">${S&&S.blitz&&!S.over?"Reprendre le match":"Jouer le match"}</button>${strip}</section>`;
  return body+(r&&!r.over?`<button class="ghost" data-act="bzquit">Abandonner le Blitz${r.wins?` et prendre ${BZ.gain[r.wins]} CHF`:""}</button>`:"");
}

/* ======= DUEL ENTRE AMIS ======= */
/* BUILD : version du moteur de duel. Deux joueurs de versions différentes se désynchroniseraient (lockstep) : le match est refusé.
   À changer à chaque modification qui touche au déroulement d'une partie (effets, lieux, tirage, IA du serment…). */
const BUILD="alpha-0.4", MP_VER_MSG="Version différente : recharge la page";
const MP_KEY="duel-helvara-mp", MP_PLACES=["OUCHY","FLON","RUELLE","FAILLE","VOILE","SOUSGARE","LEMAN"];
let roomC=null, roomQ=null, roomTried=false, myMp=null, mpMsg="", mpConn=false;
const mpTok=()=>Math.random().toString(36).slice(2,10);
function mpSession(){ try{ const s=JSON.parse(localStorage.getItem(MP_KEY)); return s&&s.mp&&Date.now()-s.at<3*36e5?s:null; }catch(e){ return null; } }
function mpSaveSession(s){ try{ if(s){ s.at=Date.now(); localStorage.setItem(MP_KEY,JSON.stringify(s)); } else localStorage.removeItem(MP_KEY); }catch(e){} }
/* Temps réel : plus de salon commun où tout le monde voit tout le monde. On ne se connecte que pour un duel :
   un canal par code de salon (« roomC », deux joueurs), et le canal de la file d'attente (« roomQ ») seulement
   pendant une recherche. Un joueur qui joue contre l'IA n'ouvre aucune connexion en direct. */
const rtReady=()=>!!(window.claude&&window.claude.use), rtTok={c:0,q:0}, MP_CODE=/^[A-Z]+-\d{4}$/;
const RT_FAIL="Le salon en direct est injoignable pour l'instant. Vérifie ta connexion internet, puis réessaie.";
async function rtOpen(kind,name){
  const cur=kind==="c"?roomC:roomQ; if(cur&&cur.name===name) return cur;
  rtClose(kind); const t=rtTok[kind];
  let r=null; try{ r=await window.claude.use("room:"+name); }catch(e){ r=null; }
  if(!r) return null;
  if(t!==rtTok[kind]){ if(r.leave) r.leave(); return null; } /* fermé pendant la connexion */
  r.name=name;
  r.onPeers(()=>{ mqTick(); mpTick(); }, e=>{ mpMsg="Connexion au salon perdue. Recharge la page."; render(); });
  if(kind==="c") roomC=r; else roomQ=r;
  return r;
}
function rtClose(kind){ rtTok[kind]++; const r=kind==="c"?roomC:roomQ; if(kind==="c") roomC=null; else roomQ=null; if(r&&r.leave) r.leave(); }
function initRoom(){ roomTried=true; render(); }
function mpPush(patch){ myMp=Object.assign({},myMp||{},patch); if(roomC) roomC.presence({mp:myMp}).catch(()=>{}); }
function mpClear(){ myMp=null; mpMsg=""; rtClose("c"); }
function mpBase(role,code){ return {v:1,ver:BUILD,code,role,tok:mpTok(),nick:P.name.slice(0,24),av:(P.avatar&&P.owned.includes(P.avatar))?P.avatar:null,deck:[...P.deck]}; }
async function mpCreate(){
  if(!rtReady()||!deckReady()||mpConn) return; myMp=null; mpMsg=""; mpConn=true; render();
  const code=MP_PLACES[Math.floor(Math.random()*MP_PLACES.length)]+"-"+(1000+Math.floor(Math.random()*9000));
  const r=await rtOpen("c","helvara-room-"+code); mpConn=false;
  if(!r){ mpMsg=RT_FAIL; render(); return; }
  mpPush(mpBase("host",code)); sfx("click"); render();
}
function mpJoin(){
  const i=document.getElementById("mp-code"); const code=(i&&i.value||"").trim().toUpperCase().replace(/\s+/g,"");
  if(!/^[A-Z]+-\d{4}$/.test(code)){ mpMsg="Le code ressemble à OUCHY-4821."; render(); return; }
  mpJoinCode(code);
}
async function mpJoinCode(code){
  if(!rtReady()||!deckReady()||mpConn||!MP_CODE.test(code||"")) return false; mpMsg=""; myMp=null; mpConn=true; render();
  const r=await rtOpen("c","helvara-room-"+code); mpConn=false;
  if(!r){ mpMsg=RT_FAIL; render(); return false; }
  mpPush(mpBase("guest",code)); sfx("click"); render(); return true;
}

/* ======= EN LIGNE (ALPHA) : file d'attente sans code =======
   Chaque joueur qui cherche publie q={tok,ver,at} dans la présence du canal de recherche (helvara-queue). Les jetons de même version
   (hors cet onglet, hors ce compte, hors joueurs déjà appariés) sont triés : 0 avec 1, 2 avec 3… Le plus petit des deux
   crée un salon normal (mpCreate) et publie q.room et q.with ; l'autre voit q.with = son jeton et rejoint ce code
   (mpJoinCode). Ensuite tout se passe comme un salon avec code. 90 s sans adversaire : la recherche s'arrête. */
const MQ_WAIT=90000, MQ_STALE=15000;
let mq=null; /* {tok, t0, timer, room, with, since} */
function mqPub(extra){ if(roomQ&&mq) roomQ.presence({q:{tok:mq.tok,ver:BUILD,at:mq.t0,...(extra||{})}}).catch(()=>{}); }
async function mqStart(){
  if(!rtReady()||!deckReady()||mq||myMp||mpConn) return;
  mpMsg=""; const me=mq={tok:mpTok(),t0:Date.now(),room:null,with:null,since:0,ready:false}; render();
  const r=await rtOpen("q","helvara-queue");
  if(mq!==me) return; /* annulé pendant la connexion */
  if(!r){ mq=null; mpMsg=RT_FAIL; render(); return; }
  me.ready=true;
  me.timer=setTimeout(()=>{ if(mq===me&&!me.room) mqStop("Personne en recherche pour l'instant. Invite un ami avec un code de salon."); },MQ_WAIT);
  me.iv=setInterval(mqTick,2000); mqPub(); sfx("click"); render(); mqTick();
}
function mqStop(msg){ if(mq){ clearTimeout(mq.timer); clearInterval(mq.iv); } mq=null; rtClose("q"); if(msg!==undefined) mpMsg=msg; if(screen==="duel") render(); }
const mqOthers=()=>roomQ?roomQ.peers().filter(p=>!p.sameTab&&!p.isMe&&p.presence&&p.presence.q&&typeof p.presence.q.tok==="string"):[];
const mqOnline=()=>roomQ?new Set(roomQ.peers().map((p,i)=>p.by||"k"+i)).size:0;
function mqTick(){
  if(!mq||!mq.ready) return;
  /* je suis l'hôte d'un appariement : la partie a commencé, ou l'autre ne vient pas */
  if(mq.room){
    if(myMp&&myMp.g){ mqStop(""); return; }
    const guestHere=!!roomC&&roomC.peers().some(p=>!p.sameTab&&p.presence&&p.presence.mp&&p.presence.mp.code===mq.room&&p.presence.mp.role==="guest");
    const stillQueued=mqOthers().some(p=>p.presence.q.tok===mq.with);
    if(!guestHere&&(!stillQueued||Date.now()-mq.since>MQ_STALE)){ mpClear(); mq.room=null; mq.with=null; mqPub(); }
    else return;
  }
  const others=mqOthers(), same=others.filter(p=>p.presence.q.ver===BUILD);
  /* invité par quelqu'un : on rejoint son salon */
  const inv=same.find(p=>p.presence.q.with===mq.tok&&typeof p.presence.q.room==="string"&&/^[A-Z]+-\d{4}$/.test(p.presence.q.room));
  /* on rejoint son salon d'abord, et on ne quitte la file qu'une fois dedans (sinon l'hôte croit que tu es parti) */
  if(inv){ if(mq.joining) return; mq.joining=true; const me=mq; mpJoinCode(inv.presence.q.room).then(ok=>{ if(ok&&mq===me) mqStop(""); else if(mq===me) me.joining=false; }); return; }
  const free=same.filter(p=>!p.presence.q.with).map(p=>p.presence.q.tok);
  const toks=[...new Set([...free,mq.tok])].sort(), i=toks.indexOf(mq.tok);
  if(i%2===0&&i+1<toks.length){
    if(mq.busy) return; mq.busy=true; const me=mq, mate=toks[i+1];
    mpCreate().then(()=>{ me.busy=false; if(mq!==me||!myMp) return; me.room=myMp.code; me.with=mate; me.since=Date.now(); mqPub({room:me.room,with:me.with}); }); return;
  }
  mq.verWarn=!same.length&&others.some(p=>p.presence.q.ver!==BUILD);
  if(screen==="duel") render();
}
function mpOpp(){
  if(!roomC||!myMp) return null;
  const other=myMp.role==="host"?"guest":"host";
  const list=roomC.peers().filter(p=>!p.sameTab&&p.presence&&p.presence.mp&&typeof p.presence.mp==="object"&&p.presence.mp.code===myMp.code&&p.presence.mp.role===other);
  if(myMp.role==="host") return myMp.oppTok?(list.find(p=>p.presence.mp.tok===myMp.oppTok)||null):(list.find(p=>validDeck(p.presence.mp.deck))||null);
  return list.find(p=>p.presence.mp.oppTok===myMp.tok)||list.find(p=>!p.presence.mp.oppTok)||null;
}
function mpRoomFull(){ if(!roomC||!myMp||myMp.role!=="guest") return false; return roomC.peers().some(p=>!p.sameTab&&p.presence&&p.presence.mp&&p.presence.mp.code===myMp.code&&p.presence.mp.role==="host"&&p.presence.mp.oppTok&&p.presence.mp.oppTok!==myMp.tok); }
const validDeck=d=>Array.isArray(d)&&d.length===12&&new Set(d).size===12&&d.every(id=>POOL.includes(id));
const safeNick=n=>(typeof n==="string"&&n.trim()?n.trim().slice(0,24):"Adversaire");
function mpNewMatch(om){
  const g=(myMp.g||0)+1, seed=Math.floor(Math.random()*2147483647);
  const locs=shuffle(locPool()).slice(0,3);
  mpPush({g,seed,locs,oppTok:om.tok,hist:{},t:0,again:0});
  mpStart(om,false);
}
function mpTick(){
  if(!myMp){ if(screen==="duel") render(); return; }
  const o=mpOpp(), om=o&&o.presence.mp;
  /* versions différentes : jamais de nouveau match (la partie se désynchroniserait) */
  if(om&&om.ver!==BUILD&&!(S&&S.mp&&S.mp.g===myMp.g&&myMp.g)){ if(mpMsg!==MP_VER_MSG){ mpMsg=MP_VER_MSG; } if(screen==="duel") render(); return; }
  if(myMp.role==="host"&&om&&validDeck(om.deck)){
    if(!myMp.g){ mpNewMatch(om); return; }
    if(S&&S.mp&&S.over&&myMp.again===myMp.g&&om.again===myMp.g){ mpNewMatch(om); return; }
  }
  if(myMp.role==="guest"&&om&&om.g&&om.oppTok===myMp.tok&&validDeck(om.deck)&&Array.isArray(om.locs)&&(!S||!S.mp||S.mp.g!==om.g)&&!(S&&S.mp&&S.mp.resuming)){
    mpPush({g:om.g,hist:{},t:0,again:0}); mpStart(om,false); return;
  }
  if(S&&S.mp&&S.mp.resuming&&om&&om.g===myMp.g){ S.mp.resuming=false; mpStart(om,true); return; }
  if(S&&S.mp){ S.mp.gone=!o; if(om){ S.mp.oppLocked=!!(om.hist&&om.hist[S.turn]); } mpTryResolve(); }
  if(screen==="duel"||screen==="play") render();
}
function mpStart(om,replay){
  const meHost=myMp.role==="host", hostP=meHost?myMp:om, guestP=meHost?om:myMp;
  if(!validDeck(hostP.deck)||!validDeck(guestP.deck)||!Array.isArray(hostP.locs)||!hostP.locs.every(l=>LOCS[l])) return;
  RNG=mulberry(hostP.seed|0); uidN=0;
  const hostDeck=gShuffle(hostP.deck.map(mk)), guestDeck=gShuffle(guestP.deck.map(mk));
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:hostP.locs.map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:meHost?hostDeck:guestDeck, e:meHost?guestDeck:hostDeck},
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null,
    mp:{g:myMp.g, meHost, oppNick:safeNick(om.nick), oppAv:POOL.includes(om.av)?om.av:null, locked:false, gone:false, replaying:!!replay}};
  for(let i=0;i<3;i++){ draw(meHost?"p":"e"); draw(meHost?"e":"p"); }
  quiet=!!replay;
  log(`Duel contre ${S.mp.oppNick}`);
  screen="play"; startTurn();
  mpSaveSession({mp:myMp,oppNick:S.mp.oppNick});
  if(replay) mpReplay(om); else { sfx("loc"); render(); window.scrollTo(0,0); }
}
function mapPlays(side,plays){ const out=[]; if(!Array.isArray(plays)) return out;
  for(const pl of plays){ if(!Array.isArray(pl)) continue; const [uid,li]=pl; const c=S.hand[side].find(x=>x.uid===uid);
    if(c&&li>=0&&li<3&&!out.some(x=>x.c===c)) out.push({c,li:li|0}); } return out; }
async function mpReplay(om){
  while(S&&S.mp&&!S.over){
    const mine=myMp.hist&&myMp.hist[S.turn], theirs=om.hist&&om.hist[S.turn];
    if(mine&&theirs){ await resolveTurn(mapPlays("p",mine), mapPlays("e",theirs), false); continue; }
    if(mine){ const st=mapPlays("p",mine); S.hand.p=S.hand.p.filter(c=>!st.some(x=>x.c===c)); S.staged=st; S.mp.locked=true; }
    break;
  }
  if(S&&S.mp){ S.mp.replaying=false; }
  quiet=false; render(); mpTick();
}
function mpLock(){
  if(!S.mp||S.mp.locked||S.busy||S.over) return;
  const hist=Object.assign({},myMp.hist||{}); hist[S.turn]=S.staged.map(x=>[x.c.uid,x.li]);
  S.mp.locked=true; mpPush({t:S.turn,hist}); mpSaveSession({mp:myMp,oppNick:S.mp.oppNick});
  render(); mpTryResolve();
}
function mpTryResolve(){
  if(!S||!S.mp||!S.mp.locked||S.busy||S.over||S.mp.replaying) return;
  const o=mpOpp(); if(!o) return; const om=o.presence.mp;
  if(om.g!==S.mp.g||!om.hist||!om.hist[S.turn]) return;
  S.mp.locked=false; S.mp.oppLocked=false;
  resolveTurn(S.staged.slice(), mapPlays("e",om.hist[S.turn]), true);
}
async function mpResume(){
  const s=mpSession(); if(!s||!rtReady()||mpConn||!MP_CODE.test(s.mp.code||"")) return; mpConn=true; mpMsg=""; render();
  const r=await rtOpen("c","helvara-room-"+s.mp.code); mpConn=false;
  if(!r){ mpMsg=RT_FAIL; render(); return; }
  myMp=null; mpPush(s.mp);
  S={mp:{resuming:true,g:s.mp.g,oppNick:s.oppNick}, over:null};
  screen="duel"; render(); mpTick();
}
function onlineHTML(){
  const banner=`<p class="notice">Alpha : les parties en ligne sont en test, des bugs et des remises à zéro sont possibles.</p>`;
  if(mq) return `<section class="sec mpbox"><h2>En ligne (Alpha)</h2>${banner}
    <p><span>Recherche d'un adversaire…</span> <span class="hint">${mqOnline()} joueur${mqOnline()>1?"s":""} en recherche</span></p>
    ${mq.verWarn?`<p style="color:var(--warm)">${esc(MP_VER_MSG)}</p>`:""}
    <button class="ghost" data-act="mqcancel">Annuler</button></section>`;
  return `<section class="sec mpbox"><h2>En ligne (Alpha)</h2>${banner}
    <button class="primary" data-act="mqstart">Chercher un adversaire (Alpha)</button></section>`;
}
function duelHTML(){
  const s=mpSession();
  const invite=`<section class="sec"><h2>Inviter un ami</h2><ol class="rules">
    <li>Envoie-lui l'adresse de cette page.</li>
    <li>Il peut jouer tout de suite. En se connectant avec <b>Google</b> (bas de l'accueil), il retrouve sa progression sur tous ses appareils.</li>
    <li>Il ouvre le lien, construit son deck, puis rejoint ton salon avec le code.</li></ol></section>`;
  if(!roomTried) return `<section class="sec"><h2>Duel entre amis</h2><p class="hint">Connexion au salon…</p></section>`;
  if(!rtReady()) return `<section class="sec"><h2>Duel entre amis</h2><p>Le salon en direct est injoignable pour l'instant. Vérifie ta connexion internet, puis recharge la page.</p></section>${invite}`;
  if(S&&S.mp&&S.mp.resuming) return `<section class="sec mpbox"><h2>Reconnexion</h2><p>Retour dans le salon <b class="mpcode">${esc(myMp.code)}</b>. En attente de ${esc(S.mp.oppNick)}…</p><button class="ghost" data-act="mpquit">Abandonner le duel</button></section>`;
  if(!deckReady()) return `<section class="sec"><h2>Duel entre amis</h2><p>Complète d'abord ton deck de 12 cartes.</p><button class="primary" data-act="go" data-to="deck">Aller au deck</button></section>`;
  if(!myMp){
    return `<section class="sec mpbox"><h2>Duel entre amis</h2>
      <p class="hint">Chacun joue avec son deck. Les duels rapportent des CHF et comptent pour les quêtes, mais pas pour le rang.</p>
      ${s?`<div class="notice">Un duel contre ${esc(s.oppNick||"un ami")} peut être repris. <span class="row2" style="margin-top:8px;display:flex"><button class="primary" data-act="mpresume">Reprendre</button><button class="ghost" data-act="mpforget">Oublier</button></span></div>`:""}
      ${mpConn?`<p class="hint">Connexion au salon…</p>`:""}
      <button class="primary" data-act="mpcreate">Créer un salon</button>
      <div class="mpjoin"><input id="mp-code" class="mpinput" maxlength="12" placeholder="OUCHY-4821" autocomplete="off" aria-label="Code du salon"><button class="ghost" data-act="mpjoin">Rejoindre</button></div>
      ${mpMsg?`<p style="color:var(--warm)">${esc(mpMsg)}</p>`:""}
    </section>${onlineHTML()}${invite}`;
  }
  const o=mpOpp(), om=o&&o.presence.mp;
  const status=mpMsg===MP_VER_MSG?esc(MP_VER_MSG):mq&&mq.room?"Adversaire trouvé, connexion au salon…":myMp.role==="host"?(om?`${esc(safeNick(om.nick))} arrive, la partie commence…`:"En attente d'un adversaire. Envoie-lui le code."):
    mpRoomFull()?"Ce salon est déjà complet.":om?`Connecté à ${esc(safeNick(om.nick))}. La partie commence…`:"Salon introuvable pour l'instant. Vérifie le code, ou attends que ton ami le crée.";
  return `<section class="sec mpbox"><h2>Salon</h2>
    <div class="mpcode">${esc(myMp.code)}</div>
    <p>${status}</p>
    <div class="row2"><button class="ghost" data-act="mpcopy">Copier le code</button><button class="ghost" data-act="mpcancel">Quitter le salon</button></div>
  </section>${invite}`;
}
