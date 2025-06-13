package neurallog

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/NeuralLog/go-sdk/neurallog/http"
	"github.com/NeuralLog/go-sdk/neurallog/models"
)

// Logger is the interface for logging messages to NeuralLog.
type Logger interface {
	Debug(message string, opts ...LogOption)
	Info(message string, opts ...LogOption)
	Warning(message string, opts ...LogOption)
	Error(message string, opts ...LogOption)
	Fatal(message string, opts ...LogOption)
	Log(level models.LogLevel, message string, opts ...LogOption)
	SetContext(context map[string]interface{})
	Flush()
}

// LogOption is a function that configures a log operation.
type LogOption func(*logOptions)

// logOptions represents options for a log operation.
type logOptions struct {
	data      map[string]interface{}
	exception error
}

// WithData adds structured data to a log entry.
func WithData(data map[string]interface{}) LogOption {
	return func(opts *logOptions) {
		for k, v := range data {
			opts.data[k] = v
		}
	}
}

// WithException adds an exception to a log entry.
func WithException(err error) LogOption {
	return func(opts *logOptions) {
		opts.exception = err
	}
}

// AILoggerOption is a function that configures an AILogger.
type AILoggerOption func(*AILogger)

// WithConfig sets the configuration for an AILogger.
func WithConfig(config *models.Config) AILoggerOption {
	return func(logger *AILogger) {
		logger.config = config
		logger.httpClient = http.NewClient(config)
	}
}

// AILogger is a logger that sends logs to NeuralLog.
type AILogger struct {
	logName    string
	config     *models.Config
	httpClient *http.Client
	context    map[string]interface{}
	batchQueue []*models.LogEntry
	batchMutex sync.Mutex
	batchTimer *time.Timer
	stopBatch  chan struct{}
	flushFunc  func()
}

// LogName returns the name of the log.
func (l *AILogger) LogName() string {
	return l.logName
}

// NewAILogger creates a new AILogger with the specified log name.
func NewAILogger(logName string, opts ...AILoggerOption) *AILogger {
	logger := &AILogger{
		logName:    logName,
		config:     models.NewConfig(),
		context:    make(map[string]interface{}),
		batchQueue: make([]*models.LogEntry, 0, 100),
		stopBatch:  make(chan struct{}),
	}

	// Apply options
	for _, opt := range opts {
		opt(logger)
	}

	// Create HTTP client if not provided
	if logger.httpClient == nil {
		logger.httpClient = http.NewClient(logger.config)
	}

	// Set up batching if enabled
	if logger.config.AsyncEnabled && logger.config.BatchSize > 1 {
		logger.startBatchTimer()
	}

	// Set up flush function
	logger.flushFunc = logger.flush

	return logger
}

// Debug logs a debug message.
func (l *AILogger) Debug(message string, opts ...LogOption) {
	l.Log(models.LogLevelDebug, message, opts...)
}

// Info logs an info message.
func (l *AILogger) Info(message string, opts ...LogOption) {
	l.Log(models.LogLevelInfo, message, opts...)
}

// Warning logs a warning message.
func (l *AILogger) Warning(message string, opts ...LogOption) {
	l.Log(models.LogLevelWarning, message, opts...)
}

// Error logs an error message.
func (l *AILogger) Error(message string, opts ...LogOption) {
	l.Log(models.LogLevelError, message, opts...)
}

// Fatal logs a fatal message.
func (l *AILogger) Fatal(message string, opts ...LogOption) {
	l.Log(models.LogLevelFatal, message, opts...)
}

// Log logs a message with the specified level.
func (l *AILogger) Log(level models.LogLevel, message string, opts ...LogOption) {
	// Parse options
	options := &logOptions{
		data: make(map[string]interface{}),
	}
	for _, opt := range opts {
		opt(options)
	}

	// Create log entry
	entry := models.NewLogEntry(level, message)

	// Add context
	for k, v := range l.context {
		entry.Data[k] = v
	}

	// Add data from options
	for k, v := range options.data {
		entry.Data[k] = v
	}

	// Add exception if provided
	if options.exception != nil {
		entry.Exception = models.ExceptionInfoFromError(options.exception)
	}

	// Send the log entry
	if l.config.AsyncEnabled {
		if l.config.BatchSize > 1 {
			l.enqueueBatch(entry)
		} else {
			go l.sendLogEntry(entry)
		}
	} else {
		l.sendLogEntry(entry)
	}
}

// SetContext sets the context data for the logger.
func (l *AILogger) SetContext(context map[string]interface{}) {
	l.context = make(map[string]interface{})
	for k, v := range context {
		l.context[k] = v
	}
}

// flush sends any pending log entries.
func (l *AILogger) flush() {
	if l.config.AsyncEnabled && l.config.BatchSize > 1 {
		l.sendBatch()
	}
}

// Flush sends any pending log entries.
func (l *AILogger) Flush() {
	l.flushFunc()
}

// enqueueBatch adds a log entry to the batch queue.
func (l *AILogger) enqueueBatch(entry *models.LogEntry) {
	l.batchMutex.Lock()
	defer l.batchMutex.Unlock()

	l.batchQueue = append(l.batchQueue, entry)

	if len(l.batchQueue) >= l.config.BatchSize {
		l.sendBatchLocked()
	}
}

// sendBatch sends the current batch of log entries.
func (l *AILogger) sendBatch() {
	l.batchMutex.Lock()
	defer l.batchMutex.Unlock()

	l.sendBatchLocked()
}

// sendBatchLocked sends the current batch of log entries (must be called with lock held).
func (l *AILogger) sendBatchLocked() {
	if len(l.batchQueue) == 0 {
		return
	}

	// Create a copy of the batch queue
	batch := make([]*models.LogEntry, len(l.batchQueue))
	copy(batch, l.batchQueue)
	l.batchQueue = l.batchQueue[:0]

	// Reset the timer
	if l.batchTimer != nil {
		l.batchTimer.Reset(l.config.BatchInterval)
	}

	// Send the batch
	go l.sendLogBatch(batch)
}

// startBatchTimer starts the batch timer.
func (l *AILogger) startBatchTimer() {
	l.batchTimer = time.NewTimer(l.config.BatchInterval)
	go func() {
		for {
			select {
			case <-l.batchTimer.C:
				l.sendBatch()
				l.batchTimer.Reset(l.config.BatchInterval)
			case <-l.stopBatch:
				l.batchTimer.Stop()
				return
			}
		}
	}()
}

// sendLogEntry sends a single log entry to the server.
func (l *AILogger) sendLogEntry(entry *models.LogEntry) {
	// Convert entry to JSON
	data, err := json.Marshal(entry)
	if err != nil {
		if l.config.DebugEnabled {
			fmt.Printf("Failed to marshal log entry: %v\n", err)
		}
		return
	}

	// Send to server
	url := l.getLogURL()
	_, err = l.httpClient.Send("POST", url, string(data))
	if err != nil && l.config.DebugEnabled {
		fmt.Printf("Failed to send log entry: %v\n", err)
	}
}

// sendLogBatch sends a batch of log entries to the server.
func (l *AILogger) sendLogBatch(batch []*models.LogEntry) {
	if len(batch) == 0 {
		return
	}

	// Convert batch to JSON
	data, err := json.Marshal(batch)
	if err != nil {
		if l.config.DebugEnabled {
			fmt.Printf("Failed to marshal log batch: %v\n", err)
		}
		return
	}

	// Send to server
	url := l.getBatchURL()
	_, err = l.httpClient.Send("POST", url, string(data))
	if err != nil && l.config.DebugEnabled {
		fmt.Printf("Failed to send log batch: %v\n", err)
	}
}

// getLogURL returns the URL for logging a single entry.
func (l *AILogger) getLogURL() string {
	if l.config.Namespace != "default" {
		return fmt.Sprintf("/%s/logs/%s", l.config.Namespace, l.logName)
	}
	return fmt.Sprintf("/logs/%s", l.logName)
}

// getBatchURL returns the URL for logging a batch of entries.
func (l *AILogger) getBatchURL() string {
	if l.config.Namespace != "default" {
		return fmt.Sprintf("/%s/logs/%s/batch", l.config.Namespace, l.logName)
	}
	return fmt.Sprintf("/logs/%s/batch", l.logName)
}
