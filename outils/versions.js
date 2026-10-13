#!/usr/bin/env node
/* Duel d'Helvara : numéros de version des fichiers du jeu (contre le cache des navigateurs).

   index.html charge le jeu en plusieurs fichiers (jeu.css, js/*.js, cloud.js…). Chaque balise porte « ?v=<empreinte> » :
   l'empreinte change dès que le contenu du fichier change, donc un navigateur ne mélange jamais un ancien fichier
   avec un nouveau. À lancer APRÈS toute modification d'un fichier .js ou .css du jeu, avant le commit :
     node outils/versions.js              # met à jour les empreintes dans index.html
     node outils/versions.js --verifier   # ne modifie rien ; code 1 si une empreinte est périmée (pour les tests)

   Il met aussi à jour le bloc automatique de sw.js (service worker) : numéro de version du cache « core » (index.html + manifest),
   numéro du cache « media » (images, musiques, polices, icônes : change dès qu'un de ces fichiers change) et listes de préchargement.
   À chaque nouvelle version, sw.js change donc, les navigateurs installent le nouveau service worker, qui supprime les anciens caches. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, ".."), INDEX = path.join(ROOT, "index.html"), check = process.argv.includes("--verifier");
let html = fs.readFileSync(INDEX, "utf8"), stale = [], n = 0;
html = html.replace(/(<script[^>]*\ssrc=|<link[^>]*rel="stylesheet"[^>]*\shref=)"([^"?]+)(\?v=[0-9a-f]+)?"/g, (m, pre, file, old) => {
  if (/^(https?:)?\/\//.test(file)) return m;
  const p = path.join(ROOT, file); if (!fs.existsSync(p)) { console.error("Fichier introuvable : " + file); process.exitCode = 1; return m; }
  const v = "?v=" + crypto.createHash("sha1").update(fs.readFileSync(p)).digest("hex").slice(0, 8);
  n++; if (v !== old) stale.push(file);
  return `${pre}"${file}${v}"`;
});
/* ---- service worker : versions des caches et listes de préchargement ---- */
const sha = b => crypto.createHash("sha1").update(b).digest("hex");
const walk = (d, o = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== "readme") walk(p, o); } else o.push(p); } return o; };
const rel = p => path.relative(ROOT, p).split(path.sep).join("/");
const mediaFiles = ["images", "audio", "fonts", "icones"].flatMap(d => fs.existsSync(path.join(ROOT, d)) ? walk(path.join(ROOT, d)) : []).filter(p => !/LICENSE|\.css$/.test(p)).map(rel).sort();
const MEDIA_V = sha(mediaFiles.map(f => f + ":" + sha(fs.readFileSync(path.join(ROOT, f)))).join("\n")).slice(0, 10);
const CORE_V = sha(html + fs.readFileSync(path.join(ROOT, "manifest.json"))).slice(0, 10);
const tagged = [...html.matchAll(/(?:<script[^>]*\ssrc=|<link[^>]*rel="stylesheet"[^>]*\shref=)"([^"]+)"/g)].map(m => m[1]).filter(u => !/^(https?:)?\/\//.test(u));
const preCore = ["index.html", "manifest.json", ...tagged].filter((u, i, a) => a.indexOf(u) === i);
const preMedia = mediaFiles.filter(f => /^fonts\/.*\.woff2$/.test(f) || /^icones\//.test(f) || /^images\/(fond[a-z_]*|pack|reflet)\.webp$/.test(f) || /^images\/rangs\//.test(f) || f === "images/lieux/inconnu.webp");
const swBlock = "/* VERSIONS-AUTO-DEBUT */\nconst CORE_VERSION = " + JSON.stringify(CORE_V) + ";\nconst MEDIA_VERSION = " + JSON.stringify(MEDIA_V) + ";\nconst PRECACHE_CORE = " + JSON.stringify(preCore) + ";\nconst PRECACHE_MEDIA = " + JSON.stringify(preMedia) + ";\n/* VERSIONS-AUTO-FIN */";
const SW = path.join(ROOT, "sw.js"); let sw = fs.readFileSync(SW, "utf8");
const swNew = sw.replace(/\/\* VERSIONS-AUTO-DEBUT \*\/[\s\S]*?\/\* VERSIONS-AUTO-FIN \*\//, () => swBlock);
if (swNew !== sw) stale.push("sw.js");
if (check) { if (stale.length) { console.error("Empreintes périmées : " + stale.join(", ") + "\nLance : node outils/versions.js"); process.exit(1); } console.log(`Empreintes à jour (${n} fichiers, service worker ${CORE_V}/${MEDIA_V}).`); }
else { fs.writeFileSync(INDEX, html); fs.writeFileSync(SW, swNew); console.log(stale.length ? `Mis à jour : ${stale.join(", ")}` : `Rien à changer (${n} fichiers à jour).`); }
