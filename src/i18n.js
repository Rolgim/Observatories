/* =================================================================
   ANGLAIS — applique les textes de src/en/ quand OBS_LANG vaut « en ».
   1. Contenu structuré (fiches, pièces, instruments, optique, orbites) : remplacé champ par champ avant le premier rendu.
   2. Textes d'interface écrits dans le code : traduits à l'affichage, par dictionnaire (EN_UI) et par règles (EN_RULES).
      Toute chaîne absente du dictionnaire reste en français : tools/i18n-scan.js liste ce qui manque.
================================================================= */
var OBS_T = function(s){ return s; }, OBS_I18N = { real:function(m){ return m; } };
(function(){
  if (OBS_LANG !== 'en') return;
  function W(s){ return EN_WORDS[s] || s; }

  TELESCOPES.forEach(function(t){
    var e = EN_TELE[t.id]; if (!e) return;
    var frSec = t.sections;
    ['agency','launch','sub','src','desc','sourceNote','sections'].forEach(function(k){ if (e[k]) t[k] = e[k]; });
    t.sections.forEach(function(sec, i){ sec.rows.forEach(function(r, j){ var o = frSec[i] && frSec[i].rows[j]; if (o && o[2]) r[2] = o[2]; }); });
    if (e.refs) Object.keys(e.refs).forEach(function(k){ if (t.refs[k]) t.refs[k].t = e.refs[k]; });
    t.cmp.tag = e.cmp.tag; t.cmp.dim = e.cmp.dim;
    t.parts.forEach(function(p){ var q = e.parts[p.key]; if (q){ p.name = q.name; p.desc = q.desc; p.facts = q.facts; } });
  });
  Object.keys(INST_DATA).forEach(function(tid){
    var d = INST_DATA[tid], e = EN_INST[tid]; if (!e) return;
    d.summary = e.summary;
    d.archives.forEach(function(a, i){ if (e.archives[i]){ a.label = e.archives[i][0]; a.desc = e.archives[i][1]; } });
    d.instruments.forEach(function(it){
      var q = e.instruments[it.id] || {};
      ['kind','summary','specs','filtersTitle','products','notes'].forEach(function(k){ if (q[k]) it[k] = q[k]; });
      if (it.example && q.example){ it.example.title = q.example.title; it.example.caption = q.example.caption; if (q.example.text) it.example.text = q.example.text; }
      if (it.code){ if (q.code) it.code.title = q.code.title; EN_CODE.forEach(function(r){ it.code.text = it.code.text.split(r[0]).join(r[1]); }); }
      if (q.docs) it.docs.forEach(function(x, i){ if (q.docs[i]) x.l = q.docs[i]; });
      (it.filters || []).forEach(function(f){ f.note = W(f.note); f.g = W(f.g); });
      (it.bands || []).forEach(function(b){ b.l = W(b.l); });
      (it.fov || []).forEach(function(b){ b.l = W(b.l); });
    });
  });
  Object.keys(EN_OPTICS).forEach(function(tid){
    var e = EN_OPTICS[tid], t = Optics.TEXT[tid];
    t.title = e.title; t.scale = e.scale; t.steps = e.steps; t.specs = e.specs;
    Optics.LINK3D[tid].forEach(function(l, i){ l[1] = e.links[i]; });
    var fp = Optics.FP[tid]; fp.note = e.fp.note; fp.groups.forEach(function(g, i){ if (e.fp.labs[i]) g.lab = e.fp.labs[i]; });
    if (fp.key && e.fp.key) fp.key.forEach(function(k, i){ k[1] = e.fp.key[i]; });
  });
  Object.keys(EN_ORBITS).forEach(function(tid){ Orbits.TEXT[tid].sum = EN_ORBITS[tid].sum; Orbits.TEXT[tid].notes = EN_ORBITS[tid].notes; });

  /* observations réelles : titres et légendes par clé ; les libellés de provenance passent par le dictionnaire */
  OBS_I18N.real = function(m){
    Object.keys(m).forEach(function(k){ var e = EN_REAL[k]; if (e){ m[k].title = e.title; m[k].caption = e.caption; }
      m[k].meta.forEach(function(r){ r[0] = tr(r[0]); var v = String(r[1]), w = tr(v); r[1] = /^(SELECT|EUC_|jw|[a-z0-9_]+\.fits)/.test(v) ? v : (w !== v ? w : OBS_NUM(v)); }); });
    return m;
  };

  /* ---------- traduction à l'affichage ---------- */
  function tr(s){
    var k = s.replace(/\s+/g, ' ').trim(); if (k.length < 2) return s;
    var v = EN_UI[k];
    if (v === undefined){ var o = k; for (var i=0;i<EN_RULES.length;i++) o = o.replace(EN_RULES[i][0], EN_RULES[i][1]); if (o !== k) v = o; }   /* les règles se cumulent : une chaîne peut en demander plusieurs */
    if (v === undefined){ if (window.__i18nMiss) window.__i18nMiss[k] = 1; return s; }
    var lead = /^\s*/.exec(s)[0], tail = /\s*$/.exec(s)[0];
    return lead + v + tail;
  }
  OBS_T = tr;
  var ATTRS = ['title', 'aria-label', 'alt'];
  function walk(root){
    if (root.nodeType === 3){ one(root); return; }
    if (root.nodeType !== 1) return;
    attrs(root);
    var w = document.createTreeWalker(root, 5, null), n;   /* éléments et nœuds de texte */
    while ((n = w.nextNode())){ if (n.nodeType === 3) one(n); else attrs(n); }
  }
  function one(n){ var p = n.parentNode; if (!p || /^(SCRIPT|STYLE|PRE)$/.test(p.nodeName)) return; var v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
  function attrs(el){ for (var i=0;i<ATTRS.length;i++){ var a = el.getAttribute && el.getAttribute(ATTRS[i]); if (a){ var v = tr(a); if (v !== a) el.setAttribute(ATTRS[i], v); } } }
  function boot(){
    document.title = 'Observatories in orbit';
    walk(document.body);
    new MutationObserver(function(list){
      for (var i=0;i<list.length;i++){ var m = list[i];
        if (m.type === 'characterData') one(m.target);
        else if (m.type === 'attributes') attrs(m.target);
        else for (var j=0;j<m.addedNodes.length;j++) walk(m.addedNodes[j]); }
    }).observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS });
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
