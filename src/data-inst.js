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
    axis: { min:0.09, max:2.0 },
    summary: "Cinq instruments scientifiques actifs, dont deux spectrographes ultraviolets et deux caméras. Les instruments sont interchangeables en orbite : la plupart ont été installés lors de missions d'entretien en navette (1993–2009).",
    archives: [
      { label:"MAST, archive Hubble", url:"https://archive.stsci.edu/hst/", desc:"Recherche, aperçus et téléchargement des observations HST ; accès par programme via astroquery.mast." },
      { label:"ESA, eHST", url:"https://hst.esac.esa.int/ehst/", desc:"Archive Hubble de l'ESA (miroir européen)." },
      { label:"Manuels d'instruments", url:"https://hst-docs.stsci.edu/", desc:"Instrument & Data Handbooks (WFC3, ACS, STIS, COS)." }
    ],
    instruments: [
      { id:"wfc3", name:"WFC3", full:"Wide Field Camera 3", kind:"Caméra grand champ", color:"#D4A461",
        bands:[ {l:"UVIS",lo:0.2,hi:1.0}, {l:"IR",lo:0.8,hi:1.7} ],
        fov:[ {l:"UVIS",w:162,h:162}, {l:"IR",w:136,h:123} ],
        summary:"Caméra de quatrième génération installée en 2009 (SM4). Deux canaux indépendants, dont un seul est utilisable à la fois, couvrent de l'ultraviolet proche à l'infrarouge proche.",
        specs:[
          ["Canal UVIS","200–1000 nm · 2 CCD e2v 2k×4k · 0,040″/px · 162″×162″ · f/31"],
          ["Canal IR","800–1700 nm · HgCdTe 1k×1k (Teledyne) · 0,13″/px · 136″×123″ · f/11"],
          ["Filtres","UVIS : large choix (large, moyenne, étroite) · IR : 15"],
          ["Grismes","G280 (UVIS) · G102 et G141 (IR)"],
          ["Bruit de lecture","3 e⁻ (UVIS), contre 4 e⁻ pour l'ACS"],
          ["Sensibilité (S/N=10, 10 h)","V = 29,2 (F606W) · H = 27,9 (F160W), mag AB, source ponctuelle"]
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

      { id:"acs", name:"ACS", full:"Advanced Camera for Surveys", kind:"Caméra de relevés", color:"#93D2DC",
        bands:[ {l:"WFC",lo:0.35,hi:1.1}, {l:"SBC",lo:0.115,hi:0.17} ],
        fov:[ {l:"WFC",w:202,h:202} ],
        summary:"Installée en 2002 (SM3B). Son canal grand champ WFC a servi aux grands relevés (champs profonds, amas de galaxies). Une panne électronique en janvier 2007 a mis hors service WFC et HRC ; le WFC a été réparé en 2009, pas le HRC.",
        specs:[
          ["WFC","350–1100 nm · 202″×202″ · 0,05″/px"],
          ["SBC","imagerie ultraviolette lointaine « solar-blind » (MAMA) · ≈ 115–170 nm · 0,032″/px"],
          ["HRC","hors service depuis 2007 (non réparable en SM4)"]
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

      { id:"stis", name:"STIS", full:"Space Telescope Imaging Spectrograph", kind:"Spectrographe imageur", color:"#8FA6E8",
        bands:[ {l:"FUV",lo:0.115,hi:0.17}, {l:"NUV",lo:0.165,hi:0.31}, {l:"CCD",lo:0.25,hi:1.1} ],
        fov:[ {l:"CCD",w:52,h:52}, {l:"MAMA",w:25,h:25} ],
        summary:"Spectrographe à longue fente (jusqu'à 52″) installé en 1997, tombé en panne en 2004 et réparé en 2009 lors de SM4. Il combine trois détecteurs : deux MAMA ultraviolets et un CCD.",
        specs:[
          ["FUV-MAMA","115–170 nm · 0,024″/px · champ 25″×25″"],
          ["NUV-MAMA","165–310 nm · 0,024″/px · champ 25″×25″"],
          ["CCD","250–1100 nm · 0,05″/px · champ 52″×52″"],
          ["Résolution spectrale","R ≈ 500–1 000 (réseaux L) · ≈ 10 000–20 000 (M) · ≈ 30 000–114 000 (échelles)"]
        ],
        filtersTitle:"Réseaux de dispersion (plages nominales)",
        filters:[
          R("G140L",0.115,0.173,"G","FUV-MAMA, basse résolution"),
          R("G230L",0.157,0.318,"G","NUV-MAMA, basse résolution"),
          R("G430L",0.29,0.57,"G","CCD, basse résolution"),
          R("G750L",0.524,1.027,"G","CCD, basse résolution"),
          R("E140M",0.114,0.171,"G","échelle FUV, R ≈ 45 000")
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

      { id:"cos", name:"COS", full:"Cosmic Origins Spectrograph", kind:"Spectrographe UV", color:"#C58FD8",
        bands:[ {l:"FUV",lo:0.09,hi:0.215}, {l:"NUV",lo:0.17,hi:0.32} ],
        fov:[ {l:"ouverture PSA (Ø 2,5″)",w:2.5,h:2.5,circle:true} ],
        summary:"Spectrographe ultraviolet sans fente à très haute sensibilité, installé en 2009 (SM4) pour étudier le milieu intergalactique, les quasars et la formation des éléments chimiques.",
        specs:[
          ["Voie FUV","≈ 90–215 nm · détecteur à galettes de microcanaux (lecture par lignes à retard croisées)"],
          ["Voie NUV","≈ 170–320 nm · détecteur MAMA"],
          ["Ouverture","PSA, circulaire, Ø 2,5″ (sans fente)"],
          ["Résolution","R ≈ 1 500–4 000 (basse) · ≈ 16 000–24 000 (moyenne)"]
        ],
        filtersTitle:"Réseaux (plages nominales approximatives)",
        filters:[
          R("G140L",0.090,0.215,"G","FUV, basse résolution"),
          R("G130M",0.090,0.145,"G","FUV, moyenne résolution"),
          R("G160M",0.1405,0.1775,"G","FUV, moyenne résolution"),
          R("G185M",0.167,0.210,"G","NUV, moyenne résolution"),
          R("G225M",0.207,0.250,"G","NUV, moyenne résolution"),
          R("G285M",0.248,0.322,"G","NUV, moyenne résolution"),
          R("G230L",0.170,0.320,"G","NUV, basse résolution")
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

      { id:"fgs", name:"FGS", full:"Fine Guidance Sensors", kind:"Guidage et astrométrie", color:"#8FD69A",
        bands:null,
        summary:"Trois capteurs de guidage fin qui verrouillent le télescope sur des étoiles guides (stabilité de pointage ≈ 0,007″). Ils servent aussi d'instrument scientifique : astrométrie de haute précision et mesure de binaires serrées.",
        specs:[
          ["Nombre","3 (deux pour le guidage, un disponible pour la science)"],
          ["Principe","interféromètres à prismes de Koesters"],
          ["Stabilité de pointage","≈ 0,007″"]
        ],
        products:[ ["Archive","données FGS (astrométrie) disponibles au MAST sous l'instrument « FGS »"] ],
        notes:["Les FGS ont fourni plusieurs parallaxes d'étoiles céphéides avant l'ère Gaia."],
        docs:[ {l:"Documentation Hubble (STScI)",u:"https://hst-docs.stsci.edu/"} ] }
    ]
  },

  /* -------------------------------------------------------------- JWST */
  jwst: {
    axis: { min:0.5, max:30 },
    summary: "Quatre instruments scientifiques partagent le module ISIM, maintenu à très basse température (≈ 40 K ; ≈ 7 K pour le détecteur de MIRI), avec un capteur de guidage fin. Ensemble ils couvrent 0,6 à 28,5 µm.",
    archives: [
      { label:"MAST, archive JWST", url:"https://archive.stsci.edu/missions-and-data/jwst", desc:"Observations JWST, niveaux de calibration 1 à 3 ; accès par programme via astroquery.mast." },
      { label:"ESA, archive JWST", url:"https://jwst.esac.esa.int/archive/", desc:"Accès européen aux données JWST." },
      { label:"JDox, documentation", url:"https://jwst-docs.stsci.edu/", desc:"Documentation utilisateur de chaque instrument." },
      { label:"Pipeline de calibration", url:"https://jwst-pipeline.readthedocs.io/", desc:"Étapes de calibration et formats des produits de données." }
    ],
    instruments: [
      { id:"nircam", name:"NIRCam", full:"Near-Infrared Camera", kind:"Caméra proche IR", color:"#D4A461",
        bands:[ {l:"SW",lo:0.6,hi:2.3}, {l:"LW",lo:2.4,hi:5.0} ],
        fov:[ {l:"Module A",w:132,h:132,dx:-88}, {l:"Module B",w:132,h:132,dx:88} ],
        summary:"Caméra principale de JWST. Deux modules identiques observent le même champ dans deux plages de longueur d'onde à la fois grâce à un dichroïque. Elle sert aussi de capteur de front d'onde pour aligner les 18 segments du miroir.",
        specs:[
          ["Domaine","0,6–5,0 µm"],
          ["Voie courte (SW)","0,6–2,3 µm · 0,031″/px"],
          ["Voie longue (LW)","2,4–5,0 µm · 0,063″/px"],
          ["Champ","2 modules de 2,2′×2,2′ séparés de ≈ 44″ · 9,7 arcmin² au total"],
          ["Détecteurs","10 matrices HgCdTe 2048×2048 (8 SW + 2 LW)"],
          ["Autres modes","coronographie · spectroscopie sans fente (grisme LW, R ≈ 1 700) · séries temporelles"]
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

      { id:"nirspec", name:"NIRSpec", full:"Near-Infrared Spectrograph", kind:"Spectrographe multi-objets", color:"#93D2DC",
        bands:[ {l:"0,6–5,3 µm",lo:0.6,hi:5.3} ],
        fov:[ {l:"MSA",w:204,h:204}, {l:"IFU",w:3,h:3} ],
        summary:"Spectrographe fourni par l'ESA. Sa matrice de micro-volets (MSA) permet d'observer des centaines de galaxies à la fois. Il offre aussi une unité à champ intégral (IFU) et des fentes fixes.",
        specs:[
          ["Domaine","0,6–5,3 µm"],
          ["Résolution","R ≈ 100 (prisme) · ≈ 1 000 (réseaux M) · ≈ 2 700 (réseaux H)"],
          ["Multi-objets (MSA)","4 quadrants de 365×171 volets · champ ≈ 3,4′×3,4′"],
          ["IFU","3″×3″ découpé en 30 tranches de 0,1″"],
          ["Fentes fixes","S200A1/A2, S400A1, S1600A1 et mode séries temporelles (BOTS)"]
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

      { id:"miri", name:"MIRI", full:"Mid-Infrared Instrument", kind:"Imageur et spectro moyen IR", color:"#C58FD8",
        bands:[ {l:"Imageur",lo:5.6,hi:25.5}, {l:"MRS",lo:4.9,hi:28.8} ],
        fov:[ {l:"Imageur",w:74,h:113} ],
        summary:"Seul instrument opérant dans l'infrarouge moyen, refroidi à environ 7 K par un cryo-refroidisseur actif. Il observe la poussière tiède, les disques protoplanétaires et les galaxies lointaines enfouies.",
        specs:[
          ["Imageur","5,6–25,5 µm · 74″×113″ · 0,11″/px"],
          ["Spectro. moyenne résolution (MRS)","4,9–28,8 µm · R ≈ 1 500–3 500 · 4 IFU (3,9″×3,9″ à ≈ 7,7″×7,7″)"],
          ["Spectro. basse résolution (LRS)","≈ 5–12 µm · R ≈ 100 · fente 0,6″×5,5″"],
          ["Coronographes","4 · rayon interne 0,34″–2,16″ · contraste 10⁻⁶–10⁻⁵"],
          ["Température","≈ 7 K (cryo-refroidisseur)"]
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

      { id:"niriss", name:"NIRISS", full:"Near-Infrared Imager and Slitless Spectrograph", kind:"Imageur et spectro sans fente", color:"#8FA6E8",
        bands:[ {l:"0,6–5,0 µm",lo:0.6,hi:5.0} ],
        fov:[ {l:"Imageur",w:132,h:132} ],
        summary:"Fourni par l'Agence spatiale canadienne. Spécialisé dans les spectres d'exoplanètes en transit (SOSS), la spectroscopie sans fente grand champ (WFSS) et l'interférométrie à masque d'ouverture (AMI).",
        specs:[
          ["Imagerie","0,8–5,0 µm · 2,2′×2,2′ · 0,065″/px"],
          ["WFSS","R ≈ 150 · 0,8–2,2 µm"],
          ["SOSS","0,6–2,8 µm · R ≈ 700 (objet unique, transits)"],
          ["AMI","interférométrie à masque d'ouverture · 2,8–4,8 µm (4 filtres)"]
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

      { id:"fgs", name:"FGS", full:"Fine Guidance Sensor", kind:"Guidage fin", color:"#8FD69A",
        bands:null, fov:[ {l:"Guider",w:138,h:138} ],
        summary:"Capteur de guidage fin qui verrouille l'observatoire sur des étoiles guides pour tenir le pointage à quelques millisecondes d'arc.",
        specs:[
          ["Domaine","0,6–5,0 µm"],
          ["Champ","2,3′×2,3′ · ≈ 0,07″/px"],
          ["Redondance","2 voies de guidage (FGS1, FGS2)"]
        ],
        products:[ ["Archive","les données de guidage sont archivées mais ne constituent pas un produit scientifique usuel"] ],
        notes:["Il partage son boîtier avec NIRISS, mais fonctionne comme sous-système de contrôle de pointage."],
        docs:[ {l:"JDox",u:"https://jwst-docs.stsci.edu/"} ] }
    ]
  },

  /* ------------------------------------------------------------ EUCLID */
  euclid: {
    axis: { min:0.5, max:2.2 },
    summary: "Deux instruments se partagent le même télescope de 1,2 m grâce à un dichroïque : VIS (visible) et NISP (proche infrarouge). La première grande publication, DR1, date du 12 novembre 2026 : environ 1 900 deg² du relevé large (14 % de la cible), observés du printemps 2024 au printemps 2025, soit plus d'un milliard d'objets. Elle s'ajoute à la « Quick Release » Q1 de mars 2025, dont sont tirés les exemples de cette page.",
    archives: [
      { label:"ESA, Euclid Science Archive", url:"https://eas.esac.esa.int/", desc:"Archive officielle : catalogues (ADQL), images, spectres." },
      { label:"Euclid DR1 (12 novembre 2026)", url:"https://www.cosmos.esa.int/web/euclid/euclid-dr1", desc:"Première grande publication : relevés large et profonds, plus d'un milliard d'objets, spectres de plus de 160 millions de sources." },
      { label:"Contenu de Q1", url:"https://www.cosmos.esa.int/web/euclid/q1-contents", desc:"Description des produits publiés dans la Quick Release 1." },
      { label:"NASA/IPAC, IRSA Euclid", url:"https://irsa.ipac.caltech.edu/data/Euclid/docs/overview_q1.html", desc:"Miroir NASA : mosaïques, catalogues, services VO." },
      { label:"Documentation des produits (DPDD)", url:"https://euclid.esac.esa.int/dr/q1/dpdd/", desc:"Data Product Description Document de Q1." },
      { label:"astroquery.esa.euclid", url:"https://astroquery.readthedocs.io/en/latest/esa/euclid/euclid.html", desc:"Accès Python à l'archive (TAP+)." }
    ],
    instruments: [
      { id:"vis", name:"VIS", full:"Visible Imager", kind:"Imageur visible", color:"#D4A461",
        bands:[ {l:"IE",lo:0.53,hi:0.92} ],
        summary:"Caméra optimisée pour mesurer avec précision la forme des galaxies (cisaillement gravitationnel faible). Une seule bande très large, sans autre filtre que le dichroïque.",
        specs:[
          ["Bande","IE · 530–920 nm"],
          ["Détecteurs","36 CCD e2v amincis (40 µm), disposés en 6×6"],
          ["Format","4096×4132 px par CCD · pixels de 12 µm · 4 nœuds de lecture"],
          ["Mosaïque","≈ 609 Mpx · échantillonnage 0,1″/px"],
          ["Champ","≈ 0,54 deg² (champ commun VIS/NISP)"],
          ["Température des CCD","153 K"],
          ["Saturation","≈ 200 000 e⁻ · limite brillante : IE(AB) ≈ 17,8 (pose nominale)"],
          ["Nombre focal","f/20,4 · pupille 1,2 m · obstruction centrale 11 %"]
        ],
        filtersTitle:"Bande photométrique",
        filters:[ R("IE",0.53,0.92,"B","bande large unique") ],
        products:[
          ["Images calibrées","fichiers FITS multi-extensions par exposition (niveau 2)"],
          ["Mosaïques MER","empilements par tuile du ciel, incluant des données sol"],
          ["Catalogue MER","table maîtresse de sources (VIS + NISP + sol)"],
          ["Découpes","service de cutouts dans l'archive web et dans ESA Datalabs"]
        ],
        example:{ real:true, title:"Schéma réel de la table q1.mer_catalogue (extrait)", caption:"Colonnes de la table publique Q1 interrogeable en ADQL, avec les noms publiés par l'archive ESA.", text:
"object_id          long   identifiant unique Euclid de la source\n" +
"right_ascension    deg    ascension droite (barycentre de la source)\n" +
"declination        deg    déclinaison\n" +
"segmentation_area         aire de la source dans la carte de segmentation\n" +
"ellipticity               ellipticité\n" +
"kron_radius        pix    demi-grand axe de l'ouverture de Kron\n" +
"flux_vis_psf              flux VIS (ajustement de PSF) · mag_vis_psf : magnitude AB associée\n" +
"flux_h_templfit           flux bande H du NISP (ajustement de modèle) · mag_h_templfit : magnitude AB\n" +
"[≈ 30 millions de lignes : champs EDF-Nord, EDF-Fornax, EDF-Sud et LDN 1641]" },
        code:{ title:"Interroger le catalogue MER (astroquery.esa.euclid)", text:
"from astroquery.esa.euclid import Euclid\n\n" +
"query = \"\"\"\n" +
"SELECT TOP 10 object_id, right_ascension, declination,\n" +
"       flux_vis_psf, flux_h_templfit\n" +
"FROM q1.mer_catalogue\n" +
"WHERE 1=CONTAINS(POINT('ICRS', right_ascension, declination),\n" +
"                 CIRCLE('ICRS', 53.1, -28.1, 0.05))\n" +
"ORDER BY object_id\n" +
"\"\"\"\n" +
"job = Euclid.launch_job(query)\n" +
"tbl = job.get_results()\n" +
"print(tbl)" },
        notes:[
          "L'identifiant object_id encode la position de la source : les déclinaisons négatives donnent des identifiants négatifs.",
          "Q1 couvre ≈ 63 deg² (EDF-Nord 22,9 · EDF-Fornax 12,1 · EDF-Sud 28,1 deg²) plus la nébuleuse sombre LDN 1641, soit ≈ 35 To."
        ],
        docs:[ {l:"Euclid Consortium, VIS",u:"https://www.euclid-ec.org/public/mission/vis/"}, {l:"Q1, contenu",u:"https://www.cosmos.esa.int/web/euclid/q1-contents"} ] },

      { id:"nisp", name:"NISP", full:"Near-Infrared Spectrometer and Photometer", kind:"Photomètre et spectro-imageur IR", color:"#93D2DC",
        bands:[ {l:"Y",lo:0.95,hi:1.21}, {l:"J",lo:1.17,hi:1.57}, {l:"H",lo:1.52,hi:2.02} ],
        summary:"Il mesure les couleurs infrarouges (pour les décalages vers le rouge photométriques) et fournit une spectroscopie sans fente par grismes, qui donne les décalages spectroscopiques de millions de galaxies.",
        specs:[
          ["Domaine","0,92–2,0 µm"],
          ["Détecteurs","16 matrices HgCdTe H2RG en 4×4 · 2040×2040 px utiles · pixels de 18 µm"],
          ["Échantillonnage","0,298″/px"],
          ["Photométrie","3 filtres : Y (0,95–1,21), J (1,17–1,57), H (1,52–2,02 µm)"],
          ["Spectroscopie","grisme bleu (BG) 926–1366 nm, R ≳ 400 · grisme rouge (RG) 1206–1892 nm, R ≳ 480"],
          ["Masse et puissance","85,3 kg (instrument) + 40,7 kg (électronique chaude) · ≤ 200 W"],
          ["Température","détecteurs ≈ 95 K · optique ≈ 130 K"]
        ],
        filtersTitle:"Bandes et grismes (plages nominales)",
        filters:[
          R("Y",0.95,1.21,"B","photométrie"),
          R("J",1.17,1.57,"B","photométrie"),
          R("H",1.52,2.02,"B","photométrie"),
          R("BG",0.92,1.37,"G","grisme bleu, non publié dans Q1"),
          R("RG",1.21,1.89,"G","grisme rouge, spectres publiés dans Q1")
        ],
        products:[
          ["Images NISP","images calibrées par exposition et mosaïques MER (Y, J, H)"],
          ["Spectres SIR","spectres 1D (DataLink / SSA) et images 2D calibrées ; Q1 : grisme rouge uniquement"],
          ["Catalogue SPE","13 tables de mesures spectroscopiques (redshifts, qualité)"],
          ["Catalogue PHZ","8 tables de redshifts photométriques"]
        ],
        example:{ real:true, title:"Contenu du catalogue de Q1 (nombre de tables par produit)", caption:"Organisation réelle des catalogues interrogeables en ADQL dans l'archive ESA.", text:
"MER  (produit fusionné)      3 tables   dont q1.mer_catalogue\n" +
"PHZ  (redshifts photo.)      8 tables\n" +
"SPE  (spectroscopie)        13 tables   redshifts et qualité à partir des spectres SIR\n" +
"\n" +
"Jointure : toutes les tables partagent la clé  object_id" },
        code:{ title:"Lister les tables disponibles (astroquery.esa.euclid)", text:
"from astroquery.esa.euclid import Euclid\n\n" +
"tables = Euclid.load_tables(only_names=True)\n" +
"for t in tables:\n" +
"    print(t.name)          # ex. q1.mer_catalogue, …" },
        notes:[
          "Dans Q1, seuls les spectres du grisme rouge sont publiés.",
          "VIS et NISP reçoivent la lumière du même champ par le dichroïque et peuvent acquérir en même temps."
        ],
        docs:[ {l:"Euclid Consortium, instruments",u:"https://www.euclid-ec.org/euclid-scientific-instruments/"} ] }
    ]
  },

  /* -------------------------------------------------------------- GAIA */
  gaia: {
    axis: { min:0.3, max:1.1 },
    summary: "Gaia n'a pas d'instruments séparés au sens habituel. Un unique plan focal de 106 CCD, partagé par les deux télescopes, remplit trois fonctions qui lisent le même flux de lumière pendant que le satellite balaie le ciel.",
    archives: [
      { label:"ESA, Gaia Archive", url:"https://gea.esac.esa.int/archive/", desc:"Archive officielle : requêtes ADQL sur Gaia DR3, téléchargements, spectres XP et RVS." },
      { label:"Documentation Gaia DR3", url:"https://gea.esac.esa.int/archive/documentation/GDR3/index.html", desc:"Description complète du catalogue et des tables." },
      { label:"VizieR, Gaia DR3 (I/355)", url:"https://vizier.cds.unistra.fr/viz-bin/VizieR-3?-source=I/355", desc:"Accès CDS au catalogue." },
      { label:"astroquery.gaia", url:"https://astroquery.readthedocs.io/en/latest/gaia/gaia.html", desc:"Accès Python à l'archive." }
    ],
    instruments: [
      { id:"astro", name:"Astro", full:"Sky Mapper + Astrometric Field", kind:"Astrométrie et photométrie G", color:"#D4A461",
        bands:[ {l:"bande G",lo:0.33,hi:1.05} ],
        summary:"Le cartographe de ciel (SM) détecte les objets en temps réel ; le champ astrométrique (AF) mesure ensuite leur position avec une précision de quelques dizaines de micro-secondes d'arc. L'ensemble fournit aussi la magnitude G en lumière blanche.",
        specs:[
          ["Détecteurs","SM : 14 CCD (7 par télescope) · AF : 62 CCD"],
          ["Pixels","4500×1966 px · 10 µm × 30 µm"],
          ["Mode de lecture","TDI : intégration synchronisée sur la rotation (≈ 4,4 s par CCD)"],
          ["Bande G","≈ 330–1050 nm (lumière blanche)"],
          ["Magnitudes observées","G ≈ 3 à ≈ 21"],
          ["Précision parallaxe (DR3)","≈ 0,02–0,03 mas (G < 15) · 0,07 mas (G = 17) · 0,5 mas (G = 20)"]
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

      { id:"bprp", name:"BP / RP", full:"Blue & Red Photometers", kind:"Spectro-photométrie basse résolution", color:"#93D2DC",
        bands:[ {l:"BP",lo:0.33,hi:0.68}, {l:"RP",lo:0.64,hi:1.05} ],
        summary:"Deux prismes dispersent la lumière de chaque étoile en un spectre de très basse résolution, bleu (BP) et rouge (RP), qui donne couleurs, température et extinction.",
        specs:[
          ["BP","≈ 330–680 nm · 7 CCD"],
          ["RP","≈ 640–1050 nm · 7 CCD"],
          ["Résolution","R ≈ 20–100 selon la longueur d'onde"],
          ["Spectres XP publiés (DR3)","≈ 220 millions"]
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

      { id:"rvs", name:"RVS", full:"Radial Velocity Spectrometer", kind:"Spectromètre sans fente", color:"#C58FD8",
        bands:[ {l:"Ca II",lo:0.845,hi:0.872} ],
        summary:"Spectromètre sans fente centré sur le triplet du calcium ionisé (Ca II). Il mesure par effet Doppler les vitesses radiales de dizaines de millions d'étoiles.",
        specs:[
          ["Domaine","845–872 nm"],
          ["Résolution","R ≈ 11 500"],
          ["Détecteurs","12 CCD"],
          ["Vitesses radiales (DR3)","≈ 33,8 millions d'étoiles"]
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
