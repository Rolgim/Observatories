#!/usr/bin/env python3
"""Récupère la maquette XMM-Newton du service SPICE de l'ESA (dossier misc/cosmo, pour Cosmographia) dans tools/probe/_out."""
import os, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
for f in ("xmm.obj", "xmm.mtl", "alb.png", "xmm.fbx", "xmm.3ds"):
    for k in range(5):
        try:
            r = requests.get("https://spiftp.esac.esa.int/data/SPICE/XMM/misc/cosmo/" + f, timeout=120); r.raise_for_status(); break
        except Exception as e:
            print("   nouvel essai", f, repr(e)[:120]); __import__("time").sleep(10)
    open(os.path.join(OUT, f), "wb").write(r.content); print(f, len(r.content))
