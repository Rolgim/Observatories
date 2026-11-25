/* =================================================================
   VUE 3D — maquette d'une sonde : rotation, zoom, pièces cliquables, vue éclatée.
   Version allégée de la vue d'Observatories v1.0 (src/app.js là-bas) : même lecture des maquettes quantifiées
   (positions converties en flottants pour le lancer de rayon), mêmes règles de surlignage.
   Viewer.open(stageEl, mission, { onPick(key|null), onState(text) }) ; Viewer.select(key) ; Viewer.explode(0..1).
================================================================= */
var Viewer = (function(){
'use strict';
var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var renderer = null, scene, camera, key, fill, hemi, loader, M = null, host = null, opts = {}, raf = 0, sel = null, hov = null, spin = !REDUCED, ex = 0;
var C = { az:0.5, el:0.25, dist:20 };
var models = {}, globe = null, globeFor = null, ring = null;
/* corps survolé et orbite (schéma de principe) : le corps est au centre de la scène, la sonde tourne autour de lui sur une orbite circulaire,
   côté instruments (nadir) toujours tourné vers le centre. Deux vues : « sonde » (caméra attachée à la sonde, le sol défile dessous) et
   « orbite » (caméra loin du corps, sonde agrandie). Ni les tailles, ni l'altitude, ni la vitesse, ni l'inclinaison ne sont à l'échelle. */
var O = { on:false, th:0.6, view:'probe', rb:1, inc:90, last:0, run:!REDUCED, k:1 }, carrier = null, sunDir = null;
var V2 = { az:0.4, el:0.35, dist:5 };   /* caméra de la vue d'orbite, en rayons du corps */
function setBody(t, R){
  if (globe){ scene.remove(globe); globe = null; } if (ring){ scene.remove(ring); ring = null; }
  var meta = t.body && (window.DATA_FILES || {})['tex-' + t.body.tex];
  O.on = !!meta;
  if (!meta) return false;
  O.rb = R * 30; O.inc = t.body.inc == null ? 90 : t.body.inc; O.k = O.rb * 0.14 / R;
  var tex = new THREE.TextureLoader().load('data/tex-' + t.body.tex + '.jpg'); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  globe = new THREE.Mesh(new THREE.SphereGeometry(O.rb, 128, 64), new THREE.MeshStandardMaterial({ map:tex, color:0x9a9a9a, roughness:1, metalness:0 }));
  scene.add(globe); globeFor = t.id;
  /* trace de l'orbite, visible en vue d'orbite seulement */
  var i = O.inc * Math.PI / 180, pts = [], ro = O.rb + R * O.k * 2.2;
  for (var a = 0; a <= 128; a++){ var th = a / 128 * 2 * Math.PI; pts.push(new THREE.Vector3(Math.cos(th) * ro, Math.sin(th) * Math.sin(i) * ro, Math.sin(th) * Math.cos(i) * ro)); }
  ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color:0x8fb8ff, transparent:true, opacity:0.55 }));
  scene.add(ring);   /* à part du globe : le globe tourne, pas l'orbite */
  return true;
}
/* repère de l'orbite au temps th : position p, direction du mouvement vel, verticale locale up */
function orbitFrame(){
  var i = O.inc * Math.PI / 180, u = new THREE.Vector3(1, 0, 0), v = new THREE.Vector3(0, Math.sin(i), Math.cos(i));
  var up = u.clone().multiplyScalar(Math.cos(O.th)).addScaledVector(v, Math.sin(O.th));
  var vel = u.clone().multiplyScalar(-Math.sin(O.th)).addScaledVector(v, Math.cos(O.th));
  var alt = O.view === 'orbit' ? M.radius * O.k * 2.2 : M.radius * 2.4;
  var q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vel, up, vel.clone().cross(up)));
  return { p:up.clone().multiplyScalar(O.rb + alt), up:up, q:q };
}

function ok(){ return !!(window.THREE && THREE.GLTFLoader); }
function init(){
  if (renderer || !ok()) return !!renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias:true }); } catch(e){ renderer = null; return false; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputEncoding = THREE.sRGBEncoding;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(35, 1, 0.05, 2000);
  key = new THREE.DirectionalLight(0xffffff, 2.6); fill = new THREE.DirectionalLight(0x8fb0e8, 0.45); hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.5);
  scene.add(key, fill, hemi);
  loader = new THREE.GLTFLoader();
  var cv = renderer.domElement, drag = null;
  cv.setAttribute('aria-hidden', 'true');
  cv.addEventListener('pointerdown', function(e){ drag = { x:e.clientX, y:e.clientY, moved:false }; cv.setPointerCapture(e.pointerId); spin = false; });
  cv.addEventListener('pointermove', function(e){
    if (drag){ var dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      var c = cam(); c.az -= dx * 0.008; c.el = Math.max(globe && O.view === 'probe' ? -0.3 : -1.4, Math.min(1.4, c.el + dy * 0.006)); drag.x = e.clientX; drag.y = e.clientY; cv.classList.add('dragging'); return; }
    var k = pick(e); if (k !== hov){ hov = k; highlight(); cv.classList.toggle('over-part', !!k); }
  });
  cv.addEventListener('pointerup', function(e){ cv.classList.remove('dragging'); if (drag && !drag.moved){ var k = pick(e); select(sel === k ? null : k); if (opts.onPick) opts.onPick(sel); } drag = null; });
  cv.addEventListener('pointerleave', function(){ if (hov){ hov = null; highlight(); } });
  cv.addEventListener('wheel', function(e){ e.preventDefault(); if (!M) return; var f = 1 + Math.sign(e.deltaY) * 0.1;
    if (cam() === V2) V2.dist = Math.max(1.6, Math.min(10, V2.dist * f)); else C.dist = Math.max(M.radius * 1.1, Math.min(M.radius * 8, C.dist * f)); }, { passive:false });
  return true;
}
function cam(){ return O.on && O.view === 'orbit' ? V2 : C; }
function pick(e){
  if (!M) return null;
  var r = renderer.domElement.getBoundingClientRect(), v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  var rc = new THREE.Raycaster(); rc.setFromCamera(v, camera);
  var hit = rc.intersectObjects(M.meshes, false)[0];
  return hit ? hit.object.userData.part || null : null;
}
function prepare(t, gltf){
  var inner = gltf.scene, root = new THREE.Group();
  /* three r128 ne dénormalise pas les attributs entiers côté CPU (lancer de rayon, boîtes) : positions converties en flottants */
  inner.traverse(function(o){
    if (!o.isMesh) return; var g = o.geometry, pa = g.attributes.position;
    if (!pa || !(pa.normalized || pa.isInterleavedBufferAttribute)) return;
    var arr = pa.array || pa.data.array, nm = pa.normalized, den = arr instanceof Int16Array ? 32767 : arr instanceof Uint16Array ? 65535 : arr instanceof Int8Array ? 127 : arr instanceof Uint8Array ? 255 : 1;
    var out = new Float32Array(pa.count * 3);
    for (var i = 0; i < pa.count; i++){ var x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); if (nm){ x = Math.max(x/den, -1); y = Math.max(y/den, -1); z = Math.max(z/den, -1); } out[i*3] = x; out[i*3+1] = y; out[i*3+2] = z; }
    g.setAttribute('position', new THREE.BufferAttribute(out, 3)); g.boundingBox = null; g.boundingSphere = null; g.computeBoundingSphere();
  });
  inner.updateMatrixWorld(true);
  var box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  if (t.view && t.view.r){   /* longues antennes : on centre sur le module (pièce « bus ») plutôt que sur la boîte entière */
    var bb = new THREE.Box3(); inner.traverse(function(o){ if (!o.isMesh) return; for (var p = o; p && p !== inner; p = p.parent) if (/^bus(_\d+)?$/.test(p.name || '')){ bb.expandByObject(o); return; } });
    if (!bb.isEmpty()) bb.getCenter(ctr);
  }
  var s = t.unit || (t.axis ? t.size / size[t.axis] : 1);   /* unit : mètres par unité de la maquette ; sinon size le long de axis */
  inner.scale.setScalar(s); inner.position.copy(ctr).multiplyScalar(-s); root.add(inner); root.updateMatrixWorld(true);
  var R = { root:root, radius:(t.view && t.view.r) || size.length() * s / 2, meshes:[], parts:{} };   /* view.r : rayon de cadrage (antennes très longues exclues) */
  t.parts.forEach(function(p){ R.parts[p.key] = { meshes:[], box:new THREE.Box3() }; });
  inner.traverse(function(o){
    if (!o.isMesh) return;
    var k = null; for (var p = o; p && p !== root && !k; p = p.parent) if (R.parts[(p.name || '').replace(/_\d+$/, '')]) k = (p.name || '').replace(/_\d+$/, '');
    o.material = o.material.clone(); o.material.side = THREE.DoubleSide; o.userData.part = k; R.meshes.push(o);
    if (k){ R.parts[k].meshes.push(o); R.parts[k].box.expandByObject(o); }
  });
  /* vue éclatée : chaque pièce s'écarte du centre le long de la direction de son propre centre (schéma de principe) */
  for (var k in R.parts){ var P = R.parts[k]; if (P.box.isEmpty()) continue;
    var dir = P.box.getCenter(new THREE.Vector3()); if (dir.length() < R.radius * 0.15) dir.set(0, 0, 0); else dir.normalize().multiplyScalar(R.radius * 0.5);
    P.meshes.forEach(function(o){ o.userData.base = o.position.clone(); o.userData.ex = dir.clone().divideScalar(s); }); }   /* nœuds de la maquette sans rotation propre (seg_lib.js) */
  /* la maquette est tournée pour que le côté des instruments (nadir) regarde vers le bas : le corps survolé est toujours sous la sonde */
  R.q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3().fromArray(t.body ? t.body.nadir : [0, -1, 0]).normalize(), new THREE.Vector3(0, -1, 0));
  var top = new THREE.Group(); top.quaternion.copy(R.q); top.add(root); R.root = top;
  return R;
}
/* sonde sans maquette libre de droits : un point lumineux à la couleur de surlignage (schéma de principe) */
function placeholder(t){
  var g = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 16), new THREE.MeshBasicMaterial({ color:0x3D7BFF }));
  var halo = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 16), new THREE.MeshBasicMaterial({ color:0x8fb8ff, transparent:true, opacity:0.35, depthWrite:false }));
  var top = new THREE.Group(); top.add(g, halo);
  return { root:top, radius:(t.view && t.view.r) || 3, meshes:[], parts:{}, q:new THREE.Quaternion() };
}
function highlight(){
  if (!M) return;
  M.meshes.forEach(function(o){ var m = o.material, k = o.userData.part; if (!m.emissive) return;
    if (m.userData.c0 === undefined){ m.userData.c0 = m.color.clone(); m.userData.e0 = m.emissive.clone(); }
    m.emissive.copy(m.userData.e0); m.color.copy(m.userData.c0);
    if (k && k === sel){ m.emissive.setHex({{mark3d}}); m.emissiveIntensity = 0.35; }
    else if (k && k === hov){ m.emissive.setHex(0xffffff); m.emissiveIntensity = 0.1; }
    else if (sel) m.color.multiplyScalar(0.5); });
}
function resize(){ if (!host || !renderer) return; var w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); }
function frame(now){
  raf = requestAnimationFrame(frame);
  if (!M || !host || !host.isConnected) return;
  var dt = O.last ? Math.min(0.1, (now - O.last) / 1000) : 0; O.last = now;
  M.meshes.forEach(function(o){ if (o.userData.base) o.position.copy(o.userData.base).addScaledVector(o.userData.ex, ex); });
  if (!O.on){
    if (spin) C.az += 0.0025;
    carrier.position.set(0, 0, 0); carrier.quaternion.identity(); carrier.scale.setScalar(1);
    var ce = Math.cos(C.el); camera.up.set(0, 1, 0); camera.position.set(Math.sin(C.az) * ce * C.dist, Math.sin(C.el) * C.dist, Math.cos(C.az) * ce * C.dist); camera.lookAt(0, 0, 0);
    return renderer.render(scene, camera);
  }
  if (O.run) O.th += dt * 2 * Math.PI / (O.view === 'orbit' ? 40 : 120);   /* un tour en 2 min (vue sonde) ou 40 s (vue d'orbite) : accéléré */
  if (O.run) globe.rotation.y += dt * 2 * Math.PI / 90;   /* le corps tourne aussi sur lui-même, vers l'est (un tour en 90 s : accéléré, schéma de principe) */
  var F = orbitFrame(), big = O.view === 'orbit';
  carrier.position.copy(F.p); carrier.quaternion.copy(F.q); carrier.scale.setScalar(big ? O.k : 1); ring.visible = big;
  if (big){
    var c2 = Math.cos(V2.el), d = V2.dist * O.rb; camera.up.set(0, 1, 0);
    camera.position.set(Math.sin(V2.az) * c2 * d, Math.sin(V2.el) * d, Math.cos(V2.az) * c2 * d); camera.lookAt(0, 0, 0);
  } else {
    var ce2 = Math.cos(C.el), off = new THREE.Vector3(Math.sin(C.az) * ce2, Math.sin(C.el), Math.cos(C.az) * ce2).multiplyScalar(C.dist).applyQuaternion(F.q);
    camera.up.copy(F.up); camera.position.copy(F.p).add(off); camera.lookAt(F.p);
  }
  renderer.render(scene, camera);
}
function open(el, t, o){
  opts = o || {}; host = el;
  if (!init()){ if (opts.onState) opts.onState('nogl'); return; }
  el.insertBefore(renderer.domElement, el.firstChild); resize();
  if (!raf) { window.addEventListener('resize', resize); frame(); }
  sel = null; hov = null; ex = 0;
  if (M && carrier) carrier.remove(M.root);
  var show = function(R){ M = R; if (!carrier){ carrier = new THREE.Group(); scene.add(carrier); } carrier.add(M.root); C.az = t.view.az; C.el = t.view.el; C.dist = M.radius * 2 * t.view.dist;
    var hasBody = setBody(t, M.radius); O.last = 0;
    /* Soleil : direction fixe dans l'espace, surtout hors du plan de l'orbite pour que la sonde reste éclairée (schéma de principe) */
    if (hasBody){ var i = O.inc * Math.PI / 180; sunDir = new THREE.Vector3(0.55, 0, 0).add(new THREE.Vector3(0, -Math.cos(i), Math.sin(i)).multiplyScalar(0.8)).add(new THREE.Vector3(0, 0.25, 0)).normalize(); key.position.copy(sunDir).multiplyScalar(O.rb * 4); fill.position.copy(sunDir).multiplyScalar(-O.rb * 4); }
    else { key.position.fromArray(t.sun).applyQuaternion(M.q).multiplyScalar(M.radius * 4); fill.position.set(-0.6, -0.2, -0.5); }
    highlight();
    camera.near = M.radius * 0.02; camera.far = (hasBody ? O.rb * 20 : M.radius * 200); camera.updateProjectionMatrix();
    if (opts.onState) opts.onState('ready', hasBody); };
  if (models[t.id]) return show(models[t.id]);
  if (!t.file) return show(models[t.id] = placeholder(t));
  if (opts.onState) opts.onState('loading');
  var url = t.file;
  fetch(url).then(function(r){ if (!r.ok) throw new Error(r.status); return /\.txt$/.test(url) ? r.text().then(function(b){ var s = atob(b.trim()), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }) : r.arrayBuffer(); })
    .then(function(buf){ loader.parse(buf, '', function(g){ show(models[t.id] = prepare(t, g)); }, function(e){ if (opts.onState) opts.onState('error'); }); })
    .catch(function(){ if (opts.onState) opts.onState('error'); });
}
function select(k){ sel = k || null; highlight(); }
return { open:open, select:select, explode:function(v){ ex = v; }, spin:function(v){ spin = v && !REDUCED; },
  reset:function(t){ if (M){ C.az = t.view.az; C.el = t.view.el; C.dist = M.radius * 2 * t.view.dist; V2.az = 0.4; V2.el = 0.35; V2.dist = 5; } },
  view:function(v){ if (v) O.view = v; return O.view; }, run:function(v){ if (v != null){ O.run = !!v; spin = !!v && !REDUCED; } return O.run; },
  hasOrbit:function(){ return O.on; }, available:ok };
})();
