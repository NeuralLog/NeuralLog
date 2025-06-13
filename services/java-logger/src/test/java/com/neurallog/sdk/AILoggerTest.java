package com.neurallog.sdk;

import com.neurallog.sdk.api.LogsApi;
import com.neurallog.sdk.client.ApiClient;
import com.neurallog.sdk.client.ApiException;
import com.neurallog.sdk.model.LogEntry;
import com.neurallog.sdk.serialization.JacksonSerializer;
import com.neurallog.sdk.serialization.JsonSerializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the AILogger implementation.
 */
public class AILoggerTest {

    @Mock
    private LogsApi logsApi;

    private AILogger logger;
    private NeuralLogConfig config;

    @BeforeEach
    public void setup() throws ApiException {
        MockitoAnnotations.openMocks(this);

        // Configure the SDK with a mock API client
        config = new NeuralLogConfig()
            .setServerUrl("http://localhost:3030")
            .setNamespace("test");

        // Create a logger that uses the mock API
        ApiClient apiClient = new ApiClient();
        apiClient.setBasePath(config.getServerUrl());

        // Create the logger
        logger = new AILoggerImpl("test-logger", config) {
            @Override
            protected LogsApi createLogsApi(ApiClient apiClient) {
                return logsApi;
            }
        };

        // Mock the API response
        when(logsApi.logsLogNamePatch(eq("test-logger"), any(), eq("test")))
            .thenReturn(null);
    }

    @Test
    public void testSimpleLogging() throws ApiException {
        // Log a simple message
        logger.info("Test message");

        // Verify that the API was called
        ArgumentCaptor<Object> requestCaptor = ArgumentCaptor.forClass(Object.class);
        verify(logsApi, timeout(5000)).logsLogNamePatch(
            eq("test-logger"),
            requestCaptor.capture(),
            eq("test")
        );

        // Verify the log entry
        @SuppressWarnings("unchecked")
        List<LogEntry> entries = (List<LogEntry>) requestCaptor.getValue();
        assertEquals(1, entries.size());

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) entries.get(0).getData();
        assertEquals("INFO", data.get("level"));
        assertEquals("Test message", data.get("message"));
    }

    @Test
    public void testStructuredLogging() throws ApiException {
        // Log with structured data
        Map<String, Object> data = new HashMap<>();
        data.put("test", true);
        data.put("count", 42);
        data.put("message", "This is a test");
        logger.info("Test message with data", data);

        // Verify that the API was called
        ArgumentCaptor<Object> requestCaptor = ArgumentCaptor.forClass(Object.class);
        verify(logsApi, timeout(5000)).logsLogNamePatch(
            eq("test-logger"),
            requestCaptor.capture(),
            eq("test")
        );

        // Verify the log entry
        @SuppressWarnings("unchecked")
        List<LogEntry> entries = (List<LogEntry>) requestCaptor.getValue();
        assertEquals(1, entries.size());

        @SuppressWarnings("unchecked")
        Map<String, Object> logData = (Map<String, Object>) entries.get(0).getData();
        assertEquals("INFO", logData.get("level"));
        assertEquals("Test message with data", logData.get("message"));

        @SuppressWarnings("unchecked")
        Map<String, Object> entryData = (Map<String, Object>) logData.get("data");
        assertNotNull(entryData);
        assertEquals(true, entryData.get("test"));
        assertEquals(42, entryData.get("count"));
        assertEquals("This is a test", entryData.get("message"));
    }

    @Test
    public void testObjectLogging() throws ApiException {
        // Create a test object
        TestUser user = new TestUser("123", "johndoe", "john.doe@example.com");

        // Log the object
        logger.info("User created", user);

        // Verify that the API was called
        ArgumentCaptor<Object> requestCaptor = ArgumentCaptor.forClass(Object.class);
        verify(logsApi, timeout(5000)).logsLogNamePatch(
            eq("test-logger"),
            requestCaptor.capture(),
            eq("test")
        );

        // Verify the log entry
        @SuppressWarnings("unchecked")
        List<LogEntry> entries = (List<LogEntry>) requestCaptor.getValue();
        assertEquals(1, entries.size());

        @SuppressWarnings("unchecked")
        Map<String, Object> logData = (Map<String, Object>) entries.get(0).getData();
        assertEquals("INFO", logData.get("level"));
        assertEquals("User created", logData.get("message"));

        @SuppressWarnings("unchecked")
        Map<String, Object> userData = (Map<String, Object>) logData.get("data");
        assertNotNull(userData);
        assertEquals("123", userData.get("id"));
        assertEquals("johndoe", userData.get("username"));
        assertEquals("john.doe@example.com", userData.get("email"));
    }

    @Test
    public void testExceptionLogging() throws ApiException {
        // Create an exception
        Exception exception = new RuntimeException("Test exception");

        // Log the exception
        logger.error("Test error", exception);

        // Verify that the API was called
        ArgumentCaptor<Object> requestCaptor = ArgumentCaptor.forClass(Object.class);
        verify(logsApi, timeout(5000)).logsLogNamePatch(
            eq("test-logger"),
            requestCaptor.capture(),
            eq("test")
        );

        // Verify the log entry
        @SuppressWarnings("unchecked")
        List<LogEntry> entries = (List<LogEntry>) requestCaptor.getValue();
        assertEquals(1, entries.size());

        @SuppressWarnings("unchecked")
        Map<String, Object> logData = (Map<String, Object>) entries.get(0).getData();
        assertEquals("ERROR", logData.get("level"));
        assertEquals("Test error", logData.get("message"));

        @SuppressWarnings("unchecked")
        Map<String, Object> errorData = (Map<String, Object>) logData.get("error");
        assertNotNull(errorData);
        assertEquals("Test exception", errorData.get("message"));
        assertEquals("java.lang.RuntimeException", errorData.get("name"));
        assertNotNull(errorData.get("stack"));
    }

    /**
     * Test user class for object serialization tests.
     */
    static class TestUser {
        private String id;
        private String username;
        private String email;

        public TestUser() {
        }

        public TestUser(String id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
