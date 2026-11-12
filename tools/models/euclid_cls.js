// Euclid (normalised units, height ≈ 1, +Y up). Sunshield plane normal n.
const n = (() => { const v=[-0.44,0,0.9], l=Math.hypot(...v); return v.map(x=>x/l); })();
module.exports = function classify(c){
  const [cx,cy,cz] = c.ctr; const r = Math.hypot(cx,cz);
  // farthest extent of the island along the sunshield normal (bbox corners)
  let dmax=-1e9; for (const x of [c.min[0],c.max[0]]) for (const z of [c.min[2],c.max[2]]) dmax=Math.max(dmax,x*n[0]+z*n[2]);
  const dc = cx*n[0]+cz*n[2];
  if (dmax > 0.21 && c.max[1] > 0.05 && dc > 0.10) return 'sunshield';
  if (cy < -0.365) { if (r < 0.09) return 'adapter'; if (r > 0.22) return (c.max[1]-c.min[1]) > 0.06 ? 'hga' : 'svm'; return 'svm'; }
  if (cy < -0.205) return 'svm';
  if (cy < -0.03) return 'instr';
  return 'baffle';
};
