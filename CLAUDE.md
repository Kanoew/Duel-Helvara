# Duel d'Helvara : mémo de reprise

Jeu de cartes web à lieux (3 lieux, 6 tours, énergie = numéro du tour, effets Révélation et Continu).
Univers et lore : ceux de Jordan (pseudo GitHub **Kanoew**). Tiamat est une présence, pas un personnage.
Réponses en **français**.

- Site : https://kanoew.github.io/Duel-Helvara/
- Dépôt : `Kanoew/Duel-Helvara`, branche `main`. Chaque push sur `main` redéploie GitHub Pages en 1 à 2 minutes.

---

## Règles à respecter absolument

- **Ne jamais écrire d'adresse e-mail personnelle** dans le dépôt, les commits ou le code. Les commits utilisent l'adresse noreply déjà réglée : `git config user.email` doit afficher `333710536+Kanoew@users.noreply.github.com`. Sinon, la régler avant tout commit.
- **Aucun secret dans le dépôt.** Le code secret Google OAuth reste uniquement dans Supabase. La clé de `config.js` est une clé *publishable* : elle peut rester publique.
- **Pas de nom ou d'identifiant de modèle d'IA** dans les commits ni dans le code, donc **aucune ligne `Co-Authored-By` ni `Claude-Session`** dans les messages de commit, même si l'outil le propose.
- Messages de commit en français.
- **Pour changer un effet, modifier en priorité une carte pas encore sortie.**
- Ne jamais réécrire l'historique ni faire de `push --force` sans accord explicite.
- **Si un déploiement Pages reste bloqué**, ne pas utiliser « Re-run ». Pousser un commit vide (`git commit --allow-empty -m "Relance de la publication GitHub Pages"`), ce qui crée un nouveau run.

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
| `js/boutique-modes.js` | Boutique, échoppe du jour, Blitz, duels entre amis, file d'attente en ligne |
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
| `supabase.sql`, `nettoyage.sql` | Scripts à coller dans Supabase → SQL Editor |
| `outils/equilibrage.js` | Outil d'équilibrage (IA contre IA avec le vrai moteur, hors du jeu). Il écrit `rapport-cartes.md` (complet) ou `rapport-cible.md` (`--cartes`) à la racine : **ces rapports ne sont plus versionnés** (`.gitignore`, supprimés le 14 octobre : périmés dès qu'une carte ou l'IA change, et régénérés en 10 à 50 s). Les anciennes versions restent dans l'historique git. |
| `outils/tests-bac-a-sable.js` | Test du bac à sable (le vrai profil ne bouge jamais, aucun appel au compte) : `node outils/tests-bac-a-sable.js` |
| `outils/tests-holo.js` | Test de l'effet holo (zoom, paquet, replis, destruction) : `node outils/tests-holo.js` |
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
- `node outils/versions.js` (empreintes des fichiers), puis commit en français, puis `git push origin main`.
- Vérifier le déploiement : `gh api "repos/Kanoew/Duel-Helvara/actions/runs?per_page=1"`.

---

## Repères du moteur (`js/moteur.js`, sauf mention)

- **Découpage de `index.html` (12 octobre 2026, audit étape 6)** : l'ancien fichier unique (372 Ko) est coupé en fichiers **sans aucun changement de code**. Les `js/*.js` sont des scripts classiques chargés dans l'ordre d'`index.html` : ils partagent la même portée globale (un `const`, un `let` ou une `function` d'un fichier est visible des suivants). **L'ordre des balises compte** : ne pas le changer. Vérifié le jour du découpage : le texte des fichiers est le script d'origine à l'octet près, le DOM de 37 écrans (FR et EN, saison Halloween) est identique à celui de l'ancienne version, et 600 parties IA contre IA avec la même graine donnent exactement les mêmes résultats.
- **Après toute modification** d'un fichier `.js` ou `.css` : `node outils/versions.js` (sinon un navigateur peut garder un ancien fichier en cache et le mélanger avec un nouveau) ; `node outils/versions.js --verifier` contrôle sans rien changer.
- **Tests** : le faux Supabase se branche avec `page.route("**/vendor/supabase.js*", …)` (avec l'étoile finale : l'adresse porte maintenant `?v=…`).

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
- **Vitrine de l'accueil** (`vitrineHTML`, `fanRotate`) : les cartes suivent le doigt pendant le geste (`fanSet`, positions `FAN_SLOT`, la carte qui fait le tour passe derrière par `FAN_MID`), puis finissent le trajet par Web Animations (`fanFinish`) avant que la rotation soit enregistrée ; toucher une carte de côté fait le même glissement (`fanSlide`). Geste trop court : retour en place. Mouvement réduit : rotation directe.
- **Discord** : `DISCORD` (lien d'invitation), bouton dans l'en-tête à côté des quêtes, hors écran de partie seulement.
- **Langue** : `trUI()` et `translateDOM()`. Le texte est écrit en français dans le code, puis traduit à l'affichage.

---

## Tests (Playwright)

- Playwright : `/opt/node-tools/node_modules/playwright`. Chromium est préinstallé, ne pas lancer `playwright install`.
- Servir le dossier avec un petit serveur HTTP Node. Remplacer `vendor/supabase.js` par un faux Supabase pour jouer sans réseau.
- Écrire les scripts de test hors du dépôt (dossier temporaire).

---

## IA, quêtes, musique

- **IA (`aiPlan(me="e", palier)`)** : énumère les combinaisons de la main qui tiennent dans l'énergie (128 au plus), estime la probabilité de gagner 2 lieux sur 3, puis rejoue pour de vrai les meilleures sur une copie de la partie (`structuredClone(S)`, son coupé par `quiet`) avant de choisir. Bruit par palier ; simulation complète dès le palier 4 (40 plans au plus). Synergies dans `AI_PAIRS` (préparatrice → cartes qui en profitent). `aiDeck()` amène les partenaires de synergie et, dès le palier 4, une ultra-légendaire si le deck en remplit les conditions. Mesure (300 parties par duel) : le palier 5 gagne environ 65 % contre l'ancienne IA et 67 % contre le palier 0 ; 26 ms au plus par tour.
- **Quêtes** : 2 par jour (une petite `small`, une grande), tirées dans `QDEF` parmi celles que le joueur peut remplir (`QOK`). `facwin` et `charwin` portent un paramètre `x` (faction ou personnage). Un changement par jour (`P.q.rr`). Quête de la semaine `WQ` dans `P.wq` (lundi → dimanche). Compteurs seulement si `qLive()` (hors tutoriel, simulation de l'IA et reprise de duel).
- **Musique** : `music()` choisit la piste (`musicKey()`). Chaque morceau est décodé une fois (`mBuf`, 2 au plus en mémoire, hors morceaux en cours de lecture) et joué par Web Audio (`AudioBufferSourceNode`, plus d'élément `<audio>` sauf en repli) : boucle sans coupure, en sautant le silence du début et de la fin (`mEdges`, `loopStart`/`loopEnd`). Fondus par `GainNode` (`mTrack`, `mPlay`, `mPause`, `mRamp`, `mStop`), deux morceaux au plus ; la tension est préchargée au tour 4. `endMusic(res)` : le morceau de la partie s'efface en 1 s et se met en pause (`bgmHold`), jingle, puis **le même morceau reprend là où il était**, en fondu de 2,5 s (`endKey`) ; l'accueil ne revient qu'en quittant l'écran de partie. Sur une égalité, le morceau continue. Volumes `P.vm` (musique, défaut 35) et `P.vs` (effets, défaut 100, bus `sfxBus()`). Pour retirer le silence de fin d'un morceau : `ffmpeg -i in.mp3 -af "areverse,silenceremove=start_periods=1:start_threshold=-45dB,afade=t=in:st=0:d=0.03,areverse" -b:a 192k out.mp3` (le fondu se place pendant l'inversion, sinon tout le morceau devient muet).

- **Sauvegarde** : `save()` écrit tout de suite en local (avec `P.at`, heure de la modification) puis envoie au compte 0,5 s plus tard (`flush`). Un envoi raté est retenté (3 s, puis jusqu'à 60 s) et renvoyé dès que la page se cache. Au chargement (`initStore`), la sauvegarde locale l'emporte sur celle du compte seulement si elle est plus récente **et** appartient au même joueur (`OWNER_KEY` = `duel-helvara-save-owner`) ; sinon le compte gagne. Corrige le bug du 9 octobre (booster perdu et CHF rendus après un retour arrière : l'envoi au compte avait échoué et la vieille sauvegarde en ligne écrasait la locale).

- **Classement** : table `board` (une ligne par joueur, chacun n'écrit que la sienne). `lbPublish()` envoie la ligne après chaque partie classée contre l'IA, au chargement, et après un changement de pseudo ou d'avatar ; un envoi raté est retenté (5 s, puis jusqu'à 2 min) et renvoyé au retour au premier plan. L'affichage (`boardHTML`) mélange la table et la présence en direct du salon (« en ligne »). `cloud.js` relit la table au retour au premier plan et toutes les 60 s. Corrigé le 10 octobre : avant, un seul envoi raté (session expirée au réveil du téléphone) coupait les mises à jour jusqu'au rechargement ; le relais hérité des artefacts (`lbRelay`, qui écrivait la ligne des autres) a été retiré.

- **Classement sécurisé (12 octobre, audit étape 1)** : les joueurs n'ont plus aucun droit d'écriture sur `board` (policies insert/update retirées, `revoke`). `lbPublish()` → `doc("board/…").set()` de `cloud.js` appelle la fonction SQL `board_submit` (fichier `classement-securise.sql`, à coller dans Supabase par Jordan, après `supabase.sql`) : `security definer`, identité = `auth.uid()`, 1 partie/minute (réserve de 10, 200/jour), au plus +4 étoiles par victoire, compteurs jamais en baisse, pseudo et avatar nettoyés, changement de saison recalculé comme `checkSeason()`. Une annonce trop forte est **réduite** à ce qui est plausible (pas de refus : le reste se rattrape aux parties suivantes). Table privée `board_guard` (réserve et plafond du jour). **Transition** : si la fonction n'existe pas encore (`PGRST202`), `cloud.js` écrit comme avant ; après le SQL, un refus ne bascule jamais sur l'écriture directe. `supabase.sql` ne recrée plus les droits d'écriture. **La présence du salon ne porte plus de chiffres** (`lb:{uid}`) et `boardHTML` n'en tire que « en ligne » : avant, un joueur pouvait y diffuser de faux rangs, même sous le pseudo d'un autre. Les joueurs sans compte enregistré n'apparaissent donc plus chez les autres. Reste falsifiable : le serveur ne peut pas savoir si une partie a vraiment eu lieu (un script patient peut envoyer ~1 victoire par minute par compte), paquets et collection sont tirés dans le navigateur.
- **Lecture du classement allégée (12 octobre, audit étape 2)** : `lbRefresh()` appelle `boardTop` (`cloud.js`) → fonction SQL `board_top` (`classement-allege.sql`, à coller dans Supabase après `classement-securise.sql`) : 100 meilleurs de la saison + 30 du mois précédent + ta ligne, triés par la base (index `board_rang_idx`). Relecture au chargement, au retour au premier plan et en ouvrant l'accueil ou le classement, au plus toutes les 30 s ; **plus de temps réel ni de relecture toutes les 60 s** (l'ancien `collection().onSnapshot` est supprimé). Le badge « en ligne » est devenu « actif » (ligne mise à jour par le serveur dans les 10 dernières minutes). Tant que `board_top` n'existe pas, `cloud.js` lit les 200 dernières lignes.
- **Comptes fantômes** : `comptes-fantomes.sql` (tâche pg_cron `helvara-fantomes`, chaque nuit à 3 h 30 UTC) supprime les comptes anonymes sans aucune partie terminée et inactifs depuis 14 jours. Ne pas relancer `nettoyage.sql` en entier pour ça (le bloc 2 vide les anonymes du classement). Protection anti-robot (captcha) : pas encore intégrée au jeu (voir la proposition faite à Jordan : un service tiers, donc page de confidentialité et CSP à mettre à jour).
- **Duels en ligne** (section « DUEL ENTRE AMIS » de `js/boutique-modes.js`) : un canal de présence Supabase **par code de salon** (`helvara-room-<CODE>`, ouvert seulement pour un duel : `roomC`, `rtOpen("c",…)`) et un canal de **file d'attente** `helvara-queue` (`roomQ`, ouvert seulement pendant la recherche). Plus aucune connexion en direct pour qui joue contre l'IA ou regarde le classement (le salon commun `helvara-salon` est supprimé : tout le monde y recevait la présence de tout le monde). Déroulement identique chez les deux joueurs (lockstep, tirage partagé). Salon avec code : `mpCreate`, `mpJoin` → `mpJoinCode(code)` (async : ouvrent le canal puis publient). `cloud.js` : `claude.use("room:<canal>")` renvoie un salon avec `leave()`. L'invité rejoint le salon avant de quitter la file (sinon l'hôte croit qu'il est parti). **`BUILD`** (ex. `alpha-0.1`) est publié dans `mpBase()` et dans la file : deux versions différentes ne lancent jamais de match (« Version différente : recharge la page »). **Changer `BUILD` à chaque modification qui touche au déroulement d'une partie.**
- **En ligne (Alpha)**, appariement sans code : `mqStart` publie `q={tok,ver,at}` dans `helvara-queue` ; `mqTick` trie les jetons de même version (hors cet onglet, ce compte et les joueurs déjà appariés) et apparie 0-1, 2-3… Le plus petit crée un salon (`mpCreate`) et publie `q.room` + `q.with` ; l'autre rejoint (`mpJoinCode`). Puis `q` est vidé. Hôte sans invité au bout de 15 s : il relance la recherche. 90 s sans adversaire : arrêt et message. Mêmes règles que le salon : CHF et quêtes, pas de rang.

**Obtention des fusions : voir « Fusions dans les paquets » (12 octobre) : elles sortent des paquets, plus par collection.** **Règle des fusions (Jordan, 10 octobre)** : une fusion de base n'exige que les cartes de base ; une variante saisonnière n'ouvre pas la fusion de base. Une fusion saisonnière (`ulqetjor_r`, `ulpele_r`, `ulqetjor_v`…) exige la variante. Jordan et Jordan le Narrateur restent interchangeables. Il faut donc être là pendant la saison. Dans `ULS`, ne mettre une variante dans un `req` que si la fusion est elle-même saisonnière.

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
| Ultra-légendaire | reflet holo + ambiance en boucle | effet `vfx` + cinématique de fusion (vraies fusions) ou effet de pose de faction (Nike) |

- Le liseré est un `outline` (une ombre intérieure passerait sous l'illustration). Plateau (miniatures) : liseré seul, sans animation. Grilles (collection, boutique) : halo épique fixe, pas de reflet sur les rares, souffle des légendaires réservé au grand format. `prefers-reduced-motion` coupe tout.
- Une carte `.full` doit rester positionnée (`relative` ou `absolute`) : sinon son `overflow:hidden` ne rogne plus le reflet (bug de la vitrine d'accueil). Dans la vitrine (`.fan .fcard .full`), remettre aussi `left` et `top` à `auto`, sinon la règle `.fan .full` décale les cartes.
- **Cinématique de fusion** : `fusionCine(id, côté)`, appelée dans `resolveTurn()` avant la Révélation d'une ultra-légendaire de **fusion** seulement (entrée `ULS` avec des `req`) : 1,45 s au plus, un toucher la saute. Les cartes sources viennent de `ULS[].req` (version présente dans le deck du joueur, sinon la première ; pour l'adversaire, la première).
- **Ultra-légendaires de faction** (`ULof(id).fac`) : jamais présentées comme une fusion (`rarN(id)` affiche « Ultra-légendaire de faction »). Leur effet de pose passe par `factionCine(id, côté, lieu)`, qui appelle `FACTION_CINE[id]`. Nike : `nikeCine`, « Les plumes de la Victoire » (une plume dorée par carte posée avant elle ce tour, d'après `S.turnPlays`, compteur +2 par plume, puis ailes et laurier ; ailes à moitié ouvertes et pâles si elle est jouée en premier). Dessin `nike_feathers` dans `FX`, 1,5 s au plus, un toucher la saute. Les futures ultra-légendaires de faction (Helvara, Désir, Primordial) ajouteront leur entrée dans `FACTION_CINE`.
- Les deux cinématiques de cartes sont locales, jamais jouées pendant une reprise de duel en ligne, et suivent le réglage `P.cine` (activé par défaut, dans Réglages). Coupé ou mouvement réduit : Nike affiche seulement son compteur final, 0,8 s.
- **Cinématique de fin de partie** : `endCine(S.over)`, appelée juste avant `endMusic(res)` aux trois endroits où une partie se termine ; elle passe avant le panneau de résultat (`o.hold=true` le retient, `release()` le libère, sinon il s’affiche directement). Entièrement codée (une toile + CSS `.endcine`), un toucher la saute, le réglage « Cinématiques » (`P.cine`, ex-« Cinématique de fusion ») la coupe, tout comme le mouvement réduit ou le tutoriel. Aléatoire propre (`Math.random`), sans effet sur les duels en ligne.
  - **Victoire** (2,7 s) : écran assombri, colonne de lumière dorée sur chaque lieu gagné (`.loc.ecwon`), titre qui tombe dans une gerbe d'or sous des rayons tournants, paillettes. Son `ecwin`.
  - **Défaite** (3 s) : plateau figé en gris, fissures qui partent du centre, lieux perdus qui tremblent et s'affaissent (`.loc.eclost`), cendres et braises. Son `eclose`.
  - **Égalité** (2,4 s) : un front bleu et un front violet se heurtent au centre. Son `ecdraw`.
  - Le titre suit la saison (`SEASON[se].win/lose`), le sous-titre donne les lieux et, en cas de départage, la puissance totale. Les sons se posent sous les jingles de fin, ils ne les remplacent pas. Les miniatures du plateau portent `data-cu` (uid de la carte) pour que les effets les retrouvent.

## Légal et données (11 octobre)

- Pages (liées depuis Réglages, selon la langue) : `LICENSE` : tous droits réservés, sauf `vendor/` (MIT) et `fonts/` (OFL).
- **Aucune requête vers un site tiers** au chargement (polices dans `fonts/`, plus de Google Fonts). Ne pas en réintroduire sans mettre à jour la page de confidentialité.
- Réglages : « Exporter mes données » (`gexport`) et « Supprimer mon compte » (`gdelete` → `helvara.deleteAccount()` dans `cloud.js` → fonction SQL `delete_my_account()` de `supabase.sql`, puis `window.__wiped` empêche toute réécriture locale avant le rechargement).
- Les pseudos et avatars venant de la base sont échappés (`esc`) ou filtrés (`POOL.includes`) partout ; garder ce réflexe pour tout nouvel affichage.
- Durées annoncées : 12 mois (anonyme), 24 mois (Google) ; appliquées par `nettoyage.sql` (bloc 3), à lancer ou planifier par Jordan.
- Contact public (accord de Jordan, 11 octobre) : une seule adresse dédiée, celle des pages légales. C'est la seule adresse autorisée dans le dépôt ; ne jamais écrire son adresse personnelle principale, et garder l'adresse noreply pour les commits.
- Pages légales en deux langues : `confidentialite.html`/`privacy.html`, `conditions.html`/`terms.html`, `credits.html`/`credits-en.html`. Les modifier toutes les deux ensemble. Supabase est en Irlande (eu-west-1) ; images et musiques générées par IA (musiques via Gemini).

- **CSP** : balise `<meta http-equiv="Content-Security-Policy">` dans `index.html` (dans le premier `<head>`, celui de la ligne 1 : un meta placé après est ignoré). Autorise `'self'`, `'unsafe-inline'` (le jeu charge ses fichiers `js/` et `jeu.css` depuis le site lui-même, mais l'interface écrit encore des attributs `style` en ligne ; `script-src` est **resserré à `'self'` depuis le 14 octobre** : plus aucun script ni gestionnaire inline, `'unsafe-inline'` ne reste que pour `style-src`), et seulement le projet Supabase pour `connect-src`. Tout nouveau service externe (API, police, image distante) doit être ajouté à cette liste, sinon il sera bloqué. À vérifier en vrai : connexion Google et salon en direct.
- **Historique** : 20 parties (`HIST_MAX`), détail par lieu, cartes, gain, rang ; écran `hist` depuis le profil ; assaini au chargement par `cleanHist`.
- **Ouverture de paquet « Le Tirage »** (`js/ouverture.js`, remplace l'ancien `packOpenHTML()` et ses deux effets retournement/sceau ; 12 octobre 2026, d'après le prototype de Jordan) : `buyPack()` (boutique) ajoute les cartes, sauvegarde, puis appelle `ouvrirTirage({res,name,img,pid,price})`. Le calque `#tirage` est monté **hors de `#app`** (render() réécrit `#app`) ; `packOpen` reste non nul tant qu'il est ouvert (le journal des fusions attend). 4 phases par carte : Attente, Tension, Révélation, Récompense ; **toutes les durées sont dans l'unique objet `OUV_TIMING`** (C 220/0/300/450, R 240/380/380/800, E 300/650/400/1000, L 380/1250/450/jusqu'au toucher, U 800/2300/550/jusqu'au toucher), les sous-étapes de la tension en sont des parts. Le **dos** trahit la rareté (halos flous `.t-slot.h-R/E/L/U`, nébuleuse dans le dos des L et U, tremblement des U). Ciel : nébuleuse (sprites additifs) + galaxie spirale inclinée (y × 0,58) qui s'enroule pendant la tension, supernova à la révélation (étoiles en traînées, onde, étincelles à 4 branches) ; **faux arrêt de l'Ultra** (tout se fige 450 ms avant l'explosion). Commune/Rare/Épique repartent seules dans l'éventail ; Légendaire/Ultra attendent le toucher. **Passer** (bouton en haut à droite, ou Échap) retourne tout sans animation, puis récapitulatif (« Nouvelle » / « Doublon +X ») et « Ouvrir un autre paquet » (`packBuyable(pk)`, même règle que le bouton de la boutique) ou « Continuer ». Paquet de 12 (Première Brûlure) : grille 4 × 3. `prefers-reduced-motion` : durées × 0,25, pas de secousses, moins de particules. Canvas : `devicePixelRatio` plafonné à 2, une boucle `requestAnimationFrame` par canvas arrêtée quand il n'y a plus rien à dessiner. **Piège** : une animation `fill:"forwards"` empilée sur la même propriété peut être retirée par le navigateur et laisser un faux état (bandeau resté visible) : les éléments qui doivent disparaître (bandeau, badge, voile) utilisent `commit:true` (état final écrit en style, animation retirée). Les ultra-légendaires sont gérées par l'animation (tension de 2,3 s) mais n'entrent pas encore dans les paquets.

## Performances sur téléphone (12 octobre)

- **Particules saisonnières** (`html[data-season] body::after`) : animées par `transform` (calque déplacé), jamais par `background-position` (qui repeignait tout l'écran à chaque image : l'accueil tombait de 60 à 45 images/s pendant Halloween).
- **Grilles** (collection, codex) : `content-visibility:auto` sur chaque carte (hors écran = ni dessinée ni décodée), pas de reflet, de poussières ni de holo animé, pas de flou sur les cartes « Bientôt ». Illustrations réduites `images/mini/<fichier>.webp` (360 × 540, WebP qualité 80) via `gridArt(()=>…)` qui active `ART_MINI` pendant le rendu. **Chaque nouvelle carte doit aussi avoir sa miniature** (`sharp(src).resize(360,540,{fit:"cover"}).webp({quality:80})`), sinon la grille affichera une case vide.
- Mesure de référence (Chromium, téléphone simulé, processeur ralenti ×6) : accueil 60 images/s, collection au repos 60, défilement ~47.

## Écran de partie sur téléphone (12 octobre, audit étape 3 ; testé en 390 × 844 et 360 × 740)

- **La main reste entièrement visible** : `.handdock` (encadré d'info + main) est `position:sticky; bottom:0` ; si le reste de l'écran est trop haut, la main se colle au bas de la fenêtre au lieu d'être coupée.
- **Encadré « À toi, … »** (`infoHTML`, cas sans sélection) : affiché seulement pendant les 3 premières parties (`P.w+P.l+P.d<3`, jamais pendant le tutoriel qui a son encadré « Partie guidée »), ou à la demande : le bouton **« ? » en partie** bascule `S.help` (il ne quitte plus la partie ; le lien « Règles complètes » de l'encadré ouvre l'écran des règles). Sans contenu, la boîte `.info` n'est pas rendue.
- **En-tête sur une ligne** : « Tour / énergie / Serment / Fin du tour » ne passent jamais à la ligne (`nowrap`, bouton limité à 46 % de la largeur). « prochaine carte −N » et « +N au prochain tour » ont leur propre ligne (`.mods`).
- **Tutoriel** : « Fin du tour » est grisé (`.endbtn.wait`, `aria-disabled`) tant que l'étape n'est pas faite ; le toucher affiche dans l'encadré « Pas encore : pose d'abord <carte> (<lieu>)… » (`S.nudge`, remis à zéro à chaque tour).

## Retours des joueurs et statistiques de cartes (12 octobre, audit étape 4)

- **SQL** : `retours-stats.sql` (à coller dans Supabase après `classement-securise.sql`) : tables `card_stats` (jour, carte, mode `ia|blitz|duel`, lieu, résultat, compteur), `feedback` (type `up|down|unfair`, carte, mode, version) et `usage_guard` (limiteur de rythme par compte, sans contenu). **Aucun identifiant de compte ni pseudo dans `card_stats` et `feedback`** : elles sont anonymes (donc non supprimables une par une). Les joueurs n'ont aucun droit direct dessus : fonctions `stats_submit` (1 partie/45 s, réserve de 5, 150/jour) et `feedback_submit` (1/20 s, réserve de 3, 30/jour, 3000/heure au total).
- **Jeu** : `S.played` (carte, lieu) est rempli dans `resolveTurn()` ; `statsSend()` (début de `pushHist`, donc fin de partie IA, Blitz ou duel ; jamais tutoriel, simulation ni reprise : `qLive()`) appelle `db.stats` ; `fbHTML()`/`fbSend()` affichent dans le panneau de résultat « Cette partie t'a plu ? 👍 👎 Une carte m'a paru injuste » (liste des cartes vues dans la partie), une seule réponse par partie, appelant `db.feedback`. Envoi sans nouvel essai (les statistiques sont au mieux). Rien n'est envoyé sans compte enregistré (`lbDb`).
- **Lecture par Jordan** : vues `v_taux_victoire_cartes` (avec écart à la moyenne), `v_taux_victoire_par_mode`, `v_taux_victoire_par_lieu`, `v_cartes_signalees`, `v_retours_par_jour`, dans Supabase → Table Editor → schéma `public` (les cartes y sont désignées par leur identifiant).
- **Confidentialité** : `confidentialite.html` et `privacy.html` mises à jour (retours, statistiques, compteur technique, canaux en direct à la place du salon commun, comptes anonymes sans partie supprimés après 14 jours).
- **Piège corrigé** : la main collante (`.handdock`) est sous les voiles (`z-index` 3 contre 5) ; avec 6 elle passait par-dessus le panneau de résultat.

## Outil d'équilibrage (12 octobre, audit étape 5)

- **Lancer** : `node outils/equilibrage.js` (2000 parties par défaut, ~10 s) ou `--parties 6000` ; options dans l'en-tête du script (`--palier`, `--date`, `--inclure-cachees`, `--graine`, `--ouvriers`, `--sortie`, `--brut`). Écrit `rapport-cartes.md` à la racine (non versionné). Nécessite Playwright et Chromium (voir Tests).
- **Principe** : charge `index.html` dans Chromium sans réseau (faux Supabase) et fait jouer `aiPlan("p")` contre `aiPlan("e")` avec le vrai moteur (`newGame`, `resolveTurn`, `finish`). Seuls l'affichage, le son et la sauvegarde sont neutralisés (`render`, `sfx`, `save`, `pushHist`, `qProg`…). **Rien du moteur n'est recopié** : si le moteur change, l'outil suit. Le deck adverse passe par un `aiDeck` remplacé le temps de `newGame()`.
- **Decks** : tirés au hasard avec les règles du jeu (une version par personnage, une seule ultra-légendaire dont les conditions sont remplies), faction dominante, courbe de coûts raisonnable ; 1 sur 4 vient d'`aiDeck(palier, true)`. **Reproductible** : une graine par partie (`--graine`), mêmes parties quel que soit le nombre d'ouvriers (testé : 400 parties identiques avec 2 et 3 ouvriers). Pour rester reproductible, chaque partie remet `RNG`, `P.lv`, `P.streak`… à un état fixe.
- **Rapport** : santé du moteur (erreurs, puissances NaN, erreurs de console), répartition rareté × coût (toutes les cartes, sorties, pas sorties), statistiques par carte (victoire en deck et posée, taux de pose, puissance de fin, survie, tour de pose), victoire par coût, rareté et faction, liste de TOUTES les cartes pas encore sorties avec leurs valeurs provisoires, effets qui se ressemblent (familles, formulations presque identiques, même cible). **Ne propose aucun chiffre.**
- **Limites à garder en tête** : c'est de l'IA contre IA, donc une carte qui demande une combinaison (Hel, Hadès…) peut paraître faible parce que l'IA la pose peu ; le tirage de decks n'est pas celui des joueurs ; sous 100 decks, marge d'erreur > ±10 points.
- Première mesure (6000 parties, palier 5) : aucune erreur ; le camp qui révèle en premier gagne 48,9 % ; victoire par rareté 48,9 à 55 % (ultra-légendaires 55 %), par faction 48,2 à 52 % (Jugement en tête).

## Collection et construction de deck (13 octobre 2026, d'après les retours de joueurs)

Écran Collection = constructeur de deck (`deckHTML`). Retours de Jojo et Victor (nouveaux joueurs) : toucher une carte du deck la **retirait** sans la montrer ; le deck sortait de l'écran quand on faisait défiler ; pas de recherche.
- **Toucher = lire** : toucher une carte de la collection, de la rangée du deck ou du mini-deck ouvre la carte en grand (`zoomHTML`) avec l'état (« Dans ton deck · N/12 ») et un bouton **Ajouter au deck / Retirer du deck** (action `toggle`, les messages d'erreur du deck s'y affichent). Le petit bouton **« + Deck » / « ✓ Deck »** sur chaque carte (`.qadd`) ajoute ou retire d'un geste. L'ancienne action `deckout` est supprimée. Une carte de la grille est un `div.pick` (bouton de lecture `.pickmain` + `.qadd`), pas un bouton imbriqué.
- **Barre collée en haut** (`.collbar2`, `position:sticky`) pendant qu'on fait défiler : mini-deck de 12 cases (`deckMiniHTML`, toucher = lire) + compteur, champ de **recherche par mot-clé** et bouton **Filtrer**.
- **Recherche** (`searchOK`, `normQ`) : tous les mots doivent se trouver dans le nom, l'effet, la faction, la rareté, le coût ou la puissance, sans accents ni majuscules. Seule la grille est redessinée à la frappe (`#collgrid`, `#collinfo`, anti-rebond 140 ms) pour garder le clavier.
- **Filtrer** (`filtHTML`, comme dans un tableur) : le bouton ouvre un panneau avec faction (`deckFilter`), coût 0 à 6+ (`costFilter`), rareté C/R/E/L/Ultra (`rarFilter`) et possession Toutes/Possédées/Manquantes (`ownFilter`), qui se combinent ; le bouton affiche le nombre de filtres (« Filtrer · 2 ») ; « Voir N cartes » ferme, « Réinitialiser » remet tout (recherche comprise). Prédicat unique : `collMatch(id)`. Les filtres vivent le temps de la session (variables de `sons-effets.js`).
- **Tutoriel** : l'écran d'accueil du tutoriel explique l'énergie (« au tour N, tu as N énergie, elle ne se cumule pas »), l'origine des lieux (univers d'Helvara, inspiré de Lausanne : **formulation à faire confirmer par Jordan**) et Révélation / Continu ; les étapes 1 et 2 le rappellent ; les règles aussi.
- Testés dans `outils/tests-scenarios.js` (panneau, mini-deck, lecture avant ajout, `+ Deck`, recherche sans accents).

## Accueil : bandeau de saison → paquet d'édition (12 octobre 2026)

Le bouton du bandeau de saison (« Ouvrir le Pli des Citrouilles », de l'Étoile, du Douzième Coup) ne mène plus à la boutique en vrac : `data-act="seasonpack"` (`data-pid` = identifiant de la saison = identifiant du paquet d'édition, donc **toute future saison/paquet d'édition marche sans code en plus** si son id de `SEASON` est celui de son paquet) ouvre la boutique avec **le paquet en tête de liste et surligné** (`packFocus`, remis à zéro par le menu). Testé dans `outils/tests-scenarios.js` et aux 4 dates (Halloween, hors saison, Noël, Nouvel An).

## Décors saisonniers de l'accueil

- `seasonDeco("fan"|"bar")` : Halloween = toiles d'araignée dans les coins de la vitrine (derrière les cartes), araignée qui se balance (devant), deux citrouilles qui luisent posées sur le bandeau de saison ; Noël = guirlande lumineuse sur la vitrine et houx sur le bandeau ; Nouvel An = guirlande dorée. Dessins SVG intégrés, animations par transform/opacité, coupées par `prefers-reduced-motion`.
- En-tête : le nom de la saison est une 2e ligne sous « Le Sang de Tiamat » (`small.ssub`), les boutons restent à droite (`.top` en `nowrap`).

## Journal des factions (12 octobre)

- Les ultra-légendaires de faction se **gagnent en jouant**, pas en collectionnant : entrée `ULS` avec `quest:{k,n}` (`nike` : `jugement`, 50 ; `nike_v` : `nikev`, 25). `ulEarned(u)` décide du déblocage (fenêtre `ulHTML`, bouton `ulclaim`) ; `ulOk(u,deck)` reste la règle de deck (8 cartes de la faction).
- Compteurs `P.fj` (`helvara`, `primordial`, `desir`, `jugement`, `nikev`), incrémentés par `fjCount(deck)` au début de `pushHist` (fin de partie IA, Blitz ou duel, jamais tutoriel, simulation ni reprise : `qLive()`). Une partie compte pour une faction si le deck a au moins `FJ_MIN` = 8 cartes de cette faction. Une partie de 12 cartes ne peut compter que pour une faction.
- `nikev` : parties avec Nike (ou sa variante, `charOf`) dans le deck pendant `VALENTIN` = 1er → 20 février (**à caler sur le futur paquet de la Saint-Valentin**).
- Écran : section « Journal des factions » du profil (`journalHTML`) ; la récompense n'est nommée qu'à partir de sa date d'annonce (`SHOWN`). Futures ultra-légendaires de faction : ajouter `quest:{k:"<faction>",n:50}` à leur entrée `ULS`.

## Calendrier du contenu

| Date | Contenu |
|---|---|
| 1er oct. 2026 | 1re vague, Yarden X Apsu (1re fusion) |
| 12 oct. | Halloween : paquet « Pli des Citrouilles » jusqu'au 2 nov., Médée Mariée Spectrale, Izzy Lune de Sang… Six lieux arrivent : **Le Cirque** (fin du tour 4, les puissances sont mélangées), **Le Bureau des enchères** (cartes jouées +1 de coût et +2), **Le Tombeau** (avancé depuis décembre), **Sauvabelin** (aucune destruction possible), **Le Flon** (+2 aux cartes qui y arrivent par un déplacement) et **Les Escaliers du Marché** (+2 aux cartes Helvara). |
| 1er nov. | Vague de novembre (Nemesis, Anubis, Médée, la Voleuse…), 3 fusions. Coûts revus avant sortie (8 oct.) : Brigid, Tefnut et Dionysos 2/2, Bourreau 3/2, Chernobog 4/4, Médée Mariée Spectrale et Poséidon 4/3, Qetesh 4/2, Seigneur de la marée noire 6/8 (puis 6/7 le 14 octobre), Balor 6/5. Effets revus avant sortie : Messagère d'Hécate (Continu : +2 par fin de tour si elle ne mène pas, 6 max), Médée (Continu : la prochaine carte adverse jouée ici perd 2), Aphrodite et Aphrodite X Yarden (rejouent des Révélations), Dante (+1 par destruction ici), Susanoo (déplace sa carte la plus faible, +3) |
| **15 nov.** (annonce le 10) | **Vague « énergie »** : Prométhée (L, Primordial), Pandore (E, Désir), Athéna (E), Bia (R), Styx (L), **Nike** (U de faction, Jugement) |
| 1er déc. | Vague de décembre : 17 cartes, 5 fusions, lieu Domaine du Créateur, jetons Mjölnir, Ombre, Pourceau, **Ananké** (U de faction Primordial, annonce le 26 nov.). Le Boucher de la Riponne détruit désormais sa carte la plus faible et pioche |
| **15 janv. 2027** (annonce le 10) | **Hédoné** (U de faction Désir) |
| 31 déc. → 18 janv. | Paquet « Pli du Douzième Coup » (annonce le 26 déc.) : Hel Reine du Réveillon, Éos de Nouvel An, Pele du Réveillon, Qetesh du Nouvel An (toutes `ex:"nouvelan"`) + fusions Pele X Jordan du Réveillon (`ulpele_r`) et Qetesh X Jordan du Nouvel An (`ulqetjor_r`, exige `qetesh_r`) |

| **1er févr. 2027** (annonce le 27 janv.) | **La Source** (U de faction Helvara, illustration de Carla) |
| **15 févr. 2027** (annonce le 10) | **Nike de la Saint-Valentin** (U de faction Jugement, variante de Nike ; **effet à fournir par Jordan** : pour l'instant seulement l'exigence de 8 cartes Jugement, pas d'effet dans le moteur ; la fenêtre `VALENTIN` du journal, 1er → 20 février, est à caler) |

**Règle des dates des ultra-légendaires de faction (Jordan, 15 octobre)** : le **15** du mois s'il n'y a pas d'événement ce mois-là, le **1er** s'il y en a un (annonce 5 jours avant : `soon`).

**Thème de la vague du 15 novembre** :
- Prométhée garde l'énergie non dépensée (10 maximum).
- Pandore la dépense (+1 de puissance par énergie).
- Bia coupe la réserve adverse.
- Styx donne +3 à Nike et à Bia ; une carte Jugement de son camp détruite dans son lieu **par un effet adverse** revient dans la main (voir « Décisions d'équilibrage », 2e série).
- Nike : +2 par carte jouée avant elle ce tour. Elle se **gagne dans le Journal des factions** (50 parties jouées avec au moins 8 cartes Jugement, décision de Jordan du 12 octobre ; avant : 7 autres cartes Jugement en collection), et se joue avec 8 cartes Jugement dans le deck, elle comprise.

---

## Décisions d'équilibrage (12 octobre 2026, d'après `rapport-cartes.md`) : ne pas revenir dessus sans l'accord de Jordan

Toutes ces cartes sont **pas encore sorties** (vérifié le 12 octobre). `BUILD` est passé à `alpha-0.3`.

- **Nemesis** 5/−5 : ne peut pas être jouée au tour 6 (`banned()`, testée par `canStage` et `aiPlan`, donc grisée en main et refusée même avec de l'énergie en réserve). Continu inchangé, deux Nemesis s'annulent.
- **Balor** 6/5 (Rare) : −3 à **deux** cartes adverses différentes au hasard ici (une seule carte adverse : −3 une fois).
- **Pandore** 3/0 : dépense toute l'énergie restante (réserve de Prométhée comprise), **+2** par énergie dépensée. L'IA la joue en dernier (`late`), et la simulation de l'IA calcule `S.unspent`.
- **Aphrodite** : voir la 2e série (coût 1) ; **Le Sans-Voix** 2/4 ; **Fange** 3/3 ; **Le Mendiant de la Riponne** 0/2 (effets inchangés).
- **Qetesh du Nouvel An** 5/3 (remplacé par la 4e série : puissance au lieu du coût) : « au début du tour suivant, charme la carte adverse la plus forte ici de **coût** 5 ou moins ». Marqueur `c.midnight` (tour du déclenchement, 🕛 sur la carte tant qu'il attend), `midnightCharm()` appelée par `startTurn()` avant la pioche ; rien si Qetesh n'est plus en jeu (ou a perdu ses effets) ; la cible est choisie au déclenchement. **Le +1 aux autres cartes est supprimé.**
- **Qetesh X Jordan du Nouvel An** 6/4 (remplacé par la 4e série : puissance 5 ou moins, +1) : Révélation : charme la plus forte adverse **ici** de coût 5 ou moins. Continu : tes autres cartes **ici** ont +2 (plus de charme dans les 3 lieux, plus de +1 partout).
- **Nyx X Oshun** 6/4 : détruit la plus forte adverse ici ; la moitié de sa puissance (arrondie au-dessus, prise au moment de la destruction) va à ta carte la plus faible **dans un autre lieu** (aucune carte ailleurs : bonus perdu).
- **Résurrections** (Hel, Loviatar et Hadès : remplacés par la 4e série) : Loviatar inchangée. **Hadès** 4/4 (coût 4 au lieu de 5). **Hel** 6/5 : ressuscite **ici** jusqu'à 3 cartes défaussées (les plus fortes, selon la place), sans Révélation. **Hel du Réveillon** inchangée. **Hel X Baldur** 6/3 : ressuscite ici la carte détruite **ou** défaussée la plus forte, avec sa Révélation, intouchable (`ward`) ; si c'est Baldur (toute version, `charOf`), +5.
- **Marqueur « ressuscitée »** : `c.risen = true`, posé par `resurrect()` (Loviatar, Hadès, Hel, Hel du Réveillon, Hel X Baldur, et aussi le Tombeau).
- **Cartes de défausse (toujours cachées, 3/3 épiques provisoires, `rel`/`soon` à 2099)** : **Cronos** (Primordial) défausse les cartes de coût ≤ 1 de ta main, +2 chacune ; **Izanami** (Primordial) défausse ta carte la plus faible de ta main, Continu : tes cartes ressuscitées (`risen`) ont +2 ; **Loki** (Désir) : chaque joueur défausse la carte la plus chère de sa main (égalité : `gPick`).
- **IA** : coûts et puissances estimés pour `ulnem`, `ulqetyar`, `ulhel`, `ulqetjor_r`, les résurrections, Cronos, Izanami, Loki (voir `place()`). Constat : à 6 d'énergie ces fusions (puissance 2-3) perdent le plus souvent contre deux cartes moins chères à égalité de simulation exacte ; l'IA les garde en main dans ~70 % des parties au tour 6 et ne les pose que lorsque c'est meilleur. Ce n'est donc plus un défaut de l'IA mais un signal d'équilibrage.
- **Outil d'équilibrage** : `--inclure cronos,izanami,loki` rend jouables quelques cartes cachées (elles restent « pas sorties » dans le rapport). Rapport régénéré avec 6000 parties, graine 20261012.

### 2e série (12 octobre 2026, cartes qui sortent jusqu'au 15 novembre) : même règle, ne pas revenir dessus sans l'accord de Jordan

`BUILD` : `alpha-0.4`. Inchangées : Nike, Pandore, Prométhée, Seigneur de la marée noire, Messagère d'Hécate, et le reste des vagues du 1er et du 15 novembre.

- **Aphrodite** 1/2, Épique : « rejoue la Révélation de la dernière carte que tu as révélée **ce tour**, où qu'elle soit ». `S.lastRev[côté]` est posé par `reveal()` (jamais par une Aphrodite, ni `ulaph`) et remis à zéro dans `resolveTurn()` ; l'effet est rejoué par `replayFx()` **depuis le lieu de la carte d'origine** (cherchée sur le plateau : absente → rien). Rien si aucune carte n'a été révélée avant elle. L'ordre de révélation suit les lieux (0, 1, 2) puis l'ordre de pose : une Aphrodite posée dans un lieu plus à gauche que sa cible est révélée avant elle. **Nike** compte les cartes jouées avant elle **sans les Aphrodite** (`isAph`) et se recalcule à chaque rejeu (1 + 1 + Nike + Aphrodite : Nike 1 + 4 + 4 = 9). IA : `late` (Pandore 3, Aphrodite 2, Nike 1), variantes où chaque carte passe juste avant Aphrodite, estimation selon la carte précédente, et `sim()` remet `S.lastRev` et `S.turnPlays` à jour.
- **Lip Dentelle** 3/3 (gagne la puissance **actuelle** de la carte défaussée, `t.pow`), **Le Bourreau de la brèche** 3/4, **Médée** 4/4 : effets inchangés.
- **Set** 5/4 : « disperse jusqu'à 2 cartes adverses d'ici, au hasard (`gShuffle`), vers les autres lieux s'il y a de la place ; chacune perd 1 ». Une carte sans place ailleurs reste et ne perd rien ; les cartes `fated` ne sont jamais choisies.
- **Styx** 4/3, Légendaire : Continu : Nike et Bia +3 où qu'elles soient. **Quand une de tes cartes Jugement est détruite ici par un effet ADVERSE** (nuance de Jordan : sinon trop fort), elle **revient dans ta main** avec la puissance qu'elle avait (`styxReturn()`, via `entomb()` dans `destroy`, Nyx, Lilith, Ereshkigal ; main pleine : défausse). **Ne reviennent pas** : destruction par ton propre effet (Ficelle Dévorante, Nyx X Oshun sur ton camp…) ni par la Faille (pas de carte source : `SRC` nul). L'ancienne protection « indestructibles » (`styxSafe`) est supprimée. La main et l'agrandissement d'une carte en main affichent `c.pow` (vert/rouge si modifiée).
- **Outils** : `node outils/equilibrage.js --cartes a,b,c --parties 1000` place 2 de ces cartes dans chaque deck des deux camps et écrit `rapport-cible.md` (sans toucher `rapport-cartes.md`) ; `node outils/tests-scenarios.js` (23 scénarios fixes). Mesure ciblée du 12 octobre (1000 parties, graine 20261012) : Aphrodite 47,7 %, Lip Dentelle 54,5 %, Bourreau 50,0 %, Médée 47,7 %, Set 49,6 %, Styx 47,3 % (Styx posée 19 % des parties seulement).

### 3e série (14 octobre 2026, Ananké réécrite + Hédoné) : même règle, ne pas revenir dessus sans l'accord de Jordan

`BUILD` : `alpha-0.5`.

- **Ananké** 6/1, Ultra-légendaire de faction Primordial, **`rel` 2026-12-01, `soon` 2026-11-26** (gagnée au Journal des factions : 50 parties avec 8 cartes Primordial, comme Nike ; `ULS` inchangée). Texte : « Fatalité : rien ne peut l'atteindre. Fin de partie : sa puissance devient égale à la puissance totale adverse ici, +1 de puissance. Exige 8 cartes Primordial dans le deck, Ananké comprise. » **Plus de Révélation** : elle ne fait rien à la pose (une note « Fatalité » seulement).
  - **Fatalité** = `untargetable(by,s,c)` (moteur) : aucun effet adverse ne la vise (destruction, déplacement, affaiblissement, charme de Qetesh, Calypso, Oya, Circé, Lilith, Poséidon, Set, Mohini, Médée, Ishtar, Faille…). La cible est choisie parmi les **autres** cartes, comme si elle n'était pas là. Ses propres effets de camp (buffs, mouvements des alliés) restent filtrés par `fated()` comme avant. **Mohini n'est plus un contre** (changement par rapport à l'ancienne version : seuls Nemesis et Apsu la contrent).
  - **Calcul en fin de partie** : `S.final` passe à `true` à la toute fin du tour 6 (après les Révélations, les effets de fin de tour et Hédoné) ; `cardPow()` renvoie alors `ankEnd()` = puissance totale adverse ici (`total(opp)`) + 1. L'ordre de révélation ne change rien. Deux Ananké face à face : garde `ANK` (la seconde compte pour 1), pas de boucle.
  - **Deux contres volontaires** : Nemesis dans le même lieu (la règle « le moins de puissance gagne » joue, elle perd le lieu) ; Apsu / Apsu, Veillée des Chaînes **posés après elle** (`neg` : plus de Fatalité, elle reste à 1). Apsu posé avant elle ne la touche pas.
  - **Affichage** : `✠ N` sur la miniature (`.fatb`), puissance qu'elle aura en fin de partie, mise à jour en direct ; même texte dans l'encadré d'info.
  - **IA** (`place()`, `sim()`) : jamais sur un lieu où l'adversaire a une Nemesis ; pénalité avant le tour 6 (un Apsu posé plus tard annulerait tout) ; valeur estimée = puissance adverse du lieu +1 ; dans la simulation exacte, un lieu avec Ananké vaut 95 % (3 % si Nemesis).
  - Mesure ciblée (1000 parties, graine 20261012, `--cartes ananke`) : victoire en deck **49,5 %**, posée dans 43 % des decks, **victoire posée 63,4 %**, puissance de fin moyenne 9,6, survie 100 %.
- **Hédoné** 4/2, Ultra-légendaire de faction Désir (`ULS` : `{id:"hedone",req:[],fac:"desir",min:8,quest:{k:"desir",n:50}}`, Journal des factions, 50 parties avec 8 cartes Désir), **`rel` 2027-01-15, `soon` 2027-01-10** (date fixée par Jordan le 15 octobre ; remplace le 1er janvier provisoire), `vfx:"hedone"` (mélange doré dans `MIX`). Texte : « Continu : à la fin de chaque tour, attire ici la carte adverse la plus faible d'un autre lieu, s'il y a de la place, et la charme tant qu'Hédoné reste en jeu. 2 fois maximum. Exige 8 cartes Désir dans le deck, Hédoné comprise. » Images : `images/hedone.webp`, `avatars/`, `mini/`.
  - **`hedoneTurn(first)`** (moteur), appelée à la fin de `resolveTurn()` après tous les autres effets de fin de tour, **tours 1 à 6 compris** (posée au tour 5 : 2 charmes ; au tour 6 : 1). « Attire » = la carte reste du côté adverse mais est **déplacée dans le lieu d'Hédoné** (Le Flon lui donne son +2 de déplacement) et sa puissance compte pour toi (comme le charme de Qetesh).
  - Rien (et **ça ne compte pas dans les 2 fois**) si le côté adverse du lieu est plein ou s'il n'y a aucune carte adverse ailleurs. Égalité de puissance : `gPick`. Jamais attirées : les cartes insaisissables (Ananké, Uzume) et les cartes déjà charmées. Les deux camps sont traités dans l'ordre `[dflt, opp(dflt)]` (même tirage chez les deux joueurs en duel).
  - **`charmOf(c)`** remplace le test `c.charm` : le charme d'Hédoné porte `c.charmBy` (uid) et **cesse dès qu'Hédoné quitte le jeu ou perd ses effets** (Apsu, Mohini…) ; les cartes restent dans le lieu et comptent de nouveau pour leur camp. Le charme de Qetesh (sans `charmBy`) dure toujours.
  - **Affichage** : compteur `0/2` (`.hedb`) sur Hédoné ; **toute carte charmée** (Qetesh comprise) porte un liseré doré pointillé qui pulse (`.mini.charmed`) et une ligne « Charmée : … » dans l'encadré d'info.
  - **IA** : valeur +2,5 par charme attendu (`min(2, 7−tour)`) si l'adversaire a de la place ici et des cartes ailleurs, petit bonus jusqu'au tour 5 ; la simulation exacte (`sim()`) ajoute le même gain (sans cela l'IA ne la jouait que dans 8 % des decks).
  - Mesure ciblée (1000 parties, `--cartes hedone --date 2027-01-05`) : victoire en deck **49,3 %**, posée dans 64 % des decks, **victoire posée 54,1 %**, puissance de fin 2,4, survie 90 %, tour de pose 4,3.
- **Outil d'équilibrage** : une ultra-légendaire de faction ciblée (`--cartes ananke`, `hedone`…) construit maintenant le deck autour de sa faction (sinon l'exigence de 8 cartes n'était pas respectée). Pour Hédoné, ajouter `--date 2027-01-05` (sinon la carte n'est pas encore « sortie »).
- Tests : 127 scénarios dans `outils/tests-scenarios.js` (+36 : Ananké face à 10 de puissance posée après, Qetesh / Calypso / Oya / Lilith / Poséidon / Nyx / Mohini / Circé / Esquille / Set, Nemesis, Apsu avant/après, deux Ananké, IA ; Hédoné aux tours 5 et 6, Esquille, lieu plein, Ananké jamais attirée, égalité, Apsu, IA).

### 4e série (14 octobre 2026, cartes de décembre) : même règle, ne pas revenir dessus sans l'accord de Jordan

`BUILD` : `alpha-0.6`. **Elle remplace les anciennes lignes sur Hel, Loviatar, Hadès, Qetesh du Nouvel An et Qetesh X Jordan du Nouvel An de la 1re série.** Mesures « avant → après » : 1000 parties, graine 20261012, `--cartes hel,loviatar,hades,circe,uloshun,sekhmet_n,eos_r,qetesh_r,ulqetjor_r,ulpele_r` (victoire en deck / victoire posée / posée dans N % des decks).

- **Hel** 6/3 (avant 6/5), Légendaire : « Révélation : défausse ta main, puis ressuscite ici jusqu'à 2 de tes cartes défaussées (les plus fortes), sans Révélation. » La main est défaussée par `discard()` (donc Fange, Rémi, le Charognard comptent), puis les 2 plus fortes de **toute** la défausse reviennent, y compris celles que Hel vient de défausser ; limité par la place libre. `risen` posé (Izanami +2). IA : au tour 6 de préférence (−3 avant), coût de la main perdue. 47,4 → **54,1 %** / 46,8 → **64,8 %** (posée 16 → 30 %).
- **Loviatar** 4/3, Épique : « …ressuscite ici ta dernière carte défaussée, sans Révélation. Elle perd 1 de puissance au début de chacun des 2 tours suivants. Si tu n'en as aucune, Loviatar gagne +3 de puissance. » La carte revient à sa puissance de base avec un compteur `c.sick` = `min(2, 6 − tour)` (posée au tour 4 : −2 ; tour 5 : −1 ; tour 6 : 0), décompté par `startTurn()` (journal « Maladie · … perd 1 »). Indicateur `🤒 N` sur la miniature. IA : tard (−2 avant le tour 5). 47,4 → 48,7 % / 45,9 → 42,2 % (posée 26 → 58 %).
- **Hadès** 4/4, Légendaire : plus de +3 quand rien à ressusciter : « Si tu n'en as aucune, Hadès gagne +3 de puissance. » 42,6 → **53,9 %** / 40,0 → 54,3 % (posée 46 → 72 %).
- **Circé** coût 4 (4/3) : 49,0 → 50,5 % / 42,6 → **60,6 %**. **Nyx X Oshun** 6/2 (avant 6/4) : 50,9 → **47,0 %** / 54,5 → **38,2 %** (la baisse est forte : à surveiller). **Sekhmet, Lionne de l'Hiver** coût 4 (4/4) : 48,0 → 46,5 % / 41,4 → 43,4 %. **Éos de Nouvel An** 2/2 : 45,9 → 46,4 % / 48,4 → 46,2 %.
- **Qetesh du Nouvel An** 5/3 : « charme la carte adverse la plus forte ici de **puissance** 5 ou moins » (retour à la puissance, lue au déclenchement par `midnightCharm()`, plus au coût). 55,6 → 49,9 % / 62,6 → 52,5 %.
- **Qetesh X Jordan du Nouvel An** 6/4 : même règle (puissance 5 ou moins), Continu : tes autres cartes ici ont **+1** (avant +2). 58,8 → 53,2 % / 71,8 → 69,2 %.
- **Pele X Jordan du Réveillon** coût 2, puissance 1 (avant 6/4), effet inchangé. IA : tour 6, avec une autre carte, adversaire avec au moins 3 cartes. 46,8 → 51,4 % / 47,7 → 52,1 % (posée 26 → 63 %).
- **IA seulement** : Hel X Baldur et Qetesh X Yarden (cartes inchangées) reçoivent un bonus de score dans `place()` (+6, Hel X Baldur seulement s'il y a une carte à ressusciter). Mesure `--cartes ulhel,ulqetyar` : Hel X Baldur posée 13 → 20 % (victoire posée 52,1 → 52,9 %), Qetesh X Yarden posée 12 → 26 % (**victoire posée 36,2 → 41,2 % : elle perd plus souvent qu'elle ne gagne quand elle est jouée**, contrairement à ce qu'on pensait).
- Sekhmet N, Éos N, Circé, Nyx X Oshun, Pele X Jordan : seuls coût/puissance changent. Cartes de décembre listées « inchangées » : non touchées.
- Tests : 147 scénarios (+20 : Hel main de 3, 1 place libre, Fange, Izanami ; Loviatar tours 4/5/6 et indicateur ; Loviatar et Hadès sans cible ; Qetesh N coût 5/puissance 9, 5, 3 ; Qetesh X Jordan N ; Pele X Jordan ; statistiques ; IA Pele X Jordan). Les cartes provisoires étant toutes 3/3, le test fixe lui-même la puissance de trois cartes sans effet.

### Règle d'équilibrage (14 octobre 2026, décision de Jordan)

**On corrige au-delà de ±8 points d'écart (victoire en deck moins la moyenne des cartes), on surveille entre ±6 et ±8, sinon on attend les données réelles.** Sous 100 decks, la marge d'erreur dépasse ±10 points : ne rien décider sur ces chiffres.

### 5e série (14 octobre 2026) : même règle, ne pas revenir dessus sans l'accord de Jordan

`BUILD` : `alpha-0.7` (puis `alpha-0.8`, voir la 6e série). Le comparatif avant/après (`comparatif.md`, supprimé ensuite) est dans l'historique git (commit `57fb23e`).
- **Le Seigneur de la marée noire** 6/7 (avant 6/8), effet inchangé (il était à +8,2 d'écart, 57,8 %). Il remplace « 6/8 » de la ligne du 1er novembre du calendrier.
- **Ananké (analyse, rien modifié)** : 62,4 % en deck, mais 78,4 % posée et 51,9 % restée en main ; les decks Primordial sans ultra-légendaire sont dans la moyenne (49,8 %), les decks Primordial avec une autre ultra-légendaire gagnent aussi 63,3 % : c'est la combinaison « Primordial + ultra » qui est forte, Ananké comprise. À surveiller (zone > +8 : +12,8).
- **IA** (`place()`), cartes inchangées : Nyx X Circé (retire la puissance de toutes les cartes adverses du lieu moins 1 chacune), Médée Mariée Spectrale (poison : 1 par fin de tour restante, aux deux plus fortes avec Hécate), Yarden Dragonification (+2 par Primordiale déjà là, posée ce tour ou en main), Amaterasu (valeur selon le nombre de cartes à protéger et les affaiblisseurs vus, liste `AI_WEAK`), Nemesis X Jordan (cartes posées ce tour comptées, petit bonus). Mesure ciblée `--cartes amaterasu,ulnem,yarden_d,ulcirce,medee_h,maree --parties 1000` : pose Amaterasu 17 → 14 %, Nemesis X Jordan 11 → 14 %, Yarden Dragonification 9 → 10 %, Nyx X Circé 24 → 30 %, Médée Mariée Spectrale 16 → 16 %. **L'amélioration est modeste** : testées seules en main, ces cartes sont toujours jouées ; leur faible taux de pose vient surtout de la concurrence (une seule carte à 6 d'énergie au tour 6, 75 % de chances seulement de l'avoir piochée) et, pour Amaterasu, Yarden Dragonification, Médée Mariée Spectrale et Nemesis X Jordan, du fait qu'elles gagnent **moins** que la moyenne quand elles sont posées (33 à 43 %) : l'IA ne se trompe sans doute pas en les gardant. Seule Nyx X Circé gagne beaucoup posée (72 %).
- **Blitz sans ultra-légendaire, adversaire compris (14 octobre, signalé par un ami de Jordan avec une capture : une carte à 17 de puissance, une fusion, en match 2 ou 3)** : `aiDeck(t,full,noUL)` (3e paramètre) saute l'ajout d'une ultra-légendaire aux paliers 4 et plus ; `bzGame()` l'appelle avec `noUL`. Avant, le texte « Pas d'ultra-légendaire » ne valait que pour le joueur. Test : 300 decks aux paliers 4 et 6 et 100 matchs 3/3 sans aucune ultra-légendaire.
- Tests : 153 scénarios (+4 : IA Nyx X Circé, Yarden Dragonification, Médée Mariée Spectrale, marée noire 6/7).

### 6e série (15 octobre 2026, La Source + dates) : même règle, ne pas revenir dessus sans l'accord de Jordan

`BUILD` : `alpha-0.8`.
- **La Source** 3/2, Ultra-légendaire de faction **Helvara** (`ULS` : `{id:"source",req:[],fac:"helvara",min:8,quest:{k:"helvara",n:50}}`, Journal des factions, 50 parties avec 8 cartes Helvara, comme les autres : **à confirmer par Jordan**), **`rel` 2027-02-01, `soon` 2027-01-27**, illustration de **Carla** (`images/source.webp`, `avatars/`, `mini/`), holo `carla` (table `HOLO`), `vfx:"source"` (mélange bleu-blanc dans `MIX`, provisoire). Texte : « Continu : les Révélations de tes autres cartes Helvara jouées ici se déclenchent deux fois. Exige 8 cartes Helvara dans le deck, La Source comprise. » (la phrase de Jordan : « Exige 8 cartes Helvara dans le deck » ; « La Source comprise » ajouté pour suivre Nike, Ananké et Hédoné). **Nom** : Jordan a écrit « Carla, La source » ; la carte s'appelle La Source (Carla est l'illustration et le dossier holo).
  - **Moteur** (`reveal()`) : après la Révélation d'une carte Helvara (`fac`, hors La Source), si une La Source **de son camp, dans le même lieu, déjà révélée** (`live`) est en jeu, la Révélation est rejouée par `replayFx()` (mêmes règles que le rejeu d'Aphrodite : pas de Brigid ni d'effets de lieu à la pose ; `replayable`). Journal : « La Source · Révélation de X rejouée ». **Ordre de révélation** : lieu 0, 1, 2 puis ordre de pose ; une carte révélée **avant** La Source (même tour, posée avant elle) n'est pas doublée ; les cartes posées aux tours précédents n'ont plus de Révélation à venir. La Source annulée (Apsu, Mohini…) ne double rien. Une Source adverse ne double pas tes cartes. Les autres factions ne sont jamais doublées.
  - **IA** (`place()`) : +1,5 par autre carte Helvara à Révélation en main (4 au plus), petit bonus avant le tour 5. Mesure ciblée (1000 parties, graine 20261012, `--cartes source --date 2027-02-05`) : victoire en deck **49,3 %**, posée dans 65 % des decks, victoire posée 47,1 %, puissance de fin 2,8, survie 96 %, tour de pose 4,4.
  - Tests : 163 scénarios (+10 : doublée, posée juste avant / après, autre lieu, Source adverse, Source annulée, autre faction, données, dates, IA).
- **Dates** : Ananké 1er décembre 2026 (inchangé), **Hédoné 15 janvier 2027** (annonce le 10 ; avant : 1er janvier provisoire), La Source 1er février 2027. Règle générale : voir « Calendrier du contenu ».
- **Nike de la Saint-Valentin** : `rel` 2027-02-15, `soon` 2027-02-10 (Jordan, 15 octobre). Holo `nike-saint-valentin` prêt. Pas d'effet dans le moteur (`fx` = l'exigence seulement) : à confirmer avec Jordan.
- Pas de bannière `DROPS` pour Ananké, Hédoné et La Source (non demandée).

### Fusions (ultra-légendaires) dans les paquets (12 octobre 2026, décision de Jordan)

On **oublie la fusion par collection** : une fusion ne se gagne plus en réunissant ses deux cartes, elle **sort des paquets**. La **règle de deck ne change pas** : une fusion exige toujours ses deux personnages dans le deck (`ulOk`). Les ultra-légendaires **de faction** (Nike, Ananké, Nike Saint-Valentin) restent à gagner par quête (Journal des factions), hors paquets.
- **Taux, par PAQUET** (pas par carte) : `ul` dans `PACKS` : 100 CHF **1 %**, 200 CHF **2 %**, 300 CHF **4 %**, paquets d'édition **5 %** (`UL_SEASON`, validé par Jordan le 13 octobre ; modifiable en une ligne). **Garantie** : paquet à 300 CHF (`pity:10`), compteur `P.pity` = ouvertures sans fusion ; à la 10e, une fusion est garantie. Aucune garantie ailleurs. Si le tirage réussit, la fusion **remplace une des 3 cartes** (`drawPack`, `got[1]`), puis les 3 cartes sont mélangées.
- **Que des fusions pas encore possédées** (`ulPool(pk)`). Si le joueur les a toutes : la place devient une **légendaire** (seulement dans les paquets qui ont des légendaires : 300 CHF et éditions) ; les paquets à 100 et 200 CHF restent alors comme avant. Un paquet reste **achetable tant qu'il manque une fusion**, même avec toutes ses cartes (`packBuyable`, `packMissing`) ; collection complète seulement quand plus rien (cartes + fusions) ne manque.
- **Fusions saisonnières** (qui exigent une variante `ex`, ex. `ulqetjor_r`, `ulpele_r`) : seulement dans le **paquet d'édition de leur saison** (`ulSeason(u)`), jamais dans les paquets ordinaires. Si la saison n'a plus de fusion à trouver, le paquet d'édition propose une fusion ordinaire.
- **Déjà réclamables** : les fusions dont le joueur avait déjà les deux cartes au premier chargement après la mise à jour sont figées dans `P.ulk` (`clean()`) et restent réclamables (fenêtre « Fusion disponible ») ; une fusion qui sort après (Hel X Baldur le 1er décembre…) ne l'est plus. Les fusions déjà possédées sont gardées.
- Affichage : la boutique indique le taux d'ultra-légendaire par paquet, le nombre de fusions à trouver et « prochaine garantie dans N ouvertures » ; les règles (`rulesHTML`) l'expliquent. Les doublons d'ultra-légendaire ne devraient pas exister (`ECO.dup.U` = 150 par sécurité).
- Tests : `node outils/tests-scenarios.js` (taux mesurés sur 20 000 à 30 000 tirages, garantie, fusions déjà possédées, saisonnières, achetabilité).

## Effet holo 2.5D (15 octobre 2026, module préparé par Jordan dans une autre session)

Effet réservé aux **ultra-légendaires de faction** (4 au plus d'ici février) : la carte est découpée en 2 à 4 couches qui bougent à des vitesses différentes (souris ou doigt), foil irisé sur l'or, particules propres à chaque carte. Ni WebGL ni dépendance. Documentation du module : `outils/holo/README.md` (format du `manifest.json`, options) ; scripts de découpage de référence : `outils/holo/reference/`.
- **Fichiers** : `js/holo-card.js` = module d'origine (module ES, **ne pas le réécrire** ; deux corrections minimales faites le 15 octobre (à refaire si le module est remplacé par une nouvelle version de la session de Jordan : le foil `volt` de Carla, 15 octobre, a été ajouté ainsi) : une image de couche introuvable fait maintenant échouer `HoloCard.load` au lieu d'afficher une carte vide, et `destroy()` appelé pendant le chargement ne laisse plus d'écouteurs). `js/holo.js` = script classique : table `HOLO`, `holoDir(id)`, `holoMount(slot, id, opts)`, `holoKill(jeton)`. Le module est chargé **à la demande** par `import()` (jamais au démarrage) ; son `?v=` est dans l'attribut `data-mod` de la balise `js/holo.js` (mis à jour par `outils/versions.js`). `js/holo.js` est avant `js/ouverture.js` dans `index.html`.
- **Activation par donnée** : `HOLO = { "<id de carte>": "<dossier sous images/holo/>" }` dans `js/holo.js`. Une carte sans entrée garde son image fixe. **`HOLO` (15 octobre, dossiers fournis par Jordan) : `nike` → `nike`, `ananke` → `ananke`, `hedone` → `hedone`, `nike_v` → `nike-saint-valentin`, `source` → `carla`** (foil électrique `volt`) (variante de Nike : entrée séparée). L'effet ne s'affiche que pour une carte qu'on peut zoomer ou tirer, donc pas avant la sortie de la carte. Les dossiers viennent de la session de Jordan (images de couches + `manifest.json`, déjà découpés ; **ne pas les générer ici**, chaque carte demande du réglage à la main). Pour en brancher une autre : déposer le dossier dans `images/holo/<nom>/`, ajouter l'entrée, `node outils/versions.js`, `node outils/tests-holo.js`.
- **Mode test `?holo=test`** : les cartes n'étant pas encore sorties, il ajoute un bouton **« Test holo »** (en bas à gauche) : zoom de chaque carte holo sans la posséder, et faux paquet de 4 cartes (rien n'est acheté ni sauvegardé). `HOLO_TEST` (vide) sert à y ajouter des cartes d'essai. Sans ce paramètre, rien de plus n'est demandé au réseau.
- **Où** : (1) **zoom** d'une carte (`zoomHTML` : conteneur `#holoslot`, l'image fixe reste tant que l'effet n'est pas prêt, puis `.holo-on` la cache) ; `render()` détache l'effet avant de réécrire `#app` et le remet dans le nouveau conteneur (pas de rechargement), le détruit si le zoom se ferme ou change de carte (`zoomHolo`) ; (2) **révélation à l'ouverture d'un paquet** (`ouverture.js`, `curHolo`) : l'effet est posé **à plat par-dessus** la carte (`.t-holoover`, hors de la carte en 3D) et devient visible une fois le retournement fini ; monté dans la carte retournée en 3D, des couches disparaissaient par moments sur le téléphone de Jordan (vidéo du 15 octobre) ; la carte se retourne sur son **image à plat** (`holoPoster`, couches empilées sans mouvement) et non sur l'image fixe du jeu (nom, coût, texte), sinon l'image « sautait » quand l'effet prenait la suite ; mouvement automatique seulement (la révélation ignore le toucher : « Touche pour continuer »), détruit dans `settle`, `skipAll` et `destroy`. **Jamais** sur le plateau, dans la main ni dans les listes.
- **Replis** : module, manifest ou image introuvable → l'image fixe reste, aucune erreur visible (seul un 404 apparaît dans la console du navigateur). Mouvement réduit géré par le module.
- **Défilement** : la carte déclare `touch-action:none` (elle capte le doigt pour s'incliner) ; dans le zoom, l'encadré d'info en dessous et les marges latérales restent défilables (`.zoomwrap`). Un clic sur la carte ne ferme pas le zoom (`data-act="holoin"` ne fait rien).
- **Ratio** : les couches sont en 1060 × 1580 (0,6709) ; le cadre des cartes du jeu est en 2/3 (0,6667). L'effet garde son ratio (aucune déformation) : il est environ 0,6 % plus court que l'image fixe (3 px à 340 px de large).
- **À savoir** : la carte holo n'affiche **ni coût, ni puissance, ni nom** (c'est une illustration pleine) : dans le zoom ils sont dans l'encadré d'info, dans le paquet seule la bannière « Ultra-légendaire » reste. Décision de Jordan à prendre.
- Tests : `node outils/tests-holo.js` (22 vérifications : zoom, redessins sans doublon, glissement qui ne ferme pas, `destroy()`, carte sans entrée, production, manifest ou image manquants, mouvement réduit, paquet, « Passer »). Le test du doigt sur Android (fluidité, défilement hors de la carte) reste à faire par Jordan.

## Bac à sable `?date=AAAA-MM-JJ` (15 octobre 2026, demande de Jordan)

Ouvrir `https://kanoew.github.io/Duel-Helvara/?date=2027-02-05` simule cette date (de 2026-10-01 à 2030-12-31 ; autre valeur ignorée) pour **voir et jouer les cartes pas encore sorties, avec leurs effets et leur holo**, sur téléphone, sans rien casser.
- **Profil neuf, jetable** (`sandboxSetup()`, appelée par `boot()`) : toutes les cartes, 99 999 CHF, tutoriel fait, journal des factions rempli, 4 decks préremplis. **Le vrai profil n'est ni lu ni modifié.**
- **Rien n'est écrit** : `window.__wiped = true` (même garde-fou que la suppression de compte) coupe `save()` **et `lsWrite()`** (le chargement écrivait le vrai profil local si les quêtes changeaient : bug trouvé par le test et corrigé) ; `initStore()` ne fait rien (le compte n'est pas lu) ; `window.claude = null` (pas de salons en ligne, classement ni statistiques) ; les réglages cachent « Supprimer mon compte » et « Exporter mes données ».
- **Bandeau** doré en haut : date simulée, champ de date + « Changer », « Quitter » (retour au jeu normal). Les dates de sortie du calendrier se testent donc en changeant la date (Ananké 2026-12-01, Hédoné 2027-01-15, La Source 2027-02-01…).
- À ne pas faire : ajouter une écriture (stockage, compte) sans la garde `window.__wiped`. Test : `node outils/tests-bac-a-sable.js` (15 vérifications dont : stockage local identique avant/après une partie complète et tous les écrans, aucun appel au compte).

## Durcissement (14 octobre 2026, audit)
- **Codes de salon** : `LIEU-` + 6 caractères de `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (31 symboles, ~887 millions de codes par lieu, `mpRandInt` sans biais) ; codes et jetons (`mpTok`, 16 caractères hexadécimaux) tirés avec `crypto.getRandomValues`, plus `Math.random`. `MP_CODE` accepte aussi l'ancien format à 4 chiffres : une reprise de session déjà enregistrée dans le navigateur continue de marcher. Champ de saisie : `maxlength` 24 (les 12 d'avant coupaient déjà `SOUSGARE-1234`).
- **CSP sans script inline** : le script du service worker est dans `js/sw-register.js` (versionné par `outils/versions.js` et préchargé par `sw.js` comme les autres) ; vérifié avec le vrai `supabase.js` : aucune violation, le service worker s'enregistre.
- **Classement « borné », pas « non falsifiable »** : le serveur limite le rythme et les gains, il ne peut pas vérifier qu'une partie a eu lieu (`classement-securise.sql`, commentaire seulement). Le repli d'écriture directe de `cloud.js` reste en place jusqu'à confirmation que le SQL est en place dans Supabase.

## Façon de travailler avec Jordan

- Jordan prépare souvent les changements dans une autre session (brainstorm) et les apporte sous forme de fichier `.md` : le lire, vérifier qu'il est cohérent avec le code (et le dire s'il ne l'est pas), puis l'appliquer.
- Publier directement sur `main` est la pratique habituelle, sauf si le fichier demande d'attendre sa validation.
- Toujours tester avant de publier, et lui envoyer des captures quand il s'agit de visuel. Il teste ensuite sur son téléphone (Android, navigateur Brave) et renvoie des captures.
- Jordan n'est pas développeur : réponses claires, sans jargon, et dire franchement ce qui n'a pas été vérifié.

## En attente
- À faire vérifier par Jordan en jouant (session du 8 octobre) : jonction de boucle des musiques, fondu vers la tension au tour 5, jingles de fin, curseurs de volume sur téléphone, ressenti de la nouvelle IA aux hauts rangs.
- Points du brainstorm pas encore traités : débloquer les modes au fur et à mesure (Serment au rang Initié, Blitz après 5 parties, fusions dès la première pièce) ; une piste de partie supplémentaire si besoin.

- **9 cartes Helvara ajoutées le 9 octobre, cachées** (`rel` et `soon` à `2099-01-01`, sans effet) : `reine_sevelin`, `somnambule`, `veilleur_pont`, `couturiere`, `archiviste`, `patronne`, `meute` et les fusions `ulsomnambule` (Somnambule + Reine) et `ularchiviste` (Archiviste + Patronne), avec leurs entrées `ULS`. **Coûts, puissances et raretés sont provisoires.** Quand Jordan donne la date et les effets : remplacer `rel`/`soon`, écrire `fx`, ajouter `vfx` aux fusions, compléter `cartes-en.js` et la bannière `DROPS`.
- **13 cartes sans faction, coût ni effet, ajoutées le 9 octobre, cachées** (`rel`/`soon` à `2099-01-01`) : `daji`, `aine`, `rati`, `gaia`, `frigg`, `maat`, `typhon`, `hera`, `pakhet`, `izanami`, `echidna`, `hephaistos`, `cernunnos`. **Faction (devinée d'après les dieux déjà en jeu), coût 3, puissance 3 et rareté épique sont provisoires** : Jordan doit les fixer, avec la date et les effets.
- **20 cartes ajoutées le 10 octobre, cachées** (`rel`/`soon` à `2099-01-01`, sans effet, sans `ex`, sans `vfx` sauf Ereshkigal) : `qetesh_v`, `circe_v`, `aphrodite_r`, `ereshkigal_n` et `ereshkigal_v` (légendaires, comme la base), `demeter`, `meduse`, `nike_v` (ultra-légendaire de faction, entrée `ULS` avec `fac`/`min`) et 12 fusions ultra-légendaires `ulqetjor_v`, `ulprombia`, `ulheradio`, `ulposathe`, `ulnikebia`, `ulmaatset`, `ulprompan`, `ulinaere`, `ulnikejor_v`, `ulaphares`, `ultyphgaia`, `ularesathe`, `ulbaldere`, `ulbaldfrigg`, `ulsusama`, `ulcircal`, `uloshoya`, `ulhadper` ; plus `ares_n` et `hel_v` (épiques, variantes du Nouvel An et de la Saint-Valentin). Les 8 images du 2e envoi suivent les mêmes règles. **Coûts (6/4 pour les fusions), factions de Déméter, Méduse et des fusions, et sources des fusions sont provisoires.** Les variantes Saint-Valentin n'ont pas de `ex` : la saison « valentin » n'existe pas encore (`SEASON`, paquet, `PACK`). `ulaph` n'accepte pas encore `aphrodite_r`.
- **18 cartes ajoutées le 12 octobre (1re vague d'une série de 25), cachées** (`rel`/`soon` à `2099-01-01`, sans effet) : dieux `sedna`, `benzaiten`, `loki` (version féminine voulue par Jordan), `kali`, `eros` (deux visages, femme et homme, voulu), `anahita`, `cronos`, `apollon`, `herakles`, `vesta`, `indra`, `tsukuyomi`, `zeus` ; humains Helvara `possedee` (humaine aux yeux vairons, « possédée »), `musicien` (sans nom), `emiri` (chasseuse de fantômes, liée à la voyante ; Jordan hésitait entre Emiri et Chasseuse), `voyante`, `penitente` (humaine des bas-fonds, style SM, croit à l'église, se bat avec une chaîne). Styx et Méduse ont reçu une nouvelle illustration (Méduse remplace l'ancienne version). **Noms des humains sans nom, factions (devinées), coûts 3/3 et raretés E sont provisoires** ; 5 cartes restent à venir pour finir la série.
- **4 cartes ajoutées plus tard le 12 octobre (fin de la série de 25), cachées** : `effigie`, `reflet_noir` (Jordan veut changer le nom ; `reflet` est déjà le jeton du Lac Ouchy), `enfant` (« L'Enfant sans École » : Jordan avait écrit « sans éco », à confirmer) : sans effet, factions Helvara devinées, 3/3 épique provisoires ; et **`ananke`**, ultra-légendaire de faction Primordial, avec son effet (voir ci-dessous). `images/enfant.webp` : la bordure noire de l'image d'origine a été rognée.
- **Ananké** : réécrite le 14 octobre 2026, voir « 3e série » dans « Décisions d'équilibrage » (Fatalité totale, puissance calculée en fin de partie, sortie le 1er décembre).
- **Conservation des données** : `supabase.sql` relancé le 11 octobre (fonction `delete_my_account` en place, 0 erreur) ; le bouton « Supprimer mon compte » a été essayé avec le vrai serveur par Jordan (compte Google d'essai) : il fonctionne. Le nettoyage des comptes inactifs est planifié depuis le 11 octobre (pg_cron activé, tâche `helvara-conservation`, tous les lundis à 4 h UTC, vérifiée dans `cron.job`) : rien n'expire avant octobre 2027. `supabase.sql` relancé aussi après l'ajout de la règle DELETE sur `saves`.
- Musique `audio/accueil_nouvelan.mp3` (optionnelle).
- Fin octobre : faire le point sur les rangs (série de victoires) et sur Mohini. Surveiller le combo Lip Dentelle → Hel.
- Mi-novembre : surveiller le deck Jugement « énergie ». Leviers : bonus de Styx à +2, réserve de Prométhée à 6.
- Idée en suspens : ranger le journal de partie derrière un bouton.
- Idée d'effet « Ardeur » pour une future légendaire : « ta carte la plus faible ici est doublée ».
- Idées de cartes : Kratos et Zélos (autres enfants de Styx) ; une ultra-légendaire de faction pour Helvara, Désir et Primordial.

## Textes d'effets (13 octobre 2026)
- **Règle (révisée le 14 octobre 2026)** : « +N de puissance » **sans sujet** = la carte elle-même (« Sinon, +4 de puissance. »). On nomme le bénéficiaire seulement quand c'est une **autre** carte (« tes autres cartes ici ont +1 de puissance », « la prochaine carte que tu révèles gagne +3 de puissance »). Même règle pour les malus (« −2 de puissance à la carte adverse la plus forte ici ») ; une perte s'écrit « perd N de puissance ». EN : « +N Power », même logique. Appliquée à tous les textes (FR et EN, cartes sorties comprises) : ne change que les mots, jamais l'effet. À respecter pour toute nouvelle carte.
- Code couleur des mots-clés (`fxH()` dans `js/interface.js`, styles `.kw-*` dans `jeu.css`) : Révélation (corail ✦), Continu (vert ∞), Fatalité (rouge ✠), en FR et en EN. Un nouveau mot-clé : l'ajouter à `FXK` et lui donner une couleur.
- Glisser-déposer : soulever une carte de la main vers le haut et la lâcher sur un lieu (`stageSel()`, bloc « Glisser-déposer » de `js/interface.js`) ; le toucher reste possible, un glissement de côté fait défiler la main.
- Idée en attente (Jordan) : bouton « Lore » renvoyant vers le chapitre 1 (Wattpad ou version comics). Liens à fournir.

## Optimisation (13 octobre 2026, branche `perf/optimisation`)
- **Images en WebP** (étape 1) : toutes les illustrations du jeu (`images/*.webp`, `mini/`, `avatars/`, `lieux/`, `packs/`, `decks/`, fonds) sont en **WebP qualité 80** ; les icônes de rang (`images/rangs/*.webp`) en WebP qualité 85 avec transparence. Les JPEG/PNG d'origine ont été supprimés. **Chaque nouvelle carte = illustration WebP (720 × 1080) + avatar WebP (256 × 256) + miniature WebP 360 × 540** (`images/mini/<id>.webp`), avec `sharp(...).webp({quality:80})`. Seul `images/readme/` reste en JPEG (images du README GitHub). Poids des images : 43 Mo → 29 Mo.
- **Musique** (étape 2) : `audio/*.mp3` réencodés en MP3 128 kbps stéréo 44,1 kHz (mêmes noms ; 8,8 Mo → 5,9 Mo). Durées et silences de début/fin (`mEdges`) mesurés avant/après : identiques à 2 ms près, donc les boucles ne bougent pas. Cache `MBUF` limité à 2 pistes décodées (les pistes en lecture, en fondu ou en pause ne sont jamais évincées). Pour réencoder un nouveau morceau : `ffmpeg -i in.mp3 -map_metadata -1 -c:a libmp3lame -b:a 128k -ac 2 out.mp3`.
- **Préchargement** (étape 3) : `preloadDeck()` (début de `js/interface.js`) met en file les illustrations et avatars des cartes du deck et le morceau de la prochaine partie (`nextPlay`, choisi à l'avance, puis lu tel quel par `musicKey()`). Appelé au chargement, au changement de deck (`deckpick`) et quand le deck atteint 12 cartes. Priorité basse (`fetchPriority`, `fetch priority:"low"`), par petits lots dans `requestIdleCallback`, sans doublon (`PRE`), désactivé si `navigator.connection.saveData` ou réseau 2G. Mesuré : plus long blocage du fil principal 5 ms pour 24 images.
- **PWA** (étape 4) : `manifest.json` (le lien `<link rel="manifest">`, `theme-color` et les icônes sont **dans le `<head>` de la ligne 1** d'`index.html`, juste avant `</head>` : placés après, le navigateur ne voit pas le manifeste et refuse l'installation ; mode « application » `standalone` avec barre d'état — plus prudent que le plein écran demandé au départ, réversible en une ligne —, portrait, fond et thème `#0a0e16`, icônes PNG dans `icones/`), `sw.js` enregistré par un petit script en bas d'`index.html` (pas d'enregistrement quand `navigator.webdriver` est vrai : les tests Playwright restent sans service worker). **Stratégies** : images, musiques, polices, icônes = cache d'abord (cache `helvara-media-<V>`) ; HTML, JS, CSS = réseau d'abord, la page d'accueil est toujours revérifiée (`cache:"no-cache"`), copie en cache seulement sans réseau ou après 4 s sans réponse (cache `helvara-core-<V>`). **Jamais en cache** : tout ce qui n'est pas du site (Supabase, duels en ligne : le service worker ne les intercepte même pas), les requêtes non GET et les requêtes `Range`. **Versions** : `node outils/versions.js` réécrit le bloc entre `VERSIONS-AUTO-DEBUT` et `VERSIONS-AUTO-FIN` de `sw.js` : `CORE_VERSION` (index.html + manifest, donc tous les `?v=`), `MEDIA_VERSION` (contenu de images, audio, fonts, icones : change dès qu'un média change, y compris une illustration remplacée sans changer son nom) et les listes de préchargement. Un déploiement change donc `sw.js` ; le navigateur installe le nouveau service worker, qui supprime les anciens caches `helvara-*` et prend la main (`skipWaiting`, `clients.claim`) ; la page se recharge toute seule une fois, **jamais** pendant une partie, l'ouverture d'un paquet (`packOpen`), la recherche d'adversaire (`mq`) ou un salon de duel (`myMp`, `roomC`) : elle attend la fin (nouvel essai toutes les 3 s). Compromis : quand un média change, le cache media est renouvelé en entier (les images servies se retéléchargent à l'usage). Hors ligne : une partie contre l'IA marche ; **tous les avatars** (miniatures du plateau, adversaire compris) **et les lieux** (~3 Mo, `PRECACHE_LAZY`) sont rangés en arrière-plan après l'activation (`fillLazy`, sans bloquer la page) ; les grandes illustrations sont celles déjà vues ou préchargées (le deck). Connexion Google depuis l'appli installée (Brave, Chrome, testé par Jordan le 13 octobre) : fonctionne, mais il a fallu choisir le compte deux fois. **Interrupteur de secours** : `outils/sw-secours.js`. Si une version de `sw.js` casse le jeu chez les joueurs : `cp outils/sw-secours.js sw.js`, commit, push sur `main`. Au passage suivant, chaque joueur voit ses caches `helvara-*` supprimés, le service worker désinstallé et la page rechargée une fois (seulement celles qu'il contrôlait : pas de boucle) ; sauvegardes intactes. `outils/versions.js` prévient tant que le service worker de secours est en place. Pour revenir : remettre le vrai `sw.js` (`git checkout <commit> -- sw.js`), `node outils/versions.js`, publier. Testé par `outils/tests-pwa.js`. Pages de confidentialité (FR et EN) : paragraphe sur ce cache. **Ne pas ajouter de service externe à `sw.js`** (il ne doit jamais toucher à Supabase). Les pages légales sont aussi servies par le service worker (réseau d'abord).
