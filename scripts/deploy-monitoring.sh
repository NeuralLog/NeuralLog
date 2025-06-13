#!/bin/bash

# NeuralLog Monitoring Deployment Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NAMESPACE="neurallog-monitoring"
LOCAL_MODE=false
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --local) LOCAL_MODE=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --help)
      echo "Usage: $0 [--local] [--dry-run]"
      echo "  --local    Deploy for local testing with NodePort"
      echo "  --dry-run  Show what would be deployed"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found"
    exit 1
  fi
  
  if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    exit 1
  fi
  
  log_success "Prerequisites OK"
}

# Create namespace
create_namespace() {
  log_info "Creating namespace: $NAMESPACE"
  
  if [[ $DRY_RUN == true ]]; then
    log_info "[DRY RUN] Would create namespace"
    return
  fi
  
  kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
  kubectl label namespace $NAMESPACE app.kubernetes.io/name=neurallog-monitoring --overwrite
}

# Deploy monitoring stack
deploy_monitoring() {
  log_info "Deploying monitoring stack..."
  
  if [[ $DRY_RUN == true ]]; then
    log_info "[DRY RUN] Would deploy monitoring"
    return
  fi
  
  # Create RBAC
  kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: $NAMESPACE
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus
rules:
- apiGroups: [""]
  resources: ["nodes", "nodes/proxy", "services", "endpoints", "pods"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get"]
- nonResourceURLs: ["/metrics"]
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus
subjects:
- kind: ServiceAccount
  name: prometheus
  namespace: $NAMESPACE
EOF

  # Deploy Prometheus and Grafana
  if [[ -f "infra/monitoring/prometheus/prometheus.yaml" ]]; then
    kubectl apply -f infra/monitoring/prometheus/prometheus.yaml
  fi
  
  if [[ -f "infra/monitoring/grafana/grafana.yaml" ]]; then
    kubectl apply -f infra/monitoring/grafana/grafana.yaml
  fi
}

# Configure local access
configure_local_access() {
  if [[ $LOCAL_MODE == false ]]; then
    return
  fi
  
  log_info "Configuring local access..."
  
  if [[ $DRY_RUN == true ]]; then
    log_info "[DRY RUN] Would configure local access"
    return
  fi
  
  kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: prometheus-nodeport
  namespace: $NAMESPACE
spec:
  type: NodePort
  ports:
  - port: 9090
    targetPort: 9090
    nodePort: 30090
  selector:
    app.kubernetes.io/name: prometheus
---
apiVersion: v1
kind: Service
metadata:
  name: grafana-nodeport
  namespace: $NAMESPACE
spec:
  type: NodePort
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30300
  selector:
    app.kubernetes.io/name: grafana
EOF
}

# Main execution
main() {
  log_info "Starting NeuralLog Monitoring Deployment"
  
  check_prerequisites
  create_namespace
  deploy_monitoring
  configure_local_access
  
  if [[ $DRY_RUN == false ]]; then
    log_info "Waiting for pods to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n $NAMESPACE || true
    kubectl wait --for=condition=available --timeout=300s deployment/grafana -n $NAMESPACE || true
  fi
  
  log_success "Deployment completed!"
  
  if [[ $LOCAL_MODE == true && $DRY_RUN == false ]]; then
    echo ""
    log_info "🎉 Local monitoring ready!"
    log_info "📊 Prometheus: http://localhost:30090"
    log_info "📈 Grafana: http://localhost:30300 (admin/admin123)"
  fi
}

main "$@"
