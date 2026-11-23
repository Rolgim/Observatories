#!/usr/bin/env python3
"""Fond de la carte de l'accueil : le ciel vu par Gaia, en projection de Mollweide galactique.

    pip install requests pillow numpy healpy
    python tools/data/fetch_skybg.py

Écrit data/sky-gaia.jpg (centre de la Galaxie au milieu, longitudes croissantes vers la gauche) et data/sky-gaia.json.
1) « The colour of the sky from Gaia's Early Data Release 3 », projection équirectangulaire galactique de l'ESA
   (ESA/Gaia/DPAC, CC BY-SA 3.0 IGO, A. Moitinho), reprojetée ici en Mollweide ;
2) sinon, carte de flux en couleurs de Gaia DR3 (HiPS du CDS, ivo://CDS/P/DM/flux-color-Rp-G-Bp/I/355/gaiadr3) :
   service hips2fits du CDS (plusieurs essais de paramètres) ; 3) sinon, reprojection faite ici de l'image « Allsky »
d'ordre 3 du HiPS (64 × 64 pixels par case HEALPix d'ordre 3), avec healpy. Vérification : le plan galactique doit être
plus brillant que les pôles, sinon l'image est rejetée.
"""
import io, json, os, datetime, requests
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
HIPS_ID = "CDS/P/DM/flux-color-Rp-G-Bp/I/355/gaiadr3"
HIPS_URL = "https://alasky.cds.unistra.fr/ancillary/GaiaDR3/color-Rp-G-Bp-flux-map"
W, H = 4096, 2048
UA = {"User-Agent": "Observatoires-en-orbite/1.0 (+https://github.com/Rolgim/Observatories)"}
ESA_PAGE = "https://sci.esa.int/web/gaia/-/the-colour-of-the-sky-from-gaia-s-early-data-release-3-equirectangular-projection"
ESA_4K = "https://sci.esa.int/documents/33580/35361/Gaia_EDR3_flux_cartesian_4k.png/4648ec09-6c63-47a5-d0da-3ab3e0b42afe?version=1.0&t=1606986362680&download=true"

def moll_grid(w, h):
    ys, xs = np.mgrid[0:h, 0:w]
    X = (xs + 0.5 - w/2) / (w/2) * 2*np.sqrt(2); Y = -(ys + 0.5 - h/2) / (h/2) * np.sqrt(2)
    inside = (X/(2*np.sqrt(2)))**2 + (Y/np.sqrt(2))**2 <= 1
    th = np.arcsin(np.clip(Y/np.sqrt(2), -1, 1)); lat = np.degrees(np.arcsin(np.clip((2*th + np.sin(2*th))/np.pi, -1, 1)))
    lon = np.degrees(-np.pi*X/(2*np.sqrt(2)*np.cos(th) + 1e-12))     # longitude galactique, croissante vers la gauche, 0 au centre
    return inside, lon, lat

def via_esa():
    """Image équirectangulaire galactique de l'ESA : l = 0 au centre, croissante vers la gauche ; b = +90 en haut."""
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    r = requests.get(ESA_4K, headers=UA, timeout=900); print("   ESA", r.status_code, r.headers.get("content-type"), len(r.content), flush=True); r.raise_for_status()
    src = np.asarray(Image.open(io.BytesIO(r.content)).convert("RGB")); sh, sw = src.shape[:2]
    inside, lon, lat = moll_grid(W, H)
    px = np.clip(((0.5 - lon/360.0) * sw).astype(int), 0, sw - 1); py = np.clip(((90 - lat)/180.0 * sh).astype(int), 0, sh - 1)
    out = np.zeros((H, W, 3), np.uint8); out[inside] = src[py[inside], px[inside]]
    im = Image.fromarray(out)
    return (im, "reprojection en Mollweide de l'image équirectangulaire 4000 × 2000 de l'ESA") if sane(im) else (None, None)

def sane(im):
    a = np.asarray(im.convert("L"), dtype=float); h, w = a.shape
    plane = a[h//2 - h//40: h//2 + h//40, w//4: 3*w//4].mean(); pole = a[h//8: h//5, 2*w//5: 3*w//5].mean()
    print(f"   contrôle : plan {plane:.1f}, haute latitude {pole:.1f}")
    return plane > pole * 1.3

def via_hips2fits():
    from PIL import Image
    for host in ("https://alasky.cds.unistra.fr", "https://alaskybis.cds.unistra.fr"):
        for hips in (HIPS_ID, HIPS_URL):
            for fov in (360, 359.9):
                prm = dict(hips=hips, width=W, height=H, projection="MOL", coordsys="galactic", fov=fov, ra=0, dec=0, format="jpg", stretch="linear", min_cut="0.5%", max_cut="99.5%")
                try:
                    r = requests.get(host + "/hips-image-services/hips2fits", params=prm, headers=UA, timeout=120)
                except Exception as e:
                    print("  ", host, hips[:40], fov, repr(e)[:120]); continue
                print("  ", host, hips[:40], fov, r.status_code, r.headers.get("content-type"), len(r.content), flush=True)
                if r.ok and "image" in (r.headers.get("content-type") or ""):
                    im = Image.open(io.BytesIO(r.content)).convert("RGB")
                    if sane(im): return im, "hips2fits (" + host.split("//")[1] + ")"
    return None, None

def deinterleave(z):
    x = np.zeros_like(z); y = np.zeros_like(z)
    for b in range(6):
        x |= ((z >> (2*b)) & 1) << b; y |= ((z >> (2*b + 1)) & 1) << b
    return x, y

def via_allsky():
    import healpy as hp
    from PIL import Image
    r = requests.get(HIPS_URL + "/Norder3/Allsky.jpg", headers=UA, timeout=300); r.raise_for_status()
    sky = np.asarray(Image.open(io.BytesIO(r.content)).convert("RGB")); print("   Allsky", sky.shape)
    T = sky.shape[1] // 27                      # 27 cases par rangée dans l'image Allsky (convention HiPS)
    w, h = 2048, 1024                           # Mollweide : inverse sur une grille, puis agrandi
    ys, xs = np.mgrid[0:h, 0:w]
    X = (xs + 0.5 - w/2) / (w/2) * 2*np.sqrt(2); Y = -(ys + 0.5 - h/2) / (h/2) * np.sqrt(2)
    inside = (X/(2*np.sqrt(2)))**2 + (Y/np.sqrt(2))**2 <= 1
    th = np.arcsin(np.clip(Y/np.sqrt(2), -1, 1)); lat = np.arcsin(np.clip((2*th + np.sin(2*th))/np.pi, -1, 1))
    lon = -np.pi*X/(2*np.sqrt(2)*np.cos(th) + 1e-12)          # longitude galactique croissante vers la gauche
    rot = hp.Rotator(coord=["G", "C"])
    tq, pq = rot(np.pi/2 - lat[inside], lon[inside])
    nside = 8 * T; ip = hp.ang2pix(nside, tq, pq, nest=True)
    tile, sub = ip // (T*T), ip % (T*T)
    sx, sy = deinterleave(sub)
    row, col = tile // 27, tile % 27
    py = row*T + (T - 1 - sy); px = col*T + sx
    out = np.zeros((h, w, 3), np.uint8); out[inside] = sky[np.clip(py, 0, sky.shape[0]-1), np.clip(px, 0, sky.shape[1]-1)]
    im = Image.fromarray(out).resize((W, H), Image.LANCZOS)
    if not sane(im):
        # autre convention possible à l'intérieur d'une case : x et y échangés
        py = row*T + (T - 1 - sx); px = col*T + sy
        out[inside] = sky[np.clip(py, 0, sky.shape[0]-1), np.clip(px, 0, sky.shape[1]-1)]
        im = Image.fromarray(out).resize((W, H), Image.LANCZOS)
        if not sane(im): return None, None
    return im, "reprojection de l'image Allsky d'ordre 3 (healpy)"

def main():
    meta = dict(what="Gaia EDR3, la couleur du ciel", credit="ESA/Gaia/DPAC, CC BY-SA 3.0 IGO, remerciements : A. Moitinho", url=ESA_PAGE)
    try:
        im, how = via_esa()
    except Exception as e:
        print("ESA indisponible :", repr(e)[:200]); im = None
    if im is None:
        meta = dict(what="Gaia DR3, carte de flux en couleurs (BP, G, RP)", credit="ESA/Gaia/DPAC ; carte HiPS du CDS (CNRS/Université de Strasbourg), licence ODbL", url=HIPS_URL)
        im, how = via_hips2fits()
    if im is None:
        print("hips2fits indisponible ; reprojection locale", flush=True)
        im, how = via_allsky()
    if im is None:
        raise SystemExit("aucun fond de ciel exploitable")
    im.save(os.path.join(ROOT, "data", "sky-gaia.jpg"), quality=80, optimize=True, progressive=True)
    json.dump(dict(meta, method=how, fetched=datetime.date.today().isoformat(), width=im.width, height=im.height),
              open(os.path.join(ROOT, "data", "sky-gaia.json"), "w"), ensure_ascii=False)
    print("ok", how, os.path.getsize(os.path.join(ROOT, "data", "sky-gaia.jpg")) // 1024, "ko")

if __name__ == "__main__":
    main()
