/* Met à jour la copie du socle dans un site, depuis le dépôt source (Rolgim/rolgim.github.io, dossier socle/).
   Usage : node socle/sync.js [réf]          réf = branche, tag ou commit (défaut : main)
           node socle/sync.js --from <dossier>  copie depuis un clone local de Rolgim/rolgim.github.io (développement)
   Écrit socle/ et socle.lock.json (source, commit, empreinte de chaque fichier), puis reconstruit le site (node build.js).
   Ensuite : lancer les tests, relire, commiter socle/, socle.lock.json et index.html ensemble. */
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..'), SOURCE = 'https://github.com/Rolgim/rolgim.github.io';
const args = process.argv.slice(2);
let src, commit, tmp;
if (args[0] === '--from') {
  src = path.resolve(args[1]);
  commit = execFileSync('git', ['-C', src, 'rev-parse', 'HEAD']).toString().trim();
  if (execFileSync('git', ['-C', src, 'status', '--porcelain', 'socle']).toString().trim()) commit += '+local';
} else {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'socle-'));
  execFileSync('git', ['clone', '-q', '--depth', '1', '--branch', args[0] || 'main', SOURCE + '.git', tmp], { stdio: 'inherit' });
  src = tmp; commit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD']).toString().trim();
}
const from = path.join(src, 'socle');
if (!fs.existsSync(path.join(from, 'build.js'))) throw new Error('pas de socle/ dans ' + src);
fs.rmSync(__dirname, { recursive: true, force: true });
fs.cpSync(from, path.join(ROOT, 'socle'), { recursive: true });
if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
const { hashes } = require(path.join(ROOT, 'socle', 'check.js'));
fs.writeFileSync(path.join(ROOT, 'socle.lock.json'), JSON.stringify({ source: SOURCE, path: 'socle', commit, files: hashes() }, null, 2) + '\n');
console.log('socle ' + commit.slice(0, 7) + ' copié');
execFileSync(process.execPath, [path.join(ROOT, 'build.js')], { stdio: 'inherit' });
