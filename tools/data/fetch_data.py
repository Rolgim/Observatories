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

# ---------------------------------------------------------------- Euclid : images et spectre (IRSA, données Q1 publiques)
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
    for label, ra, dec in (("la nébuleuse de l'Œil de chat (NGC 6543)", 269.6392, 66.6331), ("un champ du Euclid Deep Field Fornax", 52.93, -28.09)):
        try:
            coord = SkyCoord(ra, dec, unit="deg")
            tab = Irsa.query_sia(pos=(coord, 5 * u.arcsec), collection="euclid_DpdMerBksMosaic")
            print("   SIA :", len(tab), "lignes ; colonnes :", tab.colnames[:40])
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
                    print("   découpe", b, cut[b].shape, str(r["access_url"]).split("/")[-1])
                    cut[b + "_file"] = str(r["access_url"]).split("/")[-1]
            if "VIS" in cut:
                _emos["cut"] = (label, ra, dec, size_arcmin, cut)
                return _emos["cut"]
        except Exception as e:
            last = e
            print("   échec sur", label, ":", repr(e))
    raise RuntimeError(f"aucune mosaïque Euclid accessible ({last!r})")

def euclid_img_meta(ra, dec, size, files):
    return [["Archive", "NASA/IPAC IRSA, miroir des données Euclid"], ["Publication", "Quick Release Q1, mosaïques MER"], ["Centre de la découpe", f"{fr(ra, 4)}° ; {fr(dec, 4)}°".replace("-", "−")],
            ["Champ", f"{fr(size, 0)}′ × {fr(size, 0)}′"], ["Fichiers d'origine", " · ".join(files)], ["Traitement", "découpe, étirement asinh, réduction pour le site"]]

def euclid_vis_image(key):
    from PIL import Image
    label, ra, dec, size, cut = euclid_cutouts()
    im = Image.fromarray((stretch(cut["VIS"]) * 255).astype("uint8")); im.thumbnail((1100, 1100))
    im.save(os.path.join(OUT, "euclid-vis-image.jpg"), "JPEG", quality=86, optimize=True)
    return dict(type="image", file="euclid-vis-image.jpg", width=im.size[0], height=im.size[1], title="VIS : " + label, meta=euclid_img_meta(ra, dec, size, [cut["VIS_file"]]), url="https://irsa.ipac.caltech.edu/data/Euclid/docs/overview_q1.html",
                caption="Découpe d'une mosaïque VIS, bande I_E, à 0,1″ par pixel avant réduction.", credit="ESA/Euclid/Euclid Consortium/NASA", fetched=TODAY)

def euclid_nisp_image(key):
    from PIL import Image
    label, ra, dec, size, cut = euclid_cutouts()
    if not all(b in cut for b in ("Y", "J", "H")):
        raise RuntimeError("bandes NISP manquantes : " + str(sorted(k for k in cut if len(k) == 1)))
    rgb = np.dstack([stretch(cut["H"]), stretch(cut["J"]), stretch(cut["Y"])])
    im = Image.fromarray((rgb * 255).astype("uint8")); im.thumbnail((1100, 1100))
    im.save(os.path.join(OUT, "euclid-nisp-image.jpg"), "JPEG", quality=86, optimize=True)
    return dict(type="image", file="euclid-nisp-image.jpg", width=im.size[0], height=im.size[1], title="NISP : " + label + ", bandes Y, J et H", meta=euclid_img_meta(ra, dec, size, [cut[b + "_file"] for b in "YJH"]), url="https://irsa.ipac.caltech.edu/data/Euclid/docs/overview_q1.html",
                caption="Composition colorée des trois bandes de NISP : H en rouge, J en vert, Y en bleu. Chaque bande est étirée séparément, les couleurs sont donc indicatives.", credit="ESA/Euclid/Euclid Consortium/NASA", fetched=TODAY)

def euclid_spectrum(key):
    from astroquery.ipac.irsa import Irsa
    from astropy.io import fits
    from astropy.table import Table
    res = Irsa.query_tap("SELECT TOP 60 * FROM euclid.objectid_spectrafile_association_q1 WHERE hdu IS NOT NULL AND hdu > 0 AND hdu < 40").to_table()
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
                for b in ("https://irsa.ipac.caltech.edu/ibe/data/", "https://irsa.ipac.caltech.edu/data/", "https://nasa-irsa-euclid-q1.s3.us-east-1.amazonaws.com/", "https://irsa.ipac.caltech.edu/"):
                    for q in (pth, pth.replace("euclid/q1/", "q1/", 1), pth.replace("euclid/", "", 1)):
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
    meta = [["Archive", "NASA/IPAC IRSA, miroir des données Euclid"], ["Publication", "Quick Release Q1, spectres 1D combinés (SIR)"], ["Identifiant Euclid de la source", str(r["objectid"])],
            ["Grisme", "rouge (RG)"],
            ["Fichier d'origine", url.split("/")[-1] + ", extension " + str(r["hdu"])], ["Choix de la source", f"meilleur signal sur bruit parmi {len(res)} sources examinées (≈ {snr:.0f} par pixel)"]]
    return dict(type="plot", file="euclid-nisp-spectre.json", title="Spectre NISP d'une source du relevé Q1", meta=meta, url="https://irsa.ipac.caltech.edu/data/Euclid/docs/overview_q1.html",
                caption="Spectre sans fente du grisme rouge, extrait et combiné par la chaîne de traitement (pixels marqués comme douteux retirés).", credit="ESA/Euclid/Euclid Consortium/NASA", fetched=TODAY)

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
    # produits supplémentaires d'un même instrument : clé « observatoire/instrument:nom »
    "euclid/vis:image": euclid_vis_image, "euclid/nisp:image": euclid_nisp_image, "euclid/nisp:spectre": euclid_spectrum,
    "gaia/bprp:spectre": gaia_xp_spectrum, "gaia/rvs:spectre": gaia_rvs_spectrum,
}

def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    mpath = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(mpath, encoding="utf-8")) if os.path.exists(mpath) else {}
    args = sys.argv[1:]
    # sans argument : seulement les recettes absentes du manifeste, pour que le site ne change pas tout seul ; « all » refait tout
    todo = list(RECIPES) if args == ["all"] else (args or [k for k in RECIPES if k not in manifest])
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
