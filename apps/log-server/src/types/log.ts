/**
 * Log Server Types
 * 
 * Local copy of log types to avoid import issues
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
   * Log tags
   */
  tags?: string[];
  /**
   * Log retention policy
   */
  retentionPolicy?: string;
  /**
   * Log creation date
   * @format date-time
   */
  createdAt?: string;
  /**
   * Log update date
   * @format date-time
   */
  updatedAt?: string;
  /**
   * Tenant ID
   */
  tenantId?: string;
}

export interface LogUpdate {
  /**
   * Log description
   */
  description?: string;
  /**
   * Log tags
   */
  tags?: string[];
  /**
   * Log retention policy
   */
  retentionPolicy?: string;
}

export interface LogEntry {
  /**
   * Log entry ID
   */
  id: string;
  /**
   * Log ID
   */
  logId: string;
  /**
   * Log entry timestamp
   * @format date-time
   */
  timestamp: string;
  /**
   * Log entry level
   */
  level?: string;
  /**
   * Log entry message
   */
  message: string;
  /**
   * Log entry data (for encrypted content)
   */
  data?: any;
  /**
   * Log entry metadata
   */
  metadata?: Record<string, any>;
  /**
   * Log entry tags
   */
  tags?: string[];
  /**
   * Encryption information
   */
  encryptionInfo?: {
    /** Whether the entry is encrypted */
    encrypted: boolean;
    /** Encryption algorithm used */
    algorithm?: string;
    /** Key ID used for encryption */
    keyId?: string;
  };
  /**
   * Creation date
   * @format date-time
   */
  createdAt?: string;
}

export interface LogSearchOptions {
  /**
   * Search query
   */
  query?: string;
  /**
   * Log level filter
   */
  level?: string;
  /**
   * Start time filter
   * @format date-time
   */
  startTime?: string;
  /**
   * End time filter
   * @format date-time
   */
  endTime?: string;
  /**
   * Tags filter
   */
  tags?: string[];
  /**
   * Limit
   */
  limit?: number;
  /**
   * Offset
   */
  offset?: number;
}

export interface PaginatedResult<T> {
  /** The data items */
  entries?: T[];
  /** The data items (alternative property name) */
  items?: T[];
  /** Total number of items */
  total?: number;
  /** Total count (alternative property name) */
  totalCount?: number;
  /** Current page offset */
  offset?: number;
  /** Number of items per page */
  limit?: number;
  /** Whether there are more results */
  hasMore?: boolean;
}

export interface BatchAppendResult {
  /** Entries with their IDs and timestamps */
  entries: { id: string; timestamp: string }[];
}

export interface Error {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: Record<string, any>;
}

// Additional types for log server operations
export interface GetLogsData {
  logs: Log[];
}

export interface CreateLogData {
  log: Log;
}

export interface GetLogData {
  log: Log;
}

export interface UpdateLogData {
  log: Log;
}

export interface DeleteLogData {
  success: boolean;
}

export interface GetLogEntriesData {
  entries: LogEntry[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchLogEntriesData {
  entries: LogEntry[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginatedLogEntries {
  entries: LogEntry[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface GetLogEntriesParams {
  logName: string;
  limit?: number;
  offset?: number;
}

export interface AppendLogEntryData {
  id: string;
  timestamp: string;
}

export interface BatchAppendLogEntriesPayload {
  entries: LogEntry[];
}

export interface BatchAppendLogEntriesData {
  entries: { id: string; timestamp: string }[];
}

export interface EncryptedLogEntry extends LogEntry {
  encryptionInfo: {
    encrypted: true;
    algorithm: string;
    keyId: string;
  };
}
