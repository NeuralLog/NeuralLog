package com.neurallog.sdk.serialization;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Jackson-based implementation of JsonSerializer.
 */
public class JacksonSerializer implements JsonSerializer {
    
    private final ObjectMapper objectMapper;
    
    /**
     * Create a new JacksonSerializer with default configuration.
     */
    public JacksonSerializer() {
        this.objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }
    
    /**
     * Create a new JacksonSerializer with a custom ObjectMapper.
     * 
     * @param objectMapper the ObjectMapper to use
     */
    public JacksonSerializer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    @Override
    public String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new SerializationException("Failed to serialize object to JSON", e);
        }
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> toMap(Object object) {
        if (object == null) {
            return new HashMap<>();
        }
        
        if (object instanceof Map) {
            return (Map<String, Object>) object;
        }
        
        try {
            // Convert object to JSON and then to Map
            String json = toJson(object);
            return objectMapper.readValue(json, Map.class);
        } catch (IOException e) {
            throw new SerializationException("Failed to convert object to Map", e);
        }
    }
    
    @Override
    public <T> T fromJson(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (IOException e) {
            throw new SerializationException("Failed to deserialize JSON to object", e);
        }
    }
    
    @Override
    public <T> T fromMap(Map<String, Object> map, Class<T> clazz) {
        return objectMapper.convertValue(map, clazz);
    }
    
    /**
     * Get the underlying ObjectMapper.
     * 
     * @return the ObjectMapper
     */
    public ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
