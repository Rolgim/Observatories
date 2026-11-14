/* =================================================================
   INSTRUMENTS — rendu HTML/SVG (aucune dépendance à three.js)
================================================================= */
var InstrumentsUI = (function(){
  var ORDER = ['hubble','jwst','euclid','gaia'];
  var NAMES = { hubble:'Hubble', jwst:'JWST', euclid:'Euclid', gaia:'Gaia' };
  var copyStore = [];

  /* champs de vue ajoutés ici pour les relevés à grand champ (valeurs approchées) */
  (function(){
    var e = INST_DATA.euclid.instruments, g = INST_DATA.gaia.instruments;
    e[0].fov = [ {l:'VIS', w:2830, h:2550} ];
    e[1].fov = [ {l:'NISP', w:2750, h:2600} ];
    g[0].fov = [ {l:'Champ d\'un télescope', w:2520, h:2520} ];
    /* couleurs catégorielles lisibles sur papier clair, attribuées par rang */
    var PAL = ['#3D6BE0', '#DB5A14', '#0F987A', '#9A52D6', '#7B858C'];
    for (var k in INST_DATA) INST_DATA[k].instruments.forEach(function(it, i){ it.color = it.bands ? PAL[i % 4] : PAL[4]; });
  })();

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function num(v, d){ var t = v.toFixed(d); if (t.indexOf('.') >= 0) t = t.replace(/0+$/,'').replace(/\.$/,''); return OBS_LANG === 'en' ? t : t.replace('.', ','); }
  function wl(um){ return um < 1 ? num(um*1000, um*1000 < 200 ? 1 : 0) + ' nm' : num(um, 2) + ' µm'; }
  function ang(a){ return a >= 3600 ? num(a/3600, 2) + '°' : a >= 120 ? num(a/60, 1) + '′' : num(a, 1) + '″'; }
  function get(tid, iid){ var a = INST_DATA[tid].instruments; for (var i=0;i<a.length;i++) if (a[i].id===iid) return a[i]; return null; }

  var KIND = { W:'filtre large', M:'filtre à bande moyenne', N:'filtre étroit', LP:'filtre passe-haut', C:'filtre de coronographe', G:'élément dispersif', B:'bande photométrique' };
  function span(f){
    if (f.lo != null) return [f.lo, f.hi];
    var w = f.k==='W' ? 0.25 : f.k==='M' ? 0.10 : f.k==='N' ? 0.012 : f.k==='C' ? 0.06 : 0.25;
    if (f.k==='LP') return [f.c, f.c*1.35];
    return [f.c*(1-w/2), f.c*(1+w/2)];
  }

  /* ---------- axe logarithmique commun ---------- */
  function Axis(min, max, x0, x1){
    var a = Math.log(min), b = Math.log(max);
    this.x = function(v){ v = Math.max(min, Math.min(max, v)); return x0 + (Math.log(v)-a)/(b-a)*(x1-x0); };
    this.min = min; this.max = max;
    var cand = [0.1,0.15,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.2,1.5,2,3,4,5,7,10,15,20,25,30], out = [], last = -99;
    for (var i=0;i<cand.length;i++){ var v = cand[i]; if (v < min*0.999 || v > max*1.001) continue; var px = this.x(v); if (px - last < 46) continue; out.push(v); last = px; }
    this.ticks = out;
  }
  function visibleBand(ax, y, h){
    if (ax.max < 0.4 || ax.min > 0.75) return '';
    var a = ax.x(0.38), b = ax.x(0.75);
    return '<rect x="'+a+'" y="'+y+'" width="'+(b-a)+'" height="'+h+'" fill="url(#gvis)" opacity="0.26"/>';
  }
  var GRAD = '<defs><linearGradient id="gvis" x1="0" x2="1"><stop offset="0" stop-color="#7a5cff"/><stop offset="0.25" stop-color="#3fa0ff"/><stop offset="0.5" stop-color="#5fe07a"/><stop offset="0.72" stop-color="#ffd85a"/><stop offset="1" stop-color="#ff5a4a"/></linearGradient></defs>';

  function coverage(tid, sel){
    var d = INST_DATA[tid], W = 560, L = 76, R = 12, ax = new Axis(d.axis.min, d.axis.max, L, W-R);
    var rows = [], y = 30;
    d.instruments.forEach(function(it){
      if (!it.bands) return;
      var lanes = [];
      var placed = it.bands.map(function(b){
        var a = ax.x(b.lo), z = ax.x(b.hi), lane = 0;
        for (;; lane++){
          var clash = (lanes[lane]||[]).some(function(o){ var ov = Math.min(z,o[1]) - Math.max(a,o[0]); return ov > 0.4*Math.min(z-a, o[1]-o[0]); });
          if (!clash) break;
        }
        (lanes[lane] = lanes[lane] || []).push([a,z]);
        return { b:b, a:a, z:z, lane:lane };
      });
      var h = lanes.length*17 + 9;
      rows.push({ it:it, y:y, h:h, placed:placed }); y += h;
    });
    var H = y + 30, s = '<svg class="cov" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Couverture spectrale des instruments">' + GRAD;
    s += visibleBand(ax, 22, y-22);
    if (ax.max >= 0.4 && ax.min <= 0.75) s += '<text class="cov-vis" x="'+((ax.x(0.38)+ax.x(0.75))/2)+'" y="14" text-anchor="middle">visible</text>';
    ax.ticks.forEach(function(v){ var x = ax.x(v); s += '<line class="cov-grid" x1="'+x+'" y1="22" x2="'+x+'" y2="'+y+'"/><text class="cov-tick" x="'+x+'" y="'+(y+15)+'" text-anchor="middle">'+num(v,2)+'</text>'; });
    s += '<line class="cov-axis" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/><text class="cov-unit" x="'+(W-R)+'" y="'+(y+27)+'" text-anchor="end">longueur d\'onde (µm), échelle logarithmique</text>';
    rows.forEach(function(r){
      s += '<g class="cov-row'+(r.it.id===sel?' sel':'')+'" data-inst="'+r.it.id+'"><rect x="0" y="'+r.y+'" width="'+W+'" height="'+r.h+'" fill="transparent"/>';
      s += '<text class="cov-lab" x="4" y="'+(r.y + r.h/2 + 4)+'">'+esc(r.it.name)+'</text>';
      r.placed.forEach(function(p){
        var yy = r.y + 5 + p.lane*17, w = Math.max(3, p.z - p.a);
        s += '<rect x="'+p.a+'" y="'+yy+'" width="'+w+'" height="13" rx="2" fill="'+r.it.color+'"><title>'+esc(r.it.name+' '+p.b.l+' : '+wl(p.b.lo)+' – '+wl(p.b.hi))+'</title></rect>';
        if (w > p.b.l.length*6.4 + 8) s += '<text class="cov-band" x="'+(p.a + w/2)+'" y="'+(yy+10)+'" text-anchor="middle">'+esc(p.b.l)+'</text>';
      });
      s += '</g>';
    });
    return '<div class="svgwrap">' + s + '</svg></div>';
  }

  /* ---------- champs de vue à l'échelle ---------- */
  function fovBlock(tid, sel){
    var d = INST_DATA[tid], items = [];
    d.instruments.forEach(function(it){ (it.fov||[]).forEach(function(f){ if (!sel || sel===it.id) items.push({ it:it, f:f }); }); });
    if (!items.length) return '';
    var ext = 0; items.forEach(function(o){ ext = Math.max(ext, Math.abs(o.f.dx||0)*2 + o.f.w, o.f.h); });
    var moon = ext > 1200, S = 300, pad = 26;
    if (moon) ext = Math.max(ext, 1865);
    var k = (S - 2*pad) / ext, c = S/2;
    var s = '<svg class="fov-svg" viewBox="0 0 '+S+' '+(S+18)+'" role="img" aria-label="Champs de vue à l\'échelle"><rect x="0.5" y="0.5" width="'+(S-1)+'" height="'+(S-1)+'" fill="#F7F8F8" stroke="#98A1A7"/>';
    if (moon){ var rm = 1865/2*k; s += '<circle cx="'+c+'" cy="'+c+'" r="'+rm+'" fill="none" stroke="#3A4147" stroke-dasharray="3 3"/><text class="fov-barlab" x="'+c+'" y="'+(c+4)+'" text-anchor="middle">pleine Lune</text>'; }
    items.sort(function(a,b){ return b.f.w*b.f.h - a.f.w*a.f.h; }).forEach(function(o){
      var w = Math.max(2.5, o.f.w*k), h = Math.max(2.5, o.f.h*k), x = c + (o.f.dx||0)*k - w/2, y = c - h/2;
      var st = 'fill="'+o.it.color+'" fill-opacity="0.14" stroke="'+o.it.color+'" stroke-width="1.8" data-inst="'+o.it.id+'"';
      s += o.f.circle ? '<circle cx="'+c+'" cy="'+c+'" r="'+(w/2)+'" '+st+'/>' : '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" '+st+'/>';
    });
    var nice = [1,2,5,10,20,30,60,120,300,600,1200,1800,3600], bar = nice[0];
    for (var i=0;i<nice.length;i++) if (nice[i]*k <= S*0.34) bar = nice[i];
    s += '<line class="fov-bar" x1="'+pad+'" y1="'+(S-12)+'" x2="'+(pad+bar*k)+'" y2="'+(S-12)+'"/><text class="fov-barlab" x="'+(pad+bar*k+6)+'" y="'+(S-8)+'">'+ang(bar)+'</text></svg>';
    var leg = '<ul class="fov-leg">' + items.map(function(o){
      return '<li data-inst="'+o.it.id+'"'+(o.it.id===sel?' class="sel"':'')+'><i style="background:'+o.it.color+'"></i>'+esc(o.it.name + (o.f.l && o.f.l!==o.it.name ? ', '+o.f.l : ''))+'<span>'+(o.f.circle ? 'Ø '+ang(o.f.w) : ang(o.f.w)+' × '+ang(o.f.h))+'</span></li>';
    }).join('') + '</ul>';
    return '<div class="fov">' + s + leg + '</div>';
  }

  /* ---------- filtres ---------- */
  function filterPanel(tid, iid, idx){
    var it = get(tid, iid); if (!it || !it.filters || !it.filters.length) return '';
    var lo = Infinity, hi = 0;
    it.filters.forEach(function(f){ var p = span(f); lo = Math.min(lo, p[0]); hi = Math.max(hi, p[1]); });
    var W = 560, ax = new Axis(lo*0.92, hi*1.08, 14, W-14), H = 74;
    var s = '<svg class="mini" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Position des filtres en longueur d\'onde">' + GRAD + visibleBand(ax, 8, 40);
    ax.ticks.forEach(function(v){ var x = ax.x(v); s += '<line class="cov-grid" x1="'+x+'" y1="8" x2="'+x+'" y2="48"/><text class="cov-tick" x="'+x+'" y="62" text-anchor="middle">'+(v<1 ? num(v*1000,0)+' nm' : num(v,2)+' µm')+'</text>'; });
    s += '<line class="cov-axis" x1="14" y1="48" x2="'+(W-14)+'" y2="48"/>';
    it.filters.forEach(function(f, i){
      var p = span(f), a = ax.x(p[0]), z = ax.x(p[1]), on = i===idx;
      s += '<rect data-filter="'+i+'" x="'+a+'" y="'+(on?12:20)+'" width="'+Math.max(2.5, z-a)+'" height="'+(on?36:28)+'" rx="1.5" fill="'+(on ? '#FFD21F' : it.color)+'" fill-opacity="'+(on?1:0.3)+'"'+(on?' stroke="#14171A" stroke-width="1.5"':'')+' style="cursor:pointer"/>';
    });
    s += '</svg>';
    var chips = '<div class="chips">' + it.filters.map(function(f, i){ return '<button class="chip'+(i===idx?' on':'')+'" data-filter="'+i+'">'+esc(f.n)+'</button>'; }).join('') + '</div>';
    var f = it.filters[idx], det = '';
    if (f){
      var p = span(f);
      det = '<b>'+esc(f.n)+'</b> ' + (f.lo != null ? wl(f.lo)+' – '+wl(f.hi) : (f.k==='LP' ? 'transmet au-delà de '+wl(f.c) : 'centré vers '+wl(f.c))) +
            ', ' + KIND[f.k] + (f.g ? ', ' + esc(f.g) : '') + (f.note ? ' (' + esc(f.note) + ')' : '') + '.';
    }
    var hasF = it.filters.some(function(f){ return f.lo == null; });
    return chips + '<div class="svgwrap">' + s + '</div><div class="filter-detail">' + det + '</div>' +
      (hasF ? '<div class="cap">Les largeurs dessinées sont schématiques : elles suivent la classe du filtre (W large, M moyenne, N étroite), pas sa courbe de transmission.</div>' : '');
  }

  function code(text){ copyStore.push(text); return '<div class="codewrap"><pre class="code">'+esc(text)+'</pre><button class="copy" data-copy="'+(copyStore.length-1)+'">Copier</button></div>'; }
  function table(rows, nums){ return '<div class="stable">' + rows.map(function(r){ return '<div class="srow"><div class="k">'+esc(r[0])+'</div><div class="v">'+esc(r[1]).split(' · ').join('<br>')+(nums ? mark(r, nums) : '')+'</div></div>'; }).join('') + '</div>'; }
  function mark(r, nums){
    var ks = [].concat(r[2] || []);
    if (ks.length) return '<sup class="ref">' + ks.map(function(k){ return nums[k]; }).join(',') + '</sup>';
    return /\d/.test(r[1]) ? '<sup class="ref nv" title="Valeur pas encore vérifiée face à une source primaire">?</sup>' : '';
  }
  /* sources des caractéristiques (même principe que les fiches : numéros dans l'ordre d'apparition, « ? » sans source) */
  function srcList(d, nums){
    var keys = Object.keys(nums).sort(function(a, b){ return nums[a] - nums[b]; });
    var c = d.checked.split('-'), when = OBS_LANG === 'en' ? d.checked : c[2] + '/' + c[1] + '/' + c[0];
    return '<ol class="refs">' + keys.map(function(k){ var x = d.refs[k]; return '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc(x.t) + '</a> <span>' + esc(x.p) + '</span></li>'; }).join('') +
      '</ol><p class="source-note">Valeurs vérifiées le ' + when + ' face aux sources ci-dessus. Un « ? » signale une valeur pas encore confrontée à une source primaire.</p>';
  }
  function host(u){ return u.replace(/^https?:\/\//,'').replace(/\/.*$/,''); }

  /* ---------- observations réelles (lot E) : data/manifest.json est produit par tools/data/fetch_data.py ---------- */
  function ticks(lo, hi, n){
    var span = hi - lo, step = Math.pow(10, Math.floor(Math.log(span/n)/Math.LN10)), e = span/n/step;
    step *= e >= 5 ? 5 : e >= 2 ? 2 : 1;
    var out = []; for (var v = Math.ceil(lo/step)*step; v <= hi + step*1e-6; v += step) out.push(Math.abs(v) < step*1e-6 ? 0 : v);
    return { v:out, step:step };
  }
  function tl(v, step){
    var a = Math.abs(v); if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(1).replace('.', ',').replace('e', '·10^').replace('^+', '^');
    var d = Math.max(0, -Math.floor(Math.log(step)/Math.LN10 + 1e-9)); return num(v, Math.min(d, 4)).replace('-', '−');
  }
  function plot(j){
    var W = 560, H = 330, L = 62, R = 12, Tp = 12, B = 42, n = j.x.length, i;
    /* très petites ou très grandes valeurs : la puissance de dix passe dans le titre de l'axe */
    var amax = 0; for (i=0;i<n;i++) amax = Math.max(amax, Math.abs(j.y[i])); if (j.ymax != null) amax = Math.abs(j.ymax);
    var pw = (amax > 0 && (amax < 1e-2 || amax >= 1e5)) ? Math.floor(Math.log(amax)/Math.LN10) : 0, ylab = j.ylabel;
    if (pw){ var sc = Math.pow(10, -pw), sup = String(pw).replace('-', '⁻').replace(/\d/g, function(d){ return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]; }); j = { type:j.type, x:j.x, y:j.y.map(function(v){ return v*sc; }), ymin:j.ymin != null ? j.ymin*sc : null, ymax:j.ymax != null ? j.ymax*sc : null, invertY:j.invertY, binw:j.binw, xlabel:j.xlabel, ylabel:j.ylabel }; ylab = j.ylabel.replace(/^([^(]*)\(/, '$1(10' + sup + ' '); }
    var xlab = j.xlabel, xs = j.x;
    if (/µm\)/.test(xlab) && xs[n-1] < 1 && xs[0] < 1){ xs = xs.map(function(v){ return v*1000; }); xlab = xlab.replace('µm)', 'nm)'); j = { type:j.type, x:xs, y:j.y, ymin:j.ymin, ymax:j.ymax, invertY:j.invertY, binw:j.binw, xlabel:xlab, ylabel:j.ylabel }; }
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (i=0;i<n;i++){ if (j.x[i] < x0) x0 = j.x[i]; if (j.x[i] > x1) x1 = j.x[i]; if (j.y[i] < y0) y0 = j.y[i]; if (j.y[i] > y1) y1 = j.y[i]; }
    if (j.type === 'hist'){ x0 -= j.binw/2; x1 += j.binw/2; y0 = 0; y1 *= 1.05; }
    else if (j.type === 'scatter'){ var px = (x1-x0)*0.03, py = (y1-y0)*0.03; x0 -= px; x1 += px; y0 -= py; y1 += py; }
    if (j.ymin != null) y0 = j.ymin; if (j.ymax != null) y1 = j.ymax;
    function X(v){ return L + (v-x0)/(x1-x0)*(W-L-R); }
    function Y(v){ var t = (v-y0)/(y1-y0); if (j.invertY) t = 1-t; return H - B - Math.max(-0.02, Math.min(1.02, t))*(H-B-Tp); }
    var s = '<svg class="optic" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(j.ylabel+' en fonction de '+j.xlabel)+'">';
    var tx = ticks(x0, x1, 6), ty = ticks(y0, y1, 5);
    tx.v.forEach(function(v){ s += '<line class="cov-grid" x1="'+X(v)+'" y1="'+Tp+'" x2="'+X(v)+'" y2="'+(H-B)+'"/><text class="cov-tick" x="'+X(v)+'" y="'+(H-B+15)+'" text-anchor="middle">'+tl(v, tx.step)+'</text>'; });
    ty.v.forEach(function(v){ s += '<line class="cov-grid" x1="'+L+'" y1="'+Y(v)+'" x2="'+(W-R)+'" y2="'+Y(v)+'"/><text class="cov-tick" x="'+(L-6)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+tl(v, ty.step)+'</text>'; });
    s += '<line class="cov-axis" x1="'+L+'" y1="'+(H-B)+'" x2="'+(W-R)+'" y2="'+(H-B)+'"/><line class="cov-axis" x1="'+L+'" y1="'+Tp+'" x2="'+L+'" y2="'+(H-B)+'"/>';
    s += '<text class="cov-unit" x="'+((L+W-R)/2)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(j.xlabel)+'</text><text class="cov-unit" transform="translate(13 '+((Tp+H-B)/2)+') rotate(-90)" text-anchor="middle">'+esc(ylab)+'</text>';
    if (j.type === 'line'){ var d = '', gapx = 6*(x1-x0)/n; /* trou entre détecteurs : on lève le crayon */ for (i=0;i<n;i++) d += ((i && j.x[i]-j.x[i-1] < gapx) ? 'L' : 'M') + X(j.x[i]).toFixed(1) + ' ' + Y(j.y[i]).toFixed(1); s += '<path d="'+d+'" fill="none" stroke="#3D6BE0" stroke-width="1.1" stroke-linejoin="round"/>'; }
    else if (j.type === 'scatter'){ for (i=0;i<n;i++) s += '<circle cx="'+X(j.x[i]).toFixed(1)+'" cy="'+Y(j.y[i]).toFixed(1)+'" r="1.3" fill="#3D6BE0" fill-opacity="0.5"/>'; }
    else { var bw = (X(x0 + j.binw) - X(x0)); for (i=0;i<n;i++){ var yy = Y(j.y[i]); s += '<rect x="'+(X(j.x[i]) - bw/2 + 0.5).toFixed(1)+'" y="'+yy.toFixed(1)+'" width="'+Math.max(1, bw-1).toFixed(1)+'" height="'+(H-B-yy).toFixed(1)+'" fill="#3D6BE0"/>'; } }
    return '<div class="svgwrap">' + s + '</svg></div>';
  }
  function realBlock(m){
    var body = m.type === 'image'
      ? '<img class="real-img" src="data/'+esc(m.file)+'" width="'+m.width+'" height="'+m.height+'" loading="lazy" alt="'+esc(m.title)+'">'
      : '<div data-real-plot="'+esc(m.file)+'"><div class="cap">Chargement des mesures…</div></div>';
    return '<div class="real-item"><div class="ex-head"><span class="ex-title">'+esc(m.title)+'</span><span class="tag real">données réelles</span></div>' + body +
      '<div class="cap">'+esc(m.caption)+(m.type === 'image' && /MAST/.test(m.meta[0][1]) ? ' Les zones blanches sont hors du champ observé.' : '')+' Crédit : '+esc(m.credit)+'. Récupéré dans l\'archive le '+esc(m.fetched.split('-').reverse().join('/'))+'.</div>' +
      '<details class="real-meta"><summary>Provenance et traitement</summary>' + table(m.meta) +
      '<div class="lnks"><a class="lnk" href="'+esc(m.url)+'" target="_blank" rel="noopener">'+(/proposal|program/.test(m.url) ? 'Voir le programme d\'observation' : 'Ouvrir l\'archive')+'<em>'+esc(host(m.url))+'</em></a></div></details></div>';
  }
  /* un instrument peut avoir plusieurs produits : clés « obs/inst:image », « obs/inst:spectre », puis « obs/inst » */
  function real(tid, iid){
    var D = window.OBS_DATA || {}, base = tid + '/' + iid, list = [];
    [':image', ':spectre', ''].forEach(function(sfx){ if (D[base + sfx]) list.push(D[base + sfx]); });
    if (!list.length) return '';
    return '<div class="isec"><h4>'+(list.length > 1 ? 'Observations réelles' : 'Observation réelle')+'</h4>' + list.map(realBlock).join('') + '</div>';
  }

  function overview(tid){
    var d = INST_DATA[tid], s = '';
    s += '<div class="inst-head"><div class="inst-h"><div class="inst-name">Instruments de '+NAMES[tid]+'</div><div class="inst-full">'+d.instruments.length+' instruments ou fonctions. Cliquer une ligne du graphique ou une case pour ouvrir le détail.</div></div><p class="inst-sum">'+esc(d.summary)+'</p></div>';
    s += '<div class="inst-cols">';
    s += '<div class="isec"><h4>Couverture spectrale</h4>'+coverage(tid, null)+'</div>';
    var f = fovBlock(tid, null);
    if (f) s += '<div class="isec"><h4>Champs de vue, à la même échelle</h4>'+f+'<div class="cap">Empreinte de chaque instrument sur le ciel. '+(tid==='euclid'||tid==='gaia' ? 'Le disque en pointillé donne la taille apparente de la pleine Lune (31′).' : 'À titre de repère, la pleine Lune mesure environ 1 860″ : elle déborderait largement de ce cadre.')+'</div></div>';
    s += '<div class="isec wide"><h4>Instruments</h4><div class="icards">' + d.instruments.map(function(it){
      var r = it.bands ? wl(Math.min.apply(null, it.bands.map(function(b){return b.lo;}))) + ' – ' + wl(Math.max.apply(null, it.bands.map(function(b){return b.hi;}))) : 'guidage';
      return '<button class="icard" style="--c:'+it.color+'" data-inst="'+it.id+'"><span class="ic-n">'+esc(it.name)+'</span><span class="ic-k">'+esc(it.kind)+'</span><span class="ic-r">'+r+'</span></button>';
    }).join('') + '</div></div>';
    s += '<div class="isec wide"><h4>Archives et documentation</h4><div class="archs">' + d.archives.map(function(a){
      return '<a class="arch" href="'+esc(a.url)+'" target="_blank" rel="noopener"><span class="a-l">'+esc(a.label)+'</span><span class="a-d">'+esc(a.desc)+'</span><span class="a-u">'+esc(host(a.url))+'</span></a>';
    }).join('') + '</div></div></div>';
    return s;
  }

  function detail(tid, iid, fidx){
    var d = INST_DATA[tid], it = get(tid, iid), s = '';
    s += '<div class="inst-head"><div class="inst-h"><div class="inst-name">'+esc(it.name)+'</div><div class="inst-full">'+esc(it.full)+'</div><span class="kind">'+esc(it.kind)+'</span></div><div><p class="inst-sum">'+esc(it.summary)+'</p>';
    if (it.bands) s += '<div class="inst-range">' + it.bands.map(function(b){ return '<span class="rng" style="--c:'+it.color+'"><b>'+esc(b.l)+'</b> '+wl(b.lo)+' – '+wl(b.hi)+'</span>'; }).join('') + '</div>';
    s += '</div></div><div class="inst-cols">';
    var nums = {}, nk = 0; it.specs.forEach(function(r){ [].concat(r[2] || []).forEach(function(x){ if (!nums[x]) nums[x] = ++nk; }); });
    s += '<div class="isec"><h4>Caractéristiques</h4>'+table(it.specs, nums)+'</div>';
    if (it.bands) s += '<div class="isec"><h4>Place dans le spectre</h4>'+coverage(tid, iid)+'</div>';
    if (it.filters && it.filters.length) s += '<div class="isec"><h4>'+esc(it.filtersTitle||'Filtres')+'</h4><div id="fsec">'+filterPanel(tid, iid, fidx||0)+'</div></div>';
    var f = fovBlock(tid, iid);
    if (f) s += '<div class="isec"><h4>Champ de vue</h4>'+f+'</div>';
    s += real(tid, iid);
    if (it.products) s += '<div class="isec"><h4>Produits de données</h4>'+table(it.products)+'</div>';
    if (it.example){
      s += '<div class="isec"><h4>Exemple de données</h4><div class="ex-head"><span class="ex-title">'+esc(it.example.title)+'</span><span class="tag '+(it.example.real?'real':'illus')+'">'+(it.example.real?'données réelles':'structure réelle, valeurs illustratives')+'</span></div>'+code(it.example.text)+'<div class="cap">'+esc(it.example.caption)+'</div></div>';
    }
    if (it.code) s += '<div class="isec"><h4>Accéder aux données</h4><div class="ex-head"><span class="ex-title">'+esc(it.code.title)+'</span></div>'+code(it.code.text)+'</div>';
    if (it.notes && it.notes.length) s += '<div class="isec"><h4>À savoir</h4><ul class="notes">'+it.notes.map(function(n){ return '<li>'+esc(n)+'</li>'; }).join('')+'</ul></div>';
    if (nk) s += '<div class="isec"><h4>Sources</h4>'+srcList(d, nums)+'</div>';
    s += '<div class="isec"><h4>Archive et documentation</h4><div class="lnks">' +
      [{l:d.archives[0].label, u:d.archives[0].url}].concat(it.docs||[]).map(function(l){ return '<a class="lnk" href="'+esc(l.u)+'" target="_blank" rel="noopener">'+esc(l.l)+'<em>'+esc(host(l.u))+'</em></a>'; }).join('') + '</div></div></div>';
    return s;
  }

  /* ---------- comparaison entre observatoires ---------- */
  var OBS = { hubble:'#3D6BE0', jwst:'#DB5A14', euclid:'#0F987A', gaia:'#9A52D6' };
  var SAMP = { hubble:{ wfc3:'0,040″ (UVIS) · 0,13″ (IR)', acs:'0,05″ (WFC)', stis:'0,025″ (MAMA) · 0,05″ (CCD)', cos:'sans objet', fgs:'sans objet' },
               jwst:{ nircam:'0,031″ (SW) · 0,063″ (LW)', nirspec:'0,1″', miri:'0,11″', niriss:'0,066″', fgs:'≈ 0,069″' },
               euclid:{ vis:'0,1″', nisp:'0,3″' }, gaia:{ astro:'0,059″ × 0,177″', bprp:'sans objet', rvs:'sans objet' } };
  var RES = { hubble:{ wfc3:'130–210 (grismes IR)', stis:'500 à 114 000', cos:'1 500 à 24 000' },
              jwst:{ nircam:'≈ 1 600 (grisme LW)', nirspec:'100 à 2 700', miri:'100 à 3 250', niriss:'150 à 700' },
              euclid:{ nisp:'> 480 (grismes rouges)' }, gaia:{ bprp:'prisme, 3–27 nm/px', rvs:'≈ 11 700' } };
  function range(it){ if (!it.bands) return 'guidage'; return wl(Math.min.apply(null, it.bands.map(function(b){return b.lo;}))) + ' – ' + wl(Math.max.apply(null, it.bands.map(function(b){return b.hi;}))); }
  function bigFov(it){ if (!it.fov || !it.fov.length) return 'sans objet'; var f = it.fov.slice().sort(function(a,b){ return b.w*b.h - a.w*a.h; })[0]; var n = it.fov.filter(function(x){ return x.w===f.w && x.h===f.h; }).length; return (n > 1 ? n+' × ' : '') + (f.circle ? 'Ø '+ang(f.w) : ang(f.w)+' × '+ang(f.h)); }

  function cmpCoverage(){
    var W = 1000, L = 172, R = 14, ax = new Axis(0.09, 30, L, W-R), y = 40, rows = [], seps = [];
    ORDER.forEach(function(tid){
      var first = true; seps.push(y);
      INST_DATA[tid].instruments.forEach(function(it){
        if (!it.bands) return;
        var lanes = [], placed = it.bands.map(function(b){
          var a = ax.x(b.lo), z = ax.x(b.hi), lane = 0;
          for (;; lane++){ var clash = (lanes[lane]||[]).some(function(o){ var ov = Math.min(z,o[1]) - Math.max(a,o[0]); return ov > 0.4*Math.min(z-a, o[1]-o[0]); }); if (!clash) break; }
          (lanes[lane] = lanes[lane] || []).push([a,z]); return { b:b, a:a, z:z, lane:lane };
        });
        var h = lanes.length*16 + 8; rows.push({ tid:tid, it:it, y:y, h:h, placed:placed, first:first }); first = false; y += h;
      });
      y += 6;
    });
    var H = y + 30, s = '<svg class="cov big" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Couverture spectrale de tous les instruments">' + GRAD + visibleBand(ax, 32, y-32);
    [['ultraviolet',0.09,0.38],['visible',0.38,0.75],['proche infrarouge',0.75,5],['infrarouge moyen',5,30]].forEach(function(r){
      s += '<text class="cov-reg" x="'+((ax.x(r[1])+ax.x(r[2]))/2)+'" y="14" text-anchor="middle">'+r[0]+'</text>';
      if (r[1] > 0.09) s += '<line class="cov-grid" stroke-dasharray="3 3" x1="'+ax.x(r[1])+'" y1="20" x2="'+ax.x(r[1])+'" y2="'+y+'"/>';
    });
    ax.ticks.forEach(function(v){ var x = ax.x(v); s += '<line class="cov-grid" x1="'+x+'" y1="32" x2="'+x+'" y2="'+y+'"/><text class="cov-tick" x="'+x+'" y="'+(y+15)+'" text-anchor="middle">'+num(v,2)+'</text>'; });
    s += '<line class="cov-axis" x1="'+L+'" y1="'+y+'" x2="'+(W-R)+'" y2="'+y+'"/><text class="cov-unit" x="'+(W-R)+'" y="'+(y+28)+'" text-anchor="end">longueur d\'onde (µm), échelle logarithmique</text>';
    seps.forEach(function(v){ s += '<line class="cov-sep" x1="0" y1="'+(v-3)+'" x2="'+(W-R)+'" y2="'+(v-3)+'"/>'; });
    rows.forEach(function(r){
      s += '<g class="cov-row" data-jump="'+r.tid+':'+r.it.id+'"><rect x="0" y="'+r.y+'" width="'+W+'" height="'+r.h+'" fill="transparent"/>';
      if (r.first) s += '<text class="cov-obs" x="2" y="'+(r.y+16)+'">'+NAMES[r.tid]+'</text>';
      s += '<text class="cov-lab" x="80" y="'+(r.y + r.h/2 + 4)+'">'+esc(r.it.name)+'</text>';
      r.placed.forEach(function(p){
        var yy = r.y + 4 + p.lane*16, w = Math.max(3, p.z - p.a);
        s += '<rect x="'+p.a+'" y="'+yy+'" width="'+w+'" height="13" rx="2" fill="'+OBS[r.tid]+'"><title>'+esc(NAMES[r.tid]+' '+r.it.name+' '+p.b.l+' : '+wl(p.b.lo)+' – '+wl(p.b.hi))+'</title></rect>';
        if (w > p.b.l.length*6.4 + 8) s += '<text class="cov-band" x="'+(p.a + w/2)+'" y="'+(yy+10)+'" text-anchor="middle">'+esc(p.b.l)+'</text>';
      });
      s += '</g>';
    });
    return '<div class="svgwrap">' + s + '</svg></div>';
  }

  function cmpFov(tids, legendMin){
    var items = [];
    tids.forEach(function(tid){ INST_DATA[tid].instruments.forEach(function(it){ (it.fov||[]).forEach(function(f){ items.push({ tid:tid, it:it, f:f }); }); }); });
    var ext = 0; items.forEach(function(o){ ext = Math.max(ext, Math.abs(o.f.dx||0)*2 + o.f.w, o.f.h); });
    var moon = ext > 1200, S = 300, pad = 22, k = (S - 2*pad)/ext, c = S/2;
    var s = '<svg class="fov-svg" viewBox="0 0 '+S+' '+(S+18)+'" role="img" aria-label="Champs de vue à la même échelle"><rect x="0.5" y="0.5" width="'+(S-1)+'" height="'+(S-1)+'" fill="#F7F8F8" stroke="#98A1A7"/>';
    if (moon){ s += '<circle cx="'+c+'" cy="'+c+'" r="'+(1865/2*k)+'" fill="none" stroke="#3A4147" stroke-dasharray="3 3"/><text class="fov-barlab" x="'+c+'" y="'+(c - 1865/2*k + 14)+'" text-anchor="middle">pleine Lune</text>'; }
    items.sort(function(a,b){ return b.f.w*b.f.h - a.f.w*a.f.h; }).forEach(function(o){
      var w = Math.max(2.5, o.f.w*k), h = Math.max(2.5, o.f.h*k), x = c + (o.f.dx||0)*k - w/2, yy = c - h/2;
      var st = 'fill="'+OBS[o.tid]+'" fill-opacity="0.12" stroke="'+OBS[o.tid]+'" stroke-width="1.6" data-jump="'+o.tid+':'+o.it.id+'"';
      s += o.f.circle ? '<circle cx="'+c+'" cy="'+c+'" r="'+(w/2)+'" '+st+'/>' : '<rect x="'+x+'" y="'+yy+'" width="'+w+'" height="'+h+'" '+st+'/>';
    });
    var nice = [1,2,5,10,20,30,60,120,300,600,1200,1800,3600], bar = nice[0];
    for (var i=0;i<nice.length;i++) if (nice[i]*k <= S*0.34) bar = nice[i];
    s += '<line class="fov-bar" x1="'+pad+'" y1="'+(S-12)+'" x2="'+(pad+bar*k)+'" y2="'+(S-12)+'"/><text class="fov-barlab" x="'+(pad+bar*k+6)+'" y="'+(S-8)+'">'+ang(bar)+'</text></svg>';
    var seen = {}, leg = '<ul class="fov-leg">' + items.filter(function(o){ var key = o.tid+o.it.id+o.f.w+'x'+o.f.h; if (seen[key] || Math.max(o.f.w, o.f.h) < legendMin) return false; return (seen[key] = true); }).map(function(o){
      return '<li data-jump="'+o.tid+':'+o.it.id+'"><i style="background:'+OBS[o.tid]+'"></i>'+esc(NAMES[o.tid]+' '+o.it.name + (o.f.l && o.f.l!==o.it.name && !/^Module|^Champ/.test(o.f.l) ? ', '+o.f.l : ''))+'<span>'+(o.f.circle ? 'Ø '+ang(o.f.w) : ang(o.f.w)+' × '+ang(o.f.h))+'</span></li>';
    }).join('') + '</ul>';
    return '<div class="fov">' + s + leg + '</div>';
  }

  function compare(){
    var s = '<div class="inst-head"><div class="inst-h"><div class="inst-name">Comparer les instruments</div><div class="inst-full">Les quatre observatoires sur les mêmes axes. Cliquer un instrument ouvre sa fiche.</div></div>' +
      '<p class="inst-sum">Hubble couvre l\'ultraviolet et le visible avec une grande finesse sur un champ minuscule. Webb prolonge vers l\'infrarouge moyen. Euclid et Gaia font l\'inverse : un domaine spectral étroit, mais un champ des centaines de fois plus grand, pour cartographier le ciel entier.</p></div>';
    var key = '<ul class="obs-key">' + ORDER.map(function(t){ return '<li><i style="background:'+OBS[t]+'"></i>'+NAMES[t]+'</li>'; }).join('') + '</ul>';
    s += '<div class="isec"><h4>Couverture spectrale</h4>'+cmpCoverage()+'</div>';
    s += '<div class="isec"><h4>Champs de vue, à la même échelle</h4>'+key+'<div class="cmp-figs"><div><h5>Les quatre observatoires</h5>'+cmpFov(ORDER, 600)+'</div><div><h5>Agrandissement : Hubble et Webb seuls</h5>'+cmpFov(['hubble','jwst'], 20)+'</div></div>' +
      '<div class="cap">À gauche, les champs de Hubble et de Webb se réduisent au petit amas de rectangles au centre : chacun tient plusieurs centaines de fois dans celui d\'Euclid. Les champs d\'Euclid et de Gaia sont des valeurs approchées.</div></div>';
    var rows = '';
    ORDER.forEach(function(tid){
      INST_DATA[tid].instruments.forEach(function(it, i){
        rows += '<tr data-jump="'+tid+':'+it.id+'"'+(i===0?' class="first"':'')+'><td class="o" style="--c:'+OBS[tid]+'">'+(i===0?NAMES[tid]:'')+'</td><td class="n">'+esc(it.name)+'</td><td>'+esc(it.kind)+'</td><td>'+range(it)+'</td><td>'+bigFov(it)+'</td><td>'+esc((SAMP[tid]||{})[it.id]||'sans objet').split(' · ').join('<br>')+'</td><td>'+esc((RES[tid]||{})[it.id]||'imagerie seule')+'</td></tr>';
      });
    });
    s += Optics.compareFocal(OBS, NAMES);
    s += Orbits.renderCompare(OBS, NAMES);
    s += '<div class="isec"><h4>Tableau comparatif</h4><div class="tablewrap"><table class="ctable"><thead><tr><th>Observatoire</th><th>Instrument</th><th>Type</th><th>Domaine spectral</th><th>Champ de vue</th><th>Échantillonnage par pixel</th><th>Résolution spectrale R</th></tr></thead><tbody>'+rows+'</tbody></table></div>' +
      '<div class="cap">R = λ/Δλ. « Imagerie seule » : l\'instrument n\'a pas de mode spectroscopique.</div></div>';
    return s;
  }
  function pillsFor(cur){ return ORDER.map(function(t){ return '<button class="pill'+(t===cur?' on':'')+'" data-tele="'+t+'">'+NAMES[t]+'</button>'; }).join('') + '<button class="pill'+(cur==='comparer'?' on':'')+'" data-tele="comparer">Comparer</button>'; }
  function renderCompare(){
    copyStore = [];
    var nav = '<button class="nav-i on" data-inst=""><span class="n">Comparaison</span><span class="k">Spectre, champs de vue, tableau</span></button>' +
      ORDER.map(function(t){ return '<button class="nav-i" style="--c:'+OBS[t]+'" data-tele="'+t+'"><span class="n">'+NAMES[t]+'</span><span class="k">'+INST_DATA[t].instruments.map(function(i){ return i.name; }).join(', ')+'</span></button>'; }).join('');
    return { pills:pillsFor('comparer'), nav:nav, main:compare(), sel:null };
  }

  function render(tid, sel, fidx){
    copyStore = [];
    var d = INST_DATA[tid];
    if (sel && sel !== 'optique' && sel !== 'orbite' && !get(tid, sel)) sel = null;
    var pills = pillsFor(tid);
    var nav = '<button class="nav-i'+(!sel?' on':'')+'" data-inst=""><span class="n">Vue d\'ensemble</span><span class="k">Spectre, champs de vue, archives</span></button>' +
      '<button class="nav-i'+(sel==='optique'?' on':'')+'" data-inst="optique"><span class="n">Trajet de la lumière</span><span class="k">Schéma optique, plan focal</span></button>' +
      '<button class="nav-i'+(sel==='orbite'?' on':'')+'" data-inst="orbite"><span class="n">Orbite</span><span class="k">Trajectoire réelle, balayage</span></button>' +
      d.instruments.map(function(it){ return '<button class="nav-i'+(it.id===sel?' on':'')+'" style="--c:'+it.color+'" data-inst="'+it.id+'"><span class="n">'+esc(it.name)+'</span><span class="k">'+esc(it.kind)+'</span></button>'; }).join('');
    return { pills:pills, nav:nav, main: sel === 'orbite' ? Orbits.render(tid, NAMES[tid]) : sel === 'optique' ? Optics.render(tid, NAMES[tid]) : sel ? detail(tid, sel, fidx) : overview(tid), sel:sel };
  }

  return { ORDER:ORDER, NAMES:NAMES, OBS:OBS, plot:plot, render:render, renderCompare:renderCompare, filterPanel:filterPanel, getCopy:function(i){ return copyStore[i]; } };
})();
