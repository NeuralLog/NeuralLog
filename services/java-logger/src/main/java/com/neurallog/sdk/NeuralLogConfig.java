package com.neurallog.sdk;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.neurallog.sdk.serialization.JacksonSerializer;
import com.neurallog.sdk.serialization.JsonSerializer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Configuration for the NeuralLog SDK.
 *
 * This class handles configuration from various sources:
 * 1. Environment variables
 * 2. Configuration files
 * 3. Programmatic configuration
 */
public class NeuralLogConfig {

    private static final String ENV_SERVER_URL = "NEURALLOG_URL";
    private static final String ENV_NAMESPACE = "NEURALLOG_NAMESPACE";
    private static final String DEFAULT_SERVER_URL = "http://localhost:3030";
    private static final String DEFAULT_NAMESPACE = "default";

    private static final String[] CONFIG_FILE_NAMES = {
        ".neurallogrc",
        ".neurallogrc.json",
        "neurallog.config.json"
    };

    private String serverUrl;
    private String namespace;
    private Map<String, LogLevel> logLevels;
    private Map<String, String> headers;
    private JsonSerializer jsonSerializer;

    /**
     * Create a new configuration with default values.
     */
    public NeuralLogConfig() {
        this.serverUrl = getEnv(ENV_SERVER_URL, DEFAULT_SERVER_URL);
        this.namespace = getEnv(ENV_NAMESPACE, DEFAULT_NAMESPACE);
        this.logLevels = new HashMap<>();
        this.headers = new HashMap<>();
        this.jsonSerializer = new JacksonSerializer();

        // Try to load configuration from files
        loadFromConfigFiles();
    }

    /**
     * Create a new configuration with the specified server URL.
     *
     * @param serverUrl the server URL
     */
    public NeuralLogConfig(String serverUrl) {
        this();
        this.serverUrl = serverUrl;
    }

    /**
     * Get the server URL.
     *
     * @return the server URL
     */
    public String getServerUrl() {
        return serverUrl;
    }

    /**
     * Set the server URL.
     *
     * @param serverUrl the server URL
     * @return this configuration instance for chaining
     */
    public NeuralLogConfig setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
        return this;
    }

    /**
     * Get the namespace.
     *
     * @return the namespace
     */
    public String getNamespace() {
        return namespace;
    }

    /**
     * Set the namespace.
     *
     * @param namespace the namespace
     * @return this configuration instance for chaining
     */
    public NeuralLogConfig setNamespace(String namespace) {
        this.namespace = namespace;
        return this;
    }

    /**
     * Get the log levels.
     *
     * @return the log levels
     */
    public Map<String, LogLevel> getLogLevels() {
        return new HashMap<>(logLevels);
    }

    /**
     * Set the log levels.
     *
     * @param logLevels the log levels
     * @return this configuration instance for chaining
     */
    public NeuralLogConfig setLogLevels(Map<String, LogLevel> logLevels) {
        this.logLevels = new HashMap<>(logLevels);
        return this;
    }

    /**
     * Set the log level for a specific log.
     *
     * @param logName the log name
     * @param level the log level
     * @return this configuration instance for chaining
     */
    public NeuralLogConfig setLogLevel(String logName, LogLevel level) {
        this.logLevels.put(logName, level);
        return this;
    }

    /**
     * Get the log level for a specific log.
     *
     * @param logName the log name
     * @return the log level, or null if not set
     */
    public LogLevel getLogLevel(String logName) {
        return this.logLevels.get(logName);
    }

    /**
     * Get the headers to include in API requests.
     *
     * @return the headers
     */
    public Map<String, String> getHeaders() {
        return new HashMap<>(headers);
    }

    /**
     * Set the headers to include in API requests.
     *
     * @param headers the headers
     * @return this configuration instance for chaining
     */
    public NeuralLogConfig setHeaders(Map<String, String> headers) {
        this.headers = new HashMap<>(headers);
        return this;
    }

    /**
     * Add a header to include in API requests.
     *
     * @param name the header name
     * @param value the header value
     * @return this configuration instance for chaining
     */
    public NeuralLogConfig addHeader(String name, String value) {
        this.headers.put(name, value);
        return this;
    }

    /**
     * Get the JSON serializer.
     *
     * @return the JSON serializer
     */
    public JsonSerializer getJsonSerializer() {
        return jsonSerializer;
    }

    /**
     * Set the JSON serializer.
     *
     * @param jsonSerializer the JSON serializer
     * @return this configuration instance for chaining
     */
    public NeuralLogConfig setJsonSerializer(JsonSerializer jsonSerializer) {
        this.jsonSerializer = jsonSerializer;
        return this;
    }

    /**
     * Get an environment variable, or a default value if not set.
     *
     * @param name the environment variable name
     * @param defaultValue the default value
     * @return the environment variable value, or the default value if not set
     */
    private String getEnv(String name, String defaultValue) {
        String value = System.getenv(name);
        return value != null ? value : defaultValue;
    }

    /**
     * Load configuration from config files.
     */
    private void loadFromConfigFiles() {
        // Try current directory first
        for (String fileName : CONFIG_FILE_NAMES) {
            if (loadFromFile(Paths.get(fileName))) {
                return;
            }
        }

        // Try user's home directory
        String userHome = System.getProperty("user.home");
        if (userHome != null) {
            for (String fileName : CONFIG_FILE_NAMES) {
                if (loadFromFile(Paths.get(userHome, fileName))) {
                    return;
                }
            }
        }
    }

    /**
     * Load configuration from a file.
     *
     * @param path the file path
     * @return true if the file was loaded successfully, false otherwise
     */
    private boolean loadFromFile(Path path) {
        if (!Files.exists(path)) {
            return false;
        }

        try {
            if (path.toString().endsWith(".json")) {
                return loadFromJsonFile(path.toFile());
            } else {
                return loadFromPropertiesFile(path.toFile());
            }
        } catch (IOException e) {
            // Ignore and try next file
            return false;
        }
    }

    /**
     * Load configuration from a JSON file.
     *
     * @param file the file
     * @return true if the file was loaded successfully, false otherwise
     * @throws IOException if an I/O error occurs
     */
    private boolean loadFromJsonFile(File file) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> config = mapper.readValue(file, Map.class);

        if (config.containsKey("serverUrl")) {
            this.serverUrl = (String) config.get("serverUrl");
        }

        if (config.containsKey("namespace")) {
            this.namespace = (String) config.get("namespace");
        }

        if (config.containsKey("logLevels")) {
            Map<String, String> levels = (Map<String, String>) config.get("logLevels");
            for (Map.Entry<String, String> entry : levels.entrySet()) {
                try {
                    this.logLevels.put(entry.getKey(), LogLevel.valueOf(entry.getValue().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid log levels
                }
            }
        }

        if (config.containsKey("headers")) {
            Map<String, String> headers = (Map<String, String>) config.get("headers");
            this.headers.putAll(headers);
        }

        return true;
    }

    /**
     * Load configuration from a properties file.
     *
     * @param file the file
     * @return true if the file was loaded successfully, false otherwise
     * @throws IOException if an I/O error occurs
     */
    private boolean loadFromPropertiesFile(File file) throws IOException {
        Properties props = new Properties();
        try (InputStream in = new FileInputStream(file)) {
            props.load(in);
        }

        String serverUrl = props.getProperty("serverUrl");
        if (serverUrl != null) {
            this.serverUrl = serverUrl;
        }

        String namespace = props.getProperty("namespace");
        if (namespace != null) {
            this.namespace = namespace;
        }

        // Load log levels
        for (String key : props.stringPropertyNames()) {
            if (key.startsWith("logLevel.")) {
                String logName = key.substring("logLevel.".length());
                String levelName = props.getProperty(key);
                try {
                    this.logLevels.put(logName, LogLevel.valueOf(levelName.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid log levels
                }
            }
        }

        // Load headers
        for (String key : props.stringPropertyNames()) {
            if (key.startsWith("header.")) {
                String headerName = key.substring("header.".length());
                String headerValue = props.getProperty(key);
                this.headers.put(headerName, headerValue);
            }
        }

        return true;
    }
}
