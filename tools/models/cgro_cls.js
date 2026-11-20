// Compton Gamma Ray Observatory (maquette NASA 3D Resources « Gamma Ray Observatory », unités de la maquette ; matériaux nommés).
// Axe +Y = direction de visée des instruments ; module allongé selon X, panneaux solaires selon ±Z, antenne grand gain sur un mât vers −Y.
// Sur le dessus, de +X vers −X : EGRET (dôme à x ≈ 0,33), COMPTEL (dôme à x ≈ 0,05), OSSE (bosse à x ≈ −0,3) ; BATSE aux huit coins.
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr;
  if (/SolarPanel/.test(mat)) return 'solar';
  if (/BatseSensor/.test(mat) && (Math.abs(cz) > 0.2 || cy < 0.1)) return 'batse';
  if (/EgretDome/.test(mat)) return 'egret';
  if (/ComptelDome/.test(mat)) return 'comptel';
  if (/humpy/.test(mat)) return 'osse';
  if (cy < -0.08) return 'hga';
  if (cy > 0.12 && Math.abs(cz) < 0.33){
    if (cx > 0.2) return 'egret';
    if (cx > -0.1) return 'comptel';
    if (cx > -0.5) return 'osse';
  }
  return 'bus';
};
