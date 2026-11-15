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
B = "nasa-irsa-euclid-dr1"
pre, _ = ls(B, "dr1/catalogs/")
for p in pre[:20]:
    pre2, k2 = ls(B, p, n=10)
    for q in pre2[:3]: ls(B, q, n=10)
ls(B, "dr1/MER/101544257/", delim="", n=80)
ls(B, "dr1/SIR_COMBINED_SPECTRA/101544257/", delim="", n=40)
ls(B, "dr1/catalogs/", delim="", n=5)
