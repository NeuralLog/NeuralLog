/*
 * NeuralLog API
 * API documentation for the NeuralLog server
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


package com.neurallog.sdk.model;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.StringJoiner;
import java.util.Objects;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import com.neurallog.sdk.model.LogStatistics;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * StatisticsGet200Response
 */
@JsonPropertyOrder({
  StatisticsGet200Response.JSON_PROPERTY_STATUS,
  StatisticsGet200Response.JSON_PROPERTY_NAMESPACE,
  StatisticsGet200Response.JSON_PROPERTY_STATISTICS
})
@javax.annotation.Generated(value = "org.openapitools.codegen.languages.JavaClientCodegen")
public class StatisticsGet200Response {
  public static final String JSON_PROPERTY_STATUS = "status";
  private String status;

  public static final String JSON_PROPERTY_NAMESPACE = "namespace";
  private String namespace;

  public static final String JSON_PROPERTY_STATISTICS = "statistics";
  private LogStatistics statistics;

  public StatisticsGet200Response() { 
  }

  public StatisticsGet200Response status(String status) {
    this.status = status;
    return this;
  }

   /**
   * Get status
   * @return status
  **/
  @javax.annotation.Nullable
  @JsonProperty(JSON_PROPERTY_STATUS)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)

  public String getStatus() {
    return status;
  }


  @JsonProperty(JSON_PROPERTY_STATUS)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)
  public void setStatus(String status) {
    this.status = status;
  }


  public StatisticsGet200Response namespace(String namespace) {
    this.namespace = namespace;
    return this;
  }

   /**
   * Get namespace
   * @return namespace
  **/
  @javax.annotation.Nullable
  @JsonProperty(JSON_PROPERTY_NAMESPACE)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)

  public String getNamespace() {
    return namespace;
  }


  @JsonProperty(JSON_PROPERTY_NAMESPACE)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)
  public void setNamespace(String namespace) {
    this.namespace = namespace;
  }


  public StatisticsGet200Response statistics(LogStatistics statistics) {
    this.statistics = statistics;
    return this;
  }

   /**
   * Get statistics
   * @return statistics
  **/
  @javax.annotation.Nullable
  @JsonProperty(JSON_PROPERTY_STATISTICS)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)

  public LogStatistics getStatistics() {
    return statistics;
  }


  @JsonProperty(JSON_PROPERTY_STATISTICS)
  @JsonInclude(value = JsonInclude.Include.USE_DEFAULTS)
  public void setStatistics(LogStatistics statistics) {
    this.statistics = statistics;
  }


  /**
   * Return true if this _statistics_get_200_response object is equal to o.
   */
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    StatisticsGet200Response statisticsGet200Response = (StatisticsGet200Response) o;
    return Objects.equals(this.status, statisticsGet200Response.status) &&
        Objects.equals(this.namespace, statisticsGet200Response.namespace) &&
        Objects.equals(this.statistics, statisticsGet200Response.statistics);
  }

  @Override
  public int hashCode() {
    return Objects.hash(status, namespace, statistics);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class StatisticsGet200Response {\n");
    sb.append("    status: ").append(toIndentedString(status)).append("\n");
    sb.append("    namespace: ").append(toIndentedString(namespace)).append("\n");
    sb.append("    statistics: ").append(toIndentedString(statistics)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

  /**
   * Convert the instance into URL query string.
   *
   * @return URL query string
   */
  public String toUrlQueryString() {
    return toUrlQueryString(null);
  }

  /**
   * Convert the instance into URL query string.
   *
   * @param prefix prefix of the query string
   * @return URL query string
   */
  public String toUrlQueryString(String prefix) {
    String suffix = "";
    String containerSuffix = "";
    String containerPrefix = "";
    if (prefix == null) {
      // style=form, explode=true, e.g. /pet?name=cat&type=manx
      prefix = "";
    } else {
      // deepObject style e.g. /pet?id[name]=cat&id[type]=manx
      prefix = prefix + "[";
      suffix = "]";
      containerSuffix = "]";
      containerPrefix = "[";
    }

    StringJoiner joiner = new StringJoiner("&");

    // add `status` to the URL query string
    if (getStatus() != null) {
      joiner.add(String.format("%sstatus%s=%s", prefix, suffix, URLEncoder.encode(String.valueOf(getStatus()), StandardCharsets.UTF_8).replaceAll("\\+", "%20")));
    }

    // add `namespace` to the URL query string
    if (getNamespace() != null) {
      joiner.add(String.format("%snamespace%s=%s", prefix, suffix, URLEncoder.encode(String.valueOf(getNamespace()), StandardCharsets.UTF_8).replaceAll("\\+", "%20")));
    }

    // add `statistics` to the URL query string
    if (getStatistics() != null) {
      joiner.add(getStatistics().toUrlQueryString(prefix + "statistics" + suffix));
    }

    return joiner.toString();
  }
}

