package com.neurallog.sdk.examples;

import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

import java.util.HashMap;
import java.util.Map;

/**
 * Simple example demonstrating the use of the NeuralLog Java SDK.
 */
public class SimpleExample {
    
    public static void main(String[] args) {
        // Configure the SDK (optional)
        NeuralLogConfig config = new NeuralLogConfig()
            .setServerUrl("http://localhost:3030")
            .setNamespace("default");
        NeuralLog.configure(config);
        
        // Get a logger
        AILogger logger = NeuralLog.getLogger("java-example");
        
        // Log a simple message
        logger.info("Hello from NeuralLog Java SDK!");
        
        // Log with structured data
        Map<String, Object> data = new HashMap<>();
        data.put("user", "john.doe");
        data.put("action", "login");
        data.put("ip", "192.168.1.1");
        logger.info("User logged in", data);
        
        // Log different levels
        logger.debug("This is a debug message");
        logger.warn("This is a warning message");
        
        // Log an error with exception
        try {
            // Some code that might throw an exception
            throw new RuntimeException("Something went wrong");
        } catch (Exception e) {
            logger.error("Failed to process request", e);
        }
        
        // Log with complex structured data
        Map<String, Object> complexData = new HashMap<>();
        complexData.put("requestId", "req-123");
        
        Map<String, Object> user = new HashMap<>();
        user.put("id", "user-456");
        user.put("name", "John Doe");
        user.put("email", "john.doe@example.com");
        
        Map<String, Object> device = new HashMap<>();
        device.put("type", "mobile");
        device.put("os", "Android");
        device.put("version", "12");
        
        complexData.put("user", user);
        complexData.put("device", device);
        complexData.put("timestamp", System.currentTimeMillis());
        
        logger.info("User performed action on mobile device", complexData);
        
        // Wait a bit for async logs to be sent
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("Example completed. Check the NeuralLog server for logs.");
    }
}
