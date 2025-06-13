import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { logger } from '../utils/logger.js';
import {
  AuthConfigError,
  AuthNetworkError,
  AuthServiceError,
  AuthTokenExpiredError,
  AuthRateLimitError,
  isRetryableAuthError,
  getRetryDelay
} from './AuthenticationErrors.js';

export interface AuthConfig {
  authServiceUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Authenticated HTTP client that handles M2M authentication with automatic token refresh
 */
export class AuthenticatedHttpClient {
  private axiosInstance: AxiosInstance;
  private authConfig: AuthConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(authConfig: AuthConfig, baseURL: string) {
    this.authConfig = authConfig;
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NeuralLog-MCP-Client/1.0.0'
      }
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.getValidToken();
          config.headers.Authorization = `Bearer ${token}`;
          config.headers['x-tenant-id'] = this.authConfig.tenantId;
          return config;
        } catch (error) {
          logger.error('Request interceptor authentication error:', error);
          return Promise.reject(error);
        }
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          logger.warn('Received 401, attempting token refresh');
          // Clear current token and retry once
          this.accessToken = null;
          this.tokenExpiresAt = 0;

          const originalRequest = error.config;
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            try {
              const token = await this.getValidToken();
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axiosInstance(originalRequest);
            } catch (authError) {
              logger.error('Failed to refresh token for retry:', authError);
              return Promise.reject(new AuthTokenExpiredError('Token expired and refresh failed', authError instanceof Error ? authError : undefined));
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getValidToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start a new token refresh
    this.refreshPromise = this.refreshToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Refresh the access token using client credentials flow
   */
  private async refreshToken(): Promise<string> {
    try {
      logger.info('Refreshing access token');

      const response = await axios.post<TokenResponse>(
        `${this.authConfig.authServiceUrl}/api/auth/m2m`,
        {
          clientId: this.authConfig.clientId,
          clientSecret: this.authConfig.clientSecret,
          tenantId: this.authConfig.tenantId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const { access_token, expires_in } = response.data;

      if (!access_token) {
        throw new AuthServiceError('No access token received from auth service');
      }

      this.accessToken = access_token;
      // Set expiration with 5 minute buffer
      this.tokenExpiresAt = Date.now() + (expires_in - 300) * 1000;

      logger.info('Access token refreshed successfully');
      return access_token;

    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      this.accessToken = null;
      this.tokenExpiresAt = 0;

      // Convert axios errors to our custom authentication errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND' || axiosError.code === 'ETIMEDOUT') {
          throw new AuthNetworkError(`Network error: ${axiosError.message}`, error);
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          if (status === 401 || status === 403) {
            throw new AuthConfigError(`Invalid credentials: ${data?.message || 'Authentication failed'}`, error);
          }

          if (status === 429) {
            const retryAfter = axiosError.response.headers['retry-after'];
            throw new AuthRateLimitError(
              `Rate limit exceeded: ${data?.message || 'Too many requests'}`,
              retryAfter ? parseInt(retryAfter) : undefined,
              error
            );
          }

          if (status >= 500) {
            throw new AuthServiceError(`Auth service error: ${data?.message || 'Internal server error'}`, true, error);
          }

          throw new AuthServiceError(`Unexpected response: ${status} ${data?.message || ''}`, false, error);
        }

        throw new AuthNetworkError(`Request failed: ${axiosError.message}`, error);
      }

      // For non-axios errors, wrap in a generic service error
      throw new AuthServiceError(`Unexpected error during token refresh: ${error instanceof Error ? error.message : String(error)}`, false, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Make an authenticated GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * Make an authenticated POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * Make an authenticated PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * Make an authenticated DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  /**
   * Get the current tenant ID
   */
  getTenantId(): string {
    return this.authConfig.tenantId;
  }

  /**
   * Check if the client is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiresAt;
  }
}
