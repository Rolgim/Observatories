// Retire toutes les textures d'une maquette (ex. KTX2 que le site ne décode pas) et règle des couleurs de base par matériau.
// node notex.mjs in.glb out.glb '{"matériau": [r, g, b, métal, rugosité]}' ['{"nœud": [r, g, b, métal, rugosité]}']
// (le second jeu donne à toutes les primitives d'un nœud — une pièce après seg_lib — un matériau propre de cette couleur)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
const [src, dst, js, jn] = process.argv.slice(2); const col = JSON.parse(js || '{}'), byNode = JSON.parse(jn || '{}');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const doc = await io.read(src);
for (const m of doc.getRoot().listMaterials()){
  m.setBaseColorTexture(null).setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
  const c = col[m.getName()]; if (c) m.setBaseColorFactor([c[0], c[1], c[2], 1]).setMetallicFactor(c[3]).setRoughnessFactor(c[4]);
}
for (const n of doc.getRoot().listNodes()){ const c = byNode[n.getName()]; if (!c || !n.getMesh()) continue;
  const m = doc.createMaterial(n.getName()).setBaseColorFactor([c[0], c[1], c[2], 1]).setMetallicFactor(c[3]).setRoughnessFactor(c[4]).setDoubleSided(true);
  n.getMesh().listPrimitives().forEach(p => p.setMaterial(m)); }
doc.getRoot().listExtensionsUsed().forEach(e => { if (/basisu|draco/.test(e.extensionName)) e.dispose(); });
await doc.transform(prune()); await io.write(dst, doc); console.log('ok', dst);
