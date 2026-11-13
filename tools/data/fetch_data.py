#!/usr/bin/env python3
"""Lot E : télécharge de vraies observations dans les archives et en tire des aperçus légers pour le site.

    pip install astroquery astropy numpy pillow requests
    python tools/data/fetch_data.py            # tout
    python tools/data/fetch_data.py jwst/miri  # une seule recette

Écrit data/<observatoire>-<instrument>.(jpg|json) et data/manifest.json.
Chaque recette est indépendante : une recette qui échoue est signalée et laissée de côté, les autres continuent.
Rien n'est inventé : une entrée n'apparaît dans le manifeste que si le produit a réellement été téléchargé.
"""
import io, json, math, os, sys, time, datetime, traceback
import numpy as np
import requests

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "data")
TMP = os.path.join(ROOT, "tools", "data", "_tmp")
TODAY = datetime.date.today().isoformat()

# ---------------------------------------------------------------- utilitaires
def mjd_to_date(mjd):
    try:
        return (datetime.datetime(1858, 11, 17) + datetime.timedelta(days=float(mjd))).date().isoformat()
    except Exception:
        return None

def fr(x, nd=0):
    s = f"{x:,.{nd}f}".replace(",", " ").replace(".", ",")
    return s

def clean(v):
    """Valeur de table astropy -> str ou None."""
    try:
        if np.ma.is_masked(v):
            return None
    except Exception:
        pass
    s = str(v).strip()
    return None if s in ("", "--", "nan", "None") else s

def save_json(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, separators=(",", ":"))

def rnd(a, sig=4):
    """Arrondi à quelques chiffres significatifs pour alléger le JSON."""
    out = []
    for v in a:
        v = float(v)
        if v == 0 or not math.isfinite(v):
            out.append(0)
        else:
            out.append(float(f"{v:.{sig}g}"))
    return out

def program_url(collection, pid):
    if collection == "JWST":
        return f"https://www.stsci.edu/jwst/science-execution/program-information?id={pid}"
    return f"https://archive.stsci.edu/proposal_search.php?id={pid}&mission=hst"

# ---------------------------------------------------------------- MAST (HST, JWST)
def mast_obs(collection, instruments, ra, dec, radius_arcmin, kind, extra=None):
    from astroquery.mast import Observations
    from astropy.coordinates import SkyCoord
    import astropy.units as u
    pos = SkyCoord(ra, dec, unit="deg")
    for inst in instruments:
        crit = dict(obs_collection=collection, instrument_name=inst, dataproduct_type=kind, intentType="science", dataRights="PUBLIC")
        if extra:
            crit.update(extra)
        try:
            tab = Observations.query_criteria(coordinates=pos, radius=radius_arcmin * u.arcmin, **crit)
        except Exception as e:
            print("   requête refusée pour", inst, ":", e)
            continue
        if len(tab) == 0:
            print("   aucune observation pour", inst)
            continue
        tab = tab[np.argsort(-np.nan_to_num(np.array(tab["calib_level"], dtype=float)) * 1e9 - np.nan_to_num(np.array(tab["t_exptime"], dtype=float)))]
        return inst, tab
    return None, None

def mast_meta(row, collection, inst):
    pid = clean(row["proposal_id"])
    meta = [["Archive", "MAST (STScI)"], ["Instrument", inst]]
    for label, col in (("Identifiant d'observation", "obs_id"), ("Cible", "target_name"), ("Filtres ou réseau", "filters"), ("Programme", "proposal_id"), ("Responsable du programme", "proposal_pi")):
        v = clean(row[col])
        if v:
            meta.append([label, v])
    d = mjd_to_date(row["t_min"])
    if d:
        meta.append(["Début d'observation", d])
    try:
        meta.append(["Temps de pose", fr(float(row["t_exptime"])) + " s"])
    except Exception:
        pass
    return meta, (program_url(collection, pid) if pid else "https://mast.stsci.edu/")

def mast_image(key, collection, instruments, ra, dec, radius=3, extra=None, name="", expect="", about=""):
    from astroquery.mast import Observations
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None  # les aperçus de mosaïques Hubble dépassent la limite par défaut de Pillow
    inst, tab = mast_obs(collection, instruments, ra, dec, radius, "image", extra)
    if tab is None:
        raise RuntimeError("aucune observation trouvée")
    for row in tab[:8]:
        prods = Observations.get_product_list(row)
        names = np.array([str(x).lower() for x in prods["productFilename"]])
        ok = np.array([n.endswith((".jpg", ".jpeg", ".png")) for n in names]) & np.array([("thumb" not in n) for n in names])
        prev = prods[ok]
        if len(prev) == 0:
            continue
        combined = np.array([any(t in str(x).lower() for t in ("_i2d", "_drz", "_drc")) for x in prev["productFilename"]])
        prev = prev[np.argsort(-(combined * 1e12 + np.nan_to_num(np.array(prev["size"], dtype=float))))]
        for p in prev[:3]:
            local = os.path.join(TMP, str(p["productFilename"]))
            st = Observations.download_file(p["dataURI"], local_path=local)
            if st[0] != "COMPLETE":
                continue
            im = Image.open(local)
            im.draft("RGB", (2200, 2200))  # JPEG : décodage direct à échelle réduite
            im = im.convert("RGB")
            if min(im.size) < 300:
                continue
            im.thumbnail((1100, 1100))
            fname = key.replace("/", "-") + ".jpg"
            im.save(os.path.join(OUT, fname), "JPEG", quality=84, optimize=True)
            meta, url = mast_meta(row, collection, inst)
            meta.append(["Fichier d'origine", str(p["productFilename"])])
            target, filt = clean(row["target_name"]) or "cible non nommée", clean(row["filters"]) or ""
            known = bool(expect) and expect in target.upper().replace(" ", "").replace("-", "")
            title = (name if known else "Cible " + target) + ", " + inst.replace("/IMAGE", "").replace("NIRCAM", "NIRCam") + (", filtre " + filt if filt else "")
            return dict(type="image", file=fname, width=im.size[0], height=im.size[1], title=title, meta=meta, url=url,
                        caption=(about + " " if known else "") + "Aperçu en niveaux de gris d'un produit calibré par la chaîne de traitement de l'archive, réduit pour le site.",
                        credit="NASA, ESA, ASC, STScI" if collection == "JWST" else "NASA, ESA, STScI", fetched=TODAY)
    raise RuntimeError("aucun aperçu exploitable")

def read_spectrum(path):
    from astropy.io import fits
    with fits.open(path) as hdul:
        for h in hdul[1:]:
            cols = [c.upper() for c in (h.columns.names if hasattr(h, "columns") and h.columns is not None else [])]
            if "WAVELENGTH" in cols and "FLUX" in cols:
                d = h.data
                w = np.array(d["WAVELENGTH"], dtype=float).ravel()
                f = np.array(d["FLUX"], dtype=float).ravel()
                wu = str(h.columns["WAVELENGTH"].unit or "").lower()
                fu = str(h.columns["FLUX"].unit or "")
                return w, f, wu, fu
    raise RuntimeError("pas de colonnes WAVELENGTH / FLUX")

def mast_spectrum(key, collection, instruments, ra, dec, radius=0.5, subgroups=("X1DSUM", "X1D"), extra=None, title="", caption="", best_of=1, product_level=None):
    """Télécharge jusqu'à best_of spectres candidats (un par observation) et garde celui au meilleur signal sur bruit."""
    from astroquery.mast import Observations
    inst, tab = mast_obs(collection, instruments, ra, dec, radius, "spectrum", extra)
    if tab is None:
        raise RuntimeError("aucune observation trouvée")
    best, tried = None, 0
    for row in tab[:40]:
        if tried >= best_of:
            break
        prods = Observations.get_product_list(row)
        sub = np.array([str(x).upper() for x in prods["productSubGroupDescription"]])
        got = None
        for sg in subgroups:
            sel = sub == sg
            if product_level is not None:  # ne garder que les produits combinés de ce niveau de calibration
                sel &= np.array(prods["calib_level"], dtype=float) == product_level
            cand = prods[sel]
            if len(cand) == 0:
                continue
            cand = cand[np.argsort(-np.nan_to_num(np.array(cand["size"], dtype=float)))]
            for p in cand[:2]:
                local = os.path.join(TMP, str(p["productFilename"]))
                if Observations.download_file(p["dataURI"], local_path=local)[0] != "COMPLETE":
                    continue
                try:
                    w, f, wu, fu = read_spectrum(local)
                except Exception as e:
                    print("   illisible :", p["productFilename"], e)
                    continue
                good = np.isfinite(w) & np.isfinite(f) & (w > 0) & (f != 0)
                if good.sum() < 50:
                    continue
                got = (w[good], f[good], wu, fu, str(p["productFilename"]))
                break
            if got:
                break
        if not got:
            continue
        tried += 1
        w, f, wu, fu, fname = got
        o = np.argsort(w); w, f = w[o], f[o]
        snr = float(np.median(f) / (np.std(np.diff(f)) / 1.414 + 1e-300))
        print(f"   candidat {fname} : signal sur bruit par pixel ≈ {snr:.1f}")
        if best is None or snr > best[0]:
            best = (snr, row, w, f, wu, fu, fname)
    if best is None:
        raise RuntimeError("aucun spectre exploitable")
    snr, row, w, f, wu, fu, fname = best
    npix = len(w)
    if "angstrom" in wu or (wu == "" and np.median(w) > 500):  # longueurs d'onde en micromètres
        w = w / 1e4
    elif wu in ("nm", "nanometer"):
        w = w / 1e3
    n = 1200
    if len(w) > n:  # moyenne par paquets : on garde la forme du spectre, pas chaque pixel
        m = len(w) // n
        w = w[: m * n].reshape(n, m).mean(axis=1); f = f[: m * n].reshape(n, m).mean(axis=1)
    lo, hi = np.percentile(f, [0.5, 99.5])
    name = key.replace("/", "-") + ".json"
    save_json(name, dict(type="line", x=rnd(w, 6), y=rnd(f), ymin=float(min(lo, 0)), ymax=float(hi * 1.08),
                         xlabel="longueur d'onde (µm)", ylabel="flux (" + (fu or "unité de l'archive") + ")"))
    meta, url = mast_meta(row, collection, inst)
    meta.append(["Fichier d'origine", fname])
    meta.append(["Points", f"{fr(npix)} dans le fichier, {fr(len(w))} tracés" + (" (moyenne par paquets)" if npix > len(w) else "")])
    if best_of > 1:
        meta.append(["Choix de la source", f"meilleur rapport signal sur bruit parmi {tried} sources examinées (≈ {snr:.0f} par pixel)"])
    return dict(type="plot", file=name, title=title, meta=meta, url=url, caption=caption,
                credit="NASA, ESA, ASC, STScI" if collection == "JWST" else "NASA, ESA, STScI", fetched=TODAY)

# ---------------------------------------------------------------- TAP (Gaia, Euclid)
def tap(url, adql):
    r = requests.post(url, data=dict(REQUEST="doQuery", LANG="ADQL", FORMAT="json", QUERY=adql), timeout=300)
    if not r.ok:
        print("   réponse du service TAP :", r.status_code, r.text[:1500].replace("\n", " "))
    r.raise_for_status()
    j = r.json()
    names = [m["name"] for m in j["metadata"]]
    return names, j["data"]

def histogram(v, lo, hi, nb):
    c, e = np.histogram(v, bins=nb, range=(lo, hi))
    return rnd((e[:-1] + e[1:]) / 2, 5), [int(x) for x in c], float(e[1] - e[0])

GAIA_TAP = "https://gea.esac.esa.int/tap-server/tap/sync"
GAIA_ADQL = ("SELECT TOP 8000 phot_g_mean_mag, parallax, bp_rp, radial_velocity FROM gaiadr3.gaia_source "
             "WHERE parallax > 10 AND parallax_over_error > 20 AND ruwe < 1.4 AND phot_g_mean_mag < 16 AND bp_rp IS NOT NULL "
             "ORDER BY random_index")
_gaia = {}
def gaia_rows():
    if "rows" not in _gaia:
        names, data = tap(GAIA_TAP, GAIA_ADQL)
        _gaia["rows"] = np.array([[np.nan if x is None else float(x) for x in r] for r in data])
    return _gaia["rows"]

def gaia_meta(n):
    return [["Archive", "ESA Gaia Archive"], ["Catalogue", "Gaia DR3, table gaiadr3.gaia_source"], ["Sélection", "parallaxe > 10 mas (moins de 100 pc), parallaxe/erreur > 20, RUWE < 1,4, G < 16"],
            ["Étoiles", fr(n) + " tirées au hasard (random_index)"], ["Requête ADQL", GAIA_ADQL]]

def gaia_astro(key):
    a = gaia_rows(); g, plx, col = a[:, 0], a[:, 1], a[:, 2]
    mg = g + 5 * np.log10(plx / 100.0)
    save_json("gaia-astro.json", dict(type="scatter", x=rnd(col, 4), y=rnd(mg, 4), invertY=True, xlabel="couleur BP − RP (mag)", ylabel="magnitude absolue M_G"))
    return dict(type="plot", file="gaia-astro.json", title="Diagramme de Hertzsprung-Russell des étoiles proches", meta=gaia_meta(len(a)), url="https://gea.esac.esa.int/archive/",
                caption="Chaque point est une étoile à moins de 100 parsecs. La magnitude absolue vient de la parallaxe mesurée par le champ astrométrique : M_G = G + 5 log10(parallaxe / 100 mas). La séquence principale, les géantes et les naines blanches se séparent d'elles-mêmes.",
                credit="ESA/Gaia/DPAC", fetched=TODAY)

def gaia_bprp(key):
    a = gaia_rows(); x, y, w = histogram(a[:, 2], -0.5, 4.5, 50)
    save_json("gaia-bprp.json", dict(type="hist", x=x, y=y, binw=w, xlabel="couleur BP − RP (mag)", ylabel="nombre d'étoiles"))
    return dict(type="plot", file="gaia-bprp.json", title="Couleurs des étoiles proches, mesurées par les photomètres BP et RP", meta=gaia_meta(len(a)), url="https://gea.esac.esa.int/archive/",
                caption="Répartition de l'indice de couleur BP − RP pour le même échantillon. Les étoiles rouges de faible masse dominent largement le voisinage solaire.", credit="ESA/Gaia/DPAC", fetched=TODAY)

def gaia_rvs(key):
    a = gaia_rows(); rv = a[:, 3]; rv = rv[np.isfinite(rv)]
    x, y, w = histogram(rv, -150, 150, 60)
    meta = gaia_meta(len(a)); meta.insert(4, ["Avec vitesse radiale", fr(len(rv)) + " étoiles"])
    save_json("gaia-rvs.json", dict(type="hist", x=x, y=y, binw=w, xlabel="vitesse radiale (km/s)", ylabel="nombre d'étoiles"))
    return dict(type="plot", file="gaia-rvs.json", title="Vitesses radiales des étoiles proches, mesurées par le RVS", meta=meta, url="https://gea.esac.esa.int/archive/",
                caption="Vitesse d'éloignement (positive) ou de rapprochement (négative) de chaque étoile de l'échantillon pour laquelle le spectromètre a obtenu une mesure.", credit="ESA/Gaia/DPAC", fetched=TODAY)

EUCLID_TAP = "https://eas.esac.esa.int/tap-server/tap/sync"
_euclid = {}
def euclid_rows():
    """Les noms de table de l'archive Euclid changent d'une publication à l'autre : on les lit dans TAP_SCHEMA."""
    if "rows" in _euclid:
        return _euclid["rows"]
    _, tabs = tap(EUCLID_TAP, "SELECT table_name FROM tap_schema.tables WHERE table_name LIKE '%mer_catalogue%'")
    tabs = [t[0] for t in tabs]
    print("   tables candidates :", tabs)
    if not tabs:
        raise RuntimeError("aucune table mer_catalogue dans l'archive")
    table = sorted(tabs, key=lambda t: (0 if "q1" in t.lower() else 1, len(t)))[0]
    _, cols = tap(EUCLID_TAP, f"SELECT column_name FROM tap_schema.columns WHERE table_name = '{table}'")
    cols = [c[0] for c in cols]
    def pick(*names):
        for n in names:
            if n in cols:
                return n
        raise RuntimeError(f"colonne introuvable parmi {names} ; colonnes : {cols[:60]}")
    ra, dec = pick("right_ascension", "ra"), pick("declination", "dec")
    fv, fh = pick("flux_vis_psf", "flux_vis_1fwhm_aper", "flux_vis_sersic"), pick("flux_h_templfit", "flux_h_1fwhm_aper", "flux_h_sersic")
    adql = (f"SELECT TOP 6000 {fv}, {fh} FROM {table} "
            f"WHERE 1=CONTAINS(POINT('ICRS', {ra}, {dec}), CIRCLE('ICRS', 52.93, -28.09, 0.08)) AND {fv} > 0")
    _, data = tap(EUCLID_TAP, adql)
    if not data:
        raise RuntimeError("requête vide")
    _euclid.update(table=table, adql=adql, cols=(fv, fh))
    _euclid["rows"] = np.array([[np.nan if x is None else float(x) for x in r] for r in data])
    return _euclid["rows"]

def euclid_meta(n):
    return [["Archive", "ESA Euclid Science Archive"], ["Table", _euclid["table"]], ["Colonnes", " et ".join(_euclid["cols"])], ["Champ", "Euclid Deep Field Fornax, disque de 0,08° autour de (52,93° ; −28,09°)"],
            ["Sources", fr(n)], ["Conversion", "magnitude AB = 23,9 − 2,5 log10(flux en µJy)"], ["Requête ADQL", _euclid["adql"]]]

def euclid_vis(key):
    a = euclid_rows(); mag = 23.9 - 2.5 * np.log10(a[:, 0])
    x, y, w = histogram(mag[np.isfinite(mag)], 16, 28, 48)
    save_json("euclid-vis.json", dict(type="hist", x=x, y=y, binw=w, xlabel="magnitude I_E (AB)", ylabel="nombre de sources"))
    return dict(type="plot", file="euclid-vis.json", title="Comptage des sources par magnitude dans la bande I_E de VIS", meta=euclid_meta(len(a)), url="https://eas.esac.esa.int/",
                caption="Le nombre de sources augmente vers les faibles éclats, puis chute là où le relevé cesse d'être complet : c'est la profondeur atteinte dans ce champ.", credit="ESA/Euclid/Euclid Consortium", fetched=TODAY)

def euclid_nisp(key):
    a = euclid_rows(); ok = (a[:, 1] > 0) & np.isfinite(a[:, 1])
    mv = 23.9 - 2.5 * np.log10(a[ok, 0]); mh = 23.9 - 2.5 * np.log10(a[ok, 1])
    keep = np.isfinite(mv) & np.isfinite(mh) & (mv < 26)
    meta = euclid_meta(len(a)); meta.insert(5, ["Détectées aussi en H", fr(int(keep.sum())) + " sources tracées"])
    save_json("euclid-nisp.json", dict(type="scatter", x=rnd(mv[keep], 4), y=rnd((mv - mh)[keep], 4), xlabel="magnitude I_E (AB)", ylabel="couleur I_E − H (mag)"))
    return dict(type="plot", file="euclid-nisp.json", title="Couleur visible − infrarouge des sources, VIS et NISP combinés", meta=meta, url="https://eas.esac.esa.int/",
                caption="Pour chaque source, l'écart entre la magnitude VIS et la magnitude en bande H de NISP. Cette couleur est l'un des ingrédients des décalages vers le rouge photométriques.", credit="ESA/Euclid/Euclid Consortium", fetched=TODAY)

# ---------------------------------------------------------------- recettes
M51, M83, Q3C273, HD209458, SMACS = (202.4696, 47.1952), (204.2538, -29.8658), (187.27792, 2.05239), (330.79489, 18.88432), (110.8375, -73.4540)
ERO = dict(proposal_id="2736")  # premières images scientifiques de JWST, données publiques
SM = "L'amas de galaxies SMACS 0723 : les arcs sont des galaxies lointaines dont l'image est déformée par la gravité de l'amas."
RECIPES = {
    "hubble/wfc3": lambda k: mast_image(k, "HST", ["WFC3/UVIS", "WFC3/IR"], *M83, name="La galaxie spirale M83", expect="M83", about="Une région de la galaxie spirale M83."),
    "hubble/acs": lambda k: mast_image(k, "HST", ["ACS/WFC"], *M51, name="La galaxie du Tourbillon (M51)", expect="M51", about="Une région de la galaxie du Tourbillon."),
    "hubble/stis": lambda k: mast_spectrum(k, "HST", ["STIS/CCD", "STIS/NUV-MAMA", "STIS/FUV-MAMA"], *HD209458, title="Spectre STIS de l'étoile HD 209458", caption="Spectre extrait d'une étoile de type solaire, hôte de la première exoplanète observée en transit."),
    "hubble/cos": lambda k: mast_spectrum(k, "HST", ["COS/FUV", "COS/NUV"], *Q3C273, title="Spectre ultraviolet COS du quasar 3C 273", caption="Sur le continu du quasar, les raies fines en absorption sont dues au gaz situé le long de la ligne de visée, dans notre Galaxie et entre les galaxies. La raie large à droite est l'émission Lyman α du quasar, décalée vers le rouge."),
    "jwst/nircam": lambda k: mast_image(k, "JWST", ["NIRCAM/IMAGE"], *SMACS, extra=ERO, name="SMACS 0723", expect="SMACS", about=SM),
    "jwst/miri": lambda k: mast_image(k, "JWST", ["MIRI/IMAGE"], *SMACS, extra=ERO, name="SMACS 0723", expect="SMACS", about="Le même amas dans l'infrarouge moyen."),
    "jwst/niriss": lambda k: mast_image(k, "JWST", ["NIRISS/IMAGE"], *SMACS, extra=ERO, name="SMACS 0723", expect="SMACS", about="Image directe du même amas prise par NIRISS."),
    "jwst/nirspec": lambda k: mast_spectrum(k, "JWST", ["NIRSPEC/MSA"], *SMACS, radius=3, subgroups=("X1D",), extra=dict(proposal_id="2736", calib_level=3), best_of=30, product_level=3,
                                            title="Spectre NIRSpec d'une source du champ de SMACS 0723", caption="Spectre extrait d'une des sources observées à travers les micro-volets, retenue automatiquement pour son rapport signal sur bruit."),
    "euclid/vis": euclid_vis, "euclid/nisp": euclid_nisp,
    "gaia/astro": gaia_astro, "gaia/bprp": gaia_bprp, "gaia/rvs": gaia_rvs,
}

def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    mpath = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(mpath, encoding="utf-8")) if os.path.exists(mpath) else {}
    todo = sys.argv[1:] or list(RECIPES)
    failed = []
    for key in todo:
        print("==", key, flush=True)
        t0 = time.time()
        try:
            entry = RECIPES[key](key)
            manifest[key] = entry
            print(f"   ok : {entry['file']} ({os.path.getsize(os.path.join(OUT, entry['file'])) // 1024} ko, {time.time() - t0:.0f} s)", flush=True)
            for m in entry["meta"]:
                print("     ", m[0], ":", str(m[1])[:110])
        except Exception as e:
            failed.append(key)
            print("   ÉCHEC :", repr(e), flush=True)
            traceback.print_exc(limit=3)
    with open(mpath, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=1)
    print("\nManifeste :", len(manifest), "entrées. Échecs :", ", ".join(failed) or "aucun")

if __name__ == "__main__":
    main()
