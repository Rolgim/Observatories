#!/usr/bin/env python3
"""Carte de l'accueil : réduit data/sky.json (pointés par instrument, case et année) à data/sky-all.json.

    python tools/data/sky_all.py

Pour chaque observatoire et chaque instrument : une liste plate [i, j, année de la première observation, nombre d'observations, …]
sur une grille équatoriale de 1° (i = ascension droite en degrés entiers, j = déclinaison + 90).
Les cases plus fines (0,5° pour Webb et Euclid) sont regroupées. Rien n'est ajouté : seulement ce que sky.json contient.
"""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CELL = 1.0

def main():
    src = json.load(open(os.path.join(ROOT, "data", "sky.json"), encoding="utf-8"))
    out = dict(fetched=src.get("fetched"), cell=CELL, bodies={})
    for key, b in src.get("bodies", {}).items():
        f = b.get("cell", 1.0) / CELL
        per = b["inst"] if "inst" in b else {"VIS": b.get("years", {})}   # Euclid : un seul instrument, par mois
        ins = {}
        for name, years in per.items():
            cells = {}
            for lab, flat in years.items():
                y = int(str(lab)[:4])
                for k in range(0, len(flat), 3):
                    c = (int(flat[k] * f), int(flat[k + 1] * f))
                    y0, n = cells.get(c, (y, 0))
                    cells[c] = (min(y0, y), n + flat[k + 2])
            ins[name] = [v for (i, j), (y0, n) in sorted(cells.items()) for v in (i, j, y0, n)]
        out["bodies"][key] = dict(ins=ins, source=b.get("source", ""), url=b.get("url", ""),
                                  total=sum(sum(v[3::4]) for v in ins.values()))
    path = os.path.join(ROOT, "data", "sky-all.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("sky-all.json :", os.path.getsize(path) // 1024, "ko ;", {k: v["total"] for k, v in out["bodies"].items()})

if __name__ == "__main__":
    main()
