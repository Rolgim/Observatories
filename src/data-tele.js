/* =================================================================
   OBSERVATOIRES — fiche, pièces cliquables, réglages de la maquette.
   Axes : repère propre à chaque fichier 3D (voir `axis`, `size`).
   explode = [dx,dy,dz, distance en mètres] dans le repère de la maquette.
   Registre : ajouter un observatoire = une entrée ici (et ses textes dans data-inst, optics, orbits,
   data-mission, en/*), son rendu de matériaux dans looks.js ; app.js n'a pas à changer.
     color      couleur de l'observatoire dans les figures de comparaison
     highlight  [libellé, valeur, unité] : premier chiffre clé de la fiche ; footprint [valeur, unité] : encombrement
     optical    pièces qui ouvrent la page « Trajet de la lumière »
     compare    order (rang dans « Comparer », chronologique), rot (rotation de la maquette dans la vue côte à côte),
                fp [rangée, rang] dans la figure des plans focaux
     orbit      leo (orbite basse, avec leo:{ alt km, per min }), heo (orbite terrestre très elliptique), l2, ou helio (autour du Soleil, dans le sillage de la Terre, avec helio.drift)
     ended      mission terminée ; deploy : animation de déploiement, configurée dans DEPLOY[id] (deploy.js)
     domain     groupe de l'en-tête, parmi DOMAINS (en fin de fichier) : domaine spectral principal
================================================================= */
var TELESCOPES = [
  {
    id:'hubble', domain:'uv', name:'Hubble Space Telescope', short:'Hubble', year:'1990',
    agency:'NASA / ESA', launch:'Lancé le 24 avril 1990, navette Discovery (STS-31)',
    sub:'Orbite basse terrestre, ultraviolet, visible, proche infrarouge',
    src:'Maquette : NASA VTAD, via Gaia Sky',
    file:'models/hubble.txt', bytes:4466940, axis:'z', size:13.2,
    view:{ az:-0.95, el:0.20, dist:1.55 }, sun:[0.55,0.62,0.56], orbit:'leo', leo:{ alt:480, per:95 },
    hero:{ num:'2,4', unit:'m', label:'diamètre du miroir primaire' },
    cmp:{ tag:'13,2 m', dim:'13,2 m de long', mirror:2.4, mass:10800, approx:true, len:13.2 },
    color:'#3D6BE0', highlight:['Miroir primaire','2,4','m'], footprint:['13,2','m de long'], optical:['ota','aft'],
    compare:{ order:1, rot:[-Math.PI/2, 0, 0], fp:[2, 1] },
    desc:"Premier des grands observatoires de la NASA, Hubble tourne autour de la Terre depuis 1990. Cinq missions de navette l'ont réparé et modernisé en orbite : presque tous ses instruments actuels datent de ces visites. Son tube argenté abrite un télescope Ritchey-Chrétien et une baie d'instruments interchangeables.",
    sourceNote:"Maquette créée par NASA Visualization Technology Applications and Development (VTAD), distribuée avec Gaia Sky. Le fichier d'origine est découpé par texture ; il a été redécoupé ici en pièces physiques pour que le clic désigne la bonne partie.",
    checked:'2026-11-13',
    refs:{
      lallo:{ t:'M. D. Lallo 2012, Experience with the Hubble Space Telescope: twenty years of an archetype, Optical Engineering 51, 011011', p:'arXiv', u:'https://arxiv.org/abs/1203.0002' },
      opt:{ t:'Hubble Space Telescope : Optics', p:'NASA', u:'https://science.nasa.gov/mission/hubble/observatory/design/optics/' },
      mg3b:{ t:'Hubble Space Telescope Servicing Mission 3B, Media Reference Guide, section 1', p:'NASA', u:'https://lhea.gsfc.nasa.gov/archive/sm3b/art/pdf/media-guide/sec1.pdf' },
      bat:{ t:'SM4 : Batteries', p:'NASA Goddard', u:'https://asd.gsfc.nasa.gov/archive/sm4/technology/sm4_batteries.html' },
      primer:{ t:'HST Primer for Cycle 34, System Overview', p:'STScI', u:'https://hst-docs.stsci.edu/hsp/the-hubble-space-telescope-primer-for-cycle-34/hst-primer-system-overview' },
      nasa:{ t:'Hubble Space Telescope, Facts', p:'NASA Science', u:'https://science.nasa.gov/mission/hubble/overview/' },
      gyro:{ t:'NASA to Change How It Points Hubble Space Telescope (communiqué 2024-023, 4 juin 2024)', p:'STScI', u:'https://www.stsci.edu/contents/news-releases/2024/news-2024-023' },
      reg:{ t:'Hubble\'s orbit is decaying (25 février 2026)', p:'The Register', u:'https://www.theregister.com/2026/02/25/hubble_orbit_decay/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Longueur','13,2 m','nasa'], ['Diamètre max.','4,3 m','nasa'],
        ['Masse','≈ 10 800 kg au lancement · ≈ 12 200 kg après la dernière mission d\'entretien','nasa'],
        ['Missions d\'entretien','5 (1993, 1997, 1999, 2002, 2009)','nasa'],
        ['Pointage','sur 1 gyroscope depuis juin 2024 ; 3 des 6 encore en état','gyro'] ]},
      { title:'Optique', rows:[
        ['Type','Ritchey-Chrétien'], ['Miroir primaire','2,4 m · 828 kg','nasa'],
        ['Miroir secondaire','0,3 m · 12,4 kg','nasa'], ['Longueur focale','57,6 m','lallo'], ['Rapport focal','f/24','lallo'],
        ['Précision de pointage','0,007″','nasa'] ]},
      { title:'Instruments actifs', rows:[
        ['WFC3','caméra grand champ, ultraviolet à proche infrarouge'], ['ACS','caméra de relevés'],
        ['STIS','spectrographe imageur'], ['COS','spectrographe ultraviolet'],
        ['FGS','capteurs de guidage fin'] ]},
      { title:'Orbite', rows:[
        ['Altitude','≈ 480 km','nasa'], ['Évolution','sous 500 km en 2026 et en baisse ; rentrée possible dès 2028 sans remontée d\'orbite','reg'],
        ['Inclinaison','28,5°','nasa'], ['Période','≈ 95 min','nasa'], ['Vitesse','≈ 27 000 km/h','nasa'] ]},
      { title:'Énergie et données', rows:[
        ['Panneaux solaires','2 panneaux de 7,54 × 2,44 m, arséniure de gallium','nasa'], ['Puissance','≈ 5 500 W au soleil','nasa'],
        ['Batteries','6, nickel-hydrogène','nasa'], ['Liaison','bande S, relais par les satellites TDRS'] ]}
    ],
    parts:[
      { key:'door', name:"Porte d'ouverture et pare-lumière", explode:[0,0,1,3.4],
        desc:"L'entrée du télescope. Le volet se referme automatiquement si l'axe de visée s'approche trop du Soleil, pour protéger l'optique. Derrière lui, le pare-lumière bloque la lumière parasite de la Terre et de la Lune.",
        facts:["Se referme seule si la visée approche du Soleil"] },
      { key:'ota', name:'Coque avant (miroir secondaire)', explode:[0,0,1,1.5],
        desc:"Le tube qui prolonge le télescope vers l'avant. Il contient les déflecteurs internes et, à l'intérieur, le miroir secondaire de 0,3 m, tenu en avant du miroir primaire par une structure presque insensible à la température.",
        facts:[["Miroir secondaire : 0,3 m", "opt"], ["À 4,9 m du miroir primaire", "lallo"], "Déflecteurs internes contre la lumière parasite"] },
      { key:'ssm', name:"Section d'équipements", explode:[0,0,0,0],
        desc:"L'anneau de baies qui ceinture le télescope. On y trouve les ordinateurs de bord, les batteries, les roues de réaction qui orientent le satellite et les équipements de communication. Les portes s'ouvrent pour que les astronautes puissent remplacer les boîtiers.",
        facts:[["4 roues de réaction", "mg3b"], ["6 batteries nickel-hydrogène, en deux modules de 3", "bat"]] },
      { key:'aft', name:'Carénage arrière (instruments)', explode:[0,0,-1,2.6],
        desc:"La partie la plus large. Juste à l'avant se trouve le miroir primaire de 2,4 m ; derrière lui, au foyer, les instruments scientifiques, dans des logements axiaux, et quatre logements radiaux occupés par WFC3 et les trois capteurs de guidage fin. Les rampes jaunes servaient aux astronautes.",
        facts:[["Miroir primaire : 2,4 m, 828 kg", "opt"], ["4 baies radiales : WFC3 et les 3 capteurs de guidage fin", "primer"], "Les autres instruments occupent les baies axiales"] },
      { key:'array_stbd', name:'Panneau solaire (+V2)', explode:[1,0,0,3.2],
        desc:"L'une des deux ailes solaires rigides à l'arséniure de gallium, posées en 2002. Plus petites que les panneaux souples d'origine, elles produisent pourtant davantage et vibrent moins au passage jour/nuit.",
        facts:[["7,54 × 2,44 m", "nasa"], ["Arséniure de gallium", "nasa"], ["Panneaux rigides, posés en 2002 (SM3B)", "mg3b"]] },
      { key:'array_port', name:'Panneau solaire (−V2)', explode:[-1,0,0,3.2],
        desc:"La seconde aile solaire, identique à la première. Les deux pivotent autour de leur mât pour rester face au Soleil quelle que soit la direction visée par le télescope.",
        facts:[["7,54 × 2,44 m", "nasa"], ["≈ 5 500 W pour les deux panneaux", "nasa"]] },
      { key:'hga_top', name:'Antenne grand gain', explode:[0,1,0,2.4],
        desc:"Parabole orientable au bout d'un mât. Hubble ne parle pas directement au sol : il envoie ses données vers les satellites relais TDRS en orbite géostationnaire, qui les retransmettent à White Sands (Nouveau-Mexique).",
        facts:[["Deux antennes à grand gain", "primer"], ["Relais par les satellites TDRS", "primer"]] },
      { key:'hga_bottom', name:'Antenne grand gain (seconde)', explode:[0,-1,0,2.4],
        desc:"La seconde parabole, sur le flanc opposé. Avoir deux antennes permet de garder le contact avec un satellite relais quelle que soit l'orientation du télescope.",
        facts:["Redondance et couverture"] }
    ]
  },
  {
    id:'chandra', domain:'x', name:'Chandra X-ray Observatory', short:'Chandra', year:'1999',
    agency:'NASA, exploité par le Smithsonian Astrophysical Observatory', launch:'Lancé le 23 juillet 1999, navette spatiale Columbia',
    sub:'Orbite terrestre très elliptique, rayons X (depuis 1999)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/chandra.glb', bytes:802076, axis:'x', size:13.8,
    view:{ az:-2.5, el:0.35, dist:1.3 }, sun:[0.2,0.9,0.3], orbit:'heo',
    hero:{ num:'0,5', unit:'″', label:'la netteté de ses images X (largeur à mi-hauteur)' },
    cmp:{ tag:'13,8 m', dim:'13,8 m de long, 19,5 m d\'envergure', mirror:1.2, mass:4800, len:13.8 },
    color:'#C2367A', highlight:['Focale','10','m'], footprint:['13,8','m de long'], optical:['hrma','oba','isim'],
    compare:{ order:2, rot:[0, 0.5, -Math.PI/2], fp:[1, 1] },   /* ouverture vers le haut */
    desc:"Les rayons X ne se réfléchissent que s'ils frôlent une surface. Chandra les concentre donc avec quatre paires de miroirs en forme de tubes emboîtés, qu'ils effleurent sous un angle très faible, puis les envoie 10 m plus loin sur ses détecteurs. Il observe depuis 1999 le gaz à des millions de degrés : restes de supernovae, amas de galaxies, matière autour des trous noirs. Son orbite très allongée l'emmène à plus du tiers de la distance de la Lune, loin des ceintures de radiations.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources), en mètres. Elle a été redécoupée ici en six ensembles d'après sa géométrie et ses matériaux ; elle contient les quatre coquilles du miroir.",
    checked:'2026-11-19',
    refs:{
      specs:{ t:'Chandra Specifications', p:'Chandra X-ray Center (SAO)', u:'https://www.chandra.si.edu/about/specs.html' },
      cspecs:{ t:'Chandra Specifications (dossier de presse)', p:'Chandra X-ray Center (SAO)', u:'https://chandra.si.edu/press/chandra_specs.html' },
      pog:{ t:'Proposers\' Observatory Guide, introduction', p:'Chandra X-ray Center', u:'https://cxc.cfa.harvard.edu/proposer/POG/html/INTRO.html' },
      tvis:{ t:'Proposers\' Observatory Guide, contraintes de visibilité', p:'Chandra X-ray Center', u:'https://cxc.cfa.harvard.edu/proposer/POG/html/TVIS.html' },
      about:{ t:'About Chandra (caractéristiques des instruments)', p:'Chandra X-ray Center', u:'https://cxc.cfa.harvard.edu/cdo/about_chandra/' },
      miles:{ t:'Chandra Mission Milestones', p:'Chandra X-ray Center', u:'https://chandra.harvard.edu/about/mission_milestones.html' },
      cuc:{ t:'Chandra Users\' Committee, mai 2026 (état de la mission)', p:'Chandra X-ray Center', u:'https://cxc.cfa.harvard.edu/cdo/cuc/cuc_file26/may6/Slane_CUC_May2026.pdf' },
      cfp:{ t:'Chandra Call for Proposals, cycle 26', p:'Chandra X-ray Center', u:'https://cxc.harvard.edu/proposer/CfP/arc_pdfs/CfP_cyc26.pdf' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','13,8 m de long · 19,5 m d\'envergure, panneaux déployés','specs'], ['Masse','4 800 kg','specs'],
        ['Énergie','deux ailes de trois panneaux, 2 350 W · trois batteries nickel-hydrogène','specs'],
        ['Pointage','six roues de réaction · stabilité 0,25″','cspecs'], ['Lancement','23 juillet 1999, navette Columbia','miles'],
        ['Constructeur','TRW ; programme géré par le centre Marshall de la NASA','cspecs'] ]},
      { title:'Optique', rows:[
        ['Type','Wolter de type I, incidence rasante','pog'], ['Miroirs','quatre paires paraboloïde–hyperboloïde emboîtées · 83,3 cm de long chacun','specs'],
        ['Plus grand diamètre','1,2 m','specs'], ['Focale','10 m','specs'], ['Masse des miroirs','956,4 kg','specs'],
        ['Netteté','largeur à mi-hauteur 0,5″','about'], ['Surface efficace','800 cm² à 0,25 keV · 400 cm² à 5 keV','about'] ]},
      { title:'Instruments', rows:[
        ['ACIS','10 CCD en deux réseaux · imagerie et spectroscopie','specs'], ['HRC','galettes à microcanaux, grand champ, haute résolution','specs'],
        ['HETG','réseau de transmission, pouvoir de résolution 60 à 1 000','specs'], ['LETG','réseau basse énergie, pouvoir de résolution 40 à 2 000','specs'],
        ['État en 2026','fonctionnement nominal, sauf HRC-S (arrêté depuis octobre 2025)','cuc'] ]},
      { title:'Orbite et données', rows:[
        ['Orbite à l\'origine','10 000 × 140 161 km · inclinaison 28,5°','specs'], ['Orbite en 2025','périgée ≈ 6 680 km · apogée ≈ 142 000 km','pog'],
        ['Période','63,5 h','pog'], ['Hors des ceintures de radiations','≈ 70 % du temps','pog'],
        ['Pointage interdit','à moins de 46,2° du Soleil','tvis'], ['Enregistreur','1,8 Gbit · vidé toutes les 8 h environ','specs'],
        ['Accès exclusif','six mois pour l\'observateur, puis public','cfp'] ]}
    ],
    parts:[
      { key:'door', name:'Porte du pare-soleil', explode:[-1,-0.4,0,1.6],
        desc:"Le couvercle qui protégeait les miroirs pendant le lancement. Il s'est ouvert une fois pour toutes le 12 août 1999 ; ouvert, il fait aussi écran contre la lumière du Soleil.",
        facts:[["Ouverte le 12 août 1999", "miles"], ["≈ 2,7 m, 54 kg (9 pieds, 120 livres)", "miles"]] },
      { key:'bus', name:'Module de service', explode:[0,1,0,1.6],
        desc:"Le module octogonal qui entoure les miroirs. Il fournit l'énergie, le pointage, les communications et la propulsion. Ses moteurs ont porté Chandra sur son orbite très allongée après le largage par la navette.",
        facts:[["Six roues de réaction, deux centrales inertielles", "cspecs"], ["Caméra de visée : champ de 1,4° × 1,4°", "cspecs"], ["Deux antennes à faible gain", "cspecs"], ["Enregistreur de 1,8 Gbit", "specs"]] },
      { key:'hrma', name:'Miroirs (HRMA)', explode:[0,0,0,0],
        desc:"Le cœur de Chandra : quatre paires de miroirs en forme de tubes emboîtés. Les rayons X frôlent d'abord un paraboloïde puis un hyperboloïde, sous un angle très faible, et convergent 10 m plus loin. Juste derrière, deux réseaux peuvent s'insérer dans le faisceau pour en faire un spectre.",
        facts:[["Quatre paires imbriquées, 1,2 m de diamètre pour la plus grande", "specs"], ["Focale de 10 m", "specs"], ["956,4 kg", "specs"]] },
      { key:'oba', name:'Banc optique', explode:[1,0,0,1.0],
        desc:"Le long tube qui tient les détecteurs à 10 m derrière les miroirs, avec une grande stabilité. Les rayons X y voyagent sans rencontrer d'autre optique.",
        facts:[["Sépare miroirs et foyer de 10 m", "specs"]] },
      { key:'isim', name:'Module des instruments', explode:[1,0,0,2.4],
        desc:"Au bout du tube, une table mobile place au foyer l'une des deux caméras : ACIS (CCD) ou HRC (galettes à microcanaux).",
        facts:[["ACIS : 10 CCD", "specs"], ["HRC : imagerie à très haute résolution", "pog"]] },
      { key:'solar', name:'Panneaux solaires', explode:[0,-1,0,1.0],
        desc:"Deux ailes de trois panneaux en silicium, déployées après le largage, et trois batteries pour stocker l'énergie.",
        facts:[["2 350 W", "specs"], ["Trois batteries nickel-hydrogène de 40 Ah", "specs"]] }
    ]
  },
  {
    id:'spitzer', domain:'ir', name:'Spitzer Space Telescope', short:'Spitzer', year:'2003',
    agency:'NASA (JPL, Caltech)', launch:'Lancé le 25 août 2003, Delta II, Cap Canaveral',
    sub:'Orbite autour du Soleil, dans le sillage de la Terre, infrarouge (2003–2020)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/spitzer.glb', bytes:1064244, axis:'y', size:4.5,
    view:{ az:-2.4, el:0.3, dist:2.1 }, sun:[0.15,0.35,-0.92], orbit:'helio',
    helio:{ drift:'s\'éloigne de ≈ 0,12 UA par an' },
    hero:{ num:'5,6', unit:'K', label:'la température du télescope pendant la mission froide' },
    cmp:{ tag:'4,5 m', dim:'4,5 m de haut, Ø 2,1 m', mirror:0.85, mass:861, len:4.5 },
    color:'#B03A2E', highlight:['Miroir primaire','0,85','m'], footprint:['4,5','m de haut'], optical:['tele','cta'],
    compare:{ order:3, rot:[0, 0, 0], fp:[1, 2] }, ended:true,
    desc:"Pour voir l'infrarouge, un télescope doit être plus froid que ce qu'il regarde. Spitzer emportait de l'hélium liquide qui a tenu son télescope de 85 cm à 5,6 K pendant près de six ans. Au lieu de tourner autour de la Terre, il suivait la Terre autour du Soleil, en s'en éloignant peu à peu : loin de sa chaleur, il se refroidissait aussi en rayonnant vers l'espace. Après l'épuisement de l'hélium en 2009, deux de ses caméras ont continué de fonctionner jusqu'en 2020.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources), en mètres. Elle a été redécoupée ici en cinq ensembles d'après sa géométrie et ses matériaux ; le miroir primaire et le support du secondaire sont visibles par l'ouverture du tube.",
    checked:'2026-11-19',
    refs:{
      w04:{ t:'Werner et al. 2004, The Spitzer Space Telescope Mission, ApJS 154, 1', p:'ApJS', u:'https://arxiv.org/abs/astro-ph/0406223' },
      w06:{ t:'Werner et al. 2006, First Fruits of the Spitzer Space Telescope, ARA&A 44, 269', p:'ARA&A', u:'https://arxiv.org/abs/astro-ph/0606563' },
      hb:{ t:'Spitzer Telescope Handbook, chapitre 3 (instruments)', p:'IRSA (Caltech/IPAC)', u:'https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview/spitzertelescopehandbook/6/' },
      mo:{ t:'Spitzer Mission Overview', p:'IRSA (Caltech/IPAC)', u:'https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview' },
      qf:{ t:'Spitzer Space Telescope, Quick Facts', p:'NASA JPL', u:'https://www.jpl.nasa.gov/news/press_kits/spitzer/quick-facts' },
      thb:{ t:'Spitzer Telescope Handbook (PDF, version finale)', p:'IRSA (Caltech/IPAC)', u:'https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview/spitzertelescopehandbook/Spitzer_Telescope_Handbook.pdf' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','4,5 m de haut · Ø 2,1 m','w04'], ['Masse au lancement','861 kg (950 kg selon la fiche du JPL)',['w04','qf']],
        ['Énergie','panneau solaire de 500 W au lancement · consommation moyenne 375 W','w04'],
        ['Pointage','quatre roues de réaction en pyramide, gyroscopes, viseurs d\'étoiles · stabilité 0,03″','w04'],
        ['Lancement','25 août 2003, Delta II 7920H, Cap Canaveral',['qf','mo']],
        ['Constructeurs','Lockheed Martin (module de service, panneau) · Ball Aerospace (ensemble cryogénique)','w06'] ]},
      { title:'Optique', rows:[
        ['Type','Ritchey-Chrétien, deux miroirs hyperboliques',['w06','thb']], ['Miroir primaire','Ø 0,85 m · ouvert à f/1,2 · trou central de 0,32 m (14,2 % de la surface)',['thb','w04']],
        ['Focale','10,2 m · f/12','thb'], ['Secondaire','Ø 0,12 m, à 0,888 m du primaire','thb'], ['Matériau','béryllium, miroirs et structure','w04'],
        ['Température','≈ 5,6 K (mission froide) · 27,5 K (mission chaude)',['w04','hb']], ['Limite de diffraction','5,5 µm','hb'] ]},
      { title:'Instruments', rows:[
        ['IRAC','caméra à quatre voies, 3,6 à 8 µm · champ de 5,2′','hb'], ['IRS','spectrographe, 5,2 à 38 µm · R ≈ 64 à 600','hb'],
        ['MIPS','photomètre à 24, 70 et 160 µm · spectres de 55 à 95 µm','hb'],
        ['Mission chaude','IRAC à 3,6 et 4,5 µm seulement, de 2009 à 2020','hb'] ]},
      { title:'Orbite et données', rows:[
        ['Orbite','autour du Soleil, dans le sillage de la Terre · s\'en éloigne d\'environ 0,12 UA par an','w04'],
        ['Pointage autorisé','entre 82,5° et 120° du Soleil · ≈ 35 % du ciel accessible à un instant donné',['thb','w06']],
        ['Liaison','bande X, 2,2 Mbit/s · deux contacts d\'environ 45 min par jour · mémoire de 2 Go','w04'],
        ['Hélium','épuisé le 15 mai 2009, après 5,75 ans de mission froide','mo'],
        ['Fin de mission','30 janvier 2020','mo'] ]}
    ],
    parts:[
      { key:'cta', name:'Ensemble cryogénique (CTA)', explode:[0,1,0,0.6],
        desc:"Le cryostat et le télescope. Spitzer a été lancé « chaud » : seuls les instruments et le réservoir d'hélium superfluide étaient froids au départ. Le reste s'est refroidi dans l'espace, en rayonnant vers le ciel et grâce à la vapeur d'hélium. L'enveloppe extérieure descend à 34 K par son seul rayonnement.",
        facts:[["≈ 350 L d'hélium superfluide au lancement, à ≈ 1,2 K", "thb"], ["Lancement « chaud » : cryostat plus petit que ceux d'IRAS et d'ISO", "w04"], ["Enveloppe à ≈ 34 K par rayonnement", "w06"], ["Évaporation de l'hélium : ≈ 22 g par jour", "w04"], ["Hélium épuisé le 15 mai 2009", "mo"]] },
      { key:'tele', name:'Télescope', explode:[0,1,0,0.9],
        desc:"Un télescope de 85 cm entièrement en béryllium, miroirs et structure, pour qu'il ne se déforme pas en refroidissant. Un mécanisme déplace le miroir secondaire pour faire la mise au point. Les trois instruments partagent le plan focal, dans une chambre placée derrière le miroir primaire.",
        facts:[["Ø 0,85 m, focale 10,2 m (f/12)", "thb"], ["Secondaire de 12 cm, à 0,89 m du primaire", "thb"], ["Béryllium", "w04"], ["≈ 5,6 K en mission froide", "w04"]] },
      { key:'bus', name:'Module de service', explode:[0,-1,0,0.5],
        desc:"Le module octogonal sous le télescope, chaud, construit par Lockheed Martin. Il porte l'électronique, les quatre roues de réaction et les viseurs d'étoiles. Couvertures et écrans thermiques limitent la chaleur qui monte vers le cryostat.",
        facts:[["Quatre roues de réaction en pyramide", "w04"], ["Gaz d'orientation : 15,59 kg d'azote au lancement", "w04"], ["Mémoire de 2 Go", "w04"]] },
      { key:'hga', name:'Antenne grand gain', explode:[0,-1,0,1.0],
        desc:"Une antenne fixe en bande X, sous le module de service. Les données enregistrées étaient transmises une ou deux fois par jour, par le réseau d'antennes de l'espace lointain de la NASA.",
        facts:[["2,2 Mbit/s", "w04"], ["Deux contacts d'environ 45 min par jour", "w04"], ["≈ 1,1 Go de données par jour", "w04"]] },
      { key:'solar', name:'Panneau solaire et pare-soleil', explode:[0,0,-1,0.8],
        desc:"Toujours tourné vers le Soleil, il fournit l'énergie et garde le télescope à l'ombre. Il est fixé en porte-à-faux sur le module de service, sans contact avec le cryostat froid.",
        facts:[["500 W au lancement", "w04"], ["Fixé au module de service seulement", "w04"]] }
    ]
  },
  {
    id:'fermi', domain:'gamma', name:'Fermi Gamma-ray Space Telescope', short:'Fermi', year:'2008',
    agency:'NASA et département de l\'Énergie des États-Unis, avec la France, l\'Allemagne, l\'Italie, le Japon et la Suède', launch:'Lancé le 11 juin 2008, Delta II, Cap Canaveral',
    sub:'Orbite basse, rayons gamma (depuis 2008)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/fermi.glb', bytes:2017012, axis:'z', size:15,
    view:{ az:-2.5, el:0.16, dist:1.35 }, sun:[0.3,0.9,0.3], orbit:'leo', leo:{ alt:565, per:96.5 },
    hero:{ num:'20', unit:'%', label:'du ciel vu à chaque instant par le LAT' },
    cmp:{ tag:'15 m', dim:'2,9 m de haut, 15 m d\'envergure', mirror:null, mass:4303, len:15 },
    color:'#4C3A99', highlight:['Domaine','20 MeV – 300','GeV'], footprint:['15','m d\'envergure'], optical:['lat'],
    compare:{ order:4, rot:[0, 0, 0], fp:null },
    desc:"Les rayons gamma sont trop énergétiques pour être réfléchis par un miroir. Le LAT, l'instrument principal de Fermi, les attrape autrement : chaque photon se transforme dans une feuille de tungstène en une paire électron–positon, dont des plans de silicium suivent la trace et dont un calorimètre mesure l'énergie. Il voit un cinquième du ciel à la fois et le balaie en entier toutes les trois heures. Son second instrument, le GBM, guette les sursauts gamma dans toutes les directions.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources), allégée et redécoupée ici en cinq ensembles d'après sa géométrie et ses matériaux. Elle n'est pas en mètres : elle est mise à l'échelle sur l'envergure publiée de 15 m ; ses proportions sont approximatives (le LAT y mesure ≈ 1,6 m de côté, contre 1,8 m en réalité).",
    checked:'2026-11-19',
    refs:{
      fs:{ t:'Fermi Gamma-ray Space Telescope, fiche de mission', p:'NASA Goddard', u:'https://imagine.gsfc.nasa.gov/educators/programs/fermi/multimedia/docs/fermi_fact_sheet.pdf' },
      cic:{ t:'Fermi Cicerone, Mission Overview', p:'Fermi Science Support Center (NASA)', u:'https://fermi.gsfc.nasa.gov/ssc/data/analysis/documentation/Cicerone/Cicerone_Introduction/mission_overview.html' },
      atw:{ t:'Atwood et al. 2009, The Large Area Telescope on the Fermi Gamma-ray Space Telescope Mission, ApJ 697, 1071', p:'ApJ', u:'https://arxiv.org/abs/0902.1089' },
      meg:{ t:'Meegan et al. 2009, The Fermi Gamma-ray Burst Monitor, ApJ 702, 791', p:'ApJ', u:'https://arxiv.org/abs/0908.0450' },
      gbm:{ t:'Fermi GBM, description de l\'instrument', p:'NASA Goddard', u:'https://fermi.gsfc.nasa.gov/science/instruments/gbm.html' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','2,9 m de haut · 15 m d\'envergure, panneaux déployés','fs'], ['Masse','4 303 kg','fs'], ['Puissance','1 500 W','fs'],
        ['Lancement','11 juin 2008, Delta II Heavy, Cap Canaveral',['fs','cic']], ['Durée prévue','5 à 10 ans','fs'] ]},
      { title:'Instruments', rows:[
        ['LAT','télescope à conversion de paires · 20 MeV à plus de 300 GeV · 16 tours de 4 × 4',['fs','atw']], ['Champ du LAT','2,4 sr à 1 GeV, ≈ 20 % du ciel',['atw','fs']],
        ['GBM','12 scintillateurs NaI et 2 BGO · ≈ 8 keV à 40 MeV','meg'], ['Champ du GBM','plus de 8 sr, tout le ciel non caché par la Terre',['gbm','meg']] ]},
      { title:'Orbite et données', rows:[
        ['Orbite','≈ 565 km au lancement · inclinaison 25,6° · 96,5 min','cic'],
        ['Relevé du ciel','axe incliné d\'environ 50° vers le nord puis vers le sud, une orbite sur deux ; ciel couvert presque uniformément en deux orbites, ≈ 3 h',['cic','atw']],
        ['Liaison','bande Ku, 40 Mbit/s · 10 à 11 contacts par jour de 7 à 8 min','cic'],
        ['Anomalie de l\'Atlantique Sud','≈ 15 % du temps d\'observation perdu','cic'],
        ['Données publiques','GBM dès le début ; LAT depuis août 2009, environ 14 mois après le lancement','cic'] ]}
    ],
    parts:[
      { key:'lat', name:'Télescope de grande surface (LAT)', explode:[0,1,0,1.2],
        desc:"Un détecteur de particules plutôt qu'un télescope : 16 tours rangées en carré de 4 × 4. Dans le trajectographe, un photon gamma se convertit dans une feuille de tungstène en un électron et un positon, dont des plans de silicium suivent la trace pour retrouver sa direction. Le calorimètre, en dessous, mesure leur énergie ; un bouclier de scintillateurs rejette les particules chargées.",
        facts:[["20 MeV à plus de 300 GeV", "fs"], ["Champ de 2,4 sr à 1 GeV", "atw"], ["18 plans de silicium par tour, tungstène dans les 16 premiers", "atw"], ["Calorimètre : 96 cristaux de CsI par tour, ≈ 1 800 kg", "atw"], ["Bouclier : 89 tuiles et 8 rubans de scintillateur", "atw"]] },
      { key:'gbm', name:'Détecteurs de sursauts (GBM)', explode:[1,0,0,0.6],
        desc:"Quatorze détecteurs répartis autour du satellite, orientés dans des directions différentes : douze cristaux d'iodure de sodium pour les basses énergies, deux de germanate de bismuth, sur deux côtés opposés, pour les hautes. En comparant ce que reçoit chacun, le GBM localise un sursaut gamma et peut faire pivoter Fermi vers lui.",
        facts:[["12 NaI : Ø 12,7 cm, 1,27 cm d'épaisseur", "gbm"], ["2 BGO : Ø 12,7 cm, 12,7 cm d'épaisseur", "gbm"], ["≈ 8 keV à 40 MeV", "meg"], ["≈ 250 sursauts déclenchés par an", "meg"]] },
      { key:'bus', name:'Module de service', explode:[0,-1,0,0.6],
        desc:"Le module qui porte le LAT et les détecteurs du GBM, et fournit énergie, pointage et communications.",
        facts:[["1 500 W", "fs"], ["Masse totale de l'observatoire : 4 303 kg", "fs"]] },
      { key:'ku', name:'Antenne en bande Ku', explode:[0,-1,0,1.0],
        desc:"L'antenne qui transmet les données, montée sur un mât sous le module de service.",
        facts:[["40 Mbit/s", "cic"], ["10 à 11 contacts par jour, de 7 à 8 min", "cic"]] },
      { key:'solar', name:'Panneaux solaires', explode:[0,0,1,0.4],
        desc:"Deux ailes déployées après le lancement. Depuis une anomalie du mécanisme d'orientation d'un panneau en 2018, Fermi ne peut presque plus pivoter de lui-même vers un sursaut.",
        facts:[["15 m d'envergure", "fs"], ["Anomalie du mécanisme d'orientation en 2018", "cic"]] }
    ]
  },
  {
    id:'gaia', domain:'astro', name:'Gaia', short:'Gaia', year:'2013',
    agency:'ESA', launch:'Lancé le 19 décembre 2013, Soyouz-Frégate, Kourou',
    sub:'Point de Lagrange L2 (2014–2025), astrométrie en lumière visible',
    src:'Maquette : Toni Sagristà, Gaia Sky',
    file:'models/gaia.txt', bytes:1814984, axis:'x', size:10.2,
    view:{ az:0.6, el:0.42, dist:1.35 }, sun:[0.5,-0.85,0.17], orbit:'l2',
    hero:{ num:'106', unit:'CCD', label:'un plan focal de près d\'un milliard de pixels' },
    cmp:{ tag:'Ø ≈ 10 m', dim:'Ø ≈ 10 m (pare-soleil)', mirror:1.45, mass:2030, len:10.2 },
    color:'#9A52D6', highlight:['Plan focal','106','CCD'], footprint:['≈ 10','m de diamètre'], optical:['torus','focal','tent'],
    compare:{ order:5, rot:[0.5, 0, 0], fp:[0, 0] }, ended:true, deploy:true,
    desc:"Gaia a mesuré la position, la distance et le mouvement de près de deux milliards d'étoiles. Le satellite tournait sur lui-même en six heures : ses deux télescopes, qui visent deux directions séparées de 106,5°, balayaient ainsi tout le ciel. Les observations ont pris fin en janvier 2025.",
    sourceNote:"Maquette créée par Toni Sagristà pour Gaia Sky, le logiciel de visualisation de la mission. Les pièces correspondent aux objets nommés du fichier d'origine.",
    checked:'2026-11-13',
    refs:{
      shield:{ t:'Gaia : Deployable sunshield', p:'ESA', u:'https://sci.esa.int/web/gaia/-/45313-deployable-sunshield' },
      torus:{ t:'Gaia : Schematic diagram of the Gaia torus', p:'ESA', u:'https://sci.esa.int/web/gaia/-/45335-schematic-diagram-of-the-gaia-torus' },
      prusti:{ t:'Gaia Collaboration, Prusti et al. 2016, The Gaia mission, A&A 595, A1', p:'arXiv', u:'https://arxiv.org/abs/1609.04153' },
      fs:{ t:'Gaia Fact Sheet', p:'ESA', u:'https://sci.esa.int/web/gaia/47354-fact-sheet' },
      sc:{ t:'Gaia : Spacecraft', p:'ESA', u:'https://sci.esa.int/web/gaia/-/39993-spacecraft' },
      doc:{ t:'Gaia DR2 documentation, 1.2 Spacecraft', p:'ESA Gaia Archive', u:'https://gea.esac.esa.int/archive/documentation/GDR2/Introduction/chap_cu0int/cu0int_sec_mission/cu0int_ssec_spacecraft_intro.html' },
      scan:{ t:'Gaia scanning the sky', p:'ESA', u:'https://sci.esa.int/web/gaia/-/51976-gaia-scanning-the-sky' },
      dr3:{ t:'Gaia Data Release 3', p:'ESA Cosmos', u:'https://www.cosmos.esa.int/web/gaia/dr3' },
      end:{ t:'Gaia passivation (27 mars 2025)', p:'ESA Cosmos', u:'https://www.cosmos.esa.int/web/gaia/home/-/asset_publisher/wEXKCCPdRxv0/content/2025-03-27-gaia-passivation' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Pare-soleil déployé','Ø 10,2 m','shield'], ['Masse au lancement','2 030 kg, dont 710 kg de charge utile et 400 kg d\'ergols','fs'],
        ['Fin des observations','15 janvier 2025','end'], ['Mise hors service','27 mars 2025, sur une orbite autour du Soleil','end'] ]},
      { title:'Optique', rows:[
        ['Télescopes','2 anastigmats à trois miroirs, 10 miroirs au total','doc'], ['Miroirs primaires','1,45 × 0,50 m chacun','doc'],
        ['Longueur focale','35 m','doc'], ['Angle de base','106,5°','doc'], ['Matériau','carbure de silicium'] ]},
      { title:'Plan focal', rows:[
        ['Détecteurs','106 CCD · près d\'un milliard de pixels','sc'], ['Dimensions','0,42 × 0,92 m','sc'], ['Température','170 K, refroidissement passif','sc'],
        ['Répartition','62 astrométrie · 14 cartographe · 14 BP/RP · 12 RVS · 4 de contrôle','doc'], ['Échelle','58,9 × 176,8 mas par pixel','doc'] ]},
      { title:'Loi de balayage', rows:[
        ['Rotation','1 tour en 6 h','scan'], ['Axe de rotation','à 45° du Soleil','scan'],
        ['Précession','≈ 63 jours','scan'], ['Orbite','Lissajous autour de L2, période ≈ 180 jours','fs'] ]},
      { title:'Énergie et catalogues', rows:[
        ['Panneaux solaires','12,8 m², jusqu\'à 1 910 W en fin de vie','sc'], ['Horloge','rubidium, 10 MHz','sc'],
        ['Précision visée','jusqu\'à 24 µas','fs'], ['Gaia DR3 (2022)','≈ 1,8 milliard de sources','dr3'], ['Gaia DR4','prévu le 2 décembre 2026','end'] ]}
    ],
    parts:[
      { key:'sunshield', name:'Pare-soleil déployable', nodes:['Sunshield-top_Circle','Sunshield-bottom_Circle','GoldenSquares_Cube'], explode:[0,-1,0,0.9],
        desc:"Une jupe de douze panneaux qui s'est ouverte comme une ombrelle après le lancement. Elle garde les télescopes dans une ombre permanente, à température constante : la moindre dilatation fausserait des mesures d'angle au millionième de degré.",
        facts:[["Ø 10,2 m une fois déployé", "shield"], ["12 cadres rigides en composite de carbone", "shield"], ["Deux couvertures isolantes, de 2 et 5 couches", "shield"]] },
      { key:'solar', name:'Panneaux solaires', nodes:['SolarPanels_Cube'], explode:[0,-1,0,1.9],
        desc:"Les cellules sont posées sur la face ensoleillée, sous le satellite dans cette vue. Comme l'axe de Gaia garde un angle fixe de 45° avec le Soleil, l'éclairement ne varie jamais.",
        facts:[["Cellules à triple jonction, 12,8 m²", "sc"], ["Jusqu'à 1 910 W en fin de vie", "sc"], ["Panneaux sur 8 des 12 cadres du pare-soleil", "shield"]] },
      { key:'svmbase', name:'Antenne réseau à commande de phase', nodes:['Floor_Circle','Bottom-details_Cylinder'], explode:[0,-1,0,2.9],
        desc:"Sous le satellite, face à la Terre. Une parabole orientable aurait fait vibrer Gaia : le faisceau est donc dirigé électroniquement, sans aucune pièce mobile, pendant que le satellite tourne.",
        facts:[["Bande X, 8,7 Mbit/s", "prusti"], ["Aucune pièce mobile", "prusti"]] },
      { key:'svm', name:'Module de service', nodes:['ServiceModule-bottom_Cylinder'], explode:[0,0,0,0],
        desc:"L'anneau qui porte l'électronique, les réservoirs et une horloge atomique au rubidium pour dater chaque mesure. Des micro-propulseurs à azote froid maintiennent la rotation avec une régularité extrême.",
        facts:[["Horloge atomique au rubidium (10 MHz)", "prusti"], ["2 × 6 micro-propulseurs à gaz froid", "prusti"]] },
      { key:'tent', name:'Tente thermique', nodes:['TTS_Cylinder','TTS-inner_Cylinder','Top_Circle','Top-ceiling_Circle','GoldenBorders_Cylinder','GoldSquare_Cube'], explode:[0,1,0,2.6],
        desc:"La coque qui enveloppe la charge utile. Elle la protège des micrométéorites et du rayonnement, et ne laisse que deux ouvertures par lesquelles regardent les deux télescopes.",
        facts:[["Ouvertures pour les 2 télescopes et le plan focal", "prusti"], ["Sandwich composite carbone et aluminium", "prusti"]] },
      { key:'torus', name:'Banc optique (tore)', nodes:['Torus_Torus'], explode:[0,1,0,1.1],
        desc:"Un anneau de carbure de silicium d'environ 3 m, assemblé à partir de 17 segments brasés. Il porte les dix miroirs des deux télescopes et le plan focal, et garantit que l'angle entre les deux lignes de visée reste fixe.",
        facts:[["Ø ≈ 3 m, quasi octogonal", "torus"], ["17 segments en carbure de silicium", "torus"], "Porte les deux télescopes et le plan focal"] },
      { key:'focal', name:'Plan focal et instruments', nodes:['FocalPlane_Cube','Instr1_Cube','Instr2_Cube','InstrBG_Plane','Plane'], explode:[0,1,0,1.9],
        desc:"La plus grande caméra envoyée dans l'espace à son lancement. Les images des deux télescopes se superposent sur la même mosaïque de CCD ; les étoiles la traversent en file pendant que le satellite tourne.",
        facts:[["106 CCD, 938 millions de pixels", "prusti"], ["0,42 × 0,92 m", "sc"]] }
    ]
  },
  {
    id:'jwst', domain:'ir', name:'James Webb Space Telescope', short:'JWST', year:'2021',
    agency:'NASA / ESA / ASC', launch:'Lancé le 25 décembre 2021, Ariane 5, Kourou',
    sub:'Point de Lagrange L2, infrarouge proche et moyen',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/jwst.txt', bytes:5328456, axis:null, size:0,
    view:{ az:0.62, el:0.30, dist:1.35 }, sun:[0.18,-0.97,-0.16], orbit:'l2',
    hero:{ num:'6,5', unit:'m', label:'miroir primaire, 18 segments dorés' },
    cmp:{ tag:'21,2 × 14,2 m', dim:'21,2 × 14,2 m (bouclier)', mirror:6.5, mass:6200, approx:true, len:21.2 },
    color:'#DB5A14', highlight:['Miroir primaire','6,5','m'], footprint:['21,2 × 14,2','m'], optical:['primary','secondary','aos','isim'],
    compare:{ order:6, rot:[0, 0.35, 0], fp:[2, 0] }, deploy:true,
    desc:"Conçu pour l'infrarouge, Webb doit rester très froid pour ne pas être ébloui par sa propre chaleur. Un bouclier à cinq couches, grand comme un court de tennis, coupe l'observatoire en deux : un côté chaud tourné vers le Soleil, et un côté froid à environ −233 °C où se trouvent le miroir et les instruments.",
    sourceNote:"Maquette officielle publiée par la NASA (NASA 3D Resources). Les pièces sont identifiées à partir des matériaux du fichier et de leur position ; la teinte rosée de la face inférieure du bouclier est celle du revêtement réel au silicium dopé.",
    checked:'2026-11-13',
    refs:{
      mir:{ t:'Webb\'s Mirrors', p:'NASA', u:'https://science.nasa.gov/mission/webb/webbs-mirrors/' },
      esafs:{ t:'Webb Fact Sheet', p:'ESA/Webb', u:'https://esawebb.org/about/general/fact-sheet/' },
      tower:{ t:'Tower Extension Test a Success for NASA\'s James Webb Space Telescope', p:'NASA SVS', u:'https://svs.gsfc.nasa.gov/13639' },
      solar:{ t:'NASA\'s Webb Powerhouse Solar Array Reconnects to the Telescope', p:'NASA', u:'https://www.nasa.gov/solar-system/nasas-webb-powerhouse-solar-array-reconnects-to-the-telescope/' },
      fs:{ t:'Webb Fact Sheet', p:'NASA Science', u:'https://science.nasa.gov/mission/webb/fact-sheet' },
      mc:{ t:'McElwain et al. 2023, The James Webb Space Telescope Mission: Optical Telescope Element Design, Development, and Performance, PASP 135, 058001', p:'NASA NTRS', u:'https://ntrs.nasa.gov/api/citations/20230010809/downloads/9_McElwain_2023_PASP_135_058001.pdf' },
      sh:{ t:'The Complex Material Engineering of NASA\'s Webb Telescope Sunshield', p:'NASA', u:'https://www.nasa.gov/universe/the-complex-material-engineering-of-nasas-webb-telescope-sunshield' },
      ie:{ t:'The Webb Space Telescope\'s Profound Data Challenges', p:'IEEE Spectrum', u:'https://spectrum.ieee.org/james-webb-telescope-communications' },
      hz:{ t:'Éphémérides JPL Horizons (objet -170), mesure faite sur ce site', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Bouclier thermique','21,197 × 14,162 m','fs'], ['Masse au lancement','≈ 6 200 kg','fs'],
        ['Durée de mission','5 à 10 ans prévus','fs'], ['Ergols','pour plus de 20 ans','mc'] ]},
      { title:'Optique', rows:[
        ['Type','anastigmat à trois miroirs (Korsch)'], ['Miroir primaire','6,5 m · 18 segments hexagonaux de 1,32 m · béryllium doré','mc'],
        ['Surface collectrice','25,44 m² (mesurée)','mc'], ['Miroir secondaire','0,738 m, à 7,17 m du primaire','mc'],
        ['Longueur focale','131,4 m · f/20','mc'], ['Domaine spectral','0,6 à 28,5 µm','fs'], ['Résolution','≈ 0,1″','fs'] ]},
      { title:'Thermique', rows:[
        ['Côté froid','≈ −233 °C ; télescope et instruments vers 40 K',['fs','mc']], ['Détecteurs de MIRI','< 7 K (cryo-refroidisseur)','fs'],
        ['Côté chaud','≈ 85 °C','fs'], ['Bouclier','5 couches de Kapton aluminisé · 0,05 mm (couche 1), 0,025 mm (les autres)','sh'] ]},
      { title:'Instruments', rows:[
        ['NIRCam','caméra proche infrarouge'], ['NIRSpec','spectrographe multi-objets (ESA)'],
        ['MIRI','imageur et spectrographe moyen infrarouge'], ['NIRISS / FGS','imageur, spectro sans fente et guidage (ASC)'] ]},
      { title:'Orbite et communications', rows:[
        ['Position','orbite de halo autour de L2, à ≈ 1,5 million de km','fs'], ['Période du halo','≈ 175 jours','hz'],
        ['Liaison science','bande Ka, jusqu\'à 28 Mbit/s','ie'], ['Volume','jusqu\'à 57 Go par jour · enregistreur de 68 Go','ie'] ]}
    ],
    parts:[
      { key:'primary', name:'Miroir primaire', explode:[0,0.25,1,3.0],
        desc:"Dix-huit hexagones de béryllium, un métal léger et stable au froid, recouverts d'une couche d'or de 100 nanomètres qui réfléchit très bien l'infrarouge. Chaque segment est positionné au nanomètre près par sept actionneurs pour que l'ensemble se comporte comme un seul miroir.",
        facts:[["18 segments de 1,32 m (entre plats)", "mir"], ["≈ 20 kg de béryllium par segment", "mir"], ["Or : 100 nm d'épaisseur", "mir"], ["25,44 m² de surface collectrice", "mc"]] },
      { key:'secondary', name:'Miroir secondaire et trépied', explode:[0,0.2,1,6.0],
        desc:"Un miroir convexe de 74 cm tenu devant le primaire par trois longs bras qui se sont dépliés après le lancement. Il renvoie la lumière collectée vers l'ouverture au centre du miroir primaire.",
        facts:[["Miroir convexe de 0,738 m", "mc"], ["Rayon de courbure : 1,779 m", "mc"]] },
      { key:'aos', name:'Optique arrière (AOS)', explode:[0,0,1,4.4],
        desc:"La tourelle noire au centre du miroir. Elle renferme le miroir tertiaire, qui corrige l'image, et le petit miroir de pointage fin qui compense plusieurs fois par seconde les minuscules mouvements de l'observatoire.",
        facts:[["Miroir tertiaire concave, 728 × 517 mm", "mc"], ["Miroir de pointage fin, plan", "mc"]] },
      { key:'isim', name:"Module d'instruments (ISIM)", explode:[0,0.55,-1,3.6],
        desc:"Derrière le miroir, la structure qui porte les quatre instruments scientifiques. Elle reste à environ 40 K dans l'ombre du bouclier ; MIRI, qui observe à plus grande longueur d'onde, est refroidi à 7 K par un réfrigérateur à hélium.",
        facts:[["Télescope à ≈ −233 °C (40 K)", "esafs"], ["MIRI à ≈ −266 °C (7 K)", "esafs"]] },
      { key:'sunshield', name:'Bouclier thermique', explode:[0,0,0,0],
        desc:"Cinq feuilles de Kapton plus fines qu'un cheveu, aluminisées, séparées par du vide. Chaque couche est plus froide que la précédente et la chaleur s'échappe par les côtés. Les deux couches côté Soleil portent un revêtement de silicium dopé, d'où leur teinte rosée.",
        facts:[["21,197 × 14,162 m", "fs"], ["5 couches de Kapton aluminisé", "sh"], ["Couche 1 : 0,05 mm ; autres : 0,025 mm", "sh"]] },
      { key:'flap', name:"Volet d'équilibrage", explode:[0,0,-1,2.6],
        desc:"La pression de la lumière solaire sur le grand bouclier fait lentement tourner l'observatoire. Ce volet à l'arrière rééquilibre cette poussée, ce qui économise le carburant nécessaire pour décharger les roues de réaction.",
        facts:["Compense la pression de radiation solaire"] },
      { key:'tower', name:'Tour déployable', explode:[0,-0.4,0,1.2],
        desc:"Un mât télescopique qui a soulevé le télescope d'un peu plus d'un mètre au-dessus de la plateforme après le lancement. Cet écart laisse la place au bouclier de se déployer et isole le côté froid des équipements chauds.",
        facts:[["Extension de 1,2 m", "tower"]] },
      { key:'bus', name:'Plateforme de service', explode:[0,-1,0,3.0],
        desc:"Le côté chaud. Ce caisson en composite de carbone, toujours éclairé par le Soleil, contient l'ordinateur de bord, les roues de réaction, les réservoirs et moteurs, l'alimentation électrique et le compresseur du réfrigérateur de MIRI.",
        facts:["Température proche de l'ambiante", "Propulsion, pointage, calcul, énergie"] },
      { key:'solar', name:'Panneau solaire', explode:[0,-1,-0.7,4.2],
        desc:"Cinq panneaux articulés, dépliés une demi-heure après le lancement. Comme Webb reste toujours dos au Soleil, le panneau est fixe : il est éclairé en permanence.",
        facts:[["5 panneaux, 6 m de long", "solar"], ["≈ 2 kW, pour ≈ 1 kW consommé", "solar"]] },
      { key:'hga', name:'Antenne grand gain', explode:[0,-1,0.5,4.6],
        desc:"Sous la plateforme, tournée vers la Terre. La petite parabole en bande Ka envoie les données scientifiques vers le réseau Deep Space Network lors de deux contacts quotidiens ; une antenne plus petite en bande S sert aux commandes.",
        facts:[["Bande Ka, jusqu'à 28 Mbit/s", "ie"], ["Jusqu'à 57 Go par jour", "ie"]] }
    ]
  },
  {
    id:'euclid', domain:'ir', name:'Euclid', short:'Euclid', year:'2023',
    agency:'ESA (avec la NASA)', launch:'Lancé le 1ᵉʳ juillet 2023, Falcon 9, Cap Canaveral',
    sub:'Point de Lagrange L2, visible et proche infrarouge',
    src:'Maquette : ESA SciFleet, via Gaia Sky',
    file:'models/euclid.txt', bytes:7970528, axis:'y', size:4.8,
    view:{ az:0.75, el:0.26, dist:1.6 }, sun:[-0.44,0.12,0.89], orbit:'l2',
    hero:{ num:'1,2', unit:'m', label:'télescope à très grand champ' },
    cmp:{ tag:'4,8 m', dim:'4,8 m de haut, Ø 3,74 m', mirror:1.2, mass:1988, len:4.8 },
    color:'#0F987A', highlight:['Miroir primaire','1,2','m'], footprint:['4,7','m de haut'], optical:['baffle','instr'],
    compare:{ order:7, rot:[0, -1.05, 0], fp:[1, 0] },
    desc:"Euclid cartographie un tiers du ciel pour comprendre l'énergie noire et la matière noire. Son télescope voit en une seule pose un champ plus de deux fois grand comme la pleine Lune, avec une netteté proche de celle de Hubble. Il mesure la forme et la distance de milliards de galaxies.",
    sourceNote:"Maquette de l'équipe SciFleet de l'ESA, distribuée avec Gaia Sky. Le fichier d'origine est un seul bloc : il a été redécoupé ici en six ensembles d'après leur géométrie.",
    checked:'2026-11-13',
    refs:{
      racca:{ t:'G. D. Racca et al. 2016, The Euclid mission design, Proc. SPIE 9904', p:'arXiv', u:'https://arxiv.org/abs/1610.05508' },
      vis:{ t:'Euclid Collaboration, Cropper et al. 2025, Euclid. II. The VIS instrument, A&A 697, A2', p:'A&A', u:'https://doi.org/10.1051/0004-6361/202450996' },
      nisp:{ t:'Euclid Collaboration, Jahnke et al. 2025, Euclid. III. The NISP instrument, A&A 697, A3', p:'A&A', u:'https://doi.org/10.1051/0004-6361/202450786' },
      e1:{ t:'Euclid Collaboration, Mellier et al. 2025, Euclid. I. Overview of the Euclid mission, A&A (arXiv:2405.13491)', p:'arXiv', u:'https://arxiv.org/abs/2405.13491' },
      ops:{ t:'Euclid : Mission operations', p:'ESA', u:'https://sci.esa.int/web/euclid/-/46661-mission-operations' },
      dr1:{ t:'Euclid Data Release 1', p:'ESA Cosmos', u:'https://www.cosmos.esa.int/web/euclid/euclid-dr1' },
      hz:{ t:'Éphémérides JPL Horizons (objet -680), mesure faite sur ce site', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Hauteur','≈ 4,8 m','e1'], ['Diamètre','≈ 3,74 m','e1'], ['Masse au lancement','1 988 kg','e1'],
        ['Mission nominale','≈ 6 ans','e1'], ['Maître d\'œuvre','Thales Alenia Space ; charge utile Airbus'] ]},
      { title:'Optique', rows:[
        ['Type','Korsch à trois miroirs'], ['Miroir primaire','1,2 m · carbure de silicium','e1'],
        ['Longueur focale','24,5 m · f/20,4','racca'], ['Champ commun','≈ 0,54 deg²','e1'],
        ['Température','≈ 126 K (miroir primaire) · 130 à 135 K (plaque de base)','e1'] ]},
      { title:'VIS (visible)', rows:[
        ['Détecteurs','36 CCD de 4132 × 4096 px (6 × 6) · ≈ 609 Mpx','e1'], ['Bande','530–920 nm','e1'],
        ['Échantillonnage','0,1″ par pixel','e1'], ['Température des CCD','153 K','e1'] ]},
      { title:'NISP (proche infrarouge)', rows:[
        ['Détecteurs','16 matrices H2RG de 2048 × 2048 px (4 × 4)','e1'], ['Photométrie','Y 950–1212 nm · J 1168–1567 nm · H 1522–2021 nm','e1'],
        ['Spectroscopie','grisme bleu 926–1366 nm (R ≳ 400) · grisme rouge 1206–1892 nm (R ≳ 480)','e1'],
        ['Échantillonnage','0,298″ par pixel','e1'], ['Température des détecteurs','≈ 95 K','e1'] ]},
      { title:'Orbite et données', rows:[
        ['Position','orbite de halo autour de L2, amplitude ≈ 1 million de km','ops'], ['Période du halo','≈ 170 jours','hz'],
        ['Relevé','≈ 14 000 deg² en ≈ 6 ans · champs profonds 53 deg²','e1'],
        ['Liaison science','bande K, 55 Mbit/s, 4 h par jour','ops'], ['Volume','≈ 826 Gbit compressés par jour','e1'],
        ['DR1, première partie','12 novembre 2026 · ≈ 1 900 deg² · plus d\'un milliard d\'objets','dr1'] ]}
    ],
    parts:[
      { key:'sunshield', name:'Pare-soleil et panneaux solaires', explode:[-0.44,0,0.9,2.2],
        desc:"Le grand panneau tourné en permanence vers le Soleil. Il porte les cellules solaires sur sa face éclairée et garde tout le télescope dans l'ombre, condition indispensable à la stabilité thermique des images.",
        facts:["Porte les panneaux photovoltaïques", "Garde le télescope dans l'ombre"] },
      { key:'baffle', name:'Télescope et baffle externe', explode:[0,1,0,2.2],
        desc:"Le cylindre couvert d'isolant qui entoure le télescope. À l'intérieur, les miroirs et leur structure sont entièrement en carbure de silicium, une céramique qui ne se déforme presque pas quand la température varie.",
        facts:[["Miroir primaire de 1,2 m", "e1"], ["Miroirs et structure en carbure de silicium", "e1"], ["≈ 126 K au miroir primaire", "e1"]] },
      { key:'instr', name:"Baie d'instruments (VIS et NISP)", explode:[0,1,0,0.9],
        desc:"Sous le télescope, le plateau qui porte les deux instruments. Une lame dichroïque partage la lumière : le visible part vers VIS, l'infrarouge traverse vers NISP. Les deux observent donc exactement le même champ en même temps. Les radiateurs évacuent la chaleur vers l'espace.",
        facts:[["VIS : 36 CCD, ≈ 609 Mpx", "vis"], ["NISP : 16 détecteurs infrarouges", "nisp"], ["Lame dichroïque à la pupille de sortie", "e1"]] },
      { key:'svm', name:'Module de service', explode:[0,0,0,0],
        desc:"La plateforme : ordinateurs, réservoirs, électronique chaude des instruments et système de pointage. Des micro-propulseurs à azote froid tiennent la visée avec une stabilité de quelques centièmes de seconde d'arc pendant les poses.",
        facts:[["Micro-propulseurs à gaz froid (azote)", "e1"], ["Capteur de guidage fin dans le plan focal, à côté de VIS", "e1"]] },
      { key:'hga', name:'Antenne grand gain', explode:[0.9,-0.3,-0.44,1.8],
        desc:"La parabole orientable en bande K, qui transmet chaque jour pendant environ quatre heures les images compressées vers les stations de 35 m de l'ESA.",
        facts:[["Antenne orientable de 0,7 m, bande K (25,5 à 27 GHz)", ["e1", "ops"]], ["55 Mbit/s, 4 h de liaison par jour", "ops"], ["≈ 826 Gbit compressés par jour", "e1"]] },
      { key:'adapter', name:"Anneau d'interface lanceur", explode:[0,-1,0,1.4],
        desc:"L'anneau par lequel le satellite était fixé au sommet de la fusée Falcon 9. Il ne sert plus après la séparation.",
        facts:["Interface avec Falcon 9"] }
    ]
  },
  {
    id:'roman', domain:'ir', name:'Nancy Grace Roman Space Telescope', short:'Roman', year:'2026',
    agency:'NASA (avec l\'ESA, la JAXA et le CNES)', launch:'Lancé le 30 août 2026, Falcon Heavy, Kennedy',
    sub:'Point de Lagrange L2, proche infrarouge grand champ',
    src:'Maquette : NASA 3D Resources (conception de 2015)',
    file:'models/roman.glb', bytes:3112960, axis:'x', size:11.34,
    view:{ az:-2.3, el:0.32, dist:1.25 }, sun:[0.15,0.95,0.25], orbit:'l2',
    hero:{ num:'0,28', unit:'deg²', label:'un champ au moins 100 fois plus grand que celui de Hubble' },
    cmp:{ tag:'12,7 m', dim:'12,7 m de long, 4,4 m de large, déployé', mirror:2.4, mass:10500, approx:true, len:11.3 },   /* masse avec ergols : prévision de 2021, la NASA ne publie que la masse à sec */
    color:'#B8860B', highlight:['Miroir primaire','2,4','m'], footprint:['12,7','m de long'], optical:['ota','instr'],
    compare:{ order:8, rot:[0, 0.5, -Math.PI/2], fp:[0, 1] },   /* ouverture vers le haut, comme Hubble */
    desc:"Roman a le même miroir de 2,4 m que Hubble, mais un champ au moins cent fois plus grand. Lancé le 30 août 2026 vers L2, il doit cartographier la matière noire, mesurer l'expansion de l'Univers avec des milliers de supernovae et trouver des milliers d'exoplanètes par microlentille vers le centre de la Galaxie. Ses premières images publiques sont attendues début 2027.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources), qui représente la conception de 2015 (« AFTA ») : le télescope lancé en diffère par plusieurs détails, notamment son couvercle d'ouverture souple et son barillet hexagonal. Elle est mise à l'échelle sur le miroir primaire de 2,4 m et a été redécoupée ici en sept ensembles d'après sa géométrie et ses matériaux.",
    checked:'2026-11-16',
    refs:{
      ot:{ t:'Roman Observatory Technical Overview', p:'NASA Goddard', u:'https://roman.gsfc.nasa.gov/science/observatory_technical.html' },
      wfi:{ t:'Roman WFI Technical (performances, v1.4, mars 2026)', p:'NASA Goddard', u:'https://roman.gsfc.nasa.gov/science/WFI_technical.html' },
      kit:{ t:'Nancy Grace Roman Space Telescope Press Kit (2026)', p:'NASA', u:'https://assets.science.nasa.gov/content/dam/science/missions/rst/education/Final%20Roman%20Press%20Kit-508compliant.pdf' },
      ntrs:{ t:'Nancy Grace Roman Space Telescope: Observatory Implementation and Challenges (2021)', p:'NASA NTRS', u:'https://ntrs.nasa.gov/api/citations/20210021677/downloads/NGRST%20Observatory%20Implementation%20and%20Challenges.pdf' },
      esa:{ t:'Roman factsheet', p:'ESA', u:'https://esa.int/Science_Exploration/Space_Science/Roman_factsheet' },
      gs:{ t:'Roman Ground Systems', p:'NASA', u:'https://science.nasa.gov/mission/roman-space-telescope/ground-systems/' },
      bus:{ t:'NASA Completes Spacecraft to Transport, Support Roman Space Telescope', p:'NASA', u:'https://www.nasa.gov/missions/roman-space-telescope/nasa-completes-spacecraft-to-transport-support-roman-space-telescope' },
      launch:{ t:'NASA\'s Roman Space Telescope Launches on Mission to Probe Hidden Universe', p:'Sci.News', u:'https://www.sci.news/astronomy/roman-space-telescope-launch-15027.html' },
      stobs:{ t:'Roman, Observatory Overview', p:'STScI', u:'https://www.stsci.edu/roman/observatory' },
      data:{ t:'Roman: Delivering Data That Unlocks Discovery (newsletter, 2026)', p:'STScI', u:'https://www.stsci.edu/contents/newsletters/2026-volume-43-issue-01/roman-delivering-data-that-unlocks-discovery' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions, déployé','12,7 m de long · 4,4 m de large','kit'], ['Masse','≈ 8 000 kg à sec (NASA, 2026) · ≈ 10 500 kg avec ergols (prévision de 2021)',['kit','ntrs']],
        ['Module de service','≈ 4 m × 2 m · 3 800 kg','bus'], ['Mission','5 ans, objectif 10 ans','ot'], ['Lancement','30 août 2026, Falcon Heavy, Kennedy (pas de tir 39A)','launch'] ]},
      { title:'Optique', rows:[
        ['Type','anastigmat à trois miroirs','ntrs'], ['Miroir primaire','2,4 m · ouverture utile 2,36 m · don d\'une autre agence fédérale',['ot','stobs']],
        ['Obstruction centrale','30,3 % du diamètre','ot'], ['Faisceau vers WFI','f/7,9','ot'], ['Température des miroirs','≈ 265 K','ot'] ]},
      { title:'WFI (grand champ)', rows:[
        ['Détecteurs','18 HgCdTe H4RG-10 de 4096 × 4096 px · pixels de 10 µm · ≈ 300 Mpx',['wfi','esa']], ['Échantillonnage','0,11″ par pixel','wfi'],
        ['Champ','0,8° × 0,4° · 0,281 deg² hors interstices','wfi'], ['Domaine','0,48–2,3 µm, 8 filtres','wfi'],
        ['Spectroscopie','grisme 1,00–1,93 µm (R ≈ 461 λ/µm) · prisme 0,75–1,80 µm (R 80 à 180)','wfi'], ['Température des détecteurs','89,5 K','wfi'] ]},
      { title:'Coronographe', rows:[
        ['Rôle','démonstration technologique : observer des planètes à côté d\'étoiles brillantes','esa'], ['Domaine','0,4–1,0 µm','stobs'],
        ['Masques','Lyot hybride et pupille façonnée','ntrs'], ['Détecteurs','EMCCD fournis par l\'ESA','esa'] ]},
      { title:'Orbite et données', rows:[
        ['Position','orbite de halo autour de L2, période ≈ 6 mois','ntrs'], ['Pointage','entre 54° et 126° du Soleil','ot'],
        ['Liaison science','bande Ka, jusqu\'à 500 Mbit/s','gs'], ['Volume','≈ 1,4 To par jour','gs'],
        ['Stations','White Sands (NASA), New Norcia (ESA), JAXA','ot'], ['Données','publiques dès leur traitement, sans période réservée','data'] ]}
    ],
    parts:[
      { key:'sass', name:'Pare-soleil à panneaux solaires', explode:[0,1,0,1.6],
        desc:"Le grand panneau tourné vers le Soleil. Il porte les cellules solaires et, en même temps, garde le télescope et les instruments à l'ombre, ce qui limite la lumière parasite et stabilise leur température.",
        facts:[["Six panneaux : deux fixes, quatre déployables", "ntrs"], ["≈ 4 500 W en fin de vie", "ntrs"]] },
      { key:'barrel', name:'Barillet et pare-lumière', explode:[-1,0,0,1.6],
        desc:"La longue enveloppe autour du télescope, ouverte en biseau vers l'avant. Elle protège l'optique de la lumière parasite et de la chaleur ; sur le télescope réel, c'est une structure composite hexagonale qui contient dix baffles.",
        facts:[["Dix baffles internes", "ntrs"], ["Porte le pare-soleil et le couvercle d'ouverture", "ntrs"]] },
      { key:'cover', name:'Couvercle d\'ouverture', explode:[-0.4,-1,0,1.6],
        desc:"Le couvercle qui protégeait le télescope du Soleil juste après le lancement. Déployé une seule fois, il bloque ensuite la lumière parasite aux angles de visée extrêmes. Sur la maquette de 2015, c'est un disque rigide ; le couvercle lancé est une structure souple.",
        facts:[["Déploiement unique", "ntrs"], ["Porte des capteurs solaires grossiers", "ntrs"]] },
      { key:'ota', name:'Télescope (miroirs primaire et secondaire)', explode:[0,0,0,0],
        desc:"Un télescope de 2,4 m, la taille de celui de Hubble, cédé à la NASA par une autre agence fédérale et adapté pour Roman. Les deux premiers miroirs sont à l'avant ; le troisième, dans l'optique arrière, envoie la lumière vers le grand champ.",
        facts:[["Miroir primaire de 2,4 m", "ot"], ["Miroirs vers 265 K", "ot"], ["Télescope existant, cédé à la NASA", "stobs"]] },
      { key:'instr', name:'Instruments et structure porteuse', explode:[0,-1,0,1.2],
        desc:"La structure en composite qui tient le télescope et les deux instruments : la caméra grand champ (WFI) et le coronographe. Elle reprend la technologie de la structure de Webb et travaille vers 213 K.",
        facts:[["WFI : 18 détecteurs, ≈ 300 Mpx", ["wfi", "esa"]], ["Coronographe : démonstration technologique", "esa"], ["Structure dérivée de celle de Webb, ≈ 213 K", "ntrs"]] },
      { key:'bus', name:'Module de service', explode:[1,0,0,1.4],
        desc:"La plateforme hexagonale à l'arrière : énergie, pointage, ordinateurs, mémoire et propulsion. Ses six baies d'électronique servent aussi de radiateurs.",
        facts:[["≈ 4 m × 2 m, 3 800 kg", "bus"], ["Six roues de réaction", "ntrs"], ["Hydrazine : quatre réservoirs, 24 propulseurs", "ntrs"], ["Mémoire de 9 To", "ntrs"]] },
      { key:'hga', name:'Antenne grand gain', explode:[1,0.5,0,1.8],
        desc:"La parabole orientable qui envoie chaque jour les données vers les stations de la NASA, de l'ESA et de la JAXA. Roman produit bien plus de données que Hubble et Webb réunis.",
        facts:[["Parabole de 1,7 m, bandes Ka et S", "ntrs"], ["Jusqu'à 500 Mbit/s", "gs"], ["≈ 1,4 To par jour", "gs"]] }
    ]
  }
];

/* groupes de l'en-tête, par domaine spectral principal, des courtes aux grandes longueurs d'onde ; l'astrométrie à part */
var DOMAINS = [
  { id:'gamma', label:'Rayons gamma', short:'Gamma' },
  { id:'x', label:'Rayons X', short:'Rayons X' },
  { id:'uv', label:'UV et visible', short:'UV, visible' },
  { id:'ir', label:'Infrarouge', short:'Infrarouge' },
  { id:'astro', label:'Astrométrie', short:'Astrom.' }
];
/* observatoires regroupés pour les en-têtes : [{ label, short, list }] ; un observatoire sans domaine connu va dans un dernier groupe sans nom */
function teleGroups(){
  var T = window.OBS_T || function(x){ return x; };
  var g = DOMAINS.map(function(d){ return { label:T(d.label), short:T(d.short), list:TELESCOPES.filter(function(t){ return t.domain === d.id; }) }; }).filter(function(x){ return x.list.length; });
  var rest = TELESCOPES.filter(function(t){ return !DOMAINS.some(function(d){ return d.id === t.domain; }); });
  if (rest.length) g.push({ label:'', short:'', list:rest });
  return g;
}
/* étiquette de groupe au-dessus du premier onglet : version longue, et courte pour le téléphone */
function domTag(g){ return g.label ? '<span class="dom" aria-hidden="true"><span class="dl">' + g.label + '</span><span class="ds">' + g.short + '</span></span>' : ''; }
