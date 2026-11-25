/* Langue du site : français ou anglais.
   Ordre de décision : préfixe du lien (#en-mro, #fr-mro), puis choix mémorisé, sinon anglais.
   Les textes français sont dans les sources ; les textes anglais sont dans src/en/ et appliqués par src/i18n.js. */
var OBS_LANG = (function(){
  var m = /^#(en|fr)-/.exec(location.hash || ''), v = m && m[1];
  if (!v) try { v = localStorage.getItem('{{langKey}}'); } catch(e){}
  if (v !== 'en' && v !== 'fr') v = 'en';   /* anglais par défaut ; le français se choisit par le bouton FR ou un lien #fr-… */
  try { document.documentElement.lang = v; } catch(e){}
  return v;
})();
/* nombres : virgule décimale et espace des milliers en français, point et virgule en anglais */
function OBS_NUM(s){ return OBS_LANG === 'en' ? String(s).replace(/(\d),(?!\d{3}(?:\D|$))(\d)/g, '$1.$2').replace(/(\d)[   ](?=\d{3}(\D|$))/g, '$1,') : s; }
