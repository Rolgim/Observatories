# Chaîne de préparation des maquettes

Les fichiers `models/*.glb` du site sont produits ici à partir des maquettes d'origine, qui ne sont pas dans le dépôt.

| Maquette | Source à télécharger | Traitement |
|---|---|---|
| Euclid | jeu de données Gaia Sky `spacecraft-euclid` (OBJ, modèle ESA SciFleet) | OBJ → glTF, textures 2048 px JPEG, soudure, redécoupage (`euclid_cls.js`), quantification |
| Gaia | jeu de données Gaia Sky `mission-gaia` (OBJ, Toni Sagristà) | `map_Kn` → `map_Bump` dans le .mtl pour garder les cartes de normales, OBJ → glTF, quantification ; les pièces sont les objets nommés du fichier |
| JWST | NASA 3D Resources, « James Webb Space Telescope (B) » (GLB Draco) | décodage Draco (`gltf-transform copy`), soudure → `jwst_src.glb`, redécoupage (`jwst_cls.js`), quantification |
| Hubble | jeu de données Gaia Sky `spacecraft-hst` (modèle NASA VTAD) | textures 1024 px → `hst_tex.glb`, redécoupage (`seg_hst.js`), quantification |
| Roman | NASA 3D Resources, « Nancy Grace Roman Space Telescope (A) » (GLB Draco, conception AFTA 2015) | décodage Draco, soudure, simplification (`--ratio 0.08 --error 0.004`), redécoupage (`roman_cls.js`), puis `slim.mjs` : simplification sur les seules positions, normales recalculées par face, quantification (≈ 3 Mo au lieu de 7,8) |

## Redécoupage en pièces

Les fichiers d'origine sont découpés par texture ou d'un seul bloc, pas par pièce physique. `seg_lib.js` :

1. soude les sommets par position et calcule les îlots connexes de chaque primitive ;
2. appelle un classifieur `classify(îlot, nomDuNœud, nomDuMatériau)` qui renvoie le nom de la pièce (centre, boîte englobante et matériau de l'îlot à l'appui) ;
3. écrit un nœud par pièce et par matériau, nommé d'après la pièce.

Le site retrouve ensuite les pièces par le nom des nœuds (`key` ou `nodes` dans `src/data-tele.js`).

Outils de mise au point : `dump.js` (liste des îlots en JSON), `render.py` (rendu logiciel six vues, coloré par classe), `cls_view.js`, `euclid_cls.py`.

## Points d'attention

- Le site décode les maquettes sans Draco (pas de décodeur chargé) : seule l'extension `KHR_mesh_quantization` est utilisée.
- three.js r128 ne dénormalise pas les attributs entiers côté CPU ; `src/app.js` convertit donc les positions en flottants au chargement pour que le clic sur une pièce tombe juste.

## Ajouter un observatoire

`src/app.js` n'a pas à changer : tout part du registre `TELESCOPES` de `src/data-tele.js`, que lisent aussi `build.js` et `tools/smoke.js`.

1. Maquette : convertir et redécouper (ci-dessus), déposer `models/<id>.glb`. Licence claire obligatoire (exigence G1).
2. `src/data-tele.js` : une entrée avec `id`, noms, `file`, `axis`, `size`, `view`, `sun`, `orbit` (`leo` ou `l2`), `cmp`, `parts`, `sections` et les champs de registre décrits en tête du fichier (`color`, `highlight`, `footprint`, `optical`, `compare`, éventuellement `ended`).
3. `src/looks.js` : réglage des matériaux si la maquette rend mal sous l'éclairage du site (facultatif).
4. `src/deploy.js` : si l'observatoire s'est déployé en vol, `deploy:true` dans le registre et une configuration dans `DEPLOY[id]` (étapes datées, pièces déformées, fonction de repliement) ; contrôle par `tools/deploy-check.js 0.25 <id>` (facultatif).
4. `src/interior.js` : éléments internes pour la vue en coupe et, si besoin, plans de coupe propres (`CUT`) (facultatif).
5. Textes et données : `INST_DATA` (`src/data-inst.js`), `MISSION` (`src/data-mission.js`), `TEXT`, `FP` et `LINK3D` (`src/optics.js`), `TEXT` (`src/orbits.js`) ; pages d'instruments propres à l'observatoire dans `src/inst-render.js` si un instrument a besoin d'une figure particulière.
6. Anglais : `EN_TELE`, `EN_INST`, `EN_OPTICS`, `EN_ORBITS`, et les chaînes d'interface nouvelles dans `src/en/ui.js`.
7. Données réelles : identifiant JPL Horizons dans `tools/data/fetch_orbits.py` pour un observatoire à L2, recettes d'exemples dans `tools/data/fetch_data.py`.
8. `node build.js`, puis `tools/smoke.js` : le test vérifie que chaque observatoire du registre a ses champs et ses textes, et en donne la liste manquante.
