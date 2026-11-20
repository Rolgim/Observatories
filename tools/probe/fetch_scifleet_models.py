#!/usr/bin/env python3
"""Récupère les maquettes SCIFLEET (ESA) des missions d'astrophysique de la vague 1 dans tools/probe/_out :
fiche data/satellites.json, puis pour chaque mission les fichiers « obj » et « textures » (ou à défaut « cosmographia », « fbx »).
Conditions : « free to download and use under these terms and conditions » (https://www.esa.int/Services/Terms_and_conditions)."""
import os, json, time, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
B = "https://scifleet.esa.int/"
def get(u):
    for k in range(5):
        try:
            r = requests.get(u, timeout=300); r.raise_for_status(); return r
        except Exception as e:
            print("   essai", k, u, repr(e)[:120]); time.sleep(10)
sat = get(B + "data/satellites.json").json()
open(os.path.join(OUT, "satellites.json"), "w").write(json.dumps(sat, indent=1, ensure_ascii=False))
items = sat if isinstance(sat, list) else list(sat.values()) if isinstance(sat, dict) else []
def walk(x):
    if isinstance(x, dict):
        yield x
        for v in x.values(): yield from walk(v)
    elif isinstance(x, list):
        for v in x: yield from walk(v)
WANT = ("herschel", "planck", "integral", "cheops")
for d in walk(sat):
    fid = str(d.get("id", d.get("fname", ""))).lower()
    if fid not in WANT or not isinstance(d.get("downloads"), dict): continue
    dl = d["downloads"]; print(fid, dl)
    keys = [k for k in ("obj", "textures") if dl.get(k)] or [k for k in ("cosmographia", "fbx") if dl.get(k)][:1]
    os.makedirs(os.path.join(OUT, fid), exist_ok=True)
    for k in keys:
        r = get(B + "downloads/" + str(d.get("id")) + "/" + dl[k])
        if r is None: print("   échec", fid, k); continue
        open(os.path.join(OUT, fid, dl[k].split("/")[-1]), "wb").write(r.content); print("  ", fid, k, dl[k], len(r.content))
