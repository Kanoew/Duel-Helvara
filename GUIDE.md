# Mettre Duel d'Helvara en ligne

Adresse du jeu une fois publié : **https://kanoew.github.io/Duel-Helvara/**

Le fichier `config.js` est déjà rempli avec ton projet Supabase. Ce guide sert à **refaire l'installation** (nouveau projet Supabase, nouveau compte Google…) ou à retrouver une étape. Le jeu est déjà en ligne ; les quatre étapes ci-dessous se font dans l'ordre, puis la section « Scripts SQL » liste tout ce qu'il faut coller dans Supabase.

---

## 1. Supabase : créer la base (5 min)

1. Ouvre ton projet sur https://supabase.com/dashboard.
2. Menu de gauche : **SQL Editor** → **New query**.
3. Copie tout le contenu de `supabase.sql` (dans ce dépôt), colle-le, puis clique **Run**. Le message attendu est « Success. No rows returned ». Lance ensuite les autres scripts, dans l'ordre indiqué dans la section « Scripts SQL » plus bas.
4. Menu **Authentication** → **Sign In / Providers** :
   - active **Allow anonymous sign-ins**, puis **Save** ;
   - active **Allow manual linking**, puis **Save**. Ça permet de passer d'une partie « appareil » à un compte Google sans rien perdre.
5. Menu **Authentication** → **URL Configuration** :
   - **Site URL** : `https://kanoew.github.io/Duel-Helvara/`
   - **Redirect URLs** → **Add URL** : `https://kanoew.github.io/Duel-Helvara/`

Dès cette étape, le jeu fonctionne : sauvegarde, classement et duels. Seule la connexion Google manque encore.

## 2. GitHub Pages : publier le site (3 min)

> Avec un compte GitHub gratuit, Pages ne marche que sur un dépôt **public** (c'est le cas aujourd'hui : le site est déjà publié, et chaque envoi sur `main` le met à jour en 1 à 2 minutes).
> Les clés de `config.js` peuvent être publiques sans danger : ce sont les règles des scripts SQL qui protègent les données. Le code secret Google, lui, ne va **jamais** dans le dépôt.

1. Sur https://github.com/Kanoew/Duel-Helvara → **Settings**.
2. Tout en bas de **General** → **Danger Zone** → **Change visibility** → **Public**.
3. Menu **Pages** → **Source** : *Deploy from a branch* → branche **main**, dossier **/ (root)** → **Save**.
4. Attends 1 à 2 minutes, puis ouvre https://kanoew.github.io/Duel-Helvara/.

## 3. Google : l'identifiant de connexion (10 min)

Tout se passe sur https://console.cloud.google.com, pas dans Google Drive.

1. En haut, sélecteur de projet → **Nouveau projet** → nom : `Duel Helvara` → **Créer**, puis sélectionne-le.
2. Menu **API et services** → **Écran de consentement OAuth** (ou **Google Auth Platform**) → **Commencer** :
   - nom de l'application : `Duel d'Helvara`, adresse e-mail d'assistance : la tienne ;
   - audience : **Externe** ;
   - coordonnées : ton e-mail → **Créer**.
3. **Audience** → **Publier l'application**. Sans ça, seuls les testeurs listés pourraient se connecter.
4. **Clients** → **Créer un client** :
   - type : **Application Web**, nom : `Helvara` ;
   - **Origines JavaScript autorisées** : `https://kanoew.github.io` ;
   - **URI de redirection autorisés** : `https://ehjtyfmbbhzgesxthkdg.supabase.co/auth/v1/callback` ;
   - **Créer**. Copie l'**ID client** et le **Code secret du client**.
5. Retour dans Supabase → **Authentication** → **Sign In / Providers** → **Google** → active-le, colle l'ID client et le code secret → **Save**.

Ne mets jamais le code secret dans le dépôt : il va uniquement dans Supabase.

## 4. Vérifier

1. Ouvre le jeu. Le bas de l'accueil affiche « Progression sauvegardée pour cet appareil » avec un bouton **Se connecter avec Google**.
2. Connecte-toi. Le bas de l'accueil doit afficher « Progression sauvegardée sur ton compte Google ».
3. Ouvre le jeu sur ton téléphone, connecte-toi avec le même compte : tu retrouves ta partie.
4. Duel : sur un appareil, **Duel entre amis** → **Créer un salon**. Sur l'autre, entre le code → **Rejoindre**.

---

## Si quelque chose coince

| Symptôme | Cause probable |
|---|---|
| « Connexion impossible : Anonymous sign-ins are disabled » | Étape 1.4 : connexions anonymes non activées. |
| Classement vide, rien ne se sauvegarde | Le script `supabase.sql` n'a pas été lancé (étape 1.3), ou `classement-securise.sql` n'a pas été lancé après lui. |
| Le jeu n'envoie ni pouces ni statistiques | `retours-stats.sql` pas lancé, ou connexions anonymes désactivées. |
| Après une mise à jour, une ancienne page reste affichée | Recharge la page (l'appli installée se recharge toute seule une fois, hors partie). |
| Google affiche « redirect_uri_mismatch » | L'URI de redirection de l'étape 3.4 est mal recopiée. |
| Après Google, retour sur le jeu sans être connecté | Adresse du jeu absente des Redirect URLs (étape 1.5). |
| Page 404 sur github.io | Pages pas encore activé, ou dépôt encore privé (étape 2). |

## Scripts SQL à coller dans Supabase (SQL Editor → New query → Run)

Tous peuvent être relancés sans danger (sauf `nettoyage.sql`, voir plus bas). Message attendu : « Success. No rows returned ».

| Ordre | Fichier | À quoi il sert |
|---|---|---|
| 1 | `supabase.sql` | Tables de base (sauvegardes, classement), règles d'accès, suppression de compte. |
| 2 | `classement-securise.sql` | Classement non falsifiable : les joueurs n'écrivent plus eux-mêmes dans `board`, tout passe par `board_submit()`. |
| 3 | `classement-allege.sql` | Lecture rapide du classement (100 meilleurs). Après le 2. |
| 4 | `retours-stats.sql` | Pouces 👍 👎, cartes jugées injustes, statistiques de victoire par carte. Indépendant des précédents. Lecture : Table Editor → schéma `public` → vues `v_taux_victoire_cartes`, `v_cartes_signalees`, `v_retours_par_jour`. |
| 5 | `comptes-fantomes.sql` | Supprime chaque nuit les comptes anonymes qui n'ont jamais joué (nécessite pg_cron). |
| à la demande | `nettoyage.sql` | **Ne pas le lancer en entier** : le bloc 2 vide les anonymes du classement. Le bloc 3 applique les durées de conservation (12 mois anonymes, 24 mois Google). |

## Ce qui a changé par rapport à l'artefact

- `cloud.js` remplace les services fournis par Claude (sauvegarde, classement, salon de duel) par Supabase.
- `config.js` contient l'adresse et la clé publique du projet Supabase.
- `vendor/supabase.js` est la bibliothèque Supabase (version 2.117.2), incluse pour ne dépendre d'aucun autre site.
- `index.html` : chargement de ces trois fichiers, bouton de connexion Google en bas de l'accueil, textes d'invitation adaptés. Le reste du jeu est identique.

## Mise à jour du 11 octobre : suppression de compte et conservation

- Relance **`supabase.sql`** (SQL Editor → Run) : il ajoute la fonction `delete_my_account()`, utilisée par le bouton « Supprimer mon compte » du jeu. Sans elle, le bouton affiche une erreur.
- Lance de temps en temps le bloc 3 de **`nettoyage.sql`** (ou planifie-le avec pg_cron, le script l'explique) : il applique les durées annoncées dans la page de confidentialité (12 mois pour les comptes anonymes, 24 mois pour les comptes Google).
- Écran de consentement Google : renseigne le lien de la politique de confidentialité (`https://kanoew.github.io/Duel-Helvara/confidentialite.html`) et celui des conditions (`.../conditions.html`).
- Supabase → Authentication → Rate Limits : limite les connexions anonymes par heure et par adresse IP.

- Relance `supabase.sql` une fois de plus : il ajoute la règle « supprimer sa propre sauvegarde » (policy DELETE sur `saves`), cohérente avec le classement. Sans danger, comme d'habitude.
