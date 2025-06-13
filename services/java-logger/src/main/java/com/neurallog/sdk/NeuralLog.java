package com.neurallog.sdk;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * NeuralLog - Main entry point for the NeuralLog Java SDK.
 *
 * This class provides static methods to configure the SDK and obtain logger instances.
 * It's designed to be the primary interface for applications using the SDK.
 */
public class NeuralLog {

    private static final Map<String, AILogger> loggers = new ConcurrentHashMap<>();
    private static NeuralLogConfig config = new NeuralLogConfig();

    /**
     * Private constructor to prevent instantiation.
     */
    private NeuralLog() {
        // Utility class, no instantiation
    }

    /**
     * Configure the NeuralLog SDK.
     *
     * @param config the configuration to use
     */
    public static void configure(NeuralLogConfig config) {
        NeuralLog.config = config;
    }

    /**
     * Get the current configuration.
     *
     * @return the current configuration
     */
    public static NeuralLogConfig getConfig() {
        return config;
    }

    /**
     * Get a logger for the specified log name.
     *
     * @param logName the name of the log
     * @return an AILogger instance
     */
    public static AILogger getLogger(String logName) {
        return loggers.computeIfAbsent(logName, name -> new AILoggerImpl(name, config));
    }

    /**
     * Get a logger for the specified class.
     *
     * @param clazz the class to get a logger for
     * @return an AILogger instance
     */
    public static AILogger getLogger(Class<?> clazz) {
        return getLogger(clazz.getName());
    }

    /**
     * Get a logger for the specified log name with a custom configuration.
     *
     * @param logName the name of the log
     * @param config the configuration to use
     * @return an AILogger instance
     */
    public static AILogger getLogger(String logName, NeuralLogConfig config) {
        return new AILoggerImpl(logName, config);
    }

    /**
     * Reset all loggers and configuration.
     * This is primarily used for testing.
     */
    static void reset() {
        loggers.clear();
        config = new NeuralLogConfig();
    }
}
