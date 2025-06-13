package adapters

import (
	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/models"
	"github.com/sirupsen/logrus"
)

// LogrusHook is a logrus hook that sends logs to NeuralLog.
type LogrusHook struct {
	logger  neurallog.Logger
	context map[string]interface{}
}

// LogrusHookOption is a function that configures a LogrusHook.
type LogrusHookOption func(*LogrusHook)

// WithLogrusContext sets the context data for the hook.
func WithLogrusContext(context map[string]interface{}) LogrusHookOption {
	return func(hook *LogrusHook) {
		hook.context = context
	}
}

// NewLogrusHook creates a new logrus hook that sends logs to NeuralLog.
func NewLogrusHook(logName string, opts ...LogrusHookOption) *LogrusHook {
	hook := &LogrusHook{
		logger:  neurallog.GetLogger(logName),
		context: make(map[string]interface{}),
	}

	for _, opt := range opts {
		opt(hook)
	}

	if len(hook.context) > 0 {
		hook.logger.SetContext(hook.context)
	}

	return hook
}

// Fire implements the logrus.Hook interface.
func (h *LogrusHook) Fire(entry *logrus.Entry) error {
	// Convert logrus level to NeuralLog level
	level := convertLogrusLevel(entry.Level)

	// Extract data from the entry
	data := make(map[string]interface{})
	for k, v := range h.context {
		data[k] = v
	}
	for k, v := range entry.Data {
		data[k] = v
	}

	// Extract error if present
	var err error
	if errData, ok := entry.Data[logrus.ErrorKey]; ok {
		if e, ok := errData.(error); ok {
			err = e
		}
	}

	// Send log to NeuralLog
	if err != nil {
		h.logger.Log(level, entry.Message, neurallog.WithData(data), neurallog.WithException(err))
	} else {
		h.logger.Log(level, entry.Message, neurallog.WithData(data))
	}

	return nil
}

// Levels implements the logrus.Hook interface.
func (h *LogrusHook) Levels() []logrus.Level {
	return []logrus.Level{
		logrus.PanicLevel,
		logrus.FatalLevel,
		logrus.ErrorLevel,
		logrus.WarnLevel,
		logrus.InfoLevel,
		logrus.DebugLevel,
		logrus.TraceLevel,
	}
}

// convertLogrusLevel converts a logrus level to a NeuralLog level.
func convertLogrusLevel(level logrus.Level) models.LogLevel {
	switch level {
	case logrus.PanicLevel, logrus.FatalLevel:
		return models.LogLevelFatal
	case logrus.ErrorLevel:
		return models.LogLevelError
	case logrus.WarnLevel:
		return models.LogLevelWarning
	case logrus.InfoLevel:
		return models.LogLevelInfo
	case logrus.DebugLevel, logrus.TraceLevel:
		return models.LogLevelDebug
	default:
		return models.LogLevelInfo
	}
}
