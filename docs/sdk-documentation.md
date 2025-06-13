# NeuralLog SDK Documentation

## 🚀 Quick Start

### Installation

#### TypeScript/JavaScript
```bash
npm install @neurallog/client-sdk
```

#### Python
```bash
pip install neurallog-python
```

#### Unity
```bash
# Via Unity Package Manager
https://github.com/NeuralLog/unity-sdk.git
```

#### Go
```bash
go get github.com/neurallog/go-sdk
```

#### Java
```xml
<dependency>
    <groupId>com.neurallog</groupId>
    <artifactId>neurallog-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

#### C#
```bash
dotnet add package NeuralLog.SDK
```

## 📝 Basic Usage

### TypeScript/JavaScript

```typescript
import { NeuralLog } from '@neurallog/client-sdk';

// Initialize the client
const logger = new NeuralLog({
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id',
  endpoint: 'https://api.neurallog.com',
  encryption: {
    enabled: true,
    keyId: 'your-encryption-key-id'
  }
});

// Log a message
await logger.log({
  level: 'info',
  message: 'User action completed',
  metadata: {
    userId: '12345',
    action: 'purchase',
    amount: 99.99
  }
});

// Search logs
const results = await logger.search({
  query: 'error',
  filters: {
    level: ['error', 'fatal'],
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    }
  },
  limit: 100
});

// Stream logs in real-time
const stream = logger.stream({
  filters: { level: ['error'] }
});

stream.on('data', (logEntry) => {
  console.log('New error:', logEntry);
});
```

### Python

```python
from neurallog import NeuralLog
from datetime import datetime, timedelta

# Initialize the client
logger = NeuralLog(
    api_key='your-api-key',
    tenant_id='your-tenant-id',
    endpoint='https://api.neurallog.com',
    encryption={
        'enabled': True,
        'key_id': 'your-encryption-key-id'
    }
)

# Log a message
logger.log(
    level='info',
    message='User action completed',
    metadata={
        'user_id': '12345',
        'action': 'purchase',
        'amount': 99.99
    }
)

# Search logs
results = logger.search(
    query='error',
    filters={
        'level': ['error', 'fatal'],
        'time_range': {
            'start': datetime.now() - timedelta(days=1),
            'end': datetime.now()
        }
    },
    limit=100
)

# Stream logs in real-time
def on_log_entry(entry):
    print(f"New error: {entry}")

stream = logger.stream(
    filters={'level': ['error']},
    on_data=on_log_entry
)
```

### Unity (C#)

```csharp
using NeuralLog;
using System.Collections.Generic;

public class GameLogger : MonoBehaviour
{
    private NeuralLogClient logger;
    
    void Start()
    {
        // Initialize the client
        logger = new NeuralLogClient(new NeuralLogConfig
        {
            ApiKey = "your-api-key",
            TenantId = "your-tenant-id",
            Endpoint = "https://api.neurallog.com",
            Encryption = new EncryptionConfig
            {
                Enabled = true,
                KeyId = "your-encryption-key-id"
            }
        });
    }
    
    public async void LogPlayerAction(string action, Dictionary<string, object> metadata)
    {
        await logger.LogAsync(new LogEntry
        {
            Level = LogLevel.Info,
            Message = $"Player action: {action}",
            Metadata = metadata
        });
    }
    
    public async void SearchGameErrors()
    {
        var results = await logger.SearchAsync(new SearchRequest
        {
            Query = "game error",
            Filters = new SearchFilters
            {
                Level = new[] { LogLevel.Error, LogLevel.Fatal },
                TimeRange = new TimeRange
                {
                    Start = DateTime.Now.AddHours(-1),
                    End = DateTime.Now
                }
            },
            Limit = 50
        });
        
        foreach (var entry in results.Entries)
        {
            Debug.LogError($"Game error found: {entry.Message}");
        }
    }
}
```

### Go

```go
package main

import (
    "context"
    "time"
    
    "github.com/neurallog/go-sdk"
)

func main() {
    // Initialize the client
    client, err := neurallog.NewClient(&neurallog.Config{
        APIKey:   "your-api-key",
        TenantID: "your-tenant-id",
        Endpoint: "https://api.neurallog.com",
        Encryption: &neurallog.EncryptionConfig{
            Enabled: true,
            KeyID:   "your-encryption-key-id",
        },
    })
    if err != nil {
        panic(err)
    }
    
    ctx := context.Background()
    
    // Log a message
    err = client.Log(ctx, &neurallog.LogEntry{
        Level:   neurallog.LevelInfo,
        Message: "User action completed",
        Metadata: map[string]interface{}{
            "userId": "12345",
            "action": "purchase",
            "amount": 99.99,
        },
    })
    if err != nil {
        panic(err)
    }
    
    // Search logs
    results, err := client.Search(ctx, &neurallog.SearchRequest{
        Query: "error",
        Filters: &neurallog.SearchFilters{
            Level: []neurallog.LogLevel{neurallog.LevelError, neurallog.LevelFatal},
            TimeRange: &neurallog.TimeRange{
                Start: time.Now().Add(-24 * time.Hour),
                End:   time.Now(),
            },
        },
        Limit: 100,
    })
    if err != nil {
        panic(err)
    }
    
    for _, entry := range results.Entries {
        fmt.Printf("Found error: %s\n", entry.Message)
    }
}
```

## 🔧 Configuration Options

### Common Configuration

```typescript
interface NeuralLogConfig {
  // Required
  apiKey: string;
  tenantId: string;
  
  // Optional
  endpoint?: string;           // Default: https://api.neurallog.com
  timeout?: number;           // Request timeout in ms (default: 30000)
  retryAttempts?: number;     // Number of retry attempts (default: 3)
  retryDelay?: number;        // Delay between retries in ms (default: 1000)
  
  // Encryption
  encryption?: {
    enabled: boolean;
    keyId: string;
    algorithm?: string;       // Default: AES-256-GCM
  };
  
  // Batching
  batching?: {
    enabled: boolean;         // Default: true
    maxSize: number;          // Max entries per batch (default: 100)
    maxWait: number;          // Max wait time in ms (default: 5000)
  };
  
  // Compression
  compression?: {
    enabled: boolean;         // Default: true
    algorithm: string;        // gzip, deflate, br
  };
}
```

### Environment Variables

```bash
NEURALLOG_API_KEY=your-api-key
NEURALLOG_TENANT_ID=your-tenant-id
NEURALLOG_ENDPOINT=https://api.neurallog.com
NEURALLOG_ENCRYPTION_ENABLED=true
NEURALLOG_ENCRYPTION_KEY_ID=your-key-id
```

## 📊 Advanced Features

### Structured Logging

```typescript
await logger.log({
  level: 'info',
  message: 'User purchase completed',
  metadata: {
    user: {
      id: '12345',
      email: 'user@example.com',
      tier: 'premium'
    },
    purchase: {
      id: 'purchase_789',
      amount: 99.99,
      currency: 'USD',
      items: [
        { id: 'item_1', name: 'Product A', price: 49.99 },
        { id: 'item_2', name: 'Product B', price: 49.99 }
      ]
    },
    context: {
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1',
      sessionId: 'session_abc123'
    }
  },
  tags: ['purchase', 'ecommerce', 'conversion']
});
```

### Custom Metrics

```typescript
// Define custom metrics
await logger.defineMetric({
  name: 'user_signup_rate',
  description: 'Rate of user signups per hour',
  type: 'counter',
  labels: ['source', 'plan_type']
});

// Track metric values
await logger.trackMetric('user_signup_rate', 1, {
  source: 'web',
  plan_type: 'premium'
});
```

### Error Tracking

```typescript
// Automatic error tracking
try {
  await riskyOperation();
} catch (error) {
  await logger.logError(error, {
    operation: 'riskyOperation',
    userId: '12345',
    context: { /* additional context */ }
  });
  throw error;
}
```

### Performance Monitoring

```typescript
// Automatic performance tracking
const timer = logger.startTimer('api_request');
try {
  const result = await apiCall();
  timer.end({ status: 'success', endpoint: '/api/users' });
  return result;
} catch (error) {
  timer.end({ status: 'error', endpoint: '/api/users', error: error.message });
  throw error;
}
```

## 🔄 Real-time Streaming

### WebSocket Streaming

```typescript
const stream = logger.stream({
  filters: {
    level: ['error', 'fatal'],
    tags: ['critical']
  },
  bufferSize: 100,
  reconnect: true
});

stream.on('data', (entries) => {
  entries.forEach(entry => {
    console.log('Critical error:', entry);
    // Trigger alerts, notifications, etc.
  });
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});

stream.on('reconnect', () => {
  console.log('Stream reconnected');
});

// Close the stream
stream.close();
```

## 🧪 Testing

### Mock Client

```typescript
import { MockNeuralLog } from '@neurallog/client-sdk/testing';

// In your tests
const mockLogger = new MockNeuralLog();

// Verify logs were sent
expect(mockLogger.getLogs()).toHaveLength(1);
expect(mockLogger.getLogs()[0]).toMatchObject({
  level: 'info',
  message: 'Test message'
});

// Mock search results
mockLogger.mockSearchResults([
  { id: '1', level: 'error', message: 'Test error' }
]);

const results = await logger.search({ query: 'error' });
expect(results.entries).toHaveLength(1);
```

## 🔒 Security Best Practices

### API Key Management

```typescript
// ✅ Use environment variables
const logger = new NeuralLog({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: process.env.NEURALLOG_TENANT_ID
});

// ✅ Use secure configuration management
import { getSecret } from './secrets';

const logger = new NeuralLog({
  apiKey: await getSecret('neurallog-api-key'),
  tenantId: await getSecret('neurallog-tenant-id')
});
```

### Data Sanitization

```typescript
// Sanitize sensitive data before logging
function sanitizeUserData(user: any) {
  const { password, ssn, creditCard, ...safeData } = user;
  return safeData;
}

await logger.log({
  level: 'info',
  message: 'User updated profile',
  metadata: {
    user: sanitizeUserData(user),
    timestamp: new Date().toISOString()
  }
});
```

## 📈 Performance Optimization

### Batching

```typescript
// Enable batching for high-throughput scenarios
const logger = new NeuralLog({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: process.env.NEURALLOG_TENANT_ID,
  batching: {
    enabled: true,
    maxSize: 100,      // Send batch when 100 entries collected
    maxWait: 5000      // Send batch after 5 seconds regardless of size
  }
});

// Logs will be automatically batched
for (let i = 0; i < 1000; i++) {
  logger.log({
    level: 'info',
    message: `Processing item ${i}`,
    metadata: { itemId: i }
  });
}

// Force flush any pending batches
await logger.flush();
```

---

**📚 Related Documentation:**
- [API Reference](./api-reference.md) - Complete API documentation
- [AI Agents Guide](./agents.md) - AI integration with MCP
- [Security Guide](./security.md) - Security best practices
