import { ApiKey } from '@/types/apiKey';
import { ApiKeyStorage } from '@/types/apiKeyStorage';
import crypto from 'crypto';

export class RedisApiKeyStorage implements ApiKeyStorage {
  private apiKeys: ApiKey[] = [];
  private readonly keyPrefix = 'nl_';

  constructor() {
    // No Redis client in the mock
  }

  async connect(): Promise<void> {
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    return Promise.resolve();
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return this.apiKeys;
  }

  async saveApiKeys(keys: ApiKey[]): Promise<void> {
    this.apiKeys = keys;
  }

  async createApiKey(name: string, scopes: string[]): Promise<{ apiKey: string; keyData: ApiKey }> {
    // Generate a random API key (build-safe)
    const keyId = this.generateUUID();
    const keySecret = this.generateRandomHex(16);
    const fullKey = `${this.keyPrefix}${keySecret}-${keyId}`;

    // Create the key data to store
    const keyData: ApiKey = {
      id: keyId,
      name,
      keyPrefix: fullKey.substring(0, 8),
      scopes,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    };

    // Store the key
    this.apiKeys.push(keyData);

    return { apiKey: fullKey, keyData };
  }

  private generateUUID(): string {
    // Build-safe UUID generation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback UUID generation for build time
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateRandomHex(length: number): string {
    // Build-safe random hex generation
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback for build time
    let result = '';
    for (let i = 0; i < length * 2; i++) {
      result += Math.floor(Math.random() * 16).toString(16);
    }
    return result;
  }

  async revokeApiKey(id: string): Promise<void> {
    this.apiKeys = this.apiKeys.filter(key => key.id !== id);
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    const keyIndex = this.apiKeys.findIndex(key => key.id === id);
    
    if (keyIndex >= 0) {
      this.apiKeys[keyIndex].lastUsedAt = new Date().toISOString();
    }
  }
}
