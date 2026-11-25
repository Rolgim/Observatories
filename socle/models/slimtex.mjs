// Comme slim.mjs, mais garde les coordonnées de texture (VEX : maquette OBJ très dense et texturée).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, normals, prune, dedup, quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
const [src, dst, ratio, err] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) p.setAttribute('NORMAL', null);
await MeshoptSimplifier.ready;
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +ratio, error: +err, lockBorder: false }), normals({ overwrite: true }), dedup(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
await io.write(dst, doc);
