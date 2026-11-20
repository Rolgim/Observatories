#!/usr/bin/env python3
"""Lot E : télécharge de vraies observations dans les archives et en tire des aperçus légers pour le site.

    pip install astroquery astropy numpy pillow requests
    python tools/data/fetch_data.py            # les recettes pas encore dans le manifeste
    python tools/data/fetch_data.py all        # tout refaire
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
            # avec un identifiant d'observation, pas de recherche par position (trop lente dans les champs denses comme le Grand Nuage)
            tab = Observations.query_criteria(**crit) if "obs_id" in crit else Observations.query_criteria(coordinates=pos, radius=radius_arcmin * u.arcmin, **crit)
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
            filt = "" if filt.upper() in ("OPEN", "CLEAR") else filt
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

# Euclid : DR1 (12 novembre 2026), lu sur le miroir IRSA, qui expose catalogues, mosaïques et spectres.
# Champ : COSMOS, couvert par les champs profonds de DR1 ; replis sur les champs profonds Nord et Sud.
EUCLID_FIELDS = (("le champ COSMOS", 150.12, 2.21), ("le champ profond Euclid Nord", 269.73, 66.02), ("le champ profond Euclid Sud", 61.24, -48.42))
EUCLID_DR1_URL = "https://irsa.ipac.caltech.edu/Missions/euclid.html"
def irsa_tap(adql, tries=4):
    from astroquery.ipac.irsa import Irsa
    last = None
    for i in range(tries):  # IRSA est très sollicité depuis la sortie de DR1 : requête asynchrone en premier, synchrone ensuite
        try:
            return Irsa.query_tap(adql, async_job=(i % 2 == 0)).to_table()
        except Exception as e:
            last = e; print("   IRSA TAP", "async" if i % 2 == 0 else "sync", "essai", i + 1, ":", repr(e)[:160], flush=True); time.sleep(15)
    raise RuntimeError(f"IRSA TAP indisponible ({last!r})")

S3_DR1 = "https://nasa-irsa-euclid-dr1.s3.us-east-1.amazonaws.com/"
def s3_list(prefix):
    """Fichiers publiés sous un préfixe du stockage S3 public d'IRSA (lecture anonyme)."""
    import re
    r = requests.get(S3_DR1, params={"list-type": "2", "prefix": prefix, "max-keys": "1000"}, timeout=120); r.raise_for_status()
    return re.findall(r"<Key>([^<]*)</Key>", r.text)
def euclid_tile():
    """Tuile MER de DR1 qui contient le champ des images (son numéro figure dans le nom des mosaïques)."""
    import re
    label, ra, dec, size, cut = euclid_cutouts()
    m = re.search(r"TILE(\d+)", cut["VIS_file"]); return label, ra, dec, m.group(1)

_euclid = {}
def euclid_rows_s3():
    """Catalogue MER final de la tuile, lu directement dans le stockage S3 d'IRSA (le service TAP sature depuis la sortie de DR1)."""
    from astropy.io import fits
    label, ra0, dec0, tile = euclid_tile()
    keys = [k for k in s3_list(f"dr1/catalogs/MER_FINAL_CATALOG/{tile}/") if "MER_FINAL-CAT_" in k and k.endswith(".fits")]
    if not keys:
        raise RuntimeError(f"catalogue MER introuvable pour la tuile {tile}")
    url = S3_DR1 + keys[0]; print("   catalogue :", url, flush=True)
    tmp = os.path.join(os.environ.get("RUNNER_TEMP", "/tmp"), "mer.fits")
    with requests.get(url, stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(tmp, "wb") as fh:
            for ch in r.iter_content(1 << 22): fh.write(ch)
    with fits.open(tmp, memmap=True) as h:
        d = h[1].data; names = {n.upper(): n for n in d.columns.names}
        def pick(*c):
            for n in c:
                if n.upper() in names: return names[n.upper()]
            raise RuntimeError(f"colonne introuvable parmi {c}")
        fv = pick("FLUX_VIS_PSF", "FLUX_VIS_SERSIC", "FLUX_VIS_2FWHM_APER"); fhc = pick("FLUX_H_TEMPLFIT", "FLUX_H_SERSIC", "FLUX_H_2FWHM_APER")
        a = np.array([d[fv], d[fhc]], dtype=float).T
    os.remove(tmp)
    a = a[np.isfinite(a[:, 0]) & (a[:, 0] > 0)]
    _euclid.update(table=keys[0].split("/")[-1], adql=None, cols=(fv, fhc), field=f"{label[0].upper()}{label[1:]}, tuile MER {tile} entière", src="s3")
    _euclid["rows"] = a
    return a

def euclid_rows():
    if "rows" in _euclid:
        return _euclid["rows"]
    try:
        return euclid_rows_s3()
    except Exception as e:
        print("   catalogue S3 indisponible, essai du service TAP :", repr(e)[:200], flush=True)
    table = "euclid_dr1_mer_catalogue_deep_survey"
    cols = [str(c) for c in irsa_tap(f"SELECT column_name FROM TAP_SCHEMA.columns WHERE table_name = '{table}'")["column_name"]]
    def pick(*names):
        for n in names:
            if n in cols:
                return n
        raise RuntimeError(f"colonne introuvable parmi {names}")
    fv = pick("flux_vis_psf", "flux_vis_sersic", "flux_vis_2fwhm_aper")
    fh = pick("flux_h_templfit", "flux_h_sersic", "flux_h_2fwhm_aper")
    last = None
    for label, ra0, dec0 in EUCLID_FIELDS:
        adql = (f"SELECT TOP 6000 {fv}, {fh} FROM {table} "
                f"WHERE 1=CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra0}, {dec0}, 0.08)) AND {fv} > 0")
        try:
            t = irsa_tap(adql)
        except Exception as e:
            last = e; continue
        if len(t) > 500:
            _euclid.update(table=table, adql=adql, cols=(fv, fh), field=f"{label[0].upper()}{label[1:]}, disque de 0,08° autour de ({fr(ra0, 2)}° ; {fr(dec0, 2)}°)".replace("-", "−"))
            _euclid["rows"] = np.array([[np.nan if np.ma.is_masked(x) else float(x) for x in r] for r in t])
            return _euclid["rows"]
        print("   trop peu de sources dans", label, ":", len(t))
    raise RuntimeError(f"aucun champ DR1 exploitable ({last!r})")

def euclid_meta(n):
    m = [["Archive", "NASA/IPAC IRSA, miroir des données Euclid"], ["Publication", "DR1 (12 novembre 2026), catalogue MER des champs profonds"], ["Fichier" if _euclid.get("src") == "s3" else "Table", _euclid["table"]], ["Colonnes", " et ".join(_euclid["cols"])],
         ["Champ", _euclid["field"]], ["Sources", fr(n)], ["Conversion", "magnitude AB = 23,9 − 2,5 log10(flux en µJy)"]]
    if _euclid.get("adql"):
        m.append(["Requête ADQL", _euclid["adql"]])
    return m

def euclid_vis(key):
    a = euclid_rows(); mag = 23.9 - 2.5 * np.log10(a[:, 0])
    x, y, w = histogram(mag[np.isfinite(mag)], 16, 30, 56)
    save_json("euclid-vis.json", dict(type="hist", x=x, y=y, binw=w, xlabel="magnitude I_E (AB)", ylabel="nombre de sources"))
    return dict(type="plot", file="euclid-vis.json", title="Comptage des sources par magnitude dans la bande I_E de VIS", meta=euclid_meta(len(a)), url=EUCLID_DR1_URL,
                caption="Le nombre de sources augmente vers les faibles éclats, puis chute là où le relevé cesse d'être complet : c'est la profondeur atteinte dans ce champ.", credit="ESA/Euclid/Euclid Consortium", fetched=TODAY)

def euclid_nisp(key):
    a = euclid_rows(); ok = (a[:, 1] > 0) & np.isfinite(a[:, 1])
    mv = 23.9 - 2.5 * np.log10(a[ok, 0]); mh = 23.9 - 2.5 * np.log10(a[ok, 1])
    keep = np.isfinite(mv) & np.isfinite(mh) & (mv < 26)
    meta = euclid_meta(len(a)); meta.insert(5, ["Détectées aussi en H", fr(int(keep.sum())) + " sources tracées"])
    save_json("euclid-nisp.json", dict(type="scatter", x=rnd(mv[keep], 4), y=rnd((mv - mh)[keep], 4), xlabel="magnitude I_E (AB)", ylabel="couleur I_E − H (mag)"))
    return dict(type="plot", file="euclid-nisp.json", title="Couleur visible − infrarouge des sources, VIS et NISP combinés", meta=meta, url=EUCLID_DR1_URL,
                caption="Pour chaque source, l'écart entre la magnitude VIS et la magnitude en bande H de NISP. Cette couleur est l'un des ingrédients des décalages vers le rouge photométriques.", credit="ESA/Euclid/Euclid Consortium", fetched=TODAY)

# ---------------------------------------------------------------- Euclid : images et spectre (IRSA, DR1)
def stretch(d, hi_pct=99.7):
    """Étirement asinh : fond ramené à zéro, hautes lumières compressées."""
    d = np.asarray(d, dtype=float)
    # cœurs saturés : la chaîne y laisse des pixels sans valeur (NaN ou 0) au milieu d'une zone très brillante ; on les rend blancs
    bad = ~np.isfinite(d) | (d == 0)
    if bad.any():
        good = np.where(bad, np.nan, d); n = 24; h, w = (d.shape[0] // n) * n, (d.shape[1] // n) * n
        with np.errstate(all="ignore"):
            blk = np.nanmean(good[:h, :w].reshape(h // n, n, w // n, n), axis=(1, 3))
        thr = np.nanpercentile(good, 99.5)
        hot = np.kron(np.nan_to_num(blk, nan=np.inf) > thr, np.ones((n, n), dtype=bool))
        fill = np.zeros_like(bad); fill[:h, :w] = hot
        d = np.where(bad & fill, np.nanmax(good), np.where(bad, np.nanmedian(good), d))
    bg = np.median(d); sig = 1.4826 * np.median(np.abs(d - bg)) + 1e-12; hi = np.percentile(d, hi_pct)
    v = np.arcsinh((d - bg) / (3 * sig)) / np.arcsinh(max(hi - bg, 3 * sig) / (3 * sig))
    return np.clip(v, 0, 1)

_emos = {}
def euclid_cutouts(size_arcmin=4.0):
    if "cut" in _emos:
        return _emos["cut"]
    from astroquery.ipac.irsa import Irsa
    from astropy.coordinates import SkyCoord
    from astropy.io import fits
    from astropy.nddata import Cutout2D
    from astropy.wcs import WCS
    import astropy.units as u
    last = None
    for label, ra, dec in EUCLID_FIELDS:
        for attempt in range(3):
            try:
                coord = SkyCoord(ra, dec, unit="deg")
                tab = Irsa.query_sia(pos=(coord, 5 * u.arcsec), collection="euclid_dr1_deep_DpdMerBksMosaic")
                print("   SIA", label, ":", len(tab), "lignes", flush=True)
                sci = tab[np.array([str(x).strip().lower() == "science" for x in tab["dataproduct_subtype"]])]
                bands = {}
                for r in sci:
                    b = str(r["energy_bandpassname"]).strip().upper()
                    if b in ("VIS", "Y", "J", "H") and b not in bands:
                        bands[b] = r
                print("   bandes Euclid trouvées :", sorted(bands))
                cut = {}
                for b, r in bands.items():
                    with fits.open(str(r["access_url"]), use_fsspec=True) as hdul:
                        c = Cutout2D(hdul[0].section, position=coord, size=size_arcmin * u.arcmin, wcs=WCS(hdul[0].header))
                        cut[b] = np.array(c.data, dtype=float)[::-1]  # nord en haut
                        cut[b + "_file"] = str(r["access_url"]).split("/")[-1]
                        print("   découpe", b, cut[b].shape, cut[b + "_file"], flush=True)
                if "VIS" in cut:
                    _emos["cut"] = (label, ra, dec, size_arcmin, cut)
                    return _emos["cut"]
                break
            except Exception as e:
                last = e
                print("   échec sur", label, ":", repr(e)[:200], flush=True); time.sleep(20 * (attempt + 1))
    raise RuntimeError(f"aucune mosaïque Euclid DR1 accessible ({last!r})")

def euclid_img_meta(ra, dec, size, files):
    return [["Archive", "NASA/IPAC IRSA, miroir des données Euclid"], ["Publication", "DR1 (12 novembre 2026), mosaïques MER des champs profonds"], ["Centre de la découpe", f"{fr(ra, 4)}° ; {fr(dec, 4)}°".replace("-", "−")],
            ["Champ", f"{fr(size, 0)}′ × {fr(size, 0)}′"], ["Fichiers d'origine", " · ".join(files)], ["Traitement", "découpe, étirement asinh, réduction pour le site"]]

def euclid_vis_image(key):
    from PIL import Image
    label, ra, dec, size, cut = euclid_cutouts()
    im = Image.fromarray((stretch(cut["VIS"]) * 255).astype("uint8")); im.thumbnail((1100, 1100))
    im.save(os.path.join(OUT, "euclid-vis-image.jpg"), "JPEG", quality=86, optimize=True)
    return dict(type="image", file="euclid-vis-image.jpg", width=im.size[0], height=im.size[1], title="VIS : " + label, meta=euclid_img_meta(ra, dec, size, [cut["VIS_file"]]), url=EUCLID_DR1_URL,
                caption="Découpe d'une mosaïque VIS, bande I_E, à 0,1″ par pixel avant réduction.", credit="ESA/Euclid/Euclid Consortium/NASA", fetched=TODAY)

def euclid_nisp_image(key):
    from PIL import Image
    label, ra, dec, size, cut = euclid_cutouts()
    if not all(b in cut for b in ("Y", "J", "H")):
        raise RuntimeError("bandes NISP manquantes : " + str(sorted(k for k in cut if len(k) == 1)))
    rgb = np.dstack([stretch(cut["H"]), stretch(cut["J"]), stretch(cut["Y"])])
    im = Image.fromarray((rgb * 255).astype("uint8")); im.thumbnail((1100, 1100))
    im.save(os.path.join(OUT, "euclid-nisp-image.jpg"), "JPEG", quality=86, optimize=True)
    return dict(type="image", file="euclid-nisp-image.jpg", width=im.size[0], height=im.size[1], title="NISP : " + label + ", bandes Y, J et H", meta=euclid_img_meta(ra, dec, size, [cut[b + "_file"] for b in "YJH"]), url=EUCLID_DR1_URL,
                caption="Composition colorée des trois bandes de NISP : H en rouge, J en vert, Y en bleu. Chaque bande est étirée séparément, les couleurs sont donc indicatives.", credit="ESA/Euclid/Euclid Consortium/NASA", fetched=TODAY)

def euclid_spectrum(key):
    try:
        return euclid_spectrum_s3(key)
    except Exception as e:
        print("   spectres S3 indisponibles, essai du service TAP :", repr(e)[:200], flush=True)
    return euclid_spectrum_tap(key)

def euclid_spectrum_s3(key):
    """Spectres 1D combinés de la tuile, lus dans le stockage S3 d'IRSA ; on garde la source au meilleur signal sur bruit."""
    from astropy.io import fits
    from astropy.table import Table
    label, ra0, dec0, tile = euclid_tile()
    keys = [k for k in s3_list(f"dr1/SIR_COMBINED_SPECTRA/{tile}/") if k.endswith(".fits")]
    print("   fichiers de spectres de la tuile :", len(keys), [k.split("/")[-1] for k in keys[:4]], flush=True)
    if not keys:
        raise RuntimeError(f"aucun spectre combiné pour la tuile {tile}")
    # structure DR1 : pour chaque source, une extension N_META (OBJ_ID, position), puis N_COMBINED1D_SIGNAL (spectre combiné), puis une extension par pose
    best, seen, meta_h = None, 0, {}
    for k in keys[:2]:
        url = S3_DR1 + k
        with fits.open(url, use_fsspec=True, lazy_load_hdus=True) as hdul:
            for i in range(1, 3000):
                try:
                    h = hdul[i]
                except IndexError:
                    break
                if h.name.endswith("_META"):
                    meta_h = dict(h.header); continue
                if not h.name.endswith("_COMBINED1D_SIGNAL"):
                    continue
                try:
                    t = Table(h.data); fscale = float(h.header.get("FSCALE", 1.0)); cols = [c.upper() for c in t.colnames]
                    w = np.array(t[t.colnames[cols.index("WAVELENGTH")]], dtype=float); f = np.array(t[t.colnames[cols.index("SIGNAL")]], dtype=float) * fscale
                    ok = np.isfinite(w) & np.isfinite(f) & (f != 0)
                    if "MASK" in cols:
                        m = np.array(t[t.colnames[cols.index("MASK")]]).astype(int); ok &= (m % 2 == 0) & (m < 64)
                    w, f = w[ok], f[ok]; seen += 1
                    if len(w) >= 100:
                        snr = float(np.median(f) / (np.std(np.diff(f)) / 1.414 + 1e-300))
                        if best is None or snr > best[0]:
                            nxt = hdul[i + 1].header if i + 1 < len(hdul) else {}
                            best = (snr, meta_h, w, f, url, i, float(h.header.get("EXPTIME", 0)), str(nxt.get("GWA_POS", "")))
                except Exception as e:
                    print("   extension illisible :", h.name, repr(e)[:160])
                if seen >= 60:
                    break
        if best and best[0] > 5: break
    if best is None:
        raise RuntimeError("aucun spectre lisible dans la tuile")
    snr, mh, w, f, url, i, texp, gwa = best
    oid = str(mh.get("OBJ_ID", "?"))
    grism = "bleu (BG)" if gwa.startswith("BGS") else "rouge (RG)" if gwa.startswith("RGS") else "non indiqué"
    w = w / 1e4; lo, hi = np.percentile(f, [0.5, 99.5])
    save_json("euclid-nisp-spectre.json", dict(type="line", x=rnd(w, 6), y=rnd(f), ymin=float(min(lo, 0)), ymax=float(hi * 1.08), xlabel="longueur d'onde (µm)", ylabel="flux (erg/s/cm²/Å)"))
    meta = [["Archive", "NASA/IPAC IRSA, miroir des données Euclid"], ["Publication", "DR1 (12 novembre 2026), spectres 1D combinés (SIR)"], ["Identifiant Euclid de la source", oid],
            ["Position", f"{fr(float(mh.get('RA_OBJ', 0)), 4)}° ; {fr(float(mh.get('DEC_OBJ', 0)), 4)}°".replace("-", "−")], ["Grisme", grism],
            ["Domaine couvert", f"{fr(w.min(), 2)} à {fr(w.max(), 2)} µm"], ["Temps de pose cumulé", f"{fr(texp)} s"], ["Champ", f"{label[0].upper()}{label[1:]}, tuile MER {tile}"],
            ["Fichier d'origine", url.split("/")[-1] + ", extension " + str(i)], ["Choix de la source", f"meilleur signal sur bruit parmi {seen} sources examinées (≈ {snr:.0f} par pixel)"]]
    return dict(type="plot", file="euclid-nisp-spectre.json", title="Spectre NISP d'une source de DR1", meta=meta, url=EUCLID_DR1_URL,
                caption="Spectre sans fente, extrait et combiné par la chaîne de traitement (pixels marqués comme douteux retirés).", credit="ESA/Euclid/Euclid Consortium/NASA", fetched=TODAY)

def euclid_spectrum_tap(key):
    from astroquery.ipac.irsa import Irsa
    from astropy.io import fits
    from astropy.table import Table
    res = irsa_tap("SELECT TOP 80 * FROM euclid.objectid_spectrafile_association_dr1 WHERE hdu IS NOT NULL AND hdu > 0 AND hdu < 40")
    if "bandpass_name" in res.colnames:
        print("   grismes présents dans l'échantillon :", sorted(set(str(x) for x in res["bandpass_name"])))
    print("   candidats :", len(res), res.colnames, "· première ligne :", [str(v)[:120] for v in res[0]])
    pcol = [c for c in res.colnames if c.lower() in ("path", "uri", "access_url", "file_path")]
    pcol = pcol[0] if pcol else res.colnames[1]
    res = res[[len(str(v).strip()) > 3 and str(v).strip() != "--" for v in res[pcol]]]
    print("   colonne de chemin :", pcol, "· lignes avec chemin :", len(res))
    best, base = None, None
    for r in res:
        try:
            pth = str(r[pcol]).strip().lstrip("/")
            if base is None:  # où les fichiers sont-ils servis ? on essaie les emplacements connus, une fois
                for b in ("https://irsa.ipac.caltech.edu/ibe/data/", "https://irsa.ipac.caltech.edu/data/", "https://nasa-irsa-euclid-dr1.s3.us-east-1.amazonaws.com/", "https://nasa-irsa-euclid-q1.s3.us-east-1.amazonaws.com/", "https://irsa.ipac.caltech.edu/"):
                    for q in (pth, pth.replace("euclid/dr1/", "dr1/", 1), pth.replace("euclid/", "", 1)):
                        try:
                            rr = requests.get(b + q, headers={"Range": "bytes=0-79"}, timeout=60)
                            print("   essai", b + q[:30], "→", rr.status_code, rr.content[:12])
                            if rr.status_code in (200, 206) and rr.content[:6] == b"SIMPLE":
                                base = (b, pth[: len(pth) - len(q)]); break
                        except Exception as e:
                            print("   essai", b, "→", repr(e)[:80])
                    if base:
                        break
                if base is None:
                    raise RuntimeError("fichiers de spectres introuvables")
            url = base[0] + pth[len(base[1]):]
            with fits.open(url, use_fsspec=True, lazy_load_hdus=True) as hdul:
                h = hdul[int(r["hdu"])]
                t = Table(h.data); fscale = float(h.header.get("FSCALE", 1.0))
            if True:
                cols = [c.upper() for c in t.colnames]
                if "SIGNAL" not in cols and "FLUX" in cols:
                    t.rename_column(t.colnames[cols.index("FLUX")], "SIGNAL"); cols = [c.upper() for c in t.colnames]
                w = np.array(t[t.colnames[cols.index("WAVELENGTH")]], dtype=float); f = np.array(t[t.colnames[cols.index("SIGNAL")]], dtype=float) * fscale
                ok = np.isfinite(w) & np.isfinite(f) & (f != 0)
                if "MASK" in cols:
                    m = np.array(t[t.colnames[cols.index("MASK")]]).astype(int); ok &= (m % 2 == 0) & (m < 64)
                w, f = w[ok], f[ok]
                if len(w) < 100:
                    continue
                snr = float(np.median(f) / (np.std(np.diff(f)) / 1.414 + 1e-300))
                print(f"   objet {r['objectid']} : {len(w)} points, signal sur bruit ≈ {snr:.1f}")
                if best is None or snr > best[0]:
                    best = (snr, r, w, f, url)
        except Exception as e:
            nerr = locals().get("nerr", 0) + 1
            if nerr <= 2:
                print("   illisible :", repr(e)[:300])
    if best is None:
        raise RuntimeError("aucun spectre Euclid lisible")
    snr, r, w, f, url = best
    w = w / 1e4; lo, hi = np.percentile(f, [0.5, 99.5])
    save_json("euclid-nisp-spectre.json", dict(type="line", x=rnd(w, 6), y=rnd(f), ymin=float(min(lo, 0)), ymax=float(hi * 1.08), xlabel="longueur d'onde (µm)", ylabel="flux (erg/s/cm²/Å)"))
    meta = [["Archive", "NASA/IPAC IRSA, miroir des données Euclid"], ["Publication", "DR1 (12 novembre 2026), spectres 1D combinés (SIR)"], ["Identifiant Euclid de la source", str(r["objectid"])],
            ["Grisme", str(r["bandpass_name"]) if "bandpass_name" in r.colnames else "rouge (RG)"],
            ["Fichier d'origine", url.split("/")[-1] + ", extension " + str(r["hdu"])], ["Choix de la source", f"meilleur signal sur bruit parmi {len(res)} sources examinées (≈ {snr:.0f} par pixel)"]]
    return dict(type="plot", file="euclid-nisp-spectre.json", title="Spectre NISP d'une source de DR1", meta=meta, url=EUCLID_DR1_URL,
                caption="Spectre sans fente, extrait et combiné par la chaîne de traitement (pixels marqués comme douteux retirés).", credit="ESA/Euclid/Euclid Consortium/NASA", fetched=TODAY)

# ---------------------------------------------------------------- Gaia : vrais spectres (DataLink)
_gstar = {}
def gaia_star():
    if "s" not in _gstar:
        names, data = tap(GAIA_TAP, "SELECT TOP 1 source_id, phot_g_mean_mag, bp_rp, teff_gspphot, parallax, radial_velocity FROM gaiadr3.gaia_source "
                                    "WHERE has_xp_sampled = 'True' AND has_rvs = 'True' AND phot_g_mean_mag BETWEEN 6.5 AND 8 AND parallax > 20 AND teff_gspphot BETWEEN 5000 AND 6500 ORDER BY random_index")
        _gstar["s"] = dict(zip(names, data[0]))
        print("   étoile retenue :", _gstar["s"])
    return _gstar["s"]

def gaia_datalink(source_id, kind):
    from astroquery.gaia import Gaia
    res = Gaia.load_data(ids=[int(source_id)], data_release="Gaia DR3", retrieval_type=kind, data_structure="DATAMODEL_STANDARD")
    print("   DataLink", kind, ":", list(res.keys()))
    item = list(res.values())[0]
    item = item[0] if isinstance(item, (list, tuple)) else item
    t = item.to_table() if hasattr(item, "to_table") else item
    print("   colonnes :", t.colnames, "·", len(t), "lignes")
    w = np.array(t["wavelength"], dtype=float); f = np.array(np.ma.filled(t["flux"].astype(float), np.nan), dtype=float)
    ok = np.isfinite(w) & np.isfinite(f)
    return w[ok], f[ok]

def gaia_star_meta(s, extra):
    return [["Archive", "ESA Gaia Archive, service DataLink"], ["Catalogue", "Gaia DR3"], ["Identifiant de la source", str(s["source_id"])], ["Magnitude G", fr(float(s["phot_g_mean_mag"]), 2)],
            ["Température estimée", fr(float(s["teff_gspphot"])) + " K"], ["Distance", fr(1000 / float(s["parallax"]), 1) + " pc"]] + extra + [["Choix de l'étoile", "tirée au hasard parmi les étoiles proches de type solaire ayant les deux spectres publiés"]]

def gaia_xp_spectrum(key):
    s = gaia_star(); w, f = gaia_datalink(s["source_id"], "XP_SAMPLED")
    save_json("gaia-bprp-spectre.json", dict(type="line", x=rnd(w, 5), y=rnd(f), ymin=0, ymax=float(f.max() * 1.08), xlabel="longueur d'onde (nm)", ylabel="flux (W/m²/nm)"))
    return dict(type="plot", file="gaia-bprp-spectre.json", title="Spectre BP/RP d'une étoile proche de type solaire", meta=gaia_star_meta(s, [["Produit", "XP_SAMPLED : spectre BP/RP calibré, échantillonné tous les 2 nm"]]), url="https://gea.esac.esa.int/archive/",
                caption="Le spectre basse résolution des deux photomètres, raccordés en une seule courbe de 336 à 1 020 nm. C'est de cette forme que sont tirées la température et l'extinction de l'étoile.", credit="ESA/Gaia/DPAC", fetched=TODAY)

def gaia_rvs_spectrum(key):
    s = gaia_star(); w, f = gaia_datalink(s["source_id"], "RVS")
    save_json("gaia-rvs-spectre.json", dict(type="line", x=rnd(w, 6), y=rnd(f), ymin=0, ymax=float(max(1.1, np.percentile(f, 99.5) * 1.05)), xlabel="longueur d'onde (nm)", ylabel="flux normalisé"))
    rv = s.get("radial_velocity")
    return dict(type="plot", file="gaia-rvs-spectre.json", title="Spectre RVS de la même étoile", meta=gaia_star_meta(s, [["Produit", "RVS : spectre moyen normalisé, 846 à 870 nm"]] + ([["Vitesse radiale mesurée", fr(float(rv), 1).replace("-", "−") + " km/s"]] if rv is not None else [])), url="https://gea.esac.esa.int/archive/",
                caption="Les trois creux profonds sont le triplet du calcium ionisé. Leur décalage par rapport à leur position au repos donne la vitesse radiale de l'étoile.", credit="ESA/Gaia/DPAC", fetched=TODAY)

# ---------------------------------------------------------------- recettes
M51, M83, Q3C273, HD209458, SMACS = (202.4696, 47.1952), (204.2538, -29.8658), (187.27792, 2.05239), (330.79489, 18.88432), (110.8375, -73.4540)
ERO = dict(proposal_id="2736")  # premières images scientifiques de JWST, données publiques
SM = "L'amas de galaxies SMACS 0723 : les arcs sont des galaxies lointaines dont l'image est déformée par la gravité de l'amas."
def fgs_curve(local):
    """Somme des quatre photomultiplicateurs d'un fichier FGS (40 Hz), moyennée par 2 min, corrigée des oscillations orbitales de Hubble."""
    from astropy.io import fits
    with fits.open(local) as h:
        hdr = h[0].header; data = np.array(h[0].data, dtype=float); tab = h[1].data
    med = np.median(data, axis=1); print("   médianes des 7 lignes :", [round(float(m), 1) for m in med])
    dt = 0.025
    flux = data[:4].sum(axis=0)
    nb = int(round(120 / dt)); m = flux.size // nb
    fb = flux[:m*nb].reshape(m, nb); good = fb > 0.2 * np.median(fb)
    fb = np.where(good.mean(axis=1) > 0.8, np.nanmean(np.where(good, fb, np.nan), axis=1), np.nan)
    tb = (np.arange(m) + 0.5) * nb * dt / 3600.0
    ok = np.isfinite(fb); fb = fb / np.median(fb[ok])
    P = 96.4 / 60  # période orbitale de Hubble, en heures
    def design(t):
        cols = [np.ones_like(t), t, t*t]
        for k in (1, 2, 3): cols += [np.sin(2*np.pi*k*t/P), np.cos(2*np.pi*k*t/P)]
        return np.array(cols).T
    use = ok.copy(); dip = None
    for it in range(3):
        c, *_ = np.linalg.lstsq(design(tb[use]), fb[use], rcond=None)
        res = fb - design(tb) @ c
        w = int(round(3.0 * 60 / 2))           # transit d'environ 3 h
        run = np.convolve(np.where(ok, res, 0), np.ones(w)/w, mode="same")
        k0 = int(np.nanargmin(np.where(ok, run, np.inf))); dip = (tb[k0], -run[k0])
        use = ok & (np.abs(tb - tb[k0]) > 2.2)
    det = fb / (design(tb) @ c)
    return tb[ok], det[ok], dip, hdr

def hubble_fgs(key):
    """Photométrie d'une étoile brillante par le capteur de guidage fin de Hubble : 13 h de mesures à 40 Hz (programme 11945, étoile HD 17156)."""
    from astroquery.mast import Observations
    obs = Observations.query_criteria(obs_collection="HST", obs_id="fb8u5502m")
    prods = Observations.get_product_list(obs)
    pr = None
    for sub in ("A2F", "A1F", "A3F"):
        q = prods[[str(x).upper() == sub for x in prods["productSubGroupDescription"]]]
        if len(q): pr = q[0]; break
    local = os.path.join(TMP, str(pr["productFilename"]))
    if Observations.download_file(pr["dataURI"], local_path=local)[0] != "COMPLETE":
        raise RuntimeError("téléchargement impossible")
    t, f, dip, hdr = fgs_curve(local)
    ppm = float(np.std(f) * 1e6)
    lo, hi = np.percentile(f, [0.5, 99.5])
    save_json("hubble-fgs.json", dict(type="line", x=rnd(t, 5), y=rnd(f, 6), ymin=float(lo - 0.0015), ymax=float(hi + 0.0015), xlabel="temps depuis le début de la pose (h)", ylabel="flux relatif"))
    row = obs[0]; start = datetime.date(1858, 11, 17) + datetime.timedelta(days=float(row["t_min"]))
    meta = [["Archive", "MAST (STScI)"], ["Instrument", f"FGS ({str(hdr.get('PRIMESI', '')).strip()}), mode photométrique"], ["Identifiant d'observation", "fb8u5502m"],
            ["Cible", "HD 17156 (V ≈ 8)"], ["Programme", "11945"], ["Début d'observation", start.isoformat()], ["Durée", f"{fr(float(row['t_exptime'])/3600, 1)} h sans interruption"],
            ["Données", "somme des quatre photomultiplicateurs, mesurée 40 fois par seconde, moyennée par tranches de 2 min"],
            ["Traitement", "division par un modèle des oscillations liées à l'orbite de Hubble (96 min)"], ["Dispersion restante", f"≈ {fr(ppm)} millionièmes (ppm) par point de 2 min"], ["Fichier d'origine", str(pr["productFilename"])]]
    return dict(type="plot", file="hubble-fgs.json", title="Éclat d'une étoile suivi pendant 13 heures par un capteur de guidage fin", meta=meta,
                url="https://archive.stsci.edu/proposal_search.php?id=11945&mission=hst",
                caption="Les FGS comptent les photons de l'étoile 40 fois par seconde. Utilisés comme photomètres, ils mesurent son éclat sans interruption : l'étoile, proche du pôle de l'orbite, n'est jamais cachée par la Terre. Ce qui reste après correction de l'orbite donne la précision de la mesure.", credit="NASA, ESA, STScI", fetched=TODAY)

# ---------- Chandra : produits standard de l'archive CDA (Chandra Data Archive, CXC) ----------
# Images binnées par le pipeline (cntr_img2) et spectres extraits des réseaux (pha2), tels que l'archive les distribue.
CDA = "https://cxc.cfa.harvard.edu/cdaftp/byobsid/{d}/{o}/primary/"
CDA_TAP = "https://heasarc.gsfc.nasa.gov/xamin/vo/tap"

def cda_files(obsid):
    import re
    u = CDA.format(d=str(obsid)[-1], o=obsid)
    r = requests.get(u, timeout=60); r.raise_for_status()
    return u, re.findall(r'href="([^"?/][^"]*)"', r.text)

def cda_fits(url):
    """Télécharge un FITS de l'archive (le serveur le décompresse parfois lui-même)."""
    import gzip
    from astropy.io import fits
    raw = requests.get(url, timeout=600).content
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    return fits.open(io.BytesIO(raw))

def cda_url(obsid):
    return f"https://cda.harvard.edu/chaser/startViewer.do?menuItem=details&obsid={obsid}"

def cda_meta(h, fname, extra=()):
    det = clean(h.get("DETNAM")) or ""
    inst = clean(h.get("INSTRUME")) or ""
    grat = clean(h.get("GRATING")) or "NONE"
    if inst == "ACIS" and det.startswith("ACIS-"):
        # numérotation des puces : 0 à 3 = ACIS-I (I0 à I3), 4 à 9 = ACIS-S (S0 à S5)
        chips = [int(x) for x in det[5:] if x.isdigit()]
        names = ["I" + str(c) if c < 4 else "S" + str(c - 4) for c in chips]
        arr = "ACIS-S" if min(chips) >= 4 else "ACIS-I" if max(chips) <= 3 else "ACIS"
        det = arr + (", puce " + names[0] if len(names) == 1 else ", puces " + " à ".join((names[0], names[-1])))
        inst = ""
    meta = [["Archive", "Chandra Data Archive (CXC)"], ["Instrument", (inst + " (" + det + ")" if inst and det and det != inst else inst or det) + ("" if grat == "NONE" else " + " + grat)],
            ["Identifiant d'observation", "ObsID " + str(h.get("OBS_ID"))], ["Cible", clean(h.get("OBJECT")) or "cible non nommée"]]
    if clean(h.get("TITLE")):
        meta.append(["Programme", h["TITLE"].strip()])
    if clean(h.get("OBSERVER")):
        meta.append(["Responsable du programme", h["OBSERVER"].strip()])
    meta.append(["Début d'observation", str(h.get("DATE-OBS"))[:10]])
    meta.append(["Temps de pose", fr(float(h["EXPOSURE"])) + " s"])
    meta += [list(x) for x in extra]
    meta.append(["Fichier d'origine", fname])
    return meta

def chandra_image(key, obsids, name, about, cutoff=99.9):
    from PIL import Image
    for o in obsids:
        try:
            u, files = cda_files(o)
        except Exception as e:
            print("   ObsID", o, ":", e); continue
        f = [x for x in files if x.endswith(("cntr_img2.fits", "cntr_img2.fits.gz"))]
        if not f:
            print("   ObsID", o, ": pas d'image cntr_img2"); continue
        with cda_fits(u + f[0]) as hd:
            h = hd[0].header; d = np.asarray(hd[0].data, dtype=float)
        d = np.nan_to_num(d)
        # étirement logarithmique : le ciel X est presque vide, les sources très brillantes
        hi = np.percentile(d[d > 0], cutoff) if np.any(d > 0) else 1
        v = np.log1p(np.clip(d, 0, hi) / (hi / 300.0)) / np.log1p(300.0)
        im = Image.fromarray((np.flipud(v) * 255).astype(np.uint8), "L")
        if max(im.size) > 1100:
            im.thumbnail((1100, 1100))
        fname = key.replace("/", "-").replace(":", "-") + ".jpg"
        im.save(os.path.join(OUT, fname), "JPEG", quality=86, optimize=True)
        pix = abs(float(h.get("CDELT1", 0))) * 3600
        side = pix * d.shape[1] / 60
        meta = cda_meta(h, f[0].replace(".gz", ""), extra=[["Échelle", fr(pix, 3) + "″ par pixel, " + fr(side, 1) + "′ de côté"],
                                                          ["Coups dans l'image", fr(float(d.sum()))],
                                                          ["Traitement", "image binnée par le pipeline standard (toutes énergies), étirement logarithmique pour le site"]])
        return dict(type="image", file=fname, width=im.size[0], height=im.size[1], title=name + ", " + (clean(h.get("DETNAM")) if h.get("INSTRUME") == "HRC" else "ACIS"), meta=meta, url=cda_url(o),
                    caption=about + " Chaque pixel compte les photons X reçus : noir là où il n'en arrive presque aucun.", credit="NASA, CXC, SAO", fetched=TODAY)
    raise RuntimeError("aucune image exploitable")

def chandra_hrc_obsids(ra, dec, n=6):
    """ObsID HRC-I sans réseau autour d'une position, les plus longues poses d'abord (catalogue chanmaster du HEASARC)."""
    import pyvo
    t = pyvo.dal.TAPService(CDA_TAP).search(
        "SELECT TOP 200 obsid, name, detector, grating, exposure, status FROM chanmaster WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', "
        + str(ra) + ", " + str(dec) + ", 0.05)) = 1 ORDER BY exposure DESC").to_table()
    dets = {}
    for d, g in zip(t["detector"], t["grating"]): dets[f"{d}/{g}"] = dets.get(f"{d}/{g}", 0) + 1
    print("   catalogue :", len(t), "observations ;", dets)
    ok = [str(d).replace(" ", "").upper().startswith("HRC-I") and str(g).strip().upper() in ("NONE", "") for d, g in zip(t["detector"], t["grating"])]
    return [int(x) for x in t[ok]["obsid"][:n]]

def chandra_grating(key, obsid, part, lo, hi, rebin, title, caption):
    u, files = cda_files(obsid)
    f = [x for x in files if x.endswith(("pha2.fits", "pha2.fits.gz"))]
    if not f:
        raise RuntimeError("pas de pha2")
    with cda_fits(u + f[0]) as hd:
        sp = hd["SPECTRUM"]; h = sp.header; d = sp.data
        rows = [i for i in range(len(d)) if int(d["TG_PART"][i]) == part and abs(int(d["TG_M"][i])) == 1]
        if len(rows) != 2:
            raise RuntimeError("ordres ±1 introuvables")
        w = 0.5 * (np.asarray(d["BIN_LO"][rows[0]], float) + np.asarray(d["BIN_HI"][rows[0]], float))
        c = np.zeros_like(w)
        for i in rows:
            wi = 0.5 * (np.asarray(d["BIN_LO"][i], float) + np.asarray(d["BIN_HI"][i], float))
            if not np.allclose(wi, w):
                raise RuntimeError("grilles des ordres différentes")
            c += np.asarray(d["COUNTS"][i], float)
        step = abs(float(np.median(np.diff(w))))
    o = np.argsort(w); w, c = w[o], c[o]
    keep = (w >= lo) & (w <= hi); w, c = w[keep], c[keep]
    total = float(c.sum())
    n = len(w) // rebin * rebin
    wb = w[:n].reshape(-1, rebin).mean(1); cb = c[:n].reshape(-1, rebin).sum(1)
    fname = key.replace("/", "-").replace(":", "-") + ".json"
    binw = step * rebin
    save_json(fname, dict(type="line", x=rnd(wb, 5), y=[int(v) for v in cb], ymin=0, xlabel="longueur d'onde (Å)", ylabel="coups par intervalle de " + fr(binw, 3) + " Å"))
    arm = {1: "HEG", 2: "MEG", 3: "LEG"}[part]
    meta = cda_meta(h, f[0].replace(".gz", ""), extra=[["Données", "ordres +1 et −1 du bras " + arm + " additionnés, " + fr(lo) + " à " + fr(hi) + " Å"],
                                                      ["Coups", fr(total)],
                                                      ["Points", fr(len(w)) + " dans l'intervalle, " + fr(len(wb)) + " tracés (somme par paquets de " + str(rebin) + ")"]])
    return dict(type="plot", file=fname, title=title, meta=meta, url=cda_url(obsid), caption=caption, credit="NASA, CXC, SAO", fetched=TODAY)

HRC_TARGETS = (
    (83.6331, 22.0145, "La nébuleuse du Crabe", "La nébuleuse du Crabe, reste d'une supernova observée en 1054 : au centre, le pulsar, étoile à neutrons qui tourne 30 fois par seconde, entouré d'anneaux et de jets de particules."),
    (10.6847, 41.2690, "Le centre de la galaxie d'Andromède", "Le centre de la galaxie d'Andromède (M31) : chaque point est une source X, le plus souvent une étoile double où une étoile à neutrons ou un trou noir capte la matière de son compagnon."),
    (83.8187, -5.3897, "L'amas du Trapèze, dans la nébuleuse d'Orion", "L'amas du Trapèze, au cœur de la nébuleuse d'Orion : chaque point est une étoile jeune, dont la couronne agitée brille en rayons X."),
)

def chandra_hrc(key):
    """Image HRC-I : première cible de la liste qui a une pose HRC-I publique avec une image standard."""
    for ra, dec, name, about in HRC_TARGETS:
        print("   cible :", name)
        try:
            ids = chandra_hrc_obsids(ra, dec)
        except Exception as e:
            print("   catalogue refusé :", repr(e)[:200]); continue
        if ids:
            try:
                return chandra_image(key, ids, name, about)
            except RuntimeError as e:
                print("  ", e)
    raise RuntimeError("aucune cible avec une image HRC-I")

CAS_A = "Le reste de la supernova Cassiopée A, dont la lumière de l'explosion nous est parvenue il y a environ 340 ans : une coquille de gaz à plusieurs millions de degrés, et au centre le point de l'étoile à neutrons, découverte par Chandra dès ses premières images."
CAPELLA = "Capella, une étoile proche dont la couronne, à plusieurs millions de degrés, émet des raies X du fer, de l'oxygène et du néon."

# ---------- Spitzer : mosaïques des Spitzer Enhanced Imaging Products (IRSA), découpées par le service de l'IRSA ----------
IRSA_SIA = "https://irsa.ipac.caltech.edu/SIA"

def seip_cutout(ra, dec, band, size_arcmin):
    """Découpe d'une mosaïque SEIP « science » (fichier .mosaic.fits) d'une bande donnée (IRAC1 à IRAC4, MIPS24)."""
    import pyvo
    from astropy.coordinates import SkyCoord
    from astropy.io import fits
    import astropy.units as u
    res = pyvo.dal.SIA2Service(IRSA_SIA).search(pos=(SkyCoord(ra, dec, unit="deg"), 1 * u.arcmin), collection="spitzer_seip").to_table()
    ok = [r for r in res if str(r["dataproduct_subtype"]) == "science" and str(r["energy_bandpassname"]) == band and str(r["access_url"]).endswith(".mosaic.fits")]
    if not ok:
        raise RuntimeError("pas de mosaïque SEIP " + band)
    # la mosaïque entière, puis une découpe centrée sur la cible d'après son repère céleste (le service de découpe de l'IRSA renvoie la mosaïque complète)
    from astropy.nddata import Cutout2D
    from astropy.wcs import WCS
    best = None
    for row in ok[:6]:                           # plusieurs mosaïques recouvrent la position : on garde celle qui couvre le mieux la découpe
        url = str(row["access_url"])
        try:
            r = requests.get(url, timeout=900); r.raise_for_status()
            hd = fits.open(io.BytesIO(r.content)); h = hd[0].header
            cut = Cutout2D(np.asarray(hd[0].data, dtype=float), SkyCoord(ra, dec, unit="deg"), size_arcmin * u.arcmin, wcs=WCS(h), mode="partial", fill_value=np.nan)
        except Exception as e:
            print("   mosaïque ignorée :", url.rsplit("/", 1)[1], repr(e)[:120]); continue
        cov = float(np.mean(np.isfinite(cut.data) & (cut.data != 0)))
        print("   ", url.rsplit("/", 1)[1], "couverture", round(cov, 3))
        if best is None or cov > best[0]:
            best = (cov, cut.data, h, url.rsplit("/", 1)[1], str(row["obs_id"]))
        if cov > 0.97: break
    if best is None or best[0] < 0.5:
        raise RuntimeError("aucune mosaïque " + band + " ne couvre la cible")
    return best[1], best[2], best[3], best[4]

def asinh_stretch(d, lo_pct=1.0, hi_pct=99.7, soft=0.05):
    good = d[np.isfinite(d) & (d != 0)]          # percentiles sur les seuls pixels observés
    lo, hi = np.percentile(good, lo_pct), np.percentile(good, hi_pct)
    v = np.clip((np.nan_to_num(d, nan=lo) - lo) / max(hi - lo, 1e-12), 0, 1)
    return np.arcsinh(v / soft) / np.arcsinh(1 / soft)

def seip_meta(h, files, bands, extra=()):
    pix = abs(float(h.get("CD1_1", h.get("CDELT1", 0)))) * 3600
    meta = [["Archive", "IRSA (Caltech/IPAC), Spitzer Enhanced Imaging Products"], ["Instrument", h.get("INSTRUME", "")], ["Bandes", bands],
            ["Échelle", fr(pix, 2) + "″ par pixel"], *[list(x) for x in extra], ["Fichier d'origine", files]]
    return meta

def spitzer_irac(key):
    from PIL import Image
    ra, dec, size = 202.4696, 47.1952, 10
    chans = []
    for b in ("IRAC4", "IRAC2", "IRAC1"):   # rouge 8,0 µm, vert 4,5 µm, bleu 3,6 µm
        d, h, f, obs = seip_cutout(ra, dec, b, size); chans.append((d, h, f))
    shp = min(c[0].shape[0] for c in chans), min(c[0].shape[1] for c in chans)
    rgb = np.stack([np.asarray(Image.fromarray(asinh_stretch(c[0]).astype(np.float32)).resize((shp[1], shp[0]))) for c in chans], -1)
    im = Image.fromarray((np.flipud(np.clip(rgb, 0, 1)) * 255).astype(np.uint8), "RGB")
    if max(im.size) > 1100: im.thumbnail((1100, 1100))
    fname = key.replace("/", "-") + ".jpg"; im.save(os.path.join(OUT, fname), "JPEG", quality=86, optimize=True)
    meta = seip_meta(chans[0][1], ", ".join(c[2] for c in chans), "8,0 µm en rouge, 4,5 µm en vert, 3,6 µm en bleu",
                     extra=[["Cible", "M51, galaxie du Tourbillon"], ["Champ", fr(size) + "′ de côté"], ["Traitement", "découpes des mosaïques SEIP, étirement asinh par bande, superposées pour le site"]])
    return dict(type="image", file=fname, width=im.size[0], height=im.size[1], title="La galaxie du Tourbillon (M51), IRAC", meta=meta,
                url="https://irsa.ipac.caltech.edu/data/SPITZER/Enhanced/SEIP/overview.html",
                caption="En rouge, la lueur à 8 µm de la poussière et des grosses molécules (hydrocarbures aromatiques) chauffées par les étoiles jeunes : elle dessine les bras spiraux. En bleu et vert, à 3,6 et 4,5 µm, la lumière des étoiles anciennes.",
                credit="NASA, JPL-Caltech, IRSA", fetched=TODAY)

def spitzer_mips(key):
    from PIL import Image
    ra, dec, size = 202.4696, 47.1952, 10
    d, h, f, obs = seip_cutout(ra, dec, "MIPS24", size)
    im = Image.fromarray((np.flipud(asinh_stretch(d, 2, 99.8, 0.03)) * 255).astype(np.uint8), "L")
    if max(im.size) > 1100: im.thumbnail((1100, 1100))
    fname = key.replace("/", "-") + ".jpg"; im.save(os.path.join(OUT, fname), "JPEG", quality=86, optimize=True)
    meta = seip_meta(h, f, "24 µm", extra=[["Cible", "M51, galaxie du Tourbillon"], ["Champ", fr(size) + "′ de côté"], ["Traitement", "découpe de la mosaïque SEIP, étirement asinh pour le site"]])
    return dict(type="image", file=fname, width=im.size[0], height=im.size[1], title="La galaxie du Tourbillon (M51), MIPS 24 µm", meta=meta,
                url="https://irsa.ipac.caltech.edu/data/SPITZER/Enhanced/SEIP/overview.html",
                caption="À 24 µm, MIPS voit la poussière tiède des régions où naissent les étoiles, en grumeaux le long des bras, et le noyau de la galaxie. Les images sont moins nettes qu'à 8 µm : la tache de diffraction grandit avec la longueur d'onde.",
                credit="NASA, JPL-Caltech, IRSA", fetched=TODAY)

# ---------- Fermi : catalogues du HEASARC (4FGL-DR4, sursauts du GBM) ----------
def heasarc_tap(adql):
    import pyvo
    return pyvo.dal.TAPService(CDA_TAP).search(adql, maxrec=20000).to_table()

def fermi_lat(key):
    t = heasarc_tap("SELECT lii, bii FROM fermilpsc")
    l = np.array(t["lii"], float); b = np.array(t["bii"], float); l = np.where(l > 180, l - 360, l)
    fname = key.replace("/", "-") + ".json"
    save_json(fname, dict(type="scatter", x=[round(float(v), 2) for v in l], y=[round(float(v), 2) for v in b], ymin=-90, ymax=90,
                          xlabel="longitude galactique (°), centre de la Galaxie au milieu", ylabel="latitude galactique (°)"))
    meta = [["Archive", "HEASARC (NASA), table fermilpsc"], ["Catalogue", "4FGL-DR4, 14 ans de données du LAT"], ["Sources", fr(len(t))], ["Points", fr(len(t)) + " tracés"]]
    return dict(type="plot", file=fname, title="Les sources gamma du catalogue 4FGL-DR4", meta=meta, url="https://heasarc.gsfc.nasa.gov/W3Browse/fermi/fermilpsc.html",
                caption="Chaque point est une source détectée par le LAT en 14 ans, sur une carte du ciel en coordonnées galactiques. La bande horizontale est le plan de notre Galaxie : pulsars et restes de supernovae. Ailleurs, la plupart des sources sont des noyaux actifs de galaxies lointaines, dont le jet pointe vers nous.",
                credit="NASA, DOE, collaboration Fermi-LAT", fetched=TODAY)

def fermi_gbm(key):
    t = heasarc_tap("SELECT t90 FROM fermigbrst")
    v = np.array(t["t90"], float); v = v[np.isfinite(v) & (v > 0)]
    lg = np.log10(v); edges = np.arange(-2.0, 3.01, 0.1); n, _ = np.histogram(lg, edges)
    fname = key.replace("/", "-") + ".json"
    save_json(fname, dict(type="hist", x=[round(float(c), 2) for c in (edges[:-1] + 0.05)], y=[int(c) for c in n], binw=0.1,
                          xlabel="durée T90, en puissance de dix de secondes (0 = 1 s, 1 = 10 s, 2 = 100 s)", ylabel="nombre de sursauts"))
    short = int((v < 2).sum())
    meta = [["Archive", "HEASARC (NASA), table fermigbrst"], ["Catalogue", "sursauts gamma du GBM"], ["Sursauts", fr(len(v)) + " dont " + fr(short) + " de moins de 2 s"],
            ["Données", "T90 : durée pendant laquelle arrivent 90 % des photons du sursaut"], ["Points", fr(len(n)) + " intervalles de 0,1 en puissance de dix"]]
    return dict(type="plot", file=fname, title="Durée des sursauts gamma vus par le GBM", meta=meta, url="https://heasarc.gsfc.nasa.gov/W3Browse/fermi/fermigbrst.html",
                caption="Deux familles se dessinent. Les sursauts longs, de plus de 2 s environ, accompagnent l'effondrement d'étoiles massives. Les courts viennent de la fusion d'étoiles à neutrons, comme celui détecté avec les ondes gravitationnelles de GW170817.",
                credit="NASA, collaboration Fermi-GBM", fetched=TODAY)

# ---------- TESS : courbe de lumière SPOC à 2 min (MAST) ----------
def tess_lc(key, tic="100100827", name="WASP-18"):
    from astroquery.mast import Observations
    from astropy.io import fits
    obs = Observations.query_criteria(obs_collection="TESS", target_name=tic, dataproduct_type="timeseries")
    if len(obs) == 0:
        raise RuntimeError("aucune série temporelle TESS pour TIC " + tic)
    obs.sort("t_min")
    for row in obs[:6]:
        prods = Observations.get_product_list(row)
        lc = prods[[str(x).endswith("_lc.fits") for x in prods["productFilename"]]]
        if len(lc) == 0:
            continue
        p = lc[0]; local = os.path.join(TMP, str(p["productFilename"]))
        if Observations.download_file(p["dataURI"], local_path=local)[0] != "COMPLETE":
            continue
        with fits.open(local) as hd:
            d = hd[1].data; h0 = hd[0].header
            t = np.array(d["TIME"], float); f = np.array(d["PDCSAP_FLUX"], float); q = np.array(d["QUALITY"])
        ok = np.isfinite(t) & np.isfinite(f) & (q == 0)
        t, f = t[ok], f[ok] / np.nanmedian(f[ok])
        n = len(t) // 5 * 5                                   # moyenne par paquets de 5 points de 2 min (10 min)
        tb = t[:n].reshape(-1, 5).mean(1); fb = f[:n].reshape(-1, 5).mean(1)
        fname = key.replace("/", "-").replace(":", "-") + ".json"
        save_json(fname, dict(type="line", x=rnd(tb - tb[0], 5), y=rnd(fb, 6), xlabel="temps depuis le début du secteur (jours)", ylabel="flux relatif"))
        sector = h0.get("SECTOR"); cam = h0.get("CAMERA"); ccd = h0.get("CCD")
        meta = [["Archive", "MAST (STScI)"], ["Instrument", "caméra " + str(cam) + ", CCD " + str(ccd)], ["Cible", name + " (TIC " + tic + ")"],
                ["Secteur", str(sector)], ["Début d'observation", mjd_to_date(row["t_min"]) or ""], ["Données", "PDCSAP_FLUX du pipeline SPOC, cadence de 2 min, points de qualité 0"],
                ["Traitement", "division par la médiane, moyenne par paquets de 5 points (10 min)"], ["Points", fr(len(t)) + " dans le fichier, " + fr(len(tb)) + " tracés (moyenne par paquets)"],
                ["Fichier d'origine", str(p["productFilename"])]]
        return dict(type="plot", file=fname, title="Les transits de la planète WASP-18 b, vus par TESS", meta=meta,
                    url="https://archive.stsci.edu/missions-and-data/tess",
                    caption="Chaque creux est le passage de la planète géante WASP-18 b devant son étoile, qui perd alors environ 1 % de son éclat. Le trou au milieu correspond au passage au périgée, quand TESS transmet ses données.",
                    credit="NASA, MIT, STScI", fetched=TODAY)
    raise RuntimeError("aucune courbe de lumière téléchargée")

def kepler_lc(key, kic="010666592", name="HAT-P-7", quarter=4):
    """Courbe de lumière longue cadence (29,4 min) d'un trimestre de Kepler, pipeline SOC (PDCSAP_FLUX)."""
    from astroquery.mast import Observations
    from astropy.io import fits
    obs = Observations.query_criteria(obs_collection="Kepler", target_name="kplr" + kic, dataproduct_type="timeseries")
    if len(obs) == 0:
        raise RuntimeError("aucune série temporelle Kepler pour KIC " + kic)
    prods = Observations.get_product_list(obs)
    llc = prods[[str(x).endswith("_llc.fits") for x in prods["productFilename"]]]
    llc.sort("productFilename")
    if len(llc) == 0:
        raise RuntimeError("aucun fichier _llc.fits")
    for p in list(llc[quarter:]) + list(llc[:quarter]):
        local = os.path.join(TMP, str(p["productFilename"]))
        if Observations.download_file(p["dataURI"], local_path=local)[0] != "COMPLETE":
            continue
        with fits.open(local) as hd:
            d = hd[1].data; h0 = hd[0].header
            t = np.array(d["TIME"], float); f = np.array(d["PDCSAP_FLUX"], float); q = np.array(d["SAP_QUALITY"])
        ok = np.isfinite(t) & np.isfinite(f) & (q == 0)
        if ok.sum() < 1000:
            continue
        t, f = t[ok], f[ok] / np.nanmedian(f[ok])
        fname = key.replace("/", "-").replace(":", "-") + ".json"
        save_json(fname, dict(type="line", x=rnd(t - t[0], 5), y=rnd(f, 6), xlabel="temps depuis le début du trimestre (jours)", ylabel="flux relatif"))
        meta = [["Archive", "MAST (STScI)"], ["Instrument", "photomètre, module " + str(h0.get("MODULE")) + ", sortie " + str(h0.get("OUTPUT"))], ["Cible", name + " (KIC " + kic.lstrip("0") + ")"],
                ["Trimestre", "Q" + str(h0.get("QUARTER"))], ["Données", "PDCSAP_FLUX du pipeline SOC, longue cadence (29,4 min), points de qualité 0"],
                ["Traitement", "division par la médiane, aucun lissage"], ["Points", fr(len(t)) + " tracés"], ["Fichier d'origine", str(p["productFilename"])]]
        return dict(type="plot", file=fname, title="Les transits de la planète HAT-P-7 b, vus par Kepler", meta=meta,
                    url="https://archive.stsci.edu/missions-and-data/kepler",
                    caption="Chaque creux est le passage de la planète géante HAT-P-7 b devant son étoile, tous les 2,2 jours ; l'étoile perd alors environ 0,7 % de son éclat. Les trous correspondent aux arrêts mensuels pour transmettre les données.",
                    credit="NASA, Ames, STScI", fetched=TODAY)
    raise RuntimeError("aucune courbe de lumière Kepler téléchargée")

# ---------- XMM-Newton : produits du pipeline (PPS) sur le miroir HEASARC de l'archive XMM ----------
XMM_PPS = "https://heasarc.gsfc.nasa.gov/FTP/xmm/data/rev0/{o}/PPS/"
XMM_XSA = "https://nxsa.esac.esa.int/nxsa-web/#obsid={o}"

def xmm_files(obsid):
    import re
    u = XMM_PPS.format(o=obsid)
    r = requests.get(u, timeout=60); r.raise_for_status()
    return u, re.findall(r'href="([^"?/][^"]*)"', r.text)

def xmm_meta(h, obsid, inst, files, extra=()):
    meta = [["Archive", "XMM-Newton Science Archive (ESA), miroir du HEASARC"], ["Instrument", inst], ["Identifiant d'observation", "ObsID " + obsid],
            ["Cible", clean(h.get("OBJECT")) or "cible non nommée"], ["Début d'observation", str(h.get("DATE-OBS"))[:10]]]
    meta += [list(x) for x in extra]
    meta.append(["Fichier d'origine", files])
    return meta

def xmm_epic(key, obsid="0412180101", ra=350.8500, dec=58.8150, size_arcmin=10.0):
    """Cas A en trois couleurs : images PPS par bande d'énergie, pn + MOS1 + MOS2 additionnées."""
    from PIL import Image
    from astropy.wcs import WCS
    u, fs = xmm_files(obsid)
    bands = {"R": ("2",), "G": ("3",), "B": ("4", "5")}       # 0,5–1 keV, 1–2 keV, 2–12 keV
    used, chans, h0, expo = [], {}, None, 0.0
    for col, bs in bands.items():
        acc = None
        for f in fs:
            m = f[11:14]
            if m in ("PNS", "M1S", "M2S") and f.endswith(".FTZ") and any(f.endswith("IMAGE_" + b + "000.FTZ") for b in bs):
                with cda_fits(u + f) as hd:
                    h = hd[0].header; d = np.nan_to_num(np.asarray(hd[0].data, float))
                w = WCS(h); x, y = w.all_world2pix([[ra, dec]], 0)[0]
                half = int(round(size_arcmin / 60 / abs(float(h["CDELT1"])) / 2))
                cut = d[max(0, int(y) - half):int(y) + half, max(0, int(x) - half):int(x) + half]
                if cut.shape != (2 * half, 2 * half):
                    continue
                acc = cut if acc is None else acc + cut
                used.append(f)
                if h0 is None or m == "PNS": h0 = h
                if col == "G" and m == "PNS": expo = float(h.get("EXPOSURE", 0))
        if acc is None:
            raise RuntimeError("pas d'image pour la bande " + col)
        chans[col] = acc
    def st(c):
        hi = np.percentile(c[c > 0], 99.8) if np.any(c > 0) else 1
        return np.log1p(np.clip(c, 0, hi) / (hi / 60.0)) / np.log1p(60.0)
    rgb = np.stack([st(chans[k]) for k in "RGB"], -1)
    im = Image.fromarray((np.flipud(rgb) * 255).astype(np.uint8), "RGB").resize((600, 600), Image.LANCZOS)
    fname = key.replace("/", "-") + ".jpg"; im.save(os.path.join(OUT, fname), "JPEG", quality=88, optimize=True)
    pix = abs(float(h0["CDELT1"])) * 3600
    meta = xmm_meta(h0, obsid, "EPIC (caméras pn, MOS1 et MOS2)", ", ".join(sorted(set(used))),
                    extra=[["Bandes", "0,5–1 keV en rouge, 1–2 keV en vert, 2–12 keV en bleu"], ["Échelle", fr(pix, 1) + "″ par pixel, " + fr(size_arcmin) + "′ de côté"],
                           ["Temps de pose (pn)", fr(expo) + " s"], ["Traitement", "images PPS des trois caméras additionnées par bande, étirement logarithmique, agrandies ×" + fr(600 / rgb.shape[0], 1) + " pour le site"]])
    return dict(type="image", file=fname, width=600, height=600, title="Le reste de supernova Cassiopée A, EPIC", meta=meta, url=XMM_XSA.format(o=obsid),
                caption="Cassiopée A vue par les trois caméras EPIC. Les couleurs codent l'énergie des photons X : en rouge les plus faibles, en bleu les plus énergétiques. Les pixels de 4″ rendent l'image moins nette que celle de Chandra, mais XMM-Newton collecte beaucoup plus de photons. Les lignes sombres sont les espaces entre les CCD des caméras.",
                credit="ESA, XMM-Newton", fetched=TODAY)

def xmm_rgs(key, obsid="0510780601"):
    """Spectre « fluxed » des deux RGS (premier ordre) de Capella, produit du pipeline."""
    u, fs = xmm_files(obsid)
    f = [x for x in fs if "RGX000FLUXED" in x and x.endswith(".FTZ")]
    if not f:
        raise RuntimeError("pas de spectre FLUXED")
    with cda_fits(u + f[0]) as hd:
        d = hd["FLUXED"].data; w = np.asarray(d["CHANNEL"], float); fl = np.asarray(d["FLUX"], float)
    src = [x for x in fs if x[11:14] == "R1S" and "SRSPEC1" in x and x.endswith(".FTZ")]
    h = {}
    if src:
        with cda_fits(u + src[0]) as hd:
            h = dict(hd[0].header); h.update({k: v for k, v in hd[1].header.items() if k in ("EXPOSURE",)})
    ok = np.isfinite(fl) & (w >= 6) & (w <= 38); w, fl = w[ok], fl[ok]
    fname = key.replace("/", "-") + ".json"
    save_json(fname, dict(type="line", x=rnd(w, 5), y=rnd(fl, 4), ymin=0, xlabel="longueur d'onde (Å)", ylabel="flux (photons/s/cm²/Å)"))
    meta = xmm_meta(h, obsid, "RGS1 et RGS2, premier ordre", f[0], extra=[["Données", "spectre « fluxed » du pipeline (rgsfluxer), 1 000 intervalles de 0,036 Å, de 6 à 38 Å tracés"],
                                                                         ["Temps de pose", (fr(float(h["EXPOSURE"])) + " s") if h.get("EXPOSURE") else "non indiqué"]])
    return dict(type="plot", file=fname, title="Spectre RGS de l'étoile Capella", meta=meta, url=XMM_XSA.format(o=obsid),
                caption="La couronne de Capella, à plusieurs millions de degrés, émet des raies X : chaque pic est un élément chimique ionisé (fer, oxygène, néon…). Le RGS les sépare finement, entre 6 et 38 Å.",
                credit="ESA, XMM-Newton", fetched=TODAY)

def xmm_om(key, obsid="0104260101", ra=210.8023, dec=54.3489, size_arcmin=12.0, filt="UVW1"):
    """Image du moniteur optique (pose la plus longue dans le filtre demandé), découpée autour de la galaxie."""
    from PIL import Image
    from astropy.wcs import WCS
    u, fs = xmm_files(obsid)
    best = None
    for f in fs:
        if f[11:14] == "OMS" and "SIMAGE" in f and f.endswith(".FTZ"):
            with cda_fits(u + f) as hd:
                h = hd[0].header
                if str(h.get("FILTER")).strip() != filt: continue
                d = np.asarray(hd[0].data, float); ex = np.asarray(hd["EXPOSURE"].data, float) if "EXPOSURE" in hd else None
            w = WCS(h); x, y = w.all_world2pix([[ra, dec]], 0)[0]
            if not (0 <= x < d.shape[1] and 0 <= y < d.shape[0]): continue
            score = float(np.nanmax(ex)) if ex is not None else 0
            if best is None or score > best[0]: best = (score, d, h, f, x, y)
    if best is None:
        raise RuntimeError("aucune image OM " + filt + " sur la cible")
    score, d, h, f, x, y = best
    half = int(round(size_arcmin / 60 / abs(float(h["CDELT1"])) / 2))
    cut = d[max(0, int(y) - half):int(y) + half, max(0, int(x) - half):int(x) + half]
    im = Image.fromarray((np.flipud(asinh_stretch(cut, 5, 99.7, 0.04)) * 255).astype(np.uint8), "L")
    if max(im.size) > 1100: im.thumbnail((1100, 1100))
    fname = key.replace("/", "-") + ".jpg"; im.save(os.path.join(OUT, fname), "JPEG", quality=86, optimize=True)
    pix = abs(float(h["CDELT1"])) * 3600
    meta = xmm_meta(h, obsid, "OM, filtre " + filt + " (≈ 291 nm)", f, extra=[["Cible", "M101, galaxie du Moulinet"], ["Échelle", fr(pix, 2) + "″ par pixel, " + fr(cut.shape[1] * pix / 60, 1) + "′ de côté"],
                                                                              ["Temps de pose", "≈ " + fr(score) + " s"], ["Traitement", "image du ciel du pipeline, découpée, étirement asinh pour le site"]])
    return dict(type="image", file=fname, width=im.size[0], height=im.size[1], title="La galaxie du Moulinet (M101), OM en ultraviolet", meta=meta, url=XMM_XSA.format(o=obsid),
                caption="Une seule pose de l'OM, dont le champ forme le carré incliné, découpée autour du centre de M101. Dans l'ultraviolet proche (filtre UVW1), les taches claires sont des régions où naissent des étoiles jeunes et chaudes, le long des bras.",
                credit="ESA, XMM-Newton", fetched=TODAY)

# ---------- Swift, INTEGRAL, Compton : catalogues du HEASARC, cartes du ciel en coordonnées galactiques ----------
def sky_scatter(key, table, where, title, caption, credit, what, extra_meta=()):
    t = heasarc_tap("SELECT lii, bii FROM " + table + ((" WHERE " + where) if where else ""))
    l = np.array(t["lii"], float); b = np.array(t["bii"], float); ok = np.isfinite(l) & np.isfinite(b); l, b = l[ok], b[ok]; l = np.where(l > 180, l - 360, l)
    fname = key.replace("/", "-") + ".json"
    save_json(fname, dict(type="scatter", x=[round(float(v), 2) for v in l], y=[round(float(v), 2) for v in b], ymin=-90, ymax=90,
                          xlabel="longitude galactique (°), centre de la Galaxie au milieu", ylabel="latitude galactique (°)"))
    meta = [["Archive", "HEASARC (NASA), table " + table], ["Catalogue", what], ["Sources", fr(len(l))]] + list(extra_meta) + [["Points", fr(len(l)) + " tracés"]]
    return dict(type="plot", file=fname, title=title, meta=meta, url="https://heasarc.gsfc.nasa.gov/W3Browse/all/" + table + ".html", caption=caption, credit=credit, fetched=TODAY)

def swift_bat(key):
    return sky_scatter(key, "swbat157m", "", "Le ciel en rayons X durs, relevé de BAT sur 157 mois",
        "Chaque point est une source détectée par BAT entre 15 et 150 keV pendant les 157 premiers mois de Swift. Le long du plan de la Galaxie, des étoiles binaires où un trou noir ou une étoile à neutrons dévore sa compagne ; partout ailleurs, surtout des noyaux actifs de galaxies.",
        "NASA, équipe de Swift-BAT", "relevé de BAT sur 157 mois")

def swift_xrt(key):
    t = heasarc_tap("SELECT bat_t90 FROM swiftgrb WHERE bat_t90 > 0")
    v = np.array(t["bat_t90"], float); v = v[np.isfinite(v) & (v > 0)]
    lg = np.log10(v); edges = np.arange(-2.0, 3.51, 0.1); n, _ = np.histogram(lg, edges)
    fname = key.replace("/", "-") + ".json"
    save_json(fname, dict(type="hist", x=[round(float(c), 2) for c in (edges[:-1] + 0.05)], y=[int(c) for c in n], binw=0.1,
                          xlabel="durée T90, en puissance de dix de secondes (0 = 1 s, 1 = 10 s, 2 = 100 s)", ylabel="nombre de sursauts"))
    meta = [["Archive", "HEASARC (NASA), table swiftgrb"], ["Catalogue", "sursauts gamma de Swift"], ["Sursauts", fr(len(v)) + " avec une durée mesurée par BAT"],
            ["Données", "T90 : durée pendant laquelle arrivent 90 % des photons, entre 15 et 150 keV"], ["Points", fr(len(n)) + " intervalles de 0,1 en puissance de dix"]]
    return dict(type="plot", file=fname, title="Durée des sursauts détectés par Swift, que le XRT est allé observer", meta=meta, url="https://heasarc.gsfc.nasa.gov/W3Browse/swift/swiftgrb.html",
                caption="Chaque sursaut détecté par BAT a déclenché le pivotement de Swift et l'observation de sa lueur rémanente par le XRT. Comme pour Fermi, deux familles apparaissent ; les sursauts courts sont moins nombreux ici, car BAT, aux énergies plus basses, les voit moins bien.",
                credit="NASA, équipe de Swift", fetched=TODAY)

def integral_ibis(key):
    return sky_scatter(key, "intrefcat", "isgri_flag > 0", "Les sources vues par ISGRI, sur IBIS",
        "Les sources du catalogue de référence d'INTEGRAL détectées par ISGRI, l'étage à basse énergie d'IBIS. Elles se concentrent dans le plan de la Galaxie et vers son centre, où INTEGRAL a beaucoup observé : binaires X, restes de supernovae, et de nombreuses sources découvertes par INTEGRAL lui-même (« IGR »).",
        "ESA, ISDC, HEASARC", "catalogue de référence d'INTEGRAL, sources détectées par ISGRI")

def cgro_batse(key):
    return sky_scatter(key, "batsegrb", "", "Les sursauts gamma de BATSE sur le ciel",
        "Chaque point est un sursaut gamma détecté par BATSE, en coordonnées galactiques. Ils sont répartis uniformément, sans se concentrer dans le plan de la Galaxie : la preuve qu'ils viennent de bien au-delà, de galaxies lointaines.",
        "NASA, équipe de BATSE", "catalogue des sursauts de BATSE")

# ---------- WMAP et Planck : cartes HEALPix du ciel entier, projetées en Mollweide (coordonnées galactiques) ----------
def healpix_map(key, urls, name, title, caption, credit, page, scale=1e6, unit="µK", lim=None):
    """Télécharge la première carte HEALPix disponible, la dégrade à nside 256 et la projette en Mollweide, couleurs divergentes."""
    import healpy as hp
    from astropy.io import fits
    from PIL import Image
    local = None
    for u in urls:
        try:
            local = os.path.join(TMP, u.split("/")[-1])
            if not os.path.exists(local):
                r = requests.get(u, timeout=1200, stream=True); r.raise_for_status()
                with open(local, "wb") as fh:
                    for ch in r.iter_content(1 << 20): fh.write(ch)
            src = u; break
        except Exception as e:
            print("   échec", u, repr(e)[:150]); local = None
    if not local:
        raise RuntimeError("aucune carte téléchargée")
    m = hp.read_map(local, field=0, verbose=False) if "verbose" in hp.read_map.__code__.co_varnames else hp.read_map(local, field=0)
    nside0 = hp.get_nside(m); m = hp.ud_grade(m, 256)
    W, H = 1200, 600
    y, x = np.mgrid[0:H, 0:W]; X = (x + 0.5) / W * 4 - 2; Y = 1 - (y + 0.5) / H * 2            # Mollweide : x ∈ [−2, 2], y ∈ [−1, 1]
    ok = X**2 / 4 + Y**2 <= 1
    th = np.arcsin(np.clip(Y, -1, 1)); lat = np.arcsin(np.clip((2 * th + np.sin(2 * th)) / np.pi, -1, 1))
    lon = np.pi * X / (2 * np.cos(th) + 1e-12)                                                        # longitude, centre de la Galaxie au milieu, croissante vers la gauche
    ok &= np.abs(lon) <= np.pi
    pix = hp.ang2pix(256, np.pi / 2 - lat[ok], (-lon[ok]) % (2 * np.pi))
    v = m[pix] * scale; v[~np.isfinite(v)] = 0
    L = lim or float(np.percentile(np.abs(v), 99))
    t = np.clip(v / L, -1, 1)
    def cmap(t):  # bleu – blanc – rouge
        r = np.where(t < 0, 1 + t * 0.85, 1.0); g = 1 - np.abs(t) * 0.8; b = np.where(t > 0, 1 - t * 0.85, 1.0); return np.stack([r, g, b], -1)
    img = np.full((H, W, 3), 255, np.uint8); img[ok] = (cmap(t) * 255).astype(np.uint8)
    im = Image.fromarray(img, "RGB")
    fname = key.replace("/", "-") + ".jpg"; im.save(os.path.join(OUT, fname), "JPEG", quality=86, optimize=True)
    meta = [["Archive", page], ["Carte", src.split("/")[-1]], ["Résolution d'origine", "HEALPix nside " + str(nside0) + ", dégradée à 256 pour le site"],
            ["Projection", "Mollweide, coordonnées galactiques, centre de la Galaxie au milieu"], ["Couleurs", "bleu : plus froid, rouge : plus chaud ; échelle ± " + fr(L) + " " + unit]]
    return dict(type="image", file=fname, width=W, height=H, title=title, meta=meta, url=src, caption=caption, credit=credit, fetched=TODAY)

def wmap_rad(key):
    return healpix_map(key, ["https://lambda.gsfc.nasa.gov/data/map/dr5/dfp/ilc/wmap_ilc_9yr_v5.fits"], "WMAP",
        "Le fond diffus cosmologique, carte ILC de WMAP (neuf ans)",
        "Les variations de température du rayonnement émis 380 000 ans après le Big Bang, de l'ordre de cent millionièmes de degré. Cette carte combine les cinq bandes de WMAP pour retirer au mieux l'émission de la Galaxie ; il en reste des traces le long de son plan, au milieu.",
        "NASA, équipe scientifique de WMAP", "LAMBDA (NASA Goddard)", scale=1e3, unit="µK")

def planck_hfi(key):
    base = "https://irsa.ipac.caltech.edu/data/Planck/release_3/all-sky-maps/maps/component-maps/cmb/"
    return healpix_map(key, [base + "COM_CMB_IQU-smica_2048_R3.00_full.fits", base + "COM_CMB_IQU-commander_2048_R3.00_full.fits"], "Planck",
        "Le fond diffus cosmologique, carte SMICA de Planck (2018)",
        "Les mêmes variations de température que sur la carte de WMAP, mais avec une résolution trois fois meilleure, grâce aux bolomètres de HFI. Le long du plan de la Galaxie, où son émission ne peut être retirée parfaitement, il en reste quelques traces au milieu de la carte.",
        "ESA, collaboration Planck", "IRSA (NASA/IPAC), Planck Legacy Archive", scale=1e6, unit="µK")

LMC_ASTRO = (80.489, -69.499)  # champ d'étalonnage astrométrique de JWST dans le Grand Nuage de Magellan
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
    "hubble/fgs": hubble_fgs,
    "jwst/fgs": lambda k: mast_image(k, "JWST", ["FGS/FGS1", "FGS/FGS2"], *LMC_ASTRO, radius=3, extra=dict(obs_id="jw01086-o001_t001_fgs_clear"), name="Champ d'étalonnage du Grand Nuage de Magellan", expect="LMC",
                                    about="Le champ d'étoiles du Grand Nuage de Magellan qui sert à étalonner la géométrie des instruments de JWST."),
    "euclid/vis": euclid_vis, "euclid/nisp": euclid_nisp,
    "gaia/astro": gaia_astro, "gaia/bprp": gaia_bprp, "gaia/rvs": gaia_rvs,
    # produits supplémentaires d'un même instrument : clé « observatoire/instrument:nom »
    "euclid/vis:image": euclid_vis_image, "euclid/nisp:image": euclid_nisp_image, "euclid/nisp:spectre": euclid_spectrum,
    "gaia/bprp:spectre": gaia_xp_spectrum, "gaia/rvs:spectre": gaia_rvs_spectrum,
    "tess/cams": tess_lc,
    "kepler/phot": kepler_lc,
    "xmm/epic": xmm_epic,
    "xmm/rgs": xmm_rgs,
    "xmm/om": xmm_om,
    "wmap/rad": wmap_rad, "planck/hfi": planck_hfi,
    "swift/bat": swift_bat, "swift/xrt": swift_xrt, "integral/ibis": integral_ibis, "cgro/batse": cgro_batse,
    "spitzer/irac": spitzer_irac, "spitzer/mips": spitzer_mips, "fermi/lat": fermi_lat, "fermi/gbm": fermi_gbm,
    "chandra/acis": lambda k: chandra_image(k, [114], "Cassiopée A", CAS_A),
    "chandra/hrc": chandra_hrc,
    "chandra/hetg:spectre": lambda k: chandra_grating(k, 1318, 2, 2, 25, 4, "Spectre HETG de l'étoile Capella",
                                                      CAPELLA + " Chaque pic est une raie d'émission ; leur finesse permet de mesurer température et densité du gaz."),
    "chandra/letg:spectre": lambda k: chandra_grating(k, 1248, 3, 5, 175, 8, "Spectre LETG de l'étoile Capella",
                                                      CAPELLA + " Le réseau LETG, lu par la caméra HRC-S, couvre les grandes longueurs d'onde, jusqu'aux rayons X les moins énergétiques."),
}

def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    mpath = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(mpath, encoding="utf-8")) if os.path.exists(mpath) else {}
    args = sys.argv[1:]
    # sans argument : seulement les recettes absentes du manifeste, pour que le site ne change pas tout seul ; « all » refait tout
    # les produits Euclid encore tirés de Q1 sont refaits tant que DR1 n'a pas pu être lu (IRSA saturé à la sortie de DR1)
    stale = lambda k: k.startswith("euclid/") and "q1" in json.dumps(manifest.get(k, {})).lower()
    todo = list(RECIPES) if args == ["all"] else (args or [k for k in RECIPES if k not in manifest or stale(k)])
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
