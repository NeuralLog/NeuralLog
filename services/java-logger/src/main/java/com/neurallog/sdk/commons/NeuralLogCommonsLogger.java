package com.neurallog.sdk.commons;

import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;
import org.apache.commons.logging.Log;

/**
 * NeuralLog implementation of Apache Commons Logging's Log interface.
 *
 * This class allows NeuralLog to be used as a logging implementation for
 * applications that use Apache Commons Logging.
 *
 * Example usage:
 *
 * <pre>
 * // Configure NeuralLog as the Commons Logging implementation
 * System.setProperty("org.apache.commons.logging.Log",
 *                    "com.neurallog.sdk.commons.NeuralLogCommonsLogger");
 *
 * // Get a logger
 * Log log = LogFactory.getLog("my-application");
 *
 * // Log messages
 * log.info("Hello, world!");
 * </pre>
 */
public class NeuralLogCommonsLogger implements Log {

    private final AILogger logger;

    /**
     * Create a new NeuralLogCommonsLogger with the specified name.
     *
     * @param name the logger name
     */
    public NeuralLogCommonsLogger(String name) {
        this.logger = getLogger(name);
    }

    /**
     * Create a new NeuralLogCommonsLogger with the specified name and configuration.
     *
     * @param name the logger name
     * @param config the configuration
     */
    public NeuralLogCommonsLogger(String name, NeuralLogConfig config) {
        this.logger = getLogger(name, config);
    }

    /**
     * Get a logger with the specified name.
     * This method can be overridden in tests to provide a mock logger.
     *
     * @param name the logger name
     * @return an AILogger instance
     */
    protected AILogger getLogger(String name) {
        return NeuralLog.getLogger(name);
    }

    /**
     * Get a logger with the specified name and configuration.
     * This method can be overridden in tests to provide a mock logger.
     *
     * @param name the logger name
     * @param config the configuration
     * @return an AILogger instance
     */
    protected AILogger getLogger(String name, NeuralLogConfig config) {
        return NeuralLog.getLogger(name, config);
    }

    @Override
    public boolean isDebugEnabled() {
        return logger.isDebugEnabled();
    }

    @Override
    public boolean isErrorEnabled() {
        return logger.isErrorEnabled();
    }

    @Override
    public boolean isFatalEnabled() {
        return logger.isFatalEnabled();
    }

    @Override
    public boolean isInfoEnabled() {
        return logger.isInfoEnabled();
    }

    @Override
    public boolean isTraceEnabled() {
        return logger.isTraceEnabled();
    }

    @Override
    public boolean isWarnEnabled() {
        return logger.isWarnEnabled();
    }

    @Override
    public void trace(Object message) {
        logger.trace(String.valueOf(message));
    }

    @Override
    public void trace(Object message, Throwable t) {
        logger.trace(String.valueOf(message), t);
    }

    @Override
    public void debug(Object message) {
        logger.debug(String.valueOf(message));
    }

    @Override
    public void debug(Object message, Throwable t) {
        logger.debug(String.valueOf(message), t);
    }

    @Override
    public void info(Object message) {
        logger.info(String.valueOf(message));
    }

    @Override
    public void info(Object message, Throwable t) {
        logger.info(String.valueOf(message), t);
    }

    @Override
    public void warn(Object message) {
        logger.warn(String.valueOf(message));
    }

    @Override
    public void warn(Object message, Throwable t) {
        logger.warn(String.valueOf(message), t);
    }

    @Override
    public void error(Object message) {
        logger.error(String.valueOf(message));
    }

    @Override
    public void error(Object message, Throwable t) {
        logger.error(String.valueOf(message), t);
    }

    @Override
    public void fatal(Object message) {
        logger.fatal(String.valueOf(message));
    }

    @Override
    public void fatal(Object message, Throwable t) {
        logger.fatal(String.valueOf(message), t);
    }
}
