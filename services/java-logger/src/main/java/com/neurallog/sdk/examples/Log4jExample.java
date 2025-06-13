package com.neurallog.sdk.examples;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.ThreadContext;

/**
 * Example demonstrating the use of the NeuralLog Log4j appender.
 * 
 * This example requires the Log4j configuration file to be set up with the NeuralLog appender.
 * See src/main/resources/log4j2-example.xml for an example configuration.
 */
public class Log4jExample {
    
    private static final Logger logger = LogManager.getLogger(Log4jExample.class);
    
    public static void main(String[] args) {
        // Simple logging
        logger.info("Hello from Log4j with NeuralLog appender!");
        
        // Logging with MDC (Mapped Diagnostic Context)
        ThreadContext.put("user", "john.doe");
        ThreadContext.put("action", "login");
        ThreadContext.put("ip", "192.168.1.1");
        logger.info("User logged in");
        ThreadContext.clearAll();
        
        // Log different levels
        logger.debug("This is a debug message");
        logger.warn("This is a warning message");
        
        // Logging an exception
        try {
            // Some code that might throw an exception
            throw new RuntimeException("Something went wrong");
        } catch (Exception e) {
            logger.error("Failed to process request", e);
        }
        
        // Wait a bit for async logs to be sent
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("Example completed. Check the NeuralLog server for logs.");
    }
}
