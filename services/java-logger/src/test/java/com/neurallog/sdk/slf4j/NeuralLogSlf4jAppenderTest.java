package com.neurallog.sdk.slf4j;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.LoggingEvent;
import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.LogLevel;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.slf4j.MDC;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for the NeuralLogSlf4jAppender.
 */
public class NeuralLogSlf4jAppenderTest {

    @Mock
    private AILogger mockLogger;

    private NeuralLogSlf4jAppender appender;
    private Logger logger;
    private LoggerContext loggerContext;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);

        // Create a logger context
        loggerContext = new LoggerContext();
        logger = loggerContext.getLogger("test-logger");

        // Create the appender
        appender = new NeuralLogSlf4jAppender() {
            @Override
            protected AILogger getLogger(String logName, NeuralLogConfig config) {
                return mockLogger;
            }
        };
        appender.setContext(loggerContext);
        appender.setLogName("test-log");

        // Force the logger field to be set
        try {
            java.lang.reflect.Field loggerField = NeuralLogSlf4jAppender.class.getDeclaredField("logger");
            loggerField.setAccessible(true);
            loggerField.set(appender, mockLogger);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set logger field", e);
        }

        appender.start();

        // Add the appender to the logger
        logger.addAppender(appender);
        logger.setLevel(Level.INFO);
    }

    @Test
    public void testSimpleLogging() {
        // Create a properly initialized logging event

        // Create a fully initialized LoggingEvent
        LoggingEvent event = new LoggingEvent();
        event.setLoggerName("test-logger");
        event.setLevel(Level.INFO);
        event.setMessage("Test message");
        event.setThreadName("main");
        event.setTimeStamp(System.currentTimeMillis());

        // Set the logger context
        event.setLoggerContext(loggerContext);

        // Process the event directly
        appender.append(event);

        // Verify that the logger was called
        verify(mockLogger).log(eq(LogLevel.INFO), eq("Test message"), eq(null), any());
    }

    @Test
    public void testStructuredLogging() {
        // Add MDC data
        MDC.put("user", "johndoe");
        MDC.put("requestId", "123456");

        try {
            // Create a fully initialized LoggingEvent
            LoggingEvent event = new LoggingEvent();
            event.setLoggerName("test-logger");
            event.setLevel(Level.INFO);
            event.setMessage("Test message with MDC");
            event.setThreadName("main");
            event.setTimeStamp(System.currentTimeMillis());

            // Set the logger context
            event.setLoggerContext(loggerContext);

            // Add MDC data to the event
            Map<String, String> mdcMap = new HashMap<>();
            mdcMap.put("user", "johndoe");
            mdcMap.put("requestId", "123456");
            event.setMDCPropertyMap(mdcMap);

            // Process the event directly
            appender.append(event);

            // Verify that the logger was called with MDC data
            Map<String, Object> expectedData = new HashMap<>();
            expectedData.put("user", "johndoe");
            expectedData.put("requestId", "123456");
            expectedData.put("logger", "test-logger");
            expectedData.put("thread", "main");

            verify(mockLogger).log(eq(LogLevel.INFO), eq("Test message with MDC"), eq(null), any());
        } finally {
            MDC.clear();
        }
    }

    @Test
    public void testExceptionLogging() {
        // Create an exception
        Exception exception = new RuntimeException("Test exception");

        // Create a fully initialized LoggingEvent with an exception
        LoggingEvent event = new LoggingEvent();
        event.setLoggerName("test-logger");
        event.setLevel(Level.ERROR);
        event.setMessage("Test error");
        event.setThreadName("main");
        event.setTimeStamp(System.currentTimeMillis());
        event.setThrowableProxy(new ch.qos.logback.classic.spi.ThrowableProxy(exception));

        // Set the logger context
        event.setLoggerContext(loggerContext);

        // Process the event directly
        appender.append(event);

        // Verify that the logger was called with the exception
        verify(mockLogger).log(eq(LogLevel.ERROR), eq("Test error"), eq(exception), any());
    }
}
