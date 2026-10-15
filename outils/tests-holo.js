#!/usr/bin/env node
/* Test de l'effet holo 2.5D (zoom et ouverture de paquet) : node outils/tests-holo.js
   Utilise les vraies cartes holo de images/holo/ ; ?holo=test ajoute Carla sur la carte Yarden Weiss. Nécessite Playwright et Chromium (voir CLAUDE.md, « Tests »). */
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
  const zoom = (p, id) => p.evaluate(`P.owned=[...new Set([...P.owned,"nike","ananke","hedone","nike_v","yarden","amaterasu"])];tutoStep=-1;P.tuto=true;screen="deck";zoomId="${id}";render();`);
  const n = (p, s) => p.evaluate(s => document.querySelectorAll(s).length, s);
  try {
    /* zoom */
    let p = await page("/index.html?holo=test"); await zoom(p, "nike"); await p.waitForTimeout(2200);
    check("zoom : l'effet est prêt et l'image fixe est cachée", await n(p, ".hc-card.hc-ready") === 1 && await p.evaluate(() => getComputedStyle(document.querySelector("#holoslot>.full")).display === "none"));
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
    await zoom(p, "yarden"); await p.waitForTimeout(500);
    check("production : l'effet de Carla n'apparaît qu'en mode test (Yarden reste normale)", await n(p, "#holoslot") === 0); await p.ctx.close();
    p = await page("/index.html?holo=test"); await zoom(p, "yarden"); await p.waitForTimeout(2200);
    check("mode test : l'effet de Carla (foil électrique « volt ») s'affiche sans erreur", await n(p, ".hc-card.hc-ready") === 1 && await n(p, ".hc-volt") >= 1 && p.errs.length === 0, p.errs); await p.ctx.close();
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
  } catch (e) { ko++; console.log("ÉCHEC   exception : " + e.message); }
  await b.close(); srv.close(); console.log(`\n${ok} sur ${ok + ko} vérifications valides.`); process.exit(ko ? 1 : 0);
});
