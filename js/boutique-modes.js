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
/* --- Fusions (ultra-légendaires) dans les paquets ---
   Chaque paquet a une chance `ul` (en % par paquet) de contenir UNE fusion à la place d'une de ses 3 cartes. Le paquet à 300 CHF a une garantie :
   à la 10e ouverture sans fusion (`P.pity`), il en contient une. Le tirage ne choisit que parmi les fusions que le joueur n'a pas encore ;
   s'il les a toutes, la place devient une légendaire (paquets qui en contiennent). Une fusion saisonnière (qui exige une variante `ex`)
   ne sort que du paquet de sa saison. Une fusion exige toujours ses deux personnages dans le deck (ulOk). */
const ulSeason=u=>{ if(CARDS[u.id]&&CARDS[u.id].ex) return CARDS[u.id].ex; for(const r of u.req) for(const x of [].concat(r)) if(CARDS[x]&&CARDS[x].ex) return CARDS[x].ex; return null; };
function ulPool(pk){
  if(!pk||!pk.ul) return [];
  const fus=ULS.filter(u=>u.req.length&&!u.fac&&CARDS[u.id]&&REL(u.id)&&!P.owned.includes(u.id));
  const own=pk.win?fus.filter(u=>ulSeason(u)===pk.id):[], reg=fus.filter(u=>!ulSeason(u));
  return (own.length?own:reg).map(u=>u.id);
}
/* Cartes de ces raretés qu'il reste à trouver dans le paquet (sans les fusions) */
const packMissing=pk=>PACK(pk.id).filter(id=>!P.owned.includes(id)&&pk.odds.some(o=>o[0]===CARDS[id].r));
/* Un paquet peut-il être acheté maintenant ? (même règle pour le bouton de la boutique et « Ouvrir un autre paquet ») */
function packBuyable(pk){
  if(!pk) return false;
  if(!pk.starter&&!packMissing(pk).length&&!ulPool(pk).length) return false;
  return !(P.chf<pk.price||(pk.starter&&P.starter)||!inWin(pk.win)||(!pk.starter&&!P.starter));
}
/* Tirage du contenu d'un paquet payant (3 cartes). Lit P.owned, met à jour P.pity ; ne touche à rien d'autre (testé par outils/tests-scenarios.js). */
function drawPack(pk){
  let got;
  const allowed=pk.odds.map(o=>o[0]);
  got=[]; for(let i=0;i<pk.n;i++){ const r=rollRarity(pk.odds); got.push(pickRand(PACK(pk.id).filter(id=>CARDS[id].r===r))); }
  const missing=PACK(pk.id).filter(id=>!P.owned.includes(id)&&allowed.includes(CARDS[id].r));
  const exc=PACK(pk.id).filter(id=>CARDS[id].ex===pk.id&&!P.owned.includes(id)); if(exc.length&&!got.some(id=>CARDS[id].ex===pk.id)) got[2]=pickRand(exc);
  if(missing.length && !got.some(id=>missing.includes(id))){
    const r=rollRarity(pk.odds); const m=missing.filter(id=>CARDS[id].r===r);
    got[0]=pickRand(m.length?m:missing);
  }
  if(pk.ul){ /* la place d'une fusion : tirée, ou garantie à la 10e ouverture du paquet à 300 CHF */
    const forced=pk.pity&&(P.pity||0)>=pk.pity-1, slot=forced||Math.random()*100<pk.ul;
    if(pk.pity) P.pity=slot?0:(P.pity||0)+1;
    if(slot){
      const pool=ulPool(pk), legs=pk.odds.some(o=>o[0]==="L")?PACK(pk.id).filter(id=>CARDS[id].r==="L"):[];
      if(pool.length) got[1]=pickRand(pool);
      else if(legs.length){ const m=legs.filter(id=>!P.owned.includes(id)); got[1]=pickRand(m.length?m:legs); }
    }
  }
  got=shuffle(got);
  return got;
}
function buyPack(pid){
  const pk=PACKS.find(x=>x.id===pid); if(!packBuyable(pk)) return;
  P.chf-=pk.price;
  let got;
  if(pk.starter){ got=starterRoll(); P.starter=true; hlStarter=false; }
  else got=drawPack(pk);
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
/* gain du Blitz en cours : palier atteint + Serments (jamais sous 0) */
const bzHeld=r=>Math.max(0,BZ.gain[r.wins]+(r.oath||0));
const bzFree=()=>!P.bz||P.bz.day!==today()||!P.bz.used;
/* Déblocage du Blitz : BLITZ_UNLOCK, gamesPlayed() et blitzLeft() sont dans js/langue-profil.js (la quête « Gagne une partie de Blitz » en dépend au chargement). Un Blitz déjà en cours reste jouable. */
const blitzRun=()=>!!(P.bz&&P.bz.run&&!P.bz.run.over);
const blitzOpen=()=>blitzLeft()===0||blitzRun();
const blitzLockText=()=>{ const n=blitzLeft(); return `Encore ${n} partie${n>1?"s":""} pour débloquer le Blitz`; };
function bzRoll(deck){ const chars=new Set(deck.map(charOf)); const pool=shuffle(POOL.filter(id=>REL(id)&&CARDS[id].r!=="U"&&!chars.has(charOf(id))&&!(id==="yarden_d"&&chars.has("yarden")))); const out=[], seen=new Set();
  for(const id of pool){ if(out.length>=4) break; if(seen.has(charOf(id))) continue; seen.add(charOf(id)); out.push(id); } return out; }
function bzStart(){ if(P.bz.run&&!P.bz.run.over) return; if(!blitzOpen()) return;
  if(bzFree()){ P.bz.day=today(); P.bz.used=true; } else { if(P.chf<BZ.price) return; P.chf-=BZ.price; }
  const deck=[...BZ.start]; P.bz.run={deck,opts:bzRoll(deck),wins:0,over:false,gain:0}; save(); sfx("pack"); render(); }
function bzPick(id){ const r=P.bz.run; if(!r||r.over||!r.opts.includes(id)||r.deck.length>=12) return; r.deck.push(id); r.opts=r.deck.length<12?bzRoll(r.deck):[]; save(); sfx("select"); render(); }
function bzEndRun(){ const r=P.bz.run; if(!r||r.over) return; r.over=true; r.gain=bzHeld(r); P.chf+=r.gain; save(); if(r.gain) setTimeout(()=>sfx("coin"),500); }
function bzGame(){ const r=P.bz.run; if(!r||r.over||r.deck.length<12) return;
  RNG=Math.random; const locIds=pickLocs(); games++;
  const t=BZ.tiers[r.wins];
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:locIds.map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:shuffle(r.deck.map(mk)), e:[]}, aiTier:t, aiFac:null,
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null, blitz:true};
  S.rival=drawRival(t); const ai=rivalDeck(S.rival,t,true,true); S.deck.e=shuffle(ai.deck.map(mk)); S.aiFac=ai.fac;   /* Blitz : pas d'ultra-légendaire, adversaire compris */
  for(let i=0;i<3;i++){draw("p");draw("e");}
  log(`Blitz · match ${r.wins+1}/3 · adversaire ${FAC[ai.fac].n}, niveau ${TIERS[t]}`);
  screen="play"; startTurn(); }
function blitzHTML(){
  const r=P.bz.run, free=bzFree();
  if(!blitzOpen()&&!(r&&r.over)) return `<section class="sec"><h2>${ico("lock")} Blitz</h2><p>${blitzLockText()}</p><p class="hint">Les parties classées et les duels entre amis comptent.</p><button class="ghost" data-act="go" data-to="home">Retour à l'accueil</button></section>`;
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
    <p>Adversaire de niveau <b>${TIERS[BZ.tiers[r.wins]]}</b>. ${r.wins?`Tu tiens déjà ${bzHeld(r)} CHF.${r.oath?` Dont Serments : ${r.oath>0?"+":"−"}${Math.abs(r.oath)} CHF.`:""}`:"Gagne pour décrocher ta première récompense."}</p>
    ${ladder}<button class="play" data-act="bzplay">${S&&S.blitz&&!S.over?"Reprendre le match":"Jouer le match"}</button>${strip}</section>`;
  return body+(r&&!r.over?`<button class="ghost" data-act="bzquit">Abandonner le Blitz${r.wins?` et prendre ${bzHeld(r)} CHF`:""}</button>`:"");
}

/* ======= DUEL ENTRE AMIS ======= */
/* BUILD : version du moteur de duel. Deux joueurs de versions différentes se désynchroniseraient (lockstep) : le match est refusé.
   À changer à chaque modification qui touche au déroulement d'une partie (effets, lieux, tirage, IA du serment…). */
const BUILD="alpha-0.45", MP_VER_MSG="Version différente : recharge la page";
const MP_KEY="duel-helvara-mp", MP_PLACES=["OUCHY","FLON","RUELLE","FAILLE","VOILE","SOUSGARE","LEMAN"];
let roomC=null, roomQ=null, roomTried=false, myMp=null, mpMsg="", mpConn=false;
/* Coups scellés (anti-triche, lot A) : mes coups du tour, envoyés d'abord sous forme d'empreinte. Ils restent ICI (jamais dans la présence)
   jusqu'à ce que l'adversaire ait publié son empreinte : {g, t, plays, salt, seal}. */
let mpPend=null;
/* Lot C : salon donné par la recherche de la base (mm_seek) = duel classé (le serveur y a déjà inscrit les deux comptes) */
let mpRankedRoom="";
/* Graine commune : mon nombre secret de l'hôte (jamais dans la présence avant la révélation), l'empreinte vue par l'invité, le match en cours de tirage */
let mpSecret=null, mpSeedSeen=null, mpDealing="";   /* mpDealing : « mon jeton|match », le numéro de match repart à 1 dans chaque salon */
/* Jetons et codes de salon : crypto.getRandomValues (pas Math.random). Code = LIEU- + 6 caractères sans I, L, O ni 0/1 (31 symboles, tirage sans biais). */
const MP_ALPHA="23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function mpRandInt(max){ const lim=256-(256%max); for(;;){ const b=crypto.getRandomValues(new Uint8Array(1))[0]; if(b<lim) return b%max; } }
const mpTok=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,"0")).join("");
function mpSession(){ try{ const s=JSON.parse(localStorage.getItem(MP_KEY)); return s&&s.mp&&Date.now()-s.at<3*36e5?s:null; }catch(e){ return null; } }
/* Empreinte SHA-256 des coups d'un tour, avec un sel aléatoire (sans lui, les quelques coups possibles se devineraient) */
const mpSalt=()=>mpTok()+mpTok();
async function mpSeal(plays,salt){ const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(salt+"|"+JSON.stringify(plays))); return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join(""); }
async function mpSealOk(plays,salt,seal){ if(!Array.isArray(plays)||typeof salt!=="string"||typeof seal!=="string") return false; try{ return await mpSeal(plays,salt)===seal; }catch(e){ return false; } }
function mpSaveAll(){ if(S&&S.mp) mpSaveSession({mp:myMp,oppNick:S.mp.oppNick,pend:mpPend,seen:S.mp.seen||{},deal:S.mp.deal||null,ranked:!!S.mp.ranked}); }
/* Graine commune (anti-triche, lot A) : l'hôte publie l'empreinte de son nombre (hc), l'invité répond avec le sien (rg), l'hôte révèle (rh).
   La graine de la partie et les trois lieux sortent de l'empreinte des deux nombres : personne ne peut les choisir.
   Lieux : tirés parmi les lieux sortis chez LES DEUX joueurs (lp), dans un ordre fixe. */
const mpHex=a=>Array.from(a,x=>x.toString(16).padStart(2,"0")).join("");
async function mpHash(t){ return new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t))); }
/* Lieu à l'honneur (samedi) : chaque téléphone le calcule lui-même (ft) ; il n'est imposé que si les deux sont d'accord, donc personne ne peut le choisir */
async function mpDeal(rh,rg,lpH,lpG,ftH,ftG){
  const b=await mpHash("helvara|"+rh+"|"+rg), u=i=>((b[i]<<24)|(b[i+1]<<16)|(b[i+2]<<8)|b[i+3])>>>0;
  const r=mulberry(u(4)|0), mix=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const pool=mix(lpH.filter(x=>lpG.includes(x)&&LOCS[x]).sort());
  let locs=pool.slice(0,3); const f=typeof ftH==="string"&&ftH===ftG&&pool.includes(ftH)?ftH:null;
  if(f&&!locs.includes(f)) locs=mix([f,...locs.slice(0,2)]);
  return {seed:u(0)&0x7fffffff, locs};
}
/* Lieux de l'autre : au plus 2 de mes lieux sortis peuvent lui manquer (horloges décalées le jour d'une sortie), sinon il essaie de choisir les lieux */
function mpPoolOk(lp){ if(!Array.isArray(lp)||!lp.every(x=>typeof x==="string")) return false; const mine=locPool(), both=mine.filter(x=>lp.includes(x)); return both.length>=3&&mine.length-both.length<=2; }
const MP_DEAL_MSG="Le tirage de la partie n'a pas pu être vérifié : partie annulée. Recrée un salon.";
function mpSaveSession(s){ try{ if(s){ s.at=Date.now(); localStorage.setItem(MP_KEY,JSON.stringify(s)); } else localStorage.removeItem(MP_KEY); }catch(e){} }
/* Temps réel : plus de salon commun où tout le monde voit tout le monde. On ne se connecte que pour un duel :
   un canal par code de salon (« roomC », deux joueurs), et le canal de la file d'attente (« roomQ ») seulement
   pendant une recherche. Seule autre connexion : la présence anonyme « helvara-lobby » (plus bas, lot B), tant que le jeu est visible. */
const rtReady=()=>!!(window.claude&&window.claude.use), rtTok={c:0,q:0}, MP_CODE=/^[A-Z]+-(?:\d{4}|[2-9A-HJKMNP-Z]{6})$/;   /* nouveau format (6 caractères) et ancien (4 chiffres : une reprise de session déjà enregistrée continue de marcher) */
const RT_FAIL="Le salon en direct est injoignable pour l'instant. Vérifie ta connexion internet, puis réessaie.";
async function rtOpen(kind,name){
  const cur=kind==="c"?roomC:roomQ; if(cur&&cur.name===name) return cur;
  rtClose(kind); const t=rtTok[kind];
  let r=null; try{ r=await window.claude.use("room:"+name); }catch(e){ r=null; }
  if(!r) return null;
  if(t!==rtTok[kind]){ if(r.leave) r.leave(); return null; } /* fermé pendant la connexion */
  r.name=name;
  r.onPeers(()=>{ if(kind==="c"){ const ks=r.peers().filter(p=>!p.sameTab).map(p=>p.key).sort().join(); if(ks!==mpKeys){ const more=ks.length>mpKeys.length||ks.split(",").some(k=>k&&!mpKeys.includes(k)); mpKeys=ks; if(more) mpCast(); } }   /* un joueur arrive (ou revient) : on lui renvoie notre état tout de suite */
    mqTick(); mpTick(); }, e=>{ if(kind==="c"&&mpLive()){ mpRejoin(); return; } mpMsg="Connexion au salon perdue. Recharge la page."; render(); });
  if(kind==="c"&&r.onMessage) r.onMessage(mpOnMsg);
  if(kind==="c") roomC=r; else roomQ=r;
  return r;
}
function rtClose(kind){ rtTok[kind]++; const r=kind==="c"?roomC:roomQ; if(kind==="c"){ roomC=null; mpBc=mpNew(); mpBcAt=mpNew(); mpBcK=mpNew(); mpKeys=""; } else roomQ=null; if(r&&r.leave) r.leave(); }
function initRoom(){ roomTried=true; render(); lobOpen(); }
/* ======= Présence en direct (anti-triche, lot B) =======
   Chaque jeu ouvert ET visible rejoint « helvara-lobby » (cloud.js : aucun identifiant de compte, un jeton tiré au hasard) et n'y publie
   que {v: version, s: état} : 0 libre (menus), 1 cherche un adversaire, 2 en partie. Quitté dès que la page passe en arrière-plan.
   Au-delà de LOB_MAX jeux présents, on n'y reste pas : « Jouer » part alors directement contre l'IA (limite de connexions de Supabase). */
const LOB_MAX=150, LOB_WAIT=15000;
let lob=null, lobConn=false, lobFull=false, lobSent=-1, lobSeen="";
const lobState=()=>mq?1:(S&&!S.over&&!S.rp&&screen==="play")?2:0;
async function lobOpen(){
  if(lob||lobConn||lobFull||!rtReady()||document.hidden) return; lobConn=true;
  let r=null; try{ r=await window.claude.use("lobby"); }catch(e){ r=null; } lobConn=false;
  if(!r) return;
  if(document.hidden||lob){ if(r.leave) r.leave(); return; }
  lob=r; lobSent=-1; lobBc=Object.create(null);
  if(r.onMessage) r.onMessage(m=>{ if(lob!==r||!m||m.v!==BUILD||!/^t[0-9a-z]{1,10}$/.test(m.__k||"")||![0,1,2].includes(m.s)) return; lobBc[m.__k]=m.s; const k=lobOthers().length+"|"+lobFree()+"|"+lobSeeking(); if(k!==lobSeen){ lobSeen=k; if(screen==="home") render(); } });
  r.onPeers(()=>{ if(lob!==r) return;
    if(r.peers().length>LOB_MAX){ lobFull=true; lobClose(); return; }
    const k=lobOthers().length+"|"+lobFree()+"|"+lobSeeking(); if(k!==lobSeen){ lobSeen=k; if(screen==="home") render(); } }, ()=>{ if(lob===r) lobClose(); });
  lobSync();
}
function lobClose(){ const r=lob; lob=null; lobSent=-1; lobSeen=""; lobBc=Object.create(null); if(r&&r.leave) r.leave(); }
/* L'état part en présence (rationnée : 1 envoi par 30 s pour le lobby, voir cloud.js) ET en diffusion (instantanée) ; lobBc garde
   les états reçus en diffusion par clé de présence, plus récents que la présence */
let lobBc=Object.create(null);
function lobSync(){ if(!lob) return; const s=lobState(); if(s===lobSent) return; lobSent=s; lob.presence({v:BUILD,s}).catch(()=>{}); if(lob.send) lob.send({v:BUILD,s}).catch(()=>{}); }
const lobS=p=>lobBc[p.key]!=null?lobBc[p.key]:p.presence.s;
const lobOthers=()=>lob?lob.peers().filter(p=>!p.sameTab&&p.presence&&(p.presence.v===BUILD||(lobBc[p.key]!=null))):[];
const lobFree=()=>lobOthers().filter(p=>lobS(p)!==2).length;
const lobSeeking=()=>lobOthers().filter(p=>lobS(p)===1).length;
document.addEventListener("visibilitychange",()=>{ if(document.hidden) lobClose(); else { lobFull=false; lobOpen(); } });   /* canal plein (ou rempli par un tricheur) : on réessaie au retour au premier plan */
/* « Jouer » (lot B) : si un autre joueur de même version est libre, on le cherche au plus LOB_WAIT ms (la file d'attente habituelle),
   sinon partie contre l'IA tout de suite. Appariement trouvé : un peu de marge pour entrer dans le salon. Renvoie false = jouer contre l'IA. */
function playSeek(){
  if(!lob||!lobFree()||!rtReady()||!deckReady()||myMp||mq||mpConn||mpDeckWhy(P.deck)) return false;
  mqStart(); if(!mq) return false;
  const me=mq; me.jouer=true; me.until=Date.now()+LOB_WAIT;
  me.jt=setInterval(()=>{ if(mq!==me&&!(me.room&&myMp&&!(S&&S.mp))){ clearInterval(me.jt); return; }
    if(S&&S.mp&&!S.over){ clearInterval(me.jt); return; }   /* le duel a commencé */
    if(Date.now()>=me.until+(me.room?12000:0)) playAI(me); else if(sheet==="play") render(); },1000);
  return true;
}
function playStop(me){ clearInterval(me.jt); if(mq===me) mqStop(""); if(myMp&&!(S&&S.mp)) mpClear(); }
function playAI(me){ playStop(me); sheet=null; newGame(); window.scrollTo(0,0); }
/* Chaque état du duel part deux fois : en diffusion (instantané) et en présence (rationnée par cloud.js à 4 envois par 30 s : elle sert
   de mémoire pour la reprise et les retardataires). seq numérote les états : l'adversaire garde toujours le plus récent des deux. */
function mpPush(patch){ myMp=Object.assign({},myMp||{},patch,{seq:Math.max(((myMp&&+myMp.seq)||0)+1,Date.now())});   /* croît toujours, même après un rechargement */ if(roomC){ roomC.presence({mp:myMp}).catch(()=>{}); mpCast(); } }
function mpCast(){ if(roomC&&roomC.send&&myMp) roomC.send({mp:myMp}).catch(()=>{}); }
/* Filet de sécurité (20 novembre) : pendant un duel, si l'adversaire a disparu du salon depuis plus de 10 s, ou si le serveur a fermé
   notre canal, on rejoint le salon tout seul (comme un rechargement de page, sans recharger) : 1 essai toutes les 20 s au plus. */
const mpLive=()=>!!(S&&S.mp&&!S.over&&!S.mp.resuming&&myMp&&myMp.code);
let mpGoneAt=0, mpRejoinAt=0, mpRejoining=false;
async function mpRejoin(){
  if(!mpLive()||mpRejoining||Date.now()-mpRejoinAt<20000) return; mpRejoining=true; mpRejoinAt=Date.now();
  const code=myMp.code; rtClose("c"); const r=await rtOpen("c","helvara-room-"+code); mpRejoining=false;
  if(r&&myMp&&myMp.code===code) mpPush({}); else if(!r){ mpMsg=RT_FAIL; render(); }
}
setInterval(()=>{ if(!mpLive()||!roomC) { mpGoneAt=0; return; }
  const gone=!mpOpp(); if(gone!==S.mp.gone){ S.mp.gone=gone; if(screen==="play") render(); }
  if(!gone){ mpGoneAt=0; return; } mpGoneAt=mpGoneAt||Date.now(); if(Date.now()-mpGoneAt>10000) mpRejoin(); },3000);
/* Derniers états reçus en diffusion, par jeton de joueur (vidé à la fermeture du salon) */
/* mpBc : par jeton (tok), seulement pour un adversaire pas encore visible en présence ; mpBcK : par clé de présence de l'expéditeur
   (__k), la seule source acceptée quand l'adversaire est visible en présence : un tiers qui connaît le code ne peut pas usurper son état. */
const mpNew=()=>Object.create(null), TOK_RE=/^[0-9a-f]{16}$/, KEY_RE=/^t[0-9a-z]{1,10}$/;
let mpBc=mpNew(), mpBcAt=mpNew(), mpBcK=mpNew(), mpKeys="";
function mpOnMsg(m){ const x=m&&m.mp; if(!x||typeof x!=="object"||!TOK_RE.test(x.tok||"")||!KEY_RE.test(m.__k||"")||!myMp||x.code!==myMp.code) return;
  const sq=+x.seq||0; if(sq>Date.now()+864e5) return;   /* numéro de séquence absurde : refusé */
  mpBcAt[x.tok]=Date.now(); const k=mpBcK[m.__k]; if(!k||sq>(+k.seq||0)) mpBcK[m.__k]=x;
  const o=mpBc[x.tok]; if(!o||sq>(+o.seq||0)) mpBc[x.tok]=x; mpTick(); }
/* Signe de vie : la diffusion n'a pas de quota, elle remplace la présence quand celle-ci attend son tour (enchaînement de duels) */
setInterval(()=>{ if(roomC&&myMp&&myMp.code&&!document.hidden) mpCast(); },12000);
function mpClear(){ myMp=null; mpMsg=""; rtClose("c"); }
function mpBase(role,code){ return {v:1,ver:BUILD,code,role,tok:mpTok(),nick:P.name.slice(0,24),av:(P.avatar&&P.owned.includes(P.avatar))?P.avatar:null,deck:[...P.deck],lp:locPool(),ft:featureLoc()}; }
const mpNewCode=()=>MP_PLACES[mpRandInt(MP_PLACES.length)]+"-"+Array.from({length:6},()=>MP_ALPHA[mpRandInt(MP_ALPHA.length)]).join("");
async function mpCreate(given){
  if(!rtReady()||!deckReady()||mpConn) return; { const w=mpDeckWhy(P.deck); if(w){ mpMsg=MP_MYDECK_MSG(w); render(); return; } } myMp=null; mpMsg=""; mpConn=true; render();
  const code=given||mpNewCode();
  const r=await rtOpen("c","helvara-room-"+code); mpConn=false;
  if(!r){ mpMsg=RT_FAIL; render(); return; }
  mpPush(mpBase("host",code)); sfx("click"); render();
}
function mpJoin(){
  const i=document.getElementById("mp-code"); const code=(i&&i.value||"").trim().toUpperCase().replace(/\s+/g,"");
  if(!MP_CODE.test(code)){ mpMsg="Le code ressemble à OUCHY-K7M4QX."; render(); return; }
  mpJoinCode(code);
}
async function mpJoinCode(code){
  if(!rtReady()||!deckReady()||mpConn||!MP_CODE.test(code||"")) return false; { const w=mpDeckWhy(P.deck); if(w){ mpMsg=MP_MYDECK_MSG(w); render(); return false; } } mpMsg=""; myMp=null; mpConn=true; render();
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
let mq=null; /* {tok, t0, timer, room, with, since} ; sql:true = file d'attente dans la base (file-attente.sql) */
/* File d'attente dans la base (18 novembre) : la base apparie (un seul arbitre, voir file-attente.sql). Le jeu l'appelle toutes les 3 s environ.
   Trouvé : l'hôte crée le salon avec le code qu'il a proposé, l'invité le rejoint ; 15 s sans voir l'autre dans le salon : on se remet à chercher.
   Tant que file-attente.sql n'est pas lancé dans Supabase (fonction absente), l'ancienne file par présence (plus bas) prend le relais. */
let mqDb=null;
async function mqSqlStart(me){
  me.sql=true; me.code=mpNewCode(); me.ready=true;
  me.timer=setTimeout(()=>{ if(mq===me&&!me.room) mqStop("Personne en recherche pour l'instant. Invite un ami avec un code de salon."); },MQ_WAIT);
  sfx("click"); render(); mqSqlTick(me);
}
async function mqSqlTick(me){
  if(mq!==me) return;
  const next=()=>{ if(mq===me){ clearTimeout(me.iv); me.iv=setTimeout(()=>mqSqlTick(me),2600+Math.random()*800); } };   /* léger décalage : deux téléphones ne frappent pas en même temps */
  if(me.room){
    if(myMp&&myMp.g){ mqStop(""); return; }
    if(mpOpp()){ next(); return; }   /* l'autre est là : la partie va commencer (mpTick) */
    if(Date.now()-me.since<MQ_STALE){ next(); return; }
    mpClear(); me.room=null; me.code=mpNewCode(); clearTimeout(me.timer);   /* l'autre n'est jamais venu : on recommence à chercher */
    me.timer=setTimeout(()=>{ if(mq===me&&!me.room) mqStop("Personne en recherche pour l'instant. Invite un ami avec un code de salon."); },MQ_WAIT);
  }
  let res=null;
  try{ res=await mqDb.mmSeek(BUILD,me.code); }
  catch(e){ if(mq!==me) return; if(e&&e.code==="PGRST202"){ me.sql=false; mqPresenceStart(me); return; } next(); return; }   /* SQL pas encore lancé : ancienne file */
  if(mq!==me) return;
  if(res&&res.ok&&res.room&&MP_CODE.test(res.room)){
    me.room=res.room; me.since=Date.now(); me.role=res.role; mpRankedRoom=res.room;
    const ok=res.role==="host"?(await mpCreate(res.room),!!myMp):await mpJoinCode(res.room);
    if(mq!==me) return; if(!ok){ me.since=0; }   /* salon injoignable : on se remet à chercher au prochain passage */
    render(); next(); return;
  }
  if(res&&res.ok){ me.waiting=res.waiting|0; me.verWarn=!me.waiting&&!!res.other_ver; if(screen==="duel") render(); }
  next();
}
function mqPub(extra){ if(roomQ&&mq) roomQ.presence({q:{tok:mq.tok,ver:BUILD,at:mq.t0,...(extra||{})}}).catch(()=>{}); }
async function mqStart(){
  if(!rtReady()||!deckReady()||mq||myMp||mpConn) return; { const w=mpDeckWhy(P.deck); if(w){ mpMsg=MP_MYDECK_MSG(w); render(); return; } }
  mpMsg=""; const me=mq={tok:mpTok(),t0:Date.now(),room:null,with:null,since:0,ready:false}; render();
  try{ mqDb=mqDb||await window.claude.use("db"); }catch(e){ mqDb=null; }
  if(mq!==me) return;
  if(mqDb&&mqDb.mmSeek) return mqSqlStart(me);
  return mqPresenceStart(me);
}
async function mqPresenceStart(me){
  const r=await rtOpen("q","helvara-queue");
  if(mq!==me) return; /* annulé pendant la connexion */
  if(!r){ mq=null; mpMsg=RT_FAIL; render(); return; }
  me.ready=true;
  me.timer=setTimeout(()=>{ if(mq===me&&!me.room) mqStop("Personne en recherche pour l'instant. Invite un ami avec un code de salon."); },MQ_WAIT);
  me.iv=setInterval(mqTick,2000); mqPub(); sfx("click"); render(); mqTick();
}
function mqStop(msg){ if(mq){ clearTimeout(mq.timer); clearInterval(mq.iv); clearTimeout(mq.iv); if(mq.sql&&!mq.room&&mqDb) mqDb.mmLeave().catch(()=>{}); } mq=null; rtClose("q"); if(msg!==undefined) mpMsg=msg; if(screen==="duel") render(); }
const mqOthers=()=>roomQ?roomQ.peers().filter(p=>!p.sameTab&&!p.isMe&&p.presence&&p.presence.q&&typeof p.presence.q.tok==="string"):[];
const mqOnline=()=>roomQ?new Set(roomQ.peers().map((p,i)=>p.by||"k"+i)).size:0;
function mqTick(){
  if(!mq||!mq.ready||mq.sql) return;
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
  const inv=same.find(p=>p.presence.q.with===mq.tok&&typeof p.presence.q.room==="string"&&MP_CODE.test(p.presence.q.room));
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
function mpOppP(){
  if(!roomC||!myMp) return null;
  const other=myMp.role==="host"?"guest":"host";
  const list=roomC.peers().filter(p=>!p.sameTab&&p.presence&&p.presence.mp&&typeof p.presence.mp==="object"&&p.presence.mp.code===myMp.code&&p.presence.mp.role===other);
  if(myMp.role==="host") return myMp.oppTok?(list.find(p=>p.presence.mp.tok===myMp.oppTok)||null):(list.find(p=>validDeck(p.presence.mp.deck))||null);
  return list.find(p=>p.presence.mp.oppTok===myMp.tok)||list.find(p=>!p.presence.mp.oppTok)||null;
}/* L'adversaire vu seulement en diffusion (sa présence attend encore son tour) : il compte s'il a donné signe de vie il y a moins de 35 s */
function mpOppB(){ if(!myMp) return null; const other=myMp.role==="host"?"guest":"host", now=Date.now();
  const l=Object.keys(mpBc).filter(t=>now-(mpBcAt[t]||0)<35000).map(t=>mpBc[t]).filter(m=>m.code===myMp.code&&m.role===other);
  const m=myMp.role==="host"?(myMp.oppTok?l.find(x=>x.tok===myMp.oppTok):l.find(x=>validDeck(x.deck))):(l.find(x=>x.oppTok===myMp.tok)||l.find(x=>!x.oppTok));
  return m?{sameTab:false,presence:{mp:m}}:null; }
/* L'adversaire : sa présence, avec l'état le plus récent reçu en diffusion s'il est plus neuf */
function mpOpp(){ const p=mpOppP(); if(!p) return mpOppB(); const b=p.key?mpBcK[p.key]:null; return b&&(+b.seq||0)>(+p.presence.mp.seq||0)?{...p,presence:{...p.presence,mp:b}}:p; }

function mpRoomFull(){ if(!roomC||!myMp||myMp.role!=="guest") return false; return roomC.peers().some(p=>!p.sameTab&&p.presence&&p.presence.mp&&p.presence.mp.code===myMp.code&&p.presence.mp.role==="host"&&p.presence.mp.oppTok&&p.presence.mp.oppTok!==myMp.tok); }
const validDeck=d=>Array.isArray(d)&&d.length===12&&new Set(d).size===12&&d.every(id=>POOL.includes(id));
/* Deck adverse (anti-triche, lot A) : mêmes règles que l'éditeur de deck. Cartes sorties (un jour de marge : horloges décalées le jour d'une sortie),
   une seule version par personnage (Yarden et Yarden X Apsu exceptées, comme dans l'éditeur), une seule ultra-légendaire, et ses exigences (ulOk).
   Ce qu'il possède ne peut pas être vérifié ici (lot B, serveur). Renvoie "" si le deck est permis, sinon la raison. */
function mpDeckWhy(d){
  if(!validDeck(d)) return "deck incomplet";
  const t=new Date(today()+"T12:00:00Z"); t.setUTCDate(t.getUTCDate()+1); const tom=t.toISOString().slice(0,10);
  const early=d.find(id=>CARDS[id].rel&&CARDS[id].rel>tom); if(early) return `${CARDS[early].name} pas encore sortie`;
  const yd=["yarden","yarden_d"];
  for(const a of d){ const b=d.find(x=>x!==a&&charOf(x)===charOf(a)&&!(yd.includes(x)&&yd.includes(a))); if(b) return `${CARDS[a].name} et ${CARDS[b].name} : une seule version par personnage`; }
  const uls=d.filter(id=>ULof(id)); if(uls.length>1) return "plus d'une ultra-légendaire";
  if(uls.length&&!ulOk(ULof(uls[0]),d)) return `${CARDS[uls[0]].name} sans ses exigences`;
  return "";
}
const MP_DECK_MSG=w=>`Deck adverse refusé (${w}) : partie annulée.`, MP_MYDECK_MSG=w=>`Ton deck ne peut pas jouer en ligne (${w}). Corrige-le dans « Deck ».`;
const safeNick=n=>(typeof n==="string"&&n.trim()?n.trim().slice(0,24):"Adversaire");
function mpNewMatch(om){
  const g=(myMp.g||0)+1, r=mpTok()+mpTok(); mpSecret={g,r};
  mpPend=null; mpPush({g,hc:null,rh:null,oppTok:om.tok,hist:{},seal:{},salt:{},t:0,again:0});
  mpHash(r).then(h=>{ if(mpSecret&&mpSecret.g===g&&myMp&&myMp.g===g){ mpPush({hc:mpHex(h)}); mpTick(); } });
}
/* Hôte : l'invité a donné son nombre, je révèle le mien et la partie commence */
function mpHostDeal(om){
  const g=myMp.g, key=myMp.tok+"|"+g; if(mpDealing===key||!mpSecret||mpSecret.g!==g) return; mpDealing=key;
  if(!mpPoolOk(om.lp)){ mpMsg=MP_DEAL_MSG; render(); return; }
  mpPush({rh:mpSecret.r});
  mpDeal(mpSecret.r,om.rg,myMp.lp,om.lp,myMp.ft,om.ft).then(d=>{ if(myMp&&myMp.g===g) mpStart(om,false,d); });
}
/* Invité : le nombre révélé par l'hôte doit correspondre à l'empreinte vue AVANT que je donne le mien */
function mpGuestDeal(om){
  const g=om.g, key=myMp.tok+"|"+g; if(mpDealing===key||!mpSeedSeen||mpSeedSeen.g!==g) return; mpDealing=key;
  if(!mpPoolOk(om.lp)){ mpMsg=MP_DEAL_MSG; render(); return; }
  mpHash(om.rh).then(h=>{
    if(mpHex(h)!==mpSeedSeen.hc){ mpMsg=MP_DEAL_MSG; render(); return; }
    return mpDeal(om.rh,myMp.rg,om.lp,myMp.lp,om.ft,myMp.ft).then(d=>{ if(myMp&&myMp.g===g) mpStart(om,false,d); });
  });
}
function mpTick(){
  if(!myMp){ if(screen==="duel") render(); return; }
  const o=mpOpp(), om=o&&o.presence.mp;
  /* versions différentes : jamais de nouveau match (la partie se désynchroniserait) */
  if(om&&om.ver!==BUILD&&!(S&&S.mp&&S.mp.g===myMp.g&&myMp.g)){ if(mpMsg!==MP_VER_MSG){ mpMsg=MP_VER_MSG; } if(screen==="duel") render(); return; }
  const started=g=>!!(S&&S.mp&&S.mp.g===g&&!S.mp.resuming);
  if(om&&validDeck(om.deck)&&!started(myMp.g)&&!(S&&S.mp&&S.mp.resuming)){ const w=mpDeckWhy(om.deck); if(w){ const m=MP_DECK_MSG(w); if(mpMsg!==m){ mpMsg=m; } if(screen==="duel") render(); return; } }
  if(myMp.role==="host"&&om&&validDeck(om.deck)){
    if(!myMp.g){ mpNewMatch(om); return; }
    if(S&&S.mp&&S.over&&myMp.again===myMp.g&&om.again===myMp.g){ mpNewMatch(om); return; }
    if(!started(myMp.g)&&!(S&&S.mp&&S.mp.resuming)&&typeof myMp.hc==="string"&&om.g===myMp.g&&typeof om.rg==="string"){ mpHostDeal(om); return; }
  }
  if(myMp.role==="guest"&&om&&om.g&&om.oppTok===myMp.tok&&validDeck(om.deck)&&!started(om.g)&&!(S&&S.mp&&S.mp.resuming)){
    if(myMp.g!==om.g&&typeof om.hc==="string"){   /* l'hôte a publié son empreinte : je la note, puis je donne mon nombre */
      mpSeedSeen={g:om.g,hc:om.hc}; mpPend=null; mpPush({g:om.g,rg:mpTok()+mpTok(),hist:{},seal:{},salt:{},t:0,again:0}); return; }
    if(myMp.g===om.g&&typeof om.rh==="string"){ mpGuestDeal(om); return; }
  }
  if(S&&S.mp&&S.mp.resuming&&om&&om.g===myMp.g){ S.mp.resuming=false; if(S.mp.deal) mpStart(om,true,S.mp.deal); else { mpMsg="Ce duel ne peut pas être repris."; mpSaveSession(null); render(); } return; }
  if(S&&S.mp){ S.mp.gone=!o; if(om){ S.mp.oppLocked=!!(om.seal&&om.seal[S.turn]); } mpTryResolve(); }
  if(screen==="duel"||screen==="play") render();
}
function mpStart(om,replay,deal){
  const meHost=myMp.role==="host", hostP=meHost?myMp:om, guestP=meHost?om:myMp, seen0=replay&&S&&S.mp&&S.mp.seen||{}, ranked0=replay?!!(S&&S.mp&&S.mp.ranked):!!myMp.code&&mpRankedRoom===myMp.code;
  if(!deal||!validDeck(hostP.deck)||!validDeck(guestP.deck)||!Array.isArray(deal.locs)||deal.locs.length!==3||!deal.locs.every(l=>LOCS[l])) return;
  RNG=mulberry(deal.seed|0); uidN=0;
  const hostDeck=gShuffle(hostP.deck.map(mk)), guestDeck=gShuffle(guestP.deck.map(mk));
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:deal.locs.map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:meHost?hostDeck:guestDeck, e:meHost?guestDeck:hostDeck},
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null,
    mp:{g:myMp.g, meHost, oppNick:safeNick(om.nick), oppAv:POOL.includes(om.av)?om.av:null, locked:false, gone:false, replaying:!!replay, seen:seen0, deal:{seed:deal.seed|0,locs:deal.locs.slice()}, ranked:ranked0}};
  for(let i=0;i<3;i++){ draw(meHost?"p":"e"); draw(meHost?"e":"p"); }
  quiet=!!replay;
  log(`Duel contre ${S.mp.oppNick}`); sheet=null; if(mq) mqStop("");   /* la recherche est finie dès que le duel commence */
  screen="play"; startTurn();
  if(!replay) mpPend=null; mpSaveAll(); mpEnter();
  if(replay) mpReplay(om); else { sfx("loc"); render(); window.scrollTo(0,0); }
}
function mapPlays(side,plays){ const out=[]; if(!Array.isArray(plays)) return out;
  for(const pl of plays){ if(!Array.isArray(pl)) continue; const [uid,li]=pl;
    if(pl[2]==="o"){ if(uid>=0&&uid<3) out.oath=uid|0; continue; }   /* Serment : [lieu, 0, "o"], révélé avec les cartes en fin de tour */
    if(pl[2]==="s"){ for(let f=0;f<3;f++){ const c=S.board[side][f].find(x=>x.uid===uid); if(c&&li>=0&&li<3) out.swim={c,li:li|0,from:f}; } continue; }   /* Nageuse du Lac : [uid, lieu, "s"] */
    const c=S.hand[side].find(x=>x.uid===uid);
    if(c&&li>=0&&li<3&&!out.some(x=>x.c===c)) out.push({c,li:li|0}); } return out; }
/* Coups de l'adversaire : revérifiés avec les règles du jeu (checkPlays) ; un coup interdit est ignoré et noté au journal.
   S.mp.bad compte les refus : les deux téléphones divergent alors, et la partie ne devra pas compter (lot B). */
const BAD_WHY={energy:"énergie insuffisante",room:"plus de place",locked:"lieu fermé",banned:"interdite ce tour",themis:"Thémis",move:"déplacement impossible"};
function oppPlays(plays){ const r=checkPlays("e",mapPlays("e",plays));
  for(const [n,w] of r.bad) log(`Coup adverse refusé : ${n} (${BAD_WHY[w]})`);
  if(r.bad.length&&S.mp) S.mp.bad=(S.mp.bad||0)+r.bad.length;
  return r.plays; }
/* ======= Résultat validé par le serveur (anti-triche, lot B, duels-valides.sql) =======
   Au début du match, chacun s'inscrit (hôte ou invité) ; à la fin, chacun envoie son résultat et l'empreinte du relevé de la partie
   (graine, lieux, coups des deux joueurs dans l'ordre hôte puis invité, puissances finales). Deux téléphones honnêtes produisent
   le même relevé : le serveur valide. Sinon, « conflict », et la partie ne comptera jamais (lot C). S.mp.srv : réponse du serveur. */
async function mpDbGet(){ try{ mqDb=mqDb||await window.claude.use("db"); }catch(e){ mqDb=null; } return mqDb; }
function mpEnter(){ if(window.__wiped||!myMp||!S||!S.mp) return; const code=myMp.code, role=myMp.role, g=S.mp.g;
  mpDbGet().then(db=>{ if(db&&db.duelEnter) return db.duelEnter(code,g,role,BUILD); }).catch(()=>{}); }
function mpTr(t,mine,theirs){ if(S&&S.mp){ (S.mp.tr=S.mp.tr||{})[t]=[mine||[],theirs||[]]; } }
function mpRecord(){
  const h=S.mp.meHost, tr=S.mp.tr||{}, turns=Object.keys(tr).sort((a,b)=>a-b).map(t=>h?tr[t]:[tr[t][1],tr[t][0]]);
  /* bad : coups adverses refusés vus par CE téléphone. Deux joueurs honnêtes ont 0 ; un coup refusé rend les relevés différents (désaccord),
     même s'il n'a rien changé aux puissances finales */
  return {v:BUILD, seed:S.mp.deal.seed, locs:S.mp.deal.locs, t:turns, bad:S.mp.bad||0, fin:[0,1,2].map(li=>h?[total("p",li),total("e",li)]:[total("e",li),total("p",li)])};
}
async function mpReport(res){
  if(window.__wiped||!S||!S.mp||S.mp.reported||!myMp||!S.mp.deal) return;
  const sRef=S, mp=S.mp, code=myMp.code, role=myMp.role, g=mp.g; mp.reported=true;
  const oath=S.oath!=null?(leader(S.oath)==="p"?"kept":"broken"):null, cross=S.oath!=null&&S.oath===S.aiOath, ov=S.over;
  const rec=mpRecord(); let hash; try{ hash=mpHex(await mpHash(JSON.stringify(rec))); }catch(e){ return; }
  const db=await mpDbGet(); if(!db||!db.duelReport) return;
  const send=async()=>{ try{ const r=await db.duelReport(code,g,role,res,hash,rec); if(r&&r.status){ mp.srv=r.status; mp.ranked=r.ranked===true; if(r.status!=="open") mpRank(mp,ov,r,res,oath,cross); if(S===sRef) render(); } return r; }catch(e){ return null; } };
  let r=await send();
  for(let i=0;i<5&&r&&r.status==="open"&&S===sRef;i++){ await new Promise(ok=>setTimeout(ok,6000)); r=await send(); }   /* l'autre n'a pas encore envoyé : on relit la décision */
}
/* Lot C : duel classé validé et compté par le serveur → étoiles, comme une partie classée (Serment compris). Une seule fois par match.
   Même si le joueur a déjà quitté l'écran de fin ou lancé la revanche (ov garde le résultat de CE match). */
function mpRank(mp,ov,r,res,oath,cross){
  if(mp.rankDone||!r.ranked) return; mp.rankDone=true; mp.counted=!!r.counted;
  if(!r.counted||window.__wiped) return;
  if(res==="win") P.sw++; else if(res==="lose") P.sl++; else P.sd++;
  const rk=applyRank(res,oath,cross); if(ov) ov.rk=rk;
  save(); lbPublish(); if(rk.up) sfx("legend");
}
/* Coups révélés qui ne correspondent pas à l'empreinte publiée avant : tous refusés (il les a changés après avoir vu les miens) */
function oppSealed(plays,ok){ if(ok) return oppPlays(plays); log("Coups adverses refusés : ils ne correspondent pas à ceux annoncés"); if(S.mp) S.mp.bad=(S.mp.bad||0)+1; return []; }
async function mpReplay(om){
  while(S&&S.mp&&!S.over){
    const t=S.turn, done=myMp.hist&&myMp.hist[t], pend=mpPend&&mpPend.g===S.mp.g&&mpPend.t===t?mpPend:null, theirs=om.hist&&om.hist[t];
    if(done&&theirs){ const ok=await mpSealOk(theirs,om.salt&&om.salt[t],(S.mp.seen&&S.mp.seen[t])||(om.seal&&om.seal[t]));
      mpTr(t,done,theirs); await resolveTurn(mapPlays("p",done), oppSealed(theirs,ok), false); continue; }
    const mine=done||(pend&&pend.plays);
    if(mine){ const st=mapPlays("p",mine); S.hand.p=S.hand.p.filter(c=>!st.some(x=>x.c===c)); S.staged=st; S.swimP=st.swim||null; S.oathStage=st.oath!=null?st.oath:null; S.mp.locked=true;
      if(pend&&!done&&!(myMp.seal&&myMp.seal[t])) mpSealPush(pend); }   /* coupure entre le verrouillage et l'envoi de l'empreinte */
    break;
  }
  if(S&&S.mp){ S.mp.replaying=false; }
  quiet=false; render(); mpTick();
}
/* Fin du tour en duel : 1) j'envoie l'empreinte de mes coups ; 2) quand l'adversaire a envoyé la sienne, je révèle mes coups et le sel ;
   3) quand il a révélé les siens, je vérifie qu'ils correspondent à l'empreinte VUE AVANT de révéler les miens (S.mp.seen), puis le tour se joue. */
function mpLock(){
  if(!S.mp||S.mp.locked||S.busy||S.over) return;
  const plays=S.staged.map(x=>[x.c.uid,x.li]); if(S.swimP) plays.push([S.swimP.c.uid,S.swimP.li,"s"]);
  if(S.oathStage!=null) plays.push([S.oathStage,0,"o"]);   /* Serment caché : il voyage avec les coups du tour */
  S.mp.locked=true; mpPend={g:S.mp.g,t:S.turn,plays,salt:mpSalt()}; mpSaveAll();
  render(); mpSealPush(mpPend);
}
function mpSealPush(pend){
  mpSeal(pend.plays,pend.salt).then(h=>{ if(mpPend!==pend||!myMp) return; pend.seal=h; mpPush({t:pend.t,seal:Object.assign({},myMp.seal||{},{[pend.t]:h})}); mpSaveAll(); mpTryResolve(); })
    .catch(()=>{ if(mpPend!==pend) return; mpPend=null; if(S&&S.mp){ S.mp.locked=false; mpMsg="Ton navigateur ne peut pas sceller les coups (connexion non sécurisée)."; render(); } });
}
/* Rattrapage après une reprise : si mes coups du tour en cours sont déjà connus (révélés, ou scellés avant le rechargement), on les remet
   en place et on reverrouille. La reprise rejoue avec ce qu'on sait de l'adversaire à cet instant ; ses tours suivants arrivent ensuite
   (diffusion, présence en retard) et se résolvent ici, un par un. */
function mpCatchUp(){
  if(!S||!S.mp||S.mp.locked||S.busy||S.over||S.mp.replaying||!myMp) return;
  const t=S.turn, done=myMp.hist&&myMp.hist[t], pend=mpPend&&mpPend.g===S.mp.g&&mpPend.t===t?mpPend:null, mine=done||(pend&&pend.plays);
  if(!mine) return;
  const st=mapPlays("p",mine); S.hand.p=S.hand.p.filter(c=>!st.some(x=>x.c===c)); S.staged=st; S.swimP=st.swim||null; S.oathStage=st.oath!=null?st.oath:null; S.mp.locked=true;
  if(pend&&!done&&!(myMp.seal&&myMp.seal[t])) mpSealPush(pend);
}
function mpTryResolve(){
  mpCatchUp();
  if(!S||!S.mp||!S.mp.locked||S.busy||S.over||S.mp.replaying||S.mp.checking) return;
  const o=mpOpp(); if(!o) return; const om=o.presence.mp, t=S.turn;
  if(om.g!==S.mp.g) return;
  const theirSeal=om.seal&&om.seal[t]; if(typeof theirSeal!=="string") return;   /* il n'a pas encore fini son tour */
  if(!(myMp.hist&&myMp.hist[t])){
    if(!mpPend||mpPend.g!==S.mp.g||mpPend.t!==t||!mpPend.seal) return;
    S.mp.seen=Object.assign({},S.mp.seen,{[t]:(S.mp.seen&&S.mp.seen[t])||theirSeal});   /* son empreinte, notée AVANT de montrer mes coups */
    mpSaveAll(); mpPush({hist:Object.assign({},myMp.hist||{},{[t]:mpPend.plays}),salt:Object.assign({},myMp.salt||{},{[t]:mpPend.salt})}); mpSaveAll();
  }
  const th=om.hist&&om.hist[t], ts=om.salt&&om.salt[t]; if(!th||!ts) return;
  const sRef=S; S.mp.checking=true;
  mpSealOk(th,ts,S.mp.seen[t]).then(ok=>{
    if(S!==sRef) return; S.mp.checking=false; if(S.turn!==t||!S.mp.locked||S.busy||S.over) return;
    S.mp.locked=false; S.mp.oppLocked=false;
    const mineP=S.staged.slice(); if(S.swimP) mineP.swim=S.swimP; if(S.oathStage!=null) mineP.oath=S.oathStage;
    mpTr(t,myMp.hist[t],th); resolveTurn(mineP, oppSealed(th,ok), true);
  });
}
async function mpResume(){
  const s=mpSession(); if(!s||!rtReady()||mpConn||!MP_CODE.test(s.mp.code||"")) return; mpConn=true; mpMsg=""; render();
  const r=await rtOpen("c","helvara-room-"+s.mp.code); mpConn=false;
  if(!r){ mpMsg=RT_FAIL; render(); return; }
  myMp=null; mpPush(s.mp); mpPend=s.pend&&s.pend.g===s.mp.g?s.pend:null;
  S={mp:{resuming:true,g:s.mp.g,oppNick:s.oppNick,ranked:!!s.ranked,deal:s.deal&&Array.isArray(s.deal.locs)?s.deal:null,seen:s.seen&&typeof s.seen==="object"?s.seen:{}}, over:null};
  screen="duel"; render(); mpTick();
}
function onlineHTML(){
  const banner=`<p class="notice">Alpha : les parties en ligne sont en test, des bugs et des remises à zéro sont possibles.</p>`;
  if(mq) return `<section class="sec mpbox"><h2>En ligne (Alpha)</h2>${banner}
    <p><span>Recherche d'un adversaire…</span> ${(n=>`<span class="hint">${n} joueur${n>1?"s":""} en recherche</span>`)(mq.sql?(mq.waiting||0)+1:mqOnline())}</p>
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
      <div class="mpjoin"><input id="mp-code" class="mpinput" maxlength="24" placeholder="OUCHY-K7M4QX" autocomplete="off" aria-label="Code du salon"><button class="ghost" data-act="mpjoin">Rejoindre</button></div>
      ${mpMsg?`<p style="color:var(--warm)">${esc(mpMsg)}</p>`:""}
    </section>${onlineHTML()}${invite}`;
  }
  const o=mpOpp(), om=o&&o.presence.mp;
  const status=mpMsg?esc(mpMsg):mq&&mq.room?"Adversaire trouvé, connexion au salon…":myMp.role==="host"?(om?`${esc(safeNick(om.nick))} arrive, la partie commence…`:"En attente d'un adversaire. Envoie-lui le code."):
    mpRoomFull()?"Ce salon est déjà complet.":om?`Connecté à ${esc(safeNick(om.nick))}. La partie commence…`:"Salon introuvable pour l'instant. Vérifie le code, ou attends que ton ami le crée.";
  return `<section class="sec mpbox"><h2>Salon</h2>
    <div class="mpcode">${esc(myMp.code)}</div>
    <p>${status}</p>
    <div class="row2"><button class="ghost" data-act="mpcopy">Copier le code</button><button class="ghost" data-act="mpcancel">Quitter le salon</button></div>
  </section>${invite}`;
}

/* page fermée ou quittée pendant une recherche : on sort de la file tout de suite (sinon la base attend 20 s) */
addEventListener("pagehide",()=>{ if(mq&&mq.sql&&!mq.room&&mqDb) mqDb.mmLeave().catch(()=>{}); });
