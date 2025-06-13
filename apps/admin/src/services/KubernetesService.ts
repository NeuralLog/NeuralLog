import * as k8s from '@kubernetes/client-node';
import { logger } from '../utils/logger';

export interface CreateTenantK8sRequest {
  tenantId: string;
  planId: string;
  billingEmail: string;
  features?: any;
}

export interface TenantK8sStatus {
  phase: string;
  message: string;
  namespaceCreated: boolean;
  resourcesProvisioned: boolean;
  servicesDeployed: boolean;
}

export class KubernetesService {
  private static instance: KubernetesService;
  private kc: k8s.KubeConfig;
  private k8sApi: k8s.CoreV1Api;
  private customObjectsApi: k8s.CustomObjectsApi;

  private constructor() {
    this.kc = new k8s.KubeConfig();
    
    // Load kubeconfig
    if (process.env.NODE_ENV === 'production') {
      this.kc.loadFromCluster();
    } else {
      this.kc.loadFromDefault();
    }

    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.customObjectsApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
  }

  public static getInstance(): KubernetesService {
    if (!KubernetesService.instance) {
      KubernetesService.instance = new KubernetesService();
    }
    return KubernetesService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Test connection by listing namespaces
      await this.k8sApi.listNamespace();
      logger.info('Kubernetes service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Kubernetes service:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<void> {
    await this.k8sApi.listNamespace();
  }

  public async createTenant(request: CreateTenantK8sRequest): Promise<void> {
    try {
      logger.info(`Creating Kubernetes tenant resource: ${request.tenantId}`);

      const tenantResource = {
        apiVersion: 'neurallog.io/v1',
        kind: 'Tenant',
        metadata: {
          name: request.tenantId,
          labels: {
            'neurallog.io/tenant-id': request.tenantId,
            'neurallog.io/plan': request.planId
          }
        },
        spec: {
          tenantId: request.tenantId,
          planId: request.planId,
          billingEmail: request.billingEmail,
          resources: this.getResourcesForPlan(request.planId),
          features: request.features || {},
          services: this.getServicesForPlan(request.planId)
        }
      };

      await this.customObjectsApi.createClusterCustomObject(
        'neurallog.io',
        'v1',
        'tenants',
        tenantResource
      );

      logger.info(`Kubernetes tenant resource created: ${request.tenantId}`);
    } catch (error) {
      logger.error(`Failed to create Kubernetes tenant resource ${request.tenantId}:`, error);
      throw error;
    }
  }

  public async getTenantStatus(tenantId: string): Promise<TenantK8sStatus> {
    try {
      const response = await this.customObjectsApi.getClusterCustomObject(
        'neurallog.io',
        'v1',
        'tenants',
        tenantId
      );

      const tenant = response.body as any;
      const status = tenant.status || {};

      return {
        phase: status.phase || 'Unknown',
        message: status.message || '',
        namespaceCreated: status.namespaceCreated || false,
        resourcesProvisioned: status.resourcesProvisioned || false,
        servicesDeployed: status.servicesDeployed || false
      };
    } catch (error) {
      if (error.response?.statusCode === 404) {
        return {
          phase: 'NotFound',
          message: 'Tenant resource not found',
          namespaceCreated: false,
          resourcesProvisioned: false,
          servicesDeployed: false
        };
      }
      logger.error(`Failed to get tenant status ${tenantId}:`, error);
      throw error;
    }
  }

  public async updateTenant(tenantId: string, updates: {
    planId?: string;
    features?: any;
  }): Promise<void> {
    try {
      logger.info(`Updating Kubernetes tenant resource: ${tenantId}`);

      // Get current tenant resource
      const response = await this.customObjectsApi.getClusterCustomObject(
        'neurallog.io',
        'v1',
        'tenants',
        tenantId
      );

      const tenant = response.body as any;

      // Update spec
      if (updates.planId) {
        tenant.spec.planId = updates.planId;
        tenant.spec.resources = this.getResourcesForPlan(updates.planId);
        tenant.spec.services = this.getServicesForPlan(updates.planId);
      }

      if (updates.features) {
        tenant.spec.features = { ...tenant.spec.features, ...updates.features };
      }

      // Update the resource
      await this.customObjectsApi.replaceClusterCustomObject(
        'neurallog.io',
        'v1',
        'tenants',
        tenantId,
        tenant
      );

      logger.info(`Kubernetes tenant resource updated: ${tenantId}`);
    } catch (error) {
      logger.error(`Failed to update Kubernetes tenant resource ${tenantId}:`, error);
      throw error;
    }
  }

  public async deleteTenant(tenantId: string): Promise<void> {
    try {
      logger.info(`Deleting Kubernetes tenant resource: ${tenantId}`);

      await this.customObjectsApi.deleteClusterCustomObject(
        'neurallog.io',
        'v1',
        'tenants',
        tenantId
      );

      logger.info(`Kubernetes tenant resource deleted: ${tenantId}`);
    } catch (error) {
      if (error.response?.statusCode === 404) {
        logger.warn(`Kubernetes tenant resource not found: ${tenantId}`);
        return;
      }
      logger.error(`Failed to delete Kubernetes tenant resource ${tenantId}:`, error);
      throw error;
    }
  }

  public async listTenants(): Promise<any[]> {
    try {
      const response = await this.customObjectsApi.listClusterCustomObject(
        'neurallog.io',
        'v1',
        'tenants'
      );

      const tenantList = response.body as any;
      return tenantList.items || [];
    } catch (error) {
      logger.error('Failed to list Kubernetes tenant resources:', error);
      throw error;
    }
  }

  public async getTenantNamespaceStatus(tenantId: string): Promise<{
    exists: boolean;
    phase?: string;
    resourceQuota?: any;
    limitRange?: any;
  }> {
    try {
      const namespaceName = `tenant-${tenantId}`;

      // Check if namespace exists
      try {
        const nsResponse = await this.k8sApi.readNamespace(namespaceName);
        const namespace = nsResponse.body;

        // Get resource quota
        let resourceQuota = null;
        try {
          const quotaResponse = await this.k8sApi.readNamespacedResourceQuota(
            `tenant-${tenantId}-quota`,
            namespaceName
          );
          resourceQuota = quotaResponse.body;
        } catch (error) {
          // Resource quota might not exist yet
        }

        // Get limit range
        let limitRange = null;
        try {
          const limitResponse = await this.k8sApi.readNamespacedLimitRange(
            `tenant-${tenantId}-limits`,
            namespaceName
          );
          limitRange = limitResponse.body;
        } catch (error) {
          // Limit range might not exist yet
        }

        return {
          exists: true,
          phase: namespace.status?.phase,
          resourceQuota,
          limitRange
        };
      } catch (error) {
        if (error.response?.statusCode === 404) {
          return { exists: false };
        }
        throw error;
      }
    } catch (error) {
      logger.error(`Failed to get namespace status for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  public async getClusterResources(): Promise<{
    nodes: any[];
    totalCPU: string;
    totalMemory: string;
    usedCPU: string;
    usedMemory: string;
  }> {
    try {
      // Get nodes
      const nodesResponse = await this.k8sApi.listNode();
      const nodes = nodesResponse.body.items;

      // Calculate total resources
      let totalCPU = 0;
      let totalMemory = 0;

      nodes.forEach(node => {
        if (node.status?.capacity) {
          totalCPU += this.parseResource(node.status.capacity.cpu || '0');
          totalMemory += this.parseResource(node.status.capacity.memory || '0');
        }
      });

      // Get resource usage (this would typically come from metrics server)
      // For now, return placeholder values
      const usedCPU = Math.floor(totalCPU * 0.3); // 30% usage
      const usedMemory = Math.floor(totalMemory * 0.4); // 40% usage

      return {
        nodes: nodes.map(node => ({
          name: node.metadata?.name,
          status: node.status?.conditions?.find(c => c.type === 'Ready')?.status,
          capacity: node.status?.capacity,
          allocatable: node.status?.allocatable
        })),
        totalCPU: `${totalCPU}`,
        totalMemory: `${totalMemory}`,
        usedCPU: `${usedCPU}`,
        usedMemory: `${usedMemory}`
      };
    } catch (error) {
      logger.error('Failed to get cluster resources:', error);
      throw error;
    }
  }

  private getResourcesForPlan(planId: string): any {
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

  private getServicesForPlan(planId: string): any {
    const baseServices = {
      logServer: { enabled: true, replicas: 1 },
      authService: { enabled: true, replicas: 1 }
    };

    if (planId === 'professional' || planId === 'enterprise') {
      baseServices['analyticsService'] = { enabled: true, replicas: 1 };
    }

    if (planId === 'enterprise') {
      baseServices['aiService'] = { enabled: true, replicas: 2 };
    }

    return baseServices;
  }

  private parseResource(resource: string): number {
    // Simple resource parsing - in production, use a proper library
    const value = parseFloat(resource.replace(/[^0-9.]/g, ''));
    if (resource.includes('m')) {
      return value / 1000; // millicores to cores
    }
    if (resource.includes('Ki')) {
      return value * 1024;
    }
    if (resource.includes('Mi')) {
      return value * 1024 * 1024;
    }
    if (resource.includes('Gi')) {
      return value * 1024 * 1024 * 1024;
    }
    return value;
  }
}
