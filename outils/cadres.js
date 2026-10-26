/* Cadres de fête : mesure la fenêtre de chaque image de images/cadres/ et écrit images/cadres/frames.json (utilisé par le jeu), puis vérifie.
   Méthode : sur la bande centrale (20 % à 80 % de la hauteur pour les rails verticaux, de la largeur pour les rails horizontaux), un rail est une ligne
   dont plus de 80 % des pixels sont opaques (alpha > 20) ; la fenêtre est limitée par le bord intérieur du rail le plus proche du centre de chaque côté.
   Quand un cadre est remplacé : déposer le nouveau fichier (même nom) dans images/cadres/, lancer `node outils/cadres.js`, puis `node outils/versions.js`.
   Les originaux de Jordan sont dans images/cadres/originaux/ (jamais modifiés). Usage : node outils/cadres.js */
const { chromium } = require("/opt/node-tools/node_modules/playwright"); const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "images", "cadres");
/* mesures de référence fournies par Jordan (fichier 1792 × 2400) : x0, x1, y0, y1 ; tolérance ±3 px, ramenée à la taille réelle du fichier */
const REF = { paques: [298, 1494, 296, 2073], noel: [333, 1459, 327, 2053], halloween: [274, 1517, 298, 2128], nouvelan: [343, 1448, 405, 1994], saintvalentin: [294, 1496, 306, 2092] };
const PROV = { paques: "final selon Jordan : marche du rail dans la fenêtre", nouvelan: "final selon Jordan : rayons de feux d'artifice dans la fenêtre" };
(async () => {
  const files = fs.readdirSync(DIR).filter(f => /\.(webp|png)$/.test(f)); let bad = 0; const out = {};
  const srv = http.createServer((q, r) => { fs.readFile(path.join(ROOT, decodeURIComponent(q.url.split("?")[0])), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": q.url.includes(".webp") ? "image/webp" : q.url.includes(".png") ? "image/png" : "text/html" }); r.end(d); }); }).listen(0);
  const b = await chromium.launch(), p = await b.newPage(); await p.route("**/vendor/supabase.js*", r => r.fulfill({ contentType: "text/javascript", body: "window.supabase=undefined" }));
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`); await p.evaluate(() => { document.body.innerHTML = "<canvas id=c></canvas>"; });
  for (const f of files) {
    const key = f.replace(/\.(webp|png)$/, "");
    const r = await p.evaluate(async url => { const im = new Image(); await new Promise((ok, ko) => { im.onload = ok; im.onerror = ko; im.src = url; }); const c = document.getElementById("c"), W = c.width = im.naturalWidth, H = c.height = im.naturalHeight, x = c.getContext("2d"); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, W, H).data, op = (xx, yy) => d[(yy * W + xx) * 4 + 3] > 20;
      let anyAlpha = false; for (let i = 3; i < d.length; i += 4) if (d[i] < 255) { anyAlpha = true; break; }
      const colF = new Array(W).fill(0), rowF = new Array(H).fill(0), y0b = Math.floor(.2 * H), y1b = Math.floor(.8 * H), x0b = Math.floor(.2 * W), x1b = Math.floor(.8 * W);
      for (let xx = 0; xx < W; xx++) { let n = 0; for (let yy = y0b; yy < y1b; yy++) if (op(xx, yy)) n++; colF[xx] = n / (y1b - y0b); }
      for (let yy = 0; yy < H; yy++) { let n = 0; for (let xx = x0b; xx < x1b; xx++) if (op(xx, yy)) n++; rowF[yy] = n / (x1b - x0b); }
      let L = -1, R = -1, T = -1, B = -1; for (let xx = 0; xx < W; xx++) if (colF[xx] > .8) { if (xx < W / 2) L = xx; else if (R < 0) R = xx; } for (let yy = 0; yy < H; yy++) if (rowF[yy] > .8) { if (yy < H / 2) T = yy; else if (B < 0) B = yy; }
      const x0 = L + 1, x1 = R - 1, y0 = T + 1, y1 = B - 1; let inside = 0; for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) if (op(xx, yy)) inside++;
      return { W, H, anyAlpha, x0, x1, y0, y1, inside }; }, `http://127.0.0.1:${srv.address().port}/images/cadres/${f}`);
    const ref = REF[key], k = r.W / 1792; let dev = "-";
    let ok = r.anyAlpha && Math.abs(r.W / r.H - 1792 / 2400) < .002;
    if (ref) { const d = [r.x0 / k - ref[0], r.x1 / k - ref[1], r.y0 / k - ref[2], r.y1 / k - ref[3]]; dev = d.map(v => v.toFixed(1)).join(" "); if (d.some(v => Math.abs(v) > 3)) ok = false; }
    if (!PROV[key] && r.inside > 20) ok = false;
    if (!ok) bad++;
    out[key] = { file: f, w: r.W, h: r.H, x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 };
    console.log(`${ok ? "ok      " : "PAS OK  "} ${f} : ${r.W} × ${r.H}, alpha ${r.anyAlpha ? "oui" : "NON"}, fenêtre x ${r.x0}→${r.x1}, y ${r.y0}→${r.y1}, écart avec la référence (px à 1792) : ${dev}, pixels opaques dans la fenêtre : ${r.inside}${PROV[key] ? " [" + PROV[key] + "]" : ""}`);
  }
  fs.writeFileSync(path.join(DIR, "frames.json"), JSON.stringify(out, null, 1) + "\n");
  console.log(`\n${files.length - bad} sur ${files.length} cadres valides · frames.json écrit.`); await b.close(); srv.close(); process.exit(bad ? 1 : 0);
})();
