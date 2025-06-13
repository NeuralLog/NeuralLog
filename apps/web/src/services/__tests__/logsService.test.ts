import { LogsService } from '../logsService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the token exchange service
jest.mock('../tokenExchangeService', () => ({
  getAuthToken: jest.fn(),
  exchangeTokenForResource: jest.fn(),
}));

describe('LogsService', () => {
  let service: LogsService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  const { getAuthToken, exchangeTokenForResource } = require('../tokenExchangeService');

  // Sample log data
  const sampleLogEntry = {
    id: 'test-id',
    timestamp: '2023-04-10T14:32:00Z',
    data: { message: 'Test log message' }
  };

  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new service instance
    service = new LogsService('test-tenant', 'test-api-key', '/api');
  });

  describe('constructor', () => {
    it('should create a service with the provided options', () => {
      expect(service).toBeInstanceOf(LogsService);
      expect(service['tenantId']).toBe('test-tenant');
      expect(service['apiUrl']).toBe('/api');
    });

    it('should use default API URL if not provided', () => {
      const defaultService = new LogsService('test-tenant', 'test-api-key');
      expect(defaultService['apiUrl']).toBe('/api');
    });
  });

  describe('setTenantId', () => {
    it('should update the tenant ID', () => {
      service.setTenantId('new-tenant');
      expect(service['tenantId']).toBe('new-tenant');
    });
  });

  describe('getLogNames', () => {
    it('should return log names from API route', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logs: ['log1', 'log2'] })
      } as Response);

      const result = await service.getLogNames();

      expect(result).toEqual(['log1', 'log2']);
      expect(mockFetch).toHaveBeenCalledWith('/api/logs', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'test-tenant',
        },
      });
    });

    it('should fallback to resource token when API route fails', async () => {
      // Mock API route failure
      mockFetch.mockRejectedValueOnce(new Error('API route failed'));
      
      // Mock token exchange success
      getAuthToken.mockResolvedValue('auth-token');
      exchangeTokenForResource.mockResolvedValue('resource-token');
      
      // Mock logs server success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logs: ['log1', 'log2'] })
      } as Response);

      const result = await service.getLogNames();

      expect(result).toEqual(['log1', 'log2']);
      expect(getAuthToken).toHaveBeenCalled();
      expect(exchangeTokenForResource).toHaveBeenCalledWith('auth-token', 'logs:all', 'test-tenant');
    });

    it('should return empty array when all methods fail', async () => {
      // Mock all failures
      mockFetch.mockRejectedValue(new Error('All failed'));
      getAuthToken.mockRejectedValue(new Error('No token'));

      const result = await service.getLogNames();

      expect(result).toEqual([]);
    });
  });

  describe('getLogByName', () => {
    it('should return log entries from API route', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [sampleLogEntry] })
      } as Response);

      const result = await service.getLogByName('test-log');

      expect(result).toEqual([sampleLogEntry]);
      expect(mockFetch).toHaveBeenCalledWith('/api/logs/test-log', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'test-tenant',
        },
      });
    });

    it('should include limit parameter when provided', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [sampleLogEntry] })
      } as Response);

      await service.getLogByName('test-log', 10);

      expect(mockFetch).toHaveBeenCalledWith('/api/logs/test-log?limit=10', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'test-tenant',
        },
      });
    });

    it('should fallback to resource token when API route fails', async () => {
      // Mock API route failure
      mockFetch.mockRejectedValueOnce(new Error('API route failed'));
      
      // Mock token exchange success
      getAuthToken.mockResolvedValue('auth-token');
      exchangeTokenForResource.mockResolvedValue('resource-token');
      
      // Mock logs server success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [sampleLogEntry] })
      } as Response);

      const result = await service.getLogByName('test-log');

      expect(result).toEqual([sampleLogEntry]);
      expect(exchangeTokenForResource).toHaveBeenCalledWith('auth-token', 'log:test-log', 'test-tenant');
    });

    it('should return empty array when all methods fail', async () => {
      // Mock all failures
      mockFetch.mockRejectedValue(new Error('All failed'));
      getAuthToken.mockRejectedValue(new Error('No token'));

      const result = await service.getLogByName('test-log');

      expect(result).toEqual([]);
    });
  });

  describe('getLogEntryById', () => {
    it('should return placeholder implementation', async () => {
      const result = await service.getLogEntryById('test-log', 'test-id');
      expect(result).toEqual({});
    });
  });

  describe('createOrOverwriteLog', () => {
    it('should resolve without error (placeholder)', async () => {
      await expect(service.createOrOverwriteLog('test-log', [sampleLogEntry])).resolves.toBeUndefined();
    });
  });

  describe('appendToLog', () => {
    it('should resolve without error (placeholder)', async () => {
      await expect(service.appendToLog('test-log', [sampleLogEntry])).resolves.toBeUndefined();
    });
  });

  describe('updateLogEntry', () => {
    it('should resolve without error (placeholder)', async () => {
      await expect(service.updateLogEntry('test-log', 'test-id', sampleLogEntry)).resolves.toBeUndefined();
    });
  });

  describe('deleteLogEntry', () => {
    it('should resolve without error (placeholder)', async () => {
      await expect(service.deleteLogEntry('test-log', 'test-id')).resolves.toBeUndefined();
    });
  });

  describe('clearLog', () => {
    it('should resolve without error (placeholder)', async () => {
      await expect(service.clearLog('test-log')).resolves.toBeUndefined();
    });
  });

  describe('searchLogs', () => {
    it('should return empty array (placeholder)', async () => {
      const result = await service.searchLogs({ query: 'test' });
      expect(result).toEqual([]);
    });
  });
});
