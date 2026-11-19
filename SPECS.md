# Observatoires en orbite : spécifications

Document de travail, revu le 19 novembre 2026. Ordre de lecture : objet, public et périmètre (1), ce que fait le site (2), **ce qui reste à faire (3)**, questions à trancher (4), puis le détail de chaque lot, ses exigences et ce qui a été livré (5). Les tableaux de vérification des valeurs sont en annexe.

## 1. Objet, public et périmètre

Le site présente les télescopes spatiaux en 3D et explique comment ils sont construits, ce qu'ils mesurent et comment accéder à leurs données.

Public visé : **de l'étudiant à l'expert**. Règles pour tout le contenu :

- **Deux niveaux de lecture.** Chaque fiche se comprend sans prérequis (phrases complètes, termes définis) et donne en dessous les valeurs exactes qu'un expert vient chercher (unités, références).
- **Rien d'approximatif sans le dire.** Une valeur arrondie, estimée, mesurée sur une maquette ou schématique est signalée comme telle.
- **Toute valeur a une source.** Un expert doit pouvoir vérifier ; un étudiant doit pouvoir aller plus loin.
- **Rien n'est montré en 3D sans être documenté.** Une pièce, un équipement intérieur ou une position n'apparaît dans la maquette que si sa forme, sa taille et sa place sont publiées (ou calculées à partir de valeurs publiées, calcul indiqué).

**Périmètre (décidé le 19 novembre).**

- **Flottes d'astrophysique de la NASA, de l'ESA et du CNES** : observatoires d'astrophysique et de physique fondamentale en orbite, dont ces agences sont maîtres d'œuvre ou partenaires. Hors périmètre : système solaire, Soleil, observation de la Terre, télescopes au sol et aéroportés (SOFIA).
- **Époques** : missions en service et terminées. Les missions futures (PLATO, Ariel, LISA, NewAthena…) viennent après, avec des valeurs prévues signalées comme telles.
- **Agences et contributions** : chaque observatoire dit qui l'a conduit et qui a fourni quoi (instruments, centres de données, lanceur). Le CNES est représenté par ses missions propres (CoRoT, SVOM, MICROSCOPE) et par ses contributions aux autres (par exemple l'imageur de MIRI sur Webb, des éléments d'Euclid, le traitement de Gaia), chacune sourcée.

## 2. Ce que fait le site

- **Onze observatoires**, dans l'ordre chronologique de lancement : Hubble, Chandra, XMM-Newton, Spitzer, Fermi, Kepler, Gaia, TESS, JWST, Euclid, Roman. Navigation en deux rangées : domaines spectraux (rayons gamma, rayons X, UV et visible, infrarouge, astrométrie), boutons qui filtrent, puis observatoires du domaine choisi. Tous sont décrits par le registre `TELESCOPES` (`src/data-tele.js`) ; en ajouter un ne demande aucune modification de `app.js`.
- **Vue 3D** : maquettes réelles redécoupées en pièces cliquables, vue éclatée, éclairage « Soleil réel », Terre sous les observatoires en orbite basse, vue en coupe (à refaire, voir 3), déploiement de Webb en 13 étapes et ouverture du pare-soleil de Gaia, comparaison des tailles à l'échelle.
- **Fiche par observatoire** : chiffres clés, description, schéma d'orbite, tableaux de caractéristiques avec appels de note ; faits sourcés pour chaque pièce.
- **Mission et données**, une page par observatoire : mission et traitements ; trajet de la lumière (schéma optique, étapes, plan focal à l'échelle) ; orbite (trajectoire réelle, position en direct pour l'orbite basse, ciel observable) ; une page par instrument (à quoi ça sert, couverture spectrale, champ de vue, filtres, produits, observation réelle, code d'accès, archives).
- **Comparer** : tailles, orbites autour de L2, couvertures spectrales, champs de vue, plans focaux, tableau des instruments ; tout sur les mêmes figures, sans regroupement (à refaire, voir 3).
- **Anglais par défaut**, français par le bouton FR ou un lien `#fr-…` ; thèmes clair et sombre ; téléphone ; liens par ancre.
- Site statique sans serveur. Données réelles mises à jour par l'intégration continue (orbites et TLE chaque jour, observations quand une recette manque). Les archives et sites que le bac à sable n'atteint pas sont sondés depuis l'intégration continue (`tools/probe/`), qui peut déposer des fichiers sur la branche `probe-out`.
- Tests à chaque push : parcours complet au bureau et au téléphone, complétude du registre, traduction (`tools/smoke.js`) ; accessibilité WCAG 2.1 A et AA (`tools/a11y.js`).

## 3. Ce qui reste à faire

Classé par priorité. Entre crochets : le lot concerné (section 5).

### Priorité 1 : intérieurs, seulement ce qui est documenté [D4]

Constat (19 novembre) : les intérieurs reconstruits mêlent des éléments cotés (miroirs, coques de Chandra) et des blocs posés à des emplacements indicatifs (réservoirs, batteries, roues de réaction, boîtiers électroniques). Rendu peu crédible (empilements de boîtes et de sphères sur Euclid ; anneaux de Hubble qui sortent du tube) ; sur Webb, la coupe ne montre presque rien.

Règle : la coupe ne montre que des éléments dont la forme, la taille **et** la position sont publiées, ou calculées à partir de valeurs publiées (calcul indiqué dans la légende). Chaque élément nomme sa source au survol.

1. **Inventaire par observatoire** : pour chaque élément de `src/interior.js`, classer en « coté et placé » (garder), « coté, place inconnue » ou « ni l'un ni l'autre » (retirer). Tableau en annexe, avec la source de chaque cote.
2. **Garder et vérifier** ce qui est documenté, par exemple : miroirs primaire et secondaire de Hubble et leur écart (Lallo 2012) ; quatre paires de miroirs de Chandra, réseau HETG et position du foyer (POG) ; miroirs de Webb et leurs positions (McElwain et al. 2023) ; miroirs, plaque de base et renvois d'Euclid (Racca et al. 2016) ; banc optique de Gaia ; ouverture et obstruction de Roman.
3. **Retirer** tous les blocs à emplacement indicatif. Les équipements correspondants passent dans un **schéma d'architecture 2D** de la page « Mission et données » : liste par sous-système (propulsion, énergie, pointage, télécommunications) avec nombre, masse ou capacité et source, sans position inventée.
4. **Pas de coupe** pour un observatoire qui n'a pas assez d'éléments documentés : le bouton « Coupe » n'apparaît pas.
5. Corriger les défauts relevés : éléments qui débordent de la coque (Hubble), coupe qui ne s'enclenche pas ou ne montre rien (Webb, à vérifier pour chaque observatoire).

**Acceptation.** Aucun élément intérieur sans source pour sa taille et sa position ; `tools/smoke.js` le vérifie à partir du champ source de chaque élément.

### Priorité 2 : refaire « Comparer » : comparer ce qui est comparable [K]

Constat (19 novembre) : « Comparer » met tous les observatoires sur les mêmes figures. Les orbites ne sont comparées qu'autour de L2. Les instruments n'ont pas de type commun : le champ `kind` est un texte libre, différent pour chacun des 31 instruments, et le type n'apparaît pas dans les figures. Avec la flotte complète (une soixantaine de missions), ces figures deviendraient illisibles.

Principe : on compare **à l'intérieur d'une famille**, et le **type d'instrument se voit directement** (couleur ou pictogramme, avec une légende).

1. **Trois classifications contrôlées dans le registre**, chacune avec sa définition et sa source :
   - `orbitFamily` : orbite basse terrestre (Hubble, Fermi, Swift…), orbite terrestre très elliptique (Chandra, XMM-Newton, TESS, INTEGRAL…), autour de L2 (Webb, Euclid, Gaia, Roman, Herschel, Planck…), héliocentrique dans le sillage de la Terre (Spitzer, Kepler).
   - `missionType` : observatoire généraliste (propositions d'observation ouvertes : Hubble, Chandra, XMM-Newton, Webb…), relevé du ciel (Gaia, Euclid, Roman, WMAP, Planck, WISE, SPHEREx…), exoplanètes par transits (Kepler, TESS, CHEOPS, CoRoT), sursauts et ciel variable (Swift, Fermi GBM, SVOM…), physique fondamentale (LISA Pathfinder, MICROSCOPE). Une mission peut en avoir deux.
   - `instType` (par instrument, liste fermée) : imageur, spectrographe, spectro-imageur, photomètre, polarimètre, astrométrie, coronographe, guidage, détecteur de sursauts. Le texte libre `kind` reste comme précision.
2. **Choix de la comparaison** en tête de page : par famille d'orbite, par type de mission ou par domaine spectral. Seuls les observatoires de la famille choisie apparaissent ; un observatoire peut être ajouté à la main, et une comparaison qui mélange des familles est signalée comme telle.
3. **Orbites comparables à l'échelle**, une figure par famille : orbites terrestres basses et très elliptiques avec la Terre et la Lune ; L2 (figure actuelle) ; héliocentriques dans le sillage de la Terre (dérive en UA par an).
4. **Instruments** : sur la couverture spectrale, les champs de vue, les plans focaux et le tableau, chaque instrument porte son type, codé par une couleur et un pictogramme, avec une légende. Un filtre par type (par exemple « tous les spectrographes »). Le tableau se trie par type, domaine, champ et résolution.
5. **Tailles en 3D** : comparer à l'échelle à l'intérieur de la famille choisie (sinon Webb écrase CHEOPS) ; garder la silhouette humaine de référence.
6. Les mêmes classifications servent aux filtres de la page « Flotte » (priorité 3).

**Acceptation.** Chaque observatoire et chaque instrument a une valeur dans chaque classification, vérifiée par `tools/smoke.js` ; aucune figure ne mélange des familles sans le dire ; le type de chaque instrument se lit sans ouvrir sa fiche.

### Priorité 3 : flottes de la NASA, de l'ESA et du CNES [G5]

**Inventaire** (annexe « Flottes ») : toutes les missions d'astrophysique en orbite, en service ou terminées, avec agence maître d'œuvre, partenaires, dates, domaine, et disponibilité d'une maquette 3D de licence connue. Sources de l'inventaire : navigateur des missions de l'ESA, revue des missions en service de la NASA (Senior Review 2025), liste des missions actives du HEASARC, pages projets du CNES. Chaque statut est revérifié au moment de l'ajout.

**Ce qu'il faut ajouter au site.**

1. **Registre** : champs `agencies` (agence, rôle : maître d'œuvre, partenaire, instrument, centre de données ; source) et `status` (en service, terminé, avec dates). Le champ `domain` reste ; un observatoire peut couvrir deux domaines (INTEGRAL : gamma et X).
2. **Page « Flotte »** (catalogue) : tous les observatoires sur une frise chronologique, une barre de la date de lancement à la fin de mission, filtrables par agence (NASA, ESA, CNES), domaine, statut, famille d'orbite et type de mission (priorité 2) ; ceux qui ont une maquette s'ouvrent en 3D, les autres sur leur fiche. La navigation en deux rangées de l'en-tête reste, avec défilement, et renvoie à cette page.
3. **Fiche sans maquette** : un observatoire sans maquette 3D de licence connue a quand même sa fiche, ses instruments, son orbite et ses données ; la vue 3D affiche alors une vue de l'ESA ou de la NASA créditée, ou rien (voir question 3).
4. **Contributions** : sur chaque fiche, « Qui a fait quoi », avec un filtre par agence dans la page Flotte ; contributions du CNES sourcées une par une.

**Vagues d'ajout proposées** (à valider, question 4) :

- **Vague 1**, maquettes disponibles, missions phares : Swift, INTEGRAL, CHEOPS, Herschel, Planck, Compton (CGRO), WMAP.
- **Vague 2**, maquettes disponibles : ISO, LISA Pathfinder, Suzaku, FUSE, HETE-2, SWAS, NICER (instrument de la Station spatiale, à confirmer dans le périmètre).
- **Vague 3**, sans maquette publique connue : NuSTAR, IXPE, SPHEREx, XRISM, CoRoT, SVOM, MICROSCOPE, COBE, IRAS, IUE, Hipparcos, EXOSAT, COS-B, GALEX, WISE, RXTE, et les premiers observatoires de la NASA (Uhuru, Copernicus, HEAO 1 à 3).

**Acceptation.** Chaque mission de l'inventaire a au moins une fiche sourcée ; la page Flotte les montre toutes ; chaque contribution du CNES affichée a une source.

### Priorité 4 : contenu encore approximatif

1. **Prescriptions optiques** [D1] : schémas d'Euclid, de Gaia et de Roman à l'échelle seulement pour les éléments publiés ; courbures et positions des miroirs arrière manquent. Schéma de Gaia chargé.
2. **Plans focaux** [D2] : espaces entre détecteurs indicatifs pour Webb, Gaia, Kepler et XMM-Newton ; trois CCD de contrôle de Gaia non confirmés.
3. **Suffixes de fichiers de Webb et de Hubble** [M] : relire chaque tableau de produits.
4. **Licences des maquettes de l'ESA** [A3] : Euclid (SCIFLEET) et XMM-Newton (service SPICE) n'ont pas de licence explicite ; utilisées en les créditant (décision du 19 novembre pour XMM-Newton). Écrire à l'ESA (support SCIFLEET) pour l'ensemble des maquettes de la flotte ; à faire par l'utilisatrice.
5. Relecture de la version anglaise par un anglophone du domaine [H4].
6. Orbite de XMM-Newton : la fiche donne l'orbite du lancement (7 000 × 114 000 km), signalée comme telle ; trouver une source pour l'orbite actuelle.

### Priorité 5 : vraies données [E]

1. **Images en couleurs** : refaire les aperçus en niveaux de gris de Hubble et de Webb à partir des FITS (composition à plusieurs filtres).
2. **Figer les observations** : fixer les identifiants une fois validés, pour que le site ne change pas tout seul.
3. Spitzer : spectre IRS réel. XMM-Newton OM : une image qui couvre toute la galaxie (mosaïque de poses). Roman : premier exemple réel dès les données publiques (début 2027).
4. **Requêtes en direct depuis le navigateur** [E3] : non commencé ; dépend des règles CORS de chaque archive.

### Priorité 6 : orbites et animations [F]

1. Gaia : comparer la carte de balayage simulée à la vraie couverture de Gaia DR3.
2. Euclid : ordre des observations à l'intérieur d'un mois, via les fichiers S3 d'IRSA.
3. Afficher le facteur d'accélération des animations et permettre de choisir une date.
4. Déploiements : Roman (étapes datées connues, repliement non documenté) et Chandra (panneaux et porte) à décider.

### Priorité 7 : socle technique [H]

1. **Publication par l'intégration continue** : construire `index.html` dans GitHub Actions plutôt que le commiter.
2. **Poids des maquettes** : Euclid 6,0 Mo, Hubble 3,4 Mo, JWST 4,0 Mo ; viser moins de 3 Mo. Avec la flotte complète, budget par maquette et chargement à la demande obligatoires (déjà à la demande dans la vue 3D ; à vérifier pour « Comparer »).
3. **Tests** : parcours au clavier, un autre navigateur que Chromium, test des éléments intérieurs sourcés (priorité 1) et des classifications (priorité 2).

## 4. Questions à trancher

1. **Licence du dépôt** (code et textes) : par exemple MIT pour le code, CC BY 4.0 pour les textes.
2. **Serveur** : si une archive l'impose pour les requêtes en direct (E3), accepte-t-on un petit serveur intermédiaire, ou le site reste-t-il strictement statique ?
3. **Observatoires sans maquette 3D** (vague 3) : fiche sans vue 3D, vue officielle (image) de l'agence créditée, ou maquette schématique construite d'après les dimensions publiées et signalée comme telle ?
4. **Ordre des vagues** : celui proposé en 3 (priorité 3) convient-il ?
5. **Instruments de la Station spatiale** (NICER, AMS-02, ACES/PHARAO, CALET) : dans le périmètre ou non ?

Décidé : lots D, E, F en premier (12 novembre) ; français et anglais (12 novembre) ; Roman comme premier ajout (16 novembre) ; registre avant Chandra, puis Chandra (19 novembre) ; Spitzer, Fermi, TESS, Kepler, XMM-Newton (19 novembre) ; navigation par domaine spectral (19 novembre) ; maquette de l'ESA pour XMM-Newton, créditée faute de licence explicite (19 novembre) ; périmètre : flottes d'astrophysique NASA, ESA et CNES, missions en service et terminées, agences et contributions (19 novembre) ; intérieurs limités à ce qui est documenté (19 novembre) ; « Comparer » par familles comparables, type d'instrument visible (19 novembre).

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

### D. Trajet de la lumière et intérieur des télescopes — livré, sauf D4 à refaire

- D1. Schéma optique par observatoire. **Livré.** Entièrement à l'échelle pour Hubble (Lallo 2012) et JWST (McElwain et al. 2023, tableau 2 ; foyers calculés ; seuls les décalages latéraux de l'optique arrière sont agrandis). Euclid : diamètres, écart des miroirs, trou du primaire, plaque de base, tailles du tertiaire et des renvois (Racca et al. 2016). Gaia : banc, ouvertures, plan focal et angle de base. Roman : ouverture et obstruction publiées, écart des miroirs mesuré sur la maquette NASA. Reste : point 4.
- D2. Plans focaux à l'échelle. **Livré** (revu le 17 novembre) : WFI de Roman en arc d'après les positions de GalSim, VIS et NISP avec leurs vrais espaces (Euclid I et II), écarts des CCD de WFC3 et d'ACS, RVS de Gaia en rangées 4 à 7 (documentation DR3). Reste : point 5.
- D3. Lien dans les deux sens entre schéma et maquette 3D, avec surlignage. **Livré.**
- D4. Vue en coupe. **À refaire** (priorité 1, section 3) : les intérieurs actuels (`src/interior.js`) mêlent des éléments cotés et des blocs à emplacement indicatif (réservoirs, batteries, roues, boîtiers) ; décidé le 19 novembre de n'y garder que ce qui est documenté.

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

### G. Autres observatoires — onze livrés, flottes à compléter

- G1. Un observatoire n'est ajouté qu'avec une maquette de licence claire, un redécoupage vérifié, une fiche et des instruments sourcés.
- G2. Procédure d'ajout documentée (`tools/models/README.md`). **Livré le 19 novembre**, avec le registre : `TELESCOPES` porte couleur, chiffre clé, encombrement, pièces optiques, place et orientation dans « Comparer », place dans la figure des plans focaux, fin de mission, déploiement ; matériaux dans `src/looks.js` ; `tools/smoke.js` liste ce qui manque à une entrée.
- Chandra (19 novembre) : maquette NASA 3D Resources (0,8 Mo) redécoupée en six pièces (porte, module, miroirs HRMA, banc optique, module scientifique ISIM, panneaux solaires), fiche, ACIS, HRC, HETG et LETG avec axe spectral étendu aux rayons X (keV), schéma Wolter I à l'échelle, plans focaux ACIS et HRC-I, mission et traitements (niveaux 0 à 3, CSC 2.1), orbite très elliptique (Horizons, objet −151, schéma d'orbite à l'échelle). Le registre a suffi, sauf pour un nouveau type d'orbite (« heo ») ajouté au schéma d'orbite de l'application. Observations réelles de l'archive CDA. Vue en coupe : quatre paires de miroirs à l'échelle, réseau HETG à 8,6 m du foyer, ACIS et HRC sur la table de translation, six roues de réaction, deux centrales inertielles, trois batteries et l'enregistreur (Weisskopf et al. 2000 et 2005, Canizares et al. 2005) ; trois plans de coupe (avant, tube, module d'instruments). Les intérieurs peuvent désormais être décrits dans le repère du fichier glTF (`frame = 'file'`).
- Spitzer (19 novembre) : maquette NASA 3D Resources (1,1 Mo) redécoupée en cinq pièces, fiche, IRAC, IRS et MIPS, schéma optique à l'échelle d'après la prescription du Spitzer Telescope Handbook (tableau 3.3), champs projetés sur le plan focal, mission et traitements (niveaux 0 à 3), orbite autour du Soleil tracée sur toute la mission (Horizons, objet −79, repère tournant avec la Terre ; nouveau type `helio`, qui servira aussi à Kepler), ciel observable (82,5° à 120° du Soleil). Restent : spectre IRS réel, vue en coupe.
- Fermi (19 novembre) : maquette NASA 3D Resources allégée à 2,0 Mo et redécoupée en cinq pièces (LAT, détecteurs du GBM, module, antenne Ku, panneaux), mise à l'échelle sur l'envergure publiée ; fiche, LAT et GBM ; nouveau domaine « rayons gamma » ; axe spectral étendu aux rayons gamma, gradué en énergie ; schéma de principe d'une tour du LAT (conversion de paires) ; mission et traitements ; orbite basse avec suivi en direct (TLE CelesTrak, NORAD 33053 : l'orbite basse est devenue générique, paramètres par observatoire) ; observations réelles : carte des sources 4FGL-DR4 et durées des sursauts du GBM (HEASARC). Spitzer : images réelles d'IRAC (M51 en trois couleurs) et de MIPS (24 µm), mosaïques SEIP de l'IRSA ; spectre IRS à faire.
- TESS (19 novembre) : maquette NASA 3D Resources (version B) redécoupée en cinq pièces (caméras, écran conique, module, antenne, panneaux), mise à l'échelle sur la longueur déployée (3,9 m) ; deux matériaux portaient une carte de normales comme couleur, corrigé dans `looks.js`. Orbite HEO réelle (JPL Horizons, -95, repère inertiel), schéma des quatre caméras et de leurs 16 CCD à l'échelle, coupe d'une caméra (focale déduite ≈ 147 mm), courbe de lumière réelle de WASP-18 (SPOC, 2 min). Écran conique : présent dans la maquette, signalé comme tel.
- Kepler (19 novembre) : maquette NASA 3D Resources (version A), en mètres, redécoupée en quatre pièces (photomètre, panneaux, module, antenne). Orbite héliocentrique réelle (JPL Horizons, -227, 2009–2018), schéma de Schmidt à l'échelle (lame au centre de courbure et diamètre du plan focal déduits), plan focal de 42 CCD et 4 viseurs, courbe de lumière réelle de HAT-P-7 (un trimestre, longue cadence). Sources : dossier de presse 2009, Kepler Instrument Handbook, NASA Science.
- XMM-Newton (19 novembre) : maquette de l'ESA (service SPICE, pour Cosmographia) ; aucune licence n'étant indiquée, l'utilisatrice a choisi de l'utiliser en la créditant à l'ESA. Récupérée par la sonde (le bac à sable n'atteint pas l'ESAC ; la sonde pousse ses fichiers sur la branche probe-out). Redécoupée en six pièces, mise à l'échelle sur l'envergure (16 m), métal ramené à 0,15 dans `looks.js`. Orbite HEO réelle (Horizons, identifiant cherché par nom), visibilité 70°–110° du Soleil, schéma d'un télescope (8 coques sur 58, échelle radiale ×4), plans focaux EPIC/RGS, données réelles du miroir HEASARC : Cas A en trois bandes (EPIC), spectre fluxed de Capella (RGS), M101 en UVW1 (OM).
- G3. Navigation au-delà de six observatoires. **Livré le 19 novembre** : deux rangées, domaines spectraux (boutons qui filtrent) puis observatoires du domaine choisi ; même navigation dans « Mission et données ». À revoir pour la flotte complète (G5).
- G4. Couleurs des maquettes vérifiées le 19 novembre face aux illustrations de référence (articles Wikipédia, NASA, ESA) : XMM-Newton (normales perdues à la conversion, rétablies ; teintes de la vue SCIFLEET), Chandra (couverture argentée, cellules bleues), Kepler (or froissé : la texture jaune sert de relief), TESS (cellules sombres, écran argenté), Roman (tube argenté). `looks.js` reçoit la pièce qui porte chaque matériau. Hubble, JWST, Gaia, Euclid, Fermi et Spitzer conformes.
- G5. Flottes NASA, ESA et CNES. **À faire** (priorité 2, section 3).

**Acceptation.** Ajouter un observatoire ne demande aucune modification de `app.js` : remplie.

Roman (16 au 18 novembre) : maquette NASA de 2015 allégée à 3,1 Mo et redécoupée en sept pièces, fiche, WFI et coronographe, trajet de la lumière, mission et traitements, trajectoire réelle (Horizons, objet −211), intérieur du module de service, en français et en anglais.

### H. Socle technique

- H1. Tests automatiques à chaque push. **Livré** (`tools/smoke.js`, workflow « Tests », qui vérifie aussi que `index.html` correspond aux sources).
- H2. Publication par l'intégration continue. **À faire** (point 18).
- H3. Accessibilité. **Livré en partie** : axe-core sur huit vues, deux thèmes, deux langues ; onglets aux flèches selon le motif ARIA ; vue 3D au clavier (flèches entre les pièces, Échap). Reste : point 20.
- H4. Version anglaise. **Livré**, langue par défaut depuis le 19 novembre (le français se choisit par le bouton FR, mémorisé, ou un lien `#fr-…` ; les tests imposent leur langue par le stockage local) (`src/en/`, `src/i18n.js` ; `tools/i18n-scan.js` liste ce qui n'est pas traduit). À chaque ajout de texte, compléter `src/en/`. Non traduits : `README.md`, `SPECS.md`, les commentaires du code.
- H5. Poids des maquettes. **À faire** (point 19).

### K. Comparer — à refaire

Exigences et acceptation : priorité 2, section 3. Livré jusqu'ici : tailles à l'échelle en 3D, orbites autour de L2, couverture spectrale, champs de vue, plans focaux, tableau des instruments, pour tous les observatoires à la fois.

### M. Mission et traitements — livré

Rubrique de la page « Mission et données » (`src/data-mission.js`) : déroulé daté, exploitation, chaîne de traitement (niveaux, suffixes, logiciels, centres), publications des données avec les dates prévues signalées, sources propres. Reste : point 8. Note : « DR1, 12 novembre 2026 » désigne la première partie de DR1 d'Euclid ; la partie complète est annoncée pour mi-2027.

## 6. Hors périmètre pour l'instant

- Missions du système solaire, du Soleil et d'observation de la Terre.
- Télescopes au sol et aéroportés.
- Missions futures (après la flotte en service et terminée).
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


## Annexe : flottes d'astrophysique (inventaire du 19 novembre, statuts à revérifier à chaque ajout)

Légende des maquettes : **sur le site** ; NASA = dépôt NASA 3D Resources ; SCIFLEET = vue 3D de l'ESA (licence non précisée) ; — = aucune maquette publique trouvée.

### NASA (maître d'œuvre ou partenaire principal)

| Mission | Partenaires | Lancement – fin | Domaine | Maquette |
|---|---|---|---|---|
| Hubble | ESA | 1990 – en service | UV, visible, proche IR | **sur le site** |
| Chandra | | 1999 – en service | X | **sur le site** |
| Swift (Neil Gehrels) | Italie, Royaume-Uni | 2004 – en service (orbite en baisse, à vérifier) | gamma, X, UV | NASA |
| Fermi | France, Italie, Japon, Suède, Allemagne | 2008 – en service | gamma | **sur le site** |
| NuSTAR | | 2012 – en service | X durs | — |
| TESS | | 2018 – en service | visible | **sur le site** |
| NICER (Station spatiale) | | 2017 – en réparation | X | NASA (SEXTANT) |
| IXPE | Italie (ASI) | 2021 – en service | X (polarimétrie) | — |
| JWST | ESA, CSA ; CNES (MIRI) | 2021 – en service | IR | **sur le site** |
| XRISM | JAXA (maître d'œuvre), ESA | 2023 – en service | X | — |
| SPHEREx | | 2025 – en service | IR | — |
| Roman | | 2026 – en service | IR | **sur le site** |
| Spitzer | | 2003 – 2020 | IR | **sur le site** |
| Kepler | | 2009 – 2018 | visible | **sur le site** |
| WISE / NEOWISE | | 2009 – 2024 | IR | — |
| GALEX | | 2003 – 2013 | UV | — |
| WMAP | | 2001 – 2010 | micro-ondes | NASA |
| FUSE | Canada, France | 1999 – 2007 | UV lointain | NASA |
| RXTE | | 1995 – 2012 | X | — |
| Compton (CGRO) | | 1991 – 2000 | gamma | NASA |
| COBE | | 1989 – 1993 | micro-ondes, IR | — |
| Suzaku | JAXA (maître d'œuvre) | 2005 – 2015 | X | NASA |
| HETE-2 | Japon, France | 2000 – 2008 | gamma, X | NASA |
| SWAS | | 1998 – 2005 | submillimétrique | NASA |
| IRAS | Pays-Bas, Royaume-Uni | 1983 | IR | — |
| IUE | ESA, Royaume-Uni | 1978 – 1996 | UV | — |
| HEAO 1, 2 (Einstein), 3 | | 1977 – 1981 | X, gamma | — |
| Copernicus (OAO-3) | | 1972 – 1981 | UV, X | — |
| Uhuru | | 1970 – 1973 | X | — |

### ESA (navigateur des missions scientifiques)

| Mission | Partenaires | Lancement – fin | Domaine | Maquette |
|---|---|---|---|---|
| XMM-Newton | | 1999 – en service | X | **sur le site** (service SPICE) |
| INTEGRAL | Russie, États-Unis ; CNES (SPI) | 2002 – observations arrêtées en 2025 | gamma, X | SCIFLEET |
| Gaia | CNES (traitement des données) | 2013 – 2025 | astrométrie | **sur le site** |
| CHEOPS | Suisse (partenariat avec l'ESA) | 2019 – en service | visible | SCIFLEET |
| Euclid | NASA ; CNES | 2023 – en service | visible, proche IR | **sur le site** |
| Herschel | NASA | 2009 – 2013 | IR lointain | SCIFLEET |
| Planck | NASA ; CNES (HFI) | 2009 – 2013 | micro-ondes | SCIFLEET |
| ISO | NASA, Japon | 1995 – 1998 | IR | SCIFLEET |
| Hipparcos | | 1989 – 1993 | astrométrie | — |
| EXOSAT | | 1983 – 1986 | X | — |
| COS-B | | 1975 – 1982 | gamma | — |
| LISA Pathfinder | NASA | 2015 – 2017 | physique fondamentale | SCIFLEET |
| Participations : Hubble, JWST, XRISM, Einstein Probe (Chine), Roman | | | | |

### CNES

| Mission | Rôle du CNES | Lancement – fin | Domaine | Maquette |
|---|---|---|---|---|
| CoRoT | maître d'œuvre, avec l'ESA, l'Autriche, la Belgique, l'Allemagne, l'Espagne et le Brésil | 2006 – 2013 | visible (sismologie stellaire, exoplanètes) | — |
| SVOM | coopération avec la Chine (CNSA) | 2024 – en service | gamma, X | — |
| MICROSCOPE | maître d'œuvre, avec l'ONERA | 2016 – 2018 | physique fondamentale | — |
| Contributions à sourcer | ISO, XMM-Newton, INTEGRAL (SPI), FUSE, HETE-2, Herschel, Planck (HFI), Fermi, Gaia (centre de traitement), JWST (MIRI), Euclid, CHEOPS ; futures : PLATO, Ariel, LISA, NewAthena (X-IFU) | | | |

Sources : [ESA, navigateur des missions](https://www.esa.int/Science_Exploration/Space_Science/Mission_navigator) ; [NASA, Senior Review 2025](https://science.nasa.gov/astrophysics/resources/documents/2025-senior-review-of-operating-missions) ; [HEASARC, missions actives](https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/active.html) ; [CNES, projets](https://cnes.fr/projets-liste-alphabetique) ; [CNES, rapport COSPAR 2026](https://cnes.fr/sites/default/files/2026-05/rapport-cospar-2026.pdf). Dates de fin et partenaires non tirés de ces pages : à vérifier mission par mission lors de l'ajout.
