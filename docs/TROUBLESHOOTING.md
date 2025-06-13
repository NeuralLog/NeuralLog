# 🐛 NeuralLog Troubleshooting Guide

Comprehensive troubleshooting guide for diagnosing and resolving common issues in the NeuralLog platform.

## 📋 Table of Contents

- [🚨 Emergency Procedures](#-emergency-procedures)
- [🔍 Diagnostic Tools](#-diagnostic-tools)
- [⚡ Performance Issues](#-performance-issues)
- [🔌 Connectivity Problems](#-connectivity-problems)
- [💾 Database Issues](#-database-issues)
- [☸️ Kubernetes Problems](#️-kubernetes-problems)
- [🏢 Multi-Tenant Issues](#-multi-tenant-issues)
- [💰 Billing Problems](#-billing-problems)
- [🔒 Security Issues](#-security-issues)
- [📊 Monitoring Problems](#-monitoring-problems)

---

## 🚨 Emergency Procedures

### 🔥 Service Outage Response

#### Immediate Actions (0-5 minutes)
```bash
# 1. Acknowledge the incident
pagerduty ack <incident-id>

# 2. Check overall system status
./scripts/quick-health-check.sh

# 3. Identify affected services
kubectl get pods --all-namespaces | grep -v Running

# 4. Check recent deployments
kubectl rollout history deployment --all-namespaces | tail -10

# 5. Create incident channel
slack create-channel incident-$(date +%Y%m%d-%H%M)
```

#### Quick Recovery Actions (5-15 minutes)
```bash
# Rollback recent deployment
kubectl rollout undo deployment/<service-name> -n <namespace>

# Scale up critical services
kubectl scale deployment/<service-name> --replicas=5 -n <namespace>

# Restart problematic pods
kubectl delete pods -l app=<service-name> -n <namespace>

# Check and clear resource constraints
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### 🚨 Data Loss Prevention

#### Database Emergency Backup
```bash
# Immediate backup before any recovery actions
./scripts/emergency-backup.sh --full --priority=critical

# Verify backup integrity
./scripts/verify-backup.sh --latest

# Enable read-only mode if needed
kubectl patch configmap postgres-config -p '{"data":{"readonly":"true"}}'
```

#### Tenant Data Protection
```bash
# Isolate affected tenant
kubectl patch tenant <tenant-id> -p '{"spec":{"suspended":true}}'

# Backup tenant data
./scripts/backup-tenant-data.sh --tenant=<tenant-id> --emergency

# Verify data integrity
./scripts/verify-tenant-data.sh --tenant=<tenant-id>
```

---

## 🔍 Diagnostic Tools

### 📊 System Health Check

#### Comprehensive Health Script
```bash
#!/bin/bash
# scripts/comprehensive-health-check.sh

echo "=== NeuralLog System Health Check ==="
echo "Timestamp: $(date)"
echo

# Kubernetes cluster health
echo "🔍 Kubernetes Cluster Health:"
kubectl get nodes -o wide
kubectl get componentstatuses
echo

# Core services status
echo "🔍 Core Services Status:"
kubectl get pods -n neurallog-system -o wide
kubectl get services -n neurallog-system
echo

# Database connectivity
echo "🔍 Database Connectivity:"
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  npm run db:health-check

# Redis connectivity
echo "🔍 Redis Connectivity:"
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  redis-cli -h redis ping

# API endpoints health
echo "🔍 API Endpoints Health:"
for service in billing admin log-server auth; do
  echo "Testing $service..."
  kubectl exec -it deployment/test-pod -- \
    curl -f http://$service:8080/health || echo "❌ $service unhealthy"
done

# Resource usage
echo "🔍 Resource Usage:"
kubectl top nodes
kubectl top pods --all-namespaces | head -20

# Recent events
echo "🔍 Recent Events:"
kubectl get events --all-namespaces --sort-by='.lastTimestamp' | tail -20
```

### 🔧 Service-Specific Diagnostics

#### Billing Service Diagnostics
```bash
# Check billing service health
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  curl http://localhost:8080/health

# Check Stripe connectivity
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  node -e "
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    stripe.accounts.retrieve().then(console.log).catch(console.error);
  "

# Check database queries
kubectl exec -it postgres-0 -- psql -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  WHERE query LIKE '%billing%' 
  ORDER BY mean_time DESC 
  LIMIT 10;
"

# Check recent billing events
kubectl logs deployment/billing-service -n neurallog-system --tail=100 | \
  grep -E "(ERROR|WARN|billing)"
```

#### Log Ingestion Diagnostics
```bash
# Check ingestion rate
kubectl exec -it deployment/log-server -n tenant-<tenant-id> -- \
  curl http://localhost:8080/metrics | grep ingestion_rate

# Check queue depth
kubectl exec -it redis-0 -- redis-cli llen log_queue

# Check processing errors
kubectl logs deployment/log-server -n tenant-<tenant-id> --tail=100 | \
  grep -E "(ERROR|failed|timeout)"

# Test log ingestion
curl -X POST http://api.neurallog.com/logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"test log","source":"troubleshooting"}'
```

---

## ⚡ Performance Issues

### 🐌 Slow API Response Times

#### Diagnosis Steps
```bash
# 1. Check current response times
kubectl exec -it deployment/prometheus -n neurallog-monitoring -- \
  promtool query instant 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))'

# 2. Identify slow endpoints
kubectl logs deployment/api-gateway -n neurallog-system --tail=1000 | \
  awk '{print $7, $10}' | sort -k2 -nr | head -20

# 3. Check database performance
kubectl exec -it postgres-0 -- psql -c "
  SELECT query, mean_time, calls, total_time
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;
"

# 4. Check resource utilization
kubectl top pods -n neurallog-system --sort-by=cpu
kubectl top pods -n neurallog-system --sort-by=memory
```

#### Resolution Actions
```bash
# Scale up slow services
kubectl scale deployment/api-gateway --replicas=5 -n neurallog-system

# Increase resource limits
kubectl patch deployment api-gateway -n neurallog-system -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "api-gateway",
          "resources": {
            "limits": {"cpu": "2", "memory": "4Gi"},
            "requests": {"cpu": "1", "memory": "2Gi"}
          }
        }]
      }
    }
  }
}'

# Clear Redis cache if needed
kubectl exec -it redis-0 -- redis-cli flushdb

# Restart services with memory leaks
kubectl rollout restart deployment/api-gateway -n neurallog-system
```

### 📈 High Resource Usage

#### CPU Issues
```bash
# Identify CPU-intensive pods
kubectl top pods --all-namespaces --sort-by=cpu | head -20

# Check CPU throttling
kubectl exec -it <pod-name> -- cat /sys/fs/cgroup/cpu/cpu.stat | grep throttled

# Profile CPU usage
kubectl exec -it <pod-name> -- top -p $(pgrep node)

# Resolution: Increase CPU limits
kubectl patch deployment <deployment-name> -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "<container-name>",
          "resources": {
            "limits": {"cpu": "4"},
            "requests": {"cpu": "2"}
          }
        }]
      }
    }
  }
}'
```

#### Memory Issues
```bash
# Check memory usage
kubectl top pods --all-namespaces --sort-by=memory | head -20

# Check for memory leaks
kubectl exec -it <pod-name> -- ps aux --sort=-%mem | head -10

# Check OOM kills
kubectl get events --all-namespaces | grep OOMKilled

# Monitor memory over time
kubectl exec -it <pod-name> -- \
  while true; do free -h; sleep 10; done
```

---

## 🔌 Connectivity Problems

### 🌐 Network Connectivity Issues

#### Service-to-Service Communication
```bash
# Test internal service connectivity
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  curl -v http://auth-service:8080/health

# Check DNS resolution
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  nslookup auth-service.neurallog-system.svc.cluster.local

# Test external connectivity
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  curl -v https://api.stripe.com/v1/accounts

# Check network policies
kubectl get networkpolicy --all-namespaces
kubectl describe networkpolicy <policy-name> -n <namespace>
```

#### Load Balancer Issues
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs deployment/ingress-nginx-controller -n ingress-nginx

# Check ingress resources
kubectl get ingress --all-namespaces
kubectl describe ingress <ingress-name> -n <namespace>

# Test external access
curl -v https://api.neurallog.com/health
```

### 🔒 TLS/SSL Issues

#### Certificate Problems
```bash
# Check certificate expiry
kubectl get certificates --all-namespaces
kubectl describe certificate <cert-name> -n <namespace>

# Check cert-manager logs
kubectl logs deployment/cert-manager -n cert-manager

# Manually verify certificate
openssl s_client -connect api.neurallog.com:443 -servername api.neurallog.com

# Force certificate renewal
kubectl delete certificate <cert-name> -n <namespace>
```

---

## 💾 Database Issues

### 🐘 PostgreSQL Problems

#### Connection Issues
```bash
# Check connection count
kubectl exec -it postgres-0 -- psql -c "
  SELECT count(*) as connections, state 
  FROM pg_stat_activity 
  GROUP BY state;
"

# Check max connections
kubectl exec -it postgres-0 -- psql -c "SHOW max_connections;"

# Kill long-running queries
kubectl exec -it postgres-0 -- psql -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE state = 'active' 
  AND now() - query_start > interval '10 minutes';
"

# Check connection pool status
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  node -e "console.log(require('./src/database').pool.totalCount)"
```

#### Performance Issues
```bash
# Check slow queries
kubectl exec -it postgres-0 -- psql -c "
  SELECT query, mean_time, calls, total_time
  FROM pg_stat_statements 
  WHERE mean_time > 1000 
  ORDER BY mean_time DESC 
  LIMIT 10;
"

# Check table sizes
kubectl exec -it postgres-0 -- psql -c "
  SELECT schemaname, tablename, 
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables 
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
  LIMIT 10;
"

# Check index usage
kubectl exec -it postgres-0 -- psql -c "
  SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
  FROM pg_stat_user_indexes 
  WHERE idx_scan = 0;
"

# Vacuum and analyze
kubectl exec -it postgres-0 -- psql -c "VACUUM ANALYZE;"
```

### 🔴 Redis Issues

#### Memory Problems
```bash
# Check Redis memory usage
kubectl exec -it redis-0 -- redis-cli info memory

# Check key distribution
kubectl exec -it redis-0 -- redis-cli --bigkeys

# Check slow queries
kubectl exec -it redis-0 -- redis-cli slowlog get 10

# Clear cache if needed
kubectl exec -it redis-0 -- redis-cli flushdb
```

---

## ☸️ Kubernetes Problems

### 🔄 Pod Issues

#### Pod Startup Problems
```bash
# Check pod status
kubectl get pods -n <namespace> -o wide

# Describe problematic pod
kubectl describe pod <pod-name> -n <namespace>

# Check pod logs
kubectl logs <pod-name> -n <namespace> --previous

# Check events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Check resource constraints
kubectl describe nodes | grep -A 5 "Allocated resources"
```

#### Pod Crashes
```bash
# Check restart count
kubectl get pods -n <namespace> -o custom-columns=\
NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount

# Check exit codes
kubectl get pods -n <namespace> -o jsonpath=\
'{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].lastState.terminated.exitCode}{"\n"}{end}'

# Check OOM kills
kubectl get events --all-namespaces | grep OOMKilled

# Increase memory limits
kubectl patch deployment <deployment-name> -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "<container-name>",
          "resources": {
            "limits": {"memory": "2Gi"}
          }
        }]
      }
    }
  }
}'
```

### 🔧 Deployment Issues

#### Rolling Update Problems
```bash
# Check rollout status
kubectl rollout status deployment/<deployment-name> -n <namespace>

# Check rollout history
kubectl rollout history deployment/<deployment-name> -n <namespace>

# Rollback if needed
kubectl rollout undo deployment/<deployment-name> -n <namespace>

# Check replica sets
kubectl get rs -n <namespace> -o wide

# Force restart
kubectl rollout restart deployment/<deployment-name> -n <namespace>
```

---

## 🏢 Multi-Tenant Issues

### 🏗️ Tenant Provisioning Problems

#### Tenant Creation Stuck
```bash
# Check tenant status
kubectl get tenant <tenant-id> -o yaml

# Check operator logs
kubectl logs deployment/neurallog-operator-controller-manager \
  -n neurallog-operator-system | grep "tenant=<tenant-id>"

# Check namespace creation
kubectl get namespace tenant-<tenant-id>

# Check resource quota
kubectl get resourcequota -n tenant-<tenant-id>

# Force reconciliation
kubectl annotate tenant <tenant-id> neurallog.io/force-reconcile="$(date)"
```

#### Resource Quota Issues
```bash
# Check quota usage
kubectl describe resourcequota -n tenant-<tenant-id>

# Check pod resource requests
kubectl get pods -n tenant-<tenant-id> -o custom-columns=\
NAME:.metadata.name,\
CPU-REQ:.spec.containers[*].resources.requests.cpu,\
MEM-REQ:.spec.containers[*].resources.requests.memory

# Increase quota if needed
kubectl patch tenant <tenant-id> --type='merge' -p='{
  "spec": {
    "resources": {
      "cpu": {"requests": "8", "limits": "16"},
      "memory": {"requests": "16Gi", "limits": "32Gi"}
    }
  }
}'
```

### 🔒 Tenant Isolation Issues

#### Network Policy Problems
```bash
# Check network policies
kubectl get networkpolicy -n tenant-<tenant-id>

# Test connectivity between tenants (should fail)
kubectl exec -it <pod-in-tenant-a> -- \
  curl http://<service-in-tenant-b>.tenant-<tenant-b>:8080

# Check policy rules
kubectl describe networkpolicy tenant-isolation -n tenant-<tenant-id>

# Verify DNS isolation
kubectl exec -it <pod-in-tenant> -- \
  nslookup <service-in-other-tenant>.tenant-<other-tenant>
```

---

## 💰 Billing Problems

### 💳 Stripe Integration Issues

#### Payment Failures
```bash
# Check Stripe connectivity
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  node -e "
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    stripe.charges.list({limit: 5}).then(console.log).catch(console.error);
  "

# Check webhook delivery
kubectl logs deployment/billing-service -n neurallog-system | \
  grep -E "(webhook|stripe)"

# Verify webhook endpoint
curl -X POST https://api.neurallog.com/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

# Check failed payments
kubectl exec -it postgres-0 -- psql -c "
  SELECT * FROM payments 
  WHERE status = 'failed' 
  ORDER BY created_at DESC 
  LIMIT 10;
"
```

### 📊 Usage Tracking Issues

#### Missing Usage Data
```bash
# Check usage collection
kubectl logs deployment/billing-service -n neurallog-system | \
  grep "usage"

# Verify Redis usage data
kubectl exec -it redis-0 -- redis-cli keys "usage:*"

# Check database usage records
kubectl exec -it postgres-0 -- psql -c "
  SELECT tenant_id, metric_type, value, recorded_at 
  FROM usage_records 
  WHERE recorded_at > NOW() - INTERVAL '1 hour' 
  ORDER BY recorded_at DESC;
"

# Force usage calculation
kubectl exec -it deployment/billing-service -n neurallog-system -- \
  npm run calculate-usage -- --tenant=<tenant-id>
```

---

## 🔒 Security Issues

### 🔐 Authentication Problems

#### JWT Token Issues
```bash
# Verify JWT token
kubectl exec -it deployment/auth-service -n neurallog-system -- \
  node -e "
    const jwt = require('jsonwebtoken');
    const token = '$TOKEN';
    try {
      console.log(jwt.decode(token, {complete: true}));
    } catch(e) {
      console.error('Invalid token:', e.message);
    }
  "

# Check token expiry
kubectl exec -it deployment/auth-service -n neurallog-system -- \
  node -e "
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode('$TOKEN');
    console.log('Expires:', new Date(decoded.exp * 1000));
  "

# Check auth service logs
kubectl logs deployment/auth-service -n neurallog-system | \
  grep -E "(auth|token|login)"
```

### 🛡️ RBAC Issues

#### Permission Denied Errors
```bash
# Check user permissions
kubectl auth can-i get pods --as=system:serviceaccount:tenant-<tenant-id>:default

# Check role bindings
kubectl get rolebinding -n tenant-<tenant-id>

# Describe role
kubectl describe role tenant-role -n tenant-<tenant-id>

# Check cluster role bindings
kubectl get clusterrolebinding | grep <tenant-id>
```

---

## 📊 Monitoring Problems

### 📈 Missing Metrics

#### Prometheus Issues
```bash
# Check Prometheus targets
curl http://prometheus:9090/api/v1/targets | jq '.data.activeTargets[] | select(.health != "up")'

# Check service discovery
kubectl get servicemonitor -n neurallog-system

# Verify metrics endpoint
kubectl exec -it <pod-name> -- curl http://localhost:8080/metrics

# Check Prometheus config
kubectl get configmap prometheus-config -n neurallog-monitoring -o yaml
```

### 📊 Dashboard Issues

#### Grafana Problems
```bash
# Check Grafana logs
kubectl logs deployment/grafana -n neurallog-monitoring

# Test data source
curl -H "Authorization: Bearer $GRAFANA_TOKEN" \
  http://grafana:3000/api/datasources/proxy/1/api/v1/query?query=up

# Check dashboard JSON
kubectl get configmap grafana-dashboards -n neurallog-monitoring -o yaml
```

---

## 🔧 General Troubleshooting Tips

### 📋 Systematic Approach

1. **Identify the Problem**: What exactly is failing?
2. **Gather Information**: Collect logs, metrics, and system state
3. **Form Hypothesis**: What could be causing the issue?
4. **Test Hypothesis**: Make targeted changes to verify
5. **Implement Solution**: Apply the fix
6. **Verify Resolution**: Confirm the issue is resolved
7. **Document**: Record the issue and solution

### 🛠️ Useful Commands

```bash
# Quick cluster overview
kubectl get all --all-namespaces | grep -v Running

# Resource usage summary
kubectl top nodes && kubectl top pods --all-namespaces | head -20

# Recent events across all namespaces
kubectl get events --all-namespaces --sort-by='.lastTimestamp' | tail -20

# Check all persistent volumes
kubectl get pv -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,CLAIM:.spec.claimRef.name

# Network connectivity test
kubectl run test-pod --image=busybox --rm -it -- /bin/sh
```

---

This troubleshooting guide provides systematic approaches to diagnosing and resolving issues in the NeuralLog platform. For additional support, refer to the [Operations Manual](OPERATIONS.md) and [Monitoring Guide](MONITORING.md).
