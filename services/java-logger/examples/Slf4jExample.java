package com.neurallog.examples;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

/**
 * An example demonstrating the use of the NeuralLog Java SDK with SLF4J/Logback.
 * 
 * This example assumes you have configured logback.xml with the NeuralLog appender:
 * 
 * <configuration>
 *   <appender name="NEURALLOG" class="com.neurallog.sdk.slf4j.NeuralLogSlf4jAppender">
 *     <logName>slf4j-example</logName>
 *   </appender>
 *   
 *   <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
 *     <encoder>
 *       <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
 *     </encoder>
 *   </appender>
 *   
 *   <root level="info">
 *     <appender-ref ref="NEURALLOG" />
 *     <appender-ref ref="CONSOLE" />
 *   </root>
 * </configuration>
 */
public class Slf4jExample {
    private static final Logger logger = LoggerFactory.getLogger(Slf4jExample.class);

    public static void main(String[] args) {
        // Log a simple message
        logger.info("Application started");

        // Log with MDC (Mapped Diagnostic Context)
        MDC.put("userId", "user-123");
        MDC.put("sessionId", "session-456");
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
            MDC.put("operation", "division");
            MDC.put("errorType", "ArithmeticException");
            logger.error("An error occurred during calculation", e);
        }

        // Clear MDC
        MDC.clear();

        // Log a message with parameters
        logger.info("User {} performed action {}", "john.doe", "login");

        System.out.println("Example completed. Check the NeuralLog server for logs.");
    }
}
