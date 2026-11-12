// JWST classification: +Y = up (mirror above sunshield), +Z = mirror boresight side, sunshield long axis = Z
module.exports = function classify(c, node, mat){
  const [cx, cy, cz] = c.ctr; const m = mat.toLowerCase();
  if (cz < -9.3 && Math.abs(cx) < 1.3) return 'flap';
  if (c.max[0] < 1.0 && c.min[0] > -1.0 && c.min[1] > 2.3 && c.max[1] < 4.6 && cz > 1.15 && cz < 3.4 && c.max[2] < 4 && !m.includes('bracket2')) return 'aos';
  if ((m.includes('mirror') || m.includes('gold-fl')) && cz > 7) return 'secondary';
  if (m.includes('topreflector')) return cz < 2.2 ? 'primary' : 'secondary';
  if (m.includes('foil') && !m.includes('silverfoil')) return 'sunshield';
  if (m.includes('solarpanel') || m.includes('sa_edge')) return 'solar';
  if (cy < -2.6) return 'hga';
  if (cy > 0.35 && Math.abs(cz) < 9 && Math.abs(cx) < 3.4 && (cz > 1.9 || (Math.abs(cz) < 2.7))) {
    if (cz > 1.9) return (cy > 0.2 && cz < 8.7) ? 'secondary' : 'sunshield';
    if (m.includes('black') || m.includes('silverfoil') || m.includes('grey')) return 'isim';
    return cz > 0.9 ? 'primary' : 'isim';
  }
  if (cy <= 0.35) {
    if (cz < -1.9 && cz > -7.6 && cy < -0.3 && Math.abs(cx) < 1.3 && c.max[1] < 0.2) return 'solar';
    if (Math.abs(cx) < 1.75 && cz > -2.5 && cz < 2.3 && cy < -0.95) return 'bus';
    if (Math.abs(cx) < 1.3 && Math.abs(cz) < 1.3) return 'tower';
  }
  return 'sunshield';
};
