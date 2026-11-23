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
     orbit      leo (orbite basse, avec leo:{ alt km, per min }), heo (orbite terrestre très elliptique, avec heo:{ rp, ra en km depuis le centre de la Terre, apo, per, note }), l2, ou helio (autour du Soleil, dans le sillage de la Terre, avec helio.drift)
     ended      mission terminée ; deploy : animation de déploiement, configurée dans DEPLOY[id] (deploy.js)
     domain     groupe de l'en-tête, parmi DOMAINS (en fin de fichier) : domaine spectral principal
================================================================= */
var TELESCOPES = [
  {
    id:'hubble', mission:['general'], domain:'uv', name:'Hubble Space Telescope', short:'Hubble', year:'1990',
    agency:'NASA / ESA', launch:'Lancé le 24 avril 1990, navette Discovery (STS-31)',
    sub:'Orbite basse terrestre, ultraviolet, visible, proche infrarouge',
    src:'Maquette : NASA VTAD (domaine public), via Gaia Sky',
    file:'models/hubble.txt', bytes:4466940, axis:'z', size:13.2,
    view:{ az:-0.95, el:0.20, dist:1.55 }, sun:[0.55,0.62,0.56], orbit:'leo', leo:{ alt:480, per:95 },
    hero:{ num:'2,4', unit:'m', label:'diamètre du miroir primaire' },
    cmp:{ tag:'13,2 m', dim:'13,2 m de long', mirror:2.4, mass:10800, approx:true, len:13.2 },
    color:'#3D6BE0', highlight:['Miroir primaire','2,4','m'], footprint:['13,2 × 4,3','m, long × Ø max.'], optical:['ota','aft'],
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
    id:'cgro', mission:['general'], domain:'gamma', name:'Compton Gamma Ray Observatory', short:'Compton', year:'1991',
    agency:'NASA, avec des partenaires européens pour COMPTEL', launch:'Lancé le 5 avril 1991, navette Atlantis (STS-37)',
    sub:'Orbite basse, rayons gamma (1991–2000)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/cgro.glb', bytes:168588, axis:'z', size:21.3,
    view:{ az:-2.4, el:0.35, dist:1.15 }, sun:[0.3,0.9,0.3], orbit:'leo', leo:{ alt:450, per:93 },
    hero:{ num:'≈ 16', unit:'t', label:'le plus lourd observatoire astronomique de son temps' },
    cmp:{ tag:'21 m', dim:'9 m de long, 21 m d\'envergure', mirror:null, mass:16000, approx:true, len:21.3 },
    color:'#7A5230', highlight:['Domaine','20 keV – 30','GeV'], footprint:['4,6 × 9,1','m, corps du satellite'], optical:['egret','comptel','osse','batse'],
    compare:{ order:2, rot:[0, 0, 0], fp:null }, ended:true,
    desc:"Deuxième des grands observatoires de la NASA, après Hubble, Compton couvrait le ciel gamma de 20 keV à 30 GeV avec quatre instruments complémentaires. BATSE a détecté environ 2 700 sursauts gamma, répartis uniformément sur le ciel : ils venaient donc de très loin, au-delà de notre Galaxie. EGRET a découvert que les noyaux actifs de galaxies dont le jet pointe vers nous, les blazars, brillent en rayons gamma. Après la panne d'un gyroscope, la NASA l'a fait rentrer dans l'atmosphère en juin 2000, au-dessus du Pacifique.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources). Elle n'est pas en mètres : elle est mise à l'échelle sur l'envergure publiée des panneaux, 21,3 m ; ses proportions sont approximatives. Elle a été redécoupée ici en sept ensembles d'après ses matériaux, dont les noms désignent les instruments.",
    checked:'2026-11-20',
    refs:{
      msl:{ t:'Mission and Spacecraft Library, GRO', p:'NASA JPL', u:'https://space.jpl.nasa.gov/msl/QuickLooks/groQL.html' },
      cossc:{ t:'Compton Gamma-Ray Observatory', p:'HEASARC (NASA)', u:'https://heasarc.gsfc.nasa.gov/docs/cgro/cgro.html' },
      ins:{ t:'CGRO, mission overview (caractéristiques des instruments)', p:'HEASARC (NASA)', u:'https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/cgro.html' },
      epo:{ t:'The Compton Gamma Ray Observatory instruments', p:'HEASARC (NASA)', u:'https://heasarc.gsfc.nasa.gov/docs/cgro/epo/vu/overview/gro/instrmnt/instrmnt.html' },
      wiki:{ t:'Compton Gamma Ray Observatory', p:'Wikipédia (en anglais)', u:'https://en.wikipedia.org/wiki/Compton_Gamma_Ray_Observatory' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','4,6 × 9,1 m · panneaux de 21,3 m d\'envergure','msl'],
        ['Masse','≈ 16 t : 15,6 t, 16,3 t ou 17 t selon les sources',['msl','wiki','epo']],
        ['Puissance','4 500 W en début de vie','msl'],
        ['Lancement','5 avril 1991, navette Atlantis (STS-37) ; libéré le 7 avril','msl'] ]},
      { title:'Instruments', rows:[
        ['BATSE','8 modules aux coins · 20 keV à 1 MeV · tout le ciel','ins'],
        ['OSSE','4 détecteurs orientables · 0,05 à 10 MeV · champ de 3,8° × 11,4°','ins'],
        ['COMPTEL','télescope Compton · 0,8 à 30 MeV · ≈ 1 sr','ins'],
        ['EGRET','chambre à étincelles · 30 MeV à 10 GeV · ≈ 0,6 sr','ins'] ]},
      { title:'Orbite et fin', rows:[
        ['Orbite','≈ 450 km, circulaire · inclinaison 28,5°','msl'],
        ['Relèvements','1993 et 1997, par ses propres moteurs','wiki'],
        ['Fin','gyroscope en panne en décembre 1999 ; rentrée contrôlée le 4 juin 2000, au-dessus du Pacifique',['wiki','cossc']] ]}
    ],
    parts:[
      { key:'batse', name:'Détecteurs de sursauts (BATSE)', explode:[0,1,0,0.4],
        desc:"Huit modules, un à chaque coin du satellite, tournés dans des directions différentes. Chacun associe un grand détecteur et un détecteur spectroscopique ; en comparant leurs signaux, BATSE localise un sursaut à quelques degrés près, sur tout le ciel que la Terre ne cache pas.",
        facts:[["20 keV à 1 MeV", "ins"], ["Tout le ciel non caché par la Terre", "ins"], ["≈ 3° pour un sursaut intense", "ins"], ["≈ 2 700 sursauts détectés", "wiki"]] },
      { key:'osse', name:'Spectromètre OSSE', explode:[-1,1,0,0.6],
        desc:"Quatre grands scintillateurs, chacun dans un collimateur et monté sur un pivot, qui visent une petite région du ciel. OSSE a fait le relevé le plus complet de la région du centre galactique.",
        facts:[["0,05 à 10 MeV", "ins"], ["Champ de 3,8° × 11,4°", "ins"], ["2 013 cm² à 0,2 MeV", "ins"]] },
      { key:'comptel', name:'Télescope Compton (COMPTEL)', explode:[0,1,0,0.8],
        desc:"Deux étages de détecteurs l'un au-dessus de l'autre : le photon gamma rebondit sur un électron dans le premier (effet Compton) et s'arrête dans le second. Les deux mesures donnent un cercle de directions possibles sur le ciel. COMPTEL a cartographié l'aluminium 26 radioactif dans la Galaxie.",
        facts:[["0,8 à 30 MeV", "ins"], ["Champ d'≈ 1 sr", "ins"], ["Carte du ciel de l'aluminium 26", "wiki"]] },
      { key:'egret', name:'Télescope EGRET', explode:[1,1,0,0.8],
        desc:"Une chambre à étincelles : le photon gamma s'y transforme en paire électron–positon, dont les traces révèlent la direction. Un calorimètre, en dessous, mesure l'énergie. Le LAT de Fermi applique le même principe.",
        facts:[["30 MeV à 10 GeV", "ins"], ["1 200 cm² à 100 MeV", "ins"], ["271 sources dans son premier relevé", "wiki"]] },
      { key:'bus', name:'Module de service', explode:[0,-1,0,0.4],
        desc:"La structure allongée qui porte les quatre instruments, l'énergie, le pointage et la propulsion.",
        facts:[["9,1 m de long", "msl"], ["Conçu pour 2,25 ans, avec 8 ans d'ergols", "msl"]] },
      { key:'solar', name:'Panneaux solaires', explode:[0,0,1,0.6],
        desc:"Deux ailes, de part et d'autre du module.",
        facts:[["21,3 m d'envergure", "msl"], ["4 500 W en début de vie", "msl"]] },
      { key:'hga', name:'Antenne grand gain', explode:[0,-1,0,0.8],
        desc:"Au bout d'un long mât, sous le module, l'antenne qui transmettait les données.",
        facts:[] }
    ]
  },
  {
    id:'chandra', mission:['general'], domain:'x', name:'Chandra X-ray Observatory', short:'Chandra', year:'1999',
    agency:'NASA, exploité par le Smithsonian Astrophysical Observatory', launch:'Lancé le 23 juillet 1999, navette spatiale Columbia',
    sub:'Orbite terrestre très elliptique, rayons X (depuis 1999)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/chandra.glb', bytes:802076, axis:'x', size:13.8,
    view:{ az:-2.5, el:0.35, dist:1.3 }, sun:[0.2,0.9,0.3], orbit:'heo', heo:{ rp:13051, ra:148371, apo:'≈ 142 000 km', per:'63,5 h', note:'Terre, orbite et Lune à l\'échelle (orbite de 2025).' },
    hero:{ num:'0,5', unit:'″', label:'la netteté de ses images X (largeur à mi-hauteur)' },
    cmp:{ tag:'13,8 m', dim:'13,8 m de long, 19,5 m d\'envergure', mirror:1.2, mass:4800, len:13.8 },
    color:'#C2367A', highlight:['Focale','10','m'], footprint:['13,8 × 19,5','m, long × envergure'], optical:['hrma','oba','isim'],
    compare:{ order:3, rot:[0, 0.5, -Math.PI/2], fp:[1, 1] },   /* ouverture vers le haut */
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
    id:'xmm', mission:['general'], domain:'x', name:'XMM-Newton', short:'XMM-Newton', year:'1999',
    agency:'ESA', launch:'Lancé le 10 décembre 1999, Ariane 5, Kourou',
    sub:'Orbite terrestre très elliptique de 48 heures, rayons X (depuis 1999)',
    src:'Maquette : ESA, service SPICE (pour Cosmographia) ; autorisation de redistribution demandée à l\'ESA',
    file:'models/xmm.glb', bytes:474260, axis:'x', size:16,
    view:{ az:0.7, el:0.25, dist:1.25 }, sun:[0.1,-0.95,0.3], orbit:'heo', heo:{ rp:13371, ra:120371, apo:'≈ 114 000 km', per:'48 h', note:'Terre, orbite initiale et Lune à l\'échelle.' },
    hero:{ num:'3 × 58', unit:'', label:'miroirs emboîtés, dans trois télescopes X' },
    cmp:{ tag:'10 m', dim:'10 m de long, 16 m d\'envergure', mirror:0.7, mass:3800, len:10 },
    color:'#2E7FA8', highlight:['Miroirs','3 × 58',''], footprint:['10 × 16','m, long × envergure'], optical:['mirrors','tube','fpa'],
    compare:{ order:4, rot:[0, 0.5, -Math.PI/2], fp:[0, 1] },
    desc:"XMM-Newton a trois télescopes X côte à côte, chacun fait de 58 miroirs emboîtés en forme de tubes, que les rayons X effleurent. Ils recueillent beaucoup de lumière : c'est l'observatoire X idéal pour les spectres et les objets faibles, quand Chandra est celui des images les plus nettes. Un petit télescope optique et ultraviolet observe en même temps le même champ.",
    sourceNote:"Maquette de l'ESA, distribuée par le service SPICE de l'ESA pour le logiciel Cosmographia (aucune licence n'y est précisée ; créditée ici à l'ESA). Elle est redécoupée en six ensembles d'après sa géométrie, et mise à l'échelle sur l'envergure publiée de 16 m. Les miroirs ne sont visibles que par leurs ouvertures.",
    checked:'2026-11-19',
    refs:{
      fs:{ t:'XMM-Newton factsheet', p:'ESA', u:'https://www.esa.int/Science_Exploration/Space_Science/XMM-Newton/XMM-Newton_factsheet' },
      uhb:{ t:'XMM-Newton Users Handbook, caractéristiques de base', p:'ESA (copie du HEASARC)', u:'https://heasarc.gsfc.nasa.gov/docs/xmm/uhb2.20/uhb/basics.html' },
      mir:{ t:'The Telescopes of XMM-Newton', p:'ESA, XMM-Newton Science Operations Centre', u:'https://www.cosmos.esa.int/web/xmm-newton/technical-details-mirrors' },
      model:{ t:'Maquette XMM pour Cosmographia', p:'ESA SPICE Service', u:'https://spiftp.esac.esa.int/data/SPICE/XMM/misc/cosmo/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','10 m de long · 16 m d\'envergure, panneaux déployés','fs'], ['Masse au lancement','3,8 t','fs'],
        ['Construction','Dornier Satellitensysteme, maître d\'œuvre ; miroirs de Media Lario','fs'],
        ['Lancement','10 décembre 1999, Ariane 5, Kourou','fs'] ]},
      { title:'Télescopes', rows:[
        ['Miroirs','3 modules de 58 coques Wolter I emboîtées, en nickel doré',['fs','mir']],
        ['Diamètres','70 cm (coque extérieure) à 30,6 cm (intérieure) · 60 cm de long','mir'],
        ['Focale','7,5 m','mir'],
        ['Surface efficace','≈ 1 550 cm² par télescope à 1,5 keV','uhb'],
        ['Instruments','EPIC (une caméra pn, deux MOS), deux RGS, moniteur optique OM',['fs','uhb']] ]},
      { title:'Orbite et exploitation', rows:[
        ['Orbite','48 h · au lancement ≈ 7 000 × 114 000 km d\'altitude, inclinée de 40°','fs'],
        ['Observation','au-dessus de 46 000 km, jusqu\'à ≈ 40 h d\'affilée par orbite','uhb'],
        ['Contrôle','ESOC (Darmstadt) ; stations de Perth, Kourou et Santiago','fs'],
        ['Mission','prévue pour 10 ans ; exploitation approuvée jusqu\'à fin 2026','fs'] ]}
    ],
    parts:[
      { key:'mirrors', name:'Modules de miroirs', explode:[0,0,1,1.2],
        desc:"Trois télescopes X, chacun fait de 58 coques de nickel doré emboîtées. Les rayons X les frôlent sous un angle d'un demi-degré et convergent 7,5 m plus loin. Derrière deux des trois modules, des réseaux en dévient près de la moitié vers les spectromètres RGS.",
        facts:[["58 coques par module, Wolter I", "mir"], ["Focale de 7,5 m", "mir"], ["≈ 1 550 cm² par télescope à 1,5 keV", "uhb"]] },
      { key:'om', name:'Moniteur optique (OM)', explode:[0,0,1,1.6],
        desc:"Un petit télescope de 30 cm, monté à côté des miroirs X. Il observe en même temps le même champ, en visible et en ultraviolet, de 180 à 600 nm.",
        facts:[["30 cm", "uhb"], ["180 à 600 nm", "uhb"], ["Champ de 17′", "uhb"]] },
      { key:'svm', name:'Module de service', explode:[0,0,1,0.6],
        desc:"Il porte les miroirs, l'énergie, la propulsion et les communications ; son pare-soleil protège les télescopes.",
        facts:[["3,8 t au lancement, tout compris", "fs"]] },
      { key:'solar', name:'Panneaux solaires', explode:[1,0,0,0.5],
        desc:"Deux ailes de trois panneaux, qui donnent au satellite son envergure de 16 m.",
        facts:[["16 m d'envergure", "fs"]] },
      { key:'tube', name:'Tube du télescope', explode:[0,0,0,0],
        desc:"Un long tube en fibre de carbone relie les miroirs au plan focal, 7,5 m plus loin, et garde leur alignement.",
        facts:[["Focale de 7,5 m", "mir"]] },
      { key:'fpa', name:'Plan focal', explode:[0,0,-1,0.8],
        desc:"Au fond du tube, les trois caméras EPIC, une derrière chaque télescope, et les deux caméras des spectromètres RGS. Des radiateurs refroidissent leurs CCD.",
        facts:[["EPIC : une caméra pn, deux MOS", "uhb"], ["RGS : deux spectromètres", "uhb"]] }
    ]
  },
  {
    id:'integral', mission:['general'], domain:'gamma', name:'International Gamma-Ray Astrophysics Laboratory', short:'INTEGRAL', year:'2002',
    agency:'ESA, avec la Russie et les États-Unis ; spectromètre SPI sous maîtrise d\'œuvre du CNES', launch:'Lancé le 17 octobre 2002, Proton, Baïkonour',
    sub:'Orbite terrestre très elliptique, rayons gamma et X (2002–2025)',
    src:'Maquette : ESA, SCIFLEET ; autorisation de redistribution demandée à l\'ESA',
    file:'models/integral.glb', bytes:1353116, axis:'x', size:16,
    view:{ az:-2.6, el:0.3, dist:1.3 }, sun:[0.2,0.4,-0.9], orbit:'heo', heo:{ rp:15371, ra:159371, apo:'≈ 153 000 km', per:'72 h', note:'Terre, orbite de 2024 et Lune à l\'échelle.' },
    hero:{ num:'22', unit:'ans', label:'d\'observations du ciel gamma, de 2002 à 2025' },
    cmp:{ tag:'16 m', dim:'5 m de haut, 16 m d\'envergure', mirror:null, mass:4000, len:16 },
    color:'#245C9E', highlight:['Domaine','3 keV – 10','MeV'], footprint:['5 × 16','m, haut × envergure'], optical:['spi','ibis','jemx'],
    compare:{ order:6, rot:[0, 0, 0], fp:null }, ended:true,
    desc:"INTEGRAL observait le ciel en rayons gamma et X durs avec quatre instruments pointés dans la même direction. Ni miroir ni lentille à ces énergies : SPI et IBIS, comme les deux JEM-X, reconstruisent l'image du ciel à partir de l'ombre d'un masque codé. SPI, construit sous la maîtrise d'œuvre du CNES, mesurait très finement l'énergie des raies gamma ; IBIS localisait les sources à quelques minutes d'arc. Il a observé pendant 22 ans, jusqu'au 28 février 2025.",
    sourceNote:"Maquette de l'ESA (SCIFLEET), libre d'utilisation selon les conditions de l'ESA. Ses unités sont des pouces : elle est mise à l'échelle sur l'envergure publiée de 16 m. Elle a été redécoupée ici en six ensembles d'après sa géométrie ; la structure du module de charge utile est rattachée au module de service.",
    checked:'2026-11-20',
    refs:{
      fs:{ t:'INTEGRAL fact sheet', p:'ESA', u:'https://sci.esa.int/web/integral/-/47360-fact-sheet' },
      end:{ t:'Mission accomplished for Integral, ESA\'s gamma-ray telescope (28 février 2025)', p:'ESA', u:'https://www.esa.int/Science_Exploration/Space_Science/Integral/Mission_accomplished_for_Integral_ESA_s_gamma-ray_telescope' },
      cnes:{ t:'INTEGRAL en détails', p:'CNES', u:'https://cnes.fr/projets/integral/en-details' },
      isdc:{ t:'Introduction to the INTEGRAL Off-line Scientific Analysis, caractéristiques des instruments', p:'ISDC, Université de Genève', u:'https://www.isdc.unige.ch/integral/download/osa/doc/11.0/osa_um_intro/node7.html' },
      heasarc:{ t:'INTEGRAL, mission overview', p:'HEASARC (NASA)', u:'https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/integral.html' },
      sf:{ t:'SCIFLEET, maquettes des missions scientifiques', p:'ESA', u:'https://scifleet.esa.int/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','5 m de haut · Ø 3,7 m · 16 m d\'envergure, panneaux déployés','fs'], ['Masse au lancement','≈ 4 t','fs'],
        ['Lancement','17 octobre 2002, Proton, Baïkonour',['fs','heasarc']],
        ['Contribution française','SPI, sous maîtrise d\'œuvre du CNES','cnes'] ]},
      { title:'Instruments', rows:[
        ['SPI','spectromètre · 20 keV à 8 MeV · 19 détecteurs au germanium à 85 K',['isdc','heasarc']],
        ['IBIS','imageur · 15 keV à 10 MeV · 16 384 détecteurs CdTe et 4 096 CsI · 12′','isdc'],
        ['JEM-X','deux moniteurs X · 3 à 35 keV · 3′',['isdc','heasarc']],
        ['OMC','caméra optique, filtre V · champ de 5° × 5°',['isdc','heasarc']] ]},
      { title:'Orbite et fin', rows:[
        ['Orbite','72 h · 9 000 × 153 000 km au départ · inclinaison 51,6°','fs'],
        ['Opérations','contrôle à l\'ESOC (Darmstadt) ; opérations scientifiques à l\'ESAC ; données à l\'ISDC (Genève)','fs'],
        ['Fin','observations arrêtées le 28 février 2025, après 2 886 orbites ; rentrée prévue début 2029','end'] ]}
    ],
    parts:[
      { key:'spi', name:'Spectromètre (SPI)', explode:[0,1,1,0.8],
        desc:"Un masque codé au sommet du cylindre, et au fond une caméra de 19 détecteurs au germanium refroidis à 85 K, entourés d'un bouclier actif qui rejette les particules. SPI mesure l'énergie des photons gamma avec une grande finesse : de quoi séparer les raies émises par les noyaux radioactifs, ou celle de l'annihilation des positons.",
        facts:[["20 keV à 8 MeV", "isdc"], ["19 détecteurs au germanium, 85 K", "isdc"], ["2,3 keV de résolution à 1,3 MeV", "isdc"], ["Maîtrise d'œuvre du CNES", "cnes"]] },
      { key:'ibis', name:'Imageur (IBIS)', explode:[0,1,-1,0.8],
        desc:"Le grand caisson : un masque codé au sommet, deux plans de détecteurs au fond. ISGRI, en tellurure de cadmium, voit les énergies basses ; PICsIT, en iodure de césium, les plus hautes. Il localise les sources à quelques minutes d'arc.",
        facts:[["15 keV à 10 MeV", "isdc"], ["16 384 CdTe et 4 096 CsI", "isdc"], ["Résolution de 12′", "isdc"], ["Champ de 9° entièrement codé", "isdc"]] },
      { key:'jemx', name:'Moniteurs X (JEM-X)', explode:[0,1,0,1.0],
        desc:"Deux petits télescopes à masque codé, dont les masques ronds sont visibles au sommet. Ils voient les mêmes sources en rayons X plus mous, de 3 à 35 keV, à des énergies où IBIS ne descend pas.",
        facts:[["3 à 35 keV", "isdc"], ["Résolution de 3′", "isdc"]] },
      { key:'omc', name:'Caméra optique (OMC)', explode:[-1,1,0,0.6],
        desc:"Une petite caméra CCD derrière une optique à lentilles et un filtre V : elle suit l'éclat visible des sources que regardent les instruments gamma.",
        facts:[["Champ de 5° × 5°", "isdc"], ["Filtre V", "isdc"]] },
      { key:'svm', name:'Module de service et structure', explode:[0,-1,0,0.6],
        desc:"Le module du bas porte les réservoirs, l'énergie et les communications. Au-dessus, la structure du module de charge utile relie les quatre instruments.",
        facts:[["≈ 4 t au lancement", "fs"]] },
      { key:'solar', name:'Panneaux solaires', explode:[1,0,0,0.6],
        desc:"Deux ailes de panneaux, de part et d'autre du module de service.",
        facts:[["16 m d'envergure", "fs"]] }
    ]
  },
  {
    id:'wmap', mission:['survey'], domain:'mw', name:'Wilkinson Microwave Anisotropy Probe', short:'WMAP', year:'2001',
    agency:'NASA (Goddard), avec l\'université de Princeton', launch:'Lancé le 30 juin 2001, Delta II, Cap Canaveral',
    sub:'Point de Lagrange L2, fond diffus cosmologique (2001–2010)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/wmap.glb', bytes:1329400, axis:'y', size:3.6,
    view:{ az:0.7, el:0.3, dist:1.8 }, sun:[0,-1,0.05], orbit:'l2',
    hero:{ num:'13,77', unit:'milliards d\'années', label:'l\'âge de l\'Univers mesuré, à un demi pour cent près' },
    cmp:{ tag:'5,1 m', dim:'3,6 m de haut, Ø 5,1 m', mirror:1.5, mass:840, len:5.1 },
    color:'#C77D2E', highlight:['Fréquences','23 à 94','GHz'], footprint:['3,6 × 5,1','m, haut × Ø'], optical:['optics','fpa'],
    compare:{ order:5, rot:[0, 0, 0], fp:null }, ended:true,
    desc:"WMAP a cartographié tout le ciel dans cinq bandes de micro-ondes, de 23 à 94 GHz, pour mesurer les variations de température du fond diffus cosmologique, de l'ordre du millionième de degré. Ses deux télescopes, dos à dos, regardaient en même temps deux points du ciel très éloignés l'un de l'autre et ne mesuraient que leur différence. En neuf ans, il a fixé l'âge de l'Univers à 13,77 milliards d'années et sa composition : environ 5 % de matière ordinaire, 25 % de matière noire et 70 % d'énergie noire.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources), allégée ici. Elle n'est pas en mètres : elle est mise à l'échelle sur la hauteur publiée de 3,6 m, et son écran solaire mesure alors ≈ 4,8 m pour 5,1 m publiés. Elle a été redécoupée en cinq ensembles d'après ses matériaux.",
    checked:'2026-11-20',
    refs:{
      nasa:{ t:'WMAP overview', p:'NASA Science', u:'https://science.nasa.gov/mission/wmap/wmap-overview/' },
      wiki:{ t:'Wilkinson Microwave Anisotropy Probe', p:'Wikipédia (en anglais)', u:'https://en.wikipedia.org/wiki/Wilkinson_Microwave_Anisotropy_Probe' },
      lambda:{ t:'WMAP, Data Release 5 (neuf ans)', p:'LAMBDA, NASA Goddard', u:'https://lambda.gsfc.nasa.gov/product/wmap/current/index.html' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','3,6 m de haut · Ø 5,1 m','wiki'], ['Masse','840 kg au lancement · ≈ 830 kg selon la NASA',['wiki','nasa']], ['Puissance','419 W','wiki'],
        ['Lancement','30 juin 2001, Delta II 7425, Cap Canaveral',['nasa','wiki']] ]},
      { title:'Instrument', rows:[
        ['Télescopes','deux grégoriens dos à dos · primaires de 1,4 × 1,6 m',['nasa','wiki']],
        ['Récepteurs','20 cornets, 10 de chaque côté, et autant de radiomètres différentiels','wiki'],
        ['Bandes','K 23 · Ka 33 · Q 41 · V 61 · W 94 GHz','wiki'],
        ['Résolution','de 52,8′ (K) à 13,2′ (W)','wiki'] ]},
      { title:'Orbite et fin', rows:[
        ['Orbite','autour de L2, atteint le 1er octobre 2001','wiki'],
        ['Fin','données jusqu\'au 19 août 2010 ; éteint le 20 octobre 2010, sur une orbite autour du Soleil',['nasa','wiki']],
        ['Mission','prévue pour 27 mois, menée 9 ans','nasa'] ]}
    ],
    parts:[
      { key:'optics', name:'Télescopes', explode:[0,1,0,0.6],
        desc:"Deux télescopes grégoriens dos à dos : chacun a un grand miroir primaire de 1,4 × 1,6 m et un secondaire, qui renvoient le rayonnement vers les cornets au centre. Ils voient en même temps deux directions du ciel ; seule la différence entre les deux est mesurée, ce qui annule la plupart des effets de l'instrument.",
        facts:[["Primaires de 1,4 × 1,6 m", "nasa"], ["Deux télescopes grégoriens dos à dos", "wiki"]] },
      { key:'fpa', name:'Cornets et radiomètres', explode:[0,1,0,0.3],
        desc:"Entre les deux télescopes, les 20 cornets, 10 par côté, guident le rayonnement vers les radiomètres. Leur nombre augmente avec la fréquence : 2 en bande K, 8 en bande W, la plus fine.",
        facts:[["20 cornets", "wiki"], ["Bande W : 8 radiomètres, 13,2′", "wiki"]] },
      { key:'rad', name:'Radiateurs passifs et structure', explode:[0,0,1,0.4],
        desc:"Les grands panneaux blancs rayonnent vers l'espace la chaleur de l'instrument, refroidi sans aucun liquide cryogénique, et la structure en tube relie l'instrument au module de service.",
        facts:[] },
      { key:'bus', name:'Module de service', explode:[0,-1,0,0.4],
        desc:"Le module hexagonal porte l'électronique, les roues de réaction, la propulsion et les communications.",
        facts:[["419 W", "wiki"]] },
      { key:'solar', name:'Écran solaire et panneaux', explode:[0,-1,0,0.6],
        desc:"Le grand disque tourné vers le Soleil porte les panneaux solaires et garde l'instrument à l'ombre. WMAP tournait sur lui-même en gardant l'écran face au Soleil, pour balayer le ciel.",
        facts:[["Ø 5,1 m", "wiki"]] }
    ]
  },
  {
    id:'spitzer', mission:['general'], domain:'ir', name:'Spitzer Space Telescope', short:'Spitzer', year:'2003',
    agency:'NASA (JPL, Caltech)', launch:'Lancé le 25 août 2003, Delta II, Cap Canaveral',
    sub:'Orbite autour du Soleil, dans le sillage de la Terre, infrarouge (2003–2020)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/spitzer.glb', bytes:1064244, axis:'y', size:4.5,
    view:{ az:-2.4, el:0.3, dist:2.1 }, sun:[0.15,0.35,-0.92], orbit:'helio',
    helio:{ drift:'s\'éloigne de ≈ 0,12 UA par an' },
    hero:{ num:'5,6', unit:'K', label:'la température du télescope pendant la mission froide' },
    cmp:{ tag:'4,5 m', dim:'4,5 m de haut, Ø 2,1 m', mirror:0.85, mass:861, len:4.5 },
    color:'#B03A2E', highlight:['Miroir primaire','0,85','m'], footprint:['4,5 × 2,1','m, haut × Ø'], optical:['tele','cta'],
    compare:{ order:7, rot:[0, 0, 0], fp:[1, 2] }, ended:true,
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
    id:'fermi', mission:['survey','transient'], domain:'gamma', name:'Fermi Gamma-ray Space Telescope', short:'Fermi', year:'2008',
    agency:'NASA et département de l\'Énergie des États-Unis, avec la France, l\'Allemagne, l\'Italie, le Japon et la Suède', launch:'Lancé le 11 juin 2008, Delta II, Cap Canaveral',
    sub:'Orbite basse, rayons gamma (depuis 2008)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/fermi.glb', bytes:2017012, axis:'z', size:15,
    view:{ az:-2.5, el:0.16, dist:1.35 }, sun:[0.3,0.9,0.3], orbit:'leo', leo:{ alt:565, per:96.5 },
    hero:{ num:'20', unit:'%', label:'du ciel vu à chaque instant par le LAT' },
    cmp:{ tag:'15 m', dim:'2,9 m de haut, 15 m d\'envergure', mirror:null, mass:4303, len:15 },
    color:'#4C3A99', highlight:['Domaine','20 MeV – 300','GeV'], footprint:['2,9 × 15','m, haut × envergure'], optical:['lat'],
    compare:{ order:9, rot:[0, 0, 0], fp:null },
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
    id:'swift', mission:['transient'], domain:'gamma', name:'Neil Gehrels Swift Observatory', short:'Swift', year:'2004',
    agency:'NASA, avec l\'Italie et le Royaume-Uni ; opérations à Penn State', launch:'Lancé le 20 novembre 2004, Delta II, Cap Canaveral',
    sub:'Orbite basse, sursauts gamma, rayons X et ultraviolet (2004–2026)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/swift.glb', bytes:1137756, axis:'y', size:5.6,
    view:{ az:-2.5, el:0.3, dist:1.6 }, sun:[0.2,0.55,-0.8], orbit:'leo', leo:{ alt:590, per:96.6 },
    hero:{ num:'≈ 1', unit:'min', label:'pour pivoter tout entier vers un sursaut gamma qu\'il vient de détecter' },
    cmp:{ tag:'5,6 m', dim:'5,6 × 5,4 m', mirror:0.3, mass:1470, len:5.6 },
    color:'#E39B17', highlight:['Sursauts gamma','> 2 000',''], footprint:['5,6 × 5,4','m'], optical:['bat','xrt','uvot'],
    compare:{ order:8, rot:[0, 0, 0], fp:null }, ended:true,
    desc:"Un sursaut gamma ne dure que quelques secondes. Swift était fait pour les attraper : son télescope à masque codé, BAT, surveillait un sixième du ciel ; dès qu'il voyait un sursaut, le satellite pivotait tout seul, en une minute environ, pour pointer ses deux autres télescopes, en rayons X et en ultraviolet, sur la lueur rémanente. Prévu pour deux ans, il a observé près de 22 ans et plus de 2 000 sursauts, avant de retomber dans l'atmosphère le 4 novembre 2026.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources). Elle n'est pas en mètres : elle est mise à l'échelle sur la longueur publiée de 5,6 m. Ses proportions sont approximatives : les panneaux solaires y paraissent plus étendus que les 5,4 m publiés. Elle a été redécoupée ici en six ensembles d'après sa géométrie et ses matériaux.",
    checked:'2026-11-20',
    refs:{
      g04:{ t:'Gehrels et al. 2004, The Swift Gamma-Ray Burst Mission, ApJ 611, 1005', p:'arXiv', u:'https://arxiv.org/abs/astro-ph/0405233' },
      bat:{ t:'BAT Instrument Description', p:'NASA Goddard, Swift', u:'https://swift.gsfc.nasa.gov/about_swift/bat_desc.html' },
      xrt:{ t:'XRT Instrument Description', p:'NASA Goddard, Swift', u:'https://swift.gsfc.nasa.gov/about_swift/xrt_desc.html' },
      uvot:{ t:'The Swift Technical Handbook, Overview of UVOT', p:'NASA Goddard, Swift', u:'https://swift.gsfc.nasa.gov/proposals/tech_appd/swiftta_v17/node39.html' },
      end:{ t:'NASA\'s Swift Mission Ends (23 octobre 2026)', p:'NASA Science', u:'https://science.nasa.gov/missions/swift/nasas-swift-mission-ends/' },
      reent:{ t:'NASA\'s Swift Observatory Re-Entered Atmosphere (4 novembre 2026)', p:'NASA Science', u:'https://science.nasa.gov/blogs/swift/2026/11/02/nasas-swift-observatory-to-re-enter-atmosphere/' },
      wiki:{ t:'Neil Gehrels Swift Observatory', p:'Wikipédia (en anglais)', u:'https://en.wikipedia.org/wiki/Neil_Gehrels_Swift_Observatory' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','5,6 × 5,4 m','wiki'], ['Masse','≈ 1 450 kg (prévision) · 1 470 kg au lancement',['g04','wiki']], ['Puissance','1 040 W','wiki'],
        ['Construction','plateforme de Spectrum Astro','wiki'],
        ['Lancement','20 novembre 2004, Delta II 7320, Cap Canaveral',['wiki','end']] ]},
      { title:'Instruments', rows:[
        ['BAT','masque codé de 2,7 m², 1 m au-dessus de 32 768 détecteurs CZT · 15 à 150 keV · 1,4 sr','bat'],
        ['XRT','télescope Wolter I de 3,5 m de focale · 0,2 à 10 keV · champ de 23,6′','xrt'],
        ['UVOT','Ritchey-Chrétien de 30 cm, f/12,7 · 170 à 600 nm · champ de 17′','uvot'],
        ['Réaction','pivotement autonome vers le sursaut en une minute environ','end'] ]},
      { title:'Orbite et fin', rows:[
        ['Orbite','585 × 604 km au départ · inclinaison 20,6° · 96,6 min','wiki'],
        ['Pointage','jusqu\'à 75 cibles indépendantes par jour','end'],
        ['Gyroscopes','deux sur quatre perdus ; pointage sur deux gyroscopes depuis avril 2024','wiki'],
        ['Fin','dernière observation le 20 octobre 2026 ; rentré dans l\'atmosphère le 4 novembre 2026, au-dessus de Sumatra',['end','reent']] ]}
    ],
    parts:[
      { key:'bat', name:'Télescope d\'alerte (BAT)', explode:[0,1,-1,0.8],
        desc:"Un télescope sans miroir : un masque d'environ 54 000 petites tuiles de plomb, posé 1 m au-dessus d'un plan de détecteurs. Une source projette l'ombre du masque, décalée selon sa direction ; en comparant cette ombre au motif du masque, BAT retrouve la position d'un sursaut à quelques minutes d'arc près, en une vingtaine de secondes.",
        facts:[["Masque de 2,7 m², ≈ 54 000 tuiles de plomb", "bat"], ["32 768 détecteurs CZT de 4 × 4 × 2 mm", "bat"], ["Champ de 1,4 sr, 100° × 60°", "bat"], ["15 à 150 keV", "bat"]] },
      { key:'xrt', name:'Télescope X (XRT)', explode:[0,1,1,0.8],
        desc:"Un télescope à incidence rasante, avec des miroirs de rechange de la mission JET-X, et une caméra CCD au foyer, 3,5 m plus loin. Il précise la position du sursaut à quelques secondes d'arc et suit le déclin de sa lueur en rayons X.",
        facts:[["Wolter I, focale de 3,5 m", "xrt"], ["110 cm² à 1,5 keV", "xrt"], ["CCD de 600 × 600 px, 2,36″", "xrt"], ["0,2 à 10 keV", "xrt"]] },
      { key:'uvot', name:'Télescope ultraviolet et visible (UVOT)', explode:[0,1,1,1.2],
        desc:"Un télescope de 30 cm, aligné sur le XRT, qui compte les photons un à un avec un détecteur à intensificateur. Il donne la position du sursaut à mieux qu'une seconde d'arc, et ses couleurs, à travers une roue de filtres et deux grismes.",
        facts:[["30 cm, f/12,7", "uvot"], ["170 à 600 nm", "uvot"], ["Champ de 17′ × 17′", "uvot"], ["Plus de 1,5 million d'images", "end"]] },
      { key:'shade', name:'Écrans des télescopes', explode:[0,1,1,0.4],
        desc:"Les panneaux qui entourent l'ouverture du XRT et de l'UVOT, au-dessus du plateau des instruments.",
        facts:[["Ouvertures du XRT et de l'UVOT, côte à côte", "g04"]] },
      { key:'bus', name:'Module de service', explode:[0,-1,0,0.6],
        desc:"La plateforme de Spectrum Astro : énergie, ordinateur, roues de réaction et gyroscopes. Elle sait faire pivoter tout l'observatoire de 50° en moins de 75 s, sans attendre d'ordre du sol.",
        facts:[["50° en moins de 75 s", "g04"], ["1 040 W", "wiki"]] },
      { key:'solar', name:'Panneaux solaires', explode:[1,0,0,0.6],
        desc:"Deux ailes, de part et d'autre du module de service.",
        facts:[["Envergure publiée : 5,4 m", "wiki"]] }
    ]
  },
  {
    id:'gaia', mission:['survey'], domain:'astro', name:'Gaia', short:'Gaia', year:'2013',
    agency:'ESA', launch:'Lancé le 19 décembre 2013, Soyouz-Frégate, Kourou',
    sub:'Point de Lagrange L2 (2014–2025), astrométrie en lumière visible',
    src:'Maquette : Toni Sagristà, Gaia Sky (CC BY)',
    file:'models/gaia.txt', bytes:1814984, axis:'x', size:10.2,
    view:{ az:0.6, el:0.42, dist:1.35 }, sun:[0.5,-0.85,0.17], orbit:'l2',
    hero:{ num:'106', unit:'CCD', label:'un plan focal de près d\'un milliard de pixels' },
    cmp:{ tag:'Ø ≈ 10 m', dim:'Ø ≈ 10 m (pare-soleil)', mirror:1.45, mass:2030, len:10.2 },
    color:'#9A52D6', highlight:['Plan focal','106','CCD'], footprint:['10,2','m, Ø du pare-soleil'], optical:['torus','focal','tent'],
    compare:{ order:13, rot:[0.5, 0, 0], fp:[0, 0] }, ended:true, deploy:true,
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
    id:'herschel', mission:['general'], domain:'ir', name:'Herschel Space Observatory', short:'Herschel', year:'2009',
    agency:'ESA, avec la NASA ; instruments de consortiums européens', launch:'Lancé le 14 mai 2009, Ariane 5, Kourou, avec Planck',
    sub:'Point de Lagrange L2, infrarouge lointain et submillimétrique (2009–2013)',
    src:'Maquette : ESA, SCIFLEET ; autorisation de redistribution demandée à l\'ESA',
    file:'models/herschel.glb', bytes:581068, axis:'y', size:7.5,
    view:{ az:0.5, el:0.25, dist:2.0 }, sun:[0,0.1,-1], orbit:'l2',
    hero:{ num:'3,5', unit:'m', label:'de miroir : le plus grand télescope infrarouge spatial jusqu\'à Webb' },
    cmp:{ tag:'7,5 m', dim:'7,5 m de haut, 4 m de large', mirror:3.5, mass:3400, len:7.5 },
    color:'#A33B5E', highlight:['Miroir primaire','3,5','m'], footprint:['7,5 × 4','m, haut × section'], optical:['tele','cryo'],
    compare:{ order:11, rot:[0, 0, 0], fp:[1, 3] }, ended:true,
    desc:"Herschel observait l'infrarouge lointain et le domaine submillimétrique, de 55 à 672 µm : la lumière de la poussière froide où naissent les étoiles, et des galaxies lointaines qui en forment beaucoup. Avec son miroir de 3,5 m, en carbure de silicium, c'était le plus grand télescope infrarouge spatial jamais construit, jusqu'à Webb. Ses trois instruments baignaient dans l'hélium liquide d'un cryostat ; quand il s'est épuisé, en avril 2013, la mission s'est arrêtée.",
    sourceNote:"Maquette de l'ESA (SCIFLEET), libre d'utilisation selon les conditions de l'ESA. Elle est mise à l'échelle sur la hauteur publiée de 7,5 m ; son miroir y mesure bien 3,5 m. Elle a été redécoupée ici en quatre ensembles d'après sa géométrie.",
    checked:'2026-11-20',
    refs:{
      fs:{ t:'Herschel fact sheet', p:'ESA', u:'https://sci.esa.int/web/herschel/47356-fact-sheet' },
      vs:{ t:'Herschel, vital stats', p:'ESA', u:'https://www.esa.int/Our_Activities/Space_Science/Herschel/Vital_stats' },
      pil:{ t:'Pilbratt et al. 2010, Herschel Space Observatory, A&A 518, L1', p:'arXiv', u:'https://arxiv.org/abs/1005.5331' },
      sf:{ t:'SCIFLEET, maquettes des missions scientifiques', p:'ESA', u:'https://scifleet.esa.int/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','7,5 m de haut · 4 × 4 m de section','fs'], ['Masse','3,4 t au lancement, dont 335 kg d\'hélium',['fs','pil']],
        ['Puissance','1 200 W, dont 506 W pour les instruments','pil'],
        ['Lancement','14 mai 2009, Ariane 5 ECA, Kourou, avec Planck','fs'] ]},
      { title:'Télescope et instruments', rows:[
        ['Télescope','Cassegrain · primaire de 3,5 m en 12 segments de carbure de silicium · ≈ 85 K','pil'],
        ['Cryostat','2 367 L d\'hélium superfluide','pil'],
        ['HIFI','spectromètre hétérodyne · 157–212 et 240–625 µm · R ≈ 10⁶','pil'],
        ['PACS','photomètre 60–210 µm · spectromètre 55–210 µm','pil'],
        ['SPIRE','photomètre à 250, 350 et 500 µm · spectromètre 194–671 µm','pil'] ]},
      { title:'Orbite et fin', rows:[
        ['Orbite','autour de L2, à ≈ 1,5 million de km · période ≈ 178 jours','fs'],
        ['Opérations','ESOC (Darmstadt) ; centre scientifique à l\'ESAC ; centre de la NASA à l\'IPAC (Caltech)','fs'],
        ['Fin','dernière observation le 29 avril 2013, hélium épuisé','fs'] ]}
    ],
    parts:[
      { key:'tele', name:'Télescope', explode:[0,1,0,0.8],
        desc:"Un Cassegrain : le primaire de 3,5 m, fait de 12 segments de carbure de silicium brasés, et un petit secondaire au bout d'un trépied. Il n'était pas refroidi par l'hélium : à l'ombre du pare-soleil, il descendait par rayonnement vers 85 K.",
        facts:[["Primaire de 3,5 m, 12 segments", "pil"], ["Télescope de 315 kg", "vs"], ["≈ 85 K", "pil"], ["Système à f/8,7", "pil"]] },
      { key:'cryo', name:'Cryostat et instruments', explode:[0,0,1,0.6],
        desc:"Un grand réservoir d'hélium superfluide, sous le télescope. Au-dessus, sur un banc optique refroidi, les parties froides des trois instruments : HIFI, PACS et SPIRE.",
        facts:[["2 367 L d'hélium", "pil"], ["Trois instruments : HIFI, PACS, SPIRE", "fs"]] },
      { key:'shade', name:'Pare-soleil et panneaux solaires', explode:[0,0,-1,0.8],
        desc:"Un écran tourné vers le Soleil, qui garde à l'ombre le télescope et le cryostat ; sa partie basse porte les cellules solaires.",
        facts:[["≈ 12 m² de panneaux", "vs"]] },
      { key:'svm', name:'Module de service', explode:[0,-1,0,0.6],
        desc:"Le module octogonal du bas porte l'électronique chaude des instruments, sur quatre de ses huit panneaux, ainsi que l'énergie, le pointage et les communications.",
        facts:[["Électronique chaude sur 4 des 8 panneaux", "pil"], ["130 kbit/s de données scientifiques au plus", "pil"]] }
    ]
  },
  {
    id:'planck', mission:['survey'], domain:'mw', name:'Planck', short:'Planck', year:'2009',
    agency:'ESA ; HFI dirigé par l\'IAS (Orsay, France), LFI par l\'Italie', launch:'Lancé le 14 mai 2009, Ariane 5, Kourou, avec Herschel',
    sub:'Point de Lagrange L2, fond diffus cosmologique (2009–2013)',
    src:'Maquette : ESA, SCIFLEET ; autorisation de redistribution demandée à l\'ESA',
    file:'models/planck.glb', bytes:527168, axis:'y', size:4.2,
    view:{ az:0.6, el:0.3, dist:2.0 }, sun:[0,-1,0.05], orbit:'l2',
    hero:{ num:'0,1', unit:'K', label:'la température des bolomètres de l\'instrument HFI' },
    cmp:{ tag:'4,2 m', dim:'4,2 m de haut, Ø 4,2 m', mirror:1.5, mass:1950, len:4.2 },
    color:'#5C9E3B', highlight:['Fréquences','30 à 857','GHz'], footprint:['4,2 × 4,2','m, haut × Ø'], optical:['tele','vgroove'],
    compare:{ order:12, rot:[0, 0, 0], fp:null }, ended:true,
    desc:"Planck a cartographié tout le ciel en micro-ondes, dans neuf bandes de 30 à 857 GHz, pour mesurer les infimes variations de température du fond diffus cosmologique, la lumière émise 380 000 ans après le Big Bang. Ses détecteurs les plus sensibles, les bolomètres de l'instrument HFI, conçu sous la direction de l'Institut d'astrophysique spatiale d'Orsay, étaient refroidis à 0,1 K. Ses cartes ont fixé l'âge, la composition et la géométrie de l'Univers.",
    sourceNote:"Maquette de l'ESA (SCIFLEET), libre d'utilisation selon les conditions de l'ESA. Elle est mise à l'échelle sur la hauteur publiée de 4,2 m. Elle a été redécoupée ici en quatre ensembles d'après sa géométrie.",
    checked:'2026-11-20',
    refs:{
      fs:{ t:'Planck fact sheet', p:'ESA', u:'https://sci.esa.int/web/planck/-/47365-fact-sheet' },
      vs:{ t:'Planck, vital stats', p:'ESA', u:'https://m.esa.int/Our_Activities/Space_Science/Planck/Vital_stats' },
      pla:{ t:'The Planck mission (Planck Legacy Archive)', p:'ESA', u:'https://wiki.cosmos.esa.int/planckpla/index.php/The_Planck_mission' },
      p18:{ t:'Planck Collaboration 2020, Planck 2018 results. I. Overview, A&A 641, A1, tableau 4', p:'A&A', u:'https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/T4.html' },
      cool:{ t:'Planck, cooling system', p:'ESA', u:'https://sci.esa.int/web/planck/45498-cooling-system' },
      sf:{ t:'SCIFLEET, maquettes des missions scientifiques', p:'ESA', u:'https://scifleet.esa.int/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','4,2 m de haut · Ø 4,2 m','fs'], ['Masse','≈ 1,9 t au lancement','fs'], ['Panneaux solaires','13 m²','vs'],
        ['Lancement','14 mai 2009, Ariane 5 ECA, Kourou, avec Herschel','fs'] ]},
      { title:'Télescope et instruments', rows:[
        ['Télescope','primaire de 1,9 × 1,5 m, ouverture projetée de 1,5 m','fs'],
        ['LFI','22 récepteurs radio à 20 K · 30, 44 et 70 GHz',['fs','p18']],
        ['HFI','52 bolomètres à 0,1 K · 100 à 857 GHz',['fs','p18']],
        ['Résolution','de 32′ à 30 GHz à 4,2′ à 857 GHz','p18'] ]},
      { title:'Orbite et fin', rows:[
        ['Orbite','autour de L2, amplitude moyenne ≈ 400 000 km','fs'],
        ['Balayage','rotation d\'un tour par minute ; au moins 95 % du ciel en 15 mois',['vs']],
        ['Fin','HFI : relevé achevé le 14 janvier 2012 ; LFI : 3 octobre 2013 ; dernier ordre le 23 octobre 2013',['pla','fs']] ]}
    ],
    parts:[
      { key:'tele', name:'Télescope et plan focal', explode:[0,1,0,0.8],
        desc:"Un télescope hors d'axe : un primaire elliptique de 1,9 × 1,5 m et un secondaire, dans un baffle noir qui arrête la lumière parasite. Au foyer, les cornets des deux instruments recueillent le rayonnement.",
        facts:[["Primaire de 1,9 × 1,5 m", "fs"], ["Télescope et plan focal : 205 kg", "vs"]] },
      { key:'vgroove', name:'Écrans en V', explode:[0,1,0,0.4],
        desc:"Trois écrans coniques réfléchissants, écartés de 5° l'un de l'autre, rayonnent la chaleur vers l'espace froid : de 300 K au module de service, la température tombe vers 45 K au dernier écran. Le télescope, au-dessus, reste vers 50 K.",
        facts:[["Trois écrans, 5° d'ouverture entre deux voisins", "cool"], ["≈ 45 K au plus haut", "cool"], ["Télescope vers 50 K", "cool"]] },
      { key:'svm', name:'Module de service', explode:[0,-1,0,0.6],
        desc:"Le module octogonal porte l'électronique, les communications et les compresseurs de la chaîne de refroidissement : un refroidisseur à hydrogène (20 K), un étage à 4 K, puis une dilution d'hélium 3 dans l'hélium 4 qui amène les bolomètres de HFI à 0,1 K.",
        facts:[["LFI à 20 K, HFI à 4 K puis 0,1 K", "cool"], ["Trois étages de refroidissement actif", "cool"]] },
      { key:'solar', name:'Panneau solaire', explode:[0,-1,0,0.4],
        desc:"Un disque tourné vers le Soleil, sous le satellite : il fournit l'énergie et garde tout le reste à l'ombre. Planck tournait autour de l'axe du disque, une fois par minute.",
        facts:[["13 m²", "vs"], ["Un tour par minute", "vs"]] }
    ]
  },
  {
    id:'kepler', mission:['transit'], domain:'uv', name:'Kepler Space Telescope', short:'Kepler', year:'2009',
    agency:'NASA (Ames, JPL), construit par Ball Aerospace', launch:'Lancé le 7 mars 2009, Delta II, Cap Canaveral',
    sub:'Orbite autour du Soleil, dans le sillage de la Terre, recherche d\'exoplanètes (2009–2018)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/kepler.glb', bytes:416912, axis:null, size:0,
    view:{ az:-2.2, el:0.3, dist:2.0 }, sun:[-0.92,0.3,0.25], orbit:'helio',
    helio:{ drift:'s\'est éloigné jusqu\'à ≈ 1,1 UA de la Terre en 2018' },
    hero:{ num:'4', unit:'ans', label:'à fixer le même champ du ciel, entre le Cygne et la Lyre' },
    cmp:{ tag:'4,7 m', dim:'4,7 m de haut, Ø 2,7 m', mirror:0.95, mass:1052, len:4.7 },
    color:'#6A8D2F', highlight:['Champ','115','deg²'], footprint:['4,7 × 2,7','m, haut × Ø'], optical:['phot'],
    compare:{ order:10, rot:[0, 0, 0], fp:[0, 1] }, ended:true,
    desc:"Kepler a fixé pendant quatre ans le même coin du ciel, entre le Cygne et la Lyre, en mesurant toutes les demi-heures l'éclat de plus de 100 000 étoiles. Quand une planète passe devant son étoile, l'éclat baisse un peu : c'est ainsi qu'il a découvert plus de 2 600 planètes et montré que la plupart des étoiles en ont. Son télescope de Schmidt, de 0,95 m, projetait un champ de 115 deg² sur 42 CCD.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources, version A), en mètres : 4,7 m de haut sans l'antenne, comme dans le dossier de presse. Elle a été redécoupée ici en quatre ensembles d'après sa géométrie et ses matériaux.",
    checked:'2026-11-19',
    refs:{
      pk:{ t:'Kepler, dossier de presse du lancement (février 2009)', p:'NASA / JPL', u:'https://www.jpl.nasa.gov/news/press_kits/Kepler-presskit-2-19-smfile.pdf' },
      kih:{ t:'Kepler Instrument Handbook (KSCI-19033-001)', p:'NASA Ames, archive MAST', u:'https://archive.stsci.edu/kepler/manuals/KSCI-19033-001.pdf' },
      nasa:{ t:'Kepler / K2, In Depth', p:'NASA Science', u:'https://science.nasa.gov/mission/kepler/in-depth/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','4,7 m de haut · Ø ≈ 2,7 m','pk'], ['Masse au lancement','1 052,4 kg','pk'],
        ['Énergie','panneaux fixes de 10,2 m², 2 860 cellules, plus de 1 100 W','pk'],
        ['Pointage','quatre roues de réaction ; deux tombées en panne (juillet 2012, mai 2013)',['pk','nasa']],
        ['Lancement','7 mars 2009 (TU), Delta II 7925-10L, Cap Canaveral',['nasa','pk']] ]},
      { title:'Photomètre', rows:[
        ['Optique','télescope de Schmidt · lame de 0,95 m · miroir primaire de 1,4 m','kih'],
        ['Focale','1 399 mm · f/1,47','kih'],
        ['Détecteurs','42 CCD de 1044 × 2200 px, pixels de 27 µm, soit 3,98″','kih'],
        ['Champ','115,6 deg² couverts de pixels actifs · Ø 16,1°','kih'],
        ['Domaine','420 à 900 nm','kih'] ]},
      { title:'Orbite et données', rows:[
        ['Orbite','autour du Soleil, 0,97 × 1,041 UA, dans le sillage de la Terre','nasa'],
        ['Période','371 jours','pk'],
        ['Liaison','bande Ka, jusqu\'à 4,3 Mbit/s · un jour par mois, observations interrompues pour transmettre','pk'],
        ['Fin','30 octobre 2018, ergols épuisés','nasa'] ]}
    ],
    parts:[
      { key:'phot', name:'Photomètre', explode:[0,1,0,0.8],
        desc:"Un télescope de Schmidt : une lame correctrice de 0,95 m à l'entrée, un miroir sphérique de 1,4 m au fond, et le plan focal au milieu du tube, face au miroir. Le pare-soleil, coupé en biseau, protège l'ouverture de la lumière du Soleil.",
        facts:[["Lame de 0,95 m, primaire de 1,4 m", "kih"], ["42 CCD, 95 millions de pixels", "pk"], ["Champ de 115 deg²", "kih"]] },
      { key:'solar', name:'Panneaux solaires', explode:[-1,0,0,0.6],
        desc:"Quatre panneaux fixes, du côté du Soleil, qui font aussi écran pour le photomètre. Pour les garder face au Soleil, Kepler tournait de 90° sur lui-même tous les trois mois.",
        facts:[["10,2 m², 2 860 cellules", "pk"], ["Plus de 1 100 W", "pk"], ["Rotation de 90° tous les trois mois", "pk"]] },
      { key:'bus', name:'Module de service', explode:[0,-1,0,0.6],
        desc:"Le module hexagonal de Ball Aerospace porte l'électronique, les quatre roues de réaction et les propulseurs. Après la panne de deux roues, la mission K2 a tenu le pointage en s'appuyant sur la pression de la lumière du Soleil.",
        facts:[["Quatre roues de réaction", "pk"], ["Mission K2 de 2014 à 2018", "nasa"]] },
      { key:'hga', name:'Antenne grand gain', explode:[0,0,-1,0.6],
        desc:"Une antenne parabolique fixe en bande Ka. Une fois par mois, Kepler cessait d'observer pendant un jour et se tournait tout entier vers la Terre pour transmettre ses données.",
        facts:[["Bande Ka, jusqu'à 4,3 Mbit/s", "pk"], ["Un jour de transmission par mois", "pk"]] }
    ]
  },
  {
    id:'tess', mission:['transit'], domain:'uv', name:'Transiting Exoplanet Survey Satellite', short:'TESS', year:'2018',
    agency:'NASA, mission dirigée par le MIT', launch:'Lancé le 18 avril 2018, Falcon 9, Cap Canaveral',
    sub:'Orbite très elliptique en résonance avec la Lune, recherche d\'exoplanètes (depuis 2018)',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/tess.glb', bytes:657160, axis:'x', size:3.9,
    view:{ az:-2.4, el:0.38, dist:1.5 }, sun:[0.3,0.9,0.3], orbit:'heo', heo:{ rp:108000, ra:373000, apo:'≈ 373 000 km', per:'13,7 jours', note:'Terre, orbite nominale et Lune à l\'échelle.' },
    hero:{ num:'24° × 96°', unit:'', label:'la bande de ciel vue d\'un coup par ses quatre caméras' },
    cmp:{ tag:'3,9 m', dim:'3,9 × 1,2 × 1,5 m, déployé', mirror:0.105, lens:true, mass:325, len:3.9 },
    color:'#1F7A8C', highlight:['Champ','24° × 96°',''], footprint:['3,9 × 1,2 × 1,5','m, déployé'], optical:['cams'],
    compare:{ order:14, rot:[0, 0.4, 0], fp:[0, 2] },
    desc:"TESS cherche des planètes autour des étoiles proches et brillantes, en guettant la petite baisse d'éclat qui se produit quand une planète passe devant son étoile. Ses quatre caméras, de petits objectifs de 10,5 cm, couvrent ensemble une bande de 24° sur 96° du ciel, qu'elles fixent pendant 27 jours avant de passer à la suivante. Son orbite très allongée, réglée sur celle de la Lune, l'emmène presque jusqu'à elle.",
    sourceNote:"Maquette de la NASA (dépôt NASA 3D Resources, version B), redécoupée ici en cinq ensembles d'après sa géométrie et ses matériaux. Elle n'est pas en mètres : elle est mise à l'échelle sur la longueur déployée publiée de 3,9 m. Le grand écran conique autour des caméras vient de la maquette ; les documents de la mission décrivent surtout un capot sur chaque objectif.",
    checked:'2026-11-19',
    refs:{
      fs:{ t:'TESS, fiche de mission (2015)', p:'NASA Goddard', u:'https://lhea.gsfc.nasa.gov/archive/tess/documents/tess_factsheet_06-05-15.pdf' },
      eo:{ t:'TESS (Transiting Exoplanet Survey Satellite)', p:'eoPortal (ESA)', u:'https://eoportal.org/satellite-missions/tess' },
      hto:{ t:'TESS, Telescope Information', p:'TESS Science Support Center (HEASARC)', u:'https://heasarc.gsfc.nasa.gov/docs/tess/telescope_information.html' },
      og:{ t:'TESS Observatory Guide, v1.1', p:'TESS Science Support Center', u:'https://heasarc.gsfc.nasa.gov/docs/tess/docs/TESS_observatory_guide_v1.1.pdf' },
      winn:{ t:'Winn 2024, The Transiting Exoplanet Survey Satellite', p:'arXiv:2410.12905', u:'https://arxiv.org/abs/2410.12905' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions, déployé','3,9 × 1,2 × 1,5 m','eo'], ['Masse au lancement','325 kg','eo'],
        ['Énergie','deux ailes, 415 W disponibles pour un besoin de ≈ 290 W','hto'],
        ['Module','LEOStar-2 d\'Orbital ATK · quatre roues de réaction · pointage à 3″ près',['fs','eo']],
        ['Lancement','18 avril 2018, Falcon 9, Cap Canaveral',['winn','eo']] ]},
      { title:'Caméras', rows:[
        ['Optique','4 caméras identiques · 7 lentilles · pupille de 10,5 cm · f/1,4','hto'],
        ['Champ','24° × 24° chacune · 24° × 96° ensemble','hto'],
        ['Détecteurs','16 CCD CCID-80 de 2048 × 2048 px · pixels de 15 µm, soit 21″','hto'],
        ['Domaine','600 à 1 000 nm','hto'],
        ['Images complètes','toutes les 30 min au début, puis 10 min, puis 200 s','winn'] ]},
      { title:'Orbite et données', rows:[
        ['Orbite','≈ 17 × 59 rayons terrestres (≈ 108 000 × 373 000 km) · 13,7 jours · résonance 2:1 avec la Lune',['og','eo']],
        ['Secteurs','24° × 96°, observés 27,4 jours, deux orbites','og'],
        ['Liaison','bande Ka, 100 Mbit/s · antenne de 0,7 m · au périgée, ≈ 4 h par orbite',['hto','og']],
        ['Données','publiques sans délai, à l\'archive MAST','winn'] ]}
    ],
    parts:[
      { key:'cams', name:'Caméras', explode:[0,1,0,0.8],
        desc:"Quatre caméras identiques, alignées pour couvrir ensemble une bande de 24° sur 96°. Chacune est un objectif de sept lentilles ouvert à f/1,4 devant quatre CCD : de quoi photographier toutes les deux secondes un carré de ciel de 24° de côté.",
        facts:[["Pupille de 10,5 cm, f/1,4", "hto"], ["Champ de 24° × 24° chacune", "hto"], ["4 CCD de 2048 × 2048 px par caméra", "hto"], ["Poses de 2 s, additionnées à bord", "og"]] },
      { key:'shade', name:'Écran conique', explode:[0,1,0,1.4],
        desc:"Dans la maquette, un grand écran conique entoure les caméras. Les documents de la mission décrivent un capot sur chaque objectif, qui réduit la lumière de la Terre et de la Lune diffusée dans les caméras.",
        facts:[["Capots contre la lumière diffusée de la Terre et de la Lune", "og"]] },
      { key:'bus', name:'Module de service', explode:[0,-1,0,0.6],
        desc:"Un module LEOStar-2 construit par Orbital ATK. Quatre roues de réaction tiennent le pointage à quelques secondes d'arc près ; des propulseurs à hydrazine évacuent de temps en temps l'élan accumulé sous la pression de la lumière du Soleil.",
        facts:[["LEOStar-2, Orbital ATK", ["fs","eo"]], ["Pointage à 3″ près", "fs"], ["Quatre roues de réaction, propulseurs à hydrazine", "eo"]] },
      { key:'hga', name:'Antenne grand gain', explode:[0,0,1,0.6],
        desc:"Une antenne de 0,7 m en bande Ka. Les données ne descendent qu'au périgée, une fois par orbite : pendant quelques heures, TESS interrompt ses observations et se tourne vers la Terre.",
        facts:[["0,7 m, bande Ka, 100 Mbit/s", "hto"], ["≈ 4 h de transmission à chaque périgée", "og"]] },
      { key:'solar', name:'Panneaux solaires', explode:[1,0,0,0.5],
        desc:"Deux ailes qui suivent le Soleil en tournant sur un axe.",
        facts:[["415 W disponibles", "hto"], ["Orientables sur un axe", "fs"]] }
    ]
  },
  {
    id:'cheops', mission:['transit'], domain:'uv', name:'CHaracterising ExOPlanet Satellite', short:'CHEOPS', year:'2019',
    agency:'ESA et la Suisse, avec dix autres pays européens dont la France', launch:'Lancé le 18 décembre 2019, Soyouz-Frégate, Kourou',
    sub:'Orbite basse héliosynchrone, photométrie d\'étoiles à planètes (depuis 2019)',
    src:'Maquette : ESA, SCIFLEET ; autorisation de redistribution demandée à l\'ESA',
    file:'models/cheops.glb', bytes:360528, axis:'y', size:1.55,
    view:{ az:-2.3, el:0.35, dist:2.4 }, sun:[-0.95,0.2,0.2], orbit:'leo', leo:{ alt:700, per:98.7 },
    hero:{ num:'15,5', unit:'ppm', label:'de précision sur l\'éclat d\'une étoile brillante, en 6 heures' },
    cmp:{ tag:'1,5 m', dim:'un peu plus de 1,5 m de haut', mirror:0.32, mass:280, approx:true, len:1.5 },
    color:'#3BA7C4', highlight:['Miroir primaire','0,32','m'], footprint:['1,5 × 1,6','m, haut × base'], optical:['tele'],
    compare:{ order:15, rot:[0, 0, 0], fp:[0, 3] },
    desc:"CHEOPS ne cherche pas de nouvelles planètes : il mesure avec une extrême précision l'éclat d'étoiles brillantes dont on sait déjà qu'elles en ont, pour voir la planète passer devant et en déduire sa taille. Son petit télescope de 32 cm forme volontairement une image floue de l'étoile, étalée sur des centaines de pixels, pour que la mesure soit stable. C'est la première « petite » mission de l'ESA, menée avec la Suisse.",
    sourceNote:"Maquette de l'ESA (SCIFLEET), libre d'utilisation selon les conditions de l'ESA, en millimètres. Le fichier des matériaux n'est pas distribué : les textures ont été rattachées aux matériaux d'après leurs coordonnées. Elle a été redécoupée ici en trois ensembles.",
    checked:'2026-11-20',
    refs:{
      benz:{ t:'Benz et al. 2021, The CHEOPS mission, Experimental Astronomy 51, 109', p:'arXiv', u:'https://arxiv.org/abs/2009.11633' },
      nut:{ t:'CHEOPS in a nutshell', p:'ESA', u:'https://www.cosmos.esa.int/web/cheops/cheops-in-a-nutshell' },
      sc:{ t:'CHEOPS spacecraft', p:'ESA Cosmos', u:'https://www.cosmos.esa.int/web/cheops/cheops-spacecraft' },
      ext:{ t:'CHEOPS Space Mission extended (11 juin 2026)', p:'Université de Berne', u:'https://mediarelations.unibe.ch/media_releases/2026/media_releases_2026/cheops_space_mission_extended/index_eng.html' },
      cnes:{ t:'CHEOPS', p:'CNES', u:'https://cnes.fr/en/projects/cheops' },
      sf:{ t:'SCIFLEET, maquettes des missions scientifiques', p:'ESA', u:'https://scifleet.esa.int/' }
    },
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions','≈ 1,5 m de haut · base de ≈ 1,6 × 1,6 m',['benz','sc']], ['Masse au lancement','≈ 275 kg (≈ 280 selon l\'ESA)',['benz','nut']],
        ['Énergie','panneaux de ≈ 2,5 m², un peu moins de 200 W en moyenne','benz'],
        ['Lancement','18 décembre 2019, Soyouz-Frégate, Kourou',['benz','nut']] ]},
      { title:'Télescope', rows:[
        ['Optique','Ritchey-Chrétien dans l\'axe · primaire de 320 mm','benz'],
        ['Focale','2 681 mm à 750 nm · f/8,4','benz'],
        ['Détecteur','un CCD de 1024 × 1024 px de 13 µm · 1″ par pixel','benz'],
        ['Domaine','0,4 à 1,1 µm','benz'],
        ['Précision','15,5 ppm en 6 h pour 6 ≤ V ≤ 9 (mesuré en vol)','benz'] ]},
      { title:'Orbite et exploitation', rows:[
        ['Orbite','héliosynchrone aube–crépuscule · 700 km · 98,7 min','benz'],
        ['Visée','dans un cône de 60° autour de la direction opposée au Soleil','benz'],
        ['Opérations','contrôle à l\'INTA (Torrejón, Espagne) ; centre scientifique à l\'Université de Genève','benz'],
        ['Mission','prolongée jusqu\'à fin 2029','ext'] ]}
    ],
    parts:[
      { key:'tele', name:'Télescope', explode:[1,0,0,0.6],
        desc:"Un Ritchey-Chrétien de 32 cm, couché dans la plateforme, avec un long baffle qui arrête la lumière parasite de la Terre. Sur la maquette, son couvercle est ouvert et rabattu sur le côté. L'image de l'étoile est volontairement défocalisée sur un rayon d'environ 16 pixels.",
        facts:[["Primaire de 320 mm", "benz"], ["Focale de 2 681 mm, f/8,4", "benz"], ["CCD de 1024 × 1024 px, à 233 K puis 228 K", "benz"], ["Tache défocalisée : 90 % de l'énergie dans 16 px de rayon", "benz"]] },
      { key:'solar', name:'Panneaux solaires', explode:[-1,0,0,0.4],
        desc:"Des panneaux sur trois côtés, qui font aussi écran : CHEOPS garde le Soleil derrière lui et vise dans un cône de 60° autour de la direction opposée.",
        facts:[["≈ 2,5 m²", "benz"], ["Un peu moins de 200 W en moyenne", "benz"]] },
      { key:'bus', name:'Plateforme', explode:[0,-1,0,0.5],
        desc:"La plateforme d'Airbus Defence and Space porte l'électronique, le pointage et la propulsion. Elle tient la visée à environ 1″ près.",
        facts:[["Pointage ≈ 1″ rms en recette", "benz"], ["Réservoir d'hydrazine de 30 L", "benz"]] }
    ]
  },
  {
    id:'jwst', mission:['general'], domain:'ir', name:'James Webb Space Telescope', short:'JWST', year:'2021',
    agency:'NASA / ESA / ASC', launch:'Lancé le 25 décembre 2021, Ariane 5, Kourou',
    sub:'Point de Lagrange L2, infrarouge proche et moyen',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/jwst.txt', bytes:5328456, axis:null, size:0,
    view:{ az:0.62, el:0.30, dist:1.35 }, sun:[0.18,-0.97,-0.16], orbit:'l2',
    hero:{ num:'6,5', unit:'m', label:'miroir primaire, 18 segments dorés' },
    cmp:{ tag:'21,2 × 14,2 m', dim:'21,2 × 14,2 m (bouclier)', mirror:6.5, mass:6200, approx:true, len:21.2 },
    color:'#DB5A14', highlight:['Miroir primaire','6,5','m'], footprint:['21,2 × 14,2','m, pare-soleil'], optical:['primary','secondary','aos','isim'],
    compare:{ order:16, rot:[0, 0.35, 0], fp:[2, 0] }, deploy:true,
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
    id:'euclid', mission:['survey'], domain:'ir', name:'Euclid', short:'Euclid', year:'2023',
    agency:'ESA (avec la NASA)', launch:'Lancé le 1ᵉʳ juillet 2023, Falcon 9, Cap Canaveral',
    sub:'Point de Lagrange L2, visible et proche infrarouge',
    src:'Maquette : ESA SciFleet, via Gaia Sky ; autorisation de redistribution demandée à l\'ESA',
    file:'models/euclid.txt', bytes:7970528, axis:'y', size:4.8,
    view:{ az:0.75, el:0.26, dist:1.6 }, sun:[-0.44,0.12,0.89], orbit:'l2',
    hero:{ num:'1,2', unit:'m', label:'télescope à très grand champ' },
    cmp:{ tag:'4,8 m', dim:'4,8 m de haut, Ø 3,74 m', mirror:1.2, mass:1988, len:4.8 },
    color:'#0F987A', highlight:['Miroir primaire','1,2','m'], footprint:['4,8 × 3,7','m, haut × Ø'], optical:['baffle','instr'],
    compare:{ order:17, rot:[0, -1.05, 0], fp:[1, 0] },
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
    id:'roman', mission:['survey'], domain:'ir', name:'Nancy Grace Roman Space Telescope', short:'Roman', year:'2026',
    agency:'NASA (avec l\'ESA, la JAXA et le CNES)', launch:'Lancé le 30 août 2026, Falcon Heavy, Kennedy',
    sub:'Point de Lagrange L2, proche infrarouge grand champ',
    src:'Maquette : NASA 3D Resources (conception de 2015)',
    file:'models/roman.glb', bytes:3112960, axis:'x', size:11.34,
    view:{ az:-2.3, el:0.32, dist:1.25 }, sun:[0.15,0.95,0.25], orbit:'l2',
    hero:{ num:'0,28', unit:'deg²', label:'un champ au moins 100 fois plus grand que celui de Hubble' },
    cmp:{ tag:'12,7 m', dim:'12,7 m de long, 4,4 m de large, déployé', mirror:2.4, mass:10500, approx:true, len:11.3 },   /* masse avec ergols : prévision de 2021, la NASA ne publie que la masse à sec */
    color:'#B8860B', highlight:['Miroir primaire','2,4','m'], footprint:['12,7 × 4,4','m, long × large, déployé'], optical:['ota','instr'],
    compare:{ order:18, rot:[0, 0.5, -Math.PI/2], fp:[0, 1] },   /* ouverture vers le haut, comme Hubble */
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
  { id:'mw', label:'Micro-ondes', short:'Micro-ondes' },
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
/* classifications contrôlées pour « Comparer » et la future page Flotte (spécifications, priorité 2).
   Famille d'orbite : champ orbit du registre. Type de mission : champ mission (une ou deux valeurs).
   Type d'instrument : champ type de chaque instrument (data-inst.js). Libellés traduits par OBS_T. */
var ORBIT_FAMILIES = [
  { id:'leo', label:'Orbite basse', def:'autour de la Terre, à quelques centaines de kilomètres' },
  { id:'heo', label:'Orbite terrestre très elliptique', def:'autour de la Terre, jusqu\'à des centaines de milliers de kilomètres' },
  { id:'l2', label:'Autour de L2', def:'autour du point de Lagrange L2, à 1,5 million de kilomètres' },
  { id:'helio', label:'Autour du Soleil', def:'sur une orbite solaire, dans le sillage de la Terre' }
];
var MISSION_TYPES = [
  { id:'general', label:'Observatoire généraliste', def:'temps d\'observation ouvert à tous par appel à propositions' },
  { id:'survey', label:'Relevé du ciel', def:'cartographie systématique d\'une grande partie du ciel' },
  { id:'transit', label:'Exoplanètes par transits', def:'suivi de l\'éclat des étoiles pour y voir passer des planètes' },
  { id:'transient', label:'Sursauts et ciel variable', def:'détection rapide des phénomènes brefs' }
];
/* couleurs choisies pour rester distinctes en clair et en sombre, et doublées d'un pictogramme (forme) */
var INST_TYPES = [
  { id:'imager', label:'Imageur', color:'#2F6FDB' },
  { id:'specimager', label:'Imageur et spectrographe', color:'#0F987A' },
  { id:'spectro', label:'Spectrographe', color:'#C2367A' },
  { id:'photometer', label:'Photomètre', color:'#DB7A14' },
  { id:'astrometry', label:'Astrométrie', color:'#7A4FB5' },
  { id:'coronagraph', label:'Coronographe', color:'#5B6770' },
  { id:'guider', label:'Guidage', color:'#8C8C3A' },
  { id:'burst', label:'Détecteur de sursauts', color:'#B8461E' },
  { id:'polarimeter', label:'Polarimètre', color:'#1E8FB8' }
];
function instType(id){ return INST_TYPES.filter(function(x){ return x.id === id; })[0] || INST_TYPES[0]; }
/* pictogramme d'un type d'instrument, en SVG (taille en px) */
function typeIcon(id, sz){
  var t = instType(id), c = t.color, z = sz || 14, T = window.OBS_T || function(x){ return x; }, g;
  switch (id){
    case 'imager': g = '<rect x="2.5" y="2.5" width="11" height="11" fill="'+c+'"/>'; break;
    case 'specimager': g = '<rect x="2.5" y="2.5" width="7" height="11" fill="'+c+'"/><path d="M11 3v10M13.5 3v10" stroke="'+c+'" stroke-width="1.6"/>'; break;
    case 'spectro': g = '<path d="M3 3v10M6 3v10M9 3v10M12 3v10" stroke="'+c+'" stroke-width="1.8"/>'; break;
    case 'photometer': g = '<path d="M1.5 6h4l1.5 4h2l1.5-4h4" fill="none" stroke="'+c+'" stroke-width="2"/>'; break;
    case 'astrometry': g = '<circle cx="8" cy="8" r="5" fill="none" stroke="'+c+'" stroke-width="1.8"/><path d="M8 1v14M1 8h14" stroke="'+c+'" stroke-width="1.4"/>'; break;
    case 'coronagraph': g = '<circle cx="8" cy="8" r="6" fill="none" stroke="'+c+'" stroke-width="1.6"/><circle cx="8" cy="8" r="3" fill="'+c+'"/>'; break;
    case 'guider': g = '<path d="M8 1.5l6.5 6.5L8 14.5 1.5 8z" fill="none" stroke="'+c+'" stroke-width="1.8"/><circle cx="8" cy="8" r="1.6" fill="'+c+'"/>'; break;
    case 'burst': g = '<path d="M8 1l1.6 4.6L14 4l-2.6 4L14 12l-4.4-1.6L8 15l-1.6-4.6L2 12l2.6-4L2 4l4.4 1.6z" fill="'+c+'"/>'; break;
    default: g = '<path d="M2 14L14 2M2 8l6-6M8 14l6-6" stroke="'+c+'" stroke-width="1.8"/>';
  }
  return '<svg class="ticon" width="'+z+'" height="'+z+'" viewBox="0 0 16 16" role="img" aria-label="'+T(t.label)+'"><title>'+T(t.label)+'</title>'+g+'</svg>';
}
/* état de la comparaison, partagé par la vue 3D et la page des instruments : critère (by), groupe (g), type d'instrument filtré */
window.OBS_CMP = window.OBS_CMP || { by:'orbit', g:'l2', type:null };
function cmpGroups(by){
  var T = window.OBS_T || function(x){ return x; };
  var src = by === 'mission' ? MISSION_TYPES : by === 'domain' ? DOMAINS : ORBIT_FAMILIES;
  return src.map(function(d){ return { id:d.id, label:T(d.label), def:d.def ? T(d.def) : '', list:TELESCOPES.filter(function(t){ return by === 'mission' ? (t.mission || []).indexOf(d.id) >= 0 : by === 'domain' ? t.domain === d.id : t.orbit === d.id; }) }; })
    .filter(function(x){ return x.list.length; });
}
/* observatoires de la comparaison en cours, dans l'ordre chronologique ; « all » = tous (mélange signalé) */
function cmpList(){
  var c = window.OBS_CMP, l = c.g === 'all' ? TELESCOPES.slice() : ((cmpGroups(c.by).filter(function(x){ return x.id === c.g; })[0] || cmpGroups(c.by)[0]).list).slice();
  return l.sort(function(a, b){ return a.compare.order - b.compare.order; });
}
/* sélecteur de comparaison (boutons data-cmpby et data-cmpg) */
function cmpSelector(){
  var T = window.OBS_T || function(x){ return x; }, c = window.OBS_CMP, gs = cmpGroups(c.by);
  if (c.g !== 'all' && !gs.some(function(x){ return x.id === c.g; })) c.g = gs[0].id;
  var cur = gs.filter(function(x){ return x.id === c.g; })[0];
  return '<div class="cmpsel"><div class="cmpsel-by" role="group" aria-label="' + T('Comparer par') + '"><span>' + T('Comparer par') + '</span>' +
    [['orbit','famille d\'orbite'],['mission','type de mission'],['domain','domaine spectral']].map(function(b){ return '<button class="seg" data-cmpby="' + b[0] + '" aria-pressed="' + (c.by === b[0]) + '">' + T(b[1]) + '</button>'; }).join('') + '</div>' +
    '<div class="cmpsel-g" role="group" aria-label="' + T('Groupe') + '">' + gs.map(function(x){ return '<button class="chip" data-cmpg="' + x.id + '" aria-pressed="' + (c.g === x.id) + '">' + x.label + ' <small>' + x.list.length + '</small></button>'; }).join('') +
    '<button class="chip mix" data-cmpg="all" aria-pressed="' + (c.g === 'all') + '">' + T('Tous') + ' <small>' + TELESCOPES.length + '</small></button></div>' +
    '<p class="cmpsel-def">' + (c.g === 'all' ? T('Tous les observatoires : les familles sont mélangées, les écarts de taille et d\'orbite peuvent écraser les figures.') : (cur && cur.def ? cur.def.charAt(0).toUpperCase() + cur.def.slice(1) + '.' : '')) + '</p></div>';
}
/* navigation en deux rangées : les domaines spectraux (boutons qui filtrent), puis les observatoires du domaine choisi.
   OBS_DOM garde le domaine affiché ; par défaut, celui de l'observatoire ouvert. */
window.OBS_DOM = window.OBS_DOM || null;
function domainOf(id){ var t = TELESCOPES.filter(function(x){ return x.id === id; })[0]; return t ? t.domain : null; }
function domRow(cur){
  var T = window.OBS_T || function(x){ return x; }, d = window.OBS_DOM || domainOf(cur) || null, curDom = domainOf(cur);
  return '<div class="drow" role="group" aria-label="' + T('Domaine spectral') + '">' + DOMAINS.filter(function(x){ return TELESCOPES.some(function(t){ return t.domain === x.id; }); }).map(function(x){
    var n = TELESCOPES.filter(function(t){ return t.domain === x.id; }).length;
    return '<button class="dsel' + (x.id === curDom ? ' cur' : '') + '" data-dom="' + x.id + '" aria-pressed="' + (x.id === d) + '" title="' + T(x.label) + ' : ' + n + '">' +
           '<span class="dl">' + T(x.label) + '</span><span class="ds">' + T(x.short) + '</span><span class="dn">' + n + '</span></button>';
  }).join('') + '</div>';
}
function domList(cur){ var d = window.OBS_DOM || domainOf(cur) || null; return d ? TELESCOPES.filter(function(t){ return t.domain === d; }) : []; }
