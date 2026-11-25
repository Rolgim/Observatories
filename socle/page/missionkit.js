/* =================================================================
   BOÎTE À OUTILS de la page « Mission et instruments » (MissionKit), commune aux sites de la famille.
   Mise en forme des nombres et longueurs d'onde, numéros de sources (règle 1), couverture spectrale,
   briques de mise en page, boutons « Copier » et renvois aux sources. Chaque site garde son propre
   src/missionpage.js (catalogues, chaîne de traitement, orbite), qui reprend ces fonctions.
   Données lues : INST_DATA, INST_TYPES, MISSION, MISSION_REFS, DATA_FILES.
================================================================= */
var MissionKit = (function(){
'use strict';
function en(){ return OBS_LANG === 'en'; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function num(v, d){ var t = v.toFixed(d); if (t.indexOf('.') >= 0) t = t.replace(/0+$/,'').replace(/\.$/,''); return en() ? t : t.replace('.', ','); }
function big(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, en() ? ',' : '\u202f'); }
function host(u){ return u.replace(/^https?:\/\//,'').replace(/\/.*$/,''); }
/* longueur d'onde en µm → texte lisible (nm, µm, mm, cm, m) */
function wl(um){
  if (um < 1) return num(um * 1000, um * 1000 < 100 ? 1 : 0) + ' nm';
  if (um < 1000) return num(um, um < 10 ? 2 : 1) + ' µm';
  if (um < 1e4) return num(um / 1000, 1) + ' mm';
  if (um < 1e6) return num(um / 1e4, 1) + ' cm';
  return num(um / 1e6, 1) + ' m';
}
function span(lo, hi){ var a = wl(lo), b = wl(hi); return a === b ? a : a + ' – ' + b; }
function range(it){ if (!it.bands || !it.bands.length) return L('hors spectre', 'not spectral');
  var lo = Math.min.apply(null, it.bands.map(function(b){ return b.lo; })), hi = Math.max.apply(null, it.bands.map(function(b){ return b.hi; }));
  return span(lo, hi); }
function color(it){ return (INST_TYPES[it.type] || INST_TYPES.radio).c; }
function kind(it){ return (INST_TYPES[it.type] || INST_TYPES.radio).l; }

/* ---------- sources : refs de la mission (MISSION), des instruments (INST_DATA), de la fiche (MISSIONS) et générales ---------- */
function refsOf(m){
  var r = {}, k, all = [m.refs || {}, (INST_DATA[m.id] || {}).refs || {}, (MISSION[m.id] || {}).refs || {}, MISSION_REFS];
  all.forEach(function(o){ for (k in o) r[k] = o[k]; }); return r;
}
function Marks(m){
  var refs = refsOf(m), nums = {}, n = 0;
  return {
    mark:function(keys){ var ks = [].concat(keys || []).filter(function(x){ return refs[x]; }); if (!ks.length) return '';
      return '<sup class="ref">' + ks.map(function(x){ if (!nums[x]) nums[x] = ++n; return '<a href="#ref-' + nums[x] + '" data-ref="' + nums[x] + '" aria-label="' + esc(L('source ', 'source ') + nums[x]) + '">' + nums[x] + '</a>'; }).join(',') + '</sup>'; },
    list:function(checked){
      var keys = Object.keys(nums).sort(function(a, b){ return nums[a] - nums[b]; }); if (!keys.length) return '';
      var c = (checked || '').split('-');
      return '<div class="isec wide"><h3>' + L('Sources', 'Sources') + '</h3><ol class="refs">' + keys.map(function(k){ var x = refs[k];
        return '<li id="ref-' + nums[k] + '"><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc(OBS_T(x.t)) + '</a> <span>' + esc(x.p) + '</span></li>'; }).join('') + '</ol>' +
        (checked ? '<p class="source-note">' + (en() ? 'Checked against the sources above on ' + checked + '.' : 'Vérifié le ' + c[2] + '/' + c[1] + '/' + c[0] + ' face aux sources ci-dessus.') + '</p>' : '') + '</div>';
    }
  };
}

/* ---------- couverture spectrale : axe logarithmique de l'ultraviolet à la radio ---------- */
var TICKS = [0.1, 0.3, 1, 3, 10, 30, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8];
function coverage(m, sel){
  var list = INST_DATA[m.id].instruments.filter(function(it){ return it.bands && it.bands.length; });
  if (!list.length) return '';
  var lo = Infinity, hi = 0; list.forEach(function(it){ it.bands.forEach(function(b){ lo = Math.min(lo, b.lo); hi = Math.max(hi, b.hi); }); });
  lo = Math.pow(10, Math.floor(Math.log(lo) / Math.LN10 * 2) / 2); hi = Math.pow(10, Math.ceil(Math.log(hi) / Math.LN10 * 2) / 2);
  var W = 560, Lm = 80, R = 14, a = Math.log(lo), b = Math.log(hi);
  function X(v){ return Lm + (Math.log(Math.max(lo, Math.min(hi, v))) - a) / (b - a) * (W - Lm - R); }
  var y = 30, rows = list.map(function(it){ var r = { it:it, y:y, h:it.bands.length > 1 && overlap(it.bands) ? it.bands.length * 15 + 9 : 24 }; y += r.h; return r; });
  function overlap(bs){ for (var i = 1; i < bs.length; i++) if (bs[i].lo < bs[i - 1].hi) return true; return false; }
  var s = '<svg class="cov" viewBox="0 0 ' + W + ' ' + (y + 34) + '" role="group" aria-label="' + esc(L('Couverture spectrale des instruments de ', 'Spectral coverage of the instruments of ') + m.short) + '">' +
    '<defs><linearGradient id="gvis" x1="0" x2="1"><stop offset="0" stop-color="#7a5cff"/><stop offset="0.25" stop-color="#3fa0ff"/><stop offset="0.5" stop-color="#5fe07a"/><stop offset="0.72" stop-color="#ffd85a"/><stop offset="1" stop-color="#ff5a4a"/></linearGradient></defs>';
  if (lo < 0.75 && hi > 0.38){ s += '<rect x="' + X(0.38) + '" y="22" width="' + (X(0.75) - X(0.38)) + '" height="' + (y - 22) + '" fill="url(#gvis)" opacity="0.26"/><text class="cov-vis" x="' + ((X(0.38) + X(0.75)) / 2) + '" y="14" text-anchor="middle">' + L('visible', 'visible') + '</text>'; }
  var last = -99; TICKS.forEach(function(v){ if (v < lo || v > hi) return; var x = X(v); if (x - last < 38) return; last = x;
    s += '<line class="cov-grid" x1="' + x + '" y1="22" x2="' + x + '" y2="' + y + '"/><text class="cov-tick" x="' + x + '" y="' + (y + 15) + '" text-anchor="middle">' + wl(v).replace(/^0,|^0\./, en() ? '0.' : '0,') + '</text>'; });
  s += '<line class="cov-axis" x1="' + Lm + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '"/><text class="cov-unit" x="' + (W - R) + '" y="' + (y + 30) + '" text-anchor="end">' + L('longueur d\'onde, échelle logarithmique', 'wavelength, logarithmic scale') + '</text>';
  rows.forEach(function(r){
    var it = r.it, st = overlap(it.bands);
    s += '<g class="cov-row' + (it.id === sel ? ' sel' : '') + '"><a href="#' + m.id + '-donnees-' + it.id + '" aria-label="' + esc(it.name) + '"><rect x="0" y="' + r.y + '" width="' + W + '" height="' + r.h + '" fill="transparent"/>' +
      '<text class="cov-lab" x="4" y="' + (r.y + r.h / 2 + 4) + '">' + esc(it.name) + '</text>';
    it.bands.forEach(function(bd, i){ var x0 = X(bd.lo), w = Math.max(3, X(bd.hi) - x0), yy = r.y + 5 + (st ? i * 15 : 0);
      s += '<rect x="' + x0.toFixed(1) + '" y="' + yy + '" width="' + w.toFixed(1) + '" height="13" rx="2" fill="' + color(it) + '"' + (sel && it.id !== sel ? ' opacity="0.35"' : '') + '><title>' + esc(it.name + ' ' + bd.l + ' : ' + wl(bd.lo) + ' – ' + wl(bd.hi)) + '</title></rect>'; });
    s += '</a></g>';
  });
  return '<div class="svgwrap">' + s + '</svg></div>';
}

/* ---------- briques ---------- */
function table(rows, mk){
  return '<div class="stable">' + rows.map(function(r){ return '<div class="srow"><div class="k">' + esc(r[0]) + '</div><div class="v">' + esc(OBS_NUM(r[1])) + (mk ? mk.mark(r[2]) : '') + '</div></div>'; }).join('') + '</div>';
}
var copyStore = [];
function reset(){ copyStore = []; }
function code(text){ copyStore.push(text); return '<div class="codewrap"><pre class="code" tabindex="0" aria-label="' + L('Code', 'Code') + '">' + esc(text) + '</pre><button class="copy" data-copy="' + (copyStore.length - 1) + '">' + L('Copier', 'Copy') + '</button></div>'; }
function navItem(m, sec, cur, n, k, c){
  var on = sec === cur, h = '#' + m.id + '-donnees' + (sec ? '-' + sec : '');
  return '<a class="nav-i' + (on ? ' on' : '') + '" href="' + h + '"' + (on ? ' aria-current="page"' : '') + (c ? ' style="--c:' + c + '"' : '') + '><span class="n">' + esc(n) + '</span><span class="k">' + esc(k) + '</span></a>';
}
function get(m, id){ var a = INST_DATA[m.id].instruments; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
function realInst(m){ var key = m.real && m.real.key, d = key && (window.DATA_FILES || {})[key]; if (!d) return null;
  var n = String(d.instrument || '').toUpperCase(); return INST_DATA[m.id].instruments.filter(function(it){ return n.indexOf(it.name.toUpperCase()) >= 0; })[0] || null; }

document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-copy],[data-ref]'); if (!b) return;
  if (b.hasAttribute('data-ref')){ e.preventDefault(); var t = document.getElementById('ref-' + b.getAttribute('data-ref')); if (t){ t.scrollIntoView({ block:'center' }); t.classList.add('hl'); setTimeout(function(){ t.classList.remove('hl'); }, 1500); } return; }
  var txt = copyStore[+b.getAttribute('data-copy')];
  try { navigator.clipboard.writeText(txt).then(function(){ b.textContent = L('Copié', 'Copied'); setTimeout(function(){ b.textContent = L('Copier', 'Copy'); }, 1500); }); } catch(x){}
});
return { en:en, esc:esc, num:num, big:big, host:host, wl:wl, span:span, range:range, color:color, kind:kind, refsOf:refsOf, Marks:Marks, coverage:coverage, table:table, code:code, navItem:navItem, get:get, realInst:realInst, reset:reset };
})();
