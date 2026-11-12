# Observatoires en orbite

Visualisation 3D de quatre télescopes spatiaux (Hubble, JWST, Euclid, Gaia) : pièces cliquables, vue éclatée, éclairage solaire réel, comparaison à l'échelle, et une page « Instruments et données » par observatoire (couverture spectrale, champs de vue, filtres, produits de données, accès aux archives).

Site statique, sans étape de build : `index.html` + `models/*.glb`. Dépendance : three.js r128 (CDN).

Pour le lancer en local : `python3 -m http.server` puis ouvrir http://localhost:8000.

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
