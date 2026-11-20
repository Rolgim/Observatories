#!/usr/bin/env python3
"""Lot F : trajectoires réelles des observatoires, tirées des éphémérides JPL Horizons.

    pip install astroquery astropy numpy
    python tools/data/fetch_orbits.py

Écrit data/orbits.json. Pour chaque observatoire au point L2 : positions par rapport à la Terre dans le repère
tournant Soleil–Terre, en milliers de km :  x vers l'opposé du Soleil (donc vers L2), z vers le nord de l'écliptique,
y complète le trièdre (sens du mouvement de la Terre). Un corps qui échoue est signalé et laissé de côté.
"""
import json, os, datetime
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AU = 149597870.7  # km
TODAY = datetime.date.today()
BODIES = {  # identifiants Horizons, période, pas
    "jwst":   dict(id="-170",    start="2022-02-01", stop=TODAY.isoformat(), step="2d", name="James Webb Space Telescope"),
    "euclid": dict(id="-680",    start="2023-08-15", stop=TODAY.isoformat(), step="2d", name="Euclid"),
    "gaia":   dict(id="-139479", start="2014-02-01", stop="2025-03-15",      step="3d", name="Gaia"),
    # Roman : identifiant Horizons cherché par son nom (voir lookup) ; lancé le 30 août 2026
    # Chandra : orbite terrestre très elliptique ; on garde la dernière orbite (≈ 63,5 h) dans un repère géocentrique fixe (écliptique)
    "chandra": dict(id="-151", start=(TODAY - datetime.timedelta(days=3)).isoformat(), stop=TODAY.isoformat(), step="20m", name="Chandra X-ray Observatory", inertial=True),
    "roman":  dict(id="?Roman",   start="2026-09-05", stop=TODAY.isoformat(), step="2d", name="Nancy Grace Roman Space Telescope"),
    # TESS : orbite très elliptique de 13,7 jours en résonance 2:1 avec la Lune ; la dernière orbite, repère géocentrique fixe
    "tess": dict(id="-95", start=(TODAY - datetime.timedelta(days=14)).isoformat(), stop=TODAY.isoformat(), step="2h", name="TESS", inertial=True),
    # orbites héliocentriques qui suivent la Terre (Spitzer, Kepler) : toute la mission, Soleil au centre, repère qui tourne avec la Terre
    "spitzer": dict(id="-79",  start="2003-08-26", stop="2020-01-30", step="10d", name="Spitzer Space Telescope", helio=True),
    # XMM-Newton : orbite terrestre très elliptique de ≈ 48 h ; identifiant cherché par son nom ; dernière orbite, repère géocentrique fixe
    "xmm": dict(id="?XMM", start=(TODAY - datetime.timedelta(days=3)).isoformat(), stop=TODAY.isoformat(), step="20m", name="XMM-Newton", inertial=True, alts=("XMM-Newton", "X-ray Multi-Mirror")),
    "kepler":  dict(id="-227", start="2009-03-08", stop="2018-11-15", step="10d", name="Kepler", helio=True),
    # vague 1 : missions terminées autour de L2 (toute la mission) et INTEGRAL (une orbite de 2024, repère géocentrique fixe)
    "herschel": dict(id="-486", start="2009-07-15", stop="2013-05-15", step="2d", name="Herschel Space Observatory"),
    "planck":   dict(id="-489", start="2009-07-15", stop="2013-10-15", step="2d", name="Planck"),
    "wmap":     dict(id="-165", start="2001-10-05", stop="2010-08-15", step="4d", name="Wilkinson Microwave Anisotropy Probe"),
    "integral": dict(id="?INTEGRAL", start="2024-06-01", stop="2024-06-04", step="30m", name="INTEGRAL", inertial=True, alts=("INTEGRAL", "International Gamma-Ray Astrophysics Laboratory")),
}

def lookup(name, key="roman", alts=("Nancy Grace Roman", "Roman Space Telescope")):
    """Identifiant Horizons d'un engin spatial à partir de son nom (API horizons_lookup du JPL)."""
    import urllib.request, urllib.parse
    for sstr in (name,) + tuple(alts):
        url = "https://ssd.jpl.nasa.gov/api/horizons_lookup.api?" + urllib.parse.urlencode(dict(sstr=sstr, group="sct"))
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                res = json.load(r).get("result", [])
        except Exception as e:
            print("   recherche", sstr, ": échec", e, flush=True); continue
        print("   recherche", sstr, ":", [(x.get("name"), x.get("spkid")) for x in res], flush=True)
        for x in res:
            if key in (x.get("name") or "").lower() or key in " ".join(x.get("alias") or []).lower():
                return x["spkid"]
    raise RuntimeError("aucun identifiant trouvé pour " + name)

def vectors(body, start, stop, step, center="500@399"):
    from astroquery.jplhorizons import Horizons
    t = Horizons(id=body, location=center, epochs=dict(start=start, stop=stop, step=step)).vectors(refplane="ecliptic")
    return np.array(t["datetime_jd"], dtype=float), np.array([t["x"], t["y"], t["z"]], dtype=float).T * AU

def main():
    prev = os.path.join(ROOT, "data", "orbits.json")
    old = json.load(open(prev, encoding="utf-8")).get("bodies", {}) if os.path.exists(prev) else {}
    out = dict(frame="repère tournant Soleil–Terre, origine au centre de la Terre, milliers de km", source="JPL Horizons", fetched=TODAY.isoformat(), bodies={})
    for key, b in BODIES.items():
        print("==", key, flush=True)
        try:
            if b["id"].startswith("?"):
                q = b["id"][1:]; b["id"] = lookup(q, q.lower(), b.get("alts", ("Nancy Grace Roman", "Roman Space Telescope")))
            jd, r = vectors(b["id"], b["start"], b["stop"], b["step"])
            if b.get("helio"):
                # vecteurs héliocentriques de l'engin et de la Terre ; rotation qui ramène la Terre sur l'axe x (repère tournant), en UA
                jd, r = vectors(b["id"], b["start"], b["stop"], b["step"], center="500@10")
                jd2, e = vectors("399", b["start"], b["stop"], b["step"], center="500@10")
                if len(jd) != len(jd2):
                    raise RuntimeError("séries de longueurs différentes")
                th = np.arctan2(e[:, 1], e[:, 0]); c, sn = np.cos(-th), np.sin(-th)
                u = np.stack([c * r[:, 0] - sn * r[:, 1], sn * r[:, 0] + c * r[:, 1], r[:, 2]], 1) / AU
                de = np.linalg.norm(r - e, axis=1) / AU
                print(f"   {len(jd)} points, distance à la Terre {de.min():.3f} à {de.max():.3f} UA, au Soleil {np.linalg.norm(r, axis=1).min()/AU:.3f} à {np.linalg.norm(r, axis=1).max()/AU:.3f} UA")
                out["bodies"][key] = dict(name=b["name"], horizons_id=b["id"], start=b["start"], frame="héliocentrique, écliptique, tournant avec la Terre (Terre sur l'axe x)", unit="UA",
                                          step_days=float(jd[1] - jd[0]), jd0=float(jd[0]), x=[round(v, 4) for v in u[:, 0]], y=[round(v, 4) for v in u[:, 1]], z=[round(v, 4) for v in u[:, 2]],
                                          d_earth=[round(v, 4) for v in de], earth_r=[round(float(v), 4) for v in np.linalg.norm(e, axis=1) / AU])
                continue
            if b.get("inertial"):
                d = np.linalg.norm(r, axis=1)
                print(f"   {len(jd)} points, distance au centre de la Terre {d.min():,.0f} à {d.max():,.0f} km")
                out["bodies"][key] = dict(name=b["name"], horizons_id=b["id"], start=b["start"], frame="géocentrique, écliptique (fixe)", step_days=float(jd[1] - jd[0]), jd0=float(jd[0]),
                                          x=[round(v / 1000, 1) for v in r[:, 0]], y=[round(v / 1000, 1) for v in r[:, 1]], z=[round(v / 1000, 1) for v in r[:, 2]])
                continue
            jd2, s = vectors("10", b["start"], b["stop"], b["step"])  # Soleil vu de la Terre
            if len(jd) != len(jd2):
                raise RuntimeError("séries de longueurs différentes")
            ex = -s / np.linalg.norm(s, axis=1)[:, None]            # opposé au Soleil
            ez = np.tile([0.0, 0.0, 1.0], (len(s), 1))
            ey = np.cross(ez, ex); ey /= np.linalg.norm(ey, axis=1)[:, None]
            x, y, z = (r * ex).sum(1), (r * ey).sum(1), (r * ez).sum(1)
            d = np.linalg.norm(r, axis=1)
            print(f"   {len(jd)} points, distance à la Terre {d.min():,.0f} à {d.max():,.0f} km, x {x.min():,.0f}..{x.max():,.0f}, y ±{np.abs(y).max():,.0f}, z ±{np.abs(z).max():,.0f}")
            out["bodies"][key] = dict(name=b["name"], horizons_id=b["id"], start=b["start"], step_days=float(jd[1] - jd[0]), jd0=float(jd[0]),
                                      x=[int(round(v / 1000)) for v in x], y=[int(round(v / 1000)) for v in y], z=[int(round(v / 1000)) for v in z])
        except Exception as e:
            print("   ÉCHEC :", repr(e), flush=True)
            if key in old:                                   # garder la série précédente plutôt que de perdre le corps
                out["bodies"][key] = old[key]; print("   série précédente conservée", flush=True)
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "orbits.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("Corps :", ", ".join(out["bodies"]) or "aucun")

if __name__ == "__main__":
    main()
