/* Liste les textes encore en français quand le site est affiché en anglais (règle 4).
   Usage : node tools/i18n-scan.js   (hors ligne : VENDOR=/chemin)
   Parcourt toutes les pages en anglais, relève chaque chaîne passée à OBS_T sans traduction dans src/en/ui.js,
   et chaque texte visible qui « a l'air français » (accents ou mots outils). Code de sortie 1 s'il en reste. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), serve = require('./serve');
const ROOT = serve.ROOT, PORT = 8126, srv = serve(PORT);
const { IDS, ALL } = require(path.join(serve.ROOT, 'tools', 'pages'));
const FRENCH = /[àâçéèêëîïôùûœ«»]|\b(le|la|les|des|du|de|et|un|une|par|sur|dans|pour|au|aux|est|sont|avec|sans|vers|depuis|chaque|voir|plus)\b/i;
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1360, height: 820 }, locale: 'en-US' });
  await pg.addInitScript(KEY => { window.__i18nMiss = {}; try { localStorage.setItem(KEY, 'en'); } catch (e) {} }, serve.SITE.langKey);
  await serve.offline(pg, PORT);
  const miss = {};
  for (const h of ALL) {
    await pg.goto('http://localhost:' + PORT + '/index.html#en-' + h); await pg.waitForTimeout(300);
    Object.assign(miss, await pg.evaluate(() => window.__i18nMiss));
    for (const t of await pg.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), o = []; let n; while ((n = w.nextNode())) { const s = n.nodeValue.trim(); if (s && n.parentElement.offsetParent !== null) o.push(s); } return o; }))
      if (FRENCH.test(t)) miss[t] = 1;
  }
  await b.close(); srv.close();
  const out = Object.keys(miss).filter(k => FRENCH.test(k) && /[a-zA-Zà-ÿ]{3}/.test(k) && !/^[\w.-]+\.[a-z]{2,}$/.test(k)).sort();
  out.forEach(k => console.log(JSON.stringify(k)));
  console.error(out.length + ' chaîne(s) sans traduction');
  process.exit(out.length ? 1 : 0);
})();
