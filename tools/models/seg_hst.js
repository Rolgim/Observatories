const { segment } = require('./seg_lib.js');
function classify(c, node){
  const [cx, cy, cz] = c.ctr;
  if (node === 'alpha_tex01') return 'logo';
  if (cx > 0.50) return 'array_stbd';
  if (cx < -0.50) return 'array_port';
  if (cy > 0.60 && Math.abs(cx) < 0.5) return 'hga_top';
  if (cy < -0.60 && Math.abs(cx) < 0.5) return 'hga_bottom';
  if (cz > 1.25) return 'door';
  if (cz > 0.35) return 'ota';
  if (cz > -0.35) return 'ssm';
  return 'aft';
}
segment('hst_tex.glb', 'hst_seg.glb', classify).then(s => console.log(JSON.stringify(s))).catch(e => { console.error(e); process.exit(1); });
