#!/usr/bin/env python3
"""Sonde SCIFLEET (ESA) : page de téléchargement des maquettes (ModelDownloads), liens des fichiers et conditions d'utilisation. N'écrit rien dans le dépôt."""
import re, requests
B = "https://scifleet.esa.int/"
idx = requests.get(B, timeout=60).text
main = re.findall(r'assets/index\.[0-9a-f]+\.js', idx)[0]
js = requests.get(B + main, timeout=120).text
md = sorted(set(re.findall(r'ModelDownloads\.[0-9a-f]+\.js', js))); ug = sorted(set(re.findall(r'UserGuide\.[0-9a-f]+\.js', js)))
print("modules :", md, ug)
for m in md + ug:
    t = requests.get(B + "assets/" + m, timeout=120).text
    print("\n==", m, len(t))
    for kw in ("herschel", "planck", "integral", "cheops", "xmm", "licen", "terms", "copyright", "download", ".zip", ".fbx", ".blend", ".obj", "CC BY", "Creative"):
        for mm in list(re.finditer(re.escape(kw), t, re.I))[:4]:
            print("[" + kw + "]", t[max(0, mm.start() - 200):mm.end() + 200].replace("\n", " "))
