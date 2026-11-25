/* =================================================================
   TRAJET DE LA LUMIÈRE (ou du signal) dans chaque instrument.
   Schémas de principe paramétriques, d'après le module optique d'Observatories v1.0 : formes, tailles et distances NE sont PAS
   à l'échelle (règle 2), ce que dit la légende de chaque figure. Les seules valeurs chiffrées affichées viennent d'OPTICS
   du site (OPTICS_SITE.data, src/optics-data.js de chaque site), chacune avec sa source (clés de INST_DATA[mission].refs ou des refs de la mission, règle 1).
   Couleurs neutres : ramenées aux jetons du thème par les règles « svg [fill=…] » de style.css.
================================================================= */
var Optics = (function(){
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var INK = '#14171A', MID = '#3A4147', SOFT = '#98A1A7', RAY = '#DB5A14', DET = '#3D6BE0', GND = '#8A6A3B';
  function f(n){ return Math.round(n*10)/10; }
  function Ln(x1,y1,x2,y2,c,w,d){ return '<line x1="'+f(x1)+'" y1="'+f(y1)+'" x2="'+f(x2)+'" y2="'+f(y2)+'" stroke="'+c+'" stroke-width="'+(w||1)+'"'+(d?' stroke-dasharray="'+d+'"':'')+' stroke-linecap="round"/>'; }
  function P(pts,c,w,d){ return '<polyline points="'+pts.map(function(p){ return f(p[0])+','+f(p[1]); }).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="'+(w||1)+'"'+(d?' stroke-dasharray="'+d+'"':'')+' stroke-linejoin="round" stroke-linecap="round"/>'; }
  function Pa(d,c,w,fill){ return '<path d="'+d+'" fill="'+(fill||'none')+'" stroke="'+c+'" stroke-width="'+(w||1)+'" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function T(x,y,s,a,b){ return '<text x="'+f(x)+'" y="'+f(y)+'" fill="'+(b?INK:MID)+'" font-size="'+(b?12:11)+'" font-weight="'+(b?700:400)+'" font-family="Archivo, Arial, sans-serif"'+(a?' text-anchor="'+a+'"':'')+'>'+esc(s)+'</text>'; }
  function arrow(x,y,ang,c){ var a = ang*Math.PI/180, l = 7, w = 4, bx = x - l*Math.cos(a), by = y - l*Math.sin(a), px = -Math.sin(a)*w, py = Math.cos(a)*w;
    return '<path d="M'+f(x)+' '+f(y)+' L'+f(bx+px)+' '+f(by+py)+' L'+f(bx-px)+' '+f(by-py)+' z" fill="'+(c||MID)+'"/>'; }
  function svg(w,h,body,label){ return '<div class="svgwrap"><svg class="optic" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(label)+'">'+body+'</svg></div>'; }
  function sky(){ return T(14, 16, L('lumière venue de la surface', 'light from the surface')) + Ln(14, 24, 70, 24, MID) + arrow(76, 24, 0); }
  /* miroir concave vu en coupe, ouvert vers la gauche (dir -1) ou la droite (dir 1) */
  function mirror(x, y, h, dir, hole){ var s = '', bow = 10*dir;
    [[-h, hole ? -hole : 0], [hole ? hole : 0, h]].forEach(function(r){ var a = r[0], b = r[1];
      s += Pa('M'+f(x + bow*(a*a)/(h*h))+' '+f(y+a)+' Q'+f(x)+' '+f(y + (a+b)/2)+' '+f(x + bow*(b*b)/(h*h))+' '+f(y+b), INK, 4); });
    return s; }
  function lens(x, y, h){ return Pa('M'+x+' '+(y-h)+' Q'+(x+12)+' '+y+' '+x+' '+(y+h)+' Q'+(x-12)+' '+y+' '+x+' '+(y-h)+' z', INK, 1.5, 'rgba(61,107,224,0.12)'); }
  function det(x, y, h, lab){ return Ln(x, y-h, x, y+h, DET, 5) + (lab ? T(x, y+h+24, lab, 'middle', true) : ''); }

  /* ---------- un dessin par famille ---------- */
  var DRAW = {
    /* télescope à deux miroirs (Cassegrain, Ritchey-Chrétien) ; o.corr : lame de Maksutov ; o.tma : troisième miroir */
    refl: function(o){
      var W = 560, H = 230, cy = 118, xp = 400, xs = 190, xf = o.tma ? 452 : 470, s = sky();
      s += P([[40, cy-70], [430, cy-70]], SOFT, 1, '4 3') + P([[40, cy+70], [430, cy+70]], SOFT, 1, '4 3');
      if (o.corr) s += Pa('M70 '+(cy-66)+' Q82 '+cy+' 70 '+(cy+66)+' L78 '+(cy+66)+' Q90 '+cy+' 78 '+(cy-66)+' z', INK, 1.2, 'rgba(61,107,224,0.12)') + T(74, cy+88, L('ménisque correcteur', 'corrector meniscus'), 'middle');
      s += mirror(xp, cy, 62, -1, 12) + Ln(xs, cy-18, xs, cy+18, INK, 4);
      [56, 34].forEach(function(h){ [1, -1].forEach(function(sg){
        var y0 = cy - sg*h, yS = cy - sg*h*0.28;
        s += P([[40, y0], [xp - 10*(h*h)/(62*62), y0], [xs, yS], [o.tma ? xf : xf, cy - sg*(o.tma ? 4 : 0)]], RAY, 1.2);
      }); });
      if (o.tma){ s += Ln(xf - 8, cy - 22, xf + 14, cy + 22, INK, 4) + P([[xf, cy - 4], [xf - 40, cy + 70]], RAY, 1.2) + P([[xf, cy + 4], [xf - 30, cy + 70]], RAY, 1.2) + Ln(xf - 56, cy + 72, xf - 14, cy + 72, DET, 5);
        s += T(xf + 18, cy - 10, L('3e miroir', '3rd mirror')) + T(xf - 35, cy + 92, o.det || L('détecteur', 'detector'), 'middle', true); }
      else s += det(xf, cy, 16, o.det || L('détecteur', 'detector'));
      s += T(xp - 6, cy - 78, L('miroir primaire', 'primary mirror') + (o.D ? ', ' + o.D : ''), 'middle', true) + T(xs - 10, cy + 4, L('secondaire', 'secondary'), 'end', true);
      if (o.f) s += T(W - 12, H - 8, L('focale ', 'focal length ') + o.f, 'end');
      return svg(W, H, s, L('Schéma de principe d\'un télescope à miroirs', 'Principle sketch of a mirror telescope'));
    },
    /* objectif à lentilles */
    refr: function(o){
      var W = 560, H = 200, cy = 108, xl = 200, xf = 460, s = sky();
      s += lens(xl, cy, 46);
      [40, 20].forEach(function(h){ [1, -1].forEach(function(sg){ s += P([[40, cy - sg*h], [xl, cy - sg*h], [xf, cy]], RAY, 1.2); }); });
      if (o.filt) s += '<rect x="'+(xf-60)+'" y="'+(cy-26)+'" width="10" height="52" fill="rgba(192,57,138,0.25)" stroke="'+MID+'"/>' + T(xf-55, cy-34, L('filtres', 'filters'), 'middle');
      s += det(xf, cy, 16, o.det || L('détecteur', 'detector'));
      s += T(xl, cy - 56, o.lens || L('objectif (lentilles)', 'lens objective'), 'middle', true) + (o.f ? T(W - 12, H - 8, L('focale ', 'focal length ') + o.f, 'end') : '');
      return svg(W, H, s, L('Schéma de principe d\'un objectif à lentilles', 'Principle sketch of a lens camera'));
    },
    /* spectromètre à fente et réseau */
    spec: function(o){
      var W = 560, H = 230, cy = 108, s = sky(), C = ['#5B4BD6', '#2E9E58', '#D2412D'];
      s += lens(80, cy, 40) + Ln(170, cy-18, 170, cy-3, INK, 3) + Ln(170, cy+3, 170, cy+18, INK, 3) + lens(250, cy, 34);
      [30, -30].forEach(function(h){ s += P([[40, cy-h], [80, cy-h], [170, cy], [250, cy+h*0.8]], RAY, 1.2); });
      s += P([[250, cy-24], [340, cy-24]], RAY, 1.2) + P([[250, cy+24], [340, cy+24]], RAY, 1.2);
      for (var i=0;i<9;i++) s += Ln(340, cy-36+i*9, 346, cy-36+i*9, INK, 1);
      s += Ln(340, cy-40, 340, cy+40, INK, 2);
      C.forEach(function(c, i){ var y = cy - 34 + i*34; s += P([[346, cy-20], [440, y-16]], c, 1.2) + P([[346, cy+20], [440, y+24]], c, 1.2) + P([[440, y-16], [500, y + 4]], c, 1.2) + P([[440, y+24], [500, y + 4]], c, 1.2); });
      s += lens(440, cy, 60) + Ln(500, cy-60, 500, cy+60, DET, 5);
      s += T(170, cy+36, o.slit || L('fente', 'slit'), 'middle', true) + T(250, cy-46, L('collimateur', 'collimator'), 'middle') + T(343, cy+58, o.disp || L('réseau', 'grating'), 'middle', true);
      s += T(500, cy+80, o.det || L('détecteur', 'detector'), 'middle', true) + T(500, cy+94, L('une ligne par couleur', 'one row per colour'), 'middle');
      s += T(80, cy+56, L('télescope', 'telescope'), 'middle');
      return svg(W, H, s, L('Schéma de principe d\'un spectromètre à fente', 'Principle sketch of a slit spectrometer'));
    },
    /* spectromètre à transformée de Fourier (interféromètre de Michelson) */
    fts: function(o){
      var W = 560, H = 240, cy = 96, xb = 260, s = sky();
      s += lens(90, cy, 34) + P([[40, cy], [xb, cy]], RAY, 1.4);
      s += Ln(xb-22, cy+22, xb+22, cy-22, INK, 3) + T(xb-30, cy-30, L('séparatrice', 'beam splitter'), 'end', true);
      s += P([[xb, cy], [430, cy]], RAY, 1.2) + Ln(430, cy-26, 430, cy+26, INK, 4) + Ln(448, cy-34, 486, cy-34, MID) + arrow(492, cy-34, 0) + arrow(442, cy-34, 180) + T(468, cy+48, L('miroir mobile', 'moving mirror'), 'middle', true);
      s += P([[xb, cy], [xb, 22]], RAY, 1.2) + Ln(xb-26, 22, xb+26, 22, INK, 4) + T(xb+34, 26, L('miroir fixe', 'fixed mirror'), null, true);
      s += P([[xb, cy], [xb, 196]], RAY, 1.6) + Ln(xb-16, 198, xb+16, 198, DET, 5) + T(xb+26, 202, o.det || L('détecteur', 'detector'), null, true);
      s += T(xb+26, 218, L('signal en fonction de la course du miroir', 'signal versus mirror travel'));
      return svg(W, H, s, L('Schéma de principe d\'un spectromètre de Fourier', 'Principle sketch of a Fourier spectrometer'));
    },
    /* radiomètre : petit télescope, filtres, rangée de détecteurs */
    rad: function(o){ return DRAW.refr({ filt:true, lens:L('télescope', 'telescope'), det:o.det || L('détecteurs thermiques', 'thermal detectors') }); },
    /* spectromètre gamma, neutrons, rayons X : pas d'optique */
    gamma: function(o){
      var W = 560, H = 220, s = '', yg = 186;
      s += Pa('M20 '+yg+' Q140 '+(yg-10)+' 280 '+yg+' T540 '+yg, GND, 3) + T(530, yg+20, L('surface du corps', 'surface of the body'), 'end');
      s += '<rect x="230" y="34" width="100" height="46" rx="4" fill="rgba(61,107,224,0.15)" stroke="'+DET+'" stroke-width="2"/>' + T(280, 26, o.det || L('cristal détecteur', 'detector crystal'), 'middle', true);
      s += Ln(60, 10, 140, yg-4, SOFT, 1.2, '4 3') + T(66, 24, o.src || L('rayons cosmiques', 'cosmic rays'));
      [[160, 240], [280, 280], [400, 320]].forEach(function(p){ var x0 = p[0], x1 = p[1], d = 'M'+x0+' '+(yg-6); for (var i=1;i<=10;i++){ var t = i/10, x = x0 + (x1-x0)*t, y = (yg-6) + (82-(yg-6))*t; d += ' L'+f(x + (i%2 ? 5 : -5))+' '+f(y); } s += Pa(d, RAY, 1.2) + arrow(x1, 84, -90, RAY); });
      s += T(420, 130, o.what || L('rayons gamma ou neutrons', 'gamma rays or neutrons'), 'start', true) + T(420, 146, L('émis par le sol', 'emitted by the ground'), 'start');
      s += T(342, 62, L('pas de lentille ni de miroir', 'no lens or mirror'), 'start');
      return svg(W, H, s, L('Schéma de principe d\'un spectromètre gamma', 'Principle sketch of a gamma-ray spectrometer'));
    },
    xray: function(){ return DRAW.gamma({ what:L('rayons X', 'X-rays'), src:L('rayons X du Soleil', 'X-rays from the Sun'), det:L('détecteur', 'detector') }); },
    /* altimètre laser */
    alt: function(o){
      var W = 560, H = 240, yg = 206, fx = 275, s = '';
      /* flèche posée sur le segment, à la fraction t, dans le sens du trajet */
      function on(x1, y1, x2, y2, t, c){ return arrow(x1 + (x2-x1)*t, y1 + (y2-y1)*t, Math.atan2(y2-y1, x2-x1)*180/Math.PI, c); }
      s += '<rect x="150" y="20" width="250" height="40" rx="4" fill="none" stroke="'+SOFT+'" stroke-dasharray="4 3"/>' + T(275, 14, OPTICS_SITE.craft(), 'middle');
      s += '<rect x="206" y="30" width="44" height="22" rx="3" fill="rgba(219,90,20,0.15)" stroke="'+RAY+'"/>' + T(196, 80, L('laser', 'laser'), 'end', true);
      s += '<rect x="300" y="26" width="40" height="28" rx="3" fill="rgba(61,107,224,0.10)" stroke="'+DET+'"/>' + Ln(300, 54, 340, 54, INK, 3) + T(352, 80, L('télescope récepteur', 'receiving telescope'), 'start', true);
      /* lumière renvoyée dans toutes les directions par le sol : le télescope n'en capte qu'une petite partie */
      [[150, 150], [190, 112], [370, 112], [410, 150]].forEach(function(e){ s += Ln(fx, yg-4, e[0], e[1], SOFT, 1, '3 4'); });
      s += T(430, 168, L('lumière diffusée', 'scattered light'), 'start');
      s += Ln(228, 52, fx-3, yg-4, RAY, 1.8) + on(228, 52, fx-3, yg-4, 0.55, RAY);
      s += Ln(fx+3, yg-4, 320, 54, RAY, 1.3, '6 3') + on(fx+3, yg-4, 320, 54, 0.5, RAY);
      s += Pa('M20 '+yg+' Q160 '+(yg-12)+' '+fx+' '+(yg-4)+' T540 '+yg, GND, 3) + '<ellipse cx="'+fx+'" cy="'+(yg-4)+'" rx="9" ry="3" fill="'+RAY+'" opacity="0.5"/>';
      s += Ln(30, 126, 56, 126, RAY, 1.8) + T(62, 130, L('aller : impulsion', 'out: pulse'), 'start') + Ln(30, 142, 56, 142, RAY, 1.3, '6 3') + T(62, 146, L('retour : écho', 'back: echo'), 'start');
      s += T(430, 110, L('temps aller-retour', 'round-trip time'), 'start', true) + T(430, 126, L('→ distance → relief', '→ distance → topography'), 'start');
      if (o.lam) s += T(120, 120, o.lam, 'end');
      return svg(W, H, s, L('Schéma de principe d\'un altimètre laser : l\'impulsion part vers le sol, la tache éclairée renvoie de la lumière dans toutes les directions et le télescope en capte l\'écho', 'Principle sketch of a laser altimeter: the pulse goes down to the ground, the lit spot scatters light in all directions and the telescope catches the echo'));
    },
    /* radar sondeur (antenne dipôle, vise sous la sonde) ou radar imageur (visée de côté) */
    radar: function(o){
      var W = 560, H = 240, yg = 170, s = '', sar = o.sar;
      s += Pa('M20 '+yg+' Q200 '+(yg-12)+' 300 '+yg+' T540 '+yg, GND, 3);
      if (sar){
        s += '<rect x="80" y="20" width="60" height="26" rx="3" fill="none" stroke="'+SOFT+'"/>' + Pa('M140 22 Q160 33 140 44', INK, 3) + T(110, 62, o.ant || L('antenne', 'antenna'), 'middle', true);
        [0, 1, 2].forEach(function(i){ s += Pa('M'+(170+i*18)+' '+(40+i*16)+' q 10 14 22 6', RAY, 1.4); });
        s += P([[150, 34], [300, yg-4]], RAY, 1, '4 3') + P([[150, 34], [430, yg-2]], RAY, 1, '4 3') + Ln(300, yg+10, 430, yg+10, MID, 1.4) + T(365, yg+26, L('bande imagée, de côté', 'side-looking imaged strip'), 'middle');
        s += P([[380, yg-6], [190, 46]], DET, 1.2, '2 3') + arrow(194, 48, -150, DET) + T(300, 92, L('écho', 'echo'), 'start', true);
      } else {
        s += Ln(170, 30, 390, 30, INK, 3) + '<rect x="262" y="22" width="36" height="16" rx="2" fill="none" stroke="'+SOFT+'"/>' + T(280, 16, o.ant || L('antenne dipôle', 'dipole antenna'), 'middle', true);
        [0, 1, 2].forEach(function(i){ s += Pa('M'+(230-i*10)+' '+(60+i*22)+' Q280 '+(78+i*22)+' '+(330+i*10)+' '+(60+i*22), RAY, 1.3); });
        s += Pa('M40 '+(yg+40)+' Q220 '+(yg+30)+' 300 '+(yg+44)+' T540 '+(yg+38), MID, 1.4, null).replace('/>', ' stroke-dasharray="5 4"/>');
        s += T(530, yg+60, L('couche enfouie', 'buried layer'), 'end');
        s += P([[350, yg-2], [350, 44]], DET, 1.2, '2 3') + arrow(350, 44, -90, DET) + P([[372, yg+40], [372, 44]], DET, 1.2, '2 3') + arrow(372, 44, -90, DET) + T(388, 104, L('deux échos :', 'two echoes:'), 'start', true) + T(388, 120, L('surface, puis sous-sol', 'surface, then subsurface'), 'start');
      }
      if (o.freq) s += T(20, 18, o.freq, null);
      return svg(W, H, s, L('Schéma de principe d\'un radar', 'Principle sketch of a radar'));
    },
    /* radioscience : liaison avec la Terre */
    radio: function(){
      var W = 560, H = 210, s = '';
      s += '<circle cx="420" cy="150" r="52" fill="none" stroke="'+GND+'" stroke-width="3"/>' + T(420, 154, L('corps étudié', 'body studied'), 'middle');
      s += '<rect x="408" y="48" width="24" height="16" rx="2" fill="none" stroke="'+INK+'" stroke-width="2"/>' + T(440, 44, OPTICS_SITE.craft(), null, true);
      s += Pa('M58 160 Q80 192 102 160', INK, 3) + Ln(80, 176, 80, 194, INK, 2) + T(80, 204, L('antenne sur Terre', 'antenna on Earth'), 'middle', true);
      s += P([[96, 164], [404, 60]], RAY, 1.2, '6 4') + arrow(400, 61, -18, RAY) + arrow(100, 163, 162, RAY);
      s += T(250, 92, L('signal radio aller et retour', 'two-way radio signal'), 'middle', true) + T(250, 108, L('décalage Doppler → vitesse → gravité', 'Doppler shift → speed → gravity'), 'middle');
      return svg(W, H, s, L('Schéma de principe de la radioscience', 'Principle sketch of radio science'));
    }
  };

  /* ---------- étapes, par famille ---------- */
  function STEPS(k){ return {
    refl:[L('La lumière renvoyée par la surface entre dans le tube.', 'Light reflected by the surface enters the tube.'), L('Le miroir primaire, concave, la concentre vers le miroir secondaire.', 'The concave primary mirror concentrates it towards the secondary mirror.'), L('Le secondaire la renvoie à travers un trou du primaire, ce qui allonge la focale dans un tube court.', 'The secondary sends it back through a hole in the primary, which lengthens the focal length in a short tube.'), L('L\'image se forme sur le détecteur ; le défilement de la sonde balaie le terrain ligne après ligne.', 'The image forms on the detector; the spacecraft\'s motion sweeps the terrain line after line.')],
    cam:[L('La lumière renvoyée par la surface entre dans l\'optique de la caméra.', 'Light reflected by the surface enters the camera optics.'), L('Des filtres choisissent la couleur observée.', 'Filters select the colour observed.'), L('L\'image se forme sur le détecteur ; le défilement de la sonde balaie le terrain ou la caméra prend des vues fixes.', 'The image forms on the detector; the spacecraft\'s motion sweeps the terrain, or the camera takes snapshots.')],
    refr:[L('La lumière traverse un objectif à lentilles.', 'Light passes through a lens objective.'), L('Des filtres ne laissent passer qu\'une couleur à la fois.', 'Filters let through one colour at a time.'), L('L\'image se forme sur le détecteur.', 'The image forms on the detector.')],
    spec:[L('Un télescope forme une image de la surface sur une fente étroite.', 'A telescope forms an image of the surface on a narrow slit.'), L('Le collimateur rend le faisceau parallèle.', 'The collimator makes the beam parallel.'), L('Le réseau (ou le prisme) dévie chaque longueur d\'onde d\'un angle différent.', 'The grating (or prism) deflects each wavelength by a different angle.'), L('Sur le détecteur, une direction donne la position le long de la fente, l\'autre la longueur d\'onde : un spectre par point.', 'On the detector, one direction gives the position along the slit, the other the wavelength: one spectrum per point.')],
    fts:[L('Le faisceau est coupé en deux par une lame séparatrice.', 'The beam is split in two by a beam splitter.'), L('Une moitié va sur un miroir fixe, l\'autre sur un miroir qui se déplace.', 'One half goes to a fixed mirror, the other to a moving mirror.'), L('Les deux moitiés se recombinent et interfèrent sur le détecteur.', 'The two halves recombine and interfere on the detector.'), L('Le signal mesuré pendant la course du miroir donne le spectre par transformée de Fourier.', 'The signal measured during the mirror\'s travel gives the spectrum by Fourier transform.')],
    rad:[L('Un petit télescope vise la surface ou le bord de l\'atmosphère.', 'A small telescope points at the surface or the edge of the atmosphere.'), L('Des filtres découpent l\'infrarouge en canaux.', 'Filters split the infrared into channels.'), L('Des détecteurs thermiques mesurent l\'énergie reçue dans chaque canal, d\'où la température.', 'Thermal detectors measure the energy received in each channel, hence the temperature.')],
    gamma:[L('Les rayons cosmiques frappent le sol, qui émet en retour des rayons gamma et des neutrons, à des énergies propres à chaque élément.', 'Cosmic rays strike the ground, which emits gamma rays and neutrons in return, at energies specific to each element.'), L('Aucune optique ne les dévie : ils entrent directement dans le cristal détecteur.', 'No optics can bend them: they enter the detector crystal directly.'), L('L\'instrument compte les impulsions par énergie ; la carte vient de l\'accumulation des orbites.', 'The instrument counts pulses by energy; the map builds up over many orbits.')],
    xray:[L('Les rayons X du Soleil frappent le sol, dont les atomes réémettent des rayons X à des énergies propres à chaque élément (fluorescence).', 'X-rays from the Sun strike the ground, whose atoms re-emit X-rays at energies specific to each element (fluorescence).'), L('Un collimateur limite le champ de vue ; aucune lentille ne focalise ces rayons.', 'A collimator limits the field of view; no lens focuses these rays.'), L('Le détecteur mesure l\'énergie de chaque photon X ; le spectre donne la composition du sol.', 'The detector measures the energy of each X-ray photon; the spectrum gives the composition of the ground.')],
    alt:[L('Le laser envoie une impulsion très brève vers le sol.', 'The laser sends a very short pulse towards the ground.'), L('Une petite partie de la lumière revient vers un télescope récepteur.', 'A small part of the light comes back to a receiving telescope.'), L('Le temps aller-retour donne la distance, donc l\'altitude du sol sous la sonde.', 'The round-trip time gives the distance, hence the height of the ground below the spacecraft.')],
    radar:[L('L\'antenne émet une impulsion radio.', 'The antenna emits a radio pulse.'), L('L\'onde traverse les nuages, et à basse fréquence une partie entre dans le sol.', 'The wave crosses clouds, and at low frequency part of it enters the ground.'), L('Les échos reviennent à l\'antenne ; leur retard et leur force donnent l\'image, le relief ou les couches du sous-sol.', 'The echoes return to the antenna; their delay and strength give the image, the relief or the subsurface layers.')],
    radio:[L('Une antenne sur Terre envoie un signal radio de fréquence très stable.', 'An antenna on Earth sends a radio signal of very stable frequency.'), OPTICS_SITE.echo(), L('Les variations de vitesse révèlent le champ de gravité, ou l\'atmosphère traversée par le signal.', 'Speed changes reveal the gravity field, or the atmosphere crossed by the signal.')]
  }[k]; }

  /* ---------- données sourcées des caméras principales ----------
     figs : un dessin par voie (petit champ, grand champ) ; rows : combinaison optique, [libellé, valeur, clé de source] */
  function OPTICS(){ return OPTICS_SITE.data(); }
  var GAMMA = /^(grns|grs|ns|gs)$/, FTS = /^(cirs|pfs)$/, SOUNDER = /^(sharad|marsis|lrs)$/;
  function kindOf(it){
    if (it.type === 'spec') return it.id === 'xrs' ? 'xray' : GAMMA.test(it.id) ? 'gamma' : FTS.test(it.id) ? 'fts' : 'spec';
    return OPTICS_SITE.types[it.type] || null;
  }

  /* section « Trajet de la lumière » de la page d'un instrument */
  function section(m, it, mk, table){
    var k = kindOf(it), o = OPTICS()[m.id + ':' + it.id];
    if (!k) return '<div class="isec wide"><h3>' + L('Trajet de la lumière', 'Light path') + '</h3><p class="note">' + L('Pas de lumière à suivre : cet instrument mesure directement des particules ou des champs autour de la sonde.', 'No light to follow: this instrument directly measures particles or fields around the spacecraft.') + '</p></div>';
    var figs = o ? o.figs : [{ kind: k === 'cam' ? 'refr' : k, lens: k === 'cam' ? L('optique (lentilles ou miroirs)', 'optics (lenses or mirrors)') : null, filt: k === 'cam', sar: k === 'radar' && !SOUNDER.test(it.id), what: it.id === 'ns' ? L('neutrons', 'neutrons') : it.id === 'xrs' ? L('rayons X', 'X-rays') : null }];
    var light = !/^(radar|radio|gamma|xray)$/.test(figs[0].kind), h = light ? L('Trajet de la lumière', 'Light path') : L('Trajet du signal', 'Signal path');
    var s = '<div class="isec wide"><h3>' + h + '</h3><div class="opt-figs">' + figs.map(function(g){ return '<figure class="opt-fig">' + (g.title ? '<figcaption class="opt-t">' + esc(g.title) + '</figcaption>' : '') + DRAW[g.kind](g) + '</figure>'; }).join('') + '</div>';
    s += '<div class="cap">' + L('Schéma de principe : formes, tailles et distances ne sont pas à l\'échelle.', 'Principle sketch: shapes, sizes and distances are not to scale.') +
      (o ? ' ' + L('Seules les valeurs du tableau ci-dessous sont celles de l\'instrument.', 'Only the values in the table below are the instrument\'s own.') : ' ' + L('Dessin générique de cette famille d\'instruments : la conception exacte de celui-ci n\'est pas reprise ici.', 'Generic drawing for this family of instruments: this one\'s exact design is not shown here.')) +
      (light ? ' ' + L('Rayons en orange, miroirs et lentilles en noir, détecteurs en bleu.', 'Rays in orange, mirrors and lenses in black, detectors in blue.') : '') + '</div>';
    s += '<div class="inst-cols opt-cols"><div><h4>' + L('Étape par étape', 'Step by step') + '</h4><ol class="notes">' + STEPS(o ? figs[0].kind : k).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>';
    if (o) s += '<div><h4>' + L('Combinaison optique', 'Optical design') + '</h4>' + table(o.rows, mk) + '</div>';
    return s + '</div></div>';
  }
  return { section:section, kindOf:kindOf };
})();
