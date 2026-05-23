# 📊 Cairo Traffic System — Monitoring Stack

Prometheus + Grafana + Alertmanager with Discord alerts.
All configured via **init containers** — no ConfigMaps required.

---

## 📁 New Files Added

```
k8s/monitoring/
├── prometheus/
│   ├── rbac.yaml          # ServiceAccount + ClusterRole for k8s scraping
│   ├── deployment.yaml    # Prometheus (config written by init container)
│   └── service.yaml
├── grafana/
│   ├── deployment.yaml    # Grafana (datasource + dashboard via init container)
│   └── service.yaml
└── alertmanager/
    ├── secret.yaml        # ← PUT YOUR DISCORD WEBHOOK URL HERE
    ├── deployment.yaml    # Alertmanager (config written by init container)
    └── service.yaml

k8s/backend/
└── deployment.yaml        # Updated — added Prometheus scrape annotations

back/src/
└── metrics.js             # New — prom-client metrics for Node.js backend
```

---

## 🚀 How to Run the Project

### Prerequisites
- Docker Desktop with Kubernetes enabled **or** kind/minikube installed
- `kubectl` configured and pointing to your cluster
- Node.js 18+ (for local development)

---

### Step 1 — Build Docker Images

```bash
# Backend
docker build -t cairo-backend:latest ./back

# Frontend
docker build -t cairo-frontend:latest ./front

# Simulator
docker build -t cairo-simulator:latest ./simulator
```

If using **kind**, load images into the cluster:
```bash
kind load docker-image cairo-backend:latest
kind load docker-image cairo-frontend:latest
kind load docker-image cairo-simulator:latest
```

---

### Step 2 — Add prom-client to the Backend

```bash
cd back
npm install prom-client
```

Then in `back/src/app.js`, add these two lines:

```js
// At the top, after other requires:
const { metricsMiddleware, register } = require('./metrics');

// After app is created (app = express()):
app.use(metricsMiddleware);

// Add the /metrics endpoint:
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

Rebuild the backend Docker image after this change.

---

### Step 3 — Deploy the Kubernetes Stack

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Secrets
kubectl apply -f k8s/postgres/secret.yaml
kubectl apply -f k8s/backend/secret.yaml

# 3. Database
kubectl apply -f k8s/postgres/pvc.yaml
kubectl apply -f k8s/postgres/statefulset.yaml
kubectl apply -f k8s/postgres/service.yaml

# 4. Application
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
kubectl apply -f k8s/simulator/deployment.yaml
kubectl apply -f k8s/ingress/ingress.yaml

# 5. Monitoring — Prometheus
kubectl apply -f k8s/monitoring/prometheus/rbac.yaml
kubectl apply -f k8s/monitoring/prometheus/deployment.yaml
kubectl apply -f k8s/monitoring/prometheus/service.yaml

# 6. Monitoring — Alertmanager (set Discord URL first — see below)
kubectl apply -f k8s/monitoring/alertmanager/secret.yaml
kubectl apply -f k8s/monitoring/alertmanager/deployment.yaml
kubectl apply -f k8s/monitoring/alertmanager/service.yaml

# 7. Monitoring — Grafana
kubectl apply -f k8s/monitoring/grafana/deployment.yaml
kubectl apply -f k8s/monitoring/grafana/service.yaml
```

---

### Step 4 — Verify Everything Is Running

```bash
kubectl get pods -n cairo-traffic

# You should see all pods Running:
# backend-xxx        Running
# frontend-xxx       Running
# postgres-0         Running
# simulator-xxx      Running
# prometheus-xxx     Running
# grafana-xxx        Running
# alertmanager-xxx   Running
```

---

### Step 5 — Access the Dashboards

```bash
# Grafana (username: admin / password: cairo-admin-2024)
kubectl port-forward svc/grafana 3000:3000 -n cairo-traffic
# Open: http://localhost:3000

# Prometheus UI
kubectl port-forward svc/prometheus 9090:9090 -n cairo-traffic
# Open: http://localhost:9090

# Alertmanager UI
kubectl port-forward svc/alertmanager 9093:9093 -n cairo-traffic
# Open: http://localhost:9093
```

---

## 🔔 How to Add Your Discord Webhook for Alerts

### Step 1 — Create a Discord Webhook

1. Open Discord and go to your server
2. Right-click the channel where you want alerts → **Edit Channel**
3. Go to **Integrations** → **Webhooks** → **New Webhook**
4. Give it a name (e.g. `Cairo Traffic Alerts`)
5. Click **Copy Webhook URL** — it looks like:
   ```
   https://discord.com/api/webhooks/1234567890123456789/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 2 — Set the Webhook in Kubernetes

Edit `k8s/monitoring/alertmanager/secret.yaml`:
```yaml
stringData:
  DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
```

Then apply it:
```bash
kubectl apply -f k8s/monitoring/alertmanager/secret.yaml

# Restart Alertmanager so the init container picks up the new secret:
kubectl rollout restart deployment/alertmanager -n cairo-traffic
```

### Step 3 — Verify Alerts Are Working

```bash
# Check Alertmanager received the config
kubectl logs -n cairo-traffic deployment/alertmanager -c alertmanager-config-init

# Send a test alert via Alertmanager API
kubectl port-forward svc/alertmanager 9093:9093 -n cairo-traffic &

curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {"alertname":"TestAlert","severity":"warning"},
    "annotations": {
      "summary": "🧪 Test alert from Cairo Traffic",
      "description": "This is a test to verify Discord alerts work"
    }
  }]'
```

You should see a message appear in your Discord channel within ~30 seconds.

---

## 📈 Grafana Dashboard Panels

| Panel | Metric | Description |
|-------|--------|-------------|
| Node CPU | `node_cpu_seconds_total` | CPU % per Kubernetes node |
| Node Memory | `node_memory_MemAvailable_bytes` | RAM % per node |
| Container CPU | `container_cpu_usage_seconds_total` | CPU per pod in cairo-traffic namespace |
| Container Memory | `container_memory_working_set_bytes` | RAM per pod |
| API Response Time | `http_request_duration_seconds` | p50/p95/p99 latency |
| Traffic Count | `http_requests_total` | Requests per second by route |
| Error Rate | `http_requests_total{status=~"5.."}` | 4xx and 5xx per second |
| Congestion Level | `cairo_congestion_level` | District congestion gauge (0–1) |
| Traffic Vehicles | `cairo_traffic_count` | Vehicles per district/road type |

---

## 🚨 Discord Alerts Configured

| Alert | Condition | Severity | Channel Message |
|-------|-----------|----------|-----------------|
| High Congestion | `cairo_congestion_level > 0.8` for 3m | 🔴 Critical | @here notification |
| Service Down | `up == 0` for 1m | 🔴 Critical | @here notification |
| High CPU Usage | Node CPU > 85% for 5m | ⚠️ Warning | Warning message |
| High Error Rate | 5xx rate > 5% for 2m | ⚠️ Warning | Warning message |
| High Memory Usage | Node memory > 90% for 5m | ⚠️ Warning | Warning message |

---

## 🔧 Troubleshooting

```bash
# Check init container logs (where config is written)
kubectl logs -n cairo-traffic deployment/prometheus -c prometheus-config-init
kubectl logs -n cairo-traffic deployment/grafana -c grafana-config-init
kubectl logs -n cairo-traffic deployment/alertmanager -c alertmanager-config-init

# Check if Prometheus is scraping backend
# Open http://localhost:9090/targets after port-forward

# Check backend is exposing metrics
kubectl port-forward svc/backend 3000:3000 -n cairo-traffic
curl http://localhost:3000/metrics

# Restart all monitoring pods
kubectl rollout restart deployment/prometheus deployment/grafana deployment/alertmanager -n cairo-traffic
```
