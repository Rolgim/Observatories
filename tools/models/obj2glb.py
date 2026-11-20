# obj2glb.py in.obj out.glb 'mat=tex.png;mat2=tex2.png' [scale] [maxtex]
# Convertit un OBJ sans .mtl en GLB : une géométrie par matériau (usemtl), texture de couleur affectée à la main, normales gardées.
import sys, trimesh, numpy as np
from PIL import Image
src, dst, mp = sys.argv[1], sys.argv[2], sys.argv[3]
scale = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
maxtex = int(sys.argv[5]) if len(sys.argv) > 5 else 2048
M = dict(x.split('=', 1) for x in mp.split(';') if x)
sc = trimesh.load(src, force='scene', process=False, group_material=True, skip_materials=True)
out = trimesh.Scene()
for name, g in sc.geometry.items():
    key = next((k for k in M if k != '*' and k in name), '*' if '*' in M else None)
    print(name, len(g.faces), '->', key, M.get(key))
    g.apply_scale(scale)
    if key and M[key].startswith('#'):
        c = M[key].lstrip('#'); rgba = [int(c[i:i+2], 16) for i in (0, 2, 4)] + [255]
        g.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(name=name, baseColorFactor=rgba, metallicFactor=0.3, roughnessFactor=0.6))
    elif key:
        im = Image.open(M[key]).convert('RGB'); 
        if max(im.size) > maxtex: im = im.resize((maxtex, maxtex), Image.LANCZOS)
        uv = g.visual.uv if hasattr(g.visual, 'uv') and g.visual.uv is not None else None
        mat = trimesh.visual.material.PBRMaterial(name=name, baseColorTexture=im, metallicFactor=0.2, roughnessFactor=0.6)
        g.visual = trimesh.visual.TextureVisuals(uv=uv, material=mat)
    out.add_geometry(g, geom_name=name)
out.export(dst, include_normals=True)
print('ok', dst)
