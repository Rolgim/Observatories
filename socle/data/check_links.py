"""Vérification des liens et des licences d'un site (socle commun, piste « données vivantes »).

Usage : python socle/data/check_links.py [--report rapport.md] [--max N]
  Lancé depuis la racine du site (workflow « Liens et licences », chaque mois).

Ce qui est vérifié :
  - toutes les URL du registre des crédits (data/credits.json : source, page, license_url) ;
  - toutes les URL écrites dans les sources du site (src/**/*.js, src/body.html : références des fiches, liens d'archives).
Pour chaque page de licence (license_url), une empreinte du texte est gardée dans tools/liens-etat.json :
si le texte change d'un mois à l'autre, le rapport le signale, pour relire la licence à la main.

Rien n'est retiré ni corrigé automatiquement : le script écrit un rapport (Markdown) et sort avec le code 1
s'il y a quelque chose à relire. Classement :
  mort       404 ou 410 : lien à remplacer
  refusé     401, 403, 429 : le serveur refuse les robots (fréquent pour les archives) ; à vérifier dans un navigateur
  erreur     délai dépassé, nom inconnu, certificat : à revérifier le mois suivant
  licence    page de licence dont le texte a changé depuis la dernière vérification
"""
import hashlib, html, json, os, re, sys, time
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlsplit

import requests

ROOT = os.getcwd()
STATE = os.path.join(ROOT, "tools", "liens-etat.json")
UA = "Mozilla/5.0 (compatible; link-checker for a non-commercial educational site)"
URL_RE = re.compile(r"https?://[^\s'\"<>()\\`]+")
SKIP = re.compile(r"^https?://(localhost|127\.0\.0\.1)|\{|\$")   # gabarits et adresses locales


def collect():
    """-> {url: [où elle apparaît]}"""
    found = {}
    def add(u, where):
        u = u.rstrip(".,;:")
        if not SKIP.search(u): found.setdefault(u, []).append(where)
    cj = os.path.join(ROOT, "data", "credits.json")
    licences = set()
    if os.path.exists(cj):
        for it in json.load(open(cj, encoding="utf-8")).get("items", []):
            for k in ("source", "page", "license_url"):
                if it.get(k): add(it[k], "credits:" + (it.get("file") or it.get("title") or "?"))
            if it.get("license_url"): licences.add(it["license_url"].rstrip(".,;:"))
    for d, _, fs in os.walk(os.path.join(ROOT, "src")):
        for f in fs:
            if f.endswith((".js", ".html")):
                p = os.path.join(d, f)
                for u in URL_RE.findall(open(p, encoding="utf-8").read()):
                    add(u, os.path.relpath(p, ROOT))
    return found, licences


def text_hash(body):
    t = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", body)
    t = html.unescape(re.sub(r"(?s)<[^>]+>", " ", t))
    t = re.sub(r"\s+", " ", t).strip()
    return hashlib.sha256(t.encode("utf-8")).hexdigest()


def check(url, want_text):
    s = requests.Session(); s.headers["User-Agent"] = UA
    for attempt in range(2):
        try:
            if want_text:
                r = s.get(url, timeout=25, allow_redirects=True)
            else:
                r = s.head(url, timeout=20, allow_redirects=True)
                if r.status_code in (403, 405, 501) or r.status_code >= 500:
                    r = s.get(url, timeout=25, allow_redirects=True, stream=True); r.close()
            out = {"code": r.status_code, "final": r.url if r.url != url else None}
            if want_text and r.ok and "html" in r.headers.get("content-type", "") + "html":
                out["hash"] = text_hash(r.text)
            return out
        except requests.RequestException as e:
            err = type(e).__name__
            time.sleep(3)
    return {"code": None, "error": err}


def classify(res):
    c = res.get("code")
    if c is None: return "erreur"
    if c in (404, 410): return "mort"
    if c in (401, 403, 429): return "refusé"
    if c >= 400: return "erreur"
    return "ok"


def main():
    args = sys.argv[1:]
    report = args[args.index("--report") + 1] if "--report" in args else None
    maxn = int(args[args.index("--max") + 1]) if "--max" in args else None
    found, licences = collect()
    urls = sorted(found)[:maxn] if maxn else sorted(found)
    # au plus 4 requêtes en parallèle, et une seule à la fois par hôte (politesse envers les archives)
    by_host = {}
    for u in urls: by_host.setdefault(urlsplit(u).netloc, []).append(u)
    results = {}
    def run_host(lst):
        for u in lst:
            results[u] = check(u, u in licences); time.sleep(0.5)
    with ThreadPoolExecutor(4) as ex: list(ex.map(run_host, by_host.values()))

    old = json.load(open(STATE, encoding="utf-8")) if os.path.exists(STATE) else {}
    today = time.strftime("%Y-%m-%d")
    rows, state = [], {}
    for u in urls:
        r = results[u]; k = classify(r)
        prev = old.get(u, {})
        st = {"code": r.get("code"), "checked": today}
        if r.get("hash"):
            st["hash"] = r["hash"]; st["hash_since"] = prev.get("hash_since", today) if prev.get("hash") == r["hash"] else today
            if prev.get("hash") and prev["hash"] != r["hash"]: k = "licence"
        elif prev.get("hash"):
            st["hash"], st["hash_since"] = prev["hash"], prev.get("hash_since")
        state[u] = st
        if k != "ok": rows.append((k, u, r, found[u]))
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    json.dump(state, open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)

    order = {"mort": 0, "licence": 1, "refusé": 2, "erreur": 3}
    rows.sort(key=lambda x: (order[x[0]], x[1]))
    n = {k: sum(1 for r in rows if r[0] == k) for k in order}
    lines = ["# Liens et licences : vérification du %s" % today, "",
             "%d adresses vérifiées (%d pages de licence) : %d mortes, %d licences modifiées, %d refusées aux robots, %d en erreur." %
             (len(urls), len(licences & set(urls)), n["mort"], n["licence"], n["refusé"], n["erreur"]), ""]
    if rows:
        lines += ["| État | Adresse | Réponse | Où |", "|---|---|---|---|"]
        for k, u, r, where in rows:
            rep = str(r.get("code") or r.get("error", "")) + (" → " + r["final"] if r.get("final") else "")
            lines.append("| %s | %s | %s | %s |" % (k, u, rep, ", ".join(sorted(set(where)))[:200]))
        lines += ["", "« refusé » et « erreur » ne disent pas qu'un lien est mort : à ouvrir dans un navigateur avant de le changer. "
                  "« licence » : relire la page et mettre à jour data/credits.json si la licence a changé."]
    text = "\n".join(lines) + "\n"
    print(text)
    if report: open(report, "w", encoding="utf-8").write(text)
    if os.environ.get("GITHUB_STEP_SUMMARY"): open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8").write(text)
    sys.exit(1 if n["mort"] or n["licence"] else 0)


if __name__ == "__main__":
    main()
