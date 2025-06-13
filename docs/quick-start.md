# NeuralLog Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get you up and running with NeuralLog in just a few minutes. You'll learn how to set up the platform, send your first logs, and integrate AI agents.

## 📋 Prerequisites

- **Docker & Docker Compose** (recommended) OR **Node.js 18+**
- **Git** for cloning the repository
- **5 minutes** of your time!

## 🐳 Option 1: Docker Quick Start (Recommended)

### Step 1: Clone and Start

```bash
# Clone the repository
git clone https://github.com/NeuralLog/NeuralLog.git
cd NeuralLog

# Start with Docker Compose
docker-compose up -d

# Wait for services to start (about 30 seconds)
docker-compose logs -f
```

### Step 2: Access the Dashboard

Open your browser and navigate to:
- **Web Dashboard**: http://localhost:3000
- **API Endpoint**: http://localhost:3030
- **Auth Service**: http://localhost:3040

### Step 3: Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign Up" 
3. Create your account
4. Verify your email (check console logs for development)

### Step 4: Get Your API Key

1. Log into the dashboard
2. Navigate to "API Keys" in the sidebar
3. Click "Create New API Key"
4. Copy your API key (starts with `nl_`)

## 💻 Option 2: Local Development Setup

### Step 1: Install Dependencies

```bash
# Clone the repository
git clone https://github.com/NeuralLog/NeuralLog.git
cd NeuralLog

# Install dependencies
npm install

# Start development environment
npm run dev
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Step 3: Initialize Database

```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## 📝 Send Your First Log

### Using cURL

```bash
# Replace YOUR_API_KEY with your actual API key
curl -X POST http://localhost:3030/api/v1/logs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Tenant-ID: default" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "Hello, NeuralLog! 🎉",
    "metadata": {
      "source": "quick-start-guide",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }'
```

### Using TypeScript SDK

```bash
# Install the SDK
npm install @neurallog/client-sdk
```

```typescript
// hello-neurallog.ts
import { NeuralLog } from '@neurallog/client-sdk';

const logger = new NeuralLog({
  apiKey: 'YOUR_API_KEY',
  tenantId: 'default',
  endpoint: 'http://localhost:3030'
});

async function main() {
  // Send a log entry
  await logger.log({
    level: 'info',
    message: 'Hello from TypeScript! 🚀',
    metadata: {
      user: 'quick-start-user',
      action: 'first-log',
      timestamp: new Date().toISOString()
    }
  });

  console.log('✅ Log sent successfully!');

  // Search for logs
  const results = await logger.search({
    query: 'Hello',
    limit: 10
  });

  console.log(`📊 Found ${results.entries.length} log entries`);
  results.entries.forEach(entry => {
    console.log(`  - ${entry.level}: ${entry.message}`);
  });
}

main().catch(console.error);
```

```bash
# Run the example
npx tsx hello-neurallog.ts
```

### Using Python SDK

```bash
# Install the SDK
pip install neurallog-python
```

```python
# hello_neurallog.py
from neurallog import NeuralLog
from datetime import datetime

logger = NeuralLog(
    api_key='YOUR_API_KEY',
    tenant_id='default',
    endpoint='http://localhost:3030'
)

# Send a log entry
logger.log(
    level='info',
    message='Hello from Python! 🐍',
    metadata={
        'user': 'quick-start-user',
        'action': 'first-log',
        'timestamp': datetime.now().isoformat()
    }
)

print('✅ Log sent successfully!')

# Search for logs
results = logger.search(
    query='Hello',
    limit=10
)

print(f'📊 Found {len(results.entries)} log entries')
for entry in results.entries:
    print(f'  - {entry.level}: {entry.message}')
```

```bash
# Run the example
python hello_neurallog.py
```

## 🤖 Set Up AI Agent Integration

### Claude Desktop Integration

#### Step 1: Install MCP Client

```bash
# Install globally
npm install -g @neurallog/mcp-client

# Or locally in your project
npm install @neurallog/mcp-client
```

#### Step 2: Get M2M Credentials

1. Go to your NeuralLog dashboard
2. Navigate to "Settings" → "API Keys"
3. Click "Create M2M Client"
4. Copy the Client ID and Client Secret

#### Step 3: Configure Claude Desktop

Edit your Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "neurallog": {
      "command": "neurallog-mcp-client",
      "env": {
        "WEB_SERVER_URL": "http://localhost:3030",
        "AUTH_SERVICE_URL": "http://localhost:3040",
        "AUTH_CLIENT_ID": "your-m2m-client-id",
        "AUTH_CLIENT_SECRET": "your-m2m-client-secret",
        "TENANT_ID": "default"
      }
    }
  }
}
```

#### Step 4: Restart Claude Desktop

Restart Claude Desktop and you'll see NeuralLog tools available in the interface!

### Test AI Integration

Ask Claude:
> "Can you show me the recent logs from NeuralLog?"

> "Search for any error logs in the last hour"

> "Add a log entry saying 'AI integration test successful'"

## 📊 Explore the Dashboard

### View Your Logs

1. Go to http://localhost:3000
2. Navigate to "Logs" in the sidebar
3. See your logs in real-time
4. Use the search bar to filter logs

### Create Custom Dashboards

1. Click "Dashboards" in the sidebar
2. Click "Create New Dashboard"
3. Add widgets for:
   - Log volume over time
   - Error rate trends
   - Custom metrics

### Set Up Alerts

1. Go to "Alerts" in the sidebar
2. Click "Create Alert"
3. Configure conditions:
   - Log level = "error"
   - Count > 5 in 5 minutes
4. Set notification channels

## 🔧 Advanced Configuration

### Enable Encryption

```typescript
// Enable client-side encryption
const logger = new NeuralLog({
  apiKey: 'YOUR_API_KEY',
  tenantId: 'default',
  endpoint: 'http://localhost:3030',
  encryption: {
    enabled: true,
    keyId: 'your-encryption-key-id'
  }
});
```

### Configure Batching

```typescript
// Enable batching for high-throughput scenarios
const logger = new NeuralLog({
  apiKey: 'YOUR_API_KEY',
  tenantId: 'default',
  endpoint: 'http://localhost:3030',
  batching: {
    enabled: true,
    maxSize: 100,      // Send batch when 100 entries collected
    maxWait: 5000      // Send batch after 5 seconds
  }
});
```

### Real-time Streaming

```typescript
// Stream logs in real-time
const stream = logger.stream({
  filters: {
    level: ['error', 'fatal']
  }
});

stream.on('data', (logEntry) => {
  console.log('🚨 New error:', logEntry);
  // Trigger alerts, notifications, etc.
});
```

## 🎯 Next Steps

### 1. Production Deployment
- Follow our [Deployment Guide](./deployment.md)
- Set up proper SSL certificates
- Configure production databases
- Set up monitoring and alerting

### 2. Team Setup
- Invite team members
- Set up role-based access control
- Configure organization settings
- Set up SSO integration

### 3. Advanced Features
- Set up searchable encryption
- Configure custom metrics
- Implement automated responses
- Set up compliance features

### 4. AI Integration
- Explore more AI agent integrations
- Set up custom AI workflows
- Configure intelligent alerting
- Implement automated incident response

## 🆘 Troubleshooting

### Common Issues

#### "Connection refused" errors
```bash
# Check if services are running
docker-compose ps

# Check logs for errors
docker-compose logs neurallog-web
docker-compose logs neurallog-auth
```

#### "Invalid API key" errors
```bash
# Verify your API key format
echo "YOUR_API_KEY" | grep -E "^nl_[a-zA-Z0-9]{32}$"

# Check API key in dashboard
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:3030/api/v1/health
```

#### Claude Desktop not showing NeuralLog tools
1. Check the configuration file path
2. Verify JSON syntax is valid
3. Restart Claude Desktop completely
4. Check environment variables are set correctly

### Getting Help

- 📖 [Full Documentation](./overview.md)
- 🐛 [GitHub Issues](https://github.com/NeuralLog/NeuralLog/issues)
- 💬 [Community Discussions](https://github.com/NeuralLog/NeuralLog/discussions)
- 📧 [Support Email](mailto:support@neurallog.com)

## 🎉 Congratulations!

You've successfully set up NeuralLog and sent your first logs! Here's what you've accomplished:

- ✅ Deployed NeuralLog locally
- ✅ Created your first account
- ✅ Sent logs via API and SDK
- ✅ Set up AI agent integration
- ✅ Explored the dashboard

### What's Next?

1. **Integrate with your applications** using our SDKs
2. **Set up production deployment** following our deployment guide
3. **Explore AI capabilities** with Claude and other agents
4. **Configure monitoring and alerting** for your team
5. **Join our community** to share feedback and get help

---

**🚀 Ready for production?** Check out our [Deployment Guide](./deployment.md) or [contact our team](mailto:enterprise@neurallog.com) for enterprise support!
