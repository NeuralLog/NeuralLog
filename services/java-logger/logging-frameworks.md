# Logging Framework Integrations

NeuralLog supports multiple logging frameworks, making it easy to integrate with existing applications.

## SLF4J/Logback Integration

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

## Java Util Logging (JUL) Integration

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

## Apache Commons Logging Integration

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
