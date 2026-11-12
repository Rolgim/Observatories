// Re-segment a GLB into named physical parts: classify each connected island, emit one node per (class, material).
const { NodeIO } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { prune } = require('@gltf-transform/functions');
async function load(src){ const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); return { io, doc: await io.read(src) }; }
function collect(doc){
  const prims = [];
  doc.getRoot().listNodes().forEach(node => {
    const mesh = node.getMesh(); if (!mesh) return;
    const M = node.getWorldMatrix();
    mesh.listPrimitives().forEach(prim => {
      const pos = prim.getAttribute('POSITION'), nor = prim.getAttribute('NORMAL'), uv = prim.getAttribute('TEXCOORD_0');
      const idx = prim.getIndices(); const n = pos.getCount();
      const ia = idx ? idx.getArray() : null; const T = ia ? ia.length : n;
      const parent = new Int32Array(n).map((_, i) => i);
      const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
      // weld identical positions first so islands follow geometry, not UV seams
      const key = new Map(); const v = [0,0,0], nv = [0,0,0], uvv = [0,0];
      const W = new Array(n), Nn = new Array(n), U = new Array(n);
      for (let i = 0; i < n; i++) {
        pos.getElement(i, v);
        const x = M[0]*v[0]+M[4]*v[1]+M[8]*v[2]+M[12], y = M[1]*v[0]+M[5]*v[1]+M[9]*v[2]+M[13], z = M[2]*v[0]+M[6]*v[1]+M[10]*v[2]+M[14];
        W[i] = [x,y,z];
        if (nor) { nor.getElement(i, nv); const nx = M[0]*nv[0]+M[4]*nv[1]+M[8]*nv[2], ny = M[1]*nv[0]+M[5]*nv[1]+M[9]*nv[2], nz = M[2]*nv[0]+M[6]*nv[1]+M[10]*nv[2]; const l = Math.hypot(nx,ny,nz)||1; Nn[i] = [nx/l,ny/l,nz/l]; } else Nn[i] = [0,1,0];
        if (uv) { uv.getElement(i, uvv); U[i] = [uvv[0], uvv[1]]; } else U[i] = [0,0];
        const k = x.toFixed(5)+','+y.toFixed(5)+','+z.toFixed(5);
        const o = key.get(k); if (o === undefined) key.set(k, i); else parent[find(i)] = find(o);
      }
      for (let t = 0; t < T; t += 3) { const a = ia?ia[t]:t, b = ia?ia[t+1]:t+1, c = ia?ia[t+2]:t+2; parent[find(b)] = find(a); parent[find(c)] = find(a); }
      const comp = new Map();
      for (let i = 0; i < n; i++) { const r = find(i); let c = comp.get(r); if (!c) { c = { sum:[0,0,0], nv:0, min:[1e9,1e9,1e9], max:[-1e9,-1e9,-1e9], tris:0 }; comp.set(r, c); }
        for (let k=0;k<3;k++){ c.sum[k]+=W[i][k]; c.min[k]=Math.min(c.min[k],W[i][k]); c.max[k]=Math.max(c.max[k],W[i][k]); } c.nv++; }
      for (let t = 0; t < T; t += 3) comp.get(find(ia?ia[t]:t)).tris++;
      for (const c of comp.values()) c.ctr = c.sum.map(s => s/c.nv);
      prims.push({ node: node.getName(), prim, W, Nn, U, ia, T, find, comp, mat: prim.getMaterial() });
    });
  });
  return prims;
}
async function segment(src, dst, classify){
  const { io, doc } = await load(src); const root = doc.getRoot(); const buffer = root.listBuffers()[0];
  const prims = collect(doc); const buckets = new Map(); const stats = {};
  for (const p of prims) {
    const cls = new Map(); for (const [r, c] of p.comp) cls.set(r, classify(c, p.node, p.mat ? p.mat.getName() : ''));
    for (let t = 0; t < p.T; t += 3) {
      const tri = [p.ia?p.ia[t]:t, p.ia?p.ia[t+1]:t+1, p.ia?p.ia[t+2]:t+2];
      const k = cls.get(p.find(tri[0])); const key = k + '|' + (p.mat ? p.mat.getName() : '');
      let bk = buckets.get(key); if (!bk) { bk = { cls:k, mat:p.mat, pos:[], nor:[], uv:[], idx:[], local:new Map() }; buckets.set(key, bk); }
      for (const vi of tri) { const lk = prims.indexOf(p) + ':' + vi; let li = bk.local.get(lk);
        if (li === undefined) { li = bk.pos.length/3; bk.local.set(lk, li); bk.pos.push(...p.W[vi]); bk.nor.push(...p.Nn[vi]); bk.uv.push(...p.U[vi]); }
        bk.idx.push(li); }
      stats[k] = (stats[k]||0) + 1;
    }
  }
  root.listScenes().forEach(s => s.listChildren().forEach(ch => s.removeChild(ch)));
  root.listNodes().forEach(n => n.dispose()); root.listMeshes().forEach(m => m.dispose());
  const scene = root.listScenes()[0]; let bi = 0;
  for (const bk of buckets.values()) {
    const mesh = doc.createMesh(bk.cls + '_' + (bi++));
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(bk.pos)).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(bk.nor)).setBuffer(buffer))
      .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(bk.uv)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(bk.pos.length/3 > 65535 ? new Uint32Array(bk.idx) : new Uint16Array(bk.idx)).setBuffer(buffer));
    if (bk.mat) prim.setMaterial(bk.mat);
    mesh.addPrimitive(prim); scene.addChild(doc.createNode(bk.cls).setMesh(mesh));
  }
  await doc.transform(prune()); await io.write(dst, doc);
  return stats;
}
module.exports = { load, collect, segment };
