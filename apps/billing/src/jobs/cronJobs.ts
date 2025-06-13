import cron from 'node-cron';
import { logger } from '../utils/logger';
import { UsageTracker } from '../services/UsageTracker';
import { BillingService } from '../services/BillingService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const usageTracker = UsageTracker.getInstance();
const billingService = BillingService.getInstance();

export function startCronJobs() {
  // Daily usage aggregation at 1 AM UTC
  cron.schedule('0 1 * * *', async () => {
    logger.info('Starting daily usage aggregation job');
    await aggregateDailyUsage();
  });

  // Monthly billing processing on the 1st of each month at 2 AM UTC
  cron.schedule('0 2 1 * *', async () => {
    logger.info('Starting monthly billing processing job');
    await processMonthlyBilling();
  });

  // Weekly cleanup of old usage data (keep 3 months) - Sundays at 3 AM UTC
  cron.schedule('0 3 * * 0', async () => {
    logger.info('Starting weekly cleanup job');
    await cleanupOldData();
  });

  // Hourly subscription status sync with Stripe
  cron.schedule('0 * * * *', async () => {
    logger.info('Starting subscription status sync job');
    await syncSubscriptionStatuses();
  });

  logger.info('Cron jobs scheduled successfully');
}

async function aggregateDailyUsage() {
  try {
    // Get all active tenants
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['active', 'trialing', 'past_due']
        }
      },
      select: {
        tenantId: true
      }
    });

    const currentPeriod = getCurrentPeriod();
    
    for (const subscription of subscriptions) {
      try {
        await usageTracker.aggregateUsageForBilling(subscription.tenantId, currentPeriod);
        logger.info(`Aggregated usage for tenant ${subscription.tenantId}`);
      } catch (error) {
        logger.error(`Failed to aggregate usage for tenant ${subscription.tenantId}:`, error);
      }
    }

    logger.info(`Completed daily usage aggregation for ${subscriptions.length} tenants`);
  } catch (error) {
    logger.error('Failed to run daily usage aggregation:', error);
  }
}

async function processMonthlyBilling() {
  try {
    const lastMonth = getLastMonthPeriod();
    
    // Get all usage records for last month that haven't been billed
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        period: lastMonth
      }
    });

    for (const record of usageRecords) {
      try {
        // Check if there are overages to bill
        if (record.overageLogs > 0 || record.overageAiQueries > 0 || record.overageStorage > 0) {
          await billingService.processUsageBasedBilling(record.tenantId, record.period);
          logger.info(`Processed overage billing for tenant ${record.tenantId} for period ${record.period}`);
        }
      } catch (error) {
        logger.error(`Failed to process billing for tenant ${record.tenantId}:`, error);
      }
    }

    logger.info(`Completed monthly billing processing for ${usageRecords.length} usage records`);
  } catch (error) {
    logger.error('Failed to run monthly billing processing:', error);
  }
}

async function cleanupOldData() {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Clean up old usage records (keep 3 months)
    const deletedUsageRecords = await prisma.usageRecord.deleteMany({
      where: {
        createdAt: {
          lt: threeMonthsAgo
        }
      }
    });

    // Clean up old billing events (keep 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const deletedBillingEvents = await prisma.billingEvent.deleteMany({
      where: {
        createdAt: {
          lt: sixMonthsAgo
        },
        processed: true
      }
    });

    logger.info(`Cleanup completed: ${deletedUsageRecords.count} usage records, ${deletedBillingEvents.count} billing events deleted`);
  } catch (error) {
    logger.error('Failed to run cleanup job:', error);
  }
}

async function syncSubscriptionStatuses() {
  try {
    // Get all subscriptions that might need status updates
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: {
          in: ['active', 'trialing', 'past_due', 'unpaid']
        }
      }
    });

    let syncedCount = 0;

    for (const subscription of subscriptions) {
      try {
        const stripeSubscription = await billingService.getSubscriptionByTenant(subscription.tenantId);
        
        if (stripeSubscription && stripeSubscription.status !== subscription.status) {
          await prisma.subscription.update({
            where: {
              tenantId: subscription.tenantId
            },
            data: {
              status: stripeSubscription.status,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
            }
          });

          syncedCount++;
          logger.info(`Synced subscription status for tenant ${subscription.tenantId}: ${subscription.status} -> ${stripeSubscription.status}`);
        }
      } catch (error) {
        logger.error(`Failed to sync subscription for tenant ${subscription.tenantId}:`, error);
      }
    }

    if (syncedCount > 0) {
      logger.info(`Synced ${syncedCount} subscription statuses`);
    }
  } catch (error) {
    logger.error('Failed to run subscription status sync:', error);
  }
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getLastMonthPeriod(): string {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
}
