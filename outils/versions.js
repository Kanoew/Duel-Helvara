#!/usr/bin/env node
/* Duel d'Helvara : numéros de version des fichiers du jeu (contre le cache des navigateurs).

   index.html charge le jeu en plusieurs fichiers (jeu.css, js/*.js, cloud.js…). Chaque balise porte « ?v=<empreinte> » :
   l'empreinte change dès que le contenu du fichier change, donc un navigateur ne mélange jamais un ancien fichier
   avec un nouveau. À lancer APRÈS toute modification d'un fichier .js ou .css du jeu, avant le commit :
     node outils/versions.js              # met à jour les empreintes dans index.html
     node outils/versions.js --verifier   # ne modifie rien ; code 1 si une empreinte est périmée (pour les tests) */
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
if (check) { if (stale.length) { console.error("Empreintes périmées : " + stale.join(", ") + "\nLance : node outils/versions.js"); process.exit(1); } console.log(`Empreintes à jour (${n} fichiers).`); }
else { fs.writeFileSync(INDEX, html); console.log(stale.length ? `Mis à jour : ${stale.join(", ")}` : `Rien à changer (${n} fichiers à jour).`); }
