#!/usr/bin/env python3
"""Sonde : conditions d'utilisation des maquettes de l'ESA (SCIFLEET, service SPICE) et conditions générales de l'ESA. Rapport dans tools/probe/_out/licences.txt."""
import os, re, html, requests
OUT = os.path.join(os.path.dirname(__file__), "_out"); os.makedirs(OUT, exist_ok=True)
log = open(os.path.join(OUT, "licences.txt"), "w")
def p(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); log.write(s + "\n"); log.flush()
def text(u):
    r = requests.get(u, timeout=90, headers={"User-Agent": "Mozilla/5.0"}); p("GET", u, r.status_code, len(r.text))
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", r.text, flags=re.S); t = html.unescape(re.sub(r"<[^>]+>", " ", t)); return re.sub(r"\s+", " ", t)
# 1) SCIFLEET : textes autour de « terms », « licen », « free to », « copyright » dans le code de l'application
try:
    B = "https://scifleet.esa.int/"
    idx = requests.get(B, timeout=60).text
    js_files = re.findall(r'assets/[0-9A-Za-z_\-.]+\.js', idx)
    seen = set()
    for f in js_files:
        js = requests.get(B + f, timeout=120).text
        for m in re.findall(r'assets/[0-9A-Za-z_\-.]+\.js', js): js_files.append(m) if m not in js_files and len(js_files) < 80 else None
        for kw in ("terms", "Terms", "licen", "Licen", "free to", "copyright", "Copyright", "CC BY", "Creative", "permission", "credit"):
            for mm in list(re.finditer(re.escape(kw), js))[:6]:
                frag = js[max(0, mm.start() - 250):mm.end() + 250].replace("\n", " ")
                if frag in seen: continue
                seen.add(frag); p("[SCIFLEET " + f + " | " + kw + "]", frag)
except Exception as e: p("ERR scifleet", repr(e)[:300])
# 2) Conditions générales de l'ESA et conditions des images et vidéos
for u in ("https://www.esa.int/Services/Terms_and_conditions", "https://www.esa.int/ESA_Multimedia/Terms_and_Conditions", "https://www.esa.int/ESA_Multimedia/Copyright_Notice_Images"):
    try:
        t = text(u); i = max(0, t.find("Terms")); p("== TEXTE", u, "\n", t[:9000])
    except Exception as e: p("ERR", u, repr(e)[:200])
# 3) Service SPICE de l'ESA, dossier de la maquette de XMM-Newton : lisez-moi, licence ?
for u in ("https://spiftp.esac.esa.int/data/SPICE/XMM/misc/cosmo/", "https://spiftp.esac.esa.int/data/SPICE/XMM/misc/", "https://spiftp.esac.esa.int/data/SPICE/XMM/", "https://www.cosmos.esa.int/web/spice/spice-for-xmm"):
    try: t = text(u); p("== ", u, t[:3000])
    except Exception as e: p("ERR", u, repr(e)[:200])
log.close()
