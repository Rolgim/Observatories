#!/usr/bin/env python3
"""Sonde XMM-Newton : produits PPS du miroir HEASARC pour quelques observations candidates (images EPIC par bande, spectres RGS, images OM).
N'écrit rien dans le dépôt. Sert à choisir les observations des recettes xmm/* de fetch_data.py."""
import re, requests, io, gzip
TAP = "https://heasarc.gsfc.nasa.gov/xamin/vo/tap"
def tap(adql, n=20):
    import pyvo
    try:
        t = pyvo.dal.TAPService(TAP).search(adql).to_table(); t.pprint(max_lines=n, max_width=220); return t
    except Exception as e:
        print("   ÉCHEC", repr(e)[:300])
print("== M101 et M51 (images OM)")
for k, ra, de in (("M101", 210.8023, 54.3489), ("M51", 202.4696, 47.1952)):
    tap(f"SELECT TOP 6 obsid, name, duration FROM xmmmaster WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra}, {de}, 0.1)) = 1 AND status = 'archived' ORDER BY duration DESC")
KEEP = re.compile(r"(IMAGE_|FLUXED|RGS|SRSPEC|SIMAG|LSIMAG|RSIMAG|FSIMAG|OMX|R1S|R2S|RGX)")
def pps(obsid):
    u = f"https://heasarc.gsfc.nasa.gov/FTP/xmm/data/rev0/{obsid}/PPS/"
    r = requests.get(u, timeout=60); print("\n== PPS", obsid, r.status_code)
    fs = re.findall(r'href="([^"?/][^"]*)"', r.text)
    insts = sorted(set(f[11:14] for f in fs if f.startswith("P")))
    print("   préfixes :", " ".join(insts))
    for f in fs:
        if KEEP.search(f) and not f.endswith(".PDF") and not f.endswith(".HTM"): print("     ", f)
    return u, fs
for o in ("0412180101", "0510780601", "0134721501", "0104260101", "0303420101"):
    try:
        u, fs = pps(o)
        fl = [f for f in fs if "FLUXED" in f and f.endswith(".FTZ")]
        if fl:
            from astropy.io import fits
            raw = requests.get(u + fl[0], timeout=120).content
            if raw[:2] == b"\x1f\x8b": raw = gzip.decompress(raw)
            with fits.open(io.BytesIO(raw)) as h:
                for e in h:
                    print("     HDU", e.name, getattr(e, "columns", None) and e.columns.names, None if e.data is None else len(e.data))
                    for kk in ("OBJECT", "DATE-OBS", "EXPOSURE", "TELESCOP", "INSTRUME"):
                        if kk in e.header: print("       ", kk, "=", e.header[kk])
    except Exception as e:
        print("   ÉCHEC", repr(e)[:300])
