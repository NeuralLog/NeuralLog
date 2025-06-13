---
sidebar_position: 3
---

# Java SDK

The NeuralLog Java SDK provides a type-safe, feature-rich client for integrating zero-knowledge logging into Java applications.

## Installation

Add the NeuralLog Java SDK to your project:

### Maven

```xml
<dependency>
    <groupId>com.neurallog</groupId>
    <artifactId>neurallog-client-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```gradle
implementation 'com.neurallog:neurallog-client-sdk:1.0.0'
```

## Quick Start

```java
import com.neurallog.client.NeuralLogClient;
import com.neurallog.client.NeuralLogConfig;

// Initialize the client
NeuralLogConfig config = NeuralLogConfig.builder()
    .apiKey("your-api-key")
    .baseUrl("https://api.neurallog.com")
    .build();

NeuralLogClient client = new NeuralLogClient(config);

// Create a log
client.logs().createLog("application-logs", Map.of(
    "level", "info",
    "message", "Application started successfully",
    "timestamp", Instant.now().toString()
)).join();
```

## Documentation Status

This SDK is currently in development. For more information about the implementation roadmap, see the [Java SDK Development Guide](../../development/java-sdk-development.md).

## Features

- Type-safe API
- Asynchronous operations with CompletableFuture
- Integration with popular Java logging frameworks
- Client-side encryption
- Zero-knowledge architecture

## Examples

Coming soon - comprehensive examples and integration guides.
