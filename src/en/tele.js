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
      door:{ name:'Aperture door and light shield', desc:"The entrance to the telescope. The door closes automatically if the line of sight strays too close to the Sun, to protect the optics. Behind it, the light shield blocks stray light from the Earth and the Moon.", facts:['Door ≈ 3 m across','Automatic safety closure'] },
      ota:{ name:'Forward shell (secondary mirror)', desc:"The tube that extends the telescope forward. It holds the internal baffles and, inside, the 0.3 m secondary mirror, held 4.9 m in front of the primary by a graphite-epoxy truss that barely reacts to temperature.", facts:['Secondary mirror: 0.3 m, 12.4 kg','Primary–secondary spacing: 4.9 m'] },
      ssm:{ name:'Equipment section', desc:"The ring of bays around the telescope. It holds the flight computers, the batteries, the reaction wheels that turn the spacecraft and the communications equipment. The doors open so that astronauts could swap the units.", facts:['10 equipment bays','4 reaction wheels','6 nickel-hydrogen batteries'] },
      aft:{ name:'Aft shroud (instruments)', desc:"The widest section. The 2.4 m primary mirror sits just ahead of it; behind the mirror, at the focus, are the science instruments: four axial bays, one radial bay occupied by WFC3, and the three fine guidance sensors. The yellow handrails were for the astronauts.", facts:['Primary mirror: 2.4 m, 828 kg','4 axial instruments + 1 radial','3 fine guidance sensors'] },
      array_stbd:{ name:'Solar array (+V2)', desc:"One of the two rigid gallium-arsenide solar wings fitted in 2002. Smaller than the original flexible arrays, they nevertheless produce more power and shake less at each day–night crossing.", facts:['7.54 × 2.44 m','Gallium arsenide','Installed in 2002 (SM3B)'] },
      array_port:{ name:'Solar array (−V2)', desc:"The second solar wing, identical to the first. Both rotate about their mast to stay face-on to the Sun whatever direction the telescope is pointing.", facts:['7.54 × 2.44 m','≈ 5,500 W for the two panels'] },
      hga_top:{ name:'High-gain antenna', desc:"A steerable dish at the end of a mast. Hubble does not talk to the ground directly: it sends its data to the TDRS relay satellites in geostationary orbit, which pass them on to White Sands, New Mexico.", facts:['1.3 m dish','S band, via TDRS'] },
      hga_bottom:{ name:'High-gain antenna (second)', desc:"The second dish, on the opposite side. Two antennas keep a relay satellite in view whatever the telescope's orientation.", facts:['1.3 m dish','Redundancy and coverage'] }
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
      primary:{ name:'Primary mirror', desc:"Eighteen hexagons of beryllium, a light metal that stays stable in the cold, coated with 100 nanometres of gold, which reflects infrared light very well. Seven actuators position each segment to the nanometre so that together they behave as a single mirror.", facts:['18 segments, 1.32 m each','20.1 kg of beryllium per segment','Gold: 100 nm thick','25.44 m² of collecting area'] },
      secondary:{ name:'Secondary mirror and tripod', desc:"A 74 cm convex mirror held in front of the primary by three long struts that unfolded after launch. It sends the collected light back towards the opening at the centre of the primary mirror.", facts:['0.738 m convex mirror','7.17 m from the primary'] },
      aos:{ name:'Aft optics subsystem (AOS)', desc:"The black tower at the centre of the mirror. It holds the tertiary mirror, which corrects the image, and the small fine steering mirror, which cancels the observatory's tiny motions several times a second.", facts:['Fixed tertiary mirror','Fine steering mirror'] },
      isim:{ name:'Instrument module (ISIM)', desc:"Behind the mirror, the structure that carries the four science instruments. It sits at about 40 K in the shadow of the sunshield; MIRI, which observes at longer wavelengths, is cooled to 7 K by a helium refrigerator.", facts:['NIRCam, NIRSpec, MIRI, NIRISS/FGS','≈ 40 K; MIRI at ≈ 7 K'] },
      sunshield:{ name:'Sunshield', desc:"Five sheets of aluminised Kapton, thinner than a hair, separated by vacuum. Each layer is colder than the one before, and the heat escapes sideways. The two Sun-facing layers carry a doped-silicon coating, hence their pinkish tint.", facts:['21.197 × 14.162 m','5 layers of aluminised Kapton','Layer 1: 0.05 mm; others: 0.025 mm'] },
      flap:{ name:'Momentum flap', desc:"Sunlight pressing on the large sunshield slowly turns the observatory. This flap at the back balances that push, which saves the propellant needed to unload the reaction wheels.", facts:['Offsets solar radiation pressure'] },
      tower:{ name:'Deployable tower', desc:"A telescoping mast that lifted the telescope a little over a metre above the spacecraft bus after launch. The gap leaves room for the sunshield to unfold and isolates the cold side from the warm equipment.", facts:['Extends by ≈ 1.2 m'] },
      bus:{ name:'Spacecraft bus', desc:"The hot side. This carbon-composite box, always in sunlight, holds the flight computer, the reaction wheels, the tanks and thrusters, the power system and the compressor of MIRI's refrigerator.", facts:['Close to room temperature','Propulsion, pointing, computing, power'] },
      solar:{ name:'Solar array', desc:"Five hinged panels, unfolded half an hour after launch. Because Webb always keeps its back to the Sun, the array is fixed: it is lit all the time.", facts:['5 panels, ≈ 6 m long','≈ 2 kW'] },
      hga:{ name:'High-gain antenna', desc:"Under the bus, facing the Earth. The small Ka-band dish sends the science data to the Deep Space Network during two daily contacts; a smaller S-band antenna handles commanding.", facts:['Ka band, up to 28 Mbit/s','Up to 57 GB per day'] }
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
      { title:'Optics', rows:[['Design','three-mirror Korsch'],['Primary mirror','1.2 m · silicon carbide'],['Focal length','24.5 m'],['Common field','≈ 0.54 deg²'],['Temperature','≈ 126 K (primary mirror) · 130 to 135 K (baseplate)']] },
      { title:'VIS (visible)', rows:[['Detectors','36 CCDs of 4132 × 4096 px (6 × 6) · ≈ 609 Mpx'],['Band','530–920 nm'],['Sampling','0.1″ per pixel'],['CCD temperature','153 K']] },
      { title:'NISP (near infrared)', rows:[['Detectors','16 H2RG arrays of 2048 × 2048 px (4 × 4)'],['Photometry','Y 950–1212 nm · J 1168–1567 nm · H 1522–2021 nm'],['Spectroscopy','blue grism 926–1366 nm (R ≳ 400) · red grism 1206–1892 nm (R ≳ 480)'],['Sampling','0.298″ per pixel'],['Detector temperature','≈ 95 K']] },
      { title:'Orbit and data', rows:[['Location','halo orbit around L2, amplitude ≈ 1 million km'],['Halo period','≈ 170 days'],['Survey','≈ 14,000 deg² in ≈ 6 years · deep fields 53 deg²'],['Science link','K band, 55 Mbit/s, 4 h per day'],['Volume','≈ 826 Gbit compressed per day'],['DR1','12 November 2026 · ≈ 1,900 deg² · more than a billion objects']] }
    ],
    parts:{
      sunshield:{ name:'Sunshield and solar panels', desc:"The large panel that always faces the Sun. It carries the solar cells on its lit side and keeps the whole telescope in shadow, which the thermal stability of the images depends on.", facts:['3 photovoltaic panels','≈ 1.8 to 2.4 kW depending on attitude'] },
      baffle:{ name:'Telescope and external baffle', desc:"The insulated cylinder around the telescope. Inside, the mirrors and their structure are made entirely of silicon carbide, a ceramic that hardly changes shape when the temperature varies.", facts:['1.2 m primary mirror','All silicon carbide','≈ 126 K at the primary mirror'] },
      instr:{ name:'Instrument bay (VIS and NISP)', desc:"Under the telescope, the baseplate that carries the two instruments. A dichroic plate splits the light: the visible goes to VIS, the infrared passes through to NISP. Both therefore observe exactly the same field at the same time. The radiators shed heat to space.", facts:['VIS: 36 CCDs, ≈ 609 Mpx','NISP: 16 infrared detectors','Dichroic beam splitter'] },
      svm:{ name:'Service module', desc:"The platform: computers, tanks, the instruments' warm electronics and the pointing system. Cold-nitrogen micro-thrusters hold the line of sight steady to a few hundredths of an arcsecond during exposures.", facts:['Cold-gas (nitrogen) micro-thrusters','Fine guidance sensor in the VIS focal plane'] },
      hga:{ name:'High-gain antenna', desc:"The steerable K-band dish, which sends the compressed images to ESA's 35 m ground stations for about four hours every day.", facts:['K band, 25.5 to 27 GHz','55 Mbit/s, 4 h per day','≈ 826 Gbit compressed per day'] },
      adapter:{ name:'Launch vehicle adapter ring', desc:"The ring by which the spacecraft was attached to the top of the Falcon 9 rocket. It has no use after separation.", facts:['Interface with Falcon 9'] }
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
      { title:'Spacecraft', rows:[['Deployed sunshield','Ø ≈ 10 m'],['Launch mass','2,030 kg, including 710 kg of payload and 400 kg of propellant'],['End of observations','15 January 2025'],['Retired','27 March 2025, on an orbit around the Sun']] },
      { title:'Optics', rows:[['Telescopes','2 three-mirror anastigmats, 10 mirrors in all'],['Primary mirrors','1.45 × 0.50 m each'],['Focal length','35 m'],['Basic angle','106.5°'],['Material','silicon carbide']] },
      { title:'Focal plane', rows:[['Detectors','106 CCDs · nearly a billion pixels'],['Size','0.42 × 0.92 m'],['Temperature','170 K, passively cooled'],['Breakdown','62 astrometry · 14 sky mapper · 14 BP/RP · 12 RVS · 4 monitoring'],['Plate scale','58.9 × 176.8 mas per pixel']] },
      { title:'Scanning law', rows:[['Spin','1 turn in 6 h'],['Spin axis','45° from the Sun'],['Precession','≈ 63 days'],['Orbit','Lissajous around L2, period ≈ 180 days']] },
      { title:'Power and catalogues', rows:[['Solar arrays','12.8 m², up to 1,910 W at end of life'],['Clock','rubidium, 10 MHz'],['Target precision','down to 24 µas'],['Gaia DR3 (2022)','≈ 1.8 billion sources'],['Gaia DR4','planned for 2 December 2026']] }
    ],
    parts:{
      sunshield:{ name:'Deployable sunshield', desc:"A skirt of twelve panels that opened like a parasol after launch. It keeps the telescopes in permanent shadow at a constant temperature: the slightest expansion would spoil angle measurements good to a millionth of a degree.", facts:['Ø ≈ 10 m','12 folding frames','Two layers of insulation'] },
      solar:{ name:'Solar panels', desc:"The cells are on the sunlit face, underneath the spacecraft in this view. Because Gaia's axis keeps a fixed 45° angle to the Sun, the illumination never changes.", facts:['Gallium arsenide','≈ 1.9 kW'] },
      svmbase:{ name:'Phased-array antenna', desc:"Under the spacecraft, facing the Earth. A steerable dish would have shaken Gaia, so the beam is steered electronically, with no moving parts, while the spacecraft spins.", facts:['X band','No moving parts'] },
      svm:{ name:'Service module', desc:"The ring that carries the electronics, the tanks and a rubidium atomic clock to time-stamp every measurement. Cold-nitrogen micro-thrusters keep the spin extremely regular.", facts:['Rubidium atomic clock','Cold-gas micro-propulsion'] },
      tent:{ name:'Thermal tent', desc:"The shell around the payload. It protects it from micrometeoroids and radiation, and leaves only two openings for the two telescopes to look through.", facts:['2 viewing apertures','Carbon-composite structure'] },
      torus:{ name:'Optical bench (torus)', desc:"A silicon-carbide ring about 3 m across, assembled from 17 brazed segments. It carries the ten mirrors of the two telescopes and the focal plane, and keeps the angle between the two lines of sight fixed.", facts:['Ø ≈ 3 m','17 silicon-carbide segments','Carries 10 mirrors'] },
      focal:{ name:'Focal plane and instruments', desc:"The largest camera sent into space at the time of its launch. The images from both telescopes land on the same CCD mosaic; stars cross it in a line as the spacecraft turns.", facts:['106 CCDs · nearly a billion pixels','0.42 × 0.92 m'] }
    }
  }
};
