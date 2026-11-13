/* English text for the instrument pages (applied over src/data-inst.js by src/i18n.js).
   Only translatable fields appear here; wavelengths, fields of view, filters and links stay in the French file. */
var EN_INST = {};
EN_INST.hubble = {
  summary:"Five active science instruments, including two ultraviolet spectrographs and two cameras. The instruments can be swapped in orbit: most were installed during Space Shuttle servicing missions (1993–2009).",
  archives:[["MAST, Hubble archive","Search, previews and downloads of HST observations; programmatic access through astroquery.mast."],["ESA, eHST","ESA's Hubble archive (European mirror)."],["Instrument handbooks","Instrument & Data Handbooks (WFC3, ACS, STIS, COS)."]],
  instruments:{
    wfc3:{ kind:"Wide-field camera",
      summary:"A fourth-generation camera installed in 2009 (SM4). Two independent channels, only one of which can be used at a time, cover the near ultraviolet to the near infrared.",
      specs:[["UVIS channel","200–1000 nm · 2 e2v 2k×4k CCDs · 0.040″/px · 162″×162″ · f/31"],["IR channel","800–1700 nm · 1k×1k HgCdTe (Teledyne) · 0.13″/px · 136″×123″ · f/11"],["Filters","UVIS: wide choice (wide, medium, narrow) · IR: 15"],["Grisms","G280 (UVIS) · G102 and G141 (IR)"],["Read noise","3 e⁻ (UVIS), against 4 e⁻ for ACS"],["Sensitivity (S/N=10, 10 h)","V = 29.2 (F606W) · H = 27.9 (F160W), AB mag, point source"]],
      filtersTitle:"Filters (representative selection)",
      products:[["_raw.fits","raw, uncalibrated exposure"],["_flt.fits","calibrated image (bias, dark, flat), not resampled; SCI / ERR / DQ extensions"],["_flc.fits","as _flt, with CTE correction (UVIS)"],["_drz / _drc.fits","combined products resampled by AstroDrizzle (_drc: CTE-corrected)"],["Naming","IPPPSSOOT: “i” = WFC3, then programme, visit, observation"]],
      example:{ title:"FITS header of an _flt product (excerpt)", caption:"Real keywords of the format; the values are an example." },
      code:{ title:"Retrieve WFC3/UVIS images (astroquery.mast)" },
      notes:["UVIS: charge-transfer losses (CTE) grow with time. Prefer the _flc / _drc products.","IR: image persistence after exposure to bright sources; readout is up-the-ramp (several reads per exposure).","A channel-select mirror sends the light either to UVIS or to IR: no simultaneous exposures."] },
    acs:{ kind:"Survey camera",
      summary:"Installed in 2002 (SM3B). Its wide-field channel, WFC, was used for the large surveys (deep fields, galaxy clusters). An electronics failure in January 2007 took out WFC and HRC; WFC was repaired in 2009, HRC was not.",
      specs:[["WFC","350–1100 nm · 202″×202″ · 0.05″/px"],["SBC","solar-blind far-ultraviolet imaging (MAMA) · ≈ 115–170 nm · 0.032″/px"],["HRC","out of service since 2007 (could not be repaired in SM4)"]],
      filtersTitle:"WFC / SBC filters (selection)",
      products:[["_flt / _flc.fits","calibrated images without / with CTE correction"],["_drz / _drc.fits","AstroDrizzle combined products"],["Naming","IPPPSSOOT: “j” = ACS"]],
      example:{ title:"Structure of an ACS/WFC _flc product", caption:"Real extensions of a calibrated file; each CCD takes one set of extensions.", text:
"HDU 0  PRIMARY       global header (TELESCOP, INSTRUME='ACS', DETECTOR='WFC', FILTER1/2, EXPTIME …)\nHDU 1  SCI  (1)      CCD WFC2 · image in e⁻  (4096 × 2048)\nHDU 2  ERR  (1)      per-pixel uncertainty\nHDU 3  DQ   (1)      data-quality mask (bits)\nHDU 4  SCI  (2)      CCD WFC1 · image in e⁻  (4096 × 2048)\nHDU 5  ERR  (2)\nHDU 6  DQ   (2)" },
      code:{ title:"Retrieve ACS/WFC images (astroquery.mast)" },
      notes:["The two WFC CCDs are stored in separate extensions (SCI,1 and SCI,2).","As for WFC3/UVIS, the _flc / _drc products include the CTE correction."] },
    stis:{ kind:"Imaging spectrograph",
      summary:"A long-slit spectrograph (up to 52″) installed in 1997, which failed in 2004 and was repaired in 2009 during SM4. It combines three detectors: two ultraviolet MAMAs and a CCD.",
      specs:[["FUV-MAMA","115–170 nm · 0.024″/px · 25″×25″ field"],["NUV-MAMA","165–310 nm · 0.024″/px · 25″×25″ field"],["CCD","250–1100 nm · 0.05″/px · 52″×52″ field"],["Spectral resolution","R ≈ 500–1,000 (L gratings) · ≈ 10,000–20,000 (M) · ≈ 30,000–114,000 (echelles)"]],
      filtersTitle:"Gratings (nominal ranges)",
      products:[["_raw / _flt.fits","raw and calibrated exposures"],["_x1d.fits","extracted 1D spectrum (binary table)"],["_x2d.fits","rectified 2D spectrum (wavelength × position along the slit)"],["_crj.fits","combined CCD exposures with cosmic-ray rejection"]],
      example:{ title:"Columns of the _x1d table (one row per spectral order)", caption:"Real layout of STIS products; each cell holds an array of NELEM points.", text:
"SPORDER     spectral order\nNELEM       number of points in the spectrum\nWAVELENGTH  wavelength (Å)\nGROSS       gross count rate (c/s)\nBACKGROUND  estimated background (c/s)\nNET         net rate = GROSS − BACKGROUND\nFLUX        calibrated flux (erg/s/cm²/Å)\nERROR       uncertainty on FLUX\nDQ          data-quality flags" },
      code:{ title:"Retrieve STIS spectra (astroquery.mast)" },
      notes:["TIME-TAG mode is available for the MAMA detectors (event by event).","Power-supply failure in August 2004; returned to service during the SM4 mission (2009)."] },
    cos:{ kind:"UV spectrograph",
      summary:"A very sensitive slitless ultraviolet spectrograph, installed in 2009 (SM4) to study the intergalactic medium, quasars and the origin of the chemical elements.",
      specs:[["FUV channel","≈ 90–215 nm · microchannel-plate detector (cross delay line readout)"],["NUV channel","≈ 170–320 nm · MAMA detector"],["Aperture","PSA, circular, Ø 2.5″ (slitless)"],["Resolution","R ≈ 1,500–4,000 (low) · ≈ 16,000–24,000 (medium)"]],
      filtersTitle:"Gratings (approximate nominal ranges)",
      products:[["_corrtag.fits","corrected photon-by-photon event list (TIME-TAG)"],["_x1d.fits / _x1dsum.fits","extracted 1D spectrum / sum of exposures"],["_flt.fits","calibrated image"]],
      example:{ title:"Columns of the _corrtag table (one row per photon)", caption:"Layout of TIME-TAG events; units indicative.", text:
"TIME        photon arrival time (s)\nRAWX, RAWY  raw position on the detector (pixels)\nXCORR, YCORR  corrected position (geometric distortion)\nXDOPP       position corrected for the orbital Doppler shift\nEPSILON     weight (efficiency / flat field)\nWAVELENGTH  assigned wavelength (Å)\nDQ          data-quality flags" },
      code:{ title:"Retrieve COS spectra (astroquery.mast)" },
      notes:["Slitless: the effective resolution depends on the angular size of the source.","TIME-TAG data let you re-slice the exposure time after the fact."] },
    fgs:{ kind:"Guiding and astrometry",
      summary:"Three fine guidance sensors that lock the telescope onto guide stars (pointing stability ≈ 0.007″). They also serve as a science instrument: high-precision astrometry and measurements of close binaries.",
      specs:[["Number","3 (two for guiding, one available for science)"],["Principle","Koesters-prism interferometers"],["Pointing stability","≈ 0.007″"]],
      products:[["Archive","FGS (astrometry) data are available at MAST under the instrument “FGS”"]],
      notes:["The FGS delivered several Cepheid parallaxes before the Gaia era."], docs:["Hubble documentation (STScI)"] }
  }
};
EN_INST.jwst = {
  summary:"Four science instruments share the ISIM module, kept at very low temperature (≈ 40 K; ≈ 7 K for the MIRI detector), along with a fine guidance sensor. Together they cover 0.6 to 28.8 µm.",
  archives:[["MAST, JWST archive","JWST observations, calibration levels 1 to 3; programmatic access through astroquery.mast."],["ESA, JWST archive","European access to JWST data."],["JDox, documentation","User documentation for each instrument."],["Calibration pipeline","Calibration steps and data product formats."]],
  instruments:{
    nircam:{ kind:"Near-IR camera",
      summary:"JWST's main camera. Two identical modules observe the same field in two wavelength ranges at once, thanks to a dichroic. It also serves as the wavefront sensor used to align the 18 mirror segments.",
      specs:[["Range","0.6–5.0 µm"],["Short-wavelength channel (SW)","0.6–2.3 µm · 0.031″/px"],["Long-wavelength channel (LW)","2.4–5.0 µm · 0.063″/px"],["Field","2 modules of 2.2′×2.2′ separated by ≈ 44″ · 9.7 arcmin² in total"],["Detectors","10 HgCdTe 2048×2048 arrays (8 SW + 2 LW)"],["Other modes","coronagraphy · slitless spectroscopy (LW grism, R ≈ 1,700) · time series"]],
      filtersTitle:"Filters (representative selection)",
      products:[["_uncal.fits","level 1b: raw, uncalibrated ramps"],["_rate.fits","level 2a: count rate per pixel"],["_cal.fits","level 2b: calibrated image (astrometry and photometry)"],["_i2d.fits","level 3: combined, resampled mosaic"],["_cat.ecsv","level 3: source catalogue"],["Naming","jwPPPPPOOOVVV_GGSAA_EEEEE_detector_suffix"]],
      example:{ title:"FITS header of a _cal product (excerpt)", caption:"Real keywords of JWST products; the values are an example." },
      code:{ title:"Retrieve NIRCam mosaics (astroquery.mast)" },
      notes:["The two channels (SW and LW) observe the same field at the same time: one exposure yields images in two filters.","The _i2d.fits files hold the SCI, ERR and WHT extensions and the WCS (astrometry) of the combined product."] },
    nirspec:{ kind:"Multi-object spectrograph",
      summary:"A spectrograph supplied by ESA. Its micro-shutter array (MSA) can observe hundreds of galaxies at once. It also offers an integral field unit (IFU) and fixed slits.",
      specs:[["Range","0.6–5.3 µm"],["Resolution","R ≈ 100 (prism) · ≈ 1,000 (M gratings) · ≈ 2,700 (H gratings)"],["Multi-object (MSA)","4 quadrants of 365×171 shutters · field ≈ 3.4′×3.4′"],["IFU","3″×3″ cut into 30 slices of 0.1″"],["Fixed slits","S200A1/A2, S400A1, S1600A1 and time-series mode (BOTS)"]],
      filtersTitle:"Dispersers (nominal ranges)",
      products:[["_cal.fits","level 2b: calibrated 2D image per slit or shutter"],["_s2d.fits","resampled 2D spectra"],["_x1d.fits","extracted 1D spectra (binary table)"],["_s3d.fits","IFU data cube (x, y, λ)"]],
      example:{ title:"Columns of an _x1d file (1D spectrum)", caption:"Real layout of the JWST product; one row per spectral pixel.", text:
"WAVELENGTH      wavelength (µm)\nFLUX            flux density (Jy)\nFLUX_ERROR      uncertainty on the flux\nFLUX_VAR_POISSON / _RNOISE / _FLAT   variance components\nSURF_BRIGHT     surface brightness (MJy/sr)\nDQ              data-quality flags\nBACKGROUND      subtracted background\nNPIXELS         number of pixels in the aperture" },
      code:{ title:"Retrieve NIRSpec spectra (astroquery.mast)" },
      notes:["An _x1d file can hold several sources (one spectrum per open MSA shutter).","MSA mode needs catalogues prepared with NIRCam to choose the sources."] },
    miri:{ kind:"Mid-IR imager and spectrograph",
      summary:"The only instrument working in the mid infrared, cooled to about 7 K by an active cryocooler. It observes warm dust, protoplanetary discs and distant, dust-enshrouded galaxies.",
      specs:[["Imager","5.6–25.5 µm · 74″×113″ · 0.11″/px"],["Medium-resolution spectrometer (MRS)","4.9–28.8 µm · R ≈ 1,500–3,500 · 4 IFUs (3.9″×3.9″ to ≈ 7.7″×7.7″)"],["Low-resolution spectrometer (LRS)","≈ 5–12 µm · R ≈ 100 · 0.6″×5.5″ slit"],["Coronagraphs","4 · inner working angle 0.34″–2.16″ · contrast 10⁻⁶–10⁻⁵"],["Temperature","≈ 7 K (cryocooler)"]],
      filtersTitle:"Imaging filters and coronagraphs",
      products:[["_cal.fits","calibrated image (level 2b)"],["_i2d.fits","combined mosaic (level 3)"],["_s3d.fits","MRS cube (x, y, λ) per channel and sub-band"],["_x1d.fits","extracted 1D spectrum (MRS, LRS)"]],
      example:{ title:"Layout of an MRS cube (_s3d)", caption:"Real structure of the product; dimensions indicative.", text:
"HDU SCI       flux cube     (λ, y, x)   units MJy/sr\nHDU ERR       uncertainty   (λ, y, x)\nHDU DQ        quality       (λ, y, x)\nHDU WMAP      weight map\nWCS           3 axes: RA/Dec + wavelength (µm)\nchannels 1–4  4.9 → 28.8 µm  (each in 3 sub-bands A/B/C)" },
      code:{ title:"Retrieve MIRI images (astroquery.mast)" },
      notes:["At long wavelengths the background (zodiacal light, thermal emission) becomes large: subtracting it is a key processing step.","The cryocooler holds the detector at ≈ 7 K, far colder than the rest of ISIM (≈ 40 K)."] },
    niriss:{ kind:"Imager and slitless spectrograph",
      summary:"Supplied by the Canadian Space Agency. It specialises in spectra of transiting exoplanets (SOSS), wide-field slitless spectroscopy (WFSS) and aperture masking interferometry (AMI).",
      specs:[["Imaging","0.8–5.0 µm · 2.2′×2.2′ · 0.065″/px"],["WFSS","R ≈ 150 · 0.8–2.2 µm"],["SOSS","0.6–2.8 µm · R ≈ 700 (single object, transits)"],["AMI","aperture masking interferometry · 2.8–4.8 µm (4 filters)"]],
      filtersTitle:"Imaging filters",
      products:[["_cal.fits","calibrated images (imaging)"],["_x1d.fits","1D spectra (SOSS, WFSS)"],["_i2d.fits","mosaics (imaging)"]],
      example:{ title:"SOSS time series (exoplanet transit)", caption:"Typical structure of a SOSS observation; numbers indicative.", text:
"_calints.fits  one calibrated image per integration  (n_int, 256, 2048)\n_x1dints.fits  one 1D spectrum per integration       (n_int, n_λ)\norder 1: 0.85–2.8 µm  ·  order 2: 0.6–1.4 µm\n→ spectroscopic light curve = flux(λ) as a function of time" },
      code:{ title:"Retrieve NIRISS data (astroquery.mast)" },
      notes:["SOSS mode measures the transmission spectrum of an exoplanet's atmosphere during its transit."] },
    fgs:{ kind:"Fine guidance",
      summary:"The fine guidance sensor that locks the observatory onto guide stars to hold the pointing to a few milliarcseconds.",
      specs:[["Range","0.6–5.0 µm"],["Field","2.3′×2.3′ · ≈ 0.07″/px"],["Redundancy","2 guiding channels (FGS1, FGS2)"]],
      products:[["Archive","guiding data are archived but are not a usual science product"]],
      notes:["It shares its housing with NIRISS, but works as part of the pointing control system."] }
  }
};
EN_INST.euclid = {
  summary:"Two instruments share the same 1.2 m telescope through a dichroic: VIS (visible) and NISP (near infrared). The first major release, DR1, came out on 12 November 2026: about 1,900 deg² of the Wide Survey (14% of the goal), observed from spring 2024 to spring 2025, more than a billion objects. It adds to the Q1 “Quick Release” of March 2025, from which the examples on this page are taken.",
  archives:[["ESA, Euclid Science Archive","Official archive: catalogues (ADQL), images, spectra."],["Euclid DR1 (12 November 2026)","First major release: Wide and Deep surveys, more than a billion objects, spectra of more than 160 million sources."],["Q1 contents","Description of the products published in Quick Release 1."],["NASA/IPAC, IRSA Euclid","NASA mirror: mosaics, catalogues, VO services."],["Product documentation (DPDD)","Data Product Description Document for Q1."],["astroquery.esa.euclid","Python access to the archive (TAP+)."]],
  instruments:{
    vis:{ kind:"Visible imager",
      summary:"A camera built to measure galaxy shapes precisely (weak gravitational lensing). A single, very broad band, with no filter other than the dichroic.",
      specs:[["Band","IE · 550–900 nm (edges ≈ 20 nm)"],["Detectors","36 thinned (40 µm) e2v CCD273-84 devices in a 6×6 array"],["Format","4096×4132 px per CCD · 12 µm pixels · 4 readout nodes"],["Mosaic","≈ 610 Mpx · sampling ≈ 0.1″/px"],["Field","≈ 0.53 deg² (common VIS/NISP field)"],["CCD temperature","≈ 150 K (best charge transfer) · electronics ≥ 250 K"],["Saturation","≈ 200,000 e⁻ · bright limit: IE(AB) ≈ 17.8 (nominal exposure)"],["Focal ratio","f/20.4 · 1.2 m pupil · 11% central obstruction"]],
      filtersTitle:"Photometric band",
      products:[["Calibrated images","multi-extension FITS files per exposure (level 2)"],["MER mosaics","stacks per sky tile, including ground-based data"],["MER catalogue","master source table (VIS + NISP + ground)"],["Cutouts","cutout service in the web archive and in ESA Datalabs"]],
      example:{ title:"Real schema of the q1.mer_catalogue table (excerpt)", caption:"Columns of the public Q1 table, queryable in ADQL, with the names published by the ESA archive.", text:
"object_id          long   unique Euclid identifier of the source\nright_ascension    deg    right ascension (source barycentre)\ndeclination        deg    declination\nsegmentation_area         area of the source in the segmentation map\nellipticity               ellipticity\nkron_radius        pix    semi-major axis of the Kron aperture\nflux_vis_psf              VIS flux (PSF fit) · mag_vis_psf: matching AB magnitude\nflux_h_templfit           NISP H-band flux (template fit) · mag_h_templfit: AB magnitude\n[≈ 30 million rows: fields EDF-North, EDF-Fornax, EDF-South and LDN 1641]" },
      code:{ title:"Query the MER catalogue (astroquery.esa.euclid)" },
      notes:["The object_id identifier encodes the source position: negative declinations give negative identifiers.","Q1 covers ≈ 63 deg² (EDF-North 22.9 · EDF-Fornax 12.1 · EDF-South 28.1 deg²) plus the dark nebula LDN 1641, about 35 TB."],
      docs:["Euclid Consortium, VIS","Q1, contents"] },
    nisp:{ kind:"IR photometer and slitless spectrometer",
      summary:"It measures infrared colours (for photometric redshifts) and provides slitless grism spectroscopy, which gives the spectroscopic redshifts of millions of galaxies.",
      specs:[["Range","0.92–2.0 µm"],["Detectors","16 HgCdTe H2RG arrays in 4×4 · 2040×2040 usable px · 18 µm pixels"],["Sampling","≈ 0.3″/px"],["Photometry","3 filters: Y (0.95–1.21), J (1.17–1.57), H (1.52–2.02 µm)"],["Spectroscopy","blue grism (BG) ≈ 0.92–1.37 µm · red grism (RG) ≈ 1.21–1.89 µm, 3 orientations"],["Mass and power","85.3 kg (instrument) + 40.7 kg (warm electronics) · ≤ 200 W"],["Temperature","detectors ≈ 95 K · optics ≈ 130 K"]],
      filtersTitle:"Bands and grisms (nominal ranges)",
      products:[["NISP images","calibrated images per exposure and MER mosaics (Y, J, H)"],["SIR spectra","1D spectra (DataLink / SSA) and calibrated 2D images; Q1: red grism only"],["SPE catalogue","13 tables of spectroscopic measurements (redshifts, quality)"],["PHZ catalogue","8 tables of photometric redshifts"]],
      example:{ title:"Contents of the Q1 catalogue (number of tables per product)", caption:"Real organisation of the catalogues queryable in ADQL in the ESA archive.", text:
"MER  (merged product)        3 tables   including q1.mer_catalogue\nPHZ  (photometric redshifts) 8 tables\nSPE  (spectroscopy)         13 tables   redshifts and quality from the SIR spectra\n\nJoin: all tables share the key  object_id" },
      code:{ title:"List the available tables (astroquery.esa.euclid)" },
      notes:["In Q1, only the red-grism spectra are published.","VIS and NISP receive light from the same field through the dichroic and can expose at the same time."],
      docs:["Euclid Consortium, instruments"] }
  }
};
EN_INST.gaia = {
  summary:"Gaia has no separate instruments in the usual sense. A single focal plane of 106 CCDs, shared by the two telescopes, performs three functions that read the same stream of light as the spacecraft scans the sky.",
  archives:[["ESA, Gaia Archive","Official archive: ADQL queries on Gaia DR3, downloads, XP and RVS spectra."],["Gaia DR3 documentation","Full description of the catalogue and its tables."],["VizieR, Gaia DR3 (I/355)","CDS access to the catalogue."],["astroquery.gaia","Python access to the archive."]],
  instruments:{
    astro:{ kind:"Astrometry and G photometry",
      summary:"The sky mapper (SM) detects objects in real time; the astrometric field (AF) then measures their positions to a few tens of microarcseconds. Together they also give the white-light G magnitude.",
      specs:[["Detectors","SM: 14 CCDs (7 per telescope) · AF: 62 CCDs"],["Pixels","4500×1966 px · 10 µm × 30 µm"],["Readout mode","TDI: integration synchronised with the spin (≈ 4.4 s per CCD)"],["G band","≈ 330–1050 nm (white light)"],["Magnitudes observed","G ≈ 3 to ≈ 21"],["Parallax precision (DR3)","≈ 0.02–0.03 mas (G < 15) · 0.07 mas (G = 17) · 0.5 mas (G = 20)"]],
      filtersTitle:"Photometric band",
      products:[["gaia_source","master table: astrometry, photometry, parameters, radial velocities (≈ 1.8 billion sources in DR3)"],["Astrometry","5 or 6 parameters: position, parallax, proper motion (± pseudo-colour)"],["RUWE","quality indicator of the astrometric fit (≈ 1 expected)"]],
      example:{ title:"Excerpt from gaia_source, well-known stars", caption:"Values as published (Gaia EDR3 astrometry and photometry, identical in DR3). Epoch 2016.0.", text:
"source_id             ra (°)       dec (°)       parallax (mas)    G (mag)  BP−RP  RUWE\n5853498713190525696   217.392321   −62.676075    768.067 ± 0.050   8.985    3.805  0.97   Proxima Cen\n5250032958818831360   146.311593   −62.507867      1.984 ± 0.110   3.471    1.503  2.39   ℓ Car\n5351161399793209984   161.136160   −57.565357      0.553 ± 0.017   7.338    1.511  0.92   VY Car\n5240441472232302848   165.566881   −64.262893      0.378 ± 0.014   8.941    1.549  1.07   XY Car\n\n→ ℓ Car (a very bright star) has a RUWE of 2.39: an astrometric solution to treat with caution." },
      code:{ title:"ADQL query (astroquery.gaia)" },
      notes:["Proxima Centauri (parallax 768 mas, i.e. 1.30 pc) is the nearest star to the Sun.","A RUWE well above 1.4 usually signals a poor fit (unresolved binary, extended source)."],
      docs:["Gaia DR3 documentation"] },
    bprp:{ kind:"Low-resolution spectrophotometry",
      summary:"Two prisms spread the light of each star into a very low-resolution spectrum, blue (BP) and red (RP), which gives colours, temperature and extinction.",
      specs:[["BP","≈ 330–680 nm · 7 CCDs"],["RP","≈ 640–1050 nm · 7 CCDs"],["Resolution","R ≈ 20–100 depending on wavelength"],["XP spectra published (DR3)","≈ 220 million"]],
      filtersTitle:"Photometric bands",
      products:[["phot_bp_mean_mag / phot_rp_mean_mag","magnitudes in gaia_source"],["XP continuous / sampled","XP spectra: basis coefficients (continuous) or sampled"]],
      example:{ title:"Continuous representation of an XP spectrum", caption:"Structure of the product; the values are not reproduced here.", text:
"source_id           identifier\nbp_n_parameters     number of BP coefficients\nbp_coefficients[]   coefficients of the expansion on a set of basis functions\nbp_coefficient_errors[]\n(same for RP)\n→ the spectrum is rebuilt with GaiaXPy (any sampling)" },
      code:{ title:"BP − RP colour (ADQL)" },
      notes:["The BP − RP difference is a colour index: the larger it is, the redder the star (Proxima: 3.8)."],
      docs:["Gaia DR3 documentation"] },
    rvs:{ kind:"Slitless spectrometer",
      summary:"A slitless spectrometer centred on the ionised calcium (Ca II) triplet. It uses the Doppler effect to measure the radial velocities of tens of millions of stars.",
      specs:[["Range","845–872 nm"],["Resolution","R ≈ 11,500"],["Detectors","12 CCDs"],["Radial velocities (DR3)","≈ 33.8 million stars"]],
      filtersTitle:"Spectral range",
      products:[["radial_velocity","radial velocity (km/s) in gaia_source"],["rv_nb_transits","number of transits used"]],
      example:{ title:"Radial-velocity fields in gaia_source", caption:"Real columns of the table.", text:
"radial_velocity          km/s   radial velocity\nradial_velocity_error    km/s   uncertainty\nrv_nb_transits           —      number of transits used\nrv_template_teff         K      temperature of the stellar template used" },
      code:{ title:"Nearby stars with a radial velocity (ADQL)" },
      notes:["Radial velocity, proper motion and parallax together give the star's 3D velocity in the Galaxy."],
      docs:["Gaia DR3 documentation"] }
  }
};
/* Short labels shared by several instruments: filter notes, band and field names, code comments. */
var EN_WORDS = {
  "coupure à 850 nm":"cut-on at 850 nm", "coupure à 115 nm":"cut-on at 115 nm", "FUV-MAMA, basse résolution":"FUV-MAMA, low resolution", "NUV-MAMA, basse résolution":"NUV-MAMA, low resolution",
  "CCD, basse résolution":"CCD, low resolution", "échelle FUV, R ≈ 45 000":"FUV echelle, R ≈ 45,000", "FUV, basse résolution":"FUV, low resolution", "FUV, moyenne résolution":"FUV, medium resolution",
  "NUV, moyenne résolution":"NUV, medium resolution", "NUV, basse résolution":"NUV, low resolution", "H₂ 2,12 µm":"H₂ 2.12 µm", "H₂ 4,7 µm":"H₂ 4.7 µm", "très large":"extra wide", "R ≈ 1 000 / 2 700":"R ≈ 1,000 / 2,700",
  "imagerie":"imaging", "bande PAH 7,7 µm":"7.7 µm PAH band", "bande PAH 11,3 µm":"11.3 µm PAH band", "coronographe":"coronagraph", "bande large unique":"single broad band", "photométrie":"photometry",
  "grisme bleu, non publié dans Q1":"blue grism, not released in Q1", "grisme rouge, spectres publiés dans Q1":"red grism, spectra released in Q1", "lumière blanche (SM + AF)":"white light (SM + AF)",
  "bande bleue":"blue band", "bande rouge":"red band", "triplet du Ca II":"Ca II triplet",
  "ouverture PSA (Ø 2,5″)":"PSA aperture (Ø 2.5″)", "0,6–5,3 µm":"0.6–5.3 µm", "0,6–5,0 µm":"0.6–5.0 µm", "Imageur":"Imager", "bande G":"G band", "Champ d'un télescope":"Field of one telescope"
};
var EN_CODE = [["# écrit dans ./mastDownload/","# written to ./mastDownload/"],["# exemple : champ quelconque","# example: any field"],["# exemple : Hubble Ultra Deep Field","# example: Hubble Ultra Deep Field"],
  ["# exemple : hôte d'exoplanète en transit","# example: host of a transiting exoplanet"],["# exemple : quasar brillant","# example: bright quasar"],["# exemple : amas SMACS 0723","# example: cluster SMACS 0723"],
  ["# ex. q1.mer_catalogue, …","# e.g. q1.mer_catalogue, …"],["# ≤ 2000 lignes ; launch_job_async au-delà","# ≤ 2000 rows; use launch_job_async beyond that"]];
