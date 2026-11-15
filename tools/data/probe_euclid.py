"""Sonde : ce qu'IRSA expose pour Euclid DR1 (colonnes, collections, couverture). N'écrit rien dans le dépôt."""
import requests, traceback
IRSA = "https://irsa.ipac.caltech.edu/TAP/sync"
def tap(q, n=40):
    print("\n>>>", q, flush=True)
    try:
        r = requests.get(IRSA, params=dict(REQUEST="doQuery", LANG="ADQL", FORMAT="csv", QUERY=q), timeout=300)
        lines = r.text.splitlines(); print(f"[{r.status_code}] {len(lines)-1} lignes")
        for l in lines[:n]: print("  ", l[:400])
    except Exception as e:
        print("ÉCHEC", repr(e)[:300])
for t in ("euclid_dr1_mer_catalogue_wide_survey", "euclid_dr1_mer_catalogue_deep_survey", "euclid.objectid_spectrafile_association_dr1", "euclid_dr1_phz_photo_z_wide", "euclid_dr1_spectro_z_spe_quality_wide_survey", "euclid.plane_euclid_dr1"):
    tap(f"SELECT column_name FROM TAP_SCHEMA.columns WHERE table_name = '{t}'", 300)
tap("SELECT TOP 3 * FROM euclid.objectid_spectrafile_association_dr1")
tap("SELECT TOP 3 * FROM euclid_dr1_mer_catalogue_wide_survey")
from astroquery.ipac.irsa import Irsa
from astropy.coordinates import SkyCoord
import astropy.units as u
for coll in ("euclid_dr1_wide_DpdMerBksMosaic", "euclid_dr1_deep_DpdMerBksMosaic"):
    for name, ra, dec in (("EDF-Fornax", 52.93, -28.09), ("EDF-North", 269.73, 66.02), ("EDF-South", 61.24, -48.42), ("Abell 2764", 5.70, -49.25), ("NGC 1300", 49.92, -19.41), ("Fornax A", 50.67, -37.21), ("COSMOS", 150.12, 2.21), ("Abell 3827", 330.47, -59.95), ("NGC 2997", 146.41, -31.19)):
        try:
            t = Irsa.query_sia(pos=(SkyCoord(ra, dec, unit="deg"), 5 * u.arcsec), collection=coll)
            b = sorted(set(str(x) for x in t["energy_bandpassname"])) if len(t) else []
            print(coll, name, len(t), b, flush=True)
            if len(t) and name == "EDF-Fornax": print(t.colnames); print(t[:3])
        except Exception as e:
            print(coll, name, "échec", repr(e)[:200])
