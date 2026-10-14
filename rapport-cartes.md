# Rapport des cartes · Duel d'Helvara

Généré le 2026-10-14 13:36 UTC par `outils/equilibrage.js` (version du moteur alpha-0.6). **Aucune carte n'a été modifiée et aucun chiffre n'est proposé** : ce document sert à décider.

- **Parties simulées** : 6000 (6000 terminées), IA de palier 5 contre IA de palier 5, graine 20261012, 43 s.
- **Cartes en jeu** : toutes celles dont la date de sortie est au plus le 2026-12-31 (les cartes cachées de 2099, sans effet, ne sont pas jouées).
- **Decks** : 12 cartes, mêmes règles que le jeu (une version par personnage, une seule ultra-légendaire, ses conditions remplies). Trois decks sur quatre sont tirés au hasard avec une faction dominante et une courbe de coûts raisonnable ; un sur quatre est fabriqué par le jeu pour son IA. Ce ne sont pas des decks de joueurs : les cartes les plus fortes ne sont pas surreprésentées.
- **Lieux** : 3 lieux tirés au hasard parmi ceux sortis à cette date, comme dans une vraie partie.
- **Camp qui révèle en premier** (le « joueur ») : 48.0 % de victoires (nulles : 0.7 %). Un écart net avec 50 % signalerait un avantage lié à l'ordre de révélation.
- **Moyenne de victoires d'une carte présente dans un deck** : 49.6 % (nulles : 0.7 % des parties).
- Lecture : ce sont des parties IA contre IA. Un humain joue les combinaisons, le serment et les lieux mieux (ou moins bien) que l'IA : les chiffres indiquent des tendances, pas une vérité. En dessous de 100 decks, la marge d'erreur dépasse ±10 points : à lire avec prudence (⚠).

## 1. Santé du moteur

Aucune erreur : 6000 parties jouées de bout en bout, sans plantage, sans puissance invalide (NaN), sans erreur dans la console.

## 2. Répartition par rareté et par coût

Jetons exclus. « Sorties » = date de sortie au plus le 2026-10-14.

### Toutes les cartes, cachées incluses (217 cartes)

| Rareté \ Coût | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 9 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Commune | 1 | 6 | 6 | 3 | 3 | 2 | · | · | **21** |
| Rare | · | 3 | 18 | 14 | 8 | 7 | 1 | · | **51** |
| Épique | · | 3 | 3 | 42 | 19 | 21 | · | · | **88** |
| Légendaire | · | 2 | 1 | 2 | 3 | 3 | 10 | · | **21** |
| Ultra-légendaire | · | · | 1 | 2 | 1 | 1 | 30 | 1 | **36** |
| **Total** | **1** | **14** | **29** | **63** | **34** | **34** | **41** | **1** | **217** |

Par faction : Helvara 44 · Primordial 63 · Désir 54 · Jugement 56

### Cartes déjà sorties au 2026-10-14 (80 cartes)

| Rareté \ Coût | 1 | 2 | 3 | 4 | 5 | 6 | 9 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Commune | 4 | 5 | 3 | 3 | 2 | · | · | **17** |
| Rare | 3 | 10 | 10 | 5 | 7 | · | · | **35** |
| Épique | 2 | 2 | · | 5 | 9 | · | · | **18** |
| Légendaire | 1 | · | 1 | · | 1 | 5 | · | **8** |
| Ultra-légendaire | · | · | · | · | · | 1 | 1 | **2** |
| **Total** | **10** | **17** | **14** | **13** | **19** | **6** | **1** | **80** |

Par faction : Helvara 19 · Primordial 22 · Désir 21 · Jugement 18

### Cartes pas encore sorties (dont 71 sans date) (137 cartes)

| Rareté \ Coût | 0 | 1 | 2 | 3 | 4 | 5 | 6 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Commune | 1 | 2 | 1 | · | · | · | · | **4** |
| Rare | · | · | 8 | 4 | 3 | · | 1 | **16** |
| Épique | · | 1 | 1 | 42 | 14 | 12 | · | **70** |
| Légendaire | · | 1 | 1 | 1 | 3 | 2 | 5 | **13** |
| Ultra-légendaire | · | · | 1 | 2 | 1 | 1 | 29 | **34** |
| **Total** | **1** | **4** | **12** | **49** | **21** | **15** | **35** | **137** |

Par faction : Helvara 25 · Primordial 41 · Désir 33 · Jugement 38

Cartes de coût 5 ou plus : **76** sur 217 (35 %). Ultra-légendaires : **36**, légendaires : **21**, communes : **21**.

## 3. Statistiques par carte (simulation)

Colonnes : **decks** = nombre de decks (des deux camps) qui contenaient la carte ; **victoire (deck)** = parties gagnées quand la carte était dans le deck ; **pose** = part des parties où elle a été jouée quand elle était dans le deck ; **victoire (posée)** = parties gagnées quand elle a été jouée ; **écart** = victoire (deck) moins la moyenne (49.6 %), en points ; **puiss. fin** = puissance moyenne de la carte à la fin, quand elle est encore en jeu ; **survie** = part des parties où elle était encore en jeu à la fin ; **tour** = tour moyen de pose. ⚠ = moins de 100 decks.

### Les 15 cartes qui gagnent le plus (au moins 100 decks)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Yarden X Apsu | `ulya` | Primordial | 9 | 12 | Ultra-légendaire | 435 | 65.3 % | 63 % | 68.0 % | +15.7 | 15.9 | 97 % | 4.7 |
| Ananké *(pas sortie)* | `ananke` | Primordial | 6 | 1 | Ultra-légendaire | 936 | 62.4 % | 40 % | 78.4 % | +12.8 | 11.8 | 100 % | 6.0 |
| Apsu | `apsu` | Primordial | 6 | 8 | Légendaire | 925 | 59.1 % | 31 % | 62.5 % | +9.5 | 10.1 | 99 % | 5.9 |
| Le Seigneur de la marée noire *(pas sortie)* | `maree` | Primordial | 6 | 8 | Légendaire | 638 | 57.8 % | 42 % | 63.4 % | +8.2 | 8.1 | 97 % | 5.8 |
| Pele | `pele` | Primordial | 5 | 6 | Rare | 490 | 57.8 % | 43 % | 54.5 % | +8.2 | 6.1 | 94 % | 5.2 |
| Le Sans-Voix *(pas sortie)* | `sansvoix` | Primordial | 2 | 4 | Rare | 1608 | 56.7 % | 70 % | 55.9 % | +7.1 | 3.8 | 89 % | 3.2 |
| Nyx X Circé *(pas sortie)* | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | 298 | 56.4 % | 13 % | 72.5 % | +6.8 | 3.0 | 100 % | 5.9 |
| Fange *(pas sortie)* | `fange` | Primordial | 3 | 3 | Épique | 1614 | 56.2 % | 53 % | 53.3 % | +6.6 | 4.1 | 91 % | 4.0 |
| Vritra | `vritra` | Primordial | 5 | 5 | Légendaire | 1138 | 56.2 % | 34 % | 52.3 % | +6.6 | 5.1 | 98 % | 5.2 |
| Nyx, Guerrière d'Halloween | `nyx_h` | Primordial | 5 | 4 | Épique | 465 | 56.1 % | 44 % | 57.1 % | +6.5 | 4.0 | 97 % | 5.3 |
| Hadès *(pas sortie)* | `hades` | Primordial | 4 | 4 | Légendaire | 1786 | 55.8 % | 66 % | 56.3 % | +6.2 | 6.1 | 90 % | 4.2 |
| Poséidon *(pas sortie)* | `poseidon` | Primordial | 4 | 3 | Épique | 989 | 55.7 % | 57 % | 55.1 % | +6.1 | 3.0 | 91 % | 4.4 |
| Melinoë | `melinoe` | Primordial | 2 | 2 | Rare | 1663 | 55.6 % | 72 % | 55.5 % | +6.0 | 4.4 | 90 % | 3.1 |
| Arès, Boucher d'Halloween | `ares_h` | Primordial | 5 | 4 | Épique | 469 | 55.4 % | 50 % | 57.3 % | +5.8 | 5.8 | 94 % | 5.2 |
| La Messagère d'Hécate *(pas sortie)* | `messagere` | Helvara | 2 | 2 | Rare | 1180 | 55.4 % | 59 % | 56.8 % | +5.8 | 4.8 | 90 % | 3.5 |

### Les 15 cartes qui gagnent le moins (au moins 100 decks)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Amaterasu | `amaterasu` | Jugement | 5 | 4 | Épique | 541 | 40.1 % | 10 % | 32.1 % | -9.5 | 4.2 | 100 % | 5.4 |
| Konohanasakuya-Hime | `konohana` | Désir | 1 | 4 | Rare | 910 | 42.4 % | 79 % | 41.0 % | -7.2 | 1.0 | 85 % | 2.8 |
| Ishtar | `ishtar` | Désir | 4 | 3 | Épique | 1112 | 42.9 % | 20 % | 34.7 % | -6.7 | 2.9 | 92 % | 4.7 |
| Anubis *(pas sortie)* | `anubis` | Jugement | 5 | 4 | Légendaire | 861 | 43.3 % | 62 % | 45.1 % | -6.3 | 6.2 | 95 % | 5.1 |
| Sekhmet, Lionne de l'Hiver *(pas sortie)* | `sekhmet_n` | Jugement | 4 | 4 | Épique | 750 | 43.3 % | 45 % | 40.5 % | -6.3 | 3.8 | 93 % | 4.6 |
| Hel X Baldur *(pas sortie)* | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | 260 | 43.5 % | 18 % | 46.8 % | -6.1 | 3.2 | 96 % | 5.9 |
| Eir | `eir` | Jugement | 4 | 3 | Rare | 808 | 43.6 % | 16 % | 38.6 % | -6.0 | 3.2 | 98 % | 4.9 |
| Médée *(pas sortie)* | `medee` | Jugement | 4 | 4 | Épique | 806 | 44.0 % | 34 % | 41.1 % | -5.6 | 3.8 | 89 % | 4.7 |
| Nike *(pas sortie)* | `nike` | Jugement | 3 | 1 | Ultra-légendaire | 1028 | 44.2 % | 38 % | 43.9 % | -5.4 | 4.2 | 97 % | 5.5 |
| Dionysos *(pas sortie)* | `dionysos` | Désir | 2 | 2 | Rare | 1158 | 44.7 % | 60 % | 44.0 % | -4.9 | 2.1 | 86 % | 3.5 |
| Tlazolteotl | `tlazol` | Désir | 3 | 2 | Rare | 1048 | 44.8 % | 37 % | 40.9 % | -4.8 | 2.7 | 90 % | 4.4 |
| Freyr | `freyr` | Désir | 3 | 3 | Rare | 998 | 45.1 % | 49 % | 41.1 % | -4.5 | 3.2 | 89 % | 4.1 |
| Psyché | `psyche` | Désir | 4 | 3 | Épique | 1058 | 45.3 % | 53 % | 43.9 % | -4.3 | 3.7 | 89 % | 4.5 |
| Tefnut *(pas sortie)* | `tefnut` | Jugement | 2 | 2 | Commune | 991 | 45.4 % | 74 % | 44.3 % | -4.2 | 2.1 | 88 % | 3.6 |
| Hermès | `hermes` | Désir | 1 | 1 | Rare | 905 | 45.4 % | 62 % | 45.9 % | -4.2 | 1.2 | 85 % | 2.7 |

### Les cartes jamais ou presque jamais jouées alors qu'elles sont dans le deck (pose sous 50 %, au moins 100 decks)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Amaterasu | `amaterasu` | Jugement | 5 | 4 | Épique | 541 | 40.1 % | 10 % | 32.1 % | -9.5 | 4.2 | 100 % | 5.4 |
| Nemesis X Jordan *(pas sortie)* | `ulnem` | Jugement | 6 | 2 | Ultra-légendaire | 271 | 53.5 % | 10 % | 46.4 % | +3.9 | 2.0 | 93 % | 5.9 |
| Yarden, Dragonification partielle | `yarden_d` | Primordial | 6 | 3 | Légendaire | 400 | 47.5 % | 11 % | 35.7 % | -2.1 | 7.3 | 98 % | 5.9 |
| Médée, Mariée Spectrale | `medee_h` | Jugement | 4 | 3 | Épique | 742 | 46.5 % | 13 % | 46.4 % | -3.1 | 3.0 | 96 % | 4.9 |
| Nyx X Circé *(pas sortie)* | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | 298 | 56.4 % | 13 % | 72.5 % | +6.8 | 3.0 | 100 % | 5.9 |
| Hel, Reine du Réveillon *(pas sortie)* | `hel_r` | Primordial | 5 | 2 | Épique | 481 | 45.7 % | 15 % | 52.8 % | -3.9 | 2.1 | 93 % | 5.3 |
| Eir | `eir` | Jugement | 4 | 3 | Rare | 808 | 43.6 % | 16 % | 38.6 % | -6.0 | 3.2 | 98 % | 4.9 |
| Hel X Baldur *(pas sortie)* | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | 260 | 43.5 % | 18 % | 46.8 % | -6.1 | 3.2 | 96 % | 5.9 |
| Aphrodite X Yarden *(pas sortie)* | `ulaph` | Désir | 6 | 5 | Ultra-légendaire | 280 | 48.2 % | 19 % | 38.5 % | -1.4 | 4.8 | 100 % | 5.9 |
| Ishtar | `ishtar` | Désir | 4 | 3 | Épique | 1112 | 42.9 % | 20 % | 34.7 % | -6.7 | 2.9 | 92 % | 4.7 |
| Le Carillonneur de la Cathédrale *(pas sortie)* | `carillonneur` | Helvara | 3 | 1 | Légendaire | 1620 | 49.9 % | 20 % | 56.2 % | +0.3 | 4.0 | 88 % | 4.5 |
| Nyx X Oshun *(pas sortie)* | `uloshun` | Primordial | 6 | 2 | Ultra-légendaire | 276 | 50.4 % | 20 % | 46.4 % | +0.8 | 1.8 | 98 % | 5.8 |
| La Ficelle Dévorante | `ficelle` | Helvara | 5 | 4 | Épique | 1174 | 49.2 % | 23 % | 43.6 % | -0.4 | 7.6 | 94 % | 5.3 |
| La Nuée de Miroirs | `nuee` | Primordial | 4 | 3 | Rare | 857 | 49.9 % | 25 % | 46.3 % | +0.3 | 4.7 | 96 % | 5.0 |
| Apsu, Veillée des Chaînes *(pas sortie)* | `apsu_n` | Primordial | 6 | 7 | Légendaire | 403 | 46.7 % | 26 % | 43.8 % | -2.9 | 7.3 | 97 % | 5.9 |
| Qetesh X Yarden *(pas sortie)* | `ulqetyar` | Désir | 6 | 3 | Ultra-légendaire | 280 | 50.4 % | 26 % | 34.2 % | +0.8 | 5.2 | 99 % | 5.9 |
| Set *(pas sortie)* | `set` | Primordial | 5 | 4 | Épique | 518 | 48.5 % | 27 % | 50.0 % | -1.1 | 3.9 | 96 % | 5.5 |
| Hel *(pas sortie)* | `hel` | Primordial | 6 | 3 | Légendaire | 883 | 51.3 % | 29 % | 58.9 % | +1.7 | 3.0 | 99 % | 5.8 |
| La Doyenne | `doyenne` | Helvara | 5 | 4 | Commune | 437 | 46.9 % | 30 % | 35.6 % | -2.7 | 4.3 | 95 % | 5.3 |
| Apsu | `apsu` | Primordial | 6 | 8 | Légendaire | 925 | 59.1 % | 31 % | 62.5 % | +9.5 | 10.1 | 99 % | 5.9 |
| Odin *(pas sortie)* | `odin` | Jugement | 4 | 4 | Légendaire | 1722 | 47.1 % | 31 % | 41.9 % | -2.5 | 3.9 | 94 % | 4.8 |
| Les Costumes | `costumes` | Helvara | 4 | 3 | Commune | 1004 | 46.6 % | 31 % | 44.6 % | -3.0 | 4.8 | 93 % | 4.8 |
| Jordan, le Créateur | `jordan` | Primordial | 1 | -1 | Épique | 2049 | 51.5 % | 32 % | 45.8 % | +1.9 | -0.4 | 87 % | 3.9 |
| Dante *(pas sortie)* | `dante` | Primordial | 4 | 4 | Rare | 834 | 49.2 % | 32 % | 41.3 % | -0.4 | 4.1 | 92 % | 4.8 |
| Inanna | `inanna` | Jugement | 5 | 5 | Épique | 501 | 48.5 % | 33 % | 48.5 % | -1.1 | 5.0 | 96 % | 5.2 |
| Hécate | `hecate` | Jugement | 3 | 2 | Commune | 889 | 46.2 % | 33 % | 42.8 % | -3.4 | 2.3 | 93 % | 4.2 |
| Lilith | `lilith` | Désir | 6 | 5 | Légendaire | 1212 | 50.7 % | 34 % | 59.8 % | +1.1 | 5.2 | 98 % | 5.7 |
| Vasseur | `vasseur` | Helvara | 3 | 2 | Commune | 854 | 47.2 % | 34 % | 42.6 % | -2.4 | 4.4 | 92 % | 4.2 |
| Médée *(pas sortie)* | `medee` | Jugement | 4 | 4 | Épique | 806 | 44.0 % | 34 % | 41.1 % | -5.6 | 3.8 | 89 % | 4.7 |
| Pandore *(pas sortie)* | `pandore` | Désir | 3 | 0 | Épique | 2409 | 49.3 % | 34 % | 41.6 % | -0.3 | 4.6 | 95 % | 5.3 |
| Styx *(pas sortie)* | `styx` | Jugement | 4 | 3 | Légendaire | 1710 | 46.6 % | 34 % | 46.4 % | -3.0 | 3.0 | 89 % | 4.6 |
| Vritra | `vritra` | Primordial | 5 | 5 | Légendaire | 1138 | 56.2 % | 34 % | 52.3 % | +6.6 | 5.1 | 98 % | 5.2 |
| Balor *(pas sortie)* | `balor` | Jugement | 6 | 5 | Rare | 812 | 50.6 % | 34 % | 61.1 % | +1.0 | 5.1 | 98 % | 5.8 |
| Anat | `anat` | Désir | 4 | 4 | Épique | 1057 | 46.9 % | 36 % | 39.3 % | -2.7 | 5.4 | 92 % | 4.7 |
| Qetesh X Jordan *(pas sortie)* | `ulqetjor` | Désir | 6 | 4 | Ultra-légendaire | 297 | 47.5 % | 36 % | 40.6 % | -2.1 | 3.9 | 97 % | 5.9 |
| Freya | `freya` | Désir | 5 | 5 | Rare | 705 | 48.2 % | 36 % | 43.9 % | -1.4 | 5.7 | 95 % | 5.2 |
| Baldur *(pas sortie)* | `baldur` | Jugement | 4 | 4 | Épique | 1068 | 46.6 % | 37 % | 42.7 % | -3.0 | 4.1 | 96 % | 4.7 |
| Tlazolteotl | `tlazol` | Désir | 3 | 2 | Rare | 1048 | 44.8 % | 37 % | 40.9 % | -4.8 | 2.7 | 90 % | 4.4 |
| Circé *(pas sortie)* | `circe` | Désir | 4 | 3 | Épique | 1393 | 48.0 % | 37 % | 50.6 % | -1.6 | 3.0 | 94 % | 4.7 |
| Ereshkigal | `ereshkigal` | Primordial | 6 | 7 | Légendaire | 650 | 53.4 % | 37 % | 59.8 % | +3.8 | 7.0 | 99 % | 5.8 |
| Calypso X Jordan *(pas sortie)* | `ulcal` | Désir | 5 | 4 | Ultra-légendaire | 276 | 55.1 % | 37 % | 49.0 % | +5.5 | 4.2 | 100 % | 5.4 |
| Nyx | `nyx` | Primordial | 6 | 5 | Légendaire | 1201 | 54.6 % | 37 % | 60.8 % | +5.0 | 5.2 | 99 % | 5.8 |
| Nergal, Fossoyeur d'Halloween | `nergal_h` | Primordial | 5 | 4 | Épique | 493 | 52.1 % | 37 % | 59.2 % | +2.5 | 7.3 | 93 % | 5.3 |
| Qetesh X Jordan du Nouvel An *(pas sortie)* | `ulqetjor_r` | Désir | 6 | 4 | Ultra-légendaire | 281 | 53.0 % | 38 % | 68.9 % | +3.4 | 3.8 | 100 % | 5.9 |
| Nike *(pas sortie)* | `nike` | Jugement | 3 | 1 | Ultra-légendaire | 1028 | 44.2 % | 38 % | 43.9 % | -5.4 | 4.2 | 97 % | 5.5 |
| Hathor | `hathor` | Désir | 4 | 3 | Rare | 798 | 47.9 % | 39 % | 43.7 % | -1.7 | 3.0 | 93 % | 4.9 |
| Thor *(pas sortie)* | `thor` | Primordial | 4 | 3 | Épique | 992 | 48.9 % | 39 % | 46.1 % | -0.7 | 3.1 | 90 % | 4.4 |
| Ananké *(pas sortie)* | `ananke` | Primordial | 6 | 1 | Ultra-légendaire | 936 | 62.4 % | 40 % | 78.4 % | +12.8 | 11.8 | 100 % | 6.0 |
| Bastet | `bastet` | Désir | 5 | 4 | Rare | 492 | 50.6 % | 40 % | 51.5 % | +1.0 | 4.1 | 95 % | 5.2 |
| Qetesh du Nouvel An *(pas sortie)* | `qetesh_r` | Désir | 5 | 3 | Épique | 681 | 51.1 % | 40 % | 57.1 % | +1.5 | 3.2 | 96 % | 4.8 |
| Le Seigneur de la marée noire *(pas sortie)* | `maree` | Primordial | 6 | 8 | Légendaire | 638 | 57.8 % | 42 % | 63.4 % | +8.2 | 8.1 | 97 % | 5.8 |
| Oya | `oya` | Jugement | 5 | 4 | Épique | 522 | 49.0 % | 42 % | 50.5 % | -0.6 | 4.0 | 97 % | 5.3 |
| Pele | `pele` | Primordial | 5 | 6 | Rare | 490 | 57.8 % | 43 % | 54.5 % | +8.2 | 6.1 | 94 % | 5.2 |
| Pele du Réveillon *(pas sortie)* | `pele_r` | Primordial | 5 | 3 | Épique | 787 | 49.8 % | 44 % | 50.3 % | +0.2 | 3.3 | 95 % | 5.2 |
| Nyx, Guerrière d'Halloween | `nyx_h` | Primordial | 5 | 4 | Épique | 465 | 56.1 % | 44 % | 57.1 % | +6.5 | 4.0 | 97 % | 5.3 |
| Sekhmet, Lionne de l'Hiver *(pas sortie)* | `sekhmet_n` | Jugement | 4 | 4 | Épique | 750 | 43.3 % | 45 % | 40.5 % | -6.3 | 3.8 | 93 % | 4.6 |
| Perséphone | `persephone` | Jugement | 3 | 3 | Rare | 1430 | 45.9 % | 46 % | 42.1 % | -3.7 | 2.9 | 91 % | 4.4 |
| Chernobog *(pas sortie)* | `chernobog` | Jugement | 4 | 4 | Épique | 856 | 50.0 % | 46 % | 53.4 % | +0.4 | 4.1 | 94 % | 4.9 |
| Calypso, Reine des Glaces *(pas sortie)* | `calypso_n` | Désir | 5 | 3 | Épique | 422 | 54.0 % | 47 % | 60.4 % | +4.4 | 5.3 | 95 % | 5.3 |
| L'Esquille | `esquille` | Primordial | 3 | 1 | Rare | 1550 | 54.5 % | 47 % | 51.9 % | +4.9 | 1.1 | 91 % | 4.1 |
| La Mère de Cendre | `mere` | Primordial | 5 | 4 | Rare | 528 | 46.2 % | 47 % | 46.0 % | -3.4 | 3.8 | 94 % | 5.0 |
| Sekhmet | `sekhmet` | Jugement | 5 | 6 | Rare | 497 | 48.3 % | 47 % | 44.1 % | -1.3 | 6.0 | 92 % | 5.3 |
| Arès | `ares` | Primordial | 4 | 3 | Rare | 800 | 49.8 % | 48 % | 50.1 % | +0.1 | 4.8 | 93 % | 4.8 |
| Izzy, Lune de Sang | `izzy_h` | Désir | 3 | 0 | Légendaire | 742 | 52.0 % | 48 % | 53.1 % | +2.4 | 2.4 | 90 % | 4.5 |
| Nergal | `nergal` | Primordial | 5 | 4 | Épique | 744 | 52.8 % | 49 % | 52.4 % | +3.2 | 4.4 | 95 % | 5.2 |
| Freyr | `freyr` | Désir | 3 | 3 | Rare | 998 | 45.1 % | 49 % | 41.1 % | -4.5 | 3.2 | 89 % | 4.1 |
| Arès, Boucher d'Halloween | `ares_h` | Primordial | 5 | 4 | Épique | 469 | 55.4 % | 50 % | 57.3 % | +5.8 | 5.8 | 94 % | 5.2 |

### Toutes les cartes simulées, par rareté puis par écart


#### Commune (21)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Le Troll | `troll` | Primordial | 5 | 9 | Commune | 496 | 53.0 % | 52 % | 56.8 % | +3.4 | 8.5 | 94 % | 5.1 |
| Le Boucher de la Riponne *(pas sortie)* | `boucher` | Helvara | 1 | 3 | Commune | 961 | 51.9 % | 69 % | 51.1 % | +2.3 | 3.3 | 84 % | 2.7 |
| Rusalka | `rusalka` | Primordial | 2 | 2 | Commune | 1155 | 51.2 % | 62 % | 50.2 % | +1.6 | 2.0 | 88 % | 3.6 |
| Sélène | `selene` | Jugement | 4 | 4 | Commune | 789 | 51.0 % | 64 % | 49.3 % | +1.4 | 6.7 | 94 % | 5.0 |
| Le Bibliothécaire des Passages | `biblio` | Helvara | 1 | 2 | Commune | 1017 | 50.9 % | 74 % | 51.7 % | +1.3 | 2.4 | 87 % | 2.8 |
| Dévote de Xochiquetzal | `devote` | Désir | 4 | 6 | Commune | 802 | 49.9 % | 62 % | 49.4 % | +0.3 | 6.1 | 91 % | 4.3 |
| Veilleur du Sous-gare | `veilleur` | Helvara | 2 | 3 | Commune | 890 | 48.9 % | 73 % | 44.4 % | -0.7 | 3.3 | 90 % | 3.3 |
| Maeve | `maeve` | Désir | 3 | 3 | Commune | 824 | 48.2 % | 69 % | 47.0 % | -1.4 | 5.2 | 90 % | 3.8 |
| Le Funambule du Belvédère | `funambule` | Helvara | 2 | 2 | Commune | 893 | 48.0 % | 67 % | 48.1 % | -1.6 | 3.4 | 90 % | 3.2 |
| Kitsune | `kitsune` | Désir | 1 | 1 | Commune | 902 | 47.5 % | 73 % | 47.8 % | -2.1 | 1.3 | 87 % | 2.9 |
| Rémi | `remi` | Helvara | 2 | 1 | Commune | 927 | 47.2 % | 63 % | 45.9 % | -2.4 | 3.8 | 90 % | 3.9 |
| La Mouche de la Faille *(pas sortie)* | `mouche` | Primordial | 1 | 3 | Commune | 974 | 47.2 % | 73 % | 44.5 % | -2.4 | 3.0 | 87 % | 2.7 |
| Vasseur | `vasseur` | Helvara | 3 | 2 | Commune | 854 | 47.2 % | 34 % | 42.6 % | -2.4 | 4.4 | 92 % | 4.2 |
| Coursier du Flon | `coursier` | Helvara | 1 | 1 | Commune | 1001 | 47.0 % | 71 % | 45.8 % | -2.6 | 1.6 | 87 % | 2.9 |
| La Doyenne | `doyenne` | Helvara | 5 | 4 | Commune | 437 | 46.9 % | 30 % | 35.6 % | -2.7 | 4.3 | 95 % | 5.3 |
| Passante d'Ouchy | `passante` | Helvara | 1 | 2 | Commune | 967 | 46.6 % | 74 % | 45.3 % | -3.0 | 2.4 | 85 % | 2.8 |
| Les Costumes | `costumes` | Helvara | 4 | 3 | Commune | 1004 | 46.6 % | 31 % | 44.6 % | -3.0 | 4.8 | 93 % | 4.8 |
| Hécate | `hecate` | Jugement | 3 | 2 | Commune | 889 | 46.2 % | 33 % | 42.8 % | -3.4 | 2.3 | 93 % | 4.2 |
| Le Charognard du M2 | `charognard` | Helvara | 2 | 2 | Commune | 939 | 46.1 % | 74 % | 46.5 % | -3.5 | 3.9 | 92 % | 3.6 |
| Le Mendiant de la Riponne *(pas sortie)* | `mendiant` | Helvara | 0 | 2 | Commune | 747 | 45.6 % | 79 % | 45.3 % | -4.0 | 2.4 | 89 % | 2.7 |
| Tefnut *(pas sortie)* | `tefnut` | Jugement | 2 | 2 | Commune | 991 | 45.4 % | 74 % | 44.3 % | -4.2 | 2.1 | 88 % | 3.6 |

#### Rare (46)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Pele | `pele` | Primordial | 5 | 6 | Rare | 490 | 57.8 % | 43 % | 54.5 % | +8.2 | 6.1 | 94 % | 5.2 |
| Le Sans-Voix *(pas sortie)* | `sansvoix` | Primordial | 2 | 4 | Rare | 1608 | 56.7 % | 70 % | 55.9 % | +7.1 | 3.8 | 89 % | 3.2 |
| Melinoë | `melinoe` | Primordial | 2 | 2 | Rare | 1663 | 55.6 % | 72 % | 55.5 % | +6.0 | 4.4 | 90 % | 3.1 |
| La Messagère d'Hécate *(pas sortie)* | `messagere` | Helvara | 2 | 2 | Rare | 1180 | 55.4 % | 59 % | 56.8 % | +5.8 | 4.8 | 90 % | 3.5 |
| L'Esquille | `esquille` | Primordial | 3 | 1 | Rare | 1550 | 54.5 % | 47 % | 51.9 % | +4.9 | 1.1 | 91 % | 4.1 |
| Ishara | `ishara` | Helvara | 2 | 2 | Rare | 1217 | 53.8 % | 72 % | 53.8 % | +4.2 | 2.4 | 90 % | 3.7 |
| Andraste *(pas sortie)* | `andraste` | Désir | 4 | 3 | Rare | 794 | 53.3 % | 60 % | 54.1 % | +3.7 | 6.9 | 94 % | 4.6 |
| Colosse du Léman | `colosse` | Helvara | 5 | 8 | Rare | 480 | 52.3 % | 59 % | 54.6 % | +2.7 | 8.1 | 92 % | 5.1 |
| Céleste | `celeste` | Helvara | 3 | 3 | Rare | 1198 | 51.8 % | 72 % | 51.8 % | +2.2 | 5.5 | 89 % | 3.7 |
| Félix | `felix` | Helvara | 2 | 3 | Rare | 1176 | 51.6 % | 70 % | 51.4 % | +2.0 | 3.3 | 86 % | 3.3 |
| Balor *(pas sortie)* | `balor` | Jugement | 6 | 5 | Rare | 812 | 50.6 % | 34 % | 61.1 % | +1.0 | 5.1 | 98 % | 5.8 |
| Bastet | `bastet` | Désir | 5 | 4 | Rare | 492 | 50.6 % | 40 % | 51.5 % | +1.0 | 4.1 | 95 % | 5.2 |
| Idunn | `idunn` | Désir | 2 | 2 | Rare | 1147 | 50.2 % | 62 % | 51.3 % | +0.6 | 3.4 | 91 % | 3.6 |
| Le Comptable du Grand-Pont | `comptable` | Helvara | 1 | 1 | Rare | 1547 | 50.1 % | 76 % | 48.6 % | +0.5 | 2.5 | 88 % | 3.1 |
| Brigid *(pas sortie)* | `brigid` | Désir | 2 | 2 | Rare | 1189 | 50.0 % | 70 % | 51.7 % | +0.4 | 2.2 | 90 % | 3.5 |
| La Nuée de Miroirs | `nuee` | Primordial | 4 | 3 | Rare | 857 | 49.9 % | 25 % | 46.3 % | +0.3 | 4.7 | 96 % | 5.0 |
| Arès | `ares` | Primordial | 4 | 3 | Rare | 800 | 49.8 % | 48 % | 50.1 % | +0.1 | 4.8 | 93 % | 4.8 |
| Éris | `eris` | Désir | 3 | 3 | Rare | 1031 | 49.4 % | 58 % | 49.2 % | -0.2 | 3.0 | 90 % | 4.4 |
| Artémis | `artemis` | Jugement | 3 | 3 | Rare | 1386 | 49.4 % | 69 % | 48.8 % | -0.2 | 3.3 | 90 % | 4.0 |
| Oshun *(pas sortie)* | `oshun` | Désir | 4 | 3 | Rare | 991 | 49.2 % | 59 % | 50.7 % | -0.4 | 3.1 | 92 % | 4.8 |
| Dante *(pas sortie)* | `dante` | Primordial | 4 | 4 | Rare | 834 | 49.2 % | 32 % | 41.3 % | -0.4 | 4.1 | 92 % | 4.8 |
| Durga | `durga` | Jugement | 5 | 5 | Rare | 490 | 48.6 % | 59 % | 49.8 % | -1.0 | 7.4 | 94 % | 5.2 |
| Skadi | `skadi` | Jugement | 3 | 3 | Rare | 1075 | 48.6 % | 70 % | 46.7 % | -1.0 | 3.0 | 86 % | 3.8 |
| Sekhmet | `sekhmet` | Jugement | 5 | 6 | Rare | 497 | 48.3 % | 47 % | 44.1 % | -1.3 | 6.0 | 92 % | 5.3 |
| Freya | `freya` | Désir | 5 | 5 | Rare | 705 | 48.2 % | 36 % | 43.9 % | -1.4 | 5.7 | 95 % | 5.2 |
| Izzy | `izzy` | Désir | 2 | 1 | Rare | 1496 | 48.2 % | 70 % | 47.5 % | -1.4 | 3.5 | 88 % | 3.8 |
| Hathor | `hathor` | Désir | 4 | 3 | Rare | 798 | 47.9 % | 39 % | 43.7 % | -1.7 | 3.0 | 93 % | 4.9 |
| Týr | `tyr` | Jugement | 2 | 3 | Rare | 1352 | 47.9 % | 69 % | 46.2 % | -1.7 | 2.8 | 89 % | 3.5 |
| L'Écorché Silencieux | `ecorche` | Helvara | 3 | 3 | Rare | 1185 | 47.5 % | 66 % | 48.1 % | -2.1 | 3.6 | 90 % | 4.1 |
| Le Tatoueur de Chauderon *(pas sortie)* | `tatoueur` | Helvara | 2 | 2 | Rare | 1183 | 47.3 % | 68 % | 44.0 % | -2.3 | 2.4 | 88 % | 3.5 |
| Ame-no-Uzume | `uzume` | Désir | 2 | 3 | Rare | 1112 | 47.2 % | 71 % | 46.2 % | -2.4 | 3.3 | 98 % | 3.4 |
| Le Relieur | `relieur` | Helvara | 2 | 2 | Rare | 1193 | 47.2 % | 63 % | 45.8 % | -2.4 | 2.3 | 86 % | 3.6 |
| Bia *(pas sortie)* | `bia` | Jugement | 3 | 3 | Rare | 1794 | 46.9 % | 60 % | 46.2 % | -2.7 | 3.7 | 93 % | 4.4 |
| Araignée de cristal | `araignee` | Primordial | 4 | 4 | Rare | 773 | 46.7 % | 53 % | 44.8 % | -2.9 | 3.8 | 96 % | 4.7 |
| La Mère de Cendre | `mere` | Primordial | 5 | 4 | Rare | 528 | 46.2 % | 47 % | 46.0 % | -3.4 | 3.8 | 94 % | 5.0 |
| Morrigan | `morrigan` | Jugement | 2 | 2 | Rare | 1296 | 46.1 % | 66 % | 44.9 % | -3.5 | 2.0 | 89 % | 3.3 |
| Agent de Thot | `thot` | Jugement | 3 | 3 | Rare | 1217 | 46.0 % | 66 % | 44.9 % | -3.6 | 3.0 | 89 % | 3.9 |
| Perséphone | `persephone` | Jugement | 3 | 3 | Rare | 1430 | 45.9 % | 46 % | 42.1 % | -3.7 | 2.9 | 91 % | 4.4 |
| Athéna *(pas sortie)* | `athena` | Jugement | 2 | 2 | Rare | 1351 | 45.7 % | 62 % | 44.6 % | -3.9 | 2.1 | 88 % | 3.6 |
| Éos | `eos` | Jugement | 2 | 2 | Rare | 1426 | 45.7 % | 59 % | 44.3 % | -3.9 | 2.0 | 89 % | 3.6 |
| Hermès | `hermes` | Désir | 1 | 1 | Rare | 905 | 45.4 % | 62 % | 45.9 % | -4.2 | 1.2 | 85 % | 2.7 |
| Freyr | `freyr` | Désir | 3 | 3 | Rare | 998 | 45.1 % | 49 % | 41.1 % | -4.5 | 3.2 | 89 % | 4.1 |
| Tlazolteotl | `tlazol` | Désir | 3 | 2 | Rare | 1048 | 44.8 % | 37 % | 40.9 % | -4.8 | 2.7 | 90 % | 4.4 |
| Dionysos *(pas sortie)* | `dionysos` | Désir | 2 | 2 | Rare | 1158 | 44.7 % | 60 % | 44.0 % | -4.9 | 2.1 | 86 % | 3.5 |
| Eir | `eir` | Jugement | 4 | 3 | Rare | 808 | 43.6 % | 16 % | 38.6 % | -6.0 | 3.2 | 98 % | 4.9 |
| Konohanasakuya-Hime | `konohana` | Désir | 1 | 4 | Rare | 910 | 42.4 % | 79 % | 41.0 % | -7.2 | 1.0 | 85 % | 2.8 |

#### Épique (45)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Fange *(pas sortie)* | `fange` | Primordial | 3 | 3 | Épique | 1614 | 56.2 % | 53 % | 53.3 % | +6.6 | 4.1 | 91 % | 4.0 |
| Nyx, Guerrière d'Halloween | `nyx_h` | Primordial | 5 | 4 | Épique | 465 | 56.1 % | 44 % | 57.1 % | +6.5 | 4.0 | 97 % | 5.3 |
| Poséidon *(pas sortie)* | `poseidon` | Primordial | 4 | 3 | Épique | 989 | 55.7 % | 57 % | 55.1 % | +6.1 | 3.0 | 91 % | 4.4 |
| Arès, Boucher d'Halloween | `ares_h` | Primordial | 5 | 4 | Épique | 469 | 55.4 % | 50 % | 57.3 % | +5.8 | 5.8 | 94 % | 5.2 |
| Yarden Weiss | `yarden` | Primordial | 5 | 6 | Épique | 1554 | 55.3 % | 58 % | 58.2 % | +5.7 | 8.5 | 94 % | 5.2 |
| Calypso, Reine des Glaces *(pas sortie)* | `calypso_n` | Désir | 5 | 3 | Épique | 422 | 54.0 % | 47 % | 60.4 % | +4.4 | 5.3 | 95 % | 5.3 |
| Loviatar *(pas sortie)* | `loviatar` | Primordial | 4 | 3 | Épique | 1067 | 53.0 % | 61 % | 50.2 % | +3.4 | 4.7 | 90 % | 4.6 |
| Le Chasseur d'échos *(pas sortie)* | `chasseur` | Primordial | 4 | 3 | Épique | 954 | 53.0 % | 59 % | 52.8 % | +3.4 | 3.1 | 95 % | 4.6 |
| Nergal | `nergal` | Primordial | 5 | 4 | Épique | 744 | 52.8 % | 49 % | 52.4 % | +3.2 | 4.4 | 95 % | 5.2 |
| Jordan, le Narrateur | `jordan_n` | Primordial | 1 | 0 | Épique | 2004 | 52.6 % | 52 % | 50.9 % | +3.0 | 0.4 | 85 % | 3.2 |
| Nergal, Fossoyeur d'Halloween | `nergal_h` | Primordial | 5 | 4 | Épique | 493 | 52.1 % | 37 % | 59.2 % | +2.5 | 7.3 | 93 % | 5.3 |
| Jordan, le Créateur | `jordan` | Primordial | 1 | -1 | Épique | 2049 | 51.5 % | 32 % | 45.8 % | +1.9 | -0.4 | 87 % | 3.9 |
| Le Graffeur du Tunnel de la Borde *(pas sortie)* | `graffeur` | Helvara | 3 | 2 | Épique | 1602 | 51.4 % | 65 % | 52.8 % | +1.8 | 2.6 | 87 % | 3.8 |
| Calypso *(pas sortie)* | `calypso` | Désir | 5 | 4 | Épique | 1402 | 51.3 % | 53 % | 54.5 % | +1.7 | 4.2 | 96 % | 5.1 |
| Qetesh du Nouvel An *(pas sortie)* | `qetesh_r` | Désir | 5 | 3 | Épique | 681 | 51.1 % | 40 % | 57.1 % | +1.5 | 3.2 | 96 % | 4.8 |
| Qetesh *(pas sortie)* | `qetesh` | Désir | 4 | 2 | Épique | 1554 | 50.4 % | 62 % | 55.2 % | +0.8 | 2.3 | 94 % | 4.5 |
| Chernobog *(pas sortie)* | `chernobog` | Jugement | 4 | 4 | Épique | 856 | 50.0 % | 46 % | 53.4 % | +0.4 | 4.1 | 94 % | 4.9 |
| Morrigan, Sorcière d'Halloween | `morrigan_h` | Jugement | 2 | 2 | Épique | 954 | 49.9 % | 58 % | 47.0 % | +0.3 | 2.2 | 87 % | 3.6 |
| Pele du Réveillon *(pas sortie)* | `pele_r` | Primordial | 5 | 3 | Épique | 787 | 49.8 % | 44 % | 50.3 % | +0.2 | 3.3 | 95 % | 5.2 |
| Ixchel | `ixchel` | Jugement | 4 | 4 | Épique | 831 | 49.6 % | 67 % | 51.4 % | -0.0 | 3.8 | 91 % | 4.2 |
| Pandore *(pas sortie)* | `pandore` | Désir | 3 | 0 | Épique | 2409 | 49.3 % | 34 % | 41.6 % | -0.3 | 4.6 | 95 % | 5.3 |
| La Ficelle Dévorante | `ficelle` | Helvara | 5 | 4 | Épique | 1174 | 49.2 % | 23 % | 43.6 % | -0.4 | 7.6 | 94 % | 5.3 |
| Aphrodite, Étoile de Noël *(pas sortie)* | `aphrodite_n` | Désir | 5 | 4 | Épique | 454 | 49.1 % | 55 % | 52.6 % | -0.5 | 3.8 | 96 % | 4.9 |
| Scáthach *(pas sortie)* | `scathach` | Jugement | 4 | 3 | Épique | 837 | 49.1 % | 57 % | 48.3 % | -0.5 | 3.0 | 89 % | 4.3 |
| Oya | `oya` | Jugement | 5 | 4 | Épique | 522 | 49.0 % | 42 % | 50.5 % | -0.6 | 4.0 | 97 % | 5.3 |
| Éos de Nouvel An *(pas sortie)* | `eos_r` | Jugement | 2 | 2 | Épique | 932 | 49.0 % | 62 % | 49.0 % | -0.6 | 2.1 | 86 % | 3.6 |
| Thor *(pas sortie)* | `thor` | Primordial | 4 | 3 | Épique | 992 | 48.9 % | 39 % | 46.1 % | -0.7 | 3.1 | 90 % | 4.4 |
| Aphrodite *(pas sortie)* | `aphrodite` | Désir | 1 | 2 | Épique | 1925 | 48.8 % | 74 % | 47.8 % | -0.8 | 2.1 | 87 % | 3.3 |
| Inanna | `inanna` | Jugement | 5 | 5 | Épique | 501 | 48.5 % | 33 % | 48.5 % | -1.1 | 5.0 | 96 % | 5.2 |
| Set *(pas sortie)* | `set` | Primordial | 5 | 4 | Épique | 518 | 48.5 % | 27 % | 50.0 % | -1.1 | 3.9 | 96 % | 5.5 |
| Dame Joanna | `joanna` | Helvara | 2 | 2 | Épique | 923 | 48.4 % | 75 % | 47.8 % | -1.2 | 2.5 | 90 % | 3.4 |
| Susanoo *(pas sortie)* | `susanoo` | Jugement | 4 | 4 | Épique | 874 | 48.1 % | 56 % | 48.7 % | -1.5 | 3.6 | 93 % | 4.2 |
| Circé *(pas sortie)* | `circe` | Désir | 4 | 3 | Épique | 1393 | 48.0 % | 37 % | 50.6 % | -1.6 | 3.0 | 94 % | 4.7 |
| Lip Dentelle *(pas sortie)* | `lipdentelle` | Désir | 3 | 3 | Épique | 1564 | 48.0 % | 73 % | 47.9 % | -1.6 | 6.9 | 89 % | 3.6 |
| Heimdall *(pas sortie)* | `heimdall` | Jugement | 3 | 3 | Épique | 1613 | 47.7 % | 72 % | 46.1 % | -1.9 | 4.7 | 89 % | 3.9 |
| Anat | `anat` | Désir | 4 | 4 | Épique | 1057 | 46.9 % | 36 % | 39.3 % | -2.7 | 5.4 | 92 % | 4.7 |
| Baldur *(pas sortie)* | `baldur` | Jugement | 4 | 4 | Épique | 1068 | 46.6 % | 37 % | 42.7 % | -3.0 | 4.1 | 96 % | 4.7 |
| Médée, Mariée Spectrale | `medee_h` | Jugement | 4 | 3 | Épique | 742 | 46.5 % | 13 % | 46.4 % | -3.1 | 3.0 | 96 % | 4.9 |
| Le Bourreau de la brèche *(pas sortie)* | `bourreau` | Jugement | 3 | 4 | Épique | 1628 | 45.8 % | 62 % | 46.5 % | -3.8 | 3.9 | 91 % | 4.2 |
| Hel, Reine du Réveillon *(pas sortie)* | `hel_r` | Primordial | 5 | 2 | Épique | 481 | 45.7 % | 15 % | 52.8 % | -3.9 | 2.1 | 93 % | 5.3 |
| Psyché | `psyche` | Désir | 4 | 3 | Épique | 1058 | 45.3 % | 53 % | 43.9 % | -4.3 | 3.7 | 89 % | 4.5 |
| Médée *(pas sortie)* | `medee` | Jugement | 4 | 4 | Épique | 806 | 44.0 % | 34 % | 41.1 % | -5.6 | 3.8 | 89 % | 4.7 |
| Sekhmet, Lionne de l'Hiver *(pas sortie)* | `sekhmet_n` | Jugement | 4 | 4 | Épique | 750 | 43.3 % | 45 % | 40.5 % | -6.3 | 3.8 | 93 % | 4.6 |
| Ishtar | `ishtar` | Désir | 4 | 3 | Épique | 1112 | 42.9 % | 20 % | 34.7 % | -6.7 | 2.9 | 92 % | 4.7 |
| Amaterasu | `amaterasu` | Jugement | 5 | 4 | Épique | 541 | 40.1 % | 10 % | 32.1 % | -9.5 | 4.2 | 100 % | 5.4 |

#### Légendaire (19)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Apsu | `apsu` | Primordial | 6 | 8 | Légendaire | 925 | 59.1 % | 31 % | 62.5 % | +9.5 | 10.1 | 99 % | 5.9 |
| Le Seigneur de la marée noire *(pas sortie)* | `maree` | Primordial | 6 | 8 | Légendaire | 638 | 57.8 % | 42 % | 63.4 % | +8.2 | 8.1 | 97 % | 5.8 |
| Vritra | `vritra` | Primordial | 5 | 5 | Légendaire | 1138 | 56.2 % | 34 % | 52.3 % | +6.6 | 5.1 | 98 % | 5.2 |
| Hadès *(pas sortie)* | `hades` | Primordial | 4 | 4 | Légendaire | 1786 | 55.8 % | 66 % | 56.3 % | +6.2 | 6.1 | 90 % | 4.2 |
| Nyx | `nyx` | Primordial | 6 | 5 | Légendaire | 1201 | 54.6 % | 37 % | 60.8 % | +5.0 | 5.2 | 99 % | 5.8 |
| Nemesis *(pas sortie)* | `nemesis` | Jugement | 5 | -5 | Légendaire | 1123 | 54.5 % | 62 % | 61.2 % | +4.9 | -4.8 | 95 % | 4.9 |
| Ereshkigal | `ereshkigal` | Primordial | 6 | 7 | Légendaire | 650 | 53.4 % | 37 % | 59.8 % | +3.8 | 7.0 | 99 % | 5.8 |
| Prométhée *(pas sortie)* | `promethee` | Primordial | 1 | 1 | Légendaire | 2980 | 52.2 % | 68 % | 50.7 % | +2.6 | 1.1 | 87 % | 2.9 |
| Izzy, Lune de Sang | `izzy_h` | Désir | 3 | 0 | Légendaire | 742 | 52.0 % | 48 % | 53.1 % | +2.4 | 2.4 | 90 % | 4.5 |
| Hel *(pas sortie)* | `hel` | Primordial | 6 | 3 | Légendaire | 883 | 51.3 % | 29 % | 58.9 % | +1.7 | 3.0 | 99 % | 5.8 |
| La Voleuse du Flon *(pas sortie)* | `voleuse` | Helvara | 2 | 2 | Légendaire | 1645 | 50.8 % | 64 % | 50.4 % | +1.2 | 2.5 | 87 % | 3.6 |
| Lilith | `lilith` | Désir | 6 | 5 | Légendaire | 1212 | 50.7 % | 34 % | 59.8 % | +1.1 | 5.2 | 98 % | 5.7 |
| Le Carillonneur de la Cathédrale *(pas sortie)* | `carillonneur` | Helvara | 3 | 1 | Légendaire | 1620 | 49.9 % | 20 % | 56.2 % | +0.3 | 4.0 | 88 % | 4.5 |
| Yarden, Dragonification partielle | `yarden_d` | Primordial | 6 | 3 | Légendaire | 400 | 47.5 % | 11 % | 35.7 % | -2.1 | 7.3 | 98 % | 5.9 |
| Odin *(pas sortie)* | `odin` | Jugement | 4 | 4 | Légendaire | 1722 | 47.1 % | 31 % | 41.9 % | -2.5 | 3.9 | 94 % | 4.8 |
| Apsu, Veillée des Chaînes *(pas sortie)* | `apsu_n` | Primordial | 6 | 7 | Légendaire | 403 | 46.7 % | 26 % | 43.8 % | -2.9 | 7.3 | 97 % | 5.9 |
| Styx *(pas sortie)* | `styx` | Jugement | 4 | 3 | Légendaire | 1710 | 46.6 % | 34 % | 46.4 % | -3.0 | 3.0 | 89 % | 4.6 |
| Mohini | `mohini` | Désir | 1 | 1 | Légendaire | 1850 | 46.5 % | 67 % | 44.8 % | -3.1 | 1.2 | 85 % | 3.2 |
| Anubis *(pas sortie)* | `anubis` | Jugement | 5 | 4 | Légendaire | 861 | 43.3 % | 62 % | 45.1 % | -6.3 | 6.2 | 95 % | 5.1 |

#### Ultra-légendaire (14)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Yarden X Apsu | `ulya` | Primordial | 9 | 12 | Ultra-légendaire | 435 | 65.3 % | 63 % | 68.0 % | +15.7 | 15.9 | 97 % | 4.7 |
| Ananké *(pas sortie)* | `ananke` | Primordial | 6 | 1 | Ultra-légendaire | 936 | 62.4 % | 40 % | 78.4 % | +12.8 | 11.8 | 100 % | 6.0 |
| Nyx X Circé *(pas sortie)* | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | 298 | 56.4 % | 13 % | 72.5 % | +6.8 | 3.0 | 100 % | 5.9 |
| Calypso X Jordan *(pas sortie)* | `ulcal` | Désir | 5 | 4 | Ultra-légendaire | 276 | 55.1 % | 37 % | 49.0 % | +5.5 | 4.2 | 100 % | 5.4 |
| Nemesis X Jordan *(pas sortie)* | `ulnem` | Jugement | 6 | 2 | Ultra-légendaire | 271 | 53.5 % | 10 % | 46.4 % | +3.9 | 2.0 | 93 % | 5.9 |
| Pele X Jordan du Réveillon *(pas sortie)* | `ulpele_r` | Primordial | 2 | 1 | Ultra-légendaire | 293 | 53.2 % | 70 % | 55.1 % | +3.6 | 1.2 | 94 % | 5.0 |
| Qetesh X Jordan du Nouvel An *(pas sortie)* | `ulqetjor_r` | Désir | 6 | 4 | Ultra-légendaire | 281 | 53.0 % | 38 % | 68.9 % | +3.4 | 3.8 | 100 % | 5.9 |
| Jordan X Izzy | `ulji` | Désir | 6 | 6 | Ultra-légendaire | 306 | 51.6 % | 50 % | 51.3 % | +2.0 | 6.0 | 96 % | 5.8 |
| Nyx X Oshun *(pas sortie)* | `uloshun` | Primordial | 6 | 2 | Ultra-légendaire | 276 | 50.4 % | 20 % | 46.4 % | +0.8 | 1.8 | 98 % | 5.8 |
| Qetesh X Yarden *(pas sortie)* | `ulqetyar` | Désir | 6 | 3 | Ultra-légendaire | 280 | 50.4 % | 26 % | 34.2 % | +0.8 | 5.2 | 99 % | 5.9 |
| Aphrodite X Yarden *(pas sortie)* | `ulaph` | Désir | 6 | 5 | Ultra-légendaire | 280 | 48.2 % | 19 % | 38.5 % | -1.4 | 4.8 | 100 % | 5.9 |
| Qetesh X Jordan *(pas sortie)* | `ulqetjor` | Désir | 6 | 4 | Ultra-légendaire | 297 | 47.5 % | 36 % | 40.6 % | -2.1 | 3.9 | 97 % | 5.9 |
| Nike *(pas sortie)* | `nike` | Jugement | 3 | 1 | Ultra-légendaire | 1028 | 44.2 % | 38 % | 43.9 % | -5.4 | 4.2 | 97 % | 5.5 |
| Hel X Baldur *(pas sortie)* | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | 260 | 43.5 % | 18 % | 46.8 % | -6.1 | 3.2 | 96 % | 5.9 |

### Victoire selon le coût et la rareté (cartes dans le deck, toutes cartes confondues)

| Coût | Cartes | Decks | Victoire (deck) | Pose |
|---|---:|---:|---:|---:|
| 0 | 1 | 747 | 45.6 % | 79 % |
| 1 | 14 | 19992 | 49.3 % | 65 % |
| 2 | 27 | 31289 | 49.4 % | 67 % |
| 3 | 23 | 30299 | 48.7 % | 54 % |
| 4 | 31 | 31408 | 48.8 % | 45 % |
| 5 | 29 | 19221 | 51.0 % | 44 % |
| 6 | 19 | 10609 | 53.2 % | 32 % |
| 9 | 1 | 435 | 65.3 % | 63 % |

| Rareté | Cartes | Decks | Victoire (deck) | Pose |
|---|---:|---:|---:|---:|
| Commune | 21 | 18459 | 48.2 % | 63 % |
| Rare | 46 | 49170 | 49.0 % | 59 % |
| Épique | 45 | 47365 | 49.7 % | 49 % |
| Légendaire | 19 | 23489 | 51.3 % | 47 % |
| Ultra-légendaire | 14 | 5517 | 52.9 % | 36 % |

| Faction | Cartes | Decks | Victoire (deck) | Pose |
|---|---:|---:|---:|---:|
| Helvara | 26 | 27960 | 49.5 % | 61 % |
| Primordial | 43 | 40410 | 53.3 % | 49 % |
| Désir | 39 | 37857 | 48.3 % | 54 % |
| Jugement | 37 | 37773 | 47.2 % | 52 % |

## 4. Cartes pas encore sorties (137)

Date de sortie postérieure au 2026-10-14, y compris les cartes sans date (2099). **Coût, puissance, rareté, faction et effet sont PROVISOIRES** (posés sans réflexion, à retravailler). Les cartes sans effet sont des places réservées.

| Carte | id | Faction | Coût | Puiss. | Rareté | Effet | Sortie prévue | Annonce |
|---|---|---|---:|---:|---|---|---|---|
| Le Mendiant de la Riponne | `mendiant` | Helvara | 0 | 2 | Commune | Révélation : défausse une carte au hasard de ta main. Nourrit Rémi. | 2026-11-01 | 2026-10-27 |
| Aphrodite | `aphrodite` | Désir | 1 | 2 | Épique | Révélation : rejoue la Révélation de la dernière carte que tu as révélée ce tour, où qu'elle soit. | 2026-11-01 | 2026-10-27 |
| La Mouche de la Faille | `mouche` | Primordial | 1 | 3 | Commune | Continu : −1 de puissance à tes autres cartes ici. | 2026-11-01 | 2026-10-27 |
| Brigid | `brigid` | Désir | 2 | 2 | Rare | Révélation : la prochaine carte que tu révèles gagne +3 de puissance. | 2026-11-01 | 2026-10-27 |
| La Messagère d'Hécate | `messagere` | Helvara | 2 | 2 | Rare | Continu : à la fin de chaque tour, si tu ne mènes pas ici, +2 de puissance (6 au maximum). | 2026-11-01 | 2026-10-27 |
| La Voleuse du Flon | `voleuse` | Helvara | 2 | 2 | Légendaire | Révélation : ton adversaire défausse une carte au hasard de sa main. | 2026-11-01 | 2026-10-27 |
| Le Sans-Voix | `sansvoix` | Primordial | 2 | 4 | Rare | Révélation : ton adversaire ne peut pas jouer ici au prochain tour. | 2026-11-01 | 2026-10-27 |
| Tefnut | `tefnut` | Jugement | 2 | 2 | Commune | Révélation : +1 de puissance à tes autres cartes ici. | 2026-11-01 | 2026-10-27 |
| Fange | `fange` | Primordial | 3 | 3 | Épique | Continu : +1 de puissance par carte défaussée pendant la partie, des deux côtés. | 2026-11-01 | 2026-10-27 |
| Le Bourreau de la brèche | `bourreau` | Jugement | 3 | 4 | Épique | Révélation : condamne une case adverse ici jusqu'à la fin de la partie. | 2026-11-01 | 2026-10-27 |
| Lip Dentelle | `lipdentelle` | Désir | 3 | 3 | Épique | Révélation : défausse la carte la plus chère de ta main et gagne sa puissance. | 2026-11-01 | 2026-10-27 |
| Andraste | `andraste` | Désir | 4 | 3 | Rare | Révélation : +2 de puissance par carte adverse ici. | 2026-11-01 | 2026-10-27 |
| Chernobog | `chernobog` | Jugement | 4 | 4 | Épique | Continu : les cartes adverses ici ne peuvent pas dépasser leur puissance de base. | 2026-11-01 | 2026-10-27 |
| Dante | `dante` | Primordial | 4 | 4 | Rare | Continu : chaque fois qu'une carte est détruite ici, des deux côtés, +1 de puissance. | 2026-11-01 | 2026-10-27 |
| Le Chasseur d'échos | `chasseur` | Primordial | 4 | 3 | Épique | Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet). | 2026-11-01 | 2026-10-27 |
| Médée | `medee` | Jugement | 4 | 4 | Épique | Continu : la prochaine carte adverse jouée ici perd 2 de puissance. Si Hécate est de ton côté, les deux prochaines. | 2026-11-01 | 2026-10-27 |
| Susanoo | `susanoo` | Jugement | 4 | 4 | Épique | Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3 de puissance. +2 de puissance si Amaterasu est de ton côté. | 2026-11-01 | 2026-10-27 |
| Anubis | `anubis` | Jugement | 5 | 4 | Légendaire | Révélation : pèse les cœurs. Si l'adversaire mène ici, détruit sa carte la plus forte ici. Sinon, +4 de puissance. | 2026-11-01 | 2026-10-27 |
| Calypso | `calypso` | Désir | 5 | 4 | Épique | Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu. | 2026-11-01 | 2026-10-27 |
| Calypso X Jordan | `ulcal` | Désir | 5 | 4 | Ultra-légendaire | Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2 de puissance. Exige Calypso et Jordan dans le deck. | 2026-11-01 | 2026-10-27 |
| Nemesis | `nemesis` | Jugement | 5 | -5 | Légendaire | Ne peut pas être jouée au tour 6. Continu : dans ce lieu, c'est le joueur avec le moins de puissance qui gagne. Deux Nemesis s'annulent. | 2026-11-01 | 2026-10-27 |
| Set | `set` | Primordial | 5 | 4 | Épique | Révélation : la tempête de sable disperse jusqu'à 2 cartes adverses d'ici, au hasard, vers les autres lieux s'il y a de la place. Chacune perd 1 de puissance. | 2026-11-01 | 2026-10-27 |
| Aphrodite X Yarden | `ulaph` | Désir | 6 | 5 | Ultra-légendaire | Révélation : rejoue la Révélation de chacune de tes autres cartes ici. Exige Aphrodite et Yarden Weiss dans le deck. | 2026-11-01 | 2026-10-27 |
| Balor | `balor` | Jugement | 6 | 5 | Rare | Révélation : −3 de puissance à deux cartes adverses différentes au hasard ici. | 2026-11-01 | 2026-10-27 |
| Le Seigneur de la marée noire | `maree` | Primordial | 6 | 8 | Légendaire | Révélation : détruit les cartes adverses de coût 2 ou moins ici. | 2026-11-01 | 2026-10-27 |
| Nemesis X Jordan | `ulnem` | Jugement | 6 | 2 | Ultra-légendaire | Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2 de puissance. Exige Nemesis et Jordan dans le deck. | 2026-11-01 | 2026-10-27 |
| Prométhée | `promethee` | Primordial | 1 | 1 | Légendaire | Continu : l'énergie que tu ne dépenses pas est conservée au tour suivant (10 maximum). | 2026-11-15 | 2026-11-10 |
| Athéna | `athena` | Jugement | 2 | 2 | Rare | Révélation : prends en main la plus chère des 3 premières cartes de ton deck. | 2026-11-15 | 2026-11-10 |
| Bia | `bia` | Jugement | 3 | 3 | Rare | Révélation : l'adversaire perd son énergie conservée. S'il n'en avait pas, −1 de puissance à sa carte la plus forte ici. | 2026-11-15 | 2026-11-10 |
| Nike | `nike` | Jugement | 3 | 1 | Ultra-légendaire | Révélation : +2 de puissance pour chaque autre carte que tu as jouée avant elle ce tour. Exige 8 cartes Jugement dans le deck, Nike comprise. | 2026-11-15 | 2026-11-10 |
| Pandore | `pandore` | Désir | 3 | 0 | Épique | Révélation : dépense toute l'énergie qu'il te reste. +2 de puissance par énergie dépensée. | 2026-11-15 | 2026-11-10 |
| Styx | `styx` | Jugement | 4 | 3 | Légendaire | Continu : Nike et Bia ont +3 de puissance où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main. | 2026-11-15 | 2026-11-10 |
| Le Boucher de la Riponne | `boucher` | Helvara | 1 | 3 | Commune | Révélation : détruit ton autre carte la plus faible ici et pioche 1. | 2026-12-01 | 2026-11-26 |
| Dionysos | `dionysos` | Désir | 2 | 2 | Rare | Révélation : chaque joueur pioche 1 carte, puis défausse une carte au hasard. | 2026-12-01 | 2026-11-26 |
| Le Tatoueur de Chauderon | `tatoueur` | Helvara | 2 | 2 | Rare | Révélation : ta carte la plus forte ici gagne +1 de puissance et ne peut plus être affaiblie. | 2026-12-01 | 2026-11-26 |
| Heimdall | `heimdall` | Jugement | 3 | 3 | Épique | Révélation : tes autres cartes ici passent par le Bifröst vers un lieu où l'on ne peut plus jouer, s'il y a de la place. Sinon, +2 de puissance. | 2026-12-01 | 2026-11-26 |
| Le Carillonneur de la Cathédrale | `carillonneur` | Helvara | 3 | 1 | Légendaire | Continu : à la fin de chaque tour, +1 de puissance. Fin du tour 6 : le glas sonne, tes autres cartes ici gagnent la moitié de sa puissance (arrondie au-dessous). | 2026-12-01 | 2026-11-26 |
| Le Graffeur du Tunnel de la Borde | `graffeur` | Helvara | 3 | 2 | Épique | Continu : ton côté a +2 de puissance dans les lieux voisins. | 2026-12-01 | 2026-11-26 |
| Baldur | `baldur` | Jugement | 4 | 4 | Épique | Les effets adverses ne peuvent ni le détruire ni l'affaiblir, sauf ceux des cartes de coût 2 ou moins (le gui) et ceux où « rien ne le protège ». | 2026-12-01 | 2026-11-26 |
| Circé | `circe` | Désir | 4 | 3 | Épique | Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet). | 2026-12-01 | 2026-11-26 |
| Hadès | `hades` | Primordial | 4 | 4 | Légendaire | Révélation : ressuscite ici ta carte détruite la plus forte, sans Révélation. Si tu n'en as aucune, +3 de puissance. | 2026-12-01 | 2026-11-26 |
| Loviatar | `loviatar` | Primordial | 4 | 3 | Épique | Révélation : ressuscite ici ta dernière carte défaussée, sans Révélation. Elle perd 1 de puissance au début de chacun des 2 tours suivants. Si tu n'en as aucune, +3 de puissance. | 2026-12-01 | 2026-11-26 |
| Odin | `odin` | Jugement | 4 | 4 | Légendaire | Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes. | 2026-12-01 | 2026-11-26 |
| Oshun | `oshun` | Désir | 4 | 3 | Rare | Révélation : +1 de puissance à toutes tes autres cartes, dans les 3 lieux. | 2026-12-01 | 2026-11-26 |
| Poséidon | `poseidon` | Primordial | 4 | 3 | Épique | Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici. | 2026-12-01 | 2026-11-26 |
| Qetesh | `qetesh` | Désir | 4 | 2 | Épique | Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté. | 2026-12-01 | 2026-11-26 |
| Scáthach | `scathach` | Jugement | 4 | 3 | Épique | Révélation : laisse une Ombre de Scáthach (puissance −3, sans effet) du côté adverse, dans un autre lieu. | 2026-12-01 | 2026-11-26 |
| Thor | `thor` | Primordial | 4 | 3 | Épique | Révélation : lance Mjölnir (jeton de puissance 2) dans un autre lieu. Si Mjölnir est détruit, +2 de puissance. | 2026-12-01 | 2026-11-26 |
| Ananké | `ananke` | Primordial | 6 | 1 | Ultra-légendaire | Fatalité : rien ne peut l'atteindre. Fin de partie : sa puissance devient égale à la puissance totale adverse ici, +1 de puissance. Exige 8 cartes Primordial dans le deck, Ananké comprise. | 2026-12-01 | 2026-11-26 |
| Hel | `hel` | Primordial | 6 | 3 | Légendaire | Révélation : défausse ta main, puis ressuscite ici jusqu'à 2 de tes cartes défaussées (les plus fortes), sans Révélation. | 2026-12-01 | 2026-11-26 |
| Hel X Baldur | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | Révélation : ressuscite ici ta carte détruite ou défaussée la plus forte, avec sa Révélation. Elle ne peut plus être ni détruite ni affaiblie. Si c'est Baldur, il gagne +5 de puissance. Exige Hel et Baldur dans le deck. | 2026-12-01 | 2026-11-26 |
| Nyx X Circé | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | Révélation : les cartes adverses ici deviennent des Pourceaux. Exige Nyx et Circé dans le deck. | 2026-12-01 | 2026-11-26 |
| Nyx X Oshun | `uloshun` | Primordial | 6 | 2 | Ultra-légendaire | Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre lieu. Exige Nyx et Oshun dans le deck. | 2026-12-01 | 2026-11-26 |
| Qetesh X Jordan | `ulqetjor` | Désir | 6 | 4 | Ultra-légendaire | Continu : tes autres cartes ont +1 de puissance, dans les 3 lieux. Exige Qetesh et Jordan dans le deck. | 2026-12-01 | 2026-11-26 |
| Qetesh X Yarden | `ulqetyar` | Désir | 6 | 3 | Ultra-légendaire | Continu : +3 de puissance par lieu où tu as à la fois une carte Désir et une carte Primordiale. Exige Qetesh et Yarden Weiss dans le deck. | 2026-12-01 | 2026-11-26 |
| Sekhmet, Lionne de l'Hiver | `sekhmet_n` | Jugement | 4 | 4 | Épique | Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées. | 2026-12-14 | 2026-12-09 |
| Aphrodite, Étoile de Noël | `aphrodite_n` | Désir | 5 | 4 | Épique | Révélation : laisse un Reflet d'Aphrodite de puissance 3 dans chacun de tes autres lieux. | 2026-12-14 | 2026-12-09 |
| Calypso, Reine des Glaces | `calypso_n` | Désir | 5 | 3 | Épique | Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 de puissance par carte adverse ici. | 2026-12-14 | 2026-12-09 |
| Apsu, Veillée des Chaînes | `apsu_n` | Primordial | 6 | 7 | Légendaire | Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 de puissance si Yarden Weiss est de ton côté. | 2026-12-14 | 2026-12-09 |
| Éos de Nouvel An | `eos_r` | Jugement | 2 | 2 | Épique | Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins. | 2026-12-31 | 2026-12-26 |
| Pele X Jordan du Réveillon | `ulpele_r` | Primordial | 2 | 1 | Ultra-légendaire | Révélation : la lave inflige −1 de puissance à toutes les cartes adverses, dans les 3 lieux. Exige Pele et Jordan dans le deck. | 2026-12-31 | 2026-12-26 |
| Hel, Reine du Réveillon | `hel_r` | Primordial | 5 | 2 | Épique | Révélation : ressuscite ici ta carte défaussée la plus chère, avec sa Révélation. | 2026-12-31 | 2026-12-26 |
| Pele du Réveillon | `pele_r` | Primordial | 5 | 3 | Épique | Révélation : le feu d'artifice éclate dans les 3 lieux. −2 de puissance à la carte adverse la plus forte de chaque lieu. | 2026-12-31 | 2026-12-26 |
| Qetesh du Nouvel An | `qetesh_r` | Désir | 5 | 3 | Épique | Révélation : au début du tour suivant, charme la carte adverse la plus forte ici de puissance 5 ou moins. | 2026-12-31 | 2026-12-26 |
| Qetesh X Jordan du Nouvel An | `ulqetjor_r` | Désir | 6 | 4 | Ultra-légendaire | Révélation : charme la carte adverse la plus forte ici de puissance 5 ou moins. Continu : tes autres cartes ici ont +1 de puissance. Exige Qetesh du Nouvel An et Jordan dans le deck. | 2026-12-31 | 2026-12-26 |
| Hédoné | `hedone` | Désir | 4 | 2 | Ultra-légendaire | Continu : à la fin de chaque tour, attire ici la carte adverse la plus faible d'un autre lieu, s'il y a de la place, et la charme tant qu'Hédoné reste en jeu. 2 fois maximum. Exige 8 cartes Désir dans le deck, Hédoné comprise. | 2027-01-01 | 2027-01-01 |
| La Somnambule du Flon | `somnambule` | Helvara | 2 | 2 | Rare | *(pas d'effet)* | non fixée (2099) |  |
| Le Veilleur du Pont Bessières | `veilleur_pont` | Helvara | 2 | 3 | Rare | *(pas d'effet)* | non fixée (2099) |  |
| Áine | `aine` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Anahita | `anahita` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Apollon | `apollon` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Benzaiten | `benzaiten` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Cernunnos | `cernunnos` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Cronos | `cronos` | Primordial | 3 | 3 | Épique | Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 de puissance pour chacune. | non fixée (2099) |  |
| Daji | `daji` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Déméter | `demeter` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Echidna | `echidna` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Emiri | `emiri` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Éros | `eros` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Frigg | `frigg` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Gaïa | `gaia` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Héphaïstos | `hephaistos` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Héra | `hera` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Héraklès | `herakles` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Indra | `indra` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Izanami | `izanami` | Primordial | 3 | 3 | Épique | Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2 de puissance. | non fixée (2099) |  |
| Kali | `kali` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| L'Archiviste du Sous-Gare | `archiviste` | Helvara | 3 | 3 | Rare | *(pas d'effet)* | non fixée (2099) |  |
| L'Effigie | `effigie` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| L'Enfant sans École | `enfant` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| La Couturière de la Cité | `couturiere` | Helvara | 3 | 3 | Rare | *(pas d'effet)* | non fixée (2099) |  |
| La Patronne d'Ouchy | `patronne` | Helvara | 3 | 3 | Rare | *(pas d'effet)* | non fixée (2099) |  |
| La Pénitente | `penitente` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| La Possédée | `possedee` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| La Voyante | `voyante` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Le Musicien | `musicien` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Le Reflet Noir | `reflet_noir` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Loki | `loki` | Désir | 3 | 3 | Épique | Révélation : chaque joueur défausse la carte la plus chère de sa main. | non fixée (2099) |  |
| Mā‘at | `maat` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Méduse | `meduse` | Helvara | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Nike de la Saint-Valentin | `nike_v` | Jugement | 3 | 1 | Ultra-légendaire | Exige 8 cartes Jugement dans le deck, Nike de la Saint-Valentin comprise. | non fixée (2099) |  |
| Pakhet | `pakhet` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Rati | `rati` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Sedna | `sedna` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Tsukuyomi | `tsukuyomi` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Typhon | `typhon` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Vesta | `vesta` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Zeus | `zeus` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| La Meute du M2 | `meute` | Helvara | 4 | 4 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| La Reine de Sévelin | `reine_sevelin` | Helvara | 4 | 4 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Aphrodite du Nouvel An | `aphrodite_r` | Désir | 5 | 4 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Arès du Nouvel An | `ares_n` | Primordial | 5 | 4 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Circé de la Saint-Valentin | `circe_v` | Désir | 5 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Hel de la Saint-Valentin | `hel_v` | Primordial | 5 | 2 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Qetesh de la Saint-Valentin | `qetesh_v` | Désir | 5 | 2 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Aphrodite X Arès | `ulaphares` | Désir | 6 | 4 | Ultra-légendaire | Exige Aphrodite et Arès dans le deck. | non fixée (2099) |  |
| Arès X Athéna | `ularesathe` | Primordial | 6 | 4 | Ultra-légendaire | Exige Arès et Athéna dans le deck. | non fixée (2099) |  |
| Baldur X Ereshkigal | `ulbaldere` | Jugement | 6 | 4 | Ultra-légendaire | Exige Baldur et Ereshkigal dans le deck. | non fixée (2099) |  |
| Baldur X Frigg | `ulbaldfrigg` | Jugement | 6 | 4 | Ultra-légendaire | Exige Baldur et Frigg dans le deck. | non fixée (2099) |  |
| Circé X Calypso | `ulcircal` | Désir | 6 | 4 | Ultra-légendaire | Exige Circé et Calypso dans le deck. | non fixée (2099) |  |
| Ereshkigal de la Saint-Valentin | `ereshkigal_v` | Primordial | 6 | 7 | Légendaire | *(pas d'effet)* | non fixée (2099) |  |
| Ereshkigal de Noël | `ereshkigal_n` | Primordial | 6 | 7 | Légendaire | *(pas d'effet)* | non fixée (2099) |  |
| Hadès X Perséphone | `ulhadper` | Primordial | 6 | 4 | Ultra-légendaire | Exige Hadès et Perséphone dans le deck. | non fixée (2099) |  |
| Héra X Dionysos | `ulheradio` | Jugement | 6 | 4 | Ultra-légendaire | Exige Héra et Dionysos dans le deck. | non fixée (2099) |  |
| Inanna X Ereshkigal | `ulinaere` | Jugement | 6 | 4 | Ultra-légendaire | Exige Inanna et Ereshkigal dans le deck. | non fixée (2099) |  |
| L'Archiviste X La Patronne | `ularchiviste` | Helvara | 6 | 4 | Ultra-légendaire | Exige L'Archiviste du Sous-Gare et La Patronne d'Ouchy dans le deck. | non fixée (2099) |  |
| La Somnambule X La Reine | `ulsomnambule` | Helvara | 6 | 4 | Ultra-légendaire | Exige La Somnambule du Flon et La Reine de Sévelin dans le deck. | non fixée (2099) |  |
| Mā‘at X Set | `ulmaatset` | Jugement | 6 | 4 | Ultra-légendaire | Exige Mā‘at et Set dans le deck. | non fixée (2099) |  |
| Nike de la Saint-Valentin X Jordan | `ulnikejor_v` | Jugement | 6 | 4 | Ultra-légendaire | Exige Nike de la Saint-Valentin et Jordan dans le deck. | non fixée (2099) |  |
| Nike X Bia | `ulnikebia` | Jugement | 6 | 4 | Ultra-légendaire | Exige Nike et Bia dans le deck. | non fixée (2099) |  |
| Oshun X Oya | `uloshoya` | Désir | 6 | 4 | Ultra-légendaire | Exige Oshun et Oya dans le deck. | non fixée (2099) |  |
| Poséidon X Athéna | `ulposathe` | Primordial | 6 | 4 | Ultra-légendaire | Exige Poséidon et Athéna dans le deck. | non fixée (2099) |  |
| Prométhée X Bia | `ulprombia` | Primordial | 6 | 4 | Ultra-légendaire | Exige Prométhée et Bia dans le deck. | non fixée (2099) |  |
| Prométhée X Pandore | `ulprompan` | Primordial | 6 | 4 | Ultra-légendaire | Exige Prométhée et Pandore dans le deck. | non fixée (2099) |  |
| Qetesh X Jordan de la Saint-Valentin | `ulqetjor_v` | Désir | 6 | 4 | Ultra-légendaire | Exige Qetesh de la Saint-Valentin et Jordan dans le deck. | non fixée (2099) |  |
| Susanoo X Amaterasu | `ulsusama` | Jugement | 6 | 4 | Ultra-légendaire | Exige Susanoo et Amaterasu dans le deck. | non fixée (2099) |  |
| Typhon X Gaïa | `ultyphgaia` | Primordial | 6 | 4 | Ultra-légendaire | Exige Typhon et Gaïa dans le deck. | non fixée (2099) |  |

**Fusions pas encore sorties et leurs sources (provisoires)** :

- Aphrodite X Yarden : Aphrodite + Yarden Weiss
- Calypso X Jordan : Calypso + Jordan, le Créateur ou Jordan, le Narrateur
- Nemesis X Jordan : Nemesis + Jordan, le Créateur ou Jordan, le Narrateur
- Nyx X Circé : Nyx + Circé
- Nyx X Oshun : Nyx + Oshun
- Qetesh X Jordan : Qetesh + Jordan, le Créateur ou Jordan, le Narrateur
- Qetesh X Yarden : Qetesh + Yarden Weiss
- Hel X Baldur : Hel + Baldur
- Pele X Jordan du Réveillon : Pele du Réveillon + Jordan, le Créateur ou Jordan, le Narrateur
- Qetesh X Jordan du Nouvel An : Qetesh du Nouvel An + Jordan, le Créateur ou Jordan, le Narrateur
- La Somnambule X La Reine : La Somnambule du Flon + La Reine de Sévelin
- L'Archiviste X La Patronne : L'Archiviste du Sous-Gare + La Patronne d'Ouchy
- Qetesh X Jordan de la Saint-Valentin : Qetesh de la Saint-Valentin + Jordan, le Créateur ou Jordan, le Narrateur
- Prométhée X Bia : Prométhée + Bia
- Héra X Dionysos : Héra + Dionysos
- Poséidon X Athéna : Poséidon + Athéna
- Nike X Bia : Nike + Bia
- Mā‘at X Set : Mā‘at + Set
- Prométhée X Pandore : Prométhée + Pandore
- Inanna X Ereshkigal : Inanna + Ereshkigal
- Nike de la Saint-Valentin X Jordan : Nike de la Saint-Valentin + Jordan, le Créateur ou Jordan, le Narrateur
- Aphrodite X Arès : Aphrodite + Arès
- Typhon X Gaïa : Typhon + Gaïa
- Arès X Athéna : Arès + Athéna
- Baldur X Ereshkigal : Baldur + Ereshkigal
- Baldur X Frigg : Baldur + Frigg
- Susanoo X Amaterasu : Susanoo + Amaterasu
- Circé X Calypso : Circé + Calypso
- Oshun X Oya : Oshun + Oya
- Hadès X Perséphone : Hadès + Perséphone

## 5. Effets qui se ressemblent

Deux regroupements, faits sur le texte des effets (noms de cartes et nombres ignorés). Aucune recommandation : c'est un repérage. *(pas sortie)* signale une carte pas encore sortie.

### 5.1 Familles d'effets

Une carte peut appartenir à plusieurs familles. Entre parenthèses : coût, puissance, rareté.

**Détruit une carte adverse (la plus forte, la plus faible, selon un seuil…)** : 12 cartes (7 sorties, 5 pas encore)

- Rusalka (2/2, Commune) : Révélation : détruit la carte adverse la plus faible ici si elle a 2 ou moins.
- Izzy, Lune de Sang (3/0, Légendaire) : Révélation : détruit la carte adverse la plus forte ici (6 ou moins) et gagne la moitié de sa puissance, arrondie au-dessus.
- L'Esquille (3/1, Rare) : Révélation : détruit la carte adverse la plus faible ici.
- Sekhmet, Lionne de l'Hiver (4/4, Épique, pas sortie) : Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées.
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 de puissance où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient …
- Durga (5/5, Rare) : Révélation : détruit la carte adverse la plus forte ici si elle a 7 ou plus. Sinon, +3 de puissance.
- Nyx, Guerrière d'Halloween (5/4, Épique) : Révélation : détruit les 2 cartes adverses les plus faibles ici.
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2 de puissance. Exige Nemesis et Jordan dans le…
- Nyx (6/5, Légendaire) : Révélation : détruit la carte adverse la plus forte ici. Rien ne la protège.
- Nyx X Oshun (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre …

**Détruit ses propres cartes ou toutes les cartes d'un lieu** : 6 cartes (5 sorties, 1 pas encore)

- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- La Ficelle Dévorante (5/4, Épique) : Révélation : détruit tes autres cartes ici. +3 de puissance pour chacune.
- Le Troll (5/9, Commune) : Révélation : détruit ton autre carte la plus faible ici.
- Sekhmet (5/6, Rare) : Révélation : détruit toutes les autres cartes de puissance 2 ou moins ici, des deux côtés.
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.

**Affaiblit des cartes adverses (−N)** : 3 cartes (2 sorties, 1 pas encore)

- Pele X Jordan du Réveillon (2/1, Ultra-légendaire, pas sortie) : Révélation : la lave inflige −1 de puissance à toutes les cartes adverses, dans les 3 lieux. Exige Pele et Jordan dans le deck.
- Araignée de cristal (4/4, Rare) : Révélation : affaiblit de 1 toutes les cartes adverses ici.
- Pele (5/6, Rare) : Révélation : la lave inflige −2 de puissance à toutes les autres cartes ici, des deux côtés.

**Retire ou neutralise les effets d'une carte adverse** : 10 cartes (3 sorties, 7 pas encore)

- Circé (4/3, Épique, pas sortie) : Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet).
- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Médée, Mariée Spectrale (4/3, Épique) : Révélation : empoisonne la carte adverse la plus forte ici : elle perd 1 de puissance à la fin de chaque tour, jusqu'à 0. Si Hécate est de ton côté…
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Scáthach (4/3, Épique, pas sortie) : Révélation : laisse une Ombre de Scáthach (puissance −3, sans effet) du côté adverse, dans un autre lieu.
- Calypso (5/4, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu.
- Calypso, Reine des Glaces (5/3, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 de puissance par carte adverse ici.
- Oya (5/4, Épique) : Révélation : change la carte adverse la plus forte ici en carte de puissance 1, sans effet.
- Apsu (6/8, Légendaire) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. +6 de puissance si Yarden Weiss est de ton côté.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 de puiss…

**Vole, charme ou fait changer de côté une carte adverse** : 4 cartes (2 sorties, 2 pas encore)

- La Nuée de Miroirs (4/3, Rare) : Révélation : copie la puissance de ta carte la plus forte ici.
- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Lilith (6/5, Légendaire) : Révélation : la carte adverse la plus forte ici (6 ou moins) passe de ton côté. Si ton côté est plein, elle est détruite.

**Déplace ou renvoie des cartes** : 6 cartes (2 sorties, 4 pas encore)

- Hermès (1/1, Rare) : Révélation : déplace ta carte la plus forte ici vers un lieu révélé qu'elle te ferait remporter.
- Éris (3/3, Rare) : Révélation : déplace la carte adverse la plus forte ici vers un autre lieu.
- Heimdall (3/3, Épique, pas sortie) : Révélation : tes autres cartes ici passent par le Bifröst vers un lieu où l'on ne peut plus jouer, s'il y a de la place. Sinon, +2 de puissance.
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Susanoo (4/4, Épique, pas sortie) : Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3 de puissance. +2 de puissance si Amaterasu est de …
- Set (5/4, Épique, pas sortie) : Révélation : la tempête de sable disperse jusqu'à 2 cartes adverses d'ici, au hasard, vers les autres lieux s'il y a de la place. Chacune perd 1 de…

**Bonus de puissance à elle-même (Révélation conditionnelle ou fixe)** : 25 cartes (15 sorties, 10 pas encore)

- Le Comptable du Grand-Pont (1/1, Rare) : Révélation : +1 de puissance par autre carte à toi ici.
- Brigid (2/2, Rare, pas sortie) : Révélation : la prochaine carte que tu révèles gagne +3 de puissance.
- Izzy (2/1, Rare) : Révélation : prend la puissance de la carte adverse la plus forte ici, si elle est plus haute (6 au maximum).
- Le Charognard du M2 (2/2, Commune) : Révélation : +3 de puissance si une carte a été détruite ou défaussée pendant la partie.
- Le Funambule du Belvédère (2/2, Commune) : Révélation : +2 de puissance si c'est ta seule carte ici.
- Le Tatoueur de Chauderon (2/2, Rare, pas sortie) : Révélation : ta carte la plus forte ici gagne +1 de puissance et ne peut plus être affaiblie.
- Morrigan (2/2, Rare) : Continu : tu gagnes les égalités ici.
- Rémi (2/1, Commune) : Révélation : +2 de puissance par carte détruite ou défaussée depuis le début de la partie.
- Tefnut (2/2, Commune, pas sortie) : Révélation : +1 de puissance à tes autres cartes ici.
- Céleste (3/3, Rare) : Révélation : si tu ne mènes pas ici à son arrivée (sans compter Céleste), +3 de puissance.
- Freyr (3/3, Rare) : Révélation : +1 énergie au tour suivant. Continu : +2 de puissance si Freya est ici.
- Izzy, Lune de Sang (3/0, Légendaire) : Révélation : détruit la carte adverse la plus forte ici (6 ou moins) et gagne la moitié de sa puissance, arrondie au-dessus.
- Lip Dentelle (3/3, Épique, pas sortie) : Révélation : défausse la carte la plus chère de ta main et gagne sa puissance.
- Maeve (3/3, Commune) : Révélation : si tu mènes ici, +3 de puissance.
- Nike (3/1, Ultra-légendaire, pas sortie) : Révélation : +2 de puissance pour chaque autre carte que tu as jouée avant elle ce tour. Exige 8 cartes Jugement dans le deck, Nike comprise.
- Vasseur (3/2, Commune) : Révélation : +4 de puissance dans deux tours.
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- Andraste (4/3, Rare, pas sortie) : Révélation : +2 de puissance par carte adverse ici.
- La Nuée de Miroirs (4/3, Rare) : Révélation : copie la puissance de ta carte la plus forte ici.
- Oshun (4/3, Rare, pas sortie) : Révélation : +1 de puissance à toutes tes autres cartes, dans les 3 lieux.
- Susanoo (4/4, Épique, pas sortie) : Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3 de puissance. +2 de puissance si Amaterasu est de …
- Bastet (5/4, Rare) : Révélation : +2 de puissance à tes autres cartes ici.
- Calypso X Jordan (5/4, Ultra-légendaire, pas sortie) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2 de puissance. Exige Calypso et Jordan dans le deck.
- Yarden Weiss (5/6, Épique) : Révélation : +4 de puissance si tu as des cartes dans les 3 lieux (celles posées ce tour comptent).
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2 de puissance. Exige Nemesis et Jordan dans le…

**Bonus aux autres cartes alliées** : 7 cartes (2 sorties, 5 pas encore)

- Ishara (2/2, Rare) : Continu : tes autres cartes ici ont +1 de puissance.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2 de puissance.
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 de puissance où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient …
- La Doyenne (5/4, Commune) : Continu : tes autres cartes Helvara ont +1 de puissance, dans tous les lieux.
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2 de puissance. Exige Nemesis et Jordan dans le…
- Qetesh X Jordan (6/4, Ultra-légendaire, pas sortie) : Continu : tes autres cartes ont +1 de puissance, dans les 3 lieux. Exige Qetesh et Jordan dans le deck.
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de puissance 5 ou moins. Continu : tes autres cartes ici ont +1 de puissance. Exige Qetesh d…

**Pioche, défausse ou fouille le deck** : 20 cartes (8 sorties, 12 pas encore)

- Le Mendiant de la Riponne (0/2, Commune, pas sortie) : Révélation : défausse une carte au hasard de ta main. Nourrit Rémi.
- Coursier du Flon (1/1, Commune) : Révélation : pioche 1 carte.
- Jordan, le Créateur (1/-1, Épique) : Ne peut pas être affaibli. Révélation : ajoute Yarden Weiss à ta main depuis ton deck.
- Jordan, le Narrateur (1/0, Épique) : Révélation : ajoute à ta main, depuis ton deck, une carte qui peut former une Fusion avec Jordan.
- Le Bibliothécaire des Passages (1/2, Commune) : Révélation : pioche 1 carte si tu as moins de cartes en main que l'adversaire.
- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.
- Athéna (2/2, Rare, pas sortie) : Révélation : prends en main la plus chère des 3 premières cartes de ton deck.
- Dionysos (2/2, Rare, pas sortie) : Révélation : chaque joueur pioche 1 carte, puis défausse une carte au hasard.
- Éos (2/2, Rare) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté.
- Éos de Nouvel An (2/2, Épique, pas sortie) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins.
- La Voleuse du Flon (2/2, Légendaire, pas sortie) : Révélation : ton adversaire défausse une carte au hasard de sa main.
- Melinoë (2/2, Rare) : Révélation : défausse une carte au hasard de ta main, puis +3 de puissance. Main vide : pas de bonus.
- Morrigan, Sorcière d'Halloween (2/2, Épique) : Révélation : pioche 2 cartes, puis défausse la carte la plus chère de ta main.
- Cronos (3/3, Épique, pas sortie) : Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 de puissance pour chacune.
- Hécate (3/2, Commune) : Révélation : pioche 2 cartes.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2 de puissance.
- Lip Dentelle (3/3, Épique, pas sortie) : Révélation : défausse la carte la plus chère de ta main et gagne sa puissance.
- Loki (3/3, Épique, pas sortie) : Révélation : chaque joueur défausse la carte la plus chère de sa main.
- Odin (4/4, Légendaire, pas sortie) : Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes.
- Hel (6/3, Légendaire, pas sortie) : Révélation : défausse ta main, puis ressuscite ici jusqu'à 2 de tes cartes défaussées (les plus fortes), sans Révélation.

**Ressuscite** : 5 cartes (0 sorties, 5 pas encore)

- Hadès (4/4, Légendaire, pas sortie) : Révélation : ressuscite ici ta carte détruite la plus forte, sans Révélation. Si tu n'en as aucune, +3 de puissance.
- Loviatar (4/3, Épique, pas sortie) : Révélation : ressuscite ici ta dernière carte défaussée, sans Révélation. Elle perd 1 de puissance au début de chacun des 2 tours suivants. Si tu n…
- Hel, Reine du Réveillon (5/2, Épique, pas sortie) : Révélation : ressuscite ici ta carte défaussée la plus chère, avec sa Révélation.
- Hel (6/3, Légendaire, pas sortie) : Révélation : défausse ta main, puis ressuscite ici jusqu'à 2 de tes cartes défaussées (les plus fortes), sans Révélation.
- Hel X Baldur (6/3, Ultra-légendaire, pas sortie) : Révélation : ressuscite ici ta carte détruite ou défaussée la plus forte, avec sa Révélation. Elle ne peut plus être ni détruite ni affaiblie. Si c…

**Crée un jeton ou une copie** : 7 cartes (3 sorties, 4 pas encore)

- Kitsune (1/1, Commune) : Révélation : laisse une Illusion de puissance 2 dans un autre lieu.
- Dame Joanna (2/2, Épique) : Révélation : laisse une Lanterne de puissance 2 dans chacun de tes autres lieux où tu as déjà une carte.
- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Scáthach (4/3, Épique, pas sortie) : Révélation : laisse une Ombre de Scáthach (puissance −3, sans effet) du côté adverse, dans un autre lieu.
- Thor (4/3, Épique, pas sortie) : Révélation : lance Mjölnir (jeton de puissance 2) dans un autre lieu. Si Mjölnir est détruit, +2 de puissance.
- Aphrodite, Étoile de Noël (5/4, Épique, pas sortie) : Révélation : laisse un Reflet d'Aphrodite de puissance 3 dans chacun de tes autres lieux.
- La Mère de Cendre (5/4, Rare) : Révélation : laisse un Cendreux de puissance 2 dans chacun de tes autres lieux.

**Énergie ou coût des cartes** : 12 cartes (3 sorties, 9 pas encore)

- Prométhée (1/1, Légendaire, pas sortie) : Continu : l'énergie que tu ne dépenses pas est conservée au tour suivant (10 maximum).
- Éos de Nouvel An (2/2, Épique, pas sortie) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins.
- Félix (2/3, Rare) : Révélation : ta prochaine carte coûte 1 de moins.
- Bia (3/3, Rare, pas sortie) : Révélation : l'adversaire perd son énergie conservée. S'il n'en avait pas, −1 de puissance à sa carte la plus forte ici.
- Cronos (3/3, Épique, pas sortie) : Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 de puissance pour chacune.
- Freyr (3/3, Rare) : Révélation : +1 énergie au tour suivant. Continu : +2 de puissance si Freya est ici.
- Pandore (3/0, Épique, pas sortie) : Révélation : dépense toute l'énergie qu'il te reste. +2 de puissance par énergie dépensée.
- Baldur (4/4, Épique, pas sortie) : Les effets adverses ne peuvent ni le détruire ni l'affaiblir, sauf ceux des cartes de coût 2 ou moins (le gui) et ceux où « rien ne le protège ».
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 de puiss…
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Yarden X Apsu (9/12, Ultra-légendaire) : Coûte 1 de moins par autre carte dans ta main. Révélation : +1 de puissance par carte restée dans ta main. Exige Yarden Weiss et Apsu dans le deck.

**Protection contre la destruction, l'affaiblissement ou le ciblage** : 7 cartes (5 sorties, 2 pas encore)

- Jordan, le Créateur (1/-1, Épique) : Ne peut pas être affaibli. Révélation : ajoute Yarden Weiss à ta main depuis ton deck.
- L'Écorché Silencieux (3/3, Rare) : Ne peut pas être affaibli. Révélation : −2 de puissance à une carte adverse au hasard ici.
- Chernobog (4/4, Épique, pas sortie) : Continu : les cartes adverses ici ne peuvent pas dépasser leur puissance de base.
- Eir (4/3, Rare) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies.
- Psyché (4/3, Épique) : Continu : tes cartes ici ne descendent pas sous 1. Révélation : +2 de puissance à ta carte la plus faible ici.
- Amaterasu (5/4, Épique) : Continu : tes cartes ne peuvent pas être affaiblies, dans les 3 lieux.
- Calypso X Jordan (5/4, Ultra-légendaire, pas sortie) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2 de puissance. Exige Calypso et Jordan dans le deck.

**Règle du lieu ou de la partie (verrouille, arrête, égalités…)** : 6 cartes (3 sorties, 3 pas encore)

- Le Sans-Voix (2/4, Rare, pas sortie) : Révélation : ton adversaire ne peut pas jouer ici au prochain tour.
- Morrigan (2/2, Rare) : Continu : tu gagnes les égalités ici.
- Le Bourreau de la brèche (3/4, Épique, pas sortie) : Révélation : condamne une case adverse ici jusqu'à la fin de la partie.
- Perséphone (3/3, Rare) : Révélation : l'effet du lieu s'arrête.
- Nemesis (5/-5, Légendaire, pas sortie) : Ne peut pas être jouée au tour 6. Continu : dans ce lieu, c'est le joueur avec le moins de puissance qui gagne. Deux Nemesis s'annulent.
- Vritra (5/5, Légendaire) : Révélation : plus personne ne peut jouer ici.

### 5.2 Formulations presque identiques

Cartes dont le texte est très proche (similarité des mots d'au moins 60 %, même type Révélation ou Continu).

**Groupe 1** (3 cartes, Révélation) :
- L'Esquille (3/1, Rare) : Révélation : détruit la carte adverse la plus faible ici.
- Le Troll (5/9, Commune) : Révélation : détruit ton autre carte la plus faible ici.
- Rusalka (2/2, Commune) : Révélation : détruit la carte adverse la plus faible ici si elle a 2 ou moins.

**Groupe 2** (3 cartes, Révélation) :
- Bastet (5/4, Rare) : Révélation : +2 de puissance à tes autres cartes ici.
- La Ficelle Dévorante (5/4, Épique) : Révélation : détruit tes autres cartes ici. +3 de puissance pour chacune.
- Tefnut (2/2, Commune, pas sortie) : Révélation : +1 de puissance à tes autres cartes ici.

**Groupe 3** (3 cartes, Révélation) :
- Agent de Thot (3/3, Rare) : Révélation : −2 de puissance à la carte adverse la plus forte ici.
- La Nuée de Miroirs (4/3, Rare) : Révélation : copie la puissance de ta carte la plus forte ici.
- Týr (2/3, Rare) : Révélation : −1 de puissance à chaque carte adverse ici qui a 4 de puissance ou plus.

**Groupe 4** (2 cartes, Continu) :
- Les Costumes (4/3, Commune) : Continu : +4 de puissance si l'Agent de Thot est en jeu.
- Freya (5/5, Rare) : Continu : +4 de puissance si Freyr est ici.

**Groupe 5** (2 cartes, Révélation) :
- Apsu (6/8, Légendaire) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. +6 de puissance si Yarden Weiss est de ton côté.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 de puissance si Yarden Weiss est de ton côté.

**Groupe 6** (2 cartes, Continu) :
- Hathor (4/3, Rare) : Continu : −1 de puissance aux cartes adverses ici.
- La Mouche de la Faille (1/3, Commune, pas sortie) : Continu : −1 de puissance à tes autres cartes ici.

**Groupe 7** (2 cartes, Révélation) :
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.

**Groupe 8** (2 cartes, Révélation) :
- Éos (2/2, Rare) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté.
- Éos de Nouvel An (2/2, Épique, pas sortie) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins.

**Groupe 9** (2 cartes, Révélation) :
- Arès (4/3, Rare) : Révélation : −1 de puissance à chaque carte adverse ici. +1 de puissance pour chacune.
- Arès, Boucher d'Halloween (5/4, Épique) : Révélation : −2 de puissance à chaque carte adverse ici. +1 de puissance pour chacune.

**Groupe 10** (2 cartes, Révélation) :
- La Mère de Cendre (5/4, Rare) : Révélation : laisse un Cendreux de puissance 2 dans chacun de tes autres lieux.
- Aphrodite, Étoile de Noël (5/4, Épique, pas sortie) : Révélation : laisse un Reflet d'Aphrodite de puissance 3 dans chacun de tes autres lieux.

**Groupe 11** (2 cartes, Révélation) :
- Morrigan, Sorcière d'Halloween (2/2, Épique) : Révélation : pioche 2 cartes, puis défausse la carte la plus chère de ta main.
- Odin (4/4, Légendaire, pas sortie) : Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes.

**Groupe 12** (2 cartes, Révélation) :
- Calypso, Reine des Glaces (5/3, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 de puissance par carte adverse ici.
- Calypso (5/4, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu.

**Groupe 13** (2 cartes, Révélation) :
- Andraste (4/3, Rare, pas sortie) : Révélation : +2 de puissance par carte adverse ici.
- Le Comptable du Grand-Pont (1/1, Rare) : Révélation : +1 de puissance par autre carte à toi ici.

### 5.3 Même cible, verbes différents

Cartes qui visent la même chose (« la carte adverse la plus forte ici »…), quel que soit ce qu'elles lui font. C'est ce regroupement qui montre les effets de « destruction / vol / affaiblissement de la plus forte carte » en concurrence.

**La carte adverse la plus forte (ici ou ailleurs)** : 20 cartes (12 sorties, 8 pas encore)

- Mohini (1/1, Légendaire) : Révélation : la carte adverse la plus forte ici perd ses effets.
- Izzy (2/1, Rare) : Révélation : prend la puissance de la carte adverse la plus forte ici, si elle est plus haute (6 au maximum).
- Agent de Thot (3/3, Rare) : Révélation : −2 de puissance à la carte adverse la plus forte ici.
- Éris (3/3, Rare) : Révélation : déplace la carte adverse la plus forte ici vers un autre lieu.
- Izzy, Lune de Sang (3/0, Légendaire) : Révélation : détruit la carte adverse la plus forte ici (6 ou moins) et gagne la moitié de sa puissance, arrondie au-dessus.
- Ishtar (4/3, Épique) : Continu : à la fin des tours 1 à 5, −1 de puissance à la carte adverse la plus forte ici.
- Ixchel (4/4, Épique) : Révélation : −3 de puissance à la carte adverse la plus forte, dans n'importe quel lieu.
- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Médée, Mariée Spectrale (4/3, Épique) : Révélation : empoisonne la carte adverse la plus forte ici : elle perd 1 de puissance à la fin de chaque tour, jusqu'à 0. Si Hécate est de ton côté, empoisonne aussi l…
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Calypso (5/4, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu.
- Calypso, Reine des Glaces (5/3, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 de puissance par carte adverse ici.
- Durga (5/5, Rare) : Révélation : détruit la carte adverse la plus forte ici si elle a 7 ou plus. Sinon, +3 de puissance.
- Oya (5/4, Épique) : Révélation : change la carte adverse la plus forte ici en carte de puissance 1, sans effet.
- Pele du Réveillon (5/3, Épique, pas sortie) : Révélation : le feu d'artifice éclate dans les 3 lieux. −2 de puissance à la carte adverse la plus forte de chaque lieu.
- Qetesh du Nouvel An (5/3, Épique, pas sortie) : Révélation : au début du tour suivant, charme la carte adverse la plus forte ici de puissance 5 ou moins.
- Lilith (6/5, Légendaire) : Révélation : la carte adverse la plus forte ici (6 ou moins) passe de ton côté. Si ton côté est plein, elle est détruite.
- Nyx (6/5, Légendaire) : Révélation : détruit la carte adverse la plus forte ici. Rien ne la protège.
- Nyx X Oshun (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre lieu. Exige Nyx et O…
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de puissance 5 ou moins. Continu : tes autres cartes ici ont +1 de puissance. Exige Qetesh du Nouvel An et Jorda…

**La carte adverse la plus faible** : 5 cartes (4 sorties, 1 pas encore)

- Rusalka (2/2, Commune) : Révélation : détruit la carte adverse la plus faible ici si elle a 2 ou moins.
- Artémis (3/3, Rare) : Révélation : −2 de puissance à la carte adverse la plus faible ici. +2 de puissance si Izzy est de ton côté.
- L'Esquille (3/1, Rare) : Révélation : détruit la carte adverse la plus faible ici.
- Hédoné (4/2, Ultra-légendaire, pas sortie) : Continu : à la fin de chaque tour, attire ici la carte adverse la plus faible d'un autre lieu, s'il y a de la place, et la charme tant qu'Hédoné reste en jeu. 2 fois m…
- Nyx, Guerrière d'Halloween (5/4, Épique) : Révélation : détruit les 2 cartes adverses les plus faibles ici.

**Toutes les cartes adverses d'un lieu ou de tous les lieux** : 15 cartes (7 sorties, 8 pas encore)

- Pele X Jordan du Réveillon (2/1, Ultra-légendaire, pas sortie) : Révélation : la lave inflige −1 de puissance à toutes les cartes adverses, dans les 3 lieux. Exige Pele et Jordan dans le deck.
- Týr (2/3, Rare) : Révélation : −1 de puissance à chaque carte adverse ici qui a 4 de puissance ou plus.
- Araignée de cristal (4/4, Rare) : Révélation : affaiblit de 1 toutes les cartes adverses ici.
- Arès (4/3, Rare) : Révélation : −1 de puissance à chaque carte adverse ici. +1 de puissance pour chacune.
- Chernobog (4/4, Épique, pas sortie) : Continu : les cartes adverses ici ne peuvent pas dépasser leur puissance de base.
- Circé (4/3, Épique, pas sortie) : Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet).
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Sekhmet, Lionne de l'Hiver (4/4, Épique, pas sortie) : Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées.
- Arès, Boucher d'Halloween (5/4, Épique) : Révélation : −2 de puissance à chaque carte adverse ici. +1 de puissance pour chacune.
- Nergal (5/4, Épique) : Révélation : −1 de puissance à toutes les cartes adverses, dans les 3 lieux. Continu : +3 de puissance tant qu'Ereshkigal est de ton côté.
- Apsu (6/8, Légendaire) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. +6 de puissance si Yarden Weiss est de ton côté.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 de puissance si Yarden Weiss…
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Nyx X Circé (6/3, Ultra-légendaire, pas sortie) : Révélation : les cartes adverses ici deviennent des Pourceaux. Exige Nyx et Circé dans le deck.

**Une carte adverse au hasard, ou tirée selon un seuil de puissance ou de coût** : 20 cartes (10 sorties, 10 pas encore)

- Rusalka (2/2, Commune) : Révélation : détruit la carte adverse la plus faible ici si elle a 2 ou moins.
- Týr (2/3, Rare) : Révélation : −1 de puissance à chaque carte adverse ici qui a 4 de puissance ou plus.
- Izzy, Lune de Sang (3/0, Légendaire) : Révélation : détruit la carte adverse la plus forte ici (6 ou moins) et gagne la moitié de sa puissance, arrondie au-dessus.
- L'Écorché Silencieux (3/3, Rare) : Ne peut pas être affaibli. Révélation : −2 de puissance à une carte adverse au hasard ici.
- Skadi (3/3, Rare) : Révélation : −3 de puissance à une carte adverse au hasard, dans un autre lieu.
- Baldur (4/4, Épique, pas sortie) : Les effets adverses ne peuvent ni le détruire ni l'affaiblir, sauf ceux des cartes de coût 2 ou moins (le gui) et ceux où « rien ne le protège ».
- Circé (4/3, Épique, pas sortie) : Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet).
- Médée (4/4, Épique, pas sortie) : Continu : la prochaine carte adverse jouée ici perd 2 de puissance. Si Hécate est de ton côté, les deux prochaines.
- Médée, Mariée Spectrale (4/3, Épique) : Révélation : empoisonne la carte adverse la plus forte ici : elle perd 1 de puissance à la fin de chaque tour, jusqu'à 0. Si Hécate est de ton côté, empoisonne aussi l…
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Sekhmet, Lionne de l'Hiver (4/4, Épique, pas sortie) : Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées.
- Durga (5/5, Rare) : Révélation : détruit la carte adverse la plus forte ici si elle a 7 ou plus. Sinon, +3 de puissance.
- Oya (5/4, Épique) : Révélation : change la carte adverse la plus forte ici en carte de puissance 1, sans effet.
- Qetesh du Nouvel An (5/3, Épique, pas sortie) : Révélation : au début du tour suivant, charme la carte adverse la plus forte ici de puissance 5 ou moins.
- Ananké (6/1, Ultra-légendaire, pas sortie) : Fatalité : rien ne peut l'atteindre. Fin de partie : sa puissance devient égale à la puissance totale adverse ici, +1 de puissance. Exige 8 cartes Primordial dans le d…
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Lilith (6/5, Légendaire) : Révélation : la carte adverse la plus forte ici (6 ou moins) passe de ton côté. Si ton côté est plein, elle est détruite.
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de puissance 5 ou moins. Continu : tes autres cartes ici ont +1 de puissance. Exige Qetesh du Nouvel An et Jorda…

**Ta carte la plus faible ou ta carte la plus forte** : 11 cartes (6 sorties, 5 pas encore)

- Hermès (1/1, Rare) : Révélation : déplace ta carte la plus forte ici vers un lieu révélé qu'elle te ferait remporter.
- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.
- Idunn (2/2, Rare) : Continu : à la fin des tours 1 à 5, +1 de puissance à ta carte la plus faible ici.
- Le Tatoueur de Chauderon (2/2, Rare, pas sortie) : Révélation : ta carte la plus forte ici gagne +1 de puissance et ne peut plus être affaiblie.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2 de puissance.
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- La Nuée de Miroirs (4/3, Rare) : Révélation : copie la puissance de ta carte la plus forte ici.
- Psyché (4/3, Épique) : Continu : tes cartes ici ne descendent pas sous 1. Révélation : +2 de puissance à ta carte la plus faible ici.
- Susanoo (4/4, Épique, pas sortie) : Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3 de puissance. +2 de puissance si Amaterasu est de ton côté.
- Le Troll (5/9, Commune) : Révélation : détruit ton autre carte la plus faible ici.
- Nyx X Oshun (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre lieu. Exige Nyx et O…

**Tes autres cartes ici ou dans tous les lieux** : 18 cartes (7 sorties, 11 pas encore)

- La Mouche de la Faille (1/3, Commune, pas sortie) : Continu : −1 de puissance à tes autres cartes ici.
- Ishara (2/2, Rare) : Continu : tes autres cartes ici ont +1 de puissance.
- Tefnut (2/2, Commune, pas sortie) : Révélation : +1 de puissance à tes autres cartes ici.
- Heimdall (3/3, Épique, pas sortie) : Révélation : tes autres cartes ici passent par le Bifröst vers un lieu où l'on ne peut plus jouer, s'il y a de la place. Sinon, +2 de puissance.
- Le Carillonneur de la Cathédrale (3/1, Légendaire, pas sortie) : Continu : à la fin de chaque tour, +1 de puissance. Fin du tour 6 : le glas sonne, tes autres cartes ici gagnent la moitié de sa puissance (arrondie au-dessous).
- Eir (4/3, Rare) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies.
- Oshun (4/3, Rare, pas sortie) : Révélation : +1 de puissance à toutes tes autres cartes, dans les 3 lieux.
- Psyché (4/3, Épique) : Continu : tes cartes ici ne descendent pas sous 1. Révélation : +2 de puissance à ta carte la plus faible ici.
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 de puissance où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main.
- Amaterasu (5/4, Épique) : Continu : tes cartes ne peuvent pas être affaiblies, dans les 3 lieux.
- Bastet (5/4, Rare) : Révélation : +2 de puissance à tes autres cartes ici.
- Calypso X Jordan (5/4, Ultra-légendaire, pas sortie) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2 de puissance. Exige Calypso et Jordan dans le deck.
- La Doyenne (5/4, Commune) : Continu : tes autres cartes Helvara ont +1 de puissance, dans tous les lieux.
- La Ficelle Dévorante (5/4, Épique) : Révélation : détruit tes autres cartes ici. +3 de puissance pour chacune.
- Aphrodite X Yarden (6/5, Ultra-légendaire, pas sortie) : Révélation : rejoue la Révélation de chacune de tes autres cartes ici. Exige Aphrodite et Yarden Weiss dans le deck.
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2 de puissance. Exige Nemesis et Jordan dans le deck.
- Qetesh X Jordan (6/4, Ultra-légendaire, pas sortie) : Continu : tes autres cartes ont +1 de puissance, dans les 3 lieux. Exige Qetesh et Jordan dans le deck.
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de puissance 5 ou moins. Continu : tes autres cartes ici ont +1 de puissance. Exige Qetesh du Nouvel An et Jorda…

**La main ou le deck (pioche, défausse, prise en main)** : 17 cartes (6 sorties, 11 pas encore)

- Le Mendiant de la Riponne (0/2, Commune, pas sortie) : Révélation : défausse une carte au hasard de ta main. Nourrit Rémi.
- Jordan, le Créateur (1/-1, Épique) : Ne peut pas être affaibli. Révélation : ajoute Yarden Weiss à ta main depuis ton deck.
- Jordan, le Narrateur (1/0, Épique) : Révélation : ajoute à ta main, depuis ton deck, une carte qui peut former une Fusion avec Jordan.
- Athéna (2/2, Rare, pas sortie) : Révélation : prends en main la plus chère des 3 premières cartes de ton deck.
- La Voleuse du Flon (2/2, Légendaire, pas sortie) : Révélation : ton adversaire défausse une carte au hasard de sa main.
- Le Sans-Voix (2/4, Rare, pas sortie) : Révélation : ton adversaire ne peut pas jouer ici au prochain tour.
- Melinoë (2/2, Rare) : Révélation : défausse une carte au hasard de ta main, puis +3 de puissance. Main vide : pas de bonus.
- Morrigan, Sorcière d'Halloween (2/2, Épique) : Révélation : pioche 2 cartes, puis défausse la carte la plus chère de ta main.
- Cronos (3/3, Épique, pas sortie) : Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 de puissance pour chacune.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2 de puissance.
- Lip Dentelle (3/3, Épique, pas sortie) : Révélation : défausse la carte la plus chère de ta main et gagne sa puissance.
- Odin (4/4, Légendaire, pas sortie) : Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes.
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 de puissance où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main.
- Hel (6/3, Légendaire, pas sortie) : Révélation : défausse ta main, puis ressuscite ici jusqu'à 2 de tes cartes défaussées (les plus fortes), sans Révélation.
- Jordan X Izzy (6/6, Ultra-légendaire) : Révélation : prend la carte la plus puissante de la main adverse et l'invoque ici, ou dans un autre lieu si c'est plein. Exige Jordan et Izzy dans le deck.
- Yarden X Apsu (9/12, Ultra-légendaire) : Coûte 1 de moins par autre carte dans ta main. Révélation : +1 de puissance par carte restée dans ta main. Exige Yarden Weiss et Apsu dans le deck.

---
*Pour relancer : `node outils/equilibrage.js --parties 5000`. Voir l'en-tête du script pour les options.*
