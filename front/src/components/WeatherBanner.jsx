const WEATHER_CONFIG = {
  CLEAR:        { icon: "☀", label: "Clear Skies",  color: "var(--cyan)",  bg: "var(--cyan-dim)"   },
  DUSTY:        { icon: "🌫", label: "Dusty",        color: "var(--amber)", bg: "var(--amber-dim)"  },
  RAINY:        { icon: "🌧", label: "Rainy",        color: "#60a5fa",      bg: "rgba(96,165,250,.1)" },
  FOGGY:        { icon: "🌁", label: "Foggy",        color: "#94a3b8",      bg: "rgba(148,163,184,.1)" },
};

function WeatherBanner({ trafficData }) {
  if (!trafficData?.length) return null;

  // Tally weather conditions from latest records
  const counts = {};
  trafficData.slice(0, 30).forEach(d => {
    counts[d.weatherCondition] = (counts[d.weatherCondition] || 0) + 1;
  });
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "CLEAR";
  const cfg = WEATHER_CONFIG[dominant] || WEATHER_CONFIG.CLEAR;

  const conditions = Object.entries(counts).map(([k, v]) => ({
    ...WEATHER_CONFIG[k] || WEATHER_CONFIG.CLEAR,
    key: k,
    count: v,
  }));

  return (
    <div className="weather-banner" style={{ borderColor: cfg.color }}>
      <div className="weather-main" style={{ color: cfg.color, background: cfg.bg }}>
        <span className="weather-icon">{cfg.icon}</span>
        <span className="weather-label">Cairo Weather: {cfg.label}</span>
      </div>
      <div className="weather-conditions">
        {conditions.map(c => (
          <span key={c.key} className="weather-chip" style={{ color: c.color, background: c.bg, borderColor: c.color + "44" }}>
            {c.icon} {c.key} <span className="chip-count">{c.count}</span>
          </span>
        ))}
      </div>
      <div className="weather-note">
        <span style={{ color: "var(--text-muted)", fontSize: ".7rem", fontFamily: "'Space Mono', monospace" }}>
          ⓘ Conditions affect speed thresholds
        </span>
      </div>
    </div>
  );
}

export default WeatherBanner;
