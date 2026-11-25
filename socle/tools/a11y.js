/* Audit d'accessibilité : axe-core, règles WCAG 2.1 A et AA, sur les pages principales,
   en thème clair et en thème sombre, en français et en anglais (règle 7).
   Usage : node tools/a11y.js (qui appelle socle/tools/a11y.js)   (VENDOR=… hors ligne, comme tools/smoke.js)
   Sortie : liste des violations par page ; code de sortie 1 s'il en reste. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), serve = require('./serve');
const ROOT = serve.ROOT, PORT = 8125, srv = serve(PORT);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const { IDS, ALL } = require(path.join(serve.ROOT, 'tools', 'pages'));
// [hash, clic éventuel une fois la page chargée]
const PAGES = [...ALL.map(h => [h]), ...IDS.map(i => [i, '[data-ptab="parts"]'])];
(async () => {
  const b = await chromium.launch();
  let total = 0; const seen = {};
  for (const lang of ['fr', 'en']) for (const scheme of ['light', 'dark']) {
    const pg = await b.newPage({ viewport: { width: 1360, height: 860 }, colorScheme: scheme, locale: lang === 'en' ? 'en-GB' : 'fr-FR' });
    await serve.lang(pg, lang); await serve.offline(pg, PORT);
    for (const [hash, click] of PAGES) {
      await pg.goto('http://localhost:' + PORT + '/index.html#' + (lang === 'en' ? 'en-' : '') + hash); await pg.waitForTimeout(500);
      if (click && await pg.locator(click).count()) { await pg.click(click); await pg.waitForTimeout(400); }
      await pg.addScriptTag({ content: AXE });
      const res = await pg.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] }))
        .violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, ex: v.nodes.slice(0, 3).map(n => n.target.join(' ') + (n.any[0] && n.any[0].message ? ' — ' + n.any[0].message.slice(0, 140) : '')) })));
      for (const v of res) {
        const key = v.id + '|' + v.ex[0];
        if (seen[key]) continue; seen[key] = 1; total++;
        console.log(`[${lang} ${scheme}] #${hash}${click ? ' ' + click : ''} · ${v.id} (${v.impact}, ${v.n} élément(s)) : ${v.help}`);
        v.ex.forEach(e => console.log('     ' + e));
      }
    }
    await pg.close();
  }
  await b.close(); srv.close();
  console.log(total ? `\n${total} violation(s) distincte(s)` : 'Aucune violation WCAG A/AA détectée');
  process.exit(total ? 1 : 0);
})();
