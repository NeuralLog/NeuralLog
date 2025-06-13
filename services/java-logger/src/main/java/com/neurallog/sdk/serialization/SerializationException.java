package com.neurallog.sdk.serialization;

/**
 * Exception thrown when serialization or deserialization fails.
 */
public class SerializationException extends RuntimeException {
    
    /**
     * Create a new SerializationException.
     * 
     * @param message the error message
     */
    public SerializationException(String message) {
        super(message);
    }
    
    /**
     * Create a new SerializationException.
     * 
     * @param message the error message
     * @param cause the cause
     */
    public SerializationException(String message, Throwable cause) {
        super(message, cause);
    }
}
