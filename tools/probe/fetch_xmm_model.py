#!/usr/bin/env python3
"""Récupère la maquette XMM-Newton du service SPICE de l'ESA (dossier misc/cosmo, pour Cosmographia) dans tools/probe/_out."""
import os, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
for f in ("xmm.obj", "xmm.mtl", "alb.png", "xmm.fbx", "xmm.3ds"):
    r = requests.get("https://spiftp.esac.esa.int/data/SPICE/XMM/misc/cosmo/" + f, timeout=120); r.raise_for_status()
    open(os.path.join(OUT, f), "wb").write(r.content); print(f, len(r.content))
r = requests.get("https://spiftp.esac.esa.int/data/SPICE/XMM/xmm.html", timeout=60); print(r.status_code); print(r.text[:6000])
