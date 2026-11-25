/* Assemble le site à partir de src/ avec la construction du socle commun (socle/, copie de Rolgim/rolgim.github.io, voir socle/README.md).
   node build.js           -> index.html (ce que sert GitHub Pages)
   node build.js artifact  -> dist/index.html + dist/models/*.txt (variante pour un hébergeur qui ne sert pas les .glb)
   Réglages propres au site : site.json. Observatories garde pour l'instant sa propre page (src/) : seuls la construction et les outils viennent du socle. */
require('./socle/build.js')(__dirname);
