# 🚀 NeuralLog Deployment Guide

This guide covers local testing and production deployment of the NeuralLog monitoring infrastructure.

## 📋 Prerequisites

### Required Tools
- **kubectl** - Kubernetes CLI
- **Docker** - Container runtime
- **kind** or **minikube** - Local Kubernetes (for testing)
- **curl** - For testing endpoints

### Installation Commands
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## 🧪 Local Testing

### Step 1: Create Local Cluster
```bash
# Create a local Kubernetes cluster with kind
./scripts/setup-local-cluster.sh

# Or use minikube
./scripts/setup-local-cluster.sh --minikube

# Verify cluster
kubectl get nodes
kubectl cluster-info
```

### Step 2: Deploy Monitoring Stack
```bash
# Deploy Prometheus and Grafana for local testing
./scripts/deploy-monitoring.sh --local

# Check deployment status
kubectl get all -n neurallog-monitoring
```

### Step 3: Test Deployment
```bash
# Run comprehensive tests
./scripts/test-deployment.sh

# Manual verification
curl http://localhost:30090/metrics  # Prometheus
curl http://localhost:30300/api/health  # Grafana
```

### Step 4: Access Monitoring
- **Prometheus**: http://localhost:30090
- **Grafana**: http://localhost:30300
  - Username: `admin`
  - Password: `admin123`

## 🏭 Production Deployment

### Step 1: Prepare Production Cluster
```bash
# Connect to your production cluster
kubectl config use-context your-production-cluster

# Verify cluster resources
kubectl get nodes
kubectl get storageclass
```

### Step 2: Create Monitoring Namespace
```bash
# Create namespace
kubectl apply -f infra/monitoring/namespace.yaml

# Verify namespace
kubectl get namespace neurallog-monitoring
```

### Step 3: Deploy RBAC
```bash
# Deploy service accounts and permissions
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus
  namespace: neurallog-monitoring
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
  namespace: neurallog-monitoring
EOF
```

### Step 4: Deploy Prometheus Rules
```bash
# Deploy alerting rules
kubectl apply -f infra/monitoring/prometheus/rules.yaml
```

### Step 5: Deploy Monitoring Stack
```bash
# Deploy Prometheus
kubectl apply -f infra/monitoring/prometheus/prometheus.yaml

# Deploy Grafana
kubectl apply -f infra/monitoring/grafana/grafana.yaml

# Wait for deployments
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n neurallog-monitoring
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n neurallog-monitoring
```

### Step 6: Configure Ingress (Production)
```bash
# Update ingress with your domain
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: monitoring-ingress
  namespace: neurallog-monitoring
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - monitoring.yourdomain.com
    secretName: monitoring-tls
  rules:
  - host: monitoring.yourdomain.com
    http:
      paths:
      - path: /prometheus
        pathType: Prefix
        backend:
          service:
            name: prometheus
            port:
              number: 9090
      - path: /grafana
        pathType: Prefix
        backend:
          service:
            name: grafana
            port:
              number: 3000
EOF
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production:
```bash
# Grafana
GRAFANA_ADMIN_PASSWORD=your-secure-password

# Prometheus
PROMETHEUS_RETENTION_TIME=30d
PROMETHEUS_STORAGE_SIZE=100Gi

# Grafana
GRAFANA_STORAGE_SIZE=20Gi

# Domain
MONITORING_DOMAIN=monitoring.yourdomain.com
```

### Storage Configuration
Update storage class in production:
```yaml
# In prometheus.yaml and grafana.yaml
spec:
  storageClassName: fast-ssd  # Change to your storage class
  resources:
    requests:
      storage: 100Gi  # Adjust size as needed
```

## 🧪 Testing & Validation

### Health Checks
```bash
# Check all components
kubectl get all -n neurallog-monitoring

# Check pod logs
kubectl logs -f deployment/prometheus -n neurallog-monitoring
kubectl logs -f deployment/grafana -n neurallog-monitoring

# Check metrics
kubectl port-forward svc/prometheus 9090:9090 -n neurallog-monitoring
curl http://localhost:9090/metrics
```

### Automated Testing
```bash
# Run comprehensive test suite
./scripts/test-deployment.sh

# Test specific components
kubectl exec -n neurallog-monitoring deployment/prometheus -- wget -q -O- http://localhost:9090/metrics
kubectl exec -n neurallog-monitoring deployment/grafana -- wget -q -O- http://localhost:3000/api/health
```

## 📊 Monitoring Verification

### Prometheus Targets
1. Access Prometheus UI
2. Go to Status → Targets
3. Verify all targets are "UP"

### Grafana Dashboards
1. Access Grafana UI
2. Check data source connectivity
3. Import NeuralLog dashboards
4. Verify metrics are flowing

### Key Metrics to Monitor
- `up{job=~"neurallog-.*"}` - Service availability
- `kube_pod_status_ready` - Pod health
- `prometheus_tsdb_head_samples_appended_total` - Metrics ingestion
- `grafana_api_response_status_total` - Grafana health

## 🚨 Troubleshooting

### Common Issues

#### Prometheus Not Starting
```bash
# Check logs
kubectl logs deployment/prometheus -n neurallog-monitoring

# Check configuration
kubectl get configmap prometheus-config -n neurallog-monitoring -o yaml

# Check RBAC
kubectl auth can-i get pods --as=system:serviceaccount:neurallog-monitoring:prometheus
```

#### Grafana Not Accessible
```bash
# Check service
kubectl get svc grafana -n neurallog-monitoring

# Check ingress
kubectl get ingress -n neurallog-monitoring

# Port forward for testing
kubectl port-forward svc/grafana 3000:3000 -n neurallog-monitoring
```

#### Storage Issues
```bash
# Check PVCs
kubectl get pvc -n neurallog-monitoring

# Check storage class
kubectl get storageclass

# Check events
kubectl get events -n neurallog-monitoring --sort-by='.lastTimestamp'
```

### Recovery Procedures

#### Restart Monitoring Stack
```bash
# Restart Prometheus
kubectl rollout restart deployment/prometheus -n neurallog-monitoring

# Restart Grafana
kubectl rollout restart deployment/grafana -n neurallog-monitoring
```

#### Reset Configuration
```bash
# Delete and recreate config
kubectl delete configmap prometheus-config -n neurallog-monitoring
kubectl apply -f infra/monitoring/prometheus/prometheus.yaml
```

## 🔒 Security Considerations

### Production Security
1. **Change default passwords**
2. **Enable TLS/SSL**
3. **Configure authentication**
4. **Set up network policies**
5. **Regular security updates**

### Access Control
```bash
# Create read-only user for Grafana
kubectl create secret generic grafana-readonly-user \
  --from-literal=username=readonly \
  --from-literal=password=secure-password \
  -n neurallog-monitoring
```

## 📈 Scaling

### Resource Scaling
```bash
# Scale Prometheus
kubectl patch deployment prometheus -n neurallog-monitoring -p '{"spec":{"replicas":2}}'

# Increase resources
kubectl patch deployment prometheus -n neurallog-monitoring -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "prometheus",
          "resources": {
            "requests": {"cpu": "1", "memory": "2Gi"},
            "limits": {"cpu": "4", "memory": "8Gi"}
          }
        }]
      }
    }
  }
}'
```

## 🎯 Next Steps

After successful deployment:

1. **Deploy NeuralLog Operator**: `make -C infra/operators/neurallog-operator deploy`
2. **Deploy Billing Service**: `kubectl apply -f apps/billing/k8s/`
3. **Deploy Admin Service**: `kubectl apply -f apps/admin/k8s/`
4. **Create Test Tenant**: `kubectl apply -f examples/tenant-example.yaml`
5. **Configure Alerting**: Set up AlertManager for notifications
6. **Create Dashboards**: Import NeuralLog-specific Grafana dashboards

---

🎉 **Your NeuralLog monitoring infrastructure is now ready for production!**
