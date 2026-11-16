# Duel d'Helvara : plan d'action

Écrit le 16 novembre 2026. À reprendre dans n'importe quelle session : dire « reprends `docs/plan-action.md` ».
Cocher les cases au fur et à mesure. En cas d'écart avec le code, **le code fait foi**.

## Le constat de départ

- Le jeu est solide techniquement, mais il n'a jamais été publié : seuls quelques amis y jouent, et Jordan lui-même y joue moins.
- Le contenu avance plus vite que les joueurs : 297 cartes, calendrier bouclé jusqu'en avril 2027, 45 cartes encore sans effet.
- La formule (3 lieux, 6 tours) se reconnaît vite. Ce qui appartient à Helvara : **le Serment**, les fusions qui exigent leurs deux personnages, et Lausanne.
- Pas de vrai multijoueur, et une file d'attente en direct ne peut pas marcher sans population.

## Où on en est

La vague 1 a été fusionnée dans `main` par la PR n°1 (vérifié le 16 novembre : `origin/main` la contient), donc elle est **déjà en ligne**. Les corrections d'interface et de tests faites ensuite sont sur la branche `ccr-a2a09767-cv8ig6`, pas encore sur `main`.

### Vague 1 : faite et fusionnée dans `main`

- [x] Serment : étape au tour 5 de la partie guidée
- [x] Serment : cérémonie (sceau ⚖ sur le lieu, lueur durable)
- [x] Serment : compteurs au profil (tenus, rompus, plus longue série)
- [x] Serment dans les duels entre amis, **caché pendant le tour et révélé à la fin** (décision de Jordan, 16 novembre)
- [x] Serment dans le Blitz
- [x] Fin de partie : tableau « Toi / IA » et bilan (lieu perdu de peu, carte adverse la plus forte, conseil)
- [x] Journal de partie derrière un bouton
- [x] Accueil : un seul bandeau à la fois
- [x] Lieux : règle sur trois lignes et bouton « i »
- [x] Aperçu du lien pour Discord et WhatsApp (`images/apercu.jpg`)

Tests après fusion : 633 scénarios sur 633, bac à sable 15 sur 15, deux parties complètes jouées avec Serment en 390 × 844 et 360 × 740 sans erreur.

### Vérifications à faire (la vague 1 est déjà en ligne)

- [ ] **Jordan : un vrai duel entre amis avec Serment.** Il n'a tourné que sur un faux salon de test, jamais sur le vrai serveur.
- [ ] Jordan : essai sur son téléphone (Android, Brave)
- [ ] Jordan : jouer un Blitz complet avec Serment (testé seulement par scénarios)
- [ ] Jordan : valider ou changer les chiffres provisoires (tableau ci-dessous)
- [ ] Jordan : relire les cinq conseils de fin de partie et le texte de l'étape du tutoriel
- [x] Corriger : le panneau d'aide « À toi… » cache la barre du journal en 390 × 844 (le réduire à une ligne après le tour 1)
- [x] Corriger : la Cathédrale d'Helvara dépasse des autres lieux quand son nom tient sur deux lignes
- [ ] Raccourcir les textes de lieux les plus longs (plume de Jordan)
- [x] `tests-holo.js` : 68 sur 68. La collection affiche et précharge volontairement les cartes holo (confirmé par Jordan) ; le test comptait mal. Test mis à jour.
- [ ] `tests-pwa.js` : 1 échec, **cause trouvée, pas un lien avec le holo**. Le plateau affiche l'illustration pleine (`images/<id>.webp`, via `art(c.id)` sans `light`), qui n'est préchargée que pour ton deck. Hors ligne, une carte adverse jamais vue s'affiche donc vide. Le `CLAUDE.md` dit pourtant que l'avatar sert de miniature au plateau. Échec présent avant la vague 1. **À décider par Jordan** : plateau en avatars (léger, préchargés) ou illustrations pleines.
- [ ] Après publication : vérifier l'aperçu réel du lien sur Discord (ajouter `?x=1` au lien si l'ancien aperçu reste)

### Chiffres provisoires à valider

| Sujet | Choix provisoire |
|---|---|
| Duel entre amis | tenu +30 CHF, rompu −15, croisé +60 / −30 (jamais sous 0) |
| Blitz | tenu +50 CHF sur le gain en cours, rompu −50, croisé ±100 |
| « Tenu » au profil et pour la quête | lieu gagné, même si la partie est perdue |
| « Tenu » pour les CHF | lieu **et** partie gagnés |
| Serment prêté au tour 5 en duel | ne peut pas être relevé |

Les montants sont dans la constante `OATH_CHF`, en tête de `js/moteur.js`.

## La suite, axe par axe

### Axe 1 : le Serment, troisième marche

- [ ] Famille de cartes « Juré » (plus fortes sur ton lieu juré) et « Parjure » (qui profitent d'un serment rompu)
- [ ] Les prendre parmi les 45 cartes sans effet : aucune carte sortie n'est touchée
- [ ] Chaque effet mesuré avec l'outil d'équilibrage ; l'IA doit apprendre à jouer avec

À décider par Jordan : les effets. Ce sont des pistes, rien n'est écrit ni équilibré.

### Axe 2 : le solo et l'IA

- [ ] Rivaux nommés à la place de « IA Jugement · Héraut » : portrait, deck signature, une phrase, une façon de jurer
- [ ] Un chemin à travers Lausanne : 10 à 15 duels à règles spéciales

À fournir par Jordan : pour chaque rival, un nom, une faction, une phrase, et s'il jure vite ou s'il bluffe.

### Axe 3 : le multi sans joueurs

- [ ] Abandonner la file d'attente en direct
- [ ] Défi du jour : mêmes lieux, même adversaire, même tirage pour tous, comparaison entre amis (le replay repose déjà sur un tirage reproductible)
- [ ] Decks fantômes : affronter le deck d'un ami piloté par l'IA, sans qu'il soit connecté
- [ ] Une soirée de duels à heure fixe sur Discord

Attention : défi du jour et decks fantômes écrivent dans Supabase. Relecture par `db-guard` et validation de Jordan avant toute écriture.

### Axe 4 : la progression

- [ ] Rattrapage : un deck de faction offert après 5 parties
- [ ] Moins d'exclusives qui disparaissent en deux semaines, ou un retour garanti l'année suivante
- [ ] Buts de collection visibles (« il te manque 3 cartes pour finir Jugement »)
- [ ] Débloquer les modes petit à petit (noté depuis octobre, jamais fait)

### Axe 5 : la gestion du projet

- [ ] Gel des nouvelles cartes jusqu'au lot de mars, hors famille Serment
- [ ] Un axe à la fois, terminé avant d'ouvrir le suivant
- [ ] Trancher les questions ouvertes de `docs/calendrier-et-en-attente.md`

### Axe 6 : publier

- [ ] Page itch.io
- [ ] Bouton de partage (victoire, carte tirée)
- [ ] Posts sur les communautés de jeux de cartes, en étant franc sur l'origine des illustrations
- [ ] Une date : viser fin janvier 2027, après les rivaux

## L'ordre recommandé

1. Publier la vague 1 (liste « Avant de publier » ci-dessus)
2. Rivaux nommés et premier chapitre du chemin
3. Défi du jour
4. Publication
5. Cartes Juré et Parjure

## Ce qui n'a jamais été vérifié

- Le nombre réel de joueurs et de parties (aucun accès à la base depuis les sessions de travail)
- Le niveau de l'IA ressenti par un humain
- Le duel en ligne sur le vrai serveur
