package main

import (
	"errors"
	"log"
	"os"

	"github.com/NeuralLog/go-sdk/neurallog"
	"github.com/NeuralLog/go-sdk/neurallog/adapters"
	"github.com/NeuralLog/go-sdk/neurallog/models"
	"github.com/sirupsen/logrus"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func main() {
	// Configure NeuralLog
	neurallog.Configure(
		neurallog.WithServerURL("http://localhost:3030"),
		neurallog.WithAPIKey("your-api-key"),
		neurallog.WithDebugEnabled(true),
	)

	// Example 1: Standard Go log adapter
	stdLogger := log.New(os.Stdout, "STD: ", log.Ldate|log.Ltime)
	stdAdapter := adapters.NewStdLogAdapter("std-log", stdLogger,
		adapters.WithLevel(models.LogLevelInfo),
		adapters.WithContext(map[string]interface{}{
			"adapter": "std",
		}),
	)

	stdAdapter.Print("This is a message from the standard logger")
	stdAdapter.Printf("This is a formatted message: %d", 42)
	stdAdapter.Println("This is a message with a newline")

	// Example 2: Logrus adapter
	logrusLogger := logrus.New()
	logrusLogger.SetLevel(logrus.DebugLevel)
	logrusHook := adapters.NewLogrusHook("logrus-log",
		adapters.WithLogrusContext(map[string]interface{}{
			"adapter": "logrus",
		}),
	)
	logrusLogger.AddHook(logrusHook)

	logrusLogger.Debug("This is a debug message from logrus")
	logrusLogger.Info("This is an info message from logrus")
	logrusLogger.Warn("This is a warning message from logrus")
	logrusLogger.Error("This is an error message from logrus")

	logrusLogger.WithFields(logrus.Fields{
		"user":   "john.doe",
		"action": "login",
	}).Info("User logged in")

	logrusLogger.WithError(errors.New("something went wrong")).Error("Operation failed")

	// Example 3: Zap adapter
	zapCore := adapters.NewZapCore("zap-log", zapcore.DebugLevel,
		adapters.WithZapContext(map[string]interface{}{
			"adapter": "zap",
		}),
	)
	zapLogger := zap.New(zapCore)

	zapLogger.Debug("This is a debug message from zap")
	zapLogger.Info("This is an info message from zap")
	zapLogger.Warn("This is a warning message from zap")
	zapLogger.Error("This is an error message from zap")

	zapLogger.Info("User logged in",
		zap.String("user", "john.doe"),
		zap.String("action", "login"),
	)

	zapLogger.Error("Operation failed",
		zap.Error(errors.New("something went wrong")),
	)

	// Flush any pending logs
	neurallog.FlushAll()
}
