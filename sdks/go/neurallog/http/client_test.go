package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/NeuralLog/go-sdk/neurallog/models"
)

func TestNewClient(t *testing.T) {
	config := models.NewConfig()
	client := NewClient(config)

	if client.config != config {
		t.Errorf("Expected client.config to be the same as config")
	}
	if client.httpClient == nil {
		t.Errorf("Expected non-nil httpClient")
	}
}

func TestClientSend(t *testing.T) {
	// Create a test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check request method
		if r.Method != http.MethodPost {
			t.Errorf("Expected POST request, got %s", r.Method)
		}

		// Check request headers
		if r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("Expected Content-Type: application/json, got %s", r.Header.Get("Content-Type"))
		}
		if r.Header.Get("Accept") != "application/json" {
			t.Errorf("Expected Accept: application/json, got %s", r.Header.Get("Accept"))
		}
		if r.Header.Get("X-API-Key") != "test-api-key" {
			t.Errorf("Expected X-API-Key: test-api-key, got %s", r.Header.Get("X-API-Key"))
		}
		if r.Header.Get("X-Custom-Header") != "value" {
			t.Errorf("Expected X-Custom-Header: value, got %s", r.Header.Get("X-Custom-Header"))
		}

		// Decode request body
		var requestBody map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			t.Errorf("Failed to decode request body: %v", err)
		}
		if requestBody["message"] != "Test message" {
			t.Errorf("Expected message 'Test message', got '%v'", requestBody["message"])
		}

		// Return a success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"status": "created"})
	}))
	defer server.Close()

	// Create a client with the test server URL
	config := models.NewConfig(
		models.WithServerURL(server.URL),
		models.WithAPIKey("test-api-key"),
		models.WithHeaders(map[string]string{"X-Custom-Header": "value"}),
		models.WithAsyncEnabled(false),
		models.WithTimeout(1*time.Second),
	)
	client := NewClient(config)

	// Send a request
	data := map[string]interface{}{
		"message": "Test message",
	}
	jsonData, _ := json.Marshal(data)
	response, err := client.Send(http.MethodPost, "/logs/test-log", string(jsonData))

	// Check for errors
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Check response
	if response["status"] != "created" {
		t.Errorf("Expected response status 'created', got '%v'", response["status"])
	}
}

func TestClientSendWithRetries(t *testing.T) {
	// Create a counter for the number of requests
	requestCount := 0

	// Create a test server that fails the first two requests
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestCount++
		if requestCount <= 2 {
			// Simulate a server error
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// Return a success response for the third request
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	}))
	defer server.Close()

	// Create a client with the test server URL and retry configuration
	config := models.NewConfig(
		models.WithServerURL(server.URL),
		models.WithMaxRetries(3),
		models.WithRetryBackoff(10*time.Millisecond), // Use a short backoff for testing
		models.WithAsyncEnabled(false),
		models.WithTimeout(1*time.Second),
	)
	client := NewClient(config)

	// Send a request
	response, err := client.Send(http.MethodGet, "/test", "")

	// Check for errors
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Check response
	if response["status"] != "success" {
		t.Errorf("Expected response status 'success', got '%v'", response["status"])
	}

	// Check that we made exactly 3 requests (2 failures + 1 success)
	if requestCount != 3 {
		t.Errorf("Expected 3 requests, got %d", requestCount)
	}
}

func TestClientSendWithMaxRetriesExceeded(t *testing.T) {
	// Create a test server that always fails
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	// Create a client with the test server URL and retry configuration
	config := models.NewConfig(
		models.WithServerURL(server.URL),
		models.WithMaxRetries(2),
		models.WithRetryBackoff(10*time.Millisecond), // Use a short backoff for testing
		models.WithAsyncEnabled(false),
		models.WithTimeout(1*time.Second),
	)
	client := NewClient(config)

	// Send a request
	_, err := client.Send(http.MethodGet, "/test", "")

	// Check for errors
	if err == nil {
		t.Error("Expected an error, got nil")
	}
}

func TestClientSendWithNoContent(t *testing.T) {
	// Create a test server that returns 204 No Content
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()

	// Create a client with the test server URL
	config := models.NewConfig(
		models.WithServerURL(server.URL),
		models.WithAsyncEnabled(false),
		models.WithTimeout(1*time.Second),
	)
	client := NewClient(config)

	// Send a request
	response, err := client.Send(http.MethodPost, "/test", "")

	// Check for errors
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Check response
	if len(response) != 0 {
		t.Errorf("Expected empty response, got %v", response)
	}
}
