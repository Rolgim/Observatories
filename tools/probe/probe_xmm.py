#!/usr/bin/env python3
"""Sonde XMM-Newton : catalogue des observations (HEASARC, table xmmmaster) et produits PPS du miroir HEASARC.
N'écrit rien dans le dépôt. Sert à choisir les observations des recettes xmm/* de fetch_data.py."""
import re, requests
TAP = "https://heasarc.gsfc.nasa.gov/xamin/vo/tap"
def tap(adql, n=20):
    import pyvo
    try:
        t = pyvo.dal.TAPService(TAP).search(adql).to_table(); t.pprint(max_lines=n, max_width=220); return t
    except Exception as e:
        print("   ÉCHEC", repr(e)[:300])
print("== colonnes de xmmmaster")
tap("SELECT TOP 80 column_name, datatype FROM TAP_SCHEMA.columns WHERE table_name = 'xmmmaster'", 80)
res = {}
for label, where in [("Cas A", "name LIKE '%CAS%A%'"), ("Capella", "name LIKE '%CAPELLA%'"), ("M31", "name LIKE '%M31%'"), ("Tycho", "name LIKE '%TYCHO%'"), ("Crabe", "name LIKE '%CRAB%'")]:
    print("\n==", label)
    res[label] = tap("SELECT TOP 10 obsid, name, ra, dec, time, duration, status, pi_lname FROM xmmmaster WHERE " + where + " ORDER BY duration DESC")
def pps(obsid):
    for u in (f"https://heasarc.gsfc.nasa.gov/FTP/xmm/data/rev0/{obsid}/PPS/", f"https://heasarc.gsfc.nasa.gov/FTP/xmm/data/rev1/{obsid}/PPS/"):
        r = requests.get(u, timeout=60); print("  ", u, r.status_code)
        if r.ok:
            fs = re.findall(r'href="([^"?/][^"]*)"', r.text)
            for f in fs: print("     ", f)
            return
for label in ("Cas A", "Capella"):
    t = res.get(label)
    if t is not None and len(t):
        print("\n== PPS de", label, t[0]["obsid"]); pps(str(t[0]["obsid"]).zfill(10))
