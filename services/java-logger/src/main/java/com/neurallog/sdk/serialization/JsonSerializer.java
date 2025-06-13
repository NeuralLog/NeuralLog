package com.neurallog.sdk.serialization;

import java.util.Map;

/**
 * Interface for JSON serialization.
 * 
 * This interface defines methods for converting objects to and from JSON.
 */
public interface JsonSerializer {
    
    /**
     * Convert an object to a JSON string.
     * 
     * @param object the object to convert
     * @return the JSON string
     */
    String toJson(Object object);
    
    /**
     * Convert an object to a Map representation.
     * 
     * @param object the object to convert
     * @return the Map representation
     */
    Map<String, Object> toMap(Object object);
    
    /**
     * Convert a JSON string to an object.
     * 
     * @param <T> the type of the object
     * @param json the JSON string
     * @param clazz the class of the object
     * @return the object
     */
    <T> T fromJson(String json, Class<T> clazz);
    
    /**
     * Convert a Map to an object.
     * 
     * @param <T> the type of the object
     * @param map the Map
     * @param clazz the class of the object
     * @return the object
     */
    <T> T fromMap(Map<String, Object> map, Class<T> clazz);
}
