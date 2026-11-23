/* =================================================================
   ACCUEIL (#accueil, page de départ) : le ciel entier et les observations de tous les télescopes.
   Données : data/sky-all.json (tools/data/fetch_sky.py puis sky_all.py) : pour chaque observatoire et chaque instrument,
   les cases de 1° (grille équatoriale) où au moins une observation a commencé, avec l'année de la première et leur nombre.
   Projection de Mollweide en coordonnées galactiques, centre de la Galaxie au milieu, longitudes croissantes vers la gauche.
   Les relevés du ciel entier forment une liste à part, pour ne pas noyer les observatoires qui pointent.
================================================================= */
var HomeUI = (function(){
  var T = function(s){ return (window.OBS_T || function(x){ return x; })(s); };
  function en(){ return window.OBS_LANG === 'en'; }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fr(n){ return en() ? n.toLocaleString('en-US') : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function tele(id){ return TELESCOPES.filter(function(t){ return t.id === id; })[0]; }

  /* relevés du ciel entier, ou missions sans carte de pointés : texte repris de la fiche (sources sur la fiche) */
  var SURVEY = {
    gaia:['Tout le ciel, balayé en continu : le satellite tournait sur lui-même en six heures.', 'The whole sky, scanned continuously: the spacecraft spun once every six hours.'],
    planck:['A cartographié tout le ciel en micro-ondes, dans neuf bandes.', 'Mapped the whole sky in microwaves, in nine bands.'],
    wmap:['A cartographié tout le ciel en micro-ondes, dans cinq bandes.', 'Mapped the whole sky in microwaves, in five bands.'],
    fermi:['Le LAT voit un cinquième du ciel à la fois et le balaie en entier toutes les trois heures.', 'The LAT sees a fifth of the sky at once and sweeps all of it every three hours.'],
    cgro:['BATSE surveillait tout le ciel pour les sursauts gamma ; les autres instruments pointaient.', 'BATSE watched the whole sky for gamma-ray bursts; the other instruments pointed.'],
    tess:['Une bande de 24° × 96° fixée 27 jours, puis la suivante : il pave le ciel bande après bande.', 'A 24° × 96° strip held for 27 days, then the next: it tiles the sky strip by strip.'],
    kepler:['Un seul champ, entre le Cygne et la Lyre, fixé pendant quatre ans (cercle sur la carte).', 'A single field, between Cygnus and Lyra, held for four years (circle on the map).']
  };
  var NOMAP = {
    cheops:['Pointe une étoile à la fois ; pas de table de pointés publique interrogée ici.', 'Points at one star at a time; no public pointing table queried here.'],
    roman:['Lancé en 2026 : pas encore de données publiques.', 'Launched in 2026: no public data yet.']
  };
  /* Kepler : champ de 16,1° de diamètre (fiche, Kepler Instrument Handbook) ; centre RA 19 h 22 min 40 s, Dec +44° 30′ (même document) */
  var KEPLER = { ra:290.667, dec:44.5, r:8.05 };
  var UNIT = { integral:['fenêtres scientifiques', 'science windows'] };
  function unit(id){ return UNIT[id] ? UNIT[id][en() ? 1 : 0] : T('observations'); }
  var INSN = { NIRSPEC:'NIRSpec', NIRCAM:'NIRCam', NIRISS:'NIRISS', '*':'' };

  var D = null, loading = null, P = null, st = { off:{}, year:null, mode:'cov', pick:null, play:false, bg:true };

  /* équatorial J2000 -> galactique */
  var M = [[-0.0548755604, -0.8734370902, -0.4838350155], [0.4941094279, -0.4448296300, 0.7469822445], [-0.8676661490, -0.1980763734, 0.4559837762]];
  var R = Math.PI/180;
  function eq2gal(ra, dec){
    var a = ra*R, d = dec*R, v = [Math.cos(d)*Math.cos(a), Math.cos(d)*Math.sin(a), Math.sin(d)], g = [0,0,0];
    for (var i = 0; i < 3; i++) g[i] = M[i][0]*v[0] + M[i][1]*v[1] + M[i][2]*v[2];
    return [Math.atan2(g[1], g[0])/R, Math.asin(Math.max(-1, Math.min(1, g[2])))/R];
  }
  function gal2eq(l, b){
    var a = l*R, d = b*R, g = [Math.cos(d)*Math.cos(a), Math.cos(d)*Math.sin(a), Math.sin(d)], v = [0,0,0];
    for (var i = 0; i < 3; i++) v[i] = M[0][i]*g[0] + M[1][i]*g[1] + M[2][i]*g[2];
    var ra = Math.atan2(v[1], v[0])/R; return [(ra + 360) % 360, Math.asin(Math.max(-1, Math.min(1, v[2])))/R];
  }
  /* Mollweide : x dans [-2√2, 2√2], y dans [-√2, √2] ; longitude galactique croissante vers la gauche */
  function moll(l, b){
    var lam = ((l + 180) % 360 + 360) % 360 - 180, phi = b*R, th = phi;
    if (Math.abs(phi) > 1.5707) th = phi > 0 ? Math.PI/2 : -Math.PI/2;
    else for (var k = 0; k < 12; k++){ var f = (2*th + Math.sin(2*th) - Math.PI*Math.sin(phi)) / (2 + 2*Math.cos(2*th)); th -= f; if (Math.abs(f) < 1e-7) break; }
    return [-2*Math.SQRT2/Math.PI*lam*R*Math.cos(th), Math.SQRT2*Math.sin(th)];
  }
  function unmoll(x, y){
    if (Math.abs(y) > Math.SQRT2) return null;
    var th = Math.asin(y/Math.SQRT2), lam = -Math.PI*x/(2*Math.SQRT2*Math.cos(th));
    if (Math.abs(lam) > Math.PI) return null;
    return [lam/R, Math.asin((2*th + Math.sin(2*th))/Math.PI)/R];
  }

  function load(){
    return loading || (loading = fetch('data/sky-all.json').then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); }).then(function(j){ D = j; prep(); return j; })
      .catch(function(){ loading = null; return null; }));
  }
  /* projection de toutes les cases, une fois ; index des cases pour le clic */
  function prep(){
    P = { layers:[], idx:{}, y0:9999, y1:0 };
    TELESCOPES.forEach(function(t){
      var b = D.bodies[t.id]; if (!b) return;
      Object.keys(b.ins).forEach(function(nm){
        /* [Δk, année - 1990, nombre, …] ; case k = i*180 + j (tools/data/sky_all.py) */
        var f = b.ins[nm], n = f.length/3, xy = new Float32Array(n*2), y = new Int16Array(n), c = new Float32Array(n), key = 0, keys = new Int32Array(n);
        for (var k = 0; k < n; k++){
          key += f[3*k]; var i = Math.floor(key/180), j = key % 180, g = eq2gal(i + 0.5, j - 90 + 0.5), m = moll(g[0], g[1]);
          xy[2*k] = m[0]; xy[2*k+1] = m[1]; y[k] = f[3*k+1] + (D.y0 || 1990); c[k] = f[3*k+2]; keys[k] = key;
          P.y0 = Math.min(P.y0, y[k]); P.y1 = Math.max(P.y1, y[k]);
          (P.idx[i*1000 + j] = P.idx[i*1000 + j] || []).push([t.id, nm, y[k], c[k]]);
        }
        P.layers.push({ id:t.id, nm:nm, xy:xy, y:y, c:c, color:t.color, key:keys });
      });
    });
    P.layers.sort(function(a, b){ return b.y.length - a.y.length; });   /* les couches les plus étendues dessous */
    if (st.year === null) st.year = P.y1;
  }

  function shell(){
    return '<div class="home">' +
      '<div class="home-map">' +
        '<div class="home-head"><h2>' + esc(T('Le ciel observé')) + '</h2>' +
        '<p>' + esc(T('Chaque point coloré est une case du ciel d\'un degré de côté où un observatoire a commencé au moins une observation. Le ciel entier est déplié en ovale : la Voie lactée en travers, son centre au milieu.')) + '</p></div>' +
        '<div class="home-sky"><canvas id="home-cv" role="img" aria-label="' + esc(T('Carte du ciel entier des observations')) + '"></canvas><div class="home-tip" id="home-tip" hidden></div>' +
          '<div class="home-zoom" role="group" aria-label="' + esc(T('Zoom')) + '"><button data-hzoom="in" aria-label="' + esc(T('Zoomer')) + '">+</button><button data-hzoom="out" aria-label="' + esc(T('Dézoomer')) + '">−</button><button data-hzoom="all">' + esc(T('Ciel entier')) + '</button><button data-hbg aria-pressed="' + st.bg + '">' + esc(T('Fond Gaia')) + '</button></div></div>' +
        '<div class="home-ctl">' +
          '<button class="dep-b" id="home-play" aria-label="' + esc(T('Rejouer les années')) + '">▶</button>' +
          '<input type="range" id="home-year" min="1990" max="2026" step="1" aria-label="' + esc(T('Année')) + '">' +
          '<span class="home-yr" id="home-yr" aria-live="polite"></span>' +
          '<span class="home-mode" role="group" aria-label="' + esc(T('Affichage')) + '"><button class="chip" data-hmode="cov">' + esc(T('Couvert ou non')) + '</button><button class="chip" data-hmode="n">' + esc(T('Nombre d\'observations')) + '</button></span>' +
        '</div>' +
        '<p class="cap" id="home-cap"></p>' +
      '</div>' +
      '<aside class="home-side">' +
        '<div class="home-pick" id="home-pick" aria-live="polite"><p class="cap">' + esc(T('Cliquez un point du ciel pour voir qui l\'a observé, avec quel instrument et depuis quand.')) + '</p></div>' +
        '<div id="home-legend"><p class="cap">' + esc(T('Chargement des observations…')) + '</p></div>' +
      '</aside></div>';
  }

  function legend(){
    var h = '<h3>' + esc(T('Observatoires qui pointent')) + '</h3><p class="cap">' + esc(T('Survolez un observatoire pour le voir seul ; cliquez pour l\'afficher ou le masquer.')) + '</p><div class="home-leg" role="group" aria-label="' + esc(T('Observatoires affichés')) + '">';
    var have = TELESCOPES.filter(function(t){ return D && D.bodies[t.id]; });
    have.forEach(function(t){
      var b = D.bodies[t.id], on = !st.off[t.id], ins = Object.keys(b.ins).join(', ').split(', ').filter(function(k, i, a){ return k !== '*' && k !== '?' && a.indexOf(k) === i; });
      h += '<button class="home-li" data-hob="' + t.id + '" aria-pressed="' + on + '"><i style="background:' + t.color + '"></i><b>' + esc(t.short) + '</b><span>' + fr(b.total) + ' ' + esc(unit(t.id)) + '</span>' +
        (ins.length ? '<small>' + esc(ins.map(function(k){ return INSN[k] || k; }).join(', ')) + '</small>' : '') + '</button>';
    });
    h += '</div><div class="home-all"><button class="linkish" data-hall="1">' + esc(T('Tout afficher')) + '</button> <button class="linkish" data-hall="0">' + esc(T('Tout masquer')) + '</button></div>';
    h += '<h3>' + esc(T('Relevés du ciel entier')) + '</h3><ul class="home-sv">';
    TELESCOPES.forEach(function(t){ var s = SURVEY[t.id]; if (s && !(D && D.bodies[t.id])) h += '<li><button class="linkish" data-go="' + t.id + '"><i style="background:' + t.color + '"></i>' + esc(t.short) + '</button> ' + esc(s[en() ? 1 : 0]) + '</li>'; });
    h += '</ul>';
    var rest = TELESCOPES.filter(function(t){ return !(D && D.bodies[t.id]) && !SURVEY[t.id]; });
    if (rest.length){
      h += '<h3>' + esc(T('Sans carte ici')) + '</h3><ul class="home-sv">';
      rest.forEach(function(t){ var s = NOMAP[t.id]; h += '<li><button class="linkish" data-go="' + t.id + '"><i style="background:' + t.color + '"></i>' + esc(t.short) + '</button> ' + esc(s ? s[en() ? 1 : 0] : T('Carte des pointés pas encore calculée.')) + '</li>'; });
      h += '</ul>';
    }
    if (D){
      h += '<h3>' + esc(T('Sources')) + '</h3><ol class="refs">';
      TELESCOPES.forEach(function(t){ var b = D.bodies[t.id]; if (b) h += '<li>' + (b.url ? '<a href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(T(b.source)) + '</a>' : esc(T(b.source))) + ' <span>' + esc(t.short) + (t.id === 'euclid' ? ' ; ' + esc(T('crédit : ESA Euclid, Euclid Consortium, NASA ; licence CC BY-NC 3.0 IGO')) : '') + '</span></li>'; });
      if (BGM) h += '<li><a href="' + esc(BGM.url) + '" target="_blank" rel="noopener">' + esc(T(BGM.what)) + '</a> <span>' + esc(T(BGM.credit)) + '</span>' + (BGM.licence_url ? ' <a href="' + esc(BGM.licence_url) + '" target="_blank" rel="noopener">' + esc(T(BGM.licence)) + '</a>' : '') + '</li>';
      h += '</ol><p class="cap">' + esc(T('Cartes calculées le')) + ' ' + esc(D.fetched || '') + '.</p>'
      h += '<p class="cap"><a href="https://github.com/Rolgim/Observatories/blob/main/LICENSES.md" target="_blank" rel="noopener">' + esc(T('Licences et crédits de tout le site')) + '</a></p>';
    }
    return h;
  }

  var cv = null, raf = 0, last = 0;
  function size(){
    var box = cv.parentNode, cs = getComputedStyle(box), w = Math.max(260, box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)), h = Math.round(w/2), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv._w = w; cv._h = h; cv._d = dpr;
  }
  /* vue : zoom (1 = ciel entier) et centre (cx, cy) en unités de Mollweide */
  var V = { z:1, cx:0, cy:0 };
  function K(){ return (cv._w/2 - 6)/(2*Math.SQRT2)*V.z; }
  function X(x){ return cv._w/2 + (x - V.cx)*K(); }
  function Y(y){ return cv._h/2 - (y - V.cy)*K(); }
  function clampV(){ V.z = Math.max(1, Math.min(24, V.z)); var mx = 2*Math.SQRT2*(1 - 1/V.z), my = Math.SQRT2*(1 - 1/V.z); V.cx = Math.max(-mx, Math.min(mx, V.cx)); V.cy = Math.max(-my, Math.min(my, V.cy)); }
  function zoomAt(f, px, py){   /* zoom de facteur f autour du point (px, py) du canevas */
    var mx = V.cx + (px - cv._w/2)/K(), my = V.cy - (py - cv._h/2)/K();
    V.z *= f; clampV(); var k = K(); V.cx = mx - (px - cv._w/2)/k; V.cy = my + (py - cv._h/2)/k; clampV(); draw();
  }
  /* fond : le ciel de Gaia, image Mollweide galactique précalculée (tools/data/fetch_skybg.py) */
  var BG = null, BGM = null;
  function loadBg(){ if (BG !== null) return; BG = false;
    fetch('data/sky-gaia.json').then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if (!j) return; BGM = j; var im = new Image(); im.onload = function(){ BG = im; draw(); var c = document.getElementById('home-cap'); if (c) c.textContent = caption(); var lg = document.getElementById('home-legend'); if (lg && D) lg.innerHTML = legend(); }; im.src = 'data/sky-gaia.jpg'; }).catch(function(){}); }
  function draw(){
    if (!cv || !cv.isConnected) return;
    var g = cv.getContext('2d'), W = cv._w, H = cv._h, s = (W/2 - 6)/(2*Math.SQRT2)*2*Math.SQRT2/180;   /* pixels par degré, à l'équateur */
    g.setTransform(cv._d, 0, 0, cv._d, 0, 0); g.clearRect(0, 0, W, H);
    var k0 = K(), ex = 2*Math.SQRT2*k0, ey = Math.SQRT2*k0, ecx = X(0), ecy = Y(0);
    g.save(); g.beginPath(); g.ellipse(ecx, ecy, ex, ey, 0, 0, 2*Math.PI); g.fillStyle = '#05070A'; g.fill(); g.clip();
    if (BG && st.bg){ g.globalAlpha = 0.85; g.drawImage(BG, ecx - ex, ecy - ey, 2*ex, 2*ey); g.globalAlpha = 1; }
    /* grille galactique */
    g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1;
    [-60, -30, 0, 30, 60].forEach(function(b){ g.beginPath(); for (var l = -180; l <= 180; l += 3){ var m = moll(l, b); l === -180 ? g.moveTo(X(m[0]), Y(m[1])) : g.lineTo(X(m[0]), Y(m[1])); } g.stroke(); });
    [-120, -60, 0, 60, 120].forEach(function(l){ g.beginPath(); for (var b = -90; b <= 90; b += 3){ var m = moll(l, b); b === -90 ? g.moveTo(X(m[0]), Y(m[1])) : g.lineTo(X(m[0]), Y(m[1])); } g.stroke(); });
    /* équateur céleste, en pointillés */
    g.setLineDash([3, 4]); g.strokeStyle = 'rgba(255,255,255,0.3)'; var prev = null;
    g.beginPath(); for (var ra = 0; ra <= 360; ra += 2){ var q = eq2gal(ra, 0), m = moll(q[0], q[1]), p = [X(m[0]), Y(m[1])]; if (!prev || Math.abs(p[0] - prev[0]) > W/3) g.moveTo(p[0], p[1]); else g.lineTo(p[0], p[1]); prev = p; } g.stroke(); g.setLineDash([]);
    /* cases observées */
    if (P){
      var px = Math.max(1.6, s*V.z*(BG && st.bg ? 0.8 : 1.05)), seen = new Uint8Array(360*180);
      P.layers.slice().sort(function(a, b){ return (a.id === st.solo) - (b.id === st.solo); }).forEach(function(L){
        if (st.off[L.id]) return;
        g.fillStyle = L.color; var dim = st.solo && st.solo !== L.id;
        for (var k = 0, n = L.y.length; k < n; k++){
          if (L.y[k] > st.year) continue;
          g.globalAlpha = (st.mode === 'n' ? Math.min(1, 0.18 + 0.2*Math.log10(1 + L.c[k])) : (BG && st.bg ? 0.5 : 0.9)) * (dim ? 0.08 : 1);
          g.fillRect(X(L.xy[2*k]) - px/2, Y(L.xy[2*k+1]) - px/2, px, px);
          seen[L.key[k]] = 1;
        }
      });
      g.globalAlpha = 1; var cnt = 0; for (var q = 0; q < seen.length; q++) cnt += seen[q]; st.shown = cnt;
    }
    /* Kepler : disque du champ */
    if (!st.off.kepler){ var kt = tele('kepler'); g.strokeStyle = kt.color; g.lineWidth = 2.5; g.globalAlpha = 1; g.beginPath(); for (var a = 0; a <= 360; a += 6){ var dd = KEPLER.dec + KEPLER.r*Math.sin(a*R), rr = KEPLER.ra + KEPLER.r*Math.cos(a*R)/Math.cos(dd*R), q2 = eq2gal(rr, dd), m2 = moll(q2[0], q2[1]); a ? g.lineTo(X(m2[0]), Y(m2[1])) : g.moveTo(X(m2[0]), Y(m2[1])); } g.closePath(); g.stroke();
      var kc = eq2gal(KEPLER.ra, KEPLER.dec + KEPLER.r + 1.5), km = moll(kc[0], kc[1]); g.fillStyle = kt.color; g.font = '600 11px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 3; g.strokeText(T('champ de Kepler'), X(km[0]), Y(km[1]) - 4); g.fillText(T('champ de Kepler'), X(km[0]), Y(km[1]) - 4); }
    /* repère du clic */
    if (st.pick){ var mp = moll.apply(null, eq2gal(st.pick[0] + 0.5, st.pick[1] - 90 + 0.5)); g.strokeStyle = '#FFD21F'; g.lineWidth = 2; g.beginPath(); g.arc(X(mp[0]), Y(mp[1]), 9, 0, 2*Math.PI); g.stroke(); }
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1; g.beginPath(); g.ellipse(ecx, ecy, ex, ey, 0, 0, 2*Math.PI); g.stroke();
    /* repères */
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.font = '11px Archivo, Arial, sans-serif'; g.textAlign = 'center';
    if (V.z < 3) g.fillText(T('centre de la Galaxie'), ecx, ecy + 16);
    if (V.z > 1){ g.textAlign = 'left'; g.fillText('× ' + (Math.round(V.z*10)/10).toString().replace('.', en() ? '.' : ','), 10, H - 10); }
    var yr = document.getElementById('home-yr'); if (yr && P) yr.textContent = (en() ? 'Up to ' : 'Jusqu\'à ') + st.year + (en() ? ': ' : ' : ') + fr(st.shown || 0) + ' ' + T('cases de 1° observées');
  }
  function tick(now){
    raf = 0; if (!st.play || !cv || !cv.isConnected) return;
    if (now - last > 420){ last = now; st.year++; if (st.year > P.y1){ st.year = P.y1; st.play = false; playBtn(); } var r = document.getElementById('home-year'); if (r) r.value = st.year; draw(); }
    if (st.play) raf = requestAnimationFrame(tick);
  }
  function playBtn(){ var b = document.getElementById('home-play'); if (b){ b.textContent = st.play ? '❚❚' : '▶'; b.setAttribute('aria-label', T(st.play ? 'Pause' : 'Rejouer les années')); } }

  function pickAt(ev){
    var r = cv.getBoundingClientRect(), x = V.cx + (ev.clientX - r.left - cv._w/2)/K(), y = V.cy - (ev.clientY - r.top - cv._h/2)/K();
    var lb = unmoll(x, y); if (!lb) return null;
    var e = gal2eq(lb[0], lb[1]); return [e[0], e[1], lb[0], lb[1]];
  }
  /* qui a observé : la case cliquée et ses voisines (3° × 3°), pour qu'un clic n'ait pas à tomber pile sur un point */
  function pickInfo(p){
    var i0 = Math.floor(p[0]), j0 = Math.floor(p[1] + 90), by = {}, n = 0;
    for (var di = -1; di <= 1; di++) for (var dj = -1; dj <= 1; dj++){
      var i = (i0 + di + 360) % 360, j = j0 + dj, a = P.idx[i*1000 + j]; if (!a) continue;
      a.forEach(function(e){ if (st.off[e[0]] || e[2] > st.year) return; var k = e[0]; by[k] = by[k] || { ins:{}, y:9999, n:0 }; by[k].ins[e[1]] = (by[k].ins[e[1]] || 0) + e[3]; by[k].y = Math.min(by[k].y, e[2]); by[k].n += e[3]; n += e[3]; });
    }
    var pos = 'RA ' + p[0].toFixed(1) + '°, Dec ' + (p[1] >= 0 ? '+' : '−') + Math.abs(p[1]).toFixed(1) + '° · l ' + ((p[2] + 360) % 360).toFixed(1) + '°, b ' + (p[3] >= 0 ? '+' : '−') + Math.abs(p[3]).toFixed(1) + '°';
    var h = '<h3>' + esc(T('Autour de ce point')) + '</h3><p class="home-pos">' + esc(en() ? pos : pos.replace(/\./g, ',').replace(/ · /, ' ; ')) + '</p>';
    h += '<p class="home-al"><a href="https://aladin.cds.unistra.fr/AladinLite/?target=' + encodeURIComponent(p[0].toFixed(4) + ' ' + p[1].toFixed(4)) + '&fov=3&survey=' + encodeURIComponent('CDS/P/DSS2/color') + '" target="_blank" rel="noopener">' + esc(T('Voir ce coin du ciel dans Aladin Lite (CDS)')) + '</a></p>';
    var ids = Object.keys(by).sort(function(a, b){ return by[b].n - by[a].n; });
    if (!ids.length) h += '<p class="cap">' + esc(T('Aucune observation pointée dans ce carré de 3° de côté, avec les filtres choisis.')) + '</p>';
    else h += '<ul class="home-who">' + ids.map(function(id){ var t = tele(id), b = by[id];
      var ins = Object.keys(b.ins).filter(function(k){ return k !== '*'; }).sort(function(x, y){ return b.ins[y] - b.ins[x]; }).map(function(k){ return (INSN[k] || k) + ' ' + fr(b.ins[k]); }).join(', ');
      return '<li><button class="linkish" data-go="' + id + '-instruments"><i style="background:' + t.color + '"></i><b>' + esc(t.short) + '</b></button> ' + fr(b.n) + ' ' + esc(b.n === 1 ? unit(id).replace(/s$/, '').replace(/s /, ' ') : unit(id)) + ' ' + esc(T('depuis')) + ' ' + b.y + (ins ? '<small>' + esc(ins) + '</small>' : '') + '</li>'; }).join('') + '</ul>' +
      '<p class="cap">' + esc(T('Carré de 3° de côté centré sur le point cliqué ; une observation est comptée là où elle a commencé.')) + '</p>';
    var inK = Math.acos(Math.max(-1, Math.min(1, Math.sin(p[1]*R)*Math.sin(KEPLER.dec*R) + Math.cos(p[1]*R)*Math.cos(KEPLER.dec*R)*Math.cos((p[0] - KEPLER.ra)*R))))/R < KEPLER.r;
    if (inK) h += '<p class="cap"><b>' + esc(T('Dans le champ de Kepler,')) + '</b> ' + esc(T('fixé pendant quatre ans.')) + '</p>';
    var surv = TELESCOPES.filter(function(t){ return SURVEY[t.id] && t.id !== 'kepler' && t.id !== 'tess' && !st.off[t.id]; }).map(function(t){ return t.short; });
    if (surv.length) h += '<p class="cap">' + esc(T('Comme tout le ciel, ce point a aussi été couvert par les relevés :')) + ' ' + esc(surv.join(', ')) + '.</p>';
    return h;
  }

  function caption(){
    return (BGM && st.bg ? T('Fond : le ciel vu par Gaia') + ' (' + T(BGM.what) + (en() ? '; ' : ' ; ') + T(BGM.credit) + (en() ? '; ' : ' ; ') + T('reprojeté en Mollweide pour ce site') + '). ' : '') + T('Projection de Mollweide, à aires égales, en coordonnées galactiques ; la longitude croît vers la gauche, comme on voit le ciel. En pointillés : l\'équateur céleste. Les cases font 1° en ascension droite et en déclinaison, positions de début d\'observation seulement, sans la forme réelle des champs. Pour Euclid : les observations VIS publiées dans DR1. Molette, double clic ou boutons pour zoomer ; glisser pour se déplacer.');
  }

  function render(root){
    root.innerHTML = shell();
    cv = root.querySelector('#home-cv'); size(); loadBg();
    /* molette : zoom autour du curseur ; glisser : déplacer la vue (un glisser ne compte pas comme un clic) */
    cv.addEventListener('wheel', function(e){ e.preventDefault(); var r = cv.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive:false });
    var drag = null;
    cv.addEventListener('pointerdown', function(e){ drag = { x:e.clientX, y:e.clientY, cx:V.cx, cy:V.cy, moved:false }; st.dragged = false; });
    cv.addEventListener('pointermove', function(e){ if (!drag || V.z <= 1) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return; drag.moved = st.dragged = true; if (cv.setPointerCapture) try { cv.setPointerCapture(e.pointerId); } catch(x){}
      V.cx = drag.cx - dx/K(); V.cy = drag.cy + dy/K(); clampV(); draw(); });
    if (!window.__homeUp) window.__homeUp = window.addEventListener('pointerup', function(){ HomeUI.__up && HomeUI.__up(); }) || 1;
    HomeUI.__up = function(){ drag = null; setTimeout(function(){ st.dragged = false; }, 0); };
    cv.addEventListener('dblclick', function(e){ var r = cv.getBoundingClientRect(); zoomAt(2, e.clientX - r.left, e.clientY - r.top); });
    var cap = root.querySelector('#home-cap'); cap.textContent = caption();
    [].forEach.call(root.querySelectorAll('[data-hmode]'), function(b){ b.classList.toggle('on', b.getAttribute('data-hmode') === st.mode); b.setAttribute('aria-pressed', b.getAttribute('data-hmode') === st.mode); });
    draw();
    load().then(function(){
      if (!cv || !cv.isConnected) return;
      var leg = root.querySelector('#home-legend');
      if (!D){ leg.innerHTML = '<p class="cap">' + esc(T('Les observations n\'ont pas pu être chargées.')) + '</p>'; return; }
      leg.innerHTML = legend();
      var r = root.querySelector('#home-year'); r.min = P.y0; r.max = P.y1; r.value = st.year;
      draw();
    });
  }
  function click(el, ev){
    if (el.hasAttribute('data-hob')){ var id = el.getAttribute('data-hob'); st.off[id] = !st.off[id]; el.setAttribute('aria-pressed', !st.off[id]); draw(); refreshPick(); return true; }
    if (el.hasAttribute('data-hall')){ var on = el.getAttribute('data-hall') === '1'; TELESCOPES.forEach(function(t){ st.off[t.id] = !on; }); var l = document.getElementById('home-legend'); if (l) l.innerHTML = legend(); draw(); refreshPick(); return true; }
    if (el.hasAttribute('data-hmode')){ st.mode = el.getAttribute('data-hmode'); [].forEach.call(document.querySelectorAll('[data-hmode]'), function(b){ var o = b.getAttribute('data-hmode') === st.mode; b.classList.toggle('on', o); b.setAttribute('aria-pressed', o); }); draw(); return true; }
    if (el.id === 'home-play'){ if (!P) return true; st.play = !st.play; if (st.play && st.year >= P.y1){ st.year = P.y0; } playBtn(); if (st.play && !raf){ last = 0; raf = requestAnimationFrame(tick); } return true; }
    if (el.hasAttribute('data-hzoom')){ var zz = el.getAttribute('data-hzoom'); if (zz === 'all'){ V.z = 1; V.cx = V.cy = 0; draw(); } else zoomAt(zz === 'in' ? 2 : 0.5, cv._w/2, cv._h/2); return true; }
    if (el.hasAttribute('data-hbg')){ st.bg = !st.bg; el.setAttribute('aria-pressed', st.bg); draw(); var cc = document.getElementById('home-cap'); if (cc) cc.textContent = caption(); return true; }
    if (el.id === 'home-cv'){ if (!P || st.dragged) return true; var p = pickAt(ev); if (!p) return true; st.pick = [Math.floor(p[0]), Math.floor(p[1] + 90)]; st.pickP = p; draw(); refreshPick(); return true; }
    return false;
  }
  function refreshPick(){ var b = document.getElementById('home-pick'); if (b && st.pickP && P) b.innerHTML = pickInfo(st.pickP); }
  function input(el){ if (el.id === 'home-year'){ st.year = +el.value; st.play = false; playBtn(); draw(); refreshPick(); return true; } return false; }
  function resize(){ if (cv && cv.isConnected){ size(); draw(); } }
  function hover(ev){
    var tip = document.getElementById('home-tip'); if (!tip || !P) return;
    var p = ev && pickAt(ev); if (!p){ tip.hidden = true; return; }
    var a = P.idx[Math.floor(p[0])*1000 + Math.floor(p[1] + 90)] || [], ids = {};
    a.forEach(function(e){ if (!st.off[e[0]] && e[2] <= st.year) ids[e[0]] = (ids[e[0]] || 0) + e[3]; });
    var k = Object.keys(ids); if (!k.length){ tip.hidden = true; return; }
    tip.textContent = k.map(function(id){ return tele(id).short + ' ' + fr(ids[id]); }).join(' · ');
    var r = cv.getBoundingClientRect(); tip.style.left = (ev.clientX - r.left + 12) + 'px'; tip.style.top = (ev.clientY - r.top + 12) + 'px'; tip.hidden = false;
  }
  /* survol d'une ligne de la légende : cet observatoire seul en couleur vive */
  function solo(id){ if (st.solo === id) return; st.solo = id; draw(); }
  return { render:render, click:click, input:input, resize:resize, hover:hover, solo:solo };
})();
