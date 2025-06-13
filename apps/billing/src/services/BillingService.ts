import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { BillingError } from '../utils/errors';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    logsPerMonth: number;
    retentionDays: number;
    aiQueries: number;
    teamMembers: number;
  };
}

export interface CreateSubscriptionRequest {
  tenantId: string;
  planId: string;
  paymentMethodId: string;
  billingEmail: string;
}

export interface UsageBillingData {
  tenantId: string;
  period: string;
  logsCount: number;
  aiQueries: number;
  storageBytes: number;
  overage: {
    logs: number;
    aiQueries: number;
    storage: number;
  };
}

export class BillingService {
  private static instance: BillingService;
  private stripe: Stripe;
  private prisma: PrismaClient;
  private plans: Map<string, SubscriptionPlan> = new Map();

  private constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true
    });

    this.prisma = new PrismaClient();
  }

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.initializePlans();
      logger.info('Billing service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize billing service:', error);
      throw error;
    }
  }

  private async initializePlans(): Promise<void> {
    const plans: SubscriptionPlan[] = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small projects and development',
        priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 100K logs per month',
          '30 days retention',
          'Basic AI insights',
          '5 team members',
          'Email support'
        ],
        limits: {
          logsPerMonth: 100000,
          retentionDays: 30,
          aiQueries: 1000,
          teamMembers: 5
        }
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'For growing teams and production workloads',
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
        price: 99,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 1M logs per month',
          '90 days retention',
          'Advanced AI insights',
          '25 team members',
          'Priority support',
          'Custom integrations'
        ],
        limits: {
          logsPerMonth: 1000000,
          retentionDays: 90,
          aiQueries: 10000,
          teamMembers: 25
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations with custom needs',
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
        price: 299,
        currency: 'usd',
        interval: 'month',
        features: [
          'Unlimited logs',
          '1 year retention',
          'Full AI capabilities',
          'Unlimited team members',
          '24/7 support',
          'Custom deployment',
          'SLA guarantee'
        ],
        limits: {
          logsPerMonth: -1, // Unlimited
          retentionDays: 365,
          aiQueries: -1, // Unlimited
          teamMembers: -1 // Unlimited
        }
      }
    ];

    plans.forEach(plan => {
      this.plans.set(plan.id, plan);
    });

    logger.info(`Initialized ${plans.length} subscription plans`);
  }

  public getPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  public getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.get(planId);
  }

  public async createCustomer(tenantId: string, email: string, name?: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          tenantId
        }
      });

      // Store customer in database
      await this.prisma.customer.upsert({
        where: { tenantId },
        update: {
          stripeCustomerId: customer.id,
          email,
          name
        },
        create: {
          tenantId,
          stripeCustomerId: customer.id,
          email,
          name
        }
      });

      logger.info(`Created Stripe customer for tenant ${tenantId}: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error(`Failed to create customer for tenant ${tenantId}:`, error);
      throw new BillingError('Failed to create customer', 'CUSTOMER_CREATION_FAILED');
    }
  }

  public async createSubscription(request: CreateSubscriptionRequest): Promise<Stripe.Subscription> {
    try {
      const { tenantId, planId, paymentMethodId, billingEmail } = request;
      const plan = this.getPlan(planId);

      if (!plan) {
        throw new BillingError(`Invalid plan ID: ${planId}`, 'INVALID_PLAN');
      }

      // Get or create customer
      let customer = await this.getCustomerByTenant(tenantId);
      if (!customer) {
        customer = await this.createCustomer(tenantId, billingEmail);
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      // Set as default payment method
      await this.stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: plan.priceId
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          tenantId,
          planId
        }
      });

      // Store subscription in database
      await this.prisma.subscription.upsert({
        where: { tenantId },
        update: {
          stripeSubscriptionId: subscription.id,
          planId,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        },
        create: {
          tenantId,
          stripeSubscriptionId: subscription.id,
          planId,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });

      logger.info(`Created subscription for tenant ${tenantId}: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error(`Failed to create subscription for tenant ${request.tenantId}:`, error);
      throw new BillingError('Failed to create subscription', 'SUBSCRIPTION_CREATION_FAILED');
    }
  }

  public async getCustomerByTenant(tenantId: string): Promise<Stripe.Customer | null> {
    try {
      const customerRecord = await this.prisma.customer.findUnique({
        where: { tenantId }
      });

      if (!customerRecord) {
        return null;
      }

      const customer = await this.stripe.customers.retrieve(customerRecord.stripeCustomerId);
      return customer as Stripe.Customer;
    } catch (error) {
      logger.error(`Failed to get customer for tenant ${tenantId}:`, error);
      return null;
    }
  }

  public async getSubscriptionByTenant(tenantId: string): Promise<Stripe.Subscription | null> {
    try {
      const subscriptionRecord = await this.prisma.subscription.findUnique({
        where: { tenantId }
      });

      if (!subscriptionRecord) {
        return null;
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionRecord.stripeSubscriptionId);
      return subscription;
    } catch (error) {
      logger.error(`Failed to get subscription for tenant ${tenantId}:`, error);
      return null;
    }
  }

  public async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(`Failed to handle webhook event ${event.id}:`, error);
      throw error;
    }
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) {
      logger.warn(`Subscription ${subscription.id} missing tenantId metadata`);
      return;
    }

    await this.prisma.subscription.upsert({
      where: { tenantId },
      update: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      },
      create: {
        tenantId,
        stripeSubscriptionId: subscription.id,
        planId: subscription.metadata.planId || 'unknown',
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });

    logger.info(`Updated subscription for tenant ${tenantId}: ${subscription.status}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const tenantId = subscription.metadata.tenantId;
    if (!tenantId) return;

    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: 'canceled',
        canceledAt: new Date()
      }
    });

    logger.info(`Subscription canceled for tenant ${tenantId}`);
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const customer = await this.stripe.customers.retrieve(customerId);
    
    if ('metadata' in customer && customer.metadata.tenantId) {
      logger.info(`Payment succeeded for tenant ${customer.metadata.tenantId}: $${(invoice.amount_paid / 100).toFixed(2)}`);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const customer = await this.stripe.customers.retrieve(customerId);
    
    if ('metadata' in customer && customer.metadata.tenantId) {
      logger.error(`Payment failed for tenant ${customer.metadata.tenantId}: $${(invoice.amount_due / 100).toFixed(2)}`);
    }
  }
}
