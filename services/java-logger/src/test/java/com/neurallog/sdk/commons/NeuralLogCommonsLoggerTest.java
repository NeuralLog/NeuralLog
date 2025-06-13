package com.neurallog.sdk.commons;

import com.neurallog.sdk.AILogger;
import org.apache.commons.logging.Log;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the NeuralLogCommonsLogger.
 */
public class NeuralLogCommonsLoggerTest {
    
    @Mock
    private AILogger mockLogger;
    
    private Log log;
    
    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        
        // Create the logger
        log = new NeuralLogCommonsLogger("test-log") {
            @Override
            protected AILogger getLogger(String name) {
                return mockLogger;
            }
        };
        
        // Mock the isXXXEnabled methods
        when(mockLogger.isTraceEnabled()).thenReturn(true);
        when(mockLogger.isDebugEnabled()).thenReturn(true);
        when(mockLogger.isInfoEnabled()).thenReturn(true);
        when(mockLogger.isWarnEnabled()).thenReturn(true);
        when(mockLogger.isErrorEnabled()).thenReturn(true);
        when(mockLogger.isFatalEnabled()).thenReturn(true);
    }
    
    @Test
    public void testIsEnabledMethods() {
        assertTrue(log.isTraceEnabled());
        assertTrue(log.isDebugEnabled());
        assertTrue(log.isInfoEnabled());
        assertTrue(log.isWarnEnabled());
        assertTrue(log.isErrorEnabled());
        assertTrue(log.isFatalEnabled());
        
        // Test when disabled
        when(mockLogger.isInfoEnabled()).thenReturn(false);
        assertFalse(log.isInfoEnabled());
    }
    
    @Test
    public void testTraceLogging() {
        // Log a simple message
        log.trace("Test trace message");
        
        // Verify that the logger was called
        verify(mockLogger).trace("Test trace message");
        
        // Log with an exception
        Exception exception = new RuntimeException("Test exception");
        log.trace("Test trace error", exception);
        
        // Verify that the logger was called with the exception
        verify(mockLogger).trace("Test trace error", exception);
    }
    
    @Test
    public void testDebugLogging() {
        // Log a simple message
        log.debug("Test debug message");
        
        // Verify that the logger was called
        verify(mockLogger).debug("Test debug message");
        
        // Log with an exception
        Exception exception = new RuntimeException("Test exception");
        log.debug("Test debug error", exception);
        
        // Verify that the logger was called with the exception
        verify(mockLogger).debug("Test debug error", exception);
    }
    
    @Test
    public void testInfoLogging() {
        // Log a simple message
        log.info("Test info message");
        
        // Verify that the logger was called
        verify(mockLogger).info("Test info message");
        
        // Log with an exception
        Exception exception = new RuntimeException("Test exception");
        log.info("Test info error", exception);
        
        // Verify that the logger was called with the exception
        verify(mockLogger).info("Test info error", exception);
    }
    
    @Test
    public void testWarnLogging() {
        // Log a simple message
        log.warn("Test warn message");
        
        // Verify that the logger was called
        verify(mockLogger).warn("Test warn message");
        
        // Log with an exception
        Exception exception = new RuntimeException("Test exception");
        log.warn("Test warn error", exception);
        
        // Verify that the logger was called with the exception
        verify(mockLogger).warn("Test warn error", exception);
    }
    
    @Test
    public void testErrorLogging() {
        // Log a simple message
        log.error("Test error message");
        
        // Verify that the logger was called
        verify(mockLogger).error("Test error message");
        
        // Log with an exception
        Exception exception = new RuntimeException("Test exception");
        log.error("Test error error", exception);
        
        // Verify that the logger was called with the exception
        verify(mockLogger).error("Test error error", exception);
    }
    
    @Test
    public void testFatalLogging() {
        // Log a simple message
        log.fatal("Test fatal message");
        
        // Verify that the logger was called
        verify(mockLogger).fatal("Test fatal message");
        
        // Log with an exception
        Exception exception = new RuntimeException("Test exception");
        log.fatal("Test fatal error", exception);
        
        // Verify that the logger was called with the exception
        verify(mockLogger).fatal("Test fatal error", exception);
    }
    
    @Test
    public void testObjectLogging() {
        // Log an object
        log.info(new TestObject("test"));
        
        // Verify that the logger was called with the string representation
        verify(mockLogger).info("TestObject{value=test}");
    }
    
    /**
     * Test object for object logging tests.
     */
    static class TestObject {
        private String value;
        
        public TestObject(String value) {
            this.value = value;
        }
        
        @Override
        public String toString() {
            return "TestObject{value=" + value + "}";
        }
    }
}
