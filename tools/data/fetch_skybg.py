#!/usr/bin/env python3
"""Fond de la carte de l'accueil : le ciel vu par Gaia, en projection de Mollweide galactique, via le service hips2fits du CDS.

    python tools/data/fetch_skybg.py

Écrit data/sky-gaia.jpg (4096 × 2048, centre de la Galaxie au milieu, longitudes croissantes vers la gauche)
et data/sky-gaia.json (relevé HiPS utilisé, crédit, date). Essaie plusieurs relevés Gaia, dans l'ordre.
"""
import io, json, os, datetime, requests
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
H2F = "https://alasky.cds.unistra.fr/hips-image-services/hips2fits"
CANDIDATES = [
    ("CDS/P/DM/flux-color-Rp-G-Bp/I/355/gaiadr3", "Gaia DR3, carte de flux en couleurs (BP, G, RP)", "ESA/Gaia/DPAC ; carte HiPS du CDS"),
    ("CDS/P/DM/flux-Rp-G-Bp/I/355/gaiadr3", "Gaia DR3, carte de flux (BP, G, RP)", "ESA/Gaia/DPAC ; carte HiPS du CDS"),
    ("CDS/P/DM/flux-color-Rp-G-Bp/I/350/gaiaedr3", "Gaia EDR3, carte de flux en couleurs", "ESA/Gaia/DPAC ; carte HiPS du CDS"),
]
def main():
    from PIL import Image
    for hips, what, credit in CANDIDATES:
        try:
            r = requests.get(H2F, params=dict(hips=hips, width=4096, height=2048, projection="MOL", coordsys="galactic", fov=360, ra=0, dec=0, format="jpg"), timeout=600)
            print(hips, r.status_code, r.headers.get("content-type"), len(r.content), flush=True)
            if not r.ok or "image" not in (r.headers.get("content-type") or ""):
                print("  ", r.text[:400]); continue
            im = Image.open(io.BytesIO(r.content)).convert("RGB")
            im.save(os.path.join(ROOT, "data", "sky-gaia.jpg"), quality=82, optimize=True, progressive=True)
            json.dump(dict(hips=hips, what=what, credit=credit, service=H2F, fetched=datetime.date.today().isoformat(), width=im.width, height=im.height,
                           url="https://aladin.cds.unistra.fr/hips/list"), open(os.path.join(ROOT, "data", "sky-gaia.json"), "w"), ensure_ascii=False)
            print("ok", os.path.getsize(os.path.join(ROOT, "data", "sky-gaia.jpg")) // 1024, "ko"); return
        except Exception as e:
            print("ÉCHEC", hips, repr(e)[:300])
    raise SystemExit("aucun relevé Gaia n'a pu être obtenu")
if __name__ == "__main__":
    main()
