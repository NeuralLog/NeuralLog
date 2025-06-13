# NeuralLog SDK Integration Guide

NeuralLog provides powerful SDKs for multiple programming languages, making it easy to integrate secure, zero-knowledge logging into your applications. This guide demonstrates how to integrate NeuralLog across various languages and frameworks.

## Available SDKs

NeuralLog offers SDKs for all major programming languages:

- **TypeScript/JavaScript**: For Node.js and browser applications
- **Python**: For Python applications and data science workflows
- **Java**: For enterprise Java applications
- **C#/.NET**: For .NET applications
- **Go**: For Go applications and microservices
- **Ruby**: For Ruby applications and Rails
- **PHP**: For PHP applications

## Quick Start Examples

### TypeScript/JavaScript

```typescript
// Install: npm install @neurallog/sdk

import { AILogger } from '@neurallog/sdk';

// Initialize the logger
const logger = new AILogger({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'your-tenant',
  source: 'payment-service'
});

// Log events with different levels
logger.info('User signed up', { userId: '123', plan: 'premium' });
logger.warn('Payment processing delayed', { orderId: '456', delay: '2s' });
logger.error('Database connection failed', { 
  host: 'db-1',
  error: 'Connection timeout',
  retryCount: 3
});

// Add context to all subsequent logs
logger.addContext({ requestId: '789', sessionId: 'abc-123' });

// Log with additional metadata
logger.info('Cart updated', { items: 3, total: 99.99 }, {
  customer: { tier: 'gold', since: '2022-01-01' },
  performance: { duration: 45, cached: false }
});
```

### Python

```python
# Install: pip install neurallog-sdk

from neurallog import AILogger
import os

# Initialize the logger
logger = AILogger(
    api_key=os.environ.get("NEURALLOG_API_KEY"),
    tenant_id="your-tenant",
    source="recommendation-engine"
)

# Log events with different levels
logger.info("Recommendations generated", {
    "user_id": "123",
    "count": 5,
    "algorithm": "collaborative-filtering"
})

logger.warn("Slow recommendation generation", {
    "user_id": "456",
    "duration": 1.2,
    "threshold": 1.0
})

logger.error("Failed to generate recommendations", {
    "user_id": "789",
    "error": "Data unavailable",
    "fallback": "used-cached"
})

# Add context to all subsequent logs
logger.add_context({
    "request_id": "req-123",
    "experiment_group": "test-group-a"
})

# Batch logging for performance
with logger.batch():
    for i in range(100):
        logger.info(f"Processing item {i}", {"item_id": i})
```

### Java

```java
// Add to pom.xml:
// <dependency>
//   <groupId>com.neurallog</groupId>
//   <artifactId>neurallog-sdk</artifactId>
//   <version>1.0.0</version>
// </dependency>

import com.neurallog.AILogger;
import com.neurallog.LogLevel;
import java.util.Map;

public class LoggingExample {
    public static void main(String[] args) {
        // Initialize the logger
        AILogger logger = new AILogger.Builder()
            .apiKey(System.getenv("NEURALLOG_API_KEY"))
            .tenantId("your-tenant")
            .source("order-service")
            .build();
        
        // Log events with different levels
        logger.info("Order created", Map.of(
            "orderId", "order-123",
            "customerId", "cust-456",
            "total", 99.99
        ));
        
        logger.warn("Order processing delayed", Map.of(
            "orderId", "order-123",
            "delay", "30s",
            "reason", "payment-processing"
        ));
        
        logger.error("Order processing failed", Map.of(
            "orderId", "order-123",
            "error", "Payment declined",
            "errorCode", "PAYMENT-001"
        ));
        
        // Add context to all subsequent logs
        logger.addContext(Map.of(
            "requestId", "req-789",
            "correlationId", "corr-abc"
        ));
        
        // Close the logger when done (flushes any pending logs)
        logger.close();
    }
}
```

### C#/.NET

```csharp
// Install: dotnet add package NeuralLog.SDK

using NeuralLog;
using System.Collections.Generic;

// Initialize the logger
var logger = new AILogger(new AILoggerOptions
{
    ApiKey = Environment.GetEnvironmentVariable("NEURALLOG_API_KEY"),
    TenantId = "your-tenant",
    Source = "inventory-service"
});

// Log events with different levels
logger.Info("Product inventory updated", new Dictionary<string, object>
{
    { "productId", "prod-123" },
    { "quantity", 50 },
    { "warehouse", "east-1" }
});

logger.Warn("Low inventory alert", new Dictionary<string, object>
{
    { "productId", "prod-456" },
    { "quantity", 5 },
    { "threshold", 10 }
});

logger.Error("Inventory sync failed", new Dictionary<string, object>
{
    { "source", "erp-system" },
    { "error", "Connection timeout" },
    { "affectedProducts", 23 }
});

// Add context to all subsequent logs
logger.AddContext(new Dictionary<string, object>
{
    { "requestId", "req-789" },
    { "userId", "user-123" }
});

// Dispose the logger when done
logger.Dispose();
```

### Go

```go
// Install: go get github.com/neurallog/sdk-go

package main

import (
    "os"
    "github.com/neurallog/sdk-go"
)

func main() {
    // Initialize the logger
    logger, err := neurallog.NewAILogger(neurallog.Options{
        ApiKey:   os.Getenv("NEURALLOG_API_KEY"),
        TenantId: "your-tenant",
        Source:   "auth-service",
    })
    if err != nil {
        panic(err)
    }
    
    // Log events with different levels
    logger.Info("User authenticated", map[string]interface{}{
        "userId":    "user-123",
        "method":    "oauth",
        "provider":  "google",
        "ipAddress": "192.168.1.1",
    })
    
    logger.Warn("Failed login attempt", map[string]interface{}{
        "username":  "john.doe",
        "ipAddress": "192.168.1.2",
        "attempts":  3,
    })
    
    logger.Error("Authentication service unavailable", map[string]interface{}{
        "service":   "oauth-provider",
        "error":     "Connection refused",
        "retryIn":   "30s",
    })
    
    // Add context to all subsequent logs
    logger.AddContext(map[string]interface{}{
        "requestId": "req-789",
        "region":    "us-east-1",
    })
    
    // Close the logger when done
    defer logger.Close()
}
```

## Framework Integrations

### Express.js (Node.js)

```typescript
// Install: npm install @neurallog/sdk @neurallog/express

import express from 'express';
import { neurallogMiddleware } from '@neurallog/express';

const app = express();

// Add NeuralLog middleware
app.use(neurallogMiddleware({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'your-tenant',
  source: 'api-service',
  // Log all requests and responses
  logRequests: true,
  logResponses: true,
  // Exclude sensitive headers
  excludeHeaders: ['authorization', 'cookie'],
  // Exclude sensitive body fields
  excludeBodyFields: ['password', 'creditCard']
}));

app.get('/users/:id', (req, res) => {
  // Access the logger from the request object
  req.logger.info('Fetching user profile', { userId: req.params.id });
  
  // Your handler logic...
  
  res.json({ id: req.params.id, name: 'John Doe' });
});

app.listen(3000);
```

### Flask (Python)

```python
# Install: pip install neurallog-sdk neurallog-flask

from flask import Flask, request
from neurallog.integrations.flask import NeuralLogMiddleware
import os

app = Flask(__name__)

# Add NeuralLog middleware
app.wsgi_app = NeuralLogMiddleware(
    app.wsgi_app,
    api_key=os.environ.get("NEURALLOG_API_KEY"),
    tenant_id="your-tenant",
    source="api-service",
    log_requests=True,
    log_responses=True,
    exclude_headers=["authorization", "cookie"],
    exclude_body_fields=["password", "credit_card"]
)

@app.route('/users/<user_id>')
def get_user(user_id):
    # Access the logger from the request object
    request.logger.info("Fetching user profile", {"user_id": user_id})
    
    # Your handler logic...
    
    return {"id": user_id, "name": "John Doe"}

if __name__ == '__main__':
    app.run(debug=True)
```

### Spring Boot (Java)

```java
// Add to pom.xml:
// <dependency>
//   <groupId>com.neurallog</groupId>
//   <artifactId>neurallog-spring</artifactId>
//   <version>1.0.0</version>
// </dependency>

import com.neurallog.spring.NeuralLogInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Bean
    public NeuralLogInterceptor neuralLogInterceptor() {
        return new NeuralLogInterceptor(
            System.getenv("NEURALLOG_API_KEY"),
            "your-tenant",
            "api-service"
        );
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(neuralLogInterceptor());
    }
}

// In your controller
@RestController
public class UserController {
    
    @Autowired
    private AILogger logger;
    
    @GetMapping("/users/{userId}")
    public User getUser(@PathVariable String userId) {
        logger.info("Fetching user profile", Map.of("userId", userId));
        
        // Your handler logic...
        
        return new User(userId, "John Doe");
    }
}
```

### ASP.NET Core (.NET)

```csharp
// Install: dotnet add package NeuralLog.AspNetCore

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using NeuralLog.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add NeuralLog services
builder.Services.AddNeuralLog(options =>
{
    options.ApiKey = Environment.GetEnvironmentVariable("NEURALLOG_API_KEY");
    options.TenantId = "your-tenant";
    options.Source = "api-service";
    options.LogRequests = true;
    options.LogResponses = true;
    options.ExcludeHeaders = new[] { "authorization", "cookie" };
    options.ExcludeBodyFields = new[] { "password", "creditCard" };
});

var app = builder.Build();

// Add NeuralLog middleware
app.UseNeuralLog();

app.MapGet("/users/{userId}", (string userId, IAILogger logger) =>
{
    logger.Info("Fetching user profile", new Dictionary<string, object>
    {
        { "userId", userId }
    });
    
    // Your handler logic...
    
    return Results.Ok(new { Id = userId, Name = "John Doe" });
});

app.Run();
```

## Advanced Features

### Batching for Performance

```typescript
// TypeScript
import { AILogger, BatchOptions } from '@neurallog/sdk';

const logger = new AILogger({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'your-tenant',
  source: 'batch-example',
  batch: {
    size: 50,         // Batch up to 50 logs
    intervalMs: 5000, // Or send every 5 seconds
    maxRetries: 3     // Retry failed batches
  }
});

// Logs will be sent in batches
for (let i = 0; i < 1000; i++) {
  logger.info(`Processing item ${i}`, { itemId: i });
}

// Force send any pending logs
await logger.flush();
```

### Structured Logging

```typescript
// TypeScript
import { AILogger } from '@neurallog/sdk';

const logger = new AILogger({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'your-tenant',
  source: 'order-service'
});

// Define a structured log schema
type OrderLog = {
  orderId: string;
  customerId: string;
  items: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
};

// Log with type checking
logger.info<OrderLog>('Order created', {
  orderId: 'order-123',
  customerId: 'cust-456',
  items: 3,
  total: 99.99,
  paymentMethod: 'credit-card',
  shippingMethod: 'express'
});
```

### Context Propagation

```typescript
// TypeScript
import { AILogger, LogContext } from '@neurallog/sdk';
import { AsyncLocalStorage } from 'async_hooks';

const contextStorage = new AsyncLocalStorage<LogContext>();

// Create a context-aware logger
const logger = new AILogger({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'your-tenant',
  source: 'api-service',
  contextProvider: () => contextStorage.getStore() || {}
});

// Middleware to set up context
function requestMiddleware(req, res, next) {
  const context = {
    requestId: req.headers['x-request-id'] || generateId(),
    userId: req.user?.id,
    sessionId: req.cookies.sessionId
  };
  
  contextStorage.run(context, () => {
    next();
  });
}

// The logger will automatically include the context
async function handleRequest() {
  logger.info('Processing request'); // Includes requestId, userId, sessionId
  await processOrder();
}

async function processOrder() {
  // Even in this function, the context is available
  logger.info('Processing order'); // Still includes the same context
}
```

### Offline Support

```typescript
// TypeScript
import { AILogger, OfflineStorageOptions } from '@neurallog/sdk';

const logger = new AILogger({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'your-tenant',
  source: 'mobile-app',
  offline: {
    enabled: true,
    storage: 'indexeddb', // For browser
    maxSize: 10 * 1024 * 1024, // 10MB
    syncWhenOnline: true
  }
});

// Logs are stored locally when offline
logger.info('App started in offline mode');

// When connection is restored, logs are automatically sent
window.addEventListener('online', () => {
  logger.info('Connection restored');
});
```

## Zero-Knowledge Security

All NeuralLog SDKs implement zero-knowledge security:

### Client-Side Encryption

```typescript
// TypeScript - internal SDK implementation
class SecureLogger {
  private async encryptLog(message: string, data: any): Promise<EncryptedLog> {
    // Derive encryption key from API key
    const encryptionKey = await this.deriveEncryptionKey(this.apiKey, this.tenantId);
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Prepare the log content
    const content = JSON.stringify({
      message,
      data,
      timestamp: Date.now(),
      source: this.source,
      context: this.context
    });
    
    // Encrypt the content
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      encryptionKey,
      new TextEncoder().encode(content)
    );
    
    // Generate search tokens
    const searchTokens = await this.generateSearchTokens(
      { message, data },
      this.searchKey,
      this.tenantId
    );
    
    return {
      iv: arrayBufferToBase64(iv),
      encryptedContent: arrayBufferToBase64(encryptedContent),
      searchTokens,
      tenantId: this.tenantId
    };
  }
}
```

### API Key Verification

```typescript
// TypeScript - internal SDK implementation
class ApiKeyVerifier {
  private async generateApiKeyVerification(apiKey: string): Promise<string> {
    // Generate a verification hash that doesn't reveal the API key
    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      keyData,
      encoder.encode(`${this.tenantId}:${Date.now()}`)
    );
    
    return arrayBufferToBase64(signature);
  }
}
```

## Getting Started

1. **Sign up** for NeuralLog at [neurallog.com](https://neurallog.com)
2. **Create a tenant** in the NeuralLog dashboard
3. **Generate an API key** for your application
4. **Install the SDK** for your programming language
5. **Initialize the logger** with your API key and tenant ID
6. **Start logging** with zero-knowledge security

## Resources

- [SDK Documentation](https://docs.neurallog.com/sdk)
- [API Reference](https://docs.neurallog.com/api)
- [Example Projects](https://github.com/neurallog/examples)
- [Security Best Practices](https://docs.neurallog.com/security)
- [Performance Optimization](https://docs.neurallog.com/performance)
