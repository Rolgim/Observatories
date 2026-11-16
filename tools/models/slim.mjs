import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, normals, prune, dedup, quantize, unweld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
const [src, dst, ratio, err, minSize] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
// drop tiny islands is done upstream; here: positions only, weld, simplify, smooth normals with crease handled by unweld threshold
for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) { for (const s of p.listSemantics()) if (s !== 'POSITION') p.setAttribute(s, null); }
await MeshoptSimplifier.ready;
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +ratio, error: +err, lockBorder: false }), unweld(), normals({ overwrite: true }), weld(), dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10 }));
await io.write(dst, doc);
