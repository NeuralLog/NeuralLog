package com.neurallog.sdk.examples;

import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Example demonstrating JSON serialization features of the NeuralLog Java SDK.
 */
public class JsonSerializationExample {

    /**
     * Sample POJO class for demonstration.
     */
    public static class User {
        private String id;
        private String username;
        private String email;
        private LocalDateTime createdAt;
        private Map<String, Object> metadata;

        public User() {
        }

        public User(String id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.createdAt = LocalDateTime.now();
            this.metadata = new HashMap<>();
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

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public Map<String, Object> getMetadata() {
            return metadata;
        }

        public void setMetadata(Map<String, Object> metadata) {
            this.metadata = metadata;
        }

        public void addMetadata(String key, Object value) {
            if (this.metadata == null) {
                this.metadata = new HashMap<>();
            }
            this.metadata.put(key, value);
        }
    }

    /**
     * Sample POJO class for demonstration.
     */
    public static class LoginEvent {
        private String userId;
        private String ipAddress;
        private String userAgent;
        private LocalDateTime timestamp;
        private boolean successful;
        private String failureReason;

        public LoginEvent() {
        }

        public LoginEvent(String userId, String ipAddress, String userAgent, boolean successful) {
            this.userId = userId;
            this.ipAddress = ipAddress;
            this.userAgent = userAgent;
            this.timestamp = LocalDateTime.now();
            this.successful = successful;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getIpAddress() {
            return ipAddress;
        }

        public void setIpAddress(String ipAddress) {
            this.ipAddress = ipAddress;
        }

        public String getUserAgent() {
            return userAgent;
        }

        public void setUserAgent(String userAgent) {
            this.userAgent = userAgent;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public boolean isSuccessful() {
            return successful;
        }

        public void setSuccessful(boolean successful) {
            this.successful = successful;
        }

        public String getFailureReason() {
            return failureReason;
        }

        public void setFailureReason(String failureReason) {
            this.failureReason = failureReason;
        }
    }

    public static void main(String[] args) {
        // Configure the SDK
        NeuralLogConfig config = new NeuralLogConfig()
            .setServerUrl("http://localhost:3030")
            .setNamespace("examples");

        // Configure the SDK
        NeuralLog.configure(config);

        // Get a logger
        AILogger logger = NeuralLog.getLogger("json-serialization-example");

        // Example 1: Log a simple POJO
        User user = new User("123", "johndoe", "john.doe@example.com");
        user.addMetadata("role", "admin");
        user.addMetadata("lastLogin", LocalDateTime.now().minusDays(1));

        logger.info("User created", user);

        // Example 2: Log a collection of POJOs
        List<User> users = new ArrayList<>();
        users.add(new User("123", "johndoe", "john.doe@example.com"));
        users.add(new User("456", "janedoe", "jane.doe@example.com"));
        users.add(new User("789", "bobsmith", "bob.smith@example.com"));

        logger.info("Users created", users);

        // Example 3: Log a complex event
        LoginEvent loginEvent = new LoginEvent(
            "123",
            "192.168.1.1",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            true
        );

        logger.info("User logged in", loginEvent);

        // Example 4: Log a failed login event
        LoginEvent failedLoginEvent = new LoginEvent(
            "456",
            "192.168.1.2",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            false
        );
        failedLoginEvent.setFailureReason("Invalid password");

        logger.warn("Login failed", failedLoginEvent);

        // Example 5: Log an exception with context
        try {
            // Simulate an exception
            throw new RuntimeException("Something went wrong");
        } catch (Exception e) {
            // Log the exception with context
            Map<String, Object> context = new HashMap<>();
            context.put("user", user);
            context.put("requestId", "req-123456");
            context.put("endpoint", "/api/users");

            logger.error("Failed to process request", e, context);
        }

        // Example 6: Log an exception with a POJO
        try {
            // Simulate an exception
            throw new RuntimeException("Failed to authenticate user");
        } catch (Exception e) {
            // Log the exception with a POJO
            Map<String, Object> data = new HashMap<>();
            data.put("loginEvent", failedLoginEvent);
            logger.error("Authentication failed", e, data);
        }

        System.out.println("Examples completed. Check your NeuralLog server for the logs.");
    }
}
