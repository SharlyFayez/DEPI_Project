import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#071525",
      border: "1px solid #1a5a9a",
      borderRadius: "8px",
      padding: "10px 14px",
      fontFamily: "'Space Mono', monospace",
      fontSize: "11px",
    }}>
      <p style={{ color: "#4a7a9b", marginBottom: "4px", fontSize: "0.62rem", letterSpacing: "0.1em" }}>{label}</p>
      <p style={{ color: "#00d4ff" }}>{payload[0].value} <span style={{ color: "#4a7a9b" }}>vehicles</span></p>
    </div>
  );
};

function TrafficChart({ trafficData }) {
  const chartData = trafficData
    .slice(0, 15)
    .reverse()
    .map((item) => ({
      location: item.location.split(" - ")[0].split(",")[0],
      vehicles: item.vehicleCount,
      speed: Math.round(item.averageSpeed),
    }));

  return (
    <div className="section flex-1">
      <div className="section-header">
        <h2 className="section-title">Live Traffic Flow</h2>
        <span className="section-badge">STREAMING</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" vertical={false} />
          <XAxis dataKey="location" tick={{ fill: "#4a7a9b", fontSize: 10, fontFamily: "'Space Mono',monospace" }} axisLine={{ stroke: "#0f3460" }} tickLine={false} />
          <YAxis tick={{ fill: "#4a7a9b", fontSize: 10, fontFamily: "'Space Mono',monospace" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="vehicles" stroke="#00d4ff" strokeWidth={2.5} fill="url(#vGrad)"
            dot={{ r: 3, fill: "#00d4ff", stroke: "#030a12", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#00d4ff", stroke: "#030a12", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrafficChart;
