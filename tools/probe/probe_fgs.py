"""Sonde : produits et structure d'une observation FGS de Hubble (transit de HD 17156 b)."""
from astroquery.mast import Observations
from astropy.io import fits
t = Observations.query_criteria(obs_collection="HST", obs_id="fb8u5502m")
print(t["obs_id", "target_name", "t_min", "t_max", "t_exptime"])
p = Observations.get_product_list(t)
print(p["productFilename", "productSubGroupDescription", "size", "dataRights"])
sub = p[[str(s).upper() in ("A1F", "DMF", "A2F", "A3F") for s in p["productSubGroupDescription"]]]
m = Observations.download_products(sub, download_dir="/tmp/fgs", cache=False)
for path in m["Local Path"]:
    print("\n####", path)
    with fits.open(path) as h:
        h.info()
        for x in h[:3]:
            print(repr(x.header)[:2500])
            if x.data is not None:
                try: print("   colonnes :", x.columns.names, len(x.data))
                except Exception: print("   données :", getattr(x.data, "shape", None))
