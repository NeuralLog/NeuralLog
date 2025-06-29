import axios, { AxiosInstance } from 'axios';
import { LogClient } from './LogClient';
import { AuthClient } from './AuthClient';
import { UserClient } from './UserClient';
import { KeyManagementClient } from './KeyManagementClient';
import { ApiKeyClient } from './ApiKeyClient';
import { RetentionPolicyClient } from './RetentionPolicyClient';
import { NeuralLogClientOptions, LogOptions, GetLogsOptions, SearchOptions } from './types';
import { ConfigurationService } from './services/ConfigurationService';
import { AuthProvider } from './services/AuthProvider';
import { AuthManager } from '../auth/AuthManager';
import { AuthService } from '../auth/AuthService';
import { LogsService } from '../logs/LogsService';

import { CryptoService } from '../crypto/CryptoService';
import { KekService } from '../auth/KekService';
import { TokenService } from '../auth/TokenService';
import { KeyHierarchyManager } from '../managers/KeyHierarchyManager';
import { LogManager } from '../managers/LogManager';
import { UserManager } from '../managers/UserManager';
import { LogError } from '../errors';
import { User, AdminPromotionRequest, KEKVersion, Login, ApiKey } from '../types';
import { LoggerService } from '../utils/LoggerService';

/**
 * NeuralLog client
 *
 * This class is a facade that delegates to specialized clients for different domains.
 */
export class NeuralLogClient {
  private logger = LoggerService.getInstance(process.env.NODE_ENV === 'test');
  private configService: ConfigurationService;
  private cryptoService: CryptoService;
  private authClient: AuthClient;
  private logClient: LogClient;
  private userClient: UserClient;
  private keyManagementClient: KeyManagementClient;
  private apiKeyClient: ApiKeyClient;
  private retentionPolicyClient: RetentionPolicyClient;
  private initialized: boolean = false;

  /**
   * Create a new NeuralLogClient
   *
   * @param options Client options
   */
  constructor(options: NeuralLogClientOptions) {
    this.configService = new ConfigurationService(options);

    // Create API client with initial URLs (will be updated during initialization)
    const apiClient = axios.create({
      baseURL: this.configService.getServerUrlSync() || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Create services with initial URLs (will be updated during initialization)
    this.cryptoService = new CryptoService();
    const authService = new AuthService(
      this.configService.getAuthUrlSync() || 'http://localhost:3040',
      apiClient
    );
    const logsService = new LogsService(
      this.configService.getServerUrlSync() || 'http://localhost:3030',
      apiClient
    );
    const kekService = new KekService(
      this.configService.getAuthUrlSync() || 'http://localhost:3040',
      apiClient
    );
    const tokenService = new TokenService(
      this.configService.getAuthUrlSync() || 'http://localhost:3040',
      apiClient
    );
    const tenantId = this.configService.getTenantId();

    // Create managers
    const keyHierarchyManager = new KeyHierarchyManager(this.cryptoService, kekService);
    const authManager = new AuthManager(authService, this.cryptoService, keyHierarchyManager);
    const logManager = new LogManager(this.cryptoService, logsService, authService, authManager, tenantId);
    const userManager = new UserManager(this.cryptoService, authService, authManager);

    // Create auth provider
    const authProvider = new AuthProvider(authManager);

    // Create specialized clients
    this.authClient = new AuthClient(authManager, tokenService, this.configService, authProvider);
    this.logClient = new LogClient(logManager, this.configService, authProvider);
    this.userClient = new UserClient(userManager, this.configService, authProvider);
    this.keyManagementClient = new KeyManagementClient(keyHierarchyManager, this.configService, authProvider);
    this.apiKeyClient = new ApiKeyClient(authManager, this.configService, authProvider);
    this.retentionPolicyClient = new RetentionPolicyClient(this.configService, authProvider);

    // Initialize with API key if provided
    const apiKey = this.configService.getApiKey();
    if (apiKey) {
      this.authenticateWithApiKey(apiKey).catch(error => {
        this.logger.error('Failed to authenticate with API key:', error);
      });
    }
  }

  /**
   * Initialize the client
   *
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    try {
      // Update service URLs from registry
      await this.updateServiceUrls();

      // Initialize all clients
      await Promise.all([
        this.authClient.initialize(),
        this.logClient.initialize(),
        this.userClient.initialize(),
        this.keyManagementClient.initialize(),
        this.apiKeyClient.initialize(),
        this.retentionPolicyClient.initialize()
      ]);

      this.initialized = true;
    } catch (error) {
      return this.handleError(error, 'initialize client', 'initialization_failed');
    }
  }

  /**
   * Update service URLs from registry
   *
   * @returns Promise that resolves when URLs are updated
   */
  private async updateServiceUrls(): Promise<void> {
    try {
      // Get URLs from registry via configuration service
      const [serverUrl, authUrl] = await Promise.all([
        this.configService.getServerUrl(),
        this.configService.getAuthUrl()
      ]);

      // Update service URLs
      this.authClient.setBaseUrl(authUrl);
      this.logClient.setBaseUrl(serverUrl);
      this.userClient.setBaseUrl(authUrl);
      this.keyManagementClient.setBaseUrl(authUrl);
      this.apiKeyClient.setBaseUrl(authUrl);
      this.retentionPolicyClient.setBaseUrl(serverUrl);

      this.logger.info(`Updated service URLs from registry: server=${serverUrl}, auth=${authUrl}`);
    } catch (error) {
      this.logger.error('Failed to update service URLs from registry:', error);
      // Continue with initialization using fallback URLs
    }
  }

  /**
   * Check if the client is initialized
   *
   * @returns True if the client is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if the client is authenticated
   *
   * @returns True if authenticated
   */
  public isAuthenticated(): boolean {
    return this.authClient.isAuthenticated();
  }

  /**
   * Login with username and password
   *
   * @param username Username
   * @param password Password
   * @returns Promise that resolves to true if login was successful
   */
  public async login(username: string, password: string): Promise<boolean> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Login with the auth client
      const authResponse = await this.authClient.login(username, password);

      return !!authResponse.token;
    } catch (error) {
      return this.handleError(error, 'login', 'login_failed');
    }
  }

  /**
   * Login with API key
   *
   * @param apiKey API key
   * @returns Promise that resolves to true if login was successful
   */
  public async authenticateWithApiKey(apiKey: string): Promise<boolean> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Login with the auth client
      const authResponse = await this.authClient.loginWithApiKey(apiKey);

      return !!authResponse.token;
    } catch (error) {
      return this.handleError(error, 'authenticate with API key', 'authenticate_with_api_key_failed');
    }
  }

  /**
   * Logout
   *
   * @returns Promise that resolves when logout is complete
   */
  public async logout(): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Logout with the auth client
      await this.authClient.logout();
    } catch (error) {
      return this.handleError(error, 'logout', 'logout_failed');
    }
  }

  /**
   * Log data to the specified log
   *
   * @param logName Log name
   * @param data Log data
   * @param options Options for logging
   * @returns Promise that resolves to the log ID
   */
  public async log(
    logName: string,
    data: Record<string, any>,
    options: LogOptions = {}
  ): Promise<string> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Log data with the log client
      return await this.logClient.log(logName, data, options);
    } catch (error) {
      return this.handleError(error, 'log data', 'log_failed');
    }
  }

  /**
   * Get logs for the specified log name
   *
   * @param logName Log name
   * @param options Options for getting logs
   * @returns Promise that resolves to the logs
   */
  public async getLogs(
    logName: string,
    options: GetLogsOptions = {}
  ): Promise<Record<string, any>[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get logs with the log client
      return await this.logClient.getLogs(logName, options);
    } catch (error) {
      return this.handleError(error, 'get logs', 'get_logs_failed');
    }
  }

  /**
   * Search logs for the specified log name
   *
   * @param logName Log name
   * @param options Options for searching logs
   * @returns Promise that resolves to the search results
   */
  public async searchLogs(
    logName: string,
    options: SearchOptions
  ): Promise<Record<string, any>[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Search logs with the log client
      return await this.logClient.searchLogs(logName, options);
    } catch (error) {
      return this.handleError(error, 'search logs', 'search_logs_failed');
    }
  }



  /**
   * Get users
   *
   * @returns Promise that resolves to the users
   */
  public async getUsers(): Promise<User[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get users with the user client
      return await this.userClient.getUsers();
    } catch (error) {
      return this.handleError(error, 'get users', 'get_users_failed');
    }
  }

  /**
   * Get pending admin promotions
   *
   * @returns Promise that resolves to the pending admin promotions
   */
  public async getPendingAdminPromotions(): Promise<AdminPromotionRequest[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get pending admin promotions with the user client
      return await this.userClient.getPendingAdminPromotions();
    } catch (error) {
      return this.handleError(error, 'get pending admin promotions', 'get_pending_admin_promotions_failed');
    }
  }

  /**
   * Approve an admin promotion
   *
   * @param promotionId Promotion ID
   * @param userPassword User password
   * @returns Promise that resolves when the promotion is approved
   */
  public async approveAdminPromotion(
    promotionId: string,
    userPassword: string
  ): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Approve admin promotion with the user client
      await this.userClient.approveAdminPromotion(promotionId, userPassword);
    } catch (error) {
      return this.handleError(error, 'approve admin promotion', 'approve_admin_promotion_failed');
    }
  }

  /**
   * Reject an admin promotion
   *
   * @param promotionId Promotion ID
   * @returns Promise that resolves when the promotion is rejected
   */
  public async rejectAdminPromotion(promotionId: string): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Reject admin promotion with the user client
      await this.userClient.rejectAdminPromotion(promotionId);
    } catch (error) {
      return this.handleError(error, 'reject admin promotion', 'reject_admin_promotion_failed');
    }
  }

  /**
   * Create a new API key
   *
   * @param name API key name
   * @param expiresIn Expiration time in seconds
   * @returns Promise that resolves to the API key
   */
  public async createApiKey(name: string, expiresIn?: number): Promise<ApiKey> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Create API key with the API key client
      return await this.apiKeyClient.createApiKey(name, expiresIn);
    } catch (error) {
      return this.handleError(error, 'create API key', 'create_api_key_failed');
    }
  }

  /**
   * Get API keys
   *
   * @returns Promise that resolves to the API keys
   */
  public async getApiKeys(): Promise<ApiKey[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get API keys with the API key client
      return await this.apiKeyClient.getApiKeys();
    } catch (error) {
      return this.handleError(error, 'get API keys', 'get_api_keys_failed');
    }
  }

  /**
   * Revoke an API key
   *
   * @param apiKeyId API key ID
   * @returns Promise that resolves when the API key is revoked
   */
  public async revokeApiKey(apiKeyId: string): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Revoke API key with the API key client
      await this.apiKeyClient.revokeApiKey(apiKeyId);
    } catch (error) {
      return this.handleError(error, 'revoke API key', 'revoke_api_key_failed');
    }
  }

  /**
   * Get KEK versions
   *
   * @returns Promise that resolves to the KEK versions
   */
  public async getKEKVersions(): Promise<KEKVersion[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get KEK versions with the key management client
      return await this.keyManagementClient.getKEKVersions();
    } catch (error) {
      return this.handleError(error, 'get KEK versions', 'get_kek_versions_failed');
    }
  }

  /**
   * Create a new KEK version
   *
   * @param reason Reason for creating the KEK version
   * @returns Promise that resolves to the created KEK version
   */
  public async createKEKVersion(reason: string): Promise<any> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Create KEK version with the key management client
      return await this.keyManagementClient.createKEKVersion(reason);
    } catch (error) {
      return this.handleError(error, 'create KEK version', 'create_kek_version_failed');
    }
  }

  /**
   * Rotate KEK
   *
   * @param reason Reason for rotating the KEK
   * @param removedUsers Users to remove from the KEK
   * @returns Promise that resolves to the rotated KEK
   */
  public async rotateKEK(reason: string, removedUsers: string[] = []): Promise<any> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Rotate KEK with the key management client
      return await this.keyManagementClient.rotateKEK(reason, removedUsers);
    } catch (error) {
      return this.handleError(error, 'rotate KEK', 'rotate_kek_failed');
    }
  }

  /**
   * Get log names
   *
   * @returns Promise that resolves to an array of log names
   */
  public async getLogNames(): Promise<string[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get log names with the log client
      return await this.logClient.getLogNames();
    } catch (error) {
      return this.handleError(error, 'get log names', 'get_log_names_failed');
    }
  }

  /**
   * Re-encrypt logs with a new KEK version
   *
   * @param logNames Array of log names to re-encrypt
   * @param newKEKVersion New KEK version ID
   * @returns Promise that resolves when re-encryption is complete
   */
  public async reencryptLogs(logNames: string[], newKEKVersion: string): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get the current KEK version
      const currentKEKVersion = this.keyManagementClient.getCurrentKEKVersion();

      if (!currentKEKVersion) {
        throw new LogError('No current KEK version found', 'no_current_kek_version');
      }

      // Re-encrypt each log
      for (const logName of logNames) {
        // Get the log entries
        const logs = await this.getLogs(logName);

        // Re-encrypt each log entry
        for (const log of logs) {
          // Re-encrypt the log data
          const reencryptedLog = await this.keyManagementClient.reencryptData(
            log,
            currentKEKVersion,
            newKEKVersion
          );

          // Update the log entry
          await this.logClient.updateLogEntry(logName, log.id, reencryptedLog);
        }

        // Re-encrypt the log name
        await this.logClient.reencryptLogName(logName, newKEKVersion);
      }

      // Update the current KEK version
      this.keyManagementClient.setCurrentKEKVersion(newKEKVersion);
    } catch (error) {
      return this.handleError(error, 're-encrypt logs', 'reencrypt_logs_failed');
    }
  }

  /**
   * Upload a user's public key
   *
   * @param userPassword User password
   * @returns Promise that resolves when the public key is uploaded
   */
  public async uploadUserPublicKey(userPassword: string): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Upload user public key with the user client
      await this.userClient.uploadUserPublicKey(userPassword);
    } catch (error) {
      return this.handleError(error, 'upload user public key', 'upload_user_public_key_failed');
    }
  }

  /**
   * Provision KEK for a user
   *
   * @param userId User ID
   * @param kekVersionId KEK version ID
   * @returns Promise that resolves when the KEK is provisioned
   */
  public async provisionKEKForUser(userId: string, kekVersionId: string): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Provision KEK for user with the key management client
      await this.keyManagementClient.provisionKEKForUser(userId, kekVersionId);
    } catch (error) {
      return this.handleError(error, 'provision KEK for user', 'provision_kek_for_user_failed');
    }
  }

  /**
   * Check if a user has permission to perform an action on a resource
   *
   * @param action Action to check
   * @param resource Resource to check
   * @returns Promise that resolves to true if the user has permission
   */
  public async checkPermission(action: string, resource: string): Promise<boolean> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Check permission with the auth client
      return await this.authClient.checkPermission(action, resource);
    } catch (error) {
      return this.handleError(error, 'check permission', 'check_permission_failed');
    }
  }

  /**
   * Get the authentication token
   *
   * @returns Authentication token or null if not authenticated
   */
  public getAuthToken(): string | null {
    return this.authClient.getAuthToken();
  }

  /**
   * Get the crypto service
   *
   * @returns CryptoService instance
   */
  public getCryptoService(): CryptoService {
    return this.cryptoService;
  }

  /**
   * Get the log client
   *
   * @returns Log client
   */
  public getLogClient(): LogClient {
    return this.logClient;
  }

  /**
   * Get the auth client
   *
   * @returns Auth client
   */
  public getAuthClient(): AuthClient {
    return this.authClient;
  }

  /**
   * Get the user client
   *
   * @returns User client
   */
  public getUserClient(): UserClient {
    return this.userClient;
  }

  /**
   * Get the key management client
   *
   * @returns Key management client
   */
  public getKeyManagementClient(): KeyManagementClient {
    return this.keyManagementClient;
  }

  /**
   * Get the API key client
   *
   * @returns API key client
   */
  public getApiKeyClient(): ApiKeyClient {
    return this.apiKeyClient;
  }

  /**
   * Get the retention policy for the tenant or a specific log
   *
   * @param logName Optional log name - if provided, gets the policy for this specific log
   * @returns Promise that resolves to the retention policy
   */
  public async getRetentionPolicy(logName?: string): Promise<any> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // If log name is provided, encrypt it
      let encryptedLogName: string | undefined;
      if (logName) {
        const cryptoService = this.getCryptoService();
        encryptedLogName = await cryptoService.encryptLogName(logName, this.configService.getTenantId());
      }

      // Get retention policy with the retention policy client
      const policy = await this.retentionPolicyClient.getRetentionPolicy(encryptedLogName);

      // If the response includes an encrypted log name, decrypt it
      if (policy.logName) {
        try {
          const cryptoService = this.getCryptoService();
          policy.logName = await cryptoService.decryptLogName(policy.logName, this.configService.getTenantId());
        } catch (error) {
          this.logger.warn('Failed to decrypt log name in retention policy:', error);
          // Keep the encrypted log name if decryption fails
        }
      }

      return policy;
    } catch (error) {
      throw this.handleError(error, 'get retention policy', 'get_retention_policy_failed');
    }
  }

  /**
   * Set the retention policy for the tenant or a specific log
   *
   * @param retentionPeriodMs Retention period in milliseconds
   * @param logName Optional log name - if provided, sets the policy for this specific log
   * @returns Promise that resolves to the updated retention policy
   */
  public async setRetentionPolicy(retentionPeriodMs: number, logName?: string): Promise<any> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // If log name is provided, encrypt it
      let encryptedLogName: string | undefined;
      if (logName) {
        const cryptoService = this.getCryptoService();
        encryptedLogName = await cryptoService.encryptLogName(logName, this.configService.getTenantId());
      }

      // Set retention policy with the retention policy client
      const policy = await this.retentionPolicyClient.setRetentionPolicy(retentionPeriodMs, encryptedLogName);

      // If the response includes an encrypted log name, decrypt it
      if (policy.logName) {
        try {
          const cryptoService = this.getCryptoService();
          policy.logName = await cryptoService.decryptLogName(policy.logName, this.configService.getTenantId());
        } catch (error) {
          this.logger.warn('Failed to decrypt log name in retention policy:', error);
          // Keep the encrypted log name if decryption fails
        }
      }

      return policy;
    } catch (error) {
      throw this.handleError(error, 'set retention policy', 'set_retention_policy_failed');
    }
  }

  /**
   * Delete the retention policy for the tenant or a specific log
   *
   * @param logName Optional log name - if provided, deletes the policy for this specific log
   * @returns Promise that resolves when the retention policy is deleted
   */
  public async deleteRetentionPolicy(logName?: string): Promise<void> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // If log name is provided, encrypt it
      let encryptedLogName: string | undefined;
      if (logName) {
        const cryptoService = this.getCryptoService();
        encryptedLogName = await cryptoService.encryptLogName(logName, this.configService.getTenantId());
      }

      // Delete retention policy with the retention policy client
      await this.retentionPolicyClient.deleteRetentionPolicy(encryptedLogName);
    } catch (error) {
      throw this.handleError(error, 'delete retention policy', 'delete_retention_policy_failed');
    }
  }

  /**
   * Get all retention policies for the tenant
   *
   * @returns Promise that resolves to an array of retention policies
   */
  public async getAllRetentionPolicies(): Promise<any[]> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // Get all retention policies with the retention policy client
      const policies = await this.retentionPolicyClient.getAllRetentionPolicies();

      // Decrypt log names in the policies
      for (const policy of policies) {
        if (policy.logName) {
          try {
            const cryptoService = this.getCryptoService();
            policy.logName = await cryptoService.decryptLogName(policy.logName, this.configService.getTenantId());
          } catch (error) {
            this.logger.warn('Failed to decrypt log name in retention policy:', error);
            // Keep the encrypted log name if decryption fails
          }
        }
      }

      return policies;
    } catch (error) {
      throw this.handleError(error, 'get all retention policies', 'get_all_retention_policies_failed');
    }
  }

  /**
   * Get the count of logs that would be affected by a retention policy change
   *
   * @param retentionPeriodMs Retention period in milliseconds
   * @param logName Optional log name - if provided, gets the count for this specific log
   * @returns Promise that resolves to the count of logs that would be affected
   */
  public async getExpiredLogsCount(retentionPeriodMs: number, logName?: string): Promise<number> {
    try {
      // Ensure client is initialized
      if (!this.isInitialized()) {
        await this.initialize();
      }

      // If log name is provided, encrypt it
      let encryptedLogName: string | undefined;
      if (logName) {
        const cryptoService = this.getCryptoService();
        encryptedLogName = await cryptoService.encryptLogName(logName, this.configService.getTenantId());
      }

      // Get expired logs count with the retention policy client
      return await this.retentionPolicyClient.getExpiredLogsCount(retentionPeriodMs, encryptedLogName);
    } catch (error) {
      throw this.handleError(error, 'get expired logs count', 'get_expired_logs_count_failed');
    }
  }

  /**
   * Helper method to handle errors consistently
   *
   * @param error The error to handle
   * @param operation The operation that failed
   * @param errorCode The error code to use
   * @throws LogError with a consistent format
   */
  private handleError(error: unknown, operation: string, errorCode: string): never {
    throw new LogError(
      `Failed to ${operation}: ${error instanceof Error ? error.message : String(error)}`,
      errorCode
    );
  }
}
