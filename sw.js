/* Duel d'Helvara : service worker (hors ligne contre l'IA, chargement rapide).
   - Images, musiques, polices : cache d'abord (rangées dans un cache « media » dont le nom change quand un fichier média change).
   - HTML, JS, CSS : réseau d'abord (le cache ne sert que sans connexion), cache « core » renouvelé à chaque version.
   - Jamais mis en cache : tout ce qui n'est pas de ce site (Supabase, duel en ligne), les requêtes autres que GET, les réponses partielles.
   Le bloc entre les deux repères est réécrit par « node outils/versions.js » : ne pas le modifier à la main. */
"use strict";
/* VERSIONS-AUTO-DEBUT */
const CORE_VERSION = "ea89d3c8e9";
const MEDIA_VERSION = "96ee2a1827";
const PRECACHE_CORE = ["index.html","manifest.json","fonts/fonts.css?v=a5827da2","jeu.css?v=878d6729","vendor/supabase.js?v=16aeff36","config.js?v=bf7d9cd8","cloud.js?v=25093d84","cartes-en.js?v=f38cee32","interface-en.js?v=4b4e3144","js/cartes.js?v=ed416bc5","js/langue-profil.js?v=99d827c0","js/sons-effets.js?v=2ba6a15e","js/moteur.js?v=eb858de5","js/boutique-modes.js?v=fe598729","js/ouverture.js?v=854c78b5","js/interface.js?v=2a4cb0c6"];
const PRECACHE_MEDIA = ["fonts/manrope-latin-ext-wght-normal.woff2","fonts/manrope-latin-wght-normal.woff2","fonts/marcellus-latin-400-normal.woff2","fonts/marcellus-latin-ext-400-normal.woff2","fonts/marcellus-sc-latin-400-normal.woff2","fonts/marcellus-sc-latin-ext-400-normal.woff2","icones/apple-touch-icon.png","icones/favicon-48.png","icones/icone-192.png","icones/icone-512.png","icones/icone-maskable-512.png","images/fond.webp","images/fond_halloween.webp","images/fond_noel.webp","images/lieux/inconnu.webp","images/pack.webp","images/rangs/0.webp","images/rangs/1.webp","images/rangs/2.webp","images/rangs/3.webp","images/rangs/4.webp","images/rangs/5.webp","images/rangs/6.webp","images/reflet.webp"];
/* VERSIONS-AUTO-FIN */
const CORE = "helvara-core-" + CORE_VERSION, MEDIA = "helvara-media-" + MEDIA_VERSION, BASE = self.registration.scope;
const isMedia = u => /\/(images|audio|fonts|icones)\//.test(u.pathname);

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CORE), m = await caches.open(MEDIA);
    await Promise.allSettled(PRECACHE_CORE.map(u => c.add(new Request(u, { cache: "reload" }))));
    await Promise.allSettled(PRECACHE_MEDIA.map(async u => { if (!(await m.match(u))) await m.add(u); }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("helvara-") && k !== CORE && k !== MEDIA) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || r.headers.has("range")) return;           /* musique en lecture progressive : le réseau, tel quel */
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;                            /* Supabase et tout service externe : jamais interceptés */
  if (u.pathname.endsWith("/sw.js")) return;
  e.respondWith(isMedia(u) ? cacheFirst(r) : networkFirst(r));
});

async function cacheFirst(r) {
  const c = await caches.open(MEDIA), hit = await c.match(r);
  if (hit) return hit;
  const res = await fetch(r);
  if (res.ok && res.status === 200) c.put(r, res.clone()).catch(() => {});
  return res;
}

/* Réseau d'abord ; si le réseau ne répond pas en 4 s (ou échoue) et qu'on a une copie, on sert la copie (connexion qui rame, hors ligne). */
async function networkFirst(r) {
  const c = await caches.open(CORE), nav = r.mode === "navigate";
  const spare = async () => (await c.match(r)) || (nav ? (await c.match(BASE + "index.html")) || (await c.match(BASE)) : undefined);
  const net = fetch(r, nav ? { cache: "no-cache" } : undefined).then(res => { if (res.ok && res.status === 200) c.put(r, res.clone()).catch(() => {}); return res; });
  net.catch(() => {});
  try {
    return await Promise.race([net, new Promise(ok => setTimeout(async () => ok(await spare() || net), 4000))]);   /* la page d'accueil est toujours revérifiée : jamais de vieux index.html */
  } catch (err) {
    const hit = await spare();
    if (hit) return hit;
    throw err;
  }
}
