// Spitzer (maquette NASA 3D Resources « Spitzer Space Telescope », Blender, mètres).
// Axe du télescope = +Y (ouverture en haut) ; module de service et antenne en bas ; panneau solaire et pare-soleil côté −Z.
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr; const m = (mat || '').toLowerCase(); const r = Math.hypot(cx, cz);
  if (m.startsWith('dish')) return 'hga';                                                      // antenne grand gain, fixe, sous le module
  if (m.includes('solar') || cz < -0.62) return 'solar';                                       // panneau solaire et pare-soleil
  if (cy < -0.36) return 'bus';                                                                // module de service octogonal
  if ((m.startsWith('mirror') || m.includes('tube inside')) && cy > 1.4 && r < 0.5) return 'tele';   // primaire, secondaire et chicanes
  return 'cta';                                                                                // enveloppe du cryostat et du télescope
};
