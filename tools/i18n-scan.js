/* Liste les textes encore en français quand le site est affiché en anglais.
   Usage : node tools/i18n-scan.js   (hors ligne : VENDOR=/chemin, comme tools/shot.js)
   Parcourt toutes les pages en anglais et relève chaque chaîne affichée qui n'a pas de traduction dans src/en/ui.js
   et qui « a l'air française » (accents ou mots outils). Sortie : une chaîne par ligne, prête à compléter. */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), V = process.env.VENDOR, PORT = 8125;
const srv = http.createServer((q, s) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream', 'content-length': d.length }); s.end(d); }); }).listen(PORT);
const FRENCH = /[àâçéèêëîïôùûœ«»]|\b(le|la|les|des|du|de|et|un|une|par|sur|dans|pour|au|aux|est|sont|avec|sans|vers|depuis|chaque|voir|plus)\b/i;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1360, height: 820 }, locale: 'en-US' });
  await pg.addInitScript(() => { window.__i18nMiss = {}; try { localStorage.setItem('obs-lang', 'en'); } catch (e) {} });
  if (V) await pg.route('**/*', r => { const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ path: path.join(V, 'three.min.js'), contentType: 'text/javascript' });
    if (u.includes('GLTFLoader.js')) return r.fulfill({ path: path.join(V, 'GLTFLoader.js'), contentType: 'text/javascript' });
    return u.startsWith('http://localhost') ? r.continue() : r.abort(); });
  const miss = {};
  const grab = async () => Object.assign(miss, await pg.evaluate(() => window.__i18nMiss));
  const go = async h => { await pg.goto('http://localhost:' + PORT + '/index.html#' + h); await pg.waitForTimeout(400); };
  for (const t of ['hubble', 'jwst', 'euclid', 'gaia']){
    await go(t); await pg.waitForFunction(() => document.getElementById('loader').hidden, null, { timeout: 120000 }).catch(() => {});
    await pg.click('[data-ptab="parts"]'); await pg.waitForTimeout(200);
    const np = await pg.locator('.part > button').count();
    for (let i = 0; i < np; i++){ await pg.locator('.part > button').nth(i).click(); await pg.waitForTimeout(60); }
    await pg.mouse.move(480, 420); await pg.waitForTimeout(200); await grab();
    await go(t + '-instruments');
    const ids = await pg.evaluate(() => Array.from(document.querySelectorAll('#inst-nav .nav-i')).map(e => e.getAttribute('data-inst')));
    for (const id of ids){ await pg.click('#inst-nav .nav-i[data-inst="' + id + '"]'); await pg.waitForTimeout(id === 'orbite' ? 2500 : 350);
      const nc = Math.min(40, await pg.locator('.chip[data-filter]').count());
      for (let i = 0; i < nc; i++){ await pg.locator('.chip[data-filter]').nth(i).click(); await pg.waitForTimeout(25); }
      for (const d of await pg.$$('details')) await d.evaluate(e => e.open = true);
      await grab(); }
  }
  await go('comparer'); await pg.waitForFunction(() => document.getElementById('loader').hidden, null, { timeout: 120000 }).catch(() => {}); await pg.waitForTimeout(500); await grab();
  await go('comparer-instruments'); await pg.waitForTimeout(2500); await grab();
  await b.close(); srv.close();
  const out = Object.keys(miss).filter(k => (process.env.ALL ? k.length <= 34 && !/\d/.test(k) : FRENCH.test(k)) && /[a-zA-Zà-ÿ]{3}/.test(k)).sort();
  out.forEach(k => console.log(JSON.stringify(k)));
  console.error(out.length + ' chaîne(s) sans traduction');
})();
