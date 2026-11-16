"""Sonde : tables IRSA d'Euclid DR1 décrivant les poses (date, position), pour l'ordre des plaques ; collections SIA."""
import requests
IRSA = "https://irsa.ipac.caltech.edu/TAP/sync"
def tap(q, n=60):
    print("\n>>>", q, flush=True)
    try:
        r = requests.get(IRSA, params=dict(REQUEST="doQuery", LANG="ADQL", FORMAT="csv", QUERY=q), timeout=300)
        lines = r.text.splitlines(); print(f"[{r.status_code}] {len(lines)-1} lignes")
        for l in lines[:n]: print("  ", l[:300])
    except Exception as e:
        print("ÉCHEC", repr(e)[:300])
tap("SELECT table_name FROM TAP_SCHEMA.tables WHERE LOWER(table_name) LIKE 'euclid%'", 200)
tap("SELECT column_name FROM TAP_SCHEMA.columns WHERE table_name = 'euclid.plane_euclid_dr1'", 100)
tap("SELECT TOP 5 * FROM euclid.plane_euclid_dr1")
tap("SELECT TOP 5 * FROM euclid.observation_euclid_dr1")
try:
    from astroquery.ipac.irsa import Irsa
    c = Irsa.list_collections(servicetype="SIA", filter="euclid"); print(c)
except Exception as e:
    print("collections ÉCHEC", repr(e)[:200])
