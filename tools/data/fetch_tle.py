"""Éléments orbitaux à deux lignes (TLE) des observatoires en orbite basse, depuis CelesTrak :
Hubble (NORAD 20580) et Fermi (NORAD 33053). Le site les propage lui-même (SGP4, satellite.js) pour les placer en direct.
Lancé chaque jour par le workflow « Données réelles » : un TLE vieillit de quelques kilomètres par jour.
Écrit data/<observatoire>-tle.json ; un satellite qui échoue garde son fichier précédent."""
import datetime, json, os, sys, requests
SATS = {"hubble": 20580, "fermi": 33053, "cheops": 44874}
failed = []
for key, norad in SATS.items():
    url = f"https://celestrak.org/NORAD/elements/gp.php?CATNR={norad}&FORMAT=TLE"
    out = os.path.join(os.path.dirname(__file__), "..", "..", "data", key + "-tle.json")
    try:
        r = requests.get(url, timeout=60, headers={"User-Agent": "Observatories (github.com/Rolgim/Observatories)"})
        r.raise_for_status()
        lines = [l.rstrip() for l in r.text.splitlines() if l.strip()]
        if len(lines) < 3 or not lines[1].startswith(f"1 {norad}") or not lines[2].startswith(f"2 {norad}"):
            raise RuntimeError("réponse inattendue de CelesTrak : " + r.text[:300])
        y, d = int(lines[1][18:20]), float(lines[1][20:32])
        epoch = datetime.datetime(2000 + y if y < 57 else 1900 + y, 1, 1, tzinfo=datetime.timezone.utc) + datetime.timedelta(days=d - 1)
        json.dump(dict(name=lines[0].strip(), line1=lines[1], line2=lines[2], epoch=epoch.strftime("%Y-%m-%dT%H:%M:%SZ"),
                       fetched=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), source=url),
                  open(out, "w"), indent=1)
        print("TLE de", key, "époque", epoch.isoformat())
    except Exception as e:
        failed.append(key); print("ÉCHEC", key, repr(e))
if len(failed) == len(SATS):
    sys.exit("aucun TLE récupéré")
