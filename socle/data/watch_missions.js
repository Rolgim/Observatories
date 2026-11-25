/* Indices de fin de mission (piste « données vivantes ») : relit les données téléchargées par la CI et signale,
   pour chaque mission que le registre dit encore active, ce qui laisse penser qu'elle s'est arrêtée.
   Le script ne change JAMAIS le registre : une fin de mission s'écrit à la main, avec sa source, après relecture.

   Usage : node socle/data/watch_missions.js [--report rapport.md] [--state tools/missions-etat.json]
   Indices relevés :
     - orbite terrestre : plus aucun TLE publié par CelesTrak pour un numéro NORAD, ou TLE vieux de plus de 14 jours
       (data/tle.json, ou data/<id>-tle.json) ;
     - sonde : JPL Horizons ne publie plus d'éphéméride, plus au-delà d'une date passée, ou plus d'orbite
       autour du corps visé depuis 400 jours (data/solar.json) ;
     - archives : aucune donnée nouvelle depuis plus de 90 jours dans les collections relevées (data/cat.json).
   Avec --state, seuls les indices nouveaux depuis le dernier passage sont signalés (les autres restent dans l'état).
   Code de sortie 1 s'il y a un indice nouveau, 0 sinon. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const DAY = 864e5, TODAY = Date.now();
const days = d => Math.floor((TODAY - Date.parse(d)) / DAY);
const json = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8')); } catch (e) { return null; } };

/* registre : le fichier de site.json, évalué à part (les fonctions de traduction rendent le texte français) */
const ctx = { L: a => a, T: a => a, OBS_T: a => a, window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', SITE.registry.file), 'utf8') + '\n;this.__reg = typeof MISSIONS !== "undefined" ? MISSIONS : TELESCOPES;', ctx);
const REG = ctx.__reg;
const ended = m => !!m.ended || (m.events || []).some(e => e.type === 'end');
const name = m => m.short || m.name || m.id;

const hints = [];
const hint = (m, kind, text) => hints.push({ key: m.id + '|' + kind + '|' + text.replace(/\d+ jours/, 'N jours'), id: m.id, name: name(m), text });

const tle = json('tle.json'), solar = json('solar.json'), cat = json('cat.json');
for (const m of REG) {
  if (ended(m)) continue;
  /* TLE */
  const own = json(m.id + '-tle.json');
  if (own && own.epoch && days(own.epoch) > 14) hint(m, 'tle', `dernier TLE du ${own.epoch.slice(0, 10)}, vieux de ${days(own.epoch)} jours`);
  if (tle && m.norad) for (const n of m.norad) {
    const e = tle.sats[String(n)];
    if (!e) hint(m, 'tle', `NORAD ${n} : aucun TLE dans le dernier relevé de CelesTrak (${String(tle.fetched).slice(0, 10)})`);
    else if (days(e.epoch) > 14) hint(m, 'tle', `NORAD ${n} : dernier TLE du ${e.epoch.slice(0, 10)}, vieux de ${days(e.epoch)} jours`);
  }
  /* éphémérides Horizons */
  if (solar && m.horizons) {
    const p = (solar.probes || []).find(x => x.id === m.id), o = (solar.orbits || []).find(x => x.id === m.id);
    /* orbite autour du corps visé : un échantillon par an ; le dernier doit dater de moins de 400 jours */
    const s = o && o.samples && o.samples.length && o.samples[o.samples.length - 1].t0;
    if (s && days(s) > 400) hint(m, 'horizons', `dernière orbite publiée par JPL Horizons le ${s} (${days(s)} jours)`);
    if (!p && !o) hint(m, 'horizons', `JPL Horizons n'a rien renvoyé pour l'objet ${m.horizons} au dernier relevé (${solar.fetched})`);
    else if (p && p.t0 && p.step && p.n) {
      const step = { '1 d': DAY, '2 d': 2 * DAY, '1 h': DAY / 24 }[p.step];
      if (step) { const last = new Date(Date.parse(p.t0) + step * (p.n - 1)).toISOString().slice(0, 10);
        if (Date.parse(last) < TODAY - DAY) hint(m, 'horizons', `l'éphéméride de JPL Horizons s'arrête le ${last}`); }
    }
  }
  /* archives */
  const cols = cat && cat.cols && cat.cols[m.id];
  if (cols && cols.length) {
    const lasts = cols.map(c => c.last).filter(Boolean).sort();
    if (lasts.length && days(lasts[lasts.length - 1]) > 90)
      hint(m, 'archives', `aucune donnée nouvelle dans les collections relevées depuis le ${lasts[lasts.length - 1].slice(0, 10)} (${days(lasts[lasts.length - 1])} jours)`);
  }
}

/* état : ne signaler que le nouveau */
const stateFile = arg('--state'), state = stateFile && fs.existsSync(path.join(ROOT, stateFile)) ? JSON.parse(fs.readFileSync(path.join(ROOT, stateFile), 'utf8')) : { seen: {} };
const fresh = hints.filter(h => !state.seen[h.key]);
if (stateFile) {
  const seen = {}; hints.forEach(h => { seen[h.key] = state.seen[h.key] || new Date(TODAY).toISOString().slice(0, 10); });
  fs.writeFileSync(path.join(ROOT, stateFile), JSON.stringify({ checked: new Date(TODAY).toISOString().slice(0, 10), seen }, null, 1) + '\n');
}
const lines = fresh.map(h => `- **${h.name}** (\`${h.id}\`) : ${h.text}`);
const report = `## Indices de fin de mission (${SITE.title || SITE.name})\n\n` + (fresh.length
  ? `Le registre dit ces missions actives, mais les données relevées par la CI laissent penser le contraire. À vérifier auprès de l'agence ; si la mission est finie, ajouter l'événement de fin avec sa source dans \`src/${SITE.registry.file}\`.\n\n` + lines.join('\n') + '\n'
  : 'Aucun indice nouveau.\n') + (hints.length > fresh.length ? `\n${hints.length - fresh.length} indice(s) déjà signalé(s) restent d'actualité.\n` : '');
if (arg('--report')) fs.writeFileSync(arg('--report'), report);
console.log(report);
process.exit(fresh.length ? 1 : 0);
