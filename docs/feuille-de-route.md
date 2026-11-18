# Duel d'Helvara : feuille de route

> Écrite le 18 novembre 2026 par Karina. Elle rassemble en un seul endroit :
> l'analyse compétitive du 17 novembre et mon avis (`docs/analyse-competitive-avis-karina.md`),
> le plan d'action du 16 novembre (`docs/plan-action.md`) et les questions encore ouvertes (`docs/calendrier-et-en-attente.md`).
> En cas d'écart avec le code, **le code fait foi**.

## Comment lire ce fichier

- 🟣 **Pas fini** : c'est là qu'il faut regarder.
- ✅ **Fait** : rangé tout en bas, pour mémoire.
- 👤 **Toi** : une décision ou un test que toi seul peux faire.
- 🛠️ **Moi** : du code que je fais quand tu donnes le go.

Ce qui n'est pas fini vient en premier, dans l'ordre où il faut le traiter.

---

## 1. 🟣 Tes décisions, celles qui débloquent tout le reste

Tant que ces points ne sont pas tranchés, je ne peux pas commencer les chantiers qui en dépendent.

- ✅ **Mots-clés de faction : option B** (décidé le 18 novembre). Ils vont aussi sur les cartes sorties. Il reste à choisir **lesquelles**, faction par faction (voir 3.2).
- 🟣 👤 **Serment « Intensifier »** : est-ce qu'il te plaît tel que décrit (choix secret au tour 3, ×2 ou ×3 sur le Serment du tour 5) ? Il arrive après la sortie, on a le temps.
- 🟣 👤 **Date de sortie** : avant janvier 2027, le plus tôt possible. À fixer quand les chantiers 3.1 à 3.4 auront une taille connue.
- 🟣 👤 **Économie des CHF avec le Serment** : peur que les gains du Serment fassent finir la collection trop vite. Pistes : paquets +50 ou +75 CHF, ou plafonner les gains du Serment. Analyse chiffrée en cours.
- 🟣 👤 **Les chiffres provisoires du Serment** (dans `OATH_CHF`, en tête de `js/moteur.js`) : à valider ou à changer d'après tes parties.

| Sujet | Choix provisoire |
|---|---|
| Duel entre amis | tenu +30 CHF, rompu −15, croisé +60 / −30 (jamais sous 0) |
| Blitz | tenu +50 CHF sur le gain en cours, rompu −50, croisé ±100 |
| « Tenu » au profil et pour la quête | lieu gagné, même si la partie est perdue |
| « Tenu » pour les CHF | lieu **et** partie gagnés |
| Serment prêté au tour 5 en duel | ne peut pas être relevé |

---

## 2. 🟣 Ce qu'il reste à vérifier en jouant

Tu as déjà fait beaucoup de tests (25 parties depuis hier). Ces points n'ont **pas encore été notés comme vérifiés** : si c'est déjà fait, dis-le-moi et je coche.

- 🟣 👤 **Un vrai duel entre amis avec Serment, sur le vrai serveur.** Il n'a tourné que dans un faux salon de test.
- 🟣 🛠️ **Recherche automatique d'adversaire en ligne** : « très foireuse » d'après toi. Diagnostic du code en cours ; il me faudra aussi ce que tu vois exactement (message, écran, combien de temps).
- 🟣 👤 L'aperçu du lien sur Discord après publication (ajouter `?x=1` au lien si l'ancien aperçu reste).
- 🟣 👤 Musique : l'idée de la tension au tour 5 plaît, mais la gestion ou les morceaux pourraient être meilleurs. Mis de côté.
- 🟣 👤 Cartes holo : elles marchent sur ton PC, **pas chez ton pote**. Il me faut son téléphone, son navigateur et une capture.

---

## 3. 🟣 Les chantiers avant la sortie sur itch.io

Objectif : que le jeu soit différent de Snap dès la première partie, et sortir. Un chantier à la fois, terminé avant d'ouvrir le suivant.

### 3.1 🟣 🛠️ Lieux à état
- ✅ Trône de Tiamat (change de camp au tour 4), avec ton illustration.
- 🟣 Autel du Silence (aucun effet Révélation ni Continu ici)
- 🟣 Marché des Ombres (au tour 4, échange la carte la plus faible de chaque joueur ici). À trancher : la carte échangée garde-t-elle son effet Continu ?
- 🟣 Le lieu « voisins », ex-Faille d'Apsu : nouveau nom à trouver (« La Faille » existe déjà), et il affecte « les lieux voisins » plutôt que « le lieu de droite ».
- 🟣 Jardins de Désir, version adaptée au jeu simultané : « la première carte que tu joues ici gagne +2 ».
- 🟣 👤 Une illustration par lieu (800 × 597), de ta main.

### 3.2 🟣 🛠️ Mots-clés de faction (option B : cartes sorties comprises)
- 🟣 👤 Choisir, faction par faction, les cartes (sorties ou non) qui reçoivent le mot-clé. Je peux te proposer une première liste.
- 🟣 🛠️ Mesurer toute la faction avant et après : ajouter un mot-clé à des cartes sorties change tout le méta.
- 🟣 **Lien** (Helvara) : +1 de puissance par autre carte Helvara ici, avec un plafond. À mesurer avec les Escaliers du Marché, qui donnent déjà +2 aux cartes Helvara.
- 🟣 **Ère** (Primordial) : effet en plus si la carte est en jeu depuis 2 tours.
- 🟣 **Tentation** (Désir) : version automatique (la carte choisit pour l'adversaire l'option qui lui fait le plus mal).
- 🟣 **Verdict** (Jugement) : détruit **une** carte adverse ici sous un seuil, en respectant les protections.
- 🟣 👤 Les effets précis de chaque carte : c'est ta plume.
- 🟣 🛠️ Chaque effet mesuré (outil d'équilibrage + `balance-reviewer`), l'IA apprend à les jouer, cercle des contres vérifié (aucun matchup au-dessus de 60 %).

### 3.3 🟣 🛠️ Chronique 1, en 3 matchs
- 🟣 Un adversaire de faction, puis un adversaire avec un avantage, puis un boss.
- 🟣 Deck persistant, titre permanent, CHF.
- 🟣 Boss : règles spéciales. S'il joue 8 tours, vérifier tous les effets qui disent « tour 6 ».
- 🟣 👤 L'histoire de la Chronique et les portraits des quatre rivaux (provisoires aujourd'hui : Set, Lilith, Anubis, Joanna).

### 3.4 🟣 🛠️ Accueil des nouveaux joueurs
- 🟣 Partie rapide avec un deck prêté (parmi les 7 decks prêts) dès la première partie.
- 🟣 Tutoriel repris : le Serment n'est pas assez mis en avant alors que c'est la marque du jeu. Le rendre plus central et moins guidé.
- 🟣 Ouverture de paquet plus spectaculaire (on part du « Tirage » actuel).
- 🟣 Animations de cartes plus expressives, toujours en bulle par-dessus le plateau.

### 3.5 🟣 Préparer la sortie (en parallèle, sans rien publier)
- 🟣 👤🛠️ Page itch.io en brouillon : textes FR et EN, captures, prix libre.
- 🟣 🛠️ Séquences de jeu enregistrées pour le trailer de 30 secondes. 👤 Toi : le montage.
- 🟣 👤 Devlog r/gamedev (le seul post possible avant la sortie).
- 🟣 👤 **Droits sur les illustrations** : relire les conditions de l'outil qui les a générées avant d'activer un prix. Un avis rapide d'un pro serait utile.
- 🟣 🛠️ Bouton de partage (victoire, carte tirée).
- 🟣 Ne **jamais** écrire « open source » : le jeu est « Tous droits réservés » (fichier `LICENSE`), et c'est très bien comme ça.

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
- 🟣 🛠️ Cosmétiques gagnés en CHF : un dos de carte et un effet de victoire pour commencer, puis la boutique rotative (« l'échoppe du jour » étendue).
- 🟣 👤 Art alternatif (le jeu gère déjà les variantes).
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
- 🟣 Abandonner ou garder la file d'attente en direct (à revoir après un vrai duel sur le serveur).

---

## 5. 🟣 Le contenu en attente (ta plume)

- 🟣 👤 **45 cartes sans effet**, cachées : elles peuvent recevoir les mots-clés, en plus des cartes sorties (option B). Leurs coûts, puissances, raretés et factions sont souvent provisoires. Liste complète dans `docs/calendrier-et-en-attente.md`, partie « En attente ».
- 🟣 👤 Famille Serment « Juré » et « Parjure » (plan du 16 novembre) : à fusionner ou non avec les mots-clés de faction. Les deux puisent dans les mêmes 45 cartes.
- 🟣 👤 Saison Saint-Valentin : les illustrations et la musique sont prêtes, il manque les effets des cartes et celui de Nike V.
- 🟣 👤 Noms à confirmer : `reflet_noir` (à renommer), « L'Enfant sans École ».
- 🟣 👤 Questions du 22 octobre : formulation « univers d'Helvara, inspiré de Lausanne » dans le tutoriel, La Source (50 parties avec 8 cartes Helvara ?), nuance de Vesta, cartes holo sans coût ni nom affichés.
- 🟣 👤 Marduk, Ymir, Nammu : ultra-légendaires de faction ou pas ?
- 🟣 👤 Raccourcir les textes de lieux les plus longs.
- 🟣 👤 Gel des nouvelles cartes jusqu'au lot de mars (hors mots-clés et Serment) : toujours d'actualité ?

---

## 6. `CLAUDE.md` retravaillé le 18 novembre

Ton intuition est juste : une partie du fichier freine. Mais il mélange deux choses très différentes, et il ne faut pas les traiter pareil.

### 6.1 Les garde-fous, à garder tels quels
Ils te protègent, toi et tes joueurs. Les retirer, c'est risquer de casser quelque chose qu'on ne peut pas réparer.
- Aucun secret ni adresse e-mail personnelle dans le dépôt.
- Pas de `push --force`, pas de réécriture de l'historique.
- Supabase : lecture seule d'abord, toute écriture validée par toi (c'est la base en direct, avec les vrais joueurs).
- `gPick` / `gShuffle` pour le hasard, `BUILD` à changer, `node outils/versions.js` et les tests après chaque modification.
- CSP, aucun site tiers au chargement, service worker sans Supabase, pseudos échappés.

### 6.2 Les décisions de design, revues le 18 novembre
- ✅ **« Sous 100 decks, ne rien décider »** : assouplie. Correction légère d'une carte sortie possible sur simulation (écart au-delà de ±8 points) ; grosse refonte = stats réelles croisées avec la simulation.
- ✅ **Cartes sorties et mots-clés** : option B. Les mots-clés peuvent aussi aller sur les cartes sorties, chaque vague mesurée avant publication.
- ✅ **`vfx` et holo** : ouverts aux variantes d'art alternatif, quelle que soit leur rareté. Les cartes de base gardent la règle.
- ✅ **Publication** : on travaille sur une branche. Push sur `main` ou PR **seulement si Jordan le demande** ; sinon, il ouvre la PR et fusionne lui-même.
- ✅ `CLAUDE.md` réécrit : « Garde-fous » (permanents) séparés des « Décisions de design » (modifiables par Jordan), lien vers cette feuille de route.

### 6.3 Ce qui reste
- 🟣 👤 Fusionner `CLAUDE.md` et ces documents sur `main` (PR à ouvrir par toi), puis démarrer une nouvelle session.

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

### Décisions du 18 novembre (soir)
- ✅ Premier lieu : le Trône de Tiamat, codé avec ton illustration.
- ✅ Tentation (Désir) : version automatique.
- ✅ Prix itch.io : 0 €, avec une cagnotte façon « offre-moi un café » au lieu d'un prix suggéré.
- ✅ Blitz avec Serment testé par toi : l'idée marche.
- ✅ Niveau de l'IA : jugé bien meilleur par toi et ton pote, à revoir seulement si besoin.
- ✅ Conseils de fin de partie réécrits avec tes cinq textes (FR et EN).

### Ce 18 novembre
- ✅ Analyse compétitive relue et commentée partie par partie (`docs/analyse-competitive-avis-karina.md`).
- ✅ Licence vérifiée : « Tous droits réservés » existe déjà (`LICENSE`), à garder.
- ✅ Prix minimum itch.io décidé sur le principe : 0 € avec prix suggéré.
- ✅ Le Voile fixé comme priorité n°1 après la sortie, Chronique 1 réduite à 3 matchs.
