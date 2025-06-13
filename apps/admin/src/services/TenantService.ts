import { PrismaClient } from '@prisma/client';
import { KubernetesService } from './KubernetesService';
import { logger } from '../utils/logger';
import axios from 'axios';

export interface CreateTenantRequest {
  tenantId: string;
  planId: 'starter' | 'professional' | 'enterprise';
  billingEmail: string;
  organizationName: string;
  adminUser: {
    email: string;
    name: string;
    password: string;
  };
  features?: {
    aiEnabled?: boolean;
    customMetrics?: boolean;
    advancedSecurity?: boolean;
    realTimeAnalytics?: boolean;
  };
}

export interface TenantInfo {
  id: string;
  tenantId: string;
  planId: string;
  billingEmail: string;
  organizationName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  features: any;
  resources: any;
  kubernetesStatus?: {
    phase: string;
    message: string;
    namespaceCreated: boolean;
    resourcesProvisioned: boolean;
    servicesDeployed: boolean;
  };
}

export class TenantService {
  private static instance: TenantService;
  private prisma: PrismaClient;
  private k8sService: KubernetesService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.k8sService = KubernetesService.getInstance();
  }

  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Test database connection
      await this.prisma.$connect();
      logger.info('Tenant service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize tenant service:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  public async createTenant(request: CreateTenantRequest): Promise<TenantInfo> {
    try {
      logger.info(`Creating tenant: ${request.tenantId}`);

      // Validate tenant ID format
      if (!/^[a-z0-9-]+$/.test(request.tenantId)) {
        throw new Error('Tenant ID must contain only lowercase letters, numbers, and hyphens');
      }

      // Check if tenant already exists
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { tenantId: request.tenantId }
      });

      if (existingTenant) {
        throw new Error(`Tenant with ID ${request.tenantId} already exists`);
      }

      // Create tenant in database
      const tenant = await this.prisma.tenant.create({
        data: {
          tenantId: request.tenantId,
          planId: request.planId,
          billingEmail: request.billingEmail,
          organizationName: request.organizationName,
          status: 'creating',
          features: request.features || {},
          resources: this.getDefaultResources(request.planId)
        }
      });

      // Create admin user
      await this.createAdminUser(tenant.id, request.adminUser);

      // Create Kubernetes tenant resource
      await this.k8sService.createTenant({
        tenantId: request.tenantId,
        planId: request.planId,
        billingEmail: request.billingEmail,
        features: request.features
      });

      // Notify billing service
      await this.notifyBillingService('tenant_created', {
        tenantId: request.tenantId,
        planId: request.planId,
        billingEmail: request.billingEmail
      });

      logger.info(`Tenant created successfully: ${request.tenantId}`);

      return this.mapTenantToInfo(tenant);
    } catch (error) {
      logger.error(`Failed to create tenant ${request.tenantId}:`, error);
      throw error;
    }
  }

  public async getTenant(tenantId: string): Promise<TenantInfo | null> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { tenantId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true
            }
          }
        }
      });

      if (!tenant) {
        return null;
      }

      const tenantInfo = this.mapTenantToInfo(tenant);

      // Get Kubernetes status
      try {
        const k8sStatus = await this.k8sService.getTenantStatus(tenantId);
        tenantInfo.kubernetesStatus = k8sStatus;
      } catch (error) {
        logger.warn(`Failed to get Kubernetes status for tenant ${tenantId}:`, error);
      }

      return tenantInfo;
    } catch (error) {
      logger.error(`Failed to get tenant ${tenantId}:`, error);
      throw error;
    }
  }

  public async listTenants(page: number = 1, limit: number = 10): Promise<{
    tenants: TenantInfo[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const [tenants, total] = await Promise.all([
        this.prisma.tenant.findMany({
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.tenant.count()
      ]);

      return {
        tenants: tenants.map(tenant => this.mapTenantToInfo(tenant)),
        total,
        page,
        limit
      };
    } catch (error) {
      logger.error('Failed to list tenants:', error);
      throw error;
    }
  }

  public async updateTenant(tenantId: string, updates: Partial<{
    planId: string;
    billingEmail: string;
    organizationName: string;
    features: any;
  }>): Promise<TenantInfo> {
    try {
      logger.info(`Updating tenant: ${tenantId}`);

      const tenant = await this.prisma.tenant.update({
        where: { tenantId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      // Update Kubernetes tenant resource if plan changed
      if (updates.planId) {
        await this.k8sService.updateTenant(tenantId, {
          planId: updates.planId,
          features: updates.features
        });

        // Notify billing service of plan change
        await this.notifyBillingService('tenant_plan_changed', {
          tenantId,
          oldPlanId: tenant.planId,
          newPlanId: updates.planId
        });
      }

      logger.info(`Tenant updated successfully: ${tenantId}`);

      return this.mapTenantToInfo(tenant);
    } catch (error) {
      logger.error(`Failed to update tenant ${tenantId}:`, error);
      throw error;
    }
  }

  public async deleteTenant(tenantId: string): Promise<void> {
    try {
      logger.info(`Deleting tenant: ${tenantId}`);

      // Update status to deleting
      await this.prisma.tenant.update({
        where: { tenantId },
        data: { status: 'deleting' }
      });

      // Delete Kubernetes tenant resource
      await this.k8sService.deleteTenant(tenantId);

      // Notify billing service
      await this.notifyBillingService('tenant_deleted', { tenantId });

      // Delete from database (this will cascade to users)
      await this.prisma.tenant.delete({
        where: { tenantId }
      });

      logger.info(`Tenant deleted successfully: ${tenantId}`);
    } catch (error) {
      logger.error(`Failed to delete tenant ${tenantId}:`, error);
      throw error;
    }
  }

  public async getTenantMetrics(tenantId: string): Promise<any> {
    try {
      // Get usage metrics from billing service
      const response = await axios.get(
        `${process.env.BILLING_SERVICE_URL}/api/usage/current`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
            'X-Tenant-ID': tenantId
          }
        }
      );

      return response.data.usage;
    } catch (error) {
      logger.error(`Failed to get tenant metrics for ${tenantId}:`, error);
      throw error;
    }
  }

  private async createAdminUser(tenantId: string, adminUser: any): Promise<void> {
    // This would integrate with the auth service to create the admin user
    // For now, just store basic info
    await this.prisma.user.create({
      data: {
        tenantId,
        email: adminUser.email,
        name: adminUser.name,
        role: 'admin',
        status: 'active'
      }
    });
  }

  private getDefaultResources(planId: string): any {
    const resourceMap = {
      starter: {
        cpu: { requests: '2', limits: '4' },
        memory: { requests: '4Gi', limits: '8Gi' },
        storage: { requests: '10Gi' },
        pods: 10,
        services: 5
      },
      professional: {
        cpu: { requests: '8', limits: '16' },
        memory: { requests: '16Gi', limits: '32Gi' },
        storage: { requests: '100Gi' },
        pods: 50,
        services: 15
      },
      enterprise: {
        cpu: { requests: '32', limits: '64' },
        memory: { requests: '64Gi', limits: '128Gi' },
        storage: { requests: '1Ti' },
        pods: 100,
        services: 20
      }
    };

    return resourceMap[planId] || resourceMap.starter;
  }

  private async notifyBillingService(event: string, data: any): Promise<void> {
    try {
      await axios.post(
        `${process.env.BILLING_SERVICE_URL}/api/webhooks/internal`,
        { event, data },
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      logger.warn(`Failed to notify billing service of ${event}:`, error);
      // Don't throw - billing notification failure shouldn't block tenant operations
    }
  }

  private mapTenantToInfo(tenant: any): TenantInfo {
    return {
      id: tenant.id,
      tenantId: tenant.tenantId,
      planId: tenant.planId,
      billingEmail: tenant.billingEmail,
      organizationName: tenant.organizationName,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      features: tenant.features,
      resources: tenant.resources
    };
  }
}
