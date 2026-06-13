// Mundial 2026 — datos de RESPALDO (se usan solo si no hay API key configurada).
// Con FOOTBALL_DATA_KEY puesta, la app ignora esto y tira de la API en vivo.
// Marcador null = aún no jugado. Con marcador => "Final"; sin marcador => "Próximo".

const TEAMS = {
  "México": "🇲🇽", "Corea del Sur": "🇰🇷", "República Checa": "🇨🇿", "Sudáfrica": "🇿🇦",
  "Estados Unidos": "🇺🇸", "Paraguay": "🇵🇾", "Canadá": "🇨🇦", "Bosnia": "🇧🇦",
  "Australia": "🇦🇺", "Turquía": "🇹🇷", "Qatar": "🇶🇦", "Suiza": "🇨🇭",
  "Haití": "🇭🇹", "Escocia": "🏴\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", "Brasil": "🇧🇷", "Marruecos": "🇲🇦",
  "Suecia": "🇸🇪", "Túnez": "🇹🇳", "Alemania": "🇩🇪", "Curazao": "🇨🇼",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Costa de Marfil": "🇨🇮", "Ecuador": "🇪🇨",
  "Bélgica": "🇧🇪", "Egipto": "🇪🇬", "Irán": "🇮🇷", "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸", "Cabo Verde": "🇨🇻", "Arabia Saudita": "🇸🇦", "Uruguay": "🇺🇾",
  "Austria": "🇦🇹", "Jordania": "🇯🇴", "Argentina": "🇦🇷", "Argelia": "🇩🇿",
  "Irak": "🇮🇶", "Noruega": "🇳🇴", "Francia": "🇫🇷", "Senegal": "🇸🇳",
  "Uzbekistán": "🇺🇿", "Colombia": "🇨🇴", "Portugal": "🇵🇹", "RD Congo": "🇨🇩",
  "Inglaterra": "🏴\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦",
};

const GROUPS = {
  A: ["México", "Corea del Sur", "República Checa", "Sudáfrica"],
  B: ["Estados Unidos", "Paraguay", "Canadá", "Bosnia"],
  C: ["Australia", "Turquía", "Qatar", "Suiza"],
  D: ["Haití", "Escocia", "Brasil", "Marruecos"],
  E: ["Suecia", "Túnez", "Alemania", "Curazao"],
  F: ["Países Bajos", "Japón", "Costa de Marfil", "Ecuador"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Austria", "Jordania", "Argentina", "Argelia"],
  J: ["Irak", "Noruega", "Francia", "Senegal"],
  K: ["Uzbekistán", "Colombia", "Portugal", "RD Congo"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

// h = local, a = visitante, hs/as = marcador (null si no jugado)
const FIXTURES = [
  // Jornada 1
  { g: "A", h: "México", a: "Sudáfrica", hs: 2, as: 0, date: "11 jun", venue: "Estadio Azteca, CDMX" },
  { g: "A", h: "Corea del Sur", a: "República Checa", hs: 2, as: 1, date: "11 jun", venue: "Estadio Akron, Guadalajara" },
  { g: "B", h: "Canadá", a: "Bosnia", hs: 1, as: 1, date: "12 jun", venue: "BMO Field, Toronto" },
  { g: "B", h: "Estados Unidos", a: "Paraguay", hs: 4, as: 1, date: "12 jun", venue: "SoFi Stadium, Los Ángeles" },
  { g: "C", h: "Qatar", a: "Suiza", hs: null, as: null, date: "13 jun", venue: "Lumen Field, Seattle" },
  { g: "C", h: "Australia", a: "Turquía", hs: null, as: null, date: "13 jun", venue: "Levi's Stadium, San Francisco" },
  { g: "D", h: "Brasil", a: "Marruecos", hs: null, as: null, date: "13 jun", venue: "MetLife, Nueva York" },
  { g: "D", h: "Haití", a: "Escocia", hs: null, as: null, date: "13 jun", venue: "Hard Rock, Miami" },
  { g: "E", h: "Alemania", a: "Curazao", hs: null, as: null, date: "14 jun", venue: "Arrowhead, Kansas City" },
  { g: "E", h: "Suecia", a: "Túnez", hs: null, as: null, date: "14 jun", venue: "Gillette, Boston" },
  { g: "F", h: "Países Bajos", a: "Ecuador", hs: null, as: null, date: "14 jun", venue: "Lincoln Financial, Filadelfia" },
  { g: "F", h: "Japón", a: "Costa de Marfil", hs: null, as: null, date: "14 jun", venue: "AT&T Stadium, Dallas" },
  { g: "G", h: "Bélgica", a: "Nueva Zelanda", hs: null, as: null, date: "15 jun", venue: "NRG Stadium, Houston" },
  { g: "G", h: "Egipto", a: "Irán", hs: null, as: null, date: "15 jun", venue: "Mercedes-Benz, Atlanta" },
  { g: "H", h: "España", a: "Uruguay", hs: null, as: null, date: "15 jun", venue: "Estadio BBVA, Monterrey" },
  { g: "H", h: "Cabo Verde", a: "Arabia Saudita", hs: null, as: null, date: "15 jun", venue: "BC Place, Vancouver" },
  { g: "I", h: "Argentina", a: "Argelia", hs: null, as: null, date: "16 jun", venue: "Estadio Azteca, CDMX" },
  { g: "I", h: "Austria", a: "Jordania", hs: null, as: null, date: "16 jun", venue: "SoFi Stadium, Los Ángeles" },
  { g: "J", h: "Francia", a: "Senegal", hs: null, as: null, date: "16 jun", venue: "MetLife, Nueva York" },
  { g: "J", h: "Irak", a: "Noruega", hs: null, as: null, date: "16 jun", venue: "BMO Field, Toronto" },
  { g: "K", h: "Portugal", a: "RD Congo", hs: null, as: null, date: "17 jun", venue: "Hard Rock, Miami" },
  { g: "K", h: "Uzbekistán", a: "Colombia", hs: null, as: null, date: "17 jun", venue: "Lumen Field, Seattle" },
  { g: "L", h: "Inglaterra", a: "Panamá", hs: null, as: null, date: "17 jun", venue: "Arrowhead, Kansas City" },
  { g: "L", h: "Croacia", a: "Ghana", hs: null, as: null, date: "17 jun", venue: "Gillette, Boston" },
];
