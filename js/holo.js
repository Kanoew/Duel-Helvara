/* Effet holo 2.5D des Ultra-légendaires de faction (module js/holo-card.js, chargé à la demande).
   Affiché partout où la carte apparaît : grand format (Collection, partie), révélation d'un paquet, vitrine de l'accueil, et petites cartes (main, plateau, grille de la Collection).
   Activé par donnée : HOLO = { id de carte : dossier sous images/holo/ }. Une carte sans entrée garde son image fixe.
   Si le module, le manifest ou une image ne charge pas, rien ne change à l'écran (l'image fixe reste). */
const HOLO = { nike: "nike", ananke: "ananke", hedone: "hedone", nike_v: "nike-saint-valentin", ananke_r: "ananke-nouvel-an", ananke_v: "ananke-fil-rouge", source: "carla" };
/* Mode test : ouvrir le jeu avec ?holo=test ajoute un bouton « Test holo » (zoom et faux paquet sans posséder les cartes) ; cette table sert à y ajouter des cartes d'essai. */
const HOLO_TEST = {};
const HOLO_TESTON = /[?&]holo=test\b/.test(location.search);
const HOLO_MOD = (document.currentScript && document.currentScript.dataset.mod) || "js/holo-card.js";
const holoDir = id => (HOLO_TESTON && HOLO_TEST[id]) || HOLO[id] || null;
let holoModP = null;
const holoLoad = () => holoModP || (holoModP = import(new URL(HOLO_MOD, document.baseURI).href).catch(e => { holoModP = null; throw e; }));
/* Monte l'effet dans `slot` (l'image fixe y reste tant que l'effet n'est pas prêt, puis la classe holo-on la cache).
   Renvoie un jeton à passer à holoKill(), ou null si la carte n'a pas de holo. */
function holoMount(slot, id, opts) {
  const dir = holoDir(id); if (!dir || !slot) return null;
  const h = { id, dead: false, card: null, el: null, slot };
  (async () => {
    let el = null;
    try {
      const mod = await holoLoad(); if (h.dead) return;
      el = document.createElement("div"); el.className = "holohost"; h.slot.appendChild(el);
      const card = await mod.HoloCard.load(el, "images/holo/" + dir + "/manifest.json", Object.assign({ radius: 12 }, opts && { ...opts, overlay: undefined }));
      if (h.dead) { card.destroy(); el.remove(); return; }
      h.card = card; h.el = el;
      if (opts && opts.overlay) { const hc = el.querySelector(".hc-card"); if (hc) { const i = document.createElement("i"); i.className = "cadre"; i.style.backgroundImage = "url('images/cadres/" + opts.overlay + ".webp')"; i.setAttribute("aria-hidden", "true"); hc.appendChild(i); } }
      /* même illustration dessous (sans texte) : l'effet prend la place tout de suite, sans fondu (il « montait » et faisait une coupure) */
      requestAnimationFrame(() => { if (!h.dead) h.slot.classList.add("holo-on"); });
    } catch (e) { if (el) el.remove(); const f = h.slot.querySelector(".full.holopre"); if (f) { f.classList.remove("holopre"); f.classList.add("holo"); } }   /* repli : l'image fixe retrouve son reflet d'ultra-légendaire */
  })();
  return h;
}
/* Change l'emplacement d'un effet (le jeu réécrit l'écran à chaque action : l'effet suit son nouveau conteneur, même pendant son chargement). */
function holoMove(h, slot) {
  if (!h || h.dead) return; h.slot = slot;
  if (h.el) { slot.appendChild(h.el); slot.classList.add("holo-on"); }
}
/* Image à plat de la carte holo (les couches empilées, sans mouvement) : sert de face à la carte qui se retourne dans l'ouverture de paquet,
   pour que l'effet, posé ensuite par-dessus, prenne la suite sans changement d'image (l'image fixe du jeu a le nom, le coût et le texte). Renvoie null si indisponible. */
async function holoPoster(id) {
  const dir = holoDir(id); if (!dir) return null;
  try {
    const r = await fetch("images/holo/" + dir + "/manifest.json"); if (!r.ok) return null;
    const m = await r.json(), box = document.createElement("div"); box.className = "holo-poster"; box.style.aspectRatio = m.aspect[0] + " / " + m.aspect[1];
    const imgs = m.layers.map(L => { const im = new Image(); im.alt = ""; im.src = "images/holo/" + dir + "/" + L.src; box.appendChild(im); return im; });
    await Promise.all(imgs.map(im => im.decode()));
    return box;
  } catch (e) { return null; }
}
/* Préchargement (appelé à l'affichage de la collection) : module, manifests et images des cartes holo sorties, en tâche de fond,
   pour que l'effet soit là dès l'ouverture de la carte en grand (sinon il arrivait après l'illustration : « coupure », Jordan 15 octobre). */
const HOLO_PRE = {};
function holoPrefetch(only) {
  const c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ""))) return;
  const ids = Object.keys(HOLO).filter(id => !HOLO_PRE[id] && CARDS[id] && (HOLO_TESTON || REL(id)) && (!only || only.includes(id))); if (!ids.length) return;
  ids.forEach(id => HOLO_PRE[id] = []);
  (window.requestIdleCallback || (f => setTimeout(f, 200)))(() => {
    holoLoad().catch(() => {});
    ids.forEach(async id => {
      try {
        const dir = holoDir(id), r = await fetch("images/holo/" + dir + "/manifest.json"); if (!r.ok) return;
        const m = await r.json();
        m.layers.forEach(L => [L.src].concat((L.foils || []).map(f => f.mask).filter(Boolean)).forEach(src => {
          const im = new Image(); im.src = "images/holo/" + dir + "/" + src; im.decode().catch(() => {}); HOLO_PRE[id].push(im);
        }));
      } catch (e) {}
    });
  });
}
function holoKill(h) {
  if (!h) return; h.dead = true;
  if (h.card) { try { h.card.destroy(); } catch (e) {} h.card = null; }
  if (h.el) { h.el.remove(); h.el = null; }
}

/* Mode test (?holo=test) : un petit bouton « Test holo » ouvre un panneau pour voir l'effet sans posséder les cartes
   (elles ne sont pas encore sorties) : zoom de chaque carte holo et faux paquet. Rien n'est acheté ni sauvegardé. */
if (HOLO_TESTON) addEventListener("DOMContentLoaded", () => {
  const box = document.createElement("div"); box.className = "holotest";
  box.innerHTML = '<button type="button" class="ht-toggle">Test holo</button><div class="ht-menu" hidden>' +
    Object.keys(Object.assign({}, HOLO, HOLO_TEST)).map(id => '<button type="button" data-z="' + id + '">Zoom : ' + CARDS[id].name + "</button>").join("") +
    '<button type="button" data-pack="1">Faux paquet (4 cartes)</button></div>';
  document.body.appendChild(box);
  const menu = box.querySelector(".ht-menu");
  box.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.classList.contains("ht-toggle")) { menu.hidden = !menu.hidden; return; }
    menu.hidden = true;
    if (b.dataset.z) { zoomId = b.dataset.z; render(); }
    else if (b.dataset.pack) ouvrirTirage({ res: Object.keys(HOLO).map(id => ({ id, isNew: true, v: 0 })), name: "Test", img: "images/pack.webp", pid: null, price: 0 });
  });
});
