# Observatoires en orbite : spécifications

Document de travail, à jour au 19 novembre 2026. Ordre de lecture : objet et public (1), ce que fait le site (2), **ce qui reste à faire (3)**, questions à trancher (4), puis le détail de chaque lot, ses exigences et ce qui a été livré (5). Les tableaux de vérification des valeurs sont en annexe.

## 1. Objet et public

Le site présente des télescopes spatiaux en 3D et explique comment ils sont construits, ce qu'ils mesurent et comment accéder à leurs données.

Public visé : **de l'étudiant à l'expert**. Règles pour tout le contenu :

- **Deux niveaux de lecture.** Chaque fiche se comprend sans prérequis (phrases complètes, termes définis) et donne en dessous les valeurs exactes qu'un expert vient chercher (unités, références).
- **Rien d'approximatif sans le dire.** Une valeur arrondie, estimée, mesurée sur une maquette ou schématique est signalée comme telle.
- **Toute valeur a une source.** Un expert doit pouvoir vérifier ; un étudiant doit pouvoir aller plus loin.

## 2. Ce que fait le site

- **Dix observatoires**, dans l'ordre chronologique de lancement : Hubble, Chandra, Spitzer, Fermi, Kepler, Gaia, TESS, JWST, Euclid, Roman, groupés dans l'en-tête par domaine spectral (rayons gamma, rayons X, UV et visible, infrarouge, astrométrie). Tous sont décrits par le registre `TELESCOPES` (`src/data-tele.js`) ; en ajouter un ne demande aucune modification de `app.js`.
- **Vue 3D** : maquettes réelles redécoupées en pièces cliquables (54 au total), vue éclatée, éclairage « Soleil réel », Terre sous Hubble, vue en coupe avec intérieurs reconstruits, déploiement de Webb en 13 étapes et ouverture du pare-soleil de Gaia, comparaison des tailles à l'échelle.
- **Fiche par observatoire** : chiffres clés, description, schéma d'orbite, tableaux de caractéristiques avec appels de note ; faits sourcés pour chaque pièce.
- **Mission et données**, une page par observatoire :
  - mission et traitements (déroulé daté, exploitation, chaîne de traitement, publications des données) ;
  - trajet de la lumière (schéma optique, étapes, plan focal à l'échelle) ;
  - orbite (trajectoire réelle, orbite très elliptique de Chandra à l'échelle, position de Hubble en direct, ciel observable, pointés réels) ;
  - 26 instruments : à quoi ça sert, couverture spectrale, champ de vue, filtres, produits de données, observation réelle, code d'accès, liens d'archives.
- **Comparer** : tailles (avec une silhouette humaine de 1,75 m comme référence), orbites autour de L2, couvertures spectrales, champs de vue, plans focaux et tableau des instruments.
- **Anglais par défaut**, français par le bouton FR ou un lien `#fr-…` ; thèmes clair et sombre, téléphone, liens par ancre (`#jwst`, `#roman-instruments`, `#comparer`, `#en-euclid`…), favicon.
- Site statique sans serveur. Données réelles mises à jour par l'intégration continue (chaque jour pour les orbites, le TLE de Hubble et les observations).
- Tests à chaque push : parcours complet du site au bureau et au téléphone, complétude du registre, traduction (`tools/smoke.js`) ; accessibilité WCAG 2.1 A et AA (`tools/a11y.js`).

## 3. Ce qui reste à faire

Classé par priorité proposée. Entre crochets : le lot concerné (section 5).

### Priorité 1 : nouveaux observatoires

1. **Chandra : reste** [F] : pas de déploiement (panneaux solaires et porte à l'orbite, peu documentés).
2. *Fait le 19 novembre.* **Navigation** [G3] : onglets groupés par domaine spectral (rayons X, UV et visible, infrarouge, astrométrie), nom du groupe au-dessus de son premier onglet, nom court sur téléphone ; mêmes groupes dans l'en-tête de « Mission et données ». Champ `domain` du registre, liste `DOMAINS`. Au-delà de huit observatoires environ, la rangée défile sur téléphone : prévoir alors un menu par groupe.
3. **Observatoires en cours d'ajout** (choisis le 19 novembre) : Spitzer, Fermi, TESS et Kepler (faits), puis XMM-Newton (maquette de licence claire à trouver). Au-delà de huit observatoires, la rangée d'onglets défile sur téléphone (fondu au bord, centrée sur l'onglet actif) ; vers dix, elle débordera aussi sur ordinateur : prévoir alors un menu par groupe.

### Priorité 2 : contenu encore approximatif

4. **Prescriptions optiques** [D1] : les schémas d'Euclid, de Gaia et de Roman ne sont à l'échelle que pour les éléments publiés ; courbures et positions des miroirs arrière manquent. À demander aux équipes (consortium Euclid, DPAC, projet Roman) ou à chercher dans des documents de conception. Le schéma de Gaia reste chargé.
5. **Plans focaux** [D2] : espaces entre détecteurs indicatifs pour Webb et Gaia ; rangée des trois CCD de contrôle de Gaia dans la première colonne non confirmée.
6. *Fait le 19 novembre.* Roman : dimensions déployées (12,7 × 4,4 m) et masse à sec (≈ 8 000 kg) du dossier de presse de la NASA ; la masse avec ergols reste la prévision de 2021, signalée « ≈ » dans les comparaisons (comme Hubble et Webb, champ `cmp.approx`).
7. *Fait le 19 novembre.* Bande G de Gaia : 330–1050 nm, Weiler 2018 (A&A).
8. **Suffixes de fichiers de Webb et de Hubble** [M] : relire chaque tableau de produits de la documentation.
9. **Licence de la maquette d'Euclid** [A3] : aucune licence explicite sur SciFleet ; demande à l'ESA. Si elle n'autorise pas la redistribution, remplacer la maquette.
10. Relecture de la version anglaise par un anglophone du domaine [H4].

### Priorité 3 : vraies données

11. **Images en couleurs** [E] : les aperçus actuels sont les vignettes en niveaux de gris de l'archive. Les refaire à partir des FITS (étirement choisi, composition à plusieurs filtres).
12. **Figer les observations** [E] : le choix est automatique (plus longue pose publique). Fixer les identifiants une fois validés, pour que le site ne change pas tout seul.
13. **Roman** [E] : aucune donnée publique avant début 2027 ; ajouter alors un exemple réel et le code d'accès.
14. **Requêtes en direct depuis le navigateur** [E3] : non commencé. Dépend des règles CORS de chaque archive.

### Priorité 4 : orbites et animations

15. Gaia : comparer la carte de balayage simulée à la vraie couverture de Gaia DR3 (nombre de passages par source) [F2].
16. Euclid : ordre des observations à l'intérieur d'un mois sur la carte du relevé, via les fichiers S3 d'IRSA [F].
17. Afficher le facteur d'accélération des animations et permettre de choisir une date [F].

### Priorité 5 : socle technique

18. **Publication par l'intégration continue** [H2] : construire `index.html` dans GitHub Actions plutôt que le commiter.
19. **Poids des maquettes** [H5] : Euclid fait 6,0 Mo, Hubble 3,4 Mo, JWST 4,0 Mo ; viser moins de 3 Mo (allègement comme pour Roman, ou textures adaptées au téléphone).
20. **Tests** [H1, H3] : ajouter un test du parcours au clavier et un autre navigateur que Chromium.

## 4. Questions à trancher

1. **Licence du dépôt** (code et textes) : à choisir (par exemple MIT pour le code, CC BY 4.0 pour les textes).
2. **Serveur** : si une archive l'impose pour les requêtes en direct (E3), accepte-t-on un petit serveur intermédiaire, ou le site reste-t-il strictement statique ?
3. **Ordre des prochains observatoires** : après Chandra, lesquels (Spitzer, Planck, Kepler, TESS, XMM-Newton) ?

Décidé : lots D, E, F en premier (12 novembre) ; français et anglais (12 novembre) ; Roman comme premier ajout (16 novembre) ; registre avant Chandra, puis Chandra (19 novembre) ; navigation par domaine spectral (19 novembre).

## 5. Lots : exigences et état

### A. Fiabiliser le contenu — livré, sauf A3

**Besoin.** Un expert doit pouvoir se fier à chaque valeur.

- A1. Relire chaque valeur face à une source primaire (manuels STScI et JDox, pages ESA et NASA, articles de référence). **Livré** : fiches (13 novembre), pages d'instruments (14 novembre), faits des pièces (15 novembre), Roman (16 novembre). Détail des corrections en annexe.
- A2. Corriger ou retirer toute valeur non confirmée, sans la remplacer par une estimation. **Livré.**
- A3. Établir la licence de la maquette d'Euclid. **À faire** (point 9).
- A4. Dater le contenu. **Livré** : « valeurs vérifiées le … » par observatoire et par onglet.

**Acceptation.** Chaque valeur porte une référence. Reste la bande G de Gaia (point 7).

### B. Sources visibles — livré

- B1. Référence par ligne (`[libellé, valeur, idSource]`) et table des sources par observatoire (`refs`, `checked`).
- B2. Appel de note par valeur, « ? » orangé pour une valeur chiffrée sans source, liste numérotée en bas de chaque fiche, instrument et onglet.
- B3. Les schémas citent leur source dans leur légende.

**Acceptation.** Aucune valeur numérique affichée sans source, hors conversions d'unités.

### C. Deux niveaux de lecture — livré

- C1. Glossaire (`src/glossary.js`, 22 termes en français et en anglais) : première apparition soulignée, définition au survol, au focus clavier ou au toucher.
- C2. « À quoi ça sert » en tête des 17 instruments (champ `use`).
- C3. Un seul contenu, ordonné du plus accessible au plus pointu (règle de rédaction).

### D. Trajet de la lumière et intérieur des télescopes — livré, avec des restes

- D1. Schéma optique par observatoire. **Livré.** Entièrement à l'échelle pour Hubble (Lallo 2012) et JWST (McElwain et al. 2023, tableau 2 ; foyers calculés ; seuls les décalages latéraux de l'optique arrière sont agrandis). Euclid : diamètres, écart des miroirs, trou du primaire, plaque de base, tailles du tertiaire et des renvois (Racca et al. 2016). Gaia : banc, ouvertures, plan focal et angle de base. Roman : ouverture et obstruction publiées, écart des miroirs mesuré sur la maquette NASA. Reste : point 4.
- D2. Plans focaux à l'échelle. **Livré** (revu le 17 novembre) : WFI de Roman en arc d'après les positions de GalSim, VIS et NISP avec leurs vrais espaces (Euclid I et II), écarts des CCD de WFC3 et d'ACS, RVS de Gaia en rangées 4 à 7 (documentation DR3). Reste : point 5.
- D3. Lien dans les deux sens entre schéma et maquette 3D, avec surlignage. **Livré.**
- D4. Vue en coupe. **Livré** : seule la coque est coupée ; intérieurs reconstruits (`src/interior.js`) d'après les sources publiées, emplacements indicatifs et dits comme tels ; plans de coupe propres pour les modules de Webb et de Roman.

### E. Vraies données — E1 et E2 livrés, E3 à faire

- E1. Un produit réel par instrument, traçable jusqu'à l'archive. **Livré** pour les 15 instruments de Hubble, JWST, Euclid et Gaia (Euclid sur DR1 depuis le 15 novembre). Roman : point 13.
- E2. Aperçus légers stockés dans le dépôt (`tools/data/fetch_data.py`, `data/`). **Livré.**
- E3. Requêtes en direct. **À faire** (point 14).

Produits affichés :

| Instrument | Produit réel |
|---|---|
| Hubble WFC3, ACS | aperçus de mosaïques de M83 et M51 (MAST) |
| Hubble STIS, COS | spectres de HD 209458 et du quasar 3C 273 |
| Hubble FGS | 13,5 h de photométrie de HD 17156 (programme 11945) |
| JWST NIRCam, MIRI, NIRISS | images de l'amas SMACS 0723 (programme 2736) |
| JWST NIRSpec | spectre d'une source du même champ |
| JWST FGS | image FGS1 du champ d'étalonnage du Grand Nuage de Magellan (programme 1086) |
| Euclid VIS | mosaïque VIS du champ COSMOS et comptages du catalogue MER (DR1, IRSA) |
| Euclid NISP | composition Y, J, H, spectre rouge combiné et couleur VIS − H (DR1) |
| Gaia Astro | diagramme de Hertzsprung-Russell à moins de 100 pc |
| Gaia BP/RP, RVS | spectres d'une étoile de type solaire, distributions de couleurs et de vitesses |
| Chandra ACIS | image standard `cntr_img2` du reste de supernova Cassiopée A (ObsID 114, archive CDA) |
| Chandra HRC | image HRC-I du centre de la galaxie d'Andromède (ObsID 1912 ; le Crabe, premier choix, n'a pas de pose HRC-I sans réseau) |
| Chandra HETG, LETG | spectres `pha2` de l'étoile Capella, ordres ±1 additionnés (ObsID 1318 et 1248) |

### F. Orbites et temps — livré, avec des restes

- F1. Système Terre–Lune–L2 à l'échelle avec trajectoires réelles (JPL Horizons, mises à jour chaque jour, Roman compris) ; position de Hubble en direct (TLE CelesTrak, SGP4 dans le navigateur).
- F2. Loi de balayage de Gaia simulée. Reste : point 15.
- F3. Déploiements (`src/deploy.js`, un moteur commun, une configuration par observatoire marqué `deploy:true` dans le registre), repliement par déformation de la maquette, contrôlé par `tools/deploy-check.js [pas] [observatoire]` et par `tools/smoke.js`. Formes repliées schématiques, dit sous le curseur.
  - Webb : 13 étapes, du lancement (25 décembre 2021) à l'arrivée autour de L2 (24 janvier 2022) ; dates NASA.
  - Gaia (19 novembre) : 4 étapes, lancement (19 décembre 2013), séparation (+42 min), pare-soleil ouvert (+88 min, une dizaine de minutes ; 12 panneaux rectangulaires et 12 sections triangulaires), arrivée autour de L2 (8 janvier 2014) ; dates ESA et Astronomy. Repliement : panneaux relevés le long du satellite autour d'une charnière au bord du module de service, sections triangulaires rentrées en plis. Contact signalé le long de la charnière (anneau autour de l'antenne), attendu.
  - Roman : à décider. Étapes datées connues (panneaux solaires +1 h 23, antenne le 31 août, couvercle le 1er septembre 2026), mais la maquette est la conception de 2015 et le repliement des panneaux n'est pas documenté.
- F4. Ciel observable à une date choisie, contraintes d'angle solaire sourcées pour chaque observatoire.
- Cartes des pointés réels de Hubble et de JWST (MAST) et de l'avancée du relevé d'Euclid (DR1). Restes : points 16 et 17.

### G. Autres observatoires — Roman et registre livrés

- G1. Un observatoire n'est ajouté qu'avec une maquette de licence claire, un redécoupage vérifié, une fiche et des instruments sourcés.
- G2. Procédure d'ajout documentée (`tools/models/README.md`). **Livré le 19 novembre**, avec le registre : `TELESCOPES` porte couleur, chiffre clé, encombrement, pièces optiques, place et orientation dans « Comparer », place dans la figure des plans focaux, fin de mission, déploiement ; matériaux dans `src/looks.js` ; `tools/smoke.js` liste ce qui manque à une entrée.
- Chandra (19 novembre) : maquette NASA 3D Resources (0,8 Mo) redécoupée en six pièces (porte, module, miroirs HRMA, banc optique, module scientifique ISIM, panneaux solaires), fiche, ACIS, HRC, HETG et LETG avec axe spectral étendu aux rayons X (keV), schéma Wolter I à l'échelle, plans focaux ACIS et HRC-I, mission et traitements (niveaux 0 à 3, CSC 2.1), orbite très elliptique (Horizons, objet −151, schéma d'orbite à l'échelle). Le registre a suffi, sauf pour un nouveau type d'orbite (« heo ») ajouté au schéma d'orbite de l'application. Observations réelles de l'archive CDA. Vue en coupe : quatre paires de miroirs à l'échelle, réseau HETG à 8,6 m du foyer, ACIS et HRC sur la table de translation, six roues de réaction, deux centrales inertielles, trois batteries et l'enregistreur (Weisskopf et al. 2000 et 2005, Canizares et al. 2005) ; trois plans de coupe (avant, tube, module d'instruments). Les intérieurs peuvent désormais être décrits dans le repère du fichier glTF (`frame = 'file'`).
- Spitzer (19 novembre) : maquette NASA 3D Resources (1,1 Mo) redécoupée en cinq pièces, fiche, IRAC, IRS et MIPS, schéma optique à l'échelle d'après la prescription du Spitzer Telescope Handbook (tableau 3.3), champs projetés sur le plan focal, mission et traitements (niveaux 0 à 3), orbite autour du Soleil tracée sur toute la mission (Horizons, objet −79, repère tournant avec la Terre ; nouveau type `helio`, qui servira aussi à Kepler), ciel observable (82,5° à 120° du Soleil). Restent : spectre IRS réel, vue en coupe.
- Fermi (19 novembre) : maquette NASA 3D Resources allégée à 2,0 Mo et redécoupée en cinq pièces (LAT, détecteurs du GBM, module, antenne Ku, panneaux), mise à l'échelle sur l'envergure publiée ; fiche, LAT et GBM ; nouveau domaine « rayons gamma » ; axe spectral étendu aux rayons gamma, gradué en énergie ; schéma de principe d'une tour du LAT (conversion de paires) ; mission et traitements ; orbite basse avec suivi en direct (TLE CelesTrak, NORAD 33053 : l'orbite basse est devenue générique, paramètres par observatoire) ; observations réelles : carte des sources 4FGL-DR4 et durées des sursauts du GBM (HEASARC). Spitzer : images réelles d'IRAC (M51 en trois couleurs) et de MIPS (24 µm), mosaïques SEIP de l'IRSA ; spectre IRS à faire.
- TESS (19 novembre) : maquette NASA 3D Resources (version B) redécoupée en cinq pièces (caméras, écran conique, module, antenne, panneaux), mise à l'échelle sur la longueur déployée (3,9 m) ; deux matériaux portaient une carte de normales comme couleur, corrigé dans `looks.js`. Orbite HEO réelle (JPL Horizons, -95, repère inertiel), schéma des quatre caméras et de leurs 16 CCD à l'échelle, coupe d'une caméra (focale déduite ≈ 147 mm), courbe de lumière réelle de WASP-18 (SPOC, 2 min). Écran conique : présent dans la maquette, signalé comme tel.
- Kepler (19 novembre) : maquette NASA 3D Resources (version A), en mètres, redécoupée en quatre pièces (photomètre, panneaux, module, antenne). Orbite héliocentrique réelle (JPL Horizons, -227, 2009–2018), schéma de Schmidt à l'échelle (lame au centre de courbure et diamètre du plan focal déduits), plan focal de 42 CCD et 4 viseurs, courbe de lumière réelle de HAT-P-7 (un trimestre, longue cadence). Sources : dossier de presse 2009, Kepler Instrument Handbook, NASA Science.
- G3. Navigation au-delà de six observatoires. **Livré le 19 novembre** (point 2) : groupes par domaine spectral.

**Acceptation.** Ajouter un observatoire ne demande aucune modification de `app.js` : remplie.

Roman (16 au 18 novembre) : maquette NASA de 2015 allégée à 3,1 Mo et redécoupée en sept pièces, fiche, WFI et coronographe, trajet de la lumière, mission et traitements, trajectoire réelle (Horizons, objet −211), intérieur du module de service, en français et en anglais.

### H. Socle technique

- H1. Tests automatiques à chaque push. **Livré** (`tools/smoke.js`, workflow « Tests », qui vérifie aussi que `index.html` correspond aux sources).
- H2. Publication par l'intégration continue. **À faire** (point 18).
- H3. Accessibilité. **Livré en partie** : axe-core sur huit vues, deux thèmes, deux langues ; onglets aux flèches selon le motif ARIA ; vue 3D au clavier (flèches entre les pièces, Échap). Reste : point 20.
- H4. Version anglaise. **Livré**, langue par défaut depuis le 19 novembre (le français se choisit par le bouton FR, mémorisé, ou un lien `#fr-…` ; les tests imposent leur langue par le stockage local) (`src/en/`, `src/i18n.js` ; `tools/i18n-scan.js` liste ce qui n'est pas traduit). À chaque ajout de texte, compléter `src/en/`. Non traduits : `README.md`, `SPECS.md`, les commentaires du code.
- H5. Poids des maquettes. **À faire** (point 19).

### M. Mission et traitements — livré

Rubrique de la page « Mission et données » (`src/data-mission.js`) : déroulé daté, exploitation, chaîne de traitement (niveaux, suffixes, logiciels, centres), publications des données avec les dates prévues signalées, sources propres. Reste : point 8. Note : « DR1, 12 novembre 2026 » désigne la première partie de DR1 d'Euclid ; la partie complète est annoncée pour mi-2027.

## 6. Hors périmètre pour l'instant

- Télescopes au sol.
- Comptes utilisateurs, contenu modifiable en ligne.
- Simulation physique (thermique, orbitographie précise).

## Annexe : valeurs corrigées lors des vérifications

### Fiches (13 novembre)

| Observatoire | Avant | Après | Source |
|---|---|---|---|
| Hubble | masse 11 110 kg | ≈ 10 800 kg au lancement, ≈ 12 200 kg après SM4 | NASA |
| Hubble | diamètre 4,2 m | 4,3 m | NASA |
| Hubble | panneaux 7,1 × 2,6 m, ≈ 5 kW | 7,54 × 2,44 m, ≈ 5 500 W | NASA |
| Hubble | altitude ≈ 500–540 km | ≈ 480 km, sous 500 km en 2026 | NASA, The Register |
| JWST | domaine 0,6–28,8 µm | 0,6–28,5 µm | NASA |
| JWST | f/20,2 | f/20 | McElwain et al. 2023 |
| JWST | hauteur ≈ 8 m, atténuation ≈ 1 million, 2 contacts de 4 h | retirés (non confirmés) | |
| Euclid | 4,7 m × 3,7 m, ≈ 2 000 kg | 4,8 m × 3,74 m, 1 988 kg | Euclid I |
| Euclid | bande VIS 550–900 nm, CCD ≈ 150 K | 530–920 nm, 153 K | Euclid I |
| Euclid | champ ≈ 0,53 deg² | ≈ 0,54 deg² | Euclid I |
| Euclid | grisme rouge R > 380 | R ≳ 480 (bleu R ≳ 400) | Euclid I |
| Euclid | ≈ 850 Gbit par jour | ≈ 826 Gbit (ESA indiquait 850) | Euclid I |
| Gaia | plan focal ≈ 1,0 × 0,4 m | 0,42 × 0,92 m | ESA |
| Gaia | DR4 « fin 2026 » | 2 décembre 2026 | ESA Cosmos |

Ajoutés ensuite avec leur source : focale et rapport focal de Hubble (57,6 m, f/24) et écart de ses miroirs (4,9 m), Lallo 2012 ; focale d'Euclid (24,5 m, f/20,4), Racca et al. 2016 ; pare-soleil de Gaia (Ø 10,2 m), ESA ; écart primaire–secondaire de JWST (7,169 m), McElwain et al. 2023. Périodes des orbites de halo mesurées sur les éphémérides JPL Horizons.

### Pages d'instruments (14 novembre)

| Instrument | Avant | Après | Source |
|---|---|---|---|
| WFC3 | f/31 et f/11 ; S/N = 10 en 10 h | retirés ; 62 filtres UVIS, 15 IR ; bruit IR 12 e⁻ | WFC3 IHB, HST Primer |
| ACS | SBC 0,032″/px | ≈ 0,034″ × 0,030″/px, champ SBC 34,6″ × 30,5″ | ACS IHB |
| STIS | CCD 250–1100 nm ; MAMA 0,024″/px ; R (M) 10 000–20 000 | ≈ 200–1030 nm ; 0,025″/px ; 4 900–17 400 ; E140M R ≈ 45 800 | STIS DHB |
| COS | NUV 170–320 nm ; R 16 000–24 000 | 165–320 nm ; 12 000–24 000 | COS DHB |
| FGS (HST) | stabilité ≈ 0,007″ | retirée ; précision ≈ 1 mas, parallaxes ≈ 0,2 mas | HST Primer |
| NIRCam | 2048 × 2048 px ; grisme R ≈ 1 700 | 2040 × 2040 utiles ; R ≈ 1 600 à 4 µm | JDox |
| NIRSpec | champ MSA 3,4′ × 3,4′ | 3,6′ × 3,4′, volets 0,20″ × 0,46″ | JDox |
| MIRI | MRS 4,9–28,8 µm, R 1 500–3 500 ; LRS 5–12 µm | 4,9–27,9 µm, R 1 550–3 250 ; 5–14 µm, fente 0,51″ × 4,7″ | JDox |
| NIRISS | 0,8–5,0 µm, 0,065″/px | 0,6–5,0 µm, 0,066″/px | JDox |
| FGS (JWST) | ≈ 0,07″/px | ≈ 0,069″/px, 2040 px actifs | JDox |
| VIS | saturation, limite brillante 17,8, f/20,4, obstruction 11 % | retirés ; faisceau f/20 | Euclid II |
| NISP | 0,92–2,0 µm ; 0,298″/px ; ≈ 130 K | 0,95–2,02 µm ; 0,3″/px ; ≈ 135 K | Euclid III |
| Gaia astrométrie | TDI ≈ 4,4 s | 4,42 s ; parallaxe 1,3 mas à G = 21 | Prusti et al., DR3 |
| Gaia BP/RP | R ≈ 20–100 ; ≈ 220 millions de spectres | dispersion 3–27 nm/px (BP), 7–15 nm/px (RP) ; ≈ 219 millions | ESA, DR3 |
| Gaia RVS | R ≈ 11 500 | R ≈ 11 700 | Prusti et al., doc. DR2 |

### Faits des pièces (15 novembre)

Retirés faute de source : diamètre du volet de Hubble, masse du secondaire, « 10 baies », parabole de 1,3 m, nombre de panneaux et puissance d'Euclid. Corrigés : baies radiales de Hubble (WFC3 et les trois FGS), segment de JWST ≈ 20 kg, pare-soleil de Gaia (Ø 10,2 m, 12 cadres, deux couvertures), panneaux de Gaia (triple jonction, 12,8 m², 1 910 W en fin de vie), plan focal de 938 millions de pixels.
