#!/usr/bin/env python3
"""Sonde Chandra : ce qu'exposent le catalogue des observations (HEASARC, table chanmaster) et l'archive CDA.
N'écrit rien dans le dépôt. Sert à choisir les observations des recettes chandra/* de fetch_data.py."""
import io, gzip, re, requests
import numpy as np

TAP = "https://heasarc.gsfc.nasa.gov/xamin/vo/tap/sync"
CDA = "https://cxc.cfa.harvard.edu/cdaftp/byobsid/{d}/{o}/primary/"

def tap(adql):
    import pyvo
    try:
        t = pyvo.dal.TAPService("https://heasarc.gsfc.nasa.gov/xamin/vo/tap").search(adql).to_table()
        t.pprint(max_lines=30, max_width=200)
    except Exception as e:
        print("   ÉCHEC", repr(e)[:300])

print("== colonnes de chanmaster")
tap("SELECT TOP 60 column_name, datatype FROM TAP_SCHEMA.columns WHERE table_name = 'chanmaster'")

for label, where in [
    ("Cas A, ACIS sans réseau", "name LIKE '%CAS%A%' AND instrument LIKE 'ACIS%' AND grating = 'NONE'"),
    ("Capella, HETG", "name LIKE '%CAPELLA%' AND grating = 'HETG'"),
    ("Capella, LETG", "name LIKE '%CAPELLA%' AND grating = 'LETG'"),
    ("Crabe, HRC-I", "name LIKE '%CRAB%' AND instrument = 'HRC-I'"),
    ("M31, HRC-I", "name LIKE '%M31%' AND instrument = 'HRC-I'"),
]:
    print("\n==", label)
    tap("SELECT TOP 15 obsid, name, instrument, grating, exposure, time, status, public_date FROM chanmaster WHERE " + where + " ORDER BY exposure DESC")

def ls(o):
    u = CDA.format(d=str(o)[-1], o=o)
    r = requests.get(u, timeout=60)
    files = re.findall(r'href="([^"?/][^"]*)"', r.text)
    print("   ", u, r.status_code)
    for f in files:
        h = requests.head(u + f, timeout=60)
        print("      ", f, h.headers.get("Content-Length"))
    return u, files

def fits(url, maxmb=40):
    from astropy.io import fits as F
    h = requests.head(url, timeout=60); n = int(h.headers.get("Content-Length", 0))
    print("   ", url.rsplit("/", 1)[1], n // 1024, "ko")
    if n > maxmb * 2**20: print("    trop gros pour la sonde"); return
    raw = requests.get(url, timeout=300).content
    if raw[:2] == b"\x1f\x8b": raw = gzip.decompress(raw)
    with F.open(io.BytesIO(raw)) as hd:
        for e in hd:
            print("     HDU", e.name, type(e).__name__, getattr(e, "shape", None) if not hasattr(e, "columns") else "")
            if hasattr(e, "columns"):
                print("       colonnes :", ", ".join(f"{c.name}[{c.format}{(' ' + c.unit) if c.unit else ''}]" for c in e.columns)[:900])
                print("       lignes :", len(e.data))
            for k in ("OBJECT", "OBS_ID", "INSTRUME", "GRATING", "DETNAM", "DATE-OBS", "EXPOSURE", "TSTART", "OBSERVER", "TITLE", "RA_NOM", "DEC_NOM", "TLMIN11", "TLMAX11", "TCTYP11"):
                if k in e.header: print("       ", k, "=", e.header[k])
            if e.data is not None and not hasattr(e, "columns") and e.data.ndim == 2:
                d = np.asarray(e.data, float); print(f"        image {d.shape}, total {d.sum():.0f} coups, max {d.max():.0f}")
                for k in ("CRVAL1", "CRVAL2", "CDELT1", "CDELT2", "CTYPE1", "BUNIT"):
                    if k in e.header: print("       ", k, "=", e.header[k])
            if e.name == "EVENTS":
                d = e.data
                for c in ("energy", "x", "y", "pha"):
                    if c in d.columns.names: v = np.asarray(d[c]); print(f"        {c}: {np.nanmin(v)} .. {np.nanmax(v)}, médiane {np.nanmedian(v)}")
            if e.name == "SPECTRUM":
                d = e.data; names = d.columns.names
                for i in range(min(len(d), 12)):
                    row = {k: d[k][i] for k in ("TG_M", "TG_PART", "SPEC_NUM") if k in names}
                    cts = d["COUNTS"][i]; lo = d["BIN_LO"][i] if "BIN_LO" in names else None
                    print("        ligne", i, row, "coups", int(np.sum(cts)), "λ", (float(np.min(lo)), float(np.max(lo))) if lo is not None else "")

for o in (114, 1318, 1248, 168, 1851, 2700):
    print("\n== archive, ObsID", o)
    try:
        u, files = ls(o)
        for f in files:
            if re.search(r"(evt2|pha2|img2)\.fits(\.gz)?$", f): fits(u + f)
    except Exception as e:
        print("   ÉCHEC", repr(e))
