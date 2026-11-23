# Lire le code d'Observatoires en orbite

Guide de lecture, à jour à la version 1.0. Il dit où se trouve chaque chose et dans quel ordre lire. Le détail de chaque fonction est dans les commentaires en tête des fichiers.

## En une phrase

Un site statique sans framework : `node build.js` concatène les fichiers de `src/` dans un seul `index.html`. La page charge three.js (r128) pour la 3D, lit des registres JavaScript pour tout le contenu, et des fichiers JSON et JPEG de `data/` pour les vraies observations. L'intégration continue (GitHub Actions) fabrique ces fichiers à partir des archives.

## Ordre de lecture conseillé

1. `build.js` : 40 lignes. Il montre l'ordre de chargement des scripts, qui compte car tout partage la même portée globale.
2. `src/body.html` : le squelette de la page et ses zones (`#top` pour l'en-tête, `#main` qui contient `#stage` pour la 3D, `#panel` pour la fiche, `#home-page` et `#inst-page`).
3. `src/data-tele.js` : le registre `TELESCOPES`. Le commentaire en tête décrit chaque champ. Tout le reste part de là.
4. `src/app.js` : l'état, la navigation, la fiche et la 3D (sections ci-dessous).
5. Les pages : `src/inst-render.js` (Mission et données, Comparer), `src/home.js` (Ciel), `src/fleet.js` (Flotte).
6. La traduction : `src/lang.js` puis `src/i18n.js`.

## Ordre de chargement (build.js)

| Ordre | Fichier | Ce qu'il définit |
|---|---|---|
| 1 | three.min.js, GLTFLoader.js | `THREE`, chargés depuis un CDN |
| 2 | `lang.js` | `OBS_LANG` (fr ou en), `OBS_NUM` (format des nombres) |
| 3 | `data-tele.js` | `TELESCOPES`, `DOMAINS`, `ORBIT_FAMILIES`, `MISSION_TYPES`, `OBS_CMP`, `cmpSelector()`, `domRow()` |
| 4 | `data-fleet.js` | `FLEET`, `FLEET_REFS`, `fleetRefs()`, `fleetAgencies()` |
| 5 | `data-inst.js` | `INST_DATA` (instruments, filtres, produits, archives), `INST_TYPES` |
| 6 | `data-mission.js` | `MISSION` (déroulé, opérations, chaîne de traitement) |
| 7 | `optics.js` | `Optics` : schémas du trajet de la lumière (`FIG`), plans focaux (`FP`), liens vers la 3D (`LINK3D`) |
| 8 | `orbits.js` | `Orbits` : orbites animées sur canevas, position en direct (TLE et SGP4), ciel observable, pointés |
| 9 | `inst-render.js` | `InstrumentsUI` : rendu de la page Mission et données et de Comparer |
| 10 | `fleet.js`, `home.js` | `FleetUI`, `HomeUI` |
| 11 | `en/tele.js`, `en/inst.js`, `en/more.js`, `en/ui.js` | les textes anglais : `EN_TELE`, `EN_INST`, `EN_OPTICS`, `EN_ORBITS`, `EN_REAL`, `EN_UI`, `EN_RULES` |
| 12 | `i18n.js` | applique l'anglais (voir plus bas) ; définit `OBS_T()` |
| 13 | `glossary.js`, `interior.js`, `deploy.js`, `looks.js` | infobulles du glossaire, éléments de la vue en coupe, animations de déploiement, réglages des matériaux par maquette |
| 14 | `app.js` | tout le reste, et le démarrage |

`node build.js artifact` produit une variante dans `dist/` pour l'artifact claude.ai : sans `<html>` ni `<head>`, avec les maquettes encodées en base64 (`models/*.txt`).

## app.js, section par section

| Lignes (environ) | Rôle |
|---|---|
| 1–30 | Utilitaires (`$`, `esc`, `tele`, `fr`) et l'état `S` : mode (`tele` ou `compare`), observatoire `id`, `inst` (page Mission et données ouverte), `home`, `fleet`, pièce choisie, réglages 3D (`sunReal`, `spin`, `explode`, `cut`). |
| 30–170 | Fiche : `orbitSvg()` (schéma d'orbite animé ; `keplerDot()` fait tourner le point à la vitesse de Kepler), `facts()` (chiffres clés), appels de note et sources (`refNums`, `refMark`, `refList`), `missionHtml()` (Qui a fait quoi). |
| 170–260 | En-tête et panneau : `viewsHtml()` (boutons Télescopes, Ciel, Comparer, Flotte), `renderTabs()` (domaines puis observatoires), `renderPanel()` (fiche, pièces, mission), `renderHud()`. |
| 260–355 | Pages : `renderInst()` (Mission et données, Comparer, Flotte dans `#inst-page`), `loadReal()` (vraies observations depuis `data/manifest.json`), gestionnaires de clics, Échap. |
| 355–420 | `route()` : lit `location.hash` (`#hubble`, `#hubble-instruments`, `#comparer`, `#flotte`, `#accueil` ; préfixe `en-` ou `fr-` facultatif) et met tout l'affichage à jour. Puis `selectPart()`. |
| 420–660 | Scène three.js : décor (étoiles, Terre, panneau d'aide), lumière « studio » et « Soleil réel » (`applyLighting`), chargement des maquettes (`fetchModel`, `prepare` qui découpe en pièces d'après les noms de nœuds), vue éclatée (`setExplode`), surlignage. |
| 660–790 | Caméra et contrôles (`C`, `frame`, souris, toucher, molette), sélection au clic (`pick`, `clickAt`, `hoverAt`), vue en coupe (`applyCut`). |
| 790–850 | Déploiement pas à pas (`depShow`, `depToggle`), écran de chargement. |
| 850–950 | Comparaison des tailles en 3D (`layoutCompare`), préchargement des autres maquettes. |
| 950–1029 | Redimensionnement, boucle d'animation `tick()`, démarrage (`route()`). |

## Les registres : où changer quoi

| Pour changer… | Fichier | Clé |
|---|---|---|
| Une valeur de fiche, une source | `src/data-tele.js` | `TELESCOPES[i].sections[].rows` (le 3e élément d'une ligne est la clé de `refs`) |
| Le nom ou le texte d'une pièce 3D | `src/data-tele.js` | `parts[]` (`key` = nom du nœud dans la maquette) |
| Un instrument, ses filtres, ses produits | `src/data-inst.js` | `INST_DATA[id].instruments[]` |
| Le déroulé de la mission | `src/data-mission.js` | `MISSION[id]` |
| « Qui a fait quoi », dates de vie | `src/data-fleet.js` | `FLEET[id]` |
| Un schéma du trajet de la lumière | `src/optics.js` | `FIG[id]`, `TEXT[id]`, `FP[id]` |
| Les textes d'orbite | `src/orbits.js` | `TEXT[id]` |
| Le rendu des matériaux d'une maquette | `src/looks.js` | `LOOKS[id]` |
| La traduction anglaise | `src/en/*.js` | même structure que le français, par `id` |

## La traduction

Le français est écrit dans les sources ; l'anglais est la langue par défaut.

1. `lang.js` choisit la langue : préfixe du lien (`#en-…`, `#fr-…`), sinon le choix mémorisé, sinon l'anglais.
2. En anglais, `i18n.js` remplace d'abord les champs structurés (fiches, pièces, instruments, optique, orbites) par ceux de `src/en/`, avant le premier rendu.
3. Les textes écrits directement dans le code passent par `OBS_T()`. Un `MutationObserver` traduit aussi chaque nœud de texte ajouté à la page, à partir du dictionnaire `EN_UI` puis des expressions régulières `EN_RULES`.
4. `tools/i18n-scan.js` parcourt le site en anglais et liste les chaînes restées en français.

## Les données réelles

| Script (tools/data/) | Écrit dans data/ | Lancé par |
|---|---|---|
| `fetch_data.py` | `manifest.json` et un fichier par recette (`hubble-wfc3.jpg`, `fermi-lat.json`…) | workflow « Données réelles », chaque jour (recettes manquantes) ou à la demande |
| `fetch_orbits.py` | `orbits.json` (JPL Horizons) | même workflow |
| `fetch_tle.py` | `*-tle.json` (CelesTrak) | même workflow |
| `fetch_sky.py`, puis `sky_all.py` | `sky.json` (pointés par instrument et par année), `sky-all.json` (carte de l'accueil) | workflow « Pointés réels » |
| `fetch_skybg.py` | `sky-gaia.jpg`, `sky-gaia.json` (fond du Ciel) | workflow « Pointés réels » |

Une recette est une fonction indépendante, déclarée dans `RECIPES`. Elle télécharge un produit réel, en tire un aperçu léger et renvoie une entrée de manifeste (titre, légende, métadonnées, crédit, date). Une recette en échec est sautée ; rien n'est inventé.

Le bac à sable de Claude n'atteint pas les archives. Pour explorer une archive, on écrit un script dans `tools/probe/` et on lance le workflow « Sonde » ; sa sortie arrive sur la branche `probe-out`.

## Les maquettes

`models/*.glb` sont fabriqués par `tools/models/build_models.sh` à partir des fichiers d'origine, qui ne sont pas dans le dépôt. Les étapes sont la conversion, la soudure, le redécoupage en pièces par un classifieur par maquette (`*_cls.js`, avec `seg_lib.js`), l'allègement et la quantification. Tout est détaillé dans `tools/models/README.md`. Outils de contrôle : `view.js` (six vues), `zfind.mjs` et `zfix.mjs` (faces superposées qui scintillent).

## Les tests

| Commande | Vérifie |
|---|---|
| `node tools/smoke.js` | parcours complet au bureau et au téléphone, complétude du registre, Flotte, Ciel, pages d'instruments, traduction |
| `node tools/a11y.js` | accessibilité WCAG 2.1 A et AA (axe-core) sur les pages principales |
| `node tools/i18n-scan.js` | chaînes non traduites |
| `node tools/shot.js '[…]'` | captures d'écran scriptées (dossier `shots/`) |

Ils demandent Playwright et Chromium (voir le README). Le workflow « Tests » les lance à chaque push touchant le site.

## Conventions

- Pas de framework ni de module : chaque fichier ajoute des variables globales. Les modules d'interface sont des fonctions immédiates qui renvoient un objet (`HomeUI`, `FleetUI`, `InstrumentsUI`, `Optics`, `Orbits`).
- Le HTML est produit par concaténation de chaînes ; tout texte venu des données passe par `esc()`.
- Couleurs : jetons CSS dans `style.css` (`--paper`, `--ink`, `--mark`…), thèmes clair et sombre.
- Toute valeur affichée renvoie à une source (`refs` de chaque observatoire). Ce qui est approché est écrit « ≈ » ou signalé dans la légende.
- Commentaires et noms de variables en français ; les identifiants de données (`hubble`, `wfc3`) en minuscules sans accent.
