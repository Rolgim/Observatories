// Herschel (maquette ESA SCIFLEET, « herschel.obj » ; unités de la maquette, ≈ 2,5 cm : miroir de 142 pour 3,5 m). Axe +Y = haut.
// Module de service octogonal en bas (y < 36), cryostat au milieu, télescope au-dessus (primaire à y ≈ 154–179, secondaire à y ≈ 225),
// pare-soleil côté −Z, couvert de cellules solaires sur sa partie basse.
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr;
  if (mat === '02___Default') return 'shade';
  if (cy > 36 && (cz < -27 || cx < 17 || cx > 148)) return 'shade';
  if (cy < 36) return 'svm';
  if (cy > 145) return 'tele';
  return 'cryo';
};
