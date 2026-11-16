/* =================================================================
   DÉPLOIEMENT DE WEBB (F3)
   La maquette NASA est livrée déployée et n'est pas articulée. On replie ses pièces par
   déformation des sommets, en mètres et dans le repère de la maquette (y vers le télescope,
   z le long du bouclier, x en travers) :
   - rotations autour de charnières (palettes du bouclier, ailes du miroir, trépied du secondaire,
     volet arrière, antenne) ;
   - compressions (bras médians rentrés, couches non tendues, panneau solaire replié, tour rentrée).
   Dates et ordre des étapes : NASA (blog Webb, décembre 2021 et janvier 2022). Formes repliées :
   schématiques, les plans de repliement n'étant pas publics ; la longueur de la tour (1,22 m) est publiée.
   Côté des ailes (bâbord, tribord) dans la maquette : non vérifié.
================================================================= */
var DEPLOY = (function(){
  var PI = Math.PI, rad = PI/180;
  /* étapes : [date FR, date EN, titre FR, titre EN, texte FR, texte EN, clé d'étape géométrique ou null] */
  var STEPS = [
    ['25 déc. 2021', '25 Dec 2021', 'Lancement, tout est replié', 'Launch, everything folded', 'Webb tient replié sous la coiffe d\'Ariane 5, de 5,4 m de diamètre.', 'Webb fits folded inside the 5.4 m Ariane 5 fairing.', null],
    ['25 déc., +29 min', '25 Dec, +29 min', 'Panneau solaire', 'Solar array', 'Le panneau solaire s\'ouvre juste après la séparation du lanceur.', 'The solar array opens just after separation from the launcher.', 'solar'],
    ['26 déc.', '26 Dec', 'Antenne grand gain', 'High-gain antenna', 'L\'antenne qui transmet les données vers la Terre se déploie.', 'The antenna that sends data to Earth swings out.', 'hga'],
    ['28 déc.', '28 Dec', 'Palettes du bouclier', 'Sunshield pallets', 'Les palettes avant et arrière, qui portent le bouclier plié, s\'abaissent.', 'The forward and aft pallets, which carry the folded sunshield, are lowered.', 'pallets'],
    ['29 déc.', '29 Dec', 'Tour déployable : +1,22 m', 'Deployable tower: +1.22 m', 'La tour éloigne le télescope du module de service, chaud, de 1,22 m.', 'The tower moves the telescope 1.22 m away from the warm spacecraft bus.', 'tower'],
    ['30 déc.', '30 Dec', 'Volet d\'équilibrage', 'Aft momentum flap', 'Le volet arrière compense la pression du rayonnement solaire. Les housses du bouclier sont retirées.', 'The aft flap offsets solar radiation pressure. The sunshield covers are released.', 'flap'],
    ['31 déc.', '31 Dec', 'Bras médians', 'Mid-booms', 'Les deux bras télescopiques ouvrent le bouclier en largeur.', 'The two telescopic booms spread the sunshield sideways.', 'booms'],
    ['3 et 4 janv. 2022', '3–4 Jan 2022', 'Tension des cinq couches', 'Tensioning the five layers', 'Les cinq couches, fines comme un cheveu, sont tendues et s\'écartent les unes des autres.', 'The five layers, thin as a hair, are pulled taut and separate from each other.', 'tension'],
    ['5 janv.', '5 Jan', 'Miroir secondaire', 'Secondary mirror', 'Le trépied bascule et place le miroir secondaire à environ 7 m devant le primaire.', 'The tripod swings out and sets the secondary mirror about 7 m in front of the primary.', 'secondary'],
    ['6 janv.', '6 Jan', 'Radiateur des instruments', 'Instrument radiator', 'Le radiateur arrière du module d\'instruments s\'ouvre (non représenté).', 'The aft radiator of the instrument module opens (not shown).', null],
    ['7 janv.', '7 Jan', 'Aile bâbord du primaire', 'Primary mirror port wing', 'Trois segments repliés à l\'arrière pivotent et se verrouillent.', 'Three segments folded at the back swing round and latch.', 'wingP'],
    ['8 janv.', '8 Jan', 'Aile tribord : déploiement terminé', 'Starboard wing: deployment complete', 'Le miroir de 6,5 m est complet. Restent l\'alignement des 18 segments et le refroidissement.', 'The 6.5 m mirror is complete. Aligning the 18 segments and cooling down remain.', 'wingS'],
    ['24 janv.', '24 Jan', 'Arrivée autour de L2', 'Arrival around L2', 'Une dernière poussée place Webb sur son orbite autour de L2, à 1,5 million de km.', 'A final burn puts Webb on its orbit around L2, 1.5 million km away.', null]
  ];
  var KEYS = {}; STEPS.forEach(function(s, i){ if (s[6]) KEYS[s[6]] = i; });
  function stage(v, k){ var i = KEYS[k]; return Math.max(0, Math.min(1, v - (i - 1))); }
  function ease(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2; }

  /* repères (repère de la maquette, mètres) */
  var BUS_TOP = -3.47, CORE = -3.45, PAL_F = 3.4, PAL_A = -2.6, PAL_Y = -3.6, MB = 1.05, TOWER = 1.0,   /* tour : 1,22 m en réalité ; 1,0 m ici, sinon le télescope abaissé entre dans le module de la maquette */
      WING_X = 1.71, WING_Z = 0.6, SEC_H = [0, -1.75, 2.0], SEC_FOLD = { secondary_2:[4.62, 1.91], secondary_7:[5.6, 2.25] }, SEC_M = [0.9, 8.4], FLAP_H = [-9.16, -1.5];
  var UPPER = { primary:1, secondary:1, aos:1, isim:1 };

  var M3 = THREE.Matrix3, V3 = THREE.Vector3;
  /* Chaque triangle bouge d'un bloc : les décisions (quelle pièce mobile, quel côté d'une charnière) se prennent sur son
     centre d, puis la même transformation s'applique à ses sommets. Sinon les triangles à cheval sur une charnière
     s'étirent et traversent le reste de la maquette. P = [d, sommet] ; n = normale du sommet. */
  function rx(P, n, cy, cz, a){ var c = Math.cos(a), s = Math.sin(a), i, y, z;
    for (i=0;i<P.length;i++){ y = P[i].y - cy; z = P[i].z - cz; P[i].y = cy + y*c - z*s; P[i].z = cz + y*s + z*c; }
    y = n.y; z = n.z; n.y = y*c - z*s; n.z = y*s + z*c; }
  function ry(P, n, cx, cz, a){ var c = Math.cos(a), s = Math.sin(a), i, x, z;
    for (i=0;i<P.length;i++){ x = P[i].x - cx; z = P[i].z - cz; P[i].x = cx + x*c + z*s; P[i].z = cz - x*s + z*c; }
    x = n.x; z = n.z; n.x = x*c + z*s; n.z = -x*s + z*c; }
  function each(P, f){ for (var i=0;i<P.length;i++) f(P[i]); }

  /* déforme un triangle (P en repère maquette) pour l'état g (chaque étape de 0 = replié à 1 = déployée) */
  function deform(part, name, P, n, g){
    var d = P[0];
    if (part === 'sunshield' || part === 'flap'){
      if (part === 'flap' && g.flap < 1) rx(P, n, FLAP_H[1], FLAP_H[0], -(1 - g.flap)*100*rad);
      /* cœur : la zone au-dessus du module, entre les charnières des palettes ; le reste est membrane et bras */
      var mem = !(Math.abs(d.x) < MB + 0.3 && d.z > PAL_A && d.z < PAL_F);
      /* avant tension, couches serrées juste au-dessus du module (plus serrées tant que la tour est rentrée et que le
         télescope repose sur le module), le plan remontant vers l'arrière au-dessus du panneau solaire incliné */
      if (mem && g.tension < 1 && d.y > -5.2){
        var lo = 1 - g.tower, k = (0.15 + 0.85*g.tension)*(1 - 0.8*lo);
        each(P, function(q){ var yr = BUS_TOP + 0.06 + Math.max(0, -q.z - 3)*0.3*g.pallets; q.y = yr + (q.y - yr)*k; });
      }
      /* cœur du bouclier au-dessus du module : il s'écrase avec la tour rentrée, sous le télescope abaissé */
      if (!mem && g.tower < 1) each(P, function(q){ if (q.y > CORE) q.y = CORE + (q.y - CORE)*(1 - 0.95*(1 - g.tower)); });
      if (g.booms < 1){ var sx = 0.06 + 0.94*g.booms; each(P, function(q){ if (Math.abs(q.x) > MB) q.x = (q.x > 0 ? 1 : -1)*(MB + (Math.abs(q.x) - MB)*sx); }); }
      if (g.pallets < 1){
        var lz = 0.62 + 0.38*g.pallets, a = (1 - g.pallets)*88*rad;
        if (d.z > PAL_F){ each(P, function(q){ q.z = PAL_F + (q.z - PAL_F)*lz; }); rx(P, n, PAL_Y, PAL_F, -a); }
        else if (d.z < PAL_A){ each(P, function(q){ q.z = PAL_A + (q.z - PAL_A)*lz; }); rx(P, n, PAL_Y, PAL_A, a); }
      }
    } else if (part === 'solar'){
      /* replié en accordéon (cinq panneaux) puis rabattu contre la face arrière du module */
      if (g.solar < 1 && d.z < -2.15){ each(P, function(q){ q.z = -2.15 + (q.z + 2.15)*(0.22 + 0.78*g.solar); }); rx(P, n, -4.0, -2.35, -(1 - g.solar)*78*rad); }
    } else if (part === 'hga'){
      if (g.hga < 1 && d.x < 0) rx(P, n, -5.0, -1.5, (1 - g.hga)*80*rad);   /* la parabole seule ; les petites antennes à x > 0 restent fixées au module */
    } else if (UPPER[part]){
      /* ailes : segments (primary) et leur structure arrière, rangée par la maquette avec le module d'instruments (isim) */
      if ((part === 'primary' || (part === 'isim' && d.z > 0.6)) && Math.abs(d.x) > WING_X){
        var sd = d.x > 0 ? 1 : -1, w = sd > 0 ? g.wingS : g.wingP;
        if (w < 1) ry(P, n, sd*WING_X, WING_Z, sd*(1 - w)*90*rad);
      }
      if (part === 'secondary' && g.secondary < 1){
        var f = 1 - g.secondary, A = SEC_FOLD[name];
        if (A){
          /* bras supérieur : reste tendu entre sa charnière en haut du miroir (A) et le miroir secondaire, qui bascule ;
             il raccourcit en se repliant (genou), sans jamais se détacher de ses deux extrémités */
          var ang = -f*60*rad, c = Math.cos(ang), sn = Math.sin(ang), sy = SEC_M[0] - SEC_H[1], sz = SEC_M[1] - SEC_H[2];
          var ny = SEC_H[1] + sy*c - sz*sn, nz = SEC_H[2] + sy*sn + sz*c, uy = SEC_M[0] - A[0], uz = SEC_M[1] - A[1], q2 = 0.3 + 0.7*g.secondary;
          each(P, function(q){ var dy = q.y - A[0], dz = q.z - A[1], t = (dy*uy + dz*uz)/(uy*uy + uz*uz);
            q.y = A[0] + t*(ny - A[0]) + (dy - t*uy)*q2; q.z = A[1] + t*(nz - A[1]) + (dz - t*uz)*q2; });
        }
        else if (name !== 'secondary') rx(P, n, SEC_H[1], SEC_H[2], -f*60*rad);                         /* « secondary » : petit élément fixé en haut du primaire */
      }
      if (g.tower < 1) each(P, function(q){ q.y -= (1 - g.tower)*TOWER; });
    }
    if (part === 'tower' && g.tower < 1) each(P, function(q){ if (q.y > CORE) q.y = CORE + (q.y - CORE)*(1 - 0.95*(1 - g.tower)); });
  }

  var store = null;
  /* les attributs glTF peuvent être entrelacés (position et normale dans un même tampon) : on passe par getX/setX */
  var NORM = { Int8Array:127, Uint8Array:255, Int16Array:32767, Uint16Array:65535 };
  function copy(at){
    var arr = at.isInterleavedBufferAttribute ? at.data.array : at.array, k = at.normalized ? (NORM[arr.constructor.name] || 1) : 1;
    var sz = at.itemSize, r = new Float32Array(at.count*sz), get = ['getX', 'getY', 'getZ', 'getW'];
    for (var i=0;i<at.count;i++) for (var c=0;c<sz;c++) r[sz*i + c] = at[get[c]](i)/k;
    return r;
  }
  /* remplace un attribut entrelacé ou entier (normales quantifiées du glTF) par un attribut en flottants, propre à cette géométrie */
  function own(geo, name){ var at = geo.attributes[name]; if (!at) return null; var f = new THREE.BufferAttribute(copy(at), at.itemSize); geo.setAttribute(name, f); return f; }
  function dirty(at){ if (at.isInterleavedBufferAttribute) at.data.needsUpdate = true; else at.needsUpdate = true; }
  /* mémorise les sommets d'origine et les passages repère local ↔ repère maquette (pièces à l'état éclaté 0) */
  function prepare(M){
    if (store && store.M === M) return store;
    var inv = new THREE.Matrix4().copy(M.root.matrixWorld).invert(), seen = new Set(), list = [];
    M.root.updateMatrixWorld(true);
    M.meshes.forEach(function(o){
      if (o.userData.interior || !o.geometry || !o.geometry.attributes.position) return;
      var k = o.userData.part; if (!(k === 'sunshield' || k === 'flap' || k === 'solar' || k === 'hga' || k === 'tower' || UPPER[k])) return;
      if (seen.has(o.geometry)) o.geometry = o.geometry.clone(); seen.add(o.geometry);
      if (o.userData.base) o.position.copy(o.userData.base); o.updateMatrixWorld(true);
      var m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), mi = new THREE.Matrix4().copy(m).invert();
      Object.keys(o.geometry.attributes).forEach(function(k){ own(o.geometry, k); });
      if (o.geometry.index){ var gi = o.geometry.toNonIndexed(); gi.groups = []; o.geometry.dispose(); o.geometry = gi; }   /* un triangle = trois sommets propres */
      var pos = o.geometry.attributes.position, nor = o.geometry.attributes.normal;
      list.push({ o:o, part:k, name:o.name, m:m, mi:mi, nm:new M3().getNormalMatrix(m), nmi:new M3().getNormalMatrix(mi),
        p0:pos.array.slice(0), n0:nor ? nor.array.slice(0) : null });
    });
    store = { M:M, list:list, v:STEPS.length - 1 };
    return store;
  }
  var d = new V3(), p = new V3(), n = new V3(), P = [d, p], c3 = [new V3(), new V3(), new V3()];
  function set(M, v){
    var st = prepare(M); st.v = v;
    var g = {}; Object.keys(KEYS).forEach(function(k){ g[k] = ease(stage(v, k)); });
    st.list.forEach(function(e){
      var pos = e.o.geometry.attributes.position, nor = e.o.geometry.attributes.normal, i, j, t;
      for (t=0;t<pos.count;t+=3){
        for (i=0;i<3;i++){ j = 3*(t + i); c3[i].set(e.p0[j], e.p0[j+1], e.p0[j+2]).applyMatrix4(e.m); }
        var big = Math.max(c3[0].distanceTo(c3[1]), c3[1].distanceTo(c3[2]), c3[2].distanceTo(c3[0])) > 1.5;
        for (i=0;i<3;i++){
          j = 3*(t + i);
          /* grand triangle (bande de plus de 1,5 m, bords du bouclier) : décision par sommet, il se plie comme une toile */
          p.copy(c3[i]); if (big) d.copy(p); else d.copy(c3[0]).add(c3[1]).add(c3[2]).multiplyScalar(1/3);
          if (nor) n.set(e.n0[j], e.n0[j+1], e.n0[j+2]).applyMatrix3(e.nm); else n.set(0, 1, 0);
          deform(e.part, e.name, P, n, g);
          p.applyMatrix4(e.mi); pos.setXYZ(t + i, p.x, p.y, p.z);
          if (nor){ n.applyMatrix3(e.nmi).normalize(); nor.setXYZ(t + i, n.x, n.y, n.z); }
        }
      }
      dirty(pos); if (nor) dirty(nor);
      e.o.geometry.computeBoundingSphere(); e.o.geometry.computeBoundingBox();
    });
  }
  function value(){ return store ? store.v : STEPS.length - 1; }
  return { STEPS:STEPS, set:set, value:value, last:STEPS.length - 1 };
})();
