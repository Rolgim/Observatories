// node zfix.mjs in.glb out.glb maillage:facteur ...  — grossit très légèrement, autour de l'origine de son nœud, un maillage
// dont les faces coïncident avec celles d'un autre (scintillement en 3D, repéré par zfind.mjs)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [src, dst, ...moves] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
for (const mv of moves){
  const [name, f] = mv.split(':');
  const nodes = doc.getRoot().listNodes().filter(n => n.getMesh() && n.getMesh().getName() === name);
  if (!nodes.length){ console.log('maillage absent', name); continue; }
  nodes.forEach(n => { n.setScale(n.getScale().map(s => s*(+f))); console.log('agrandi', name, f); });
}
await io.write(dst, doc);
