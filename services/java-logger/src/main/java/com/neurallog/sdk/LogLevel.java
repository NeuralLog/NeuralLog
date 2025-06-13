package com.neurallog.sdk;

/**
 * Log levels for the NeuralLog SDK.
 * 
 * These levels match the standard Log4j levels for compatibility.
 */
public enum LogLevel {
    TRACE(0),
    DEBUG(1),
    INFO(2),
    WARN(3),
    ERROR(4),
    FATAL(5);
    
    private final int value;
    
    LogLevel(int value) {
        this.value = value;
    }
    
    /**
     * Get the numeric value of this log level.
     * 
     * @return the numeric value
     */
    public int getValue() {
        return value;
    }
    
    /**
     * Check if this log level is more severe than or equal to the specified level.
     * 
     * @param other the other log level
     * @return true if this level is more severe than or equal to the other level
     */
    public boolean isMoreSevereOrEqual(LogLevel other) {
        return this.value >= other.value;
    }
    
    /**
     * Convert a Log4j level to a NeuralLog level.
     * 
     * @param log4jLevel the Log4j level name
     * @return the corresponding NeuralLog level
     */
    public static LogLevel fromLog4j(String log4jLevel) {
        try {
            return LogLevel.valueOf(log4jLevel);
        } catch (IllegalArgumentException e) {
            // Handle special cases or fallbacks
            if ("ALL".equals(log4jLevel)) {
                return TRACE;
            } else if ("OFF".equals(log4jLevel)) {
                return FATAL;
            } else {
                return INFO; // Default to INFO
            }
        }
    }
}
