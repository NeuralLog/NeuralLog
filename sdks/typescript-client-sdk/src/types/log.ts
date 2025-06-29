/**
 * Log Server API Types
 * 
 * THIS FILE IS AUTO-GENERATED - DO NOT EDIT DIRECTLY
 * Generated from OpenAPI schema
 */

export interface Log {
  /**
   * Log ID
   */
  id?: string;
  /**
   * Log name
   */
  name: string;
  /**
   * Log description
   */
  description?: string;
  /**
   * Tenant ID
   */
  tenantId: string;
  /**
   * Creation timestamp
   * @format date-time
   */
  createdAt?: string;
  /**
   * Last update timestamp
   * @format date-time
   */
  updatedAt?: string;
  /**
   * Number of days to retain log entries
   */
  retentionDays?: number;
  /**
   * Whether encryption is enabled for this log
   */
  encryptionEnabled?: boolean;
}

export interface LogUpdate {
  /**
   * Log description
   */
  description?: string;
  /**
   * Number of days to retain log entries
   */
  retentionDays?: number;
  /**
   * Whether encryption is enabled for this log
   */
  encryptionEnabled?: boolean;
}

export interface LogEntry {
  /**
   * Log entry ID
   */
  id?: string;
  /**
   * Log ID
   */
  logId: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp?: string;
  /**
   * Log entry data
   */
  data: Record<string, any>;
  /**
   * Search tokens
   */
  searchTokens?: string[];
  encryptionInfo?: {
    /** Encryption version */
    version?: string;
    /** Encryption algorithm */
    algorithm?: string;
  };
}

export interface LogSearchOptions {
  /**
   * Search query
   */
  query?: string;
  /**
   * Search tokens
   */
  searchTokens?: string[];
  /**
   * Maximum number of entries to return
   */
  limit?: number;
  /**
   * Offset for pagination
   */
  offset?: number;
}

export interface PaginatedLogEntries {
  entries?: LogEntry[];
  /**
   * Total number of entries
   */
  total?: number;
  /**
   * Maximum number of entries returned
   */
  limit?: number;
  /**
   * Offset for pagination
   */
  offset?: number;
  /**
   * Whether there are more entries
   */
  hasMore?: boolean;
}

export interface PermissionCheckRequest {
  /**
   * Action to check (e.g., read, write, delete)
   */
  action: string;
  /**
   * Resource to check permission for
   */
  resource: string;
  contextualTuples?: object[];
}

export interface PermissionCheckResponse {
  /**
   * Whether the permission is allowed
   */
  allowed: boolean;
}

export interface RetentionPolicy {
  /**
   * Tenant ID
   */
  tenantId: string;
  /**
   * Log name (encrypted) - if not present, this is the tenant-wide default policy
   */
  logName?: string;
  /**
   * Retention period in milliseconds (-1 for unlimited retention)
   * @format int64
   */
  retentionPeriodMs: number;
  /**
   * Creation timestamp
   * @format date-time
   */
  createdAt?: string;
  /**
   * Last update timestamp
   * @format date-time
   */
  updatedAt?: string;
  /**
   * User ID of the user who created the policy
   */
  createdBy?: string;
  /**
   * User ID of the user who last updated the policy
   */
  updatedBy?: string;
}

export interface RetentionPolicyRequest {
  /**
   * Retention period in milliseconds (-1 for unlimited retention)
   * @format int64
   */
  retentionPeriodMs: number;
  /**
   * Log name (encrypted) - if not provided, sets the tenant-wide default policy
   */
  logName?: string;
}

export interface Error {
  status: string;
  message: string;
  code?: string;
}

export interface PaginatedResult<T> {
  /** Result items */
  items?: T[];

  /** Result entries (alias for items for backward compatibility) */
  entries: T[];

  /** Total count */
  total: number;

  /** Total count (alias for total for backward compatibility) */
  totalCount: number;

  /** Result limit */
  limit: number;

  /** Result offset */
  offset: number;

  /** Whether there are more results */
  hasMore?: boolean;
}

export interface BatchAppendResult {
  /** Entries with their IDs and timestamps */
  entries: { id: string; timestamp: string }[];
}

// API-specific types
export type GetLogsData = Log[];
export type CreateLogData = Log;
export type GetLogData = Log;
export type UpdateLogData = Log;
export type DeleteLogData = any;
export type GetLogEntriesData = PaginatedLogEntries;
export type SearchLogEntriesData = PaginatedLogEntries;

export interface GetLogEntriesParams {
  /**
   * Maximum number of entries to return
   * @min 1
   * @default 10
   */
  limit?: number;
  /**
   * Offset for pagination
   * @min 0
   * @default 0
   */
  offset?: number;
  /** Log name */
  logName: string;
}

export interface AppendLogEntryData {
  /** @example "success" */
  status?: string;
  id?: string;
  /** @format date-time */
  timestamp?: string;
}

export interface BatchAppendLogEntriesPayload {
  entries: LogEntry[];
}

export interface BatchAppendLogEntriesData {
  count?: number;
  entries?: {
    id?: string;
    /** @format date-time */
    timestamp?: string;
  }[];
}

export interface LogEncryptionInfo {
  /**
   * Whether the log is encrypted
   */
  encrypted: boolean;

  /**
   * Encryption algorithm
   */
  algorithm: string;

  /**
   * KEK version used to encrypt the log
   */
  kekVersion: string;
}

export interface EncryptedLogEntry {
  /**
   * Encrypted log data
   */
  data: string;

  /**
   * Initialization vector
   */
  iv: string;

  /**
   * Encryption algorithm
   */
  algorithm: string;

  /**
   * KEK version used to encrypt this log
   */
  kekVersion: string;

  /**
   * Timestamp
   */
  timestamp: string;

  /**
   * Log ID
   */
  id: string;

  /**
   * Search tokens
   */
  searchTokens?: string[];
}
