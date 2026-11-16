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
  var BUS_TOP = -3.47, PAL_F = 3.4, PAL_A = -2.6, PAL_Y = -3.6, MB = 1.05, TOWER = 1.22,
      WING_X = 1.71, WING_Z = 1.3, SEC_H = [0, -1.75, 2.0], SEC_TOP = [0, 4.62, 1.91], FLAP_H = [-9.16, -1.5];
  var UPPER = { primary:1, secondary:1, aos:1, isim:1 };

  var M3 = THREE.Matrix3, V3 = THREE.Vector3;
  function rotX(p, n, cy, cz, a){ var c = Math.cos(a), s = Math.sin(a), y = p.y - cy, z = p.z - cz; p.y = cy + y*c - z*s; p.z = cz + y*s + z*c; var ny = n.y, nz = n.z; n.y = ny*c - nz*s; n.z = ny*s + nz*c; }
  function rotY(p, n, cx, cz, a){ var c = Math.cos(a), s = Math.sin(a), x = p.x - cx, z = p.z - cz; p.x = cx + x*c + z*s; p.z = cz - x*s + z*c; var nx = n.x, nz = n.z; n.x = nx*c + nz*s; n.z = -nx*s + nz*c; }

  /* déforme un sommet (p, n en repère maquette) pour l'état g (chaque étape de 0 = replié à 1 = déployée) */
  function deform(part, name, p, n, g){
    if (part === 'sunshield' || part === 'flap'){
      if (part === 'flap' && g.flap < 1) rotX(p, n, FLAP_H[1], FLAP_H[0], -(1 - g.flap)*100*rad);
      var mem = Math.abs(p.z) > 1.15 || Math.abs(p.x) > MB;          /* membrane et bras, hors du module */
      if (mem && g.tension < 1 && p.y > -5.2){ var k = 0.15 + 0.85*g.tension; p.y = BUS_TOP - 0.15 + (p.y - BUS_TOP + 0.15)*k; }
      if (g.booms < 1 && Math.abs(p.x) > MB){ var sx = 0.06 + 0.94*g.booms; p.x = (p.x > 0 ? 1 : -1)*(MB + (Math.abs(p.x) - MB)*sx); }
      if (g.pallets < 1){
        var lz = 0.62 + 0.38*g.pallets, a = (1 - g.pallets)*88*rad;
        if (p.z > PAL_F){ p.z = PAL_F + (p.z - PAL_F)*lz; rotX(p, n, PAL_Y, PAL_F, -a); }
        else if (p.z < PAL_A){ p.z = PAL_A + (p.z - PAL_A)*lz; rotX(p, n, PAL_Y, PAL_A, a); }
      }
    } else if (part === 'solar'){
      /* replié en accordéon (cinq panneaux) puis rabattu contre la face arrière du module */
      if (g.solar < 1 && p.z < -1.8){ p.z = -1.8 + (p.z + 1.8)*(0.22 + 0.78*g.solar); rotX(p, n, -4.0, -1.8, -(1 - g.solar)*85*rad); }
    } else if (part === 'hga'){
      if (g.hga < 1) rotX(p, n, -5.0, -1.5, (1 - g.hga)*80*rad);
    } else if (UPPER[part]){
      if (part === 'primary' && Math.abs(p.x) > WING_X){
        var w = p.x > 0 ? g.wingS : g.wingP;
        if (w < 1) rotY(p, n, (p.x > 0 ? 1 : -1)*WING_X, WING_Z, (p.x > 0 ? 1 : -1)*(1 - w)*100*rad);
      }
      if (part === 'secondary' && g.secondary < 1){
        var f = 1 - g.secondary;
        if (name === 'secondary_2'){ var q = 0.2 + 0.8*g.secondary; p.y = SEC_TOP[1] + (p.y - SEC_TOP[1])*q; p.z = SEC_TOP[2] + (p.z - SEC_TOP[2])*q; }
        else rotX(p, n, SEC_H[1], SEC_H[2], -f*60*rad);
      }
      if (g.tower < 1) p.y -= (1 - g.tower)*TOWER;
    }
  }

  var store = null;
  /* les attributs glTF peuvent être entrelacés (position et normale dans un même tampon) : on passe par getX/setX */
  var NORM = { Int8Array:127, Uint8Array:255, Int16Array:32767, Uint16Array:65535 };
  function copy(at){
    var arr = at.isInterleavedBufferAttribute ? at.data.array : at.array, k = at.normalized ? (NORM[arr.constructor.name] || 1) : 1;
    var r = new Float32Array(at.count*3); for (var i=0;i<at.count;i++){ r[3*i] = at.getX(i)/k; r[3*i+1] = at.getY(i)/k; r[3*i+2] = at.getZ(i)/k; } return r;
  }
  /* remplace un attribut entrelacé ou entier (normales quantifiées du glTF) par un attribut en flottants, propre à cette géométrie */
  function own(geo, name){ var at = geo.attributes[name]; if (!at) return null; var f = new THREE.BufferAttribute(copy(at), 3); geo.setAttribute(name, f); return f; }
  function dirty(at){ if (at.isInterleavedBufferAttribute) at.data.needsUpdate = true; else at.needsUpdate = true; }
  /* mémorise les sommets d'origine et les passages repère local ↔ repère maquette (pièces à l'état éclaté 0) */
  function prepare(M){
    if (store && store.M === M) return store;
    var inv = new THREE.Matrix4().copy(M.root.matrixWorld).invert(), seen = new Set(), list = [];
    M.root.updateMatrixWorld(true);
    M.meshes.forEach(function(o){
      if (o.userData.interior || !o.geometry || !o.geometry.attributes.position) return;
      var k = o.userData.part; if (!(k === 'sunshield' || k === 'flap' || k === 'solar' || k === 'hga' || UPPER[k])) return;
      if (seen.has(o.geometry)) o.geometry = o.geometry.clone(); seen.add(o.geometry);
      if (o.userData.base) o.position.copy(o.userData.base); o.updateMatrixWorld(true);
      var m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), mi = new THREE.Matrix4().copy(m).invert();
      var pos = own(o.geometry, 'position'), nor = own(o.geometry, 'normal');
      list.push({ o:o, part:k, name:o.name, m:m, mi:mi, nm:new M3().getNormalMatrix(m), nmi:new M3().getNormalMatrix(mi),
        p0:pos.array.slice(0), n0:nor ? nor.array.slice(0) : null });
    });
    store = { M:M, list:list, v:STEPS.length - 1 };
    return store;
  }
  var p = new V3(), n = new V3();
  function set(M, v){
    var st = prepare(M); st.v = v;
    var g = {}; Object.keys(KEYS).forEach(function(k){ g[k] = ease(stage(v, k)); });
    st.list.forEach(function(e){
      var pos = e.o.geometry.attributes.position, nor = e.o.geometry.attributes.normal, i, j;
      for (i=0;i<pos.count;i++){
        j = 3*i;
        p.set(e.p0[j], e.p0[j+1], e.p0[j+2]).applyMatrix4(e.m);
        if (nor) n.set(e.n0[j], e.n0[j+1], e.n0[j+2]).applyMatrix3(e.nm); else n.set(0, 1, 0);
        deform(e.part, e.name, p, n, g);
        p.applyMatrix4(e.mi); pos.setXYZ(i, p.x, p.y, p.z);
        if (nor){ n.applyMatrix3(e.nmi).normalize(); nor.setXYZ(i, n.x, n.y, n.z); }
      }
      dirty(pos); if (nor) dirty(nor);
      e.o.geometry.computeBoundingSphere(); e.o.geometry.computeBoundingBox();
    });
  }
  function value(){ return store ? store.v : STEPS.length - 1; }
  return { STEPS:STEPS, set:set, value:value, last:STEPS.length - 1 };
})();
