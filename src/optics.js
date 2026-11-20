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
    /* Spitzer : prescription du Spitzer Telescope Handbook, tableau 3.3 (valeurs à 5,5 K) : primaire hyperbolique R = 2 040 mm,
       Ø 850 mm, trou de 320 mm ; secondaire convexe Ø 120 mm à 887,528 mm du primaire ; foyer 437 mm derrière le sommet du primaire.
       Chambre des instruments (MIC) : boîte indicative. */
    spitzer: function(){
      return twoMirror({ z0:-1.25, z1:0.85, half:0.5, R:2.04, r1:0.425, hole:0.16, r2:0.06, d:0.887528, rays:[0.42, 0.25], focus:[0.437, 0], dLabel:'0,888 m', k1:'tele', k2:'tele',
        label:'Schéma optique de Spitzer, à l\'échelle',
        tube:[[-1.2,0.49],[-0.05,0.49]],
        after:function(X, Y){
          var s = G('cta', '<rect x="'+f(X(0.12))+'" y="'+f(Y(0.36))+'" width="'+f(X(0.78)-X(0.12))+'" height="'+f(Y(-0.36)-Y(0.36))+'" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>' + L(X(0.437), Y(0.05), X(0.437), Y(-0.05), DET, 4));
          s += T(X(0)+8, Y(0.425)-6, 'Miroir primaire, 0,85 m', null, true) + T(X(-0.8875), Y(-0.06)+22, 'Secondaire, 0,12 m', 'middle', true);
          s += T(X(0.45), Y(-0.36)+16, 'Chambre des instruments', 'middle', true) + T(X(0.437)+8, Y(0)+4, 'foyer', null);
          return s;
        } });
    },
    /* Fermi, LAT : pas de miroir. Coupe schématique d'une tour (Atwood et al. 2009) : 18 plans de silicium, tungstène dans les 16 premiers
       (12 fins, 4 épais), calorimètre de 8 couches de cristaux de CsI. Nombres exacts, épaisseurs et espacements non à l'échelle. */
    fermi: function(){
      var W = 560, H = 380, x0 = 90, x1 = 310, yt = 54, s = '';
      s += G('lat', '<rect x="'+(x0-12)+'" y="'+(yt-14)+'" width="'+(x1-x0+24)+'" height="'+(H-yt-26)+'" fill="none" stroke="'+SOFT+'" stroke-width="5"/>');
      var py = [];
      for (var i=0;i<18;i++){ var y = yt + 8 + i*9.5; py.push(y); s += L(x0, y, x1, y, DET, 1.6); if (i < 16) s += L(x0, y - 2.5, x1, y - 2.5, INK, i < 12 ? 1 : 2.6); }
      var yc = yt + 8 + 18*9.5 + 10;
      for (var j=0;j<8;j++) for (var k=0;k<12;k++){ var cw = (x1-x0)/12; s += '<rect x="'+f(x0 + k*cw + 0.6)+'" y="'+f(yc + j*11)+'" width="'+f(cw - 1.2)+'" height="9.5" fill="#C9A100" fill-opacity="'+(j%2 ? 0.55 : 0.8)+'"/>'; }
      var xg = 182, yconv = py[3] - 2.5;
      s += P([[xg - 40, 6], [xg, yconv]], RAY, 1.6) + '<path d="M'+(xg - 40)+' 6 l2 9 l6 -6 z" fill="'+RAY+'"/>';
      s += P([[xg, yconv], [xg - 36, yc + 30]], '#2F6FDB', 1.3) + P([[xg, yconv], [xg + 46, yc + 30]], '#D6457A', 1.3);
      for (var m=0;m<6;m++){ var a = -0.9 + m*0.36; s += L(xg + (m - 2.5)*10, yc + 34, xg + (m - 2.5)*10 + Math.sin(a)*22, yc + 70, '#C9A100', 1); }
      s += '<circle cx="'+xg+'" cy="'+f(yconv)+'" r="3" fill="'+INK+'"/>';
      s += T(xg - 36, 14, 'photon gamma', 'end', true) + T(x1 + 18, py[0] + 4, 'bouclier de scintillateurs', null) + T(x1 + 18, py[6] + 4, 'trajectographe : 18 plans de silicium', null, true) + T(x1 + 18, py[6] + 18, 'tungstène dans les 16 premiers', null);
      s += T(x1 + 18, yc + 34, 'calorimètre : 8 couches', null, true) + T(x1 + 18, yc + 48, 'de 12 cristaux de CsI', null);
      s += T(xg + 8, yconv - 6, 'conversion en paire', null) + T(xg - 40, yc + 24, 'e⁻', 'end', true) + T(xg + 50, yc + 24, 'e⁺', null, true);
      s += T(x0 - 12, H - 8, 'Une des 16 tours, en coupe ; schéma de principe', null);
      return svg(W, H, s, 'Principe du LAT de Fermi : une tour en coupe');
    },
    /* Swift, BAT : masque codé en coupe (description de BAT, NASA Goddard) : masque 1 m au-dessus du plan de détecteurs de 1,2 m.
       Largeur du masque indicative (2,7 m², coins coupés) ; 24 cases dessinées au lieu de ≈ 54 000 tuiles de 5 mm. Deux sources :
       l'une à la verticale, l'autre à 25°, dont l'ombre est décalée de tan 25° × 1 m ≈ 0,47 m. */
    swift: function(){
      var W = 600, H = 330, k = 180, cx = 300, ym = 92, yd = ym + k, s = '', pat = '101100101110010011010110', n = pat.length, mw = 2.4, cw = mw/n;
      function X(m){ return cx + m*k; }
      var mask = '';
      for (var i=0;i<n;i++) if (pat[i] === '0') mask += '<rect x="'+f(X(-mw/2 + i*cw))+'" y="'+(ym-4)+'" width="'+f(cw*k)+'" height="8" fill="'+INK+'"/>';
      mask += L(X(-mw/2), ym, X(mw/2), ym, SOFT, 1);
      s += G('bat', mask + '<rect x="'+f(X(-0.6))+'" y="'+yd+'" width="'+f(1.2*k)+'" height="10" fill="'+DET+'"/>');
      [[0, RAY, 'source A, à la verticale'], [Math.tan(25*Math.PI/180), '#7A4FB5', 'source B, à 25°']].forEach(function(src, sI){
        var sh = src[0], c = src[1], lay = '';
        for (var i=0;i<n;i++){
          if (pat[i] !== '1') continue;
          var a = -mw/2 + i*cw, b = a + cw, a2 = Math.max(a - sh, -0.6), b2 = Math.min(b - sh, 0.6);
          if (b2 <= a2) continue;
          if (i % 3 === sI) s += P([[X(a + cw/2 + sh*0.45), ym - 0.45*k], [X(a + cw/2), ym], [X(a + cw/2 - sh), yd]], c, 1, '3 3');
          lay += '<rect x="'+f(X(a2))+'" y="'+(yd + 14 + sI*10)+'" width="'+f((b2 - a2)*k)+'" height="7" fill="'+c+'"/>';
        }
        s += lay;
        s += T(sI ? X(0.62) : X(-0.62), ym - 0.45*k + 4, src[2], sI ? null : 'end', true);
      });
      s += T(X(mw/2) + 6, ym + 4, 'masque', null, true) + T(X(mw/2) + 6, ym + 18, 'tuiles de plomb', null);
      s += T(X(0.6) + 8, yd + 9, 'détecteurs CZT', null, true);
      s += T(X(0.6) + 8, yd + 21, 'ombre de A', null) + T(X(0.6) + 8, yd + 31, 'ombre de B', null);
      s += L(X(-mw/2) - 16, ym, X(-mw/2) - 16, yd, MID, 1) + T(X(-mw/2) - 20, (ym + yd)/2 + 4, '1 m', 'end');
      s += dim(X(-0.6), X(0.6), H - 12, 'plan de détecteurs : 1,2 m');
      return svg(W, H, s, 'Principe du masque codé de BAT, sur Swift');
    },
    /* INTEGRAL, IBIS : coupe de principe (ISDC) : masque codé, puis deux plans de détecteurs, ISGRI (CdTe, basses énergies) au-dessus de PICsIT (CsI).
       Un photon de basse énergie s'arrête dans ISGRI ; un photon plus énergétique peut diffuser dans ISGRI et s'arrêter dans PICsIT (mode Compton). Pas à l'échelle. */
    integral: function(){
      var W = 560, H = 330, x0 = 90, x1 = 330, ym = 70, yi = 230, yp = 262, s = '', pat = '1011001011100100', n = pat.length, cw = (x1 - x0)/n, mask = '';
      for (var i=0;i<n;i++) if (pat[i] === '0') mask += '<rect x="'+f(x0 + i*cw)+'" y="'+(ym-4)+'" width="'+f(cw)+'" height="8" fill="'+INK+'"/>';
      s += G('ibis', mask + L(x0, ym, x1, ym, SOFT, 1) + '<rect x="'+x0+'" y="'+yi+'" width="'+(x1-x0)+'" height="10" fill="'+DET+'"/>' + '<rect x="'+x0+'" y="'+yp+'" width="'+(x1-x0)+'" height="18" fill="#C9A100" fill-opacity="0.8"/>');
      s += P([[x0 + 2.5*cw, 14], [x0 + 2.5*cw, yi + 5]], RAY, 1.4) + '<circle cx="'+f(x0 + 2.5*cw)+'" cy="'+(yi + 5)+'" r="3" fill="'+INK+'"/>';
      var xc = x0 + 8.5*cw; s += P([[xc - 30, 14], [xc, yi + 5], [xc + 34, yp + 9]], '#7A4FB5', 1.4) + '<circle cx="'+f(xc)+'" cy="'+(yi + 5)+'" r="3" fill="'+INK+'"/><circle cx="'+f(xc + 34)+'" cy="'+(yp + 9)+'" r="3" fill="'+INK+'"/>';
      s += T(x0 + 2.5*cw + 6, 24, 'photon de basse énergie', null) + T(xc - 26, 24, 'photon de haute énergie', 'end');
      s += T(x1 + 12, ym + 4, 'masque codé', null, true) + T(x1 + 12, yi + 9, 'ISGRI : 16 384 CdTe', null, true) + T(x1 + 12, yp + 13, 'PICsIT : 4 096 CsI', null, true);
      s += T(xc + 40, yp - 4, 'diffusion Compton', null);
      s += T(x0, H - 10, 'Coupe de principe d\'IBIS ; pas à l\'échelle', null);
      return svg(W, H, s, 'Principe de l\'imageur IBIS d\'INTEGRAL');
    },
    /* CHEOPS : Ritchey-Chrétien dans l'axe (Benz et al. 2021) : primaire de 320 mm, focale effective 2 681 mm (f/8,4). La focale du primaire
       et l'écart des miroirs ne sont pas publiés : géométrie de principe (primaire à f/1,25 supposé). Détecteur placé un peu en arrière du foyer :
       l'image de l'étoile est défocalisée (90 % de l'énergie dans 16 px de rayon). */
    cheops: function(){
      return twoMirror({ z0:-0.62, z1:0.32, half:0.24, R:0.8, r1:0.16, hole:0.035, r2:0.03, d:0.329, rays:[0.15, 0.08], focus:[0.15, 0], dLabel:'écart de principe', k1:'tele', k2:'tele',
        label:'Schéma optique de CHEOPS, de principe',
        tube:[[-0.6,0.19],[-0.02,0.19]],
        after:function(X, Y){
          return G('tele', L(X(0.2), Y(0.03), X(0.2), Y(-0.03), DET, 4)) +
            T(X(0.02)+6, Y(0.16)-4, 'primaire, 320 mm', null, true) + T(X(-0.329), Y(0.03)-10, 'secondaire', 'middle', true) +
            T(X(0.2)+8, Y(0)+4, 'CCD, un peu', null, true) + T(X(0.2)+8, Y(0)+18, 'après le foyer :', null) + T(X(0.2)+8, Y(0)+31, 'image floue', null);
        } });
    },
    /* Herschel : Cassegrain (Pilbratt et al. 2010 ; fiche ESA) : primaire de 3,5 m à f/0,5 (foyer à 1,75 m), secondaire de 0,3 m, système à f/8,7.
       Écart des miroirs déduit (≈ 1,6 m) en plaçant le foyer à 1 m derrière le primaire : il redonne bien un secondaire de 0,3 m. Trou central indicatif. */
    herschel: function(){
      return twoMirror({ z0:-2.4, z1:1.6, half:1.95, R:3.5, r1:1.75, hole:0.15, r2:0.15, d:1.6, rays:[1.7, 0.9], focus:[1.0, 0], dLabel:'≈ 1,6 m (déduit)', k1:'tele', k2:'tele',
        label:'Schéma optique de Herschel',
        after:function(X, Y){
          return G('cryo', '<rect x="'+f(X(0.15))+'" y="'+f(Y(0.9))+'" width="'+f(X(1.55)-X(0.15))+'" height="'+f(Y(-0.9)-Y(0.9))+'" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>' + L(X(1.0), Y(0.08), X(1.0), Y(-0.08), DET, 4)) +
            T(X(0.05)+8, Y(1.75)-4, 'primaire, 3,5 m', null, true) + T(X(-1.6), Y(0.15)-10, 'secondaire, 0,3 m', 'middle', true) +
            T(X(1.0)+8, Y(0.6), 'cryostat :', null, true) + T(X(1.0)+8, Y(0.6)+14, 'HIFI, PACS, SPIRE', null);
        } });
    },
    /* Planck et WMAP : télescopes grégoriens hors d'axe. Seules les tailles des primaires sont publiées dans nos sources : courbes et positions de principe. */
    planck: function(){ return offGreg({ k:'tele', prim:'primaire, 1,9 × 1,5 m', feeds:'cornets de LFI et HFI', label:'Schéma de principe du télescope de Planck', extra:'vgroove' }); },
    wmap: function(){
      var W = 600, H = 300, s = '', cx = 300, cy = 170;
      [1, -1].forEach(function(sg){
        s += G('optics', '<path d="M'+(cx + sg*210)+' '+(cy - 110)+' Q'+(cx + sg*250)+' '+(cy - 10)+' '+(cx + sg*200)+' '+(cy + 70)+'" fill="none" stroke="'+INK+'" stroke-width="4"/>' +
          '<path d="M'+(cx + sg*90)+' '+(cy - 120)+' Q'+(cx + sg*70)+' '+(cy - 90)+' '+(cx + sg*92)+' '+(cy - 60)+'" fill="none" stroke="'+INK+'" stroke-width="4"/>');
        [-70, -20, 30].forEach(function(h, i){ var xa = cx + sg*(300), xp = cx + sg*(226 + i*4), yp = cy + h; s += P([[xa, yp], [xp, yp], [cx + sg*82, cy - 92], [cx + sg*18, cy + 10]], RAY, 1.1); });
      });
      s += G('fpa', '<rect x="'+(cx - 22)+'" y="'+(cy - 4)+'" width="44" height="40" fill="none" stroke="'+DET+'" stroke-width="2"/>');
      s += T(cx + 214, cy - 118, 'primaire, 1,4 × 1,6 m', 'middle', true) + T(cx - 214, cy - 118, 'primaire', 'middle', true) + T(cx + 96, cy - 128, 'secondaire', null) + T(cx, cy + 56, 'cornets et radiomètres', 'middle', true);
      s += T(cx + 296, cy - 76, 'ciel, côté A', 'end') + T(cx - 296, cy - 76, 'ciel, côté B', null);
      s += T(12, H - 10, 'Deux grégoriens hors d\'axe, dos à dos ; schéma de principe', null);
      return svg(W, H, s, 'Schéma de principe des télescopes de WMAP');
    },
    /* Compton, COMPTEL : deux étages de détecteurs ; le photon diffuse dans le premier et s'arrête dans le second (HEASARC). Pas à l'échelle. */
    cgro: function(){
      var W = 560, H = 320, x0 = 120, x1 = 330, y1 = 110, y2 = 240, s = '';
      s += G('comptel', '<rect x="'+x0+'" y="'+y1+'" width="'+(x1-x0)+'" height="16" fill="'+DET+'" fill-opacity="0.7"/><rect x="'+x0+'" y="'+y2+'" width="'+(x1-x0)+'" height="22" fill="#C9A100" fill-opacity="0.85"/>');
      var xa = 200, xb = 268; s += P([[xa - 40, 16], [xa, y1 + 8], [xb, y2 + 11]], RAY, 1.4) + '<circle cx="'+xa+'" cy="'+(y1 + 8)+'" r="3" fill="'+INK+'"/><circle cx="'+xb+'" cy="'+(y2 + 11)+'" r="3" fill="'+INK+'"/>';
      s += '<ellipse cx="'+(xa - 40)+'" cy="18" rx="46" ry="8" fill="none" stroke="'+MID+'" stroke-dasharray="3 3"/>';
      s += T(xa - 92, 14, 'photon gamma', 'end', true) + T(xa - 40 + 52, 22, 'cercle des directions possibles', null);
      s += T(x1 + 12, y1 + 12, 'premier étage : le photon diffuse', null, true) + T(x1 + 12, y1 + 26, 'sur un électron (effet Compton)', null);
      s += T(x1 + 12, y2 + 14, 'second étage : il s\'arrête', null, true) + T(x1 + 12, y2 + 28, 'et dépose le reste de son énergie', null);
      s += T(12, H - 10, 'Principe de COMPTEL ; pas à l\'échelle', null);
      return svg(W, H, s, 'Principe du télescope Compton COMPTEL');
    },
    /* XMM-Newton : un des trois télescopes, en coupe (The Telescopes of XMM-Newton, ESA) : 58 coques Wolter I de 70 à 30,6 cm de diamètre,
       60 cm de long, focale 7,5 m. Échelle radiale dilatée ×4 pour voir les coques ; 8 coques sur 58 dessinées. Réseaux RGA et caméra RGS :
       position de principe. */
    xmm: function(){
      var W = 640, H = 310, k = 68, kr = 4*k, x0 = 60, cy = 160, F = 7.5, s = '';
      function X(z){ return x0 + 40 + z*k; } function Y(r){ return cy - r*kr; }
      var R = []; for (var i=0;i<8;i++) R.push(0.153 + i*(0.35-0.153)/7);
      var m = '', t = '', g = '';
      R.forEach(function(rc, i){
        var a = rc/(4*F);
        [1,-1].forEach(function(sg){
          m += L(X(-0.3), Y(sg*(rc + a*0.3)), X(0), Y(sg*rc), INK, 1.4) + L(X(0), Y(sg*rc), X(0.3), Y(sg*(rc - 3*a*0.3)), INK, 1.4);
          if (i % 2 === 0){
            var r1 = rc + a*0.15, r2 = rc - 3*a*0.15;
            if (sg > 0 && i >= 2){ var zg = 0.9, rg = r2*(1 - (zg - 0.15)/(F - 0.15));
              t += P([[X(-0.9), Y(sg*r1)], [X(-0.15), Y(sg*r1)], [X(0.15), Y(sg*r2)], [X(zg), Y(rg)], [X(6.7), Y(-0.36 + (rg - 0.1)*0.3)]], '#7A4FB5', 1.1);
              t += P([[X(zg), Y(rg)], [X(F), Y(0)]], RAY, 1.1, '3 3'); }
            else t += P([[X(-0.9), Y(sg*r1)], [X(-0.15), Y(sg*r1)], [X(0.15), Y(sg*r2)], [X(F), Y(0)]], RAY, 1.1);
          }
        });
      });
      s += G('mirrors', m) + t;
      s += G('mirrors', L(X(0.9), Y(0.05), X(0.9), Y(0.36), '#7A4FB5', 4));
      s += G('tube', P([[X(0.4), Y(0.42)], [X(F - 0.2), Y(0.12)]], SOFT, 1.5, '4 3') + P([[X(0.4), Y(-0.42)], [X(F - 0.2), Y(-0.12)]], SOFT, 1.5, '4 3'));
      s += G('fpa', L(X(F), Y(0.06), X(F), Y(-0.06), DET, 5) + L(X(6.7), Y(-0.3), X(6.7), Y(-0.42), '#7A4FB5', 5));
      s += T(X(0), Y(0.38) - 22, '58 coques emboîtées (8 dessinées)', 'middle', true) + T(X(0), Y(0.38) - 8, 'Ø 70 à 30,6 cm · 60 cm de long', 'middle');
      s += T(X(0.9) + 8, Y(0.2), 'réseaux RGA', null, true) + T(X(0.9) + 8, Y(0.2) + 14, '(deux télescopes sur trois)', null);
      s += T(X(F) - 4, Y(0.06) - 10, 'EPIC', 'end', true) + T(X(6.7) - 6, Y(-0.42) + 16, 'RGS', 'end', true);
      s += T(x0 - 20, cy + 4, 'rayons X', null);
      s += dim(X(0), X(F), H - 14, 'focale 7,5 m');
      return svg(W, H, s, 'Schéma optique d\'un télescope de XMM-Newton');
    },
    /* Kepler : télescope de Schmidt (Kepler Instrument Handbook) : lame de 0,95 m, primaire sphérique de 1,4 m, focale 1 399 mm.
       Lame au centre de courbure du miroir (Schmidt classique), donc ≈ 2,8 m du miroir : déduit, non publié dans le manuel.
       Surface focale courbe de rayon ≈ focale, de Ø ≈ 0,39 m (16,1° × 1,40 m, déduit). Figure en mètres, même échelle sur les deux axes. */
    kepler: function(){
      var W = 610, H = 320, k = 150, xc = 100, cy = 160, R = 2.8*k, xm = xc + R, xf = xc + R/2, s = '';
      function Y(m){ return cy - m*k; }
      function arc(rad, h){ var a = Math.asin(h*k/rad); return 'M'+f(xc + rad*Math.cos(a))+' '+f(cy - rad*Math.sin(a))+' A'+f(rad)+' '+f(rad)+' 0 0 1 '+f(xc + rad*Math.cos(a))+' '+f(cy + rad*Math.sin(a)); }
      s += G('phot', P([[xc - 20, Y(0.75)], [xm + 6, Y(0.75)]], SOFT, 1.5, '4 3') + P([[xc - 20, Y(-0.75)], [xm + 6, Y(-0.75)]], SOFT, 1.5, '4 3'));
      [0.42, 0.28, -0.28, -0.42].forEach(function(h){
        var xh = xc + Math.sqrt(R*R - h*h*k*k);
        s += P([[24, Y(h)], [xh, Y(h)], [xf, cy]], RAY, 1.1);
      });
      s += '<rect x="'+f(xc - 3)+'" y="'+f(Y(0.475))+'" width="6" height="'+f(0.95*k)+'" fill="#CFE3F0" fill-opacity="0.8" stroke="'+INK+'" stroke-width="1"/>';
      s += '<path d="'+arc(R, 0.7)+'" fill="none" stroke="'+INK+'" stroke-width="4"/>';
      s += G('phot', '<path d="'+arc(R/2, 0.195)+'" fill="none" stroke="'+DET+'" stroke-width="5"/>');
      s += L(xf + 2, Y(0.2), xf + 2, Y(0.75), SOFT, 1, '2 3') + L(xf + 2, Y(-0.2), xf + 2, Y(-0.75), SOFT, 1, '2 3');
      s += T(xc, Y(0.475) - 10, 'lame correctrice, 0,95 m', 'middle', true) + T(xm - 6, Y(0.7) - 8, 'miroir sphérique, 1,4 m', 'end', true);
      s += T(xf - 8, cy + 4, 'plan focal courbe', 'end', true) + T(xf - 8, cy + 18, '42 CCD, Ø ≈ 0,39 m', 'end') + T(24, Y(-0.42) + 16, 'lumière des étoiles', null);
      s += dim(xf, xm, H - 14, 'focale 1,40 m · f/1,47') + dim(xc, xm, 18, 'lame au centre de courbure : ≈ 2,8 m (déduit)');
      return svg(W, H, s, 'Schéma optique du photomètre de Kepler');
    },
    /* TESS : une caméra, de profil. Pupille de 10,5 cm et f/1,4 (TESS Science Support Center) : focale de ≈ 14,7 cm, déduite ;
       plan focal de 4 CCD de 30,7 mm écartés de ≈ 2 mm, soit ≈ 63 mm (24° de champ). Lentilles et capot : schéma de principe. */
    tess: function(){
      var W = 610, H = 300, k = 1.9, x0 = 70, xp = 230, xf = xp + 147*k, cy = 150, s = '';
      function X(mm){ return xp + mm*k; } function Y(mm){ return cy - mm*k; }
      s += G('cams', P([[x0, Y(60)], [X(-20), Y(60)], [X(-20), Y(40)]], SOFT, 1.5) + P([[x0, Y(-60)], [X(-20), Y(-60)], [X(-20), Y(-40)]], SOFT, 1.5));
      [[-8, 52.5], [8, 50], [40, 44], [62, 40], [95, 38], [118, 37], [134, 36]].forEach(function(l){ s += '<ellipse cx="'+f(X(l[0]))+'" cy="'+cy+'" rx="'+f(4.2*k)+'" ry="'+f(l[1]*k)+'" fill="#CFE3F0" fill-opacity="0.55" stroke="'+INK+'" stroke-width="1.2"/>'; });
      s += P([[X(-14), Y(54)], [X(14), Y(54)], [X(14), Y(-54)], [X(-14), Y(-54)], [X(-14), Y(54)]], SOFT, 1, '4 3') + P([[X(30), Y(47)], [X(142), Y(47)], [X(142), Y(-47)], [X(30), Y(-47)], [X(30), Y(47)]], SOFT, 1, '4 3');
      [[52.5, 0], [-52.5, 0], [52.5, 31.7], [20, 31.7]].forEach(function(r, i){
        var yt = r[1], y0 = r[0] - yt*0.2; s += P([[x0, Y(y0 + (yt ? 20 : 0))], [X(-8), Y(y0)], [xf, Y(yt)]], RAY, 1.1);
      });
      s += L(xf, Y(31.7), xf, Y(-31.7), DET, 5) + L(X(0), Y(70), X(0), Y(56), MID, 1);
      s += T(X(0) + 8, Y(66) + 4, 'pupille de 10,5 cm', null, true) + T(X(-14), Y(-54) + 16, 'premier groupe', 'middle') + T(X(86), Y(-47) + 16, 'second groupe', 'middle') + T(xf + 8, cy + 4, 'CCD, 63 mm', null, true);
      s += T(x0, Y(60) - 8, 'capot', null) + T(x0, 16, 'lumière du ciel, jusqu\'à 12° de l\'axe', null);
      s += dim(X(0), xf, H - 14, 'focale ≈ 147 mm (f/1,4)');
      return svg(W, H, s, 'Schéma optique d\'une caméra de TESS');
    },
    /* Roman : ouverture (2,4 m) et obstruction centrale (30,3 %) publiées ; aucune prescription publique. Écart primaire–secondaire
       (≈ 2,4 m), trou du primaire et secondaire (≈ 0,42 m) mesurés sur la maquette NASA ; ils impliquent un primaire ouvert vers f/1,2.
       Foyer et optique arrière : trajet de principe. */
    /* Chandra : quatre paires Wolter I, à l'échelle (POG, ch. 4) : diamètres 1,23, 0,99, 0,87, 0,65 m ; miroirs de 84 cm ;
       foyer à 10,0548 m de la plaque centrale (CAP, z = 0). Pente des miroirs : un quart de l'angle de sortie moyen (θc + θd)/2. */
    chandra: function(){
      var PAIRS = [[1.23, 3.42, 3.50], [0.99, 2.75, 2.82], [0.87, 2.42, 2.49], [0.65, 1.80, 1.90]], LM = 0.84, ZF = 10.0548;
      function shells(X, Y, half, rays, w){
        var t = '', m = '';
        PAIRS.forEach(function(p, i){
          var rc = p[0]/2, a = (p[1] + p[2])/8*Math.PI/180;
          [1,-1].forEach(function(sg){
            if (half && sg < 0) return;
            m += L(X(-LM), Y(sg*(rc + a*LM)), X(0), Y(sg*rc), INK, w) + L(X(0), Y(sg*rc), X(LM), Y(sg*(rc - 3*a*LM)), INK, w);
            if (rays){ var r1 = rc + a*LM/2, r2 = rc - 1.5*a*LM;
              t += P([[X(-1.2), Y(sg*r1)], [X(-LM/2), Y(sg*r1)], [X(LM/2), Y(sg*r2)], [X(Math.min(ZF, rays)), Y(sg*r2*(1 - (Math.min(ZF, rays) - LM/2)/(ZF - LM/2)))]], RAY, 1.1); }
          });
        });
        return { m:m, t:t };
      }
      /* vue d'ensemble, même échelle sur les deux axes */
      var W = 560, z0 = -1.4, z1 = 10.6, k = (W - 40)/(z1 - z0), H1 = Math.round(1.4*k + 40), cy = 20 + 0.7*k;
      function X(z){ return 20 + (z - z0)*k; } function Y(r){ return cy - r*k; }
      var a = shells(X, Y, false, ZF, 2.5), s = a.t + G('hrma', a.m);
      s += G('isim', L(X(ZF), Y(0.06), X(ZF), Y(-0.06), DET, 4));
      s += G('oba', L(X(0.9), Y(0.62), X(ZF + 0.3), Y(0.62), SOFT, 1, '4 3') + L(X(0.9), Y(-0.62), X(ZF + 0.3), Y(-0.62), SOFT, 1, '4 3'));
      s += T(X(z0) + 2, 14, 'rayons X du ciel', null) + T(X(0), Y(-0.62) + 16, 'miroirs', 'middle', true) + T(X(ZF), Y(-0.62) + 16, 'foyer', 'middle', true);
      s += dim(X(0), X(ZF), H1 + 18, '10,05 m');
      /* agrandissement des miroirs, même échelle sur les deux axes (× 5) */
      var k2 = k*5, zz0 = -1.1, oy = H1 + 50, cy2 = oy + 0.68*k2;
      function X2(z){ return W/2 + (z - 0.0)*k2; } function Y2(r){ return cy2 - r*k2; }
      var b = shells(X2, Y2, true, 1.15, 3), s2 = b.t + G('hrma', b.m);
      s2 += L(X2(0), Y2(0.7), X2(0), Y2(0.02), SOFT, 1, '2 3') + T(X2(0) + 4, Y2(0.02) - 4, 'plaque centrale', null);
      s2 += T(X2(-LM/2), Y2(0.13), 'paraboloïdes', 'middle', true) + T(X2(LM/2), Y2(0.13), 'hyperboloïdes', 'middle', true);
      s2 += L(X2(-1.0), Y2(0), X2(1.15), Y2(0), SOFT, 1, '6 4') + T(X2(-1.0), Y2(0) + 14, 'axe', null);
      var H = Math.round(cy2 + 26);
      s += '<line x1="12" y1="' + f(H1 + 30) + '" x2="' + (W - 12) + '" y2="' + f(H1 + 30) + '" stroke="' + SOFT + '" stroke-width="1"/>' + T(14, H1 + 44, 'agrandi 5 fois, même échelle sur les deux axes', null);
      return svg(W, H, s + s2, 'Schéma optique de Chandra, à l\'échelle');
    },
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
                 euclid:[['baffle','télescope'],['instr','VIS et NISP']], gaia:[['torus','banc optique'],['focal','plan focal'],['tent','ouvertures de visée']], chandra:[['hrma','miroirs'],['oba','banc optique'],['isim','module des instruments']], fermi:[['lat','LAT']], swift:[['bat','BAT'],['xrt','XRT'],['uvot','UVOT']], integral:[['spi','SPI'],['ibis','IBIS'],['jemx','JEM-X']], cheops:[['tele','télescope']], herschel:[['tele','télescope'],['cryo','cryostat et instruments']], planck:[['tele','télescope et plan focal'],['vgroove','écrans en V']], wmap:[['optics','télescopes'],['fpa','cornets et radiomètres']], cgro:[['comptel','COMPTEL'],['egret','EGRET'],['osse','OSSE'],['batse','BATSE']], tess:[['cams','caméras']], kepler:[['phot','photomètre']], xmm:[['mirrors','miroirs'],['tube','tube'],['fpa','plan focal']], spitzer:[['tele','télescope'],['cta','chambre des instruments']], roman:[['ota','télescope'],['instr','WFI et coronographe']] };
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
    xmm:{ title:'Trois télescopes à 58 miroirs emboîtés', legend:'Les rayons X qui vont vers EPIC sont tracés en orange, ceux que les réseaux dévient vers le RGS en violet ; les miroirs en noir, les détecteurs en bleu.', scale:'Un des trois télescopes, en coupe. À l\'échelle le long de l\'axe : longueur des miroirs (60 cm) et focale (7,5 m) ; dans le sens radial, l\'échelle est dilatée quatre fois pour que les coques se voient, et seules 8 des 58 coques sont dessinées (diamètres de 70 à 30,6 cm, The Telescopes of XMM-Newton). La position des réseaux et de la caméra RGS est un schéma de principe. Le tube, en pointillé, est indicatif.',
      steps:['Comme pour Chandra, les rayons X ne se réfléchissent qu\'en frôlant une surface très lisse, sous un angle d\'un demi-degré environ.',
             'Chaque télescope empile 58 coques de nickel doré, de 70 à 30,6 cm de diamètre : chaque rayon frôle un paraboloïde puis un hyperboloïde. Ces coques très fines, emboîtées serrées, donnent une grande surface collectrice.',
             'Derrière deux des trois télescopes, une pile de réseaux intercepte une partie des rayons et les disperse vers une caméra RGS, décalée sur le côté ; le reste continue vers une caméra MOS.',
             'Au foyer, 7,5 m plus loin, les caméras EPIC : la pn derrière le troisième télescope, qui n\'a pas de réseau, et les deux MOS derrière les autres.'],
      specs:[['Combinaison','Wolter I, 3 télescopes'],['Coques','58 par télescope, nickel doré'],['Diamètres','70 à 30,6 cm'],['Focale','7,5 m'],['Surface efficace','≈ 1 550 cm² par télescope à 1,5 keV'],['Angle de frôlement','≈ 30′']] },
    kepler:{ title:'Un télescope de Schmidt, très ouvert', legend:'Les rayons sont tracés en orange, la lame correctrice en bleu clair, le miroir en noir, le plan focal en bleu.', scale:'Figure à l\'échelle, même échelle sur les deux axes : diamètres de la lame (0,95 m) et du miroir (1,4 m) et focale (1 399 mm) d\'après le Kepler Instrument Handbook. La position de la lame, au centre de courbure du miroir comme dans un Schmidt classique, et le diamètre du plan focal (16,1° de champ × 1,40 m) sont déduits. Le tube, en pointillé, est indicatif.',
      steps:['La lumière traverse d\'abord une lame de verre de 0,95 m, presque plate, dont la forme subtile corrige à l\'avance le défaut du miroir.',
             'Elle atteint au fond du tube un miroir sphérique de 1,4 m. Seul, un miroir sphérique donne une image floue ; avec la lame, l\'image est nette sur un champ immense, de 16° de diamètre.',
             'Le miroir renvoie la lumière vers le plan focal, placé au milieu du tube : une surface courbe de 21 modules de deux CCD, chacun coiffé d\'une lentille de saphir qui aplatit l\'image.',
             'Le plan focal bouche une partie de l\'ouverture, et ses câbles et son radiateur passent dans le faisceau : le prix d\'un champ aussi grand, à f/1,47.'],
      specs:[['Combinaison','Schmidt'],['Lame correctrice','0,95 m'],['Miroir primaire','1,4 m, sphérique'],['Focale','1 399 mm · f/1,47'],['Champ','Ø 16,1° · 115,6 deg² actifs'],['Domaine','420 à 900 nm']] },
    tess:{ title:'Quatre objectifs photographiques', legend:'Les rayons sont tracés en orange, les lentilles en bleu clair, les détecteurs en bleu.', scale:'Une caméra, de profil. Pupille (10,5 cm) et ouverture (f/1,4) publiées ; focale déduite (≈ 147 mm) ; largeur du plan focal tirée des quatre CCD de 30,7 mm et de leurs espaces de 2 mm. Le nombre de lentilles (7) et de groupes (2) est exact ; leurs formes et positions sont un schéma de principe.',
      steps:['Chaque caméra est un objectif photographique très ouvert, à f/1,4, plutôt qu\'un télescope à miroirs : TESS veut un champ immense, pas un grand pouvoir de résolution.',
             'Un capot arrête la lumière de la Terre et de la Lune qui viendrait de côté ; sept lentilles, en deux groupes, forment une image nette sur un champ de 24°.',
             'Au foyer, quatre CCD de 2048 × 2048 pixels de 15 µm : chaque pixel voit 21″ du ciel. Toutes les 2 s, une pose est lue puis additionnée aux précédentes.',
             'Les quatre caméras sont alignées côte à côte : ensemble, elles couvrent une bande de 24° sur 96° du ciel, de l\'écliptique jusqu\'à son pôle.'],
      specs:[['Combinaison','objectif réfractif, 7 lentilles'],['Pupille','10,5 cm'],['Ouverture','f/1,4'],['Focale','≈ 147 mm (déduite)'],['Champ','24° × 24° par caméra'],['Domaine','600 à 1 000 nm']] },
    fermi:{ legend:' Le photon gamma est tracé en orange, l\'électron en bleu, le positon en rose, les plans de silicium en bleu et les feuilles de tungstène en noir.', title:'Pas de miroir : un télescope à conversion de paires', scale:'Schéma de principe d\'une tour du LAT : le nombre de plans de silicium, de feuilles de tungstène et de couches du calorimètre est exact (Atwood et al. 2009) ; épaisseurs, espacements et trajectoires ne sont pas à l\'échelle.',
      steps:['Un photon gamma traverse sans réagir le bouclier de scintillateurs, qui, lui, s\'allume au passage des particules chargées du rayonnement cosmique : ces événements sont rejetés.',
             'Dans le trajectographe, le photon finit par se convertir dans une feuille de tungstène en un électron et un positon : c\'est la création de paires, possible au-delà de quelques MeV.',
             'Les plans de silicium enregistrent le passage de la paire, plan après plan. En remontant les deux traces, on retrouve la direction d\'arrivée du photon.',
             'La paire s\'arrête dans le calorimètre, des cristaux d\'iodure de césium, en une gerbe de particules dont la lumière donne l\'énergie du photon.'],
      specs:[['Principe','conversion de paires, sans optique'],['Tours','16, en carré de 4 × 4'],['Trajectographe','18 plans x–y de silicium par tour'],['Convertisseur','tungstène, dans les 16 premiers plans'],['Calorimètre','96 cristaux de CsI(Tl) par tour, 8,6 longueurs de radiation'],['Domaine','20 MeV à plus de 300 GeV'],['Champ','2,4 sr à 1 GeV']] },
    swift:{ legend:' Les trajets de la source A sont tracés en orange, ceux de la source B en violet ; les tuiles de plomb en noir, les détecteurs en bleu.', title:'Pas de miroir : un masque codé', scale:'Coupe de principe de BAT. À l\'échelle : écart de 1 m entre le masque et les détecteurs, largeur du plan de détecteurs (1,2 m). La largeur du masque est indicative, et ses ≈ 54 000 tuiles de 5 mm sont figurées par 24 cases.',
      steps:['Les rayons X durs traversent les miroirs sans se réfléchir. BAT n\'en a donc pas : un masque, fait de tuiles de plomb disposées au hasard, à moitié ouvert, est tendu 1 m au-dessus des détecteurs.',
             'Une source projette sur les détecteurs l\'ombre du masque. Pour une source à la verticale, l\'ombre tombe juste dessous ; pour une source inclinée, elle est décalée, d\'environ 47 cm pour 25°.',
             'Les 32 768 détecteurs de tellurure de cadmium-zinc comptent les photons. En cherchant quel décalage du motif du masque explique le mieux ce qu\'ils reçoivent, l\'ordinateur de bord retrouve la direction du sursaut, à quelques minutes d\'arc près.',
             'Il commande alors au satellite de pivoter : en une minute environ, le XRT et l\'UVOT, deux télescopes classiques alignés entre eux, visent le sursaut et précisent sa position.'],
      specs:[['Principe','masque codé, sans optique'],['Masque','≈ 54 000 tuiles de plomb de 5 × 5 × 1 mm, 2,7 m²'],['Écart masque–détecteurs','1 m'],['Détecteurs','32 768 CZT, 5 200 cm²'],['Champ','1,4 sr, 100° × 60°'],['XRT','Wolter I, focale de 3,5 m'],['UVOT','Ritchey-Chrétien de 30 cm, f/12,7']] },
    integral:{ legend:' Le photon de basse énergie est tracé en orange, celui de haute énergie en violet ; le masque en noir, ISGRI en bleu, PICsIT en jaune.', title:'Des masques codés, sans miroir', scale:'Coupe de principe d\'IBIS ; ni les dimensions ni le nombre d\'éléments du masque ne sont à l\'échelle.',
      steps:['À ces énergies, aucun miroir ne réfléchit la lumière. SPI, IBIS et les deux JEM-X ont chacun un masque codé, posé au-dessus de leurs détecteurs.',
             'Chaque source projette l\'ombre du masque, décalée selon sa direction ; en comparant les ombres enregistrées au motif du masque, le logiciel reconstruit l\'image du ciel.',
             'Dans IBIS, un photon de basse énergie s\'arrête dans le premier plan, ISGRI ; un photon plus énergétique peut y diffuser puis s\'arrêter dans le second, PICsIT.',
             'Les quatre instruments visent la même direction : la caméra OMC suit en même temps la lumière visible.'],
      specs:[['Principe','masques codés'],['SPI','20 keV à 8 MeV · champ de 16° · 2,5°'],['IBIS','15 keV à 10 MeV · champ de 9° · 12′'],['JEM-X','3 à 35 keV · champ de 4,8° · 3′'],['OMC','filtre V · champ de 5° × 5°']] },
    cheops:{ title:'Un Ritchey-Chrétien qui fait exprès d\'être flou', scale:'Schéma de principe : seuls le diamètre du primaire et la focale résultante sont publiés (Benz et al. 2021). L\'écart entre les miroirs et la courbure du primaire sont supposés.',
      steps:['La lumière de l\'étoile entre par le baffle, long, qui arrête la lumière diffusée par la Terre.',
             'Le primaire de 320 mm la renvoie vers le secondaire, qui la fait converger à travers le trou du primaire.',
             'Le CCD est placé un peu à l\'écart du foyer : l\'image de l\'étoile est une tache floue d\'environ 16 pixels de rayon.',
             'Étalée sur des centaines de pixels, la mesure ne dépend presque plus des défauts d\'un pixel ou des petits tremblements du pointage : c\'est ce qui permet d\'atteindre quelques millionièmes de précision.'],
      specs:[['Combinaison','Ritchey-Chrétien dans l\'axe'],['Primaire','320 mm'],['Focale résultante','2 681 mm · f/8,4'],['Échelle','1″ par pixel de 13 µm'],['Champ','0,32°'],['Tache défocalisée','90 % de l\'énergie dans 16 px de rayon']] },
    herschel:{ title:'Un Cassegrain de 3,5 m, très ouvert', scale:'Diamètres du primaire (3,5 m) et du secondaire (0,3 m), rapport f/0,5 du primaire et f/8,7 du système : publiés (Pilbratt et al. 2010, fiche de l\'ESA). L\'écart des miroirs (≈ 1,6 m) et la position du foyer sont déduits ; le trou central et le cryostat, en pointillé, sont indicatifs.',
      steps:['Le rayonnement infrarouge lointain est réfléchi par le primaire de 3,5 m, très creux (f/0,5) : son foyer n\'est qu\'à 1,75 m.',
             'Le secondaire de 0,3 m, tenu par un trépied, le renvoie à travers le trou du primaire vers le haut du cryostat.',
             'Là, sur un banc optique refroidi par l\'hélium, des miroirs répartissent le champ entre HIFI, PACS et SPIRE.',
             'Le télescope, lui, n\'est pas dans le cryostat : à l\'ombre du pare-soleil, il se refroidit vers 85 K en rayonnant vers l\'espace.'],
      specs:[['Combinaison','Cassegrain'],['Primaire','3,5 m, 12 segments de carbure de silicium · f/0,5'],['Secondaire','0,3 m'],['Système','f/8,7 · focale ≈ 28,5 m (déduite)'],['Température','≈ 85 K'],['Domaine','55 à 672 µm']] },
    planck:{ title:'Un grégorien hors d\'axe, sans obstruction', scale:'Schéma de principe : la taille du primaire est publiée (1,9 × 1,5 m, fiche de l\'ESA), ni ses courbures ni les positions des miroirs.',
      steps:['Le rayonnement micro-onde est réfléchi par le primaire elliptique, puis par le secondaire, tous deux décalés de l\'axe : rien ne fait obstacle au faisceau.',
             'Il converge vers le plan focal, où des cornets le guident vers les détecteurs : 22 récepteurs radio de LFI, 52 bolomètres de HFI.',
             'Le télescope reste vers 50 K grâce aux trois écrans en V qui le séparent du module de service, à 300 K.',
             'Planck tourne d\'un tour par minute : chaque détecteur décrit un grand cercle sur le ciel, et l\'axe avance pas à pas pour couvrir peu à peu tout le ciel.'],
      specs:[['Combinaison','grégorien hors d\'axe'],['Primaire','1,9 × 1,5 m · ouverture projetée 1,5 m'],['Télescope','≈ 50 K'],['LFI','30, 44, 70 GHz · 20 K'],['HFI','100 à 857 GHz · 0,1 K'],['Résolution','32′ à 4,2′']] },
    wmap:{ title:'Deux télescopes dos à dos', scale:'Schéma de principe : la taille des primaires est publiée (1,4 × 1,6 m), ni leurs courbures ni les positions des miroirs.',
      steps:['Deux télescopes grégoriens hors d\'axe regardent dans deux directions opposées.',
             'Chaque primaire de 1,4 × 1,6 m renvoie le rayonnement vers un secondaire, puis vers les cornets au centre de l\'instrument.',
             'Chaque radiomètre reçoit les deux faisceaux et ne mesure que leur différence de température : les dérives de l\'instrument s\'annulent.',
             'WMAP tourne sur lui-même en gardant le Soleil derrière son écran : les deux faisceaux balaient le ciel, et les différences se recoupent pour former une carte.'],
      specs:[['Combinaison','deux grégoriens hors d\'axe, dos à dos'],['Primaires','1,4 × 1,6 m'],['Cornets','20, 10 par télescope'],['Bandes','23 à 94 GHz'],['Résolution','52,8′ à 13,2′']] },
    cgro:{ legend:' Le photon gamma est tracé en orange ; le premier étage en bleu, le second en jaune.', title:'Pas de miroir : quatre façons de piéger les gamma', scale:'Schéma de principe de COMPTEL, pas à l\'échelle.',
      steps:['BATSE compte les photons dans huit scintillateurs tournés dans des directions différentes : leurs taux comparés donnent la direction d\'un sursaut.',
             'OSSE vise une petite région du ciel à travers des collimateurs, qui limitent le champ à 3,8° × 11,4°.',
             'COMPTEL suit un photon qui diffuse sur un électron dans un premier étage puis s\'arrête dans un second : les énergies et positions mesurées donnent un cercle de directions possibles sur le ciel ; plusieurs cercles se croisent sur la source.',
             'EGRET, comme le LAT de Fermi, transforme le photon en paire électron–positon dans une chambre à étincelles : les traces donnent la direction, un calorimètre l\'énergie.'],
      specs:[['BATSE','20 keV à 1 MeV · tout le ciel'],['OSSE','0,05 à 10 MeV · 3,8° × 11,4°'],['COMPTEL','0,8 à 30 MeV · ≈ 1 sr'],['EGRET','30 MeV à 10 GeV · ≈ 0,6 sr']] },
    spitzer:{ title:'Un Ritchey-Chrétien en béryllium, refroidi à l\'hélium', scale:'Figure à l\'échelle, d\'après la prescription du Spitzer Telescope Handbook (tableau 3.3) : courbure et diamètre du primaire, trou central, diamètre et position du secondaire, position du foyer. La chambre des instruments, en pointillé, est indicative.',
      steps:['La lumière infrarouge descend dans le tube jusqu\'au miroir primaire, concave, de 85 cm, très ouvert (f/1,2).',
             'Le primaire la renvoie vers le secondaire, convexe, de 12 cm, placé 89 cm plus haut ; un mécanisme peut le déplacer pour la mise au point.',
             'Le secondaire renvoie le faisceau à travers le trou central du primaire, de 32 cm. Le foyer est 44 cm derrière le primaire, dans la chambre des instruments posée sur le réservoir d\'hélium.',
             'IRAC, IRS et MIPS se partagent ce plan focal de 32′ de diamètre. Tout le télescope est en béryllium et était tenu vers 5,6 K : sinon, sa propre chaleur aurait ébloui les détecteurs.'],
      specs:[['Combinaison','Ritchey-Chrétien'],['Ouverture','0,85 m · trou central 0,32 m'],['Focale','10,2 m · f/12'],['Primaire','f/1,2 · rayon de courbure 2,04 m'],['Écart primaire–secondaire','0,888 m'],['Champ','32′ de diamètre'],['Domaine','3 à 180 µm']] },
    chandra:{ title:'Des miroirs en incidence rasante : quatre paires Wolter de type I', scale:'Figure à l\'échelle, avec la même échelle sur les deux axes : diamètres des quatre paires (1,23 à 0,65 m), longueur des miroirs (84 cm) et distance du foyer (10,05 m) d\'après le guide de l\'observateur (POG, chapitre 4). La pente de chaque miroir est déduite de son angle de sortie. Le tube du banc optique, en pointillé, est indicatif.',
      steps:['Les rayons X traversent la matière au lieu de s\'y réfléchir. Ils ne rebondissent que s\'ils frôlent une surface très lisse, sous un angle inférieur au degré.',
             'Chaque rayon frôle d\'abord un paraboloïde, puis un hyperboloïde : deux réflexions rasantes suffisent à former une image nette. Quatre paires emboîtées, de 1,23 à 0,65 m de diamètre, multiplient la surface collectrice.',
             'Les miroirs, en verre Zerodur revêtu d\'iridium, renvoient les rayons sur un cône très étroit : le foyer est à 10 m derrière eux, au bout du banc optique.',
             'Au foyer, une table mobile place ACIS ou HRC. Pour un spectre, un réseau (HETG ou LETG) s\'insère juste derrière les miroirs et disperse les rayons X selon leur énergie.'],
      specs:[['Combinaison','Wolter de type I, quatre paires emboîtées'],['Diamètres','1,23 · 0,99 · 0,87 · 0,65 m'],['Longueur des miroirs','84 cm chacun'],['Focale','10,070 m'],['Revêtement','iridium sur verre Zerodur'],['Surface efficace','≈ 800 cm² à 0,25 keV · 400 cm² à 5 keV'],['Champ sans images fantômes','30′ de diamètre']] },
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
  /* télescope grégorien hors d'axe, de principe (Planck) : primaire concave en bas à gauche, secondaire elliptique, foyer en bas */
  function offGreg(o){
    var W = 560, H = 320, s = '';
    s += G(o.k, '<path d="M60 250 Q150 300 250 240" fill="none" stroke="'+INK+'" stroke-width="4"/><path d="M330 70 Q370 110 350 160" fill="none" stroke="'+INK+'" stroke-width="4"/>');
    [[90, 262], [150, 272], [215, 255]].forEach(function(p, i){ s += P([[p[0], 20], [p[0], p[1]], [344 - i*2, 96 + i*26], [200, 170]], RAY, 1.1); });
    s += G(o.k, '<rect x="186" y="164" width="40" height="24" fill="none" stroke="'+DET+'" stroke-width="2"/>');
    if (o.extra) s += G(o.extra, L(40, 300, 520, 300, SOFT, 3) + T(520, 294, 'écrans en V', 'end'));
    s += T(150, 296, o.prim, 'middle', true) + T(360, 64, 'secondaire', null, true) + T(232, 182, o.feeds, null, true) + T(70, 16, 'ciel', null);
    s += T(12, H - 4, 'Grégorien hors d\'axe ; schéma de principe', null);
    return svg(W, H, s, o.label);
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
    /* XMM-Newton (Users Handbook) : EPIC pn, 12 CCD de 64 × 200 px de 150 µm (9,6 × 30 mm) en 2 rangées de 6 ; EPIC MOS, 7 CCD de 600 × 600 px de
       40 µm (24 mm), un central et six autour ; RGS, 9 CCD de 1024 × 384 px de 27 µm en rangée. Dispositions simplifiées, espaces indicatifs. */
    xmm:{ groups:[ grid(6,2,9.6,30,0.3,0.6,'#2E7FA8',['EPIC pn','12 CCD de 64 × 200 px, 150 µm']), cells([[0,0],[0,24.6],[0,-24.6],[24.6,12.3],[24.6,-12.3],[-24.6,12.3],[-24.6,-12.3]],24,24,'#4FA3C7',['EPIC MOS (une des deux)','7 CCD de 600 × 600 px, 40 µm']),
                   grid(9,1,10.4,27.6,0.5,0,'#7A4FB5',['RGS (un des deux)','9 CCD de 1024 × 384 px, 27 µm']) ],
          note:'Les caméras sont rapprochées ici pour comparer leur taille ; dans le satellite, chacune est au foyer de son télescope, et les CCD des RGS suivent la courbe de dispersion. Formats et tailles des pixels d\'après le Users Handbook ; disposition des CCD simplifiée.', gaps:true },
    /* Kepler : 21 modules de 2 CCD de 1044 × 2200 px de 27 µm (28,2 × 59,4 mm) sur une grille de 5 × 5 sans les coins, où sont les 4 viseurs
       (512 × 512 px de 13 µm, 6,7 mm) ; Kepler Instrument Handbook. Espaces entre CCD et modules indicatifs. */
    kepler:{ groups:[ grid(10,5,28.2,59.4,1.5,4,function(i, j){ return ((j === 0 || j === 4) && (i < 2 || i > 7)) ? null : '#6A8D2F'; }, ['Photomètre','42 CCD de 1044 × 2200 px, 27 µm, en 21 modules']), grid(2,2,6.7,6.7,50,50,'#C9A100',['Viseurs de guidage','4 CCD de 512 × 512 px, 13 µm']) ],
             note:'Les 21 modules occupent une grille de 5 × 5 sans ses coins, où sont placés les quatre viseurs de guidage ; ceux-ci sont dessinés à part. Le plan focal réel est courbe, de ≈ 0,3 m de côté ; espaces entre CCD et entre modules indicatifs.', gaps:true },
    /* TESS : quatre caméras, chacune 2 × 2 CCD CCID-80 de 2048 × 2048 px de 15 µm (30,72 mm), écartés d'≈ 2 mm (Observatory Guide) */
    tess:{ groups:[ grid(2,2,30.72,30.72,2,2,'#1F7A8C',['Caméra 1','4 CCD de 2048 × 2048 px, 15 µm']), grid(2,2,30.72,30.72,2,2,'#1F7A8C',['Caméra 2','4 CCD']), grid(2,2,30.72,30.72,2,2,'#1F7A8C',['Caméra 3','4 CCD']), grid(2,2,30.72,30.72,2,2,'#1F7A8C',['Caméra 4','4 CCD']) ],
             note:'Les quatre caméras sont séparées dans le satellite ; elles sont rapprochées ici, dans l\'ordre de leur champ sur le ciel. Chaque plan focal mesure ≈ 63 mm de côté et voit 24° du ciel.', gaps:true },
    /* Fermi : le LAT vu de dessus, 16 tours de 4 × 4 détecteurs au silicium de 8,95 cm (Atwood et al. 2009) ; un détecteur NaI du GBM (Ø 12,7 cm) */
    fermi:{ groups:[ grid(4,4,358,358,16,16,'#4C3A99',['LAT, vu de dessus','16 tours, chacune de 4 × 4 détecteurs au silicium de 8,95 cm']), grid(1,1,127,127,0,0,'#C9A100',['GBM, un détecteur NaI','Ø 12,7 cm (dessiné carré)']) ],
             note:'Le LAT n\'a pas de plan focal : chaque tour suit la trace des particules. Taille des plans de silicium à l\'échelle (4 × 8,95 cm de côté) ; espaces entre tours indicatifs. Le GBM compte douze détecteurs NaI et deux BGO répartis autour du satellite.' },
    /* Swift : plan de détecteurs de BAT, 1,2 × 0,6 m (32 768 CZT) ; CCD du XRT, 600 × 600 px de 40 µm (24 mm) ; descriptions des instruments, NASA Goddard */
    swift:{ groups:[ grid(1,1,1200,600,0,0,'#E39B17',['BAT','plan de 32 768 détecteurs CZT, 1,2 × 0,6 m']), grid(1,1,24,24,0,0,'#C2571A',['XRT','CCD de 600 × 600 px, 40 µm']) ],
             note:'BAT n\'a pas de plan focal : son plan de détecteurs reçoit l\'ombre du masque codé. À la même échelle, le CCD du XRT n\'est qu\'un point : 24 mm de côté. Le détecteur de l\'UVOT, à intensificateur, n\'est pas dessiné.' },
    /* INTEGRAL (ISDC) : surfaces des plans de détecteurs d'IBIS, dessinés carrés de même surface (ISGRI 2 600 cm², PICsIT 3 100 cm²) ; SPI 500 cm² */
    integral:{ groups:[ grid(1,1,510,510,0,0,'#245C9E',['IBIS / ISGRI','16 384 CdTe, 2 600 cm²']), grid(1,1,557,557,0,0,'#7FB3E0',['IBIS / PICsIT','4 096 CsI, 3 100 cm²']), grid(1,1,224,224,0,0,'#C9A100',['SPI','19 détecteurs au germanium, 500 cm²']) ],
             note:'Plans de détecteurs dessinés comme des carrés de même surface (caractéristiques de l\'ISDC) : leur forme réelle n\'est pas représentée. Les deux plans d\'IBIS sont superposés dans l\'instrument, ISGRI au-dessus de PICsIT.' },
    /* CHEOPS (Benz et al. 2021) : un CCD de 1024 × 1024 px de 13 µm, soit 13,3 mm */
    cheops:{ groups:[ grid(1,1,13.3,13.3,0,0,'#3BA7C4',['CHEOPS','CCD de 1024 × 1024 px, 13 µm']) ],
             note:'Un seul CCD de 13,3 mm de côté. Seules de petites fenêtres autour de l\'étoile visée, de 200 px de diamètre, sont lues et transmises.' },
    /* Herschel : champs projetés au foyer ; focale ≈ 28,5 m déduite de f/8,7 et de l'ouverture effective de 3,28 m (Pilbratt et al. 2010), soit 1′ ≈ 8,3 mm */
    herschel:{ groups:[ grid(1,1,33.2,66.4,0,0,'#7D2A47',['SPIRE, photomètre','champ de 4′ × 8′']), grid(1,1,6.5,6.5,0,0,'#D06A86',['PACS, spectromètre','champ de 47″ × 47″']) ],
             note:'Champs projetés sur le foyer du télescope, d\'après la focale déduite de f/8,7 (≈ 28,5 m, soit 1′ ≈ 8,3 mm). Les matrices de bolomètres réelles sont plus petites, derrière leurs propres optiques ; HIFI n\'a qu\'un pixel sur le ciel.' },
    planck:{ groups:[], note:'Pas de mosaïque de détecteurs : le plan focal de Planck porte des cornets, chacun relié à un détecteur, 22 récepteurs pour LFI et 52 bolomètres pour HFI (fiche de l\'ESA). Leur disposition n\'est pas représentée.' },
    wmap:{ groups:[], note:'Pas de mosaïque de détecteurs : 20 cornets, 10 derrière chaque télescope, relient le rayonnement à autant de radiomètres. Leur disposition n\'est pas représentée.' },
    cgro:{ groups:[], note:'Aucun des quatre instruments n\'a de plan focal : BATSE, OSSE, COMPTEL et EGRET détectent les photons gamma directement, sans optique. Leurs tailles de détecteurs ne sont pas représentées ici.' },
    /* Spitzer : champs des instruments projetés sur le foyer du télescope (focale 10,2 m : 1′ ≈ 2,967 mm), Spitzer Telescope Handbook */
    spitzer:{ groups:[ grid(2,1,15.46,15.46,1.5,0,'#2F6FDB',['IRAC','deux champs de 5,2′, quatre matrices de 256 × 256 px']), grid(1,1,16.0,16.0,0,0,'#9A52D6',['MIPS 24 µm','5,4′, 128 × 128 px']),
                       grid(1,1,15.4,7.7,0,0,'#C77DDB',['MIPS 70 µm','5,2′ × 2,6′, 32 × 32 px']), grid(1,1,1.57,15.8,0,0,'#6B3FA0',['MIPS 160 µm','0,53′ × 5,33′']), grid(1,1,0.52,8.3,0,0,'#0F987A',['IRS, fente LL','10,6″ × 168″']) ],
             note:'Champs projetés sur le plan focal du télescope, d\'après le champ de chaque instrument et la focale de 10,2 m (1′ ≈ 2,97 mm) ; IRAC et MIPS ont leurs propres optiques et des détecteurs plus petits. Les instruments sont rapprochés ici pour comparer leur taille ; l\'écart entre les deux champs d\'IRAC est indicatif.' },
    /* Chandra : CCD d'ACIS de 1024 × 1024 px de 24 µm ; HRC dessiné d'après son champ et l'échelle du foyer (1″ = 48,8 µm pour 10,07 m) */
    chandra:{ groups:[ grid(2,2,24.6,24.6,0.5,0.5,DET,['ACIS-I','4 CCD de 1024 × 1024 px, 24 µm']), grid(6,1,24.6,24.6,0.5,0,'#0F987A',['ACIS-S','6 CCD, dont 2 éclairés par l\'arrière']), grid(1,1,87.9,87.9,0,0,'#DB5A14',['HRC-I','galette à microcanaux, ≈ 30′ de côté']) ],
             note:'ACIS-I et ACIS-S sont montés côte à côte sur le même support, HRC sur la même table mobile ; ils sont rapprochés ici pour comparer leur taille. Taille de HRC-I déduite de son champ (≈ 30′) et de l\'échelle du foyer ; espaces entre CCD indicatifs.' },
    roman:{ groups:[ cells(WFI_MM,40.9,40.9,'#B8860B',['WFI','18 détecteurs de 4096 × 4096 px, 10 µm']) ],
             note:'Les 18 détecteurs forment six colonnes de trois, décalées en hauteur en arc. Positions des centres d\'après le modèle de champ du projet (GalSim).', gaps:true },
    gaia:{ groups:[ grid(17,7,45,59,4,1,function(i, j){ if (i===0) return j===3 ? null : (j===0||j===1||j===2) ? (j===2 ? GC.aux : GC.aux) : null; if (i<=2) return GC.sm; if (i<=10) return GC.af; if (i===11) return j===3 ? GC.aux : GC.af; if (i===12) return GC.bp; if (i===13) return GC.rp; return j>=3 ? GC.rvs : null; }, ['Plan focal de Gaia','106 CCD de 4500 × 1966 px, 10 × 30 µm']) ],
           key:[[GC.aux,'contrôle (angle de base, front d\'onde)'],[GC.sm,'cartographe de ciel'],[GC.af,'champ astrométrique'],[GC.bp,'photomètre bleu'],[GC.rp,'photomètre rouge'],[GC.rvs,'spectromètre RVS']],
           note:'Les étoiles traversent le plan focal de gauche à droite pendant que le satellite tourne : détection, puis astrométrie, photométrie et enfin spectroscopie. 17 colonnes et 7 rangées ; le spectromètre occupe les rangées 4 à 7, un capteur de front d\'onde remplace le dernier CCD astrométrique de la rangée 4 (documentation de Gaia DR3). La place des trois autres CCD de contrôle, dans la première colonne, est indicative.' }
  };
  function focal(tid){
    var d = FP[tid], W = 560, gap = 34, tw = 0, th = 0;
    if (!d.groups.length) return '<div class="cap">'+d.note+'</div>';   /* pas de plan focal à dessiner (radiomètres, détecteurs sans image) */
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
  function compareFocal(OBS, NAMES, LIST){
    var W = 1000, k = 0.8, gap = 40, rows = [[], [], []], s = '';
    /* rangée et rang de chaque observatoire : compare.fp dans data-tele.js ; seuls les observatoires comparés */
    var sel = TELESCOPES.filter(function(t){ return FP[t.id] && t.compare.fp && (!LIST || LIST.indexOf(t.id) >= 0); });
    if (!sel.length) return '';
    sel.sort(function(a, b){ return a.compare.fp[0] - b.compare.fp[0] || a.compare.fp[1] - b.compare.fp[1]; })
      .forEach(function(T){ var r = rows[T.compare.fp[0]] || (rows[T.compare.fp[0]] = []); FP[T.id].groups.forEach(function(g){ r.push({ t:T.id, g:g }); }); });
    var y = 10;
    rows.filter(function(r){ return r.length; }).forEach(function(r){
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
      '<div class="cap">Taille réelle des mosaïques de détecteurs, à la même échelle. Espaces entre détecteurs indicatifs pour Gaia, Webb, Kepler et XMM-Newton ; un seul module de NIRCam est dessiné.</div></div>';
  }

  function render(tid, name, part){
    var t = TEXT[tid]; focus = part || null;
    return '<div class="inst-head"><div class="inst-h"><div class="inst-name">Trajet de la lumière</div><div class="inst-full">'+name+' : du ciel au détecteur</div></div><p class="inst-sum">'+t.title+'. '+t.steps[0]+'</p></div>' +
      '<div class="inst-cols">' +
      '<div class="isec"><h4>Schéma optique</h4>'+FIG[tid]()+(focus && LINK3D[tid].some(function(l){ return l[0] === focus; }) ? '<div class="cap hl-cap">Surligné : '+LINK3D[tid].filter(function(l){ return l[0] === focus; })[0][1]+', la pièce choisie dans la maquette.</div>' : '')+'<div class="cap">'+t.scale+(t.legend != null ? t.legend : ' Les rayons sont tracés en orange, les miroirs en trait épais, les détecteurs en bleu.')+'</div><div class="chips" style="margin-top:12px"><span class="cap" style="margin:0 6px 0 0;align-self:center">Voir dans la maquette 3D :</span>'+LINK3D[tid].map(function(l){ return '<button class="chip'+(focus === l[0] ? ' on' : '')+'" data-jump3d="'+tid+':'+l[0]+'">'+l[1]+'</button>'; }).join('')+'</div></div>' +
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
