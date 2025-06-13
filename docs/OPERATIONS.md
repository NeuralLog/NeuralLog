# 🔧 NeuralLog Operations Manual

Comprehensive guide for operating and maintaining the NeuralLog platform in production environments.

## 📋 Table of Contents

- [🚀 Daily Operations](#-daily-operations)
- [📊 Monitoring & Alerting](#-monitoring--alerting)
- [🔧 Maintenance Procedures](#-maintenance-procedures)
- [🚨 Incident Response](#-incident-response)
- [📈 Capacity Planning](#-capacity-planning)
- [🔄 Backup & Recovery](#-backup--recovery)
- [🔒 Security Operations](#-security-operations)
- [📊 Performance Optimization](#-performance-optimization)
- [🛠️ Troubleshooting](#-troubleshooting)
- [📋 Runbooks](#-runbooks)

---

## 🚀 Daily Operations

### 🌅 Morning Checklist

#### System Health Verification
```bash
# Check overall system status
kubectl get nodes
kubectl get pods --all-namespaces | grep -v Running

# Verify core services
./scripts/test-deployment.sh

# Check monitoring stack
curl -s http://prometheus:9090/-/healthy
curl -s http://grafana:3000/api/health
```

#### Key Metrics Review
- **Service Availability**: Target >99.9%
- **Response Times**: API p95 <100ms
- **Error Rates**: <0.1% for critical endpoints
- **Resource Utilization**: CPU <70%, Memory <80%
- **Storage Usage**: <85% capacity

#### Tenant Health Check
```bash
# Check tenant status
kubectl get tenants

# Verify tenant resources
for tenant in $(kubectl get tenants -o name); do
  echo "Checking $tenant..."
  kubectl describe $tenant
done

# Check resource quotas
kubectl get resourcequota --all-namespaces
```

### 🌆 Evening Checklist

#### Backup Verification
```bash
# Verify daily backups completed
./scripts/verify-backups.sh

# Check backup integrity
./scripts/test-backup-restore.sh --dry-run
```

#### Usage Analytics
```bash
# Generate daily usage report
./scripts/generate-usage-report.sh --date=$(date -d yesterday +%Y-%m-%d)

# Check billing calculations
./scripts/verify-billing-calculations.sh
```

#### Security Review
```bash
# Check security alerts
kubectl get events --all-namespaces | grep -i security

# Verify certificate expiry
./scripts/check-certificate-expiry.sh

# Review access logs
./scripts/analyze-access-logs.sh --suspicious
```

---

## 📊 Monitoring & Alerting

### 🎯 Key Performance Indicators (KPIs)

#### Service Level Objectives (SLOs)

| Metric | SLO | Measurement |
|--------|-----|-------------|
| **API Availability** | 99.9% | HTTP 200 responses / total requests |
| **Log Ingestion Latency** | p95 < 100ms | Time from API call to storage |
| **Query Response Time** | p95 < 200ms | Search API response time |
| **Data Durability** | 99.999999999% | No data loss events |

#### Business Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| **Monthly Recurring Revenue (MRR)** | Growth >10% | Monthly |
| **Customer Churn Rate** | <5% | Monthly |
| **Average Revenue Per User (ARPU)** | >$150 | Monthly |
| **Support Ticket Volume** | <50/month | Weekly |

### 🚨 Critical Alerts

#### Immediate Response (P0)
```yaml
# Service Down Alert
- alert: ServiceDown
  expr: up{job=~"neurallog-.*"} == 0
  for: 1m
  labels:
    severity: critical
    page: true
  annotations:
    summary: "NeuralLog service {{ $labels.job }} is down"
    runbook: "https://docs.neurallog.com/runbooks/service-down"

# High Error Rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 2m
  labels:
    severity: critical
    page: true
  annotations:
    summary: "High error rate detected: {{ $value }} errors/sec"
```

#### Warning Alerts (P1)
```yaml
# High Resource Usage
- alert: HighCPUUsage
  expr: cpu_usage_percent > 80
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "High CPU usage: {{ $value }}%"

# Storage Space Low
- alert: LowDiskSpace
  expr: disk_usage_percent > 85
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Low disk space: {{ $value }}% used"
```

### 📊 Monitoring Dashboards

#### System Overview Dashboard
- **Service Health**: All service status indicators
- **Request Volume**: Requests per second by service
- **Response Times**: p50, p95, p99 latencies
- **Error Rates**: Error percentage by service
- **Resource Usage**: CPU, memory, disk, network

#### Tenant Dashboard
- **Active Tenants**: Number of active tenants
- **Usage by Plan**: Resource usage by subscription plan
- **Top Consumers**: Highest usage tenants
- **Quota Utilization**: Resource quota usage
- **Billing Metrics**: Revenue and usage trends

#### Infrastructure Dashboard
- **Kubernetes Cluster**: Node status, pod health
- **Database Performance**: Query times, connections
- **Cache Performance**: Redis hit rates, memory usage
- **Network Traffic**: Ingress/egress bandwidth
- **Storage Performance**: IOPS, throughput

---

## 🔧 Maintenance Procedures

### 🔄 Regular Maintenance Schedule

#### Daily
- [ ] System health checks
- [ ] Backup verification
- [ ] Security log review
- [ ] Performance metrics review

#### Weekly
- [ ] Certificate expiry check
- [ ] Database maintenance
- [ ] Log rotation and cleanup
- [ ] Capacity planning review

#### Monthly
- [ ] Security patches
- [ ] Dependency updates
- [ ] Disaster recovery testing
- [ ] Performance optimization

#### Quarterly
- [ ] Full system audit
- [ ] Capacity expansion planning
- [ ] Security assessment
- [ ] Business continuity testing

### 🔄 Rolling Updates

#### Service Updates
```bash
# Update billing service
kubectl set image deployment/billing-service \
  billing-service=neurallog/billing:v1.2.0 \
  -n neurallog-system

# Monitor rollout
kubectl rollout status deployment/billing-service -n neurallog-system

# Verify health
./scripts/test-service-health.sh billing-service
```

#### Database Migrations
```bash
# Backup database before migration
./scripts/backup-database.sh --full

# Run migration
kubectl exec -it deployment/billing-service -- npm run migrate

# Verify migration
kubectl exec -it deployment/billing-service -- npm run migrate:status
```

#### Kubernetes Operator Updates
```bash
# Update operator
make -C infra/operators/neurallog-operator deploy IMG=neurallog/operator:v1.1.0

# Verify CRDs
kubectl get crd tenants.neurallog.io -o yaml

# Test tenant operations
kubectl apply -f examples/tenant-test.yaml
kubectl delete -f examples/tenant-test.yaml
```

---

## 🚨 Incident Response

### 🚨 Incident Classification

#### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0 - Critical** | Service completely down | 15 minutes | API unavailable, data loss |
| **P1 - High** | Major functionality impacted | 1 hour | High error rates, slow responses |
| **P2 - Medium** | Minor functionality impacted | 4 hours | Non-critical features down |
| **P3 - Low** | Cosmetic or minor issues | 24 hours | UI glitches, documentation |

### 📞 Escalation Procedures

#### On-Call Rotation
```yaml
Primary: SRE Team Lead
Secondary: Platform Engineer
Escalation: Engineering Manager
Final: CTO
```

#### Communication Channels
- **Slack**: #incidents (immediate notification)
- **PagerDuty**: Automated alerting
- **Status Page**: Customer communication
- **Email**: Stakeholder updates

### 🔍 Incident Response Process

#### 1. Detection & Triage (0-15 minutes)
```bash
# Acknowledge alert
pagerduty ack <incident-id>

# Initial assessment
./scripts/incident-triage.sh

# Create incident channel
slack create-channel incident-$(date +%Y%m%d-%H%M)
```

#### 2. Investigation & Diagnosis (15-60 minutes)
```bash
# Gather system information
./scripts/collect-diagnostics.sh > incident-diagnostics.txt

# Check recent changes
git log --since="2 hours ago" --oneline
kubectl get events --sort-by='.lastTimestamp' | tail -20

# Analyze logs
kubectl logs -f deployment/affected-service --tail=100
```

#### 3. Mitigation & Resolution
```bash
# Apply immediate fix
kubectl rollout undo deployment/affected-service

# Scale resources if needed
kubectl scale deployment/affected-service --replicas=10

# Verify resolution
./scripts/test-service-health.sh affected-service
```

#### 4. Communication & Documentation
```bash
# Update status page
./scripts/update-status-page.sh "Investigating service degradation"

# Post incident report
./scripts/generate-incident-report.sh <incident-id>
```

---

## 📈 Capacity Planning

### 📊 Growth Projections

#### Current Metrics (Monthly)
- **Tenants**: 1,250 active tenants
- **Log Volume**: 50B logs/month
- **Storage**: 2.5TB/month growth
- **API Requests**: 100M requests/month

#### 6-Month Projections
- **Tenants**: 2,500 (+100% growth)
- **Log Volume**: 150B logs/month (+200% growth)
- **Storage**: 15TB total (+500% growth)
- **API Requests**: 300M requests/month (+200% growth)

### 🔧 Scaling Strategies

#### Horizontal Scaling
```yaml
# Auto-scaling configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: log-ingestion-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: log-ingestion
  minReplicas: 5
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
```

#### Vertical Scaling
```bash
# Increase resource limits
kubectl patch deployment log-ingestion -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "log-ingestion",
          "resources": {
            "requests": {"cpu": "2", "memory": "4Gi"},
            "limits": {"cpu": "4", "memory": "8Gi"}
          }
        }]
      }
    }
  }
}'
```

#### Database Scaling
```bash
# Scale PostgreSQL cluster
kubectl patch postgresql postgres-cluster -p '{
  "spec": {
    "instances": 5,
    "postgresql": {
      "parameters": {
        "max_connections": "500",
        "shared_buffers": "2GB"
      }
    }
  }
}'

# Scale ClickHouse cluster
kubectl patch clickhouseinstallation clickhouse-cluster -p '{
  "spec": {
    "configuration": {
      "clusters": [{
        "name": "main",
        "layout": {
          "shardsCount": 4,
          "replicasCount": 2
        }
      }]
    }
  }
}'
```

---

## 🔄 Backup & Recovery

### 💾 Backup Strategy

#### Backup Types
- **Full Backup**: Complete system backup (weekly)
- **Incremental Backup**: Changed data only (daily)
- **Transaction Log Backup**: Continuous (every 15 minutes)
- **Configuration Backup**: Kubernetes configs (daily)

#### Backup Schedule
```bash
# Full backup (Sundays at 2 AM UTC)
0 2 * * 0 /opt/neurallog/scripts/full-backup.sh

# Incremental backup (Daily at 2 AM UTC)
0 2 * * 1-6 /opt/neurallog/scripts/incremental-backup.sh

# Transaction log backup (Every 15 minutes)
*/15 * * * * /opt/neurallog/scripts/transaction-log-backup.sh

# Configuration backup (Daily at 1 AM UTC)
0 1 * * * /opt/neurallog/scripts/config-backup.sh
```

### 🔄 Recovery Procedures

#### Database Recovery
```bash
# Point-in-time recovery
./scripts/restore-database.sh \
  --backup-file=backup-2024-01-15.sql.gz \
  --point-in-time="2024-01-15 14:30:00"

# Verify recovery
./scripts/verify-database-integrity.sh
```

#### Kubernetes Recovery
```bash
# Restore cluster configuration
kubectl apply -f backups/k8s-config-2024-01-15/

# Restore persistent volumes
./scripts/restore-persistent-volumes.sh \
  --backup-date=2024-01-15

# Verify cluster health
kubectl get all --all-namespaces
```

#### Disaster Recovery
```bash
# Full system recovery
./scripts/disaster-recovery.sh \
  --backup-location=s3://neurallog-backups/2024-01-15 \
  --target-cluster=disaster-recovery

# Verify system functionality
./scripts/end-to-end-test.sh
```

---

## 🔒 Security Operations

### 🛡️ Security Monitoring

#### Security Metrics
- **Failed Login Attempts**: <100/hour
- **Suspicious API Activity**: <10 events/hour
- **Certificate Expiry**: >30 days remaining
- **Vulnerability Scan Results**: 0 critical, <5 high

#### Security Alerts
```yaml
# Suspicious Login Activity
- alert: SuspiciousLoginActivity
  expr: rate(auth_failed_attempts[5m]) > 10
  for: 2m
  labels:
    severity: warning
    team: security
  annotations:
    summary: "High rate of failed login attempts"

# Certificate Expiry
- alert: CertificateExpiry
  expr: cert_expiry_days < 30
  for: 1h
  labels:
    severity: warning
    team: security
  annotations:
    summary: "Certificate expires in {{ $value }} days"
```

### 🔐 Security Procedures

#### Daily Security Tasks
```bash
# Check for security updates
./scripts/check-security-updates.sh

# Review access logs
./scripts/analyze-access-logs.sh --security

# Verify certificate status
./scripts/check-certificates.sh

# Scan for vulnerabilities
./scripts/vulnerability-scan.sh
```

#### Weekly Security Tasks
```bash
# Update security patches
./scripts/apply-security-patches.sh

# Review user access
./scripts/audit-user-access.sh

# Check for exposed secrets
./scripts/scan-for-secrets.sh

# Verify backup encryption
./scripts/verify-backup-encryption.sh
```

---

## 📊 Performance Optimization

### ⚡ Performance Tuning

#### Database Optimization
```sql
-- Optimize frequently used queries
CREATE INDEX CONCURRENTLY idx_logs_timestamp_level 
ON logs (timestamp DESC, level) 
WHERE timestamp > NOW() - INTERVAL '30 days';

-- Update table statistics
ANALYZE logs;

-- Vacuum and reindex
VACUUM ANALYZE logs;
REINDEX INDEX CONCURRENTLY idx_logs_timestamp_level;
```

#### Cache Optimization
```bash
# Redis memory optimization
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET maxmemory 8gb

# Monitor cache hit rates
redis-cli INFO stats | grep keyspace_hits
```

#### Application Optimization
```bash
# Tune JVM settings for Java services
export JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Node.js optimization
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 📈 Performance Monitoring

#### Key Performance Metrics
```bash
# API response times
curl -w "@curl-format.txt" -s -o /dev/null https://api.neurallog.com/health

# Database performance
kubectl exec -it postgres-0 -- psql -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"

# Cache performance
redis-cli --latency-history -i 1
```

---

## 🛠️ Troubleshooting

### 🔍 Common Issues

#### High Memory Usage
```bash
# Identify memory-consuming pods
kubectl top pods --all-namespaces --sort-by=memory

# Check for memory leaks
kubectl exec -it <pod-name> -- ps aux --sort=-%mem | head -10

# Restart high-memory pods
kubectl rollout restart deployment/<deployment-name>
```

#### Database Connection Issues
```bash
# Check connection pool status
kubectl exec -it postgres-0 -- psql -c "
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state;"

# Verify database connectivity
kubectl exec -it billing-service-0 -- npm run db:test

# Check for long-running queries
kubectl exec -it postgres-0 -- psql -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"
```

#### Network Connectivity Issues
```bash
# Test service-to-service connectivity
kubectl exec -it billing-service-0 -- curl -v http://auth-service:8080/health

# Check network policies
kubectl get networkpolicy --all-namespaces

# Verify DNS resolution
kubectl exec -it billing-service-0 -- nslookup auth-service
```

---

## 📋 Runbooks

### 🚨 Service Down Runbook

#### 1. Initial Response
```bash
# Check service status
kubectl get pods -l app=<service-name>
kubectl describe pod <pod-name>

# Check recent events
kubectl get events --sort-by='.lastTimestamp' | grep <service-name>
```

#### 2. Quick Fixes
```bash
# Restart service
kubectl rollout restart deployment/<service-name>

# Scale up replicas
kubectl scale deployment/<service-name> --replicas=5

# Check resource limits
kubectl describe deployment/<service-name> | grep -A 5 Limits
```

#### 3. Deep Investigation
```bash
# Check logs
kubectl logs -f deployment/<service-name> --tail=100

# Check resource usage
kubectl top pods -l app=<service-name>

# Check dependencies
./scripts/check-service-dependencies.sh <service-name>
```

### 💾 Database Issues Runbook

#### 1. Connection Issues
```bash
# Check connection count
kubectl exec -it postgres-0 -- psql -c "SELECT count(*) FROM pg_stat_activity;"

# Kill long-running queries
kubectl exec -it postgres-0 -- psql -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND now() - query_start > interval '10 minutes';"
```

#### 2. Performance Issues
```bash
# Check slow queries
kubectl exec -it postgres-0 -- psql -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;"

# Update statistics
kubectl exec -it postgres-0 -- psql -c "ANALYZE;"
```

---

This operations manual provides comprehensive guidance for maintaining the NeuralLog platform. For additional procedures and troubleshooting guides, refer to the specific service documentation and monitoring dashboards.
