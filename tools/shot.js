/* Captures d'écran et petits tests dans un vrai navigateur (Playwright + Chromium).
   Usage : node tools/shot.js '<étapes JSON>' [phone]
   Étapes : {go:"jwst"} ouvre #jwst · {wait:1} attend la fin du chargement de la maquette · {eval:"js"} affiche le résultat
            {click:[x,y]} · {sel:"css"} clique un élément · {ms:500} pause · {shot:"nom"} écrit shots/nom.png
   Dans une étape, l'ordre d'exécution est toujours : go, wait, eval, click, sel, ms, shot.
   LANG_SITE=en affiche le site en anglais.
   Hors ligne : VENDOR=/chemin fournit three.min.js, GLTFLoader.js et archivo.woff2 à la place des CDN.
   window.__obs expose l'état de l'application (S, models, pick(x,y), current) pour les tests. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), serve = require('./serve');
const ROOT = serve.ROOT, V = process.env.VENDOR, PORT = 8123, srv = serve(PORT);

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const steps = JSON.parse(process.argv[2]);
  const pg = await b.newPage({ viewport: process.argv[3] === 'phone' ? { width: 400, height: 800 } : { width: 1360, height: 820 }, deviceScaleFactor: 1, locale: process.env.LANG_SITE === 'en' ? 'en-GB' : 'fr-FR' });
  await serve.lang(pg, process.env.LANG_SITE === 'en' ? 'en' : 'fr'); await serve.offline(pg, PORT);

  pg.on('console', m => { if (m.type() === 'error' && !/GL Driver|ERR_/.test(m.text())) console.log('[error]', m.text().slice(0, 300)); });
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  /* police Archivo servie depuis VENDOR/archivo.woff2 pour des captures fidèles (prioritaire sur serve.offline, qui la coupe) */
  if (V && fs.existsSync(path.join(V, 'archivo.woff2'))) await pg.route(u => /fonts\.googleapis|__font\.woff2/.test(String(u)), r => r.request().url().includes('__font.woff2')
    ? r.fulfill({ path: path.join(V, 'archivo.woff2'), contentType: 'font/woff2' })
    : r.fulfill({ contentType: 'text/css', body: "@font-face{font-family:'Archivo';font-weight:100 900;font-stretch:62% 125%;src:url(http://localhost:" + PORT + "/__font.woff2) format('woff2')}" }));
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
