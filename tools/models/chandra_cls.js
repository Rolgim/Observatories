// Chandra (maquette NASA 3D Resources « Chandra X-ray Observatory », Blender, mètres).
// Axe optique = X, ouverture vers -X (porte du pare-soleil ouverte en bas, à l'avant) ; module des instruments (ISIM) vers +X.
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr; const m = (mat || '').toLowerCase(); const r = Math.hypot(cy, cz);
  if (m.includes('shiny_panel') || Math.abs(cz) > 1.95) return 'solar';                       // deux ailes de trois panneaux
  if (cx < -1.3 && cy < -0.5 && m.includes('foil_silver')) return 'door';                      // porte du pare-soleil, ouverte
  if (cx > 9.35) return 'isim';                                                                // module des instruments scientifiques
  if (m.includes('ao_hrma') && cx < 1.75 && r < 0.75) return 'hrma';                          // coquilles des miroirs
  if (m.includes('tex_01') && cx > 1.6 && cx < 1.75 && r < 0.2) return 'hrma';               // disque arrière du HRMA
  if (cx > 1.9) return 'oba';                                                                  // banc optique (tube de 10 m)
  return 'bus';                                                                                // module de service octogonal, autour des miroirs
};
