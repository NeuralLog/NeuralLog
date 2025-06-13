package com.neurallog.sdk.jul;

import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.LogLevel;
import com.neurallog.sdk.NeuralLogConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Map;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for the NeuralLogJulHandler.
 */
public class NeuralLogJulHandlerTest {

    @Mock
    private AILogger mockLogger;

    private NeuralLogJulHandler handler;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);

        // Create the handler
        handler = new NeuralLogJulHandler("test-log") {
            @Override
            protected AILogger getLogger(String logName, NeuralLogConfig config) {
                return mockLogger;
            }
        };
    }

    @Test
    public void testSimpleLogging() {
        // Create a log record
        LogRecord record = new LogRecord(Level.INFO, "Test message");
        record.setLoggerName("test-logger");
        record.setSourceClassName("com.example.TestClass");
        record.setSourceMethodName("testMethod");

        // Process the record
        handler.publish(record);

        // Verify that the logger was called
        verify(mockLogger).log(eq(LogLevel.INFO), eq("Test message"), any(Map.class));
    }

    @Test
    public void testParameterizedLogging() {
        // Create a log record with parameters
        LogRecord record = new LogRecord(Level.INFO, "User {0} logged in from {1}");
        record.setParameters(new Object[]{"johndoe", "192.168.1.1"});
        record.setLoggerName("test-logger");

        // Process the record
        handler.publish(record);

        // Verify that the logger was called with the formatted message
        verify(mockLogger).log(eq(LogLevel.INFO), eq("User johndoe logged in from 192.168.1.1"), any(Map.class));
    }

    @Test
    public void testExceptionLogging() {
        // Create an exception
        Exception exception = new RuntimeException("Test exception");

        // Create a log record with an exception
        LogRecord record = new LogRecord(Level.SEVERE, "Test error");
        record.setThrown(exception);
        record.setLoggerName("test-logger");

        // Process the record
        handler.publish(record);

        // Verify that the logger was called with the exception
        verify(mockLogger).log(eq(LogLevel.ERROR), eq("Test error"), eq(exception), any(Map.class));
    }

    @Test
    public void testLevelConversion() {
        // Test different levels
        testLevel(Level.FINEST, LogLevel.TRACE);
        testLevel(Level.FINER, LogLevel.TRACE);
        testLevel(Level.FINE, LogLevel.DEBUG);
        testLevel(Level.CONFIG, LogLevel.DEBUG);
        testLevel(Level.INFO, LogLevel.INFO);
        testLevel(Level.WARNING, LogLevel.WARN);
        testLevel(Level.SEVERE, LogLevel.ERROR);
    }

    private void testLevel(Level julLevel, LogLevel expectedLevel) {
        // Create a log record with the specified level
        LogRecord record = new LogRecord(julLevel, "Test message");
        record.setLoggerName("test-logger");

        // Process the record
        handler.publish(record);

        // Verify that the logger was called with the expected level
        verify(mockLogger, atLeastOnce()).log(eq(expectedLevel), eq("Test message"), any(Map.class));
    }
}
