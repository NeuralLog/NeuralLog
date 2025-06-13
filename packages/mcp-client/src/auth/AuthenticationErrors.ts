/**
 * Custom authentication error classes for better error handling and type safety
 */

export abstract class AuthenticationError extends Error {
  abstract readonly code: string;
  abstract readonly retryable: boolean;
  
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Configuration error - bad credentials, invalid client ID, etc.
 * These are not retryable and indicate a configuration problem.
 */
export class AuthConfigError extends AuthenticationError {
  readonly code = 'AUTH_CONFIG_ERROR';
  readonly retryable = false;
  
  constructor(message: string, cause?: Error) {
    super(`Authentication configuration error: ${message}`, cause);
  }
}

/**
 * Network error - connection timeout, DNS resolution failure, etc.
 * These are potentially retryable after a delay.
 */
export class AuthNetworkError extends AuthenticationError {
  readonly code = 'AUTH_NETWORK_ERROR';
  readonly retryable = true;
  
  constructor(message: string, cause?: Error) {
    super(`Authentication network error: ${message}`, cause);
  }
}

/**
 * Service error - auth service returned an error, invalid response format, etc.
 * These may be retryable depending on the specific error.
 */
export class AuthServiceError extends AuthenticationError {
  readonly code = 'AUTH_SERVICE_ERROR';
  readonly retryable: boolean;
  
  constructor(message: string, retryable: boolean = false, cause?: Error) {
    super(`Authentication service error: ${message}`, cause);
    this.retryable = retryable;
  }
}

/**
 * Token expired error - the current token has expired and needs refresh.
 * This is always retryable.
 */
export class AuthTokenExpiredError extends AuthenticationError {
  readonly code = 'AUTH_TOKEN_EXPIRED';
  readonly retryable = true;
  
  constructor(message: string = 'Authentication token has expired', cause?: Error) {
    super(message, cause);
  }
}

/**
 * Rate limit error - too many authentication requests.
 * This is retryable after a delay.
 */
export class AuthRateLimitError extends AuthenticationError {
  readonly code = 'AUTH_RATE_LIMIT';
  readonly retryable = true;
  
  constructor(
    message: string = 'Authentication rate limit exceeded',
    public readonly retryAfter?: number,
    cause?: Error
  ) {
    super(message, cause);
  }
}

/**
 * Utility function to determine if an error is an authentication error
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Utility function to determine if an authentication error is retryable
 */
export function isRetryableAuthError(error: unknown): boolean {
  return isAuthenticationError(error) && error.retryable;
}

/**
 * Utility function to get retry delay for retryable errors
 */
export function getRetryDelay(error: unknown, attempt: number = 1): number {
  if (!isRetryableAuthError(error)) {
    return 0;
  }
  
  if (error instanceof AuthRateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }
  
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
}
