#!/usr/bin/env node
/* Test de l'effet holo 2.5D (zoom, partie et ouverture de paquet) : node outils/tests-holo.js
   Utilise les vraies cartes holo de images/holo/ ; ?holo=test ajoute le bouton « Test holo ». Nécessite Playwright et Chromium (voir CLAUDE.md, « Tests »). */
"use strict";
const { chromium } = require("/opt/node-tools/node_modules/playwright"), http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, ".."), T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".mp3": "audio/mpeg" };
const FAKE = "window.supabase={createClient(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}}}}}}";
let ok = 0, ko = 0; const check = (nom, cond, d) => { if (cond) { ok++; console.log("ok      " + nom); } else { ko++; console.log("ÉCHEC   " + nom + (d !== undefined ? " : " + JSON.stringify(d) : "")); } };
const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith("/")) f += "index.html";
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": T[path.extname(f)] || "application/octet-stream" }); r.end(d); } }); });
srv.listen(0, async () => {
  const port = srv.address().port, b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  async function page(url, o = {}) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: o.reduced ? "reduce" : "no-preference" }), p = await ctx.newPage(); p.errs = [];
    p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.route("**/vendor/supabase.js*", r => r.fulfill({ contentType: "text/javascript", body: FAKE }));
    if (o.route) await o.route(p);
    await p.goto("http://localhost:" + port + url); await p.waitForTimeout(900); p.ctx = ctx; return p;
  }
  const zoom = (p, id) => p.evaluate(`P.owned=[...new Set([...P.owned,"nike","ananke","hedone","nike_v","source","yarden","amaterasu"])];tutoStep=-1;P.tuto=true;screen="deck";zoomId="${id}";render();`);
  const n = (p, s) => p.evaluate(s => document.querySelectorAll(s).length, s);
  try {
    /* zoom */
    let p = await page("/index.html?holo=test"); await zoom(p, "nike");
    check("zoom : l'image fixe d'une carte holo n'a pas les animations d'ultra-légendaire (elles s'affichaient puis disparaissaient)", await p.evaluate(() => { const f = document.querySelector("#holoslot>.full"); return !!f && !f.classList.contains("holo") && !f.classList.contains("tilt") && !f.classList.contains("amb") && f.classList.contains("holopre"); }));
    check("zoom : l'image fixe d'une carte holo n'affiche que l'illustration (pas de texte qui disparaît quand l'effet arrive)", await p.evaluate(() => getComputedStyle(document.querySelector("#holoslot>.full>.band")).display === "none"));
    check("zoom : la miniature sert de fond pendant le chargement de la grande image", await p.evaluate(() => /images\/mini\/nike\.webp/.test(document.querySelector("#holoslot>.full>.art").style.backgroundImage)));
    await p.waitForSelector(".hc-card.hc-ready"); await p.waitForTimeout(100);
    check("zoom : l'effet prend la place dès qu'il est prêt, sans fondu", await p.evaluate(() => document.getElementById("holoslot").classList.contains("holo-on") && getComputedStyle(document.querySelector(".hc-card")).transitionDuration === "0s"));
    check("collection : les cartes holo sorties sont préchargées", await p.evaluate(() => { screen = "deck"; render(); return Object.keys(HOLO_PRE).length > 0; }));
    check("zoom : l'effet est prêt et l'image fixe est cachée ensuite", await n(p, ".hc-card.hc-ready") === 1 && await p.evaluate(() => getComputedStyle(document.querySelector("#holoslot>.full")).display === "none"));
    await p.evaluate("render();render();"); await p.waitForTimeout(300);
    check("zoom : des redessins n'empilent pas d'instances", await n(p, ".hc-card") === 1);
    const bb = await p.locator(".hc-card").boundingBox();
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * .8, bb.y + bb.height * .3, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(200);
    check("zoom : glisser sur la carte ne ferme pas la vue", await p.evaluate(() => !!zoomId));
    check("zoom : la carte capte le glissement, l'encadré d'info reste défilable", await p.evaluate(() => getComputedStyle(document.querySelector(".hc-card")).touchAction === "none" && getComputedStyle(document.querySelector(".zoominfo")).touchAction !== "none" && getComputedStyle(document.querySelector(".zoomwrap")).overflowY === "auto"));
    await p.evaluate("zoomId=null;render();"); await p.waitForTimeout(300);
    check("zoom : destroy() à la fermeture (plus de carte, plus de jeton)", await n(p, ".hc-card") === 0 && await p.evaluate(() => zoomHolo === null));
    check("zoom : aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();
    /* panneau de test : zoom et faux paquet sans posséder les cartes, rien de sauvegardé */
    p = await page("/index.html?holo=test"); const avant = await p.evaluate(() => JSON.stringify(dataOf()));
    await p.locator(".ht-toggle").click(); await p.locator('[data-z="hedone"]').click(); await p.waitForTimeout(2000);
    check("panneau de test : zoom d'une carte pas encore sortie, effet prêt", await n(p, ".hc-card.hc-ready") === 1);
    await p.evaluate("zoomId=null;render();");
    await p.locator(".ht-toggle").click(); await p.locator("[data-pack]").click(); await p.waitForTimeout(500);
    check("panneau de test : le faux paquet s'ouvre, rien n'est modifié dans la sauvegarde", await n(p, "#tirage") === 1 && await p.evaluate(() => JSON.stringify(dataOf())) === avant);
    await p.evaluate("document.querySelector('.t-skip').click()"); await p.waitForTimeout(400); check("panneau de test : aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();
    p = await page("/index.html"); check("production : pas de panneau de test", await n(p, ".holotest") === 0); await p.ctx.close();
    /* carte sans holo et production */
    p = await page("/index.html?holo=test"); await zoom(p, "amaterasu"); await p.waitForTimeout(500);
    check("carte sans entrée : affichage inchangé", await n(p, "#holoslot") === 0 && await n(p, ".hc-card") === 0); await p.ctx.close();
    p = await page("/index.html"); const req = []; p.on("request", r => req.push(r.url())); await zoom(p, "amaterasu"); await p.waitForTimeout(500);
    check("production : une carte sans entrée ne télécharge rien de holo", await n(p, "#holoslot") === 0 && !req.some(u => /holo/.test(u))); 
    await zoom(p, "nike"); await p.waitForTimeout(2200);
    check("production : Nike (entrée de la table HOLO) affiche l'effet, sans ?holo=test", await n(p, ".hc-card.hc-ready") === 1 && p.errs.length === 0, p.errs);
    await zoom(p, "source"); await p.waitForTimeout(2200);
    check("production : La Source (Carla, foil électrique « volt ») affiche l'effet sans erreur", await n(p, ".hc-card.hc-ready") === 1 && await n(p, ".hc-volt") >= 1 && p.errs.length === 0, p.errs); await p.ctx.close();
    /* vitrine de l'accueil (vidéo de Jordan, 15 octobre : l'ancien reflet d'ultra-légendaire y restait) */
    p = await page("/index.html");
    await p.evaluate(`P.owned=[...new Set([...P.owned,"nike","yarden","amaterasu"])];P.fan=["nike","yarden","amaterasu"];tutoStep=-1;P.tuto=true;screen="home";render();`);
    await p.waitForSelector('.fcard[data-pos="0"] .holotile .hc-card.hc-ready', { timeout: 5000 }).catch(() => {});
    check("vitrine : Nike au centre affiche l'effet holo", await n(p, '.fcard[data-pos="0"] .holotile .hc-card.hc-ready') === 1);
    check("vitrine : plus l'ancien reflet d'ultra-légendaire sur Nike", await p.evaluate(() => [...document.querySelectorAll('.fcard[data-id="nike"] .full')].every(f => !f.classList.contains("holo") && f.classList.contains("holopre"))));
    check("vitrine : l'effet laisse passer le doigt (glisser pour tourner)", await p.evaluate(() => getComputedStyle(document.querySelector(".fcard .holotile .hc-card")).pointerEvents === "none"));
    await p.evaluate("render();render();"); await p.waitForTimeout(200);
    check("vitrine : des redessins n'empilent pas d'instances", await n(p, ".hc-card") === 1);
    const fb = await p.locator('.fcard[data-pos="0"]').boundingBox();
    await p.mouse.move(fb.x + fb.width * .7, fb.y + fb.height / 2); await p.mouse.down(); await p.mouse.move(fb.x - fb.width * .4, fb.y + fb.height / 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(700);
    check("vitrine : glisser fait toujours tourner, Nike passe sur le côté et y garde son effet (sans l'ancien reflet)", await p.evaluate(() => P.fan[0] !== "nike") && await p.evaluate(() => !document.querySelector('.fcard[data-id="nike"] .full').classList.contains("holo")) && await p.waitForFunction(() => document.querySelectorAll('.fcard[data-id="nike"] .holotile .hc-ready').length === 1, null, { timeout: 8000 }).then(() => true, () => false));
    await p.evaluate(`P.fan=["nike","yarden","amaterasu"];render();`); await p.waitForTimeout(1200);
    await p.evaluate(`screen="deck";render();`); await p.waitForTimeout(200);
    check("vitrine : l'effet est détruit en quittant l'accueil", await n(p, ".hc-card") === 0 && await p.evaluate(() => ![...HOLO_TILES.keys()].some(k => k[0] === "f")));
    check("vitrine : aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();
    /* chargement lent : l'image fixe garde sa taille pendant que l'effet se charge (elle rétrécissait à côté du conteneur de l'effet) */
    p = await page("/index.html?holo=test", { route: async q => q.route("**/images/holo/nike/manifest.json", async r => { await new Promise(k => setTimeout(k, 1500)); r.continue(); }) });
    await zoom(p, "nike"); await p.waitForTimeout(400);
    const lw = await p.evaluate(() => ({ st: document.querySelector("#holoslot>.full").getBoundingClientRect().width, slot: document.getElementById("holoslot").getBoundingClientRect().width, h: document.getElementById("holoslot").getBoundingClientRect().height }));
    await p.waitForTimeout(2500); const lw2 = await p.evaluate(() => ({ slot: document.getElementById("holoslot").getBoundingClientRect().width, h: document.getElementById("holoslot").getBoundingClientRect().height, on: document.getElementById("holoslot").classList.contains("holo-on") }));
    check("zoom : pendant le chargement l'image fixe garde sa taille, puis l'effet la remplace sans saut", Math.abs(lw.st - lw.slot) < 1 && lw2.on && Math.abs(lw2.h - lw.h) < 8, [lw, lw2]); await p.ctx.close();
    /* repli */
    p = await page("/index.html?holo=test", { route: async q => q.route("**/images/holo/nike/manifest.json", r => r.fulfill({ status: 404, body: "" })) }); await zoom(p, "nike"); await p.waitForTimeout(1500);
    check("manifest introuvable : l'image fixe reste, sans erreur", await n(p, ".hc-card") === 0 && await p.evaluate(() => getComputedStyle(document.querySelector("#holoslot>.full")).display !== "none") && p.errs.length === 0, p.errs); await p.ctx.close();
    p = await page("/index.html?holo=test", { route: async q => q.route("**/images/holo/nike/layer2.webp", r => r.fulfill({ status: 404, body: "" })) }); await zoom(p, "nike"); await p.waitForTimeout(1500);
    check("image de couche introuvable : repli sur l'image fixe, rien ne reste monté", await n(p, ".hc-card") === 0 && await n(p, ".holohost") === 0 && p.errs.length === 0, p.errs); await p.ctx.close();
    p = await page("/index.html?holo=test", { reduced: true }); await zoom(p, "hedone"); await p.waitForTimeout(1500);
    check("mouvement réduit : l'effet s'affiche (le module coupe lui-même le mouvement)", await n(p, ".hc-card.hc-ready") === 1 && p.errs.length === 0, p.errs); await p.ctx.close();
    /* ouverture de paquet */
    p = await page("/index.html?holo=test");
    await p.evaluate(`tutoStep=-1;P.tuto=true;screen="shop";render();ouvrirTirage({res:[{id:"nike",isNew:true,v:0},{id:"yarden",isNew:true,v:0},{id:"hedone",isNew:true,v:0}],name:"Test",img:"images/pack.webp",pid:"x",price:100});`);
    await p.waitForTimeout(600); await p.locator(".t-pack").click({ force: true }); await p.waitForTimeout(2500); await p.locator(".t-slot:nth-child(1)").click({ force: true }); await p.waitForTimeout(5200);
    check("paquet : l'effet tourne à plat, par-dessus la carte révélée (hors de la carte en 3D)", await n(p, ".t-holoover.on .hc-card.hc-ready") === 1 && await n(p, ".t-bfront .hc-card") === 0);
    check("paquet : la carte holo se retourne sur son image à plat (sans le texte de l'image fixe)", await n(p, ".t-bfront .holo-poster") === 1 && await n(p, ".t-bfront .band") === 0);
    await p.locator(".t-skip").click({ force: true }).catch(() => {}); await p.waitForTimeout(800);
    check("paquet : « Passer » détruit l'effet", await n(p, ".hc-card") === 0);
    check("paquet : aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();

    /* grand format en partie (appui long sur une carte de la main ou du plateau) : même effet que la Collection */
    p = await page("/index.html?date=2027-02-05"); /* bac à sable : toutes les cartes, profil jetable */
    await p.evaluate(`tutoStep=-1;P.tuto=true;P.deck=["ananke",...P.deck.filter(x=>x!=="ananke")].slice(0,12);newGame(P.deck);screen="play";render();`);
    await p.waitForTimeout(400);
    const uid = await p.evaluate(() => { const h = S.hand.p, d = S.deck.p, k = d.find(x => x.id === "ananke"); if (k) { d.splice(d.indexOf(k), 1); h.push(k); } const c = h.find(x => x.id === "ananke"); if (!c) return "absente"; gz = "c" + c.uid; render(); return c.id; });
    check("partie : Ananké est bien dans la main pour le test", uid === "ananke", uid);
    await p.waitForSelector(".hc-card.hc-ready", { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(150);
    check("partie : une carte holo en grand reçoit l'effet (" + uid + ")", await n(p, "#holoslot .hc-card.hc-ready") === 1);
    check("partie : l'effet est mis dans le conteneur holo, l'image fixe est cachée", await p.evaluate(() => document.getElementById("holoslot").classList.contains("holo-on")));
    await p.evaluate("render();render();"); await p.waitForTimeout(300);
    check("partie : des redessins n'empilent pas d'instances", await n(p, "#holoslot .hc-card") <= 1);
    await p.evaluate("gz=null;render();"); await p.waitForTimeout(300);
    check("partie : fermer le grand format détruit l'effet", await n(p, "#holoslot .hc-card") === 0 && await p.evaluate(() => zoomHolo === null));
    await p.evaluate(`(()=>{const h=S.hand.p,c=h.find(x=>x.id!=="ananke");gz="c"+c.uid;render();})()`); await p.waitForTimeout(300);
    check("partie : une carte sans holo garde son image fixe (aucun effet monté)", await n(p, "#holoslot .hc-card") === 0 && await n(p, "#holoslot") === 0);
    check("partie : aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();

    /* petites cartes : main, plateau et grille de la Collection (idée de Jordan, 22 octobre : l'effet partout où la carte apparaît) */
    p = await page("/index.html?date=2027-02-05");
    await p.evaluate(`tutoStep=-1;P.tuto=true;screen="deck";render();`); await p.waitForFunction(() => document.querySelectorAll(".holotile .hc-ready").length === 4, null, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(100);
    check("collection : les 4 ultra-légendaires de faction sorties ont l'effet dans la grille", await n(p, ".holotile") === 4 && await n(p, ".holotile .hc-ready") === 4, [await n(p, ".holotile"), await n(p, ".holotile .hc-ready")]);
    check("collection : le nom, le coût et la puissance restent visibles sur la carte holo de la grille", await p.evaluate(() => { const f = document.querySelector(".holotile").closest(".full"); return getComputedStyle(f.querySelector(".band")).display !== "none" && getComputedStyle(f.querySelector(".cost")).display !== "none"; }));
    check("collection : l'ancien reflet violet n'est plus posé sur une carte holo", await p.evaluate(() => !document.querySelector(".holotile").closest(".full").classList.contains("holo")));
    await p.evaluate(`P.deck=["ananke",...P.deck.filter(x=>x!=="ananke")].slice(0,12);newGame();screen="play";
      const h=S.hand.p,d=S.deck.p,k=d.find(x=>x.id==="ananke");if(k){d.splice(d.indexOf(k),1);h.push(k)}
      const m=mk("hedone");m.rev=true;S.board.p[0].push(m);const e=mk("nike");e.rev=true;S.board.e[1].push(e);
      const f=mk("yarden");f.rev=true;S.board.p[1].push(f);render();`);
    await p.waitForSelector(".hand .holotile .hc-ready", { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(400);
    check("partie : la carte holo de la main a l'effet", await n(p, ".hand .hc .holotile .hc-ready") === 1);
    check("partie : les cartes holo du plateau (les tiennes et celles de l'adversaire) ont l'effet", await n(p, ".side .mini .holotile .hc-ready") === 2);
    check("partie : une carte sans holo n'a aucun emplacement d'effet", await p.evaluate(() => [...document.querySelectorAll(".mini,.hc")].filter(x => !/Ananké|Hédoné|Nike/.test(x.getAttribute("aria-label"))).every(x => !x.querySelector(".holotile"))));
    check("partie : l'effet laisse passer le doigt (appui sur la carte = ouvrir, défilement de la main)", await p.evaluate(() => { const t = document.querySelector(".hand .holotile"); return getComputedStyle(t).pointerEvents === "none" && getComputedStyle(t.querySelector(".hc-card")).touchAction === "auto"; }));
    check("partie : une carte holo garde un cadre doré, la fusion garde son reflet violet", await p.evaluate(() => document.querySelector(".hc.holof") !== null && !document.querySelector(".hc.holof").classList.contains("holo")));
    await p.evaluate("for(let i=0;i<10;i++)render();"); await p.waitForTimeout(500);
    check("partie : 10 redessins n'empilent pas d'instances (3 au total)", await n(p, ".hc-card") === 3 && await p.evaluate(() => HOLO_TILES.size === 3), [await n(p, ".hc-card")]);
    await p.evaluate("S.board.e[1].length=0;render();"); await p.waitForTimeout(300);
    check("partie : une carte qui quitte le plateau détruit son effet", await n(p, ".hc-card") === 2 && await p.evaluate(() => HOLO_TILES.size === 2));
    await p.evaluate("screen=\"home\";render();"); await p.waitForTimeout(300);
    check("partie : quitter l'écran détruit tous les effets des petites cartes", await n(p, ".hc-card") <= 1 && await p.evaluate(() => HOLO_TILES.size === 0));
    check("petites cartes : aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();

    /* vitrine de l'accueil : les cartes holo sur les côtés gardent leur effet (vidéo de Jordan, 22 octobre : il disparaissait quand la carte n'était plus au centre) */
    p = await page("/index.html?date=2027-04-11");
    await p.evaluate(`tutoStep=-1;P.tuto=true;P.fan=["nike_v","cronos","ananke"];screen="home";render();`);
    await p.waitForFunction(() => document.querySelectorAll(".fcard .holotile .hc-ready").length === 2, null, { timeout: 8000 }).catch(() => {});
    check("vitrine : Nike V au centre a l'effet, Ananké sur le côté aussi", await n(p, '.fcard[data-pos="0"] .holotile .hc-ready') === 1 && await n(p, ".fcard .holotile .hc-ready") === 2, [await n(p, '.fcard[data-pos="0"] .holotile .hc-ready'), await n(p, ".fcard .holotile .hc-ready")]);
    await p.evaluate("fanRotate(1);"); await p.waitForFunction(() => document.querySelectorAll(".fcard .holotile .hc-ready").length === 2, null, { timeout: 8000 }).catch(() => {});
    check("vitrine : Cronos au centre (pas de holo), les deux cartes holo des côtés ont l'effet", await n(p, '.fcard[data-pos="0"] .holotile') === 0 && await n(p, ".fcard .holotile .hc-ready") === 2, [await n(p, '.fcard[data-pos="0"] .holotile'), await n(p, ".fcard .holotile .hc-ready")]);
    await p.evaluate("for(let i=0;i<6;i++)render();"); await p.waitForTimeout(500);
    check("vitrine : des redessins n'empilent pas d'instances", await n(p, ".hc-card") === 2);
    check("vitrine : la vitrine laisse passer le doigt (appui sur une carte de côté = la mettre en avant)", await p.evaluate(() => getComputedStyle(document.querySelector(".fcard .holotile")).pointerEvents === "none"));
    await p.evaluate(`screen="deck";render();`); await p.waitForTimeout(300);
    check("vitrine : quitter l'accueil détruit les effets de la vitrine", await n(p, ".fcard") === 0 && await p.evaluate(() => ![...HOLO_TILES.keys()].some(k => k[0] === "f")));
    check("vitrine : aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();

    /* fin du glissement sans redessin (vidéos de Jordan, 22 octobre : l'effet « arrivait en sautant » parce que tout était recréé) */
    p = await page("/index.html?date=2027-04-11");
    await p.evaluate(`tutoStep=-1;P.tuto=true;P.fan=["nike_v","ereshkigal_n","ananke"];screen="home";render();`);
    await p.waitForFunction(() => document.querySelectorAll(".fcard .holotile .hc-ready").length === 2, null, { timeout: 8000 }).catch(() => {});
    await p.evaluate(`window.__nodes=[...document.querySelectorAll(".fcard")];window.__hosts=[...document.querySelectorAll(".fcard .holohost")];window.__rn=0;const r0=render;render=function(){window.__rn++;return r0.apply(this,arguments)};fanSlide(1);`);
    await p.waitForTimeout(900);
    check("vitrine : à la fin du glissement, aucun redessin de l'écran", await p.evaluate(() => window.__rn === 0), await p.evaluate(() => window.__rn));
    check("vitrine : les cartes sont les mêmes éléments de la page après le glissement", await p.evaluate(() => [...document.querySelectorAll(".fcard")].every((c, i) => c === window.__nodes[i])));
    check("vitrine : l'effet holo continue sans repartir de zéro (mêmes instances)", await p.evaluate(() => { const h = [...document.querySelectorAll(".fcard .holohost")]; return h.length === 2 && h.every(x => window.__hosts.includes(x)); }));
    check("vitrine : l'ordre est enregistré comme avant (la carte de droite passe au centre)", await p.evaluate(() => P.fan.join() === "ereshkigal_n,ananke,nike_v" && document.querySelector('.fcard[data-pos="0"]').dataset.id === "ereshkigal_n"));
    const geo = () => p.evaluate(() => Object.fromEntries([...document.querySelectorAll(".fcard")].map(c => { const r = c.getBoundingClientRect(); return [c.dataset.id, [r.left, r.top, r.width, r.height].map(v => Math.round(v * 10) / 10).join()]; })));
    const g1 = await geo(); await p.evaluate("render();"); await p.waitForTimeout(300); const g2 = await geo();
    check("vitrine : un redessin complet donne exactement les mêmes positions (pas de saut)", JSON.stringify(Object.entries(g1).sort()) === JSON.stringify(Object.entries(g2).sort()), [g1, g2]);
    check("vitrine : la carte au centre s'agrandit, les autres se mettent en avant (étiquettes)", await p.evaluate(() => document.querySelector('.fcard[data-pos="0"]').getAttribute("aria-label").startsWith("Agrandir") && document.querySelector('.fcard[data-pos="1"]').getAttribute("aria-label").startsWith("Mettre en avant")));
    check("vitrine : (glissement) aucune erreur", p.errs.length === 0, p.errs); await p.ctx.close();
  } catch (e) { ko++; console.log("ÉCHEC   exception : " + e.message); }
  await b.close(); srv.close(); console.log(`\n${ok} sur ${ok + ko} vérifications valides.`); process.exit(ko ? 1 : 0);
});
