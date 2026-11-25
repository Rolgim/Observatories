/* Petit serveur statique commun aux tests (smoke.js, a11y.js, i18n-scan.js, shot.js) ; lit site.json du site. */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
const TYPES = { '.html':'text/html', '.glb':'model/gltf-binary', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png', '.txt':'text/plain', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml' };
module.exports = port => http.createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT)) { s.writeHead(403); return s.end(); }
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'content-length': d.length }); s.end(d); });
}).listen(port);
module.exports.ROOT = ROOT;
module.exports.SITE = SITE;
/* hors ligne (VENDOR=/chemin) : chaque script externe de site.json est servi depuis VENDOR/<nom du fichier> ; le reste est coupé, polices comprises */
module.exports.offline = async (pg, port) => {
  const V = process.env.VENDOR, LOCAL = SITE.scripts.map(u => path.basename(u));
  await pg.route('**/*', r => { const u = r.request().url();
    const hit = V && LOCAL.find(n => u.includes(n));
    if (hit) return r.fulfill({ path: path.join(V, hit), contentType: 'text/javascript' });
    if (V && u.includes('fonts.googleapis')) return r.fulfill({ contentType: 'text/css', body: '' });
    return u.startsWith('http://localhost:' + port) || !V ? r.continue() : r.abort(); });
};
/* langue du site imposée une fois par onglet (le site est en anglais par défaut ; le bouton de langue reste libre ensuite) */
const KEY = SITE.langKey, TKEY = SITE.langKey.replace(/lang$/, 'test-lang');
module.exports.lang = (pg, l) => pg.addInitScript(([l, KEY, TKEY]) => { try { if (!sessionStorage.getItem(TKEY)){ localStorage.setItem(KEY, l); sessionStorage.setItem(TKEY, '1'); } } catch(e){} }, [l, KEY, TKEY]);
