#!/bin/bash

# Local Kubernetes Cluster Setup for NeuralLog Testing
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CLUSTER_NAME="neurallog-local"
USE_KIND=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --minikube) USE_KIND=false; shift ;;
    --cluster-name) CLUSTER_NAME="$2"; shift 2 ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --minikube      Use minikube instead of kind"
      echo "  --cluster-name  Set cluster name (default: neurallog-local)"
      echo "  --help          Show this help"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found. Please install kubectl first."
    exit 1
  fi
  
  if [[ $USE_KIND == true ]]; then
    if ! command -v kind &> /dev/null; then
      log_error "kind not found. Installing kind..."
      install_kind
    fi
  else
    if ! command -v minikube &> /dev/null; then
      log_error "minikube not found. Please install minikube first."
      exit 1
    fi
  fi
  
  if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker first."
    exit 1
  fi
  
  log_success "Prerequisites check passed"
}

# Install kind
install_kind() {
  log_info "Installing kind..."
  
  # Detect OS
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)
  
  case $ARCH in
    x86_64) ARCH="amd64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) log_error "Unsupported architecture: $ARCH"; exit 1 ;;
  esac
  
  # Download and install kind
  curl -Lo ./kind "https://kind.sigs.k8s.io/dl/v0.20.0/kind-${OS}-${ARCH}"
  chmod +x ./kind
  sudo mv ./kind /usr/local/bin/kind
  
  log_success "kind installed successfully"
}

# Create kind cluster
create_kind_cluster() {
  log_info "Creating kind cluster: $CLUSTER_NAME"
  
  # Check if cluster already exists
  if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
    log_warning "Cluster $CLUSTER_NAME already exists"
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      kind delete cluster --name $CLUSTER_NAME
    else
      log_info "Using existing cluster"
      return
    fi
  fi
  
  # Create cluster with custom configuration
  cat <<EOF | kind create cluster --name $CLUSTER_NAME --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
  - containerPort: 30090
    hostPort: 30090
    protocol: TCP
  - containerPort: 30300
    hostPort: 30300
    protocol: TCP
- role: worker
- role: worker
EOF
  
  log_success "Kind cluster created: $CLUSTER_NAME"
}

# Create minikube cluster
create_minikube_cluster() {
  log_info "Creating minikube cluster: $CLUSTER_NAME"
  
  # Check if cluster already exists
  if minikube profile list | grep -q $CLUSTER_NAME; then
    log_warning "Cluster $CLUSTER_NAME already exists"
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      minikube delete --profile $CLUSTER_NAME
    else
      log_info "Using existing cluster"
      minikube profile $CLUSTER_NAME
      return
    fi
  fi
  
  # Create cluster
  minikube start \
    --profile $CLUSTER_NAME \
    --nodes 3 \
    --cpus 4 \
    --memory 8192 \
    --disk-size 50g \
    --kubernetes-version v1.28.0 \
    --addons ingress,metrics-server
  
  log_success "Minikube cluster created: $CLUSTER_NAME"
}

# Install ingress controller (for kind)
install_ingress_kind() {
  if [[ $USE_KIND == false ]]; then
    return
  fi
  
  log_info "Installing NGINX Ingress Controller..."
  
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
  
  log_info "Waiting for ingress controller to be ready..."
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=90s
  
  log_success "NGINX Ingress Controller installed"
}

# Create storage class
create_storage_class() {
  log_info "Creating storage class..."
  
  kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: rancher.io/local-path
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
EOF
  
  log_success "Storage class created"
}

# Verify cluster
verify_cluster() {
  log_info "Verifying cluster setup..."
  
  # Check nodes
  local nodes=$(kubectl get nodes --no-headers | wc -l)
  log_info "Cluster has $nodes node(s)"
  
  # Check system pods
  kubectl get pods -n kube-system
  
  # Check storage class
  kubectl get storageclass
  
  log_success "Cluster verification completed"
}

# Show access information
show_access_info() {
  log_success "🎉 Local Kubernetes cluster is ready!"
  echo ""
  log_info "Cluster: $CLUSTER_NAME"
  log_info "Nodes: $(kubectl get nodes --no-headers | wc -l)"
  log_info "Kubernetes version: $(kubectl version --short --client)"
  echo ""
  log_info "Next steps:"
  log_info "1. Deploy monitoring: ./scripts/deploy-monitoring.sh --local"
  log_info "2. Deploy NeuralLog operator: make -C infra/operators/neurallog-operator deploy"
  log_info "3. Test tenant creation: kubectl apply -f examples/tenant-example.yaml"
  echo ""
  log_info "Useful commands:"
  log_info "- kubectl get all --all-namespaces"
  log_info "- kubectl logs -f deployment/prometheus -n neurallog-monitoring"
  log_info "- kubectl port-forward svc/grafana 3000:3000 -n neurallog-monitoring"
}

# Main execution
main() {
  log_info "Setting up local Kubernetes cluster for NeuralLog"
  log_info "Cluster name: $CLUSTER_NAME"
  log_info "Using: $(if [[ $USE_KIND == true ]]; then echo 'kind'; else echo 'minikube'; fi)"
  
  check_prerequisites
  
  if [[ $USE_KIND == true ]]; then
    create_kind_cluster
    install_ingress_kind
  else
    create_minikube_cluster
  fi
  
  create_storage_class
  verify_cluster
  show_access_info
}

main "$@"
