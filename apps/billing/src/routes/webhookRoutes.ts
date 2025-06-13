import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController';

const router = Router();
const webhookController = new WebhookController();

// Stripe webhook endpoint
router.post('/stripe', webhookController.handleStripeWebhook);

export default router;
