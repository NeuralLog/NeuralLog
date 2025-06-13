package models

import (
	"encoding/json"
	"strings"
)

// LogLevel represents the severity level of a log entry.
type LogLevel string

const (
	// LogLevelDebug represents debug-level messages.
	LogLevelDebug LogLevel = "debug"
	// LogLevelInfo represents informational messages.
	LogLevelInfo LogLevel = "info"
	// LogLevelWarning represents warning messages.
	LogLevelWarning LogLevel = "warning"
	// LogLevelError represents error messages.
	LogLevelError LogLevel = "error"
	// LogLevelFatal represents fatal error messages.
	LogLevelFatal LogLevel = "fatal"
)

// String returns the string representation of the log level.
func (l LogLevel) String() string {
	return string(l)
}

// MarshalJSON implements the json.Marshaler interface.
func (l LogLevel) MarshalJSON() ([]byte, error) {
	return json.Marshal(l.String())
}

// UnmarshalJSON implements the json.Unmarshaler interface.
func (l *LogLevel) UnmarshalJSON(data []byte) error {
	var str string
	if err := json.Unmarshal(data, &str); err != nil {
		return err
	}
	*l = LogLevelFromString(str)
	return nil
}

// LogLevelFromString converts a string to a LogLevel.
// If the string is not a valid log level, it returns LogLevelInfo.
func LogLevelFromString(s string) LogLevel {
	switch strings.ToLower(s) {
	case "debug":
		return LogLevelDebug
	case "info":
		return LogLevelInfo
	case "warning":
		return LogLevelWarning
	case "error":
		return LogLevelError
	case "fatal":
		return LogLevelFatal
	default:
		return LogLevelInfo
	}
}
