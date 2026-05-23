import { useEffect, useState, useCallback } from "react";
import API from "./services/api";
import StatsCards    from "./components/StatsCards";
import TrafficChart  from "./components/TrafficChart";
import AlertsTable   from "./components/AlertsTable";
import DistrictStats from "./components/DistrictStats";
import HourlyTrend   from "./components/HourlyTrend";
import IncidentsPanel from "./components/IncidentsPanel";
import RoadTypeChart  from "./components/RoadTypeChart";
import WeatherBanner  from "./components/WeatherBanner";

function App() {
  const [trafficData,  setTrafficData]  = useState([]);
  const [stats,        setStats]        = useState({});
  const [alerts,       setAlerts]       = useState([]);
  const [districts,    setDistricts]    = useState([]);
  const [hourly,       setHourly]       = useState([]);
  const [incidents,    setIncidents]    = useState([]);
  const [roadTypes,    setRoadTypes]    = useState([]);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, sRes, aRes, dRes, hRes, iRes, rRes] = await Promise.all([
        API.get("/traffic"),
        API.get("/traffic/stats"),
        API.get("/traffic/alerts"),
        API.get("/traffic/by-district"),
        API.get("/traffic/hourly"),
        API.get("/traffic/incidents"),
        API.get("/traffic/road-types"),
      ]);
      setTrafficData(tRes.data);
      setStats(sRes.data);
      setAlerts(aRes.data);
      setDistricts(dRes.data);
      setHourly(hRes.data);
      setIncidents(iRes.data);
      setRoadTypes(rRes.data);
      setLastUpdated(new Date().toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="header-eyebrow">▸ Cairo Smart City Infrastructure · EG</p>
          <h1 className="dashboard-title">
            <span>Intelligent Traffic</span> Management
          </h1>
          <p className="dashboard-subtitle">
            Real-Time Urban Traffic Monitoring &amp; Analytics — Cairo Governorate
          </p>
        </div>
        <div className="header-right">
          <div className="live-status">
            <span className="live-dot" />
            LIVE
          </div>
          {lastUpdated && (
            <span className="updated-at">Updated {lastUpdated} CLT</span>
          )}
          <div className="data-refresh">
            <span className="refresh-icon">↻</span> 5s refresh
          </div>
        </div>
      </div>

      {/* Weather Banner */}
      <WeatherBanner trafficData={trafficData} />

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Two-column: Live Chart + Road Types */}
      <div className="two-col">
        <TrafficChart trafficData={trafficData} />
        <RoadTypeChart roadTypes={roadTypes} />
      </div>

      {/* Hourly Trend */}
      <HourlyTrend hourly={hourly} />

      {/* District Stats */}
      <DistrictStats districts={districts} />

      {/* Two-column: Alerts + Incidents */}
      <div className="two-col">
        <AlertsTable alerts={alerts} />
        <IncidentsPanel incidents={incidents} />
      </div>

    </div>
  );
}

export default App;
