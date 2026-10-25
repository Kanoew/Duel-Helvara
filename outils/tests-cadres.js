/* Test des cadres de fête : chaque fichier de images/cadres/ doit faire 900 × 1350, avoir un canal alpha, et être 100 % transparent
   sur le rectangle de la carte (100, 145) → (800, 1205) : un pixel opaque dans ce rectangle = échec. Usage : node outils/tests-cadres.js */
const { chromium } = require("/opt/node-tools/node_modules/playwright"); const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "images", "cadres");
(async () => {
  const files = fs.readdirSync(DIR).filter(f => /\.(webp|png)$/.test(f)); let bad = 0;
  const srv = http.createServer((q, r) => { fs.readFile(path.join(ROOT, decodeURIComponent(q.url.split("?")[0])), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": q.url.includes(".png") ? "image/png" : q.url.includes(".webp") ? "image/webp" : "text/html" }); r.end(d); }); }).listen(0);
  const b = await chromium.launch(), p = await b.newPage(); await p.route("**/vendor/supabase.js*", r => r.fulfill({ contentType: "text/javascript", body: "window.supabase=undefined" })); await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`); await p.evaluate(() => { document.body.innerHTML = "<canvas id=c></canvas>"; });
  for (const f of files) {
    const r = await p.evaluate(async url => { const im = new Image(); await new Promise((ok, ko) => { im.onload = ok; im.onerror = ko; im.src = url; }); const c = document.getElementById("c"); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext("2d"); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data; let anyAlpha = false, inside = 0, maxIn = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 255) { anyAlpha = true; break; }
      if (c.width === 900 && c.height === 1350) for (let y = 145; y < 1205; y++) for (let xx = 100; xx < 800; xx++) { const a = d[(y * 900 + xx) * 4 + 3]; if (a > 0) { inside++; if (a > maxIn) maxIn = a; } }
      return { w: im.naturalWidth, h: im.naturalHeight, anyAlpha, inside, maxIn }; }, `http://127.0.0.1:${srv.address().port}/images/cadres/${f}`);
    const ok = r.w === 900 && r.h === 1350 && r.anyAlpha && r.inside === 0; if (!ok) bad++;
    console.log(`${ok ? "ok      " : "PAS OK  "} ${f} : ${r.w} × ${r.h}, alpha ${r.anyAlpha ? "oui" : "NON"}, pixels non transparents dans la carte : ${r.inside}${r.inside ? " (alpha max " + r.maxIn + ")" : ""}`);
  }
  console.log(`\n${files.length - bad} sur ${files.length} cadres valides.`); await b.close(); srv.close(); process.exit(bad ? 1 : 0);
})();
