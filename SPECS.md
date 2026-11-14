# Observatoires en orbite : spécifications pour la suite

Document de travail. Il décrit l'état actuel, le public visé, puis les évolutions envisagées, chacune avec son besoin, ses exigences et ses critères d'acceptation. Les priorités et les questions ouvertes sont à trancher avant de commencer un lot.

## 1. Objet et public

Le site présente des télescopes spatiaux en 3D et explique comment ils sont construits, ce qu'ils mesurent et comment accéder à leurs données.

Public visé : **de l'étudiant à l'expert**. Conséquences sur tout le contenu :

- **Deux niveaux de lecture.** Chaque fiche se comprend sans prérequis (phrases complètes, termes définis à leur première apparition) et donne en dessous les valeurs exactes qu'un expert vient chercher (unités, tolérances, références).
- **Rien d'approximatif sans le dire.** Une valeur arrondie, estimée ou schématique est signalée comme telle. C'est déjà le cas pour les exemples de données (« données réelles » ou « structure réelle, valeurs illustratives ») et pour la largeur des filtres.
- **Toute valeur a une source.** Un expert doit pouvoir vérifier ; un étudiant doit pouvoir aller plus loin.

## 2. État actuel (novembre 2026)

- Quatre observatoires : Hubble, JWST, Euclid, Gaia.
- Vue 3D : maquettes réelles redécoupées en pièces cliquables (8, 10, 6 et 7 pièces), vue éclatée, éclairage « Soleil réel », Terre sous Hubble, comparaison des tailles à l'échelle.
- Fiche par observatoire : chiffres clés, description, schéma d'orbite, cinq tableaux de caractéristiques.
- Instruments et données : 15 instruments ; couverture spectrale, champs de vue à l'échelle, filtres, produits de données, exemple, code d'accès (astroquery, ADQL), liens vers les archives ; comparaison des instruments entre observatoires.
- Thèmes clair et sombre, mise en page téléphone, liens directs par ancre (`#jwst`, `#jwst-instruments`, `#comparer`, `#comparer-instruments`).
- Site statique sans serveur : `node build.js` assemble `src/` en `index.html`. Chaîne de préparation des maquettes dans `tools/models/`.

Limites connues :

- Les fiches des observatoires sont sourcées depuis le 13 novembre 2026. Les pages d'instruments, les descriptions des pièces et les textes d'optique et d'orbite ne le sont pas encore (seules les valeurs d'Euclid contredites par l'article de référence y ont été corrigées).
- Licence de la maquette Euclid (ESA SciFleet) non établie.
- Vérifications faites en local uniquement (Chromium, bureau et téléphone émulé) ; aucun test automatique dans le dépôt en dehors de `tools/shot.js`.
- Pas d'accès clavier aux pièces dans la vue 3D (la liste « Pièces » sert d'équivalent).

## 3. Évolutions

**Décisions (12 novembre 2026).** On commence par le visible : lots **D, puis E, puis F**. Le site sera en **français et en anglais** (H4). Les lots A et B (fiabilisation et sources) viennent ensuite ; d'ici là, tout nouveau contenu dit explicitement ce qui est exact et ce qui est schématique.

| Lot | État |
|---|---|
| D. Trajet de la lumière | D1, D2 et D3 livrés en première version ; D4 à faire |
| E. Vraies données | E1 et E2 livrés : image ou spectre réel pour 13 instruments sur 15 ; E3 non commencé |
| F. Orbites et temps | F1 et F2 livrés (orbites réelles, comparaison, pointés réels) ; F3 et F4 à faire |
| H4. Anglais | livré : tout le site est disponible en anglais ; relecture par un anglophone du domaine souhaitable |
| A et B (fiches) | fiches des quatre observatoires vérifiées et sourcées le 13 novembre 2026 ; pages d'instruments et pièces à faire |
| C, G, autres H | plus tard |

### A. Fiabiliser le contenu

**Besoin.** Un expert doit pouvoir se fier à chaque valeur.

**Exigences**

- A1. Relire toutes les valeurs de `src/data-tele.js` et `src/data-inst.js` face à une source primaire : manuels d'instrument STScI et JDox, pages mission ESA, articles de référence des instruments.
- A2. Corriger ou retirer toute valeur non confirmée. Une valeur retirée n'est pas remplacée par une estimation.
- A3. Établir la licence de la maquette Euclid (demande à l'ESA ou conditions SciFleet). Si elle n'autorise pas la redistribution, retirer le fichier et prévoir l'affichage d'Euclid sans vue 3D.
- A4. Dater le contenu : mention « valeurs vérifiées le … » par observatoire.

**Acceptation.** Chaque ligne de données porte une référence (voir B) ; la liste « valeurs les moins sûres » de la section 2 est vide.

**Fait le 13 novembre 2026 : fiches des quatre observatoires.** Chaque valeur chiffrée a été confrontée à une source primaire (fiches NASA et ESA, article de référence de la mission, documentation des archives) ou retirée.

Corrections apportées :

| Observatoire | Avant | Après | Source |
|---|---|---|---|
| Hubble | masse 11 110 kg | ≈ 10 800 kg au lancement, ≈ 12 200 kg après SM4 | NASA |
| Hubble | diamètre 4,2 m | 4,3 m | NASA |
| Hubble | panneaux 7,1 × 2,6 m, ≈ 5 kW | 7,54 × 2,44 m, ≈ 5 500 W | NASA |
| Hubble | altitude ≈ 500–540 km | ≈ 480 km, sous 500 km en 2026 | NASA, The Register |
| JWST | domaine 0,6–28,8 µm | 0,6–28,5 µm | NASA |
| JWST | f/20,2 | f/20 | McElwain et al. 2023 |
| JWST | hauteur ≈ 8 m, atténuation ≈ 1 million, 2 contacts de 4 h | retirés (non confirmés) | |
| Euclid | 4,7 m × 3,7 m, ≈ 2 000 kg | 4,8 m × 3,74 m, 1 988 kg | Euclid I (Mellier et al.) |
| Euclid | bande VIS 550–900 nm, CCD ≈ 150 K | 530–920 nm, 153 K | Euclid I |
| Euclid | champ ≈ 0,53 deg² | ≈ 0,54 deg² | Euclid I |
| Euclid | grisme rouge R > 380 | R ≳ 480 (bleu R ≳ 400) | Euclid I |
| Euclid | ≈ 850 Gbit par jour | ≈ 826 Gbit (ESA indiquait 850) | Euclid I |
| Gaia | plan focal ≈ 1,0 × 0,4 m | 0,42 × 0,92 m | ESA |
| Gaia | DR4 « fin 2026 » | 2 décembre 2026 | ESA Cosmos |

Les périodes des orbites de halo (≈ 175 jours pour JWST, ≈ 170 pour Euclid) sont mesurées sur les éphémérides JPL Horizons déjà utilisées par la page « Orbite ».

Valeurs encore sans source, marquées « ? » sur le site : longueur focale et rapport focal de Hubble, longueur focale d'Euclid (24,5 m), diamètre du pare-soleil de Gaia (≈ 10 m). Le nombre de sources de Gaia DR3 est sourcé depuis le 14 novembre.

**Fait le 14 novembre 2026 : pages des 15 instruments.** Sources : manuels STScI (WFC3 IHB, ACS IHB, STIS et COS Data Handbooks, HST Primer cycle 34), JDox et page STScI des modes spectroscopiques, articles Euclid I, II (VIS, Cropper et al.) et III (NISP, Jahnke et al.), page ESA Gaia DR3, page ESA de l'instrument photométrique, documentation Gaia DR2 et Prusti et al. 2016.

| Instrument | Avant | Après | Source |
|---|---|---|---|
| WFC3 | f/31 et f/11 ; sensibilité S/N = 10 en 10 h | retirés (non confirmés) ; 62 filtres UVIS, 15 IR ; bruit IR 12 e⁻ | WFC3 IHB, HST Primer |
| ACS | SBC 0,032″/px | ≈ 0,034″ × 0,030″/px, champ SBC 34,6″ × 30,5″ ajouté | ACS IHB |
| STIS | CCD 250–1100 nm ; MAMA 0,024″/px ; R (M) 10 000–20 000 | ≈ 200–1030 nm ; 0,025″/px ; 4 900–17 400 ; E140M R ≈ 45 800 | STIS DHB |
| COS | NUV 170–320 nm ; R moyenne 16 000–24 000 ; plages G160M, G185M, G225M, G285M, G230L | 165–320 nm ; 12 000–24 000 ; plages du manuel | COS DHB |
| FGS (HST) | stabilité ≈ 0,007″ | retirée ; précision ≈ 1 mas, parallaxes ≈ 0,2 mas | HST Primer |
| NIRCam | 2048 × 2048 px ; grisme R ≈ 1 700 | 2040 × 2040 utiles ; R ≈ 1 600 à 4 µm | JDox |
| NIRSpec | champ MSA 3,4′ × 3,4′ | 3,6′ × 3,4′, volets 0,20″ × 0,46″ | JDox |
| MIRI | MRS 4,9–28,8 µm, R 1 500–3 500 ; LRS 5–12 µm, fente 0,6″ × 5,5″ ; coronographes : rayon interne et contraste | 4,9–27,9 µm, R 1 550–3 250 ; 5–14 µm, fente 0,51″ × 4,7″ ; 3 masques de phase et 1 Lyot avec leurs champs | JDox |
| NIRISS | imagerie 0,8–5,0 µm, 0,065″/px | 0,6–5,0 µm, 0,066″/px | JDox |
| FGS (JWST) | ≈ 0,07″/px | ≈ 0,069″/px, détecteurs 2048 × 2048 (2040 actifs) | JDox |
| VIS | saturation ≈ 200 000 e⁻ et limite brillante 17,8 ; f/20,4 ; obstruction 11 % | retirés ; faisceau f/20 | Euclid II |
| NISP | 0,92–2,0 µm ; 0,298″/px ; optique ≈ 130 K ; « ≤ 200 W » | 0,95–2,02 µm ; 0,3″/px ; ≈ 135 K ; plafond de conception 200 W | Euclid III |
| Gaia astrométrie | TDI ≈ 4,4 s | 4,42 s ; parallaxe 1,3 mas à G = 21 ajoutée | Prusti et al., DR3 |
| Gaia BP/RP | R ≈ 20–100 ; ≈ 220 millions de spectres XP | dispersion 3–27 nm/px (BP), 7–15 nm/px (RP) ; ≈ 219 millions | ESA, DR3 |
| Gaia RVS | R ≈ 11 500 | R ≈ 11 700 | Prusti et al., doc. DR2 |

Reste sans source sur les pages d'instruments : la bande G (≈ 330–1050 nm). Les tableaux de comparaison (échantillonnage, résolution) reprennent les valeurs sourcées des pages, sans appel de note.

### B. Sources visibles

**Besoin.** L'étudiant veut aller plus loin, l'expert veut vérifier.

**Exigences**

- B1. Chaque ligne de caractéristique peut porter une référence (`[libellé, valeur, idSource]`), avec une table des sources par observatoire (titre, éditeur, URL, date de consultation). **Livré pour les fiches et les instruments** (`refs` et `checked` dans `src/data-tele.js` et par observatoire dans `src/data-inst.js`).
- B2. Affichage discret : un appel de note par valeur, et une section « Sources » en bas de chaque fiche et de chaque instrument. **Livré pour les fiches et les instruments** : numéro en exposant, « ? » orangé pour une valeur chiffrée sans source, liste numérotée et date de vérification.
- B3. Les schémas (couverture spectrale, champs de vue) citent aussi leur source. **Livré** : légende sous les schémas des pages d'instruments, qui renvoie aux sources de la page (les schémas sont tracés à partir des valeurs sourcées).

**Acceptation.** Aucune valeur numérique affichée sans source, hors conversions d'unités.

### C. Deux niveaux de lecture

**Besoin.** Servir l'étudiant et l'expert sur la même page sans frustrer l'un ni l'autre.

**Exigences**

- C1. Glossaire : les termes techniques (TDI, grisme, point de Lagrange, R = λ/Δλ, magnitude AB, CTE, IFU…) sont définis une fois, et consultables au survol ou au toucher partout où ils apparaissent. **Livré** : `src/glossary.js`, 22 termes en français et en anglais. La première apparition d'un terme dans chaque bloc (fiche, section d'instrument) est soulignée en pointillé ; survol, focus clavier ou toucher affichent la définition, Échap la ferme. Ajouter un terme : une ligne dans `Glossary`, motif et définition dans les deux langues.
- C2. Chaque fiche d'instrument commence par « À quoi ça sert » en deux ou trois phrases sans jargon, avant les tableaux. **Livré** : champ `use` des 15 instruments (`src/data-inst.js`, traduit dans `src/en/inst.js`), affiché en tête, avant le résumé technique.
- C3. Pas de bascule « mode débutant / mode expert » : un seul contenu, ordonné du plus accessible au plus pointu.

**Acceptation.** Un lecteur de licence scientifique comprend le premier écran de chaque fiche sans recherche extérieure ; aucune valeur experte n'a été retirée pour y parvenir.

### D. Trajet de la lumière et intérieur des télescopes

**Besoin.** Les maquettes montrent l'extérieur. Or ce qui distingue ces télescopes est à l'intérieur : combinaison optique, plan focal, partage du faisceau.

**Exigences**

- D1. Schéma optique par observatoire, à l'échelle : miroirs, foyers, trajet des rayons du primaire au détecteur (Ritchey-Chrétien pour Hubble, Korsch pour JWST et Euclid, deux télescopes et un plan focal commun pour Gaia).
- D2. Plan focal dessiné à l'échelle : disposition réelle des détecteurs (36 CCD de VIS, 16 détecteurs de NISP, 106 CCD de Gaia avec leurs fonctions, détecteurs de NIRCam…).
- D3. Lien avec la vue 3D : cliquer « miroir primaire » dans la maquette met en évidence le même élément dans le schéma, et inversement.
- D4. En option : coupe ou transparence dans la vue 3D. À n'engager que si les maquettes contiennent une géométrie intérieure exploitable (à vérifier maquette par maquette).

**Acceptation.** Pour chaque observatoire, on peut suivre un rayon de l'entrée au détecteur et lire la taille réelle du plan focal.

**Livré (première version).** Page « Trajet de la lumière » dans Instruments et données, pour chaque observatoire (`src/optics.js`) : schéma optique, explication en quatre étapes, tableau de la combinaison optique, détecteurs dessinés à l'échelle.

**Reste à faire**

- Le schéma de Hubble est entièrement à l'échelle. Ceux de JWST et d'Euclid ne le sont que pour les deux premiers miroirs ; celui de Gaia est un schéma de principe, peu lisible à cause des faisceaux croisés. Les refaire à partir des prescriptions optiques publiées (rayons de courbure, positions des miroirs).
- Plans focaux : espaces entre détecteurs indicatifs ; la disposition de Gaia (colonne de contrôle, RVS) est à vérifier face à la documentation ESA.
- Livré depuis : comparaison des plans focaux des quatre observatoires à la même échelle dans « Comparer » ; D3 sous forme de liens dans les deux sens (boutons « Voir dans la maquette 3D » sous chaque schéma, qui sélectionnent la pièce ; lien « Voir le trajet de la lumière » dans la description des pièces optiques).
- D3, suite : mettre en évidence l'élément dans le schéma lui-même, et pas seulement ouvrir la page.
- D4 (coupe ou transparence) : non commencé.

### E. Vraies données

**Besoin.** Passer de « voici la structure d'un fichier » à « voici ce que l'instrument a réellement vu ».

**Exigences**

- E1. Une image ou un spectre réel par instrument, avec son identifiant d'observation, son programme et sa licence, et le code qui permet de le retélécharger.
- E2. Les fichiers sont réduits (aperçus, pas de FITS complets) et stockés dans le dépôt, pour que le site reste statique.
- E3. Requêtes en direct vers les archives (MAST, ESA, Gaia TAP) : à étudier seulement après E1. Dépend des règles CORS de chaque archive ; un serveur intermédiaire ne se justifie que si elles l'imposent.

**Acceptation.** Chaque instrument d'imagerie ou de spectroscopie montre au moins un produit réel, traçable jusqu'à l'archive.

**Livré.** `tools/data/fetch_data.py` interroge les archives et écrit dans `data/` un aperçu léger par instrument (image JPEG ou mesures JSON) et un manifeste. Le workflow GitHub « Données réelles » le lance à chaque modification du script, ou à la demande, et commite le résultat. Le site affiche une section « Observation réelle » dans la fiche de l'instrument, avec l'identifiant d'observation, le programme, la requête utilisée et la date de récupération.

| Instrument | Produit réel affiché |
|---|---|
| Hubble WFC3, ACS | aperçus de mosaïques combinées de M83 et M51 (MAST) |
| Hubble STIS, COS | spectres extraits de HD 209458 et du quasar 3C 273 |
| JWST NIRCam, MIRI, NIRISS | images combinées de l'amas SMACS 0723 (programme 2736) |
| JWST NIRSpec | spectre d'une source du même champ, choisie automatiquement au meilleur signal sur bruit |
| Euclid VIS | découpe d'une mosaïque VIS sur la nébuleuse de l'Œil de chat (Q1, via IRSA), et comptages par magnitude tirés de `q1.mer_catalogue` |
| Euclid NISP | composition colorée Y, J, H du même champ, spectre du grisme rouge d'une source Q1, couleur visible − infrarouge |
| Gaia Astro | diagramme de Hertzsprung-Russell de 8 000 étoiles à moins de 100 pc |
| Gaia BP/RP, RVS | spectre BP/RP et spectre RVS réels d'une même étoile de type solaire (DataLink), plus les distributions de couleurs et de vitesses radiales |

**Reste à faire**

- Les deux capteurs de guidage (FGS) n'ont pas de produit.
- Images : ce sont les aperçus en niveaux de gris de l'archive. Les refaire à partir des FITS (étirement choisi, composition colorée à plusieurs filtres) donnerait un bien meilleur résultat.
- Un instrument peut maintenant afficher plusieurs produits (clés `obs/inst:image`, `obs/inst:spectre`, `obs/inst` dans le manifeste).
- Images Euclid : le cœur saturé de la nébuleuse est rendu en blanc ; choisir aussi un champ de galaxies, plus représentatif du relevé.
- Euclid DR1 est sorti le 12 novembre 2026 (tables `dr1.*` dans l'archive). Le site le mentionne, mais ses exemples et ses graphiques viennent encore de Q1 : les faire passer sur DR1, et relire la fiche NISP (grisme bleu, contenu des catalogues).
- Les choix d'observation sont automatiques (la plus longue pose publique sur la cible). Les figer par identifiant une fois validés, pour que le site ne change pas tout seul.
- E3 (requêtes en direct depuis le navigateur) : non commencé.

### F. Orbites et temps

**Besoin.** Situer les observatoires et montrer ce qui bouge.

**Exigences**

- F1. Vue du système Terre–Lune–L2 à l'échelle, avec les orbites de halo et de Lissajous, et la position de Hubble sur son orbite.
- F2. Loi de balayage de Gaia animée (rotation en 6 h, précession en 63 jours) et couverture du ciel qui en résulte.
- F3. Déploiement de JWST par étapes, si la maquette permet d'articuler le bouclier et les ailes du miroir (à vérifier).
- F4. Zones du ciel observables à un instant donné (contraintes d'angle solaire), pour les lecteurs qui préparent des observations.

**Acceptation.** Les mouvements montrés respectent les périodes et les angles réels, ou indiquent le facteur d'accélération.

**Livré (première version).** Page « Orbite » par observatoire, dans Instruments et données (`src/orbits.js`).

- JWST, Euclid, Gaia : trajectoire réelle autour de L2, animée, vue depuis la Terre et vue de dessus, avec l'orbite de la Lune à la même échelle. Les positions viennent des éphémérides JPL Horizons (`tools/data/fetch_orbits.py`, fichier `data/orbits.json`), exprimées dans le repère tournant Soleil–Terre. Les distances extrêmes affichées sont mesurées sur ces données.
- Hubble : orbite basse à l'échelle, avec l'ombre de la Terre. Le mouvement est calculé (période de 95 min, Soleil dans le plan de l'orbite), ce n'est pas une éphéméride.
- Gaia : loi de balayage nominale simulée (rotation en 6 h, précession en 63 jours, axe à 45° du Soleil), qui dessine la couverture du ciel au fil des jours.

**Reste à faire**

- Livré depuis : les trois orbites de L2 sur une même figure animée dans « Comparer » ; carte des pointés réels de Hubble (1990 à aujourd'hui) et de JWST, année par année, tirée de l'archive MAST ; carte de l'avancée réelle du relevé d'Euclid, mois par mois, tirée des observations VIS de DR1 (`tools/data/fetch_sky.py`, fichier `data/sky.json`).
- F1 : position réelle de Hubble (éphéméride ou éléments orbitaux à jour).
- Cartes de pointés : l'écliptique et le plan de la Galaxie sont tracés. Reste à distinguer les instruments et à montrer pour Euclid l'ordre des plaques à l'intérieur d'un mois.
- F2 : la carte de balayage est une simulation de la loi nominale ; la comparer à la vraie couverture de Gaia DR3 (nombre de passages par source).
- F3 (déploiement de JWST) : non commencé. La maquette n'est pas articulée ; il faudrait d'abord la redécouper par élément mobile.
- F4 (zones du ciel observables) : non commencé.
- Indiquer le facteur d'accélération des animations, et permettre de choisir une date.

### G. Autres observatoires

**Besoin.** Couvrir le spectre au-delà de l'ultraviolet–infrarouge et les missions à venir.

**Candidats.** Chandra et XMM-Newton (rayons X), Spitzer et Herschel (infrarouge, missions terminées), Planck (micro-ondes), TESS et PLATO (exoplanètes), Roman (grand champ infrarouge).

**Exigences**

- G1. Un observatoire n'est ajouté que s'il a une maquette de licence claire, un redécoupage en pièces vérifié visuellement, une fiche et des instruments sourcés (A et B).
- G2. Procédure d'ajout documentée dans `tools/models/README.md` : conversion, classifieur de pièces, entrée dans `data-tele.js` et `data-inst.js`.
- G3. La navigation tient au-delà de six ou sept observatoires (les onglets d'en-tête ne suffiront plus) : prévoir un classement par domaine spectral ou par agence.

**Acceptation.** Ajouter un observatoire ne demande aucune modification de `app.js`.

### H. Socle technique

- H1. Tests automatiques dans le dépôt : chargement des quatre maquettes, clic sur chaque pièce, vue éclatée, comparaison, pages d'instruments, sans erreur console ; lancés à chaque push. **Livré** : `tools/smoke.js` (bureau en thème clair, téléphone en thème sombre, absence de défilement horizontal) et workflow « Tests », qui vérifie aussi que `index.html` correspond bien aux sources.
- H2. Publication GitHub Pages automatique depuis `main`, avec `index.html` construit par l'intégration continue plutôt que commité.
- H3. Accessibilité : parcours complet au clavier, y compris la sélection des pièces ; contrastes vérifiés dans les deux thèmes.
- H4. Version anglaise. **Livré.** Le français reste la langue des sources ; l'anglais est dans `src/en/` et appliqué par `src/i18n.js`.
  - Langue choisie d'après le navigateur, modifiable par le bouton EN / FR de l'en-tête (choix mémorisé). Un lien peut l'imposer : `#en-jwst`, `#fr-jwst`.
  - Contenu structuré (fiches, pièces, instruments, optique, orbites, observations réelles) : traduit champ par champ dans `src/en/tele.js`, `inst.js`, `more.js`.
  - Textes d'interface écrits dans le code : traduits à l'affichage par dictionnaire et par règles (`src/en/ui.js`). Une chaîne absente du dictionnaire reste en français.
  - `node tools/i18n-scan.js` parcourt le site en anglais et liste ce qui n'est pas traduit ; le test de fumée échoue si du français subsiste dans les pages d'instruments.
  - À faire à chaque ajout de texte : compléter `src/en/`. Les libellés produits par les scripts Python (`tools/data/`) sont en français et traduits côté site : un nouveau libellé doit être ajouté au dictionnaire.
  - Non traduit : `README.md`, `SPECS.md`, les commentaires du code.
- H5. Poids : la maquette d'Euclid fait 6 Mo ; viser moins de 3 Mo par maquette (textures KTX2 ou résolution adaptée au téléphone).

## 4. Questions ouvertes

1. Ordre des lots : l'ordre proposé (A, B, puis C et D) convient-il ?
2. Langue : français seul, ou français et anglais (H4) ?
3. Licence du dépôt lui-même (code et textes) : à choisir.
4. Lot G : quels observatoires en premier ?
5. Lot E : accepte-t-on un petit serveur si les archives l'imposent, ou le site doit-il rester strictement statique ?

## 5. Hors périmètre pour l'instant

- Télescopes au sol.
- Comptes utilisateurs, contenu modifiable en ligne.
- Simulation physique (thermique, orbitographie précise).
