package adapters

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/models"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func TestNewZapCore(t *testing.T) {
	// Create a test server to capture log entries
	var receivedEntries []models.LogEntry
	var mu sync.Mutex
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Decode the request body
		var entry models.LogEntry
		if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
			t.Errorf("Failed to decode request body: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Store the entry
		mu.Lock()
		receivedEntries = append(receivedEntries, entry)
		mu.Unlock()

		// Return a success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"status": "created"})
	}))
	defer server.Close()

	// Configure NeuralLog with the test server URL
	neurallog.Configure(
		neurallog.WithServerURL(server.URL),
		neurallog.WithAsyncEnabled(false),
	)

	// Create a zap core
	core := NewZapCore("test-log", zapcore.DebugLevel)

	// Create a zap logger with the core
	logger := zap.New(core)

	// Log messages at different levels
	logger.Debug("Debug message")
	logger.Info("Info message")
	logger.Warn("Warning message")
	logger.Error("Error message")

	// Check that the messages were sent to NeuralLog
	if len(receivedEntries) != 4 {
		t.Errorf("Expected 4 log entries, got %d", len(receivedEntries))
	}

	// Check the messages
	expectedMessages := []string{
		"Debug message",
		"Info message",
		"Warning message",
		"Error message",
	}
	for i, message := range expectedMessages {
		if i >= len(receivedEntries) {
			break
		}
		if receivedEntries[i].Message != message {
			t.Errorf("Entry %d: Expected message '%s', got '%s'", i, message, receivedEntries[i].Message)
		}
	}

	// Check the levels
	expectedLevels := []models.LogLevel{
		models.LogLevelDebug,
		models.LogLevelInfo,
		models.LogLevelWarning,
		models.LogLevelError,
	}
	for i, level := range expectedLevels {
		if i >= len(receivedEntries) {
			break
		}
		if receivedEntries[i].Level != level {
			t.Errorf("Entry %d: Expected level %v, got %v", i, level, receivedEntries[i].Level)
		}
	}
}

func TestZapCoreWithFields(t *testing.T) {
	// Create a test server to capture log entries
	var receivedEntries []models.LogEntry
	var mu sync.Mutex
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Decode the request body
		var entry models.LogEntry
		if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
			t.Errorf("Failed to decode request body: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Store the entry
		mu.Lock()
		receivedEntries = append(receivedEntries, entry)
		mu.Unlock()

		// Return a success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"status": "created"})
	}))
	defer server.Close()

	// Configure NeuralLog with the test server URL
	neurallog.Configure(
		neurallog.WithServerURL(server.URL),
		neurallog.WithAsyncEnabled(false),
	)

	// Create a zap core
	core := NewZapCore("test-log", zapcore.InfoLevel)

	// Create a zap logger with the core
	logger := zap.New(core)

	// Log with fields
	logger.Info("User logged in",
		zap.String("user", "john.doe"),
		zap.String("action", "login"),
	)

	// Check that the message was sent to NeuralLog with fields
	if len(receivedEntries) != 1 {
		t.Errorf("Expected 1 log entry, got %d", len(receivedEntries))
	}
	if len(receivedEntries) > 0 {
		entry := receivedEntries[0]
		if entry.Data["user"] != "john.doe" {
			t.Errorf("Expected data['user'] = 'john.doe', got %v", entry.Data["user"])
		}
		if entry.Data["action"] != "login" {
			t.Errorf("Expected data['action'] = 'login', got %v", entry.Data["action"])
		}
	}
}

func TestZapCoreWithError(t *testing.T) {
	// Create a test server to capture log entries
	var receivedEntries []models.LogEntry
	var mu sync.Mutex
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Decode the request body
		var entry models.LogEntry
		if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
			t.Errorf("Failed to decode request body: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Store the entry
		mu.Lock()
		receivedEntries = append(receivedEntries, entry)
		mu.Unlock()

		// Return a success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"status": "created"})
	}))
	defer server.Close()

	// Configure NeuralLog with the test server URL
	neurallog.Configure(
		neurallog.WithServerURL(server.URL),
		neurallog.WithAsyncEnabled(false),
	)

	// Create a zap core
	core := NewZapCore("test-log", zapcore.ErrorLevel)

	// Create a zap logger with the core
	logger := zap.New(core)

	// Create an error
	err := zap.Error(nil)

	// Log with error
	logger.Error("Error message", err)

	// Check that the message was sent to NeuralLog
	if len(receivedEntries) != 1 {
		t.Errorf("Expected 1 log entry, got %d", len(receivedEntries))
	}
}
