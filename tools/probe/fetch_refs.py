#!/usr/bin/env python3
"""Images de référence (illustration principale des articles Wikipédia en anglais) pour vérifier les couleurs des maquettes. Déposées dans _out."""
import os, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
H = {"User-Agent": "Observatories-probe/1.0 (https://github.com/Rolgim/Observatories)"}
PAGES = {"hubble": "Hubble_Space_Telescope", "chandra": "Chandra_X-ray_Observatory", "xmm": "XMM-Newton", "spitzer": "Spitzer_Space_Telescope",
         "fermi": "Fermi_Gamma-ray_Space_Telescope", "kepler": "Kepler_space_telescope", "gaia": "Gaia_(spacecraft)", "tess": "Transiting_Exoplanet_Survey_Satellite",
         "jwst": "James_Webb_Space_Telescope", "euclid": "Euclid_(spacecraft)", "roman": "Nancy_Grace_Roman_Space_Telescope"}
for k, p in PAGES.items():
    try:
        j = requests.get("https://en.wikipedia.org/api/rest_v1/page/summary/" + p, headers=H, timeout=60).json()
        u = (j.get("thumbnail") or {}).get("source", "").replace("/320px-", "/640px-")
        if not u: print(k, "pas d'image"); continue
        r = requests.get(u, headers=H, timeout=60)
        if not r.ok: r = requests.get(j["thumbnail"]["source"], headers=H, timeout=60)
        ext = u.rsplit(".", 1)[-1][:4]; open(os.path.join(OUT, k + "." + ext), "wb").write(r.content); print(k, r.status_code, len(r.content), u)
    except Exception as e:
        print(k, "ÉCHEC", repr(e)[:200])
