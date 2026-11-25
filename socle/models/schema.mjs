// Maquettes « schéma de principe » pour les sondes sans maquette libre de droits :
// formes simples (boîtes, cylindres, prismes, paraboles) placées d'après les dimensions publiées (fiches NSSDCA, agences).
// Ce qui n'est pas publié (forme exacte des réservoirs, place des petits capteurs…) est approché, et la page le signale.
// Repère : mètres ; -Y vers le corps observé quand la sonde vise le sol (nadir), +Y à l'opposé.
// Usage : node schema.mjs <id> [sortie.glb]   (ids : voir SPECS ci-dessous)
import { Document, NodeIO } from '@gltf-transform/core';

const MAT = {
  foil:  [0.78, 0.62, 0.25, 0.35, 0.55],   // couverture thermique dorée : r, g, b, métal, rugosité
  white: [0.86, 0.86, 0.84, 0.0, 0.7],
  grey:  [0.45, 0.46, 0.48, 0.6, 0.45],
  dark:  [0.16, 0.17, 0.19, 0.3, 0.6],
  solar: [0.10, 0.16, 0.36, 0.3, 0.35],
  black: [0.06, 0.06, 0.07, 0.2, 0.5],
};

/* ---------- primitives : listes de triangles (positions, normales à facettes) ---------- */
function quad(out, a, b, c, d){ out.push([a, b, c], [a, c, d]); }
function box(w, h, d){ const x = w / 2, y = h / 2, z = d / 2, t = [];
  const P = (i, j, k) => [i * x, j * y, k * z];
  quad(t, P(-1,-1, 1), P( 1,-1, 1), P( 1, 1, 1), P(-1, 1, 1)); quad(t, P( 1,-1,-1), P(-1,-1,-1), P(-1, 1,-1), P( 1, 1,-1));
  quad(t, P( 1,-1, 1), P( 1,-1,-1), P( 1, 1,-1), P( 1, 1, 1)); quad(t, P(-1,-1,-1), P(-1,-1, 1), P(-1, 1, 1), P(-1, 1,-1));
  quad(t, P(-1, 1, 1), P( 1, 1, 1), P( 1, 1,-1), P(-1, 1,-1)); quad(t, P(-1,-1,-1), P( 1,-1,-1), P( 1,-1, 1), P(-1,-1, 1));
  return t; }
/* prisme vertical (axe Y) sur un contour [x, z] donné dans le sens trigonométrique vu de +Y */
function prism(ring, h){ const t = [], y0 = -h / 2, y1 = h / 2, n = ring.length;
  for (let i = 0; i < n; i++){ const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % n];
    quad(t, [ax, y0, az], [ax, y1, az], [bx, y1, bz], [bx, y0, bz]);
    t.push([[0, y1, 0], [bx, y1, bz], [ax, y1, az]], [[0, y0, 0], [ax, y0, az], [bx, y0, bz]]); }
  return t; }
function circle(r, n){ const a = []; for (let i = 0; i < n; i++){ const t = -i / n * 2 * Math.PI; a.push([r * Math.cos(t), r * Math.sin(t)]); } return a; }
function cyl(r, h, n = 24){ return prism(circle(r, n), h); }
function cone(r0, r1, h, n = 24){ const t = [];   // tronc de cône, axe Y, r0 en bas, r1 en haut
  for (let i = 0; i < n; i++){ const a = i / n * 2 * Math.PI, b = (i + 1) / n * 2 * Math.PI, c = Math.cos, s = Math.sin;
    quad(t, [r0 * c(a), -h / 2, r0 * s(a)], [r0 * c(b), -h / 2, r0 * s(b)], [r1 * c(b), h / 2, r1 * s(b)], [r1 * c(a), h / 2, r1 * s(a)]); }
  return t.map(f => [f[0], f[2], f[1]]).map(f => f); }
/* parabole ouverte vers +Y : rayon r, profondeur d */
function dish(r, d, n = 32, m = 6){ const t = [], P = (i, j) => { const rr = r * j / m, a = i / n * 2 * Math.PI; return [rr * Math.cos(a), d * (rr / r) ** 2, rr * Math.sin(a)]; };
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++){ const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), e = P(i, j + 1);
    quad(t, a, e, c, b); quad(t, a, b, c, e); }   // deux faces : visible de dos comme de face
  return t; }
/* ---------- placement ---------- */
function rotY(t, a){ const c = Math.cos(a), s = Math.sin(a); return t.map(f => f.map(([x, y, z]) => [c * x + s * z, y, -s * x + c * z])); }
function rotX(t, a){ const c = Math.cos(a), s = Math.sin(a); return t.map(f => f.map(([x, y, z]) => [x, c * y - s * z, s * y + c * z])); }
function rotZ(t, a){ const c = Math.cos(a), s = Math.sin(a); return t.map(f => f.map(([x, y, z]) => [c * x - s * y, s * x + c * y, z])); }
function at(t, x, y, z){ return t.map(f => f.map(p => [p[0] + x, p[1] + y, p[2] + z])); }
/* tige de A à B (cylindre fin) */
function rod(A, B, r = 0.02){ const d = B.map((v, i) => v - A[i]), L = Math.hypot(...d); let t = cyl(r, L, 8);
  const yaw = Math.atan2(d[0], d[2]), pitch = Math.acos(d[1] / L);
  t = rotX(t, pitch); t = rotY(t, yaw); return at(t, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2); }

/* ---------- les sondes ---------- */
const SPECS = {
  /* Lunar Prospector (NSSDCA 1998-001A) : tambour de 1,37 m × 1,28 m, trois perches radiales de 2,5 m, rallonge de 1,1 m portant le magnétomètre,
     cellules solaires sur la coque. Axe de rotation (ici Y) perpendiculaire à l'écliptique : les perches tournent dans le plan X-Z. */
  lp(){ const R = 0.685, P = {}, dir = a => [Math.cos(a), 0, Math.sin(a)], tip = (a, L) => dir(a).map(v => v * (R + L));
    const a1 = 0, a2 = 2 * Math.PI / 3, a3 = 4 * Math.PI / 3;
    P.bus = [['solar', cyl(R, 1.28, 36)], ['grey', at(cyl(R * 0.97, 0.03, 36), 0, 0.655, 0)], ['grey', at(cyl(R * 0.97, 0.03, 36), 0, -0.655, 0)],
             ['dark', at(cyl(0.12, 0.25, 12), 0, 0.78, 0)]];   // antenne moyen gain sur l'axe (forme approchée)
    P.booms = [['white', rod([R * Math.cos(a1), 0, R * Math.sin(a1)], tip(a1, 2.5), 0.025)], ['white', rod([R * Math.cos(a2), 0, R * Math.sin(a2)], tip(a2, 2.5), 0.025)],
               ['white', rod([R * Math.cos(a3), 0, R * Math.sin(a3)], tip(a3, 2.5), 0.025)]];
    const g = tip(a1, 2.6); P.grs = [['foil', at(rotY(rotZ(cyl(0.09, 0.34, 16), Math.PI / 2), -a1), g[0], g[1], g[2])]];
    const n = tip(a2, 2.6); P.ns = [['foil', at(rotY(cyl(0.06, 0.32, 16), -a2), n[0], n[1], n[2])], ['grey', at(box(0.08, 0.05, 0.09), n[0], n[1] + 0.2, n[2])]];
    const e = tip(a3, 2.55), m = tip(a3, 2.5 + 1.1);
    P.mag = [['grey', at(cyl(0.06, 0.09, 12), e[0], e[1], e[2])], ['white', rod(e, m, 0.015)], ['grey', at(box(0.11, 0.065, 0.065), m[0], m[1], m[2])]];
    return P; },

  /* Orbiteur de Viking 1 (NSSDCA 1975-075A) : octogone de ≈ 2,5 m, faces de 0,4572 m de haut, alternativement 1,397 et 0,508 m de large ;
     3,29 m de haut au total ; quatre ailes de deux panneaux de 1,57 × 1,23 m, 9,75 m de bout en bout ; parabole de ≈ 1,5 m au bord de la base ;
     moteur au-dessus du module. Plateforme des caméras sous le module, côté Mars (-Y). */
  vo(){ const P = {}, long = 1.397, short = 0.508;
    // octogone à côtés alternés : on parcourt les 8 côtés en tournant de 45° à chaque fois
    let x = -long / 2, z = 0, a = 0; const ring = [];
    for (let i = 0; i < 8; i++){ ring.push([x, z]); const L = i % 2 ? short : long; x += L * Math.cos(a); z += L * Math.sin(a); a += Math.PI / 4; }
    const cx = ring.reduce((s, p) => s + p[0], 0) / 8, cz = ring.reduce((s, p) => s + p[1], 0) / 8;
    const oct = ring.map(([x, z]) => [x - cx, z - cz]).reverse();
    const half = Math.max(...oct.map(([x, z]) => Math.hypot(x, z)));
    P.bus = [['foil', prism(oct, 0.4572)], ['dark', at(prism(oct.map(([x, z]) => [x * 0.55, z * 0.55]), 0.05), 0, -0.25, 0)]];
    // module de propulsion au-dessus (réservoirs et moteur : formes approchées), sommet à 3,29 m du bas des fixations de l'atterrisseur
    P.engine = [['white', at(cyl(0.45, 1.3, 24), 0, 0.23 + 0.65, 0)], ['grey', at(cyl(0.18, 0.3, 16), 0, 1.68, 0)],
                ['dark', at(cone(0.28, 0.1, 0.5, 20), 0, 2.08, 0)]];
    // ailes solaires : du bord du module à 4,875 m de l'axe, deux panneaux de 1,57 m (le long de l'aile) × 1,23 m
    P.solar = [];
    for (let k = 0; k < 4; k++){ const ang = k * Math.PI / 2 + Math.PI / 8;
      for (let j = 0; j < 2; j++){ const r = 4.875 - 1.57 / 2 - j * 1.57;
        P.solar.push(['solar', rotY(at(box(1.55, 0.03, 1.21), r, 0.1, 0), ang)]); }
      P.solar.push(['white', rotY(rod([half * 0.95, 0.1, 0], [4.875 - 2 * 1.57, 0.1, 0], 0.03), ang)]); }
    // antenne grand gain : ≈ 1,5 m, au bord de la base, tournée vers l'extérieur (orientable)
    P.hga = [['white', at(rotZ(dish(0.75, 0.22), -Math.PI / 2 - 0.5), half + 0.55, -0.2, 0)], ['grey', rod([half * 0.9, -0.2, 0], [half + 0.45, -0.2, 0], 0.03)]];
    // plateforme orientable : caméras VIS, IRTM, MAWD (place et forme approchées), sous le module
    P.scan = [['grey', at(box(0.5, 0.25, 0.4), 0.6, -0.65, 0.5)], ['black', at(cyl(0.07, 0.35, 12), 0.5, -0.9, 0.42)], ['black', at(cyl(0.07, 0.35, 12), 0.7, -0.9, 0.42)],
              ['grey', at(box(0.14, 0.14, 0.14), 0.6, -0.86, 0.65)], ['grey', rod([0.4, -0.23, 0.3], [0.6, -0.55, 0.5], 0.03)]];
    return P; },
};

/* ---------- écriture ---------- */
async function build(id, out){
  const parts = SPECS[id](), doc = new Document(), buf = doc.createBuffer(), scene = doc.createScene(id), mats = {};
  const mat = k => mats[k] || (mats[k] = doc.createMaterial(k).setBaseColorFactor([MAT[k][0], MAT[k][1], MAT[k][2], 1]).setMetallicFactor(MAT[k][3]).setRoughnessFactor(MAT[k][4]).setDoubleSided(true));
  let nv = 0;
  for (const [key, list] of Object.entries(parts)){
    const node = doc.createNode(key), mesh = doc.createMesh(key), by = {};
    list.forEach(([m, tris]) => (by[m] = (by[m] || []).concat(tris)));
    for (const [m, tris] of Object.entries(by)){
      const pos = new Float32Array(tris.length * 9), nor = new Float32Array(tris.length * 9);
      tris.forEach((f, i) => { const [a, b, c] = f, u = b.map((v, k) => v - a[k]), v = c.map((w, k) => w - a[k]);
        let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...n) || 1; n = n.map(q => q / l);
        [a, b, c].forEach((p, j) => { pos.set(p, i * 9 + j * 3); nor.set(n, i * 9 + j * 3); }); });
      nv += tris.length * 3;
      mesh.addPrimitive(doc.createPrimitive().setMaterial(mat(m))
        .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buf))
        .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nor).setBuffer(buf)));
    }
    scene.addChild(node.setMesh(mesh));
  }
  await new NodeIO().write(out, doc);
  console.log(out, Object.keys(parts).join(' '), nv, 'sommets');
}
const id = process.argv[2]; if (!SPECS[id]) { console.error('ids :', Object.keys(SPECS).join(' ')); process.exit(1); }
await build(id, process.argv[3] || new URL('../../models/' + id + '.glb', import.meta.url).pathname);
