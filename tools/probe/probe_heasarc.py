#!/usr/bin/env python3
"""Sonde : tables du HEASARC (TAP synchrone, délais courts) pour Swift, INTEGRAL, CGRO, WMAP, Planck ; MAST pour UVOT. Rapport dans tools/probe/_out/heasarc.txt."""
import os, io, requests, traceback
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "heasarc.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); log.write(s + "\n"); log.flush()
TAP = "https://heasarc.gsfc.nasa.gov/xamin/vo/tap/sync"
def q(adql, n=60):
    from astropy.io.votable import parse_single_table
    r = requests.get(TAP, params=dict(REQUEST="doQuery", LANG="ADQL", QUERY=adql), timeout=n); r.raise_for_status()
    t = parse_single_table(io.BytesIO(r.content)).to_table()
    return str(len(t)) + " lignes ; colonnes " + ", ".join(t.colnames) + "\n" + "\n".join(str(list(row))[:400] for row in t[:3])
for n in ("herschllog",):
    try:
        p("\nCOLS", n, q("SELECT TOP 3 * FROM " + n)[:3000])
    except Exception as e: p("\nERR", n, repr(e)[:150])
log.close()
