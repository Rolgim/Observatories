// Planck (maquette ESA SCIFLEET, « planck.obj », une texture ; axe +Y vers le télescope, unités de la maquette, ≈ 168 de haut pour 4,2 m).
// De bas en haut : panneau solaire circulaire (y ≈ −75), module de service octogonal, trois écrans en V (y ≈ −31 à −16),
// puis le télescope hors d'axe, son baffle et le plan focal.
module.exports = function classify(c){
  const [cx, cy, cz] = c.ctr, sx = c.max[0] - c.min[0], sz = c.max[2] - c.min[2];
  if (cy < -70 && Math.max(sx, sz) > 150) return 'solar';
  if (cy > -36 && cy < -10 && Math.max(sx, sz) > 120) return 'vgroove';
  if (cy > -12) return 'tele';
  return 'svm';
};
