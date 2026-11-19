/* =================================================================
   MISSION ET TRAITEMENTS : onglet « Mission » de chaque fiche
   Textes en paires [français, anglais]. Chaque fait porte une ou plusieurs clés de source :
   celles de MISSION[id].refs, ou à défaut celles de la fiche (TELESCOPES[…].refs).
   phases : [date FR, date EN, titre FR, titre EN, texte FR, texte EN, sources]
   ops    : [libellé FR, libellé EN, valeur FR, valeur EN, sources]
   chain  : étapes de la chaîne de traitement { lv: niveau ou suffixe, n: nom, x: ce qui est fait, sw: logiciel ou lieu, r: sources }
   rel    : [date FR, date EN, nom, texte FR, texte EN, sources, prévue]
================================================================= */
var MISSION = {
  hubble: {
    checked:'2026-11-16',
    refs:{
      sm:{ t:'Hubble Space Telescope Servicing Missions, fact sheet', p:'NASA', u:'https://smd-cms.nasa.gov/wp-content/uploads/2023/04/hst-servicing-missions-fact-sheet.pdf' },
      pdata:{ t:'HST Primer for Cycle 34, Data Processing and the HST Data Archive', p:'STScI', u:'https://hst-docs.stsci.edu/hsp/the-hubble-space-telescope-primer-for-cycle-34/hst-primer-data-processing-and-the-hst-data-archive' },
      wfc3:{ t:'WFC3 Data Handbook, 3.1 The calwf3 Data Processing Pipeline', p:'STScI', u:'https://hst-docs.stsci.edu/wfc3dhb/chapter-3-wfc3-data-calibration/3-1-the-calwf3-data-processing-pipeline' },
      acs:{ t:'ACS Data Handbook, 3.2 Pipeline Overview', p:'STScI', u:'https://hst-docs.stsci.edu/acsdhb/chapter-3-acs-calibration-pipeline/3-2-pipeline-overview' }
    },
    intro:["Hubble est le seul télescope spatial conçu pour être réparé en orbite : cinq missions de la navette l'ont entretenu et ont changé presque tous ses instruments. Le Space Telescope Science Institute (STScI), à Baltimore, choisit les observations, calibre toutes les données et les archive.",
           "Hubble is the only space telescope designed to be repaired in orbit: five Shuttle missions serviced it and replaced almost all its instruments. The Space Telescope Science Institute (STScI) in Baltimore selects the observations, calibrates all the data and archives them."],
    phases:[
      ['24 avril 1990','24 April 1990','Lancement','Launch',"La navette Discovery (STS-31) place Hubble sur une orbite basse.","Space Shuttle Discovery (STS-31) puts Hubble in low Earth orbit.",'lallo'],
      ['1990','1990','Le miroir est mal poli','The mirror is mis-figured',"Les premières images sont floues : le miroir primaire a une aberration sphérique, due à une erreur lors de son polissage.","The first images are blurred: the primary mirror has spherical aberration, caused by an error during polishing.",'lallo'],
      ['2–13 déc. 1993','2–13 Dec 1993','Mission de service 1 (STS-61)','Servicing Mission 1 (STS-61)',"COSTAR, une « lentille de contact », corrige la vue des instruments ; la caméra WFPC2 remplace la première caméra ; nouveaux panneaux solaires et gyroscopes.","COSTAR, a 'contact lens', corrects the instruments' view; the WFPC2 camera replaces the first camera; new solar arrays and gyroscopes.",'sm'],
      ['11–21 févr. 1997','11–21 Feb 1997','Mission de service 2 (STS-82)','Servicing Mission 2 (STS-82)',"STIS et NICMOS sont installés : Hubble gagne l'infrarouge proche. Un capteur de guidage fin et un enregistreur à état solide sont aussi remplacés.","STIS and NICMOS are installed: Hubble gains the near infrared. A fine guidance sensor and a solid-state recorder are also replaced.",'sm'],
      ['19–27 déc. 1999','19–27 Dec 1999','Mission de service 3A (STS-103)','Servicing Mission 3A (STS-103)',"Mission avancée après la panne d'un gyroscope le 13 novembre 1999, qui avait mis Hubble en mode survie : six gyroscopes neufs et un ordinateur plus rapide.","Brought forward after a gyroscope failure on 13 November 1999 put Hubble in safe mode: six new gyroscopes and a faster computer.",'sm'],
      ['1–12 mars 2002','1–12 March 2002','Mission de service 3B (STS-109)','Servicing Mission 3B (STS-109)',"La caméra ACS remplace FOC, dernier instrument d'origine. Panneaux solaires rigides et nouvelle unité de contrôle de puissance : Hubble est mis entièrement hors tension pour la première fois.","The ACS camera replaces FOC, the last original instrument. Rigid solar arrays and a new power control unit: Hubble is fully powered down for the first time.",'sm'],
      ['11–24 mai 2009','11–24 May 2009','Mission de service 4 (STS-125)','Servicing Mission 4 (STS-125)',"Dernière visite : WFC3 et COS installés, STIS et ACS réparés, batteries et gyroscopes neufs, et un mécanisme d'amarrage pour une future désorbitation.","Last visit: WFC3 and COS installed, STIS and ACS repaired, new batteries and gyroscopes, and a capture fixture for a future deorbit.",'sm'],
      ['juin 2024','June 2024','Un seul gyroscope','One-gyro mode',"Trois des six gyroscopes fonctionnent encore. Hubble n'en utilise plus qu'un et garde un autre en réserve ; la plupart des observations ne sont pas affectées.","Three of the six gyroscopes still work. Hubble now uses only one and keeps another in reserve; most observations are unaffected.",'gyro']
    ],
    ops:[
      ['Programme scientifique et données','Science programme and data','STScI, Baltimore','STScI, Baltimore','pdata'],
      ['Liaison','Link','bande S, par les satellites relais TDRS','S band, via the TDRS relay satellites','primer'],
      ['Accès exclusif','Exclusive access','en général 6 mois après l\'observation, puis données publiques','usually 6 months after observation, then public','pdata'],
      ['Archive','Archive','MAST (Barbara A. Mikulski Archive for Space Telescopes)','MAST (Barbara A. Mikulski Archive for Space Telescopes)','pdata']
    ],
    chain:{
      intro:["Le pipeline de production du STScI traite automatiquement chaque pose avec les meilleurs fichiers de calibration du moment, et retraite l'archive quand ils changent.",
             "STScI's production pipeline automatically processes every exposure with the best calibration files available, and reprocesses the archive when they change."],
      steps:[
        { lv:'_raw', n:['Télémétrie découpée en poses','Telemetry split into exposures'], x:['Les données reçues sont mises en forme et découpées en fichiers FITS bruts, un par pose.','Received data are edited and split into raw FITS files, one per exposure.'], sw:'STScI', r:'pdata' },
        { lv:'_flt  _flc', n:['Calibration de chaque pose','Calibration of each exposure'], x:['Biais, courant d\'obscurité, champ plat, conversion en électrons ; _flc ajoute la correction de l\'efficacité de transfert de charge des CCD.','Bias, dark current, flat field, conversion to electrons; _flc adds the correction for CCD charge transfer efficiency.'], sw:'HSTCal (calwf3, calacs, calstis), CalCOS', r:['pdata','wfc3','acs'] },
        { lv:'_drz  _drc', n:['Combinaison des poses','Combining exposures'], x:['AstroDrizzle corrige la distorsion géométrique et combine les poses décalées en une seule image.','AstroDrizzle corrects the geometric distortion and combines dithered exposures into a single image.'], sw:'AstroDrizzle (drizzlepac)', r:'wfc3' },
        { lv:'HAP', n:['Produits avancés','Advanced products'], x:['Mosaïques par visite et multi-visites, et catalogues de sources, produits pour toute l\'archive.','Single-visit and multi-visit mosaics, and source catalogues, produced across the archive.'], sw:'Hubble Advanced Products', r:'pdata' },
        { lv:'MAST', n:['Archive et retraitement','Archive and reprocessing'], x:['Recherche et téléchargement (portail et astroquery). Une donnée en attente de retraitement est en général prête en quelques heures.','Search and download (portal and astroquery). Data queued for reprocessing are usually ready within a few hours.'], sw:'MAST', r:'pdata' }
      ]
    },
    rel:null
  },

  jwst: {
    checked:'2026-11-16',
    refs:{
      dec:{ t:'Webb Blog, December 2021 (déploiements)', p:'NASA', u:'https://science.nasa.gov/blogs/webb/2021/12/' },
      sfn:{ t:'Astronomers breathe sigh of relief with final Webb telescope deployment milestone (10 janvier 2022)', p:'Spaceflight Now', u:'https://spaceflightnow.com/2022/01/10/astronomers-breathe-sigh-of-relief-with-final-webb-telescope-deployment-milestone/' },
      l2:{ t:'Webb has arrived at L2 (24 janvier 2022)', p:'ESA', u:'https://esa.int/Science_Exploration/Space_Science/Webb/Webb_has_arrived_at_L2' },
      ar:{ t:'STScI Annual Report 2022, The Future Is Here', p:'STScI', u:'https://www.stsci.edu/contents/annual-reports/2022/the-future-is-here' },
      rights:{ t:'JWST Data Rights and Duplications (cycle 5)', p:'STScI, JDox', u:'https://jwst-docs.stsci.edu/jwst-opportunities-and-policies/jwst-call-for-proposals-for-cycle-5/jwst-data-rights-and-duplications' },
      pipe:{ t:'JWST pipeline, Pipeline Stages', p:'STScI', u:'https://jwst-pipeline.readthedocs.io/en/stable/jwst/pipeline/main.html' },
      stages:{ t:'Stages of JWST Data Processing', p:'STScI, JDox', u:'https://jwst-docs.stsci.edu/jwst-science-calibration-pipeline/stages-of-jwst-data-processing' }
    },
    intro:["Webb est exploité par le STScI, à Baltimore, qui choisit aussi les observations, calibre les données et les archive dans MAST. Les données descendent chaque jour vers le Deep Space Network de la NASA.",
           "Webb is operated by STScI in Baltimore, which also selects the observations, calibrates the data and archives them in MAST. Data come down every day to NASA's Deep Space Network."],
    phases:[
      ['25 déc. 2021','25 Dec 2021','Lancement','Launch',"Ariane 5 depuis Kourou. Le voyage vers L2 dure un mois.","Ariane 5 from Kourou. The trip to L2 takes a month.",['fs','l2']],
      ['25 déc. 2021 – 8 janv. 2022','25 Dec 2021 – 8 Jan 2022','Déploiements','Deployments',"Panneau solaire, antenne, bouclier, tour, miroir secondaire, puis les deux ailes du primaire (bouton « Déploiement » de la vue 3D).","Solar array, antenna, sunshield, tower, secondary mirror, then the two primary wings ('Deployment' button in the 3D view).",['dec','sfn']],
      ['24 janv. 2022','24 Jan 2022','Arrivée autour de L2','Arrival around L2',"Une poussée de 297 secondes place Webb sur son orbite. Commence l'alignement des 18 segments, à quelques nanomètres près.","A 297-second burn puts Webb on its orbit. Aligning the 18 segments to within nanometres begins.",'l2'],
      ['janv. – juil. 2022','Jan – Jul 2022','Mise en service','Commissioning',"Environ six mois, jour et nuit : alignement de l'optique, réglage des quatre instruments et préparation de la chaîne de traitement.","About six months, around the clock: optics alignment, instrument checkout and pipeline preparation.",'ar'],
      ['12 juil. 2022','12 Jul 2022','Premières images, début de la science','First images, science begins',"Les premières images en couleurs marquent le début officiel des opérations scientifiques ; les données sont aussitôt publiques dans MAST.","The first full-colour images mark the official start of science operations; the data are immediately public in MAST.",'ar']
    ],
    ops:[
      ['Exploitation et données','Operations and data','STScI, Baltimore','STScI, Baltimore','ar'],
      ['Liaison science','Science link','bande Ka, jusqu\'à 28 Mbit/s, Deep Space Network','Ka band, up to 28 Mbit/s, Deep Space Network','ie'],
      ['Volume','Volume','jusqu\'à 57 Go par jour','up to 57 GB per day','ie'],
      ['Accès exclusif','Exclusive access','12 mois par défaut (petits et moyens programmes) ; aucun pour les grands programmes','12 months by default (small and medium programmes); none for large programmes','rights'],
      ['Archive','Archive','MAST','MAST','ar']
    ],
    chain:{
      intro:["La chaîne de calibration de Webb est un logiciel libre en Python, organisé en trois étapes. Les fichiers de référence (champs plats, obscurité, linéarité…) viennent du système CRDS et sont mis à jour en continu.",
             "Webb's calibration pipeline is open-source Python software in three stages. Reference files (flats, darks, linearity…) come from the CRDS system and are updated continuously."],
      steps:[
        { lv:'_uncal', n:['Rampes non calibrées','Uncalibrated ramps'], x:['Les détecteurs sont lus plusieurs fois pendant une pose : chaque pixel donne une « rampe » de valeurs croissantes.','Detectors are read several times during an exposure: each pixel gives a \'ramp\' of increasing values.'], sw:'MAST', r:'stages' },
        { lv:'_rate', n:['Étape 1 : détecteur','Stage 1: detector'], x:['Saturation, biais, linéarité, obscurité, sauts dus aux rayons cosmiques, puis pente de chaque rampe : un taux de comptage par pixel.','Saturation, bias, linearity, dark, cosmic-ray jumps, then the slope of each ramp: a count rate per pixel.'], sw:'calwebb_detector1', r:['pipe','stages'] },
        { lv:'_cal  _s2d  _x1d', n:['Étape 2 : chaque pose','Stage 2: each exposure'], x:['Selon le mode : champ plat, calibration absolue du flux, coordonnées sur le ciel ; extraction des spectres en 2D et 1D.','Depending on the mode: flat field, absolute flux calibration, sky coordinates; extraction of 2D and 1D spectra.'], sw:'calwebb_image2, calwebb_spec2', r:['pipe','stages'] },
        { lv:'_i2d  _s3d  _cat', n:['Étape 3 : combinaison','Stage 3: combination'], x:['Les poses sont recalées et combinées : mosaïque, cube spectral, spectres combinés, catalogue de sources. Des variantes traitent la coronographie, l\'interférométrie (AMI) et les séries temporelles.','Exposures are aligned and combined: mosaic, spectral cube, combined spectra, source catalogue. Variants handle coronagraphy, interferometry (AMI) and time series.'], sw:'calwebb_image3, spec3, coron3, ami3, tso3', r:['pipe','stages'] }
      ]
    },
    rel:null
  },

  euclid: {
    checked:'2026-11-16',
    refs:{
      tl:{ t:'Euclid, Timeline', p:'ESA', u:'https://www.cosmos.esa.int/web/euclid/timeline' },
      dr1tl:{ t:'Euclid, DR1 Timeline', p:'ESA', u:'https://www.cosmos.esa.int/web/euclid/dr1-timeline' },
      memo:{ t:'Euclid DR1 content, mémo EUCL-EST-ME-8-020 (projet, version 1.1)', p:'ESA', u:'https://www.cosmos.esa.int/documents/10647/12245842/DR1-memo_250624.pdf/' },
      sgs:{ t:'The Science Ground Segment', p:'Consortium Euclid', u:'https://www.euclid-ec.org/public/data/ground-segment/' },
      q1:{ t:'Euclid data release: Q1', p:'Consortium Euclid', u:'https://www.euclid-ec.org/science/q1/' },
      dpc:{ t:'Dabin et al. 2017, The Euclid Data Processing Challenges (arXiv:1701.08158)', p:'IAU Symposium 325', u:'https://arxiv.org/abs/1701.08158' }
    },
    intro:["Euclid est piloté depuis l'ESOC, à Darmstadt. Le centre des opérations scientifiques de l'ESA, à l'ESAC près de Madrid, planifie le relevé et met les données en forme ; le consortium Euclid les traite ensuite dans 9 centres de données scientifiques qui font tourner la même chaîne.",
           "Euclid is flown from ESOC in Darmstadt. ESA's Science Operations Centre at ESAC near Madrid plans the survey and formats the data; the Euclid Consortium then processes them in 9 Science Data Centres that all run the same pipeline."],
    phases:[
      ['1er juil. 2023','1 Jul 2023','Lancement','Launch',"Falcon 9 depuis Cap Canaveral, vers L2.","Falcon 9 from Cape Canaveral, to L2.",'tl'],
      ['14 févr. 2024','14 Feb 2024','Début du relevé','Survey starts',"Début du relevé nominal : environ 14 000 deg² en six ans, plus trois champs profonds.","Start of the nominal survey: about 14,000 deg² in six years, plus three deep fields.",['tl','e1']],
      ['mai 2024','May 2024','Premières observations publiées','Early Release Observations',"Publication des données des observations de démonstration.","Release of the Early Release Observations data.",'tl'],
      ['21 mai 2025','21 May 2025','Fin des données de DR1','End of DR1 data',"DR1 rassemble les 15 premiers mois du relevé large, depuis le 14 février 2024.","DR1 gathers the first 15 months of the Wide survey, since 14 February 2024.",'memo']
    ],
    ops:[
      ['Pilotage','Flight operations','ESOC, Darmstadt (ESA)','ESOC, Darmstadt (ESA)','e1'],
      ['Opérations scientifiques','Science operations','SOC de l\'ESA, ESAC (Espagne) : planification du relevé, contrôle rapide, mise en forme','ESA SOC, ESAC (Spain): survey planning, quick-look, formatting',['e1','sgs']],
      ['Traitement','Processing','consortium Euclid, 9 centres de données scientifiques (SDC)','Euclid Consortium, 9 Science Data Centres (SDCs)',['e1','sgs']],
      ['Liaison science','Science link','bande K, 55 Mbit/s, 4 h par jour','K band, 55 Mbit/s, 4 h per day','ops'],
      ['Volume','Volume','≈ 826 Gbit compressés par jour','≈ 826 Gbit compressed per day','e1'],
      ['Archive','Archive','ESA Euclid Science Archive ; copie à l\'IRSA (NASA)','ESA Euclid Science Archive; mirror at IRSA (NASA)','dr1']
    ],
    chain:{
      intro:["Les données sont classées en trois niveaux : LE1 (brutes), LE2 (images, catalogues et spectres calibrés), LE3 (produits pour la cosmologie). Chaque fonction de traitement est conçue par une unité du consortium (OU) puis exécutée dans les SDC ; chaque jeu de données est conservé dans au moins deux SDC.",
             "Data come in three levels: LE1 (raw), LE2 (calibrated images, catalogues and spectra), LE3 (products for cosmology). Each processing function is designed by a consortium unit (OU) and run in the SDCs; every dataset is kept in at least two SDCs."],
      steps:[
        { lv:'LE1', n:['Données brutes','Raw data'], x:['Le SOC convertit la télémétrie et les fichiers bruts en FITS et les verse dans l\'archive de traitement. Un traitement « au fil de l\'eau » surveille l\'état des instruments.','The SOC converts telemetry and raw files to FITS and ingests them into the processing archive. On-the-fly processing monitors instrument health.'], sw:['SOC, ESAC','SOC, ESAC'], r:['e1','memo'] },
        { lv:'LE2', n:['VIS, NIR, SIR, EXT : calibration','VIS, NIR, SIR, EXT: calibration'], x:['Nettoyage et calibration des images visibles (VIS), des images infrarouges (NIR), des spectres sans fente (SIR) et des images des télescopes au sol (EXT, filtres g, r, i, z).','Cleaning and calibration of visible images (VIS), infrared images (NIR), slitless spectra (SIR) and ground-based images (EXT, g, r, i, z filters).'], sw:['fonctions VIS, NIR, SIR, EXT','VIS, NIR, SIR, EXT functions'], r:['dpc','sgs'] },
        { lv:'LE2', n:['MER : fusion','MER: merging'], x:['Fusion de toutes les images : détection des sources, mosaïques et catalogue de flux dans les sept filtres.','Merging all images: source detection, mosaics and a flux catalogue in the seven filters.'], sw:['fonction MER','MER function'], r:'dpc' },
        { lv:'LE2', n:['PHZ, SPE, SHE : mesures','PHZ, SPE, SHE: measurements'], x:['Distances des galaxies par leurs couleurs (PHZ) et par leurs spectres (SPE), et mesure de leur forme pour le cisaillement gravitationnel (SHE).','Galaxy distances from their colours (PHZ) and spectra (SPE), and shape measurement for weak lensing (SHE).'], sw:['fonctions PHZ, SPE, SHE','PHZ, SPE, SHE functions'], r:'dpc' },
        { lv:'LE3', n:['Produits pour la cosmologie','Cosmology products'], x:['Agrégation des galaxies, cisaillement, amas : les mesures qui contraignent l\'énergie noire et la matière noire.','Galaxy clustering, shear, clusters: the measurements that constrain dark energy and dark matter.'], sw:['fonction LE3','LE3 function'], r:['dpc','dr1tl'] }
      ],
      note:["Une dixième unité, SIM, produit des données simulées pour tester toute la chaîne avant et pendant la mission.","A tenth unit, SIM, produces simulated data to test the whole pipeline before and during the mission."], noteR:'dpc'
    },
    rel:[
      ['19 mars 2025','19 Mar 2025','Q1',"Première publication rapide : ≈ 63 deg² des champs profonds.","First quick release: ≈ 63 deg² of the deep fields.",['tl','q1'],false],
      ['24 juin 2026','24 Jun 2026','Q2',"Deuxième publication rapide.","Second quick release.",'tl',false],
      ['12 nov. 2026','12 Nov 2026',['DR1, première partie','DR1, first part'],"Données brutes, images calibrées, catalogues et spectres (LE1 et LE2) sur ≈ 1 900 deg².","Raw data, calibrated images, catalogues and spectra (LE1 and LE2) over ≈ 1,900 deg².",['tl','dr1tl'],false],
      ['mi-2027','mid-2027',['DR1 complète','Full DR1'],"Ajoute les produits LE3 pour l'agrégation des galaxies et le cisaillement gravitationnel.","Adds the LE3 products for galaxy clustering and weak lensing.",'dr1tl',true],
      ['juin 2029','June 2029','DR2',"Date provisoire.","Tentative date.",'tl',true],
      ['oct. 2031','Oct 2031','DR3',"Date provisoire.","Tentative date.",'tl',true]
    ]
  },

  roman: {
    checked:'2026-11-16',
    refs:{
      tl:{ t:'History of the Roman Mission', p:'NASA', u:'https://science.nasa.gov/mission/roman-space-telescope/timeline' }
    },
    intro:["Roman est piloté depuis le centre Goddard de la NASA. Le STScI, à Baltimore, planifie les observations, traite les images du grand champ et les archive avec l'ESA ; le centre de support scientifique, que l'IPAC exploite avec le Laboratoire d'astrophysique de Marseille, s'occupe du coronographe.",
           "Roman is operated from NASA Goddard. STScI in Baltimore plans the observations, processes the wide-field images and archives them, with ESA; the Science Support Center, run by IPAC with the Laboratoire d'Astrophysique de Marseille, handles the coronagraph."],
    phases:[
      ['2010','2010','Priorité de la décennie','Decadal priority',"Le projet, alors appelé WFIRST, est classé première priorité des grandes missions spatiales par la revue décennale américaine.","The project, then called WFIRST, is ranked top priority for a large space mission in the US decadal survey.",'tl'],
      ['20 mai 2020','20 May 2020','Nancy Grace Roman','Nancy Grace Roman',"La mission prend le nom de la première astronome en chef de la NASA.","The mission is named after NASA's first chief astronomer.",'tl'],
      ['7 nov. 2024','7 Nov 2024','Livraison du télescope','Telescope delivered',"Dernière grande livraison : l'ensemble optique arrive au centre Goddard.","Last major delivery: the optical telescope assembly arrives at Goddard.",'tl'],
      ['12 déc. 2024 – 8 janv. 2025','12 Dec 2024 – 8 Jan 2025','Assemblage','Integration',"Télescope et instruments sont montés sur leur structure porteuse, puis l'ensemble est fixé au module de service.","Telescope and instruments are mounted on their carrier, then the payload is joined to the spacecraft.",'tl'],
      ['4 déc. 2025','4 Dec 2025','Observatoire terminé','Observatory complete',"Fin de la construction ; viennent ensuite les essais acoustiques, de vibration et de déploiement.","Construction is complete; acoustic, vibration and deployment tests follow.",'tl'],
      ['30 août 2026','30 Aug 2026','Lancement','Launch',"Falcon Heavy depuis Kennedy. Panneaux solaires et pare-soleil inférieur se déploient 83 minutes après le décollage ; les premières images publiques sont visées début 2027.","Falcon Heavy from Kennedy. The solar panels and lower sunshade deploy 83 minutes after liftoff; first public images are targeted for early 2027.",'launch']
    ],
    ops:[
      ['Pilotage','Flight operations','NASA Goddard (centre des opérations de la mission)','NASA Goddard (Mission Operations Center)','gs'],
      ['Science et archive','Science and archive','STScI et ESA (centre des opérations scientifiques)','STScI and ESA (Science Operations Center)','gs'],
      ['Coronographe','Coronagraph','IPAC et LAM (centre de support scientifique), JPL','IPAC and LAM (Science Support Center), JPL','gs'],
      ['Liaison science','Science link','bande Ka, jusqu\'à 500 Mbit/s','Ka band, up to 500 Mbit/s','gs'],
      ['Volume','Volume','≈ 1,4 To par jour, jusqu\'à 20 Po sur 5 ans',"≈ 1.4 TB per day, up to 20 PB over 5 years",['gs','esa']],
      ['Accès','Access','toutes les données publiques, sans période réservée','all data public, no proprietary period','data']
    ],
    chain:{
      intro:["Les produits sont rangés en niveaux de 1 à 4, plus un niveau 5 pour les contributions de la communauté. Ils sont distribués par MAST et peuvent être analysés directement dans le nuage, sur la plateforme Roman Research Nexus.",
             "Products are organised in levels 1 to 4, plus a level 5 for community contributions. They are distributed by MAST and can be analysed directly in the cloud on the Roman Research Nexus platform."],
      steps:[
        { lv:'L1', n:['Rampes du détecteur','Detector ramps'], x:['Les lectures successives de chaque pixel pendant la pose, non calibrées.','Successive reads of each pixel during the exposure, uncalibrated.'], sw:'STScI', r:'data' },
        { lv:'L2', n:['Pose calibrée','Calibrated exposure'], x:['Image en deux dimensions de chaque pose, calibrée.','Calibrated two-dimensional image of each exposure.'], sw:'RomanCal', r:'data' },
        { lv:'L3', n:['Visite combinée','Combined visit'], x:['Combinaison des poses d\'une même visite.','Combination of the exposures of a single visit.'], sw:'RomanCal', r:'data' },
        { lv:'L4', n:['Catalogues','Catalogues'], x:['Catalogues de sources, un par filtre.','Source catalogues, one per filter.'], sw:'MAST', r:'data' },
        { lv:'L5', n:['Produits de la communauté','Community products'], x:['Produits contribués par les équipes, dont celles des grands relevés.','Products contributed by the teams, including those of the large surveys.'], sw:'Roman Research Nexus', r:'data' }
      ]
    },
    rel:null
  },

  spitzer: {
    checked:'2026-11-19',
    refs:{
      seip:{ t:'Spitzer Enhanced Imaging Products', p:'IRSA (Caltech/IPAC)', u:'https://irsa.ipac.caltech.edu/data/SPITZER/Enhanced/SEIP/overview.html' }
    },
    intro:["Spitzer, la dernière des quatre « grands observatoires » de la NASA, était géré par le JPL. Le Spitzer Science Center, au Caltech, choisissait les observations, traitait les données et les distribuait ; l'archive est aujourd'hui à l'IRSA, au Caltech/IPAC.",
           "Spitzer, the last of NASA's four Great Observatories, was managed by JPL. The Spitzer Science Center, at Caltech, selected the observations, processed the data and distributed them; the archive is now at IRSA, at Caltech/IPAC."],
    phases:[
      ['25 août 2003','25 Aug 2003','Lancement','Launch',"Une fusée Delta II 7920H le lance depuis Cap Canaveral sur une orbite autour du Soleil, dans le sillage de la Terre.","A Delta II 7920H rocket launches it from Cape Canaveral into an orbit around the Sun, trailing the Earth.",['qf','mo']],
      ['oct. 2003','Oct 2003','Télescope froid','Telescope cold',"Le télescope, lancé à température ambiante, atteint 5,6 K en 41 jours, en rayonnant vers l'espace et grâce à la vapeur d'hélium.","The telescope, launched at room temperature, reaches 5.6 K in 41 days, by radiating to space and with the helium vapour.",'w04'],
      ['1er déc. 2003','1 Dec 2003','Début des observations','Science begins',"Après 63 jours de mise en service et 35 jours de vérification scientifique, les observations courantes commencent. En décembre, SIRTF prend le nom de Spitzer.","After 63 days of in-orbit checkout and 35 days of science verification, routine observations begin. In December, SIRTF is renamed Spitzer.",'thb'],
      ['15 mai 2009','15 May 2009','Fin de l\'hélium','Helium runs out',"L'hélium s'épuise après 5,75 ans, cinq mois de plus que prévu : fin de la mission froide.","The helium runs out after 5.75 years, five months longer than expected: end of the cold mission.",['mo','qf']],
      ['27 juil. 2009','27 Jul 2009','Mission chaude','Warm mission',"Le télescope se stabilise vers 28 K. Les voies à 3,6 et 4,5 µm d'IRAC continuent d'observer.","The telescope settles near 28 K. IRAC's 3.6 and 4.5 µm channels keep observing.",['mo','hb']],
      ['30 janv. 2020','30 Jan 2020','Fin de mission','End of mission',"Le satellite est mis en sommeil sur commande du sol, après plus de seize ans dans l'espace.","The spacecraft is put to sleep by command from the ground, after more than sixteen years in space.",['thb','mo']]
    ],
    ops:[
      ['Programme','Programme','NASA, Jet Propulsion Laboratory','NASA, Jet Propulsion Laboratory','qf'],
      ['Science et données','Science and data','Spitzer Science Center (Caltech)','Spitzer Science Center (Caltech)','w04'],
      ['Liaison','Downlink','deux contacts par jour, ≈ 1,1 Go de données par jour','two contacts a day, ≈ 1.1 GB of data a day','w04'],
      ['Grands programmes','Large programmes','32 programmes Legacy, 8 691 h, pendant la mission froide · 42 programmes d\'exploration, 38 412 h, pendant la mission chaude','32 Legacy programmes, 8,691 h, during the cold mission · 42 exploration programmes, 38,412 h, during the warm mission','thb'],
      ['Archive','Archive','Spitzer Heritage Archive, à l\'IRSA','Spitzer Heritage Archive, at IRSA','thb']
    ],
    chain:{
      intro:["Le Spitzer Science Center rangeait les produits en niveaux, chaque niveau tiré du précédent par les pipelines de la mission.",
             "The Spitzer Science Center organised the products into levels, each level derived from the previous one by the mission pipelines."],
      steps:[
        { lv:'L0', n:['Données brutes','Raw data'], x:['Les données non traitées, mises au format FITS.','The unprocessed data, packaged in FITS format.'], r:'thb' },
        { lv:'L1', n:['BCD','BCD'], x:['Données de base calibrées : une image par pose, en MJy/sr, avec son image d\'incertitude et son masque.','Basic Calibrated Data: one image per exposure, in MJy/sr, with its uncertainty image and its mask.'], r:'thb' },
        { lv:'L2', n:['Post-BCD','Post-BCD'], x:['Produits de plus haut niveau : mosaïques, poses additionnées, spectres extraits.','Higher-level products: mosaics, co-added exposures, extracted spectra.'], r:'thb' },
        { lv:'L3', n:['Produits améliorés','Enhanced products'], x:['Après la mission : mosaïques homogènes d\'IRAC et de MIPS 24 µm sur toutes les observations, et leur catalogue de sources (SEIP).','After the mission: uniform IRAC and MIPS 24 µm mosaics of all the observations, and their source catalogue (SEIP).'], r:'seip' }
      ]
    },
    rel:[
      ['nov. 2009','Nov 2009',['Spitzer Heritage Archive','Spitzer Heritage Archive'],"L'interface web de l'archive sert aussi les données propriétaires et devient l'archive de Spitzer.","The archive's web interface also serves proprietary data and becomes the Spitzer archive.",'thb',false]
    ]
  },
  fermi: {
    checked:'2026-11-19',
    refs:{
      doe:{ t:'GLAST Observatory Renamed for Fermi, Reveals Entire Gamma-Ray Sky (26 août 2008)', p:'U.S. Department of Energy, Office of Science', u:'https://science.osti.gov/Science-Features/News-Archive/Science-Headlines/2008/08-26-08' },
      ligo:{ t:'Gravitational Waves and Gamma-Rays from a Binary Neutron Star Merger: GW170817 and GRB 170817A', p:'LIGO, Virgo, Fermi-GBM et INTEGRAL', u:'https://ligo.org/wp-content/uploads/2024/07/GW170817GRB.pdf' },
      prep:{ t:'Fermi LAT, Data Preparation', p:'Fermi Science Support Center', u:'https://fermi.gsfc.nasa.gov/ssc/data/analysis/scitools/data_preparation.html' },
      dr4:{ t:'Ballet et al. 2023, Fermi Large Area Telescope Fourth Source Catalog Data Release 4 (4FGL-DR4)', p:'arXiv:2307.12546', u:'https://arxiv.org/abs/2307.12546' }
    },
    intro:["Fermi est une mission de la NASA menée avec le département de l'Énergie des États-Unis et des partenaires en France, en Allemagne, en Italie, au Japon et en Suède. Le Fermi Science Support Center, à Goddard, distribue les données, toutes publiques, et les logiciels pour les analyser.",
           "Fermi is a NASA mission run with the U.S. Department of Energy and partners in France, Germany, Italy, Japan and Sweden. The Fermi Science Support Center, at Goddard, distributes the data, all public, and the software to analyse them."],
    phases:[
      ['11 juin 2008','11 Jun 2008','Lancement','Launch',"Une Delta II Heavy le lance depuis Cap Canaveral, sous le nom de GLAST, vers une orbite basse à environ 565 km.","A Delta II Heavy launches it from Cape Canaveral, under the name GLAST, into a low orbit at about 565 km.",['fs','cic']],
      ['26 août 2008','26 Aug 2008','Il devient Fermi','It becomes Fermi',"GLAST prend le nom d'Enrico Fermi. Première carte du ciel gamma, obtenue en 95 heures d'observation ; le GBM a déjà vu 31 sursauts.","GLAST is renamed after Enrico Fermi. First map of the gamma-ray sky, made from 95 hours of observation; the GBM has already seen 31 bursts.",'doe'],
      ['août 2009','Aug 2009','Données du LAT publiques','LAT data public',"Environ 14 mois après le lancement, les photons du LAT deviennent publics, comme ceux du GBM depuis le début.","About 14 months after launch, the LAT photons become public, like those of the GBM from the start.",'cic'],
      ['17 août 2017','17 Aug 2017','GW170817','GW170817',"Le GBM détecte un sursaut gamma court 1,7 s après les ondes gravitationnelles de la fusion de deux étoiles à neutrons : première observation commune.","The GBM detects a short gamma-ray burst 1.7 s after the gravitational waves from the merger of two neutron stars: the first joint observation.",'ligo'],
      ['2018','2018','Panneau bloqué','Array stuck',"Une anomalie du mécanisme d'orientation d'un panneau solaire limite désormais fortement les pivotements rapides vers les sursauts.","An anomaly in a solar array drive now severely limits fast repointing towards bursts.",'cic'],
      ['2023','2023','Catalogue 4FGL-DR4','4FGL-DR4 catalogue',"14 ans de données du LAT : 7 194 sources gamma, dont 546 nouvelles.","14 years of LAT data: 7,194 gamma-ray sources, 546 of them new.",'dr4']
    ],
    ops:[
      ['Programme','Programme','NASA, avec le département de l\'Énergie','NASA, with the Department of Energy','fs'],
      ['Données et outils','Data and tools','Fermi Science Support Center (NASA Goddard)','Fermi Science Support Center (NASA Goddard)','cic'],
      ['Liaison','Downlink','bande Ku, 40 Mbit/s, 10 à 11 contacts par jour','Ku band, 40 Mbit/s, 10 to 11 contacts a day','cic'],
      ['Accès','Access','toutes les données sont publiques','all data are public','cic'],
      ['Logiciel','Software','Fermitools (LAT)','Fermitools (LAT)','prep']
    ],
    chain:{
      intro:["Le LAT produit des listes de photons. L'analyse part du fichier de photons et du fichier de pointage, puis applique des sélections standard avant de mesurer flux et spectres.",
             "The LAT produces photon lists. Analysis starts from the photon file and the pointing file, then applies standard selections before measuring fluxes and spectra."],
      steps:[
        { lv:'_PH', n:['Fichier de photons','Photon file'], x:['Les photons d\'une région, d\'une période et d\'un domaine d\'énergie, tirés du LAT Data Server.','The photons of a region, a period and an energy range, from the LAT Data Server.'], r:'prep' },
        { lv:'_SC', n:['Fichier de pointage','Pointing file'], x:['L\'historique de la direction du satellite et du temps de pose, indispensable pour l\'exposition.','The history of the spacecraft pointing and of the exposure time, needed for the exposure.'], r:'prep' },
        { lv:'gtselect', n:['Sélection','Selection'], x:['Classe d\'événements, énergie, région ; photons à plus de 90° du zénith écartés (lueur de la Terre).','Event class, energy, region; photons more than 90° from the zenith removed (Earth glow).'], sw:'Fermitools', r:'prep' },
        { lv:'gtmktime', n:['Bons intervalles','Good time intervals'], x:['Ne garde que les périodes où les données et la configuration du LAT sont bonnes.','Keeps only the periods when the data and the LAT configuration are good.'], sw:'Fermitools', r:'prep' },
        { lv:'4FGL', n:['Catalogue','Catalogue'], x:['Détection et caractérisation de toutes les sources sur l\'ensemble des données : 4FGL-DR4, 14 ans.','Detection and characterisation of all sources over the whole data set: 4FGL-DR4, 14 years.'], r:'dr4' }
      ]
    },
    rel:[
      ['2023','2023',['4FGL-DR4','4FGL-DR4'],"7 194 sources gamma, 14 ans de données, de 50 MeV à 1 TeV.","7,194 gamma-ray sources, 14 years of data, from 50 MeV to 1 TeV.",'dr4',false]
    ]
  },
  chandra: {
    checked:'2026-11-19',
    refs:{
      sdp:{ t:'Standard Data Processing (niveaux de traitement)', p:'Chandra X-ray Center, CIAO', u:'https://cxc.cfa.harvard.edu/ciao3.4/data/sdp.html' },
      csc:{ t:'Chandra Source Catalog, Release 2.1', p:'Chandra X-ray Center (newsletter 35)', u:'https://cxc.harvard.edu/newsletters/news_35/article14.html' }
    },
    intro:["Chandra est un programme de la NASA géré par le centre Marshall. Le Chandra X-ray Center, au Smithsonian Astrophysical Observatory à Cambridge (Massachusetts), le pilote, choisit les observations par appel à propositions, traite les données et les archive. Les observateurs ont six mois d'accès exclusif, puis les données deviennent publiques.",
           "Chandra is a NASA programme managed by the Marshall Center. The Chandra X-ray Center, at the Smithsonian Astrophysical Observatory in Cambridge (Massachusetts), flies it, selects the observations through calls for proposals, processes the data and archives them. Observers get six months of exclusive use, after which the data become public."],
    phases:[
      ['23 juil. 1999','23 Jul 1999','Lancement','Launch',"La navette Columbia emporte Chandra et le largue le jour même ; un étage à poudre l'envoie ensuite vers son orbite allongée.","Space Shuttle Columbia carries Chandra and releases it the same day; a solid-fuel stage then sends it towards its elongated orbit.",'miles'],
      ['7 août 1999','7 Aug 1999','Dernière manœuvre','Final burn',"Une poussée de 7 min 44 s relève le point bas de l'orbite à environ 9 700 km.","A 7 min 44 s burn raises the low point of the orbit to about 9,700 km.",'miles'],
      ['12 août 1999','12 Aug 1999','Ouverture de la porte','Door opens',"La porte du pare-soleil s'ouvre : les rayons X atteignent les miroirs pour la première fois.","The sunshade door opens: X-rays reach the mirrors for the first time.",'miles'],
      ['19 août 1999','19 Aug 1999','Première lumière','First light',"Première image officielle, prise par ACIS : Cassiopée A, reste d'une étoile qui a explosé il y a environ 320 ans.","First official image, taken by ACIS: Cassiopeia A, the remnant of a star that exploded about 320 years earlier.",'miles'],
      ['2 avril 2024','2 Apr 2024','Catalogue CSC 2.1','CSC 2.1 catalogue',"Le catalogue de sources rassemble 407 806 sources X tirées de 15 533 observations publiques jusqu'à fin 2021.","The source catalogue gathers 407,806 X-ray sources from 15,533 public observations up to the end of 2021.",'csc'],
      ['24 oct. 2025','24 Oct 2025','Arrêt de HRC-S','HRC-S halted',"Un déclenchement du limiteur de haute tension interrompt les observations avec HRC-S ; HRC-I reprend en décembre 2025.","A high-voltage current-limiter trip halts observations with HRC-S; HRC-I resumes in December 2025.",'cuc'],
      ['2026','2026','Budget réduit','Reduced budget',"Le budget de l'exercice 2026 est fixé à 63 M$, environ 11 M$ de moins que le coût de la mission complète.","The fiscal year 2026 budget is set at $63M, about $11M below the cost of the full mission.",'cuc']
    ],
    ops:[
      ['Programme','Programme','NASA, centre Marshall','NASA, Marshall Center','cspecs'],
      ['Pilotage et science','Operations and science','Chandra X-ray Center (Smithsonian Astrophysical Observatory)','Chandra X-ray Center (Smithsonian Astrophysical Observatory)',['specs','cspecs']],
      ['Données à bord','On-board data','enregistreur de 1,8 Gbit, vidé toutes les 8 h environ','1.8 Gbit recorder, emptied about every 8 h','specs'],
      ['Accès','Access','six mois exclusifs pour l\'observateur, puis public','six months exclusive to the observer, then public','cfp'],
      ['Logiciel','Software','CIAO, et catalogue de sources CSC','CIAO, and the CSC source catalogue',['sdp','csc']]
    ],
    chain:{
      intro:["Le traitement standard du Chandra X-ray Center range les produits en niveaux. Chandra compte les photons un à un : le produit central est une liste d'événements, dont on tire images et spectres.",
             "The Chandra X-ray Center's standard data processing organises the products into levels. Chandra counts photons one by one: the central product is an event list, from which images and spectra are built."],
      steps:[
        { lv:'L0', n:['Télémétrie découpée','Split telemetry'], x:['La télémétrie brute du satellite, découpée en fichiers FITS par observation. Pas pour l\'analyse.','Raw spacecraft telemetry, split into FITS files per observation. Not for analysis.'], sw:'SDP (CXC)', r:'sdp' },
        { lv:'L1', n:['Événements corrigés','Corrected events'], x:['Corrections propres à chaque instrument, dont la solution d\'attitude, sans modification irréversible (evt1).','Instrument-specific corrections, including the aspect solution, with no irreversible change (evt1).'], sw:'SDP (CXC)', r:'sdp' },
        { lv:'L1.5', n:['Réseaux : ordre zéro','Gratings: zeroth order'], x:['Pour les réseaux seulement : position de l\'ordre zéro des sources et liste d\'événements enrichie.','Gratings only: zeroth-order position of the sources and augmented event list.'], sw:'SDP (CXC)', r:'sdp' },
        { lv:'L2', n:['Liste d\'événements finale','Final event list'], x:['Filtrages standard, irréversibles : liste d\'événements « finie » (evt2), sources candidates, spectre dispersé pour les réseaux.','Standard, irreversible filtering: the “finished” event list (evt2), candidate sources, dispersed spectrum for the gratings.'], sw:'SDP, CIAO', r:'sdp' },
        { lv:'L3', n:['Catalogue','Catalogue'], x:['Détection et caractérisation fines des sources, recoupées avec d\'autres catalogues : le Chandra Source Catalog.','Refined source detection and characterisation, cross-matched with other catalogues: the Chandra Source Catalog.'], sw:'CSC', r:['sdp','csc'] }
      ]
    },
    rel:[
      ['2 avril 2024','2 Apr 2024',['Chandra Source Catalog 2.1','Chandra Source Catalog 2.1'],"407 806 sources, 1 304 376 détections, 15 533 observations jusqu'à fin 2021.","407,806 sources, 1,304,376 detections, 15,533 observations up to the end of 2021.",'csc',false]
    ]
  },
  gaia: {
    checked:'2026-11-16',
    refs:{
      cal:{ t:'Gaia Mission Calendar', p:'ESA', u:'https://www.cosmos.esa.int/web/gaia/calendars' },
      dpac:{ t:'Gaia DR3 documentation, 1.2.2 Organigramme and funding (DPAC)', p:'ESA, DPAC', u:'https://gea.esac.esa.int/archive/documentation/GDR3/Introduction/chap_cu0int/cu0int_sec_dpac/cu0int_ssec_dpac_structure.html' },
      proc:{ t:'Gaia, Data Processing', p:'ESA', u:'https://www.cosmos.esa.int/web/gaia/data-processing' },
      cyc:{ t:'Gaia DR3 documentation, Processing configuration', p:'ESA, DPAC', u:'https://gea.esac.esa.int/archive/documentation/GDR3/Introduction/chap_cu0int/cu0int_sec_release_framework/cu0int_ssec_processing_configuration.html' },
      dr4:{ t:'Gaia DR4 content', p:'ESA', u:'https://cosmos.esa.int/web/gaia/dr4' }
    },
    intro:["Le traitement des données de Gaia est confié au consortium DPAC, qui réunit des membres de plus de 20 pays : neuf unités de coordination conçoivent les traitements, six centres de traitement les exécutent, dont celui du CNES à Toulouse.",
           "Gaia's data processing is entrusted to the DPAC consortium, with members from more than 20 countries: nine coordination units design the processing and six data processing centres run it, including CNES in Toulouse."],
    phases:[
      ['19 déc. 2013','19 Dec 2013','Lancement','Launch',"Soyouz-Fregat depuis Kourou, vers L2.","Soyuz-Fregat from Kourou, to L2.",'cal'],
      ['25 juil. 2014','25 Jul 2014','Début des opérations','Routine operations begin',"Début de la mission nominale : Gaia balaie le ciel en continu.","Nominal mission begins: Gaia scans the sky continuously.",'cal'],
      ['16 juil. 2019','16 Jul 2019','Fin de la mission nominale','End of nominal mission',"Une manœuvre évite une éclipse par la Terre et marque la fin de la mission nominale ; Gaia continue d'observer en mission prolongée.","A manoeuvre avoids an eclipse by the Earth and marks the end of the nominal mission; Gaia keeps observing in its extended mission.",'cal'],
      ['15 janv. 2025','15 Jan 2025','Fin des observations','End of observations',"Après plus de dix ans, Gaia cesse d'observer.","After more than ten years, Gaia stops observing.",'cal'],
      ['27 mars 2025','27 Mar 2025','Passivation','Passivation',"Le satellite est éteint définitivement sur une orbite autour du Soleil.","The spacecraft is switched off for good on an orbit around the Sun.",['cal','end']],
      ['1er juil. 2025','1 Jul 2025','Post-opérations','Post-operations',"Le traitement continue pour les deux dernières publications.","Processing continues for the last two releases.",'cal']
    ],
    ops:[
      ['Consortium','Consortium','DPAC, membres de plus de 20 pays','DPAC, members from more than 20 countries','proc'],
      ['Organisation','Organisation','9 unités de coordination (CU), 6 centres de traitement (DPC)','9 coordination units (CUs), 6 data processing centres (DPCs)',['proc','dpac']],
      ['Centres de traitement','Processing centres','ESAC (Madrid), Barcelone, CNES (Toulouse), Cambridge, Genève, Turin','ESAC (Madrid), Barcelona, CNES (Toulouse), Cambridge, Geneva, Turin','dpac'],
      ['Archive','Archive','Gaia Archive de l\'ESA (ADQL)','ESA Gaia Archive (ADQL)','dr3']
    ],
    chain:{
      intro:["Gaia ne vise pas d'objets : il balaie le ciel et chaque étoile passe des dizaines de fois devant ses CCD. Le traitement est itératif et se calibre lui-même : à chaque cycle, les chaînes reprennent toutes les données depuis le début de la mission, avec de meilleurs algorithmes.",
             "Gaia points at nothing: it scans the sky and each star crosses its CCDs dozens of times. Processing is iterative and self-calibrating: at each cycle the chains reprocess all data since the start of the mission, with better algorithms."],
      steps:[
        { lv:'CU3', n:['Traitement initial','Initial data treatment'], x:['Chaque jour : décodage de la télémétrie, premières positions et flux, contrôles de qualité (« first look »).','Every day: telemetry decoding, first positions and fluxes, quality checks (\'first look\').'], sw:['DPCE, ESAC','DPCE, ESAC'], r:'dpac' },
        { lv:'CU3', n:['Solution astrométrique globale','Global astrometric solution'], x:['Positions, parallaxes et mouvements propres de toutes les étoiles, résolus en même temps que l\'orientation du satellite et sa calibration.','Positions, parallaxes and proper motions of all stars, solved together with the spacecraft attitude and calibration.'], sw:'AGIS', r:['dpac','cyc'] },
        { lv:'CU5  CU6', n:['Photométrie et spectroscopie','Photometry and spectroscopy'], x:['Magnitudes G, BP et RP, spectres basse résolution BP/RP (CU5) ; spectres RVS et vitesses radiales (CU6).','G, BP and RP magnitudes, low-resolution BP/RP spectra (CU5); RVS spectra and radial velocities (CU6).'], sw:'PhotPipe…', r:['dpac','cyc'] },
        { lv:'CU4  CU7  CU8', n:['Analyse des objets','Object analysis'], x:['Étoiles doubles et multiples, petits corps du Système solaire, galaxies (CU4) ; étoiles variables (CU7) ; température, gravité, distance et extinction de chaque source (CU8).','Double and multiple stars, Solar System bodies, galaxies (CU4); variable stars (CU7); temperature, gravity, distance and extinction of each source (CU8).'], sw:'Apsis (CU8)', r:'dpac' },
        { lv:'CU9', n:['Validation et publication','Validation and release'], x:['Validation du catalogue, préparation de la publication avec l\'ESA, archive publique.','Catalogue validation, release preparation with ESA, public archive.'], sw:['Gaia Archive','Gaia Archive'], r:'dpac' }
      ],
      note:["L'architecture d'ensemble, les outils communs et la base de données principale relèvent de CU1 ; les simulations, de CU2.","The overall architecture, shared tools and main database belong to CU1; simulations to CU2."], noteR:'dpac'
    },
    rel:[
      ['14 sept. 2016','14 Sep 2016','DR1',"Première publication.","First release.",'cal',false],
      ['25 avril 2018','25 Apr 2018','DR2',"Premières parallaxes pour plus d'un milliard d'étoiles.","First parallaxes for more than a billion stars.",'cal',false],
      ['3 déc. 2020','3 Dec 2020','EDR3',"Astrométrie et photométrie améliorées.","Improved astrometry and photometry.",'cal',false],
      ['13 juin 2022','13 Jun 2022','DR3',"Spectres, vitesses radiales, paramètres astrophysiques, étoiles variables et doubles.","Spectra, radial velocities, astrophysical parameters, variable and double stars.",['cal','dr3'],false],
      ['10 oct. 2023','10 Oct 2023','FPR',"Publication ciblée (produits particuliers).","Focused Product Release (special products).",'cal',false],
      ['déc. 2026','Dec 2026','DR4',"66 mois de données (25 juillet 2014 – 20 janvier 2020), ≈ 2,8 milliards de sources traitées et, pour la première fois, les observations individuelles : ≈ 400 To contre 10 To pour DR3.","66 months of data (25 July 2014 – 20 January 2020), ≈ 2.8 billion processed sources and, for the first time, the individual observations: ≈ 400 TB against 10 TB for DR3.",['cal','dr4'],true],
      ['fin 2030 au plus tôt','end of 2030 at the earliest','DR5',"Toute la mission, plus de dix ans de données.","The whole mission, more than ten years of data.",'cal',true]
    ]
  }
};
