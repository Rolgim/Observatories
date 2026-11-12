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
ls -la $OUT
