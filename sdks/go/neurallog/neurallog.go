package neurallog

import (
	"sync"

	"github.com/NeuralLog/go-sdk/neurallog/models"
)

var (
	// Global configuration
	globalConfig = models.NewConfig()

	// Global loggers
	loggers     = make(map[string]Logger)
	loggerMutex sync.RWMutex

	// Global context
	globalContext     = make(map[string]interface{})
	globalContextLock sync.RWMutex
)

// NeuralLogOption is a function that configures the global NeuralLog instance.
type NeuralLogOption func()

// WithServerURL sets the server URL for the global configuration.
func WithServerURL(url string) NeuralLogOption {
	return func() {
		models.WithServerURL(url)(globalConfig)
	}
}

// WithNamespace sets the namespace for the global configuration.
func WithNamespace(namespace string) NeuralLogOption {
	return func() {
		models.WithNamespace(namespace)(globalConfig)
	}
}

// WithAPIKey sets the API key for the global configuration.
func WithAPIKey(apiKey string) NeuralLogOption {
	return func() {
		models.WithAPIKey(apiKey)(globalConfig)
	}
}

// WithAsyncEnabled sets whether async logging is enabled for the global configuration.
func WithAsyncEnabled(enabled bool) NeuralLogOption {
	return func() {
		models.WithAsyncEnabled(enabled)(globalConfig)
	}
}

// WithBatchSize sets the batch size for the global configuration.
func WithBatchSize(size int) NeuralLogOption {
	return func() {
		models.WithBatchSize(size)(globalConfig)
	}
}

// WithBatchInterval sets the batch interval for the global configuration.
func WithBatchInterval(interval models.ConfigOption) NeuralLogOption {
	return func() {
		interval(globalConfig)
	}
}

// WithMaxRetries sets the maximum number of retries for the global configuration.
func WithMaxRetries(retries int) NeuralLogOption {
	return func() {
		models.WithMaxRetries(retries)(globalConfig)
	}
}

// WithRetryBackoff sets the retry backoff duration for the global configuration.
func WithRetryBackoff(interval models.ConfigOption) NeuralLogOption {
	return func() {
		interval(globalConfig)
	}
}

// WithDebugEnabled sets whether debug logging is enabled for the global configuration.
func WithDebugEnabled(enabled bool) NeuralLogOption {
	return func() {
		models.WithDebugEnabled(enabled)(globalConfig)
	}
}

// WithTimeout sets the timeout duration for the global configuration.
func WithTimeout(interval models.ConfigOption) NeuralLogOption {
	return func() {
		interval(globalConfig)
	}
}

// WithMaxConnections sets the maximum number of connections for the global configuration.
func WithMaxConnections(connections int) NeuralLogOption {
	return func() {
		models.WithMaxConnections(connections)(globalConfig)
	}
}

// WithHeaders sets the headers for the global configuration.
func WithHeaders(headers map[string]string) NeuralLogOption {
	return func() {
		models.WithHeaders(headers)(globalConfig)
	}
}

// WithGlobalConfig sets the global configuration.
func WithGlobalConfig(config *models.Config) NeuralLogOption {
	return func() {
		globalConfig = config
	}
}

// Configure configures the global NeuralLog instance.
func Configure(opts ...NeuralLogOption) {
	for _, opt := range opts {
		opt()
	}
}

// GetConfig returns the global configuration.
func GetConfig() *models.Config {
	return globalConfig
}

// GetLogger returns a logger with the specified name.
func GetLogger(logName string) Logger {
	loggerMutex.RLock()
	logger, ok := loggers[logName]
	loggerMutex.RUnlock()

	if ok {
		return logger
	}

	loggerMutex.Lock()
	defer loggerMutex.Unlock()

	// Check again in case another goroutine created the logger
	logger, ok = loggers[logName]
	if ok {
		return logger
	}

	// Create a new logger
	logger = NewAILogger(logName, WithConfig(globalConfig))

	// Apply global context
	globalContextLock.RLock()
	if len(globalContext) > 0 {
		logger.SetContext(globalContext)
	}
	globalContextLock.RUnlock()

	// Store the logger
	loggers[logName] = logger

	return logger
}

// SetGlobalContext sets the global context data for all loggers.
func SetGlobalContext(context map[string]interface{}) {
	// Update global context
	globalContextLock.Lock()
	globalContext = make(map[string]interface{})
	for k, v := range context {
		globalContext[k] = v
	}
	globalContextLock.Unlock()

	// Update existing loggers
	loggerMutex.RLock()
	defer loggerMutex.RUnlock()

	for _, logger := range loggers {
		logger.SetContext(context)
	}
}

// FlushAll flushes all loggers.
func FlushAll() {
	loggerMutex.RLock()
	defer loggerMutex.RUnlock()

	for _, logger := range loggers {
		logger.Flush()
	}
}
