# NeuralLog SDK: Universal Logger Integration

NeuralLog's SDK is designed to seamlessly integrate with existing logging systems across all major programming languages. This document explains how NeuralLog provides drop-in replacements for popular logging frameworks, enabling zero-knowledge telemetry with minimal code changes.

## Universal Logger Integration

### The NeuralLog Approach

NeuralLog takes a unique approach to logger integration:

1. **Native Adapters**: Purpose-built adapters for every major logging framework
2. **Drop-in Replacements**: Minimal code changes required for integration
3. **Familiar APIs**: Maintains the same API as the original logger
4. **Zero-Knowledge by Default**: All adapters implement end-to-end encryption
5. **Open Source Reference Implementations**: All adapters are open source and extensible

### Supported Languages and Frameworks

NeuralLog provides native adapters for all major logging frameworks across languages:

| Language | Supported Frameworks |
|----------|----------------------|
| JavaScript/TypeScript | Winston, Bunyan, Pino, Morgan, console |
| Python | logging, loguru, structlog, python-json-logger |
| Java | Log4j, Logback, SLF4J, java.util.logging |
| C# | Serilog, NLog, log4net, Microsoft.Extensions.Logging |
| Go | zap, logrus, zerolog, standard log |
| Ruby | Logger, Logging, Fluentd |
| PHP | Monolog, PSR-3, error_log |
| Rust | log, slog, tracing, env_logger |
| Kotlin | kotlin-logging, SLF4J |
| Swift | SwiftyBeaver, CocoaLumberjack, os.log |

## JavaScript/TypeScript Integration

### Winston Integration

```javascript
// Install: npm install winston @neurallog/winston-transport

const winston = require('winston');
const { NeuralLogTransport } = require('@neurallog/winston-transport');

// Create a Winston logger with NeuralLog transport
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    // Console transport for local debugging
    new winston.transports.Console(),
    
    // NeuralLog transport for secure, zero-knowledge logging
    new NeuralLogTransport({
      apiKey: process.env.NEURALLOG_API_KEY,
      tenantId: 'your-tenant',
      source: 'payment-service',
      level: 'info',
      // Optional: additional configuration
      batch: { size: 50, intervalMs: 5000 },
      encryption: { algorithm: 'AES-256-GCM' }
    })
  ]
});

// Use the logger as normal
logger.info('Payment processed', { orderId: '12345', amount: 99.99 });
logger.error('Payment failed', { orderId: '12345', error: 'Insufficient funds' });
```

### Pino Integration

```javascript
// Install: npm install pino @neurallog/pino-transport

const pino = require('pino');

// Create a Pino logger with NeuralLog transport
const logger = pino({
  level: 'info',
  transport: {
    target: '@neurallog/pino-transport',
    options: {
      apiKey: process.env.NEURALLOG_API_KEY,
      tenantId: 'your-tenant',
      source: 'inventory-service'
    }
  }
});

// Use the logger as normal
logger.info({ productId: 'prod-123', quantity: 50 }, 'Product inventory updated');
logger.error({ productId: 'prod-456', error: 'Database timeout' }, 'Inventory update failed');
```

### Express.js Middleware

```javascript
// Install: npm install express @neurallog/express-middleware

const express = require('express');
const { neuralLogMiddleware } = require('@neurallog/express-middleware');

const app = express();

// Add NeuralLog middleware
app.use(neuralLogMiddleware({
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
  // The middleware automatically logs the request
  res.json({ id: req.params.id, name: 'John Doe' });
  // The middleware automatically logs the response
});

app.listen(3000);
```

## Python Integration

### Standard Logging Integration

```python
# Install: pip install neurallog-python

import logging
from neurallog.handlers import NeuralLogHandler

# Configure the Python logging module with NeuralLog handler
logger = logging.getLogger("my-application")
logger.setLevel(logging.INFO)

# Add NeuralLog handler
neurallog_handler = NeuralLogHandler(
    api_key=os.environ.get("NEURALLOG_API_KEY"),
    tenant_id="your-tenant",
    source="recommendation-engine"
)
logger.addHandler(neurallog_handler)

# Use the logger as normal
logger.info("Recommendations generated", extra={
    "user_id": "123",
    "count": 5,
    "algorithm": "collaborative-filtering"
})

logger.error("Failed to generate recommendations", extra={
    "user_id": "789",
    "error": "Data unavailable",
    "fallback": "used-cached"
})
```

### Loguru Integration

```python
# Install: pip install loguru neurallog-python

from loguru import logger
from neurallog.loguru import setup_neurallog

# Configure Loguru with NeuralLog
setup_neurallog(
    api_key=os.environ.get("NEURALLOG_API_KEY"),
    tenant_id="your-tenant",
    source="data-pipeline"
)

# Use Loguru as normal
logger.info("Processing started", job_id=123, batch_size=500)
logger.error("Processing failed", job_id=123, error="Database connection lost")
```

### Flask Integration

```python
# Install: pip install flask neurallog-python

from flask import Flask
from neurallog.flask import NeuralLogMiddleware
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
    # The middleware automatically logs the request
    return {"id": user_id, "name": "John Doe"}
    # The middleware automatically logs the response
```

## Java Integration

### Log4j2 Integration

```java
// Add to pom.xml:
// <dependency>
//   <groupId>com.neurallog</groupId>
//   <artifactId>neurallog-log4j2</artifactId>
//   <version>1.0.0</version>
// </dependency>

// log4j2.xml configuration
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
  <Appenders>
    <Console name="Console" target="SYSTEM_OUT">
      <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
    </Console>
    <NeuralLog name="NeuralLog"
               apiKey="${env:NEURALLOG_API_KEY}"
               tenantId="your-tenant"
               source="order-service">
      <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
    </NeuralLog>
  </Appenders>
  <Loggers>
    <Root level="info">
      <AppenderRef ref="Console"/>
      <AppenderRef ref="NeuralLog"/>
    </Root>
  </Loggers>
</Configuration>

// Java code
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.ThreadContext;

public class OrderService {
    private static final Logger logger = LogManager.getLogger(OrderService.class);
    
    public void processOrder(String orderId, double amount) {
        // Add context to logs
        ThreadContext.put("orderId", orderId);
        ThreadContext.put("amount", String.valueOf(amount));
        
        try {
            logger.info("Processing order");
            // Order processing logic
            logger.info("Order processed successfully");
        } catch (Exception e) {
            logger.error("Order processing failed", e);
        } finally {
            // Clear context
            ThreadContext.clearAll();
        }
    }
}
```

### Logback Integration

```java
// Add to pom.xml:
// <dependency>
//   <groupId>com.neurallog</groupId>
//   <artifactId>neurallog-logback</artifactId>
//   <version>1.0.0</version>
// </dependency>

// logback.xml configuration
<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>
  
  <appender name="NEURALLOG" class="com.neurallog.logback.NeuralLogAppender">
    <apiKey>${NEURALLOG_API_KEY}</apiKey>
    <tenantId>your-tenant</tenantId>
    <source>user-service</source>
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>
  
  <root level="info">
    <appender-ref ref="CONSOLE" />
    <appender-ref ref="NEURALLOG" />
  </root>
</configuration>

// Java code
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    public void createUser(String userId, String email) {
        // Add context to logs
        MDC.put("userId", userId);
        MDC.put("email", email);
        
        try {
            logger.info("Creating user");
            // User creation logic
            logger.info("User created successfully");
        } catch (Exception e) {
            logger.error("User creation failed", e);
        } finally {
            // Clear context
            MDC.clear();
        }
    }
}
```

### Spring Boot Integration

```java
// Add to pom.xml:
// <dependency>
//   <groupId>com.neurallog</groupId>
//   <artifactId>neurallog-spring-boot-starter</artifactId>
//   <version>1.0.0</version>
// </dependency>

// application.properties or application.yml
neurallog:
  api-key: ${NEURALLOG_API_KEY}
  tenant-id: your-tenant
  source: inventory-service
  batch:
    enabled: true
    size: 50
    interval-ms: 5000
  encryption:
    algorithm: AES-256-GCM

// Java code
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class InventoryApplication {
    private static final Logger logger = LoggerFactory.getLogger(InventoryApplication.class);
    
    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
        logger.info("Inventory service started");
    }
}
```

## C# / .NET Integration

### Serilog Integration

```csharp
// Install: dotnet add package NeuralLog.Serilog

using Serilog;
using NeuralLog.Serilog;

// Configure Serilog with NeuralLog sink
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.NeuralLog(
        apiKey: Environment.GetEnvironmentVariable("NEURALLOG_API_KEY"),
        tenantId: "your-tenant",
        source: "payment-service"
    )
    .Enrich.WithProperty("Application", "PaymentProcessor")
    .CreateLogger();

// Use the logger as normal
Log.Information("Payment processed for {OrderId} with amount {Amount}", "order-123", 99.99);
Log.Error("Payment failed for {OrderId} with error {Error}", "order-456", "Insufficient funds");
```

### ASP.NET Core Integration

```csharp
// Install: dotnet add package NeuralLog.AspNetCore

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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

app.MapGet("/users/{userId}", (string userId, ILogger<Program> logger) =>
{
    logger.LogInformation("Fetching user {UserId}", userId);
    return Results.Ok(new { Id = userId, Name = "John Doe" });
});

app.Run();
```

## Go Integration

### Zap Integration

```go
// Install: go get github.com/neurallog/zap-neurallog

package main

import (
    "os"
    
    "go.uber.org/zap"
    neurallogzap "github.com/neurallog/zap-neurallog"
)

func main() {
    // Create a NeuralLog core for zap
    neurallogCore, err := neurallogzap.NewCore(neurallogzap.Config{
        APIKey:   os.Getenv("NEURALLOG_API_KEY"),
        TenantID: "your-tenant",
        Source:   "auth-service",
    })
    if err != nil {
        panic(err)
    }
    
    // Create a logger with both console and NeuralLog outputs
    logger := zap.New(
        zap.NewTee(
            zap.NewDevelopmentCore(),
            neurallogCore,
        ),
    )
    defer logger.Sync()
    
    // Use the logger as normal
    logger.Info("User authenticated",
        zap.String("userId", "user-123"),
        zap.String("method", "oauth"),
        zap.String("provider", "google"),
    )
    
    logger.Error("Authentication failed",
        zap.String("userId", "user-456"),
        zap.String("error", "Invalid credentials"),
        zap.Int("attempts", 3),
    )
}
```

### Logrus Integration

```go
// Install: go get github.com/neurallog/logrus-neurallog

package main

import (
    "os"
    
    "github.com/sirupsen/logrus"
    neurallogrus "github.com/neurallog/logrus-neurallog"
)

func main() {
    // Create a new logrus logger
    logger := logrus.New()
    
    // Add NeuralLog hook
    hook, err := neurallogrus.NewHook(neurallogrus.Config{
        APIKey:   os.Getenv("NEURALLOG_API_KEY"),
        TenantID: "your-tenant",
        Source:   "payment-service",
    })
    if err != nil {
        logger.Fatal(err)
    }
    logger.AddHook(hook)
    
    // Use the logger as normal
    logger.WithFields(logrus.Fields{
        "orderId": "order-123",
        "amount":  99.99,
        "method":  "credit-card",
    }).Info("Payment processed")
    
    logger.WithFields(logrus.Fields{
        "orderId": "order-456",
        "error":   "Insufficient funds",
        "method":  "credit-card",
    }).Error("Payment failed")
}
```

## Ruby Integration

### Ruby Logger Integration

```ruby
# Install: gem install neurallog-ruby

require 'logger'
require 'neurallog/logger'

# Create a NeuralLog logger
logger = NeuralLog::Logger.new(
  api_key: ENV['NEURALLOG_API_KEY'],
  tenant_id: 'your-tenant',
  source: 'order-service'
)

# Use the logger as normal
logger.info('Order created') { { order_id: 'order-123', customer_id: 'cust-456', total: 99.99 } }
logger.error('Order processing failed') { { order_id: 'order-123', error: 'Payment declined' } }
```

### Rails Integration

```ruby
# Install: gem install neurallog-rails

# config/initializers/neurallog.rb
require 'neurallog/rails'

NeuralLog::Rails.configure do |config|
  config.api_key = ENV['NEURALLOG_API_KEY']
  config.tenant_id = 'your-tenant'
  config.source = 'e-commerce-app'
  config.log_requests = true
  config.log_responses = true
  config.exclude_headers = ['authorization', 'cookie']
  config.exclude_params = ['password', 'credit_card']
end
```

## PHP Integration

### Monolog Integration

```php
// Install: composer require neurallog/monolog-handler

<?php

require 'vendor/autoload.php';

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use NeuralLog\Monolog\NeuralLogHandler;

// Create a logger
$logger = new Logger('app');

// Add a handler that writes to standard output
$logger->pushHandler(new StreamHandler('php://stdout', Logger::DEBUG));

// Add NeuralLog handler
$logger->pushHandler(new NeuralLogHandler(
    getenv('NEURALLOG_API_KEY'),
    'your-tenant',
    'order-service',
    Logger::INFO
));

// Use the logger as normal
$logger->info('Order created', [
    'order_id' => 'order-123',
    'customer_id' => 'cust-456',
    'total' => 99.99
]);

$logger->error('Order processing failed', [
    'order_id' => 'order-123',
    'error' => 'Payment declined',
    'error_code' => 'PAYMENT-001'
]);
```

### Laravel Integration

```php
// Install: composer require neurallog/laravel

// config/neurallog.php
<?php

return [
    'api_key' => env('NEURALLOG_API_KEY'),
    'tenant_id' => 'your-tenant',
    'source' => 'e-commerce-app',
    'log_requests' => true,
    'log_responses' => true,
    'exclude_headers' => ['authorization', 'cookie'],
    'exclude_inputs' => ['password', 'credit_card'],
];

// Usage in controllers
public function processOrder(Request $request)
{
    Log::info('Processing order', [
        'order_id' => $request->order_id,
        'amount' => $request->amount
    ]);
    
    try {
        // Order processing logic
        
        Log::info('Order processed successfully', [
            'order_id' => $request->order_id
        ]);
        
        return response()->json(['status' => 'success']);
    } catch (\Exception $e) {
        Log::error('Order processing failed', [
            'order_id' => $request->order_id,
            'error' => $e->getMessage()
        ]);
        
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}
```

## Rust Integration

### log Crate Integration

```rust
// Add to Cargo.toml:
// [dependencies]
// log = "0.4"
// neurallog = "1.0"

use log::{info, error, LevelFilter};
use neurallog::NeuralLogLogger;

fn main() {
    // Initialize the NeuralLog logger
    NeuralLogLogger::init(
        std::env::var("NEURALLOG_API_KEY").expect("NEURALLOG_API_KEY not set"),
        "your-tenant".to_string(),
        "payment-service".to_string(),
        LevelFilter::Info,
    ).expect("Failed to initialize logger");
    
    // Use the logger as normal
    info!("Payment processed: order_id={}, amount={}", "order-123", 99.99);
    error!("Payment failed: order_id={}, error={}", "order-456", "Insufficient funds");
}
```

### tracing Integration

```rust
// Add to Cargo.toml:
// [dependencies]
// tracing = "0.1"
// neurallog-tracing = "1.0"

use tracing::{info, error, instrument};
use neurallog_tracing::NeuralLogTracing;

#[instrument]
fn process_payment(order_id: &str, amount: f64) {
    info!(order_id = order_id, amount = amount, "Processing payment");
    
    // Payment processing logic
    
    if amount > 1000.0 {
        error!(order_id = order_id, amount = amount, "Payment amount exceeds limit");
        return;
    }
    
    info!(order_id = order_id, "Payment processed successfully");
}

fn main() {
    // Initialize the NeuralLog tracing subscriber
    NeuralLogTracing::init(
        std::env::var("NEURALLOG_API_KEY").expect("NEURALLOG_API_KEY not set"),
        "your-tenant".to_string(),
        "payment-service".to_string(),
    ).expect("Failed to initialize tracing");
    
    // Use tracing as normal
    process_payment("order-123", 99.99);
}
```

## Extending NeuralLog with Custom Adapters

All NeuralLog adapters are open source, making it easy to extend them for custom logging frameworks or specific requirements.

### Creating a Custom Adapter

```javascript
// Example: Creating a custom adapter for a proprietary logging system

const { NeuralLogClient } = require('@neurallog/sdk');

class CustomLoggerAdapter {
  constructor(options) {
    this.neurallog = new NeuralLogClient({
      apiKey: options.apiKey,
      tenantId: options.tenantId,
      source: options.source
    });
    
    // Initialize your custom logger
    this.originalLogger = options.originalLogger;
    
    // Monkey patch the original logger methods
    this.patchLoggerMethods();
  }
  
  patchLoggerMethods() {
    const originalLog = this.originalLogger.log;
    const neurallog = this.neurallog;
    
    this.originalLogger.log = function(level, message, metadata) {
      // Call the original logger
      originalLog.call(this, level, message, metadata);
      
      // Also log to NeuralLog
      neurallog.log({
        level,
        message,
        metadata,
        timestamp: new Date().toISOString()
      });
    };
  }
}

module.exports = CustomLoggerAdapter;
```

### Reference Implementation Structure

All NeuralLog adapters follow a consistent structure, making it easy to understand and extend them:

1. **Client Initialization**: Setting up the NeuralLog client with API key, tenant ID, etc.
2. **Adapter Logic**: Code that bridges between the original logger and NeuralLog
3. **Transformation Logic**: Converting log formats between systems
4. **Encryption Layer**: Implementing zero-knowledge encryption
5. **Batching Logic**: Optimizing log transmission
6. **Error Handling**: Graceful handling of failures

## Benefits of NeuralLog's Universal Logger Integration

### For Developers

1. **Minimal Code Changes**: Drop-in replacements for existing logging frameworks
2. **Familiar APIs**: Use the same logging patterns you're already familiar with
3. **Framework Flexibility**: Switch logging frameworks without changing NeuralLog integration
4. **Open Source**: Easily extend or customize adapters for specific needs

### For Organizations

1. **Standardized Logging**: Consistent logging across all applications and languages
2. **Zero-Knowledge Security**: End-to-end encryption for all logs regardless of source
3. **Comprehensive Coverage**: Support for all major languages and frameworks
4. **Future-Proof**: New adapters are continuously added for emerging frameworks

### For Security Teams

1. **Consistent Security Model**: Same zero-knowledge guarantees across all integrations
2. **Audit Trail**: Comprehensive tracking of all logging activities
3. **Compliance Support**: Helps meet regulatory requirements across all applications
4. **Reduced Attack Surface**: Minimizes exposure of sensitive data

## Getting Started with Logger Integration

1. **Choose Your Adapter**: Select the adapter for your logging framework
2. **Install the Package**: Add the NeuralLog adapter to your project
3. **Configure the Adapter**: Set up API key, tenant ID, and other options
4. **Start Logging**: Continue using your existing logging patterns

## Conclusion

NeuralLog's universal logger integration system provides a seamless way to add zero-knowledge telemetry to any application, regardless of programming language or logging framework. With drop-in replacements for all major logging systems and open-source reference implementations, NeuralLog makes it easy to enhance your existing applications with secure, privacy-preserving logging capabilities.
