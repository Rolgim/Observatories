/* Vérifie que la copie du socle n'a pas été modifiée sur place : chaque fichier de socle/ doit avoir l'empreinte
   notée dans socle.lock.json (à la racine du site), et aucun fichier ne doit manquer ni s'ajouter.
   Usage : node socle/check.js   (lancé par le workflow Tests) ; code de sortie 1 en cas d'écart.
   Pour changer le socle : le modifier dans Rolgim/rolgim.github.io (dossier socle/), puis node socle/sync.js. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
/* node_modules (outils de maquettes : cd socle/models && npm ci) n'est pas compté */
const list = d => fs.readdirSync(d, { withFileTypes: true }).filter(e => e.name !== 'node_modules').flatMap(e => e.isDirectory() ? list(path.join(d, e.name)) : [path.join(d, e.name)]);
const hashes = () => Object.fromEntries(list(__dirname).sort().map(f => [path.relative(__dirname, f).split(path.sep).join('/'), crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
module.exports = { hashes };
if (require.main === module) {
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'socle.lock.json'), 'utf8'));
  const now = hashes(), bad = [];
  for (const f of Object.keys(lock.files)) if (!now[f]) bad.push('manquant : ' + f); else if (now[f] !== lock.files[f]) bad.push('modifié sur place : ' + f);
  for (const f of Object.keys(now)) if (!lock.files[f]) bad.push('ajouté sur place : ' + f);
  bad.forEach(b => console.log(b));
  console.log(bad.length ? bad.length + ' écart(s) avec ' + lock.source + '@' + lock.commit.slice(0, 7) + ' : modifier le socle à la source, puis node socle/sync.js'
                         : 'socle conforme à ' + lock.source + '@' + lock.commit.slice(0, 7));
  process.exit(bad.length ? 1 : 0);
}
