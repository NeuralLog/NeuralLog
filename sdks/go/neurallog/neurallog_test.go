package neurallog

import (
	"testing"

	"github.com/NeuralLog/go-sdk/neurallog/models"
)

func TestConfigure(t *testing.T) {
	// Test with default config
	Configure()
	config := GetConfig()
	if config.ServerURL != "http://localhost:3030" {
		t.Errorf("Expected ServerURL 'http://localhost:3030', got '%s'", config.ServerURL)
	}

	// Test with custom config
	customConfig := models.NewConfig(
		models.WithServerURL("https://logs.example.com"),
		models.WithNamespace("production"),
	)
	Configure(WithGlobalConfig(customConfig))
	config = GetConfig()
	if config.ServerURL != "https://logs.example.com" {
		t.Errorf("Expected ServerURL 'https://logs.example.com', got '%s'", config.ServerURL)
	}
	if config.Namespace != "production" {
		t.Errorf("Expected Namespace 'production', got '%s'", config.Namespace)
	}

	// Test with individual options
	Configure(
		WithServerURL("https://logs2.example.com"),
		WithNamespace("staging"),
	)
	config = GetConfig()
	if config.ServerURL != "https://logs2.example.com" {
		t.Errorf("Expected ServerURL 'https://logs2.example.com', got '%s'", config.ServerURL)
	}
	if config.Namespace != "staging" {
		t.Errorf("Expected Namespace 'staging', got '%s'", config.Namespace)
	}
}

func TestGetLogger(t *testing.T) {
	// Reset configuration
	Configure()

	// Get a logger
	logger := GetLogger("test-log")
	if logger == nil {
		t.Error("Expected non-nil logger")
	}
	aiLogger, ok := logger.(*AILogger)
	if !ok {
		t.Fatalf("Expected *AILogger, got %T", logger)
	}
	if aiLogger.LogName() != "test-log" {
		t.Errorf("Expected logName 'test-log', got '%s'", aiLogger.LogName())
	}

	// Get the same logger again (should be cached)
	logger2 := GetLogger("test-log")
	if logger != logger2 {
		t.Error("Expected the same logger instance")
	}

	// Get a different logger
	logger3 := GetLogger("other-log")
	if logger == logger3 {
		t.Error("Expected different logger instances")
	}
	aiLogger3, ok := logger3.(*AILogger)
	if !ok {
		t.Fatalf("Expected *AILogger, got %T", logger3)
	}
	if aiLogger3.LogName() != "other-log" {
		t.Errorf("Expected logName 'other-log', got '%s'", aiLogger3.LogName())
	}
}

func TestSetGlobalContext(t *testing.T) {
	// Reset configuration
	Configure()

	// Create two loggers
	logger1 := GetLogger("log1")
	logger2 := GetLogger("log2")

	// Set global context
	context := map[string]interface{}{
		"app":         "test-app",
		"environment": "test",
	}
	SetGlobalContext(context)

	// Check that both loggers have the context
	aiLogger1, ok := logger1.(*AILogger)
	if !ok {
		t.Fatalf("Expected *AILogger, got %T", logger1)
	}
	if aiLogger1.context["app"] != "test-app" {
		t.Errorf("Expected logger1.context['app'] = 'test-app', got %v", aiLogger1.context["app"])
	}
	if aiLogger1.context["environment"] != "test" {
		t.Errorf("Expected logger1.context['environment'] = 'test', got %v", aiLogger1.context["environment"])
	}
	aiLogger2, ok := logger2.(*AILogger)
	if !ok {
		t.Fatalf("Expected *AILogger, got %T", logger2)
	}
	if aiLogger2.context["app"] != "test-app" {
		t.Errorf("Expected logger2.context['app'] = 'test-app', got %v", aiLogger2.context["app"])
	}
	if aiLogger2.context["environment"] != "test" {
		t.Errorf("Expected logger2.context['environment'] = 'test', got %v", aiLogger2.context["environment"])
	}

	// Update global context
	context["app"] = "updated-app"
	SetGlobalContext(context)

	// Check that both loggers have the updated context
	if aiLogger1.context["app"] != "updated-app" {
		t.Errorf("Expected logger1.context['app'] = 'updated-app', got %v", aiLogger1.context["app"])
	}
	if aiLogger2.context["app"] != "updated-app" {
		t.Errorf("Expected logger2.context['app'] = 'updated-app', got %v", aiLogger2.context["app"])
	}

	// New loggers should also have the context
	logger3 := GetLogger("log3")
	aiLogger3, ok := logger3.(*AILogger)
	if !ok {
		t.Fatalf("Expected *AILogger, got %T", logger3)
	}
	if aiLogger3.context["app"] != "updated-app" {
		t.Errorf("Expected logger3.context['app'] = 'updated-app', got %v", aiLogger3.context["app"])
	}
	if aiLogger3.context["environment"] != "test" {
		t.Errorf("Expected logger3.context['environment'] = 'test', got %v", aiLogger3.context["environment"])
	}
}

func TestFlushAll(t *testing.T) {
	// Reset configuration
	Configure()

	// Create two loggers
	logger1 := GetLogger("log1")
	logger2 := GetLogger("log2")

	aiLogger1, ok := logger1.(*AILogger)
	if !ok {
		t.Fatalf("Expected *AILogger, got %T", logger1)
	}

	aiLogger2, ok := logger2.(*AILogger)
	if !ok {
		t.Fatalf("Expected *AILogger, got %T", logger2)
	}

	// Mock the flush method
	flushed1 := false
	flushed2 := false
	originalFlush1 := aiLogger1.flushFunc
	originalFlush2 := aiLogger2.flushFunc
	aiLogger1.flushFunc = func() {
		flushed1 = true
	}
	aiLogger2.flushFunc = func() {
		flushed2 = true
	}

	// Call FlushAll
	FlushAll()

	// Check that both loggers were flushed
	if !flushed1 {
		t.Error("Expected logger1 to be flushed")
	}
	if !flushed2 {
		t.Error("Expected logger2 to be flushed")
	}

	// Restore original flush methods
	aiLogger1.flushFunc = originalFlush1
	aiLogger2.flushFunc = originalFlush2
}
