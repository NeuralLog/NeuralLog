# NeuralLog Integration Tests

Comprehensive integration test suite for the NeuralLog platform, covering all features including AI integration, zero-knowledge security, and real-time analytics.

## 🎯 Test Coverage

### 🤖 AI Integration Tests
- **MCP Client Authentication** - M2M authentication flow
- **AI Agent Communication** - Tool execution and responses
- **Claude Desktop Integration** - End-to-end AI workflow
- **Custom AI Agent Integration** - Custom agent development
- **Error Handling** - Network errors, rate limiting, tenant isolation
- **Performance** - Concurrent requests, response times

### 🔌 API Integration Tests
- **REST API Endpoints** - All CRUD operations
- **Authentication & Authorization** - API keys, JWT tokens, permissions
- **Logging API** - Single and batch log entries
- **Search API** - Text search, filters, metadata queries
- **Metrics API** - System and custom metrics
- **Error Handling** - Malformed requests, large payloads
- **Rate Limiting** - Request throttling and limits

### 🌐 WebSocket Integration Tests
- **Real-time Log Streaming** - Live log delivery
- **Subscription Management** - Subscribe/unsubscribe flows
- **Filtering** - Level-based and metadata filtering
- **Multi-client Support** - Multiple concurrent connections
- **Authentication** - WebSocket authentication flows
- **Tenant Isolation** - Cross-tenant data protection

### 🔐 Authentication Tests
- **User Authentication** - Registration, login, logout
- **API Key Management** - Creation, permissions, revocation
- **M2M Authentication** - Machine-to-machine flows
- **Token Management** - Access and refresh tokens
- **Tenant Isolation** - Multi-tenant security
- **Permission Enforcement** - Role-based access control

### 🖥️ E2E UI Tests
- **Navigation** - All page routing and navigation
- **Mobile Responsiveness** - Mobile and tablet layouts
- **Interactive Elements** - Forms, buttons, modals
- **Real-time Updates** - Live data and notifications
- **Accessibility** - Keyboard navigation, ARIA labels
- **Performance** - Page load times, client-side routing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (for CI mode)

### Running Tests

```bash
# Run all integration tests
./tests/run-integration-tests.sh

# Run specific test categories
./tests/run-integration-tests.sh --pattern ai
./tests/run-integration-tests.sh --pattern api
./tests/run-integration-tests.sh --pattern auth
./tests/run-integration-tests.sh --pattern ui

# Run with coverage
./tests/run-integration-tests.sh --coverage

# Run in watch mode (for development)
./tests/run-integration-tests.sh --watch

# Run in CI mode
./tests/run-integration-tests.sh --ci
```

### Manual Test Execution

```bash
# Navigate to integration tests directory
cd tests/integration

# Install dependencies
npm install

# Run specific test suites
npm run test:ai          # AI integration tests
npm run test:api         # API integration tests
npm run test:auth        # Authentication tests
npm run test:ui          # E2E UI tests

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Debug tests
npm run test:debug
```

## 📁 Test Structure

```
tests/
├── integration/                 # Integration test suite
│   ├── ai/                     # AI integration tests
│   │   ├── mcp-client.integration.test.ts
│   │   └── ai-agents.integration.test.ts
│   ├── api/                    # API integration tests
│   │   ├── rest-api.integration.test.ts
│   │   └── websocket.integration.test.ts
│   ├── auth/                   # Authentication tests
│   │   └── authentication.integration.test.ts
│   ├── utils/                  # Test utilities
│   │   └── test-helpers.ts
│   ├── jest.config.js          # Jest configuration
│   ├── setup.ts               # Test setup
│   ├── global-setup.ts        # Global test setup
│   ├── global-teardown.ts     # Global test cleanup
│   ├── package.json           # Test dependencies
│   └── .env.test              # Test environment
├── e2e/                       # End-to-end tests
│   └── ui/                    # UI tests
│       └── navigation.e2e.test.ts
├── performance/               # Performance tests
├── security/                  # Security tests
├── run-integration-tests.sh   # Test runner script
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

```bash
# Service URLs
TEST_API_URL=http://localhost:3030
TEST_AUTH_URL=http://localhost:3040
TEST_WEB_URL=http://localhost:3000

# Database
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/neurallog_test
TEST_REDIS_URL=redis://localhost:6379/1

# Test Configuration
NODE_ENV=test
TEST_TIMEOUT=30000
```

### Test Data Management

Tests use isolated test data that is automatically created and cleaned up:

- **Test Tenants** - Isolated tenant environments
- **Test Users** - Temporary user accounts
- **Test API Keys** - Scoped API keys with specific permissions
- **Test Logs** - Sample log data for search and analysis
- **Mock Services** - Mocked external AI services

## 🎭 Test Utilities

### TestHelpers Class

Comprehensive utility class providing:

```typescript
// User and tenant management
await testHelpers.createTestTenant()
await testHelpers.createTestUser(tenantId)
await testHelpers.authenticateUser(user)

// API key management
await testHelpers.createApiKey(user, permissions)

// API interactions
await testHelpers.makeApiRequest(endpoint, options)
await testHelpers.sendLogEntry(apiKey, tenantId, logEntry)
await testHelpers.searchLogs(apiKey, tenantId, query)

// WebSocket connections
await testHelpers.createWebSocketConnection(endpoint, apiKey, tenantId)

// MCP client operations
await testHelpers.createMCPClient(clientId, clientSecret, tenantId)
await testHelpers.executeMCPTool(accessToken, tenantId, toolName, params)

// Cleanup
await testHelpers.cleanupTestData(user)
```

## 🚦 CI/CD Integration

### GitHub Actions

Automated test execution on:
- **Push to main/develop** - Full test suite
- **Pull requests** - Full test suite with coverage
- **Daily schedule** - Comprehensive test run
- **Manual trigger** - On-demand testing

### Test Reports

- **Coverage Reports** - Line, function, branch coverage
- **Test Results** - Detailed pass/fail status
- **Performance Metrics** - Response times and throughput
- **Security Scans** - Dependency and vulnerability checks

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Debug specific test file
npm run test:debug -- --testPathPattern=mcp-client
```

### Logging

Tests include comprehensive logging:
- Service startup and health checks
- Test data creation and cleanup
- API request/response details
- WebSocket connection events
- Error details and stack traces

### Common Issues

1. **Service Startup Failures**
   - Check port availability
   - Verify database connectivity
   - Ensure Redis is running

2. **Test Data Conflicts**
   - Tests use unique identifiers
   - Automatic cleanup between tests
   - Isolated tenant environments

3. **Timing Issues**
   - Built-in retry mechanisms
   - Configurable timeouts
   - Wait conditions for async operations

## 📊 Test Metrics

### Coverage Targets
- **Lines**: >90%
- **Functions**: >90%
- **Branches**: >85%
- **Statements**: >90%

### Performance Benchmarks
- **API Response Time**: <500ms
- **WebSocket Connection**: <1s
- **Search Queries**: <2s
- **AI Tool Execution**: <5s

## 🔄 Continuous Improvement

### Test Maintenance
- Regular test review and updates
- Performance benchmark monitoring
- Coverage gap analysis
- Flaky test identification and fixes

### New Feature Testing
- Test-driven development approach
- Integration test requirements for new features
- Automated test generation where possible
- Documentation updates with new tests

---

## 🤝 Contributing

When adding new features:

1. **Write integration tests first** - TDD approach
2. **Update test documentation** - Keep this README current
3. **Ensure test isolation** - No cross-test dependencies
4. **Add proper cleanup** - Prevent test data leakage
5. **Update CI configuration** - Include new test categories

For questions or issues with tests, please check the existing test files for examples or create an issue in the repository.
