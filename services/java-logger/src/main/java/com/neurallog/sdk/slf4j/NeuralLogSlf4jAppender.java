package com.neurallog.sdk.slf4j;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.classic.spi.ThrowableProxy;
import ch.qos.logback.core.AppenderBase;
import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.LogLevel;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

import java.util.HashMap;
import java.util.Map;

/**
 * NeuralLog appender for Logback (SLF4J implementation).
 *
 * This appender forwards Logback log events to NeuralLog.
 *
 * Example configuration in logback.xml:
 *
 * <pre>
 * &lt;appender name="NEURALLOG" class="com.neurallog.sdk.slf4j.NeuralLogSlf4jAppender"&gt;
 *     &lt;logName&gt;my-application&lt;/logName&gt;
 *     &lt;serverUrl&gt;http://localhost:3030&lt;/serverUrl&gt;
 *     &lt;namespace&gt;default&lt;/namespace&gt;
 * &lt;/appender&gt;
 *
 * &lt;root level="info"&gt;
 *     &lt;appender-ref ref="NEURALLOG" /&gt;
 * &lt;/root&gt;
 * </pre>
 */
public class NeuralLogSlf4jAppender extends AppenderBase<ILoggingEvent> {

    private String logName;
    private String serverUrl;
    private String namespace;
    private AILogger logger;

    /**
     * Set the log name.
     *
     * @param logName the log name
     */
    public void setLogName(String logName) {
        this.logName = logName;
    }

    /**
     * Set the server URL.
     *
     * @param serverUrl the server URL
     */
    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    /**
     * Set the namespace.
     *
     * @param namespace the namespace
     */
    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    @Override
    public void start() {
        if (logName == null || logName.isEmpty()) {
            addError("No logName provided for NeuralLogSlf4jAppender");
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

        super.start();
    }

    @Override
    protected void append(ILoggingEvent event) {
        if (!isStarted() || logger == null) {
            return;
        }

        // Convert Logback level to NeuralLog level
        LogLevel level = convertLevel(event.getLevel().toInt());

        // Extract MDC data
        Map<String, Object> data = new HashMap<>();
        try {
            Map<String, String> mdcMap = event.getMDCPropertyMap();
            if (mdcMap != null && !mdcMap.isEmpty()) {
                data.putAll(mdcMap);
            }
        } catch (NullPointerException e) {
            // Ignore MDC errors in tests
        }

        // Add logger name
        data.put("logger", event.getLoggerName());

        // Add thread name
        data.put("thread", event.getThreadName());

        // Get the message
        String message = event.getFormattedMessage();

        // Check if there's a throwable
        IThrowableProxy throwableProxy = event.getThrowableProxy();
        if (throwableProxy != null && throwableProxy instanceof ThrowableProxy) {
            Throwable throwable = ((ThrowableProxy) throwableProxy).getThrowable();
            logger.log(level, message, throwable, data);
        } else {
            logger.log(level, message, null, data);
        }
    }

    /**
     * Convert Logback level to NeuralLog level.
     *
     * @param logbackLevel the Logback level
     * @return the NeuralLog level
     */
    private LogLevel convertLevel(int logbackLevel) {
        // Logback levels: TRACE=5000, DEBUG=10000, INFO=20000, WARN=30000, ERROR=40000
        if (logbackLevel >= 40000) {
            return LogLevel.ERROR;
        } else if (logbackLevel >= 30000) {
            return LogLevel.WARN;
        } else if (logbackLevel >= 20000) {
            return LogLevel.INFO;
        } else if (logbackLevel >= 10000) {
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
