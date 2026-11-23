#!/usr/bin/env python3
"""Sonde : responsables (PI) des observations ESA montrées sur le site, pour les lignes de crédit exigées par l'ESA (« ESA, nom du PI »). Rapport dans tools/probe/_out/pi.txt."""
import os, json
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "pi.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); log.write(s + "\n"); log.flush()
import pyvo
m = json.load(open(os.path.join(os.path.dirname(__file__), "..", "..", "data", "manifest.json"), encoding="utf-8"))
for k, v in m.items():
    if k.startswith(("xmm/", "herschel/", "planck/", "gaia/", "euclid/")):
        p(k, "|", v.get("credit"), "|", [x for x in v.get("meta", []) if x[0] in ("Archive", "Observation", "Fichier d'origine", "Produit")])
try:
    t = pyvo.dal.TAPService("https://heasarc.gsfc.nasa.gov/xamin/vo/tap").run_sync("SELECT obsid, name, pi_fname, pi_lname FROM xmmmaster WHERE obsid IN ('0412180101', '0510780601', '0104260101')").to_table()
    for r in t: p("XMM", list(r))
except Exception as e: p("ERR xmm", repr(e)[:300])
try:
    t = pyvo.dal.TAPService("https://archives.esac.esa.int/hsa/whsa-tap-server/tap").run_sync("SELECT observation_id, observer, proposal_id, target_name FROM hsa.v_active_observation WHERE observation_id = '1342188329'").to_table()
    for r in t: p("HSA", list(r))
except Exception as e: p("ERR hsa", repr(e)[:300])
log.close()
