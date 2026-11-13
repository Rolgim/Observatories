/* =================================================================
   ORBITES ET TEMPS (lot F des specs)
   - observatoires à L2 : trajectoires réelles (data/orbits.json, JPL Horizons), repère tournant Soleil–Terre
   - Hubble : orbite basse dessinée à l'échelle, mouvement calculé (période et ombre de la Terre)
   - Gaia : loi de balayage nominale simulée (rotation 6 h, précession 63 jours, axe à 45° du Soleil)
================================================================= */
var Orbits = (function(){
  var DATA, loading, run = 0, SKY, skyLoading;
  function loadSky(){ return skyLoading || (skyLoading = fetch('data/sky.json').then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }).then(function(j){ SKY = j; return j; })); }
  function load(){ return loading || (loading = fetch('data/orbits.json').then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }).then(function(j){ DATA = j; return j; })); }
  function css(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function fr(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function rows(a){ return '<div class="stable">' + a.map(function(r){ return '<div class="srow"><div class="k">'+r[0]+'</div><div class="v">'+r[1]+'</div></div>'; }).join('') + '</div>'; }
  function cv(id, w, h, label){ return '<canvas class="orb" data-orb="'+id+'" width="'+w+'" height="'+h+'" role="img" aria-label="'+label+'"></canvas>'; }
  function date(jd){ var d = new Date((jd - 2440587.5)*86400000); return ('0'+d.getUTCDate()).slice(-2)+'/'+('0'+(d.getUTCMonth()+1)).slice(-2)+'/'+d.getUTCFullYear(); }

  var TEXT = {
    hubble:{ sum:'Hubble tourne à environ 530 km au-dessus du sol, en 95 minutes. La Terre occupe presque la moitié de son ciel, et lui cache le Soleil à chaque tour.',
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
    gaia:{ sum:'De 2014 à 2025, Gaia a décrit une courbe de Lissajous autour de L2 : une boucle qui ne se referme pas, choisie pour ne pas traverser l\'ombre de la Terre pendant des années.',
      notes:['Les observations se sont arrêtées le 15 janvier 2025. Le satellite a ensuite été écarté de L2 et mis hors service le 27 mars 2025.',
             'La trajectoire tracée ici s\'arrête à ce départ.',
             'La position de Gaia devait être connue à 150 m près : des télescopes au sol le photographiaient chaque nuit parmi les étoiles.'] }
  };

  function render(tid, name){
    var t = TEXT[tid], s = '<div class="inst-head"><div class="inst-h"><div class="inst-name">Orbite</div><div class="inst-full">'+name+' : où il se trouve et comment il se déplace</div></div><p class="inst-sum">'+t.sum+'</p></div><div class="inst-cols">';
    var ctl = '<div class="orb-ctl"><button class="chip" data-orb-play>Pause</button><span class="orb-read" data-orb-read></span></div>';
    if (tid === 'hubble'){
      s += '<div class="isec"><h4>Une orbite, vue de dessus</h4>'+cv('leo', 560, 380, 'Orbite de Hubble autour de la Terre, à l\'échelle')+ctl+'<div class="cap">Terre et orbite à l\'échelle. Le mouvement est calculé à partir de la période ; la durée de l\'ombre est celle du cas où le Soleil est dans le plan de l\'orbite, le plus défavorable.</div></div>';
      s += '<div class="isec"><h4>Paramètres</h4>'+rows([['Altitude','≈ 530 km, en lente décroissance'],['Période','≈ 95 min'],['Vitesse','≈ 7,6 km/s'],['Inclinaison','28,5°'],['Tours par jour','≈ 15'],['Dans l\'ombre de la Terre','au plus ≈ 36 min par tour']])+'</div>';
    } else {
      s += '<div class="isec"><h4>Vu depuis la Terre</h4>'+cv('front', 560, 430, 'Trajectoire autour de L2 vue depuis la Terre')+ctl+'<div class="cap">On regarde vers L2, dos au Soleil. Le cercle en pointillé donne, à la même échelle, la taille de l\'orbite de la Lune. Trajectoire réelle (éphémérides JPL Horizons).</div></div>';
      s += '<div class="isec"><h4>Vu de dessus</h4>'+cv('top', 560, 400, 'Trajectoire autour de L2 vue du nord de l\'écliptique')+'<div class="cap">Le Soleil est à gauche, hors du cadre, à 150 millions de km. Le repère tourne avec la Terre autour du Soleil : la Terre et L2 y restent fixes.</div></div>';
      s += '<div class="isec"><h4>Mesuré sur la trajectoire</h4><div data-orb-stats><div class="cap">Chargement de la trajectoire…</div></div></div>';
      if (tid === 'gaia') s += '<div class="isec"><h4>La loi de balayage</h4>'+cv('scan', 560, 300, 'Couverture du ciel par la loi de balayage de Gaia')+'<div class="orb-ctl"><span class="orb-read" data-orb-scan></span></div><div class="cap">Carte du ciel entier en coordonnées écliptiques. Chaque trait est le grand cercle balayé pendant un tour de 6 heures ; l\'axe de rotation, incliné à 45° du Soleil, tourne autour de lui en 63 jours. Simulation de la loi nominale, pas l\'historique réel des observations.</div></div>';
    }
    if (tid === 'euclid') s += '<div class="isec"><h4>L\'avancée du relevé, mois après mois</h4>'+cv('sky', 560, 300, 'Carte du ciel des observations d\'Euclid')+'<div class="orb-ctl"><span class="orb-read" data-orb-sky>Chargement des observations…</span></div><div class="cap">Carte du ciel entier en coordonnées équatoriales. Chaque point est une case de 0,5° où Euclid a commencé au moins une observation ce mois-là ; les mois s\'accumulent. Ce sont les observations VIS réellement publiées dans DR1. Un télescope de relevé ne choisit pas des cibles : il pave le ciel par plaques contiguës, en restant à peu près perpendiculaire à la direction du Soleil.</div></div>';
    if (tid === 'hubble' || tid === 'jwst') s += '<div class="isec"><h4>Où il a pointé, année après année</h4>'+cv('sky', 560, 300, 'Carte du ciel des pointés réels')+'<div class="orb-ctl"><span class="orb-read" data-orb-sky>Chargement des pointés…</span></div><div class="cap">Carte du ciel entier en coordonnées équatoriales. Chaque point est une case de '+(tid === 'jwst' ? '0,5' : '1')+'° où au moins une observation scientifique a commencé cette année-là ; les années s\'accumulent. Données réelles de l\'archive MAST. Contrairement à un télescope de relevé, '+name+' va de cible en cible au gré des programmes acceptés.</div></div>';
    s += '<div class="isec"><h4>Ce que cela change</h4><ul class="notes">'+t.notes.map(function(n){ return '<li>'+n+'</li>'; }).join('')+'</ul></div></div>';
    return s;
  }

  function prep(c){ var d = Math.min(window.devicePixelRatio || 1, 2), w = +c.getAttribute('width'), h = +c.getAttribute('height'); if (!c._w){ c._w = w; c._h = h; c.width = w*d; c.height = h*d; } var g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return g; }
  function label(g, s, x, y, bold, align){ g.font = (bold ? '700 ' : '') + '12px Archivo, Arial, sans-serif'; g.textAlign = align || 'left'; g.fillText(s, x, y); }

  function drawLeo(c, tmin){
    var g = prep(c), W = c._w, H = c._h, cx = W/2 - 10, cy = H/2, k = 150/6901, re = 6371*k, ro = 6901*k;
    var ink = css('--ink'), mute = css('--mute');
    g.clearRect(0, 0, W, H);
    g.fillStyle = css('--rule'); g.globalAlpha = 0.55; g.fillRect(cx, cy - re, W - cx, 2*re); g.globalAlpha = 1;
    g.fillStyle = '#2C5E9E'; g.beginPath(); g.arc(cx, cy, re, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.arc(cx, cy, re, -Math.PI/2, Math.PI/2); g.fill();
    g.strokeStyle = ink; g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, ro, 0, 6.2832); g.stroke();
    var a = Math.PI + tmin/95*6.2832, x = cx + ro*Math.cos(a), y = cy - ro*Math.sin(a), dark = Math.cos(a) > 0 && Math.abs(ro*Math.sin(a)) < re;
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

  function start(root, tid){
    var my = ++run, playing = true, t0 = performance.now(), sim = 0, last = t0;
    var play = root.querySelector('[data-orb-play]'), read = root.querySelector('[data-orb-read]');
    if (play) play.onclick = function(){ playing = !playing; play.textContent = playing ? 'Pause' : 'Lecture'; };
    var leo = root.querySelector('[data-orb="leo"]'), front = root.querySelector('[data-orb="front"]'), top = root.querySelector('[data-orb="top"]'), scan = root.querySelector('[data-orb="scan"]');
    var body = null, sg = null, sday = 0, sink = '';
    if (front) load().then(function(j){
      if (my !== run) return;
      body = j && j.bodies && j.bodies[tid];
      var st = root.querySelector('[data-orb-stats]');
      if (!body){ st.innerHTML = '<div class="cap">La trajectoire n\'a pas pu être chargée.</div>'; return; }
      var n = body.x.length, dmin = 1e9, dmax = 0, ymax = 0, zmax = 0, xmin = 1e9, xmax = -1e9;
      for (var i=0;i<n;i++){ var d = Math.hypot(body.x[i], body.y[i], body.z[i]); dmin = Math.min(dmin, d); dmax = Math.max(dmax, d); ymax = Math.max(ymax, Math.abs(body.y[i])); zmax = Math.max(zmax, Math.abs(body.z[i])); xmin = Math.min(xmin, body.x[i]); xmax = Math.max(xmax, body.x[i]); }
      st.innerHTML = rows([['Période couverte', date(body.jd0)+' au '+date(body.jd0 + (n-1)*body.step_days)], ['Distance à la Terre', 'de '+fr(dmin*1000)+' à '+fr(dmax*1000)+' km'], ['Écart latéral maximal', '± '+fr(ymax*1000)+' km'], ['Écart maximal hors de l\'écliptique', '± '+fr(zmax*1000)+' km'], ['Le long de l\'axe Terre–L2', 'de '+fr(xmin*1000)+' à '+fr(xmax*1000)+' km'], ['Source', 'JPL Horizons, objet '+body.horizons_id+', récupéré le '+j.fetched.split('-').reverse().join('/')]]);
    });
    var sky = root.querySelector('[data-orb="sky"]'), skyD = null, skyYears = [], skyI = 0, skyT = 0, skyN = 0, skyInk = '';
    if (sky) loadSky().then(function(j){ if (my !== run) return; skyD = j && j.bodies && j.bodies[tid]; var el = root.querySelector('[data-orb-sky]'); if (!skyD){ if (el) el.textContent = 'Les pointés n\'ont pas pu être chargés.'; return; } skyYears = Object.keys(skyD.years).sort().filter(function(y){ return tid !== 'hubble' || y >= '1990'; }); });
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
    function skyFrame(dt){
      var g = prep(sky), W = sky._w, H = sky._h, ink = css('--ink');
      if (skyInk !== ink || skyI >= skyYears.length + 3){ skyInk = ink; skyI = 0; skyT = 0; skyN = 0; g.clearRect(0, 0, W, H); g.strokeStyle = css('--rule-2'); g.lineWidth = 1; g.beginPath(); g.ellipse(W/2, H/2, W/2 - 8, H/2 - 8, 0, 0, 6.2832); g.moveTo(8, H/2); g.lineTo(W - 8, H/2); g.stroke(); skyRefs(g, W, H); }
      if (!playing) return;
      skyT += dt;
      if (skyT > 0.55 && skyI < skyYears.length){
        var a = skyD.years[skyYears[skyI]], c = skyD.cell, D2R = Math.PI/180; g.fillStyle = '#DB5A14';
        for (var q=0;q<a.length;q+=3){ var ra = (a[q] + 0.5)*c*D2R, de = ((a[q+1] + 0.5)*c - 90)*D2R, p = hammer([Math.cos(de)*Math.cos(ra - Math.PI), Math.cos(de)*Math.sin(ra - Math.PI), Math.sin(de)], W, H); g.globalAlpha = Math.min(0.9, 0.35 + 0.12*Math.log(a[q+2] + 1)); g.fillRect(p[0] - 1, p[1] - 1, 2, 2); skyN += a[q+2]; }
        g.globalAlpha = 1; var el = root.querySelector('[data-orb-sky]'); if (el) el.textContent = (skyYears[skyI].length > 4 ? skyYears[skyI].split('-').reverse().join('/') : skyYears[skyI]) + ' : ' + fr(skyN) + ' observations depuis ' + (skyYears[0].length > 4 ? skyYears[0].split('-').reverse().join('/') : skyYears[0]);
        skyI++; skyT = 0;
      } else if (skyT > 0.55){ skyI++; skyT = 0; }
    }
    function frame(now){
      if (my !== run || !root.isConnected || !(leo || front) || !(leo || front).isConnected) return;
      if (sky && skyD) skyFrame(Math.min(0.1, (now - last)/1000));
      requestAnimationFrame(frame);
      var dt = Math.min(0.1, (now - last)/1000); last = now; if (playing) sim += dt;
      if (leo){ var tm = sim*9.5 % 95, dark = drawLeo(leo, tm); if (read) read.textContent = 'minute ' + Math.floor(tm) + ' sur 95, ' + (dark ? 'dans l\'ombre' : 'au soleil'); }
      if (body){ var n = body.x.length, i = Math.floor(sim*36/body.step_days) % n; drawL2(front, body, i, 'front'); drawL2(top, body, i, 'top'); if (read) read.textContent = date(body.jd0 + i*body.step_days); }
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
  function renderCompare(OBS, NAMES){
    var key = '<ul class="orb-key">' + ['jwst','euclid','gaia'].map(function(t){ return '<li><i style="background:'+OBS[t]+'"></i>'+NAMES[t]+'</li>'; }).join('') + '</ul>';
    return '<div class="isec"><h4>Orbites autour de L2, à la même échelle</h4>' + key + '<div class="cmp-figs"><div><h5>Vu depuis la Terre</h5>'+cv('cfront', 560, 430, 'Les trois orbites vues depuis la Terre')+'</div><div><h5>Vu de dessus</h5>'+cv('ctop', 560, 400, 'Les trois orbites vues de dessus')+'</div></div>' +
      '<div class="orb-ctl"><button class="chip" data-orb-play>Pause</button><span class="orb-read" data-orb-read>Chargement des trajectoires…</span></div>' +
      '<div class="cap">Trajectoires réelles (JPL Horizons) dans le repère qui tourne avec la Terre autour du Soleil ; le cercle en pointillé est l\'orbite de la Lune. Chaque observatoire apparaît à sa date d\'arrivée ; Gaia a quitté L2 en mars 2025. Hubble n\'y figure pas : à cette échelle, son orbite à 530 km d\'altitude se confond avec le point qui représente la Terre.</div>' +
      '<div data-orb-cmpstats></div></div>';
  }
  function startCompare(root, OBS, NAMES){
    var my = ++run, playing = true, last = performance.now(), jd = 0, cf = root.querySelector('[data-orb="cfront"]'), ct = root.querySelector('[data-orb="ctop"]'), read = root.querySelector('[data-orb-read]'), play = root.querySelector('[data-orb-play]');
    if (!cf) return;
    if (play) play.onclick = function(){ playing = !playing; play.textContent = playing ? 'Pause' : 'Lecture'; };
    load().then(function(j){
      if (my !== run) return;
      if (!j || !j.bodies){ read.textContent = 'Les trajectoires n\'ont pas pu être chargées.'; return; }
      var ids = ['jwst','euclid','gaia'].filter(function(t){ return j.bodies[t]; }), jd0 = 1e9, jd1 = 0, st = [];
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
  return { render:render, start:start, renderCompare:renderCompare, startCompare:startCompare };
})();
