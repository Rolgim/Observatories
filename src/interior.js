/* =================================================================
   INTÉRIEURS RECONSTRUITS (vue en coupe)
   Les maquettes publiques (NASA, ESA, Gaia Sky) sont des coques vides. On ajoute ici,
   en mètres et dans le repère de chaque maquette, les seuls éléments intérieurs dont la forme,
   la taille et la position sont publiées (ou calculées à partir de valeurs publiées, calcul dit).
   Le plan de coupe tranche la coque et l'intérieur : on voit une demi-section.
   Sans élément documenté, pas de coupe (bouton masqué).

   Sources. Hubble : NASA, SM3B Media Reference Guide, section 5 (HST Systems).
   Euclid : Racca et al. 2016 (arXiv:1610.05508). Gaia : Gaia Collaboration, Prusti et al. 2016 ;
   ESA, Service module ; Spaceflight101, Gaia Spacecraft Overview. Webb : NASA et STScI (JDox), Spacecraft bus.
   Roman : NASA Goddard, NTRS 2021 (Observatory Implementation) et 2024 (RST ACS Overview) ; NASA, Roman spacecraft.
   Chandra : Weisskopf et al. 2000 (astro-ph/0004127) et 2005 (astro-ph/0503319) ; Canizares et al. 2005 (HETG, astro-ph/0507035) ; CXC, POG.

   Repère : celui de la maquette recentrée, sauf liste marquée frame = 'file' (repère du fichier glTF).
   Formes : mirror (r, hole, h, R courbure) · disc/cyl (r, h) · cone (r1, r2, h) · box (s) · plate (s, n)
            sph (r) · tank (r, h : cylindre à fonds bombés) · torus (r, tube) · strut (a, b, r) · sector (r1, r2, a1, a2, h)
================================================================= */
var INTERIOR = (function(){
  var MIR = { color:0xE4E9EE, metalness:0.55, roughness:0.15, em:0x1E2A36 },
      BOX = { color:0x8E959C, metalness:0.35, roughness:0.6 }, ELEC = { color:0x6F8F86, metalness:0.3, roughness:0.6 },
      BATT = { color:0xB07A4A, metalness:0.3, roughness:0.6 }, COMM = { color:0x8A7FB0, metalness:0.3, roughness:0.6 },
      TANK = { color:0xD2D6DA, metalness:0.75, roughness:0.3 }, TANK2 = { color:0xC9B27A, metalness:0.7, roughness:0.35 }, GAS = { color:0x9FB4C8, metalness:0.7, roughness:0.35 },
      WHEEL = { color:0x4B5258, metalness:0.6, roughness:0.4 }, CCD = { color:0x4C64A0, metalness:0.3, roughness:0.35 },
      INST = { color:0xB8A27A, metalness:0.5, roughness:0.45 }, FGS = { color:0xA9AEB4, metalness:0.5, roughness:0.45 },
      TRUSS = { color:0x3A3F45, metalness:0.2, roughness:0.7 }, BAF = { color:0x26292D, metalness:0.1, roughness:0.9 },
      RING = { color:0x9A9488, metalness:0.7, roughness:0.4 }, SHELL = { color:0x7A8188, metalness:0.3, roughness:0.7 }, COOL = { color:0x5F8FB0, metalness:0.4, roughness:0.5 };
  var PI = Math.PI, rad = PI/180;
  function pol(r, deg, y){ return [Math.cos(deg*rad)*r, y, Math.sin(deg*rad)*r]; }           /* autour de l'axe y */
  function ind(fr, en){ return { l:fr + ' (emplacement indicatif)', en:en + ' (location indicative)' }; }
  function mk(base, extra){ var o = {}, k; for (k in base) o[k] = base[k]; for (k in extra) o[k] = extra[k]; return o; }

  /* Règle (spécifications, priorité 1, 19 novembre) : un élément n'est montré que si sa forme, sa taille ET sa position sont publiées,
     ou calculées à partir de valeurs publiées (champ calc). Champ s : la source, affichée au survol. Les équipements dont la place
     n'est pas publiée (réservoirs, roues, batteries, électronique) sont décrits, sans position, dans « Mission et traitements » (champ arch). */

  /* ---------------- Hubble : axe optique = z, V3 = y, V2 = x ; axe du tube à y = −0,15 ---------------- */
  var HY = -0.15, ZM = -2.5, ZS = ZM + 4.9;          /* face du primaire, puis secondaire 4,9 m plus loin (Lallo 2012) */
  function hubble(){
    var a = [], i, j, SG = 'NASA, SM3B Media Reference Guide, sect. 5', LA = 'Lallo 2012';
    a.push({ k:'ssm', l:'Miroir primaire : 2,4 m, verre à très faible dilatation, trou central de 0,6 m', en:'Primary mirror: 2.4 m, ultra-low expansion glass, 0.6 m central hole', f:'mirror', p:[0,HY,ZM], r:1.2, hole:0.3, h:0.3, R:11.04, ax:'z', m:MIR, s:LA + ' ; ' + SG, calc:'face du miroir posée au fond du tube de la maquette' });
    a.push({ k:'ssm', l:'Anneau principal en titane : 2,9 m, il porte le miroir primaire', en:'Titanium main ring: 2.9 m, it carries the primary mirror', f:'sector', p:[0,HY,ZM-0.33], r1:1.22, r2:1.45, a1:0, a2:360, h:0.38, m:RING, s:SG });
    a.push({ k:'ota', l:'Miroir secondaire : 0,3 m, convexe, à 4,9 m du primaire', en:'Secondary mirror: 0.3 m, convex, 4.9 m from the primary', f:'disc', p:[0,HY,ZS+0.04], r:0.15, h:0.08, ax:'z', m:MIR, s:LA });
    a.push({ k:'ota', l:'Déflecteur central : cône de 3 m planté dans le trou du primaire', en:'Central baffle: 3 m cone set in the primary\'s hole', f:'cone', p:[0,HY,ZM+1.5], r1:0.17, r2:0.3, h:3, ax:'z', open:true, m:BAF, s:SG });
    /* treillis : 4,8 m de long, 2,7 m de diamètre, 48 barres (SM3B) ; trois anneaux régulièrement espacés : calculé */
    var TR = 1.35, zr = [ZM+0.1, ZM+1.7, ZM+3.3, ZM+4.9], TL = 'Treillis en fibre de carbone : 4,8 m de long, 2,7 m de diamètre, 48 barres, il maintient l\'écart entre les miroirs', TE = 'Carbon-fibre metering truss: 4.8 m long, 2.7 m across, 48 struts, it holds the mirror spacing', TC = 'barres réparties régulièrement entre trois anneaux';
    for (i=1;i<4;i++) a.push({ k:'ota', l:TL, en:TE, f:'torus', p:[0,HY,zr[i]], r:TR, tube:0.035, ax:'z', m:TRUSS, s:SG, calc:TC });
    for (i=0;i<3;i++) for (j=0;j<16;j++){
      var t0 = (j + (j%2 ? 1 : 0))*22.5*rad, t1 = (j + (j%2 ? 0 : 1))*22.5*rad;
      a.push({ k:'ota', l:TL, en:TE, f:'strut', a:[Math.cos(t0)*TR, HY+Math.sin(t0)*TR, zr[i]], b:[Math.cos(t1)*TR, HY+Math.sin(t1)*TR, zr[i+1]], r:0.022, m:TRUSS, s:SG, calc:TC });
    }
    /* derrière le primaire : 4 instruments axiaux, un par quadrant du plan focal (HST Primer) ; centre de chaque boîte au milieu de son quadrant */
    var ZA = ZM - 2.55, PR = 'HST Primer, plan focal ; ' + SG;
    [['STIS','STIS',-1,1],['NICMOS (éteint)','NICMOS (switched off)',1,1],['ACS','ACS',-1,-1],['COS','COS',1,-1]].forEach(function(q){
      a.push({ k:'aft', l:'Instrument axial ' + q[0] + ' : 0,9 × 0,9 × 2,2 m, la taille d\'une cabine téléphonique', en:'Axial instrument ' + q[1] + ': 0.9 × 0.9 × 2.2 m, the size of a phone booth', f:'box', p:[q[2]*0.5, HY+q[3]*0.5, ZA], s:[0.9, 0.9, 2.2], m:INST, src:PR, calc:'boîte centrée dans son quadrant' });
    });
    return a;
  }

  /* ---------------- Euclid : axe du télescope = y ; centre vers x = 0,05, z = −0,03 ---------------- */
  var EX = 0.05, EZ = -0.03;
  function euclid(){
    var a = [], Y1 = -0.02, R = 'Racca et al. 2016';
    a.push({ k:'baffle', l:'Miroir primaire M1 : 1,2 m, carbure de silicium', en:'Primary mirror M1: 1.2 m, silicon carbide', f:'mirror', p:[EX,Y1,EZ], r:0.6, hole:0.11, h:0.09, R:3.2, ax:'y', m:MIR, s:R, calc:'posé sur la plaque de base, au fond du pare-soleil de la maquette' });
    a.push({ k:'baffle', l:'Miroir secondaire M2 : 0,35 m, à 1,756 m du primaire', en:'Secondary mirror M2: 0.35 m, 1.756 m from the primary', f:'disc', p:[EX,Y1+1.756+0.025,EZ], r:0.175, h:0.05, ax:'y', m:MIR, s:R });
    return a;
  }

  /* ---------------- Chandra : axe optique = x, la lumière entre côté porte (x < 0) et converge vers l'ISIM (x ≈ 10,3) ----------------
     Miroirs : 4 paires Wolter I de 83,3 cm (Weisskopf et al. 2005), diamètres au plan nodal 1,23 / 0,99 / 0,87 / 0,65 m (POG),
     focale 10,055 m ; plan nodal placé au milieu du boîtier de la maquette. HETG : Ø 1,1 m, à 8,6 m du plan focal, MEG derrière
     les deux coques externes, HEG derrière les deux internes (Canizares et al. 2005). ACIS-I au foyer : 2 × 2 CCD de 24,6 mm (POG). */
  function chandra(){
    var a = [], X0 = 0.25, F = 10.055, XF = X0 + F, L = 0.833, G = 0.02, W = 'Weisskopf et al. 2005 ; CXC, POG', CA = 'Canizares et al. 2005';
    [[0.615, 1], [0.495, 3], [0.435, 4], [0.325, 6]].forEach(function(s, i){
      var r = s[0], al = Math.atan(r/F)/4, n = s[1];
      a.push({ k:'hrma', f:'cone', p:[X0 - G - L/2, 0, 0], r1:r, r2:r + L*Math.tan(al), h:L, ax:'x', open:true, clip:true, m:MIR, s:W, calc:'pente = un quart de l\'angle de sortie ; plan nodal au milieu du boîtier de la maquette',
               l:'Paraboloïde de la paire ' + n + ' : Ø ' + (2*r).toFixed(2).replace('.', ',') + ' m au plan nodal, 83,3 cm de long, verre Zerodur poli et recouvert d\'iridium ; les rayons X l\'effleurent sous moins d\'un degré',
               en:'Paraboloid of pair ' + n + ': Ø ' + (2*r).toFixed(2) + ' m at the node plane, 83.3 cm long, polished Zerodur glass coated with iridium; X-rays graze it at less than one degree' });
      a.push({ k:'hrma', f:'cone', p:[X0 + G + L/2, 0, 0], r1:r - L*Math.tan(3*al), r2:r, h:L, ax:'x', open:true, clip:true, m:MIR, s:W, calc:'pente = trois quarts de l\'angle de sortie',
               l:'Hyperboloïde de la paire ' + n + ' : seconde réflexion, qui envoie les rayons X vers le foyer, 10,06 m plus loin',
               en:'Hyperboloid of pair ' + n + ': second reflection, sending the X-rays to the focus, 10.06 m further on' });
    });
    [[0.615, 'MEG'], [0.495, 'MEG'], [0.435, 'HEG'], [0.325, 'HEG']].forEach(function(s){
      var r = s[0] - 0.02;
      a.push({ k:'hrma', f:'sector', p:[XF - 8.6, 0, 0], r1:r - 0.05, r2:r + 0.02, a1:0, a2:360, h:0.04, rotY:PI/2, m:s[1] === 'MEG' ? INST : FGS, s:CA, calc:'un anneau de facettes derrière chaque coque',
               l:'Réseau HETG, inséré dans le faisceau à 8,6 m du foyer : facettes ' + s[1] + ' (192 MEG derrière les deux coques externes, 144 HEG derrière les deux internes). Le réseau LETG (540 facettes) s\'insère au même endroit par un autre bras',
               en:'HETG grating, swung into the beam 8.6 m from the focus: ' + s[1] + ' facets (192 MEG behind the two outer shells, 144 HEG behind the two inner ones). The LETG grating (540 facets) swings into the same place on another arm' });
    });
    a.push({ k:'isim', l:'ACIS-I au foyer : 2 × 2 CCD de 1024 × 1024 pixels de 24 µm, soit ≈ 5 cm de côté', en:'ACIS-I at the focus: 2 × 2 CCDs of 1024 × 1024 pixels of 24 µm, i.e. ≈ 5 cm across', f:'box', p:[XF - 0.002, 0, 0], s:[0.006, 0.0496, 0.0496], m:CCD, s2:'CXC, POG', calc:'placé au foyer des miroirs' });
    a.frame = 'file';   /* coordonnées dans le repère du fichier glTF, avant recentrage de la maquette */
    return a;
  }

  var D = { hubble:hubble(), euclid:euclid(), chandra:chandra() };
  /* source de chaque élément : champ s (texte) ; pour les boîtes, s est la taille, la source est dans src ou s2 */
  Object.keys(D).forEach(function(id){ D[id].forEach(function(e){ e.cite = (typeof e.s === 'string') ? e.s : (e.src || e.s2 || ''); }); });
  var SRC = {
    hubble:['Lallo 2012 ; NASA, guide de la mission SM3B, section 5 ; HST Primer', 'Lallo 2012; NASA, SM3B Media Reference Guide, section 5; HST Primer'],
    euclid:['Racca et al. 2016', 'Racca et al. 2016'],
    chandra:['Weisskopf et al. 2005 ; Canizares et al. 2005 ; CXC, guide de l\'observateur (POG)', 'Weisskopf et al. 2005; Canizares et al. 2005; CXC, Proposers\' Observatory Guide (POG)']
  };
  /* Chandra : l'avant (module de service et miroirs), le tube et le module d'instruments ont chacun leur plan */
  var CUT = { chandra:[{ parts:['bus', 'hrma'] }, { parts:['oba'] }, { parts:['isim'] }] };

  var AX = { x:[0, 0, -PI/2], y:[0, 0, 0], z:[PI/2, 0, 0] }, UP = new THREE.Vector3(0, 1, 0);
  function geom(e){
    var pts, i, g, sh, hl;
    if (e.f === 'box') return new THREE.BoxGeometry(e.s[0], e.s[1], e.s[2]);
    if (e.f === 'sph') return new THREE.SphereGeometry(e.r, 28, 18);
    if (e.f === 'cyl' || e.f === 'disc') return new THREE.CylinderGeometry(e.r, e.r, e.h, 40, 1, !!e.open);
    if (e.f === 'cone') return new THREE.CylinderGeometry(e.r1, e.r2, e.h, 40, 1, !!e.open);
    if (e.f === 'torus') return new THREE.TorusGeometry(e.r, e.tube, 8, 72);
    if (e.f === 'plate') return new THREE.BoxGeometry(e.s[0], e.s[1], 0.04);
    if (e.f === 'strut'){ var A = new THREE.Vector3().fromArray(e.a), B = new THREE.Vector3().fromArray(e.b); return new THREE.CylinderGeometry(e.r, e.r, A.distanceTo(B), 6); }
    if (e.f === 'tank'){
      pts = []; var hc = Math.max(0, e.h/2 - e.r);
      for (i=0;i<=8;i++){ var t = -PI/2 + i/8*PI/2; pts.push(new THREE.Vector2(Math.cos(t)*e.r, -hc + Math.sin(t)*e.r)); }
      for (i=0;i<=8;i++){ var u = i/8*PI/2; pts.push(new THREE.Vector2(Math.cos(u)*e.r, hc + Math.sin(u)*e.r)); }
      return new THREE.LatheGeometry(pts, 24);
    }
    if (e.f === 'mirror'){                      /* face réfléchissante concave tournée vers +y, flèche r²/2R */
      pts = []; var r0 = e.hole || 0.001;
      for (i=0;i<=12;i++){ var r = r0 + (e.r - r0)*i/12; pts.push(new THREE.Vector2(r, r*r/(2*e.R))); }
      pts.push(new THREE.Vector2(e.r, -e.h)); pts.push(new THREE.Vector2(r0, -e.h)); pts.push(new THREE.Vector2(r0, r0*r0/(2*e.R)));
      return new THREE.LatheGeometry(pts, 64);
    }
    if (e.f === 'sector'){                      /* anneau ou secteur d'anneau, extrudé le long de z */
      sh = new THREE.Shape(); sh.absarc(0, 0, e.r2, e.a1*rad, e.a2*rad, false);
      if (e.a2 - e.a1 >= 360){ hl = new THREE.Path(); hl.absarc(0, 0, e.r1, 0, PI*2, true); sh.holes.push(hl); }
      else { sh.absarc(0, 0, e.r1, e.a2*rad, e.a1*rad, true); sh.closePath(); }
      g = new THREE.ExtrudeGeometry(sh, { depth:e.h, bevelEnabled:false, curveSegments:48 }); g.translate(0, 0, -e.h/2); return g;
    }
  }
  /* construit les éléments d'une maquette ; cachés tant que la coupe est inactive */
  function build(M){
    var list = D[M.t.id]; if (!list) return null;
    var grp = new THREE.Group(); grp.name = 'interieur'; grp.visible = false;
    if (list.frame === 'file'){ grp.position.copy(M.inner.position); grp.scale.setScalar(M.scale); }
    M.interior = []; M.cut = CUT[M.t.id] || null;
    list.forEach(function(e){
      var mat = new THREE.MeshStandardMaterial({ color:e.m.color, metalness:e.m.metalness, roughness:e.m.roughness, side:THREE.DoubleSide, emissive:e.m.em || 0x000000 });
      var o = new THREE.Mesh(geom(e), mat);
      if (e.f === 'strut'){
        var A = new THREE.Vector3().fromArray(e.a), B = new THREE.Vector3().fromArray(e.b);
        o.position.copy(A).add(B).multiplyScalar(0.5); o.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
      } else {
        o.position.fromArray(e.p);
        if (e.f === 'plate') o.lookAt(new THREE.Vector3().fromArray(e.p).add(new THREE.Vector3().fromArray(e.n)));
        else if (e.radial !== undefined) o.quaternion.setFromUnitVectors(UP, new THREE.Vector3(Math.cos(e.radial*rad), Math.sin(e.radial*rad), 0));       /* axe radial autour de z */
        else if (e.radialY !== undefined) o.quaternion.setFromUnitVectors(UP, new THREE.Vector3(Math.cos(e.radialY*rad), 0, Math.sin(e.radialY*rad)));   /* axe radial autour de y */
        else if (e.rot !== undefined) o.rotation.z = e.rot;
        else if (e.rotY !== undefined) o.rotation.y = e.rotY;
        else if (e.rotX !== undefined) o.rotation.x = e.rotX;
        else if (e.ax && e.f !== 'box' && e.f !== 'sector' && e.f !== 'sph') o.rotation.fromArray(AX[e.ax]);
      }
      o.castShadow = o.receiveShadow = true;
      o.userData.part = e.k; o.userData.label = e.l + (e.cite ? ' — source : ' + e.cite + (e.calc ? ' (' + e.calc + ')' : '') : ''); o.userData.labelEn = e.en + (e.cite ? ' — source: ' + e.cite : ''); o.userData.interior = true; o.userData.clip = true;   /* tout l'intérieur est coupé avec la coque : on voit une demi-section, rien ne flotte devant */
      var P = M.parts[e.k]; o.userData.base = o.position.clone(); o.userData.ex = P ? P.off.clone() : new THREE.Vector3();
      o.layers.set(31);
      grp.add(o); M.interior.push(o); M.meshes.push(o); M.mats.push(mat); if (P) P.meshes.push(o);
    });
    M.root.add(grp); M.interiorGroup = grp;
    return grp;
  }
  function show(M, on){
    if (!M || !M.interiorGroup) return;
    M.interiorGroup.visible = on;
    M.interior.forEach(function(o){ o.layers.set(on ? 0 : 31); });
  }
  return { build:build, show:show, DATA:D, SRC:SRC, has:function(id){ return !!(D[id] && D[id].length); } };
})();
