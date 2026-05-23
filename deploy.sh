#!/usr/bin/env bash
# =============================================================================
# Cairo Traffic System — Full Declarative Deploy
# Works on: Git Bash (Windows), WSL, Linux, macOS
# Usage:
#   ./deploy.sh          → deploy (or re-apply) everything
#   ./deploy.sh destroy  → tear down everything
# =============================================================================

set -e

CLUSTER_NAME="cairo-traffic"
NAMESPACE="cairo-traffic"
INGRESS_MANIFEST="https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml"

# Prevent Git Bash on Windows from converting /api → C:/Program Files/Git/api
export MSYS_NO_PATHCONV=1

# ── colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
section() { echo -e "\n${GREEN}━━━ $* ━━━${NC}"; }

# =============================================================================
# DESTROY
# =============================================================================
if [[ "$1" == "destroy" ]]; then
  section "Tearing down"
  kubectl delete -f k8s/ingress/    --ignore-not-found
  kubectl delete -f k8s/frontend/   --ignore-not-found
  kubectl delete -f k8s/simulator/  --ignore-not-found
  kubectl delete -f k8s/backend/    --ignore-not-found
  kubectl delete -f k8s/postgres/   --ignore-not-found
  kubectl delete -f k8s/namespace.yaml --ignore-not-found
  kind delete cluster --name "$CLUSTER_NAME" || true
  info "Done."
  exit 0
fi

# =============================================================================
# DEPLOY
# =============================================================================

# ── 1. kind cluster ──────────────────────────────────────────────────────────
section "Step 1 — kind cluster"
if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
  warn "Cluster '${CLUSTER_NAME}' already exists — skipping creation"
else
  info "Creating kind cluster ..."
  kind create cluster --config kind-config.yaml
fi
kubectl config use-context "kind-${CLUSTER_NAME}"

# ── 2. nginx-ingress controller ──────────────────────────────────────────────
section "Step 2 — nginx-ingress controller"
if kubectl get deployment ingress-nginx-controller -n ingress-nginx &>/dev/null; then
  warn "nginx-ingress already installed — skipping"
else
  info "Applying nginx-ingress for kind ..."
  kubectl apply -f "$INGRESS_MANIFEST"
fi

info "Waiting for ingress controller pod to be created ..."
until kubectl get pod -n ingress-nginx -l app.kubernetes.io/component=controller 2>/dev/null | grep -q controller; do
  sleep 2
done

info "Waiting for ingress controller to be ready ..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s

# ── 3. Docker images ─────────────────────────────────────────────────────────
section "Step 3 — Build & load Docker images"

info "Building cairo-traffic-backend ..."
docker build -t cairo-traffic-backend:latest ./back

info "Building cairo-traffic-simulator ..."
docker build -t cairo-traffic-simulator:latest ./simulator

info "Building cairo-traffic-frontend ..."
# No --build-arg needed: baseURL '/api' is hardcoded in api.js
# MSYS_NO_PATHCONV=1 is already exported above to prevent Git Bash path mangling
docker build -t cairo-traffic-frontend:latest ./front

info "Loading images into kind cluster ..."
kind load docker-image \
  cairo-traffic-backend:latest \
  cairo-traffic-simulator:latest \
  cairo-traffic-frontend:latest \
  --name "$CLUSTER_NAME"

# ── 4. Namespace ─────────────────────────────────────────────────────────────
section "Step 4 — Namespace"
kubectl apply -f k8s/namespace.yaml
info "Waiting for namespace to become Active ..."
kubectl wait --for=jsonpath='{.status.phase}'=Active \
  namespace/"$NAMESPACE" --timeout=30s

# ── 5. Postgres ───────────────────────────────────────────────────────────────
section "Step 5 — Postgres"
kubectl apply -f k8s/postgres/
info "Waiting for postgres pod to be Ready ..."
kubectl wait --namespace "$NAMESPACE" \
  --for=condition=ready pod \
  --selector=app=postgres \
  --timeout=120s

# ── 6. Backend ────────────────────────────────────────────────────────────────
section "Step 6 — Backend"
kubectl apply -f k8s/backend/
info "Waiting for backend pod to be Ready (includes prisma migrate) ..."
kubectl wait --namespace "$NAMESPACE" \
  --for=condition=ready pod \
  --selector=app=backend \
  --timeout=120s

# ── 7. Simulator ──────────────────────────────────────────────────────────────
section "Step 7 — Simulator"
kubectl apply -f k8s/simulator/

# ── 8. Frontend ───────────────────────────────────────────────────────────────
section "Step 8 — Frontend"
kubectl apply -f k8s/frontend/

# ── 9. Ingress ────────────────────────────────────────────────────────────────
section "Step 9 — Ingress"
kubectl apply -f k8s/ingress/

# ── Done ──────────────────────────────────────────────────────────────────────
section "All done"
echo ""
info "Pods:"
kubectl get pods -n "$NAMESPACE"
echo ""
info "Ingress:"
kubectl get ingress -n "$NAMESPACE"
echo ""
echo -e "${GREEN}▶  App is running at → http://localhost${NC}"
echo -e "${GREEN}▶  API health check  → http://localhost/health${NC}"
