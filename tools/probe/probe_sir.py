"""Sonde : structure d'un fichier de spectres combinés SIR de DR1 (tuile COSMOS)."""
from astropy.io import fits
u = "https://nasa-irsa-euclid-dr1.s3.us-east-1.amazonaws.com/dr1/SIR_COMBINED_SPECTRA/101544257/EUC_SIR_W-COMBSPEC_101544257_20250809T195658.539788Z.fits"
with fits.open(u, use_fsspec=True, lazy_load_hdus=True) as h:
    print(repr(h[0].header)[:3000])
    for i in range(1, 13):
        x = h[i]
        print("\n== HDU", i, x.name, type(x).__name__, getattr(x.data, "shape", None))
        if hasattr(x, "columns"): print("   colonnes :", x.columns.names)
        print("\n".join("   " + l for l in repr(x.header).splitlines() if not l.startswith(("TFORM", "TTYPE", "TUNIT", "COMMENT"))][:40]))
