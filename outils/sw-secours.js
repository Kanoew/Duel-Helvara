/* Duel d'Helvara : SERVICE WORKER DE SECOURS (interrupteur d'urgence).
   À utiliser seulement si une version de sw.js pose problème chez les joueurs (vieux fichiers servis, jeu cassé…).
   Mode d'emploi : copier ce fichier à la place de sw.js, à la racine (cp outils/sw-secours.js sw.js), puis commit et push sur main.
   Au prochain passage de chaque joueur, il : 1) supprime tous les caches du jeu (helvara-…), 2) se désinstalle,
   3) recharge les pages qu'il contrôlait, qui repartent alors directement du site (sans service worker, comme avant la PWA).
   Il ne touche à aucune sauvegarde (stockage local, compte). Il n'intercepte aucune requête.
   Pour revenir à la PWA : remettre le vrai sw.js (git checkout <commit> -- sw.js), lancer node outils/versions.js, publier. */
"use strict";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("helvara-")) await caches.delete(k);
    const pages = await self.clients.matchAll({ type: "window" });   /* seulement les pages qu'un ancien service worker contrôlait : pas de boucle de rechargement */
    await self.registration.unregister();
    for (const c of pages) { try { await c.navigate(c.url); } catch (_) {} }
  })());
});
