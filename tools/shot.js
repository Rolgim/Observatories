/* Captures d'écran et petits tests dans un vrai navigateur (Playwright + Chromium).
   Usage : node tools/shot.js '<étapes JSON>' [phone]
   Étapes : {go:"jwst"} ouvre #jwst · {wait:1} attend la fin du chargement de la maquette · {eval:"js"} affiche le résultat
            {click:[x,y]} · {sel:"css"} clique un élément · {ms:500} pause · {shot:"nom"} écrit shots/nom.png
   Dans une étape, l'ordre d'exécution est toujours : go, wait, eval, click, sel, ms, shot.
   Hors ligne : VENDOR=/chemin fournit three.min.js, GLTFLoader.js et archivo.woff2 à la place des CDN.
   window.__obs expose l'état de l'application (S, models, pick(x,y), current) pour les tests. */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), V = process.env.VENDOR, PORT = 8123;
const TYPES = { '.html':'text/html', '.glb':'model/gltf-binary', '.txt':'text/plain', '.js':'text/javascript', '.css':'text/css' };
const srv = http.createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'content-length': d.length }); s.end(d); });
}).listen(PORT);

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const steps = JSON.parse(process.argv[2]);
  const pg = await b.newPage({ viewport: process.argv[3] === 'phone' ? { width: 400, height: 800 } : { width: 1360, height: 820 }, deviceScaleFactor: 1 });
  pg.on('console', m => { if (m.type() === 'error' && !/GL Driver|ERR_/.test(m.text())) console.log('[error]', m.text().slice(0, 300)); });
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  if (V) await pg.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ path: path.join(V, 'three.min.js'), contentType: 'text/javascript' });
    if (u.includes('GLTFLoader.js')) return r.fulfill({ path: path.join(V, 'GLTFLoader.js'), contentType: 'text/javascript' });
    if (u.includes('fonts.googleapis')) return r.fulfill({ contentType: 'text/css', body: "@font-face{font-family:'Archivo';font-weight:100 900;font-stretch:62% 125%;src:url(http://localhost:" + PORT + "/__font.woff2) format('woff2')}" });
    if (u.includes('__font.woff2')) return r.fulfill({ path: path.join(V, 'archivo.woff2'), contentType: 'font/woff2' });
    return u.startsWith('http://localhost') ? r.continue() : r.abort();
  });
  fs.mkdirSync(path.join(ROOT, 'shots'), { recursive: true });
  for (const st of steps) {
    if (st.go) { await pg.goto('http://localhost:' + PORT + '/index.html#' + st.go); await pg.waitForTimeout(300); }
    if (st.wait) await pg.waitForFunction(() => document.getElementById('loader').hidden, null, { timeout: 120000 }).catch(() => console.log('chargement trop long'));
    if (st.eval) console.log('eval', JSON.stringify(await pg.evaluate(st.eval)));
    if (st.click) await pg.mouse.click(st.click[0], st.click[1]);
    if (st.sel) await pg.click(st.sel);
    if (st.ms) await pg.waitForTimeout(st.ms);
    if (st.shot) await pg.screenshot({ path: path.join(ROOT, 'shots', st.shot + '.png') });
  }
  await b.close(); srv.close();
})();
