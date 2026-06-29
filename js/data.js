/* ============================================================
   BE YOUR HERO v2 – data.js
   All game data inline (no fetch needed — works on file://)
   ============================================================ */

const GameData = {

  leagues: [
    {
      id: "premier_league", name: "Premier League", country: "England",
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier: 1, color: "#3d195b", accentColor: "#00ff87",
      prestige: 5, apiId: 39,
      clubs: [
        { id: "man_city",   name: "Manchester City",   shortName: "MCI", prestige: 5, budget: 200, color: "#6CABDD", stadium: "Etihad Stadium",      capacity: 53400, apiId: 50   },
        { id: "man_utd",    name: "Manchester United", shortName: "MUN", prestige: 5, budget: 180, color: "#DA291C", stadium: "Old Trafford",        capacity: 74140, apiId: 33   },
        { id: "liverpool",  name: "Liverpool FC",      shortName: "LIV", prestige: 5, budget: 175, color: "#C8102E", stadium: "Anfield",             capacity: 61000, apiId: 40   },
        { id: "arsenal",    name: "Arsenal FC",        shortName: "ARS", prestige: 5, budget: 160, color: "#EF0107", stadium: "Emirates Stadium",    capacity: 60704, apiId: 42   },
        { id: "chelsea",    name: "Chelsea FC",        shortName: "CHE", prestige: 5, budget: 190, color: "#034694", stadium: "Stamford Bridge",     capacity: 40341, apiId: 49   },
        { id: "tottenham",  name: "Tottenham Hotspur", shortName: "TOT", prestige: 4, budget: 140, color: "#132257", stadium: "Tottenham Hotspur Stadium", capacity: 62850, apiId: 47 },
        { id: "newcastle",  name: "Newcastle United",  shortName: "NEW", prestige: 4, budget: 130, color: "#241F20", stadium: "St. James' Park",    capacity: 52305, apiId: 34   },
        { id: "aston_villa",name: "Aston Villa",       shortName: "AVL", prestige: 4, budget: 120, color: "#95BFE5", stadium: "Villa Park",          capacity: 42749, apiId: 66   },
        { id: "west_ham",   name: "West Ham United",   shortName: "WHU", prestige: 3, budget: 100, color: "#7A263A", stadium: "London Stadium",      capacity: 62500, apiId: 48   },
        { id: "brighton",   name: "Brighton & Hove",   shortName: "BHA", prestige: 3, budget: 95,  color: "#0057B8", stadium: "Amex Stadium",        capacity: 31800, apiId: 51   }
      ]
    },
    {
      id: "la_liga", name: "La Liga", country: "Spain",
      flag: "🇪🇸", tier: 1, color: "#FF6B35", accentColor: "#FFD700",
      prestige: 5, apiId: 140,
      clubs: [
        { id: "barcelona",    name: "FC Barcelona",       shortName: "BAR", prestige: 5, budget: 200, color: "#A50044", stadium: "Spotify Camp Nou",   capacity: 99354, apiId: 529 },
        { id: "real_madrid",  name: "Real Madrid CF",     shortName: "RMA", prestige: 5, budget: 210, color: "#FEBE10", stadium: "Santiago Bernabéu",  capacity: 81044, apiId: 541 },
        { id: "atletico",     name: "Atlético de Madrid", shortName: "ATM", prestige: 5, budget: 150, color: "#CB3524", stadium: "Cívitas Metropolitano", capacity: 68456, apiId: 530 },
        { id: "real_sociedad",name: "Real Sociedad",      shortName: "RSO", prestige: 4, budget: 90,  color: "#0067B1", stadium: "Reale Arena",        capacity: 39500, apiId: 548 },
        { id: "athletic",     name: "Athletic Club",      shortName: "ATH", prestige: 4, budget: 80,  color: "#EE2523", stadium: "San Mamés",          capacity: 53289, apiId: 531 },
        { id: "villarreal",   name: "Villarreal CF",      shortName: "VIL", prestige: 4, budget: 85,  color: "#F4C505", stadium: "Estadio de la Cerámica", capacity: 23500, apiId: 533 },
        { id: "betis",        name: "Real Betis",         shortName: "BET", prestige: 4, budget: 80,  color: "#00954C", stadium: "Estadio Benito Villamarín", capacity: 60720, apiId: 543 },
        { id: "valencia",     name: "Valencia CF",        shortName: "VAL", prestige: 4, budget: 75,  color: "#FF7F00", stadium: "Mestalla",           capacity: 49430, apiId: 532 },
        { id: "girona",       name: "Girona FC",          shortName: "GIR", prestige: 3, budget: 65,  color: "#CC0000", stadium: "Montilivi",          capacity: 13450, apiId: 547 },
        { id: "sevilla",      name: "Sevilla FC",         shortName: "SEV", prestige: 4, budget: 90,  color: "#D4001A", stadium: "Estadio Ramón Sánchez-Pizjuán", capacity: 43883, apiId: 536 }
      ]
    },
    {
      id: "bundesliga", name: "Bundesliga", country: "Germany",
      flag: "🇩🇪", tier: 1, color: "#D00027", accentColor: "#FFD700",
      prestige: 5, apiId: 78,
      clubs: [
        { id: "bayern",     name: "FC Bayern München",      shortName: "BAY", prestige: 5, budget: 200, color: "#DC052D", stadium: "Allianz Arena",     capacity: 75024, apiId: 157 },
        { id: "dortmund",   name: "Borussia Dortmund",      shortName: "BVB", prestige: 5, budget: 160, color: "#FDE100", stadium: "Signal Iduna Park", capacity: 81365, apiId: 165 },
        { id: "leipzig",    name: "RB Leipzig",             shortName: "RBL", prestige: 4, budget: 130, color: "#DD0741", stadium: "Red Bull Arena",    capacity: 47069, apiId: 173 },
        { id: "leverkusen", name: "Bayer 04 Leverkusen",    shortName: "B04", prestige: 4, budget: 120, color: "#E32221", stadium: "BayArena",          capacity: 30210, apiId: 168 },
        { id: "frankfurt",  name: "Eintracht Frankfurt",    shortName: "SGE", prestige: 4, budget: 100, color: "#E1000F", stadium: "Deutsche Bank Park", capacity: 51500, apiId: 169 },
        { id: "wolfsburg",  name: "VfL Wolfsburg",          shortName: "WOB", prestige: 3, budget: 90,  color: "#65B32E", stadium: "Volkswagen Arena",  capacity: 30000, apiId: 161 },
        { id: "mgladbach",  name: "Borussia M'gladbach",    shortName: "BMG", prestige: 3, budget: 85,  color: "#000000", stadium: "Borussia-Park",     capacity: 54057, apiId: 163 },
        { id: "freiburg",   name: "Sport-Club Freiburg",    shortName: "SCF", prestige: 3, budget: 75,  color: "#CC0000", stadium: "Europa-Park Stadion", capacity: 34700, apiId: 160 },
        { id: "mainz",      name: "1. FSV Mainz 05",        shortName: "M05", prestige: 3, budget: 70,  color: "#CC0000", stadium: "MEWA ARENA",        capacity: 33305, apiId: 164 },
        { id: "union_berlin", name: "1. FC Union Berlin",   shortName: "FCU", prestige: 3, budget: 80,  color: "#CC0000", stadium: "Stadion An der Alten Försterei", capacity: 22012, apiId: 182 }
      ]
    },
    {
      id: "serie_a", name: "Serie A", country: "Italy",
      flag: "🇮🇹", tier: 1, color: "#0066CC", accentColor: "#009246",
      prestige: 5, apiId: 135,
      clubs: [
        { id: "inter",      name: "FC Internazionale",  shortName: "INT", prestige: 5, budget: 160, color: "#0068A8", stadium: "Giuseppe Meazza", capacity: 75817, apiId: 505 },
        { id: "juventus",   name: "Juventus FC",         shortName: "JUV", prestige: 5, budget: 170, color: "#000000", stadium: "Allianz Stadium", capacity: 41507, apiId: 496 },
        { id: "milan",      name: "AC Milan",            shortName: "MIL", prestige: 5, budget: 150, color: "#FB090B", stadium: "Giuseppe Meazza", capacity: 75817, apiId: 489 },
        { id: "napoli",     name: "SSC Napoli",          shortName: "NAP", prestige: 5, budget: 140, color: "#12A0C3", stadium: "Stadio Diego Maradona", capacity: 54726, apiId: 492 },
        { id: "roma",       name: "AS Roma",             shortName: "ROM", prestige: 4, budget: 120, color: "#8E1F2F", stadium: "Stadio Olimpico", capacity: 70634, apiId: 497 },
        { id: "lazio",      name: "SS Lazio",            shortName: "LAZ", prestige: 4, budget: 100, color: "#87D8F7", stadium: "Stadio Olimpico", capacity: 70634, apiId: 487 },
        { id: "atalanta",   name: "Atalanta BC",         shortName: "ATA", prestige: 4, budget: 95,  color: "#1E3870", stadium: "Gewiss Stadium",  capacity: 21300, apiId: 499 },
        { id: "fiorentina", name: "ACF Fiorentina",      shortName: "FIO", prestige: 4, budget: 90,  color: "#4B0082", stadium: "Artemio Franchi", capacity: 43147, apiId: 502 },
        { id: "bologna",    name: "Bologna FC",          shortName: "BOL", prestige: 3, budget: 80,  color: "#003D99", stadium: "Stadio Renato Dall'Ara", capacity: 38289, apiId: 500 },
        { id: "torino",     name: "Torino FC",           shortName: "TOR", prestige: 3, budget: 75,  color: "#8B1C23", stadium: "Stadio Grande Torino", capacity: 28177, apiId: 503 }
      ]
    },
    {
      id: "ligue1", name: "Ligue 1", country: "France",
      flag: "🇫🇷", tier: 1, color: "#1B2A4A", accentColor: "#EF3340",
      prestige: 4, apiId: 61,
      clubs: [
        { id: "psg",     name: "Paris Saint-Germain", shortName: "PSG", prestige: 5, budget: 220, color: "#003370", stadium: "Parc des Princes",  capacity: 47929, apiId: 85  },
        { id: "monaco",  name: "AS Monaco",            shortName: "MON", prestige: 4, budget: 110, color: "#CE1126", stadium: "Stade Louis II",    capacity: 18523, apiId: 91  },
        { id: "lyon",    name: "Olympique Lyonnais",   shortName: "OLY", prestige: 4, budget: 100, color: "#2C5898", stadium: "Groupama Stadium",  capacity: 59186, apiId: 80  },
        { id: "marseille",name: "Olympique de Marseille", shortName: "OM", prestige: 4, budget: 95, color: "#2FAEE0", stadium: "Orange Vélodrome", capacity: 67394, apiId: 81  },
        { id: "rennes",  name: "Stade Rennais FC",     shortName: "REN", prestige: 3, budget: 70,  color: "#CC0000", stadium: "Roazhon Park",      capacity: 29778, apiId: 94  },
        { id: "lille",   name: "LOSC Lille",           shortName: "LIL", prestige: 4, budget: 85,  color: "#CC0000", stadium: "Stade Pierre-Mauroy", capacity: 50157, apiId: 79 }
      ]
    },
    {
      id: "liga_mx", name: "Liga MX", country: "Mexico",
      flag: "🇲🇽", tier: 1, color: "#006847", accentColor: "#CE1126",
      prestige: 4, apiId: 262,
      clubs: [
        { id: "america",     name: "Club América",         shortName: "AME", prestige: 5, budget: 90,  color: "#FFD700", stadium: "Estadio Azteca",       capacity: 87523, apiId: 2284 },
        { id: "chivas",      name: "C.D. Guadalajara",     shortName: "GDL", prestige: 5, budget: 80,  color: "#CC0000", stadium: "Estadio Akron",         capacity: 49850, apiId: 2283 },
        { id: "cruz_azul",   name: "Cruz Azul",            shortName: "CAZ", prestige: 4, budget: 75,  color: "#1E5AA8", stadium: "Estadio Azteca",        capacity: 87523, apiId: 2285 },
        { id: "unam",        name: "Club Universidad (Pumas)", shortName: "PUM", prestige: 4, budget: 65, color: "#003DA5", stadium: "Estadio Olímpico Universitario", capacity: 72000, apiId: 2286 },
        { id: "tigres",      name: "Tigres UANL",          shortName: "TIG", prestige: 4, budget: 85,  color: "#FFD700", stadium: "Estadio Universitario", capacity: 41608, apiId: 2289 },
        { id: "monterrey",   name: "CF Monterrey",         shortName: "MTY", prestige: 4, budget: 80,  color: "#003285", stadium: "Estadio BBVA",          capacity: 51000, apiId: 2287 }
      ]
    },
    {
      id: "eredivisie", name: "Eredivisie", country: "Netherlands",
      flag: "🇳🇱", tier: 1, color: "#FF6600", accentColor: "#003087",
      prestige: 4, apiId: 88,
      clubs: [
        { id: "ajax",      name: "AFC Ajax",       shortName: "AJA", prestige: 5, budget: 110, color: "#D2122E", stadium: "Johan Cruyff Arena", capacity: 54990, apiId: 194 },
        { id: "psv",       name: "PSV Eindhoven",  shortName: "PSV", prestige: 5, budget: 100, color: "#CC0000", stadium: "Philips Stadion",   capacity: 35000, apiId: 197 },
        { id: "feyenoord", name: "Feyenoord",      shortName: "FEY", prestige: 4, budget: 90,  color: "#CC0000", stadium: "De Kuip",           capacity: 51117, apiId: 193 },
        { id: "az",        name: "AZ Alkmaar",     shortName: "AZ",  prestige: 3, budget: 55,  color: "#CC0000", stadium: "AFAS Stadion",      capacity: 17024, apiId: 196 },
        { id: "twente",    name: "FC Twente",      shortName: "TWE", prestige: 3, budget: 45,  color: "#CC0000", stadium: "De Grolsch Veste",  capacity: 30205, apiId: 195 },
        { id: "utrecht",   name: "FC Utrecht",     shortName: "UTR", prestige: 3, budget: 40,  color: "#CC0000", stadium: "Stadion Galgenwaard", capacity: 24500, apiId: 200 }
      ]
    },
    {
      id: "mls", name: "MLS", country: "USA",
      flag: "🇺🇸", tier: 1, color: "#1A1A2E", accentColor: "#E8003D",
      prestige: 3, apiId: 253,
      clubs: [
        { id: "galaxy",   name: "LA Galaxy",         shortName: "LAG", prestige: 4, budget: 70,  color: "#00245D", stadium: "Dignity Health Sports Park", capacity: 27000, apiId: 1611  },
        { id: "lafc",     name: "LAFC",               shortName: "LAF", prestige: 4, budget: 75,  color: "#C39E6D", stadium: "BMO Stadium",               capacity: 22000, apiId: 10260 },
        { id: "nycfc",    name: "New York City FC",   shortName: "NYC", prestige: 3, budget: 60,  color: "#6CACE4", stadium: "Yankee Stadium",            capacity: 30321, apiId: 1612  },
        { id: "seattle",  name: "Seattle Sounders FC",shortName: "SEA", prestige: 4, budget: 65,  color: "#5D9732", stadium: "Lumen Field",               capacity: 69000, apiId: 1618  },
        { id: "portland", name: "Portland Timbers",   shortName: "POR", prestige: 3, budget: 55,  color: "#004812", stadium: "Providence Park",           capacity: 25218, apiId: 1616  },
        { id: "atlanta",  name: "Atlanta United FC",  shortName: "ATL", prestige: 3, budget: 60,  color: "#80000A", stadium: "Mercedes-Benz Stadium",     capacity: 71000, apiId: 10222 }
      ]
    }
  ],

  leagues2: [
    {
      id: "championship", name: "Championship", country: "England",
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier: 2, color: "#2c1654", accentColor: "#a0e6ff",
      prestige: 3, apiId: 40,
      clubs: [
        { id: "leeds",        name: "Leeds United",    shortName: "LEE", prestige: 3, budget: 35, color: "#FFCD00", stadium: "Elland Road",           capacity: 37890, apiId: 63   },
        { id: "sunderland",   name: "Sunderland AFC",  shortName: "SUN", prestige: 2, budget: 20, color: "#EB172B", stadium: "Stadium of Light",      capacity: 49000, apiId: 69   },
        { id: "sheffield_utd",name: "Sheffield United",shortName: "SHU", prestige: 2, budget: 22, color: "#EE2737", stadium: "Bramall Lane",          capacity: 32702, apiId: 62   },
        { id: "millwall",     name: "Millwall FC",     shortName: "MIL", prestige: 2, budget: 12, color: "#001D5E", stadium: "The Den",               capacity: 20146, apiId: 76   },
        { id: "blackburn",    name: "Blackburn Rovers",shortName: "BBR", prestige: 2, budget: 14, color: "#009EE0", stadium: "Ewood Park",            capacity: 31367, apiId: 68   },
        { id: "middlesbrough",name: "Middlesbrough",   shortName: "MID", prestige: 2, budget: 18, color: "#DA020E", stadium: "Riverside Stadium",     capacity: 34742, apiId: 77   },
        { id: "burnley2",     name: "Burnley FC",      shortName: "BUR", prestige: 2, budget: 16, color: "#6C1D45", stadium: "Turf Moor",             capacity: 21944, apiId: 44   },
        { id: "norwich",      name: "Norwich City",    shortName: "NOR", prestige: 2, budget: 20, color: "#00A650", stadium: "Carrow Road",           capacity: 27359, apiId: 71   }
      ]
    },
    {
      id: "segunda_division", name: "Segunda División", country: "Spain",
      flag: "🇪🇸", tier: 2, color: "#c0392b", accentColor: "#FFD700",
      prestige: 3, apiId: 141,
      clubs: [
        { id: "zaragoza",   name: "Real Zaragoza",    shortName: "ZAR", prestige: 3, budget: 18, color: "#002F6C", stadium: "La Romareda",            capacity: 34596, apiId: 754 },
        { id: "tenerife",   name: "CD Tenerife",      shortName: "TEN", prestige: 2, budget: 12, color: "#0057A8", stadium: "Heliodoro Rodríguez",    capacity: 22800, apiId: 758 },
        { id: "leganes",    name: "CD Leganés",       shortName: "LEG", prestige: 2, budget: 15, color: "#004899", stadium: "Estadio Municipal",      capacity: 12454, apiId: 724 },
        { id: "huesca",     name: "SD Huesca",        shortName: "HUE", prestige: 2, budget: 8,  color: "#004F9E", stadium: "El Alcoraz",             capacity: 7600,  apiId: 731 },
        { id: "mirandes",   name: "CD Mirandés",      shortName: "MIR", prestige: 1, budget: 6,  color: "#DA0000", stadium: "Estadio Anduva",         capacity: 5600,  apiId: 757 },
        { id: "cartagena",  name: "FC Cartagena",     shortName: "CAR", prestige: 2, budget: 10, color: "#002868", stadium: "Estadio Cartagonova",    capacity: 13000, apiId: 2290 }
      ]
    },
    {
      id: "bundesliga2", name: "2. Bundesliga", country: "Germany",
      flag: "🇩🇪", tier: 2, color: "#b20020", accentColor: "#FFD700",
      prestige: 3, apiId: 79,
      clubs: [
        { id: "hamburger_sv",    name: "Hamburger SV",       shortName: "HSV", prestige: 3, budget: 28, color: "#005CA9", stadium: "Volksparkstadion",       capacity: 57000, apiId: 176 },
        { id: "schalke",         name: "FC Schalke 04",      shortName: "S04", prestige: 3, budget: 25, color: "#004D9D", stadium: "Veltins-Arena",          capacity: 62271, apiId: 167 },
        { id: "hannover",        name: "Hannover 96",        shortName: "H96", prestige: 2, budget: 15, color: "#006B2B", stadium: "HDI Arena",              capacity: 49200, apiId: 170 },
        { id: "kaiserslautern",  name: "1. FC Kaiserslautern", shortName: "FCK", prestige: 2, budget: 12, color: "#DD0000", stadium: "Fritz Walter Stadion", capacity: 49780, apiId: 174 },
        { id: "nurnberg",        name: "1. FC Nürnberg",     shortName: "FCN", prestige: 2, budget: 16, color: "#800000", stadium: "Max Morlock Stadion",    capacity: 50000, apiId: 175 },
        { id: "hertha",          name: "Hertha BSC",         shortName: "BSC", prestige: 3, budget: 22, color: "#005CA9", stadium: "Olympiastadion",         capacity: 74667, apiId: 159 }
      ]
    },
    {
      id: "serie_b", name: "Serie B", country: "Italy",
      flag: "🇮🇹", tier: 2, color: "#003e99", accentColor: "#009246",
      prestige: 3, apiId: 136,
      clubs: [
        { id: "sampdoria", name: "UC Sampdoria", shortName: "SAM", prestige: 3, budget: 20, color: "#0000FF", stadium: "Luigi Ferraris",         capacity: 36536, apiId: 511 },
        { id: "parma",     name: "Parma Calcio", shortName: "PAR", prestige: 3, budget: 22, color: "#FFF200", stadium: "Stadio Ennio Tardini",   capacity: 27906, apiId: 512 },
        { id: "brescia",   name: "Brescia Calcio",shortName: "BRE", prestige: 2, budget: 14, color: "#003DA5", stadium: "Stadio Mario Rigamonti", capacity: 16700, apiId: 519 },
        { id: "bari",      name: "SSC Bari",     shortName: "BAR", prestige: 2, budget: 12, color: "#CC0000", stadium: "Stadio San Nicola",      capacity: 58270, apiId: 517 },
        { id: "palermo",   name: "Palermo FC",   shortName: "PAL", prestige: 2, budget: 15, color: "#F5A623", stadium: "Stadio Renzo Barbera",   capacity: 37619, apiId: 515 },
        { id: "spezia",    name: "Spezia Calcio",shortName: "SPE", prestige: 2, budget: 16, color: "#FFFFFF", stadium: "Stadio Alberto Picco",   capacity: 10336, apiId: 514 }
      ]
    },
    {
      id: "ligue2", name: "Ligue 2", country: "France",
      flag: "🇫🇷", tier: 2, color: "#0f1e3a", accentColor: "#EF3340",
      prestige: 2, apiId: 62,
      clubs: [
        { id: "metz",    name: "FC Metz",       shortName: "MET", prestige: 2, budget: 18, color: "#95006E", stadium: "Stade Saint-Symphorien",  capacity: 25636, apiId: 97  },
        { id: "caen",    name: "SM Caen",       shortName: "SMC", prestige: 2, budget: 14, color: "#C5081E", stadium: "Stade Michel d'Ornano",   capacity: 21684, apiId: 100 },
        { id: "troyes",  name: "ESTAC Troyes",  shortName: "TRO", prestige: 2, budget: 15, color: "#003DA5", stadium: "Stade de l'Aube",        capacity: 20400, apiId: 95  },
        { id: "auxerre2",name: "AJ Auxerre",    shortName: "AJA", prestige: 2, budget: 16, color: "#003399", stadium: "Stade de l'Abbé-Deschamps", capacity: 24493, apiId: 87 },
        { id: "guingamp",name: "EA Guingamp",   shortName: "EAG", prestige: 2, budget: 12, color: "#CC0000", stadium: "Stade du Roudourou",      capacity: 18120, apiId: 93  },
        { id: "grenoble",name: "Grenoble Foot", shortName: "GRE", prestige: 1, budget: 7,  color: "#0000CC", stadium: "Stade des Alpes",         capacity: 20068, apiId: 99  }
      ]
    },
    {
      id: "liga_expansion", name: "Liga de Expansión MX", country: "Mexico",
      flag: "🇲🇽", tier: 2, color: "#004a2a", accentColor: "#CE1126",
      prestige: 2, apiId: 268,
      clubs: [
        { id: "atlante",    name: "Atlante FC",             shortName: "ATL", prestige: 2, budget: 8,  color: "#003DA5", stadium: "Estadio Olímpico",       capacity: 20000, apiId: 2296 },
        { id: "alebrijes",  name: "Alebrijes de Oaxaca",    shortName: "ALE", prestige: 1, budget: 5,  color: "#009A44", stadium: "Estadio Benito Juárez",  capacity: 10000, apiId: 2297 },
        { id: "cimarrones", name: "Cimarrones de Sonora",   shortName: "CIM", prestige: 1, budget: 5,  color: "#9B2335", stadium: "Estadio Héroe de Nacozari", capacity: 10000, apiId: 2298 },
        { id: "celaya",     name: "FC Celaya",              shortName: "CEL", prestige: 1, budget: 6,  color: "#003DA5", stadium: "Estadio Miguel Alemán",  capacity: 25000, apiId: 2299 },
        { id: "tapatio",    name: "Tapatío FC",             shortName: "TAP", prestige: 2, budget: 7,  color: "#BC1028", stadium: "Estadio Olímpico",       capacity: 12000, apiId: 2300 },
        { id: "cancun",     name: "Cancún FC",              shortName: "CAN", prestige: 1, budget: 4,  color: "#00A3E0", stadium: "Estadio Andrés Quintana Roo", capacity: 16000, apiId: 2301 }
      ]
    }
  ],

  countries: [
    { code:"AR", name:"Argentina",    flag:"🇦🇷" },
    { code:"BR", name:"Brasil",       flag:"🇧🇷" },
    { code:"CO", name:"Colombia",     flag:"🇨🇴" },
    { code:"MX", name:"México",       flag:"🇲🇽" },
    { code:"UY", name:"Uruguay",      flag:"🇺🇾" },
    { code:"CL", name:"Chile",        flag:"🇨🇱" },
    { code:"PE", name:"Perú",         flag:"🇵🇪" },
    { code:"VE", name:"Venezuela",    flag:"🇻🇪" },
    { code:"EC", name:"Ecuador",      flag:"🇪🇨" },
    { code:"PY", name:"Paraguay",     flag:"🇵🇾" },
    { code:"BO", name:"Bolivia",      flag:"🇧🇴" },
    { code:"GB", name:"Inglaterra",   flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { code:"ES", name:"España",       flag:"🇪🇸" },
    { code:"DE", name:"Alemania",     flag:"🇩🇪" },
    { code:"IT", name:"Italia",       flag:"🇮🇹" },
    { code:"FR", name:"Francia",      flag:"🇫🇷" },
    { code:"PT", name:"Portugal",     flag:"🇵🇹" },
    { code:"NL", name:"Países Bajos", flag:"🇳🇱" },
    { code:"BE", name:"Bélgica",      flag:"🇧🇪" },
    { code:"HR", name:"Croacia",      flag:"🇭🇷" },
    { code:"RS", name:"Serbia",       flag:"🇷🇸" },
    { code:"NG", name:"Nigeria",      flag:"🇳🇬" },
    { code:"SN", name:"Senegal",      flag:"🇸🇳" },
    { code:"GH", name:"Ghana",        flag:"🇬🇭" },
    { code:"CI", name:"Costa de Marfil", flag:"🇨🇮" },
    { code:"MA", name:"Marruecos",    flag:"🇲🇦" },
    { code:"CM", name:"Camerún",      flag:"🇨🇲" },
    { code:"NG", name:"Nigeria",      flag:"🇳🇬" },
    { code:"JP", name:"Japón",        flag:"🇯🇵" },
    { code:"KR", name:"Corea del Sur",flag:"🇰🇷" },
    { code:"US", name:"Estados Unidos",flag:"🇺🇸" },
    { code:"CA", name:"Canadá",       flag:"🇨🇦" }
  ]
};
