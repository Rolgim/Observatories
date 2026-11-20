// INTEGRAL (maquette ESA SCIFLEET, « integral.obj », une texture ; unités de la maquette en pouces : 629 d'envergure pour 16 m).
// Axe +Y = direction de visée. Module de service en bas (y < −45 : réservoirs, roues, électronique), panneaux solaires de part et d'autre (±X).
// Module de charge utile au-dessus : SPI (cylindre côté +Z, masque à y ≈ 50), IBIS (caisson côté −Z, masque à y ≈ 89),
// les deux JEM-X entre les deux (masques circulaires à y ≈ 95, x ≈ ±10), OMC sur le flanc −X (x ≈ −29), viseurs d'étoiles sur le flanc +X.
module.exports = function classify(c){
  const [cx, cy, cz] = c.ctr;
  if (Math.abs(cx) > 60) return 'solar';
  if (cy < -45) return 'svm';
  if (cx < -22 && cx > -36 && cy > 55) return 'omc';
  if (Math.abs(cx) > 24) return 'svm';                                   // viseurs d'étoiles, supports
  if (cy > 92 && cz > -18 && cz < 4) return 'jemx';
  if (cz > 7) return 'spi';
  return 'ibis';
};
