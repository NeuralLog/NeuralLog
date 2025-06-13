# NeuralLog Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying NeuralLog in various environments, from local development to enterprise production deployments. NeuralLog is designed to be cloud-native and supports multiple deployment strategies.

## 🏗️ Architecture Options

### 1. Single-Node Deployment
- **Use Case**: Development, testing, small teams
- **Components**: All services on one machine
- **Database**: SQLite or single PostgreSQL instance
- **Scaling**: Vertical scaling only

### 2. Multi-Node Deployment
- **Use Case**: Production, medium to large teams
- **Components**: Distributed across multiple nodes
- **Database**: PostgreSQL cluster with read replicas
- **Scaling**: Horizontal and vertical scaling

### 3. Kubernetes Deployment
- **Use Case**: Enterprise, high availability, auto-scaling
- **Components**: Containerized microservices
- **Database**: Managed database services
- **Scaling**: Auto-scaling based on metrics

### 4. Cloud-Native Deployment
- **Use Case**: Fully managed, serverless components
- **Components**: Cloud services (Lambda, Cloud Run, etc.)
- **Database**: Managed database services
- **Scaling**: Serverless auto-scaling

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Web Application
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://neurallog:password@postgres:5432/neurallog
      - REDIS_URL=redis://redis:6379
      - AUTH_SERVICE_URL=http://auth:3040
    depends_on:
      - postgres
      - redis
      - auth

  # Authentication Service
  auth:
    build: ./apps/auth
    ports:
      - "3040:3040"
    environment:
      - DATABASE_URL=postgresql://neurallog:password@postgres:5432/neurallog_auth
      - REDIS_URL=redis://redis:6379
      - AUTH0_DOMAIN=your-auth0-domain
      - AUTH0_CLIENT_ID=your-auth0-client-id
      - AUTH0_CLIENT_SECRET=your-auth0-client-secret
    depends_on:
      - postgres
      - redis

  # Log Server
  log-server:
    build: ./apps/log-server
    ports:
      - "3030:3030"
    environment:
      - DATABASE_URL=postgresql://neurallog:password@postgres:5432/neurallog_logs
      - REDIS_URL=redis://redis:6379
      - AUTH_SERVICE_URL=http://auth:3040
    depends_on:
      - postgres
      - redis
      - auth

  # MCP Client
  mcp-client:
    build: ./packages/mcp-client
    environment:
      - WEB_SERVER_URL=http://log-server:3030
      - AUTH_SERVICE_URL=http://auth:3040
      - AUTH_CLIENT_ID=your-mcp-client-id
      - AUTH_CLIENT_SECRET=your-mcp-client-secret
      - TENANT_ID=default
    depends_on:
      - log-server
      - auth

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=neurallog
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=neurallog
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Configuration

```bash
# .env
# Database
DATABASE_URL=postgresql://neurallog:password@localhost:5432/neurallog
REDIS_URL=redis://localhost:6379

# Authentication
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=https://api.neurallog.com

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_ALGORITHM=AES-256-GCM

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
```

### Production Docker Configuration

```dockerfile
# Production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

# Security: Create non-root user
RUN addgroup -g 1001 -S neurallog && \
    adduser -S neurallog -u 1001 -G neurallog

WORKDIR /app

# Copy built application
COPY --from=builder --chown=neurallog:neurallog /app/dist ./dist
COPY --from=builder --chown=neurallog:neurallog /app/node_modules ./node_modules
COPY --from=builder --chown=neurallog:neurallog /app/package.json ./

# Security: Switch to non-root user
USER neurallog

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

## ☸️ Kubernetes Deployment

### Namespace and RBAC

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: neurallog
  labels:
    name: neurallog

---
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: neurallog
  namespace: neurallog

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: neurallog
  name: neurallog-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: neurallog-rolebinding
  namespace: neurallog
subjects:
- kind: ServiceAccount
  name: neurallog
  namespace: neurallog
roleRef:
  kind: Role
  name: neurallog-role
  apiGroup: rbac.authorization.k8s.io
```

### ConfigMaps and Secrets

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: neurallog-config
  namespace: neurallog
data:
  LOG_LEVEL: "info"
  METRICS_ENABLED: "true"
  HEALTH_CHECK_ENABLED: "true"
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "neurallog"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"

---
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: neurallog-secrets
  namespace: neurallog
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
  SESSION_SECRET: <base64-encoded-session-secret>
  ENCRYPTION_KEY: <base64-encoded-encryption-key>
  AUTH0_CLIENT_SECRET: <base64-encoded-auth0-secret>
```

### Application Deployments

```yaml
# web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: neurallog-web
  namespace: neurallog
spec:
  replicas: 3
  selector:
    matchLabels:
      app: neurallog-web
  template:
    metadata:
      labels:
        app: neurallog-web
    spec:
      serviceAccountName: neurallog
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: web
        image: neurallog/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          value: "postgresql://neurallog:$(DATABASE_PASSWORD)@$(DATABASE_HOST):$(DATABASE_PORT)/$(DATABASE_NAME)"
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: neurallog-secrets
              key: DATABASE_PASSWORD
        envFrom:
        - configMapRef:
            name: neurallog-config
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# web-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: neurallog-web-service
  namespace: neurallog
spec:
  selector:
    app: neurallog-web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: neurallog-ingress
  namespace: neurallog
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - neurallog.yourdomain.com
    - api.neurallog.yourdomain.com
    secretName: neurallog-tls
  rules:
  - host: neurallog.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: neurallog-web-service
            port:
              number: 80
  - host: api.neurallog.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: neurallog-api-service
            port:
              number: 80
```

### Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: neurallog-web-hpa
  namespace: neurallog
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: neurallog-web
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## ☁️ Cloud Provider Deployments

### AWS Deployment

#### EKS Cluster Setup
```bash
# Create EKS cluster
eksctl create cluster \
  --name neurallog-cluster \
  --version 1.28 \
  --region us-west-2 \
  --nodegroup-name neurallog-nodes \
  --node-type m5.large \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed

# Install AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=neurallog-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

#### RDS Database
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier neurallog-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username neurallog \
  --master-user-password your-secure-password \
  --allocated-storage 100 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name neurallog-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

#### ElastiCache Redis
```bash
# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id neurallog-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name neurallog-cache-subnet-group \
  --security-group-ids sg-xxxxxxxxx
```

### Google Cloud Platform

#### GKE Cluster Setup
```bash
# Create GKE cluster
gcloud container clusters create neurallog-cluster \
  --zone us-central1-a \
  --machine-type n1-standard-2 \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade

# Get credentials
gcloud container clusters get-credentials neurallog-cluster --zone us-central1-a
```

#### Cloud SQL
```bash
# Create Cloud SQL instance
gcloud sql instances create neurallog-db \
  --database-version POSTGRES_15 \
  --tier db-n1-standard-2 \
  --region us-central1 \
  --storage-type SSD \
  --storage-size 100GB \
  --backup-start-time 03:00 \
  --enable-bin-log \
  --maintenance-window-day SUN \
  --maintenance-window-hour 04
```

### Azure Deployment

#### AKS Cluster Setup
```bash
# Create resource group
az group create --name neurallog-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group neurallog-rg \
  --name neurallog-cluster \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --enable-cluster-autoscaler \
  --min-count 1 \
  --max-count 10

# Get credentials
az aks get-credentials --resource-group neurallog-rg --name neurallog-cluster
```

## 🔧 Configuration Management

### Helm Charts

```yaml
# Chart.yaml
apiVersion: v2
name: neurallog
description: A Helm chart for NeuralLog
type: application
version: 1.0.0
appVersion: "1.0.0"

dependencies:
- name: postgresql
  version: 12.x.x
  repository: https://charts.bitnami.com/bitnami
  condition: postgresql.enabled
- name: redis
  version: 17.x.x
  repository: https://charts.bitnami.com/bitnami
  condition: redis.enabled
```

```yaml
# values.yaml
replicaCount: 3

image:
  repository: neurallog/neurallog
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: neurallog.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: neurallog-tls
      hosts:
        - neurallog.example.com

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

postgresql:
  enabled: true
  auth:
    postgresPassword: "secure-password"
    database: "neurallog"

redis:
  enabled: true
  auth:
    enabled: false
```

### Terraform Infrastructure

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "neurallog-cluster"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    neurallog = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 1
      
      instance_types = ["m5.large"]
      
      k8s_labels = {
        Environment = var.environment
        Application = "neurallog"
      }
    }
  }
}

# RDS Database
resource "aws_db_instance" "neurallog" {
  identifier = "neurallog-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp2"
  storage_encrypted     = true
  
  db_name  = "neurallog"
  username = "neurallog"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.neurallog.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "neurallog-final-snapshot"
  
  tags = {
    Name        = "neurallog-db"
    Environment = var.environment
  }
}
```

## 📊 Monitoring and Observability

### Prometheus and Grafana

```yaml
# monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: neurallog
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'neurallog'
      static_configs:
      - targets: ['neurallog-web-service:80']
      metrics_path: /metrics
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: neurallog
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
        - '--web.console.libraries=/etc/prometheus/console_libraries'
        - '--web.console.templates=/etc/prometheus/consoles'
      volumes:
      - name: config
        configMap:
          name: prometheus-config
```

### Logging with ELK Stack

```yaml
# elasticsearch.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
  namespace: neurallog
spec:
  serviceName: elasticsearch
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
        env:
        - name: discovery.type
          value: zen
        - name: ES_JAVA_OPTS
          value: "-Xms512m -Xmx512m"
        ports:
        - containerPort: 9200
        - containerPort: 9300
        volumeMounts:
        - name: data
          mountPath: /usr/share/elasticsearch/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

## 🔒 Security Considerations

### Network Policies

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: neurallog-network-policy
  namespace: neurallog
spec:
  podSelector:
    matchLabels:
      app: neurallog-web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### Pod Security Standards

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: neurallog-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Secrets properly stored
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Monitoring configured
- [ ] Backup strategy defined

### Deployment
- [ ] Infrastructure provisioned
- [ ] Applications deployed
- [ ] Health checks passing
- [ ] Ingress configured
- [ ] DNS records updated
- [ ] SSL/TLS working

### Post-Deployment
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Backup verification
- [ ] Performance testing
- [ ] Security scanning
- [ ] Documentation updated

---

**🚀 Ready to deploy?** Choose your deployment method and follow the appropriate section above. For enterprise deployments, consider our [Professional Services](mailto:enterprise@neurallog.com).
