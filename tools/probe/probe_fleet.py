#!/usr/bin/env python3
"""Sonde des maquettes 3D disponibles à l'ESA : satellites de SCIFLEET et dossiers misc/cosmo du service SPICE. N'écrit rien dans le dépôt."""
import re, requests
js = requests.get("https://scifleet.esa.int/assets/index.313b998d.js", timeout=120).text
sats = sorted(set(re.findall(r'srcset-high/satellite/([a-z0-9_]+)\.png', js)))
print("== SCIFLEET, satellites :", len(sats)); print(" ".join(sats))
B = "https://spiftp.esac.esa.int/data/SPICE/"
r = requests.get(B, timeout=60); dirs = sorted(set(re.findall(r'href="([A-Z0-9_\-]+)/"', r.text)))
print("\n== SPICE, missions :", " ".join(dirs))
for d in dirs:
    try:
        c = requests.get(B + d + "/misc/cosmo/", timeout=30)
        if c.ok:
            fs = re.findall(r'href="([^"?/][^"]*\.(?:obj|3ds|fbx|cmod|glb|gltf|mtl|png|jpg))"', c.text)
            print("  ", d, ":", " ".join(fs[:12]))
    except Exception as e:
        print("  ", d, "ÉCHEC", repr(e)[:80])
