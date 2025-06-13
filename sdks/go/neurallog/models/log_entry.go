package models

import (
	"errors"
	"fmt"
	"runtime"
	"time"

	"github.com/google/uuid"
)

// ExceptionInfo represents information about an exception.
type ExceptionInfo struct {
	Type           string         `json:"type"`
	Message        string         `json:"message"`
	StackTrace     string         `json:"stackTrace"`
	InnerException *ExceptionInfo `json:"innerException,omitempty"`
}

// ExceptionInfoFromError creates an ExceptionInfo from an error.
func ExceptionInfoFromError(err error) *ExceptionInfo {
	if err == nil {
		return nil
	}

	// Get the stack trace
	buf := make([]byte, 4096)
	n := runtime.Stack(buf, false)
	stackTrace := string(buf[:n])

	// Create the exception info
	info := &ExceptionInfo{
		Type:       fmt.Sprintf("%T", err),
		Message:    err.Error(),
		StackTrace: stackTrace,
	}

	// Check for wrapped errors
	if unwrapped := errors.Unwrap(err); unwrapped != nil {
		info.InnerException = ExceptionInfoFromError(unwrapped)
	}

	return info
}

// LogEntry represents a log entry in NeuralLog.
type LogEntry struct {
	ID        string                 `json:"id"`
	Timestamp time.Time              `json:"timestamp"`
	Level     LogLevel               `json:"level"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data"`
	Exception *ExceptionInfo         `json:"exception,omitempty"`
}

// LogEntryOption is a function that configures a LogEntry.
type LogEntryOption func(*LogEntry)

// WithData sets the data for a log entry.
func WithData(data map[string]interface{}) LogEntryOption {
	return func(entry *LogEntry) {
		for k, v := range data {
			entry.Data[k] = v
		}
	}
}

// WithException sets the exception for a log entry.
func WithException(err error) LogEntryOption {
	return func(entry *LogEntry) {
		entry.Exception = ExceptionInfoFromError(err)
	}
}

// WithTimestamp sets the timestamp for a log entry.
func WithTimestamp(timestamp time.Time) LogEntryOption {
	return func(entry *LogEntry) {
		entry.Timestamp = timestamp
	}
}

// WithID sets the ID for a log entry.
func WithID(id string) LogEntryOption {
	return func(entry *LogEntry) {
		entry.ID = id
	}
}

// NewLogEntry creates a new log entry with the specified level and message.
func NewLogEntry(level LogLevel, message string, opts ...LogEntryOption) *LogEntry {
	entry := &LogEntry{
		ID:        uuid.New().String(),
		Timestamp: time.Now().UTC(),
		Level:     level,
		Message:   message,
		Data:      make(map[string]interface{}),
	}

	for _, opt := range opts {
		opt(entry)
	}

	return entry
}
