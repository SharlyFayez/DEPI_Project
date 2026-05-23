# Cairo Traffic System — Kubernetes on kind (Docker Desktop)

## Prerequisites

| Tool | Install |
|---|---|
| Docker Desktop (running) | https://www.docker.com/products/docker-desktop |
| kind | `curl -Lo "C:/Windows/System32/kind.exe" "https://kind.sigs.k8s.io/dl/v0.23.0/kind-windows-amd64"` |
| kubectl | `curl -Lo "C:/Windows/System32/kubectl.exe" "https://dl.k8s.io/release/v1.30.0/bin/windows/amd64/kubectl.exe"` |

---

## Quickstart — one command

```bash
./deploy.sh
```

That's it. The script handles everything in the correct order:

1. Creates the kind cluster (skips if it already exists)
2. Installs nginx-ingress controller
3. Builds all three Docker images
4. Loads images into the kind cluster
5. Applies the namespace first, then all other manifests in dependency order
6. Waits for each layer (postgres → backend → frontend) to be ready before moving on

Open the app at → **http://localhost**

---

## Tear down — one command

```bash
./deploy.sh destroy
```

Deletes all Kubernetes resources and the kind cluster.

---

## Re-deploy after code changes

```bash
docker build -t cairo-traffic-backend:latest ./back
kind load docker-image cairo-traffic-backend:latest --name cairo-traffic
kubectl rollout restart deployment/backend -n cairo-traffic
```

---

## Architecture

```
  Browser → http://localhost
              │
        ┌─────▼──────────────────────────────────┐
        │  nginx-ingress-controller (port 80)     │
        └──────┬──────────────────────┬───────────┘
               │ /api/*  /health      │ /*
        ┌──────▼──────┐        ┌──────▼──────┐
        │  backend    │        │  frontend   │
        │  :5000      │        │  nginx :80  │
        └──────┬──────┘        └─────────────┘
               │
        ┌──────▼──────┐     ┌──────────────┐
        │  postgres   │◄────│  simulator   │
        │  :5432      │     │  (no port)   │
        └─────────────┘     └──────────────┘
```

---

## Useful commands

```bash
kubectl get pods -n cairo-traffic -w
kubectl logs -n cairo-traffic deploy/backend -f
kubectl logs -n cairo-traffic deploy/simulator -f
kubectl exec -n cairo-traffic deploy/backend -it -- sh
kubectl port-forward -n cairo-traffic svc/postgres 5432:5432
```

---

## File tree

```
cairo_traffic_system/
├── deploy.sh                 ← RUN THIS — full declarative deploy / destroy
├── kind-config.yaml          ← kind cluster definition
│
├── k8s/
│   ├── namespace.yaml
│   ├── postgres/             secret, pvc, statefulset, service
│   ├── backend/              secret, deployment (prisma migrate init), service
│   ├── simulator/            deployment (API_URL inlined)
│   ├── frontend/             deployment (nginx.conf baked into image), service
│   └── ingress/              ingress.yaml → /api→backend  /→frontend
│
├── back/                     Node.js + Prisma API
├── front/                    React + Vite  (nginx.conf baked in Dockerfile)
└── simulator/                Traffic data simulator
```
