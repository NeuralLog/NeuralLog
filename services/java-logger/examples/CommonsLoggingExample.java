package com.neurallog.examples;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * An example demonstrating the use of the NeuralLog Java SDK with Apache Commons Logging.
 * 
 * This example assumes you have configured the system property:
 * System.setProperty("org.apache.commons.logging.Log", "com.neurallog.sdk.commons.NeuralLogCommonsLogger");
 */
public class CommonsLoggingExample {
    
    static {
        // Configure NeuralLog as the Commons Logging implementation
        System.setProperty("org.apache.commons.logging.Log", "com.neurallog.sdk.commons.NeuralLogCommonsLogger");
        
        // Configure NeuralLog
        System.setProperty("neurallog.serverUrl", "http://localhost:3030");
        System.setProperty("neurallog.namespace", "default");
        System.setProperty("neurallog.asyncEnabled", "true");
    }
    
    private static final Log logger = LogFactory.getLog(CommonsLoggingExample.class);

    public static void main(String[] args) {
        // Log a simple message
        logger.info("Application started");

        // Log different levels
        logger.debug("This is a debug message");
        logger.info("This is an info message");
        logger.warn("This is a warning message");
        
        // Log an error with exception
        try {
            // Simulate an error
            int result = 10 / 0;
        } catch (Exception e) {
            logger.error("An error occurred during calculation", e);
        }

        // Wait for async logs to be sent
        try {
            Thread.sleep(6000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Example completed. Check the NeuralLog server for logs.");
    }
}
