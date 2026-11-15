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
    """Pointés scientifiques par case du ciel, par année et par instrument (agrégation faite par le serveur)."""
    import pyvo
    from astropy.table import vstack
    svc = pyvo.dal.TAPService(MAST_TAP)
    # une requête par année : regroupée aussi par instrument, la requête d'un seul tenant dépasse la limite de 10 min du serveur
    first = 1990 if collection == "HST" else 2022
    parts = []
    for y in range(first, datetime.date.today().year + 1):
        m0 = 51544.5 + (y - 2000) * 365.25
        adql = (f"SELECT instrument_name AS ins, FLOOR(s_ra/{cell}) AS i, FLOOR((s_dec+90)/{cell}) AS j, {y - 2000} AS yr, COUNT(*) AS n "
                f"FROM dbo.ObsPointing WHERE obs_collection='{collection}' AND intentType='science' AND s_ra IS NOT NULL "
                f"AND t_min >= {m0} AND t_min < {m0 + 365.25} GROUP BY instrument_name, FLOOR(s_ra/{cell}), FLOOR((s_dec+90)/{cell})")
        for attempt in range(3):
            try:
                job = svc.submit_job(adql, maxrec=2000000); job.run(); job.wait(phases=["COMPLETED", "ERROR", "ABORTED"], timeout=900)
                job.raise_if_error(); tt = job.fetch_result().to_table(); job.delete()
                if len(tt): parts.append(tt)
                print(f"   {y} : {len(tt)} lignes", flush=True); break
            except Exception as e:
                print(f"   {y} : essai {attempt + 1} en échec : {repr(e)[:160]}", flush=True)
        else:
            raise RuntimeError(f"année {y} impossible à récupérer")
    t = vstack(parts)
    yr = np.array(t["yr"], dtype=int) + 2000
    ins = np.array([str(x).split("/")[0].strip().upper() or "?" for x in t["ins"]])
    I, J, N = (np.array(t[c], dtype=int) for c in ("i", "j", "n"))
    cells = {}
    for a, y, i, j, n in zip(ins, yr, I, J, N):  # « WFC3/UVIS » et « WFC3/IR » réunis sous WFC3
        k = (a, int(y), int(i), int(j)); cells[k] = cells.get(k, 0) + int(n)
    out = {}
    for (a, y, i, j), n in sorted(cells.items()):
        out.setdefault(a, {}).setdefault(str(y), []).extend([i, j, n])
    tot = {a: sum(sum(v[2::3]) for v in d.values()) for a, d in out.items()}
    print(f"   {len(t)} lignes, {sum(tot.values()):,} observations ; par instrument :", dict(sorted(tot.items(), key=lambda x: -x[1])))
    return dict(cell=cell, inst=out, totals=tot, source="MAST, table dbo.ObsPointing (observations scientifiques)")

def euclid_survey(cell=0.5):
    """Avancée réelle du relevé : une ligne par observation VIS de DR1 (position moyenne des poses, date de début)."""
    import pyvo
    svc = pyvo.dal.TAPService("https://eas.esac.esa.int/tap-server/tap")
    adql = ("SELECT observation_id, MIN(start_time_mjd) AS t, AVG(ra) AS ra, AVG(dec) AS dec FROM dr1.calibrated_frame "
            "WHERE instrument_name = 'VIS' AND ra IS NOT NULL AND start_time_mjd IS NOT NULL GROUP BY observation_id")
    print("  ", adql)
    t = svc.run_async(adql, maxrec=1000000).to_table()
    mjd, ra, dec = np.array(t["t"], dtype=float), np.array(t["ra"], dtype=float), np.array(t["dec"], dtype=float)
    out, cells = {}, {}
    for m, a, d in zip(mjd, ra, dec):
        day = datetime.date(1858, 11, 17) + datetime.timedelta(days=float(m))
        k = (f"{day.year}-{day.month:02d}", int(a // cell), int((d + 90) // cell))
        cells[k] = cells.get(k, 0) + 1
    for (lab, i, j), n in sorted(cells.items()):
        out.setdefault(lab, []).extend([i, j, n])
    print(f"   {len(t)} observations, {len(cells)} cases-mois, de {min(out)} à {max(out)}")
    return dict(cell=cell, years=out, source="ESA Euclid Science Archive, table dr1.calibrated_frame (observations VIS de DR1)")

def main():
    out = dict(fetched=datetime.date.today().isoformat(), bodies={})
    path = os.path.join(ROOT, "data", "sky.json")
    have = json.load(open(path, encoding="utf-8")).get("bodies", {}) if os.path.exists(path) else {}
    for key, coll, cell in (("jwst", "JWST", 0.5), ("hubble", "HST", 1.0)):
        print("==", key, flush=True)
        if "inst" in have.get(key, {}):
            print("   déjà présent, non refait"); continue
        try:
            out["bodies"][key] = mast_pointings(coll, cell)
        except Exception as e:
            print("   ÉCHEC :", repr(e)[:1500], flush=True)
    print("== euclid", flush=True)
    try:
        out["bodies"]["euclid"] = euclid_survey()
    except Exception as e:
        print("   ÉCHEC :", repr(e)[:1500], flush=True)
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
