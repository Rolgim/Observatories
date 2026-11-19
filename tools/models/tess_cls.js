// TESS (maquette NASA 3D Resources « Transiting Exoplanet Survey Satellite (TESS) (B) », Blender, ≈ 0,53 m par unité).
// Axe des caméras = +Y ; pare-soleil conique au-dessus du module ; ailes solaires le long de ±X ; antenne grand gain côté +Z.
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr; const r = Math.hypot(cx, cz);
  if (Math.abs(cx) > 1.35) return 'solar';                                                   // deux ailes de panneaux solaires
  if (node === 'BUS' && cy > 0.9) return 'shade';                                            // pare-soleil conique
  if (cy > 0.95 && r < 1.0) return 'cams';                                                   // quatre caméras et leur plaque
  if (cz > 0.6 && Math.hypot(cx + 0.6, cy + 0.3, cz - 1.0) < 0.62) return 'hga';             // antenne en bande Ka et son trépied
  return 'bus';                                                                              // module LEOStar-2
};
