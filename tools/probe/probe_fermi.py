#!/usr/bin/env python3
"""Sonde Fermi : catalogues du HEASARC (4FGL-DR4 « fermilpsc », sursauts du GBM « fermigbrst ») pour les recettes fermi/*.
N'écrit rien dans le dépôt."""
import pyvo
S = pyvo.dal.TAPService("https://heasarc.gsfc.nasa.gov/xamin/vo/tap")
def q(adql, n=20):
    try:
        t = S.search(adql).to_table(); t.pprint(max_lines=n, max_width=220); return t
    except Exception as e:
        print("   ÉCHEC", repr(e)[:300])
for tab in ("fermilpsc", "fermigbrst", "fermigtrig"):
    print("== colonnes de", tab)
    q(f"SELECT column_name, datatype, unit FROM TAP_SCHEMA.columns WHERE table_name = '{tab}'", 80)
    print("== effectif de", tab)
    q(f"SELECT COUNT(*) AS n FROM {tab}")
print("== exemples 4FGL"); q("SELECT TOP 5 * FROM fermilpsc", 8)
print("== exemples GBM"); q("SELECT TOP 5 * FROM fermigbrst", 8)
