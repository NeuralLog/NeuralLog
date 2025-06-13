package com.neurallog.examples;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.ThreadContext;

/**
 * An example demonstrating the use of the NeuralLog Java SDK with Log4j 2.
 * 
 * This example assumes you have configured log4j2.xml with the NeuralLog appender:
 * 
 * <Configuration>
 *   <Appenders>
 *     <NeuralLog name="NeuralLog" logName="log4j-example">
 *       <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
 *     </NeuralLog>
 *     <Console name="Console" target="SYSTEM_OUT">
 *       <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
 *     </Console>
 *   </Appenders>
 *   <Loggers>
 *     <Root level="info">
 *       <AppenderRef ref="NeuralLog"/>
 *       <AppenderRef ref="Console"/>
 *     </Root>
 *   </Loggers>
 * </Configuration>
 */
public class Log4jExample {
    private static final Logger logger = LogManager.getLogger(Log4jExample.class);

    public static void main(String[] args) {
        // Log a simple message
        logger.info("Application started");

        // Log with MDC (Mapped Diagnostic Context)
        ThreadContext.put("userId", "user-123");
        ThreadContext.put("sessionId", "session-456");
        logger.info("User logged in");

        // Log different levels
        logger.debug("This is a debug message");
        logger.info("This is an info message");
        logger.warn("This is a warning message");
        
        // Log an error with exception
        try {
            // Simulate an error
            int result = 10 / 0;
        } catch (Exception e) {
            ThreadContext.put("operation", "division");
            ThreadContext.put("errorType", "ArithmeticException");
            logger.error("An error occurred during calculation", e);
        }

        // Clear MDC
        ThreadContext.clearAll();

        // Log a message with parameters
        logger.info("User {} performed action {}", "john.doe", "login");

        System.out.println("Example completed. Check the NeuralLog server for logs.");
    }
}
