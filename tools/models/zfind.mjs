// node zfind.mjs in.glb [tol_m]  — faces coplanaires et superposées entre maillages différents (cause du scintillement en 3D)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
const [src, tolS] = process.argv.slice(2); const tol = +(tolS || 2e-4);
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(src);
await doc.transform(dequantize());
const P = new Map();
function mul(m, v){ return [m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12], m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]]; }
for (const n of doc.getRoot().listNodes()){
  const me = n.getMesh(); if (!me) continue; const W = n.getWorldMatrix();
  for (const p of me.listPrimitives()){
    const pos = p.getAttribute('POSITION'), idx = p.getIndices(), N = idx ? idx.getCount() : pos.getCount(), v = [0,0,0];
    const V = i => { pos.getElement(i, v); return mul(W, v); };
    for (let t = 0; t + 2 < N; t += 3){
      const a = V(idx ? idx.getScalar(t) : t), b = V(idx ? idx.getScalar(t+1) : t+1), c = V(idx ? idx.getScalar(t+2) : t+2);
      const u = [b[0]-a[0], b[1]-a[1], b[2]-a[2]], w = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
      let nx = u[1]*w[2]-u[2]*w[1], ny = u[2]*w[0]-u[0]*w[2], nz = u[0]*w[1]-u[1]*w[0]; const l = Math.hypot(nx, ny, nz); if (l < 1e-9) continue;
      nx /= l; ny /= l; nz /= l; const area = l/2;
      const s = [nx, ny, nz][[nx, ny, nz].map(Math.abs).indexOf(Math.max(Math.abs(nx), Math.abs(ny), Math.abs(nz)))] < 0 ? -1 : 1;
      const d = s*(nx*a[0] + ny*a[1] + nz*a[2]);
      const key = [s*nx, s*ny, s*nz].map(x => Math.round(x*200)).join(',') + '|' + Math.round(d/tol);
      const cx = (a[0]+b[0]+c[0])/3, cy = (a[1]+b[1]+c[1])/3, cz = (a[2]+b[2]+c[2])/3;
      if (!P.has(key)) P.set(key, new Map()); const m = P.get(key), k = me.getName();
      const e = m.get(k) || { area:0, lo:[1e9,1e9,1e9], hi:[-1e9,-1e9,-1e9], n:[nx,ny,nz] }; e.area += area;
      [cx, cy, cz].forEach((x, i) => { e.lo[i] = Math.min(e.lo[i], x); e.hi[i] = Math.max(e.hi[i], x); }); m.set(k, e);
    }
  }
}
const out = [];
for (const [key, m] of P){ if (m.size < 2) continue; const es = [...m.entries()];
  for (let i = 0; i < es.length; i++) for (let j = i+1; j < es.length; j++){
    const A = es[i][1], B = es[j][1], ov = [0,1,2].every(k => A.lo[k] <= B.hi[k] + tol && B.lo[k] <= A.hi[k] + tol);
    if (ov) out.push([Math.min(A.area, B.area), key, es[i][0], es[j][0], A.n.map(x=>+x.toFixed(2)), B.n.map(x=>+x.toFixed(2))]); } }
out.sort((a, b) => b[0] - a[0]); out.slice(0, 15).forEach(o => console.log(o[0].toFixed(4), o[1], o[2], o[4].join(','), '|', o[3], o[5].join(',')));
