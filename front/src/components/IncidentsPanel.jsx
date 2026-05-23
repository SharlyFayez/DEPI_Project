const INCIDENT_CONFIG = {
  ACCIDENT:     { icon: "⚡", label: "Accident",     color: "#ff3d5a" },
  CONSTRUCTION: { icon: "⚙", label: "Construction", color: "#f5a623" },
  BREAKDOWN:    { icon: "⛽", label: "Breakdown",    color: "#c084fc" },
};

function IncidentsPanel({ incidents }) {
  return (
    <div className="section" style={{ width: "340px", flexShrink: 0 }}>
      <div className="section-header">
        <h2 className="section-title">Active Incidents</h2>
        <span className="section-badge" style={{ color: incidents.length ? "#ff3d5a" : "var(--cyan)", borderColor: incidents.length ? "rgba(255,61,90,.3)" : "", background: incidents.length ? "rgba(255,61,90,.1)" : "" }}>
          {incidents.length} OPEN
        </span>
      </div>

      {incidents.length === 0 ? (
        <div className="empty-state">// No active incidents</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {incidents.slice(0, 8).map((inc) => {
            const cfg = INCIDENT_CONFIG[inc.incidentType] || { icon: "⚠", label: inc.incidentType, color: "#4a7a9b" };
            return (
              <div key={inc.id} className="incident-row">
                <span className="incident-icon" style={{ color: cfg.color }}>{cfg.icon}</span>
                <div className="incident-info">
                  <div className="incident-loc">{inc.location}</div>
                  <div className="incident-meta">
                    <span style={{ color: cfg.color, background: cfg.color + "22", border: `1px solid ${cfg.color}44`, fontFamily: "'Space Mono',monospace", fontSize: ".58rem", padding: "1px 6px", borderRadius: "3px" }}>
                      {cfg.label}
                    </span>
                    <span className="incident-district">{inc.district}</span>
                    <span className="incident-speed">{inc.averageSpeed} km/h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IncidentsPanel;
