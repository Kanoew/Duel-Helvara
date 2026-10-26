# Consignes pour Codex : images de Duel d'Helvara

Tu travailles sur la branche `codex/images`. Ne pousse **jamais** sur `main` : c'est Jordan qui le demandera après relecture.
Réponses et messages de commit en **français**. Jordan n'est pas développeur : explique simplement, et dis franchement ce que tu n'as pas vérifié.

## Périmètre
- Ne touche qu'à `images/`, plus `index.html` et `sw.js` **uniquement** via `node outils/versions.js` (à lancer après chaque lot d'images, jamais à la main).
- Ne modifie aucun fichier `.js`, `.css`, `.md`, ni `cartes.js`. Si une image demande un changement de code, dis-le à Jordan au lieu de le faire.
- Ne génère pas et ne modifie pas `images/holo/` (ces dossiers viennent de la session de Jordan).

## Formats (toujours WebP qualité 80)
| Image | Taille | Chemin |
|---|---|---|
| Carte | 720 × 1080 | `images/<id>.webp` |
| Avatar | 256 × 256, **recadré à la main sur le visage** | `images/avatars/<id>.webp` |
| Miniature | 360 × 540, faite à partir de la carte | `images/mini/<id>.webp` |
- Lieu : 800 × 597 dans `images/lieux/`. Paquet : 600 × 894 dans `images/packs/`.
- **Jetons** (`token:true` dans `js/cartes.js`) : pas de miniature, mais l'avatar est obligatoire.
- Vérifie la taille réelle de l'image reçue avant de calculer un recadrage. Outil : `sharp` (`mkdir -p /tmp/sb && cd /tmp/sb && npm i sharp`).
- Pour chaque lot : fais une **planche de contrôle** (tous les avatars côte à côte, visage centré, ni trop serré ni trop large) et montre-la à Jordan avant de commiter.
- Un `id` de carte vient de `js/cartes.js` : en cas de doute sur le nom d'un fichier, demande.

## Git
- Adresse de commit : `git config user.email` doit afficher `333710536+Kanoew@users.noreply.github.com`. Sinon, la régler avant tout commit. Ne jamais écrire d'autre adresse e-mail.
- Aucune ligne `Co-Authored-By` ni mention d'un nom d'IA dans les commits ou le code.
- Jamais de `push --force`, jamais de réécriture d'historique.
- Un commit par lot d'images, message court en français (ex. « Images : lot du 1er mars »).
- Aucun secret dans le dépôt.
