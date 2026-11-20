/* English text for the instrument pages (applied over src/data-inst.js by src/i18n.js).
   Only translatable fields appear here; wavelengths, fields of view, filters and links stay in the French file. */
var EN_INST = {};
EN_INST.hubble = {
  summary:"Five active science instruments, including two ultraviolet spectrographs and two cameras. The instruments can be swapped in orbit: most were installed during Space Shuttle servicing missions (1993–2009).",
  archives:[["MAST, Hubble archive","Search, previews and downloads of HST observations; programmatic access through astroquery.mast."],["ESA, eHST","ESA's Hubble archive (European mirror)."],["Instrument handbooks","Instrument & Data Handbooks (WFC3, ACS, STIS, COS)."]],
  instruments:{
    wfc3:{ kind:"Wide-field camera",
      use:"Taking very sharp images of the sky, from the ultraviolet to the near infrared: distant galaxies, nebulae, stars in clusters. It is now Hubble's most used camera.",

      summary:"A fourth-generation camera installed in 2009 (SM4). Two independent channels, only one of which can be used at a time, cover the near ultraviolet to the near infrared.",
      specs:[["UVIS channel", "200–1000 nm · 2 2k×4k CCDs · 0.04″/px · 162″×162″"], ["IR channel", "800–1700 nm · 1k×1k HgCdTe · 0.13″/px · 136″×123″"], ["Filters", "62 (UVIS) · 15 (IR)"], ["Grisms", "G280 (UVIS) · G102 and G141 (IR)"], ["Read noise", "3 e⁻ (UVIS) · 12 e⁻ (IR, 16 reads) · versus 4 e⁻ for ACS/WFC"]],
      filtersTitle:"Filters (representative selection)",
      products:[["_raw.fits","raw, uncalibrated exposure"],["_flt.fits","calibrated image (bias, dark, flat), not resampled; SCI / ERR / DQ extensions"],["_flc.fits","as _flt, with CTE correction (UVIS)"],["_drz / _drc.fits","combined products resampled by AstroDrizzle (_drc: CTE-corrected)"],["Naming","IPPPSSOOT: “i” = WFC3, then programme, visit, observation"]],
      example:{ title:"FITS header of an _flt product (excerpt)", caption:"Real keywords of the format; the values are an example." },
      code:{ title:"Retrieve WFC3/UVIS images (astroquery.mast)" },
      notes:["UVIS: charge-transfer losses (CTE) grow with time. Prefer the _flc / _drc products.","IR: image persistence after exposure to bright sources; readout is up-the-ramp (several reads per exposure).","A channel-select mirror sends the light either to UVIS or to IR: no simultaneous exposures."] },
    acs:{ kind:"Survey camera",
      use:"Photographing large areas of the sky in visible light with great detail. Hubble's famous deep fields and the dark-matter maps of galaxy clusters owe a lot to this camera.",

      summary:"Installed in 2002 (SM3B). Its wide-field channel, WFC, was used for the large surveys (deep fields, galaxy clusters). An electronics failure in January 2007 took out WFC and HRC; WFC was repaired in 2009, HRC was not.",
      specs:[["WFC", "350–1100 nm · 2 2048×4096 CCDs · 15 µm pixels · 0.05″/px · 202″×202″"], ["SBC", "solar-blind far ultraviolet (1024×1024 MAMA) · 115–170 nm · ≈ 0.034″×0.030″/px · 34.6″×30.5″"], ["HRC", "29″×26″ · out of service since January 2007"]],
      filtersTitle:"WFC / SBC filters (selection)",
      products:[["_flt / _flc.fits","calibrated images without / with CTE correction"],["_drz / _drc.fits","AstroDrizzle combined products"],["Naming","IPPPSSOOT: “j” = ACS"]],
      example:{ title:"Structure of an ACS/WFC _flc product", caption:"Real extensions of a calibrated file; each CCD takes one set of extensions.", text:
"HDU 0  PRIMARY       global header (TELESCOP, INSTRUME='ACS', DETECTOR='WFC', FILTER1/2, EXPTIME …)\nHDU 1  SCI  (1)      CCD WFC2 · image in e⁻  (4096 × 2048)\nHDU 2  ERR  (1)      per-pixel uncertainty\nHDU 3  DQ   (1)      data-quality mask (bits)\nHDU 4  SCI  (2)      CCD WFC1 · image in e⁻  (4096 × 2048)\nHDU 5  ERR  (2)\nHDU 6  DQ   (2)" },
      code:{ title:"Retrieve ACS/WFC images (astroquery.mast)" },
      notes:["The two WFC CCDs are stored in separate extensions (SCI,1 and SCI,2).","As for WFC3/UVIS, the _flc / _drc products include the CTE correction."] },
    stis:{ kind:"Imaging spectrograph",
      use:"Splitting the light of an object into its colours, its spectrum, to learn its composition, temperature and speed. Its slit also shows how these properties change along an extended object, such as gas orbiting a black hole.",

      summary:"A long-slit spectrograph (up to 52″) installed in 1997, which failed in 2004 and was repaired in 2009 during SM4. It combines three detectors: two ultraviolet MAMAs and a CCD.",
      specs:[["FUV-MAMA", "115–170 nm · 0.025″/px · 25″×25″ field"], ["NUV-MAMA", "165–310 nm · 0.025″/px · 25″×25″ field"], ["CCD", "≈ 200–1030 nm · 0.05″/px · 52″×52″ field"], ["Spectral resolution", "R ≈ 500–1,440 (L gratings) · ≈ 4,900–17,400 (M) · ≈ 30,000–114,000 (echelles)"]],
      filtersTitle:"Gratings (nominal ranges)",
      products:[["_raw / _flt.fits","raw and calibrated exposures"],["_x1d.fits","extracted 1D spectrum (binary table)"],["_x2d.fits","rectified 2D spectrum (wavelength × position along the slit)"],["_crj.fits","combined CCD exposures with cosmic-ray rejection"]],
      example:{ title:"Columns of the _x1d table (one row per spectral order)", caption:"Real layout of STIS products; each cell holds an array of NELEM points.", text:
"SPORDER     spectral order\nNELEM       number of points in the spectrum\nWAVELENGTH  wavelength (Å)\nGROSS       gross count rate (c/s)\nBACKGROUND  estimated background (c/s)\nNET         net rate = GROSS − BACKGROUND\nFLUX        calibrated flux (erg/s/cm²/Å)\nERROR       uncertainty on FLUX\nDQ          data-quality flags" },
      code:{ title:"Retrieve STIS spectra (astroquery.mast)" },
      notes:["TIME-TAG mode is available for the MAMA detectors (event by event).","Power-supply failure in August 2004; returned to service during the SM4 mission (2009)."] },
    cos:{ kind:"UV spectrograph",
      use:"Collecting the ultraviolet spectrum of very faint sources, mostly distant quasars. Their light crosses the gas between galaxies, which leaves its imprint: COS reads these imprints to analyse this invisible gas.",

      summary:"A very sensitive slitless ultraviolet spectrograph, installed in 2009 (SM4) to study the intergalactic medium, quasars and the origin of the chemical elements.",
      specs:[["FUV channel", "≈ 90–215 nm · microchannel-plate detector (cross delay line readout)"], ["NUV channel", "≈ 165–320 nm · MAMA detector"], ["Aperture", "PSA, circular, Ø 2.5″ (slitless)"], ["Resolution", "R ≈ 1,500–4,000 (low) · ≈ 12,000–24,000 (medium)"]],
      filtersTitle:"Gratings (approximate nominal ranges)",
      products:[["_corrtag.fits","corrected photon-by-photon event list (TIME-TAG)"],["_x1d.fits / _x1dsum.fits","extracted 1D spectrum / sum of exposures"],["_flt.fits","calibrated image"]],
      example:{ title:"Columns of the _corrtag table (one row per photon)", caption:"Layout of TIME-TAG events; units indicative.", text:
"TIME        photon arrival time (s)\nRAWX, RAWY  raw position on the detector (pixels)\nXCORR, YCORR  corrected position (geometric distortion)\nXDOPP       position corrected for the orbital Doppler shift\nEPSILON     weight (efficiency / flat field)\nWAVELENGTH  assigned wavelength (Å)\nDQ          data-quality flags" },
      code:{ title:"Retrieve COS spectra (astroquery.mast)" },
      notes:["Slitless: the effective resolution depends on the angular size of the source.","TIME-TAG data let you re-slice the exposure time after the fact."] },
    fgs:{ kind:"Guiding and astrometry",
      use:"Keeping the telescope pointed perfectly still during exposures by tracking guide stars. Used as an instrument, it also measures star positions very precisely.",

      summary:"Three fine guidance sensors that lock the telescope onto guide stars (precision ≈ 1 mas). They also serve as a science instrument: high-precision astrometry and measurements of close binaries.",
      specs:[["Number", "3 (two for guiding, one used for science: FGS1R)"], ["Principle", "Koesters prism interferometers"], ["Astrometric precision", "≈ 1 mas (3 < V < 16.8) · parallaxes down to ≈ 0.2 mas"]],
      products:[["Archive","FGS (astrometry) data are available at MAST under the instrument “FGS”"]],
      notes:["The FGS delivered several Cepheid parallaxes before the Gaia era."], docs:["Hubble documentation (STScI)"] }
  }
};
EN_INST.jwst = {
  summary:"Four science instruments share the ISIM module, kept at very low temperature (≈ 40 K; ≈ 7 K for the MIRI detector), along with a fine guidance sensor. Together they cover 0.6 to 28.5 µm.",
  archives:[["MAST, JWST archive","JWST observations, calibration levels 1 to 3; programmatic access through astroquery.mast."],["ESA, JWST archive","European access to JWST data."],["JDox, documentation","User documentation for each instrument."],["Calibration pipeline","Calibration steps and data product formats."]],
  instruments:{
    nircam:{ kind:"Near-IR camera",
      use:"Photographing the sky in the near infrared, where the light of the very first galaxies arrives, stretched by the expansion of the Universe. It is Webb's main camera; it is also used to align its mirror.",

      summary:"JWST's main camera. Two identical modules observe the same field in two wavelength ranges at once, thanks to a dichroic. It also serves as the wavefront sensor used to align the 18 mirror segments.",
      specs:[["Range", "0.6–5.0 µm"], ["Short-wavelength channel (SW)", "0.6–2.3 µm · 0.031″/px"], ["Long-wavelength channel (LW)", "2.4–5.0 µm · 0.063″/px"], ["Field", "2 modules of 2.2′×2.2′ separated by ≈ 44″ · 9.7 arcmin² in total"], ["Detectors", "10 HgCdTe arrays, 2040×2040 active pixels (8 SW + 2 LW)"], ["Other modes", "coronagraphy · slitless spectroscopy (LW grism, R ≈ 1,600 at 4 µm) · time series"]],
      filtersTitle:"Filters (representative selection)",
      products:[["_uncal.fits","level 1b: raw, uncalibrated ramps"],["_rate.fits","level 2a: count rate per pixel"],["_cal.fits","level 2b: calibrated image (astrometry and photometry)"],["_i2d.fits","level 3: combined, resampled mosaic"],["_cat.ecsv","level 3: source catalogue"],["Naming","jwPPPPPOOOVVV_GGSAA_EEEEE_detector_suffix"]],
      example:{ title:"FITS header of a _cal product (excerpt)", caption:"Real keywords of JWST products; the values are an example." },
      code:{ title:"Retrieve NIRCam mosaics (astroquery.mast)" },
      notes:["The two channels (SW and LW) observe the same field at the same time: one exposure yields images in two filters.","The _i2d.fits files hold the SCI, ERR and WHT extensions and the WCS (astrometry) of the combined product."] },
    nirspec:{ kind:"Multi-object spectrograph",
      use:"Taking the spectra of many distant galaxies at once, to measure their distance and composition. Tiny shutters open only in front of the chosen targets.",

      summary:"A spectrograph supplied by ESA. Its micro-shutter array (MSA) can observe hundreds of galaxies at once. It also offers an integral field unit (IFU) and fixed slits.",
      specs:[["Range", "0.6–5.3 µm"], ["Resolution", "R ≈ 100 (prism) · ≈ 1,000 (M gratings) · ≈ 2,700 (H gratings)"], ["Multi-object (MSA)", "4 quadrants of 365×171 shutters of 0.20″×0.46″ · field ≈ 3.6′×3.4′"], ["IFU", "3″×3″ cut into 30 slices of 0.1″"], ["Fixed slits", "S200A1/A2, S400A1, S1600A1 (1.6″) and time-series mode (BOTS)"]],
      filtersTitle:"Dispersers (nominal ranges)",
      products:[["_cal.fits","level 2b: calibrated 2D image per slit or shutter"],["_s2d.fits","resampled 2D spectra"],["_x1d.fits","extracted 1D spectra (binary table)"],["_s3d.fits","IFU data cube (x, y, λ)"]],
      example:{ title:"Columns of an _x1d file (1D spectrum)", caption:"Real layout of the JWST product; one row per spectral pixel.", text:
"WAVELENGTH      wavelength (µm)\nFLUX            flux density (Jy)\nFLUX_ERROR      uncertainty on the flux\nFLUX_VAR_POISSON / _RNOISE / _FLAT   variance components\nSURF_BRIGHT     surface brightness (MJy/sr)\nDQ              data-quality flags\nBACKGROUND      subtracted background\nNPIXELS         number of pixels in the aperture" },
      code:{ title:"Retrieve NIRSpec spectra (astroquery.mast)" },
      notes:["An _x1d file can hold several sources (one spectrum per open MSA shutter).","MSA mode needs catalogues prepared with NIRCam to choose the sources."] },
    miri:{ kind:"Mid-IR imager and spectrograph",
      use:"Seeing the mid infrared, emitted by warm objects: dust, discs where planets form, galaxies hidden by their own dust. It must be much colder than the rest of the telescope so that its own heat does not blind it.",

      summary:"The only instrument working in the mid infrared, cooled to about 7 K by an active cryocooler. It observes warm dust, protoplanetary discs and distant, dust-enshrouded galaxies.",
      specs:[["Imager", "5.6–25.5 µm · 9 filters · 74″×113″ · 0.11″/px"], ["Medium-resolution spectrometer (MRS)", "4.9–27.9 µm · R ≈ 1,550–3,250 · 4 IFUs (3.7″ to 7.7″ across)"], ["Low-resolution spectrometer (LRS)", "≈ 5–14 µm · R ≈ 100 at 7.5 µm · 0.51″×4.7″ slit"], ["Coronagraphs", "3 four-quadrant phase masks (10.65, 11.4 and 15.5 µm; 24″×24″) · 1 Lyot mask (23 µm; 30″×30″)"], ["Temperature", "≈ 7 K (cryocooler)"]],
      filtersTitle:"Imaging filters and coronagraphs",
      products:[["_cal.fits","calibrated image (level 2b)"],["_i2d.fits","combined mosaic (level 3)"],["_s3d.fits","MRS cube (x, y, λ) per channel and sub-band"],["_x1d.fits","extracted 1D spectrum (MRS, LRS)"]],
      example:{ title:"Layout of an MRS cube (_s3d)", caption:"Real structure of the product; dimensions indicative.", text:
"HDU SCI       flux cube     (λ, y, x)   units MJy/sr\nHDU ERR       uncertainty   (λ, y, x)\nHDU DQ        quality       (λ, y, x)\nHDU WMAP      weight map\nWCS           3 axes: RA/Dec + wavelength (µm)\nchannels 1–4  4.9 → 28.8 µm  (each in 3 sub-bands A/B/C)" },
      code:{ title:"Retrieve MIRI images (astroquery.mast)" },
      notes:["At long wavelengths the background (zodiacal light, thermal emission) becomes large: subtracting it is a key processing step.","The cryocooler holds the detector at ≈ 7 K, far colder than the rest of ISIM (≈ 40 K)."] },
    niriss:{ kind:"Imager and slitless spectrograph",
      use:"Studying the atmospheres of exoplanets as they pass in front of their star, finding distant galaxies over wide fields, and separating objects very close to each other with a mask drilled with holes.",

      summary:"Supplied by the Canadian Space Agency. It specialises in spectra of transiting exoplanets (SOSS), wide-field slitless spectroscopy (WFSS) and aperture masking interferometry (AMI).",
      specs:[["Imaging", "0.6–5.0 µm · 2.2′×2.2′ · 0.066″/px"], ["WFSS", "0.8–2.2 µm · R ≈ 150 at 1.4 µm · 133″×133″ field"], ["SOSS", "0.6–2.8 µm · R ≈ 700 at 1.4 µm (single object, transits)"], ["AMI", "7-hole aperture mask · 2.8–4.8 µm (F277W, F380M, F430M, F480M)"]],
      filtersTitle:"Imaging filters",
      products:[["_cal.fits","calibrated images (imaging)"],["_x1d.fits","1D spectra (SOSS, WFSS)"],["_i2d.fits","mosaics (imaging)"]],
      example:{ title:"SOSS time series (exoplanet transit)", caption:"Typical structure of a SOSS observation; numbers indicative.", text:
"_calints.fits  one calibrated image per integration  (n_int, 256, 2048)\n_x1dints.fits  one 1D spectrum per integration       (n_int, n_λ)\norder 1: 0.85–2.8 µm  ·  order 2: 0.6–1.4 µm\n→ spectroscopic light curve = flux(λ) as a function of time" },
      code:{ title:"Retrieve NIRISS data (astroquery.mast)" },
      notes:["SOSS mode measures the transmission spectrum of an exoplanet's atmosphere during its transit."] },
    fgs:{ kind:"Fine guidance",
      use:"Finding guide stars and telling the telescope how to correct its pointing several times per second, so that images stay sharp.",

      summary:"The fine guidance sensor that locks the observatory onto guide stars to hold the pointing to a few milliarcseconds.",
      specs:[["Range", "0.6–5.0 µm"], ["Field", "2.3′×2.3′ per channel · ≈ 0.069″/px"], ["Detectors", "2 channels (Guider 1 and 2) · 2048×2048 HgCdTe (2040 active) · 18 µm pixels"]],
      products:[["Archive","guiding data are archived but are not a usual science product"]],
      notes:["It shares its housing with NIRISS, but works as part of the pointing control system."] }
  }
};
EN_INST.euclid = {
  summary:"Two instruments share the same 1.2 m telescope through a dichroic: VIS (visible) and NISP (near infrared). The first part of DR1, the first major release, came out on 12 November 2026 (the full release, with the cosmology products, is announced for mid-2027): about 1,900 deg² of the Wide Survey (14% of the goal), observed from spring 2024 to spring 2025, more than a billion objects. It adds to the Q1 “Quick Release” of March 2025, from which the examples on this page are taken.",
  archives:[["ESA, Euclid Science Archive","Official archive: catalogues (ADQL), images, spectra."],["Euclid DR1 (12 November 2026)","First major release: Wide and Deep surveys, more than a billion objects, spectra of more than 160 million sources."],["DR1 overview (arXiv:2611.16510)","Release overview paper: contents, coverage, data quality."],["NASA/IPAC, IRSA Euclid","NASA mirror: Q1 and DR1 mosaics and catalogues, spectra, VO services (TAP, SIA)."],["Product documentation (DPDD)","Data Product Description Document for Q1."],["astroquery.esa.euclid","Python access to the archive (TAP+)."]],
  instruments:{
    vis:{ kind:"Visible imager",
      use:"Photographing billions of galaxies sharply enough to measure their shapes. The small distortions these shapes share reveal the dark matter lying along the path of their light.",

      summary:"A camera built to measure galaxy shapes precisely (weak gravitational lensing). A single, very broad band, with no filter other than the dichroic.",
      specs:[["Band", "IE · 530–920 nm"], ["Detectors", "36 thinned e2v CCD273-84 (40 µm), in a 6×6 array"], ["Format", "4096×4132 px per CCD · 12 µm pixels · 4 quadrants, each read by its own node (144 channels)"], ["Mosaic", "≈ 609 Mpx · 0.1″/px sampling"], ["Field", "≈ 0.54 deg² · active area 0.775°×0.697°"], ["CCD temperature", "153 K"], ["Beam", "f/20 delivered by the telescope · 1.2 m pupil"]],
      filtersTitle:"Photometric band",
      products:[["Calibrated images","multi-extension FITS files per exposure (level 2)"],["MER mosaics","stacks per sky tile, including ground-based data"],["MER catalogue","master source table (VIS + NISP + ground)"],["Cutouts","cutout service in the web archive and in ESA Datalabs"]],
      example:{ title:"Real schema of the euclid_dr1_mer_catalogue_deep_survey table (excerpt)", caption:"Columns of the public DR1 table for the Deep Fields, queryable in ADQL on the IRSA mirror (the Wide Survey has its own table, euclid_dr1_mer_catalogue_wide_survey).", text:
"object_id            unique Euclid identifier of the source\nra, dec              position (degrees)\nflux_vis_2fwhm_aper  VIS flux in an aperture twice the full width at half maximum\nflux_h_2fwhm_aper    same measurement in the NISP H band\npoint_like_prob      probability that the source is point-like (a star)\nellipticity          ellipticity\nkron_radius          semi-major axis of the Kron aperture\nhas_spectrum         does the source have a NISP spectrum?\ntileid               sky tile the measurement comes from\n[≈ 480 columns, including fluxes from ground-based surveys (DECam, MegaCam, HSC…)]" },
      code:{ title:"Query the DR1 MER catalogue (astroquery, IRSA)" },
      notes:["The object_id identifier encodes the source position: negative declinations give negative identifiers.","DR1 splits the Wide Survey and the Deep Fields into separate tables; the Q1 quick release stays online alongside."],
      docs:["Euclid Consortium, VIS","DR1 overview"] },
    nisp:{ kind:"IR photometer and slitless spectrometer",
      use:"Measuring the infrared colours and spectra of millions of galaxies to find out how far away they are. Together with VIS, it maps the Universe in three dimensions over the last ten billion years.",

      summary:"It measures infrared colours (for photometric redshifts) and provides slitless grism spectroscopy, which gives the spectroscopic redshifts of millions of galaxies.",
      specs:[["Range", "0.95–2.02 µm"], ["Detectors", "16 HgCdTe H2RG arrays in 4×4 · 2040×2040 active px · 18 µm pixels"], ["Sampling", "0.3″/px · 0.57 deg² field"], ["Photometry", "3 filters: YE (0.95–1.21), JE (1.17–1.57), HE (1.52–2.02 µm)"], ["Spectroscopy", "blue grism (BG) 926–1366 nm, R > 400 · red grisms (RG) 1206–1892 nm, R > 480"], ["Mass and power", "≈ 85.3 kg (instrument) + 40.7 kg (warm electronics) · power capped at 200 W"], ["Temperature", "detectors ≈ 95 K · optics ≈ 135 K"]],
      filtersTitle:"Bands and grisms (nominal ranges)",
      products:[["NISP images","calibrated images per exposure and MER mosaics (Y, J, H)"],["SIR spectra","1D spectra (DataLink / SSA) and calibrated 2D images"],["SPE catalogue","spectroscopic redshifts, classification, lines and quality"],["PHZ catalogue","photometric redshifts and classification"]],
      example:{ title:"DR1 catalogues on the IRSA mirror (number of tables per product)", caption:"euclid_dr1_* tables queryable in ADQL, Wide Survey and Deep Fields together.", text:
"MER  (merged catalogue)         6 tables   Wide and Deep, with and without detailed photometry\nPHZ  (photometric redshifts)   4 tables   redshifts and classification\nSPE  (spectroscopy)            8 tables   redshifts, classification, lines, quality\n\nJoin: all tables share the key  object_id" },
      code:{ title:"List the DR1 tables (astroquery, IRSA)" },
      notes:["The spectroscopic quality tables give, for each source, the grism used (spe_grism) and the number of exposures taken with the red and blue grisms.","VIS and NISP receive light from the same field through the dichroic and can expose at the same time."],
      docs:["Euclid Consortium, instruments"] }
  }
};
EN_INST.roman = {
  summary:"Two instruments behind a 2.4 m telescope: a near-infrared wide-field camera (WFI), which also does slitless spectroscopy, and a demonstration coronagraph. Roman was launched on 30 August 2026; no science data are public yet, the first images being expected in early 2027. All data will be public as soon as they are processed.",
  archives:[["MAST, Roman archive","Official archive for the telescope's products (images, spectra, catalogues), at STScI."],["RomanDocs (STScI)","Documentation of the instruments, surveys and data products."],["Science Support Center (IPAC)","Coronagraph and survey support."]],
  instruments:{
    wfi:{ kind:"Wide-field IR imager and spectrometer",
      use:"Photographing, in a single exposure, a patch of sky larger than the full Moon with Hubble's sharpness. By repeating these exposures, Roman maps billions of galaxies for dark matter and dark energy, and follows millions of stars in the Galactic bulge to spot planets.",
      summary:"A 300-megapixel camera: 18 infrared detectors in a 6 × 3 mosaic, eight imaging filters, a grism and a prism for slitless spectroscopy.",
      specs:[["Detectors", "18 HgCdTe Teledyne H4RG-10 · 4096 × 4096 px · 10 µm pixels"], ["Mosaic", "6 × 3 detectors · ≈ 300 Mpx"], ["Sampling", "0.11″ per pixel"], ["Field", "0.8° × 0.4° · 0.281 deg² excluding gaps"], ["Imaging range", "0.48–2.3 µm, 8 filters"], ["Grism", "1.00–1.93 µm · R ≈ 461 × λ (µm)"], ["Prism", "0.75–1.80 µm · R from 80 to 180"], ["Detector temperature", "89.5 K"]],
      filtersTitle:"Filters and dispersers (centre ± half-width)",
      products:[["Level 1 (L1)","detector ramps, uncalibrated"],["Level 2 (L2)","calibrated image of each exposure"],["Level 3 (L3)","combination of the exposures of one visit"],["Level 4 (L4)","source catalogues per filter"],["Level 5 (L5)","community-contributed products"]],
      example:{ title:"Planned product levels for the WFI", caption:"Hierarchy announced by STScI; no science product has been released yet.", text:
"L1  detector ramps (successive reads, uncalibrated)\nL2  calibrated image of one exposure  → STScI RomanCal pipeline\nL3  combination of one visit\nL4  source catalogue, one per filter\nL5  community products\n\nDistribution: MAST · online analysis: Roman Research Nexus" },
      notes:["All data will be public, with no proprietary period, whether from the large community surveys or from general astrophysics programmes.","The very broad F146 filter is for the Galactic bulge survey: it collects as much light as possible to follow the brightness of millions of stars."],
      docs:["WFI, technical data (NASA)","RomanDocs, WFI"] },
    cgi:{ kind:"Coronagraphy demonstrator",
      use:"Blocking a star's light to see the planets and dust discs around it. It is a technology test, preparing a future telescope able to photograph Earth-like planets.",
      summary:"Demonstration instrument: coronagraph masks and deformable mirrors to dim starlight, with electron-multiplying detectors supplied by ESA.",
      specs:[["Status", "technology demonstration"], ["Range", "0.4–1.0 µm"], ["Masks", "hybrid Lyot and shaped pupil"], ["Beam", "collimated by the telescope, through five mirrors, one of them steerable"], ["Detectors", "EMCCDs (electron multiplying), supplied by ESA"]],
      notes:["Coronagraph observations are prepared by the Science Support Center, run by IPAC (Caltech) with the Laboratoire d'Astrophysique de Marseille.","The Coronagraph Technology Center, at the Jet Propulsion Laboratory (NASA), follows the technology demonstration together with the support center."],
      docs:["Coronagraph (IPAC)"] }
  }
};
EN_INST.kepler = {
  summary:"A single instrument: the photometer, a 0.95 m Schmidt telescope whose focal plane carries 42 CCDs. It did not take pictures in the usual sense: it measured the brightness of selected stars, every half hour, for years, looking for planetary transits.",
  archives:[["MAST, Kepler archive","Light curves and target pixel files, from 2009 to 2013, then those of K2."],["NASA Exoplanet Archive","Catalogues of Kepler Objects of Interest (KOI) and confirmed planets."]],
  instruments:{
    phot:{ name:"Photometer", full:"Wide-field photometer", kind:"Precision photometry",
      use:"Spotting planets that pass in front of their star, by measuring the brightness of more than 100,000 stars to within a few tens of parts per million, without interruption for years.",
      summary:"The Schmidt telescope forms an image on a curved focal plane of 21 modules of two CCDs; a sapphire lens on each module flattens the curved image. Each exposure lasts 6 s; they are summed on board in batches of 29.4 min (long cadence) or 58.85 s (short cadence, for a few hundred targets).",
      specs:[["Optics","Schmidt · 0.95 m corrector · 1.4 m primary · f/1.47"],["Field","115.6 deg² of active pixels · Ø 16.1°"],["Detectors","42 CCDs of 1044 × 2200 px of 27 µm, in 21 modules · 4 guide sensors"],["Pixels","3.98″"],["Range","420 to 900 nm"],["Exposures","6.02 s exposure, 0.52 s readout"],["Cadences","long: 29.4 min · short: 58.85 s"]],
      filtersTitle:"Band",
      products:[["Light curve (_llc.fits)","brightness of a star over a quarter, long cadence (SOC pipeline)"],["Short-cadence curve (_slc.fits)","the same at 58.85 s, for a few hundred targets"],["Target pixel files (_lpd-targ.fits)","small images around each star, at every cadence"],["KOI","planet candidates, at the NASA Exoplanet Archive"]],
      example:{ title:"Columns of a Kepler light curve (_llc.fits)", caption:"Real columns of the product; illustrative values.", text:
"TIME (BKJD)      SAP_FLUX (e⁻/s)   PDCSAP_FLUX (e⁻/s)   PDCSAP_FLUX_ERR   SAP_QUALITY\n352.37721        81024.6           81110.2               9.3               0\n352.39765        81019.8           81106.5               9.3               0\n\n→ one quarter ≈ 4,400 points, one every 29.4 min." },
      code:{ title:"Light curve with lightkurve" },
      notes:["Every three months Kepler rolled 90° to keep its panels facing the Sun: each star then moved to another CCD, hence the division of the data into quarters.","Four guide sensors, in the corners of the focal plane, are read out ten times a second to hold the pointing to within a few thousandths of an arcsecond."],
      docs:["Kepler Instrument Handbook","Launch press kit"] }
  }
};
EN_INST.tess = {
  summary:"A single instrument, in four copies: four identical wide-field cameras, mounted side by side to cover a 24° by 96° strip. They do not take pictures in the usual sense but measure, for weeks, the brightness of hundreds of thousands of stars, looking for planetary transits.",
  archives:[["MAST, TESS archive","Full-frame images, target pixel files and light curves, public without delay."],["ExoFOP-TESS","Planet candidates (TOI) and ground-based follow-up observations."],["TESS Science Support Center","Documentation, tools and sector calendar."]],
  instruments:{
    cams:{ name:"Cameras", full:"Four wide-field cameras", kind:"Wide-field photometry",
      use:"Spotting planets that pass in front of their star, by measuring its brightness every few minutes for weeks, for hundreds of thousands of nearby stars at once.",
      summary:"Each camera is a seven-lens f/1.4 objective in front of a mosaic of four CCDs. The 2 s exposures are summed on board: full images of the field every 30, 10 then 3 min 20 s depending on the year, and small images of selected targets every 2 min or 20 s.",
      specs:[["Optics","7 lenses · 10.5 cm entrance pupil · f/1.4"],["Field","24° × 24° per camera · 24° × 96° for all four"],["Detectors","4 CCID-80 CCDs per camera, 2048 × 2048 px of 15 µm, ≈ 2 mm apart"],["Pixels","≈ 21″"],["Range","600 to 1,000 nm, centred on the I_C band"],["Saturation","stars brighter than I_C ≈ 7.5"],["Cadences","full-frame images: 1,800 s, then 600 s, then 200 s · targets: 120 s or 20 s"]],
      filtersTitle:"Band",
      products:[["FFI (_ffic.fits)","calibrated full-frame image of one camera and CCD"],["TPF (_tp.fits)","small image of a target at each time step"],["Light curve (_lc.fits)","brightness of a star over time (SPOC pipeline)"],["TOI","planet candidates, followed up on ExoFOP-TESS"]],
      example:{ title:"Columns of a SPOC light curve (_lc.fits)", caption:"Real columns of the product; illustrative values.", text:
"TIME (BTJD)      SAP_FLUX (e⁻/s)   PDCSAP_FLUX (e⁻/s)   PDCSAP_FLUX_ERR   QUALITY\n1325.29723        24311.4           24402.9               5.1               0\n1325.29862        24305.8           24398.6               5.1               0\n\n→ PDCSAP_FLUX is corrected for instrumental effects; a transit carves a few thousandths out of the brightness." },
      code:{ title:"Light curve with lightkurve" },
      notes:["At each perigee, observing stops for a few hours to send down the data: light curves have a gap every 13.7 days.","The thruster firings that dump the reaction wheels' momentum leave small jumps in the light curves."],
      docs:["TESS Telescope Information","Observatory Guide"] }
  }
};
EN_INST.fermi = {
  summary:"Two complementary instruments. The LAT detects high-energy gamma rays, from 20 MeV to over 300 GeV, over a fifth of the sky at once. The GBM covers lower energies, from 8 keV to 40 MeV, over the whole sky not hidden by the Earth, and spots gamma-ray bursts. Like Chandra, Fermi counts photons one by one: its basic data are event lists.",
  archives:[["LAT Data Server (FSSC)","LAT photons and pointing history, by sky region, period and energy."],["4FGL-DR4 catalogue","7,194 gamma-ray sources detected in 14 years of LAT data."],["HEASARC, Fermi catalogues","Source and burst catalogues, GBM data."],["Fermitools","Analysis software for LAT data."]],
  instruments:{
    lat:{ kind:"Pair-conversion gamma-ray telescope",
      use:"Mapping the gamma-ray sky: pulsars, supernova remnants, active galactic nuclei whose jet points at us, and the diffuse glow of the Galaxy.",
      summary:"Sixteen identical towers, each a tracker above a calorimeter, surrounded by a shield of scintillators. The photon converts into an electron–positron pair in the tungsten; the pair's track gives its direction, the calorimeter its energy.",
      specs:[["Range","20 MeV to over 300 GeV"],["Field","2.4 sr at 1 GeV, ≈ 20% of the sky"],["Tracker","18 x–y silicon planes per tower · tungsten foils in the first 16"],["Calorimeter","96 CsI(Tl) crystals per tower in 8 layers · 8.6 radiation lengths"],["Energy resolution","≈ 4% at 5 GeV · ≈ 2% at 196 GeV (beam tests)"],["Timing","± 1.5 µs (GPS)"]],
      products:[["Photon file (_PH)","one event per photon: energy, direction, time, class"],["Pointing file (_SC)","history of the pointing and of the exposure time"],["4FGL-DR4","catalogue of 7,194 sources, 14 years of data"]],
      example:{ title:"Columns of a LAT photon file (excerpt)", caption:"Real structure of the photon files; illustrative values.", text:
"ENERGY (MeV)  RA (°)      DEC (°)   L (°)      B (°)     TIME (s)          EVENT_CLASS\n  1532.7      193.913     −5.770    305.137    57.046    2.4113051e+08     128\n   284.1      194.402     −6.120    306.182    56.712    2.4113104e+08     128\n\n→ one row per photon: maps, spectra and light curves are then built by grouping the photons." },
      code:{ title:"Preparing LAT data (Fermitools)" },
      notes:["The LAT does not point: it sweeps the whole sky in two orbits, about three hours. Each region is therefore revisited several times a day, which makes it possible to follow flares of active galactic nuclei."],
      docs:["Atwood et al. 2009","Data preparation"] },
    gbm:{ kind:"Gamma-ray burst monitor",
      use:"Watching for gamma-ray bursts, those flashes of a few seconds that come from the death of massive stars or the merger of neutron stars, and alerting other telescopes.",
      summary:"Fourteen scintillators facing every direction: twelve sodium iodide (NaI) crystals for low energies, two bismuth germanate (BGO) ones for high energies. The ratio of the signals between detectors gives the direction of the burst.",
      specs:[["Detectors","12 NaI (Ø 12.7 cm, 1.27 cm) · 2 BGO (Ø 12.7 cm, 12.7 cm)"],["Range","≈ 8 keV to 40 MeV: NaI up to ≈ 1 MeV, BGO above"],["Field","more than 8 sr, the whole sky not hidden by the Earth"],["Timing","better than 10 µs"],["On-board location","systematic error < 15°"],["Bursts","≈ 250 triggers a year"]],
      products:[["TTE","events timed one by one around a trigger"],["CTIME, CSPEC","continuous counts, at high time or spectral resolution"],["Burst catalogue","duration, flux and spectrum of each detected burst"]],
      code:{ title:"GBM burst catalogue (astroquery, HEASARC)" },
      notes:["On 17 August 2017, the GBM detected a short gamma-ray burst 1.7 s after the gravitational waves from the merger of two neutron stars (GW170817)."],
      docs:["Meegan et al. 2009","GBM instrument"] }
  }
};
EN_INST.xmm = {
  summary:"Six instruments observe at the same time. Behind each of the three X-ray telescopes, an EPIC camera: one pn camera and two MOS. Behind two of them, gratings send part of the X-rays to the two RGS spectrometers. Alongside, the small OM telescope sees the same field in visible and ultraviolet light.",
  archives:[["XMM-Newton Science Archive (XSA)","ESA archive: raw observation data (ODF) and pipeline products (PPS)."],["HEASARC, archive mirror","Copy of the data at NASA, with the xmmmaster observation table."],["SAS","Analysis software for XMM-Newton data."]],
  instruments:{
    epic:{ kind:"Imaging and spectroscopic CCD cameras",
      use:"Imaging the sky in X-rays while measuring the energy of each photon, with a large collecting area: for faint sources, galaxy clusters or the rapid variations of a neutron star.",
      summary:"Three cameras, one at the focus of each telescope: the pn camera, with 12 back-illuminated CCDs, and two MOS cameras with 7 CCDs, which receive only part of their telescope's light, the rest going to the RGS. Each photon is recorded with its position, time and energy.",
      specs:[["Range","0.15 to 12 keV"],["Field","30′ across"],["Pixels","MOS: 40 µm, 1.1″ · pn: 150 µm, 4.1″"],["Sharpness (FWHM / half-energy width)","MOS: 5″ / 14″ · pn: 6″ / 15″"],["Energy resolution","≈ 70 eV (MOS) · ≈ 80 eV (pn)"],["Time resolution","1.75 ms (MOS) · 0.03 ms (pn)"]],
      filtersTitle:"Energy bands of the pipeline products",
      products:[["ODF","raw observation data, to be processed with SAS"],["Event list (PIEVLI, MIEVLI)","each photon with position, time, energy"],["Band images (IMAGE_1000 to 5000)","pipeline images in five energy bands"],["Source list","sources detected in the field, with their fluxes"]],
      example:{ title:"An EPIC event list", caption:"Real columns of an event list; illustrative values.", text:
"TIME (s)          X (0.05″)   Y (0.05″)   PI (eV)   PATTERN   CCDNR\n2.5912447e+08     25812       26103       1284      0         4\n2.5912447e+08     26447       24920        612      2         7\n\n→ PATTERN tells how many neighbouring pixels the photon hit." },
      code:{ title:"Pipeline images of an observation (astroquery)" },
      notes:["The two MOS cameras receive only about half of their telescope's light: the other part is diverted by the gratings to the RGS.","Low-energy protons trapped around the Earth sometimes cause noise 'flares': those periods are removed from the data."],
      docs:["Users Handbook","The Telescopes of XMM-Newton"] },
    rgs:{ kind:"Grating spectrometer",
      use:"Splitting soft X-rays into a very fine spectrum, where the lines of carbon, nitrogen, oxygen, neon or iron appear: temperature, density and composition of hot gas.",
      summary:"Behind two of the three telescopes, a stack of reflection gratings intercepts part of the X-rays and disperses them by wavelength onto a row of CCDs. The two spectrometers are almost identical.",
      specs:[["Range","0.35 to 2.5 keV · 5 to 35 Å (order −1)"],["Field","≈ 5′"],["Resolution","0.04 Å / 0.025 Å (orders −1 / −2)"],["Pixels","81 µm, i.e. ≈ 0.009 Å"]],
      products:[["Spectra by order (SRSPEC)","source spectrum, orders 1 and 2, for each RGS"],["Fluxed spectrum (FLUXED)","RGS1 and RGS2 combined, in flux, for a first look"]],
      example:{ title:"Columns of a fluxed spectrum", caption:"Real columns of the product; illustrative values.", text:
"CHANNEL (Å)   FLUX (photons/s/cm²/Å)   ERROR\n18.962        0.0712                   0.0021\n18.998        0.0284                   0.0013\n\n→ here, the edge of the oxygen O VIII line, at 18.97 Å." },
      notes:["The pipeline's fluxed spectrum is a quick look; an analysis uses the per-order spectra, with their response matrix.","A few CCDs have been out of service since early in the mission, hence gaps in each RGS spectrum."],
      docs:["Users Handbook"] },
    om:{ name:"OM", full:"Optical Monitor", kind:"Visible and ultraviolet telescope",
      use:"Seeing the same objects as the X-ray cameras, at the same moment, in visible and ultraviolet light: to link what happens in both domains, or to identify the stars and galaxies in the field.",
      summary:"A 30 cm Ritchey-Chrétien telescope, with a filter wheel (three visible, three ultraviolet filters) and two grisms. Its detector amplifies each photon and measures its position.",
      specs:[["Aperture","30 cm"],["Range","180 to 600 nm"],["Field","17′"],["Sharpness","1.4″ to 2.0″"],["Pixels","0.48″"],["Sensitivity","magnitude 20.7 in 1,000 s (5σ)"]],
      filtersTitle:"Filters",
      products:[["Sky images (SIMAGE)","images of each exposure, registered on the sky"],["Source list (OBSMLI)","detected sources, with their magnitudes"]],
      notes:["The OM always watches the same field as the X-ray cameras, at the same time: no extra observing time is needed.","On the wavelength axis, the filter bands are approximate; their central wavelengths are given alongside."],
      docs:["Users Handbook"] }
  }
};
EN_INST.spitzer = {
  summary:"Three instruments shared the focal plane, in a helium-cooled chamber behind the primary mirror: IRAC, a four-channel camera in the near and mid infrared, IRS, a spectrograph from 5 to 38 µm, and MIPS, a far-infrared photometer reaching 160 µm. After the helium ran out in 2009, only IRAC's two shortest channels kept working.",
  archives:[["Spitzer Heritage Archive (IRSA)","Every observation of the mission, raw and processed data, at IRSA (Caltech/IPAC)."],["Spitzer Enhanced Imaging Products","Uniform IRAC and MIPS 24 µm mosaics over the whole mission, and the source catalogue drawn from them."],["Spitzer documentation","Instrument and telescope handbooks, at IRSA."]],
  instruments:{
    irac:{ kind:"Near- and mid-infrared camera",
      use:"Photographing distant galaxies, clouds where stars are born and transiting exoplanets, through the dust that blocks visible light.",
      summary:"Four channels imaged at the same time on two adjacent fields: dichroic beamsplitters send 3.6 and 5.8 µm to one, 4.5 and 8.0 µm to the other. Each channel has its own 256 × 256 pixel array.",
      specs:[["Channels","3.6 · 4.5 · 5.8 · 8.0 µm"],["Detectors","InSb (3.6 and 4.5 µm) · Si:As (5.8 and 8.0 µm) · 256 × 256 px"],["Pixels","1.2″"],["Field","5.2′ × 5.2′ per channel, two adjacent fields"],["Warm mission (2009–2020)","3.6 and 4.5 µm only"]],
      filtersTitle:"Channels",
      products:[["BCD (_bcd.fits)","calibrated image of a single exposure, in MJy/sr"],["PBCD (_maic.fits)","mosaic of one observation, assembled by the pipeline"],["SEIP","uniform mosaics of the whole mission and a source catalogue (Spitzer Enhanced Imaging Products)"]],
      example:{ title:"FITS header of an IRAC BCD image (excerpt)", caption:"Real keywords of Spitzer products; the values are an example." },
      code:{ title:"Querying IRSA with astroquery" },
      notes:["During the warm mission, the 3.6 µm detector was used to follow transiting exoplanets with very high stability: this is how it tracked the planets of the TRAPPIST-1 system in 2016 and 2017."],
      docs:["Spitzer Telescope Handbook"] },
    irs:{ kind:"Mid-infrared spectrograph",
      use:"Splitting infrared light into a spectrum, to read the make-up of dust, ices and molecules around young stars and in galaxies.",
      summary:"Four modules, each with its own 128 × 128 pixel array: two low-resolution long-slit modules (SL and LL) and two high-resolution echelle modules (SH and LH). Two small imaging windows (“peak-up”) were used to centre the source in the slit.",
      specs:[["Modules","SL 5.2–14.5 µm · LL 14.0–38.0 µm (R ≈ 64–128) · SH 9.9–19.6 µm · LH 18.7–37.2 µm (R ≈ 600)"],["Slits","SL 3.7″ × 57″ · LL 10.6″ × 168″ · SH 4.7″ × 11.3″ · LH 11.1″ × 22.3″"],["Detectors","128 × 128 px per module"],["Centring imager","13.3–18.7 µm and 18.5–26.0 µm, 1′ × 1.2′ field"],["Warm mission","out of service"]],
      products:[["BCD (_bcd.fits)","calibrated 2D spectral image"],["_spect.tbl","extracted spectrum, wavelength and flux (Jy)"]],
      docs:["Spitzer Telescope Handbook"] },
    mips:{ kind:"Far-infrared photometer",
      use:"Measuring the heat of cold dust: discs around stars, galaxies forming stars at a furious pace, interstellar clouds.",
      summary:"Three arrays: Si:As at 24 µm, gallium-doped germanium at 70 µm and stressed germanium at 160 µm. A small moving mirror scanned the sky across the detectors; a spectral mode (SED) also gave a coarse spectrum from 55 to 95 µm.",
      specs:[["Bands","24 µm (21.5–26.2) · 70 µm (62.5–81.5) · 160 µm (139.5–174.5)"],["Detectors","Si:As 128 × 128 · Ge:Ga 32 × 32 · stressed Ge:Ga"],["Pixels","2.55″ · 5.2″ or 9.98″ · 16–18″"],["Field","5.4′ × 5.4′ · 5.2′ × 2.6′ · 0.53′ × 5.33′"],["SED mode","55–95 µm, R ≈ 15–25"],["Warm mission","out of service"]],
      filtersTitle:"Bands",
      products:[["BCD (_bcd.fits)","calibrated image of a single exposure"],["PBCD (_maic.fits)","mosaic of one observation"],["SEIP","uniform 24 µm mosaics (Spitzer Enhanced Imaging Products)"]],
      docs:["Spitzer Telescope Handbook"] }
  }
};
EN_INST.chandra = {
  summary:"Two cameras take turns at the focus, 10 m behind the mirrors: ACIS, a CCD mosaic that also measures the energy of each photon, and HRC, a microchannel-plate camera for the sharpest images. Two transmission gratings, HETG and LETG, can be moved in behind the mirrors to spread the X-rays into very detailed spectra. Chandra counts photons one by one: its basic data are event lists (position, time, energy), not images.",
  archives:[["Chandra Data Archive (ChaSeR)","Search and download of observations, at the Chandra X-ray Center."],["Chandra Source Catalog 2.1","Catalogue of 407,806 X-ray sources, from public observations up to the end of 2021."],["CIAO","Analysis software for Chandra data."],["HEASARC","NASA's high-energy archive, which also gives access to Chandra."]],
  instruments:{
    acis:{ kind:"Imaging and spectroscopic CCD camera",
      use:"Photographing the sky in X-rays while measuring the energy of each photon. This gives both the image of a supernova remnant or a galaxy cluster and the chemical make-up and temperature of its gas.",
      summary:"Ten CCDs in two arrays: ACIS-I, a 2 × 2 square for imaging, and ACIS-S, a row of six, which also reads out the HETG spectra. Every photon is recorded with its position, time and energy.",
      specs:[["Detectors","10 CCDs: ACIS-I (4) and ACIS-S (6, 2 of them back-illuminated)"],["Pixels","24 µm · 0.492″"],["Field","ACIS-I 16.9′ × 16.9′ · ACIS-S 8.3′ × 50.6′"],["Range (efficiency > 30%)","0.8–8 keV (front-illuminated) · 0.3–8 keV (back-illuminated)"],["Frame time","3.2 s (0.2 to 10 s possible)"],["Effective area","110 cm² at 0.5 keV · 600 cm² at 1.5 keV · 40 cm² at 8 keV"]],
      products:[["evt1","level 1 event list: every photon with position, time, energy"],["evt2","level 2 event list, filtered and ready for analysis"],["CSC catalogue","sources detected over all public observations (407,806 in release 2.1)"]],
      example:{ title:"An event list (evt2)", caption:"Real structure of an ACIS evt2 file; illustrative values.", text:
"time (s)          ccd_id  chipx  chipy     x (px)     y (px)   energy (eV)  grade\n6.4218302e+08     7       512    430       4096.3     4110.8    1520.4       0\n6.4218302e+08     7       233    871       4241.9     4372.1     684.2       2\n6.4218303e+08     6       901    112       3870.5     3922.6    6421.7       0\n\n→ one line per photon; the image and spectrum are then built by grouping the events." },
      code:{ title:"Analysis with CIAO" },
      notes:["The telescope gently wobbles in a Lissajous pattern (dither) during the exposure, to spread the image over many pixels; each photon's position is corrected afterwards.","A contaminant layer on the ACIS filter slowly reduces the sensitivity at low energies; it is tracked by the calibration."],
      docs:["About Chandra (characteristics)","Proposers' Observatory Guide"] },
    hrc:{ kind:"Microchannel-plate camera",
      use:"Taking the sharpest X-ray images and timing each photon to a few microseconds, for instance to follow the fast spin of a pulsar.",
      summary:"Two microchannel-plate detectors: HRC-I, for wide-field imaging, and HRC-S, an elongated strip that reads out the LETG spectra. Very poor energy resolution, but great sharpness and very fine timing.",
      specs:[["Detectors","HRC-I (imaging) · HRC-S (spectroscopy with LETG)"],["Field","HRC-I ≈ 30′ × 30′ · HRC-S 6′ × 90′"],["Resolution","≈ 0.4″ full width at half maximum"],["Range","0.08–10 keV"],["Energy resolution","E/ΔE ≈ 1 at 1 keV"],["Timing","16 µs"],["Status in 2026","HRC-I in service · HRC-S halted since October 2025 (high-voltage current-limiter trips)"]],
      products:[["evt1 / evt2","event lists: position and time of each photon"]],
      notes:["Exposures with HRC are limited to 14.5 ks in one go, for thermal reasons."],
      docs:["About Chandra (characteristics)"] },
    hetg:{ kind:"High-energy spectroscopy grating",
      use:"Splitting X-rays into a very fine spectrum showing the lines of each chemical element: this measures the temperature, density and speed of the gas around stars and black holes.",
      summary:"A set of gold transmission gratings moved in just behind the mirrors. Two families of gratings (HEG and MEG) disperse the light in two directions 10° apart; the spectrum is read by ACIS-S.",
      specs:[["Gratings","HEG (high energy) and MEG (medium energy), dispersions 10° apart"],["HEG","0.8–10 keV (15–1.2 Å) · E/ΔE from 65 to 1,070"],["MEG","0.4–5 keV (31–2.5 Å) · E/ΔE from 80 to 970"],["Readout","ACIS-S"],["Effective area (HEG + MEG)","59 cm² at 1 keV · 200 cm² at 1.5 keV"]],
      products:[["pha2","spectra by diffraction order, extracted from the evt2"]],
      docs:["About Chandra (characteristics)"] },
    letg:{ kind:"Low-energy spectroscopy grating",
      use:"Getting the most detailed X-ray spectra at low energies, for instance to study the very hot atmospheres of stars or the gas between galaxies.",
      summary:"A transmission grating moved in behind the mirrors, read out by HRC-S or ACIS-S. It is Chandra's highest-resolution instrument at low energies.",
      specs:[["Range","1.7–170 Å (0.07–7.3 keV) with HRC-S · 1.4–63 Å with ACIS-S"],["Resolving power","≥ 1,000 between 50 and 160 Å"],["Readout","HRC-S or ACIS-S"],["Status in 2026","readout by HRC-S interrupted since October 2025"]],
      products:[["pha2","spectra by diffraction order"]],
      docs:["About Chandra (characteristics)"] }
  }
};
EN_INST.gaia = {
  summary:"Gaia has no separate instruments in the usual sense. A single focal plane of 106 CCDs, shared by the two telescopes, performs three functions that read the same stream of light as the spacecraft scans the sky.",
  archives:[["ESA, Gaia Archive","Official archive: ADQL queries on Gaia DR3, downloads, XP and RVS spectra."],["Gaia DR3 documentation","Full description of the catalogue and its tables."],["VizieR, Gaia DR3 (I/355)","CDS access to the catalogue."],["astroquery.gaia","Python access to the archive."]],
  instruments:{
    astro:{ kind:"Astrometry and G photometry",
      use:"Measuring star positions with extreme precision, many times over several years. This gives their distance, through parallax, and their motion through the Galaxy.",

      summary:"The sky mapper (SM) detects objects in real time; the astrometric field (AF) then measures their positions to a few tens of microarcseconds. Together they also give the white-light G magnitude.",
      specs:[["Detectors", "SM: 14 CCDs (7 per telescope) · AF: 62 CCDs"], ["Pixels", "4500×1966 px per CCD · 10 µm × 30 µm"], ["Readout mode", "TDI: integration synchronised with the spin (4.42 s per CCD)"], ["G band", "≈ 330–1050 nm (white light)"], ["Magnitudes observed", "G ≈ 3 to ≈ 21"], ["Parallax precision (DR3)", "≈ 0.02–0.03 mas (G < 15) · 0.07 mas (G = 17) · 0.5 mas (G = 20) · 1.3 mas (G = 21)"]],
      filtersTitle:"Photometric band",
      products:[["gaia_source","master table: astrometry, photometry, parameters, radial velocities (≈ 1.8 billion sources in DR3)"],["Astrometry","5 or 6 parameters: position, parallax, proper motion (± pseudo-colour)"],["RUWE","quality indicator of the astrometric fit (≈ 1 expected)"]],
      example:{ title:"Excerpt from gaia_source, well-known stars", caption:"Values as published (Gaia EDR3 astrometry and photometry, identical in DR3). Epoch 2016.0.", text:
"source_id             ra (°)       dec (°)       parallax (mas)    G (mag)  BP−RP  RUWE\n5853498713190525696   217.392321   −62.676075    768.067 ± 0.050   8.985    3.805  0.97   Proxima Cen\n5250032958818831360   146.311593   −62.507867      1.984 ± 0.110   3.471    1.503  2.39   ℓ Car\n5351161399793209984   161.136160   −57.565357      0.553 ± 0.017   7.338    1.511  0.92   VY Car\n5240441472232302848   165.566881   −64.262893      0.378 ± 0.014   8.941    1.549  1.07   XY Car\n\n→ ℓ Car (a very bright star) has a RUWE of 2.39: an astrometric solution to treat with caution." },
      code:{ title:"ADQL query (astroquery.gaia)" },
      notes:["Proxima Centauri (parallax 768 mas, i.e. 1.30 pc) is the nearest star to the Sun.","A RUWE well above 1.4 usually signals a poor fit (unresolved binary, extended source)."],
      docs:["Gaia DR3 documentation"] },
    bprp:{ kind:"Low-resolution spectrophotometry",
      use:"Measuring the colour of every star observed from a very coarse spectrum. This gives its temperature and the amount of dust dimming it.",

      summary:"Two prisms spread the light of each star into a very low-resolution spectrum, blue (BP) and red (RP), which gives colours, temperature and extinction.",
      specs:[["BP", "330–680 nm · 7 CCDs"], ["RP", "640–1050 nm · 7 CCDs"], ["Dispersion", "prisms: 3–27 nm/px (BP) · 7–15 nm/px (RP)"], ["XP spectra published (DR3)", "≈ 219 million"]],
      filtersTitle:"Photometric bands",
      products:[["phot_bp_mean_mag / phot_rp_mean_mag","magnitudes in gaia_source"],["XP continuous / sampled","XP spectra: basis coefficients (continuous) or sampled"]],
      example:{ title:"Continuous representation of an XP spectrum", caption:"Structure of the product; the values are not reproduced here.", text:
"source_id           identifier\nbp_n_parameters     number of BP coefficients\nbp_coefficients[]   coefficients of the expansion on a set of basis functions\nbp_coefficient_errors[]\n(same for RP)\n→ the spectrum is rebuilt with GaiaXPy (any sampling)" },
      code:{ title:"BP − RP colour (ADQL)" },
      notes:["The BP − RP difference is a colour index: the larger it is, the redder the star (Proxima: 3.8)."],
      docs:["Gaia DR3 documentation"] },
    rvs:{ kind:"Slitless spectrometer",
      use:"Measuring how fast stars are moving towards or away from us. Added to their drift across the sky, this speed gives their full motion through space.",

      summary:"A slitless spectrometer centred on the ionised calcium (Ca II) triplet. It uses the Doppler effect to measure the radial velocities of tens of millions of stars.",
      specs:[["Range", "845–872 nm (Ca II triplet)"], ["Resolution", "R ≈ 11,700"], ["Detectors", "12 CCDs"], ["Radial velocities (DR3)", "≈ 33.8 million stars · ≈ 1 million mean RVS spectra"]],
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
  "CCD, basse résolution":"CCD, low resolution", "échelle FUV, R ≈ 45 000":"FUV echelle, R ≈ 45,000", "échelle FUV, R ≈ 45 800":"FUV echelle, R ≈ 45,800", "FUV, basse résolution":"FUV, low resolution", "FUV, moyenne résolution":"FUV, medium resolution",
  "NUV, moyenne résolution":"NUV, medium resolution", "NUV, basse résolution":"NUV, low resolution", "H₂ 2,12 µm":"H₂ 2.12 µm", "H₂ 4,7 µm":"H₂ 4.7 µm", "très large":"extra wide", "R ≈ 1 000 / 2 700":"R ≈ 1,000 / 2,700",
  "imagerie":"imaging", "bande PAH 7,7 µm":"7.7 µm PAH band", "bande PAH 11,3 µm":"11.3 µm PAH band", "coronographe":"coronagraph", "bande large unique":"single broad band", "photométrie":"photometry",
  "grisme bleu":"blue grism", "grismes rouges":"red grisms", "lumière blanche (SM + AF)":"white light (SM + AF)",
  "bande bleue":"blue band", "bande rouge":"red band", "triplet du Ca II":"Ca II triplet",
  "ouverture PSA (Ø 2,5″)":"PSA aperture (Ø 2.5″)", "3,6 µm":"3.6 µm", "4,5 µm":"4.5 µm", "5,8 µm":"5.8 µm", "8,0 µm":"8.0 µm", "3,6 et 5,8 µm":"3.6 and 5.8 µm", "4,5 et 8,0 µm":"4.5 and 8.0 µm", "24 µm":"24 µm", "Ge:Ga contraint":"stressed Ge:Ga", "GBM, un détecteur NaI":"GBM, one NaI detector", "caméra 1":"camera 1", "0,2–0,5 keV":"0.2–0.5 keV", "0,5–1 keV":"0.5–1 keV", "1–2 keV":"1–2 keV", "2–4,5 keV":"2–4.5 keV", "4,5–12 keV":"4.5–12 keV", "bande large, sans filtre":"broad band, no filter", "champ":"field", "caméra 2":"camera 2", "caméra 3":"camera 3", "caméra 4":"camera 4", "bande large, centrée sur I_C":"broad band, centred on I_C", "0,6–5,3 µm":"0.6–5.3 µm", "0,6–5,0 µm":"0.6–5.0 µm", "Imageur":"Imager", "bande G":"G band", "Champ d'un télescope":"Field of one telescope"
};
var EN_CODE = [["# produits du pipeline (PPS) d'une observation de Cassiopée A, depuis l'archive XSA","# pipeline products (PPS) of a Cassiopeia A observation, from the XSA archive"],["# un trimestre de longue cadence du pipeline Kepler, téléchargé depuis MAST","# one quarter of long-cadence data from the Kepler pipeline, downloaded from MAST"],["# courbes de lumière à 2 min du pipeline SPOC, téléchargées depuis MAST","# 2-min light curves from the SPOC pipeline, downloaded from MAST"],["# photons et pointage téléchargés depuis le LAT Data Server","# photons and pointing downloaded from the LAT Data Server"],["# un sursaut par ligne : nom, position, durée T90 (s), fluence","# one burst per row: name, position, T90 duration (s), fluence"],["# images des Spitzer Enhanced Imaging Products (IRAC et MIPS 24 µm)","# images from the Spitzer Enhanced Imaging Products (IRAC and MIPS 24 µm)"],["# catalogue de sources tiré des mêmes mosaïques","# source catalogue drawn from the same mosaics"],["# télécharge les données d'une observation","# downloads the data of one observation"],["# retraitement standard (nouvel evt2)","# standard reprocessing (new evt2)"],["# écrit dans ./mastDownload/","# written to ./mastDownload/"],["# exemple : champ quelconque","# example: any field"],["# exemple : Hubble Ultra Deep Field","# example: Hubble Ultra Deep Field"],
  ["# exemple : hôte d'exoplanète en transit","# example: host of a transiting exoplanet"],["# exemple : quasar brillant","# example: bright quasar"],["# exemple : amas SMACS 0723","# example: cluster SMACS 0723"],
  ["# ex. q1.mer_catalogue, …","# e.g. q1.mer_catalogue, …"],["# ≤ 2000 lignes ; launch_job_async au-delà","# ≤ 2000 rows; use launch_job_async beyond that"]];
EN_INST.swift = {
  summary:"Three telescopes working in relay. BAT, with its wide field, detects the gamma-ray burst and locates it to a few arcminutes; the spacecraft slews; the XRT, in X-rays, and the UVOT, in ultraviolet and visible light, refine the position and follow the afterglow. The positions reach the ground within seconds, so that other telescopes can take over.",
  archives:[["HEASARC, Swift archive","All observations from the three instruments, public as soon as they are processed."],["UK Swift Science Data Centre","XRT light curves and spectra of bursts, the 2SXPS catalogue, online tools."],["MAST, UVOT images","UVOT images and catalogues."],["HEASoft","Analysis software for Swift data (batgrbproduct, xrtpipeline, uvotsource…)."]],
  instruments:{
    bat:{ kind:"Coded-mask hard X-ray telescope",
      use:"Detecting gamma-ray bursts over a sixth of the sky, locating them in about twenty seconds and triggering the spacecraft slew; between bursts, surveying the sky in hard X-rays.",
      summary:"No mirror, useless at these energies: a mask of randomly placed lead tiles, half open, casts its shadow onto a plane of cadmium zinc telluride detectors. The shift of the shadow gives the direction of the source.",
      specs:[["Range","15 to 150 keV in imaging · response up to 500 keV"],["Field","1.4 sr half-coded, 100° × 60°"],["Mask","≈ 54,000 lead tiles of 5 × 5 × 1 mm · 2.7 m² · 1 m above the detectors"],["Detectors","32,768 CZT of 4 × 4 × 2 mm · 5,200 cm² · 256 modules"],["Localisation","1 to 4′ in about twenty seconds"],["Energy resolution","≈ 7 keV"]],
      products:[["Events","each photon with its time, energy and the detector hit, around a trigger"],["Light curves, spectra","standard products for each burst (batgrbproduct)"],["157-month survey","catalogue of the sources of the hard X-ray sky"]],
      example:{ title:"The quantities of a burst in the BAT catalogue", caption:"Typical columns of a burst catalogue; illustrative values.", text:
"BURST        RA (°)    DEC (°)   ERROR (′)    T90 (s)   FLUENCE 15–150 keV (erg/cm²)\nGRB YYMMDDA  189.06    +28.98    3.0           0.07      9.5e-09\nGRB YYMMDDB  148.89    +18.15    2.1           10.3      5.9e-07\n\n→ T90: the time during which 90% of the photons arrive; the name gives the date of the burst (year, month, day)." },
      code:{ title:"Swift burst catalogue (astroquery, HEASARC)" },
      notes:["A coded mask does not form an image directly: the sky image is rebuilt by computation, comparing the recorded shadow with the known mask pattern.","BAT triggers on board, without the ground: this is what let Swift slew in about a minute."],
      docs:["Barthelmy et al. 2005","BAT description"] },
    xrt:{ kind:"Grazing-incidence X-ray telescope, CCD camera",
      use:"Refining the position of a burst to a few arcseconds and following, for days, the decline of its X-ray afterglow.",
      summary:"Wolter I mirrors, spares from the JET-X mission, focus X-rays onto a CCD camera cooled to about −100 °C, 3.5 m away. Each photon is recorded with its position, time and energy.",
      specs:[["Range","0.2 to 10 keV"],["Optics","Wolter I (JET-X) · 3.5 m focal length"],["Effective area","110 cm² at 1.5 keV"],["Sharpness","18″ (half-energy) at 1.5 keV"],["Field","23.6′ × 23.6′"],["Detector","CCD-22 of 600 × 600 px of 40 µm, 2.36″"],["Energy resolution","≈ 140 eV at 6 keV at launch"]],
      products:[["Event lists","photon-counting (images) and windowed timing (bright sources) modes"],["Burst light curves","produced automatically by the UK data centre"],["2SXPS","catalogue of X-ray sources across Swift's field"]],
      example:{ title:"XRT light curve of an afterglow", caption:"Typical shape published by the data centre; illustrative values.", text:
"T − T0 (s)    FLUX 0.3–10 keV (erg/cm²/s)\n   95         3.1e-09\n 1000         2.4e-11\n10000         4.0e-12\n\n→ the flux decays as a power law, often with a plateau between a few hundred and a few thousand seconds." },
      code:{ title:"Processing an XRT observation (HEASoft)" },
      notes:["When the source is very bright, several photons land on the same pixel during one readout and merge (pile-up): the camera then switches to windowed timing mode, one dimension only but read out very fast."],
      docs:["XRT description"] },
    uvot:{ kind:"Ultraviolet and visible telescope, photon counting",
      use:"Finding the visible or ultraviolet counterpart of a burst, to better than an arcsecond; measuring its colour, and hence estimating its distance when ultraviolet light is absorbed on the way.",
      summary:"A 30 cm Ritchey-Chrétien telescope, co-aligned with the XRT. Its detector, a microchannel plate in front of a CCD, counts photons one by one; a wheel holds ultraviolet and visible filters, a clear plate and two grisms.",
      specs:[["Optics","modified Ritchey-Chrétien · 30 cm · f/12.7"],["Range","170 to 600 nm"],["Field","17′ × 17′"],["Detector","intensified CCD, 256 × 256 elements, 2,048 × 2,048 px after centroiding, 0.502″"],["Sharpness","≈ 2.5″ (FWHM)"],["Sensitivity","B ≈ 22.3 in white light in 1,000 s"]],
      filtersTitle:"Filters (centre and FWHM, Poole et al. 2008)",
      products:[["Images (sk)","sky images per filter, in celestial coordinates"],["Events","a mode that keeps each photon and its time, for the first minutes of a burst"],["UVOTSSC catalogue","sources from all the images"]],
      notes:["Because the detector counts photons one by one, a bright source sometimes sends several during one readout, counted as one: photometry corrects for this coincidence loss."],
      docs:["Swift Technical Handbook, UVOT","Poole et al. 2008"] }
  }
};
EN_INST.integral = {
  summary:"Four instruments aligned on the same direction. SPI, the spectrometer, and IBIS, the imager, cover gamma rays from 15 keV to 10 MeV; the two JEM-X units see X-rays from 3 to 35 keV and the OMC camera visible light. The three high-energy instruments form their image with a coded mask.",
  archives:[["INTEGRAL Science Data Centre (ISDC)","Data centre, in Geneva: archive, OSA analysis software, catalogues."],["ESA, INTEGRAL archive","ESA archive at ESAC."],["HEASARC, INTEGRAL","Copy of the data and catalogues at NASA."]],
  instruments:{
    spi:{ kind:"Germanium gamma-ray spectrometer, coded mask",
      use:"Measuring the energy of gamma-ray lines very finely: radioactive elements made by supernovae, such as aluminium-26 or titanium-44, and the 511 keV line of positron annihilation at the centre of the Galaxy.",
      summary:"19 germanium detectors, cooled to 85 K, under a coded mask, all surrounded by an active shield that rejects particles and photons coming from the side. Its energy resolution is unmatched; its image, however, remains coarse, to 2.5°.",
      specs:[["Range","20 keV to 8 MeV"],["Detectors","19 germanium crystals at 85 K · 500 cm²"],["Field","16° fully coded"],["Angular resolution","2.5° (point source)"],["Energy resolution","2.3 keV at 1.3 MeV"],["Prime contractor","CNES"]],
      products:[["Events","each photon with its time, energy and the detector hit"],["Spectra","obtained by deconvolution with the mask response (OSA software)"]],
      notes:["SPI's mask gives only a coarse image: SPI is built for spectroscopy, IBIS for imaging."],
      docs:["Instrument characteristics (ISDC)"] },
    ibis:{ kind:"Coded-mask gamma-ray imager",
      use:"Locating and following sources of hard X-rays and gamma rays: black holes and neutron stars in the Galaxy, active galactic nuclei, gamma-ray bursts.",
      summary:"A coded mask above two detector planes: ISGRI, 16,384 cadmium telluride crystals, for low energies; PICsIT, 4,096 caesium iodide crystals, for high energies. Photons that cross the first and stop in the second also give their direction through the Compton effect.",
      specs:[["Range","15 keV to 10 MeV"],["ISGRI","16,384 CdTe · 2,600 cm²"],["PICsIT","4,096 CsI · 3,100 cm²"],["Field","9° fully coded"],["Angular resolution","12′"],["Energy resolution","9 keV at 100 keV"]],
      products:[["Mosaic images","sky maps per energy band, assembled over many pointings"],["IBIS source catalogue","sources detected by ISGRI over the whole mission"]],
      notes:["INTEGRAL observed in 'dithering' mode: small successive shifts of the pointing, which help separate sources from the background in a coded-mask image."],
      docs:["Instrument characteristics (ISDC)"] },
    jemx:{ kind:"Two coded-mask X-ray monitors",
      use:"Seeing the same sources in softer X-rays, to extend their spectrum to low energies and follow their outbursts.",
      summary:"Two identical units, each a coded mask above a microstrip gas proportional counter (xenon and methane).",
      specs:[["Range","3 to 35 keV"],["Detector","microstrip counter, xenon and methane at 1.5 bar"],["Field","4.8° fully coded"],["Angular resolution","3′"],["Energy resolution","1.2 keV at 10 keV"]],
      products:[["Images and spectra","per pointing, with the OSA software"]],
      docs:["Instrument characteristics (ISDC)"] },
    omc:{ kind:"Optical camera, V-band photometry",
      use:"Measuring the visible brightness of the sources observed in gamma rays, at the same time: for variable stars, novae or active galactic nuclei.",
      summary:"Lens optics in front of a CCD, with a V filter.",
      specs:[["Range","V filter, 500 to 600 nm"],["Field","5° × 5°"],["Detector","CCD of 2,061 × 1,056 px, image area of 1,024 × 1,024 px"]],
      products:[["Light curves","V magnitude of each monitored source"]],
      docs:["Instrument characteristics (ISDC)"] }
  }
};
EN_INST.cheops = {
  summary:"A single instrument: a 32 cm telescope and a CCD. CHEOPS does not take images in the usual sense: for hours it measures the brightness of a star already known to host a planet, to see the planet pass and deduce its size.",
  archives:[["CHEOPS Archive","The mission archive, at the University of Geneva: light curves and images."],["CHEOPS at ESA","The mission's science pages, guest observers programme."]],
  instruments:{
    phot:{ name:"CHEOPS", full:"CHEOPS Instrument System", kind:"Very high precision photometer",
      use:"Measuring the radius of planets through the depth of their transit in front of bright stars, and following the eclipses and phase variations of hot giant planets.",
      summary:"An on-axis 32 cm Ritchey-Chrétien telescope and a single frame-transfer CCD, held stable to a few thousandths of a degree. The star's image is deliberately defocused over hundreds of pixels so that the measurement does not depend on the defects of one pixel.",
      specs:[["Optics","Ritchey-Chrétien · 320 mm primary · f/8.4"],["Detector","CCD47-20, 1024 × 1024 px of 13 µm · 1″ per pixel"],["Field","0.32°"],["Range","0.4 to 1.1 µm"],["CCD temperature","228 K, stable to 10 mK"],["Precision","15.5 ppm in 6 h (stars 6 ≤ V ≤ 9) · 75 ppm in 3 h (V ≤ 12)"]],
      products:[["Imagettes","small images of 25 px radius around the star, at each exposure"],["Windows","images 200 px across, co-added on board over at most 60 s"],["Light curves","produced by the University of Geneva pipeline"]],
      notes:["CHEOPS is in low orbit: the Earth regularly hides the star and the scattered light varies along the orbit. Its light curves therefore have periodic gaps, every 98.7 minutes."],
      docs:["Benz et al. 2021"] }
  }
};
EN_INST.herschel = {
  summary:"Three instruments at the focus of the same telescope, inside the cryostat. HIFI splits the radiation into an extremely fine spectrum; PACS and SPIRE are both cameras and spectrometers, PACS at the shorter wavelengths, SPIRE at the longer ones.",
  archives:[["Herschel Science Archive","ESA archive: all observations, public."],["IRSA, Herschel","Copy of the data and catalogues at IPAC (NASA)."]],
  instruments:{
    hifi:{ kind:"Heterodyne spectrometer",
      use:"Measuring the velocity and composition of cold gas: lines of water, carbon monoxide and many molecules, in the clouds where stars are born and in comets.",
      summary:"Like a radio receiver: the sky signal is mixed with that of a local oscillator, and the difference, at a lower frequency, is analysed by spectrometers. A single pixel on the sky, but a resolving power of about a million.",
      specs:[["Range","157 to 212 µm and 240 to 625 µm"],["Resolving power","≈ 10⁶"],["Field","a single pixel on the sky"]],
      products:[["Spectra","one spectrum per position and band, HIPE pipeline"]],
      docs:["Pilbratt et al. 2010"] },
    pacs:{ kind:"Camera and grating spectrometer",
      use:"Imaging the warm dust of galaxies and star-forming regions, and getting spectra of gas lines from them.",
      summary:"A bolometer camera that observes in two bands at once (70 or 100 µm, and 160 µm), and an integral-field spectrometer of 5 × 5 pixels.",
      specs:[["Photometer","60–85 or 85–130 µm and 130–210 µm (bands centred at 70, 100 and 160 µm)"],["Spectrometer","55 to 210 µm · R ≈ 1,000 to 4,000 · 47″ × 47″ field"]],
      products:[["Maps","images in each band, levels 2 and 2.5"],["Spectral cubes","spectra of each pixel of the field"]],
      docs:["Pilbratt et al. 2010"] },
    spire:{ kind:"Camera and Fourier-transform spectrometer",
      use:"Mapping the cold dust, at a few tens of kelvin, in the clouds of our Galaxy and in distant galaxies forming many stars.",
      summary:"A photometer that observes at 250, 350 and 500 µm at once, and a Fourier-transform spectrometer that covers the whole range in one go.",
      specs:[["Photometer","250, 350 and 500 µm · 4′ × 8′ field"],["Spectrometer","194–324 and 316–671 µm · R ≈ 370 to 1,300 · 2.6′ field"]],
      products:[["Maps","images in the three bands"],["Spectra","spectra of each spectrometer detector"]],
      docs:["Pilbratt et al. 2010"] }
  }
};
EN_INST.planck = {
  summary:"Two instruments at the focus of the same telescope. LFI, with radio receivers, covers the low frequencies; HFI, with bolometers cooled to 0.1 K, the high ones. Together, nine bands from 30 to 857 GHz: enough to separate the cosmic microwave background from the Galaxy's emissions, which change with frequency.",
  archives:[["Planck Legacy Archive","ESA archive: sky maps, catalogues, cosmological products."],["IRSA, Planck","Copy of the maps and catalogues at IPAC (NASA)."]],
  instruments:{
    lfi:{ kind:"Radiometers at 20 K",
      use:"Mapping the sky at low frequencies, where the Galaxy's emissions dominate: radiation from electrons in the magnetic field and from ionised gas. Essential to remove them from the maps of the background.",
      summary:"22 radio receivers with amplifiers, cooled to 20 K, which compare the sky with a reference load.",
      specs:[["Frequencies","30, 44 and 70 GHz (centres 28.4, 44.1 and 70.4 GHz)"],["Detectors","22 radio receivers at 20 K"],["Resolution","32.3′, 27.9′ and 13.1′"]],
      products:[["Maps","whole-sky maps per frequency, in intensity and polarisation"]],
      docs:["Planck 2018 results. I"] },
    hfi:{ kind:"Bolometers at 0.1 K",
      use:"Measuring the cosmic microwave background where it is brightest, and the Galaxy's dust at the highest frequencies.",
      summary:"52 bolometers, thermometers so sensitive that they measure the heating caused by the absorbed radiation, cooled to 0.1 K by a dilution of helium-3 in helium-4.",
      specs:[["Frequencies","100, 143, 217, 353, 545 and 857 GHz"],["Detectors","52 bolometers at 0.1 K"],["Resolution","from 9.7′ at 100 GHz to 4.2′ at 857 GHz"],["End of survey","14 January 2012"]],
      products:[["Maps","whole-sky maps per frequency"],["CMB map","separated from the foregrounds by several methods"]],
      docs:["Planck 2018 results. I"] }
  }
};
EN_INST.cgro = {
  summary:"Four instruments sharing six decades of energy, from 20 keV to 30 GeV. BATSE watched the whole sky for bursts; OSSE, COMPTEL and EGRET each observed part of the sky, from the lowest energies to the highest.",
  archives:[["HEASARC, CGRO archive","Data and catalogues of the four instruments."]],
  instruments:{
    batse:{ kind:"All-sky burst monitor",
      use:"Detecting gamma-ray bursts over the whole sky and measuring their distribution: uniform, it showed that they come from very far away.",
      summary:"Eight modules at the corners of the spacecraft, facing the eight faces of an octahedron; each carries a large detector and a spectroscopy detector.",
      specs:[["Range","20 keV to 1 MeV"],["Field","whole sky not hidden by the Earth"],["Effective area","1,000 cm² at 30 keV, per module"],["Localisation","≈ 3° for a strong burst"],["Bursts","≈ 2,700 detected"]],
      products:[["Burst catalogue","duration, fluence and position of each burst"]],
      code:{ title:"BATSE burst catalogue (astroquery, HEASARC)" },
      docs:["Instrument characteristics"] },
    osse:{ kind:"Scintillation spectrometer",
      use:"Measuring the gamma-ray spectrum of selected sources: the Galactic Centre, the positron annihilation line, active galactic nuclei.",
      summary:"Four scintillators in collimators, which point at a 3.8° × 11.4° region and can pivot.",
      specs:[["Range","0.05 to 10 MeV"],["Field","3.8° × 11.4° (FWHM)"],["Effective area","2,013 cm² at 0.2 MeV"],["Energy resolution","12% at 0.2 MeV · 4% at 5 MeV"]],
      products:[["Spectra","spectra of each pointing"]],
      docs:["Instrument characteristics"] },
    comptel:{ kind:"Compton telescope",
      use:"Mapping the gamma-ray sky from 1 to 30 MeV, in particular the aluminium-26 line, a tracer of recent massive stars in the Galaxy.",
      summary:"Two stages of detectors: the photon scatters off an electron in the first (Compton effect) and is then absorbed in the second. The energies and positions measured in both give a circle of possible directions.",
      specs:[["Range","0.8 to 30 MeV"],["Field","≈ 1 sr"],["Angular resolution","0.5° to 1° (90%)"],["Energy resolution","8.8% at 1.27 MeV"]],
      products:[["Sky maps","per energy band and for the aluminium-26 line"]],
      docs:["Instrument characteristics"] },
    egret:{ kind:"Spark-chamber gamma-ray telescope",
      use:"Mapping the high-energy gamma-ray sky: pulsars, the plane of the Galaxy, and active galactic nuclei whose jet points at us.",
      summary:"A spark chamber where the photon converts into an electron–positron pair, whose tracks give the direction, above a calorimeter that measures the energy.",
      specs:[["Range","30 MeV to 10 GeV"],["Effective area","1,200 cm² at 100 MeV"],["Field","≈ 0.6 sr"],["Energy resolution","≈ 20%"],["Sources","271 in its first survey above 100 MeV"]],
      products:[["3EG catalogue","sources detected by EGRET"]],
      docs:["Instrument characteristics"] }
  }
};
EN_INST.wmap = {
  summary:"A single instrument: two back-to-back telescopes feeding 20 horns and as many differential radiometers, spread over five bands from 23 to 94 GHz. Each radiometer measures the temperature difference between two points of the sky.",
  archives:[["LAMBDA (NASA)","Sky maps, power spectra and cosmological parameters from the nine years."]],
  instruments:{
    rad:{ name:"Radiometers", full:"WMAP differential radiometers", kind:"Differential radiometers, five bands",
      use:"Mapping the temperature variations and polarisation of the cosmic microwave background over the whole sky, and deducing the age, composition and geometry of the Universe.",
      summary:"20 horns, 10 behind each telescope, feed radiometers that constantly compare the two pointing directions. The low bands are used mainly to remove the Galaxy's emission.",
      specs:[["Bands","K 23 · Ka 33 · Q 41 · V 61 · W 94 GHz"],["Resolution","52.8′ (K), 39.6′ (Ka), 30.6′ (Q), 21′ (V), 13.2′ (W)"],["Radiometers","2 (K), 2 (Ka), 4 (Q), 4 (V), 8 (W)"],["Sensitivity","variations of a millionth of a degree"]],
      products:[["Maps","whole sky per band, intensity and polarisation, nine years"],["ILC map","combination of the bands that isolates the CMB"],["Power spectrum","amplitude of the variations by angular size"]],
      docs:["LAMBDA, WMAP data"] }
  }
};
