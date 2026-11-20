// WMAP (maquette NASA 3D Resources « Wilkinson Microwave Anisotropy Probe », unités de la maquette ≈ 1,8 cm : 278 de diamètre pour 5,0 m).
// Axe +Y = haut, à l'opposé du Soleil. Écran solaire et panneaux en bas (y ≈ −67), module hexagonal au-dessus, puis la structure
// en tube qui porte l'instrument : deux miroirs primaires dos à dos (±Z), secondaires, cornets et radiomètres au centre.
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr;
  if (/MAP-BigBaseBottom/.test(mat)) return null;                 // face inférieure doublée, au même niveau que l'écran : écartée (scintillement après allègement)
  if (/^MAP-BigBase|BlackSmooth|^deflectors$|MAP-InstrumentBaseBottom|MAP-NotHoles|MAP-SupportBrackets$/.test(mat) && cy < -60) return 'solar';
  if (/^dish|Antennae|DishBrkts|DishMounts|SensorAssyDishInsides|SensorAssyDishBackFlat/.test(mat) && cy > 2) return 'optics';
  if (/SensorAssy(?!Base)|SensorEnds|SensorSides|SensorArrayNewSides|SensorAssyBox|deflectorsConnectors|SupportRod|triangle shield|InstrumentBottomfaces|InstrumentBoxCover/.test(mat) && cy > 0) return 'fpa';
  if (cy > -18) return 'rad';                                   // radiateurs passifs (grands panneaux blancs) et structure
  return 'bus';
};
