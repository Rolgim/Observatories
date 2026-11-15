"""Éléments orbitaux à deux lignes (TLE) de Hubble, NORAD 20580, depuis CelesTrak.
Le site les propage lui-même (SGP4, satellite.js) pour placer Hubble en direct.
Lancé chaque jour par le workflow « Données réelles » : un TLE vieillit de quelques kilomètres par jour."""
import datetime, json, os, sys, requests
URL = "https://celestrak.org/NORAD/elements/gp.php?CATNR=20580&FORMAT=TLE"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "data", "hubble-tle.json")
r = requests.get(URL, timeout=60, headers={"User-Agent": "Observatories (github.com/Rolgim/Observatories)"})
r.raise_for_status()
lines = [l.rstrip() for l in r.text.splitlines() if l.strip()]
if len(lines) < 3 or not lines[1].startswith("1 20580") or not lines[2].startswith("2 20580"):
    sys.exit("réponse inattendue de CelesTrak : " + r.text[:300])
y, d = int(lines[1][18:20]), float(lines[1][20:32])
epoch = datetime.datetime(2000 + y if y < 57 else 1900 + y, 1, 1, tzinfo=datetime.timezone.utc) + datetime.timedelta(days=d - 1)
json.dump(dict(name=lines[0].strip(), line1=lines[1], line2=lines[2], epoch=epoch.strftime("%Y-%m-%dT%H:%M:%SZ"),
               fetched=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), source=URL),
          open(OUT, "w"), indent=1)
print("TLE de Hubble, époque", epoch.isoformat())
