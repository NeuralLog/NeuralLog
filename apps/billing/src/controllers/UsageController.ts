import { Response } from 'express';
import { UsageTracker } from '../services/UsageTracker';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

export class UsageController {
  private usageTracker: UsageTracker;

  constructor() {
    this.usageTracker = UsageTracker.getInstance();
  }

  public getCurrentUsage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const usage = await this.usageTracker.getCurrentUsage(tenantId);
      
      res.json({
        success: true,
        usage
      });
    } catch (error) {
      logger.error('Failed to get current usage:', error);
      res.status(500).json({
        error: 'Failed to retrieve usage data',
        code: 'USAGE_RETRIEVAL_FAILED'
      });
    }
  };

  public getUsageHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const months = parseInt(req.query.months as string) || 12;
      
      const history = await this.usageTracker.getUsageHistory(tenantId, months);
      
      res.json({
        success: true,
        history
      });
    } catch (error) {
      logger.error('Failed to get usage history:', error);
      res.status(500).json({
        error: 'Failed to retrieve usage history',
        code: 'USAGE_HISTORY_FAILED'
      });
    }
  };

  public getUsageLimits = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const limits = await this.usageTracker.getUsageLimits(tenantId);
      
      res.json({
        success: true,
        limits
      });
    } catch (error) {
      logger.error('Failed to get usage limits:', error);
      res.status(500).json({
        error: 'Failed to retrieve usage limits',
        code: 'USAGE_LIMITS_FAILED'
      });
    }
  };

  public trackLogEntry = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { size = 1 } = req.body;
      
      await this.usageTracker.trackLogEntry(tenantId, size);
      
      res.json({
        success: true,
        message: 'Log entry tracked'
      });
    } catch (error) {
      logger.error('Failed to track log entry:', error);
      res.status(500).json({
        error: 'Failed to track log entry',
        code: 'LOG_TRACKING_FAILED'
      });
    }
  };

  public trackAIQuery = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { queryType = 'general' } = req.body;
      
      await this.usageTracker.trackAIQuery(tenantId, queryType);
      
      res.json({
        success: true,
        message: 'AI query tracked'
      });
    } catch (error) {
      logger.error('Failed to track AI query:', error);
      res.status(500).json({
        error: 'Failed to track AI query',
        code: 'AI_QUERY_TRACKING_FAILED'
      });
    }
  };

  public trackStorageUsage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { bytes } = req.body;
      
      await this.usageTracker.trackStorageUsage(tenantId, bytes);
      
      res.json({
        success: true,
        message: 'Storage usage tracked'
      });
    } catch (error) {
      logger.error('Failed to track storage usage:', error);
      res.status(500).json({
        error: 'Failed to track storage usage',
        code: 'STORAGE_TRACKING_FAILED'
      });
    }
  };

  public trackAPIRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { endpoint } = req.body;
      
      await this.usageTracker.trackAPIRequest(tenantId, endpoint);
      
      res.json({
        success: true,
        message: 'API request tracked'
      });
    } catch (error) {
      logger.error('Failed to track API request:', error);
      res.status(500).json({
        error: 'Failed to track API request',
        code: 'API_REQUEST_TRACKING_FAILED'
      });
    }
  };

  public trackActiveUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { userId } = req.body;
      
      await this.usageTracker.trackActiveUser(tenantId, userId);
      
      res.json({
        success: true,
        message: 'Active user tracked'
      });
    } catch (error) {
      logger.error('Failed to track active user:', error);
      res.status(500).json({
        error: 'Failed to track active user',
        code: 'ACTIVE_USER_TRACKING_FAILED'
      });
    }
  };

  public getUsageAnalytics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const granularity = req.query.granularity as string || 'day';
      
      // Implementation for usage analytics
      
      res.json({
        success: true,
        analytics: {
          totalLogs: 0,
          totalAIQueries: 0,
          totalStorage: 0,
          trends: []
        }
      });
    } catch (error) {
      logger.error('Failed to get usage analytics:', error);
      res.status(500).json({
        error: 'Failed to retrieve usage analytics',
        code: 'USAGE_ANALYTICS_FAILED'
      });
    }
  };
}
