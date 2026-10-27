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

function aiDeck(t,full,noUL){   /* noUL : le Blitz n'a aucune ultra-légendaire, ni pour le joueur ni pour l'IA */
  const own=full?4:Math.max(2,...P.owned.map(id=>RVAL[CARDS[id].r]));
  const cap=Math.min([1,2,3,3,4,4,4][t],own);
  const pool=PACK().filter(id=>RVAL[CARDS[id].r]<=cap&&id!=="reflet_noir");   /* injouable depuis la main : jamais dans le deck de l'IA */
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
  if(t>=4&&!noUL){ for(const u of shuffle(ULS.filter(u=>REL(u.id)))){ if(!ulOk(u,deck)) continue; const need=new Set(u.req.flat()); let k=-1; deck.forEach((x,i)=>{ if(!need.has(x)&&!paired(x)&&CARDS[x].fac!==u.fac&&(k<0||sc[x]<sc[deck[k]])) k=i; }); if(k<0) deck.forEach((x,i)=>{ if(!need.has(x)&&(k<0||sc[x]<sc[deck[k]])) k=i; }); if(k>=0){ const was=deck[k]; deck[k]=u.id; if(ulOk(u,deck)) break; deck[k]=was; } } }
  /* Nike : le deck emporte jusqu'à 3 petites cartes Jugement (coût 0 ou 1) à jouer avant elle, à la place de ses cartes les plus faibles */
  if(deck.some(isNike)){ const sj=id=>CARDS[id].fac==="jugement"&&CARDS[id].cost<=1&&!isNike(id), u=ULof(deck.find(isNike));
    let have=deck.filter(sj).length;
    for(const id of pool.filter(x=>sj(x)&&!deck.some(y=>charOf(y)===charOf(x))).sort((a,b)=>sc[b]-sc[a])){ if(have>=3) break;
      let k=-1; deck.forEach((x,i)=>{ if(!isNike(x)&&!sj(x)&&!paired(x)&&(k<0||sc[x]<sc[deck[k]])) k=i; }); if(k<0) break;
      const was=deck[k]; deck[k]=id; if(u&&!ulOk(u,deck)){ deck[k]=was; break; } have++; } }
  return {deck:deck.slice(0,ECO.deckSize),fac};
}
/* Trois lieux au hasard ; le week-end, le lieu à l'honneur du jour en fait toujours partie (à une place tirée au hasard) */
function pickLocs(){ const f=featureLoc(); let ids=shuffle(locPool()).slice(0,3); if(f&&!ids.includes(f)) ids=shuffle([f,...ids.slice(0,2)]); return ids; }
function newGame(){
  RNG=Math.random;
  if(!deckReady()){ screen="deck"; render(); return; }
  if(S&&S.blitz&&!S.over) bzEndRun();
  const firstEver = games===0 && P.w+P.l+P.d===0, locIds = firstEver ? ["ruelle","ouchy","sousgare"] : pickLocs();
  games++;
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:locIds.map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:shuffle(P.deck.map(mk)), e:[]}, aiTier:tierOf(P.lv), aiFac:null,
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null};
  S.feat=!firstEver&&locIds.includes(featureLoc())?featureLoc():null; /* lieu à l'honneur présent dans cette partie */
  const ai=aiDeck(S.aiTier); S.deck.e=shuffle(ai.deck.map(mk)); S.aiFac=ai.fac;
  /* Replay (25 octobre) : graine du hasard de la partie et ordre exact des decks ; les coups de chaque tour sont ajoutés par resolveTurn */
  { const seed=(Math.random()*2147483647)|0; RNG=mulberry(seed); S.rec={v:BUILD,seed,locs:locIds.slice(),feat:S.feat||null,dp:S.deck.p.map(c=>c.id),de:S.deck.e.map(c=>c.id),fac:S.aiFac,tier:S.aiTier,turns:[]}; }
  for(let i=0;i<3;i++){draw("p");draw("e");}
  log(`Adversaire : deck ${FAC[ai.fac].n} · niveau ${TIERS[S.aiTier]}`);
  screen="play"; startTurn();
}
function log(t){ S.log.unshift(t); S.log=S.log.slice(0,40); }
function draw(s){ if(!S.deck[s].length||S.hand[s].length>=7) return; const c=S.deck[s].shift();
  /* Lance de Lugh : piochée, elle disparaît (la pioche est consommée) et Lugh, s'il est en jeu, gagne +4 ; sinon elle disparaît sans effet */
  if(eid(c)==="lance_lugh"){ const l=S.board[s].flat().find(x=>eid(x)==="lugh"&&x.rev); if(l){ l.pow+=4; (l.mods=l.mods||[]).push({v:4,src:"Lance de Lugh"}); log(`La Lance de Lugh disparaît : Lugh +4 (${who(s)})`); sfx("buff"); } return; }
  S.hand[s].push(c); }
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
  S.turn++; S.costNow=S.costNext||{p:0,e:0}; S.costNext={p:0,e:0};   /* Patronne, Typhon : coûts de ce tour */
  S.energy=S.turn+S.bonus.p; S.energyE=S.turn+S.bonus.e; S.bonus={p:0,e:0};
  if(S.turn<=3){ const L=S.locs[S.turn-1], li=S.turn-1; L.rev=true; log(`Tour ${S.turn} · lieu révélé : ${LOCS[L.id].name}`); sfx("loc"); if(screen==="play") setTimeout(()=>FX.play("l_"+L.id,{li}),60); }
  else log(`Tour ${S.turn}`);
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li])
    if(c.rev && eid(c)==="vasseur" && c.pay===S.turn && !c.neg){ c.pow+=4; (c.mods=c.mods||[]).push({v:4,src:"Vasseur (paiement)"}); log(`Vasseur paie : +4 (${who(s)})`); sfx("coin"); }
  /* Qetesh du Nouvel An : à minuit (début du tour qui suit sa Révélation), elle charme la carte adverse la plus forte ici de coût 5 ou moins */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(c.midnight===S.turn){ c.midnight=0;
    if(!live(c)) continue; const t=midnightCharm(s,li,c);
    if(t){ log(`Minuit · ${nm(c)} charme ${nm(t)} (${who(s)})`); sfx("legend"); } }
  /* Loviatar : la carte ressuscitée malade perd 1 au début de chacun des tours restants (compteur c.sick) */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(c.sick>0){ c.sick--; c.pow-=1; (c.mods=c.mods||[]).push({v:-1,src:"Loviatar (maladie)"}); log(`Maladie · ${nm(c)} perd 1 (${who(s)})`); }
  /* Déméter : la récolte, au début du tour suivant sa Révélation, avant la pioche : toute la main gagne +1 (par Déméter jouée) */
  if(S.harv) for(const k of ["p","e"]) if(S.harv[k]){ const n=S.harv[k]; S.harv[k]=0; for(const x of S.hand[k]){ x.pow+=n; (x.mods=x.mods||[]).push({v:n,src:"Déméter"}); } if(S.hand[k].length){ log(`Déméter · la main de ${who(k)} gagne +${n}`); sfx("buff"); } }
  draw("p"); draw("e"); S.sel=null; S.swimP=null; S.swimSel=false; render();
}

/* --- règles utilitaires --- */
const locIs=(li,key)=>S.locs[li].rev && !S.locs[li].stopped && S.locs[li].id===key;
const cap=li=>(locIs(li,"ruelle")?2:4);
const capOf=(s,li)=>Math.max(0,cap(li)-((S.cond&&S.cond[s][li])||0));
const muted=(s,li)=>!!(S.mute&&S.mute.some(m=>m.s===s&&m.li===li&&m.t===S.turn));
const nemInv=li=>(["p","e"].reduce((n,s)=>n+S.board[s][li].filter(o=>live(o)&&eid(o)==="nemesis").length,0))%2===1;
/* Charme : celui de Qetesh dure jusqu'à la fin ; celui d'Hédoné (charmBy) cesse dès qu'elle quitte le jeu ou perd ses effets */
const charmOf=c=>c.charm&&(!c.charmBy||captorLive(c.charmBy))?c.charm:null;
function captorLive(uid){ for(const s of ["p","e"]) for(const col of S.board[s]) for(const o of col) if(o.uid===uid&&live(o)) return true; return false; }
const SELFMOVE=new Set(["nageuse_lac"]);   /* cartes dotées d'un effet leur permettant de se déplacer elles-mêmes (Hélios) */
const stagedAt=li=>S.staged.filter(x=>x.li===li&&eid(x.c)!=="herakles").length+(S.swimP?(S.swimP.li===li?1:0)-(S.swimP.from===li?1:0):0);
/* Thémis : à partir du tour suivant son arrivée, chaque joueur ne peut jouer qu'une carte par tour dans son lieu (les deux camps) */
const themisOn=li=>["p","e"].some(s=>S.board[s][li].some(x=>live(x)&&eid(x)==="themis"&&(x.arr||0)<S.turn));
/* La Nageuse du Lac : une fois par partie, avant de jouer, elle passe dans un autre lieu révélé où il reste une place alliée (disponible dès le tour suivant son arrivée) */
function swimmer(s="p"){ if(S.busy||S.over||S.swimP) return null; for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(live(c)&&eid(c)==="nageuse_lac"&&(c.arr==null||c.arr<S.turn)&&c.swimT!==S.turn&&!fated(c)&&!c.captive) return {c,li}; return null; }
function swimOk(li){ const w=swimmer(); return !!w&&li!==w.li&&S.locs[li].rev&&!S.locs[li].locked&&leader(li)!=="p"&&slotsUsed("p",li)+stagedAt(li)<capOf("p",li); }   /* jamais vers un lieu où tu mènes déjà */
/* Pourquoi la Nageuse ne peut pas traverser (pour l'afficher dans le bouton), ou "" si elle le peut */
function swimWhy(){ if(S.swimP||S.busy||S.over) return ""; const c=S.board.p.flat().find(x=>live(x)&&eid(x)==="nageuse_lac"); if(!c) return null;
  if(c.arr!=null&&c.arr>=S.turn) return "dès le prochain tour"; if(c.swimT===S.turn) return "déjà traversée ce tour"; if(fated(c)||c.captive) return "immobilisée";
  return [0,1,2].some(swimOk)?"":"aucun lieu possible"; }
function swimTo(li){ const w=swimmer(); if(!w||!swimOk(li)) return false; S.swimP={c:w.c,li,from:w.li}; S.swimSel=false; return true; }
const live=(c)=>c.rev&&!c.neg;
/* Anahita : identité dont la carte copie l'effet (c.cp), sinon la sienne. Tous les effets Continu et Révélation lisent eid(c) */
const eid=c=>c.cp||c.id;
const onSide=(s,id)=>S.board[s].some(col=>col.some(c=>c.rev&&eid(c)===id));
const inPlay=id=>["p","e"].some(s=>S.board[s].some(col=>col.some(c=>c.rev&&eid(c)===id)));
const hasHere=(s,li,id)=>S.board[s][li].some(c=>live(c)&&eid(c)===id);
const shielded=(s,li)=>hasHere(s,li,"eir")||hasHere(s,li,"ulcal");               /* Eir : ni détruites ni affaiblies */
const untargetable=(by,s,c)=>by!==s && eid(c)==="uzume" && !c.neg; /* Uzume : aucun effet adverse ne la vise, il passe à la cible suivante (Ananké : voir `fated`, seulement destruction et déplacement) */
/* Vesta : ta prochaine carte Jugement coûte 1 de moins (une seule carte : la première carte Jugement de coût 1 ou plus posée dans l'ordre,
   pour que la réduction ne se perde pas sur une carte à 0 comme Mā‘at ou la Flèche d'Apollon ; minimum 0) */
const vestaOn=s=>!!(S.vesta&&S.vesta[s]);
const vestaT=id=>CARDS[id].fac==="jugement"&&CARDS[id].cost>=1;
const jugFirst=(list,i)=>!list.slice(0,i).some(x=>vestaT((x.c||x).id));
function costOf(s,c,li,isFirst,jf){ return c.free?0:Math.max(0,costFor(s,c.id,li,isFirst,jf)-(c.cheap||0)); }
function costFor(s,id,li,isFirst,jf){ let c=CARDS[id].cost; if(id==="ulya") c-=S.hand[s].filter(x=>eid(x)!=="ulya").length; if(id==="ereshkigal_n"&&S.hand[s].some(x=>charOf(x.id)==="nergal")) c-=2; if(S.costNow) c+=S.costNow[s]||0; if(CARDS[id].fac==="helvara"&&S.board[s].some(col=>col.some(o=>live(o)&&eid(o)==="ularchiviste"))) c-=1; if(isFirst) c-=S.disc[s]; if(jf&&vestaT(id)&&vestaOn(s)) c-=1; if(locIs(li,"sousgare")) c-=1; if(locIs(li,"encheres")) c+=1; return Math.max(0,c); }
function used(){ return S.staged.reduce((a,x,i)=>a+(x.fixed!=null?x.fixed:costOf("p",x.c,x.li,i===0,jugFirst(S.staged,i))),0); }
/* Nemesis ne peut pas être jouée au tour 6, même avec de l'énergie en réserve (Prométhée) */
/* Règle de design : les cartes qui verrouillent un lieu (Nemesis, Cronos, Ananké) ne peuvent pas être jouées au tour 6, même avec de l'énergie gardée (Prométhée) */
const banned=c=>eid(c)==="reflet_noir"||((eid(c)==="nemesis"||eid(c)==="cronos"||isAnk(c))&&S.turn>=6);
/* Plume de Quetzalcoatl : elle occupe une case mais ne compte pas comme une place : la carte suivante la remplace */
const slotsUsed=(s,li)=>S.board[s][li].filter(x=>eid(x)!=="plume").length;
function canStage(c,li){
  if(S&&S.tut){ if(!tutReq().some(([id,l])=>id===c.id&&l===li&&!S.staged.some(x=>eid(x.c)===id))) return false; }
  if(!c||S.locs[li].locked||muted("p",li)) return false;
  if(banned(c)) return false;
  if(themisOn(li)&&stagedAt(li)-(S.swimP&&S.swimP.li===li?1:0)>=1) return false;
  if(eid(c)==="herakles"){ if(slotsUsed("e",li)>=capOf("e",li)) return false; }   /* Héraklès : seulement là où l'adversaire a de la place (il passe de son côté) */
  else if(!tezAt("p",li)&&slotsUsed("p",li)+stagedAt(li)>=capOf("p",li)) return false;   /* Tezcatlipoca : les cartes jouées ici sont absorbées, elles ne prennent pas de place */
  return used()+costOf("p",c,li,S.staged.length===0,jugFirst(S.staged,S.staged.length))<=S.energy;
}
/* Ananké, Fatalité : en fin de partie (S.final, après toutes les révélations et fins de tour du tour 6), sa puissance devient la puissance totale adverse ici +1.
   Deux Ananké face à face : la seconde compte pour 1 dans le calcul de la première (garde ANK, pas de boucle). */
let ANK=0;
/* charmée (Qetesh) : elle compte pour celui qui l'a charmée, donc sa puissance est celle de SON adversaire, le joueur qui la possède, +1 */
function ankEnd(s,li,c){ if(ANK) return c.pow; ANK=1; try{ return total(opp(charmOf(c)||s),li)+1; } finally{ ANK=0; } }
function cardPow(s,li,c){
  if(!c.rev) return 0;
  if(c.captive&&captorLive(c.captive)) return 0;   /* captive (Calypso) : 0, Ananké comprise, même en fin de partie */
  if(S.final&&fated(c)&&isAnk(c)&&!apoOf(s,li)) return ankEnd(s,li,c);   /* Apophis adverse ici : la Fatalité d'Ananké se déclenche pour elle */
  if(S.final&&eid(c)==="apophis"&&!c.neg&&S.board[opp(s)][li].some(x=>fated(x)&&isAnk(x))) return ankEnd(s,li,c);
  let p=c.pow; const d=CARDS[c.id];
  for(const o of S.board[s][li]) if(o!==c && live(o) && eid(o)==="mouche") p-=1;
  for(const o of S.board[s][li]) if(o!==c && live(o) && eid(o)==="ulcal") p+=2;
  for(const o of S.board[s][li]) if(o!==c && live(o) && eid(o)==="ishara") p+=1;
  if(d.fac==="helvara") for(let i=0;i<3;i++) for(const o of S.board[s][i]) if(o!==c && live(o) && eid(o)==="doyenne") p+=1;
  for(const o of S.board[opp(s)][li]) if(live(o) && eid(o)==="meute") p+=2;   /* La Meute du M2 : les cartes adverses ici ont +2 */
  if(d.cost===3&&!d.token) for(let i=0;i<3;i++) for(const o of S.board[s][i]) if(o!==c && live(o) && eid(o)==="musicien") p+=2;   /* Le Musicien : tes autres cartes de coût d'origine 3 (une copie d'Anahita compte aussi, des deux côtés : seule la carte elle-même est exclue) */
  if(!c.neg){
    if(eid(c)==="gaia") for(let i=0;i<3;i++) if(i!==li&&slotsUsed(s,i)>=capOf(s,i)) p+=2;   /* Gaïa : +2 par autre lieu où ton côté est plein */
    if(eid(c)==="costumes" && inPlay("thot")) p+=4;
    if(eid(c)==="freyr" && hasHere(s,li,"freya")) p+=2;
    if(eid(c)==="tsukuyomi" && S.board[s][li].some(x=>x!==c&&x.rev&&CARDS[x.id].fac==="jugement")) p+=2;
    if(eid(c)==="freya" && hasHere(s,li,"freyr")) p+=4;
    if(eid(c)==="selene" && S.turn>=5) p+=3;
    if(eid(c)==="nergal" && S.board[s].some(col=>col.some(o=>live(o)&&eid(o)==="ereshkigal"))) p+=3; /* continu */
    if((isNike(c.id)||eid(c)==="bia") && S.board[s].some(col=>col.some(o=>live(o)&&eid(o)==="styx"))) p+=3; /* Styx veille sur ses filles */
    if(eid(c)==="fange") p+=S.discarded||0;
    if(eid(c)==="ea") for(const col of S.board[s]) for(const o of col) if(o!==c&&o.rev&&CARDS[o.id].fac==="desir"&&!CARDS[o.id].token) p+=2;   /* Ea (Enki) : +2 par autre carte Désir de ton côté */
    if(eid(c)==="ulqetyar") for(let i=0;i<3;i++){ const f=S.board[s][i].filter(o=>o.rev).map(o=>CARDS[o.id].fac); if(f.includes("desir")&&f.includes("primordial")) p+=3; }
    if(eid(c)==="yarden_d") for(let i=0;i<3;i++) for(const o of S.board[s][i]) if(o!==c&&o.rev&&CARDS[o.id].fac==="primordial"&&!CARDS[o.id].token) p+=2;
  }
  for(let i=0;i<3;i++) for(const o of S.board[s][i]) if(o!==c&&live(o)&&eid(o)==="ulqetjor") p+=1;
  for(const o of S.board[s][li]) if(o!==c&&live(o)&&eid(o)==="ulqetjor_r") p+=1;
  if(c.risen&&S.board[s].some(col=>col.some(o=>live(o)&&eid(o)==="izanami"))) p+=2; /* Izanami : tes cartes ressuscitées */
  if(locIs(li,"domaine")&&JPARTNERS.has(c.id)) p+=2;
  if(!shielded(s,li)&&!sunlit(s)&&!noWeak(c)&&!(eid(c)==="baldur"&&!c.neg)) p-=S.board[opp(s)][li].filter(o=>live(o)&&eid(o)==="hathor").length;
  if(!shielded(s,li)&&!sunlit(s)&&!noWeak(c)&&!(eid(c)==="baldur"&&!c.neg)) p-=S.board[s][li].filter(o=>o!==c&&live(o)&&eid(o)==="oeuf_maudit").length;   /* Œuf maudit : −1 à ses autres cartes ici (cumulable) */
  if(locIs(li,"tour") && d.pow>=5 && !d.token) p+=2;
  if(locIs(li,"encheres") && !d.token) p+=2;
  if(locIs(li,"escaliers") && d.fac==="helvara" && !d.token) p+=2;
  if(S.board[opp(s)][li].some(o=>live(o)&&eid(o)==="chernobog")) p=Math.min(p,d.pow);
  if(hasHere(s,li,"psyche")) p=Math.max(1,p);
  /* Héra, la jalousie : la comparaison se fait AVANT l'effet (HERA : plus de boucle, y compris entre deux Héra face à face) */
  if(!HERA){ const o=opp(s), hOwn=live(c)&&eid(c)==="hera", hFoe=S.board[o][li].filter(x=>live(x)&&eid(x)==="hera");
    if(hOwn||hFoe.length){ HERA=1; try{
      const top=side=>{ let best=null; for(const x of S.board[side][li]) if(x.rev){ const v=cardPow(side,li,x); if(!best||v>best.v) best={x,v}; } return best; };
      if(hOwn){ const e=top(o); if(e&&e.v<p) p-=Math.ceil(Math.max(0,p)/2); }
      if(hFoe.length&&!shielded(s,li)&&!sunlit(s)&&!noWeak(c)&&!baldurSafe(s,c)&&!fated(c)&&!untargetable(o,s,c)){ const t=top(s);
        if(t&&t.x===c){ const hv=cardPow(o,li,hFoe[0]); if(t.v>=hv) p-=Math.ceil(Math.max(0,t.v)/2); } }
    } finally{ HERA=0; } } }
  if(c.medCap!=null) p=Math.min(p,c.medCap);   /* Méduse : ne peut plus gagner de puissance (plafond = sa puissance juste après l'affaiblissement) */
  return p;
}
let HERA=0;
function total(s,li){
  const o=opp(s);
  let t=S.board[s][li].reduce((a,c)=>a+(charmOf(c)===o?0:cardPow(s,li,c)),0)+S.board[o][li].reduce((a,c)=>a+(charmOf(c)===s?cardPow(o,li,c):0),0);
  for(const i of [li-1,li+1]) if(i>=0&&i<3) t+=2*S.board[s][i].filter(c=>live(c)&&eid(c)==="graffeur").length;
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
const sunlit=s=>S.board[s].some(col=>col.some(x=>live(x)&&eid(x)==="amaterasu"));
/* Défausse et cimetière : on garde les cartes (Hel, Hadès, Loviatar, le Tombeau). Les jetons et les Échos disparaissent. */
const piles=()=>{ S.discardPile=S.discardPile||{p:[],e:[]}; S.graveyard=S.graveyard||{p:[],e:[]}; };
const real=c=>!CARDS[c.id].token&&!c.echo;
function discard(s,c){ if(s==="p"&&qLive()) qProg("disc3"); S.hand[s]=S.hand[s].filter(x=>x!==c); S.discarded=(S.discarded||0)+1; piles();
  /* Marduk : chaque fois qu'il est défaussé, il gagne +2 de puissance et revient dans la main (il ne va jamais en défausse) */
  if(eid(c)==="marduk"){ c.pow+=2; (c.mods=c.mods||[]).push({v:2,src:"Marduk"}); S.hand[s].push(c); log(`Marduk est défaussé et revient dans la main : +2 (${who(s)})`); sfx("buff"); return; }
  /* Le Reflet Noir : défaussée, elle entre en jeu gratuitement dans un lieu au hasard où il reste de la place (sinon elle reste défaussée) */
  if(eid(c)==="reflet_noir"){ const ok=[0,1,2].filter(li=>!S.locs[li].locked&&slotsUsed(s,li)<capOf(s,li));
    if(ok.length){ const li=gPick(ok); const pl=S.board[s][li].find(x=>eid(x)==="plume"); if(pl&&S.board[s][li].length>=capOf(s,li)) S.board[s][li]=S.board[s][li].filter(x=>x!==pl);
      c.rev=true; c.fresh=true; S.board[s][li].push(c); log(`Le Reflet Noir entre en jeu : ${LOCS[S.locs[li].id].name} (${who(s)})`); sfx("void"); return; } }
  if(real(c)) S.discardPile[s].push(c.id); }
function bury(s,c){ piles(); if(real(c)) S.graveyard[s].push(c.id);
  if(eid(c)==="mjolnir"&&c.thor){ for(const col of S.board[s]) for(const t of col) if(t.uid===c.thor&&live(t)){ t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"Mjölnir"}); log(`Thor récupère Mjölnir : +2 (${who(s)})`); } } }
/* Apophis : les effets de fin de tour des cartes adverses ici se déclenchent pour elle. eot(id) liste les déclenchements de fin de tour de la carte `id` :
   {s0,c0} = la carte d'origine (ses conditions, ses compteurs), {s,c} = la source de l'effet (la carte elle-même, ou Apophis si un Apophis adverse est dans son lieu). Un déclenchement détourné ne l'est qu'une fois. */
const apoOf=(s,li)=>S.board[opp(s)][li].find(x=>live(x)&&eid(x)==="apophis")||null;
function eot(id,first="p"){ const out=[]; for(const s0 of [first,opp(first)]) for(let li=0;li<3;li++) for(const c0 of S.board[s0][li].slice()) if(live(c0)&&eid(c0)===id){ const a=apoOf(s0,li); out.push(a?{s0,li,c0,s:opp(s0),c:a}:{s0,li,c0,s:s0,c:c0}); } return out; }
/* Qetesh du Nouvel An, minuit : la carte adverse la plus forte ici de puissance 5 ou moins (lue maintenant) est charmée (renvoie la cible ou null) */
function midnightCharm(s,li,c){
  const o=opp(s);
  const t=S.board[o][li].filter(x=>x.rev&&!charmOf(x)&&!untargetable(s,o,x)&&cardPow(o,li,x)<=5).sort((a,b)=>cardPow(o,li,b)-cardPow(o,li,a))[0];
  if(t){ t.charm=s; delete t.charmBy; } return t||null; }
/* Hédoné, Continu : à la fin de chaque tour, elle attire ici la carte adverse la plus faible d'un AUTRE lieu (s'il y a de la place de son côté adverse)
   et la charme tant qu'elle reste en jeu ; 2 fois au plus (compteur c.hed). Rien à faire : pas de place, pas de cible = ne compte pas.
   Les cartes insaisissables (Ananké, Uzume) ne sont jamais attirées ; égalité de puissance : gPick. `first` fixe l'ordre des deux camps (identique chez les deux joueurs en duel). */
function hedoneTurn(first){
  let n=0;
  for(const {s,li,c0,c:h} of eot("hedone",first)){
    if((c0.hed||0)>=2||S.locs[li].locked||!S.board[s][li].includes(h)) continue;
    const o=opp(s); if(S.board[o][li].length>=capOf(o,li)) continue;
    const pool=[]; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&!fated(x)&&!charmOf(x)) pool.push([i,x,cardPow(o,i,x)]);
    if(!pool.length) continue;
    const mn=Math.min(...pool.map(q=>q[2])), [i,t]=gPick(pool.filter(q=>q[2]===mn));
    S.board[o][i]=S.board[o][i].filter(x=>x!==t); S.board[o][li].push(t); t.fresh=true; flonHook(li,t);
    t.charm=s; t.charmBy=h.uid; c0.hed=(c0.hed||0)+1; n++;
    log(`Hédoné attire ${nm(t)} et la charme (${who(s)})`); sfx("legend"); }
  return n; }
/* Ressusciter : la carte revient révélée, à sa puissance de base, sans Révélation (sauf withReveal). */
function resurrect(s,id,li,from,opts={}){
  if(S.locs[li].locked&&!opts.anyLoc) return null; if(S.board[s][li].length>=capOf(s,li)) return null;
  const pile=from==="grave"?S.graveyard[s]:S.discardPile[s]; const k=pile.lastIndexOf(id); if(k<0) return null; pile.splice(k,1);
  const c=mk(id); c.fresh=true; c.risen=true; c.arr=S.turn; S.board[s][li].push(c);
  if(opts.ward) c.ward=true; if(opts.sick!=null) c.sick=opts.sick;   /* Loviatar : −1 au début de chacun des tours restants (voir startTurn) */
  if(opts.withReveal) reveal(s,li,c); else c.rev=true;
  return c;
}
function resurrectAll(s,opts={}){ piles(); let n=0; const ids=gShuffle(S.discardPile[s].slice());
  for(const id of ids){ const sp=[0,1,2].filter(i=>!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)); if(!sp.length) break; if(resurrect(s,id,gPick(sp),"discard",opts)) n++; }
  return n; }
/* Source de l'effet en cours : Baldur ne cède qu'aux effets adverses de coût 2 ou moins (le gui). */
let SRC=null;
const baldurSafe=(s,c)=>eid(c)==="baldur"&&!c.neg&&!(SRC&&(SRC.s===s||SRC.cost<=2));
/* Ananké, Fatalité (15 octobre, 2e version) : elle ne peut être ni détruite ni déplacée (renvoi en main, dispersion, attraction d'Hédoné compris), par aucun effet. Tout le reste l'atteint : charme, captivité, transformation, vol, perte d'effet (Apsu, Mohini : neg, elle reste à 1), affaiblissement ; Nemesis la bat. */
const fated=c=>(isAnk(c)||c.fate)&&!c.neg;   /* Fatalité : Ananké, et Fenrir quand une carte alliée a été détruite avant lui (c.fate) */
/* Pêche d'immortalité (Xi Wangmu) : ne peut pas être détruite */
const deathless=c=>(eid(c)==="peche_immortalite"||(eid(c)==="change"&&c.moon))&&!c.neg;   /* Chang'e : après son premier déplacement */
const noWeak=c=>((eid(c)==="ecorche"||eid(c)==="jordan")&&!c.neg)||c.noweak||c.ward; /* l'Écorché, Jordan, le Tatoueur, Hel X Baldur */
function weaken(s,li,c,n,bonusOnly){ if(shielded(s,li)||sunlit(s)||noWeak(c)||baldurSafe(s,c)) return false;
  /* La Couturière de la Cité : une fois par tour, elle empêche le premier affaiblissement subi par l'une de tes cartes ici */
  const co=S.board[s][li].find(x=>live(x)&&eid(x)==="couturiere"&&x.coutT!==S.turn);
  if(co&&S.board[s][li].includes(c)){ co.coutT=S.turn; log(`La Couturière protège ${nm(c)} (${who(s)})`); sfx("buff"); return false; }
  c.pow-=n; if(!bonusOnly) c.malus=(c.malus||0)+n; return true; }   /* c.malus : total des affaiblissements subis (Shamash ne retire que les bonus) */
/* Styx : les cartes Jugement de son côté, dans son lieu, ne peuvent pas être détruites */
/* Styx : une carte Jugement de son camp détruite ici par un effet ADVERSE revient en main, avec la puissance qu'elle avait.
   (Un effet de son propre camp, comme la Ficelle Dévorante, ou la Faille ne la ramènent pas.) */
function styxReturn(s,li,c){
  if(!real(c)||CARDS[c.id].fac!=="jugement"||!SRC||SRC.s===s||!S.board[s][li].some(x=>live(x)&&eid(x)==="styx")) return false;
  c.rev=false; c.neg=false; c.fresh=false; c.midnight=0; c.risen=false; c.sick=0; delete c.charm; delete c.charmBy; delete c.captive; delete c.ward;
  if(S.hand[s].length<7) S.hand[s].push(c); else { S.discarded=(S.discarded||0)+1; piles(); S.discardPile[s].push(c.id); }
  return true; }
/* Une carte détruite va au cimetière (ou revient en main grâce à Styx) */
const makeRoom=(s,li)=>{ if(S.board[s][li].length>=capOf(s,li)){ const pl=S.board[s][li].find(x=>eid(x)==="plume"); if(pl) S.board[s][li]=S.board[s][li].filter(x=>x!==pl); } };   /* la Plume cède sa case */
const tezAt=(s,li)=>S.board[s][li].find(o=>live(o)&&eid(o)==="tezcatlipoca")||null;
/* Kama détruit revient dans la main (avec sa puissance) si elle n'est pas pleine */
function kamaBack(s,c){ if(eid(c)!=="kama"||!live(c)||S.hand[s].length>=7) return false;
  c.rev=false; c.neg=false; c.fresh=false; c.midnight=0; c.risen=false; c.sick=0; delete c.charm; delete c.charmBy; delete c.captive; delete c.ward; delete c.cp;
  S.hand[s].push(c); log(`Kama est détruit et revient dans la main (${who(s)})`); return true; }
/* Quand une de tes cartes (hors jetons) est détruite : tes Kama gagnent +2 ; Belobog, s'il est dans ta main, entre gratuitement à sa place (une fois par tour) */
function destroyedHook(s,li,c){ if(!real(c)) return;
  (S.lostT=S.lostT||{p:0,e:0})[s]=S.turn;   /* Fenrir : une carte alliée a été détruite ce tour-ci */
  for(const k of S.board[s][li]) if(k!==c&&live(k)&&eid(k)==="voyante_barbare"&&(k.bar||0)<2){ k.bar=(k.bar||0)+1; draw(s); log(`La Barmaid aux Squelettes · ${who(s)} pioche 1 carte`); sfx("buff"); }   /* deux déclenchements au maximum */
  for(let i=0;i<3;i++) for(const k of S.board[s][i]) if(k!==c&&live(k)&&eid(k)==="kama"){ k.pow+=2; (k.mods=k.mods||[]).push({v:2,src:"Kama"}); log(`Kama · +2 (${who(s)})`); sfx("buff"); }
  const b=S.hand[s].find(x=>eid(x)==="belobog"); S.belT=S.belT||{p:0,e:0};
  if(b&&S.belT[s]!==S.turn&&!S.locs[li].locked&&slotsUsed(s,li)<capOf(s,li)){ S.belT[s]=S.turn; S.hand[s]=S.hand[s].filter(x=>x!==b); makeRoom(s,li); b.rev=true; b.fresh=true; S.board[s][li].push(b);
    log(`Belobog entre en jeu à la place de ${nm(c)} : ${LOCS[S.locs[li].id].name} (${who(s)})`); sfx("legend"); } }
const entomb=(s,li,c)=>{
  /* Sun Wukong : la première fois qu'il est détruit, un Clone de même puissance prend sa place ; Osiris : un Revenant à l'opposé de la puissance positive de la première carte alliée détruite ici */
  const lastPow=real(c)?cardPow(s,li,c):0;
  if(real(c)&&eid(c)==="sun_wukong"&&!c.neg&&!c.cloned){ c.cloned=true; const k=mk("clone_wukong"); k.pow=lastPow; k.rev=true; k.fresh=true; if(S.turn<5) k.gone=S.turn+1; S.board[s][li].push(k); log(`Sun Wukong laisse un Clone (${who(s)})`); sfx("void"); }
  if(real(c)){ const os=S.board[s][li].find(x=>x!==c&&live(x)&&eid(x)==="osiris"&&!x.revU); if(os){ os.revU=true; const o=opp(s);
    if(S.board[o][li].length<capOf(o,li)){ const k=mk("revenant"); k.pow=-Math.max(0,lastPow); k.rev=true; k.fresh=true; S.board[o][li].push(k); log(`Osiris · un Revenant à ${k.pow} apparaît chez ${who(o)}`); sfx("void"); } } }
  const lost=c.abs&&c.abs.length?c.abs:null; if(lost) c.abs=[];
  if(!styxReturn(s,li,c)&&!kamaBack(s,c)){ bury(s,c);
    /* Bari Gongju : tes cartes détruites ici comptent aussi comme défaussées (Marduk revient en main, le Reflet Noir entre en jeu…) */
    if(real(c)&&S.board[s][li].some(x=>live(x)&&eid(x)==="bari_gongju")){ log(`Bari Gongju · ${nm(c)} compte aussi comme défaussée (${who(s)})`);
      if(c.id==="marduk"){ const k=S.graveyard[s].lastIndexOf("marduk"); if(k>=0) S.graveyard[s].splice(k,1); }
      discard(s,c); } }
  destroyedHook(s,li,c);
  /* Tezcatlipoca détruit : les cartes qu'il a absorbées sont perdues avec lui (considérées comme détruites) */
  if(lost){ for(const a of lost){ S.destroyed++; bury(s,a); danteHook(li); } log(`${nm(c)} entraîne ${lost.length} carte${lost.length>1?"s":""} absorbée${lost.length>1?"s":""} (${who(s)})`); for(const a of lost) destroyedHook(s,li,a); }
};
/* Après la Révélation d'une carte JOUÉE : Tezcatlipoca l'absorbe (sa puissance s'ajoute à la sienne, elle quitte le plateau) ; Horus gagne +1 par carte jouée après lui (5 au maximum) */
function afterPlay(s,li,c){
  const t=tezAt(s,li);
  if(t&&t!==c&&eid(c)!=="tezcatlipoca"&&!CARDS[c.id].token&&S.board[s][li].includes(c)){
    const g=cardPow(s,li,c); t.pow+=g; S.board[s][li]=S.board[s][li].filter(x=>x!==c); (t.abs=t.abs||[]).push(c);
    log(`Tezcatlipoca absorbe ${nm(c)} : +${g} (${who(s)})`); sfx("void"); }
  for(let i=0;i<3;i++) for(const h of S.board[s][i]) if(h!==c&&live(h)&&eid(h)==="horus"&&h.pow<5){ h.pow+=1; log(`Horus · +1 (${who(s)})`); }
}
/* garde-fou : si un lieu déborde (Tezcatlipoca détruit avant d'avoir absorbé une carte), les dernières cartes en trop sont perdues */
function trimOverflow(){ for(const s of ["p","e"]) for(let li=0;li<3;li++) while(S.board[s][li].some(y=>eid(y)==="tezcatlipoca")&&slotsUsed(s,li)>capOf(s,li)){ const x=S.board[s][li].slice().reverse().find(y=>eid(y)!=="tezcatlipoca"&&!CARDS[y.id].token); if(!x) break; S.board[s][li]=S.board[s][li].filter(y=>y!==x); bury(s,x); log(`Plus de place : ${nm(x)} est perdue (${who(s)})`); } }
/* Le Flon : une carte qui arrive ici par un déplacement gagne +2 */
function flonHook(i,t){ if(locIs(i,"flon")){ t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"Le Flon"}); }
  if(!t.neg&&eid(t)==="athlete_stade"&&(t.athl||0)<4){ t.athl=(t.athl||0)+2; t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"L'Athlète"}); }   /* L'Athlète du Stade : +2 par déplacement, +4 au plus */
  if(!t.neg&&eid(t)==="change") t.moon=true;
  /* Èṣù, Reine des Carrefours : la première fois que chaque autre carte se déplace à chaque tour, +2 si elle est à son camp, −1 si elle est adverse (plusieurs Èṣù ne cumulent pas) */
  if(t.esT!==S.turn){ const es=["p","e"].map(side=>({side,c:S.board[side].flat().find(x=>x!==t&&live(x)&&eid(x)==="eshu")})).find(x=>x.c);
    if(es){ const ts=["p","e"].find(side=>S.board[side].some(col=>col.includes(t))); t.esT=S.turn;
      if(ts===es.side){ t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"Èṣù"}); log(`Èṣù · +2 à ${nm(t)} (${who(ts)})`); sfx("buff"); }
      else if(ts){ const prev=SRC; SRC={s:es.side,cost:CARDS.eshu.cost}; const ok=weaken(ts,i,t,1); SRC=prev; if(ok){ (t.mods=t.mods||[]).push({v:-1,src:"Èṣù"}); log(`Èṣù · −1 à ${nm(t)} (${who(ts)})`); sfx("debuff"); } } } } }   /* Chang'e : après son premier déplacement, elle ne peut plus être détruite */
/* Sauvabelin : aucune carte ne peut être détruite dans ce lieu, quelle que soit la source */
const forest=li=>locIs(li,"sauvabelin");
function destroy(s,li,c){ if(forest(li)||shielded(s,li)||c.ward||fated(c)||deathless(c)||baldurSafe(s,c)) return false; S.board[s][li]=S.board[s][li].filter(x=>x!==c); S.destroyed++; entomb(s,li,c); if(s==="e") S.killE=(S.killE||0)+1; danteHook(li); return true; }
const nm=c=>CARDS[c.id].name;
/* Le Cirque : mêmes protections que contre un affaiblissement, plus Uzume et Baldur (sans effet perdu), et les captives */
const cirqueSafe=(s,li,c)=>shielded(s,li)||sunlit(s)||noWeak(c)||(!c.neg&&(eid(c)==="uzume"||eid(c)==="baldur"))||!!(c.captive&&captorLive(c.captive));
/* Dante : chaque carte détruite dans son lieu, des deux côtés, lui donne +1 */
function danteHook(li){ for(const side of ["p","e"]) for(const d of S.board[side][li]) if(live(d)&&eid(d)==="dante"){ d.pow+=1; (d.mods=d.mods||[]).push({v:1,src:"Dante"}); log(`Dante · +1 (${who(side)})`); } }
/* Médée : sa prochaine carte adverse jouée ici perd 2 (les deux suivantes avec Hécate) */
function medeeHook(s,li,c){ if(!S.board[s][li].includes(c)) return; const o=opp(s);
  for(const m of S.board[o][li]) if(live(m)&&eid(m)==="medee"&&(m.mdHit||0)<(onSide(o,"hecate")?2:1)){
    m.mdHit=(m.mdHit||0)+1; const prev=SRC; SRC={s:o,cost:CARDS.medee.cost};
    const ok=!untargetable(o,s,c)&&weaken(s,li,c,2); SRC=prev;
    if(ok){ (c.mods=c.mods||[]).push({v:-2,src:"Médée"}); log(`Médée · −2 à ${nm(c)} (${who(s)})`); sfx("debuff"); }
    break; } }
/* Le Veilleur du Pont Bessières : la première carte adverse jouée ici à chaque tour perd 1 */
function veilleurHook(s,li,c){ if(!S.board[s][li].includes(c)) return; const o=opp(s);
  for(const m of S.board[o][li]) if(live(m)&&eid(m)==="veilleur_pont"&&m.vgT!==S.turn){
    m.vgT=S.turn; const prev=SRC; SRC={s:o,cost:CARDS.veilleur_pont.cost};
    const ok=!untargetable(o,s,c)&&weaken(s,li,c,1); SRC=prev;
    if(ok){ (c.mods=c.mods||[]).push({v:-1,src:"Le Veilleur"}); log(`Le Veilleur du Pont · −1 à ${nm(c)} (${who(s)})`); sfx("debuff"); }
    break; } }
/* Cartes qui forment une Fusion avec Jordan (Domaine du Créateur) */
const JPARTNERS=new Set((()=>{ const out=[]; for(const u of ULS) if(u.req.some(r=>[].concat(r).some(x=>charOf(x)==="jordan"))) for(const r of u.req) for(const x of [].concat(r)) if(charOf(x)!=="jordan") out.push(x); return out; })());

function reveal(s,li,c){
  const prevSrc=SRC; SRC={s,cost:CARDS[c.id].cost};
  /* Hypnos : annule la Révélation de la prochaine carte adverse révélée ici (une carte qui en a une), puis son effet disparaît */
  const hy=/Révélation :/.test(CARDS[eid(c)].fx||"")?S.board[opp(s)][li].find(x=>live(x)&&eid(x)==="hypnos"&&!x.spent):null;
  try{ if(hy){ hy.spent=true; c.rev=true; c.fresh=true; c.arr=S.turn; log(`Hypnos endort la Révélation de ${nm(c)} (${who(opp(s))})`); sfx("void"); } else revealFx(s,li,c); } finally { SRC=prevSrc; }
  if(eid(c)!=="anahita") S.lastAny=eid(c);   /* Anahita copie la dernière carte révélée, des deux côtés */
  if(!isAph(c)) (S.lastRev=S.lastRev||{p:null,e:null})[s]=c;   /* Aphrodite rejoue la dernière Révélation du tour */
  /* La Source : les Révélations de tes autres cartes Helvara jouées dans son lieu se déclenchent deux fois (si elle est déjà en jeu, révélée et sans effets annulés) */
  if(CARDS[c.id].fac==="helvara"&&eid(c)!=="source"&&replayable(c)&&S.board[s][li].some(x=>x!==c&&eid(x)==="source"&&live(x))){
    log(`La Source · Révélation de ${nm(c)} rejouée (${who(s)})`); replayFx(s,li,c); }
}
/* Aphrodite (de base) et Aphrodite X Yarden rejouent des Révélations et ne comptent pas pour Nike ; les variantes (Étoile de Noël, Coupe de Minuit) sont des cartes comme les autres pour Nike (22 octobre, Jordan) */
const isAph=c=>eid(c)==="aphrodite"||eid(c)==="ulaph";
/* Rejouer la Révélation d'une carte déjà posée (Aphrodite) : ni Brigid, ni effets de lieu à la pose */
const replayable=x=>x.rev&&!x.neg&&!CARDS[x.id].token&&charOf(x.id)!=="aphrodite"&&eid(x)!=="ulaph";
function replayFx(s,li,x){ const prev=SRC; SRC={s,cost:CARDS[x.id].cost}; try{ revealFx(s,li,x,{replay:true}); } finally { SRC=prev; } }
function revealFx(s,li,c,opts={}){
  if(!opts.replay&&c.cp) delete c.cp;   /* Anahita : la copie ne dure que jusqu'à sa prochaine vraie Révélation */
  c.rev=true; if(!opts.replay){ c.fresh=true; c.arr=S.turn; } piles();
  const o=opp(s), d=CARDS[c.id];
  const foes=S.board[o][li].filter(x=>x.rev);
  const targets=foes.filter(x=>!untargetable(s,o,x));
  const mates=S.board[s][li].filter(x=>x!==c&&x.rev);
  const pw=(side,l,x)=>cardPow(side,l,x);
  const strongest=(arr,side,l)=>arr.slice().sort((a,b)=>pw(side,l,b)-pw(side,l,a))[0];
  const weakest=(arr,side,l)=>arr.slice().sort((a,b)=>pw(side,l,a)-pw(side,l,b))[0];
  /* égalités départagées au hasard (règle commune des cartes du 1er mars) */
  const minR=(arr,side,l)=>{ if(!arr.length) return null; const m=Math.min(...arr.map(x=>pw(side,l,x))); return gPick(arr.filter(x=>pw(side,l,x)===m)); };
  const maxR=(arr,side,l)=>{ if(!arr.length) return null; const m=Math.max(...arr.map(x=>pw(side,l,x))); return gPick(arr.filter(x=>pw(side,l,x)===m)); };
  let note="", snd="reveal";
  const buffSelf=n=>{ c.pow+=n; note=(note?note+", ":"")+`+${n}`; snd="buff"; };
  S.forge=S.forge||{p:0,e:0};
  if(S.forge[s]&&eid(c)!=="brigid"&&!opts.replay){ S.forge[s]=0; c.pow+=3; (c.mods=c.mods||[]).push({v:3,src:"Brigid"}); note="+3 (Brigid)"; snd="buff"; }
  switch(eid(c)){
    case "apophis_p": { const o2=opp(s); if(S.board[o2][li].length<capOf(o2,li)){ const k=mk("oeuf_maudit"); k.rev=true; k.fresh=true; S.board[o2][li].push(k); note="un Œuf maudit apparaît chez l'adversaire"; snd="void"; } break; }
    case "voix_flon": { let n=0; for(let i=0;i<3;i++){ if(i===li) continue; const t=minR(S.board[s][i].filter(x=>x.rev),s,i); if(t){ t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"La Voix du Flon"}); n++; } } if(n){ note=`+2 à ${n} carte${n>1?"s":""}`; snd="buff"; } break; }
    case "joueuse_palud": { draw(s); const hd=S.hand[s]; if(hd.length){ const m=Math.min(...hd.map(x=>CARDS[x.id].cost)), t=gPick(hd.filter(x=>CARDS[x.id].cost===m)); discard(s,t); note=`pioche 1 carte, défausse ${nm(t)}`; snd="buff"; } break; }
    case "strategue": { const t=minR(mates.filter(x=>!fated(x)),s,li); if(!t) break;
      const spots=[0,1,2].filter(i=>i!==li&&S.locs[i].rev&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)&&leader(i)!==s); if(!spots.length) break;
      const i=gPick(spots); S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][i].push(t); flonHook(i,t); t.pow+=2; (t.mods=t.mods||[]).push({v:2,src:"La Stratège"}); if(s==="p"&&qLive()) qProg("move2");
      note=`${nm(t)} part vers ${LOCS[S.locs[i].id].name}, +2`; snd="buff"; break; }
    case "kali": { let n=0; const a=minR(mates,s,li); if(a&&destroy(s,li,a)) n++;
      const b=minR(S.board[o][li].filter(x=>x.rev&&!untargetable(s,o,x)),o,li); if(b&&destroy(o,li,b)) n++;
      if(n){ c.pow+=2*n; (c.mods=c.mods||[]).push({v:2*n,src:"Kali"}); note=`détruit ${n} carte${n>1?"s":""}, +${2*n}`; snd="destroy"; } break; }
    case "meduse": { const t=maxR(targets,o,li); if(!t) break;
      if(weaken(o,li,t,2)){ (t.mods=t.mods||[]).push({v:-2,src:"Méduse"}); t.medCap=cardPow(o,li,t); if(S.turn<5) t.medUntil=S.turn+1; note=`−2 à ${nm(t)}, il ne peut plus gagner de puissance`; snd="debuff"; } break; }
    case "shamash": { const bon=x=>Math.max(0,x.pow-CARDS[x.id].pow+(x.malus||0)), cs=targets.filter(x=>bon(x)>0); if(!cs.length) break;   /* bonus positifs seuls : puissance − base + affaiblissements subis */
      const mx=Math.max(...cs.map(bon)), t=gPick(cs.filter(x=>bon(x)===mx)), b=bon(t);
      if(weaken(o,li,t,b,true)){ (t.mods=t.mods||[]).push({v:-b,src:"Shamash"}); note=`${nm(t)} perd ses bonus (−${b})`; snd="debuff"; } break; }
    case "cerridwen": { const hd=S.hand[s].filter(x=>!CARDS[x.id].token); if(!hd.length) break;
      const m=Math.min(...hd.map(x=>CARDS[x.id].cost)), out=gPick(hd.filter(x=>CARDS[x.id].cost===m)), cands=S.deck[s].filter(x=>!CARDS[x.id].token&&CARDS[x.id].cost===m+1); if(!cands.length) break;
      const inn=gPick(cands); S.deck[s]=S.deck[s].filter(x=>x!==inn); S.hand[s]=S.hand[s].filter(x=>x!==out); S.hand[s].push(inn); S.deck[s].splice(Math.floor(rnd()*(S.deck[s].length+1)),0,out);
      note=`échange ${nm(out)} contre ${nm(inn)}`; snd="buff"; break; }
    case "voyante": { const dk=S.deck[s]; if(!dk.length) break; const top=dk.splice(0,Math.min(3,dk.length)), nxt=S.turn+1, sc=x=>{ const k=CARDS[x.id].cost; return k<=nxt?100+k:-k; };
      let best=top[0]; for(const x of top) if(sc(x)>sc(best)) best=x;
      dk.unshift(best); dk.push(...gShuffle(top.filter(x=>x!==best))); note="regarde 3 cartes, garde la meilleure sur le dessus"; snd="buff"; break; }
    case "demeter": { if(S.turn<6){ S.harv=S.harv||{p:0,e:0}; S.harv[s]++; note="la main grandira au prochain tour"; snd="buff"; } break; }
    case "nuwa": { const here=S.locs[li].id; let pool=locPool().filter(id=>id!==here&&!S.locs.some(l=>l.id===id)); if(!pool.length) pool=locPool().filter(id=>id!==here); if(!pool.length) break;
      const id=gPick(pool); S.locs[li]=Object.assign({},S.locs[li],{id}); note=`${LOCS[here].name} devient ${LOCS[id].name}`; snd="void"; break; }
    case "jordan_n": { const ok=new Set(); for(const u of ULS) if(u.req.some(r=>Array.isArray(r)?r.includes("jordan_n"):r==="jordan_n")) for(const r of u.req) for(const id of (Array.isArray(r)?r:[r])) if(charOf(id)!=="jordan") ok.add(id); const y=S.deck[s].find(x=>ok.has(x.id)); if(y&&S.hand[s].length<7){ S.deck[s]=S.deck[s].filter(x=>x!==y); S.hand[s].push(y); note=`ajoute ${nm(y)} à sa main`; snd="buff"; } break; }
    case "joanna": { let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&S.board[s][i].some(x=>x.rev)&&S.board[s][i].length<capOf(s,i)){ const t=mk("lanterne"); t.rev=true; t.fresh=true; S.board[s][i].push(t); n++; } if(n) note=`${n} Lanterne${n>1?"s":""}`; break; }
    case "ares_h": { let n=0; for(const x of targets) if(weaken(o,li,x,2)) n++; if(n){ c.pow+=n; note=`−2 à ${n}, +${n}`; snd="debuff"; } break; }
    case "nergal_h": { let n=0; for(const side of [s,o]) for(let i=0;i<3;i++) for(const x of S.board[side][i].slice()) if(x!==c&&x.rev&&pw(side,i,x)<=1&&!(side===o&&untargetable(s,o,x))&&destroy(side,i,x)) n++; if(n){ c.pow+=2*n; note=`la peste emporte ${n} carte${n>1?"s":""}, +${2*n}`; snd="destroy"; } break; }
    case "archiviste": { draw(s); draw(s); draw(o); note="pioche 2 cartes, l'adversaire en pioche 1"; snd="buff"; break; }
    case "ularchiviste": { draw(s); note="pioche 1 carte"; snd="buff"; break; }
    case "indra": { const n=Math.min(5,S.hand[s].length); if(n) buffSelf(n); break; }
    case "dagda": { const n=S.hand[s].length; draw(s); if(S.hand[s].length>n){ const t=S.hand[s][S.hand[s].length-1]; t.cheap=(t.cheap||0)+1; note="pioche 1 carte, elle coûte 1 de moins"; snd="buff"; } break; }
    case "patronne": { S.costNext=S.costNext||{p:0,e:0}; S.costNext[s]-=1; note="au tour suivant, tes cartes coûtent 1 de moins"; snd="buff"; break; }
    case "typhon": { S.costNext=S.costNext||{p:0,e:0}; S.costNext.p+=1; S.costNext.e+=1; note="au tour suivant, toutes les cartes coûtent 1 de plus"; snd="debuff"; break; }
    case "quetzalcoatl": { let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&!S.board[s][i].some(x=>eid(x)==="plume")&&S.board[s][i].length<capOf(s,i)){ const t=mk("plume"); t.rev=true; t.fresh=true; S.board[s][i].push(t); n++; } if(n) note=`${n} Plume${n>1?"s":""}`; break; }
    case "anansi": { /* échange la puissance de la plus forte adverse ici et de ta plus faible ici (Anansi compris) si l'écart est de 4 ou moins */
      const F=strongest(targets,o,li), W=weakest([c,...mates],s,li); if(!F||!W) break;
      const pf=pw(o,li,F), pk=pw(s,li,W), gap=pf-pk;
      if(gap>0&&gap<=4&&weaken(o,li,F,gap)){ W.pow+=gap; (F.mods=F.mods||[]).push({v:-gap,src:"Anansi"}); (W.mods=W.mods||[]).push({v:gap,src:"Anansi"}); note=`échange ${nm(F)} et ${nm(W)} (${pf} ↔ ${pk})`; snd="void"; } break; }
    case "eros": { /* flèche d'or : +2 à ton autre carte la plus faible ici ; flèche de plomb : −2 à la carte adverse la plus faible dans un autre lieu */
      let a="", b="";
      const w=weakest(mates,s,li); if(w){ w.pow+=2; (w.mods=w.mods||[]).push({v:2,src:"Éros"}); a=`flèche d'or : +2 à ${nm(w)}`; }
      const cands=[]; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)) cands.push([i,x]);
      if(cands.length){ const mn=Math.min(...cands.map(([i,x])=>pw(o,i,x))), [ti,t]=gPick(cands.filter(([i,x])=>pw(o,i,x)===mn)); if(weaken(o,ti,t,2)){ (t.mods=t.mods||[]).push({v:-2,src:"Éros"}); b=`flèche de plomb : −2 à ${nm(t)}`; } }
      note=a&&b?`${a} ; ${b}`:a||b; if(note) snd="debuff"; break; }
    case "lugh": { const at=Math.floor(rnd()*(S.deck[s].length+1)); S.deck[s].splice(at,0,mk("lance_lugh")); note="mélange la Lance de Lugh dans ton deck"; snd="buff"; break; }
    case "ereshkigal_n": { /* Dame de la Longue Nuit : la carte adverse la plus forte ici perd la moitié de sa puissance (arrondie au-dessus) */
      const t=strongest(targets,o,li); if(!t) break;
      const n=Math.ceil(Math.max(0,pw(o,li,t))/2); if(n>0&&weaken(o,li,t,n)){ (t.mods=t.mods||[]).push({v:-n,src:"Ereshkigal"}); note=`−${n} à ${nm(t)}`; snd="debuff"; } break; }
    case "aphrodite_r": { /* Coupe de Minuit : +2 d'énergie au tour suivant (10 au plus ce tour-là, comme Prométhée), chaque joueur pioche 1 carte ; rien au tour 6 */
      if(S.turn>=6) break;
      const k=Math.min(2,Math.max(0,10-(S.turn+1)-S.bonus[s])); if(k>0) S.bonus[s]+=k;
      draw(s); draw(o); note=(k>0?`+${k} énergie au prochain tour, `:"")+"chacun pioche 1 carte"; snd="buff"; break; }
    case "ares_n": { /* Duelliste du Dernier Soir : défie la carte adverse la plus forte ici, la moins puissante des deux est détruite (égalité : aucune) */
      const t=strongest(targets,o,li); if(!t) break;
      const a=pw(s,li,c), b=pw(o,li,t);
      if(a>b){ if(destroy(o,li,t)){ note=`défie ${nm(t)} : ${nm(t)} tombe`; snd="destroy"; } }
      else if(b>a){ if(destroy(s,li,c)){ note=`défie ${nm(t)} : ${nm(c)} tombe`; snd="destroy"; } }
      else note=`défie ${nm(t)} : égalité`;
      break; }
    case "aphrodite_n": { let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)){ const t=mk("refaph"); t.pow=3; t.rev=true; t.fresh=true; S.board[s][i].push(t); n++; } if(n) note=`${n} Reflet${n>1?"s":""} d'Aphrodite (3)`; break; }
    case "sekhmet_n": { let n=0; for(const x of targets.filter(x=>pw(o,li,x)<=2)) if(destroy(o,li,x)) n++; if(n){ note=`détruit ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "calypso_n": { const t=strongest(targets,o,li); if(t&&!shielded(o,li)&&!sunlit(o)){ t.captive=c.uid; note=`${nm(t)} est captive`; snd="lock"; } if(foes.length) buffSelf(foes.length); break; }
    case "apsu_n": { foes.forEach(x=>x.neg=true); S.disc[s]=2; note=(foes.length?`${foes.length} carte${foes.length>1?"s":""} sans effet, `:"")+"prochaine carte −2"; snd="void"; if(onSide(s,"yarden")) buffSelf(4); break; }
    case "mendiant": { const t=gPick(S.hand[s]); if(t){ discard(s,t); note=`défausse ${nm(t)}`; } break; }
    case "voleuse": { const t=gPick(S.hand[o]); if(t){ discard(o,t); note=`${who(o)} défausse ${nm(t)}`; snd="void"; } break; }
    case "sansvoix": if(S.turn<6){ (S.mute=S.mute||[]).push({s:o,li,t:S.turn+1}); note="silence au prochain tour"; snd="lock"; } break;
    case "chasseur": { const t=strongest(foes.filter(x=>!fated(x)),o,li); if(t&&S.board[s][li].length<capOf(s,li)){ const e=mk(t.id); e.rev=true; e.fresh=true; e.neg=true; e.echo=true; e.pow=Math.max(0,pw(o,li,t))-(locIs(li,"tour")&&CARDS[t.id].pow>=5&&!CARDS[t.id].token?2:0); S.board[s][li].push(e); note=`Écho ${/^[aeiouyéèêâîh]/i.test(nm(t))?"d’":"de "}${nm(t)} (${pw(o,li,t)})`; snd="void"; } break; }
    case "set": { let n=0, w=0; for(const t of gShuffle(targets.filter(x=>!fated(x))).slice(0,2)){ const sp=[0,1,2].filter(i=>i!==li&&S.board[o][i].length<capOf(o,i)); if(!sp.length) continue; const i=gPick(sp); S.board[o][li]=S.board[o][li].filter(x=>x!==t); S.board[o][i].push(t); flonHook(i,t); if(s==="p"&&qLive()) qProg("move2"); n++;
        if(weaken(o,i,t,1)){ (t.mods=t.mods||[]).push({v:-1,src:"Set"}); w++; } }
      if(n){ note=`disperse ${n} carte${n>1?"s":""}`+(w?`, −1 à ${w}`:""); snd="debuff"; } break; }
    case "maree": { let n=0; for(const t of targets.filter(x=>CARDS[x.id].cost<=2)) if(destroy(o,li,t)) n++; if(n){ note=`détruit ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "fenrir": { c.fenT=S.turn; if(S.lostT&&S.lostT[s]===S.turn){ c.fate=true; buffSelf(2); note="Fatalité, +2"; } break; }
    case "nephtys": { const cs=mates.filter(x=>!fated(x)&&!deathless(x)); if(!cs.length) break; const mx=Math.max(...cs.map(x=>pw(s,li,x))), t=gPick(cs.filter(x=>pw(s,li,x)===mx));
      if(destroy(s,li,t)){ buffSelf(4); note=`détruit ${nm(t)}, +4`; snd="destroy"; } break; }
    case "frigg": { if(S.locs[li].locked||S.board[o][li].length>=capOf(o,li)) break; const pool=[]; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&!fated(x)&&!charmOf(x)) pool.push([i,x,pw(o,i,x)]);
      if(!pool.length) break; const mx=Math.max(...pool.map(q=>q[2])), [i,t]=gPick(pool.filter(q=>q[2]===mx));
      S.board[o][i]=S.board[o][i].filter(x=>x!==t); S.board[o][li].push(t); t.fresh=true; flonHook(li,t); note=`attire ${nm(t)}`; snd="void"; break; }
    case "xiwangmu": { if(S.hand[s].length<7){ S.hand[s].push(mk("peche_immortalite")); note="Pêche d'immortalité ajoutée à la main"; snd="buff"; } else note="main pleine : Pêche perdue"; break; }
    case "isis": { piles(); if(S.hand[s].length>=7||!S.graveyard[s].length) break; const id=S.graveyard[s].pop(), t=mk(id); t.cheap=2; S.hand[s].push(t); note=`reprend ${CARDS[id].name} en main, 2 de moins`; snd="buff"; break; }
    case "rati": { piles(); if(!S.graveyard[s].length) break; const id=S.graveyard[s][S.graveyard[s].length-1], r=resurrect(s,id,li,"grave"); if(r){ note=`ressuscite ${nm(r)}`; snd="void"; if(id==="kama") buffSelf(2); } break; }
    case "anahita": { const id=S.lastAny; if(!id||CARDS[id].r==="U"||CARDS[id].token||id==="anahita") break; c.cp=id; note=`copie ${CARDS[id].name}`; snd="void"; revealFx(s,li,c,{replay:true}); break; }
    case "brigid": S.forge[s]=1; note="la forge s'allume"; snd="buff"; break;
    case "lipdentelle": { const t=S.hand[s].slice().sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; if(t){ discard(s,t); const v=Math.max(0,t.pow); c.pow+=v; note=`défausse ${nm(t)}, +${v}`; snd="buff"; } break; }
    case "andraste": if(foes.length) buffSelf(2*foes.length); break;
    case "aphrodite": { const L=S.lastRev&&S.lastRev[s]; if(!L||L===c||!replayable(L)) break; const at=[0,1,2].find(i=>S.board[s][i].includes(L)); if(at==null) break;
      replayFx(s,at,L); note=`rejoue ${nm(L)}`; snd="void"; break; }
    case "calypso": { const t=strongest(targets,o,li); if(t&&!shielded(o,li)&&!sunlit(o)){ t.captive=c.uid; note=`${nm(t)} est captive`; snd="lock"; } break; }
    case "tefnut": { mates.forEach(x=>x.pow+=1); if(mates.length){ note=`+1 à ${mates.length} carte${mates.length>1?"s":""}`; snd="buff"; } break; }
    case "susanoo": { const t=weakest(mates.filter(x=>!fated(x)),s,li); const spots=[0,1,2].filter(i=>i!==li&&S.locs[i].rev&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)); if(t&&spots.length){ const i=gPick(spots); S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][i].push(t); flonHook(i,t); if(s==="p"&&qLive()) qProg("move2"); t.fresh=true; t.pow+=3; (t.mods=t.mods||[]).push({v:3,src:"Susanoo"}); note=`${nm(t)} part vers ${LOCS[S.locs[i].id].name}, +3`; snd="buff"; } if(onSide(s,"amaterasu")) buffSelf(2); break; }
    case "bourreau": { S.cond=S.cond||{p:[0,0,0],e:[0,0,0]}; if(S.cond[o][li]<4){ S.cond[o][li]++; note="une case adverse est condamnée"; snd="lock"; } break; }
    case "anubis": { if(total(o,li)>total(s,li)){ const t=strongest(targets.filter(x=>!fated(x)),o,li); if(t&&destroy(o,li,t)){ note=`le cœur est trop lourd : détruit ${nm(t)}`; snd="destroy"; } } else buffSelf(4); break; }
    case "balor": { let n=0; for(const t of gShuffle(targets.slice()).slice(0,2)) if(weaken(o,li,t,3)) n++; if(n){ note=`−3 à ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "ulaph": { const list=S.board[s][li].filter(x=>x!==c&&replayable(x)); let n=0; for(const x of list){ if(!S.board[s][li].includes(x)) continue; replayFx(s,li,x); n++; } if(n){ note=`rejoue ${n} carte${n>1?"s":""}`; snd="void"; } break; }
    case "ulnem": { let n=0; const a=strongest(targets.filter(x=>!fated(x)),o,li); if(a&&destroy(o,li,a)) n++; const b=strongest(mates,s,li); if(b&&destroy(s,li,b)) n++; S.board[s][li].filter(x=>x!==c&&x.rev).forEach(x=>x.pow+=2); note=`justice : ${n} carte${n>1?"s":""} détruite${n>1?"s":""}`; snd="destroy"; break; }
    case "coursier": draw(s); note="pioche 1 carte"; break;
    case "felix": S.disc[s]=1; note="prochaine carte −1"; break;
    case "maat": { const t=weakest(mates.filter(x=>!fated(x)),s,li); if(t){ t.pow+=1; (t.mods=t.mods||[]).push({v:1,src:"Mā‘at"}); note=`+1 à ${nm(t)}`; snd="buff"; } break; }
    case "apollon": if(S.hand[s].length<7){ S.hand[s].push(mk("fleche")); note="Flèche d'Apollon ajoutée à la main"; } else note="main pleine : Flèche perdue"; break;
    case "hephaistos": if(S.hand[s].length<7){ S.hand[s].push(mk("arme")); note="Arme d'Héphaïstos forgée dans la main"; } else note="main pleine : Arme perdue"; break;
    case "vesta": (S.vesta=S.vesta||{p:0,e:0})[s]=1; note="prochaine carte Jugement −1"; break;
    case "zeus": { /* la foudre : toutes les cartes de coût imprimé 1 ou moins, des deux côtés, dans les 3 lieux (protections normales) ; tes cartes Jugement reviennent en main, à leur puissance de base */
      let n=0, back=0; piles();
      for(const side of [s,o]) for(let i=0;i<3;i++) for(const x of S.board[side][i].slice()){
        if(x===c||!x.rev||CARDS[x.id].cost>1||(side===o&&untargetable(s,o,x))) continue;
        if(!destroy(side,i,x)) continue; n++;
        if(side===s&&CARDS[x.id].fac==="jugement"&&S.hand[s].length<7){ if(real(x)){ const g=S.graveyard[s], k=g.lastIndexOf(x.id); if(k>=0) g.splice(k,1); } S.hand[s].push(mk(x.id)); back++; } }
      if(n){ note=`la foudre détruit ${n} carte${n>1?"s":""}`+(back?`, ${back} revien${back>1?"nent":"t"} en main`:""); snd="destroy"; } break; }
    case "remi": if(S.destroyed+(S.discarded||0)) buffSelf(2*(S.destroyed+(S.discarded||0))); break;
    case "celeste": if(total(s,li)-cardPow(s,li,c)<=total(o,li)) buffSelf(3); break;
    case "vasseur": c.pay=S.turn+2; note=S.turn+2<=6?`paiera au tour ${S.turn+2}`:"ne sera jamais payé"; break;
    case "esquille": { const t=weakest(targets.filter(x=>!fated(x)),o,li); if(t&&destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } else if(t) note=`${nm(t)} est protégée`; break; }
    case "troll": { const t=weakest(mates,s,li); if(t&&destroy(s,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } break; }
    case "vritra": S.locs[li].locked=true; note="le lieu est verrouillé"; snd="lock"; break;
    case "yarden": if([0,1,2].every(i=>S.board[s][i].length>0)) buffSelf(4); break;
    case "nyx": { const t=strongest(foes.filter(x=>!fated(x)&&!deathless(x)),o,li); if(t&&!forest(li)){ S.board[o][li]=S.board[o][li].filter(x=>x!==t); S.destroyed++; entomb(o,li,t); if(o==="e") S.killE=(S.killE||0)+1; danteHook(li); note=`détruit ${nm(t)}`; snd="void"; } break; }
    case "pandore": { const k=(S.unspent&&S.unspent[s])||0; if(k){ S.unspent[s]=0; buffSelf(2*k); note=`dépense ${k} énergie, +${2*k}`; } break; }
    case "athena": { const top=S.deck[s].slice(0,3); if(top.length&&S.hand[s].length<7){ const t=top.sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; S.deck[s].splice(S.deck[s].indexOf(t),1); S.hand[s].push(t); note=s==="p"?`prend ${nm(t)} en main`:"prend une carte en main"; } break; }
    case "bia": { const res=(S.bonus[o]||0)>0||((S.unspent&&S.unspent[o])>0&&S.board[o].some(col=>col.some(x=>live(x)&&eid(x)==="promethee")));
      if(res){ S.bonus[o]=0; if(S.biaBlock) S.biaBlock[o]=true; note="l'adversaire perd son énergie conservée"; snd="debuff"; }
      else { const t=strongest(targets,o,li); if(t&&weaken(o,li,t,1)){ (t.mods=t.mods||[]).push({v:-1,src:"Bia"}); note=`−1 à ${nm(t)}`; snd="debuff"; } } break; }
    case "ananke": case "ananke_r": case "ananke_v": note="Fatalité : ni détruite ni déplacée"; snd="legend"; break;   /* Apsu ne l'atteint que par sa propre Révélation, s'il est posé après elle (Jordan : « Révélation c'est Révélation ») */
    case "nike": case "nike_v": { const pl=(S.turnPlays&&S.turnPlays[s])||[], ix=pl.indexOf(c), k=ix<0?0:pl.slice(0,ix).filter(x=>!isAph(x)).length; if(k) buffSelf(2*k); break; }
    case "apsu": { foes.forEach(x=>x.neg=true); if(foes.length) note=`${foes.length} carte${foes.length>1?"s":""} sans effet`; if(onSide(s,"yarden")) buffSelf(4); snd=foes.length?"void":snd; break; }
    case "lilith": { const t=strongest(targets.filter(x=>pw(o,li,x)<=6),o,li); if(t){ S.board[o][li]=S.board[o][li].filter(x=>x!==t);
      if(S.board[s][li].length<capOf(s,li)){ S.board[s][li].push(t); t.fresh=true; note=`séduit ${nm(t)}`; } else if(forest(li)||deathless(t)){ S.board[o][li].push(t); } else { S.destroyed++; entomb(o,li,t); if(o==="e") S.killE=(S.killE||0)+1; danteHook(li); note=`${nm(t)} est détruite`; } snd="void"; } break; }
    case "psyche": { const t=weakest(mates,s,li)||c; t.pow+=2; note=`+2 à ${nm(t)}`; snd="buff"; break; }
    case "tlazol": { let n=0; for(const x of mates) if(x.pow<CARDS[x.id].pow){ x.pow=CARDS[x.id].pow; x.malus=0; n++; } if(n){ c.pow+=2*n; note=`purifie ${n} carte${n>1?"s":""}, +${2*n}`; snd="buff"; } break; }
    case "eris": { const t=strongest(targets.filter(x=>!fated(x)),o,li); const spots=[0,1,2].filter(i=>i!==li&&S.board[o][i].length<capOf(o,i)); if(t&&spots.length){ const i=gPick(spots); S.board[o][li]=S.board[o][li].filter(x=>x!==t); S.board[o][i].push(t); flonHook(i,t); if(s==="p"&&qLive()) qProg("move2"); note=`${nm(t)} part vers ${LOCS[S.locs[i].id].name}`; snd="debuff"; } break; }
    case "durga": { const t=strongest(targets.filter(x=>!fated(x)),o,li); if(t&&pw(o,li,t)>=7){ if(destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } } else buffSelf(3); break; }
    case "hecate": draw(s); draw(s); note="pioche 2 cartes"; break;
    case "hermes": { /* ta plus forte carte ici part vers un lieu révélé où elle te fait mener (de préférence un lieu que tu ne menais pas) */
      const t=strongest(mates.filter(x=>!fated(x)),s,li); if(!t) break; let best=null;
      for(const i of [0,1,2]){ if(i===li||!S.locs[i].rev||S.board[s][i].length>=capOf(s,i)) continue;
        const was=leader(i)===s; S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][i].push(t);
        const wins=leader(i)===s, gap=total(s,i)-total(o,i);
        S.board[s][i]=S.board[s][i].filter(x=>x!==t); S.board[s][li].push(t);
        if(wins&&(!best||(!was&&best.was)||(was===best.was&&gap<best.gap))) best={i,was,gap}; }
      if(best){ S.board[s][li]=S.board[s][li].filter(x=>x!==t); S.board[s][best.i].push(t); flonHook(best.i,t); if(s==="p"&&qLive()) qProg("move2"); note=`${nm(t)} part vers ${LOCS[S.locs[best.i].id].name}`; snd="buff"; } break; }
    case "konohana": if(S.turn<5){ c.bloom=S.turn+1; note="en fleur jusqu'au prochain tour"; } else note="en fleur jusqu'au décompte final"; break;   /* tour 5 ou 6 : la floraison ne passe qu'après le décompte, donc jamais (règle d'expiration du 26 octobre) */
    case "mohini": { const t=strongest(targets,o,li); if(t&&!t.neg){ t.neg=true; note=`${nm(t)} perd ses effets`; snd="void"; } break; }
    case "melinoe": { const t=gPick(S.hand[s]); if(t){ discard(s,t); note=`défausse ${nm(t)}`; buffSelf(3); } break; }
    case "comptable": if(mates.length) buffSelf(mates.length); break;
    case "relieur": { const t=weakest(mates.filter(x=>x.pow<CARDS[x.id].pow),s,li); if(t){ const v=CARDS[t.id].pow-t.pow; t.pow=CARDS[t.id].pow; t.malus=0; (t.mods=t.mods||[]).push({v,src:"Le Relieur"}); note=`+${v} à ${nm(t)}`; snd="buff"; } break; }
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
    case "hel": { const hd=S.hand[s].slice(); hd.forEach(x=>discard(s,x));   /* sa main est défaussée d'abord : ces cartes peuvent revenir */
      const ids=S.discardPile[s].slice().sort((a,b)=>CARDS[b].pow-CARDS[a].pow||CARDS[b].cost-CARDS[a].cost); let n=0; for(const id of ids){ if(n>=2) break; if(resurrect(s,id,li,"discard")) n++; else break; }
      if(hd.length||n){ note=(hd.length?`défausse ${hd.length} carte${hd.length>1?"s":""}`:"")+(hd.length&&n?", ":"")+(n?`ressuscite ${n} carte${n>1?"s":""}`:""); snd="void"; } break; }
    case "ulhel": { const all=S.discardPile[s].map(id=>[id,"discard"]).concat(S.graveyard[s].map(id=>[id,"grave"])).sort((a,b)=>CARDS[b[0]].pow-CARDS[a[0]].pow||CARDS[b[0]].cost-CARDS[a[0]].cost);
      if(all.length){ const r=resurrect(s,all[0][0],li,"discard"===all[0][1]?"discard":"grave",{ward:true,withReveal:true});
        if(r){ note=`ressuscite ${nm(r)}, intouchable`; if(charOf(r.id)==="baldur"){ r.pow+=5; (r.mods=r.mods||[]).push({v:5,src:"Hel X Baldur"}); note+=", +5"; } snd="void"; } } break; }
    case "hel_r": { const ids=S.discardPile[s].slice().sort((a,b)=>CARDS[b].cost-CARDS[a].cost); if(ids.length&&S.board[s][li].length<capOf(s,li)){ const r=resurrect(s,ids[0],li,"discard",{withReveal:true}); if(r){ note=`ressuscite ${nm(r)}`; snd="void"; } } break; }
    case "loviatar": { const id=S.discardPile[s][S.discardPile[s].length-1]; if(id){ const r=resurrect(s,id,li,"discard",{sick:Math.max(0,Math.min(2,6-S.turn))}); if(r){ note=`${nm(r)} revient malade`; snd="void"; } } else buffSelf(3); break; }
    case "hades": { const ids=S.graveyard[s].slice().sort((a,b)=>CARDS[b].pow-CARDS[a].pow); if(ids.length){ const r=resurrect(s,ids[0],li,"grave"); if(r){ note=`ressuscite ${nm(r)}`; snd="void"; } } else buffSelf(2); break; }
    case "dionysos": { const lost=[]; for(const side of [s,o]){ draw(side); const t=gPick(S.hand[side]); if(t){ discard(side,t); lost.push(nm(t)); } } note=lost.length?`l'ivresse fait défausser ${lost.join(" et ")}`:"pioche 1"; snd="void"; break; }
    case "poseidon": { let n=0; for(const t of targets.filter(x=>CARDS[x.id].cost<=3&&!fated(x))){ S.board[o][li]=S.board[o][li].filter(x=>x!==t); if(!real(t)) continue; n++;
        if(S.hand[o].length<7) S.hand[o].push(mk(t.id)); else { S.discarded=(S.discarded||0)+1; S.discardPile[o].push(t.id); } }
      if(n){ note=`le reflux emporte ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "circe": case "ulcirce": { let n=0; if(!shielded(o,li)) for(const t of targets) if(eid(c)==="ulcirce"||pw(o,li,t)<=3){ t.orig=t.id; t.id="pourceau"; t.pow=1; t.malus=0; t.neg=true; t.mods=[]; n++; }
      if(n){ note=`${n} Pourceau${n>1?"x":""}`; snd="void"; } break; }
    case "circe_n": { /* attire la plus forte d'un autre lieu (s'il y a de la place, comme Frigg), puis les cartes adverses ici plus faibles que Circé (l'attirée comprise) deviennent des Pourceaux */
      let pulled=null; if(!S.locs[li].locked&&S.board[o][li].length<capOf(o,li)){ const pool=[]; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&!fated(x)&&!charmOf(x)) pool.push([i,x,pw(o,i,x)]);
        if(pool.length){ const mx=Math.max(...pool.map(q=>q[2])), [i,t]=gPick(pool.filter(q=>q[2]===mx)); S.board[o][i]=S.board[o][i].filter(x=>x!==t); S.board[o][li].push(t); t.fresh=true; flonHook(li,t); pulled=t; } }
      const lim=pw(s,li,c); let n=0;
      if(!shielded(o,li)) for(const t of S.board[o][li]) if(t.rev&&!untargetable(s,o,t)&&pw(o,li,t)<lim){ t.orig=t.id; t.id="pourceau"; t.pow=1; t.malus=0; t.neg=true; t.mods=[]; n++; }
      if(pulled||n){ note=(pulled?`attire ${CARDS[pulled.orig||pulled.id].name}`:"")+(pulled&&n?", ":"")+(n?`${n} Pourceau${n>1?"x":""}`:""); snd="void"; } break; }
    case "qetesh": { const t=strongest(targets.filter(x=>pw(o,li,x)<=4&&!charmOf(x)),o,li); if(t){ t.charm=s; delete t.charmBy; note=`charme ${nm(t)}`; snd="void"; } break; }
    case "oshun": { let n=0; for(let i=0;i<3;i++) for(const x of S.board[s][i]) if(x!==c&&x.rev){ x.pow+=1; n++; } if(n){ note=`+1 à ${n} carte${n>1?"s":""}`; snd="buff"; } break; }
    case "scathach": { const sp=[0,1,2].filter(i=>i!==li&&!S.locs[i].locked&&S.board[o][i].length<capOf(o,i)); if(sp.length){ const i=gPick(sp); const m=mk("ombre"); m.rev=true; m.fresh=true; m.neg=true; S.board[o][i].push(m); note=`Ombre → ${LOCS[S.locs[i].id].name}`; snd="debuff"; } break; }
    case "uloshun": { const t=strongest(targets.filter(x=>!fated(x)),o,li); if(!t) break; const v=Math.ceil(Math.max(0,pw(o,li,t))/2);
      if(destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy";
        let w=null,wi=0; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[s][i]) if(x.rev&&(!w||pw(s,i,x)<pw(s,wi,w))){ w=x; wi=i; }
        if(w&&v){ w.pow+=v; (w.mods=w.mods||[]).push({v,src:"Nyx X Oshun"}); note+=`, +${v} à ${nm(w)}`; } } break; }
    case "biblio": if(S.hand[s].length<S.hand[o].length){ draw(s); note="pioche 1 carte"; } break;
    case "ereshkigal": { const vs=forest(li)?[]:foes.filter(x=>!fated(x)&&!deathless(x)&&pw(o,li,x)<=3); if(vs.length){ S.board[o][li]=S.board[o][li].filter(x=>!vs.includes(x)); S.destroyed+=vs.length; vs.forEach(x=>{ entomb(o,li,x); danteHook(li); }); if(o==="e") S.killE=(S.killE||0)+vs.length; note=`détruit ${vs.length} carte${vs.length>1?"s":""}`; snd="destroy"; } break; }
    case "pele": { let n=0; for(const side of [s,o]) for(const x of S.board[side][li]) if(x!==c&&x.rev&&weaken(side,li,x,2)) n++; if(n){ note=`−2 à ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "pele_r": { let n=0; for(let i=0;i<3;i++){ const t=strongest(S.board[o][i].filter(x=>x.rev&&!untargetable(s,o,x)),o,i); if(t&&weaken(o,i,t,2)) n++; } if(n){ note=`−2 à ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "ulpele_r": { let n=0; for(let i=0;i<3;i++) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&weaken(o,i,x,1)) n++; if(n){ note=`−1 à ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "qetesh_r": c.midnight=S.turn+1; note="minuit : charmera la carte la plus forte au tour suivant"; snd="void"; break;
    case "ulqetjor_r": { const t=strongest(targets.filter(x=>pw(o,li,x)<=5&&!charmOf(x)),o,li); if(t){ t.charm=s; delete t.charmBy; note=`charme ${nm(t)}`; snd="void"; } break; }
    case "echidna": { const ts=S.hand[s].filter(x=>CARDS[x.id].cost<=1); ts.forEach(x=>discard(s,x)); if(ts.length){ c.pow+=2*ts.length; (c.mods=c.mods||[]).push({v:2*ts.length,src:"Echidna"}); note=`défausse ${ts.map(nm).join(" et ")}, +${2*ts.length}`; snd="void"; } break; }
    case "cronos": { /* dévore les deux autres lieux : toutes les cartes, des deux côtés, révélées ou non (protections normales : Fatalité, Eir, Calypso X Jordan, Sauvabelin, Baldur…) ; Styx d'un lieu est détruite en dernier pour que ses cartes Jugement adverses reviennent encore */
      let n=0; for(let i=0;i<3;i++){ if(i===li) continue; for(const side of [o,s]){ const cs=S.board[side][i].slice().sort((a,b)=>(eid(a)==="styx")-(eid(b)==="styx")); for(const x of cs) if(destroy(side,i,x)) n++; } }
      if(n){ note=`dévore ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "izanami": { const low=S.hand[s].length?Math.min(...S.hand[s].map(x=>CARDS[x.id].pow)):null; const t=low==null?null:gPick(S.hand[s].filter(x=>CARDS[x.id].pow===low)); if(t){ discard(s,t); note=`défausse ${nm(t)}`; snd="void"; } break; }
    case "loki": { const lost=[]; for(const side of [s,o]){ const hi=S.hand[side].length?Math.max(...S.hand[side].map(x=>CARDS[x.id].cost)):null; const t=hi==null?null:gPick(S.hand[side].filter(x=>CARDS[x.id].cost===hi)); if(t){ discard(side,t); lost.push(nm(t)); } } if(lost.length){ note=`chacun défausse sa plus chère : ${lost.join(" et ")}`; snd="void"; } break; }
    case "ares": { let n=0; for(const x of targets) if(weaken(o,li,x,1)) n++; if(n){ c.pow+=n; note=`−1 à ${n}, +${n}`; snd="debuff"; } break; }
    case "nergal": { let n=0; for(let i=0;i<3;i++) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&weaken(o,i,x,1)) n++; if(n){ note=`−1 à ${n} carte${n>1?"s":""}`; snd="debuff"; } break; }
    case "rusalka": { const t=weakest(targets.filter(x=>!fated(x)),o,li); if(t&&pw(o,li,t)<=2&&destroy(o,li,t)){ note=`détruit ${nm(t)}`; snd="destroy"; } break; }
    case "mere": { let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&S.board[s][i].length<capOf(s,i)){ const t=mk("cendreux"); t.rev=true; t.fresh=true; S.board[s][i].push(t); n++; } if(n) note=`${n} Cendreux`; break; }
    case "nuee": { const t=strongest(mates,s,li); if(t){ const v=pw(s,li,t); if(v>c.pow){ c.pow=v; note=`reflète ${v}`; snd="buff"; } } break; }
    case "charognard": if(S.destroyed+(S.discarded||0)>0) buffSelf(3); break;
    case "ficelle": { let n=0; for(const x of mates) if(destroy(s,li,x)) n++; if(n){ c.pow+=3*n; note=`détruit ${n} carte${n>1?"s":""}, +${3*n}`; snd="destroy"; } break; }
    case "ecorche": { const t=gPick(targets); if(t&&weaken(o,li,t,2)){ note=`−2 à ${nm(t)}`; snd="debuff"; } break; }
    case "ulya": { const n=S.hand[s].length; if(n) buffSelf(n); break; }
    case "jordan": { const y=S.deck[s].find(x=>eid(x)==="yarden"); if(y&&S.hand[s].length<7){ S.deck[s]=S.deck[s].filter(x=>x!==y); S.hand[s].push(y); note="ajoute Yarden Weiss à sa main"; snd="buff"; } break; }
    case "morrigan_h": { draw(s); draw(s); const h2=S.hand[s].slice().sort((a,b)=>CARDS[b.id].cost-CARDS[a.id].cost)[0]; if(h2){ discard(s,h2); note=`pioche 2, défausse ${nm(h2)}`; } else note="pioche 2"; break; }
    case "nyx_h": { let n=0; for(let k=0;k<2;k++){ const t=weakest(S.board[o][li].filter(x=>x.rev&&!untargetable(s,o,x)&&!fated(x)),o,li); if(t&&destroy(o,li,t)) n++; else break; } if(n){ note=`détruit ${n} carte${n>1?"s":""}`; snd="destroy"; } break; }
    case "izzy_h": { const t=strongest(targets.filter(x=>pw(o,li,x)<=6&&!fated(x)),o,li); if(t){ const v=Math.ceil(Math.max(0,pw(o,li,t))/2); if(destroy(o,li,t)){ c.pow+=v; note=`détruit ${nm(t)}, +${v}`; snd="destroy"; } } break; }
    case "yarden_d": { let y=null, yl=-1; for(let i=0;i<3;i++){ const f=S.board[s][i].find(x=>x.rev&&eid(x)==="yarden"); if(f){ y=f; yl=i; break; } } if(y){ const v=Math.max(0,cardPow(s,yl,y)); if(destroy(s,yl,y)){ c.pow+=v; note=`absorbe Yarden Weiss, +${v}`; snd="void"; } } break; }
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
    case "eos": case "eos_r": { const n=onSide(s,"persephone")?2:1; for(let i=0;i<n;i++) draw(s); note=`pioche ${n} carte${n>1?"s":""}`; if(eid(c)==="eos_r"){ S.disc[s]=Math.max(S.disc[s],1); note+=", prochaine carte −1"; } break; }
    case "thot": { const t=strongest(targets,o,li); if(t&&weaken(o,li,t,2)){ note=`−2 à ${nm(t)}`; snd="debuff"; } break; }
    case "persephone": if(S.locs[li].rev&&!S.locs[li].stopped){ S.locs[li].stopped=true; note="l'effet du lieu s'arrête"; snd="lock"; } break;
    case "skadi": { const pool=[]; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&!shielded(o,i)) pool.push([i,x]);
      if(pool.length){ const [i,t]=gPick(pool); weaken(o,i,t,3); note=`−3 à ${nm(t)} (${LOCS[S.locs[i].id].name})`; snd="debuff"; } break; }
    case "ixchel": { let best=null; for(let i=0;i<3;i++) for(const x of S.board[o][i]) if(x.rev&&!untargetable(s,o,x)&&!shielded(o,i)&&(!best||pw(o,i,x)>pw(o,best[0],best[1]))) best=[i,x];
      if(best){ weaken(o,best[0],best[1],3); note=`−3 à ${nm(best[1])}`; snd="debuff"; } break; }
    case "inanna": { for(const side of [s,o]) for(const x of S.board[side][li]) if(x.rev){ const base=CARDS[x.id].pow; if(base<x.pow&&shielded(side,li)) continue; x.pow=base; x.malus=0; }
      note="tout revient à la base"; snd="lock"; break; }
    case "oya": { const t=strongest(targets.filter(x=>!shielded(o,li)),o,li); if(t){ t.pow=1; t.malus=0; t.neg=true; t.mods=[{v:1-CARDS[t.id].pow,src:d.name}]; t.reset=true; note=`${nm(t)} devient une carte de puissance 1`; snd="debuff"; } break; }
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
const HITS=["ereshkigal_n","bia","circe","qetesh","qetesh_r","pele_r","ulqetjor_r","poseidon","uloshun","tyr","mohini","thot","esquille","izzy","artemis","oya","nyx","hathor","ishtar","araignee","apsu","balor","calypso","chasseur","maree","set","andraste","ulnem"];
const DESTROYERS=new Set(["pakhet","anat","anubis","boucher","durga","ereshkigal","esquille","ficelle","izzy_h","lilith","maree","nergal_h","nyx","nyx_h","rusalka","sekhmet","sekhmet_n","troll","ulnem","uloshun","yarden_d"]);
const NEEDS_MATES=["susanoo","ulaph","oshun","tatoueur","comptable","bastet","anat","troll","tefnut"];
/* Synergies connues de l'IA : [carte qui prépare, cartes qui en profitent, 1 si elles doivent partager le lieu] */
const AI_PAIRS=[["yarden",["apsu","apsu_n","yarden_d"]],["freyr",["freya"],1],["freya",["freyr"],1],["ereshkigal",["nergal"]],["amaterasu",["susanoo"]],["marduk",["odin","lipdentelle"]],["izzy",["artemis"]],
  ["thot",["costumes"]],["persephone",["eos","eos_r"]],["hecate",["medee","medee_h"]],["styx",["nike","nike_v","bia"]],["promethee",["pandore"]]];
const AI_PREP={}, AI_PAY={};
for(const [a,bs,loc] of AI_PAIRS){ (AI_PREP[a]=AI_PREP[a]||[]).push(...bs); for(const x of bs) (AI_PAY[x]=AI_PAY[x]||[]).push({a,loc:!!loc}); }
/* Cartes adverses qui visent la plus forte : l'IA évite alors de tout miser sur une seule grosse carte */
/* Cartes adverses qui affaiblissent (−N de puissance) : Amaterasu les neutralise */
const AI_WEAK=new Set(["ereshkigal_n","ares_n","thot","artemis","tyr","hathor","ishtar","skadi","ixchel","balor","pele","pele_r","ulpele_r","nergal","araignee","ares","ares_h","mouche","medee","medee_h","set","bia","scathach","ecorche","andraste"]);
const AI_WARY=new Set(["nyx","nyx_h","durga","oya","ixchel","lilith","anubis","izzy_h","uloshun","ulnem","qetesh","qetesh_r","mohini","thot","medee_h"]);
/* L'IA compare toutes les combinaisons de sa main qui tiennent dans son énergie (128 au plus). Pour chacune, elle estime
   la puissance ajoutée dans chaque lieu, puis sa probabilité de gagner 2 lieux sur 3 face à ce que l'adversaire peut encore poser.
   me : côté joué ("e" par défaut, "p" pour les tests IA contre IA). Le bruit par palier brouille l'estimation des bas rangs. */
function aiPlan(me="e",tierOv){
  if(S.tut&&me==="e"){ return (TUT.plays[S.turn]||[]).map(([id,li])=>({c:S.hand.e.find(x=>x.id===id),li})).filter(x=>x.c); }
  const op=opp(me), t=tierOv!=null?tierOv:(S.aiTier||0), noise=[3,2.4,1.8,1.4,1,.6,.3][t];
  const en0=me==="e"?S.energyE:S.energy, hand=S.hand[me].slice(0,7);
  /* Nike : les petites cartes Jugement (coût 0 ou 1, jetons Flèche et Arme compris) sont gardées pour le tour de Nike et jouées avant elle.
     Nike attend (en main, ou encore dans le deck) ; Zeus en main avant le tour 5 : pas besoin de garder, la foudre les ramènera en main. */
  const smallJ=c=>CARDS[c.id].fac==="jugement"&&CARDS[c.id].cost<=1&&!isNike(c.id);
  const nikeHand=hand.some(x=>isNike(x.id)), nikeWait=!S.board[me].some(col=>col.some(x=>isNike(x.id)))&&(nikeHand||(S.deck[me]||[]).some(x=>isNike(x.id)));
  const zeusPlan=hand.some(x=>x.id==="zeus")&&S.turn<5;
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
    const tezHere=!!tezAt(me,li)||ctx.plays.some(x=>x.li===li&&x.c.id==="tezcatlipoca");
    if(S.locs[li].locked||muted(me,li)||banned(c)) return null;
    if(themisOn(li)&&ctx.pend[li]>=1) return null;
    if(c.id==="herakles"){ if(slotsUsed(op,li)>=capOf(op,li)) return null; }
    else if(!tezHere&&slotsUsed(me,li)+ctx.pend[li]>=capOf(me,li)) return null;
    const cost=costOf(me,c,li,ctx.first,ctx.jf); if(cost>ctx.en) return null;
    const diff=diffs[li], foes=foesN[li], mates=matesN[li]+ctx.pend[li];
    let pow=c.pow+NZ.get(c)[li], hit=0, adj=0;
    if(locIs(li,"tour")&&d.pow>=5) pow+=2;
    if(locIs(li,"encheres")) pow+=2;
    if(locIs(li,"escaliers")&&d.fac==="helvara") pow+=2;
    if(locIs(li,"domaine")&&JPARTNERS.has(c.id)) pow+=2;
    if(HITS.includes(c.id)){ if(foes) hit+=2.5; else adj-=1; }
    if(NEEDS_MATES.includes(c.id)) pow+=mates?2:-1;
    if(c.id==="aphrodite"){ /* elle rejoue la dernière Révélation du tour : ici, la dernière carte posée avant elle */
      const prev=ctx.plays.filter(x=>!isAph(x.c)); const L=prev[prev.length-1];
      if(!L) adj-=3; else if(isNike(L.c.id)) pow+=2*prev.length-2; else if(L.c.id==="pandore") adj-=1;
      else if(HITS.includes(L.c.id)){ if(foesN[L.li]) hit+=2.5; else adj-=1; } else pow+=1.5; }
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
    if(isNike(c.id)){ pow+=ctx.plays.length*2;
      /* au tour 6 de préférence ; plus tôt seulement avec au moins 3 cartes jouées avant elle (Vesta, Prométhée) */
      if(S.turn<6&&ctx.plays.length<3) adj-=20; }
    if(nikeWait&&!ctx.nike&&smallJ(c)&&S.turn<6&&!zeusPlan&&hand.length<7) adj-=nikeHand?8:4;
    /* vague Jugement (15 novembre, 14 décembre) */
    if(c.id==="maat"&&(mates||S.board[me][li].some(x=>x.rev))) pow+=1;
    if((c.id==="apollon"||c.id==="hephaistos")&&hand.length-ctx.plays.length<=7) adj+=c.id==="apollon"?1.5:2;
    if(c.id==="vesta"&&S.turn<6&&hand.some(x=>x!==c&&CARDS[x.id].fac==="jugement"&&!ctx.plays.some(y=>y.c===x))) adj+=1.5;
    if(c.id==="tsukuyomi"&&(S.board[me][li].some(x=>x.rev&&CARDS[x.id].fac==="jugement")||ctx.plays.some(x=>x.li===li&&CARDS[x.c.id].fac==="jugement")||hand.some(x=>x!==c&&CARDS[x.id].fac==="jugement"&&!ctx.plays.some(y=>y.c===x)))) pow+=2;
    if(c.id==="zeus"){ /* la foudre : cartes de coût 1 ou moins des deux côtés ; les tiennes (Jugement) reviennent en main. De préférence au tour 5 */
      let foeP=0, foeN=0, mineN=0, lost=0;
      for(let i=0;i<3;i++){ for(const x of S.board[op][i]) if(x.rev&&CARDS[x.id].cost<=1&&!untargetable(me,op,x)&&!shielded(op,i)&&!locIs(i,"sauvabelin")){ foeP+=Math.max(0,cardPow(op,i,x)); foeN++; }
        for(const x of S.board[me][i]) if(x.rev&&CARDS[x.id].cost<=1&&!shielded(me,i)&&!locIs(i,"sauvabelin")){ mineN++; const v=Math.max(0,cardPow(me,i,x)); lost+=CARDS[x.id].fac==="jugement"?v*.5:v; } }
      hit+=foeP; pow-=lost; if(foeN>=2||mineN>=2) adj+=2; adj+=S.turn===5?2:S.turn===6?-1:0;
      /* avec Nike en attente : la foudre ramène les petites cartes Jugement en main pour les rejouer avant elle au tour suivant */
      if(nikeWait&&S.turn===5){ let back=0; for(let i=0;i<3;i++) for(const x of S.board[me][i]) if(x.rev&&smallJ(x)&&!shielded(me,i)&&!locIs(i,"sauvabelin")) back++; if(back>=2) adj+=2+1.5*Math.min(4,back); } }
    if(charOf(c.id)==="ananke"){ /* fin de partie : puissance adverse ici +1 (elle gagne le lieu). Jamais avec une Nemesis adverse */
      if(S.board[op][li].some(x=>live(x)&&x.id==="nemesis")) return null;
      /* 4/1, jamais au tour 6 : au tour 4 ou 5, là où l'adversaire a déjà beaucoup de puissance et peu de place pour poser un contre */
      const room=Math.max(0,capOf(op,li)-S.board[op][li].length); pow=op0[li]+opFut[li]*(room?0.6:0)+1; adj+=(S.turn>=4?2:-4)+(room<=0?3:room===1?1:-1); }
    if(c.id==="hedone"){ /* 2 charmes (tours 5 et 6) si elle est posée au tour 5 au plus tard ; il faut de la place chez l'adversaire ici et des cartes adverses ailleurs */
      const room=capOf(op,li)-S.board[op][li].length, others=[0,1,2].some(i=>i!==li&&S.board[op][i].some(x=>x.rev));
      const n=Math.min(2,7-S.turn); if(room>0&&others) pow+=2.5*n+(room>=2?1:0); else adj-=2;
      if(S.turn<=5) adj+=1; }
    if(c.id==="source"){ /* ses effets doublent les Révélations des autres cartes Helvara posées APRÈS elle ici (ce tour ou plus tard) */
      const withFx=x=>x!==c&&CARDS[x.id].fac==="helvara"&&/Révélation/.test(CARDS[x.id].fx||"");
      const n=hand.filter(withFx).length; adj+=Math.min(4,1.5*n)+(S.turn<=4?1:-1); }
    if(c.id==="pandore") pow+=2*Math.max(0,ctx.en-cost);   /* jouée en dernier : elle dépense tout ce qui reste */
    if(c.id==="qetesh_r"&&S.turn>=6) adj-=6;               /* le charme n'arrive qu'au tour suivant */
    if(c.id==="ulqetjor_r") pow+=mates;
    if(c.id==="ulpele_r"){ /* −1 à toutes les cartes adverses des 3 lieux : tour 6 avec une autre carte, quand l'adversaire a le plus de cartes en jeu */
      const nf=foesN[0]+foesN[1]+foesN[2]; hit+=nf*.8; if(S.turn<6) adj-=3; if(ctx.plays.length) adj+=1.5; if(nf<3) adj-=2; }
    if(c.id==="ulnem"){ const fs=Math.max(0,...S.board[op][li].filter(x=>x.rev).map(x=>cardPow(op,li,x))), own=S.board[me][li].filter(x=>x.rev), ms=Math.max(0,...own.map(x=>cardPow(me,li,x)));
      if(foes){ hit+=fs-2.5; pow-=ms; pow+=2*Math.max(0,own.length-(own.length?1:0)+(ctx.pend[li]?ctx.pend[li]*.7:0)); adj+=1.5; } }
    /* Nyx X Circé : toutes les cartes adverses ici deviennent des Pourceaux (puissance 1) : on retire leur puissance moins 1 chacune */
    if(c.id==="ulcirce"){ const fo=S.board[op][li].filter(x=>x.rev&&!fated(x)&&!x.neg); if(fo.length&&!shielded(op,li)) hit+=fo.reduce((a,x)=>a+Math.max(0,cardPow(op,li,x)-1),0)+.5; else adj-=2; }
    if(c.id==="fenrir") pow+=2*Math.max(0,6-S.turn)*.85;   /* +2 à la fin de chaque tour suivant */
    /* Circé, Reine du Gui : les cartes adverses ici plus faibles qu'elle deviennent des Pourceaux (1) ; la plus forte d'un autre lieu est attirée ici (et devient Pourceau) */
    if(c.id==="circe_n"){ const lim=pow, fo=S.board[op][li].filter(x=>x.rev&&!fated(x)&&cardPow(op,li,x)<lim); if(!shielded(op,li)) hit+=fo.reduce((a,x)=>a+Math.max(0,cardPow(op,li,x)-1),0);
      let best=-1; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[op][i]) if(x.rev&&!fated(x)) best=Math.max(best,cardPow(op,i,x));
      if(best>=0&&S.board[op][li].length<capOf(op,li)&&!shielded(op,li)){ if(best<lim) adj+=Math.max(0,best-1)*.6; else adj-=1; } }
    /* Ereshkigal, Dame de la Longue Nuit : la moitié (arrondie au-dessus) de la puissance de la carte adverse la plus forte ici */
    if(c.id==="ereshkigal_n"){ const fp=S.board[op][li].filter(x=>x.rev&&!untargetable(me,op,x)).map(x=>cardPow(op,li,x)); if(fp.length&&!shielded(op,li)) hit+=Math.ceil(Math.max(0,...fp)/2); }
    /* Arès, Duelliste du Dernier Soir : si la carte adverse la plus forte ici est plus faible, elle tombe (on gagne sa puissance) ; si elle est plus forte, c'est lui qui tombe */
    if(c.id==="ares_n"){ const fp=S.board[op][li].filter(x=>x.rev&&!untargetable(me,op,x)).map(x=>cardPow(op,li,x)); if(fp.length){ const f=Math.max(...fp); if(f<pow) hit+=f; else if(f>pow){ adj-=pow; pow=0; } } }
    /* Lot du 1er janvier 2027 (22 octobre) */
    { const rest=hand.filter(x=>x!==c&&!ctx.plays.some(y=>y.c===x)), onB=f=>{ let n=0; for(const col of S.board[me]) for(const x of col) if(x.rev&&f(x)) n++; return n+ctx.plays.filter(y=>y.c!==c&&f(y.c)).length+.4*rest.filter(f).length; };
      if(c.id==="enfant"&&S.turn<6) adj+=5;                                   /* revient en main avec +1 à chaque tour : à rejouer chaque tour */
      if(c.id==="archiviste") adj+=1.5;
      if(c.id==="ularchiviste") adj+=2+Math.min(3,.5*rest.filter(x=>CARDS[x.id].fac==="helvara").length);
      if(c.id==="dagda") adj+=1.5;
      if(c.id==="indra") pow+=Math.min(5,rest.length);
      if(c.id==="patronne"){ if(S.turn>=6) adj-=6; else adj+=1+.5*Math.min(3,rest.length); }       /* sans effet au tour 6 : au plus tard au tour 5 */
      if(c.id==="typhon"){ if(S.turn>=6) adj-=4; else adj+=S.hand[op].length>hand.length?1.5:-1; }
      if(c.id==="meute"){ hit-=2*foes; adj-=1; }
      if(c.id==="musicien") pow+=1.6*onB(x=>CARDS[x.id].cost===3&&x.id!=="musicien");
      if(c.id==="ea") pow+=2*onB(x=>CARDS[x.id].fac==="desir"&&!CARDS[x.id].token&&x.id!=="ea");
      if(c.id==="cernunnos") adj+=diff>0?2:-1;
      if(c.id==="veilleur_pont"&&foes) adj+=1;
      if(c.id==="quetzalcoatl"){ let n=0; for(let i=0;i<3;i++) if(i!==li&&!S.locs[i].locked&&slotsUsed(me,i)+ctx.pend[i]<capOf(me,i)&&!S.board[me][i].some(x=>x.id==="plume")) n++; adj+=1.2*n; }
      if(c.id==="anansi"){ const fp=S.board[op][li].filter(x=>x.rev&&!untargetable(me,op,x)).map(x=>cardPow(op,li,x)), mp=[pow,...S.board[me][li].filter(x=>x.rev).map(x=>cardPow(me,li,x))];
        if(fp.length){ const gap=Math.max(...fp)-Math.min(...mp); if(gap>0&&gap<=4){ hit+=gap; pow+=gap; } } } }
    /* Lot du 15 janvier 2027 (23 octobre) */
    { const rest=hand.filter(x=>x!==c&&!ctx.plays.some(y=>y.c===x)), later=Math.min(3,rest.length);
      if(c.id==="kama"){ adj+=1+(seen.some(id=>DESTROYERS.has(id))?1:0); }
      if(c.id==="tezcatlipoca") adj+=1.5;
      if(c.id==="eros"){ const mate=S.board[me][li].some(x=>x.rev)||ctx.plays.some(x=>x.li===li); if(mate) pow+=2; const el=[0,1,2].some(i=>i!==li&&foesN[i]); if(el){ hit+=2; adj+=1.5; } }
      if(c.id==="belobog") adj-=S.turn<=3?3:1;
      if(c.id==="horus"){ pow+=Math.min(3,later); if(S.turn<=4&&rest.length>=2) adj+=2; }
      if(c.id==="herakles"){ pow=0; hit+=4; }
      if(c.id==="lugh") pow+=4*Math.min(1,(6-S.turn)/((S.deck[me]||[]).length+1))*.85;
      if(S.turn<6&&hand.some(x=>x.id==="marduk")&&c.id!=="marduk"){
        if(c.id==="odin"||c.id==="loki") adj+=3.5;
        if(c.id==="lipdentelle") adj+=6.5;
        if(["mendiant","melinoe","dionysos","morrigan_h"].includes(c.id)) adj+=2/Math.max(1,hand.length-1); } }
    /* Lot du 1er février 2027 (23 octobre) */
    { const gv=(S.graveyard&&S.graveyard[me])||[], lastG=gv.length?gv[gv.length-1]:null, mx=Math.max(0,...S.board[me][li].filter(x=>x.rev&&!fated(x)).map(x=>cardPow(me,li,x)));
      if(c.id==="nephtys"&&(S.board[me][li].some(x=>x.rev&&!fated(x))||mates)){ pow+=4-mx; adj-=.5; }
      if(c.id==="pakhet"){ const sm=S.board[op][li].filter(x=>x.rev&&CARDS[x.id].cost<=1); if(sm.length) hit+=Math.max(...sm.map(x=>cardPow(op,li,x)))+Math.min(2,7-S.turn); else adj+=Math.min(2,7-S.turn)*.4; }
      if(c.id==="hera"){ const fp=S.board[op][li].filter(x=>x.rev).map(x=>cardPow(op,li,x)), e=fp.length?Math.max(...fp):-1; if(e>=0){ if(e>=6) hit+=Math.ceil(e/2); else pow-=3; } }
      if(c.id==="frigg"){ let best=-1; for(let i=0;i<3;i++) if(i!==li) for(const x of S.board[op][i]) if(x.rev&&!fated(x)) best=Math.max(best,cardPow(op,i,x));
        if(best<0||S.board[op][li].length>=capOf(op,li)) adj-=3; else if(diff>=best) adj+=best*.7; else adj+=best*.25-2; }
      if(c.id==="xiwangmu"&&hand.length-ctx.plays.length<7) adj+=2;
      if(c.id==="bari_gongju"&&hand.some(x=>x.id==="marduk")) adj+=3;
      if(c.id==="isis"){ if(lastG&&hand.length-ctx.plays.length<7) adj+=2+CARDS[lastG].pow*.5; else adj-=2; }
      if(c.id==="rati"){ if(lastG&&capOf(me,li)-S.board[me][li].length-ctx.pend[li]>=2){ pow+=CARDS[lastG].pow+(lastG==="kama"?2:0); adj+=1; } else adj-=1.5; }
      if(c.id==="anahita"){ const pv=ctx.plays.filter(x=>CARDS[x.c.id].r!=="U"&&!CARDS[x.c.id].token);
        if(!pv.length) adj-=8; else { pow+=2; adj+=1; if(HITS.includes(pv[pv.length-1].c.id)) hit+=foes?2.5:-1; } } }
    /* Aphrodite, Coupe de Minuit : +2 d'énergie au tour suivant, sans effet au tour 6 : à jouer au plus tard au tour 5 */
    if(c.id==="aphrodite_r"){ if(S.turn>=6) adj-=6; else adj+=S.turn<=3?6:4; }
    /* Médée, Mariée Spectrale : le poison retire 1 par fin de tour (7 − tour fins de tour restantes) à la carte adverse la plus forte ici, aux deux plus fortes avec Hécate */
    if(c.id==="medee_h"){ const fp=S.board[op][li].filter(x=>x.rev&&!fated(x)).map(x=>cardPow(op,li,x)).sort((a,b)=>b-a), k=Math.max(0,7-S.turn);
      if(fp.length){ hit+=Math.min(Math.max(0,fp[0]),k)+((onBoard("hecate")||ctx.plays.some(x=>x.c.id==="hecate"))&&fp[1]>0?Math.min(fp[1],k):0); if(S.turn<=4) adj+=1; } else adj-=1.5; }
    /* Yarden Dragonification : +2 par autre carte Primordiale de ton côté (déjà là, posée ce tour, ou encore en main) */
    if(c.id==="yarden_d"){ const pr=x=>CARDS[x.id].fac==="primordial"&&!CARDS[x.id].token; let n=0; for(const col of S.board[me]) for(const x of col) if(x.rev&&pr(x)) n++;
      n+=ctx.plays.filter(x=>pr(x.c)).length; n+=.5*hand.filter(x=>x!==c&&pr(x)&&!ctx.plays.some(y=>y.c===x)).length; pow+=2*n; }
    /* Amaterasu : ses effets protègent tes cartes des affaiblissements, dans les 3 lieux : plus il y a de cartes à protéger (ou d'affaiblissements chez l'adversaire), plus elle vaut */
    if(c.id==="amaterasu"){ const mine=S.board[me].reduce((a,col)=>a+col.filter(x=>x.rev).length,0)+ctx.plays.length, weakeners=seen.filter(id=>AI_WEAK.has(id)).length;
      pow+=Math.min(4,.7*mine)+(weakeners?2+Math.min(2,weakeners*.5):0); }
    if(c.id==="ulqetyar"){ let n=0; for(let i=0;i<3;i++){ const f=new Set(S.board[me][i].filter(x=>x.rev).map(x=>CARDS[x.id].fac)); for(const x of ctx.plays) if(x.li===i) f.add(CARDS[x.c.id].fac); if(i===li) f.add("desir"); if(f.has("desir")&&f.has("primordial")) n++; } pow+=3*n; }
    /* Résurrections : valeur de ce qui revient, si la place le permet */
    if(RES.has(c.id)){ const room=Math.max(0,capOf(me,li)-S.board[me][li].length-ctx.pend[li]-1), dp=(S.discardPile&&S.discardPile[me])||[], gv=(S.graveyard&&S.graveyard[me])||[], bp=id=>CARDS[id].pow+(c.id==="ulhel"&&charOf(id)==="baldur"?5:0);
      const byPow=ids=>ids.map(bp).sort((a,b)=>b-a);
      if(c.id==="hel"){ /* sa main (hors cartes déjà prévues ce tour) est défaussée, puis les 2 plus fortes défaussées reviennent : au tour 6 de préférence */
        const dh=hand.filter(x=>x!==c&&!ctx.plays.some(y=>y.c===x)); pow+=byPow(dp.concat(dh.filter(x=>!CARDS[x.id].token).map(x=>x.id))).slice(0,Math.min(2,room)).reduce((a,v)=>a+v,0); adj-=0.8*dh.length; if(S.turn<6) adj-=3; }
      else if(c.id==="hel_r"&&room&&dp.length) pow+=Math.max(...dp.map(id=>CARDS[id].pow));
      else if(c.id==="loviatar"){ if(!dp.length) pow+=3; else if(room) pow+=Math.max(0,CARDS[dp[dp.length-1]].pow-Math.min(2,6-S.turn)); if(S.turn<5) adj-=2; }   /* malade : −1 par tour restant, donc tard */
      else if(c.id==="hades"){ if(!gv.length) pow+=2; else if(room) pow+=Math.max(...gv.map(id=>CARDS[id].pow)); }
      else if(c.id==="ulhel"&&room&&(dp.length||gv.length)) pow+=Math.max(...byPow(dp.concat(gv))); }
    /* fusions posées trop rarement par rapport à ce qu'elles rapportent (mesure du 14 octobre : 8 à 12 % des decks) */
    if(c.id==="ulhel"&&((S.discardPile[me]||[]).length||(S.graveyard[me]||[]).length)) adj+=6;
    if(c.id==="ulqetyar") adj+=6;
    if(c.id==="echidna") pow+=2*hand.filter(x=>x!==c&&CARDS[x.id].cost<=1&&!ctx.plays.some(y=>y.c===x)).length;
    if(c.id==="cronos"){ /* au tour 5, sur un lieu qu'elle mène, quand elle perd ou est à égalité ailleurs, avec au moins 2 petites cartes pour le tour 6 ; jamais si elle mène déjà deux lieux */
      if(diffs.filter(d=>d<0).length>=2) return null;
      const others=[0,1,2].filter(i=>i!==li); let foeP=0, mineP=0;
      for(const i of others){ for(const x of S.board[op][i]) if(x.rev) foeP+=Math.max(0,cardPow(op,i,x)); for(const x of S.board[me][i]) if(x.rev) mineP+=Math.max(0,cardPow(me,i,x)); }
      hit+=foeP*.6; pow-=mineP*.6;
      adj+=S.turn===5?3:-6; if(diffs[li]<0) adj+=6; else adj-=10; if(others.every(i=>diffs[i]>=0)) adj+=3;
      adj+=hand.filter(x=>x!==c&&CARDS[x.id].cost<=1).length>=2?2:-2; }
    if(c.id==="izanami") adj-=hand.length>1?1:0;
    if(c.id==="loki"&&S.hand[op].length>=2) hit+=1.5;
    if(wary&&d.pow>=6&&!S.board[me][li].length&&!ctx.pend[li]) adj-=1.5;
    return {cost,pow,hit,adj};
  };
  /* ordre de pose : les préparatrices d'abord, Pandore et Nike en dernier, puis les plus chères */
  const late=c=>c.id==="tezcatlipoca"||c.id==="horus"?-1:c.id==="pandore"?3:c.id==="aphrodite"||c.id==="anahita"?2:isNike(c.id)?1:0, prepFor=(c,cs)=>(AI_PAY[c.id]||[]).some(p=>cs.some(x=>x.id===p.a))?1:0;
  const order=cs=>cs.slice().sort((a,b)=>late(a)-late(b)||prepFor(a,cs)-prepFor(b,cs)||CARDS[b.id].cost-CARDS[a.id].cost);
  const winP=(add,hit)=>{ const p=[0,1,2].map(li=>{ let m=me0[li]+add[li]+meFut[li]-(op0[li]-hit[li]+opFut[li]); if(nemInv(li)) m=-m; return 1/(1+Math.exp(-1.6*m/sd)); });
    return p[0]*p[1]+p[0]*p[2]+p[1]*p[2]-2*p[0]*p[1]*p[2]; };
  /* simulation exacte d'un plan sur une copie de la partie (Révélations comprises), sans son ni journal visibles */
  const sim=plays=>{ const keep=S, kq=quiet, kr=RNG; let out=null;
    try{ quiet=true; RNG=mulberry(7); S=structuredClone(keep);
      S.lastRev={p:null,e:null}; S.lastAny=null; S.turnPlays={...(S.turnPlays||{}),[me]:plays.map(({c})=>S.hand[me].find(y=>y.uid===c.uid)).filter(Boolean)};
      S.unspent={p:0,e:0,...(S.unspent||{})}; S.unspent[me]=Math.max(0,(me==="e"?S.energyE:S.energy)-plays.reduce((a,x,i)=>a+costOf(me,x.c,x.li,i===0,jugFirst(plays,i)),0));
      for(const {c,li} of plays){ const x=S.hand[me].find(y=>y.uid===c.uid); if(!x) continue; S.hand[me]=S.hand[me].filter(y=>y!==x);
        if(c.id==="herakles"){ if(slotsUsed(op,li)<capOf(op,li)){ makeRoom(op,li); x.rev=true; S.board[op][li].push(x); } else S.hand[me].push(x); continue; }
        S.board[me][li].push(x); reveal(me,li,x); afterPlay(me,li,x); }
      if(keep.turn<6) for(const {c,li} of plays) if(c.id==="qetesh_r"){ const x=S.board[me][li].find(y=>y.uid===c.uid); if(x&&live(x)) midnightCharm(me,li,x); }
      out={m:[0,1,2].map(li=>total(me,li)),o:[0,1,2].map(li=>total(op,li)),inv:[0,1,2].map(li=>nemInv(li)),ank:[0,1,2].map(li=>S.board[me][li].some(x=>isAnk(x)&&live(x)))};
      /* Hédoné : sa fin de tour n'est pas jouée ici ; on ajoute ce qu'elle rapportera (cartes adverses attirées, comme dans place()) */
      for(const {c,li} of plays) if(c.id==="hedone"){ const x=S.board[me][li].find(y=>y.uid===c.uid); if(!x||!live(x)) continue;
        const room=capOf(op,li)-S.board[op][li].length, others=[0,1,2].some(i=>i!==li&&S.board[op][i].some(y=>y.rev)); if(room>0&&others) out.m[li]+=2.5*Math.min(2,7-S.turn); }
    }catch(e){ out=null; } finally{ S=keep; quiet=kq; RNG=kr; }   /* le hasard de la vraie partie n'est jamais consommé par la simulation (replay) */
    return out; };
  const exactP=r=>{ const p=[0,1,2].map(li=>{ let m=r.m[li]+meFut[li]-(r.o[li]+opFut[li]); if(r.inv[li]) m=-m; if(r.ank&&r.ank[li]) return r.inv[li]?.03:(capOf(op,li)-S.board[op][li].length<=0?.95:.8); return 1/(1+Math.exp(-1.6*m/sd)); });
    return p[0]*p[1]+p[0]*p[2]+p[1]*p[2]-2*p[0]*p[1]*p[2]; };
  const cands=[];
  for(let mask=0;mask<(1<<hand.length);mask++){
    const cs=order(hand.filter((_,i)=>mask>>i&1)), ctx={en:en0,first:true,jf:true,plays:[],pend:[0,0,0],nike:cs.some(x=>isNike(x.id))}, add=[0,0,0], hit=[0,0,0]; let adj=0, ok=true;
    for(const c of cs){ let bp=null;
      /* chaque carte va là où elle fait le plus monter la probabilité de victoire */
      for(let li=0;li<3;li++){ const r=place(c,li,ctx); if(!r) continue; add[li]+=r.pow; hit[li]+=r.hit; const v=winP(add,hit)*100+r.adj; add[li]-=r.pow; hit[li]-=r.hit; if(!bp||v>bp.v) bp={...r,li,v}; }
      if(!bp){ ok=false; break; }
      ctx.plays.push({c,li:bp.li}); ctx.en-=bp.cost; if(c.id!=="herakles") ctx.pend[bp.li]++; ctx.first=false; if(vestaT(c.id)) ctx.jf=false; add[bp.li]+=bp.pow; hit[bp.li]+=bp.hit; adj+=bp.adj; }
    if(!ok) continue;
    let bonus=adj;
    /* garder une carte pour plus tard : bonus aux tours 2 à 5 si elle attend sa préparation ou le tour 6 */
    const kept=hand.filter(c=>!cs.includes(c));
    if(S.turn>=2&&S.turn<=5&&kept.some(k=>(AI_PAY[k.id]||[]).some(p=>onBoard(p.a)||ctx.plays.some(x=>x.c.id===p.a))||(CARDS[k.id].cost>=6&&S.turn===5))) bonus+=3;
    const cand={plays:ctx.plays,bonus,est:winP(add,hit)*100+bonus}; cands.push(cand);
    /* Aphrodite : variantes où chaque autre carte passe juste avant elle (l'ordre décide quelle Révélation elle rejoue) */
    const aph=ctx.plays.find(x=>x.c.id==="aphrodite");
    if(aph) for(const k of ctx.plays) if(k!==aph&&k.c.id!=="pandore"&&!isAph(k.c)){
      const rest=ctx.plays.filter(x=>x!==aph&&x!==k&&x.c.id!=="pandore"), pd=ctx.plays.filter(x=>x.c.id==="pandore");
      const v=[...rest,k,aph,...pd]; if(v.every((x,i)=>x===ctx.plays[i])) continue;
      cands.push({plays:v,bonus,est:cand.est}); }
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
  const mine=S.staged.slice(); if(S.swimP) mine.swim=S.swimP;
  await resolveTurn(mine, aiPlan(), true);
}
async function resolveTurn(mine, theirs, animate){
  const wait=ms=>animate?sleep(ms):Promise.resolve();
  if(S.rec&&S.rec.turns.length<S.turn) S.rec.turns.push({p:mine.map(x=>[x.c.id,x.li]),e:theirs.map(x=>[x.c.id,x.li]),sw:mine.swim?[mine.swim.from,mine.swim.li]:null});
  S.busy=true; S.sel=null; S.info=null; S.staged=[]; S.swimP=null; S.swimSel=false; S.nudge=false; S.lastRev={p:null,e:null}; S.lastAny=null;
  /* Prométhée : énergie non dépensée ; Nike : ordre dans lequel chaque joueur a posé ses cartes (l'IA garde Nike pour la fin) */
  const spent=(s,list)=>list.reduce((a,x,i)=>a+(x.fixed!=null?x.fixed:costOf(s,x.c,x.li,i===0,jugFirst(list,i))),0);
  const unspent=S.unspent={p:Math.max(0,S.energy-spent("p",mine)),e:Math.max(0,S.energyE-spent("e",theirs))}; S.biaBlock={p:false,e:false};
  S.turnPlays={p:mine.map(x=>x.c),e:(S.mp?theirs:[...theirs.filter(x=>!isNike(x.c.id)),...theirs.filter(x=>isNike(x.c.id))]).map(x=>x.c)};
  S.hand.p=S.hand.p.filter(c=>!mine.some(x=>x.c===c));
  for(const x of theirs) S.hand.e=S.hand.e.filter(c=>c!==x.c);
  if(mine.length){ S.disc.p=0; cardOfDayPlayed(mine); if(!(S.mp&&S.mp.replaying)&&!S.tut&&!S.rp){ ensureQuests(); qProg("cards12",mine.length);
    const cd=x=>CARDS[x.c.id]; qProg("cheap5",mine.filter(x=>cd(x).cost>=1&&cd(x).cost<=2).length); qProg("helv4",mine.filter(x=>cd(x).fac==="helvara").length);
    if(S.turn===6&&mine.some(x=>cd(x).cost>=6)) qProg("six6"); if(mine.some(x=>cd(x).r==="U")) qProg("fusion"); } }
  if(theirs.length) S.disc.e=0;
  /* Vesta : la réduction est prise par la première carte Jugement de coût 1 ou plus jouée (avant les Révélations : une Vesta jouée ce tour vaut pour la suite) */
  S.vesta=S.vesta||{p:0,e:0}; for(const [k,l] of [["p",mine],["e",theirs]]) if(l.some(x=>vestaT(x.c.id))) S.vesta[k]=0;
  /* La Nageuse du Lac : le déplacement annoncé se fait avant la pose des cartes (les deux camps) */
  for(const [side,list] of [["p",mine],["e",theirs]]){ const w=list.swim; if(!w) continue; const c=w.c, from=S.board[side].findIndex(col=>col.includes(c));
    if(from<0||c.swimT===S.turn||!live(c)||fated(c)||w.li===from||!S.locs[w.li].rev||S.locs[w.li].locked||S.board[side][w.li].length>=capOf(side,w.li)) continue;
    c.swimT=S.turn; S.board[side][from]=S.board[side][from].filter(x=>x!==c); S.board[side][w.li].push(c); flonHook(w.li,c); log(`La Nageuse du Lac traverse vers ${LOCS[S.locs[w.li].id].name} (${who(side)})`); sfx("buff"); }
  const eatPlume=(s,li,c)=>{ const pl=S.board[s][li].find(x=>eid(x)==="plume"); if(pl){ S.board[s][li]=S.board[s][li].filter(x=>x!==pl); c.pow+=1; (c.mods=c.mods||[]).push({v:1,src:"Plume"}); } };
  const crossed=[];   /* Héraklès : posé après les autres cartes, il passe du côté de l'adversaire (s'il y reste de la place, sinon il retourne dans la main) */
  for(const x of mine){ if(!CARDS[x.c.id].token) (S.played=S.played||[]).push([x.c.id,S.locs[x.li].id]); if(x.c.id==="herakles"){ crossed.push(["p",x]); continue; } eatPlume("p",x.li,x.c); S.board.p[x.li].push(x.c); }
  for(const x of theirs){ if(x.c.id==="herakles"){ crossed.push(["e",x]); continue; } eatPlume("e",x.li,x.c); S.board.e[x.li].push(x.c); }
  for(const [side,x] of crossed){ const o=opp(side), c=x.c;
    if(!S.locs[x.li].locked&&slotsUsed(o,x.li)<capOf(o,x.li)){ makeRoom(o,x.li); c.rev=true; c.fresh=true; S.board[o][x.li].push(c); log(`Héraklès passe chez l'adversaire : ${LOCS[S.locs[x.li].id].name} (${who(side)})`); }
    else{ c.rev=false; S.hand[side].push(c); log(`Héraklès n'a plus de place chez l'adversaire : il retourne dans la main (${who(side)})`); } }
  render();
  const dflt=(!S.mp||S.mp.meHost)?"p":"e", queue=[];
  for(let li=0;li<3;li++){ const f=leader(li)||dflt, g=opp(f);
    for(const side of [f,g]) for(const x of (side==="p"?mine:theirs)) if(x.li===li&&x.c.id!=="herakles") queue.push([side,x]); }
  for(const [s,x] of queue){
    await wait(560);
    if(!S.board[s][x.li].includes(x.c)) continue;
    if(animate&&CARDS[x.c.id].r==="U"&&!S.tut&&!(S.mp&&S.mp.replaying)){ const u=ULof(x.c.id);
      if(u&&u.fac) await factionCine(x.c.id,s,x.li); else if(u&&u.req.length&&P.cine!==false) await fusionCine(x.c.id,s); }
    { const m=snapPow(); reveal(s,x.li,x.c); medeeHook(s,x.li,x.c); veilleurHook(s,x.li,x.c); afterPlay(s,x.li,x.c); diffPow(m,CARDS[x.c.id].name); } render();
    if(animate) cardVfx(x.c.id,x.li);
  }
  trimOverflow();
  /* Idunn : fin de tour (pas après le tour 6) */
  if(S.turn<6) for(const {s,li} of eot("idunn")){
    const t=S.board[s][li].filter(x=>x.rev).sort((a,b)=>cardPow(s,li,a)-cardPow(s,li,b))[0]; if(t){ t.pow+=1; (t.mods=t.mods||[]).push({v:1,src:"Idunn"}); log(`Idunn · +1 à ${nm(t)} (${who(s)})`); sfx("buff"); }
  }
  /* Konohanasakuya-Hime : la floraison passe à la fin du tour qui suit son arrivée */
  for(const {s,li,c,c0} of eot("konohana")) if(c0.bloom===S.turn&&c0.pow>0&&c.pow>0){
    (c.mods=c.mods||[]).push({v:-c.pow,src:"Floraison passée"}); c.pow=0; log(`Konohanasakuya-Hime · la floraison est passée (${who(s)})`); sfx("debuff"); }
  /* Poison de Médée, Mariée Spectrale : −1 à chaque fin de tour, jusqu'à 0 */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li]) if(c.poison&&c.rev&&cardPow(s,li,c)>0&&(SRC={s:opp(s),cost:CARDS.medee_h.cost},weaken(s,li,c,1))&&!(SRC=null)){
    (c.mods=c.mods||[]).push({v:-1,src:"Poison de Médée"}); log(`Poison de Médée · −1 à ${nm(c)} (${who(s)})`); sfx("debuff"); }
  SRC=null;
  /* Ishtar : fin de tour (pas après le tour 6) */
  if(S.turn<6) for(const {s,li} of eot("ishtar")){
    const o=opp(s); const t=S.board[o][li].filter(x=>x.rev&&!untargetable(s,o,x)).sort((a,b)=>cardPow(o,li,b)-cardPow(o,li,a))[0];
    SRC={s,cost:CARDS.ishtar.cost}; const ok=t&&weaken(o,li,t,1); SRC=null;
    if(ok){ (t.mods=t.mods||[]).push({v:-1,src:"Ishtar"}); log(`Ishtar · −1 à ${nm(t)} (${who(o)})`); sfx("debuff"); }
  }
  /* Fin des effets temporaires : le Clone de Sun Wukong disparaît (sans compter comme une destruction) ; Méduse : la cible récupère les 2 points retirés (les gains empêchés ne sont pas rattrapés) */
  for(const s of ["p","e"]) for(let li=0;li<3;li++) for(const c of S.board[s][li].slice()){
    if(c.gone===S.turn){ S.board[s][li]=S.board[s][li].filter(x=>x!==c); log(`Le Clone de Sun Wukong disparaît (${who(s)})`); }
    else if(c.medUntil===S.turn){ delete c.medCap; delete c.medUntil; c.pow+=2; c.malus=Math.max(0,(c.malus||0)-2); (c.mods=c.mods||[]).push({v:2,src:"Méduse (fin)"}); log(`Méduse · ${nm(c)} récupère 2 de puissance (${who(s)})`); sfx("buff"); } }
  /* Fenrir : à la fin de chaque tour suivant celui de sa Révélation, +2 de puissance */
  for(const {s,li,c,c0} of eot("fenrir")) if(c0.fenT!=null&&S.turn>c0.fenT){
    c.pow+=2; (c.mods=c.mods||[]).push({v:2,src:"Fenrir"}); log(`Fenrir · +2 (${who(s)})`); sfx("buff"); }
  /* Pakhet : à la fin de chaque tour, détruit une carte adverse de coût 1 ou moins ici (la plus forte ; une seule par Pakhet) */
  for(const {s,li,c} of eot("pakhet",dflt)) if(S.board[s][li].includes(c)){
    const o=opp(s), cs=S.board[o][li].filter(x=>x.rev&&CARDS[x.id].cost<=1&&!untargetable(s,o,x)&&!fated(x)&&!deathless(x));
    if(!cs.length) continue; const mx=Math.max(...cs.map(x=>cardPow(o,li,x))), t=gPick(cs.filter(x=>cardPow(o,li,x)===mx));
    SRC={s,cost:CARDS.pakhet.cost}; const ok=destroy(o,li,t); SRC=null;
    if(ok){ log(`Pakhet détruit ${nm(t)} (${who(o)})`); sfx("destroy"); } }
  if(S.turn===4){
    const rifts=[0,1,2].filter(li=>locIs(li,"faille"));
    if(animate&&rifts.length){ rifts.forEach(li=>FX.play("faille_open",{li})); await wait(1150); rifts.forEach(li=>FX.play("faille_close",{li})); }
    S.locs.forEach((L,li)=>{ if(locIs(li,"faille")){
      for(const s of ["p","e"]){ const arr=S.board[s][li].filter(c=>c.rev&&!(eid(c)==="uzume"&&!c.neg)&&!fated(c)&&!baldurSafe(s,c)&&!c.ward); if(!arr.length) continue;
        const w=arr.sort((a,b)=>cardPow(s,li,a)-cardPow(s,li,b))[0];
        if(destroy(s,li,w)){ log(`La Faille détruit ${nm(w)} (${who(s)})`); sfx("destroy"); } }
    }});
  }
  /* Le Cirque : fin du tour 4, les puissances des cartes révélées sont mélangées entre les deux côtés */
  if(S.turn===4){ const side0=dflt, circ=[0,1,2].filter(li=>locIs(li,"cirque"));
    if(animate&&circ.length) await wait(500);
    for(const li of circ){ const pool=[]; for(const side of [side0,opp(side0)]) for(const c of S.board[side][li]) if(c.rev&&!cirqueSafe(side,li,c)) pool.push(c);
      if(pool.length<2) continue; const vals=gShuffle(pool.map(c=>c.pow));
      pool.forEach((c,i)=>{ const d=vals[i]-c.pow; if(d){ (c.mods=c.mods||[]).push({v:d,src:"Le Cirque"}); c.pow=vals[i]; c.malus=0; } });
      log(`Le Cirque mélange les puissances de ${pool.length} cartes`); sfx("void"); } }
  /* Carillonneur : +1 à chaque fin de tour ; au tour 6, le glas partage la moitié de sa puissance */
  for(const {s,li,c,c0} of eot("carillonneur")){
    SRC={s,cost:CARDS.carillonneur.cost}; c.pow+=1; (c.mods=c.mods||[]).push({v:1,src:"Le Carillonneur"});
    if(S.turn===6&&!c0.knell){ c0.knell=true; const v=Math.floor(Math.max(0,cardPow(s,li,c))/2); const ms=S.board[s][li].filter(x=>x!==c&&x.rev);
      if(v&&ms.length){ ms.forEach(x=>{ x.pow+=v; (x.mods=x.mods||[]).push({v,src:"Le glas"}); }); log(`Le glas sonne : +${v} à ${ms.length} carte${ms.length>1?"s":""} (${who(s)})`); sfx("legend"); } }
    SRC=null; }
  /* Le Tombeau : fin du tour 6, les défaussés reviennent */
  if(S.turn===6&&animate){ const tb=[0,1,2].filter(li=>locIs(li,"tombeau")); if(tb.length){ tb.forEach(li=>FX.play("tombeau_rise",{li})); await wait(700); } }
  if(S.turn===6){ piles(); S.locs.forEach((L,li)=>{ if(locIs(li,"tombeau")) for(const s of ["p","e"]){ let n=0; for(const id of gShuffle(S.discardPile[s].slice())){ if(!resurrect(s,id,li,"discard",{anyLoc:true})) break; n++; } if(n){ log(`Le Tombeau rend ${n} carte${n>1?"s":""} (${who(s)})`); sfx("void"); } } }); }
  /* La Messagère d'Hécate : à chaque fin de tour, +2 si son camp ne mène pas ici (6 au maximum) */
  for(const {s0,s,li,c,c0} of eot("messagere")) if(leader(li)!==s0){
    const g=Math.min(2,6-(c0.msgBonus||0)); if(g>0){ c0.msgBonus=(c0.msgBonus||0)+g; c.pow+=g; (c.mods=c.mods||[]).push({v:g,src:"La Messagère"}); log(`La Messagère d'Hécate · +${g} (${who(s)})`); sfx("buff"); } }
  /* Prométhée : l'énergie non dépensée passe au tour suivant, 10 d'énergie au plus au tour suivant (énergie du tour + réserve + Freyr ; Jordan, 16 octobre : la réserve seule plafonnée à 10 donnait 16 au tour 6) */
  const promes=eot("promethee");
  if(S.turn<6) for(const s of ["p","e"]) if(unspent[s]>0&&!S.biaBlock[s]&&promes.some(x=>x.s===s)){
    const k=Math.min(unspent[s],Math.max(0,10-(S.turn+1)-S.bonus[s])); if(k>0){ S.bonus[s]+=k; log(`Prométhée garde ${k} énergie en réserve (${who(s)})`); sfx("buff"); if(animate){ const e0=promes.find(x=>x.s===s); if(e0) FX.play("promethee",{li:e0.li}); } } }
  /* Cernunnos : à la fin de chaque tour où son camp ne mène pas ici, sa puissance double (8 au maximum) */
  for(const {s0,s,li,c,c0} of eot("cernunnos")) if(leader(li)!==s0&&c0.pow>0&&c0.pow<8&&c.pow>0&&c.pow<8){
    const g=Math.min(8,c.pow*2)-c.pow; c.pow+=g; (c.mods=c.mods||[]).push({v:g,src:"Cernunnos"}); log(`Cernunnos double sa puissance : +${g} (${who(s)})`); sfx("buff"); }
  /* Hélios : à la fin de chaque tour, elle passe dans le lieu immédiatement à droite (jamais de retour) ; tes autres cartes du lieu quitté qui peuvent se déplacer elles-mêmes gagnent +2 */
  for(const {s,li,c} of eot("helios")){ const to=li+1;
    if(to>2||!S.board[s][li].includes(c)||fated(c)||(c.captive&&captorLive(c.captive))||!S.locs[to].rev||S.locs[to].locked||S.board[s][to].length>=capOf(s,to)) continue;
    S.board[s][li]=S.board[s][li].filter(x=>x!==c); S.board[s][to].push(c); flonHook(to,c); log(`Hélios passe vers ${LOCS[S.locs[to].id].name} (${who(s)})`); sfx("legend");
    for(const x of S.board[s][li]) if(x!==c&&live(x)&&SELFMOVE.has(eid(x))){ x.pow+=2; (x.mods=x.mods||[]).push({v:2,src:"Hélios"}); log(`Hélios · +2 à ${nm(x)} (${who(s)})`); } }
  if(S.turn>=2&&S.turn<=4&&!S.rp) aiOath();
  if(hedoneTurn(dflt)&&animate) await wait(500);   /* Hédoné : fin de tour, après tous les autres effets */
  /* L'Enfant sans École : à la fin de chaque tour sauf le sixième, elle retourne dans ta main et gagne +1 définitivement (main pleine : pas de retour, donc pas de gain : Jordan, 22 octobre) */
  if(S.turn<6) for(const {s,li,c,c0} of eot("enfant")) if(!(c0.captive&&captorLive(c0.captive))&&S.board[s][li].includes(c)){
    if(S.hand[s].length<7){ c.pow+=1; (c.mods=c.mods||[]).push({v:1,src:"L'Enfant"}); S.board[s][li]=S.board[s][li].filter(x=>x!==c); c.rev=false; c.fresh=false; S.hand[s].push(c); log(`L'Enfant sans École retourne dans la main, +1 (${who(s)})`); sfx("buff"); }
    else log(`L'Enfant sans École : main pleine, elle reste en jeu (${who(s)})`); }
  if(S.turn>=6) S.final=true;   /* Ananké : la puissance de fin de partie se calcule maintenant, après tout le reste */
  render(); await wait(300);
  for(const s of ["p","e"]) for(const col of S.board[s]) for(const c of col) c.fresh=false;
  S.busy=false;
  if(S.turn>=6){ if(S.rp) rpEnd(); else finish(); } else startTurn();
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
  /* lieu à l'honneur : +25 CHF à la fin de la première partie du jour contre l'IA (victoire ou non) */
  let feat=0; if(S.feat&&qLive()&&P.ld!==today()){ P.ld=today(); feat=FEATURE_CHF; }
  P.chf+=gain+feat; pushHist("IA",res,`IA ${FAC[S.aiFac].n} · ${TIERS[S.aiTier]}`,pw,ew,{gain,lv:P.lv});
  if(S.rec&&S.rec.turns.length===6&&P.hist&&P.hist[0]){ S.rec.t=P.hist[0].t; S.rec.fin=S.locs.map((L,li)=>[total("p",li),total("e",li)]); P.rps=[S.rec,...(P.rps||[])].slice(0,RPS_MAX); }   /* les 3 dernières parties contre l'IA sont rejouables */
  save(); lbPublish();
  S.over={res,rows,pw,ew,pt,et,tie:pw===ew,gain,rk,qDone,feat};
  if(rk.up) setTimeout(()=>sfx("legend"),900);
  endCine(S.over); endMusic(res); setTimeout(()=>sfx("coin"),700);
  render();
}

/* ===== Replay des parties contre l'IA (Jordan, 25 octobre 2026) =====
   On rejoue avec le vrai moteur : mêmes decks (ordre exact), même graine du hasard (gPick / gShuffle), mêmes coups. Aucune écriture dans le profil (pas de stats, de quête, de rang, de CHF). */
const RPS_MAX=3;
function rpStart(t){
  const r=(P.rps||[]).find(x=>x.t===t); if(!r) return false;
  if(S&&!S.over&&!S.blitz&&!S.rp) return false;   /* une vraie partie est en cours : on ne l'écrase pas */
  uidN=0; RNG=mulberry(r.seed);
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:r.locs.map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:r.dp.map(mk), e:r.de.map(mk)}, aiTier:r.tier, aiFac:r.fac,
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null, feat:r.feat||null, rp:{r,auto:false,done:false,ok:null}};
  for(let i=0;i<3;i++){draw("p");draw("e");}
  screen="play"; startTurn(); return true;
}
async function rpStep(){
  if(!S||!S.rp||S.busy||S.rp.done) return;
  const r=S.rp.r, t=r.turns[S.turn-1]; if(!t){ S.rp.done=true; render(); return; }
  const used=new Set(), pick=(side,list)=>list.map(([id,li])=>{ const c=S.hand[side].find(x=>x.id===id&&!used.has(x)); if(c) used.add(c); return c?{c,li}:null; }).filter(Boolean);
  const mp=pick("p",t.p), me=pick("e",t.e);
  if(t.sw){ const c=S.board.p[t.sw[0]].find(x=>eid(x)==="nageuse_lac"); if(c) mp.swim={c,li:t.sw[1],from:t.sw[0]}; }
  await resolveTurn(mp,me,true);
}
function rpEnd(){
  const r=S.rp.r; S.rp.done=true; S.rp.auto=false;
  S.rp.ok=!r.fin||r.fin.every(([a,b],li)=>total("p",li)===a&&total("e",li)===b);
  log(S.rp.ok?"Fin du replay":"Le replay diffère de la partie d'origine (version du jeu différente)"); render();
}
