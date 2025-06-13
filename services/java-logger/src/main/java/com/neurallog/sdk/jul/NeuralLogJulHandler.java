package com.neurallog.sdk.jul;

import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.LogLevel;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 * NeuralLog handler for Java Util Logging (JUL).
 *
 * This handler forwards JUL log records to NeuralLog.
 *
 * Example configuration in logging.properties:
 *
 * <pre>
 * handlers = com.neurallog.sdk.jul.NeuralLogJulHandler
 * com.neurallog.sdk.jul.NeuralLogJulHandler.logName = my-application
 * com.neurallog.sdk.jul.NeuralLogJulHandler.serverUrl = http://localhost:3030
 * com.neurallog.sdk.jul.NeuralLogJulHandler.namespace = default
 * </pre>
 *
 * Or programmatically:
 *
 * <pre>
 * Logger logger = Logger.getLogger("com.example");
 * NeuralLogJulHandler handler = new NeuralLogJulHandler("my-application");
 * handler.setServerUrl("http://localhost:3030");
 * handler.setNamespace("default");
 * logger.addHandler(handler);
 * </pre>
 */
public class NeuralLogJulHandler extends Handler {

    private String logName;
    private String serverUrl;
    private String namespace;
    private AILogger logger;

    /**
     * Create a new NeuralLogJulHandler with default configuration.
     */
    public NeuralLogJulHandler() {
        this.logName = "jul-logs";
    }

    /**
     * Create a new NeuralLogJulHandler with the specified log name.
     *
     * @param logName the log name
     */
    public NeuralLogJulHandler(String logName) {
        this.logName = logName;
    }

    /**
     * Set the log name.
     *
     * @param logName the log name
     */
    public void setLogName(String logName) {
        this.logName = logName;
        initLogger();
    }

    /**
     * Set the server URL.
     *
     * @param serverUrl the server URL
     */
    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
        initLogger();
    }

    /**
     * Set the namespace.
     *
     * @param namespace the namespace
     */
    public void setNamespace(String namespace) {
        this.namespace = namespace;
        initLogger();
    }

    /**
     * Initialize the logger.
     */
    private void initLogger() {
        if (logName == null || logName.isEmpty()) {
            return;
        }

        // Create a configuration
        NeuralLogConfig config = new NeuralLogConfig();
        if (serverUrl != null && !serverUrl.isEmpty()) {
            config.setServerUrl(serverUrl);
        }
        if (namespace != null && !namespace.isEmpty()) {
            config.setNamespace(namespace);
        }

        // Get a logger
        logger = getLogger(logName, config);
    }

    @Override
    public void publish(LogRecord record) {
        if (logger == null) {
            initLogger();
            if (logger == null) {
                return;
            }
        }

        // Convert JUL level to NeuralLog level
        LogLevel level = convertLevel(record.getLevel());

        // Extract data
        Map<String, Object> data = new HashMap<>();
        data.put("logger", record.getLoggerName());
        data.put("thread", Thread.currentThread().getName());
        data.put("sequence", record.getSequenceNumber());
        if (record.getSourceClassName() != null) {
            data.put("class", record.getSourceClassName());
        }
        if (record.getSourceMethodName() != null) {
            data.put("method", record.getSourceMethodName());
        }

        // Get the message
        String message = record.getMessage();
        if (record.getParameters() != null && record.getParameters().length > 0) {
            try {
                // Use MessageFormat instead of String.format for JUL parameter formatting
                java.text.MessageFormat formatter = new java.text.MessageFormat(message);
                message = formatter.format(record.getParameters());
            } catch (Exception e) {
                // Ignore formatting errors
            }
        }

        // Check if there's a throwable
        Throwable throwable = record.getThrown();
        if (throwable != null) {
            logger.log(level, message, throwable, data);
        } else {
            logger.log(level, message, data);
        }
    }

    @Override
    public void flush() {
        // Nothing to flush
    }

    @Override
    public void close() throws SecurityException {
        // Nothing to close
    }

    /**
     * Convert JUL level to NeuralLog level.
     *
     * @param julLevel the JUL level
     * @return the NeuralLog level
     */
    private LogLevel convertLevel(Level julLevel) {
        int level = julLevel.intValue();
        if (level >= Level.SEVERE.intValue()) {
            return LogLevel.ERROR;
        } else if (level >= Level.WARNING.intValue()) {
            return LogLevel.WARN;
        } else if (level >= Level.INFO.intValue()) {
            return LogLevel.INFO;
        } else if (level >= Level.FINE.intValue()) {
            return LogLevel.DEBUG;
        } else {
            return LogLevel.TRACE;
        }
    }

    /**
     * Get a logger with the specified name and configuration.
     * This method can be overridden in tests to provide a mock logger.
     *
     * @param logName the log name
     * @param config the configuration
     * @return an AILogger instance
     */
    protected AILogger getLogger(String logName, NeuralLogConfig config) {
        return NeuralLog.getLogger(logName, config);
    }
}
