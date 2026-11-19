#!/usr/bin/env python3
"""Sonde : maquettes ESA disponibles (service SPICE de l'ESA, dossiers misc/cosmo ; module ModelDownloads de SCIFLEET). Écrit le rapport dans tools/probe/_out/models_esa.txt."""
import os, re, time, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "models_esa.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s); log.write(s + "\n"); log.flush()
def get(u, t=120):
    for k in range(4):
        try:
            r = requests.get(u, timeout=t); return r
        except Exception as e:
            p("   essai", k, u, repr(e)[:100]); time.sleep(8)
S = "https://spiftp.esac.esa.int/data/SPICE/"
r = get(S); top = sorted(set(re.findall(r'href="([A-Z0-9_\-]+)/"', r.text))) if r else []
p("SPICE :", top)
for d in top:
    if d.upper() not in ("INTEGRAL", "HERSCHEL", "PLANCK", "CHEOPS", "GAIA", "JWST", "EUCLID", "XMM", "LISA_PATHFINDER", "ISO", "PLATO", "ARIEL", "SMART-1", "HUBBLE", "HST"): continue
    for sub in ("misc/cosmo/", "misc/", ""):
        r = get(S + d + "/" + sub)
        if r is not None and r.status_code == 200:
            p("\n##", d, sub, re.findall(r'href="([^"?/][^"?]*)"', r.text)[:60])
# SCIFLEET
B = "https://scifleet.esa.int/"
idx = get(B).text
p("\nSCIFLEET index", len(idx), re.findall(r'assets/[^"\']+\.js', idx)[:5])
mains = re.findall(r'assets/index[.\-][0-9A-Za-z_\-]+\.js', idx)
for m in mains[:1]:
    js = get(B + m).text
    p("main", m, len(js))
    for kw in ("ModelDownloads", "UserGuide", ".glb", ".gltf", ".zip", ".fbx", "herschel", "planck", "integral", "cheops", "licen", "terms of use"):
        for mm in list(re.finditer(re.escape(kw), js, re.I))[:5]:
            p("[" + kw + "]", js[max(0, mm.start() - 160):mm.end() + 160].replace("\n", " "))
    for mod in sorted(set(re.findall(r'(?:ModelDownloads|UserGuide)[.\-][0-9A-Za-z_\-]+\.js', js))):
        t = get(B + "assets/" + mod).text
        p("\n== module", mod, len(t))
        for kw in ("herschel", "planck", "integral", "cheops", "licen", "terms", "copyright", "href", ".zip", ".glb", ".fbx", ".obj"):
            for mm in list(re.finditer(re.escape(kw), t, re.I))[:6]:
                p("[" + kw + "]", t[max(0, mm.start() - 200):mm.end() + 200].replace("\n", " "))
log.close()
