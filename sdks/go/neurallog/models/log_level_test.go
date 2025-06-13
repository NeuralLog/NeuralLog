package models

import (
	"encoding/json"
	"testing"
)

func TestLogLevelString(t *testing.T) {
	tests := []struct {
		level    LogLevel
		expected string
	}{
		{LogLevelDebug, "debug"},
		{LogLevelInfo, "info"},
		{LogLevelWarning, "warning"},
		{LogLevelError, "error"},
		{LogLevelFatal, "fatal"},
	}

	for _, test := range tests {
		if test.level.String() != test.expected {
			t.Errorf("Expected %s, got %s", test.expected, test.level.String())
		}
	}
}

func TestLogLevelMarshalJSON(t *testing.T) {
	tests := []struct {
		level    LogLevel
		expected string
	}{
		{LogLevelDebug, `"debug"`},
		{LogLevelInfo, `"info"`},
		{LogLevelWarning, `"warning"`},
		{LogLevelError, `"error"`},
		{LogLevelFatal, `"fatal"`},
	}

	for _, test := range tests {
		bytes, err := json.Marshal(test.level)
		if err != nil {
			t.Errorf("Failed to marshal LogLevel: %v", err)
		}
		if string(bytes) != test.expected {
			t.Errorf("Expected %s, got %s", test.expected, string(bytes))
		}
	}
}

func TestLogLevelUnmarshalJSON(t *testing.T) {
	tests := []struct {
		json     string
		expected LogLevel
	}{
		{`"debug"`, LogLevelDebug},
		{`"info"`, LogLevelInfo},
		{`"warning"`, LogLevelWarning},
		{`"error"`, LogLevelError},
		{`"fatal"`, LogLevelFatal},
		{`"unknown"`, LogLevelInfo}, // Default to info for unknown levels
	}

	for _, test := range tests {
		var level LogLevel
		err := json.Unmarshal([]byte(test.json), &level)
		if err != nil {
			t.Errorf("Failed to unmarshal LogLevel: %v", err)
		}
		if level != test.expected {
			t.Errorf("Expected %v, got %v", test.expected, level)
		}
	}
}

func TestLogLevelFromString(t *testing.T) {
	tests := []struct {
		str      string
		expected LogLevel
	}{
		{"debug", LogLevelDebug},
		{"info", LogLevelInfo},
		{"warning", LogLevelWarning},
		{"error", LogLevelError},
		{"fatal", LogLevelFatal},
		{"unknown", LogLevelInfo}, // Default to info for unknown levels
	}

	for _, test := range tests {
		level := LogLevelFromString(test.str)
		if level != test.expected {
			t.Errorf("Expected %v, got %v", test.expected, level)
		}
	}
}
