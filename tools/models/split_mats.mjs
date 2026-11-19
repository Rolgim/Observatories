// Donne à chaque pièce son propre matériau (copie du matériau partagé, nommé « <pièce> ») : utile quand une maquette n'a qu'un matériau,
// pour que src/looks.js puisse régler chaque pièce. Usage : node split_mats.mjs entrée.glb sortie.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [,, inp, out] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp);
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  for (const prim of mesh.listPrimitives()) { const m = prim.getMaterial(); if (m) prim.setMaterial(m.clone().setName(node.getName())); }
}
await io.write(out, doc);
