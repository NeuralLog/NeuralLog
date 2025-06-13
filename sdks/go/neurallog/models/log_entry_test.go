package models

import (
	"encoding/json"
	"errors"
	"testing"
	"time"
)

func TestNewLogEntry(t *testing.T) {
	// Test with minimal parameters
	entry := NewLogEntry(LogLevelInfo, "Test message")
	if entry.Level != LogLevelInfo {
		t.Errorf("Expected level %v, got %v", LogLevelInfo, entry.Level)
	}
	if entry.Message != "Test message" {
		t.Errorf("Expected message 'Test message', got '%s'", entry.Message)
	}
	if entry.ID == "" {
		t.Error("Expected non-empty ID")
	}
	if entry.Timestamp.IsZero() {
		t.Error("Expected non-zero timestamp")
	}
	if entry.Data == nil {
		t.Error("Expected non-nil data map")
	}
	if len(entry.Data) != 0 {
		t.Errorf("Expected empty data map, got %v", entry.Data)
	}
	if entry.Exception != nil {
		t.Errorf("Expected nil exception, got %v", entry.Exception)
	}

	// Test with data
	data := map[string]interface{}{
		"key1": "value1",
		"key2": 42,
	}
	entry = NewLogEntry(LogLevelInfo, "Test message", WithData(data))
	if len(entry.Data) != 2 {
		t.Errorf("Expected data map with 2 entries, got %v", entry.Data)
	}
	if entry.Data["key1"] != "value1" {
		t.Errorf("Expected data['key1'] = 'value1', got %v", entry.Data["key1"])
	}
	if entry.Data["key2"] != 42 {
		t.Errorf("Expected data['key2'] = 42, got %v", entry.Data["key2"])
	}

	// Test with exception
	err := errors.New("test error")
	entry = NewLogEntry(LogLevelError, "Error message", WithException(err))
	if entry.Exception == nil {
		t.Error("Expected non-nil exception")
	}
	if entry.Exception.Type != "*errors.errorString" {
		t.Errorf("Expected exception type '*errors.errorString', got '%s'", entry.Exception.Type)
	}
	if entry.Exception.Message != "test error" {
		t.Errorf("Expected exception message 'test error', got '%s'", entry.Exception.Message)
	}
}

func TestLogEntryMarshalJSON(t *testing.T) {
	// Create a log entry with fixed values for testing
	entry := &LogEntry{
		ID:        "test-id",
		Timestamp: time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC),
		Level:     LogLevelInfo,
		Message:   "Test message",
		Data: map[string]interface{}{
			"key1": "value1",
			"key2": 42,
		},
		Exception: &ExceptionInfo{
			Type:    "error",
			Message: "test error",
		},
	}

	// Marshal to JSON
	bytes, err := json.Marshal(entry)
	if err != nil {
		t.Errorf("Failed to marshal LogEntry: %v", err)
	}

	// Unmarshal back to verify
	var unmarshaled LogEntry
	err = json.Unmarshal(bytes, &unmarshaled)
	if err != nil {
		t.Errorf("Failed to unmarshal LogEntry: %v", err)
	}

	// Verify fields
	if unmarshaled.ID != "test-id" {
		t.Errorf("Expected ID 'test-id', got '%s'", unmarshaled.ID)
	}
	if unmarshaled.Level != LogLevelInfo {
		t.Errorf("Expected level %v, got %v", LogLevelInfo, unmarshaled.Level)
	}
	if unmarshaled.Message != "Test message" {
		t.Errorf("Expected message 'Test message', got '%s'", unmarshaled.Message)
	}
	if unmarshaled.Data["key1"] != "value1" {
		t.Errorf("Expected data['key1'] = 'value1', got %v", unmarshaled.Data["key1"])
	}
	if unmarshaled.Data["key2"] != float64(42) { // JSON numbers are float64
		t.Errorf("Expected data['key2'] = 42, got %v", unmarshaled.Data["key2"])
	}
	if unmarshaled.Exception == nil {
		t.Error("Expected non-nil exception")
	}
	if unmarshaled.Exception.Type != "error" {
		t.Errorf("Expected exception type 'error', got '%s'", unmarshaled.Exception.Type)
	}
	if unmarshaled.Exception.Message != "test error" {
		t.Errorf("Expected exception message 'test error', got '%s'", unmarshaled.Exception.Message)
	}
}

func TestExceptionInfoFromError(t *testing.T) {
	// Test with a simple error
	err := errors.New("test error")
	info := ExceptionInfoFromError(err)
	if info.Type != "*errors.errorString" {
		t.Errorf("Expected type '*errors.errorString', got '%s'", info.Type)
	}
	if info.Message != "test error" {
		t.Errorf("Expected message 'test error', got '%s'", info.Message)
	}
	if info.StackTrace == "" {
		t.Error("Expected non-empty stack trace")
	}

	// Test with a wrapped error
	wrappedErr := errors.New("inner error")
	outerErr := errors.New("outer error")
	wrappedErr = errors.Join(outerErr, wrappedErr)
	info = ExceptionInfoFromError(wrappedErr)
	if info.Type != "*errors.joinError" {
		t.Errorf("Expected type '*errors.joinError', got '%s'", info.Type)
	}
}

func TestLogEntryOptions(t *testing.T) {
	// Test WithData option
	data := map[string]interface{}{"key": "value"}
	entry := NewLogEntry(LogLevelInfo, "message", WithData(data))
	if entry.Data["key"] != "value" {
		t.Errorf("Expected data['key'] = 'value', got %v", entry.Data["key"])
	}

	// Test WithException option
	err := errors.New("test error")
	entry = NewLogEntry(LogLevelInfo, "message", WithException(err))
	if entry.Exception == nil || entry.Exception.Message != "test error" {
		t.Errorf("Expected exception with message 'test error', got %v", entry.Exception)
	}

	// Test WithTimestamp option
	timestamp := time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)
	entry = NewLogEntry(LogLevelInfo, "message", WithTimestamp(timestamp))
	if !entry.Timestamp.Equal(timestamp) {
		t.Errorf("Expected timestamp %v, got %v", timestamp, entry.Timestamp)
	}

	// Test WithID option
	entry = NewLogEntry(LogLevelInfo, "message", WithID("custom-id"))
	if entry.ID != "custom-id" {
		t.Errorf("Expected ID 'custom-id', got '%s'", entry.ID)
	}

	// Test multiple options
	entry = NewLogEntry(LogLevelInfo, "message",
		WithData(data),
		WithException(err),
		WithTimestamp(timestamp),
		WithID("custom-id"),
	)
	if entry.Data["key"] != "value" {
		t.Errorf("Expected data['key'] = 'value', got %v", entry.Data["key"])
	}
	if entry.Exception == nil || entry.Exception.Message != "test error" {
		t.Errorf("Expected exception with message 'test error', got %v", entry.Exception)
	}
	if !entry.Timestamp.Equal(timestamp) {
		t.Errorf("Expected timestamp %v, got %v", timestamp, entry.Timestamp)
	}
	if entry.ID != "custom-id" {
		t.Errorf("Expected ID 'custom-id', got '%s'", entry.ID)
	}
}
