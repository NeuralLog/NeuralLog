package adapters

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/models"
)

func TestNewStdLogAdapter(t *testing.T) {
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

	// Create a standard logger with a buffer
	var buf bytes.Buffer
	stdLogger := log.New(&buf, "TEST: ", log.Ldate|log.Ltime)

	// Create the adapter
	adapter := NewStdLogAdapter("test-log", stdLogger)

	// Log some messages
	adapter.Print("Print message")
	adapter.Printf("Printf message %d", 42)
	adapter.Println("Println message")

	// Check that the messages were logged to the buffer
	output := buf.String()
	if !strings.Contains(output, "Print message") {
		t.Errorf("Expected buffer to contain 'Print message', got '%s'", output)
	}
	if !strings.Contains(output, "Printf message 42") {
		t.Errorf("Expected buffer to contain 'Printf message 42', got '%s'", output)
	}
	if !strings.Contains(output, "Println message") {
		t.Errorf("Expected buffer to contain 'Println message', got '%s'", output)
	}

	// Check that the messages were sent to NeuralLog
	if len(receivedEntries) != 3 {
		t.Errorf("Expected 3 log entries, got %d", len(receivedEntries))
	}

	// Check the messages
	expectedMessages := []string{
		"Print message",
		"Printf message 42",
		"Println message",
	}
	for i, message := range expectedMessages {
		if i >= len(receivedEntries) {
			break
		}
		if receivedEntries[i].Message != message {
			t.Errorf("Entry %d: Expected message '%s', got '%s'", i, message, receivedEntries[i].Message)
		}
	}

	// Check the level (should be info)
	for i, entry := range receivedEntries {
		if entry.Level != models.LogLevelInfo {
			t.Errorf("Entry %d: Expected level %v, got %v", i, models.LogLevelInfo, entry.Level)
		}
	}
}

func TestStdLogAdapterWithContext(t *testing.T) {
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

	// Create a standard logger
	stdLogger := log.New(bytes.NewBuffer(nil), "", 0)

	// Create the adapter with context
	context := map[string]interface{}{
		"app":         "test-app",
		"environment": "test",
	}
	adapter := NewStdLogAdapter("test-log", stdLogger, WithContext(context))

	// Log a message
	adapter.Println("Message with context")

	// Check that the message was sent to NeuralLog with context
	if len(receivedEntries) != 1 {
		t.Errorf("Expected 1 log entry, got %d", len(receivedEntries))
	}
	if len(receivedEntries) > 0 {
		entry := receivedEntries[0]
		if entry.Data["app"] != "test-app" {
			t.Errorf("Expected data['app'] = 'test-app', got %v", entry.Data["app"])
		}
		if entry.Data["environment"] != "test" {
			t.Errorf("Expected data['environment'] = 'test', got %v", entry.Data["environment"])
		}
	}
}

func TestStdLogAdapterWithLevel(t *testing.T) {
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

	// Create a standard logger
	stdLogger := log.New(bytes.NewBuffer(nil), "", 0)

	// Create the adapter with level
	adapter := NewStdLogAdapter("test-log", stdLogger, WithLevel(models.LogLevelWarning))

	// Log a message
	adapter.Println("Warning message")

	// Check that the message was sent to NeuralLog with the warning level
	if len(receivedEntries) != 1 {
		t.Errorf("Expected 1 log entry, got %d", len(receivedEntries))
	}
	if len(receivedEntries) > 0 {
		entry := receivedEntries[0]
		if entry.Level != models.LogLevelWarning {
			t.Errorf("Expected level %v, got %v", models.LogLevelWarning, entry.Level)
		}
	}
}
