import { Response } from 'express';
import { BillingService } from '../services/BillingService';
import { StripeWebhookRequest } from '../middleware/stripeWebhookMiddleware';
import { logger } from '../utils/logger';

export class WebhookController {
  private billingService: BillingService;

  constructor() {
    this.billingService = BillingService.getInstance();
  }

  public handleStripeWebhook = async (req: StripeWebhookRequest, res: Response) => {
    try {
      const event = req.stripeEvent!;
      
      logger.info(`Processing Stripe webhook: ${event.type}`);
      
      await this.billingService.handleWebhook(event);
      
      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      logger.error('Failed to process Stripe webhook:', error);
      res.status(500).json({
        error: 'Failed to process webhook',
        code: 'WEBHOOK_PROCESSING_FAILED'
      });
    }
  };
}
