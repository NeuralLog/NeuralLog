/**
 * Shared types and utilities for NeuralLog
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Log entry
 */
export interface LogEntry {
  /**
   * Entry ID
   */
  id?: string;

  /**
   * Log level
   */
  level: string;

  /**
   * Log message
   */
  message: string;

  /**
   * Timestamp
   */
  timestamp: string;

  /**
   * Additional data
   */
  [key: string]: any;
}

/**
 * Log response
 */
export interface LogResponse {
  /**
   * Log entries
   */
  entries: LogEntry[];

  /**
   * Total count
   */
  total?: number;
}

/**
 * Log names response
 */
export interface LogNamesResponse {
  /**
   * Log names
   */
  logs: string[];
}

/**
 * Aggregate statistics
 */
export interface AggregateStatistics {
  /**
   * Total number of logs
   */
  totalLogs: number;

  /**
   * Total size in bytes
   */
  totalSize: number;

  /**
   * Date range start
   */
  startDate: string;

  /**
   * Date range end
   */
  endDate: string;

  /**
   * Log counts by day
   */
  logsByDay: Record<string, number>;

  /**
   * Size by day
   */
  sizeByDay: Record<string, number>;
}

/**
 * Log statistics
 */
export interface LogStatistics {
  /**
   * Log name
   */
  logName: string;

  /**
   * Number of entries
   */
  entryCount: number;

  /**
   * Size in bytes
   */
  size: number;

  /**
   * First entry timestamp
   */
  firstEntry: string;

  /**
   * Last entry timestamp
   */
  lastEntry: string;

  /**
   * Average entry size
   */
  averageEntrySize: number;
}
