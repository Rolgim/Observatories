#!/usr/bin/env python3
"""Lot F : où chaque télescope a réellement pointé, année par année.

    pip install pyvo numpy requests
    python tools/data/fetch_sky.py

Écrit data/sky.json : pour Hubble et JWST, les pointés scientifiques de l'archive MAST regroupés par case du ciel
et par année (agrégation faite côté serveur). Un observatoire qui échoue est signalé et laissé de côté.
"""
import json, os, datetime
import numpy as np
import requests

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MAST_TAP = "https://mast.stsci.edu/vo-tap/api/v0.1/caom"
EUCLID_TAP = "https://eas.esac.esa.int/tap-server/tap/sync"

def mast_pointings(collection, cell):
    import pyvo
    svc = pyvo.dal.TAPService(MAST_TAP)
    adql = (f"SELECT FLOOR(s_ra/{cell}) AS i, FLOOR((s_dec+90)/{cell}) AS j, FLOOR((t_min-51544.5)/365.25) AS yr, COUNT(*) AS n "
            f"FROM dbo.ObsPointing WHERE obs_collection='{collection}' AND intentType='science' AND s_ra IS NOT NULL AND t_min IS NOT NULL "
            f"GROUP BY FLOOR(s_ra/{cell}), FLOOR((s_dec+90)/{cell}), FLOOR((t_min-51544.5)/365.25)")
    print("  ", adql)
    job = svc.submit_job(adql, maxrec=2000000); job.run(); job.wait(phases=["COMPLETED", "ERROR", "ABORTED"], timeout=1500)
    job.raise_if_error()
    t = job.fetch_result().to_table(); job.delete()
    yr = np.array(t["yr"], dtype=int) + 2000
    out = {}
    for y in sorted(set(yr)):
        m = yr == y
        out[str(y)] = [int(v) for trip in zip(np.array(t["i"], dtype=int)[m], np.array(t["j"], dtype=int)[m], np.array(t["n"], dtype=int)[m]) for v in trip]
    print(f"   {len(t)} cases-années, {int(np.array(t['n']).sum()):,} observations, années {min(out)} à {max(out)}")
    return dict(cell=cell, years=out, source="MAST, table dbo.ObsPointing (observations scientifiques)")

def euclid_discovery():
    """Repérage : quelles tables de l'archive Euclid décrivent les observations (position et date) ?"""
    def tap(q):
        r = requests.post(EUCLID_TAP, data=dict(REQUEST="doQuery", LANG="ADQL", FORMAT="json", QUERY=q), timeout=300)
        if not r.ok:
            print("   TAP", r.status_code, r.text[:400].replace("\n", " "))
        r.raise_for_status(); return r.json()["data"]
    tabs = [t[0] for t in tap("SELECT table_name FROM tap_schema.tables")]
    print("   schémas :", sorted(set(t.split(".")[0] for t in tabs)))
    for t in tabs:
        low = t.lower()
        if any(k in low for k in ("observation", "pointing", "frame", "tile", "mosaic", "survey", "raw_")) and not low.startswith("tap_schema"):
            cols = [c[0] for c in tap(f"SELECT column_name FROM tap_schema.columns WHERE table_name = '{t}'")]
            print("   table", t, ":", cols[:45])

def main():
    out = dict(fetched=datetime.date.today().isoformat(), bodies={})
    for key, coll, cell in (("jwst", "JWST", 0.5), ("hubble", "HST", 1.0)):
        print("==", key, flush=True)
        try:
            out["bodies"][key] = mast_pointings(coll, cell)
        except Exception as e:
            print("   ÉCHEC :", repr(e)[:1500], flush=True)
    print("== euclid (repérage)", flush=True)
    try:
        euclid_discovery()
    except Exception as e:
        print("   ÉCHEC :", repr(e)[:800], flush=True)
    path = os.path.join(ROOT, "data", "sky.json")
    if out["bodies"]:
        if os.path.exists(path):  # garder ce qui existait pour les corps en échec
            old = json.load(open(path, encoding="utf-8"))
            for k, v in old.get("bodies", {}).items():
                out["bodies"].setdefault(k, v)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("Corps :", ", ".join(out["bodies"]) or "aucun")

if __name__ == "__main__":
    main()
