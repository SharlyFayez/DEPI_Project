const CONGESTION_COLOR = { HIGH: "#ff3d5a", MEDIUM: "#f5a623", LOW: "#00ff94" };

function DistrictCard({ d }) {
  const cColor = CONGESTION_COLOR[d.congestionLevel] || "#4a7a9b";
  const speedPct = Math.min(100, Math.round((d.avgSpeed / 90) * 100));

  return (
    <div className="district-card">
      <div className="district-header">
        <span className="district-name">{d.district}</span>
        <span className="district-badge" style={{ color: cColor, background: cColor + "22", borderColor: cColor + "55" }}>
          {d.congestionLevel}
        </span>
      </div>

      <div className="district-metrics">
        <div className="d-metric">
          <span className="d-metric-val" style={{ color: cColor }}>{d.avgVehicleCount}</span>
          <span className="d-metric-label">vehicles</span>
        </div>
        <div className="d-metric">
          <span className="d-metric-val">{d.avgSpeed}</span>
          <span className="d-metric-label">km/h</span>
        </div>
        <div className="d-metric">
          <span className="d-metric-val">{d.recordCount}</span>
          <span className="d-metric-label">records</span>
        </div>
      </div>

      {/* Speed bar */}
      <div style={{ marginTop: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".58rem", color: "var(--text-muted)" }}>AVG SPEED</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".58rem", color: "var(--text-muted)" }}>{speedPct}%</span>
        </div>
        <div style={{ height: "5px", background: "rgba(255,255,255,.05)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${speedPct}%`, background: cColor, borderRadius: "3px", transition: "width .5s ease" }} />
        </div>
      </div>
    </div>
  );
}

function DistrictStats({ districts }) {
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Cairo District Overview</h2>
        <span className="section-badge">{districts.length} DISTRICTS</span>
      </div>
      <div className="districts-grid">
        {districts.length === 0 ? (
          <div className="empty-state">Loading district data…</div>
        ) : (
          districts.map((d) => <DistrictCard key={d.district} d={d} />)
        )}
      </div>
    </div>
  );
}

export default DistrictStats;
