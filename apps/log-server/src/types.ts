/**
 * Types for the log server
 */

// This file is kept for backward compatibility
// All wire protocol types are now defined in @neurallog/client-sdk

// Re-export the types from local types
export type {
  Log,
  LogEntry,
  LogSearchOptions,
  PaginatedResult,
  BatchAppendResult
} from './types/log';
