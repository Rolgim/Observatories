#!/usr/bin/env python3
"""Sonde SCIFLEET (ESA) : page d'accueil, liens vers XMM-Newton et ses fichiers 3D. N'écrit rien dans le dépôt."""
import re, requests
B = "https://scifleet.esa.int/"
def get(u):
    try:
        r = requests.get(u, timeout=60); print("GET", u, r.status_code, r.headers.get("Content-Type"), len(r.content)); return r
    except Exception as e:
        print("ÉCHEC", u, repr(e)[:200])
r = get(B)
if r is not None:
    t = r.text; print(t[:3000])
    for m in sorted(set(re.findall(r'(?:href|src)="([^"]+)"', t)))[:200]: print("  lien", m)
    for m in sorted(set(re.findall(r'["\']([^"\']*(?:xmm|XMM)[^"\']*)["\']', t)))[:100]: print("  xmm", m)
for p in ("xmm", "XMM", "xmm-newton", "spacecraft/xmm", "api/spacecraft", "data/spacecraft.json", "assets/models/xmm/", "models/xmm/"):
    r = get(B + p)
    if r is not None and r.ok: print(r.text[:1500])
