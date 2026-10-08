# Duel d'Helvara : mémo de reprise

Jeu de cartes web façon Marvel Snap (3 lieux, 6 tours, énergie = numéro du tour, effets Révélation et Continu).
Univers et lore : ceux de Jordan (pseudo GitHub **Kanoew**). Tiamat est une présence, pas un personnage.
Réponses en **français**.

- Site : https://kanoew.github.io/Duel-Helvara/
- Dépôt : `Kanoew/Duel-Helvara`, branche `main`. Chaque push sur `main` redéploie GitHub Pages en 1 à 2 minutes.

---

## Règles à respecter absolument

- **Ne jamais écrire d'adresse e-mail personnelle** dans le dépôt, les commits ou le code. Les commits utilisent l'adresse noreply déjà réglée : `git config user.email` doit afficher `333710536+Kanoew@users.noreply.github.com`. Sinon, la régler avant tout commit.
- **Aucun secret dans le dépôt.** Le code secret Google OAuth reste uniquement dans Supabase. La clé de `config.js` est une clé *publishable* : elle peut rester publique.
- **Pas de nom ou d'identifiant de modèle d'IA** dans les commits ni dans le code.
- Messages de commit en français.
- **Pour changer un effet, modifier en priorité une carte pas encore sortie.**
- Ne jamais réécrire l'historique ni faire de `push --force` sans accord explicite.
- **Si un déploiement Pages reste bloqué**, ne pas utiliser « Re-run ». Pousser un commit vide (`git commit --allow-empty -m "Relance de la publication GitHub Pages"`), ce qui crée un nouveau run.

---

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Tout le jeu : données, moteur, IA, interface, CSS, effets visuels |
| `cartes-en.js` | Traductions anglaises des cartes, lieux, factions et raretés (`window.HELVARA_EN`) |
| `interface-en.js` | Traductions anglaises de l'interface (`exact`, `rules` en regex, `NOTES` pour le journal, `DROPS`, `ULS`…) |
| `cloud.js` + `config.js` | Supabase : sauvegarde, classement, duels en temps réel, connexion Google |
| `vendor/supabase.js` | Bibliothèque Supabase en local (le CDN est bloqué) |
| `supabase.sql`, `nettoyage.sql` | Scripts à coller dans Supabase → SQL Editor |
| `images/` | Illustrations des cartes (`<id>.jpg`) |
| `images/avatars/` | Portraits carrés (`<id>.jpg`) |
| `images/lieux/`, `images/packs/` | Lieux et paquets |
| `audio/` | Musiques |

---

## Ajouter une carte (la tâche la plus courante)

### 1. Les images (toujours deux par carte)

| Image | Format | Chemin |
|---|---|---|
| Carte | 720 × 1080, JPEG qualité 82 | `images/<id>.jpg` |
| Avatar | 256 × 256, JPEG qualité 85, **recadré à la main sur le visage** | `images/avatars/<id>.jpg` |

L'avatar sert de portrait au joueur, mais aussi de **miniature sur le plateau**. Il est donc obligatoire.

- Autres formats : lieu en 800 × 597 dans `images/lieux/`, paquet en 600 × 894 dans `images/packs/`.
- Les images envoyées dans le chat arrivent en pleine résolution. Vérifier leur taille réelle avant de calculer le recadrage : l'aperçu affiché est souvent plus petit.
- Outil : `sharp` pour Node. Il n'est pas installé dans un conteneur neuf : `mkdir -p /tmp/sb && cd /tmp/sb && npm i sharp`.

```js
const sharp=require('/tmp/sb/node_modules/sharp');
await sharp(src).resize(720,1080,{fit:'cover'}).jpeg({quality:82,mozjpeg:true}).toFile('images/<id>.jpg');
await sharp(src).extract({left,top,width:c,height:c}).resize(256,256).jpeg({quality:85}).toFile('images/avatars/<id>.jpg');
```

Toujours regarder l'avatar obtenu (le visage doit être centré, ni trop serré ni trop large) et corriger le recadrage si besoin.

### 2. Les données, dans l'objet `CARDS` de `index.html`

```js
athena:  {name:"Athéna", cost:2, pow:2, fac:"jugement", r:"E", rel:"2026-11-15", soon:"2026-11-10", fx:"Révélation : …", img:"images/athena.jpg"},
```

| Champ | Valeurs |
|---|---|
| `fac` | `helvara`, `primordial`, `desir`, `jugement` |
| `r` | `C` commune, `R` rare, `E` épique, `L` légendaire, `U` ultra-légendaire |
| `rel` | date de sortie (carte cachée avant) |
| `soon` | date d'annonce (« Bientôt ») |
| `ex` | carte exclusive à un paquet saisonnier (`halloween`, `noel`, `nouvelan`) |
| `base` | id de la version de base, pour une variante (une seule version par personnage dans un deck) |
| `vfx` | clé d'effet visuel, **seulement pour les légendaires et ultra-légendaires** (voir `MIX`) |

Autres réglages selon le type de carte :
- **Fusion ultra-légendaire** : ajouter une entrée dans `ULS`, au format `{id, req:[…], n:"…"}`.
- **Ultra-légendaire de faction** (comme Nike) : `{id, req:[], fac, min, n}`.
- **Nouvelle vague** : ajouter une entrée dans `DROPS` (`id`, `rel`, `soon`, `hint`). C'est la bannière d'accueil.

### 3. L'effet

- **Révélation** : un `case "<id>":` dans `revealFx()`. Outils disponibles : `buffSelf`, `strongest`, `weakest`, `weaken`, `destroy`, `resurrect`, `note`, `snd`.
- **Continu** : dans `cardPow()` pour la puissance, ou dans les protections (`destroy`, `weaken`, `styxSafe`, `baldurSafe`…).
- **Fin de tour** : dans `resolveTurn()`.
- **IA** : ajouter l'id à `HITS` s'il frappe l'adversaire, à `NEEDS_MATES` s'il veut des alliées, ou ajuster le score dans `aiPlan()`.
- Pour tout tirage au hasard, utiliser `gPick` / `gShuffle`, **jamais `Math.random`**. Les duels en ligne partagent le même tirage.

### 4. La traduction anglaise

- Dans `cartes-en.js` → `cards` : `<id>:{n:"Nom anglais", fx:"…"}`. Omettre `n` si le nom ne change pas.
- Si l'effet écrit une note dans le journal, ajouter sa règle dans `NOTES` (`interface-en.js`), **avant les règles génériques**.
- Bannière `DROPS` et fusions `ULS` : dans `interface-en.js` → `data`.

### 5. Tester puis publier

- Tester dans Chromium avec Playwright (préinstallé, voir plus bas). Simuler une date avec `window.__today='2026-11-20'` dans un `addInitScript`.
- Vérifier l'effet, puis lancer quelques parties complètes (aucune erreur dans la console).
- Commit en français, puis `git push origin main`.
- Vérifier le déploiement : `gh api "repos/Kanoew/Duel-Helvara/actions/runs?per_page=1"`.

---

## Repères du moteur (`index.html`)

- **État d'une partie `S`** :
  - `board[s][li]` : cartes sur le plateau, avec `s` = `"p"` (toi) ou `"e"` (adversaire) et `li` = 0, 1 ou 2 ;
  - `hand`, `deck` ;
  - `energy`, `energyE` ;
  - `bonus` : énergie du tour suivant (Freyr, Prométhée) ;
  - `discardPile`, `graveyard`.
- **Fonctions** :
  - déroulement : `startTurn()` (révèle les lieux aux tours 1 à 3), `resolveTurn(mine, theirs, animate)` (pose, révélations dans l'ordre, effets de fin de tour), `finish()` ;
  - effets : `reveal()` → `revealFx()`, `cardPow()`, `total()` ;
  - IA : `aiPlan()`, `aiOath()`.
- **Lieux** : objet `LOCS`. `locIs(li,"faille")` teste un lieu.
- **Rangs** : `DIV=[3,3,3,3,5,5,1]`, `START=[0,3,6,9,12,17,22]`. Héraut et Avatar ont 5 divisions. Icônes dans `images/rangs/<palier>.png`.
- **Serment** : tenu = +2 étoiles ; rompu = −1 de plus. Serment croisé (même lieu que l'IA) : lieu + partie gagnés = +4, perdus = −4, sinon 0.
- **Effets visuels** : module `FX` (une seule toile, une seule boucle d'animation, aléatoire propre au visuel).
  - `MIX` : un mélange par clé `vfx` et par lieu (`l_<id>`).
  - `LAYER` : briques sur un lieu (`rise`, `burst`, `smoke`, `rays`, `vortex`, `rings`, `chains`, `sweep`, `sparkle`, `flicker`).
  - `SCREEN` : ambiances plein écran, ultra-légendaires seulement (`rain`, `petals`, `embers`, `lightning`, `snow`, `dust`, `bubbles`).
  - Les légendaires et ultra-légendaires en grand s'inclinent sous le doigt (`.full.tilt`). Les ultra-légendaires ont en plus leur ambiance en boucle dans l'illustration.
- **Langue** : `trUI()` et `translateDOM()`. Le texte est écrit en français dans le code, puis traduit à l'affichage.

---

## Tests (Playwright)

- Playwright : `/opt/node-tools/node_modules/playwright`. Chromium est préinstallé, ne pas lancer `playwright install`.
- Servir le dossier avec un petit serveur HTTP Node. Remplacer `vendor/supabase.js` par un faux Supabase pour jouer sans réseau.
- Écrire les scripts de test hors du dépôt (dossier temporaire).

---

## Rareté et brillance

Repère : une commune se lit en une seconde, une épique fait réfléchir. Répartition actuelle (jetons exclus) : 21 communes, 51 rares, 40 épiques (dont 13 variantes saisonnières), 19 légendaires, 13 ultra-légendaires.

- **Rétrogradées en rare (15)** : hathor, bastet, freya, tyr, konohana, nuee, pele, mere, durga, sekhmet, eir, andraste, balor, oshun, athena. Restent épiques malgré la liste initiale : inanna, anat, fange, graffeur, ixchel.
- **Rétrogradées en commune (5)** : maeve, tefnut, selene, hecate, funambule.
- Inchangées : variantes saisonnières (`ex`), Jordan, Jordan le Narrateur, Yarden Weiss, légendaires, ultra-légendaires, et les cartes dont l'effet vient d'être refait (aphrodite, susanoo, medee, messagere, dante, boucher).
- Seule la lettre `r` change, jamais l'effet. Les cartes déjà possédées restent en collection ; les rétrogradées coûtent moins cher à la boutique du jour et rapportent moins en doublon.

Brillance (classes `r-R`, `r-E`, `r-L` ajoutées par `rc()` sur `fullCard`, la main et les miniatures) :

| Rareté | Sur la carte | À la pose |
|---|---|---|
| Commune | rien | rien |
| Rare | halo bleu (contour + lueur intérieure) + reflet lent et pâle (9 s) | rien |
| Épique | halo violet qui pulse + reflet vif toutes les 3,4 s (CSS : main, collection, boutique, grand format, paquets, vitrine) | gerbe d'étincelles de 0,8 s sur le lieu (`epic_<faction>` dans `MIX`) |
| Légendaire | liseré doré + reflet doré + souffle lent et poussières dans l'illustration | effet `vfx` |
| Ultra-légendaire | reflet holo + ambiance en boucle | effet `vfx` + cinématique de fusion |

- Le liseré est un `outline` (une ombre intérieure passerait sous l'illustration). Plateau (miniatures) : liseré seul, sans animation. Grilles : le souffle de l'illustration des légendaires est réservé au grand format. `prefers-reduced-motion` coupe tout.
- Une carte `.full` doit rester positionnée (`relative` ou `absolute`) : sinon son `overflow:hidden` ne rogne plus le reflet (bug de la vitrine d'accueil).
- **Cinématique de fusion** : `fusionCine(id, côté)`, appelée dans `resolveTurn()` avant la Révélation d'une ultra-légendaire (1,45 s au plus, un toucher la saute). Les cartes sources viennent de `ULS[].req` (version présente dans le deck du joueur, sinon la première ; pour l'adversaire, la première). Nike : l'emblème du Jugement (SVG `EMB_SVG`) se brise. Locale, jamais jouée pendant une reprise de duel en ligne. Réglage `P.cine` (activé par défaut), dans Réglages.

## Calendrier du contenu

| Date | Contenu |
|---|---|
| 1er oct. 2026 | 1re vague, Yarden X Apsu (1re fusion) |
| 12 oct. | Halloween : paquet « Pli des Citrouilles » jusqu'au 2 nov., Médée Mariée Spectrale, Izzy Lune de Sang… Trois lieux arrivent : **Le Cirque** (fin du tour 4, les puissances sont mélangées), **Le Bureau des enchères** (cartes jouées +1 de coût et +2) et **Le Tombeau** (avancé depuis décembre). |
| 1er nov. | Vague de novembre (Nemesis, Anubis, Médée, la Voleuse…), 3 fusions. Effets revus avant sortie : Messagère d'Hécate (Continu : +2 par fin de tour si elle ne mène pas, 6 max), Médée (Continu : la prochaine carte adverse jouée ici perd 2), Aphrodite et Aphrodite X Yarden (rejouent des Révélations), Dante (+1 par destruction ici), Susanoo (déplace sa carte la plus faible, +3) |
| **15 nov.** (annonce le 10) | **Vague « énergie »** : Prométhée (L, Primordial), Pandore (E, Désir), Athéna (E), Bia (R), Styx (L), **Nike** (U de faction, Jugement) |
| 1er déc. | Vague de décembre : 17 cartes, 5 fusions, lieu Domaine du Créateur, jetons Mjölnir, Ombre, Pourceau. Le Boucher de la Riponne détruit désormais sa carte la plus faible et pioche |
| 31 déc. → 18 janv. | Paquet « Pli du Douzième Coup » (annonce le 26 déc.) : Hel Reine du Réveillon, Éos de Nouvel An, Pele du Réveillon, Qetesh du Nouvel An (toutes `ex:"nouvelan"`) + fusions Pele X Jordan du Réveillon (`ulpele_r`) et Qetesh X Jordan du Nouvel An (`ulqetjor_r`, exige `qetesh_r`) |

**Thème de la vague du 15 novembre** :
- Prométhée garde l'énergie non dépensée (10 maximum).
- Pandore la dépense (+1 de puissance par énergie).
- Bia coupe la réserve adverse.
- Styx donne +3 à Nike et à Bia, et rend ses cartes Jugement indestructibles dans son lieu.
- Nike : +2 par carte jouée avant elle ce tour. Elle se débloque avec 7 autres cartes Jugement en collection, et se joue avec 8 cartes Jugement dans le deck, elle comprise.

---

## En attente

- Musique `audio/accueil_nouvelan.mp3` (optionnelle).
- Fin octobre : faire le point sur les rangs (série de victoires) et sur Mohini. Surveiller le combo Lip Dentelle → Hel.
- Mi-novembre : surveiller le deck Jugement « énergie ». Leviers : bonus de Styx à +2, réserve de Prométhée à 6.
- Idée en suspens : ranger le journal de partie derrière un bouton.
- Idée d'effet « Ardeur » pour une future légendaire : « ta carte la plus faible ici est doublée ».
- Idées de cartes : Kratos et Zélos (autres enfants de Styx) ; une ultra-légendaire de faction pour Helvara, Désir et Primordial.
