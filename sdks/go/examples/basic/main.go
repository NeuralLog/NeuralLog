package main

import (
	"errors"
	"time"

	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/models"
)

func main() {
	// Configure NeuralLog
	neurallog.Configure(
		neurallog.WithServerURL("http://localhost:3030"),
		neurallog.WithAPIKey("your-api-key"),
		neurallog.WithNamespace("default"),
		neurallog.WithAsyncEnabled(true),
		neurallog.WithBatchSize(100),
		neurallog.WithBatchInterval(models.WithBatchInterval(5 * time.Second)),
		neurallog.WithDebugEnabled(true),
	)

	// Set global context
	neurallog.SetGlobalContext(map[string]interface{}{
		"app":         "example-app",
		"environment": "development",
	})

	// Get a logger
	logger := neurallog.GetLogger("example-log")

	// Log messages at different levels
	logger.Debug("This is a debug message")
	logger.Info("This is an info message")
	logger.Warning("This is a warning message")
	logger.Error("This is an error message")

	// Log with structured data
	logger.Info("User logged in", neurallog.WithData(map[string]interface{}{
		"user_id":  123,
		"username": "john.doe",
		"roles":    []string{"admin", "user"},
	}))

	// Log with exception
	err := errors.New("something went wrong")
	logger.Error("Operation failed", neurallog.WithException(err))

	// Set logger-specific context
	logger.SetContext(map[string]interface{}{
		"component": "auth-service",
	})

	// Log with context
	logger.Info("Service started")

	// Flush any pending logs
	neurallog.FlushAll()
}
