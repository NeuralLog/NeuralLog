import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface StripeWebhookRequest extends Request {
  stripeEvent?: Stripe.Event;
}

export const stripeWebhookMiddleware = (req: StripeWebhookRequest, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET environment variable not set');
    return res.status(500).json({
      error: 'Webhook configuration error',
      code: 'MISSING_WEBHOOK_SECRET'
    });
  }

  let event: Stripe.Event;

  try {
    // Get raw body for signature verification
    const rawBody = req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).json({
      error: 'Webhook signature verification failed',
      code: 'INVALID_SIGNATURE'
    });
  }

  // Attach the verified event to the request
  req.stripeEvent = event;
  
  logger.info(`Received Stripe webhook: ${event.type} (${event.id})`);
  next();
};
