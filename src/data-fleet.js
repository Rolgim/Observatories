/* =================================================================
   FLOTTE (priorité 3 des spécifications) : vie de chaque observatoire et « qui a fait quoi ».
   life : [lancement, fin des observations ou null si en service, clé de source de la fin]
          (dates AAAA-MM-JJ ; la source du lancement est celle de la ligne « Lancement » de la fiche)
   who  : [agence, rôle, texte FR, texte EN, clés de source] ; rôle parmi ROLES ci-dessous.
          Les clés renvoient à refs ci-dessous, sinon à celles de la fiche (TELESCOPES[…].refs).
   Première colonne : toujours une agence spatiale (filtrable) ; « Partenaires » regroupe pays et instituts, nommés dans le texte.
================================================================= */
var FLEET_ROLES = { lead:['Responsable de la mission','Mission lead'], partner:['Partenaire','Partner'], instrument:['Instrument','Instrument'], data:['Données et opérations','Data and operations'], launch:['Lancement','Launch'] };
var FLEET = {
  hubble:{ life:['1990-04-24', null], who:[
    ['NASA','lead',"Mission de la NASA, exploitée par le STScI (Baltimore).","A NASA mission, operated by STScI (Baltimore).",'nasa'],
    ['ESA','partner',"Partenaire de la mission.","Mission partner.",'nasa'] ] },
  cgro:{ life:['1991-04-05', '2000-06-04', 'wiki'], who:[
    ['NASA','lead',"Mission de la NASA (Goddard).","A NASA mission (Goddard).",'cossc'],
    ['Partenaires','partner',"Partenaires européens pour l'instrument COMPTEL.","European partners for the COMPTEL instrument.",'wiki'] ] },
  chandra:{ life:['1999-07-23', null], who:[
    ['NASA','lead',"Mission de la NASA ; centre Chandra au Smithsonian Astrophysical Observatory (Cambridge, Massachusetts).","A NASA mission; Chandra X-ray Center at the Smithsonian Astrophysical Observatory (Cambridge, Massachusetts).",['specs','pog']] ] },
  xmm:{ life:['1999-12-10', null], who:[
    ['ESA','lead',"Mission de l'ESA, pilotée depuis l'ESOC ; centre scientifique à l'ESAC.","An ESA mission, flown from ESOC; science centre at ESAC.",'fs'] ] },
  wmap:{ life:['2001-06-30', '2010-08-19', 'nasa'], who:[
    ['NASA','lead',"Mission de la NASA (Goddard), avec l'université de Princeton.","A NASA mission (Goddard), with Princeton University.",'nasa'] ] },
  integral:{ life:['2002-10-17', '2025-02-28', 'end'], who:[
    ['ESA','lead',"Mission de l'ESA ; données traitées à l'ISDC (Genève).","An ESA mission; data processed at the ISDC (Geneva).",'fs'],
    ['Agence spatiale russe','launch',"Mise en orbite par une fusée Proton, fournie gratuitement en échange de temps d'observation.","Put into orbit by a Proton rocket, provided free of charge in exchange for observing time.",'esaL'],
    ['NASA','partner',"Coopération des États-Unis.","Cooperation from the United States.",'fs'],
    ['CNES','instrument',"Maîtrise d'œuvre du spectromètre SPI, l'un des deux instruments principaux.","Prime contractor for the SPI spectrometer, one of the two main instruments.",'cnesI'] ] },
  spitzer:{ life:['2003-08-25', '2020-01-30', 'mo'], who:[
    ['NASA','lead',"Mission de la NASA, gérée par le JPL ; centre scientifique à Caltech (IPAC).","A NASA mission, managed by JPL; science centre at Caltech (IPAC).",['qf','mo']] ] },
  swift:{ life:['2004-11-20', '2026-10-20', 'end'], who:[
    ['NASA','lead',"Mission de la NASA (Goddard) ; opérations à Penn State.","A NASA mission (Goddard); operations at Penn State.",'g04'],
    ['Partenaires','partner',"Italie et Royaume-Uni : partenaires pour le XRT, l'UVOT et les centres de données.","Italy and the United Kingdom: partners for the XRT, the UVOT and the data centres.",'g04'] ] },
  fermi:{ life:['2008-06-11', null], who:[
    ['NASA','lead',"Mission de la NASA, avec le département de l'Énergie des États-Unis.","A NASA mission, with the U.S. Department of Energy.",'fs'],
    ['Partenaires','partner',"France, Allemagne, Italie, Japon et Suède.","France, Germany, Italy, Japan and Sweden.",'fs'] ] },
  kepler:{ life:['2009-03-07', '2018-10-30', 'nasa'], who:[
    ['NASA','lead',"Mission de la NASA (Ames, JPL), construite par Ball Aerospace.","A NASA mission (Ames, JPL), built by Ball Aerospace.",'pk'] ] },
  herschel:{ life:['2009-05-14', '2013-04-29', 'fs'], who:[
    ['ESA','lead',"Mission de l'ESA ; instruments construits par des consortiums européens.","An ESA mission; instruments built by European consortia.",'fs'],
    ['NASA','partner',"Centre scientifique de la NASA à l'IPAC (Caltech).","NASA science centre at IPAC (Caltech).",'fs'],
    ['CNES','instrument',"Financement et suivi de toutes les participations françaises : plan focal du photomètre de PACS et ses matrices de bolomètres (CEA), mécanisme du spectromètre de SPIRE (LAM), spectromètre haute résolution de HIFI (IRAP), cryoréfrigérateur de PACS et SPIRE (CEA).","Funding and follow-up of all French contributions: the PACS photometer focal plane and its bolometer arrays (CEA), the SPIRE spectrometer mechanism (LAM), the HIFI high-resolution spectrometer (IRAP), the PACS and SPIRE cryocooler (CEA).",'cnesH'] ] },
  planck:{ life:['2009-05-14', '2013-10-23', 'fs'], who:[
    ['ESA','lead',"Mission de l'ESA.","An ESA mission.",'fs'],
    ['CNES','instrument',"Partenaire du CNRS et de l'IAS pour l'instrument HFI ; responsable du contrat du système de dilution à 0,1 K ; financement des participations françaises et du traitement des données associé.","Partner of CNRS and IAS for the HFI instrument; responsible for the contract for the 0.1 K dilution system; funding of the French contributions and of the associated data processing.",'cnesP'],
    ['Partenaires','instrument',"Italie : instrument LFI, dirigé depuis Bologne.","Italy: LFI instrument, led from Bologna.",'fs'] ] },
  gaia:{ life:['2013-12-19', '2025-01-15', 'end'], who:[
    ['ESA','lead',"Mission de l'ESA ; données traitées par le consortium européen DPAC.","An ESA mission; data processed by the European DPAC consortium.",'fs'],
    ['CNES','data',"Architecture du système de traitement (CU1), traitement des unités CU4, CU6 et CU8, outils de simulation (CU2). 80 % des nouveaux objets du troisième catalogue viennent de son centre de traitement.","Architecture of the processing system (CU1), processing for units CU4, CU6 and CU8, simulation tools (CU2). 80% of the new objects in the third catalogue come from its processing centre.",'cnesG'] ] },
  tess:{ life:['2018-04-18', null], who:[
    ['NASA','lead',"Mission de la NASA dirigée par le MIT.","A NASA mission led by MIT.",'fs'] ] },
  cheops:{ life:['2019-12-18', null], who:[
    ['ESA','lead',"Mission de l'ESA menée avec la Suisse ; instrument construit par un consortium dirigé par l'Université de Berne.","An ESA mission run with Switzerland; instrument built by a consortium led by the University of Bern.",'nut'],
    ['CNES','data',"Soutien au LAM, qui a fourni les méthodes de traitement des données brutes.","Support to LAM, which supplied the raw-data processing methods.",'cnesC'] ] },
  jwst:{ life:['2021-12-25', null], who:[
    ['NASA','lead',"Mission de la NASA, avec l'ESA et l'Agence spatiale canadienne.","A NASA mission, with ESA and the Canadian Space Agency.",'esafs'],
    ['ESA','launch',"Lancement par Ariane 5 depuis Kourou ; instrument NIRSpec et part de MIRI.","Launch by Ariane 5 from Kourou; the NIRSpec instrument and part of MIRI.",'esafs'],
    ['CNES','instrument',"Maître d'ouvrage de l'imageur de MIRI (MIRIM), réalisé par le CEA, maître d'œuvre, entre 2004 et 2009.","Project owner of the MIRI imager (MIRIM), built by CEA, the prime contractor, between 2004 and 2009.",'cnesM'] ] },
  euclid:{ life:['2023-07-01', null], who:[
    ['ESA','lead',"Mission de l'ESA ; instruments VIS et NISP et traitement des données par le consortium Euclid.","An ESA mission; VIS and NISP instruments and data processing by the Euclid Consortium.",'e1'],
    ['NASA','partner',"Partenaire de la mission.","Mission partner.",'e1'],
    ['CNES','instrument',"Membre du consortium Euclid ; finance les 13 laboratoires et instituts français qui travaillent sur VIS et NISP ; rôle clé dans le segment sol.","Member of the Euclid Consortium; funds the 13 French laboratories and institutes working on VIS and NISP; key role in the ground segment.",'cnesE'] ] },
  roman:{ life:['2026-08-30', null], who:[
    ['NASA','lead',"Mission de la NASA (Goddard).","A NASA mission (Goddard).",'ot'],
    ['ESA','partner',"Partenaire de la mission.","Mission partner.",'esa'],
    ['CNES','instrument',"Miroirs du coronographe, développés par le LAM ; participation à la préparation des observations et de l'analyse des données.","Coronagraph mirrors, developed by LAM; participation in planning the observations and the data analysis.",'cnesR'] ] }
};
var FLEET_REFS = {
  esaL:{ t:'Integral : the launcher', p:'ESA', u:'https://www.esa.int/Science_Exploration/Space_Science/Integral/The_launcher' },
  cnesI:{ t:'INTEGRAL en détails', p:'CNES', u:'https://cnes.fr/projets/integral/en-details' },
  cnesH:{ t:'Herschel en détails', p:'CNES', u:'https://cnes.fr/projets/herschel/en-details' },
  cnesP:{ t:'Planck en détails', p:'CNES', u:'https://cnes.fr/projets/planck/en-details' },
  cnesG:{ t:'Gaia en détails', p:'CNES', u:'https://cnes.fr/projets/gaia/en-details' },
  cnesC:{ t:'CHEOPS', p:'CNES', u:'https://cnes.fr/en/projects/cheops' },
  cnesM:{ t:'Webb / MIRI en détails', p:'CNES', u:'https://cnes.fr/projets/webb-miri/en-details' },
  cnesE:{ t:'Euclid', p:'CNES', u:'https://cnes.fr/en/projects/euclid' },
  cnesR:{ t:'Imager des planètes lointaines : la France coopère avec la NASA pour un démonstrateur embarqué sur le télescope Roman (communiqué, 2024)', p:'CNES', u:'https://cnes.fr/communiques/imager-planetes-lointaines-france-coopere-nasa-un-demonstrateur-embarque-telescope' }
};
function fleetRefs(id){ var t = TELESCOPES.filter(function(x){ return x.id === id; })[0], r = {}, k; for (k in t.refs) r[k] = t.refs[k]; for (k in FLEET_REFS) r[k] = FLEET_REFS[k]; return r; }
function fleetAgencies(id){ var a = {}; (FLEET[id] ? FLEET[id].who : []).forEach(function(w){ a[w[0]] = 1; }); return Object.keys(a); }
