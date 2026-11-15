"""Sonde : colonnes de dbo.ObsPointing (MAST) et essai de la requête par instrument."""
import pyvo, traceback
svc = pyvo.dal.TAPService("https://mast.stsci.edu/vo-tap/api/v0.1/caom")
for q in ("SELECT TOP 3 * FROM dbo.ObsPointing WHERE obs_collection='JWST'",
          "SELECT TOP 5 instrument_name, COUNT(*) AS n FROM dbo.ObsPointing WHERE obs_collection='JWST' GROUP BY instrument_name"):
    print("\n>>>", q)
    try:
        t = svc.run_sync(q).to_table(); print(t.colnames); print(t)
    except Exception:
        traceback.print_exc()
q = ("SELECT instrument_name AS ins, FLOOR(s_ra/0.5) AS i, FLOOR((s_dec+90)/0.5) AS j, FLOOR((t_min-51544.5)/365.25) AS yr, COUNT(*) AS n "
     "FROM dbo.ObsPointing WHERE obs_collection='JWST' AND intentType='science' AND s_ra IS NOT NULL AND t_min IS NOT NULL "
     "GROUP BY instrument_name, FLOOR(s_ra/0.5), FLOOR((s_dec+90)/0.5), FLOOR((t_min-51544.5)/365.25)")
try:
    job = svc.submit_job(q, maxrec=4000000); print("phase après soumission :", job.phase); job.run(); print("phase après run :", job.phase)
    import time; time.sleep(5); print("phase :", job.phase, job.execution_duration)
    try: print("erreur :", job._job.errorsummary)
    except Exception: pass
except Exception:
    traceback.print_exc()
