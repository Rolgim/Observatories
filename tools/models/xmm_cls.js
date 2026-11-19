// XMM-Newton (maquette du service SPICE de l'ESA, pour Cosmographia ; un seul maillage, une texture).
// Axe optique = Z ; les miroirs sont en +Z (avant), le plan focal en -Z ; ailes solaires le long de X.
module.exports = function classify(c){
  const [cx, cy, cz] = c.ctr;
  if (Math.abs(cx) > 1.4 && Math.abs(cy + 0.42) < 0.1) return 'solar';                                // deux ailes de trois panneaux
  if (cz < -4.9 && c.tris !== 5120) return 'fpa';                                                    // plan focal : EPIC, RGS, radiateurs
  if (c.tris === 5120 || (cz < -0.7 && cz > -4.9)) return 'tube';                                    // tube du télescope, en fibre de carbone
  if (Math.abs(cx + 0.69) < 0.1 && Math.abs(cy + 0.67) < 0.1 && cz > 0.45) return 'om';             // moniteur optique
  if (cz > 0.45 && cz < 1.0 && Math.abs(cx) < 1.3 && cy < 0.4 && cy > -1.3) return 'mirrors';       // trois modules de miroirs et leurs portes
  return 'svm';                                                                                      // module de service, pare-soleil, viseurs
};
