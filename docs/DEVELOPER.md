# 💻 NeuralLog Developer Guide

Comprehensive guide for developers contributing to the NeuralLog platform, including setup, architecture, coding standards, and contribution workflows.

## 📋 Table of Contents

- [🚀 Development Setup](#-development-setup)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 Development Workflow](#-development-workflow)
- [📝 Coding Standards](#-coding-standards)
- [🧪 Testing Guidelines](#-testing-guidelines)
- [📦 Build & Deployment](#-build--deployment)
- [🤝 Contributing](#-contributing)
- [📚 Resources](#-resources)

---

## 🚀 Development Setup

### 📋 Prerequisites

#### Required Tools
```bash
# Core development tools
Node.js >= 18.0.0
Go >= 1.21.0
Docker >= 20.0.0
kubectl >= 1.28.0
kind >= 0.20.0

# Development utilities
git >= 2.30.0
make >= 4.0
curl >= 7.0
jq >= 1.6
```

#### Installation Script
```bash
#!/bin/bash
# scripts/install-dev-tools.sh

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Go
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### 🔧 Local Environment Setup

#### Clone Repository
```bash
# Clone the main repository
git clone https://github.com/NeuralLog/NeuralLog.git
cd NeuralLog

# Install dependencies
npm install
go mod download

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

#### Environment Configuration
```bash
# .env.local
NODE_ENV=development
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://neurallog:password@localhost:5432/neurallog_dev
REDIS_URL=redis://localhost:6379

# External Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Kubernetes
KUBECONFIG=~/.kube/config
OPERATOR_NAMESPACE=neurallog-operator-system

# Development
DEV_MODE=true
HOT_RELOAD=true
```

#### Local Infrastructure
```bash
# Start local development cluster
./scripts/setup-local-cluster.sh

# Deploy development services
./scripts/deploy-dev-services.sh

# Verify setup
./scripts/verify-dev-setup.sh
```

---

## 🏗️ Project Structure

### 📁 Repository Layout

```
NeuralLog/
├── apps/                          # Application services
│   ├── admin/                     # Admin service
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── billing/                   # Billing service
│   ├── auth/                      # Authentication service
│   └── log-server/               # Log ingestion service
├── infra/                         # Infrastructure code
│   ├── k8s/                      # Kubernetes manifests
│   ├── operators/                # Custom operators
│   ├── monitoring/               # Monitoring stack
│   └── terraform/                # Infrastructure as code
├── libs/                          # Shared libraries
│   ├── common/                   # Common utilities
│   ├── sdk/                      # Client SDKs
│   └── types/                    # TypeScript definitions
├── docs/                          # Documentation
├── scripts/                       # Development scripts
├── tests/                         # Integration tests
├── examples/                      # Usage examples
└── tools/                         # Development tools
```

### 🔧 Service Architecture

#### Microservices Design
```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Web Dashboard]
        B[Admin Portal]
    end
    
    subgraph "API Layer"
        C[API Gateway]
        D[Auth Service]
    end
    
    subgraph "Business Logic"
        E[Billing Service]
        F[Admin Service]
        G[Log Server]
        H[Analytics Service]
    end
    
    subgraph "Data Layer"
        I[PostgreSQL]
        J[Redis]
        K[ClickHouse]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    
    E --> I
    F --> I
    G --> J
    H --> K
```

#### Service Responsibilities
- **Admin Service**: Tenant management, system configuration
- **Billing Service**: Subscription management, usage tracking
- **Auth Service**: Authentication, authorization, JWT management
- **Log Server**: Log ingestion, validation, initial processing
- **Analytics Service**: AI-powered analysis, anomaly detection

---

## 🔧 Development Workflow

### 🌿 Git Workflow

#### Branch Strategy
```bash
# Main branches
main          # Production-ready code
develop       # Integration branch
staging       # Staging environment

# Feature branches
feature/      # New features
bugfix/       # Bug fixes
hotfix/       # Critical production fixes
release/      # Release preparation
```

#### Commit Convention
```bash
# Commit message format
<type>(<scope>): <description>

# Types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation
style:    # Code style changes
refactor: # Code refactoring
test:     # Adding tests
chore:    # Maintenance tasks

# Examples
feat(billing): add usage-based pricing
fix(auth): resolve JWT token expiration issue
docs(api): update authentication endpoints
```

### 🔄 Development Process

#### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-analytics-dashboard

# 2. Implement feature
# ... make changes ...

# 3. Run tests
npm test
go test ./...

# 4. Commit changes
git add .
git commit -m "feat(analytics): add real-time dashboard"

# 5. Push and create PR
git push origin feature/new-analytics-dashboard
# Create pull request via GitHub
```

#### Code Review Process
1. **Self Review**: Check your own code first
2. **Automated Checks**: CI/CD pipeline validation
3. **Peer Review**: At least one team member approval
4. **Integration Tests**: Verify in staging environment
5. **Merge**: Squash and merge to develop branch

---

## 📝 Coding Standards

### 🎯 General Principles

#### Code Quality Standards
- **Readability**: Code should be self-documenting
- **Maintainability**: Easy to modify and extend
- **Performance**: Efficient and scalable
- **Security**: Secure by design
- **Testing**: Comprehensive test coverage

#### Documentation Requirements
```javascript
/**
 * Calculates usage-based billing for a tenant
 * @param {string} tenantId - The tenant identifier
 * @param {Object} usageData - Usage metrics for the billing period
 * @param {number} usageData.logs - Number of logs ingested
 * @param {number} usageData.storage - Storage used in bytes
 * @param {number} usageData.aiQueries - Number of AI queries
 * @returns {Promise<BillingCalculation>} Calculated billing amount
 * @throws {ValidationError} When usage data is invalid
 */
async function calculateUsageBilling(tenantId, usageData) {
  // Implementation...
}
```

### 🟨 JavaScript/TypeScript Standards

#### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

#### Code Style Examples
```typescript
// Good: Clear interface definitions
interface TenantUsage {
  tenantId: string;
  logs: number;
  storage: number;
  aiQueries: number;
  billingPeriod: {
    start: Date;
    end: Date;
  };
}

// Good: Async/await with proper error handling
async function processBilling(tenantId: string): Promise<BillingResult> {
  try {
    const usage = await getUsageData(tenantId);
    const calculation = await calculateBilling(usage);
    return await saveBillingRecord(calculation);
  } catch (error) {
    logger.error('Billing processing failed', { tenantId, error });
    throw new BillingError('Failed to process billing', { cause: error });
  }
}

// Good: Proper error handling
class BillingError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message);
    this.name = 'BillingError';
    this.cause = options?.cause;
  }
}
```

### 🔵 Go Standards

#### Code Organization
```go
// Package structure
package billing

import (
    "context"
    "fmt"
    "time"
    
    "github.com/neurallog/neurallog/pkg/types"
    "github.com/neurallog/neurallog/pkg/errors"
)

// Good: Clear struct definitions with tags
type TenantUsage struct {
    TenantID     string    `json:"tenantId" db:"tenant_id"`
    Logs         int64     `json:"logs" db:"logs"`
    Storage      int64     `json:"storage" db:"storage"`
    AIQueries    int64     `json:"aiQueries" db:"ai_queries"`
    RecordedAt   time.Time `json:"recordedAt" db:"recorded_at"`
}

// Good: Context-aware functions
func (s *BillingService) CalculateUsage(ctx context.Context, tenantID string) (*TenantUsage, error) {
    usage, err := s.repo.GetUsage(ctx, tenantID)
    if err != nil {
        return nil, fmt.Errorf("failed to get usage for tenant %s: %w", tenantID, err)
    }
    
    return usage, nil
}
```

### 🐳 Docker Standards

#### Dockerfile Best Practices
```dockerfile
# Multi-stage build for Node.js services
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs
RUN adduser -S neurallog -u 1001

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=neurallog:nodejs . .

USER neurallog
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
```

---

## 🧪 Testing Guidelines

### 🎯 Testing Strategy

#### Test Pyramid
```mermaid
graph TB
    A[Unit Tests - 70%]
    B[Integration Tests - 20%]
    C[E2E Tests - 10%]
    
    A --> B
    B --> C
```

#### Test Categories
- **Unit Tests**: Individual functions and components
- **Integration Tests**: Service interactions
- **Contract Tests**: API contract validation
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing

### 🔬 Unit Testing

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/types/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Test Examples
```typescript
// billing.service.test.ts
describe('BillingService', () => {
  let service: BillingService;
  let mockRepository: jest.Mocked<BillingRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new BillingService(mockRepository);
  });

  describe('calculateUsageBilling', () => {
    it('should calculate billing correctly for professional plan', async () => {
      // Arrange
      const tenantId = 'test-tenant';
      const usageData = {
        logs: 500000,
        storage: 25 * 1024 * 1024 * 1024, // 25GB
        aiQueries: 250
      };
      
      mockRepository.getTenantPlan.mockResolvedValue('professional');
      
      // Act
      const result = await service.calculateUsageBilling(tenantId, usageData);
      
      // Assert
      expect(result.baseAmount).toBe(9900); // $99.00
      expect(result.overageAmount).toBe(0);
      expect(result.totalAmount).toBe(9900);
    });

    it('should throw error for invalid usage data', async () => {
      // Arrange
      const tenantId = 'test-tenant';
      const invalidUsageData = { logs: -1 };
      
      // Act & Assert
      await expect(
        service.calculateUsageBilling(tenantId, invalidUsageData)
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

### 🔗 Integration Testing

#### Database Testing
```typescript
// billing.integration.test.ts
describe('Billing Integration', () => {
  let app: Application;
  let db: Database;

  beforeAll(async () => {
    db = await createTestDatabase();
    app = await createTestApp(db);
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.clear();
    await seedTestData(db);
  });

  it('should process billing end-to-end', async () => {
    // Create test tenant
    const tenant = await createTestTenant(db, {
      tenantId: 'test-tenant',
      planId: 'professional'
    });

    // Simulate usage
    await recordUsage(db, tenant.id, {
      logs: 750000,
      storage: 30 * 1024 * 1024 * 1024,
      aiQueries: 500
    });

    // Process billing
    const response = await request(app)
      .post('/api/billing/process')
      .send({ tenantId: tenant.tenantId })
      .expect(200);

    // Verify results
    expect(response.body.success).toBe(true);
    expect(response.body.data.totalAmount).toBeGreaterThan(9900);
  });
});
```

### 🎭 End-to-End Testing

#### Playwright Configuration
```typescript
// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ]
});
```

#### E2E Test Example
```typescript
// e2e/tests/billing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Billing Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'admin@test.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display current usage', async ({ page }) => {
    await page.goto('/billing');
    
    // Check usage metrics are displayed
    await expect(page.locator('[data-testid=logs-usage]')).toBeVisible();
    await expect(page.locator('[data-testid=storage-usage]')).toBeVisible();
    await expect(page.locator('[data-testid=ai-queries-usage]')).toBeVisible();
    
    // Verify usage values are numeric
    const logsUsage = await page.locator('[data-testid=logs-usage]').textContent();
    expect(logsUsage).toMatch(/^\d+/);
  });

  test('should allow plan upgrade', async ({ page }) => {
    await page.goto('/billing');
    await page.click('[data-testid=upgrade-plan-button]');
    
    // Select enterprise plan
    await page.click('[data-testid=enterprise-plan]');
    await page.click('[data-testid=confirm-upgrade]');
    
    // Verify success message
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('[data-testid=current-plan]')).toHaveText('Enterprise');
  });
});
```

---

## 📦 Build & Deployment

### 🔨 Build Process

#### Local Development Build
```bash
# Build all services
npm run build

# Build specific service
npm run build:billing
npm run build:admin

# Build with watch mode
npm run dev

# Build Docker images
docker build -t neurallog/billing:dev apps/billing/
docker build -t neurallog/admin:dev apps/admin/
```

#### Production Build
```bash
# Build optimized production images
./scripts/build-production.sh

# Tag for release
./scripts/tag-release.sh v1.2.0

# Push to registry
./scripts/push-images.sh v1.2.0
```

### 🚀 CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm test
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker images
        run: ./scripts/build-production.sh
      
      - name: Push to registry
        run: ./scripts/push-images.sh ${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: ./scripts/deploy-staging.sh ${{ github.sha }}
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Deploy to production
        if: success()
        run: ./scripts/deploy-production.sh ${{ github.sha }}
```

---

## 🤝 Contributing

### 📝 Contribution Process

#### Getting Started
1. **Fork Repository**: Create your own fork
2. **Clone Fork**: `git clone https://github.com/yourusername/NeuralLog.git`
3. **Create Branch**: `git checkout -b feature/your-feature`
4. **Make Changes**: Implement your feature or fix
5. **Test Changes**: Ensure all tests pass
6. **Submit PR**: Create pull request with description

#### Pull Request Guidelines
- **Clear Title**: Descriptive and concise
- **Detailed Description**: What, why, and how
- **Test Coverage**: Include relevant tests
- **Documentation**: Update docs if needed
- **Breaking Changes**: Clearly marked and explained

#### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Backward compatibility maintained

### 🐛 Bug Reports

#### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 20.04]
- Node.js: [e.g., 18.17.0]
- NeuralLog Version: [e.g., 1.2.0]

## Additional Context
Any other relevant information
```

### 💡 Feature Requests

#### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

---

## 📚 Resources

### 📖 Documentation Links
- [API Documentation](API.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Operations Manual](OPERATIONS.md)
- [User Guide](USER_GUIDE.md)

### 🛠️ Development Tools
- [Visual Studio Code](https://code.visualstudio.com/) - Recommended IDE
- [Postman](https://www.postman.com/) - API testing
- [k9s](https://k9scli.io/) - Kubernetes management
- [Lens](https://k8slens.dev/) - Kubernetes IDE

### 📚 Learning Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Go by Example](https://gobyexample.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### 🤝 Community
- [GitHub Discussions](https://github.com/NeuralLog/NeuralLog/discussions)
- [Discord Server](https://discord.gg/neurallog)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/neurallog)
- [Reddit Community](https://reddit.com/r/neurallog)

---

This developer guide provides comprehensive information for contributing to the NeuralLog platform. For specific implementation details, refer to the individual service documentation and API guides.
