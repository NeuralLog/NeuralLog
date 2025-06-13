# NeuralLog API Reference

## 🔐 Authentication

### API Key Authentication
```http
Authorization: Bearer your-api-key
X-Tenant-ID: your-tenant-id
```

### M2M Authentication (for AI agents)
```http
Authorization: Bearer jwt-token
X-Tenant-ID: your-tenant-id
```

## 📝 Logging API

### Send Log Entry
```http
POST /api/v1/logs
Content-Type: application/json
Authorization: Bearer your-api-key
X-Tenant-ID: your-tenant-id

{
  "level": "info",
  "message": "User action completed",
  "metadata": {
    "userId": "12345",
    "action": "purchase",
    "amount": 99.99
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "logId": "log_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Batch Log Entries
```http
POST /api/v1/logs/batch
Content-Type: application/json

{
  "entries": [
    {
      "level": "info",
      "message": "User logged in",
      "metadata": { "userId": "12345" }
    },
    {
      "level": "error",
      "message": "Database connection failed",
      "metadata": { "database": "primary" }
    }
  ]
}
```

### Get Log Entries
```http
GET /api/v1/logs?limit=100&offset=0&level=error&start_time=2024-01-01T00:00:00Z
```

## 🔍 Search API

### Search Logs
```http
POST /api/v1/search
Content-Type: application/json

{
  "query": "database error",
  "filters": {
    "level": ["error", "fatal"],
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-15T23:59:59Z"
    }
  },
  "limit": 50
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "log_abc123",
      "level": "error",
      "message": "Database connection timeout",
      "metadata": { "database": "primary" },
      "timestamp": "2024-01-15T10:30:00Z",
      "score": 0.95
    }
  ],
  "total": 1,
  "hasMore": false
}
```

## 📊 Analytics API

### Get Metrics
```http
GET /api/v1/metrics?metric=error_rate&timeRange=24h&granularity=1h
```

### Create Custom Metric
```http
POST /api/v1/metrics
Content-Type: application/json

{
  "name": "user_signup_rate",
  "description": "Rate of user signups per hour",
  "query": {
    "filters": {
      "message": "User signed up"
    },
    "aggregation": "count",
    "timeWindow": "1h"
  }
}
```

## 🤖 AI Integration API

### MCP Tools

#### get_logs
```json
{
  "name": "get_logs",
  "description": "Retrieve available log names and metadata",
  "parameters": {
    "limit": {
      "type": "number",
      "description": "Maximum number of logs to return",
      "default": 1000
    }
  }
}
```

#### search
```json
{
  "name": "search",
  "description": "Search across logs with advanced filtering",
  "parameters": {
    "query": {
      "type": "string",
      "description": "Text to search for"
    },
    "filters": {
      "type": "object",
      "description": "Filter criteria"
    },
    "limit": {
      "type": "number",
      "default": 100
    }
  }
}
```

#### append_to_log
```json
{
  "name": "append_to_log",
  "description": "Add new data to a specific log",
  "parameters": {
    "log_name": {
      "type": "string",
      "required": true
    },
    "data": {
      "type": "object",
      "required": true
    }
  }
}
```

#### clear_log
```json
{
  "name": "clear_log",
  "description": "Clear all entries from a specific log",
  "parameters": {
    "log_name": {
      "type": "string",
      "required": true
    }
  }
}
```

## 🔐 Authentication API

### Get Access Token (M2M)
```http
POST /api/auth/m2m
Content-Type: application/json

{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "tenantId": "your-tenant-id"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## 👥 User Management API

### Get User Profile
```http
GET /api/v1/users/me
Authorization: Bearer your-api-key
```

### Update User Profile
```http
PATCH /api/v1/users/me
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "preferences": {
    "timezone": "UTC",
    "notifications": true
  }
}
```

## 🔑 API Key Management

### List API Keys
```http
GET /api/v1/api-keys
Authorization: Bearer your-api-key
```

### Create API Key
```http
POST /api/v1/api-keys
Content-Type: application/json

{
  "name": "Production API Key",
  "permissions": ["logs:read", "logs:write", "search:read"],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Revoke API Key
```http
DELETE /api/v1/api-keys/{keyId}
Authorization: Bearer your-api-key
```

## 📡 WebSocket API

### Real-time Log Streaming
```javascript
const ws = new WebSocket('wss://api.neurallog.com/v1/stream');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    filters: {
      level: ['error', 'fatal']
    },
    auth: 'Bearer your-api-key'
  }));
};

ws.onmessage = (event) => {
  const logEntry = JSON.parse(event.data);
  console.log('New log entry:', logEntry);
};
```

## ❌ Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "level",
      "reason": "Invalid log level"
    }
  },
  "requestId": "req_abc123"
}
```

### Common Error Codes
- `INVALID_REQUEST` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Rate limit exceeded
- `INTERNAL_ERROR` - Server error

## 📈 Rate Limits

| Endpoint | Rate Limit | Burst |
|----------|------------|-------|
| `/api/v1/logs` | 1000/min | 100 |
| `/api/v1/search` | 100/min | 20 |
| `/api/v1/metrics` | 500/min | 50 |
| WebSocket | 10 connections | - |

## 🔧 SDK Examples

### TypeScript
```typescript
import { NeuralLog } from '@neurallog/client-sdk';

const logger = new NeuralLog({
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id'
});

await logger.log({
  level: 'info',
  message: 'Hello, NeuralLog!',
  metadata: { userId: '12345' }
});

const results = await logger.search({
  query: 'error',
  limit: 10
});
```

### Python
```python
from neurallog import NeuralLog

logger = NeuralLog(
    api_key='your-api-key',
    tenant_id='your-tenant-id'
)

logger.log(
    level='info',
    message='Hello, NeuralLog!',
    metadata={'user_id': '12345'}
)

results = logger.search(
    query='error',
    limit=10
)
```

### cURL
```bash
# Send log entry
curl -X POST https://api.neurallog.com/v1/logs \
  -H "Authorization: Bearer your-api-key" \
  -H "X-Tenant-ID: your-tenant-id" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "Hello, NeuralLog!",
    "metadata": {"userId": "12345"}
  }'

# Search logs
curl -X POST https://api.neurallog.com/v1/search \
  -H "Authorization: Bearer your-api-key" \
  -H "X-Tenant-ID: your-tenant-id" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "error",
    "limit": 10
  }'
```

---

**📚 Related Documentation:**
- [AI Agents Guide](./agents.md) - AI integration
- [SDK Documentation](./sdk-documentation.md) - Client libraries
- [Security Guide](./security.md) - Security best practices
