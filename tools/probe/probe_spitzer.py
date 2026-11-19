#!/usr/bin/env python3
"""Sonde Spitzer : ce qu'expose l'IRSA (images SEIP par SIA, tables des produits IRS) pour les recettes spitzer/* de fetch_data.py.
N'écrit rien dans le dépôt."""
import io, requests
import numpy as np

TAP = "https://irsa.ipac.caltech.edu/TAP"
SIA = "https://irsa.ipac.caltech.edu/SIA"

def tap(adql, n=30):
    import pyvo
    try:
        t = pyvo.dal.TAPService(TAP).run_sync(adql).to_table()
        t.pprint(max_lines=n, max_width=220)
        return t
    except Exception as e:
        print("   ÉCHEC", repr(e)[:400])

print("== tables Spitzer à l'IRSA")
tap("SELECT table_name, description FROM TAP_SCHEMA.tables WHERE table_name LIKE '%irs%' OR table_name LIKE '%seip%' OR table_name LIKE '%spitzer%' OR table_name LIKE '%sha%' OR table_name LIKE '%cassis%'", 80)

print("\n== collections SIA contenant spitzer")
tap("SELECT DISTINCT obs_collection FROM ivoa.obscore WHERE obs_collection LIKE '%spitzer%'", 40)

print("\n== SIA : SEIP autour de M51")
try:
    import pyvo
    from astropy.coordinates import SkyCoord
    import astropy.units as u
    pos = SkyCoord(202.4696, 47.1952, unit="deg")
    res = pyvo.dal.SIA2Service(SIA).search(pos=(pos, 2 * u.arcmin), collection="spitzer_seip").to_table()
    print("   lignes", len(res), "colonnes", res.colnames)
    keep = [c for c in ("obs_id", "dataproduct_subtype", "energy_bandpassname", "access_url", "access_estsize", "s_resolution") if c in res.colnames]
    res[keep][:20].pprint(max_width=260)
    sci = [r for r in res if "science" in str(r["dataproduct_subtype"]).lower()] if "dataproduct_subtype" in res.colnames else list(res)
    if sci:
        url = str(sci[0]["access_url"])
        for cut in ("?center=202.4696,47.1952&size=8arcmin", "?center=202.4696,47.1952deg&size=0.13"):
            r = requests.get(url + cut, timeout=300)
            print("   découpe", cut, r.status_code, len(r.content), r.headers.get("Content-Type"))
            if r.ok and r.content[:6] == b"SIMPLE":
                from astropy.io import fits
                with fits.open(io.BytesIO(r.content)) as h:
                    d = h[0].data; print("     forme", None if d is None else d.shape, "BUNIT", h[0].header.get("BUNIT"), "TELESCOP", h[0].header.get("TELESCOP"))
                    for k in ("INSTRUME", "CHNLNUM", "WAVELENG", "AORKEY", "PROGID", "OBSRVR", "CDELT1", "CD1_1", "PXSCAL1"):
                        if k in h[0].header: print("      ", k, "=", h[0].header[k])
                break
except Exception as e:
    print("   ÉCHEC", repr(e)[:400])

print("\n== IRS : colonnes des tables candidates")
for t in ("irs_enhv211", "irsenhv211", "spitzer.irs_enhv211", "cassis_lores"):
    print("--", t)
    tap(f"SELECT TOP 3 * FROM {t}", 5)
