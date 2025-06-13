package com.neurallog.sdk;

import com.neurallog.client.NeuralLogClient;
import com.neurallog.client.NeuralLogClientConfig;
import com.neurallog.client.exception.LogException;
import com.neurallog.client.model.SearchOptions;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Implementation of the AILogger interface.
 *
 * This class sends logs to the NeuralLog server using the NeuralLog client SDK.
 */
class AILoggerImpl implements AILogger {

    private final String logName;
    private final NeuralLogConfig config;
    private final ExecutorService executor;
    private final NeuralLogClient client;

    /**
     * Create a new AILoggerImpl.
     *
     * @param logName the log name
     * @param config the configuration
     */
    AILoggerImpl(String logName, NeuralLogConfig config) {
        this.logName = logName;
        this.config = config;
        this.executor = Executors.newCachedThreadPool();

        // Initialize the client
        NeuralLogClientConfig clientConfig = new NeuralLogClientConfig()
            .setTenantId(config.getNamespace())
            .setAuthUrl(config.getServerUrl())
            .setLogsUrl(config.getServerUrl());

        this.client = new NeuralLogClient(clientConfig);

        // Authenticate with API key if available
        String apiKey = config.getHeaders().get("Authorization");
        if (apiKey != null && apiKey.startsWith("Bearer ")) {
            apiKey = apiKey.substring("Bearer ".length());
            try {
                this.client.authenticateWithApiKey(apiKey);
            } catch (Exception e) {
                System.err.println("Failed to authenticate with API key: " + e.getMessage());
            }
        }
    }

    @Override
    public void trace(String message) {
        log(LogLevel.TRACE, message, null, null);
    }

    @Override
    public void trace(String message, Map<String, Object> data) {
        log(LogLevel.TRACE, message, null, data);
    }

    @Override
    public void trace(String message, Object object) {
        Map<String, Object> data = serializeObject(object);
        log(LogLevel.TRACE, message, null, data);
    }

    @Override
    public void trace(String message, Throwable throwable) {
        log(LogLevel.TRACE, message, throwable, null);
    }

    @Override
    public void trace(String message, Throwable throwable, Map<String, Object> data) {
        log(LogLevel.TRACE, message, throwable, data);
    }

    @Override
    public void debug(String message) {
        log(LogLevel.DEBUG, message, null, null);
    }

    @Override
    public void debug(String message, Map<String, Object> data) {
        log(LogLevel.DEBUG, message, null, data);
    }

    @Override
    public void debug(String message, Object object) {
        Map<String, Object> data = serializeObject(object);
        log(LogLevel.DEBUG, message, null, data);
    }

    @Override
    public void debug(String message, Throwable throwable) {
        log(LogLevel.DEBUG, message, throwable, null);
    }

    @Override
    public void debug(String message, Throwable throwable, Map<String, Object> data) {
        log(LogLevel.DEBUG, message, throwable, data);
    }

    @Override
    public void info(String message) {
        log(LogLevel.INFO, message, null, null);
    }

    @Override
    public void info(String message, Map<String, Object> data) {
        log(LogLevel.INFO, message, null, data);
    }

    @Override
    public void info(String message, Object object) {
        Map<String, Object> data = serializeObject(object);
        log(LogLevel.INFO, message, null, data);
    }

    @Override
    public void info(String message, Throwable throwable) {
        log(LogLevel.INFO, message, throwable, null);
    }

    @Override
    public void info(String message, Throwable throwable, Map<String, Object> data) {
        log(LogLevel.INFO, message, throwable, data);
    }

    @Override
    public void warn(String message) {
        log(LogLevel.WARN, message, null, null);
    }

    @Override
    public void warn(String message, Map<String, Object> data) {
        log(LogLevel.WARN, message, null, data);
    }

    @Override
    public void warn(String message, Object object) {
        Map<String, Object> data = serializeObject(object);
        log(LogLevel.WARN, message, null, data);
    }

    @Override
    public void warn(String message, Throwable throwable) {
        log(LogLevel.WARN, message, throwable, null);
    }

    @Override
    public void warn(String message, Throwable throwable, Map<String, Object> data) {
        log(LogLevel.WARN, message, throwable, data);
    }

    @Override
    public void error(String message) {
        log(LogLevel.ERROR, message, null, null);
    }

    @Override
    public void error(String message, Map<String, Object> data) {
        log(LogLevel.ERROR, message, null, data);
    }

    @Override
    public void error(String message, Object object) {
        Map<String, Object> data = serializeObject(object);
        log(LogLevel.ERROR, message, null, data);
    }

    @Override
    public void error(String message, Throwable throwable) {
        log(LogLevel.ERROR, message, throwable, null);
    }

    @Override
    public void error(String message, Throwable throwable, Map<String, Object> data) {
        log(LogLevel.ERROR, message, throwable, data);
    }

    @Override
    public void fatal(String message) {
        log(LogLevel.FATAL, message, null, null);
    }

    @Override
    public void fatal(String message, Map<String, Object> data) {
        log(LogLevel.FATAL, message, null, data);
    }

    @Override
    public void fatal(String message, Object object) {
        Map<String, Object> data = serializeObject(object);
        log(LogLevel.FATAL, message, null, data);
    }

    @Override
    public void fatal(String message, Throwable throwable) {
        log(LogLevel.FATAL, message, throwable, null);
    }

    @Override
    public void fatal(String message, Throwable throwable, Map<String, Object> data) {
        log(LogLevel.FATAL, message, throwable, data);
    }

    @Override
    public boolean isEnabled(LogLevel level) {
        return isLevelEnabled(level);
    }

    @Override
    public void log(LogLevel level, String message) {
        log(level, message, null, null);
    }

    @Override
    public void log(LogLevel level, String message, Map<String, Object> data) {
        log(level, message, null, data);
    }

    @Override
    public void log(LogLevel level, String message, Object object) {
        Map<String, Object> data = serializeObject(object);
        log(level, message, null, data);
    }

    @Override
    public void log(LogLevel level, String message, Throwable throwable) {
        log(level, message, throwable, null);
    }

    @Override
    public boolean isTraceEnabled() {
        return isLevelEnabled(LogLevel.TRACE);
    }

    @Override
    public boolean isDebugEnabled() {
        return isLevelEnabled(LogLevel.DEBUG);
    }

    @Override
    public boolean isInfoEnabled() {
        return isLevelEnabled(LogLevel.INFO);
    }

    @Override
    public boolean isWarnEnabled() {
        return isLevelEnabled(LogLevel.WARN);
    }

    @Override
    public boolean isErrorEnabled() {
        return isLevelEnabled(LogLevel.ERROR);
    }

    @Override
    public boolean isFatalEnabled() {
        return isLevelEnabled(LogLevel.FATAL);
    }

    /**
     * Check if a log level is enabled for this logger.
     *
     * @param level the log level
     * @return true if the level is enabled
     */
    private boolean isLevelEnabled(LogLevel level) {
        LogLevel configuredLevel = config.getLogLevel(logName);
        if (configuredLevel == null) {
            configuredLevel = LogLevel.INFO; // Default to INFO
        }
        return level.isMoreSevereOrEqual(configuredLevel);
    }

    /**
     * Log a message at the specified level.
     *
     * @param level the log level
     * @param message the message
     * @param throwable the throwable (may be null)
     * @param data additional data (may be null)
     */
    @Override
    public void log(LogLevel level, String message, Throwable throwable, Map<String, Object> data) {
        if (!isLevelEnabled(level)) {
            return;
        }

        // Create the log entry
        Map<String, Object> logData = new HashMap<>();
        logData.put("id", UUID.randomUUID().toString());
        logData.put("timestamp", Instant.now().toString());
        logData.put("level", level.name());
        logData.put("message", message);

        if (throwable != null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", throwable.getMessage());
            error.put("name", throwable.getClass().getName());
            error.put("stack", getStackTraceAsString(throwable));
            logData.put("error", error);
        }

        if (data != null) {
            logData.put("data", data);
        }

        // Send the log entry asynchronously
        CompletableFuture.runAsync(() -> {
            try {
                // Log the data using the client SDK
                client.log(logName, logData);
            } catch (LogException e) {
                System.err.println("Failed to send log: " + e.getMessage());
            } catch (Exception e) {
                System.err.println("Failed to send log: " + e.getMessage());
            }
        }, executor);
    }

    /**
     * Get a stack trace as a string.
     *
     * @param throwable the throwable
     * @return the stack trace as a string
     */
    private String getStackTraceAsString(Throwable throwable) {
        StringBuilder sb = new StringBuilder();
        sb.append(throwable.toString()).append("\n");

        for (StackTraceElement element : throwable.getStackTrace()) {
            sb.append("\tat ").append(element.toString()).append("\n");
        }

        Throwable cause = throwable.getCause();
        if (cause != null) {
            sb.append("Caused by: ");
            sb.append(getStackTraceAsString(cause));
        }

        return sb.toString();
    }

    /**
     * Serialize an object to a Map using the configured JSON serializer.
     *
     * @param object the object to serialize
     * @return the serialized object as a Map
     */
    private Map<String, Object> serializeObject(Object object) {
        if (object == null) {
            return new HashMap<>();
        }

        if (object instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) object;
            return map;
        }

        return config.getJsonSerializer().toMap(object);
    }
}
