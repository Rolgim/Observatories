/* =================================================================
   TRAJET DE LA LUMIÈRE (lot D des specs) — schémas optiques et plans focaux.
   Chaque figure dit ce qui est à l'échelle et ce qui est un schéma de principe.
   Couleurs neutres : ramenées aux jetons du thème par les règles « svg [fill=…] » de style.css.
================================================================= */
var Optics = (function(){
  var INK = '#14171A', MID = '#3A4147', SOFT = '#98A1A7', RAY = '#DB5A14', DET = '#3D6BE0';
  function f(n){ return Math.round(n*10)/10; }
  function L(x1,y1,x2,y2,c,w,d){ return '<line x1="'+f(x1)+'" y1="'+f(y1)+'" x2="'+f(x2)+'" y2="'+f(y2)+'" stroke="'+c+'" stroke-width="'+(w||1)+'"'+(d?' stroke-dasharray="'+d+'"':'')+' stroke-linecap="round"/>'; }
  function P(pts,c,w,d){ return '<polyline points="'+pts.map(function(p){ return f(p[0])+','+f(p[1]); }).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="'+(w||1)+'"'+(d?' stroke-dasharray="'+d+'"':'')+' stroke-linejoin="round" stroke-linecap="round"/>'; }
  function T(x,y,s,a,b){ return '<text x="'+f(x)+'" y="'+f(y)+'" fill="'+(b?INK:MID)+'" font-size="'+(b?12:11)+'" font-weight="'+(b?700:400)+'" font-family="Archivo, Arial, sans-serif"'+(a?' text-anchor="'+a+'"':'')+'>'+s+'</text>'; }
  function dim(x1,x2,y,s){ return L(x1,y,x2,y,MID,1) + L(x1,y-4,x1,y+4,MID,1) + L(x2,y-4,x2,y+4,MID,1) + T((x1+x2)/2, y-6, s, 'middle'); }
  /* élément optique relié à une pièce de la maquette : surligné quand on vient de cette pièce ou qu'on survole son bouton */
  function G(k, body){ return '<g data-el="'+k+'"'+(focus === k ? ' class="hl"' : '')+'>'+body+'</g>'; }
  var focus = null;
  function svg(w,h,body,label){ return '<div class="svgwrap"><svg class="optic" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+label+'">'+body+'</svg></div>'; }

  /* télescope à deux miroirs dans l'axe : primaire en z = 0, ciel à gauche. Unités : mètres. */
  function twoMirror(o){
    var W = 560, k = (W-40)/(o.z1-o.z0), H = Math.round(2*o.half*k + 70), cy = H/2 + 4;
    function X(z){ return 20 + (z-o.z0)*k; } function Y(r){ return cy - r*k; }
    function sag(h){ return -h*h/(2*o.R); }
    var s = '';
    if (o.tube) s += P(o.tube.map(function(p){ return [X(p[0]), Y(p[1])]; }), SOFT, 1, '4 3') + P(o.tube.map(function(p){ return [X(p[0]), Y(-p[1])]; }), SOFT, 1, '4 3');
    var pm = '';
    [1,-1].forEach(function(sg){
      var pts = []; for (var i=0;i<=8;i++){ var h = o.hole + (o.r1-o.hole)*i/8; pts.push([X(sag(h)), Y(sg*h)]); }
      pm += P(pts, INK, 4);
    });
    s += G(o.k1, pm) + G(o.k2, L(X(-o.d), Y(o.r2), X(-o.d), Y(-o.r2), INK, 4));
    o.rays.forEach(function(h){
      [1,-1].forEach(function(sg){
        var z = sag(h), t = (-o.d - z)/(-o.R/2 - z), h2 = h*(1 - t);   /* rayon réfléchi vers le foyer du primaire, coupé au plan du secondaire */
        s += P([[X(o.z0), Y(sg*h)], [X(sag(h)), Y(sg*h)], [X(-o.d), Y(sg*h2)], [X(o.focus[0]), Y(o.focus[1])]], RAY, 1.2);
      });
    });
    s += (o.after ? o.after(X, Y, k) : '');
    s += T(X(o.z0)+2, 14, 'lumière du ciel', null) + L(X(o.z0)+2, 22, X(o.z0)+46, 22, MID, 1) + '<path d="M'+f(X(o.z0)+46)+' 22 l-7 -4 v8 z" fill="'+MID+'"/>';
    s += dim(X(-o.d), X(0), H-12, o.dLabel);
    return svg(W, H, s, o.label);
  }

  var FIG = {
    hubble: function(){
      return twoMirror({ z0:-9.2, z1:4.2, half:2.25, R:11.04, r1:1.2, hole:0.3, r2:0.15, d:4.9, rays:[1.2, 0.62], focus:[1.5, 0], dLabel:'4,9 m', k1:'aft', k2:'ota',
        label:'Schéma optique de Hubble, à l\'échelle',
        tube:[[-9,1.55],[-0.4,1.55],[-0.4,2.1],[3.7,2.1],[3.7,0]],
        after:function(X, Y){
          return G('aft', L(X(1.5), Y(0.22), X(1.5), Y(-0.22), DET, 4)) +
            T(X(0.05)+8, Y(1.2)-4, 'Miroir primaire, 2,4 m', null, true) + T(X(-4.9), Y(0.15)-10, 'Miroir secondaire, 0,3 m', 'middle', true) +
            T(X(1.5)+8, Y(0)+4, 'Foyer', null, true) + T(X(1.5)+8, Y(0)+18, '1,5 m derrière', null) + T(X(1.5)+8, Y(0)+31, 'le primaire', null);
        } });
    },
    /* JWST : positions le long de l'axe et rayons de courbure de McElwain et al. 2023, tableau 2 (repère V, origine au sommet du primaire).
       Foyer Cassegrain et foyer final calculés par l'équation des miroirs (EFL obtenues : 59,6 m et 134 m, contre 59,4 et 131,4 publiés,
       l'écart venant du champ hors d'axe). Les décalages latéraux de l'optique arrière, de quelques centimètres en réalité, sont agrandis. */
    jwst: function(){
      var ZC = -1.382, ZT = 0.796, ZF = -1.048, ZI = 2.01;
      return twoMirror({ z0:-8.0, z1:3.3, half:3.6, R:15.8797, r1:3.3, hole:0.66, r2:0.369, d:7.169, rays:[3.3, 1.7], focus:[ZC, 0], dLabel:'7,169 m', k1:'primary', k2:'secondary',
        label:'Schéma optique de JWST, à l\'échelle',
        after:function(X, Y){
          var s = G('aos', '<rect x="'+f(X(-1.3))+'" y="'+f(Y(0.2))+'" width="'+f(X(1.0)-X(-1.3))+'" height="'+f(Y(-0.86)-Y(0.2))+'" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>' +
            L(X(ZT-0.03), Y(-0.1), X(ZT+0.03), Y(-0.6), INK, 4) + L(X(ZF), Y(-0.65), X(ZF), Y(-0.75), INK, 4));
          s += G('isim', '<rect x="'+f(X(1.35))+'" y="'+f(Y(-0.3))+'" width="'+f(X(3.1)-X(1.35))+'" height="'+f(Y(-1.9)-Y(-0.3))+'" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>' + L(X(ZI), Y(-0.86), X(ZI), Y(-1.14), DET, 4));
          [[-0.12, -0.66], [-0.58, -0.74]].forEach(function(r){ s += P([[X(ZC), Y(0)], [X(ZT), Y(r[0])], [X(ZF), Y(r[1])], [X(ZI), Y(-1.0)]], RAY, 1.2); });
          s += '<circle cx="'+f(X(ZC))+'" cy="'+f(Y(0))+'" r="2.5" fill="'+INK+'"/>';
          s += T(X(0)+12, Y(3.3)+2, 'Miroir primaire, 6,5 m', null, true) + T(X(-7.169)+2, Y(-0.369)+26, 'Miroir secondaire, 0,74 m', null, true);
          s += T(X(ZC)-6, Y(0)-8, 'foyer Cassegrain', 'end') + T(X(-1.3), Y(0.2)-20, 'Optique arrière', null, true) + T(X(-1.3), Y(0.2)-7, 'tertiaire (0,73 m) et pointage fin', null);
          s += T(X(2.2), Y(-1.9)+16, 'Module d\'instruments', 'middle', true) + T(X(ZI)+8, Y(-1.0)+4, 'foyer', null);
          return s;
        } });
    },
    /* Euclid : diamètres (M1 1,25 m, trou de 0,37 m ; M2 0,35 m), écart M1–M2 (1,756 m), plaque de base (2,5 m) et tailles du
       tertiaire et des miroirs de renvoi : Racca et al. 2016 et SPIE 11180. Rayons de courbure et positions de l'optique arrière
       non publiés : courbure du primaire et trajet arrière de principe. */
    euclid: function(){
      return twoMirror({ z0:-2.4, z1:2.2, half:1.32, R:5.2, r1:0.625, hole:0.184, r2:0.175, d:1.756, rays:[0.6, 0.3], focus:[0.42, 0], dLabel:'1,756 m', k1:'baffle', k2:'baffle',
        label:'Schéma optique d\'Euclid',
        tube:[[-2.3,0.75],[-0.05,0.75]],
        after:function(X, Y){
          function fold(z, y, half, d){ return L(X(z-half*0.707), Y(y+d*half*0.707), X(z+half*0.707), Y(y-d*half*0.707), INK, 4); }
          var s = L(X(0.32), Y(1.25), X(0.32), Y(-1.25), SOFT, 3) + T(X(0.32)+6, Y(-1.25)+4, 'plaque de base, 2,5 m', null);
          s += P([[X(0.42), Y(0)], [X(0.8), Y(0)], [X(0.8), Y(-0.75)], [X(1.45), Y(-0.75)], [X(1.45), Y(0.1)], [X(2.0), Y(0.1)]], RAY, 1.2);
          s += P([[X(1.45), Y(0.1)], [X(1.45), Y(0.62)]], RAY, 1.2);
          s += fold(0.8, 0, 0.179, 1) + fold(0.8, -0.75, 0.179, 1) + fold(1.45, -0.75, 0.268, -1);
          s += G('instr', fold(1.45, 0.1, 0.059, -1) + L(X(1.33), Y(0.62), X(1.57), Y(0.62), DET, 4) + L(X(2.0), Y(0.23), X(2.0), Y(-0.03), DET, 4));
          s += T(X(0), Y(0.75)-8, 'Miroir primaire, 1,2 m', 'end', true) + T(X(-1.756), Y(-0.175)+20, 'Miroir secondaire, 0,35 m', 'middle', true);
          s += T(X(1.45), Y(0.62)-8, 'VIS', 'middle', true) + T(X(2.0)-4, Y(0.23)-8, 'NISP', 'middle', true) + T(X(1.53), Y(0.1)+16, 'lame dichroïque', null) + T(X(1.12), Y(-0.75)+30, 'renvois et tertiaire (0,54 m)', 'middle');
          return s;
        } });
    },
    /* Gaia, vue de dessus : banc optique de ≈ 3 m (Gaia Collaboration 2016), ouvertures de 1,45 m, plan focal de 1 m dans le sens du
       balayage (Airbus, SPIE 10567) et angle de base de 106,5° à l'échelle ; positions des miroirs M2 à M6 non publiées, trajet de principe. */
    gaia: function(){
      var W = 560, H = 350, cx = 280, cy = 168, r = 112, K = r/1.5, a = 53.25*Math.PI/180, s = '';
      s += G('torus', '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+SOFT+'" stroke-width="10" opacity="0.5"/>');
      [[-1, RAY, 'Télescope 1'], [1, '#9A52D6', 'Télescope 2']].forEach(function(t){
        var sg = t[0], c = t[1], dx = sg*Math.sin(a), dy = -Math.cos(a);
        var m1 = [cx - dx*r, cy - dy*r], far = [cx + dx*(r+78), cy + dy*(r+78)], px = -dy, py = dx;
        var ap = ''; [-0.725*K, 0.725*K].forEach(function(o){ ap += L(far[0]+px*o, far[1]+py*o, m1[0]+px*o, m1[1]+py*o, c, 1.2); }); s += G('tent', ap);
        s += L(m1[0]+px*0.74*K, m1[1]+py*0.74*K, m1[0]-px*0.74*K, m1[1]-py*0.74*K, INK, 4);
        var m2 = [cx + dx*r*0.72, cy + dy*r*0.72], m3 = [cx - dx*r*0.55, cy - dy*r*0.55 + 4], m4 = [cx + sg*9, cy - 54];
        s += P([[m1[0]+px*0.725*K, m1[1]+py*0.725*K], m2, m3, m4], c, 1.2) + P([[m1[0]-px*0.725*K, m1[1]-py*0.725*K], m2], c, 1.2);
        s += L(m2[0]+px*9, m2[1]+py*9, m2[0]-px*9, m2[1]-py*9, INK, 4) + L(m3[0]+px*11, m3[1]+py*11, m3[0]-px*11, m3[1]-py*11, INK, 4);
        s += P([m4, [cx, cy - 6], [cx + 46, cy + 30], [cx, cy + r - 4]], c, 1.2);
        s += T(far[0] + sg*4, far[1] - 8, t[2], sg < 0 ? 'start' : 'end', true);
        s += T(m1[0] + sg*-0 + (sg < 0 ? 14 : -14), m1[1] + 30, sg < 0 ? 'M1' : 'M1′', sg < 0 ? 'start' : 'end');
      });
      s += L(cx - 16, cy - 54, cx + 16, cy - 54, INK, 4) + L(cx - 9, cy - 6, cx + 9, cy - 6, INK, 4) + L(cx + 40, cy + 22, cx + 52, cy + 38, INK, 4) + G('focal', L(cx - 0.5*K, cy + r - 4, cx + 0.5*K, cy + r - 4, DET, 5));
      s += T(cx, cy - 64, 'combineur de faisceaux', 'middle') + T(cx, cy + r + 16, 'Plan focal commun, 106 CCD', 'middle', true);
      s += T(cx, 16, 'angle entre les deux lignes de visée : 106,5°', 'middle');
      s += L(24, H-16, 24+K, H-16, MID, 1) + L(24, H-20, 24, H-12, MID, 1) + L(24+K, H-20, 24+K, H-12, MID, 1) + T(24+K/2, H-22, '1 m', 'middle') + T(24+K+10, H-12, 'banc optique de ≈ 3 m', null);
      return svg(W, H, s, 'Schéma optique de Gaia, vue de dessus');
    },
    /* Roman : ouverture (2,4 m) et obstruction centrale (30,3 %) publiées ; aucune prescription publique. Écart primaire–secondaire
       (≈ 2,4 m), trou du primaire et secondaire (≈ 0,42 m) mesurés sur la maquette NASA ; ils impliquent un primaire ouvert vers f/1,2.
       Foyer et optique arrière : trajet de principe. */
    roman: function(){
      var ZC = 0.45;
      return twoMirror({ z0:-6.0, z1:3.6, half:1.75, R:5.76, r1:1.2, hole:0.28, r2:0.21, d:2.4, rays:[1.2, 0.62], focus:[ZC, 0], dLabel:'≈ 2,4 m', k1:'ota', k2:'ota',
        label:'Schéma optique de Roman',
        tube:[[-5.7,1.55],[-0.2,1.55]],
        after:function(X, Y){
          var s = L(X(-2.4), Y(0.364), X(-2.4), Y(-0.364), SOFT, 2) ;
          s += G('instr', '<rect x="'+f(X(0.3))+'" y="'+f(Y(0.9))+'" width="'+f(X(2.5)-X(0.3))+'" height="'+f(Y(-1.2)-Y(0.9))+'" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>' +
            L(X(0.75)-6, Y(0.08), X(0.75)+6, Y(-0.08), INK, 4) + L(X(1.6), Y(-0.55)-10, X(1.6), Y(-0.55)+10, INK, 4) + L(X(2.3), Y(-0.95), X(2.3), Y(-0.45), DET, 5) +
            L(X(1.45), Y(0.6)-8, X(1.45), Y(0.6)+8, DET, 4));
          s += P([[X(ZC), Y(0)], [X(0.75), Y(0)], [X(1.6), Y(-0.55)], [X(2.3), Y(-0.7)]], RAY, 1.2) + P([[X(0.75), Y(0)], [X(1.0), Y(0.6)], [X(1.45), Y(0.6)]], RAY, 1.2, '4 3');
          s += T(X(0)-8, Y(1.55)-8, 'Miroir primaire, 2,4 m', 'end', true) + L(X(-2.4), Y(-0.4), X(-2.4), Y(-1.45), SOFT, 1) + T(X(-2.4), Y(-1.55)+14, 'Secondaire et son écran', 'middle', true);
          s += T(X(1.4), Y(-1.2)+16, 'Optique arrière et instruments', 'middle', true) + T(X(2.3)+6, Y(-0.7)+4, 'WFI', null, true) + T(X(1.45)+8, Y(0.6)+4, 'coronographe', null, true) + T(X(1.6), Y(-0.55)+24, 'tertiaire', 'middle');
          return s;
        } });
    }
  };

  /* correspondance entre les éléments optiques et les pièces cliquables de la maquette */
  var LINK3D = { hubble:[['aft','miroir primaire et instruments'],['ota','miroir secondaire']], jwst:[['primary','miroir primaire'],['secondary','miroir secondaire'],['aos','optique arrière'],['isim','module d\'instruments']],
                 euclid:[['baffle','télescope'],['instr','VIS et NISP']], gaia:[['torus','banc optique'],['focal','plan focal'],['tent','ouvertures de visée']], roman:[['ota','télescope'],['instr','WFI et coronographe']] };
  var TEXT = {
    hubble:{ title:'Un Ritchey-Chrétien à deux miroirs', scale:'Figure à l\'échelle : diamètres, écart entre les miroirs et position du foyer sont exacts. La silhouette du tube, en pointillé, est indicative.',
      steps:['La lumière entre par l\'avant du tube et parcourt presque toute sa longueur jusqu\'au miroir primaire, concave, de 2,4 m.',
             'Le primaire la renvoie vers l\'avant, en un faisceau qui converge vers le miroir secondaire, convexe, de 0,3 m, placé 4,9 m plus haut.',
             'Le secondaire la renvoie à travers le trou central du primaire. Elle se concentre au foyer, 1,5 m derrière, où se trouvent les instruments.',
             'Les deux miroirs sont hyperboliques : cette combinaison corrige la coma et donne une image nette sur un champ plus large qu\'un Cassegrain classique.'],
      specs:[['Combinaison','Ritchey-Chrétien'],['Ouverture','2,4 m'],['Rapport focal du primaire','f/2,3'],['Longueur focale résultante','57,6 m · f/24'],['Écart primaire–secondaire','4,9 m'],['Échelle au foyer','3,58″ par mm']] },
    jwst:{ title:'Un anastigmat à trois miroirs', scale:'Figure à l\'échelle le long de l\'axe : rayon de courbure du primaire, positions du secondaire, du tertiaire et du miroir de pointage fin d\'après la prescription publiée (McElwain et al. 2023, tableau 2) ; foyers calculés. Les décalages latéraux de l\'optique arrière, de quelques centimètres, sont agrandis pour séparer les faisceaux ; les modules en pointillé sont indicatifs.',
      steps:['Les 18 segments du miroir primaire se comportent comme un seul miroir concave de 6,5 m.',
             'Le miroir secondaire, convexe, de 0,74 m, tenu 7,2 m en avant par le trépied, renvoie le faisceau vers le centre du primaire.',
             'Le faisceau entre dans l\'optique arrière. Le miroir tertiaire y corrige les aberrations restantes ; le miroir de pointage fin, plan, stabilise l\'image.',
             'La lumière arrive enfin dans le module d\'instruments, derrière le primaire, où des miroirs de prélèvement la répartissent entre les quatre instruments.'],
      specs:[['Combinaison','anastigmat à trois miroirs (Korsch)'],['Ouverture','6,5 m · 25,4 m² collecteurs'],['Longueur focale résultante','131,4 m · f/20,2'],['Écart primaire–secondaire','7,169 m'],['Miroirs','primaire, secondaire, tertiaire, pointage fin']] },
    euclid:{ title:'Un Korsch à grand champ', scale:'À l\'échelle : diamètres et écart des deux premiers miroirs, trou du primaire, plaque de base et tailles du tertiaire et des renvois (Racca et al. 2016). Les rayons de courbure et la position des miroirs arrière ne sont pas publiés : la courbure du primaire et le trajet après son trou sont un schéma de principe ; en réalité ce trajet se replie sous la plaque de base.',
      steps:['Le miroir primaire de 1,2 m et le secondaire de 0,35 m, distants de 1,756 m, forment une première image derrière le primaire.',
             'Des miroirs de renvoi replient le faisceau vers le miroir tertiaire, qui corrige les aberrations sur tout le champ de 0,5 deg².',
             'Une lame dichroïque partage alors la lumière : le visible est réfléchi vers VIS, le proche infrarouge traverse vers NISP.',
             'Les deux instruments voient donc exactement le même champ, au même instant.'],
      specs:[['Combinaison','Korsch à trois miroirs, champ hors d\'axe'],['Ouverture','1,2 m'],['Longueur focale résultante','24,5 m · f/20,4'],['Écart primaire–secondaire','1,756 m'],['Matériau','carbure de silicium, miroirs et structure']] },
    gaia:{ title:'Deux télescopes, un seul plan focal', scale:'Vue de dessus. À l\'échelle : banc optique de ≈ 3 m, largeur des ouvertures (1,45 m), longueur du plan focal (1 m) et angle de 106,5° entre les lignes de visée. La position des miroirs M2 à M6 n\'est pas publiée : leur trajet est un schéma de principe.',
      steps:['Deux télescopes identiques, montés sur le même anneau, visent deux directions séparées de 106,5°.',
             'Chacun a un miroir primaire rectangulaire de 1,45 × 0,50 m, puis un secondaire et un tertiaire.',
             'Un combineur de faisceaux superpose les deux images, et deux derniers miroirs plans les conduisent sur le même plan focal.',
             'Mesurer en même temps des étoiles vues dans deux directions très écartées est ce qui permet d\'obtenir des parallaxes absolues.'],
      specs:[['Combinaison','2 anastigmats à trois miroirs'],['Miroirs primaires','1,45 × 0,50 m chacun'],['Longueur focale','35 m'],['Angle de base','106,5°'],['Miroirs','10 au total, en carbure de silicium']] },
    roman:{ title:'Un anastigmat à trois miroirs, construit autour d\'un télescope existant', scale:'Aucune prescription optique de Roman n\'est publique. Ouverture (2,4 m) et obstruction centrale (30,3 %) sont exactes ; écart entre les miroirs, trou du primaire et taille du secondaire sont mesurés sur la maquette 3D de la NASA (conception de 2015) et donc indicatifs. Optique arrière : schéma de principe. Les détecteurs, plus bas, sont à l\'échelle.',
      steps:['Le miroir primaire de 2,4 m, de la taille de celui de Hubble, et le secondaire forment l\'avant du télescope ; ils travaillent vers 265 K.',
             'Derrière le primaire, l\'optique arrière reprend le faisceau : un miroir orientable, un miroir de renvoi, puis le miroir tertiaire.',
             'Le tertiaire corrige les aberrations sur un champ très large et forme l\'image, ouverte à f/7,9, sur les 18 détecteurs du WFI.',
             'Une autre branche, de cinq miroirs dont un orientable, envoie un faisceau collimaté vers le coronographe.'],
      specs:[['Combinaison','anastigmat à trois miroirs'],['Ouverture','2,4 m · utile 2,36 m'],['Écart primaire–secondaire','≈ 2,4 m (maquette NASA)'],['Obstruction centrale','30,3 % du diamètre'],['Faisceau vers WFI','f/7,9'],['Température des miroirs','≈ 265 K (primaire et secondaire)']] }
  };

  /* ---------- plans focaux, en millimètres ---------- */
  function grid(nx, ny, w, h, gx, gy, color, lab){ var c = []; for (var j=0;j<ny;j++) for (var i=0;i<nx;i++){ var cc = typeof color === 'function' ? color(i, j) : color; if (cc) c.push({ x:i*(w+gx), y:j*(h+gy), w:w, h:h, c:cc }); } return { cells:c, w:nx*w+(nx-1)*gx, h:ny*h+(ny-1)*gy, lab:lab }; }
  /* détecteurs placés par leur centre (mm, y vers le haut) : mosaïques non régulières */
  function cells(list, w, h, color, lab){
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    list.forEach(function(p){ x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    return { cells:list.map(function(p){ return { x:p[0]-x0, y:y1-p[1], w:w, h:h, c:color }; }), w:x1-x0+w, h:y1-y0+h, lab:lab };
  }
  /* WFI : centres des 18 détecteurs dans le plan focal, en mm (GalSim, sca_positions_20210204.txt, d'après le projet Roman) */
  var WFI_MM = [[-22.14,12.15],[-22.29,-37.03],[-22.44,-82.06],[-66.42,20.90],[-66.92,-28.28],[-67.42,-73.06],[-110.70,42.20],[-111.48,-6.98],[-112.64,-51.06],
                [22.14,12.15],[22.29,-37.03],[22.44,-82.06],[66.42,20.90],[66.92,-28.28],[67.42,-73.06],[110.70,42.20],[111.48,-6.98],[112.64,-51.06]];
  var GC = { sm:'#7B858C', af:'#3D6BE0', bp:'#0F987A', rp:'#DB5A14', rvs:'#9A52D6', aux:'#C9A100' };
  var FP = {
    hubble:{ groups:[ grid(1,2,61.4,30.8,0,0.46,DET,['WFC3 / UVIS','2 CCD de 4096 × 2051 px, 15 µm']), grid(1,2,61.4,30.7,0,0.75,'#0F987A',['ACS / WFC','2 CCD de 4096 × 2048 px, 15 µm']), grid(1,1,18.3,18.3,0,0,'#DB5A14',['WFC3 / IR','1014 × 1014 px, 18 µm']) ],
             note:'Les trois détecteurs ne sont pas côte à côte dans le télescope : ils sont rapprochés ici pour comparer leur taille. Écart entre les deux CCD de chaque caméra : environ 31 px pour WFC3, 50 px pour ACS (manuels des instruments).', gaps:true },
    jwst:{ groups:[ grid(2,2,36.7,36.7,3,3,DET,['NIRCam, voie courte','2 modules de 2 × 2 détecteurs']), grid(1,1,36.7,36.7,0,0,DET,['NIRCam, voie longue','1 détecteur par module']), grid(2,1,36.7,36.7,3,0,'#DB5A14',['NIRSpec','2 détecteurs']), grid(1,1,36.7,36.7,0,0,'#9A52D6',['NIRISS','1 détecteur']), grid(1,1,25.6,25.6,0,0,'#0F987A',['MIRI, imageur','1024 × 1024 px, 25 µm']) ],
           note:'Détecteurs proche infrarouge : HgCdTe de 2040 × 2040 px utiles, pixels de 18 µm. Un seul module de NIRCam est dessiné.' },
    euclid:{ groups:[ grid(6,6,49.6,49.2,7.7,1.5,DET,['VIS','36 CCD de 4096 × 4132 px, 12 µm']), grid(4,4,36.7,36.7,6,3,'#DB5A14',['NISP','16 détecteurs de 2040 × 2040 px, 18 µm']) ],
             note:'La surface sensible de VIS mesure environ 34 × 30 cm : c\'est l\'une des plus grandes caméras visibles envoyées dans l\'espace. Ses CCD sont montés en six rangées, avec des espaces plus larges entre rangées (Euclid II, tableau 2). Pour NISP, espaces déduits du champ de 0,763 × 0,722° (Euclid I).', gaps:true },
    roman:{ groups:[ cells(WFI_MM,40.9,40.9,'#B8860B',['WFI','18 détecteurs de 4096 × 4096 px, 10 µm']) ],
             note:'Les 18 détecteurs forment six colonnes de trois, décalées en hauteur en arc. Positions des centres d\'après le modèle de champ du projet (GalSim).', gaps:true },
    gaia:{ groups:[ grid(17,7,45,59,4,1,function(i, j){ if (i===0) return j===3 ? null : (j===0||j===1||j===2) ? (j===2 ? GC.aux : GC.aux) : null; if (i<=2) return GC.sm; if (i<=10) return GC.af; if (i===11) return j===3 ? GC.aux : GC.af; if (i===12) return GC.bp; if (i===13) return GC.rp; return j>=3 ? GC.rvs : null; }, ['Plan focal de Gaia','106 CCD de 4500 × 1966 px, 10 × 30 µm']) ],
           key:[[GC.aux,'contrôle (angle de base, front d\'onde)'],[GC.sm,'cartographe de ciel'],[GC.af,'champ astrométrique'],[GC.bp,'photomètre bleu'],[GC.rp,'photomètre rouge'],[GC.rvs,'spectromètre RVS']],
           note:'Les étoiles traversent le plan focal de gauche à droite pendant que le satellite tourne : détection, puis astrométrie, photométrie et enfin spectroscopie. 17 colonnes et 7 rangées ; le spectromètre occupe les rangées 4 à 7, un capteur de front d\'onde remplace le dernier CCD astrométrique de la rangée 4 (documentation de Gaia DR3). La place des trois autres CCD de contrôle, dans la première colonne, est indicative.' }
  };
  function focal(tid){
    var d = FP[tid], W = 560, gap = 34, tw = 0, th = 0;
    d.groups.forEach(function(g){ tw += g.w; th = Math.max(th, g.h); }); tw += gap*(d.groups.length-1);
    var k = Math.min((W-24)/tw, 2.6), H = Math.round(th*k + 78), x = (W - tw*k)/2, s = '';
    d.groups.forEach(function(g){
      var y0 = 12 + (th - g.h)*k/2;
      g.cells.forEach(function(c){ s += '<rect x="'+f(x + c.x*k)+'" y="'+f(y0 + c.y*k)+'" width="'+f(c.w*k)+'" height="'+f(c.h*k)+'" fill="'+c.c+'" fill-opacity="0.8" stroke="#ECEEEF" stroke-width="0.6"/>'; });
      if (d.groups.length > 1 && d.groups.length <= 3) s += T(x + g.w*k/2, 12 + th*k + 16, g.lab[0], 'middle', true);
      x += (g.w + gap)*k;
    });
    var nice = [10,20,50,100,200], bar = 10; nice.forEach(function(n){ if (n*k <= 150) bar = n; });
    s += L(12, H-10, 12 + bar*k, H-10, INK, 2) + T(18 + bar*k, H-6, bar >= 100 ? (bar/10)+' cm' : bar+' mm');
    var leg = '<ul class="fov-leg">' + (d.key ? d.key.map(function(q){ return '<li><i style="background:'+q[0]+'"></i>'+q[1]+'</li>'; }) : d.groups.map(function(g){ return '<li><i style="background:'+g.cells[0].c+'"></i>'+g.lab[0]+'<span>'+g.lab[1]+'</span></li>'; })).join('') + '</ul>';
    return svg(W, H, s, 'Détecteurs du plan focal, à l\'échelle') + leg +
      '<div class="cap">'+d.note+' '+(d.gaps ? 'Détecteurs et espaces entre eux à l\'échelle.' : 'Taille des détecteurs à l\'échelle ; les espaces entre détecteurs sont indicatifs.')+'</div>';
  }

  /* tous les plans focaux à la même échelle, pour la page « Comparer » */
  function compareFocal(OBS, NAMES){
    var W = 1000, k = 0.8, gap = 40, rows = [[], [], []], s = '';
    /* rangée et rang de chaque observatoire : compare.fp dans data-tele.js */
    TELESCOPES.filter(function(t){ return FP[t.id]; }).sort(function(a, b){ return a.compare.fp[0] - b.compare.fp[0] || a.compare.fp[1] - b.compare.fp[1]; })
      .forEach(function(T){ var r = rows[T.compare.fp[0]] || (rows[T.compare.fp[0]] = []); FP[T.id].groups.forEach(function(g){ r.push({ t:T.id, g:g }); }); });
    var y = 10;
    rows.forEach(function(r){
      var tw = 0, th = 0; r.forEach(function(o){ tw += o.g.w*k; th = Math.max(th, o.g.h*k); }); tw += gap*(r.length - 1);
      var x = Math.max(8, (W - tw)/2);
      r.forEach(function(o){
        var y0 = y + (th - o.g.h*k);
        o.g.cells.forEach(function(c){ s += '<rect x="'+f(x + c.x*k)+'" y="'+f(y0 + c.y*k)+'" width="'+f(c.w*k)+'" height="'+f(c.h*k)+'" fill="'+OBS[o.t]+'" fill-opacity="0.8" stroke="#ECEEEF" stroke-width="0.5"/>'; });
        var cx = x + o.g.w*k/2, lab = o.g.lab[0].replace(' / ', ' ').replace('Plan focal de Gaia', 'Gaia, 106 CCD').replace(', voie courte', ' SW').replace(', voie longue', ' LW').replace(', imageur', '');
        s += T(cx, y + th + 15, lab, 'middle', true);
        x += o.g.w*k + gap;
      });
      y += th + 40;
    });
    s += L(12, y, 12 + 100*k, y, INK, 2) + T(18 + 100*k, y + 4, '10 cm');
    return '<div class="isec"><h4>Plans focaux, à la même échelle</h4>' + svg(W, y + 14, s, 'Détecteurs des observatoires à la même échelle') +
      '<div class="cap">Taille réelle des mosaïques de détecteurs. Le plan focal de Gaia mesure près d\'un mètre de long ; celui de VIS, sur Euclid, environ 34 × 30 cm ; celui du WFI de Roman, environ 27 × 17 cm ; un détecteur de Webb, moins de 4 cm. Espaces entre détecteurs indicatifs pour Gaia et Webb ; un seul module de NIRCam est dessiné.</div></div>';
  }

  function render(tid, name, part){
    var t = TEXT[tid]; focus = part || null;
    return '<div class="inst-head"><div class="inst-h"><div class="inst-name">Trajet de la lumière</div><div class="inst-full">'+name+' : du ciel au détecteur</div></div><p class="inst-sum">'+t.title+'. '+t.steps[0]+'</p></div>' +
      '<div class="inst-cols">' +
      '<div class="isec"><h4>Schéma optique</h4>'+FIG[tid]()+(focus && LINK3D[tid].some(function(l){ return l[0] === focus; }) ? '<div class="cap hl-cap">Surligné : '+LINK3D[tid].filter(function(l){ return l[0] === focus; })[0][1]+', la pièce choisie dans la maquette.</div>' : '')+'<div class="cap">'+t.scale+' Les rayons sont tracés en orange, les miroirs en trait épais, les détecteurs en bleu.</div><div class="chips" style="margin-top:12px"><span class="cap" style="margin:0 6px 0 0;align-self:center">Voir dans la maquette 3D :</span>'+LINK3D[tid].map(function(l){ return '<button class="chip'+(focus === l[0] ? ' on' : '')+'" data-jump3d="'+tid+':'+l[0]+'">'+l[1]+'</button>'; }).join('')+'</div></div>' +
      '<div class="isec"><h4>Étape par étape</h4><ol class="notes">'+t.steps.map(function(x){ return '<li>'+x+'</li>'; }).join('')+'</ol></div>' +
      '<div class="isec"><h4>Combinaison optique</h4><div class="stable">'+t.specs.map(function(r){ return '<div class="srow"><div class="k">'+r[0]+'</div><div class="v">'+r[1].split(' · ').join('<br>')+'</div></div>'; }).join('')+'</div></div>' +
      '<div class="isec"><h4>'+(tid==='gaia' ? 'Plan focal, à l\'échelle' : 'Détecteurs, à l\'échelle')+'</h4>'+focal(tid)+'</div>' +
      '</div>';
  }
  /* survol ou focus d'un bouton « Voir dans la maquette 3D » : on surligne l'élément correspondant du schéma */
  function mark(e, on){
    var b = e.target.closest ? e.target.closest('[data-jump3d]') : null; if (!b) return;
    var k = b.getAttribute('data-jump3d').split(':')[1], sv = b.closest('.isec') && b.closest('.isec').querySelector('svg.optic'); if (!sv) return;
    [].forEach.call(sv.querySelectorAll('g[data-el]'), function(g){ g.classList.toggle('hl', on ? g.getAttribute('data-el') === k : g.getAttribute('data-el') === focus); });
  }
  ['mouseover','focusin'].forEach(function(ev){ document.addEventListener(ev, function(e){ mark(e, true); }); });
  ['mouseout','focusout'].forEach(function(ev){ document.addEventListener(ev, function(e){ mark(e, false); }); });
  return { render:render, compareFocal:compareFocal, TEXT:TEXT, LINK3D:LINK3D, FP:FP };
})();
