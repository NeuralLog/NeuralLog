package com.neurallog.examples;

import com.neurallog.sdk.jul.NeuralLogJulHandler;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * An example demonstrating the use of the NeuralLog Java SDK with Java Util Logging (JUL).
 */
public class JulExample {
    private static final Logger logger = Logger.getLogger(JulExample.class.getName());

    public static void main(String[] args) {
        // Configure the NeuralLog handler
        NeuralLogJulHandler handler = new NeuralLogJulHandler("jul-example");
        logger.addHandler(handler);
        logger.setLevel(Level.INFO);
        
        // Remove console handler to avoid duplicate logs
        Logger rootLogger = Logger.getLogger("");
        rootLogger.removeHandler(rootLogger.getHandlers()[0]);

        // Log a simple message
        logger.info("Application started");

        // Log different levels
        logger.fine("This is a fine message (debug)");
        logger.info("This is an info message");
        logger.warning("This is a warning message");
        
        // Log an error with exception
        try {
            // Simulate an error
            int result = 10 / 0;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "An error occurred during calculation", e);
        }

        // Log a message with parameters
        logger.log(Level.INFO, "User {0} performed action {1}", new Object[]{"john.doe", "login"});

        System.out.println("Example completed. Check the NeuralLog server for logs.");
    }
}
