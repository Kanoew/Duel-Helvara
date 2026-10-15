/* Effet holo 2.5D des Ultra-légendaires de faction (module js/holo-card.js, chargé à la demande).
   Affiché seulement dans le zoom d'une carte et à la révélation d'un paquet, jamais sur le plateau, la main ou les listes.
   Activé par donnée : HOLO = { id de carte : dossier sous images/holo/ }. Une carte sans entrée garde son image fixe.
   Si le module, le manifest ou une image ne charge pas, rien ne change à l'écran (l'image fixe reste). */
const HOLO = {};
/* Cartes de test : ouvrir le jeu avec ?holo=test affiche les 4 exemples à la place des 4 ultra-légendaires de faction. */
const HOLO_TEST = { nike: "exemple-1", ananke: "exemple-2", hedone: "exemple-3", nike_v: "exemple-4" };
const HOLO_TESTON = /[?&]holo=test\b/.test(location.search);
const HOLO_MOD = (document.currentScript && document.currentScript.dataset.mod) || "js/holo-card.js";
const holoDir = id => (HOLO_TESTON ? HOLO_TEST : HOLO)[id] || null;
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
      h.card = card; h.el = el; slot.classList.add("holo-on");
    } catch (e) { if (el) el.remove(); }
  })();
  return h;
}
function holoKill(h) {
  if (!h) return; h.dead = true;
  if (h.card) { try { h.card.destroy(); } catch (e) {} h.card = null; }
  if (h.el) { h.el.remove(); h.el = null; }
}
