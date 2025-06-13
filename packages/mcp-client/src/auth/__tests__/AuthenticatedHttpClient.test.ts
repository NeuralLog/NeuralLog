import { AuthenticatedHttpClient } from '../AuthenticatedHttpClient.js';
import {
  AuthConfigError,
  AuthNetworkError,
  AuthServiceError
} from '../AuthenticationErrors.js';

describe('AuthenticatedHttpClient', () => {
  const mockAuthConfig = {
    authServiceUrl: 'https://auth.example.com',
    clientId: 'test-client-id',
    clientSecret: process.env.AUTH_CLIENT_SECRET || 'test-client-secret-with-minimum-32-characters',
    tenantId: 'test-tenant'
  };

  describe('Basic Functionality', () => {
    it('should create an instance with valid config', () => {
      const client = new AuthenticatedHttpClient(mockAuthConfig, 'https://api.example.com');
      expect(client).toBeInstanceOf(AuthenticatedHttpClient);
      expect(client.getTenantId()).toBe('test-tenant');
    });

    it('should report authentication status', () => {
      const client = new AuthenticatedHttpClient(mockAuthConfig, 'https://api.example.com');
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('Error Classes', () => {
    it('should create AuthConfigError correctly', () => {
      const error = new AuthConfigError('Invalid credentials');
      expect(error).toBeInstanceOf(AuthConfigError);
      expect(error.code).toBe('AUTH_CONFIG_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.message).toContain('Invalid credentials');
    });

    it('should create AuthNetworkError correctly', () => {
      const error = new AuthNetworkError('Connection failed');
      expect(error).toBeInstanceOf(AuthNetworkError);
      expect(error.code).toBe('AUTH_NETWORK_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.message).toContain('Connection failed');
    });

    it('should create AuthServiceError correctly', () => {
      const error = new AuthServiceError('Service unavailable', true);
      expect(error).toBeInstanceOf(AuthServiceError);
      expect(error.code).toBe('AUTH_SERVICE_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.message).toContain('Service unavailable');
    });
  });
});