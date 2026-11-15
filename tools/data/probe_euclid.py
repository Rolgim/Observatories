"""Sonde : ce que les archives exposent pour Euclid DR1 (tables, colonnes, collections, couverture).
Lancée à la main par le workflow « Sonde » ; n'écrit rien dans le dépôt."""
import requests, traceback
ESA = "https://eas.esac.esa.int/tap-server/tap/sync"
IRSA = "https://irsa.ipac.caltech.edu/TAP/sync"
def tap(url, q, n=60):
    print("\n>>>", q)
    try:
        r = requests.get(url, params=dict(REQUEST="doQuery", LANG="ADQL", FORMAT="csv", QUERY=q), timeout=300)
        lines = r.text.splitlines()
        print(f"[{r.status_code}] {len(lines)-1} lignes")
        for l in lines[:n]: print("  ", l[:300])
    except Exception:
        traceback.print_exc()
tap(ESA, "SELECT schema_name FROM tap_schema.schemas")
tap(ESA, "SELECT table_name FROM tap_schema.tables WHERE table_name LIKE 'dr1.%'", 200)
tap(ESA, "SELECT column_name FROM tap_schema.columns WHERE table_name = 'dr1.mer_catalogue'", 400)
tap(ESA, "SELECT TOP 5 * FROM dr1.mer_catalogue")
tap(ESA, "SELECT COUNT(*) FROM dr1.mer_catalogue WHERE 1=CONTAINS(POINT('ICRS', right_ascension, declination), CIRCLE('ICRS', 52.93, -28.09, 0.08))")
tap(ESA, "SELECT TOP 40 tile_index, COUNT(*) AS n FROM dr1.mer_catalogue GROUP BY tile_index ORDER BY n DESC")
tap(IRSA, "SELECT table_name FROM TAP_SCHEMA.tables WHERE LOWER(table_name) LIKE '%euclid%'", 200)
try:
    from astroquery.ipac.irsa import Irsa
    cols = Irsa.list_collections(servicetype="SIA", filter="euclid")
    print("\nCollections SIA IRSA :"); print(cols)
except Exception:
    traceback.print_exc()
try:
    from astroquery.ipac.irsa import Irsa
    from astropy.coordinates import SkyCoord
    import astropy.units as u
    for coll in ("euclid_DpdMerBksMosaic", "euclid_dr1_DpdMerBksMosaic", "euclid_DpdMerBksMosaic_dr1"):
        try:
            t = Irsa.query_sia(pos=(SkyCoord(52.93, -28.09, unit="deg"), 5 * u.arcsec), collection=coll)
            print("\nSIA", coll, len(t)); print(t["obs_collection", "energy_bandpassname", "dataproduct_subtype", "access_url"][:8] if len(t) else "")
        except Exception as e:
            print("SIA", coll, "échec", repr(e)[:200])
except Exception:
    traceback.print_exc()
