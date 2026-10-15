# holo-ul : carte holographique 2.5D

Effet visuel pour les **Ultra légendaires de faction** de Duel d'Helvara (4 cartes maximum prévues d'ici février).

La carte est découpée en 2 à 4 couches d'images (fond, plans intermédiaires, personnage). Quand on la survole ou qu'on glisse le doigt dessus, chaque couche bouge à sa vitesse, ce qui donne une impression de profondeur. Un foil irisé passe sur les zones dorées, et chaque carte a ses particules (pluie, étincelles, étoiles, pétales, cœurs).

Ce n'est pas de la vraie 3D : pas de WebGL, pas de bibliothèque, pas d'étape de build.

## Contenu du dossier

| Chemin | Rôle |
| --- | --- |
| `src/holo-card.js` | Le module. Un seul fichier, il injecte son propre CSS (classes préfixées `hc-`). |
| `examples/` | 5 cartes complètes : `nike`, `ananke`, `hedone`, `carla`, `nike-saint-valentin` (images de couches, masques de foil, `manifest.json`). |
| `demo/index.html` | Page de test des 5 cartes. |
| `tools/reference/` | Scripts Python qui ont servi à découper les exemples. Références, pas à exécuter tels quels. |
| `BRIEF.md` | Le brief de la session Code. |

## Voir le rendu

La démo charge des fichiers : il faut un petit serveur local, pas un double-clic.

```bash
cd holo-ul
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/demo/
```

## Utilisation

```js
import { HoloCard } from './holo-card.js';

// conteneur : un élément vide dont la largeur est fixée par le CSS du jeu
const holo = await HoloCard.load(conteneur, 'assets/holo/nom-de-la-carte/manifest.json');

// à la fermeture de la vue (obligatoire : sinon l'animation continue en fond)
holo.destroy();
```

Options (3e argument de `load`) :

| Option | Défaut | Effet |
| --- | --- | --- |
| `depth` | `1` | Amplitude de la parallaxe, de 0 à 2. `holo.setDepth(v)` pour changer ensuite. |
| `foil` | `0.7` | Intensité du foil, de 0 à 1. `holo.setFoil(v)` pour changer ensuite. |
| `idle` | `true` | La carte oscille doucement quand personne ne la touche. |
| `quality` | `'auto'` | `'low'` réduit les particules et la résolution du canvas. `'auto'` passe en `low` sur les machines faibles (2 cœurs ou 2 Go de mémoire, ou moins). |
| `radius` | `22` | Rayon des coins en px. À aligner sur le cadre des cartes du jeu. |
| `baseUrl` | dossier du manifest | Dossier qui contient les images, si elles ne sont pas à côté du manifest. |

`HoloCard.load` rejette la promesse si le manifest est introuvable : prévoir un `try/catch` et retomber sur l'image statique de la carte.

Le module respecte `prefers-reduced-motion` (pas de mouvement automatique, très peu de particules) et se met en pause quand la carte sort de l'écran ou que l'onglet est caché.

## Format de `manifest.json`

```json
{
  "aspect": [1060, 1580],
  "layers": [
    { "src": "layer0.webp", "amp": -0.003 },
    { "src": "layer1.webp", "amp": 0.0035,
      "foils": [ { "type": "prism", "mask": "foil1-0.webp" },
                 { "type": "gold",  "mask": "foil1-1.webp" } ] },
    { "src": "layer2.webp", "amp": 0.011,
      "foils": [ { "type": "gold", "mask": "foil2-0.webp" } ] }
  ],
  "backAfter": 1,
  "fx": {
    "back":  { "sparks": 50, "rain": 90 },
    "front": { "sparks": 26, "petals": 14, "hearts": 6 },
    "storm": false
  }
}
```

- **`aspect`** : largeur et hauteur des images (ratio 1060 par 1580, soit environ 2:3).
- **`layers`** : de l'arrière vers l'avant. Une couche est une image webp avec transparence (sauf la première, opaque).
  - **`amp`** : décalage maximum de la couche, en part de la largeur de la carte. Négatif pour le fond (il bouge en sens inverse), positif pour les plans proches. Valeurs utilisées : fond `-0.003`, plan lointain `0.0035`, plan moyen `0.004` à `0.006`, personnage `0.011`.
  - **`foils`** : effets de brillance appliqués par-dessus cette couche, uniquement là où le masque est opaque.
    - `gold` : reflet irisé et traînée lumineuse sur l'or (chaînes, miel, couronne, fissures).
    - `prism` : voile arc-en-ciel doux (ailes, plumes).
    - `shimmer` : reflet léger en superposition claire (écailles).
    - `volt` : éclairs bleu-blanc qui pulsent (veines électriques). Le masque dessine les éclairs ; l'effet clignote tout seul, sauf si `prefers-reduced-motion`.
  - **`flash`** (sur une couche) : éclair dans les nuages, à utiliser avec `storm`.
- **`backAfter`** : index de la couche après laquelle s'insère le canvas de particules du fond. Il passe derrière les couches suivantes.
- **`fx.back` / `fx.front`** : particules derrière ou devant le personnage.

| Clé | Particule |
| --- | --- |
| `sparks` | étincelles dorées qui montent |
| `stars` | étoiles qui scintillent (blanc et violet) |
| `rain` | pluie penchée |
| `petals` | pétales rouges qui tombent |
| `hearts` | cœurs roses qui flottent |
| `volt` | petites étincelles électriques bleues qui montent |

Les nombres sont des quantités à `quality: 'high'`.

Les masques de foil sont des webp blancs dont seul le canal alpha compte. Ils peuvent être en basse résolution (530 px de large), ils s'étirent sur la carte.

## Règles d'usage dans le jeu

- Uniquement sur les Ultra légendaires de faction qui ont un dossier `holo`. Les autres cartes gardent leur affichage actuel.
- Uniquement dans la vue détail (zoom) et à la révélation à l'ouverture de pack. Pas sur le plateau, la main, ni les listes : plusieurs cartes animées en même temps coûtent trop cher sur mobile.
- Charger le manifest et les images à la demande, jamais au démarrage. Environ 0,4 Mo par carte.
- Appeler `destroy()` à la fermeture de la vue.
- La carte déclare `touch-action: none` : un glissement du doigt sur la carte incline la carte et ne fait pas défiler la page. Prévoir de quoi faire défiler en dehors de la carte.

## Fabriquer les couches d'une nouvelle carte

Le découpage n'est pas automatique : il dépend de l'illustration (ailes, lit, serpent, etc.). Le plus simple est de le faire faire à Claude dans la conversation où ces exemples ont été créés : envoyer l'illustration finale, récupérer en retour un dossier `manifest.json` + images, le déposer dans `assets/holo/<nom-de-la-carte>/`.

Pour mémoire, la méthode utilisée :

1. Détourage du personnage avec `rembg` (modèle `isnet-general-use`), retouché à la main avec des zones polygonales pour les ailes ou le décor.
2. Fond reconstruit derrière le personnage (remplissage flou) pour qu'il n'y ait pas de trou quand les couches bougent.
3. Masques de foil calculés à partir des teintes dorées de l'image, limités à chaque couche.
4. Export en webp (couches à 1060 px de large, masques à 530 px).

Les scripts de `tools/reference/` montrent cette chaîne pour hedone, ananke, nike-saint-valentin et carla (`seg_all.py` produit le détourage (`c5.py` = carla), `lib.py` contient les fonctions communes). Ils attendent la structure `cards/cN/src.webp` et ne sont pas prévus pour tourner tels quels.
