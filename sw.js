/* Duel d'Helvara : service worker (hors ligne contre l'IA, chargement rapide).
   - Images, musiques, polices : cache d'abord (rangées dans un cache « media » dont le nom change quand un fichier média change).
   - HTML, JS, CSS : réseau d'abord (le cache ne sert que sans connexion), cache « core » renouvelé à chaque version.
   - Jamais mis en cache : tout ce qui n'est pas de ce site (Supabase, duel en ligne), les requêtes autres que GET, les réponses partielles.
   Le bloc entre les deux repères est réécrit par « node outils/versions.js » : ne pas le modifier à la main. */
"use strict";
/* VERSIONS-AUTO-DEBUT */
const CORE_VERSION = "39815e9fca";
const MEDIA_VERSION = "87e39be31a";
const PRECACHE_CORE = ["index.html","manifest.json","fonts/fonts.css?v=a5827da2","jeu.css?v=e3b05302","vendor/supabase.js?v=16aeff36","config.js?v=bf7d9cd8","cloud.js?v=25093d84","cartes-en.js?v=2386ad2d","interface-en.js?v=702b04cc","js/cartes.js?v=9b6c7f03","js/langue-profil.js?v=d300eb13","js/sons-effets.js?v=2289d663","js/moteur.js?v=f3b7f369","js/boutique-modes.js?v=d4af59e5","js/ouverture.js?v=854c78b5","js/interface.js?v=112f4f09"];
const PRECACHE_MEDIA = ["fonts/manrope-latin-ext-wght-normal.woff2","fonts/manrope-latin-wght-normal.woff2","fonts/marcellus-latin-400-normal.woff2","fonts/marcellus-latin-ext-400-normal.woff2","fonts/marcellus-sc-latin-400-normal.woff2","fonts/marcellus-sc-latin-ext-400-normal.woff2","icones/apple-touch-icon.png","icones/favicon-48.png","icones/icone-192.png","icones/icone-512.png","icones/icone-maskable-512.png","images/fond.webp","images/fond_halloween.webp","images/fond_noel.webp","images/lieux/inconnu.webp","images/pack.webp","images/rangs/0.webp","images/rangs/1.webp","images/rangs/2.webp","images/rangs/3.webp","images/rangs/4.webp","images/rangs/5.webp","images/rangs/6.webp","images/reflet.webp"];
const PRECACHE_LAZY = ["images/avatars/aine.webp?v=7","images/avatars/amaterasu.webp?v=7","images/avatars/anahita.webp?v=7","images/avatars/ananke.webp?v=7","images/avatars/anat.webp?v=7","images/avatars/andraste.webp?v=7","images/avatars/anubis.webp?v=7","images/avatars/aphrodite.webp?v=7","images/avatars/aphrodite_n.webp?v=7","images/avatars/aphrodite_r.webp?v=7","images/avatars/apollon.webp?v=7","images/avatars/apsu.webp?v=7","images/avatars/apsu_n.webp?v=7","images/avatars/araignee.webp?v=7","images/avatars/archiviste.webp?v=7","images/avatars/ares.webp?v=7","images/avatars/ares_h.webp?v=7","images/avatars/ares_n.webp?v=7","images/avatars/artemis.webp?v=7","images/avatars/athena.webp?v=7","images/avatars/baldur.webp?v=7","images/avatars/balor.webp?v=7","images/avatars/bastet.webp?v=7","images/avatars/benzaiten.webp?v=7","images/avatars/bia.webp?v=7","images/avatars/biblio.webp?v=7","images/avatars/boucher.webp?v=7","images/avatars/bourreau.webp?v=7","images/avatars/brigid.webp?v=7","images/avatars/calypso.webp?v=7","images/avatars/calypso_n.webp?v=7","images/avatars/carillonneur.webp?v=7","images/avatars/celeste.webp?v=7","images/avatars/cernunnos.webp?v=7","images/avatars/charognard.webp?v=7","images/avatars/chasseur.webp?v=7","images/avatars/chernobog.webp?v=7","images/avatars/circe.webp?v=7","images/avatars/circe_v.webp?v=7","images/avatars/colosse.webp?v=7","images/avatars/comptable.webp?v=7","images/avatars/costumes.webp?v=7","images/avatars/coursier.webp?v=7","images/avatars/couturiere.webp?v=7","images/avatars/cronos.webp?v=7","images/avatars/daji.webp?v=7","images/avatars/dante.webp?v=7","images/avatars/demeter.webp?v=7","images/avatars/devote.webp?v=7","images/avatars/dionysos.webp?v=7","images/avatars/doyenne.webp?v=7","images/avatars/durga.webp?v=7","images/avatars/echidna.webp?v=7","images/avatars/ecorche.webp?v=7","images/avatars/effigie.webp?v=7","images/avatars/eir.webp?v=7","images/avatars/emiri.webp?v=7","images/avatars/enfant.webp?v=7","images/avatars/eos.webp?v=7","images/avatars/eos_r.webp?v=7","images/avatars/ereshkigal.webp?v=7","images/avatars/ereshkigal_n.webp?v=7","images/avatars/ereshkigal_v.webp?v=7","images/avatars/eris.webp?v=7","images/avatars/eros.webp?v=7","images/avatars/esquille.webp?v=7","images/avatars/fange.webp?v=7","images/avatars/felix.webp?v=7","images/avatars/ficelle.webp?v=7","images/avatars/freya.webp?v=7","images/avatars/freyr.webp?v=7","images/avatars/frigg.webp?v=7","images/avatars/funambule.webp?v=7","images/avatars/gaia.webp?v=7","images/avatars/graffeur.webp?v=7","images/avatars/hades.webp?v=7","images/avatars/hathor.webp?v=7","images/avatars/hecate.webp?v=7","images/avatars/hedone.webp?v=7","images/avatars/heimdall.webp?v=7","images/avatars/hel.webp?v=7","images/avatars/hel_r.webp?v=7","images/avatars/hel_v.webp?v=7","images/avatars/hephaistos.webp?v=7","images/avatars/hera.webp?v=7","images/avatars/herakles.webp?v=7","images/avatars/hermes.webp?v=7","images/avatars/idunn.webp?v=7","images/avatars/inanna.webp?v=7","images/avatars/indra.webp?v=7","images/avatars/ishara.webp?v=7","images/avatars/ishtar.webp?v=7","images/avatars/ixchel.webp?v=7","images/avatars/izanami.webp?v=7","images/avatars/izzy.webp?v=7","images/avatars/izzy_h.webp?v=7","images/avatars/joanna.webp?v=7","images/avatars/jordan.webp?v=7","images/avatars/jordan_n.webp?v=7","images/avatars/kali.webp?v=7","images/avatars/kitsune.webp?v=7","images/avatars/konohana.webp?v=7","images/avatars/lilith.webp?v=7","images/avatars/lipdentelle.webp?v=7","images/avatars/loki.webp?v=7","images/avatars/loviatar.webp?v=7","images/avatars/maat.webp?v=7","images/avatars/maeve.webp?v=7","images/avatars/maree.webp?v=7","images/avatars/medee.webp?v=7","images/avatars/medee_h.webp?v=7","images/avatars/meduse.webp?v=7","images/avatars/melinoe.webp?v=7","images/avatars/mendiant.webp?v=7","images/avatars/mere.webp?v=7","images/avatars/messagere.webp?v=7","images/avatars/meute.webp?v=7","images/avatars/mohini.webp?v=7","images/avatars/morrigan.webp?v=7","images/avatars/morrigan_h.webp?v=7","images/avatars/mouche.webp?v=7","images/avatars/musicien.webp?v=7","images/avatars/nemesis.webp?v=7","images/avatars/nergal.webp?v=7","images/avatars/nergal_h.webp?v=7","images/avatars/nike.webp?v=7","images/avatars/nike_v.webp?v=7","images/avatars/nuee.webp?v=7","images/avatars/nyx.webp?v=7","images/avatars/nyx_h.webp?v=7","images/avatars/odin.webp?v=7","images/avatars/oshun.webp?v=7","images/avatars/oya.webp?v=7","images/avatars/pakhet.webp?v=7","images/avatars/pandore.webp?v=7","images/avatars/passante.webp?v=7","images/avatars/patronne.webp?v=7","images/avatars/pele.webp?v=7","images/avatars/pele_r.webp?v=7","images/avatars/penitente.webp?v=7","images/avatars/persephone.webp?v=7","images/avatars/poseidon.webp?v=7","images/avatars/possedee.webp?v=7","images/avatars/promethee.webp?v=7","images/avatars/psyche.webp?v=7","images/avatars/qetesh.webp?v=7","images/avatars/qetesh_r.webp?v=7","images/avatars/qetesh_v.webp?v=7","images/avatars/rati.webp?v=7","images/avatars/reflet_noir.webp?v=7","images/avatars/reine_sevelin.webp?v=7","images/avatars/relieur.webp?v=7","images/avatars/remi.webp?v=7","images/avatars/rusalka.webp?v=7","images/avatars/sansvoix.webp?v=7","images/avatars/scathach.webp?v=7","images/avatars/sedna.webp?v=7","images/avatars/sekhmet.webp?v=7","images/avatars/sekhmet_n.webp?v=7","images/avatars/selene.webp?v=7","images/avatars/set.webp?v=7","images/avatars/skadi.webp?v=7","images/avatars/somnambule.webp?v=7","images/avatars/styx.webp?v=7","images/avatars/susanoo.webp?v=7","images/avatars/tatoueur.webp?v=7","images/avatars/tefnut.webp?v=7","images/avatars/thor.webp?v=7","images/avatars/thot.webp?v=7","images/avatars/tlazol.webp?v=7","images/avatars/troll.webp?v=7","images/avatars/tsukuyomi.webp?v=7","images/avatars/typhon.webp?v=7","images/avatars/tyr.webp?v=7","images/avatars/ulaph.webp?v=7","images/avatars/ulaphares.webp?v=7","images/avatars/ularchiviste.webp?v=7","images/avatars/ularesathe.webp?v=7","images/avatars/ulbaldere.webp?v=7","images/avatars/ulbaldfrigg.webp?v=7","images/avatars/ulcal.webp?v=7","images/avatars/ulcircal.webp?v=7","images/avatars/ulcirce.webp?v=7","images/avatars/ulhadper.webp?v=7","images/avatars/ulhel.webp?v=7","images/avatars/ulheradio.webp?v=7","images/avatars/ulinaere.webp?v=7","images/avatars/ulji.webp?v=7","images/avatars/ulmaatset.webp?v=7","images/avatars/ulnem.webp?v=7","images/avatars/ulnikebia.webp?v=7","images/avatars/ulnikejor_v.webp?v=7","images/avatars/uloshoya.webp?v=7","images/avatars/uloshun.webp?v=7","images/avatars/ulpele_r.webp?v=7","images/avatars/ulposathe.webp?v=7","images/avatars/ulprombia.webp?v=7","images/avatars/ulprompan.webp?v=7","images/avatars/ulqetjor.webp?v=7","images/avatars/ulqetjor_r.webp?v=7","images/avatars/ulqetjor_v.webp?v=7","images/avatars/ulqetyar.webp?v=7","images/avatars/ulsomnambule.webp?v=7","images/avatars/ulsusama.webp?v=7","images/avatars/ultyphgaia.webp?v=7","images/avatars/ulya.webp?v=7","images/avatars/uzume.webp?v=7","images/avatars/vasseur.webp?v=7","images/avatars/veilleur.webp?v=7","images/avatars/veilleur_pont.webp?v=7","images/avatars/vesta.webp?v=7","images/avatars/voleuse.webp?v=7","images/avatars/voyante.webp?v=7","images/avatars/vritra.webp?v=7","images/avatars/yarden.webp?v=7","images/avatars/yarden_d.webp?v=7","images/avatars/zeus.webp?v=7","images/lieux/archives.webp","images/lieux/cathedrale.webp","images/lieux/cirque.webp","images/lieux/domaine.webp","images/lieux/encheres.webp","images/lieux/escaliers.webp","images/lieux/faille.webp","images/lieux/flon.webp","images/lieux/ouchy.webp","images/lieux/ruelle.webp","images/lieux/sauvabelin.webp","images/lieux/sousgare.webp","images/lieux/tombeau.webp","images/lieux/tour.webp"];
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
    fillLazy();   /* sans attendre : les avatars et les lieux se rangent en arrière-plan, la page n'est jamais bloquée */
  })());
});

/* Avatars (miniatures du plateau, y compris celles de l'adversaire) et lieux : 3 Mo environ, rangés une fois pour qu'une partie hors ligne s'affiche en entier. */
async function fillLazy() {
  try {
    const m = await caches.open(MEDIA);
    for (const u of PRECACHE_LAZY) { if (!(await m.match(u))) { try { await m.add(u); } catch (_) {} } }
  } catch (_) {}
}

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
