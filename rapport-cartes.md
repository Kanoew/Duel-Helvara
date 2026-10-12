# Rapport des cartes · Duel d'Helvara

Généré le 2026-10-12 15:42 UTC par `outils/equilibrage.js` (version du moteur alpha-0.4). **Aucune carte n'a été modifiée et aucun chiffre n'est proposé** : ce document sert à décider.

- **Parties simulées** : 6000 (6000 terminées), IA de palier 5 contre IA de palier 5, graine 20261012, 33 s.
- **Cartes en jeu** : toutes celles dont la date de sortie est au plus le 2026-12-31 (cartes cachées de 2099 jouées : cronos, izanami, loki ; les autres cachées, sans effet, ne sont pas jouées).
- **Decks** : 12 cartes, mêmes règles que le jeu (une version par personnage, une seule ultra-légendaire, ses conditions remplies). Trois decks sur quatre sont tirés au hasard avec une faction dominante et une courbe de coûts raisonnable ; un sur quatre est fabriqué par le jeu pour son IA. Ce ne sont pas des decks de joueurs : les cartes les plus fortes ne sont pas surreprésentées.
- **Lieux** : 3 lieux tirés au hasard parmi ceux sortis à cette date, comme dans une vraie partie.
- **Camp qui révèle en premier** (le « joueur ») : 48.1 % de victoires (nulles : 0.8 %). Un écart net avec 50 % signalerait un avantage lié à l'ordre de révélation.
- **Moyenne de victoires d'une carte présente dans un deck** : 49.6 % (nulles : 0.8 % des parties).
- Lecture : ce sont des parties IA contre IA. Un humain joue les combinaisons, le serment et les lieux mieux (ou moins bien) que l'IA : les chiffres indiquent des tendances, pas une vérité. En dessous de 100 decks, la marge d'erreur dépasse ±10 points : à lire avec prudence (⚠).

## 1. Santé du moteur

Aucune erreur : 6000 parties jouées de bout en bout, sans plantage, sans puissance invalide (NaN), sans erreur dans la console.

## 2. Répartition par rareté et par coût

Jetons exclus. « Sorties » = date de sortie au plus le 2026-10-12.

### Toutes les cartes, cachées incluses (216 cartes)

| Rareté \ Coût | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 9 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Commune | 1 | 6 | 6 | 3 | 3 | 2 | · | · | **21** |
| Rare | · | 3 | 18 | 14 | 8 | 7 | 1 | · | **51** |
| Épique | · | 3 | 3 | 42 | 17 | 23 | · | · | **88** |
| Légendaire | · | 2 | 1 | 2 | 3 | 3 | 10 | · | **21** |
| Ultra-légendaire | · | · | · | 2 | · | 1 | 31 | 1 | **35** |
| **Total** | **1** | **14** | **28** | **63** | **31** | **36** | **42** | **1** | **216** |

Par faction : Helvara 44 · Primordial 63 · Désir 53 · Jugement 56

### Cartes déjà sorties au 2026-10-12 (80 cartes)

| Rareté \ Coût | 1 | 2 | 3 | 4 | 5 | 6 | 9 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Commune | 4 | 5 | 3 | 3 | 2 | · | · | **17** |
| Rare | 3 | 10 | 10 | 5 | 7 | · | · | **35** |
| Épique | 2 | 2 | · | 5 | 9 | · | · | **18** |
| Légendaire | 1 | · | 1 | · | 1 | 5 | · | **8** |
| Ultra-légendaire | · | · | · | · | · | 1 | 1 | **2** |
| **Total** | **10** | **17** | **14** | **13** | **19** | **6** | **1** | **80** |

Par faction : Helvara 19 · Primordial 22 · Désir 21 · Jugement 18

### Cartes pas encore sorties (dont 72 sans date) (136 cartes)

| Rareté \ Coût | 0 | 1 | 2 | 3 | 4 | 5 | 6 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Commune | 1 | 2 | 1 | · | · | · | · | **4** |
| Rare | · | · | 8 | 4 | 3 | · | 1 | **16** |
| Épique | · | 1 | 1 | 42 | 12 | 14 | · | **70** |
| Légendaire | · | 1 | 1 | 1 | 3 | 2 | 5 | **13** |
| Ultra-légendaire | · | · | · | 2 | · | 1 | 30 | **33** |
| **Total** | **1** | **4** | **11** | **49** | **18** | **17** | **36** | **136** |

Par faction : Helvara 25 · Primordial 41 · Désir 32 · Jugement 38

Cartes de coût 5 ou plus : **79** sur 216 (37 %). Ultra-légendaires : **35**, légendaires : **21**, communes : **21**.

## 3. Statistiques par carte (simulation)

Colonnes : **decks** = nombre de decks (des deux camps) qui contenaient la carte ; **victoire (deck)** = parties gagnées quand la carte était dans le deck ; **pose** = part des parties où elle a été jouée quand elle était dans le deck ; **victoire (posée)** = parties gagnées quand elle a été jouée ; **écart** = victoire (deck) moins la moyenne (49.6 %), en points ; **puiss. fin** = puissance moyenne de la carte à la fin, quand elle est encore en jeu ; **survie** = part des parties où elle était encore en jeu à la fin ; **tour** = tour moyen de pose. ⚠ = moins de 100 decks.

### Les 15 cartes qui gagnent le plus (au moins 100 decks)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qetesh X Jordan du Nouvel An *(pas sortie)* | `ulqetjor_r` | Désir | 6 | 4 | Ultra-légendaire | 312 | 68.9 % | 48 % | 83.4 % | +19.3 | 3.8 | 99 % | 5.9 |
| Yarden X Apsu | `ulya` | Primordial | 9 | 12 | Ultra-légendaire | 570 | 68.2 % | 63 % | 72.9 % | +18.6 | 16.0 | 96 % | 4.8 |
| Apsu | `apsu` | Primordial | 6 | 8 | Légendaire | 899 | 62.8 % | 30 % | 64.2 % | +13.2 | 10.1 | 99 % | 5.9 |
| Qetesh du Nouvel An *(pas sortie)* | `qetesh_r` | Désir | 5 | 3 | Épique | 698 | 61.7 % | 47 % | 66.7 % | +12.1 | 3.3 | 97 % | 4.8 |
| Yarden Weiss | `yarden` | Primordial | 5 | 6 | Épique | 1612 | 58.6 % | 59 % | 60.5 % | +9.0 | 8.5 | 95 % | 5.2 |
| Calypso, Reine des Glaces *(pas sortie)* | `calypso_n` | Désir | 5 | 3 | Épique | 403 | 57.3 % | 50 % | 57.6 % | +7.7 | 5.3 | 95 % | 5.3 |
| Nyx X Oshun *(pas sortie)* | `uloshun` | Primordial | 6 | 4 | Ultra-légendaire | 325 | 56.6 % | 33 % | 68.2 % | +7.0 | 3.9 | 98 % | 5.9 |
| Qetesh X Yarden *(pas sortie)* | `ulqetyar` | Désir | 6 | 3 | Ultra-légendaire | 296 | 56.1 % | 8 % | 48.0 % | +6.5 | 6.6 | 100 % | 6.0 |
| Calypso X Jordan *(pas sortie)* | `ulcal` | Désir | 5 | 4 | Ultra-légendaire | 297 | 55.9 % | 35 % | 64.8 % | +6.3 | 4.2 | 100 % | 5.3 |
| Nemesis *(pas sortie)* | `nemesis` | Jugement | 5 | -5 | Légendaire | 1117 | 55.4 % | 59 % | 61.7 % | +5.8 | -4.9 | 95 % | 4.9 |
| Set *(pas sortie)* | `set` | Primordial | 5 | 4 | Épique | 453 | 55.4 % | 31 % | 54.6 % | +5.8 | 4.0 | 96 % | 5.4 |
| Balor *(pas sortie)* | `balor` | Jugement | 6 | 5 | Rare | 831 | 55.0 % | 34 % | 62.1 % | +5.4 | 5.2 | 99 % | 5.8 |
| Arès, Boucher d'Halloween | `ares_h` | Primordial | 5 | 4 | Épique | 451 | 54.8 % | 51 % | 61.1 % | +5.2 | 6.0 | 96 % | 5.3 |
| Nyx X Circé *(pas sortie)* | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | 293 | 54.3 % | 16 % | 60.4 % | +4.7 | 3.0 | 100 % | 5.9 |
| Le Troll | `troll` | Primordial | 5 | 9 | Commune | 439 | 54.2 % | 54 % | 56.3 % | +4.6 | 9.0 | 95 % | 5.1 |

### Les 15 cartes qui gagnent le moins (au moins 100 decks)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Pele X Jordan du Réveillon *(pas sortie)* | `ulpele_r` | Primordial | 6 | 4 | Ultra-légendaire | 312 | 41.0 % | 31 % | 38.8 % | -8.6 | 3.8 | 99 % | 5.9 |
| Eir | `eir` | Jugement | 4 | 3 | Rare | 849 | 42.3 % | 16 % | 31.4 % | -7.3 | 3.3 | 99 % | 4.9 |
| Hel X Baldur *(pas sortie)* | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | 274 | 43.1 % | 12 % | 65.6 % | -6.5 | 3.1 | 100 % | 6.0 |
| Hel *(pas sortie)* | `hel` | Primordial | 6 | 5 | Légendaire | 877 | 43.7 % | 24 % | 43.9 % | -5.9 | 5.2 | 97 % | 5.9 |
| Vritra | `vritra` | Primordial | 5 | 5 | Légendaire | 1116 | 44.2 % | 42 % | 41.3 % | -5.4 | 5.1 | 97 % | 5.2 |
| Circé *(pas sortie)* | `circe` | Désir | 5 | 3 | Épique | 1150 | 44.7 % | 21 % | 43.6 % | -4.9 | 3.1 | 93 % | 5.2 |
| Dante *(pas sortie)* | `dante` | Primordial | 4 | 4 | Rare | 697 | 44.8 % | 37 % | 41.9 % | -4.8 | 4.1 | 89 % | 4.7 |
| Ishtar | `ishtar` | Désir | 4 | 3 | Épique | 1196 | 45.0 % | 21 % | 38.9 % | -4.6 | 3.1 | 93 % | 4.9 |
| Loviatar *(pas sortie)* | `loviatar` | Primordial | 4 | 3 | Épique | 951 | 45.0 % | 28 % | 38.7 % | -4.6 | 3.1 | 93 % | 4.7 |
| Konohanasakuya-Hime | `konohana` | Désir | 1 | 4 | Rare | 911 | 45.0 % | 77 % | 43.7 % | -4.6 | 1.0 | 86 % | 2.7 |
| Cronos *(pas sortie)* | `cronos` | Primordial | 3 | 3 | Épique | 1530 | 45.2 % | 52 % | 39.3 % | -4.4 | 3.6 | 93 % | 3.9 |
| Loki *(pas sortie)* | `loki` | Désir | 3 | 3 | Épique | 1545 | 45.4 % | 51 % | 39.6 % | -4.2 | 3.1 | 91 % | 4.2 |
| Izanami *(pas sortie)* | `izanami` | Primordial | 3 | 3 | Épique | 1513 | 45.6 % | 37 % | 38.6 % | -4.0 | 3.1 | 90 % | 4.1 |
| Tlazolteotl | `tlazol` | Désir | 3 | 2 | Rare | 903 | 45.6 % | 37 % | 40.8 % | -4.0 | 2.7 | 92 % | 4.5 |
| L'Esquille | `esquille` | Primordial | 3 | 1 | Rare | 842 | 45.7 % | 52 % | 44.0 % | -3.9 | 1.3 | 88 % | 4.3 |

### Les cartes jamais ou presque jamais jouées alors qu'elles sont dans le deck (pose sous 50 %, au moins 100 decks)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qetesh X Yarden *(pas sortie)* | `ulqetyar` | Désir | 6 | 3 | Ultra-légendaire | 296 | 56.1 % | 8 % | 48.0 % | +6.5 | 6.6 | 100 % | 6.0 |
| Amaterasu | `amaterasu` | Jugement | 5 | 4 | Épique | 529 | 48.6 % | 11 % | 34.5 % | -1.0 | 4.2 | 93 % | 5.4 |
| Yarden, Dragonification partielle | `yarden_d` | Primordial | 6 | 3 | Légendaire | 356 | 47.5 % | 11 % | 30.0 % | -2.1 | 6.8 | 98 % | 5.9 |
| Hel X Baldur *(pas sortie)* | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | 274 | 43.1 % | 12 % | 65.6 % | -6.5 | 3.1 | 100 % | 6.0 |
| Nemesis X Jordan *(pas sortie)* | `ulnem` | Jugement | 6 | 2 | Ultra-légendaire | 299 | 53.8 % | 13 % | 46.2 % | +4.2 | 1.9 | 100 % | 5.9 |
| Médée, Mariée Spectrale | `medee_h` | Jugement | 4 | 3 | Épique | 769 | 46.3 % | 13 % | 43.6 % | -3.3 | 3.1 | 96 % | 4.8 |
| Eir | `eir` | Jugement | 4 | 3 | Rare | 849 | 42.3 % | 16 % | 31.4 % | -7.3 | 3.3 | 99 % | 4.9 |
| Aphrodite X Yarden *(pas sortie)* | `ulaph` | Désir | 6 | 5 | Ultra-légendaire | 324 | 52.5 % | 16 % | 49.1 % | +2.9 | 5.0 | 100 % | 5.8 |
| Nyx X Circé *(pas sortie)* | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | 293 | 54.3 % | 16 % | 60.4 % | +4.7 | 3.0 | 100 % | 5.9 |
| Circé *(pas sortie)* | `circe` | Désir | 5 | 3 | Épique | 1150 | 44.7 % | 21 % | 43.6 % | -4.9 | 3.1 | 93 % | 5.2 |
| Ishtar | `ishtar` | Désir | 4 | 3 | Épique | 1196 | 45.0 % | 21 % | 38.9 % | -4.6 | 3.1 | 93 % | 4.9 |
| Le Carillonneur de la Cathédrale *(pas sortie)* | `carillonneur` | Helvara | 3 | 1 | Légendaire | 1601 | 51.1 % | 22 % | 55.6 % | +1.5 | 4.0 | 94 % | 4.5 |
| Hel, Reine du Réveillon *(pas sortie)* | `hel_r` | Primordial | 5 | 2 | Épique | 392 | 52.3 % | 22 % | 63.5 % | +2.7 | 2.2 | 94 % | 5.3 |
| Hel *(pas sortie)* | `hel` | Primordial | 6 | 5 | Légendaire | 877 | 43.7 % | 24 % | 43.9 % | -5.9 | 5.2 | 97 % | 5.9 |
| La Ficelle Dévorante | `ficelle` | Helvara | 5 | 4 | Épique | 1198 | 48.7 % | 27 % | 49.2 % | -0.9 | 8.0 | 94 % | 5.2 |
| Sekhmet, Lionne de l'Hiver *(pas sortie)* | `sekhmet_n` | Jugement | 5 | 4 | Épique | 478 | 46.0 % | 28 % | 40.3 % | -3.6 | 3.9 | 94 % | 5.3 |
| Loviatar *(pas sortie)* | `loviatar` | Primordial | 4 | 3 | Épique | 951 | 45.0 % | 28 % | 38.7 % | -4.6 | 3.1 | 93 % | 4.7 |
| Freya | `freya` | Désir | 5 | 5 | Rare | 499 | 50.9 % | 29 % | 44.4 % | +1.3 | 5.6 | 94 % | 5.3 |
| La Nuée de Miroirs | `nuee` | Primordial | 4 | 3 | Rare | 747 | 47.0 % | 29 % | 41.0 % | -2.6 | 4.6 | 97 % | 5.1 |
| Apsu | `apsu` | Primordial | 6 | 8 | Légendaire | 899 | 62.8 % | 30 % | 64.2 % | +13.2 | 10.1 | 99 % | 5.9 |
| Jordan, le Créateur | `jordan` | Primordial | 1 | -1 | Épique | 1996 | 48.6 % | 30 % | 45.9 % | -1.0 | -0.4 | 86 % | 3.8 |
| Lilith | `lilith` | Désir | 6 | 5 | Légendaire | 1243 | 51.2 % | 30 % | 66.9 % | +1.6 | 5.2 | 98 % | 5.8 |
| Inanna | `inanna` | Jugement | 5 | 5 | Épique | 530 | 47.4 % | 30 % | 37.9 % | -2.2 | 5.4 | 89 % | 5.2 |
| Set *(pas sortie)* | `set` | Primordial | 5 | 4 | Épique | 453 | 55.4 % | 31 % | 54.6 % | +5.8 | 4.0 | 96 % | 5.4 |
| Apsu, Veillée des Chaînes *(pas sortie)* | `apsu_n` | Primordial | 6 | 7 | Légendaire | 349 | 50.1 % | 31 % | 51.4 % | +0.5 | 7.4 | 96 % | 5.9 |
| Pele X Jordan du Réveillon *(pas sortie)* | `ulpele_r` | Primordial | 6 | 4 | Ultra-légendaire | 312 | 41.0 % | 31 % | 38.8 % | -8.6 | 3.8 | 99 % | 5.9 |
| La Doyenne | `doyenne` | Helvara | 5 | 4 | Commune | 457 | 46.4 % | 32 % | 44.9 % | -3.2 | 4.1 | 93 % | 5.3 |
| Les Costumes | `costumes` | Helvara | 4 | 3 | Commune | 1015 | 46.5 % | 32 % | 39.5 % | -3.1 | 4.8 | 92 % | 4.9 |
| Styx *(pas sortie)* | `styx` | Jugement | 4 | 3 | Légendaire | 1729 | 48.5 % | 33 % | 47.2 % | -1.1 | 2.9 | 91 % | 4.6 |
| Odin *(pas sortie)* | `odin` | Jugement | 4 | 4 | Légendaire | 1677 | 49.6 % | 33 % | 45.4 % | +0.0 | 3.9 | 92 % | 4.7 |
| Nyx X Oshun *(pas sortie)* | `uloshun` | Primordial | 6 | 4 | Ultra-légendaire | 325 | 56.6 % | 33 % | 68.2 % | +7.0 | 3.9 | 98 % | 5.9 |
| Balor *(pas sortie)* | `balor` | Jugement | 6 | 5 | Rare | 831 | 55.0 % | 34 % | 62.1 % | +5.4 | 5.2 | 99 % | 5.8 |
| Hécate | `hecate` | Jugement | 3 | 2 | Commune | 872 | 48.3 % | 34 % | 47.3 % | -1.3 | 2.1 | 89 % | 4.4 |
| Nyx | `nyx` | Primordial | 6 | 5 | Légendaire | 1193 | 54.1 % | 35 % | 59.3 % | +4.5 | 5.1 | 98 % | 5.8 |
| Médée *(pas sortie)* | `medee` | Jugement | 4 | 4 | Épique | 766 | 48.3 % | 35 % | 48.1 % | -1.3 | 3.9 | 91 % | 4.7 |
| Pandore *(pas sortie)* | `pandore` | Désir | 3 | 0 | Épique | 2622 | 46.2 % | 35 % | 40.8 % | -3.4 | 5.0 | 95 % | 5.4 |
| Calypso X Jordan *(pas sortie)* | `ulcal` | Désir | 5 | 4 | Ultra-légendaire | 297 | 55.9 % | 35 % | 64.8 % | +6.3 | 4.2 | 100 % | 5.3 |
| Sekhmet | `sekhmet` | Jugement | 5 | 6 | Rare | 499 | 51.7 % | 36 % | 54.4 % | +2.1 | 6.1 | 89 % | 5.1 |
| Tlazolteotl | `tlazol` | Désir | 3 | 2 | Rare | 903 | 45.6 % | 37 % | 40.8 % | -4.0 | 2.7 | 92 % | 4.5 |
| Vasseur | `vasseur` | Helvara | 3 | 2 | Commune | 847 | 48.4 % | 37 % | 47.3 % | -1.2 | 4.4 | 96 % | 4.4 |
| Izanami *(pas sortie)* | `izanami` | Primordial | 3 | 3 | Épique | 1513 | 45.6 % | 37 % | 38.6 % | -4.0 | 3.1 | 90 % | 4.1 |
| Dante *(pas sortie)* | `dante` | Primordial | 4 | 4 | Rare | 697 | 44.8 % | 37 % | 41.9 % | -4.8 | 4.1 | 89 % | 4.7 |
| Baldur *(pas sortie)* | `baldur` | Jugement | 4 | 4 | Épique | 1090 | 47.9 % | 37 % | 49.5 % | -1.7 | 4.1 | 95 % | 4.7 |
| Nike *(pas sortie)* | `nike` | Jugement | 3 | 1 | Ultra-légendaire | 1050 | 48.1 % | 39 % | 44.6 % | -1.5 | 4.2 | 97 % | 5.5 |
| Nergal, Fossoyeur d'Halloween | `nergal_h` | Primordial | 5 | 4 | Épique | 465 | 48.6 % | 39 % | 51.1 % | -1.0 | 7.6 | 96 % | 5.4 |
| Qetesh X Jordan *(pas sortie)* | `ulqetjor` | Désir | 6 | 4 | Ultra-légendaire | 296 | 48.0 % | 40 % | 38.5 % | -1.6 | 4.0 | 97 % | 5.9 |
| Oya | `oya` | Jugement | 5 | 4 | Épique | 476 | 49.2 % | 40 % | 47.1 % | -0.4 | 4.0 | 96 % | 5.3 |
| Pele | `pele` | Primordial | 5 | 6 | Rare | 418 | 52.2 % | 41 % | 54.4 % | +2.6 | 6.0 | 98 % | 5.2 |
| Bastet | `bastet` | Désir | 5 | 4 | Rare | 488 | 52.0 % | 41 % | 46.8 % | +2.4 | 4.0 | 96 % | 5.3 |
| Ereshkigal | `ereshkigal` | Primordial | 6 | 7 | Légendaire | 591 | 53.1 % | 42 % | 58.9 % | +3.5 | 7.0 | 97 % | 5.8 |
| Vritra | `vritra` | Primordial | 5 | 5 | Légendaire | 1116 | 44.2 % | 42 % | 41.3 % | -5.4 | 5.1 | 97 % | 5.2 |
| Le Seigneur de la marée noire *(pas sortie)* | `maree` | Primordial | 6 | 8 | Légendaire | 633 | 53.9 % | 42 % | 63.6 % | +4.3 | 8.1 | 100 % | 5.9 |
| Hathor | `hathor` | Désir | 4 | 3 | Rare | 805 | 51.6 % | 42 % | 51.3 % | +2.0 | 3.1 | 94 % | 4.8 |
| Anat | `anat` | Désir | 4 | 4 | Épique | 1130 | 46.3 % | 42 % | 42.0 % | -3.3 | 5.6 | 93 % | 4.8 |
| Perséphone | `persephone` | Jugement | 3 | 3 | Rare | 1443 | 47.0 % | 44 % | 45.2 % | -2.6 | 2.9 | 92 % | 4.3 |
| Hadès *(pas sortie)* | `hades` | Primordial | 4 | 4 | Légendaire | 1731 | 46.2 % | 45 % | 42.8 % | -3.4 | 3.9 | 91 % | 4.6 |
| Éos de Nouvel An *(pas sortie)* | `eos_r` | Jugement | 2 | 1 | Épique | 887 | 45.8 % | 46 % | 47.3 % | -3.8 | 1.4 | 89 % | 3.8 |
| Jordan X Izzy | `ulji` | Désir | 6 | 6 | Ultra-légendaire | 310 | 48.7 % | 47 % | 57.2 % | -0.9 | 6.0 | 99 % | 5.9 |
| Qetesh du Nouvel An *(pas sortie)* | `qetesh_r` | Désir | 5 | 3 | Épique | 698 | 61.7 % | 47 % | 66.7 % | +12.1 | 3.3 | 97 % | 4.8 |
| La Mère de Cendre | `mere` | Primordial | 5 | 4 | Rare | 479 | 48.4 % | 47 % | 44.9 % | -1.2 | 3.8 | 96 % | 5.0 |
| Nyx, Guerrière d'Halloween | `nyx_h` | Primordial | 5 | 4 | Épique | 417 | 54.2 % | 48 % | 57.3 % | +4.6 | 4.1 | 96 % | 5.2 |
| Pele du Réveillon *(pas sortie)* | `pele_r` | Primordial | 5 | 3 | Épique | 748 | 47.6 % | 48 % | 49.0 % | -2.0 | 3.3 | 96 % | 5.2 |
| Thor *(pas sortie)* | `thor` | Primordial | 4 | 3 | Épique | 960 | 47.7 % | 48 % | 46.9 % | -1.9 | 3.1 | 92 % | 4.3 |
| Izzy, Lune de Sang | `izzy_h` | Désir | 3 | 0 | Légendaire | 769 | 50.3 % | 48 % | 52.8 % | +0.7 | 2.4 | 92 % | 4.4 |
| Qetesh X Jordan du Nouvel An *(pas sortie)* | `ulqetjor_r` | Désir | 6 | 4 | Ultra-légendaire | 312 | 68.9 % | 48 % | 83.4 % | +19.3 | 3.8 | 99 % | 5.9 |
| Jordan, le Narrateur | `jordan_n` | Primordial | 1 | 0 | Épique | 1992 | 48.3 % | 50 % | 47.6 % | -1.3 | 0.4 | 87 % | 3.2 |

### Toutes les cartes simulées, par rareté puis par écart


#### Commune (21)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Le Troll | `troll` | Primordial | 5 | 9 | Commune | 439 | 54.2 % | 54 % | 56.3 % | +4.6 | 9.0 | 95 % | 5.1 |
| Veilleur du Sous-gare | `veilleur` | Helvara | 2 | 3 | Commune | 889 | 52.3 % | 72 % | 52.0 % | +2.7 | 3.3 | 86 % | 3.3 |
| Le Charognard du M2 | `charognard` | Helvara | 2 | 2 | Commune | 921 | 51.9 % | 73 % | 52.7 % | +2.3 | 3.9 | 93 % | 3.6 |
| Rémi | `remi` | Helvara | 2 | 1 | Commune | 881 | 51.8 % | 66 % | 52.0 % | +2.2 | 4.2 | 92 % | 3.9 |
| Le Bibliothécaire des Passages | `biblio` | Helvara | 1 | 2 | Commune | 954 | 51.3 % | 78 % | 51.1 % | +1.7 | 2.4 | 88 % | 2.9 |
| Le Funambule du Belvédère | `funambule` | Helvara | 2 | 2 | Commune | 901 | 51.1 % | 67 % | 49.8 % | +1.5 | 3.4 | 89 % | 3.1 |
| Dévote de Xochiquetzal | `devote` | Désir | 4 | 6 | Commune | 761 | 51.0 % | 63 % | 50.9 % | +1.4 | 5.9 | 91 % | 4.4 |
| Passante d'Ouchy | `passante` | Helvara | 1 | 2 | Commune | 968 | 50.2 % | 73 % | 49.6 % | +0.6 | 2.5 | 90 % | 2.8 |
| Sélène | `selene` | Jugement | 4 | 4 | Commune | 829 | 50.2 % | 65 % | 48.5 % | +0.6 | 6.8 | 93 % | 5.0 |
| Le Mendiant de la Riponne *(pas sortie)* | `mendiant` | Helvara | 0 | 2 | Commune | 760 | 49.9 % | 81 % | 49.8 % | +0.3 | 2.4 | 90 % | 2.9 |
| Maeve | `maeve` | Désir | 3 | 3 | Commune | 809 | 49.3 % | 71 % | 49.1 % | -0.3 | 5.1 | 91 % | 3.8 |
| Coursier du Flon | `coursier` | Helvara | 1 | 1 | Commune | 984 | 49.3 % | 70 % | 48.5 % | -0.3 | 1.6 | 86 % | 2.9 |
| Kitsune | `kitsune` | Désir | 1 | 1 | Commune | 932 | 48.7 % | 72 % | 48.1 % | -0.9 | 1.3 | 86 % | 2.7 |
| Rusalka | `rusalka` | Primordial | 2 | 2 | Commune | 905 | 48.6 % | 65 % | 46.0 % | -1.0 | 2.1 | 88 % | 3.7 |
| Vasseur | `vasseur` | Helvara | 3 | 2 | Commune | 847 | 48.4 % | 37 % | 47.3 % | -1.2 | 4.4 | 96 % | 4.4 |
| Hécate | `hecate` | Jugement | 3 | 2 | Commune | 872 | 48.3 % | 34 % | 47.3 % | -1.3 | 2.1 | 89 % | 4.4 |
| La Mouche de la Faille *(pas sortie)* | `mouche` | Primordial | 1 | 3 | Commune | 908 | 47.5 % | 75 % | 46.0 % | -2.1 | 3.0 | 86 % | 2.7 |
| Tefnut *(pas sortie)* | `tefnut` | Jugement | 2 | 2 | Commune | 992 | 47.2 % | 72 % | 45.7 % | -2.4 | 2.1 | 88 % | 3.7 |
| Les Costumes | `costumes` | Helvara | 4 | 3 | Commune | 1015 | 46.5 % | 32 % | 39.5 % | -3.1 | 4.8 | 92 % | 4.9 |
| La Doyenne | `doyenne` | Helvara | 5 | 4 | Commune | 457 | 46.4 % | 32 % | 44.9 % | -3.2 | 4.1 | 93 % | 5.3 |
| Le Boucher de la Riponne *(pas sortie)* | `boucher` | Helvara | 1 | 3 | Commune | 972 | 46.2 % | 69 % | 47.1 % | -3.4 | 3.2 | 88 % | 2.6 |

#### Rare (46)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Balor *(pas sortie)* | `balor` | Jugement | 6 | 5 | Rare | 831 | 55.0 % | 34 % | 62.1 % | +5.4 | 5.2 | 99 % | 5.8 |
| La Messagère d'Hécate *(pas sortie)* | `messagere` | Helvara | 2 | 2 | Rare | 1149 | 54.0 % | 62 % | 57.0 % | +4.4 | 4.9 | 89 % | 3.6 |
| Ishara | `ishara` | Helvara | 2 | 2 | Rare | 1193 | 53.2 % | 71 % | 53.1 % | +3.6 | 2.4 | 91 % | 3.7 |
| Durga | `durga` | Jugement | 5 | 5 | Rare | 508 | 53.0 % | 57 % | 57.8 % | +3.4 | 7.6 | 96 % | 5.2 |
| Pele | `pele` | Primordial | 5 | 6 | Rare | 418 | 52.2 % | 41 % | 54.4 % | +2.6 | 6.0 | 98 % | 5.2 |
| Bastet | `bastet` | Désir | 5 | 4 | Rare | 488 | 52.0 % | 41 % | 46.8 % | +2.4 | 4.0 | 96 % | 5.3 |
| Éris | `eris` | Désir | 3 | 3 | Rare | 909 | 52.0 % | 59 % | 49.2 % | +2.4 | 3.2 | 89 % | 4.3 |
| Oshun *(pas sortie)* | `oshun` | Désir | 4 | 3 | Rare | 1050 | 51.7 % | 60 % | 51.0 % | +2.1 | 3.1 | 94 % | 4.7 |
| Sekhmet | `sekhmet` | Jugement | 5 | 6 | Rare | 499 | 51.7 % | 36 % | 54.4 % | +2.1 | 6.1 | 89 % | 5.1 |
| Arès | `ares` | Primordial | 4 | 3 | Rare | 710 | 51.7 % | 55 % | 53.5 % | +2.1 | 4.8 | 94 % | 4.8 |
| Hathor | `hathor` | Désir | 4 | 3 | Rare | 805 | 51.6 % | 42 % | 51.3 % | +2.0 | 3.1 | 94 % | 4.8 |
| Colosse du Léman | `colosse` | Helvara | 5 | 8 | Rare | 465 | 51.2 % | 58 % | 55.4 % | +1.6 | 8.3 | 95 % | 5.2 |
| L'Écorché Silencieux | `ecorche` | Helvara | 3 | 3 | Rare | 1212 | 51.0 % | 68 % | 50.1 % | +1.4 | 3.6 | 89 % | 4.1 |
| Freya | `freya` | Désir | 5 | 5 | Rare | 499 | 50.9 % | 29 % | 44.4 % | +1.3 | 5.6 | 94 % | 5.3 |
| Céleste | `celeste` | Helvara | 3 | 3 | Rare | 1209 | 50.9 % | 72 % | 50.9 % | +1.3 | 5.7 | 89 % | 3.7 |
| Le Tatoueur de Chauderon *(pas sortie)* | `tatoueur` | Helvara | 2 | 2 | Rare | 1210 | 50.3 % | 72 % | 48.3 % | +0.7 | 2.3 | 89 % | 3.5 |
| Le Comptable du Grand-Pont | `comptable` | Helvara | 1 | 1 | Rare | 1554 | 50.0 % | 75 % | 50.3 % | +0.4 | 2.6 | 87 % | 3.0 |
| Skadi | `skadi` | Jugement | 3 | 3 | Rare | 1018 | 49.9 % | 70 % | 50.5 % | +0.3 | 3.0 | 87 % | 3.9 |
| Éos | `eos` | Jugement | 2 | 2 | Rare | 1466 | 49.9 % | 57 % | 48.8 % | +0.3 | 2.1 | 90 % | 3.5 |
| Andraste *(pas sortie)* | `andraste` | Désir | 4 | 3 | Rare | 769 | 49.8 % | 59 % | 51.5 % | +0.2 | 6.7 | 95 % | 4.6 |
| Athéna *(pas sortie)* | `athena` | Jugement | 2 | 2 | Rare | 1401 | 49.6 % | 61 % | 48.2 % | +0.0 | 2.1 | 90 % | 3.5 |
| Bia *(pas sortie)* | `bia` | Jugement | 3 | 3 | Rare | 1765 | 49.6 % | 61 % | 47.4 % | -0.0 | 3.8 | 91 % | 4.4 |
| Félix | `felix` | Helvara | 2 | 3 | Rare | 1181 | 49.5 % | 71 % | 49.6 % | -0.1 | 3.3 | 89 % | 3.4 |
| Týr | `tyr` | Jugement | 2 | 3 | Rare | 1339 | 49.4 % | 71 % | 49.1 % | -0.2 | 2.9 | 91 % | 3.5 |
| Freyr | `freyr` | Désir | 3 | 3 | Rare | 876 | 49.3 % | 53 % | 47.1 % | -0.3 | 3.3 | 91 % | 4.2 |
| Izzy | `izzy` | Désir | 2 | 1 | Rare | 1443 | 49.3 % | 69 % | 49.8 % | -0.3 | 3.6 | 89 % | 3.8 |
| Artémis | `artemis` | Jugement | 3 | 3 | Rare | 1375 | 49.2 % | 70 % | 49.2 % | -0.4 | 3.1 | 91 % | 3.9 |
| Araignée de cristal | `araignee` | Primordial | 4 | 4 | Rare | 719 | 49.2 % | 55 % | 47.7 % | -0.4 | 3.8 | 94 % | 4.6 |
| Morrigan | `morrigan` | Jugement | 2 | 2 | Rare | 1322 | 49.1 % | 67 % | 48.4 % | -0.5 | 2.1 | 90 % | 3.2 |
| Le Relieur | `relieur` | Helvara | 2 | 2 | Rare | 1220 | 49.0 % | 64 % | 46.9 % | -0.6 | 2.4 | 89 % | 3.6 |
| Brigid *(pas sortie)* | `brigid` | Désir | 2 | 2 | Rare | 1128 | 48.8 % | 70 % | 50.4 % | -0.8 | 2.1 | 90 % | 3.5 |
| Melinoë | `melinoe` | Primordial | 2 | 2 | Rare | 1365 | 48.7 % | 77 % | 49.9 % | -0.9 | 4.4 | 92 % | 3.1 |
| La Mère de Cendre | `mere` | Primordial | 5 | 4 | Rare | 479 | 48.4 % | 47 % | 44.9 % | -1.2 | 3.8 | 96 % | 5.0 |
| Agent de Thot | `thot` | Jugement | 3 | 3 | Rare | 1168 | 48.4 % | 68 % | 48.2 % | -1.2 | 2.9 | 91 % | 4.0 |
| Idunn | `idunn` | Désir | 2 | 2 | Rare | 1156 | 48.2 % | 62 % | 47.8 % | -1.4 | 3.4 | 91 % | 3.6 |
| Le Sans-Voix *(pas sortie)* | `sansvoix` | Primordial | 2 | 4 | Rare | 1346 | 47.9 % | 73 % | 49.4 % | -1.7 | 3.9 | 92 % | 3.3 |
| Dionysos *(pas sortie)* | `dionysos` | Désir | 2 | 2 | Rare | 1217 | 47.7 % | 61 % | 44.4 % | -1.9 | 2.1 | 89 % | 3.6 |
| Ame-no-Uzume | `uzume` | Désir | 2 | 3 | Rare | 1139 | 47.6 % | 69 % | 46.4 % | -2.0 | 3.3 | 96 % | 3.4 |
| Hermès | `hermes` | Désir | 1 | 1 | Rare | 892 | 47.1 % | 61 % | 46.4 % | -2.5 | 1.2 | 86 % | 2.8 |
| La Nuée de Miroirs | `nuee` | Primordial | 4 | 3 | Rare | 747 | 47.0 % | 29 % | 41.0 % | -2.6 | 4.6 | 97 % | 5.1 |
| Perséphone | `persephone` | Jugement | 3 | 3 | Rare | 1443 | 47.0 % | 44 % | 45.2 % | -2.6 | 2.9 | 92 % | 4.3 |
| L'Esquille | `esquille` | Primordial | 3 | 1 | Rare | 842 | 45.7 % | 52 % | 44.0 % | -3.9 | 1.3 | 88 % | 4.3 |
| Tlazolteotl | `tlazol` | Désir | 3 | 2 | Rare | 903 | 45.6 % | 37 % | 40.8 % | -4.0 | 2.7 | 92 % | 4.5 |
| Konohanasakuya-Hime | `konohana` | Désir | 1 | 4 | Rare | 911 | 45.0 % | 77 % | 43.7 % | -4.6 | 1.0 | 86 % | 2.7 |
| Dante *(pas sortie)* | `dante` | Primordial | 4 | 4 | Rare | 697 | 44.8 % | 37 % | 41.9 % | -4.8 | 4.1 | 89 % | 4.7 |
| Eir | `eir` | Jugement | 4 | 3 | Rare | 849 | 42.3 % | 16 % | 31.4 % | -7.3 | 3.3 | 99 % | 4.9 |

#### Épique (48)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qetesh du Nouvel An *(pas sortie)* | `qetesh_r` | Désir | 5 | 3 | Épique | 698 | 61.7 % | 47 % | 66.7 % | +12.1 | 3.3 | 97 % | 4.8 |
| Yarden Weiss | `yarden` | Primordial | 5 | 6 | Épique | 1612 | 58.6 % | 59 % | 60.5 % | +9.0 | 8.5 | 95 % | 5.2 |
| Calypso, Reine des Glaces *(pas sortie)* | `calypso_n` | Désir | 5 | 3 | Épique | 403 | 57.3 % | 50 % | 57.6 % | +7.7 | 5.3 | 95 % | 5.3 |
| Set *(pas sortie)* | `set` | Primordial | 5 | 4 | Épique | 453 | 55.4 % | 31 % | 54.6 % | +5.8 | 4.0 | 96 % | 5.4 |
| Arès, Boucher d'Halloween | `ares_h` | Primordial | 5 | 4 | Épique | 451 | 54.8 % | 51 % | 61.1 % | +5.2 | 6.0 | 96 % | 5.3 |
| Nyx, Guerrière d'Halloween | `nyx_h` | Primordial | 5 | 4 | Épique | 417 | 54.2 % | 48 % | 57.3 % | +4.6 | 4.1 | 96 % | 5.2 |
| Aphrodite, Étoile de Noël *(pas sortie)* | `aphrodite_n` | Désir | 5 | 4 | Épique | 386 | 54.1 % | 60 % | 57.5 % | +4.5 | 4.0 | 94 % | 4.9 |
| Calypso *(pas sortie)* | `calypso` | Désir | 5 | 4 | Épique | 1126 | 53.8 % | 50 % | 56.3 % | +4.2 | 4.3 | 96 % | 5.2 |
| Ixchel | `ixchel` | Jugement | 4 | 4 | Épique | 865 | 53.6 % | 66 % | 55.0 % | +4.0 | 3.8 | 92 % | 4.3 |
| Qetesh *(pas sortie)* | `qetesh` | Désir | 4 | 2 | Épique | 1621 | 53.6 % | 61 % | 57.5 % | +4.0 | 2.4 | 93 % | 4.5 |
| Poséidon *(pas sortie)* | `poseidon` | Primordial | 4 | 3 | Épique | 908 | 52.4 % | 58 % | 54.5 % | +2.8 | 3.0 | 95 % | 4.3 |
| Hel, Reine du Réveillon *(pas sortie)* | `hel_r` | Primordial | 5 | 2 | Épique | 392 | 52.3 % | 22 % | 63.5 % | +2.7 | 2.2 | 94 % | 5.3 |
| Morrigan, Sorcière d'Halloween | `morrigan_h` | Jugement | 2 | 2 | Épique | 866 | 52.1 % | 59 % | 51.1 % | +2.5 | 2.2 | 90 % | 3.5 |
| Chernobog *(pas sortie)* | `chernobog` | Jugement | 4 | 4 | Épique | 887 | 51.9 % | 51 % | 52.3 % | +2.3 | 4.0 | 93 % | 4.7 |
| Nergal | `nergal` | Primordial | 5 | 4 | Épique | 719 | 51.5 % | 52 % | 50.8 % | +1.9 | 4.5 | 96 % | 5.2 |
| Susanoo *(pas sortie)* | `susanoo` | Jugement | 4 | 4 | Épique | 877 | 51.1 % | 57 % | 51.2 % | +1.5 | 3.8 | 90 % | 4.2 |
| Le Graffeur du Tunnel de la Borde *(pas sortie)* | `graffeur` | Helvara | 3 | 2 | Épique | 1604 | 50.4 % | 64 % | 51.5 % | +0.8 | 2.6 | 89 % | 3.7 |
| Heimdall *(pas sortie)* | `heimdall` | Jugement | 3 | 3 | Épique | 1595 | 50.3 % | 72 % | 50.1 % | +0.7 | 4.7 | 88 % | 3.9 |
| Lip Dentelle *(pas sortie)* | `lipdentelle` | Désir | 3 | 3 | Épique | 1511 | 49.6 % | 74 % | 49.8 % | +0.0 | 6.9 | 89 % | 3.7 |
| Scáthach *(pas sortie)* | `scathach` | Jugement | 4 | 3 | Épique | 869 | 49.5 % | 59 % | 47.7 % | -0.1 | 2.9 | 90 % | 4.3 |
| Le Chasseur d'échos *(pas sortie)* | `chasseur` | Primordial | 4 | 3 | Épique | 968 | 49.2 % | 59 % | 47.8 % | -0.4 | 3.0 | 92 % | 4.5 |
| Oya | `oya` | Jugement | 5 | 4 | Épique | 476 | 49.2 % | 40 % | 47.1 % | -0.4 | 4.0 | 96 % | 5.3 |
| Le Bourreau de la brèche *(pas sortie)* | `bourreau` | Jugement | 3 | 4 | Épique | 1588 | 49.1 % | 61 % | 45.8 % | -0.5 | 3.9 | 92 % | 4.1 |
| Dame Joanna | `joanna` | Helvara | 2 | 2 | Épique | 904 | 48.9 % | 73 % | 48.9 % | -0.7 | 2.5 | 91 % | 3.5 |
| Aphrodite *(pas sortie)* | `aphrodite` | Désir | 1 | 2 | Épique | 1905 | 48.8 % | 75 % | 49.0 % | -0.8 | 2.2 | 89 % | 3.4 |
| La Ficelle Dévorante | `ficelle` | Helvara | 5 | 4 | Épique | 1198 | 48.7 % | 27 % | 49.2 % | -0.9 | 8.0 | 94 % | 5.2 |
| Jordan, le Créateur | `jordan` | Primordial | 1 | -1 | Épique | 1996 | 48.6 % | 30 % | 45.9 % | -1.0 | -0.4 | 86 % | 3.8 |
| Nergal, Fossoyeur d'Halloween | `nergal_h` | Primordial | 5 | 4 | Épique | 465 | 48.6 % | 39 % | 51.1 % | -1.0 | 7.6 | 96 % | 5.4 |
| Amaterasu | `amaterasu` | Jugement | 5 | 4 | Épique | 529 | 48.6 % | 11 % | 34.5 % | -1.0 | 4.2 | 93 % | 5.4 |
| Jordan, le Narrateur | `jordan_n` | Primordial | 1 | 0 | Épique | 1992 | 48.3 % | 50 % | 47.6 % | -1.3 | 0.4 | 87 % | 3.2 |
| Médée *(pas sortie)* | `medee` | Jugement | 4 | 4 | Épique | 766 | 48.3 % | 35 % | 48.1 % | -1.3 | 3.9 | 91 % | 4.7 |
| Fange *(pas sortie)* | `fange` | Primordial | 3 | 3 | Épique | 1533 | 48.1 % | 56 % | 45.9 % | -1.5 | 4.6 | 91 % | 4.0 |
| Baldur *(pas sortie)* | `baldur` | Jugement | 4 | 4 | Épique | 1090 | 47.9 % | 37 % | 49.5 % | -1.7 | 4.1 | 95 % | 4.7 |
| Thor *(pas sortie)* | `thor` | Primordial | 4 | 3 | Épique | 960 | 47.7 % | 48 % | 46.9 % | -1.9 | 3.1 | 92 % | 4.3 |
| Pele du Réveillon *(pas sortie)* | `pele_r` | Primordial | 5 | 3 | Épique | 748 | 47.6 % | 48 % | 49.0 % | -2.0 | 3.3 | 96 % | 5.2 |
| Inanna | `inanna` | Jugement | 5 | 5 | Épique | 530 | 47.4 % | 30 % | 37.9 % | -2.2 | 5.4 | 89 % | 5.2 |
| Médée, Mariée Spectrale | `medee_h` | Jugement | 4 | 3 | Épique | 769 | 46.3 % | 13 % | 43.6 % | -3.3 | 3.1 | 96 % | 4.8 |
| Anat | `anat` | Désir | 4 | 4 | Épique | 1130 | 46.3 % | 42 % | 42.0 % | -3.3 | 5.6 | 93 % | 4.8 |
| Pandore *(pas sortie)* | `pandore` | Désir | 3 | 0 | Épique | 2622 | 46.2 % | 35 % | 40.8 % | -3.4 | 5.0 | 95 % | 5.4 |
| Sekhmet, Lionne de l'Hiver *(pas sortie)* | `sekhmet_n` | Jugement | 5 | 4 | Épique | 478 | 46.0 % | 28 % | 40.3 % | -3.6 | 3.9 | 94 % | 5.3 |
| Psyché | `psyche` | Désir | 4 | 3 | Épique | 1139 | 45.9 % | 56 % | 43.1 % | -3.7 | 3.7 | 88 % | 4.5 |
| Éos de Nouvel An *(pas sortie)* | `eos_r` | Jugement | 2 | 1 | Épique | 887 | 45.8 % | 46 % | 47.3 % | -3.8 | 1.4 | 89 % | 3.8 |
| Izanami *(pas sortie)* | `izanami` | Primordial | 3 | 3 | Épique | 1513 | 45.6 % | 37 % | 38.6 % | -4.0 | 3.1 | 90 % | 4.1 |
| Loki *(pas sortie)* | `loki` | Désir | 3 | 3 | Épique | 1545 | 45.4 % | 51 % | 39.6 % | -4.2 | 3.1 | 91 % | 4.2 |
| Cronos *(pas sortie)* | `cronos` | Primordial | 3 | 3 | Épique | 1530 | 45.2 % | 52 % | 39.3 % | -4.4 | 3.6 | 93 % | 3.9 |
| Loviatar *(pas sortie)* | `loviatar` | Primordial | 4 | 3 | Épique | 951 | 45.0 % | 28 % | 38.7 % | -4.6 | 3.1 | 93 % | 4.7 |
| Ishtar | `ishtar` | Désir | 4 | 3 | Épique | 1196 | 45.0 % | 21 % | 38.9 % | -4.6 | 3.1 | 93 % | 4.9 |
| Circé *(pas sortie)* | `circe` | Désir | 5 | 3 | Épique | 1150 | 44.7 % | 21 % | 43.6 % | -4.9 | 3.1 | 93 % | 5.2 |

#### Légendaire (19)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Apsu | `apsu` | Primordial | 6 | 8 | Légendaire | 899 | 62.8 % | 30 % | 64.2 % | +13.2 | 10.1 | 99 % | 5.9 |
| Nemesis *(pas sortie)* | `nemesis` | Jugement | 5 | -5 | Légendaire | 1117 | 55.4 % | 59 % | 61.7 % | +5.8 | -4.9 | 95 % | 4.9 |
| Nyx | `nyx` | Primordial | 6 | 5 | Légendaire | 1193 | 54.1 % | 35 % | 59.3 % | +4.5 | 5.1 | 98 % | 5.8 |
| Le Seigneur de la marée noire *(pas sortie)* | `maree` | Primordial | 6 | 8 | Légendaire | 633 | 53.9 % | 42 % | 63.6 % | +4.3 | 8.1 | 100 % | 5.9 |
| Ereshkigal | `ereshkigal` | Primordial | 6 | 7 | Légendaire | 591 | 53.1 % | 42 % | 58.9 % | +3.5 | 7.0 | 97 % | 5.8 |
| La Voleuse du Flon *(pas sortie)* | `voleuse` | Helvara | 2 | 2 | Légendaire | 1766 | 51.8 % | 65 % | 49.9 % | +2.2 | 2.4 | 89 % | 3.6 |
| Lilith | `lilith` | Désir | 6 | 5 | Légendaire | 1243 | 51.2 % | 30 % | 66.9 % | +1.6 | 5.2 | 98 % | 5.8 |
| Le Carillonneur de la Cathédrale *(pas sortie)* | `carillonneur` | Helvara | 3 | 1 | Légendaire | 1601 | 51.1 % | 22 % | 55.6 % | +1.5 | 4.0 | 94 % | 4.5 |
| Izzy, Lune de Sang | `izzy_h` | Désir | 3 | 0 | Légendaire | 769 | 50.3 % | 48 % | 52.8 % | +0.7 | 2.4 | 92 % | 4.4 |
| Apsu, Veillée des Chaînes *(pas sortie)* | `apsu_n` | Primordial | 6 | 7 | Légendaire | 349 | 50.1 % | 31 % | 51.4 % | +0.5 | 7.4 | 96 % | 5.9 |
| Odin *(pas sortie)* | `odin` | Jugement | 4 | 4 | Légendaire | 1677 | 49.6 % | 33 % | 45.4 % | +0.0 | 3.9 | 92 % | 4.7 |
| Styx *(pas sortie)* | `styx` | Jugement | 4 | 3 | Légendaire | 1729 | 48.5 % | 33 % | 47.2 % | -1.1 | 2.9 | 91 % | 4.6 |
| Prométhée *(pas sortie)* | `promethee` | Primordial | 1 | 1 | Légendaire | 2895 | 48.3 % | 68 % | 47.4 % | -1.3 | 1.2 | 88 % | 2.8 |
| Anubis *(pas sortie)* | `anubis` | Jugement | 5 | 4 | Légendaire | 923 | 48.2 % | 61 % | 49.7 % | -1.4 | 6.3 | 94 % | 5.0 |
| Mohini | `mohini` | Désir | 1 | 1 | Légendaire | 1878 | 47.5 % | 68 % | 46.7 % | -2.1 | 1.2 | 88 % | 3.3 |
| Yarden, Dragonification partielle | `yarden_d` | Primordial | 6 | 3 | Légendaire | 356 | 47.5 % | 11 % | 30.0 % | -2.1 | 6.8 | 98 % | 5.9 |
| Hadès *(pas sortie)* | `hades` | Primordial | 4 | 4 | Légendaire | 1731 | 46.2 % | 45 % | 42.8 % | -3.4 | 3.9 | 91 % | 4.6 |
| Vritra | `vritra` | Primordial | 5 | 5 | Légendaire | 1116 | 44.2 % | 42 % | 41.3 % | -5.4 | 5.1 | 97 % | 5.2 |
| Hel *(pas sortie)* | `hel` | Primordial | 6 | 5 | Légendaire | 877 | 43.7 % | 24 % | 43.9 % | -5.9 | 5.2 | 97 % | 5.9 |

#### Ultra-légendaire (13)

| Carte | id | Faction | Coût | Puiss. | Rareté | Decks | Victoire (deck) | Pose | Victoire (posée) | Écart | Puiss. fin | Survie | Tour |
|---|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qetesh X Jordan du Nouvel An *(pas sortie)* | `ulqetjor_r` | Désir | 6 | 4 | Ultra-légendaire | 312 | 68.9 % | 48 % | 83.4 % | +19.3 | 3.8 | 99 % | 5.9 |
| Yarden X Apsu | `ulya` | Primordial | 9 | 12 | Ultra-légendaire | 570 | 68.2 % | 63 % | 72.9 % | +18.6 | 16.0 | 96 % | 4.8 |
| Nyx X Oshun *(pas sortie)* | `uloshun` | Primordial | 6 | 4 | Ultra-légendaire | 325 | 56.6 % | 33 % | 68.2 % | +7.0 | 3.9 | 98 % | 5.9 |
| Qetesh X Yarden *(pas sortie)* | `ulqetyar` | Désir | 6 | 3 | Ultra-légendaire | 296 | 56.1 % | 8 % | 48.0 % | +6.5 | 6.6 | 100 % | 6.0 |
| Calypso X Jordan *(pas sortie)* | `ulcal` | Désir | 5 | 4 | Ultra-légendaire | 297 | 55.9 % | 35 % | 64.8 % | +6.3 | 4.2 | 100 % | 5.3 |
| Nyx X Circé *(pas sortie)* | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | 293 | 54.3 % | 16 % | 60.4 % | +4.7 | 3.0 | 100 % | 5.9 |
| Nemesis X Jordan *(pas sortie)* | `ulnem` | Jugement | 6 | 2 | Ultra-légendaire | 299 | 53.8 % | 13 % | 46.2 % | +4.2 | 1.9 | 100 % | 5.9 |
| Aphrodite X Yarden *(pas sortie)* | `ulaph` | Désir | 6 | 5 | Ultra-légendaire | 324 | 52.5 % | 16 % | 49.1 % | +2.9 | 5.0 | 100 % | 5.8 |
| Jordan X Izzy | `ulji` | Désir | 6 | 6 | Ultra-légendaire | 310 | 48.7 % | 47 % | 57.2 % | -0.9 | 6.0 | 99 % | 5.9 |
| Nike *(pas sortie)* | `nike` | Jugement | 3 | 1 | Ultra-légendaire | 1050 | 48.1 % | 39 % | 44.6 % | -1.5 | 4.2 | 97 % | 5.5 |
| Qetesh X Jordan *(pas sortie)* | `ulqetjor` | Désir | 6 | 4 | Ultra-légendaire | 296 | 48.0 % | 40 % | 38.5 % | -1.6 | 4.0 | 97 % | 5.9 |
| Hel X Baldur *(pas sortie)* | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | 274 | 43.1 % | 12 % | 65.6 % | -6.5 | 3.1 | 100 % | 6.0 |
| Pele X Jordan du Réveillon *(pas sortie)* | `ulpele_r` | Primordial | 6 | 4 | Ultra-légendaire | 312 | 41.0 % | 31 % | 38.8 % | -8.6 | 3.8 | 99 % | 5.9 |

### Victoire selon le coût et la rareté (cartes dans le deck, toutes cartes confondues)

| Coût | Cartes | Decks | Victoire (deck) | Pose |
|---|---:|---:|---:|---:|
| 0 | 1 | 760 | 49.9 % | 81 % |
| 1 | 14 | 19741 | 48.4 % | 65 % |
| 2 | 26 | 30187 | 49.7 % | 67 % |
| 3 | 26 | 33709 | 48.5 % | 54 % |
| 4 | 29 | 29084 | 48.7 % | 45 % |
| 5 | 31 | 19936 | 51.5 % | 43 % |
| 6 | 19 | 10013 | 52.7 % | 30 % |
| 9 | 1 | 570 | 68.2 % | 63 % |

| Rareté | Cartes | Decks | Victoire (deck) | Pose |
|---|---:|---:|---:|---:|
| Commune | 21 | 17996 | 49.4 % | 64 % |
| Rare | 46 | 46885 | 49.4 % | 60 % |
| Épique | 48 | 50818 | 49.3 % | 49 % |
| Légendaire | 19 | 23343 | 50.0 % | 45 % |
| Ultra-légendaire | 13 | 4958 | 53.5 % | 34 % |

| Faction | Cartes | Decks | Victoire (deck) | Pose |
|---|---:|---:|---:|---:|
| Helvara | 26 | 28015 | 50.3 % | 62 % |
| Primordial | 44 | 39597 | 49.5 % | 49 % |
| Désir | 40 | 38844 | 49.3 % | 54 % |
| Jugement | 37 | 37544 | 49.4 % | 51 % |

## 4. Cartes pas encore sorties (136)

Date de sortie postérieure au 2026-10-12, y compris les cartes sans date (2099). **Coût, puissance, rareté, faction et effet sont PROVISOIRES** (posés sans réflexion, à retravailler). Les cartes sans effet sont des places réservées.

| Carte | id | Faction | Coût | Puiss. | Rareté | Effet | Sortie prévue | Annonce |
|---|---|---|---:|---:|---|---|---|---|
| Le Mendiant de la Riponne | `mendiant` | Helvara | 0 | 2 | Commune | Révélation : défausse une carte au hasard de ta main. Nourrit Rémi. | 2026-11-01 | 2026-10-27 |
| Aphrodite | `aphrodite` | Désir | 1 | 2 | Épique | Révélation : rejoue la Révélation de la dernière carte que tu as révélée ce tour, où qu'elle soit. | 2026-11-01 | 2026-10-27 |
| La Mouche de la Faille | `mouche` | Primordial | 1 | 3 | Commune | Continu : −1 à tes autres cartes ici. | 2026-11-01 | 2026-10-27 |
| Brigid | `brigid` | Désir | 2 | 2 | Rare | Révélation : la prochaine carte que tu révèles gagne +3. | 2026-11-01 | 2026-10-27 |
| La Messagère d'Hécate | `messagere` | Helvara | 2 | 2 | Rare | Continu : à la fin de chaque tour, si tu ne mènes pas ici, +2 (6 au maximum). | 2026-11-01 | 2026-10-27 |
| La Voleuse du Flon | `voleuse` | Helvara | 2 | 2 | Légendaire | Révélation : ton adversaire défausse une carte au hasard de sa main. | 2026-11-01 | 2026-10-27 |
| Le Sans-Voix | `sansvoix` | Primordial | 2 | 4 | Rare | Révélation : ton adversaire ne peut pas jouer ici au prochain tour. | 2026-11-01 | 2026-10-27 |
| Tefnut | `tefnut` | Jugement | 2 | 2 | Commune | Révélation : +1 à tes autres cartes ici. | 2026-11-01 | 2026-10-27 |
| Fange | `fange` | Primordial | 3 | 3 | Épique | Continu : +1 par carte défaussée pendant la partie, des deux côtés. | 2026-11-01 | 2026-10-27 |
| Le Bourreau de la brèche | `bourreau` | Jugement | 3 | 4 | Épique | Révélation : condamne une case adverse ici jusqu'à la fin de la partie. | 2026-11-01 | 2026-10-27 |
| Lip Dentelle | `lipdentelle` | Désir | 3 | 3 | Épique | Révélation : défausse la carte la plus chère de ta main et gagne sa puissance. | 2026-11-01 | 2026-10-27 |
| Andraste | `andraste` | Désir | 4 | 3 | Rare | Révélation : +2 par carte adverse ici. | 2026-11-01 | 2026-10-27 |
| Chernobog | `chernobog` | Jugement | 4 | 4 | Épique | Continu : les cartes adverses ici ne peuvent pas dépasser leur puissance de base. | 2026-11-01 | 2026-10-27 |
| Dante | `dante` | Primordial | 4 | 4 | Rare | Continu : chaque fois qu'une carte est détruite ici, des deux côtés, +1. | 2026-11-01 | 2026-10-27 |
| Le Chasseur d'échos | `chasseur` | Primordial | 4 | 3 | Épique | Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet). | 2026-11-01 | 2026-10-27 |
| Médée | `medee` | Jugement | 4 | 4 | Épique | Continu : la prochaine carte adverse jouée ici perd 2. Si Hécate est de ton côté, les deux prochaines. | 2026-11-01 | 2026-10-27 |
| Susanoo | `susanoo` | Jugement | 4 | 4 | Épique | Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3. +2 si Amaterasu est de ton côté. | 2026-11-01 | 2026-10-27 |
| Anubis | `anubis` | Jugement | 5 | 4 | Légendaire | Révélation : pèse les cœurs. Si l'adversaire mène ici, détruit sa carte la plus forte ici. Sinon, +4. | 2026-11-01 | 2026-10-27 |
| Calypso | `calypso` | Désir | 5 | 4 | Épique | Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu. | 2026-11-01 | 2026-10-27 |
| Calypso X Jordan | `ulcal` | Désir | 5 | 4 | Ultra-légendaire | Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2. Exige Calypso et Jordan dans le deck. | 2026-11-01 | 2026-10-27 |
| Nemesis | `nemesis` | Jugement | 5 | -5 | Légendaire | Ne peut pas être jouée au tour 6. Continu : dans ce lieu, c'est le joueur avec le moins de puissance qui gagne. Deux Nemesis s'annulent. | 2026-11-01 | 2026-10-27 |
| Set | `set` | Primordial | 5 | 4 | Épique | Révélation : la tempête de sable disperse jusqu'à 2 cartes adverses d'ici, au hasard, vers les autres lieux s'il y a de la place. Chacune perd 1. | 2026-11-01 | 2026-10-27 |
| Aphrodite X Yarden | `ulaph` | Désir | 6 | 5 | Ultra-légendaire | Révélation : rejoue la Révélation de chacune de tes autres cartes ici. Exige Aphrodite et Yarden Weiss dans le deck. | 2026-11-01 | 2026-10-27 |
| Balor | `balor` | Jugement | 6 | 5 | Rare | Révélation : −3 à deux cartes adverses différentes au hasard ici. | 2026-11-01 | 2026-10-27 |
| Le Seigneur de la marée noire | `maree` | Primordial | 6 | 8 | Légendaire | Révélation : détruit les cartes adverses de coût 2 ou moins ici. | 2026-11-01 | 2026-10-27 |
| Nemesis X Jordan | `ulnem` | Jugement | 6 | 2 | Ultra-légendaire | Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2. Exige Nemesis et Jordan dans le deck. | 2026-11-01 | 2026-10-27 |
| Prométhée | `promethee` | Primordial | 1 | 1 | Légendaire | Continu : l'énergie que tu ne dépenses pas est conservée au tour suivant (10 maximum). | 2026-11-15 | 2026-11-10 |
| Athéna | `athena` | Jugement | 2 | 2 | Rare | Révélation : prends en main la plus chère des 3 premières cartes de ton deck. | 2026-11-15 | 2026-11-10 |
| Bia | `bia` | Jugement | 3 | 3 | Rare | Révélation : l'adversaire perd son énergie conservée. S'il n'en avait pas, −1 à sa carte la plus forte ici. | 2026-11-15 | 2026-11-10 |
| Nike | `nike` | Jugement | 3 | 1 | Ultra-légendaire | Révélation : +2 pour chaque autre carte que tu as jouée avant elle ce tour. Exige 8 cartes Jugement dans le deck, Nike comprise. | 2026-11-15 | 2026-11-10 |
| Pandore | `pandore` | Désir | 3 | 0 | Épique | Révélation : dépense toute l'énergie qu'il te reste. +2 par énergie dépensée. | 2026-11-15 | 2026-11-10 |
| Styx | `styx` | Jugement | 4 | 3 | Légendaire | Continu : Nike et Bia ont +3 où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main. | 2026-11-15 | 2026-11-10 |
| Le Boucher de la Riponne | `boucher` | Helvara | 1 | 3 | Commune | Révélation : détruit ton autre carte la plus faible ici et pioche 1. | 2026-12-01 | 2026-11-26 |
| Dionysos | `dionysos` | Désir | 2 | 2 | Rare | Révélation : chaque joueur pioche 1 carte, puis défausse une carte au hasard. | 2026-12-01 | 2026-11-26 |
| Le Tatoueur de Chauderon | `tatoueur` | Helvara | 2 | 2 | Rare | Révélation : ta carte la plus forte ici gagne +1 et ne peut plus être affaiblie. | 2026-12-01 | 2026-11-26 |
| Heimdall | `heimdall` | Jugement | 3 | 3 | Épique | Révélation : tes autres cartes ici passent par le Bifröst vers un lieu où l'on ne peut plus jouer, s'il y a de la place. Sinon, +2. | 2026-12-01 | 2026-11-26 |
| Le Carillonneur de la Cathédrale | `carillonneur` | Helvara | 3 | 1 | Légendaire | Continu : à la fin de chaque tour, +1. Fin du tour 6 : le glas sonne, tes autres cartes ici gagnent la moitié de sa puissance (arrondie au-dessous). | 2026-12-01 | 2026-11-26 |
| Le Graffeur du Tunnel de la Borde | `graffeur` | Helvara | 3 | 2 | Épique | Continu : +2 de ton côté dans les lieux voisins. | 2026-12-01 | 2026-11-26 |
| Baldur | `baldur` | Jugement | 4 | 4 | Épique | Les effets adverses ne peuvent ni le détruire ni l'affaiblir, sauf ceux des cartes de coût 2 ou moins (le gui) et ceux où « rien ne le protège ». | 2026-12-01 | 2026-11-26 |
| Hadès | `hades` | Primordial | 4 | 4 | Légendaire | Révélation : ressuscite ici ta carte détruite la plus forte, sans Révélation. | 2026-12-01 | 2026-11-26 |
| Loviatar | `loviatar` | Primordial | 4 | 3 | Épique | Révélation : ressuscite ici ta dernière carte défaussée. Elle revient malade : sans Révélation et avec −2. | 2026-12-01 | 2026-11-26 |
| Odin | `odin` | Jugement | 4 | 4 | Légendaire | Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes. | 2026-12-01 | 2026-11-26 |
| Oshun | `oshun` | Désir | 4 | 3 | Rare | Révélation : +1 à toutes tes autres cartes, dans les 3 lieux. | 2026-12-01 | 2026-11-26 |
| Poséidon | `poseidon` | Primordial | 4 | 3 | Épique | Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici. | 2026-12-01 | 2026-11-26 |
| Qetesh | `qetesh` | Désir | 4 | 2 | Épique | Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté. | 2026-12-01 | 2026-11-26 |
| Scáthach | `scathach` | Jugement | 4 | 3 | Épique | Révélation : laisse une Ombre de Scáthach (puissance −3, sans effet) du côté adverse, dans un autre lieu. | 2026-12-01 | 2026-11-26 |
| Thor | `thor` | Primordial | 4 | 3 | Épique | Révélation : lance Mjölnir (jeton de puissance 2) dans un autre lieu. Si Mjölnir est détruit, Thor gagne +2. | 2026-12-01 | 2026-11-26 |
| Circé | `circe` | Désir | 5 | 3 | Épique | Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet). | 2026-12-01 | 2026-11-26 |
| Hel | `hel` | Primordial | 6 | 5 | Légendaire | Révélation : ressuscite ici jusqu'à 3 de tes cartes défaussées, sans Révélation. | 2026-12-01 | 2026-11-26 |
| Hel X Baldur | `ulhel` | Primordial | 6 | 3 | Ultra-légendaire | Révélation : ressuscite ici ta carte détruite ou défaussée la plus forte, avec sa Révélation. Elle ne peut plus être ni détruite ni affaiblie. Si c'est Baldur, +5. Exige Hel et Baldur dans le deck. | 2026-12-01 | 2026-11-26 |
| Nyx X Circé | `ulcirce` | Primordial | 6 | 3 | Ultra-légendaire | Révélation : les cartes adverses ici deviennent des Pourceaux. Exige Nyx et Circé dans le deck. | 2026-12-01 | 2026-11-26 |
| Nyx X Oshun | `uloshun` | Primordial | 6 | 4 | Ultra-légendaire | Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre lieu. Exige Nyx et Oshun dans le deck. | 2026-12-01 | 2026-11-26 |
| Qetesh X Jordan | `ulqetjor` | Désir | 6 | 4 | Ultra-légendaire | Continu : tes autres cartes ont +1, dans les 3 lieux. Exige Qetesh et Jordan dans le deck. | 2026-12-01 | 2026-11-26 |
| Qetesh X Yarden | `ulqetyar` | Désir | 6 | 3 | Ultra-légendaire | Continu : +3 par lieu où tu as à la fois une carte Désir et une carte Primordiale. Exige Qetesh et Yarden Weiss dans le deck. | 2026-12-01 | 2026-11-26 |
| Aphrodite, Étoile de Noël | `aphrodite_n` | Désir | 5 | 4 | Épique | Révélation : laisse un Reflet d'Aphrodite de puissance 3 dans chacun de tes autres lieux. | 2026-12-14 | 2026-12-09 |
| Calypso, Reine des Glaces | `calypso_n` | Désir | 5 | 3 | Épique | Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 par carte adverse ici. | 2026-12-14 | 2026-12-09 |
| Sekhmet, Lionne de l'Hiver | `sekhmet_n` | Jugement | 5 | 4 | Épique | Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées. | 2026-12-14 | 2026-12-09 |
| Apsu, Veillée des Chaînes | `apsu_n` | Primordial | 6 | 7 | Légendaire | Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 si Yarden Weiss est de ton côté. | 2026-12-14 | 2026-12-09 |
| Éos de Nouvel An | `eos_r` | Jugement | 2 | 1 | Épique | Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins. | 2026-12-31 | 2026-12-26 |
| Hel, Reine du Réveillon | `hel_r` | Primordial | 5 | 2 | Épique | Révélation : ressuscite ici ta carte défaussée la plus chère, avec sa Révélation. | 2026-12-31 | 2026-12-26 |
| Pele du Réveillon | `pele_r` | Primordial | 5 | 3 | Épique | Révélation : le feu d'artifice éclate dans les 3 lieux. −2 à la carte adverse la plus forte de chaque lieu. | 2026-12-31 | 2026-12-26 |
| Qetesh du Nouvel An | `qetesh_r` | Désir | 5 | 3 | Épique | Révélation : au début du tour suivant, charme la carte adverse la plus forte ici de coût 5 ou moins. | 2026-12-31 | 2026-12-26 |
| Pele X Jordan du Réveillon | `ulpele_r` | Primordial | 6 | 4 | Ultra-légendaire | Révélation : la lave inflige −1 à toutes les cartes adverses, dans les 3 lieux. Exige Pele et Jordan dans le deck. | 2026-12-31 | 2026-12-26 |
| Qetesh X Jordan du Nouvel An | `ulqetjor_r` | Désir | 6 | 4 | Ultra-légendaire | Révélation : charme la carte adverse la plus forte ici de coût 5 ou moins. Continu : tes autres cartes ici ont +2. Exige Qetesh du Nouvel An et Jordan dans le deck. | 2026-12-31 | 2026-12-26 |
| La Somnambule du Flon | `somnambule` | Helvara | 2 | 2 | Rare | *(pas d'effet)* | non fixée (2099) |  |
| Le Veilleur du Pont Bessières | `veilleur_pont` | Helvara | 2 | 3 | Rare | *(pas d'effet)* | non fixée (2099) |  |
| Áine | `aine` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Anahita | `anahita` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Apollon | `apollon` | Jugement | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Benzaiten | `benzaiten` | Désir | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Cernunnos | `cernunnos` | Primordial | 3 | 3 | Épique | *(pas d'effet)* | non fixée (2099) |  |
| Cronos | `cronos` | Primordial | 3 | 3 | Épique | Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 pour chacune. | non fixée (2099) |  |
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
| Izanami | `izanami` | Primordial | 3 | 3 | Épique | Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2. | non fixée (2099) |  |
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
| Ananké | `ananke` | Primordial | 6 | 1 | Ultra-légendaire | Fatalité : ne peut être ni détruite, ni déplacée, ni affaiblie. Révélation : sa puissance devient égale à la puissance totale adverse ici, +1. Exige 8 cartes Primordial dans le deck, Ananké comprise. | non fixée (2099) |  |
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
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main.
- Durga (5/5, Rare) : Révélation : détruit la carte adverse la plus forte ici si elle a 7 ou plus. Sinon, +3.
- Nyx, Guerrière d'Halloween (5/4, Épique) : Révélation : détruit les 2 cartes adverses les plus faibles ici.
- Sekhmet, Lionne de l'Hiver (5/4, Épique, pas sortie) : Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées.
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2. Exige Nemesis et Jordan dans le deck.
- Nyx (6/5, Légendaire) : Révélation : détruit la carte adverse la plus forte ici. Rien ne la protège.
- Nyx X Oshun (6/4, Ultra-légendaire, pas sortie) : Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre …

**Détruit ses propres cartes ou toutes les cartes d'un lieu** : 6 cartes (5 sorties, 1 pas encore)

- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- La Ficelle Dévorante (5/4, Épique) : Révélation : détruit tes autres cartes ici. +3 pour chacune.
- Le Troll (5/9, Commune) : Révélation : détruit ton autre carte la plus faible ici.
- Sekhmet (5/6, Rare) : Révélation : détruit toutes les autres cartes de puissance 2 ou moins ici, des deux côtés.
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.

**Affaiblit des cartes adverses (−N)** : 16 cartes (13 sorties, 3 pas encore)

- Týr (2/3, Rare) : Révélation : −1 à chaque carte adverse ici qui a 4 de puissance ou plus.
- Agent de Thot (3/3, Rare) : Révélation : −2 à la carte adverse la plus forte ici.
- Artémis (3/3, Rare) : Révélation : −2 à la carte adverse la plus faible ici. +2 si Izzy est de ton côté.
- L'Écorché Silencieux (3/3, Rare) : Ne peut pas être affaibli. Révélation : −2 à une carte adverse au hasard ici.
- Skadi (3/3, Rare) : Révélation : −3 à une carte adverse au hasard, dans un autre lieu.
- Araignée de cristal (4/4, Rare) : Révélation : affaiblit de 1 toutes les cartes adverses ici.
- Arès (4/3, Rare) : Révélation : −1 à chaque carte adverse ici, et +1 pour chacune.
- Hathor (4/3, Rare) : Continu : −1 aux cartes adverses ici.
- Ishtar (4/3, Épique) : Continu : à la fin des tours 1 à 5, −1 à la carte adverse la plus forte ici.
- Ixchel (4/4, Épique) : Révélation : −3 à la carte adverse la plus forte, dans n'importe quel lieu.
- Arès, Boucher d'Halloween (5/4, Épique) : Révélation : −2 à chaque carte adverse ici, et +1 pour chacune.
- Nergal (5/4, Épique) : Révélation : −1 à toutes les cartes adverses, dans les 3 lieux. Continu : +3 tant qu'Ereshkigal est de ton côté.
- Pele (5/6, Rare) : Révélation : la lave inflige −2 à toutes les autres cartes ici, des deux côtés.
- Pele du Réveillon (5/3, Épique, pas sortie) : Révélation : le feu d'artifice éclate dans les 3 lieux. −2 à la carte adverse la plus forte de chaque lieu.
- Balor (6/5, Rare, pas sortie) : Révélation : −3 à deux cartes adverses différentes au hasard ici.
- Pele X Jordan du Réveillon (6/4, Ultra-légendaire, pas sortie) : Révélation : la lave inflige −1 à toutes les cartes adverses, dans les 3 lieux. Exige Pele et Jordan dans le deck.

**Retire ou neutralise les effets d'une carte adverse** : 10 cartes (3 sorties, 7 pas encore)

- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Médée, Mariée Spectrale (4/3, Épique) : Révélation : empoisonne la carte adverse la plus forte ici : elle perd 1 à la fin de chaque tour, jusqu'à 0. Si Hécate est de ton côté, empoisonne …
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Scáthach (4/3, Épique, pas sortie) : Révélation : laisse une Ombre de Scáthach (puissance −3, sans effet) du côté adverse, dans un autre lieu.
- Calypso (5/4, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu.
- Calypso, Reine des Glaces (5/3, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 par carte adverse ici.
- Circé (5/3, Épique, pas sortie) : Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet).
- Oya (5/4, Épique) : Révélation : change la carte adverse la plus forte ici en carte de puissance 1, sans effet.
- Apsu (6/8, Légendaire) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. +6 si Yarden Weiss est de ton côté.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 si Yarde…

**Vole, charme ou fait changer de côté une carte adverse** : 4 cartes (2 sorties, 2 pas encore)

- La Nuée de Miroirs (4/3, Rare) : Révélation : copie la puissance de ta carte la plus forte ici.
- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Lilith (6/5, Légendaire) : Révélation : la carte adverse la plus forte ici (6 ou moins) passe de ton côté. Si ton côté est plein, elle est détruite.

**Déplace ou renvoie des cartes** : 6 cartes (2 sorties, 4 pas encore)

- Hermès (1/1, Rare) : Révélation : déplace ta carte la plus forte ici vers un lieu révélé qu'elle te ferait remporter.
- Éris (3/3, Rare) : Révélation : déplace la carte adverse la plus forte ici vers un autre lieu.
- Heimdall (3/3, Épique, pas sortie) : Révélation : tes autres cartes ici passent par le Bifröst vers un lieu où l'on ne peut plus jouer, s'il y a de la place. Sinon, +2.
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Susanoo (4/4, Épique, pas sortie) : Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3. +2 si Amaterasu est de ton côté.
- Set (5/4, Épique, pas sortie) : Révélation : la tempête de sable disperse jusqu'à 2 cartes adverses d'ici, au hasard, vers les autres lieux s'il y a de la place. Chacune perd 1.

**Bonus de puissance à elle-même (Révélation conditionnelle ou fixe)** : 25 cartes (15 sorties, 10 pas encore)

- Le Comptable du Grand-Pont (1/1, Rare) : Révélation : +1 par autre carte à toi ici.
- Brigid (2/2, Rare, pas sortie) : Révélation : la prochaine carte que tu révèles gagne +3.
- Izzy (2/1, Rare) : Révélation : prend la puissance de la carte adverse la plus forte ici, si elle est plus haute (6 au maximum).
- Le Charognard du M2 (2/2, Commune) : Révélation : +3 si une carte a été détruite ou défaussée pendant la partie.
- Le Funambule du Belvédère (2/2, Commune) : Révélation : +2 si c'est ta seule carte ici.
- Le Tatoueur de Chauderon (2/2, Rare, pas sortie) : Révélation : ta carte la plus forte ici gagne +1 et ne peut plus être affaiblie.
- Morrigan (2/2, Rare) : Continu : tu gagnes les égalités ici.
- Rémi (2/1, Commune) : Révélation : +2 par carte détruite ou défaussée depuis le début de la partie.
- Tefnut (2/2, Commune, pas sortie) : Révélation : +1 à tes autres cartes ici.
- Céleste (3/3, Rare) : Révélation : si tu ne mènes pas ici à son arrivée (sans compter Céleste), +3.
- Freyr (3/3, Rare) : Révélation : +1 énergie au tour suivant. Continu : +2 si Freya est ici.
- Izzy, Lune de Sang (3/0, Légendaire) : Révélation : détruit la carte adverse la plus forte ici (6 ou moins) et gagne la moitié de sa puissance, arrondie au-dessus.
- Lip Dentelle (3/3, Épique, pas sortie) : Révélation : défausse la carte la plus chère de ta main et gagne sa puissance.
- Maeve (3/3, Commune) : Révélation : si tu mènes ici, +3.
- Nike (3/1, Ultra-légendaire, pas sortie) : Révélation : +2 pour chaque autre carte que tu as jouée avant elle ce tour. Exige 8 cartes Jugement dans le deck, Nike comprise.
- Vasseur (3/2, Commune) : Révélation : +4 de Puissance dans deux tours.
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- Andraste (4/3, Rare, pas sortie) : Révélation : +2 par carte adverse ici.
- La Nuée de Miroirs (4/3, Rare) : Révélation : copie la puissance de ta carte la plus forte ici.
- Oshun (4/3, Rare, pas sortie) : Révélation : +1 à toutes tes autres cartes, dans les 3 lieux.
- Susanoo (4/4, Épique, pas sortie) : Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3. +2 si Amaterasu est de ton côté.
- Bastet (5/4, Rare) : Révélation : +2 à tes autres cartes ici.
- Calypso X Jordan (5/4, Ultra-légendaire, pas sortie) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2. Exige Calypso et Jordan dans le deck.
- Yarden Weiss (5/6, Épique) : Révélation : +4 si tu as des cartes dans les 3 lieux (celles posées ce tour comptent).
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2. Exige Nemesis et Jordan dans le deck.

**Bonus aux autres cartes alliées** : 11 cartes (3 sorties, 8 pas encore)

- Ishara (2/2, Rare) : Continu : tes autres cartes ici ont +1.
- Tefnut (2/2, Commune, pas sortie) : Révélation : +1 à tes autres cartes ici.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2.
- Le Graffeur du Tunnel de la Borde (3/2, Épique, pas sortie) : Continu : +2 de ton côté dans les lieux voisins.
- Oshun (4/3, Rare, pas sortie) : Révélation : +1 à toutes tes autres cartes, dans les 3 lieux.
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main.
- Bastet (5/4, Rare) : Révélation : +2 à tes autres cartes ici.
- La Doyenne (5/4, Commune) : Continu : tes autres cartes Helvara ont +1, dans tous les lieux.
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2. Exige Nemesis et Jordan dans le deck.
- Qetesh X Jordan (6/4, Ultra-légendaire, pas sortie) : Continu : tes autres cartes ont +1, dans les 3 lieux. Exige Qetesh et Jordan dans le deck.
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de coût 5 ou moins. Continu : tes autres cartes ici ont +2. Exige Qetesh du Nouvel An et Jor…

**Pioche, défausse ou fouille le deck** : 19 cartes (8 sorties, 11 pas encore)

- Le Mendiant de la Riponne (0/2, Commune, pas sortie) : Révélation : défausse une carte au hasard de ta main. Nourrit Rémi.
- Coursier du Flon (1/1, Commune) : Révélation : pioche 1 carte.
- Jordan, le Créateur (1/-1, Épique) : Ne peut pas être affaibli. Révélation : ajoute Yarden Weiss à ta main depuis ton deck.
- Jordan, le Narrateur (1/0, Épique) : Révélation : ajoute à ta main, depuis ton deck, une carte qui peut former une Fusion avec Jordan.
- Le Bibliothécaire des Passages (1/2, Commune) : Révélation : pioche 1 carte si tu as moins de cartes en main que l'adversaire.
- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.
- Athéna (2/2, Rare, pas sortie) : Révélation : prends en main la plus chère des 3 premières cartes de ton deck.
- Dionysos (2/2, Rare, pas sortie) : Révélation : chaque joueur pioche 1 carte, puis défausse une carte au hasard.
- Éos (2/2, Rare) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté.
- Éos de Nouvel An (2/1, Épique, pas sortie) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins.
- La Voleuse du Flon (2/2, Légendaire, pas sortie) : Révélation : ton adversaire défausse une carte au hasard de sa main.
- Melinoë (2/2, Rare) : Révélation : défausse une carte au hasard de ta main, puis +3. Main vide : pas de bonus.
- Morrigan, Sorcière d'Halloween (2/2, Épique) : Révélation : pioche 2 cartes, puis défausse la carte la plus chère de ta main.
- Cronos (3/3, Épique, pas sortie) : Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 pour chacune.
- Hécate (3/2, Commune) : Révélation : pioche 2 cartes.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2.
- Lip Dentelle (3/3, Épique, pas sortie) : Révélation : défausse la carte la plus chère de ta main et gagne sa puissance.
- Loki (3/3, Épique, pas sortie) : Révélation : chaque joueur défausse la carte la plus chère de sa main.
- Odin (4/4, Légendaire, pas sortie) : Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes.

**Ressuscite** : 5 cartes (0 sorties, 5 pas encore)

- Hadès (4/4, Légendaire, pas sortie) : Révélation : ressuscite ici ta carte détruite la plus forte, sans Révélation.
- Loviatar (4/3, Épique, pas sortie) : Révélation : ressuscite ici ta dernière carte défaussée. Elle revient malade : sans Révélation et avec −2.
- Hel, Reine du Réveillon (5/2, Épique, pas sortie) : Révélation : ressuscite ici ta carte défaussée la plus chère, avec sa Révélation.
- Hel (6/5, Légendaire, pas sortie) : Révélation : ressuscite ici jusqu'à 3 de tes cartes défaussées, sans Révélation.
- Hel X Baldur (6/3, Ultra-légendaire, pas sortie) : Révélation : ressuscite ici ta carte détruite ou défaussée la plus forte, avec sa Révélation. Elle ne peut plus être ni détruite ni affaiblie. Si c…

**Crée un jeton ou une copie** : 7 cartes (3 sorties, 4 pas encore)

- Kitsune (1/1, Commune) : Révélation : laisse une Illusion de puissance 2 dans un autre lieu.
- Dame Joanna (2/2, Épique) : Révélation : laisse une Lanterne de puissance 2 dans chacun de tes autres lieux où tu as déjà une carte.
- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Scáthach (4/3, Épique, pas sortie) : Révélation : laisse une Ombre de Scáthach (puissance −3, sans effet) du côté adverse, dans un autre lieu.
- Thor (4/3, Épique, pas sortie) : Révélation : lance Mjölnir (jeton de puissance 2) dans un autre lieu. Si Mjölnir est détruit, Thor gagne +2.
- Aphrodite, Étoile de Noël (5/4, Épique, pas sortie) : Révélation : laisse un Reflet d'Aphrodite de puissance 3 dans chacun de tes autres lieux.
- La Mère de Cendre (5/4, Rare) : Révélation : laisse un Cendreux de puissance 2 dans chacun de tes autres lieux.

**Énergie ou coût des cartes** : 14 cartes (3 sorties, 11 pas encore)

- Prométhée (1/1, Légendaire, pas sortie) : Continu : l'énergie que tu ne dépenses pas est conservée au tour suivant (10 maximum).
- Éos de Nouvel An (2/1, Épique, pas sortie) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins.
- Félix (2/3, Rare) : Révélation : ta prochaine carte coûte 1 de moins.
- Bia (3/3, Rare, pas sortie) : Révélation : l'adversaire perd son énergie conservée. S'il n'en avait pas, −1 à sa carte la plus forte ici.
- Cronos (3/3, Épique, pas sortie) : Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 pour chacune.
- Freyr (3/3, Rare) : Révélation : +1 énergie au tour suivant. Continu : +2 si Freya est ici.
- Pandore (3/0, Épique, pas sortie) : Révélation : dépense toute l'énergie qu'il te reste. +2 par énergie dépensée.
- Baldur (4/4, Épique, pas sortie) : Les effets adverses ne peuvent ni le détruire ni l'affaiblir, sauf ceux des cartes de coût 2 ou moins (le gui) et ceux où « rien ne le protège ».
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Qetesh du Nouvel An (5/3, Épique, pas sortie) : Révélation : au début du tour suivant, charme la carte adverse la plus forte ici de coût 5 ou moins.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 si Yarde…
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de coût 5 ou moins. Continu : tes autres cartes ici ont +2. Exige Qetesh du Nouvel An et Jor…
- Yarden X Apsu (9/12, Ultra-légendaire) : Coûte 1 de moins par autre carte dans ta main. Révélation : +1 par carte restée dans ta main. Exige Yarden Weiss et Apsu dans le deck.

**Protection contre la destruction, l'affaiblissement ou le ciblage** : 8 cartes (5 sorties, 3 pas encore)

- Jordan, le Créateur (1/-1, Épique) : Ne peut pas être affaibli. Révélation : ajoute Yarden Weiss à ta main depuis ton deck.
- L'Écorché Silencieux (3/3, Rare) : Ne peut pas être affaibli. Révélation : −2 à une carte adverse au hasard ici.
- Chernobog (4/4, Épique, pas sortie) : Continu : les cartes adverses ici ne peuvent pas dépasser leur puissance de base.
- Eir (4/3, Rare) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies.
- Psyché (4/3, Épique) : Continu : tes cartes ici ne descendent pas sous 1. Révélation : +2 à ta carte la plus faible ici.
- Amaterasu (5/4, Épique) : Continu : tes cartes ne peuvent pas être affaiblies, dans les 3 lieux.
- Calypso X Jordan (5/4, Ultra-légendaire, pas sortie) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2. Exige Calypso et Jordan dans le deck.
- Ananké (6/1, Ultra-légendaire, pas sortie) : Fatalité : ne peut être ni détruite, ni déplacée, ni affaiblie. Révélation : sa puissance devient égale à la puissance totale adverse ici, +1. Exig…

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

**Groupe 2** (2 cartes, Continu) :
- Les Costumes (4/3, Commune) : Continu : +4 si l'Agent de Thot est en jeu.
- Freya (5/5, Rare) : Continu : +4 si Freyr est ici.

**Groupe 3** (2 cartes, Révélation) :
- Apsu (6/8, Légendaire) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. +6 si Yarden Weiss est de ton côté.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 si Yarden Weiss est de ton côté.

**Groupe 4** (2 cartes, Continu) :
- Hathor (4/3, Rare) : Continu : −1 aux cartes adverses ici.
- La Mouche de la Faille (1/3, Commune, pas sortie) : Continu : −1 à tes autres cartes ici.

**Groupe 5** (2 cartes, Révélation) :
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.

**Groupe 6** (2 cartes, Révélation) :
- Bastet (5/4, Rare) : Révélation : +2 à tes autres cartes ici.
- Tefnut (2/2, Commune, pas sortie) : Révélation : +1 à tes autres cartes ici.

**Groupe 7** (2 cartes, Révélation) :
- Éos (2/2, Rare) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté.
- Éos de Nouvel An (2/1, Épique, pas sortie) : Révélation : pioche 1 carte, 2 si Perséphone est de ton côté. Ta prochaine carte coûte 1 de moins.

**Groupe 8** (2 cartes, Révélation) :
- Agent de Thot (3/3, Rare) : Révélation : −2 à la carte adverse la plus forte ici.
- Mohini (1/1, Légendaire) : Révélation : la carte adverse la plus forte ici perd ses effets.

**Groupe 9** (2 cartes, Révélation) :
- Arès (4/3, Rare) : Révélation : −1 à chaque carte adverse ici, et +1 pour chacune.
- Arès, Boucher d'Halloween (5/4, Épique) : Révélation : −2 à chaque carte adverse ici, et +1 pour chacune.

**Groupe 10** (2 cartes, Révélation) :
- La Mère de Cendre (5/4, Rare) : Révélation : laisse un Cendreux de puissance 2 dans chacun de tes autres lieux.
- Aphrodite, Étoile de Noël (5/4, Épique, pas sortie) : Révélation : laisse un Reflet d'Aphrodite de puissance 3 dans chacun de tes autres lieux.

**Groupe 11** (2 cartes, Révélation) :
- Morrigan, Sorcière d'Halloween (2/2, Épique) : Révélation : pioche 2 cartes, puis défausse la carte la plus chère de ta main.
- Odin (4/4, Légendaire, pas sortie) : Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes.

**Groupe 12** (2 cartes, Révélation) :
- Calypso, Reine des Glaces (5/3, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 par carte adverse ici.
- Calypso (5/4, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu.

### 5.3 Même cible, verbes différents

Cartes qui visent la même chose (« la carte adverse la plus forte ici »…), quel que soit ce qu'elles lui font. C'est ce regroupement qui montre les effets de « destruction / vol / affaiblissement de la plus forte carte » en concurrence.

**La carte adverse la plus forte (ici ou ailleurs)** : 20 cartes (12 sorties, 8 pas encore)

- Mohini (1/1, Légendaire) : Révélation : la carte adverse la plus forte ici perd ses effets.
- Izzy (2/1, Rare) : Révélation : prend la puissance de la carte adverse la plus forte ici, si elle est plus haute (6 au maximum).
- Agent de Thot (3/3, Rare) : Révélation : −2 à la carte adverse la plus forte ici.
- Éris (3/3, Rare) : Révélation : déplace la carte adverse la plus forte ici vers un autre lieu.
- Izzy, Lune de Sang (3/0, Légendaire) : Révélation : détruit la carte adverse la plus forte ici (6 ou moins) et gagne la moitié de sa puissance, arrondie au-dessus.
- Ishtar (4/3, Épique) : Continu : à la fin des tours 1 à 5, −1 à la carte adverse la plus forte ici.
- Ixchel (4/4, Épique) : Révélation : −3 à la carte adverse la plus forte, dans n'importe quel lieu.
- Le Chasseur d'échos (4/3, Épique, pas sortie) : Révélation : crée de ton côté un Écho de la carte adverse la plus forte ici (même puissance, sans effet).
- Médée, Mariée Spectrale (4/3, Épique) : Révélation : empoisonne la carte adverse la plus forte ici : elle perd 1 à la fin de chaque tour, jusqu'à 0. Si Hécate est de ton côté, empoisonne aussi la deuxième.
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Calypso (5/4, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive. Sa puissance tombe à 0 tant que Calypso reste en jeu.
- Calypso, Reine des Glaces (5/3, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici devient captive (0 tant que Calypso reste en jeu). +1 par carte adverse ici.
- Durga (5/5, Rare) : Révélation : détruit la carte adverse la plus forte ici si elle a 7 ou plus. Sinon, +3.
- Oya (5/4, Épique) : Révélation : change la carte adverse la plus forte ici en carte de puissance 1, sans effet.
- Pele du Réveillon (5/3, Épique, pas sortie) : Révélation : le feu d'artifice éclate dans les 3 lieux. −2 à la carte adverse la plus forte de chaque lieu.
- Qetesh du Nouvel An (5/3, Épique, pas sortie) : Révélation : au début du tour suivant, charme la carte adverse la plus forte ici de coût 5 ou moins.
- Lilith (6/5, Légendaire) : Révélation : la carte adverse la plus forte ici (6 ou moins) passe de ton côté. Si ton côté est plein, elle est détruite.
- Nyx (6/5, Légendaire) : Révélation : détruit la carte adverse la plus forte ici. Rien ne la protège.
- Nyx X Oshun (6/4, Ultra-légendaire, pas sortie) : Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre lieu. Exige Nyx et O…
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de coût 5 ou moins. Continu : tes autres cartes ici ont +2. Exige Qetesh du Nouvel An et Jordan dans le deck.

**La carte adverse la plus faible** : 4 cartes (4 sorties, 0 pas encore)

- Rusalka (2/2, Commune) : Révélation : détruit la carte adverse la plus faible ici si elle a 2 ou moins.
- Artémis (3/3, Rare) : Révélation : −2 à la carte adverse la plus faible ici. +2 si Izzy est de ton côté.
- L'Esquille (3/1, Rare) : Révélation : détruit la carte adverse la plus faible ici.
- Nyx, Guerrière d'Halloween (5/4, Épique) : Révélation : détruit les 2 cartes adverses les plus faibles ici.

**Toutes les cartes adverses d'un lieu ou de tous les lieux** : 15 cartes (7 sorties, 8 pas encore)

- Týr (2/3, Rare) : Révélation : −1 à chaque carte adverse ici qui a 4 de puissance ou plus.
- Araignée de cristal (4/4, Rare) : Révélation : affaiblit de 1 toutes les cartes adverses ici.
- Arès (4/3, Rare) : Révélation : −1 à chaque carte adverse ici, et +1 pour chacune.
- Chernobog (4/4, Épique, pas sortie) : Continu : les cartes adverses ici ne peuvent pas dépasser leur puissance de base.
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Arès, Boucher d'Halloween (5/4, Épique) : Révélation : −2 à chaque carte adverse ici, et +1 pour chacune.
- Circé (5/3, Épique, pas sortie) : Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet).
- Nergal (5/4, Épique) : Révélation : −1 à toutes les cartes adverses, dans les 3 lieux. Continu : +3 tant qu'Ereshkigal est de ton côté.
- Sekhmet, Lionne de l'Hiver (5/4, Épique, pas sortie) : Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées.
- Apsu (6/8, Légendaire) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. +6 si Yarden Weiss est de ton côté.
- Apsu, Veillée des Chaînes (6/7, Légendaire, pas sortie) : Révélation : les cartes adverses ici perdent leurs effets. Ce qu'elles ont déjà fait reste acquis. Ta prochaine carte coûte 2 de moins. +4 si Yarden Weiss est de ton c…
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Nyx X Circé (6/3, Ultra-légendaire, pas sortie) : Révélation : les cartes adverses ici deviennent des Pourceaux. Exige Nyx et Circé dans le deck.
- Pele X Jordan du Réveillon (6/4, Ultra-légendaire, pas sortie) : Révélation : la lave inflige −1 à toutes les cartes adverses, dans les 3 lieux. Exige Pele et Jordan dans le deck.

**Une carte adverse au hasard, ou tirée selon un seuil de puissance ou de coût** : 17 cartes (9 sorties, 8 pas encore)

- Rusalka (2/2, Commune) : Révélation : détruit la carte adverse la plus faible ici si elle a 2 ou moins.
- Týr (2/3, Rare) : Révélation : −1 à chaque carte adverse ici qui a 4 de puissance ou plus.
- Izzy, Lune de Sang (3/0, Légendaire) : Révélation : détruit la carte adverse la plus forte ici (6 ou moins) et gagne la moitié de sa puissance, arrondie au-dessus.
- L'Écorché Silencieux (3/3, Rare) : Ne peut pas être affaibli. Révélation : −2 à une carte adverse au hasard ici.
- Skadi (3/3, Rare) : Révélation : −3 à une carte adverse au hasard, dans un autre lieu.
- Baldur (4/4, Épique, pas sortie) : Les effets adverses ne peuvent ni le détruire ni l'affaiblir, sauf ceux des cartes de coût 2 ou moins (le gui) et ceux où « rien ne le protège ».
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Qetesh (4/2, Épique, pas sortie) : Révélation : la carte adverse la plus forte ici (4 ou moins) est charmée. Sa puissance compte pour toi, mais elle reste de son côté.
- Circé (5/3, Épique, pas sortie) : Révélation : les cartes adverses ici de puissance 3 ou moins deviennent des Pourceaux (puissance 1, sans effet).
- Durga (5/5, Rare) : Révélation : détruit la carte adverse la plus forte ici si elle a 7 ou plus. Sinon, +3.
- Oya (5/4, Épique) : Révélation : change la carte adverse la plus forte ici en carte de puissance 1, sans effet.
- Qetesh du Nouvel An (5/3, Épique, pas sortie) : Révélation : au début du tour suivant, charme la carte adverse la plus forte ici de coût 5 ou moins.
- Sekhmet, Lionne de l'Hiver (5/4, Épique, pas sortie) : Révélation : détruit les cartes adverses de puissance 2 ou moins ici. Les tiennes sont épargnées.
- Ereshkigal (6/7, Légendaire) : Révélation : détruit toutes les cartes adverses ici de puissance 3 ou moins. Rien ne les protège.
- Le Seigneur de la marée noire (6/8, Légendaire, pas sortie) : Révélation : détruit les cartes adverses de coût 2 ou moins ici.
- Lilith (6/5, Légendaire) : Révélation : la carte adverse la plus forte ici (6 ou moins) passe de ton côté. Si ton côté est plein, elle est détruite.
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de coût 5 ou moins. Continu : tes autres cartes ici ont +2. Exige Qetesh du Nouvel An et Jordan dans le deck.

**Ta carte la plus faible ou ta carte la plus forte** : 11 cartes (6 sorties, 5 pas encore)

- Hermès (1/1, Rare) : Révélation : déplace ta carte la plus forte ici vers un lieu révélé qu'elle te ferait remporter.
- Le Boucher de la Riponne (1/3, Commune, pas sortie) : Révélation : détruit ton autre carte la plus faible ici et pioche 1.
- Idunn (2/2, Rare) : Continu : à la fin des tours 1 à 5, +1 à ta carte la plus faible ici.
- Le Tatoueur de Chauderon (2/2, Rare, pas sortie) : Révélation : ta carte la plus forte ici gagne +1 et ne peut plus être affaiblie.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2.
- Anat (4/4, Épique) : Révélation : détruit ton autre carte la plus faible ici et gagne sa puissance.
- La Nuée de Miroirs (4/3, Rare) : Révélation : copie la puissance de ta carte la plus forte ici.
- Psyché (4/3, Épique) : Continu : tes cartes ici ne descendent pas sous 1. Révélation : +2 à ta carte la plus faible ici.
- Susanoo (4/4, Épique, pas sortie) : Révélation : la tempête emporte ta carte la plus faible ici vers un autre lieu, où elle gagne +3. +2 si Amaterasu est de ton côté.
- Le Troll (5/9, Commune) : Révélation : détruit ton autre carte la plus faible ici.
- Nyx X Oshun (6/4, Ultra-légendaire, pas sortie) : Révélation : détruit la carte adverse la plus forte ici. La moitié de sa puissance (arrondie au-dessus) va à ta carte la plus faible dans un autre lieu. Exige Nyx et O…

**Tes autres cartes ici ou dans tous les lieux** : 18 cartes (7 sorties, 11 pas encore)

- La Mouche de la Faille (1/3, Commune, pas sortie) : Continu : −1 à tes autres cartes ici.
- Ishara (2/2, Rare) : Continu : tes autres cartes ici ont +1.
- Tefnut (2/2, Commune, pas sortie) : Révélation : +1 à tes autres cartes ici.
- Heimdall (3/3, Épique, pas sortie) : Révélation : tes autres cartes ici passent par le Bifröst vers un lieu où l'on ne peut plus jouer, s'il y a de la place. Sinon, +2.
- Le Carillonneur de la Cathédrale (3/1, Légendaire, pas sortie) : Continu : à la fin de chaque tour, +1. Fin du tour 6 : le glas sonne, tes autres cartes ici gagnent la moitié de sa puissance (arrondie au-dessous).
- Eir (4/3, Rare) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies.
- Oshun (4/3, Rare, pas sortie) : Révélation : +1 à toutes tes autres cartes, dans les 3 lieux.
- Psyché (4/3, Épique) : Continu : tes cartes ici ne descendent pas sous 1. Révélation : +2 à ta carte la plus faible ici.
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main.
- Amaterasu (5/4, Épique) : Continu : tes cartes ne peuvent pas être affaiblies, dans les 3 lieux.
- Bastet (5/4, Rare) : Révélation : +2 à tes autres cartes ici.
- Calypso X Jordan (5/4, Ultra-légendaire, pas sortie) : Continu : tes cartes ici ne peuvent être ni détruites ni affaiblies, et les autres gagnent +2. Exige Calypso et Jordan dans le deck.
- La Doyenne (5/4, Commune) : Continu : tes autres cartes Helvara ont +1, dans tous les lieux.
- La Ficelle Dévorante (5/4, Épique) : Révélation : détruit tes autres cartes ici. +3 pour chacune.
- Aphrodite X Yarden (6/5, Ultra-légendaire, pas sortie) : Révélation : rejoue la Révélation de chacune de tes autres cartes ici. Exige Aphrodite et Yarden Weiss dans le deck.
- Nemesis X Jordan (6/2, Ultra-légendaire, pas sortie) : Révélation : détruit la carte la plus forte de chaque côté ici, puis tes autres cartes ici gagnent +2. Exige Nemesis et Jordan dans le deck.
- Qetesh X Jordan (6/4, Ultra-légendaire, pas sortie) : Continu : tes autres cartes ont +1, dans les 3 lieux. Exige Qetesh et Jordan dans le deck.
- Qetesh X Jordan du Nouvel An (6/4, Ultra-légendaire, pas sortie) : Révélation : charme la carte adverse la plus forte ici de coût 5 ou moins. Continu : tes autres cartes ici ont +2. Exige Qetesh du Nouvel An et Jordan dans le deck.

**La main ou le deck (pioche, défausse, prise en main)** : 16 cartes (6 sorties, 10 pas encore)

- Le Mendiant de la Riponne (0/2, Commune, pas sortie) : Révélation : défausse une carte au hasard de ta main. Nourrit Rémi.
- Jordan, le Créateur (1/-1, Épique) : Ne peut pas être affaibli. Révélation : ajoute Yarden Weiss à ta main depuis ton deck.
- Jordan, le Narrateur (1/0, Épique) : Révélation : ajoute à ta main, depuis ton deck, une carte qui peut former une Fusion avec Jordan.
- Athéna (2/2, Rare, pas sortie) : Révélation : prends en main la plus chère des 3 premières cartes de ton deck.
- La Voleuse du Flon (2/2, Légendaire, pas sortie) : Révélation : ton adversaire défausse une carte au hasard de sa main.
- Le Sans-Voix (2/4, Rare, pas sortie) : Révélation : ton adversaire ne peut pas jouer ici au prochain tour.
- Melinoë (2/2, Rare) : Révélation : défausse une carte au hasard de ta main, puis +3. Main vide : pas de bonus.
- Morrigan, Sorcière d'Halloween (2/2, Épique) : Révélation : pioche 2 cartes, puis défausse la carte la plus chère de ta main.
- Cronos (3/3, Épique, pas sortie) : Révélation : défausse les cartes de coût 1 ou moins de ta main. +2 pour chacune.
- Izanami (3/3, Épique, pas sortie) : Révélation : défausse ta carte la plus faible de ta main. Continu : tes cartes ressuscitées ont +2.
- Lip Dentelle (3/3, Épique, pas sortie) : Révélation : défausse la carte la plus chère de ta main et gagne sa puissance.
- Odin (4/4, Légendaire, pas sortie) : Révélation : défausse la carte la plus chère de ta main, puis pioche 2 cartes.
- Poséidon (4/3, Épique, pas sortie) : Révélation : le reflux renvoie dans la main adverse les cartes adverses de coût 3 ou moins ici.
- Styx (4/3, Légendaire, pas sortie) : Continu : Nike et Bia ont +3 où qu'elles soient. Quand une de tes cartes Jugement est détruite ici par un effet adverse, elle revient dans ta main.
- Jordan X Izzy (6/6, Ultra-légendaire) : Révélation : prend la carte la plus puissante de la main adverse et l'invoque ici, ou dans un autre lieu si c'est plein. Exige Jordan et Izzy dans le deck.
- Yarden X Apsu (9/12, Ultra-légendaire) : Coûte 1 de moins par autre carte dans ta main. Révélation : +1 par carte restée dans ta main. Exige Yarden Weiss et Apsu dans le deck.

---
*Pour relancer : `node outils/equilibrage.js --parties 5000`. Voir l'en-tête du script pour les options.*
