/* Contrôle physique d'un déploiement (src/deploy.js).
   Usage : VENDOR=… node tools/deploy-check.js [pas] [observatoire]   (pas du curseur, 0.25 par défaut ; jwst par défaut)
   Pour chaque état du curseur, la surface de chaque pièce est échantillonnée dans une grille de voxels (6 cm) :
   - interpénétrations : voxels partagés par deux groupes de pièces, en plus de ceux déjà partagés une fois déployé ;
   - pièces flottantes : maillage qui, déployé, touche d'autres maillages et n'en touche plus aucun (voisinage de 12 cm).
   Seuils : un recouvrement de moins de 40 voxels (ligne de contact) n'est pas signalé. Sortie : texte, code 1 si un défaut est trouvé. */
const { execFileSync } = require('child_process'), path = require('path');
const step = +(process.argv[2] || 0.25), TID = process.argv[3] || 'jwst';
const page = '(' + function(step, tid){
  var o = window.__obs, M = o.current, D = window.DEPLOY[tid], THREE_ = THREE;
  var GRP = { sunshield:'bouclier', flap:'bouclier', primary:'miroir', isim:'instruments', aos:'instruments', secondary:'secondaire', bus:'module', solar:'solaire', hga:'antenne', tower:'tour' };
  var V1 = 0.06, V2 = 0.12, a = new THREE_.Vector3(), b = new THREE_.Vector3(), c = new THREE_.Vector3(), p = new THREE_.Vector3();
  var meshes = M.meshes.filter(function(m){ return !m.userData.interior && m.geometry && m.geometry.attributes.position; });
  function scan(v){
    D.set(M, v); M.root.updateMatrixWorld(true);
    var inv = new THREE_.Matrix4().copy(M.root.matrixWorld).invert(), fine = {}, coarse = {};
    meshes.forEach(function(m, mi){
      var mat = new THREE_.Matrix4().multiplyMatrices(inv, m.matrixWorld), pos = m.geometry.attributes.position, idx = m.geometry.index, n = idx ? idx.count : pos.count, g = GRP[m.userData.part] || m.userData.part;
      function put(q){
        var k1 = Math.floor(q.x/V1) + ',' + Math.floor(q.y/V1) + ',' + Math.floor(q.z/V1), k2 = Math.floor(q.x/V2) + ',' + Math.floor(q.y/V2) + ',' + Math.floor(q.z/V2);
        (fine[k1] = fine[k1] || {})[g] = 1; (coarse[k2] = coarse[k2] || {})[mi] = 1;
      }
      for (var i=0;i<n;i+=3){
        a.fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(mat); b.fromBufferAttribute(pos, idx ? idx.getX(i+1) : i+1).applyMatrix4(mat); c.fromBufferAttribute(pos, idx ? idx.getX(i+2) : i+2).applyMatrix4(mat);
        var L = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)), s = Math.min(60, Math.max(1, Math.ceil(L/V1)));
        for (var u=0;u<=s;u++) for (var w=0;w<=s-u;w++){ p.copy(a).multiplyScalar(1 - (u + w)/s).addScaledVector(b, u/s).addScaledVector(c, w/s); put(p); }
      }
    });
    var pairs = {}, where = {};
    Object.keys(fine).forEach(function(k){ var gs = Object.keys(fine[k]); if (gs.length < 2) return; gs.sort();
      for (var i=0;i<gs.length;i++) for (var j=i+1;j<gs.length;j++){ var pk = gs[i] + ' / ' + gs[j]; pairs[pk] = (pairs[pk] || 0) + 1; (where[pk] = where[pk] || []).push(k); } });
    var touch = meshes.map(function(){ return {}; });
    Object.keys(coarse).forEach(function(k){ var x = k.split(',').map(Number), here = Object.keys(coarse[k]);
      for (var dx=-1;dx<=1;dx++) for (var dy=-1;dy<=1;dy++) for (var dz=-1;dz<=1;dz++){ var nb = coarse[(x[0]+dx) + ',' + (x[1]+dy) + ',' + (x[2]+dz)]; if (!nb) continue;
        here.forEach(function(h){ for (var q in nb) if (q !== h) touch[h][q] = 1; }); } });
    return { pairs:pairs, where:where, touch:touch };
  }
  var base = scan(D.last), out = [];
  for (var v = 0; v < D.last - 1e-6; v += step){
    var s = scan(v);
    Object.keys(s.pairs).forEach(function(pk){
      var extra = s.pairs[pk] - (base.pairs[pk] || 0); if (extra < 40) return;
      var bw = {}; (base.where[pk] || []).forEach(function(k){ bw[k] = 1; });
      var nw = s.where[pk].filter(function(k){ return !bw[k]; }), cl = {};
      /* regroupe par cellule de 1 m pour situer chaque zone de recouvrement */
      nw.forEach(function(k){ var x = k.split(',').map(Number), q = x.map(function(t){ return Math.floor(t*V1); }).join(','); cl[q] = (cl[q] || 0) + 1; });
      var top = Object.keys(cl).sort(function(a, b){ return cl[b] - cl[a]; }).slice(0, 4).map(function(q){ return '[' + q + '] ' + cl[q]; });
      out.push('v=' + v.toFixed(2) + '  recouvrement ' + pk + ' : ' + extra + ' voxels ; cellules de 1 m : ' + top.join(' ; '));
    });
    s.touch.forEach(function(t, i){
      if (Object.keys(base.touch[i]).length && !Object.keys(t).length) out.push('v=' + v.toFixed(2) + '  flottant : ' + meshes[i].name + ' (' + meshes[i].userData.part + ')');
    });
  }
  D.set(M, D.last);
  return out.join('\n') || 'aucun défaut';
} + ')(' + step + ', "' + TID + '")';
const steps = [{ go:TID, wait:1 }, { sel:'#b-dep', ms:300 }, { eval:page }];
const res = execFileSync('node', [path.join(__dirname, 'shot.js'), JSON.stringify(steps)], { env:process.env, encoding:'utf8', maxBuffer:1e8, timeout:900000 });
const m = /^eval (.*)$/m.exec(res), txt = m ? JSON.parse(m[1]) : res;
console.log(txt);
process.exit(/aucun défaut/.test(txt) ? 0 : 1);
