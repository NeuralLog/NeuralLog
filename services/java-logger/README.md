# NeuralLog Java Logger

Java Logger for NeuralLog - a zero-knowledge logging system. This logger allows Java applications to send encrypted logs to a NeuralLog server, ensuring end-to-end security while making logs accessible to both AI systems and humans.

NeuralLog is designed to be a bridge between traditional logging systems and AI systems, providing structured data that can be easily consumed by AI models while maintaining human readability.

This SDK is built on top of the NeuralLog Client SDK, which provides secure, zero-knowledge logging capabilities.

## Features

- Log4j-like API for easy integration
- **Support for multiple logging frameworks**:
  - Log4j 2 appender
  - SLF4J/Logback appender
  - Java Util Logging (JUL) handler
  - Apache Commons Logging adapter
- Support for structured data logging
- **Direct JSON serialization** of Java objects for AI-friendly logging
- Asynchronous logging for minimal performance impact
- Configurable via environment variables, config files, or programmatic API
- Automatic batching of log entries for improved performance
- Robust error handling and retry mechanisms
- Support for multiple log levels (TRACE, DEBUG, INFO, WARN, ERROR)
- Comprehensive test suite with high code coverage
- **Zero-Knowledge Architecture**: All encryption/decryption happens client-side
- **Secure Logging**: End-to-end encrypted logs
- **Encrypted Log Names**: Log names are encrypted before being sent to the server

## Installation

### Maven

```xml
<dependency>
    <groupId>com.neurallog</groupId>
    <artifactId>neurallog-logger</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.neurallog:neurallog-logger:1.0.0'
```

## Usage

### Direct Usage

```java
import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

import java.util.HashMap;
import java.util.Map;

public class Example {
    public static void main(String[] args) {
        // Configure the SDK (optional)
        NeuralLogConfig config = new NeuralLogConfig()
            .setServerUrl("http://localhost:3030")
            .setNamespace("default");
        NeuralLog.configure(config);

        // Get a logger
        AILogger logger = NeuralLog.getLogger("my-application");

        // Log a simple message
        logger.info("Hello, world!");

        // Log with structured data
        Map<String, Object> data = new HashMap<>();
        data.put("user", "john.doe");
        data.put("action", "login");
        data.put("ip", "192.168.1.1");
        logger.info("User logged in", data);

        // Log an error with exception
        try {
            // Some code that might throw an exception
            throw new RuntimeException("Something went wrong");
        } catch (Exception e) {
            logger.error("Failed to process request", e);
        }
    }
}
```

### JSON Serialization

NeuralLog encourages logging structured JSON data by providing direct object serialization:

```java
import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.NeuralLog;

public class JsonExample {
    // A simple POJO class
    public static class User {
        private String id;
        private String username;
        private String email;

        public User(String id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
        }

        // Getters and setters omitted for brevity
    }

    public static void main(String[] args) {
        AILogger logger = NeuralLog.getLogger("json-example");

        // Create a user object
        User user = new User("123", "johndoe", "john.doe@example.com");

        // Log the user object directly - it will be automatically serialized to JSON
        logger.info("User created", user);

        // You can also log collections of objects
        List<User> users = Arrays.asList(
            new User("123", "johndoe", "john.doe@example.com"),
            new User("456", "janedoe", "jane.doe@example.com")
        );

        logger.info("Users created", users);
    }
}
```

### Log4j Integration

#### Log4j Configuration (XML)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
        <NeuralLog name="NeuralLog"
                  logName="my-application"
                  serverUrl="http://localhost:3030"
                  namespace="default">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </NeuralLog>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="NeuralLog"/>
        </Root>
    </Loggers>
</Configuration>
```

#### Log4j Usage

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.ThreadContext;

public class Log4jExample {
    private static final Logger logger = LogManager.getLogger(Log4jExample.class);

    public static void main(String[] args) {
        // Simple logging
        logger.info("Hello, world!");

        // Logging with MDC (Mapped Diagnostic Context)
        ThreadContext.put("user", "john.doe");
        ThreadContext.put("action", "login");
        ThreadContext.put("ip", "192.168.1.1");
        logger.info("User logged in");
        ThreadContext.clearAll();

        // Logging an exception
        try {
            // Some code that might throw an exception
            throw new RuntimeException("Something went wrong");
        } catch (Exception e) {
            logger.error("Failed to process request", e);
        }
    }
}
```

## JSON Serialization

NeuralLog is designed to encourage logging structured JSON data, which is more useful for AI systems. The SDK provides several ways to work with JSON:

### Direct Object Serialization

You can pass any Java object directly to the logging methods, and it will be automatically serialized to JSON:

```java
// Create a POJO
User user = new User("123", "johndoe", "john.doe@example.com");

// Log it directly - it will be serialized to JSON
logger.info("User created", user);
```

### Collections of Objects

You can also log collections of objects:

```java
List<User> users = Arrays.asList(
    new User("123", "johndoe", "john.doe@example.com"),
    new User("456", "janedoe", "jane.doe@example.com")
);

logger.info("Users created", users);
```

### Custom JSON Serialization

By default, the SDK uses Jackson for JSON serialization. You can customize the serialization process by providing your own implementation of the `JsonSerializer` interface:

```java
public class CustomJsonSerializer implements JsonSerializer {
    // Implement the methods
}

// Configure the SDK to use your custom serializer
NeuralLogConfig config = new NeuralLogConfig()
    .setJsonSerializer(new CustomJsonSerializer());
```

### Best Practices for JSON Logging

1. **Use POJOs with proper getters/setters** - This ensures proper serialization
2. **Include context in your logs** - Add relevant information that helps understand the log
3. **Use consistent naming conventions** - This makes logs easier to query and analyze
4. **Include timestamps and IDs** - These help with correlation and debugging
5. **Structure your data hierarchically** - This makes it easier for AI systems to understand

## Configuration

The SDK can be configured in several ways:

### Environment Variables

- `NEURALLOG_URL`: The URL of the NeuralLog server (default: `http://localhost:3030`)
- `NEURALLOG_NAMESPACE`: The namespace to use (default: `default`)

### Configuration Files

The SDK will look for configuration files in the following locations:

1. `.neurallogrc` in the current directory
2. `.neurallogrc.json` in the current directory
3. `neurallog.config.json` in the current directory
4. `.neurallogrc` in the user's home directory
5. `.neurallogrc.json` in the user's home directory

Example JSON configuration file:

```json
{
  "serverUrl": "http://localhost:3030",
  "namespace": "default",
  "logLevels": {
    "default": "info",
    "com.example.service": "debug",
    "com.example.repository": "warn"
  },
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

### Programmatic Configuration

```java
NeuralLogConfig config = new NeuralLogConfig()
    .setServerUrl("http://localhost:3030")
    .setNamespace("default")
    .setLogLevel("com.example.service", LogLevel.DEBUG)
    .setLogLevel("com.example.repository", LogLevel.WARN)
    .addHeader("Authorization", "Bearer token123");
NeuralLog.configure(config);
```

## API Reference

### Core Interfaces and Classes

#### AILogger Interface

The primary interface for logging data to NeuralLog:

```java
public interface AILogger {
    void trace(String message);
    void trace(String message, Map<String, Object> data);
    void trace(String message, Throwable throwable);

    void debug(String message);
    void debug(String message, Map<String, Object> data);
    void debug(String message, Throwable throwable);

    void info(String message);
    void info(String message, Map<String, Object> data);
    void info(String message, Throwable throwable);

    void warn(String message);
    void warn(String message, Map<String, Object> data);
    void warn(String message, Throwable throwable);

    void error(String message);
    void error(String message, Map<String, Object> data);
    void error(String message, Throwable throwable);

    void log(LogLevel level, String message);
    void log(LogLevel level, String message, Map<String, Object> data);
    void log(LogLevel level, String message, Throwable throwable);
}
```

#### NeuralLog Class

Factory class for creating AILogger instances:

```java
public class NeuralLog {
    // Get a logger with default configuration
    public static AILogger getLogger(String logName);

    // Get a logger with custom configuration
    public static AILogger getLogger(String logName, NeuralLogConfig config);

    // Set the default configuration for all loggers
    public static void configure(NeuralLogConfig config);

    // Get the current configuration
    public static NeuralLogConfig getConfig();
}
```

#### NeuralLogConfig Class

Configuration class for the NeuralLog client:

```java
public class NeuralLogConfig {
    // Set the server URL
    public NeuralLogConfig setServerUrl(String serverUrl);

    // Set the namespace
    public NeuralLogConfig setNamespace(String namespace);

    // Add a header to be sent with all requests
    public NeuralLogConfig addHeader(String name, String value);

    // Set all headers at once
    public NeuralLogConfig setHeaders(Map<String, String> headers);

    // Set the log level for a specific logger
    public NeuralLogConfig setLogLevel(String logger, LogLevel level);

    // Get the server URL
    public String getServerUrl();

    // Get the namespace
    public String getNamespace();

    // Get all headers
    public Map<String, String> getHeaders();

    // Get the log level for a specific logger
    public LogLevel getLogLevel(String logger);
}
```

#### LogLevel Enum

Enum representing the different log levels:

```java
public enum LogLevel {
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR
}
```

### Log4j Integration

#### NeuralLogAppender Class

Log4j appender for sending logs to NeuralLog:

```java
public class NeuralLogAppender extends AbstractAppender {
    // Constructor
    public NeuralLogAppender(String name, Filter filter, Layout<? extends Serializable> layout,
                           boolean ignoreExceptions, Property[] properties);

    // Set the log name
    public void setLogName(String logName);

    // Set the server URL
    public void setServerUrl(String serverUrl);

    // Set the namespace
    public void setNamespace(String namespace);

    // Add a header
    public void addHeader(String name, String value);
}
```

## Logging Framework Integrations

NeuralLog supports multiple logging frameworks, making it easy to integrate with existing applications.

### SLF4J/Logback Integration

To use NeuralLog with SLF4J and Logback, add the NeuralLogSlf4jAppender to your logback.xml configuration:

```xml
<configuration>
  <appender name="NEURALLOG" class="com.neurallog.sdk.slf4j.NeuralLogSlf4jAppender">
    <logName>my-application</logName>
    <serverUrl>http://localhost:3030</serverUrl>
    <namespace>default</namespace>
  </appender>

  <root level="info">
    <appender-ref ref="NEURALLOG" />
  </root>
</configuration>
```

Then your SLF4J logs will be sent to NeuralLog:

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public class MyApp {
    private static final Logger logger = LoggerFactory.getLogger(MyApp.class);

    public void doSomething() {
        logger.info("This will be sent to NeuralLog");

        // You can also use MDC for structured logging
        MDC.put("user", "johndoe");
        logger.info("User action");
        MDC.clear();
    }
}
```

### Java Util Logging (JUL) Integration

To use NeuralLog with Java's built-in logging framework, add the NeuralLogJulHandler to your logging.properties file:

```properties
handlers = com.neurallog.sdk.jul.NeuralLogJulHandler
com.neurallog.sdk.jul.NeuralLogJulHandler.logName = my-application
com.neurallog.sdk.jul.NeuralLogJulHandler.serverUrl = http://localhost:3030
com.neurallog.sdk.jul.NeuralLogJulHandler.namespace = default
```

Or configure it programmatically:

```java
import java.util.logging.Logger;
import com.neurallog.sdk.jul.NeuralLogJulHandler;

public class MyApp {
    private static final Logger logger = Logger.getLogger(MyApp.class.getName());

    static {
        NeuralLogJulHandler handler = new NeuralLogJulHandler("my-application");
        handler.setServerUrl("http://localhost:3030");
        handler.setNamespace("default");
        logger.addHandler(handler);
    }

    public void doSomething() {
        logger.info("This will be sent to NeuralLog");
    }
}
```

### Apache Commons Logging Integration

To use NeuralLog with Apache Commons Logging, configure it as the logging implementation:

```java
// Configure NeuralLog as the Commons Logging implementation
System.setProperty("org.apache.commons.logging.Log",
                  "com.neurallog.sdk.commons.NeuralLogCommonsLogger");

// Get a logger
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class MyApp {
    private static final Log log = LogFactory.getLog(MyApp.class);

    public void doSomething() {
        log.info("This will be sent to NeuralLog");
    }
}
```

## Client SDK Integration

This Java SDK is built on top of the NeuralLog Client SDK, which provides the core functionality for interacting with the NeuralLog system. The Client SDK provides:

- **Zero-Knowledge Architecture**: All encryption/decryption happens client-side
- **Secure Logging**: End-to-end encrypted logs
- **Encrypted Log Names**: Log names are encrypted before being sent to the server
- **API Key Management**: Create and manage API keys
- **Searchable Encryption**: Search encrypted logs without compromising security

You can access the Client SDK directly through this package:

```java
import com.neurallog.client.NeuralLogClient;
import com.neurallog.client.NeuralLogClientConfig;
import com.neurallog.client.exception.LogException;

// Create a client
NeuralLogClient client = new NeuralLogClient(
    new NeuralLogClientConfig()
        .setTenantId("your-tenant-id")
        .setAuthUrl("https://auth.neurallog.com")
        .setLogsUrl("https://logs.neurallog.com")
);

// Authenticate with API key
client.authenticateWithApiKey("your-api-key");

// Log data
Map<String, Object> logData = new HashMap<>();
logData.put("level", "info");
logData.put("message", "Hello, NeuralLog!");
logData.put("timestamp", java.time.Instant.now().toString());

String logId = client.log("application-logs", logData);
System.out.println("Log sent with ID: " + logId);
```

## Building from Source

### Prerequisites

- Java 22 or later
- Maven 3.6 or later

### Build Steps

1. Clone the repository:
   ```
   git clone https://github.com/NeuralLog/java-sdk.git
   cd java-sdk
   ```

2. Build the SDK:
   ```
   mvn clean package
   ```

## License

MIT
