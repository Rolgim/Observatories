/* Test de fumée : parcourt le site dans Chromium et échoue à la première anomalie.
   Usage : node tools/smoke.js          (hors ligne : VENDOR=/chemin, comme tools/shot.js)
   Vérifie : chargement des quatre maquettes, une pièce cliquable par zone visée, vue éclatée, comparaison,
   toutes les pages d'instruments, trajet de la lumière, orbites, thème sombre, absence d'erreur JavaScript
   et de défilement horizontal sur téléphone. */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), V = process.env.VENDOR, PORT = 8124;
const TYPES = { '.html':'text/html', '.glb':'model/gltf-binary', '.json':'application/json', '.jpg':'image/jpeg', '.txt':'text/plain' };
const srv = http.createServer((q, s) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'content-length': d.length }); s.end(d); }); }).listen(PORT);
const errors = [], notes = [];
const fail = m => { errors.push(m); console.log('ÉCHEC', m); };

async function open(b, vp, dark){
  const pg = await b.newPage({ viewport: vp, colorScheme: dark ? 'dark' : 'light' });
  pg.on('pageerror', e => fail('erreur JavaScript : ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/GL Driver|ERR_|Failed to load resource/.test(m.text())) fail('console : ' + m.text().slice(0, 200)); });
  if (V) await pg.route('**/*', r => { const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ path: path.join(V, 'three.min.js'), contentType: 'text/javascript' });
    if (u.includes('GLTFLoader.js')) return r.fulfill({ path: path.join(V, 'GLTFLoader.js'), contentType: 'text/javascript' });
    return u.startsWith('http://localhost') ? r.continue() : r.abort(); });
  return pg;
}
const go = async (pg, h) => { await pg.goto('http://localhost:' + PORT + '/index.html#' + h); await pg.waitForTimeout(250); };
const loaded = pg => pg.waitForFunction(() => document.getElementById('loader').hidden, null, { timeout: 120000 });
const overflow = async (pg, where) => { const [sw, iw] = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); if (sw > iw + 1) fail('défilement horizontal (' + sw + ' > ' + iw + ') sur ' + where); };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const TELES = ['hubble', 'jwst', 'euclid', 'gaia'];

  // ---- bureau, thème clair : vue 3D
  let pg = await open(b, { width: 1360, height: 820 }, false);
  for (const t of TELES){
    await go(pg, t); await loaded(pg); await pg.waitForTimeout(1200);
    const r = await pg.evaluate(() => { const o = window.__obs, M = o.current, seen = {}; for (let y = 110; y < 770; y += 22) for (let x = 30; x < 950; x += 22){ const h = o.pick(x, y); if (h) seen[h.part] = 1; }
      return { id: M && M.t.id, parts: M ? Object.keys(M.parts).length : 0, empty: M ? Object.keys(M.parts).filter(k => !M.parts[k].meshes.length) : [], picked: Object.keys(seen).length }; });
    if (r.id !== t) fail(t + ' : maquette non affichée');
    if (r.empty.length) fail(t + ' : pièces sans géométrie : ' + r.empty.join(', '));
    if (r.picked < 3) fail(t + ' : seulement ' + r.picked + ' pièces atteignables au clic');
    await pg.evaluate(() => { const e = document.getElementById('explode'); e.value = 100; e.dispatchEvent(new Event('input')); });
    await pg.waitForTimeout(900);
    const picked2 = await pg.evaluate(() => { const o = window.__obs, seen = {}; for (let y = 110; y < 770; y += 22) for (let x = 30; x < 950; x += 22){ const h = o.pick(x, y); if (h) seen[h.part] = 1; } return Object.keys(seen).length; });
    notes.push(t + ' : ' + r.parts + ' pièces, ' + r.picked + ' atteignables assemblé, ' + picked2 + ' éclaté');
  }
  await go(pg, 'comparer'); await loaded(pg); await pg.waitForTimeout(800);
  if (await pg.evaluate(() => document.querySelectorAll('.cmp-label').length) !== 4) fail('comparaison : il manque des étiquettes');

  // ---- pages d'instruments, trajet de la lumière, orbites
  for (const t of TELES){
    await go(pg, t + '-instruments'); await pg.waitForTimeout(300);
    const ids = await pg.evaluate(() => Array.from(document.querySelectorAll('#inst-nav .nav-i')).map(e => e.getAttribute('data-inst')));
    for (const id of ids){
      await pg.click('#inst-nav .nav-i[data-inst="' + id + '"]'); await pg.waitForTimeout(id === 'orbite' ? 900 : 250);
      const st = await pg.evaluate(() => ({ len: document.getElementById('inst-main').textContent.length, svgs: document.querySelectorAll('#inst-main svg').length, bad: document.getElementById('inst-main').innerHTML.match(/undefined|NaN|\[object/g) }));
      if (st.len < 300) fail(t + '/' + (id || 'vue d\'ensemble') + ' : page presque vide');
      if (st.bad) fail(t + '/' + (id || 'vue d\'ensemble') + ' : texte suspect : ' + st.bad.slice(0, 3).join(', '));
    }
    notes.push(t + ' : ' + ids.length + ' pages d\'instruments');
  }
  await go(pg, 'comparer-instruments'); await pg.waitForTimeout(1200);
  if (await pg.evaluate(() => document.querySelectorAll('.ctable tr[data-jump]').length) < 15) fail('comparaison des instruments : tableau incomplet');
  const realCount = await pg.evaluate(() => Object.keys(window.OBS_DATA || {}).length);
  notes.push('observations réelles dans le manifeste : ' + realCount);
  // lien schéma -> maquette
  await go(pg, 'jwst-instruments'); await pg.click('#inst-nav .nav-i[data-inst="optique"]'); await pg.click('[data-jump3d="jwst:primary"]'); await loaded(pg); await pg.waitForTimeout(600);
  if (await pg.evaluate(() => window.__obs.S.part) !== 'primary') fail('lien schéma → maquette : la pièce n\'est pas sélectionnée');
  await pg.close();

  // ---- téléphone, thème sombre
  pg = await open(b, { width: 400, height: 800 }, true);
  for (const h of ['hubble', 'comparer', 'jwst-instruments', 'comparer-instruments']){
    await go(pg, h); if (!/instruments/.test(h)) await loaded(pg); await pg.waitForTimeout(700); await overflow(pg, '#' + h + ' (téléphone)');
  }
  for (const id of ['optique', 'orbite', 'nircam']){ await go(pg, 'jwst-instruments'); await pg.click('#inst-nav .nav-i[data-inst="' + id + '"]'); await pg.waitForTimeout(500); await overflow(pg, 'jwst/' + id + ' (téléphone)'); }
  const bg = await pg.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (!/rgb\((2\d|3\d), /.test(bg)) fail('thème sombre non appliqué (fond ' + bg + ')');
  await pg.close();

  await b.close(); srv.close();
  notes.forEach(n => console.log('  ', n));
  console.log(errors.length ? errors.length + ' anomalie(s)' : 'Tout est passé');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log('ÉCHEC du test lui-même :', e.message); process.exit(2); });
