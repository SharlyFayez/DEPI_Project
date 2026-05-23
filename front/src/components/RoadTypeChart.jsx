const ROAD_COLORS = {
  HIGHWAY:  { color: "#00d4ff", label: "Highway"  },
  ARTERIAL: { color: "#f5a623", label: "Arterial" },
  URBAN:    { color: "#00ff94", label: "Urban"    },
  BRIDGE:   { color: "#c084fc", label: "Bridge"   },
};

function RoadTypeChart({ roadTypes }) {
  const total = roadTypes.reduce((s, r) => s + r.avgVehicles, 0) || 1;

  return (
    <div className="section" style={{ width: "300px", flexShrink: 0 }}>
      <div className="section-header">
        <h2 className="section-title">Road Type Load</h2>
        <span className="section-badge">LIVE</span>
      </div>

      {roadTypes.length === 0 ? (
        <div className="empty-state">No data yet</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {roadTypes.map((r) => {
            const cfg = ROAD_COLORS[r.roadType] || { color: "#4a7a9b", label: r.roadType };
            const pct = Math.round((r.avgVehicles / total) * 100);
            return (
              <div key={r.roadType}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", color: cfg.color, letterSpacing: ".06em" }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".7rem", color: "var(--text-muted)" }}>
                    {r.avgVehicles} avg · {r.avgSpeed} km/h
                  </span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,.05)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: cfg.color,
                    borderRadius: "4px",
                    boxShadow: `0 0 8px ${cfg.color}66`,
                    transition: "width .6s ease",
                  }} />
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-dim)", marginTop: "4px" }}>
                  {r.count} records · {pct}% of network load
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RoadTypeChart;
