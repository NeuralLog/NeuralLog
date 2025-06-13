#!/bin/bash

# NeuralLog Quick Start Script
# This script sets up a complete local testing environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# Configuration
CLUSTER_NAME="neurallog-local"
SKIP_CLUSTER=false
SKIP_MONITORING=false
SKIP_OPERATOR=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-cluster) SKIP_CLUSTER=true; shift ;;
    --skip-monitoring) SKIP_MONITORING=true; shift ;;
    --skip-operator) SKIP_OPERATOR=true; shift ;;
    --cluster-name) CLUSTER_NAME="$2"; shift 2 ;;
    --help)
      echo "NeuralLog Quick Start"
      echo ""
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --skip-cluster     Skip cluster creation (use existing)"
      echo "  --skip-monitoring  Skip monitoring deployment"
      echo "  --skip-operator    Skip operator deployment"
      echo "  --cluster-name     Set cluster name (default: neurallog-local)"
      echo "  --help             Show this help"
      echo ""
      echo "This script will:"
      echo "1. Create a local Kubernetes cluster"
      echo "2. Deploy monitoring (Prometheus + Grafana)"
      echo "3. Deploy the NeuralLog operator"
      echo "4. Create example tenants"
      echo "5. Run validation tests"
      exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Banner
show_banner() {
  echo -e "${PURPLE}"
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                    🚀 NeuralLog Quick Start                  ║"
  echo "║                                                               ║"
  echo "║  This script will set up a complete local testing environment ║"
  echo "║  with monitoring, operator, and example tenants.             ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""
}

# Check prerequisites
check_prerequisites() {
  log_step "Checking prerequisites..."
  
  local missing=()
  
  if ! command -v kubectl &> /dev/null; then
    missing+=("kubectl")
  fi
  
  if ! command -v kind &> /dev/null; then
    missing+=("kind")
  fi
  
  if ! command -v docker &> /dev/null; then
    missing+=("docker")
  fi
  
  if [[ ${#missing[@]} -gt 0 ]]; then
    log_error "Missing required tools: ${missing[*]}"
    log_info "Please install the missing tools and try again."
    log_info "See DEPLOYMENT.md for installation instructions."
    exit 1
  fi
  
  # Check Docker daemon
  if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    log_info "Please start Docker and try again."
    exit 1
  fi
  
  log_success "All prerequisites are available"
}

# Step 1: Create cluster
create_cluster() {
  if [[ $SKIP_CLUSTER == true ]]; then
    log_info "Skipping cluster creation"
    return
  fi
  
  log_step "Creating local Kubernetes cluster..."
  
  if ! ./scripts/setup-local-cluster.sh --cluster-name $CLUSTER_NAME; then
    log_error "Failed to create cluster"
    exit 1
  fi
  
  log_success "Cluster created successfully"
}

# Step 2: Deploy monitoring
deploy_monitoring() {
  if [[ $SKIP_MONITORING == true ]]; then
    log_info "Skipping monitoring deployment"
    return
  fi
  
  log_step "Deploying monitoring stack..."
  
  if ! ./scripts/deploy-monitoring.sh --local; then
    log_error "Failed to deploy monitoring"
    exit 1
  fi
  
  log_success "Monitoring deployed successfully"
}

# Step 3: Deploy operator
deploy_operator() {
  if [[ $SKIP_OPERATOR == true ]]; then
    log_info "Skipping operator deployment"
    return
  fi
  
  log_step "Deploying NeuralLog operator..."
  
  # Check if operator directory exists
  if [[ ! -d "infra/operators/neurallog-operator" ]]; then
    log_warning "Operator directory not found, skipping operator deployment"
    return
  fi
  
  # Build and deploy operator (simplified for quick start)
  log_info "Creating operator namespace..."
  kubectl create namespace neurallog-operator-system --dry-run=client -o yaml | kubectl apply -f -
  
  # Apply CRDs
  log_info "Applying Custom Resource Definitions..."
  kubectl apply -f infra/k8s/operators/neurallog-operator.yaml
  
  log_success "Operator deployed successfully"
}

# Step 4: Create example tenants
create_example_tenants() {
  log_step "Creating example tenants..."
  
  if [[ ! -f "examples/tenant-example.yaml" ]]; then
    log_warning "Example tenant file not found, skipping tenant creation"
    return
  fi
  
  # Apply example tenants
  log_info "Creating example tenants..."
  kubectl apply -f examples/tenant-example.yaml
  
  # Wait a bit for tenants to be processed
  sleep 10
  
  # Check tenant status
  log_info "Checking tenant status..."
  kubectl get tenants
  
  log_success "Example tenants created"
}

# Step 5: Run tests
run_tests() {
  log_step "Running validation tests..."
  
  if ! ./scripts/test-deployment.sh; then
    log_warning "Some tests failed, but continuing..."
  else
    log_success "All tests passed!"
  fi
}

# Show access information
show_access_info() {
  log_step "🎉 Quick Start Complete!"
  echo ""
  
  log_info "Your NeuralLog environment is ready!"
  echo ""
  
  log_info "📊 Monitoring Access:"
  log_info "  Prometheus: http://localhost:30090"
  log_info "  Grafana:    http://localhost:30300 (admin/admin123)"
  echo ""
  
  log_info "🔧 Useful Commands:"
  log_info "  kubectl get tenants                    # List tenants"
  log_info "  kubectl get all -n neurallog-monitoring # Check monitoring"
  log_info "  kubectl get all -n tenant-acme-corp    # Check tenant resources"
  log_info "  kubectl logs -f deployment/prometheus -n neurallog-monitoring"
  echo ""
  
  log_info "📚 Next Steps:"
  log_info "  1. Explore Grafana dashboards"
  log_info "  2. Check Prometheus targets"
  log_info "  3. Create custom tenants"
  log_info "  4. Deploy billing and admin services"
  echo ""
  
  log_info "📖 Documentation:"
  log_info "  See DEPLOYMENT.md for detailed deployment instructions"
  log_info "  See examples/ for more tenant configurations"
}

# Cleanup function
cleanup() {
  if [[ $? -ne 0 ]]; then
    log_error "Quick start failed!"
    log_info "Check the logs above for details."
    log_info "You can clean up with: kind delete cluster --name $CLUSTER_NAME"
  fi
}

# Main execution
main() {
  trap cleanup EXIT
  
  show_banner
  
  log_info "Starting quick start with cluster: $CLUSTER_NAME"
  echo ""
  
  check_prerequisites
  create_cluster
  deploy_monitoring
  deploy_operator
  create_example_tenants
  run_tests
  show_access_info
  
  log_success "🚀 NeuralLog Quick Start completed successfully!"
}

main "$@"
