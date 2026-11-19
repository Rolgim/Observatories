/* =================================================================
   RENDU DES MATÉRIAUX — réglages propres à chaque maquette, appliqués au chargement.
   m : matériau three.js (MeshStandardMaterial), n : son nom dans le fichier 3D.
================================================================= */
var LOOKS = {
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
