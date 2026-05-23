import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#071525", border: "1px solid #1a5a9a",
      borderRadius: "8px", padding: "10px 14px",
      fontFamily: "'Space Mono', monospace", fontSize: "11px",
    }}>
      <p style={{ color: "#4a7a9b", marginBottom: "4px" }}>{label}:00</p>
      <p style={{ color: "#00d4ff" }}>{payload[0]?.value} <span style={{ color: "#4a7a9b" }}>avg vehicles</span></p>
      {payload[1] && <p style={{ color: "#f5a623" }}>{payload[1].value} <span style={{ color: "#4a7a9b" }}>km/h</span></p>}
    </div>
  );
};

function HourlyTrend({ hourly }) {
  // Build full 24-hour skeleton and merge with real data
  const full = Array.from({ length: 24 }, (_, h) => {
    const found = hourly.find((r) => Number(r.hour) === h);
    return {
      hour: h,
      label: `${String(h).padStart(2, "0")}h`,
      avg_vehicles: found ? Number(found.avg_vehicles) : 0,
      avg_speed:    found ? Number(found.avg_speed)    : 0,
    };
  });

  const maxV = Math.max(...full.map((d) => d.avg_vehicles), 1);

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">24-Hour Traffic Trend</h2>
        <span className="section-badge">LAST 24 HRS</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={full} margin={{ top: 8, right: 8, left: -15, bottom: 0 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#4a7a9b", fontSize: 9, fontFamily: "'Space Mono',monospace" }} axisLine={{ stroke: "#0f3460" }} tickLine={false} />
          <YAxis tick={{ fill: "#4a7a9b", fontSize: 9, fontFamily: "'Space Mono',monospace" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avg_vehicles" radius={[3, 3, 0, 0]}>
            {full.map((entry) => {
              const intensity = entry.avg_vehicles / maxV;
              const color = intensity > 0.7 ? "#ff3d5a" : intensity > 0.4 ? "#f5a623" : "#00d4ff";
              return <Cell key={entry.hour} fill={color} fillOpacity={0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
        {[["#00d4ff", "Low Load"], ["#f5a623", "Medium Load"], ["#ff3d5a", "High Load"]].map(([c, l]) => (
          <span key={l} style={{ fontFamily: "'Space Mono',monospace", fontSize: ".62rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: c, display: "inline-block" }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default HourlyTrend;
