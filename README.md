# Observatoires en orbite

Visualisation 3D de quatre télescopes spatiaux (Hubble, JWST, Euclid, Gaia) : pièces cliquables, vue éclatée, éclairage solaire réel, comparaison à l'échelle, et une page « Instruments et données » par observatoire (couverture spectrale, champs de vue, filtres, produits de données, accès aux archives).

Site statique, sans serveur. Dépendance à l'exécution : three.js r128 (CDN).

Pour le lancer en local : `python3 -m http.server` puis ouvrir http://localhost:8000.

## Organisation du dépôt

| Chemin | Rôle |
|---|---|
| `index.html`, `models/*.glb` | le site tel qu'il est servi par GitHub Pages |
| `src/` | sources : styles, structure de la page, données (`data-tele.js`, `data-inst.js`), rendu des pages d'instruments, application 3D |
| `build.js` | `node build.js` assemble `src/` en `index.html` (aucune dépendance) |
| `data/` | observations réelles affichées dans les fiches d'instrument ; produit par `tools/data/fetch_data.py` (workflow « Données réelles »), ne pas modifier à la main |
| `tools/data/fetch_data.py` | télécharge les observations dans les archives (MAST, ESA) et en tire des aperçus légers |
| `tools/data/fetch_orbits.py` | trajectoires réelles des observatoires de L2 (JPL Horizons) → `data/orbits.json` |
| `tools/shot.js` | captures d'écran et tests dans un vrai navigateur (Playwright) |
| `tools/models/` | conversion et redécoupage des maquettes 3D en pièces |
| `SPECS.md` | spécifications des évolutions prévues |

Après une modification dans `src/`, relancer `node build.js` et commiter `index.html` avec les sources.

## Crédits des maquettes 3D

| Observatoire | Source |
|---|---|
| Hubble | NASA Visualization Technology Applications and Development (VTAD), jeu de données Gaia Sky |
| JWST | NASA 3D Resources |
| Euclid | ESA SciFleet (https://scifleet.esa.int/model/euclid), jeu de données Gaia Sky |
| Gaia | Toni Sagristà, Gaia Sky |

Les maquettes ont été converties en glTF binaire, allégées et redécoupées en pièces physiques. Leurs droits restent ceux de leurs auteurs :

- Gaia : jeu de données créé par le projet Gaia Sky, sous licence CC BY 4.0 (https://gaiasky.space/licenses/).
- Hubble et JWST : contenus NASA, non soumis au droit d'auteur aux États-Unis ; voir les consignes d'utilisation des médias de la NASA.
- Euclid : © ESA. Aucune licence explicite n'est affichée par SciFleet pour ce modèle ; il est repris ici à des fins éducatives et non commerciales, avec crédit.
