import { PrismaClient } from '@prisma/client';
import Redis from 'redis';
import { logger } from '../utils/logger';
import { BillingService, SubscriptionPlan } from './BillingService';

export interface UsageMetrics {
  tenantId: string;
  period: string;
  logsCount: number;
  aiQueries: number;
  storageBytes: number;
  apiRequests: number;
  activeUsers: number;
}

export interface UsageLimits {
  logsPerMonth: number;
  aiQueries: number;
  storageBytes: number;
  teamMembers: number;
}

export class UsageTracker {
  private static instance: UsageTracker;
  private prisma: PrismaClient;
  private redis: Redis.RedisClientType;
  private billingService: BillingService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.billingService = BillingService.getInstance();
  }

  public static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.redis.connect();
      logger.info('Usage tracker initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize usage tracker:', error);
      throw error;
    }
  }

  public async trackLogEntry(tenantId: string, logSize: number = 1): Promise<void> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const key = `usage:${tenantId}:${currentPeriod}:logs`;
      
      // Increment log count in Redis for real-time tracking
      await this.redis.incrBy(key, logSize);
      
      // Set expiration for the key (keep for 2 months)
      await this.redis.expire(key, 60 * 60 * 24 * 60); // 60 days
      
      // Check if usage exceeds limits
      await this.checkUsageLimits(tenantId, 'logs');
      
    } catch (error) {
      logger.error(`Failed to track log entry for tenant ${tenantId}:`, error);
    }
  }

  public async trackAIQuery(tenantId: string, queryType: string = 'general'): Promise<void> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const key = `usage:${tenantId}:${currentPeriod}:ai_queries`;
      
      await this.redis.incr(key);
      await this.redis.expire(key, 60 * 60 * 24 * 60);
      
      // Track query type for analytics
      const typeKey = `usage:${tenantId}:${currentPeriod}:ai_queries:${queryType}`;
      await this.redis.incr(typeKey);
      await this.redis.expire(typeKey, 60 * 60 * 24 * 60);
      
      await this.checkUsageLimits(tenantId, 'ai_queries');
      
    } catch (error) {
      logger.error(`Failed to track AI query for tenant ${tenantId}:`, error);
    }
  }

  public async trackStorageUsage(tenantId: string, bytes: number): Promise<void> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const key = `usage:${tenantId}:${currentPeriod}:storage`;
      
      await this.redis.incrBy(key, bytes);
      await this.redis.expire(key, 60 * 60 * 24 * 60);
      
      await this.checkUsageLimits(tenantId, 'storage');
      
    } catch (error) {
      logger.error(`Failed to track storage usage for tenant ${tenantId}:`, error);
    }
  }

  public async trackAPIRequest(tenantId: string, endpoint: string): Promise<void> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const key = `usage:${tenantId}:${currentPeriod}:api_requests`;
      
      await this.redis.incr(key);
      await this.redis.expire(key, 60 * 60 * 24 * 60);
      
      // Track endpoint usage for analytics
      const endpointKey = `usage:${tenantId}:${currentPeriod}:endpoints:${endpoint}`;
      await this.redis.incr(endpointKey);
      await this.redis.expire(endpointKey, 60 * 60 * 24 * 60);
      
    } catch (error) {
      logger.error(`Failed to track API request for tenant ${tenantId}:`, error);
    }
  }

  public async trackActiveUser(tenantId: string, userId: string): Promise<void> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      const key = `usage:${tenantId}:${currentPeriod}:active_users`;
      
      // Use a set to track unique active users
      await this.redis.sAdd(key, userId);
      await this.redis.expire(key, 60 * 60 * 24 * 60);
      
    } catch (error) {
      logger.error(`Failed to track active user for tenant ${tenantId}:`, error);
    }
  }

  public async getCurrentUsage(tenantId: string): Promise<UsageMetrics> {
    try {
      const currentPeriod = this.getCurrentPeriod();
      
      const [logsCount, aiQueries, storageBytes, apiRequests, activeUsersSet] = await Promise.all([
        this.redis.get(`usage:${tenantId}:${currentPeriod}:logs`),
        this.redis.get(`usage:${tenantId}:${currentPeriod}:ai_queries`),
        this.redis.get(`usage:${tenantId}:${currentPeriod}:storage`),
        this.redis.get(`usage:${tenantId}:${currentPeriod}:api_requests`),
        this.redis.sCard(`usage:${tenantId}:${currentPeriod}:active_users`)
      ]);

      return {
        tenantId,
        period: currentPeriod,
        logsCount: parseInt(logsCount || '0'),
        aiQueries: parseInt(aiQueries || '0'),
        storageBytes: parseInt(storageBytes || '0'),
        apiRequests: parseInt(apiRequests || '0'),
        activeUsers: activeUsersSet || 0
      };
    } catch (error) {
      logger.error(`Failed to get current usage for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  public async getUsageLimits(tenantId: string): Promise<UsageLimits | null> {
    try {
      const subscription = await this.billingService.getSubscriptionByTenant(tenantId);
      if (!subscription) {
        return null;
      }

      const plan = this.billingService.getPlan(subscription.metadata.planId);
      if (!plan) {
        return null;
      }

      return {
        logsPerMonth: plan.limits.logsPerMonth,
        aiQueries: plan.limits.aiQueries,
        storageBytes: plan.limits.logsPerMonth * 1024, // Estimate 1KB per log
        teamMembers: plan.limits.teamMembers
      };
    } catch (error) {
      logger.error(`Failed to get usage limits for tenant ${tenantId}:`, error);
      return null;
    }
  }

  public async checkUsageLimits(tenantId: string, metric: string): Promise<void> {
    try {
      const usage = await this.getCurrentUsage(tenantId);
      const limits = await this.getUsageLimits(tenantId);

      if (!limits) {
        return; // No subscription or limits
      }

      let isOverLimit = false;
      let limitType = '';
      let currentValue = 0;
      let limitValue = 0;

      switch (metric) {
        case 'logs':
          if (limits.logsPerMonth > 0 && usage.logsCount > limits.logsPerMonth) {
            isOverLimit = true;
            limitType = 'logs';
            currentValue = usage.logsCount;
            limitValue = limits.logsPerMonth;
          }
          break;
        case 'ai_queries':
          if (limits.aiQueries > 0 && usage.aiQueries > limits.aiQueries) {
            isOverLimit = true;
            limitType = 'AI queries';
            currentValue = usage.aiQueries;
            limitValue = limits.aiQueries;
          }
          break;
        case 'storage':
          if (limits.storageBytes > 0 && usage.storageBytes > limits.storageBytes) {
            isOverLimit = true;
            limitType = 'storage';
            currentValue = usage.storageBytes;
            limitValue = limits.storageBytes;
          }
          break;
      }

      if (isOverLimit) {
        // Log the overage
        logger.warn(`Tenant ${tenantId} exceeded ${limitType} limit: ${currentValue}/${limitValue}`);
        
        // Store overage alert
        await this.storeOverageAlert(tenantId, limitType, currentValue, limitValue);
        
        // TODO: Send notification to tenant admin
        // TODO: Implement soft/hard limits based on plan
      }
    } catch (error) {
      logger.error(`Failed to check usage limits for tenant ${tenantId}:`, error);
    }
  }

  public async aggregateUsageForBilling(tenantId: string, period: string): Promise<void> {
    try {
      const usage = await this.getCurrentUsage(tenantId);
      const limits = await this.getUsageLimits(tenantId);

      if (!limits) {
        logger.warn(`No limits found for tenant ${tenantId}, skipping billing aggregation`);
        return;
      }

      // Calculate overages
      const overage = {
        logs: Math.max(0, usage.logsCount - (limits.logsPerMonth > 0 ? limits.logsPerMonth : 0)),
        aiQueries: Math.max(0, usage.aiQueries - (limits.aiQueries > 0 ? limits.aiQueries : 0)),
        storage: Math.max(0, usage.storageBytes - (limits.storageBytes > 0 ? limits.storageBytes : 0))
      };

      // Store aggregated usage in database
      await this.prisma.usageRecord.create({
        data: {
          tenantId,
          period,
          logsCount: usage.logsCount,
          aiQueries: usage.aiQueries,
          storageBytes: usage.storageBytes,
          overageLogs: overage.logs,
          overageAiQueries: overage.aiQueries,
          overageStorage: overage.storage,
          createdAt: new Date()
        }
      });

      // Process usage-based billing if there are overages
      if (overage.logs > 0 || overage.aiQueries > 0 || overage.storage > 0) {
        await this.billingService.processUsageBasedBilling(tenantId, period);
      }

      logger.info(`Aggregated usage for tenant ${tenantId} for period ${period}`);
    } catch (error) {
      logger.error(`Failed to aggregate usage for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private async storeOverageAlert(tenantId: string, limitType: string, currentValue: number, limitValue: number): Promise<void> {
    try {
      const alertKey = `alert:${tenantId}:${limitType}:${this.getCurrentPeriod()}`;
      const alertData = {
        tenantId,
        limitType,
        currentValue,
        limitValue,
        timestamp: new Date().toISOString()
      };

      await this.redis.set(alertKey, JSON.stringify(alertData), {
        EX: 60 * 60 * 24 * 30 // Keep for 30 days
      });
    } catch (error) {
      logger.error(`Failed to store overage alert for tenant ${tenantId}:`, error);
    }
  }

  public async getUsageHistory(tenantId: string, months: number = 12): Promise<UsageMetrics[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);

      const usageRecords = await this.prisma.usageRecord.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          period: 'desc'
        }
      });

      return usageRecords.map(record => ({
        tenantId: record.tenantId,
        period: record.period,
        logsCount: record.logsCount,
        aiQueries: record.aiQueries,
        storageBytes: record.storageBytes,
        apiRequests: 0, // Not stored in historical records yet
        activeUsers: 0 // Not stored in historical records yet
      }));
    } catch (error) {
      logger.error(`Failed to get usage history for tenant ${tenantId}:`, error);
      throw error;
    }
  }
}
