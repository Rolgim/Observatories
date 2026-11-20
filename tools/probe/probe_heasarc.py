#!/usr/bin/env python3
"""Sonde : tables du HEASARC (TAP synchrone, délais courts) pour Swift, INTEGRAL, CGRO, WMAP, Planck ; MAST pour UVOT. Rapport dans tools/probe/_out/heasarc.txt."""
import os, io, requests, traceback
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "heasarc.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); log.write(s + "\n"); log.flush()
TAP = "https://heasarc.gsfc.nasa.gov/xamin/vo/tap/sync"
def q(adql, n=60):
    r = requests.get(TAP, params=dict(REQUEST="doQuery", LANG="ADQL", FORMAT="csv", QUERY=adql), timeout=n); r.raise_for_status(); return r.text
for kw in ("swift", "integral", "ibis", "batse", "egret", "comptel", "osse", "wmap", "planck", "herschel", "cheops", "grb"):
    try: p("== tables", kw, q("SELECT table_name FROM TAP_SCHEMA.tables WHERE table_name LIKE '%" + kw + "%'").replace("\n", " ")[:900])
    except Exception as e: p("ERR tables", kw, repr(e)[:150])
for n in ("swiftgrb", "swiftbalog", "swbat157m", "swbat105m", "swift2sxps", "swiftuvlog", "intibisasc", "intrefcat", "ibisgps", "batsegrb", "batse4b", "egr3", "wmapptsrc", "plancksz2", "planckpsc"):
    try:
        t = q("SELECT TOP 2 * FROM " + n); p("\nCOLS", n, t[:1500])
    except Exception as e: p("\nERR", n, repr(e)[:150])
try:
    from astroquery.mast import Observations
    o = Observations.query_criteria(obs_collection="SWIFT", instrument_name="UVOT", objectname="M101", radius="0.1 deg")
    p("\nMAST SWIFT UVOT M101", len(o))
    if len(o): p(o.colnames); p(o[:5]["obs_id", "filters", "t_exptime", "dataproduct_type", "calib_level"])
except Exception:
    p("MAST err", traceback.format_exc()[-400:])
log.close()
