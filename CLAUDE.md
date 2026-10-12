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
| `README.md` | Présentation du jeu sur GitHub (français et anglais), lien de jeu et Discord |
| `supabase.sql`, `nettoyage.sql` | Scripts à coller dans Supabase → SQL Editor |
| `outils/equilibrage.js`, `rapport-cartes.md` | Outil d'équilibrage (IA contre IA avec le vrai moteur, hors du jeu) et son rapport |
| `images/` | Illustrations des cartes (`<id>.jpg`) |
| `images/avatars/` | Portraits carrés (`<id>.jpg`) |
| `images/mini/` | Illustrations réduites pour les grilles (360 × 540) |
| `images/lieux/`, `images/packs/` | Lieux et paquets |
| `audio/` | Musiques : `accueil*`, `partie`, `partie_2`, `partie_tension` (dès le tour 5), jingles `victoire` et `defaite` |

---

## Ajouter une carte (la tâche la plus courante)

### 1. Les images (toujours deux par carte)

| Image | Format | Chemin |
|---|---|---|
| Carte | 720 × 1080, JPEG qualité 82 | `images/<id>.jpg` |
| Avatar | 256 × 256, JPEG qualité 85, **recadré à la main sur le visage** | `images/avatars/<id>.jpg` |

L'avatar sert de portrait au joueur, mais aussi de **miniature sur le plateau**. Il est donc obligatoire.

Troisième image, générée à partir de la carte : `images/mini/<id>.jpg` (360 × 540, qualité 78), utilisée par la collection.

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
- **Musique** : `music()` choisit la piste (`musicKey()`). Chaque morceau est décodé une fois (`mBuf`, 3 au plus en mémoire) et joué par Web Audio (`AudioBufferSourceNode`, plus d'élément `<audio>` sauf en repli) : boucle sans coupure, en sautant le silence du début et de la fin (`mEdges`, `loopStart`/`loopEnd`). Fondus par `GainNode` (`mTrack`, `mPlay`, `mPause`, `mRamp`, `mStop`), deux morceaux au plus ; la tension est préchargée au tour 4. `endMusic(res)` : le morceau de la partie s'efface en 1 s et se met en pause (`bgmHold`), jingle, puis **le même morceau reprend là où il était**, en fondu de 2,5 s (`endKey`) ; l'accueil ne revient qu'en quittant l'écran de partie. Sur une égalité, le morceau continue. Volumes `P.vm` (musique, défaut 35) et `P.vs` (effets, défaut 100, bus `sfxBus()`). Pour retirer le silence de fin d'un morceau : `ffmpeg -i in.mp3 -af "areverse,silenceremove=start_periods=1:start_threshold=-45dB,afade=t=in:st=0:d=0.03,areverse" -b:a 192k out.mp3` (le fondu se place pendant l'inversion, sinon tout le morceau devient muet).

- **Sauvegarde** : `save()` écrit tout de suite en local (avec `P.at`, heure de la modification) puis envoie au compte 0,5 s plus tard (`flush`). Un envoi raté est retenté (3 s, puis jusqu'à 60 s) et renvoyé dès que la page se cache. Au chargement (`initStore`), la sauvegarde locale l'emporte sur celle du compte seulement si elle est plus récente **et** appartient au même joueur (`OWNER_KEY` = `duel-helvara-save-owner`) ; sinon le compte gagne. Corrige le bug du 9 octobre (booster perdu et CHF rendus après un retour arrière : l'envoi au compte avait échoué et la vieille sauvegarde en ligne écrasait la locale).

- **Classement** : table `board` (une ligne par joueur, chacun n'écrit que la sienne). `lbPublish()` envoie la ligne après chaque partie classée contre l'IA, au chargement, et après un changement de pseudo ou d'avatar ; un envoi raté est retenté (5 s, puis jusqu'à 2 min) et renvoyé au retour au premier plan. L'affichage (`boardHTML`) mélange la table et la présence en direct du salon (« en ligne »). `cloud.js` relit la table au retour au premier plan et toutes les 60 s. Corrigé le 10 octobre : avant, un seul envoi raté (session expirée au réveil du téléphone) coupait les mises à jour jusqu'au rechargement ; le relais hérité des artefacts (`lbRelay`, qui écrivait la ligne des autres) a été retiré.

- **Classement sécurisé (12 octobre, audit étape 1)** : les joueurs n'ont plus aucun droit d'écriture sur `board` (policies insert/update retirées, `revoke`). `lbPublish()` → `doc("board/…").set()` de `cloud.js` appelle la fonction SQL `board_submit` (fichier `classement-securise.sql`, à coller dans Supabase par Jordan, après `supabase.sql`) : `security definer`, identité = `auth.uid()`, 1 partie/minute (réserve de 10, 200/jour), au plus +4 étoiles par victoire, compteurs jamais en baisse, pseudo et avatar nettoyés, changement de saison recalculé comme `checkSeason()`. Une annonce trop forte est **réduite** à ce qui est plausible (pas de refus : le reste se rattrape aux parties suivantes). Table privée `board_guard` (réserve et plafond du jour). **Transition** : si la fonction n'existe pas encore (`PGRST202`), `cloud.js` écrit comme avant ; après le SQL, un refus ne bascule jamais sur l'écriture directe. `supabase.sql` ne recrée plus les droits d'écriture. **La présence du salon ne porte plus de chiffres** (`lb:{uid}`) et `boardHTML` n'en tire que « en ligne » : avant, un joueur pouvait y diffuser de faux rangs, même sous le pseudo d'un autre. Les joueurs sans compte enregistré n'apparaissent donc plus chez les autres. Reste falsifiable : le serveur ne peut pas savoir si une partie a vraiment eu lieu (un script patient peut envoyer ~1 victoire par minute par compte), paquets et collection sont tirés dans le navigateur.
- **Lecture du classement allégée (12 octobre, audit étape 2)** : `lbRefresh()` appelle `boardTop` (`cloud.js`) → fonction SQL `board_top` (`classement-allege.sql`, à coller dans Supabase après `classement-securise.sql`) : 100 meilleurs de la saison + 30 du mois précédent + ta ligne, triés par la base (index `board_rang_idx`). Relecture au chargement, au retour au premier plan et en ouvrant l'accueil ou le classement, au plus toutes les 30 s ; **plus de temps réel ni de relecture toutes les 60 s** (l'ancien `collection().onSnapshot` est supprimé). Le badge « en ligne » est devenu « actif » (ligne mise à jour par le serveur dans les 10 dernières minutes). Tant que `board_top` n'existe pas, `cloud.js` lit les 200 dernières lignes.
- **Comptes fantômes** : `comptes-fantomes.sql` (tâche pg_cron `helvara-fantomes`, chaque nuit à 3 h 30 UTC) supprime les comptes anonymes sans aucune partie terminée et inactifs depuis 14 jours. Ne pas relancer `nettoyage.sql` en entier pour ça (le bloc 2 vide les anonymes du classement). Protection anti-robot (captcha) : pas encore intégrée au jeu (voir la proposition faite à Jordan : un service tiers, donc page de confidentialité et CSP à mettre à jour).
- **Duels en ligne** (section « DUEL ENTRE AMIS » de `index.html`) : un canal de présence Supabase **par code de salon** (`helvara-room-<CODE>`, ouvert seulement pour un duel : `roomC`, `rtOpen("c",…)`) et un canal de **file d'attente** `helvara-queue` (`roomQ`, ouvert seulement pendant la recherche). Plus aucune connexion en direct pour qui joue contre l'IA ou regarde le classement (le salon commun `helvara-salon` est supprimé : tout le monde y recevait la présence de tout le monde). Déroulement identique chez les deux joueurs (lockstep, tirage partagé). Salon avec code : `mpCreate`, `mpJoin` → `mpJoinCode(code)` (async : ouvrent le canal puis publient). `cloud.js` : `claude.use("room:<canal>")` renvoie un salon avec `leave()`. L'invité rejoint le salon avant de quitter la file (sinon l'hôte croit qu'il est parti). **`BUILD`** (ex. `alpha-0.1`) est publié dans `mpBase()` et dans la file : deux versions différentes ne lancent jamais de match (« Version différente : recharge la page »). **Changer `BUILD` à chaque modification qui touche au déroulement d'une partie.**
- **En ligne (Alpha)**, appariement sans code : `mqStart` publie `q={tok,ver,at}` dans `helvara-queue` ; `mqTick` trie les jetons de même version (hors cet onglet, ce compte et les joueurs déjà appariés) et apparie 0-1, 2-3… Le plus petit crée un salon (`mpCreate`) et publie `q.room` + `q.with` ; l'autre rejoint (`mpJoinCode`). Puis `q` est vidé. Hôte sans invité au bout de 15 s : il relance la recherche. 90 s sans adversaire : arrêt et message. Mêmes règles que le salon : CHF et quêtes, pas de rang.

**Règle des fusions (Jordan, 10 octobre)** : une fusion de base n'exige que les cartes de base ; une variante saisonnière n'ouvre pas la fusion de base. Une fusion saisonnière (`ulqetjor_r`, `ulpele_r`, `ulqetjor_v`…) exige la variante. Jordan et Jordan le Narrateur restent interchangeables. Il faut donc être là pendant la saison. Dans `ULS`, ne mettre une variante dans un `req` que si la fusion est elle-même saisonnière.

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

- **CSP** : balise `<meta http-equiv="Content-Security-Policy">` dans `index.html` (dans le premier `<head>`, celui de la ligne 1 : un meta placé après est ignoré). Autorise `'self'`, `'unsafe-inline'` (le jeu est un seul fichier avec script et styles intégrés), et seulement le projet Supabase pour `connect-src`. Tout nouveau service externe (API, police, image distante) doit être ajouté à cette liste, sinon il sera bloqué. À vérifier en vrai : connexion Google et salon en direct.
- **Historique** : 20 parties (`HIST_MAX`), détail par lieu, cartes, gain, rang ; écran `hist` depuis le profil ; assaini au chargement par `cleanHist`.
- **Ouverture de paquet** : `packOpenHTML()`, retournement de la carte (Commune/Rare : gerbe dorée) ou sceau brisé (Épique et plus), sans hasard (positions déduites de l'index), coupé par `prefers-reduced-motion`.

## Performances sur téléphone (12 octobre)

- **Particules saisonnières** (`html[data-season] body::after`) : animées par `transform` (calque déplacé), jamais par `background-position` (qui repeignait tout l'écran à chaque image : l'accueil tombait de 60 à 45 images/s pendant Halloween).
- **Grilles** (collection, codex) : `content-visibility:auto` sur chaque carte (hors écran = ni dessinée ni décodée), pas de reflet, de poussières ni de holo animé, pas de flou sur les cartes « Bientôt ». Illustrations réduites `images/mini/<fichier>.jpg` (360 × 540, qualité 78) via `gridArt(()=>…)` qui active `ART_MINI` pendant le rendu. **Chaque nouvelle carte doit aussi avoir sa miniature** (`sharp(src).resize(360,540,{fit:'cover'}).jpeg({quality:78,mozjpeg:true})`), sinon la grille affichera une case vide.
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

- **Lancer** : `node outils/equilibrage.js` (2000 parties par défaut, ~10 s) ou `--parties 6000` ; options dans l'en-tête du script (`--palier`, `--date`, `--inclure-cachees`, `--graine`, `--ouvriers`, `--sortie`, `--brut`). Écrit `rapport-cartes.md` à la racine. Nécessite Playwright et Chromium (voir Tests).
- **Principe** : charge `index.html` dans Chromium sans réseau (faux Supabase) et fait jouer `aiPlan("p")` contre `aiPlan("e")` avec le vrai moteur (`newGame`, `resolveTurn`, `finish`). Seuls l'affichage, le son et la sauvegarde sont neutralisés (`render`, `sfx`, `save`, `pushHist`, `qProg`…). **Rien du moteur n'est recopié** : si le moteur change, l'outil suit. Le deck adverse passe par un `aiDeck` remplacé le temps de `newGame()`.
- **Decks** : tirés au hasard avec les règles du jeu (une version par personnage, une seule ultra-légendaire dont les conditions sont remplies), faction dominante, courbe de coûts raisonnable ; 1 sur 4 vient d'`aiDeck(palier, true)`. **Reproductible** : une graine par partie (`--graine`), mêmes parties quel que soit le nombre d'ouvriers (testé : 400 parties identiques avec 2 et 3 ouvriers). Pour rester reproductible, chaque partie remet `RNG`, `P.lv`, `P.streak`… à un état fixe.
- **Rapport** : santé du moteur (erreurs, puissances NaN, erreurs de console), répartition rareté × coût (toutes les cartes, sorties, pas sorties), statistiques par carte (victoire en deck et posée, taux de pose, puissance de fin, survie, tour de pose), victoire par coût, rareté et faction, liste de TOUTES les cartes pas encore sorties avec leurs valeurs provisoires, effets qui se ressemblent (familles, formulations presque identiques, même cible). **Ne propose aucun chiffre.**
- **Limites à garder en tête** : c'est de l'IA contre IA, donc une carte qui demande une combinaison (Hel, Hadès…) peut paraître faible parce que l'IA la pose peu ; le tirage de decks n'est pas celui des joueurs ; sous 100 decks, marge d'erreur > ±10 points.
- Première mesure (6000 parties, palier 5) : aucune erreur ; le camp qui révèle en premier gagne 48,9 % ; victoire par rareté 48,9 à 55 % (ultra-légendaires 55 %), par faction 48,2 à 52 % (Jugement en tête).

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
| 1er nov. | Vague de novembre (Nemesis, Anubis, Médée, la Voleuse…), 3 fusions. Coûts revus avant sortie (8 oct.) : Brigid, Tefnut et Dionysos 2/2, Bourreau 3/2, Chernobog 4/4, Médée Mariée Spectrale et Poséidon 4/3, Qetesh 4/2, Seigneur de la marée noire 6/8, Balor 6/5. Effets revus avant sortie : Messagère d'Hécate (Continu : +2 par fin de tour si elle ne mène pas, 6 max), Médée (Continu : la prochaine carte adverse jouée ici perd 2), Aphrodite et Aphrodite X Yarden (rejouent des Révélations), Dante (+1 par destruction ici), Susanoo (déplace sa carte la plus faible, +3) |
| **15 nov.** (annonce le 10) | **Vague « énergie »** : Prométhée (L, Primordial), Pandore (E, Désir), Athéna (E), Bia (R), Styx (L), **Nike** (U de faction, Jugement) |
| 1er déc. | Vague de décembre : 17 cartes, 5 fusions, lieu Domaine du Créateur, jetons Mjölnir, Ombre, Pourceau. Le Boucher de la Riponne détruit désormais sa carte la plus faible et pioche |
| 31 déc. → 18 janv. | Paquet « Pli du Douzième Coup » (annonce le 26 déc.) : Hel Reine du Réveillon, Éos de Nouvel An, Pele du Réveillon, Qetesh du Nouvel An (toutes `ex:"nouvelan"`) + fusions Pele X Jordan du Réveillon (`ulpele_r`) et Qetesh X Jordan du Nouvel An (`ulqetjor_r`, exige `qetesh_r`) |

**Thème de la vague du 15 novembre** :
- Prométhée garde l'énergie non dépensée (10 maximum).
- Pandore la dépense (+1 de puissance par énergie).
- Bia coupe la réserve adverse.
- Styx donne +3 à Nike et à Bia, et rend ses cartes Jugement indestructibles dans son lieu.
- Nike : +2 par carte jouée avant elle ce tour. Elle se **gagne dans le Journal des factions** (50 parties jouées avec au moins 8 cartes Jugement, décision de Jordan du 12 octobre ; avant : 7 autres cartes Jugement en collection), et se joue avec 8 cartes Jugement dans le deck, elle comprise.

---

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
- **4 cartes ajoutées plus tard le 12 octobre (fin de la série de 25), cachées** : `effigie`, `reflet_noir` (Jordan veut changer le nom ; `reflet` est déjà le jeton du Lac Ouchy), `enfant` (« L'Enfant sans École » : Jordan avait écrit « sans éco », à confirmer) : sans effet, factions Helvara devinées, 3/3 épique provisoires ; et **`ananke`**, ultra-légendaire de faction Primordial, avec son effet (voir ci-dessous). `images/enfant.jpg` : la bordure noire de l'image d'origine a été rognée.
- **Ananké** (coût 6, puissance 1, `ULS` : 8 cartes Primordial dont elle, `quest:{k:"primordial",n:50}` par défaut comme Nike, à confirmer avec Jordan). **Fatalité** : `fated(c)` = ni détruite (`destroy`, Faille, Nyx, Ereshkigal), ni déplacée (Set, Éris, Lilith, Hermès, Susanoo, Heimdall), ni affaiblie (`noWeak` : `weaken`, Hathor, Cirque ; plus Mouche, Chernobog, Inanna, Oya, Circé, Calypso). Continu : Apsu et Mohini (`neg`) la privent de cette protection. **Révélation** : sa puissance devient la puissance totale adverse dans ce lieu +1, au moment de la révélation (les cartes adverses pas encore révélées ce tour ne comptent pas : jouer après elles vaut plus). IA : `place()` ajoute la puissance adverse du lieu. `vfx:"ananke"` dans `MIX`. Pas de cinématique de pose (`FACTION_CINE`). `BUILD` passé à `alpha-0.2`.
- **Conservation des données** : `supabase.sql` relancé le 11 octobre (fonction `delete_my_account` en place, 0 erreur) ; le bouton « Supprimer mon compte » a été essayé avec le vrai serveur par Jordan (compte Google d'essai) : il fonctionne. Le nettoyage des comptes inactifs est planifié depuis le 11 octobre (pg_cron activé, tâche `helvara-conservation`, tous les lundis à 4 h UTC, vérifiée dans `cron.job`) : rien n'expire avant octobre 2027. `supabase.sql` relancé aussi après l'ajout de la règle DELETE sur `saves`.
- Musique `audio/accueil_nouvelan.mp3` (optionnelle).
- Fin octobre : faire le point sur les rangs (série de victoires) et sur Mohini. Surveiller le combo Lip Dentelle → Hel.
- Mi-novembre : surveiller le deck Jugement « énergie ». Leviers : bonus de Styx à +2, réserve de Prométhée à 6.
- Idée en suspens : ranger le journal de partie derrière un bouton.
- Idée d'effet « Ardeur » pour une future légendaire : « ta carte la plus faible ici est doublée ».
- Idées de cartes : Kratos et Zélos (autres enfants de Styx) ; une ultra-légendaire de faction pour Helvara, Désir et Primordial.
