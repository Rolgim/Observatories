/* =================================================================
   INSTRUMENTS — données par observatoire.
   Caractéristiques issues des documentations officielles (manuels STScI / JDox,
   ESA Euclid & Gaia, articles d'instrument).
   example.real = valeurs réellement publiées ; sinon structure réelle du produit
   avec des valeurs d'exemple (signalé dans l'interface).
================================================================= */
var INST_DATA = (function(){

  function F(s){ var p = s.split(":"); return { n:p[0], c:parseFloat(p[1]), k:p[2]||"", note:p[3]||"", g:p[4]||"" }; }
  function R(n, lo, hi, k, note){ return { n:n, lo:lo, hi:hi, k:k||"G", note:note||"" }; }

  function mastCode(coll, inst, filt, ra, dec, rad, sub, extra){
    return "from astroquery.mast import Observations\n" +
           "from astropy.coordinates import SkyCoord\n" +
           "import astropy.units as u\n\n" +
           "pos = SkyCoord(" + ra + ", " + dec + ", unit=\"deg\")   # " + extra + "\n" +
           "obs = Observations.query_criteria(\n" +
           "    coordinates=pos, radius=" + rad + "*u.arcmin,\n" +
           "    obs_collection=\"" + coll + "\",\n" +
           "    instrument_name=\"" + inst + "\",\n" +
           (filt ? "    filters=\"" + filt + "\",\n" : "") +
           "    calib_level=3,\n" +
           ")\n" +
           "products = Observations.get_product_list(obs[:1])\n" +
           "sel = Observations.filter_products(products, productSubGroupDescription=\"" + sub + "\")\n" +
           "Observations.download_products(sel)   # écrit dans ./mastDownload/";
  }

  var HST_HEADER =
"SIMPLE  =                    T\n" +
"TELESCOP= 'HST'                / telescope used to acquire data\n" +
"INSTRUME= 'WFC3'               / identifier for instrument used\n" +
"DETECTOR= 'UVIS'               / detector in use: UVIS or IR\n" +
"FILTER  = 'F606W'              / element selected from filter wheel\n" +
"APERTURE= 'UVIS-CENTER'        / aperture name\n" +
"TARGNAME= 'NGC-4258'           / proposer's target name\n" +
"RA_TARG =       1.847396E+02   / right ascension of the target (deg)\n" +
"DEC_TARG=       4.730389E+01   / declination of the target (deg)\n" +
"PROPOSID=                12345 / PEP proposal identifier\n" +
"DATE-OBS= '2015-03-14'         / UT date of start of observation\n" +
"EXPTIME =              696.000 / exposure duration (seconds)\n" +
"[SCI]  BUNIT = 'ELECTRONS'  ·  PHOTPLAM ≈ 5888 Å  ·  PHOTFLAM ≈ 8E-20 erg/cm²/Å/e⁻";

  return {

  /* ------------------------------------------------------------ HUBBLE */
  hubble: {
    checked:'2026-11-14',
    refs:{
      wfc3:{ t:"WFC3 Instrument Handbook, 1.3 Key Features of WFC3", p:"STScI", u:"https://hst-docs.stsci.edu/wfc3ihb/chapter-1-introduction-to-wfc3/1-3-key-features-of-wfc3" },
      acs:{ t:"ACS Instrument Handbook, 3.5 ACS Quick Reference Guide", p:"STScI", u:"https://hst-docs.stsci.edu/acsihb/chapter-3-acs-capabilities-design-and-operations/3-5-acs-quick-reference-guide" },
      stis:{ t:"STIS Data Handbook, 1.1 Instrument Capabilities and Design", p:"STScI", u:"https://hst-docs.stsci.edu/stisdhb/chapter-1-stis-overview/1-1-instrument-capabilities-and-design" },
      cos:{ t:"COS Data Handbook, 1.1 Instrument Capabilities and Design", p:"STScI", u:"https://hst-docs.stsci.edu/cosdhb/chapter-1-cos-overview/1-1-instrument-capabilities-and-design" },
      primer:{ t:"HST Primer for Cycle 34, Scientific Instruments: ACS, WFC3 and FGS", p:"STScI", u:"https://hst-docs.stsci.edu/hsp/the-hubble-space-telescope-primer-for-cycle-34/hst-primer-scientific-instruments-acs-wfc3-and-fgs" }
    },
    axis: { min:0.09, max:2.0 },
    summary: "Cinq instruments scientifiques actifs, dont deux spectrographes ultraviolets et deux caméras. Les instruments sont interchangeables en orbite : la plupart ont été installés lors de missions d'entretien en navette (1993–2009).",
    archives: [
      { label:"MAST, archive Hubble", url:"https://archive.stsci.edu/hst/", desc:"Recherche, aperçus et téléchargement des observations HST ; accès par programme via astroquery.mast." },
      { label:"ESA, eHST", url:"https://hst.esac.esa.int/ehst/", desc:"Archive Hubble de l'ESA (miroir européen)." },
      { label:"Manuels d'instruments", url:"https://hst-docs.stsci.edu/", desc:"Instrument & Data Handbooks (WFC3, ACS, STIS, COS)." }
    ],
    instruments: [
      { id:"wfc3", type:"imager", name:"WFC3", full:"Wide Field Camera 3", kind:"Caméra grand champ", color:"#D4A461",
        bands:[ {l:"UVIS",lo:0.2,hi:1.0}, {l:"IR",lo:0.8,hi:1.7} ],
        fov:[ {l:"UVIS",w:162,h:162}, {l:"IR",w:136,h:123} ],
        use:"Prendre des images très nettes du ciel, de l'ultraviolet à l'infrarouge proche : galaxies lointaines, nébuleuses, étoiles des amas. C'est aujourd'hui l'appareil photo le plus utilisé de Hubble.",

        summary:"Caméra de quatrième génération installée en 2009 (SM4). Deux canaux indépendants, dont un seul est utilisable à la fois, couvrent de l'ultraviolet proche à l'infrarouge proche.",
        specs:[
          ["Canal UVIS", "200–1000 nm · 2 CCD 2k×4k · 0,04″/px · 162″×162″", "wfc3"],
          ["Canal IR", "800–1700 nm · HgCdTe 1k×1k · 0,13″/px · 136″×123″", "wfc3"],
          ["Filtres", "62 (UVIS) · 15 (IR)", "wfc3"],
          ["Grismes", "G280 (UVIS) · G102 et G141 (IR)", "wfc3"],
          ["Bruit de lecture", "3 e⁻ (UVIS) · 12 e⁻ (IR, 16 lectures) · contre 4 e⁻ pour l'ACS/WFC", "primer"]
        ],
        filtersTitle:"Filtres (sélection représentative)",
        filters:[
          F("F225W:0.225:W::UVIS"),F("F275W:0.275:W::UVIS"),F("F336W:0.336:W::UVIS"),F("F438W:0.438:W::UVIS"),F("F555W:0.555:W::UVIS"),
          F("F606W:0.606:W::UVIS"),F("F775W:0.775:W::UVIS"),F("F814W:0.814:W::UVIS"),F("F850LP:0.850:LP:coupure à 850 nm:UVIS"),
          F("F502N:0.502:N:[O III]:UVIS"),F("F656N:0.656:N:Hα:UVIS"),
          F("F098M:0.98:M::IR"),F("F105W:1.05:W::IR"),F("F110W:1.10:W::IR"),F("F125W:1.25:W::IR"),F("F128N:1.28:N:Pa β:IR"),
          F("F140W:1.40:W::IR"),F("F153M:1.53:M::IR"),F("F160W:1.60:W::IR"),F("F164N:1.64:N:[Fe II]:IR")
        ],
        products:[
          ["_raw.fits","exposition brute, non calibrée"],
          ["_flt.fits","image calibrée (biais, dark, flat), non rééchantillonnée ; extensions SCI / ERR / DQ"],
          ["_flc.fits","comme _flt, avec correction de CTE (UVIS)"],
          ["_drz / _drc.fits","produits combinés rééchantillonnés par AstroDrizzle (_drc : CTE corrigée)"],
          ["Nommage","IPPPSSOOT : « i » = WFC3, puis programme, visite, observation"]
        ],
        example:{ real:false, title:"En-tête FITS d'un produit _flt (extrait)", caption:"Mots-clés réels du format ; les valeurs sont un exemple.", text:HST_HEADER },
        code:{ title:"Récupérer des images WFC3/UVIS (astroquery.mast)", text:mastCode("HST","WFC3/UVIS","F606W","189.6","-5.9",2,"FLC","exemple : champ quelconque") },
        notes:[
          "UVIS : les pertes de transfert de charge (CTE) augmentent avec le temps. Préférer les produits _flc / _drc.",
          "IR : persistance d'image après exposition à des sources brillantes ; la lecture est « up-the-ramp » (plusieurs lectures par pose).",
          "Un miroir de sélection de canal envoie la lumière soit vers UVIS soit vers IR : pas de pose simultanée."
        ],
        docs:[ {l:"WFC3 Instrument Handbook",u:"https://hst-docs.stsci.edu/wfc3ihb"}, {l:"WFC3 Data Handbook",u:"https://hst-docs.stsci.edu/wfc3dhb"} ] },

      { id:"acs", type:"imager", name:"ACS", full:"Advanced Camera for Surveys", kind:"Caméra de relevés", color:"#93D2DC",
        bands:[ {l:"WFC",lo:0.35,hi:1.1}, {l:"SBC",lo:0.115,hi:0.17} ],
        fov:[ {l:"WFC",w:202,h:202}, {l:"SBC",w:34.6,h:30.5} ],
        use:"Photographier en lumière visible de grandes zones du ciel avec beaucoup de détails. Les célèbres champs profonds de Hubble et les cartes de matière noire des amas de galaxies doivent beaucoup à cette caméra.",

        summary:"Installée en 2002 (SM3B). Son canal grand champ WFC a servi aux grands relevés (champs profonds, amas de galaxies). Une panne électronique en janvier 2007 a mis hors service WFC et HRC ; le WFC a été réparé en 2009, pas le HRC.",
        specs:[
          ["WFC", "350–1100 nm · 2 CCD 2048×4096 · pixels de 15 µm · 0,05″/px · 202″×202″", "acs"],
          ["SBC", "ultraviolet lointain « solar-blind » (MAMA 1024×1024) · 115–170 nm · ≈ 0,034″×0,030″/px · 34,6″×30,5″", "acs"],
          ["HRC", "29″×26″ · hors service depuis janvier 2007", "acs"]
        ],
        filtersTitle:"Filtres WFC / SBC (sélection)",
        filters:[
          F("F435W:0.435:W::WFC"),F("F475W:0.475:W::WFC"),F("F555W:0.555:W::WFC"),F("F606W:0.606:W::WFC"),F("F625W:0.625:W::WFC"),
          F("F775W:0.775:W::WFC"),F("F814W:0.814:W::WFC"),F("F850LP:0.850:LP:coupure à 850 nm:WFC"),F("F658N:0.658:N:Hα + [N II]:WFC"),
          F("F115LP:0.115:LP:coupure à 115 nm:SBC"),F("F122M:0.122:M:Lyα:SBC"),F("F140LP:0.140:LP::SBC"),F("F165LP:0.165:LP::SBC")
        ],
        products:[
          ["_flt / _flc.fits","images calibrées sans / avec correction de CTE"],
          ["_drz / _drc.fits","produits combinés AstroDrizzle"],
          ["Nommage","IPPPSSOOT : « j » = ACS"]
        ],
        example:{ real:false, title:"Structure d'un produit ACS/WFC _flc", caption:"Extensions réelles d'un fichier calibré ; chaque CCD occupe un jeu d'extensions.", text:
"HDU 0  PRIMARY       en-tête global (TELESCOP, INSTRUME='ACS', DETECTOR='WFC', FILTER1/2, EXPTIME …)\n" +
"HDU 1  SCI  (1)      CCD WFC2 · image en e⁻  (4096 × 2048)\n" +
"HDU 2  ERR  (1)      incertitude par pixel\n" +
"HDU 3  DQ   (1)      masque de qualité (bits)\n" +
"HDU 4  SCI  (2)      CCD WFC1 · image en e⁻  (4096 × 2048)\n" +
"HDU 5  ERR  (2)\n" +
"HDU 6  DQ   (2)" },
        code:{ title:"Récupérer des images ACS/WFC (astroquery.mast)", text:mastCode("HST","ACS/WFC","F814W","53.1625","-27.7914",2,"DRC","exemple : Hubble Ultra Deep Field") },
        notes:[
          "Les deux CCD du WFC sont stockés dans des extensions distinctes (SCI,1 et SCI,2).",
          "Comme pour WFC3/UVIS, les produits _flc / _drc incluent la correction de CTE."
        ],
        docs:[ {l:"ACS Instrument Handbook",u:"https://hst-docs.stsci.edu/acsihb"} ] },

      { id:"stis", type:"spectro", name:"STIS", full:"Space Telescope Imaging Spectrograph", kind:"Spectrographe imageur", color:"#8FA6E8",
        bands:[ {l:"FUV",lo:0.115,hi:0.17}, {l:"NUV",lo:0.165,hi:0.31}, {l:"CCD",lo:0.2,hi:1.03} ],
        fov:[ {l:"CCD",w:52,h:52}, {l:"MAMA",w:25,h:25} ],
        use:"Décomposer la lumière d'un objet en ses couleurs, son spectre, pour connaître sa composition, sa température et sa vitesse. Sa fente montre aussi comment ces propriétés changent le long d'un objet étendu, par exemple le gaz qui tourne autour d'un trou noir.",

        summary:"Spectrographe à longue fente (jusqu'à 52″) installé en 1997, tombé en panne en 2004 et réparé en 2009 lors de SM4. Il combine trois détecteurs : deux MAMA ultraviolets et un CCD.",
        specs:[
          ["FUV-MAMA", "115–170 nm · 0,025″/px · champ 25″×25″", "stis"],
          ["NUV-MAMA", "165–310 nm · 0,025″/px · champ 25″×25″", "stis"],
          ["CCD", "≈ 200–1030 nm · 0,05″/px · champ 52″×52″", "stis"],
          ["Résolution spectrale", "R ≈ 500–1 440 (réseaux L) · ≈ 4 900–17 400 (M) · ≈ 30 000–114 000 (échelles)", "stis"]
        ],
        filtersTitle:"Réseaux de dispersion (plages nominales)",
        filters:[
          R("G140L",0.115,0.173,"G","FUV-MAMA, basse résolution"),
          R("G230L",0.157,0.318,"G","NUV-MAMA, basse résolution"),
          R("G430L",0.29,0.57,"G","CCD, basse résolution"),
          R("G750L",0.524,1.027,"G","CCD, basse résolution"),
          R("E140M",0.114,0.171,"G","échelle FUV, R ≈ 45 800")
        ],
        products:[
          ["_raw / _flt.fits","poses brutes et calibrées"],
          ["_x1d.fits","spectre 1D extrait (table binaire)"],
          ["_x2d.fits","spectre 2D rectifié (longueur d'onde × position sur la fente)"],
          ["_crj.fits","combinaison de poses CCD avec rejet des rayons cosmiques"]
        ],
        example:{ real:false, title:"Colonnes de la table _x1d (une ligne par ordre spectral)", caption:"Schéma réel des produits STIS ; chaque cellule contient un tableau de NELEM points.", text:
"SPORDER     ordre spectral\n" +
"NELEM       nombre de points du spectre\n" +
"WAVELENGTH  longueur d'onde (Å)\n" +
"GROSS       taux de comptage brut (c/s)\n" +
"BACKGROUND  fond estimé (c/s)\n" +
"NET         taux net = GROSS − BACKGROUND\n" +
"FLUX        flux calibré (erg/s/cm²/Å)\n" +
"ERROR       incertitude sur FLUX\n" +
"DQ          drapeaux de qualité" },
        code:{ title:"Récupérer des spectres STIS (astroquery.mast)", text:
"from astroquery.mast import Observations\n\n" +
"obs = Observations.query_criteria(\n" +
"    obs_collection=\"HST\", instrument_name=\"STIS/CCD\",\n" +
"    target_name=\"HD 209458\",           # exemple : hôte d'exoplanète en transit\n" +
")\n" +
"prods = Observations.get_product_list(obs[:3])\n" +
"x1d = Observations.filter_products(prods, productSubGroupDescription=\"X1D\")\n" +
"Observations.download_products(x1d)" },
        notes:[
          "Mode TIME-TAG disponible pour les détecteurs MAMA (événement par événement).",
          "Panne de l'alimentation en août 2004 ; remise en service lors de la mission SM4 (2009)."
        ],
        docs:[ {l:"STIS Instrument Handbook",u:"https://hst-docs.stsci.edu/stisihb"} ] },

      { id:"cos", type:"spectro", name:"COS", full:"Cosmic Origins Spectrograph", kind:"Spectrographe UV", color:"#C58FD8",
        bands:[ {l:"FUV",lo:0.09,hi:0.215}, {l:"NUV",lo:0.165,hi:0.32} ],
        fov:[ {l:"ouverture PSA (Ø 2,5″)",w:2.5,h:2.5,circle:true} ],
        use:"Recueillir le spectre ultraviolet de sources très faibles, surtout de quasars lointains. Leur lumière traverse le gaz situé entre les galaxies, qui y laisse son empreinte : COS lit ces empreintes pour analyser ce gaz invisible.",

        summary:"Spectrographe ultraviolet sans fente à très haute sensibilité, installé en 2009 (SM4) pour étudier le milieu intergalactique, les quasars et la formation des éléments chimiques.",
        specs:[
          ["Voie FUV", "≈ 90–215 nm · détecteur à galettes de microcanaux (lecture par lignes à retard croisées)", "cos"],
          ["Voie NUV", "≈ 165–320 nm · détecteur MAMA", "cos"],
          ["Ouverture", "PSA, circulaire, Ø 2,5″ (sans fente)", "cos"],
          ["Résolution", "R ≈ 1 500–4 000 (basse) · ≈ 12 000–24 000 (moyenne)", "cos"]
        ],
        filtersTitle:"Réseaux (plages nominales approximatives)",
        filters:[
          R("G140L",0.090,0.215,"G","FUV, basse résolution"),
          R("G130M",0.090,0.145,"G","FUV, moyenne résolution"),
          R("G160M",0.136,0.1775,"G","FUV, moyenne résolution"),
          R("G185M",0.170,0.210,"G","NUV, moyenne résolution"),
          R("G225M",0.210,0.250,"G","NUV, moyenne résolution"),
          R("G285M",0.250,0.320,"G","NUV, moyenne résolution"),
          R("G230L",0.165,0.320,"G","NUV, basse résolution")
        ],
        products:[
          ["_corrtag.fits","liste d'événements photon par photon (TIME-TAG) corrigée"],
          ["_x1d.fits / _x1dsum.fits","spectre 1D extrait / somme des expositions"],
          ["_flt.fits","image calibrée"]
        ],
        example:{ real:false, title:"Colonnes de la table _corrtag (une ligne par photon)", caption:"Schéma des événements TIME-TAG ; unités indicatives.", text:
"TIME        instant d'arrivée du photon (s)\n" +
"RAWX, RAWY  position brute sur le détecteur (pixels)\n" +
"XCORR, YCORR  position corrigée (distorsion géométrique)\n" +
"XDOPP       position corrigée du décalage Doppler orbital\n" +
"EPSILON     poids (efficacité / flat-field)\n" +
"WAVELENGTH  longueur d'onde assignée (Å)\n" +
"DQ          drapeaux de qualité" },
        code:{ title:"Récupérer des spectres COS (astroquery.mast)", text:
"from astroquery.mast import Observations\n\n" +
"obs = Observations.query_criteria(\n" +
"    obs_collection=\"HST\", instrument_name=\"COS/FUV\",\n" +
"    target_name=\"3C 273\",              # exemple : quasar brillant\n" +
")\n" +
"prods = Observations.get_product_list(obs[:3])\n" +
"x1d = Observations.filter_products(prods, productSubGroupDescription=\"X1D\")\n" +
"Observations.download_products(x1d)" },
        notes:[
          "Sans fente : la résolution effective dépend de la taille angulaire de la source.",
          "Les données TIME-TAG permettent de redécouper le temps d'exposition a posteriori."
        ],
        docs:[ {l:"COS Instrument Handbook",u:"https://hst-docs.stsci.edu/cosihb"} ] },

      { id:"fgs", type:"astrometry", name:"FGS", full:"Fine Guidance Sensors", kind:"Guidage et astrométrie", color:"#8FD69A",
        bands:null,
        use:"Garder le télescope pointé sans bouger pendant les poses, en suivant des étoiles guides. Utilisé comme instrument, il mesure aussi la position des étoiles avec une grande précision.",

        summary:"Trois capteurs de guidage fin qui verrouillent le télescope sur des étoiles guides (précision ≈ 1 mas). Ils servent aussi d'instrument scientifique : astrométrie de haute précision et mesure de binaires serrées.",
        specs:[
          ["Nombre", "3 (deux pour le guidage, un utilisé pour la science : FGS1R)", "primer"],
          ["Principe", "interféromètres à prismes de Koesters"],
          ["Précision astrométrique", "≈ 1 mas (3 < V < 16,8) · parallaxes jusqu'à ≈ 0,2 mas", "primer"]
        ],
        products:[ ["Archive","données FGS (astrométrie) disponibles au MAST sous l'instrument « FGS »"] ],
        notes:["Les FGS ont fourni plusieurs parallaxes d'étoiles céphéides avant l'ère Gaia."],
        docs:[ {l:"Documentation Hubble (STScI)",u:"https://hst-docs.stsci.edu/"} ] }
    ]
  },

  /* -------------------------------------------------------------- JWST */
  jwst: {
    checked:'2026-11-14',
    refs:{
      nircam:{ t:"Near Infrared Camera (NIRCam)", p:"JWST User Documentation (JDox)", u:"https://jwst-docs.stsci.edu/jwst-near-infrared-camera" },
      msa:{ t:"NIRSpec Micro-Shutter Assembly", p:"JDox", u:"https://jwst-docs.stsci.edu/jwst-near-infrared-spectrograph/nirspec-instrumentation/nirspec-micro-shutter-assembly" },
      modes:{ t:"JWST Spectroscopic Modes", p:"STScI", u:"https://www.stsci.edu/jwst/instrumentation/spectroscopic-modes" },
      miri:{ t:"Mid-Infrared Instrument (MIRI)", p:"JDox", u:"https://jwst-docs.stsci.edu/jwst-mid-infrared-instrument" },
      niriss:{ t:"Near Infrared Imager and Slitless Spectrograph (NIRISS)", p:"JDox", u:"https://jwst-docs.stsci.edu/jwst-near-infrared-imager-and-slitless-spectrograph" },
      fgs:{ t:"JWST Fine Guidance Sensor", p:"JDox", u:"https://jwst-docs.stsci.edu/jwst-observatory-hardware/jwst-fine-guidance-sensor" }
    },
    axis: { min:0.5, max:30 },
    summary: "Quatre instruments scientifiques partagent le module ISIM, maintenu à très basse température (≈ 40 K ; ≈ 7 K pour le détecteur de MIRI), avec un capteur de guidage fin. Ensemble ils couvrent 0,6 à 28,5 µm.",
    archives: [
      { label:"MAST, archive JWST", url:"https://archive.stsci.edu/missions-and-data/jwst", desc:"Observations JWST, niveaux de calibration 1 à 3 ; accès par programme via astroquery.mast." },
      { label:"ESA, archive JWST", url:"https://jwst.esac.esa.int/archive/", desc:"Accès européen aux données JWST." },
      { label:"JDox, documentation", url:"https://jwst-docs.stsci.edu/", desc:"Documentation utilisateur de chaque instrument." },
      { label:"Pipeline de calibration", url:"https://jwst-pipeline.readthedocs.io/", desc:"Étapes de calibration et formats des produits de données." }
    ],
    instruments: [
      { id:"nircam", type:"imager", name:"NIRCam", full:"Near-Infrared Camera", kind:"Caméra proche IR", color:"#D4A461",
        bands:[ {l:"SW",lo:0.6,hi:2.3}, {l:"LW",lo:2.4,hi:5.0} ],
        fov:[ {l:"Module A",w:132,h:132,dx:-88}, {l:"Module B",w:132,h:132,dx:88} ],
        use:"Photographier le ciel dans l'infrarouge proche, là où arrive la lumière des toutes premières galaxies, étirée par l'expansion de l'Univers. C'est la caméra principale de Webb ; elle sert aussi à régler l'alignement de son miroir.",

        summary:"Caméra principale de JWST. Deux modules identiques observent le même champ dans deux plages de longueur d'onde à la fois grâce à un dichroïque. Elle sert aussi de capteur de front d'onde pour aligner les 18 segments du miroir.",
        specs:[
          ["Domaine", "0,6–5,0 µm", "nircam"],
          ["Voie courte (SW)", "0,6–2,3 µm · 0,031″/px", "nircam"],
          ["Voie longue (LW)", "2,4–5,0 µm · 0,063″/px", "nircam"],
          ["Champ", "2 modules de 2,2′×2,2′ séparés de ≈ 44″ · 9,7 arcmin² au total", "nircam"],
          ["Détecteurs", "10 matrices HgCdTe 2040×2040 px utiles (8 SW + 2 LW)", "nircam"],
          ["Autres modes", "coronographie · spectroscopie sans fente (grisme LW, R ≈ 1 600 à 4 µm) · séries temporelles", "nircam"]
        ],
        filtersTitle:"Filtres (sélection représentative)",
        filters:[
          F("F070W:0.70:W::SW"),F("F090W:0.90:W::SW"),F("F115W:1.15:W::SW"),F("F150W:1.50:W::SW"),F("F200W:2.00:W::SW"),
          F("F140M:1.40:M::SW"),F("F162M:1.62:M::SW"),F("F182M:1.82:M::SW"),F("F210M:2.10:M::SW"),
          F("F187N:1.87:N:Pa α:SW"),F("F212N:2.12:N:H₂ 2,12 µm:SW"),
          F("F277W:2.77:W::LW"),F("F322W2:3.22:W:très large:LW"),F("F356W:3.56:W::LW"),F("F444W:4.44:W::LW"),
          F("F250M:2.50:M::LW"),F("F300M:3.00:M::LW"),F("F335M:3.35:M::LW"),F("F360M:3.60:M::LW"),F("F410M:4.10:M::LW"),
          F("F430M:4.30:M::LW"),F("F460M:4.60:M::LW"),F("F480M:4.80:M::LW"),F("F405N:4.05:N:Br α:LW"),F("F470N:4.70:N:H₂ 4,7 µm:LW")
        ],
        products:[
          ["_uncal.fits","niveau 1b : rampes brutes, non calibrées"],
          ["_rate.fits","niveau 2a : taux de comptage par pixel"],
          ["_cal.fits","niveau 2b : image calibrée (astrométrie et photométrie)"],
          ["_i2d.fits","niveau 3 : mosaïque combinée et rééchantillonnée"],
          ["_cat.ecsv","niveau 3 : catalogue de sources"],
          ["Nommage","jwPPPPPOOOVVV_GGSAA_EEEEE_détecteur_suffixe"]
        ],
        example:{ real:false, title:"En-tête FITS d'un produit _cal (extrait)", caption:"Mots-clés réels des produits JWST ; les valeurs sont un exemple.", text:
"TELESCOP= 'JWST'       / Telescope used to acquire the data\n" +
"INSTRUME= 'NIRCAM'     / Instrument used to acquire the data\n" +
"DETECTOR= 'NRCA1'      / Name of detector used to acquire the data\n" +
"FILTER  = 'F200W'      / Name of the filter element used\n" +
"PUPIL   = 'CLEAR'      / Name of the pupil element used\n" +
"EXP_TYPE= 'NRC_IMAGE'  / Type of data in the exposure\n" +
"TARGPROP= 'SMACS-0723' / Proposer's name for the target\n" +
"DATE-OBS= '2022-06-07' / UTC date at start of exposure\n" +
"EFFEXPTM=      1.2E+03 / Effective exposure time (seconds)\n" +
"CAL_VER = '…'          / Calibration software version number\n" +
"CRDS_CTX= '…'          / CRDS context (reference files)\n" +
"S_REGION= 'POLYGON ICRS …'  / footprint on the sky" },
        code:{ title:"Récupérer des mosaïques NIRCam (astroquery.mast)", text:mastCode("JWST","NIRCAM/IMAGE","F200W","110.8375","-73.4540",2,"I2D","exemple : amas SMACS 0723") },
        notes:[
          "Les deux voies (SW et LW) observent le même champ en même temps : une pose produit des images dans deux filtres.",
          "Les fichiers _i2d.fits contiennent les extensions SCI, ERR, WHT et le WCS (astrométrie) du produit combiné."
        ],
        docs:[ {l:"JDox, NIRCam",u:"https://jwst-docs.stsci.edu/jwst-near-infrared-camera"} ] },

      { id:"nirspec", type:"spectro", name:"NIRSpec", full:"Near-Infrared Spectrograph", kind:"Spectrographe multi-objets", color:"#93D2DC",
        bands:[ {l:"0,6–5,3 µm",lo:0.6,hi:5.3} ],
        fov:[ {l:"MSA",w:216,h:204}, {l:"IFU",w:3,h:3} ],
        use:"Obtenir en même temps le spectre de nombreuses galaxies lointaines, pour mesurer leur distance et leur composition. De minuscules volets ne s'ouvrent que devant les objets visés.",

        summary:"Spectrographe fourni par l'ESA. Sa matrice de micro-volets (MSA) permet d'observer des centaines de galaxies à la fois. Il offre aussi une unité à champ intégral (IFU) et des fentes fixes.",
        specs:[
          ["Domaine", "0,6–5,3 µm", "modes"],
          ["Résolution", "R ≈ 100 (prisme) · ≈ 1 000 (réseaux M) · ≈ 2 700 (réseaux H)", "modes"],
          ["Multi-objets (MSA)", "4 quadrants de 365×171 volets de 0,20″×0,46″ · champ ≈ 3,6′×3,4′", "msa"],
          ["IFU", "3″×3″ découpé en 30 tranches de 0,1″", "modes"],
          ["Fentes fixes", "S200A1/A2, S400A1, S1600A1 (1,6″) et mode séries temporelles (BOTS)", "modes"]
        ],
        filtersTitle:"Dispersions (plages nominales)",
        filters:[
          R("PRISM",0.60,5.30,"G","R ≈ 100"),
          R("G140M/H + F070LP",0.70,1.27,"G","R ≈ 1 000 / 2 700"),
          R("G140M/H + F100LP",0.97,1.89,"G","R ≈ 1 000 / 2 700"),
          R("G235M/H + F170LP",1.66,3.17,"G","R ≈ 1 000 / 2 700"),
          R("G395M/H + F290LP",2.87,5.27,"G","R ≈ 1 000 / 2 700")
        ],
        products:[
          ["_cal.fits","niveau 2b : image 2D calibrée par fente ou volet"],
          ["_s2d.fits","spectres 2D rééchantillonnés"],
          ["_x1d.fits","spectres 1D extraits (table binaire)"],
          ["_s3d.fits","cube de données IFU (x, y, λ)"]
        ],
        example:{ real:false, title:"Colonnes d'un fichier _x1d (spectre 1D)", caption:"Schéma réel du produit JWST ; une ligne par pixel spectral.", text:
"WAVELENGTH      longueur d'onde (µm)\n" +
"FLUX            densité de flux (Jy)\n" +
"FLUX_ERROR      incertitude sur le flux\n" +
"FLUX_VAR_POISSON / _RNOISE / _FLAT   composantes de variance\n" +
"SURF_BRIGHT     brillance de surface (MJy/sr)\n" +
"DQ              drapeaux de qualité\n" +
"BACKGROUND      fond soustrait\n" +
"NPIXELS         nombre de pixels dans l'ouverture" },
        code:{ title:"Récupérer des spectres NIRSpec (astroquery.mast)", text:mastCode("JWST","NIRSPEC/MSA","","110.8375","-73.4540",2,"X1D","exemple : amas SMACS 0723") },
        notes:[
          "Un fichier _x1d peut contenir plusieurs sources (un spectre par volet MSA ouvert).",
          "Le mode MSA demande des catalogues préparés avec NIRCam pour choisir les sources."
        ],
        docs:[ {l:"JDox, NIRSpec",u:"https://jwst-docs.stsci.edu/jwst-near-infrared-spectrograph"} ] },

      { id:"miri", type:"specimager", name:"MIRI", full:"Mid-Infrared Instrument", kind:"Imageur et spectro moyen IR", color:"#C58FD8",
        bands:[ {l:"Imageur",lo:5.6,hi:25.5}, {l:"MRS",lo:4.9,hi:27.9} ],
        fov:[ {l:"Imageur",w:74,h:113} ],
        use:"Voir l'infrarouge moyen, émis par les objets tièdes : poussière, disques où se forment les planètes, galaxies cachées par leur propre poussière. Il doit être bien plus froid que le reste du télescope pour ne pas être aveuglé par sa propre chaleur.",

        summary:"Seul instrument opérant dans l'infrarouge moyen, refroidi à environ 7 K par un cryo-refroidisseur actif. Il observe la poussière tiède, les disques protoplanétaires et les galaxies lointaines enfouies.",
        specs:[
          ["Imageur", "5,6–25,5 µm · 9 filtres · 74″×113″ · 0,11″/px", "miri"],
          ["Spectro. moyenne résolution (MRS)", "4,9–27,9 µm · R ≈ 1 550–3 250 · 4 IFU (de 3,7″ à 7,7″ de côté)", "miri"],
          ["Spectro. basse résolution (LRS)", "≈ 5–14 µm · R ≈ 100 à 7,5 µm · fente 0,51″×4,7″", "miri"],
          ["Coronographes", "3 masques de phase à quatre quadrants (10,65, 11,4 et 15,5 µm ; 24″×24″) · 1 masque de Lyot (23 µm ; 30″×30″)", "miri"],
          ["Température", "≈ 7 K (cryo-refroidisseur)", "miri"]
        ],
        filtersTitle:"Filtres d'imagerie et coronographes",
        filters:[
          F("F560W:5.6:W::imagerie"),F("F770W:7.7:W:bande PAH 7,7 µm:imagerie"),F("F1000W:10.0:W::imagerie"),
          F("F1130W:11.3:W:bande PAH 11,3 µm:imagerie"),F("F1280W:12.8:W::imagerie"),F("F1500W:15.0:W::imagerie"),
          F("F1800W:18.0:W::imagerie"),F("F2100W:21.0:W::imagerie"),F("F2550W:25.5:W::imagerie"),
          F("F1065C:10.65:C::coronographe"),F("F1140C:11.4:C::coronographe"),F("F1550C:15.5:C::coronographe"),F("F2300C:23.0:C::coronographe")
        ],
        products:[
          ["_cal.fits","image calibrée (niveau 2b)"],
          ["_i2d.fits","mosaïque combinée (niveau 3)"],
          ["_s3d.fits","cube MRS (x, y, λ) par canal et sous-bande"],
          ["_x1d.fits","spectre 1D extrait (MRS, LRS)"]
        ],
        example:{ real:false, title:"Organisation d'un cube MRS (_s3d)", caption:"Structure réelle du produit ; dimensions indicatives.", text:
"HDU SCI       cube flux     (λ, y, x)   unités MJy/sr\n" +
"HDU ERR       incertitude   (λ, y, x)\n" +
"HDU DQ        qualité       (λ, y, x)\n" +
"HDU WMAP      carte des poids\n" +
"WCS           3 axes : RA/Dec + longueur d'onde (µm)\n" +
"canaux 1 à 4  4,9 → 28,8 µm  (chacun en 3 sous-bandes A/B/C)" },
        code:{ title:"Récupérer des images MIRI (astroquery.mast)", text:mastCode("JWST","MIRI/IMAGE","F770W","110.8375","-73.4540",2,"I2D","exemple : amas SMACS 0723") },
        notes:[
          "Aux grandes longueurs d'onde, le fond (lumière zodiacale, émission thermique) devient important : sa soustraction est une étape clé du traitement.",
          "Le cryo-refroidisseur maintient le détecteur à ≈ 7 K, bien plus froid que le reste d'ISIM (≈ 40 K)."
        ],
        docs:[ {l:"JDox, MIRI",u:"https://jwst-docs.stsci.edu/jwst-mid-infrared-instrument"} ] },

      { id:"niriss", type:"specimager", name:"NIRISS", full:"Near-Infrared Imager and Slitless Spectrograph", kind:"Imageur et spectro sans fente", color:"#8FA6E8",
        bands:[ {l:"0,6–5,0 µm",lo:0.6,hi:5.0} ],
        fov:[ {l:"Imageur",w:132,h:132} ],
        use:"Étudier l'atmosphère des exoplanètes quand elles passent devant leur étoile, chercher des galaxies lointaines dans de grands champs, et séparer des objets très proches les uns des autres grâce à un masque percé de trous.",

        summary:"Fourni par l'Agence spatiale canadienne. Spécialisé dans les spectres d'exoplanètes en transit (SOSS), la spectroscopie sans fente grand champ (WFSS) et l'interférométrie à masque d'ouverture (AMI).",
        specs:[
          ["Imagerie", "0,6–5,0 µm · 2,2′×2,2′ · 0,066″/px", "niriss"],
          ["WFSS", "0,8–2,2 µm · R ≈ 150 à 1,4 µm · champ 133″×133″", "niriss"],
          ["SOSS", "0,6–2,8 µm · R ≈ 700 à 1,4 µm (objet unique, transits)", "niriss"],
          ["AMI", "masque à 7 sous-pupilles · 2,8–4,8 µm (F277W, F380M, F430M, F480M)", "niriss"]
        ],
        filtersTitle:"Filtres d'imagerie",
        filters:[
          F("F090W:0.90:W"),F("F115W:1.15:W"),F("F140M:1.40:M"),F("F150W:1.50:W"),F("F158M:1.58:M"),F("F200W:2.00:W"),
          F("F277W:2.77:W:AMI"),F("F356W:3.56:W"),F("F380M:3.80:M:AMI"),F("F430M:4.30:M:AMI"),F("F444W:4.44:W"),F("F480M:4.80:M:AMI")
        ],
        products:[
          ["_cal.fits","images calibrées (imagerie)"],
          ["_x1d.fits","spectres 1D (SOSS, WFSS)"],
          ["_i2d.fits","mosaïques (imagerie)"]
        ],
        example:{ real:false, title:"Séries temporelles SOSS (transit d'exoplanète)", caption:"Structure typique d'une observation SOSS ; nombres indicatifs.", text:
"_calints.fits  une image calibrée par intégration  (n_int, 256, 2048)\n" +
"_x1dints.fits  un spectre 1D par intégration       (n_int, n_λ)\n" +
"ordre 1 : 0,85–2,8 µm  ·  ordre 2 : 0,6–1,4 µm\n" +
"→ courbe de lumière spectroscopique = flux(λ) en fonction du temps" },
        code:{ title:"Récupérer des données NIRISS (astroquery.mast)", text:mastCode("JWST","NIRISS/IMAGE","F200W","110.8375","-73.4540",2,"I2D","exemple : amas SMACS 0723") },
        notes:["Le mode SOSS mesure le spectre de transmission de l'atmosphère d'une exoplanète pendant son transit."],
        docs:[ {l:"JDox, NIRISS",u:"https://jwst-docs.stsci.edu/jwst-near-infrared-imager-and-slitless-spectrograph"} ] },

      { id:"fgs", type:"guider", name:"FGS", full:"Fine Guidance Sensor", kind:"Guidage fin", color:"#8FD69A",
        bands:null, fov:[ {l:"Guider",w:138,h:138} ],
        use:"Repérer des étoiles guides et indiquer au télescope comment corriger son pointage, plusieurs fois par seconde, pour que les images restent nettes.",

        summary:"Capteur de guidage fin qui verrouille l'observatoire sur des étoiles guides pour tenir le pointage à quelques millisecondes d'arc.",
        specs:[
          ["Domaine", "0,6–5,0 µm", "fgs"],
          ["Champ", "2,3′×2,3′ par voie · ≈ 0,069″/px", "fgs"],
          ["Détecteurs", "2 voies (Guider 1 et 2) · HgCdTe 2048×2048 (2040 actifs) · pixels de 18 µm", "fgs"]
        ],
        products:[ ["Archive","les données de guidage sont archivées mais ne constituent pas un produit scientifique usuel"] ],
        notes:["Il partage son boîtier avec NIRISS, mais fonctionne comme sous-système de contrôle de pointage."],
        docs:[ {l:"JDox",u:"https://jwst-docs.stsci.edu/"} ] }
    ]
  },

  /* ------------------------------------------------------------ EUCLID */
  euclid: {
    checked:'2026-11-14',
    refs:{
      e1:{ t:"Euclid Collaboration, Mellier et al. 2025, Euclid. I. Overview of the Euclid mission, A&A 697, A1", p:"arXiv", u:"https://arxiv.org/abs/2405.13491" },
      vis:{ t:"Euclid Collaboration, Cropper et al. 2025, Euclid. II. The VIS instrument, A&A 697, A2", p:"A&A", u:"https://doi.org/10.1051/0004-6361/202450996" },
      nisp:{ t:"Euclid Collaboration, Jahnke et al. 2025, Euclid. III. The NISP instrument, A&A 697, A3", p:"A&A", u:"https://doi.org/10.1051/0004-6361/202450786" }
    },
    axis: { min:0.5, max:2.2 },
    summary: "Deux instruments se partagent le même télescope de 1,2 m grâce à un dichroïque : VIS (visible) et NISP (proche infrarouge). La première partie de DR1, première grande publication, date du 12 novembre 2026 (la partie complète, avec les produits pour la cosmologie, est annoncée pour mi-2027) : environ 1 900 deg² du relevé large (14 % de la cible), observés du printemps 2024 au printemps 2025, soit plus d'un milliard d'objets. Elle s'ajoute à la « Quick Release » Q1 de mars 2025, dont sont tirés les exemples de cette page.",
    archives: [
      { label:"ESA, Euclid Science Archive", url:"https://eas.esac.esa.int/", desc:"Archive officielle : catalogues (ADQL), images, spectres." },
      { label:"Euclid DR1 (12 novembre 2026)", url:"https://www.cosmos.esa.int/web/euclid/euclid-dr1", desc:"Première grande publication : relevés large et profonds, plus d'un milliard d'objets, spectres de plus de 160 millions de sources." },
      { label:"Présentation de DR1 (arXiv:2611.16510)", url:"https://arxiv.org/abs/2611.16510", desc:"Article de présentation de la publication : contenu, couverture, qualité des données." },
      { label:"NASA/IPAC, IRSA Euclid", url:"https://irsa.ipac.caltech.edu/Missions/euclid.html", desc:"Miroir NASA : mosaïques et catalogues de Q1 et DR1, spectres, services VO (TAP, SIA)." },
      { label:"Documentation des produits (DPDD)", url:"https://euclid.esac.esa.int/dr/q1/dpdd/", desc:"Data Product Description Document de Q1." },
      { label:"astroquery.esa.euclid", url:"https://astroquery.readthedocs.io/en/latest/esa/euclid/euclid.html", desc:"Accès Python à l'archive (TAP+)." }
    ],
    instruments: [
      { id:"vis", type:"imager", name:"VIS", full:"Visible Imager", kind:"Imageur visible", color:"#D4A461",
        bands:[ {l:"IE",lo:0.53,hi:0.92} ],
        use:"Photographier des milliards de galaxies avec assez de netteté pour mesurer leur forme. Les petites déformations que ces formes ont en commun révèlent la matière noire située sur le trajet de leur lumière.",

        summary:"Caméra optimisée pour mesurer avec précision la forme des galaxies (cisaillement gravitationnel faible). Une seule bande très large, sans autre filtre que le dichroïque.",
        specs:[
          ["Bande", "IE · 530–920 nm", "e1"],
          ["Détecteurs", "36 CCD e2v CCD273-84 amincis (40 µm), disposés en 6×6", "vis"],
          ["Format", "4096×4132 px par CCD · pixels de 12 µm · 4 quadrants lus chacun par son nœud (144 voies)", "vis"],
          ["Mosaïque", "≈ 609 Mpx · échantillonnage 0,1″/px", "vis"],
          ["Champ", "≈ 0,54 deg² · zone active 0,775°×0,697°", "vis"],
          ["Température des CCD", "153 K", "vis"],
          ["Faisceau", "f/20 fourni par le télescope · pupille 1,2 m", ["vis", "e1"]]
        ],
        filtersTitle:"Bande photométrique",
        filters:[ R("IE",0.53,0.92,"B","bande large unique") ],
        products:[
          ["Images calibrées","fichiers FITS multi-extensions par exposition (niveau 2)"],
          ["Mosaïques MER","empilements par tuile du ciel, incluant des données sol"],
          ["Catalogue MER","table maîtresse de sources (VIS + NISP + sol)"],
          ["Découpes","service de cutouts dans l'archive web et dans ESA Datalabs"]
        ],
        example:{ real:true, title:"Schéma réel de la table euclid_dr1_mer_catalogue_deep_survey (extrait)", caption:"Colonnes de la table publique de DR1 pour les champs profonds, interrogeable en ADQL sur le miroir IRSA (le relevé large a sa propre table, euclid_dr1_mer_catalogue_wide_survey).", text:
"object_id            identifiant unique Euclid de la source\n" +
"ra, dec              position (degrés)\n" +
"flux_vis_2fwhm_aper  flux VIS dans une ouverture de 2 fois la largeur à mi-hauteur\n" +
"flux_h_2fwhm_aper    même mesure dans la bande H du NISP\n" +
"point_like_prob      probabilité que la source soit ponctuelle (étoile)\n" +
"ellipticity          ellipticité\n" +
"kron_radius          demi-grand axe de l'ouverture de Kron\n" +
"has_spectrum         la source a-t-elle un spectre NISP ?\n" +
"tileid               tuile du ciel d'où vient la mesure\n" +
"[≈ 480 colonnes, dont les flux des relevés au sol (DECam, MegaCam, HSC…)]" },
        code:{ title:"Interroger le catalogue MER de DR1 (astroquery, IRSA)", text:
"from astroquery.ipac.irsa import Irsa\n\n" +
"query = \"\"\"\n" +
"SELECT TOP 10 object_id, ra, dec,\n" +
"       flux_vis_2fwhm_aper, flux_h_2fwhm_aper\n" +
"FROM euclid_dr1_mer_catalogue_deep_survey\n" +
"WHERE 1=CONTAINS(POINT('ICRS', ra, dec),\n" +
"                 CIRCLE('ICRS', 150.12, 2.21, 0.05))\n" +
"\"\"\"\n" +
"tbl = Irsa.query_tap(query).to_table()\n" +
"print(tbl)" },
        notes:[
          "L'identifiant object_id encode la position de la source : les déclinaisons négatives donnent des identifiants négatifs.",
          "DR1 sépare le relevé large (wide) et les champs profonds (deep) en tables distinctes ; la publication rapide Q1 reste en ligne à côté."
        ],
        docs:[ {l:"Euclid Consortium, VIS",u:"https://www.euclid-ec.org/public/mission/vis/"}, {l:"Présentation de DR1",u:"https://arxiv.org/abs/2611.16510"} ] },

      { id:"nisp", type:"specimager", name:"NISP", full:"Near-Infrared Spectrometer and Photometer", kind:"Photomètre et spectro-imageur IR", color:"#93D2DC",
        bands:[ {l:"YE",lo:0.95,hi:1.21}, {l:"JE",lo:1.17,hi:1.57}, {l:"HE",lo:1.52,hi:2.02} ],
        use:"Mesurer les couleurs infrarouges et les spectres de millions de galaxies pour savoir à quelle distance elles se trouvent. Avec VIS, il permet de cartographier l'Univers en trois dimensions sur les dix derniers milliards d'années.",

        summary:"Il mesure les couleurs infrarouges (pour les décalages vers le rouge photométriques) et fournit une spectroscopie sans fente par grismes, qui donne les décalages spectroscopiques de millions de galaxies.",
        specs:[
          ["Domaine", "0,95–2,02 µm", "nisp"],
          ["Détecteurs", "16 matrices HgCdTe H2RG en 4×4 · 2040×2040 px utiles · pixels de 18 µm", "nisp"],
          ["Échantillonnage", "0,3″/px · champ 0,57 deg²", "nisp"],
          ["Photométrie", "3 filtres : YE (0,95–1,21), JE (1,17–1,57), HE (1,52–2,02 µm)", "nisp"],
          ["Spectroscopie", "grisme bleu (BG) 926–1366 nm, R > 400 · grismes rouges (RG) 1206–1892 nm, R > 480", "nisp"],
          ["Masse et puissance", "≈ 85,3 kg (instrument) + 40,7 kg (électronique chaude) · puissance plafonnée à 200 W", "nisp"],
          ["Température", "détecteurs ≈ 95 K · optique ≈ 135 K", "nisp"]
        ],
        filtersTitle:"Bandes et grismes (plages nominales)",
        filters:[
          R("YE",0.95,1.21,"B","photométrie"),
          R("JE",1.17,1.57,"B","photométrie"),
          R("HE",1.52,2.02,"B","photométrie"),
          R("BG",0.92,1.37,"G","grisme bleu"),
          R("RG",1.21,1.89,"G","grismes rouges")
        ],
        products:[
          ["Images NISP","images calibrées par exposition et mosaïques MER (Y, J, H)"],
          ["Spectres SIR","spectres 1D (DataLink / SSA) et images 2D calibrées"],
          ["Catalogue SPE","redshifts spectroscopiques, classification, raies et qualité"],
          ["Catalogue PHZ","redshifts photométriques et classification"]
        ],
        example:{ real:true, title:"Catalogues de DR1 sur le miroir IRSA (nombre de tables par produit)", caption:"Tables euclid_dr1_* interrogeables en ADQL, relevé large et champs profonds confondus.", text:
"MER  (catalogue fusionné)        6 tables   large et profonds, avec et sans photométrie détaillée\n" +
"PHZ  (redshifts photométriques)  4 tables   redshifts et classification\n" +
"SPE  (spectroscopie)             8 tables   redshifts, classification, raies, qualité\n" +
"\n" +
"Jointure : toutes les tables partagent la clé  object_id" },
        code:{ title:"Lister les tables de DR1 (astroquery, IRSA)", text:
"from astroquery.ipac.irsa import Irsa\n\n" +
"tables = Irsa.query_tap(\n" +
"    \"SELECT table_name FROM TAP_SCHEMA.tables \"\n" +
"    \"WHERE table_name LIKE 'euclid_dr1%'\").to_table()\n" +
"print(tables)    # ex. euclid_dr1_phz_photo_z_wide, …" },
        notes:[
          "Les tables de qualité spectroscopique indiquent pour chaque source le grisme utilisé (spe_grism) et le nombre de poses obtenues avec les grismes rouges et bleu.",
          "VIS et NISP reçoivent la lumière du même champ par le dichroïque et peuvent acquérir en même temps."
        ],
        docs:[ {l:"Euclid Consortium, instruments",u:"https://www.euclid-ec.org/euclid-scientific-instruments/"} ] }
    ]
  },

  /* ------------------------------------------------------------- ROMAN */
  roman: {
    checked:'2026-11-16',
    refs:{
      wfi:{ t:"Roman WFI Technical (performances, v1.4, mars 2026)", p:"NASA Goddard", u:"https://roman.gsfc.nasa.gov/science/WFI_technical.html" },
      ot:{ t:"Roman Observatory Technical Overview", p:"NASA Goddard", u:"https://roman.gsfc.nasa.gov/science/observatory_technical.html" },
      ntrs:{ t:"Nancy Grace Roman Space Telescope: Observatory Implementation and Challenges (2021)", p:"NASA NTRS", u:"https://ntrs.nasa.gov/api/citations/20210021677/downloads/NGRST%20Observatory%20Implementation%20and%20Challenges.pdf" },
      esa:{ t:"Roman factsheet", p:"ESA", u:"https://esa.int/Science_Exploration/Space_Science/Roman_factsheet" },
      stobs:{ t:"Roman, Observatory Overview", p:"STScI", u:"https://www.stsci.edu/roman/observatory" },
      data:{ t:"Roman: Delivering Data That Unlocks Discovery (newsletter, 2026)", p:"STScI", u:"https://www.stsci.edu/contents/newsletters/2026-volume-43-issue-01/roman-delivering-data-that-unlocks-discovery" }
    },
    axis: { min:0.38, max:2.4 },
    summary: "Deux instruments derrière un télescope de 2,4 m : une caméra grand champ en proche infrarouge (WFI), qui fait aussi de la spectroscopie sans fente, et un coronographe de démonstration. Roman a été lancé le 30 août 2026 ; aucune donnée scientifique n'est encore publique, les premières images étant attendues début 2027. Toutes les données seront publiques dès leur traitement.",
    archives: [
      { label:"MAST, archive de Roman", url:"https://archive.stsci.edu/missions-and-data/roman", desc:"Archive officielle des produits du télescope (images, spectres, catalogues), au STScI." },
      { label:"RomanDocs (STScI)", url:"https://roman-docs.stsci.edu/", desc:"Documentation des instruments, des relevés et des produits de données." },
      { label:"Centre de support scientifique (IPAC)", url:"https://roman.ipac.caltech.edu/", desc:"Coronographe et soutien aux relevés." }
    ],
    instruments: [
      { id:"wfi", type:"specimager", name:"WFI", full:"Wide Field Instrument", kind:"Imageur et spectro grand champ IR",
        bands:[ {l:"imagerie",lo:0.48,hi:2.3} ],
        use:"Photographier en une seule pose une portion de ciel plus grande que la pleine Lune, avec la netteté de Hubble. En répétant ces poses, Roman cartographie des milliards de galaxies pour la matière noire et l'énergie noire, et suit des millions d'étoiles du bulbe galactique pour y repérer des planètes.",
        summary:"Caméra de 300 millions de pixels : 18 détecteurs infrarouges en mosaïque de 6 × 3, huit filtres d'imagerie, un grisme et un prisme pour la spectroscopie sans fente.",
        specs:[
          ["Détecteurs", "18 HgCdTe Teledyne H4RG-10 · 4096 × 4096 px · pixels de 10 µm", "wfi"],
          ["Mosaïque", "6 × 3 détecteurs · ≈ 300 Mpx", ["ntrs","esa"]],
          ["Échantillonnage", "0,11″ par pixel", "wfi"],
          ["Champ", "0,8° × 0,4° · 0,281 deg² hors interstices", "wfi"],
          ["Domaine d'imagerie", "0,48–2,3 µm, 8 filtres", "wfi"],
          ["Grisme", "1,00–1,93 µm · R ≈ 461 × λ (µm)", "wfi"],
          ["Prisme", "0,75–1,80 µm · R de 80 à 180", "wfi"],
          ["Température des détecteurs", "89,5 K", "wfi"]
        ],
        filtersTitle:"Filtres et éléments dispersifs (centre ± demi-largeur)",
        filters:[
          R("F062",0.48,0.76,"W","0,620 µm, largeur 0,280"),
          R("F087",0.7605,0.9775,"W","0,869 µm, largeur 0,217"),
          R("F106",0.9275,1.1925,"W","1,060 µm, largeur 0,265"),
          R("F129",1.1315,1.4545,"W","1,293 µm, largeur 0,323"),
          R("F158",1.38,1.774,"W","1,577 µm, largeur 0,394"),
          R("F184",1.6835,2.0005,"W","1,842 µm, largeur 0,317"),
          R("F213",1.95,2.30,"W","2,125 µm, largeur 0,350"),
          R("F146",0.949,1.979,"W","1,464 µm, largeur 1,030 : très large, pour la microlentille"),
          R("Grisme",1.00,1.93,"G","R ≈ 461 × λ"),
          R("Prisme",0.75,1.80,"G","R de 80 à 180")
        ],
        products:[
          ["Niveau 1 (L1)","rampes du détecteur, non calibrées"],
          ["Niveau 2 (L2)","image calibrée de chaque pose"],
          ["Niveau 3 (L3)","combinaison des poses d'une même visite"],
          ["Niveau 4 (L4)","catalogues de sources par filtre"],
          ["Niveau 5 (L5)","produits contribués par la communauté"]
        ],
        example:{ real:false, title:"Niveaux de produits prévus pour le WFI", caption:"Hiérarchie annoncée par le STScI ; aucun produit scientifique n'est encore publié.", text:
"L1  rampes du détecteur (lectures successives, non calibrées)\n" +
"L2  image calibrée d'une pose      → chaîne RomanCal du STScI\n" +
"L3  combinaison d'une visite\n" +
"L4  catalogue de sources, un par filtre\n" +
"L5  produits de la communauté\n" +
"\n" +
"Distribution : MAST · analyse en ligne : Roman Research Nexus" },
        notes:[
          "Toutes les données seront publiques, sans période réservée, qu'elles viennent des grands relevés communautaires ou des programmes d'astrophysique générale.",
          "Le filtre F146, très large, sert au relevé du bulbe galactique : il capte le maximum de lumière pour suivre la luminosité de millions d'étoiles."
        ],
        docs:[ {l:"WFI, données techniques (NASA)",u:"https://roman.gsfc.nasa.gov/science/WFI_technical.html"}, {l:"RomanDocs, WFI",u:"https://roman-docs.stsci.edu/roman-instruments/the-wide-field-instrument"} ] },

      { id:"cgi", type:"coronagraph", name:"Coronographe", full:"Coronagraph Instrument (CGI)", kind:"Démonstrateur de coronographie",
        bands:[ {l:"visible",lo:0.4,hi:1.0} ],
        use:"Éteindre la lumière d'une étoile pour voir les planètes et les disques de poussière qui l'entourent. C'est un essai technologique, qui prépare un futur télescope capable de photographier des planètes semblables à la Terre.",
        summary:"Instrument de démonstration : masques coronographiques et miroirs déformables pour atténuer la lumière stellaire, avec des détecteurs à multiplication d'électrons fournis par l'ESA.",
        specs:[
          ["Statut", "démonstration technologique", "esa"],
          ["Domaine", "0,4–1,0 µm", "stobs"],
          ["Masques", "Lyot hybride et pupille façonnée", "ntrs"],
          ["Faisceau", "collimaté par le télescope, via cinq miroirs dont un orientable", "ntrs"],
          ["Détecteurs", "EMCCD (multiplication d'électrons), fournis par l'ESA", "esa"]
        ],
        notes:[
          "Les observations du coronographe sont préparées par le centre de support scientifique, que l'IPAC (Caltech) exploite avec le Laboratoire d'astrophysique de Marseille.",
          "Le centre de technologie du coronographe, au Jet Propulsion Laboratory (NASA), suit la démonstration technologique avec le centre de support."
        ],
        docs:[ {l:"Coronographe (IPAC)",u:"https://roman.ipac.caltech.edu/"} ] }
    ]
  },

  /* -------------------------------------------------------------- GAIA */
  spitzer: {
    checked:'2026-11-19',
    refs:{
      hb:{ t:"Spitzer Telescope Handbook, chapitre 3 (instruments)", p:"IRSA (Caltech/IPAC)", u:"https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview/spitzertelescopehandbook/6/" },
      w04:{ t:"Werner et al. 2004, The Spitzer Space Telescope Mission, ApJS 154, 1", p:"ApJS", u:"https://arxiv.org/abs/astro-ph/0406223" },
      mo:{ t:"Spitzer Mission Overview", p:"IRSA (Caltech/IPAC)", u:"https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview" }
    },
    axis: { min:3, max:200 },
    summary: "Trois instruments partageaient le plan focal, dans une chambre refroidie à l'hélium derrière le miroir primaire : IRAC, une caméra à quatre voies dans le proche et moyen infrarouge, IRS, un spectrographe de 5 à 38 µm, et MIPS, un photomètre pour l'infrarouge lointain, jusqu'à 160 µm. Après l'épuisement de l'hélium en 2009, seules les deux voies les plus courtes d'IRAC ont continué de fonctionner.",
    archives: [
      { label:"Spitzer Heritage Archive (IRSA)", url:"https://irsa.ipac.caltech.edu/applications/Spitzer/SHA/", desc:"Toutes les observations de la mission, données brutes et traitées, à l'IRSA (Caltech/IPAC)." },
      { label:"Spitzer Enhanced Imaging Products", url:"https://irsa.ipac.caltech.edu/data/SPITZER/Enhanced/SEIP/overview.html", desc:"Mosaïques d'IRAC et de MIPS 24 µm homogènes sur toute la mission, et le catalogue de sources qui en est tiré." },
      { label:"Documentation de Spitzer", url:"https://irsa.ipac.caltech.edu/data/SPITZER/docs/", desc:"Manuels des instruments et du télescope, à l'IRSA." }
    ],
    instruments: [
      { id:"irac", type:"imager", name:"IRAC", full:"Infrared Array Camera", kind:"Caméra proche et moyen infrarouge", color:"#2F6FDB",
        bands:[ {l:"3,6 µm",lo:3.19,hi:3.94}, {l:"4,5 µm",lo:4.00,hi:5.02}, {l:"5,8 µm",lo:4.98,hi:6.41}, {l:"8,0 µm",lo:6.45,hi:9.34} ],
        use:"Photographier des galaxies lointaines, des nuages où naissent des étoiles et des exoplanètes en transit, à travers la poussière qui arrête la lumière visible.",
        summary:"Quatre voies photographiées en même temps sur deux champs voisins : des séparatrices dichroïques envoient 3,6 et 5,8 µm vers l'un, 4,5 et 8,0 µm vers l'autre. Chaque voie a sa matrice de 256 × 256 pixels.",
        specs:[
          ["Voies", "3,6 · 4,5 · 5,8 · 8,0 µm", "hb"],
          ["Détecteurs", "InSb (3,6 et 4,5 µm) · Si:As (5,8 et 8,0 µm) · 256 × 256 px", "hb"],
          ["Pixels", "1,2″", "hb"],
          ["Champ", "5,2′ × 5,2′ par voie, deux champs voisins", "hb"],
          ["Mission chaude (2009–2020)", "3,6 et 4,5 µm seulement", "hb"]
        ],
        fov:[ {l:'3,6 et 5,8 µm', w:313, h:313, dx:-200}, {l:'4,5 et 8,0 µm', w:311, h:311, dx:200} ],
        filtersTitle:"Voies",
        filters:[ R("3,6 µm",3.19,3.94,"B","InSb"), R("4,5 µm",4.00,5.02,"B","InSb"), R("5,8 µm",4.98,6.41,"B","Si:As"), R("8,0 µm",6.45,9.34,"B","Si:As") ],
        products:[
          ["BCD (_bcd.fits)","image calibrée d'une seule pose, en MJy/sr"],
          ["PBCD (_maic.fits)","mosaïque d'une observation, assemblée par le pipeline"],
          ["SEIP","mosaïques homogènes de toute la mission et catalogue de sources (Spitzer Enhanced Imaging Products)"]
        ],
        example:{ real:false, title:"En-tête FITS d'une image BCD d'IRAC (extrait)", caption:"Mots-clés réels des produits de Spitzer ; les valeurs sont un exemple.", text:
"TELESCOP= 'Spitzer '           / SPITZER Space Telescope\n" +
"INSTRUME= 'IRAC    '           / SPITZER Space Telescope instrument ID\n" +
"CHNLNUM =                    1 / 1 digit Instrument Channel Number\n" +
"AORKEY  =             12345678 / AOR or IER key\n" +
"EXPTIME =                 10.4 / [sec] Effective integration time per pixel\n" +
"BUNIT   = 'MJy/sr  '           / Units of image data\n" +
"FLUXCONV=               0.1069 / Flux Conv. factor (MJy/sr per DN/sec)" },
        code:{ title:"Interroger l'IRSA avec astroquery", text:
"from astroquery.ipac.irsa import Irsa\n" +
"from astropy.coordinates import SkyCoord\n" +
"import astropy.units as u\n\n" +
"pos = SkyCoord.from_name(\"M51\")\n" +
"# images des Spitzer Enhanced Imaging Products (IRAC et MIPS 24 µm)\n" +
"im = Irsa.query_sia(pos=(pos, 5 * u.arcmin), collection=\"spitzer_seip\")\n" +
"# catalogue de sources tiré des mêmes mosaïques\n" +
"cat = Irsa.query_region(pos, catalog=\"slphotdr4\", spatial=\"Cone\", radius=2 * u.arcmin)" },
        notes:[ "Pendant la mission chaude, le détecteur de 3,6 µm a servi à suivre des exoplanètes en transit avec une très grande stabilité : c'est ainsi qu'il a suivi en 2016 et 2017 les planètes du système TRAPPIST-1." ],
        docs:[ {l:"Spitzer Telescope Handbook",u:"https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview/spitzertelescopehandbook/"} ] },

      { id:"irs", type:"spectro", name:"IRS", full:"Infrared Spectrograph", kind:"Spectrographe moyen infrarouge", color:"#0F987A",
        bands:[ {l:"SL",lo:5.2,hi:14.5}, {l:"LL",lo:14.0,hi:38.0}, {l:"SH",lo:9.9,hi:19.6}, {l:"LH",lo:18.7,hi:37.2} ],
        use:"Décomposer la lumière infrarouge en spectre, pour lire la composition de la poussière, des glaces et des molécules autour des étoiles jeunes et dans les galaxies.",
        summary:"Quatre modules, chacun avec sa matrice de 128 × 128 pixels : deux à basse résolution, à fente longue (SL et LL), deux à haute résolution, en échelle (SH et LH). Deux petites fenêtres d'imagerie (« peak-up ») servaient à centrer la source dans la fente.",
        specs:[
          ["Modules", "SL 5,2–14,5 µm · LL 14,0–38,0 µm (R ≈ 64–128) · SH 9,9–19,6 µm · LH 18,7–37,2 µm (R ≈ 600)", "w04"],
          ["Fentes", "SL 3,7″ × 57″ · LL 10,6″ × 168″ · SH 4,7″ × 11,3″ · LH 11,1″ × 22,3″", "hb"],
          ["Détecteurs", "128 × 128 px par module", "hb"],
          ["Imagerie de centrage", "13,3–18,7 µm et 18,5–26,0 µm, champ de 1′ × 1,2′", ["w04","hb"]],
          ["Mission chaude", "hors service", "hb"]
        ],
        fov:[ {l:'LL', w:10.6, h:168}, {l:'SL', w:3.7, h:57, dx:30} ],
        products:[
          ["BCD (_bcd.fits)","image spectrale calibrée en 2D"],
          ["_spect.tbl","spectre extrait, longueur d'onde et flux (Jy)"]
        ],
        docs:[ {l:"Spitzer Telescope Handbook",u:"https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview/spitzertelescopehandbook/"} ] },

      { id:"mips", type:"imager", name:"MIPS", full:"Multiband Imaging Photometer for Spitzer", kind:"Photomètre infrarouge lointain", color:"#9A52D6",
        bands:[ {l:"24 µm",lo:21.5,hi:26.2}, {l:"70 µm",lo:62.5,hi:81.5}, {l:"160 µm",lo:139.5,hi:174.5}, {l:"SED",lo:55,hi:95} ],
        use:"Mesurer la chaleur de la poussière froide : disques autour des étoiles, galaxies qui forment des étoiles à toute vitesse, nuages interstellaires.",
        summary:"Trois matrices : Si:As à 24 µm, germanium dopé au gallium à 70 µm et germanium contraint à 160 µm. Un petit miroir mobile balayait le ciel sur les détecteurs ; un mode spectral (SED) donnait aussi un spectre grossier de 55 à 95 µm.",
        specs:[
          ["Bandes", "24 µm (21,5–26,2) · 70 µm (62,5–81,5) · 160 µm (139,5–174,5)", "w04"],
          ["Détecteurs", "Si:As 128 × 128 · Ge:Ga 32 × 32 · Ge:Ga contraint", ["w04","hb"]],
          ["Pixels", "2,55″ · 5,2″ ou 9,98″ · 16–18″", "hb"],
          ["Champ", "5,4′ × 5,4′ · 5,2′ × 2,6′ · 0,53′ × 5,33′", "hb"],
          ["Mode SED", "55–95 µm, R ≈ 15–25", "hb"],
          ["Mission chaude", "hors service", "hb"]
        ],
        fov:[ {l:'24 µm', w:324, h:324}, {l:'70 µm', w:312, h:156, dx:330}, {l:'160 µm', w:32, h:320, dx:-200} ],
        filtersTitle:"Bandes",
        filters:[ R("24 µm",21.5,26.2,"B","Si:As"), R("70 µm",62.5,81.5,"B","Ge:Ga"), R("160 µm",139.5,174.5,"B","Ge:Ga contraint") ],
        products:[
          ["BCD (_bcd.fits)","image calibrée d'une seule pose"],
          ["PBCD (_maic.fits)","mosaïque d'une observation"],
          ["SEIP","mosaïques homogènes à 24 µm (Spitzer Enhanced Imaging Products)"]
        ],
        docs:[ {l:"Spitzer Telescope Handbook",u:"https://irsa.ipac.caltech.edu/data/SPITZER/docs/spitzermission/missionoverview/spitzertelescopehandbook/"} ] }
    ]
  },
  fermi: {
    checked:'2026-11-19',
    refs:{
      fs:{ t:"Fermi Gamma-ray Space Telescope, fiche de mission", p:"NASA Goddard", u:"https://imagine.gsfc.nasa.gov/educators/programs/fermi/multimedia/docs/fermi_fact_sheet.pdf" },
      atw:{ t:"Atwood et al. 2009, The Large Area Telescope on the Fermi Gamma-ray Space Telescope Mission, ApJ 697, 1071", p:"ApJ", u:"https://arxiv.org/abs/0902.1089" },
      meg:{ t:"Meegan et al. 2009, The Fermi Gamma-ray Burst Monitor, ApJ 702, 791", p:"ApJ", u:"https://arxiv.org/abs/0908.0450" },
      gbm:{ t:"Fermi GBM, description de l'instrument", p:"NASA Goddard", u:"https://fermi.gsfc.nasa.gov/science/instruments/gbm.html" },
      prep:{ t:"Fermi LAT, Data Preparation", p:"Fermi Science Support Center", u:"https://fermi.gsfc.nasa.gov/ssc/data/analysis/scitools/data_preparation.html" },
      dr4:{ t:"Ballet et al. 2023, Fermi Large Area Telescope Fourth Source Catalog Data Release 4 (4FGL-DR4)", p:"arXiv:2307.12546", u:"https://arxiv.org/abs/2307.12546" }
    },
    axis: { min:3e-12, max:2e-4 },
    summary: "Deux instruments qui se complètent. Le LAT détecte les rayons gamma de haute énergie, de 20 MeV à plus de 300 GeV, sur un cinquième du ciel à la fois. Le GBM couvre les énergies plus basses, de 8 keV à 40 MeV, sur tout le ciel non caché par la Terre, et repère les sursauts gamma. Comme Chandra, Fermi compte les photons un à un : ses données de base sont des listes d'événements.",
    archives: [
      { label:"LAT Data Server (FSSC)", url:"https://fermi.gsfc.nasa.gov/cgi-bin/ssc/LAT/LATDataQuery.cgi", desc:"Photons du LAT et historique de pointage, par région du ciel, période et énergie." },
      { label:"Catalogue 4FGL-DR4", url:"https://fermi.gsfc.nasa.gov/ssc/data/access/lat/14yr_catalog/", desc:"7 194 sources gamma détectées en 14 ans de LAT." },
      { label:"HEASARC, catalogues de Fermi", url:"https://heasarc.gsfc.nasa.gov/W3Browse/fermi/", desc:"Catalogues des sources et des sursauts, données du GBM." },
      { label:"Fermitools", url:"https://github.com/fermi-lat/Fermitools-conda", desc:"Logiciels d'analyse des données du LAT." }
    ],
    instruments: [
      { id:"lat", type:"imager", name:"LAT", full:"Large Area Telescope", kind:"Télescope gamma à conversion de paires",
        bands:[ {l:"LAT",lo:4.133e-12,hi:6.199e-8} ],
        use:"Cartographier le ciel gamma : pulsars, restes de supernovae, noyaux actifs de galaxies dont le jet pointe vers nous, et la lueur diffuse de la Galaxie.",
        summary:"Seize tours identiques, chacune faite d'un trajectographe au-dessus d'un calorimètre, entourées d'un bouclier de scintillateurs. Le photon se convertit en paire électron–positon dans le tungstène ; la trace de la paire donne sa direction, le calorimètre son énergie.",
        specs:[
          ["Domaine", "20 MeV à plus de 300 GeV", ["fs","atw"]],
          ["Champ", "2,4 sr à 1 GeV, ≈ 20 % du ciel", ["atw","fs"]],
          ["Trajectographe", "18 plans x–y de silicium par tour · feuilles de tungstène dans les 16 premiers", "atw"],
          ["Calorimètre", "96 cristaux de CsI(Tl) par tour en 8 couches · 8,6 longueurs de radiation", "atw"],
          ["Résolution en énergie", "≈ 4 % à 5 GeV · ≈ 2 % à 196 GeV (faisceaux d'essai)", "atw"],
          ["Datation", "± 1,5 µs (GPS)", "atw"]
        ],
        products:[
          ["Fichier de photons (_PH)","un événement par photon : énergie, direction, instant, classe"],
          ["Fichier de pointage (_SC)","historique de la direction et du temps de pose"],
          ["4FGL-DR4","catalogue de 7 194 sources, 14 ans de données"]
        ],
        example:{ real:false, title:"Colonnes d'un fichier de photons du LAT (extrait)", caption:"Structure réelle des fichiers de photons ; valeurs illustratives.", text:
"ENERGY (MeV)  RA (°)      DEC (°)   L (°)      B (°)     TIME (s)          EVENT_CLASS\n" +
"  1532.7      193.913     −5.770    305.137    57.046    2.4113051e+08     128\n" +
"   284.1      194.402     −6.120    306.182    56.712    2.4113104e+08     128\n" +
"\n" +
"→ une ligne par photon : cartes, spectres et courbes de lumière se construisent ensuite en regroupant les photons." },
        code:{ title:"Préparer des données du LAT (Fermitools)", text:
"# photons et pointage téléchargés depuis le LAT Data Server\n" +
"gtselect evfile=@events.txt outfile=sel.fits ra=193.98 dec=-5.82 rad=20 \\\n" +
"         tmin=INDEF tmax=INDEF emin=100 emax=500000 zmax=90 evclass=128 evtype=3\n" +
"gtmktime scfile=SC00.fits filter=\"(DATA_QUAL>0)&&(LAT_CONFIG==1)\" roicut=no \\\n" +
"         evfile=sel.fits outfile=gti.fits" },
        notes:["Le LAT ne vise pas : il balaie le ciel entier en deux orbites, environ trois heures. Chaque région est donc revue plusieurs fois par jour, ce qui permet de suivre les éruptions des noyaux actifs de galaxies."],
        docs:[ {l:"Atwood et al. 2009",u:"https://arxiv.org/abs/0902.1089"}, {l:"Préparation des données",u:"https://fermi.gsfc.nasa.gov/ssc/data/analysis/scitools/data_preparation.html"} ] },

      { id:"gbm", type:"burst", name:"GBM", full:"Gamma-ray Burst Monitor", kind:"Moniteur de sursauts gamma",
        bands:[ {l:"NaI",lo:1.2398e-6,hi:1.5498e-4}, {l:"BGO",lo:3.0995e-8,hi:6.199e-6} ],
        use:"Guetter les sursauts gamma, ces éclairs de quelques secondes qui viennent de la mort d'étoiles massives ou de la fusion d'étoiles à neutrons, et donner l'alerte aux autres télescopes.",
        summary:"Quatorze scintillateurs orientés dans toutes les directions : douze cristaux d'iodure de sodium (NaI) pour les basses énergies, deux de germanate de bismuth (BGO) pour les hautes. Le rapport des signaux entre détecteurs donne la direction du sursaut.",
        specs:[
          ["Détecteurs", "12 NaI (Ø 12,7 cm, 1,27 cm) · 2 BGO (Ø 12,7 cm, 12,7 cm)", ["meg","gbm"]],
          ["Domaine", "≈ 8 keV à 40 MeV : NaI jusqu'à ≈ 1 MeV, BGO au-delà", ["meg","gbm"]],
          ["Champ", "plus de 8 sr, tout le ciel non caché par la Terre", ["gbm","meg"]],
          ["Datation", "mieux que 10 µs", "gbm"],
          ["Localisation à bord", "erreur systématique < 15°", "gbm"],
          ["Sursauts", "≈ 250 déclenchements par an", "meg"]
        ],
        products:[
          ["TTE","événements datés un à un autour d'un déclenchement"],
          ["CTIME, CSPEC","comptages en continu, à haute résolution temporelle ou spectrale"],
          ["Catalogue des sursauts","durée, flux et spectre de chaque sursaut détecté"]
        ],
        code:{ title:"Catalogue des sursauts du GBM (astroquery, HEASARC)", text:
"from astroquery.heasarc import Heasarc\n\n" +
"# un sursaut par ligne : nom, position, durée T90 (s), fluence\n" +
"t = Heasarc.query_tap(\"SELECT name, ra, dec, t90, fluence FROM fermigbrst\").to_table()" },
        notes:["Le 17 août 2017, le GBM a détecté un sursaut gamma court 1,7 s après les ondes gravitationnelles de la fusion de deux étoiles à neutrons (GW170817)."],
        docs:[ {l:"Meegan et al. 2009",u:"https://arxiv.org/abs/0908.0450"}, {l:"Instrument GBM",u:"https://fermi.gsfc.nasa.gov/science/instruments/gbm.html"} ] }
    ]
  },
  swift: {
    checked:'2026-11-20',
    refs:{
      g04:{ t:"Gehrels et al. 2004, The Swift Gamma-Ray Burst Mission, ApJ 611, 1005", p:"arXiv", u:"https://arxiv.org/abs/astro-ph/0405233" },
      bar:{ t:"Barthelmy et al. 2005, The Burst Alert Telescope (BAT) on the Swift MIDEX mission, Space Sci. Rev. 120, 143", p:"arXiv", u:"https://arxiv.org/abs/astro-ph/0507410" },
      bat:{ t:"BAT Instrument Description", p:"NASA Goddard, Swift", u:"https://swift.gsfc.nasa.gov/about_swift/bat_desc.html" },
      xrt:{ t:"XRT Instrument Description", p:"NASA Goddard, Swift", u:"https://swift.gsfc.nasa.gov/about_swift/xrt_desc.html" },
      uvot:{ t:"The Swift Technical Handbook, Overview of UVOT", p:"NASA Goddard, Swift", u:"https://swift.gsfc.nasa.gov/proposals/tech_appd/swiftta_v17/node39.html" },
      poole:{ t:"Poole et al. 2008, Photometric calibration of the Swift ultraviolet/optical telescope, MNRAS 383, 627", p:"arXiv", u:"https://arxiv.org/abs/0708.2259" },
      end:{ t:"NASA's Swift Mission Ends (23 octobre 2026)", p:"NASA Science", u:"https://science.nasa.gov/missions/swift/nasas-swift-mission-ends/" }
    },
    axis: { min:3e-6, max:1.0 },
    summary: "Trois télescopes qui travaillent à la chaîne. BAT, à grand champ, détecte le sursaut gamma et le localise à quelques minutes d'arc ; le satellite pivote ; le XRT, en rayons X, et l'UVOT, en ultraviolet et visible, précisent la position et suivent la lueur rémanente. Les positions partent vers le sol en quelques secondes, pour que d'autres télescopes prennent le relais.",
    archives: [
      { label:"HEASARC, archive de Swift", url:"https://heasarc.gsfc.nasa.gov/docs/swift/archive/", desc:"Toutes les observations des trois instruments, publiques dès leur traitement." },
      { label:"UK Swift Science Data Centre", url:"https://www.swift.ac.uk/", desc:"Courbes de lumière et spectres XRT des sursauts, catalogue 2SXPS, outils en ligne." },
      { label:"MAST, images UVOT", url:"https://archive.stsci.edu/missions-and-data/swift-uvot", desc:"Images et catalogues de l'UVOT." },
      { label:"HEASoft", url:"https://heasarc.gsfc.nasa.gov/docs/software/heasoft/", desc:"Logiciels d'analyse des données de Swift (batgrbproduct, xrtpipeline, uvotsource…)." }
    ],
    instruments: [
      { id:"bat", type:"burst", name:"BAT", full:"Burst Alert Telescope", kind:"Télescope à masque codé, rayons X durs", color:"#E39B17",
        bands:[ {l:"BAT",lo:8.2656e-6,hi:8.2656e-5} ],
        use:"Détecter les sursauts gamma sur un sixième du ciel, les localiser en une vingtaine de secondes et déclencher le pivotement du satellite ; entre deux sursauts, faire le relevé du ciel en rayons X durs.",
        summary:"Pas de miroir, inutile à ces énergies : un masque de tuiles de plomb disposées au hasard, à moitié ouvert, projette son ombre sur un plan de détecteurs en tellurure de cadmium-zinc. Le décalage de l'ombre donne la direction de la source.",
        specs:[
          ["Domaine", "15 à 150 keV en imagerie · réponse jusqu'à 500 keV", "bat"],
          ["Champ", "1,4 sr à moitié codé, 100° × 60°", "bat"],
          ["Masque", "≈ 54 000 tuiles de plomb de 5 × 5 × 1 mm · 2,7 m² · 1 m au-dessus des détecteurs", "bat"],
          ["Détecteurs", "32 768 CZT de 4 × 4 × 2 mm · 5 200 cm² · 256 modules", "bat"],
          ["Localisation", "1 à 4′ en une vingtaine de secondes", "bar"],
          ["Résolution en énergie", "≈ 7 keV", "bar"]
        ],
        products:[
          ["Événements","chaque photon avec son instant, son énergie et le détecteur touché, autour d'un déclenchement"],
          ["Courbes de lumière, spectres","produits standard de chaque sursaut (batgrbproduct)"],
          ["Relevé des 157 mois","catalogue des sources du ciel en rayons X durs"]
        ],
        example:{ real:false, title:"Les grandeurs d'un sursaut dans le catalogue BAT", caption:"Colonnes typiques d'un catalogue de sursauts ; valeurs illustratives.", text:
"SURSAUT      RA (°)    DEC (°)   ERREUR (′)   T90 (s)   FLUENCE 15–150 keV (erg/cm²)\n" +
"GRB AAMMJJA  189.06    +28.98    3,0           0,07      9,5e-09\n" +
"GRB AAMMJJB  148.89    +18.15    2,1           10,3      5,9e-07\n" +
"\n" +
"→ T90 : durée pendant laquelle arrivent 90 % des photons ; le nom donne la date du sursaut (année, mois, jour)." },
        code:{ title:"Catalogue des sursauts de Swift (astroquery, HEASARC)", text:
"from astroquery.heasarc import Heasarc\n\n" +
"# un sursaut par ligne, avec la durée et la fluence mesurées par BAT\n" +
"t = Heasarc.query_tap(\"SELECT * FROM swiftgrb\").to_table()" },
        notes:["Un masque codé ne fait pas d'image directement : l'image du ciel se reconstruit par calcul, en comparant l'ombre enregistrée au motif connu du masque.",
               "BAT déclenche à bord, sans le sol : c'est ce qui permettait à Swift de pivoter en une minute environ."],
        docs:[ {l:"Barthelmy et al. 2005",u:"https://arxiv.org/abs/astro-ph/0507410"}, {l:"Description de BAT",u:"https://swift.gsfc.nasa.gov/about_swift/bat_desc.html"} ] },

      { id:"xrt", type:"specimager", name:"XRT", full:"X-Ray Telescope", kind:"Télescope X à incidence rasante, caméra CCD", color:"#C2571A",
        bands:[ {l:"XRT",lo:1.2398e-4,hi:6.199e-3} ],
        use:"Préciser à quelques secondes d'arc la position d'un sursaut et suivre, pendant des jours, le déclin de sa lueur rémanente en rayons X.",
        summary:"Des miroirs de type Wolter I, de rechange de la mission JET-X, concentrent les rayons X sur une caméra CCD refroidie vers −100 °C, 3,5 m plus loin. Chaque photon est enregistré avec sa position, son instant et son énergie.",
        specs:[
          ["Domaine", "0,2 à 10 keV", "xrt"],
          ["Optique", "Wolter I (JET-X) · focale de 3,5 m", "xrt"],
          ["Surface efficace", "110 cm² à 1,5 keV", "xrt"],
          ["Netteté", "18″ (demi-énergie) à 1,5 keV", "xrt"],
          ["Champ", "23,6′ × 23,6′", "xrt"],
          ["Détecteur", "CCD-22 de 600 × 600 px de 40 µm, 2,36″", "xrt"],
          ["Résolution en énergie", "≈ 140 eV à 6 keV au lancement", "xrt"]
        ],
        fov:[ {l:'XRT', w:1416, h:1416} ],
        products:[
          ["Listes d'événements","modes photon-counting (images) et windowed timing (sources brillantes)"],
          ["Courbes de lumière des sursauts","produites automatiquement par le centre de données britannique"],
          ["2SXPS","catalogue des sources X de tout le champ de Swift"]
        ],
        example:{ real:false, title:"Courbe de lumière XRT d'une lueur rémanente", caption:"Forme typique publiée par le centre de données ; valeurs illustratives.", text:
"T − T0 (s)    FLUX 0,3–10 keV (erg/cm²/s)\n" +
"   95         3,1e-09\n" +
" 1 000        2,4e-11\n" +
"10 000        4,0e-12\n" +
"\n" +
"→ le flux décroît en loi de puissance, avec souvent un plateau entre quelques centaines et quelques milliers de secondes." },
        code:{ title:"Traiter une observation XRT (HEASoft)", text:
"# données de niveau 1 téléchargées depuis l'archive du HEASARC\n" +
"xrtpipeline indir=00350184000 outdir=out steminputs=sw00350184000 \\\n" +
"            srcra=OBJECT srcdec=OBJECT createexpomap=yes" },
        notes:["Quand la source est très brillante, plusieurs photons tombent sur le même pixel pendant une lecture et se confondent (empilement) : on passe alors en mode windowed timing, une seule dimension mais lue très vite."],
        docs:[ {l:"Description du XRT",u:"https://swift.gsfc.nasa.gov/about_swift/xrt_desc.html"} ] },

      { id:"uvot", type:"imager", name:"UVOT", full:"Ultra-Violet/Optical Telescope", kind:"Télescope ultraviolet et visible, comptage de photons", color:"#7A4FB5",
        bands:[ {l:"UVOT",lo:0.17,hi:0.60} ],
        use:"Trouver la contrepartie visible ou ultraviolette d'un sursaut, à mieux qu'une seconde d'arc ; mesurer sa couleur, et donc estimer sa distance quand la lumière ultraviolette est absorbée en chemin.",
        summary:"Un télescope Ritchey-Chrétien de 30 cm, aligné sur le XRT. Son détecteur, une galette de microcanaux devant un CCD, compte les photons un à un ; une roue porte des filtres ultraviolets et visibles, une lame claire et deux grismes.",
        specs:[
          ["Optique", "Ritchey-Chrétien modifié · 30 cm · f/12,7", "uvot"],
          ["Domaine", "170 à 600 nm", "uvot"],
          ["Champ", "17′ × 17′", "uvot"],
          ["Détecteur", "CCD intensifié, 256 × 256 éléments, 2 048 × 2 048 px après centrage, 0,502″", "uvot"],
          ["Netteté", "≈ 2,5″ (largeur à mi-hauteur)", "uvot"],
          ["Sensibilité", "B ≈ 22,3 en lumière blanche en 1 000 s", "uvot"]
        ],
        fov:[ {l:'UVOT', w:1020, h:1020} ],
        filtersTitle:"Filtres (centre et largeur à mi-hauteur, Poole et al. 2008)",
        filters:[ R("UVW2",0.160,0.226,"B","≈ 193 nm"), R("UVM2",0.200,0.250,"B","≈ 225 nm"), R("UVW1",0.225,0.295,"B","≈ 260 nm"), R("U",0.307,0.386,"B","≈ 347 nm"), R("B",0.390,0.488,"B","≈ 439 nm"), R("V",0.508,0.585,"B","≈ 547 nm") ],
        products:[
          ["Images (sk)","images de ciel par filtre, en coordonnées célestes"],
          ["Événements","mode qui garde chaque photon et son instant, pour les premières minutes d'un sursaut"],
          ["Catalogue UVOTSSC","sources de toutes les images"]
        ],
        notes:["Comme le détecteur compte les photons un par un, une source brillante en envoie parfois plusieurs pendant une même lecture, comptés comme un seul : la photométrie corrige cette perte par coïncidence."],
        docs:[ {l:"Swift Technical Handbook, UVOT",u:"https://swift.gsfc.nasa.gov/proposals/tech_appd/swiftta_v17/node39.html"}, {l:"Poole et al. 2008",u:"https://arxiv.org/abs/0708.2259"} ] }
    ]
  },
  integral: {
    checked:'2026-11-20',
    refs:{
      isdc:{ t:"Introduction to the INTEGRAL Off-line Scientific Analysis, caractéristiques des instruments", p:"ISDC, Université de Genève", u:"https://www.isdc.unige.ch/integral/download/osa/doc/11.0/osa_um_intro/node7.html" },
      heasarc:{ t:"INTEGRAL, mission overview", p:"HEASARC (NASA)", u:"https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/integral.html" },
      fs:{ t:"INTEGRAL fact sheet", p:"ESA", u:"https://sci.esa.int/web/integral/-/47360-fact-sheet" },
      cnes:{ t:"INTEGRAL en détails", p:"CNES", u:"https://cnes.fr/projets/integral/en-details" }
    },
    axis: { min:1e-7, max:1.0 },
    summary: "Quatre instruments alignés sur la même direction. SPI, le spectromètre, et IBIS, l'imageur, couvrent les rayons gamma de 15 keV à 10 MeV ; les deux JEM-X voient les rayons X de 3 à 35 keV et la caméra OMC la lumière visible. Les trois instruments de haute énergie forment leur image avec un masque codé.",
    archives: [
      { label:"INTEGRAL Science Data Centre (ISDC)", url:"https://www.isdc.unige.ch/integral/", desc:"Centre des données, à Genève : archive, logiciel d'analyse OSA, catalogues." },
      { label:"ESA, archive INTEGRAL", url:"https://www.cosmos.esa.int/web/integral", desc:"Archive de l'ESA à l'ESAC." },
      { label:"HEASARC, INTEGRAL", url:"https://heasarc.gsfc.nasa.gov/docs/integral/integral.html", desc:"Copie des données et catalogues à la NASA." }
    ],
    instruments: [
      { id:"spi", type:"spectro", name:"SPI", full:"Spectrometer on INTEGRAL", kind:"Spectromètre gamma au germanium, masque codé", color:"#245C9E",
        bands:[ {l:"SPI",lo:1.5498e-7,hi:6.199e-5} ],
        use:"Mesurer très finement l'énergie des raies gamma : éléments radioactifs fabriqués par les supernovae, comme l'aluminium 26 ou le titane 44, et la raie à 511 keV de l'annihilation des positons au centre de la Galaxie.",
        summary:"19 détecteurs au germanium, refroidis à 85 K, sous un masque codé, le tout entouré d'un bouclier actif qui rejette les particules et les photons venus de côté. Sa résolution en énergie est sans égale ; son image, elle, reste grossière, à 2,5° près.",
        specs:[
          ["Domaine", "20 keV à 8 MeV", ["isdc","heasarc"]],
          ["Détecteurs", "19 cristaux de germanium à 85 K · 500 cm²", "isdc"],
          ["Champ", "16° entièrement codé", "isdc"],
          ["Résolution angulaire", "2,5° (source ponctuelle)", "isdc"],
          ["Résolution en énergie", "2,3 keV à 1,3 MeV", "isdc"],
          ["Maîtrise d'œuvre", "CNES", "cnes"]
        ],
        products:[
          ["Événements","chaque photon avec son instant, son énergie et le détecteur touché"],
          ["Spectres","obtenus par déconvolution avec la réponse du masque (logiciel OSA)"]
        ],
        notes:["Le masque de SPI ne donne qu'une image grossière : SPI est fait pour la spectroscopie, IBIS pour l'imagerie."],
        docs:[ {l:"Caractéristiques des instruments (ISDC)",u:"https://www.isdc.unige.ch/integral/download/osa/doc/11.0/osa_um_intro/node7.html"} ] },
      { id:"ibis", type:"imager", name:"IBIS", full:"Imager on Board the INTEGRAL Satellite", kind:"Imageur gamma à masque codé", color:"#3D7FC8",
        bands:[ {l:"IBIS",lo:1.2398e-7,hi:8.2656e-5} ],
        use:"Localiser et suivre les sources de rayons X durs et gamma : trous noirs et étoiles à neutrons de la Galaxie, noyaux actifs de galaxies, sursauts gamma.",
        summary:"Un masque codé au-dessus de deux plans de détecteurs : ISGRI, 16 384 cristaux de tellurure de cadmium, pour les énergies basses ; PICsIT, 4 096 cristaux d'iodure de césium, pour les hautes. Les photons qui traversent le premier et s'arrêtent dans le second donnent aussi leur direction par effet Compton.",
        specs:[
          ["Domaine", "15 keV à 10 MeV", ["isdc","heasarc"]],
          ["ISGRI", "16 384 CdTe · 2 600 cm²", "isdc"],
          ["PICsIT", "4 096 CsI · 3 100 cm²", "isdc"],
          ["Champ", "9° entièrement codé", ["isdc","heasarc"]],
          ["Résolution angulaire", "12′", "isdc"],
          ["Résolution en énergie", "9 keV à 100 keV", "isdc"]
        ],
        products:[
          ["Images en mosaïque","cartes du ciel par bande d'énergie, assemblées sur de nombreux pointés"],
          ["Catalogue des sources IBIS","sources détectées par ISGRI sur toute la mission"]
        ],
        notes:["INTEGRAL observait en « dithering » : de petits décalages successifs du pointage, qui aident à séparer les sources du fond dans l'image d'un masque codé."],
        docs:[ {l:"Caractéristiques des instruments (ISDC)",u:"https://www.isdc.unige.ch/integral/download/osa/doc/11.0/osa_um_intro/node7.html"} ] },
      { id:"jemx", type:"imager", name:"JEM-X", full:"Joint European X-ray Monitor", kind:"Deux moniteurs X à masque codé", color:"#7FB3E0",
        bands:[ {l:"JEM-X",lo:3.5424e-5,hi:4.1328e-4} ],
        use:"Voir les mêmes sources en rayons X plus mous, pour prolonger leur spectre vers les basses énergies et suivre leurs éruptions.",
        summary:"Deux unités identiques, chacune un masque codé au-dessus d'un compteur proportionnel à gaz (xénon et méthane) à micropistes.",
        specs:[
          ["Domaine", "3 à 35 keV", ["isdc","heasarc","fs"]],
          ["Détecteur", "compteur à micropistes, xénon et méthane à 1,5 bar", "isdc"],
          ["Champ", "4,8° entièrement codé", ["isdc","heasarc"]],
          ["Résolution angulaire", "3′", ["isdc","heasarc"]],
          ["Résolution en énergie", "1,2 keV à 10 keV", "isdc"]
        ],
        products:[ ["Images et spectres","par pointé, avec le logiciel OSA"] ],
        docs:[ {l:"Caractéristiques des instruments (ISDC)",u:"https://www.isdc.unige.ch/integral/download/osa/doc/11.0/osa_um_intro/node7.html"} ] },
      { id:"omc", type:"photometer", name:"OMC", full:"Optical Monitoring Camera", kind:"Caméra optique, photométrie en V", color:"#C9A100",
        bands:[ {l:"OMC",lo:0.5,hi:0.6} ],
        use:"Mesurer l'éclat visible des sources observées en gamma, au même moment : pour les étoiles variables, les novae ou les noyaux actifs de galaxies.",
        summary:"Une optique à lentilles devant un CCD, avec un filtre V.",
        specs:[
          ["Domaine", "filtre V, 500 à 600 nm", "isdc"],
          ["Champ", "5° × 5°", ["isdc","heasarc"]],
          ["Détecteur", "CCD de 2 061 × 1 056 px, zone d'image de 1 024 × 1 024 px", "isdc"]
        ],
        products:[ ["Courbes de lumière","magnitude V de chaque source suivie"] ],
        docs:[ {l:"Caractéristiques des instruments (ISDC)",u:"https://www.isdc.unige.ch/integral/download/osa/doc/11.0/osa_um_intro/node7.html"} ] }
    ]
  },
  cheops: {
    checked:'2026-11-20',
    refs:{
      benz:{ t:"Benz et al. 2021, The CHEOPS mission, Experimental Astronomy 51, 109", p:"arXiv", u:"https://arxiv.org/abs/2009.11633" },
      nut:{ t:"CHEOPS in a nutshell", p:"ESA", u:"https://www.cosmos.esa.int/web/cheops/cheops-in-a-nutshell" },
      cnes:{ t:"CHEOPS", p:"CNES", u:"https://cnes.fr/en/projects/cheops" }
    },
    axis: { min:0.3, max:1.2 },
    summary: "Un seul instrument : un télescope de 32 cm et un CCD. CHEOPS ne fait pas d'images au sens habituel : il mesure, pendant des heures, l'éclat d'une étoile déjà connue pour avoir une planète, afin d'y voir passer celle-ci et d'en déduire sa taille.",
    archives: [
      { label:"CHEOPS Archive", url:"https://cheops.unige.ch/archive_browser/", desc:"Archive de la mission, à l'Université de Genève : courbes de lumière et images." },
      { label:"CHEOPS à l'ESA", url:"https://www.cosmos.esa.int/web/cheops", desc:"Pages scientifiques de la mission, programme des observateurs invités." }
    ],
    instruments: [
      { id:"phot", type:"photometer", name:"CHEOPS", full:"CHEOPS Instrument System", kind:"Photomètre de très haute précision", color:"#3BA7C4",
        bands:[ {l:"CHEOPS",lo:0.4,hi:1.1} ],
        use:"Mesurer le rayon des planètes en mesurant la profondeur de leur transit devant des étoiles brillantes, et suivre les éclipses et les variations de phase de planètes géantes chaudes.",
        summary:"Un télescope Ritchey-Chrétien de 32 cm, dans l'axe, et un unique CCD à transfert de trame, tenu à quelques millièmes de degré près. L'image de l'étoile est volontairement défocalisée sur des centaines de pixels pour que la mesure ne dépende pas des défauts d'un pixel.",
        specs:[
          ["Optique", "Ritchey-Chrétien · primaire de 320 mm · f/8,4", "benz"],
          ["Détecteur", "CCD47-20, 1024 × 1024 px de 13 µm · 1″ par pixel", "benz"],
          ["Champ", "0,32°", "benz"],
          ["Domaine", "0,4 à 1,1 µm", "benz"],
          ["Température du CCD", "228 K, stable à 10 mK", "benz"],
          ["Précision", "15,5 ppm en 6 h (étoiles 6 ≤ V ≤ 9) · 75 ppm en 3 h (V ≤ 12)", "benz"]
        ],
        fov:[ {l:'CHEOPS', w:1152, h:1152} ],
        products:[
          ["Imagettes","petites images de 25 px de rayon autour de l'étoile, à chaque pose"],
          ["Fenêtres","images de 200 px de diamètre, additionnées à bord sur 60 s au plus"],
          ["Courbes de lumière","produites par le pipeline de l'Université de Genève"]
        ],
        notes:["CHEOPS est en orbite basse : la Terre masque régulièrement l'étoile et la lumière diffusée varie le long de l'orbite. Les courbes de lumière ont donc des trous périodiques, toutes les 98,7 minutes."],
        docs:[ {l:"Benz et al. 2021",u:"https://arxiv.org/abs/2009.11633"} ] }
    ]
  },
  herschel: {
    checked:'2026-11-20',
    refs:{
      pil:{ t:"Pilbratt et al. 2010, Herschel Space Observatory, A&A 518, L1", p:"arXiv", u:"https://arxiv.org/abs/1005.5331" },
      fs:{ t:"Herschel fact sheet", p:"ESA", u:"https://sci.esa.int/web/herschel/47356-fact-sheet" }
    },
    axis: { min:40, max:800 },
    summary: "Trois instruments au foyer du même télescope, dans le cryostat. HIFI décompose le rayonnement en un spectre d'une finesse extrême ; PACS et SPIRE sont à la fois caméras et spectromètres, PACS aux longueurs d'onde les plus courtes, SPIRE aux plus longues.",
    archives: [
      { label:"Herschel Science Archive", url:"https://archives.esac.esa.int/hsa/whsa/", desc:"Archive de l'ESA : toutes les observations, publiques." },
      { label:"IRSA, Herschel", url:"https://irsa.ipac.caltech.edu/Missions/herschel.html", desc:"Copie des données et catalogues à l'IPAC (NASA)." }
    ],
    instruments: [
      { id:"hifi", type:"spectro", name:"HIFI", full:"Heterodyne Instrument for the Far Infrared", kind:"Spectromètre hétérodyne", color:"#A33B5E",
        bands:[ {l:"HIFI",lo:157,hi:212}, {l:"HIFI",lo:240,hi:625} ],
        use:"Mesurer la vitesse et la composition du gaz froid : raies de l'eau, du monoxyde de carbone et de nombreuses molécules, dans les nuages où naissent les étoiles et dans les comètes.",
        summary:"Comme un récepteur radio : le signal du ciel est mélangé à celui d'un oscillateur local, et la différence, à plus basse fréquence, est analysée par des spectromètres. Un seul pixel sur le ciel, mais un pouvoir de résolution d'environ un million.",
        specs:[
          ["Domaine", "157 à 212 µm et 240 à 625 µm", "pil"],
          ["Pouvoir de résolution", "≈ 10⁶", "pil"],
          ["Champ", "un seul pixel sur le ciel", "pil"]
        ],
        products:[ ["Spectres","un spectre par position et par bande, pipeline HIPE"] ],
        docs:[ {l:"Pilbratt et al. 2010",u:"https://arxiv.org/abs/1005.5331"} ] },
      { id:"pacs", type:"specimager", name:"PACS", full:"Photodetector Array Camera and Spectrometer", kind:"Caméra et spectromètre à réseau", color:"#D06A86",
        bands:[ {l:"PACS",lo:55,hi:210} ],
        use:"Photographier la poussière tiède des galaxies et des régions de formation d'étoiles, et en tirer des spectres de raies du gaz.",
        summary:"Une caméra à bolomètres qui observe à la fois dans deux bandes (70 ou 100 µm, et 160 µm), et un spectromètre à intégrale de champ, de 5 × 5 pixels.",
        specs:[
          ["Photomètre", "60–85 ou 85–130 µm et 130–210 µm (bandes centrées à 70, 100 et 160 µm)", "pil"],
          ["Spectromètre", "55 à 210 µm · R ≈ 1 000 à 4 000 · champ de 47″ × 47″", "pil"]
        ],
        products:[ ["Cartes","images dans chaque bande, niveaux 2 et 2,5"], ["Cubes spectraux","spectres de chaque pixel du champ"] ],
        docs:[ {l:"Pilbratt et al. 2010",u:"https://arxiv.org/abs/1005.5331"} ] },
      { id:"spire", type:"specimager", name:"SPIRE", full:"Spectral and Photometric Imaging Receiver", kind:"Caméra et spectromètre à transformée de Fourier", color:"#7D2A47",
        bands:[ {l:"SPIRE",lo:194,hi:672} ],
        use:"Cartographier la poussière froide, à quelques dizaines de kelvins, des nuages de notre Galaxie et des galaxies lointaines où naissent beaucoup d'étoiles.",
        summary:"Un photomètre qui observe à la fois à 250, 350 et 500 µm, et un spectromètre à transformée de Fourier qui couvre tout le domaine d'un coup.",
        specs:[
          ["Photomètre", "250, 350 et 500 µm · champ de 4′ × 8′", "pil"],
          ["Spectromètre", "194–324 et 316–671 µm · R ≈ 370 à 1 300 · champ de 2,6′", "pil"]
        ],
        fov:[ {l:'SPIRE', w:480, h:240} ],
        products:[ ["Cartes","images dans les trois bandes"], ["Spectres","spectres de chaque détecteur du spectromètre"] ],
        docs:[ {l:"Pilbratt et al. 2010",u:"https://arxiv.org/abs/1005.5331"} ] }
    ]
  },
  planck: {
    checked:'2026-11-20',
    refs:{
      fs:{ t:"Planck fact sheet", p:"ESA", u:"https://sci.esa.int/web/planck/-/47365-fact-sheet" },
      p18:{ t:"Planck Collaboration 2020, Planck 2018 results. I. Overview, A&A 641, A1, tableau 4", p:"A&A", u:"https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/T4.html" },
      cool:{ t:"Planck, cooling system", p:"ESA", u:"https://sci.esa.int/web/planck/45498-cooling-system" },
      pla:{ t:"The Planck mission (Planck Legacy Archive)", p:"ESA", u:"https://wiki.cosmos.esa.int/planckpla/index.php/The_Planck_mission" }
    },
    axis: { min:200, max:20000 },
    summary: "Deux instruments au foyer du même télescope. LFI, à récepteurs radio, couvre les fréquences basses ; HFI, à bolomètres refroidis à 0,1 K, les hautes. Ensemble, neuf bandes de 30 à 857 GHz : de quoi séparer le fond diffus cosmologique des émissions de la Galaxie, qui changent avec la fréquence.",
    archives: [
      { label:"Planck Legacy Archive", url:"https://pla.esac.esa.int/", desc:"Archive de l'ESA : cartes du ciel, catalogues, produits cosmologiques." },
      { label:"IRSA, Planck", url:"https://irsa.ipac.caltech.edu/Missions/planck.html", desc:"Copie des cartes et catalogues à l'IPAC (NASA)." }
    ],
    instruments: [
      { id:"lfi", type:"imager", name:"LFI", full:"Low Frequency Instrument", kind:"Radiomètres à 20 K", color:"#5C9E3B",
        bands:[ {l:"LFI",lo:3893,hi:11103} ],
        use:"Cartographier le ciel aux fréquences basses, où dominent les émissions de la Galaxie : rayonnement des électrons dans le champ magnétique et du gaz ionisé. Indispensable pour les retirer des cartes du fond diffus.",
        summary:"22 récepteurs radio à amplificateurs, refroidis à 20 K, qui comparent le ciel à une charge de référence.",
        specs:[
          ["Fréquences", "30, 44 et 70 GHz (centres 28,4, 44,1 et 70,4 GHz)", "p18"],
          ["Détecteurs", "22 récepteurs radio à 20 K", ["fs","cool"]],
          ["Résolution", "32,3′, 27,9′ et 13,1′", "p18"]
        ],
        products:[ ["Cartes","cartes du ciel entier par fréquence, en intensité et en polarisation"] ],
        docs:[ {l:"Planck 2018 results. I",u:"https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/T4.html"} ] },
      { id:"hfi", type:"imager", name:"HFI", full:"High Frequency Instrument", kind:"Bolomètres à 0,1 K", color:"#2E6B1E",
        bands:[ {l:"HFI",lo:300,hi:3612} ],
        use:"Mesurer le fond diffus cosmologique là où il est le plus brillant, et la poussière de la Galaxie aux fréquences les plus hautes.",
        summary:"52 bolomètres, des thermomètres si sensibles qu'ils mesurent l'échauffement causé par le rayonnement absorbé, refroidis à 0,1 K par une dilution d'hélium 3 dans l'hélium 4.",
        specs:[
          ["Fréquences", "100, 143, 217, 353, 545 et 857 GHz", "p18"],
          ["Détecteurs", "52 bolomètres à 0,1 K", ["fs","cool"]],
          ["Résolution", "de 9,7′ à 100 GHz à 4,2′ à 857 GHz", "p18"],
          ["Fin du relevé", "14 janvier 2012", "pla"]
        ],
        products:[ ["Cartes","cartes du ciel entier par fréquence"], ["Carte du fond diffus","séparée des avant-plans par plusieurs méthodes"] ],
        docs:[ {l:"Planck 2018 results. I",u:"https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/T4.html"} ] }
    ]
  },
  cgro: {
    checked:'2026-11-20',
    refs:{
      ins:{ t:"CGRO, mission overview (caractéristiques des instruments)", p:"HEASARC (NASA)", u:"https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/cgro.html" },
      cossc:{ t:"Compton Gamma-Ray Observatory", p:"HEASARC (NASA)", u:"https://heasarc.gsfc.nasa.gov/docs/cgro/cgro.html" },
      wiki:{ t:"Compton Gamma Ray Observatory", p:"Wikipédia (en anglais)", u:"https://en.wikipedia.org/wiki/Compton_Gamma_Ray_Observatory" }
    },
    axis: { min:1e-10, max:1e-4 },
    summary: "Quatre instruments qui se partagent six décennies d'énergie, de 20 keV à 30 GeV. BATSE surveillait tout le ciel pour les sursauts ; OSSE, COMPTEL et EGRET observaient chacun une partie du ciel, des énergies les plus basses aux plus hautes.",
    archives: [
      { label:"HEASARC, archive de CGRO", url:"https://heasarc.gsfc.nasa.gov/docs/cgro/archive/", desc:"Données et catalogues des quatre instruments." }
    ],
    instruments: [
      { id:"batse", type:"burst", name:"BATSE", full:"Burst And Transient Source Experiment", kind:"Moniteur de sursauts sur tout le ciel", color:"#7A5230",
        bands:[ {l:"BATSE",lo:1.2398e-6,hi:6.199e-5} ],
        use:"Détecter les sursauts gamma sur tout le ciel et mesurer leur répartition : uniforme, elle a montré qu'ils viennent de très loin.",
        summary:"Huit modules aux coins du satellite, tournés vers les huit faces d'un octaèdre ; chacun porte un grand détecteur et un détecteur spectroscopique.",
        specs:[
          ["Domaine", "20 keV à 1 MeV", ["ins","cossc"]],
          ["Champ", "tout le ciel non caché par la Terre", "ins"],
          ["Surface efficace", "1 000 cm² à 30 keV, par module", "ins"],
          ["Localisation", "≈ 3° pour un sursaut intense", "ins"],
          ["Sursauts", "≈ 2 700 détectés", "wiki"]
        ],
        products:[ ["Catalogue des sursauts","durée, fluence et position de chaque sursaut"] ],
        code:{ title:"Catalogue des sursauts de BATSE (astroquery, HEASARC)", text:
"from astroquery.heasarc import Heasarc\n\n" +
"# un sursaut par ligne : position, durée T90, fluence\n" +
"t = Heasarc.query_tap(\"SELECT * FROM batsegrb\").to_table()" },
        docs:[ {l:"Caractéristiques des instruments",u:"https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/cgro.html"} ] },
      { id:"osse", type:"spectro", name:"OSSE", full:"Oriented Scintillation Spectrometer Experiment", kind:"Spectromètre à scintillation", color:"#A7703F",
        bands:[ {l:"OSSE",lo:1.2398e-7,hi:2.4797e-5} ],
        use:"Mesurer le spectre gamma de sources choisies : centre de la Galaxie, raie d'annihilation des positons, noyaux actifs de galaxies.",
        summary:"Quatre scintillateurs dans des collimateurs, qui visent une région de 3,8° × 11,4° et peuvent pivoter.",
        specs:[
          ["Domaine", "0,05 à 10 MeV", "ins"],
          ["Champ", "3,8° × 11,4° (largeur à mi-hauteur)", "ins"],
          ["Surface efficace", "2 013 cm² à 0,2 MeV", "ins"],
          ["Résolution en énergie", "12 % à 0,2 MeV · 4 % à 5 MeV", "ins"]
        ],
        products:[ ["Spectres","spectres de chaque pointé"] ],
        docs:[ {l:"Caractéristiques des instruments",u:"https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/cgro.html"} ] },
      { id:"comptel", type:"imager", name:"COMPTEL", full:"Imaging Compton Telescope", kind:"Télescope Compton", color:"#C9A100",
        bands:[ {l:"COMPTEL",lo:4.1328e-8,hi:1.5498e-6} ],
        use:"Cartographier le ciel gamma de 1 à 30 MeV, en particulier la raie de l'aluminium 26, trace des étoiles massives récentes de la Galaxie.",
        summary:"Deux étages de détecteurs : le photon diffuse sur un électron dans le premier (effet Compton) puis est absorbé dans le second. Énergies et positions mesurées dans les deux donnent un cercle de directions possibles.",
        specs:[
          ["Domaine", "0,8 à 30 MeV", "ins"],
          ["Champ", "≈ 1 sr", "ins"],
          ["Résolution angulaire", "0,5° à 1° (90 %)", "ins"],
          ["Résolution en énergie", "8,8 % à 1,27 MeV", "ins"]
        ],
        products:[ ["Cartes du ciel","par bande d'énergie et pour la raie de l'aluminium 26"] ],
        docs:[ {l:"Caractéristiques des instruments",u:"https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/cgro.html"} ] },
      { id:"egret", type:"imager", name:"EGRET", full:"Energetic Gamma Ray Experiment Telescope", kind:"Télescope gamma à chambre à étincelles", color:"#5E3A1A",
        bands:[ {l:"EGRET",lo:1.2398e-10,hi:4.1328e-8} ],
        use:"Cartographier le ciel gamma de haute énergie : pulsars, plan de la Galaxie, et noyaux actifs de galaxies dont le jet pointe vers nous.",
        summary:"Une chambre à étincelles où le photon se convertit en paire électron–positon, dont les traces donnent la direction, au-dessus d'un calorimètre qui mesure l'énergie.",
        specs:[
          ["Domaine", "30 MeV à 10 GeV", "ins"],
          ["Surface efficace", "1 200 cm² à 100 MeV", "ins"],
          ["Champ", "≈ 0,6 sr", "ins"],
          ["Résolution en énergie", "≈ 20 %", "ins"],
          ["Sources", "271 dans son premier relevé au-dessus de 100 MeV", "wiki"]
        ],
        products:[ ["Catalogue 3EG","sources détectées par EGRET"] ],
        docs:[ {l:"Caractéristiques des instruments",u:"https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/cgro.html"} ] }
    ]
  },
  wmap: {
    checked:'2026-11-20',
    refs:{
      nasa:{ t:"WMAP overview", p:"NASA Science", u:"https://science.nasa.gov/mission/wmap/wmap-overview/" },
      wiki:{ t:"Wilkinson Microwave Anisotropy Probe", p:"Wikipédia (en anglais)", u:"https://en.wikipedia.org/wiki/Wilkinson_Microwave_Anisotropy_Probe" },
      lambda:{ t:"WMAP, Data Release 5 (neuf ans)", p:"LAMBDA, NASA Goddard", u:"https://lambda.gsfc.nasa.gov/product/wmap/current/index.html" }
    },
    axis: { min:2000, max:20000 },
    summary: "Un seul instrument : deux télescopes dos à dos qui alimentent 20 cornets et autant de radiomètres différentiels, répartis en cinq bandes de 23 à 94 GHz. Chaque radiomètre mesure la différence de température entre deux points du ciel.",
    archives: [
      { label:"LAMBDA (NASA)", url:"https://lambda.gsfc.nasa.gov/product/wmap/current/index.html", desc:"Cartes du ciel, spectres de puissance et paramètres cosmologiques des neuf ans." }
    ],
    instruments: [
      { id:"rad", type:"imager", name:"Radiomètres", full:"Radiomètres différentiels de WMAP", kind:"Radiomètres différentiels, cinq bandes", color:"#C77D2E",
        bands:[ {l:"WMAP",lo:3189,hi:13034} ],
        use:"Cartographier les variations de température et la polarisation du fond diffus cosmologique sur tout le ciel, et en déduire l'âge, la composition et la géométrie de l'Univers.",
        summary:"20 cornets, 10 derrière chaque télescope, alimentent des radiomètres qui comparent en permanence les deux directions visées. Les bandes basses servent surtout à retirer l'émission de la Galaxie.",
        specs:[
          ["Bandes", "K 23 · Ka 33 · Q 41 · V 61 · W 94 GHz", "wiki"],
          ["Résolution", "52,8′ (K), 39,6′ (Ka), 30,6′ (Q), 21′ (V), 13,2′ (W)", "wiki"],
          ["Radiomètres", "2 (K), 2 (Ka), 4 (Q), 4 (V), 8 (W)", "wiki"],
          ["Sensibilité", "variations d'un millionième de degré", "nasa"]
        ],
        products:[ ["Cartes","ciel entier par bande, intensité et polarisation, neuf ans"], ["Carte ILC","combinaison des bandes qui isole le fond diffus"], ["Spectre de puissance","amplitude des variations selon leur taille angulaire"] ],
        docs:[ {l:"LAMBDA, données de WMAP",u:"https://lambda.gsfc.nasa.gov/product/wmap/current/index.html"} ] }
    ]
  },
  kepler: {
    checked:'2026-11-19',
    refs:{
      kih:{ t:"Kepler Instrument Handbook (KSCI-19033-001)", p:"NASA Ames, archive MAST", u:"https://archive.stsci.edu/kepler/manuals/KSCI-19033-001.pdf" },
      pk:{ t:"Kepler, dossier de presse du lancement (février 2009)", p:"NASA / JPL", u:"https://www.jpl.nasa.gov/news/press_kits/Kepler-presskit-2-19-smfile.pdf" }
    },
    axis: { min:0.38, max:1.0 },
    summary: "Un seul instrument : le photomètre, un télescope de Schmidt de 0,95 m dont le plan focal porte 42 CCD. Il ne faisait pas d'images au sens habituel : il mesurait l'éclat des étoiles choisies, toutes les demi-heures, pendant des années, à la recherche des transits de planètes.",
    archives: [
      { label:"MAST, archive de Kepler", url:"https://archive.stsci.edu/missions-and-data/kepler", desc:"Courbes de lumière et images de cibles, de 2009 à 2013, puis celles de K2." },
      { label:"NASA Exoplanet Archive", url:"https://exoplanetarchive.ipac.caltech.edu/", desc:"Catalogues des objets d'intérêt Kepler (KOI) et des planètes confirmées." }
    ],
    instruments: [
      { id:"phot", type:"photometer", name:"Photomètre", full:"Photomètre à grand champ", kind:"Photométrie de précision", color:"#6A8D2F",
        bands:[ {l:"Kepler",lo:0.42,hi:0.90} ],
        use:"Repérer les planètes qui passent devant leur étoile, en mesurant à quelques dizaines de millionièmes près l'éclat de plus de 100 000 étoiles, sans interruption pendant des années.",
        summary:"Le télescope de Schmidt forme une image sur un plan focal courbe de 21 modules de deux CCD ; une lentille de saphir sur chaque module ramène l'image courbe à plat. Chaque pose dure 6 s ; elles sont additionnées à bord par paquets de 29,4 min (longue cadence) ou de 58,85 s (courte cadence, pour quelques centaines de cibles).",
        specs:[
          ["Optique", "Schmidt · lame de 0,95 m · primaire de 1,4 m · f/1,47", "kih"],
          ["Champ", "115,6 deg² de pixels actifs · Ø 16,1°", "kih"],
          ["Détecteurs", "42 CCD de 1044 × 2200 px de 27 µm, en 21 modules · 4 viseurs de guidage", "kih"],
          ["Pixels", "3,98″", "kih"],
          ["Domaine", "420 à 900 nm", "kih"],
          ["Poses", "6,02 s d'exposition, 0,52 s de lecture", "kih"],
          ["Cadences", "longue : 29,4 min · courte : 58,85 s", "kih"]
        ],
        fov:[ {l:'champ', w:44200, h:44200} ],
        filtersTitle:"Bande",
        filters:[ R("Kepler",0.42,0.90,"B","bande large, sans filtre") ],
        products:[
          ["Courbe de lumière (_llc.fits)","éclat d'une étoile au cours d'un trimestre, longue cadence (pipeline SOC)"],
          ["Courbe courte cadence (_slc.fits)","la même chose à 58,85 s, pour quelques centaines de cibles"],
          ["Images de cibles (_lpd-targ.fits)","petites images autour de chaque étoile, à chaque cadence"],
          ["KOI","candidats planètes, au NASA Exoplanet Archive"]
        ],
        example:{ real:false, title:"Colonnes d'une courbe de lumière Kepler (_llc.fits)", caption:"Colonnes réelles du produit ; valeurs illustratives.", text:
"TIME (BKJD)      SAP_FLUX (e⁻/s)   PDCSAP_FLUX (e⁻/s)   PDCSAP_FLUX_ERR   SAP_QUALITY\n" +
"352.37721        81024.6           81110.2               9.3               0\n" +
"352.39765        81019.8           81106.5               9.3               0\n" +
"\n" +
"→ un trimestre ≈ 4 400 points, un toutes les 29,4 min." },
        code:{ title:"Courbe de lumière avec lightkurve", text:
"import lightkurve as lk\n\n" +
"# un trimestre de longue cadence du pipeline Kepler, téléchargé depuis MAST\n" +
"lc = lk.search_lightcurve(\"HAT-P-7\", mission=\"Kepler\", cadence=\"long\", quarter=4).download()\n" +
"lc = lc.remove_nans().normalize()\n" +
"lc.plot()" },
        notes:["Tous les trois mois, Kepler tournait de 90° pour garder ses panneaux face au Soleil : chaque étoile changeait alors de CCD, d'où le découpage des données en trimestres.",
               "Quatre viseurs de guidage, dans les coins du plan focal, sont lus dix fois par seconde pour tenir le pointage à quelques millièmes de seconde d'arc près."],
        docs:[ {l:"Kepler Instrument Handbook",u:"https://archive.stsci.edu/kepler/manuals/KSCI-19033-001.pdf"}, {l:"Dossier de presse du lancement",u:"https://www.jpl.nasa.gov/news/press_kits/Kepler-presskit-2-19-smfile.pdf"} ] }
    ]
  },
  tess: {
    checked:'2026-11-19',
    refs:{
      hto:{ t:"TESS, Telescope Information", p:"TESS Science Support Center (HEASARC)", u:"https://heasarc.gsfc.nasa.gov/docs/tess/telescope_information.html" },
      og:{ t:"TESS Observatory Guide, v1.1", p:"TESS Science Support Center", u:"https://heasarc.gsfc.nasa.gov/docs/tess/docs/TESS_observatory_guide_v1.1.pdf" },
      winn:{ t:"Winn 2024, The Transiting Exoplanet Survey Satellite", p:"arXiv:2410.12905", u:"https://arxiv.org/abs/2410.12905" }
    },
    axis: { min:0.5, max:1.1 },
    summary: "Un seul instrument, en quatre exemplaires : quatre caméras grand champ identiques, montées côte à côte pour couvrir une bande de 24° sur 96°. Elles ne font pas d'images au sens habituel mais mesurent, pendant des semaines, l'éclat de centaines de milliers d'étoiles, à la recherche des transits de planètes.",
    archives: [
      { label:"MAST, archive de TESS", url:"https://archive.stsci.edu/missions-and-data/tess", desc:"Images complètes, images de cibles et courbes de lumière, publiques sans délai." },
      { label:"ExoFOP-TESS", url:"https://exofop.ipac.caltech.edu/tess/", desc:"Candidats planètes (TOI) et observations de suivi depuis le sol." },
      { label:"TESS Science Support Center", url:"https://heasarc.gsfc.nasa.gov/docs/tess/", desc:"Documentation, outils et calendrier des secteurs." }
    ],
    instruments: [
      { id:"cams", type:"photometer", name:"Caméras", full:"Quatre caméras grand champ", kind:"Photométrie grand champ", color:"#1F7A8C",
        bands:[ {l:"TESS",lo:0.6,hi:1.0} ],
        use:"Repérer les planètes qui passent devant leur étoile, en mesurant son éclat toutes les quelques minutes pendant des semaines, pour des centaines de milliers d'étoiles proches à la fois.",
        summary:"Chaque caméra est un objectif de sept lentilles, ouvert à f/1,4, devant une mosaïque de quatre CCD. Les poses de 2 s sont additionnées à bord : images complètes du champ toutes les 30, 10 puis 3 min 20 s selon les années, et petites images de cibles choisies toutes les 2 min ou 20 s.",
        specs:[
          ["Optique", "7 lentilles · pupille de 10,5 cm · f/1,4", "hto"],
          ["Champ", "24° × 24° par caméra · 24° × 96° pour les quatre", "hto"],
          ["Détecteurs", "4 CCD CCID-80 par caméra, 2048 × 2048 px de 15 µm, écartés d'≈ 2 mm", ["hto","og"]],
          ["Pixels", "≈ 21″", "hto"],
          ["Domaine", "600 à 1 000 nm, centré sur la bande I_C", "hto"],
          ["Saturation", "étoiles plus brillantes que I_C ≈ 7,5", "hto"],
          ["Cadences", "images complètes : 1 800 s, puis 600 s, puis 200 s · cibles : 120 s ou 20 s", ["winn","hto"]]
        ],
        fov:[ {l:'caméra 1', w:86400, h:86400, dx:-129600}, {l:'caméra 2', w:86400, h:86400, dx:-43200}, {l:'caméra 3', w:86400, h:86400, dx:43200}, {l:'caméra 4', w:86400, h:86400, dx:129600} ],
        filtersTitle:"Bande",
        filters:[ R("TESS",0.6,1.0,"B","bande large, centrée sur I_C") ],
        products:[
          ["FFI (_ffic.fits)","image complète calibrée d'une caméra et d'un CCD"],
          ["TPF (_tp.fits)","petite image d'une cible à chaque instant"],
          ["Courbe de lumière (_lc.fits)","éclat d'une étoile au cours du temps (pipeline SPOC)"],
          ["TOI","candidats planètes, suivis sur ExoFOP-TESS"]
        ],
        example:{ real:false, title:"Colonnes d'une courbe de lumière SPOC (_lc.fits)", caption:"Colonnes réelles du produit ; valeurs illustratives.", text:
"TIME (BTJD)      SAP_FLUX (e⁻/s)   PDCSAP_FLUX (e⁻/s)   PDCSAP_FLUX_ERR   QUALITY\n" +
"1325.29723        24311.4           24402.9               5.1               0\n" +
"1325.29862        24305.8           24398.6               5.1               0\n" +
"\n" +
"→ PDCSAP_FLUX est corrigé des effets de l'instrument ; un transit y creuse quelques millièmes de l'éclat." },
        code:{ title:"Courbe de lumière avec lightkurve", text:
"import lightkurve as lk\n\n" +
"# courbes de lumière à 2 min du pipeline SPOC, téléchargées depuis MAST\n" +
"lc = lk.search_lightcurve(\"WASP-18\", mission=\"TESS\", author=\"SPOC\", exptime=120)[0].download()\n" +
"lc = lc.remove_nans().normalize()\n" +
"lc.plot()" },
        notes:["À chaque périgée, l'observation s'interrompt quelques heures pour transmettre les données : les courbes de lumière ont un trou tous les 13,7 jours.",
               "Les poussées qui vident les roues de réaction de leur élan laissent de petits sauts dans les courbes de lumière."],
        docs:[ {l:"TESS Telescope Information",u:"https://heasarc.gsfc.nasa.gov/docs/tess/telescope_information.html"}, {l:"Observatory Guide",u:"https://heasarc.gsfc.nasa.gov/docs/tess/docs/TESS_observatory_guide_v1.1.pdf"} ] }
    ]
  },
  xmm: {
    checked:'2026-11-19',
    refs:{
      uhb:{ t:"XMM-Newton Users Handbook, caractéristiques de base", p:"ESA (copie du HEASARC)", u:"https://heasarc.gsfc.nasa.gov/docs/xmm/uhb2.20/uhb/basics.html" },
      mir:{ t:"The Telescopes of XMM-Newton", p:"ESA, XMM-Newton Science Operations Centre", u:"https://www.cosmos.esa.int/web/xmm-newton/technical-details-mirrors" },
      fs:{ t:"XMM-Newton factsheet", p:"ESA", u:"https://www.esa.int/Science_Exploration/Space_Science/XMM-Newton/XMM-Newton_factsheet" }
    },
    axis: { min:0.0001, max:0.8 },
    summary: "Six instruments observent en même temps. Derrière chacun des trois télescopes X, une caméra EPIC : une caméra pn et deux MOS. Derrière deux d'entre eux, des réseaux renvoient une partie des rayons X vers les deux spectromètres RGS. À côté, le petit télescope OM voit le même champ en visible et en ultraviolet.",
    archives: [
      { label:"XMM-Newton Science Archive (XSA)", url:"https://nxsa.esac.esa.int/", desc:"Archive de l'ESA : observations brutes (ODF) et produits du pipeline (PPS)." },
      { label:"HEASARC, miroir de l'archive", url:"https://heasarc.gsfc.nasa.gov/docs/xmm/xmm.html", desc:"Copie des données à la NASA, avec la table des observations xmmmaster." },
      { label:"SAS", url:"https://www.cosmos.esa.int/web/xmm-newton/what-is-sas", desc:"Logiciel d'analyse des données de XMM-Newton." }
    ],
    instruments: [
      { id:"epic", type:"specimager", name:"EPIC", full:"European Photon Imaging Camera", kind:"Caméras CCD imageuses et spectrométriques", color:"#2E7FA8",
        bands:[ {l:"EPIC",lo:0.0001033,hi:0.008266} ],
        use:"Photographier le ciel en rayons X en mesurant l'énergie de chaque photon, avec une grande surface collectrice : de quoi étudier des sources faibles, des amas de galaxies ou les variations rapides d'une étoile à neutrons.",
        summary:"Trois caméras, une au foyer de chaque télescope : la caméra pn, à 12 CCD éclairés par l'arrière, et deux caméras MOS à 7 CCD, qui ne reçoivent qu'une partie de la lumière de leur télescope, le reste étant envoyé vers les RGS. Chaque photon est enregistré avec sa position, son instant et son énergie.",
        specs:[
          ["Domaine", "0,15 à 12 keV", "uhb"],
          ["Champ", "30′ de diamètre", "uhb"],
          ["Pixels", "MOS : 40 µm, 1,1″ · pn : 150 µm, 4,1″", "uhb"],
          ["Netteté (largeur à mi-hauteur / demi-énergie)", "MOS : 5″ / 14″ · pn : 6″ / 15″", "uhb"],
          ["Résolution en énergie", "≈ 70 eV (MOS) · ≈ 80 eV (pn)", "uhb"],
          ["Résolution en temps", "1,75 ms (MOS) · 0,03 ms (pn)", "uhb"]
        ],
        fov:[ {l:'EPIC', w:1800, h:1800, circle:true} ],
        filtersTitle:"Bandes d'énergie des produits du pipeline",
        filters:[ R("1",0.0024797,0.0061992,"B","0,2–0,5 keV"), R("2",0.0012398,0.0024797,"B","0,5–1 keV"), R("3",0.00061992,0.0012398,"B","1–2 keV"), R("4",0.00027552,0.00061992,"B","2–4,5 keV"), R("5",0.00010332,0.00027552,"B","4,5–12 keV") ],
        products:[
          ["ODF","données brutes de l'observation, à traiter avec SAS"],
          ["Liste d'événements (PIEVLI, MIEVLI)","chaque photon avec position, instant, énergie"],
          ["Images par bande (IMAGE_1000 à 5000)","images du pipeline dans cinq bandes d'énergie"],
          ["Liste de sources","sources détectées dans le champ, avec leurs flux"]
        ],
        example:{ real:false, title:"Une liste d'événements EPIC", caption:"Colonnes réelles d'une liste d'événements ; valeurs illustratives.", text:
"TIME (s)          X (0,05″)   Y (0,05″)   PI (eV)   PATTERN   CCDNR\n" +
"2.5912447e+08     25812       26103       1284      0         4\n" +
"2.5912447e+08     26447       24920        612      2         7\n" +
"\n" +
"→ PATTERN indique combien de pixels voisins le photon a touchés." },
        code:{ title:"Images du pipeline d'une observation (astroquery)", text:
"from astroquery.esa.xmm_newton import XMMNewton\n\n" +
"# produits du pipeline (PPS) d'une observation de Cassiopée A, depuis l'archive XSA\n" +
"XMMNewton.download_data(\"0412180101\", level=\"PPS\", extension=\"FTZ\", filename=\"casa\")" },
        notes:["Les deux caméras MOS ne reçoivent qu'environ la moitié de la lumière de leur télescope : l'autre partie est déviée par les réseaux vers les RGS.",
               "Des protons de basse énergie, piégés autour de la Terre, provoquent parfois des « éruptions » de bruit : on retire ces moments des données."],
        docs:[ {l:"Users Handbook",u:"https://heasarc.gsfc.nasa.gov/docs/xmm/uhb2.20/uhb/basics.html"}, {l:"The Telescopes of XMM-Newton",u:"https://www.cosmos.esa.int/web/xmm-newton/technical-details-mirrors"} ] },
      { id:"rgs", type:"spectro", name:"RGS", full:"Reflection Grating Spectrometer", kind:"Spectromètre à réseaux", color:"#7A4FB5",
        bands:[ {l:"RGS",lo:0.0005,hi:0.0035} ],
        use:"Décomposer les rayons X mous en un spectre très fin, où apparaissent les raies du carbone, de l'azote, de l'oxygène, du néon ou du fer : température, densité et composition du gaz chaud.",
        summary:"Derrière deux des trois télescopes, une pile de réseaux en réflexion intercepte une partie des rayons X et les disperse selon leur longueur d'onde vers une rangée de CCD. Les deux spectromètres sont presque identiques.",
        specs:[
          ["Domaine", "0,35 à 2,5 keV · 5 à 35 Å (ordre −1)", "uhb"],
          ["Champ", "≈ 5′", "uhb"],
          ["Résolution", "0,04 Å / 0,025 Å (ordres −1 / −2)", "uhb"],
          ["Pixels", "81 µm, soit ≈ 0,009 Å", "uhb"]
        ],
        fov:[ {l:'RGS', w:300, h:300} ],
        products:[
          ["Spectres par ordre (SRSPEC)","spectre de la source, ordres 1 et 2, pour chaque RGS"],
          ["Spectre « fluxed » (FLUXED)","RGS1 et RGS2 combinés, en flux, pour un premier coup d'œil"]
        ],
        example:{ real:false, title:"Colonnes d'un spectre « fluxed »", caption:"Colonnes réelles du produit ; valeurs illustratives.", text:
"CHANNEL (Å)   FLUX (photons/s/cm²/Å)   ERROR\n" +
"18.962        0.0712                   0.0021\n" +
"18.998        0.0284                   0.0013\n" +
"\n" +
"→ ici, le bord de la raie de l'oxygène O VIII, à 18,97 Å." },
        notes:["Le spectre « fluxed » du pipeline sert d'aperçu ; une analyse se fait sur les spectres par ordre, avec leur matrice de réponse.",
               "Quelques CCD sont hors service depuis le début de la mission, d'où des trous dans les spectres de chaque RGS."],
        docs:[ {l:"Users Handbook",u:"https://heasarc.gsfc.nasa.gov/docs/xmm/uhb2.20/uhb/basics.html"} ] },
      { id:"om", type:"imager", name:"OM", full:"Optical Monitor", kind:"Télescope visible et ultraviolet", color:"#C9A100",
        bands:[ {l:"OM",lo:0.18,hi:0.60} ],
        use:"Voir les mêmes objets que les caméras X, au même moment, en visible et en ultraviolet : pour relier ce qui se passe dans les deux domaines, ou repérer les étoiles et galaxies du champ.",
        summary:"Un télescope Ritchey-Chrétien de 30 cm, avec une roue de filtres (trois visibles, trois ultraviolets) et deux grismes. Son détecteur amplifie chaque photon et en mesure la position.",
        specs:[
          ["Ouverture", "30 cm", "uhb"],
          ["Domaine", "180 à 600 nm", "uhb"],
          ["Champ", "17′", "uhb"],
          ["Netteté", "1,4″ à 2,0″", "uhb"],
          ["Pixels", "0,48″", "uhb"],
          ["Sensibilité", "magnitude 20,7 en 1 000 s (5σ)", "uhb"]
        ],
        fov:[ {l:'OM', w:1020, h:1020} ],
        filtersTitle:"Filtres",
        filters:[ R("UVW2",0.18,0.225,"B","≈ 212 nm"), R("UVM2",0.2,0.26,"B","≈ 231 nm"), R("UVW1",0.245,0.32,"B","≈ 291 nm"), R("U",0.3,0.39,"B","≈ 344 nm"), R("B",0.39,0.49,"B","≈ 450 nm"), R("V",0.51,0.58,"B","≈ 543 nm") ],
        products:[
          ["Images du ciel (SIMAGE)","images de chaque pose, redressées sur le ciel"],
          ["Liste de sources (OBSMLI)","sources détectées, avec leurs magnitudes"]
        ],
        notes:["L'OM observe toujours le même champ que les caméras X, en même temps : aucun temps d'observation supplémentaire n'est nécessaire.",
               "Sur l'axe des longueurs d'onde, les bandes des filtres sont approchées ; leurs longueurs d'onde centrales sont indiquées à côté."],
        docs:[ {l:"Users Handbook",u:"https://heasarc.gsfc.nasa.gov/docs/xmm/uhb2.20/uhb/basics.html"} ] }
    ]
  },
  chandra: {
    checked:'2026-11-19',
    refs:{
      about:{ t:"About Chandra (caractéristiques des instruments)", p:"Chandra X-ray Center", u:"https://cxc.cfa.harvard.edu/cdo/about_chandra/" },
      pog:{ t:"Proposers' Observatory Guide, introduction", p:"Chandra X-ray Center", u:"https://cxc.cfa.harvard.edu/proposer/POG/html/INTRO.html" },
      specs:{ t:"Chandra Specifications", p:"Chandra X-ray Center (SAO)", u:"https://www.chandra.si.edu/about/specs.html" },
      cuc:{ t:"Chandra Users' Committee, mai 2026 (état de la mission)", p:"Chandra X-ray Center", u:"https://cxc.cfa.harvard.edu/cdo/cuc/cuc_file26/may6/Slane_CUC_May2026.pdf" },
      csc:{ t:"Chandra Source Catalog, Release 2.1", p:"Chandra X-ray Center (newsletter 35)", u:"https://cxc.harvard.edu/newsletters/news_35/article14.html" },
      cfp:{ t:"Chandra Call for Proposals, cycle 26", p:"Chandra X-ray Center", u:"https://cxc.harvard.edu/proposer/CfP/arc_pdfs/CfP_cyc26.pdf" }
    },
    axis: { min:0.0001, max:0.02 },
    summary: "Deux caméras se relaient au foyer, à 10 m derrière les miroirs : ACIS, une mosaïque de CCD qui mesure aussi l'énergie de chaque photon, et HRC, une caméra à galettes à microcanaux pour les images les plus nettes. Deux réseaux de transmission, HETG et LETG, peuvent s'insérer derrière les miroirs pour disperser les rayons X en spectres très détaillés. Chandra compte les photons un à un : ses données de base sont des listes d'événements (position, instant, énergie), pas des images.",
    archives: [
      { label:"Chandra Data Archive (ChaSeR)", url:"https://cda.harvard.edu/chaser/", desc:"Recherche et téléchargement des observations, au Chandra X-ray Center." },
      { label:"Chandra Source Catalog 2.1", url:"https://cxc.cfa.harvard.edu/csc/", desc:"Catalogue de 407 806 sources X, tiré des observations publiques jusqu'à fin 2021." },
      { label:"CIAO", url:"https://cxc.cfa.harvard.edu/ciao/", desc:"Logiciel d'analyse des données de Chandra." },
      { label:"HEASARC", url:"https://heasarc.gsfc.nasa.gov/", desc:"Archive de la NASA pour les hautes énergies, qui donne aussi accès à Chandra." }
    ],
    instruments: [
      { id:"acis", type:"specimager", name:"ACIS", full:"Advanced CCD Imaging Spectrometer", kind:"Caméra CCD imageuse et spectrométrique",
        bands:[ {l:"CCD FI",lo:0.000155,hi:0.0015498}, {l:"CCD BI",lo:0.000155,hi:0.0041327} ],
        use:"Photographier le ciel en rayons X tout en mesurant l'énergie de chaque photon. On obtient à la fois l'image d'un reste de supernova ou d'un amas de galaxies et la composition chimique et la température de son gaz.",
        summary:"Dix CCD en deux réseaux : ACIS-I, un carré de 2 × 2 pour l'imagerie, et ACIS-S, une rangée de six, qui sert aussi à lire les spectres du réseau HETG. Chaque photon est enregistré avec sa position, son instant et son énergie.",
        specs:[
          ["Détecteurs", "10 CCD : ACIS-I (4) et ACIS-S (6, dont 2 éclairés par l'arrière)", ["specs","pog"]],
          ["Pixels", "24 µm · 0,492″", "about"],
          ["Champ", "ACIS-I 16,9′ × 16,9′ · ACIS-S 8,3′ × 50,6′", "about"],
          ["Domaine (rendement > 30 %)", "0,8–8 keV (éclairés par l'avant) · 0,3–8 keV (par l'arrière)", "about"],
          ["Temps de pose d'une trame", "3,2 s (0,2 à 10 s possibles)", "about"],
          ["Surface efficace", "110 cm² à 0,5 keV · 600 cm² à 1,5 keV · 40 cm² à 8 keV", "about"]
        ],
        fov:[ {l:'ACIS-I', w:1014, h:1014}, {l:'ACIS-S', w:3036, h:498} ],
        products:[
          ["evt1","liste d'événements de niveau 1 : chaque photon avec position, instant, énergie"],
          ["evt2","liste d'événements de niveau 2, filtrée et prête pour l'analyse"],
          ["Catalogue CSC","sources détectées sur l'ensemble des observations publiques (407 806 dans la version 2.1)"]
        ],
        example:{ real:false, title:"Une liste d'événements (evt2)", caption:"Structure réelle d'un fichier evt2 d'ACIS ; valeurs illustratives.", text:
"time (s)          ccd_id  chipx  chipy     x (px)     y (px)   energy (eV)  grade\n" +
"6.4218302e+08     7       512    430       4096.3     4110.8    1520.4       0\n" +
"6.4218302e+08     7       233    871       4241.9     4372.1     684.2       2\n" +
"6.4218303e+08     6       901    112       3870.5     3922.6    6421.7       0\n" +
"\n" +
"→ une ligne par photon ; l'image et le spectre se construisent ensuite en regroupant les événements." },
        code:{ title:"Analyse avec CIAO", text:
"download_chandra_obsid <ObsID>          # télécharge les données d'une observation\n" +
"chandra_repro <ObsID> outdir=repro      # retraitement standard (nouvel evt2)\n" +
"dmcopy \"repro/acisf*_evt2.fits[energy=500:7000][bin sky=4]\" image.fits\n" +
"specextract infile=\"repro/acisf*_evt2.fits[sky=region(src.reg)]\" outroot=spec" },
        notes:[
          "Le télescope oscille doucement en figure de Lissajous (« dither ») pendant la pose, pour répartir l'image sur de nombreux pixels ; la position de chaque photon est ensuite corrigée.",
          "Un dépôt contaminant sur le filtre d'ACIS réduit peu à peu la sensibilité aux basses énergies ; il est suivi par l'étalonnage."
        ],
        docs:[ {l:"About Chandra (caractéristiques)",u:"https://cxc.cfa.harvard.edu/cdo/about_chandra/"}, {l:"Proposers' Observatory Guide",u:"https://cxc.cfa.harvard.edu/proposer/POG/"} ] },

      { id:"hrc", type:"imager", name:"HRC", full:"High Resolution Camera", kind:"Caméra à galettes à microcanaux",
        bands:[ {l:"HRC",lo:0.000124,hi:0.0154975} ],
        use:"Prendre les images X les plus nettes et dater chaque photon à quelques microsecondes près, par exemple pour suivre la rotation rapide d'un pulsar.",
        summary:"Deux détecteurs à galettes à microcanaux : HRC-I, pour l'imagerie sur un grand champ, et HRC-S, une bande allongée qui lit les spectres du réseau LETG. Résolution en énergie très faible, mais grande netteté et datation très fine.",
        specs:[
          ["Détecteurs", "HRC-I (imagerie) · HRC-S (spectroscopie avec LETG)", "pog"],
          ["Champ", "HRC-I ≈ 30′ × 30′ · HRC-S 6′ × 90′", "about"],
          ["Résolution", "≈ 0,4″ à mi-hauteur", "about"],
          ["Domaine", "0,08–10 keV", "about"],
          ["Résolution en énergie", "E/ΔE ≈ 1 à 1 keV", "about"],
          ["Datation", "16 µs", "about"],
          ["État en 2026", "HRC-I en service · HRC-S arrêté depuis octobre 2025 (déclenchements du limiteur de haute tension)", "cuc"]
        ],
        fov:[ {l:'HRC-I', w:1800, h:1800} ],
        products:[
          ["evt1 / evt2","listes d'événements : position et instant de chaque photon"]
        ],
        notes:[ "Les poses avec HRC sont limitées à 14,5 ks d'un seul tenant, pour des raisons thermiques." ],
        docs:[ {l:"About Chandra (caractéristiques)",u:"https://cxc.cfa.harvard.edu/cdo/about_chandra/"} ] },

      { id:"hetg", type:"spectro", name:"HETG", full:"High Energy Transmission Grating", kind:"Réseau de spectroscopie haute énergie",
        bands:[ {l:"HEG",lo:0.000124,hi:0.0015498}, {l:"MEG",lo:0.000248,hi:0.0030995} ],
        use:"Décomposer les rayons X en un spectre très fin, où l'on voit les raies de chaque élément chimique : on mesure ainsi la température, la densité et la vitesse du gaz autour des étoiles et des trous noirs.",
        summary:"Un ensemble de réseaux de transmission en or, inséré juste derrière les miroirs. Deux familles de réseaux (HEG et MEG) dispersent la lumière dans deux directions écartées de 10° ; le spectre est lu par ACIS-S.",
        specs:[
          ["Réseaux", "HEG (haute énergie) et MEG (énergie moyenne), dispersions écartées de 10°", "pog"],
          ["HEG", "0,8–10 keV (15–1,2 Å) · E/ΔE de 65 à 1 070", "about"],
          ["MEG", "0,4–5 keV (31–2,5 Å) · E/ΔE de 80 à 970", "about"],
          ["Lecture", "ACIS-S", "pog"],
          ["Surface efficace (HEG + MEG)", "59 cm² à 1 keV · 200 cm² à 1,5 keV", "about"]
        ],
        products:[ ["pha2","spectres par ordre de diffraction, extraits de l'evt2"] ],
        docs:[ {l:"About Chandra (caractéristiques)",u:"https://cxc.cfa.harvard.edu/cdo/about_chandra/"} ] },

      { id:"letg", type:"spectro", name:"LETG", full:"Low Energy Transmission Grating", kind:"Réseau de spectroscopie basse énergie",
        bands:[ {l:"LETG + HRC-S",lo:0.0001701,hi:0.0177114} ],
        use:"Obtenir les spectres X les plus détaillés aux basses énergies, par exemple pour étudier l'atmosphère très chaude des étoiles ou le gaz entre les galaxies.",
        summary:"Un réseau de transmission inséré derrière les miroirs, lu par HRC-S ou par ACIS-S. C'est l'instrument de Chandra qui a la plus haute résolution aux basses énergies.",
        specs:[
          ["Domaine", "1,7–170 Å (0,07–7,3 keV) avec HRC-S · 1,4–63 Å avec ACIS-S", "about"],
          ["Pouvoir de résolution", "≥ 1 000 entre 50 et 160 Å", "about"],
          ["Lecture", "HRC-S ou ACIS-S", "pog"],
          ["État en 2026", "lecture par HRC-S interrompue depuis octobre 2025", "cuc"]
        ],
        products:[ ["pha2","spectres par ordre de diffraction"] ],
        docs:[ {l:"About Chandra (caractéristiques)",u:"https://cxc.cfa.harvard.edu/cdo/about_chandra/"} ] }
    ]
  },

  gaia: {
    checked:'2026-11-14',
    refs:{
      dr3:{ t:"Gaia Data Release 3", p:"ESA Cosmos", u:"https://www.cosmos.esa.int/web/gaia/dr3" },
      phot:{ t:"Gaia photometric instrument", p:"ESA Cosmos", u:"https://www.cosmos.esa.int/web/gaia/photometric-instrument" },
      doc:{ t:"Gaia DR2 documentation, 1.2 Spacecraft", p:"ESA Gaia Archive", u:"https://gea.esac.esa.int/archive/documentation/GDR2/Introduction/chap_cu0int/cu0int_sec_mission/cu0int_ssec_spacecraft_intro.html" },
      prusti:{ t:"Gaia Collaboration, Prusti et al. 2016, The Gaia mission, A&A 595, A1", p:"A&A", u:"https://doi.org/10.1051/0004-6361/201629272" },
      weiler:{ t:"Weiler 2018, Revised Gaia Data Release 2 passbands, A&A", p:"A&A", u:"https://arxiv.org/abs/1805.08082" }
    },
    axis: { min:0.3, max:1.1 },
    summary: "Gaia n'a pas d'instruments séparés au sens habituel. Un unique plan focal de 106 CCD, partagé par les deux télescopes, remplit trois fonctions qui lisent le même flux de lumière pendant que le satellite balaie le ciel.",
    archives: [
      { label:"ESA, Gaia Archive", url:"https://gea.esac.esa.int/archive/", desc:"Archive officielle : requêtes ADQL sur Gaia DR3, téléchargements, spectres XP et RVS." },
      { label:"Documentation Gaia DR3", url:"https://gea.esac.esa.int/archive/documentation/GDR3/index.html", desc:"Description complète du catalogue et des tables." },
      { label:"VizieR, Gaia DR3 (I/355)", url:"https://vizier.cds.unistra.fr/viz-bin/VizieR-3?-source=I/355", desc:"Accès CDS au catalogue." },
      { label:"astroquery.gaia", url:"https://astroquery.readthedocs.io/en/latest/gaia/gaia.html", desc:"Accès Python à l'archive." }
    ],
    instruments: [
      { id:"astro", type:"astrometry", name:"Astro", full:"Sky Mapper + Astrometric Field", kind:"Astrométrie et photométrie G", color:"#D4A461",
        bands:[ {l:"bande G",lo:0.33,hi:1.05} ],
        use:"Mesurer la position des étoiles avec une précision extrême, de nombreuses fois en plusieurs années. On en tire leur distance, par la parallaxe, et leur mouvement dans la Galaxie.",

        summary:"Le cartographe de ciel (SM) détecte les objets en temps réel ; le champ astrométrique (AF) mesure ensuite leur position avec une précision de quelques dizaines de micro-secondes d'arc. L'ensemble fournit aussi la magnitude G en lumière blanche.",
        specs:[
          ["Détecteurs", "SM : 14 CCD (7 par télescope) · AF : 62 CCD", "doc"],
          ["Pixels", "4500×1966 px par CCD · 10 µm × 30 µm", "prusti"],
          ["Mode de lecture", "TDI : intégration synchronisée sur la rotation (4,42 s par CCD)", "prusti"],
          ["Bande G", "≈ 330–1050 nm (lumière blanche)", "weiler"],
          ["Magnitudes observées", "G ≈ 3 à ≈ 21", "dr3"],
          ["Précision parallaxe (DR3)", "≈ 0,02–0,03 mas (G < 15) · 0,07 mas (G = 17) · 0,5 mas (G = 20) · 1,3 mas (G = 21)", "dr3"]
        ],
        filtersTitle:"Bande photométrique",
        filters:[ R("G",0.33,1.05,"B","lumière blanche (SM + AF)") ],
        products:[
          ["gaia_source","table maîtresse : astrométrie, photométrie, paramètres, vitesses radiales (≈ 1,8 milliard de sources en DR3)"],
          ["Astrométrie","5 ou 6 paramètres : position, parallaxe, mouvement propre (± pseudo-couleur)"],
          ["RUWE","indicateur de qualité de l'ajustement astrométrique (≈ 1 attendu)"]
        ],
        example:{ real:true, title:"Extrait de gaia_source, étoiles bien connues", caption:"Valeurs réellement publiées (astrométrie et photométrie de Gaia EDR3, identiques dans DR3). Époque 2016,0.", text:
"source_id             ra (°)       dec (°)       parallax (mas)    G (mag)  BP−RP  RUWE\n" +
"5853498713190525696   217.392321   −62.676075    768.067 ± 0.050   8.985    3.805  0.97   Proxima Cen\n" +
"5250032958818831360   146.311593   −62.507867      1.984 ± 0.110   3.471    1.503  2.39   ℓ Car\n" +
"5351161399793209984   161.136160   −57.565357      0.553 ± 0.017   7.338    1.511  0.92   VY Car\n" +
"5240441472232302848   165.566881   −64.262893      0.378 ± 0.014   8.941    1.549  1.07   XY Car\n" +
"\n" +
"→ ℓ Car (étoile très brillante) a un RUWE de 2,39 : solution astrométrique à manier avec prudence." },
        code:{ title:"Requête ADQL (astroquery.gaia)", text:
"from astroquery.gaia import Gaia\n\n" +
"query = \"\"\"\n" +
"SELECT TOP 10 source_id, ra, dec, parallax, parallax_error,\n" +
"       pmra, pmdec, phot_g_mean_mag, bp_rp, ruwe\n" +
"FROM gaiadr3.gaia_source\n" +
"WHERE parallax > 100 AND parallax_over_error > 10\n" +
"ORDER BY parallax DESC\n" +
"\"\"\"\n" +
"job = Gaia.launch_job(query)        # ≤ 2000 lignes ; launch_job_async au-delà\n" +
"print(job.get_results())" },
        notes:[
          "Proxima Centauri (768 mas de parallaxe, soit 1,30 pc) est l'étoile la plus proche du Soleil.",
          "Un RUWE nettement supérieur à 1,4 signale en général un mauvais ajustement (binaire non résolue, source étendue)."
        ],
        docs:[ {l:"Documentation Gaia DR3",u:"https://gea.esac.esa.int/archive/documentation/GDR3/index.html"} ] },

      { id:"bprp", type:"spectro", name:"BP / RP", full:"Blue & Red Photometers", kind:"Spectro-photométrie basse résolution", color:"#93D2DC",
        bands:[ {l:"BP",lo:0.33,hi:0.68}, {l:"RP",lo:0.64,hi:1.05} ],
        use:"Mesurer la couleur de chaque étoile observée à partir d'un spectre très grossier. On en déduit sa température et la quantité de poussière qui l'atténue.",

        summary:"Deux prismes dispersent la lumière de chaque étoile en un spectre de très basse résolution, bleu (BP) et rouge (RP), qui donne couleurs, température et extinction.",
        specs:[
          ["BP", "330–680 nm · 7 CCD", ["phot", "doc"]],
          ["RP", "640–1050 nm · 7 CCD", ["phot", "doc"]],
          ["Dispersion", "prismes : 3–27 nm/px (BP) · 7–15 nm/px (RP)", "phot"],
          ["Spectres XP publiés (DR3)", "≈ 219 millions", "dr3"]
        ],
        filtersTitle:"Bandes photométriques",
        filters:[ R("BP",0.33,0.68,"B","bande bleue"), R("RP",0.64,1.05,"B","bande rouge") ],
        products:[
          ["phot_bp_mean_mag / phot_rp_mean_mag","magnitudes dans gaia_source"],
          ["XP continuous / sampled","spectres XP : coefficients de base (continus) ou échantillonnés"]
        ],
        example:{ real:false, title:"Représentation continue d'un spectre XP", caption:"Structure du produit ; les valeurs ne sont pas reproduites ici.", text:
"source_id           identifiant\n" +
"bp_n_parameters     nombre de coefficients BP\n" +
"bp_coefficients[]   coefficients de la décomposition sur une base de fonctions\n" +
"bp_coefficient_errors[]\n" +
"(idem pour RP)\n" +
"→ le spectre se reconstruit avec GaiaXPy (échantillonnage libre)" },
        code:{ title:"Couleur BP − RP (ADQL)", text:
"SELECT TOP 10 source_id, phot_g_mean_mag, phot_bp_mean_mag,\n" +
"       phot_rp_mean_mag, bp_rp\n" +
"FROM gaiadr3.gaia_source\n" +
"WHERE phot_g_mean_mag < 6 AND bp_rp IS NOT NULL" },
        notes:["La différence BP − RP est un indice de couleur : plus elle est grande, plus l'étoile est rouge (Proxima : 3,8)."],
        docs:[ {l:"Documentation Gaia DR3",u:"https://gea.esac.esa.int/archive/documentation/GDR3/index.html"} ] },

      { id:"rvs", type:"spectro", name:"RVS", full:"Radial Velocity Spectrometer", kind:"Spectromètre sans fente", color:"#C58FD8",
        bands:[ {l:"Ca II",lo:0.845,hi:0.872} ],
        use:"Mesurer à quelle vitesse les étoiles s'approchent ou s'éloignent de nous. Ajoutée à leur déplacement sur le ciel, cette vitesse donne leur mouvement complet dans l'espace.",

        summary:"Spectromètre sans fente centré sur le triplet du calcium ionisé (Ca II). Il mesure par effet Doppler les vitesses radiales de dizaines de millions d'étoiles.",
        specs:[
          ["Domaine", "845–872 nm (triplet du Ca II)", "prusti"],
          ["Résolution", "R ≈ 11 700", ["prusti", "doc"]],
          ["Détecteurs", "12 CCD", "doc"],
          ["Vitesses radiales (DR3)", "≈ 33,8 millions d'étoiles · ≈ 1 million de spectres RVS moyens", "dr3"]
        ],
        filtersTitle:"Plage spectrale",
        filters:[ R("RVS",0.845,0.872,"G","triplet du Ca II") ],
        products:[
          ["radial_velocity","vitesse radiale (km/s) dans gaia_source"],
          ["rv_nb_transits","nombre de passages utilisés"]
        ],
        example:{ real:false, title:"Champs de vitesse radiale dans gaia_source", caption:"Colonnes réelles de la table.", text:
"radial_velocity          km/s   vitesse radiale\n" +
"radial_velocity_error    km/s   incertitude\n" +
"rv_nb_transits           —      nombre de transits utilisés\n" +
"rv_template_teff         K      température du gabarit stellaire utilisé" },
        code:{ title:"Étoiles proches avec vitesse radiale (ADQL)", text:
"SELECT TOP 10 source_id, parallax, radial_velocity, radial_velocity_error\n" +
"FROM gaiadr3.gaia_source\n" +
"WHERE parallax > 50 AND radial_velocity IS NOT NULL\n" +
"ORDER BY parallax DESC" },
        notes:["Vitesse radiale, mouvement propre et parallaxe réunis donnent la vitesse 3D de l'étoile dans la Galaxie."],
        docs:[ {l:"Documentation Gaia DR3",u:"https://gea.esac.esa.int/archive/documentation/GDR3/index.html"} ] }
    ]
  }

  };
})();
