/* =================================================================
   GLOSSAIRE (lot C1 des specs)
   Chaque terme technique est défini une fois ici. Dans les fiches et les pages
   d'instruments, sa première apparition dans chaque bloc est soulignée en pointillé ;
   le survol, le focus clavier ou un toucher affichent la définition.
   Entrée : [clé, motif FR, motif EN, insensible à la casse, terme FR, terme EN, définition FR, définition EN]
================================================================= */
var Glossary = (function(){
  var G = [
    ['tdi', 'TDI', 'TDI', 0, 'TDI', 'TDI',
     "Time Delay Integration : les charges sont décalées d'une ligne à l'autre du CCD au rythme où l'image défile, si bien que la lumière d'une étoile s'accumule pendant toute sa traversée du détecteur.",
     "Time Delay Integration: charges are shifted from row to row of the CCD at the rate the image drifts across it, so a star's light builds up during its whole crossing of the detector."],
    ['grism', 'grismes?', 'grisms?', 1, 'Grisme', 'Grism',
     "Prisme dont une face porte un réseau de diffraction. Placé dans le faisceau comme un filtre, il étale chaque source du champ en un petit spectre, sans fente.",
     "A prism with a diffraction grating on one face. Placed in the beam like a filter, it spreads every source in the field into a short spectrum, with no slit."],
    ['ifu', 'IFU', 'IFUs?', 0, 'IFU', 'IFU',
     "Unité à champ intégral : un découpeur d'image donne un spectre pour chaque point d'un petit champ. On obtient un cube : deux dimensions sur le ciel, une en longueur d'onde.",
     "Integral field unit: an image slicer gives a spectrum for every point of a small field. The result is a cube: two dimensions on the sky, one in wavelength."],
    ['res', 'résolution spectrale', 'spectral resolution', 1, 'Résolution spectrale', 'Spectral resolution',
     "R = λ/Δλ : rapport entre la longueur d'onde et le plus petit écart de longueur d'onde que l'instrument sépare. R ≈ 100 distingue des bandes larges, R ≈ 100 000 des raies très fines.",
     "R = λ/Δλ: the wavelength divided by the smallest wavelength difference the instrument can separate. R ≈ 100 separates broad bands, R ≈ 100,000 very narrow lines."],
    ['ab', 'magnitudes? AB|mag(?:nitude)?s? AB', 'AB magnitudes?|AB mag', 0, 'Magnitude AB', 'AB magnitude',
     "Échelle logarithmique de luminosité fondée sur le flux par unité de fréquence : 5 magnitudes de plus, c'est 100 fois moins de lumière. AB = 0 correspond à 3 631 jansky.",
     "A logarithmic brightness scale based on flux per unit frequency: 5 magnitudes more means 100 times less light. AB = 0 corresponds to 3,631 jansky."],
    ['cte', 'CTE', 'CTE', 0, 'CTE', 'CTE',
     "Charge Transfer Efficiency : part de la charge conservée à chaque transfert d'un pixel au suivant pendant la lecture d'un CCD. Les dégâts dus aux radiations la font baisser avec les années ; les traînées qui en résultent sont corrigées par logiciel.",
     "Charge Transfer Efficiency: the fraction of charge kept at each pixel-to-pixel transfer during CCD readout. Radiation damage lowers it over the years; the resulting trails are corrected in software."],
    ['mama', 'MAMA', 'MAMAs?', 0, 'MAMA', 'MAMA',
     "Multi-Anode Microchannel Array : détecteur ultraviolet qui compte les photons un par un et reste quasi insensible à la lumière visible.",
     "Multi-Anode Microchannel Array: an ultraviolet detector that counts photons one by one and is nearly blind to visible light."],
    ['ccd', 'CCD', 'CCDs?', 0, 'CCD', 'CCD',
     "Capteur au silicium : la lumière crée des charges électriques qui s'accumulent dans chaque pixel, puis sont transférées et lues ligne par ligne.",
     "A silicon sensor: light creates electric charges that build up in each pixel, then are shifted out and read row by row."],
    ['hgcdte', 'HgCdTe|H2RG', 'HgCdTe|H2RG', 0, 'HgCdTe, H2RG', 'HgCdTe, H2RG',
     "Tellurure de mercure-cadmium, semi-conducteur dont la composition fixe la limite de sensibilité infrarouge. Les détecteurs H2RG de Teledyne en sont faits ; ils équipent JWST et NISP.",
     "Mercury cadmium telluride, a semiconductor whose composition sets its infrared cut-off. Teledyne's H2RG detectors are made of it; they equip JWST and NISP."],
    ['coro', 'coronographes?|coronographie', 'coronagraphs?|coronagraphy', 1, 'Coronographe', 'Coronagraph',
     "Dispositif qui masque la lumière d'une étoile brillante pour observer ce qui l'entoure de près : planètes, disques de poussière.",
     "A device that blocks the light of a bright star to reveal what lies close to it: planets, dust discs."],
    ['plx', 'parallaxes?', 'parallax(?:es)?', 1, 'Parallaxe', 'Parallax',
     "Petit déplacement apparent d'une étoile pendant que la Terre fait le tour du Soleil. Il est inversement proportionnel à la distance : 1 mas correspond à 1 000 parsecs, soit environ 3 260 années-lumière.",
     "The small apparent shift of a star as the Earth goes round the Sun. It is inversely proportional to distance: 1 mas corresponds to 1,000 parsecs, about 3,260 light years."],
    ['dich', 'dichroïques?', 'dichroics?', 1, 'Dichroïque', 'Dichroic',
     "Lame qui réfléchit une partie du spectre et laisse passer le reste : elle envoie deux plages de longueur d'onde vers deux voies ou deux instruments.",
     "A plate that reflects part of the spectrum and transmits the rest, sending two wavelength ranges to two channels or two instruments."],
    ['l2', 'point de Lagrange(?: L2)?|L2', 'Lagrange point(?: L2)?|L2', 0, 'Point de Lagrange L2', 'Lagrange point L2',
     "Point d'équilibre du système Soleil-Terre, à environ 1,5 million de km de la Terre, à l'opposé du Soleil. Un télescope y garde le Soleil, la Terre et la Lune du même côté.",
     "An equilibrium point of the Sun-Earth system, about 1.5 million km from Earth on the side away from the Sun. A telescope there keeps the Sun, Earth and Moon on the same side."],
    ['halo', 'orbites? de halo', 'halo orbits?', 1, 'Orbite de halo', 'Halo orbit',
     "Orbite autour du point L2, et non autour d'un astre : le télescope décrit une grande boucle de plusieurs centaines de milliers de km en six mois environ, entretenue par de petites corrections.",
     "An orbit around the L2 point rather than around a body: the telescope traces a large loop several hundred thousand km across in about six months, kept up by small corrections."],
    ['korsch', 'Korsch', 'Korsch', 0, 'Korsch', 'Korsch',
     "Télescope à trois miroirs courbes : le troisième corrige les aberrations des deux premiers, ce qui donne un grand champ net. Formule de JWST et d'Euclid.",
     "A telescope with three curved mirrors: the third corrects the aberrations of the first two, giving a wide sharp field. The design of JWST and Euclid."],
    ['rc', 'Ritchey-Chrétien', 'Ritchey-Chrétien', 0, 'Ritchey-Chrétien', 'Ritchey-Chrétien',
     "Télescope à deux miroirs hyperboliques, sans coma sur un champ assez large. C'est la formule de Hubble et de la plupart des grands télescopes.",
     "A telescope with two hyperbolic mirrors, free of coma over a fairly wide field. It is the design of Hubble and of most large telescopes."],
    ['fits', 'FITS', 'FITS', 0, 'FITS', 'FITS',
     "Format de fichier standard de l'astronomie : des en-têtes en texte (mots-clés) suivis d'images ou de tables.",
     "The standard file format of astronomy: text headers (keywords) followed by images or tables."],
    ['msa', 'MSA|micro-volets', 'MSA|micro-shutters?', 0, 'MSA', 'MSA',
     "Micro-Shutter Assembly de NIRSpec : environ 250 000 volets de 0,20″ × 0,46″ que l'on ouvre un par un pour placer une petite fente devant chaque cible.",
     "NIRSpec's Micro-Shutter Assembly: about 250,000 shutters of 0.20″ × 0.46″ opened one by one to put a small slit in front of each target."],
    ['pm', 'mouvements? propres?', 'proper motions?', 1, 'Mouvement propre', 'Proper motion',
     "Déplacement angulaire d'une étoile sur le ciel au fil des années, dû à son mouvement réel dans la Galaxie.",
     "The angular drift of a star across the sky over the years, caused by its real motion through the Galaxy."],
    ['rv', 'vitesses? radiales?', 'radial velocit(?:y|ies)', 1, 'Vitesse radiale', 'Radial velocity',
     "Vitesse d'approche ou d'éloignement le long de la ligne de visée, mesurée par le décalage Doppler des raies du spectre.",
     "The speed towards or away from us along the line of sight, measured from the Doppler shift of spectral lines."],
    ['z', 'décalages? vers le rouge', 'redshifts?', 1, 'Décalage vers le rouge', 'Redshift',
     "Allongement de la longueur d'onde de la lumière d'une galaxie dû à l'expansion de l'Univers ; il indique sa distance. Il est photométrique s'il est estimé d'après les couleurs, spectroscopique s'il est mesuré sur les raies.",
     "The stretching of a galaxy's light by the expansion of the Universe; it tells its distance. Photometric when estimated from colours, spectroscopic when measured from lines."],
    ['wl', 'cisaillement gravitationnel faible', 'weak (?:gravitational )?lensing', 1, 'Cisaillement gravitationnel faible', 'Weak lensing',
     "Légère déformation commune des images de galaxies lointaines par la masse, visible et noire, située sur le trajet de leur lumière. On la mesure statistiquement sur des millions de galaxies.",
     "A slight shared distortion of distant galaxy images by the mass, visible and dark, along the path of their light. It is measured statistically over millions of galaxies."]
  ];
  var SKIP = /^(A|BUTTON|ABBR|PRE|CODE|SVG|svg|TEXT|text|H1|H2|H3|H4|LABEL|SUP|SCRIPT|STYLE|CANVAS|SUMMARY|SELECT|OPTION|TEXTAREA)$/;
  var BLOCK = '.isec, .spec-section, .inst-head, .desc, .pd, .facts, .parts-intro';
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var res = null, lang = null;
  function build(){
    lang = OBS_LANG; var en = lang === 'en';
    res = G.map(function(g){ return { k:g[0], re:new RegExp('(^|[^\\p{L}\\p{N}_-])(' + (en ? g[2] : g[1]) + ')(?![\\p{L}\\p{N}_])', 'u' + (g[3] ? 'i' : '')), t:en ? g[5] : g[4], d:en ? g[7] : g[6] }; });
  }
  function skipped(n, root){ for (var p = n.parentNode; p && p !== root; p = p.parentNode){ if (SKIP.test(p.nodeName) || (p.classList && p.classList.contains('nogloss'))) return true; } return false; }
  /* idempotent : un terme déjà souligné dans un bloc ne l'est pas une seconde fois */
  function apply(root){
    if (!root || root.hidden) return; if (!res || lang !== OBS_LANG) build();
    var blocks = [].slice.call(root.querySelectorAll(BLOCK)); if (!blocks.length) blocks = [root];
    blocks.forEach(function(b){
      if (b.parentNode && b.parentNode.closest && b.parentNode.closest(BLOCK) && blocks.indexOf(b.parentNode.closest(BLOCK)) >= 0) return;
      var done = {}; [].forEach.call(b.querySelectorAll('abbr.gl'), function(a){ done[a.getAttribute('data-k')] = 1; });
      var w = document.createTreeWalker(b, 4, null), nodes = [], n; while ((n = w.nextNode())) if (n.nodeValue.trim().length > 1 && !skipped(n, b)) nodes.push(n);
      nodes.forEach(function(node){
        res.forEach(function(r){
          if (done[r.k] || !node.parentNode) return;
          var m = r.re.exec(node.nodeValue); if (!m) return;
          var at = m.index + m[1].length, word = m[2];
          var rest = node.splitText(at); rest.nodeValue = rest.nodeValue.slice(word.length);
          var a = document.createElement('abbr'); a.className = 'gl'; a.tabIndex = 0; a.setAttribute('data-k', r.k); a.textContent = word;
          rest.parentNode.insertBefore(a, rest); done[r.k] = 1;
          node = rest;   /* on poursuit la recherche dans la suite du texte */
        });
      });
    });
  }
  /* bulle de définition, partagée */
  var tip = null, cur = null;
  function show(a){
    if (!res) build(); var r = res.filter(function(x){ return x.k === a.getAttribute('data-k'); })[0]; if (!r) return;
    if (!tip){ tip = document.createElement('div'); tip.id = 'gloss-tip'; tip.setAttribute('role', 'tooltip'); tip.className = 'nogloss'; document.body.appendChild(tip); }
    tip.innerHTML = '<b>' + esc(r.t) + '</b>' + esc(r.d); tip.hidden = false; cur = a; a.setAttribute('aria-describedby', 'gloss-tip');
    var b = a.getBoundingClientRect(), W = Math.min(320, window.innerWidth - 32); tip.style.width = W + 'px';
    var x = Math.max(16, Math.min(b.left, window.innerWidth - W - 16)), h = tip.offsetHeight, y = b.bottom + 8;
    if (y + h > window.innerHeight - 8) y = Math.max(8, b.top - h - 8);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hide(){ if (tip) tip.hidden = true; if (cur) cur.removeAttribute('aria-describedby'); cur = null; }
  function on(ev, f){ document.addEventListener(ev, f, true); }
  function gl(e){ return e.target && e.target.closest ? e.target.closest('abbr.gl') : null; }
  on('mouseover', function(e){ var a = gl(e); if (a) show(a); });
  on('mouseout', function(e){ var a = gl(e); if (a && a === cur && !(e.relatedTarget && a.contains(e.relatedTarget))) hide(); });
  on('focusin', function(e){ var a = gl(e); if (a) show(a); });
  on('focusout', function(e){ if (gl(e)) hide(); });
  on('click', function(e){ var a = gl(e); if (a){ if (cur === a && !tip.hidden) hide(); else show(a); } else if (cur) hide(); });
  on('keydown', function(e){ if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', hide, true);
  function watch(id){
    var el = document.getElementById(id), t = 0; if (!el) return;
    new MutationObserver(function(){ clearTimeout(t); t = setTimeout(function(){ apply(el); }, 40); }).observe(el, { childList:true, subtree:true });
    apply(el);
  }
  function boot(){ watch('inst-main'); watch('pbody'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
  return { apply:apply, TERMS:G };
})();
