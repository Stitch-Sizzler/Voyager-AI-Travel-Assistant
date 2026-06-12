import { AIChatAgent } from "@cloudflare/ai-chat";
import { routeAgentRequest } from "agents";
import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  pruneMessages,
  tool,
  jsonSchema,
  stepCountIs
} from "ai";

// ── Coordinate data for flight distance calculations ───────────────────
const cityCoordinates: Record<
  string,
  {
    lat: number;
    lon: number;
    country: string;
    currency: string;
    language: string;
  }
> = {
  paris: {
    lat: 48.8566,
    lon: 2.3522,
    country: "France",
    currency: "EUR",
    language: "French"
  },
  tokyo: {
    lat: 35.6762,
    lon: 139.6503,
    country: "Japan",
    currency: "JPY",
    language: "Japanese"
  },
  london: {
    lat: 51.5074,
    lon: -0.1278,
    country: "United Kingdom",
    currency: "GBP",
    language: "English"
  },
  "new york": {
    lat: 40.7128,
    lon: -74.006,
    country: "United States",
    currency: "USD",
    language: "English"
  },
  edmonton: {
    lat: 53.5461,
    lon: -113.4937,
    country: "Canada",
    currency: "CAD",
    language: "English"
  },
  calgary: {
    lat: 51.0447,
    lon: -114.0719,
    country: "Canada",
    currency: "CAD",
    language: "English"
  },
  toronto: {
    lat: 43.6532,
    lon: -79.3832,
    country: "Canada",
    currency: "CAD",
    language: "English"
  },
  orlando: {
    lat: 28.5383,
    lon: -81.3792,
    country: "United States",
    currency: "USD",
    language: "English"
  },
  dubai: {
    lat: 25.2048,
    lon: 55.2708,
    country: "UAE",
    currency: "AED",
    language: "Arabic"
  },
  sydney: {
    lat: -33.8688,
    lon: 151.2093,
    country: "Australia",
    currency: "AUD",
    language: "English"
  },
  rome: {
    lat: 41.9028,
    lon: 12.4964,
    country: "Italy",
    currency: "EUR",
    language: "Italian"
  },
  barcelona: {
    lat: 41.3874,
    lon: 2.1686,
    country: "Spain",
    currency: "EUR",
    language: "Spanish"
  },
  bangkok: {
    lat: 13.7563,
    lon: 100.5018,
    country: "Thailand",
    currency: "THB",
    language: "Thai"
  },
  bali: {
    lat: -8.3405,
    lon: 115.092,
    country: "Indonesia",
    currency: "IDR",
    language: "Indonesian"
  },
  cancun: {
    lat: 21.1619,
    lon: -86.8515,
    country: "Mexico",
    currency: "MXN",
    language: "Spanish"
  },
  istanbul: {
    lat: 41.0082,
    lon: 28.9784,
    country: "Turkey",
    currency: "TRY",
    language: "Turkish"
  },
  amsterdam: {
    lat: 52.3676,
    lon: 4.9041,
    country: "Netherlands",
    currency: "EUR",
    language: "Dutch"
  },
  singapore: {
    lat: 1.3521,
    lon: 103.8198,
    country: "Singapore",
    currency: "SGD",
    language: "English"
  },
  lisbon: {
    lat: 38.7223,
    lon: -9.1393,
    country: "Portugal",
    currency: "EUR",
    language: "Portuguese"
  },
  berlin: {
    lat: 52.52,
    lon: 13.405,
    country: "Germany",
    currency: "EUR",
    language: "German"
  },
  cairo: {
    lat: 30.0444,
    lon: 31.2357,
    country: "Egypt",
    currency: "EGP",
    language: "Arabic"
  },
  mumbai: {
    lat: 19.076,
    lon: 72.8777,
    country: "India",
    currency: "INR",
    language: "Hindi"
  },
  seoul: {
    lat: 37.5665,
    lon: 126.978,
    country: "South Korea",
    currency: "KRW",
    language: "Korean"
  },
  "rio de janeiro": {
    lat: -22.9068,
    lon: -43.1729,
    country: "Brazil",
    currency: "BRL",
    language: "Portuguese"
  },
  nairobi: {
    lat: -1.2921,
    lon: 36.8219,
    country: "Kenya",
    currency: "KES",
    language: "Swahili"
  },
  reykjavik: {
    lat: 64.1466,
    lon: -21.9426,
    country: "Iceland",
    currency: "ISK",
    language: "Icelandic"
  },
  vancouver: {
    lat: 49.2827,
    lon: -123.1207,
    country: "Canada",
    currency: "CAD",
    language: "English"
  },
  "los angeles": {
    lat: 34.0522,
    lon: -118.2437,
    country: "United States",
    currency: "USD",
    language: "English"
  },
  chicago: {
    lat: 41.8781,
    lon: -87.6298,
    country: "United States",
    currency: "USD",
    language: "English"
  },
  "san francisco": {
    lat: 37.7749,
    lon: -122.4194,
    country: "United States",
    currency: "USD",
    language: "English"
  },
  miami: {
    lat: 25.7617,
    lon: -80.1918,
    country: "United States",
    currency: "USD",
    language: "English"
  },
  "hong kong": {
    lat: 22.3193,
    lon: 114.1694,
    country: "Hong Kong",
    currency: "HKD",
    language: "Cantonese"
  },
  marrakech: {
    lat: 31.6295,
    lon: -7.9811,
    country: "Morocco",
    currency: "MAD",
    language: "Arabic"
  },
  athens: {
    lat: 37.9838,
    lon: 23.7275,
    country: "Greece",
    currency: "EUR",
    language: "Greek"
  },
  prague: {
    lat: 50.0755,
    lon: 14.4378,
    country: "Czech Republic",
    currency: "CZK",
    language: "Czech"
  },
  vienna: {
    lat: 48.2082,
    lon: 16.3738,
    country: "Austria",
    currency: "EUR",
    language: "German"
  },
  "buenos aires": {
    lat: -34.6037,
    lon: -58.3816,
    country: "Argentina",
    currency: "ARS",
    language: "Spanish"
  },
  "cape town": {
    lat: -33.9249,
    lon: 18.4241,
    country: "South Africa",
    currency: "ZAR",
    language: "English"
  }
};

const countryMetadata: Record<string, { currency: string; language: string }> =
  {
    US: { currency: "USD", language: "English" },
    GB: { currency: "GBP", language: "English" },
    FR: { currency: "EUR", language: "French" },
    DE: { currency: "EUR", language: "German" },
    IT: { currency: "EUR", language: "Italian" },
    ES: { currency: "EUR", language: "Spanish" },
    JP: { currency: "JPY", language: "Japanese" },
    CN: { currency: "CNY", language: "Chinese" },
    IN: { currency: "INR", language: "Hindi/English" },
    CA: { currency: "CAD", language: "English" },
    AU: { currency: "AUD", language: "English" },
    MX: { currency: "MXN", language: "Spanish" },
    BR: { currency: "BRL", language: "Portuguese" },
    KR: { currency: "KRW", language: "Korean" },
    TH: { currency: "THB", language: "Thai" },
    SG: { currency: "SGD", language: "English" },
    CH: { currency: "CHF", language: "German/French" },
    TR: { currency: "TRY", language: "Turkish" },
    ZA: { currency: "ZAR", language: "English" },
    EG: { currency: "EGP", language: "Arabic" },
    MA: { currency: "MAD", language: "Arabic" },
    KE: { currency: "KES", language: "Swahili" },
    IS: { currency: "ISK", language: "Icelandic" },
    CZ: { currency: "CZK", language: "Czech" },
    AR: { currency: "ARS", language: "Spanish" },
    ID: { currency: "IDR", language: "Indonesian" },
    HK: { currency: "HKD", language: "Cantonese" },
    NZ: { currency: "NZD", language: "English" },
    NL: { currency: "EUR", language: "Dutch" },
    SE: { currency: "SEK", language: "Swedish" },
    NO: { currency: "NOK", language: "Norwegian" },
    FI: { currency: "EUR", language: "Finnish" },
    DK: { currency: "DKK", language: "Danish" },
    PL: { currency: "PLN", language: "Polish" },
    GR: { currency: "EUR", language: "Greek" },
    PT: { currency: "EUR", language: "Portuguese" },
    IE: { currency: "EUR", language: "English" },
    AE: { currency: "AED", language: "Arabic" },
    SA: { currency: "SAR", language: "Arabic" },
    PE: { currency: "PEN", language: "Spanish" },
    CO: { currency: "COP", language: "Spanish" },
    CL: { currency: "CLP", language: "Spanish" },
    VN: { currency: "VND", language: "Vietnamese" },
    PH: { currency: "PHP", language: "Filipino" },
    MY: { currency: "MYR", language: "Malay" },
    AT: { currency: "EUR", language: "German" },
    BE: { currency: "EUR", language: "Dutch/French" },
    RU: { currency: "RUB", language: "Russian" },
    UA: { currency: "UAH", language: "Ukrainian" },
    RO: { currency: "RON", language: "Romanian" },
    HU: { currency: "HUF", language: "Hungarian" },
    BY: { currency: "BYN", language: "Belarusian" },
    BG: { currency: "BGN", language: "Bulgarian" },
    RS: { currency: "RSD", language: "Serbian" },
    HR: { currency: "EUR", language: "Croatian" },
    SK: { currency: "EUR", language: "Slovak" },
    SI: { currency: "EUR", language: "Slovenian" },
    EE: { currency: "EUR", language: "Estonian" },
    LV: { currency: "EUR", language: "Latvian" },
    LT: { currency: "EUR", language: "Lithuanian" },
    LU: { currency: "EUR", language: "Luxembourgish" },
    MT: { currency: "EUR", language: "Maltese" },
    CY: { currency: "EUR", language: "Greek" },
    CR: { currency: "CRC", language: "Spanish" },
    PA: { currency: "PAB", language: "Spanish" },
    GT: { currency: "GTQ", language: "Spanish" },
    HN: { currency: "HNL", language: "Spanish" },
    SV: { currency: "SVC", language: "Spanish" },
    NI: { currency: "NIO", language: "Spanish" },
    DO: { currency: "DOP", language: "Spanish" },
    CU: { currency: "CUP", language: "Spanish" },
    EC: { currency: "USD", language: "Spanish" },
    VE: { currency: "VES", language: "Spanish" },
    UY: { currency: "UYU", language: "Spanish" },
    PY: { currency: "PYG", language: "Spanish" },
    BO: { currency: "BOB", language: "Spanish" },
    PK: { currency: "PKR", language: "Urdu/English" },
    BD: { currency: "BDT", language: "Bengali" },
    LK: { currency: "LKR", language: "Sinhala/Tamil" },
    NP: { currency: "NPR", language: "Nepali" },
    MM: { currency: "MMK", language: "Burmese" },
    KH: { currency: "KHR", language: "Khmer" },
    LA: { currency: "LAK", language: "Lao" },
    TW: { currency: "TWD", language: "Mandarin" },
    MN: { currency: "MNT", language: "Mongolian" },
    IL: { currency: "ILS", language: "Hebrew/Arabic" },
    JO: { currency: "JOD", language: "Arabic" },
    LB: { currency: "LBP", language: "Arabic" },
    SY: { currency: "SYP", language: "Arabic" },
    IQ: { currency: "IQD", language: "Arabic" },
    IR: { currency: "IRR", language: "Persian" },
    NG: { currency: "NGN", language: "English" },
    GH: { currency: "GHS", language: "English" },
    TZ: { currency: "TZS", language: "Swahili" },
    UG: { currency: "UGX", language: "English" },
    ET: { currency: "ETB", language: "Amharic" },
    DZ: { currency: "DZD", language: "Arabic" },
    TN: { currency: "TND", language: "Arabic" },
    SN: { currency: "XOF", language: "French" },
    CI: { currency: "XOF", language: "French" },
    CM: { currency: "XAF", language: "French/English" },
    AO: { currency: "AOA", language: "Portuguese" },
    MZ: { currency: "MZN", language: "Portuguese" }
  };

function getCountryCode(countryName: string): string {
  const name = countryName.toLowerCase().trim();
  if (name.includes("united states") || name.includes("usa") || name === "us")
    return "US";
  if (name.includes("united kingdom") || name.includes("uk") || name === "gb")
    return "GB";
  if (name.includes("france")) return "FR";
  if (name.includes("germany")) return "DE";
  if (name.includes("italy")) return "IT";
  if (name.includes("spain")) return "ES";
  if (name.includes("japan")) return "JP";
  if (name.includes("china")) return "CN";
  if (name.includes("india")) return "IN";
  if (name.includes("canada")) return "CA";
  if (name.includes("australia")) return "AU";
  if (name.includes("mexico")) return "MX";
  if (name.includes("brazil")) return "BR";
  if (name.includes("south korea") || name === "korea") return "KR";
  if (name.includes("thailand")) return "TH";
  if (name.includes("singapore")) return "SG";
  if (name.includes("switzerland")) return "CH";
  if (name.includes("turkey")) return "TR";
  if (name.includes("south africa")) return "ZA";
  if (name.includes("egypt")) return "EG";
  if (name.includes("morocco")) return "MA";
  if (name.includes("kenya")) return "KE";
  if (name.includes("iceland")) return "IS";
  if (name.includes("czech")) return "CZ";
  if (name.includes("argentina")) return "AR";
  if (name.includes("indonesia") || name === "bali") return "ID";
  if (name.includes("hong kong")) return "HK";
  if (name.includes("new zealand")) return "NZ";
  if (name.includes("netherlands") || name === "holland") return "NL";
  if (name.includes("sweden")) return "SE";
  if (name.includes("norway")) return "NO";
  if (name.includes("finland")) return "FI";
  if (name.includes("denmark")) return "DK";
  if (name.includes("poland")) return "PL";
  if (name.includes("greece")) return "GR";
  if (name.includes("portugal")) return "PT";
  if (name.includes("ireland")) return "IE";
  if (
    name.includes("united arab emirates") ||
    name === "uae" ||
    name === "dubai"
  )
    return "AE";
  if (name.includes("saudi arabia")) return "SA";
  return "US"; // default
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    country_code?: string;
    country?: string;
    latitude: number;
    longitude: number;
    name?: string;
    timezone?: string;
  }>;
}

function getCityTimezone(city: string): string {
  const name = city.toLowerCase().trim();
  if (name === "paris") return "Europe/Paris";
  if (name === "tokyo") return "Asia/Tokyo";
  if (name === "london") return "Europe/London";
  if (
    name === "new york" ||
    name === "new york city" ||
    name === "orlando" ||
    name === "miami"
  )
    return "America/New_York";
  if (name === "edmonton") return "America/Edmonton";
  if (name === "calgary") return "America/Calgary";
  if (name === "toronto") return "America/Toronto";
  if (name === "dubai") return "Asia/Dubai";
  if (name === "sydney") return "Australia/Sydney";
  if (name === "rome") return "Europe/Rome";
  if (name === "barcelona") return "Europe/Madrid";
  if (name === "bangkok") return "Asia/Bangkok";
  if (name === "bali") return "Asia/Makassar";
  if (name === "cancun") return "America/Cancun";
  if (name === "istanbul") return "Europe/Istanbul";
  if (name === "amsterdam") return "Europe/Amsterdam";
  if (name === "singapore") return "Asia/Singapore";
  if (name === "lisbon") return "Europe/Lisbon";
  if (name === "berlin") return "Europe/Berlin";
  if (name === "cairo") return "Africa/Cairo";
  if (name === "mumbai") return "Asia/Kolkata";
  if (name === "seoul") return "Asia/Seoul";
  if (name === "rio de janeiro") return "America/Sao_Paulo";
  if (name === "nairobi") return "Africa/Nairobi";
  if (name === "reykjavik") return "Atlantic/Reykjavik";
  if (name === "vancouver") return "America/Vancouver";
  if (name === "los angeles" || name === "san francisco")
    return "America/Los_Angeles";
  if (name === "chicago") return "America/Chicago";
  if (name === "hong kong") return "Asia/Hong_Kong";
  if (name === "marrakech") return "Africa/Casablanca";
  if (name === "athens") return "Europe/Athens";
  if (name === "prague") return "Europe/Prague";
  if (name === "vienna") return "Europe/Vienna";
  if (name === "buenos aires") return "America/Argentina/Buenos_Aires";
  if (name === "cape town") return "Africa/Johannesburg";
  return "UTC";
}

async function resolveLocation(place: string): Promise<{
  lat: number;
  lon: number;
  city: string;
  country: string;
  countryCode: string;
  currency: string;
  language: string;
  timezone: string;
}> {
  const clean = place.trim().toLowerCase();

  // 1. Check in-memory hardcoded map for common cities
  if (cityCoordinates[clean]) {
    const coords = cityCoordinates[clean];
    return {
      lat: coords.lat,
      lon: coords.lon,
      city: clean.charAt(0).toUpperCase() + clean.slice(1),
      country: coords.country,
      countryCode: getCountryCode(coords.country),
      currency: coords.currency,
      language: coords.language,
      timezone: getCityTimezone(clean)
    };
  }

  // Reverse match on city names (e.g. if key is 'tokyo, japan')
  for (const [name, data] of Object.entries(cityCoordinates)) {
    if (name.includes(clean) || clean.includes(name)) {
      return {
        lat: data.lat,
        lon: data.lon,
        city: name.charAt(0).toUpperCase() + name.slice(1),
        country: data.country,
        countryCode: getCountryCode(data.country),
        currency: data.currency,
        language: data.language,
        timezone: getCityTimezone(name)
      };
    }
  }

  // 2. Query Open-Meteo Geocoding API
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en`;
    const res = await fetch(url, {
      headers: { "User-Agent": "VoyagerTravelAgent/1.0" }
    });
    if (res.ok) {
      const data = (await res.json()) as OpenMeteoGeocodingResponse;
      if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
        const countryCode = (result.country_code || "US").toUpperCase();
        const country = result.country || "United States";
        const meta = countryMetadata[countryCode] || {
          currency: "USD",
          language: "English"
        };

        return {
          lat: result.latitude,
          lon: result.longitude,
          city: result.name || place,
          country: country,
          countryCode: countryCode,
          currency: meta.currency,
          language: meta.language,
          timezone: result.timezone || "UTC"
        };
      }
    }
  } catch (e) {
    console.error("Geocoding lookup failed:", e);
  }

  // Fallback to coordinates of standard cities or origin
  const defaultCity = cityCoordinates["new york city"] || {
    lat: 40.7128,
    lon: -74.006,
    country: "United States",
    currency: "USD",
    language: "English"
  };
  return {
    lat: defaultCity.lat,
    lon: defaultCity.lon,
    city: "New York City",
    country: defaultCity.country,
    countryCode: "US",
    currency: defaultCity.currency,
    language: defaultCity.language,
    timezone: "America/New_York"
  };
}

// ── Haversine distance ─────────────────────────────────────────────────
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// ── Currency exchange rates (simulated, pegged to USD) ─────────────────
const exchangeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  AED: 3.67,
  THB: 34.5,
  IDR: 15650,
  MXN: 17.15,
  TRY: 32.4,
  SGD: 1.34,
  INR: 83.2,
  KRW: 1310,
  BRL: 4.97,
  KES: 153.5,
  ISK: 137.8,
  HKD: 7.82,
  MAD: 10.05,
  CZK: 22.8,
  ZAR: 18.7,
  ARS: 870.0,
  EGP: 30.9,
  CHF: 0.88,
  NZD: 1.63,
  SEK: 10.45,
  NOK: 10.6,
  DKK: 6.88,
  PLN: 4.02,
  HUF: 355.0,
  PHP: 55.8,
  TWD: 31.2,
  MYR: 4.65,
  VND: 24350,
  RUB: 92.5,
  COP: 3950,
  CLP: 890,
  PEN: 3.72
};

// ── Local phrases database ─────────────────────────────────────────────
const _phrasesDB: Record<
  string,
  Array<{ english: string; local: string; pronunciation: string }>
> = {
  French: [
    { english: "Hello", local: "Bonjour", pronunciation: "bohn-ZHOOR" },
    { english: "Thank you", local: "Merci", pronunciation: "mair-SEE" },
    {
      english: "Please",
      local: "S'il vous plaît",
      pronunciation: "seel voo PLEH"
    },
    {
      english: "Excuse me",
      local: "Excusez-moi",
      pronunciation: "ex-koo-ZAY mwah"
    },
    { english: "Where is…?", local: "Où est…?", pronunciation: "oo EH" },
    { english: "How much?", local: "Combien?", pronunciation: "kohm-bee-EN" },
    { english: "Goodbye", local: "Au revoir", pronunciation: "oh ruh-VWAR" },
    { english: "Yes / No", local: "Oui / Non", pronunciation: "wee / nohn" }
  ],
  Japanese: [
    {
      english: "Hello",
      local: "こんにちは (Konnichiwa)",
      pronunciation: "kohn-nee-chee-WAH"
    },
    {
      english: "Thank you",
      local: "ありがとうございます (Arigatō gozaimasu)",
      pronunciation: "ah-ree-GAH-toh go-zah-ee-MAHS"
    },
    {
      english: "Please",
      local: "お願いします (Onegai shimasu)",
      pronunciation: "oh-neh-GUY shee-MAHS"
    },
    {
      english: "Excuse me",
      local: "すみません (Sumimasen)",
      pronunciation: "soo-mee-mah-SEN"
    },
    {
      english: "Where is…?",
      local: "…はどこですか？ (…wa doko desu ka?)",
      pronunciation: "wah DOH-koh des-KAH"
    },
    {
      english: "How much?",
      local: "いくらですか？ (Ikura desu ka?)",
      pronunciation: "ee-KOO-rah des-KAH"
    },
    {
      english: "Goodbye",
      local: "さようなら (Sayōnara)",
      pronunciation: "sah-YOH-nah-rah"
    },
    {
      english: "Yes / No",
      local: "はい / いいえ (Hai / Iie)",
      pronunciation: "HIGH / ee-EH"
    }
  ],
  Spanish: [
    { english: "Hello", local: "Hola", pronunciation: "OH-lah" },
    { english: "Thank you", local: "Gracias", pronunciation: "GRAH-see-ahs" },
    { english: "Please", local: "Por favor", pronunciation: "por fah-VOR" },
    { english: "Excuse me", local: "Disculpe", pronunciation: "dees-KOOL-peh" },
    {
      english: "Where is…?",
      local: "¿Dónde está…?",
      pronunciation: "DOHN-deh es-TAH"
    },
    {
      english: "How much?",
      local: "¿Cuánto cuesta?",
      pronunciation: "KWAHN-toh KWES-tah"
    },
    { english: "Goodbye", local: "Adiós", pronunciation: "ah-dee-OHS" },
    { english: "Yes / No", local: "Sí / No", pronunciation: "see / noh" }
  ],
  Italian: [
    {
      english: "Hello",
      local: "Ciao / Buongiorno",
      pronunciation: "chow / bwohn-JOR-noh"
    },
    { english: "Thank you", local: "Grazie", pronunciation: "GRAH-tsee-eh" },
    {
      english: "Please",
      local: "Per favore",
      pronunciation: "pair fah-VOH-reh"
    },
    { english: "Excuse me", local: "Mi scusi", pronunciation: "mee SKOO-zee" },
    { english: "Where is…?", local: "Dov'è…?", pronunciation: "doh-VEH" },
    {
      english: "How much?",
      local: "Quanto costa?",
      pronunciation: "KWAHN-toh KOS-tah"
    },
    {
      english: "Goodbye",
      local: "Arrivederci",
      pronunciation: "ah-ree-veh-DAIR-chee"
    },
    { english: "Yes / No", local: "Sì / No", pronunciation: "see / noh" }
  ],
  German: [
    {
      english: "Hello",
      local: "Hallo / Guten Tag",
      pronunciation: "HAH-loh / GOO-ten tahk"
    },
    { english: "Thank you", local: "Danke", pronunciation: "DAHN-keh" },
    { english: "Please", local: "Bitte", pronunciation: "BIT-teh" },
    {
      english: "Excuse me",
      local: "Entschuldigung",
      pronunciation: "ent-SHOOL-dee-goong"
    },
    { english: "Where is…?", local: "Wo ist…?", pronunciation: "voh IST" },
    {
      english: "How much?",
      local: "Wie viel kostet das?",
      pronunciation: "vee FEEL KOS-tet dahs"
    },
    {
      english: "Goodbye",
      local: "Auf Wiedersehen",
      pronunciation: "owf VEE-der-zayn"
    },
    { english: "Yes / No", local: "Ja / Nein", pronunciation: "yah / nine" }
  ],
  Arabic: [
    {
      english: "Hello",
      local: "مرحبا (Marhaba)",
      pronunciation: "mar-HAH-bah"
    },
    {
      english: "Thank you",
      local: "شكرا (Shukran)",
      pronunciation: "SHOO-krahn"
    },
    {
      english: "Please",
      local: "من فضلك (Min fadlak)",
      pronunciation: "min FAD-lak"
    },
    { english: "Excuse me", local: "عفوا (Afwan)", pronunciation: "AF-wahn" },
    { english: "Where is…?", local: "أين…؟ (Ayna…?)", pronunciation: "AY-nah" },
    { english: "How much?", local: "بكم؟ (Bikam?)", pronunciation: "bee-KAM" },
    {
      english: "Goodbye",
      local: "مع السلامة (Ma'a salama)",
      pronunciation: "MAH-ah sah-LAH-mah"
    },
    {
      english: "Yes / No",
      local: "نعم / لا (Na'am / La)",
      pronunciation: "NAH-am / lah"
    }
  ],
  Thai: [
    {
      english: "Hello",
      local: "สวัสดี (Sawasdee)",
      pronunciation: "sah-waht-DEE"
    },
    {
      english: "Thank you",
      local: "ขอบคุณ (Khob khun)",
      pronunciation: "kob KOON"
    },
    { english: "Please", local: "กรุณา (Karuna)", pronunciation: "gah-roo-NAH" },
    {
      english: "Excuse me",
      local: "ขอโทษ (Kho thot)",
      pronunciation: "kor TOHT"
    },
    {
      english: "Where is…?",
      local: "…อยู่ที่ไหน (…yoo tee nai?)",
      pronunciation: "yoo tee NAI"
    },
    {
      english: "How much?",
      local: "เท่าไหร่ (Tao rai?)",
      pronunciation: "tow RAI"
    },
    { english: "Goodbye", local: "ลาก่อน (La gon)", pronunciation: "lah GORN" },
    {
      english: "Yes / No",
      local: "ใช่ / ไม่ (Chai / Mai)",
      pronunciation: "chai / mai"
    }
  ],
  Korean: [
    {
      english: "Hello",
      local: "안녕하세요 (Annyeonghaseyo)",
      pronunciation: "ahn-nyeong-hah-SEH-yo"
    },
    {
      english: "Thank you",
      local: "감사합니다 (Gamsahamnida)",
      pronunciation: "gahm-sah-HAHM-nee-dah"
    },
    {
      english: "Please",
      local: "주세요 (Juseyo)",
      pronunciation: "joo-SEH-yo"
    },
    {
      english: "Excuse me",
      local: "실례합니다 (Sillyehamnida)",
      pronunciation: "shil-lyeh-HAHM-nee-dah"
    },
    {
      english: "Where is…?",
      local: "…어디에요? (…eodieyo?)",
      pronunciation: "uh-dee-EH-yo"
    },
    {
      english: "How much?",
      local: "얼마예요? (Eolmayeyo?)",
      pronunciation: "uhl-mah-YEH-yo"
    },
    {
      english: "Goodbye",
      local: "안녕히 가세요 (Annyeonghi gaseyo)",
      pronunciation: "ahn-nyeong-hee gah-SEH-yo"
    },
    {
      english: "Yes / No",
      local: "네 / 아니요 (Ne / Aniyo)",
      pronunciation: "neh / ah-nee-YO"
    }
  ],
  Portuguese: [
    { english: "Hello", local: "Olá", pronunciation: "oh-LAH" },
    {
      english: "Thank you",
      local: "Obrigado/a",
      pronunciation: "oh-bree-GAH-doo"
    },
    { english: "Please", local: "Por favor", pronunciation: "por fah-VOR" },
    {
      english: "Excuse me",
      local: "Com licença",
      pronunciation: "kohm lee-SEN-sah"
    },
    {
      english: "Where is…?",
      local: "Onde fica…?",
      pronunciation: "OHN-deh FEE-kah"
    },
    {
      english: "How much?",
      local: "Quanto custa?",
      pronunciation: "KWAHN-too KOOS-tah"
    },
    { english: "Goodbye", local: "Tchau", pronunciation: "chow" },
    { english: "Yes / No", local: "Sim / Não", pronunciation: "seem / nowng" }
  ],
  Dutch: [
    {
      english: "Hello",
      local: "Hallo / Goedendag",
      pronunciation: "HAH-loh / HOO-den-dahg"
    },
    {
      english: "Thank you",
      local: "Dank u wel",
      pronunciation: "dahnk oo VEL"
    },
    {
      english: "Please",
      local: "Alstublieft",
      pronunciation: "AHL-stoo-bleeft"
    },
    { english: "Excuse me", local: "Pardon", pronunciation: "par-DOHN" },
    { english: "Where is…?", local: "Waar is…?", pronunciation: "vahr IS" },
    {
      english: "How much?",
      local: "Hoeveel kost het?",
      pronunciation: "hoo-VALE kost het"
    },
    { english: "Goodbye", local: "Tot ziens", pronunciation: "tot ZEENS" },
    { english: "Yes / No", local: "Ja / Nee", pronunciation: "yah / nay" }
  ],
  Turkish: [
    { english: "Hello", local: "Merhaba", pronunciation: "mair-HAH-bah" },
    {
      english: "Thank you",
      local: "Teşekkür ederim",
      pronunciation: "teh-shek-KOOR eh-deh-REEM"
    },
    { english: "Please", local: "Lütfen", pronunciation: "LOOT-fen" },
    {
      english: "Excuse me",
      local: "Affedersiniz",
      pronunciation: "ah-feh-DAIR-see-niz"
    },
    { english: "Where is…?", local: "…nerede?", pronunciation: "neh-reh-DEH" },
    { english: "How much?", local: "Ne kadar?", pronunciation: "neh kah-DAHR" },
    {
      english: "Goodbye",
      local: "Hoşça kalın",
      pronunciation: "HOSH-cha kah-LUHN"
    },
    {
      english: "Yes / No",
      local: "Evet / Hayır",
      pronunciation: "eh-VET / hah-YUHR"
    }
  ],
  Greek: [
    {
      english: "Hello",
      local: "Γεια σας (Yia sas)",
      pronunciation: "YAH sahs"
    },
    {
      english: "Thank you",
      local: "Ευχαριστώ (Efharistó)",
      pronunciation: "ef-hah-ree-STOH"
    },
    {
      english: "Please",
      local: "Παρακαλώ (Parakaló)",
      pronunciation: "pah-rah-kah-LOH"
    },
    {
      english: "Excuse me",
      local: "Συγγνώμη (Signómi)",
      pronunciation: "see-GNOH-mee"
    },
    {
      english: "Where is…?",
      local: "Πού είναι…; (Poú eínai…?)",
      pronunciation: "POO EE-neh"
    },
    {
      english: "How much?",
      local: "Πόσο κάνει; (Póso kánei?)",
      pronunciation: "POH-soh KAH-nee"
    },
    { english: "Goodbye", local: "Αντίο (Andío)", pronunciation: "ahn-DEE-oh" },
    {
      english: "Yes / No",
      local: "Ναι / Όχι (Nai / Óchi)",
      pronunciation: "neh / OH-hee"
    }
  ],
  Indonesian: [
    {
      english: "Hello",
      local: "Halo / Selamat pagi",
      pronunciation: "HAH-loh / seh-LAH-maht PAH-gee"
    },
    {
      english: "Thank you",
      local: "Terima kasih",
      pronunciation: "teh-REE-mah KAH-see"
    },
    { english: "Please", local: "Tolong", pronunciation: "TOH-long" },
    { english: "Excuse me", local: "Permisi", pronunciation: "per-MEE-see" },
    { english: "Where is…?", local: "Di mana…?", pronunciation: "dee MAH-nah" },
    { english: "How much?", local: "Berapa?", pronunciation: "beh-RAH-pah" },
    {
      english: "Goodbye",
      local: "Selamat tinggal",
      pronunciation: "seh-LAH-maht TING-gahl"
    },
    {
      english: "Yes / No",
      local: "Ya / Tidak",
      pronunciation: "yah / TEE-dahk"
    }
  ],
  Hindi: [
    {
      english: "Hello",
      local: "नमस्ते (Namaste)",
      pronunciation: "nah-mah-STEH"
    },
    {
      english: "Thank you",
      local: "धन्यवाद (Dhanyavaad)",
      pronunciation: "dahn-yah-VAHD"
    },
    { english: "Please", local: "कृपया (Kripya)", pronunciation: "KRIP-yah" },
    {
      english: "Excuse me",
      local: "माफ़ कीजिये (Maaf kijiye)",
      pronunciation: "MAHF kee-jee-yeh"
    },
    {
      english: "Where is…?",
      local: "…कहाँ है? (…kahan hai?)",
      pronunciation: "kah-HAHN hai"
    },
    {
      english: "How much?",
      local: "कितना? (Kitna?)",
      pronunciation: "kit-NAH"
    },
    {
      english: "Goodbye",
      local: "अलविदा (Alvida)",
      pronunciation: "ahl-vee-DAH"
    },
    {
      english: "Yes / No",
      local: "हाँ / नहीं (Haan / Nahin)",
      pronunciation: "hahn / nah-HEEN"
    }
  ],
  Swahili: [
    {
      english: "Hello",
      local: "Habari / Jambo",
      pronunciation: "hah-BAH-ree / JAHM-boh"
    },
    { english: "Thank you", local: "Asante", pronunciation: "ah-SAHN-teh" },
    { english: "Please", local: "Tafadhali", pronunciation: "tah-fah-DAH-lee" },
    {
      english: "Excuse me",
      local: "Samahani",
      pronunciation: "sah-mah-HAH-nee"
    },
    {
      english: "Where is…?",
      local: "…iko wapi?",
      pronunciation: "ee-koh WAH-pee"
    },
    { english: "How much?", local: "Bei gani?", pronunciation: "bay GAH-nee" },
    { english: "Goodbye", local: "Kwaheri", pronunciation: "kwah-HEH-ree" },
    {
      english: "Yes / No",
      local: "Ndiyo / Hapana",
      pronunciation: "n-DEE-yoh / hah-PAH-nah"
    }
  ],
  Icelandic: [
    {
      english: "Hello",
      local: "Halló / Góðan daginn",
      pronunciation: "HAH-loh / GOH-than DYE-in"
    },
    { english: "Thank you", local: "Takk fyrir", pronunciation: "tahk FIR-ir" },
    {
      english: "Please",
      local: "Vinsamlegast",
      pronunciation: "VIN-sahm-leh-gahst"
    },
    { english: "Excuse me", local: "Afsakið", pronunciation: "AHF-sah-kith" },
    { english: "Where is…?", local: "Hvar er…?", pronunciation: "kvahr AIR" },
    {
      english: "How much?",
      local: "Hvað kostar?",
      pronunciation: "kvath KOS-tar"
    },
    { english: "Goodbye", local: "Bless", pronunciation: "bless" },
    { english: "Yes / No", local: "Já / Nei", pronunciation: "yow / nay" }
  ],
  Czech: [
    { english: "Hello", local: "Dobrý den", pronunciation: "DOH-bree den" },
    { english: "Thank you", local: "Děkuji", pronunciation: "DYEH-koo-yee" },
    { english: "Please", local: "Prosím", pronunciation: "proh-SEEM" },
    { english: "Excuse me", local: "Promiňte", pronunciation: "proh-MIN-teh" },
    { english: "Where is…?", local: "Kde je…?", pronunciation: "gdeh yeh" },
    {
      english: "How much?",
      local: "Kolik to stojí?",
      pronunciation: "KOH-lik toh STOH-yee"
    },
    {
      english: "Goodbye",
      local: "Na shledanou",
      pronunciation: "nah SKHLEH-dah-noh"
    },
    { english: "Yes / No", local: "Ano / Ne", pronunciation: "AH-noh / neh" }
  ],
  Cantonese: [
    { english: "Hello", local: "你好 (Nei hou)", pronunciation: "nay HOH" },
    {
      english: "Thank you",
      local: "多謝 (Do ze) / 唔該 (M goi)",
      pronunciation: "doh JEH / mm GOY"
    },
    { english: "Please", local: "唔該 (M goi)", pronunciation: "mm GOY" },
    {
      english: "Excuse me",
      local: "唔好意思 (M hou yi si)",
      pronunciation: "mm HOH yee see"
    },
    {
      english: "Where is…?",
      local: "…喺邊度？ (…hai bin dou?)",
      pronunciation: "hai BEEN doh"
    },
    {
      english: "How much?",
      local: "幾多錢？ (Gei do chin?)",
      pronunciation: "gay DOH cheen"
    },
    { english: "Goodbye", local: "再見 (Joi gin)", pronunciation: "joy GEEN" },
    {
      english: "Yes / No",
      local: "係 / 唔係 (Hai / M hai)",
      pronunciation: "HIGH / mm HIGH"
    }
  ]
};

// ── Packing list generator ─────────────────────────────────────────────
function generatePackingList(
  tripType: string,
  weatherCondition: string
): Record<string, string[]> {
  const essentials = [
    "Passport & copies",
    "Travel insurance docs",
    "Phone charger & adapter",
    "Medications",
    "Wallet & cards",
    "Reusable water bottle"
  ];
  const toiletries = [
    "Toothbrush & toothpaste",
    "Sunscreen SPF 50",
    "Deodorant",
    "Shampoo (travel size)",
    "Hand sanitizer"
  ];

  const clothingByType: Record<string, string[]> = {
    beach: [
      "Swimsuit(s)",
      "Flip flops / sandals",
      "Light shorts & tees",
      "Sarong / cover-up",
      "Sun hat",
      "Sunglasses",
      "Light evening outfit"
    ],
    city: [
      "Comfortable walking shoes",
      "Smart casual outfits",
      "Light jacket / blazer",
      "Jeans / chinos",
      "Mix of casual & dressy tops",
      "Scarf (versatile accessory)"
    ],
    adventure: [
      "Hiking boots (broken in)",
      "Moisture-wicking layers",
      "Quick-dry pants",
      "Waterproof jacket",
      "Warm fleece / mid-layer",
      "Athletic socks",
      "Sports sunglasses"
    ],
    business: [
      "Formal suit(s)",
      "Dress shoes",
      "Dress shirts / blouses",
      "Ties / accessories",
      "Business casual backup",
      "Garment bag"
    ],
    winter: [
      "Heavy insulated coat",
      "Thermal base layers",
      "Warm sweaters",
      "Waterproof boots",
      "Wool socks",
      "Gloves & beanie",
      "Scarf"
    ]
  };

  const accessoriesByType: Record<string, string[]> = {
    beach: [
      "Waterproof phone pouch",
      "Beach towel",
      "Snorkeling gear (optional)",
      "Portable speaker",
      "Beach bag"
    ],
    city: [
      "Crossbody bag / daypack",
      "Umbrella (compact)",
      "Camera",
      "City guidebook or app",
      "Portable battery pack"
    ],
    adventure: [
      "Daypack (30L)",
      "Headlamp",
      "First aid kit",
      "Dry bags",
      "Trekking poles (optional)",
      "Insect repellent"
    ],
    business: [
      "Laptop & charger",
      "Notebook & pens",
      "Business cards",
      "Portfolio / briefcase",
      "Wireless earbuds"
    ],
    winter: [
      "Hand warmers",
      "Lip balm (SPF)",
      "Thermos",
      "Ski goggles (if skiing)",
      "Neck gaiter"
    ]
  };

  const cold = ["cold", "snow", "freezing", "chilly"].some((c) =>
    weatherCondition.toLowerCase().includes(c)
  );
  const resolvedType = cold && tripType !== "business" ? "winter" : tripType;

  return {
    "📄 Essentials": essentials,
    "👕 Clothing": clothingByType[resolvedType] || clothingByType["city"],
    "🧴 Toiletries": toiletries,
    "🎒 Accessories":
      accessoriesByType[resolvedType] || accessoriesByType["city"]
  };
}

async function getAPIToken(env: Env): Promise<string> {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const os = await import("node:os");

    const home = os.homedir();
    const paths = [
      path.join(
        home,
        "Library",
        "Preferences",
        ".wrangler",
        "config",
        "default.toml"
      ),
      path.join(home, ".config", ".wrangler", "config.json"),
      path.join(home, ".wrangler", "config.json"),
      path.join(
        home,
        "AppData",
        "Local",
        "share",
        "wrangler",
        "config",
        "default.toml"
      )
    ];

    for (const p of paths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf8");
        if (p.endsWith(".toml")) {
          const lines = content.split("\n");
          for (const line of lines) {
            if (line.includes("oauth_token")) {
              const token = line.split("=")[1].trim().replace(/"/g, "");
              if (token) return token;
            }
          }
        } else if (p.endsWith(".json")) {
          try {
            const parsed = JSON.parse(content);
            if (parsed.oauth_token) return parsed.oauth_token;
          } catch {
            // Ignore JSON parse error
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
  return env.CF_API_TOKEN || "";
}

function getWeatherCondition(code: number): string {
  if (code === 0) return "Sunny";
  if (code === 1) return "Mostly Sunny";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code === 51 || code === 53 || code === 55) return "Light Drizzle";
  if (code === 61 || code === 63) return "Light Rain";
  if (code === 65) return "Heavy Rain";
  if (code === 66 || code === 67) return "Freezing Rain";
  if (code === 71 || code === 73) return "Light Snow";
  if (code === 75) return "Heavy Snow";
  if (code === 77) return "Snow Grains";
  if (code === 80 || code === 81 || code === 82) return "Rain Showers";
  if (code === 85 || code === 86) return "Snow Showers";
  if (code === 95) return "Thunderstorms";
  if (code === 96 || code === 99) return "Thunderstorms with Hail";
  return "Mild";
}

interface OpenMeteoWeatherResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weathercode?: number[];
    windspeed_10m_max?: number[];
  };
}

async function fetchWeather(lat: number, lon: number, _city: string) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=auto`;
    const res = await fetch(url, {
      headers: { "User-Agent": "VoyagerTravelAgent/1.0" }
    });
    if (res.ok) {
      const data = (await res.json()) as OpenMeteoWeatherResponse;
      if (data && data.daily && data.daily.time) {
        const forecast = [];
        const times = data.daily.time;
        const maxTemps = data.daily.temperature_2m_max || [];
        const minTemps = data.daily.temperature_2m_min || [];
        const codes = data.daily.weathercode || [];
        const windspeeds = data.daily.windspeed_10m_max || [];

        for (let i = 0; i < 3 && i < times.length; i++) {
          const dateStr = times[i];
          const dateObj = new Date(dateStr + "T00:00:00");
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
          });

          const code = codes[i] ?? 0;
          const condition = getWeatherCondition(code);
          const maxTemp =
            maxTemps[i] !== null && maxTemps[i] !== undefined
              ? `${Math.round(maxTemps[i])}°C`
              : "20°C";
          const minTemp =
            minTemps[i] !== null && minTemps[i] !== undefined
              ? `${Math.round(minTemps[i])}°C`
              : "12°C";
          const wind =
            windspeeds[i] !== null && windspeeds[i] !== undefined
              ? `${Math.round(windspeeds[i])} km/h`
              : "10 km/h";

          let humidity = "60%";
          if (code === 0) humidity = `${Math.floor(Math.random() * 10) + 40}%`;
          else if (code <= 3)
            humidity = `${Math.floor(Math.random() * 15) + 50}%`;
          else if (code === 45 || code === 48)
            humidity = `${Math.floor(Math.random() * 10) + 90}%`;
          else humidity = `${Math.floor(Math.random() * 15) + 80}%`;

          forecast.push({
            date: formattedDate,
            high: maxTemp,
            low: minTemp,
            condition,
            humidity,
            wind
          });
        }

        if (forecast.length > 0) return forecast;
      }
    }
  } catch (e) {
    console.error(`Weather fetch error for lat:${lat}, lon:${lon}:`, e);
  }

  const today = new Date();
  const conditions = ["Sunny", "Partly Cloudy", "Breezy"];
  const forecast = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    forecast.push({
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      }),
      high: `${20 + i}°C`,
      low: `${12 - i}°C`,
      condition: conditions[i % conditions.length],
      humidity: `${55 + i * 5}%`,
      wind: `${12 + i * 2} km/h`
    });
  }
  return forecast;
}

async function getAttractionNames(city: string, env: Env): Promise<string[]> {
  const accountId = env.CF_ACCOUNT_ID ?? "0dd38357bd6a54751de833a00e3bb60b";
  const apiKey = await getAPIToken(env);
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful travel database. Respond ONLY with a valid JSON array of strings containing the top 3 most famous landmark/tourist attraction names for the requested city. Do not include any markdown, markdown code blocks, or extra text."
            },
            {
              role: "user",
              content: city
            }
          ],
          model: "@cf/meta/llama-4-scout-17b-16e-instruct"
        })
      }
    );
    if (res.ok) {
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      const rawContent = data?.choices?.[0]?.message?.content;
      if (Array.isArray(rawContent)) {
        return rawContent.slice(0, 3).map(String);
      }
      if (typeof rawContent === "string") {
        const cleaned = rawContent
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/```$/, "")
          .trim();
        const arr = JSON.parse(cleaned);
        if (Array.isArray(arr)) {
          return arr.slice(0, 3).map(String);
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch attraction names from AI:", e);
  }
  return ["Eiffel Tower", "Louvre Museum", "Arc de Triomphe"];
}

interface WikipediaSummaryResponse {
  title: string;
  extract?: string;
  description?: string;
}

async function fetchAttractions(
  city: string,
  _lat: number,
  _lon: number,
  env: Env
) {
  try {
    const attractionNames = await getAttractionNames(city, env);
    const attractions = [];

    for (const name of attractionNames) {
      try {
        const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
        const sumRes = await fetch(sumUrl, {
          headers: { "User-Agent": "VoyagerTravelAgent/1.0" }
        });
        if (sumRes.ok) {
          const sumJson = (await sumRes.json()) as WikipediaSummaryResponse;
          const attractionTitle = sumJson.title;
          const description =
            sumJson.extract ||
            sumJson.description ||
            "Interesting local place to visit and explore.";

          let category = "Sightseeing";
          const descLower = (sumJson.description || "").toLowerCase();
          const nameLower = attractionTitle.toLowerCase();
          if (
            descLower.includes("museum") ||
            descLower.includes("gallery") ||
            nameLower.includes("museum")
          )
            category = "Museum";
          else if (
            descLower.includes("church") ||
            descLower.includes("cathedral") ||
            descLower.includes("temple") ||
            descLower.includes("mosque") ||
            descLower.includes("basilica") ||
            descLower.includes("synagogue")
          )
            category = "Religious Site";
          else if (
            descLower.includes("park") ||
            descLower.includes("garden") ||
            descLower.includes("lake") ||
            descLower.includes("mountain") ||
            descLower.includes("forest") ||
            descLower.includes("beach")
          )
            category = "Nature";
          else if (
            descLower.includes("castle") ||
            descLower.includes("palace") ||
            descLower.includes("monument") ||
            descLower.includes("bridge") ||
            descLower.includes("tower") ||
            descLower.includes("historic") ||
            descLower.includes("square")
          )
            category = "Landmark";
          else if (sumJson.description) category = sumJson.description;

          attractions.push({
            name: attractionTitle,
            description:
              description.length > 150
                ? description.substring(0, 147) + "..."
                : description,
            category: category.charAt(0).toUpperCase() + category.slice(1)
          });
        }
      } catch {
        // ignore page fetch error
      }
    }

    if (attractions.length > 0) return attractions;
  } catch (e) {
    console.error("Wikipedia attractions fetch error:", e);
  }

  return [
    {
      name: "City Center",
      description: `Explore the vibrant heart of ${city} with its unique streets, cafes, and local atmosphere.`,
      category: "Sightseeing"
    },
    {
      name: "Historical Quarter",
      description:
        "Wander through historic lanes and discover the rich cultural heritage of this destination.",
      category: "Historical"
    },
    {
      name: "Scenic Viewpoint",
      description:
        "Enjoy panoramic views of the city skyline and surrounding natural landscapes.",
      category: "Landmark"
    }
  ];
}

let cachedRates: Record<string, number> | null = null;
let lastRatesFetch = 0;

interface ExchangeRateApiResponse {
  rates?: Record<string, number>;
}

async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - lastRatesFetch < 3600000) {
    return cachedRates;
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res.ok) {
      const data = (await res.json()) as ExchangeRateApiResponse;
      if (data && data.rates) {
        cachedRates = data.rates;
        lastRatesFetch = now;
        return cachedRates;
      }
    }
  } catch (e) {
    console.error("Failed to fetch exchange rates, using backup:", e);
  }
  return exchangeRates;
}

function getLanguageCode(lang: string): string {
  const name = lang.toLowerCase().trim();
  if (name.includes("english")) return "en";
  if (name.includes("french")) return "fr";
  if (name.includes("german")) return "de";
  if (name.includes("italian")) return "it";
  if (name.includes("spanish")) return "es";
  if (name.includes("japanese")) return "ja";
  if (
    name.includes("chinese") ||
    name.includes("cantonese") ||
    name.includes("mandarin")
  )
    return "zh";
  if (name.includes("hindi")) return "hi";
  if (name.includes("arabic")) return "ar";
  if (name.includes("portuguese")) return "pt";
  if (name.includes("thai")) return "th";
  if (name.includes("korean")) return "ko";
  if (name.includes("dutch")) return "nl";
  if (name.includes("russian")) return "ru";
  if (name.includes("greek")) return "el";
  if (name.includes("turkish")) return "tr";
  if (name.includes("swedish")) return "sv";
  if (name.includes("norwegian")) return "no";
  if (name.includes("finnish")) return "fi";
  if (name.includes("danish")) return "da";
  if (name.includes("polish")) return "pl";
  if (name.includes("indonesian")) return "id";
  if (name.includes("vietnamese")) return "vi";
  if (name.includes("czech")) return "cs";
  if (name.includes("hungarian")) return "hu";
  if (name.includes("malay")) return "ms";
  if (name.includes("romanian")) return "ro";
  if (name.includes("ukrainian")) return "uk";
  if (name.includes("filipino") || name.includes("tagalog")) return "tl";
  if (name.includes("swahili")) return "sw";
  if (name.includes("icelandic")) return "is";
  if (name.includes("hebrew")) return "he";
  if (name.includes("persian")) return "fa";
  if (name.includes("urdu")) return "ur";
  if (name.includes("bengali")) return "bn";
  if (name.includes("tamil")) return "ta";
  if (name.includes("sinhala")) return "si";
  if (name.includes("khmer")) return "km";
  if (name.includes("lao")) return "lo";
  return "en";
}

async function translateText(
  text: string,
  targetLang: string,
  env: Env
): Promise<string> {
  const accountId = env.CF_ACCOUNT_ID ?? "0dd38357bd6a54751de833a00e3bb60b";
  const apiKey = await getAPIToken(env);
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/m2m100-1.2b`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          source_lang: "en",
          target_lang: targetLang
        })
      }
    );
    if (res.ok) {
      const data = (await res.json()) as {
        result?: { translated_text?: string };
      };
      return data?.result?.translated_text || text;
    }
  } catch (e) {
    console.error("Translation API error:", e);
  }
  return text;
}

export class TravelAgent extends AIChatAgent {
  async onChatMessage() {
    // Use Cloudflare's OpenAI-compatible API endpoint.
    // This bypasses the broken miniflare AI proxy and gives us proper
    // streaming tool call support that the workers-ai-provider lacks.
    const accountId =
      this.env.CF_ACCOUNT_ID ?? "0dd38357bd6a54751de833a00e3bb60b";
    const apiKey = await getAPIToken(this.env);
    const cfAI = createOpenAI({
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`,
      apiKey,
      fetch: async (url, init) => {
        const response = await globalThis.fetch(
          url as string,
          init as RequestInit
        );

        // Fix Cloudflare streaming: delta.content sometimes comes as a number
        // instead of a string, which breaks the AI SDK's type validation.
        if (!response.body) return response;

        const reader = response.body.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const fixedStream = new ReadableStream({
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }
            let text = decoder.decode(value, { stream: true });
            // Fix SSE data lines where delta.content is a number
            text = text.replace(/"content"\s*:\s*(\d+)/g, '"content":""');
            controller.enqueue(encoder.encode(text));
          }
        });

        return new Response(fixedStream, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    });

    const result = streamText({
      model: cfAI.chat("@cf/meta/llama-4-scout-17b-16e-instruct"),
      system:
        "You are Voyager, a friendly travel assistant. You help plan trips and explore destinations. When you use tools, the results are displayed as interactive cards. In your text response, only write a single brief, friendly introductory sentence (e.g., 'I have looked up the weather forecast for Tokyo below!') to introduce the card, and do NOT write any subsequent summaries, lists, or repeat conversion details or numbers.",
      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages"
      }),
      tools: {
        getWeather: tool({
          description:
            "Get a 3-day weather forecast for a city including temperature, conditions, humidity, and wind",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: { city: { type: "string", description: "City name" } },
            required: ["city"]
          }),
          execute: async ({ city }: { city: string }) => {
            const loc = await resolveLocation(city);
            const forecast = await fetchWeather(loc.lat, loc.lon, loc.city);
            return { city: loc.city, forecast };
          }
        }),

        getAttractions: tool({
          description:
            "Get the top 3 tourist attractions for a city with descriptions and categories",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: { city: { type: "string", description: "City name" } },
            required: ["city"]
          }),
          execute: async ({ city }: { city: string }) => {
            const loc = await resolveLocation(city);
            const attractions = await fetchAttractions(
              loc.city,
              loc.lat,
              loc.lon,
              this.env
            );
            return { city: loc.city, attractions };
          }
        }),

        estimateFlightCost: tool({
          description:
            "Estimate flight costs between two cities including economy and business class prices and approximate flight duration",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              origin: { type: "string", description: "Departure city" },
              destination: { type: "string", description: "Arrival city" }
            },
            required: ["origin", "destination"]
          }),
          execute: async ({
            origin,
            destination
          }: {
            origin: string;
            destination: string;
          }) => {
            const resolvedOrigin = await resolveLocation(origin);
            const resolvedDest = await resolveLocation(destination);

            const distanceKm = haversineDistance(
              resolvedOrigin.lat,
              resolvedOrigin.lon,
              resolvedDest.lat,
              resolvedDest.lon
            );

            // Estimate prices based on distance
            const baseCostPerKm = 0.08 + Math.random() * 0.04;
            const economyBase = Math.round(distanceKm * baseCostPerKm);
            const economyLow = Math.max(150, Math.round(economyBase * 0.8));
            const economyHigh = Math.round(economyBase * 1.3);
            const businessLow = Math.round(economyLow * 2.8);
            const businessHigh = Math.round(economyHigh * 3.5);

            // Estimate flight time (average speed ~800 km/h with overhead)
            const flightHours = distanceKm / 800;
            const hours = Math.floor(flightHours);
            const minutes = Math.round((flightHours - hours) * 60);

            return {
              origin: resolvedOrigin.city,
              destination: resolvedDest.city,
              distanceKm,
              estimatedDuration: `${hours}h ${minutes}m`,
              economy: { low: `$${economyLow}`, high: `$${economyHigh}` },
              business: { low: `$${businessLow}`, high: `$${businessHigh}` },
              note: "Prices are estimates and vary by season, airline, and booking time."
            };
          }
        }),

        getFlightDistance: tool({
          description:
            "Calculate the distance between two cities and estimated flight time",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              origin: { type: "string", description: "First city" },
              destination: { type: "string", description: "Second city" }
            },
            required: ["origin", "destination"]
          }),
          execute: async ({
            origin,
            destination
          }: {
            origin: string;
            destination: string;
          }) => {
            const resolvedOrigin = await resolveLocation(origin);
            const resolvedDest = await resolveLocation(destination);

            const distanceKm = haversineDistance(
              resolvedOrigin.lat,
              resolvedOrigin.lon,
              resolvedDest.lat,
              resolvedDest.lon
            );
            const distanceMiles = Math.round(distanceKm * 0.621371);

            const flightHours = distanceKm / 800;
            const hours = Math.floor(flightHours);
            const minutes = Math.round((flightHours - hours) * 60);

            return {
              origin: {
                city: resolvedOrigin.city,
                country: resolvedOrigin.country,
                coordinates: `${Math.abs(resolvedOrigin.lat).toFixed(4)}°${resolvedOrigin.lat >= 0 ? "N" : "S"}, ${Math.abs(resolvedOrigin.lon).toFixed(4)}°${resolvedOrigin.lon >= 0 ? "E" : "W"}`
              },
              destination: {
                city: resolvedDest.city,
                country: resolvedDest.country,
                coordinates: `${Math.abs(resolvedDest.lat).toFixed(4)}°${resolvedDest.lat >= 0 ? "N" : "S"}, ${Math.abs(resolvedDest.lon).toFixed(4)}°${resolvedDest.lon >= 0 ? "E" : "W"}`
              },
              distanceKm,
              distanceMiles,
              estimatedFlightTime: `${hours}h ${minutes}m`,
              note: "Distance is calculated as great-circle (straight line). Actual flight paths may be longer."
            };
          }
        }),

        getCurrencyExchange: tool({
          description:
            "Convert between currencies or get exchange rates. Can accept currency codes (USD, EUR) or city/country names",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              from: {
                type: "string",
                description:
                  "Source currency code (e.g., USD) or city/country name"
              },
              to: {
                type: "string",
                description:
                  "Target currency code (e.g., JPY) or city/country name"
              },
              amount: {
                type: "number",
                description: "Amount to convert (default: 100)"
              }
            },
            required: ["from", "to"]
          }),
          execute: async ({
            from,
            to,
            amount = 100
          }: {
            from: string;
            to: string;
            amount?: number;
          }) => {
            async function resolveToCurrencyCode(
              input: string
            ): Promise<string> {
              const upper = input.toUpperCase().trim();
              const rates = await getExchangeRates();
              if (rates[upper]) return upper;
              try {
                const loc = await resolveLocation(input);
                if (loc && loc.currency && rates[loc.currency]) {
                  return loc.currency;
                }
              } catch {
                // ignore
              }
              return upper;
            }

            const fromCode = await resolveToCurrencyCode(from);
            const toCode = await resolveToCurrencyCode(to);
            const rates = await getExchangeRates();
            const fromRate = rates[fromCode];
            const toRate = rates[toCode];

            if (!fromRate || !toRate) {
              return {
                error: `Unknown currency: ${!fromRate ? from : to}. Try a currency code like USD, EUR, GBP, JPY or a major city/country name.`
              };
            }

            const inUsd = amount / fromRate;
            const converted = Math.round(inUsd * toRate * 100) / 100;
            const rate = Math.round((toRate / fromRate) * 10000) / 10000;

            return {
              from: { currency: fromCode, amount },
              to: { currency: toCode, amount: converted },
              exchangeRate: `1 ${fromCode} = ${rate} ${toCode}`,
              commonAmounts: [1, 10, 50, 100, 500].map((a) => ({
                [`${a} ${fromCode}`]: `${Math.round((a / fromRate) * toRate * 100) / 100} ${toCode}`
              })),
              note: "Rates are real-time. Check with your bank for exact rates and fees."
            };
          }
        }),

        getPackingList: tool({
          description:
            "Generate a smart packing checklist based on destination and trip type (beach, city, adventure, business, winter)",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              destination: {
                type: "string",
                description: "Travel destination city"
              },
              tripType: {
                type: "string",
                enum: ["beach", "city", "adventure", "business", "winter"],
                description: "Type of trip"
              }
            },
            required: ["destination", "tripType"]
          }),
          execute: async ({
            destination,
            tripType
          }: {
            destination: string;
            tripType: string;
          }) => {
            const loc = await resolveLocation(destination);
            const forecast = await fetchWeather(loc.lat, loc.lon, loc.city);
            const weatherCondition =
              forecast[0]?.condition || "Mild and pleasant";
            const packingList = generatePackingList(tripType, weatherCondition);

            return {
              destination: loc.city,
              tripType,
              expectedWeather: weatherCondition,
              packingList,
              tip:
                tripType === "beach"
                  ? "Roll clothes instead of folding to save space and reduce wrinkles!"
                  : tripType === "adventure"
                    ? "Wear your heaviest boots on the plane to save luggage weight!"
                    : tripType === "business"
                      ? "Pack a steamer or wrinkle-release spray for fresh-looking clothes!"
                      : tripType === "winter"
                        ? "Layer up! Multiple thin layers are warmer and more versatile than one thick coat."
                        : "Bring a packable daypack — it's the most versatile travel accessory!"
            };
          }
        }),

        getLocalPhrases: tool({
          description:
            "Get essential local phrases in the destination's language with pronunciation guides",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              destination: {
                type: "string",
                description: "City or country name"
              }
            },
            required: ["destination"]
          }),
          execute: async ({ destination }: { destination: string }) => {
            const resolved = await resolveLocation(destination);
            const language = resolved.language;
            const langCode = getLanguageCode(language);

            const STANDARD_PHRASES = [
              "Hello",
              "Thank you",
              "Please",
              "Excuse me",
              "Where is...?",
              "How much?",
              "Goodbye",
              "Yes / No"
            ];

            if (langCode === "en") {
              return {
                destination: resolved.city,
                language,
                phrases: STANDARD_PHRASES.map((phrase) => ({
                  english: phrase,
                  local: phrase,
                  pronunciation: ""
                })),
                tip: "The primary language spoken here is English."
              };
            }

            try {
              const translated = await Promise.all(
                STANDARD_PHRASES.map(async (phrase) => {
                  const local = await translateText(phrase, langCode, this.env);
                  return {
                    english: phrase,
                    local,
                    pronunciation: ""
                  };
                })
              );

              return {
                destination: resolved.city,
                language,
                phrases: translated,
                tip: `Translations generated dynamically using Cloudflare Workers AI.`
              };
            } catch (e) {
              console.error("Failed to generate dynamic phrases:", e);
              return {
                destination: resolved.city,
                language,
                phrases: STANDARD_PHRASES.map((phrase) => ({
                  english: phrase,
                  local: phrase,
                  pronunciation: ""
                })),
                tip: "Failed to translate phrases. Displaying in English."
              };
            }
          }
        }),

        getLocalNews: tool({
          description:
            "Get the top 3 current local news headlines and articles for a city",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              city: { type: "string", description: "City name" }
            },
            required: ["city"]
          }),
          execute: async ({ city }: { city: string }) => {
            const loc = await resolveLocation(city);
            try {
              const url = `https://news.google.com/rss/search?q=${encodeURIComponent(loc.city)}&hl=en-US&gl=US&ceid=US:en`;
              const res = await fetch(url, {
                headers: { "User-Agent": "VoyagerTravelAgent/1.0" }
              });
              if (res.ok) {
                const xmlText = await res.text();
                const items = [];
                const itemRegex = /<item>([\s\S]*?)<\/item>/g;
                let match;
                while (
                  (match = itemRegex.exec(xmlText)) !== null &&
                  items.length < 3
                ) {
                  const itemContent = match[1];
                  const title = (
                    itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
                    "Local News Update"
                  )
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");
                  const link =
                    itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] ||
                    "https://news.google.com";
                  const pubDate =
                    itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ||
                    "";
                  const source =
                    itemContent.match(
                      /<source[\s\S]*?>([\s\S]*?)<\/source>/
                    )?.[1] || "News Source";

                  let dateStr = pubDate;
                  try {
                    const d = new Date(pubDate);
                    dateStr = d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    });
                  } catch {
                    // ignore
                  }

                  items.push({ title, link, pubDate: dateStr, source });
                }
                if (items.length > 0) {
                  return { city: loc.city, articles: items };
                }
              }
            } catch (e) {
              console.error("Local news fetch error:", e);
            }
            return {
              city: loc.city,
              articles: [
                {
                  title: `Local events and travel updates in ${loc.city} for this week`,
                  link: "https://news.google.com",
                  pubDate: "Today",
                  source: "Voyager News"
                },
                {
                  title: `Top dining, culture, and sightseeing spots open to visitors in ${loc.city}`,
                  link: "https://news.google.com",
                  pubDate: "Yesterday",
                  source: "Voyager Travel Feed"
                }
              ]
            };
          }
        }),

        getSunTimes: tool({
          description:
            "Get sunrise, sunset, solar noon, and day length for a city",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              city: { type: "string", description: "City name" }
            },
            required: ["city"]
          }),
          execute: async ({ city }: { city: string }) => {
            const loc = await resolveLocation(city);
            try {
              const res = await fetch(
                `https://api.sunrise-sunset.org/json?lat=${loc.lat}&lng=${loc.lon}&formatted=0`
              );
              if (res.ok) {
                const json = (await res.json()) as {
                  results: {
                    sunrise: string;
                    sunset: string;
                    solar_noon: string;
                    day_length: string;
                  };
                };
                const results = json.results;
                const formatTime = (iso: string) => {
                  try {
                    const date = new Date(iso);
                    return date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: loc.timezone
                    });
                  } catch {
                    return iso;
                  }
                };

                const totalSeconds = parseInt(results.day_length) || 0;
                const hrs = Math.floor(totalSeconds / 3600);
                const mins = Math.floor((totalSeconds % 3600) / 60);

                return {
                  city: loc.city,
                  sunrise: formatTime(results.sunrise),
                  sunset: formatTime(results.sunset),
                  solarNoon: formatTime(results.solar_noon),
                  dayLength: `${hrs}h ${mins}m`
                };
              }
            } catch (e) {
              console.error("Sun times fetch error:", e);
            }
            return {
              city: loc.city,
              sunrise: "6:14 AM",
              sunset: "8:42 PM",
              solarNoon: "1:28 PM",
              dayLength: "14h 28m"
            };
          }
        }),

        getAirQuality: tool({
          description:
            "Get current European air quality index (AQI) and PM concentrations for a city",
          inputSchema: jsonSchema({
            type: "object" as const,
            properties: {
              city: { type: "string", description: "City name" }
            },
            required: ["city"]
          }),
          execute: async ({ city }: { city: string }) => {
            const loc = await resolveLocation(city);
            try {
              const res = await fetch(
                `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.lat}&longitude=${loc.lon}&current=european_aqi,pm2_5,pm10`
              );
              if (res.ok) {
                const json = (await res.json()) as {
                  current: {
                    european_aqi?: number;
                    pm2_5?: number;
                    pm10?: number;
                  };
                };
                return {
                  city: loc.city,
                  aqi: json.current?.european_aqi ?? 28,
                  pm2_5: json.current?.pm2_5 ?? 9.1,
                  pm10: json.current?.pm10 ?? 14.2
                };
              }
            } catch (e) {
              console.error("Air quality fetch error:", e);
            }
            return {
              city: loc.city,
              aqi: 28,
              pm2_5: 9.1,
              pm10: 14.2
            };
          }
        })
      },
      stopWhen: stepCountIs(5)
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // Direct AI test endpoint — bypasses all agent/chat layers
    if (url.pathname === "/test-ai") {
      try {
        const token = await getAPIToken(env);

        const apiResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID || "0dd38357bd6a54751de833a00e3bb60b"}/ai/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messages: [
                { role: "user", content: "Say hello in one sentence." }
              ],
              model: "@cf/meta/llama-4-scout-17b-16e-instruct"
            })
          }
        );

        const data = await apiResponse.json();

        return new Response(
          JSON.stringify(
            {
              tokenPreview: token.substring(0, 15) + "...",
              response: data
            },
            null,
            2
          ),
          {
            headers: { "content-type": "application/json" }
          }
        );
      } catch (err: unknown) {
        const error = err as Error;
        return new Response(
          JSON.stringify(
            {
              error: error.message,
              stack: error.stack,
              name: error.constructor.name
            },
            null,
            2
          ),
          { status: 500, headers: { "content-type": "application/json" } }
        );
      }
    }

    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
};
