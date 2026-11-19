# Duel d'Helvara : feuille de route

> Écrite le 18 novembre 2026 par Karina, mise à jour le soir même. Elle rassemble en un seul endroit :
> l'analyse compétitive du 17 novembre et mon avis (`docs/analyse-competitive-avis-karina.md`),
> le plan d'action du 16 novembre (`docs/plan-action.md`) et les questions encore ouvertes (`docs/calendrier-et-en-attente.md`).
> En cas d'écart avec le code, **le code fait foi**.

## Comment lire ce fichier

- ✅ **Fait** (en vert) : terminé, gardé pour mémoire.
- 🟣 **À faire** : il reste quelque chose, toujours d'actualité.
- 👤 **Toi** : une décision ou un test que toi seul peux faire.
- 🛠️ **Moi** : du code que je fais quand tu donnes le go.

Les parties gardent leur ordre d'origine. Un titre en ✅ veut dire que toute la partie est faite.

---

## 1. 🟣 Tes décisions, celles qui débloquent tout le reste

- ✅ **Le premier lieu** : le Trône de Tiamat (puis les quatre autres, voir 3.1).
- ✅ **Mots-clés de faction : option B**. Ils vont aussi sur les cartes sorties. Il reste à choisir **lesquelles**, faction par faction (voir 3.2).
- ✅ **Tentation (Désir)** : version automatique (la carte choisit pour l'adversaire l'option qui lui fait le plus mal).
- ✅ **Le tutoriel** : le Serment n'était pas assez mis en avant. Refait le 18 novembre (voir 3.4).
- ✅ **Prix itch.io** : 0 €, avec une cagnotte façon « offre-moi un café ».
- ✅ **Économie des CHF** : prix des paquets inchangés ; Serment du Blitz ramené à ±25 (croisé ±50) ; gains de Serment plafonnés à 150 CHF par jour.
- ✅ **Les chiffres du Serment** : validés (tableau ci-dessous).
- 🟣 👤 **Date de sortie** : avant janvier 2027, le plus tôt possible. À fixer quand les chantiers 3.2 à 3.4 auront une taille connue.
- 🟣 👤 **Serment « Intensifier »** (choix secret au tour 3, ×2 ou ×3 sur le Serment du tour 5) : il arrive avec le Voile, après la sortie. Rien à décider avant.

| Sujet | Valeur |
|---|---|
| Duel entre amis | tenu +30 CHF, rompu −15, croisé +60 / −30 (jamais sous 0) |
| Blitz | tenu +25 CHF sur le gain en cours, rompu −25, croisé ±50 |
| Plafond | 150 CHF de gains de Serment par jour, duel et Blitz ensemble (les pertes ne sont pas plafonnées) |
| « Tenu » au profil et pour la quête | lieu gagné, même si la partie est perdue |
| « Tenu » pour les CHF | lieu **et** partie gagnés |
| Serment prêté au tour 5 en duel | ne peut pas être relevé |

---

## 2. 🟣 Ce qu'il reste à vérifier en jouant

- ✅ Duels entre amis sur le vrai serveur : 3 parties, rapides et fonctionnelles.
- ✅ Recherche automatique d'adversaire : réécrite avec une file d'attente dans la base (`file-attente.sql`, lancé dans Supabase et vérifié), testée par toi sur deux navigateurs.
- ✅ Blitz complet avec Serment : testé par toi, l'idée marche.
- ✅ Conseils de fin de partie : réécrits avec tes cinq textes (FR et EN).
- ✅ Aperçu du lien sur Discord : vérifié par toi (avec et sans `?x=1`).
- ✅ Niveau de l'IA : jugé bien meilleur par toi et ton pote. À revoir seulement si besoin.
- ✅ Cartes holo : correctes sur Sony Xperia 10 IV et sur Xiaomi Redmi Note 14 dans Chrome. Dans Messenger, un correctif est en place mais n'a pas été retesté.
- 🟣 👤 Un duel en ligne sur les cinq nouveaux lieux (ils n'ont été joués que contre l'IA).
- 🟣 👤 Musique : mise de côté, et loin. Tu veux d'abord y réfléchir à fond.

---

## 3. 🟣 Les chantiers avant la sortie sur itch.io

Objectif : que le jeu soit différent de Snap dès la première partie, et sortir. Un chantier à la fois, terminé avant d'ouvrir le suivant.

### 3.1 ✅ Lieux à état
Les cinq lieux sont codés avec tes illustrations, mesurés sur 48 000 parties simulées et testés sur écran de téléphone. Détail pour les joueurs : `docs/patch-note-2026-11-18.md`.
- ✅ **Le Trône de Tiamat** : jusqu'au tour 3, +2 au côté qui a moins de cartes ici ; dès le tour 4, au côté qui en a plus. Seul le décompte final compte : les trois premiers tours servent de piège. Les Révélations déjà jouées (Céleste…) restent acquises.
- ✅ **L'Autel du Silence** : les cartes jouées ici perdent leurs effets, Révélation comprise. Il punit les decks à effets (« Destruction » y perd 11 points, et Yarden X Apsu y perd tout son intérêt) : c'est voulu, à revoir dans le temps.
- ✅ **Les Jardins de Désir** : la première carte que chaque joueur joue ici gagne +2.
- ✅ **Les Eaux d'Apsu** (ex-Faille d'Apsu) : la première carte de chaque joueur ici fait perdre 1 à toutes les cartes des lieux voisins, des deux côtés. « Chaque carte » était trop lourd (le vainqueur changeait dans une partie sur quatre).
- ✅ **Le Marché des Ombres** : fin du tour 4, la plus faible de chaque joueur ici change de camp. Elle garde tout, effets compris, et joue pour son nouveau camp.

### 3.2 🟣 🛠️ Mots-clés de faction (option B : cartes sorties comprises)
- 🟣 👤 Choisir, faction par faction, les cartes (sorties ou non) qui reçoivent le mot-clé. Je peux te proposer une première liste.
- 🟣 🛠️ Mesurer toute la faction avant et après : ajouter un mot-clé à des cartes sorties change tout le méta.
- 🟣 **Lien** (Helvara) : +1 de puissance par autre carte Helvara ici, avec un plafond. À mesurer avec les Escaliers du Marché, qui donnent déjà +2 aux cartes Helvara.
- 🟣 **Ère** (Primordial) : effet en plus si la carte est en jeu depuis 2 tours.
- 🟣 **Tentation** (Désir) : version automatique, décidée.
- 🟣 **Verdict** (Jugement) : détruit **une** carte adverse ici sous un seuil, en respectant les protections.
- 🟣 👤 Les effets précis de chaque carte : c'est ta plume.
- 🟣 🛠️ Chaque effet mesuré (outil d'équilibrage + `balance-reviewer`), l'IA apprend à les jouer, cercle des contres vérifié (aucun matchup au-dessus de 60 %).

### 3.3 🟣 🛠️ Chronique 1, en 3 matchs
- 🟣 Un adversaire de faction, puis un adversaire avec un avantage, puis un boss.
- 🟣 Deck persistant, titre permanent, CHF.
- 🟣 Boss : règles spéciales. S'il joue 8 tours, vérifier tous les effets qui disent « tour 6 ».
- 🟣 👤 L'histoire de la Chronique et les portraits des quatre rivaux (provisoires aujourd'hui : Set, Lilith, Anubis, Joanna).

### 3.4 🟣 🛠️ Accueil des nouveaux joueurs
- ✅ **Tutoriel centré sur le Serment, moins guidé** : le Serment présenté dès l'accueil ; l'adversaire jure à la fin du tour 2 ; au tour 3, tu jures où tu veux ou tu relèves son défi (Serment croisé) ; tours 4 à 6 libres, avec des indices ; à la fin, ce que ton Serment aurait valu en partie classée. 👤 À essayer sur ton téléphone.
- 🟣 Partie rapide avec un deck prêté (parmi les 7 decks prêts) dès la première partie.
- 🟣 Ouverture de paquet plus spectaculaire (on part du « Tirage » actuel).
- 🟣 Animations de cartes plus expressives, toujours en bulle par-dessus le plateau.

### 3.4 bis 🟣 🛠️ Duel en ligne classé et anti-triche (avant la sortie, décidé le 18 novembre)
Détail et inventaire de ce qu'un joueur peut modifier : `docs/anti-triche.md`.
- ✅ 🛠️ **Lot A, duels honnêtes** (sans SQL), terminé le 18 novembre (`alpha-0.43`) :
  - ✅ coups adverses interdits refusés (18 novembre, `alpha-0.40`) ;
  - ✅ coups scellés (18 novembre, `alpha-0.41`) ;
  - ✅ graine commune (18 novembre, `alpha-0.42`) ;
  - ✅ deck adverse vérifié (`alpha-0.43`) ; lieu à l'honneur gardé en duel, seulement si les deux téléphones sont d'accord ;
  - 🟣 👤 un duel en ligne entre deux téléphones avec la nouvelle version.
- 🟣 🛠️ **Lot B, « Jouer » contre un humain ou l'IA** :
  - ✅ présence en direct anonyme ; « Jouer » attend 15 s seulement si quelqu'un est libre, sinon IA tout de suite (18 novembre) ;
  - 🛠️ résultat envoyé par les deux joueurs et validé par le serveur, parties gardées 15 jours (décidé le 18 novembre) : codé (`alpha-0.44`). 🟣 👤 coller `duels-valides.sql` dans Supabase après relecture `db-guard`.
- 🟣 🛠️ **Lot C, classement** : étoiles des duels en ligne seulement sur résultat validé, plafonds de `board_submit` revus. 👤 SQL à valider.
- ✅ Le classé en ligne : **un seul classement** pour la sortie (étoiles contre l'IA, plafonnées par le serveur, et contre les humains, sur résultat validé). Un classement « en ligne » séparé viendra plus tard (4.2).

### 3.5 🟣 Préparer la sortie (en parallèle, sans rien publier)
- 🟣 👤🛠️ Page itch.io en brouillon : textes FR et EN, captures, prix 0 € et cagnotte.
- 🟣 🛠️ Séquences de jeu enregistrées pour le trailer de 30 secondes. 👤 Toi : le montage.
- 🟣 👤 Devlog r/gamedev (le seul post possible avant la sortie).
- 🟣 👤 **Droits sur les illustrations** : relire les conditions de l'outil qui les a générées avant d'activer la cagnotte. Un avis rapide d'un pro serait utile.
- 🟣 🛠️ Bouton de partage (victoire, carte tirée).
- ✅ Licence : « Tous droits réservés » (fichier `LICENSE`). Ne **jamais** écrire « open source ».

### 3.6 🟣 La sortie
- 🟣 👤 Le même jour : itch.io, Reddit (règles de chaque subreddit lues avant), thread X, Discord.
- 🟣 👤 Accroche centrée sur Helvara (le Serment, aucune carte à acheter), sans le nom de Snap en titre.

---

## 4. 🟣 Après la sortie

### 4.1 🟣 Priorité n°1 : la première grosse mise à jour
- 🟣 🛠️ **Le Voile** : d'abord contre l'IA, puis en duel en ligne. 👤 Règles à trancher avant : garde-t-il son effet Révélation ? peut-on le détruire ? la puissance affichée du lieu le compte-t-elle ?
- 🟣 🛠️ **Serment « Intensifier »** + paliers Bronze / Argent / Or.
- 🟣 👤 Une annonce rien que pour elle : la deuxième occasion de faire parler du jeu.

### 4.2 🟣 Ensuite
- 🟣 🛠️ Classement « en ligne » séparé : seuls les duels contre des humains, validés par le serveur, y comptent.
- 🟣 🛠️ Cosmétiques gagnés en CHF : un dos de carte et un effet de victoire pour commencer, puis la boutique rotative (« l'échoppe du jour » étendue).
- 🟣 👤 Art alternatif (le jeu gère déjà les variantes, et elles peuvent recevoir `vfx` ou holo).
- 🟣 🛠️ Classement saisonnier avec récompenses cosmétiques.
- 🟣 👤 Tournoi sur Discord avec les duels entre amis, IndieDB, vidéo YouTube, petits streamers.
- 🟣 🛠️ Chronique 2 (cartes temporaires et handicaps entre les matchs).
- 🟣 🛠️ Défi du jour, decks fantômes (écrivent dans Supabase : relecture `db-guard` et ton accord avant).
- 🟣 🛠️ Rattrapage : un deck de faction offert après 5 parties. Buts de collection visibles.
- 🟣 👤 Google Play (compte développeur payant) et nom de domaine (prévoir le passage : la sauvegarde locale ne suit pas un changement d'adresse).

### 4.3 🟣 Plus tard, quand il y aura des joueurs
- 🟣 Vente dans le jeu en vrai argent (prestataire de paiement, pages légales FR et EN, CSP, suivi des achats).
- 🟣 Battle Pass premium, badge supporter dans le jeu (en attendant : un rôle Discord donné à la main).
- 🟣 Mode spectateur, tournoi dans le jeu, émotes.
- 🟣 Nouvelles langues, selon d'où viennent les joueurs.
- ✅ File d'attente en direct : remplacée par la file dans la base (18 novembre).

---

## 5. 🟣 Le contenu en attente (ta plume)

- 🟣 👤 **45 cartes sans effet**, cachées : elles peuvent recevoir les mots-clés, en plus des cartes sorties (option B). Leurs coûts, puissances, raretés et factions sont souvent provisoires. Liste complète dans `docs/calendrier-et-en-attente.md`, partie « En attente ».
- 🟣 👤 Famille Serment « Juré » et « Parjure » (plan du 16 novembre) : à fusionner ou non avec les mots-clés de faction. Les deux puisent dans les mêmes 45 cartes.
- 🟣 👤 Saison Saint-Valentin : les illustrations et la musique sont prêtes, il manque les effets des cartes et celui de Nike V.
- 🟣 👤 Noms à confirmer : `reflet_noir` (à renommer), « L'Enfant sans École ».
- 🟣 👤 Questions du 22 octobre : formulation « univers d'Helvara, inspiré de Lausanne » dans le tutoriel, La Source (50 parties avec 8 cartes Helvara ?), nuance de Vesta, cartes holo sans coût ni nom affichés.
- 🟣 👤 Marduk, Ymir, Nammu : ultra-légendaires de faction ou pas ?
- 🟣 👤 Raccourcir les textes de lieux les plus longs (le Trône et les Eaux d'Apsu sont les nouveaux plus longs).
- 🟣 👤 Gel des nouvelles cartes jusqu'au lot de mars (hors mots-clés et Serment) : toujours d'actualité ?

---

## 6. ✅ `CLAUDE.md` retravaillé

### 6.1 ✅ Les garde-fous, gardés tels quels
- ✅ Aucun secret ni adresse e-mail personnelle dans le dépôt.
- ✅ Pas de `push --force`, pas de réécriture de l'historique.
- ✅ Supabase : lecture seule d'abord, toute écriture validée par toi (c'est la base en direct, avec les vrais joueurs).
- ✅ `gPick` / `gShuffle` pour le hasard, `BUILD` à changer, `node outils/versions.js` et les tests après chaque modification.
- ✅ CSP, aucun site tiers au chargement, service worker sans Supabase, pseudos échappés.

### 6.2 ✅ Les décisions de design, revues le 18 novembre
- ✅ **« Sous 100 decks, ne rien décider »** : assouplie. Correction légère d'une carte sortie possible sur simulation (écart au-delà de ±8 points) ; grosse refonte = stats réelles croisées avec la simulation.
- ✅ **Cartes sorties et mots-clés** : option B, chaque vague mesurée avant publication.
- ✅ **`vfx` et holo** : ouverts aux variantes d'art alternatif, quelle que soit leur rareté.
- ✅ **Publication** : on travaille sur une branche. Push sur `main` ou PR **seulement si tu le demandes** ; sinon, tu ouvres la PR et fusionnes toi-même.
- ✅ `CLAUDE.md` réécrit (garde-fous séparés des décisions de design, lien vers ce fichier) et fusionné sur `main`.

---

## 7. ✅ Déjà fait

### Vague 1 (en ligne sur `main`)
- ✅ Serment : étape au tour 5 du tutoriel, cérémonie (sceau sur le lieu), compteurs au profil.
- ✅ Serment caché dans les duels entre amis, révélé en fin de tour, et Serment dans le Blitz.
- ✅ Fin de partie : tableau « Toi / IA » et bilan avec conseil.
- ✅ Journal de partie derrière un bouton, un seul bandeau à l'accueil, règles des lieux sur trois lignes avec bouton « i ».
- ✅ Aperçu du lien pour Discord et WhatsApp.
- ✅ Corrections d'interface (panneau d'aide, Cathédrale d'Helvara), tests holo et PWA réparés, illustrations adverses préchargées.

### Solo et progression
- ✅ Rivaux nommés (Exodus, Clara, Timothée, Mira) avec tempérament (allin, bluff, prudent, zele).
- ✅ Decks prêts : 7 archétypes en un bouton.
- ✅ But des ultra-légendaires de faction visible (date et parties restantes).
- ✅ Blitz débloqué après 10 parties, un seul bouton « Jouer » à l'accueil.
- ✅ Aide « ? » rangée en rubriques, recherche d'avatar, 33 portraits recadrés.

### Écran de partie (17 novembre)
- ✅ Écran de partie fixe pour tous : le plateau ne change jamais de taille, tout ce qui est passager flotte en bulle.
- ✅ Tutoriel adapté à l'écran fixe, bouton ± près de l'énergie.

### 18 novembre
- ✅ Analyse compétitive relue et commentée partie par partie (`docs/analyse-competitive-avis-karina.md`).
- ✅ Cinq lieux à état : Trône de Tiamat, Autel du Silence, Jardins de Désir, Eaux d'Apsu, Marché des Ombres.
- ✅ Serment rééquilibré (Blitz ±25, plafond de 150 CHF par jour).
- ✅ Recherche d'adversaire en ligne refaite avec la file d'attente dans la base, pages de confidentialité FR et EN à jour.
- ✅ Holo allégé dans les navigateurs intégrés et sur les petits téléphones.
- ✅ Conseils de fin de partie réécrits.
- ✅ Patch note joueurs : `docs/patch-note-2026-11-18.md`.
- ✅ Le Voile fixé comme priorité n°1 après la sortie, Chronique 1 réduite à 3 matchs.
