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
/* observatoires : registre de src/data-tele.js */
const TELE_IDS = [...fs.readFileSync(path.join(ROOT, 'src', 'data-tele.js'), 'utf8').matchAll(/^    id:'(\w+)'/gm)].map(m => m[1]);
const errors = [], notes = [];
const fail = m => { errors.push(m); console.log('ÉCHEC', m); };

async function open(b, vp, dark, lang){
  const pg = await b.newPage({ viewport: vp, colorScheme: dark ? 'dark' : 'light', locale: lang === 'en' ? 'en-GB' : 'fr-FR' });
  /* langue du site imposée une fois par onglet (le site est en anglais par défaut ; le bouton de langue reste libre ensuite) */
  await pg.addInitScript(l => { try { if (!sessionStorage.getItem('obs-test-lang')){ localStorage.setItem('obs-lang', l); sessionStorage.setItem('obs-test-lang', '1'); } } catch(e){} }, lang === 'en' ? 'en' : 'fr');

  pg.on('pageerror', e => fail('erreur JavaScript : ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/GL Driver|ERR_|Failed to load resource/.test(m.text())) fail('console : ' + m.text().slice(0, 200)); });
  if (V) await pg.route('**/*', r => { const u = r.request().url();
    if (u.includes('three.min.js')) return r.fulfill({ path: path.join(V, 'three.min.js'), contentType: 'text/javascript' });
    if (u.includes('satellite.min.js')) return r.fulfill({ path: path.join(V, 'satellite.min.js'), contentType: 'text/javascript' });
    if (u.includes('GLTFLoader.js')) return r.fulfill({ path: path.join(V, 'GLTFLoader.js'), contentType: 'text/javascript' });
    return u.startsWith('http://localhost') ? r.continue() : r.abort(); });
  return pg;
}
const go = async (pg, h) => { await pg.goto('http://localhost:' + PORT + '/index.html#' + h); await pg.waitForTimeout(250); };
const loaded = pg => pg.waitForFunction(() => document.getElementById('loader').hidden, null, { timeout: 120000 });
const overflow = async (pg, where) => { const [sw, iw] = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth]); if (sw > iw + 1) fail('défilement horizontal (' + sw + ' > ' + iw + ') sur ' + where); };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const TELES = TELE_IDS;

  // ---- bureau, thème clair : vue 3D
  let pg = await open(b, { width: 1360, height: 820 }, false);
  // ---- registre : chaque observatoire a tout ce que le site attend (procédure d'ajout, tools/models/README.md)
  await go(pg, TELES[0]); await loaded(pg);
  const miss = await pg.evaluate(() => TELESCOPES.map(t => {
    const m = ['color', 'highlight', 'footprint', 'optical', 'compare', 'orbit', 'domain', 'cmp', 'parts', 'sections'].filter(k => !t[k]);
    if (t.domain && !DOMAINS.some(d => d.id === t.domain)) m.push('domain inconnu de DOMAINS');
    if (!INST_DATA[t.id]) m.push('INST_DATA'); if (!MISSION[t.id]) m.push('MISSION');
    if (!Optics.TEXT[t.id] || !Optics.FP[t.id] || !Optics.LINK3D[t.id]) m.push('Optics'); if (!Orbits.TEXT[t.id]) m.push('Orbits');
    if (!FLEET[t.id]) m.push('FLEET'); else FLEET[t.id].who.forEach(function(w){ var r = fleetRefs(t.id); if (![].concat(w[4]).every(function(k){ return r[k]; })) m.push('source inconnue dans FLEET (' + w[0] + ')'); });
    if (!EN_TELE[t.id]) m.push('EN_TELE'); if (!EN_INST[t.id]) m.push('EN_INST'); if (!EN_OPTICS[t.id]) m.push('EN_OPTICS'); if (!EN_ORBITS[t.id]) m.push('EN_ORBITS');
    return m.length ? t.id + ' : ' + m.join(', ') : '';
  }).filter(Boolean));
  miss.forEach(m => fail('registre, il manque ' + m));
  // ---- page Flotte : une barre par observatoire, filtre CNES, « qui a fait quoi »
  await go(pg, 'flotte'); await pg.waitForTimeout(300);
  { const nb = await pg.locator('.fl-row').count(), all = await pg.evaluate(() => TELESCOPES.length);
    if (nb !== all) fail('flotte : ' + nb + ' barres pour ' + all + ' observatoires');
    await pg.click('[data-fleet="ag:CNES"]'); await pg.waitForTimeout(150);
    const nc = await pg.locator('.fl-row').count(), ec = await pg.evaluate(() => TELESCOPES.filter(t => fleetAgencies(t.id).indexOf('CNES') >= 0).length);
    if (nc !== ec || !nc) fail('flotte, filtre CNES : ' + nc + ' barres pour ' + ec);
    await pg.click('[data-fleet-sec="who"]'); await pg.waitForTimeout(150);
    if (await pg.locator('.fl-who').count() !== ec) fail('flotte : « qui a fait quoi » incomplet');
    await pg.click('[data-fleet="ag:"]'); await pg.click('[data-fleet-sec="tl"]');
    notes.push('flotte : ' + nb + ' observatoires, filtre par agence vérifié'); }
  // ---- accueil : carte du ciel chargée, clic au centre de la Galaxie, boutons de vue toujours dans l'en-tête
  await go(pg, 'accueil'); await pg.waitForSelector('.home-li', { timeout: 15000 }).catch(() => fail('accueil : légende non chargée'));
  { const nl = await pg.locator('.home-li').count();
    const box = await pg.locator('#home-cv').boundingBox(); await pg.mouse.click(box.x + box.width/2, box.y + box.height/2); await pg.waitForTimeout(150);
    const nw = await pg.locator('.home-who li').count(); if (!nw) fail('accueil : aucun observatoire au centre de la Galaxie');
    await go(pg, 'hubble-instruments'); await pg.waitForTimeout(300);
    if (!(await pg.locator('#views [data-go="flotte"]').isVisible())) fail('page instruments : bouton Flotte masqué');
    await pg.click('#tabs [data-go="kepler"]'); await pg.waitForTimeout(300);
    if (await pg.evaluate(() => location.hash) !== '#kepler-instruments') fail('onglet d\'en-tête depuis la page instruments : ' + await pg.evaluate(() => location.hash));
    notes.push('accueil : ' + nl + ' couches, ' + nw + ' observatoires au centre de la Galaxie'); }
  // ---- intérieurs (priorité 1) : chaque élément cite sa source ; pas de bouton Coupe sans intérieur documenté
  for (const e of await pg.evaluate(() => { const out = []; Object.keys(INTERIOR.DATA).forEach(id => INTERIOR.DATA[id].forEach((x, i) => { if (!x.cite) out.push(id + ' n° ' + i + ' (' + (x.l || '').slice(0, 40) + ')'); })); return out; })) fail('intérieur sans source : ' + e);
  for (const id of ['gaia', 'jwst', 'chandra']){ await go(pg, id); await loaded(pg);
    const shown = await pg.evaluate(() => !document.getElementById('b-cut').hidden), has = await pg.evaluate(i => INTERIOR.has(i), id);
    if (shown !== has) fail('bouton Coupe ' + (shown ? 'affiché sans intérieur documenté' : 'absent') + ' pour ' + id); }
  // ---- déploiements : chaque observatoire marqué deploy:true se replie puis se redéploie sans erreur
  for (const id of await pg.evaluate(() => TELESCOPES.filter(t => t.deploy).map(t => t.id))){
    await go(pg, id); await loaded(pg);
    const r = await pg.evaluate(() => { document.getElementById('b-dep').click(); const D = DEPLOY[window.__obs.current.t.id], ok = !document.getElementById('dep').hidden && D.value() === 0;
      document.getElementById('dep-next').click(); document.getElementById('b-dep').click(); return ok && D.value() === D.last; });
    if (!r) fail('déploiement de ' + id);
  }
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
  // ---- comparaison (priorité 2) : chaque groupe affiche ses observatoires ; classifications complètes
  for (const e of await pg.evaluate(() => { const out = []; TELESCOPES.forEach(t => { if (!t.mission || !t.mission.length) out.push(t.id + ' : type de mission'); if (!ORBIT_FAMILIES.some(f => f.id === t.orbit)) out.push(t.id + ' : famille d\'orbite'); INST_DATA[t.id].instruments.forEach(it => { if (!INST_TYPES.some(x => x.id === it.type)) out.push(t.id + '/' + it.id + ' : type d\'instrument'); }); }); return out; })) fail('classification manquante, ' + e);
  for (const g of ['l2', 'leo', 'heo', 'helio', 'all']){
    await pg.evaluate(gg => { OBS_CMP.by = 'orbit'; OBS_CMP.g = gg; OBS_CMP.type = null; }, g);
    await go(pg, 'accueil'); await go(pg, 'comparer'); await loaded(pg); await pg.waitForTimeout(800);
    const [n, want] = await pg.evaluate(() => [document.querySelectorAll('.cmp-label').length, cmpList().length]);
    if (n !== want) fail('comparaison ' + g + ' : ' + n + ' étiquettes pour ' + want + ' observatoires');
    await go(pg, 'comparer-instruments'); await pg.waitForTimeout(500); await pg.click('[data-cmpsec="tableau"]'); await pg.waitForTimeout(400);
    const st = await pg.evaluate(() => ({ rows: document.querySelectorAll('.ctable tr[data-jump]').length, icons: document.querySelectorAll('.ctable .ticon').length, bad: document.getElementById('inst-main').innerHTML.match(/undefined|NaN|\[object/g) }));
    if (!st.rows || st.icons !== st.rows) fail('comparaison des instruments ' + g + ' : ' + st.rows + ' lignes, ' + st.icons + ' pictogrammes');
    if (st.bad) fail('comparaison des instruments ' + g + ' : texte suspect ' + st.bad.slice(0, 3).join(', '));
  }
  await pg.evaluate(() => { OBS_CMP.by = 'orbit'; OBS_CMP.g = 'all'; OBS_CMP.type = null; });

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
  await go(pg, 'comparer-instruments'); await pg.waitForTimeout(600); await pg.click('[data-cmpsec="tableau"]'); await pg.waitForTimeout(600);
  if (await pg.evaluate(() => document.querySelectorAll('.ctable tr[data-jump]').length) < 15) fail('comparaison des instruments : tableau incomplet');
  for (const sec of ['', 'spectre', 'champs', 'focal', 'orbites', 'tableau']){
    await pg.click('[data-cmpsec="' + sec + '"]'); await pg.waitForTimeout(sec === 'orbites' ? 900 : 300);
    const st = await pg.evaluate(() => ({ len: document.getElementById('inst-main').textContent.length, bad: document.getElementById('inst-main').innerHTML.match(/undefined|NaN|\[object/g) }));
    if (st.len < 300 || st.bad) fail('comparer, sous-page ' + (sec || 'vue d\'ensemble') + (st.bad ? ' : texte suspect' : ' : presque vide'));
  }
  const realCount = await pg.evaluate(() => Object.keys(window.OBS_DATA || {}).length);
  notes.push('observations réelles dans le manifeste : ' + realCount);
  // lien schéma -> maquette
  await go(pg, 'jwst-instruments'); await pg.click('#inst-nav .nav-i[data-inst="optique"]'); await pg.click('[data-jump3d="jwst:primary"]'); await loaded(pg); await pg.waitForTimeout(600);
  if (await pg.evaluate(() => window.__obs.S.part) !== 'primary') fail('lien schéma → maquette : la pièce n\'est pas sélectionnée');
  // clavier dans la vue 3D : flèche droite sélectionne la première pièce
  await go(pg, 'euclid'); await loaded(pg); await pg.focus('#stage canvas'); await pg.keyboard.press('ArrowRight'); await pg.waitForTimeout(300);
  if (!(await pg.evaluate(() => window.__obs.S.part))) fail('clavier : la flèche ne sélectionne pas de pièce dans la vue 3D');
  await go(pg, 'jwst-instruments'); await pg.click('#inst-nav .nav-i[data-inst="optique"]'); await pg.click('[data-jump3d="jwst:primary"]'); await loaded(pg); await pg.waitForTimeout(600);
  // et retour : la pièce choisie est surlignée dans le schéma
  await pg.click('[data-ptab="parts"]'); await pg.waitForTimeout(300);
  await pg.click('[data-part="primary"] [data-open-optique]'); await pg.waitForTimeout(1200);
  if (await pg.evaluate(() => [...document.querySelectorAll('svg.optic g.hl')].map(g => g.getAttribute('data-el')).join()) !== 'primary') fail('lien maquette → schéma : le miroir primaire n\'est pas surligné');
  // onglet Mission : déroulé, chaîne de traitement et sources pour chaque observatoire
  for (const id of TELE_IDS) {
    await go(pg, id + '-instruments'); await pg.click('#inst-nav [data-inst="mission"]'); await pg.waitForTimeout(300);
    const ms = await pg.evaluate(() => [document.querySelectorAll('.ms-tl li').length, document.querySelectorAll('.ms-chain li').length, document.querySelectorAll('#inst-main ol.refs li').length]);
    if (ms[0] < 4 || ms[1] < 4 || ms[2] < 3) fail('onglet Mission incomplet pour ' + id + ' : ' + ms.join(', '));
  }
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

  // ---- anglais : bureau puis téléphone
  pg = await open(b, { width: 1360, height: 820 }, false, 'en');
  await go(pg, 'jwst'); await loaded(pg); await pg.waitForTimeout(600);
  const en = await pg.evaluate(() => ({ lang: document.documentElement.lang, tab: document.querySelector('.ptab.go').textContent, h: document.querySelector('.spec-section-title').textContent, launch: document.querySelector('.launch').textContent }));
  if (en.lang !== 'en' || en.tab !== 'Mission and data' || en.h !== 'Spacecraft' || !/Launched/.test(en.launch)) fail('anglais : la fiche n\'est pas traduite (' + JSON.stringify(en) + ')');
  let left = 0;
  for (const t of TELES){
    await go(pg, t + '-instruments'); await pg.waitForTimeout(300);
    const ids = await pg.evaluate(() => Array.from(document.querySelectorAll('#inst-nav .nav-i')).map(e => e.getAttribute('data-inst')));
    for (const id of ids){
      await pg.click('#inst-nav .nav-i[data-inst="' + id + '"]'); await pg.waitForTimeout(id === 'orbite' ? 900 : 250);
      const fr = await pg.evaluate(() => { const out = [], w = document.createTreeWalker(document.getElementById('inst-main'), 4); let n; while ((n = w.nextNode())){ if (n.parentNode.nodeName === 'PRE') continue; const v = n.nodeValue.trim(); if (/[àâçèêîôùû]|\b(les|des|une|dans|pour|avec|sont)\b/.test(v) && !/Sagristà|Chrétien/.test(v)) out.push(v.slice(0, 70)); } return out; });
      if (fr.length){ left += fr.length; fail('anglais, ' + t + '/' + (id || 'overview') + ' : texte resté en français : ' + fr.slice(0, 3).join(' | ')); }
    }
  }
  notes.push('anglais : ' + (left ? left + ' textes restés en français' : 'aucun texte français détecté dans les pages d\'instruments'));
  await pg.close();
  pg = await open(b, { width: 400, height: 800 }, false, 'en');
  for (const h of ['euclid', 'comparer', 'gaia-instruments', 'comparer-instruments']){ await go(pg, h); if (!/instruments/.test(h)) await loaded(pg); await pg.waitForTimeout(700); await overflow(pg, '#' + h + ' (téléphone, anglais)'); }
  await pg.close();

  await b.close(); srv.close();
  notes.forEach(n => console.log('  ', n));
  console.log(errors.length ? errors.length + ' anomalie(s)' : 'Tout est passé');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log('ÉCHEC du test lui-même :', e.message); process.exit(2); });
