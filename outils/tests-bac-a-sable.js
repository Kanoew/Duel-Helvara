#!/usr/bin/env node
/* Test du bac à sable (?date=AAAA-MM-JJ) : node outils/tests-bac-a-sable.js
   Vérifie surtout qu'il ne touche jamais au vrai profil (stockage local) ni au compte. Nécessite Playwright et Chromium. */
"use strict";
const { chromium } = require("/opt/node-tools/node_modules/playwright"), http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, ".."), T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".mp3": "audio/mpeg" };
const calls = [];
const FAKE = "window.__sb=[];const spy=n=>(...a)=>{window.__sb.push(n);return {select(){return this},eq(){return this},single(){return Promise.resolve({data:null,error:null})},then(r){r({data:null,error:null})}}};window.supabase={createClient(){return {auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},signInAnonymously:async()=>({data:{session:null},error:null})},from:spy('from'),rpc:spy('rpc'),channel:spy('channel'),removeChannel:spy('rm')}}}";
let ok = 0, ko = 0; const check = (nom, cond, d) => { if (cond) { ok++; console.log("ok      " + nom); } else { ko++; console.log("ÉCHEC   " + nom + (d !== undefined ? " : " + JSON.stringify(d) : "")); } };
const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith("/")) f += "index.html";
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": T[path.extname(f)] || "application/octet-stream" }); r.end(d); } }); });
srv.listen(0, async () => {
  const port = srv.address().port, b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }), ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const open = async (url) => { const p = await ctx.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.route("**/vendor/supabase.js*", r => r.fulfill({ contentType: "text/javascript", body: FAKE })); await p.goto("http://localhost:" + port + url); await p.waitForTimeout(900); return p; };
  const store = p => p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])));
  try {
    /* un vrai profil existe déjà */
    let p = await open("/index.html"); await p.evaluate(`P.chf=777;P.name="Vrai joueur";save();`); await p.waitForTimeout(800);
    check("sans paramètre : pas de bac à sable", await p.evaluate(() => !window.__sandbox && !document.querySelector(".sandbar")));
    const avant = await store(p); await p.close();
    for (const bad of ["?date=abc", "?date=2025-01-01", "?date=2027-13-45", "?date=2027-02-05x"]) { p = await open("/index.html" + bad); check("date refusée : " + bad, await p.evaluate(() => !window.__sandbox)); await p.close(); }
    p = await open("/index.html?date=2027-02-05");
    const st = await p.evaluate(() => ({ sb: !!window.__sandbox, bar: !!document.querySelector(".sandbar"), today: today(), claude: window.claude, name: P.name, chf: P.chf, src: P.owned.includes("source") && avail().includes("source"), hed: avail().includes("hedone"), ana: avail().includes("ananke"), deck: P.deck.length }));
    check("date simulée, bandeau, profil neuf avec toutes les cartes", st.sb && st.bar && st.today === "2027-02-05" && st.claude === null && st.name === "Bac à sable" && st.chf >= 99999 && st.src && st.hed && st.ana && st.deck === 12, st);
    check("le vrai profil n'est pas lu (pas de nom ni de CHF du vrai joueur)", st.name !== "Vrai joueur" && st.chf !== 777);
    /* activité : sauvegardes, achats, parties, écrans */
    await p.evaluate(`P.chf+=5;save();P.name="X";save();flushNow();`);
    await p.evaluate(async () => { newGame(); quiet = true; for (let t = 1; t <= 6; t++) { S.turn = t; if (S.over) break; const mine = aiPlan("p", 5), theirs = aiPlan("e", 5); await resolveTurn(mine, theirs, false); } });
    for (const sc of ["home", "deck", "shop", "board", "profile", "rules", "duel", "blitz", "hist"]) { await p.evaluate(s => { screen = s; render(); }, sc); await p.waitForTimeout(150); }
    await p.evaluate(`sheet="settings";render();`);
    const reglages = await p.evaluate(() => document.body.innerText);
    check("réglages : rien sur le compte, aucun bouton de suppression ni d'export", /rien n'est sauvegardé/.test(reglages) && !/Supprimer mon compte|Exporter mes données/.test(reglages));
    check("le stockage local est exactement le même qu'avant (le vrai profil n'a pas bougé)", (await store(p)) === avant);
    check("aucun appel au compte (base de données, fonctions, salons)", (await p.evaluate(() => window.__sb)).length === 0, await p.evaluate(() => window.__sb));
    check("aucune erreur pendant la partie et les écrans", p.errs.length === 0, p.errs);
    await p.evaluate(`sheet=null;screen="deck";searchQ="La Source";render();`); await p.waitForTimeout(400);
    check("collection : La Source apparaît (1er février simulé)", await p.evaluate(() => /La Source/.test(document.getElementById("collgrid") ? document.getElementById("collgrid").innerText : document.body.innerText)));
    await p.close();
    /* avant la sortie : la carte reste cachée ; le vrai profil toujours intact */
    p = await open("/index.html?date=2027-01-20"); check("20 janvier 2027 : La Source pas encore sortie, Hédoné oui", await p.evaluate(() => !avail().includes("source") && avail().includes("hedone")));
    check("le stockage local est toujours identique", (await store(p)) === avant); await p.close();
    p = await open("/index.html"); check("retour au jeu normal : le vrai profil est intact (777 CHF, « Vrai joueur »)", await p.evaluate(() => P.name === "Vrai joueur" && P.chf >= 777 && !avail().includes("source"))); await p.close();
  } catch (e) { ko++; console.log("ÉCHEC   exception : " + e.message); }
  await b.close(); srv.close(); console.log(`\n${ok} sur ${ok + ko} vérifications valides.`); process.exit(ko ? 1 : 0);
});
