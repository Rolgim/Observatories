/* =================================================================
   RENDU DES MATÉRIAUX — réglages propres à chaque maquette, appliqués au chargement.
   m : matériau three.js (MeshStandardMaterial), n : son nom dans le fichier 3D.
================================================================= */
var LOOKS = {
  /* Chandra (maquette NASA, textures et couleurs déjà en sRGB) : cellules solaires plus sombres, moins de reflets */
  chandra: function(m, n){
    if (/shiny_panel/.test(n)){ m.color.setHex(0x1B2438); m.metalness = 0.2; m.roughness = 0.55; }
    else if (/tex_01/.test(n)){ m.color.setHex(0x3E4A66); m.roughness = 0.6; }   /* atlas des cellules solaires et des petits équipements */
    else if (/foil_gold/.test(n)){ m.metalness = 0.6; m.roughness = 0.45; }
    else if (/foil_silver/.test(n)){ m.color.setHex(0xC8CCD0); m.metalness = 0.3; m.roughness = 0.55; }
  },
  /* Fermi (maquette NASA) : cellules solaires sombres, capot du LAT blanc mat, couvertures moins réfléchissantes */
  fermi: function(m, n, THREE){
    /* cellules et fond des panneaux : mats et peu réfléchissants, sinon ils renvoient la Terre, très claire, en incidence rasante */
    if (/SolarFaces/.test(n)){ m.color.setHex(0x060A1E); m.metalness = 0; m.roughness = 1; m.userData.envK = 0.1; m.side = THREE.DoubleSide; }
    else if (/SolarPanelBack/.test(n)){ m.color.setHex(0x0A0F24); m.metalness = 0; m.roughness = 1; m.userData.envK = 0.1; m.side = THREE.DoubleSide; }
    else if (/top-LAT-cover/.test(n)){ m.color.setHex(0xE9EAEA); m.metalness = 0; m.roughness = 0.85; }
    else if (/silverfoil|silver/.test(n)){ m.metalness = Math.min(m.metalness, 0.6); m.roughness = Math.max(m.roughness, 0.4); }
    else if (/bronze|gold/.test(n)){ m.metalness = 0.7; m.roughness = 0.45; }
    if (!/SolarFaces|SolarPanelBack|top-LAT-cover/.test(n)) m.color.convertSRGBToLinear();   /* couleurs sRGB lues comme linéaires, comme pour Roman */
    if (m.userData.envK == null) m.userData.envK = 0.5;
  },
  /* TESS (maquette NASA) : les matériaux « reflector » et « foil_silver » portent une carte de normales à la place de leur couleur
     (d'où un violet irisé) : couleur retirée, carte gardée comme relief ; couvertures argentées et antenne gris clair mats */
  /* XMM-Newton (maquette ESA, une texture partagée ; un matériau par pièce, voir tools/models/split_mats.mjs). Teintes d'après la vue
     de l'ESA (SCIFLEET) : couverture isolante noire et brillante sur le tube et les modules, cellules solaires gris-olive sombre,
     grilles dorées des miroirs. La couleur multiplie la texture, qui garde les détails. */
  xmm: function(m, n){
    var L = { svm:[0x2A2A2C, 0.3, 0.38, 0.5], tube:[0x202022, 0.3, 0.4, 0.5], fpa:[0x2A2A2C, 0.3, 0.38, 0.5], om:[0x4A4A4C, 0.2, 0.5, 0.4], solar:[0x4C4A3C, 0.05, 0.6, 0.25], mirrors:[0xB8964A, 0.55, 0.4, 0.6] }[n] || [0x2A2A2C, 0.3, 0.4, 0.5];
    m.color.setHex(L[0]); m.metalness = L[1]; m.roughness = L[2]; m.userData.envK = L[3];
  },
  tess: function(m, n, THREE){
    if (/reflector|foil_silver/.test(n) && m.map){ m.normalMap = m.map; m.map = null; if (THREE.LinearEncoding != null) m.normalMap.encoding = THREE.LinearEncoding; m.normalScale.set(0.4, 0.4); m.needsUpdate = true; }
    if (/foil_silver/.test(n)){ m.color.setHex(0xB9BDC2); m.metalness = 0.55; m.roughness = 0.5; }
    else if (/reflector/.test(n)){ m.color.setHex(0xD8D9DA); m.metalness = 0.1; m.roughness = 0.6; }
    if (m.userData.envK == null) m.userData.envK = 0.5;
  },
  jwst: function(m, n){
    if (/TopReflector|mirror|gold-nofoil|JWST-gold/.test(n)){ m.color.setRGB(1.0, 0.74, 0.32); m.metalness = 0.88; m.roughness = 0.3; }
    else if (/FoilLayer[1-4]/.test(n)){ m.color.setRGB(0.42, 0.44, 0.50); m.metalness = 0.9; m.roughness = 0.45; }
    else if (/PURPLEY/.test(n)){ m.metalness = 0.75; m.roughness = 0.36; }
    else if (/silver/.test(n)){ m.metalness = 0.9; m.roughness = 0.34; }
    else if (/SolarPanel/.test(n)){ m.metalness = 0.4; m.roughness = 0.32; }
    else if (/black/.test(n)){ m.roughness = 0.7; m.metalness = 0.2; }
    else if (/bronze|sa_edge/.test(n)){ m.metalness = 0.9; m.roughness = 0.35; }
  },
  hubble: function(m, n, THREE){
    if (/foil_silver|shiny/.test(n)){ m.metalness = Math.max(m.metalness, 0.85); m.roughness = Math.min(m.roughness, 0.34); }
  },
  gaia: function(m, n, THREE){
    if (/Gold|Aluminum|Metal/.test(n)){ m.metalness = Math.max(m.metalness, 0.75); m.roughness = Math.min(m.roughness, 0.45); }
    if (/SolarArray/.test(n)){ m.metalness = 0.35; m.roughness = 0.35; }
  },
  roman: function(m, n, THREE){
    /* Les couleurs du fichier NASA sont des valeurs sRGB que le chargeur lit comme linéaires :
       sous la lumière du site, tout virait au blanc. On les reconvertit, puis : cellules solaires
       sombres et mates, couvertures argentées, structure gris foncé. */
    if (/solar\d|solartop/.test(n)){
      m.color.setHex(/top/.test(n) ? 0x1A1E26 : 0x0B1638); m.metalness = 0; m.roughness = /top/.test(n) ? 1 : 0.7; m.userData.envK = 0.25; m.side = THREE.DoubleSide;
      if (/top/.test(n)){ m.polygonOffset = true; m.polygonOffsetFactor = 2; m.polygonOffsetUnits = 2; }   /* les cellules, coplanaires, passent devant le support */
    }
    else if (/lens/.test(n)){ m.color.setHex(0xC9CED4); m.metalness = 0.9; m.roughness = 0.2; }
    else if (/bronze/.test(n)){ m.color.setHex(0xA8834A); m.metalness = 0.8; m.roughness = 0.4; }
    else if (/silver1|rear-side-panels|Instrument1/.test(n)){ m.color.setHex(0xB4B8BC); m.metalness = 0.6; m.roughness = 0.45; }
    else if (/hood/.test(n)){ m.color.setHex(0xC4C8CC); m.metalness = 0.7; m.roughness = 0.35; }   /* pare-soleil : couvertures argentées */
    else { m.metalness = Math.min(m.metalness, 0.4); m.roughness = Math.max(m.roughness, 0.6); }
    m.color.convertSRGBToLinear();
  },
  euclid: function(m, n, THREE){
    m.metalness = Math.min(m.metalness, 0.5); m.roughness = Math.max(0.5, Math.min(m.roughness, 0.75)); m.color.multiplyScalar(0.78);
  }
};
