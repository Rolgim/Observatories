/* Données vivantes (socle) : une donnée mise à jour automatiquement affiche sa date ; si la mise à jour prend du retard,
   la page le dit au lieu de présenter la donnée comme actuelle.
   LIVE.age(date)            âge en jours (date ISO « 2026-11-25 » ou « 2026-11-25T08:23Z »), null si illisible
   LIVE.warn(date, maxJours)  '' si la donnée a moins de maxJours, sinon un avertissement en ligne (<strong>, traduit par OBS_T),
                              à placer en tête de la note qui donne la date de la donnée */
var LIVE = (function(){
  function age(s){
    var t = Date.parse(/^\d{4}-\d\d-\d\d$/.test(s || '') ? s + 'T00:00:00Z' : String(s || '').replace(/Z?$/, 'Z').replace(/(T\d\d:\d\d)Z$/, '$1:00Z'));
    return isNaN(t) ? null : (Date.now() - t) / 864e5;
  }
  function warn(s, max){
    var a = age(s); if (a == null || a <= max) return '';
    return '<strong class="live-old">' + OBS_T('Mise à jour automatique en retard : cette donnée date de {n} jours.').replace('{n}', Math.floor(a)) + '</strong> ';
  }
  return { age:age, warn:warn };
})();
