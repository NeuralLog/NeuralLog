package models

import (
	"testing"
	"time"
)

func TestNewConfig(t *testing.T) {
	// Test default config
	config := NewConfig()
	if config.ServerURL != "http://localhost:3030" {
		t.Errorf("Expected ServerURL 'http://localhost:3030', got '%s'", config.ServerURL)
	}
	if config.Namespace != "default" {
		t.Errorf("Expected Namespace 'default', got '%s'", config.Namespace)
	}
	if config.APIKey != "" {
		t.Errorf("Expected empty APIKey, got '%s'", config.APIKey)
	}
	if config.AsyncEnabled != true {
		t.Errorf("Expected AsyncEnabled true, got %v", config.AsyncEnabled)
	}
	if config.BatchSize != 100 {
		t.Errorf("Expected BatchSize 100, got %d", config.BatchSize)
	}
	if config.BatchInterval != 5*time.Second {
		t.Errorf("Expected BatchInterval 5s, got %v", config.BatchInterval)
	}
	if config.MaxRetries != 3 {
		t.Errorf("Expected MaxRetries 3, got %d", config.MaxRetries)
	}
	if config.RetryBackoff != time.Second {
		t.Errorf("Expected RetryBackoff 1s, got %v", config.RetryBackoff)
	}
	if config.DebugEnabled != false {
		t.Errorf("Expected DebugEnabled false, got %v", config.DebugEnabled)
	}
	if config.Timeout != 30*time.Second {
		t.Errorf("Expected Timeout 30s, got %v", config.Timeout)
	}
	if config.MaxConnections != 10 {
		t.Errorf("Expected MaxConnections 10, got %d", config.MaxConnections)
	}
	if len(config.Headers) != 0 {
		t.Errorf("Expected empty Headers, got %v", config.Headers)
	}

	// Test with options
	config = NewConfig(
		WithServerURL("https://logs.example.com"),
		WithNamespace("production"),
		WithAPIKey("test-api-key"),
		WithAsyncEnabled(false),
		WithBatchSize(50),
		WithBatchInterval(10*time.Second),
		WithMaxRetries(5),
		WithRetryBackoff(2*time.Second),
		WithDebugEnabled(true),
		WithTimeout(60*time.Second),
		WithMaxConnections(20),
		WithHeaders(map[string]string{"X-Custom-Header": "value"}),
	)

	if config.ServerURL != "https://logs.example.com" {
		t.Errorf("Expected ServerURL 'https://logs.example.com', got '%s'", config.ServerURL)
	}
	if config.Namespace != "production" {
		t.Errorf("Expected Namespace 'production', got '%s'", config.Namespace)
	}
	if config.APIKey != "test-api-key" {
		t.Errorf("Expected APIKey 'test-api-key', got '%s'", config.APIKey)
	}
	if config.AsyncEnabled != false {
		t.Errorf("Expected AsyncEnabled false, got %v", config.AsyncEnabled)
	}
	if config.BatchSize != 50 {
		t.Errorf("Expected BatchSize 50, got %d", config.BatchSize)
	}
	if config.BatchInterval != 10*time.Second {
		t.Errorf("Expected BatchInterval 10s, got %v", config.BatchInterval)
	}
	if config.MaxRetries != 5 {
		t.Errorf("Expected MaxRetries 5, got %d", config.MaxRetries)
	}
	if config.RetryBackoff != 2*time.Second {
		t.Errorf("Expected RetryBackoff 2s, got %v", config.RetryBackoff)
	}
	if config.DebugEnabled != true {
		t.Errorf("Expected DebugEnabled true, got %v", config.DebugEnabled)
	}
	if config.Timeout != 60*time.Second {
		t.Errorf("Expected Timeout 60s, got %v", config.Timeout)
	}
	if config.MaxConnections != 20 {
		t.Errorf("Expected MaxConnections 20, got %d", config.MaxConnections)
	}
	if config.Headers["X-Custom-Header"] != "value" {
		t.Errorf("Expected Headers['X-Custom-Header'] = 'value', got '%s'", config.Headers["X-Custom-Header"])
	}
}

func TestConfigOptions(t *testing.T) {
	// Test each option individually
	config := NewConfig()

	// WithServerURL
	WithServerURL("https://logs.example.com")(config)
	if config.ServerURL != "https://logs.example.com" {
		t.Errorf("Expected ServerURL 'https://logs.example.com', got '%s'", config.ServerURL)
	}

	// WithNamespace
	WithNamespace("production")(config)
	if config.Namespace != "production" {
		t.Errorf("Expected Namespace 'production', got '%s'", config.Namespace)
	}

	// WithAPIKey
	WithAPIKey("test-api-key")(config)
	if config.APIKey != "test-api-key" {
		t.Errorf("Expected APIKey 'test-api-key', got '%s'", config.APIKey)
	}

	// WithAsyncEnabled
	WithAsyncEnabled(false)(config)
	if config.AsyncEnabled != false {
		t.Errorf("Expected AsyncEnabled false, got %v", config.AsyncEnabled)
	}

	// WithBatchSize
	WithBatchSize(50)(config)
	if config.BatchSize != 50 {
		t.Errorf("Expected BatchSize 50, got %d", config.BatchSize)
	}

	// WithBatchInterval
	WithBatchInterval(10 * time.Second)(config)
	if config.BatchInterval != 10*time.Second {
		t.Errorf("Expected BatchInterval 10s, got %v", config.BatchInterval)
	}

	// WithMaxRetries
	WithMaxRetries(5)(config)
	if config.MaxRetries != 5 {
		t.Errorf("Expected MaxRetries 5, got %d", config.MaxRetries)
	}

	// WithRetryBackoff
	WithRetryBackoff(2 * time.Second)(config)
	if config.RetryBackoff != 2*time.Second {
		t.Errorf("Expected RetryBackoff 2s, got %v", config.RetryBackoff)
	}

	// WithDebugEnabled
	WithDebugEnabled(true)(config)
	if config.DebugEnabled != true {
		t.Errorf("Expected DebugEnabled true, got %v", config.DebugEnabled)
	}

	// WithTimeout
	WithTimeout(60 * time.Second)(config)
	if config.Timeout != 60*time.Second {
		t.Errorf("Expected Timeout 60s, got %v", config.Timeout)
	}

	// WithMaxConnections
	WithMaxConnections(20)(config)
	if config.MaxConnections != 20 {
		t.Errorf("Expected MaxConnections 20, got %d", config.MaxConnections)
	}

	// WithHeaders
	WithHeaders(map[string]string{"X-Custom-Header": "value"})(config)
	if config.Headers["X-Custom-Header"] != "value" {
		t.Errorf("Expected Headers['X-Custom-Header'] = 'value', got '%s'", config.Headers["X-Custom-Header"])
	}
}
