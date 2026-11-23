#!/usr/bin/env python3
"""Sonde : maquettes d'engins spatiaux du dépôt de données de Gaia Sky (liste, dataset.json : crédits, licence). Rapport dans tools/probe/_out/gaiasky.txt."""
import os, re, json, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "gaiasky.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); log.write(s + "\n"); log.flush()
B = "https://gaia.ari.uni-heidelberg.de/gaiasky/repository/extra/spacecraft/"
def ls(u):
    t = requests.get(u, timeout=60).text
    return [h for h in re.findall(r'href="([^"?/][^"?]*/)"', t) if not h.startswith("..")]
for d in ls(B):
    vs = ls(B + d)
    p("==", d, vs)
    if not vs: continue
    v = sorted(vs)[-1]
    try:
        j = requests.get(B + d + v + "dataset.json", timeout=60).json()
        p(json.dumps({k: j.get(k) for k in ("key", "name", "credits", "license", "links", "version", "size", "description")}, ensure_ascii=False)[:2500])
    except Exception as e: p("   pas de dataset.json :", repr(e)[:150])
# licences des jeux de données
try:
    t = requests.get("https://gaiasky.space/licenses/", timeout=60).text
    t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>", " ", t, flags=re.S)))
    i = t.find("ataset"); p("== licences", t[max(0, i - 1500):i + 3000])
except Exception as e: p("ERR licences", repr(e)[:150])
log.close()
