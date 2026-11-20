// Swift (maquette NASA 3D Resources « Swift », LightWave → Blender, unités de la maquette ; axe +Y = direction de visée).
// Plateau des instruments à y ≈ 4 ; au-dessus : BAT (boîte trapézoïdale, masque codé en haut, plan de détecteurs CZT à y ≈ 5,5),
// XRT (tube de 3,1 unités de diamètre centré en x ≈ -2,6, le plus long) et UVOT (tube de 2,5 unités en x ≈ 2,1) côté +Z ;
// module octogonal en dessous ; deux ailes de panneaux solaires de part et d'autre (±X).
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr;
  if (/Solar/i.test(mat)) return 'solar';
  if (/telescope/i.test(mat)) {
    if (cx > -4.1 && cx < -1) return 'xrt';
    if (cx > 0.5 && cx < 3.7) return 'uvot';
    if (cx < -3.9 && cz > 2.5) return 'bus';                  // viseurs d'étoiles (x ≈ -4,5)
    return cy > 4 ? 'bat' : 'bus';                            // bandes du radiateur et flanc de BAT
  }
  if (/Sbox|radiator/.test(mat) && cy > 4) return 'bat';      // boîte, masque codé, détecteurs, radiateur
  if (/sh(ei|ie)ld/i.test(mat)) return 'shade';         // écrans autour des ouvertures de XRT et UVOT
  return 'bus';
};
