/* =================================================================
   OBSERVATOIRES — fiche, pièces cliquables, réglages de la maquette.
   Axes : repère propre à chaque fichier 3D (voir `axis`, `size`).
   explode = [dx,dy,dz, distance en mètres] dans le repère de la maquette.
================================================================= */
var TELESCOPES = [
  {
    id:'hubble', name:'Hubble Space Telescope', short:'Hubble', year:'1990',
    agency:'NASA / ESA', launch:'Lancé le 24 avril 1990, navette Discovery (STS-31)',
    sub:'Orbite basse terrestre, ultraviolet, visible, proche infrarouge',
    src:'Maquette : NASA VTAD, via Gaia Sky',
    file:'models/hubble.txt', bytes:4466940, axis:'z', size:13.2,
    view:{ az:-0.95, el:0.20, dist:1.55 }, sun:[0.55,0.62,0.56], orbit:'leo',
    hero:{ num:'2,4', unit:'m', label:'diamètre du miroir primaire' },
    cmp:{ tag:'13,2 m', dim:'13,2 m de long', mirror:2.4, mass:11110, len:13.2 },
    desc:"Premier des grands observatoires de la NASA, Hubble tourne autour de la Terre depuis 1990. Cinq missions de navette l'ont réparé et modernisé en orbite : presque tous ses instruments actuels datent de ces visites. Son tube argenté abrite un télescope Ritchey-Chrétien et une baie d'instruments interchangeables.",
    sourceNote:"Maquette créée par NASA Visualization Technology Applications and Development (VTAD), distribuée avec Gaia Sky. Le fichier d'origine est découpé par texture ; il a été redécoupé ici en pièces physiques pour que le clic désigne la bonne partie.",
    sections:[
      { title:'Véhicule', rows:[
        ['Longueur','13,2 m'], ['Diamètre max.','4,2 m'],
        ['Masse au lancement','≈ 11 110 kg'],
        ['Missions d\'entretien','5 (1993, 1997, 1999, 2002, 2009)'],
        ['Pointage','1 gyroscope en service depuis 2024 (mode économe)'] ]},
      { title:'Optique', rows:[
        ['Type','Ritchey-Chrétien'], ['Miroir primaire','2,4 m · verre ULE · 828 kg'],
        ['Miroir secondaire','0,3 m'], ['Longueur focale','57,6 m'], ['Rapport focal','f/24'],
        ['Stabilité de pointage','0,007″'] ]},
      { title:'Instruments actifs', rows:[
        ['WFC3','caméra grand champ, UV à proche IR (2009)'], ['ACS','caméra de relevés (2002)'],
        ['STIS','spectrographe imageur (1997)'], ['COS','spectrographe ultraviolet (2009)'],
        ['FGS','3 capteurs de guidage fin'] ]},
      { title:'Orbite', rows:[
        ['Altitude','≈ 500–540 km, en lente décroissance'], ['Inclinaison','28,5°'],
        ['Période','≈ 95 min (≈ 15 orbites par jour)'], ['Vitesse','≈ 27 000 km/h'] ]},
      { title:'Énergie et données', rows:[
        ['Panneaux solaires','2 ailes rigides de 7,1 × 2,6 m'], ['Puissance','≈ 5 kW produits'],
        ['Batteries','6, nickel-hydrogène'], ['Liaison','bande S, relais par satellites TDRS'] ]}
    ],
    parts:[
      { key:'door', name:"Porte d'ouverture et pare-lumière", explode:[0,0,1,3.4],
        desc:"L'entrée du télescope. Le volet se referme automatiquement si l'axe de visée s'approche trop du Soleil, pour protéger l'optique. Derrière lui, le pare-lumière bloque la lumière parasite de la Terre et de la Lune.",
        facts:['Volet ≈ 3 m de diamètre','Fermeture automatique de sécurité'] },
      { key:'ota', name:'Coque avant (miroir secondaire)', explode:[0,0,1,1.5],
        desc:"Le tube qui prolonge le télescope vers l'avant. Il contient les déflecteurs internes et, à l'intérieur, le miroir secondaire de 0,3 m, tenu à 4,9 m en avant du miroir primaire par une structure en graphite-époxy presque insensible à la température.",
        facts:['Miroir secondaire : 0,3 m','Écart primaire–secondaire : 4,9 m'] },
      { key:'ssm', name:"Section d'équipements", explode:[0,0,0,0],
        desc:"L'anneau de baies qui ceinture le télescope. On y trouve les ordinateurs de bord, les batteries, les roues de réaction qui orientent le satellite et les équipements de communication. Les portes s'ouvrent pour que les astronautes puissent remplacer les boîtiers.",
        facts:['10 baies d\'équipements','4 roues de réaction','6 batteries nickel-hydrogène'] },
      { key:'aft', name:'Carénage arrière (instruments)', explode:[0,0,-1,2.6],
        desc:"La partie la plus large. Juste à l'avant se trouve le miroir primaire de 2,4 m ; derrière lui, au foyer, les instruments scientifiques : quatre logements axiaux, un logement radial occupé par WFC3 et les trois capteurs de guidage fin. Les rampes jaunes servaient aux astronautes.",
        facts:['Miroir primaire : 2,4 m, 828 kg','4 instruments axiaux + 1 radial','3 capteurs de guidage fin'] },
      { key:'array_stbd', name:'Panneau solaire (+V2)', explode:[1,0,0,3.2],
        desc:"L'une des deux ailes solaires rigides à l'arséniure de gallium, posées en 2002. Plus petites que les panneaux souples d'origine, elles produisent pourtant davantage et vibrent moins au passage jour/nuit.",
        facts:['7,1 × 2,6 m','Arséniure de gallium','Installé en 2002 (SM3B)'] },
      { key:'array_port', name:'Panneau solaire (−V2)', explode:[-1,0,0,3.2],
        desc:"La seconde aile solaire, identique à la première. Les deux pivotent autour de leur mât pour rester face au Soleil quelle que soit la direction visée par le télescope.",
        facts:['7,1 × 2,6 m','≈ 5 kW pour les deux ailes'] },
      { key:'hga_top', name:'Antenne grand gain', explode:[0,1,0,2.4],
        desc:"Parabole orientable au bout d'un mât. Hubble ne parle pas directement au sol : il envoie ses données vers les satellites relais TDRS en orbite géostationnaire, qui les retransmettent à White Sands (Nouveau-Mexique).",
        facts:['Parabole de 1,3 m','Bande S, via TDRS'] },
      { key:'hga_bottom', name:'Antenne grand gain (seconde)', explode:[0,-1,0,2.4],
        desc:"La seconde parabole, sur le flanc opposé. Avoir deux antennes permet de garder le contact avec un satellite relais quelle que soit l'orientation du télescope.",
        facts:['Parabole de 1,3 m','Redondance et couverture'] }
    ]
  },
  {
    id:'jwst', name:'James Webb Space Telescope', short:'JWST', year:'2021',
    agency:'NASA / ESA / ASC', launch:'Lancé le 25 décembre 2021, Ariane 5, Kourou',
    sub:'Point de Lagrange L2, infrarouge proche et moyen',
    src:'Maquette : NASA 3D Resources (domaine public)',
    file:'models/jwst.txt', bytes:5328456, axis:null, size:0,
    view:{ az:0.62, el:0.30, dist:1.35 }, sun:[0.18,-0.97,-0.16], orbit:'l2',
    hero:{ num:'6,5', unit:'m', label:'miroir primaire, 18 segments dorés' },
    cmp:{ tag:'21,2 × 14,2 m', dim:'21,2 × 14,2 m (bouclier)', mirror:6.5, mass:6200, len:21.2 },
    desc:"Conçu pour l'infrarouge, Webb doit rester très froid pour ne pas être ébloui par sa propre chaleur. Un bouclier à cinq couches, grand comme un court de tennis, coupe l'observatoire en deux : un côté chaud tourné vers le Soleil, et un côté froid à environ −233 °C où se trouvent le miroir et les instruments.",
    sourceNote:"Maquette officielle publiée par la NASA (NASA 3D Resources). Les pièces sont identifiées à partir des matériaux du fichier et de leur position ; la teinte rosée de la face inférieure du bouclier est celle du revêtement réel au silicium dopé.",
    sections:[
      { title:'Véhicule', rows:[
        ['Bouclier thermique','21,2 × 14,2 m'], ['Hauteur','≈ 8 m'], ['Masse au lancement','≈ 6 200 kg'],
        ['Durée de vie','5 ans requis ; ergols pour plus de 20 ans'] ]},
      { title:'Optique', rows:[
        ['Type','anastigmat à trois miroirs (Korsch)'], ['Miroir primaire','6,5 m · 18 segments en béryllium doré'],
        ['Surface collectrice','25,4 m²'], ['Longueur focale','131,4 m'], ['Rapport focal','f/20,2'],
        ['Domaine spectral','0,6 à 28,8 µm'] ]},
      { title:'Thermique', rows:[
        ['Côté froid','≈ 40 K (−233 °C)'], ['Détecteur de MIRI','≈ 7 K (cryo-refroidisseur)'],
        ['Côté chaud','jusqu\'à ≈ 85 °C'], ['Atténuation du bouclier','≈ 1 million (200 kW reçus, < 1 W transmis)'] ]},
      { title:'Instruments', rows:[
        ['NIRCam','caméra proche infrarouge'], ['NIRSpec','spectrographe multi-objets (ESA)'],
        ['MIRI','imageur et spectrographe moyen infrarouge'], ['NIRISS / FGS','imageur, spectro sans fente et guidage (ASC)'] ]},
      { title:'Orbite et communications', rows:[
        ['Position','halo autour de L2, à ≈ 1,5 million de km'], ['Période du halo','≈ 6 mois'],
        ['Liaison science','bande Ka, jusqu\'à 28 Mbit/s'], ['Volume','≈ 57 Go par jour (2 contacts de 4 h)'] ]}
    ],
    parts:[
      { key:'primary', name:'Miroir primaire', explode:[0,0.25,1,3.0],
        desc:"Dix-huit hexagones de béryllium, un métal léger et stable au froid, recouverts d'une couche d'or de 100 nanomètres qui réfléchit très bien l'infrarouge. Chaque segment est positionné au nanomètre près par sept actionneurs pour que l'ensemble se comporte comme un seul miroir.",
        facts:['18 segments de 1,32 m','≈ 20 kg par segment','Or : 100 nm d\'épaisseur','25,4 m² de surface collectrice'] },
      { key:'secondary', name:'Miroir secondaire et trépied', explode:[0,0.2,1,6.0],
        desc:"Un miroir convexe de 74 cm tenu devant le primaire par trois longs bras qui se sont dépliés après le lancement. Il renvoie la lumière collectée vers l'ouverture au centre du miroir primaire.",
        facts:['Miroir convexe de 0,74 m','Bras d\'environ 7,6 m'] },
      { key:'aos', name:'Optique arrière (AOS)', explode:[0,0,1,4.4],
        desc:"La tourelle noire au centre du miroir. Elle renferme le miroir tertiaire, qui corrige l'image, et le petit miroir de pointage fin qui compense plusieurs fois par seconde les minuscules mouvements de l'observatoire.",
        facts:['Miroir tertiaire fixe','Miroir de pointage fin'] },
      { key:'isim', name:"Module d'instruments (ISIM)", explode:[0,0.55,-1,3.6],
        desc:"Derrière le miroir, la structure qui porte les quatre instruments scientifiques. Elle reste à environ 40 K dans l'ombre du bouclier ; MIRI, qui observe à plus grande longueur d'onde, est refroidi à 7 K par un réfrigérateur à hélium.",
        facts:['NIRCam, NIRSpec, MIRI, NIRISS/FGS','≈ 40 K ; MIRI à ≈ 7 K'] },
      { key:'sunshield', name:'Bouclier thermique', explode:[0,0,0,0],
        desc:"Cinq feuilles de Kapton plus fines qu'un cheveu, aluminisées, séparées par du vide. Chaque couche est plus froide que la précédente et la chaleur s'échappe par les côtés. Les deux couches côté Soleil portent un revêtement de silicium dopé, d'où leur teinte rosée.",
        facts:['21,2 × 14,2 m','5 couches de Kapton E','Couche 1 : 0,05 mm ; autres : 0,025 mm'] },
      { key:'flap', name:"Volet d'équilibrage", explode:[0,0,-1,2.6],
        desc:"La pression de la lumière solaire sur le grand bouclier fait lentement tourner l'observatoire. Ce volet à l'arrière rééquilibre cette poussée, ce qui économise le carburant nécessaire pour décharger les roues de réaction.",
        facts:['Compense la pression de radiation solaire'] },
      { key:'tower', name:'Tour déployable', explode:[0,-0.4,0,1.2],
        desc:"Un mât télescopique qui a soulevé le télescope d'un peu plus d'un mètre au-dessus de la plateforme après le lancement. Cet écart laisse la place au bouclier de se déployer et isole le côté froid des équipements chauds.",
        facts:['Extension de ≈ 1,2 m'] },
      { key:'bus', name:'Plateforme de service', explode:[0,-1,0,3.0],
        desc:"Le côté chaud. Ce caisson en composite de carbone, toujours éclairé par le Soleil, contient l'ordinateur de bord, les roues de réaction, les réservoirs et moteurs, l'alimentation électrique et le compresseur du réfrigérateur de MIRI.",
        facts:['Température proche de l\'ambiante','Propulsion, pointage, calcul, énergie'] },
      { key:'solar', name:'Panneau solaire', explode:[0,-1,-0.7,4.2],
        desc:"Cinq panneaux articulés, dépliés une demi-heure après le lancement. Comme Webb reste toujours dos au Soleil, le panneau est fixe : il est éclairé en permanence.",
        facts:['5 panneaux, ≈ 6 m de long','≈ 2 kW'] },
      { key:'hga', name:'Antenne grand gain', explode:[0,-1,0.5,4.6],
        desc:"Sous la plateforme, tournée vers la Terre. La petite parabole en bande Ka envoie les données scientifiques vers le réseau Deep Space Network lors de deux contacts quotidiens ; une antenne plus petite en bande S sert aux commandes.",
        facts:['Parabole Ka de 0,6 m','Jusqu\'à 28 Mbit/s','≈ 57 Go par jour'] }
    ]
  },
  {
    id:'euclid', name:'Euclid', short:'Euclid', year:'2023',
    agency:'ESA (avec la NASA)', launch:'Lancé le 1ᵉʳ juillet 2023, Falcon 9, Cap Canaveral',
    sub:'Point de Lagrange L2, visible et proche infrarouge',
    src:'Maquette : ESA SciFleet, via Gaia Sky',
    file:'models/euclid.txt', bytes:7970528, axis:'y', size:4.7,
    view:{ az:0.75, el:0.26, dist:1.6 }, sun:[-0.44,0.12,0.89], orbit:'l2',
    hero:{ num:'1,2', unit:'m', label:'télescope à très grand champ' },
    cmp:{ tag:'4,7 m', dim:'4,7 m de haut, Ø 3,7 m', mirror:1.2, mass:2000, len:4.7 },
    desc:"Euclid cartographie un tiers du ciel pour comprendre l'énergie noire et la matière noire. Son télescope voit en une seule pose un champ plus de deux fois grand comme la pleine Lune, avec une netteté proche de celle de Hubble. Il mesure la forme et la distance de milliards de galaxies.",
    sourceNote:"Maquette de l'équipe SciFleet de l'ESA, distribuée avec Gaia Sky. Le fichier d'origine est un seul bloc : il a été redécoupé ici en six ensembles d'après leur géométrie.",
    sections:[
      { title:'Véhicule', rows:[
        ['Hauteur','4,7 m'], ['Diamètre','3,7 m'], ['Masse au lancement','≈ 2 000 kg'],
        ['Mission nominale','6 ans'], ['Maître d\'œuvre','Thales Alenia Space ; charge utile Airbus'] ]},
      { title:'Optique', rows:[
        ['Type','Korsch à trois miroirs, hors axe de champ'], ['Miroir primaire','1,2 m · carbure de silicium'],
        ['Longueur focale','24,5 m'], ['Champ commun','≈ 0,53 deg²'],
        ['Température du télescope','≈ 130 K, refroidissement passif'] ]},
      { title:'VIS (visible)', rows:[
        ['Détecteurs','36 CCD (6 × 6) · ≈ 610 Mpx'], ['Bande','550–900 nm'],
        ['Échantillonnage','0,1″ par pixel'], ['Température des CCD','≈ 150 K (−123 °C)'] ]},
      { title:'NISP (proche infrarouge)', rows:[
        ['Détecteurs','16 matrices HgCdTe H2RG'], ['Photométrie','Y, J, H (0,95–2,02 µm)'],
        ['Spectroscopie','grismes sans fente (bleu et rouge)'], ['Température des détecteurs','≈ 95 K (−180 °C)'] ]},
      { title:'Orbite et données', rows:[
        ['Position','halo autour de L2'], ['Relevé','≈ 14 000 deg² en 6 ans'],
        ['Liaison science','bande K (26 GHz), ≈ 55 Mbit/s'], ['Volume','jusqu\'à ≈ 850 Gbit par jour'] ]}
    ],
    parts:[
      { key:'sunshield', name:'Pare-soleil et panneaux solaires', explode:[-0.44,0,0.9,2.2],
        desc:"Le grand panneau tourné en permanence vers le Soleil. Il porte les cellules solaires sur sa face éclairée et garde tout le télescope dans l'ombre, condition indispensable à la stabilité thermique des images.",
        facts:['3 panneaux photovoltaïques','≈ 1,8 à 2,4 kW selon l\'orientation'] },
      { key:'baffle', name:'Télescope et baffle externe', explode:[0,1,0,2.2],
        desc:"Le cylindre couvert d'isolant qui entoure le télescope. À l'intérieur, les miroirs et leur structure sont entièrement en carbure de silicium, une céramique qui ne se déforme presque pas quand la température varie.",
        facts:['Miroir primaire de 1,2 m','Tout en carbure de silicium','≈ 130 K'] },
      { key:'instr', name:"Baie d'instruments (VIS et NISP)", explode:[0,1,0,0.9],
        desc:"Sous le télescope, le plateau qui porte les deux instruments. Une lame dichroïque partage la lumière : le visible part vers VIS, l'infrarouge traverse vers NISP. Les deux observent donc exactement le même champ en même temps. Les radiateurs évacuent la chaleur vers l'espace.",
        facts:['VIS : 36 CCD, ≈ 610 Mpx','NISP : 16 détecteurs infrarouges','Lame dichroïque de partage'] },
      { key:'svm', name:'Module de service', explode:[0,0,0,0],
        desc:"La plateforme : ordinateurs, réservoirs, électronique chaude des instruments et système de pointage. Des micro-propulseurs à azote froid tiennent la visée avec une stabilité de quelques centièmes de seconde d'arc pendant les poses.",
        facts:['Micro-propulseurs à gaz froid (azote)','Capteur de guidage fin dans le plan focal VIS'] },
      { key:'hga', name:'Antenne grand gain', explode:[0.9,-0.3,-0.44,1.8],
        desc:"La parabole orientable en bande K, qui transmet chaque jour pendant environ quatre heures les images compressées vers les stations de 35 m de l'ESA.",
        facts:['Bande K, 26 GHz','≈ 55 Mbit/s','Jusqu\'à ≈ 850 Gbit par jour'] },
      { key:'adapter', name:"Anneau d'interface lanceur", explode:[0,-1,0,1.4],
        desc:"L'anneau par lequel le satellite était fixé au sommet de la fusée Falcon 9. Il ne sert plus après la séparation.",
        facts:['Interface avec Falcon 9'] }
    ]
  },
  {
    id:'gaia', name:'Gaia', short:'Gaia', year:'2013',
    agency:'ESA', launch:'Lancé le 19 décembre 2013, Soyouz-Frégate, Kourou',
    sub:'Point de Lagrange L2 (2014–2025), astrométrie en lumière visible',
    src:'Maquette : Toni Sagristà, Gaia Sky',
    file:'models/gaia.txt', bytes:1814984, axis:'x', size:10.2,
    view:{ az:0.6, el:0.42, dist:1.35 }, sun:[0.5,-0.85,0.17], orbit:'l2',
    hero:{ num:'106', unit:'CCD', label:'un plan focal de près d\'un milliard de pixels' },
    cmp:{ tag:'Ø ≈ 10 m', dim:'Ø ≈ 10 m (pare-soleil)', mirror:1.45, mass:2030, len:10.2 },
    desc:"Gaia a mesuré la position, la distance et le mouvement de près de deux milliards d'étoiles. Le satellite tournait sur lui-même en six heures : ses deux télescopes, qui visent deux directions séparées de 106,5°, balayaient ainsi tout le ciel. Les observations ont pris fin en janvier 2025.",
    sourceNote:"Maquette créée par Toni Sagristà pour Gaia Sky, le logiciel de visualisation de la mission. Les pièces correspondent aux objets nommés du fichier d'origine.",
    sections:[
      { title:'Véhicule', rows:[
        ['Pare-soleil déployé','Ø ≈ 10 m'], ['Hauteur','≈ 3 m'], ['Masse au lancement','≈ 2 030 kg'],
        ['Fin des observations','15 janvier 2025'], ['Mise hors service','27 mars 2025 (orbite solaire)'] ]},
      { title:'Optique', rows:[
        ['Télescopes','2 anastigmats à trois miroirs'], ['Miroirs primaires','1,45 × 0,50 m chacun'],
        ['Longueur focale','35 m'], ['Angle de base','106,5°'], ['Matériau','carbure de silicium'] ]},
      { title:'Plan focal', rows:[
        ['Détecteurs','106 CCD · ≈ 938 Mpx'], ['Dimensions','≈ 1,0 × 0,4 m'],
        ['Lecture','TDI, synchronisée sur la rotation'], ['Fonctions','astrométrie, photométrie BP/RP, spectromètre RVS'] ]},
      { title:'Loi de balayage', rows:[
        ['Rotation','1 tour en 6 h (60″/s)'], ['Axe de rotation','à 45° du Soleil'],
        ['Précession','63 jours'], ['Orbite','Lissajous autour de L2'] ]},
      { title:'Catalogues', rows:[
        ['Gaia DR3 (2022)','≈ 1,8 milliard de sources'], ['Précision (étoiles brillantes)','≈ 0,02 mas'],
        ['Gaia DR4','attendu fin 2026 (5,5 ans de données)'] ]}
    ],
    parts:[
      { key:'sunshield', name:'Pare-soleil déployable', nodes:['Sunshield-top_Circle','Sunshield-bottom_Circle','GoldenSquares_Cube'], explode:[0,-1,0,0.9],
        desc:"Une jupe de douze panneaux qui s'est ouverte comme une ombrelle après le lancement. Elle garde les télescopes dans une ombre permanente, à température constante : la moindre dilatation fausserait des mesures d'angle au millionième de degré.",
        facts:['Ø ≈ 10 m','12 cadres repliables','Deux couches d\'isolant'] },
      { key:'solar', name:'Panneaux solaires', nodes:['SolarPanels_Cube'], explode:[0,-1,0,1.9],
        desc:"Les cellules sont posées sur la face ensoleillée, sous le satellite dans cette vue. Comme l'axe de Gaia garde un angle fixe de 45° avec le Soleil, l'éclairement ne varie jamais.",
        facts:['Arséniure de gallium','≈ 1,9 kW'] },
      { key:'svmbase', name:'Antenne réseau à commande de phase', nodes:['Floor_Circle','Bottom-details_Cylinder'], explode:[0,-1,0,2.9],
        desc:"Sous le satellite, face à la Terre. Une parabole orientable aurait fait vibrer Gaia : le faisceau est donc dirigé électroniquement, sans aucune pièce mobile, pendant que le satellite tourne.",
        facts:['Bande X','Aucune pièce mobile'] },
      { key:'svm', name:'Module de service', nodes:['ServiceModule-bottom_Cylinder'], explode:[0,0,0,0],
        desc:"L'anneau qui porte l'électronique, les réservoirs et une horloge atomique au rubidium pour dater chaque mesure. Des micro-propulseurs à azote froid maintiennent la rotation avec une régularité extrême.",
        facts:['Horloge atomique au rubidium','Micro-propulsion à gaz froid'] },
      { key:'tent', name:'Tente thermique', nodes:['TTS_Cylinder','TTS-inner_Cylinder','Top_Circle','Top-ceiling_Circle','GoldenBorders_Cylinder','GoldSquare_Cube'], explode:[0,1,0,2.6],
        desc:"La coque qui enveloppe la charge utile. Elle la protège des micrométéorites et du rayonnement, et ne laisse que deux ouvertures par lesquelles regardent les deux télescopes.",
        facts:['2 ouvertures de visée','Structure en composite de carbone'] },
      { key:'torus', name:'Banc optique (tore)', nodes:['Torus_Torus'], explode:[0,1,0,1.1],
        desc:"Un anneau de carbure de silicium d'environ 3 m, assemblé à partir de 17 segments brasés. Il porte les dix miroirs des deux télescopes et le plan focal, et garantit que l'angle entre les deux lignes de visée reste fixe.",
        facts:['Ø ≈ 3 m','17 segments en carbure de silicium','Porte 10 miroirs'] },
      { key:'focal', name:'Plan focal et instruments', nodes:['FocalPlane_Cube','Instr1_Cube','Instr2_Cube','InstrBG_Plane','Plane'], explode:[0,1,0,1.9],
        desc:"La plus grande caméra envoyée dans l'espace à son lancement. Les images des deux télescopes se superposent sur la même mosaïque de CCD ; les étoiles la traversent en file pendant que le satellite tourne.",
        facts:['106 CCD · ≈ 938 Mpx','≈ 1,0 × 0,4 m'] }
    ]
  }
];
