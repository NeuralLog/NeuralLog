package com.neurallog.sdk;

import java.util.Map;
import java.util.Collection;

/**
 * AILogger - Main interface for the NeuralLog Java SDK.
 *
 * This interface is designed to feel identical to Log4j while sending logs
 * to the NeuralLog server. It provides methods for logging at different levels
 * and supports both simple string messages and structured data.
 *
 * The interface also provides methods for logging objects directly, which will be
 * automatically serialized to JSON.
 *
 * It also provides methods for logging JSON objects directly, which is the
 * recommended approach for AI-friendly logging.
 */
public interface AILogger {

    /**
     * Log a message at the TRACE level.
     *
     * @param message the message to log
     */
    void trace(String message);

    /**
     * Log a message with parameters at the TRACE level.
     *
     * @param message the message to log
     * @param data additional structured data to include with the log
     */
    void trace(String message, Map<String, Object> data);

    /**
     * Log an object at the TRACE level. The object will be serialized to JSON.
     *
     * @param message the message to log
     * @param object the object to log (will be serialized to JSON)
     */
    void trace(String message, Object object);

    /**
     * Log a message with an exception at the TRACE level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     */
    void trace(String message, Throwable throwable);

    /**
     * Log a message with an exception and additional data at the TRACE level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     * @param data additional structured data to include with the log
     */
    void trace(String message, Throwable throwable, Map<String, Object> data);

    /**
     * Log a message at the DEBUG level.
     *
     * @param message the message to log
     */
    void debug(String message);

    /**
     * Log a message with parameters at the DEBUG level.
     *
     * @param message the message to log
     * @param data additional structured data to include with the log
     */
    void debug(String message, Map<String, Object> data);

    /**
     * Log an object at the DEBUG level. The object will be serialized to JSON.
     *
     * @param message the message to log
     * @param object the object to log (will be serialized to JSON)
     */
    void debug(String message, Object object);

    /**
     * Log a message with an exception at the DEBUG level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     */
    void debug(String message, Throwable throwable);

    /**
     * Log a message with an exception and additional data at the DEBUG level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     * @param data additional structured data to include with the log
     */
    void debug(String message, Throwable throwable, Map<String, Object> data);

    /**
     * Log a message at the INFO level.
     *
     * @param message the message to log
     */
    void info(String message);

    /**
     * Log a message with parameters at the INFO level.
     *
     * @param message the message to log
     * @param data additional structured data to include with the log
     */
    void info(String message, Map<String, Object> data);

    /**
     * Log an object at the INFO level. The object will be serialized to JSON.
     *
     * @param message the message to log
     * @param object the object to log (will be serialized to JSON)
     */
    void info(String message, Object object);

    /**
     * Log a message with an exception at the INFO level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     */
    void info(String message, Throwable throwable);

    /**
     * Log a message with an exception and additional data at the INFO level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     * @param data additional structured data to include with the log
     */
    void info(String message, Throwable throwable, Map<String, Object> data);

    /**
     * Log a message at the WARN level.
     *
     * @param message the message to log
     */
    void warn(String message);

    /**
     * Log a message with parameters at the WARN level.
     *
     * @param message the message to log
     * @param data additional structured data to include with the log
     */
    void warn(String message, Map<String, Object> data);

    /**
     * Log an object at the WARN level. The object will be serialized to JSON.
     *
     * @param message the message to log
     * @param object the object to log (will be serialized to JSON)
     */
    void warn(String message, Object object);

    /**
     * Log a message with an exception at the WARN level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     */
    void warn(String message, Throwable throwable);

    /**
     * Log a message with an exception and additional data at the WARN level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     * @param data additional structured data to include with the log
     */
    void warn(String message, Throwable throwable, Map<String, Object> data);

    /**
     * Log a message at the ERROR level.
     *
     * @param message the message to log
     */
    void error(String message);

    /**
     * Log a message with parameters at the ERROR level.
     *
     * @param message the message to log
     * @param data additional structured data to include with the log
     */
    void error(String message, Map<String, Object> data);

    /**
     * Log an object at the ERROR level. The object will be serialized to JSON.
     *
     * @param message the message to log
     * @param object the object to log (will be serialized to JSON)
     */
    void error(String message, Object object);

    /**
     * Log a message with an exception at the ERROR level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     */
    void error(String message, Throwable throwable);

    /**
     * Log a message with an exception and additional data at the ERROR level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     * @param data additional structured data to include with the log
     */
    void error(String message, Throwable throwable, Map<String, Object> data);

    /**
     * Log a message at the FATAL level.
     *
     * @param message the message to log
     */
    void fatal(String message);

    /**
     * Log a message with parameters at the FATAL level.
     *
     * @param message the message to log
     * @param data additional structured data to include with the log
     */
    void fatal(String message, Map<String, Object> data);

    /**
     * Log an object at the FATAL level. The object will be serialized to JSON.
     *
     * @param message the message to log
     * @param object the object to log (will be serialized to JSON)
     */
    void fatal(String message, Object object);

    /**
     * Log a message with an exception at the FATAL level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     */
    void fatal(String message, Throwable throwable);

    /**
     * Log a message with an exception and additional data at the FATAL level.
     *
     * @param message the message to log
     * @param throwable the exception to log
     * @param data additional structured data to include with the log
     */
    void fatal(String message, Throwable throwable, Map<String, Object> data);

    /**
     * Log a message at the specified level.
     *
     * @param level the log level
     * @param message the message to log
     */
    void log(LogLevel level, String message);

    /**
     * Log a message with parameters at the specified level.
     *
     * @param level the log level
     * @param message the message to log
     * @param data additional structured data to include with the log
     */
    void log(LogLevel level, String message, Map<String, Object> data);

    /**
     * Log an object at the specified level. The object will be serialized to JSON.
     *
     * @param level the log level
     * @param message the message to log
     * @param object the object to log (will be serialized to JSON)
     */
    void log(LogLevel level, String message, Object object);

    /**
     * Log a message with an exception at the specified level.
     *
     * @param level the log level
     * @param message the message to log
     * @param throwable the exception to log
     */
    void log(LogLevel level, String message, Throwable throwable);

    /**
     * Log a message with an exception and additional data at the specified level.
     *
     * @param level the log level
     * @param message the message to log
     * @param throwable the exception to log
     * @param data additional structured data to include with the log
     */
    void log(LogLevel level, String message, Throwable throwable, Map<String, Object> data);

    /**
     * Check if the TRACE level is enabled.
     *
     * @return true if TRACE is enabled
     */
    boolean isTraceEnabled();

    /**
     * Check if the DEBUG level is enabled.
     *
     * @return true if DEBUG is enabled
     */
    boolean isDebugEnabled();

    /**
     * Check if the INFO level is enabled.
     *
     * @return true if INFO is enabled
     */
    boolean isInfoEnabled();

    /**
     * Check if the WARN level is enabled.
     *
     * @return true if WARN is enabled
     */
    boolean isWarnEnabled();

    /**
     * Check if the ERROR level is enabled.
     *
     * @return true if ERROR is enabled
     */
    boolean isErrorEnabled();

    /**
     * Check if the FATAL level is enabled.
     *
     * @return true if FATAL is enabled
     */
    boolean isFatalEnabled();

    /**
     * Check if the specified level is enabled.
     *
     * @param level the log level
     * @return true if the specified level is enabled
     */
    boolean isEnabled(LogLevel level);
}
