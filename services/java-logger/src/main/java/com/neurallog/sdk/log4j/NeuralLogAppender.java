package com.neurallog.sdk.log4j;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.apache.logging.log4j.core.Appender;
import org.apache.logging.log4j.core.Core;
import org.apache.logging.log4j.core.Filter;
import org.apache.logging.log4j.core.Layout;
import org.apache.logging.log4j.core.LogEvent;
import org.apache.logging.log4j.core.appender.AbstractAppender;
import org.apache.logging.log4j.core.config.Property;
import org.apache.logging.log4j.core.config.plugins.Plugin;
import org.apache.logging.log4j.core.config.plugins.PluginAttribute;
import org.apache.logging.log4j.core.config.plugins.PluginElement;
import org.apache.logging.log4j.core.config.plugins.PluginFactory;

import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.LogLevel;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

/**
 * Log4j appender for NeuralLog.
 * 
 * This appender sends Log4j logs to the NeuralLog server.
 * 
 * Example configuration:
 * <pre>
 * &lt;Appenders&gt;
 *   &lt;NeuralLog name="NeuralLog"
 *              logName="my-application"
 *              serverUrl="http://localhost:3030"
 *              namespace="default"&gt;
 *     &lt;PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/&gt;
 *   &lt;/NeuralLog&gt;
 * &lt;/Appenders&gt;
 * </pre>
 */
@Plugin(name = "NeuralLog", category = Core.CATEGORY_NAME, elementType = Appender.ELEMENT_TYPE)
public class NeuralLogAppender extends AbstractAppender {
    
    private final String logName;
    private final AILogger logger;
    
    /**
     * Create a new NeuralLogAppender.
     * 
     * @param name the appender name
     * @param filter the filter
     * @param layout the layout
     * @param ignoreExceptions whether to ignore exceptions
     * @param properties the properties
     * @param logName the log name
     * @param serverUrl the server URL
     * @param namespace the namespace
     */
    protected NeuralLogAppender(String name, Filter filter, Layout<? extends Serializable> layout,
                               boolean ignoreExceptions, Property[] properties,
                               String logName, String serverUrl, String namespace) {
        super(name, filter, layout, ignoreExceptions, properties);
        this.logName = logName;
        
        // Configure NeuralLog
        NeuralLogConfig config = new NeuralLogConfig();
        if (serverUrl != null && !serverUrl.isEmpty()) {
            config.setServerUrl(serverUrl);
        }
        if (namespace != null && !namespace.isEmpty()) {
            config.setNamespace(namespace);
        }
        
        // Get the logger
        this.logger = NeuralLog.getLogger(logName);
    }
    
    @PluginFactory
    public static NeuralLogAppender createAppender(
            @PluginAttribute("name") String name,
            @PluginAttribute("logName") String logName,
            @PluginAttribute("serverUrl") String serverUrl,
            @PluginAttribute("namespace") String namespace,
            @PluginElement("Layout") Layout<? extends Serializable> layout,
            @PluginElement("Filter") Filter filter) {
        
        if (name == null) {
            LOGGER.error("No name provided for NeuralLogAppender");
            return null;
        }
        
        if (logName == null) {
            logName = "log4j-default";
        }
        
        if (layout == null) {
            LOGGER.error("No layout provided for NeuralLogAppender");
            return null;
        }
        
        return new NeuralLogAppender(name, filter, layout, true, Property.EMPTY_ARRAY,
                                    logName, serverUrl, namespace);
    }
    
    @Override
    public void append(LogEvent event) {
        // Convert Log4j level to NeuralLog level
        LogLevel level = convertLevel(event.getLevel().name());
        
        // Extract message
        String message = event.getMessage().getFormattedMessage();
        
        // Extract throwable
        Throwable throwable = event.getThrown();
        
        // Extract MDC data
        Map<String, Object> data = new HashMap<>();
        if (event.getContextData() != null && !event.getContextData().isEmpty()) {
            event.getContextData().forEach((key, value) -> data.put(key, value));
        }
        
        // Add source information
        if (event.getSource() != null) {
            Map<String, Object> source = new HashMap<>();
            source.put("className", event.getSource().getClassName());
            source.put("methodName", event.getSource().getMethodName());
            source.put("fileName", event.getSource().getFileName());
            source.put("lineNumber", event.getSource().getLineNumber());
            data.put("source", source);
        }
        
        // Add thread information
        data.put("threadName", event.getThreadName());
        data.put("threadId", event.getThreadId());
        
        // Add logger name
        data.put("loggerName", event.getLoggerName());
        
        // Log the event
        switch (level) {
            case TRACE:
                logger.trace(message, data);
                break;
            case DEBUG:
                logger.debug(message, data);
                break;
            case INFO:
                logger.info(message, data);
                break;
            case WARN:
                logger.warn(message, data);
                break;
            case ERROR:
                if (throwable != null) {
                    logger.error(message, throwable, data);
                } else {
                    logger.error(message, data);
                }
                break;
            case FATAL:
                if (throwable != null) {
                    logger.fatal(message, throwable, data);
                } else {
                    logger.fatal(message, data);
                }
                break;
        }
    }
    
    /**
     * Convert a Log4j level to a NeuralLog level.
     * 
     * @param log4jLevel the Log4j level
     * @return the NeuralLog level
     */
    private LogLevel convertLevel(String log4jLevel) {
        return LogLevel.fromLog4j(log4jLevel);
    }
}
