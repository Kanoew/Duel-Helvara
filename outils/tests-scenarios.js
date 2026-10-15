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

  /* 1. Nike + Aphrodite : 2 cartes à 1, Nike, Aphrodite au tour 6 → Nike finit à 9 */
  fresh(); S.turn = 6; { const a = card(plain[0], 1), b = card(plain[1], 1), n = card("nike"), ap = card("aphrodite"); S.hand.p = [a, b, n, ap];
    await resolveTurn([a, b, n, ap].map(c => ({ c, li: 0 })), [], false); const nk = find("p", "nike"); T("Nike + Aphrodite : Nike finit à 9", nk && nk.pow === 9, nk && nk.pow); }
  /* 1b. Aphrodite posée AVANT Nike : elle ne compte pas parmi les cartes jouées avant Nike */
  fresh(); S.turn = 5; { const a = card(plain[0], 1), ap = card("aphrodite"), n = card("nike"); S.hand.p = [a, ap, n];
    await resolveTurn([a, ap, n].map(c => ({ c, li: 0 })), [], false); const nk = find("p", "nike"); T("Aphrodite posée avant Nike : Nike +2 seulement", nk && nk.pow === 3, nk && nk.pow); }
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

  /* ===== Ananké (Fatalité : rien ne peut l'atteindre ; fin de partie : puissance adverse ici +1) ===== */
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
  /* A2. Qetesh, Calypso, Oya, Lilith, Poséidon, Nyx, Mohini : aucun effet sur elle, l'effet passe à la carte suivante */
  const ananke6 = async (eff, check, nom, o = {}) => { fresh(); S.turn = 4; const a = put("e", 0, "ananke", 3), x = put("e", 0, plain[0], 2); const c = card(eff); S.hand.p = [c];
    await resolveTurn([{ c, li: 0 }], [], false); const ok = check(a, x);
    T(`Ananké : ${nom} ne l'atteint pas, l'effet passe à la carte suivante`, ok && S.board.e[0].includes(a) && !a.charm && !a.captive && !a.neg && a.pow === 3 && a.id === "ananke", `${eff} : ${JSON.stringify({ ok, ch: a.charm, cap: a.captive, neg: a.neg, pow: a.pow })}`); };
  await ananke6("qetesh", (a, x) => x.charm === "p", "Qetesh (charme)");
  await ananke6("calypso", (a, x) => !!x.captive, "Calypso (captive)");
  await ananke6("oya", (a, x) => x.neg && x.pow === 1, "Oya (transformée)");
  await ananke6("lilith", (a, x) => S.board.p[0].includes(x), "Lilith (volée)");
  await ananke6("poseidon", (a, x) => S.hand.e.some(h => h.id === x.id) && !S.board.e[0].includes(x), "Poséidon (renvoyée en main)");
  await ananke6("nyx", (a, x) => !S.board.e[0].includes(x), "Nyx (détruite)");
  await ananke6("mohini", (a, x) => x.neg, "Mohini (effets retirés)");
  await ananke6("circe", (a, x) => x.id === "pourceau", "Circé (transformée)");
  await ananke6("esquille", (a, x) => !S.board.e[0].includes(x), "L'Esquille (détruite)");
  fresh(); S.turn = 4; { const a = put("e", 0, "ananke", 3), x = put("e", 1, plain[0], 2); const c = card("set"); S.hand.p = [c]; await resolveTurn([{ c, li: 0 }], [], false);
    T("Ananké : Set (déplacement) ne la bouge pas", S.board.e[0].includes(a), ""); }
  /* A3. Nemesis adverse au même lieu → la règle « le moins de puissance gagne » s'applique, Ananké perd le lieu */
  fresh(); S.turn = 6; { put("e", 0, "nemesis"); const a = card("ananke"); S.hand.p = [a]; await resolveTurn([{ c: a, li: 0 }], [], false);
    T("Ananké : avec une Nemesis adverse au même lieu, elle perd le lieu", leader(0) === "e" && nemInv(0), `${total("p", 0)} contre ${total("e", 0)}`); }
  /* A4. Apsu adverse posée après elle → Ananké reste à 1 ; Apsu posée avant elle ne change rien ; Apsu, Veillée des Chaînes pareil */
  for (const id of ["apsu", "apsu_n"]) { fresh(); S.turn = 6; { const a = card("ananke"), ap = card(id); S.hand.p = [a]; S.hand.e = [ap]; await resolveTurn([{ c: a, li: 0 }], [{ c: ap, li: 0 }], false);
      T(`Ananké : ${id} adverse posée après elle → elle reste à 1`, a.neg && cardPow("p", 0, a) === 1, `${cardPow("p", 0, a)}, neg ${a.neg}`); }
    fresh(); S.turn = 6; { put("e", 0, id); const a = card("ananke"); S.hand.p = [a]; await resolveTurn([{ c: a, li: 0 }], [], false);
      T(`Ananké : ${id} déjà posée avant elle → elle garde sa Fatalité`, !a.neg && cardPow("p", 0, a) === total("e", 0) + 1, `${cardPow("p", 0, a)} contre ${total("e", 0)}`); } }
  /* A5. Deux Ananké face à face : pas de boucle infinie */
  fresh(); S.turn = 6; { const a = put("p", 0, "ananke"), b = put("e", 0, "ananke"); S.final = true; const x = cardPow("p", 0, a), y = cardPow("e", 0, b); T("Deux Ananké face à face : calcul fini", Number.isFinite(x) && Number.isFinite(y), `${x} / ${y}`); S.final = false; }
  /* A6. IA : jamais sur un lieu avec une Nemesis adverse ; au tour 6 sur le lieu où elle perd */
  fresh(); S.turn = 6; S.energy = S.energyE = 6; { put("p", 0, "nemesis"); put("p", 1, plain[0], 5); put("e", 1, plain[1], 8); put("e", 2, plain[2], 3);
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
  /* D4. Loviatar et Hadès sans carte à ressusciter → +3 chacune */
  for (const [id, base0] of [["loviatar", 3], ["hades", 4]]) { fresh(); S.turn = 4; { const c = card(id); S.hand.p = [c]; await resolveTurn([{ c, li: 0 }], [], false);
      T(`${id === "hades" ? "Hadès" : "Loviatar"} sans carte à ressusciter : +3 de puissance`, c.pow === base0 + 3, c.pow); } }
  fresh(); S.turn = 4; { S.graveyard.p = [hi]; const c = card("hades"); S.hand.p = [c]; await resolveTurn([{ c, li: 0 }], [], false);
    T("Hadès avec une carte détruite : elle revient (pas de +3)", c.pow === 4 && S.board.p[0].some(x => x.risen && x.id === hi), c.pow); }
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
    T("Dates des ultra-légendaires de faction : Ananké 1er décembre, Hédoné 15 janvier", CARDS.ananke.rel === "2026-12-01" && CARDS.hedone.rel === "2027-01-15" && CARDS.hedone.soon === "2027-01-10");
    fresh(); S.turn = 3; S.energy = S.energyE = 5; { const src = card("source"), t = card("tatoueur"), v = card("voleuse"); S.hand.e = [src, t, v];
      const plan = aiPlan("e", 5); T("IA : La Source est jouée quand la main compte des cartes Helvara à Révélation", plan.some(x => x.c === src), JSON.stringify(plan.map(x => [x.c.id, x.li]))); }
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
