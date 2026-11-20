#!/usr/bin/env bash
# Reconstruit models/*.glb à partir des maquettes d'origine (voir tools/models/README.md).
#   DL=/chemin/des/sources  bash tools/models/build_models.sh
# Attendus dans $DL : euclid/spacecraft-euclid/models, gaia/mission-gaia/models/gaia (jeux de données Gaia Sky),
# et dans ce dossier : jwst_src.glb (maquette NASA décodée et soudée), hst_tex.glb (maquette HST, textures 1024 px).
set -e
W="$(cd "$(dirname "$0")" && pwd)"; DL="${DL:?indiquer DL=dossier des maquettes sources}"; OUT="$W/../../models"; mkdir -p "$OUT" "$W/tmp"
GT="npx gltf-transform"
# ---------- Euclid: OBJ -> GLB, 2048 textures, segment
E=$DL/euclid/spacecraft-euclid/models
npx obj2gltf -i $E/euclid.obj -o $W/tmp/euclid_raw.glb --binary >/dev/null
$GT resize $W/tmp/euclid_raw.glb $W/tmp/euclid_r.glb --width 2048 --height 2048 >/dev/null
$GT jpeg $W/tmp/euclid_r.glb $W/tmp/euclid_j.glb --quality 86 --formats "*" >/dev/null
$GT weld $W/tmp/euclid_j.glb $W/tmp/euclid_w.glb >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/euclid_w.glb','$W/tmp/euclid_seg.glb',require('$W/euclid_cls.js')).then(s=>console.log('euclid',JSON.stringify(s)))"
$GT quantize $W/tmp/euclid_seg.glb $OUT/euclid.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12 >/dev/null 2>&1
# ---------- Gaia: OBJ (normal maps re-enabled) -> GLB
G=$W/tmp/gaia_src; rm -rf $G; cp -r $DL/gaia/mission-gaia/models/gaia $G
sed -i 's/^map_Kn /map_Bump /' $G/gaia.mtl
npx obj2gltf -i $G/gaia.obj -o $W/tmp/gaia_raw.glb --binary >/dev/null
$GT quantize $W/tmp/gaia_raw.glb $OUT/gaia.glb --quantize-position 14 --quantize-normal 10 >/dev/null 2>&1
# ---------- JWST: segment the welded NASA model
node -e "require('$W/seg_lib.js').segment('$W/jwst_src.glb','$W/tmp/jwst_seg.glb',require('$W/jwst_cls.js')).then(s=>console.log('jwst',JSON.stringify(s)))"
$GT quantize $W/tmp/jwst_seg.glb $OUT/jwst.glb --quantize-position 14 --quantize-normal 10 >/dev/null 2>&1
# ---------- Hubble: segmented already from textured source
(cd $W && node seg_hst.js)
$GT quantize $W/hst_seg.glb $OUT/hubble.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12 >/dev/null 2>&1
# ---------- Roman: NASA model (A), Draco-decoded, simplified, segmented, slimmed
# attendu dans $DL : roman/romanA.glb (« Nancy Grace Roman Space Telescope (A).glb » du dépôt nasa/NASA-3D-Resources)
$GT copy $DL/roman/romanA.glb $W/tmp/roman_dec.glb >/dev/null
$GT weld $W/tmp/roman_dec.glb $W/tmp/roman_w.glb >/dev/null
$GT simplify $W/tmp/roman_w.glb $W/tmp/roman_s.glb --ratio 0.08 --error 0.004 >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/roman_s.glb','$W/tmp/roman_seg.glb',require('$W/roman_cls.js')).then(s=>console.log('roman',JSON.stringify(s)))"
(cd $W && node slim.mjs $W/tmp/roman_seg.glb $OUT/roman.glb 0.25 0.002)
# ---------- Chandra : maquette NASA (Draco, textures WebP), en mètres, redécoupée
# attendu dans $DL : chandra/chandra.glb (« Chandra X-ray Observatory.glb » du dépôt nasa/NASA-3D-Resources)
$GT copy $DL/chandra/chandra.glb $W/tmp/chandra_dec.glb >/dev/null
$GT weld $W/tmp/chandra_dec.glb $W/tmp/chandra_w.glb >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/chandra_w.glb','$W/tmp/chandra_seg.glb',require('$W/chandra_cls.js')).then(s=>console.log('chandra',JSON.stringify(s)))"
$GT quantize $W/tmp/chandra_seg.glb $OUT/chandra.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12 >/dev/null 2>&1
# ---------- Spitzer : maquette NASA (Draco), en mètres, redécoupée
# attendu dans $DL : spitzer/spitzer.glb (« Spitzer Space Telescope.glb » du dépôt nasa/NASA-3D-Resources)
$GT copy $DL/spitzer/spitzer.glb $W/tmp/spitzer_dec.glb >/dev/null
$GT weld $W/tmp/spitzer_dec.glb $W/tmp/spitzer_w.glb >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/spitzer_w.glb','$W/tmp/spitzer_seg.glb',require('$W/spitzer_cls.js')).then(s=>console.log('spitzer',JSON.stringify(s)))"
$GT quantize $W/tmp/spitzer_seg.glb $OUT/spitzer.glb --quantize-position 14 --quantize-normal 10 >/dev/null 2>&1
# ---------- Fermi : maquette NASA (Draco), unités de la maquette (mise à l'échelle par le site), redécoupée et allégée
# attendu dans $DL : fermi/fermi.glb (« Fermi Gamma-ray Large Area Space Telescope.glb » du dépôt nasa/NASA-3D-Resources)
$GT copy $DL/fermi/fermi.glb $W/tmp/fermi_dec.glb >/dev/null
$GT weld $W/tmp/fermi_dec.glb $W/tmp/fermi_w.glb >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/fermi_w.glb','$W/tmp/fermi_seg.glb',require('$W/fermi_cls.js')).then(s=>console.log('fermi',JSON.stringify(s)))"
(cd $W && node slim.mjs $W/tmp/fermi_seg.glb $OUT/fermi.glb 0.15 0.002)
# ---------- TESS : maquette NASA (Draco, version B), unités de la maquette (mise à l'échelle par le site), redécoupée
# attendu dans $DL : tess/tess.glb (« Transiting Exoplanet Survey Satellite (TESS) (B).glb » du dépôt nasa/NASA-3D-Resources)
# le redécoupage garde les textures WebP et laisse tomber les doublons PNG (repli EXT_texture_webp)
$GT copy $DL/tess/tess.glb $W/tmp/tess_dec.glb >/dev/null
$GT weld $W/tmp/tess_dec.glb $W/tmp/tess_w.glb >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/tess_w.glb','$W/tmp/tess_seg.glb',require('$W/tess_cls.js')).then(s=>console.log('tess',JSON.stringify(s)))"
$GT quantize $W/tmp/tess_seg.glb $OUT/tess.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12 >/dev/null 2>&1
# ---------- Kepler : maquette NASA (version A), en mètres, redécoupée
# attendu dans $DL : kepler/kepler.glb (« Kepler (A).glb » du dépôt nasa/NASA-3D-Resources)
$GT copy $DL/kepler/kepler.glb $W/tmp/kepler_dec.glb >/dev/null
$GT weld $W/tmp/kepler_dec.glb $W/tmp/kepler_w.glb >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/kepler_w.glb','$W/tmp/kepler_seg.glb',require('$W/kepler_cls.js')).then(s=>console.log('kepler',JSON.stringify(s)))"
$GT quantize $W/tmp/kepler_seg.glb $OUT/kepler.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12 >/dev/null 2>&1
# ---------- XMM-Newton : maquette de l'ESA (service SPICE, misc/cosmo/xmm.obj + alb.png), convertie en GLB par trimesh
# attendu dans $DL : xmm/xmm.obj, xmm/xmm.mtl, xmm/alb.png (tools/probe/fetch_xmm_model.py les récupère depuis la CI)
python3 -c "import trimesh; trimesh.load('$DL/xmm/xmm.obj', force='mesh', process=False).export('$W/tmp/xmm_raw.glb', include_normals=True)"   # sans normales, toute la maquette s'éclaire comme une surface plate
$GT weld $W/tmp/xmm_raw.glb $W/tmp/xmm_w.glb >/dev/null
node -e "require('$W/seg_lib.js').segment('$W/tmp/xmm_w.glb','$W/tmp/xmm_seg.glb',require('$W/xmm_cls.js')).then(s=>console.log('xmm',JSON.stringify(s)))"
NODE_PATH=$(npm root -g) node $W/split_mats.mjs $W/tmp/xmm_seg.glb $W/tmp/xmm_split.glb   # un matériau par pièce, réglé dans src/looks.js
$GT resize $W/tmp/xmm_split.glb $W/tmp/xmm_rs.glb --width 2048 --height 2048 >/dev/null
$GT webp $W/tmp/xmm_rs.glb $W/tmp/xmm_wp.glb >/dev/null
$GT quantize $W/tmp/xmm_wp.glb $OUT/xmm.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12 >/dev/null 2>&1
# ---------- Swift, Compton, WMAP : maquettes NASA (Draco), unités des maquettes, redécoupées
# attendus dans $DL : swift/swift.glb (« Swift.glb »), cgro/cgro.glb (« Gamma Ray Observatory.glb »), wmap/wmap.glb (« Wilkinson Microwave Anisotropy Probe (WMAP).glb »)
for m in swift cgro wmap; do
  $GT copy $DL/$m/$m.glb $W/tmp/${m}_dec.glb >/dev/null; $GT weld $W/tmp/${m}_dec.glb $W/tmp/${m}_w.glb >/dev/null
  node -e "require('$W/seg_lib.js').segment('$W/tmp/${m}_w.glb','$W/tmp/${m}_seg.glb',require('$W/${m}_cls.js')).then(s=>console.log('$m',JSON.stringify(s)))"
done
$GT quantize $W/tmp/swift_seg.glb $OUT/swift.glb --quantize-position 14 --quantize-normal 10 >/dev/null 2>&1
$GT quantize $W/tmp/cgro_seg.glb $OUT/cgro.glb --quantize-position 14 --quantize-normal 10 >/dev/null 2>&1
(cd $W && node slim.mjs $W/tmp/wmap_seg.glb $OUT/wmap.glb 0.2 0.003)
# ---------- INTEGRAL, Herschel, Planck, CHEOPS : maquettes ESA SCIFLEET (OBJ + textures, sans .mtl)
# attendus dans $DL/<id>/ : <id>.obj et le dossier tex/ dézippé (tools/probe/fetch_scifleet_models.py) ; .mtl écrits ici
python3 $W/obj2glb.py $DL/planck/planck.obj $W/tmp/planck_raw.glb "*=$DL/planck/tex/textures/PLANK_Material30_AlbedoTransparency1.png"
python3 $W/obj2glb.py $DL/integral/integral.obj $W/tmp/integral_raw.glb "*=$DL/integral/tex/integral_textures/4K/T_integral_02_BaseColor.png"
(cd $DL/herschel && printf "newmtl bandage8\nmap_Kd tex/textures/HERSCHEL_bandage8_AlbedoTransparency2.png\nnewmtl 02___Default\nmap_Kd tex/textures/herschelpanel1.png\n" > herschel.mtl && python3 -c "import trimesh; trimesh.load('herschel.obj', force='scene', process=False, group_material=True).export('$W/tmp/herschel_raw.glb', include_normals=True)")
(cd $DL/cheops && T=tex/cheops_textures/Cheops- && printf "newmtl blinn3SG\nmap_Kd ${T}MappedTexture2.jpg\nnewmtl initialShadingGroup\nmap_Kd ${T}MappedTexture1.jpg\nnewmtl blinn1SG1\nmap_Kd ${T}MappedTexture1.jpg\nnewmtl blinn1SG\nmap_Kd ${T}MappedTexture1.jpg\nnewmtl lambert2SG\nmap_Kd ${T}SolarPanels_FrontBackSides.jpg\nnewmtl lambert4SG\nmap_Kd ${T}MappedTexture2.jpg\nnewmtl lambert5SG\nmap_Kd ${T}MappedTexture3.jpg\nnewmtl lambert3SG\nmap_Kd ${T}MappedTexture1.jpg\nnewmtl lambert7SG\nmap_Kd ${T}MappedTexture4.jpg\n" > CHEOPS_LP_01.mtl && python3 -c "import trimesh; trimesh.load('cheops.obj', force='scene', process=False, group_material=True).export('$W/tmp/cheops_raw.glb', include_normals=True)")
for m in planck integral herschel cheops; do
  $GT weld $W/tmp/${m}_raw.glb $W/tmp/${m}_w.glb >/dev/null
  node -e "require('$W/seg_lib.js').segment('$W/tmp/${m}_w.glb','$W/tmp/${m}_seg.glb',require('$W/${m}_cls.js')).then(s=>console.log('$m',JSON.stringify(s)))"
  S=2048; [ $m = cheops ] && S=1024
  $GT resize $W/tmp/${m}_seg.glb $W/tmp/${m}_rs.glb --width $S --height $S >/dev/null; $GT webp $W/tmp/${m}_rs.glb $W/tmp/${m}_wp.glb >/dev/null
  $GT quantize $W/tmp/${m}_wp.glb $OUT/$m.glb --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12 >/dev/null 2>&1
done
ls -la $OUT
