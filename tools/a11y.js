/* Audit d'accessibilité (lot H3) : axe-core, règles WCAG 2.1 A et AA, sur les pages principales,
   en thème clair et en thème sombre, en français et en anglais.
   Usage : node tools/a11y.js   (VENDOR=… hors ligne, comme tools/smoke.js)
   Sortie : liste des violations par page ; code de sortie 1 s'il en reste. */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), V = process.env.VENDOR, PORT = 8125;
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const TYPES = { '.html':'text/html', '.glb':'model/gltf-binary', '.json':'application/json', '.jpg':'image/jpeg', '.js':'text/javascript' };
const srv = http.createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); s.end(d); });
}).listen(PORT);
// [hash, clic éventuel une fois la page chargée]
const PAGES = [['hubble'], ['hubble', '[data-ptab="parts"]'], ['euclid-instruments', '#inst-nav [data-inst="mission"]'], ['comparer'], ['jwst-instruments'], ['euclid-instruments', '#inst-nav [data-inst="nisp"]'],
  ['gaia-instruments', '#inst-nav [data-inst="optique"]'], ['roman-instruments', '#inst-nav [data-inst="wfi"]'], ['euclid-instruments', '#inst-nav [data-inst="orbite"]'], ['comparer-instruments']];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let total = 0; const seen = {};
  for (const lang of ['fr', 'en']) for (const scheme of ['light', 'dark']) {
    const pg = await b.newPage({ viewport: { width: 1360, height: 860 }, colorScheme: scheme, locale: lang === 'en' ? 'en-GB' : 'fr-FR' });
    /* langue du site imposée une fois par onglet (le site est en anglais par défaut ; le bouton de langue reste libre ensuite) */
    await pg.addInitScript(l => { try { if (!sessionStorage.getItem('obs-test-lang')){ localStorage.setItem('obs-lang', l); sessionStorage.setItem('obs-test-lang', '1'); } } catch(e){} }, lang === 'en' ? 'en' : 'fr');

    if (V) await pg.route('**/*', r => {
      const u = r.request().url();
      if (u.includes('three.min.js')) return r.fulfill({ path: path.join(V, 'three.min.js'), contentType: 'text/javascript' });
      if (u.includes('satellite.min.js')) return r.fulfill({ path: path.join(V, 'satellite.min.js'), contentType: 'text/javascript' });
    if (u.includes('GLTFLoader.js')) return r.fulfill({ path: path.join(V, 'GLTFLoader.js'), contentType: 'text/javascript' });
      return u.startsWith('http://localhost') ? r.continue() : r.abort();
    });
    for (const [hash, click] of PAGES) {
      await pg.goto('http://localhost:' + PORT + '/index.html#' + (lang === 'en' ? 'en-' : '') + hash); await pg.waitForTimeout(1500);
      if (click) { await pg.click(click); await pg.waitForTimeout(700); }
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
