# NeuralLog SDK: Universal Logger Integration

## Transform Your Existing Logs Without Changing Your Code

NeuralLog's SDK is designed to seamlessly integrate with existing logging systems across all major programming languages. Our unique approach allows you to gain powerful zero-knowledge insights from your logs with minimal code changes, often just a single line of code.

## The NeuralLog Integration Advantage

### Minimal Friction, Maximum Value

NeuralLog takes a unique approach to logger integration:

1. **Native Adapters**: Purpose-built adapters for every major logging framework
2. **Drop-in Replacements**: Minimal code changes required for integration
3. **Familiar APIs**: Maintains the same API as the original logger
4. **Zero-Knowledge by Default**: All adapters implement end-to-end encryption
5. **Open Source Reference Implementations**: All adapters are open source and extensible

### Universal Language Support

NeuralLog provides native adapters for all major logging frameworks across languages:

| Language | Supported Frameworks |
|----------|----------------------|
| JavaScript/TypeScript | Winston, Bunyan, Pino, Morgan, console |
| Python | logging, loguru, structlog, python-json-logger |
| Java | Log4j, Logback, SLF4J, java.util.logging |
| C# | Serilog, NLog, log4net, Microsoft.Extensions.Logging |
| Go | zap, logrus, zerolog, standard log |
| Ruby | Logger, Logging, Fluentd |
| PHP | Monolog, PSR-3, error_log |
| Rust | log, slog, tracing, env_logger |
| Kotlin | kotlin-logging, SLF4J |
| Swift | SwiftyBeaver, CocoaLumberjack, os.log |

## How Integration Works

### 1. Add the NeuralLog Adapter

Add our adapter to your existing logging configuration:

- **For JavaScript/TypeScript**: Add the NeuralLog transport to Winston, Pino, etc.
- **For Java**: Add the NeuralLog appender to Log4j, Logback, etc.
- **For Python**: Add the NeuralLog handler to the standard logging module
- **For C#**: Add the NeuralLog sink to Serilog, NLog, etc.
- **For Go**: Add the NeuralLog hook to zap, logrus, etc.

### 2. Configure Zero-Knowledge Settings

Specify your API key and tenant ID:

- **API Key**: Used for authentication and key derivation
- **Tenant ID**: Ensures proper isolation between different organizations
- **Source**: Identifies the source of the logs (optional)
- **Encryption Settings**: Customize encryption if needed (optional)

### 3. Continue Logging as Normal

Your existing logging code remains exactly the same:

- **Same Methods**: info(), error(), warn(), etc.
- **Same Parameters**: message, metadata, context
- **Same Patterns**: All your existing logging patterns work unchanged
- **Same Performance**: Minimal overhead with batching and async processing

## Framework-Specific Integration

### Web Framework Integration

NeuralLog integrates with popular web frameworks:

- **Express.js**: Middleware for request/response logging
- **Spring Boot**: Auto-configuration for seamless integration
- **Flask/Django**: WSGI middleware for request logging
- **ASP.NET Core**: Middleware and logging provider integration
- **Rails**: Rack middleware for request logging

### Cloud Platform Integration

NeuralLog works with major cloud platforms:

- **AWS Lambda**: Custom logger for serverless functions
- **Google Cloud Functions**: Integrated logging for GCP
- **Azure Functions**: Custom logging provider
- **Kubernetes**: Sidecar and DaemonSet options
- **Heroku**: Dyno-compatible logging

### Monitoring Integration

NeuralLog complements existing monitoring solutions:

- **Prometheus**: Metric export capabilities
- **Grafana**: Dashboard integration
- **Datadog**: Complementary logging
- **New Relic**: Side-by-side operation
- **Sentry**: Error tracking integration

## Zero-Knowledge Security

All NeuralLog adapters implement zero-knowledge security:

### Client-Side Encryption

- **Log Encryption**: All log content is encrypted before transmission
- **Key Derivation**: Encryption keys derived from API key, never transmitted
- **Search Token Generation**: Special tokens enable searching without decryption
- **Pattern Identification**: Tokens allow for pattern analysis without seeing content

### Privacy by Design

- **Metadata Protection**: Even metadata is protected from unauthorized access
- **Minimal Data Collection**: Only essential data is collected
- **Secure Defaults**: Strong security without configuration
- **Transparent Operation**: Clear documentation of all security measures

## Benefits for Different Stakeholders

### For Developers

- **Minimal Code Changes**: Drop-in replacements for existing logging frameworks
- **Familiar APIs**: Use the same logging patterns you're already familiar with
- **Framework Flexibility**: Switch logging frameworks without changing NeuralLog integration
- **Open Source**: Easily extend or customize adapters for specific needs

### For Organizations

- **Standardized Logging**: Consistent logging across all applications and languages
- **Zero-Knowledge Security**: End-to-end encryption for all logs regardless of source
- **Comprehensive Coverage**: Support for all major languages and frameworks
- **Future-Proof**: New adapters are continuously added for emerging frameworks

### For Security Teams

- **Consistent Security Model**: Same zero-knowledge guarantees across all integrations
- **Audit Trail**: Comprehensive tracking of all logging activities
- **Compliance Support**: Helps meet regulatory requirements across all applications
- **Reduced Attack Surface**: Minimizes exposure of sensitive data

## Getting Started

### 1. Choose Your Adapter

Select the adapter for your logging framework:

- **JavaScript/TypeScript**: @neurallog/winston, @neurallog/pino, etc.
- **Java**: neurallog-log4j, neurallog-logback, etc.
- **Python**: neurallog-python, neurallog-loguru, etc.
- **C#**: NeuralLog.Serilog, NeuralLog.NLog, etc.
- **Go**: neurallog-zap, neurallog-logrus, etc.

### 2. Install the Package

Add the NeuralLog adapter to your project:

- **npm/yarn**: `npm install @neurallog/winston`
- **Maven**: `<dependency>neurallog-log4j</dependency>`
- **pip**: `pip install neurallog-python`
- **NuGet**: `Install-Package NeuralLog.Serilog`
- **Go**: `go get github.com/neurallog/zap-neurallog`

### 3. Add the Adapter

Add the NeuralLog adapter to your logging configuration with a single line of code.

### 4. Start Logging

Continue using your existing logging patterns. NeuralLog will automatically encrypt and process your logs.

## The Open Source Advantage

All NeuralLog adapters are open source, providing several key benefits:

1. **Transparency**: See exactly how the adapters work
2. **Customization**: Modify adapters for specific requirements
3. **Community Contributions**: Benefit from community improvements
4. **Security Verification**: Verify security properties independently
5. **Future-Proof**: Adapters for new frameworks can be added by anyone

## Conclusion

NeuralLog's universal logger integration system provides a seamless way to add zero-knowledge telemetry to any application, regardless of programming language or logging framework. With drop-in replacements for all major logging systems and open-source reference implementations, NeuralLog makes it easy to enhance your existing applications with secure, privacy-preserving logging capabilities.

Start transforming your existing logs today without changing your code.
