import { Router } from 'express';
import { query, body } from 'express-validator';
import { UsageController } from '../controllers/UsageController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const usageController = new UsageController();

// Get current usage for tenant
router.get('/current', usageController.getCurrentUsage);

// Get usage history
router.get('/history',
  [
    query('months').optional().isInt({ min: 1, max: 24 }).withMessage('Months must be between 1 and 24')
  ],
  validateRequest,
  usageController.getUsageHistory
);

// Get usage limits for current plan
router.get('/limits', usageController.getUsageLimits);

// Track log entry (internal API)
router.post('/track/logs',
  [
    body('size').optional().isInt({ min: 1 }).withMessage('Size must be a positive integer')
  ],
  validateRequest,
  usageController.trackLogEntry
);

// Track AI query (internal API)
router.post('/track/ai-query',
  [
    body('queryType').optional().isString().withMessage('Query type must be a string')
  ],
  validateRequest,
  usageController.trackAIQuery
);

// Track storage usage (internal API)
router.post('/track/storage',
  [
    body('bytes').isInt({ min: 0 }).withMessage('Bytes must be a non-negative integer')
  ],
  validateRequest,
  usageController.trackStorageUsage
);

// Track API request (internal API)
router.post('/track/api-request',
  [
    body('endpoint').isString().notEmpty().withMessage('Endpoint is required')
  ],
  validateRequest,
  usageController.trackAPIRequest
);

// Track active user (internal API)
router.post('/track/active-user',
  [
    body('userId').isString().notEmpty().withMessage('User ID is required')
  ],
  validateRequest,
  usageController.trackActiveUser
);

// Get usage analytics
router.get('/analytics',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO 8601 date'),
    query('granularity').optional().isIn(['day', 'week', 'month']).withMessage('Granularity must be day, week, or month')
  ],
  validateRequest,
  usageController.getUsageAnalytics
);

export default router;
