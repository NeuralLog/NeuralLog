package adapters

import (
	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/models"
	"go.uber.org/zap/zapcore"
)

// ZapCore is a zapcore.Core that sends logs to NeuralLog.
type ZapCore struct {
	logger  neurallog.Logger
	level   zapcore.LevelEnabler
	context map[string]interface{}
}

// ZapCoreOption is a function that configures a ZapCore.
type ZapCoreOption func(*ZapCore)

// WithZapContext sets the context data for the core.
func WithZapContext(context map[string]interface{}) ZapCoreOption {
	return func(core *ZapCore) {
		core.context = context
	}
}

// NewZapCore creates a new zap core that sends logs to NeuralLog.
func NewZapCore(logName string, level zapcore.LevelEnabler, opts ...ZapCoreOption) *ZapCore {
	core := &ZapCore{
		logger:  neurallog.GetLogger(logName),
		level:   level,
		context: make(map[string]interface{}),
	}

	for _, opt := range opts {
		opt(core)
	}

	if len(core.context) > 0 {
		core.logger.SetContext(core.context)
	}

	return core
}

// Enabled implements the zapcore.Core interface.
func (c *ZapCore) Enabled(level zapcore.Level) bool {
	return c.level.Enabled(level)
}

// With implements the zapcore.Core interface.
func (c *ZapCore) With(fields []zapcore.Field) zapcore.Core {
	// Create a new context with the fields
	context := make(map[string]interface{})
	for k, v := range c.context {
		context[k] = v
	}

	// Add the fields to the context
	encoder := zapcore.NewMapObjectEncoder()
	for _, field := range fields {
		field.AddTo(encoder)
	}
	for k, v := range encoder.Fields {
		context[k] = v
	}

	// Create a new core with the updated context
	return NewZapCore(c.logger.(*neurallog.AILogger).LogName(), c.level, WithZapContext(context))
}

// Check implements the zapcore.Core interface.
func (c *ZapCore) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if c.Enabled(entry.Level) {
		return checked.AddCore(entry, c)
	}
	return checked
}

// Write implements the zapcore.Core interface.
func (c *ZapCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	// Convert zap level to NeuralLog level
	level := convertZapLevel(entry.Level)

	// Extract data from the fields
	data := make(map[string]interface{})
	for k, v := range c.context {
		data[k] = v
	}

	// Add the fields to the data
	encoder := zapcore.NewMapObjectEncoder()
	for _, field := range fields {
		field.AddTo(encoder)
	}
	for k, v := range encoder.Fields {
		data[k] = v
	}

	// Extract error if present
	var err error
	if errData, ok := data["error"]; ok {
		if e, ok := errData.(error); ok {
			err = e
			delete(data, "error")
		}
	}

	// Send log to NeuralLog
	if err != nil {
		c.logger.Log(level, entry.Message, neurallog.WithData(data), neurallog.WithException(err))
	} else {
		c.logger.Log(level, entry.Message, neurallog.WithData(data))
	}

	// Handle panic and fatal levels
	if entry.Level == zapcore.PanicLevel {
		panic(entry.Message)
	}

	return nil
}

// Sync implements the zapcore.Core interface.
func (c *ZapCore) Sync() error {
	c.logger.Flush()
	return nil
}

// convertZapLevel converts a zap level to a NeuralLog level.
func convertZapLevel(level zapcore.Level) models.LogLevel {
	switch level {
	case zapcore.PanicLevel, zapcore.FatalLevel:
		return models.LogLevelFatal
	case zapcore.ErrorLevel:
		return models.LogLevelError
	case zapcore.WarnLevel:
		return models.LogLevelWarning
	case zapcore.InfoLevel:
		return models.LogLevelInfo
	case zapcore.DebugLevel:
		return models.LogLevelDebug
	default:
		return models.LogLevelInfo
	}
}
