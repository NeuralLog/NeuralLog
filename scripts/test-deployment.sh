#!/bin/bash

# NeuralLog Deployment Testing Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NAMESPACE="neurallog-monitoring"
TIMEOUT=300

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Test cluster connectivity
test_cluster_connectivity() {
  log_info "Testing cluster connectivity..."
  
  if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    return 1
  fi
  
  local nodes=$(kubectl get nodes --no-headers | grep Ready | wc -l)
  log_success "Connected to cluster with $nodes ready node(s)"
}

# Test namespace
test_namespace() {
  log_info "Testing namespace: $NAMESPACE"
  
  if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    log_error "Namespace $NAMESPACE not found"
    return 1
  fi
  
  log_success "Namespace $NAMESPACE exists"
}

# Test Prometheus deployment
test_prometheus() {
  log_info "Testing Prometheus deployment..."
  
  # Check deployment
  if ! kubectl get deployment prometheus -n $NAMESPACE &> /dev/null; then
    log_error "Prometheus deployment not found"
    return 1
  fi
  
  # Check if ready
  local ready=$(kubectl get deployment prometheus -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
  local desired=$(kubectl get deployment prometheus -n $NAMESPACE -o jsonpath='{.spec.replicas}')
  
  if [[ "$ready" != "$desired" ]]; then
    log_warning "Prometheus not ready: $ready/$desired replicas"
    return 1
  fi
  
  # Test metrics endpoint
  local pod=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[0].metadata.name}')
  if [[ -n "$pod" ]]; then
    if kubectl exec -n $NAMESPACE $pod -- wget -q -O- http://localhost:9090/metrics | head -1 | grep -q "HELP"; then
      log_success "Prometheus metrics endpoint responding"
    else
      log_warning "Prometheus metrics endpoint not responding properly"
    fi
  fi
  
  log_success "Prometheus deployment OK"
}

# Test Grafana deployment
test_grafana() {
  log_info "Testing Grafana deployment..."
  
  # Check deployment
  if ! kubectl get deployment grafana -n $NAMESPACE &> /dev/null; then
    log_error "Grafana deployment not found"
    return 1
  fi
  
  # Check if ready
  local ready=$(kubectl get deployment grafana -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
  local desired=$(kubectl get deployment grafana -n $NAMESPACE -o jsonpath='{.spec.replicas}')
  
  if [[ "$ready" != "$desired" ]]; then
    log_warning "Grafana not ready: $ready/$desired replicas"
    return 1
  fi
  
  # Test health endpoint
  local pod=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=grafana -o jsonpath='{.items[0].metadata.name}')
  if [[ -n "$pod" ]]; then
    if kubectl exec -n $NAMESPACE $pod -- wget -q -O- http://localhost:3000/api/health | grep -q "ok"; then
      log_success "Grafana health endpoint responding"
    else
      log_warning "Grafana health endpoint not responding properly"
    fi
  fi
  
  log_success "Grafana deployment OK"
}

# Test services
test_services() {
  log_info "Testing services..."
  
  # Check Prometheus service
  if ! kubectl get service prometheus -n $NAMESPACE &> /dev/null; then
    log_error "Prometheus service not found"
    return 1
  fi
  
  # Check Grafana service
  if ! kubectl get service grafana -n $NAMESPACE &> /dev/null; then
    log_error "Grafana service not found"
    return 1
  fi
  
  # Check NodePort services (if in local mode)
  if kubectl get service prometheus-nodeport -n $NAMESPACE &> /dev/null; then
    log_info "NodePort services found (local mode)"
    
    # Test local access
    if curl -s http://localhost:30090/metrics | head -1 | grep -q "HELP"; then
      log_success "Prometheus accessible at http://localhost:30090"
    else
      log_warning "Prometheus not accessible at http://localhost:30090"
    fi
    
    if curl -s http://localhost:30300/api/health | grep -q "ok"; then
      log_success "Grafana accessible at http://localhost:30300"
    else
      log_warning "Grafana not accessible at http://localhost:30300"
    fi
  fi
  
  log_success "Services OK"
}

# Test RBAC
test_rbac() {
  log_info "Testing RBAC configuration..."
  
  # Check service accounts
  if ! kubectl get serviceaccount prometheus -n $NAMESPACE &> /dev/null; then
    log_error "Prometheus service account not found"
    return 1
  fi
  
  if ! kubectl get serviceaccount grafana -n $NAMESPACE &> /dev/null; then
    log_error "Grafana service account not found"
    return 1
  fi
  
  # Check cluster roles
  if ! kubectl get clusterrole prometheus &> /dev/null; then
    log_error "Prometheus cluster role not found"
    return 1
  fi
  
  # Check cluster role bindings
  if ! kubectl get clusterrolebinding prometheus &> /dev/null; then
    log_error "Prometheus cluster role binding not found"
    return 1
  fi
  
  log_success "RBAC configuration OK"
}

# Test persistent volumes
test_storage() {
  log_info "Testing persistent storage..."
  
  # Check PVCs
  local prometheus_pvc=$(kubectl get pvc prometheus-storage -n $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null || echo "NotFound")
  local grafana_pvc=$(kubectl get pvc grafana-storage -n $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null || echo "NotFound")
  
  if [[ "$prometheus_pvc" == "Bound" ]]; then
    log_success "Prometheus PVC bound"
  elif [[ "$prometheus_pvc" == "Pending" ]]; then
    log_warning "Prometheus PVC pending"
  else
    log_warning "Prometheus PVC not found or in unexpected state: $prometheus_pvc"
  fi
  
  if [[ "$grafana_pvc" == "Bound" ]]; then
    log_success "Grafana PVC bound"
  elif [[ "$grafana_pvc" == "Pending" ]]; then
    log_warning "Grafana PVC pending"
  else
    log_warning "Grafana PVC not found or in unexpected state: $grafana_pvc"
  fi
}

# Test metrics collection
test_metrics_collection() {
  log_info "Testing metrics collection..."
  
  # Port forward to Prometheus
  kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090 &
  local pf_pid=$!
  sleep 5
  
  # Test if Prometheus is collecting metrics
  if curl -s "http://localhost:9090/api/v1/query?query=up" | grep -q "success"; then
    log_success "Prometheus is collecting metrics"
    
    # Test specific metrics
    local targets=$(curl -s "http://localhost:9090/api/v1/targets" | grep -o '"health":"up"' | wc -l)
    log_info "Found $targets healthy targets"
  else
    log_warning "Prometheus metrics collection not working properly"
  fi
  
  # Clean up port forward
  kill $pf_pid 2>/dev/null || true
}

# Show deployment status
show_status() {
  log_info "Deployment Status Summary:"
  echo ""
  
  # Pods
  log_info "Pods in $NAMESPACE:"
  kubectl get pods -n $NAMESPACE -o wide
  echo ""
  
  # Services
  log_info "Services in $NAMESPACE:"
  kubectl get services -n $NAMESPACE
  echo ""
  
  # PVCs
  log_info "Persistent Volume Claims:"
  kubectl get pvc -n $NAMESPACE
  echo ""
  
  # Resource usage
  log_info "Resource Usage:"
  kubectl top pods -n $NAMESPACE 2>/dev/null || log_warning "Metrics server not available"
}

# Main execution
main() {
  log_info "🧪 Testing NeuralLog Monitoring Deployment"
  echo ""
  
  local tests_passed=0
  local tests_failed=0
  
  # Run tests
  if test_cluster_connectivity; then ((tests_passed++)); else ((tests_failed++)); fi
  if test_namespace; then ((tests_passed++)); else ((tests_failed++)); fi
  if test_prometheus; then ((tests_passed++)); else ((tests_failed++)); fi
  if test_grafana; then ((tests_passed++)); else ((tests_failed++)); fi
  if test_services; then ((tests_passed++)); else ((tests_failed++)); fi
  if test_rbac; then ((tests_passed++)); else ((tests_failed++)); fi
  if test_storage; then ((tests_passed++)); else ((tests_failed++)); fi
  if test_metrics_collection; then ((tests_passed++)); else ((tests_failed++)); fi
  
  echo ""
  show_status
  
  echo ""
  log_info "Test Results: $tests_passed passed, $tests_failed failed"
  
  if [[ $tests_failed -eq 0 ]]; then
    log_success "🎉 All tests passed! Monitoring deployment is healthy."
    echo ""
    log_info "Access URLs (if using local mode):"
    log_info "📊 Prometheus: http://localhost:30090"
    log_info "📈 Grafana: http://localhost:30300 (admin/admin123)"
  else
    log_warning "⚠️  Some tests failed. Check the logs above for details."
    exit 1
  fi
}

main "$@"
