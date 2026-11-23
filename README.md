# Observatoires en orbite

**Version 1.0 (23 novembre 2026, tag `v1.0`).**

*Observatories in orbit: an interactive 3D guide to eighteen space observatories, from Hubble, Compton and Chandra to Webb, Euclid and Roman, in English (default) and French.*

Visualisation 3D de dix-huit observatoires spatiaux (Hubble, Compton, Chandra, XMM-Newton, WMAP, INTEGRAL, Spitzer, Swift, Fermi, Kepler, Herschel, Planck, Gaia, TESS, CHEOPS, JWST, Euclid, Roman), pour un public allant de l'étudiant à l'expert. Toute valeur affichée est sourcée ; ce qui est schématique ou indicatif est signalé comme tel.

- **Vue 3D** : maquettes réelles redécoupées en pièces cliquables, vue éclatée, éclairage « Soleil réel », vue en coupe avec intérieurs reconstruits, déploiement de Webb et ouverture du pare-soleil de Gaia pas à pas, comparaison des tailles à l'échelle, avec une silhouette humaine pour référence.
- **Fiche par observatoire** : chiffres clés, description, schéma d'orbite, tableaux de caractéristiques avec appels de note.
- **Accueil, le ciel observé** : carte du ciel entier sur fond Gaia (ESA) où chaque observatoire laisse l'empreinte de ses pointés réels (MAST, HEASARC, archive Euclid), curseur des années, zoom, clic pour savoir qui a observé un point du ciel.
- **En-tête** : Télescopes, Ciel, Comparer et Flotte, toujours en haut à droite.
- **Flotte** : frise chronologique de tous les observatoires, filtrable par agence, état, domaine, orbite et type de mission, et « qui a fait quoi », chaque ligne sourcée.
- **Mission et données**, une page par observatoire :
  - déroulé de la mission et chaîne de traitement des données ;
  - trajet de la lumière (schéma optique, plan focal à l'échelle) ;
  - orbite (trajectoire réelle, y compris autour du Soleil pour Spitzer et Kepler, en résonance avec la Lune pour TESS, position de Hubble, de Fermi et de CHEOPS en direct, ciel observable, carte des pointés réels) ;
  - une fiche par instrument (49 au total) : couverture spectrale, champ de vue, filtres, produits de données, observation réelle, code d'accès (astroquery, ADQL), liens vers les archives ;
  - une page de comparaison de tous les instruments.
- Anglais par défaut et français, thèmes clair et sombre, mise en page téléphone, liens directs par ancre (`#jwst`, `#roman-instruments`, `#comparer`, `#en-euclid`…).

Site statique, sans serveur. Dépendances à l'exécution : three.js r128 et son chargeur glTF (CDN) ; satellite.js 5.0.0, chargé seulement sur la page d'orbite de Hubble.

Pour le lancer en local : `python3 -m http.server` puis ouvrir http://localhost:8000.

## Organisation du dépôt

| Chemin | Rôle |
|---|---|
| `index.html`, `models/*.glb` | le site tel qu'il est servi par GitHub Pages |
| `build.js` | `node build.js` assemble `src/` en `index.html` (aucune dépendance) ; `node build.js artifact` produit une variante dans `dist/` (maquettes encodées en base64) |
| `src/data-tele.js` | **registre des observatoires** (`TELESCOPES`) : fiche, pièces, réglages de la maquette, place dans les comparaisons |
| `src/data-inst.js`, `src/data-mission.js` | instruments ; déroulé des missions et chaînes de traitement |
| `src/optics.js`, `src/orbits.js` | trajet de la lumière et plans focaux ; orbites, ciel observable, pointés |
| `src/inst-render.js` | rendu des pages « Mission et données » et de la comparaison des instruments |
| `src/app.js` | application 3D et panneau latéral ; ne contient rien de propre à un observatoire |
| `src/looks.js`, `src/interior.js`, `src/deploy.js` | rendu des matériaux par maquette ; intérieurs de la vue en coupe ; déploiements (Webb, Gaia) |
| `src/en/`, `src/i18n.js`, `src/lang.js` | version anglaise : textes anglais et leur application |
| `src/glossary.js` | définitions affichées au survol des termes techniques |
| `data/` | données réelles (observations, trajectoires, pointés, TLE de Hubble) ; produites par les scripts de `tools/data/`, ne pas modifier à la main |
| `tools/data/` | `fetch_data.py` (observations, aperçus légers), `fetch_orbits.py` (JPL Horizons), `fetch_sky.py` (pointés MAST, relevé Euclid), `fetch_tle.py` (CelesTrak, Hubble et Fermi) |
| `tools/probe/` | sondes qui montrent ce qu'expose une archive, sans rien écrire dans le dépôt |
| `tools/models/` | conversion, allègement et redécoupage des maquettes ; **procédure d'ajout d'un observatoire** dans son `README.md` |
| `tools/smoke.js`, `tools/a11y.js` | tests dans un vrai navigateur (Playwright) : parcours du site, registre complet, traduction ; accessibilité WCAG 2.1 A et AA (axe-core) |
| `tools/shot.js`, `tools/i18n-scan.js`, `tools/deploy-check.js` | captures d'écran ; textes non traduits ; collisions pendant un déploiement |
| `SPECS.md` | spécifications : état, évolutions livrées et à venir |

Après une modification dans `src/`, relancer `node build.js` et commiter `index.html` avec les sources : le workflow « Tests » vérifie que les deux correspondent.

## Intégration continue

| Workflow | Quand | Rôle |
|---|---|---|
| Tests | à chaque push touchant le site | `index.html` à jour, `tools/smoke.js`, `tools/a11y.js` |
| Données réelles | chaque jour, et à chaque push des scripts | TLE de Hubble et de Fermi, trajectoires JPL Horizons, observations manquantes ou périmées |
| Pointés réels | à la demande, et à chaque push de `fetch_sky.py` | pointés de Hubble et de JWST (MAST), de Chandra, XMM-Newton, Swift, INTEGRAL, Spitzer et Herschel (HEASARC), avancée du relevé Euclid ; puis `sky_all.py` en tire `data/sky-all.json`, la carte de l’accueil |
| Sonde | à la demande | lance un script de `tools/probe/` |

Pour lancer les tests en local : `npm install --no-save playwright@1.56.0 axe-core@4.10.2`, `npx playwright install chromium`, puis `node tools/smoke.js` et `node tools/a11y.js`.

## Ajouter un observatoire

Une entrée dans le registre `TELESCOPES` (`src/data-tele.js`), une maquette dans `models/`, puis ses textes et leur traduction ; `src/app.js` n'a pas à changer. La procédure complète est dans [`tools/models/README.md`](tools/models/README.md). Le test `tools/smoke.js` liste ce qui manque à une entrée.

## Crédits des maquettes 3D

| Observatoire | Source |
|---|---|
| Hubble | NASA Visualization Technology Applications and Development (VTAD), jeu de données Gaia Sky |
| JWST | NASA 3D Resources |
| Euclid | ESA SciFleet (https://scifleet.esa.int/model/euclid), jeu de données Gaia Sky |
| Gaia | Toni Sagristà, Gaia Sky |
| Chandra | NASA 3D Resources, « Chandra X-ray Observatory » |
| Spitzer | NASA 3D Resources, « Spitzer Space Telescope » |
| Fermi | NASA 3D Resources, « Fermi Gamma-ray Large Area Space Telescope » |
| XMM-Newton | ESA, service SPICE (maquette pour Cosmographia, `misc/cosmo/xmm.obj`) ; aucune licence indiquée, créditée à l'ESA |
| Kepler | NASA 3D Resources, « Kepler (A) » |
| TESS | NASA 3D Resources, « Transiting Exoplanet Survey Satellite (TESS) (B) » |
| Roman | NASA 3D Resources, « Nancy Grace Roman Space Telescope (A) » (conception de 2015) |

Les maquettes ont été converties en glTF binaire, allégées et redécoupées en pièces physiques. Leurs droits restent ceux de leurs auteurs :

- Gaia : jeu de données créé par le projet Gaia Sky, sous licence CC BY 4.0 (https://gaiasky.space/licenses/).
- Hubble, Chandra, Spitzer, Fermi, Kepler, TESS, JWST et Roman : contenus NASA, non soumis au droit d'auteur aux États-Unis ; voir les consignes d'utilisation des médias de la NASA.
- Euclid : © ESA. Aucune licence explicite n'est affichée par SciFleet pour ce modèle ; il est repris ici à des fins éducatives et non commerciales, avec crédit.

Les intérieurs de la vue en coupe sont reconstruits à partir de sources publiées (citées dans le site) ; leurs emplacements sont indicatifs.
