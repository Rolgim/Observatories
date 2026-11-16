/* =================================================================
   INTÉRIEURS RECONSTRUITS (vue en coupe)
   Les maquettes publiques (NASA, ESA, Gaia Sky) sont des coques vides. On ajoute ici,
   en mètres et dans le repère de chaque maquette, ce que les sources disent se trouver
   à l'intérieur. Tailles des miroirs et écarts : valeurs publiées. Emplacement des
   équipements dans les modules de service : indicatif, les plans détaillés n'étant pas publics.
   Élément : { k: pièce de rattachement, l: libellé FR, en: libellé EN, f: forme, ... }
   Formes : disc (r, h, hole, ax), box (s:[x,y,z]), sph (r), cyl (r, h, ax), plate (s:[w,h], n: normale)
================================================================= */
var INTERIOR = (function(){
  var MIR = { color:0xE4E9EE, metalness:0.55, roughness:0.15, em:0x1E2A36 }, GOLD = { color:0xD9B45A, metalness:1, roughness:0.25 },
      BOX = { color:0x7D848C, metalness:0.35, roughness:0.6 }, TANK = { color:0xC7CBD0, metalness:0.7, roughness:0.35 },
      WHEEL = { color:0x4B5258, metalness:0.6, roughness:0.4 }, CCD = { color:0x4C64A0, metalness:0.3, roughness:0.35 }, PLATE = { color:0x50575E, metalness:0.4, roughness:0.6 }, INST = { color:0xB8A27A, metalness:0.5, roughness:0.45 }, TRUSS = { color:0x8A7A5C, metalness:0.3, roughness:0.6 };
  function ring(n, r, z0, fn){ var a = []; for (var i=0;i<n;i++){ var t = i/n*Math.PI*2; a.push(fn(Math.cos(t)*r, Math.sin(t)*r, i)); } return a; }
  var D = {
    /* Hubble : axe optique = z ; centre du tube vers y = −0,15 */
    hubble: [].concat(
      [{ k:'aft', l:'Miroir primaire : 2,4 m, percé d\'un trou de 0,6 m', en:'Primary mirror: 2.4 m, with a 0.6 m central hole', f:'disc', p:[0,-0.15,-2.55], r:1.2, hole:0.305, h:0.3, ax:'z', m:MIR },
       { k:'ota', l:'Miroir secondaire : 0,3 m, à 4,9 m du primaire', en:'Secondary mirror: 0.3 m, 4.9 m from the primary', f:'disc', p:[0,-0.15,2.35], r:0.15, h:0.08, ax:'z', m:MIR },
       { k:'ota', l:'Déflecteur du miroir secondaire', en:'Secondary mirror baffle', f:'cyl', p:[0,-0.15,2.15], r:0.32, h:0.5, ax:'z', open:true, m:TRUSS },
       { k:'ota', l:'Déflecteur central (longueur indicative)', en:'Central baffle (length indicative)', f:'cyl', p:[0,-0.15,-1.7], r:0.3, h:1.6, ax:'z', open:true, m:TRUSS },
       { k:'aft', l:'Structure du plan focal : la lumière y entre par le trou du primaire', en:'Focal plane structure: light enters through the primary\'s hole', f:'disc', p:[0,-0.15,-3.05], r:1.3, hole:0.0, h:0.12, ax:'z', m:PLATE }],
      /* treillis de maintien des miroirs : longerons et anneaux (diamètre indicatif) */
      ring(8, 1.38, 0, function(x, y){ return { k:'ota', l:'Treillis qui maintient l\'écart entre les miroirs', en:'Metering truss holding the mirror spacing', f:'cyl', p:[x, y-0.15, -0.1], r:0.025, h:4.8, ax:'z', m:TRUSS }; }),
      [{ k:'ota', l:'Treillis qui maintient l\'écart entre les miroirs', en:'Metering truss holding the mirror spacing', f:'torus', p:[0,-0.15,-2.3], r:1.38, tube:0.03, ax:'z', m:TRUSS },
       { k:'ota', l:'Treillis qui maintient l\'écart entre les miroirs', en:'Metering truss holding the mirror spacing', f:'torus', p:[0,-0.15,2.1], r:1.38, tube:0.03, ax:'z', m:TRUSS }],
      /* 4 instruments axiaux « de la taille d'une cabine téléphonique », juste derrière le primaire */
      [['STIS','STIS',-1,1],['NICMOS (hors service)','NICMOS (out of service)',1,1],['ACS','ACS',-1,-1],['COS','COS',1,-1]].map(function(a){
        return { k:'aft', l:'Instrument axial : ' + a[0], en:'Axial instrument: ' + a[1], f:'box', p:[a[2]*0.48, -0.15 + a[3]*0.48, -4.35], s:[0.88, 0.88, 2.2], m:INST }; }),
      /* 4 instruments radiaux autour de l'axe : WFC3 et les 3 FGS */
      [['WFC3','WFC3',0],['FGS 1','FGS 1',1],['FGS 2','FGS 2',2],['FGS 3','FGS 3',3]].map(function(a){
        var t = (a[2]*90 + 45)*Math.PI/180; return { k:'aft', l:'Instrument radial : ' + a[0], en:'Radial instrument: ' + a[1], f:'box', p:[Math.cos(t)*1.5, -0.15 + Math.sin(t)*1.5, -3.5], s:[0.7, 0.7, 0.9], m:INST }; }),
      /* section d'équipements : anneau de baies (batteries, ordinateur, communications) */
      ring(10, 1.85, 0, function(x, y, i){ return { k:'ssm', l:'Baie d\'équipement : batteries, ordinateur et communications (répartition indicative)', en:'Equipment bay: batteries, computer and communications (layout indicative)', f:'box', p:[x, y-0.15, -2.45], s:[0.75, 0.75, 1.3], rot:Math.atan2(y, x), m:BOX }; })
    ),
    /* Euclid : axe du télescope = y ; centre du tube vers x = 0,05, z = −0,03 */
    euclid: [
      { k:'baffle', l:'Miroir primaire : 1,2 m, carbure de silicium', en:'Primary mirror: 1.2 m, silicon carbide', f:'disc', p:[0.05,-0.08,-0.03], r:0.6, hole:0, h:0.1, ax:'y', m:MIR },
      { k:'baffle', l:'Miroir secondaire : 0,35 m, à 1,756 m du primaire', en:'Secondary mirror: 0.35 m, 1.756 m from the primary', f:'disc', p:[0.05,1.676,-0.03], r:0.175, h:0.05, ax:'y', m:MIR },
      { k:'instr', l:'Miroirs de renvoi et lame dichroïque (disposition indicative)', en:'Fold mirrors and dichroic plate (layout indicative)', f:'plate', p:[0.25,-0.45,0.1], s:[0.35,0.25], n:[1,1,0], m:MIR },
      { k:'instr', l:'VIS : plan focal de 36 CCD', en:'VIS: focal plane of 36 CCDs', f:'box', p:[-0.25,-0.55,0.35], s:[0.5,0.18,0.5], m:CCD },
      { k:'instr', l:'NISP : 16 détecteurs infrarouges, filtres et grismes', en:'NISP: 16 infrared detectors, filters and grisms', f:'box', p:[0.55,-0.6,-0.45], s:[0.55,0.45,0.6], m:INST },
      { k:'svm', l:'Électronique chaude de VIS et NISP, unités de commande et de traitement (emplacement indicatif)', en:'VIS and NISP warm electronics, control and data units (location indicative)', f:'box', p:[-0.75,-1.55,0.6], s:[0.6,0.6,0.5], m:BOX },
      { k:'svm', l:'Réservoir d\'ergols : 210,7 kg au lancement (emplacement indicatif)', en:'Propellant tank: 210.7 kg at launch (location indicative)', f:'sph', p:[0.75,-1.6,0.55], r:0.33, m:TANK },
      { k:'svm', l:'Réservoir d\'ergols : 210,7 kg au lancement (emplacement indicatif)', en:'Propellant tank: 210.7 kg at launch (location indicative)', f:'sph', p:[-0.7,-1.6,-0.6], r:0.33, m:TANK },
      { k:'svm', l:'Réservoir d\'azote de la micro-propulsion à gaz froid (emplacement indicatif)', en:'Nitrogen tank for the cold-gas micro-propulsion (location indicative)', f:'cyl', p:[0.75,-1.6,-0.6], r:0.2, h:0.75, ax:'y', m:TANK },
      { k:'svm', l:'Roues de réaction : 3 ou 4 servent aux pivotements (emplacement indicatif)', en:'Reaction wheels: 3 or 4 are used for slews (location indicative)', f:'disc', p:[0.05,-1.2,-0.03], r:0.18, h:0.09, ax:'y', m:WHEEL },
      { k:'svm', l:'Roues de réaction : 3 ou 4 servent aux pivotements (emplacement indicatif)', en:'Reaction wheels: 3 or 4 are used for slews (location indicative)', f:'disc', p:[0.05,-1.95,-0.03], r:0.18, h:0.09, ax:'y', m:WHEEL }
    ],
    /* Gaia : axe de rotation = y ; banc optique (tore) vers y = 0,24 */
    gaia: [
      { k:'torus', l:'Miroir primaire du télescope 1 : 1,45 × 0,50 m', en:'Telescope 1 primary mirror: 1.45 × 0.50 m', f:'plate', p:[Math.cos(-53.25*Math.PI/180)*1.15, 0.72, Math.sin(-53.25*Math.PI/180)*1.15], s:[1.45,0.5], n:[-Math.cos(-53.25*Math.PI/180), 0, -Math.sin(-53.25*Math.PI/180)], m:MIR },
      { k:'torus', l:'Miroir primaire du télescope 2 : 1,45 × 0,50 m, à 106,5° du premier', en:'Telescope 2 primary mirror: 1.45 × 0.50 m, 106.5° from the first', f:'plate', p:[Math.cos(-126.75*Math.PI/180)*1.15, 0.72, Math.sin(-126.75*Math.PI/180)*1.15], s:[1.45,0.5], n:[-Math.cos(-126.75*Math.PI/180), 0, -Math.sin(-126.75*Math.PI/180)], m:MIR },
      { k:'svm', l:'Ordinateur central, traitement des données et communications (emplacement indicatif)', en:'Central computer, data handling and communications (location indicative)', f:'box', p:[0.8,-1.15,0.5], s:[0.6,0.6,0.6], m:BOX },
      { k:'svm', l:'Traitement vidéo et stockage des données de la charge utile (emplacement indicatif)', en:'Payload video processing and data storage (location indicative)', f:'box', p:[-0.8,-1.15,0.5], s:[0.6,0.6,0.6], m:BOX },
      { k:'svm', l:'Propulsion chimique : réservoirs d\'ergols (emplacement indicatif)', en:'Chemical propulsion: propellant tanks (location indicative)', f:'sph', p:[0.6,-1.15,-0.7], r:0.33, m:TANK },
      { k:'svm', l:'Propulsion chimique : réservoirs d\'ergols (emplacement indicatif)', en:'Chemical propulsion: propellant tanks (location indicative)', f:'sph', p:[-0.6,-1.15,-0.7], r:0.33, m:TANK },
      { k:'svm', l:'Micro-propulsion à azote : réservoir (emplacement indicatif)', en:'Nitrogen micro-propulsion: tank (location indicative)', f:'cyl', p:[0,-1.15,-1.0], r:0.16, h:0.8, ax:'x', m:TANK },
      { k:'svm', l:'Batterie lithium-ion, pour le lancement (emplacement indicatif)', en:'Lithium-ion battery, for launch (location indicative)', f:'box', p:[0,-1.2,0.95], s:[0.45,0.3,0.3], m:BOX }
    ],
    /* JWST : module de service sous le bouclier, vers y = −4,3 */
    jwst: [
      { k:'bus', l:'Réservoirs d\'hydrazine et de peroxyde d\'azote, pour les moteurs SCAT et MRE-1 (emplacement indicatif)', en:'Hydrazine and dinitrogen tetroxide tanks, for the SCAT and MRE-1 thrusters (location indicative)', f:'sph', p:[-0.6,-4.3,-0.6], r:0.42, m:TANK },
      { k:'bus', l:'Réservoirs d\'hydrazine et de peroxyde d\'azote, pour les moteurs SCAT et MRE-1 (emplacement indicatif)', en:'Hydrazine and dinitrogen tetroxide tanks, for the SCAT and MRE-1 thrusters (location indicative)', f:'sph', p:[0.65,-4.3,-0.6], r:0.42, m:TANK },
      { k:'bus', l:'Réservoirs d\'hydrazine et de peroxyde d\'azote, pour les moteurs SCAT et MRE-1 (emplacement indicatif)', en:'Hydrazine and dinitrogen tetroxide tanks, for the SCAT and MRE-1 thrusters (location indicative)', f:'sph', p:[0,-4.3,0.7], r:0.42, m:TANK },
      { k:'bus', l:'Commande et données : processeur et enregistreur (emplacement indicatif)', en:'Command and data handling: processor and recorder (location indicative)', f:'box', p:[0.85,-4.3,0.9], s:[0.5,0.6,0.5], m:BOX },
      { k:'bus', l:'Énergie et communications (emplacement indicatif)', en:'Power and communications (location indicative)', f:'box', p:[-0.85,-4.3,0.9], s:[0.5,0.6,0.5], m:BOX },
      { k:'bus', l:'Roues de réaction, pour le pointage (nombre et emplacement indicatifs)', en:'Reaction wheels, for pointing (number and location indicative)', f:'disc', p:[0,-4.75,-0.1], r:0.2, h:0.1, ax:'y', m:WHEEL }
    ]
  };
  var AX = { x:new THREE.Euler(0, 0, Math.PI/2), y:new THREE.Euler(0, 0, 0), z:new THREE.Euler(Math.PI/2, 0, 0) };
  function geom(e){
    if (e.f === 'box') return new THREE.BoxGeometry(e.s[0], e.s[1], e.s[2]);
    if (e.f === 'sph') return new THREE.SphereGeometry(e.r, 24, 16);
    if (e.f === 'cyl') return new THREE.CylinderGeometry(e.r, e.r, e.h, 28, 1, !!e.open);
    if (e.f === 'torus') return new THREE.TorusGeometry(e.r, e.tube, 6, 64);
    if (e.f === 'plate') return new THREE.BoxGeometry(e.s[0], e.s[1], 0.04);
    if (e.f === 'disc'){
      if (!e.hole) return new THREE.CylinderGeometry(e.r, e.r, e.h, 48);
      var sh = new THREE.Shape(); sh.absarc(0, 0, e.r, 0, Math.PI*2, false);
      var hl = new THREE.Path(); hl.absarc(0, 0, e.hole, 0, Math.PI*2, true); sh.holes.push(hl);
      var g = new THREE.ExtrudeGeometry(sh, { depth:e.h, bevelEnabled:false, curveSegments:48 }); g.translate(0, 0, -e.h/2); g.rotateX(-Math.PI/2); return g;
    }
  }
  /* construit les éléments d'une maquette ; rangés dans un groupe caché tant que la coupe est inactive */
  function build(M){
    var list = D[M.t.id]; if (!list) return null;
    var grp = new THREE.Group(); grp.name = 'interieur'; grp.visible = false;
    M.interior = [];
    list.forEach(function(e){
      var mat = new THREE.MeshStandardMaterial({ color:e.m.color, metalness:e.m.metalness, roughness:e.m.roughness, side:THREE.DoubleSide, emissive:e.m.em || 0x000000 });
      var o = new THREE.Mesh(geom(e), mat);
      o.position.fromArray(e.p);
      if (e.ax && e.f !== 'box') o.rotation.copy(AX[e.ax]);
      if (e.f === 'plate') o.lookAt(new THREE.Vector3().fromArray(e.p).add(new THREE.Vector3().fromArray(e.n)));
      if (e.rot !== undefined) o.rotation.z = e.rot;
      o.castShadow = o.receiveShadow = true;
      o.userData.part = e.k; o.userData.label = e.l; o.userData.labelEn = e.en; o.userData.interior = true;
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
    M.interior.forEach(function(o){ if (on) o.layers.set(0); else o.layers.set(31); });
  }
  return { build:build, show:show, DATA:D };
})();
