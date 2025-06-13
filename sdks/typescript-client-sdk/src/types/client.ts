/**
 * Interface for client configuration
 */
export interface ClientConfig {
  /**
   * API URL
   */
  apiUrl: string;

  /**
   * Auth URL
   */
  authUrl: string;

  /**
   * Log Server URL
   */
  logServerUrl: string;

  /**
   * API key
   */
  apiKey?: string;

  /**
   * Authentication token
   */
  token?: string;

  /**
   * Tenant ID
   */
  tenantId: string;
}

/**
 * Interface for client options
 */
export interface ClientOptions {
  /**
   * Whether to enable debug logging
   */
  debug?: boolean;
  
  /**
   * Whether to use the cache
   */
  useCache?: boolean;
  
  /**
   * Custom fetch implementation
   */
  fetch?: typeof fetch;
}
