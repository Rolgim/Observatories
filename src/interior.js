/* =================================================================
   INTÉRIEURS RECONSTRUITS (vue en coupe)
   Les maquettes publiques (NASA, ESA, Gaia Sky) sont des coques vides. On ajoute ici,
   en mètres et dans le repère de chaque maquette, ce que les sources disent se trouver
   à l'intérieur. Ces éléments ne sont pas coupés par le plan de coupe (sauf clip:true,
   pour les enveloppes qui cacheraient le reste) : la coque s'ouvre, l'intérieur reste entier.

   Ce qui est sourcé : dimensions des miroirs et écarts, nombre et nature des équipements,
   contenu des baies de Hubble. Ce qui est indicatif : l'emplacement précis dans les modules
   de service, les plans détaillés n'étant pas publics. Chaque libellé le dit.

   Sources. Hubble : NASA, SM3B Media Reference Guide, section 5 (HST Systems).
   Euclid : Racca et al. 2016 (arXiv:1610.05508). Gaia : Gaia Collaboration, Prusti et al. 2016 ;
   ESA, Service module ; Spaceflight101, Gaia Spacecraft Overview. Webb : NASA et STScI (JDox), Spacecraft bus.

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

  /* ---------------- Hubble : axe optique = z, V3 = y, V2 = x ; axe du tube à y = −0,15 ---------------- */
  var HY = -0.15, ZM = -2.5, ZS = ZM + 4.9;          /* face du primaire, puis secondaire 4,9 m plus loin */
  function hubble(){
    var a = [], i, j;
    a.push({ k:'ssm', l:'Miroir primaire : 2,4 m, verre à très faible dilatation, trou central de 0,6 m', en:'Primary mirror: 2.4 m, ultra-low expansion glass, 0.6 m central hole', f:'mirror', p:[0,HY,ZM], r:1.2, hole:0.3, h:0.3, R:11.04, ax:'z', m:MIR });
    a.push({ k:'ssm', l:'Anneau principal en titane : 2,9 m, il porte le miroir primaire', en:'Titanium main ring: 2.9 m, it carries the primary mirror', f:'sector', p:[0,HY,ZM-0.33], r1:1.22, r2:1.45, a1:0, a2:360, h:0.38, m:RING });
    a.push({ k:'ota', l:'Miroir secondaire : 0,3 m, convexe, à 4,9 m du primaire', en:'Secondary mirror: 0.3 m, convex, 4.9 m from the primary', f:'disc', p:[0,HY,ZS+0.04], r:0.15, h:0.08, ax:'z', m:MIR });
    a.push({ k:'ota', l:'Déflecteur du miroir secondaire', en:'Secondary mirror baffle', f:'cone', p:[0,HY,ZS-0.2], r1:0.2, r2:0.3, h:0.6, ax:'z', open:true, m:BAF });
    a.push({ k:'ota', l:'Déflecteur central : cône de 3 m planté dans le trou du primaire', en:'Central baffle: 3 m cone set in the primary\'s hole', f:'cone', p:[0,HY,ZM+1.5], r1:0.17, r2:0.3, h:3, ax:'z', open:true, m:BAF });
    /* treillis : 4,8 m de long, 2,7 m de diamètre, 48 barres sur trois anneaux, moyeu du secondaire */
    var TR = 1.35, zr = [ZM+0.1, ZM+1.7, ZM+3.3, ZM+4.9], TL = 'Treillis en fibre de carbone : 4,8 m de long, 48 barres, il maintient l\'écart entre les miroirs', TE = 'Carbon-fibre metering truss: 4.8 m long, 48 struts, it holds the mirror spacing';
    for (i=1;i<4;i++) a.push({ k:'ota', l:TL, en:TE, f:'torus', p:[0,HY,zr[i]], r:TR, tube:0.035, ax:'z', m:TRUSS });
    for (i=0;i<3;i++) for (j=0;j<16;j++){
      var t0 = (j + (j%2 ? 1 : 0))*22.5*rad, t1 = (j + (j%2 ? 0 : 1))*22.5*rad;
      a.push({ k:'ota', l:TL, en:TE, f:'strut', a:[Math.cos(t0)*TR, HY+Math.sin(t0)*TR, zr[i]], b:[Math.cos(t1)*TR, HY+Math.sin(t1)*TR, zr[i+1]], r:0.022, m:TRUSS });
    }
    for (j=0;j<4;j++){ var ts = (45 + j*90)*rad; a.push({ k:'ota', l:'Araignée : quatre lames qui tiennent le miroir secondaire', en:'Spider: four vanes holding the secondary mirror', f:'strut', a:[Math.cos(ts)*TR, HY+Math.sin(ts)*TR, zr[3]], b:[Math.cos(ts)*0.2, HY+Math.sin(ts)*0.2, ZS+0.1], r:0.015, m:TRUSS }); }
    /* section d'équipements : anneau de baies autour du primaire ; contenu sourcé, ordre des baies sourcé, sens de rotation indicatif */
    var BAYS = [
      ['Baie 1 : ordinateur de bord et gestion des données','Bay 1: flight computer and data management', ELEC],
      ['Baie 2 : batteries et horloge','Bay 2: batteries and clock', BATT],
      ['Baie 3 : batteries','Bay 3: batteries', BATT],
      ['Baie 4 : régulation et distribution de l\'énergie','Bay 4: power control and distribution', ELEC],
      null,
      ['Baie 5 : communications et enregistreur de données','Bay 5: communications and data recorder', COMM],
      ['Baie 6 : deux roues de réaction de 59 cm','Bay 6: two 59 cm reaction wheels', WHEEL],
      ['Baie 7 : commande des mécanismes','Bay 7: mechanism control', ELEC],
      null,
      ['Baie 8 : électronique de pointage et enregistreur de données','Bay 8: pointing electronics and data recorder', ELEC],
      ['Baie 9 : deux roues de réaction de 59 cm','Bay 9: two 59 cm reaction wheels', WHEEL],
      ['Baie 10 : commande et données des instruments','Bay 10: science instrument control and data handling', COMM]
    ];
    BAYS.forEach(function(b, n){
      if (!b) return;
      var mid = 90 - n*30 - 15, c = Math.cos(mid*rad), s = Math.sin(mid*rad), zc = ZM - 0.1;
      if (b[2] === WHEEL){
        [-0.36, 0.36].forEach(function(dz){ a.push({ k:'ssm', l:b[0], en:b[1], f:'disc', p:[c*1.8, HY+s*1.8, zc+dz], r:0.295, h:0.22, radial:mid, m:WHEEL, clip:true }); });
      } else if (b[2] === BATT){
        a.push({ k:'ssm', l:b[0], en:b[1], f:'box', p:[c*1.82, HY+s*1.82, zc], s:[0.25, 0.9, 0.9], rot:mid*rad, m:BATT, clip:true });
      } else a.push({ k:'ssm', l:b[0], en:b[1], f:'box', p:[c*1.8, HY+s*1.8, zc], s:[0.4, 0.8, 1.1], rot:mid*rad, m:b[2], clip:true });
    });
    /* derrière le primaire : structure du plan focal, 3 FGS et WFC3 en position radiale, 4 instruments axiaux */
    var ZR = ZM - 1.05, ZA = ZM - 2.55;
    [['FGS 1','FGS 1',0],['FGS 2','FGS 2',90],['FGS 3','FGS 3',180]].forEach(function(g){
      var c = Math.cos(g[2]*rad), s = Math.sin(g[2]*rad);
      a.push({ k:'aft', l:'Capteur de guidage fin ' + g[0] + ' : 1,5 × 1 m, en position radiale', en:'Fine guidance sensor ' + g[1] + ': 1.5 × 1 m, radial position', f:'box', p:[c*1.15, HY+s*1.15, ZR], s:[1.5, 1.0, 0.5], rot:g[2]*rad, m:FGS });
    });
    a.push({ k:'aft', l:'WFC3 : caméra à grand champ, en position radiale, côté radiateur', en:'WFC3: wide field camera, radial position, radiator side', f:'box', p:[0, HY-1.1, ZR], s:[1.6, 0.9, 0.55], rot:-90*rad, m:INST });
    a.push({ k:'aft', l:'Miroir de renvoi : il prélève le centre du champ pour WFC3', en:'Pick-off mirror: it takes the centre of the field for WFC3', f:'plate', p:[0, HY, ZR+0.1], s:[0.14, 0.14], n:[0,-1,1], m:MIR });
    [['STIS','STIS',-1,1],['NICMOS (éteint)','NICMOS (switched off)',1,1],['ACS','ACS',-1,-1],['COS','COS',1,-1]].forEach(function(q){
      a.push({ k:'aft', l:'Instrument axial ' + q[0] + ' : 0,9 × 0,9 × 2,2 m, la taille d\'une cabine téléphonique', en:'Axial instrument ' + q[1] + ': 0.9 × 0.9 × 2.2 m, the size of a phone booth', f:'box', p:[q[2]*0.5, HY+q[3]*0.5, ZA], s:[0.9, 0.9, 2.2], m:INST });
    });
    a.push({ k:'aft', l:'Structure du plan focal : elle porte les instruments derrière le miroir', en:'Focal plane structure: it holds the instruments behind the mirror', f:'box', p:[0, HY, ZA], s:[0.06, 2.0, 2.2], m:TRUSS });
    a.push({ k:'aft', l:'Structure du plan focal : elle porte les instruments derrière le miroir', en:'Focal plane structure: it holds the instruments behind the mirror', f:'box', p:[0, HY, ZA], s:[2.0, 0.06, 2.2], m:TRUSS });
    [-0.45, 0, 0.45].forEach(function(dx){ a.push(mk(ind('Viseur d\'étoiles et gyroscopes, du côté opposé au Soleil', 'Star tracker and gyroscopes, on the side away from the Sun'), { k:'aft', f:'cyl', p:[dx, HY-1.75, ZA+0.3], r:0.13, h:0.5, ax:'y', m:BOX })); });
    return a;
  }

  /* ---------------- Euclid : axe du télescope = y ; centre vers x = 0,05, z = −0,03 ---------------- */
  var EX = 0.05, EZ = -0.03;
  function euclid(){
    var a = [], Y1 = -0.02, YS = -1.6;
    function at(r, deg, y){ var p = pol(r, deg, y); return [p[0]+EX, p[1], p[2]+EZ]; }
    a.push({ k:'baffle', l:'Miroir primaire M1 : 1,2 m, carbure de silicium', en:'Primary mirror M1: 1.2 m, silicon carbide', f:'mirror', p:[EX,Y1,EZ], r:0.6, hole:0.11, h:0.09, R:3.2, ax:'y', m:MIR });
    a.push({ k:'baffle', l:'Miroir secondaire M2 : 0,35 m, à 1,756 m du primaire', en:'Secondary mirror M2: 0.35 m, 1.756 m from the primary', f:'disc', p:[EX,Y1+1.756+0.025,EZ], r:0.175, h:0.05, ax:'y', m:MIR });
    a.push(mk(ind('Miroir tertiaire M3, sous la plaque de base', 'Tertiary mirror M3, below the baseplate'), { k:'instr', f:'mirror', p:[EX-0.45,-0.82,EZ], r:0.2, hole:0, h:0.05, R:3, ax:'y', m:MIR }));
    a.push(mk(ind('Lame dichroïque : le visible part vers VIS, l\'infrarouge vers NISP', 'Dichroic plate: visible light goes to VIS, infrared to NISP'), { k:'instr', f:'plate', p:[EX+0.1,-0.55,EZ+0.1], s:[0.28,0.22], n:[1,0.2,1], m:{ color:0xD9B45A, metalness:0.9, roughness:0.2 } }));
    a.push(mk(ind('VIS : plan focal de 36 CCD', 'VIS: focal plane of 36 CCDs'), { k:'instr', f:'box', p:[EX-0.35,-0.55,EZ+0.5], s:[0.42,0.4,0.12], m:CCD }));
    a.push(mk(ind('NISP : 16 détecteurs infrarouges, roues à filtres et à grismes', 'NISP: 16 infrared detectors, filter and grism wheels'), { k:'instr', f:'box', p:[EX+0.6,-0.58,EZ-0.2], s:[0.5,0.5,1.0], m:INST }));
    /* module de service : base hexagonale autour d'un cône central qui contient le réservoir d'hydrazine */
    a.push({ k:'svm', l:'Cône central : il porte le télescope et contient le réservoir d\'hydrazine', en:'Central cone: it carries the telescope and houses the hydrazine tank', f:'cone', p:[EX,YS,EZ], r1:0.55, r2:0.83, h:1.2, ax:'y', open:true, m:SHELL, clip:true });
    a.push({ k:'svm', l:'Réservoir d\'hydrazine, au centre : 137,5 kg', en:'Hydrazine tank, at the centre: 137.5 kg', f:'sph', p:[EX,YS,EZ], r:0.4, m:TANK });
    [0, 120, 180, 300].forEach(function(d){ a.push(mk(ind('Réservoir d\'azote à haute pression : 4 réservoirs, 70 kg en tout, pour le pointage fin', 'High-pressure nitrogen tank: 4 tanks, 70 kg in all, for fine pointing'), { k:'svm', f:'tank', p:at(1.08, d, YS), r:0.17, h:0.85, ax:'y', m:GAS })); });
    [[60,-1.3],[60,-1.9],[240,-1.3],[240,-1.9]].forEach(function(w){ a.push(mk(ind('Roue de réaction : 4 roues, elles font pivoter le satellite d\'un champ à l\'autre', 'Reaction wheel: 4 wheels, they slew the satellite from one field to the next'), { k:'svm', f:'disc', p:at(1.1, w[0], w[1]), r:0.17, h:0.1, radialY:w[0], m:WHEEL })); });
    [['Électronique chaude de VIS','VIS warm electronics',ELEC],['Électronique chaude de NISP','NISP warm electronics',ELEC],['Ordinateur de bord et mémoire de masse','On-board computer and mass memory',COMM],
     ['Distribution de l\'énergie et batterie','Power distribution and battery',BATT],['Émetteurs en bande K et en bande X','K-band and X-band transmitters',COMM],['Électronique du contrôle d\'attitude','Attitude control electronics',ELEC]].forEach(function(u, i){
      var d = 30 + i*60; a.push(mk(ind(u[0] + ', sur un panneau latéral', u[1] + ', on a side panel'), { k:'svm', f:'box', p:at(1.32, d, YS+0.05), s:[0.22,0.7,0.6], rotY:-d*rad, m:u[2] }));
    });
    return a;
  }

  /* ---------------- Gaia : axe de rotation = y ; banc optique (tore de 3 m) vers y = 0,24 ---------------- */
  function gaia(){
    var a = [], YS = -1.13, L1 = 36.75, L2 = 143.25;      /* directions de visée, séparées de 106,5° */
    [[L1,'1'],[L2,'2']].forEach(function(t){
      var m1 = pol(1.25, t[0]+180, 0.75), m2 = pol(1.3, t[0], 1.15), n = pol(1, t[0], 0);
      a.push({ k:'torus', l:'Miroir primaire du télescope ' + t[1] + ' : 1,45 × 0,50 m, carbure de silicium', en:'Telescope ' + t[1] + ' primary mirror: 1.45 × 0.50 m, silicon carbide', f:'plate', p:m1, s:[1.45,0.5], n:n, m:MIR });
      a.push(mk(ind('Miroir secondaire du télescope ' + t[1] + ', en face du primaire', 'Telescope ' + t[1] + ' secondary mirror, facing the primary'), { k:'torus', f:'plate', p:m2, s:[0.35,0.16], n:[-n[0],0,-n[2]], m:MIR }));
    });
    /* module de service : six panneaux radiaux autour d'un tube central de 1,17 m */
    a.push({ k:'svm', l:'Tube central : 1,17 m de long, il porte la charge utile', en:'Central tube: 1.17 m long, it carries the payload', f:'cyl', p:[0,YS,0], r:0.5, h:1.17, ax:'y', open:true, m:SHELL, clip:true });
    for (var i=0;i<6;i++) a.push({ k:'svm', l:'Panneau radial : six panneaux relient le tube central aux côtés', en:'Radial panel: six panels link the central tube to the sides', f:'box', p:pol(1.0, i*60, YS), s:[1.0,1.0,0.025], rotY:-i*60*rad, m:SHELL, clip:true });
    [30, 210].forEach(function(d){ a.push(mk(ind('Réservoir d\'ergols : 2 réservoirs, environ 400 kg, pour rejoindre L2 et s\'y maintenir', 'Propellant tank: 2 tanks, about 400 kg, to reach L2 and stay there'), { k:'svm', f:'sph', p:pol(1.0, d, YS), r:0.36, m:TANK })); });
    [150, 330].forEach(function(d){ a.push(mk(ind('Réservoir d\'azote : 2 réservoirs de 28,5 kg à 310 bar, pour la micro-propulsion', 'Nitrogen tank: 2 tanks of 28.5 kg at 310 bar, for micro-propulsion'), { k:'svm', f:'sph', p:pol(1.0, d, YS), r:0.26, m:GAS })); });
    [[90,'Unités de traitement vidéo : elles repèrent les étoiles dans le flux des CCD','Video processing units: they pick out the stars in the CCD stream',ELEC],
     [270,'Mémoire de la charge utile et ordinateur central','Payload data storage and central computer',COMM]].forEach(function(u){
      a.push(mk(ind(u[1], u[2]), { k:'svm', f:'box', p:pol(1.28, u[0]-12, YS), s:[0.22,0.7,0.45], rotY:-(u[0]-12)*rad, m:u[3] }));
      a.push(mk(ind(u[1], u[2]), { k:'svm', f:'box', p:pol(1.28, u[0]+12, YS), s:[0.22,0.7,0.45], rotY:-(u[0]+12)*rad, m:u[3] }));
    });
    a.push(mk(ind('Batterie lithium-ion, pour le lancement', 'Lithium-ion battery, for launch'), { k:'svm', f:'box', p:pol(1.25, 150, YS-0.15), s:[0.2,0.3,0.4], rotY:-150*rad, m:BATT }));
    a.push(mk(ind('Régulation et distribution de l\'énergie', 'Power control and distribution'), { k:'svm', f:'box', p:pol(1.25, 330, YS-0.1), s:[0.2,0.4,0.5], rotY:-330*rad, m:ELEC }));
    return a;
  }

  /* ---------------- Webb : module de service sous le bouclier, y de −5,06 à −3,47 ---------------- */
  function jwst(){
    var a = [], Y = -4.27;
    a.push(mk(ind('Réservoir d\'hydrazine : 168 kg au lancement', 'Hydrazine tank: 168 kg at launch'), { k:'bus', f:'sph', p:[-0.55,Y,0.3], r:0.45, m:TANK }));
    a.push(mk(ind('Réservoir de peroxyde d\'azote : 133 kg au lancement', 'Dinitrogen tetroxide tank: 133 kg at launch'), { k:'bus', f:'sph', p:[0.55,Y,0.3], r:0.36, m:TANK2 }));
    [-0.3, 0.3].forEach(function(dx){ a.push(mk(ind('Réservoir d\'hélium : 2 réservoirs, ils mettent les ergols sous pression', 'Helium tank: 2 tanks, they pressurise the propellants'), { k:'bus', f:'sph', p:[dx,Y+0.3,-0.55], r:0.2, m:GAS })); });
    for (var i=0;i<6;i++) a.push(mk(ind('Roue de réaction : 6 roues, elles orientent l\'observatoire sans consommer d\'ergols', 'Reaction wheel: 6 wheels, they turn the observatory without using propellant'), { k:'bus', f:'disc', p:[-1.0 + (i%3)*1.0, Y-0.5, i<3 ? 1.35 : -1.3], r:0.19, h:0.11, ax:'y', m:WHEEL }));
    a.push(mk(ind('Compresseur du cryoréfrigérateur de MIRI : il refroidit l\'instrument à 7 K', 'MIRI cryocooler compressor: it cools the instrument to 7 K'), { k:'bus', f:'box', p:[-1.0,Y+0.1,-1.3], s:[0.6,0.6,0.7], m:COOL }));
    a.push(mk(ind('Commande et données : processeur et enregistreur de 58,9 Go', 'Command and data handling: processor and 58.9 GB recorder'), { k:'bus', f:'box', p:[1.05,Y+0.1,-1.3], s:[0.5,0.6,0.7], m:COMM }));
    a.push(mk(ind('Énergie : régulateur, distribution et batterie lithium-ion', 'Power: regulator, distribution and lithium-ion battery'), { k:'bus', f:'box', p:[1.1,Y+0.1,1.5], s:[0.5,0.6,0.6], m:BATT }));
    a.push(mk(ind('Émetteurs et récepteurs en bandes S et Ka', 'S-band and Ka-band transmitters and receivers'), { k:'bus', f:'box', p:[-1.1,Y+0.1,1.5], s:[0.5,0.6,0.6], m:COMM }));
    return a;
  }

  var D = { hubble:hubble(), euclid:euclid(), gaia:gaia(), jwst:jwst() };
  var SRC = {
    hubble:['NASA, guide de la mission SM3B, section 5', 'NASA, SM3B Media Reference Guide, section 5'],
    euclid:['Racca et al. 2016', 'Racca et al. 2016'],
    gaia:['Gaia Collaboration, Prusti et al. 2016 ; ESA ; Spaceflight101', 'Gaia Collaboration, Prusti et al. 2016; ESA; Spaceflight101'],
    jwst:['NASA et STScI, module de service', 'NASA and STScI, spacecraft bus']
  };
  /* Webb : le module de service et le module d'instruments s'ouvrent, chacun avec son plan de coupe ; le bouclier et les miroirs restent entiers */
  var CUT = { jwst:[{ parts:['bus'] }, { parts:['isim'], c:[0, 1.65, -0.45] }] };

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
        else if (e.ax && e.f !== 'box' && e.f !== 'sector' && e.f !== 'sph') o.rotation.fromArray(AX[e.ax]);
      }
      o.castShadow = o.receiveShadow = true;
      o.userData.part = e.k; o.userData.label = e.l; o.userData.labelEn = e.en; o.userData.interior = true; o.userData.clip = !!e.clip;
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
  return { build:build, show:show, DATA:D, SRC:SRC };
})();
