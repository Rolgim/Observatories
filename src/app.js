/* =================================================================
   APPLICATION — vue 3D, pièces cliquables, comparaison, routage
================================================================= */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function tele(id){ for (var i=0;i<TELESCOPES.length;i++) if (TELESCOPES[i].id===id) return TELESCOPES[i]; return null; }
function fr(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }

function banner(msg){
  var b = $('err-banner'); if (!b){ b = document.createElement('div'); b.id = 'err-banner'; document.body.appendChild(b); }
  b.textContent = msg;
}
window.addEventListener('error', function(e){ if (e && e.message && !/ResizeObserver/.test(e.message)) banner('Erreur : ' + e.message); });

var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var S = { mode:'tele', id:'hubble', ptab:'fiche', part:null, hover:null, explode:0, explodeGoal:0, sunReal:false, spin:!REDUCED,
          inst:false, instSel:null, filterIdx:0 };

var stage = $('stage'), hasGL = !!(window.THREE && THREE.GLTFLoader);
var renderer = null;
if (hasGL){
  try { renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' }); }
  catch(e){ renderer = null; }
}

/* =================================================================
   PANNEAU (fonctionne même sans WebGL)
================================================================= */
function orbitSvg(t){
  var F = 'font-family="Archivo, Arial, sans-serif"';
  if (t.orbit === 'leo'){
    return '<svg viewBox="0 0 340 150" role="img" aria-label="Orbite basse terrestre, à l\'échelle">' +
      '<circle cx="92" cy="75" r="60" fill="#2C5E9E"/>' +
      '<circle cx="92" cy="75" r="65" fill="none" stroke="#14171A" stroke-width="1.5"/>' +
      '<circle cx="138" cy="29" r="4.5" fill="#FFD21F" stroke="#14171A" stroke-width="1.5"/>' +
      '<path d="M143 27 L186 20" stroke="#14171A" stroke-width="1"/>' +
      '<text x="190" y="19" fill="#14171A" font-size="13" font-weight="700" ' + F + '>Hubble</text>' +
      '<text x="190" y="36" fill="#3A4147" font-size="12" ' + F + '>≈ 530 km d\'altitude</text>' +
      '<text x="190" y="76" fill="#3A4147" font-size="12" ' + F + '>Un tour toutes les 95 min.</text>' +
      '<text x="190" y="93" fill="#3A4147" font-size="12" ' + F + '>Terre et orbite dessinées</text>' +
      '<text x="190" y="110" fill="#3A4147" font-size="12" ' + F + '>à la même échelle.</text></svg>';
  }
  var gone = t.id === 'gaia';
  return '<svg viewBox="0 0 340 122" role="img" aria-label="Position au point de Lagrange L2">' +
    '<path d="M2 62 H26" stroke="#14171A" stroke-width="1.5"/><path d="M2 62 l8 -4.5 v9 z" fill="#14171A"/>' +
    '<text x="2" y="84" fill="#14171A" font-size="11.5" font-weight="700" ' + F + '>Soleil</text>' +
    '<text x="2" y="98" fill="#3A4147" font-size="11" ' + F + '>150 M km</text>' +
    '<line x1="62" y1="62" x2="316" y2="62" stroke="#98A1A7" stroke-dasharray="2 4"/>' +
    '<circle cx="62" cy="62" r="62.5" fill="none" stroke="#C8CDD1"/>' +
    '<circle cx="62" cy="62" r="7" fill="#2C5E9E"/><text x="62" y="87" text-anchor="middle" fill="#14171A" font-size="11.5" font-weight="700" ' + F + '>Terre</text>' +
    '<circle cx="106" cy="18" r="2.6" fill="#667077"/><text x="113" y="17" fill="#3A4147" font-size="11" ' + F + '>Lune, 384 000 km</text>' +
    '<ellipse cx="306" cy="62" rx="9" ry="30" fill="none" stroke="#14171A" stroke-width="1.5"' + (gone ? ' stroke-dasharray="3 3"' : '') + '/>' +
    '<circle cx="306" cy="62" r="1.8" fill="#14171A"/><circle cx="313" cy="43" r="4.5" fill="' + (gone ? '#ECEEEF' : '#FFD21F') + '" stroke="#14171A" stroke-width="1.5"/>' +
    '<text x="290" y="59" text-anchor="end" fill="#14171A" font-size="12.5" font-weight="700" ' + F + '>' + esc(t.short) + ' à L2</text>' +
    '<text x="290" y="75" text-anchor="end" fill="#3A4147" font-size="11" ' + F + '>1,5 million de km</text>' +
    '<text x="170" y="116" text-anchor="middle" fill="#667077" font-size="11" ' + F + '>' +
      (gone ? 'Position occupée de 2014 à 2025. Terre, Lune et L2 à l\'échelle.' : 'Terre, Lune et L2 à l\'échelle. Toujours à l\'opposé du Soleil.') + '</text></svg>';
}

function lines(v){ return esc(v).split(' · ').join('<br>'); }
function facts(t){
  var hl = { hubble:['Miroir primaire','2,4 <small>m</small>'], jwst:['Miroir primaire','6,5 <small>m</small>'], euclid:['Miroir primaire','1,2 <small>m</small>'], gaia:['Plan focal','106 <small>CCD</small>'] }[t.id];
  var sz = { hubble:'13,2 <small>m de long</small>', jwst:'21,2 × 14,2 <small>m</small>', euclid:'4,7 <small>m de haut</small>', gaia:'≈ 10 <small>m de diamètre</small>' }[t.id];
  return [hl, ['Encombrement', sz], ['Masse au lancement', fr(t.cmp.mass) + ' <small>kg</small>'], ['Lancement', t.year]];
}
/* thème : suit le système (ou l'hôte), sauf choix explicite mémorisé */
function isDark(){ var a = document.documentElement.getAttribute('data-theme'); return a ? a === 'dark' : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }
(function(){ try { var v = localStorage.getItem('obs-theme'); if ((v === 'dark' || v === 'light') && !document.documentElement.getAttribute('data-theme')) document.documentElement.setAttribute('data-theme', v); } catch(e){} })();
function renderTabs(){
  var h = TELESCOPES.map(function(t){
    return '<button class="tab" role="tab" data-go="' + t.id + '" aria-selected="' + (S.mode==='tele' && S.id===t.id) + '">' + esc(t.short) + '<small>' + t.year + '</small></button>';
  }).join('');
  h += '<button class="tab cmp" role="tab" data-go="comparer" aria-selected="' + (S.mode==='compare') + '">Comparer<small>tailles</small></button>';
  var dk = isDark(), lab = dk ? 'Passer au thème clair' : 'Passer au thème sombre';
  h += '<button class="tab theme" id="b-theme" title="' + lab + '" aria-label="' + lab + '"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">' +
       (dk ? '<circle cx="10" cy="10" r="3.6"/><path d="M10 1.8v2.2M10 16v2.2M1.8 10H4M16 10h2.2M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M4.2 15.8l1.6-1.6M14.2 5.8l1.6-1.6"/>'
           : '<path d="M16.6 12.1A7 7 0 0 1 7.9 3.4a7 7 0 1 0 8.7 8.7z" stroke-linejoin="round"/>') + '</svg></button>';
  $('tabs').innerHTML = h;
}

function renderPanel(){
  var pt = $('ptabs'), pb = $('pbody'), t = tele(S.id), h = '';
  if (S.mode === 'compare'){
    pt.innerHTML = '<button class="ptab" role="tab" aria-selected="true">À la même échelle</button>';
    var maxM = 6.5, maxK = 11110;
    h = '<h2>Quatre observatoires, une seule échelle</h2><p class="desc">Les maquettes sont posées côte à côte à leur taille réelle. Le bouclier de Webb couvre à peu près un court de tennis ; Euclid tiendrait dans une chambre.</p>' +
        '<button class="cta" data-go="comparer-instruments">Comparer les instruments<small>Couverture spectrale, champs de vue et tableau des 15 instruments sur les mêmes axes.</small></button>' +
        '<table class="cmp-table"><thead><tr><th>Observatoire</th><th>Miroir</th><th>Masse au lancement</th></tr></thead><tbody>' +
        TELESCOPES.map(function(x){
          return '<tr data-go="' + x.id + '"><td>' + esc(x.short) + '</td>' +
            '<td><div class="barcell"><i style="width:' + Math.round(x.cmp.mirror/maxM*54) + 'px"></i>' + String(x.cmp.mirror).replace('.',',') + ' m</div></td>' +
            '<td><div class="barcell"><i class="alt" style="width:' + Math.round(x.cmp.mass/maxK*54) + 'px"></i>' + fr(x.cmp.mass) + ' kg</div></td></tr>';
        }).join('') + '</tbody></table>' +
        '<div class="spec-section"><div class="spec-section-title">Encombrement</div>' +
        TELESCOPES.map(function(x){ return '<div class="spec-row"><div class="k">' + esc(x.short) + '</div><div class="v">' + esc(x.cmp.dim) + '</div></div>'; }).join('') + '</div>' +
        '<p class="source-note">Pour Gaia, la valeur de miroir est le grand côté de ses deux miroirs rectangulaires (1,45 × 0,50 m). Cliquer une maquette ou une ligne ouvre sa fiche.</p>';
    pb.innerHTML = h; pb.scrollTop = 0; return;
  }
  pt.innerHTML =
    '<button class="ptab" role="tab" data-ptab="fiche" aria-selected="' + (S.ptab==='fiche') + '">Fiche</button>' +
    '<button class="ptab" role="tab" data-ptab="parts" aria-selected="' + (S.ptab==='parts') + '">Pièces<span class="n">' + t.parts.length + '</span></button>' +
    '<button class="ptab go" data-inst-open="1">Instruments et données</button>';
  if (S.ptab === 'fiche'){
    h = '<h2>' + esc(t.name) + '</h2><div class="launch">' + esc(t.agency) + '<br>' + esc(t.launch) + '</div>' +
        '<dl class="facts">' + facts(t).map(function(f){ return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl>' +
        '<p class="desc">' + esc(t.desc) + '</p>' +
        '<div class="where">' + orbitSvg(t) + '</div>' +
        '<button class="cta" data-inst-open="1">Voir les instruments et les données<small>' + INST_DATA[t.id].instruments.map(function(i){ return i.name; }).join(', ') + '. Trajet de la lumière, filtres, exemples de données, accès aux archives.</small></button>' +
        t.sections.map(function(sec){
          return '<div class="spec-section"><div class="spec-section-title">' + esc(sec.title) + '</div>' +
            sec.rows.map(function(r){ return '<div class="spec-row"><div class="k">' + esc(r[0]) + '</div><div class="v">' + lines(r[1]) + '</div></div>'; }).join('') + '</div>';
        }).join('') +
        '<p class="source-note">' + esc(t.sourceNote) + '</p>';
  } else {
    h = '<p class="parts-intro">' + (renderer ? 'Cliquer une pièce dans la vue 3D ou dans la liste. Le curseur « Éclater » les écarte pour voir comment elles s\'assemblent.' : 'Les pièces principales de l\'observatoire.') + '</p>' +
        t.parts.map(function(p){
          return '<div class="part' + (S.part===p.key ? ' on' : '') + '" data-part="' + p.key + '"><button aria-expanded="' + (S.part===p.key) + '"><span class="dot"></span>' + esc(p.name) + '</button>' +
            '<div class="pd">' + esc(p.desc) + (p.facts ? '<div class="pf">' + p.facts.map(esc).join('<br>') + '</div>' : '') + '</div></div>';
        }).join('');
  }
  pb.innerHTML = h;
}

function renderHud(){
  var t = tele(S.id);
  if (S.mode === 'compare'){ $('t-name').textContent = 'À la même échelle'; $('t-sub').textContent = 'Hubble, JWST, Euclid et Gaia côte à côte, en taille réelle'; $('t-src').textContent = ''; }
  else { $('t-name').textContent = t.name; $('t-sub').textContent = t.sub; $('t-src').textContent = t.src; }
}

/* ---------- instruments ---------- */
function renderInst(keepScroll){
  var r = S.mode === 'compare' ? InstrumentsUI.renderCompare() : InstrumentsUI.render(S.id, S.instSel, S.filterIdx);
  S.instSel = r.sel;
  $('inst-pills').innerHTML = r.pills; $('inst-nav').innerHTML = r.nav;
  var m = $('inst-main'); m.innerHTML = r.main; if (!keepScroll) m.scrollTop = 0;
  var on = $('inst-nav').querySelector('.on'); if (on && on.scrollIntoView) try { on.scrollIntoView({ block:'nearest', inline:'nearest' }); } catch(e){}
}
$('inst-page').addEventListener('click', function(e){
  var el = e.target.closest ? e.target.closest('[data-copy],[data-filter],[data-jump],[data-inst],[data-tele],#inst-close') : null;
  if (!el) return;
  if (el.id === 'inst-close'){ location.hash = S.mode === 'compare' ? 'comparer' : S.id; return; }
  if (el.hasAttribute('data-jump')){ var jp = el.getAttribute('data-jump').split(':'); S.pendingInst = jp[1]; location.hash = jp[0] + '-instruments'; return; }
  if (el.hasAttribute('data-copy')){
    var txt = InstrumentsUI.getCopy(+el.getAttribute('data-copy')), pre = el.parentNode.querySelector('pre');
    var done = function(){ el.textContent = 'Copié'; setTimeout(function(){ el.textContent = 'Copier'; }, 1400); };
    var fallback = function(){ try { var rg = document.createRange(); rg.selectNodeContents(pre); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); el.textContent = 'Sélectionné'; } catch(x){} };
    try { navigator.clipboard.writeText(txt).then(done, fallback); } catch(x){ fallback(); }
    return;
  }
  if (el.hasAttribute('data-filter')){
    S.filterIdx = +el.getAttribute('data-filter');
    var fs = $('fsec'); if (fs) fs.innerHTML = InstrumentsUI.filterPanel(S.id, S.instSel, S.filterIdx);
    return;
  }
  if (el.hasAttribute('data-tele')){ location.hash = el.getAttribute('data-tele') + '-instruments'; return; }
  if (el.hasAttribute('data-inst') && S.mode !== 'compare'){ S.instSel = el.getAttribute('data-inst') || null; S.filterIdx = 0; renderInst(); }
});

/* ---------- navigation ---------- */
document.addEventListener('click', function(e){
  var el = e.target.closest ? e.target.closest('#b-theme,[data-go],[data-ptab],[data-inst-open],[data-part]') : null;
  if (!el || $('inst-page').contains(el)) return;
  if (el.id === 'b-theme'){ var nt = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nt); try { localStorage.setItem('obs-theme', nt); } catch(x){} renderTabs(); return; }
  if (el.hasAttribute('data-go')){ location.hash = el.getAttribute('data-go'); return; }
  if (el.hasAttribute('data-inst-open')){ location.hash = S.id + '-instruments'; return; }
  if (el.hasAttribute('data-ptab')){ S.ptab = el.getAttribute('data-ptab'); renderPanel(); return; }
  if (el.hasAttribute('data-part') && e.target.closest('button')){ var k = el.getAttribute('data-part'); selectPart(S.part === k ? null : k, true); }
});
document.addEventListener('keydown', function(e){
  if (e.key !== 'Escape') return;
  if (S.inst) location.hash = S.mode === 'compare' ? 'comparer' : S.id; else if (S.part) selectPart(null);
});

function route(){
  var h = (location.hash || '').replace(/^#/, ''), inst = false, mode = 'tele', id = S.id;
  if (/-instruments$/.test(h)){ inst = true; h = h.replace(/-instruments$/, ''); }
  if (h === 'comparer') mode = 'compare'; else if (tele(h)) id = h;
  var changed = id !== S.id || mode !== S.mode;
  if (id !== S.id){ S.instSel = null; S.filterIdx = 0; }
  if (S.pendingInst){ if (mode === 'tele'){ S.instSel = S.pendingInst; S.filterIdx = 0; } S.pendingInst = null; }
  S.id = id; S.mode = mode; S.inst = inst;
  if (changed){ S.part = null; S.hover = null; S.ptab = 'fiche'; }
  renderTabs(); renderHud(); renderPanel();
  $('inst-page').hidden = !S.inst;
  if (S.inst) renderInst();
  if (renderer) show3D(changed);
}
window.addEventListener('hashchange', route);

function selectPart(key, fromList){
  S.part = key;
  if (key && S.ptab !== 'parts') S.ptab = 'parts';
  renderPanel();
  if (key && !fromList){ var el = $('pbody').querySelector('.part.on'); if (el && el.scrollIntoView) try { el.scrollIntoView({ block:'nearest' }); } catch(e){} }
  if (renderer) applyHighlight();
}

/* =================================================================
   Sans WebGL : fiche et instruments restent utilisables
================================================================= */
var show3D = function(){}, applyHighlight = function(){};
if (!renderer){
  $('toolbar').hidden = true; $('hint').hidden = true;
  var ld = $('loader'); ld.hidden = false; ld.querySelector('.bar').hidden = true;
  ld.querySelector('.l-title').textContent = 'Vue 3D indisponible';
  ld.querySelector('.l-sub').textContent = hasGL ? 'Ce navigateur n\'a pas pu ouvrir WebGL. Les fiches et les instruments restent consultables.' : 'La bibliothèque 3D n\'a pas pu être chargée. Les fiches et les instruments restent consultables.';
  route(); return;
}

/* =================================================================
   RENDU
================================================================= */
var canvas = renderer.domElement;
stage.insertBefore(canvas, stage.firstChild);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.autoClear = false;
renderer.setClearColor(0x000000, 1);

var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.05, 600);
var bgScene = new THREE.Scene(), bgCam = new THREE.PerspectiveCamera(36, 1, 40, 200000);

/* environnement pour les reflets : quelques panneaux lumineux dans le noir */
(function(){
  var es = new THREE.Scene();
  var g = new THREE.SphereGeometry(40, 24, 16), col = [], p = g.attributes.position;
  for (var i=0;i<p.count;i++){ var y = p.getY(i)/40, k = Math.pow(Math.max(0, y*0.5+0.5), 1.6); col.push(0.012 + 0.10*k, 0.016 + 0.13*k, 0.03 + 0.2*k); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  es.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors:true, side:THREE.BackSide })));
  function panel(x,y,z,w,h,r,gc,b){ var m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({ color:new THREE.Color(r,gc,b), side:THREE.DoubleSide })); m.position.set(x,y,z); m.lookAt(0,0,0); es.add(m); }
  panel(18, 22, 16, 22, 22, 9, 8.4, 7.4);
  panel(-24, 6, -14, 18, 26, 1.4, 1.9, 2.8);
  panel(-6, -26, 12, 30, 30, 0.5, 0.6, 0.8);
  panel(10, 4, -30, 14, 30, 1.6, 1.5, 1.4);
  var pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(es, 0.03).texture;
  pm.dispose();
})();

var key = new THREE.DirectionalLight(0xfff4e2, 2.6), fill = new THREE.DirectionalLight(0x8fb0e8, 0.55), rim = new THREE.DirectionalLight(0xbfe4ee, 0.5);
var hemi = new THREE.HemisphereLight(0x9fb4d8, 0x1a1c24, 0.5);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004;
scene.add(key, key.target, fill, rim, hemi);
var STUDIO = new THREE.Vector3(0.52, 0.72, 0.62).normalize();

/* ---------- arrière-plan : étoiles, Voie lactée, Soleil, Terre ---------- */
var sunDir = new THREE.Vector3(0.5, 0.6, 0.6).normalize(), sunSprite, earth = null, earthMat, atmoMat;
(function(){
  var rnd = (function(s){ return function(){ s = (s*1664525 + 1013904223) >>> 0; return s/4294967296; }; })(20231107);
  var N = 5200, M = 3800, pos = new Float32Array((N+M)*3), col = new Float32Array((N+M)*3), siz = new Float32Array(N+M);
  var pal = [[1,0.97,0.93],[0.78,0.86,1],[1,0.88,0.72],[0.92,0.95,1],[1,1,1],[1,0.78,0.62]];
  var pole = new THREE.Vector3(0.45, 0.62, -0.64).normalize(), u = new THREE.Vector3(1,0,0).cross(pole).normalize(), w = pole.clone().cross(u);
  for (var i=0;i<N+M;i++){
    var v = new THREE.Vector3();
    if (i < N){ var z = 2*rnd()-1, a = rnd()*6.2832, r = Math.sqrt(1-z*z); v.set(r*Math.cos(a), z, r*Math.sin(a)); }
    else { var a2 = rnd()*6.2832, b = (rnd()+rnd()+rnd()-1.5)*0.22*(0.55 + 0.45*Math.cos(a2)); v.copy(u).multiplyScalar(Math.cos(a2)).addScaledVector(w, Math.sin(a2)).addScaledVector(pole, b).normalize(); }
    pos[i*3] = v.x*90000; pos[i*3+1] = v.y*90000; pos[i*3+2] = v.z*90000;
    var c = pal[(rnd()*pal.length)|0], m = Math.pow(rnd(), i < N ? 5 : 9), br = (i < N ? 0.32 : 0.2) + 0.9*m;
    col[i*3] = c[0]*br; col[i*3+1] = c[1]*br; col[i*3+2] = c[2]*br;
    siz[i] = (i < N ? 1.0 : 0.85) + 2.4*m;
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('size', new THREE.BufferAttribute(siz, 1));
  var stars = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms:{ dpr:{ value:renderer.getPixelRatio() } }, depthTest:false, depthWrite:false, transparent:true, blending:THREE.AdditiveBlending,
    vertexShader:'attribute float size; attribute vec3 color; varying vec3 vC; uniform float dpr; void main(){ vC = color; gl_PointSize = size*dpr; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'varying vec3 vC; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5, 0.08, d); gl_FragColor = vec4(vC*a, a); }'
  }));
  stars.frustumCulled = false; stars.renderOrder = -10; bgScene.add(stars);

  var cv = document.createElement('canvas'); cv.width = cv.height = 256; var cx = cv.getContext('2d'), gr = cx.createRadialGradient(128,128,0,128,128,128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.035, 'rgba(255,250,235,1)'); gr.addColorStop(0.09, 'rgba(255,225,170,0.42)'); gr.addColorStop(0.3, 'rgba(255,190,120,0.09)'); gr.addColorStop(1, 'rgba(255,160,90,0)');
  cx.fillStyle = gr; cx.fillRect(0,0,256,256);
  sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(cv), blending:THREE.AdditiveBlending, depthTest:false, depthWrite:false, transparent:true }));
  sunSprite.scale.set(30000, 30000, 1); sunSprite.renderOrder = -5; sunSprite.visible = false; bgScene.add(sunSprite);

  /* Terre vue de l'orbite de Hubble : rayon 6 371 km, observateur à ≈ 530 km */
  var RE = 6371, ALT = 530;
  var NOISE = 'float h3(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }' +
    'float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f); return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x), mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x), f.y), mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x), mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x), f.y), f.z); }' +
    'float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i=0;i<6;i++){ s += a*n3(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }';
  earthMat = new THREE.ShaderMaterial({
    uniforms:{ sun:{ value:new THREE.Vector3(0,1,0) }, t:{ value:0 } },
    vertexShader:'varying vec3 vO; varying vec3 vW; varying vec3 vN; void main(){ vO = normalize(position); vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }',
    fragmentShader:'uniform vec3 sun; uniform float t; varying vec3 vO; varying vec3 vW; varying vec3 vN;' + NOISE +
      'void main(){ vec3 n = normalize(vN); vec3 p = normalize(vO); vec3 V = normalize(cameraPosition - vW);' +
      ' float f = fbm(p*2.6 + 3.0) + 0.25*fbm(p*9.0); float land = smoothstep(0.60, 0.66, f);' +
      ' float dry = fbm(p*5.0 + 11.0); vec3 lc = mix(vec3(0.05,0.14,0.04), vec3(0.30,0.22,0.11), smoothstep(0.42,0.62,dry)); lc = mix(lc, vec3(0.42,0.36,0.24), smoothstep(0.62,0.8,dry));' +
      ' vec3 oc = mix(vec3(0.004,0.022,0.075), vec3(0.01,0.07,0.16), smoothstep(0.45,0.6,f));' +
      ' vec3 c = mix(oc, lc, land); float ice = smoothstep(0.80, 0.9, abs(p.y) + 0.08*fbm(p*8.0)); c = mix(c, vec3(0.8,0.85,0.9), ice);' +
      ' vec3 q = p*3.6 + vec3(t*0.004, 0.0, t*0.002); float cl = fbm(q + 1.7*vec3(fbm(q*1.6), fbm(q*1.6+5.2), 0.0)); cl = smoothstep(0.60, 0.86, cl + 0.10*fbm(p*18.0));' +
      ' float d = dot(n, sun); float day = smoothstep(-0.12, 0.25, d);' +
      ' vec3 H = normalize(sun + V); float spec = pow(max(dot(n,H),0.0), 60.0)*(1.0-land)*(1.0-cl)*0.6;' +
      ' vec3 lit = (c*(0.2 + 1.25*max(d,0.0)) + spec)*day; lit = mix(lit, vec3(0.95)*(0.15 + 0.95*max(d,0.0))*day, cl*0.9);' +
      ' float rimv = pow(1.0 - max(dot(n,V),0.0), 2.6); lit += vec3(0.16,0.36,0.9)*rimv*1.0*day; lit = mix(lit, lit*vec3(0.78,0.88,1.12) + vec3(0.012,0.03,0.07)*day, 0.55);' +
      ' gl_FragColor = vec4(lit, 1.0);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}'
  });
  atmoMat = new THREE.ShaderMaterial({
    uniforms:{ sun:{ value:new THREE.Vector3(0,1,0) } }, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.BackSide,
    vertexShader:'varying vec3 vW; varying vec3 vN; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }',
    fragmentShader:'uniform vec3 sun; varying vec3 vW; varying vec3 vN; void main(){ vec3 n = normalize(vN); vec3 V = normalize(cameraPosition - vW); float g = pow(clamp(1.0 + dot(n,V), 0.0, 1.0), 7.0)*smoothstep(0.0, 0.22, -dot(n,V)); float day = smoothstep(-0.2, 0.3, dot(n,sun)); gl_FragColor = vec4(vec3(0.25,0.5,1.0)*g*day*1.6, 1.0);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}'
  });
  earth = new THREE.Group();
  var ball = new THREE.Mesh(new THREE.SphereGeometry(RE, 192, 128), earthMat); ball.name = 'ball';
  earth.add(ball, new THREE.Mesh(new THREE.SphereGeometry(RE + 75, 128, 96), atmoMat));
  earth.position.set(0, -(RE + ALT), 0); earth.visible = false; bgScene.add(earth);
})();

/* =================================================================
   MAQUETTES
================================================================= */
var models = {}, buffers = {}, loader = new THREE.GLTFLoader(), current = null, loadToken = 0;

function fetchModel(t, onProgress){
  if (buffers[t.id]) return buffers[t.id];
  var raw = !/\.txt$/.test(t.file);
  var p = fetch(t.file).then(function(res){
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var total = +res.headers.get('content-length') || t.bytes;
    if (!res.body || !res.body.getReader) return res.arrayBuffer().then(function(b){ return raw ? b : unb64(new Uint8Array(b)); });
    var rd = res.body.getReader(), chunks = [], got = 0;
    function pump(){ return rd.read().then(function(r){
      if (r.done){ var out = new Uint8Array(got), o = 0; chunks.forEach(function(c){ out.set(c, o); o += c.length; }); return raw ? out.buffer : unb64(out); }
      chunks.push(r.value); got += r.value.length; if (p.onProgress) p.onProgress(got, Math.max(total, got)); return pump();
    }); }
    return pump();
  });
  p.onProgress = onProgress;
  p.catch(function(){ delete buffers[t.id]; });
  return (buffers[t.id] = p);
}

/* les maquettes sont publiées en base64 (fichiers texte) : décodage vers le binaire glTF */
var B64 = (function(){ var t = new Uint8Array(128), a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; for (var i=0;i<64;i++) t[a.charCodeAt(i)] = i; return t; })();
function unb64(src){
  var n = src.length; while (n > 0 && (src[n-1] === 61 || src[n-1] === 10 || src[n-1] === 13)) n--;
  var out = new Uint8Array(Math.floor(n*3/4)), o = 0, i = 0;
  for (; i + 3 < n; i += 4){ var v = (B64[src[i]] << 18) | (B64[src[i+1]] << 12) | (B64[src[i+2]] << 6) | B64[src[i+3]]; out[o++] = v >> 16; out[o++] = (v >> 8) & 255; out[o++] = v & 255; }
  if (n - i === 2){ out[o++] = ((B64[src[i]] << 18) | (B64[src[i+1]] << 12)) >> 16; }
  else if (n - i === 3){ var w = (B64[src[i]] << 18) | (B64[src[i+1]] << 12) | (B64[src[i+2]] << 6); out[o++] = w >> 16; out[o++] = (w >> 8) & 255; }
  return out.buffer.slice(0, o);
}
function tweakMaterial(id, m){
  var n = m.name || '';
  if (m.map) m.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (id === 'jwst'){
    if (/TopReflector|mirror|gold-nofoil|JWST-gold/.test(n)){ m.color.setRGB(1.0, 0.74, 0.32); m.metalness = 0.88; m.roughness = 0.3; }
    else if (/FoilLayer[1-4]/.test(n)){ m.color.setRGB(0.42, 0.44, 0.50); m.metalness = 0.9; m.roughness = 0.45; }
    else if (/PURPLEY/.test(n)){ m.metalness = 0.75; m.roughness = 0.36; }
    else if (/silver/.test(n)){ m.metalness = 0.9; m.roughness = 0.34; }
    else if (/SolarPanel/.test(n)){ m.metalness = 0.4; m.roughness = 0.32; }
    else if (/black/.test(n)){ m.roughness = 0.7; m.metalness = 0.2; }
    else if (/bronze|sa_edge/.test(n)){ m.metalness = 0.9; m.roughness = 0.35; }
  } else if (id === 'hubble'){
    if (/foil_silver|shiny/.test(n)){ m.metalness = Math.max(m.metalness, 0.85); m.roughness = Math.min(m.roughness, 0.34); }
  } else if (id === 'gaia'){
    if (/Gold|Aluminum|Metal/.test(n)){ m.metalness = Math.max(m.metalness, 0.75); m.roughness = Math.min(m.roughness, 0.45); }
    if (/SolarArray/.test(n)){ m.metalness = 0.35; m.roughness = 0.35; }
  } else if (id === 'euclid'){
    m.metalness = Math.min(m.metalness, 0.5); m.roughness = Math.max(0.5, Math.min(m.roughness, 0.75)); m.color.multiplyScalar(0.78);
  }
  m.userData.env = 1;
}

function prepare(t, gltf){
  var inner = gltf.scene, root = new THREE.Group(); root.name = t.id;
  /* three r128 ne dénormalise pas les attributs entiers côté CPU (lancer de rayon, boîtes) : positions converties en flottants */
  inner.traverse(function(o){
    if (!o.isMesh) return; var g = o.geometry, pa = g.attributes.position;
    if (!pa || !(pa.normalized || pa.isInterleavedBufferAttribute)) return;
    var arr = pa.array || pa.data.array, nm = pa.normalized, den = arr instanceof Int16Array ? 32767 : arr instanceof Uint16Array ? 65535 : arr instanceof Int8Array ? 127 : arr instanceof Uint8Array ? 255 : 1;
    var out = new Float32Array(pa.count*3);
    for (var i=0;i<pa.count;i++){ var x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); if (nm){ x = Math.max(x/den, -1); y = Math.max(y/den, -1); z = Math.max(z/den, -1); } out[i*3] = x; out[i*3+1] = y; out[i*3+2] = z; }
    g.setAttribute('position', new THREE.BufferAttribute(out, 3)); g.boundingBox = null; g.boundingSphere = null; g.computeBoundingSphere();
  });
  inner.updateMatrixWorld(true);
  var box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  var s = t.axis ? t.size / size[t.axis] : 1;
  inner.scale.setScalar(s); inner.position.copy(ctr).multiplyScalar(-s); root.add(inner); root.updateMatrixWorld(true);
  var M = { t:t, root:root, inner:inner, scale:s, parts:{}, meshes:[], mats:[], radius:size.length()*s/2, size:size.multiplyScalar(s) };
  t.parts.forEach(function(p){ M.parts[p.key] = { def:p, meshes:[], box:new THREE.Box3(), off:new THREE.Vector3(p.explode[0], p.explode[1], p.explode[2]).multiplyScalar(p.explode[3]) }; });
  function keyOf(o){
    for (; o && o !== root; o = o.parent){
      var nm = o.name || '';
      for (var i=0;i<t.parts.length;i++){
        var p = t.parts[i], names = p.nodes || [p.key];
        for (var j=0;j<names.length;j++){ var base = names[j].replace(/[\s\[\]\.:\/]/g, ''); if (nm === base || (nm.indexOf(base) === 0 && /^_\d+$/.test(nm.slice(base.length)))) return p.key; }
      }
    }
    return null;
  }
  var orphans = [];
  inner.traverse(function(o){
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    o.material = o.material.clone(); tweakMaterial(t.id, o.material); M.mats.push(o.material);
    if (o.material.transparent) o.castShadow = false;
    M.meshes.push(o);
    var k = keyOf(o); if (k) attach(o, k); else orphans.push(o);
  });
  function attach(o, k){ o.userData.part = k; M.parts[k].meshes.push(o); M.parts[k].box.expandByObject(o); }
  orphans.forEach(function(o){
    var c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()), best = null, bd = Infinity;
    for (var k in M.parts){ var b = M.parts[k].box; if (b.isEmpty()) continue; var d = b.distanceToPoint(c); if (d < bd){ bd = d; best = k; } }
    if (best) attach(o, best);
  });
  var invInner = new THREE.Matrix4().copy(inner.matrixWorld).invert(), m4 = new THREE.Matrix4(), m3 = new THREE.Matrix3();
  for (var k in M.parts){
    var P = M.parts[k]; P.center = P.box.isEmpty() ? new THREE.Vector3() : P.box.getCenter(new THREE.Vector3());
    P.meshes.forEach(function(o){
      m4.multiplyMatrices(invInner, o.parent.matrixWorld).invert(); m3.setFromMatrix4(m4);
      o.userData.base = o.position.clone();
      o.userData.ex = P.off.clone().divideScalar(s).applyMatrix3(m3);
    });
  }
  return M;
}

function loadModel(t, onProgress){
  if (models[t.id]) return Promise.resolve(models[t.id]);
  return fetchModel(t, onProgress).then(function(buf){
    if (models[t.id]) return models[t.id];
    return new Promise(function(ok, ko){ loader.parse(buf, '', function(g){ ok(models[t.id] = models[t.id] || prepare(t, g)); }, function(e){ ko(e || new Error('fichier illisible')); }); });
  });
}

function setExplode(M, e){
  M.meshes.forEach(function(o){ if (o.userData.base) o.position.copy(o.userData.base).addScaledVector(o.userData.ex, e); });
}

var BRASS = new THREE.Color(0xFFC81A), HOV = new THREE.Color(0xffffff);
applyHighlight = function(){
  if (!current || S.mode !== 'tele') return;
  current.meshes.forEach(function(o){
    var m = o.material, k = o.userData.part;
    if (!m.emissive) return;
    if (m.userData.em0 === undefined){ m.userData.em0 = m.emissive.clone(); m.userData.ei0 = m.emissiveIntensity; }
    if (k && k === S.part){ m.emissive.copy(BRASS); m.emissiveIntensity = 0.16; }
    else if (k && k === S.hover){ m.emissive.copy(HOV); m.emissiveIntensity = 0.1; }
    else { m.emissive.copy(m.userData.em0); m.emissiveIntensity = m.userData.ei0; }
    var dim = S.part && k !== S.part;
    if (m.userData.c0 === undefined) m.userData.c0 = m.color.clone();
    m.color.copy(m.userData.c0); if (dim) m.color.multiplyScalar(0.5);
  });
  var P = S.part && current.parts[S.part];
  $('callout').hidden = !P;
  if (P) $('callout').textContent = P.def.name;
};

/* ---------- éclairage ---------- */
function applyLighting(){
  var real = S.sunReal && S.mode === 'tele', t = tele(S.id), R = S.mode === 'compare' ? cmp.radius : (current ? current.radius : 10);
  var tgt = S.mode === 'compare' ? cmp.center : ZERO;
  sunDir.fromArray(t.sun).normalize();
  var d = real ? sunDir : STUDIO;
  key.position.copy(tgt).addScaledVector(d, R*4); key.target.position.copy(tgt);
  key.intensity = real ? 3.6 : 2.5;
  var sc = key.shadow.camera; sc.left = -R*1.25; sc.right = R*1.25; sc.top = R*1.25; sc.bottom = -R*1.25; sc.near = R*1.5; sc.far = R*6.5; sc.updateProjectionMatrix();
  key.shadow.normalBias = R*0.0035;
  if (real){
    if (t.orbit === 'leo'){ fill.color.setHex(0x7fb0ff); fill.position.set(0.15, -1, 0.1); fill.intensity = 0.75; } else { fill.intensity = 0.05; fill.position.set(-0.6, 0.2, -0.5); }
    rim.intensity = 0.0; hemi.intensity = 0.12;
  } else {
    fill.color.setHex(0x8fb0e8); fill.position.set(-0.7, 0.05, -0.45); fill.intensity = 0.6;
    rim.position.set(-0.25, 0.5, -0.9); rim.intensity = 0.55; hemi.intensity = 0.55;
  }
  var env = real ? 0.42 : 1.0;
  for (var id in models) models[id].mats.forEach(function(m){ m.envMapIntensity = env; });
  sunSprite.visible = real; sunSprite.position.copy(sunDir).multiplyScalar(80000);
  earth.visible = S.mode === 'tele' && t.orbit === 'leo';
  earthMat.uniforms.sun.value.copy(sunDir); atmoMat.uniforms.sun.value.copy(sunDir);
  $('b-sun').setAttribute('aria-pressed', String(S.sunReal));
}
var ZERO = new THREE.Vector3();

/* ---------- caméra orbitale ---------- */
var C = { az:0, el:0.2, dist:30, tgt:new THREE.Vector3(), gaz:0, gel:0.2, gdist:30, gtgt:new THREE.Vector3(), min:1, max:100, last:0 };
function fitDist(R){ var v = camera.fov*Math.PI/360, h = Math.atan(Math.tan(v)*camera.aspect); return R / Math.sin(Math.min(v, h)); }
function frame(snap){
  if (S.mode === 'compare'){
    var v = camera.fov*Math.PI/360, d = Math.max((cmp.h/2)/Math.tan(v), (cmp.w/2)/(Math.tan(v)*camera.aspect))*1.04 + cmp.depth*0.12;
    C.gaz = 0.0; C.gel = 0.14; C.gdist = d; C.gtgt.copy(cmp.center); C.min = d*0.25; C.max = d*2.2;
  } else if (current){
    var t = current.t, R = current.radius, f = fitDist(R);
    C.gaz = t.view.az; C.gel = t.view.el; C.gdist = f*t.view.dist*0.64; C.gtgt.set(0,0,0); C.min = R*0.35; C.max = f*3;
  }
  if (snap){ C.az = C.gaz; C.el = C.gel; C.dist = C.gdist*1.18; C.tgt.copy(C.gtgt); }
}
function touch(){ C.last = performance.now(); var h = $('hint'); if (!h.classList.contains('gone')) h.classList.add('gone'); }

var ptrs = {}, nptr = 0, drag = null, pinch = 0;
canvas.addEventListener('pointerdown', function(e){
  try { canvas.setPointerCapture(e.pointerId); } catch(x){}
  ptrs[e.pointerId] = { x:e.clientX, y:e.clientY }; nptr = Object.keys(ptrs).length;
  if (nptr === 1) drag = { x:e.clientX, y:e.clientY, t:performance.now(), moved:0 };
  else if (nptr === 2){ pinch = pdist(); if (drag) drag.moved = 99; }
  canvas.classList.add('dragging'); setTip(null); touch();
});
function pdist(){ var k = Object.keys(ptrs); if (k.length < 2) return 0; var a = ptrs[k[0]], b = ptrs[k[1]]; return Math.hypot(a.x-b.x, a.y-b.y); }
canvas.addEventListener('pointermove', function(e){
  var p = ptrs[e.pointerId];
  if (!p){ if (e.pointerType === 'mouse') hoverAt(e.clientX, e.clientY); return; }
  var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (nptr === 1 && drag){
    drag.moved += Math.abs(dx) + Math.abs(dy);
    C.gaz -= dx*0.0062; C.gel = Math.max(-1.45, Math.min(1.45, C.gel + dy*0.0062));
  } else if (nptr === 2){
    var d = pdist(); if (pinch > 0 && d > 0) C.gdist = Math.max(C.min, Math.min(C.max, C.gdist*pinch/d)); pinch = d;
  }
  touch();
});
function endPtr(e){
  if (!ptrs[e.pointerId]) return;
  delete ptrs[e.pointerId]; nptr = Object.keys(ptrs).length;
  if (nptr === 0){
    canvas.classList.remove('dragging');
    if (e.type === 'pointerup' && drag && drag.moved < 7 && performance.now() - drag.t < 600) clickAt(e.clientX, e.clientY);
    drag = null;
  }
}
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('pointerleave', function(){ setHover(null); setTip(null); });
canvas.addEventListener('wheel', function(e){
  e.preventDefault();
  var k = e.deltaMode === 1 ? 32 : 1;
  C.gdist = Math.max(C.min, Math.min(C.max, C.gdist*Math.exp(e.deltaY*k*0.0012))); touch();
}, { passive:false });

/* ---------- sélection ---------- */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(x, y){
  var r = canvas.getBoundingClientRect(); ndc.set((x - r.left)/r.width*2 - 1, -((y - r.top)/r.height*2 - 1));
  ray.setFromCamera(ndc, camera);
  if (S.mode === 'compare'){
    var best = null, bd = Infinity;
    cmp.items.forEach(function(it){ var h = ray.intersectObjects(it.M.meshes, false); if (h.length && h[0].distance < bd){ bd = h[0].distance; best = it.M.t.id; } });
    return best ? { tele:best } : null;
  }
  if (!current) return null;
  var hits = ray.intersectObjects(current.meshes, false);
  for (var i=0;i<hits.length;i++) if (hits[i].object.userData.part) return { part:hits[i].object.userData.part };
  return null;
}
function setTip(txt, x, y){
  var tip = $('hover-tip'); tip.hidden = !txt; if (!txt) return;
  var r = stage.getBoundingClientRect(); tip.textContent = txt;
  tip.style.left = Math.min(x - r.left, r.width - 190) + 'px'; tip.style.top = (y - r.top) + 'px';
}
function setHover(k){ if (S.hover === k) return; S.hover = k; applyHighlight(); canvas.classList.toggle('over-part', !!k); }
var hoverPending = null;
function hoverAt(x, y){
  if (hoverPending){ hoverPending = [x,y]; return; }
  hoverPending = [x,y];
  requestAnimationFrame(function(){
    var p = hoverPending; hoverPending = null;
    var h = pick(p[0], p[1]);
    if (S.mode === 'compare'){ canvas.classList.toggle('over-part', !!h); setTip(h ? 'Ouvrir ' + tele(h.tele).short : null, p[0], p[1]); return; }
    setHover(h ? h.part : null);
    setTip(h && h.part !== S.part ? current.parts[h.part].def.name : null, p[0], p[1]);
  });
}
function clickAt(x, y){
  var h = pick(x, y);
  if (S.mode === 'compare'){ if (h) location.hash = h.tele; return; }
  selectPart(h ? (h.part === S.part ? null : h.part) : null);
}

/* ---------- barre d'outils ---------- */
$('explode').addEventListener('input', function(){ S.explodeGoal = this.value/100; touch(); });
$('b-sun').addEventListener('click', function(){ S.sunReal = !S.sunReal; applyLighting(); });
$('b-spin').addEventListener('click', function(){ S.spin = !S.spin; this.setAttribute('aria-pressed', String(S.spin)); C.last = 0; });
$('b-reset').addEventListener('click', function(){ if (S.part) selectPart(null); S.explodeGoal = 0; $('explode').value = 0; frame(false); C.gaz += Math.round((C.az - C.gaz)/(2*Math.PI))*2*Math.PI; });
$('b-spin').setAttribute('aria-pressed', String(S.spin));
$('l-retry').addEventListener('click', function(){ show3D(true); });

/* ---------- chargement ---------- */
function loaderUI(state, t, a, b){
  var ld = $('loader'), err = ld.querySelector('.l-err');
  if (state === 'off'){ ld.hidden = true; return; }
  ld.hidden = false; ld.querySelector('.l-title').textContent = t;
  var isErr = state === 'error';
  err.hidden = !isErr; $('l-retry').hidden = !isErr; ld.querySelector('.bar').hidden = isErr; ld.querySelector('.l-sub').hidden = isErr;
  if (isErr){ err.textContent = a; return; }
  ld.querySelector('.bar i').style.width = (b ? Math.round(a/b*100) : 0) + '%';
  ld.querySelector('.l-sub').textContent = b ? (a/1048576).toFixed(1).replace('.', ',') + ' / ' + (b/1048576).toFixed(1).replace('.', ',') + ' Mo' : '';
}

var cmp = { group:new THREE.Group(), items:[], center:new THREE.Vector3(), w:10, h:10, depth:10, radius:20, ruler:null, built:false };
scene.add(cmp.group);
function resetRoot(M){ M.root.position.set(0,0,0); M.root.rotation.set(0,0,0); M.root.updateMatrixWorld(true); setExplode(M, 0); }

function layoutCompare(){
  var order = ['jwst','hubble','gaia','euclid'], gap = 3.4, portrait = camera.aspect < 0.95;
  cmp.items = order.map(function(id){
    var M = models[id]; resetRoot(M);
    M.meshes.forEach(function(o){ var m = o.material; if (m.userData.c0) m.color.copy(m.userData.c0); if (m.userData.em0){ m.emissive.copy(m.userData.em0); m.emissiveIntensity = m.userData.ei0; } });
    if (id === 'hubble') M.root.rotation.set(-Math.PI/2, 0, 0.0);
    if (id === 'gaia') M.root.rotation.set(0.5, 0, 0);
    if (id === 'euclid') M.root.rotation.set(0, -1.05, 0);
    if (id === 'jwst') M.root.rotation.set(0, 0.35, 0);
    M.root.updateMatrixWorld(true);
    var b = new THREE.Box3().setFromObject(M.root), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    return { M:M, sz:sz, c:c };
  });
  var all = new THREE.Box3();
  function place(it, cx, cy){ it.M.root.position.set(cx - it.c.x, cy - it.c.y, -it.c.z); it.M.root.updateMatrixWorld(true); it.anchor = new THREE.Vector3(cx, cy - it.sz.y/2, 0); it.cx = cx; it.M.root.parent !== cmp.group && cmp.group.add(it.M.root); all.expandByObject(it.M.root); }
  if (!portrait){
    var x = 0; cmp.items.forEach(function(it){ place(it, x + it.sz.x/2, 0); x += it.sz.x + gap; });
  } else {
    var rows = [[cmp.items[0], cmp.items[3]], [cmp.items[1], cmp.items[2]]], y = 0;
    rows.forEach(function(r){
      var hmax = Math.max(r[0].sz.y, r[1].sz.y), wsum = r[0].sz.x + r[1].sz.x + gap, x0 = -wsum/2;
      place(r[0], x0 + r[0].sz.x/2, y - hmax/2); place(r[1], x0 + r[0].sz.x + gap + r[1].sz.x/2, y - hmax/2);
      y -= hmax + 5.2;
    });
  }
  var sz = all.getSize(new THREE.Vector3()); all.getCenter(cmp.center);
  if (cmp.ruler) cmp.group.remove(cmp.ruler);
  if (!portrait) cmp.items.forEach(function(it){ it.anchor.set(it.cx, all.min.y - 0.4, 0); });
  var y0 = all.max.y + 1.6, x0 = all.min.x, pts = [x0,y0+0.35,0, x0,y0-0.35,0, x0,y0,0, x0+10,y0,0, x0+10,y0+0.35,0, x0+10,y0-0.35,0];
  for (var i=1;i<10;i++) pts.push(x0+i, y0, 0, x0+i, y0 + (i===5 ? 0.3 : 0.16), 0);
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  cmp.ruler = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color:0xEAF0F8 })); cmp.group.add(cmp.ruler);
  cmp.rulerAnchor = new THREE.Vector3(x0 + 5, y0, 0);
  cmp.center.y -= 0.6; cmp.w = sz.x + 2; cmp.h = sz.y + 8.5; cmp.depth = sz.z; cmp.radius = sz.length()/2 + 2;
  $('cmp-labels').innerHTML = cmp.items.map(function(it, i){ return '<button class="cmp-label" data-go="' + it.M.t.id + '" data-i="' + i + '"><b>' + esc(it.M.t.short) + '</b><span>' + esc(it.M.t.cmp.tag) + '</span></button>'; }).join('') + '<div class="cmp-ruler">10 m</div>';
  cmp.built = true; cmp.portrait = portrait;
}

show3D = function(changed){
  if (S.inst) return;
  if (!changed && (S.mode === 'compare' ? cmp.built && cmp.group.visible : current && current.t.id === S.id && current.root.parent === scene)) return;
  var token = ++loadToken;
  $('cmp-labels').hidden = true; $('callout').hidden = true; setTip(null);
  S.explodeGoal = S.explode = 0; $('explode').value = 0;
  var cmpMode = S.mode === 'compare';
  $('explode').disabled = cmpMode; $('b-sun').disabled = cmpMode; $('explode').parentNode.style.opacity = cmpMode ? 0.4 : 1;
  if (cmpMode){
    var done = 0, total = TELESCOPES.reduce(function(a,t){ return a + t.bytes; }, 0), got = {};
    var need = TELESCOPES.filter(function(t){ return !models[t.id]; });
    if (need.length) loaderUI('load', 'Chargement des quatre maquettes', 0, total);
    Promise.all(TELESCOPES.map(function(t){
      return loadModel(t, function(a){ got[t.id] = a; }).then(function(M){ got[t.id] = t.bytes; return M; });
    }).concat([new Promise(function(ok){ (function tick(){ if (token !== loadToken) return ok(); var s = 0; TELESCOPES.forEach(function(t){ s += models[t.id] ? t.bytes : (got[t.id]||0); }); if (need.length && !$('loader').hidden) loaderUI('load', 'Chargement des quatre maquettes', s, total); if (TELESCOPES.every(function(t){ return models[t.id]; })) ok(); else setTimeout(tick, 120); })(); })])).then(function(){
      if (token !== loadToken) return;
      if (current){ scene.remove(current.root); current = null; }
      cmp.group.visible = true; layoutCompare(); loaderUI('off'); $('cmp-labels').hidden = false;
      applyLighting(); frame(true);
    }).catch(function(e){ if (token === loadToken) loaderUI('error', 'Chargement interrompu', 'Une maquette n\'a pas pu être chargée (' + (e && e.message || 'erreur réseau') + ').'); });
    return;
  }
  var t = tele(S.id);
  cmp.group.visible = false;
  if (!models[t.id]){ if (current){ scene.remove(current.root); current = null; } loaderUI('load', 'Chargement de ' + t.short, 0, t.bytes); }
  loadModel(t, function(a, b){ if (token === loadToken) loaderUI('load', 'Chargement de ' + t.short, a, b); }).then(function(M){
    if (token !== loadToken) return;
    if (current && current !== M) scene.remove(current.root);
    if (M.root.parent === cmp.group) cmp.group.remove(M.root);
    resetRoot(M); scene.add(M.root); current = M; cmp.built = false;
    loaderUI('off'); applyLighting(); applyHighlight(); frame(true);
    prefetch();
  }).catch(function(e){
    if (token !== loadToken) return;
    loaderUI('error', 'La maquette de ' + t.short + ' n\'a pas pu être chargée', 'Le fichier 3D est introuvable ou la connexion a été interrompue (' + (e && e.message || 'erreur') + '). La fiche et les instruments restent consultables.');
  });
};

var prefetched = false;
function prefetch(){
  if (prefetched) return; prefetched = true;
  var c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
  var list = TELESCOPES.filter(function(t){ return !buffers[t.id]; }), i = 0;
  (function next(){ if (i >= list.length) return; var t = list[i++]; setTimeout(function(){ fetchModel(t).then(next, next); }, 600); })();
}

/* ---------- boucle ---------- */
function resize(){
  var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = bgCam.aspect = w/h; camera.updateProjectionMatrix(); bgCam.updateProjectionMatrix();
  if (S.mode === 'compare' && cmp.built){ if ((camera.aspect < 0.95) !== cmp.portrait) layoutCompare(); frame(false); }
  else if (current){ var keep = [C.gaz, C.gel]; frame(false); C.gaz = keep[0]; C.gel = keep[1]; }
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
resize();

var v3 = new THREE.Vector3(), clock = performance.now(), T0 = clock;
function project(p, el, dx, dy){
  v3.copy(p).project(camera);
  if (v3.z > 1 || v3.z < -1){ el.style.visibility = 'hidden'; return; }
  el.style.visibility = ''; el.style.left = ((v3.x*0.5+0.5)*stage.clientWidth + (dx||0)) + 'px'; el.style.top = ((-v3.y*0.5+0.5)*stage.clientHeight + (dy||0)) + 'px';
}
function tick(now){
  requestAnimationFrame(tick);
  if (S.inst || document.hidden) { clock = now; return; }
  var dt = Math.min(0.05, (now - clock)/1000); clock = now;
  var k = 1 - Math.exp(-dt*7);
  if (S.spin && !nptr && now - C.last > 2600 && !S.part) C.gaz += dt*(S.mode === 'compare' ? 0 : 0.085);
  if (S.mode === 'tele' && current){
    if (Math.abs(S.explodeGoal - S.explode) > 0.0005){ S.explode += (S.explodeGoal - S.explode)*(1 - Math.exp(-dt*9)); setExplode(current, S.explode); }
    var P = S.part && current.parts[S.part];
    if (P){ v3.copy(P.center).addScaledVector(P.off, S.explode); C.gtgt.copy(v3).multiplyScalar(0.55); } else C.gtgt.set(0,0,0);
  }
  C.az += (C.gaz - C.az)*k; C.el += (C.gel - C.el)*k; C.dist += (C.gdist - C.dist)*k; C.tgt.lerp(C.gtgt, k);
  var ce = Math.cos(C.el);
  camera.position.set(C.tgt.x + C.dist*ce*Math.sin(C.az), C.tgt.y + C.dist*Math.sin(C.el), C.tgt.z + C.dist*ce*Math.cos(C.az));
  camera.lookAt(C.tgt);
  var R = S.mode === 'compare' ? cmp.radius : (current ? current.radius : 10);
  camera.near = Math.max(0.05, C.dist - R*1.6); camera.far = C.dist + R*4; camera.updateProjectionMatrix();
  bgCam.quaternion.copy(camera.quaternion);
  if (earth.visible){ earth.children[0].rotation.x = (now - T0)/1000*(2*Math.PI/5700) + 0.6; earthMat.uniforms.t.value = (now - T0)/1000; }
  if (S.mode === 'tele' && current && S.part){
    var Q = current.parts[S.part]; v3.copy(Q.center).addScaledVector(Q.off, S.explode);
    var pulse = 0.15 + 0.07*Math.sin(now*0.004); Q.meshes.forEach(function(o){ o.material.emissiveIntensity = pulse; });
    project(v3, $('callout'));
  }
  if (S.mode === 'compare' && cmp.built){
    var ls = $('cmp-labels').children;
    cmp.items.forEach(function(it, i){ project(it.anchor, ls[i]); });
    project(cmp.rulerAnchor, ls[ls.length-1]);
  }
  renderer.clear(); renderer.render(bgScene, bgCam); renderer.clearDepth(); renderer.render(scene, camera);
}
canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); banner('Le contexte graphique a été perdu. Recharger la page pour retrouver la vue 3D.'); });

window.__obs = { S:S, C:C, models:models, cmp:cmp, pick:pick, camera:camera, get current(){ return current; } };
route();
requestAnimationFrame(tick);
})();
