"""Sonde : arborescence des données Euclid DR1 dans le stockage en nuage d'IRSA (S3 public, lecture anonyme)."""
import requests, re
def ls(bucket, prefix="", delim="/", n=60):
    u = f"https://{bucket}.s3.us-east-1.amazonaws.com/?list-type=2&delimiter={delim}&prefix={prefix}&max-keys=200"
    try:
        r = requests.get(u, timeout=60)
    except Exception as e:
        print(bucket, prefix, "ÉCHEC", repr(e)[:150]); return [], []
    pre = re.findall(r"<Prefix>([^<]*)</Prefix>", r.text)[1:] if delim else []
    keys = re.findall(r"<Key>([^<]*)</Key>", r.text)
    print(f"\n[{r.status_code}] s3://{bucket}/{prefix} : {len(pre)} dossiers, {len(keys)} fichiers")
    for p in pre[:n]: print("   D", p)
    for k in keys[:n]: print("   F", k)
    return pre, keys
for b in ("nasa-irsa-euclid-dr1", "nasa-irsa-euclid", "nasa-irsa-euclid-q1"):
    pre, _ = ls(b)
    for p in pre[:6]:
        pre2, _ = ls(b, p)
        for q in pre2[:12]:
            ls(b, q, n=15)
# la tuile COSMOS dont viennent les mosaïques DR1 du site
for b in ("nasa-irsa-euclid-dr1",):
    for pfx in ("dr1/catalogs/", "catalogs/", "dr1/"):
        ls(b, pfx, n=40)
