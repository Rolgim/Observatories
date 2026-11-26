# Socle commun

Code partagé par les sites de la série (SolarExplorers, EarthObservers, puis les suivants). Il est développé **ici seulement**, puis copié dans chaque site par `node socle/sync.js`. Chaque site note la version copiée dans `socle.lock.json`, et son workflow « Tests » lance `node socle/check.js`, qui échoue si un fichier du socle a été modifié sur place.

Le socle est intégré à chaque `index.html` au moment de la construction : aucun site ne le charge en ligne depuis un autre, donc une erreur ici ne casse pas un site déjà publié.

| Chemin | Rôle |
|---|---|
| `build.js` | construction : lit `site.json` du site et assemble `src/` et `page/` en un seul `index.html` (ou `dist/` pour l'artifact) |
| `page/` | code de la page commun aux sites : langue (`lang.js`), traduction (`i18n.js`), données vivantes (`live.js` : avertissement quand une mise à jour automatique prend du retard), visionneuse 3D (`viewer.js`), boîte à outils de la page « Mission et instruments » (`missionkit.js` : nombres, sources numérotées, couverture spectrale, briques, boutons Copier), liens vers la fiche du lanceur sur le site Lanceurs (`launchlinks.js` : `LaunchLinks.html(h)` relie « Ariane 5 », « Falcon 9 », « Soyouz-Frégate depuis Kourou »… dans un texte déjà échappé), schémas « Trajet de la lumière » (`optics.js`, qui lit `OPTICS_SITE` défini par le site dans `src/optics-data.js`), styles (`style.css`, `inst.css`). Les jetons `{{langKey}}`, `{{mark}}`, `{{mark3d}}` sont remplacés par les valeurs de `site.json` |
| `tools/` | tests dans un vrai navigateur : serveur local (`serve.js`), accessibilité (`a11y.js`), traduction (`i18n-scan.js`), captures (`shot.js`). Le site garde dans `tools/` de petits fichiers qui les appellent, sa liste de pages (`tools/pages.js`) et son parcours propre (`tools/smoke.js`) |
| `models/` | outils de maquettes 3D : redécoupage en pièces (`seg_lib.js`), îlots (`dump.js`, `islands.js`, `cls_view.js`, `render.py`), allègement (`slim.mjs`, `slimtex.mjs`, `notex.mjs`, `split_mats.mjs`), schémas de principe (`schema.mjs`). `cd socle/models && npm ci` une fois ; `node_modules` n'est pas compté par `check.js` (et `sync.js` l'efface) |
| `data/` | registre des crédits : `credits_lib.py` (parties communes de `tools/data/credits.py` de chaque site : transformations, polices, code, écriture de `CREDITS.md` et `data/credits.json`) ; données vivantes : `check_links.py` vérifie chaque mois toutes les adresses citées et le texte des pages de licence (workflow « Liens et licences » des sites) ; `watch_missions.js` relève chaque semaine les indices de fin de mission (plus de TLE, plus d'éphéméride Horizons, plus de données dans les archives) sans jamais modifier le registre (workflow « Fins de mission ») |
| `check.js`, `sync.js` | contrôle de la copie, mise à jour de la copie |

## `site.json`

| Clé | Rôle |
|---|---|
| `name`, `title`, `artifactTitle`, `description` | nom du dépôt, titre anglais (page), titre français (artifact), description |
| `langKey` | clé `localStorage` de la langue (`sse-lang`, `eo-lang`…) |
| `mark`, `mark3d` | couleur de surlignage (CSS) et teinte de la pièce choisie dans la vue 3D (`0x…`) |
| `fonts`, `headExtra` | balise des polices ; ajouts libres dans `<head>` |
| `css`, `js` | fichiers dans l'ordre : `socle:x` = `socle/page/x`, `@data` = `data/*.json`, `@registry` = le registre, sinon `src/x` |
| `scripts` | scripts externes (CDN), versions figées ; servis depuis `VENDOR/` pendant les tests hors ligne |
| `registry` | registre des maquettes : `file` dans `src/`, `check` = motif qui doit s'y trouver |

## Changer le socle

1. Modifier `socle/` dans ce dépôt, sur une branche.
2. Dans chaque site : `node socle/sync.js --from ../rolgim.github.io` (clone local), puis les tests du site.
3. Une fois la branche du socle fusionnée : `node socle/sync.js` dans chaque site (copie depuis `main`), commit de `socle/`, `socle.lock.json` et `index.html` ensemble.

Ce dossier n'est pas publié sur https://rolgim.github.io/ : le workflow Pages de ce dépôt ne copie que la page d'accueil.

Licence : Apache 2.0, comme le reste du dépôt.
