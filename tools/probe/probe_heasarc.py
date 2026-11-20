#!/usr/bin/env python3
"""Sonde : tables du HEASARC (TAP) pour Swift, INTEGRAL, CGRO, WMAP, Planck, Herschel, CHEOPS ; MAST pour UVOT ; archives ESA. Rapport dans tools/probe/_out/heasarc.txt."""
import os, pyvo, traceback
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "heasarc.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s); log.write(s + "\n"); log.flush()
tap = pyvo.dal.TAPService("https://heasarc.gsfc.nasa.gov/xamin/vo/tap")
t = tap.search("SELECT table_name, description FROM TAP_SCHEMA.tables", maxrec=100000).to_table()
KW = ("swift", "bat", "xrt", "uvot", "integral", "ibis", "spi", "jemx", "batse", "comptel", "egret", "osse", "cgro", "wmap", "planck", "herschel", "cheops", "grb")
for r in t:
    n = str(r["table_name"]); d = str(r["description"])
    if any(k in n.lower() or k in d.lower() for k in KW): p("TABLE", n, "|", d[:140])
for n in ("swiftgrb", "swbat157m", "swbat105m", "swift2sxps", "swiftmastr", "intibisasc", "integral_refcat", "ibisgpscat", "batsegrb", "batse4b", "egr3", "comptel", "planckpsc", "wmapptsrc"):
    try:
        c = tap.search("SELECT TOP 2 * FROM " + n).to_table()
        p("\nCOLS", n, len(c), c.colnames)
        p("   ", [str(c[0][k])[:30] for k in c.colnames[:30]] if len(c) else "")
    except Exception as e:
        p("\nERR", n, repr(e)[:200])
# MAST : Swift UVOT
try:
    from astroquery.mast import Observations
    o = Observations.query_criteria(obs_collection="SWIFT", instrument_name="UVOT", objectname="M101", radius="0.1 deg")
    p("\nMAST SWIFT UVOT M101", len(o)); 
    if len(o): p(o.colnames); p(o[:5]["obs_id", "filters", "t_exptime", "dataproduct_type", "calib_level"])
    o = Observations.query_criteria(obs_collection="SWIFT", objectname="M101", radius="0.1 deg"); p("MAST SWIFT all", len(o), sorted(set(o["instrument_name"])) if len(o) else "")
except Exception as e:
    p("MAST err", traceback.format_exc()[-400:])
log.close()
