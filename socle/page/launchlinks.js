/* Liens vers le site des lanceurs (https://rolgim.github.io/Launchers/) : dans un texte déjà échappé (fiche, déroulé de mission),
   le nom d'un lanceur présent sur ce site devient un lien vers sa page, dans la langue de la page.
   LaunchLinks.html(texteÉchappé) -> HTML ; un lien par lanceur et par texte au plus.
   Prudence : « Soyouz-Fregat » n'est relié à Soyouz-2 que depuis Kourou (Soyouz ST, de la famille Soyouz-2) ; les Soyouz-FG/Fregat
   de Baïkonour (Mars Express, Venus Express) n'en sont pas. Vega (sans « -C ») n'a pas de page. */
var LaunchLinks = (function(){
  var L = [
    [/Falcon Heavy/, 'falconheavy'],
    [/Falcon 9/, 'falcon9'],
    [/Ariane 6(?:2|4)?\b/, 'ariane6'],
    [/Ariane 5(?: ECA| ES| GS| G\+?)?/, 'ariane5'],
    [/Vega-C/, 'vegac'],
    [/\bSLS\b/, 'sls'],
    [/Soyouz-2(?:\.1[ab])?|Soyuz-2(?:\.1[ab])?|(?:Soyouz|Soyuz)[- ]Fr[ée]gat[e]?(?=,? (?:depuis |from )?Kourou)/, 'soyuz2'],
    [/Longue Marche 5B?|Long March 5B?/, 'cz5'],
    [/\bVega\b(?![- ]?C\b)/, 'vega'], [/Saturn V\b/, 'saturnv'],
    [/[Nn]avette(?: spatiale)?(?: (?:Atlantis|Discovery|Columbia|Endeavour|Challenger))?|Space Shuttle(?: (?:Atlantis|Discovery|Columbia|Endeavour|Challenger))?/, 'shuttle'],
    [/Delta II\b(?: Heavy| \d{4}H?(?:-\d+L)?)?/, 'delta2'], [/Atlas V\b(?: \d{3})?/, 'atlas5'], [/Titan IVB?(?:\/Centaur)?/, 'titan4'],
    [/Proton-M(?:\/(?:Briz|Breeze)-M)?/, 'protonm'], [/\bH-IIA\b/, 'h2a'], [/\bPSLV(?:-C\d+|-XL)?\b/, 'pslv']
  ];
  function html(h){
    var en = typeof OBS_LANG !== 'undefined' && OBS_LANG === 'en', title = en ? 'Launcher page, on the Launchers site' : 'Page du lanceur, sur le site Lanceurs';
    L.forEach(function(p){
      h = h.replace(p[0], function(m){ return '<a class="ln-link" href="https://rolgim.github.io/Launchers/#' + (en ? 'en' : 'fr') + '-' + p[1] + '" title="' + title + '">' + m + '</a>'; });
    });
    return h;
  }
  return { html:html };
})();
