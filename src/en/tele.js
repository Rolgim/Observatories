/* English text for the observatory sheets and clickable parts (applied over src/data-tele.js by src/i18n.js). */
var EN_TELE = {
  hubble:{
    agency:'NASA / ESA', launch:'Launched 24 April 1990, Space Shuttle Discovery (STS-31)',
    sub:'Low Earth orbit, ultraviolet, visible, near infrared', src:'Model: NASA VTAD, via Gaia Sky',
    cmp:{ tag:'13.2 m', dim:'13.2 m long' },
    desc:"The first of NASA's Great Observatories, Hubble has circled the Earth since 1990. Five Space Shuttle missions repaired and upgraded it in orbit: almost all of its current instruments date from those visits. Its silver tube houses a Ritchey-Chrétien telescope and a bay of replaceable instruments.",
    sourceNote:"Model created by NASA Visualization Technology Applications and Development (VTAD), distributed with Gaia Sky. The original file is split by texture; it has been re-cut here into physical parts so that a click picks the right piece.",
refs:{ gyro:'NASA to Change How It Points Hubble Space Telescope (release 2024-023, 4 June 2024)', reg:'Hubble\'s orbit is decaying (25 February 2026)' },
    sections:[
      { title:'Spacecraft', rows:[['Length','13.2 m'],['Maximum diameter','4.3 m'],['Mass','≈ 10,800 kg at launch · ≈ 12,200 kg after the last servicing mission'],['Servicing missions','5 (1993, 1997, 1999, 2002, 2009)'],['Pointing','on 1 gyroscope since June 2024; 3 of the 6 still working']] },
      { title:'Optics', rows:[['Design','Ritchey-Chrétien'],['Primary mirror','2.4 m · 828 kg'],['Secondary mirror','0.3 m · 12.4 kg'],['Focal length','57.6 m'],['Focal ratio','f/24'],['Pointing accuracy','0.007″']] },
      { title:'Active instruments', rows:[['WFC3','wide-field camera, ultraviolet to near infrared'],['ACS','survey camera'],['STIS','imaging spectrograph'],['COS','ultraviolet spectrograph'],['FGS','fine guidance sensors']] },
      { title:'Orbit', rows:[['Altitude','≈ 480 km'],['Trend','below 500 km in 2026 and falling; re-entry possible from 2028 without a reboost'],['Inclination','28.5°'],['Period','≈ 95 min'],['Speed','≈ 27,000 km/h']] },
      { title:'Power and data', rows:[['Solar arrays','2 panels of 7.54 × 2.44 m, gallium arsenide'],['Power','≈ 5,500 W in sunlight'],['Batteries','6, nickel-hydrogen'],['Link','S band, relayed by the TDRS satellites']] }
    ],
    parts:{
      door:{ name:'Aperture door and light shield', desc:"The entrance to the telescope. The door closes automatically if the line of sight strays too close to the Sun, to protect the optics. Behind it, the light shield blocks stray light from the Earth and the Moon.", facts:["Closes by itself if the line of sight nears the Sun"] },
      ota:{ name:'Forward shell (secondary mirror)', desc:"The tube that extends the telescope forward. It holds the internal baffles and, inside, the 0.3 m secondary mirror, held in front of the primary by a structure that barely reacts to temperature.", facts:["Secondary mirror: 0.3 m", "4.9 m from the primary mirror", "Internal baffles against stray light"] },
      ssm:{ name:'Equipment section', desc:"The ring of bays around the telescope. It holds the flight computers, the batteries, the reaction wheels that turn the spacecraft and the communications equipment. The doors open so that astronauts could swap the units.", facts:["4 reaction wheels", "6 nickel-hydrogen batteries, in two modules of 3"] },
      aft:{ name:'Aft shroud (instruments)', desc:"The widest section. The 2.4 m primary mirror sits just ahead of it; behind the mirror, at the focus, are the science instruments, in axial bays, and four radial bays holding WFC3 and the three fine guidance sensors. The yellow handrails were for the astronauts.", facts:["Primary mirror: 2.4 m, 828 kg", "4 radial bays: WFC3 and the 3 Fine Guidance Sensors", "The other instruments sit in the axial bays"] },
      array_stbd:{ name:'Solar array (+V2)', desc:"One of the two rigid gallium-arsenide solar wings fitted in 2002. Smaller than the original flexible arrays, they nevertheless produce more power and shake less at each day–night crossing.", facts:["7.54 × 2.44 m", "Gallium arsenide", "Rigid panels, fitted in 2002 (SM3B)"] },
      array_port:{ name:'Solar array (−V2)', desc:"The second solar wing, identical to the first. Both rotate about their mast to stay face-on to the Sun whatever direction the telescope is pointing.", facts:["7.54 × 2.44 m", "≈ 5,500 W for both arrays"] },
      hga_top:{ name:'High-gain antenna', desc:"A steerable dish at the end of a mast. Hubble does not talk to the ground directly: it sends its data to the TDRS relay satellites in geostationary orbit, which pass them on to White Sands, New Mexico.", facts:["Two high-gain antennas", "Relayed through the TDRS satellites"] },
      hga_bottom:{ name:'High-gain antenna (second)', desc:"The second dish, on the opposite side. Two antennas keep a relay satellite in view whatever the telescope's orientation.", facts:["Redundancy and coverage"] }
    }
  },
  jwst:{
    agency:'NASA / ESA / CSA', launch:'Launched 25 December 2021, Ariane 5, Kourou',
    sub:'Lagrange point L2, near and mid infrared', src:'Model: NASA 3D Resources (public domain)',
    cmp:{ tag:'21.2 × 14.2 m', dim:'21.2 × 14.2 m (sunshield)' },
    desc:"Built for the infrared, Webb has to stay very cold so that it is not blinded by its own heat. A five-layer sunshield the size of a tennis court splits the observatory in two: a hot side facing the Sun, and a cold side at about −233 °C that holds the mirror and the instruments.",
    sourceNote:"Official model published by NASA (NASA 3D Resources). The parts are identified from the file's materials and their position; the pinkish tint on the underside of the sunshield is that of the real doped-silicon coating.",
refs:{ hz:'JPL Horizons ephemerides (object -170), measured on this site' },
    sections:[
      { title:'Spacecraft', rows:[['Sunshield','21.197 × 14.162 m'],['Launch mass','≈ 6,200 kg'],['Mission duration','5 to 10 years planned'],['Propellant','for more than 20 years']] },
      { title:'Optics', rows:[['Design','three-mirror anastigmat (Korsch)'],['Primary mirror','6.5 m · 18 hexagonal segments of 1.32 m · gold-coated beryllium'],['Collecting area','25.44 m² (measured)'],['Secondary mirror','0.738 m, 7.17 m from the primary'],['Focal length','131.4 m · f/20'],['Wavelength range','0.6 to 28.5 µm'],['Resolution','≈ 0.1″']] },
      { title:'Thermal', rows:[['Cold side','≈ −233 °C; telescope and instruments near 40 K'],['MIRI detectors','< 7 K (cryocooler)'],['Hot side','≈ 85 °C'],['Sunshield','5 layers of aluminised Kapton · 0.05 mm (layer 1), 0.025 mm (the others)']] },
      { title:'Instruments', rows:[['NIRCam','near-infrared camera'],['NIRSpec','multi-object spectrograph (ESA)'],['MIRI','mid-infrared imager and spectrograph'],['NIRISS / FGS','imager, slitless spectrograph and guider (CSA)']] },
      { title:'Orbit and communications', rows:[['Location','halo orbit around L2, ≈ 1.5 million km away'],['Halo period','≈ 175 days'],['Science link','Ka band, up to 28 Mbit/s'],['Volume','up to 57 GB per day · 68 GB recorder']] }
    ],
    parts:{
      primary:{ name:'Primary mirror', desc:"Eighteen hexagons of beryllium, a light metal that stays stable in the cold, coated with 100 nanometres of gold, which reflects infrared light very well. Seven actuators position each segment to the nanometre so that together they behave as a single mirror.", facts:["18 segments of 1.32 m (flat to flat)", "≈ 20 kg of beryllium per segment", "Gold: 100 nm thick", "25.44 m² of collecting area"] },
      secondary:{ name:'Secondary mirror and tripod', desc:"A 74 cm convex mirror held in front of the primary by three long struts that unfolded after launch. It sends the collected light back towards the opening at the centre of the primary mirror.", facts:["Convex mirror, 0.738 m", "Radius of curvature: 1.779 m"] },
      aos:{ name:'Aft optics subsystem (AOS)', desc:"The black tower at the centre of the mirror. It holds the tertiary mirror, which corrects the image, and the small fine steering mirror, which cancels the observatory's tiny motions several times a second.", facts:["Concave tertiary mirror, 728 × 517 mm", "Fine steering mirror, flat"] },
      isim:{ name:'Instrument module (ISIM)', desc:"Behind the mirror, the structure that carries the four science instruments. It sits at about 40 K in the shadow of the sunshield; MIRI, which observes at longer wavelengths, is cooled to 7 K by a helium refrigerator.", facts:["Telescope at ≈ −233 °C (40 K)", "MIRI at ≈ −266 °C (7 K)"] },
      sunshield:{ name:'Sunshield', desc:"Five sheets of aluminised Kapton, thinner than a hair, separated by vacuum. Each layer is colder than the one before, and the heat escapes sideways. The two Sun-facing layers carry a doped-silicon coating, hence their pinkish tint.", facts:["21.197 × 14.162 m", "5 layers of aluminised Kapton", "Layer 1: 0.05 mm; others: 0.025 mm"] },
      flap:{ name:'Momentum flap', desc:"Sunlight pressing on the large sunshield slowly turns the observatory. This flap at the back balances that push, which saves the propellant needed to unload the reaction wheels.", facts:["Offsets solar radiation pressure"] },
      tower:{ name:'Deployable tower', desc:"A telescoping mast that lifted the telescope a little over a metre above the spacecraft bus after launch. The gap leaves room for the sunshield to unfold and isolates the cold side from the warm equipment.", facts:["1.2 m extension"] },
      bus:{ name:'Spacecraft bus', desc:"The hot side. This carbon-composite box, always in sunlight, holds the flight computer, the reaction wheels, the tanks and thrusters, the power system and the compressor of MIRI's refrigerator.", facts:["Close to room temperature", "Propulsion, pointing, computing, power"] },
      solar:{ name:'Solar array', desc:"Five hinged panels, unfolded half an hour after launch. Because Webb always keeps its back to the Sun, the array is fixed: it is lit all the time.", facts:["5 panels, 6 m long", "≈ 2 kW, for ≈ 1 kW used"] },
      hga:{ name:'High-gain antenna', desc:"Under the bus, facing the Earth. The small Ka-band dish sends the science data to the Deep Space Network during two daily contacts; a smaller S-band antenna handles commanding.", facts:["Ka band, up to 28 Mbit/s", "Up to 57 GB per day"] }
    }
  },
  euclid:{
    agency:'ESA (with NASA)', launch:'Launched 1 July 2023, Falcon 9, Cape Canaveral',
    sub:'Lagrange point L2, visible and near infrared', src:'Model: ESA SciFleet, via Gaia Sky',
    cmp:{ tag:'4.8 m', dim:'4.8 m tall, Ø 3.74 m' },
    desc:"Euclid is mapping a third of the sky to understand dark energy and dark matter. In a single exposure its telescope sees a field more than twice the size of the full Moon, almost as sharply as Hubble. It measures the shapes and distances of billions of galaxies.",
    sourceNote:"Model by ESA's SciFleet team, distributed with Gaia Sky. The original file is a single block: it has been re-cut here into six assemblies from their geometry.",
refs:{ hz:'JPL Horizons ephemerides (object -680), measured on this site' },
    sections:[
      { title:'Spacecraft', rows:[['Height','≈ 4.8 m'],['Diameter','≈ 3.74 m'],['Launch mass','1,988 kg'],['Nominal mission','≈ 6 years'],['Prime contractor','Thales Alenia Space; payload by Airbus']] },
      { title:'Optics', rows:[['Design','three-mirror Korsch'],['Primary mirror','1.2 m · silicon carbide'],['Focal length','24.5 m · f/20.4'],['Common field','≈ 0.54 deg²'],['Temperature','≈ 126 K (primary mirror) · 130 to 135 K (baseplate)']] },
      { title:'VIS (visible)', rows:[['Detectors','36 CCDs of 4132 × 4096 px (6 × 6) · ≈ 609 Mpx'],['Band','530–920 nm'],['Sampling','0.1″ per pixel'],['CCD temperature','153 K']] },
      { title:'NISP (near infrared)', rows:[['Detectors','16 H2RG arrays of 2048 × 2048 px (4 × 4)'],['Photometry','Y 950–1212 nm · J 1168–1567 nm · H 1522–2021 nm'],['Spectroscopy','blue grism 926–1366 nm (R ≳ 400) · red grism 1206–1892 nm (R ≳ 480)'],['Sampling','0.298″ per pixel'],['Detector temperature','≈ 95 K']] },
      { title:'Orbit and data', rows:[['Location','halo orbit around L2, amplitude ≈ 1 million km'],['Halo period','≈ 170 days'],['Survey','≈ 14,000 deg² in ≈ 6 years · deep fields 53 deg²'],['Science link','K band, 55 Mbit/s, 4 h per day'],['Volume','≈ 826 Gbit compressed per day'],['DR1, first part','12 November 2026 · ≈ 1,900 deg² · more than a billion objects']] }
    ],
    parts:{
      sunshield:{ name:'Sunshield and solar panels', desc:"The large panel that always faces the Sun. It carries the solar cells on its lit side and keeps the whole telescope in shadow, which the thermal stability of the images depends on.", facts:["Carries the photovoltaic panels", "Keeps the telescope in shadow"] },
      baffle:{ name:'Telescope and external baffle', desc:"The insulated cylinder around the telescope. Inside, the mirrors and their structure are made entirely of silicon carbide, a ceramic that hardly changes shape when the temperature varies.", facts:["1.2 m primary mirror", "Mirrors and structure in silicon carbide", "≈ 126 K at the primary mirror"] },
      instr:{ name:'Instrument bay (VIS and NISP)', desc:"Under the telescope, the baseplate that carries the two instruments. A dichroic plate splits the light: the visible goes to VIS, the infrared passes through to NISP. Both therefore observe exactly the same field at the same time. The radiators shed heat to space.", facts:["VIS: 36 CCDs, ≈ 609 Mpx", "NISP: 16 infrared detectors", "Dichroic plate at the exit pupil"] },
      svm:{ name:'Service module', desc:"The platform: computers, tanks, the instruments' warm electronics and the pointing system. Cold-nitrogen micro-thrusters hold the line of sight steady to a few hundredths of an arcsecond during exposures.", facts:["Cold-gas micro-thrusters (nitrogen)", "Fine guidance sensor in the focal plane, beside VIS"] },
      hga:{ name:'High-gain antenna', desc:"The steerable K-band dish, which sends the compressed images to ESA's 35 m ground stations for about four hours every day.", facts:["Steerable 0.7 m antenna, K band (25.5 to 27 GHz)", "55 Mbit/s, 4 h of contact per day", "≈ 826 Gbit compressed per day"] },
      adapter:{ name:'Launch vehicle adapter ring', desc:"The ring by which the spacecraft was attached to the top of the Falcon 9 rocket. It has no use after separation.", facts:["Interface with Falcon 9"] }
    }
  },
  roman:{
    agency:'NASA (with ESA, JAXA and CNES)', launch:'Launched 30 August 2026, Falcon Heavy, Kennedy',
    sub:'Lagrange point L2, wide-field near infrared', src:'Model: NASA 3D Resources (2015 design)',
    cmp:{ tag:'> 12 m', dim:'more than 12 m tall, deployed' },
    desc:"Roman has the same 2.4 m mirror as Hubble, but a field of view at least a hundred times larger. Launched to L2 on 30 August 2026, it is to map dark matter, measure the expansion of the Universe with thousands of supernovae and find thousands of exoplanets by microlensing towards the centre of the Galaxy. Its first public images are expected in early 2027.",
    sourceNote:"NASA model (NASA 3D Resources repository) showing the 2015 design ('AFTA'): the telescope that flew differs in several details, notably its soft aperture cover and hexagonal barrel. It is scaled to the 2.4 m primary mirror and has been re-cut here into seven assemblies from its geometry and materials.",
    refs:{ data:'Roman: Delivering Data That Unlocks Discovery (newsletter, 2026)', wfi:'Roman WFI Technical (performance, v1.4, March 2026)' },
    sections:[
      { title:'Spacecraft', rows:[['Height, deployed','more than 12 m'],['Launch mass','≈ 10,500 kg with propellant (2021 estimate)'],['Spacecraft bus','≈ 4 m × 2 m · 3,800 kg'],['Mission','5 years, 10-year goal'],['Launch','30 August 2026, Falcon Heavy, Kennedy (pad 39A)']] },
      { title:'Optics', rows:[['Design','three-mirror anastigmat'],['Primary mirror','2.4 m · effective aperture 2.36 m · donated by another federal agency'],['Central obscuration','30.3% of the diameter'],['Beam to the WFI','f/7.9'],['Mirror temperature','≈ 265 K']] },
      { title:'WFI (wide field)', rows:[['Detectors','18 HgCdTe H4RG-10 of 4096 × 4096 px · 10 µm pixels · ≈ 300 Mpx'],['Sampling','0.11″ per pixel'],['Field','0.8° × 0.4° · 0.281 deg² excluding gaps'],['Range','0.48–2.3 µm, 8 filters'],['Spectroscopy','grism 1.00–1.93 µm (R ≈ 461 λ/µm) · prism 0.75–1.80 µm (R 80 to 180)'],['Detector temperature','89.5 K']] },
      { title:'Coronagraph', rows:[['Role','technology demonstration: seeing planets next to bright stars'],['Range','0.4–1.0 µm'],['Masks','hybrid Lyot and shaped pupil'],['Detectors','EMCCDs supplied by ESA']] },
      { title:'Orbit and data', rows:[['Location','halo orbit around L2, period ≈ 6 months'],['Pointing','between 54° and 126° from the Sun'],['Science link','Ka band, up to 500 Mbit/s'],['Volume','≈ 1.4 TB per day'],['Stations','White Sands (NASA), New Norcia (ESA), JAXA'],['Data','public as soon as processed, no proprietary period']] }
    ],
    parts:{
      sass:{ name:'Solar array sunshield', desc:"The large panel facing the Sun. It carries the solar cells and, at the same time, keeps the telescope and instruments in shadow, which limits stray light and stabilises their temperature.", facts:["Six panels: two fixed, four deployable", "≈ 4,500 W at end of life"] },
      barrel:{ name:'Barrel and light shade', desc:"The long enclosure around the telescope, cut at an angle at the front. It protects the optics from stray light and heat; on the real telescope it is a hexagonal composite structure holding ten baffles.", facts:["Ten internal baffles", "Carries the sunshield and the aperture cover"] },
      cover:{ name:'Aperture cover', desc:"The cover that shielded the telescope from the Sun just after launch. Deployed once, it then blocks stray light at extreme pointing angles. On the 2015 model it is a rigid disc; the cover that flew is a soft structure.", facts:["One-time deployment", "Carries coarse Sun sensors"] },
      ota:{ name:'Telescope (primary and secondary mirrors)', desc:"A 2.4 m telescope, the size of Hubble's, transferred to NASA by another federal agency and adapted for Roman. The first two mirrors are at the front; the third, in the aft optics, sends the light to the wide-field camera.", facts:["2.4 m primary mirror", "Mirrors near 265 K", "Existing telescope, transferred to NASA"] },
      instr:{ name:'Instruments and carrier', desc:"The composite structure that holds the telescope and the two instruments: the wide-field camera (WFI) and the coronagraph. It reuses the technology of Webb's structure and runs near 213 K.", facts:["WFI: 18 detectors, ≈ 300 Mpx", "Coronagraph: technology demonstration", "Structure derived from Webb's, ≈ 213 K"] },
      bus:{ name:'Spacecraft bus', desc:"The hexagonal platform at the back: power, pointing, computers, memory and propulsion. Its six electronics bays also act as radiators.", facts:["≈ 4 m × 2 m, 3,800 kg", "Six reaction wheels", "Hydrazine: four tanks, 24 thrusters", "9 TB of memory"] },
      hga:{ name:'High-gain antenna', desc:"The steerable dish that sends the data every day to NASA, ESA and JAXA stations. Roman produces far more data than Hubble and Webb combined.", facts:["1.7 m dish, Ka and S bands", "Up to 500 Mbit/s", "≈ 1.4 TB per day"] }
    }
  },
  chandra:{
    agency:'NASA, operated by the Smithsonian Astrophysical Observatory', launch:'Launched 23 July 1999, Space Shuttle Columbia',
    sub:'Highly elliptical Earth orbit, X-rays (since 1999)', src:'Model: NASA 3D Resources (public domain)',
    cmp:{ tag:'13.8 m', dim:'13.8 m long, 19.5 m span' },
    desc:"X-rays only reflect when they graze a surface. Chandra therefore focuses them with four pairs of nested, tube-shaped mirrors that they skim at a very shallow angle, then sends them 10 m further on to its detectors. Since 1999 it has observed gas at millions of degrees: supernova remnants, galaxy clusters, matter around black holes. Its very elongated orbit takes it more than a third of the way to the Moon, far from the radiation belts.",
    sourceNote:"NASA model (NASA 3D Resources repository), in metres. It has been re-segmented here into six assemblies from its geometry and materials; it contains the four mirror shells.",
    refs:{ cspecs:'Chandra Specifications (press kit)', pog:'Proposers\' Observatory Guide, introduction', tvis:'Proposers\' Observatory Guide, visibility constraints', about:'About Chandra (instrument characteristics)', cuc:'Chandra Users\' Committee, May 2026 (mission status)' },
    sections:[
      { title:'Spacecraft', rows:[['Dimensions','13.8 m long · 19.5 m span, arrays deployed'],['Mass','4,800 kg'],['Power','two wings of three panels, 2,350 W · three nickel-hydrogen batteries'],['Pointing','six reaction wheels · 0.25″ stability'],['Launch','23 July 1999, Space Shuttle Columbia'],['Builder','TRW; programme managed by NASA Marshall']] },
      { title:'Optics', rows:[['Design','Wolter type I, grazing incidence'],['Mirrors','four nested paraboloid–hyperboloid pairs · each 83.3 cm long'],['Largest diameter','1.2 m'],['Focal length','10 m'],['Mirror mass','956.4 kg'],['Sharpness','0.5″ full width at half maximum'],['Effective area','800 cm² at 0.25 keV · 400 cm² at 5 keV']] },
      { title:'Instruments', rows:[['ACIS','10 CCDs in two arrays · imaging and spectroscopy'],['HRC','microchannel plates, wide field, high resolution'],['HETG','transmission grating, resolving power 60 to 1,000'],['LETG','low-energy grating, resolving power 40 to 2,000'],['Status in 2026','nominal, except HRC-S (halted since October 2025)']] },
      { title:'Orbit and data', rows:[['Original orbit','10,000 × 140,161 km · 28.5° inclination'],['Orbit in 2025','perigee ≈ 6,680 km · apogee ≈ 142,000 km'],['Period','63.5 h'],['Above the radiation belts','≈ 70% of the time'],['Forbidden pointing','within 46.2° of the Sun'],['Recorder','1.8 Gbit · emptied about every 8 h'],['Exclusive access','six months for the observer, then public']] }
    ],
    parts:{
      door:{ name:'Sunshade door', desc:"The lid that protected the mirrors during launch. It opened once and for all on 12 August 1999; open, it also screens out sunlight.", facts:["Opened 12 August 1999","≈ 2.7 m, 54 kg (9 feet, 120 pounds)"] },
      bus:{ name:'Spacecraft bus', desc:"The octagonal module around the mirrors. It provides power, pointing, communications and propulsion. Its engines took Chandra to its very elongated orbit after release from the Shuttle.", facts:["Six reaction wheels, two inertial reference units","Aspect camera: 1.4° × 1.4° field","Two low-gain antennas","1.8 Gbit recorder"] },
      hrma:{ name:'Mirrors (HRMA)', desc:"Chandra's heart: four pairs of nested, tube-shaped mirrors. X-rays first graze a paraboloid, then a hyperboloid, at a very shallow angle, and converge 10 m further on. Just behind, two gratings can be moved into the beam to turn it into a spectrum.", facts:["Four nested pairs, 1.2 m across for the largest","10 m focal length","956.4 kg"] },
      oba:{ name:'Optical bench', desc:"The long tube that holds the detectors 10 m behind the mirrors, very stably. X-rays travel through it without meeting any other optics.", facts:["Keeps mirrors and focus 10 m apart"] },
      isim:{ name:'Science instrument module', desc:"At the end of the tube, a moving table puts one of the two cameras at the focus: ACIS (CCDs) or HRC (microchannel plates).", facts:["ACIS: 10 CCDs","HRC: very high resolution imaging"] },
      solar:{ name:'Solar arrays', desc:"Two wings of three silicon panels, deployed after release, and three batteries to store the energy.", facts:["2,350 W","Three 40 Ah nickel-hydrogen batteries"] }
    }
  },
  gaia:{
    agency:'ESA', launch:'Launched 19 December 2013, Soyuz-Fregat, Kourou',
    sub:'Lagrange point L2 (2014–2025), astrometry in visible light', src:'Model: Toni Sagristà, Gaia Sky',
    cmp:{ tag:'Ø ≈ 10 m', dim:'Ø ≈ 10 m (sunshield)' },
    desc:"Gaia measured the position, distance and motion of nearly two billion stars. The spacecraft spun once every six hours: its two telescopes, looking in directions 106.5° apart, swept the whole sky as it turned. Observations ended in January 2025.",
    sourceNote:"Model created by Toni Sagristà for Gaia Sky, the mission's visualisation software. The parts correspond to the named objects in the original file.",
refs:{ end:'Gaia passivation (27 March 2025)' },
    sections:[
      { title:'Spacecraft', rows:[['Deployed sunshield','Ø 10.2 m'],['Launch mass','2,030 kg, including 710 kg of payload and 400 kg of propellant'],['End of observations','15 January 2025'],['Retired','27 March 2025, on an orbit around the Sun']] },
      { title:'Optics', rows:[['Telescopes','2 three-mirror anastigmats, 10 mirrors in all'],['Primary mirrors','1.45 × 0.50 m each'],['Focal length','35 m'],['Basic angle','106.5°'],['Material','silicon carbide']] },
      { title:'Focal plane', rows:[['Detectors','106 CCDs · nearly a billion pixels'],['Size','0.42 × 0.92 m'],['Temperature','170 K, passively cooled'],['Breakdown','62 astrometry · 14 sky mapper · 14 BP/RP · 12 RVS · 4 monitoring'],['Plate scale','58.9 × 176.8 mas per pixel']] },
      { title:'Scanning law', rows:[['Spin','1 turn in 6 h'],['Spin axis','45° from the Sun'],['Precession','≈ 63 days'],['Orbit','Lissajous around L2, period ≈ 180 days']] },
      { title:'Power and catalogues', rows:[['Solar arrays','12.8 m², up to 1,910 W at end of life'],['Clock','rubidium, 10 MHz'],['Target precision','down to 24 µas'],['Gaia DR3 (2022)','≈ 1.8 billion sources'],['Gaia DR4','planned for 2 December 2026']] }
    ],
    parts:{
      sunshield:{ name:'Deployable sunshield', desc:"A skirt of twelve panels that opened like a parasol after launch. It keeps the telescopes in permanent shadow at a constant temperature: the slightest expansion would spoil angle measurements good to a millionth of a degree.", facts:["Ø 10.2 m when deployed", "12 rigid carbon-composite frames", "Two insulating blankets, of 2 and 5 layers"] },
      solar:{ name:'Solar panels', desc:"The cells are on the sunlit face, underneath the spacecraft in this view. Because Gaia's axis keeps a fixed 45° angle to the Sun, the illumination never changes.", facts:["Triple-junction cells, 12.8 m²", "Up to 1,910 W at end of life", "Panels on 8 of the 12 sunshield frames"] },
      svmbase:{ name:'Phased-array antenna', desc:"Under the spacecraft, facing the Earth. A steerable dish would have shaken Gaia, so the beam is steered electronically, with no moving parts, while the spacecraft spins.", facts:["X band, 8.7 Mbit/s", "No moving parts"] },
      svm:{ name:'Service module', desc:"The ring that carries the electronics, the tanks and a rubidium atomic clock to time-stamp every measurement. Cold-nitrogen micro-thrusters keep the spin extremely regular.", facts:["Rubidium atomic clock (10 MHz)", "2 × 6 cold-gas micro-thrusters"] },
      tent:{ name:'Thermal tent', desc:"The shell around the payload. It protects it from micrometeoroids and radiation, and leaves only two openings for the two telescopes to look through.", facts:["Openings for the 2 telescopes and the focal plane", "Carbon composite and aluminium sandwich"] },
      torus:{ name:'Optical bench (torus)', desc:"A silicon-carbide ring about 3 m across, assembled from 17 brazed segments. It carries the ten mirrors of the two telescopes and the focal plane, and keeps the angle between the two lines of sight fixed.", facts:["Ø ≈ 3 m, quasi-octagonal", "17 silicon-carbide segments", "Carries both telescopes and the focal plane"] },
      focal:{ name:'Focal plane and instruments', desc:"The largest camera sent into space at the time of its launch. The images from both telescopes land on the same CCD mosaic; stars cross it in a line as the spacecraft turns.", facts:["106 CCDs, 938 million pixels", "0.42 × 0.92 m"] }
    }
  }
};
