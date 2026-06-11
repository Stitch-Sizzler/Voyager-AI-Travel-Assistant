import "./styles.css";
import { createRoot } from "react-dom/client";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type FormEvent
} from "react";
import { isToolUIPart, getToolName, type UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Drop,
  Compass,
  Airplane,
  AirplaneTakeoff,
  Ruler,
  CurrencyCircleDollar,
  Suitcase,
  Translate,
  Buildings,
  TreePalm,
  Globe,
  Trash,
  PaperPlaneRight,
  Clock,
  Sparkle,
  Gear,
  Moon,
  MonitorPlay,
  Newspaper
} from "@phosphor-icons/react";

// ── Weather condition icon mapper ──────────────────────────────────────

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("sunny") || c.includes("clear")) return Sun;
  if (c.includes("partly")) return CloudSun;
  if (c.includes("overcast") || c.includes("cloud")) return Cloud;
  if (c.includes("thunder")) return CloudLightning;
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower"))
    return CloudRain;
  if (c.includes("snow") || c.includes("freeze")) return CloudSnow;
  if (c.includes("wind") || c.includes("breez")) return Wind;
  return CloudSun; // default
}

// ── Tool output card renderer ──────────────────────────────────────────

// ── Helper to ensure values never render blank or "-" ──────────────────
function fallbackVal<T>(val: T, fallback: string = "N/A"): T | string {
  if (val === null || val === undefined || val === "" || val === "-")
    return fallback;
  return val;
}

function ToolOutputCard({
  toolName,
  output
}: {
  toolName: string;
  output: unknown;
}) {
  const data = output as Record<string, unknown>;

  // Weather card
  if (toolName === "getWeather" && data.forecast) {
    const forecast = data.forecast as Array<{
      date: string;
      high: string;
      low: string;
      condition: string;
      humidity: string;
      wind: string;
    }>;
    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CloudSun
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-sky)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-sky)" }}
          >
            Weather in {fallbackVal(data.city as string)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {forecast.map((day, i) => {
            const IconComp = getWeatherIcon(day.condition);
            return (
              <div
                key={i}
                className="glass-card-strong p-3 text-center space-y-1.5 rounded-xl"
              >
                <div className="text-xs opacity-60 font-medium">{day.date}</div>
                <div className="text-2xl flex justify-center py-0.5">
                  <IconComp
                    size={28}
                    weight="duotone"
                    style={{ color: "var(--travel-sky)" }}
                  />
                </div>
                <div className="text-xs font-medium line-clamp-1">
                  {day.condition}
                </div>
                <div className="text-sm font-semibold">
                  {fallbackVal(day.high)} /{" "}
                  <span className="opacity-60">{fallbackVal(day.low)}</span>
                </div>
                <div className="text-xs opacity-50 flex items-center justify-center gap-1">
                  <Drop size={11} weight="duotone" className="text-sky-400" />
                  <span>{fallbackVal(day.humidity)}</span>
                  <span className="opacity-30">·</span>
                  <Wind size={11} weight="duotone" className="text-teal-400" />
                  <span>{fallbackVal(day.wind)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Attractions card
  if (toolName === "getAttractions" && data.attractions) {
    const attractions = data.attractions as Array<{
      name: string;
      description: string;
      category: string;
    }>;
    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Buildings
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-emerald)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-emerald)" }}
          >
            Top Attractions in {fallbackVal(data.city as string)}
          </span>
        </div>
        <div className="space-y-2">
          {attractions.map((a, i) => (
            <div key={i} className="glass-card-strong p-3 rounded-xl">
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold opacity-30 mt-0.5">
                  #{i + 1}
                </span>
                <div>
                  <div className="font-semibold text-sm">
                    {fallbackVal(a.name)}
                  </div>
                  <div className="text-xs opacity-60 mt-0.5">
                    {fallbackVal(a.description)}
                  </div>
                  <span
                    className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--travel-amber-glow)",
                      color: "var(--travel-amber)"
                    }}
                  >
                    {fallbackVal(a.category)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Flight cost card
  if (toolName === "estimateFlightCost" && data.economy) {
    const economy = (data.economy || {}) as { low?: string; high?: string };
    const business = (data.business || {}) as { low?: string; high?: string };
    const econLow = fallbackVal(economy.low);
    const econHigh = fallbackVal(economy.high);
    const busLow = fallbackVal(business.low);
    const busHigh = fallbackVal(business.high);
    const kmVal =
      typeof data.distanceKm === "number"
        ? data.distanceKm.toLocaleString()
        : fallbackVal(data.distanceKm as string);
    const durationVal = fallbackVal(data.estimatedDuration as string);

    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AirplaneTakeoff
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-amber)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-amber)" }}
          >
            {fallbackVal(data.origin as string)} →{" "}
            {fallbackVal(data.destination as string)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-card-strong p-3 rounded-xl text-center">
            <div className="text-xs opacity-50 mb-1">Economy</div>
            <div
              className="text-lg font-bold"
              style={{ color: "var(--travel-emerald)" }}
            >
              {econLow} – {econHigh}
            </div>
          </div>
          <div className="glass-card-strong p-3 rounded-xl text-center">
            <div className="text-xs opacity-50 mb-1">Business</div>
            <div
              className="text-lg font-bold"
              style={{ color: "var(--travel-violet)" }}
            >
              {busLow} – {busHigh}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs opacity-60 px-1">
          <span className="flex items-center gap-1">
            <Ruler size={13} weight="duotone" className="text-sky-400" />
            {kmVal} km
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} weight="duotone" className="text-sky-400" />~
            {durationVal}
          </span>
        </div>
      </div>
    );
  }

  // Flight distance card
  if (toolName === "getFlightDistance" && data.distanceKm) {
    const origin = (data.origin || {}) as {
      city?: string;
      country?: string;
      coordinates?: string;
    };
    const dest = (data.destination || {}) as {
      city?: string;
      country?: string;
      coordinates?: string;
    };
    const originCity = origin.city || fallbackVal(data.origin as string);
    const destCity = dest.city || fallbackVal(data.destination as string);
    const originCountry = fallbackVal(origin.country, "");
    const destCountry = fallbackVal(dest.country, "");
    const distanceKmVal =
      typeof data.distanceKm === "number"
        ? data.distanceKm.toLocaleString()
        : fallbackVal(data.distanceKm as string);
    const distanceMilesVal =
      typeof data.distanceMiles === "number"
        ? data.distanceMiles.toLocaleString()
        : fallbackVal(data.distanceMiles as string);
    const flightTimeVal = fallbackVal(data.estimatedFlightTime as string);

    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Ruler
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-sky)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-sky)" }}
          >
            Flight Distance
          </span>
        </div>
        <div className="flex items-center justify-between glass-card-strong p-3 rounded-xl">
          <div className="text-center">
            <div className="font-semibold text-sm">{originCity}</div>
            {originCountry && (
              <div className="text-xs opacity-50">{originCountry}</div>
            )}
          </div>
          <div className="flex flex-col items-center px-3">
            <div
              className="text-lg font-bold"
              style={{ color: "var(--travel-amber)" }}
            >
              {distanceKmVal} km
            </div>
            <div className="text-xs opacity-50">{distanceMilesVal} mi</div>
            <div
              className="w-24 h-px my-1.5"
              style={{ background: "var(--travel-glass-border)" }}
            ></div>
            <div
              className="text-xs flex items-center gap-1 justify-center"
              style={{ color: "var(--travel-sky)" }}
            >
              <Clock size={12} weight="duotone" />
              <span>~{flightTimeVal}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-sm">{destCity}</div>
            {destCountry && (
              <div className="text-xs opacity-50">{destCountry}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Currency exchange card
  if (toolName === "getCurrencyExchange" && data.exchangeRate) {
    const from = (data.from || {}) as { currency?: string; amount?: number };
    const to = (data.to || {}) as { currency?: string; amount?: number };
    const fromAmount = fallbackVal(from.amount);
    const fromCurrency = fallbackVal(from.currency);
    const toCurrency = fallbackVal(to.currency);
    const toAmount =
      typeof to.amount === "number"
        ? to.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : fallbackVal(to.amount);
    const rateVal = fallbackVal(data.exchangeRate as string);

    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CurrencyCircleDollar
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-amber-light)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-amber-light)" }}
          >
            Currency Exchange
          </span>
        </div>
        <div className="glass-card-strong p-4 rounded-xl text-center">
          <div className="text-sm opacity-60">
            {fromAmount} {fromCurrency}
          </div>
          <div className="text-xs opacity-30 my-1">↓</div>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--travel-emerald)" }}
          >
            {toAmount} {toCurrency}
          </div>
          <div className="text-xs opacity-50 mt-2">{rateVal}</div>
        </div>
      </div>
    );
  }

  // Packing list card
  if (toolName === "getPackingList" && data.packingList) {
    const packingList = (data.packingList || {}) as Record<string, string[]>;
    const destination = fallbackVal(data.destination as string);
    const tripType = fallbackVal(data.tripType as string);

    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Suitcase
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-violet)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-violet)" }}
          >
            Packing List — {destination}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--travel-amber-glow)",
              color: "var(--travel-amber)"
            }}
          >
            {tripType}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(packingList).map(([category, items]) => (
            <div key={category} className="glass-card-strong p-3 rounded-xl">
              <div className="font-medium text-xs mb-2 text-violet-300">
                {category}
              </div>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs opacity-70 flex items-start gap-1.5"
                  >
                    <span className="opacity-40 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {typeof data.tip === "string" && data.tip && (
          <div className="text-xs opacity-50 italic px-1 flex items-center gap-1.5">
            <Sparkle size={12} weight="duotone" className="text-amber-400" />
            <span>{data.tip}</span>
          </div>
        )}
      </div>
    );
  }

  // Phrases card
  if (toolName === "getLocalPhrases" && data.phrases) {
    const phrases = (data.phrases || []) as Array<{
      english: string;
      local: string;
      pronunciation: string;
    }>;
    const language = fallbackVal(data.language as string);

    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Translate
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-rose)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-rose)" }}
          >
            {language} Phrases
          </span>
        </div>
        <div className="space-y-1.5">
          {phrases.map((p, i) => (
            <div
              key={i}
              className="glass-card-strong p-2.5 rounded-lg flex items-start gap-3"
            >
              <span className="text-xs opacity-50 w-20 shrink-0 pt-0.5">
                {p.english}
              </span>
              <div className="flex-1">
                <div className="font-medium text-sm">{p.local}</div>
                <div className="text-xs opacity-40 italic">
                  {p.pronunciation}
                </div>
              </div>
            </div>
          ))}
        </div>
        {typeof data.tip === "string" && data.tip && (
          <div className="text-xs opacity-50 italic px-1 flex items-center gap-1.5">
            <Sparkle size={12} weight="duotone" className="text-amber-400" />
            <span>{data.tip}</span>
          </div>
        )}
      </div>
    );
  }

  // Local news card
  if (toolName === "getLocalNews" && data.articles) {
    const articles = data.articles as Array<{
      title: string;
      link: string;
      pubDate: string;
      source: string;
    }>;
    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Newspaper
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-rose)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-rose)" }}
          >
            Local News in {fallbackVal(data.city as string)}
          </span>
        </div>
        <div className="space-y-2">
          {articles.map((art, i) => (
            <div key={i} className="glass-card-strong p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  {fallbackVal(art.source)}
                </span>
                <span className="text-[10px] opacity-40">
                  {fallbackVal(art.pubDate)}
                </span>
              </div>
              <div className="font-semibold text-sm line-clamp-2 leading-tight">
                {fallbackVal(art.title)}
              </div>
              <a
                href={art.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors mt-1.5"
              >
                Read article &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Sunrise/Sunset sun times card
  if (toolName === "getSunTimes" && data.sunrise) {
    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sun
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-amber)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-amber)" }}
          >
            Sun Times: {fallbackVal(data.city as string)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-card-strong p-3 rounded-xl text-center space-y-0.5">
            <div className="text-[10px] opacity-40 uppercase font-bold tracking-wider">
              Sunrise
            </div>
            <div className="text-lg font-bold text-amber-300">
              {fallbackVal(data.sunrise as string)}
            </div>
          </div>
          <div className="glass-card-strong p-3 rounded-xl text-center space-y-0.5">
            <div className="text-[10px] opacity-40 uppercase font-bold tracking-wider">
              Sunset
            </div>
            <div className="text-lg font-bold text-rose-300">
              {fallbackVal(data.sunset as string)}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-[11px] opacity-50 px-1 pt-1 border-t border-white/5">
          <span>Solar Noon: {fallbackVal(data.solarNoon as string)}</span>
          <span>Day Length: {fallbackVal(data.dayLength as string)}</span>
        </div>
      </div>
    );
  }

  // Air quality card
  if (toolName === "getAirQuality" && data.aqi !== undefined) {
    const aqi = data.aqi as number;
    let aqiDesc = "Good";
    let aqiColor = "var(--travel-emerald)";
    if (aqi > 50) {
      aqiDesc = "Fair";
      aqiColor = "var(--travel-amber)";
    }
    if (aqi > 100) {
      aqiDesc = "Moderate";
      aqiColor = "var(--travel-rose)";
    }
    if (aqi > 150) {
      aqiDesc = "Poor";
      aqiColor = "#ef4444";
    }

    return (
      <div className="tool-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wind
            size={20}
            weight="duotone"
            style={{ color: "var(--travel-sky)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--travel-sky)" }}
          >
            Air Quality Index: {fallbackVal(data.city as string)}
          </span>
        </div>
        <div className="flex items-center justify-between glass-card-strong p-4 rounded-xl">
          <div>
            <div className="text-[10px] opacity-40 uppercase font-bold tracking-wider mb-0.5">
              European AQI
            </div>
            <div
              className="text-3xl font-extrabold leading-none"
              style={{ color: aqiColor }}
            >
              {aqi}
            </div>
          </div>
          <div className="text-right space-y-1">
            <span
              className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: aqiColor
              }}
            >
              {aqiDesc}
            </span>
            <div className="text-[11px] opacity-50">
              PM2.5: {fallbackVal(data.pm2_5)} µg/m³
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: generic JSON card
  return (
    <div className="tool-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Gear size={16} weight="duotone" className="opacity-40" />
        <span className="font-medium text-xs opacity-60">{toolName}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "var(--travel-amber-glow)",
            color: "var(--travel-amber)"
          }}
        >
          Done
        </span>
      </div>
      <pre className="text-xs opacity-50 overflow-auto max-h-40 whitespace-pre-wrap font-mono">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}

// ── Tool in-progress indicator ─────────────────────────────────────────

function ToolRunningCard({ toolName }: { toolName: string }) {
  return (
    <div className="tool-card p-3 flex items-center gap-2">
      <Gear size={16} weight="duotone" className="opacity-40 animate-spin" />
      <span className="text-xs opacity-60">Running {toolName}…</span>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 message-enter">
      <div className="flex items-center gap-1.5 px-4 py-3 assistant-bubble">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

// ── Prompt suggestions ─────────────────────────────────────────────────

const PROMPTS = [
  {
    icon: Buildings,
    color: "var(--travel-amber)",
    text: "Plan a trip to Tokyo",
    description: "Weather, attractions & phrases"
  },
  {
    icon: CloudSun,
    color: "var(--travel-sky)",
    text: "Weather in Sydney",
    description: "Current forecast & conditions"
  },
  {
    icon: Newspaper,
    color: "var(--travel-rose)",
    text: "Local news in London",
    description: "Latest updates & stories"
  },
  {
    icon: Sun,
    color: "var(--travel-amber)",
    text: "Golden hour in Paris",
    description: "Sunrise & sunset schedules"
  },
  {
    icon: Wind,
    color: "var(--travel-emerald)",
    text: "Air quality in Dubai",
    description: "AQI, PM2.5 & PM10 levels"
  },
  {
    icon: TreePalm,
    color: "var(--travel-emerald)",
    text: "Pack for Bali beach trip",
    description: "Smart packing list"
  },
  {
    icon: AirplaneTakeoff,
    color: "var(--travel-sky)",
    text: "Flight from NYC to London",
    description: "Cost & distance estimates"
  },
  {
    icon: CurrencyCircleDollar,
    color: "var(--travel-rose)",
    text: "Convert $500 to Euros",
    description: "Currency exchange rates"
  },
  {
    icon: Compass,
    color: "var(--travel-violet)",
    text: "Top attractions in Rome",
    description: "Must-see destinations"
  },
  {
    icon: Translate,
    color: "var(--travel-sky)",
    text: "Basic French phrases",
    description: "Essential travel words"
  }
];

// ── Travel Background SVG Component (Unified Airport Horizon & Grid) ──

function TravelBackground() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let animId: number;
    const tick = () => {
      setTime(new Date());
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const stars = useMemo(() => {
    const list = [];
    // Generate 250 stars scattered across the 1600x900 viewport
    for (let i = 0; i < 250; i++) {
      list.push({
        cx: Math.random() * 1600,
        cy: Math.random() * 900,
        r: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.75 + 0.25,
        duration: `${Math.random() * 4 + 2}s`,
        delay: `${Math.random() * 4}s`,
        colorIndex: Math.floor(Math.random() * 5)
      });
    }
    return list;
  }, []);

  const ms = time.getMilliseconds();
  const secondsDeg = time.getSeconds() * 6 + ms * 0.006;
  const minutesDeg = time.getMinutes() * 6 + time.getSeconds() * 0.1;
  const hoursDeg = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;

  // Slow continuous rotation of compass dial (clockwise)
  const compassDeg = ((time.getTime() % 180000) / 180000) * 360;

  // Compass slowly drifts left-to-right (X: -180 to 1780) and waves vertically (Y: 200 to 300)
  const compassX = ((time.getTime() * 0.006) % 1960) - 180;
  const compassY = 240 + 50 * Math.sin(time.getTime() * 0.00012);

  // Clock slowly drifts right-to-left (X: 1780 to -180) and waves vertically (Y: 550 to 650)
  const clockX = 1780 - ((time.getTime() * 0.0055) % 1960);
  const clockY = 600 + 45 * Math.cos(time.getTime() * 0.0001);

  return (
    <div className="travel-background-container">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky backdrop matching theme gradient */}
        <rect width="1600" height="900" fill="var(--airport-sky-bg)" />

        {/* Twinkling star markers */}
        <g opacity="0.8">
          {stars.map((star, idx) => (
            <circle
              key={idx}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill={`var(--star-color-${star.colorIndex})`}
              opacity={star.opacity}
              style={{
                animation: `twinkle ${star.duration} infinite ease-in-out`,
                animationDelay: star.delay
              }}
            />
          ))}
        </g>

        {/* Map navigation grid */}
        <g opacity="0.12">
          {/* Vertical grid lines */}
          <line
            x1="200"
            y1="0"
            x2="200"
            y2="900"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="400"
            y1="0"
            x2="400"
            y2="900"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="600"
            y1="0"
            x2="600"
            y2="900"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="800"
            y1="0"
            x2="800"
            y2="900"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="1000"
            y1="0"
            x2="1000"
            y2="900"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="1200"
            y1="0"
            x2="1200"
            y2="900"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="1400"
            y1="0"
            x2="1400"
            y2="900"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />

          {/* Horizontal grid lines */}
          <line
            x1="0"
            y1="150"
            x2="1600"
            y2="150"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="300"
            x2="1600"
            y2="300"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="450"
            x2="1600"
            y2="450"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="600"
            x2="1600"
            y2="600"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="750"
            x2="1600"
            y2="750"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.8"
          />
        </g>

        {/* Elegant Dotted Navigation Flight Arcs (Varying arc sizes and thicknesses to imply depth) */}
        <g opacity="0.45">
          {/* Arc 1: Very Large / Close foreground arc */}
          <path
            id="flightPath1"
            d="M -100 700 Q 500 120 1700 400"
            stroke="var(--airport-silhouette-stroke)"
            strokeWidth="3.2"
            strokeDasharray="8,8"
            fill="none"
          />
          {/* Arc 2: Medium / Mid-ground arc */}
          <path
            id="flightPath2"
            d="M 1700 800 Q 900 180 -100 500"
            stroke="var(--airport-silhouette-stroke)"
            strokeWidth="1.8"
            strokeDasharray="6,6"
            fill="none"
          />
          {/* Arc 3: Small / Distant background arc */}
          <path
            id="flightPath3"
            d="M -100 200 Q 800 850 1700 300"
            stroke="var(--airport-silhouette-stroke)"
            strokeWidth="0.8"
            strokeDasharray="4,4"
            fill="none"
          />
          {/* Arc 4: Extra Small / Deep background arc */}
          <path
            id="flightPath4"
            d="M 1700 150 Q 700 850 -100 250"
            stroke="var(--airport-silhouette-stroke)"
            strokeWidth="0.5"
            strokeDasharray="3,3"
            fill="none"
          />
          {/* Arc 5: High Dramatic parabolic arc */}
          <path
            id="flightPath5"
            d="M -100 850 Q 800 50 1700 850"
            stroke="var(--airport-silhouette-stroke)"
            strokeWidth="1.2"
            strokeDasharray="5,5"
            fill="none"
          />
        </g>

        {/* Animated airplanes along the paths (Sized proportionally to imply depth) */}
        <g opacity="0.7">
          {/* Plane 1: Very Large plane on Arc 1 */}
          <g>
            <path
              d="M-8,-6 L8,0 L-8,6 L-4,0 Z"
              fill="var(--travel-amber)"
              transform="scale(1.85)"
            />
            <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flightPath1" />
            </animateMotion>
          </g>

          {/* Plane 2: Medium plane on Arc 2 */}
          <g>
            <path
              d="M-8,-6 L8,0 L-8,6 L-4,0 Z"
              fill="var(--travel-sky)"
              transform="scale(1.1)"
            />
            <animateMotion dur="26s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flightPath2" />
            </animateMotion>
          </g>

          {/* Plane 3: Small plane on Arc 3 */}
          <g>
            <path
              d="M-8,-6 L8,0 L-8,6 L-4,0 Z"
              fill="var(--travel-violet)"
              transform="scale(0.55)"
            />
            <animateMotion dur="32s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flightPath3" />
            </animateMotion>
          </g>

          {/* Plane 4: Extra Small plane on Arc 4 */}
          <g>
            <path
              d="M-8,-6 L8,0 L-8,6 L-4,0 Z"
              fill="var(--travel-rose)"
              transform="scale(0.4)"
            />
            <animateMotion dur="28s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flightPath4" />
            </animateMotion>
          </g>

          {/* Plane 5: Sized plane on Arc 5 */}
          <g>
            <path
              d="M-8,-6 L8,0 L-8,6 L-4,0 Z"
              fill="var(--travel-emerald)"
              transform="scale(0.75)"
            />
            <animateMotion dur="22s" repeatCount="indefinite" rotate="auto">
              <mpath href="#flightPath5" />
            </animateMotion>
          </g>
        </g>

        {/* Compass Rose Instrument Group (Travels and rotates slowly) */}
        <g transform={`translate(${compassX}, ${compassY}) rotate(${compassDeg})`} opacity="0.25">
          <circle
            cx="0"
            cy="0"
            r="140"
            stroke="var(--travel-sky)"
            strokeWidth="1"
            strokeDasharray="3,6"
            fill="none"
          />
          {/* Outer Cardinal Points */}
          <path
            d="M 0 -130 L 10 0 L 0 130 L -10 0 Z M -130 0 L 0 -10 L 130 0 L 0 10 Z"
            stroke="var(--travel-sky)"
            strokeWidth="1"
            fill="none"
          />
          <polygon points="0,-130 6,-40 -6,-40" fill="var(--travel-rose)" />
          <polygon points="0,130 6,40 -6,40" fill="var(--travel-sky)" />

          <text
            x="0"
            y="-142"
            fill="var(--travel-rose)"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
          >
            N
          </text>
          <text
            x="0"
            y="152"
            fill="var(--travel-sky)"
            fontSize="12"
            textAnchor="middle"
          >
            S
          </text>
          <text
            x="152"
            y="4"
            fill="var(--travel-sky)"
            fontSize="12"
            textAnchor="middle"
          >
            E
          </text>
          <text
            x="-152"
            y="4"
            fill="var(--travel-sky)"
            fontSize="12"
            textAnchor="middle"
          >
            W
          </text>
        </g>

        {/* Clock Instrument Group (Travels and floats independently, face remains upright) */}
        <g transform={`translate(${clockX}, ${clockY})`} opacity="0.45">
          {/* Inner dial bezel */}
          <circle
            cx="0"
            cy="0"
            r="85"
            stroke="var(--travel-glass-border)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="0"
            cy="0"
            r="78"
            stroke="var(--travel-glass-border)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            fill="none"
          />

          {/* Hour ticks */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 68 * Math.sin(angle);
            const y1 = -68 * Math.cos(angle);
            const x2 = 78 * Math.sin(angle);
            const y2 = -78 * Math.cos(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--travel-sky)"
                strokeWidth={i % 3 === 0 ? "2" : "1"}
              />
            );
          })}

          {/* Hour Hand */}
          <line
            x1="0"
            y1="0"
            x2={38 * Math.sin((hoursDeg * Math.PI) / 180)}
            y2={-38 * Math.cos((hoursDeg * Math.PI) / 180)}
            stroke="var(--travel-sky)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Minute Hand */}
          <line
            x1="0"
            y1="0"
            x2={58 * Math.sin((minutesDeg * Math.PI) / 180)}
            y2={-58 * Math.cos((minutesDeg * Math.PI) / 180)}
            stroke="var(--travel-sky)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Second Hand (Continuous smooth sweep, thickened to ensure high visibility) */}
          <line
            x1="0"
            y1="0"
            x2={68 * Math.sin((secondsDeg * Math.PI) / 180)}
            y2={-68 * Math.cos((secondsDeg * Math.PI) / 180)}
            stroke="var(--travel-amber)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Pivot screw pin */}
          <circle
            cx="0"
            cy="0"
            r="4.5"
            fill="var(--travel-navy)"
            stroke="var(--travel-amber)"
            strokeWidth="1.2"
          />
        </g>
      </svg>
    </div>
  );
}

// ── Mock Database and Helper functions for local Demo/Simulation Mode ─

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_PHRASES: Record<
  string,
  Array<{ english: string; local: string; pronunciation: string }>
> = {
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
    }
  ],
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
    }
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
    { english: "Excuse me", local: "Mi scusi", pronunciation: "mee SKOO-zee" }
  ],
  Spanish: [
    { english: "Hello", local: "Hola", pronunciation: "OH-lah" },
    { english: "Thank you", local: "Gracias", pronunciation: "GRAH-see-ahs" },
    { english: "Please", local: "Por favor", pronunciation: "por fah-VOR" },
    { english: "Excuse me", local: "Disculpe", pronunciation: "dees-KOOL-peh" }
  ]
};

function generateMockPackingList(tripType: string): Record<string, string[]> {
  const essentials = [
    "Passport & travel docs",
    "Phone & charger",
    "Universal adapter",
    "Credit cards & cash"
  ];
  if (tripType === "beach") {
    return {
      Essentials: essentials,
      Clothing: [
        "Swimsuits",
        "Sunglasses",
        "Flip flops",
        "Sun hat",
        "Light shirts"
      ],
      Toiletries: ["Sunscreen SPF 50", "Lip balm", "After-sun lotion"],
      Accessories: ["Beach towel", "Waterproof phone case", "Dry bag"]
    };
  } else if (tripType === "adventure") {
    return {
      Essentials: essentials,
      Clothing: [
        "Hiking boots",
        "Rain jacket",
        "Moisture-wicking socks",
        "Fleece layer"
      ],
      Toiletries: ["Bug spray", "First-aid kit", "Biodegradable soap"],
      Accessories: ["Daypack (25L)", "Water filter", "Headlamp"]
    };
  } else {
    return {
      Essentials: essentials,
      Clothing: ["Comfortable sneakers", "Jeans", "T-shirts", "Light jacket"],
      Toiletries: ["Toothbrush", "Deodorant", "Travel shampoo"],
      Accessories: ["Compact umbrella", "Power bank", "City map"]
    };
  }
}

const PROMPT_POSITIONS = [
  {
    style: { top: "18%", left: "5%", transform: "scale(1.05)" },
    widthClass: "w-52",
    type: "left"
  },
  {
    style: { top: "44%", left: "4%", transform: "scale(0.85)" },
    widthClass: "w-44",
    type: "right"
  },
  {
    style: { top: "70%", left: "5%", transform: "scale(1.0)" },
    widthClass: "w-48",
    type: "left"
  },
  {
    style: { top: "50%", left: "21%", transform: "scale(0.95)" },
    widthClass: "w-48",
    type: "right"
  },
  {
    style: { top: "63%", left: "66%", transform: "scale(0.95)" },
    widthClass: "w-48",
    type: "left"
  },
  {
    style: { top: "60%", left: "37%", transform: "scale(0.95)" },
    widthClass: "w-48",
    type: "right"
  },
  {
    style: { top: "49%", left: "51%", transform: "scale(0.95)" },
    widthClass: "w-48",
    type: "left"
  },
  {
    style: { top: "18%", right: "5%", transform: "scale(1.05)" },
    widthClass: "w-52",
    type: "right"
  },
  {
    style: { top: "44%", right: "4%", transform: "scale(0.85)" },
    widthClass: "w-44",
    type: "left"
  },
  {
    style: { top: "70%", right: "5%", transform: "scale(1.0)" },
    widthClass: "w-48",
    type: "right"
  }
];


// ── Main Chat Component ────────────────────────────────────────────────

function Chat() {
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute("data-mode") !== "light"
  );

  // Default to Demo Mode (true) for testing visual cards offline while quota is reset
  const [demoMode, setDemoMode] = useState(true);
  const [demoMessages, setDemoMessages] = useState<UIMessage[]>([]);
  const [demoStatus, setDemoStatus] = useState<
    "idle" | "streaming" | "submitted"
  >("idle");

  const agent = useAgent({
    agent: "TravelAgent",
    onOpen: useCallback(() => setConnected(true), []),
    onClose: useCallback(() => setConnected(false), [])
  });

  const { messages, sendMessage, clearHistory, status } = useAgentChat({
    agent
  });

  const activeMessages = demoMode ? demoMessages : messages;
  const activeStatus = demoMode ? demoStatus : status;
  const isStreaming =
    activeStatus === "streaming" || activeStatus === "submitted";
  const displayConnected = demoMode ? true : connected;

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // Re-focus after streaming
  useEffect(() => {
    if (!isStreaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStreaming]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const next = !dark;
    setDark(next);
    const mode = next ? "dark" : "light";
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.style.colorScheme = mode;
    localStorage.setItem("theme", mode);
  }, [dark]);

  // Simulated AI response stream generator for Demo Mode
  const simulateMockTravelResponse = async (text: string) => {
    const query = text.toLowerCase();
    let qType = "plan";
    let city = "Tokyo";
    let origin = "New York";
    let destination = "London";
    let amount = 100;
    let fromCurrency = "USD";
    let toCurrency = "EUR";
    let tripType = "city";

    if (query.includes("pack") || query.includes("bag")) {
      qType = "pack";
      city = query.includes("bali") ? "Bali" : "Paris";
      tripType = query.includes("beach") ? "beach" : "city";
    } else if (query.includes("news") || query.includes("headline")) {
      qType = "news";
      city = query.includes("london") ? "London" : "Tokyo";
    } else if (
      query.includes("sun") ||
      query.includes("golden hour") ||
      query.includes("sunset") ||
      query.includes("sunrise")
    ) {
      qType = "sun";
      city = query.includes("paris") ? "Paris" : "Tokyo";
    } else if (
      query.includes("air") ||
      query.includes("quality") ||
      query.includes("aqi")
    ) {
      qType = "air";
      city = query.includes("dubai") ? "Dubai" : "Tokyo";
    } else if (
      query.includes("weather") ||
      query.includes("forecast") ||
      query.includes("sydney")
    ) {
      qType = "weather";
      city = query.includes("sydney") ? "Sydney" : "Tokyo";
    } else if (
      query.includes("flight") ||
      query.includes("fly") ||
      query.includes("distance") ||
      query.includes("nyc") ||
      query.includes("london")
    ) {
      qType = "flight";
      if (query.includes("tokyo")) {
        destination = "Tokyo";
      } else if (query.includes("rome")) {
        destination = "Rome";
      } else if (query.includes("paris")) {
        destination = "Paris";
      }
    } else if (
      query.includes("convert") ||
      query.includes("exchange") ||
      query.includes("currency") ||
      query.includes("euro") ||
      query.includes("dollar") ||
      query.includes("$")
    ) {
      qType = "currency";
      const numMatch = query.match(/\d+/);
      if (numMatch) amount = parseInt(numMatch[0]);
      if (query.includes("yen")) {
        toCurrency = "JPY";
      } else if (query.includes("euro") || query.includes("eur")) {
        toCurrency = "EUR";
      } else if (query.includes("pound") || query.includes("gbp")) {
        toCurrency = "GBP";
      }
    } else if (
      query.includes("attraction") ||
      query.includes("see") ||
      query.includes("visit") ||
      query.includes("rome")
    ) {
      qType = "attractions";
      city = "Rome";
      if (query.includes("tokyo")) city = "Tokyo";
      else if (query.includes("paris")) city = "Paris";
    } else if (
      query.includes("phrase") ||
      query.includes("speak") ||
      query.includes("language") ||
      query.includes("french") ||
      query.includes("japanese")
    ) {
      qType = "phrases";
      city = "Paris";
      if (query.includes("japanese") || query.includes("tokyo")) city = "Tokyo";
      else if (
        query.includes("spanish") ||
        query.includes("rome") ||
        query.includes("italy")
      )
        city = "Rome";
    } else {
      const words = text.split(/\s+/);
      for (const w of words) {
        const clean = w.replace(/[?,.!]/g, "").trim();
        if (
          clean.length > 3 &&
          ![
            "plan",
            "trip",
            "flight",
            "pack",
            "beach",
            "convert",
            "euro",
            "weather",
            "about",
            "your",
            "with",
            "from",
            "local",
            "news",
            "golden",
            "hour",
            "air",
            "quality",
            "aqi",
            "schedules",
            "forecast",
            "what",
            "show",
            "tell"
          ].includes(clean.toLowerCase())
        ) {
          city = clean.charAt(0).toUpperCase() + clean.slice(1);
          break;
        }
      }
    }

    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: [{ type: "text", text }]
    };

    setDemoMessages((prev) => [...prev, userMsg]);
    setDemoStatus("streaming");

    await sleep(600);

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: UIMessage = {
      id: assistantMsgId,
      role: "assistant",
      parts: []
    };
    setDemoMessages((prev) => [...prev, initialAssistantMsg]);

    const updateParts = (parts: UIMessage["parts"]) => {
      setDemoMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, parts } : m))
      );
    };

    let finalIntroText = "";

    if (qType === "weather") {
      finalIntroText = `I have retrieved the current weather forecast for ${city}:`;
      const t1 = `tc-weather-${Date.now()}`;
      updateParts([
        {
          type: "tool-getWeather",
          toolCallId: t1,
          state: "input-streaming",
          input: { city }
        }
      ]);
      await sleep(1000);

      const weatherData = {
        city,
        forecast: [
          {
            date: "Today",
            high: "24°C",
            low: "16°C",
            condition: "Sunny",
            humidity: "45%",
            wind: "10 km/h"
          },
          {
            date: "Tomorrow",
            high: "22°C",
            low: "15°C",
            condition: "Partly Cloudy",
            humidity: "50%",
            wind: "12 km/h"
          },
          {
            date: "Day 3",
            high: "23°C",
            low: "14°C",
            condition: "Sunny",
            humidity: "40%",
            wind: "9 km/h"
          }
        ]
      };

      updateParts([
        {
          type: "tool-getWeather",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: weatherData
        }
      ]);
    } else if (qType === "news") {
      finalIntroText = `Here are the latest news headlines and travel updates for ${city}:`;
      const t1 = `tc-news-${Date.now()}`;
      updateParts([
        {
          type: "tool-getLocalNews",
          toolCallId: t1,
          state: "input-streaming",
          input: { city }
        }
      ]);
      await sleep(1200);

      const newsData = {
        city,
        articles: [
          {
            title: `Voyager Exclusive: ${city} unveils new historic pedestrian zones`,
            link: "https://news.google.com",
            pubDate: "2 hours ago",
            source: "Voyager Travel News"
          },
          {
            title: `Top museums in ${city} extend evening hours for summer season`,
            link: "https://news.google.com",
            pubDate: "Yesterday",
            source: "Local City Guide"
          },
          {
            title: `Annual arts festival opens in downtown ${city} to record crowds`,
            link: "https://news.google.com",
            pubDate: "2 days ago",
            source: "Metropolitan Post"
          }
        ]
      };

      updateParts([
        {
          type: "tool-getLocalNews",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: newsData
        }
      ]);
    } else if (qType === "sun") {
      finalIntroText = `Here are the sunrise, sunset, and golden hour schedules for ${city}:`;
      const t1 = `tc-sun-${Date.now()}`;
      updateParts([
        {
          type: "tool-getSunTimes",
          toolCallId: t1,
          state: "input-streaming",
          input: { city }
        }
      ]);
      await sleep(1000);

      const sunData = {
        city,
        sunrise: "5:58 AM",
        sunset: "9:12 PM",
        solarNoon: "1:35 PM",
        dayLength: "15h 14m"
      };

      updateParts([
        {
          type: "tool-getSunTimes",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: sunData
        }
      ]);
    } else if (qType === "air") {
      finalIntroText = `Here is the current air quality report for ${city}:`;
      const t1 = `tc-air-${Date.now()}`;
      updateParts([
        {
          type: "tool-getAirQuality",
          toolCallId: t1,
          state: "input-streaming",
          input: { city }
        }
      ]);
      await sleep(1000);

      const airData = {
        city,
        aqi: 34,
        pm2_5: 7.8,
        pm10: 12.4
      };

      updateParts([
        {
          type: "tool-getAirQuality",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: airData
        }
      ]);
    } else if (qType === "plan") {
      finalIntroText = `I have looked up the weather, top attractions, and essential phrases for ${city} below. Hope this helps you plan your journey!`;

      const t1 = `tc-weather-${Date.now()}`;
      updateParts([
        {
          type: "tool-getWeather",
          toolCallId: t1,
          state: "input-streaming",
          input: { city }
        }
      ]);
      await sleep(1000);

      const weatherData = {
        city,
        forecast: [
          {
            date: "Today",
            high: "24°C",
            low: "16°C",
            condition: "Sunny",
            humidity: "45%",
            wind: "10 km/h"
          },
          {
            date: "Tomorrow",
            high: "22°C",
            low: "15°C",
            condition: "Partly Cloudy",
            humidity: "50%",
            wind: "12 km/h"
          },
          {
            date: "Day 3",
            high: "23°C",
            low: "14°C",
            condition: "Sunny",
            humidity: "40%",
            wind: "9 km/h"
          }
        ]
      };

      const t2 = `tc-attr-${Date.now()}`;
      updateParts([
        {
          type: "tool-getWeather",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: weatherData
        },
        {
          type: "tool-getAttractions",
          toolCallId: t2,
          state: "input-streaming",
          input: { city }
        }
      ]);
      await sleep(1200);

      const attractionsData = {
        city,
        attractions: [
          {
            name: `${city} City Center`,
            description:
              "The vibrant main square, rich with historic architecture and cafes.",
            category: "Landmark"
          },
          {
            name: "Historical Quarter",
            description:
              "Narrow cobblestone streets filled with galleries and heritage buildings.",
            category: "Historical"
          },
          {
            name: "Panoramic Viewpoint",
            description:
              "The highest hill in the city, offering breathtaking scenic views.",
            category: "Nature"
          }
        ]
      };

      const t3 = `tc-phrases-${Date.now()}`;
      updateParts([
        {
          type: "tool-getWeather",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: weatherData
        },
        {
          type: "tool-getAttractions",
          toolCallId: t2,
          state: "output-available",
          input: { city },
          output: attractionsData
        },
        {
          type: "tool-getLocalPhrases",
          toolCallId: t3,
          state: "input-streaming",
          input: { destination: city }
        }
      ]);
      await sleep(1000);

      const phraseLang =
        city === "Tokyo"
          ? "Japanese"
          : city === "Paris"
            ? "French"
            : city === "Rome"
              ? "Italian"
              : "Spanish";
      const phraseData = {
        destination: city,
        language: phraseLang,
        phrases: MOCK_PHRASES[phraseLang] || MOCK_PHRASES["Spanish"],
        tip: "Locals appreciate any attempt to speak their language!"
      };

      updateParts([
        {
          type: "tool-getWeather",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: weatherData
        },
        {
          type: "tool-getAttractions",
          toolCallId: t2,
          state: "output-available",
          input: { city },
          output: attractionsData
        },
        {
          type: "tool-getLocalPhrases",
          toolCallId: t3,
          state: "output-available",
          input: { destination: city },
          output: phraseData
        }
      ]);
    } else if (qType === "pack") {
      finalIntroText = `I've prepared a comprehensive packing checklist for your ${tripType} trip to ${city}. You can review the details below:`;
      const t1 = `tc-pack-${Date.now()}`;
      updateParts([
        {
          type: "tool-getPackingList",
          toolCallId: t1,
          state: "input-streaming",
          input: { destination: city, tripType }
        }
      ]);
      await sleep(1200);

      const listData = {
        destination: city,
        tripType,
        expectedWeather: tripType === "beach" ? "Sunny and Warm" : "Chilly",
        packingList: generateMockPackingList(tripType),
        tip: "Roll your garments to save luggage space and reduce wrinkles!"
      };

      updateParts([
        {
          type: "tool-getPackingList",
          toolCallId: t1,
          state: "output-available",
          input: { destination: city, tripType },
          output: listData
        }
      ]);
    } else if (qType === "flight") {
      finalIntroText = `I have estimated the direct flight distance and approximate flight costs from ${origin} to ${destination}:`;
      const t1 = `tc-dist-${Date.now()}`;
      updateParts([
        {
          type: "tool-getFlightDistance",
          toolCallId: t1,
          state: "input-streaming",
          input: { origin, destination }
        }
      ]);
      await sleep(1000);

      const distanceData = {
        origin: {
          city: origin,
          country: "United States",
          coordinates: "40.7128°N, 74.0060°W"
        },
        destination: {
          city: destination,
          country: "United Kingdom",
          coordinates: "51.5074°N, 0.1278°W"
        },
        distanceKm: 5567,
        distanceMiles: 3459,
        estimatedFlightTime: "7h 15m"
      };

      const t2 = `tc-cost-${Date.now()}`;
      updateParts([
        {
          type: "tool-getFlightDistance",
          toolCallId: t1,
          state: "output-available",
          input: { origin, destination },
          output: distanceData
        },
        {
          type: "tool-estimateFlightCost",
          toolCallId: t2,
          state: "input-streaming",
          input: { origin, destination }
        }
      ]);
      await sleep(1200);

      const costData = {
        origin,
        destination,
        distanceKm: 5567,
        estimatedDuration: "7h 15m",
        economy: { low: "$380", high: "$520" },
        business: { low: "$1,450", high: "$1,890" }
      };

      updateParts([
        {
          type: "tool-getFlightDistance",
          toolCallId: t1,
          state: "output-available",
          input: { origin, destination },
          output: distanceData
        },
        {
          type: "tool-estimateFlightCost",
          toolCallId: t2,
          state: "output-available",
          input: { origin, destination },
          output: costData
        }
      ]);
    } else if (qType === "currency") {
      finalIntroText = `Here is the current simulated exchange conversion for ${amount} ${fromCurrency} to ${toCurrency}:`;
      const t1 = `tc-currency-${Date.now()}`;
      updateParts([
        {
          type: "tool-getCurrencyExchange",
          toolCallId: t1,
          state: "input-streaming",
          input: { from: fromCurrency, to: toCurrency, amount }
        }
      ]);
      await sleep(1000);

      const rate =
        toCurrency === "EUR" ? 0.92 : toCurrency === "JPY" ? 149.5 : 0.79;
      const converted = Math.round(amount * rate * 100) / 100;
      const exchangeData = {
        from: { currency: fromCurrency, amount },
        to: { currency: toCurrency, amount: converted },
        exchangeRate: `1 ${fromCurrency} = ${rate} ${toCurrency}`,
        note: "Exchange rates are simulated."
      };

      updateParts([
        {
          type: "tool-getCurrencyExchange",
          toolCallId: t1,
          state: "output-available",
          input: { from: fromCurrency, to: toCurrency, amount },
          output: exchangeData
        }
      ]);
    } else if (qType === "attractions") {
      finalIntroText = `I've put together the top must-visit attractions in ${city} for your travel plans:`;
      const t1 = `tc-attr-${Date.now()}`;
      updateParts([
        {
          type: "tool-getAttractions",
          toolCallId: t1,
          state: "input-streaming",
          input: { city }
        }
      ]);
      await sleep(1200);

      const attractionsData = {
        city,
        attractions: [
          {
            name: "The Colosseum",
            description:
              "An iconic ancient amphitheater in the center of the city of Rome.",
            category: "Landmark"
          },
          {
            name: "Trevi Fountain",
            description:
              "A breathtaking Baroque fountain where visitors toss coins for good luck.",
            category: "Landmark"
          },
          {
            name: "Vatican Museums",
            description:
              "World-renowned art museums displaying works from the immense collection amassed by the Popes.",
            category: "Museum"
          }
        ]
      };

      updateParts([
        {
          type: "tool-getAttractions",
          toolCallId: t1,
          state: "output-available",
          input: { city },
          output: attractionsData
        }
      ]);
    } else if (qType === "phrases") {
      finalIntroText = `Here are some essential local phrases to help you communicate during your visit to ${city}:`;
      const t1 = `tc-phrases-${Date.now()}`;
      updateParts([
        {
          type: "tool-getLocalPhrases",
          toolCallId: t1,
          state: "input-streaming",
          input: { destination: city }
        }
      ]);
      await sleep(1000);

      const phraseLang =
        city === "Tokyo"
          ? "Japanese"
          : city === "Paris"
            ? "French"
            : city === "Rome"
              ? "Italian"
              : "Spanish";
      const phraseData = {
        destination: city,
        language: phraseLang,
        phrases: MOCK_PHRASES[phraseLang] || MOCK_PHRASES["Spanish"],
        tip: "Locals appreciate any attempt to speak their language!"
      };

      updateParts([
        {
          type: "tool-getLocalPhrases",
          toolCallId: t1,
          state: "output-available",
          input: { destination: city },
          output: phraseData
        }
      ]);
    }

    await sleep(200);

    let currentText = "";
    const words = finalIntroText.split(" ");

    setDemoMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsgId
          ? { ...m, parts: [...m.parts, { type: "text", text: "" }] }
          : m
      )
    );

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setDemoMessages((prev) =>
        prev.map((m) => {
          if (m.id === assistantMsgId) {
            const newParts = [...m.parts];
            newParts[newParts.length - 1] = { type: "text", text: currentText };
            return { ...m, parts: newParts };
          }
          return m;
        })
      );
      await sleep(40 + Math.random() * 35);
    }

    setDemoStatus("idle");
  };

  // Send message
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");

    if (demoMode) {
      simulateMockTravelResponse(text);
    } else {
      sendMessage({ role: "user", parts: [{ type: "text", text }] });
    }

    if (inputRef.current) inputRef.current.style.height = "auto";
  }, [input, isStreaming, demoMode, sendMessage]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handlePromptClick = (text: string) => {
    if (isStreaming) return;
    if (demoMode) {
      simulateMockTravelResponse(text);
    } else {
      sendMessage({ role: "user", parts: [{ type: "text", text }] });
    }
  };

  const handleClearHistory = () => {
    if (demoMode) {
      setDemoMessages([]);
      setDemoStatus("idle");
    } else {
      clearHistory();
    }
  };

  return (
    <div
      className="flex flex-col h-screen relative overflow-hidden"
      style={{ background: "var(--travel-gradient)" }}
    >
      {/* Travel Background (Coordinates, Flight paths, Compass, ATC Tower, Runway) */}
      <TravelBackground />

      {/* Background orbs */}
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      {/* Scattered 3D Prompts */}
      {activeMessages.length === 0 && (
        <div className="absolute inset-0 pointer-events-none z-20 hidden lg:block">
          {PROMPTS.map((p, idx) => {
            const pos = PROMPT_POSITIONS[idx];
            const Icon = p.icon;
            const containerClass =
              pos.type === "left"
                ? "prompt-3d-left-container"
                : "prompt-3d-right-container";
            const cardClass =
              pos.type === "left" ? "prompt-3d-left" : "prompt-3d-right";

            return (
              <div
                key={p.text}
                className={`absolute pointer-events-auto ${containerClass} ${pos.widthClass}`}
                style={pos.style}
              >
                <button
                  onClick={() => handlePromptClick(p.text)}
                  disabled={isStreaming || !displayConnected}
                  className={`${cardClass} w-full suggestion-card-bubble p-4 text-left cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl`}
                >
                  <div className="mb-2">
                    <Icon
                      size={24}
                      weight="duotone"
                      style={{ color: p.color }}
                    />
                  </div>
                  <div className="text-xs font-semibold leading-tight">
                    {p.text}
                  </div>
                  <div className="text-xs opacity-40 mt-1 leading-tight">
                    {p.description}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Header */}
      <header
        className="relative z-10 header-bubble mx-3 mt-3 px-5 py-3.5 flex items-center justify-between rounded-2xl"
        style={{ borderRadius: "16px" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "var(--travel-amber-glow)" }}
          >
            <Airplane
              size={18}
              weight="duotone"
              style={{ color: "var(--travel-amber)" }}
            />
          </div>
          <div>
            <h1
              className="text-xl font-brand voyager-brand leading-none"
              style={{ color: "var(--travel-amber)" }}
            >
              VOYAGER
            </h1>
            <p className="text-xs opacity-40 -mt-0.5">AI Travel Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Demo Mode Badge */}
          {demoMode && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg demo-badge-pulse"
              style={{
                background: "rgba(167, 139, 250, 0.12)",
                border: "1px solid rgba(167, 139, 250, 0.25)"
              }}
            >
              <Sparkle size={12} weight="duotone" className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">
                Demo Mode
              </span>
            </div>
          )}

          {/* Connection status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: "var(--travel-glass)" }}
          >
            <div
              className={`w-2 h-2 rounded-full ${displayConnected && !demoMode ? "status-pulse" : ""}`}
              style={{
                background: displayConnected
                  ? "var(--travel-emerald)"
                  : "var(--travel-rose)"
              }}
            />
            <span className="text-xs opacity-50">
              {demoMode ? "Offline Simulate" : connected ? "Live" : "Offline"}
            </span>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg hover:opacity-80 transition-all cursor-pointer ${demoMode ? "demo-active-btn" : ""}`}
            style={{ background: "var(--travel-glass)" }}
            title={
              demoMode
                ? "Switch to Live Mode"
                : "Switch to Demo Mode (Local Simulation)"
            }
          >
            <MonitorPlay
              size={18}
              weight="duotone"
              className={demoMode ? "" : "opacity-60"}
            />
          </button>

          {/* Clear */}
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: "var(--travel-glass)" }}
            title="Clear chat"
          >
            <Trash size={16} weight="duotone" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: "var(--travel-glass)" }}
            title="Toggle theme"
          >
            {dark ? (
              <Sun size={18} weight="duotone" className="opacity-60" />
            ) : (
              <Moon size={18} weight="duotone" className="opacity-60" />
            )}
          </button>
        </div>
      </header>

      {/* Main split viewport layout */}
      <div className="flex-1 flex overflow-hidden relative z-10 w-full max-w-[1400px] mx-auto px-4 lg:px-6 gap-6 justify-center">
        {/* Center Column: Chat Interface */}
        <div className="flex-1 flex flex-col min-w-0 relative py-6 max-w-3xl">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
            <div className="max-w-2xl mx-auto py-2 space-y-4">
              {/* Empty state */}
              {activeMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 space-y-4 message-enter">
                  {/* Hero */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative float-animation">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{ background: "var(--travel-amber-glow)" }}
                      >
                        <Globe
                          size={30}
                          className="globe-spin"
                          style={{ color: "var(--travel-amber)" }}
                        />
                      </div>
                    </div>
                    <div className="text-center space-y-1.5">
                      <h2 className="text-5xl font-brand voyager-brand shimmer-text">
                        VOYAGER
                      </h2>
                      <p className="text-sm font-semibold tracking-wide opacity-80 font-brand">
                        Where to next?
                      </p>
                      <p className="text-xs opacity-40 max-w-xs mx-auto leading-normal">
                        I can check weather, find attractions, estimate flights,
                        exchange currencies, create packing lists, and teach you
                        local phrases.
                      </p>
                    </div>
                  </div>

                  {/* Prompt cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-lg lg:hidden">
                    {PROMPTS.map((p) => (
                      <button
                        key={p.text}
                        onClick={() => handlePromptClick(p.text)}
                        disabled={isStreaming || !displayConnected}
                        className="prompt-card suggestion-card-bubble p-3 text-left cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl"
                      >
                        <div className="mb-2">
                          <p.icon
                            size={24}
                            weight="duotone"
                            style={{ color: p.color }}
                          />
                        </div>
                        <div className="text-xs font-semibold leading-tight">
                          {p.text}
                        </div>
                        <div className="text-xs opacity-40 mt-1 leading-tight">
                          {p.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {activeMessages.map((message: UIMessage, index: number) => {
                const isUser = message.role === "user";
                const isLastAssistant =
                  message.role === "assistant" &&
                  index === activeMessages.length - 1;

                return (
                  <div key={message.id} className="space-y-2 message-enter">
                    {/* Tool parts */}
                    {message.parts.filter(isToolUIPart).map((part) => {
                      const toolName = getToolName(part);
                      if (part.state === "output-available") {
                        return (
                          <div key={part.toolCallId} className="max-w-lg">
                            <ToolOutputCard
                              toolName={toolName}
                              output={part.output}
                            />
                          </div>
                        );
                      }
                      if (
                        part.state === "input-available" ||
                        part.state === "input-streaming"
                      ) {
                        return (
                          <div key={part.toolCallId} className="max-w-lg">
                            <ToolRunningCard toolName={toolName} />
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* Text parts */}
                    {message.parts
                      .filter((part) => part.type === "text")
                      .map((part, i) => {
                        const text = (part as { type: "text"; text: string })
                          .text;
                        if (!text) return null;

                        if (isUser) {
                          return (
                            <div key={i} className="flex justify-end">
                              <div className="user-bubble px-4 py-2.5 max-w-[80%] text-sm leading-relaxed">
                                {text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={i} className="flex justify-start">
                            <div className="assistant-bubble max-w-[85%] overflow-hidden">
                              <Streamdown
                                className="sd-theme p-3.5"
                                plugins={{ code }}
                                controls={false}
                                isAnimating={isLastAssistant && isStreaming}
                              >
                                {text}
                              </Streamdown>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isStreaming &&
                activeMessages.length > 0 &&
                activeMessages[activeMessages.length - 1].role === "user" && (
                  <TypingIndicator />
                )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="px-1 pb-1 pt-3">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div
                className="glass-card-strong input-glow flex items-end gap-2 p-2.5 rounded-2xl transition-all"
                style={{ borderRadius: "18px" }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Voyager about weather, flights, currency..."
                  className="flex-1 max-h-32 bg-transparent text-sm resize-none border-0 outline-none p-1.5 text-foreground placeholder:opacity-30 focus:ring-0"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="p-2.5 cursor-pointer rounded-xl text-foreground hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <PaperPlaneRight size={16} weight="bold" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Sparkle size={14} weight="duotone" className="opacity-20" />
                <span className="text-xs opacity-20">
                  Powered by Cloudflare Workers AI
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById("root")!;
let root = (window as any).__reactRoot;
if (!root) {
  root = createRoot(container);
  (window as any).__reactRoot = root;
}
root.render(<Chat />);
