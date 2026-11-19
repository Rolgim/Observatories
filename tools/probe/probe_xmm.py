#!/usr/bin/env python3
"""Sonde XMM-Newton : en-têtes du spectre RGS « fluxed » (Capella) et des images OM (M101), miroir HEASARC.
N'écrit rien dans le dépôt. Sert à écrire les recettes xmm/* de fetch_data.py."""
import re, requests, io, gzip
import numpy as np
from astropy.io import fits
def get(u):
    raw = requests.get(u, timeout=180).content
    return gzip.decompress(raw) if raw[:2] == b"\x1f\x8b" else raw
def ls(o):
    u = f"https://heasarc.gsfc.nasa.gov/FTP/xmm/data/rev0/{o}/PPS/"
    return u, re.findall(r'href="([^"?/][^"]*)"', requests.get(u, timeout=60).text)
u, fs = ls("0510780601")
f = [x for x in fs if "FLUXED" in x and x.endswith(".FTZ")][0]
with fits.open(io.BytesIO(get(u + f))) as h:
    for e in h:
        print("== HDU", e.name); print(repr(e.header)[:3500])
        if e.name == "FLUXED":
            d = e.data; print("CHANNEL", d["CHANNEL"][:5], d["CHANNEL"][-5:]); print("FLUX", np.nanmax(d["FLUX"]), np.nanmedian(d["FLUX"]))
for o in ("0104260101", "0212480201"):
    u, fs = ls(o)
    om = [x for x in fs if "SIMAG" in x and x.endswith(".FTZ")]
    print("\n== OM", o, om)
    if om:
        x = [y for y in om if "OMX" in y] or om
        with fits.open(io.BytesIO(get(u + x[0]))) as h:
            for e in h:
                print("   HDU", e.name, getattr(e, "shape", None))
                for k in ("OBJECT", "FILTER", "EXPOSURE", "DATE-OBS", "BUNIT", "CDELT1", "CD1_1", "CRVAL1", "CRVAL2", "BINAX1"):
                    if k in e.header: print("     ", k, "=", e.header[k])
                if e.data is not None and getattr(e.data, "ndim", 0) == 2:
                    d = np.asarray(e.data, float); print("      max", np.nanmax(d), "médiane", np.nanmedian(d))
for o in ("0412180101",):
    u, fs = ls(o)
    x = [y for y in fs if y.startswith("P" + o + "PNS") and "IMAGE_3000.FTZ" in y][0]
    with fits.open(io.BytesIO(get(u + x))) as h:
        e = h[0]; print("\n== EPIC pn", x, e.data.shape)
        for k in ("OBJECT", "EXPOSURE", "DATE-OBS", "CDELT1", "CRPIX1", "CRVAL1", "CRVAL2", "CTYPE1", "REFXCDLT", "BUNIT"):
            if k in e.header: print("     ", k, "=", e.header[k])
        d = np.asarray(e.data, float); iy, ix = np.unravel_index(np.argmax(d), d.shape); print("      total", d.sum(), "max", d.max(), "en", ix, iy)
