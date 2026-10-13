#!/usr/bin/env node
/* Duel d'Helvara : outil d'équilibrage (hors du jeu publié, jamais chargé par le site).

   Fait jouer l'IA contre l'IA avec le VRAI moteur du jeu (celui d'index.html, lancé dans Chromium sans réseau,
   rien n'est recopié), sur des decks variés, puis écrit un rapport : rapport-cartes.md.
   Il ne modifie aucune carte et ne propose aucun chiffre.

   Usage (depuis la racine du dépôt) :
     node outils/equilibrage.js                       # 2000 parties, rapport-cartes.md
     node outils/equilibrage.js --parties 5000        # plus de parties = chiffres plus fiables
     node outils/equilibrage.js --palier 3            # niveau de l'IA (0 à 6, 5 par défaut)
     node outils/equilibrage.js --date 2026-11-15     # cartes sorties à cette date (par défaut 2026-12-31 : tout ce qui est daté en 2026)
     node outils/equilibrage.js --cartes aphrodite,set,styx --parties 1000   # mode ciblé : chaque deck contient 2 de ces cartes ; écrit rapport-cible.md (ne touche pas à rapport-cartes.md)
     node outils/equilibrage.js --inclure cronos,izanami,loki   # ne rend jouables que ces cartes cachées (elles restent « pas sorties » dans le rapport)
     node outils/equilibrage.js --inclure-cachees     # ajoute les cartes sans date (2099) : elles n'ont pas d'effet, chiffres peu parlants
     node outils/equilibrage.js --graine 42           # même graine = mêmes parties (reproductible)
     node outils/equilibrage.js --ouvriers 4          # nombre de Chromium en parallèle
     node outils/equilibrage.js --sortie autre.md     # fichier de sortie
     node outils/equilibrage.js --brut brut.json      # garde aussi les chiffres bruts
   Nécessite Playwright et Chromium (déjà installés dans l'environnement de travail, voir CLAUDE.md). */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http"), os = require("os");
const ROOT = path.resolve(__dirname, "..");

/* ---------------------------------------------------------------- options */
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf("--" + name); if (i < 0) return def; const v = args[i + 1]; return v === undefined || v.startsWith("--") ? true : v; };
const OPT = {
  parties: Math.max(10, parseInt(opt("parties", 2000), 10) || 2000),
  palier: Math.min(6, Math.max(0, parseInt(opt("palier", 5), 10) || 5)),
  date: String(opt("date", "2026-12-31")),
  cachees: !!opt("inclure-cachees", false),
  inclure: String(opt("inclure", "")).split(",").map(x => x.trim()).filter(Boolean),   /* ids de cartes cachées à jouer quand même (ex. cronos,izanami,loki) */
  graine: parseInt(opt("graine", 20261012), 10) || 20261012,
  ouvriers: Math.max(1, parseInt(opt("ouvriers", Math.min(4, Math.max(1, os.cpus().length - 1))), 10) || 1),
  cartes: String(opt("cartes", "")).split(",").map(x => x.trim()).filter(Boolean),     /* mode ciblé : ces cartes sont placées exprès dans les decks des deux camps */
  sortie: path.resolve(process.cwd(), String(opt("sortie", path.join(ROOT, String(opt("cartes", "")) ? "rapport-cible.md" : "rapport-cartes.md")))),
  brut: opt("brut", null),
  aujourdhui: String(opt("aujourdhui", new Date().toISOString().slice(0, 10))),
};
if (OPT.cachees) OPT.date = "2100-01-01";

function loadPlaywright() {
  for (const p of ["playwright", "/opt/node-tools/node_modules/playwright"]) { try { return require(p); } catch (e) { /* suivant */ } }
  console.error("Playwright introuvable (voir CLAUDE.md, section Tests)."); process.exit(1);
}
const { chromium } = loadPlaywright();

/* ------------------------------------------------ serveur local du dépôt */
function serve() {
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".mp3": "audio/mpeg" };
  const srv = http.createServer((q, r) => {
    let f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith(path.sep) || f === ROOT) f = path.join(f, "index.html");
    if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); r.end(d); });
  });
  return new Promise(res => srv.listen(0, "127.0.0.1", () => res({ srv, port: srv.address().port })));
}

/* ------------------------------------------- code exécuté DANS la page du jeu */
/* Prépare la page : graine, bruitages et affichage coupés, générateur de decks, simulateur de parties. */
function inPageSetup(o) {
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  Math.random = mul(o.seed);
  /* Sans affichage, ni son, ni sauvegarde : le moteur tourne seul. */
  const unstubbed = [];
  for (const f of ["render", "sfx", "endCine", "endMusic", "save", "lbPublish", "pushHist", "qProg", "qEnd", "music", "cardVfx", "fusionCine"]) {
    try { if (typeof window[f] === "function") window[f] = () => {}; else unstubbed.push(f); } catch (e) { unstubbed.push(f); }
  }
  window.factionCine = () => Promise.resolve();
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const all = Object.keys(CARDS).filter(id => !CARDS[id].token && REL(id));
  const nonU = all.filter(id => !ULof(id));
  const us = ULS.filter(u => REL(u.id) && CARDS[u.id] && u.req.every(r => [].concat(r).some(id => REL(id) && CARDS[id])));
  const clash = (deck, id) => deck.some(x => x !== id && charOf(x) === charOf(id) && !(["yarden", "yarden_d"].includes(x) && ["yarden", "yarden_d"].includes(id)));
  const costW = { 0: 1, 1: 1.2, 2: 1.2, 3: 1.1, 4: 1, 5: .6, 6: .45 };
  const okDeck = d => d.length === 12 && new Set(d).size === 12 && d.filter(x => ULof(x)).length <= 1 && d.every(x => !ULof(x) || ulOk(ULof(x), d)) && d.every(x => !clash(d, x));
  function fill(deck, fac, bias, size) {
    let guard = 0;
    while (deck.length < size && guard++ < 500) {
      const cand = nonU.filter(id => !deck.includes(id) && !clash(deck, id));
      if (!cand.length) break;
      const w = cand.map(id => (costW[CARDS[id].cost] ?? .5) * (1 + (CARDS[id].fac === fac ? bias : 0)));
      let x = Math.random() * w.reduce((a, b) => a + b, 0), k = 0; while (k < cand.length - 1 && x >= w[k]) { x -= w[k]; k++; }
      deck.push(cand[k]);
    }
    return deck;
  }
  /* mode ciblé : deux cartes de la liste, tirées au hasard, ouvrent chaque deck */
  const forcedPick = () => { const a = o.cartes.filter(id => CARDS[id] && REL(id)), out = []; while (out.length < Math.min(2, a.length)) { const x = pick(a); if (!out.includes(x) && !clash(out, x)) out.push(x); } return out; };
  function genDeck() {
    const fac = pick(Object.keys(FAC)), bias = pick([0, 0, 1.5, 3]), forced = o.cartes.length ? forcedPick() : [];
    for (let tries = 0; tries < 8; tries++) {
      let deck = [...forced];
      const u = us.length && Math.random() < .45 ? pick(us) : null;
      if (u) {
        for (const r of u.req) deck.push(pick([].concat(r).filter(id => REL(id) && CARDS[id])));
        if (u.fac) fill(deck, u.fac, 99, u.min - 1);
        deck = [...new Set(deck)];
        if (deck.some(id => ULof(id))) continue;
        fill(deck, fac, bias, 11); deck.push(u.id);
      } else fill(deck, fac, bias, 12);
      if (okDeck(deck)) return deck;
    }
    return fill([...forced], fac, bias, 12);
  }
  /* Une partie sur quatre : un deck fabriqué par le jeu lui-même pour son IA (palier choisi). */
  const realDeck = () => { try { const d = aiDeck(o.palier, true).deck; return okDeck(d) ? d : genDeck(); } catch (e) { return genDeck(); } };
  const ids = Object.keys(CARDS).filter(id => !CARDS[id].token);
  window.__SIM = async function (n, firstIndex) {
    const out = [];
    for (let g = 0; g < n; g++) {
      const rec = {};
      Math.random = mul(o.seed + (firstIndex + g) * 7919 + 13); RNG = Math.random; /* une graine par partie : mêmes parties quel que soit le nombre d'ouvriers */
      try {
        const dp = !o.cartes.length && Math.random() < .25 ? realDeck() : genDeck(), de = !o.cartes.length && Math.random() < .25 ? realDeck() : genDeck();
        rec.dp = dp; rec.de = de;
        P.owned = ids; P.deck = dp; P.w = Math.max(P.w, 1); P.chf = 0; P.lv = START[o.palier]; P.st = 0; P.streak = 0; P.best = P.lv; /* même état de départ à chaque partie */
        const keep = window.aiDeck; window.aiDeck = () => ({ deck: de, fac: "helvara" });
        try { newGame(); } finally { window.aiDeck = keep; }
        const pl = { p: [], e: [] }, bad = [];
        for (let t = 1; t <= 6 && !S.over; t++) {
          const pp = aiPlan("p", o.palier), pe = aiPlan("e", o.palier);
          for (const x of pp) pl.p.push([x.c.id, S.locs[x.li].id, t]);
          for (const x of pe) pl.e.push([x.c.id, S.locs[x.li].id, t]);
          await resolveTurn(pp, pe, false);
          for (const s of ["p", "e"]) for (let li = 0; li < 3; li++) for (const c of S.board[s][li]) if (c.rev && !Number.isFinite(cardPow(s, li, c))) bad.push(`${c.id}:NaN`);
        }
        rec.pl = pl.p; rec.el = pl.e; rec.locs = S.locs.map(l => l.id);
        if (!S.over) { rec.err = "partie non terminée après 6 tours"; }
        else {
          rec.res = S.over.res; rec.pw = S.over.pw; rec.ew = S.over.ew; rec.pt = S.over.pt; rec.et = S.over.et;
          rec.fin = { p: [], e: [] };
          for (const s of ["p", "e"]) for (let li = 0; li < 3; li++) for (const c of S.board[s][li]) if (c.rev && !CARDS[c.id].token) rec.fin[s].push([c.id, cardPow(s, li, c)]);
        }
        if (bad.length) rec.bad = bad.slice(0, 5);
      } catch (e) { rec.err = String(e && e.stack || e).split("\n").slice(0, 4).join(" | ").slice(0, 500); }
      rec.i = firstIndex + g;
      out.push(rec);
    }
    return out;
  };
  return { unstubbed, pool: all.length, decksU: us.length };
}

/* ---------------------------------------------------------------- lancement */
async function newWorker(browser, port, k) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|supabase/i.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.route("**/vendor/supabase.js*", r => r.fulfill({ contentType: "text/javascript", body: "window.supabase=undefined" }));
  await page.addInitScript(d => { window.__today = d; }, OPT.date);
  await page.goto(`http://127.0.0.1:${port}/index.html`); await page.waitForFunction(() => typeof newGame === "function" && typeof aiPlan === "function");
  page.setDefaultTimeout(180000);
  if (OPT.inclure.length) await page.evaluate(ids => { window.__relOrig = {}; for (const id of ids) if (CARDS[id]) { window.__relOrig[id] = CARDS[id].rel; CARDS[id].rel = "2026-10-01"; } }, OPT.inclure);
  const info = await page.evaluate(inPageSetup, { seed: OPT.graine, palier: OPT.palier, cartes: OPT.cartes });
  return { page, errors, info };
}

async function main() {
  const t0 = Date.now();
  const { srv, port } = await serve();
  const browser = await chromium.launch();
  /* données des cartes : une fois, depuis le vrai jeu */
  const dataW = await newWorker(browser, port, 99);
  const data = await dataW.page.evaluate(() => ({
    cards: Object.entries(CARDS).map(([id, c]) => ({ id, name: c.name, cost: c.cost, pow: c.pow, fac: c.fac, r: c.r, rel: (window.__relOrig && window.__relOrig[id]) || c.rel || null, soon: c.soon || null, ex: c.ex || null, base: c.base || null, token: !!c.token, fx: c.fx || "" })),
    uls: ULS.map(u => ({ id: u.id, req: u.req, fac: u.fac || null, min: u.min || null })),
    facs: Object.fromEntries(Object.entries(FAC).map(([k, v]) => [k, v.n])), build: typeof BUILD === "string" ? BUILD : "?",
  }));
  const poolInfo = dataW.info;
  await dataW.page.context().close();
  console.log(`Cartes en jeu à la date ${OPT.date} : ${poolInfo.pool} · fusions et ultras utilisables : ${poolInfo.decksU}`);
  if (poolInfo.unstubbed.length) console.log("Attention, non neutralisés : " + poolInfo.unstubbed.join(", "));

  const games = []; const pageErrors = []; let next = 0, done = 0, lastShown = 0; const BATCH = 20;
  const worker = async k => {
    let w = await newWorker(browser, port, k);
    while (true) {
      const i = next; if (i >= OPT.parties) break; const n = Math.min(BATCH, OPT.parties - i); next += n;
      try { const r = await w.page.evaluate(([n, i]) => window.__SIM(n, i), [n, i]); games.push(...r); }
      catch (e) { games.push({ i, err: "plantage du lot de " + n + " parties : " + String(e.message).split("\n")[0].slice(0, 300) }); try { await w.page.context().close(); } catch (_) {} w = await newWorker(browser, port, k + 1000 + i); }
      done += n; if (done === OPT.parties || done - lastShown >= Math.max(100, OPT.parties / 20)) { lastShown = done; process.stdout.write(`\r${done}/${OPT.parties} parties (${Math.round((Date.now() - t0) / 1000)} s)   `); }
    }
    pageErrors.push(...w.errors); await w.page.context().close();
  };
  await Promise.all(Array.from({ length: OPT.ouvriers }, (_, k) => worker(k)));
  process.stdout.write("\n");
  await browser.close(); srv.close();

  games.sort((a, b) => a.i - b.i);
  if (OPT.brut) fs.writeFileSync(path.resolve(process.cwd(), String(OPT.brut)), JSON.stringify({ opt: OPT, games }));
  const md = (OPT.cartes.length ? reportCible : report)(data, games, pageErrors, Math.round((Date.now() - t0) / 1000));
  fs.writeFileSync(OPT.sortie, md);
  console.log(`Rapport écrit : ${OPT.sortie} (${games.length} parties, ${Math.round((Date.now() - t0) / 1000)} s)`);
}

/* ---------------------------------------------------------------- statistiques */
const pct = (a, b, d = 1) => b ? (100 * a / b).toFixed(d) : "–";
const num = (x, d = 1) => Number.isFinite(x) ? x.toFixed(d) : "–";
const md = s => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

function aggregate(games) {
  const S = {}; const get = id => S[id] || (S[id] = { dk: 0, w: 0, l: 0, d: 0, pl: 0, plw: 0, pll: 0, pld: 0, alive: 0, powSum: 0, powMax: -99, turnSum: 0, locs: {} });
  let ok = 0, nul = 0, pWins = 0;
  for (const g of games) {
    if (!g.res) continue; ok++; if (g.res === "draw") nul++; if (g.res === "win") pWins++;
    for (const side of ["p", "e"]) {
      const deck = side === "p" ? g.dp : g.de, plays = side === "p" ? g.pl : g.el, fin = g.fin[side];
      const r = g.res === "draw" ? "d" : (g.res === "win") === (side === "p") ? "w" : "l";
      for (const id of deck) { const s = get(id); s.dk++; s[r]++; }
      const seen = new Set();
      for (const [id, loc, t] of plays) {
        if (seen.has(id)) continue; seen.add(id); const s = get(id); s.pl++; s["pl" + r]++; s.turnSum += t; s.locs[loc] = (s.locs[loc] || 0) + 1;
        const f = fin.find(x => x[0] === id); if (f) { s.alive++; s.powSum += f[1]; s.powMax = Math.max(s.powMax, f[1]); }
      }
    }
  }
  return { S, ok, nul, pWins };
}

/* ------------------------------------------------- familles d'effets */
const STOP = new Set("de du des la le les un une et à au aux en sur sa son ses qui que si ne pas ou d l n s se ce cette ces tes ta ton leur leurs y".split(" "));
const FAMILIES = [
  ["Détruit une carte adverse (la plus forte, la plus faible, selon un seuil…)", /détruit[^.]*(adverse|de l'adversaire|de chaque côté)/i],
  ["Détruit ses propres cartes ou toutes les cartes d'un lieu", /détruit (ton|tes|toutes)|des deux côtés[^.]*détruit|détruit toutes/i],
  ["Affaiblit des cartes adverses (−N)", /−\d+ (à|aux)[^.]*adverse|affaiblit|−\d+ à chaque carte adverse|inflige −/i],
  ["Retire ou neutralise les effets d'une carte adverse", /perdent? (ses|leurs) effets|sans effet|devien(t|nent) (une? )?(carte de puissance|Pourceau)|captive|poison|charmée/i],
  ["Vole, charme ou fait changer de côté une carte adverse", /passe de ton côté|charmée|séduit|Écho de la carte adverse|copie/i],
  ["Déplace ou renvoie des cartes", /déplace|disperse|vers un autre lieu|renvoie dans la main|Bifröst|emporte ta carte/i],
  ["Bonus de puissance à elle-même (Révélation conditionnelle ou fixe)", /^(Révélation : )?(\+\d+|si [^.]*\+\d|[^.]*gagne|prend la puissance|copie la puissance|tombe)/i],
  ["Bonus aux autres cartes alliées", /\+\d+ (à|aux) (tes|toutes tes) (autres )?cartes|tes autres cartes[^.]*\+\d|ont \+\d|\+\d de ton côté/i],
  ["Pioche, défausse ou fouille le deck", /pioche|défausse|prends? en main|ajoute[^.]*à ta main/i],
  ["Ressuscite", /ressuscite/i],
  ["Crée un jeton ou une copie", /laisse une?|jeton|crée de ton côté|lance Mjölnir/i],
  ["Énergie ou coût des cartes", /énergie|coûte \d de moins|coût/i],
  ["Protection contre la destruction, l'affaiblissement ou le ciblage", /ne (peut|peuvent) (pas )?(être )?(ni )?(détruit|affaibli|cibl)|ne descendent pas|ne peuvent pas dépasser/i],
  ["Règle du lieu ou de la partie (verrouille, arrête, égalités…)", /plus personne ne peut|effet du lieu s'arrête|ne peut pas jouer|condamne|gagnes? les égalités|le moins de puissance qui gagne/i],
];
const TARGETS = [
  ["La carte adverse la plus forte (ici ou ailleurs)", /carte adverse la plus forte|cartes adverses les plus fortes|la plus forte carte adverse/i],
  ["La carte adverse la plus faible", /carte adverse la plus faible|cartes adverses les plus faibles/i],
  ["Toutes les cartes adverses d'un lieu ou de tous les lieux", /toutes les cartes adverses|chaque carte adverse|les cartes adverses (ici|de|qui)/i],
  ["Une carte adverse au hasard, ou tirée selon un seuil de puissance ou de coût", /adverse[s]? au hasard|adverse[^.]*(\d+ ou (moins|plus)|de coût|de puissance)/i],
  ["Ta carte la plus faible ou ta carte la plus forte", /ta carte la plus (faible|forte)|ton autre carte la plus faible/i],
  ["Tes autres cartes ici ou dans tous les lieux", /tes autres cartes|toutes tes autres cartes|tes cartes ici|tes cartes (ne|Jugement)/i],
  ["La main ou le deck (pioche, défausse, prise en main)", /ta main|ton deck|main adverse|ton adversaire (défausse|ne peut)/i],
];
function normalizeFx(fx, names) {
  let t = fx.replace(/^(Révélation|Continu) : /, "").replace(/ Continu : /g, " ");
  for (const n of names) t = t.split(n).join("‹carte›");
  t = t.toLowerCase().replace(/\d+/g, "N").replace(/[.,:;()«»"“”!?]/g, " ").replace(/[’']/g, " ");
  return t.split(/\s+/).filter(w => w && !STOP.has(w));
}
function similar(a, b) { const A = new Set(a), B = new Set(b); let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i || 1); }
function effectGroups(cards) {
  const names = [...new Set(cards.map(c => c.name))].sort((a, b) => b.length - a.length);
  const items = cards.filter(c => c.fx && !/^Exige /.test(c.fx)).map(c => ({ c, tok: normalizeFx(c.fx, names), type: /^Continu/.test(c.fx) ? "Continu" : /^Révélation/.test(c.fx) ? "Révélation" : "Autre" }));
  const groups = [];
  for (const it of items) {
    if (it.tok.length < 3) continue;
    let g = groups.find(g => g.type === it.type && similar(g.tok, it.tok) >= .6);
    if (g) g.items.push(it); else groups.push({ type: it.type, tok: it.tok, items: [it] });
  }
  return groups.filter(g => g.items.length >= 2).sort((a, b) => b.items.length - a.items.length);
}

/* ---------------------------------------------------------------- rapport ciblé */
function reportCible(data, games, pageErrors, secs) {
  const A = aggregate(games), byId = Object.fromEntries(data.cards.map(c => [c.id, c]));
  const errs = games.filter(g => g.err), bads = games.filter(g => g.bad), played = games.filter(g => g.res);
  const L = [];
  L.push(`# Rapport ciblé · Duel d'Helvara\n`);
  L.push(`Généré le ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC par \`outils/equilibrage.js --cartes ${OPT.cartes.join(",")}\` (version du moteur ${data.build}). Il ne remplace pas \`rapport-cartes.md\`.\n`);
  L.push(`- **Parties simulées** : ${games.length} (${played.length} terminées), IA de palier ${OPT.palier} contre IA de palier ${OPT.palier}, graine ${OPT.graine}, ${secs} s.`);
  L.push(`- **Decks** : 12 cartes, mêmes règles que le jeu ; **chaque deck des deux camps contient 2 des cartes ciblées**, tirées au hasard, le reste est tiré comme d'habitude.`);
  L.push(`- **Moteur** : ${!errs.length && !bads.length && !pageErrors.length ? "aucune erreur, aucune puissance invalide, aucune erreur de console." : `**${errs.length} partie(s) en erreur, ${bads.length} avec puissance invalide, ${pageErrors.length} erreur(s) de console**.`}`);
  L.push(`- Sous 100 decks, la marge d'erreur dépasse ±10 points (⚠).\n`);
  L.push(`| Carte | id | Coût | Puiss. | Decks | Victoire (deck) | Pose | Victoire (posée) | Puiss. fin | Survie | Tour |\n|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|`);
  for (const id of OPT.cartes) {
    const c = byId[id], s = A.S[id]; if (!c || !s) { L.push(`| ${id} | \`${id}\` | | | 0 | | | | | | |`); continue; }
    L.push(`| ${md(c.name)} | \`${id}\` | ${c.cost} | ${c.pow} | ${s.dk}${s.dk < 100 ? " ⚠" : ""} | ${num(100 * s.w / s.dk)} % | ${pct(s.pl, s.dk, 0)} % | ${pct(s.plw, s.pl)} % | ${s.alive ? num(s.powSum / s.alive) : "–"} | ${pct(s.alive, s.pl, 0)} % | ${s.pl ? num(s.turnSum / s.pl) : "–"} |`);
  }
  L.push(`\nCamp qui révèle en premier : ${pct(A.pWins, A.ok)} % de victoires (nulles : ${pct(A.nul, A.ok)} %).\n`);
  return L.join("\n");
}

/* ---------------------------------------------------------------- rapport */
function report(data, games, pageErrors, secs) {
  const A = aggregate(games), cards = data.cards.filter(c => !c.token), byId = Object.fromEntries(data.cards.map(c => [c.id, c]));
  const today = OPT.aujourdhui, isRel = c => !c.rel || c.rel <= today, isHidden = c => c.rel === "2099-01-01";
  const dateOf = c => !c.rel ? "" : isHidden(c) ? "non fixée (2099)" : c.rel;
  const RN = { C: "Commune", R: "Rare", E: "Épique", L: "Légendaire", U: "Ultra-légendaire" }, RK = ["C", "R", "E", "L", "U"];
  const L = []; const out = s => L.push(s);
  const errs = games.filter(g => g.err), bads = games.filter(g => g.bad), played = games.filter(g => g.res);
  const avg = pct(A.S ? Object.values(A.S).reduce((a, s) => a + s.w, 0) : 0, Object.values(A.S).reduce((a, s) => a + s.dk, 0));

  out(`# Rapport des cartes · Duel d'Helvara`);
  out(`\nGénéré le ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC par \`outils/equilibrage.js\` (version du moteur ${data.build}). **Aucune carte n'a été modifiée et aucun chiffre n'est proposé** : ce document sert à décider.\n`);
  out(`- **Parties simulées** : ${games.length} (${played.length} terminées), IA de palier ${OPT.palier} contre IA de palier ${OPT.palier}, graine ${OPT.graine}, ${secs} s.`);
  out(`- **Cartes en jeu** : toutes celles dont la date de sortie est au plus le ${OPT.date}${OPT.cachees ? " (cartes cachées de 2099 incluses)" : OPT.inclure.length ? ` (cartes cachées de 2099 jouées : ${OPT.inclure.join(", ")} ; les autres cachées, sans effet, ne sont pas jouées)` : " (les cartes cachées de 2099, sans effet, ne sont pas jouées)"}.`);
  out(`- **Decks** : 12 cartes, mêmes règles que le jeu (une version par personnage, une seule ultra-légendaire, ses conditions remplies). Trois decks sur quatre sont tirés au hasard avec une faction dominante et une courbe de coûts raisonnable ; un sur quatre est fabriqué par le jeu pour son IA. Ce ne sont pas des decks de joueurs : les cartes les plus fortes ne sont pas surreprésentées.`);
  out(`- **Lieux** : 3 lieux tirés au hasard parmi ceux sortis à cette date, comme dans une vraie partie.`);
  out(`- **Camp qui révèle en premier** (le « joueur ») : ${pct(A.pWins, A.ok)} % de victoires (nulles : ${pct(A.nul, A.ok)} %). Un écart net avec 50 % signalerait un avantage lié à l'ordre de révélation.`);
  out(`- **Moyenne de victoires d'une carte présente dans un deck** : ${avg} % (nulles : ${pct(A.nul, A.ok)} % des parties).`);
  out(`- Lecture : ce sont des parties IA contre IA. Un humain joue les combinaisons, le serment et les lieux mieux (ou moins bien) que l'IA : les chiffres indiquent des tendances, pas une vérité. En dessous de 100 decks, la marge d'erreur dépasse ±10 points : à lire avec prudence (⚠).\n`);

  out(`## 1. Santé du moteur\n`);
  if (!errs.length && !bads.length && !pageErrors.length) out(`Aucune erreur : ${played.length} parties jouées de bout en bout, sans plantage, sans puissance invalide (NaN), sans erreur dans la console.\n`);
  else {
    out(`- Parties en erreur : **${errs.length}** sur ${games.length}`); out(`- Parties avec une puissance invalide (NaN) : **${bads.length}**`); out(`- Erreurs de la console : **${pageErrors.length}**\n`);
    const seen = new Map(); for (const g of errs) { const k = g.err.slice(0, 160); if (!seen.has(k)) seen.set(k, []); seen.get(k).push(g); }
    for (const [k, gs] of seen) { out(`**${gs.length} ×** \`${md(k)}\``); const g = gs.find(x => x.dp) || gs[0]; if (g.dp) out(`  - exemple (partie ${g.i}) : deck 1 = ${g.dp.join(", ")} ; deck 2 = ${g.de.join(", ")}`); }
    for (const g of bads.slice(0, 5)) out(`- partie ${g.i} : ${g.bad.join(", ")} (decks : ${g.dp.join(", ")} / ${g.de.join(", ")})`);
    for (const e of [...new Set(pageErrors)].slice(0, 8)) out(`- ${md(e)}`);
    out("");
  }

  /* répartitions */
  const table = (list, title) => {
    const costs = [...new Set(list.map(c => c.cost))].sort((a, b) => a - b);
    out(`### ${title} (${list.length} cartes)\n`);
    out(`| Rareté \\ Coût | ${costs.join(" | ")} | Total |`); out(`|---|${costs.map(() => "---:").join("|")}|---:|`);
    for (const r of RK) { const row = list.filter(c => c.r === r); out(`| ${RN[r]} | ${costs.map(k => row.filter(c => c.cost === k).length || "·").join(" | ")} | **${row.length}** |`); }
    out(`| **Total** | ${costs.map(k => `**${list.filter(c => c.cost === k).length}**`).join(" | ")} | **${list.length}** |\n`);
    out(`Par faction : ${Object.entries(data.facs).map(([k, n]) => `${n} ${list.filter(c => c.fac === k).length}`).join(" · ")}\n`);
  };
  out(`## 2. Répartition par rareté et par coût\n`);
  out(`Jetons exclus. « Sorties » = date de sortie au plus le ${today}.\n`);
  table(cards, "Toutes les cartes, cachées incluses"); table(cards.filter(isRel), `Cartes déjà sorties au ${today}`); table(cards.filter(c => !isRel(c)), `Cartes pas encore sorties (dont ${cards.filter(isHidden).length} sans date)`);
  const hi = cards.filter(c => c.cost >= 5);
  out(`Cartes de coût 5 ou plus : **${hi.length}** sur ${cards.length} (${pct(hi.length, cards.length, 0)} %). Ultra-légendaires : **${cards.filter(c => c.r === "U").length}**, légendaires : **${cards.filter(c => c.r === "L").length}**, communes : **${cards.filter(c => c.r === "C").length}**.\n`);

  /* stats par carte */
  out(`## 3. Statistiques par carte (simulation)\n`);
  out(`Colonnes : **decks** = nombre de decks (des deux camps) qui contenaient la carte ; **victoire (deck)** = parties gagnées quand la carte était dans le deck ; **pose** = part des parties où elle a été jouée quand elle était dans le deck ; **victoire (posée)** = parties gagnées quand elle a été jouée ; **écart** = victoire (deck) moins la moyenne (${avg} %), en points ; **puiss. fin** = puissance moyenne de la carte à la fin, quand elle est encore en jeu ; **survie** = part des parties où elle était encore en jeu à la fin ; **tour** = tour moyen de pose. ⚠ = moins de 100 decks.\n`);
  const rows = cards.filter(c => A.S[c.id]).map(c => { const s = A.S[c.id]; const wr = s.dk ? 100 * s.w / s.dk : NaN; return { c, s, wr, gap: wr - parseFloat(avg) }; });
  const line = ({ c, s, wr, gap }) => `| ${md(c.name)}${isRel(c) ? "" : " *(pas sortie)*"} | \`${c.id}\` | ${data.facs[c.fac]} | ${c.cost} | ${c.pow} | ${RN[c.r]} | ${s.dk}${s.dk < 100 ? " ⚠" : ""} | ${num(wr)} % | ${pct(s.pl, s.dk, 0)} % | ${pct(s.plw, s.pl)} % | ${gap >= 0 ? "+" : ""}${num(gap)} | ${s.alive ? num(s.powSum / s.alive) : "–"} | ${pct(s.alive, s.pl, 0)} % | ${s.pl ? num(s.turnSum / s.pl) : "–"} |`;
  const head = `| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |\n|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|`;
  const solid = rows.filter(r => r.s.dk >= 100).sort((a, b) => b.gap - a.gap);
  out(`### Les 15 cartes qui gagnent le plus (au moins 100 decks)\n`); out(head); solid.slice(0, 15).forEach(r => out(line(r)));
  out(`\n### Les 15 cartes qui gagnent le moins (au moins 100 decks)\n`); out(head); solid.slice(-15).reverse().forEach(r => out(line(r)));
  out(`\n### Les cartes jamais ou presque jamais jouées alors qu'elles sont dans le deck (pose sous 50 %, au moins 100 decks)\n`); out(head);
  rows.filter(r => r.s.dk >= 100 && r.s.pl / r.s.dk < .5).sort((a, b) => a.s.pl / a.s.dk - b.s.pl / b.s.dk).forEach(r => out(line(r)));
  out(`\n### Toutes les cartes simulées, par rareté puis par écart\n`);
  for (const r of RK) { const part = rows.filter(x => x.c.r === r).sort((a, b) => (b.gap || -99) - (a.gap || -99)); if (!part.length) continue; out(`\n#### ${RN[r]} (${part.length})\n`); out(head); part.forEach(x => out(line(x))); }
  out("");

  /* taux de victoire par coût et rareté */
  out(`### Victoire selon le coût et la rareté (cartes dans le deck, toutes cartes confondues)\n`);
  const grp = (keyf, keys, label, nameOf) => { out(`| ${label} | Cartes | Decks | Victoire (deck) | Pose |\n|---|---:|---:|---:|---:|`); for (const k of keys) { const rs = rows.filter(x => keyf(x.c) === k); const dk = rs.reduce((a, x) => a + x.s.dk, 0), w = rs.reduce((a, x) => a + x.s.w, 0), pl = rs.reduce((a, x) => a + x.s.pl, 0); if (dk) out(`| ${k === +k ? k : (nameOf || (x => RN[x]))(k)} | ${rs.length} | ${dk} | ${pct(w, dk)} % | ${pct(pl, dk, 0)} % |`); } out(""); };
  grp(c => c.cost, [...new Set(rows.map(x => x.c.cost))].sort((a, b) => a - b), "Coût"); grp(c => c.r, RK, "Rareté"); grp(c => c.fac, Object.keys(data.facs), "Faction", k => data.facs[k]);

  /* cartes pas encore sorties */
  const fut = cards.filter(c => !isRel(c)).sort((a, b) => (a.rel || "").localeCompare(b.rel || "") || a.cost - b.cost || a.name.localeCompare(b.name, "fr"));
  out(`## 4. Cartes pas encore sorties (${fut.length})\n`);
  out(`Date de sortie postérieure au ${today}, y compris les cartes sans date (2099). **Coût, puissance, rareté, faction et effet sont PROVISOIRES** (posés sans réflexion, à retravailler). Les cartes sans effet sont des places réservées.\n`);
  out(`| Carte | id | Faction | Coût | Puiss. | Rareté | Effet | Sortie prévue | Annonce |\n|---|---|---|---:|---:|---|---|---|---|`);
  for (const c of fut) out(`| ${md(c.name)} | \`${c.id}\` | ${data.facs[c.fac]} | ${c.cost} | ${c.pow} | ${RN[c.r]} | ${c.fx ? md(c.fx) : "*(pas d'effet)*"} | ${dateOf(c)} | ${c.soon && c.soon !== "2099-01-01" ? c.soon : ""} |`);
  const u = data.uls.filter(x => byId[x.id] && !isRel(byId[x.id]) && x.req.length);
  if (u.length) { out(`\n**Fusions pas encore sorties et leurs sources (provisoires)** :\n`); for (const x of u) out(`- ${byId[x.id].name} : ${x.req.map(r => [].concat(r).map(id => byId[id] ? byId[id].name : id).join(" ou ")).join(" + ")}`); }
  out("");

  /* effets qui se ressemblent */
  out(`## 5. Effets qui se ressemblent\n`);
  out(`Deux regroupements, faits sur le texte des effets (noms de cartes et nombres ignorés). Aucune recommandation : c'est un repérage. *(pas sortie)* signale une carte pas encore sortie.\n`);
  const eff = cards.filter(c => c.fx && !/^Exige /.test(c.fx));
  const tag = c => `${md(c.name)} (${c.cost}/${c.pow}, ${RN[c.r]}${isRel(c) ? "" : ", pas sortie"})`;
  out(`### 5.1 Familles d'effets\n`);
  out(`Une carte peut appartenir à plusieurs familles. Entre parenthèses : coût, puissance, rareté.\n`);
  for (const [label, re] of FAMILIES) {
    const list = eff.filter(c => re.test(c.fx)).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "fr"));
    if (list.length < 2) continue;
    out(`**${label}** : ${list.length} cartes (${list.filter(isRel).length} sorties, ${list.filter(c => !isRel(c)).length} pas encore)\n`);
    out(list.map(c => `- ${tag(c)} : ${md(c.fx.length > 150 ? c.fx.slice(0, 147) + "…" : c.fx)}`).join("\n")); out("");
  }
  out(`### 5.2 Formulations presque identiques\n`);
  out(`Cartes dont le texte est très proche (similarité des mots d'au moins 60 %, même type Révélation ou Continu).\n`);
  const grps = effectGroups(eff);
  if (!grps.length) out("Aucun groupe trouvé.\n");
  grps.forEach((g, i) => { out(`**Groupe ${i + 1}** (${g.items.length} cartes, ${g.type}) :`); out(g.items.map(it => `- ${tag(it.c)} : ${md(it.c.fx)}`).join("\n")); out(""); });
  out(`### 5.3 Même cible, verbes différents\n`);
  out(`Cartes qui visent la même chose (« la carte adverse la plus forte ici »…), quel que soit ce qu'elles lui font. C'est ce regroupement qui montre les effets de « destruction / vol / affaiblissement de la plus forte carte » en concurrence.\n`);
  for (const [label, re] of TARGETS) {
    const list = eff.filter(c => re.test(c.fx)).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "fr"));
    if (list.length < 2) continue;
    out(`**${label}** : ${list.length} cartes (${list.filter(isRel).length} sorties, ${list.filter(c => !isRel(c)).length} pas encore)\n`);
    out(list.map(c => `- ${tag(c)} : ${md(c.fx.length > 170 ? c.fx.slice(0, 167) + "…" : c.fx)}`).join("\n")); out("");
  }
  out(`---\n*Pour relancer : \`node outils/equilibrage.js --parties 5000\`. Voir l'en-tête du script pour les options.*\n`);
  return L.join("\n");
}

main().catch(e => { console.error(e); process.exit(1); });
