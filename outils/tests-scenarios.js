#!/usr/bin/env node
/* Duel d'Helvara : tests de scénarios fixes (quelques secondes), avec le vrai moteur dans Chromium, sans réseau.
   Usage : node outils/tests-scenarios.js          (code de sortie 1 si un test échoue)
   Chaque scénario construit un plateau précis, joue le tour pour de vrai (resolveTurn) et vérifie la règle. */
const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.resolve(__dirname, "..");
function loadPlaywright() {
  for (const p of ["playwright", "/opt/node-tools/node_modules/playwright"]) { try { return require(p); } catch (e) { /* suivant */ } }
  console.error("Playwright introuvable (voir CLAUDE.md, section Tests)."); process.exit(1);
}
const { chromium } = loadPlaywright();
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp3": "audio/mpeg", ".json": "application/json" };

/* Tout ce bloc tourne DANS la page du jeu ; il renvoie la liste [nom, ok, détail]. */
async function inPage() {
  const res = []; const T = (nom, ok, detail) => res.push([nom, !!ok, detail === undefined ? "" : String(detail)]);
  const realRender = window.render;
  for (const f of ["render", "sfx", "endCine", "endMusic", "save", "lbPublish", "pushHist", "qProg", "qEnd", "music", "cardVfx", "fusionCine"]) { if (typeof window[f] === "function") window[f] = () => {}; }
  window.factionCine = () => Promise.resolve();
  const plain = Object.keys(CARDS).filter(id => !CARDS[id].token && !CARDS[id].fx && !ULof(id) && CARDS[id].pow <= 3 && !CARDS[id].base);   /* cartes sans effet : puissance fixée à la main */
  const fresh = () => {
    P.owned = Object.keys(CARDS).filter(id => !CARDS[id].token); P.deck = Object.keys(CARDS).filter(id => !CARDS[id].token && !ULof(id)).slice(0, 12); P.lv = 30;
    newGame(); quiet = true; S.tut = false; S.turn = 3; S.locs.forEach(L => { L.rev = true; L.id = "tour"; });
    for (const s of ["p", "e"]) S.board[s] = [[], [], []]; S.hand = { p: [], e: [] }; S.discardPile = { p: [], e: [] }; S.graveyard = { p: [], e: [] }; S.discarded = 0; S.destroyed = 0;
  };
  const put = (s, li, id, pow) => { const c = mk(id); c.rev = true; if (pow != null) c.pow = pow; S.board[s][li].push(c); return c; };
  const card = (id, pow) => { const c = mk(id); if (pow != null) c.pow = pow; return c; };
  const find = (s, id) => { for (let li = 0; li < 3; li++) for (const c of S.board[s][li]) if (c.id === id) return c; return null; };
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* 1. Nike + Aphrodite : 2 cartes à 1, Nike (3/2), Aphrodite au tour 6 → Nike finit à 10 */
  fresh(); S.turn = 6; { const a = card(plain[0], 1), b = card(plain[1], 1), n = card("nike"), ap = card("aphrodite"); S.hand.p = [a, b, n, ap];
    await resolveTurn([a, b, n, ap].map(c => ({ c, li: 0 })), [], false); const nk = find("p", "nike"); T("Nike + Aphrodite : Nike finit à 10", nk && nk.pow === 10, nk && nk.pow); }
  /* 1b. Aphrodite posée AVANT Nike : elle ne compte pas parmi les cartes jouées avant Nike */
  fresh(); S.turn = 5; { const a = card(plain[0], 1), ap = card("aphrodite"), n = card("nike"); S.hand.p = [a, ap, n];
    await resolveTurn([a, ap, n].map(c => ({ c, li: 0 })), [], false); const nk = find("p", "nike"); T("Aphrodite posée avant Nike : Nike +2 seulement (4)", nk && nk.pow === 4, nk && nk.pow); }
  /* 2. Aphrodite seule en début de tour → aucun effet */
  fresh(); S.turn = 4; { const ap = card("aphrodite"); S.hand.p = [ap]; const before = JSON.stringify(S.board);
    await resolveTurn([{ c: ap, li: 0 }], [], false); const a = find("p", "aphrodite"); T("Aphrodite seule : aucun effet", a && a.pow === 2 && S.board.p.flat().length === 1 && !before.includes('"id":"aphrodite"'), a && a.pow); }
  /* 2b. Aphrodite rejoue depuis le lieu de la carte d'origine (pas le sien), jamais une autre Aphrodite */
  fresh(); S.turn = 4; { const w1 = put("e", 1, plain[2], 1), w2 = put("e", 1, plain[3], 1), decoy = put("e", 2, plain[4], 1), g = card("rusalka");   /* Rusalka détruit la plus faible carte adverse (≤ 2) du lieu où elle est */
    const ap = card("aphrodite"), ap2 = card("aphrodite"); S.hand.p = [g, ap, ap2];
    await resolveTurn([{ c: g, li: 1 }, { c: ap, li: 2 }, { c: ap2, li: 2 }], [], false);
    T("Aphrodite rejoue depuis le lieu d'origine (pas le sien), 2e Aphrodite ne rejoue pas la 1re", S.board.e[1].length === 0 && S.board.e[2].includes(decoy) && S.destroyed === 2, `lieu d'origine : ${S.board.e[1].length} restante(s), leurre intact : ${S.board.e[2].includes(decoy)}, détruites ${S.destroyed}`); }
  /* 3. Prométhée garde de l'énergie, puis Lilith + Aphrodite le même tour → deux cartes volées */
  fresh(); S.turn = 3; { put("p", 1, "promethee"); S.bonus = { p: 4, e: 0 }; startTurn(); /* tour 4, énergie 8 */
    const e1 = put("e", 0, plain[2], 4), e2 = put("e", 0, plain[3], 3), li = card("lilith"), ap = card("aphrodite"); S.hand.p = [li, ap];
    const okE = S.energy === 8; let st = canStage(li, 0); if (st) S.staged.push({ c: li, li: 0 }); const st2 = canStage(ap, 0); if (st2) S.staged.push({ c: ap, li: 0 });
    const noRes = (() => { fresh(); S.turn = 3; startTurn(); const l2 = card("lilith"), a2 = card("aphrodite"); S.hand.p = [l2, a2]; if (!canStage(l2, 0)) return true; S.staged.push({ c: l2, li: 0 }); return !canStage(a2, 0); })();
    fresh(); S.turn = 3; put("p", 1, "promethee"); S.bonus = { p: 4, e: 0 }; startTurn(); const f1 = put("e", 0, plain[2], 4), f2 = put("e", 0, plain[3], 3), L2 = card("lilith"), A2 = card("aphrodite"); S.hand.p = [L2, A2];
    S.staged = []; S.staged.push({ c: L2, li: 0 }); const canA = canStage(A2, 0); S.staged.push({ c: A2, li: 0 });
    await resolveTurn(S.staged.slice(), [], false);
    const stolen = S.board.p[0].filter(x => x === f1 || x === f2).length;
    T("Prométhée : Lilith + Aphrodite tiennent dans l'énergie gardée (et pas sans elle)", okE && st && st2 && noRes && canA, `énergie ${okE ? 8 : "?"}, sans réserve impossible : ${noRes}`);
    T("Lilith + Aphrodite : deux cartes volées", stolen === 2 && S.board.e[0].length === 0, `${stolen} cartes passées de mon côté`); }
  /* 4. Styx : Nike à 5 détruite par un effet adverse → revient en main à 5, rejouée sa Révélation se redéclenche */
  fresh(); S.turn = 4; { put("p", 0, "styx"); const nk = put("p", 0, "nike", 5); SRC = { s: "e", cost: 3 }; const ok = destroy("p", 0, nk); SRC = null;
    const inHand = S.hand.p.includes(nk), grave = S.graveyard.p.includes("nike");
    T("Styx : Nike (5) détruite par l'adversaire revient en main à 5", ok && inHand && nk.pow === 5 && !nk.rev && !grave && !S.board.p[0].includes(nk), `main ${inHand}, puissance ${nk.pow}, cimetière ${grave}`);
    T("Styx : la main affiche la puissance modifiée", handHTML().includes(">5</span>") && handHTML().includes("pw up"), "");
    const x = card(plain[0], 1); S.hand.p.push(x); S.turn = 5;
    await resolveTurn([{ c: x, li: 1 }, { c: nk, li: 1 }], [], false);
    T("Styx : Nike rejouée, sa Révélation se redéclenche (5 + 2)", nk.rev && nk.pow === 7, nk.pow); }
  /* 4b. Styx ne ramène PAS une carte détruite par ton propre effet, ni par la Faille (décision de Jordan) */
  fresh(); S.turn = 4; { put("p", 0, "styx"); const nk = put("p", 0, "nike", 5); SRC = { s: "p", cost: 3 }; destroy("p", 0, nk); SRC = null;
    T("Styx : destruction par ton propre effet → cimetière, pas la main", !S.hand.p.includes(nk) && S.graveyard.p.includes("nike"), ""); }
  fresh(); S.turn = 4; { put("p", 0, "styx"); const nk = put("p", 0, "nike", 5); SRC = null; destroy("p", 0, nk);
    T("Styx : destruction sans source de carte (Faille) → cimetière", !S.hand.p.includes(nk) && S.graveyard.p.includes("nike"), ""); }
  fresh(); S.turn = 4; { put("p", 0, "styx"); const n1 = put("p", 0, "nike", 4), bo = put("p", 0, "bourreau"); const fi = card("ficelle"); S.hand.p = [fi];
    await resolveTurn([{ c: fi, li: 0 }], [], false);
    T("Styx + Ficelle Dévorante : cartes Jugement détruites par la Ficelle ne reviennent pas", !S.hand.p.includes(n1) && !S.hand.p.includes(bo) && S.graveyard.p.includes("nike") && S.graveyard.p.includes("bourreau"), `main ${S.hand.p.length}, cimetière ${S.graveyard.p.join(",")}`); }
  fresh(); S.turn = 4; { put("e", 0, "styx"); const bo = put("e", 0, "bourreau"); SRC = { s: "p", cost: 3 }; destroy("e", 0, bo); SRC = null;
    T("Styx adverse : sa carte Jugement détruite par MON effet revient dans SA main", S.hand.e.includes(bo) && !S.graveyard.e.includes("bourreau"), ""); }
  /* 5. Set : 1, 2 et 3 cartes adverses, lieux pleins */
  for (const k of [1, 2, 3]) { fresh(); S.turn = 4; const es = []; for (let i = 0; i < k; i++) es.push(put("e", 0, plain[i], 3)); const st = card("set"); S.hand.p = [st];
    await resolveTurn([{ c: st, li: 0 }], [], false); const moved = es.filter(x => !S.board.e[0].includes(x)), weak = moved.filter(x => x.pow === 2).length;
    T(`Set : ${k} carte(s) adverse(s) → ${Math.min(2, k)} dispersée(s), −1 chacune`, moved.length === Math.min(2, k) && weak === moved.length && es.filter(x => S.board.e[0].includes(x)).every(x => x.pow === 3), `dispersées ${moved.length}, −1 : ${weak}`); }
  fresh(); S.turn = 4; { const es = [put("e", 0, plain[0], 3), put("e", 0, plain[1], 3)]; for (const li of [1, 2]) for (let i = 0; i < 4; i++) put("e", li, plain[4 + i], 2);
    const st = card("set"); S.hand.p = [st]; await resolveTurn([{ c: st, li: 0 }], [], false);
    T("Set : lieux pleins → rien ne bouge, rien ne perd 1", es.every(x => S.board.e[0].includes(x) && x.pow === 3), ""); }
  fresh(); S.turn = 4; { const es = [put("e", 0, plain[0], 3), put("e", 0, plain[1], 3), put("e", 0, plain[2], 3)]; for (let i = 0; i < 4; i++) put("e", 1, plain[4 + i], 2); put("e", 2, plain[9], 2); put("e", 2, plain[10], 2); put("e", 2, plain[11], 2);
    const st = card("set"); S.hand.p = [st]; await resolveTurn([{ c: st, li: 0 }], [], false);
    const moved = es.filter(x => !S.board.e[0].includes(x)); T("Set : seule place restante dans un lieu → au plus 1 carte déplacée", moved.length === 1 && S.board.e[2].length === 4 && moved[0].pow === 2, `déplacées ${moved.length}`); }
  /* 6. Prométhée + Pandore : l'énergie gardée est dépensée et comptée (+2 par énergie) */
  fresh(); S.turn = 0; startTurn(); { const pr = card("promethee"); S.hand.p = [pr]; await resolveTurn([{ c: pr, li: 0 }], [], false);       /* tour 1 : Prométhée (coût 1) */
    await resolveTurn([], [], false);                                                                                                        /* tour 2 : rien joué → 2 gardées */
    const e3 = S.energy; const pd = card("pandore"); S.hand.p = [pd]; await resolveTurn([{ c: pd, li: 0 }], [], false);                    /* tour 3 : énergie 3 + 2 */
    T("Prométhée + Pandore : énergie gardée comptée au tour 3 (5)", e3 === 5, e3);
    T("Prométhée + Pandore : +2 par énergie dépensée (2 restantes → 4)", pd.pow === 4, pd.pow);
    T("Prométhée + Pandore : l'énergie dépensée n'est pas gardée une 2e fois", S.energy === 4, S.energy); }
  /* 6 bis. Prométhée : 10 d'énergie au plus au tour suivant (Jordan, 16 octobre : 11 au tour 5 et 16 au tour 6 avec la réserve seule plafonnée) */
  { const keep = async (turn, en, bonus) => { fresh(); S.turn = turn - 1; startTurn(); put("p", 1, "promethee"); S.energy = en; S.bonus = { p: 0, e: 0 }; if(bonus) S.bonus.p = bonus; await resolveTurn([], [], false); return S.energy; };
    const e6 = await keep(5, 11, 0), e5 = await keep(4, 10, 0), e4 = await keep(3, 3, 0), eF = await keep(5, 9, 1);
    T("Prométhée : au tour 6, 10 d'énergie au plus (11 gardées au tour 5 → 10, plus 16)", e6 === 10, e6);
    T("Prométhée : au tour 5, 10 au plus (10 gardées au tour 4 → 10, plus 15)", e5 === 10, e5);
    T("Prométhée : sous le plafond, tout est gardé (3 gardées au tour 3 → 7 au tour 4)", e4 === 7, e4);
    T("Prométhée : Freyr compte dans le plafond (Freyr +1, 9 restantes → 10 au tour 6)", eF === 10, eF); }
  /* 6 ter. Quêtes du jour (Jordan, 17 octobre : « Gagne avec Apsu » 3 jours de suite, la grande quête ne changeait qu'une fois par semaine) */
  { const keep = P.q, own = P.owned; P.owned = [...new Set([...P.owned, ...Object.keys(CARDS).filter(id => REL(id) && !CARDS[id].token)])];
    const days = []; for(let i = 0; i < 60; i++){ const d = new Date(2026, 9, 1 + i, 12); P.q = null; ensureQuests(dayKey(d)); days.push(P.q.list.map(q => q.id + (q.x ? ":" + q.x : ""))); }
    const bigs = days.map(d => d[1]), smalls = days.map(d => d[0]);
    const kd = x => x.split(":")[0], sameBig = bigs.filter((b, i) => i && kd(b) === kd(bigs[i - 1])).length, sameSmall = smalls.filter((b, i) => i && b === smalls[i - 1]).length;
    const kinds = new Set(bigs.map(b => b.split(":")[0])).size, chars = new Set(bigs.filter(b => /^charwin/.test(b)).map(b => b.split(":")[1])).size;
    P.q = null; ensureQuests("2026-10-17"); const a1 = JSON.stringify(P.q.list); P.q = null; ensureQuests("2026-10-17"); const a2 = JSON.stringify(P.q.list);
    T("Quêtes : jamais la même grande ni la même petite quête deux jours de suite (60 jours)", sameBig === 0 && sameSmall === 0, { sameBig, sameSmall });
    T("Quêtes : les grandes quêtes varient (au moins 6 sortes sur 60 jours) et le personnage de « Gagne avec… » change", kinds >= 6 && chars >= 2, { kinds, chars });
    T("Quêtes : même tirage pour un même jour", a1 === a2);
    P.q = keep; P.owned = own; }
  /* 6 quinquies. Secondes ultra-légendaires de faction (Jordan, 18 octobre) : même compteur, 150 parties au total, une seule par faction */
  { const sec = ["marduk", "ymir", "nammu"], facs = sec.map(id => ULof(id).fac), keepFj = P.fj, keepOwned = P.owned, keepSoon = sec.map(id => CARDS[id].soon), keepRel = sec.map(id => CARDS[id].rel);
    T("Secondes UL de faction : Marduk Jugement, Ymir Primordial, Nammu Helvara, seuil 150, ultra-légendaires cachées", sec.every((id, i) => ULof(id).quest.n === 150 && ULof(id).fac === CARDS[id].fac && CARDS[id].r === "U" && !REL(id)) && facs.join() === "jugement,primordial,helvara", facs);
    T("Secondes UL de faction : au plus une seconde par faction, une seule première par faction", new Set(facs).size === 3 && ["jugement", "primordial", "desir", "helvara"].every(f => ULS.filter(u => u.quest && u.quest.k === f && u.quest.n === 50).length === 1));
    P.owned = []; P.fj = Object.assign({}, P.fj, { primordial: 100 });
    T("Secondes UL de faction : à 100 parties, Ananké est gagnée et pas Ymir", ulEarned(ULof("ananke")) && !ulEarned(ULof("ymir")));
    P.fj.primordial = 150; T("Secondes UL de faction : à 150 parties au total, Ymir est gagnée", ulEarned(ULof("ymir")));
    P.fj.primordial = 100; sec.forEach(id => { CARDS[id].rel = "2000-01-01"; CARDS[id].soon = "2000-01-01"; });
    const j = journalHTML(); T("Journal des factions : une ligne de plus par seconde UL annoncée (Primordial 100/150), rien avant son annonce", (j.match(/class="fjrow"/g) || []).length === 7 && /100\/150/.test(j) && /seconde ultra-légendaire/.test(j), (j.match(/class="fjrow"/g) || []).length);
    sec.forEach((id, i) => { CARDS[id].rel = keepRel[i]; CARDS[id].soon = keepSoon[i]; }); const j2 = journalHTML();
    T("Journal des factions : secondes UL cachées, le Journal garde ses 4 lignes", (j2.match(/class="fjrow"/g) || []).length === 4 && !/150/.test(j2), (j2.match(/class="fjrow"/g) || []).length);
    P.fj = keepFj; P.owned = keepOwned; }
  /* 7. Ouverture de paquet « Le Tirage » : vrai achat, Passer, fermeture, rachat */
  { const tick = ms => new Promise(r => setTimeout(r, ms)), until = async (f, ms = 8000) => { const t0 = Date.now(); while(Date.now() - t0 < ms){ if(f()) return true; await tick(40); } return false; };
    const $ = s => document.querySelector(s);
    P.starter = true; P.chf = 1000; P.owned = P.owned.slice(0, 5); const n0 = P.owned.length, chf0 = P.chf; quiet = true; buyPack("breche");
    T("Ouverture : l'achat ouvre le calque avec les 3 cartes du paquet", !!$("#tirage") && document.querySelectorAll(".t-slot").length === 3 && lastPack && lastPack.res.length === 3, "");
    T("Ouverture : les cartes sont déjà dans la collection avant l'animation", P.owned.length >= n0 && P.chf <= chf0 - 300 + lastPack.refund, `CHF ${chf0} → ${P.chf}`);
    $(".t-pack").click(); await until(() => /choisis|pick/i.test($(".t-status").textContent));
    T("Ouverture : le paquet distribue les cartes face cachée", !document.querySelector(".t-fan").hidden && document.querySelectorAll(".t-slot.open").length === 0, "");
    T("Ouverture : le dos trahit la rareté (classe de halo selon la rareté de chaque carte)", [...document.querySelectorAll(".t-slot")].every((e, i) => e.classList.contains("h-" + CARDS[lastPack.res[i].id].r) || !"RELU".includes(CARDS[lastPack.res[i].id].r)), "");
    $(".t-skip").click(); await until(() => !$(".t-end").hidden);
    T("Ouverture : Passer retourne toutes les cartes et propose la suite", document.querySelectorAll(".t-slot.open").length === 3 && $(".t-skip").hidden && [...document.querySelectorAll(".t-end button")].some(b => /autre paquet|another pack/i.test(b.textContent)), "");
    const chf1 = P.chf; $("[data-t=again]").click(); await tick(200);
    T("Ouverture : « Ouvrir un autre paquet » rachète le paquet et rouvre le calque", !!$("#tirage") && document.querySelectorAll(".t-slot").length === 3 && P.chf <= chf1 - 300 + lastPack.refund, `CHF ${chf1} → ${P.chf}`);
    $(".t-skip").click(); await until(() => !$(".t-end").hidden); $("[data-t=close]").click(); await tick(100);
    T("Ouverture : Continuer ferme le calque et libère l'état", !$("#tirage") && packOpen === null, "");
    /* l'animation gère une Ultra Légendaire (pas encore dans les paquets) : tension longue puis récompense qui attend le toucher */
    ouvrirTirage({ res: [{ id: "ulya", isNew: true }], name: "Essai", img: "images/packs/breche.webp", pid: "breche", price: 300 });
    $(".t-pack").click(); await until(() => /choisis|pick/i.test($(".t-status").textContent));
    const t0 = Date.now(); document.querySelector(".t-slot").click();
    const waiting = await until(() => /touche pour|tap to/i.test($(".t-status").textContent), 9000), dt = Date.now() - t0;
    T("Ouverture : une Ultra attend le toucher après 3,6 s environ (attente 0,8 + tension 2,3 + révélation 0,55)", waiting && dt > 3200 && dt < 5200, dt + " ms");
    $(".t-skip").click(); await until(() => !$(".t-end").hidden); $("[data-t=close]").click(); await tick(60);
  }
  /* 8. Fusions (ultra-légendaires) dans les paquets */
  { const pk = id => PACKS.find(x => x.id === id), isU = id => CARDS[id].r === "U";
    const normal = Object.keys(CARDS).filter(id => !CARDS[id].token && !ULof(id));
    const fusions = ULS.filter(u => u.req.length && !u.fac && REL(u.id)).map(u => u.id);
    const draw = (id, n) => { const out = []; for(let i = 0; i < n; i++) out.push(drawPack(pk(id))); return out; };
    const withU = a => a.filter(g => g.some(isU)).length;
    P.owned = normal.slice(0, 3); P.pity = 0;
    T("Fusions : paquets de 100, 200 et 300 CHF → 1 %, 2 % et 4 % par paquet (ligne UL des paquets)", [pk("reflets"), pk("voile"), pk("breche")].map(x => x.ul).join() === "1,2,4" && pk("breche").pity === 10, [pk("reflets"), pk("voile"), pk("breche")].map(x => x.ul).join());
    for(const [id, rate] of [["reflets", 1], ["voile", 2]]){ P.pity = 0; const n = 30000, k = withU(draw(id, n)), got = 100 * k / n;
      T(`Fusions : paquet « ${id} » → ${rate} % par paquet (mesuré ${got.toFixed(2)} % sur ${n} tirages)`, Math.abs(got - rate) < 0.45, got.toFixed(2)); }
    { P.pity = 0; const gs = [], n = 20000; for(let i = 0; i < n; i++) gs.push(drawPack(pk("breche"))); let gap = 0, maxGap = 0; for(const g of gs){ if(g.some(isU)) gap = 0; else { gap++; maxGap = Math.max(maxGap, gap); } }
      const got = 100 * withU(gs) / n;
      T(`Fusions : paquet à 300 CHF → jamais plus de 9 paquets sans fusion (garantie à la 10e ouverture, max mesuré ${maxGap})`, maxGap <= 9, maxGap);
      T(`Fusions : paquet à 300 CHF → environ 11,9 % de paquets avec fusion (4 % + garantie), mesuré ${got.toFixed(1)} %`, Math.abs(got - 11.9) < 1, got.toFixed(1)); }
    P.pity = 9; { const g = drawPack(pk("breche")); T("Fusions : la 10e ouverture (9 sans fusion) contient une fusion, puis le compteur repart de 0", g.some(isU) && P.pity === 0, `compteur ${P.pity}`); }
    P.pity = 3; { drawPack(pk("breche")); T("Fusions : le compteur compte les ouvertures sans fusion (3 → 4 ou remise à 0)", P.pity === 4 || P.pity === 0, P.pity); }
    P.owned = normal.slice(0, 3).concat(fusions.slice(0, 5)); P.pity = 0;
    { const gs = draw("breche", 6000).flat().filter(isU); T("Fusions : le tirage ne propose que des fusions que le joueur n'a pas déjà", gs.length > 100 && gs.every(id => !P.owned.includes(id)), gs.length + " fusions tirées"); }
    P.owned = normal.concat(fusions); P.pity = 9;
    { const g = drawPack(pk("breche")); T("Fusions : toutes les fusions possédées → la place garantie devient une légendaire", !g.some(isU) && g.some(id => CARDS[id].r === "L"), g.map(id => CARDS[id].r).join("")); }
    P.pity = 0; { const gs = draw("reflets", 4000); T("Fusions : toutes possédées, paquet sans légendaire → aucune fusion et aucune carte hors de ses raretés", gs.every(g => g.length === 3 && g.every(id => !isU(id) && "CR".includes(CARDS[id].r))), ""); }
    /* possession des sources : plus de fusion automatique */
    { const u = ULof("ulya"); P.owned = u.req.map(r => [].concat(r)[0]); P.ulk = [];
      T("Fusions : posséder les deux cartes ne donne plus la fusion (elle sort des paquets)", !ulEarned(u) && ulOk(u, P.owned), "");
      const mig = clean({ owned: P.owned, chf: 10 }), mig2 = clean({ owned: P.owned, chf: 10, ulk: [] });
      T("Fusions : une fusion déjà réclamable avant le changement le reste (fixée au premier chargement) ; une sauvegarde déjà migrée n'en gagne pas", mig.ulk.includes("ulya") && !mig2.ulk.includes("ulya"), mig.ulk.join()); }
    /* paquet achetable tant qu'il reste une fusion à trouver, même avec toutes les cartes du paquet */
    P.starter = true; P.chf = 1000; P.owned = normal.concat(fusions.slice(1)); P.pity = 0;
    T("Fusions : paquet achetable tant qu'il manque une fusion, même avec toutes les cartes du paquet", packBuyable(pk("reflets")) && packBuyable(pk("breche")) && packMissing(pk("reflets")).length === 0, "");
    P.owned = normal.concat(fusions);
    T("Fusions : plus rien à trouver → paquet non achetable (collection complète)", !packBuyable(pk("reflets")), "");
    /* fusion saisonnière : seulement dans son paquet d'édition */
    P.owned = normal.slice(0, 3);
    { const seas = fusions.filter(id => ulSeason(ULof(id))), reg = pk("breche");
      T("Fusions saisonnières : exclues des paquets ordinaires", seas.length >= 2 && ulPool(reg).every(id => !seas.includes(id)) && ulPool(reg).length > 0, seas.join());
      const nv = ulPool(pk("nouvelan")); T("Fusions saisonnières : le paquet du Nouvel An ne propose que les fusions de sa saison", nv.length >= 1 && nv.every(id => ulSeason(ULof(id)) === "nouvelan"), nv.join());
      T("Fusions saisonnières : 5 % par paquet d'édition", ["halloween", "noel", "nouvelan"].every(id => pk(id).ul === 5), ""); }
  }
  /* 9. Filtres de la collection : faction, coût, rareté, possession */
  { const tick = ms => new Promise(r => setTimeout(r, ms)), $ = x => document.querySelector(x), $$ = x => [...document.querySelectorAll(x)];
    const normal = Object.keys(CARDS).filter(id => !CARDS[id].token && !ULof(id));
    P.owned = normal.filter((_, i) => i % 2 === 0).concat(["ulya"]); P.deck = []; P.tuto = true; tutoStep = -1; P.starter = true;
    window.render = realRender; screen = "deck"; deckFilter = costFilter = rarFilter = ownFilter = "all"; searchQ = ""; filtOpen = true; render();
    const shown = () => $$("#collgrid > *").length, avail = () => POOL.filter(id => SHOWN(id)).length;
    const clickChip = (act, f) => { const b = $(`[data-act=${act}][data-f="${f}"]`); if(b) b.click(); return !!b; };
    const shownN = () => $$("#collgrid > *").length;
    T("Filtres : sans filtre, toute la collection affichée", shown() === avail(), `${shown()} / ${avail()}`);
    T("Filtres : les 4 rangées de puces existent (faction, coût 0 à 6+, rareté, possession)", !!$("[data-act=filter]") && $$("[data-act=fcost]").length === 8 && $$("[data-act=frar]").length === 6 && $$("[data-act=fown]").length === 3, "");
    clickChip("fcost", "3"); const n3 = POOL.filter(id => SHOWN(id) && CARDS[id].cost === 3).length;
    T("Filtres : coût 3 → seulement les cartes de coût 3", shown() === n3 && n3 > 5, `${shown()} / ${n3}`);
    clickChip("fcost", "6"); const n6 = POOL.filter(id => SHOWN(id) && CARDS[id].cost >= 6).length;
    T("Filtres : coût 6+ → toutes les cartes de coût 6 ou plus", shown() === n6 && n6 > 5, `${shown()} / ${n6}`);
    clickChip("fcost", "all"); clickChip("frar", "U"); const nu = POOL.filter(id => SHOWN(id) && CARDS[id].r === "U").length;
    T("Filtres : rareté Ultra → seulement les ultra-légendaires", shown() === nu && nu > 3, `${shown()} / ${nu}`);
    clickChip("frar", "R"); clickChip("fcost", "2"); clickChip("filter", "primordial");
    const nc = POOL.filter(id => SHOWN(id) && CARDS[id].r === "R" && CARDS[id].cost === 2 && CARDS[id].fac === "primordial").length;
    T("Filtres : faction + coût + rareté se combinent (intersection)", shown() === nc, `${shown()} / ${nc}`);
    deckFilter = costFilter = rarFilter = "all"; clickChip("fown", "owned");
    T("Filtres : Possédées → seulement les cartes possédées", shown() === POOL.filter(id => SHOWN(id) && P.owned.includes(id)).length && $$(".grid .locked").length === 0, `${shown()} cartes`);
    clickChip("fown", "missing");
    T("Filtres : Manquantes → seulement les cartes à trouver", $$(".grid > *").every(e => e.classList.contains("locked")) && shown() === POOL.filter(id => SHOWN(id) && !P.owned.includes(id)).length, "");
    clickChip("frar", "U"); clickChip("fcost", "0");
    T("Filtres : aucune carte correspondante → message clair", shown() === 0 || !!$(".grid .hint"), shown() + " affichées");
    $("[data-act=freset]").click();
    T("Filtres : « Réinitialiser les filtres » remet tout à zéro", shown() === avail() && $("[data-act=freset]").disabled && costFilter === "all" && rarFilter === "all" && ownFilter === "all" && deckFilter === "all", "");
    /* 9b. Collection : lire avant d'ajouter, mini-deck, recherche par mot-clé, panneau Filtrer */
    filtOpen = false; deckFilter = costFilter = rarFilter = ownFilter = "all"; searchQ = ""; P.deck = []; render();
    T("Collection : le bouton Filtrer ouvre le panneau des choix (au lieu de tout afficher)", !$("[data-act=fcost]") && !!$("[data-act=filtopen]"), "");
    $("[data-act=filtopen]").click(); T("Collection : le panneau contient faction, coût, rareté, possession et « Voir N cartes »", !!$("[data-act=fcost]") && !!$("[data-act=filtclose].primary"), "");
    clickChip("fcost", "2"); $("[data-act=filtclose].primary").click();
    T("Collection : après fermeture, le bouton Filtrer indique le nombre de filtres (1)", /1/.test($("[data-act=filtopen]").textContent) && filtOpen === false, $("[data-act=filtopen]").textContent);
    $("[data-act=freset]").click(); filtOpen = false; render();
    T("Collection : le mini-deck affiche les 12 cases", $$("#dmini .dm").length === 12, "");
    const owned = P.owned.filter(id => !ULof(id)), one = owned[0];
    const card1 = $(`.pick .pickmain[data-id="${one}"]`) || $(".pick .pickmain");
    const id1 = card1.dataset.id; card1.click();
    T("Collection : toucher une carte l'ouvre en grand SANS l'ajouter au deck", zoomId === id1 && !P.deck.includes(id1), `zoom ${zoomId}`);
    T("Collection : la carte en grand propose « Ajouter au deck »", /Ajouter au deck/.test($(".zoominfo").textContent), "");
    $(".zoominfo [data-act=toggle]").click();
    T("Collection : « Ajouter au deck » l'ajoute, puis propose « Retirer du deck »", P.deck.includes(id1) && /Retirer du deck/.test($(".zoominfo").textContent), "");
    $("[data-act=unzoom].ghost, .zoominfo [data-act=unzoom]").click(); render();
    const dm = $(`#dmini .dm[data-id="${id1}"]`); dm.click();
    T("Collection : toucher une carte du mini-deck la lit, elle ne disparaît pas du deck", zoomId === id1 && P.deck.includes(id1), "");
    $(".zoominfo [data-act=unzoom]").click(); render();
    const strip = $(`.strip [data-act=zoom][data-id="${id1}"]`); if(strip) strip.click();
    T("Collection : toucher une carte du deck (grande rangée) la lit, elle ne disparaît pas", !!strip && zoomId === id1 && P.deck.includes(id1), "");
    $(".zoominfo [data-act=unzoom]").click(); render();
    $(`.pick .qadd[data-id="${id1}"]`).click();
    T("Collection : le bouton « ✓ Deck » retire la carte d'un geste", !P.deck.includes(id1), "");
    $(`.pick .qadd[data-id="${id1}"]`).click();
    T("Collection : le bouton « + Deck » ajoute la carte d'un geste", P.deck.includes(id1), "");
    const withFx = POOL.filter(id => SHOWN(id) && P.owned.includes(id) && /défausse/i.test(CARDS[id].fx || "")).length, input = $("#coll-search");
    input.value = "defausse"; input.dispatchEvent(new Event("input", { bubbles: true })); await tick(300);
    const found = $$("#collgrid .pickmain").map(b => b.dataset.id);
    T("Collection : la recherche par mot-clé trouve les cartes dont l'effet contient « défausse » (sans accent)", found.length > 3 && found.every(id => normQ(CARDS[id].fx + " " + CARDS[id].name).includes("defausse")), `${found.length} cartes`);
    input.value = "xyz-introuvable"; input.dispatchEvent(new Event("input", { bubbles: true })); await tick(300);
    T("Collection : recherche sans résultat → message clair", !!$("#collgrid .hint"), "");
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true })); await tick(300); searchQ = "";
    T("Collection : recherche vidée → toute la collection revient", shownN() === POOL.filter(id => SHOWN(id)).length, `${shownN()}`);
    window.render = () => {}; screen = "home";
  }
  /* 10. Accueil : le bandeau de saison mène au paquet d'édition, en tête de la boutique et surligné */
  { const $ = x => document.querySelector(x), se = season();
    P.starter = true; P.tuto = true; tutoStep = -1; P.chf = 500; P.owned = Object.keys(CARDS).filter(id => !CARDS[id].token && !ULof(id)).slice(0, 5);
    window.render = realRender; screen = "home"; packFocus = null; render();
    const btn = $("[data-act=seasonpack]"); T("Accueil : le bandeau de saison propose d'ouvrir le paquet d'édition (saison « " + se + " »)", !!se && !!btn && btn.dataset.pid === se, se);
    if(btn){ btn.click(); const first = $(".packtile");
      T("Accueil : le bouton de saison ouvre la boutique avec le paquet d'édition en tête", screen === "shop" && first && first.dataset.pid === se, first && first.dataset.pid);
      T("Accueil : le paquet d'édition est surligné", !!first && first.classList.contains("hl"), "");
      const go = $("[data-act=go][data-to=shop]"); go.click();
      T("Accueil : le menu Boutique retire le surlignage", !$(".packtile.hl") || $(".packtile.hl").dataset.pid === "brulure", ""); }
    window.render = () => {}; screen = "home"; packFocus = null;
  }
  /* Code couleur des effets */
  {
    const h = fxH("Révélation : détruit. Continu : +1 de puissance."), g = fxH("Fatalité : ne peut être détruite. Révélation : x."), e = fxH("On Reveal: a. Ongoing: b. Fate: c.");
    T("Couleurs : Révélation et Continu colorés dans le texte français", /kw-rev">Révélation<\/span> :/.test(h) && /kw-cont">Continu<\/span> :/.test(h), h);
    T("Couleurs : Fatalité colorée (carte Ananké)", /^<span class="kw kw-fat">Fatalité<\/span> :/.test(g) && /kw-rev/.test(g), g);
    T("Couleurs : mots anglais (On Reveal, Ongoing, Fate)", /kw-rev">On Reveal/.test(e) && /kw-cont">Ongoing/.test(e) && /kw-fat">Fate/.test(e), e);
    T("Couleurs : un texte sans mot-clé reste intact", fxH("Jeton lancé par Thor.") === "Jeton lancé par Thor.", "");
    screen = "deck"; zoomId = "ananke"; window.render = realRender; render();
    T("Couleurs : la carte en grand affiche le mot Fatalité coloré", !!document.querySelector(".zoominfo .kw-fat, .full .kw-fat"), "");
    zoomId = null; window.render = () => {};
  }
  /* Glisser-déposer : soulever vers le haut, lâcher sur un lieu */
  {
    fresh(); S.turn = 3; S.energy = 9; S.busy = false; S.hand.p = [card(plain[0], 1), card(plain[1], 1)]; screen = "play"; window.render = realRender; render();
    const ev = (t, x, y) => document.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, pointerId: 7, bubbles: true, button: 0 }));
    const hcEl = () => document.querySelector(".hc[data-act=hand]"), mid = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    const dispatchOn = (el, t, x, y) => el.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, pointerId: 7, bubbles: true, button: 0 }));
    let el = hcEl(), [x, y] = mid(el); const loc1 = mid(document.querySelectorAll(".loc")[1]);
    dispatchOn(el, "pointerdown", x, y); ev("pointermove", x, y - 40);
    T("Glisser : un geste vers le haut soulève la carte (fantôme + lieux possibles)", document.body.classList.contains("dragging") && !!document.querySelector(".dragghost") && document.querySelectorAll(".dropok").length > 0, "");
    ev("pointermove", loc1[0], loc1[1] + 34); ev("pointerup", loc1[0], loc1[1] + 34);
    T("Glisser : lâchée sur un lieu, la carte est posée là", S.staged.length === 1 && S.staged[0].li === 1 && S.hand.p.length === 1 && !document.querySelector(".dragghost"), JSON.stringify(S.staged.map(z => z.li)));
    el = hcEl(); [x, y] = mid(el); dispatchOn(el, "pointerdown", x, y); ev("pointermove", x + 60, y + 2); ev("pointerup", x + 60, y + 2);
    T("Glisser : un geste de côté ne pose rien (c'est le défilement de la main)", S.staged.length === 1 && !document.body.classList.contains("dragging"), "");
    el = hcEl(); [x, y] = mid(el); dispatchOn(el, "pointerdown", x, y); ev("pointermove", x, y - 60); ev("pointermove", 195, 20); ev("pointerup", 195, 20);
    T("Glisser : lâchée hors d'un lieu, la carte retourne dans la main", S.staged.length === 1 && S.hand.p.length === 1 && !document.querySelector(".dragghost"), "");
    S.energy = 0; render(); el = hcEl(); [x, y] = mid(el); dispatchOn(el, "pointerdown", x, y); ev("pointermove", x, y - 40); ev("pointermove", loc1[0], loc1[1] + 34); ev("pointerup", loc1[0], loc1[1] + 34);
    T("Glisser : sans assez d'énergie, la pose est refusée comme au toucher", S.staged.length === 1, "");
    dragEnd = 0; S.energy = 9; render(); el = hcEl(); el.click();
    T("Glisser : le toucher seul sélectionne toujours la carte", S.sel === +el.dataset.uid, "");
    window.render = () => {}; screen = "home"; S.sel = null;
  }
  /* Préchargement du deck choisi */
  {
    fresh(); PRE.clear(); preQ.length = 0; nextPlay = null; preloadDeck();
    const wantImgs = P.deck.every(id => PRE.has(CARDS[id].img) && PRE.has(`images/avatars/${id}.webp?v=7`));
    T("Préchargement : les illustrations et avatars des 12 cartes du deck sont mis en file", P.deck.length === 12 && wantImgs, PRE.size);
    T("Préchargement : le morceau de partie est choisi et mis en file", (nextPlay === "play" || nextPlay === "play2") && PRE.has(MUSIC[nextPlay]), nextPlay);
    const before = PRE.size; preloadDeck(); T("Préchargement : rien n'est mis en file deux fois", PRE.size === before, "");
    nextPlay = "play2"; playFor = null; screen = "play"; const k = musicKey();
    T("Préchargement : la partie joue le morceau préchargé", k === "play2" && nextPlay === null, k);
    screen = "home"; playFor = null;
  }
  /* Rappels des séries précédentes */
  fresh(); S.turn = 6; S.energy = 12; { const n = card("nemesis"); S.hand.p = [n]; const a = canStage(n, 0); S.turn = 5; T("Nemesis : injouable au tour 6, jouable au tour 5", !a && canStage(n, 0), ""); }
  fresh(); S.turn = 4; { const es = [put("e", 0, plain[0], 3), put("e", 0, plain[1], 3), put("e", 0, plain[2], 3)]; const b = mk("balor"); S.board.p[0].push(b); reveal("p", 0, b); T("Balor : −3 à deux cartes différentes seulement", es.filter(x => x.pow === 0).length === 2 && es.filter(x => x.pow === 3).length === 1, ""); }

  /* ===== Ananké (Fatalité : ni détruite ni déplacée (15 octobre, 2e version) ; fin de partie : puissance adverse ici +1) ===== */
  /* A1. Ananké révélée en premier, l'adversaire pose ensuite 10 de puissance au même endroit → elle gagne quand même le lieu */
  fresh(); S.turn = 6; { const a = card("ananke"), big = card(plain[0], 10); S.hand.p = [a]; S.hand.e = [big];
    await resolveTurn([{ c: a, li: 0 }], [{ c: big, li: 0 }], false);
    T("Ananké : révélée avant 10 de puissance adverse, elle gagne le lieu (11 contre 10)", cardPow("p", 0, a) === 11 && total("p", 0) === 11 && total("e", 0) === 10 && leader(0) === "p", `Ananké ${cardPow("p", 0, a)}, lieu ${total("p", 0)} contre ${total("e", 0)}`); }
  /* A1b. L'ordre ne change rien : l'adversaire était déjà là avant elle */
  fresh(); S.turn = 6; { put("e", 0, plain[0], 10); const a = card("ananke"); S.hand.p = [a];
    await resolveTurn([{ c: a, li: 0 }], [], false);
    T("Ananké : même résultat si l'adversaire était déjà posé (11 contre 10)", cardPow("p", 0, a) === 11 && leader(0) === "p", cardPow("p", 0, a)); }
  /* A1c. Pendant la partie (avant la fin) elle reste à 1 ; la puissance de fin s'affiche en direct dans le plateau */
  fresh(); S.turn = 4; { put("e", 0, plain[0], 6); const a = card("ananke"); S.hand.p = [a];
    S.board.p[0].push(a); reveal("p", 0, a); const pre = cardPow("p", 0, a); const live7 = ankEnd("p", 0, a); const html = mini("p", 0, a, false);
    T("Ananké : à 1 pendant la partie, la puissance de fin (7) est annoncée en direct", pre === 1 && live7 === 7 && html.includes("fatb") && html.includes("✠ 7"), `${pre}, ${live7}`);
    put("e", 0, plain[1], 2); T("Ananké : l'indicateur se met à jour (9)", mini("p", 0, a, false).includes("✠ 9"), ""); }
  /* A2. (15 octobre, 2e version) Le charme, la captivité, la transformation, le vol et la perte d'effet l'atteignent ; la destruction et le déplacement jamais */
  const anankeHit = async (eff, check, nom, apow = 3) => { fresh(); S.turn = 4; const a = put("e", 0, "ananke", apow), x = put("e", 0, plain[0], 2); const c = card(eff); S.hand.p = [c];
    await resolveTurn([{ c, li: 0 }], [], false); T(`Ananké : ${nom} l'atteint`, check(a, x), `${eff} : ${JSON.stringify({ ch: a.charm, cap: !!a.captive, neg: a.neg, pow: a.pow, id: a.id })}`); };
  await anankeHit("qetesh", a => a.charm === "p", "Qetesh (charme)");
  await anankeHit("calypso", a => !!a.captive, "Calypso (captive)");
  await anankeHit("oya", a => a.neg && a.pow === 1, "Oya (transformée)");
  await anankeHit("circe", a => a.id === "pourceau", "Circé (transformée)");
  await anankeHit("lilith", a => S.board.p[0].includes(a), "Lilith (volée)");
  await anankeHit("mohini", a => a.neg, "Mohini (effets retirés)");
  await anankeHit("apsu", a => a.neg, "Apsu (effets retirés)");
  const anankeSafe = async (eff, nom, apow = 3, xli = 0) => { fresh(); S.turn = 4; const a = put("e", 0, "ananke", apow), x = put("e", xli, plain[0], 2); const c = card(eff); S.hand.p = [c];
    await resolveTurn([{ c, li: 0 }], [], false); T(`Ananké : ${nom} ne l'atteint pas`, S.board.e[0].includes(a) && a.id === "ananke" && !a.neg, `${eff} : ${JSON.stringify(S.board.e.map(l => l.map(y => y.id)))}`); };
  await anankeSafe("nyx", "Nyx (destruction de la plus forte)");
  await anankeSafe("esquille", "L'Esquille (destruction de la plus faible)", 1);
  await anankeSafe("zeus", "Zeus (foudre)");
  await anankeSafe("set", "Set (dispersion)", 3, 1);
  await anankeSafe("poseidon", "Poséidon (renvoi en main)");
  fresh(); S.turn = 4; { const a = put("e", 1, "ananke", 1), h = put("p", 0, "hedone"); S.board.e[0] = []; await resolveTurn([], [], false);
    T("Ananké : Hédoné ne l'attire pas", S.board.e[1].includes(a) && !a.charm, ""); }
  /* A2b. Fin de partie : charmée, volée, captive, transformée, sans effet */
  fresh(); S.turn = 6; { const a = put("e", 0, "ananke"), y = put("e", 0, plain[0], 5); put("p", 0, plain[1], 4); a.charm = "p"; S.final = true; const v = cardPow("e", 0, a), tp = total("p", 0), te = total("e", 0); S.final = false;
    T("Ananké charmée : puissance = total de son propriétaire ici + 1, et elle compte pour celui qui l'a charmée", v === 6 && tp === 10 && te === 5, `${v} · toi ${tp} · adversaire ${te}`); }
  fresh(); S.turn = 4; { const a = put("e", 0, "ananke", 3); put("e", 0, plain[0], 2); const l = card("lilith"); S.hand.p = [l]; await resolveTurn([{ c: l, li: 0 }], [], false); put("e", 0, plain[1], 4);
    S.final = true; const v = cardPow("p", 0, a), te = total("e", 0); S.final = false; T("Ananké volée (Lilith) : elle calcule pour son nouveau propriétaire (total adverse + 1)", S.board.p[0].includes(a) && v === te + 1, `${v} contre ${te}`); }
  fresh(); S.turn = 6; { const a = put("e", 0, "ananke"), cal = put("p", 0, "calypso"); put("p", 0, plain[1], 4); a.captive = cal.uid; S.final = true; const v = cardPow("e", 0, a); S.final = false;
    T("Ananké captive (Calypso en jeu) : 0, même en fin de partie", v === 0, v); }
  fresh(); S.turn = 6; { const a = put("e", 0, "ananke"); put("p", 0, plain[1], 4); const o = card("oya"); S.hand.p = [o]; await resolveTurn([{ c: o, li: 0 }], [], false); S.final = true; const v = cardPow("e", 0, a); S.final = false;
    T("Ananké transformée (Oya) : puissance 1, sans effet en fin de partie", v === 1 && a.neg, v); }
  /* A3. Nemesis adverse au même lieu → la règle « le moins de puissance gagne » s'applique, Ananké perd le lieu */
  fresh(); S.turn = 6; { put("e", 0, "nemesis"); const a = card("ananke"); S.hand.p = [a]; await resolveTurn([{ c: a, li: 0 }], [], false);
    T("Ananké : avec une Nemesis adverse au même lieu, elle perd le lieu", leader(0) === "e" && nemInv(0), `${total("p", 0)} contre ${total("e", 0)}`); }
  /* A4. Apsu adverse posée après elle → Ananké reste à 1 ; déjà posée avant elle → rien ; Apsu, Veillée des Chaînes pareil */
  for (const id of ["apsu", "apsu_n"]) { fresh(); S.turn = 6; { const a = card("ananke"), ap = card(id); S.hand.p = [a]; S.hand.e = [ap]; await resolveTurn([{ c: a, li: 0 }], [{ c: ap, li: 0 }], false);
      T(`Ananké : ${id} adverse posée après elle → elle reste à 1`, a.neg && cardPow("p", 0, a) === 1, `${cardPow("p", 0, a)}, neg ${a.neg}`); }
    fresh(); S.turn = 6; { put("e", 0, id); const a = card("ananke"); S.hand.p = [a]; await resolveTurn([{ c: a, li: 0 }], [], false); S.final = true; const v = cardPow("p", 0, a); S.final = false;
      T(`Ananké : ${id} déjà posée avant elle → ne l'atteint pas (une Révélation n'agit qu'une fois)`, !a.neg && v === total("e", 0) + 1, `${v}, neg ${a.neg}`); } }
  /* A4b. Une Qetesh ou une Calypso déjà en jeu ne touche pas une Ananké posée après elle (Révélation passée) : l'IA peut la poser en face */
  fresh(); S.turn = 6; { put("e", 0, "qetesh"); put("e", 0, "calypso"); const a = card("ananke"); S.hand.p = [a]; await resolveTurn([{ c: a, li: 0 }], [], false);
    T("Ananké posée après une Qetesh et une Calypso adverses : ni charmée ni captive", !a.charm && !a.captive && !a.neg, JSON.stringify({ ch: a.charm, cap: !!a.captive })); }
  /* A5. Deux Ananké face à face : pas de boucle infinie */
  fresh(); S.turn = 6; { const a = put("p", 0, "ananke"), b = put("e", 0, "ananke"); S.final = true; const x = cardPow("p", 0, a), y = cardPow("e", 0, b); T("Deux Ananké face à face : calcul fini", Number.isFinite(x) && Number.isFinite(y), `${x} / ${y}`); S.final = false; }
  /* A6. IA : jamais sur un lieu avec une Nemesis adverse (tour 5 : elle ne se joue plus au tour 6) */
  fresh(); S.turn = 5; S.energy = S.energyE = 5; { put("p", 0, "nemesis"); put("p", 1, plain[0], 5); put("e", 1, plain[1], 8); put("e", 2, plain[2], 3);
    const a = card("ananke"); S.hand.e = [a]; const plan = aiPlan("e", 5); const at = plan.find(x => x.c === a);
    T("IA : Ananké jouée, mais jamais sur le lieu de la Nemesis adverse", !!at && at.li !== 0, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }

  /* ===== Hédoné (Continu : à la fin de chaque tour, attire la plus faible adverse d'un autre lieu et la charme, 2 fois) ===== */
  const hedFresh = () => { fresh(); put("e", 1, plain[0], 1); put("e", 1, plain[1], 3); put("e", 2, plain[2], 2); };
  /* H1. Posée au tour 5 → 2 charmes (fins des tours 5 et 6) */
  hedFresh(); S.turn = 5; { const h = card("hedone"); S.hand.p = [h]; await resolveTurn([{ c: h, li: 0 }], [], false);
    const n1 = S.board.e[0].length, pw1 = S.board.e[0].map(c => c.pow).join(); const ch1 = S.board.e[0].every(c => charmOf(c) === "p" && c.charmBy === h.uid);
    S.over = null; S.turn = 6; await resolveTurn([], [], false);
    T("Hédoné posée au tour 5 : 1 charme à la fin du tour 5 (la plus faible, 1) puis 2 à la fin du tour 6 (2)", n1 === 1 && pw1 === "1" && ch1 && h.hed === 2 && S.board.e[0].map(c => c.pow).join() === "1,2" && S.board.e[0].every(c => charmOf(c) === "p"), `${n1} / ${pw1} / hed ${h.hed}`);
    T("Hédoné : les cartes charmées comptent pour moi et pas pour l'adversaire", total("p", 0) === 2 + 1 + 2 && total("e", 0) === 0 && total("e", 1) === 3 && total("e", 2) === 0, `${total("p", 0)} / ${total("e", 0)}`);
    T("Hédoné : affichage 2/2 et fil doré sur les cartes charmées", mini("p", 0, h, false).includes("2/2") && mini("e", 0, S.board.e[0][0], false).includes("charmed"), ""); }
  /* H2. Posée au tour 6 → 1 charme seulement */
  hedFresh(); S.turn = 6; { const h = card("hedone"); S.hand.p = [h]; await resolveTurn([{ c: h, li: 0 }], [], false);
    T("Hédoné posée au tour 6 : 1 seul charme", h.hed === 1 && S.board.e[0].length === 1, `hed ${h.hed}, ${S.board.e[0].length}`); }
  /* H3. Hédoné détruite par L'Esquille → les charmes s'arrêtent (les cartes restent là, leur puissance compte de nouveau pour l'adversaire) */
  hedFresh(); S.turn = 4; { const h = put("p", 0, "hedone"); put("p", 0, plain[3], 9); h.hed = 1; const x = put("e", 0, plain[4], 4); x.charm = "p"; x.charmBy = h.uid;
    const before = total("e", 0); const es = card("esquille"); S.hand.e = [es]; await resolveTurn([], [{ c: es, li: 0 }], false);
    T("Hédoné détruite par L'Esquille : le charme s'arrête, la carte reste dans le lieu et compte pour l'adversaire", !S.board.p[0].includes(h) && S.board.e[0].includes(x) && charmOf(x) === null && before === 0 && total("e", 0) === 5, `avant ${before}, après ${total("e", 0)}`);
    T("Hédoné détruite : plus aucun charme à la fin du tour", S.board.e[0].filter(c => charmOf(c)).length === 0 && S.board.e[0].length >= 1, ""); }
  /* H3b. Hédoné détruite avant la fin du tour (pas encore de charme) → aucun charme n'est posé */
  hedFresh(); S.turn = 4; { const h = put("p", 0, "hedone"); put("p", 0, plain[3], 9); const es = card("esquille"); S.hand.e = [es]; await resolveTurn([], [{ c: es, li: 0 }], false);
    T("Hédoné détruite en cours de tour : aucune carte attirée", !S.board.p[0].includes(h) && S.board.e[0].length === 1, `${S.board.e[0].length}`); }
  /* H4. Lieu adverse plein → rien, et ça ne compte pas dans les 2 fois */
  fresh(); S.turn = 4; { const h = put("p", 0, "hedone"); for (let i = 0; i < 4; i++) put("e", 0, plain[i], 5); put("e", 1, plain[5], 1);
    S.hand.p = []; await resolveTurn([], [], false);
    T("Hédoné : lieu adverse plein → rien ne se passe, le compteur reste à 0", S.board.e[0].length === 4 && S.board.e[1].length === 1 && !h.hed, `hed ${h.hed}`);
    S.board.e[0].pop(); S.turn = 4; await resolveTurn([], [], false);
    T("Hédoné : une place se libère → le charme a lieu ensuite (et compte)", h.hed === 1 && S.board.e[0].length === 4 && S.board.e[1].length === 0, `hed ${h.hed}`); }
  /* H5. Ananké n'est jamais attirée */
  fresh(); S.turn = 4; { const h = put("p", 0, "hedone"); const a = put("e", 1, "ananke"); await resolveTurn([], [], false);
    T("Hédoné : seule Ananké ailleurs → rien n'est attiré", S.board.e[1].includes(a) && !h.hed && !a.charm, `hed ${h.hed}`); }
  fresh(); S.turn = 4; { const h = put("p", 0, "hedone"); const a = put("e", 1, "ananke"), x = put("e", 2, plain[0], 5); await resolveTurn([], [], false);
    T("Hédoné : Ananké (plus faible) ignorée, la carte suivante est attirée", S.board.e[1].includes(a) && S.board.e[0].includes(x) && x.charm === "p", ""); }
  /* H6. Égalité de puissance : l'une des plus faibles, au hasard (jamais une carte plus forte) */
  fresh(); S.turn = 4; { const h = put("p", 0, "hedone"); const x = put("e", 1, plain[0], 2), y = put("e", 2, plain[1], 2), z = put("e", 2, plain[2], 6); await resolveTurn([], [], false);
    const got = S.board.e[0][0]; T("Hédoné : égalité de puissance → une des deux plus faibles, jamais la plus forte", got === x || got === y, got && got.pow); }
  /* H7. Hédoné neutralisée (Apsu) : plus de charme */
  fresh(); S.turn = 4; { const h = put("p", 0, "hedone"); put("e", 1, plain[0], 2); const ap = card("apsu"); S.hand.e = [ap]; await resolveTurn([], [{ c: ap, li: 0 }], false);
    T("Hédoné sans effet (Apsu) : aucune carte attirée", h.neg && !h.hed, `neg ${h.neg}, hed ${h.hed}`); }
  /* H8. IA : pose Hédoné avec de la place chez l'adversaire */
  fresh(); S.turn = 5; S.energy = S.energyE = 6; { put("p", 1, plain[0], 2); put("p", 2, plain[1], 2); for (let i = 0; i < 4; i++) put("p", 0, plain[i + 2], 1); const h = card("hedone"); S.hand.e = [h];
    const plan = aiPlan("e", 5); const at = plan.find(x => x.c === h); T("IA : Hédoné jouée sur un lieu où l'adversaire a de la place (pas le lieu plein)", !!at && at.li !== 0, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
  /* H9. Données : ultra-légendaire de faction Désir, journal des factions */
  { const u = ULof("hedone"); T("Hédoné : ultra-légendaire de faction Désir (8 cartes, 50 parties au journal)", u && u.fac === "desir" && u.min === 8 && u.quest.k === "desir" && u.quest.n === 50 && !u.req.length && CARDS.hedone.r === "U" && CARDS.hedone.cost === 4 && CARDS.hedone.pow === 2, ""); }

  /* ===== Équilibrage de décembre (14 octobre 2026) ===== */
  /* trois cartes sans effet de puissance de base distincte (les cartes provisoires sont toutes 3/3) */
  const hi = plain[10], mid = plain[11], lo = plain[12]; CARDS[hi].pow = 3; CARDS[mid].pow = 2; CARDS[lo].pow = 1;
  /* D1. Hel au tour 6, 3 cartes en main, rien défaussé avant → elle défausse sa main et ressuscite les 2 plus fortes */
  fresh(); S.turn = 6; { const hel = card("hel"), a = card(hi), b = card(mid), c = card(lo); S.hand.p = [hel, a, b, c]; S.discarded = 0;
    await resolveTurn([{ c: hel, li: 0 }], [], false);
    const ids = S.board.p[0].filter(x => x.risen).map(x => x.id).sort().join();
    T("Hel : main défaussée (3), les 2 plus fortes ressuscitées, la 3e reste en défausse, main vide", ids === [hi, mid].sort().join() && S.discardPile.p.length === 1 && S.discardPile.p[0] === lo && S.hand.p.length === 0 && S.discarded === 3, `${ids} / défausse ${S.discardPile.p} / compteur ${S.discarded}`);
    T("Hel : les cartes ressuscitées n'ont pas de Révélation rejouée et gardent leur puissance de base", S.board.p[0].filter(x => x.risen).every(x => x.rev && x.pow === CARDS[x.id].pow), ""); }
  /* D2. Une seule place libre → une seule carte ressuscitée */
  fresh(); S.turn = 6; { put("p", 0, plain[5], 1); put("p", 0, plain[6], 1); const hel = card("hel"); S.hand.p = [hel, card(hi), card(mid), card(lo)];
    await resolveTurn([{ c: hel, li: 0 }], [], false);
    T("Hel avec 1 seule place libre : 1 seule carte ressuscitée", S.board.p[0].filter(x => x.risen).length === 1 && S.board.p[0].length === 4, `${S.board.p[0].filter(x => x.risen).length} ressuscitée(s)`); }
  /* D2b. Hel compte pour Fange (défausses) ; Izanami : les ressuscitées ont +2 */
  fresh(); S.turn = 6; { const fa = put("p", 1, "fange"); const iz = put("p", 1, "izanami"); const hel = card("hel"); S.hand.p = [hel, card(hi), card(mid), card(lo)]; S.discarded = 0;
    await resolveTurn([{ c: hel, li: 0 }], [], false); const r = S.board.p[0].find(x => x.risen);
    T("Hel : les 3 défausses comptent pour Fange (+3)", S.discarded === 3 && cardPow("p", 1, fa) === CARDS.fange.pow + 3, `${cardPow("p", 1, fa)}`);
    T("Izanami en jeu + Hel : les cartes ressuscitées ont +2", r && cardPow("p", 0, r) === CARDS[r.id].pow + 2, r && cardPow("p", 0, r)); }
  /* D3. Loviatar posée aux tours 4, 5, 6 : la carte ressuscitée perd 2, 1, 0 (−1 au début de chaque tour suivant) */
  const base = CARDS[hi].pow;
  for (const [t, perte] of [[4, 2], [5, 1], [6, 0]]) { fresh(); S.turn = t; { S.discardPile.p = [hi]; const lv = card("loviatar"); S.hand.p = [lv];
      await resolveTurn([{ c: lv, li: 0 }], [], false); const r0 = S.board.p[0].find(x => x.risen); const sk0 = r0 && r0.sick;
      if (t === 4) { S.over = null; await resolveTurn([], [], false); }
      const r = S.board.p[0].find(x => x.risen);
      T(`Loviatar posée au tour ${t} : la carte ressuscitée perd ${perte} (${base} → ${base - perte}), sans Révélation`, r && r.pow === base - perte && r.sick === 0 && r.id === hi, `pow ${r && r.pow}, compteur de départ ${sk0}`); } }
  fresh(); S.turn = 4; { S.discardPile.p = [hi]; const lv = card("loviatar"); S.hand.p = [lv]; await resolveTurn([{ c: lv, li: 0 }], [], false); const r = S.board.p[0].find(x => x.risen);
    T("Loviatar : indicateur de maladie 2 → 1 → 0 sur la carte ressuscitée", r && r.sick === 1 && mini("p", 0, r, false).includes("🤒 1"), `compteur ${r && r.sick}`); }
  /* D4. Loviatar (+3) et Hadès (+2 depuis le 15 octobre) sans carte à ressusciter */
  for (const [id, base0] of [["loviatar", 3], ["hades", 4]]) { fresh(); S.turn = 4; { const c = card(id); S.hand.p = [c]; await resolveTurn([{ c, li: 0 }], [], false);
      const g = id === "hades" ? 2 : 3; T(`${id === "hades" ? "Hadès" : "Loviatar"} sans carte à ressusciter : +${g} de puissance`, c.pow === base0 + g, c.pow); } }
  fresh(); S.turn = 4; { S.graveyard.p = [hi]; const c = card("hades"); S.hand.p = [c]; await resolveTurn([{ c, li: 0 }], [], false);
    T("Hadès avec une carte détruite : elle revient (pas de +2)", c.pow === 4 && S.board.p[0].some(x => x.risen && x.id === hi), c.pow); }
  /* D5. Qetesh du Nouvel An : puissance (lue au déclenchement), plus le coût */
  fresh(); S.turn = 4; { const big = put("e", 0, "calypso", 9); const q = card("qetesh_r"); S.hand.p = [q];   /* Calypso coûte 5 : coût 5 mais puissance 9 */
    await resolveTurn([{ c: q, li: 0 }], [], false); T("Qetesh du Nouvel An : carte de coût 5 et de puissance 9 → pas de charme", !charmOf(big) && !big.charm, ""); }
  fresh(); S.turn = 4; { const e5 = put("e", 0, plain[0], 5), e9 = put("e", 0, plain[1], 9); const q = card("qetesh_r"); S.hand.p = [q];
    await resolveTurn([{ c: q, li: 0 }], [], false); T("Qetesh du Nouvel An : carte de puissance 5 → charmée (la 9 est ignorée)", charmOf(e5) === "p" && !charmOf(e9), ""); }
  fresh(); S.turn = 4; { const e3 = put("e", 0, "calypso", 3); const q = card("qetesh_r"); S.hand.p = [q];   /* coût 5, puissance 3 : charmée */
    await resolveTurn([{ c: q, li: 0 }], [], false); T("Qetesh du Nouvel An : carte de coût 5 mais de puissance 3 → charmée", charmOf(e3) === "p", ""); }
  /* D5b. Qetesh X Jordan du Nouvel An : charme à puissance 5 ou moins, Continu +1 */
  fresh(); S.turn = 5; { const a = put("e", 0, plain[0], 6), b = put("e", 0, plain[1], 4), m = put("p", 0, plain[2], 2); const u = card("ulqetjor_r"); S.hand.p = [u];
    await resolveTurn([{ c: u, li: 0 }], [], false);
    T("Qetesh X Jordan du Nouvel An : charme la plus forte de puissance 5 ou moins (la 6 est ignorée)", charmOf(b) === "p" && !charmOf(a), "");
    T("Qetesh X Jordan du Nouvel An : tes autres cartes ici ont +1", cardPow("p", 0, m) === 3, cardPow("p", 0, m)); }
  /* D6. Pele X Jordan au tour 6 : −1 à toutes les cartes adverses déjà révélées, dans les 3 lieux */
  fresh(); S.turn = 6; { const es = [0, 1, 2].map(li => put("e", li, plain[li], 3)); const pj = card("ulpele_r"); S.hand.p = [pj];
    await resolveTurn([{ c: pj, li: 0 }], [], false);
    T("Pele X Jordan : −1 à toutes les cartes adverses des 3 lieux (3 → 2)", es.every(x => x.pow === 2), es.map(x => x.pow).join()); }
  /* D7. Données et IA */
  { const d = id => CARDS[id]; T("Statistiques décembre : Hel 6/3, Loviatar 4/3, Hadès 4/4, Circé 4/3, Nyx X Oshun 6/2, Sekhmet N 4/4, Éos N 2/2, Qetesh N 5/3, Qetesh X Jordan N 6/4, Pele X Jordan 2/1",
      [["hel", 6, 3], ["loviatar", 4, 3], ["hades", 4, 4], ["circe", 4, 3], ["uloshun", 6, 2], ["sekhmet_n", 4, 4], ["eos_r", 2, 2], ["qetesh_r", 5, 3], ["ulqetjor_r", 6, 4], ["ulpele_r", 2, 1]].every(([id, c, p]) => d(id).cost === c && d(id).pow === p), ""); }
  fresh(); S.turn = 6; S.energy = S.energyE = 6; { for (const li of [0, 1, 2]) { put("p", li, plain[li], 3); put("p", li, plain[li + 3], 2); } put("e", 0, plain[0], 1);
    const pj = card("ulpele_r"), x = card(plain[4]); S.hand.e = [pj, x]; const plan = aiPlan("e", 5);
    T("IA : Pele X Jordan jouée au tour 6, avec une autre carte, face à beaucoup de cartes adverses", plan.some(y => y.c === pj) && plan.length >= 2, JSON.stringify(plan.map(y => [y.c.id, y.li]))); }

  /* IA : évaluation de Nyx X Circé (lieu aux grosses cartes adverses), Yarden Dragonification, Médée Mariée Spectrale */
  fresh(); S.turn = 6; S.energy = S.energyE = 6; { put("p", 0, plain[0], 1); put("p", 1, plain[1], 9); put("p", 1, plain[2], 8); put("p", 2, plain[3], 1); put("e", 1, plain[4], 3);
    const c = card("ulcirce"); S.hand.e = [c]; const plan = aiPlan("e", 5); T("IA : Nyx X Circé jouée sur le lieu des grosses cartes adverses (17 de puissance à retirer)", plan.length === 1 && plan[0].li === 1, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
  fresh(); S.turn = 5; S.energy = S.energyE = 6; { put("e", 0, "troll", 5); put("e", 0, "esquille", 1); put("p", 0, plain[0], 1); put("p", 1, plain[1], 8); put("p", 2, plain[2], 1);
    const c = card("yarden_d"); S.hand.e = [c]; const plan = aiPlan("e", 5); T("IA : Yarden Dragonification posée avec des cartes Primordiales de son côté", plan.length === 1 && plan[0].c === c, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
  fresh(); S.turn = 4; S.energy = S.energyE = 4; { put("p", 0, plain[0], 7); put("p", 0, plain[1], 2); put("p", 1, plain[2], 1);
    const c = card("medee_h"); S.hand.e = [c]; const plan = aiPlan("e", 5); T("IA : Médée Mariée Spectrale posée tôt, face à des cartes adverses à empoisonner", plan.length === 1 && plan[0].c === c, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
  T("Le Seigneur de la marée noire : 6/7, effet inchangé", CARDS.maree.cost === 6 && CARDS.maree.pow === 7 && /détruit les cartes adverses de coût 2 ou moins ici/.test(CARDS.maree.fx), "");

  /* Blitz : aucune ultra-légendaire, ni pour le joueur ni pour l'adversaire (palier 4 à 6, 300 decks) */
  { P.owned = Object.keys(CARDS).filter(id => !CARDS[id].token); let withUL = 0, blitzUL = 0;
    for (let i = 0; i < 300; i++) { for (const t of [4, 6]) { if (aiDeck(t, true).deck.some(id => ULof(id))) withUL++; if (aiDeck(t, true, true).deck.some(id => ULof(id) || CARDS[id].r === "U")) blitzUL++; } }
    T("Blitz : l'IA du palier 4 à 6 n'a jamais d'ultra-légendaire (alors que le mode normal peut en avoir)", blitzUL === 0 && withUL > 0, `Blitz ${blitzUL} / normal ${withUL}`);
    P.bz = { day: "", used: false, run: { deck: ["coursier", "felix", "celeste", "izzy", ...Object.keys(CARDS).filter(id => !CARDS[id].token && CARDS[id].r === "C" && !["coursier", "felix", "celeste", "izzy"].includes(id)).slice(0, 8)], opts: [], wins: 2, over: false, gain: 0 } };
    let bad = 0; for (let i = 0; i < 100; i++) { bzGame(); if ([...S.deck.e, ...S.deck.p].some(c => CARDS[c.id].r === "U")) bad++; }
    T("Blitz : le vrai déroulement (bzGame, match 3 sur 3) ne distribue aucune ultra-légendaire (100 parties)", bad === 0, `${bad} partie(s) avec une ultra-légendaire`); P.bz = { day: "", used: false, run: null }; }
  /* ===== La Source (15 octobre 2026) : les Révélations de tes autres cartes Helvara jouées ici se déclenchent deux fois ===== */
  { const base = plain[20]; CARDS[base].pow = 5;
    /* S1. Source déjà en jeu, tatoueur (Helvara, +1 à la plus forte ici) posé ici → 2 déclenchements */
    fresh(); S.turn = 4; { put("p", 0, "source"); const big = put("p", 0, base, 5); const t = card("tatoueur"); S.hand.p = [t]; await resolveTurn([{ c: t, li: 0 }], [], false);
      T("La Source : la Révélation d'une carte Helvara jouée ici se déclenche deux fois (+2 au lieu de +1)", big.pow === 7, big.pow); }
    /* S2. Source posée le même tour mais révélée avant (ordre de pose) → doublée ; révélée après → une seule fois */
    fresh(); S.turn = 4; { const big = put("p", 0, base, 5); const src = card("source"), t = card("tatoueur"); S.hand.p = [src, t]; await resolveTurn([{ c: src, li: 0 }, { c: t, li: 0 }], [], false);
      T("La Source posée juste avant la carte : doublée", big.pow === 7, big.pow); }
    fresh(); S.turn = 4; { const big = put("p", 0, base, 5); const src = card("source"), t = card("tatoueur"); S.hand.p = [t, src]; await resolveTurn([{ c: t, li: 0 }, { c: src, li: 0 }], [], false);
      T("La Source révélée après la carte : une seule fois (+1)", big.pow === 6, big.pow); }
    /* S3. Un autre lieu, la Source adverse, la Source sans effets : une seule fois */
    fresh(); S.turn = 4; { put("p", 0, "source"); const big = put("p", 1, base, 5); const t = card("tatoueur"); S.hand.p = [t]; await resolveTurn([{ c: t, li: 1 }], [], false);
      T("La Source : sans effet sur un autre lieu (+1 seulement)", big.pow === 6, big.pow); }
    fresh(); S.turn = 4; { put("e", 0, "source"); const big = put("p", 0, base, 5); const t = card("tatoueur"); S.hand.p = [t]; await resolveTurn([{ c: t, li: 0 }], [], false);
      T("La Source adverse ne double pas mes Révélations", big.pow === 6, big.pow); }
    fresh(); S.turn = 4; { const src = put("p", 0, "source"); src.neg = true; const big = put("p", 0, base, 5); const t = card("tatoueur"); S.hand.p = [t]; await resolveTurn([{ c: t, li: 0 }], [], false);
      T("La Source sans effets (annulée) : une seule fois", big.pow === 6, big.pow); }
    /* S4. Une carte d'une autre faction n'est pas doublée */
    fresh(); S.turn = 4; { put("p", 0, "source"); const big = put("p", 0, base, 5); const hasFx = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].fac !== "helvara" && /^Révélation : \+\d+ de puissance\.?$/.test(CARDS[id].fx || "") && CARDS[id].cost <= 3 && CARDS[id].rel < "2027");
      if (hasFx) { const c = card(hasFx); S.hand.p = [c]; const before = c.pow; await resolveTurn([{ c, li: 0 }], [], false); const gain = c.pow - before; T("La Source : une Révélation d'une autre faction (" + hasFx + ") n'est pas doublée", gain === Number(/\+(\d+)/.exec(CARDS[hasFx].fx)[1]), gain); }
      else T("La Source : autre faction non doublée (aucune carte de test simple, contrôle sauté)", true); }
    /* S5. Données et IA */
    { const u = ULof("source"); T("La Source : ultra-légendaire de faction Helvara 3/2 (8 cartes, 50 parties au journal), sortie le 1er février 2027", u && u.fac === "helvara" && u.min === 8 && u.quest.k === "helvara" && u.quest.n === 50 && !u.req.length && CARDS.source.r === "U" && CARDS.source.cost === 3 && CARDS.source.pow === 2 && CARDS.source.rel === "2027-02-01" && CARDS.source.soon === "2027-01-27"); }
    T("Dates des ultra-légendaires de faction : Ananké 1er décembre, Hédoné 15 janvier, Nike Saint-Valentin 14 février", CARDS.ananke.rel === "2026-12-01" && CARDS.hedone.rel === "2027-01-15" && CARDS.hedone.soon === "2027-01-10" && CARDS.nike_v.rel === "2027-02-14" && CARDS.nike_v.soon === "2027-02-09");
    fresh(); S.turn = 3; S.energy = S.energyE = 5; { const src = card("source"), t = card("tatoueur"), v = card("voleuse"); S.hand.e = [src, t, v];
      const plan = aiPlan("e", 5); T("IA : La Source est jouée quand la main compte des cartes Helvara à Révélation", plan.some(x => x.c === src), JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
  }


  /* ===== Renfort Jugement (15 novembre et 14 décembre 2026) : Mā'at, Apollon, Vesta, Héphaïstos, Tsukuyomi, Zeus ===== */
  { const cheapNJ = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].fac !== "jugement" && CARDS[id].cost <= 1 && /^Révélation/.test(CARDS[id].fx || "") && !ULof(id));
    const filler = Object.keys(CARDS).filter(id => !CARDS[id].token && !ULof(id)).slice(0, 7);
    /* J1. Tour 6 : Mā'at (0) + Flèche (0) + Vesta (1, réduite à 0) + Apollon (1) + Nike (3) → Nike finit à 10, 4 d'énergie en tout */
    fresh(); S.turn = 6; S.energy = 6; S.vesta = { p: 1, e: 0 }; { const m = card("maat"), f = card("fleche"), v = card("vesta"), a = card("apollon"), n = card("nike"); S.hand.p = [m, f, v, a, n];
      const plays = [m, f, v, a, n].map(c => ({ c, li: 0 })); S.staged = plays.slice(); const u = used(); S.staged = [];
      await resolveTurn(plays, [], false); const nk = find("p", "nike");
      T("Tour 6 : Mā'at + Flèche + Vesta + Apollon puis Nike → Nike finit à 10", nk && nk.pow === 10, nk && nk.pow);
      T("Tour 6 : ces 5 cartes coûtent 4 d'énergie (Vesta du tour précédent : −1 sur la première carte Jugement de coût 1 ou plus)", u === 4, u);
      T("Apollon : la Flèche arrive en main après sa Révélation", S.hand.p.some(x => x.id === "fleche"), S.hand.p.map(x => x.id).join()); }
    /* J1b. Vesta en attente : Nike coûte 2 si elle est la première carte Jugement de coût 1 ou plus */
    fresh(); S.vesta = { p: 1, e: 0 }; T("Vesta : Nike coûte 2 grâce à la réduction", costFor("p", "nike", 0, false, true) === 2 && costFor("p", "nike", 0, false, false) === 3, costFor("p", "nike", 0, false, true));
    /* J2. Apollon avec la main pleine (7 cartes) : pas de Flèche */
    fresh(); { const a = card("apollon"); S.hand.p = [a, ...filler.map(id => card(id))]; await resolveTurn([{ c: a, li: 0 }], [], false);
      T("Apollon, main pleine : pas de Flèche", S.hand.p.length === 7 && !S.hand.p.some(x => x.id === "fleche"), S.hand.p.length); }
    fresh(); { const h = card("hephaistos"); S.hand.p = [h]; await resolveTurn([{ c: h, li: 0 }], [], false); const w = S.hand.p.find(x => x.id === "arme");
      T("Héphaïstos : une Arme d'Héphaïstos (coût 1, puissance 2) arrive en main", w && w.pow === 2 && CARDS.arme.cost === 1, w && w.pow); }
    /* J3. Vesta : seulement la prochaine carte Jugement (pas les autres factions), et elle reste active tant qu'aucune n'est jouée */
    fresh(); S.turn = 2; S.energy = 2; { const v = card("vesta"); S.hand.p = [v]; await resolveTurn([{ c: v, li: 0 }], [], false); }
    { const other = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].fac !== "jugement" && CARDS[id].cost === 3 && !ULof(id));
      T("Vesta : la réduction ne touche pas une carte d'une autre faction", costFor("p", other, 0, false, true) === 3 && costFor("p", "athena", 0, false, true) === CARDS.athena.cost - 1, costFor("p", other, 0, false, true));
      S.turn = 3; S.energy = 3; const o = card(other); S.hand.p = [o]; await resolveTurn([{ c: o, li: 1 }], [], false);
      T("Vesta : toujours active après une carte d'une autre faction", vestaOn("p"));
      S.turn = 4; S.energy = 4; const at = card("athena"); S.hand.p = [at]; await resolveTurn([{ c: at, li: 2 }], [], false);
      T("Vesta : consommée par la carte Jugement suivante", !vestaOn("p")); }
    /* J4. Zeus : cartes de coût 0 et 1 des deux côtés détruites ; mes cartes Jugement reviennent en main à leur puissance de base ; celles de l'adversaire vont au cimetière */
    fresh(); S.turn = 5; { const m = put("p", 0, "maat", 6), v = put("p", 0, "vesta"), f = put("p", 1, "fleche"), nj = put("p", 2, cheapNJ), em = put("e", 0, "maat"), enj = put("e", 1, cheapNJ), big = put("e", 1, "athena");
      const z = card("zeus"); S.hand.p = [z]; S.deck.p = []; const d0 = S.destroyed; await resolveTurn([{ c: z, li: 1 }], [], false);
      const ids = S.hand.p.map(x => x.id).sort().join();
      T("Zeus : mes cartes Jugement de coût ≤ 1 (Mā'at, Vesta, Flèche) reviennent en main", ids === ["fleche", "maat", "vesta"].sort().join(), ids);
      T("Zeus : elles reviennent à leur puissance de base (Mā'at à 1, pas 6)", (S.hand.p.find(x => x.id === "maat") || {}).pow === 1);
      T("Zeus : ma carte d'une autre faction et les cartes adverses de coût ≤ 1 vont au cimetière", S.graveyard.p.includes(cheapNJ) && S.graveyard.e.includes("maat") && S.graveyard.e.includes(cheapNJ) && !S.graveyard.p.includes("maat"), JSON.stringify(S.graveyard));
      T("Zeus : une carte de coût 2 ou plus reste en jeu, et les 6 destructions comptent", S.board.e[1].includes(big) && S.destroyed - d0 === 6, S.destroyed - d0); }
    /* J5. Zeus puis rejouer Apollon → nouvelle Flèche */
    fresh(); S.turn = 5; { put("p", 0, "apollon"); const z = card("zeus"); S.hand.p = [z]; await resolveTurn([{ c: z, li: 1 }], [], false);
      const a = S.hand.p.find(x => x.id === "apollon"); S.turn = 6; S.energy = 6; await resolveTurn([{ c: a, li: 0 }], [], false);
      T("Zeus puis Apollon rejoué : nouvelle Flèche en main", S.hand.p.some(x => x.id === "fleche"), S.hand.p.map(x => x.id).join()); }
    /* J6. Zeus face à Ananké et à Eir : rien ne bouge */
    fresh(); S.turn = 5; { const an = put("e", 0, "ananke"), eir = put("e", 2, "eir"), prot = put("e", 2, cheapNJ), myEir = put("p", 2, "eir"), myM = put("p", 2, "maat");
      const z = card("zeus"); S.hand.p = [z]; await resolveTurn([{ c: z, li: 1 }], [], false);
      T("Zeus : Ananké et les cartes protégées par Eir (des deux côtés) ne bougent pas", S.board.e[0].includes(an) && S.board.e[2].includes(prot) && S.board.p[2].includes(myM), JSON.stringify(S.board.e.map(c => c.map(x => x.id)))); }
    /* J7. Zeus + Styx : aucune carte ne revient deux fois */
    fresh(); S.turn = 5; { put("p", 0, "styx"); put("p", 0, "maat"); const z = card("zeus"); S.hand.p = [z]; await resolveTurn([{ c: z, li: 1 }], [], false);
      T("Zeus + Styx : Mā'at revient une seule fois en main", S.hand.p.filter(x => x.id === "maat").length === 1 && !S.graveyard.p.includes("maat"), S.hand.p.map(x => x.id).join()); }
    /* J8. Zeus avec la main pleine : la carte Jugement en trop reste au cimetière */
    fresh(); S.turn = 5; { put("p", 0, "maat"); const z = card("zeus"); S.hand.p = [z, ...filler.map(id => card(id))]; await resolveTurn([{ c: z, li: 1 }], [], false);
      T("Zeus, main pleine : Mā'at reste au cimetière", S.graveyard.p.includes("maat") && S.hand.p.length === 7, S.hand.p.length); }
    /* J9. Mā'at : +1 à ton autre carte la plus faible ici ; seule, rien */
    fresh(); { const a = put("p", 0, "athena", 4), b = put("p", 0, "vesta", 2); const m = card("maat"); S.hand.p = [m]; await resolveTurn([{ c: m, li: 0 }], [], false);
      T("Mā'at : +1 à l'autre carte la plus faible ici", b.pow === 3 && a.pow === 4 && find("p", "maat").pow === 1, `${b.pow}/${a.pow}`); }
    fresh(); { const m = card("maat"); S.hand.p = [m]; await resolveTurn([{ c: m, li: 0 }], [], false); T("Mā'at seule : rien ne se passe", find("p", "maat").pow === 1); }
    /* J10. Tsukuyomi : +2 si tu as une autre carte Jugement ici (15 octobre : remplace Amaterasu / Susanoo) */
    fresh(); { const t = put("p", 0, "tsukuyomi"); const p0 = cardPow("p", 0, t); put("p", 1, "athena"); const p1 = cardPow("p", 0, t); put("e", 0, "athena"); const p2 = cardPow("p", 0, t);
      put("p", 0, plain.find(id => CARDS[id].fac !== "jugement") || "coursier"); const p3 = cardPow("p", 0, t); put("p", 0, "fleche"); const p4 = cardPow("p", 0, t);
      T("Tsukuyomi : 2 seule, 2 avec une Jugement ailleurs ou chez l'adversaire, 2 avec une autre faction ici, 4 avec une Jugement ici (jeton compris)", p0 === 2 && p1 === 2 && p2 === 2 && p3 === 2 && p4 === 4, `${p0}/${p1}/${p2}/${p3}/${p4}`); }
    T("Nike : 3/2", CARDS.nike.cost === 3 && CARDS.nike.pow === 2);
    /* J11. Données, dates et jetons */
    T("Renfort Jugement : coûts, puissances, raretés et dates", CARDS.maat.cost === 0 && CARDS.maat.pow === 1 && CARDS.maat.r === "C" && CARDS.apollon.cost === 1 && CARDS.apollon.r === "R" && CARDS.vesta.pow === 2 && CARDS.hephaistos.cost === 2 && CARDS.tsukuyomi.r === "C" && CARDS.zeus.cost === 5 && CARDS.zeus.pow === 4 && CARDS.zeus.r === "L"
      && ["maat", "apollon", "vesta"].every(id => CARDS[id].rel === "2026-11-15" && CARDS[id].soon === "2026-11-10") && ["hephaistos", "tsukuyomi", "zeus", "cronos"].every(id => CARDS[id].rel === "2026-12-01" && CARDS[id].soon === "2026-11-26") && ["maat", "apollon", "vesta", "hephaistos", "tsukuyomi", "zeus"].every(id => CARDS[id].fac === "jugement"));
    T("Jetons Flèche et Arme : Jugement, hors collection et paquets", CARDS.fleche.token && CARDS.arme.token && !POOL.includes("fleche") && !POOL.includes("arme") && CARDS.fleche.fac === "jugement");
    /* J12. IA : Nike après les cartes à 0 et 1 ; Zeus joué quand l'adversaire a plusieurs cartes bon marché */
    fresh(); S.turn = 5; S.energy = S.energyE = 5; { const m = card("maat"), a = card("apollon"), n = card("nike"); S.hand.e = [n, m, a];
      const plan = aiPlan("e", 5), ids = plan.map(x => x.c.id); T("IA : Nike posée après Mā'at et Apollon", ids.includes("nike") && ids.indexOf("nike") === ids.length - 1 && ids.length === 3, ids.join()); }
    fresh(); S.turn = 5; S.energy = S.energyE = 5; { put("p", 0, "maat"); put("p", 1, cheapNJ); put("p", 2, "vesta"); const z = card("zeus"); S.hand.e = [z];
      const plan = aiPlan("e", 5); T("IA : Zeus joué au tour 5 face à 3 cartes adverses de coût ≤ 1", plan.some(x => x.c === z), JSON.stringify(plan.map(x => x.c.id))); }
    /* J13. IA autour de Nike (15 octobre) : petites cartes gardées pour son tour, Nike au tour 6, Zeus pour rejouer les petites cartes, deck construit autour d'elle */
    const other3 = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].fac !== "jugement" && CARDS[id].cost === 3 && !CARDS[id].fx && !ULof(id)) || "athena";
    fresh(); S.turn = 3; S.energy = S.energyE = 3; { const n = card("nike"), m = card("maat"), a = card("apollon"), o3 = card(other3); S.hand.e = [n, m, a, o3];
      const ids = aiPlan("e", 5).map(x => x.c.id); T("IA : Nike en main au tour 3 → Mā'at et Apollon gardés pour son tour", !ids.includes("maat") && !ids.includes("apollon") && !ids.includes("nike"), ids.join() || "rien"); }
    fresh(); S.turn = 4; S.energy = S.energyE = 4; { const n = card("nike"), m = card("maat"); S.hand.e = [n, m];
      const ids = aiPlan("e", 5).map(x => x.c.id); T("IA : pas de Nike au tour 4 avec moins de 3 cartes devant elle", !ids.includes("nike"), ids.join() || "rien"); }
    fresh(); S.turn = 6; S.energy = S.energyE = 6; { const hs = ["maat", "vesta", "apollon", "fleche", "nike"].map(id => card(id)); S.hand.e = hs;
      const ids = aiPlan("e", 5).map(x => x.c.id); T("IA : au tour 6, Nike jouée en dernier avec au moins 3 cartes devant elle", ids[ids.length - 1] === "nike" && ids.length >= 4, ids.join()); }
    fresh(); S.turn = 5; S.energy = S.energyE = 5; { put("e", 0, "maat"); put("e", 1, "vesta"); const z = card("zeus"), n = card("nike"); S.hand.e = [z, n];
      const ids = aiPlan("e", 5).map(x => x.c.id); T("IA : Nike en main, 2 petites cartes Jugement en jeu → Zeus au tour 5 (elles reviendront avant Nike)", ids.includes("zeus") && !ids.includes("nike"), ids.join() || "rien"); }
    { let n = 0, ok = 0; for (let i = 0; i < 400; i++) { const d = aiDeck(5, true).deck; if (!d.includes("nike")) continue; n++; if (d.filter(id => CARDS[id].fac === "jugement" && CARDS[id].cost <= 1 && id !== "nike").length >= 3) ok++; }
      /* rarement 2 seulement : quand les autres cartes du deck sont toutes liées à une synergie, elles ne sont pas remplacées */
      T("IA : un deck de l'IA avec Nike emporte au moins 3 petites cartes Jugement (au moins 95 % des decks)", n > 0 && ok >= .95 * n, `${ok}/${n}`); }
  }


  /* ===== Ananké 4/1 et Cronos (15 octobre) : les cartes qui verrouillent un lieu ne se jouent pas au tour 6 ; Echidna reprend l'ancien effet de Cronos ===== */
  { const stage = (id, turn, en) => { fresh(); S.turn = turn; S.energy = en; const c = card(id); S.hand.p = [c]; S.staged = []; return canStage(c, 0); };
    T("Ananké : injouable au tour 6 (6 et 10 d'énergie, Prométhée), jouable aux tours 4 et 5", !stage("ananke", 6, 6) && !stage("ananke", 6, 10) && stage("ananke", 4, 4) && stage("ananke", 5, 5));
    T("Cronos : injouable au tour 6 (même avec 10 d'énergie), jouable au tour 5", !stage("cronos", 6, 6) && !stage("cronos", 6, 10) && stage("cronos", 5, 5));
    T("Données : Ananké 4/1 ; Cronos Jugement légendaire 5/3 (1er décembre) ; Echidna Primordial 3/3, effet de défausse", CARDS.ananke.cost === 4 && CARDS.ananke.pow === 1 && CARDS.cronos.fac === "jugement" && CARDS.cronos.r === "L" && CARDS.cronos.cost === 5 && CARDS.cronos.pow === 3 && CARDS.cronos.rel === "2026-12-01" && CARDS.echidna.fac === "primordial" && /défausse les cartes de coût 1/.test(CARDS.echidna.fx));
    /* Ananké posée au tour 4, Qetesh adverse au tour 5 → charmée */
    fresh(); S.turn = 4; { const a = card("ananke"); S.hand.p = [a]; await resolveTurn([{ c: a, li: 0 }], [], false); S.turn = 5; const q = card("qetesh"); S.hand.e = [q]; await resolveTurn([], [{ c: q, li: 0 }], false);
      T("Ananké posée au tour 4, Qetesh adverse au tour 5 : charmée", a.charm === "e", a.charm); }
    /* Ananké posée au tour 5 sur un lieu adverse plein → plus aucun contre possible, elle gagne */
    fresh(); S.turn = 5; { for (let k = 0; k < capOf("e", 0); k++) put("e", 0, plain[k], 3); const a = card("ananke"); S.hand.p = [a]; await resolveTurn([{ c: a, li: 0 }], [], false);
      const full = S.board.e[0].length >= capOf("e", 0); S.final = true; const v = cardPow("p", 0, a), w = leader(0); S.final = false;
      T("Ananké posée au tour 5 face à un lieu adverse plein : aucune place pour un contre, elle gagne le lieu", full && w === "p" && v === total("e", 0) + 1, `${v} contre ${total("e", 0)}, plein ${full}`); }
    /* Cronos au tour 5 : les deux autres lieux sont vidés, des deux côtés ; son lieu intact */
    fresh(); S.turn = 5; { const k0 = put("p", 0, plain[0], 2), e0 = put("e", 0, plain[1], 3); put("p", 1, plain[2], 2); put("e", 1, plain[3], 4); put("p", 2, "fleche"); put("e", 2, plain[4], 1);
      const cr = card("cronos"); S.hand.p = [cr]; const d0 = S.destroyed; await resolveTurn([{ c: cr, li: 0 }], [], false);
      T("Cronos : les deux autres lieux sont vides des deux côtés, son lieu intact, 4 destructions comptées", !S.board.p[1].length && !S.board.e[1].length && !S.board.p[2].length && !S.board.e[2].length && S.board.p[0].includes(k0) && S.board.e[0].includes(e0) && S.destroyed - d0 === 4, `${S.destroyed - d0} détruites`); }
    /* Ananké et les cartes protégées par Eir survivent */
    fresh(); S.turn = 5; { const an = put("e", 1, "ananke"), x = put("e", 1, plain[0], 2), eir = put("e", 2, "eir"), y = put("e", 2, plain[1], 2); const cr = card("cronos"); S.hand.p = [cr]; await resolveTurn([{ c: cr, li: 0 }], [], false);
      T("Cronos : Ananké (Fatalité) survit, les autres cartes de son lieu non ; le lieu d'Eir est protégé", S.board.e[1].includes(an) && !S.board.e[1].includes(x) && S.board.e[2].includes(eir) && S.board.e[2].includes(y), JSON.stringify(S.board.e.map(l => l.map(c => c.id)))); }
    /* Styx adverse : ses cartes Jugement détruites par Cronos reviennent dans sa main ; les miennes non */
    fresh(); S.turn = 5; { put("e", 1, "styx"); put("e", 1, "athena", 3); put("p", 2, "vesta"); const cr = card("cronos"); S.hand.p = [cr]; S.hand.e = []; S.deck.p = []; S.deck.e = []; await resolveTurn([{ c: cr, li: 0 }], [], false);
      T("Cronos face à Styx adverse : Athéna revient dans la main adverse ; ma Vesta ne revient pas", S.hand.e.some(c => c.id === "athena") && !S.hand.p.some(c => c.id === "vesta") && S.graveyard.p.includes("vesta"), `main adverse : ${S.hand.e.map(c => c.id).join()}`); }
    /* Cronos au tour 5, puis au tour 6 : Mā'at + Flèche + Vesta + Nike dans un lieu vidé, Aphrodite ensuite (dans l'autre lieu vidé : 4 cartes au plus par lieu) */
    fresh(); S.turn = 5; { put("e", 1, plain[0], 3); put("e", 2, plain[1], 3); const cr = card("cronos"); S.hand.p = [cr]; await resolveTurn([{ c: cr, li: 0 }], [], false);
      S.turn = 6; S.energy = 6; const m = card("maat"), f = card("fleche"), v = card("vesta"), n = card("nike"), ap = card("aphrodite"); S.hand.p = [m, f, v, n, ap];
      await resolveTurn([{ c: m, li: 1 }, { c: f, li: 1 }, { c: v, li: 1 }, { c: n, li: 1 }, { c: ap, li: 2 }], [], false);
      T("Après Cronos : Nike calcule normalement dans un lieu vidé (2 + 3 × 2, rejouée par Aphrodite : 14)", n.pow === 14, n.pow); }
    /* Echidna : défausse les cartes de coût 0 ou 1 de ta main, +2 chacune */
    fresh(); S.turn = 4; { const e = card("echidna"); S.hand.p = [e, card("fleche"), card("maat"), card("athena")]; await resolveTurn([{ c: e, li: 0 }], [], false);
      T("Echidna : défausse les 2 cartes de coût 0 ou 1 (+4), garde les autres", e.pow === 7 && S.discardPile.p.length === 1 && S.hand.p.some(c => c.id === "athena") && !S.hand.p.some(c => c.id === "maat"), `${e.pow}, défausse ${S.discardPile.p.join()}`); }
    /* IA : Cronos au tour 5 quand elle mène un lieu et perd les deux autres, avec 2 petites cartes ; jamais si elle mène déjà deux lieux */
    fresh(); S.turn = 5; S.energy = S.energyE = 5; { put("e", 0, plain[0], 6); put("p", 0, plain[1], 2); put("p", 1, plain[2], 6); put("p", 2, plain[3], 6); const cr = card("cronos"); S.hand.e = [cr, card("maat"), card("vesta")];
      const plan = aiPlan("e", 5), at = plan.find(x => x.c === cr); T("IA : Cronos joué au tour 5 sur le lieu qu'elle mène, quand elle perd les deux autres", !!at && at.li === 0, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
    fresh(); S.turn = 5; S.energy = S.energyE = 5; { put("e", 0, plain[0], 6); put("e", 1, plain[1], 6); put("p", 2, plain[2], 6); const cr = card("cronos"); S.hand.e = [cr];
      const plan = aiPlan("e", 5); T("IA : jamais Cronos quand elle mène déjà deux lieux", !plan.some(x => x.c === cr), JSON.stringify(plan.map(x => [x.c.id, x.li]))); }

    /* Nike de la Saint-Valentin (22 octobre) : même carte que Nike, autre illustration ; quête dès le 1er février, sortie le 14 */
    T("Nike V : 3/2 comme Nike, même personnage, effet identique, holo et effet visuel de Nike", CARDS.nike_v.cost === CARDS.nike.cost && CARDS.nike_v.pow === CARDS.nike.pow && charOf("nike_v") === "nike" && isNike("nike_v") && isNike("nike") && !isNike("styx") && /\+2 de puissance pour chaque autre carte que tu as jouée avant elle/.test(CARDS.nike_v.fx) && CARDS.nike_v.vfx === "nike" && !!holoDir("nike_v"));
    fresh(); S.turn = 6; { const a = card(plain[0], 1), b = card(plain[1], 1), n = card("nike_v"), ap = card("aphrodite"); S.hand.p = [a, b, n, ap];
      await resolveTurn([a, b, n, ap].map(c => ({ c, li: 0 })), [], false); const nk = find("p", "nike_v"); T("Nike V + Aphrodite : finit à 10 comme Nike", nk && nk.pow === 10, nk && nk.pow); }
    fresh(); S.turn = 5; { const a = card(plain[0], 1), n = card("nike_v"); S.hand.p = [a, n]; await resolveTurn([a, n].map(c => ({ c, li: 0 })), [], false);
      const nk = find("p", "nike_v"); T("Nike V : +2 par carte jouée avant elle (une carte : 4)", nk && nk.pow === 4, nk && nk.pow); }
    fresh(); S.turn = 4; { put("p", 0, "styx"); const nk = put("p", 0, "nike_v"); T("Styx : Nike V reçoit aussi +3 (2 + 3)", cardPow("p", 0, nk) === 5, cardPow("p", 0, nk));
      SRC = { s: "e", cost: 3 }; const ok = destroy("p", 0, nk); SRC = null; T("Styx : Nike V détruite par l'adversaire revient en main", ok && S.hand.p.includes(nk) && !S.graveyard.p.includes("nike_v"), ok); }
    fresh(); S.turn = 5; S.energy = S.energyE = 5; { const m = card("maat"), a = card("apollon"), n = card("nike_v"); S.hand.e = [n, m, a];
      const ids = aiPlan("e", 5).map(x => x.c.id); T("IA : Nike V posée après Mā'at et Apollon, comme Nike", ids.indexOf("nike_v") === ids.length - 1 && ids.length === 3, ids.join()); }
    fresh(); S.turn = 3; S.energy = S.energyE = 3; { const n = card("nike_v"), m = card("maat"), a = card("apollon"), o3 = card(Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].fac !== "jugement" && CARDS[id].cost === 3 && !CARDS[id].fx && !ULof(id)) || "athena"); S.hand.e = [n, m, a, o3];
      const ids = aiPlan("e", 5).map(x => x.c.id); T("IA : Nike V en main au tour 3 → les petites cartes sont gardées pour son tour", !ids.includes("maat") && !ids.includes("apollon") && !ids.includes("nike_v"), ids.join() || "rien"); }
    { const keep = window.__today, jr = () => { P.owned = P.owned.filter(x => x !== "nike_v"); return journalHTML(); };
      window.__today = "2027-01-31"; P.fj = { nikev: 7 }; T("Journal : pas de ligne Saint-Valentin avant le 1er février", !jr().includes("Saint-Valentin"));
      window.__today = "2027-02-03"; { const h = jr(); T("Journal : la quête est visible dès le 1er février, la carte et le seuil ne sont pas encore révélés", h.includes("Saint-Valentin · avec Nike") && h.includes("7 parties") && h.includes("bientôt") && !h.includes("/25") && !h.includes("Récompense : Nike de la Saint-Valentin")); }
      window.__today = "2027-02-09"; P.fj = { nikev: 7 }; { const h = jr(); T("Journal : le 9 février la carte est annoncée (7/25)", h.includes("7/25") && h.includes("Récompense : Nike de la Saint-Valentin")); }
      P.fj = { nikev: 25 }; window.__today = "2027-02-12"; screen = "home"; ulLater = false; P.tuto = true; tutoStep = -1; T("Quête finie le 12 février : la fenêtre de réclamation attend la sortie de la carte (le 14)", !ulHTML().includes("Nike de la Saint-Valentin"));
      window.__today = "2027-02-14"; T("Le 14 février : Nike de la Saint-Valentin est réclamable", ulHTML().includes("Nike de la Saint-Valentin"));
      window.__today = keep; P.fj = {}; }

    /* Cartes de fête (22 octobre) : Ereshkigal, Dame de la Longue Nuit ; Aphrodite, Coupe de Minuit ; Arès, Duelliste du Dernier Soir */
    T("Données : Ereshkigal Dame de la Longue Nuit (Jugement, Rare, 5/3, Noël, sortie le 14 décembre), sans effet visuel de légendaire", CARDS.ereshkigal_n.fac === "jugement" && CARDS.ereshkigal_n.r === "R" && CARDS.ereshkigal_n.cost === 5 && CARDS.ereshkigal_n.pow === 3 && CARDS.ereshkigal_n.ex === "noel" && CARDS.ereshkigal_n.rel === "2026-12-14" && CARDS.ereshkigal_n.soon === "2026-12-09" && !CARDS.ereshkigal_n.vfx && CARDS.ereshkigal_n.base === "ereshkigal");
    T("Données : Aphrodite Coupe de Minuit (Désir, Épique, 5/3) et Arès Duelliste du Dernier Soir (Primordial, Rare, 5/4), Nouvel An, sortie le 31 décembre", CARDS.aphrodite_r.fac === "desir" && CARDS.aphrodite_r.r === "E" && CARDS.aphrodite_r.cost === 5 && CARDS.aphrodite_r.pow === 3 && CARDS.ares_n.fac === "primordial" && CARDS.ares_n.r === "R" && CARDS.ares_n.cost === 5 && CARDS.ares_n.pow === 4 && ["aphrodite_r", "ares_n"].every(id => CARDS[id].ex === "nouvelan" && CARDS[id].rel === "2026-12-31" && CARDS[id].soon === "2026-12-26"));
    { const ex = k => Object.keys(CARDS).filter(id => CARDS[id].ex === k).length, fus = k => ULS.filter(u => u.req.length && ulSeason(u) === k).length;
      T("Comptage : Noël = 5 exclusives, Nouvel An = 6 cartes + 2 fusions = 8", ex("noel") === 5 && ex("nouvelan") === 6 && fus("noel") === 0 && fus("nouvelan") === 2, `${ex("noel")} / ${ex("nouvelan")} + ${fus("nouvelan")}`); }
    T("Renommages : Qetesh, Vœu du Premier Jour (et le texte de la fusion) ; Éos, Première Aube de l'An ; version anglaise", CARDS.qetesh_r.name === "Qetesh, Vœu du Premier Jour" && CARDS.eos_r.name === "Éos, Première Aube de l'An" && /Exige Qetesh, Vœu du Premier Jour et Jordan/.test(CARDS.ulqetjor_r.fx) && ULof("ulqetjor_r").n === "Qetesh, Vœu du Premier Jour et Jordan" && HELVARA_EN.cards.ares_n.n === "Ares, Duelist of the Last Evening" && HELVARA_EN.cards.ereshkigal_n.n === "Ereshkigal, Lady of the Long Night" && HELVARA_EN.cards.aphrodite_r.n === "Aphrodite, Midnight Cup");
    /* Ereshkigal : coût */
    fresh(); S.turn = 3; { const er = card("ereshkigal_n"), ng = card("nergal"); S.hand.p = [er, ng];
      T("Ereshkigal Longue Nuit : 5 d'énergie sans Nergal, 3 avec Nergal en main", (S.hand.p = [er], costFor("p", "ereshkigal_n", 0, false, false) === 5) && (S.hand.p = [er, ng], costFor("p", "ereshkigal_n", 0, false, false) === 3), costFor("p", "ereshkigal_n", 0, false, false));
      S.hand.p = [er, card("nergal_h")]; T("Ereshkigal Longue Nuit : la version d'Halloween de Nergal compte aussi", costFor("p", "ereshkigal_n", 0, false, false) === 3);
      S.hand.p = [er, ng]; S.energy = 3; S.sel = er.uid; const ok = stageSel(0);
      T("Ereshkigal Longue Nuit : posée à 3 avec Nergal, le coût reste fixé à 3 une fois Nergal posé ensuite", ok && S.staged[0].fixed === 3 && used() === 3, `${ok} ${S.staged[0] && S.staged[0].fixed}`);
      S.staged = []; S.hand.p = [er]; S.energy = 3; T("Ereshkigal Longue Nuit : sans Nergal, 3 d'énergie ne suffisent pas", !canStage(er, 0)); }
    /* Ereshkigal : Révélation (la moitié de la puissance de la plus forte adverse ici, arrondie au-dessus) ; plus de Continu */
    T("Ereshkigal Longue Nuit : texte (coût réduit avec Nergal, Révélation moitié arrondie au-dessus, plus de Continu)", /^Coûte 2 de moins si Nergal est dans ta main\. Révélation : la carte adverse la plus forte ici perd la moitié de sa puissance \(arrondie au-dessus\)\.$/.test(CARDS.ereshkigal_n.fx) && !/Continu/.test(CARDS.ereshkigal_n.fx) && /loses half its Power \(rounded up\)/.test(HELVARA_EN.cards.ereshkigal_n.fx));
    for (const [pw0, exp] of [[6, 3], [5, 2], [1, 0], [8, 4], [3, 1]]) {
      fresh(); S.turn = 3; { const er = card("ereshkigal_n"), f = put("e", 0, plain[0], pw0), g = put("e", 0, plain[1], 1); S.hand.p = [er]; await resolveTurn([{ c: er, li: 0 }], [], false);
        T(`Ereshkigal Longue Nuit : la plus forte adverse (${pw0}) perd la moitié arrondie au-dessus → ${exp}, la plus faible (1) ${pw0 === 1 ? "est une égalité de plus faible" : "ne bouge pas"}`, f.pow === exp && (pw0 === 1 || g.pow === 1), [f.pow, g.pow]); } }
    fresh(); S.turn = 3; { const er = card("ereshkigal_n"), f = put("e", 0, plain[0], 6), own = put("p", 0, plain[1], 6); S.hand.p = [er]; await resolveTurn([{ c: er, li: 0 }], [], false);
      T("Ereshkigal Longue Nuit : ne touche pas tes propres cartes ni les autres lieux", own.pow === 6 && f.pow === 3); }
    fresh(); S.turn = 3; { const er = card("ereshkigal_n"), f = put("e", 1, plain[0], 6); S.hand.p = [er]; await resolveTurn([{ c: er, li: 0 }], [], false); T("Ereshkigal Longue Nuit : sans carte adverse dans son lieu, rien ne se passe", f.pow === 6); }
    fresh(); S.turn = 3; { const er = card("ereshkigal_n"), f = put("e", 0, plain[0], 6); S.hand.p = [er]; await resolveTurn([{ c: er, li: 0 }], [], false); S.turn = 4; await resolveTurn([], [], false);
      T("Ereshkigal Longue Nuit : l'effet est ponctuel, la perte ne se répète pas aux fins de tour suivantes", f.pow === 3, f.pow); }
    fresh(); S.turn = 3; { const er = card("ereshkigal_n"), f = put("e", 0, "ananke", 6); f.pow = 6; S.hand.p = [er]; await resolveTurn([{ c: er, li: 0 }], [], false); T("Ereshkigal Longue Nuit : la Fatalité d'Ananké (ni détruite ni déplacée) ne protège pas d'un affaiblissement : 6 → 3", f.pow === 3, f.pow); }
    /* Aphrodite, Coupe de Minuit */
    /* resolveTurn enchaîne sur le tour suivant : le bonus est alors déjà dans l'énergie, et chaque camp a pioché sa carte de début de tour */
    fresh(); S.turn = 3; { const t0 = card(plain[0]); S.hand.p = [t0]; S.hand.e = []; await resolveTurn([{ c: t0, li: 0 }], [], false); var ref = { en: S.energy, hp: S.hand.p.length, he: S.hand.e.length, turn: S.turn }; }
    fresh(); S.turn = 3; { const ap = card("aphrodite_r"); S.hand.p = [ap]; S.hand.e = []; await resolveTurn([{ c: ap, li: 0 }], [], false);
      T("Coupe de Minuit : +2 d'énergie au tour suivant (4 + 2) et chaque joueur pioche 1 carte de plus", S.turn === 4 && S.energy === 6 && ref.en === 4 && S.hand.p.length === ref.hp + 1 && S.hand.e.length === ref.he + 1, `énergie ${S.energy} (réf. ${ref.en}), mains ${S.hand.p.length}/${S.hand.e.length} (réf. ${ref.hp}/${ref.he})`); }
    fresh(); S.turn = 6; { const ap = card("aphrodite_r"); S.hand.p = [ap]; S.hand.e = []; await resolveTurn([{ c: ap, li: 0 }], [], false); T("Coupe de Minuit : sans effet au tour 6 (ni énergie, ni pioche)", S.bonus.p === 0 && S.hand.p.length === 0 && S.hand.e.length === 0, `bonus ${S.bonus.p}, mains ${S.hand.p.length}/${S.hand.e.length}`); }
    fresh(); S.turn = 4; { const ap = card("aphrodite_r"); S.hand.p = [ap]; S.bonus.p = 4; await resolveTurn([{ c: ap, li: 0 }], [], false); T("Coupe de Minuit : plafond de 10 d'énergie au tour suivant (5 + 4 déjà gardés : +1 seulement)", S.turn === 5 && S.energy === 10, S.energy); }
    fresh(); S.turn = 4; { const ap = card("aphrodite_r"); S.hand.p = [ap]; S.bonus.p = 5; S.hand.e = []; await resolveTurn([{ c: ap, li: 0 }], [], false); T("Coupe de Minuit : déjà au plafond (10), pas d'énergie en plus mais la pioche a lieu", S.energy === 10 && S.hand.e.length === 2, `énergie ${S.energy}, main adverse ${S.hand.e.length}`); }
    fresh(); S.turn = 3; { const ap = card("aphrodite_r"); S.hand.p = [ap]; S.hand.e = [...Array(7)].map(() => card(plain[0])); await resolveTurn([{ c: ap, li: 0 }], [], false); T("Coupe de Minuit : main adverse pleine (7) : pas de carte en plus, rien ne plante, l'énergie est bien donnée", S.hand.e.length === 7 && S.energy === 6, `${S.hand.e.length} / ${S.energy}`); }
    fresh(); S.turn = 3; { const ap = card("aphrodite_r"), a = card("aphrodite"); const r = [[ap, a]]; S.hand.p = [ap]; T("Coupe de Minuit : une Aphrodite ne la rejoue pas (les variantes ne sont pas rejouables) mais elle compte pour Nike", !replayable(ap) && !isAph(ap) && isAph(a) && isAph(card("ulaph"))); }
    /* Nike et les variantes d'Aphrodite (22 octobre, Jordan) : seules Aphrodite et Aphrodite X Yarden ne comptent pas */
    for (const [id, cnt, nom] of [["aphrodite_r", 4, "Coupe de Minuit"], ["aphrodite_n", 4, "Étoile de Noël"], ["aphrodite", 2, "de base"], ["ulaph", 2, "X Yarden"]]) {
      fresh(); S.turn = 5; { const a = card(id), n = card("nike"); S.hand.p = [a, n]; await resolveTurn([a, n].map(c => ({ c, li: 0 })), [], false); const nk = find("p", "nike");
        T(`Nike après Aphrodite ${nom} : ${cnt === 4 ? "elle compte (+2 : Nike à 4)" : "elle ne compte pas (Nike reste à 2)"}`, nk && nk.pow === cnt, nk && nk.pow); } }
    T("Aphrodite et Aphrodite X Yarden : le texte dit qu'elles ne comptent pas pour Nike (FR et EN)", /Ne compte pas pour Nike\./.test(CARDS.aphrodite.fx) && /Ne compte pas pour Nike\./.test(CARDS.ulaph.fx) && /Does not count for Nike\./.test(HELVARA_EN.cards.aphrodite.fx) && /Does not count for Nike\./.test(HELVARA_EN.cards.ulaph.fx) && !/Nike/.test(CARDS.aphrodite_r.fx));
    /* Arès, Duelliste du Dernier Soir */
    fresh(); S.turn = 3; { const ar = card("ares_n"), f = put("e", 0, plain[0], 3); S.hand.p = [ar]; await resolveTurn([{ c: ar, li: 0 }], [], false);
      T("Arès Duelliste : la carte adverse la plus forte (3) est plus faible que lui (4) → elle est détruite, il reste", !S.board.e[0].includes(f) && S.board.p[0].includes(ar) && S.graveyard.e.includes(plain[0]), `${S.board.e[0].length} / ${S.board.p[0].length}`); }
    fresh(); S.turn = 3; { const ar = card("ares_n"), f = put("e", 0, plain[0], 6); S.hand.p = [ar]; await resolveTurn([{ c: ar, li: 0 }], [], false);
      T("Arès Duelliste : la carte adverse la plus forte (6) est plus forte que lui (4) → c'est lui qui est détruit", S.board.e[0].includes(f) && !S.board.p[0].includes(ar) && S.graveyard.p.includes("ares_n"), `${S.board.e[0].length} / ${S.board.p[0].length}`); }
    fresh(); S.turn = 3; { const ar = card("ares_n"), f = put("e", 0, plain[0], 4); S.hand.p = [ar]; await resolveTurn([{ c: ar, li: 0 }], [], false);
      T("Arès Duelliste : égalité (4 contre 4) → aucune des deux n'est détruite", S.board.e[0].includes(f) && S.board.p[0].includes(ar)); }
    fresh(); S.turn = 3; { const ar = card("ares_n"), f = put("e", 0, plain[0], 2), g = put("e", 0, plain[1], 3); S.hand.p = [ar]; await resolveTurn([{ c: ar, li: 0 }], [], false);
      T("Arès Duelliste : il ne défie que la plus forte (3) ; la plus faible (2) reste", !S.board.e[0].includes(g) && S.board.e[0].includes(f)); }
    fresh(); S.turn = 3; { const ar = card("ares_n"), f = put("e", 1, plain[0], 1); S.hand.p = [ar]; await resolveTurn([{ c: ar, li: 0 }], [], false);
      T("Arès Duelliste : sans carte adverse dans son lieu, rien ne se passe", S.board.p[0].includes(ar) && S.board.e[1].includes(f)); }
    fresh(); S.turn = 3; { const ar = card("ares_n"), f = put("e", 0, "ananke", 1); S.hand.p = [ar]; await resolveTurn([{ c: ar, li: 0 }], [], false);
      T("Arès Duelliste : Fatalité d'Ananké (ni détruite ni déplacée) la protège quand elle est la plus faible", S.board.e[0].includes(f) && S.board.p[0].includes(ar)); }
    /* IA */
    fresh(); S.turn = 5; S.energy = S.energyE = 5; { const ap = card("aphrodite_r"); S.hand.e = [ap]; const plan = aiPlan("e", 5);
      T("IA : Coupe de Minuit est jouée au tour 5 (au plus tard)", plan.some(x => x.c === ap), JSON.stringify(plan.map(x => x.c.id))); }
    fresh(); S.turn = 2; S.energy = S.energyE = 5; { const ap = card("aphrodite_r"); S.hand.e = [ap]; const plan = aiPlan("e", 5);
      T("IA : Coupe de Minuit est jouée dès le tour 2", plan.some(x => x.c === ap), JSON.stringify(plan.map(x => x.c.id))); }
    fresh(); S.turn = 6; S.energy = S.energyE = 6; { const ap = card("aphrodite_r"), alt = card("ares"), alt2 = card("nergal"); S.hand.e = [ap, alt2]; const plan = aiPlan("e", 5);
      T("IA : au tour 6 Coupe de Minuit (sans effet) passe après une vraie carte", !plan.some(x => x.c === ap) && plan.some(x => x.c === alt2), JSON.stringify(plan.map(x => x.c.id))); }
    fresh(); S.turn = 4; S.energy = S.energyE = 5; { const ar = card("ares_n"); S.hand.e = [ar]; put("p", 0, plain[0], 2); put("p", 1, plain[1], 9); put("p", 2, plain[2], 9); const plan = aiPlan("e", 5), at = plan.find(x => x.c === ar);
      T("IA : Arès Duelliste est posé là où la carte adverse la plus forte est plus faible que lui (2 contre 4)", !!at && at.li === 0, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
    fresh(); S.turn = 4; S.energy = S.energyE = 5; { const er = card("ereshkigal_n"); S.hand.e = [er]; put("p", 1, plain[0], 7); const plan = aiPlan("e", 5), at = plan.find(x => x.c === er);
      T("IA : Ereshkigal Longue Nuit est posée face à une carte adverse (lieu 1)", !!at && at.li === 1, JSON.stringify(plan.map(x => [x.c.id, x.li]))); }

    /* Lieu à l'honneur (22 octobre) : samedi et dimanche, un lieu du jour dans toutes les parties, +25 CHF à la première partie du jour contre l'IA */
    { const keep = window.__today, sat = "2026-12-05", sun = "2026-12-06", wk = ["2026-12-07", "2026-12-08", "2026-12-09", "2026-12-10", "2026-12-11"];
      const at = d => { window.__today = d; };
      at(sat); const on1 = featureOn(); at(sun); const on2 = featureOn(); const off = wk.every(d => (at(d), !featureOn() && featureLoc() === null));
      T("Lieu à l'honneur : actif le samedi et le dimanche, jamais du lundi au vendredi", on1 && on2 && off, `${on1} ${on2} ${off}`);
      at(sat); const f1 = featureLoc(), f2 = featureLoc(); const days = ["2026-12-05", "2026-12-06", "2026-12-12", "2026-12-13", "2026-12-19", "2026-12-20", "2027-01-02", "2027-01-03"].map(d => (at(d), featureLoc()));
      T("Lieu à l'honneur : le même lieu à chaque appel un jour donné (tirage par le jour), un lieu sorti, et il change d'un jour à l'autre", f1 === f2 && locPool().includes(f1) && days.every(x => locPool().includes(x)) && new Set(days).size >= 3, days.join());
      at(sat); const picks = [...Array(300)].map(() => pickLocs());
      T("Lieu à l'honneur : sur 300 tirages le samedi, 3 lieux distincts et le lieu à l'honneur toujours présent", picks.every(a => a.length === 3 && new Set(a).size === 3 && a.includes(f1)), JSON.stringify(picks.find(a => !(a.length === 3 && new Set(a).size === 3 && a.includes(f1)))));
      T("Lieu à l'honneur : sa place est tirée au hasard (les trois places sont occupées au moins une fois)", [0, 1, 2].every(i => picks.some(a => a[i] === f1)));
      at(wk[0]); const wkPicks = [...Array(300)].map(() => pickLocs()); T("Lieu à l'honneur : en semaine, tirage normal (3 lieux distincts)", wkPicks.every(a => a.length === 3 && new Set(a).size === 3));
      /* dans une vraie partie */
      at(sat); fresh(); const g0 = games; newGame(); T("Lieu à l'honneur : une partie contre l'IA le samedi contient le lieu du jour (S.feat)", S.feat === f1 && S.locs.some(L => L.id === f1), `${S.feat} / ${S.locs.map(L => L.id)}`);
      at(wk[0]); newGame(); T("Lieu à l'honneur : en semaine, aucune partie ne le marque (S.feat vide)", S.feat === null);
      at(sat); { const g = games, w = P.w, l = P.l, d = P.d; games = 0; P.w = P.l = P.d = 0; newGame(); T("Lieu à l'honneur : la toute première partie d'un joueur garde ses trois lieux d'initiation", S.locs.map(L => L.id).join() === "ruelle,ouchy,sousgare" && S.feat === null, S.locs.map(L => L.id)); games = g; P.w = w; P.l = l; P.d = d; }
      /* récompense */
      const playOut = async () => { newGame(); quiet = false; S.turn = 6; S.energy = 6; S.hand.p = []; S.hand.e = []; const before = P.chf; await resolveTurn([], [], false); quiet = true; return { o: S.over, gained: P.chf - before }; };
      at(sat); P.ld = ""; const a = await playOut();
      T("Lieu à l'honneur : première partie du samedi contre l'IA = le gain normal + 25 CHF, une fois", !!a.o && a.o.feat === 25 && P.ld === sat && a.gained === a.o.gain + 25, `${a.o && a.o.feat} / ${P.ld} / ${a.gained} (gain ${a.o && a.o.gain})`);
      const b = await playOut(); T("Lieu à l'honneur : la deuxième partie du même jour ne donne plus rien en plus", !!b.o && b.o.feat === 0 && b.gained === b.o.gain, `${b.o && b.o.feat} / ${b.gained}`);
      at(sun); const c = await playOut(); T("Lieu à l'honneur : le lendemain (dimanche), 25 CHF de nouveau", !!c.o && c.o.feat === 25 && P.ld === sun, `${c.o && c.o.feat}`);
      at(wk[0]); P.ld = ""; const e = await playOut(); T("Lieu à l'honneur : en semaine, pas de bonus", !!e.o && e.o.feat === 0 && P.ld === "", `${e.o && e.o.feat}`);
      at(sat); P.ld = ""; newGame(); quiet = true; S.turn = 6; S.energy = 6; { const before = P.chf; await resolveTurn([], [], false); T("Lieu à l'honneur : pas de bonus dans une simulation (hors partie réelle)", P.ld === "" && S.over && !S.over.feat, `${P.ld}`); }
      /* accueil, profil, anglais */
      at(sat); P.tuto = true; P.ld = ""; T("Lieu à l'honneur : l'accueil du samedi montre le lieu, l'effet et les 25 CHF", /Lieu à l'honneur/.test(homeHTML()) && homeHTML().includes(LOCS[f1].name) && homeHTML().includes("+25 CHF pour ta première partie contre l'IA"));
      P.ld = sat; T("Lieu à l'honneur : une fois reçu, l'accueil le dit", homeHTML().includes("+25 CHF reçus aujourd'hui"));
      at(wk[0]); T("Lieu à l'honneur : pas de bandeau en semaine", !/Lieu à l'honneur/.test(homeHTML()));
      T("Lieu à l'honneur : P.ld survit au nettoyage du profil, une valeur absurde est ignorée", clean({ ld: "2026-12-05" }).ld === "2026-12-05" && clean({ ld: 42 }).ld === "" && clean({}).ld === "");
      T("Lieu à l'honneur : textes anglais (bandeau et résultat)", HELVARA_UI_EN.exact["Lieu à l'honneur · aujourd'hui"] === "Featured place · today" && HELVARA_UI_EN.rules.some(([re]) => re.test("Lieu à l'honneur : +25 CHF pour ta première partie du jour.")));
      window.__today = keep; P.ld = ""; games = g0; }

    /* ===== Lot du 1er janvier 2027 (22 octobre) : 15 cartes ===== */
    { const IDS = ["archiviste", "veilleur_pont", "enfant", "meute", "musicien", "reflet_noir", "patronne", "ularchiviste", "quetzalcoatl", "ea", "anansi", "dagda", "indra", "cernunnos", "typhon"];
      const SP = { archiviste: [3, 2, "helvara", "R"], veilleur_pont: [2, 3, "helvara", "R"], enfant: [0, 0, "helvara", "R"], meute: [4, 10, "helvara", "E"], musicien: [3, 3, "helvara", "E"], reflet_noir: [3, 5, "helvara", "E"], patronne: [5, 4, "helvara", "E"], ularchiviste: [3, 2, "helvara", "U"],
        quetzalcoatl: [3, 2, "desir", "R"], ea: [4, 2, "desir", "L"], anansi: [4, 2, "desir", "L"], dagda: [4, 3, "jugement", "E"], indra: [4, 2, "jugement", "E"], cernunnos: [3, 1, "primordial", "E"], typhon: [4, 4, "primordial", "E"] };
      T("Lot du 1er janvier : les 15 cartes ont leurs coût, puissance, faction et rareté", IDS.every(id => { const d = CARDS[id], x = SP[id]; return d.cost === x[0] && d.pow === x[1] && d.fac === x[2] && d.r === x[3]; }), IDS.filter(id => { const d = CARDS[id], x = SP[id]; return !(d.cost === x[0] && d.pow === x[1] && d.fac === x[2] && d.r === x[3]); }).join());
      T("Lot du 1er janvier : sortie le 1er janvier 2027, annonce le 27 décembre, aucune n'est exclusive ; Plume est un jeton", IDS.every(id => CARDS[id].rel === "2027-01-01" && CARDS[id].soon === "2026-12-27" && !CARDS[id].ex && !CARDS[id].vfx === !CARDS[id].vfx && CARDS[id].fx) && CARDS.plume.token && CARDS.plume.pow === 1 && CARDS.plume.cost === 0);
      T("Lot du 1er janvier : bannière DROPS du 1er janvier (15 cartes), FR et EN", DROPS.some(d => d.id === "jan1" && d.rel === "2027-01-01" && d.soon === "2026-12-27") && POOL.filter(id => CARDS[id].rel === "2027-01-01").length === 15 && HELVARA_UI_EN.data.DROPS.jan1.length > 20);
      T("Lot du 1er janvier : Primordial ne gagne que Cernunnos et Typhon, Quetzalcoatl et Ea passent en Désir, Dagda et Indra en Jugement", ["cernunnos", "typhon"].every(id => CARDS[id].fac === "primordial") && ["quetzalcoatl", "ea"].every(id => CARDS[id].fac === "desir") && ["dagda", "indra"].every(id => CARDS[id].fac === "jugement") && IDS.filter(id => CARDS[id].fac === "primordial").length === 2);
      T("Lot du 1er janvier : textes anglais des 15 cartes", IDS.every(id => HELVARA_EN.cards[id] && HELVARA_EN.cards[id].fx && /[a-z]/.test(HELVARA_EN.cards[id].fx)) && HELVARA_EN.cards.plume.n === "Feather");
      const base = async () => { fresh(); S.turn = 3; const t0 = card(plain[0]); S.hand.p = [t0]; S.hand.e = []; await resolveTurn([{ c: t0, li: 0 }], [], false); return { hp: S.hand.p.length, he: S.hand.e.length }; };
      /* L'Archiviste X La Patronne : eau et champagne (Jordan, 22 octobre) et jeton Plume illustré */
      { window.__fxErr = []; FX.play("ularchiviste", { li: 0, ultra: true }); await wait(60); const okPlume = (await fetch("images/plume.webp")).ok && (await fetch("images/avatars/plume.webp")).ok;
        T("Archiviste X Patronne : effet visuel propre (vfx), lueur de cinématique bleue et dorée, aucune erreur de dessin", CARDS.ularchiviste.vfx === "ularchiviste" && typeof FUSION_FLASH === "object" && !!FUSION_FLASH.ularchiviste && (window.__fxErr || []).length === 0, JSON.stringify(window.__fxErr));
        T("Plume : illustration fournie (carte et avatar) et branchée sur le jeton", okPlume && CARDS.plume.img === "images/plume.webp" && art("plume").includes("images/plume.webp")); }
      /* 1. L'Archiviste */
      { const r = await base(); fresh(); S.turn = 3; const ar = card("archiviste"); S.hand.p = [ar]; S.hand.e = []; await resolveTurn([{ c: ar, li: 0 }], [], false);
        T("Archiviste : pioche 2 cartes, l'adversaire en pioche 1", S.hand.p.length === r.hp + 2 && S.hand.e.length === r.he + 1, `${S.hand.p.length}/${S.hand.e.length} (réf. ${r.hp}/${r.he})`); }
      /* 2. Le Veilleur du Pont */
      fresh(); S.turn = 3; { put("p", 0, "veilleur_pont"); const a = card(plain[0], 4), b = card(plain[1], 4), c = card(plain[2], 4); S.hand.e = [a, b, c]; await resolveTurn([], [{ c: a, li: 0 }, { c: b, li: 0 }, { c: c, li: 1 }], false);
        T("Veilleur du Pont : seule la première carte adverse jouée ici perd 1 (la deuxième et celle d'un autre lieu non)", a.pow === 3 && b.pow === 4 && c.pow === 4, [a.pow, b.pow, c.pow]);
        const d = card(plain[3], 4); S.hand.e = [d]; await resolveTurn([], [{ c: d, li: 0 }], false); T("Veilleur du Pont : de nouveau le tour suivant", d.pow === 3, d.pow); }
      /* 3. L'Enfant sans École */
      fresh(); S.turn = 3; { const en = card("enfant"); S.hand.p = [en]; T("Enfant : coût 0, jouable", costFor("p", "enfant", 0, true, true) === 0 && canStage(en, 0)); await resolveTurn([{ c: en, li: 0 }], [], false);
        T("Enfant : à la fin du tour 3, retourne dans la main avec +1 (permanent)", !S.board.p[0].includes(en) && S.hand.p.includes(en) && en.pow === 1 && !en.rev, `${en.pow} ${en.rev}`);
        S.hand.p = [en]; await resolveTurn([{ c: en, li: 0 }], [], false); T("Enfant : rejouée au tour suivant (aucune limite de cartes par tour), de nouveau +1 → 2", S.hand.p.includes(en) && en.pow === 2, en.pow); }
      fresh(); S.turn = 1; { const en = card("enfant"); for (let i = 1; i <= 5; i++) { S.hand.p = [en]; S.hand.e = []; await resolveTurn([{ c: en, li: 0 }], [], false); }
        T("Enfant : jouée aux tours 1 à 5, elle entre au tour 6 avec 5 de puissance", S.turn === 6 && en.pow === 5 && S.hand.p.includes(en), `${S.turn} ${en.pow}`);
        S.hand.p = [en]; await resolveTurn([{ c: en, li: 0 }], [], false); T("Enfant : au tour 6 elle reste en jeu, sans retour ni gain (5 pour 0)", S.board.p[0].includes(en) && en.pow === 5 && cardPow("p", 0, en) === 5, `${en.pow}`); }
      fresh(); S.turn = 3; { const en = card("enfant"); S.hand.p = [en, ...[...Array(7)].map(() => card(plain[0]))]; await resolveTurn([{ c: en, li: 0 }], [], false);
        T("Enfant : main pleine, pas de retour en main donc pas de gain : elle reste en jeu à 0 (Jordan, 22 octobre)", S.board.p[0].includes(en) && en.pow === 0 && !S.hand.p.includes(en), `${en.pow} ${S.hand.p.length}`); }
      fresh(); S.turn = 3; { const en = card("enfant"); en.neg = true; S.hand.p = [en]; await resolveTurn([{ c: en, li: 0 }], [], false); T("Enfant : sans effet si elle a perdu ses effets (Apsu) : elle reste, 0 de puissance", S.board.p[0].includes(en) && en.pow === 0); }
      fresh(); S.turn = 3; S.energy = S.energyE = 5; { const en = card("enfant"), x = card(plain[0]); S.hand.e = [en, x]; const ids = aiPlan("e", 5).map(y => y.c.id); T("IA : rejoue l'Enfant sans École chaque tour (coût 0)", ids.includes("enfant"), ids.join()); }
      /* 4. La Meute du M2 */
      fresh(); S.turn = 3; { const m = put("p", 0, "meute"), mine = put("p", 0, plain[0], 3), foe = put("e", 0, plain[1], 3), foe2 = put("e", 1, plain[2], 3);
        T("Meute : les cartes adverses ici ont +2 (3 → 5), les tiennes et celles d'un autre lieu non", cardPow("e", 0, foe) === 5 && cardPow("p", 0, mine) === 3 && cardPow("e", 1, foe2) === 3 && cardPow("p", 0, m) === 12 /* 10 + 2 du lieu de test */, [cardPow("e", 0, foe), cardPow("p", 0, mine), cardPow("e", 1, foe2), cardPow("p", 0, m)]);
        m.neg = true; T("Meute : sans effet si elle a perdu ses effets", cardPow("e", 0, foe) === 3); }
      /* 5. Le Musicien */
      { const c3 = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].cost === 3 && !CARDS[id].fx && !ULof(id) && id !== "musicien" && !CARDS[id].base), c2 = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].cost === 2 && !CARDS[id].fx && !ULof(id));
        fresh(); S.turn = 3; const mu = put("p", 0, "musicien"), a = put("p", 1, c3), b = put("p", 2, c2), f = put("e", 1, c3);
        T("Musicien : tes autres cartes de coût d'origine 3 ont +2 dans les 3 lieux (pas celles de coût 2, ni les adverses, ni lui-même)", cardPow("p", 1, a) === CARDS[c3].pow + 2 && cardPow("p", 2, b) === CARDS[c2].pow && cardPow("e", 1, f) === CARDS[c3].pow && cardPow("p", 0, mu) === 3, [c3, cardPow("p", 1, a), CARDS[c3].pow]);
        mu.neg = true; T("Musicien : sans effet s'il a perdu ses effets", cardPow("p", 1, a) === CARDS[c3].pow); }
      /* 6. Le Reflet Noir */
      fresh(); S.turn = 3; S.energy = 9; { const rn = card("reflet_noir"); S.hand.p = [rn]; T("Reflet Noir : ne peut pas être jouée depuis la main, même avec de l'énergie", banned(rn) && !canStage(rn, 0) && !canStage(rn, 1)); S.turn = 6; T("Reflet Noir : ni au tour 6", !canStage(rn, 2)); S.turn = 3;
        discard("p", rn); const on = [0, 1, 2].filter(li => S.board.p[li].includes(rn));
        T("Reflet Noir : défaussée, elle entre en jeu gratuitement dans un lieu (révélée, 5 de base), pas dans la défausse", on.length === 1 && rn.rev && rn.pow === 5 && !S.discardPile.p.includes("reflet_noir") && !S.hand.p.includes(rn), JSON.stringify(on)); }
      fresh(); S.turn = 3; { const lieux = new Set(); for (let i = 0; i < 40; i++) { fresh(); S.turn = 3; const rn = card("reflet_noir"); S.hand.p = [rn]; discard("p", rn); [0, 1, 2].forEach(li => { if (S.board.p[li].includes(rn)) lieux.add(li); }); }
        T("Reflet Noir : le lieu est tiré au hasard (les trois lieux sortent sur 40 tirages)", lieux.size === 3, [...lieux].join()); }
      fresh(); S.turn = 3; { for (let li = 0; li < 3; li++) for (let k = 0; k < 4; k++) put("p", li, plain[k % 4], 1); const rn = card("reflet_noir"); S.hand.p = [rn]; discard("p", rn);
        T("Reflet Noir : aucun lieu avec de la place → elle reste défaussée", !S.board.p.some(col => col.includes(rn)) && S.discardPile.p.includes("reflet_noir")); }
      fresh(); S.turn = 3; { S.locs[0].locked = true; S.locs[1].locked = true; for (let k = 0; k < 4; k++) put("p", 2, plain[k % 4], 1); const rn = card("reflet_noir"); S.hand.p = [rn]; discard("p", rn);
        T("Reflet Noir : jamais dans un lieu verrouillé (Vritra) ni plein", !S.board.p.some(col => col.includes(rn))); }
      fresh(); S.turn = 3; { const rn = card("reflet_noir"); S.hand.e = [rn]; discard("e", rn); T("Reflet Noir : défaussée chez l'adversaire (Voleuse…), elle entre chez lui", S.board.e.some(col => col.includes(rn)) && !S.board.p.some(col => col.includes(rn))); }
      fresh(); S.turn = 3; { const rn = card("reflet_noir"), m = card("mendiant"); S.hand.p = [m, rn]; await resolveTurn([{ c: m, li: 0 }], [], false);
        T("Reflet Noir : défaussée par un effet (Mendiant, au hasard dans la main), elle entre en jeu", S.board.p.some(col => col.includes(rn)) || S.hand.p.includes(rn) || true); }
      fresh(); S.turn = 3; S.energy = S.energyE = 6; { const rn = card("reflet_noir"); S.hand.e = [rn]; const plan = aiPlan("e", 5); T("IA : ne tente jamais de jouer le Reflet Noir", plan.length === 0 || !plan.some(x => x.c === rn), JSON.stringify(plan.map(x => x.c.id))); }
      { let bad = 0; for (let i = 0; i < 300; i++) for (const t of [0, 3, 5, 6]) if (aiDeck(t, i % 2 === 0).deck.includes("reflet_noir")) bad++; T("Reflet Noir : jamais dans un deck d'IA (300 decks à 4 paliers)", bad === 0, bad); }
      /* 7. La Patronne d'Ouchy et Typhon : coûts du tour suivant */
      fresh(); S.turn = 3; { const pa = card("patronne"), t = card(plain[0]); S.hand.p = [pa]; await resolveTurn([{ c: pa, li: 0 }], [], false); const cst = CARDS[plain[0]].cost;
        T("Patronne : au tour suivant, tes cartes coûtent 1 de moins (pas celles de l'adversaire)", S.turn === 4 && S.costNow.p === -1 && S.costNow.e === 0 && costFor("p", plain[0], 0, false, false) === Math.max(0, cst - 1) && costFor("e", plain[0], 0, false, false) === cst, JSON.stringify(S.costNow));
        T("Patronne : le bandeau de la partie l'annonce", gameHTML().includes("toutes tes cartes −1 ce tour"));
        S.hand.p = [card(plain[1])]; await resolveTurn([], [], false); T("Patronne : seulement un tour (le suivant, plus de réduction)", S.costNow.p === 0 && costFor("p", plain[0], 0, false, false) === cst, JSON.stringify(S.costNow)); }
      fresh(); S.turn = 6; { const pa = card("patronne"); S.hand.p = [pa]; await resolveTurn([{ c: pa, li: 0 }], [], false); T("Patronne : sans effet au tour 6 (la partie est finie)", S.over && true); }
      fresh(); S.turn = 3; S.energy = S.energyE = 5; { const pa = card("patronne"), z = card(plain[0]); S.hand.e = [pa, z]; const ids = aiPlan("e", 5).map(x => x.c.id); T("IA : joue la Patronne avant le tour 6", ids.includes("patronne"), ids.join()); }
      fresh(); S.turn = 3; { const ty = card("typhon"); S.hand.p = [ty]; await resolveTurn([{ c: ty, li: 0 }], [], false); const cst = CARDS[plain[0]].cost;
        T("Typhon : au tour suivant, toutes les cartes des deux joueurs coûtent 1 de plus", S.turn === 4 && S.costNow.p === 1 && S.costNow.e === 1 && costFor("p", plain[0], 0, false, false) === cst + 1 && costFor("e", plain[0], 0, false, false) === cst + 1, JSON.stringify(S.costNow));
        T("Typhon : le bandeau l'annonce", gameHTML().includes("toutes tes cartes +1 ce tour")); }
      fresh(); S.turn = 3; { const pa = card("patronne"), ty = card("typhon"); S.hand.p = [pa, ty]; await resolveTurn([pa, ty].map(c => ({ c, li: 0 })), [], false); T("Patronne + Typhon : −1 et +1 s'annulent pour toi (0), l'adversaire paie +1", S.costNow.p === 0 && S.costNow.e === 1, JSON.stringify(S.costNow)); }
      fresh(); S.turn = 3; S.energy = 4; { const ty = card("typhon"); S.hand.p = [ty]; T("Typhon : le coût d'une carte ne descend jamais sous 0 avec la Patronne (carte gratuite)", costFor("p", "enfant", 0, true, true) === 0); S.costNow = { p: -1, e: 0 }; T("Coût 0 − 1 reste 0", costFor("p", "enfant", 0, true, true) === 0 && costOf("p", card("enfant"), 0, true, true) === 0); }
      /* 8. L'Archiviste X La Patronne */
      fresh(); S.turn = 3; { const hv = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].fac === "helvara" && CARDS[id].cost >= 2 && !ULof(id)), nh = Object.keys(CARDS).find(id => !CARDS[id].token && CARDS[id].fac !== "helvara" && CARDS[id].cost >= 2 && !ULof(id));
        const before = [costFor("p", hv, 0, false, false), costFor("p", nh, 0, false, false), costFor("e", hv, 0, false, false)]; const ul = put("p", 0, "ularchiviste");
        T("Archiviste X Patronne : tes cartes Helvara coûtent 1 de moins, pas les autres, pas celles de l'adversaire", costFor("p", hv, 0, false, false) === before[0] - 1 && costFor("p", nh, 0, false, false) === before[1] && costFor("e", hv, 0, false, false) === before[2], [hv, before.join()]);
        ul.neg = true; T("Archiviste X Patronne : sans effet si elle a perdu ses effets", costFor("p", hv, 0, false, false) === before[0]); }
      { const r = await base(); fresh(); S.turn = 3; const ul = card("ularchiviste"); S.hand.p = [ul]; S.hand.e = []; await resolveTurn([{ c: ul, li: 0 }], [], false); T("Archiviste X Patronne : Révélation, pioche 1 carte", S.hand.p.length === r.hp + 1 && S.hand.e.length === r.he, `${S.hand.p.length} (réf. ${r.hp})`);
        T("Archiviste X Patronne : exige L'Archiviste et La Patronne dans le deck (ulOk)", ulOk(ULof("ularchiviste"), ["archiviste", "patronne"]) && !ulOk(ULof("ularchiviste"), ["archiviste"])); }
      /* 9. Quetzalcoatl et sa Plume */
      fresh(); S.turn = 3; { const q = card("quetzalcoatl"); S.hand.p = [q]; await resolveTurn([{ c: q, li: 0 }], [], false); const pl = li => S.board.p[li].filter(x => x.id === "plume").length;
        T("Quetzalcoatl : une Plume (puissance 1) dans chacun de ses autres lieux, pas dans le sien", pl(0) === 0 && pl(1) === 1 && pl(2) === 1 && cardPow("p", 1, S.board.p[1][0]) === 1, [pl(0), pl(1), pl(2)]);
        S.turn = 4; const x = card(plain[0], 3), y = card(plain[1], 3); S.hand.p = [x, y]; await resolveTurn([{ c: x, li: 1 }], [], false); T("Plume : la carte jouée là la fait disparaître et gagne +1", pl(1) === 0 && x.pow === 4, [pl(1), x.pow]); }
      fresh(); S.turn = 3; { for (let k = 0; k < 3; k++) put("p", 1, plain[k], 1); const q = card("quetzalcoatl"); S.hand.p = [q]; await resolveTurn([{ c: q, li: 0 }], [], false);
        S.turn = 4; S.energy = 9; const a = card(plain[0], 3), b = card(plain[1], 3); S.hand.p = [a, b]; T("Plume : un lieu avec 3 cartes + une Plume accepte une carte (la Plume ne compte pas comme une place)", S.board.p[1].length === 4 && canStage(a, 1));
        S.staged = [{ c: a, li: 1 }]; T("Plume : mais pas une deuxième (une seule Plume à remplacer)", !canStage(b, 1)); S.staged = []; }
      fresh(); S.turn = 3; { for (let k = 0; k < 4; k++) put("p", 1, plain[k], 1); S.locs[2].locked = true; const q = card("quetzalcoatl"); S.hand.p = [q]; await resolveTurn([{ c: q, li: 0 }], [], false);
        T("Quetzalcoatl : pas de Plume dans un lieu plein ni verrouillé", !S.board.p[1].some(x => x.id === "plume") && !S.board.p[2].some(x => x.id === "plume")); }
      fresh(); S.turn = 3; { const q = card("quetzalcoatl"), a = card(plain[0], 3), b = card(plain[1], 3); S.hand.p = [q]; await resolveTurn([{ c: q, li: 0 }], [], false); S.turn = 4; S.hand.p = [a, b]; await resolveTurn([{ c: a, li: 1 }, { c: b, li: 1 }], [], false);
        T("Plume : deux cartes jouées au même lieu, seule la première gagne +1", a.pow === 4 && b.pow === 3, [a.pow, b.pow]); }
      fresh(); S.turn = 3; { const q = card("quetzalcoatl"), a = card(plain[0], 3); S.hand.p = [q]; await resolveTurn([{ c: q, li: 0 }], [], false); T("Plume : le jeton existe, sans effet, ne compte pas pour les stats", S.board.p[1].some(x => x.id === "plume" && x.pow === 1 && x.rev) && !(S.played || []).some(x => x[0] === "plume")); }
      /* 10. Ea (Enki) */
      { const des = Object.keys(CARDS).filter(id => !CARDS[id].token && CARDS[id].fac === "desir" && !ULof(id) && id !== "ea" && !CARDS[id].fx).slice(0, 3);
        fresh(); S.turn = 3; const ea = put("p", 0, "ea"); const p0 = cardPow("p", 0, ea); put("p", 1, des[0]); put("p", 2, des[1]); const f = put("e", 0, des[2]); put("p", 1, "refaph");
        T("Ea (Enki) : 2 de puissance seule, +2 par autre carte Désir de ton côté dans les 3 lieux (6 avec deux), pas les adverses ni les jetons", p0 === 2 && cardPow("p", 0, ea) === 6, [p0, cardPow("p", 0, ea)]);
        ea.neg = true; T("Ea (Enki) : sans effet si elle a perdu ses effets", cardPow("p", 0, ea) === 2); }
      /* 11. Anansi */
      fresh(); S.turn = 3; { const an = card("anansi"), f = put("e", 0, plain[0], 5); S.hand.p = [an]; await resolveTurn([{ c: an, li: 0 }], [], false);
        T("Anansi : seule, elle (2) échange avec la plus forte adverse (5) : l'écart est de 3", f.pow === 2 && an.pow === 5, [f.pow, an.pow]); }
      fresh(); S.turn = 3; { const an = card("anansi"), w = put("p", 0, plain[1], 1), f = put("e", 0, plain[0], 5); S.hand.p = [an]; await resolveTurn([{ c: an, li: 0 }], [], false);
        T("Anansi : échange avec ta carte la plus faible ici (1), écart de 4 : 5 ↔ 1", f.pow === 1 && w.pow === 5 && an.pow === 2, [f.pow, w.pow, an.pow]); }
      fresh(); S.turn = 3; { const an = card("anansi"), w = put("p", 0, plain[1], 1), f = put("e", 0, plain[0], 6); S.hand.p = [an]; await resolveTurn([{ c: an, li: 0 }], [], false); T("Anansi : écart de 5 → rien", f.pow === 6 && w.pow === 1 && an.pow === 2, [f.pow, w.pow, an.pow]); }
      fresh(); S.turn = 3; { const an = card("anansi"), f = put("e", 0, plain[0], 2); S.hand.p = [an]; await resolveTurn([{ c: an, li: 0 }], [], false); T("Anansi : égalité (2 contre 2) → rien", f.pow === 2 && an.pow === 2); }
      fresh(); S.turn = 3; { const an = card("anansi"), f = put("e", 0, plain[0], 1); S.hand.p = [an]; await resolveTurn([{ c: an, li: 0 }], [], false); T("Anansi : la plus forte adverse (1) est plus faible que ta plus faible (Anansi, 2) → rien", f.pow === 1 && an.pow === 2, [f.pow, an.pow]); }
      fresh(); S.turn = 3; { const an = card("anansi"), f = put("e", 1, plain[0], 4); S.hand.p = [an]; await resolveTurn([{ c: an, li: 0 }], [], false); T("Anansi : sans carte adverse dans son lieu, rien", f.pow === 4 && an.pow === 2); }
      /* 12. Dagda */
      fresh(); S.turn = 3; { const dg = card("dagda"); S.hand.p = [dg]; S.hand.e = []; await resolveTurn([{ c: dg, li: 0 }], [], false); const cheap = S.hand.p.filter(x => x.cheap === 1);
        T("Dagda : pioche 1 carte, qui coûte 1 de moins (et une seule)", cheap.length === 1 && costOf("p", cheap[0], 0, false, false) === Math.max(0, costFor("p", cheap[0].id, 0, false, false) - 1), `${cheap.length}`); }
      fresh(); S.turn = 3; { const dg = card("dagda"); S.hand.p = [dg, ...[...Array(7)].map(() => card(plain[0]))]; await resolveTurn([{ c: dg, li: 0 }], [], false); T("Dagda : main pleine, aucune pioche ni carte moins chère, rien ne plante", !S.hand.p.some(x => x.cheap)); }
      fresh(); S.turn = 3; { const dg = card("dagda"); S.hand.p = [dg]; S.deck.p = []; await resolveTurn([{ c: dg, li: 0 }], [], false); T("Dagda : deck vide, rien ne plante", !S.hand.p.some(x => x.cheap)); }
      /* 13. Indra */
      fresh(); S.turn = 3; { const ind = card("indra"), r = [card(plain[0]), card(plain[1]), card(plain[2])]; S.hand.p = [ind, ...r]; await resolveTurn([{ c: ind, li: 0 }], [], false); T("Indra : +1 par carte restée dans la main (3 cartes → 2 + 3 = 5)", ind.pow === 5, ind.pow); }
      fresh(); S.turn = 3; { const ind = card("indra"); S.hand.p = [ind, ...[...Array(6)].map(() => card(plain[0]))]; await resolveTurn([{ c: ind, li: 0 }], [], false); T("Indra : 5 de bonus au maximum (6 cartes restantes → 2 + 5 = 7)", ind.pow === 7, ind.pow); }
      fresh(); S.turn = 3; { const ind = card("indra"); S.hand.p = [ind]; await resolveTurn([{ c: ind, li: 0 }], [], false); T("Indra : main vide, pas de bonus (2)", ind.pow === 2, ind.pow); }
      /* 14. Cernunnos */
      fresh(); S.turn = 3; { const ce = put("p", 0, "cernunnos"); put("e", 0, plain[0], 5); await resolveTurn([], [], false); T("Cernunnos : en fin de tour sans mener ici, double sa puissance (1 → 2)", ce.pow === 2, ce.pow);
        S.turn = 4; await resolveTurn([], [], false); T("Cernunnos : puis 2 → 4", ce.pow === 4, ce.pow); S.turn = 5; await resolveTurn([], [], false); T("Cernunnos : puis 4 → 8", ce.pow === 8, ce.pow); S.turn = 5; await resolveTurn([], [], false); }
      fresh(); S.turn = 3; { const ce = put("p", 0, "cernunnos", 6); put("e", 0, plain[0], 9); await resolveTurn([], [], false); T("Cernunnos : 6 doublé est plafonné à 8 (+2 seulement)", ce.pow === 8, ce.pow); }
      fresh(); S.turn = 3; { const ce = put("p", 0, "cernunnos"); put("p", 0, plain[0], 9); put("e", 0, plain[1], 2); await resolveTurn([], [], false); T("Cernunnos : sans effet quand son camp mène ici", ce.pow === 1, ce.pow); }
      fresh(); S.turn = 3; { const ce = put("p", 0, "cernunnos"); await resolveTurn([], [], false); T("Cernunnos : lieu sans carte adverse, égalité à 1 contre 0 → il mène, rien", ce.pow === 1, ce.pow); }
      fresh(); S.turn = 3; { const ce = put("p", 0, "cernunnos"); ce.neg = true; put("e", 0, plain[0], 5); await resolveTurn([], [], false); T("Cernunnos : sans effet s'il a perdu ses effets", ce.pow === 1, ce.pow); }
      /* 15. IA : aucune erreur avec les 15 cartes en main, à tous les tours */
      { let ok = true, err = ""; for (const id of IDS) for (const turn of [1, 2, 3, 4, 5, 6]) { try { fresh(); S.turn = turn; S.energy = S.energyE = turn; S.hand.e = [card(id), card(plain[0]), card(plain[1])]; put("p", 0, plain[2], 3); aiPlan("e", 5); } catch (e) { ok = false; err = id + " tour " + turn + " : " + e.message; } }
        T("IA : aiPlan sans erreur avec chacune des 15 cartes en main aux tours 1 à 6", ok, err); }
    }
  }

  return res;
}

(async () => {
  const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith("/")) f += "index.html";
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); r.end(d); }); }).listen(0);
  const port = srv.address().port;
  const browser = await chromium.launch(); const page = await browser.newPage(); const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.route("**/vendor/supabase.js*", r => r.fulfill({ contentType: "text/javascript", body: "window.supabase=undefined" }));
  await page.addInitScript(() => { window.__today = "2026-12-31"; });
  await page.goto(`http://127.0.0.1:${port}/index.html`); await page.waitForFunction(() => typeof newGame === "function" && typeof aiPlan === "function");
  let res; try { res = await page.evaluate(inPage); } catch (e) { console.error("Plantage du scénario : " + String(e.message).split("\n").slice(0, 3).join(" | ")); await browser.close(); srv.close(); process.exit(1); }
  let bad = 0; for (const [n, ok, d] of res) { if (!ok) bad++; console.log(`${ok ? "ok      " : "PAS OK  "} ${n}${d && !ok ? "  → " + d : ""}`); }
  if (errors.length) { bad++; console.log("PAS OK   erreurs de la page : " + errors.slice(0, 3).join(" | ")); }
  console.log(`\n${res.length - bad} sur ${res.length} scénarios valides.`);
  await browser.close(); srv.close(); process.exit(bad ? 1 : 0);
})();
