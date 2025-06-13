import { logger } from '../utils/logger.js';

export interface MCPClientConfig {
  // Server configuration
  webServerUrl: string;
  authServiceUrl: string;
  
  // Authentication
  clientId: string;
  clientSecret: string;
  tenantId: string;
  
  // Optional configuration
  logLevel?: string;
  requestTimeout?: number;
  maxRetries?: number;
}

/**
 * Secure configuration loader that validates and sanitizes environment variables
 */
export class SecurityConfig {
  private static instance: SecurityConfig;
  private config: MCPClientConfig;

  private constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  public static getInstance(): SecurityConfig {
    if (!SecurityConfig.instance) {
      SecurityConfig.instance = new SecurityConfig();
    }
    return SecurityConfig.instance;
  }

  private loadConfiguration(): MCPClientConfig {
    // Required environment variables
    const requiredVars = {
      webServerUrl: process.env.WEB_SERVER_URL,
      authServiceUrl: process.env.AUTH_SERVICE_URL,
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      tenantId: process.env.TENANT_ID
    };

    // Check for missing required variables
    const missingVars = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
      webServerUrl: this.sanitizeUrl(requiredVars.webServerUrl!),
      authServiceUrl: this.sanitizeUrl(requiredVars.authServiceUrl!),
      clientId: requiredVars.clientId!,
      clientSecret: requiredVars.clientSecret!,
      tenantId: this.sanitizeTenantId(requiredVars.tenantId!),
      logLevel: process.env.LOG_LEVEL || 'INFO',
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3')
    };
  }

  private validateConfiguration(): void {
    // Validate URLs
    try {
      new URL(this.config.webServerUrl);
      new URL(this.config.authServiceUrl);
    } catch (error) {
      throw new Error('Invalid URL configuration');
    }

    // Validate client ID format (should be alphanumeric)
    if (!/^[a-zA-Z0-9_-]+$/.test(this.config.clientId)) {
      throw new Error('Invalid client ID format');
    }

    // Validate tenant ID format
    if (!/^[a-zA-Z0-9_-]+$/.test(this.config.tenantId)) {
      throw new Error('Invalid tenant ID format');
    }

    // Validate client secret is not empty and has minimum length
    if (this.config.clientSecret.length < 32) {
      throw new Error('Client secret must be at least 32 characters');
    }

    // Validate timeout values
    if (this.config.requestTimeout! < 1000 || this.config.requestTimeout! > 300000) {
      throw new Error('Request timeout must be between 1000ms and 300000ms');
    }

    if (this.config.maxRetries! < 0 || this.config.maxRetries! > 10) {
      throw new Error('Max retries must be between 0 and 10');
    }

    logger.info('Configuration validated successfully');
  }

  private sanitizeUrl(url: string): string {
    // Remove trailing slash and validate
    const sanitized = url.replace(/\/+$/, '');
    
    // Ensure it's HTTP or HTTPS
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      throw new Error(`Invalid URL protocol: ${url}`);
    }
    
    return sanitized;
  }

  private sanitizeTenantId(tenantId: string): string {
    // Remove any potentially dangerous characters
    return tenantId.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  public getConfig(): MCPClientConfig {
    return { ...this.config }; // Return a copy to prevent mutation
  }

  public getWebServerUrl(): string {
    return this.config.webServerUrl;
  }

  public getAuthServiceUrl(): string {
    return this.config.authServiceUrl;
  }

  public getClientId(): string {
    return this.config.clientId;
  }

  public getClientSecret(): string {
    return this.config.clientSecret;
  }

  public getTenantId(): string {
    return this.config.tenantId;
  }

  public getRequestTimeout(): number {
    return this.config.requestTimeout!;
  }

  public getMaxRetries(): number {
    return this.config.maxRetries!;
  }

  /**
   * Get sanitized config for logging (excludes sensitive data)
   */
  public getLoggableConfig(): Partial<MCPClientConfig> {
    return {
      webServerUrl: this.config.webServerUrl,
      authServiceUrl: this.config.authServiceUrl,
      tenantId: this.config.tenantId,
      logLevel: this.config.logLevel,
      requestTimeout: this.config.requestTimeout,
      maxRetries: this.config.maxRetries
      // Intentionally exclude clientId and clientSecret
    };
  }
}
