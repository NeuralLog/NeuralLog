package neurallog

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/NeuralLog/go-sdk/neurallog/models"
)

func TestNewAILogger(t *testing.T) {
	// Test with default config
	logger := NewAILogger("test-log")
	if logger.logName != "test-log" {
		t.Errorf("Expected logName 'test-log', got '%s'", logger.logName)
	}
	if logger.config == nil {
		t.Error("Expected non-nil config")
	}
	if logger.httpClient == nil {
		t.Error("Expected non-nil httpClient")
	}
	if logger.context == nil {
		t.Error("Expected non-nil context map")
	}
	if logger.batchQueue == nil {
		t.Error("Expected non-nil batchQueue")
	}

	// Test with custom config
	config := models.NewConfig(
		models.WithServerURL("https://logs.example.com"),
		models.WithNamespace("production"),
	)
	logger = NewAILogger("test-log", WithConfig(config))
	if logger.config.ServerURL != "https://logs.example.com" {
		t.Errorf("Expected ServerURL 'https://logs.example.com', got '%s'", logger.config.ServerURL)
	}
	if logger.config.Namespace != "production" {
		t.Errorf("Expected Namespace 'production', got '%s'", logger.config.Namespace)
	}
}

func TestAILoggerLog(t *testing.T) {
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

	// Create a logger with the test server URL and synchronous mode
	config := models.NewConfig(
		models.WithServerURL(server.URL),
		models.WithAsyncEnabled(false),
	)
	logger := NewAILogger("test-log", WithConfig(config))

	// Test Debug level
	logger.Debug("Debug message")
	// Test Info level
	logger.Info("Info message")
	// Test Warning level
	logger.Warning("Warning message")
	// Test Error level
	logger.Error("Error message")
	// Test Fatal level
	logger.Fatal("Fatal message")

	// Test with data
	data := map[string]interface{}{
		"key1": "value1",
		"key2": 42,
	}
	logger.Info("Message with data", WithData(data))

	// Test with exception
	err := errors.New("test error")
	logger.Error("Error with exception", WithException(err))

	// Test with context
	logger.SetContext(map[string]interface{}{
		"context_key": "context_value",
	})
	logger.Info("Message with context")

	// Check that we received the expected number of entries
	if len(receivedEntries) != 8 {
		t.Errorf("Expected 8 log entries, got %d", len(receivedEntries))
	}

	// Check the levels
	expectedLevels := []models.LogLevel{
		models.LogLevelDebug,
		models.LogLevelInfo,
		models.LogLevelWarning,
		models.LogLevelError,
		models.LogLevelFatal,
		models.LogLevelInfo,
		models.LogLevelError,
		models.LogLevelInfo,
	}
	for i, level := range expectedLevels {
		if i >= len(receivedEntries) {
			break
		}
		if receivedEntries[i].Level != level {
			t.Errorf("Entry %d: Expected level %v, got %v", i, level, receivedEntries[i].Level)
		}
	}

	// Check the messages
	expectedMessages := []string{
		"Debug message",
		"Info message",
		"Warning message",
		"Error message",
		"Fatal message",
		"Message with data",
		"Error with exception",
		"Message with context",
	}
	for i, message := range expectedMessages {
		if i >= len(receivedEntries) {
			break
		}
		if receivedEntries[i].Message != message {
			t.Errorf("Entry %d: Expected message '%s', got '%s'", i, message, receivedEntries[i].Message)
		}
	}

	// Check the data in the entry with data
	if len(receivedEntries) > 5 {
		entry := receivedEntries[5]
		if entry.Data["key1"] != "value1" {
			t.Errorf("Expected data['key1'] = 'value1', got %v", entry.Data["key1"])
		}
		if entry.Data["key2"] != float64(42) { // JSON numbers are float64
			t.Errorf("Expected data['key2'] = 42, got %v", entry.Data["key2"])
		}
	}

	// Check the exception in the entry with exception
	if len(receivedEntries) > 6 {
		entry := receivedEntries[6]
		if entry.Exception == nil {
			t.Error("Expected non-nil exception")
		} else {
			if entry.Exception.Message != "test error" {
				t.Errorf("Expected exception message 'test error', got '%s'", entry.Exception.Message)
			}
		}
	}

	// Check the context in the entry with context
	if len(receivedEntries) > 7 {
		entry := receivedEntries[7]
		if entry.Data["context_key"] != "context_value" {
			t.Errorf("Expected data['context_key'] = 'context_value', got %v", entry.Data["context_key"])
		}
	}
}

func TestAILoggerBatching(t *testing.T) {
	// Create a test server to capture batched log entries
	var receivedBatches [][]models.LogEntry
	var mu sync.Mutex
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if this is a batch request
		if r.URL.Path == "/logs/test-log/batch" {
			// Decode the request body as a batch
			var batch []models.LogEntry
			if err := json.NewDecoder(r.Body).Decode(&batch); err != nil {
				t.Errorf("Failed to decode batch request body: %v", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			// Store the batch
			mu.Lock()
			receivedBatches = append(receivedBatches, batch)
			mu.Unlock()

			// Return a success response
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{"status": "created"})
			return
		}

		// For non-batch requests, return a success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"status": "created"})
	}))
	defer server.Close()

	// Create a logger with the test server URL and batching enabled
	config := models.NewConfig(
		models.WithServerURL(server.URL),
		models.WithAsyncEnabled(true),
		models.WithBatchSize(3),
		models.WithBatchInterval(100*time.Millisecond),
	)
	logger := NewAILogger("test-log", WithConfig(config))

	// Send 5 log entries (should result in one batch of 3 and one batch of 2)
	logger.Info("Message 1")
	logger.Info("Message 2")
	logger.Info("Message 3")
	logger.Info("Message 4")
	logger.Info("Message 5")

	// Wait for batches to be sent
	time.Sleep(200 * time.Millisecond)

	// Flush any remaining entries
	logger.Flush()

	// Wait for flush to complete
	time.Sleep(100 * time.Millisecond)

	// Check that we received the expected number of batches
	if len(receivedBatches) != 2 {
		t.Errorf("Expected 2 batches, got %d", len(receivedBatches))
	}

	// Check the batch sizes
	if len(receivedBatches) > 0 && len(receivedBatches[0]) != 3 {
		t.Errorf("Expected first batch to have 3 entries, got %d", len(receivedBatches[0]))
	}
	if len(receivedBatches) > 1 && len(receivedBatches[1]) != 2 {
		t.Errorf("Expected second batch to have 2 entries, got %d", len(receivedBatches[1]))
	}

	// Check the messages in the batches
	expectedMessages := []string{
		"Message 1",
		"Message 2",
		"Message 3",
		"Message 4",
		"Message 5",
	}
	messageIndex := 0
	for batchIndex, batch := range receivedBatches {
		for entryIndex, entry := range batch {
			if messageIndex >= len(expectedMessages) {
				t.Errorf("Batch %d, entry %d: Unexpected entry", batchIndex, entryIndex)
				continue
			}
			if entry.Message != expectedMessages[messageIndex] {
				t.Errorf("Batch %d, entry %d: Expected message '%s', got '%s'", batchIndex, entryIndex, expectedMessages[messageIndex], entry.Message)
			}
			messageIndex++
		}
	}
}
