#!/usr/bin/env python3
"""Sonde SCIFLEET (ESA) : cherche dans l'application les chemins de la maquette XMM-Newton (vue Marmoset, téléchargements). N'écrit rien dans le dépôt."""
import re, requests
B = "https://scifleet.esa.int/"
js = requests.get(B + "assets/index.313b998d.js", timeout=120).text
print("taille du code", len(js))
for m in re.finditer(r'xmm|XMM', js):
    print("…", js[max(0, m.start() - 160):m.end() + 160].replace("\n", " "))
paths = sorted(set(re.findall(r'["\'`]([^"\'`\s]{3,200}\.(?:mview|fbx|obj|blend|zip|glb|gltf|3ds|stl|png|jpg|json))["\'`]', js)))
print("\n== chemins de fichiers", len(paths))
for p in paths[:150]: print("  ", p)
for p in sorted(set(re.findall(r'["\'`](https?://[^"\'`\s]+)["\'`]', js)))[:80]: print("  url", p)
