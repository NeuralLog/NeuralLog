# NeuralLog Java SDK Examples

This directory contains example applications demonstrating the use of the NeuralLog Java SDK.

## Prerequisites

- Java 22 or later
- Maven 3.6 or later
- NeuralLog server running (default: http://localhost:3030)

## Examples

### SimpleExample

A simple example demonstrating the basic usage of the NeuralLog Java SDK.

```java
AILogger logger = NeuralLog.getLogger("simple-example");
logger.info("Hello, world!");
```

### Log4jExample

An example demonstrating the use of the NeuralLog Java SDK with Log4j 2.

```java
// Standard Log4j usage
Logger logger = LogManager.getLogger(Log4jExample.class);
logger.info("Hello, world!");
```

### Slf4jExample

An example demonstrating the use of the NeuralLog Java SDK with SLF4J/Logback.

```java
// Standard SLF4J usage
Logger logger = LoggerFactory.getLogger(Slf4jExample.class);
logger.info("Hello, world!");
```

### JulExample

An example demonstrating the use of the NeuralLog Java SDK with Java Util Logging (JUL).

```java
// Configure the NeuralLog handler
Logger logger = Logger.getLogger(JulExample.class.getName());
NeuralLogJulHandler handler = new NeuralLogJulHandler("jul-example");
logger.addHandler(handler);
logger.info("Hello, world!");
```

### CommonsLoggingExample

An example demonstrating the use of the NeuralLog Java SDK with Apache Commons Logging.

```java
// Configure NeuralLog as the Commons Logging implementation
System.setProperty("org.apache.commons.logging.Log", "com.neurallog.sdk.commons.NeuralLogCommonsLogger");

// Standard Commons Logging usage
Log logger = LogFactory.getLog(CommonsLoggingExample.class);
logger.info("Hello, world!");
```

## Running the Examples

To run the examples, you need to have the NeuralLog Java SDK installed in your local Maven repository. You can install it by running the following command in the `java` directory:

```bash
mvn clean install
```

Then, you can run the examples using the following commands:

```bash
# Simple example
java -cp target/neurallog-sdk-1.0.0.jar:target/dependency/* com.neurallog.examples.SimpleExample

# Log4j example
java -cp target/neurallog-sdk-1.0.0.jar:target/dependency/* com.neurallog.examples.Log4jExample

# SLF4J example
java -cp target/neurallog-sdk-1.0.0.jar:target/dependency/* com.neurallog.examples.Slf4jExample

# JUL example
java -cp target/neurallog-sdk-1.0.0.jar:target/dependency/* com.neurallog.examples.JulExample

# Commons Logging example
java -cp target/neurallog-sdk-1.0.0.jar:target/dependency/* com.neurallog.examples.CommonsLoggingExample
```

## Configuration

The examples use the following default configuration:

- Server URL: http://localhost:3030
- Namespace: default
- Async enabled: true
- Batch size: 10
- Batch interval: 5000ms

You can modify these settings in the example code to match your environment.
