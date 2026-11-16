// Roman (maquette NASA « Nancy Grace Roman Space Telescope (A) », conception AFTA 2015).
// Axe du télescope = X, ouverture vers -X ; +Y = côté du panneau solaire et pare-soleil (SASS). Unités d'origine (≈ 3,3 cm).
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr; const m = mat.toLowerCase();
  if (m.includes('solar')) return 'sass';
  if (m.includes('rear-dish') || (cx > 140 && cy > 20)) return 'hga';
  if (m.includes('grey') && cy < -44 && cx < -20 && cx > -115) return 'cover';        // couvercle d'ouverture, ouvert sous le pare-soleil
  if (m.includes('lens') || m.includes('hood') || m.includes('black-sm') || (m.includes('blackout') && cx < -20)) return 'ota';
  if (m.includes('schnoozle') || cx < -20) return 'barrel';
  if (cx > 85) return 'bus';                                                            // module de service hexagonal, à l'arrière
  return 'instr';
};
