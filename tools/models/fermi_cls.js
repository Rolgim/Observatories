// Fermi (maquette NASA 3D Resources « Fermi Gamma-ray Large Area Space Telescope », unités de la maquette, ≈ 0,24 m par unité).
// Axe du LAT = +Y (capot blanc en haut) ; panneaux solaires le long de ±Z (nœud Layer_1) ; antenne Ku sur un mât, sous le module.
// GBM : 12 détecteurs NaI (faces de Ø ≈ 0,48 unité, par groupes de trois aux coins et sur les côtés) et 2 BGO (sur deux côtés opposés).
const NAI = [[3.38,-1.08,1.69],[-3.38,-1.08,-1.69],[2.95,-0.83,-2.54],[-2.95,-0.83,2.54],[3.44,-1.03,-1.91],[-3.44,-1.03,1.91],[3.08,-1.79,-2.4],[-3.08,-1.79,2.4],
             [3.36,-1.55,1.68],[3.0,-1.11,2.24],[-3.36,-1.55,-1.68],[-3.0,-1.11,-2.24],[4.06,-2.24,0.27],[4.06,-2.24,-0.27],[-4.06,-2.24,0.27],[-4.06,-2.24,-0.27]];
const BGO = [[2.95,-2.26,0],[-2.95,-2.26,0]];
const near = (c, list, r) => list.some(p => Math.hypot(c[0]-p[0], c[1]-p[1], c[2]-p[2]) < r);
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr; const m = (mat || '').toLowerCase();
  if (node === 'Layer_1') return 'solar';                                       // deux ailes de panneaux solaires
  if (node === 'Layer_2' || cy > 0.75) return 'lat';                            // capot et tours du LAT
  if (near(c.ctr, NAI, 0.36) || near(c.ctr, BGO, 0.34)) return 'gbm';          // détecteurs du GBM
  if (cy < -4.0 && Math.abs(cx + 1.8) < 0.7) return 'ku';                       // antenne en bande Ku et son mât
  return 'bus';                                                                 // module de service
};
