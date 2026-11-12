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
  function svg(w,h,body,label){ return '<div class="svgwrap"><svg class="optic" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+label+'">'+body+'</svg></div>'; }

  /* télescope à deux miroirs dans l'axe : primaire en z = 0, ciel à gauche. Unités : mètres. */
  function twoMirror(o){
    var W = 560, k = (W-40)/(o.z1-o.z0), H = Math.round(2*o.half*k + 70), cy = H/2 + 4;
    function X(z){ return 20 + (z-o.z0)*k; } function Y(r){ return cy - r*k; }
    function sag(h){ return -h*h/(2*o.R); }
    var s = '';
    if (o.tube) s += P(o.tube.map(function(p){ return [X(p[0]), Y(p[1])]; }), SOFT, 1, '4 3') + P(o.tube.map(function(p){ return [X(p[0]), Y(-p[1])]; }), SOFT, 1, '4 3');
    [1,-1].forEach(function(sg){
      var pts = []; for (var i=0;i<=8;i++){ var h = o.hole + (o.r1-o.hole)*i/8; pts.push([X(sag(h)), Y(sg*h)]); }
      s += P(pts, INK, 4);
    });
    s += L(X(-o.d), Y(o.r2), X(-o.d), Y(-o.r2), INK, 4);
    o.rays.forEach(function(h){
      [1,-1].forEach(function(sg){
        var h2 = h*o.r2/o.r1*0.92;
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
      return twoMirror({ z0:-9.2, z1:4.2, half:2.25, R:11.04, r1:1.2, hole:0.3, r2:0.15, d:4.9, rays:[1.2, 0.62], focus:[1.5, 0], dLabel:'4,9 m',
        label:'Schéma optique de Hubble, à l\'échelle',
        tube:[[-9,1.55],[-0.4,1.55],[-0.4,2.1],[3.7,2.1],[3.7,0]],
        after:function(X, Y){
          return L(X(1.5), Y(0.22), X(1.5), Y(-0.22), DET, 4) +
            T(X(0.05)+8, Y(1.2)-4, 'Miroir primaire, 2,4 m', null, true) + T(X(-4.9), Y(0.15)-10, 'Miroir secondaire, 0,3 m', 'middle', true) +
            T(X(1.5)+8, Y(0)+4, 'Foyer', null, true) + T(X(1.5)+8, Y(0)+18, '1,5 m derrière', null) + T(X(1.5)+8, Y(0)+31, 'le primaire', null);
        } });
    },
    jwst: function(){
      return twoMirror({ z0:-8.3, z1:3.2, half:3.6, R:16.2, r1:3.25, hole:0.66, r2:0.37, d:7.17, rays:[3.25, 1.7], focus:[-1.55, 0], dLabel:'7,2 m',
        label:'Schéma optique de JWST',
        after:function(X, Y){
          var s = '<rect x="'+f(X(-2.0))+'" y="'+f(Y(0.55))+'" width="'+f(X(-0.1)-X(-2.0))+'" height="'+f(Y(-0.55)-Y(0.55))+'" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>';
          s += '<rect x="'+f(X(0.5))+'" y="'+f(Y(1.9))+'" width="'+f(X(2.9)-X(0.5))+'" height="'+f(Y(-1.9)-Y(1.9))+'" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>';
          s += P([[X(-1.55), Y(0)], [X(-0.25), Y(0.3)], [X(-1.2), Y(-0.28)], [X(1.6), Y(-0.9)]], RAY, 1.2) + P([[X(-1.55), Y(0)], [X(-0.25), Y(-0.05)], [X(-1.2), Y(-0.4)], [X(1.6), Y(-0.9)]], RAY, 1.2);
          s += L(X(-0.25), Y(0.42), X(-0.25), Y(-0.16), INK, 4) + L(X(-1.2), Y(-0.2), X(-1.2), Y(-0.48), INK, 4) + L(X(1.6), Y(-0.6), X(1.6), Y(-1.2), DET, 4);
          s += T(X(0)+12, Y(3.25)+2, 'Miroir primaire, 6,5 m', null, true) + T(X(-7.17)+2, Y(-0.37)+26, 'Miroir secondaire, 0,74 m', null, true);
          s += T(X(-2.0), Y(0.55)-20, 'Optique arrière', null, true) + T(X(-2.0), Y(0.55)-7, 'tertiaire et pointage fin', null) + T(X(1.7), Y(1.9)-7, 'Module d\'instruments', 'middle', true) + T(X(1.6)+9, Y(-0.9)+4, 'Plan focal', null);
          return s;
        } });
    },
    euclid: function(){
      return twoMirror({ z0:-2.6, z1:1.9, half:0.95, R:5.2, r1:0.6, hole:0.11, r2:0.175, d:1.756, rays:[0.6, 0.3], focus:[0.42, 0], dLabel:'1,756 m',
        label:'Schéma optique d\'Euclid',
        tube:[[-2.45,0.75],[-0.05,0.75]],
        after:function(X, Y){
          var s = P([[X(0.42), Y(0)], [X(0.7), Y(0)], [X(0.7), Y(-0.5)], [X(1.15), Y(-0.5)], [X(1.15), Y(0.1)], [X(1.6), Y(0.1)]], RAY, 1.2);
          s += P([[X(1.15), Y(0.1)], [X(1.15), Y(0.62)]], RAY, 1.2);
          s += L(X(0.63), Y(0.07), X(0.77), Y(-0.07), INK, 4) + L(X(0.63), Y(-0.43), X(0.77), Y(-0.57), INK, 4) + L(X(1.08), Y(-0.57), X(1.22), Y(-0.43), INK, 4);
          s += L(X(1.08), Y(0.03), X(1.22), Y(0.17), MID, 2.5) + L(X(1.02), Y(0.62), X(1.28), Y(0.62), DET, 4) + L(X(1.6), Y(0.23), X(1.6), Y(-0.03), DET, 4);
          s += T(X(0)-8, Y(0.6)-8, 'Miroir primaire, 1,2 m', 'end', true) + T(X(-1.756), Y(0.175)-10, 'Miroir secondaire, 0,35 m', 'middle', true);
          s += T(X(1.15), Y(0.62)-8, 'VIS', 'middle', true) + T(X(1.6)+7, Y(0.1)+4, 'NISP', null, true) + T(X(1.28), Y(0.1)-12, 'lame dichroïque', null) + T(X(0.95), Y(-0.5)+24, 'renvois et miroir tertiaire', 'middle');
          return s;
        } });
    },
    gaia: function(){
      var W = 560, H = 330, cx = 280, cy = 158, r = 112, a = 53.25*Math.PI/180, s = '';
      s += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+SOFT+'" stroke-width="10" opacity="0.5"/>';
      [[-1, RAY, 'Télescope 1'], [1, '#9A52D6', 'Télescope 2']].forEach(function(t){
        var sg = t[0], c = t[1], dx = sg*Math.sin(a), dy = -Math.cos(a);
        var m1 = [cx - dx*r, cy - dy*r], far = [cx + dx*(r+78), cy + dy*(r+78)], px = -dy, py = dx;
        [-22, 22].forEach(function(o){ s += L(far[0]+px*o, far[1]+py*o, m1[0]+px*o, m1[1]+py*o, c, 1.2); });
        s += L(m1[0]+px*30, m1[1]+py*30, m1[0]-px*30, m1[1]-py*30, INK, 4);
        var m2 = [cx + dx*r*0.72, cy + dy*r*0.72], m3 = [cx - dx*r*0.55, cy - dy*r*0.55 + 4], m4 = [cx + sg*9, cy - 54];
        s += P([[m1[0]+px*22, m1[1]+py*22], m2, m3, m4], c, 1.2) + P([[m1[0]-px*22, m1[1]-py*22], m2], c, 1.2);
        s += L(m2[0]+px*9, m2[1]+py*9, m2[0]-px*9, m2[1]-py*9, INK, 4) + L(m3[0]+px*11, m3[1]+py*11, m3[0]-px*11, m3[1]-py*11, INK, 4);
        s += P([m4, [cx, cy - 6], [cx + 46, cy + 30], [cx, cy + r - 4]], c, 1.2);
        s += T(far[0] + sg*4, far[1] - 8, t[2], sg < 0 ? 'start' : 'end', true);
        s += T(m1[0] + sg*-0 + (sg < 0 ? 14 : -14), m1[1] + 30, sg < 0 ? 'M1' : 'M1′', sg < 0 ? 'start' : 'end');
      });
      s += L(cx - 16, cy - 54, cx + 16, cy - 54, INK, 4) + L(cx - 9, cy - 6, cx + 9, cy - 6, INK, 4) + L(cx + 40, cy + 22, cx + 52, cy + 38, INK, 4) + L(cx - 34, cy + r - 4, cx + 34, cy + r - 4, DET, 5);
      s += T(cx, cy - 64, 'combineur de faisceaux', 'middle') + T(cx, cy + r + 16, 'Plan focal commun, 106 CCD', 'middle', true);
      s += T(cx, 16, 'angle entre les deux lignes de visée : 106,5°', 'middle');
      return svg(W, H, s, 'Schéma optique de Gaia, vue de dessus');
    }
  };

  var TEXT = {
    hubble:{ title:'Un Ritchey-Chrétien à deux miroirs', scale:'Figure à l\'échelle : diamètres, écart entre les miroirs et position du foyer sont exacts. La silhouette du tube, en pointillé, est indicative.',
      steps:['La lumière entre par l\'avant du tube et parcourt presque toute sa longueur jusqu\'au miroir primaire, concave, de 2,4 m.',
             'Le primaire la renvoie vers l\'avant, en un faisceau qui converge vers le miroir secondaire, convexe, de 0,3 m, placé 4,9 m plus haut.',
             'Le secondaire la renvoie à travers le trou central du primaire. Elle se concentre au foyer, 1,5 m derrière, où se trouvent les instruments.',
             'Les deux miroirs sont hyperboliques : cette combinaison corrige la coma et donne une image nette sur un champ plus large qu\'un Cassegrain classique.'],
      specs:[['Combinaison','Ritchey-Chrétien'],['Ouverture','2,4 m'],['Rapport focal du primaire','f/2,3'],['Longueur focale résultante','57,6 m · f/24'],['Écart primaire–secondaire','4,9 m'],['Échelle au foyer','3,58″ par mm']] },
    jwst:{ title:'Un anastigmat à trois miroirs', scale:'Diamètres des deux premiers miroirs et écart entre eux à l\'échelle. Le trajet dans l\'optique arrière et jusqu\'au plan focal est un schéma de principe.',
      steps:['Les 18 segments du miroir primaire se comportent comme un seul miroir concave de 6,5 m.',
             'Le miroir secondaire, convexe, de 0,74 m, tenu 7,2 m en avant par le trépied, renvoie le faisceau vers le centre du primaire.',
             'Le faisceau entre dans l\'optique arrière. Le miroir tertiaire y corrige les aberrations restantes ; le miroir de pointage fin, plan, stabilise l\'image.',
             'La lumière arrive enfin dans le module d\'instruments, derrière le primaire, où des miroirs de prélèvement la répartissent entre les quatre instruments.'],
      specs:[['Combinaison','anastigmat à trois miroirs (Korsch)'],['Ouverture','6,5 m · 25,4 m² collecteurs'],['Longueur focale résultante','131,4 m · f/20,2'],['Écart primaire–secondaire','≈ 7,2 m'],['Miroirs','primaire, secondaire, tertiaire, pointage fin']] },
    euclid:{ title:'Un Korsch à grand champ', scale:'Diamètres des deux premiers miroirs et écart entre eux à l\'échelle. Le trajet après le trou du primaire est un schéma de principe : en réalité il se replie sous le télescope.',
      steps:['Le miroir primaire de 1,2 m et le secondaire de 0,35 m, distants de 1,756 m, forment une première image derrière le primaire.',
             'Des miroirs de renvoi replient le faisceau vers le miroir tertiaire, qui corrige les aberrations sur tout le champ de 0,5 deg².',
             'Une lame dichroïque partage alors la lumière : le visible est réfléchi vers VIS, le proche infrarouge traverse vers NISP.',
             'Les deux instruments voient donc exactement le même champ, au même instant.'],
      specs:[['Combinaison','Korsch à trois miroirs, champ hors d\'axe'],['Ouverture','1,2 m'],['Longueur focale résultante','24,5 m · f/20,4'],['Écart primaire–secondaire','1,756 m'],['Matériau','carbure de silicium, miroirs et structure']] },
    gaia:{ title:'Deux télescopes, un seul plan focal', scale:'Schéma de principe, vue de dessus. Seul l\'angle entre les deux lignes de visée est exact.',
      steps:['Deux télescopes identiques, montés sur le même anneau, visent deux directions séparées de 106,5°.',
             'Chacun a un miroir primaire rectangulaire de 1,45 × 0,50 m, puis un secondaire et un tertiaire.',
             'Un combineur de faisceaux superpose les deux images, et deux derniers miroirs plans les conduisent sur le même plan focal.',
             'Mesurer en même temps des étoiles vues dans deux directions très écartées est ce qui permet d\'obtenir des parallaxes absolues.'],
      specs:[['Combinaison','2 anastigmats à trois miroirs'],['Miroirs primaires','1,45 × 0,50 m chacun'],['Longueur focale','35 m'],['Angle de base','106,5°'],['Miroirs','10 au total, en carbure de silicium']] }
  };

  /* ---------- plans focaux, en millimètres ---------- */
  function grid(nx, ny, w, h, gx, gy, color, lab){ var c = []; for (var j=0;j<ny;j++) for (var i=0;i<nx;i++){ var cc = typeof color === 'function' ? color(i, j) : color; if (cc) c.push({ x:i*(w+gx), y:j*(h+gy), w:w, h:h, c:cc }); } return { cells:c, w:nx*w+(nx-1)*gx, h:ny*h+(ny-1)*gy, lab:lab }; }
  var GC = { sm:'#7B858C', af:'#3D6BE0', bp:'#0F987A', rp:'#DB5A14', rvs:'#9A52D6', aux:'#C9A100' };
  var FP = {
    hubble:{ groups:[ grid(1,2,61.4,30.8,0,1.5,DET,['WFC3 / UVIS','2 CCD de 4096 × 2051 px, 15 µm']), grid(1,2,61.4,30.7,0,1.5,'#0F987A',['ACS / WFC','2 CCD de 4096 × 2048 px, 15 µm']), grid(1,1,18.3,18.3,0,0,'#DB5A14',['WFC3 / IR','1014 × 1014 px, 18 µm']) ],
             note:'Les trois détecteurs ne sont pas côte à côte dans le télescope : ils sont rapprochés ici pour comparer leur taille.' },
    jwst:{ groups:[ grid(2,2,36.7,36.7,3,3,DET,['NIRCam, voie courte','2 modules de 2 × 2 détecteurs']), grid(1,1,36.7,36.7,0,0,DET,['NIRCam, voie longue','1 détecteur par module']), grid(2,1,36.7,36.7,3,0,'#DB5A14',['NIRSpec','2 détecteurs']), grid(1,1,36.7,36.7,0,0,'#9A52D6',['NIRISS','1 détecteur']), grid(1,1,25.6,25.6,0,0,'#0F987A',['MIRI, imageur','1024 × 1024 px, 25 µm']) ],
           note:'Détecteurs proche infrarouge : HgCdTe de 2040 × 2040 px utiles, pixels de 18 µm. Un seul module de NIRCam est dessiné.' },
    euclid:{ groups:[ grid(6,6,49.2,49.6,2,2,DET,['VIS','36 CCD de 4096 × 4132 px, 12 µm']), grid(4,4,36.7,36.7,6,6,'#DB5A14',['NISP','16 détecteurs de 2040 × 2040 px, 18 µm']) ],
             note:'VIS mesure environ 30 cm de côté : c\'est l\'une des plus grandes caméras visibles envoyées dans l\'espace.' },
    gaia:{ groups:[ grid(17,7,45,59,4,1,function(i, j){ if (i===0) return j===3 ? null : (j===0||j===1||j===2) ? (j===2 ? GC.aux : GC.aux) : null; if (i<=2) return GC.sm; if (i<=10) return GC.af; if (i===11) return j===3 ? GC.aux : GC.af; if (i===12) return GC.bp; if (i===13) return GC.rp; return j<4 ? GC.rvs : null; }, ['Plan focal de Gaia','106 CCD de 4500 × 1966 px, 10 × 30 µm']) ],
           key:[[GC.aux,'contrôle (angle de base, front d\'onde)'],[GC.sm,'cartographe de ciel'],[GC.af,'champ astrométrique'],[GC.bp,'photomètre bleu'],[GC.rp,'photomètre rouge'],[GC.rvs,'spectromètre RVS']],
           note:'Les étoiles traversent le plan focal de gauche à droite pendant que le satellite tourne : détection, puis astrométrie, photométrie et enfin spectroscopie.' }
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
      '<div class="cap">'+d.note+' Taille des détecteurs à l\'échelle ; les espaces entre détecteurs sont indicatifs.</div>';
  }

  function render(tid, name){
    var t = TEXT[tid];
    return '<div class="inst-head"><div class="inst-h"><div class="inst-name">Trajet de la lumière</div><div class="inst-full">'+name+' : du ciel au détecteur</div></div><p class="inst-sum">'+t.title+'. '+t.steps[0]+'</p></div>' +
      '<div class="inst-cols">' +
      '<div class="isec"><h4>Schéma optique</h4>'+FIG[tid]()+'<div class="cap">'+t.scale+' Les rayons sont tracés en orange, les miroirs en trait épais, les détecteurs en bleu.</div></div>' +
      '<div class="isec"><h4>Étape par étape</h4><ol class="notes">'+t.steps.map(function(x){ return '<li>'+x+'</li>'; }).join('')+'</ol></div>' +
      '<div class="isec"><h4>Combinaison optique</h4><div class="stable">'+t.specs.map(function(r){ return '<div class="srow"><div class="k">'+r[0]+'</div><div class="v">'+r[1].split(' · ').join('<br>')+'</div></div>'; }).join('')+'</div></div>' +
      '<div class="isec"><h4>'+(tid==='gaia' ? 'Plan focal, à l\'échelle' : 'Détecteurs, à l\'échelle')+'</h4>'+focal(tid)+'</div>' +
      '</div>';
  }
  return { render:render };
})();
