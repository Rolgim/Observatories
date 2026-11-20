#!/usr/bin/env python3
"""Sonde SCIFLEET (ESA) : module ModelDownloads complet, base des liens et fiches « downloads » des missions d'astrophysique. Rapport dans tools/probe/_out/scifleet2.txt."""
import os, re, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "scifleet2.txt"), "w")
B = "https://scifleet.esa.int/"
idx = requests.get(B, timeout=60).text
main = re.findall(r'assets/index[.\-][0-9A-Za-z_\-]+\.js', idx)[0]
js = requests.get(B + main, timeout=120).text
md = re.findall(r'ModelDownloads[.\-][0-9A-Za-z_\-]+\.js', js)[0]
t = requests.get(B + "assets/" + md, timeout=120).text
log.write("=== ModelDownloads\n" + t + "\n\n")
for kw in ("downloads:", "downloads\":", "fbx:", "obj:\"", "json", "fetch(", "axios", "VITE_", "/models", "/downloads"):
    for mm in list(re.finditer(re.escape(kw), js))[:8]:
        log.write("[" + kw + "] " + js[max(0, mm.start() - 300):mm.end() + 300].replace("\n", " ") + "\n")
for name in ("herschel", "planck", "integral", "cheops", "iso", "xmm", "exosat", "hipparcos", "lisa_pathfinder", "plato", "ariel"):
    for mm in list(re.finditer(r'["\']' + name + r'["\']', js))[:3]:
        log.write("{" + name + "} " + js[max(0, mm.start() - 400):mm.end() + 600].replace("\n", " ") + "\n")
# fichiers de données JSON référencés
for u in sorted(set(re.findall(r'["\'](/?[A-Za-z0-9_/\-.]+\.json)["\']', js)))[:30]:
    log.write("json: " + u + "\n")
log.close()
