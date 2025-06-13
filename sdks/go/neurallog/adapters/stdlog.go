package adapters

import (
	"fmt"
	"log"
	"strings"

	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/models"
)

// StdLogAdapter is an adapter for the standard Go log package.
type StdLogAdapter struct {
	logger    neurallog.Logger
	stdLogger *log.Logger
	level     models.LogLevel
	context   map[string]interface{}
}

// StdLogAdapterOption is a function that configures a StdLogAdapter.
type StdLogAdapterOption func(*StdLogAdapter)

// WithLevel sets the log level for the adapter.
func WithLevel(level models.LogLevel) StdLogAdapterOption {
	return func(adapter *StdLogAdapter) {
		adapter.level = level
	}
}

// WithContext sets the context data for the adapter.
func WithContext(context map[string]interface{}) StdLogAdapterOption {
	return func(adapter *StdLogAdapter) {
		adapter.context = context
	}
}

// NewStdLogAdapter creates a new adapter for the standard Go log package.
func NewStdLogAdapter(logName string, stdLogger *log.Logger, opts ...StdLogAdapterOption) *StdLogAdapter {
	adapter := &StdLogAdapter{
		logger:    neurallog.GetLogger(logName),
		stdLogger: stdLogger,
		level:     models.LogLevelInfo,
		context:   make(map[string]interface{}),
	}

	for _, opt := range opts {
		opt(adapter)
	}

	if len(adapter.context) > 0 {
		adapter.logger.SetContext(adapter.context)
	}

	return adapter
}

// Print logs a message at the configured level.
func (a *StdLogAdapter) Print(v ...interface{}) {
	a.stdLogger.Print(v...)
	a.logger.Log(a.level, fmt.Sprint(v...), neurallog.WithData(a.context))
}

// Printf logs a formatted message at the configured level.
func (a *StdLogAdapter) Printf(format string, v ...interface{}) {
	a.stdLogger.Printf(format, v...)
	a.logger.Log(a.level, fmt.Sprintf(format, v...), neurallog.WithData(a.context))
}

// Println logs a message with a newline at the configured level.
func (a *StdLogAdapter) Println(v ...interface{}) {
	a.stdLogger.Println(v...)
	message := fmt.Sprintln(v...)
	// Remove trailing newline
	message = strings.TrimSuffix(message, "\n")
	a.logger.Log(a.level, message, neurallog.WithData(a.context))
}
