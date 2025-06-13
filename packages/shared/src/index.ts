/**
 * Shared types and utilities for NeuralLog
 */

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
