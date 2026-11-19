// Kepler (maquette NASA 3D Resources « Kepler (A) », Blender, en mètres : 4,7 m de haut sans l'antenne).
// Axe du photomètre = +Y ; module hexagonal en bas ; panneaux solaires fixes côté -X (face au Soleil) ; antenne grand gain sous le module, côté -Z.
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr;
  if (/dish_AO/.test(mat)) return 'hga';                                                     // réflecteur de l'antenne et ses supports
  if (mat === 'foil_gold' && cy < -1.5 && cz < -0.8 && cx < 0.3 && cx > -0.7) return 'hga';  // dos de l'antenne et son mât
  if (mat === 'shiny_panel' && cy > -1.3) return 'solar';                                    // quatre panneaux fixes
  if (cy > -1.3) return 'phot';                                                              // photomètre : tube, pare-soleil, baffles
  return 'bus';                                                                              // module, propulsion, roues, viseurs
};
