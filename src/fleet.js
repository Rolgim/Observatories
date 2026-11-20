/* =================================================================
   PAGE « FLOTTE » (#flotte) : tous les observatoires sur une frise chronologique, filtrables par agence,
   état, domaine spectral, famille d'orbite et type de mission ; puis « qui a fait quoi », sourcé.
   Données : FLEET et FLEET_REFS (data-fleet.js), registre TELESCOPES.
================================================================= */
var FleetUI = (function(){
  var T = function(s){ return (window.OBS_T || function(x){ return x; })(s); };
  var F = window.OBS_FLEET = window.OBS_FLEET || { ag:null, st:null, dom:null, orb:null, mis:null };
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function en(){ return window.OBS_LANG === 'en'; }
  function yr(d){ var p = d.split('-'); return +p[0] + ((+p[1] - 1) + (+p[2] - 1)/31)/12; }
  function today(){ var n = new Date(); return n.getFullYear() + n.getMonth()/12 + (n.getDate() - 1)/365; }
  function dfmt(d){ var p = d.split('-'); return en() ? d : p[2] + '/' + p[1] + '/' + p[0]; }
  function list(){
    return TELESCOPES.filter(function(t){
      var f = FLEET[t.id]; if (!f) return false;
      if (F.ag && fleetAgencies(t.id).indexOf(F.ag) < 0) return false;
      if (F.st === 'on' && f.life[1]) return false; if (F.st === 'off' && !f.life[1]) return false;
      if (F.dom && t.domain !== F.dom) return false;
      if (F.orb && t.orbit !== F.orb) return false;
      if (F.mis && (t.mission || []).indexOf(F.mis) < 0) return false;
      return true;
    }).sort(function(a, b){ return FLEET[a.id].life[0] < FLEET[b.id].life[0] ? -1 : 1; });
  }
  function chips(key, label, opts){
    return '<div class="fl-f" role="group" aria-label="' + esc(T(label)) + '"><span>' + esc(T(label)) + '</span>' +
      '<button class="chip" data-fleet="' + key + ':" aria-pressed="' + (!F[key]) + '">' + esc(T('Tous')) + '</button>' +
      opts.map(function(o){ return '<button class="chip" data-fleet="' + key + ':' + o[0] + '" aria-pressed="' + (F[key] === o[0]) + '">' + esc(T(o[1])) + '</button>'; }).join('') + '</div>';
  }
  function filters(){
    return '<div class="fl-filters">' +
      chips('ag', 'Agence', [['NASA','NASA'],['ESA','ESA'],['CNES','CNES']]) +
      chips('st', 'État', [['on','En service'],['off','Terminés']]) +
      chips('dom', 'Domaine spectral', DOMAINS.map(function(d){ return [d.id, d.label]; })) +
      chips('orb', 'Orbite', ORBIT_FAMILIES.map(function(o){ return [o.id, o.label]; })) +
      chips('mis', 'Mission', MISSION_TYPES.map(function(o){ return [o.id, o.label]; })) + '</div>';
  }
  /* frise : une barre par observatoire, du lancement à la fin des observations (ou à aujourd'hui, en service) */
  function timeline(L){
    var y0 = 1990, y1 = Math.max(2027, Math.ceil(today()) + 1), W = 1000, lw = 110, rh = 26, top = 26, H = top + L.length*rh + 30, now = today();
    function X(y){ return lw + (y - y0)/(y1 - y0)*(W - lw - 56); }
    var s = '';
    for (var y = y0; y <= y1; y += 5){ s += '<line x1="' + X(y) + '" y1="' + (top - 6) + '" x2="' + X(y) + '" y2="' + (H - 22) + '" stroke="#C8CDD1" stroke-width="1"/><text x="' + X(y) + '" y="14" text-anchor="middle" font-size="11" fill="#3A4147">' + y + '</text>'; }
    s += '<line x1="' + X(now) + '" y1="' + (top - 6) + '" x2="' + X(now) + '" y2="' + (H - 22) + '" stroke-width="1.5" stroke-dasharray="3 3" class="fl-now"/><text x="' + X(now) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" class="fl-nowt">' + esc(T('aujourd\'hui')) + '</text>';
    L.forEach(function(t, i){
      var f = FLEET[t.id], a = yr(f.life[0]), b = f.life[1] ? yr(f.life[1]) : now, yy = top + i*rh, on = !f.life[1], cn = fleetAgencies(t.id).indexOf('CNES') >= 0;
      var tip = t.short + ' : ' + dfmt(f.life[0]) + ' – ' + (on ? T('en service') : dfmt(f.life[1]));
      s += '<g class="fl-row" data-go="' + t.id + '" tabindex="0" role="link" aria-label="' + esc(tip) + '"><title>' + esc(tip) + '</title>' +
        '<rect x="0" y="' + (yy - 2) + '" width="' + W + '" height="' + rh + '" fill="transparent"/>' +
        '<text x="' + (lw - 10) + '" y="' + (yy + 15) + '" text-anchor="end" font-size="12.5" font-weight="700" fill="#14171A">' + esc(t.short) + '</text>' +
        '<rect x="' + X(a) + '" y="' + (yy + 4) + '" width="' + Math.max(3, X(b) - X(a)) + '" height="14" fill="' + t.color + '"' + (on ? '' : ' fill-opacity="0.55"') + '/>' +
        (on ? '<path d="M' + X(b) + ' ' + (yy + 4) + ' l7 7 l-7 7 z" fill="' + t.color + '"/>' : '') +
        (cn ? '<text x="' + (X(b) + (on ? 12 : 5)) + '" y="' + (yy + 15) + '" font-size="10.5" font-weight="700" class="fl-cnes">CNES</text>' : '') + '</g>';
    });
    return '<div class="svgwrap fl-tl"><svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="' + esc(T('Frise chronologique des observatoires')) + '" font-family="Archivo, Arial, sans-serif">' + s + '</svg></div>' +
      '<div class="cap">' + esc(T('Une barre par observatoire, du lancement à la fin des observations ; pleine et fléchée s\'il est en service. « CNES » signale une contribution du CNES, détaillée plus bas. Cliquer une barre ouvre l\'observatoire en 3D.')) + '</div>';
  }
  function who(L){
    var nums = {}, n = 0, refs = {}, h = '';
    L.forEach(function(t){
      var r = fleetRefs(t.id), f = FLEET[t.id];
      h += '<div class="fl-who"><h4><button class="linkish" data-go="' + t.id + '">' + esc(t.short) + '</button> <small>' + dfmt(f.life[0]) + ' – ' + (f.life[1] ? dfmt(f.life[1]) : esc(T('en service'))) + '</small></h4>' +
        f.who.map(function(w){
          var ks = [].concat(w[4]).filter(function(k){ return r[k]; }), mk = ks.map(function(k){ var id = t.id + ':' + k; if (!nums[id]){ nums[id] = ++n; refs[n] = r[k]; } return nums[id]; });
          return '<div class="spec-row"><div class="k"><b' + (w[0] === 'CNES' ? ' class="cnes"' : '') + '>' + esc(T(w[0])) + '</b><small>' + esc(FLEET_ROLES[w[1]][en() ? 1 : 0]) + '</small></div><div class="v">' + esc(en() ? w[3] : w[2]) + (mk.length ? '<sup class="ref">' + mk.join(',') + '</sup>' : '') + '</div></div>';
        }).join('') + '</div>';
    });
    var src = Object.keys(refs).map(function(k){ var x = refs[k]; return '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc(T(x.t)) + '</a> <span>' + esc(T(x.p)) + '</span></li>'; }).join('');
    return h + (src ? '<div class="spec-section"><div class="spec-section-title">' + esc(T('Sources')) + '</div><ol class="refs">' + src + '</ol></div>' : '');
  }
  function render(sec){
    var L = list(), all = TELESCOPES.filter(function(t){ return FLEET[t.id]; }).length;
    var nav = '<button class="nav-i' + (sec !== 'who' ? ' on' : '') + '" data-fleet-sec="tl"><span class="n">' + esc(T('Frise chronologique')) + '</span><span class="k">' + esc(T('Du lancement à la fin des observations')) + '</span></button>' +
      '<button class="nav-i' + (sec === 'who' ? ' on' : '') + '" data-fleet-sec="who"><span class="n">' + esc(T('Qui a fait quoi')) + '</span><span class="k">' + esc(T('Agences, instruments, données, lancement')) + '</span></button>';
    var head = '<div class="inst-head"><div class="inst-h"><div class="inst-name">' + esc(T('Flotte')) + '</div><div class="inst-full">' + esc(T('Les observatoires de la NASA, de l\'ESA et du CNES présentés sur ce site')) + '</div></div>' +
      '<p class="inst-sum">' + esc(T('Chaque observatoire a sa fiche, sa maquette et ses données. Les filtres se combinent ; le nombre affiché est celui des observatoires retenus.')) + '</p></div>';
    var main = head + filters() + '<p class="fl-count">' + esc(T('Observatoires affichés')) + (en() ? ': ' : ' : ') + '<b>' + L.length + '</b> / ' + all + '</p>';
    if (!L.length) main += '<p class="cap">' + esc(T('Aucun observatoire ne correspond à ces filtres.')) + '</p>';
    else main += sec === 'who' ? who(L) : timeline(L);
    return { pills:'', nav:nav, main:main };
  }
  function click(el){
    if (el.hasAttribute('data-fleet')){ var p = el.getAttribute('data-fleet').split(':'); F[p[0]] = p[1] || null; return true; }
    return false;
  }
  return { render:render, click:click };
})();
