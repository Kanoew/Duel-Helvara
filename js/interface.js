// Code couleur des mots-clés d'effet (Révélation, Continu, Fatalité) : le mot seul est coloré, avec un symbole pour ne pas dépendre de la couleur
const FXK={"Révélation":"rev","On Reveal":"rev","Continu":"cont","Ongoing":"cont","Fatalité":"fat","Fate":"fat"};
function fxH(t){ return String(t||"").replace(/(^|\. )(Révélation|Continu|Fatalité|On Reveal|Ongoing|Fate)( ?:)/g,(m,a,k,c)=>`${a}<span class="kw kw-${FXK[k]}">${k}</span>${c}`); }
/* Duel d'Helvara : rendu des écrans, interactions et démarrage.
   Extrait d'index.html le 12 octobre 2026 sans aucun changement de code : les fichiers js/ se chargent dans l'ordre d'index.html et partagent la même portée globale. */
/* ======= RENDU ======= */
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
/* Préchargement discret du deck choisi (étape 3) : illustrations des cartes du deck, leurs avatars et le morceau de la prochaine partie,
   en arrière-plan (priorité basse, quand le navigateur est au repos), sans jamais bloquer l'interface. Rien si l'économie de données est active. */
const PRE=new Set(); let preQ=[], preTimer=null;
function preSlow(){ const c=navigator.connection; return !!c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||"")); }
function preAdd(u,audio){ if(u&&!PRE.has(u)){ PRE.add(u); preQ.push([u,audio]); } }
function preRun(){
  preTimer=null; const t0=performance.now();
  while(preQ.length&&performance.now()-t0<8){ const [u,audio]=preQ.shift();
    try{ if(audio) fetch(u,{priority:"low"}).then(r=>r.arrayBuffer()).catch(()=>{}); else { const im=new Image(); im.decoding="async"; im.fetchPriority="low"; im.src=u; } }catch(_){} }
  if(preQ.length) preSched();
}
function preSched(){ if(preTimer) return; preTimer=(window.requestIdleCallback?requestIdleCallback(preRun,{timeout:2500}):setTimeout(preRun,200)); }
function preloadDeck(){
  if(preSlow()||!P||!Array.isArray(P.deck)) return;
  for(const id of P.deck){ const d=CARDS[id]; if(!d||!d.img) continue; preAdd(d.img); preAdd(`images/avatars/${id}.webp?v=7`); }
  if(!nextPlay) nextPlay=Math.random()<.5?"play":"play2"; preAdd(MUSIC[nextPlay],true);
  preSched();
}
let ART_MINI=false; /* vrai pendant le rendu des grilles : illustration réduite (images/mini, 360 × 540) */
const gridArt=fn=>{ ART_MINI=true; try{ return fn(); } finally{ ART_MINI=false; } };
function art(id,light){
  const d=CARDS[id];
  if(ART_MINI&&!d.token&&d.img&&/^images\/[^/]+\.webp/.test(d.img)) return `<div class="art" style="background-image:url('${d.img.replace("images/","images/mini/")}')"></div>`;
  if(light&&light!=="big"&&!d.token&&d.img) return `<div class="art" style="background-image:url('images/avatars/${id}.webp?v=7')"></div>`;
  if(d.token&&d.img) return `<div class="art" style="background-image:url('${d.img}')"></div>`;
  if(d.token) return `<div class="art token-img" style="background-image:url('images/reflet.webp')${id==="illusion"?";filter:sepia(.7) saturate(2.2) hue-rotate(-12deg)":id==="cendreux"?";filter:grayscale(1) sepia(.5) brightness(.7)":id==="lanterne"?";filter:sepia(1) saturate(4) hue-rotate(-25deg) brightness(.8)":""}"></div>`;
  /* grand format : la miniature (déjà vue dans la grille) sert de fond le temps que la grande image arrive, au lieu d'une case sombre */
  if(d.img&&light==="big"&&/^images\/[^/]+\.webp/.test(d.img)) return `<div class="art" style="background-image:url('${d.img}'),url('${d.img.replace("images/","images/mini/")}')"></div>`;
  if(d.img) return `<div class="art" style="background-image:url('${d.img}')"></div>`;
  const mono=d.name.replace(/^(L'|Le |La |Les )/,"").charAt(0);
  return `<div class="art ph" data-mono="${mono}" style="--fc:${FAC[d.fac].c}"></div>`;
}
/* Brillance par rareté : r-R liseré fixe, r-E reflet violet qui balaie, r-L reflet doré et souffle dans l'illustration */
const rarN=id=>{ const u=ULof(id); return u&&u.fac?"Ultra-légendaire de faction":RAR[CARDS[id].r].n; };
const rc=d=>(d.r==="R"||d.r==="E"||d.r==="L")&&!d.token?` r-${d.r}`:"";
/* Effet holo 2.5D sur les petites cartes (main, plateau, grille de la Collection) : une ultra-légendaire de faction garde son effet partout où on la voit.
   tileHolo() pose un emplacement (une clé par carte affichée) ; render() y monte l'effet et le garde d'un redessin à l'autre (au plus quelques instances : une seule ultra-légendaire par deck). */
const hasHoloTile=id=>CARDS[id].r==="U"&&!!holoDir(id);
const tileHolo=(id,key,r,hi)=>hasHoloTile(id)?`<i class="holotile" data-hid="${id}" data-hk="${key}"${r?` data-r="${r}"`:""}${hi?' data-q="hi"':""} aria-hidden="true"></i>`:"";
const HOLO_TILES=new Map();
function holoTilesDetach(){ for(const v of HOLO_TILES.values()) if(v.h&&v.h.el) v.h.el.remove(); }
function holoTilesAttach(root){
  const live=new Set();
  root.querySelectorAll(".holotile").forEach(t=>{
    const k=t.dataset.hk, id=t.dataset.hid, v=HOLO_TILES.get(k); live.add(k);
    if(v&&v.id===id&&v.h) holoMove(v.h,t);
    else{ if(v) holoKill(v.h); HOLO_TILES.set(k,{id,h:holoMount(t,id,Object.assign({idle:true,radius:+t.dataset.r||6},t.dataset.q==="hi"?{}:{quality:"low",maxFps:30}))}); }
  });
  for(const [k,v] of HOLO_TILES) if(!live.has(k)){ holoKill(v.h); HOLO_TILES.delete(k); }
}
function fullCard(id,extra="",powOv=null){
  const d=CARDS[id], F=FAC[d.fac], R=RAR[d.r];
  /* carte holo en grand : l'image fixe n'a plus les animations d'ultra-légendaire (reflet arc-en-ciel, ambiance, inclinaison) : l'effet holo prend la suite et elles apparaissaient quelques instants avant de disparaître */
  const hp=/\b(big|fanh)\b/.test(extra)&&d.r==="U"&&!!holoDir(id);
  const fx=!hp&&/\bbig\b/.test(extra)&&(d.r==="L"||d.r==="U")?` tilt${d.r==="U"&&d.vfx?" amb":""}" data-vfx="${d.vfx||""}`:"";
  const tl=/\btileh\b/.test(extra)&&hasHoloTile(id);
  return `<div class="full ${extra}${d.r==="U"&&!hp&&!tl?" holo":""}${hp?" holopre":""}${tl?" holof":""}${rc(d)}${fx}">${art(id,/\bbig\b/.test(extra)?"big":undefined)}${tl?tileHolo(id,"g"+id):""}${d.r==="L"?'<i class="lgp" aria-hidden="true"></i>':""}<span class="cost">${d.cost}</span>
    <div class="band"><div class="n">${d.name}</div><div class="f"><span style="color:${F.c}">${F.n}</span> · <span style="color:${R.c}">${rarN(id)}</span></div>${d.fx?`<div class="e">${fxH(d.fx)}</div>`:""}</div>
    <span class="pw ${powOv!=null&&powOv>d.pow?"up":powOv!=null&&powOv<d.pow?"down":""}">${powOv!=null?powOv:d.pow}</span></div>`;
}
function thumb(id,act){
  const d=CARDS[id];
  return `<button class="thumb" ${act} aria-label="${d.name}, coût ${d.cost}, puissance ${d.pow}">${art(id)}<span class="cost">${d.cost}</span><span class="pw">${d.pow}</span></button>`;
}
const ICO={
  home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>',
  deck:'<rect x="4" y="6" width="11" height="15" rx="2"/><path d="M9 3h9a2 2 0 0 1 2 2v13"/>',
  shop:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  board:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 20h8"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/><path d="M9 7h6"/>',
  discord:'<path style="fill:currentColor;stroke:none" d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.3 18.3 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.89 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.64-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.23 1.99a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'};
const DISCORD="https://discord.gg/QgxFQGcjGT";
const ico=k=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;
let sheet=null; /* "quests" ou "settings" : panneau ouvert depuis l'en-tête */
const questReady=()=>{ const a=ensureQuests(), b=ensureWeek(); if(a||b) save(); return P.q.list.some(q=>!q.c&&q.p>=QDEF[q.id].n)||(!P.wq.c&&P.wq.p>=WQ.n); };
function header(){
  const ready=questReady();
  const icons=`<button class="helpbtn icobtn${ready?" dot":""}" data-act="sheet" data-s="quests" aria-label="Quêtes du jour">${ico("book")}</button><button class="helpbtn icobtn" data-act="sheet" data-s="settings" aria-label="Réglages">${ico("gear")}</button><button class="helpbtn" data-act="go" data-to="rules" aria-label="Règles" ${screen==="rules"?'aria-current="page"':""}>?</button>`;
  if(screen==="play") return `<header class="top"><button class="back" data-act="go" data-to="home">← Accueil</button><div class="topright">${icons.replace('data-act="go" data-to="rules" aria-label="Règles" >?','data-act="playhelp" aria-label="Règles" aria-pressed="'+(S&&S.help?"true":"false")+'">?')}</div></header>`;
  /* Discord : hors partie seulement, pour ne pas quitter un duel d'un toucher */
  const discord=`<a class="helpbtn icobtn" href="${DISCORD}" target="_blank" rel="noopener" aria-label="Discord du jeu">${ico("discord")}</a>`;
  return `<header class="top"><h1 class="brand">Duel d'Helvara<small>Le Sang de Tiamat</small>${season()?`<small class="ssub">${SEASON[season()].sub}</small>`:""}</h1>
    <div class="topright">${discord}${icons}</div></header>
    <button class="idline" data-act="go" data-to="profile" aria-label="Voir mon profil">${avatarHTML("sm")}<span class="idname">${esc(P.name)}</span><span class="idrank">${rankIcon(P.lv,"sm")}<span>${rankName(P.lv)}</span></span><span class="chfchip">${P.chf} <small>CHF</small></span></button>`;
}
/* Menu principal : barre d'icônes en bas sur téléphone, colonne à gauche sur grand écran. */
function dockHTML(){
  if(screen==="play") return "";
  const tabs=[["home","Accueil"],["deck","Collection"],["shop","Boutique"],["board","Classement"]];
  return `<nav class="dock" aria-label="Menu">${tabs.map(([k,n])=>`<button data-act="go" data-to="${k}" ${screen===k?'aria-current="page"':""} ${k==="shop"&&!P.starter&&P.tuto&&screen!=="shop"?'class="pulse"':""}>${ico(k)}<span>${n}</span></button>`).join("")}</nav>`;
}
function sheetHTML(){
  if(!sheet) return "";
  const body=sheet==="quests"?questsHTML():`<section class="quests"><div class="qhead"><h2>Réglages</h2></div>
    <div class="setrow"><span>Langue</span><button class="langbtn" data-act="lang" aria-label="${LANG==="fr"?"Switch to English":"Passer en français"}"><span class="${LANG==="fr"?"on":""}">FR</span><span class="${LANG==="en"?"on":""}">EN</span></button></div>
    <div class="setrow"><span>Son</span><span class="footbtns"><button class="toggle" data-act="music" aria-pressed="${P.music}">Musique : ${P.music?"activée":"coupée"}</button><button class="toggle" data-act="sfx" aria-pressed="${P.sfx}">Effets : ${P.sfx?"activés":"coupés"}</button></span></div>
    <div class="setrow"><span>Volume de la musique</span><span class="volrow"><input type="range" min="0" max="100" step="5" value="${P.vm??35}" data-vol="vm" aria-label="Volume de la musique"><b data-volv="vm">${P.vm??35}</b></span></div>
    <div class="setrow"><span>Volume des effets</span><span class="volrow"><input type="range" min="0" max="100" step="5" value="${P.vs??100}" data-vol="vs" aria-label="Volume des effets"><b data-volv="vs">${P.vs??100}</b></span></div>
    <div class="setrow"><span>Cinématiques</span><button class="toggle" data-act="cine" aria-pressed="${P.cine!==false}">${P.cine!==false?"Activée":"Coupée"}</button></div>
    <div class="setrow"><span>Tutoriel</span><button class="toggle" data-act="tuto">Revoir le tutoriel</button></div>
    <div class="setrow"><span>Nouveautés</span><button class="toggle" data-act="majshow">Notes de mise à jour</button></div>
    <div class="setacc hint">${accountHTML()}</div>
    ${window.__sandbox?"":`<div class="setrow"><span>Mes données</span><span class="footbtns"><button class="toggle" data-act="gexport">Exporter mes données</button><button class="toggle" data-act="gdelete">Supprimer mon compte</button></span></div>`}
    <div class="setacc hint legal"><a href="${LANG==='en'?'privacy.html':'confidentialite.html'}" target="_blank" rel="noopener">Confidentialité</a> · <a href="${LANG==='en'?'terms.html':'conditions.html'}" target="_blank" rel="noopener">Conditions et mentions légales</a> · <a href="${LANG==='en'?'credits-en.html':'credits.html'}" target="_blank" rel="noopener">Crédits</a></div></section>`;
  return `<div class="veil" data-act="sheetclose"><div class="sheet" data-act="sheetin">${body}<button class="ghost" data-act="sheetclose">Fermer</button></div></div>`;
}

/* --- accueil --- */
function questsHTML(){
  { const a=ensureQuests(), b=ensureWeek(); if(a||b) save(); }
  return `<section class="quests"><div class="qhead"><h2>Quêtes du jour</h2><span class="hint">Nouvelles quêtes dans ${hoursToReset()} h</span></div>
    ${P.q.list.map((q,i)=>{ const d=QDEF[q.id], done=q.p>=d.n;
      return `<div class="quest ${q.c?"claimed":""}">
        <div class="qt"><span>${qText(q)}</span><span class="qr">+${d.r} CHF</span></div>
        <div class="qbar"><i style="width:${Math.round(q.p/d.n*100)}%"></i></div>
        <div class="qfoot"><span class="hint">${q.p} / ${d.n}</span>${q.c?`<span class="hint">Récompense récupérée</span>`:done?`<button class="primary small" data-act="claim" data-i="${i}">Récupérer</button>`:!P.q.rr?`<button class="toggle" data-act="qswap" data-i="${i}">Changer</button>`:""}</div>
      </div>`; }).join("")}
    ${P.q.rr?"":`<p class="hint">Tu peux changer une quête par jour.</p>`}
    <div class="qhead"><h2>Quête de la semaine</h2><span class="hint">Jusqu'à dimanche soir</span></div>
    <div class="quest ${P.wq.c?"claimed":""}">
      <div class="qt"><span>${WQ.t}</span><span class="qr">+${WQ.r} CHF</span></div>
      <div class="qbar"><i style="width:${Math.round(P.wq.p/WQ.n*100)}%"></i></div>
      <div class="qfoot"><span class="hint">${P.wq.p} / ${WQ.n}</span>${P.wq.c?`<span class="hint">Récompense récupérée</span>`:P.wq.p>=WQ.n?`<button class="primary small" data-act="wclaim">Récupérer</button>`:""}</div>
    </div></section>`;
}
function bannerHTML(){
  const dr=DROPS.filter(x=>today()>=x.soon).pop(); if(!dr) return "";
  const live=today()>=dr.rel, id=dr.id+(live?"-live":"-soon"); if(P.dis.includes(id)) return "";
  const n=POOL.filter(x=>CARDS[x].rel===dr.rel).length;
  return `<div class="soonbar ${live?"live":""}"><div><div class="eyebrow">${live?"Nouveau":"Bientôt disponible"}</div>
    <b>${live?`${n} nouvelles cartes sont arrivées à Helvara`:`${n} nouvelles cartes le ${frDate(dr.rel.slice(5))}`}</b>
    <div class="hint">${dr.hint}</div>
    <button class="toggle" data-act="go" data-to="codex">Voir la collection</button></div>
    <button class="xbtn" data-act="dismiss" data-id="${id}" aria-label="Fermer">×</button></div>`;
}
/* Décors saisonniers de l'accueil (dessins SVG, sans image) : toiles et araignée autour de la vitrine, citrouilles sur le bandeau ;
   à Noël, guirlande lumineuse et houx ; au Nouvel An, guirlande dorée. Animations par transform et opacité seulement. */
const WEB=`<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="rgba(225,220,240,.55)" stroke-width=".8">
  <path d="M0 0L120 0M0 0L114 46M0 0L84 84M0 0L46 114M0 0L0 120"/>
  <path d="M24 0Q20 9 22.8 9.2Q17 15 15.6 15.6Q12 19 9.2 22.8Q5 21 0 24"/>
  <path d="M50 0Q42 18 46.4 19Q36 31 32.5 32.5Q26 40 19 46.4Q10 43 0 50"/>
  <path d="M78 0Q66 27 72 29.8Q56 48 50.9 50.9Q40 62 29.8 72Q16 66 0 78"/>
  <path d="M106 0Q92 37 98 40.6Q78 66 69.3 69.3Q56 84 40.6 98Q22 92 0 106"/></g></svg>`;
const PUMPKIN=(f=1)=>`<span class="pk" style="--f:${f}"><i class="pkglow"></i><svg viewBox="0 0 64 56" aria-hidden="true">
  <path d="M31 9c0-4 2-7 6-8l1 2c-3 1-4 3-4 6z" fill="#3f6b2a"/>
  <ellipse cx="18" cy="32" rx="15" ry="20" fill="#c9561a"/><ellipse cx="46" cy="32" rx="15" ry="20" fill="#c9561a"/>
  <ellipse cx="32" cy="32" rx="16" ry="22" fill="#e87424"/><ellipse cx="32" cy="32" rx="7" ry="21" fill="#f08a34" opacity=".55"/>
  <path d="M20 27l6-6 3 7zM44 27l-6-6-3 7zM29 34l3-4 3 4z" fill="#ffd36b"/>
  <path d="M18 40q14 9 28 0l-3 1-2 3-3-2-3 3-3-3-3 3-3-3-2 2-3-3z" fill="#ffd36b"/></svg></span>`;
const SPIDER=`<span class="spider" aria-hidden="true"><i></i><svg viewBox="0 0 30 26"><g stroke="#1a1420" stroke-width="1.4" fill="none" stroke-linecap="round">
  <path d="M15 13L4 6M15 13L2 13M15 13L4 20M15 13L7 25M15 13L26 6M15 13L28 13M15 13L26 20M15 13L23 25"/></g>
  <ellipse cx="15" cy="14" rx="5" ry="6" fill="#1a1420"/><circle cx="15" cy="8" r="3.2" fill="#1a1420"/>
  <circle cx="13.8" cy="7.6" r=".7" fill="#ff8a3a"/><circle cx="16.2" cy="7.6" r=".7" fill="#ff8a3a"/></svg></span>`;
const GARLAND=(gold)=>{ const cols=gold?["#ffe08a","#f6c14b","#fff1c2"]:["#ff5d5d","#ffd36b","#6fd27a","#7cc4ff"]; let b="";
  for(let i=0;i<13;i++){ const x=10+i*40, y=16+Math.sin((i/12)*Math.PI)*34; b+=`<g class="bulb b${i%3}"><circle cx="${x}" cy="${y+7}" r="9" fill="${cols[i%cols.length]}" opacity=".35"/><rect x="${x-2}" y="${y-2}" width="4" height="4" fill="#2b3a2e"/><ellipse cx="${x}" cy="${y+6}" rx="3.6" ry="5" fill="${cols[i%cols.length]}"/></g>`; }
  return `<svg class="garland" viewBox="0 0 500 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 14Q250 70 500 14" fill="none" stroke="${gold?"#9a7a3a":"#2f4a34"}" stroke-width="2.4"/>${b}</svg>`; };
const HOLLY=`<svg viewBox="0 0 60 44" aria-hidden="true"><path d="M30 24C20 8 6 14 2 6c4 10-2 12 4 18-6 2-2 8 6 6 2 8 10 4 18-6z" fill="#2e7d4a"/><path d="M30 24C40 8 54 14 58 6c-4 10 2 12-4 18 6 2 2 8-6 6-2 8-10 4-18-6z" fill="#3b9358"/>
  <circle cx="26" cy="27" r="4.2" fill="#d42a35"/><circle cx="34" cy="27" r="4.2" fill="#e63945"/><circle cx="30" cy="21" r="4.2" fill="#c81f2c"/><circle cx="28.6" cy="19.6" r="1.2" fill="#fff" opacity=".6"/></svg>`;
function seasonDeco(where){ const se=season(); if(!se) return "";
  if(se==="halloween") return where==="fan"?`<div class="sdeco" aria-hidden="true"><span class="web l">${WEB}</span><span class="web r">${WEB}</span></div><div class="sdeco front" aria-hidden="true">${SPIDER}</div>`
    :`<div class="sdeco bar" aria-hidden="true">${PUMPKIN(1)}${PUMPKIN(.72)}<span class="web c">${WEB}</span></div>`;
  if(where==="fan") return `<div class="sdeco" aria-hidden="true">${GARLAND(se==="nouvelan")}</div>`;
  return se==="noel"?`<div class="sdeco bar" aria-hidden="true"><span class="holly">${HOLLY}</span></div>`:"";
}
function seasonBarHTML(){ const se=season(); if(!se) return ""; const T=SEASON[se];
  return `<div class="seasonbar ${se}">${seasonDeco("bar")}<div><div class="eyebrow">${T.eyebrow}</div><b>${T.title}</b><div class="hint">${T.hint}</div></div>${P.starter?`<button class="primary small" data-act="seasonpack" data-pid="${se}">${T.btn}</button>`:""}</div>`; }
let ulLater=false, deckRename=false;
let histFilter="all", histOpen=new Set();
function histHTML(){
  const back=`<button class="ghost small" data-act="go" data-to="profile">← Profil</button>`;
  if(!P.hist||!P.hist.length) return `<div class="histpage"><section class="sec">${back}<h2>Historique des matchs</h2>
    <div class="hempty"><p>Aucune partie enregistrée pour l'instant.</p><p>Tes 20 dernières parties apparaîtront ici.</p></div></section></div>`;
  const ago=t=>{ const m=Math.round((Date.now()-t)/6e4); return m<1?"à l'instant":m<60?`il y a ${m} min`:m<1440?`il y a ${Math.round(m/60)} h`:`il y a ${Math.round(m/1440)} j`; };
  const dateStr=t=>new Date(t).toLocaleDateString(LANG==="en"?"en-GB":"fr-CH",{day:"numeric",month:"short",year:"numeric"});
  const list=histFilter==="all"?P.hist:P.hist.filter(h=>h.mode===histFilter);
  const cnt=r=>P.hist.filter(h=>h.res===r).length, wins=cnt("win");
  const modes=[...new Set(P.hist.map(h=>h.mode))];
  return `<div class="histpage"><section class="sec">${back}
    <h2>Historique des matchs</h2>
    <div class="hstats">
      <div class="hs win"><div class="v">${wins}</div><div class="k">Victoires</div></div>
      <div class="hs lose"><div class="v">${cnt("lose")}</div><div class="k">Défaites</div></div>
      <div class="hs"><div class="v">${cnt("draw")}</div><div class="k">Égalités</div></div>
      <div class="hs"><div class="v">${Math.round(wins/P.hist.length*100)} %</div><div class="k">Victoires en %</div></div>
    </div>
    ${modes.length>1?`<div class="hfilter"><button data-act="hfilt" data-f="all" aria-pressed="${histFilter==="all"}">Tout</button>${modes.map(m=>`<button data-act="hfilt" data-f="${esc(m)}" aria-pressed="${histFilter===m}">${esc(m)}</button>`).join("")}</div>`:""}
    ${list.length?list.map(h=>{
      const hasLocs=h.locs&&h.locs.length, hasCards=h.cards&&h.cards.length, more=hasLocs||hasCards, open=more&&histOpen.has(h.t);
      return `<div class="hcard ${h.res} ${open?"open":""}">
        <div class="hsummary" ${more?`data-act="htoggle" data-t="${h.t}" role="button" aria-expanded="${!!open}"`:""}>
          <span class="hres ${h.res}">${h.res==="win"?"Victoire":h.res==="lose"?"Défaite":"Égalité"}</span>
          <span class="hinfo">
            <span class="htop"><span class="hmode-tag">${esc(h.mode)}</span><b>${esc(h.sc)}</b><span>${esc(h.opp)}</span></span>
            <span class="hbot">${h.deck?`<span>${esc(h.deck)}</span>`:""}<span>${dateStr(h.t)}</span><span>${ago(h.t)}</span></span>
          </span>
          ${more?`<span class="hchev" aria-hidden="true">▾</span>`:""}
        </div>
        ${more?`<div class="hdetail">
          ${hasLocs?`<div class="hlocs">${h.locs.map(l=>`<div class="hloc ${l.w==="p"?"won":l.w==="e"?"lost":""}"><div class="ln">${esc(LOCS[l.id].name)}</div><div class="lsc"><span class="me">${l.p}</span> – <span class="foe">${l.e}</span></div></div>`).join("")}</div>`:""}
          ${h.pt||h.et?`<div class="hrank"><span>Puissance totale :</span> ${h.pt} – ${h.et}${h.lv!=null?` · <span>Rang :</span> ${rankName(h.lv)}`:""}</div>`:""}
          ${h.gain?`<div class="hgain">+${h.gain} CHF</div>`:""}
          ${hasCards?`<div class="hdeck">${h.cards.filter(id=>CARDS[id]).map(id=>`<div class="mini" title="${esc(CARDS[id].name)}"><img src="images/avatars/${id}.webp" alt="${esc(CARDS[id].name)}" loading="lazy"></div>`).join("")}</div>`:""}
        </div>`:""}
      </div>`;
    }).join(""):`<p class="hint">Aucune partie pour ce filtre.</p>`}
  </section></div>`;
}
function pruneUL(){ let m=""; for(const u of ULS) if(P.deck.includes(u.id)&&!ulOk(u,P.deck)){ P.deck=P.deck.filter(x=>x!==u.id); m=`${CARDS[u.id].name} a quitté le deck : elle exige ${u.n}.`; } return m; }
/* Notes de mise à jour : une fois par version, à l'accueil (jamais en partie, pendant un paquet ou le tutoriel) ; « Notes de mise à jour » dans les Réglages la rouvre */
let majOpen=false;
function majHTML(){
  const m=MAJ[0]; if(!m||screen==="play"||!P.tuto||(!majOpen&&P.maj===m.id)) return "";
  return `<div class="veil"><div class="result majpop" role="dialog" aria-label="Notes de mise à jour">
    <div class="eyebrow"><span>Notes de mise à jour</span> · <span>${m.date}</span></div><h2>Équilibrage</h2>
    <ul class="majlist">${m.items.map(t=>`<li>${t}</li>`).join("")}</ul>
    <button class="primary" data-act="majok">Compris</button></div></div>`;
}
function ulHTML(){
  if(ulLater||screen==="play") return "";
  const u=ULS.find(u=>REL(u.id)&&!P.owned.includes(u.id)&&ulEarned(u)); if(!u) return "";
  return `<div class="veil"><div class="result ulpop" role="dialog" aria-label="Ultra-légendaire">
    <div class="eyebrow">${u.fac?"Ultra-légendaire de faction":"Fusion disponible"}</div><h2>${CARDS[u.id].name}</h2>
    <div class="ulcard">${fullCard(u.id)}</div>
    <p class="hint">${u.quest?`Ton journal est complet : ${u.quest.n} parties ${u.quest.k==="nikev"?"avec Nike pendant la Saint-Valentin":`avec la faction ${FAC[u.fac].n}`}. ${CARDS[u.id].name} rejoint ta faction.`:u.fac?`Ta collection compte assez de cartes ${FAC[u.fac].n}. ${CARDS[u.id].name} rejoint ta faction.`:`Tu possédais déjà ${u.n} : leur fusion ultra-légendaire t'attend.`}</p>
    <button class="primary" data-act="ulclaim" data-id="${u.id}">Réclamer la carte</button><button class="ghost" data-act="ullater">Plus tard</button></div></div>`;
}
function fanIds(){
  const own=P.fan.filter(id=>P.owned.includes(id));
  if(own.length===3) return own;
  const f=[...(P.deck.length?P.deck:["yarden","izzy","celeste"])].sort((a,b)=>CARDS[b].cost-CARDS[a].cost).slice(0,3);
  return f.map((_,i)=>f[(i+vIdx)%f.length]);
}
/* La vitrine tourne : la carte du centre devient la première, et le choix est gardé. */
function fanRotate(step){
  const own=P.fan.filter(id=>P.owned.includes(id));
  if(own.length===3){ P.fan=step>0?[own[1],own[2],own[0]]:[own[2],own[0],own[1]]; save(); }
  else vIdx=(vIdx+(step>0?1:2))%3;
  sfx("select"); render();
}
function vitrineHTML(){
  const fan=fanIds(), order=fan.length===3?[fan[2],fan[0],fan[1]]:fan, pos=fan.length===3?[-1,0,1]:fan.map((_,i)=>i);
  return `<section class="vitrinewrap">${seasonDeco("fan")}<div class="fan"${fan.length===3?' data-n="3"':""} aria-label="Vitrine : glisse pour faire tourner les cartes">${order.map((id,k)=>{ const h=!!holoDir(id)&&CARDS[id].r==="U"; return `<button class="fcard" data-act="fantap" data-pos="${pos[k]}" data-id="${id}" aria-label="${pos[k]===0?"Agrandir ":"Mettre en avant "}${CARDS[id].name}">${fullCard(id,h?"fanh":"")}${h?tileHolo(id,"f"+id,12,true):""}</button>`; }).join("")}</div>
    <div class="vfoot"><span class="hint">Glisse pour faire tourner</span><button class="ghost small" data-act="fanpick">Choisir mes cartes</button></div></section>`;
}
let vIdx=0;
function homeHTML(){
  const inGame=S && !S.over && !S.blitz;
  const played=P.w+P.l+P.d, splayed=P.sw+P.sl+P.sd;
  return `
  ${seasonNote?`<div class="notice">${seasonNote}</div>`:""}${dailyNote?`<div class="notice">${dailyNote}</div>`:""}
  ${migratedNote?`<div class="notice">${migratedNote}</div>`:""}
  ${vitrineHTML()}
  <div class="hint playhint top">${deckReady()?(played?`Cette saison : ${splayed?Math.round(P.sw/splayed*100):0} % de victoires`:"Première partie : la Ruelle, le Lac Ouchy et le Sous-gare."):(P.owned.length<ECO.deckSize?"Ouvre la Première Brûlure à la boutique pour obtenir ton premier deck.":`Ton deck a ${P.deck.length} carte${P.deck.length>1?"s":""} sur 12. Complète-le dans la Collection pour jouer.`)}</div>
  <button class="play" data-act="${inGame?"resume":"play"}" ${deckReady()||inGame?"":"disabled"}>${inGame?(S.mp?"Reprendre le duel":"Reprendre la partie"):"Jouer"}</button>
  <div class="modes">
    <button class="qcard duelcard bzcard" data-act="go" data-to="blitz"><span class="t">Blitz</span><span class="m">${P.bz.run&&!P.bz.run.over?`En cours · ${P.bz.run.wins} victoire${P.bz.run.wins>1?"s":""} sur 3`:bzFree()?"Partie gratuite du jour":`Gratuit dans ${hoursToReset()} h`}</span></button>
    <button class="qcard duelcard" data-act="go" data-to="duel"><span class="t">Duel entre amis</span><span class="m">${S&&S.mp&&!S.over?`En cours contre ${esc(S.mp.oppNick)}`:mpSession()?"Un duel peut être repris":"Crée un salon"}${P.dw+P.dl+P.dd?` · ${P.dw} V · ${P.dl} D · ${P.dd} É`:""}</span></button>
  </div>
  ${seasonBarHTML()}
  ${bannerHTML()}
`;
}

/* --- profil --- */
function journalHTML(){
  /* une ligne par ultra-légendaire de faction, dans l'ordre des seuils (50, puis 150) ; la seconde n'apparaît qu'à sa date d'annonce */
  const rows=Object.entries(FAC).flatMap(([k,F])=>{ const us=ULS.filter(x=>x.quest&&x.quest.k===k).sort((a,b)=>a.quest.n-b.quest.n), out=[];
    const first=us[0], rowOf=(u,label)=>{ const n=u?u.quest.n:50, v=Math.min(fjGet(k),n), known=!!u&&SHOWN(u.id);
      const goal=known?(P.owned.includes(u.id)?`${CARDS[u.id].name} · obtenue`:`Récompense : ${CARDS[u.id].name}`):"Récompense : une ultra-légendaire, bientôt";
      return `<div class="fjrow"><div class="fjtop"><b style="color:${F.c}">${label}</b><span>${known?`${v}/${n}`:`${fjGet(k)} partie${fjGet(k)>1?"s":""}`}</span></div><div class="fjbar"><i style="width:${Math.round(v/n*100)}%;background:${F.c}"></i></div><small>${goal}</small></div>`; };
    out.push(rowOf(first,F.n));
    for(const u of us.slice(1)) if(SHOWN(u.id)) out.push(rowOf(u,`${F.n} · seconde ultra-légendaire`));
    return out; });
  /* Nike de la Saint-Valentin : la quête est visible et compte dès le 1er février (Jordan, 22 octobre), la carte n'est nommée qu'à son annonce (le 9) et sort le 14 */
  const nv=ULof("nike_v"), nvKnown=!!nv&&SHOWN(nv.id);
  if(nv&&(nvKnown||inWin(VALENTIN))){ const v=Math.min(fjGet("nikev"),nv.quest.n), g=fjGet("nikev");
    rows.push(`<div class="fjrow"><div class="fjtop"><b style="color:#f2a7c8">Saint-Valentin · avec Nike</b><span>${nvKnown?`${v}/${nv.quest.n}`:`${g} partie${g>1?"s":""}`}</span></div><div class="fjbar"><i style="width:${nvKnown?Math.round(v/nv.quest.n*100):0}%;background:#f2a7c8"></i></div><small>${nvKnown?(P.owned.includes(nv.id)?`${CARDS[nv.id].name} · obtenue`:`Récompense : ${CARDS[nv.id].name}`):"Récompense : une ultra-légendaire, bientôt"}</small></div>`); }
  return `<section class="sec journal"><h2>Journal des factions</h2><p class="hint">Une partie compte quand ton deck contient au moins 8 cartes d'une faction (IA, Blitz et duels).</p>${rows.join("")}</section>`;
}
function profileHTML(){
  const played=P.w+P.l+P.d;
  const nameBlock = editName
    ? `<form class="namerow" id="nameform"><input id="name-input" maxlength="24" value="${esc(P.name)}" aria-label="Ton nom" autocomplete="off"><button class="primary small" type="submit">Enregistrer</button><button class="ghost small" type="button" data-act="cancelname">Annuler</button></form>`
    : `<div class="namerow"><button class="ghost small" data-act="editname">Changer de nom</button></div>`;
  return `<section class="sec who">
      <div class="idrow">
        <button class="avbtn" data-act="avpick" aria-label="Changer d'avatar">${avatarHTML("lg")}<span class="avedit">Changer</span></button>
        <div class="idtext"><div class="eyebrow">${season()?SEASON[season()].who:"Joueur d'Helvara"}</div><h2 class="pname">${esc(P.name)}</h2></div>
      </div>
      ${nameBlock}
      <div class="rankcard">
        <div class="eyebrow">${seasonLabel()} · ${daysLeft()} jour${daysLeft()>1?"s":""} restant${daysLeft()>1?"s":""}</div>
        <div class="rkrow">${rankIcon(P.lv,"md")}<div><div class="rk">${rankName(P.lv)}</div>${starsHTML(P.lv,P.st)}</div></div>
        <div class="m">Meilleur rang ce mois : ${rankName(P.best)}${P.streak>=2?` · série de ${P.streak} victoires`:""}</div>
      </div>
      <div class="stats">
        <div class="stat gold"><div class="v">${P.chf}</div><div class="k">CHF</div></div>
        <div class="stat"><div class="v">${P.sw}</div><div class="k">Victoires</div></div>
        <div class="stat"><div class="v">${P.sl}</div><div class="k">Défaites</div></div>
        <div class="stat"><div class="v">${P.sd}</div><div class="k">Égalités</div></div>
      </div>
      <div class="hint">Ces chiffres comptent les parties classées de la saison.<br>Depuis le début : ${played?`${P.w} V · ${P.l} D · ${P.d} É`:"aucune partie"} · Duels entre amis : ${P.dw} V · ${P.dl} D · ${P.dd} É · Collection : ${P.owned.length}/${avail().length} cartes.</div>
    </section>
    ${journalHTML()}<section class="sec"><button class="toggle" data-act="go" data-to="hist">Historique complet des matchs →</button></section>`;
}

/* --- deck --- */
/* Filtres de la collection : faction, coût, rareté et possession se combinent */
const COST_KEYS=["0","1","2","3","4","5","6"], RAR_KEYS=["C","R","E","L","U"];
const filtersOn=()=>filtCount()>0||normQ(searchQ).trim()!=="";
/* Recherche par mot-clé : tous les mots doivent se trouver dans le nom, l'effet, la faction ou la rareté (sans accents ni majuscules) */
const normQ=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function searchOK(id,q=searchQ){
  const w=normQ(q).split(/\s+/).filter(Boolean); if(!w.length) return true;
  const d=CARDS[id], hay=normQ([d.name,d.fx,FAC[d.fac].n,RAR[d.r].n,"cout "+d.cost,"puissance "+d.pow].join(" "));
  return w.every(x=>hay.includes(x));
}
const filtCount=()=>[deckFilter,costFilter,rarFilter,ownFilter].filter(x=>x!=="all").length;
function collMatch(id){
  const d=CARDS[id];
  if(!searchOK(id)) return false;
  if(deckFilter!=="all"&&d.fac!==deckFilter) return false;
  if(costFilter!=="all"&&(costFilter==="6"?d.cost<6:d.cost!==+costFilter)) return false;
  if(rarFilter!=="all"&&d.r!==rarFilter) return false;
  if(ownFilter==="owned"&&!P.owned.includes(id)) return false;
  if(ownFilter==="missing"&&P.owned.includes(id)) return false;
  return true;
}
function filterChips(){
  const chip=(act,cur,k,label,col)=>`<button class="chipbtn" aria-pressed="${cur===k}" data-act="${act}" data-f="${k}" ${col?`style="--cc:${col}"`:""}>${label}</button>`;
  const row=(label,html)=>`<div class="fgroup"><span class="flabel">${label}</span><div class="chips">${html}</div></div>`;
  return row("Faction",[["all","Toutes"],...Object.entries(FAC).map(([k,v])=>[k,v.n])].map(([k,n])=>chip("filter",deckFilter,k,n,k!=="all"&&FAC[k].c)).join(""))
    +row("Coût",chip("fcost",costFilter,"all","Tous")+COST_KEYS.map(k=>chip("fcost",costFilter,k,k==="6"?"6+":k)).join(""))
    +row("Rareté",chip("frar",rarFilter,"all","Toutes")+RAR_KEYS.map(k=>chip("frar",rarFilter,k,k==="U"?"Ultra":RAR[k].n,RAR[k].c)).join(""))
    +row("Possession",[["all","Toutes"],["owned","Possédées"],["missing","Manquantes"]].map(([k,n])=>chip("fown",ownFilter,k,n)).join(""));
}
/* Panneau « Filtrer » (comme dans un tableur) : les choix s'ouvrent à la demande */
function filtHTML(){
  if(!filtOpen||screen!=="deck") return "";
  const n=POOL.filter(id=>SHOWN(id)&&collMatch(id)).length;
  return `<div class="veil" data-act="filtclose"><div class="result filtpanel" role="dialog" aria-label="Filtrer les cartes">
    <h2>Filtrer les cartes</h2>${filterChips()}
    <div class="row2"><button class="ghost" data-act="freset" ${filtersOn()?"":"disabled"}>Réinitialiser</button><button class="primary" data-act="filtclose">Voir ${n} carte${n>1?"s":""}</button></div></div></div>`;
}
/* Une carte de la collection : toucher = la lire en grand (avec Ajouter / Retirer), le petit bouton « Deck » = ajouter ou retirer d'un geste */
function collCard(id,full){
  if(!P.owned.includes(id)) return lockedCard(id);
  const inn=P.deck.includes(id), off=!inn&&full, nm=CARDS[id].name;
  return `<div class="pick ${inn?"in":""} ${off?"off":""}" data-lp="z${id}"><button class="pickmain" data-act="zoom" data-id="${id}" aria-label="Voir ${esc(nm)}">${fullCard(id,"tileh")}</button>
    <button class="qadd ${inn?"on":""}" data-act="toggle" data-id="${id}" aria-pressed="${inn}" aria-label="${inn?"Retirer du deck":"Ajouter au deck"} : ${esc(nm)}">${inn?"✓ Deck":"+ Deck"}</button></div>`;
}
function collSort(){ return POOL.filter(id=>SHOWN(id)&&collMatch(id)).sort((a,b)=>(P.owned.includes(b)-P.owned.includes(a))||CARDS[a].cost-CARDS[b].cost||CARDS[a].name.localeCompare(CARDS[b].name)); }
function collGridHTML(){ const full=P.deck.length>=ECO.deckSize, coll=collSort();
  return gridArt(()=>coll.map(id=>collCard(id,full)).join(""))||`<p class="hint">${filtersOn()?"Aucune carte ne correspond à ces filtres.":"Aucune carte de cette faction pour l'instant."}</p>`; }
function collInfoHTML(){ const n=collSort().length;
  return filtersOn()?`<span>${n} carte${n>1?"s":""} affichée${n>1?"s":""}</span><button class="ghost small" data-act="freset">Réinitialiser</button>`:""; }
/* Mini-deck toujours visible : 12 cases, toucher une case = lire la carte */
function deckMiniHTML(){
  const sorted=[...P.deck].sort((a,b)=>CARDS[a].cost-CARDS[b].cost||CARDS[a].pow-CARDS[b].pow);
  return Array.from({length:ECO.deckSize},(_,i)=>sorted[i]?`<button class="dm" data-act="zoom" data-id="${sorted[i]}" aria-label="${esc(CARDS[sorted[i]].name)}">${art(sorted[i],true)}<span class="c">${CARDS[sorted[i]].cost}</span></button>`:`<span class="dm empty"></span>`).join("");
}
function deckHTML(){
  const sorted=[...P.deck].sort((a,b)=>CARDS[a].cost-CARDS[b].cost||CARDS[a].pow-CARDS[b].pow);
  const slots=[]; for(let i=0;i<ECO.deckSize;i++) slots.push(sorted[i]?thumb(sorted[i],`data-act="zoom" data-id="${sorted[i]}" data-lp="z${sorted[i]}"`):`<div class="thumb empty"></div>`);
  const avg=P.deck.length?(P.deck.reduce((a,id)=>a+CARDS[id].cost,0)/P.deck.length).toFixed(1):"–";
  const full=P.deck.length>=ECO.deckSize;
  const facCount=Object.keys(FAC).map(k=>[k,P.deck.filter(id=>CARDS[id].fac===k).length]).filter(x=>x[1]);
  const D=P.decks[P.di];
  return `
  <section class="sec decksec">
    <div class="decktabs">${P.decks.map((d,i)=>`<button class="decktab ${i===P.di?"on":""}" data-act="deckpick" data-i="${i}" style="background-image:linear-gradient(180deg,rgba(8,12,20,.05),rgba(8,12,20,.9) 75%),url('images/decks/${d.cover}.webp');${d.cover==="primordial"?"background-size:130% auto;background-position:center 85%":""}" aria-pressed="${i===P.di}"><span class="dn">${esc(d.name)}</span><span class="dc">${(i===P.di?P.deck:d.cards).length}/12${i===P.di?" · actif":""}</span></button>`).join("")}</div>
    <div class="deckedit">${deckRename?`<form class="namerow" id="deckform"><input id="deck-input" maxlength="20" value="${esc(D.name)}" aria-label="Nom du deck" autocomplete="off"><button class="primary small" type="submit">OK</button></form>`:`<button class="ghost small" data-act="deckrename">Renommer</button>`}<button class="ghost small" data-act="deckcover">Changer l'illustration</button></div>
  </section>
  <section class="sec">
    <div class="deckhead"><h2>${esc(D.name)}</h2><span class="count ${full?"ok":""}">${P.deck.length} / 12</span></div>
    <p>Touche une carte pour la lire en grand, puis ajoute-la ou retire-la. Une seule copie par carte. Coût moyen : ${avg}${facCount.length?` · ${facCount.map(([k,n])=>`<span style="color:${FAC[k].c}">${FAC[k].n} ${n}</span>`).join(" · ")}`:""}.</p>
    <div class="strip">${slots.join("")}</div>
    ${deckMsg?`<p style="color:var(--warm);margin-top:8px">${deckMsg}</p>`:""}
  </section>
  <section class="sec">
    <h2>Toutes les cartes · ${P.owned.length}/${avail().length}</h2>
    <div class="collbar2"><div class="dmrow"><div class="dmini" id="dmini">${deckMiniHTML()}</div><b class="dmcount ${full?"ok":""}">${P.deck.length}/${ECO.deckSize}</b></div>
      <div class="srow"><input id="coll-search" type="search" value="${esc(searchQ)}" placeholder="Rechercher : nom, effet, mot-clé…" aria-label="Rechercher une carte" autocomplete="off" enterkeyhint="search"><button class="ghost ${filtCount()?"on":""}" data-act="filtopen" aria-haspopup="dialog">Filtrer${filtCount()?` · ${filtCount()}`:""}</button></div></div>
    <div class="fresult" id="collinfo">${collInfoHTML()}</div>
    <p class="hint">Touche une carte pour la lire en grand et l'ajouter au deck. Le bouton « + Deck » l'ajoute d'un geste. Les cartes grisées restent à trouver.</p>
    <div class="grid" id="collgrid">${collGridHTML()}</div>
  </section>
  ${locsHTML()}
  <button class="play" data-act="play" ${deckReady()?"":"disabled"}>${deckReady()?"Jouer avec ce deck":`Encore ${12-P.deck.length} carte${12-P.deck.length>1?"s":""} à ajouter`}</button>`;
}

/* --- boutique --- */
function shopHTML(){
  const av=avail(), owned=av.filter(id=>P.owned.includes(id)).length, tot=av.length, lp=lastPack;
  const missOf=pk=>pk.starter?1:packMissing(pk).length+ulPool(pk).length;
  const tiles=PACKS.filter(pk=>!(pk.starter&&P.starter)&&(inWin(pk.win)||soonWin(pk.win))).sort((a,b)=>(b.id===packFocus)-(a.id===packFocus)||(missOf(a)?0:1)-(missOf(b)?0:1)).map(pk=>{
    const miss=pk.starter?0:missOf(pk), done=!pk.starter&&!miss, missN=pk.starter?0:packMissing(pk).length, ulN=pk.starter?0:ulPool(pk).length;
    const open=inWin(pk.win), gate=!pk.starter&&!P.starter, lack=pk.price-P.chf, ok=lack<=0&&open&&!gate&&!done;
    return `<article class="packtile ${done?"done":""} ${pk.starter?"starter":""} ${(pk.starter&&hlStarter)||pk.id===packFocus?"hl":""}" data-pid="${pk.id}">
      <div class="pack" role="img" aria-label="${pk.name}" style="background-image:url('${pk.img}')"></div>
      <div class="pbody">
        <div class="eyebrow">${pk.starter?"Pack de départ · 12 cartes":pk.win?`Édition limitée · ${pk.n} cartes`:`${pk.n} cartes`}</div>
        <h3 class="pname2">${pk.name}</h3>
        <p class="pdesc">${pk.desc}</p>
        ${pk.odds?`<div class="odds">${pk.odds.map(([r,w])=>`<span style="color:${RAR[r].c}">${w} %</span><span>${RAR[r].n} · doublon +${ECO.dup[r]}</span>`).join("")}${pk.ul?`<span style="color:${RAR.U.c}">${pk.ul} %</span><span>${RAR.U.n} · par paquet</span>`:""}</div>
        <div class="hint">${missN?`${missN} carte${missN>1?"s":""} de ces raretés à trouver · au moins une nouvelle par pack`:ulN?"Tu as déjà toutes les cartes de ces raretés : une fusion peut encore sortir":"Tu as déjà toutes les cartes de ces raretés"}${missN&&ulN?` · ${ulN} fusion${ulN>1?"s":""} à trouver`:""}</div>
        ${pk.pity?`<div class="hint">Garantie : une fusion à la ${pk.pity}e ouverture${(P.pity||0)>0?` · prochaine garantie dans ${Math.max(1,pk.pity-(P.pity||0))} ouverture${pk.pity-(P.pity||0)>1?"s":""}`:""}</div>`:""}`:""}
        <div class="buyrow"><span class="price">${pk.price} CHF</span>
          <button class="primary" data-act="buy" data-pid="${pk.id}" ${ok?"":"disabled"}>${done?"Collection complète":!open?`Dès le ${frDate(pk.win[0])}`:gate?"Ouvre d'abord la Première Brûlure":lack>0?`Il manque ${lack} CHF`:"Acheter et ouvrir"}</button></div>
        ${pk.win?`<div class="hint">${open?"Disponible jusqu'au ":"Du "+frDate(pk.win[0])+" au "}${frDate(pk.win[1])}</div>`:""}
      </div></article>`; }).join("");
  return `
  ${hlStarter?`<div class="notice">Voilà tes 100 CHF. Achète la <b>Première Brûlure</b> : 12 cartes pour construire ton premier deck.</div>`:""}
  ${lp?`<section class="sec"><h2>${lp.name}</h2>
    <div class="opened ${lp.res.length>3?"many":""}">${lp.res.map((r,k)=>`<div class="cell" style="--d:${(k*(lp.res.length>3?.12:.35)).toFixed(2)}s">${fullCard(r.id,CARDS[r.id].r==="L"&&r.isNew?"legend":"")}<span class="badge ${r.isNew?"new":"dup"}">${r.isNew?"Nouvelle":`Doublon · +${r.v} CHF`}</span></div>`).join("")}</div>
    <div class="row2" style="margin-top:12px">${lp.pid==="brulure"?`<button class="primary" data-act="go" data-to="deck">Voir mon deck</button>`:lp.res.some(r=>r.isNew)?`<button class="ghost" data-act="go" data-to="deck">Ajouter à mon deck</button>`:""}</div>
  </section>`:""}
  ${stallHTML()}
  <div class="packs">${tiles}</div>
  <section class="collbar"><div class="qt"><span>Collection</span><b>${owned} / ${tot}</b></div>
    <div class="progress"><i style="width:${Math.round(owned/tot*100)}%"></i></div>
    <div class="hint">Victoire +${ECO.win} · égalité +${ECO.draw} · défaite +${ECO.loss} CHF</div></section>`;
}

/* --- ouverture de pack --- */
/* --- vitrine de l'accueil --- */
/* Vitrine : recherche par mot-clé (même règle que la collection) et filtre par faction ; seule la grille est redessinée à la frappe (le clavier reste ouvert) */
let fanQ="", fanFac="all", fanTimer=null;
function fanGridHTML(){
  const ids=POOL.filter(id=>P.owned.includes(id)&&searchOK(id,fanQ)&&(fanFac==="all"||CARDS[id].fac===fanFac)).sort((a,b)=>CARDS[b].cost-CARDS[a].cost||CARDS[a].name.localeCompare(CARDS[b].name));
  if(!ids.length) return `<p class="hint">Aucune carte ne correspond à ces filtres.</p>`;
  return ids.map(id=>{ const k=fanPick.indexOf(id);
      return `<button class="fanopt ${k>=0?"on":""}" data-act="fantoggle" data-id="${id}" aria-pressed="${k>=0}" aria-label="${CARDS[id].name}"><span class="thumb">${art(id)}<span class="cost">${CARDS[id].cost}</span><span class="pw">${CARDS[id].pow}</span></span>${k>=0?`<span class="fannum">${k+1}</span>`:""}</button>`; }).join("");
}
function fanPickHTML(){
  if(!fanPick) return "";
  const chip=(k,n,col)=>`<button class="chipbtn" aria-pressed="${fanFac===k}" data-act="fanfac" data-f="${k}" ${col?`style="--cc:${col}"`:""}>${n}</button>`;
  return `<div class="veil"><div class="result avpanel" role="dialog" aria-label="Cartes affichées">
    <h2>Ta vitrine</h2><p class="hint">Choisis les 3 cartes affichées sur l'accueil · ${fanPick.length}/3. La première choisie passe au centre.</p>
    <div class="fanbar"><input id="fan-search" type="search" value="${esc(fanQ)}" placeholder="Rechercher : nom, effet, mot-clé…" aria-label="Rechercher une carte" autocomplete="off" enterkeyhint="search">
      <div class="chips">${chip("all","Toutes")}${Object.entries(FAC).map(([k,v])=>chip(k,v.n,v.c)).join("")}</div></div>
    <div class="fangrid" id="fangrid">${fanGridHTML()}</div>
    <div class="row2"><button class="ghost" data-act="fanclose">Annuler</button><button class="primary" data-act="fansave" ${fanPick.length===3?"":"disabled"}>Valider</button></div>
  </div></div>`;
}

/* --- carte agrandie --- */
function zoomHTML(){
  if(!zoomId) return ""; const d=CARDS[zoomId], F=FAC[d.fac], R=RAR[d.r];
  return `<div class="veil" data-act="unzoom"><div class="zoomwrap">${holoDir(zoomId)?`<div class="holoslot" id="holoslot" data-act="holoin">${fullCard(zoomId,"big")}</div>`:fullCard(zoomId,"big")}
    <div class="zoominfo"><div class="t">${d.name}</div><div class="m"><span style="color:${F.c}">${F.n}</span> · <span style="color:${R.c}">${rarN(zoomId)}</span> · coût ${d.cost} · puissance ${d.pow}</div>${d.fx?`<p>${fxH(d.fx)}</p>`:""}
    ${screen==="deck"&&P.owned.includes(zoomId)&&!d.token?`<p class="deckstate ${P.deck.includes(zoomId)?"in":""}">${P.deck.includes(zoomId)?`Dans ton deck · ${P.deck.length}/${ECO.deckSize}`:`Pas dans ton deck · ${P.deck.length}/${ECO.deckSize}`}</p>${deckMsg?`<p class="deckmsg">${deckMsg}</p>`:""}<button class="primary" data-act="toggle" data-id="${zoomId}">${P.deck.includes(zoomId)?"Retirer du deck":"Ajouter au deck"}</button>`:""}
    <div class="row2"><button class="ghost" data-act="unzoom">Fermer</button>${P.owned.includes(zoomId)&&P.avatar!==zoomId?`<button class="ghost" data-act="avset" data-id="${zoomId}">En faire mon avatar</button>`:""}</div></div></div></div>`;
}

/* --- avatars --- */
function avPickHTML(){
  if(!avPick) return "";
  const ids=avail().sort((a,b)=>(P.owned.includes(b)-P.owned.includes(a))||CARDS[a].name.localeCompare(CARDS[b].name));
  return `<div class="veil" data-act="avclose"><div class="result avpanel" role="dialog" aria-label="Choisir un avatar">
    <h2>Avatar</h2><p class="hint">Chaque carte de ta collection débloque son portrait · ${P.owned.length}/${avail().length}</p>
    <div class="avgrid">${ids.map(id=>{ const own=P.owned.includes(id);
      return `<button class="avopt ${P.avatar===id?"on":""}" ${own?`data-act="avset" data-id="${id}"`:"disabled"} aria-label="${CARDS[id].name}${own?"":" (verrouillé)"}">
        <span class="avatar md ${own?"":"locked"}" style="background-image:url('images/avatars/${id}.webp?v=7')"></span><span class="avn">${own?CARDS[id].name:"?"}</span></button>`; }).join("")}</div>
    <button class="ghost" data-act="avclose">Fermer</button></div></div>`;
}

/* --- tutoriel --- */
function tutoHTML(){
  if(tutoStep<0) return ""; const reward=!P.tuto;
  return `<div class="veil"><div class="result tuto" role="dialog" aria-label="Bienvenue à Helvara">
    <div class="eyebrow">Tutoriel</div>
    <h2>Bienvenue à Helvara</h2>
    <div class="tutocard">${fullCard("yarden")}</div>
    <p class="tb">Chaque duel se joue sur <b>3 lieux</b> et dure <b>6 tours</b>. Pour gagner, il faut avoir plus de puissance que l'adversaire sur <b>2 lieux sur 3</b>.</p>
    <ul class="tbl"><li><b>Énergie</b> : au tour N, tu as N énergie (1 au tour 1, 2 au tour 2…). Elle ne se cumule pas d'un tour à l'autre, sauf effet de carte.</li>
      <li><b>Lieux</b> : trois lieux tirés au hasard parmi ceux de l'univers d'Helvara, inspiré par le lore Helvara de Lausanne dans Le Sang de Tiamat. Chacun a sa règle, révélée aux tours 1, 2 et 3.</li>
      <li><b>Cartes</b> : une <b>Révélation</b> se déclenche quand la carte est révélée, à la fin du tour ; un effet <b>Continu</b> agit tant que la carte reste en jeu.</li></ul>
    <p class="tb">La partie guidée t'apprend tout en 5 minutes, carte par carte.${reward?" Dans les deux cas, tu reçois <b>100 CHF</b> pour ton premier deck.":""}</p>
    <button class="primary" data-act="tutoplay">Faire la partie guidée</button>
    <button class="ghost" data-act="tutodone">${reward?"Passer le tutoriel":"Fermer"}</button>
  </div></div>`;
}
const TUT={
  me:["coursier","felix","passante","celeste","izzy","yarden","colosse","veilleur","devote","thot","ishara","esquille"],
  ai:["passante","veilleur","thot","devote","colosse","ishara","felix","izzy","celeste","coursier","esquille","yarden"],
  plays:{1:[["passante",0]],2:[["veilleur",1]],3:[["thot",2]],4:[["devote",1]],5:[["colosse",2]],6:[["ishara",2]]},
  steps:{
   1:{req:[["coursier",0]],t:"Tu as <b>1 énergie</b> au tour 1 : ton énergie est égale au numéro du tour, elle ne se cumule pas. Touche le <b>Coursier du Flon</b> (coût 1), puis la <b>Ruelle</b>. Termine ton tour : à la <b>Révélation</b>, l'effet de la carte se déclenche. Ici, il te fait piocher une carte."},
   2:{req:[["felix",1]],t:"Le <b>Lac Ouchy</b> vient d'apparaître. Chaque lieu a sa règle : ici, ta première carte laisse un Reflet de 2. Pose <b>Félix</b> au Lac Ouchy : ta prochaine carte coûtera 1 de moins. Tu as maintenant 2 énergie, même si tu n'avais pas tout dépensé au tour 1."},
   3:{req:[["celeste",2],["passante",0]],t:"Céleste coûte 3, mais Félix et le <b>Sous-gare</b> la font passer à 1. Pose <b>Céleste</b> au Sous-gare, puis la <b>Passante</b> à la Ruelle. Tu peux jouer plusieurs cartes tant que tu as de l'énergie."},
   4:{req:[["izzy",1]],t:"L'Agent de Thot adverse a <b>affaibli</b> Céleste : son chiffre est passé en rouge. Pose <b>Izzy</b> au Lac Ouchy : elle copie la puissance de la carte adverse la plus forte du lieu. Appui long sur une carte pour la voir en grand."},
   5:{req:[["yarden",2]],t:"Tu as des cartes dans les 3 lieux : <b>Yarden Weiss</b> gagne +4 de puissance en arrivant. Pose-la au Sous-gare."},
   6:{req:[["colosse",1]],t:"Dernier tour. Pose le <b>Colosse du Léman</b> au Lac Ouchy. À la fin, celui qui mène sur 2 lieux sur 3 gagne."}
  }
};
function startTutorial(){
  RNG=Math.random; uidN=0; zoomId=null;
  S={turn:0, energy:0, energyE:0, bonus:{p:0,e:0}, destroyed:0,
    locs:["ruelle","ouchy","sousgare"].map(id=>({id,rev:false,stopped:false,locked:false})),
    board:{p:[[],[],[]],e:[[],[],[]]}, hand:{p:[],e:[]},
    deck:{p:TUT.me.map(mk), e:TUT.ai.map(mk)},
    staged:[], disc:{p:0,e:0}, first:{p:[0,0,0],e:[0,0,0]},
    log:[], sel:null, info:null, busy:false, over:null, tut:true};
  for(let i=0;i<3;i++){ draw("p"); draw("e"); }
  log("Partie guidée"); screen="play"; startTurn(); window.scrollTo(0,0);
}
const tutReq=()=>S&&S.tut&&TUT.steps[S.turn]?TUT.steps[S.turn].req:[];
const tutDone=()=>tutReq().every(([id,li])=>S.staged.some(x=>x.c.id===id&&x.li===li));
function tutBarHTML(){
  if(!S||!S.tut||S.over) return ""; const st=TUT.steps[S.turn]; if(!st) return "";
  const todo=tutReq().filter(([id,li])=>!S.staged.some(x=>x.c.id===id&&x.li===li)).map(([id,li])=>`<b>${CARDS[id].name}</b> (<i>${LOCS[S.locs[li].id].name}</i>`);
  return `<div class="tutbar"><div class="eyebrow">Partie guidée · tour ${S.turn}/6</div><p>${st.t}</p>${tutDone()?`<p class="ok">C'est bon : touche <b>Fin du tour</b>.</p>`:S.nudge?`<p class="nudge">Pas encore : pose d'abord ${todo.join("), puis ")}), puis touche <b>Fin du tour</b>.</p>`:""}</div>`;
}
function finishTuto(){
  const first=!P.tuto; tutoStep=-1; if(S&&S.tut){ S=null; }
  if(first){ P.tuto=true; P.chf+=ECO.tuto; save(); sfx("coin"); }
  if(!P.starter){ hlStarter=true; screen="shop"; }
  render(); window.scrollTo(0,0);
}

/* --- collection --- */
function lockedCard(id){ return `<div class="full locked ${REL(id)?"":"soon"}${CARDS[id].r==="U"?" holo":""}">${art(id)}<div class="lock">${REL(id)?CARDS[id].name:"Bientôt"}<br><span style="color:${RAR[CARDS[id].r].c}">${rarN(id)}</span><br>${CARDS[id].ex&&!REL(id)?`${PACKS.find(x=>x.id===CARDS[id].ex).name} · dès le ${frDate(CARDS[id].rel.slice(5))}`:!REL(id)?`Disponible le ${frDate(CARDS[id].rel.slice(5))}`:CARDS[id].r==="U"?(ULof(id).quest?`Journal des factions : ${Math.min(fjGet(ULof(id).quest.k),ULof(id).quest.n)}/${ULof(id).quest.n} parties`:`Possède ${ULof(id).n}`):CARDS[id].ex?`${PACKS.find(x=>x.id===CARDS[id].ex).name} uniquement`:"À trouver dans un pack"}</div></div>`; }
function locsHTML(){ return `<section class="sec"><h2>Les lieux d'Helvara</h2>
    <p>Trois lieux par partie, révélés aux tours 1, 2 et 3.</p>
    <div class="locs">${locPool().map(k=>LOCS[k]).map(l=>`<div class="locard" style="background-image:linear-gradient(180deg,rgba(8,12,20,.1),rgba(8,12,20,.9) 70%),url('${l.img}')"><div class="n">${l.name}</div><div class="e">${l.fx}</div></div>`).join("")}</div>
  </section>`; }
function codexHTML(){
  return `
  ${Object.entries(FAC).map(([k,F])=>{ const ids=POOL.filter(id=>CARDS[id].fac===k&&SHOWN(id)).sort((a,b)=>CARDS[a].cost-CARDS[b].cost);
    const have=ids.filter(id=>P.owned.includes(id)).length;
    return `<section class="sec"><h2 style="color:${F.c}">${F.n} · ${have}/${ids.length}</h2>
      <p class="hint">Touche une carte pour l'agrandir.</p>
      <div class="grid">${gridArt(()=>ids.map(id=>P.owned.includes(id)?`<button class="zoombtn" data-act="zoom" data-id="${id}" aria-label="Agrandir ${CARDS[id].name}">${fullCard(id)}</button>`:`<div class="full locked ${REL(id)?"":"soon"}${CARDS[id].r==="U"?" holo":""}">${art(id)}<div class="lock">${REL(id)?CARDS[id].name:"Bientôt"}<br><span style="color:${RAR[CARDS[id].r].c}">${rarN(id)}</span><br>${CARDS[id].ex&&!REL(id)?`${PACKS.find(x=>x.id===CARDS[id].ex).name} · dès le ${frDate(CARDS[id].rel.slice(5))}`:!REL(id)?`Disponible le ${frDate(CARDS[id].rel.slice(5))}`:CARDS[id].r==="U"?(ULof(id).quest?`Journal des factions : ${Math.min(fjGet(ULof(id).quest.k),ULof(id).quest.n)}/${ULof(id).quest.n} parties`:`Possède ${ULof(id).n}`):CARDS[id].ex?`${PACKS.find(x=>x.id===CARDS[id].ex).name} uniquement`:"À trouver dans un pack"}</div></div>`).join(""))}</div></section>`; }).join("")}
  <section class="sec"><h2>Les lieux d'Helvara</h2>
    <p>Trois lieux par partie, révélés aux tours 1, 2 et 3.</p>
    <div class="locs">${locPool().map(k=>LOCS[k]).map(l=>`<div class="locard" style="background-image:linear-gradient(180deg,rgba(8,12,20,.1),rgba(8,12,20,.9) 70%),url('${l.img}')"><div class="n">${l.name}</div><div class="e">${l.fx}</div></div>`).join("")}</div>
  </section>`;
}
function rulesHTML(){
  return `
  <section class="sec"><h2>Comment jouer</h2>
    <p>Le tutoriel complet est disponible à tout moment.</p>
    <button class="ghost" data-act="tuto">Revoir le tutoriel</button>
  </section>
  <section class="sec"><h2>Règles</h2>
    <ol class="rules">
      <li>6 tours. Au tour N, tu as N énergie, qui ne se cumule pas d'un tour à l'autre (sauf effet de carte). Tu pioches 1 carte par tour (main de 7 maximum).</li>
      <li>Tu poses tes cartes, l'adversaire pose les siennes face cachée. Tout est révélé en fin de tour, lieu par lieu : dans chaque lieu, le joueur qui mène révèle ses cartes en premier. En cas d'égalité, tes cartes d'abord (en duel, celles de l'hôte).</li>
      <li>4 cartes maximum par joueur et par lieu.</li>
      <li>Au tour 1, avant de poser une carte, tu peux <b>changer ta main</b> une fois : tes cartes repartent dans le deck, qui est mélangé, et tu en pioches autant. Pas en duel entre amis.</li>
      <li>« Révélation » se déclenche une fois quand la carte se retourne. « Continu » agit tant que la carte est en jeu et n'a pas perdu ses effets. Une carte qui perd ses effets garde ce que sa Révélation lui a déjà donné.</li>
      <li>« En jeu » veut dire révélée sur le plateau, de n'importe quel côté.</li>
            <li>À la fin du tour 6, remporte 2 lieux sur 3. En cas d'égalité, la puissance totale départage.</li>
    </ol>
  </section>
  <section class="sec"><h2>Vocabulaire</h2>
    <ol class="rules">
      <li><b>Détruire</b> : la carte quitte le plateau. Eir et Ame-no-Uzume l'empêchent, sauf si l'effet dit « rien ne la protège » : là, aucune protection ne tient.</li>
      <li><b>Défausser</b> : la carte quitte ta main sans être jouée.</li>
      <li>Rémi et le Charognard du M2 comptent les cartes détruites <b>et</b> défaussées.</li>
      <li><b>Affaiblir</b> (−X) : la carte perd de la puissance. La puissance peut devenir négative. Eir, Amaterasu, l'Écorché Silencieux et Jordan, le Créateur l'empêchent.</li>
      <li><b>Perdre ses effets</b> : la carte garde sa puissance et les bonus déjà gagnés, mais ses effets Continu et de fin de tour ne s'appliquent plus.</li>
      <li><b>Les fusions sortent des paquets.</b> 1 % par paquet à 100 CHF, 2 % à 200 CHF, 4 % à 300 CHF (garantie à la 10e ouverture), 5 % pour les paquets d'édition. Aucune fusion ne se gagne plus en réunissant ses cartes.</li>
      <li><b>Une seule ultra-légendaire par deck.</b> Chaque fusion exige ses deux personnages dans le deck. Une ultra-légendaire de faction, comme Nike, se gagne dans le Journal des factions (50 parties jouées avec 8 cartes de sa faction) et exige 8 cartes de sa faction dans le deck.</li>
      <li><b>Condamner</b> : une case du lieu est fermée pour l'adversaire jusqu'à la fin de la partie. <b>Captive</b> : la carte tombe à 0 tant que sa geôlière reste en jeu. <b>Silence</b> : l'adversaire ne peut pas jouer dans ce lieu au tour suivant.</li>
      <li><b>Une seule version par personnage</b> dans un deck (par exemple Nyx ou Nyx, Guerrière d'Halloween). Seule exception : la Dragonification de Yarden peut côtoyer Yarden Weiss.</li>
      <li><b>Ressusciter</b> : une carte défaussée ou détruite revient sur le plateau, révélée, à sa puissance de base, sans déclencher sa Révélation (sauf mention contraire).</li>
      <li><b>Charmer</b> : la carte reste du côté adverse, mais sa puissance compte pour toi.</li>
      <li><b>De ton côté</b> : uniquement tes cartes révélées. <b>En jeu</b> : n'importe quelle carte révélée, des deux côtés.</li>
      <li>Sur le plateau, le petit chiffre vert ou rouge indique l'écart avec la puissance de base. Appui long pour voir le détail.</li>
    </ol>
  </section>
  <section class="sec"><h2>Rangs et saisons</h2>
    <ol class="rules">
      <li>Sept paliers : ${TIERS.join(" → ")}. Chacun a trois divisions (III, II, I), sauf Héraut et Avatar qui en ont cinq (V à I). Il faut 3 étoiles par division en Passant et Initié, 4 en Agent et Élu, 5 en Héraut et Avatar.<div class="rkstrip">${TIERS.map((t,i)=>`<figure>${rankIcon(START[i],"md")}<figcaption>${t}</figcaption></figure>`).join("")}</div></li>
      <li>Victoire : +1 étoile, +2 à partir de 2 victoires d'affilée (jusqu'à Héraut). Défaite : −1 étoile, sauf en Passant et Initié où elle ne coûte rien. Égalité : rien ne bouge.</li>
      <li><b>Le Serment</b> (parties classées uniquement) : une fois par partie, jusqu'au tour 5, tu peux jurer sur un lieu révélé. Si tu le remportes avec la partie, tu gagnes 2 étoiles, série comprise. Si tu le perds (ou en cas d'égalité sans Morrigan), tu perds 1 étoile de plus, même si tu gagnes la partie.</li>
      <li><b>Serment adverse</b> : l'adversaire peut lui aussi jurer sur un lieu, entre les tours 2 et 4. Tu peux relever le défi en jurant sur le même lieu : c'est le <b>Serment croisé</b>. Lieu et partie gagnés : +4 étoiles, série comprise. Lieu et partie perdus : −4 étoiles (jamais sous le plancher du palier). Lieu gagné mais partie perdue, ou l'inverse : 0.</li>
      <li>Le début de chaque palier est un plancher : on ne redescend jamais sous un palier atteint pendant la saison.</li>
      <li>Plus ton rang est haut, plus l'adversaire construit un deck solide et joue bien. Il n'utilise jamais une rareté que tu n'as pas encore trouvée.</li>
      <li>Chaque mois, nouvelle saison : tu redescends de 3 paliers (une Divinité repart en Élu) et tu reçois 25 CHF par palier atteint (175 CHF pour la Divinité).</li>
    </ol>
  </section>`;
}

/* --- partie --- */
function deltaBadge(v){ return v?`<span class="dlt ${v>0?"up":"down"}">${v>0?"+":"−"}${Math.abs(v)}</span>`:""; }
function mini(s,li,c,staged){
  if(!c.rev && !staged && s==="e") return `<button class="mini back${c.fresh?" flip":""}" data-cu="${c.uid}" aria-label="Carte face cachée"><div class="art"></div></button>`;
  const p=staged?CARDS[c.id].pow:cardPow(s,li,c), base=CARDS[c.id].pow;
  const cls=staged?"":p>base?"up":p<base?"down":"";
  const act=(staged?`data-act="unstage" data-uid="${c.uid}"`:`data-act="inspect" data-uid="${c.uid}"`)+` data-lp="c${c.uid}"`;
  const chm=!staged&&charmOf(c)?" charmed":"";
  /* Ananké : « Fatalité » + puissance qu'elle aura en fin de partie (en direct) ; Hédoné : compteur de charmes */
  const fat=!staged&&!S.final&&c.id==="ananke"&&c.rev&&fated(c)?`<span class="fatb" title="Fatalité : puissance en fin de partie">✠ ${ankEnd(s,li,c)}</span>`:"";
  const sick=!staged&&c.sick>0?`<span class="sickb" title="Malade : −1 au début de chacun des tours suivants">🤒 ${c.sick}</span>`:"";
  const hed=!staged&&c.id==="hedone"&&c.rev?`<span class="hedb" title="Charmes">${c.hed||0}/2</span>`:"";
  return `<button class="mini${CARDS[c.id].r==="U"?hasHoloTile(c.id)?" holof":" holo":""}${chm}${rc(CARDS[c.id])}${staged?" staged":""}${c.fresh?" flip":""}${c.neg?" neg":""}" data-cu="${c.uid}" ${act} aria-label="${CARDS[c.id].name}, puissance ${p}">${art(c.id)}${tileHolo(c.id,"m"+c.uid)}${staged?"":deltaBadge(p-base)}${c.midnight>0&&!c.neg?`<span class="midn" title="Minuit : charmera au prochain tour">🕛</span>`:""}${fat}${hed}${sick}<span class="pw ${cls}">${p}</span></button>`;
}
function sideHTML(s,li){
  const items=S.board[s][li].map(c=>mini(s,li,c,s==="p"&&!c.rev));
  if(s==="p") for(const x of S.staged.filter(x=>x.li===li)) items.push(mini("p",li,x.c,true));
  const cp=capOf(s,li), slots=[];
  for(let i=0;i<4;i++) slots.push(items[i]||`<div class="slot${i>=cp?" x":""}"></div>`);
  if(s==="e"){ const r=[slots[2],slots[3],slots[0],slots[1]]; slots.splice(0,4,...r); }
  const can=s==="p"&&S.sel&&!S.busy&&canStage(findHand(S.sel),li);
  return `<div class="side ${s==="p"?"me":"foe"}${can?" can":""}" ${s==="p"?`data-act="stage" data-li="${li}"`:""}>${slots.join("")}</div>`;
}
const VEIL="linear-gradient(180deg,rgba(8,12,20,.45),rgba(8,12,20,.85))";
function locHTML(li){
  const L=S.locs[li], d=LOCS[L.id], a=total("p",li), b=total("e",li), w=leader(li);
  const can=S.sel&&!S.busy&&canStage(findHand(S.sel),li);
  const img=L.rev?d.img:"images/lieux/inconnu.webp";
  const cross=S.oath===li&&S.aiOath===li;
  const tags=[cross?"⚖ Serment croisé":S.oath===li?"⚖ Serment":S.aiOath===li?"⚖ Serment adverse":"",L.stopped?"Effet arrêté":"",L.locked?"Verrouillé":"",muted("p",li)?"Silence : tu ne peux pas jouer ici":"",muted("e",li)?"Silence adverse":"",nemInv(li)?"Nemesis : le plus faible gagne":""].filter(Boolean);
  return `<div class="loc${can?" can":""}${L.locked?" locked":""}${cross?" cross":S.oath===li?" oath":S.aiOath===li?" aioath":""}" style="background-image:${VEIL},url('${img}')" data-act="stage" data-li="${li}" data-lp="l${li}" tabindex="0">
    <span class="tot f${w==="e"?" lead":""}">${b}</span>
    <div class="inner"><div class="nm">${L.rev?d.name:"Lieu inconnu"}</div><div class="fx">${tags.length?`<b>${tags.join(" · ")}</b>`:(L.rev?d.fx:`Révélé au tour ${li+1}`)}</div></div>
    <span class="tot m${w==="p"?" lead":""}">${a}</span></div>`;
}
function findHand(uid){ return S.hand.p.find(c=>c.uid===uid); }
function findAny(uid){
  for(const s of ["p","e"]) for(let li=0;li<3;li++){ const c=S.board[s][li].find(x=>x.uid===uid); if(c) return {c,s,li}; }
  const h=findHand(uid); if(h) return {c:h};
  const st=S.staged.find(x=>x.c.uid===uid); if(st) return {c:st.c};
}
function infoHTML(){
  const uid=S.sel||(S.info&&S.info.uid), loc=S.info&&S.info.loc!=null?S.info.loc:null;
  if(uid){ const f=findAny(uid); if(f){ const d=CARDS[f.c.id], F=FAC[d.fac];
    return `<div><div class="t">${d.name}<span class="chip" style="color:${F.c}">${F.n}</span></div>
      <div class="m">Coût ${d.cost} · Puissance ${d.pow}${d.fx?` · ${fxH(d.fx)}`:" · Pas d'effet."}${f.c.neg?` <b style="color:#f0a0a0">Effets annulés.</b>`:""}${f.c.midnight>0&&!f.c.neg?` <b style="color:#c9b0ff">🕛 Minuit : charme au début du prochain tour.</b>`:""}${f.s&&charmOf(f.c)?` <b style="color:#ffd27a">${charmOf(f.c)==="p"?"Charmée : sa puissance compte pour toi.":"Charmée : sa puissance compte pour l'adversaire."}</b>`:""}${f.s&&f.c.id==="ananke"&&f.c.rev&&fated(f.c)&&!S.final?` <b style="color:#ff9a9a">${"Puissance en fin de partie : "+ankEnd(f.s,f.li,f.c)+"."}</b>`:""}${f.c.id==="hedone"&&f.c.rev?` <b style="color:#ffd27a">${"Charmes : "+(f.c.hed||0)+"/2."}</b>`:""}</div>
      ${S.sel?`<div class="m" style="color:var(--me)">Touche un lieu pour la poser.</div>`:""}</div>`; } }
  if(loc!=null){ const L=S.locs[loc];
    return L.rev?`<div><div class="t">${LOCS[L.id].name}</div><div class="m">${L.stopped?"Effet arrêté par Perséphone. ":""}${LOCS[L.id].fx}${L.locked?" Vritra a verrouillé ce lieu : plus personne ne peut y jouer.":""}</div></div>`
               :`<div><div class="t">Lieu inconnu</div><div class="m">Il sera révélé au début du tour ${loc+1}.</div></div>`; }
  /* Aide générale : les 3 premières parties (jamais pendant le tutoriel, qui a son propre encadré), ou à la demande avec le « ? » */
  if(!(S.help||(!S.tut&&P.w+P.l+P.d<3))) return "";
  return `<div><div class="t">À toi, ${esc(P.name)}</div><div class="m">Touche une carte de ta main puis un lieu pour la poser. Tu peux aussi la glisser vers le haut sur un lieu. <b>Appui long</b> sur une carte ou un lieu pour le voir en grand. Touche une carte posée ce tour pour la reprendre. <button class="linkbtn" data-act="go" data-to="rules">Règles complètes</button></div></div>`;
}
function handHTML(){
  return S.hand.p.map(c=>{
    const d=CARDS[c.id], any=[0,1,2].some(li=>canStage(c,li));
    const cheapest=Math.min(...[0,1,2].map(li=>costOf("p",c,li,S.staged.length===0,jugFirst(S.staged,S.staged.length))));
    return `<button class="hc${d.r==="U"?hasHoloTile(c.id)?" holof":" holo":""}${rc(d)}${S.sel===c.uid?" sel":""}${any||S.busy?"":" no"}${S.tut&&tutReq().some(([id])=>id===c.id)&&!S.staged.some(x=>x.c.id===c.id)?" tutreq":""}" data-act="hand" data-uid="${c.uid}" data-lp="c${c.uid}" aria-label="${d.name}, coût ${d.cost}, puissance ${c.pow}">
      ${art(c.id)}${tileHolo(c.id,"h"+c.uid)}<span class="cost${cheapest<d.cost?" cut":""}">${cheapest}</span><span class="nm">${d.name}</span><span class="pw ${c.pow>d.pow?"up":c.pow<d.pow?"down":""}">${c.pow}</span></button>`;
  }).join("")||`<div class="m" style="color:var(--mist);padding:20px 4px">Main vide.</div>`;
}
/* Retour facultatif et discret en fin de partie : 👍 / 👎 / « Une carte m'a paru injuste » (puis on choisit la carte). */
function fbCards(){
  const ids=new Set(); for(const s of ["p","e"]) for(const col of S.board[s]) for(const c of col) ids.add(c.id);
  for(const s of ["p","e"]) for(const id of ((S.graveyard&&S.graveyard[s])||[])) ids.add(id);
  for(const [id] of (S.played||[])) ids.add(id);
  return [...ids].filter(id=>CARDS[id]&&!CARDS[id].token).sort((a,b)=>CARDS[a].name.localeCompare(CARDS[b].name,"fr"));
}
function fbHTML(o){
  if(o.tut||!S||S.tut||!lbDb||!lbDb.feedback) return "";
  if(o.fb==="sent") return `<p class="fb done">Merci pour ton retour 🖤</p>`;
  if(o.fb==="pick") return `<div class="fb"><label class="fbl" for="fb-card">Quelle carte t'a paru injuste ?</label><select id="fb-card" class="fbsel">${fbCards().map(id=>`<option value="${id}">${esc(CARDS[id].name)}</option>`).join("")}</select><div class="row2"><button class="primary small" data-act="fbsend">Envoyer</button><button class="ghost small" data-act="fbcancel">Annuler</button></div></div>`;
  return `<div class="fb"><span class="fbl">Cette partie t'a plu ?</span><span class="fbbtns"><button class="fbb" data-act="fbup" aria-label="J'ai aimé">👍</button><button class="fbb" data-act="fbdown" aria-label="Je n'ai pas aimé">👎</button><button class="fbb" data-act="fbpick">Une carte m'a paru injuste</button></span></div>`;
}
function fbSend(kind,card){
  if(!S||!S.over||S.over.fb==="sent"||!lbDb||!lbDb.feedback) return;
  const mode=S.mp?"duel":S.blitz?"blitz":"ia"; S.over.fb="sent"; sfx("click"); render();
  lbDb.feedback(kind,card||null,mode,BUILD).catch(()=>{});
}
function resultHTML(){
  const o=S.over; if(!o||o.closed||o.hold) return "";
  if(o.tut) return `<div class="veil"><div class="result" role="dialog" aria-label="Tutoriel terminé">
    <h2>${o.res==="win"?"Victoire !":"Partie terminée"}</h2>
    <p class="tb">${o.res==="win"?`Tu remportes ${o.pw} lieux sur 3. `:""}Tu connais maintenant l'essentiel : l'énergie, les lieux, la révélation, les bonus en vert et les malus en rouge.</p>
    <div class="rows">${o.rows.map(r=>`<div class="row"><span>${r.n}</span><span><span style="color:var(--me)">${r.a}</span> · <span style="color:var(--foe)">${r.b}</span></span></div>`).join("")}</div>
    <button class="primary" data-act="tutodone">${!P.tuto?"Recevoir 100 CHF et aller à la boutique":"Terminer"}</button></div></div>`;
  const se=season(); const t=o.res==="win"?(se?SEASON[se].win:"Victoire"):o.res==="lose"?(se?SEASON[se].lose:"Défaite"):"Égalité";
  return `<div class="veil"><div class="result" role="dialog" aria-label="${t}">
    <h2>${t}</h2>
    ${o.blitz?`<div class="rankline"><b>Blitz · ${o.wins} victoire${o.wins>1?"s":""} sur 3</b><br><span>${o.ended?(o.gain?`Blitz terminé : +${o.gain} CHF`:"Blitz terminé, sans récompense"):o.res==="draw"?"Égalité : le match est à rejouer":`Prochain match contre une IA ${TIERS[BZ.tiers[o.wins]]}`}</span></div>`:`<div class="reward">+${o.gain} CHF</div>`}
    ${o.qDone&&o.qDone.length?`<div class="qdone">Quête accomplie : ${o.qDone.join(" · ")}. Récupère ta récompense à l'accueil.</div>`:""}
    ${o.blitz?"":o.mp?`<div class="rankline"><b>Duel contre ${esc(S.mp.oppNick)}</b><br><span>Duel entre amis · hors classement</span></div>`:`<div class="rankline">${rankIcon(P.lv,"md")}<br><b>${rankName(P.lv)}</b> ${starsHTML(P.lv,P.st)}${o.rk.oath?`<br><span class="oathres ${o.rk.oath}">${o.rk.cross?(o.rk.oath==="kept"?(o.res==="win"?"Serment croisé tenu : +4 étoiles":o.res==="lose"?"Serment croisé tenu : ta défaite ne coûte rien":"Serment croisé tenu"):(o.res==="win"?"Serment croisé perdu : ta victoire ne rapporte aucune étoile":o.res==="lose"?"Serment croisé perdu : −4 étoiles":"Serment croisé perdu")):o.rk.oath==="kept"?(o.res==="win"?"Serment tenu : +2 étoiles":"Serment tenu, mais la partie est perdue"):"Serment rompu : −1 étoile"}</span>`:""}<br><span>${o.rk.up?"Promotion !":o.rk.down?"Rétrogradation":o.rk.res==="win"?(o.rk.cross?(o.rk.oath==="kept"?"+4 étoiles (serment croisé)":"Aucune étoile gagnée"):o.rk.bonus?"+2 étoiles (série)":"+1 étoile"):o.rk.res==="lose"?(o.rk.cross?(o.rk.oath==="kept"?"Aucune étoile perdue":"−4 étoiles (serment croisé)"):tierOf(P.lv)<2?"Passant et Initié : une défaite ne coûte rien":isFloor(P.lv)&&P.st===0?"Plancher du palier : rien de perdu":"−1 étoile"):"Égalité : rang inchangé"}</span></div>`}
    <div class="m" style="color:var(--mist)">${o.pw} lieu${o.pw>1?"x":""} contre ${o.ew}${o.tie?` · départage à la puissance totale ${o.pt} contre ${o.et}`:""}</div>
    <div class="rows">${o.rows.map(r=>`<div class="row"><span>${r.n}${r.a===r.b&&r.w?` <small style="color:var(--mist)">(Morrigan)</small>`:""}${r.inv?` <small style="color:var(--mist)">(Nemesis)</small>`:""}</span><span><span style="color:var(--me)">${r.a}</span> · <span style="color:var(--foe)">${r.b}</span></span></div>`).join("")}</div>
    ${fbHTML(o)}
    ${o.mp?`<button class="primary" data-act="mpagain" ${S.mp.wantAgain||S.mp.gone?"disabled":""}>${S.mp.gone?`${esc(S.mp.oppNick)} a quitté le salon`:S.mp.wantAgain?`En attente de ${esc(S.mp.oppNick)}…`:"Revanche"}</button>
    <div class="row2"><button class="ghost" data-act="mpquit">Quitter le salon</button><button class="ghost" data-act="close">Voir le plateau</button></div>`:o.blitz?`<button class="primary" data-act="go" data-to="blitz">${o.ended?"Voir le bilan":"Continuer le Blitz"}</button><div class="row2"><button class="ghost" data-act="close">Voir le plateau</button></div>`:`<button class="primary" data-act="play">Rejouer</button>
    <div class="row2"><button class="ghost" data-act="go" data-to="home">Accueil</button><button class="ghost" data-act="close">Voir le plateau</button></div>`}
  </div></div>`;
}
function gameHTML(){
  if(!S) return `<p class="hint">Aucune partie en cours.</p>`;
  const left=S.energy-used();
  return `
  <div class="status">
    <div class="turn">Tour <b>${S.turn}</b><span style="color:var(--mist)"> / 6</span></div>
    <div class="energy"><div class="hex${left===0?" spent":""}">${left}</div><span class="elab">énergie</span></div>
    ${oathOK()&&S.oath==null&&!S.busy?`<button class="toggle oathchip${S.oathMode?" on":""}" data-act="oathmode">⚖ Serment</button>`:""}
    ${S.over?(S.mp?`<button class="endbtn" data-act="mpquit">Quitter le duel</button>`:(S.blitz?`<button class="endbtn" data-act="go" data-to="blitz">Blitz</button>`:`<button class="endbtn" data-act="play">Nouvelle partie</button>`)):`<button class="endbtn${S.tut&&!tutDone()?" wait":""}" data-act="end" ${S.tut&&!tutDone()?'aria-disabled="true"':""} ${S.busy||(S.mp&&S.mp.locked)?"disabled":""}>${S.busy?"Révélation…":S.mp&&S.mp.locked?`En attente de ${esc(S.mp.oppNick)}…`:"Fin du tour"}</button>`}
  </div>
  ${S.disc.p||S.bonus.p||vestaOn("p")?`<div class="mods">${S.disc.p?`<span>prochaine carte −${S.disc.p}</span>`:""}${vestaOn("p")?`<span>prochaine carte Jugement −1</span>`:""}${S.bonus.p?`<span>+${S.bonus.p} au prochain tour</span>`:""}</div>`:""}
  <div class="subbar">${S.turn===1&&!S.mp&&!S.tut&&!S.mull&&!S.busy&&!S.over&&!S.staged.length?`<button class="toggle" data-act="mull">Changer ma main</button>`:""}${pilesHTML()}</div>
  ${aiOathBar()}
  ${S.mp?`<div class="mpbar"><span class="avatar sm" ${S.mp.oppAv?`style="background-image:url('images/avatars/${S.mp.oppAv}.webp?v=7')"`:""}>${S.mp.oppAv?"":esc(S.mp.oppNick.charAt(0).toUpperCase())}</span><span>Duel contre <b>${esc(S.mp.oppNick)}</b>${S.mp.gone?` · <span style="color:var(--ko)">déconnecté, en attente de son retour</span>`:S.mp.oppLocked&&!S.mp.locked&&!S.busy?` · a terminé son tour`:""}</span>${S.mp.gone&&!S.over?`<button class="toggle" data-act="mpquit">Abandonner</button>`:""}</div>`:""}
  <div class="board">${[0,1,2].map(li=>`<div class="col">${sideHTML("e",li)}${locHTML(li)}${sideHTML("p",li)}</div>`).join("")}</div>
  ${tutBarHTML()}
  <div class="handdock">${(()=>{ const inf=S.oathMode&&oathOK()&&S.oath==null?oathHTML():infoHTML(); return inf?`<div class="info">${inf}</div>`:""; })()}
  <div class="handwrap"><div class="hand">${handHTML()}</div></div></div>
  <div class="log" aria-live="polite">${S.log.map(l=>`<div>${esc(l)}</div>`).join("")}</div>
  ${resultHTML()}${gzHTML()}`;
}
const oathOK=()=>S&&!S.mp&&!S.tut&&!S.blitz&&!S.over&&S.turn<=5;
function oathHTML(){
  const ls=[0,1,2].filter(li=>S.locs[li].rev);
  if(S.oathPick!=null) return `<div><div class="t">⚖ Serment sur ${LOCS[S.locs[S.oathPick].id].name} ?</div><div class="m">${S.oathPick===S.aiOath?"Serment croisé, c'est définitif. Lieu et partie gagnés : +4 étoiles. Lieu et partie perdus : −4. Sinon : 0.":"C'est définitif. Gagne ce lieu avec la partie : +2 étoiles. Perds-le : −1 étoile."}</div><div class="oathbtns"><button class="primary small" data-act="oathok">Je le jure</button><button class="ghost small" data-act="oathno">Annuler</button></div></div>`;
  return `<div><div class="t">⚖ Serment</div><div class="m">Une fois par partie, jusqu'au tour 5. Choisis un lieu révélé.</div><div class="oathbtns">${ls.map(li=>`<button class="toggle" data-act="oathpick" data-li="${li}">${LOCS[S.locs[li].id].name}</button>`).join("")}<button class="ghost small" data-act="oathclose">Fermer</button></div></div>`;
}
function gzHTML(){
  if(!gz||!S) return "";
  if(gz[0]==="p") return pileHTML();
  if(gz[0]==="l"){ const li=+gz.slice(1), L=S.locs[li], d=LOCS[L.id];
    return `<div class="veil" data-act="gzclose"><div class="gzloc"><div class="gzimg" style="background-image:url('${L.rev?d.img:"images/lieux/inconnu.webp"}')"></div>
      <div class="zoominfo"><div class="t">${L.rev?d.name:"Lieu inconnu"}</div><p>${L.rev?d.fx:`Il sera révélé au début du tour ${li+1}.`}${L.stopped?" <b>Effet arrêté par Perséphone.</b>":""}${L.locked?" <b>Verrouillé par Vritra : plus personne ne peut y jouer.</b>":""}</p>
      <div class="m">Puissance : <span style="color:var(--me)">toi ${total("p",li)}</span> · <span style="color:var(--foe)">adversaire ${total("e",li)}</span></div></div></div></div>`; }
  const uid=+gz.slice(1), f=findAny(uid); if(!f){ return ""; } const c=f.c, d=CARDS[c.id];
  const onBoard=f.li!=null&&c.rev, cur=onBoard?cardPow(f.s,f.li,c):c.pow, cont=onBoard?cur-c.pow:0;
  const mods=(c.mods||[]);
  return `<div class="veil" data-act="gzclose"><div class="zoomwrap">${holoDir(c.id)?`<div class="holoslot" id="holoslot" data-act="holoin">${fullCard(c.id,"big",cur)}</div>`:fullCard(c.id,"big",cur)}
    <div class="zoominfo"><div class="t">${d.name}</div><div class="m">Coût ${d.cost} · puissance de base ${d.pow}${onBoard?` · actuelle <b>${cur}</b>`:""}</div>${d.fx?`<p>${fxH(d.fx)}</p>`:""}
    ${c.neg?`<p style="color:var(--ko)">Cette carte a perdu ses effets.</p><p class="hint" style="margin-top:-4px">Ses effets Continu et de fin de tour ne s'appliquent plus. Ses bonus déjà gagnés restent.</p>`:""}
    ${onBoard&&(mods.length||cont)?`<div class="modlist">${mods.map(m=>`<div class="${m.v>0?"up":"down"}">${m.v>0?"+":"−"}${Math.abs(m.v)} · ${esc(m.src)}${c.neg&&m.src===d.name?` <span>(acquis)</span>`:""}</div>`).join("")}${cont?`<div class="${cont>0?"up":"down"}">${cont>0?"+":"−"}${Math.abs(cont)} · effets continus et lieu</div>`:""}</div>`:""}
    <button class="ghost" data-act="gzclose">Fermer</button></div></div></div>`;
}

let zoomHolo=null;
/* carte agrandie en ce moment (Collection, ou grand format d'une carte en partie) : c'est elle qui reçoit l'effet holo */
function bigCardId(){ if(zoomId) return zoomId; if(gz&&gz[0]==="c"&&S){ const f=findAny(+gz.slice(1)); return f?f.c.id:null; } return null; }
function render(){
  const app=document.getElementById("app");
  { const se=season(); if(se) document.documentElement.dataset.season=se; else delete document.documentElement.dataset.season; }
  const hw=document.querySelector(".handwrap"), hs=hw?hw.scrollLeft:0;
  if(screen==="codex") screen="deck"; /* Deck et Collection ne font plus qu'un */
  const body = screen==="play"?gameHTML():screen==="profile"?profileHTML():screen==="deck"?deckHTML():screen==="shop"?shopHTML():screen==="codex"?codexHTML():screen==="rules"?rulesHTML():screen==="duel"?duelHTML():screen==="blitz"?blitzHTML():screen==="board"?boardHTML():screen==="hist"?histHTML():homeHTML();
  if(storeReady && !P.tuto && tutoStep<0 && screen!=="play") tutoStep=0;
  /* le code de salon en cours de saisie survit aux redessins (le salon commun en provoque à chaque arrivée ou départ) */
  const mpIn=document.getElementById("mp-code"), mpKeep=mpIn&&{v:mpIn.value,f:document.activeElement===mpIn,s:mpIn.selectionStart,e:mpIn.selectionEnd};
  /* effet holo du zoom : détaché pendant le redessin puis remis dans le nouveau conteneur ; détruit si le zoom est fermé ou change de carte */
  const bigId=bigCardId(), holoKeep=zoomHolo&&zoomHolo.id===bigId&&zoomHolo.el?zoomHolo.el:null; if(holoKeep) holoKeep.remove(); else{ holoKill(zoomHolo); zoomHolo=null; }
  holoTilesDetach();
  app.innerHTML = header()+body+dockHTML()+sheetHTML()+tutoHTML()+avPickHTML()+zoomHTML()+fanPickHTML()+filtHTML()+(tutoStep<0&&!packOpen?(ulHTML()||majHTML()):"");
  holoTilesAttach(app);
  if(screen==="deck") holoPrefetch(); /* l'effet holo des cartes en grand est prêt avant qu'on les ouvre */
  else if(screen==="home") holoPrefetch(fanIds()); /* accueil : les cartes holo de la vitrine (celle du centre et celles qui viennent de tourner) */
  else if(screen==="play") holoPrefetch(P.deck); /* en partie : seulement la carte holo de ton deck (le reste se charge à la demande) */
  { const hs=document.getElementById("holoslot"); if(hs){ if(holoKeep&&zoomHolo){ hs.appendChild(holoKeep); hs.classList.add("holo-on"); } else zoomHolo=holoMount(hs,bigId); } else if(holoKeep){ holoKill(zoomHolo); zoomHolo=null; } }
  document.body.classList.toggle("hasdock",screen!=="play");
  document.body.classList.toggle("inplay",screen==="play");
  setTimeout(()=>FX.decorate(app),30);
  translateDOM(app);
  const h=document.querySelector(".handwrap"); if(h) h.scrollLeft=hs;
  if(mpKeep){ const i=document.getElementById("mp-code"); if(i){ i.value=mpKeep.v; if(mpKeep.f){ i.focus(); try{ i.setSelectionRange(mpKeep.s,mpKeep.e); }catch(e){} } } }
  music();
  if(editName){ const i=document.getElementById("name-input"); if(i && document.activeElement!==i){ i.focus(); i.select(); } }
}

/* ======= INTERACTIONS ======= */
/* Inclinaison et reflet qui suivent le doigt sur une légendaire ou ultra-légendaire en grand */
let tiltEl=null;
const tiltReset=()=>{ if(tiltEl){ tiltEl.style.setProperty("--rx","0deg"); tiltEl.style.setProperty("--ry","0deg"); tiltEl.style.setProperty("--glow","0"); tiltEl=null; } };
document.addEventListener("pointermove",e=>{ const el=e.target.closest&&e.target.closest(".full.tilt");
  if(el!==tiltEl) tiltReset(); if(!el||matchMedia("(prefers-reduced-motion: reduce)").matches) return; tiltEl=el;
  const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
  el.style.setProperty("--ry",((x-.5)*20).toFixed(1)+"deg"); el.style.setProperty("--rx",((.5-y)*20).toFixed(1)+"deg");
  el.style.setProperty("--mx",(x*100).toFixed(0)+"%"); el.style.setProperty("--my",(y*100).toFixed(0)+"%"); el.style.setProperty("--glow","1"); },{passive:true});
["pointerup","pointercancel"].forEach(t=>document.addEventListener(t,e=>{ if(e.pointerType!=="mouse") tiltReset(); }));
document.addEventListener("pointerdown", ()=>{ if(!bgmArmed){ bgmArmed=true; music(); } });
/* curseurs de volume : réglage en direct, sans redessiner l'écran pendant le glissement */
/* Recherche de la collection : on ne redessine que la grille (pas tout l'écran), pour garder le clavier et la saisie */
let searchTimer=0;
document.addEventListener("input", e=>{ const t=e.target; if(!t||t.id!=="fan-search") return; fanQ=t.value; clearTimeout(fanTimer);
  fanTimer=setTimeout(()=>{ const g=document.getElementById("fangrid"); if(g){ g.innerHTML=fanGridHTML(); translateDOM(g); } },140); });
document.addEventListener("input", e=>{ const t=e.target; if(!t||t.id!=="coll-search") return; searchQ=t.value; clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{ const g=document.getElementById("collgrid"), i=document.getElementById("collinfo"); if(g){ g.innerHTML=collGridHTML(); translateDOM(g); } if(i){ i.innerHTML=collInfoHTML(); translateDOM(i); } },140); });
document.addEventListener("input", e=>{ const k=e.target&&e.target.dataset&&e.target.dataset.vol; if(!k) return; P[k]=Math.max(0,Math.min(100,+e.target.value||0));
  const b=document.querySelector(`[data-volv="${k}"]`); if(b) b.textContent=P[k];
  if(k==="vm"&&bgm) mRamp(bgm,mVol(),.1); if(k==="vs"&&SFXG) SFXG.gain.value=P.vs/100; });
document.addEventListener("change", e=>{ if(e.target&&e.target.dataset&&e.target.dataset.vol){ save(); if(e.target.dataset.vol==="vs") sfx("click"); } });
document.addEventListener("visibilitychange", ()=>{ if(document.hidden&&bgm) mPause(bgm); else music(); });
document.addEventListener("pointerdown", e=>{
  lpFired=false; /* sur téléphone, un appui long n'est suivi d'aucun clic : le prochain toucher repart de zéro */
  const el=e.target.closest("[data-lp]"); if(!el) return;
  const lp=el.dataset.lp, outside=lp[0]==="z"; /* z… : appui long hors partie (Collection) */
  if(!outside&&(!S||screen!=="play")) return;
  lpFired=false; clearTimeout(lpTimer);
  lpTimer=setTimeout(()=>{ lpFired=true; if(outside) zoomId=lp.slice(1); else gz=lp; sfx("select"); render(); },450);
});
["pointerup","pointercancel","pointerleave"].forEach(t=>document.addEventListener(t,()=>clearTimeout(lpTimer)));
document.addEventListener("contextmenu", e=>{ if(e.target.closest("[data-lp]")) e.preventDefault(); });
/* Vitrine qui glisse : pendant le geste, les trois cartes suivent le doigt (de leur place vers la suivante) ;
   au lâcher, elles finissent le trajet en douceur (Web Animations), puis la rotation est enregistrée et l'écran redessiné
   dans la même position. La carte qui fait le tour passe derrière, plus petite. Mouvement réduit : rotation directe. */
const FAN_SLOT={"-1":{ty:0,rot:-12,tx:-38,s:1},"0":{ty:-7.14,rot:0,tx:0,s:1},"1":{ty:0,rot:12,tx:38,s:1}}, FAN_MID={ty:-2,rot:0,tx:0,s:.78};
const fanTf=q=>`translateY(${q.ty}%) rotate(${q.rot}deg) translateX(${q.tx}%) scale(${q.s})`;
const fanLerp=(a,b,t)=>({ty:a.ty+(b.ty-a.ty)*t,rot:a.rot+(b.rot-a.rot)*t,tx:a.tx+(b.tx-a.tx)*t,s:a.s+(b.s-a.s)*t});
const fanWrap=(pos,step)=>Math.abs(pos-step)>1;
function fanAt(pos,step,t){ /* step 1 : les cartes partent vers la gauche ; celle de gauche fait le tour par derrière */
  if(!fanWrap(pos,step)) return fanLerp(FAN_SLOT[pos],FAN_SLOT[pos-step],t);
  return t<.5?fanLerp(FAN_SLOT[pos],FAN_MID,t*2):fanLerp(FAN_MID,FAN_SLOT[-pos],(t-.5)*2); }
function fanZ(pos,step,t){ if(fanWrap(pos,step)) return 0; if(pos-step===0) return t>.5?3:2; if(pos===0) return t>.5?2:3; return 1; }
const fanOp=(pos,step,t)=>fanWrap(pos,step)?1-.45*Math.sin(Math.PI*t):1;
function fanSet(d){ for(const c of d.cards){ c.el.style.top="6%"; c.el.style.transition="none"; c.el.style.transform=fanTf(fanAt(c.pos,d.step,d.t)); c.el.style.zIndex=fanZ(c.pos,d.step,d.t); c.el.style.opacity=fanOp(c.pos,d.step,d.t); } }
function fanGrab(fanEl,x,y){
  const cards=[...fanEl.querySelectorAll(".fcard")].map(el=>({el,pos:+el.dataset.pos}));
  if(cards.length!==3||!cards.every(c=>c.pos>=-1&&c.pos<=1)) return null;
  return {x,y,cards,w:fanEl.offsetWidth||300,step:0,t:0,on:false};
}
let fanDrag=null, fanBusy=false, fanSwiped=0;
function fanFinish(d,commit){
  fanBusy=true; const t1=commit?1:0, steps=8, dur=Math.max(140,320*Math.abs(t1-d.t));
  for(const c of d.cards){
    const fr=[]; for(let i=0;i<=steps;i++){ const t=d.t+(t1-d.t)*i/steps; fr.push({transform:fanTf(fanAt(c.pos,d.step,t)),opacity:fanOp(c.pos,d.step,t)}); }
    c.el.style.zIndex=fanZ(c.pos,d.step,commit?1:0);
    c.anim=c.el.animate(fr,{duration:dur,easing:"cubic-bezier(.22,.8,.3,1)",fill:"forwards"});
  }
  setTimeout(()=>{ fanBusy=false;
    if(commit) fanCommit(d);
    else for(const c of d.cards){ if(c.anim) c.anim.cancel(); c.el.style.cssText=""; } },dur+20);
}
/* Fin du glissement : l'état change comme avec fanRotate (ordre gardé, vIdx), mais les cartes RESTENT dans la page : elles reprennent leur place par data-pos
   au lieu d'un redessin complet. Un redessin recréait chaque carte : l'effet holo repartait de zéro (il « arrivait en sautant », vidéos de Jordan du 22 octobre)
   et les reflets des légendaires redémarraient. */
function fanCommit(d){
  const f=document.querySelector(".fan[data-n=\"3\"]");
  if(!f||d.cards.length!==3||!d.cards.every(c=>c.el.isConnected)){ fanRotate(d.step); return; }
  const own=P.fan.filter(id=>P.owned.includes(id));
  if(own.length===3){ P.fan=d.step>0?[own[1],own[2],own[0]]:[own[2],own[0],own[1]]; save(); }
  else vIdx=(vIdx+(d.step>0?1:2))%3;
  sfx("select");
  for(const c of d.cards){
    let np=c.pos-d.step; if(np<-1) np+=3; if(np>1) np-=3;
    if(c.anim) c.anim.cancel(); c.el.style.cssText="transition:none"; /* sans transition : la carte est déjà à sa place */
    c.el.dataset.pos=String(np); c.pos=np;
    c.el.setAttribute("aria-label",(np===0?"Agrandir ":"Mettre en avant ")+CARDS[c.el.dataset.id].name);
  }
  void f.offsetWidth; requestAnimationFrame(()=>d.cards.forEach(c=>{ c.el.style.transition=""; }));
}
function fanSlide(step){ /* toucher une carte de côté : même glissement, sans geste */
  const f=document.querySelector(".fan"), d=f&&!fanBusy&&!matchMedia("(prefers-reduced-motion: reduce)").matches?fanGrab(f,0,0):null;
  if(!d){ if(!fanBusy) fanRotate(step); return; }
  d.step=step; d.on=true; fanSet(d); fanFinish(d,true);
}
document.addEventListener("pointerdown", e=>{ const f=e.target.closest(".fan"); fanDrag=f&&!fanBusy&&!matchMedia("(prefers-reduced-motion: reduce)").matches?fanGrab(f,e.clientX,e.clientY):null;
  if(!fanDrag&&f&&!fanBusy) fanDrag={x:e.clientX,y:e.clientY,plain:true}; });
document.addEventListener("pointermove", e=>{
  const d=fanDrag; if(!d||d.plain) return; const dx=e.clientX-d.x, dy=e.clientY-d.y;
  if(!d.on){ if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){ fanDrag=null; return; } if(Math.abs(dx)<8) return; d.on=true; }
  d.step=dx<0?1:-1; d.t=Math.min(1,Math.abs(dx)/(d.w*.45)); fanSet(d);
},{passive:true});
function fanRelease(e,cancel){
  const d=fanDrag; fanDrag=null; if(!d) return;
  const dx=e.clientX-d.x, dy=e.clientY-d.y, swipe=!cancel&&Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy);
  if(d.plain){ if(swipe){ fanSwiped=Date.now(); fanRotate(dx<0?1:-1); } return; }
  if(!d.on) return;
  fanSwiped=Date.now(); fanFinish(d,swipe||(!cancel&&d.t>.3));
}
document.addEventListener("pointerup", e=>fanRelease(e,false));
document.addEventListener("pointercancel", e=>fanRelease(e,true));
/* Pose la carte sélectionnée (S.sel) sur un lieu : même règle pour le toucher et pour le glisser-déposer */
function stageSel(li){
  const c=S.sel&&findHand(S.sel);
  if(c&&canStage(c,li)){ const fx=c.id==="ulya"?costFor("p",c.id,li,S.staged.length===0):null; S.hand.p=S.hand.p.filter(x=>x!==c); S.staged.push(fx!=null?{c,li,fixed:fx}:{c,li}); S.sel=null; S.info=null; sfx("place"); return true; }
  return false;
}
/* Glisser-déposer : on soulève une carte de la main VERS LE HAUT (un glissement de côté fait défiler la main, un toucher
   sélectionne comme avant), puis on la lâche sur un lieu. Lâchée ailleurs, elle retourne dans la main. */
const DRAG_MIN=18; let drag=null, dragEnd=0;
function dragTarget(x,y){ for(const el of document.elementsFromPoint(x,y)){ const t=el.closest&&el.closest("[data-act=stage]"); if(t&&t.closest(".board,#app")) return t; } return null; }
function dragMark(on,uid){
  const c=on?findHand(uid):null;
  document.querySelectorAll("[data-act=stage]").forEach(el=>{ const li=+el.dataset.li; el.classList.toggle("dropok",!!c&&canStage(c,li)); el.classList.toggle("dropno",!!c&&!canStage(c,li)); if(!on) el.classList.remove("drophov"); });
}
function dragStop(){ if(!drag) return; if(drag.ghost) drag.ghost.remove(); dragMark(false); document.body.classList.remove("dragging"); if(drag.src) drag.src.classList.remove("lifted"); drag=null; }
document.addEventListener("pointerdown", e=>{
  if(drag||e.button>0||!S||screen!=="play"||S.busy||S.over||(S.mp&&S.mp.locked)) return;
  const el=e.target.closest&&e.target.closest(".hc[data-act=hand]"); if(!el) return;
  drag={src:el,uid:+el.dataset.uid,id:e.pointerId,x0:e.clientX,y0:e.clientY,on:false,ghost:null};
});
document.addEventListener("pointermove", e=>{
  if(!drag||e.pointerId!==drag.id) return;
  if(!drag.on){
    const dy=drag.y0-e.clientY, dx=Math.abs(e.clientX-drag.x0);
    if((dx>DRAG_MIN&&dx>dy)||dy<-DRAG_MIN){ dragStop(); return; } /* de côté ou vers le bas : c'est autre chose (défiler) */
    if(dy<DRAG_MIN||dy<dx*1.2) return;
    const c=findHand(drag.uid); if(!c){ dragStop(); return; }
    drag.on=true; clearTimeout(lpTimer); lpFired=false;
    try{ drag.src.setPointerCapture(e.pointerId); }catch(_){}
    const r=drag.src.getBoundingClientRect(), g=drag.src.cloneNode(true);
    g.className+=" dragghost"; g.removeAttribute("data-act"); g.style.cssText=`position:fixed;left:0;top:0;width:${r.width}px;height:${r.height}px;margin:0;pointer-events:none;z-index:60;transform:translate(${r.left}px,${r.top}px)`;
    document.body.appendChild(g); drag.ghost=g; drag.dx=drag.x0-r.left; drag.dy=drag.y0-r.top;
    drag.src.classList.add("lifted"); document.body.classList.add("dragging"); S.sel=null; S.info=null; dragMark(true,drag.uid); sfx("select");
  }
  e.preventDefault();
  drag.ghost.style.transform=`translate(${e.clientX-drag.dx}px,${e.clientY-drag.dy-34}px) scale(1.12) rotate(-3deg)`;
  const t=dragTarget(e.clientX,e.clientY-34);
  document.querySelectorAll(".drophov").forEach(x=>x.classList.remove("drophov")); if(t&&t.classList.contains("dropok")){ const li=t.dataset.li; document.querySelectorAll(`[data-act=stage][data-li="${li}"]`).forEach(x=>x.classList.add("drophov")); }
});
function dragRelease(e,cancel){
  if(!drag||e.pointerId!==drag.id) return;
  const was=drag.on, uid=drag.uid; let li=null;
  if(was&&!cancel){ const t=dragTarget(e.clientX,e.clientY-34); if(t) li=+t.dataset.li; }
  dragStop();
  if(!was) return;
  dragEnd=Date.now(); /* le clic qui suit le lâcher ne doit rien faire */
  if(li!=null){ S.sel=uid; if(!stageSel(li)){ S.sel=null; sfx("debuff"); } } else if(!cancel) sfx("undo");
  render();
}
document.addEventListener("pointerup", e=>dragRelease(e,false));
document.addEventListener("pointercancel", e=>dragRelease(e,true));
document.addEventListener("click", e=>{
  if(Date.now()-dragEnd<150){ dragEnd=0; e.preventDefault(); e.stopPropagation(); return; }
  if(lpFired){ lpFired=false; e.preventDefault(); e.stopPropagation(); return; }
  if(Date.now()-fanSwiped<400){ fanSwiped=0; e.preventDefault(); return; } /* le clic qui suit un glissement */
  const el=e.target.closest("[data-act]"); if(!el) return;
  const act=el.dataset.act;
  ac(); bgmArmed=true;
  switch(act){
    case "sheet": sheet=sheet===el.dataset.s?null:el.dataset.s; sfx("click"); render(); return;
    case "sheetclose": if(el.classList.contains("veil")&&e.target.closest(".sheet")) return; sheet=null; render(); return;
    case "sheetin": case "holoin": return;
    case "go": { const to=el.dataset.to; packFocus=null; if(to==="board"||to==="home") lbRefresh(); sheet=null; if(to!=="home"){ seasonNote=""; dailyNote=""; } if(to==="home"&&S&&S.over) S.over.closed=true; screen=to; deckMsg=""; editName=false; migratedNote=to==="home"?migratedNote:""; sfx("click"); render(); window.scrollTo(0,0); return; }
    case "play": sfx("click"); migratedNote=""; newGame(); window.scrollTo(0,0); return;
    case "resume": screen="play"; sfx("click"); render(); return;
    case "editname": editName=true; sfx("click"); render(); return;
    case "cancelname": editName=false; render(); return;
    case "music": P.music=!P.music; save(); render(); return;
    case "cine": P.cine=P.cine===false; save(); render(); return;
    case "lang": setLang(LANG==="fr"?"en":"fr"); sfx("click"); render(); return;
    case "htoggle": { const t=+el.dataset.t; if(histOpen.has(t)) histOpen.delete(t); else histOpen.add(t); render(); return; }
    case "hfilt": histFilter=el.dataset.f||"all"; sfx("click"); render(); return;
    case "gexport": { sfx("click"); try{ const blob=new Blob([JSON.stringify({exporte_le:new Date().toISOString(),jeu:dataOf()},null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="duel-helvara-mes-donnees.json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }catch(e){} return; }
    case "gdelete": { sfx("click"); if(!confirm(trUI("Supprimer définitivement ton compte, ta progression et ta fiche de classement ? Cette action est irréversible.")))return; const h=window.helvara; if(!h||!h.deleteAccount)return; h.deleteAccount().then(r=>{ if(r&&!r.ok) alert(trUI("La suppression n'a pas pu aboutir. Réessaie plus tard.")); }); return; }
    case "glogin": sfx("click"); if(window.helvara) window.helvara.signIn(); return;
    case "glogout": sfx("click"); if(window.helvara&&confirm(trUI("Te déconnecter ? Ta progression reste sur ton compte Google."))) window.helvara.signOut(); return;
    case "sfx": P.sfx=!P.sfx; save(); if(P.sfx) SFX.click(); render(); return;
    case "qswap": { const i=+el.dataset.i, q=P.q&&P.q.list[i]; if(q&&!q.c&&q.p<QDEF[q.id].n&&!P.q.rr){ const small=!!QDEF[q.id].small, other=P.q.list[1-i]&&P.q.list[1-i].id;
      const opts=Object.keys(QDEF).filter(id=>!!QDEF[id].small===small&&id!==q.id&&id!==other&&qOk(id)); if(opts.length){ P.q.list[i]=mkQuest(pickRand(opts),Math.floor(Math.random()*1e5)); P.q.rr=true; save(); sfx("click"); } } render(); return; }
    case "wclaim": { if(P.wq&&!P.wq.c&&P.wq.p>=WQ.n){ P.wq.c=true; P.chf+=WQ.r; save(); sfx("coin"); } render(); return; }
    case "claim": { const q=P.q&&P.q.list[+el.dataset.i]; if(q&&!q.c&&q.p>=QDEF[q.id].n){ q.c=true; P.chf+=QDEF[q.id].r; save(); sfx("coin"); } render(); return; }
    case "fanpick": fanPick=P.fan.filter(id=>P.owned.includes(id)); fanQ=""; fanFac="all"; sfx("click"); render(); return;
    case "fanfac": fanFac=el.dataset.f||"all"; sfx("click"); render(); return;
    case "fantoggle": { const id=el.dataset.id; if(fanPick.includes(id)) fanPick=fanPick.filter(x=>x!==id); else if(fanPick.length<3) fanPick.push(id); sfx("select"); render(); return; }
    case "fanclose": fanPick=null; render(); return;
    case "fansave": if(fanPick.length===3){ P.fan=[...fanPick]; save(); sfx("buff"); } fanPick=null; render(); return;
    case "zoom": zoomId=el.dataset.id; sfx("select"); render(); return;
    case "fantap": { const pos=+el.dataset.pos; if(pos===0){ zoomId=el.dataset.id; sfx("select"); render(); } else fanSlide(pos); return; }
    case "unzoom": if(el.classList.contains("veil")&&e.target.closest(".zoominfo")) return; zoomId=null; render(); return;
    case "avpick": avPick=true; sfx("click"); render(); return;
    case "avclose": if(el.classList.contains("veil")&&e.target.closest(".avpanel")) return; avPick=false; render(); return;
    case "avset": P.avatar=el.dataset.id; avPick=false; zoomId=null; save(); lbPublish(); sfx("buff"); render(); return;
    case "stallbuy": stallBuy(el.dataset.id); return;
    case "bzstart": bzStart(); return;
    case "bzpick": bzPick(el.dataset.id); return;
    case "bzplay": if(S&&S.blitz&&!S.over){ screen="play"; render(); return; } sfx("click"); bzGame(); window.scrollTo(0,0); return;
    case "bzquit": if(S&&S.blitz&&!S.over) S=null; bzEndRun(); render(); return;
    case "bzclear": P.bz.run=null; save(); sfx("click"); render(); return;
    case "deckpick": { const i=+el.dataset.i; if(i===P.di) return; P.decks[P.di].cards=[...P.deck]; P.di=i; P.deck=[...P.decks[i].cards].filter(id=>P.owned.includes(id)); deckMsg=pruneUL(); deckRename=false; save(); sfx("select"); render(); preloadDeck(); return; }
    case "deckrename": deckRename=true; render(); { const i=document.getElementById("deck-input"); if(i){ i.focus(); i.select(); } } return;
    case "deckcover": { const D=P.decks[P.di]; D.cover=COVERS[(COVERS.indexOf(D.cover)+1)%COVERS.length]; save(); sfx("click"); render(); return; }
    case "mpcreate": mqStop(); mpCreate(); return;
    case "mpjoin": mqStop(); mpJoin(); return;
    case "mpcancel": mqStop(); mpClear(); render(); return;
    case "fbup": fbSend("up"); return;
    case "fbdown": fbSend("down"); return;
    case "fbpick": if(S&&S.over){ S.over.fb="pick"; sfx("click"); render(); } return;
    case "fbcancel": if(S&&S.over){ S.over.fb=null; render(); } return;
    case "fbsend": { const sel=document.getElementById("fb-card"); if(sel&&sel.value) fbSend("unfair",sel.value); return; }
    case "playhelp": if(S){ S.help=!S.help; sfx("click"); render(); } return;
    case "mqstart": mqStart(); return;
    case "mqcancel": mqStop(""); sfx("click"); return;
    case "mpresume": mpResume(); return;
    case "mpforget": mpSaveSession(null); render(); return;
    case "mpcopy": { const t=myMp&&myMp.code; const old=el.textContent; navigator.clipboard.writeText(t).then(()=>{ el.textContent=trUI("Copié"); setTimeout(()=>{ el.textContent=old; },1500); }).catch(()=>{}); return; }
    case "mpagain": if(S&&S.mp){ S.mp.wantAgain=true; mpPush({again:myMp.g}); sfx("click"); render(); mpTick(); } return;
    case "mpquit": mpClear(); mpSaveSession(null); if(S&&S.mp) S=null; screen="home"; render(); window.scrollTo(0,0); return;
    case "dismiss": if(!P.dis.includes(el.dataset.id)) P.dis.push(el.dataset.id); save(); render(); return;
    case "ulclaim": { const id=el.dataset.id; if(ULof(id)&&!P.owned.includes(id)&&ulEarned(ULof(id))){ P.owned.push(id); save(); sfx("legend"); } zoomId=id; render(); return; }
    case "ullater": ulLater=true; render(); return;
    case "majok": P.maj=MAJ[0].id; majOpen=false; save(); sfx("click"); render(); return;
    case "majshow": sheet=null; majOpen=true; sfx("click"); render(); return;
    case "tutoplay": tutoStep=-1; sfx("click"); startTutorial(); return;
    case "tutodone": finishTuto(); return;
    case "tuto": sheet=null; sfx("click"); startTutorial(); return;
    case "buy": buyPack(el.dataset.pid); return;
    case "seasonpack": { /* le bandeau de saison de l'accueil mène au paquet d'édition de la saison : boutique, paquet en tête et surligné */
      const pid=el.dataset.pid; if(!PACKS.some(x=>x.id===pid)) return; packFocus=pid; sheet=null; seasonNote=""; dailyNote=""; screen="shop"; sfx("click"); render(); window.scrollTo(0,0);
      requestAnimationFrame(()=>{ const t=document.querySelector(`.packtile[data-pid="${pid}"]`); if(t) t.scrollIntoView({block:"center",behavior:"smooth"}); }); return; }
    case "filter": deckFilter=el.dataset.f; sfx("click"); render(); return;
    case "fcost": costFilter=el.dataset.f; sfx("click"); render(); return;
    case "frar": rarFilter=el.dataset.f; sfx("click"); render(); return;
    case "fown": ownFilter=el.dataset.f; sfx("click"); render(); return;
    case "freset": deckFilter=costFilter=rarFilter=ownFilter="all"; searchQ=""; sfx("click"); render(); return;
    case "filtopen": filtOpen=true; sfx("click"); render(); return;
    case "filtclose": if(el.classList.contains("veil")&&e.target.closest(".filtpanel")) return; filtOpen=false; sfx("click"); render(); return;
    case "toggle": { const id=el.dataset.id;
      const clash=P.deck.find(x=>x!==id&&charOf(x)===charOf(id)&&!(["yarden","yarden_d"].includes(x)&&["yarden","yarden_d"].includes(id)));
      if(P.deck.includes(id)){ P.deck=P.deck.filter(x=>x!==id); deckMsg=pruneUL(); sfx("undo"); }
      else if(ULof(id)&&!ulOk(ULof(id),P.deck)){ deckMsg=`${CARDS[id].name} exige ${ULof(id).n} dans le deck.`; sfx("debuff"); }
      else if(ULof(id)&&P.deck.some(x=>ULof(x))){ deckMsg=`Une seule ultra-légendaire par deck : retire d'abord ${CARDS[P.deck.find(x=>ULof(x))].name}.`; sfx("debuff"); }
      else if(clash){ deckMsg=`Une seule version par personnage : retire d'abord ${CARDS[clash].name}.`; sfx("debuff"); }
      else if(P.deck.length<ECO.deckSize){ P.deck.push(id); deckMsg=""; sfx("select"); }
      else { deckMsg="Ton deck est plein : retire d'abord une carte."; sfx("debuff"); }
      save(); render(); if(P.deck.length>=ECO.deckSize) preloadDeck(); return; }
    case "close": S.over.closed=true; render(); return;
    case "pileview": if(S){ gz="p"+el.dataset.p; sfx("select"); render(); } return;
  }
  if(act==="gzclose"&&gz&&gz[0]==="p"&&e.target.closest(".pilepanel")&&!e.target.closest("button")) return; /* un toucher dans le panneau ne le ferme pas */
  if(act==="gzclose"){ gz=null; render(); return; }
  if(!S||S.busy) return;
  if(act==="end"){ sfx("click"); endTurn(); return; }
  if(S.mp&&S.mp.locked&&act!=="inspect") return;
  if(act==="oathmode"){ S.oathMode=!S.oathMode; S.oathPick=null; sfx("click"); render(); return; }
  if(act==="oathclose"){ S.oathMode=false; S.oathPick=null; render(); return; }
  if(act==="oathpick"){ if(oathOK()&&S.oath==null) S.oathPick=+el.dataset.li; sfx("select"); render(); return; }
  if(act==="oathcross"){ if(oathOK()&&S.oath==null&&S.aiOath!=null){ S.oath=S.aiOath; S.oathMode=false; S.oathPick=null; log(`Serment croisé sur ${LOCS[S.locs[S.oath].id].name}`); sfx("legend"); } render(); return; }
  if(act==="oathskip"){ S.aiOathSkip=true; render(); return; }
  if(act==="oathno"){ S.oathPick=null; render(); return; }
  if(act==="oathok"){ if(oathOK()&&S.oath==null&&S.oathPick!=null){ S.oath=S.oathPick; S.oathPick=null; S.oathMode=false; log(`Serment prêté sur ${LOCS[S.locs[S.oath].id].name}`); sfx("legend"); } render(); return; }
  if(act==="mull"){ if(S.turn===1&&!S.mp&&!S.tut&&!S.mull&&!S.staged.length){ const n=S.hand.p.length; S.deck.p=shuffle([...S.deck.p,...S.hand.p]); S.hand.p=[]; for(let i=0;i<n;i++) draw("p"); S.mull=true; S.sel=null; log("Main changée"); sfx("pack"); } render(); return; }
  if(act==="hand"){ const uid=+el.dataset.uid; S.sel=S.sel===uid?null:uid; S.info=null; sfx("select"); render(); return; }
  if(act==="unstage"){ e.stopPropagation(); const uid=+el.dataset.uid; const x=S.staged.find(s=>s.c.uid===uid);
    if(x){ S.staged=S.staged.filter(s=>s!==x); S.hand.p.push(x.c); sfx("undo"); } render(); return; }
  if(act==="inspect"){ e.stopPropagation(); S.sel=null; gz="c"+el.dataset.uid; sfx("select"); render(); return; }
  if(act==="stage"){ const li=+el.dataset.li;
    if(S.sel) stageSel(li); else { gz="l"+li; sfx("select"); }
    render(); }
});
document.addEventListener("submit", e=>{
  if(e.target.id==="deckform"){ e.preventDefault(); const v=document.getElementById("deck-input").value.trim().slice(0,20); if(v){ P.decks[P.di].name=v; save(); sfx("buff"); } deckRename=false; render(); return; }
  if(e.target.id!=="nameform") return;
  e.preventDefault();
  const v=document.getElementById("name-input").value.trim().slice(0,24);
  if(v){ P.name=v; save(); lbPublish(); sfx("buff"); }
  editName=false; render();
});
document.addEventListener("keydown", e=>{
  if((e.key==="Enter"||e.key===" ") && e.target.classList && e.target.classList.contains("loc")){ e.preventDefault(); e.target.click(); }
  if(e.key==="Escape" && editName){ editName=false; render(); }
});

/* ======= DÉMARRAGE ======= */
window.claude?.hot?.snapshot?.(()=>({S:S&&S.mp?null:S,uidN,games,screen:screen==='play'&&S&&S.mp?'home':screen}));
function boot(d){
  sandboxSetup();
  applyLang();
  if(d && d.S!==undefined){ S=(d.S&&d.S.bonus)?d.S:null; uidN=d.uidN||0; games=d.games||0; screen=d.screen||"home"; if(S) S.busy=false; }
  render(); initStore().finally(()=>{ storeReady=true; claimDaily(); render(); preloadDeck(); }); initRoom();
}
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
