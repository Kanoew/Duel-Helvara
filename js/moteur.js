/* Duel d'Helvara : moteur de partie, IA, fin de tour et fin de partie.
   Extrait d'index.html le 12 octobre 2026 sans aucun changement de code : les fichiers js/ se chargent dans l'ordre d'index.html et partagent la même portée globale. */
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const pickRand=a=>a[Math.floor(Math.random()*a.length)];
let RNG=Math.random; const rnd=()=>RNG();
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const gShuffle=a=>{ for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const gPick=a=>a[Math.floor(rnd()*a.length)];
let quiet=false;
const mk=id=>({uid:++uidN,id,pow:CARDS[id].pow,rev:false,fresh:false,neg:false,pay:0,mods:[]});
function snapPow(){ const m=new Map(); for(const s of ["p","e"]) for(const col of S.board[s]) for(const c of col) m.set(c,c.pow); return m; }
function diffPow(m,src){ for(const s of ["p","e"]) for(const col of S.board[s]) for(const c of col){ if(c.reset){ delete c.reset; continue; } if(m.has(c)&&c.pow!==m.get(c)){ (c.mods=c.mods||[]).push({v:c.pow-m.get(c),src}); } } }
const opp=s=>s==="p"?"e":"p";
const deckReady=()=>P.deck.length===ECO.deckSize;

function aiDeck(t,full){
  const own=full?4:Math.max(2,...P.owned.map(id=>RVAL[CARDS[id].r]));
  const cap=Math.min([1,2,3,3,4,4,4][t],own);
  const pool=PACK().filter(id=>RVAL[CARDS[id].r]<=cap);
  const facs=Object.keys(FAC).filter(f=>pool.filter(id=>CARDS[id].fac===f).length>=3);
  const fac=pickRand(facs.length?facs:Object.keys(FAC));
  const sc={}; pool.forEach(id=>sc[id]=(CARDS[id].fac===fac?5:0)+RVAL[CARDS[id].r]*t*0.35+Math.random()*2.5);
  const by=pool.slice().sort((a,b)=>sc[b]-sc[a]); const deck=[];
  for(const [c,n] of [[1,2],[2,3],[3,3],[4,2],[5,1],[6,1]]) by.filter(id=>CARDS[id].cost===c&&!deck.includes(id)).slice(0,n).forEach(id=>deck.push(id));
  for(const id of by){ if(deck.length>=ECO.deckSize) break; if(!deck.includes(id)) deck.push(id); }
  /* deck à thème : une carte d'une synergie connue amène son partenaire, s'il est permis à ce palier */
  const inPool=new Set(pool), paired=id=>deck.some(x=>x!==id&&((AI_PREP[x]||[]).includes(id)||(AI_PREP[id]||[]).includes(x)));
  const weakest=()=>{ let k=-1; deck.forEach((x,i)=>{ if(!paired(x)&&(k<0||sc[x]<sc[deck[k]])) k=i; }); return k; };
  for(const id of deck.slice()){ const mates=[...(AI_PREP[id]||[]),...(AI_PAY[id]||[]).map(p=>p.a)].filter(x=>inPool.has(x)&&!deck.some(y=>charOf(y)===charOf(x)));
    if(mates.length&&!paired(id)){ const k=weakest(); if(k>=0&&deck[k]!==id) deck[k]=mates[0]; } }
  /* palier 4 et plus : une ultra-légendaire si le deck remplit ses conditions */
  if(t>=4){ for(const u of shuffle(ULS.filter(u=>REL(u.id)))){ if(!ulOk(u,deck)) continue; const need=new Set(u.req.flat()); let k=-1; deck.forEach((x,i)=>{ if(!need.has(x)&&!paired(x)&&CARDS[x].fac!==u.fac&&(k<0||sc[x]<sc[deck[k]])) k=i; }); if(k<0) deck.forEach((x,i)=>{ if(!need.has(x)&&(k<0||sc[x]<sc[deck[k]])) k=i; }); if(k>=0){ const was=deck[k]; deck[k]=u.id; if(ulOk(u,deck)) break; deck[k]=was; } } }
  return {deck:deck.slice(0,ECO.deckSize),fac};
}
function newGame(){
  RNG=Math.random;
  if(!deckReady()){ screen="deck"; render(); return; }
  if(S&&S.blitz&&!S.over) bzEndRun();
  const locIds = games===0 && P.w+P.l+P.d===0 ? ["ruelle","ouchy","sousgare"] : shuffle(locPool()).slice(0,3);
  games++;
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:locIds.map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:shuffle(P.deck.map(mk)), e:[]}, aiTier:tierOf(P.lv), aiFac:null,
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null};
  const ai=aiDeck(S.aiTier); S.deck.e=shuffle(ai.deck.map(mk)); S.aiFac=ai.fac;
  for(let i=0;i<3;i++){draw("p");draw("e");}
  log(`Adversaire : deck ${FAC[ai.fac].n} · niveau ${TIERS[S.aiTier]}`);
  screen="play"; startTurn();
}
function log(t){ S.log.unshift(t); S.log=S.log.slice(0,40); }
function draw(s){ if(S.deck[s].length && S.hand[s].length<7) S.hand[s].push(S.deck[s].shift()); }
/* Serment adverse : l'IA jure sur le lieu où elle mène le plus. Plus elle est forte, plus elle ose (et bluffe un peu). */
function aiOath(){
  if(!oathOK()||S.aiOath!=null) return;
  const t=S.aiTier||0; let best=null;
  for(let li=0;li<3;li++) if(S.locs[li].rev){ const m=total("e",li)-total("p",li); if(!best||m>best.m) best={li,m}; }
  if(!best) return;
  let li=null;
  if(best.m>=(S.turn>=4?2:4)&&Math.random()<0.3+0.08*t) li=best.li;
  else if(S.turn>=3&&Math.random()<0.04+0.02*t){ const c=[0,1,2].filter(i=>S.locs[i].rev&&total("e",i)-total("p",i)>=-3); if(c.length) li=c[Math.floor(Math.random()*c.length)]; }
  if(li==null) return;
  S.aiOath=li; log(`L'adversaire jure sur ${LOCS[S.locs[li].id].name}`); sfx("legend");
}
function pilesHTML(){ if(S.tut) return ""; piles(); const D=S.discardPile, G=S.graveyard;
  return `<div class="pilesbar"><span>Main adverse : <b>${S.hand.e.length}</b></span><button class="pilebtn" data-act="pileview" data-p="d"><span>Défausses :</span> <b style="color:var(--me)">${D.p.length}</b> · <b style="color:var(--foe)">${D.e.length}</b></button><button class="pilebtn" data-act="pileview" data-p="g"><span>Cimetières :</span> <b style="color:var(--me)">${G.p.length}</b> · <b style="color:var(--foe)">${G.e.length}</b></button></div>`; }
/* Défausse ou cimetière ouverts au toucher : les deux camps, la carte la plus récente en premier. */
function pileHTML(){
  piles(); const grave=gz==="pg", P2=grave?S.graveyard:S.discardPile;
  const side=(s,lab,col)=>{ const ids=P2[s].slice().reverse();
    return `<div class="pileside"><div class="m" style="color:${col}">${lab} · ${ids.length}</div>${ids.length?`<div class="pilegrid">${ids.map(id=>thumb(id,`data-act="zoom" data-id="${id}"`)).join("")}</div>`:`<p class="hint">Vide.</p>`}</div>`; };
  return `<div class="veil" data-act="gzclose"><div class="pilepanel zoominfo"><div class="t">${grave?"Cimetières":"Défausses"}</div>
    <p class="hint">${grave?"Les cartes détruites.":"Les cartes défaussées depuis la main."} Touche une carte pour la lire.</p>
    ${side("p","Toi","var(--me)")}${side("e","Adversaire","var(--foe)")}
    <button class="ghost" data-act="gzclose">Fermer</button></div></div>`; }
function aiOathBar(){
  if(S.aiOath==null||S.over) return "";
  const n=LOCS[S.locs[S.aiOath].id].name;
  if(S.oath===S.aiOath) return `<div class="oathbar sworn">⚖ Serment croisé sur <b>${n}</b> : tout se joue sur ce lieu. Gagne-le avec la partie : +4 étoiles. Perds-le avec la partie : −4.</div>`;
  if(S.oath==null&&oathOK()&&!S.aiOathSkip) return `<div class="oathbar"><span>⚖ L'adversaire jure sur <b>${n}</b>. Relever le défi ?</span><span class="oathbtns" style="margin:0"><button class="primary small" data-act="oathcross">Relever</button><button class="ghost small" data-act="oathskip">Ignorer</button></span></div>`;
  return `<div class="oathbar sworn" style="color:var(--mist)">⚖ L'adversaire a juré sur <b>${n}</b>.</div>`;
}
function startTurn(){
  S.turn++;
  S.energy=S.turn+S.bonus.p; S.energyE=S.turn+S.bonus.e; S.bonus={p:0,e:0};
  if(S.turn<=3){ const L=S.locs[S.turn-1], li=S.turn-1; L.rev=true; log(`Tour ${S.turn} · lieu révélé : ${LOCS[L.id].name}`); sfx("loc"); if(screen==="play") setTimeout(()=>FX.play("l_"+L.id,{li}),60); }
  else log(`Tour ${S.turn}`);
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li])
    if(c.rev && c.id==="vasseur" && c.pay===S.turn && !c.neg){ c.pow+=4; (c.mods=c.mods||[]).push({v:4,src:"Vasseur (paiement)"}); log(`Vasseur paie : +4 (${who(s)})`); sfx("coin"); }
  /* Qetesh du Nouvel An : à minuit (début du tour qui suit sa Révélation), elle charme la carte adverse la plus forte ici de coût 5 ou moins */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(c.midnight===S.turn){ c.midnight=0;
    if(!live(c)) continue; const t=midnightCharm(s,li,c);
    if(t){ log(`Minuit · ${nm(c)} charme ${nm(t)} (${who(s)})`); sfx("legend"); } }
  draw("p"); draw("e"); S.sel=null; render();
}

/* --- règles utilitaires --- */
const locIs=(li,key)=>S.locs[li].rev && !S.locs[li].stopped && S.locs[li].id===key;
const cap=li=>(locIs(li,"ruelle")?2:4);
const capOf=(s,li)=>Math.max(0,cap(li)-((S.cond&&S.cond[s][li])||0));
const muted=(s,li)=>!!(S.mute&&S.mute.some(m=>m.s===s&&m.li===li&&m.t===S.turn));
const nemInv=li=>(["p","e"].reduce((n,s)=>n+S.board[s][li].filter(o=>live(o)&&o.id==="nemesis").length,0))%2===1;
function captorLive(uid){ for(const s of ["p","e"]) for(const col of S.board[s]) for(const o of col) if(o.uid===uid&&live(o)) return true; return false; }
const stagedAt=li=>S.staged.filter(x=>x.li===li).length;
const live=(c)=>c.rev&&!c.neg;
const onSide=(s,id)=>S.board[s].some(col=>col.some(c=>c.rev&&c.id===id));
const inPlay=id=>["p","e"].some(s=>S.board[s].some(col=>col.some(c=>c.rev&&c.id===id)));
const hasHere=(s,li,id)=>S.board[s][li].some(c=>live(c)&&c.id===id);
const shielded=(s,li)=>hasHere(s,li,"eir")||hasHere(s,li,"ulcal");               /* Eir : ni détruites ni affaiblies */
const untargetable=(by,s,c)=>by!==s && c.id==="uzume" && !c.neg; /* Uzume : effets adverses */
function costOf(s,c,li,isFirst){ return c.free?0:costFor(s,c.id,li,isFirst); }
function costFor(s,id,li,isFirst){ let c=CARDS[id].cost; if(id==="ulya") c-=S.hand[s].filter(x=>x.id!=="ulya").length; if(isFirst) c-=S.disc[s]; if(locIs(li,"sousgare")) c-=1; if(locIs(li,"encheres")) c+=1; return Math.max(0,c); }
function used(){ return S.staged.reduce((a,x,i)=>a+(x.fixed!=null?x.fixed:costOf("p",x.c,x.li,i===0)),0); }
/* Nemesis ne peut pas être jouée au tour 6, même avec de l'énergie en réserve (Prométhée) */
const banned=c=>c.id==="nemesis"&&S.turn>=6;
function canStage(c,li){
  if(S&&S.tut){ if(!tutReq().some(([id,l])=>id===c.id&&l===li&&!S.staged.some(x=>x.c.id===id))) return false; }
  if(!c||S.locs[li].locked||muted("p",li)) return false;
  if(banned(c)) return false;
  if(S.board.p[li].length+stagedAt(li)>=capOf("p",li)) return false;
  return used()+costOf("p",c,li,S.staged.length===0)<=S.energy;
}
function cardPow(s,li,c){
  if(!c.rev) return 0;
  if(c.captive&&captorLive(c.captive)) return 0;
  let p=c.pow; const d=CARDS[c.id];
  if(!fated(c)) for(const o of S.board[s][li]) if(o!==c && live(o) && o.id==="mouche") p-=1;
  for(const o of S.board[s][li]) if(o!==c && live(o) && o.id==="ulcal") p+=2;
  for(const o of S.board[s][li]) if(o!==c && live(o) && o.id==="ishara") p+=1;
  if(d.fac==="helvara") for(let i=0;i<3;i++) for(const o of S.board[s][i]) if(o!==c && live(o) && o.id==="doyenne") p+=1;
  if(!c.neg){
    if(c.id==="costumes" && inPlay("thot")) p+=4;
    if(c.id==="freyr" && hasHere(s,li,"freya")) p+=2;
    if(c.id==="freya" && hasHere(s,li,"freyr")) p+=4;
    if(c.id==="selene" && S.turn>=5) p+=3;
    if(c.id==="nergal" && S.board[s].some(col=>col.some(o=>live(o)&&o.id==="ereshkigal"))) p+=3; /* continu */
    if((c.id==="nike"||c.id==="bia") && S.board[s].some(col=>col.some(o=>live(o)&&o.id==="styx"))) p+=3; /* Styx veille sur ses filles */
    if(c.id==="fange") p+=S.discarded||0;
    if(c.id==="ulqetyar") for(let i=0;i<3;i++){ const f=S.board[s][i].filter(o=>o.rev).map(o=>CARDS[o.id].fac); if(f.includes("desir")&&f.includes("primordial")) p+=3; }
    if(c.id==="yarden_d") for(let i=0;i<3;i++) for(const o of S.board[s][i]) if(o!==c&&o.rev&&CARDS[o.id].fac==="primordial"&&!CARDS[o.id].token) p+=2;
  }
  for(let i=0;i<3;i++) for(const o of S.board[s][i]) if(o!==c&&live(o)&&o.id==="ulqetjor") p+=1;
  for(const o of S.board[s][li]) if(o!==c&&live(o)&&o.id==="ulqetjor_r") p+=2;
  if(c.risen&&S.board[s].some(col=>col.some(o=>live(o)&&o.id==="izanami"))) p+=2; /* Izanami : tes cartes ressuscitées */
  if(locIs(li,"domaine")&&JPARTNERS.has(c.id)) p+=2;
  if(!shielded(s,li)&&!sunlit(s)&&!noWeak(c)&&!(c.id==="baldur"&&!c.neg)) p-=S.board[opp(s)][li].filter(o=>live(o)&&o.id==="hathor").length;
  if(locIs(li,"tour") && d.pow>=5 && !d.token) p+=2;
  if(locIs(li,"encheres") && !d.token) p+=2;
  if(locIs(li,"escaliers") && d.fac==="helvara" && !d.token) p+=2;
  if(!fated(c)&&S.board[opp(s)][li].some(o=>live(o)&&o.id==="chernobog")) p=Math.min(p,d.pow);
  if(hasHere(s,li,"psyche")) p=Math.max(1,p);
  return p;
}
function total(s,li){
  const o=opp(s);
  let t=S.board[s][li].reduce((a,c)=>a+(c.charm===o?0:cardPow(s,li,c)),0)+S.board[o][li].reduce((a,c)=>a+(c.charm===s?cardPow(o,li,c):0),0);
  for(const i of [li-1,li+1]) if(i>=0&&i<3) t+=2*S.board[s][i].filter(c=>live(c)&&c.id==="graffeur").length;
  if(locIs(li,"cathedrale")){ const a=S.board[s][li].filter(c=>c.rev).length, b=S.board[opp(s)][li].filter(c=>c.rev).length; if(a>0&&a<b) t+=3; }
  return t;
}
function leader(li){
  let a=total("p",li), b=total("e",li);
  if(nemInv(li)){ a=-a; b=-b; }
  if(a>b) return "p"; if(b>a) return "e";
  const mp=hasHere("p",li,"morrigan"), me=hasHere("e",li,"morrigan");
  if(mp&&!me) return "p"; if(me&&!mp) return "e"; return null;
}
const who=s=>s==="p"?P.name:(S&&S.mp?S.mp.oppNick:"L'adversaire");
const sunlit=s=>S.board[s].some(col=>col.some(x=>live(x)&&x.id==="amaterasu"));
/* Défausse et cimetière : on garde les cartes (Hel, Hadès, Loviatar, le Tombeau). Les jetons et les Échos disparaissent. */
const piles=()=>{ S.discardPile=S.discardPile||{p:[],e:[]}; S.graveyard=S.graveyard||{p:[],e:[]}; };
const real=c=>!CARDS[c.id].token&&!c.echo;
function discard(s,c){ if(s==="p"&&qLive()) qProg("disc3"); S.hand[s]=S.hand[s].filter(x=>x!==c); S.discarded=(S.discarded||0)+1; piles(); if(real(c)) S.discardPile[s].push(c.id); }
function bury(s,c){ piles(); if(real(c)) S.graveyard[s].push(c.id);
  if(c.id==="mjolnir"&&c.thor){ for(const col of S.board[s]) for(const t of col) if(t.uid===c.thor&&live(t)){ t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"Mjölnir"}); log(`Thor récupère Mjölnir : +2 (${who(s)})`); } } }
/* Qetesh du Nouvel An, minuit : la carte adverse la plus forte ici de coût 5 ou moins est charmée (renvoie la cible ou null) */
function midnightCharm(s,li,c){
  const o=opp(s);
  const t=S.board[o][li].filter(x=>x.rev&&!x.charm&&!untargetable(s,o,x)&&CARDS[x.id].cost<=5).sort((a,b)=>cardPow(o,li,b)-cardPow(o,li,a))[0];
  if(t) t.charm=s; return t||null; }
/* Ressusciter : la carte revient révélée, à sa puissance de base, sans Révélation (sauf withReveal). */
function resurrect(s,id,li,from,opts={}){
  if(S.locs[li].locked&&!opts.anyLoc) return null; if(S.board[s][li].length>=capOf(s,li)) return null;
  const pile=from==="grave"?S.graveyard[s]:S.discardPile[s]; const k=pile.lastIndexOf(id); if(k<0) return null; pile.splice(k,1);
  const c=mk(id); c.fresh=true; c.risen=true; S.board[s][li].push(c);
  if(opts.ward) c.ward=true; if(opts.sick){ c.pow-=opts.sick; c.mods.push({v:-opts.sick,src:"Loviatar"}); }
  if(opts.withReveal) reveal(s,li,c); else c.rev=true;
  return c;
}
function resurrectAll(s,opts={}){ piles(); let n=0; const ids=gShuffle(S.discardPile[s].slice());
  for(const id of ids){ const sp=[0,1,2].filter(i=>!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)); if(!sp.length) break; if(resurrect(s,id,gPick(sp),"discard",opts)) n++; }
  return n; }
/* Source de l'effet en cours : Baldur ne cède qu'aux effets adverses de coût 2 ou moins (le gui). */
let SRC=null;
const baldurSafe=(s,c)=>c.id==="baldur"&&!c.neg&&!(SRC&&(SRC.s===s||SRC.cost<=2));
/* Ananké, Fatalité : ni détruite, ni déplacée, ni affaiblie (Continu : Apsu ou Mohini la privent de cette protection) */
const fated=c=>c.id==="ananke"&&!c.neg;
const noWeak=c=>((c.id==="ecorche"||c.id==="jordan")&&!c.neg)||c.noweak||c.ward||fated(c); /* l'Écorché, Jordan, le Tatoueur, Hel X Baldur */
function weaken(s,li,c,n){ if(shielded(s,li)||sunlit(s)||noWeak(c)||baldurSafe(s,c)) return false; c.pow-=n; return true; }
/* Styx : les cartes Jugement de son côté, dans son lieu, ne peuvent pas être détruites */
const styxSafe=(s,li,c)=>CARDS[c.id]&&CARDS[c.id].fac==="jugement"&&S.board[s][li].some(x=>live(x)&&x.id==="styx");
/* Le Flon : une carte qui arrive ici par un déplacement gagne +2 */
function flonHook(i,t){ if(locIs(i,"flon")){ t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"Le Flon"}); } }
/* Sauvabelin : aucune carte ne peut être détruite dans ce lieu, quelle que soit la source */
const forest=li=>locIs(li,"sauvabelin");
function destroy(s,li,c){ if(forest(li)||shielded(s,li)||c.ward||fated(c)||baldurSafe(s,c)||styxSafe(s,li,c)) return false; S.board[s][li]=S.board[s][li].filter(x=>x!==c); S.destroyed++; bury(s,c); if(s==="e") S.killE=(S.killE||0)+1; danteHook(li); return true; }
const nm=c=>CARDS[c.id].name;
/* Le Cirque : mêmes protections que contre un affaiblissement, plus Uzume et Baldur (sans effet perdu), et les captives */
const cirqueSafe=(s,li,c)=>shielded(s,li)||sunlit(s)||noWeak(c)||styxSafe(s,li,c)||(!c.neg&&(c.id==="uzume"||c.id==="baldur"))||!!(c.captive&&captorLive(c.captive));
/* Dante : chaque carte détruite dans son lieu, des deux côtés, lui donne +1 */
function danteHook(li){ for(const side of ["p","e"]) for(const d of S.board[side][li]) if(live(d)&&d.id==="dante"){ d.pow+=1; (d.mods=d.mods||[]).push({v:1,src:"Dante"}); log(`Dante · +1 (${who(side)})`); } }
/* Médée : sa prochaine carte adverse jouée ici perd 2 (les deux suivantes avec Hécate) */
function medeeHook(s,li,c){ if(!S.board[s][li].includes(c)) return; const o=opp(s);
  for(const m of S.board[o][li]) if(live(m)&&m.id==="medee"&&(m.mdHit||0)<(onSide(o,"hecate")?2:1)){
    m.mdHit=(m.mdHit||0)+1; const prev=SRC; SRC={s:o,cost:CARDS.medee.cost};
    const ok=!untargetable(o,s,c)&&weaken(s,li,c,2); SRC=prev;
    if(ok){ (c.mods=c.mods||[]).push({v:-2,src:"Médée"}); log(`Médée · −2 à ${nm(c)} (${who(s)})`); sfx("debuff"); }
    break; } }
/* Cartes qui forment une Fusion avec Jordan (Domaine du Créateur) */
const JPARTNERS=new Set((()=>{ const out=[]; for(const u of ULS) if(u.req.some(r=>[].concat(r).some(x=>charOf(x)==="jordan"))) for(const r of u.req) for(const x of [].concat(r)) if(charOf(x)!=="jordan") out.push(x); return out; })());

function reveal(s,li,c){
  const prevSrc=SRC; SRC={s,cost:CARDS[c.id].cost};
  try{ revealFx(s,li,c); } finally { SRC=prevSrc; }
}
/* Rejouer la Révélation d'une carte déjà posée (Aphrodite) : ni Brigid, ni effets de lieu à la pose */
const replayable=x=>x.rev&&!x.neg&&!CARDS[x.id].token&&charOf(x.id)!=="aphrodite"&&x.id!=="ulaph";
function replayFx(s,li,x){ const prev=SRC; SRC={s,cost:CARDS[x.id].cost}; try{ revealFx(s,li,x,{replay:true}); } finally { SRC=prev; } }
function revealFx(s,li,c,opts={}){
  c.rev=true; if(!opts.replay) c.fresh=true; piles();
  const o=opp(s), d=CARDS[c.id];
  const foes=S.board[o][li].filter(x=>x.rev);
  const targets=foes.filter(x=>!untargetable(s,o,x));
  const mates=S.board[s][li].filter(x=>x!==c&&x.rev);
  const pw=(side,l,x)=>cardPow(side,l,x);
  const strongest=(arr,side,l)=>arr.slice().sort((a,b)=>pw(side,l,b)-pw(side,l,a))[0];
  const weakest=(arr,side,l)=>arr.slice().sort((a,b)=>pw(side,l,a)-pw(side,l,b))[0];
  let note="", snd="reveal";
  const buffSelf=n=>{ c.pow+=n; note=(note?note+", ":"")+`+${n}`; snd="buff"; };
  S.forge=S.forge||{p:0,e:0};
  if(S.forge[s]&&c.id!=="brigid"&&!opts.replay){ S.forge[s]=0; c.pow+=3; (c.mods=c.mods||[]).push({v:3,src:"Brigid"}); note="+3 (Brigid)"; snd="buff"; }
  switch(c.id){
    case "jordan_n": { const ok=new Set(); for(const u of ULS) if(u.req.some(r=>Array.isArray(r)?r.includes("jordan_n"):r==="jordan_n")) for(const r of u.req) for(const id of (Array.isArray(r)?r:[r])) if(charOf(id)!=="jordan") ok.add(id); const y=S.deck[s].find(x=>ok.has(x.id)); if(y&&S.hand[s].length<7){ S.deck[s]=S.deck[s].filter(x=>x!==y); S.hand[s].push(y); note=`ajoute ${nm(y)} à sa main`; snd="buff"; } break; }
    case "joanna": { let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&S.board[s][i].some(x=>x.rev)&&S.board[s][i].length<capOf(s,i)){ const t=mk("lanterne"); t.rev=true; t.fresh=true; S.board[s][i].push(t); n++; } if(n) note=`${n} Lanterne${n>1?"s":""}`; break; }
    case "ares_h": { let n=0; for(const x of targets) if(weaken(o,li,x,2)) n++; if(n){ c.pow+=n; note=`−2 à ${n}, +${n}`; snd="debuff"; } break; }
    case "nergal_h": { let n=0; for(const side of [s,o]) for(let i=0;i<3;i++) for(const x of S.board[side][i].slice()) if(x!==c&&x.rev&&pw(side,i,x)<=1&&!(side===o&&untargetable(s,o,x))&&destroy(side,i,x)) n++; if(n){ c.pow+=2*n; note=`la peste emporte ${n} carte${n>1?"s":""}, +${2*n}`; snd="destroy"; } break; }
    case "aphrodite_n": { let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)){ const t=mk("refaph"); t.pow=3; t.rev=true; t.fresh=true; S.board[s][i].push(t); n++; } if(n) note=`${n} Reflet${n>1?"s":""} d'Aphrodite (3)`; break; }
    case "sekhmet_n": { let n=0; for(const x of targets.filter(x=>pw(o,li,x)<=2)) if(destroy(o,li,x)) n++; if(n){ note=`détruit ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "calypso_n": { const t=strongest(targets.filter(x=>!fated(x)),o,li); if(t&&!shielded(o,li)&&!sunlit(o)){ t.captive=c.uid; note=`${nm(t)} est captive`; snd="lock"; } if(foes.length) buffSelf(foes.length); break; }
    case "apsu_n": { foes.forEach(x=>x.neg=true); S.disc[s]=2; note=(foes.length?`${foes.length} carte${foes.length>1?"s":""} sans effet, `:"")+"prochaine carte −2"; snd="void"; if(onSide(s,"yarden")) buffSelf(4); break; }
    case "mendiant": { const t=gPick(S.hand[s]); if(t){ discard(s,t); note=`défausse ${nm(t)}`; } break; }
    case "voleuse": { const t=gPick(S.hand[o]); if(t){ discard(o,t); note=`${who(o)} défausse ${nm(t)}`; snd="void"; } break; }
    case "sansvoix": if(S.turn<6){ (S.mute=S.mute||[]).push({s:o,li,t:S.turn+1}); note="silence au prochain tour"; snd="lock"; } break;
    case "chasseur": { const t=strongest(foes,o,li); if(t&&S.board[s][li].length<capOf(s,li)){ const e=mk(t.id); e.rev=true; e.fresh=true; e.neg=true; e.echo=true; e.pow=Math.max(0,pw(o,li,t))-(locIs(li,"tour")&&CARDS[t.id].pow>=5&&!CARDS[t.id].token?2:0); S.board[s][li].push(e); note=`Écho ${/^[aeiouyéèêâîh]/i.test(nm(t))?"d’":"de "}${nm(t)} (${pw(o,li,t)})`; snd="void"; } break; }
    case "set": { let n=0; for(const t of targets.filter(x=>!fated(x))){ const sp=[0,1,2].filter(i=>i!==li&&S.board[o][i].length<capOf(o,i)); if(!sp.length) break; const i=gPick(sp); S.board[o][li]=S.board[o][li].filter(x=>x!==t); S.board[o][i].push(t); flonHook(i,t); if(s==="p"&&qLive()) qProg("move2"); n++; } if(n){ note=`disperse ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "maree": { let n=0; for(const t of targets.filter(x=>CARDS[x.id].cost<=2)) if(destroy(o,li,t)) n++; if(n){ note=`détruit ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "brigid": S.forge[s]=1; note="la forge s'allume"; snd="buff"; break;
    case "lipdentelle": { const t=S.hand[s].slice().sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; if(t){ discard(s,t); const v=Math.max(0,CARDS[t.id].pow); c.pow+=v; note=`défausse ${nm(t)}, +${v}`; snd="buff"; } break; }
    case "andraste": if(foes.length) buffSelf(2*foes.length); break;
    case "aphrodite": { const t=S.board[s][li].filter(x=>x!==c&&replayable(x)&&CARDS[x.id].fac==="desir").sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost||pw(s,li,b)-pw(s,li,a))[0]; if(t){ replayFx(s,li,t); note=`rejoue ${nm(t)}`; snd="void"; } break; }
    case "calypso": { const t=strongest(targets.filter(x=>!fated(x)),o,li); if(t&&!shielded(o,li)&&!sunlit(o)){ t.captive=c.uid; note=`${nm(t)} est captive`; snd="lock"; } break; }
    case "tefnut": { mates.forEach(x=>x.pow+=1); if(mates.length){ note=`+1 à ${mates.length} carte${mates.length>1?"s":""}`; snd="buff"; } break; }
    case "susanoo": { const t=weakest(mates.filter(x=>!fated(x)),s,li); const spots=[0,1,2].filter(i=>i!==li&&S.locs[i].rev&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)); if(t&&spots.length){ const i=gPick(spots); S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][i].push(t); flonHook(i,t); if(s==="p"&&qLive()) qProg("move2"); t.fresh=true; t.pow+=3; (t.mods=t.mods||[]).push({v:3,src:"Susanoo"}); note=`${nm(t)} part vers ${LOCS[S.locs[i].id].name}, +3`; snd="buff"; } if(onSide(s,"amaterasu")) buffSelf(2); break; }
    case "bourreau": { S.cond=S.cond||{p:[0,0,0],e:[0,0,0]}; if(S.cond[o][li]<4){ S.cond[o][li]++; note="une case adverse est condamnée"; snd="lock"; } break; }
    case "anubis": { if(total(o,li)>total(s,li)){ const t=strongest(targets,o,li); if(t&&destroy(o,li,t)){ note=`le cœur est trop lourd : détruit ${nm(t)}`; snd="destroy"; } } else buffSelf(4); break; }
    case "balor": { let n=0; for(const t of gShuffle(targets.slice()).slice(0,2)) if(weaken(o,li,t,3)) n++; if(n){ note=`−3 à ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "ulaph": { const list=S.board[s][li].filter(x=>x!==c&&replayable(x)); let n=0; for(const x of list){ if(!S.board[s][li].includes(x)) continue; replayFx(s,li,x); n++; } if(n){ note=`rejoue ${n} carte${n>1?"s":""}`; snd="void"; } break; }
    case "ulnem": { let n=0; const a=strongest(targets,o,li); if(a&&destroy(o,li,a)) n++; const b=strongest(mates,s,li); if(b&&destroy(s,li,b)) n++; S.board[s][li].filter(x=>x!==c&&x.rev).forEach(x=>x.pow+=2); note=`justice : ${n} carte${n>1?"s":""} détruite${n>1?"s":""}`; snd="destroy"; break; }
    case "coursier": draw(s); note="pioche 1 carte"; break;
    case "felix": S.disc[s]=1; note="prochaine carte −1"; break;
    case "remi": if(S.destroyed+(S.discarded||0)) buffSelf(2*(S.destroyed+(S.discarded||0))); break;
    case "celeste": if(total(s,li)-cardPow(s,li,c)<=total(o,li)) buffSelf(3); break;
    case "vasseur": c.pay=S.turn+2; note=S.turn+2<=6?`paiera au tour ${S.turn+2}`:"ne sera jamais payé"; break;
    case "esquille": { const t=weakest(targets,o,li); if(t&&destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } else if(t) note=`${nm(t)} est protégée`; break; }
    case "troll": { const t=weakest(mates,s,li); if(t&&destroy(s,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } break; }
    case "vritra": S.locs[li].locked=true; note="le lieu est verrouillé"; snd="lock"; break;
    case "yarden": if([0,1,2].every(i=>S.board[s][i].length>0)) buffSelf(4); break;
    case "nyx": { const t=strongest(foes.filter(x=>!fated(x)),o,li); if(t&&!forest(li)){ S.board[o][li]=S.board[o][li].filter(x=>x!==t); S.destroyed++; bury(o,t); if(o==="e") S.killE=(S.killE||0)+1; danteHook(li); note=`détruit ${nm(t)}`; snd="void"; } break; }
    case "pandore": { const k=(S.unspent&&S.unspent[s])||0; if(k){ S.unspent[s]=0; buffSelf(2*k); note=`dépense ${k} énergie, +${2*k}`; } break; }
    case "athena": { const top=S.deck[s].slice(0,3); if(top.length&&S.hand[s].length<7){ const t=top.sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; S.deck[s].splice(S.deck[s].indexOf(t),1); S.hand[s].push(t); note=s==="p"?`prend ${nm(t)} en main`:"prend une carte en main"; } break; }
    case "bia": { const res=(S.bonus[o]||0)>0||((S.unspent&&S.unspent[o])>0&&S.board[o].some(col=>col.some(x=>live(x)&&x.id==="promethee")));
      if(res){ S.bonus[o]=0; if(S.biaBlock) S.biaBlock[o]=true; note="l'adversaire perd son énergie conservée"; snd="debuff"; }
      else { const t=strongest(targets,o,li); if(t&&weaken(o,li,t,1)){ (t.mods=t.mods||[]).push({v:-1,src:"Bia"}); note=`−1 à ${nm(t)}`; snd="debuff"; } } break; }
    case "ananke": { const t=total(o,li)+1, v=t-(cardPow(s,li,c)-c.pow); if(v!==c.pow){ (c.mods=c.mods||[]).push({v:v-c.pow,src:"Ananké"}); c.pow=v; } note=`prend la puissance adverse (${t-1}), +1`; snd="buff"; break; }
    case "nike": { const k=Math.max(0,((S.turnPlays&&S.turnPlays[s])||[]).indexOf(c)); if(k) buffSelf(2*k); break; }
    case "apsu": { foes.forEach(x=>x.neg=true); if(foes.length) note=`${foes.length} carte${foes.length>1?"s":""} sans effet`; if(onSide(s,"yarden")) buffSelf(6); snd=foes.length?"void":snd; break; }
    case "lilith": { const t=strongest(targets.filter(x=>!fated(x)&&pw(o,li,x)<=6),o,li); if(t){ S.board[o][li]=S.board[o][li].filter(x=>x!==t);
      if(S.board[s][li].length<capOf(s,li)){ S.board[s][li].push(t); t.fresh=true; note=`séduit ${nm(t)}`; } else if(forest(li)){ S.board[o][li].push(t); } else { S.destroyed++; bury(o,t); if(o==="e") S.killE=(S.killE||0)+1; danteHook(li); note=`${nm(t)} est détruite`; } snd="void"; } break; }
    case "psyche": { const t=weakest(mates,s,li)||c; t.pow+=2; note=`+2 à ${nm(t)}`; snd="buff"; break; }
    case "tlazol": { let n=0; for(const x of mates) if(x.pow<CARDS[x.id].pow){ x.pow=CARDS[x.id].pow; n++; } if(n){ c.pow+=2*n; note=`purifie ${n} carte${n>1?"s":""}, +${2*n}`; snd="buff"; } break; }
    case "eris": { const t=strongest(targets.filter(x=>!fated(x)),o,li); const spots=[0,1,2].filter(i=>i!==li&&S.board[o][i].length<capOf(o,i)); if(t&&spots.length){ const i=gPick(spots); S.board[o][li]=S.board[o][li].filter(x=>x!==t); S.board[o][i].push(t); flonHook(i,t); if(s==="p"&&qLive()) qProg("move2"); note=`${nm(t)} part vers ${LOCS[S.locs[i].id].name}`; snd="debuff"; } break; }
    case "durga": { const t=strongest(targets,o,li); if(t&&pw(o,li,t)>=7){ if(destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } } else buffSelf(3); break; }
    case "hecate": draw(s); draw(s); note="pioche 2 cartes"; break;
    case "hermes": { /* ta plus forte carte ici part vers un lieu révélé où elle te fait mener (de préférence un lieu que tu ne menais pas) */
      const t=strongest(mates.filter(x=>!fated(x)),s,li); if(!t) break; let best=null;
      for(const i of [0,1,2]){ if(i===li||!S.locs[i].rev||S.board[s][i].length>=capOf(s,i)) continue;
        const was=leader(i)===s; S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][i].push(t);
        const wins=leader(i)===s, gap=total(s,i)-total(o,i);
        S.board[s][i]=S.board[s][i].filter(x=>x!==t); S.board[s][li].push(t);
        if(wins&&(!best||(!was&&best.was)||(was===best.was&&gap<best.gap))) best={i,was,gap}; }
      if(best){ S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][best.i].push(t); flonHook(best.i,t); if(s==="p"&&qLive()) qProg("move2"); note=`${nm(t)} part vers ${LOCS[S.locs[best.i].id].name}`; snd="buff"; } break; }
    case "konohana": c.bloom=S.turn+1; note="en fleur jusqu'au prochain tour"; break;
    case "mohini": { const t=strongest(targets,o,li); if(t&&!t.neg){ t.neg=true; note=`${nm(t)} perd ses effets`; snd="void"; } break; }
    case "melinoe": { const t=gPick(S.hand[s]); if(t){ discard(s,t); note=`défausse ${nm(t)}`; buffSelf(3); } break; }
    case "comptable": if(mates.length) buffSelf(mates.length); break;
    case "relieur": { const t=weakest(mates.filter(x=>x.pow<CARDS[x.id].pow),s,li); if(t){ const v=CARDS[t.id].pow-t.pow; t.pow=CARDS[t.id].pow; (t.mods=t.mods||[]).push({v,src:"Le Relieur"}); note=`+${v} à ${nm(t)}`; snd="buff"; } break; }
    case "funambule": if(!mates.length) buffSelf(2); break;
    case "tyr": { let n=0; for(const x of targets) if(pw(o,li,x)>=4&&weaken(o,li,x,1)) n++; if(n){ note=`−1 à ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "medee_h": { /* poison lent : la robe brûle, rien ne l'arrête (sauf les protections contre l'affaiblissement) */
      const tg=targets.slice().sort((a,b)=>pw(o,li,b)-pw(o,li,a)).slice(0,onSide(s,"hecate")?2:1);
      for(const t of tg) t.poison=true;
      if(tg.length){ note=`empoisonne ${tg.map(nm).join(" et ")}`; snd="debuff"; } break; }
    case "boucher": { const t=weakest(mates,s,li); if(t&&destroy(s,li,t)){ draw(s); note=`détruit ${nm(t)}, pioche 1`; snd="destroy"; } break; }
    case "tatoueur": { const t=strongest(mates,s,li); if(t){ t.pow+=1; t.noweak=true; (t.mods=t.mods||[]).push({v:1,src:"Le Tatoueur"}); note=`+1 à ${nm(t)}, encre indélébile`; snd="buff"; } break; }
    case "odin": { const t=S.hand[s].slice().sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; if(t) discard(s,t); draw(s); draw(s); note=t?`défausse ${nm(t)}, pioche 2`:"pioche 2"; break; }
    case "thor": { const sp=[0,1,2].filter(i=>i!==li&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)); if(sp.length){ const i=gPick(sp); const m=mk("mjolnir"); m.rev=true; m.fresh=true; m.thor=c.uid; S.board[s][i].push(m); note=`Mjölnir → ${LOCS[S.locs[i].id].name}`; snd="destroy"; } break; }
    case "heimdall": { let n=0; const lk=[0,1,2].filter(i=>i!==li&&S.locs[i].locked);
      for(const t of mates.filter(x=>!fated(x))){ const i=lk.find(i=>S.board[s][i].length<capOf(s,i)); if(i==null) break; S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][i].push(t); flonHook(i,t); if(s==="p"&&qLive()) qProg("move2"); n++; }
      if(n){ note=`${n} carte${n>1?"s":""} passe${n>1?"nt":""} par le Bifröst`; snd="buff"; } else buffSelf(2); break; }
    case "hel": { const ids=S.discardPile[s].slice().sort((a,b)=>CARDS[b].pow-CARDS[a].pow||CARDS[b].cost-CARDS[a].cost); let n=0; for(const id of ids){ if(n>=3) break; if(resurrect(s,id,li,"discard")) n++; else break; } if(n){ note=`ressuscite ${n} carte${n>1?"s":""}`; snd="void"; } break; }
    case "ulhel": { const all=S.discardPile[s].map(id=>[id,"discard"]).concat(S.graveyard[s].map(id=>[id,"grave"])).sort((a,b)=>CARDS[b[0]].pow-CARDS[a[0]].pow||CARDS[b[0]].cost-CARDS[a[0]].cost);
      if(all.length){ const r=resurrect(s,all[0][0],li,"discard"===all[0][1]?"discard":"grave",{ward:true,withReveal:true});
        if(r){ note=`ressuscite ${nm(r)}, intouchable`; if(charOf(r.id)==="baldur"){ r.pow+=5; (r.mods=r.mods||[]).push({v:5,src:"Hel X Baldur"}); note+=", +5"; } snd="void"; } } break; }
    case "hel_r": { const ids=S.discardPile[s].slice().sort((a,b)=>CARDS[b].cost-CARDS[a].cost); if(ids.length&&S.board[s][li].length<capOf(s,li)){ const r=resurrect(s,ids[0],li,"discard",{withReveal:true}); if(r){ note=`ressuscite ${nm(r)}`; snd="void"; } } break; }
    case "loviatar": { const id=S.discardPile[s][S.discardPile[s].length-1]; if(id){ const r=resurrect(s,id,li,"discard",{sick:2}); if(r){ note=`${nm(r)} revient malade (−2)`; snd="void"; } } break; }
    case "hades": { const ids=S.graveyard[s].slice().sort((a,b)=>CARDS[b].pow-CARDS[a].pow); if(ids.length){ const r=resurrect(s,ids[0],li,"grave"); if(r){ note=`ressuscite ${nm(r)}`; snd="void"; } } break; }
    case "dionysos": { const lost=[]; for(const side of [s,o]){ draw(side); const t=gPick(S.hand[side]); if(t){ discard(side,t); lost.push(nm(t)); } } note=lost.length?`l'ivresse fait défausser ${lost.join(" et ")}`:"pioche 1"; snd="void"; break; }
    case "poseidon": { let n=0; for(const t of targets.filter(x=>CARDS[x.id].cost<=3)){ S.board[o][li]=S.board[o][li].filter(x=>x!==t); if(!real(t)) continue; n++;
        if(S.hand[o].length<7) S.hand[o].push(mk(t.id)); else { S.discarded=(S.discarded||0)+1; S.discardPile[o].push(t.id); } }
      if(n){ note=`le reflux emporte ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "circe": case "ulcirce": { let n=0; if(!shielded(o,li)) for(const t of targets.filter(x=>!fated(x))) if(c.id==="ulcirce"||pw(o,li,t)<=3){ t.orig=t.id; t.id="pourceau"; t.pow=1; t.neg=true; t.mods=[]; n++; }
      if(n){ note=`${n} Pourceau${n>1?"x":""}`; snd="void"; } break; }
    case "qetesh": { const t=strongest(targets.filter(x=>pw(o,li,x)<=4&&!x.charm),o,li); if(t){ t.charm=s; note=`charme ${nm(t)}`; snd="void"; } break; }
    case "oshun": { let n=0; for(let i=0;i<3;i++) for(const x of S.board[s][i]) if(x!==c&&x.rev){ x.pow+=1; n++; } if(n){ note=`+1 à ${n} carte${n>1?"s":""}`; snd="buff"; } break; }
    case "scathach": { const sp=[0,1,2].filter(i=>i!==li&&!S.locs[i].locked&&S.board[o][i].length<capOf(o,i)); if(sp.length){ const i=gPick(sp); const m=mk("ombre"); m.rev=true; m.fresh=true; m.neg=true; S.board[o][i].push(m); note=`Ombre → ${LOCS[S.locs[i].id].name}`; snd="debuff"; } break; }
    case "uloshun": { const t=strongest(targets,o,li); if(!t) break; const v=Math.ceil(Math.max(0,pw(o,li,t))/2);
      if(destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy";
        let w=null,wi=0; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[s][i]) if(x.rev&&(!w||pw(s,i,x)<pw(s,wi,w))){ w=x; wi=i; }
        if(w&&v){ w.pow+=v; (w.mods=w.mods||[]).push({v,src:"Nyx X Oshun"}); note+=`, +${v} à ${nm(w)}`; } } break; }
    case "biblio": if(S.hand[s].length<S.hand[o].length){ draw(s); note="pioche 1 carte"; } break;
    case "ereshkigal": { const vs=forest(li)?[]:foes.filter(x=>!fated(x)&&pw(o,li,x)<=3); if(vs.length){ S.board[o][li]=S.board[o][li].filter(x=>!vs.includes(x)); S.destroyed+=vs.length; vs.forEach(x=>{ bury(o,x); danteHook(li); }); if(o==="e") S.killE=(S.killE||0)+vs.length; note=`détruit ${vs.length} carte${vs.length>1?"s":""}`; snd="destroy"; } break; }
    case "pele": { let n=0; for(const side of [s,o]) for(const x of S.board[side][li]) if(x!==c&&x.rev&&weaken(side,li,x,2)) n++; if(n){ note=`−2 à ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "pele_r": { let n=0; for(let i=0;i<3;i++){ const t=strongest(S.board[o][i].filter(x=>x.rev&&!untargetable(s,o,x)),o,i); if(t&&weaken(o,i,t,2)) n++; } if(n){ note=`−2 à ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "ulpele_r": { let n=0; for(let i=0;i<3;i++) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&weaken(o,i,x,1)) n++; if(n){ note=`−1 à ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "qetesh_r": c.midnight=S.turn+1; note="minuit : charmera la carte la plus forte au tour suivant"; snd="void"; break;
    case "ulqetjor_r": { const t=strongest(targets.filter(x=>CARDS[x.id].cost<=5&&!x.charm),o,li); if(t){ t.charm=s; note=`charme ${nm(t)}`; snd="void"; } break; }
    case "cronos": { const ts=S.hand[s].filter(x=>CARDS[x.id].cost<=1); ts.forEach(x=>discard(s,x)); if(ts.length){ c.pow+=2*ts.length; (c.mods=c.mods||[]).push({v:2*ts.length,src:"Cronos"}); note=`défausse ${ts.map(nm).join(" et ")}, +${2*ts.length}`; snd="void"; } break; }
    case "izanami": { const low=S.hand[s].length?Math.min(...S.hand[s].map(x=>CARDS[x.id].pow)):null; const t=low==null?null:gPick(S.hand[s].filter(x=>CARDS[x.id].pow===low)); if(t){ discard(s,t); note=`défausse ${nm(t)}`; snd="void"; } break; }
    case "loki": { const lost=[]; for(const side of [s,o]){ const hi=S.hand[side].length?Math.max(...S.hand[side].map(x=>CARDS[x.id].cost)):null; const t=hi==null?null:gPick(S.hand[side].filter(x=>CARDS[x.id].cost===hi)); if(t){ discard(side,t); lost.push(nm(t)); } } if(lost.length){ note=`chacun défausse sa plus chère : ${lost.join(" et ")}`; snd="void"; } break; }
    case "ares": { let n=0; for(const x of targets) if(weaken(o,li,x,1)) n++; if(n){ c.pow+=n; note=`−1 à ${n}, +${n}`; snd="debuff"; } break; }
    case "nergal": { let n=0; for(let i=0;i<3;i++) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&weaken(o,i,x,1)) n++; if(n){ note=`−1 à ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "rusalka": { const t=weakest(targets,o,li); if(t&&pw(o,li,t)<=2&&destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } break; }
    case "mere": { let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)){ const t=mk("cendreux"); t.rev=true; t.fresh=true; S.board[s][i].push(t); n++; } if(n) note=`${n} Cendreux`; break; }
    case "nuee": { const t=strongest(mates,s,li); if(t){ const v=pw(s,li,t); if(v>c.pow){ c.pow=v; note=`reflète ${v}`; snd="buff"; } } break; }
    case "charognard": if(S.destroyed+(S.discarded||0)>0) buffSelf(3); break;
    case "ficelle": { let n=0; for(const x of mates) if(destroy(s,li,x)) n++; if(n){ c.pow+=3*n; note=`détruit ${n} carte${n>1?"s":""}, +${3*n}`; snd="destroy"; } break; }
    case "ecorche": { const t=gPick(targets); if(t&&weaken(o,li,t,2)){ note=`−2 à ${nm(t)}`; snd="debuff"; } break; }
    case "ulya": { const n=S.hand[s].length; if(n) buffSelf(n); break; }
    case "jordan": { const y=S.deck[s].find(x=>x.id==="yarden"); if(y&&S.hand[s].length<7){ S.deck[s]=S.deck[s].filter(x=>x!==y); S.hand[s].push(y); note="ajoute Yarden Weiss à sa main"; snd="buff"; } break; }
    case "morrigan_h": { draw(s); draw(s); const h2=S.hand[s].slice().sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; if(h2){ discard(s,h2); note=`pioche 2, défausse ${nm(h2)}`; } else note="pioche 2"; break; }
    case "nyx_h": { let n=0; for(let k=0;k<2;k++){ const t=weakest(S.board[o][li].filter(x=>x.rev&&!untargetable(s,o,x)),o,li); if(t&&destroy(o,li,t)) n++; else break; } if(n){ note=`détruit ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "izzy_h": { const t=strongest(targets.filter(x=>pw(o,li,x)<=6),o,li); if(t){ const v=Math.ceil(Math.max(0,pw(o,li,t))/2); if(destroy(o,li,t)){ c.pow+=v; note=`détruit ${nm(t)}, +${v}`; snd="destroy"; } } break; }
    case "yarden_d": { let y=null, yl=-1; for(let i=0;i<3;i++){ const f=S.board[s][i].find(x=>x.rev&&x.id==="yarden"); if(f){ y=f; yl=i; break; } } if(y){ const v=Math.max(0,cardPow(s,yl,y)); if(destroy(s,yl,y)){ c.pow+=v; note=`absorbe Yarden Weiss, +${v}`; snd="void"; } } break; }
    case "ulji": { const hd=S.hand[o].slice().sort((a,b)=>CARDS[b.id].pow-CARDS[a.id].pow||CARDS[b.id].cost-CARDS[a.id].cost)[0];
      if(hd){ S.hand[o]=S.hand[o].filter(x=>x!==hd); let dest=S.board[s][li].length<capOf(s,li)?li:null; if(dest==null){ const sp=[0,1,2].filter(i=>S.board[s][i].length<capOf(s,i)); if(sp.length) dest=gPick(sp); }
        if(dest!=null){ hd.rev=true; hd.fresh=true; S.board[s][dest].push(hd); note=`invoque ${nm(hd)}${dest!==li?` (${LOCS[S.locs[dest].id].name})`:""}`; snd="void"; }
        else { S.discarded=(S.discarded||0)+1; piles(); S.discardPile[o].push(hd.id); note=`${nm(hd)} est défaussée, plus de place`; } } break; }
    case "kitsune": { const spots=[0,1,2].filter(i=>i!==li&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i));
      if(spots.length){ const i=gPick(spots); const t=mk("illusion"); t.rev=true; t.fresh=true; S.board[s][i].push(t); note=`Illusion → ${LOCS[S.locs[i].id].name}`; } break; }
    case "freyr": S.bonus[s]+=1; note="+1 énergie au prochain tour"; break;
    case "maeve": if(total(s,li)>total(o,li)) buffSelf(3); break;
    case "izzy": { const t=strongest(foes,o,li); if(t){ const v=Math.min(6,pw(o,li,t)); if(v>c.pow){ c.pow=v; note=`copie ${v}`; snd="buff"; } } break; }
    case "araignee": { let n=0; for(const t of foes) if(weaken(o,li,t,1)) n++; if(n){ note=`−1 à ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "anat": { const t=weakest(mates,s,li); if(t){ const v=pw(s,li,t); if(destroy(s,li,t)){ c.pow+=v; note=`détruit ${nm(t)} (+${v})`; snd="destroy"; } } break; }
    case "bastet": { mates.forEach(x=>x.pow+=2); if(mates.length){ note=`+2 à ${mates.length} carte${mates.length>1?"s":""}`; snd="buff"; } break; }
    case "artemis": { const t=weakest(targets,o,li); if(t&&weaken(o,li,t,2)){ note=`−2 à ${nm(t)}`; snd="debuff"; } if(onSide(s,"izzy")||onSide(s,"izzy_h")) buffSelf(2); break; }
    case "eos": case "eos_r": { const n=onSide(s,"persephone")?2:1; for(let i=0;i<n;i++) draw(s); note=`pioche ${n} carte${n>1?"s":""}`; if(c.id==="eos_r"){ S.disc[s]=Math.max(S.disc[s],1); note+=", prochaine carte −1"; } break; }
    case "thot": { const t=strongest(targets,o,li); if(t&&weaken(o,li,t,2)){ note=`−2 à ${nm(t)}`; snd="debuff"; } break; }
    case "persephone": if(S.locs[li].rev&&!S.locs[li].stopped){ S.locs[li].stopped=true; note="l'effet du lieu s'arrête"; snd="lock"; } break;
    case "skadi": { const pool=[]; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&!shielded(o,i)) pool.push([i,x]);
      if(pool.length){ const [i,t]=gPick(pool); weaken(o,i,t,3); note=`−3 à ${nm(t)} (${LOCS[S.locs[i].id].name})`; snd="debuff"; } break; }
    case "ixchel": { let best=null; for(let i=0;i<3;i++) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&!shielded(o,i)&&(!best||pw(o,i,x)>pw(o,best[0],best[1]))) best=[i,x];
      if(best){ weaken(o,best[0],best[1],3); note=`−3 à ${nm(best[1])}`; snd="debuff"; } break; }
    case "inanna": { for(const side of [s,o]) for(const x of S.board[side][li]) if(x.rev){ const base=CARDS[x.id].pow; if(base<x.pow&&(shielded(side,li)||fated(x))) continue; x.pow=base; }
      note="tout revient à la base"; snd="lock"; break; }
    case "oya": { const t=strongest(targets.filter(x=>!shielded(o,li)&&!fated(x)),o,li); if(t){ t.pow=1; t.neg=true; t.mods=[{v:1-CARDS[t.id].pow,src:d.name}]; t.reset=true; note=`${nm(t)} devient une carte de puissance 1`; snd="debuff"; } break; }
    case "sekhmet": { let n=0; for(const side of [s,o]) for(const x of S.board[side][li].slice()) if(x!==c&&x.rev&&pw(side,li,x)<=2&&!(side===o&&untargetable(s,o,x))){ if(destroy(side,li,x)) n++; }
      if(n){ note=`détruit ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
  }
  sfx(snd);
  log(`${who(s)} · ${d.name} → ${LOCS[S.locs[li].id].name}${note?` (${note})`:""}`);
  if(opts.replay) return;
  if(locIs(li,"ouchy") && !S.first[s][li]){
    S.first[s][li]=1;
    if(S.board[s][li].length<capOf(s,li)){ const r=mk("reflet"); r.rev=true; r.fresh=true; S.board[s][li].push(r); log(`Lac Ouchy · un Reflet apparaît (${who(s)})`); }
  }
  if(locIs(li,"archives")) draw(s);
}

/* ======= IA ======= */
const RES=new Set(["hel","hel_r","ulhel","hades","loviatar"]);
const HITS=["bia","circe","ulcirce","qetesh","qetesh_r","pele_r","ulpele_r","ulqetjor_r","poseidon","uloshun","tyr","medee_h","mohini","thot","esquille","izzy","artemis","oya","nyx","hathor","ishtar","araignee","apsu","balor","calypso","chasseur","maree","set","andraste","ulnem"];
const DESTROYERS=new Set(["anat","anubis","boucher","durga","ereshkigal","esquille","ficelle","izzy_h","lilith","maree","nergal_h","nyx","nyx_h","rusalka","sekhmet","sekhmet_n","troll","ulnem","uloshun","yarden_d"]);
const NEEDS_MATES=["susanoo","ulaph","oshun","tatoueur","comptable","bastet","anat","troll","tefnut"];
/* Synergies connues de l'IA : [carte qui prépare, cartes qui en profitent, 1 si elles doivent partager le lieu] */
const AI_PAIRS=[["yarden",["apsu","apsu_n","yarden_d"]],["freyr",["freya"],1],["freya",["freyr"],1],["ereshkigal",["nergal"]],["amaterasu",["susanoo"]],["izzy",["artemis"]],
  ["thot",["costumes"]],["persephone",["eos","eos_r"]],["hecate",["medee","medee_h"]],["styx",["nike","bia"]],["promethee",["pandore"]]];
const AI_PREP={}, AI_PAY={};
for(const [a,bs,loc] of AI_PAIRS){ (AI_PREP[a]=AI_PREP[a]||[]).push(...bs); for(const x of bs) (AI_PAY[x]=AI_PAY[x]||[]).push({a,loc:!!loc}); }
/* Cartes adverses qui visent la plus forte : l'IA évite alors de tout miser sur une seule grosse carte */
const AI_WARY=new Set(["nyx","nyx_h","durga","oya","ixchel","lilith","anubis","izzy_h","uloshun","ulnem","qetesh","qetesh_r","mohini","thot","medee_h"]);
/* L'IA compare toutes les combinaisons de sa main qui tiennent dans son énergie (128 au plus). Pour chacune, elle estime
   la puissance ajoutée dans chaque lieu, puis sa probabilité de gagner 2 lieux sur 3 face à ce que l'adversaire peut encore poser.
   me : côté joué ("e" par défaut, "p" pour les tests IA contre IA). Le bruit par palier brouille l'estimation des bas rangs. */
function aiPlan(me="e",tierOv){
  if(S.tut&&me==="e"){ return (TUT.plays[S.turn]||[]).map(([id,li])=>({c:S.hand.e.find(x=>x.id===id),li})).filter(x=>x.c); }
  const op=opp(me), t=tierOv!=null?tierOv:(S.aiTier||0), noise=[3,2.4,1.8,1.4,1,.6,.3][t];
  const en0=me==="e"?S.energyE:S.energy, hand=S.hand[me].slice(0,7);
  if(!hand.length) return [];
  const me0=[0,1,2].map(li=>total(me,li)), op0=[0,1,2].map(li=>total(op,li)), diffs=[0,1,2].map(li=>op0[li]-me0[li]);
  const foesN=[0,1,2].map(li=>S.board[op][li].filter(x=>x.rev).length), matesN=[0,1,2].map(li=>S.board[me][li].filter(x=>x.rev).length);
  const NZ=new Map(hand.map(c=>[c,[0,1,2].map(()=>(Math.random()*2-1)*noise)]));
  const onBoard=id=>S.board[me].some(col=>col.some(x=>x.rev&&x.id===id));
  piles();
  const seen=[...S.board[op].flat().filter(x=>x.rev).map(x=>x.id),...S.graveyard[op],...S.discardPile[op]];
  const wary=t>=2&&(seen.some(id=>AI_WARY.has(id))||(S.turn>=5&&S.hand[op].length>=4));
  /* ce que chaque camp peut encore ajouter : ce tour-ci pour l'adversaire, les tours suivants pour les deux */
  const open=s=>[0,1,2].map(li=>!S.locs[li].locked&&S.board[s][li].length<capOf(s,li));
  const share=(s,from)=>{ const o=open(s), n=o.filter(Boolean).length||1; let e=0; for(let k=from;k<=6;k++) e+=k*.8; return o.map(x=>x?e/n:0); };
  const opFut=share(op,S.turn), meFut=share(me,S.turn+1), sd=3+2.2*(6-S.turn);
  /* une carte posée dans un lieu : coût, puissance estimée, puissance retirée à l'adversaire, petits ajustements */
  const place=(c,li,ctx)=>{
    const d=CARDS[c.id];
    if(S.locs[li].locked||muted(me,li)||banned(c)||S.board[me][li].length+ctx.pend[li]>=capOf(me,li)) return null;
    const cost=costOf(me,c,li,ctx.first); if(cost>ctx.en) return null;
    const diff=diffs[li], foes=foesN[li], mates=matesN[li]+ctx.pend[li];
    let pow=d.pow+NZ.get(c)[li], hit=0, adj=0;
    if(locIs(li,"tour")&&d.pow>=5) pow+=2;
    if(locIs(li,"encheres")) pow+=2;
    if(locIs(li,"escaliers")&&d.fac==="helvara") pow+=2;
    if(locIs(li,"domaine")&&JPARTNERS.has(c.id)) pow+=2;
    if(HITS.includes(c.id)){ if(foes) hit+=2.5; else adj-=1; }
    if(NEEDS_MATES.includes(c.id)) pow+=mates?2:-1;
    if(c.id==="aphrodite") pow+=S.board[me][li].some(x=>replayable(x)&&CARDS[x.id].fac==="desir")?3:-2;
    if(c.id==="messagere"&&diff>0) pow+=3;
    if(locIs(li,"cirque")&&S.turn<4) pow+=d.pow<=2?2:-2;
    if(locIs(li,"sauvabelin")&&DESTROYERS.has(c.id)) adj-=4;
    if((c.id==="hermes"||c.id==="susanoo")&&[0,1,2].some(i=>i!==li&&locIs(i,"flon"))) pow+=1;
    if(c.id==="vritra") adj+=diff<0?4:-2;
    if(c.id==="maeve"&&diff<0) pow+=3;
    if(c.id==="morrigan"&&Math.abs(diff)<=2) adj+=2;
    if(c.id==="sekhmet"){ hit+=S.board[op][li].filter(x=>x.rev&&cardPow(op,li,x)<=2).reduce((a,x)=>a+cardPow(op,li,x),0); pow-=S.board[me][li].filter(x=>x.rev&&cardPow(me,li,x)<=2).reduce((a,x)=>a+cardPow(me,li,x),0); }
    /* synergies : la carte qui en profite vaut plus si sa préparatrice est déjà là (ou posée avant elle ce tour) */
    for(const p of (AI_PAY[c.id]||[])){ const ready=p.loc?(S.board[me][li].some(x=>x.id===p.a)||ctx.plays.some(x=>x.c.id===p.a&&x.li===li)):(onBoard(p.a)||ctx.plays.some(x=>x.c.id===p.a)); if(ready) pow+=3; }
    if(AI_PREP[c.id]&&hand.some(x=>AI_PREP[c.id].includes(x.id))) adj+=1.5;
    if(c.id==="brigid"&&hand.some(x=>x!==c&&CARDS[x.id].pow>=5)) adj+=1.5;
    if(locIs(li,"faille")&&S.turn<=4&&d.pow<=2) pow-=d.pow;
    if(c.id==="nemesis") adj+=(diff>0&&diff<12)?5:-6;
    if(c.id==="mouche") pow-=mates;
    if(c.id==="nike") pow+=ctx.plays.length*2;
    if(c.id==="ananke") pow+=op0[li];
    if(c.id==="pandore") pow+=2*Math.max(0,ctx.en-cost);   /* jouée en dernier : elle dépense tout ce qui reste */
    if(c.id==="qetesh_r"&&S.turn>=6) adj-=6;               /* le charme n'arrive qu'au tour suivant */
    if(c.id==="ulqetjor_r") pow+=2*mates;
    if(c.id==="ulnem"){ const fs=Math.max(0,...S.board[op][li].filter(x=>x.rev).map(x=>cardPow(op,li,x))), own=S.board[me][li].filter(x=>x.rev), ms=Math.max(0,...own.map(x=>cardPow(me,li,x)));
      if(foes){ hit+=fs-2.5; pow-=ms; pow+=2*Math.max(0,own.length-(own.length?1:0)); } }
    if(c.id==="ulqetyar"){ let n=0; for(let i=0;i<3;i++){ const f=new Set(S.board[me][i].filter(x=>x.rev).map(x=>CARDS[x.id].fac)); for(const x of ctx.plays) if(x.li===i) f.add(CARDS[x.c.id].fac); if(i===li) f.add("desir"); if(f.has("desir")&&f.has("primordial")) n++; } pow+=3*n; }
    /* Résurrections : valeur de ce qui revient, si la place le permet */
    if(RES.has(c.id)){ const room=Math.max(0,capOf(me,li)-S.board[me][li].length-ctx.pend[li]-1), dp=(S.discardPile&&S.discardPile[me])||[], gv=(S.graveyard&&S.graveyard[me])||[], bp=id=>CARDS[id].pow+(c.id==="ulhel"&&charOf(id)==="baldur"?5:0);
      const byPow=ids=>ids.map(bp).sort((a,b)=>b-a);
      if(c.id==="hel") pow+=byPow(dp).slice(0,Math.min(3,room)).reduce((a,v)=>a+v,0);
      else if(c.id==="hel_r"&&room&&dp.length) pow+=Math.max(...dp.map(id=>CARDS[id].pow));
      else if(c.id==="loviatar"&&room&&dp.length) pow+=Math.max(0,CARDS[dp[dp.length-1]].pow-2);
      else if(c.id==="hades"&&room&&gv.length) pow+=Math.max(...gv.map(id=>CARDS[id].pow));
      else if(c.id==="ulhel"&&room&&(dp.length||gv.length)) pow+=Math.max(...byPow(dp.concat(gv))); }
    if(c.id==="cronos") pow+=2*hand.filter(x=>x!==c&&CARDS[x.id].cost<=1&&!ctx.plays.some(y=>y.c===x)).length;
    if(c.id==="izanami") adj-=hand.length>1?1:0;
    if(c.id==="loki"&&S.hand[op].length>=2) hit+=1.5;
    if(wary&&d.pow>=6&&!S.board[me][li].length&&!ctx.pend[li]) adj-=1.5;
    return {cost,pow,hit,adj};
  };
  /* ordre de pose : les préparatrices d'abord, Pandore et Nike en dernier, puis les plus chères */
  const late=c=>c.id==="pandore"?2:c.id==="nike"?1:0, prepFor=(c,cs)=>(AI_PAY[c.id]||[]).some(p=>cs.some(x=>x.id===p.a))?1:0;
  const order=cs=>cs.slice().sort((a,b)=>late(a)-late(b)||prepFor(a,cs)-prepFor(b,cs)||CARDS[b.id].cost-CARDS[a.id].cost);
  const winP=(add,hit)=>{ const p=[0,1,2].map(li=>{ let m=me0[li]+add[li]+meFut[li]-(op0[li]-hit[li]+opFut[li]); if(nemInv(li)) m=-m; return 1/(1+Math.exp(-1.6*m/sd)); });
    return p[0]*p[1]+p[0]*p[2]+p[1]*p[2]-2*p[0]*p[1]*p[2]; };
  /* simulation exacte d'un plan sur une copie de la partie (Révélations comprises), sans son ni journal visibles */
  const sim=plays=>{ const keep=S, kq=quiet; let out=null;
    try{ quiet=true; S=structuredClone(keep);
      S.unspent={p:0,e:0,...(S.unspent||{})}; S.unspent[me]=Math.max(0,(me==="e"?S.energyE:S.energy)-plays.reduce((a,x,i)=>a+costOf(me,x.c,x.li,i===0),0));
      for(const {c,li} of plays){ const x=S.hand[me].find(y=>y.uid===c.uid); if(!x) continue; S.hand[me]=S.hand[me].filter(y=>y!==x); S.board[me][li].push(x); reveal(me,li,x); }
      if(keep.turn<6) for(const {c,li} of plays) if(c.id==="qetesh_r"){ const x=S.board[me][li].find(y=>y.uid===c.uid); if(x&&live(x)) midnightCharm(me,li,x); }
      out={m:[0,1,2].map(li=>total(me,li)),o:[0,1,2].map(li=>total(op,li)),inv:[0,1,2].map(li=>nemInv(li))};
    }catch(e){ out=null; } finally{ S=keep; quiet=kq; }
    return out; };
  const exactP=r=>{ const p=[0,1,2].map(li=>{ let m=r.m[li]+meFut[li]-(r.o[li]+opFut[li]); if(r.inv[li]) m=-m; return 1/(1+Math.exp(-1.6*m/sd)); });
    return p[0]*p[1]+p[0]*p[2]+p[1]*p[2]-2*p[0]*p[1]*p[2]; };
  const cands=[];
  for(let mask=0;mask<(1<<hand.length);mask++){
    const cs=order(hand.filter((_,i)=>mask>>i&1)), ctx={en:en0,first:true,plays:[],pend:[0,0,0]}, add=[0,0,0], hit=[0,0,0]; let adj=0, ok=true;
    for(const c of cs){ let bp=null;
      /* chaque carte va là où elle fait le plus monter la probabilité de victoire */
      for(let li=0;li<3;li++){ const r=place(c,li,ctx); if(!r) continue; add[li]+=r.pow; hit[li]+=r.hit; const v=winP(add,hit)*100+r.adj; add[li]-=r.pow; hit[li]-=r.hit; if(!bp||v>bp.v) bp={...r,li,v}; }
      if(!bp){ ok=false; break; }
      ctx.plays.push({c,li:bp.li}); ctx.en-=bp.cost; ctx.pend[bp.li]++; ctx.first=false; add[bp.li]+=bp.pow; hit[bp.li]+=bp.hit; adj+=bp.adj; }
    if(!ok) continue;
    let bonus=adj;
    /* garder une carte pour plus tard : bonus aux tours 2 à 5 si elle attend sa préparation ou le tour 6 */
    const kept=hand.filter(c=>!cs.includes(c));
    if(S.turn>=2&&S.turn<=5&&kept.some(k=>(AI_PAY[k.id]||[]).some(p=>onBoard(p.a)||ctx.plays.some(x=>x.c.id===p.a))||(CARDS[k.id].cost>=6&&S.turn===5))) bonus+=3;
    cands.push({plays:ctx.plays,bonus,est:winP(add,hit)*100+bonus});
  }
  /* les meilleures estimations sont rejouées pour de vrai sur une copie : le choix final se fait sur le résultat exact */
  cands.sort((a,b)=>b.est-a.est);
  let best=cands[0]||{plays:[]}, bv=-1e9;
  for(const c of cands.slice(0,t>=4?40:t>=2?12:0)){ const r=sim(c.plays); const v=r?exactP(r)*100+c.bonus+(Math.random()*2-1)*noise*3:c.est; if(v>bv){ bv=v; best=c; } }
  return best.plays;
}

/* ======= FIN DE TOUR ======= */
async function endTurn(){
  if(S.busy||S.over) return;
  if(S.mp) return mpLock();
  if(S.tut&&!tutDone()){ S.nudge=true; sfx("debuff"); render(); return; }
  const mine=S.staged.slice();
  await resolveTurn(mine, aiPlan(), true);
}
async function resolveTurn(mine, theirs, animate){
  const wait=ms=>animate?sleep(ms):Promise.resolve();
  S.busy=true; S.sel=null; S.info=null; S.staged=[]; S.nudge=false;
  /* Prométhée : énergie non dépensée ; Nike : ordre dans lequel chaque joueur a posé ses cartes (l'IA garde Nike pour la fin) */
  const spent=(s,list)=>list.reduce((a,x,i)=>a+(x.fixed!=null?x.fixed:costOf(s,x.c,x.li,i===0)),0);
  const unspent=S.unspent={p:Math.max(0,S.energy-spent("p",mine)),e:Math.max(0,S.energyE-spent("e",theirs))}; S.biaBlock={p:false,e:false};
  S.turnPlays={p:mine.map(x=>x.c),e:(S.mp?theirs:[...theirs.filter(x=>x.c.id!=="nike"),...theirs.filter(x=>x.c.id==="nike")]).map(x=>x.c)};
  S.hand.p=S.hand.p.filter(c=>!mine.some(x=>x.c===c));
  for(const x of theirs) S.hand.e=S.hand.e.filter(c=>c!==x.c);
  if(mine.length){ S.disc.p=0; if(!(S.mp&&S.mp.replaying)&&!S.tut){ ensureQuests(); qProg("cards12",mine.length);
    const cd=x=>CARDS[x.c.id]; qProg("cheap5",mine.filter(x=>cd(x).cost>=1&&cd(x).cost<=2).length); qProg("helv4",mine.filter(x=>cd(x).fac==="helvara").length);
    if(S.turn===6&&mine.some(x=>cd(x).cost>=6)) qProg("six6"); if(mine.some(x=>cd(x).r==="U")) qProg("fusion"); } }
  if(theirs.length) S.disc.e=0;
  for(const x of mine){ S.board.p[x.li].push(x.c); if(!CARDS[x.c.id].token) (S.played=S.played||[]).push([x.c.id,S.locs[x.li].id]); }
  for(const x of theirs) S.board.e[x.li].push(x.c);
  render();
  const dflt=(!S.mp||S.mp.meHost)?"p":"e", queue=[];
  for(let li=0;li<3;li++){ const f=leader(li)||dflt, g=opp(f);
    for(const side of [f,g]) for(const x of (side==="p"?mine:theirs)) if(x.li===li) queue.push([side,x]); }
  for(const [s,x] of queue){
    await wait(560);
    if(!S.board[s][x.li].includes(x.c)) continue;
    if(animate&&CARDS[x.c.id].r==="U"&&!S.tut&&!(S.mp&&S.mp.replaying)){ const u=ULof(x.c.id);
      if(u&&u.fac) await factionCine(x.c.id,s,x.li); else if(u&&u.req.length&&P.cine!==false) await fusionCine(x.c.id,s); }
    { const m=snapPow(); reveal(s,x.li,x.c); medeeHook(s,x.li,x.c); diffPow(m,CARDS[x.c.id].name); } render();
    if(animate) cardVfx(x.c.id,x.li);
  }
  /* Idunn : fin de tour (pas après le tour 6) */
  if(S.turn<6) for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(live(c)&&c.id==="idunn"){
    const t=S.board[s][li].filter(x=>x.rev).sort((a,b)=>cardPow(s,li,a)-cardPow(s,li,b))[0]; if(t){ t.pow+=1; (t.mods=t.mods||[]).push({v:1,src:"Idunn"}); log(`Idunn · +1 à ${nm(t)} (${who(s)})`); sfx("buff"); }
  }
  /* Konohanasakuya-Hime : la floraison passe à la fin du tour qui suit son arrivée */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(live(c)&&c.id==="konohana"&&c.bloom===S.turn&&c.pow>0){
    (c.mods=c.mods||[]).push({v:-c.pow,src:"Floraison passée"}); c.pow=0; log(`Konohanasakuya-Hime · la floraison est passée (${who(s)})`); sfx("debuff"); }
  /* Poison de Médée, Mariée Spectrale : −1 à chaque fin de tour, jusqu'à 0 */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(c.poison&&c.rev&&cardPow(s,li,c)>0&&(SRC={s:opp(s),cost:CARDS.medee_h.cost},weaken(s,li,c,1))&&!(SRC=null)){
    (c.mods=c.mods||[]).push({v:-1,src:"Poison de Médée"}); log(`Poison de Médée · −1 à ${nm(c)} (${who(s)})`); sfx("debuff"); }
  SRC=null;
  /* Ishtar : fin de tour (pas après le tour 6) */
  if(S.turn<6) for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(live(c)&&c.id==="ishtar"){
    const o=opp(s); const t=S.board[o][li].filter(x=>x.rev&&!untargetable(s,o,x)).sort((a,b)=>cardPow(o,li,b)-cardPow(o,li,a))[0];
    SRC={s,cost:CARDS.ishtar.cost}; const ok=t&&weaken(o,li,t,1); SRC=null;
    if(ok){ (t.mods=t.mods||[]).push({v:-1,src:"Ishtar"}); log(`Ishtar · −1 à ${nm(t)} (${who(o)})`); sfx("debuff"); }
  }
  if(S.turn===4){
    const rifts=[0,1,2].filter(li=>locIs(li,"faille"));
    if(animate&&rifts.length){ rifts.forEach(li=>FX.play("faille_open",{li})); await wait(1150); rifts.forEach(li=>FX.play("faille_close",{li})); }
    S.locs.forEach((L,li)=>{ if(locIs(li,"faille")){
      for(const s of ["p","e"]){ const arr=S.board[s][li].filter(c=>c.rev&&!(c.id==="uzume"&&!c.neg)&&!fated(c)&&!baldurSafe(s,c)&&!c.ward&&!styxSafe(s,li,c)); if(!arr.length) continue;
        const w=arr.sort((a,b)=>cardPow(s,li,a)-cardPow(s,li,b))[0];
        if(destroy(s,li,w)){ log(`La Faille détruit ${nm(w)} (${who(s)})`); sfx("destroy"); } }
    }});
  }
  /* Le Cirque : fin du tour 4, les puissances des cartes révélées sont mélangées entre les deux côtés */
  if(S.turn===4){ const side0=dflt, circ=[0,1,2].filter(li=>locIs(li,"cirque"));
    if(animate&&circ.length) await wait(500);
    for(const li of circ){ const pool=[]; for(const side of [side0,opp(side0)]) for(const c of S.board[side][li]) if(c.rev&&!cirqueSafe(side,li,c)) pool.push(c);
      if(pool.length<2) continue; const vals=gShuffle(pool.map(c=>c.pow));
      pool.forEach((c,i)=>{ const d=vals[i]-c.pow; if(d){ (c.mods=c.mods||[]).push({v:d,src:"Le Cirque"}); c.pow=vals[i]; } });
      log(`Le Cirque mélange les puissances de ${pool.length} cartes`); sfx("void"); } }
  /* Carillonneur : +1 à chaque fin de tour ; au tour 6, le glas partage la moitié de sa puissance */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(live(c)&&c.id==="carillonneur"){
    SRC={s,cost:CARDS.carillonneur.cost}; c.pow+=1; (c.mods=c.mods||[]).push({v:1,src:"Le Carillonneur"});
    if(S.turn===6&&!c.knell){ c.knell=true; const v=Math.floor(Math.max(0,cardPow(s,li,c))/2); const ms=S.board[s][li].filter(x=>x!==c&&x.rev);
      if(v&&ms.length){ ms.forEach(x=>{ x.pow+=v; (x.mods=x.mods||[]).push({v,src:"Le glas"}); }); log(`Le glas sonne : +${v} à ${ms.length} carte${ms.length>1?"s":""} (${who(s)})`); sfx("legend"); } }
    SRC=null; }
  /* Le Tombeau : fin du tour 6, les défaussés reviennent */
  if(S.turn===6&&animate){ const tb=[0,1,2].filter(li=>locIs(li,"tombeau")); if(tb.length){ tb.forEach(li=>FX.play("tombeau_rise",{li})); await wait(700); } }
  if(S.turn===6){ piles(); S.locs.forEach((L,li)=>{ if(locIs(li,"tombeau")) for(const s of ["p","e"]){ let n=0; for(const id of gShuffle(S.discardPile[s].slice())){ if(!resurrect(s,id,li,"discard",{anyLoc:true})) break; n++; } if(n){ log(`Le Tombeau rend ${n} carte${n>1?"s":""} (${who(s)})`); sfx("void"); } } }); }
  /* La Messagère d'Hécate : à chaque fin de tour, +2 si son camp ne mène pas ici (6 au maximum) */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(live(c)&&c.id==="messagere"&&leader(li)!==s){
    const g=Math.min(2,6-(c.msgBonus||0)); if(g>0){ c.msgBonus=(c.msgBonus||0)+g; c.pow+=g; (c.mods=c.mods||[]).push({v:g,src:"La Messagère"}); log(`La Messagère d'Hécate · +${g} (${who(s)})`); sfx("buff"); } }
  /* Prométhée : l'énergie non dépensée passe au tour suivant (10 maximum) */
  if(S.turn<6) for(const s of ["p","e"]) if(unspent[s]>0&&!S.biaBlock[s]&&S.board[s].some(col=>col.some(c=>live(c)&&c.id==="promethee"))){
    const k=Math.min(10,unspent[s]); S.bonus[s]+=k; log(`Prométhée garde ${k} énergie en réserve (${who(s)})`); sfx("buff"); if(animate){ const li=S.board[s].findIndex(col=>col.some(c=>live(c)&&c.id==="promethee")); if(li>=0) FX.play("promethee",{li}); } }
  if(S.turn>=2&&S.turn<=4) aiOath();
  render(); await wait(300);
  for(const s of ["p","e"]) for(const col of S.board[s]) for(const c of col) c.fresh=false;
  S.busy=false;
  if(S.turn>=6) finish(); else startTurn();
}
function loseStar(){ if(P.st>0) P.st--; else if(P.lv<MAXLV&&!isFloor(P.lv)){ P.lv--; P.st=maxSt(P.lv)-1; } }
function applyRank(res,oath,cross){
  const before=P.lv; let bonus=0;
  if(res==="win"){ P.streak++; bonus=(P.streak>=2&&P.lv<12)?1:0;
    /* Serment croisé : +4 étoiles plafonnées (série comprise) si tenu, aucune si rompu */
    /* Serment tenu : +2 fixe, série ou pas. Serment croisé : +4 si tenu, 0 sinon. */
    const n=cross?(oath==="kept"?4:0):oath==="kept"?2:1+bonus;
    for(let i=0;i<n;i++){ P.st++; if(P.lv<MAXLV&&P.st>maxSt(P.lv)){ P.lv++; P.st=1; } } }
  else if(res==="lose"){ P.streak=0;
    /* Serment croisé : lieu tenu, la défaite ne coûte rien ; lieu perdu, −4 étoiles (jamais sous le plancher du palier) */
    if(cross){ if(oath==="broken") for(let i=0;i<4;i++) loseStar(); }
    else if(tierOf(P.lv)<2){} else loseStar(); }
  else P.streak=0;
  if(oath==="broken"&&!cross) loseStar();
  P.best=Math.max(P.best,P.lv);
  return {up:P.lv>before, down:P.lv<before, bonus, res, oath, cross:!!cross};
}
function starsHTML(lv,st){
  if(lv>=MAXLV) return `<span class="stars"><i class="star on">✦</i> ${st} point${st>1?"s":""} divin${st>1?"s":""}</span>`;
  return `<span class="stars" aria-label="${st} étoile${st>1?"s":""} sur ${maxSt(lv)}">${Array.from({length:maxSt(lv)},(_,k)=>k+1).map(i=>`<i class="star ${i<=st?"on":""}">★</i>`).join("")}</span>`;
}
function finish(){
  if(S.tut){ let pw=0,ew=0; const rows=[]; S.locs.forEach((L,li)=>{ const a=total("p",li), b=total("e",li), w=leader(li); if(w==="p") pw++; else if(w==="e") ew++; rows.push({n:LOCS[L.id].name,a,b,w}); });
    S.over={tut:true,res:pw>ew?"win":"lose",rows,pw,ew,pt:0,et:0,gain:0}; sfx(pw>ew?"win":"lose"); render(); return; }
  let pw=0,ew=0,pt=0,et=0; const rows=[];
  if(S.blitz){ S.locs.forEach((L,li)=>{ const a=total("p",li), b=total("e",li), w=leader(li); pt+=a; et+=b; if(w==="p") pw++; else if(w==="e") ew++; rows.push({n:LOCS[L.id].name,a,b,w,inv:nemInv(li)}); });
    const res=pw>ew?"win":ew>pw?"lose":pt>et?"win":et>pt?"lose":"draw"; const r=P.bz.run;
    ensureQuests(); qProg("play3"); if(res==="win") qProg("win3"); qEnd(res,true);
    if(r&&!r.over){ if(res==="win"){ r.wins++; if(r.wins>=3) bzEndRun(); } else if(res==="lose") bzEndRun(); }
    pushHist("Blitz",res,`IA ${FAC[S.aiFac].n} · ${TIERS[S.aiTier]}`,pw,ew);
    save(); S.over={res,rows,pw,ew,pt,et,tie:pw===ew,gain:r&&r.over?r.gain:0,blitz:true,wins:r?r.wins:0,ended:!r||r.over};
    endCine(S.over); endMusic(res); render(); return; }
  S.locs.forEach((L,li)=>{ const a=total("p",li), b=total("e",li), w=leader(li); pt+=a; et+=b; if(w==="p") pw++; else if(w==="e") ew++; rows.push({n:LOCS[L.id].name,a,b,w,inv:nemInv(li)}); });
  const res = pw>ew?"win":ew>pw?"lose":pt>et?"win":et>pt?"lose":"draw";
  const gain = res==="win"?ECO.win:res==="draw"?ECO.draw:ECO.loss;
  if(!S.mp){ if(res==="win") P.w++; else if(res==="lose") P.l++; else P.d++; }
  ensureQuests(); const qBefore=P.q.list.map(q=>q.p>=QDEF[q.id].n);
  qProg("play3"); if(res==="win") qProg("win3");
  if(rows.some(r=>r.w==="p"&&r.a>=15)) qProg("loc15");
  if(pw===3) qProg("sweep"); if(pt>=40) qProg("power40"); if(S.killE) qProg("kill4",S.killE);
  qEnd(res,false); if(!S.mp&&S.oath!=null&&leader(S.oath)==="p") qProg("oath");
  const qDone=P.q.list.filter((q,i)=>!qBefore[i]&&q.p>=QDEF[q.id].n).map(q=>qText(q));
  if(S.mp){
    if(res==="win") P.dw++; else if(res==="lose") P.dl++; else P.dd++;
    P.chf+=gain; pushHist("Duel",res,S.mp.oppNick,pw,ew,{gain}); save(); mpSaveSession(null);
    S.over={res,rows,pw,ew,pt,et,tie:pw===ew,gain,qDone,mp:true};
    endCine(S.over); endMusic(res); setTimeout(()=>sfx("coin"),700);
    render(); return;
  }
  if(res==="win") P.sw++; else if(res==="lose") P.sl++; else P.sd++;
  const oath=S.oath!=null?(leader(S.oath)==="p"?"kept":"broken"):null;
  const rk=applyRank(res,oath,S.oath!=null&&S.oath===S.aiOath);
  P.chf+=gain; pushHist("IA",res,`IA ${FAC[S.aiFac].n} · ${TIERS[S.aiTier]}`,pw,ew,{gain,lv:P.lv}); save(); lbPublish();
  S.over={res,rows,pw,ew,pt,et,tie:pw===ew,gain,rk,qDone};
  if(rk.up) setTimeout(()=>sfx("legend"),900);
  endCine(S.over); endMusic(res); setTimeout(()=>sfx("coin"),700);
  render();
}
