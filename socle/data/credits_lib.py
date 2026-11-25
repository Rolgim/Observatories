"""Socle commun : registre des crédits et licences (CREDITS.md et data/credits.json).

Chaque site garde dans tools/data/credits.py ce qui lui est propre (les règles de licence de ses sources,
la lecture de ses fichiers) et appelle ces fonctions pour les parties communes :
  transform(d)         ce que le site a fait au fichier d'origine, d'après les champs écrits au téléchargement
  dep(...)             une ligne « code » pour une bibliothèque
  fonts_row()          les polices (Google Fonts, OFL)
  own_code_row(...)    le code du dépôt lui-même et sa licence
  write_register(...)  écrit data/credits.json et CREDITS.md
"""
import datetime, json, os


def transform(d):
    """Ce que le site a fait au fichier d'origine (en français), d'après les champs écrits au téléchargement."""
    if d.get("plot"): return "tracé par ce site (matplotlib) à partir du fichier de données : " + (d.get("how_fr") or "")[:220]
    t = []
    if d.get("crop"): t.append("recadré (partie centrale %d × %d px)" % tuple(d["crop"][:2]))
    if d.get("crop_px"): t.append("carré central de %d px" % d["crop_px"])
    if d.get("crop_lieu"): t.append("découpé sur la zone de la galerie (lon %s à %s, lat %s à %s)" % (d["lieu"][0], d["lieu"][2], d["lieu"][1], d["lieu"][3]))
    if d.get("mosaic", 1) > 1: t.append("assemblage de %d produits du même jour" % d["mosaic"])
    if d.get("stack_days"): t.append("superposition des images quotidiennes de GIBS du %s au %s (%d jours)" % (d.get("date_first"), str(d.get("datetime"))[:10], d["stack_days"]))
    if d.get("legend"): t.append("légende officielle de la couche collée sous l'image")
    if d.get("native_px"): t.append("à la taille réelle des pixels de l'instrument (agrandi à l'affichage, sans lissage)")
    fs, os_ = d.get("full_size"), d.get("out_size")
    if fs and os_ and list(fs)[:1] != list(os_)[:1]: t.append("réduit de %s × %s à %s × %s px" % (fs[0], fs[1], os_[0], os_[1]))
    if d.get("stretch"): t.append("contraste étiré (centiles %s–%s)" % tuple(d["stretch"][:2]))
    t.append("enregistré en JPEG")
    return ", ".join(t)


def dep(name, use, license, url, served=False):
    return dict(kind="code", file=name, title=use, source=url, page=url, license=license, license_url=url, credit=None, fetched=None,
                transform="servi aux visiteurs tel quel" if served else "outil de préparation ou de test, pas distribué avec le site", status="ok")


def fonts_row():
    return dict(kind="police", file="Google Fonts", title="Archivo ; IBM Plex Mono", source="https://fonts.google.com/", page="https://fonts.google.com/", license="SIL Open Font License 1.1",
                license_url="https://openfontlicense.org/", credit="Omnibus-Type (Archivo) ; IBM (Plex)", fetched=None, transform="aucune (chargées depuis Google Fonts)", status="ok")


def own_code_row(root, title, repo):
    """Le code du dépôt : licence lue dans LICENSE (Apache 2.0 pour toute la série)."""
    lic = os.path.join(root, "LICENSE")
    own = ("Apache-2.0 (code seulement : les médias gardent leur licence, voir NOTICE)" if "Apache License" in open(lic, encoding="utf-8").read(400) else "voir LICENSE") if os.path.exists(lic) else "aucune licence déclarée (tous droits réservés)"
    return dict(kind="code", file="src/, build.js, tools/", title="Code du site (" + title + ")", source="https://github.com/" + repo, page=None,
                license=own, license_url=("https://github.com/" + repo + "/blob/main/LICENSE" if os.path.exists(lic) else None), credit="Rolgim", fetched=None, transform="—",
                status="ok" if os.path.exists(lic) else "à confirmer")


def socle_row():
    return dict(kind="code", file="socle/", title="Socle commun de la série (construction, langue, visionneuse 3D, styles, outils)", source="https://github.com/Rolgim/rolgim.github.io/tree/main/socle",
                page=None, license="Apache-2.0 (code du même auteur)", license_url="https://github.com/Rolgim/rolgim.github.io/blob/main/LICENSE", credit="Rolgim", fetched=None,
                transform="copié tel quel (socle.lock.json)", status="ok")


def write_register(root, rows, what, rules, kinds):
    """Écrit data/credits.json et CREDITS.md.
    what  : ce que le site affiche (phrase d'introduction), ex. « images, tracés de données, textures, trajectoires, maquettes 3D, polices et bibliothèques »
    rules : lignes Markdown du tableau « Règles appliquées, par source » (sans l'en-tête)
    kinds : ordre des sections (valeurs du champ kind)"""
    today = datetime.date.today().isoformat()
    json.dump({"generated": today, "items": rows}, open(os.path.join(root, "data", "credits.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    def cell(x): return (str(x) if x else "—").replace("|", "\\|").replace("\n", " ")
    def link(t, u): return "[" + cell(t) + "](" + u + ")" if u else cell(t)
    out = ["# Crédits et licences", "",
           "Registre de tout ce que le site affiche et qui ne vient pas de lui : " + what + ".",
           "Il est **généré** par `tools/data/credits.py` à partir des métadonnées écrites au téléchargement (`data/*.json`) et de `src/data-missions.js` : ne pas le modifier à la main.",
           "La licence de chaque image est aussi affichée sous l'image, sur le site.", "",
           "Généré le " + today + ". Statuts : **ok** (licence vérifiée sur la page citée), **à confirmer** (aucune licence écrite trouvée : voir la colonne licence), **ok (site non commercial)** (licence limitée à l'usage non commercial, ce qui est le cas de ce site).", "",
           "## Règles appliquées, par source", "",
           "| Source | Licence retenue | Page qui l'énonce |", "|---|---|---|"] + list(rules) + [""]
    for kind in kinds:
        sel = [r for r in rows if r["kind"] == kind]
        if not sel: continue
        out += ["## " + kind[0].upper() + kind[1:] + " (" + str(len(sel)) + ")", "",
                "| Fichier | Titre / produit | Crédit | Licence | Statut | Source | Téléchargé le | Transformations |", "|---|---|---|---|---|---|---|---|"]
        for r in sel:
            out.append("| `" + cell(r["file"]) + "` | " + cell(r.get("title")) + (" (" + cell(r.get("instrument")) + ")" if r.get("instrument") else "") + " | " + cell(r.get("credit")) + " | " +
                       link(r.get("license"), r.get("license_url")) + " | " + cell(r.get("status")) + " | " + link("fichier", r.get("source")) + (" · " + link("page", r.get("page")) if r.get("page") and r.get("page") != r.get("source") else "") +
                       " | " + cell(r.get("fetched")) + " | " + cell(r.get("transform")) + " |")
        out.append("")
    open(os.path.join(root, "CREDITS.md"), "w", encoding="utf-8").write("\n".join(out))
    bad = [r["file"] for r in rows if not r["status"].startswith("ok")]
    print("crédits :", len(rows), "entrées ;", len(bad), "à confirmer ou restreintes :", ", ".join(bad))
