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
}

def vectors(body, start, stop, step):
    from astroquery.jplhorizons import Horizons
    t = Horizons(id=body, location="500@399", epochs=dict(start=start, stop=stop, step=step)).vectors(refplane="ecliptic")
    return np.array(t["datetime_jd"], dtype=float), np.array([t["x"], t["y"], t["z"]], dtype=float).T * AU

def main():
    out = dict(frame="repère tournant Soleil–Terre, origine au centre de la Terre, milliers de km", source="JPL Horizons", fetched=TODAY.isoformat(), bodies={})
    for key, b in BODIES.items():
        print("==", key, flush=True)
        try:
            jd, r = vectors(b["id"], b["start"], b["stop"], b["step"])
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
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "orbits.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("Corps :", ", ".join(out["bodies"]) or "aucun")

if __name__ == "__main__":
    main()
