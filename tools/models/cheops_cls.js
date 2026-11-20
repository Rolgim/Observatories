// CHEOPS (maquette ESA SCIFLEET, « cheops.obj », en millimètres : ≈ 1,55 m de haut). Le .mtl n'est pas distribué : les neuf matériaux
// ont été rattachés aux cinq textures d'après la part de leurs coordonnées de texture qui tombe sur une zone peinte de chaque image.
// Télescope couché selon +X, axe à y ≈ 330 (baffle, puis ouverture et couvercle ouvert à x ≈ 720) ; panneaux solaires côté −X et en toit ;
// plateforme en dessous (anneau d'adaptation à y ≈ −600).
module.exports = function classify(c, node){
  const [cx, cy] = c.ctr;
  if (node === 'lambert2SG' || (node === 'lambert4SG' && cy > 600)) return 'solar';     // panneaux sur trois côtés, qui font écran au Soleil
  if (cx > 50 && cy > 20) return 'tele';
  return 'bus';
};
