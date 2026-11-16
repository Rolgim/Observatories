"""Sonde : observations FGS (JWST et HST) disponibles dans MAST, pour un exemple de données."""
from astroquery.mast import Observations
for coll, ins in (("JWST", "FGS*"), ("HST", "FGS*")):
    try:
        t = Observations.query_criteria(obs_collection=coll, instrument_name=ins, intentType="science")
        print("\n==", coll, len(t), "observations ; instruments :", sorted(set(t["instrument_name"])))
        print("   types :", sorted(set(t["dataproduct_type"])), "niveaux :", sorted(set(int(x) for x in t["calib_level"])))
        t.sort("t_exptime", reverse=True)
        for r in t[:15]:
            print("  ", r["obs_id"], r["target_name"], r["dataproduct_type"], r["calib_level"], round(float(r["t_exptime"] or 0)), r["proposal_id"], round(float(r["s_ra"] or 0), 3), round(float(r["s_dec"] or 0), 3), r["filters"])
    except Exception as e:
        print(coll, "ÉCHEC", repr(e)[:300])
