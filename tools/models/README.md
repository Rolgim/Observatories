# Chaîne de préparation des maquettes

Les fichiers `models/*.glb` du site sont produits ici à partir des maquettes d'origine, qui ne sont pas dans le dépôt.

| Maquette | Source à télécharger | Traitement |
|---|---|---|
| Euclid | jeu de données Gaia Sky `spacecraft-euclid` (OBJ, modèle ESA SciFleet) | OBJ → glTF, textures 2048 px JPEG, soudure, redécoupage (`euclid_cls.js`), quantification |
| Gaia | jeu de données Gaia Sky `mission-gaia` (OBJ, Toni Sagristà) | `map_Kn` → `map_Bump` dans le .mtl pour garder les cartes de normales, OBJ → glTF, quantification ; les pièces sont les objets nommés du fichier |
| JWST | NASA 3D Resources, « James Webb Space Telescope (B) » (GLB Draco) | décodage Draco (`gltf-transform copy`), soudure → `jwst_src.glb`, redécoupage (`jwst_cls.js`), quantification |
| Hubble | jeu de données Gaia Sky `spacecraft-hst` (modèle NASA VTAD) | textures 1024 px → `hst_tex.glb`, redécoupage (`seg_hst.js`), quantification |

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
