#!/usr/bin/env python3
"""Sonde SCIFLEET (ESA) : contextes « download », « mview », « models » dans le code, et vignette XMM-Newton (déposée dans _out)."""
import os, re, requests
B = "https://scifleet.esa.int/"
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
js = requests.get(B + "assets/index.313b998d.js", timeout=120).text
seen = 0
for kw in ("mview", "download", "Download", "models/", "/3d", "fbx", "FBX", "blend", "marmoset", "xmm_newton\"", "XMM-Newton", "xmm_newton:"):
    for m in list(re.finditer(re.escape(kw), js))[:6]:
        print("[" + kw + "]", js[max(0, m.start() - 220):m.end() + 220].replace("\n", " ")); seen += 1
for f in ("assets/xmm_newton.49baba6b.png", "assets/xmm_newton.2294fe1c.png"):
    r = requests.get(B + f, timeout=60); print(f, r.status_code, len(r.content))
    if r.ok: open(os.path.join(OUT, f.split("/")[-1]), "wb").write(r.content)
