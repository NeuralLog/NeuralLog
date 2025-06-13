# 🔌 NeuralLog API Documentation

Complete REST API reference for the NeuralLog platform, including authentication, log management, analytics, billing, and administration endpoints.

## 📋 Table of Contents

- [🔐 Authentication](#-authentication)
- [📊 Log Management API](#-log-management-api)
- [🔍 Query & Search API](#-query--search-api)
- [📈 Analytics API](#-analytics-api)
- [💰 Billing API](#-billing-api)
- [🔧 Admin API](#-admin-api)
- [🤖 AI Integration API](#-ai-integration-api)
- [📡 Webhooks](#-webhooks)
- [🚨 Error Handling](#-error-handling)
- [📊 Rate Limiting](#-rate-limiting)

---

## 🔐 Authentication

### Base URL
```
Production: https://api.neurallog.com
Staging: https://staging-api.neurallog.com
```

### Authentication Methods

#### 1. JWT Bearer Token (Recommended)
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     https://api.neurallog.com/logs
```

#### 2. API Key
```bash
curl -H "X-API-Key: nl_live_1234567890abcdef" \
     https://api.neurallog.com/logs
```

### Login Endpoint

#### `POST /auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "tenantId": "acme-corp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_1234567890abcdef",
    "expiresIn": 3600,
    "user": {
      "id": "user_12345",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "tenantId": "acme-corp"
    }
  }
}
```

#### `POST /auth/refresh`
Refresh expired JWT token.

**Request:**
```json
{
  "refreshToken": "rt_1234567890abcdef"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

## 📊 Log Management API

### Log Ingestion

#### `POST /logs`
Ingest log entries (supports batch ingestion).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
X-Tenant-ID: acme-corp
```

**Request (Single Log):**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "source": "api-server",
  "metadata": {
    "userId": "user_12345",
    "requestId": "req_abc123",
    "environment": "production"
  },
  "tags": ["database", "error", "critical"]
}
```

**Request (Batch Logs):**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "level": "error",
      "message": "Database connection failed",
      "source": "api-server"
    },
    {
      "timestamp": "2024-01-15T10:30:01.000Z",
      "level": "info",
      "message": "Retrying database connection",
      "source": "api-server"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accepted": 2,
    "rejected": 0,
    "logIds": ["log_67890", "log_67891"],
    "processingTime": "15ms"
  }
}
```

#### `GET /logs/{logId}`
Retrieve a specific log entry.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "log_67890",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "level": "error",
    "message": "Database connection failed",
    "source": "api-server",
    "metadata": {
      "userId": "user_12345",
      "requestId": "req_abc123"
    },
    "tags": ["database", "error"],
    "createdAt": "2024-01-15T10:30:00.123Z"
  }
}
```

---

## 🔍 Query & Search API

### Search Logs

#### `GET /logs/search`
Search and filter log entries.

**Query Parameters:**
- `q` (string): Search query
- `level` (string): Log level filter (debug, info, warn, error, fatal)
- `source` (string): Source filter
- `from` (ISO 8601): Start timestamp
- `to` (ISO 8601): End timestamp
- `limit` (number): Results per page (max 1000, default 100)
- `offset` (number): Pagination offset
- `sort` (string): Sort field (timestamp, level, source)
- `order` (string): Sort order (asc, desc)

**Example Request:**
```bash
GET /logs/search?q=database&level=error&from=2024-01-15T00:00:00Z&to=2024-01-15T23:59:59Z&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_67890",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "level": "error",
        "message": "Database connection failed",
        "source": "api-server"
      }
    ],
    "pagination": {
      "total": 1250,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    },
    "queryTime": "45ms"
  }
}
```

### Advanced Search

#### `POST /logs/search/advanced`
Advanced search with complex filters and aggregations.

**Request:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "database" } },
        { "term": { "level": "error" } }
      ],
      "filter": [
        {
          "range": {
            "timestamp": {
              "gte": "2024-01-15T00:00:00Z",
              "lte": "2024-01-15T23:59:59Z"
            }
          }
        }
      ]
    }
  },
  "aggregations": {
    "levels": {
      "terms": { "field": "level" }
    },
    "sources": {
      "terms": { "field": "source" }
    },
    "timeline": {
      "date_histogram": {
        "field": "timestamp",
        "interval": "1h"
      }
    }
  },
  "sort": [
    { "timestamp": { "order": "desc" } }
  ],
  "size": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "aggregations": {
      "levels": {
        "buckets": [
          { "key": "error", "doc_count": 45 },
          { "key": "warn", "doc_count": 23 }
        ]
      },
      "sources": {
        "buckets": [
          { "key": "api-server", "doc_count": 30 },
          { "key": "worker", "doc_count": 15 }
        ]
      },
      "timeline": {
        "buckets": [
          {
            "key_as_string": "2024-01-15T10:00:00Z",
            "key": 1705316400000,
            "doc_count": 12
          }
        ]
      }
    },
    "total": 68,
    "queryTime": "125ms"
  }
}
```

---

## 📈 Analytics API

### Log Analytics

#### `GET /analytics/overview`
Get high-level analytics overview.

**Query Parameters:**
- `from` (ISO 8601): Start timestamp
- `to` (ISO 8601): End timestamp
- `granularity` (string): Time granularity (hour, day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalLogs": 1250000,
      "errorRate": 0.025,
      "avgLogsPerHour": 52083,
      "topSources": [
        { "source": "api-server", "count": 450000 },
        { "source": "worker", "count": 320000 }
      ]
    },
    "timeline": [
      {
        "timestamp": "2024-01-15T10:00:00Z",
        "total": 5200,
        "error": 130,
        "warn": 260,
        "info": 4810
      }
    ],
    "trends": {
      "logVolume": { "change": "+12.5%", "period": "7d" },
      "errorRate": { "change": "-2.1%", "period": "7d" }
    }
  }
}
```

#### `GET /analytics/anomalies`
Detect anomalies in log patterns.

**Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "anomaly_123",
        "type": "volume_spike",
        "severity": "high",
        "timestamp": "2024-01-15T14:30:00Z",
        "description": "Log volume increased by 300% in the last hour",
        "affectedSources": ["api-server"],
        "confidence": 0.95
      }
    ],
    "summary": {
      "total": 3,
      "high": 1,
      "medium": 2,
      "low": 0
    }
  }
}
```

### AI-Powered Insights

#### `POST /analytics/insights`
Generate AI-powered insights from log data.

**Request:**
```json
{
  "query": "What caused the spike in errors yesterday?",
  "timeRange": {
    "from": "2024-01-14T00:00:00Z",
    "to": "2024-01-14T23:59:59Z"
  },
  "context": {
    "includeMetrics": true,
    "includePatterns": true,
    "includeRecommendations": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insight": {
      "summary": "Error spike was caused by database connection timeouts during peak traffic",
      "confidence": 0.87,
      "evidence": [
        "45% increase in 'connection timeout' errors",
        "Correlation with traffic spike at 14:30 UTC",
        "Database CPU utilization reached 95%"
      ],
      "recommendations": [
        "Increase database connection pool size",
        "Implement connection retry logic",
        "Consider database scaling"
      ]
    },
    "relatedLogs": ["log_123", "log_124", "log_125"],
    "processingTime": "2.3s"
  }
}
```

---

## 💰 Billing API

### Usage Information

#### `GET /billing/usage/current`
Get current billing period usage.

**Response:**
```json
{
  "success": true,
  "data": {
    "billingPeriod": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z",
      "daysRemaining": 16
    },
    "plan": {
      "id": "professional",
      "name": "Professional",
      "price": 9900,
      "currency": "usd"
    },
    "usage": {
      "logs": {
        "current": 750000,
        "limit": 1000000,
        "percentage": 75
      },
      "storage": {
        "current": 45.2,
        "limit": 100,
        "unit": "GB",
        "percentage": 45.2
      },
      "aiQueries": {
        "current": 450,
        "limit": 1000,
        "percentage": 45
      }
    },
    "overages": {
      "logs": 0,
      "storage": 0,
      "aiQueries": 0,
      "estimatedCost": 0
    }
  }
}
```

#### `GET /billing/usage/history`
Get historical usage data.

**Query Parameters:**
- `months` (number): Number of months to retrieve (max 12)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "period": "2024-01",
        "logs": 950000,
        "storage": 67.8,
        "aiQueries": 890,
        "cost": 9900,
        "overages": 0
      },
      {
        "period": "2023-12",
        "logs": 1200000,
        "storage": 78.2,
        "aiQueries": 1250,
        "cost": 12400,
        "overages": 2500
      }
    ]
  }
}
```

### Subscription Management

#### `GET /billing/subscription`
Get current subscription details.

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1234567890",
      "status": "active",
      "plan": {
        "id": "professional",
        "name": "Professional",
        "price": 9900,
        "currency": "usd",
        "interval": "month"
      },
      "currentPeriod": {
        "start": "2024-01-01T00:00:00Z",
        "end": "2024-01-31T23:59:59Z"
      },
      "nextBilling": "2024-02-01T00:00:00Z",
      "cancelAtPeriodEnd": false
    },
    "paymentMethod": {
      "type": "card",
      "last4": "4242",
      "brand": "visa",
      "expiryMonth": 12,
      "expiryYear": 2025
    }
  }
}
```

#### `POST /billing/subscription/change-plan`
Change subscription plan.

**Request:**
```json
{
  "planId": "enterprise",
  "prorationBehavior": "create_prorations"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1234567890",
      "status": "active",
      "plan": {
        "id": "enterprise",
        "name": "Enterprise",
        "price": 29900
      }
    },
    "prorationAmount": 20000,
    "effectiveDate": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔧 Admin API

### Tenant Management

#### `GET /admin/tenants`
List all tenants (admin only).

**Query Parameters:**
- `page` (number): Page number (default 1)
- `limit` (number): Results per page (max 100, default 20)
- `status` (string): Filter by status (active, suspended, deleted)
- `plan` (string): Filter by plan (starter, professional, enterprise)

**Response:**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "tenant_123",
        "tenantId": "acme-corp",
        "organizationName": "Acme Corporation",
        "plan": "professional",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z",
        "lastActivity": "2024-01-15T10:30:00Z",
        "usage": {
          "logs": 750000,
          "storage": 45.2,
          "users": 12
        }
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 20,
      "totalPages": 63
    }
  }
}
```

#### `POST /admin/tenants`
Create a new tenant.

**Request:**
```json
{
  "tenantId": "new-company",
  "organizationName": "New Company Inc",
  "planId": "professional",
  "billingEmail": "billing@newcompany.com",
  "adminUser": {
    "email": "admin@newcompany.com",
    "name": "Admin User",
    "password": "secure_password"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "tenant_456",
      "tenantId": "new-company",
      "status": "creating",
      "kubernetesStatus": {
        "phase": "Pending",
        "message": "Creating tenant resources"
      }
    }
  }
}
```

#### `GET /admin/tenants/{tenantId}`
Get detailed tenant information.

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "tenant_123",
      "tenantId": "acme-corp",
      "organizationName": "Acme Corporation",
      "plan": "professional",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "kubernetesStatus": {
        "phase": "Active",
        "message": "Tenant is active and ready",
        "namespaceCreated": true,
        "resourcesProvisioned": true,
        "servicesDeployed": true
      },
      "resources": {
        "cpu": { "requests": "8", "limits": "16" },
        "memory": { "requests": "16Gi", "limits": "32Gi" },
        "storage": { "requests": "100Gi" }
      },
      "usage": {
        "logs": 750000,
        "storage": 45.2,
        "users": 12,
        "lastActivity": "2024-01-15T10:30:00Z"
      }
    }
  }
}
```

### System Monitoring

#### `GET /admin/system/health`
Get overall system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "logIngestion": { "status": "healthy", "responseTime": "45ms" },
      "queryService": { "status": "healthy", "responseTime": "23ms" },
      "billingService": { "status": "healthy", "responseTime": "67ms" },
      "authService": { "status": "healthy", "responseTime": "12ms" }
    },
    "infrastructure": {
      "kubernetes": { "status": "healthy", "nodes": 12, "readyNodes": 12 },
      "database": { "status": "healthy", "connections": 45, "maxConnections": 100 },
      "redis": { "status": "healthy", "memory": "2.1GB", "maxMemory": "8GB" }
    },
    "metrics": {
      "requestsPerSecond": 1250,
      "errorRate": 0.025,
      "averageResponseTime": "89ms"
    }
  }
}
```

---

## 🤖 AI Integration API

### AI Query Interface

#### `POST /ai/query`
Query logs using natural language.

**Request:**
```json
{
  "query": "Show me all database errors from the last 24 hours",
  "context": {
    "timeRange": {
      "from": "2024-01-14T10:30:00Z",
      "to": "2024-01-15T10:30:00Z"
    },
    "includeMetadata": true,
    "maxResults": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "interpretation": {
      "query": "Show me all database errors from the last 24 hours",
      "filters": {
        "level": "error",
        "message": "*database*",
        "timeRange": {
          "from": "2024-01-14T10:30:00Z",
          "to": "2024-01-15T10:30:00Z"
        }
      },
      "confidence": 0.95
    },
    "results": {
      "logs": [...],
      "summary": "Found 23 database-related errors in the last 24 hours",
      "patterns": [
        "Connection timeout errors peaked at 14:30 UTC",
        "Most errors from 'user-service' component"
      ]
    },
    "suggestions": [
      "Check database connection pool configuration",
      "Review database performance metrics"
    ]
  }
}
```

### AI Model Management

#### `GET /ai/models`
List available AI models.

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "anomaly-detection-v2",
        "name": "Anomaly Detection",
        "version": "2.1.0",
        "status": "active",
        "capabilities": ["anomaly_detection", "pattern_recognition"],
        "accuracy": 0.94
      },
      {
        "id": "log-classification-v1",
        "name": "Log Classification",
        "version": "1.3.2",
        "status": "active",
        "capabilities": ["classification", "sentiment_analysis"],
        "accuracy": 0.89
      }
    ]
  }
}
```

---

## 📡 Webhooks

### Webhook Configuration

#### `POST /webhooks`
Create a new webhook endpoint.

**Request:**
```json
{
  "url": "https://your-app.com/webhooks/neurallog",
  "events": [
    "log.ingested",
    "anomaly.detected",
    "billing.invoice.created"
  ],
  "secret": "webhook_secret_key",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "webhook": {
      "id": "webhook_123",
      "url": "https://your-app.com/webhooks/neurallog",
      "events": ["log.ingested", "anomaly.detected"],
      "secret": "webhook_secret_key",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Webhook Events

#### Log Events
```json
{
  "event": "log.ingested",
  "timestamp": "2024-01-15T10:30:00Z",
  "tenantId": "acme-corp",
  "data": {
    "logId": "log_67890",
    "level": "error",
    "source": "api-server",
    "count": 1
  }
}
```

#### Anomaly Events
```json
{
  "event": "anomaly.detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "tenantId": "acme-corp",
  "data": {
    "anomalyId": "anomaly_123",
    "type": "volume_spike",
    "severity": "high",
    "confidence": 0.95,
    "description": "Log volume increased by 300%"
  }
}
```

---

## 🚨 Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "timestamp",
      "reason": "Invalid ISO 8601 format"
    },
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid request parameters |
| **401** | Unauthorized | Authentication required |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource already exists |
| **422** | Unprocessable Entity | Validation failed |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |
| **503** | Service Unavailable | Service temporarily unavailable |

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_REQUIRED` | Valid authentication token required |
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource does not exist |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |
| `QUOTA_EXCEEDED` | Usage quota exceeded |
| `TENANT_NOT_FOUND` | Tenant does not exist |
| `PLAN_LIMIT_EXCEEDED` | Plan limits exceeded |

---

## 📊 Rate Limiting

### Rate Limit Headers

All API responses include rate limiting headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
X-RateLimit-Window: 3600
```

### Rate Limits by Plan

| Plan | Requests/Hour | Burst Limit | Log Ingestion/Min |
|------|---------------|-------------|-------------------|
| **Starter** | 10,000 | 100 | 1,000 |
| **Professional** | 50,000 | 500 | 10,000 |
| **Enterprise** | 200,000 | 2,000 | 100,000 |

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "details": {
      "limit": 1000,
      "window": 3600,
      "resetTime": "2024-01-15T11:00:00Z"
    }
  }
}
```

---

## 🔗 SDK Integration

### Quick Start Examples

#### JavaScript/Node.js
```javascript
import { NeuralLogClient } from '@neurallog/sdk';

const client = new NeuralLogClient({
  apiKey: 'nl_live_1234567890abcdef',
  tenantId: 'acme-corp'
});

// Ingest logs
await client.logs.create({
  level: 'error',
  message: 'Database connection failed',
  metadata: { userId: '12345' }
});

// Search logs
const results = await client.logs.search({
  query: 'database error',
  from: '2024-01-15T00:00:00Z',
  limit: 100
});
```

#### Python
```python
from neurallog import NeuralLogClient

client = NeuralLogClient(
    api_key='nl_live_1234567890abcdef',
    tenant_id='acme-corp'
)

# Ingest logs
client.logs.create({
    'level': 'error',
    'message': 'Database connection failed',
    'metadata': {'user_id': '12345'}
})

# Search logs
results = client.logs.search(
    query='database error',
    from_time='2024-01-15T00:00:00Z',
    limit=100
)
```

---

This API documentation provides comprehensive coverage of all NeuralLog endpoints. For additional examples and integration guides, see the [SDK Documentation](SDK.md) and [Integration Examples](examples/).
