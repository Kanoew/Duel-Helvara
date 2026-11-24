# Duel d'Helvara : mémo de reprise

Jeu de cartes web à lieux (3 lieux, 6 tours, énergie = numéro du tour, effets Révélation et Continu).
Univers et lore : ceux de Jordan (pseudo GitHub **Kanoew**). Tiamat est une présence, pas un personnage.
Réponses en **français**.

- Site : https://kanoew.github.io/Duel-Helvara/
- Dépôt : `Kanoew/Duel-Helvara`. Le site est publié depuis `main` (voir « Publier »).

---

## Où on en est

- **`docs/feuille-de-route.md`** : tout ce qui reste à faire (🟣) puis ce qui est fait (✅), les décisions qui attendent Jordan et l'ordre des chantiers jusqu'à la sortie sur itch.io. **À lire au début de chaque session de travail.**
- Le détail des arguments : `docs/analyse-competitive-avis-karina.md`.

---

## Garde-fous (permanents, ne jamais les assouplir)

Ils protègent Jordan, ses joueurs et la base en direct.

- **Ne jamais écrire d'adresse e-mail personnelle** dans le dépôt, les commits ou le code. Les commits utilisent l'adresse noreply : `git config user.email` doit afficher `333710536+Kanoew@users.noreply.github.com` (et `user.name` : `Kanoew`). Sinon, la régler avant tout commit.
- **Aucun secret dans le dépôt.** Le code secret Google OAuth reste uniquement dans Supabase. La clé de `config.js` est une clé *publishable* : elle peut rester publique.
- **Pas de nom ou d'identifiant de modèle d'IA** dans les commits ni dans le code, donc **aucune ligne `Co-Authored-By` ni `Claude-Session`** dans les messages de commit, même si l'outil le propose.
- Ne jamais réécrire l'historique ni faire de `push --force` sans accord explicite.
- **Supabase** : le projet du jeu est la base en direct (pas de projet de test). Lecture seule d'abord ; toute écriture ou migration est présentée à Jordan et validée avant d'être appliquée.
- **Aléatoire** : tout tirage qui influence une partie passe par `gPick` / `gShuffle`, jamais `Math.random` (les duels en ligne partagent le même tirage). Seuls les effets purement visuels ont leur aléatoire propre.
- **`BUILD`** : à changer à chaque modification qui touche au déroulement d'une partie (deux versions différentes ne jouent jamais ensemble).
- **Licence** : le jeu est « Tous droits réservés » (`LICENSE`). Ne jamais le présenter comme « open source » ni proposer une licence libre (AGPL, MIT, Creative Commons…) sans demande explicite de Jordan.

## Publier (décision de Jordan du 18 novembre)

- **On travaille sur une branche.** Commit en français, puis push sur la branche de travail de la session.
- **Pousser sur `main` ou ouvrir une PR : seulement si Jordan le demande explicitement.** Sinon, c'est lui qui ouvre la PR et fusionne.
- Chaque push sur `main` redéploie le site en 1 à 2 minutes : rien n'y arrive sans tests passés.
- **Si un déploiement Pages reste bloqué** (et seulement si Jordan a demandé la publication) : ne pas utiliser « Re-run ». Pousser un commit vide (`git commit --allow-empty -m "Relance de la publication GitHub Pages"`), ce qui crée un nouveau run.

## Façon de travailler avec Jordan

- Jordan prépare souvent les changements dans une autre session (brainstorm) et les apporte sous forme de fichier `.md` : le lire, vérifier qu'il est cohérent avec le code (et le dire s'il ne l'est pas), puis l'appliquer.
- **Jordan teste beaucoup sans toujours l'écrire.** Une case non cochée dans un document ne veut pas dire « pas testé » : lui demander avant de supposer.
- Toujours tester avant de livrer, et lui envoyer des captures quand il s'agit de visuel. Il teste ensuite sur son téléphone (Android, navigateur Brave) et renvoie des captures.
- Jordan n'est pas développeur : réponses claires, sans jargon, et dire franchement ce qui n'a pas été vérifié.
- Un chantier à la fois, terminé avant d'ouvrir le suivant (ordre dans `docs/feuille-de-route.md`).

## Décisions de design (Jordan peut les changer à tout moment)

Ce sont des choix de jeu, pas des lois. Les appliquer, mais les signaler si une demande les contredit, plutôt que bloquer.

- **Retoucher une carte, équilibrage** (assoupli le 18 novembre) :
  - Seuils : corriger au-delà de ±8 points d'écart (victoire en deck moins la moyenne des cartes), surveiller entre ±6 et ±8.
  - Carte **pas encore sortie** : la simulation suffit.
  - Carte **déjà sortie**, correction **légère** (±1 de coût ou de puissance, ou un chiffre de l'effet) : la simulation suffit si l'écart dépasse ±8 points.
  - Carte **déjà sortie**, **grosse refonte** de l'effet : il faut les statistiques réelles (`card_stats`, `v_taux_victoire_cartes`). Sous 100 decks, leur marge d'erreur dépasse ±10 points : les croiser avec la simulation.
- **Mots-clés de faction** (Lien, Ère, Tentation, Verdict ; décision du 18 novembre, option B) : ils peuvent être ajoutés **aussi aux cartes déjà sorties**. Chaque vague de mots-clés est mesurée avec l'outil d'équilibrage et `balance-reviewer` avant publication, et l'IA apprend à les jouer. Tentation et toute mécanique nouvelle doivent marcher en jeu **simultané** (aucun choix qui interrompt le tour en duel en ligne).
- **Classement** (18 novembre) : un seul classement à la sortie. Les parties contre l'IA y comptent (plafonnées par `board_submit`), les duels contre des humains aussi, mais seulement sur résultat validé par le serveur (les deux joueurs envoient le même). Un classement « en ligne » séparé viendra après la sortie. Plan et inventaire : `docs/anti-triche.md`.
- **Cartes qui verrouillent un lieu** (Nemesis, Cronos, Ananké) : jamais jouables au tour 6 (`banned()`, même avec l'énergie gardée par Prométhée).
- **Ultra-légendaires de faction** : elles se **gagnent en jouant** (Journal des factions), pas dans les paquets : 50 parties avec au moins 8 cartes de la faction. Une **seconde** par faction au plus, à 150 parties au total (jamais deux secondes dans la même faction). Une seule ultra-légendaire par deck. Date de sortie : le **15** du mois s'il n'y a pas d'événement, le **1er** s'il y en a un ; annonce 5 jours avant (`soon`). Exception décidée par Jordan : Nike de la Saint-Valentin sort le 14 février (quête dès le 1er).
- **Fusions** (ultra-légendaires) : elles **sortent des paquets**, plus par collection. Une fusion exige toujours ses deux personnages dans le deck (`ulOk`). Une fusion saisonnière n'existe que dans le paquet d'édition de sa saison. Taux par paquet : 100 CHF 1 %, 200 CHF 2 %, 300 CHF 4 %, éditions 5 % ; garantie à la 10e ouverture d'un paquet à 300 CHF.
- **Chronique** (24 novembre) : trois matchs contre l'IA avec le deck du joueur figé au départ ; une défaite se rejoue sans pénalité ; CHF à la première victoire de chaque match ; ni étoiles ni statistiques envoyées. Au boss, la **Loi du Trône** : le lieu du centre (Trône de Tiamat) vaut 2 lieux (`locW`, `winOdds` dans `js/moteur.js`). Données dans `CHRON` (`js/boutique-modes.js`).
- **Écran de partie fixe** (17 novembre) : le plateau ne change jamais de taille pendant une partie ; tout ce qui est passager flotte en bulle par-dessus le haut du plateau. Le tutoriel aussi (ses consignes flottent en tête) ; seul le replay garde l'ancien affichage.
- **Effets visuels** (ouverts le 18 novembre) : sur les cartes de base, `vfx` reste réservé aux légendaires et ultra-légendaires, et l'effet holo 2.5D aux ultra-légendaires de faction et à leurs variantes de fête (Nike V, Ananké Fileuse du Douzième Coup, Ananké Fil Rouge). **Les variantes d'art alternatif (cosmétiques) peuvent recevoir `vfx` ou holo quelle que soit leur rareté.**
- **Textes d'effets** (FR et EN) : « +N de puissance » **sans sujet** = la carte elle-même ; on nomme le bénéficiaire seulement pour une **autre** carte. Une perte s'écrit « perd N de puissance ».
- **Expirations au tour 6** (26 octobre) : tout effet ou jeton qui devrait expirer « à la fin du tour suivant » alors que ce tour suivant est le tour 6 expire **après** le décompte final (donc ne disparaît jamais). Vaut pour le Clone de Sun Wukong, Méduse et Konohanasakuya-Hime.
- Messages de commit en français.

## Pièges et interdits (rappel court : le détail est dans `docs/reference-technique.md`)

- **Après toute modification** d'un `.js`, `.css`, d'une image, d'une musique ou d'une icône : `node outils/versions.js`. **Après toute modification du moteur** : `node outils/tests-scenarios.js`.
- **L'ordre des balises `<script>` d'`index.html` compte** : ne pas le changer (`js/sw-register.js` reste le dernier chargé).
- **Aucune requête vers un site tiers** au chargement (pas de Google Fonts, pas de CDN). Tout nouveau service externe doit être ajouté à la **CSP** d'`index.html` et à la page de confidentialité (FR et EN). Pas de script ni de gestionnaire inline (`script-src 'self'`).
- **Le service worker ne touche jamais à Supabase** : ne pas ajouter de service externe à `sw.js`.
- **Toute nouvelle écriture** (stockage local, compte) respecte la garde `window.__wiped` (bac à sable `?date=`, suppression de compte).
- **Tout pseudo ou avatar venant de la base** est échappé (`esc`) ou filtré (`POOL.includes`).
- **Pages légales en deux langues** : les modifier ensemble. Une seule adresse e-mail publique est autorisée dans le dépôt (celle des pages légales).
- **Supabase** : ne pas relancer `nettoyage.sql` en entier (son bloc 2 vide les anonymes du classement) ; les scripts SQL sont collés par Jordan dans Supabase → SQL Editor.
- **Effet holo** : `js/holo-card.js` est le module d'origine (ne pas le réécrire) ; les dossiers `images/holo/<nom>/` viennent de la session de Jordan (ne pas les générer ici).
- **Nouvelle carte** : trois images (carte, avatar recadré à la main, miniature), sinon la grille de la collection affiche une case vide. **Exception : les jetons** (`token:true`) n'ont pas de miniature (jamais dans la collection) ; l'avatar reste nécessaire (plateau).

---

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Coquille de la page (en-tête, CSP, balises qui chargent les fichiers ci-dessous, avec `?v=<empreinte>`) |
| `jeu.css` | Tous les styles du jeu (à la racine : ses `url("images/…")` sont relatifs à la page) |
| `js/bac-a-sable.js` | Bac à sable `?date=AAAA-MM-JJ` (date simulée, toutes les cartes, rien de sauvegardé) ; **chargé avant `js/cartes.js`** ; voir « Bac à sable » |
| `js/cartes.js` | Données : `CARDS`, `LOCS`, `FAC`, `RAR` |
| `js/langue-profil.js` | Langue (`trUI`, `translateDOM`), `ULS` (fusions), `DROPS`, rangs, sauvegarde, journal des factions, classement |
| `js/sons-effets.js` | Sons, effets visuels (`FX`, `MIX`), cinématiques (fusion, faction, fin de partie) |
| `js/moteur.js` | Moteur de partie (`newGame`, `startTurn`, `cardPow`, `revealFx`, `resolveTurn`, `finish`), IA (`aiDeck`, `aiPlan`) |
| `js/boutique-modes.js` | Boutique, échoppe du jour, Blitz, Chronique, duels entre amis, file d'attente en ligne |
| `js/holo.js` + `js/holo-card.js` | Effet holo 2.5D des ultra-légendaires de faction (table `HOLO`, chargement à la demande) ; données dans `images/holo/<dossier>/` ; voir « Effet holo 2.5D » |
| `js/ouverture.js` | Ouverture de paquet « Le Tirage » (calque hors de `#app`, canvas ciel, durées dans `OUV_TIMING`) |
| `js/interface.js` | Rendu des écrans (`render`, `gameHTML`…), interactions (clics), démarrage |
| `js/sw-register.js` | Enregistrement du service worker (ex-script inline d'`index.html`, sorti pour que la CSP n'autorise plus de script inline) ; **dernier script chargé** : il lit `S`, `screen`, `packOpen`, `mq`, `myMp`, `roomC` |
| `outils/versions.js` | Met à jour les `?v=` d'`index.html` **et le bloc automatique de `sw.js`** (**à lancer après toute modification d'un .js, .css, image, musique ou icône du jeu**) |
| `manifest.json`, `icones/`, `sw.js` | Application installable (PWA) : manifeste, icônes (H doré dans un hexagone, provisoires : à remplacer par le logo de Jordan en gardant les noms), service worker |
| `outils/tests-pwa.js` | Test du service worker (caches, partie contre l'IA hors ligne, mise à jour) : `node outils/tests-pwa.js` |
| `cartes-en.js` | Traductions anglaises des cartes, lieux, factions et raretés (`window.HELVARA_EN`) |
| `interface-en.js` | Traductions anglaises de l'interface (`exact`, `rules` en regex, `NOTES` pour le journal, `DROPS`, `ULS`…) |
| `cloud.js` + `config.js` | Supabase : sauvegarde, classement, duels en temps réel, connexion Google |
| `vendor/supabase.js` | Bibliothèque Supabase en local (le CDN est bloqué) |
| `README.md` | Présentation du jeu sur GitHub (français et anglais), lien de jeu et Discord |
| `supabase.sql`, `nettoyage.sql` | Scripts à coller dans Supabase → SQL Editor (avec `classement-securise.sql`, `classement-allege.sql`, `retours-stats.sql`, `stats-adversaire.sql`, `comptes-fantomes.sql`, `file-attente.sql` : file d'attente des duels en ligne, `duels-valides.sql` : résultat des duels validé par le serveur, `classement-duels.sql` : étoiles des duels classés et plafonds ; ces trois derniers après `retours-stats.sql`, dans cet ordre) |
| `outils/equilibrage.js` | Outil d'équilibrage (IA contre IA avec le vrai moteur, hors du jeu). Il écrit `rapport-cartes.md` (complet) ou `rapport-cible.md` (`--cartes`) à la racine : **ces rapports ne sont plus versionnés** (`.gitignore`, supprimés le 14 octobre : périmés dès qu'une carte ou l'IA change, et régénérés en 10 à 50 s). Les anciennes versions restent dans l'historique git. |
| `outils/tests-bac-a-sable.js` | Test du bac à sable (le vrai profil ne bouge jamais, aucun appel au compte) : `node outils/tests-bac-a-sable.js` |
| `outils/tests-holo.js` | Test de l'effet holo (zoom, paquet, replis, destruction) : `node outils/tests-holo.js` |
| `outils/tests-duel.js` | Vrai duel en ligne entre deux navigateurs, salon simulé (coups scellés, reprise, tricheur refusé), environ 2 minutes : `node outils/tests-duel.js`. **À relancer après toute modification des duels** |
| `outils/tests-scenarios.js` | Tests de scénarios fixes (quelques secondes, `node outils/tests-scenarios.js`) : Nike + Aphrodite, Styx, Set, Prométhée + Pandore… **À relancer après toute modification du moteur** |
| `images/` | Illustrations des cartes (`<id>.webp`) |
| `images/avatars/` | Portraits carrés (`<id>.webp`) |
| `images/mini/` | Illustrations réduites pour les grilles (360 × 540) |
| `images/lieux/`, `images/packs/` | Lieux et paquets |
| `audio/` | Musiques : `accueil*`, `partie`, `partie_2`, `partie_tension` (dès le tour 5), jingles `victoire` et `defaite` |

---

## Ajouter une carte (la tâche la plus courante)

### 1. Les images (toujours deux par carte)

| Image | Format | Chemin |
|---|---|---|
| Carte | 720 × 1080, WebP qualité 80 | `images/<id>.webp` |
| Avatar | 256 × 256, WebP qualité 80, **recadré à la main sur le visage** | `images/avatars/<id>.webp` |

L'avatar sert de portrait au joueur, mais aussi de **miniature sur le plateau**. Il est donc obligatoire.

Troisième image, générée à partir de la carte : `images/mini/<id>.webp` (360 × 540, WebP qualité 80), utilisée par la collection.

- Autres formats : lieu en 800 × 597 dans `images/lieux/`, paquet en 600 × 894 dans `images/packs/`.
- Les images envoyées dans le chat arrivent en pleine résolution. Vérifier leur taille réelle avant de calculer le recadrage : l'aperçu affiché est souvent plus petit.
- Outil : `sharp` pour Node. Il n'est pas installé dans un conteneur neuf : `mkdir -p /tmp/sb && cd /tmp/sb && npm i sharp`.

```js
const sharp=require('/tmp/sb/node_modules/sharp');
await sharp(src).resize(720,1080,{fit:"cover"}).webp({quality:80}).toFile('images/<id>.webp');
await sharp(src).extract({left,top,width:c,height:c}).resize(256,256).webp({quality:80}).toFile('images/avatars/<id>.webp');
```

Toujours regarder l'avatar obtenu (le visage doit être centré, ni trop serré ni trop large) et corriger le recadrage si besoin.

### 2. Les données, dans l'objet `CARDS` de `js/cartes.js`

```js
athena:  {name:"Athéna", cost:2, pow:2, fac:"jugement", r:"E", rel:"2026-11-15", soon:"2026-11-10", fx:"Révélation : …", img:"images/athena.webp"},
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
- `node outils/versions.js` (empreintes des fichiers), puis commit en français, puis push sur la branche de travail (sur `main` seulement si Jordan le demande, voir « Publier »).
- Vérifier le déploiement : `gh api "repos/Kanoew/Duel-Helvara/actions/runs?per_page=1"`.

---

## Tests (Playwright)

- Playwright : `/opt/node-tools/node_modules/playwright`. Chromium est préinstallé, ne pas lancer `playwright install`.
- Servir le dossier avec un petit serveur HTTP Node. Remplacer `vendor/supabase.js` par un faux Supabase pour jouer sans réseau.
- Écrire les scripts de test hors du dépôt (dossier temporaire).

---

## Agents du projet (`.claude/agents/`)

Trois relecteurs. Ils **rapportent à Jordan, ils ne modifient rien** dans le dépôt ; on les lance par leur nom.

- **`balance-reviewer`** : avant de publier une carte, un changement d'effet ou une vague. Mesure et applique les règles d'équilibrage ci-dessus.
- **`playtest-qa`** : avant de dire qu'un changement du moteur, de l'interface ou d'un visuel « marche ». Lance les tests et joue le jeu sur écran de téléphone, avec captures.
- **`db-guard`** : **avant** d'appliquer tout SQL sur Supabase, de modifier `cloud.js` ou les pages de confidentialité, et pour toute nouvelle donnée collectée. N'a aucun accès à la base.

Modèle et effort de chacun : dans sa fiche (`model:`, `effort:`). `balance-reviewer` et `playtest-qa` tournent sur Sonnet, effort moyen ; `db-guard` garde le modèle de la session (`inherit`), car il protège la base en direct.

### Déléguer (autorisation permanente de Jordan, 21 novembre)

Tu peux lancer des agents **sans demander**, et choisir leur modèle et leur effort, selon la tâche :

| Tâche | Agent | Modèle | Effort |
|---|---|---|---|
| Trouver où est un truc dans le code, relecture mécanique (textes FR / EN, liste de cartes) | `Explore` ou `general-purpose` | Haiku | bas |
| Mesure d'équilibrage, tests, parties jouées avec captures | `balance-reviewer`, `playtest-qa` | Sonnet (fiche) | moyen (fiche) |
| Petit code isolé et bien décrit (un écran, un outil hors du jeu) | `general-purpose` | Sonnet | moyen |
| Moteur, IA, duels en ligne, Supabase, décisions de design | **personne** : la session principale | — | — |

- Un agent repart de zéro à chaque lancement : déléguer les tâches longues (mesures, tests), pas une petite modification plus rapide à faire soi-même.
- Plusieurs agents indépendants peuvent tourner en même temps (par exemple une mesure pendant qu'on code).
- Un agent qui modifie le dépôt travaille sur une copie isolée (`isolation: worktree`) ; la session principale relit et fusionne.
- Le rapport d'un agent ne s'affiche pas chez Jordan : lui en résumer l'essentiel, chiffres compris.

## Entretenir ce fichier

Ce fichier est lu en entier à chaque session : il doit rester **court** (objectif : moins de 250 lignes). Y mettre seulement ce qui est vrai **en permanence** : garde-fous, décisions de design, procédures, pièges.

- Les décisions datées, mesures avant/après, compteurs de tests et numéros de `BUILD` vont dans `docs/historique-equilibrage.md`, **pas ici**.
- Une règle devenue permanente rejoint « Décisions de design » (ou « Garde-fous » si elle protège les joueurs, la base ou le dépôt) ; on supprime alors son ancienne mention datée.
- Quand une décision de design change, mettre à jour la ligne et sa date ici, et cocher la case correspondante de `docs/feuille-de-route.md`.
- Une nouvelle zone technique à documenter va dans `docs/reference-technique.md`.
- L'état actuel d'une carte (coût, puissance, effet, dates) est dans `js/cartes.js` : en cas d'écart avec un document, **le code fait foi**.

## Où trouver le détail (à lire seulement quand la tâche le demande)

- `docs/reference-technique.md` : repères du moteur, IA, quêtes, musique, sauvegarde, classement, duels en ligne, raretés et brillance, cinématiques, légal et CSP, performances sur téléphone, écran de partie, retours et statistiques, outil d'équilibrage, collection, accueil, journal des factions, holo 2.5D, bac à sable, durcissement, textes d'effets, optimisation et PWA.
- `docs/historique-equilibrage.md` : décisions d'équilibrage série par série (1re à 28e), secondes ultra-légendaires, fusions dans les paquets. Archive datée : avant de toucher une carte, `grep -n "<id>"` dans ce fichier pour retrouver pourquoi elle est comme elle est.
- `docs/calendrier-et-en-attente.md` : calendrier de sortie, thème de la vague du 15 novembre, cartes cachées et valeurs provisoires, questions restées ouvertes.
