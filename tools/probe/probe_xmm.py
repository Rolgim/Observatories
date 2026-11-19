#!/usr/bin/env python3
"""Sonde XMM-Newton : maquettes 3D du service SPICE de l'ESA (dossier misc/cosmo) et leur licence. N'écrit rien dans le dépôt."""
import re, requests
BASE = "https://spiftp.esac.esa.int/data/SPICE/XMM/"
def ls(u, depth=0):
    try:
        r = requests.get(u, timeout=60)
    except Exception as e:
        print("  " * depth, "ÉCHEC", u, repr(e)[:200]); return
    print("  " * depth, u, r.status_code)
    for href in re.findall(r'href="([^"?]+)"', r.text):
        if href.startswith("/") or href.startswith("..") or href.startswith("http"): continue
        v = u + href
        if href.endswith("/"):
            if depth < 3: ls(v, depth + 1)
        else:
            h = requests.head(v, timeout=60)
            print("  " * (depth + 1), href, h.headers.get("Content-Length"))
            if re.search(r"(readme|licen|aareadme|\.txt$|\.json$|\.cmod$)", href, re.I) and int(h.headers.get("Content-Length") or 0) < 200000 and not href.endswith(".cmod"):
                print(requests.get(v, timeout=60).text[:3000])
ls(BASE + "misc/")
print("\n== aareadme du jeu XMM")
for f in ("aareadme.txt", "AAREADME.TXT", "readme.txt"):
    r = requests.get(BASE + f, timeout=60); print(f, r.status_code)
    if r.ok: print(r.text[:4000]); break
