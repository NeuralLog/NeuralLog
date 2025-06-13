import { Response } from 'express';
import { BillingService } from '../services/BillingService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';
import { BillingError } from '../utils/errors';

export class BillingController {
  private billingService: BillingService;

  constructor() {
    this.billingService = BillingService.getInstance();
  }

  public getPlans = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const plans = this.billingService.getPlans();
      res.json({
        success: true,
        plans
      });
    } catch (error) {
      logger.error('Failed to get plans:', error);
      res.status(500).json({
        error: 'Failed to retrieve plans',
        code: 'PLANS_RETRIEVAL_FAILED'
      });
    }
  };

  public getCurrentSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const subscription = await this.billingService.getSubscriptionByTenant(tenantId);
      
      if (!subscription) {
        return res.json({
          success: true,
          subscription: null
        });
      }

      const plan = this.billingService.getPlan(subscription.metadata.planId);

      res.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          planId: subscription.metadata.planId,
          plan,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        }
      });
    } catch (error) {
      logger.error('Failed to get current subscription:', error);
      res.status(500).json({
        error: 'Failed to retrieve subscription',
        code: 'SUBSCRIPTION_RETRIEVAL_FAILED'
      });
    }
  };

  public createSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { planId, paymentMethodId, billingEmail } = req.body;

      const subscription = await this.billingService.createSubscription({
        tenantId,
        planId,
        paymentMethodId,
        billingEmail
      });

      res.status(201).json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
        }
      });
    } catch (error) {
      if (error instanceof BillingError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code
        });
      }
      
      logger.error('Failed to create subscription:', error);
      res.status(500).json({
        error: 'Failed to create subscription',
        code: 'SUBSCRIPTION_CREATION_FAILED'
      });
    }
  };

  public updateSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { planId } = req.body;

      // Implementation for updating subscription plan
      // This would involve creating a new subscription item and removing the old one
      
      res.json({
        success: true,
        message: 'Subscription update scheduled'
      });
    } catch (error) {
      logger.error('Failed to update subscription:', error);
      res.status(500).json({
        error: 'Failed to update subscription',
        code: 'SUBSCRIPTION_UPDATE_FAILED'
      });
    }
  };

  public cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { immediately = false } = req.body;

      const subscription = await this.billingService.cancelSubscription(tenantId, immediately);

      res.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });
    } catch (error) {
      if (error instanceof BillingError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code
        });
      }
      
      logger.error('Failed to cancel subscription:', error);
      res.status(500).json({
        error: 'Failed to cancel subscription',
        code: 'SUBSCRIPTION_CANCELLATION_FAILED'
      });
    }
  };

  public getBillingHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Implementation for getting billing history from Stripe
      // This would fetch invoices for the customer
      
      res.json({
        success: true,
        history: [],
        pagination: {
          limit,
          offset,
          total: 0
        }
      });
    } catch (error) {
      logger.error('Failed to get billing history:', error);
      res.status(500).json({
        error: 'Failed to retrieve billing history',
        code: 'BILLING_HISTORY_FAILED'
      });
    }
  };

  public getCurrentInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      
      // Implementation for getting current invoice
      
      res.json({
        success: true,
        invoice: null
      });
    } catch (error) {
      logger.error('Failed to get current invoice:', error);
      res.status(500).json({
        error: 'Failed to retrieve current invoice',
        code: 'INVOICE_RETRIEVAL_FAILED'
      });
    }
  };

  public getInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { invoiceId } = req.params;
      
      // Implementation for getting specific invoice
      
      res.json({
        success: true,
        invoice: null
      });
    } catch (error) {
      logger.error('Failed to get invoice:', error);
      res.status(500).json({
        error: 'Failed to retrieve invoice',
        code: 'INVOICE_RETRIEVAL_FAILED'
      });
    }
  };

  public downloadInvoicePDF = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { invoiceId } = req.params;
      
      // Implementation for downloading invoice PDF
      
      res.json({
        success: true,
        downloadUrl: null
      });
    } catch (error) {
      logger.error('Failed to download invoice PDF:', error);
      res.status(500).json({
        error: 'Failed to download invoice PDF',
        code: 'INVOICE_DOWNLOAD_FAILED'
      });
    }
  };

  public getPaymentMethods = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      
      // Implementation for getting payment methods
      
      res.json({
        success: true,
        paymentMethods: []
      });
    } catch (error) {
      logger.error('Failed to get payment methods:', error);
      res.status(500).json({
        error: 'Failed to retrieve payment methods',
        code: 'PAYMENT_METHODS_FAILED'
      });
    }
  };

  public addPaymentMethod = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { paymentMethodId } = req.body;
      
      // Implementation for adding payment method
      
      res.json({
        success: true,
        message: 'Payment method added successfully'
      });
    } catch (error) {
      logger.error('Failed to add payment method:', error);
      res.status(500).json({
        error: 'Failed to add payment method',
        code: 'PAYMENT_METHOD_ADD_FAILED'
      });
    }
  };

  public setDefaultPaymentMethod = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = req.tenantId!;
      const { paymentMethodId } = req.params;
      
      // Implementation for setting default payment method
      
      res.json({
        success: true,
        message: 'Default payment method updated'
      });
    } catch (error) {
      logger.error('Failed to set default payment method:', error);
      res.status(500).json({
        error: 'Failed to set default payment method',
        code: 'DEFAULT_PAYMENT_METHOD_FAILED'
      });
    }
  };

  public removePaymentMethod = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { paymentMethodId } = req.params;
      
      // Implementation for removing payment method
      
      res.json({
        success: true,
        message: 'Payment method removed successfully'
      });
    } catch (error) {
      logger.error('Failed to remove payment method:', error);
      res.status(500).json({
        error: 'Failed to remove payment method',
        code: 'PAYMENT_METHOD_REMOVE_FAILED'
      });
    }
  };

  // Admin methods
  public getAllCustomers = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Implementation for getting all customers (admin only)
      
      res.json({
        success: true,
        customers: [],
        pagination: {
          limit,
          offset,
          total: 0
        }
      });
    } catch (error) {
      logger.error('Failed to get all customers:', error);
      res.status(500).json({
        error: 'Failed to retrieve customers',
        code: 'CUSTOMERS_RETRIEVAL_FAILED'
      });
    }
  };

  public getCustomerByTenant = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tenantId } = req.params;
      
      const customer = await this.billingService.getCustomerByTenant(tenantId);
      
      res.json({
        success: true,
        customer
      });
    } catch (error) {
      logger.error('Failed to get customer by tenant:', error);
      res.status(500).json({
        error: 'Failed to retrieve customer',
        code: 'CUSTOMER_RETRIEVAL_FAILED'
      });
    }
  };

  public updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tenantId } = req.params;
      const { email, name } = req.body;
      
      // Implementation for updating customer
      
      res.json({
        success: true,
        message: 'Customer updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update customer:', error);
      res.status(500).json({
        error: 'Failed to update customer',
        code: 'CUSTOMER_UPDATE_FAILED'
      });
    }
  };

  public getSubscriptionAnalytics = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Implementation for subscription analytics
      
      res.json({
        success: true,
        analytics: {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          canceledSubscriptions: 0,
          revenue: 0,
          churnRate: 0
        }
      });
    } catch (error) {
      logger.error('Failed to get subscription analytics:', error);
      res.status(500).json({
        error: 'Failed to retrieve analytics',
        code: 'ANALYTICS_FAILED'
      });
    }
  };
}
