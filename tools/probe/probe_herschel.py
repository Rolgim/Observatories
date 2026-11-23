#!/usr/bin/env python3
"""Sonde : Herschel. Archive HSA de l'ESA (TAP) et IRSA (SIA) : tables, une observation PACS de M51, aperçus (postcards) et produits. Rapport dans tools/probe/_out/herschel.txt."""
import os, io, requests, traceback
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "herschel.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); log.write(s + "\n"); log.flush()
HSA = "https://archives.esac.esa.int/hsa/whsa-tap-server/tap"
def tap(url, adql, n=120):
    import pyvo
    return pyvo.dal.TAPService(url).run_sync(adql, maxrec=50).to_table()
for adql in ("SELECT TOP 80 table_name, description FROM TAP_SCHEMA.tables",
             "SELECT TOP 60 column_name, datatype, description FROM TAP_SCHEMA.columns WHERE table_name LIKE '%v_active_observation%'"):
    try: t = tap(HSA, adql); p("==", adql); [p("  ", list(r)) for r in t]
    except Exception as e: p("ERR", adql, repr(e)[:300])
for adql in ("SELECT TOP 10 * FROM hsa.v_active_observation WHERE instrument_name = 'PACS' AND target_name LIKE '%M51%'",
             "SELECT TOP 10 * FROM hsa.v_active_observation WHERE instrument_name = 'SPIRE' AND target_name LIKE '%M51%'",
             "SELECT TOP 10 * FROM hsa.v_active_observation WHERE target_name LIKE '%M51%'"):
    try:
        t = tap(HSA, adql); p("==", adql, len(t), t.colnames)
        for r in t[:10]: p("  ", str(list(r))[:700])
    except Exception as e: p("ERR", adql, repr(e)[:300])
# IRSA : collections Herschel en SIA v2
try:
    r = requests.get("https://irsa.ipac.caltech.edu/SIA", params=dict(POS="CIRCLE 202.4696 47.1952 0.05", COLLECTION="herschel_hhli"), timeout=120)
    p("== IRSA SIA herschel_hhli", r.status_code, r.text[:1500])
except Exception as e: p("ERR IRSA", repr(e)[:300])
try:
    import pyvo
    t = pyvo.dal.TAPService("https://irsa.ipac.caltech.edu/TAP").run_sync("SELECT DISTINCT obs_collection FROM ivoa.obscore", maxrec=500).to_table()
    p("== IRSA collections", [str(x) for x in t["obs_collection"]])
except Exception as e: p("ERR IRSA collections", repr(e)[:300])
# lien de postcard documenté par l'HSA
for u in ("https://archives.esac.esa.int/hsa/whsa-tap-server/data?retrieval_type=POSTCARD&observation_id=1342186233",):
    try:
        r = requests.get(u, timeout=120); p("== postcard", u, r.status_code, r.headers.get("content-type"), len(r.content))
        if r.ok and "image" in (r.headers.get("content-type") or ""): open(os.path.join(OUT, "postcard.jpg"), "wb").write(r.content)
    except Exception as e: p("ERR postcard", repr(e)[:300])
log.close()
