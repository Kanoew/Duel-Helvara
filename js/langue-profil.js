/* Duel d'Helvara : langue, fusions, sauvegarde et classement.
   Extrait d'index.html le 12 octobre 2026 sans aucun changement de code : les fichiers js/ se chargent dans l'ordre d'index.html et partagent la même portée globale. */
/* ======= LANGUE : français par défaut, anglais via cartes-en.js ======= */
const FR={cards:{},locs:{},fac:{},rar:{}};
for(const k in CARDS) FR.cards[k]={n:CARDS[k].name,fx:CARDS[k].fx};
for(const k in LOCS) FR.locs[k]={n:LOCS[k].name,fx:LOCS[k].fx};
for(const k in FAC) FR.fac[k]=FAC[k].n;
for(const k in RAR) FR.rar[k]=RAR[k].n;
let LANG=(()=>{ try{ return localStorage.getItem("helvara-lang")==="en"?"en":"fr"; }catch(e){ return "fr"; } })();
function applyLang(){
  const EN=LANG==="en"&&window.HELVARA_EN, pick=(t,k,fr)=>t&&t[k]!=null?t[k]:fr;
  for(const k in CARDS){ const t=EN&&EN.cards[k]; CARDS[k].name=pick(t,"n",FR.cards[k].n); CARDS[k].fx=pick(t,"fx",FR.cards[k].fx); }
  for(const k in LOCS){ const t=EN&&EN.locs[k]; LOCS[k].name=pick(t,"n",FR.locs[k].n); LOCS[k].fx=pick(t,"fx",FR.locs[k].fx); }
  for(const k in FAC) FAC[k].n=pick(EN&&EN.fac,k,FR.fac[k]);
  for(const k in RAR) RAR[k].n=pick(EN&&EN.rar,k,FR.rar[k]);
  /* tables de l'interface : copie française prise au premier passage */
  const D=LANG==="en"&&window.HELVARA_UI_EN&&window.HELVARA_UI_EN.data;
  if(!FR.data) FR.data={TIERS:[...TIERS],MONTHS:[...MONTHS],QDEF:Object.fromEntries(Object.entries(QDEF).map(([k,q])=>[k,q.t])),
    PACKS:Object.fromEntries(PACKS.map(p=>[p.id,{name:p.name,desc:p.desc}])),SEASON:JSON.parse(JSON.stringify(SEASON)),
    DROPS:Object.fromEntries(DROPS.map(d=>[d.id,d.hint])),ULS:Object.fromEntries(ULS.map(u=>[u.id,u.n]))};
  const F=FR.data;
  TIERS.forEach((_,i)=>TIERS[i]=D?D.TIERS[i]:F.TIERS[i]);
  MONTHS.forEach((_,i)=>MONTHS[i]=D?D.MONTHS[i]:F.MONTHS[i]);
  for(const k in QDEF) QDEF[k].t=pick(D&&D.QDEF,k,F.QDEF[k]);
  for(const p of PACKS){ const t=D&&D.PACKS[p.id]; p.name=pick(t,"name",F.PACKS[p.id].name); p.desc=pick(t,"desc",F.PACKS[p.id].desc); }
  for(const k in SEASON) Object.assign(SEASON[k],F.SEASON[k],D&&D.SEASON[k]||{});
  for(const d of DROPS) d.hint=pick(D&&D.DROPS,d.id,F.DROPS[d.id]);
  for(const u of ULS) u.n=pick(D&&D.ULS,u.id,F.ULS[u.id]);
  document.documentElement.lang=LANG;
}
/* Interface : en anglais, chaque texte affiché passe par le dictionnaire d'interface-en.js */
function trUI(t){
  const U=window.HELVARA_UI_EN; if(LANG!=="en"||!U||!t) return t;
  const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(t), core=m[2].replace(/\s+/g," "); if(!core) return t;
  let r=U.exact[core]; if(r===undefined) for(const [re,f] of U.rules){ const x=core.match(re); if(x){ r=f(...x); break; } }
  return r===undefined?t:(/^[:;,.!?]/.test(r)?"":m[1])+r+m[3]; /* pas d'espace avant la ponctuation en anglais */
}
function translateDOM(root){
  if(LANG!=="en") return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.nodeName)?2:1});
  const nodes=[]; let n; while(n=w.nextNode()) nodes.push(n);
  for(const t of nodes){ const v=trUI(t.nodeValue); if(v!==t.nodeValue) t.nodeValue=v; }
  root.querySelectorAll("[aria-label],[placeholder],[title]").forEach(e=>{ for(const a of ["aria-label","placeholder","title"]){ const v=e.getAttribute(a); if(v){ const x=trUI(v); if(x!==v) e.setAttribute(a,x); } } });
}
function setLang(l){ LANG=l==="en"?"en":"fr"; try{ localStorage.setItem("helvara-lang",LANG); }catch(e){} applyLang(); }
const POOL = Object.keys(CARDS).filter(k=>!CARDS[k].token);
const STARTER = ["passante","coursier","ishara","felix","veilleur","celeste","colosse","esquille","yarden","izzy","devote","thot"];
const today=()=>window.__today||dayKey();
const REL=id=>!CARDS[id].rel||today()>=CARDS[id].rel;
const avail=()=>POOL.filter(REL);
const PACK=(ex)=>POOL.filter(id=>REL(id)&&CARDS[id].r!=="U"&&(!CARDS[id].ex||CARDS[id].ex===ex));
const ULS=[{id:"nike",req:[],fac:"jugement",min:8,n:"8 cartes Jugement, Nike comprise",quest:{k:"jugement",n:50}},{id:"ananke",req:[],fac:"primordial",min:8,n:"8 cartes Primordial, Ananké comprise",quest:{k:"primordial",n:50}},{id:"hedone",req:[],fac:"desir",min:8,n:"8 cartes Désir, Hédoné comprise",quest:{k:"desir",n:50}},{id:"source",req:[],fac:"helvara",min:8,n:"8 cartes Helvara, La Source comprise",quest:{k:"helvara",n:50}},
  /* secondes ultra-légendaires de faction (Jordan, 18 octobre) : même compteur du Journal des factions, seuil de 150 parties au total ; une par faction au plus ; dates de sortie repoussées (cachées) */
  {id:"ymir",req:[],fac:"primordial",min:8,n:"8 cartes Primordial, Ymir compris",quest:{k:"primordial",n:150}},{id:"nammu",req:[],fac:"helvara",min:8,n:"8 cartes Helvara, Nammu comprise",quest:{k:"helvara",n:150}},{id:"ulya",req:["yarden","apsu"],n:"Yarden Weiss et Apsu"},{id:"ulji",req:[["jordan","jordan_n"],"izzy"],n:"Jordan et Izzy"},
  {id:"ulaph",req:["aphrodite","yarden"],n:"Aphrodite et Yarden Weiss"},{id:"ulcal",req:["calypso",["jordan","jordan_n"]],n:"Calypso et Jordan"},{id:"ulnem",req:["nemesis",["jordan","jordan_n"]],n:"Nemesis et Jordan"},
  {id:"ulcirce",req:["nyx","circe"],n:"Nyx et Circé"},{id:"uloshun",req:["nyx","oshun"],n:"Nyx et Oshun"},
  {id:"ulqetjor",req:["qetesh",["jordan","jordan_n"]],n:"Qetesh et Jordan"},{id:"ulqetyar",req:["qetesh","yarden"],n:"Qetesh et Yarden Weiss"},
  {id:"ulhel",req:["hel","baldur"],n:"Hel et Baldur"},
  {id:"ulpele_r",req:["pele_r",["jordan","jordan_n"]],n:"Pele et Jordan"},{id:"ulqetjor_r",req:["qetesh_r",["jordan","jordan_n"]],n:"Qetesh, Vœu du Premier Jour et Jordan"},
  {id:"ulsomnambule",req:["somnambule","reine_sevelin"],n:"La Somnambule et La Reine"},{id:"ularchiviste",req:["archiviste","patronne"],n:"L'Archiviste et La Patronne"},
  {id:"nike_v",req:[],fac:"jugement",min:8,n:"8 cartes Jugement, Nike de la Saint-Valentin comprise",quest:{k:"nikev",n:25}},{id:"ulqetjor_v",req:["qetesh_v",["jordan","jordan_n"]],n:"Qetesh de la Saint-Valentin et Jordan"},
  {id:"ulprombia",req:["promethee","bia"],n:"Prométhée et Bia"},{id:"ulheradio",req:["hera","dionysos"],n:"Héra et Dionysos"},{id:"ulposathe",req:["poseidon","athena"],n:"Poséidon et Athéna"},
  {id:"ulnikebia",req:["nike","bia"],n:"Nike et Bia"},{id:"ulmaatset",req:["maat","set"],n:"Mā‘at et Set"},{id:"ulprompan",req:["promethee","pandore"],n:"Prométhée et Pandore"},
  {id:"ulinaere",req:["inanna","ereshkigal"],n:"Inanna et Ereshkigal"},{id:"ulnikejor_v",req:["nike_v",["jordan","jordan_n"]],n:"Nike de la Saint-Valentin et Jordan"},
  {id:"ulaphares",req:["aphrodite","ares"],n:"Aphrodite et Arès"},{id:"ultyphgaia",req:["typhon","gaia"],n:"Typhon et Gaïa"},{id:"ularesathe",req:["ares","athena"],n:"Arès et Athéna"},
  {id:"ulbaldere",req:["baldur","ereshkigal"],n:"Baldur et Ereshkigal"},{id:"ulbaldfrigg",req:["baldur","frigg"],n:"Baldur et Frigg"},{id:"ulsusama",req:["susanoo","amaterasu"],n:"Susanoo et Amaterasu"},
  {id:"ulcircal",req:["circe","calypso"],n:"Circé et Calypso"},{id:"uloshoya",req:["oshun","oya"],n:"Oshun et Oya"},{id:"ulhadper",req:["hades","persephone"],n:"Hadès et Perséphone"}];
const SHOWN=id=>!CARDS[id].rel||today()>=(CARDS[id].soon||"0000");
const DROPS=[{id:"oct26",rel:"2026-10-01",soon:"0000",hint:"Lilith, Ereshkigal, Psyché, Amaterasu, La Mère de Cendre… et la première ultra-légendaire, Yarden X Apsu."},
  {id:"nov26",rel:"2026-11-01",soon:"2026-10-27",hint:"Nemesis, Anubis, Susanoo, Aphrodite, Médée, la Voleuse du Flon… et trois nouvelles fusions : Aphrodite X Yarden, Calypso X Jordan, Nemesis X Jordan."},
  {id:"nov15",rel:"2026-11-15",soon:"2026-11-10",hint:"Prométhée garde le feu, Pandore ouvre la boîte, Athéna guide ta main, et Styx veille sur ses filles : Bia, et Nike, la première ultra-légendaire de faction. Mā‘at, Apollon et Vesta lui préparent le chemin. Elle se gagne en jouant 50 parties avec 8 cartes Jugement : le Journal des factions compte déjà."},
  {id:"dec26",rel:"2026-12-01",soon:"2026-11-26",hint:"Odin, Thor, Hel, Baldur, Hadès, Poséidon, Circé, Qetesh, les gens de Lausanne… cinq nouvelles fusions, le Domaine du Créateur. Et chez les Jugement : Zeus lance la foudre, Héphaïstos forge ses armes, Tsukuyomi veille sur les siens, Cronos dévore."},
  {id:"dec14",rel:"2026-12-14",soon:"2026-12-09",hint:"Le Pli de l'Étoile s'ouvre pour Noël."},
  {id:"jan1",rel:"2027-01-01",soon:"2026-12-27",hint:"L'Archiviste et la Patronne se retrouvent au Sous-Gare, Ea et Anansi mènent le jeu des ruses, l'Enfant sans École revient chaque tour, Typhon fait payer cher les cartes, Fenrir brise ses chaînes… et une nouvelle fusion, L'Archiviste X La Patronne."},
  {id:"jan15",rel:"2027-01-15",soon:"2027-01-10",hint:"Kama revient toujours, Tezcatlipoca absorbe tout ce qui se joue à ses pieds, Éros vise juste, Horus veille, Héraklès change de camp, Lugh lance sa lance et Marduk ne se défausse jamais pour de bon… et Hédoné attire les cartes de l'adversaire."},
  {id:"feb1",rel:"2027-02-01",soon:"2027-01-27",hint:"Nephtys sacrifie sa voisine, Pakhet chasse les petites cartes, Héra devient jalouse, Frigg attire à elle, Xi Wangmu offre la Pêche d'immortalité, Bari Gongju ouvre la voie des défausses, Isis et Rati rappellent les cartes tombées, Loki fait défausser et Anahita copie… et La Source, la nouvelle ultra-légendaire Helvara."}];
/* Notes de mise à jour (la plus récente en premier) : affichées une fois à l'accueil (P.maj = id de la dernière lue), revoyables dans les Réglages.
   Un nouveau joueur ne les voit pas (freshProfile la marque comme lue). Ajouter les textes anglais dans interface-en.js (exact). */
const MAJ=[{id:"2026-10-15",date:"15 octobre 2026",items:["Apsu : le bonus avec Yarden Weiss passe de +6 à +4 de puissance. Yarden X Apsu passe de 12 à 10 de puissance. Le duo gagnait beaucoup plus souvent que toutes les autres cartes, chez les joueurs comme en simulation."]}];
const hasReq=(list,r)=>Array.isArray(r)?r.some(x=>list.includes(x)):list.includes(r);
const ULof=id=>ULS.find(u=>u.id===id);
/* Journal des factions : les ultra-légendaires de faction se gagnent en jouant.
   Une partie compte pour une faction si le deck joué contient au moins 8 cartes de cette faction (IA classée, Blitz, duel ; jamais le tutoriel).
   Nike de la Saint-Valentin : parties jouées avec Nike (ou sa variante) dans le deck pendant la Saint-Valentin. */
const FJ_KEYS=["helvara","primordial","desir","jugement","nikev"], FJ_MIN=8;
const VALENTIN=["02-01","02-28"]; /* fenêtre de la Saint-Valentin pour le journal : tout février (Jordan, 15 octobre) */
const fjGet=k=>(P.fj&&P.fj[k])|0;
function fjCount(deck){
  if(!qLive()||!Array.isArray(deck)) return;
  P.fj=P.fj||{};
  for(const f of Object.keys(FAC)) if(deck.filter(id=>CARDS[id]&&CARDS[id].fac===f).length>=FJ_MIN) P.fj[f]=fjGet(f)+1;
  if(inWin(VALENTIN)&&deck.some(id=>CARDS[id]&&charOf(id)==="nike")) P.fj.nikev=fjGet("nikev")+1;
}
/* Une ultra-légendaire de faction se réclame quand sa quête est remplie. Une fusion ne se gagne plus en réunissant ses sources : elle sort des paquets
   (boutique-modes.js, 1 à 5 % par paquet). Seules les fusions que le joueur pouvait déjà réclamer le 12 octobre 2026 (P.ulk, figé au premier chargement) restent réclamables. */
const ulEarned=u=>u.quest?fjGet(u.quest.k)>=u.quest.n:((P.ulk||[]).includes(u.id)&&ulOk(u,P.owned));
/* Une ultra-légendaire de fusion exige ses cartes ; une ultra-légendaire de faction exige assez de cartes de sa faction (elle comprise). */
const ulOk=(u,list)=>u.fac?list.filter(x=>x!==u.id&&CARDS[x]&&CARDS[x].fac===u.fac).length>=u.min-1:u.req.every(r=>hasReq(list,r));
const charOf=id=>CARDS[id].base||id;
const isNike=id=>!!CARDS[id]&&charOf(id)==="nike"; /* Nike et sa variante de la Saint-Valentin (même carte, autre illustration) */
const OCT_REL="2026-10-01";
const ECO = {win:50, draw:20, loss:10, deckSize:12, tuto:100, dup:{D:10,C:10,R:20,E:40,L:80,U:150}};
/* Chance (en % par paquet) qu'un paquet d'édition contienne une fusion ultra-légendaire : un peu plus que le paquet à 300 CHF (pas de garantie, édition courte). */
const UL_SEASON=5;
const PACKS = [
  {id:"brulure", name:"Première Brûlure", img:"images/packs/brulure.webp", price:100, n:12, starter:true,
   desc:"Ton premier deck : 12 cartes différentes, dont 2 épiques, avec une courbe de coûts jouable. Une seule fois."},
  {id:"reflets", name:"Liasse des Reflets", img:"images/pack.webp", price:100, n:3, odds:[["C",70],["R",30]], ul:1,
   desc:"Communes et rares. Pour compléter les bases."},
  {id:"voile", name:"Cachet du Voile", img:"images/packs/voile.webp", price:200, n:3, odds:[["C",50],["R",35],["E",15]], ul:2,
   desc:"Les épiques entrent en jeu."},
  {id:"breche", name:"Brèche du Sceau", img:"images/packs/breche.webp", price:300, n:3, odds:[["C",40],["R",33],["E",20],["L",7]], ul:4, pity:10,
   desc:"Tout peut en sortir, légendaires comprises."},
  {id:"halloween", name:"Pli des Citrouilles", img:"images/packs/halloween.webp", price:250, n:3, odds:[["C",25],["R",35],["E",28],["L",12]], ul:UL_SEASON, win:["10-12","11-02"],
   desc:"Édition d'Halloween. Plus d'épiques et de légendaires que partout ailleurs."},
  {id:"noel", name:"Pli de l'Étoile", img:"images/packs/noel.webp", price:250, n:3, odds:[["C",25],["R",35],["E",28],["L",12]], ul:UL_SEASON, win:["12-14","01-02"],
   desc:"Édition de Noël. Plus d'épiques et de légendaires que partout ailleurs."},
  {id:"nouvelan", name:"Pli du Douzième Coup", img:"images/packs/nouvelan.webp", price:250, n:3, odds:[["C",25],["R",35],["E",28],["L",12]], ul:UL_SEASON, win:["12-31","01-18"],
   desc:"Édition du Nouvel An. Plus d'épiques et de légendaires que partout ailleurs."}
];
const md=()=>today().slice(5);
function season(){ for(const id of ["nouvelan","halloween","noel"]){ /* le Nouvel An prend la main dès le 31 décembre */ const pk=PACKS.find(x=>x.id===id); if(pk&&inWin(pk.win)) return id; } return null; }
const SEASON={
  halloween:{sub:"Nuit des Citrouilles",who:"Joueur d'Helvara · nuit d'Halloween",eyebrow:"Nuit des Citrouilles · jusqu'au 2 novembre",title:"Le voile est mince à Helvara",hint:"Les citrouilles brûlent sur les quais. Le Pli des Citrouilles cache Dame Joanna, et Morrigan, Nyx, Izzy, Yarden, Arès, Nergal et Médée dans leurs versions d'Halloween.",btn:"Ouvrir le Pli des Citrouilles",win:"Victoire sous la lune rousse",lose:"Les morts ont gagné cette nuit"},
  noel:{sub:"Veillée de l'Étoile",who:"Joueur d'Helvara · veillée de Noël",eyebrow:"Veillée de l'Étoile · jusqu'au 2 janvier",title:"La neige tombe sur Helvara",hint:"Les vignes sont blanches et le lac retient son souffle. Le Pli de l'Étoile cache Aphrodite, Sekhmet, Calypso, Apsu, Ereshkigal et Circé dans leurs versions de Noël.",btn:"Ouvrir le Pli de l'Étoile",win:"Victoire sous l'Étoile",lose:"La nuit d'hiver l'emporte"},
  nouvelan:{sub:"Nuit du Douzième Coup",who:"Joueur d'Helvara · nuit du Réveillon",eyebrow:"Nuit du Douzième Coup · jusqu'au 18 janvier",title:"Minuit sonne sur Helvara",hint:"La cathédrale compte les coups et les morts écoutent. Le Pli du Douzième Coup cache Hel, Éos, Pele, Qetesh, Aphrodite et Arès dans leurs versions du Réveillon.",btn:"Ouvrir le Pli du Douzième Coup",win:"Victoire au dernier coup",lose:"L'année est partie sans toi"}
};
function inWin(w){ if(!w) return true; const d=md(); return w[0]<=w[1]?(d>=w[0]&&d<=w[1]):(d>=w[0]||d<=w[1]); }
function frDate(m){ const [mm,dd]=m.split("-"); return LANG==="en"?`${MONTHS[+mm-1]} ${+dd}`:`${+dd===1?"1er":+dd} ${MONTHS[+mm-1]}`; }
function soonWin(w){ if(!w||inWin(w)) return false; const y=+today().slice(0,4); let s=new Date(y,+w[0].slice(0,2)-1,+w[0].slice(3)); const t=new Date(today()); if(s<t) s=new Date(y+1,s.getMonth(),s.getDate()); return (s-t)/864e5<=14; }
const TIERS=["Passant","Initié","Agent","Élu","Héraut","Avatar","Divinité d'Helvara"];
/* Divisions par palier : 3, sauf Héraut et Avatar (5). START = premier niveau de chaque palier, c'est aussi son plancher. */
const DIV=[3,3,3,3,5,5,1], START=[0,3,6,9,12,17,22];
const MAXLV=22, RVAL={D:0,C:1,R:2,E:3,L:4,U:5};
const tierOf=lv=>{ let t=0; while(t<6&&lv>=START[t+1]) t++; return t; };
const isFloor=lv=>lv===START[tierOf(lv)];
const maxSt=lv=>{ const t=tierOf(lv); return t<2?3:t<4?4:5; };
const ROMAN=["I","II","III","IV","V"];
const rankName=lv=>{ const t=tierOf(lv); return t===6?TIERS[6]:`${TIERS[t]} ${ROMAN[DIV[t]-1-(lv-START[t])]}`; };
/* Anciennes sauvegardes (3 divisions partout, 18 niveaux) : même rang, nouvelle échelle */
const migrateLv=lv=>lv<12?lv:lv<15?12+(lv-12)*2:lv<18?17+(lv-15)*2:22;
const MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
function seasonKey(d=new Date()){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); }
function seasonLabel(){ const d=new Date(); const m=MONTHS[d.getMonth()]; return LANG==="en"?`${m} season`:`Saison ${/^[aeiouy]/.test(m)?"d'":"de "}${m}`; }
function daysLeft(){ const d=new Date(); return Math.max(1,Math.ceil((new Date(d.getFullYear(),d.getMonth()+1,1)-d)/864e5)); }
const QDEF={
  play3:{t:"Joue 3 parties",n:3,r:50,small:1},
  cards12:{t:"Pose 12 cartes",n:12,r:50,small:1},
  loc15:{t:"Remporte un lieu avec 15 de puissance ou plus",n:1,r:50,small:1},
  win3:{t:"Gagne 3 parties",n:3,r:100},
  sweep:{t:"Remporte les 3 lieux dans une même partie",n:1,r:100},
  kill4:{t:"Détruis ou efface 4 cartes adverses",n:4,r:100},
  power40:{t:"Finis une partie avec 40 de puissance totale ou plus",n:1,r:100},
  cheap5:{t:"Pose 5 cartes de coût 1 ou 2",n:5,r:50,small:1},
  helv4:{t:"Pose 4 cartes Helvara",n:4,r:50,small:1},
  move2:{t:"Déplace 2 cartes",n:2,r:50,small:1},
  disc3:{t:"Défausse 3 cartes",n:3,r:50,small:1},
  six6:{t:"Joue une carte de coût 6 au tour 6",n:1,r:50,small:1},
  oath:{t:"Tiens un Serment",n:1,r:100},
  fusion:{t:"Joue une ultra-légendaire",n:1,r:100},
  blitz1:{t:"Gagne une partie de Blitz",n:1,r:100},
  facwin:{t:"Gagne une partie avec au moins 6 cartes {f} dans ton deck",n:1,r:100},
  charwin:{t:"Gagne une partie avec {c} en jeu",n:1,r:100}
};
/* Quête de la semaine (du lundi au dimanche) */
const WQ={t:"Gagne 15 parties cette semaine",n:15,r:250};
function dayKey(d=new Date()){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function hoursToReset(){ const d=new Date(); return Math.max(1,Math.ceil((new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)-d)/36e5)); }
const RETIRED = ["mouette","pickpocket","guetteuse","serveuse","contrebandier","sentinelle","pretre","archiviste","ombre","garde","heraut","gardien"];

/* ======= SAUVEGARDE ======= */
const HIST_MAX=20;
const SAVE_KEY = "duel-helvara-save-v1", OWNER_KEY = "duel-helvara-save-owner";
function freshProfile(){ return {ld:"", name:"Voyageur "+(1000+Math.floor(Math.random()*9000)), rv:2, chf:0, w:0, l:0, d:0, owned:[], deck:[], sfx:true, music:true, vm:35, vs:100, cine:true, fan:[], avatar:null, tuto:false, starter:false, lv:0, st:0, streak:0, best:0, season:seasonKey(), sw:0, sl:0, sd:0, dw:0, dl:0, dd:0, dis:[], bz:{day:"",used:false,run:null}, decks:defDecks(), di:0, hist:[], sb:{day:"",ids:[]}, maj:MAJ[0].id}; }
let migratedNote="";
const COVERS=["primordial","desir","jugement","helvara"];
function defDecks(){ return COVERS.map((c,i)=>({name:`Deck ${i+1}`,cover:c,cards:[]})); }
function cleanDecks(arr,owned,deck){ const d=defDecks();
  if(Array.isArray(arr)) arr.slice(0,4).forEach((x,i)=>{ if(!x||typeof x!=="object") return; d[i].name=typeof x.name==="string"&&x.name.trim()?x.name.trim().slice(0,20):d[i].name; d[i].cover=COVERS.includes(x.cover)?x.cover:d[i].cover; d[i].cards=[...new Set(Array.isArray(x.cards)?x.cards:[])].filter(id=>owned.includes(id)).slice(0,ECO.deckSize); });
  else d[0].cards=[...deck];
  return d; }
/* historique : 20 parties, avec le détail par lieu, le deck, le gain et (contre l'IA) le rang atteint */
/* Statistiques anonymes de cartes : pour chaque carte que tu as jouée, le résultat de la partie, le mode et le lieu.
   Ni identifiant de compte ni pseudo ne partent avec (voir la page de confidentialité). Pas pour le tutoriel ni les reprises de duel. */
function statsSend(mode,res){
  if(!qLive()||!lbDb||!lbDb.stats||!S||!Array.isArray(S.played)||!S.played.length) return;
  const m=mode==="Blitz"?"blitz":mode==="Duel"?"duel":"ia"; const r=res==="win"||res==="lose"||res==="draw"?res:null; if(!r) return;
  lbDb.stats(m,r,S.played.slice(0,20),S.mp?"humain":"ia").catch(()=>{});   /* adversaire : humain (duel en ligne) ou IA (partie classique, Blitz) */
}
function pushHist(mode,res,opp,pw,ew,x={}){
  statsSend(mode,res);
  fjCount(S&&S.blitz&&P.bz&&P.bz.run?P.bz.run.deck:P.deck);
  const locs=S&&S.locs?S.locs.map((L,li)=>({id:L.id,p:total("p",li),e:total("e",li),w:leader(li)})):[];
  const cards=S&&S.blitz&&P.bz&&P.bz.run?P.bz.run.deck:P.deck;
  P.hist=[{mode,res,opp,sc:`${pw}–${ew}`,t:Date.now(),deck:mode==="Blitz"?"Deck de Blitz":(P.decks&&P.decks[P.di]?P.decks[P.di].name:""),
    locs,cards:[...(cards||[])].slice(0,12),gain:x.gain|0,pt:locs.reduce((a,l)=>a+l.p,0),et:locs.reduce((a,l)=>a+l.e,0),lv:x.lv==null?null:x.lv},...(P.hist||[])].slice(0,HIST_MAX);
}
function cleanHist(h){
  const n=(v,max)=>Math.min(max,Math.max(0,Number(v)|0));
  const o={mode:String(h.mode||"").slice(0,12),res:h.res,opp:String(h.opp||"").slice(0,48),sc:String(h.sc||"").slice(0,12),t:Number(h.t)||0,deck:String(h.deck||"").slice(0,20)};
  if(Array.isArray(h.locs)) o.locs=h.locs.filter(l=>l&&typeof l.id==="string"&&LOCS[l.id]).slice(0,3).map(l=>({id:l.id,p:Math.max(-999,Math.min(999,Number(l.p)|0)),e:Math.max(-999,Math.min(999,Number(l.e)|0)),w:l.w==="p"||l.w==="e"?l.w:null}));
  if(Array.isArray(h.cards)) o.cards=h.cards.filter(id=>typeof id==="string"&&POOL.includes(id)).slice(0,12);
  o.gain=n(h.gain,9999); o.pt=n(h.pt,9999); o.et=n(h.et,9999); o.lv=h.lv==null?null:n(h.lv,MAXLV);
  return o;
}
function cleanBz(b){ if(!b||typeof b!=="object") return {day:"",used:false,run:null};
  const ok=a=>Array.isArray(a)?a.filter(id=>POOL.includes(id)&&CARDS[id].r!=="U"):[];
  const r=b.run&&typeof b.run==="object"?{deck:ok(b.run.deck).slice(0,12),opts:ok(b.run.opts).slice(0,4),wins:Math.min(3,Math.max(0,b.run.wins|0)),over:!!b.run.over,gain:Math.max(0,b.run.gain|0)}:null;
  return {day:typeof b.day==="string"?b.day:"",used:!!b.used,run:r}; }
function clean(p){
  const f=freshProfile(); if(!p||typeof p!=="object") return f;
  const num=(v,d)=>Number.isFinite(v)&&v>=0?Math.floor(v):d;
  const rawOwned=Array.isArray(p.owned)?p.owned:[];
  const retired=rawOwned.filter(id=>RETIRED.includes(id)).length;
  const owned=[...new Set(rawOwned.filter(id=>POOL.includes(id)))];
  const deck=[...new Set(Array.isArray(p.deck)?p.deck:[])].filter(id=>owned.includes(id)).slice(0,ECO.deckSize);
  const out={at:num(p.at,0), name:(typeof p.name==="string"&&p.name.trim()?p.name.trim().slice(0,24):f.name), chf:num(p.chf,f.chf)+retired*25, w:num(p.w,0), l:num(p.l,0), d:num(p.d,0), owned, deck, sfx:p.sfx!==false,
    lv:Math.min(MAXLV,p.rv===2?num(p.lv,0):migrateLv(num(p.lv,0))), st:num(p.st,0), streak:num(p.streak,0), best:Math.min(MAXLV,p.rv===2?num(p.best,0):migrateLv(num(p.best,0))), rv:2,
    season:(typeof p.season==="string"&&/^\d{4}-\d{2}$/.test(p.season))?p.season:seasonKey(), sw:num(p.sw,0), sl:num(p.sl,0), sd:num(p.sd,0),
    tuto:p.tuto===undefined?true:!!p.tuto, starter:!!p.starter, avatar:(POOL.includes(p.avatar)?p.avatar:null), music:p.music!==false, vm:Math.min(100,num(p.vm,35)), vs:Math.min(100,num(p.vs,100)), cine:p.cine!==false, dis:(Array.isArray(p.dis)?p.dis.filter(x=>typeof x==="string").slice(0,20):[]), dw:num(p.dw,0), dl:num(p.dl,0), dd:num(p.dd,0), fan:(Array.isArray(p.fan)?p.fan.filter(id=>POOL.includes(id)).slice(0,3):[]),
    ld:(typeof p.ld==="string"?p.ld.slice(0,10):""), bz:cleanBz(p.bz), sb:(p.sb&&typeof p.sb.day==="string"&&Array.isArray(p.sb.ids))?{day:p.sb.day,ids:p.sb.ids.filter(x=>typeof x==="string").slice(0,3)}:{day:"",ids:[]}, hist:(Array.isArray(p.hist)?p.hist.filter(h=>h&&typeof h==="object"&&["win","lose","draw"].includes(h.res)).slice(0,HIST_MAX).map(cleanHist):[]), decks:cleanDecks(p.decks,owned,deck), di:Math.min(3,Math.max(0,p.di|0)),
    daily:(p.daily&&typeof p.daily.day==="string")?{day:p.daily.day.slice(0,10),n:Math.min(7,num(p.daily.n,0))}:{day:"",n:0},
    q:(p.q&&typeof p.q.day==="string"&&Array.isArray(p.q.list))?{day:p.q.day,rr:!!p.q.rr,list:p.q.list.filter(x=>x&&QDEF[x.id]).slice(0,2).map(x=>({id:x.id,p:Math.min(QDEF[x.id].n,num(x.p,0)),c:!!x.c,...(typeof x.x==="string"?{x:x.x.slice(0,24)}:{})}))}:null,
    fj:Object.fromEntries(FJ_KEYS.map(k=>[k,Math.min(9999,num(p.fj&&p.fj[k],0))])),
    pity:Math.min(99,num(p.pity,0)), maj:(typeof p.maj==="string"?p.maj.slice(0,20):""),
    ulk:Array.isArray(p.ulk)?p.ulk.filter(id=>ULof(id)&&!ULof(id).quest):ULS.filter(u=>!u.quest&&!u.fac&&u.req.length&&REL(u.id)&&!owned.includes(u.id)&&u.req.every(r=>hasReq(owned,r))).map(u=>u.id),
    wq:(p.wq&&typeof p.wq.wk==="string")?{wk:p.wq.wk.slice(0,10),p:Math.min(WQ.n,num(p.wq.p,0)),c:!!p.wq.c}:null};
  out.deck=[...out.decks[out.di].cards];
  if(retired){ out._migrated=true; migratedNote=`Nouvelle collection : ${retired} carte${retired>1?"s":""} provisoire${retired>1?"s":""} remboursée${retired>1?"s":""} (+${retired*25} CHF).`; }
  return out;
}
function lsRead(){ try{ return JSON.parse(localStorage.getItem(SAVE_KEY)); }catch(e){ return null; } }
function lsWrite(){ if(window.__wiped) return; try{ localStorage.setItem(SAVE_KEY, JSON.stringify(dataOf())); }catch(e){} }
function dataOf(){ const {_migrated,...d}=P; return d; }
let seasonNote="";
function checkSeason(){
  const k=seasonKey(); if(P.season===k) return false;
  const endTier=tierOf(P.best), reward=25*(endTier+1), newLv=START[Math.max(0,tierOf(P.lv)-3)];
  seasonNote=`Nouvelle saison ! Tu as fini au rang ${rankName(P.best)} (+${reward} CHF) et tu reprends à ${rankName(newLv)}.`;
  P.chf+=reward; P.lv=newLv; P.st=0; P.streak=0; P.best=newLv; P.sw=0; P.sl=0; P.sd=0; P.season=k;
  return true;
}
let dailyNote="";
function claimDaily(){
  const t=today(), d=P.daily||{day:"",n:0}; if(d.day===t) return;
  const y=new Date(); y.setDate(y.getDate()-1);
  const n=d.day===dayKey(y)?(d.n%7)+1:1, gain=n===7?50:20;
  P.daily={day:t,n}; P.chf+=gain; save();
  dailyNote=n===7?`7e jour d'affilée : +${gain} CHF !`:`Connexion du jour : +${gain} CHF (jour ${n} sur 7, le 7e rapporte 50 CHF).`;
}
/* Une quête n'est proposée que si le joueur a de quoi la remplir */
const QMOVERS=["hermes","eris","susanoo","set","heimdall"], QDISC=["mendiant","melinoe","odin","lipdentelle","dionysos","morrigan_h"], QCHARS=["yarden","jordan","izzy","apsu"];
const qFacs=()=>Object.keys(FAC).filter(f=>P.owned.filter(id=>CARDS[id]&&CARDS[id].fac===f).length>=6);
const qChars=()=>QCHARS.filter(ch=>P.owned.some(id=>CARDS[id]&&charOf(id)===ch));
const QOK={helv4:()=>P.owned.filter(id=>CARDS[id]&&CARDS[id].fac==="helvara").length>=4, move2:()=>P.owned.some(id=>CARDS[id]&&QMOVERS.includes(charOf(id))),
  disc3:()=>P.owned.some(id=>QDISC.includes(id)), six6:()=>P.owned.some(id=>CARDS[id]&&CARDS[id].cost>=6), fusion:()=>P.owned.some(id=>CARDS[id]&&CARDS[id].r==="U"),
  blitz1:()=>!!P.starter, facwin:()=>qFacs().length>0, charwin:()=>qChars().length>0};
const qOk=id=>!QOK[id]||QOK[id]();
function mkQuest(id,seed){ const q={id,p:0,c:false};
  if(id==="facwin"){ const f=qFacs(); q.x=f[seed%f.length]; } if(id==="charwin"){ const ch=qChars(); q.x=ch[seed%ch.length]; } return q; }
const qText=q=>QDEF[q.id].t.replace("{f}",q.x&&FAC[q.x]?FAC[q.x].n:"").replace("{c}",q.x&&CARDS[q.x]?CARDS[q.x].name:"");
/* Tirage du jour : même quêtes pour tout le monde un jour donné (selon la collection), mais vraiment mélangées d'un jour à l'autre.
   L'ancien calcul (s*31 + caractère) n'avançait que de 1 par jour : la grande quête et son personnage restaient les mêmes une semaine
   (« Gagne avec Apsu » 3 jours de suite, signalé par Jordan le 17 octobre). Une quête d'hier n'est pas reprise le lendemain. */
/* Lieu à l'honneur (22 octobre 2026, Jordan) : le samedi et le dimanche, un même lieu, tiré par le jour (donc le même pour tout le monde), est présent dans toutes les parties :
   contre l'IA, Blitz et duels (l'hôte du duel choisit les lieux, l'invité les reçoit). +25 CHF à la fin de la première partie du jour contre l'IA (victoire ou non), une fois par jour (P.ld). */
const FEATURE_CHF=25;
const featureOn=()=>{ const d=new Date(today()+"T12:00:00").getDay(); return d===0||d===6; };
const featureLoc=()=>{ if(!featureOn()) return null; const pool=locPool(); return pool.length?pool[qHash(today()+"|lieu")%pool.length]:null; };
const qHash=str=>{ let h=2166136261; for(const ch of str){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } h^=h>>>15; h=Math.imul(h,0x85ebca6b); h^=h>>>13; h=Math.imul(h,0xc2b2ae35); h^=h>>>16; return h>>>0; };
function qDraw(k){
  const sm=Object.keys(QDEF).filter(id=>QDEF[id].small&&qOk(id)), bg=Object.keys(QDEF).filter(id=>!QDEF[id].small&&qOk(id));
  return {sm, bg, a:qHash(k+"|petite")%sm.length, b:qHash(k+"|grande")%bg.length, x:qHash(k+"|cible")};
}
/* Quêtes retenues pour le jour k : le tirage du jour, décalé d'un cran s'il retombe sur celles retenues la veille (calcul limité à 7 jours en arrière) */
function qPick(k,depth=7){
  const d=qDraw(k); if(depth<=0) return d;
  const y=new Date(k+"T12:00:00"); y.setDate(y.getDate()-1); const p=qPick(dayKey(y),depth-1);
  if(d.sm.length>1&&d.sm[d.a]===p.sm[p.a]) d.a=(d.a+1)%d.sm.length;
  if(d.bg.length>1&&d.bg[d.b]===p.bg[p.b]) d.b=(d.b+1)%d.bg.length;
  return d;
}
function ensureQuests(k=dayKey()){
  if(P.q&&P.q.day===k&&P.q.list.length===2) return false;
  const d=qPick(k);
  P.q={day:k,rr:false,list:[mkQuest(d.sm[d.a],d.x),mkQuest(d.bg[d.b],d.x)]};
  return true;
}
function weekKey(){ const d=new Date(today()+"T12:00:00"); d.setDate(d.getDate()-(d.getDay()+6)%7); return dayKey(d); }
function ensureWeek(){ const k=weekKey(); if(P.wq&&P.wq.wk===k) return false; P.wq={wk:k,p:0,c:false}; return true; }
function qProg(id,n=1){ if(!P.q||n<=0) return; for(const q of P.q.list) if(q.id===id&&!q.c) q.p=Math.min(QDEF[id].n,q.p+n); }
/* Hors tutoriel, hors simulation de l'IA et hors reprise d'un duel en ligne */
const qLive=()=>!!(P.q&&S&&!S.tut&&!quiet&&!(S.mp&&S.mp.replaying));
/* Fin de partie gagnée : faction, personnage, Blitz, quête de la semaine */
function qEnd(res,blitz){
  if(res!=="win") return; const dk=(blitz&&P.bz&&P.bz.run)?P.bz.run.deck:P.deck;
  for(const q of P.q.list){ if(q.c) continue;
    if(q.id==="facwin"&&dk.filter(id=>CARDS[id]&&CARDS[id].fac===q.x).length>=6) q.p=1;
    if(q.id==="charwin"&&S.board.p.some(col=>col.some(c=>c.rev&&charOf(c.id)===q.x))) q.p=1; }
  if(blitz) qProg("blitz1");
  ensureWeek(); if(!P.wq.c) P.wq.p=Math.min(WQ.n,P.wq.p+1);
}
let P = clean(lsRead());
{ const a=checkSeason(), b=ensureQuests(), c=ensureWeek(); if(a||b||c) lsWrite(); }
let packOpen=null, gz=null, lpTimer=null, lpFired=false;
let storeReady=false, tutoStep=-1, hlStarter=false, packFocus=null, avPick=false, zoomId=null, fanPick=null;
const rankIcon=(lv,cls="")=>`<img class="rkicon ${cls}" src="images/rangs/${tierOf(lv)}.webp?v=2" alt="${TIERS[tierOf(lv)]}">`;
function avatarHTML(cls=""){ const a=P.avatar&&P.owned.includes(P.avatar)?P.avatar:null; return a?`<span class="avatar ${cls}" style="background-image:url('images/avatars/${a}.webp?v=7')"></span>`:`<span class="avatar ${cls} empty">${esc(P.name.charAt(0).toUpperCase())}</span>`; }
let dbDoc=null, store="local", writing=false, again=false, saveTimer=null, lastPack=null;
/* P.at : heure de la dernière modification. Au chargement, la sauvegarde locale l'emporte sur celle du compte
   si elle est plus récente et appartient au même joueur (OWNER_KEY) : un envoi raté (réseau, téléphone en veille)
   ne fait plus perdre un achat quand la page est rechargée. Un envoi raté est retenté, et envoyé tout de suite quand la page se cache. */
let dirty=false, retryMs=3000;
/* Pastille « Sauvegarde » (hors de #app, donc jamais effacée par render()) : « Sauvegarde… » si l'envoi dure,
   « Sauvegardé ✓ » 2 s après un envoi réussi, « Envoi en attente… » tant qu'un envoi a échoué (il est retenté). */
let syncEl=null, syncT=null, syncSlow=null;
function syncShow(kind){
  clearTimeout(syncT);
  if(!kind){ if(syncEl) syncEl.className="syncb"; return; }
  if(!syncEl){ syncEl=document.createElement("div"); syncEl.setAttribute("role","status"); syncEl.setAttribute("aria-live","polite"); document.body.appendChild(syncEl); }
  const txt={wait:"Sauvegarde…",ok:"Sauvegardé ✓",fail:"Envoi en attente… (retenté)"}[kind];
  syncEl.textContent=trUI(txt); syncEl.className="syncb on "+kind;
  if(kind==="ok") syncT=setTimeout(()=>syncShow(null),2000);
}
let lastSaveAt=0;
function lastSaveText(){
  if(!dbDoc) return "Dernière sauvegarde : sur cet appareil seulement";
  if(dirty||writing) return "Dernière sauvegarde : envoi en cours…";
  if(!lastSaveAt) return "Dernière sauvegarde : aucune depuis l'ouverture";
  const s=Math.max(0,Math.round((Date.now()-lastSaveAt)/1000));
  return s<5?"Dernière sauvegarde : à l'instant":s<60?`Dernière sauvegarde : il y a ${s} s`:`Dernière sauvegarde : il y a ${Math.round(s/60)} min`;
}
function syncLine(){ const el=document.getElementById("synclast"); if(el) el.textContent=trUI(lastSaveText()); }
setInterval(syncLine,3000);
function save(){ if(window.__wiped) return; if(P.decks&&P.decks[P.di]) P.decks[P.di].cards=[...P.deck]; P.at=Date.now(); lsWrite(); dirty=true; clearTimeout(saveTimer); saveTimer=setTimeout(flush,500); }
async function flush(){
  if(!dbDoc) return;
  if(writing){ again=true; return; }
  writing=true; dirty=false; clearTimeout(saveTimer);
  clearTimeout(syncSlow); syncSlow=setTimeout(()=>{ if(writing&&!document.hidden) syncShow("wait"); },1200);
  let okSend=false;
  try{ await dbDoc.set(dataOf()); store="cloud"; retryMs=3000; okSend=true; lastSaveAt=Date.now(); }
  catch(e){ store="local"; dirty=true; saveTimer=setTimeout(flush,retryMs); retryMs=Math.min(60000,retryMs*2); }
  clearTimeout(syncSlow);
  if(okSend){ if(!dirty&&!again) syncShow("ok"); } else syncShow("fail");
  writing=false; syncLine();
  if(again){ again=false; flush(); }
}
function flushNow(){ if(!window.__wiped&&dirty&&dbDoc) flush(); }
document.addEventListener("visibilitychange", ()=>{ if(document.hidden) flushNow(); });
addEventListener("pagehide", flushNow);
async function initStore(){
  if(window.__sandbox) return;   /* bac à sable (?date=) : ni lecture ni écriture du compte */
  try{
    if(!window.claude || !window.claude.use) { if(P._migrated) save(); return; }
    const [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);
    if(!db||!user){ if(P._migrated) save(); return; }
    const uid=await user.id(); if(!uid){ if(P._migrated) save(); return; }
    lbUid=uid;
    dbDoc=db.doc("data/users/"+uid+"/save");
    const snap=await dbDoc.get(), loc=lsRead(); let owner=null; try{ owner=localStorage.getItem(OWNER_KEY); }catch(e){}
    const cloudAt=snap.exists?Number((snap.data()||{}).at)||0:0, localNewer=owner===uid&&!!loc&&(Number(loc.at)||0)>cloudAt;
    if(snap.exists&&!localNewer){ migratedNote=""; seasonNote=""; P=clean(snap.data()); const ns=checkSeason()|ensureQuests(); lsWrite(); if(P._migrated||ns) await dbDoc.set(dataOf()); }
    else await dbDoc.set(dataOf());
    try{ localStorage.setItem(OWNER_KEY,uid); }catch(e){}
    delete P._migrated; store="cloud"; lbInit(db,uid); render();
  }catch(e){ store="local"; if(P._migrated) save(); lbCanWrite=false; try{ const db=await window.claude.use("db"); if(db&&lbUid) lbInit(db,lbUid); }catch(_){ } render(); }
}

function accountHTML(){
  if(window.__sandbox) return "Mode test : rien n'est sauvegardé (ni sur cet appareil, ni sur ton compte).";
  const h=window.helvara;
  return accountMain(h)+` <div class="synclast" id="synclast">${esc(trUI(lastSaveText()))}</div>`;
}
function accountMain(h){
  if(store==="cloud"&&h&&h.google) return `Progression sauvegardée sur ton compte Google${h.email?` (${esc(h.email)})`:""}. <button class="toggle" data-act="glogout">Se déconnecter</button>`;
  if(store==="cloud") return `Progression sauvegardée pour cet appareil. <button class="toggle" data-act="glogin">Se connecter avec Google</button> pour la retrouver partout.`;
  return `Progression sauvegardée sur cet appareil.${h&&h.error?` <span class="hint">${esc(h.error)}</span>`:""}`;
}

/* ======= CLASSEMENT ======= */
let lbDb=null, lbUid=null, lbRows=[], lbCanWrite=true;
const LB_SEASON=()=>seasonKey();
function lbMe(){ return {nick:P.name.slice(0,24),av:(P.avatar&&P.owned.includes(P.avatar))?P.avatar:null,lv:P.lv,st:P.st,best:P.best,sw:P.sw,sl:P.sl,season:P.season,uid:lbUid||null,rv:2}; }
function lbClean(x){ if(!x||typeof x!=="object") return null; const n=v=>Number.isFinite(v)?Math.max(0,Math.min(999,Math.floor(v))):0;
  return {nick:(typeof x.nick==="string"&&x.nick.trim()?x.nick.trim().slice(0,24):"Joueur"),av:POOL.includes(x.av)?x.av:null,lv:Math.min(MAXLV,x.rv===2?n(x.lv):migrateLv(n(x.lv))),st:n(x.st),best:Math.min(MAXLV,x.rv===2?n(x.best):migrateLv(n(x.best))),sw:n(x.sw),sl:n(x.sl),season:typeof x.season==="string"?x.season.slice(0,7):"",at:Number(x.at)||0}; }
/* Lecture du classement : les 100 meilleurs de la saison (et quelques joueurs du mois précédent) + ta ligne, triés par la base.
   Pas de temps réel ni de relecture toutes les minutes : on relit au chargement, en revenant au premier plan et en ouvrant
   l'accueil ou le classement (au plus une fois toutes les 30 s). */
let lbAt=0, lbBusy=false;
async function lbRefresh(force){
  if(!lbDb||!lbDb.boardTop||lbBusy||document.hidden) return; if(!force&&Date.now()-lbAt<30000) return;
  lbBusy=true;
  try{ const rows=await lbDb.boardTop(seasonKey()); lbRows=rows.map(r=>({id:r.id,...lbClean(r.data)})).filter(r=>r.nick); lbAt=Date.now(); if(screen==="board"||screen==="home") render(); }
  catch(e){} finally{ lbBusy=false; } }
async function lbInit(db,uid){ lbDb=db; lbUid=uid; lbRefresh(true); lbPublish(); }
/* Ligne du joueur dans le classement. Un envoi raté (réseau, session expirée au réveil du téléphone) n'arrête plus
   le classement pour toute la visite : il est retenté (5 s, puis jusqu'à 2 min) et renvoyé quand la page revient au premier plan.
   (L'ancien relais hérité des artefacts, qui écrivait la ligne des autres joueurs, est retiré : Supabase ne le permet pas.) */
let lbRetry=null, lbWait=5000, lbDirty=false;
function lbPublish(){ const me=lbMe();
  if(!lbDb||!lbUid) return; clearTimeout(lbRetry); lbDirty=true;
  lbDb.doc("board/"+lbUid).set({...me,at:Date.now()}).then(()=>{ lbDirty=false; lbWait=5000; },e=>{
    if(e&&e.code==="not_granted"){ lbCanWrite=false; return; }
    lbRetry=setTimeout(lbPublish,lbWait); lbWait=Math.min(120000,lbWait*2); }); }
document.addEventListener("visibilitychange", ()=>{ if(document.hidden) return; if(lbDirty) lbPublish(); if(screen==="board"||screen==="home") lbRefresh(); });
function lbCount(){ return lbRows.filter(r=>r.season===seasonKey()&&r.id!==lbUid&&(r.lv||r.st||r.sw||r.sl||r.best)).length+1; }
function boardHTML(){
  const map={}; for(const r of lbRows) map[r.id]=r; const act=r=>r.id!==lbUid&&r.at&&Date.now()-r.at<6e5;
  if(lbUid) map[lbUid]={...lbClean(lbMe()),id:lbUid};
  const k=LB_SEASON(); const all=Object.values(map).filter(r=>r&&r.nick&&(r.id===lbUid||r.lv||r.st||r.sw||r.sl||r.best));
  const cur=all.filter(r=>r.season===k).sort((a,b)=>b.lv-a.lv||b.st-a.st||b.sw-a.sw), old=all.filter(r=>r.season!==k);
  const row=(r,i)=>`<div class="lbrow ${r.id===lbUid?"me":""}"><span class="lbn">${i+1}</span>${r.av?`<span class="avatar sm" style="background-image:url('images/avatars/${r.av}.webp?v=7')"></span>`:`<span class="avatar sm empty">${esc(r.nick.charAt(0).toUpperCase())}</span>`}<span class="lbmain"><b>${esc(r.nick)}${r.id===lbUid?" (toi)":""}</b>${act(r)?`<i class="lbon">actif</i>`:""}<small>${rankName(r.lv)} · ${r.sw} V · ${r.sl} D</small></span>${rankIcon(r.lv,"sm")}</div>`;
  return `<section class="sec"><h2>Classement · ${seasonLabel()}</h2>
    <p class="hint">Les 100 meilleurs de la saison. « actif » signale les joueurs vus ces 10 dernières minutes.${store!=="cloud"?" Ta progression n'est pas sauvegardée sur ton compte : tu n'apparais pas dans le classement des autres.":""}</p>
    <div class="lb">${cur.map(row).join("")||`<p class="hint">Personne n'a encore joué cette saison.</p>`}</div></section>
    ${old.length?`<section class="sec"><h2>Pas encore vus cette saison</h2><div class="lb old">${old.map((r,i)=>row(r,i)).join("")}</div></section>`:""}`;
}
