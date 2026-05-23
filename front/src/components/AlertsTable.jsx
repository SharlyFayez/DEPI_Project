function AlertsTable({ alerts }) {
  return (
    <div className="section flex-1">
      <div className="section-header">
        <h2 className="section-title">Congestion Alerts</h2>
        <span className="section-badge">{alerts.length} ACTIVE</span>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">// All corridors nominal</div>
      ) : (
        <div className="table-scroll">
          <table className="alert-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>District</th>
                <th>Vehicles</th>
                <th>Speed</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 10).map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="location-cell">
                      <span className="location-dot" />
                      {a.location}
                    </span>
                  </td>
                  <td className="district-cell">{a.district}</td>
                  <td className="vehicles-cell">{a.vehicleCount}</td>
                  <td className="speed-cell">{a.averageSpeed} km/h</td>
                  <td>
                    <span className={`congestion-badge ${a.congestionLevel.toLowerCase()}`}>
                      {a.congestionLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AlertsTable;
