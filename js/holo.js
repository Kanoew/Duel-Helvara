/* Effet holo 2.5D des Ultra-légendaires de faction (module js/holo-card.js, chargé à la demande).
   Affiché seulement dans le zoom d'une carte et à la révélation d'un paquet, jamais sur le plateau, la main ou les listes.
   Activé par donnée : HOLO = { id de carte : dossier sous images/holo/ }. Une carte sans entrée garde son image fixe.
   Si le module, le manifest ou une image ne charge pas, rien ne change à l'écran (l'image fixe reste). */
const HOLO = { nike: "nike", ananke: "ananke", hedone: "hedone", nike_v: "nike-saint-valentin", source: "carla" };
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
  const h = { id, dead: false, card: null, el: null };
  (async () => {
    let el = null;
    try {
      const mod = await holoLoad(); if (h.dead) return;
      el = document.createElement("div"); el.className = "holohost"; slot.appendChild(el);
      const card = await mod.HoloCard.load(el, "images/holo/" + dir + "/manifest.json", Object.assign({ radius: 12 }, opts));
      if (h.dead) { card.destroy(); el.remove(); return; }
      h.card = card; h.el = el;
      /* l'image fixe reste sous l'effet pendant son fondu d'apparition (0,9 s, fondu enchaîné lent) : sinon un creux sombre apparaît au premier chargement */
      setTimeout(() => { if (!h.dead) slot.classList.add("holo-on"); }, 950);
    } catch (e) { if (el) el.remove(); const f = slot.querySelector(".full.holopre"); if (f) { f.classList.remove("holopre"); f.classList.add("holo"); } }   /* repli : l'image fixe retrouve son reflet d'ultra-légendaire */
  })();
  return h;
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
