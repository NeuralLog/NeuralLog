package com.neurallog.examples;

import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

import java.util.HashMap;
import java.util.Map;

/**
 * A simple example demonstrating the use of the NeuralLog Java SDK.
 */
public class SimpleExample {
    public static void main(String[] args) {
        // Configure the SDK
        NeuralLogConfig config = new NeuralLogConfig()
            .setServerUrl("http://localhost:3030")
            .setNamespace("default")
            .setAsyncEnabled(true)
            .setBatchSize(10)
            .setBatchIntervalMs(5000);
        NeuralLog.configure(config);

        // Get a logger
        AILogger logger = NeuralLog.getLogger("simple-example");

        // Log a simple message
        logger.info("Application started");

        // Log with structured data
        Map<String, Object> userData = new HashMap<>();
        userData.put("userId", "user-123");
        userData.put("username", "john.doe");
        userData.put("email", "john.doe@example.com");
        userData.put("role", "admin");
        logger.info("User logged in", userData);

        // Log different levels
        logger.debug("This is a debug message");
        logger.info("This is an info message");
        logger.warn("This is a warning message");
        
        // Log an error with exception
        try {
            // Simulate an error
            int result = 10 / 0;
        } catch (Exception e) {
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("operation", "division");
            errorData.put("errorType", "ArithmeticException");
            logger.error("An error occurred during calculation", e, errorData);
        }

        // Log a complex object
        User user = new User("user-456", "jane.doe", "jane.doe@example.com", "user");
        logger.info("User details", user);

        // Wait for async logs to be sent
        try {
            Thread.sleep(6000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Example completed. Check the NeuralLog server for logs.");
    }

    /**
     * A simple POJO class for demonstration.
     */
    static class User {
        private String id;
        private String username;
        private String email;
        private String role;

        public User(String id, String username, String email, String role) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.role = role;
        }

        public String getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }

        @Override
        public String toString() {
            return "User{" +
                    "id='" + id + '\'' +
                    ", username='" + username + '\'' +
                    ", email='" + email + '\'' +
                    ", role='" + role + '\'' +
                    '}';
        }
    }
}
