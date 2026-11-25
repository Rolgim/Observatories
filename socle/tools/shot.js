/* Captures d'écran et petits tests dans un vrai navigateur (Playwright + Chromium).
   Usage : node tools/shot.js '<étapes JSON>' [phone]
   Étapes : {go:"mro"} ouvre #mro · {eval:"js"} affiche le résultat · {click:[x,y]} · {sel:"css"} clique un élément
            {ms:500} pause · {shot:"nom"} écrit shots/nom.png. Ordre dans une étape : go, eval, click, sel, ms, shot.
   LANG_SITE=en affiche le site en anglais ; DARK=1 le thème sombre. Hors ligne : VENDOR=/chemin. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), serve = require('./serve');
const ROOT = serve.ROOT, PORT = 8123, srv = serve(PORT);
(async () => {
  const b = await chromium.launch();
  const steps = JSON.parse(process.argv[2]);
  const pg = await b.newPage({ viewport: process.argv[3] === 'phone' ? { width: 400, height: 800 } : { width: 1360, height: 820 }, deviceScaleFactor: 1,
    colorScheme: process.env.DARK ? 'dark' : 'light', locale: process.env.LANG_SITE === 'en' ? 'en-GB' : 'fr-FR' });
  await serve.lang(pg, process.env.LANG_SITE === 'en' ? 'en' : 'fr'); await serve.offline(pg, PORT);
  pg.on('console', m => { if (m.type() === 'error' && !/GL Driver|ERR_/.test(m.text())) console.log('[error]', m.text().slice(0, 300)); });
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  fs.mkdirSync(path.join(ROOT, 'shots'), { recursive: true });
  for (const st of steps) {
    if (st.go) { await pg.goto('http://localhost:' + PORT + '/index.html#' + st.go); await pg.waitForTimeout(300); }
    if (st.eval) console.log('eval', JSON.stringify(await pg.evaluate(st.eval)));
    if (st.click) await pg.mouse.click(st.click[0], st.click[1]);
    if (st.sel) await pg.click(st.sel);
    if (st.ms) await pg.waitForTimeout(st.ms);
    if (st.shot) await pg.screenshot({ path: path.join(ROOT, 'shots', st.shot + '.png') });
  }
  await b.close(); srv.close();
})();
