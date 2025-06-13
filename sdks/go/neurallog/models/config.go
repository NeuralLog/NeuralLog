package models

import "time"

// Config represents the configuration for the NeuralLog SDK.
type Config struct {
	ServerURL      string
	Namespace      string
	APIKey         string
	AsyncEnabled   bool
	BatchSize      int
	BatchInterval  time.Duration
	MaxRetries     int
	RetryBackoff   time.Duration
	DebugEnabled   bool
	Timeout        time.Duration
	MaxConnections int
	Headers        map[string]string
}

// ConfigOption is a function that configures a Config.
type ConfigOption func(*Config)

// WithServerURL sets the server URL for the configuration.
func WithServerURL(url string) ConfigOption {
	return func(config *Config) {
		config.ServerURL = url
	}
}

// WithNamespace sets the namespace for the configuration.
func WithNamespace(namespace string) ConfigOption {
	return func(config *Config) {
		config.Namespace = namespace
	}
}

// WithAPIKey sets the API key for the configuration.
func WithAPIKey(apiKey string) ConfigOption {
	return func(config *Config) {
		config.APIKey = apiKey
	}
}

// WithAsyncEnabled sets whether async logging is enabled for the configuration.
func WithAsyncEnabled(enabled bool) ConfigOption {
	return func(config *Config) {
		config.AsyncEnabled = enabled
	}
}

// WithBatchSize sets the batch size for the configuration.
func WithBatchSize(size int) ConfigOption {
	return func(config *Config) {
		config.BatchSize = size
	}
}

// WithBatchInterval sets the batch interval for the configuration.
func WithBatchInterval(interval time.Duration) ConfigOption {
	return func(config *Config) {
		config.BatchInterval = interval
	}
}

// WithMaxRetries sets the maximum number of retries for the configuration.
func WithMaxRetries(retries int) ConfigOption {
	return func(config *Config) {
		config.MaxRetries = retries
	}
}

// WithRetryBackoff sets the retry backoff duration for the configuration.
func WithRetryBackoff(backoff time.Duration) ConfigOption {
	return func(config *Config) {
		config.RetryBackoff = backoff
	}
}

// WithDebugEnabled sets whether debug logging is enabled for the configuration.
func WithDebugEnabled(enabled bool) ConfigOption {
	return func(config *Config) {
		config.DebugEnabled = enabled
	}
}

// WithTimeout sets the timeout duration for the configuration.
func WithTimeout(timeout time.Duration) ConfigOption {
	return func(config *Config) {
		config.Timeout = timeout
	}
}

// WithMaxConnections sets the maximum number of connections for the configuration.
func WithMaxConnections(connections int) ConfigOption {
	return func(config *Config) {
		config.MaxConnections = connections
	}
}

// WithHeaders sets the headers for the configuration.
func WithHeaders(headers map[string]string) ConfigOption {
	return func(config *Config) {
		config.Headers = headers
	}
}

// NewConfig creates a new configuration with default values.
func NewConfig(opts ...ConfigOption) *Config {
	config := &Config{
		ServerURL:      "http://localhost:3030",
		Namespace:      "default",
		APIKey:         "",
		AsyncEnabled:   true,
		BatchSize:      100,
		BatchInterval:  5 * time.Second,
		MaxRetries:     3,
		RetryBackoff:   time.Second,
		DebugEnabled:   false,
		Timeout:        30 * time.Second,
		MaxConnections: 10,
		Headers:        make(map[string]string),
	}

	for _, opt := range opts {
		opt(config)
	}

	return config
}
