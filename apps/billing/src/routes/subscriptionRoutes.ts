import { Router } from 'express';
import { body, param } from 'express-validator';
import { BillingController } from '../controllers/BillingController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const billingController = new BillingController();

// Get current subscription
router.get('/', billingController.getCurrentSubscription);

// Create subscription
router.post('/',
  [
    body('planId').isString().notEmpty().withMessage('Plan ID is required'),
    body('paymentMethodId').isString().notEmpty().withMessage('Payment method ID is required'),
    body('billingEmail').isEmail().withMessage('Valid billing email is required')
  ],
  validateRequest,
  billingController.createSubscription
);

// Update subscription
router.put('/',
  [
    body('planId').optional().isString().notEmpty().withMessage('Plan ID must be a non-empty string')
  ],
  validateRequest,
  billingController.updateSubscription
);

// Cancel subscription
router.delete('/',
  [
    body('immediately').optional().isBoolean().withMessage('Immediately must be a boolean')
  ],
  validateRequest,
  billingController.cancelSubscription
);

export default router;
