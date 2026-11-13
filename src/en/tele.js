/* English text for the observatory sheets and clickable parts (applied over src/data-tele.js by src/i18n.js). */
var EN_TELE = {
  hubble:{
    agency:'NASA / ESA', launch:'Launched 24 April 1990, Space Shuttle Discovery (STS-31)',
    sub:'Low Earth orbit, ultraviolet, visible, near infrared', src:'Model: NASA VTAD, via Gaia Sky',
    cmp:{ tag:'13.2 m', dim:'13.2 m long' },
    desc:"The first of NASA's Great Observatories, Hubble has circled the Earth since 1990. Five Space Shuttle missions repaired and upgraded it in orbit: almost all of its current instruments date from those visits. Its silver tube houses a Ritchey-Chrétien telescope and a bay of replaceable instruments.",
    sourceNote:"Model created by NASA Visualization Technology Applications and Development (VTAD), distributed with Gaia Sky. The original file is split by texture; it has been re-cut here into physical parts so that a click picks the right piece.",
    sections:[
      { title:'Spacecraft', rows:[['Length','13.2 m'],['Maximum diameter','4.2 m'],['Launch mass','≈ 11,110 kg'],['Servicing missions','5 (1993, 1997, 1999, 2002, 2009)'],['Pointing','1 gyroscope in use since 2024 (one-gyro mode)']] },
      { title:'Optics', rows:[['Design','Ritchey-Chrétien'],['Primary mirror','2.4 m · ULE glass · 828 kg'],['Secondary mirror','0.3 m'],['Focal length','57.6 m'],['Focal ratio','f/24'],['Pointing stability','0.007″']] },
      { title:'Active instruments', rows:[['WFC3','wide-field camera, UV to near IR (2009)'],['ACS','survey camera (2002)'],['STIS','imaging spectrograph (1997)'],['COS','ultraviolet spectrograph (2009)'],['FGS','3 fine guidance sensors']] },
      { title:'Orbit', rows:[['Altitude','≈ 500–540 km, slowly decaying'],['Inclination','28.5°'],['Period','≈ 95 min (≈ 15 orbits per day)'],['Speed','≈ 27,000 km/h']] },
      { title:'Power and data', rows:[['Solar arrays','2 rigid wings, 7.1 × 2.6 m each'],['Power','≈ 5 kW generated'],['Batteries','6, nickel-hydrogen'],['Link','S band, relayed by TDRS satellites']] }
    ],
    parts:{
      door:{ name:'Aperture door and light shield', desc:"The entrance to the telescope. The door closes automatically if the line of sight strays too close to the Sun, to protect the optics. Behind it, the light shield blocks stray light from the Earth and the Moon.", facts:['Door ≈ 3 m across','Automatic safety closure'] },
      ota:{ name:'Forward shell (secondary mirror)', desc:"The tube that extends the telescope forward. It holds the internal baffles and, inside, the 0.3 m secondary mirror, held 4.9 m in front of the primary by a graphite-epoxy truss that barely reacts to temperature.", facts:['Secondary mirror: 0.3 m','Primary–secondary spacing: 4.9 m'] },
      ssm:{ name:'Equipment section', desc:"The ring of bays around the telescope. It holds the flight computers, the batteries, the reaction wheels that turn the spacecraft and the communications equipment. The doors open so that astronauts could swap the units.", facts:['10 equipment bays','4 reaction wheels','6 nickel-hydrogen batteries'] },
      aft:{ name:'Aft shroud (instruments)', desc:"The widest section. The 2.4 m primary mirror sits just ahead of it; behind the mirror, at the focus, are the science instruments: four axial bays, one radial bay occupied by WFC3, and the three fine guidance sensors. The yellow handrails were for the astronauts.", facts:['Primary mirror: 2.4 m, 828 kg','4 axial instruments + 1 radial','3 fine guidance sensors'] },
      array_stbd:{ name:'Solar array (+V2)', desc:"One of the two rigid gallium-arsenide solar wings fitted in 2002. Smaller than the original flexible arrays, they nevertheless produce more power and shake less at each day–night crossing.", facts:['7.1 × 2.6 m','Gallium arsenide','Installed in 2002 (SM3B)'] },
      array_port:{ name:'Solar array (−V2)', desc:"The second solar wing, identical to the first. Both rotate about their mast to stay face-on to the Sun whatever direction the telescope is pointing.", facts:['7.1 × 2.6 m','≈ 5 kW for the two wings'] },
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
    sections:[
      { title:'Spacecraft', rows:[['Sunshield','21.2 × 14.2 m'],['Height','≈ 8 m'],['Launch mass','≈ 6,200 kg'],['Lifetime','5 years required; propellant for more than 20']] },
      { title:'Optics', rows:[['Design','three-mirror anastigmat (Korsch)'],['Primary mirror','6.5 m · 18 gold-coated beryllium segments'],['Collecting area','25.4 m²'],['Focal length','131.4 m'],['Focal ratio','f/20.2'],['Wavelength range','0.6 to 28.8 µm']] },
      { title:'Thermal', rows:[['Cold side','≈ 40 K (−233 °C)'],['MIRI detector','≈ 7 K (cryocooler)'],['Hot side','up to ≈ 85 °C'],['Sunshield attenuation','≈ 1 million (200 kW in, < 1 W through)']] },
      { title:'Instruments', rows:[['NIRCam','near-infrared camera'],['NIRSpec','multi-object spectrograph (ESA)'],['MIRI','mid-infrared imager and spectrograph'],['NIRISS / FGS','imager, slitless spectrograph and guider (CSA)']] },
      { title:'Orbit and communications', rows:[['Location','halo orbit around L2, ≈ 1.5 million km away'],['Halo period','≈ 6 months'],['Science link','Ka band, up to 28 Mbit/s'],['Volume','≈ 57 GB per day (2 contacts of 4 h)']] }
    ],
    parts:{
      primary:{ name:'Primary mirror', desc:"Eighteen hexagons of beryllium, a light metal that stays stable in the cold, coated with 100 nanometres of gold, which reflects infrared light very well. Seven actuators position each segment to the nanometre so that together they behave as a single mirror.", facts:['18 segments, 1.32 m each','≈ 20 kg per segment','Gold: 100 nm thick','25.4 m² of collecting area'] },
      secondary:{ name:'Secondary mirror and tripod', desc:"A 74 cm convex mirror held in front of the primary by three long struts that unfolded after launch. It sends the collected light back towards the opening at the centre of the primary mirror.", facts:['0.74 m convex mirror','Struts about 7.6 m long'] },
      aos:{ name:'Aft optics subsystem (AOS)', desc:"The black tower at the centre of the mirror. It holds the tertiary mirror, which corrects the image, and the small fine steering mirror, which cancels the observatory's tiny motions several times a second.", facts:['Fixed tertiary mirror','Fine steering mirror'] },
      isim:{ name:'Instrument module (ISIM)', desc:"Behind the mirror, the structure that carries the four science instruments. It sits at about 40 K in the shadow of the sunshield; MIRI, which observes at longer wavelengths, is cooled to 7 K by a helium refrigerator.", facts:['NIRCam, NIRSpec, MIRI, NIRISS/FGS','≈ 40 K; MIRI at ≈ 7 K'] },
      sunshield:{ name:'Sunshield', desc:"Five sheets of aluminised Kapton, thinner than a hair, separated by vacuum. Each layer is colder than the one before, and the heat escapes sideways. The two Sun-facing layers carry a doped-silicon coating, hence their pinkish tint.", facts:['21.2 × 14.2 m','5 layers of Kapton E','Layer 1: 0.05 mm; others: 0.025 mm'] },
      flap:{ name:'Momentum flap', desc:"Sunlight pressing on the large sunshield slowly turns the observatory. This flap at the back balances that push, which saves the propellant needed to unload the reaction wheels.", facts:['Offsets solar radiation pressure'] },
      tower:{ name:'Deployable tower', desc:"A telescoping mast that lifted the telescope a little over a metre above the spacecraft bus after launch. The gap leaves room for the sunshield to unfold and isolates the cold side from the warm equipment.", facts:['Extends by ≈ 1.2 m'] },
      bus:{ name:'Spacecraft bus', desc:"The hot side. This carbon-composite box, always in sunlight, holds the flight computer, the reaction wheels, the tanks and thrusters, the power system and the compressor of MIRI's refrigerator.", facts:['Close to room temperature','Propulsion, pointing, computing, power'] },
      solar:{ name:'Solar array', desc:"Five hinged panels, unfolded half an hour after launch. Because Webb always keeps its back to the Sun, the array is fixed: it is lit all the time.", facts:['5 panels, ≈ 6 m long','≈ 2 kW'] },
      hga:{ name:'High-gain antenna', desc:"Under the bus, facing the Earth. The small Ka-band dish sends the science data to the Deep Space Network during two daily contacts; a smaller S-band antenna handles commanding.", facts:['0.6 m Ka-band dish','Up to 28 Mbit/s','≈ 57 GB per day'] }
    }
  },
  euclid:{
    agency:'ESA (with NASA)', launch:'Launched 1 July 2023, Falcon 9, Cape Canaveral',
    sub:'Lagrange point L2, visible and near infrared', src:'Model: ESA SciFleet, via Gaia Sky',
    cmp:{ tag:'4.7 m', dim:'4.7 m tall, Ø 3.7 m' },
    desc:"Euclid is mapping a third of the sky to understand dark energy and dark matter. In a single exposure its telescope sees a field more than twice the size of the full Moon, almost as sharply as Hubble. It measures the shapes and distances of billions of galaxies.",
    sourceNote:"Model by ESA's SciFleet team, distributed with Gaia Sky. The original file is a single block: it has been re-cut here into six assemblies from their geometry.",
    sections:[
      { title:'Spacecraft', rows:[['Height','4.7 m'],['Diameter','3.7 m'],['Launch mass','≈ 2,000 kg'],['Nominal mission','6 years'],['Prime contractor','Thales Alenia Space; payload by Airbus']] },
      { title:'Optics', rows:[['Design','three-mirror Korsch, off-axis field'],['Primary mirror','1.2 m · silicon carbide'],['Focal length','24.5 m'],['Common field','≈ 0.53 deg²'],['Telescope temperature','≈ 130 K, passively cooled']] },
      { title:'VIS (visible)', rows:[['Detectors','36 CCDs (6 × 6) · ≈ 610 Mpx'],['Band','550–900 nm'],['Sampling','0.1″ per pixel'],['CCD temperature','≈ 150 K (−123 °C)']] },
      { title:'NISP (near infrared)', rows:[['Detectors','16 HgCdTe H2RG arrays'],['Photometry','Y, J, H (0.95–2.02 µm)'],['Spectroscopy','slitless grisms (blue and red)'],['Detector temperature','≈ 95 K (−180 °C)']] },
      { title:'Orbit and data', rows:[['Location','halo orbit around L2'],['Survey','≈ 14,000 deg² in 6 years'],['Science link','K band (26 GHz), ≈ 55 Mbit/s'],['Volume','up to ≈ 850 Gbit per day']] }
    ],
    parts:{
      sunshield:{ name:'Sunshield and solar panels', desc:"The large panel that always faces the Sun. It carries the solar cells on its lit side and keeps the whole telescope in shadow, which the thermal stability of the images depends on.", facts:['3 photovoltaic panels','≈ 1.8 to 2.4 kW depending on attitude'] },
      baffle:{ name:'Telescope and external baffle', desc:"The insulated cylinder around the telescope. Inside, the mirrors and their structure are made entirely of silicon carbide, a ceramic that hardly changes shape when the temperature varies.", facts:['1.2 m primary mirror','All silicon carbide','≈ 130 K'] },
      instr:{ name:'Instrument bay (VIS and NISP)', desc:"Under the telescope, the baseplate that carries the two instruments. A dichroic plate splits the light: the visible goes to VIS, the infrared passes through to NISP. Both therefore observe exactly the same field at the same time. The radiators shed heat to space.", facts:['VIS: 36 CCDs, ≈ 610 Mpx','NISP: 16 infrared detectors','Dichroic beam splitter'] },
      svm:{ name:'Service module', desc:"The platform: computers, tanks, the instruments' warm electronics and the pointing system. Cold-nitrogen micro-thrusters hold the line of sight steady to a few hundredths of an arcsecond during exposures.", facts:['Cold-gas (nitrogen) micro-thrusters','Fine guidance sensor in the VIS focal plane'] },
      hga:{ name:'High-gain antenna', desc:"The steerable K-band dish, which sends the compressed images to ESA's 35 m ground stations for about four hours every day.", facts:['K band, 26 GHz','≈ 55 Mbit/s','Up to ≈ 850 Gbit per day'] },
      adapter:{ name:'Launch vehicle adapter ring', desc:"The ring by which the spacecraft was attached to the top of the Falcon 9 rocket. It has no use after separation.", facts:['Interface with Falcon 9'] }
    }
  },
  gaia:{
    agency:'ESA', launch:'Launched 19 December 2013, Soyuz-Fregat, Kourou',
    sub:'Lagrange point L2 (2014–2025), astrometry in visible light', src:'Model: Toni Sagristà, Gaia Sky',
    cmp:{ tag:'Ø ≈ 10 m', dim:'Ø ≈ 10 m (sunshield)' },
    desc:"Gaia measured the position, distance and motion of nearly two billion stars. The spacecraft spun once every six hours: its two telescopes, looking in directions 106.5° apart, swept the whole sky as it turned. Observations ended in January 2025.",
    sourceNote:"Model created by Toni Sagristà for Gaia Sky, the mission's visualisation software. The parts correspond to the named objects in the original file.",
    sections:[
      { title:'Spacecraft', rows:[['Deployed sunshield','Ø ≈ 10 m'],['Height','≈ 3 m'],['Launch mass','≈ 2,030 kg'],['End of observations','15 January 2025'],['Retired','27 March 2025 (solar orbit)']] },
      { title:'Optics', rows:[['Telescopes','2 three-mirror anastigmats'],['Primary mirrors','1.45 × 0.50 m each'],['Focal length','35 m'],['Basic angle','106.5°'],['Material','silicon carbide']] },
      { title:'Focal plane', rows:[['Detectors','106 CCDs · ≈ 938 Mpx'],['Size','≈ 1.0 × 0.4 m'],['Readout','TDI, synchronised with the spin'],['Functions','astrometry, BP/RP photometry, RVS spectrometer']] },
      { title:'Scanning law', rows:[['Spin','1 turn in 6 h (60″/s)'],['Spin axis','45° from the Sun'],['Precession','63 days'],['Orbit','Lissajous around L2']] },
      { title:'Catalogues', rows:[['Gaia DR3 (2022)','≈ 1.8 billion sources'],['Precision (bright stars)','≈ 0.02 mas'],['Gaia DR4','expected late 2026 (5.5 years of data)']] }
    ],
    parts:{
      sunshield:{ name:'Deployable sunshield', desc:"A skirt of twelve panels that opened like a parasol after launch. It keeps the telescopes in permanent shadow at a constant temperature: the slightest expansion would spoil angle measurements good to a millionth of a degree.", facts:['Ø ≈ 10 m','12 folding frames','Two layers of insulation'] },
      solar:{ name:'Solar panels', desc:"The cells are on the sunlit face, underneath the spacecraft in this view. Because Gaia's axis keeps a fixed 45° angle to the Sun, the illumination never changes.", facts:['Gallium arsenide','≈ 1.9 kW'] },
      svmbase:{ name:'Phased-array antenna', desc:"Under the spacecraft, facing the Earth. A steerable dish would have shaken Gaia, so the beam is steered electronically, with no moving parts, while the spacecraft spins.", facts:['X band','No moving parts'] },
      svm:{ name:'Service module', desc:"The ring that carries the electronics, the tanks and a rubidium atomic clock to time-stamp every measurement. Cold-nitrogen micro-thrusters keep the spin extremely regular.", facts:['Rubidium atomic clock','Cold-gas micro-propulsion'] },
      tent:{ name:'Thermal tent', desc:"The shell around the payload. It protects it from micrometeoroids and radiation, and leaves only two openings for the two telescopes to look through.", facts:['2 viewing apertures','Carbon-composite structure'] },
      torus:{ name:'Optical bench (torus)', desc:"A silicon-carbide ring about 3 m across, assembled from 17 brazed segments. It carries the ten mirrors of the two telescopes and the focal plane, and keeps the angle between the two lines of sight fixed.", facts:['Ø ≈ 3 m','17 silicon-carbide segments','Carries 10 mirrors'] },
      focal:{ name:'Focal plane and instruments', desc:"The largest camera sent into space at the time of its launch. The images from both telescopes land on the same CCD mosaic; stars cross it in a line as the spacecraft turns.", facts:['106 CCDs · ≈ 938 Mpx','≈ 1.0 × 0.4 m'] }
    }
  }
};
