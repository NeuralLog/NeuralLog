---
sidebar_position: 6
---

# Go SDK

The NeuralLog Go SDK provides an idiomatic Go interface for integrating zero-knowledge logging into Go applications.

## Installation

Install the NeuralLog Go SDK:

```bash
go get github.com/neurallog/go-sdk
```

## Quick Start

```go
package main

import (
    "context"
    "time"
    
    "github.com/neurallog/go-sdk/client"
)

func main() {
    // Initialize the client
    cfg := client.Config{
        APIKey:  "your-api-key",
        BaseURL: "https://api.neurallog.com",
    }
    
    client, err := client.New(cfg)
    if err != nil {
        panic(err)
    }
    
    // Create a log
    logData := map[string]interface{}{
        "level":     "info",
        "message":   "Application started successfully",
        "timestamp": time.Now().Format(time.RFC3339),
    }
    
    err = client.Logs.CreateLog(context.Background(), "application-logs", logData)
    if err != nil {
        panic(err)
    }
}
```

## Documentation Status

This SDK is currently in development. For more information about the implementation roadmap, see the Go SDK Development Guide.

## Features

- Idiomatic Go interfaces
- Context-aware operations
- Integration with popular Go logging libraries
- Client-side encryption
- Zero-knowledge architecture
- Go modules support

## Integration with Go Logging

```go
import (
    "github.com/neurallog/go-sdk/log"
    "github.com/sirupsen/logrus"
)

// Configure logrus with NeuralLog hook
logger := logrus.New()
hook := log.NewNeuralLogHook("your-api-key", "application-logs")
logger.AddHook(hook)

// Now logrus entries will be sent to NeuralLog
logger.Info("This will be encrypted and sent to NeuralLog")
```

## Examples

Coming soon - comprehensive examples and integration guides.
