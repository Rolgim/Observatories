/* Assemble le site à partir de src/.
   node build.js           -> index.html (site autonome, maquettes en models/*.glb) : c'est ce que sert GitHub Pages
   node build.js artifact  -> dist/index.html + dist/models/*.txt (variante pour un hébergeur qui ne sert pas les .glb :
                              page sans <html>/<head>, maquettes encodées en base64) */
const fs = require('fs'), path = require('path');
const r = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const NAMES = ['hubble', 'jwst', 'euclid', 'gaia'];
const artifact = process.argv[2] === 'artifact';

let data = r('data-tele.js');
for (const n of NAMES) {
  const size = fs.statSync(path.join(__dirname, 'models', n + '.glb')).size;
  const re = new RegExp("file:'models/" + n + "\\.(?:glb|txt)', bytes:\\d+");
  if (!re.test(data)) throw new Error('entrée de maquette introuvable : ' + n);
  data = data.replace(re, artifact ? "file:'models/" + n + ".txt', bytes:" + Math.ceil(size / 3) * 4 : "file:'models/" + n + ".glb', bytes:" + size);
}

const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=IBM+Plex+Mono:wght@400;500&display=swap">';
const style = '<style>\n' + r('style.css') + '\n' + r('inst.css') + '\n</style>';
const scripts = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n' +
  '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>\n' +
  '<script>\n' + r('lang.js') + '\n' + data + '\n' + r('data-inst.js') + '\n' + r('optics.js') + '\n' + r('orbits.js') + '\n' + r('inst-render.js') + '\n' + r('en/tele.js') + '\n' + r('en/inst.js') + '\n' + r('en/more.js') + '\n' + r('en/ui.js') + '\n' + r('i18n.js') + '\n' + r('app.js') + '\n</script>\n';

if (artifact) {
  const out = path.join(__dirname, 'dist');
  fs.mkdirSync(path.join(out, 'models'), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), '<title>Observatoires en orbite</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' + fonts + '\n' + style + '\n' + r('body.html') + scripts);
  for (const n of NAMES) fs.writeFileSync(path.join(out, 'models', n + '.txt'), fs.readFileSync(path.join(__dirname, 'models', n + '.glb')).toString('base64'));
  console.log('dist/index.html');
} else {
  fs.writeFileSync(path.join(__dirname, 'index.html'),
    '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<meta name="description" content="Hubble, JWST, Euclid et Gaia en 3D : pièces cliquables, vue éclatée, comparaison à l\'échelle, instruments et archives.">\n' +
    '<title>Observatoires en orbite</title>\n' + fonts + '\n<style>[hidden]{display:none!important}</style>\n' + style + '\n</head>\n<body>\n' + r('body.html') + scripts + '</body>\n</html>\n');
  console.log('index.html');
}
