import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { BillingController } from '../controllers/BillingController';
import { adminMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const billingController = new BillingController();

// Get subscription plans
router.get('/plans', billingController.getPlans);

// Get current subscription for tenant
router.get('/subscription', billingController.getCurrentSubscription);

// Create subscription
router.post('/subscription',
  [
    body('planId').isString().notEmpty().withMessage('Plan ID is required'),
    body('paymentMethodId').isString().notEmpty().withMessage('Payment method ID is required'),
    body('billingEmail').isEmail().withMessage('Valid billing email is required')
  ],
  validateRequest,
  billingController.createSubscription
);

// Update subscription
router.put('/subscription',
  [
    body('planId').optional().isString().notEmpty().withMessage('Plan ID must be a non-empty string')
  ],
  validateRequest,
  billingController.updateSubscription
);

// Cancel subscription
router.delete('/subscription',
  [
    body('immediately').optional().isBoolean().withMessage('Immediately must be a boolean')
  ],
  validateRequest,
  billingController.cancelSubscription
);

// Get billing history
router.get('/history',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
  ],
  validateRequest,
  billingController.getBillingHistory
);

// Get current invoice
router.get('/invoice/current', billingController.getCurrentInvoice);

// Get invoice by ID
router.get('/invoice/:invoiceId',
  [
    param('invoiceId').isString().notEmpty().withMessage('Invoice ID is required')
  ],
  validateRequest,
  billingController.getInvoice
);

// Download invoice PDF
router.get('/invoice/:invoiceId/pdf',
  [
    param('invoiceId').isString().notEmpty().withMessage('Invoice ID is required')
  ],
  validateRequest,
  billingController.downloadInvoicePDF
);

// Get payment methods
router.get('/payment-methods', billingController.getPaymentMethods);

// Add payment method
router.post('/payment-methods',
  [
    body('paymentMethodId').isString().notEmpty().withMessage('Payment method ID is required')
  ],
  validateRequest,
  billingController.addPaymentMethod
);

// Set default payment method
router.put('/payment-methods/:paymentMethodId/default',
  [
    param('paymentMethodId').isString().notEmpty().withMessage('Payment method ID is required')
  ],
  validateRequest,
  billingController.setDefaultPaymentMethod
);

// Remove payment method
router.delete('/payment-methods/:paymentMethodId',
  [
    param('paymentMethodId').isString().notEmpty().withMessage('Payment method ID is required')
  ],
  validateRequest,
  billingController.removePaymentMethod
);

// Admin routes
router.use(adminMiddleware);

// Get all customers (admin only)
router.get('/admin/customers',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
  ],
  validateRequest,
  billingController.getAllCustomers
);

// Get customer by tenant ID (admin only)
router.get('/admin/customers/:tenantId',
  [
    param('tenantId').isString().notEmpty().withMessage('Tenant ID is required')
  ],
  validateRequest,
  billingController.getCustomerByTenant
);

// Update customer (admin only)
router.put('/admin/customers/:tenantId',
  [
    param('tenantId').isString().notEmpty().withMessage('Tenant ID is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('name').optional().isString().withMessage('Name must be a string')
  ],
  validateRequest,
  billingController.updateCustomer
);

// Get subscription analytics (admin only)
router.get('/admin/analytics',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO 8601 date')
  ],
  validateRequest,
  billingController.getSubscriptionAnalytics
);

export default router;
