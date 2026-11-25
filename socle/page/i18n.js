/* =================================================================
   ANGLAIS — applique les textes de src/en/ quand OBS_LANG vaut « en ».
   1. Contenu structuré (fiches des missions) : remplacé champ par champ avant le premier rendu.
   2. Textes d'interface écrits dans le code ou dans body.html : traduits par dictionnaire (EN_UI).
      Toute chaîne absente du dictionnaire reste en français : tools/i18n-scan.js liste ce qui manque.
================================================================= */
var OBS_T = function(s){ return s; }, OBS_I18N = { static:function(){} };
(function(){
  if (OBS_LANG !== 'en') return;
  window.__i18nMiss = window.__i18nMiss || {};
  MISSIONS.forEach(function(m){
    var e = EN_MISSIONS[m.id]; if (!e) return;
    var frSec = m.sections;
    ['name','agency','desc','sections','targets'].forEach(function(k){ if (e[k]) m[k] = e[k]; });
    (m.sections || []).forEach(function(sec, i){ sec.rows.forEach(function(r, j){ var o = frSec && frSec[i] && frSec[i].rows[j]; if (o && o[2]) r[2] = o[2]; }); });
    if (e.refs) Object.keys(e.refs).forEach(function(k){ if (m.refs[k]) m.refs[k].t = e.refs[k]; });
    if (e.model){ m.model.license = e.model.license; if (e.model.src) m.model.src = e.model.src; }
    (m.parts || []).forEach(function(p){ var q = e.parts && e.parts[p.key]; if (!q) return; p.name = q.name; p.desc = q.desc; if (q.facts) p.facts = p.facts.map(function(f, j){ return [q.facts[j] || f[0], f[1]]; }); });
  });
  OBS_T = function(s){ if (EN_UI[s] != null) return EN_UI[s]; window.__i18nMiss[s] = 1; return s; };
  /* body.html : attributs et textes fixes */
  OBS_I18N.static = function(){
    document.querySelectorAll('[aria-label],[title]').forEach(function(el){ ['aria-label','title'].forEach(function(a){ var v = el.getAttribute(a); if (v) el.setAttribute(a, OBS_T(v)); }); });
    var h = document.querySelector('.home-link'); if (h) h.textContent = OBS_T(h.textContent);
  };
})();
