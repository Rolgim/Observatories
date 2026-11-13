/* Langue du site : français ou anglais.
   Ordre de décision : préfixe du lien (#en-jwst, #fr-jwst), puis choix mémorisé, puis langue du navigateur.
   Les textes français sont dans les sources ; les textes anglais sont dans src/en/ et appliqués par src/i18n.js. */
var OBS_LANG = (function(){
  var m = /^#(en|fr)-/.exec(location.hash || ''), v = m && m[1];
  if (!v) try { v = localStorage.getItem('obs-lang'); } catch(e){}
  if (v !== 'en' && v !== 'fr') v = /^fr/i.test(navigator.language || 'fr') ? 'fr' : 'en';
  try { document.documentElement.lang = v; } catch(e){}
  return v;
})();
/* nombres : virgule décimale et espace des milliers en français, point et virgule en anglais */
function OBS_NUM(s){ return OBS_LANG === 'en' ? String(s).replace(/(\d)[   ](?=\d{3}(\D|$))/g, '$1,').replace(/(\d),(\d)/g, function(_, a, b){ return a + '.' + b; }) : s; }
