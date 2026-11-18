# Duel d'Helvara : anti-triche

> 18 novembre 2026. Ton plan (« rendre le jeu difficile à tricher »), vérifié contre le code, puis réordonné.
> Règle d'or, gardée telle quelle : le code du joueur reste toujours modifiable. Le but n'est pas d'être imperméable, c'est que **tricher ne rapporte plus rien** là où ça touche les autres.

## 1. Le contexte de ton plan, vérifié

| Ce que dit le plan | Vrai ? | Précision |
|---|---|---|
| Le moteur est dans `index.html` | ❌ en partie | Il est dans `js/moteur.js` depuis le 12 octobre. Toujours côté joueur. |
| Chaque client simule, puis `finish()` ajoute les CHF | ✅ | En duel aussi : chacun calcule son propre résultat, rien n'est comparé. |
| `P` (CHF, cartes, victoires, deck) est envoyé tel quel | ✅ | Les valeurs ne sont bornées qu'au chargement, côté joueur. |
| La table `saves` est modifiable par son propriétaire | ✅ | Mais personne d'autre ne la lit : ça ne touche que lui. |
| `buyPack()` tire les raretés dans le navigateur | ✅ | |
| Quêtes, quête de la semaine, ultra-légendaires réclamées côté client | ✅ | |
| Le classement est modifiable par son propriétaire | ❌ en partie | Plus personne n'écrit directement dans `board` : tout passe par `board_submit`, qui borne le rythme (1 victoire par minute, 200 par jour, +4 étoiles au plus). Mais il ne vérifie pas qu'une partie a vraiment eu lieu. |
| Graine et decks partagés en duel | ✅ | Les mains et la pioche adverses sont calculables. |
| `CARDS` lisibles, dates vérifiées avec l'horloge de l'appareil | ✅ | |

## 2. Étape 0 : ce qu'un joueur peut modifier aujourd'hui

### Ce qui touche les autres (gravité haute)
- **Le classement public** : en appelant `board_submit` sans jouer, on peut annoncer des victoires. Limité à 1 par minute et 200 par jour et par compte, mais les comptes anonymes sont gratuits. Le rang maximum est atteignable en un peu plus d'une heure.
- **Les duels en ligne** :
  - un client modifié peut jouer des coups interdits (sans payer l'énergie, au-delà des places, sur un lieu verrouillé) : le client honnête les accepte ;
  - le second joueur à valider peut lire les coups de l'autre avant de choisir les siens ;
  - la main et la pioche adverses sont lisibles ;
  - l'hôte choisit la graine et les lieux en connaissant le deck de l'invité ;
  - le deck envoyé n'est vérifié que sur sa forme (cartes non possédées ou pas encore sorties possibles).

### Ce qui fausse tes outils (gravité moyenne)
- **Les statistiques de cartes** (`stats_submit`) et **les retours** (`feedback_submit`) acceptent n'importe quelle carte et n'importe quel résultat, dans la limite des quotas par compte.
- **La file d'attente** : un compte peut se faire apparier puis ne jamais venir.

### Ce qui ne touche que lui (gravité basse, jeu sans argent réel)
- CHF, cartes possédées, ultra-légendaires, quêtes, journal des factions, victoires locales, cartes pas encore sorties (en avançant l'horloge).

### Ce qui protège déjà
Aucune écriture directe sur `board`, `card_stats`, `feedback`, `mm_queue` ; identité toujours tirée de la connexion ; limiteurs de rythme ; pseudos nettoyés ; tailles plafonnées.

## 3. Le plan réordonné

Ton plan commence par l'économie. Je propose de commencer par ce qui touche **les autres joueurs**, parce que le jeu n'a ni argent réel ni échange de cartes : un tricheur qui se donne 1 million de CHF ne gâche que sa propre partie. Le classement et les duels, eux, gâchent celle des autres.

### Avant la sortie
- **Lot A, duels honnêtes (sans SQL)** :
  - le client honnête refuse tout coup adverse interdit (énergie, places, lieu verrouillé, carte du tour 6) ;
  - coups **scellés** : chacun publie d'abord une empreinte de ses coups, puis les coups eux-mêmes une fois que les deux ont validé ;
  - graine **commune** : chaque joueur apporte la moitié du hasard, personne ne peut choisir sa graine ;
  - deck adverse vérifié : cartes sorties, fusions avec leurs deux personnages.
- **Lot B, « Jouer » contre un humain ou l'IA + résultat validé par le serveur** :
  - détecter qui est en ligne ; attente de 15 s au plus seulement si quelqu'un l'est, sinon partie contre l'IA tout de suite ;
  - à la fin, chaque joueur envoie le résultat ; le serveur ne compte la partie que si les deux concordent ; les parties sont enregistrées (joueurs, graine, coups, résultat) pour être rejouées.
- **Lot C, classement** :
  - les étoiles d'un duel en ligne ne passent que par un résultat validé (lot B) ;
  - `board_submit` reste plafonné pour les parties contre l'IA (impossible à vérifier sans arbitre serveur) ;
  - réserve de départ réduite et plafonds par jour revus.

### Après la sortie
- **Économie côté serveur** (ton étape 1) : achats de paquets, quêtes, ultra-légendaires et CHF décidés par le serveur. Indispensable **avant** toute vente en vrai argent ou tout échange entre joueurs.
- **Information cachée complète** (ton étape 4) : le serveur distribue les cartes tour par tour.
- **Arbitre serveur complet** (ton étape 5) : le serveur rejoue chaque partie. Seulement si le classement a de vrais enjeux.

### Hygiène, à faire en passant
- Dates de sortie vérifiées avec l'heure du serveur ; cartes pas encore sorties non livrées au navigateur.
- Signalement d'un joueur et bannissement simple.
- Vérification de version (`BUILD`) gardée. Jamais de clé secrète dans le dépôt.

Chaque lot touchant Supabase passe par `db-guard`, puis par ton accord, avant d'être collé dans le SQL Editor.
