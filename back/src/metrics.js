// back/src/metrics.js
// Prometheus metrics for the Cairo Traffic backend
// Add "prom-client": "^15.1.3" to your package.json dependencies

const client = require('prom-client');

// ── Registry ───────────────────────────────────────────────────────────────
const register = new client.Registry();
register.setDefaultLabels({ app: 'cairo-backend' });

// Collect default Node.js metrics (heap, event loop, GC, etc.)
client.collectDefaultMetrics({ register });

// ── HTTP Counters ──────────────────────────────────────────────────────────
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// ── HTTP Latency Histogram ─────────────────────────────────────────────────
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

// ── Traffic Domain Metrics ─────────────────────────────────────────────────
const trafficCount = new client.Gauge({
  name: 'cairo_traffic_count',
  help: 'Current traffic vehicle count per district and road type',
  labelNames: ['district', 'road_type'],
  registers: [register],
});

const congestionLevel = new client.Gauge({
  name: 'cairo_congestion_level',
  help: 'Traffic congestion level between 0 (free) and 1 (gridlock)',
  labelNames: ['district'],
  registers: [register],
});

const incidentCount = new client.Counter({
  name: 'cairo_incidents_total',
  help: 'Total traffic incidents reported',
  labelNames: ['district', 'type', 'severity'],
  registers: [register],
});

// ── Express middleware to auto-track every request ─────────────────────────
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route: route,
      status: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });

  next();
}

// ── Helper: update traffic gauges from your DB/simulator data ─────────────
// Call this periodically from your controller or a cron job:
//   metrics.updateTrafficMetrics([{ district, road_type, count, congestion }])
function updateTrafficMetrics(records) {
  records.forEach(({ district, road_type, count, congestion }) => {
    trafficCount.set({ district, road_type }, count);
    congestionLevel.set({ district }, congestion);
  });
}

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  trafficCount,
  congestionLevel,
  incidentCount,
  metricsMiddleware,
  updateTrafficMetrics,
};
