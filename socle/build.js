/* Construction commune des sites (socle). Appelé par le build.js de chaque site : require('./socle/build.js')(__dirname).
   Lit site.json à la racine du site, assemble src/ et socle/page/ en un seul index.html.
   node build.js           -> index.html (site autonome, maquettes en models/*.glb) : ce que sert GitHub Pages
   node build.js artifact  -> dist/index.html + dist/models/*.txt (variante pour l'artifact claude.ai, qui ne sert pas les .glb :
                              page sans <html>/<head>, maquettes encodées en base64)
   Dans les listes css et js de site.json : « socle:x » = socle/page/x ; « @data » = données réelles légères (data/*.json) ;
   « @registry » = le registre des maquettes (champ registry) ; tout autre nom = src/<nom>.
   Les jetons {{clé}} des fichiers du socle sont remplacés par la valeur de site.json (langKey, mark, mark3d). */
const fs = require('fs'), path = require('path');
module.exports = function build(ROOT, argv) {
  argv = argv || process.argv.slice(2);
  const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
  const tok = s => s.replace(/\{\{(\w+)\}\}/g, (m, k) => { if (S[k] == null) throw new Error('site.json : clé « ' + k + ' » manquante'); return S[k]; });
  const r = f => f.startsWith('socle:') ? tok(fs.readFileSync(path.join(__dirname, 'page', f.slice(6)), 'utf8')) : fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
  const artifact = argv[0] === 'artifact';

  /* registre : seules les entrées qui ont une maquette (champ file:'models/<id>.') en demandent une */
  const REG = r(S.registry.file);
  if (!new RegExp(S.registry.check).test(REG)) throw new Error('registre illisible : ' + S.registry.file);
  const NAMES = [...REG.matchAll(/^    id:'(\w+)'/gm)].map(m => m[1]).filter(n => new RegExp("file:'models/" + n + "\\.").test(REG));
  let reg = REG;
  for (const n of NAMES) {
    const size = fs.statSync(path.join(ROOT, 'models', n + '.glb')).size;
    const re = new RegExp("file:'models/" + n + "\\.(?:glb|txt)', bytes:\\d+");
    if (!re.test(reg)) throw new Error('entrée de maquette introuvable : ' + n);
    reg = reg.replace(re, artifact ? "file:'models/" + n + ".txt', bytes:" + Math.ceil(size / 3) * 4 : "file:'models/" + n + ".glb', bytes:" + size);
  }

  const fonts = S.fonts;
  const style = '<style>\n' + S.css.map(r).join('\n') + '\n</style>';
  /* données réelles légères (data/*.json) intégrées à la page : un artifact ne charge rien d'un autre site ; les images restent dans data/ */
  const DD = path.join(ROOT, 'data'), files = {};
  if (S.js.includes('@data'))
    for (const f of fs.readdirSync(DD).filter(f => f.endsWith('.json')).sort()) files[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(DD, f), 'utf8'));
  const part = f => f === '@data' ? 'var DATA_FILES = ' + JSON.stringify(files) + ';' : f === '@registry' ? reg : r(f);
  const scripts = S.scripts.map(u => '<script src="' + u + '"></script>\n').join('') +
    '<script>\n' + S.js.map(part).join('\n') + '\n</script>\n';
  const body = r('body.html');

  if (artifact) {
    const out = path.join(ROOT, 'dist');
    fs.mkdirSync(path.join(out, 'models'), { recursive: true });
    fs.writeFileSync(path.join(out, 'index.html'), '<title>' + S.artifactTitle + '</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' +
      '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,' + encodeURIComponent(fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8')) + '">\n' + fonts + '\n' + style + '\n' + body + scripts);
    for (const n of NAMES) fs.writeFileSync(path.join(out, 'models', n + '.txt'), fs.readFileSync(path.join(ROOT, 'models', n + '.glb')).toString('base64'));
    if (S.js.includes('@data')) {
      fs.mkdirSync(path.join(out, 'data'), { recursive: true });
      for (const f of fs.readdirSync(DD).filter(f => /\.(jpg|png)$/.test(f))) fs.copyFileSync(path.join(DD, f), path.join(out, 'data', f));
    }
    console.log('dist/index.html');
  } else {
    fs.writeFileSync(path.join(ROOT, 'index.html'),
      '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<meta name="description" content="' + S.description + '">\n' +
      '<title>' + S.title + '</title>\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n' + (S.headExtra || '') + '<meta name="theme-color" content="#14171A">\n' + fonts + '\n<style>[hidden]{display:none!important}</style>\n' + style + '\n</head>\n<body>\n' + body + scripts + '</body>\n</html>\n');
    console.log('index.html');
  }
};
