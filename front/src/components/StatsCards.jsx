function StatCard({ icon, label, value, colorClass, accentClass, sub }) {
  return (
    <div className="card">
      <span className="card-icon">{icon}</span>
      <p className="card-label">{label}</p>
      <div className={`card-value ${colorClass}`}>{value}</div>
      {sub && <p className="card-sub">{sub}</p>}
      <div className={`card-accent-line ${accentClass}`} />
    </div>
  );
}

function StatsCards({ stats }) {
  const avgSpeed = stats.averageSpeed ? stats.averageSpeed.toFixed(1) : "0.0";

  return (
    <div className="cards-grid">
      <StatCard
        icon="⬡"
        label="Total Traffic Records"
        value={(stats.totalRecords ?? 0).toLocaleString()}
        colorClass=""
        accentClass=""
        sub="All-time entries"
      />
      <StatCard
        icon="⚠"
        label="High Congestion Zones"
        value={stats.highCongestion ?? 0}
        colorClass="amber"
        accentClass="amber"
        sub={`${stats.mediumCongestion ?? 0} medium zones`}
      />
      <StatCard
        icon="⊕"
        label="Avg Vehicle Count"
        value={stats.averageVehicleCount ? stats.averageVehicleCount.toFixed(1) : "0.0"}
        colorClass="green"
        accentClass="green"
        sub="Vehicles per location"
      />
      <StatCard
        icon="⚡"
        label="Avg Network Speed"
        value={`${avgSpeed}`}
        colorClass=""
        accentClass=""
        sub="km/h across Cairo"
      />
      <StatCard
        icon="⛔"
        label="Active Incidents"
        value={stats.activeIncidents ?? 0}
        colorClass="red"
        accentClass="red"
        sub="Accidents · Works · Breakdowns"
      />
    </div>
  );
}

export default StatsCards;
