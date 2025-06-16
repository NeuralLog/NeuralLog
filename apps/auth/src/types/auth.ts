/**
 * Auth Service API Types
 * 
 * Local copy of auth types to avoid TypeScript rootDir issues
 */

export interface ApiKey {
  /**
   * API key ID
   */
  id: string;
  /**
   * User ID
   */
  userId: string;
  /**
   * Tenant ID
   */
  tenantId: string;
  /**
   * API key name
   */
  name: string;
  /**
   * API key scopes
   */
  scopes: string[];
  /**
   * Verification hash for the API key
   */
  verificationHash: string;
  /**
   * When the API key was created
   * @format date-time
   */
  createdAt: string;
  /**
   * When the API key expires
   * @format date-time
   */
  expiresAt: string;
  /**
   * Whether the API key is revoked
   */
  revoked: boolean;
  /**
   * When the API key was revoked
   * @format date-time
   */
  revokedAt?: string;
  /**
   * Last used timestamp
   * @format date-time
   */
  lastUsedAt?: string;
}

export interface ApiKeyChallenge {
  /**
   * Challenge string
   */
  challenge: string;
  /**
   * Expiration time in seconds
   */
  expiresIn: number;
}

export interface ApiKeyChallengeVerification {
  /**
   * Whether the challenge response is valid
   */
  valid: boolean;
  /**
   * User ID
   */
  userId?: string;
  /**
   * Tenant ID
   */
  tenantId?: string;
  /**
   * Scopes
   */
  scopes?: string[];
}

export interface Login {
  /**
   * Authentication token
   */
  token: string;
  /**
   * User ID
   */
  user_id: string;
  /**
   * Tenant ID
   */
  tenant_id: string;
  /**
   * User profile
   */
  user?: UserProfile;
}

export interface PermissionCheck {
  /**
   * Whether the user has permission
   */
  allowed: boolean;
}

export interface TokenValidationResult {
  /**
   * Whether the token is valid
   */
  valid: boolean;
  /**
   * User information (if token is valid)
   */
  user?: UserProfile;
}

export interface TokenExchangeResult {
  /**
   * The exchanged token
   */
  token: string;
}

export interface ResourceTokenVerificationResult {
  /**
   * Whether the token is valid
   */
  valid: boolean;
  /**
   * User ID
   */
  userId: string;
  /**
   * Tenant ID
   */
  tenantId: string;
  /**
   * Resource
   */
  resource: string;
}

export interface Tenant {
  /**
   * Tenant ID
   */
  tenantId: string;
  /**
   * Admin user ID
   */
  adminUserId: string;
}

export interface Role {
  /**
   * Role ID
   */
  id: string;
  /**
   * Role name
   */
  name: string;
  /**
   * Role description
   */
  description?: string;
  /**
   * Role permissions
   */
  permissions: string[];
  /**
   * Roles this role inherits from
   */
  inherits?: string[];
  /**
   * Tenant ID
   */
  tenantId: string;
}

export interface User {
  /**
   * User ID
   */
  id: string;
  /**
   * User email
   * @format email
   */
  email: string;
  /**
   * User name
   */
  name?: string;
  /**
   * Tenant ID
   */
  tenantId: string;
  /**
   * Whether the user is an admin
   */
  isAdmin?: boolean;
  /**
   * Creation date
   * @format date-time
   */
  createdAt: string;
}

export interface UserProfile {
  /**
   * User ID
   */
  id: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /**
   * Tenant ID
   */
  tenantId: string;
  /**
   * Name
   */
  name?: string;
  /**
   * Username (optional)
   */
  username?: string;
  /**
   * First name (optional)
   */
  first_name?: string;
  /**
   * Last name (optional)
   */
  last_name?: string;
  /**
   * User roles (optional)
   */
  roles?: string[];
}

// Extended User interface for auth service with additional properties
export interface ExtendedUser extends User {
  role?: 'admin' | 'member';
  updatedAt?: string;
}
