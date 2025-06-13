package adapters

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/models"
	"github.com/sirupsen/logrus"
)

func TestNewLogrusHook(t *testing.T) {
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

	// Create a logrus logger
	logger := logrus.New()
	logger.SetLevel(logrus.DebugLevel)

	// Create the hook
	hook := NewLogrusHook("test-log")

	// Add the hook to the logger
	logger.AddHook(hook)

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

func TestLogrusHookWithFields(t *testing.T) {
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

	// Create a logrus logger
	logger := logrus.New()

	// Create the hook
	hook := NewLogrusHook("test-log")

	// Add the hook to the logger
	logger.AddHook(hook)

	// Log with fields
	logger.WithFields(logrus.Fields{
		"user":   "john.doe",
		"action": "login",
	}).Info("User logged in")

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

func TestLogrusHookWithError(t *testing.T) {
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

	// Create a logrus logger
	logger := logrus.New()

	// Create the hook
	hook := NewLogrusHook("test-log")

	// Add the hook to the logger
	logger.AddHook(hook)

	// Log with error
	logger.WithError(errors.New("test error")).Error("Error message")

	// Check that the message was sent to NeuralLog with error
	if len(receivedEntries) != 1 {
		t.Errorf("Expected 1 log entry, got %d", len(receivedEntries))
	}
	if len(receivedEntries) > 0 {
		entry := receivedEntries[0]
		if entry.Exception == nil {
			t.Error("Expected non-nil exception")
		}
	}
}
