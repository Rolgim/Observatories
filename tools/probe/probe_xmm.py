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
res = {}
for label, where in [(k, f"CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra}, {de}, 0.05)) = 1") for k, ra, de in (("Cas A", 350.85, 58.815), ("Capella", 79.172, 45.998), ("Tycho", 6.334, 64.14), ("Crabe", 83.633, 22.0145), ("Zeta Puppis", 120.896, -40.003))]:
    print("\n==", label)
    res[label] = tap("SELECT TOP 10 obsid, name, ra, dec, time, duration, status, pi_lname FROM xmmmaster WHERE " + where + " AND status = 'archived' ORDER BY duration DESC")
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
