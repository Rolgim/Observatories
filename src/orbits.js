/* =================================================================
   ORBITES ET TEMPS (lot F des specs)
   - observatoires à L2 : trajectoires réelles (data/orbits.json, JPL Horizons), repère tournant Soleil–Terre
   - Hubble : orbite basse dessinée à l'échelle, mouvement calculé (période et ombre de la Terre)
   - Gaia : loi de balayage nominale simulée (rotation 6 h, précession 63 jours, axe à 45° du Soleil)
================================================================= */
var Orbits = (function(){
  var DATA, loading, run = 0, SKY, skyLoading;
  function esc(x){ return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function loadSky(){ return skyLoading || (skyLoading = fetch('data/sky.json').then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }).then(function(j){ SKY = j; return j; })); }
  function load(){ return loading || (loading = fetch('data/orbits.json').then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }).then(function(j){ DATA = j; return j; })); }
  function css(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function fr(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, OBS_LANG === 'en' ? ',' : ' '); }
  function rows(a){ return '<div class="stable">' + a.map(function(r){ return '<div class="srow"><div class="k">'+r[0]+'</div><div class="v">'+r[1]+'</div></div>'; }).join('') + '</div>'; }
  function cv(id, w, h, label){ return '<canvas class="orb" data-orb="'+id+'" width="'+w+'" height="'+h+'" role="img" aria-label="'+label+'"></canvas>'; }
  function date(jd){ var d = new Date((jd - 2440587.5)*86400000); var dd = ('0'+d.getUTCDate()).slice(-2), mm = ('0'+(d.getUTCMonth()+1)).slice(-2); return OBS_LANG === 'en' ? d.getUTCFullYear()+'-'+mm+'-'+dd : dd+'/'+mm+'/'+d.getUTCFullYear(); }

  /* type d'orbite de chaque observatoire : registre de data-tele.js */
  var T_ORBIT = {}; TELESCOPES.forEach(function(t){ T_ORBIT[t.id] = t.orbit; });
  var TEXT = {
    hubble:{ leo:{ r:6851, per:95, rows:[['Altitude','≈ 470 km, en baisse (valeur du jour ci-dessus)'],['Période','≈ 95 min'],['Vitesse','≈ 7,6 km/s'],['Inclinaison','28,5°'],['Tours par jour','≈ 15'],['Dans l\'ombre de la Terre','au plus ≈ 36 min par tour (calculé)']] },
      sum:'Hubble tourne à environ 480 km au-dessus du sol, en 95 minutes. La Terre occupe presque la moitié de son ciel, et lui cache le Soleil à chaque tour.',
      notes:['La Terre masque la plupart des cibles pendant une partie de chaque orbite : une pose longue est découpée en tranches d\'une cinquantaine de minutes.',
             'Seules deux petites régions du ciel, près des pôles de l\'orbite, restent visibles en continu. Les champs profonds de Hubble y ont été choisis.',
             'Le passage jour–nuit toutes les 95 minutes fait travailler la structure : c\'est ce qui faisait vibrer les premiers panneaux solaires.',
             'L\'orbite s\'abaisse lentement par frottement sur la haute atmosphère ; les navettes la relevaient à chaque visite.'] },
    jwst:{ sum:'Webb tourne autour du point de Lagrange L2, à 1,5 million de km de la Terre, sur une orbite plus large que celle de la Lune. Il lui faut environ six mois pour en faire le tour.',
      notes:['À L2, le Soleil, la Terre et la Lune restent toujours du même côté : un seul bouclier suffit à les masquer tous les trois.',
             'L\'orbite est assez large pour ne jamais passer dans l\'ombre de la Terre ou de la Lune : le panneau solaire est éclairé en permanence.',
             'Cette position est instable. Un petit coup de moteur, toutes les trois semaines environ, empêche Webb de dériver.'] },
    euclid:{ sum:'Euclid tourne lui aussi autour de L2, sur une grande orbite parcourue en six mois environ. Il garde son pare-soleil tourné vers le Soleil et balaie le ciel par bandes.',
      notes:['L\'environnement thermique y est très stable, ce qui est indispensable pour mesurer la forme des galaxies au millième près.',
             'Le télescope observe toujours à peu près perpendiculairement à la direction du Soleil : la zone accessible fait le tour du ciel en un an.',
             'Des manœuvres d\'entretien d\'orbite ont lieu environ toutes les quatre semaines.'] },
    roman:{ sum:'Roman rejoint lui aussi L2, à 1,5 million de km, sur une orbite de halo parcourue en six mois environ. Lancé le 30 août 2026, il a fait le trajet en trois mois environ : la trajectoire ci-dessous part de sa première semaine de vol.',
      notes:['Comme Webb et Euclid, Roman garde le Soleil, la Terre et la Lune du même côté : son pare-soleil à panneaux solaires reste tourné vers eux.',
             'L\'éloignement permet de longues séries d\'observations sans interruption, indispensables pour suivre pendant des semaines les mêmes étoiles du bulbe galactique.',
             'Ses premières images publiques sont attendues début 2027.'],
      noTraj:'La trajectoire réelle de Roman s\'affichera ici dès que les éphémérides de JPL Horizons seront récupérées par la mise à jour quotidienne des données du site. En attendant, la carte du ciel observable montre déjà la partie du ciel qu\'il peut viser.' },
    chandra:{ sum:'Chandra parcourt une orbite très allongée autour de la Terre : il passe à quelques milliers de kilomètres au plus près, puis s\'éloigne jusqu\'à environ 142 000 km, plus du tiers de la distance de la Lune. Un tour dure 63,5 heures.',
      notes:['Environ 70 % du temps, Chandra est au-dessus des ceintures de radiations. Les observations s\'arrêtent pendant la traversée de ces ceintures, qui abîmeraient les détecteurs.',
             'Loin de la Terre, de longues poses ininterrompues sont possibles, contrairement à Hubble que la Terre masque à chaque tour.',
             'L\'orbite se déforme lentement sous l\'attraction de la Lune et du Soleil : le périgée est descendu à 1 045 km en juillet 2023, puis remonté à environ 6 680 km en 2025.',
             'Pour protéger ses instruments de la chaleur, les longues observations sont découpées en tranches d\'au plus 30 ks environ.'] },
    fermi:{ leo:{ r:6936, per:96.5, rows:[['Altitude','≈ 565 km au lancement (valeur du jour ci-dessus)'],['Période','96,5 min'],['Inclinaison','25,6°'],['Précession de l\'orbite','53,4 jours'],['Anomalie de l\'Atlantique Sud','≈ 15 % du temps d\'observation perdu']] },
      sum:'Fermi tourne à environ 565 km d\'altitude, en 96,5 minutes, sur une orbite inclinée de 25,6° sur l\'équateur. Il ne vise pas une cible : il balaie le ciel.',
      notes:['En mode relevé, l\'axe du LAT est incliné d\'environ 50° vers le nord pendant une orbite, puis vers le sud pendant la suivante : en deux orbites, environ trois heures, tout le ciel est couvert.',
             'La Terre, très brillante en rayons gamma à cause des rayons cosmiques qui frappent son atmosphère, est évitée : les photons venant de plus de 90° du zénith sont écartés.',
             'Le satellite traverse régulièrement l\'anomalie de l\'Atlantique Sud, où les particules piégées sont si nombreuses qu\'il faut couper les instruments : environ 15 % du temps est perdu.'] },
    spitzer:{ sum:'Spitzer ne tournait pas autour de la Terre : il tournait autour du Soleil, sur une orbite un peu plus lente que celle de la Terre. Il est donc resté dans son sillage, en s\'en éloignant d\'environ 0,12 UA par an.',
      notes:['Loin de la Terre, qui rayonne beaucoup d\'infrarouge, le télescope se refroidissait mieux et l\'hélium durait plus longtemps.',
             'Le Soleil et la Terre restent à peu près du même côté : le panneau solaire faisait écran pour tout le télescope. Spitzer ne visait qu\'entre 82,5° et 120° du Soleil.',
             'Plus il s\'éloignait, moins il pouvait transmettre de données (Spaceflight Now, mai 2019). La mission s\'est arrêtée le 30 janvier 2020.'] },
    gaia:{ sum:'De 2014 à 2025, Gaia a décrit une courbe de Lissajous autour de L2 : une boucle qui ne se referme pas, choisie pour ne pas traverser l\'ombre de la Terre pendant des années.',
      notes:['Les observations se sont arrêtées le 15 janvier 2025. Le satellite a ensuite été écarté de L2 et mis hors service le 27 mars 2025.',
             'La trajectoire tracée ici s\'arrête à ce départ.',
             'La position de Gaia devait être connue à 150 m près : des télescopes au sol le photographiaient chaque nuit parmi les étoiles.'] }
  };

  /* zones observables (lot F4) : intervalle d'élongation solaire autorisé, en degrés, et sa source */
  var VIS = {
    hubble:{ lo:62.5, hi:180, cap:'Hubble peut viser tout ce qui est à plus de 62,5° du Soleil (règle du cycle 34, en mode à gyroscope réduit ; HST Primer). Sur chaque orbite de 95 minutes, la Terre masque aussi une partie du ciel : non représenté.' },
    jwst:{ lo:85, hi:135, cap:'Webb doit garder son bouclier face au Soleil : il ne vise qu\'entre 85° et 135° du Soleil, soit environ 39 % du ciel un jour donné (JDox). Les pôles de l\'écliptique, à moins de 5°, restent visibles toute l\'année.' },
    euclid:{ lo:87, hi:104, cap:'Euclid vise presque perpendiculairement au Soleil : angle d\'aspect solaire de 87° à 104° dans la pratique du relevé (Euclid I, sect. 4.1.1). D\'où une bande étroite, qui fait le tour du ciel en un an.' },
    chandra:{ lo:46.2, hi:180, cap:'Chandra ne vise jamais à moins de 46,2° du Soleil, contrainte qui ne peut être levée ; environ 15 % du ciel est inaccessible un jour donné, mais aucune région ne l\'est plus de trois mois. La Lune (6°) et le bord éclairé de la Terre (10°) ajoutent de petites exclusions, non représentées (POG, contraintes de visibilité).' },
    roman:{ lo:54, hi:126, cap:'Roman peut viser entre 54° et 126° du Soleil, en tournant librement autour de la direction du Soleil (NASA Goddard, Observatory Technical Overview).' },
    fermi:{ lo:0, hi:180, cap:'Fermi ne vise pas de cible : en mode relevé, il balaie le ciel entier en deux orbites, environ trois heures. Seule la Terre, sous le satellite, masque une partie du ciel (Fermi Cicerone).' },
    spitzer:{ lo:82.5, hi:120, cap:'Spitzer ne visait qu\'entre 82,5° et 120° du Soleil, pour garder le télescope à l\'ombre du panneau solaire : environ un tiers du ciel à un instant donné, le ciel entier en six mois (Spitzer Telescope Handbook ; Werner et al. 2006).' },
    gaia:{ lo:45, hi:135, cap:'Gaia ne vise pas : il tourne sur lui-même, l\'axe incliné à 45° du Soleil. Le cercle balayé reste donc entre 45° et 135° du Soleil ; la précession de l\'axe, en 63 jours, promène ce cercle dans toute la bande (calculé à partir de l\'angle de 45°).' }
  };
  function sunVec(jd){
    var n = jd - 2451545, D = Math.PI/180, L = (280.460 + 0.9856474*n)*D, g = (357.528 + 0.9856003*n)*D, lam = L + (1.915*Math.sin(g) + 0.020*Math.sin(2*g))*D, e = 23.439*D;
    return [Math.cos(lam), Math.cos(e)*Math.sin(lam), Math.sin(e)*Math.sin(lam)];
  }
  function drawVis(c, tid, jd, refs){
    var g = prep(c), W = c._w, H = c._h, V = VIS[tid], sv = sunVec(jd), D = Math.PI/180, cl = Math.cos(V.lo*D), ch = Math.cos(V.hi*D), ok = 0, tot = 0;
    g.clearRect(0, 0, W, H);
    /* rendu pixel par pixel : projection de Hammer inversée, puis test d'élongation */
    var off = c._off || (c._off = document.createElement('canvas')); off.width = W; off.height = H;
    var og = off.getContext('2d'), img = og.createImageData(W, H), px = img.data, hex = css('--ok').replace('#', ''), rgb = [0, 2, 4].map(function(k){ return parseInt(hex.substr(k, 2), 16); });
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++){
      var xs = 2*Math.SQRT2*(W/2 - x)/(W/2 - 8), ys = Math.SQRT2*(H/2 - y)/(H/2 - 8), q = 1 - xs*xs/16 - ys*ys/4;
      if (q < 0.5) continue;
      var z = Math.sqrt(q), l = 2*Math.atan2(z*xs, 2*(2*z*z - 1)), b = Math.asin(Math.max(-1, Math.min(1, z*ys)));
      var v0 = -Math.cos(b)*Math.cos(l), v1 = -Math.cos(b)*Math.sin(l), v2 = Math.sin(b), cs = v0*sv[0] + v1*sv[1] + v2*sv[2];
      if (cs <= cl && cs >= ch){ var o = (y*W + x)*4; px[o] = rgb[0]; px[o+1] = rgb[1]; px[o+2] = rgb[2]; px[o+3] = 115; }
    }
    og.putImageData(img, 0, 0); g.drawImage(off, 0, 0, W, H);
    /* part du ciel : échantillonnage régulier pondéré par le cosinus de la déclinaison */
    for (var de = -89; de < 90; de += 2) for (var ra = 1; ra < 360; ra += 2){
      var v = [Math.cos(de*D)*Math.cos(ra*D), Math.cos(de*D)*Math.sin(ra*D), Math.sin(de*D)], cs2 = v[0]*sv[0] + v[1]*sv[1] + v[2]*sv[2], w = Math.cos(de*D);
      tot += w; if (cs2 <= cl && cs2 >= ch) ok += w;
    }
    g.globalAlpha = 1; g.strokeStyle = css('--rule-2'); g.lineWidth = 1; g.beginPath(); g.ellipse(W/2, H/2, W/2 - 8, H/2 - 8, 0, 0, 6.2832); g.moveTo(8, H/2); g.lineTo(W - 8, H/2); g.stroke();
    refs(g, W, H);
    var sp = hammer([-sv[0], -sv[1], sv[2]], W, H); g.fillStyle = css('--mark'); g.strokeStyle = css('--ink'); g.beginPath(); g.arc(sp[0], sp[1], 7, 0, 6.2832); g.fill(); g.stroke();
    g.fillStyle = css('--ink'); label(g, 'Soleil', sp[0] + 11, sp[1] + 4, true);
    return ok/tot;
  }
  /* ---------- Hubble en direct (F1) : TLE + SGP4 (satellite.js), carte de la Terre ---------- */
  var SATJS = 'https://cdn.jsdelivr.net/npm/satellite.js@5.0.0/dist/satellite.min.js', satLoading = null, landLoading = null, tleLoading = null;
  function loadSat(){ return satLoading || (satLoading = new Promise(function(ok, ko){ if (window.satellite) return ok(window.satellite); var e = document.createElement('script'); e.src = SATJS; e.onload = function(){ ok(window.satellite); }; e.onerror = ko; document.head.appendChild(e); })); }
  function loadJSON(u){ return fetch(u).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }
  function drawTrack(c, st, land){
    var g = prep(c), W = c._w, H = c._h, S = window.satellite, now = new Date(), D = 180/Math.PI;
    function X(lon){ return 8 + (lon + 180)/360*(W - 16); } function Y(lat){ return 8 + (90 - lat)/180*(H - 16); }
    g.clearRect(0, 0, W, H);
    g.fillStyle = css('--sheet'); g.fillRect(8, 8, W - 16, H - 16);
    /* terres */
    g.fillStyle = css('--rule'); land.rings.forEach(function(r){ g.beginPath(); for (var i=0;i<r.length;i+=2){ var x = X(r[i]), y = Y(r[i+1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.fill(); });
    /* nuit : côté opposé au point subsolaire */
    var jd = now.getTime()/86400000 + 2440587.5, sv = sunVec(jd), ra = Math.atan2(sv[1], sv[0]), dec = Math.asin(sv[2]), gm = S.gstime(now), slon = ((ra - gm)*D + 540) % 360 - 180, sdec = dec*D;
    g.fillStyle = css('--ink'); g.globalAlpha = 0.14; g.beginPath();
    var poleN = sdec < 0; /* le pôle plongé dans la nuit */
    for (var lon = -180; lon <= 180; lon += 2){ var lat = Math.atan(-Math.cos((lon - slon)/D)/Math.tan(Math.abs(sdec) < 0.1 ? 0.1/D : sdec/D))*D; if (lon === -180) g.moveTo(X(lon), Y(lat)); else g.lineTo(X(lon), Y(lat)); }
    g.lineTo(X(180), Y(poleN ? 90 : -90)); g.lineTo(X(-180), Y(poleN ? 90 : -90)); g.closePath(); g.fill(); g.globalAlpha = 1;
    /* graticule */
    g.strokeStyle = css('--rule-2'); g.lineWidth = 0.5; g.beginPath();
    for (var lo = -150; lo <= 150; lo += 30){ g.moveTo(X(lo), 8); g.lineTo(X(lo), H - 8); } for (var la = -60; la <= 60; la += 30){ g.moveTo(8, Y(la)); g.lineTo(W - 8, Y(la)); } g.stroke();
    g.strokeStyle = css('--rule-2'); g.lineWidth = 1; g.strokeRect(8, 8, W - 16, H - 16);
    /* trace : une orbite avant (pointillé) et une après (plein) */
    function pos(t){ var pv = S.propagate(st.rec, t); if (!pv || !pv.position) return null; var gd = S.eciToGeodetic(pv.position, S.gstime(t)); return { lon:gd.longitude*D, lat:gd.latitude*D, h:gd.height, v:pv.velocity }; }
    [[-96, 0, [3, 3]], [0, 96, []]].forEach(function(seg){
      g.strokeStyle = '#DB5A14'; g.lineWidth = 1.6; g.setLineDash(seg[2]); g.beginPath(); var prev = null;
      for (var m = seg[0]; m <= seg[1]; m += 1){ var p = pos(new Date(now.getTime() + m*60000)); if (!p) continue; if (prev && Math.abs(p.lon - prev.lon) < 180) g.lineTo(X(p.lon), Y(p.lat)); else g.moveTo(X(p.lon), Y(p.lat)); prev = p; }
      g.stroke(); g.setLineDash([]);
    });
    var p = pos(now); if (!p) return null;
    g.fillStyle = css('--mark'); g.strokeStyle = css('--ink'); g.lineWidth = 1.5; g.beginPath(); g.arc(X(p.lon), Y(p.lat), 6, 0, 6.2832); g.fill(); g.stroke();
    g.fillStyle = css('--ink'); label(g, 'Hubble', X(p.lon) + (p.lon > 140 ? -10 : 10), Y(p.lat) - 9, true, p.lon > 140 ? 'right' : 'left');
    p.night = Math.sin(p.lat/D)*Math.sin(sdec/D) + Math.cos(p.lat/D)*Math.cos(sdec/D)*Math.cos((p.lon - slon)/D) < 0;
    return p;
  }
  function render(tid, name){
    var t = TEXT[tid], s = '<div class="inst-head"><div class="inst-h"><div class="inst-name">Orbite</div><div class="inst-full">'+name+' : où il se trouve et comment il se déplace</div></div><p class="inst-sum">'+t.sum+'</p></div><div class="inst-cols">';
    var ctl = '<div class="orb-ctl"><button class="chip" data-orb-play>Pause</button><span class="orb-read" data-orb-read></span></div>';
    if (T_ORBIT[tid] === 'leo'){
      s += '<div class="isec"><h4>Une orbite, vue de dessus</h4>'+cv('leo', 560, 380, 'Orbite de '+name+' autour de la Terre, à l\'échelle')+ctl+'<div class="cap">Terre et orbite à l\'échelle. Le mouvement est calculé à partir de la période ; la durée de l\'ombre est celle du cas où le Soleil est dans le plan de l\'orbite, le plus défavorable.</div></div>';
      s += '<div class="isec"><h4>Où est '+name+' en ce moment</h4>'+cv('track', 560, 300, 'Position de '+name+' au-dessus de la Terre et trace de son orbite')+'<div class="orb-ctl"><span class="orb-read" data-track-read>Chargement des éléments orbitaux…</span></div><div data-track-stats></div><div class="cap">Position calculée dans votre navigateur à partir des derniers éléments orbitaux publiés (TLE de CelesTrak, modèle SGP4). Trait plein : l\'orbite à venir ; pointillé : celle qui vient de s\'achever. La zone grisée est la nuit. Contour des terres : Natural Earth.</div></div>';
      s += '<div class="isec"><h4>Paramètres</h4>'+rows(t.leo.rows)+'</div>';
    } else if (T_ORBIT[tid] === 'heo'){
      s += '<div class="isec"><h4>Une orbite, vue du nord de l\'écliptique</h4>'+cv('heo', 560, 400, 'Orbite de '+name+' autour de la Terre, à l\'échelle')+ctl+'<div class="cap">Terre et orbite à la même échelle (l\'orbite de la Lune, à 384 400 km, sort du cadre). Dernière orbite complète, positions réelles (éphémérides JPL Horizons) dans un repère géocentrique fixe. Le cercle grisé autour de la Terre marque, à titre indicatif, la région des ceintures de radiations où les observations s\'arrêtent.</div></div>';
      s += '<div class="isec"><h4>Mesuré sur la trajectoire</h4><div data-orb-stats><div class="cap">Chargement de la trajectoire…</div></div></div>';
    } else if (T_ORBIT[tid] === 'helio'){
      s += '<div class="isec"><h4>Toute la mission, vue du nord de l\'écliptique</h4>'+cv('helio', 560, 440, 'Trajectoire de '+name+' autour du Soleil, dans un repère qui tourne avec la Terre')+ctl+'<div class="cap">Le Soleil est au centre, le cercle en pointillé est l\'orbite de la Terre. Le repère tourne avec la Terre, qui reste donc fixe à droite : la courbe montre comment l\'observatoire prend du retard sur elle, année après année. Positions réelles (éphémérides JPL Horizons), une tous les dix jours, distances à l\'échelle.</div></div>';
      s += '<div class="isec"><h4>Mesuré sur la trajectoire</h4><div data-orb-stats><div class="cap">Chargement de la trajectoire…</div></div></div>';
    } else if (t.noTraj && DATA && !(DATA.bodies && DATA.bodies[tid])){   /* données déjà chargées et sans ce corps ; sinon on tranche après chargement */
      s += '<div class="isec"><h4>Trajectoire</h4><p class="cap">'+t.noTraj+'</p></div>';
    } else {
      s += '<div class="isec"><h4>Vu depuis la Terre</h4>'+cv('front', 560, 430, 'Trajectoire autour de L2 vue depuis la Terre')+ctl+'<div class="cap">On regarde vers L2, dos au Soleil. Le cercle en pointillé donne, à la même échelle, la taille de l\'orbite de la Lune. Trajectoire réelle (éphémérides JPL Horizons).</div></div>';
      s += '<div class="isec"><h4>Vu de dessus</h4>'+cv('top', 560, 400, 'Trajectoire autour de L2 vue du nord de l\'écliptique')+'<div class="cap">Le Soleil est à gauche, hors du cadre, à 150 millions de km. Le repère tourne avec la Terre autour du Soleil : la Terre et L2 y restent fixes.</div></div>';
      s += '<div class="isec"><h4>Mesuré sur la trajectoire</h4><div data-orb-stats><div class="cap">Chargement de la trajectoire…</div></div></div>';
      if (tid === 'gaia') s += '<div class="isec"><h4>La loi de balayage</h4>'+cv('scan', 560, 300, 'Couverture du ciel par la loi de balayage de Gaia')+'<div class="orb-ctl"><span class="orb-read" data-orb-scan></span></div><div class="cap">Carte du ciel entier en coordonnées écliptiques. Chaque trait est le grand cercle balayé pendant un tour de 6 heures ; l\'axe de rotation, incliné à 45° du Soleil, tourne autour de lui en 63 jours. Simulation de la loi nominale, pas l\'historique réel des observations.</div></div>';
    }
    if (tid === 'euclid') s += '<div class="isec"><h4>L\'avancée du relevé, mois après mois</h4>'+cv('sky', 560, 300, 'Carte du ciel des observations d\'Euclid')+'<div class="orb-ctl"><span class="orb-read" data-orb-sky>Chargement des observations…</span></div><div class="cap">Carte du ciel entier en coordonnées équatoriales. Chaque point est une case de 0,5° où Euclid a commencé au moins une observation ce mois-là ; les mois s\'accumulent. Ce sont les observations VIS réellement publiées dans DR1. Un télescope de relevé ne choisit pas des cibles : il pave le ciel par plaques contiguës, en restant à peu près perpendiculaire à la direction du Soleil.</div></div>';
    if (tid === 'hubble' || tid === 'jwst') s += '<div class="isec"><h4>Où il a pointé, année après année</h4>'+cv('sky', 560, 300, 'Carte du ciel des pointés réels')+'<div class="sky-ins" data-sky-ins></div><div class="orb-ctl"><span class="orb-read" data-orb-sky>Chargement des pointés…</span></div><div class="cap">Carte du ciel entier en coordonnées équatoriales. Chaque point est une case de '+(tid === 'jwst' ? '0,5' : '1')+'° où au moins une observation scientifique a commencé cette année-là ; les années s\'accumulent. Données réelles de l\'archive MAST. Contrairement à un télescope de relevé, '+name+' va de cible en cible au gré des programmes acceptés.</div></div>';
    var V = VIS[tid];
    s += '<div class="isec"><h4>'+(tid === 'gaia' ? 'Le ciel qu\'il balaie en ce moment' : 'Le ciel qu\'il peut observer en ce moment')+'</h4>'+cv('vis', 560, 300, 'Zone du ciel accessible selon la date')+
      '<div class="orb-ctl"><label class="vis-day"><span data-vis-date></span><input type="range" min="0" max="364" step="1" value="0" data-vis-day aria-label="Jour de l\'année à partir d\'aujourd\'hui"></label><span class="orb-read" data-vis-read></span></div>'+
      '<div class="cap">'+V.cap+' Carte du ciel entier en coordonnées équatoriales, centrée sur 12 h d\'ascension droite ; le disque jaune est le Soleil. Position du Soleil calculée pour la date choisie.</div></div>';
    s += '<div class="isec"><h4>Ce que cela change</h4><ul class="notes">'+t.notes.map(function(n){ return '<li>'+n+'</li>'; }).join('')+'</ul></div></div>';
    return s;
  }

  function prep(c){ var d = Math.min(window.devicePixelRatio || 1, 2), w = +c.getAttribute('width'), h = +c.getAttribute('height'); if (!c._w){ c._w = w; c._h = h; c.width = w*d; c.height = h*d; } var g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return g; }
  function label(g, s, x, y, bold, align){ g.font = (bold ? '700 ' : '') + '12px Archivo, Arial, sans-serif'; g.textAlign = align || 'left'; g.fillText(OBS_T(s), x, y); }

  function drawLeo(c, tmin, L){
    var g = prep(c), W = c._w, H = c._h, cx = W/2 - 10, cy = H/2, k = 150/L.r, re = 6371*k, ro = L.r*k;
    var ink = css('--ink'), mute = css('--mute');
    g.clearRect(0, 0, W, H);
    g.fillStyle = css('--rule'); g.globalAlpha = 0.55; g.fillRect(cx, cy - re, W - cx, 2*re); g.globalAlpha = 1;
    g.fillStyle = '#2C5E9E'; g.beginPath(); g.arc(cx, cy, re, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.arc(cx, cy, re, -Math.PI/2, Math.PI/2); g.fill();
    g.strokeStyle = ink; g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, ro, 0, 6.2832); g.stroke();
    var a = Math.PI + tmin/L.per*6.2832, x = cx + ro*Math.cos(a), y = cy - ro*Math.sin(a), dark = Math.cos(a) > 0 && Math.abs(ro*Math.sin(a)) < re;
    g.fillStyle = dark ? mute : '#FFD21F'; g.strokeStyle = ink; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 6, 0, 6.2832); g.fill(); g.stroke();
    g.fillStyle = ink; label(g, 'Soleil', 8, cy - 8, true); g.strokeStyle = ink; g.beginPath(); g.moveTo(8, cy); g.lineTo(52, cy); g.stroke(); g.beginPath(); g.moveTo(52, cy); g.lineTo(44, cy-4); g.lineTo(44, cy+4); g.fill();
    g.fillStyle = mute; label(g, 'ombre de la Terre', W - 8, cy - re - 8, false, 'right');
    return dark;
  }

  function drawL2(c, b, i, view){
    var g = prep(c), W = c._w, H = c._h, ink = css('--ink'), mute = css('--mute'), rule = css('--rule-2'), n = b.x.length, j;
    g.clearRect(0, 0, W, H);
    var k, X, Y;
    if (view === 'front'){ k = (W - 40)/2000; X = function(p){ return W/2 + b.y[p]*k; }; Y = function(p){ return H/2 - b.z[p]*k; }; }
    else { k = (W - 60)/2500; X = function(p){ return 60 + (b.x[p] + 450)*k; }; Y = function(p){ return H/2 - b.y[p]*k; }; }
    var ex = view === 'front' ? W/2 : 60 + 450*k, ey = H/2, lx = view === 'front' ? W/2 : 60 + 1950*k;
    g.setLineDash([3, 4]); g.strokeStyle = rule; g.lineWidth = 1; g.beginPath(); g.arc(ex, ey, 384.4*k, 0, 6.2832); g.stroke(); g.setLineDash([]);
    if (view === 'top'){ g.beginPath(); g.moveTo(ex, ey); g.lineTo(lx, ey); g.stroke(); g.fillStyle = '#2C5E9E'; g.beginPath(); g.arc(ex, ey, 6, 0, 6.2832); g.fill(); g.fillStyle = ink; label(g, 'Terre', ex, ey + 22, true, 'center'); label(g, 'Soleil', 4, ey - 8, true); g.strokeStyle = ink; g.beginPath(); g.moveTo(40, ey); g.lineTo(4, ey); g.stroke(); g.beginPath(); g.moveTo(4, ey); g.lineTo(12, ey-4); g.lineTo(12, ey+4); g.fill(); }
    g.fillStyle = mute; label(g, 'orbite de la Lune', ex, ey - 384.4*k - 6, false, 'center');
    g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(lx-5, ey); g.lineTo(lx+5, ey); g.moveTo(lx, ey-5); g.lineTo(lx, ey+5); g.stroke(); g.fillStyle = ink; label(g, 'L2', lx + 8, ey + 16, true);
    g.strokeStyle = rule; g.lineWidth = 0.8; g.beginPath(); for (j=0;j<n;j++){ if (j) g.lineTo(X(j), Y(j)); else g.moveTo(X(j), Y(j)); } g.stroke();
    var tail = Math.round(180/b.step_days); g.strokeStyle = '#DB5A14'; g.lineWidth = 2; g.beginPath(); for (j=Math.max(0, i - tail); j<=i; j++){ if (j === Math.max(0, i - tail)) g.moveTo(X(j), Y(j)); else g.lineTo(X(j), Y(j)); } g.stroke();
    g.fillStyle = '#FFD21F'; g.strokeStyle = ink; g.lineWidth = 1.5; g.beginPath(); g.arc(X(i), Y(i), 6, 0, 6.2832); g.fill(); g.stroke();
    var bar = 500*k; g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(12, H - 12); g.lineTo(12 + bar, H - 12); g.stroke(); g.fillStyle = mute; label(g, '500 000 km', 18 + bar, H - 8);
  }

  /* orbite terrestre très elliptique, vue du nord de l'écliptique ; b en milliers de km, repère géocentrique fixe */
  function drawHeo(c, b, i){
    var g = prep(c), W = c._w, H = c._h, ink = css('--ink'), mute = css('--mute'), rule = css('--rule-2'), n = b.x.length, j;
    g.clearRect(0, 0, W, H);
    var xm = 0, ym = 0; for (j=0;j<n;j++){ xm = Math.max(xm, Math.abs(b.x[j])); ym = Math.max(ym, Math.abs(b.y[j])); }
    var k = Math.min((W/2 - 30)/Math.max(xm, 1), (H/2 - 30)/Math.max(ym, 1)), cx = W/2, cy = H/2;
    function X(p){ return cx + b.x[p]*k; } function Y(p){ return cy - b.y[p]*k; }
    g.fillStyle = css('--rule'); g.globalAlpha = 0.45; g.beginPath(); g.arc(cx, cy, 6.371*4*k, 0, 6.2832); g.fill(); g.globalAlpha = 1;   /* ≈ 4 rayons terrestres : indicatif */
    g.setLineDash([3, 4]); g.strokeStyle = rule; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 384.4*k, 0, 6.2832); g.stroke(); g.setLineDash([]);
    if (384.4*k < Math.hypot(W, H)/2){ g.fillStyle = mute; label(g, 'orbite de la Lune', cx, cy - 384.4*k - 6, false, 'center'); }
    g.fillStyle = '#2C5E9E'; g.beginPath(); g.arc(cx, cy, Math.max(2.5, 6.371*k), 0, 6.2832); g.fill(); g.fillStyle = ink; label(g, 'Terre', cx, cy + 6.371*k + 16, true, 'center');
    g.strokeStyle = rule; g.lineWidth = 0.9; g.beginPath(); for (j=0;j<n;j++){ if (j) g.lineTo(X(j), Y(j)); else g.moveTo(X(j), Y(j)); } g.stroke();
    var tail = Math.round(0.4/b.step_days); g.strokeStyle = '#DB5A14'; g.lineWidth = 2; g.beginPath(); for (j=Math.max(0, i - tail); j<=i; j++){ if (j === Math.max(0, i - tail)) g.moveTo(X(j), Y(j)); else g.lineTo(X(j), Y(j)); } g.stroke();
    g.fillStyle = '#FFD21F'; g.strokeStyle = ink; g.lineWidth = 1.5; g.beginPath(); g.arc(X(i), Y(i), 6, 0, 6.2832); g.fill(); g.stroke();
    var bar = 50*k; g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(12, H - 12); g.lineTo(12 + bar, H - 12); g.stroke(); g.fillStyle = mute; label(g, '50 000 km', 18 + bar, H - 8);
  }

  function hammer(v, W, H){ var l = Math.atan2(v[1], v[0]), bb = Math.asin(Math.max(-1, Math.min(1, v[2]))), d = Math.sqrt(1 + Math.cos(bb)*Math.cos(l/2)); return [W/2 - (W/2 - 8)*Math.cos(bb)*Math.sin(l/2)/d, H/2 - (H/2 - 8)*Math.sin(bb)/d, l]; }
  function scanStep(g, W, H, day){
    var ls = 6.2832*day/365.25, ph = 6.2832*day/63, s = [Math.cos(ls), Math.sin(ls), 0], e1 = [-Math.sin(ls), Math.cos(ls), 0], q = Math.SQRT1_2;
    var ax = [q*s[0] + q*Math.cos(ph)*e1[0], q*s[1] + q*Math.cos(ph)*e1[1], q*Math.sin(ph)];
    var u = [-ax[1], ax[0], 0], un = Math.hypot(u[0], u[1]) || 1; u = [u[0]/un, u[1]/un, 0];
    var v = [ax[1]*u[2] - ax[2]*u[1], ax[2]*u[0] - ax[0]*u[2], ax[0]*u[1] - ax[1]*u[0]], prev = null;
    g.beginPath();
    for (var i=0;i<=90;i++){ var th = i/90*6.2832, c = Math.cos(th), sn = Math.sin(th), p = hammer([c*u[0] + sn*v[0], c*u[1] + sn*v[1], c*u[2] + sn*v[2]], W, H);
      if (prev && Math.abs(p[2] - prev[2]) < 3) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); prev = p; }
    g.stroke();
  }

  /* orbite héliocentrique (Spitzer, Kepler) : repère tournant avec la Terre (Terre sur l'axe x), en UA */
  function drawHelio(c, b, i){
    var g = prep(c), W = c._w, H = c._h, ink = css('--ink'), mute = css('--mute'), rule = css('--rule-2'), n = b.x.length, j;
    g.clearRect(0, 0, W, H);
    var rm = 1.05; for (j=0;j<n;j++) rm = Math.max(rm, Math.hypot(b.x[j], b.y[j]));
    var k = (Math.min(W, H)/2 - 34)/rm, cx = W/2, cy = H/2;
    function X(p){ return cx + b.x[p]*k; } function Y(p){ return cy - b.y[p]*k; }
    g.setLineDash([3, 4]); g.strokeStyle = rule; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, k, 0, 6.2832); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#FFD21F'; g.beginPath(); g.arc(cx, cy, 9, 0, 6.2832); g.fill(); g.fillStyle = ink; label(g, 'Soleil', cx, cy + 24, true, 'center');
    g.fillStyle = '#2C5E9E'; g.beginPath(); g.arc(cx + k, cy, 5, 0, 6.2832); g.fill(); g.fillStyle = ink; label(g, 'Terre', cx + k + 10, cy + 4, true);
    g.strokeStyle = mute; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + k + 12, cy - 14); g.lineTo(cx + k + 12, cy - 44); g.stroke();
    g.fillStyle = mute; g.beginPath(); g.moveTo(cx + k + 12, cy - 50); g.lineTo(cx + k + 8, cy - 42); g.lineTo(cx + k + 16, cy - 42); g.fill(); label(g, 'sens du mouvement', cx + k + 12, cy - 58, false, 'center');
    g.strokeStyle = rule; g.lineWidth = 1; g.beginPath(); for (j=0;j<n;j++){ if (j) g.lineTo(X(j), Y(j)); else g.moveTo(X(j), Y(j)); } g.stroke();
    g.strokeStyle = '#DB5A14'; g.lineWidth = 2; g.beginPath(); for (j=0;j<=i;j++){ if (j) g.lineTo(X(j), Y(j)); else g.moveTo(X(j), Y(j)); } g.stroke();
    g.fillStyle = '#FFD21F'; g.strokeStyle = ink; g.lineWidth = 1.5; g.beginPath(); g.arc(X(i), Y(i), 6, 0, 6.2832); g.fill(); g.stroke();
    var bar = 0.5*k; g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(12, H - 12); g.lineTo(12 + bar, H - 12); g.stroke(); g.fillStyle = mute; label(g, '0,5 UA (75 millions de km)', 18 + bar, H - 8);
  }

  function start(root, tid){
    var my = ++run, playing = true, t0 = performance.now(), sim = 0, last = t0;
    var play = root.querySelector('[data-orb-play]'), read = root.querySelector('[data-orb-read]');
    if (play) play.onclick = function(){ playing = !playing; play.textContent = playing ? 'Pause' : 'Lecture'; };
    var helio = root.querySelector('[data-orb="helio"]'), heo = root.querySelector('[data-orb="heo"]'), leo = root.querySelector('[data-orb="leo"]'), front = root.querySelector('[data-orb="front"]'), top = root.querySelector('[data-orb="top"]'), scan = root.querySelector('[data-orb="scan"]');
    var body = null, sg = null, sday = 0, sink = '';
    if (heo) load().then(function(j){
      if (my !== run) return;
      body = j && j.bodies && j.bodies[tid];
      var st = root.querySelector('[data-orb-stats]');
      if (!body){ st.innerHTML = '<div class="cap">La trajectoire n\'a pas pu être chargée.</div>'; return; }
      var n = body.x.length, dmin = 1e9, dmax = 0, imin = 0, imax = 0;
      for (var i=0;i<n;i++){ var d = Math.hypot(body.x[i], body.y[i], body.z[i]); if (d < dmin){ dmin = d; imin = i; } if (d > dmax){ dmax = d; imax = i; } }
      st.innerHTML = rows([['Période couverte', date(body.jd0)+' au '+date(body.jd0 + (n-1)*body.step_days)], ['Distance au centre de la Terre', 'de '+fr(dmin*1000)+' à '+fr(dmax*1000)+' km'], ['Altitude au plus près', '≈ '+fr(dmin*1000 - 6371)+' km'], ['Source', 'JPL Horizons, objet '+body.horizons_id+', récupéré le '+j.fetched.split('-').reverse().join('/')]]);
    });
    if (helio) load().then(function(j){
      if (my !== run) return;
      body = j && j.bodies && j.bodies[tid];
      var st = root.querySelector('[data-orb-stats]');
      if (!body){ st.innerHTML = '<div class="cap">La trajectoire n\'a pas pu être chargée.</div>'; return; }
      var n = body.x.length, smin = 9, smax = 0;
      for (var i=0;i<n;i++){ var r = Math.hypot(body.x[i], body.y[i], body.z[i]); smin = Math.min(smin, r); smax = Math.max(smax, r); }
      var de = body.d_earth, yrs = (n - 1)*body.step_days/365.25;
      st.innerHTML = rows([['Période couverte', date(body.jd0)+' au '+date(body.jd0 + (n-1)*body.step_days)], ['Distance à la Terre à la fin', OBS_NUM(de[n-1].toFixed(2).replace('.', ','))+' UA · ≈ '+fr(de[n-1]*149.6)+' millions de km'],
                           ['Éloignement moyen', '≈ '+OBS_NUM((de[n-1]/yrs).toFixed(2).replace('.', ','))+' UA par an'], ['Distance au Soleil', 'de '+OBS_NUM(smin.toFixed(3).replace('.', ','))+' à '+OBS_NUM(smax.toFixed(3).replace('.', ','))+' UA'],
                           ['Source', 'JPL Horizons, objet '+body.horizons_id+', récupéré le '+date(2440587.5 + Date.parse(j.fetched)/86400000)]]);
    });
    if (front) load().then(function(j){
      if (my !== run) return;
      body = j && j.bodies && j.bodies[tid];
      var st = root.querySelector('[data-orb-stats]');
      if (!body && TEXT[tid].noTraj){
        var secs = [front, top, st].map(function(e){ return e && e.closest('.isec'); });
        secs[0].innerHTML = '<h4>'+OBS_T('Trajectoire')+'</h4><p class="cap">'+TEXT[tid].noTraj+'</p>'; secs[1].remove(); secs[2].remove(); front = top = null; return;
      }
      if (!body){ st.innerHTML = '<div class="cap">La trajectoire n\'a pas pu être chargée.</div>'; return; }
      var n = body.x.length, dmin = 1e9, dmax = 0, ymax = 0, zmax = 0, xmin = 1e9, xmax = -1e9;
      for (var i=0;i<n;i++){ var d = Math.hypot(body.x[i], body.y[i], body.z[i]); dmin = Math.min(dmin, d); dmax = Math.max(dmax, d); ymax = Math.max(ymax, Math.abs(body.y[i])); zmax = Math.max(zmax, Math.abs(body.z[i])); xmin = Math.min(xmin, body.x[i]); xmax = Math.max(xmax, body.x[i]); }
      st.innerHTML = rows([['Période couverte', date(body.jd0)+' au '+date(body.jd0 + (n-1)*body.step_days)], ['Distance à la Terre', 'de '+fr(dmin*1000)+' à '+fr(dmax*1000)+' km'], ['Écart latéral maximal', '± '+fr(ymax*1000)+' km'], ['Écart maximal hors de l\'écliptique', '± '+fr(zmax*1000)+' km'], ['Le long de l\'axe Terre–L2', 'de '+fr(xmin*1000)+' à '+fr(xmax*1000)+' km'], ['Source', 'JPL Horizons, objet '+body.horizons_id+', récupéré le '+j.fetched.split('-').reverse().join('/')]]);
    });
    var sky = root.querySelector('[data-orb="sky"]'), skyD = null, skyYears = [], skyI = 0, skyT = 0, skyN = 0, skyInk = '';
    /* pointés : quadruplets (case i, case j, nombre, instrument) par année ; filtre par instrument (lot F, cartes de pointés) */
    var SKYPAL = ['#2F6FDB', '#DB5A14', '#1A9E77', '#9A4FD1', '#B8860B', '#D6457A'], skySel = -1, skyQ = {}, skyNames = [];
    if (sky) loadSky().then(function(j){
      if (my !== run) return; skyD = j && j.bodies && j.bodies[tid]; var el = root.querySelector('[data-orb-sky]');
      if (!skyD){ if (el) el.textContent = OBS_T('Les pointés n\'ont pas pu être chargés.'); return; }
      if (skyD.inst){
        skyNames = Object.keys(skyD.inst).sort(function(a, b){ return (skyD.totals[b] || 0) - (skyD.totals[a] || 0); });
        skyNames.forEach(function(nm, k){ var d = skyD.inst[nm]; for (var y in d){ var a = d[y], q = skyQ[y] || (skyQ[y] = []); for (var i=0;i<a.length;i+=3) q.push(a[i], a[i+1], a[i+2], k); } });
        var box = root.querySelector('[data-sky-ins]');
        if (box){
          var top = skyNames.slice(0, 6);
          box.innerHTML = '<button class="chip on" data-sky-k="-1">' + OBS_T('Tous') + '</button>' + top.map(function(nm, k){ return '<button class="chip" data-sky-k="' + k + '"><i style="background:' + SKYPAL[k] + '"></i>' + esc(({ NIRSPEC:'NIRSpec', NIRCAM:'NIRCam' })[nm] || nm) + '</button>'; }).join('') + (skyNames.length > 6 ? '<span class="sky-more">' + OBS_T('+ autres instruments, en gris') + '</span>' : '');
          box.addEventListener('click', function(e){ var b = e.target.closest('[data-sky-k]'); if (!b) return; skySel = +b.getAttribute('data-sky-k'); [].forEach.call(box.querySelectorAll('.chip'), function(c){ c.classList.toggle('on', c === b); }); skyI = skyYears.length + 8; });
        }
      } else {
        for (var y in skyD.years){ var a2 = skyD.years[y], q2 = skyQ[y] = []; for (var i2=0;i2<a2.length;i2+=3) q2.push(a2[i2], a2[i2+1], a2[i2+2], -1); }
      }
      skyYears = Object.keys(skyQ).sort().filter(function(y){ return tid !== 'hubble' || y >= '1990'; });
    });
    /* repères : écliptique et plan de la Galaxie, en coordonnées équatoriales (centre de la carte : ascension droite 12 h) */
    function skyRefs(g, W, H){
      var e = 23.4393*Math.PI/180, R = [[-0.0548755604, -0.8734370902, -0.4838350155], [0.4941094279, -0.4448296300, 0.7469822445]];
      function curve(fn, dash, lab){
        var prev = null, best = null; g.setLineDash(dash); g.strokeStyle = css('--mute'); g.lineWidth = 1; g.beginPath();
        for (var i=0;i<=180;i++){ var v = fn(i/180*6.2832), p = hammer([-v[0], -v[1], v[2]], W, H); if (prev && Math.abs(p[2] - prev[2]) < 3) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); prev = p; if (!best || p[1] < best[1]) best = p; }
        g.stroke(); g.setLineDash([]); g.fillStyle = css('--mute'); label(g, lab, Math.max(60, Math.min(W - 60, best[0])), Math.max(22, best[1] - 5), false, 'center');
      }
      curve(function(l){ return [Math.cos(l), Math.sin(l)*Math.cos(e), Math.sin(l)*Math.sin(e)]; }, [2, 4], 'écliptique');
      curve(function(l){ var c = Math.cos(l), s = Math.sin(l); return [R[0][0]*c + R[1][0]*s, R[0][1]*c + R[1][1]*s, R[0][2]*c + R[1][2]*s]; }, [7, 4], 'plan de la Galaxie');
    }
    var track = root.querySelector('[data-orb="track"]');
    if (track) Promise.all([loadSat(), loadJSON('data/land-110m.json'), loadJSON('data/' + tid + '-tle.json')]).then(function(r){
      var rd = root.querySelector('[data-track-read]'), stats = root.querySelector('[data-track-stats]');
      if (!r[0] || !r[1] || !r[2]){ rd.textContent = OBS_T('Éléments orbitaux indisponibles pour le moment.'); return; }
      var tle = r[2], st = { rec:r[0].twoline2satrec(tle.line1, tle.line2) }, age = (Date.now() - Date.parse(tle.epoch))/86400000, fmt = function(x, d){ return x.toFixed(d).replace('.', OBS_LANG === 'en' ? '.' : ','); };
      (function tick(){
        if (my !== run || !track.isConnected) return;
        var p = drawTrack(track, st, r[1]);
        if (p){
          var v = Math.hypot(p.v.x, p.v.y, p.v.z);
          rd.textContent = new Date().toLocaleTimeString(OBS_LANG === 'en' ? 'en-GB' : 'fr-FR') + ' · ' + OBS_T(p.night ? 'au-dessus de la face nocturne' : 'au-dessus de la face éclairée');
          stats.innerHTML = rows([['Latitude', fmt(Math.abs(p.lat), 1) + '° ' + (p.lat >= 0 ? 'N' : 'S')], ['Longitude', fmt(Math.abs(p.lon), 1) + '° ' + (p.lon >= 0 ? 'E' : (OBS_LANG === 'en' ? 'W' : 'O'))], ['Altitude', fr(p.h) + ' km'], ['Vitesse', fmt(v, 2) + ' km/s'],
            ['Éléments orbitaux', OBS_LANG === 'en' ? 'epoch ' + tle.epoch.slice(0, 10) + ' (' + (age < 1 ? 'less than a day old' : Math.floor(age) + ' d old') + '), CelesTrak' : 'époque ' + tle.epoch.slice(0, 10).split('-').reverse().join('/') + ' (' + (age < 1 ? 'moins d\'un jour' : 'il y a ' + Math.floor(age) + ' j') + '), CelesTrak']]);
        }
        setTimeout(tick, 1000);
      })();
    }).catch(function(){ var rd = root.querySelector('[data-track-read]'); if (rd) rd.textContent = OBS_T('Éléments orbitaux indisponibles pour le moment.'); });
    var vis = root.querySelector('[data-orb="vis"]'), vday = root.querySelector('[data-vis-day]');
    if (vis){
      var today = Date.now()/86400000 + 2440587.5;
      var visDraw = function(){
        var jd = today + (+vday.value), frac = drawVis(vis, tid, jd, skyRefs), d = new Date((jd - 2440587.5)*86400000);
        root.querySelector('[data-vis-date]').textContent = d.toLocaleDateString(OBS_LANG === 'en' ? 'en-GB' : 'fr-FR', { day:'numeric', month:'long', year:'numeric' });
        root.querySelector('[data-vis-read]').textContent = OBS_T(tid === 'gaia' ? 'bande balayée :' : 'accessible :') + ' ' + Math.round(frac*100) + ' % ' + OBS_T('du ciel');
      };
      vday.addEventListener('input', visDraw); visDraw();
      new MutationObserver(function(){ if (vis.isConnected) visDraw(); }).observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
      if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){ if (vis.isConnected) visDraw(); });
    }
    function skyFrame(dt){
      var g = prep(sky), W = sky._w, H = sky._h, ink = css('--ink');
      if (skyInk !== ink || skyI >= skyYears.length + 8){ skyInk = ink; skyI = 0; skyT = 0; skyN = 0; g.clearRect(0, 0, W, H); g.strokeStyle = css('--rule-2'); g.lineWidth = 1; g.beginPath(); g.ellipse(W/2, H/2, W/2 - 8, H/2 - 8, 0, 0, 6.2832); g.moveTo(8, H/2); g.lineTo(W - 8, H/2); g.stroke(); skyRefs(g, W, H); }
      if (!playing) return;
      skyT += dt;
      if (skyT > 0.55 && skyI < skyYears.length){
        var a = skyQ[skyYears[skyI]], c = skyD.cell, D2R = Math.PI/180, grey = css('--mute');
        for (var q=0;q<a.length;q+=4){
          var k = a[q+3]; if (skySel >= 0 && k !== skySel) continue;
          var ra = (a[q] + 0.5)*c*D2R, de = ((a[q+1] + 0.5)*c - 90)*D2R, p = hammer([Math.cos(de)*Math.cos(ra - Math.PI), Math.cos(de)*Math.sin(ra - Math.PI), Math.sin(de)], W, H);
          g.fillStyle = k < 0 ? '#DB5A14' : k < 6 ? SKYPAL[k] : grey; g.globalAlpha = Math.min(0.9, 0.35 + 0.12*Math.log(a[q+2] + 1)); g.fillRect(p[0] - 1, p[1] - 1, 2, 2); skyN += a[q+2];
        }
        g.globalAlpha = 1; var el = root.querySelector('[data-orb-sky]'); if (el) el.textContent = (skyYears[skyI].length > 4 ? skyYears[skyI].split('-').reverse().join('/') : skyYears[skyI]) + ' : ' + fr(skyN) + ' observations depuis ' + (skyYears[0].length > 4 ? skyYears[0].split('-').reverse().join('/') : skyYears[0]);
        skyI++; skyT = 0;
      } else if (skyT > 0.55){ skyI++; skyT = 0; }
    }
    function frame(now){
      var main = leo || front || heo || helio; if (my !== run || !root.isConnected || !main || !main.isConnected) return;
      if (sky && skyD) skyFrame(Math.min(0.1, (now - last)/1000));
      requestAnimationFrame(frame);
      var dt = Math.min(0.1, (now - last)/1000); last = now; if (playing) sim += dt;
      if (leo){ var LP = TEXT[tid].leo, tm = sim*9.5 % LP.per, dark = drawLeo(leo, tm, LP); if (read) read.textContent = 'minute ' + Math.floor(tm) + ' sur ' + Math.round(LP.per) + ', ' + (dark ? 'dans l\'ombre' : 'au soleil'); }
      if (body && helio){ var nq = body.x.length, iq = Math.floor(sim*6) % nq; drawHelio(helio, body, iq); if (read) read.textContent = date(body.jd0 + iq*body.step_days) + ' · ' + OBS_NUM(body.d_earth[iq].toFixed(2).replace('.', ',')) + ' ' + OBS_T('UA de la Terre'); }
      else if (body && heo){ var nh = body.x.length, ih = Math.floor(sim*1.2/body.step_days) % nh; drawHeo(heo, body, ih); if (read){ var jdh = body.jd0 + ih*body.step_days, dh = new Date((jdh - 2440587.5)*86400000); read.textContent = date(jdh) + ' ' + ('0'+dh.getUTCHours()).slice(-2) + ':' + ('0'+dh.getUTCMinutes()).slice(-2) + ' UTC · ' + fr(Math.hypot(body.x[ih], body.y[ih], body.z[ih])*1000) + ' km'; } }
      else if (body){ var n = body.x.length, i = Math.floor(sim*36/body.step_days) % n; drawL2(front, body, i, 'front'); drawL2(top, body, i, 'top'); if (read) read.textContent = date(body.jd0 + i*body.step_days); }
      if (scan){
        var g = prep(scan), W = scan._w, H = scan._h, ink = css('--ink');
        if (!sg || sink !== ink || sday > 5*365){ sg = true; sink = ink; sday = 0; g.clearRect(0, 0, W, H); g.strokeStyle = css('--rule-2'); g.lineWidth = 1; g.beginPath(); g.ellipse(W/2, H/2, W/2 - 8, H/2 - 8, 0, 0, 6.2832); g.moveTo(8, H/2); g.lineTo(W - 8, H/2); g.stroke(); }
        if (playing){ g.strokeStyle = ink; g.globalAlpha = 0.035; g.lineWidth = 1; for (var q=0;q<6;q++){ scanStep(g, W, H, sday); sday += 0.25; } g.globalAlpha = 1; }
        var sr = root.querySelector('[data-orb-scan]'); if (sr) sr.textContent = 'jour ' + Math.floor(sday) + ' (' + (sday/365.25).toFixed(1).replace('.', ',') + ' an)';
      }
    }
    requestAnimationFrame(frame);
  }
  /* ---------- comparaison des trois orbites autour de L2 ---------- */
  /* observatoires autour de L2 : registre de data-tele.js */
  var L2IDS = TELESCOPES.filter(function(t){ return t.orbit === 'l2'; }).map(function(t){ return t.id; });
  function renderCompare(OBS, NAMES){
    var key = '<ul class="orb-key">' + L2IDS.map(function(t){ return '<li><i style="background:'+OBS[t]+'"></i>'+NAMES[t]+'</li>'; }).join('') + '</ul>';
    return '<div class="isec"><h4>Orbites autour de L2, à la même échelle</h4>' + key + '<div class="cmp-figs"><div><h5>Vu depuis la Terre</h5>'+cv('cfront', 560, 430, 'Les trois orbites vues depuis la Terre')+'</div><div><h5>Vu de dessus</h5>'+cv('ctop', 560, 400, 'Les trois orbites vues de dessus')+'</div></div>' +
      '<div class="orb-ctl"><button class="chip" data-orb-play>Pause</button><span class="orb-read" data-orb-read>Chargement des trajectoires…</span></div>' +
      '<div class="cap">Trajectoires réelles (JPL Horizons) dans le repère qui tourne avec la Terre autour du Soleil ; le cercle en pointillé est l\'orbite de la Lune. Chaque observatoire apparaît à sa date d\'arrivée ; Gaia a quitté L2 en mars 2025. Hubble n\'y figure pas : à cette échelle, son orbite à 480 km d\'altitude se confond avec le point qui représente la Terre.</div>' +
      '<div data-orb-cmpstats></div></div>';
  }
  function startCompare(root, OBS, NAMES){
    var my = ++run, playing = true, last = performance.now(), jd = 0, cf = root.querySelector('[data-orb="cfront"]'), ct = root.querySelector('[data-orb="ctop"]'), read = root.querySelector('[data-orb-read]'), play = root.querySelector('[data-orb-play]');
    if (!cf) return;
    if (play) play.onclick = function(){ playing = !playing; play.textContent = playing ? 'Pause' : 'Lecture'; };
    load().then(function(j){
      if (my !== run) return;
      if (!j || !j.bodies){ read.textContent = 'Les trajectoires n\'ont pas pu être chargées.'; return; }
      var ids = L2IDS.filter(function(t){ return j.bodies[t]; }), jd0 = 1e9, jd1 = 0, st = [];
      ids.forEach(function(t){ var b = j.bodies[t], n = b.x.length, e = b.jd0 + (n-1)*b.step_days, ym = 0, zm = 0; jd0 = Math.min(jd0, b.jd0); jd1 = Math.max(jd1, e); for (var i=0;i<n;i++){ ym = Math.max(ym, Math.abs(b.y[i])); zm = Math.max(zm, Math.abs(b.z[i])); } st.push([NAMES[t], date(b.jd0)+' au '+date(e)+'<br>écart latéral ± '+fr(ym*1000)+' km · hors écliptique ± '+fr(zm*1000)+' km']); });
      root.querySelector('[data-orb-cmpstats]').innerHTML = rows(st.map(function(r){ return [r[0], r[1].split(' · ').join('<br>')]; }));
      jd = j.bodies.jwst ? j.bodies.jwst.jd0 - 300 : jd0;  /* on commence peu avant l'arrivée de Webb, quand Gaia est seul à L2 */
      function view(c, front){
        var g = prep(c), W = c._w, H = c._h, ink = css('--ink'), mute = css('--mute'), rule = css('--rule-2'), k = front ? (W - 40)/2000 : (W - 60)/2500;
        var ex = front ? W/2 : 60 + 450*k, ey = H/2, lx = front ? W/2 : 60 + 1950*k;
        g.clearRect(0, 0, W, H); g.setLineDash([3, 4]); g.strokeStyle = rule; g.lineWidth = 1; g.beginPath(); g.arc(ex, ey, 384.4*k, 0, 6.2832); g.stroke(); g.setLineDash([]);
        if (!front){ g.beginPath(); g.moveTo(ex, ey); g.lineTo(lx, ey); g.stroke(); g.fillStyle = '#2C5E9E'; g.beginPath(); g.arc(ex, ey, 6, 0, 6.2832); g.fill(); g.fillStyle = ink; label(g, 'Terre', ex, ey + 22, true, 'center'); }
        g.strokeStyle = ink; g.beginPath(); g.moveTo(lx-5, ey); g.lineTo(lx+5, ey); g.moveTo(lx, ey-5); g.lineTo(lx, ey+5); g.stroke(); g.fillStyle = ink; label(g, 'L2', lx + 8, ey + 16, true);
        ids.forEach(function(t){
          var b = j.bodies[t], n = b.x.length, i = Math.floor((jd - b.jd0)/b.step_days); if (i < 0) return; var gone = i >= n; i = Math.min(i, n-1);
          function X(p){ return front ? W/2 + b.y[p]*k : 60 + (b.x[p] + 450)*k; } function Y(p){ return H/2 - (front ? b.z[p] : b.y[p])*k; }
          g.strokeStyle = OBS[t]; g.globalAlpha = 0.28; g.lineWidth = 1; g.beginPath(); for (var p=0;p<=i;p++){ if (p) g.lineTo(X(p), Y(p)); else g.moveTo(X(p), Y(p)); } g.stroke();
          g.globalAlpha = 1; var tail = Math.round(180/b.step_days); g.lineWidth = 2; g.beginPath(); for (p=Math.max(0, i - tail); p<=i; p++){ if (p === Math.max(0, i - tail)) g.moveTo(X(p), Y(p)); else g.lineTo(X(p), Y(p)); } if (!gone) g.stroke();
          if (!gone){ g.fillStyle = OBS[t]; g.strokeStyle = ink; g.lineWidth = 1.5; g.beginPath(); g.arc(X(i), Y(i), 5.5, 0, 6.2832); g.fill(); g.stroke(); }
        });
        var bar = 500*k; g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(12, H - 12); g.lineTo(12 + bar, H - 12); g.stroke(); g.fillStyle = mute; label(g, '500 000 km', 18 + bar, H - 8);
      }
      (function frame(now){
        if (my !== run || !cf.isConnected) return; requestAnimationFrame(frame);
        var dt = Math.min(0.1, ((now || last) - last)/1000); last = now || last; if (playing){ jd += dt*70; if (jd > jd1 + 60) jd = jd0; }
        view(cf, true); view(ct, false); read.textContent = date(Math.min(jd, jd1));
      })();
    });
  }
  return { render:render, start:start, renderCompare:renderCompare, startCompare:startCompare, TEXT:TEXT };
})();
