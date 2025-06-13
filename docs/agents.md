# NeuralLog AI Agents & MCP Integration Guide

## 🤖 Overview

NeuralLog provides comprehensive AI agent integration through the Model Context Protocol (MCP), enabling AI assistants like Claude, ChatGPT, and other AI systems to securely interact with your zero-knowledge telemetry data.

## 🚀 Quick Start

### Claude Desktop Integration

#### Step 1: Install MCP Client
```bash
npm install -g @neurallog/mcp-client
```

#### Step 2: Configure Environment
Create environment variables:
```bash
WEB_SERVER_URL=https://your-neurallog-instance.com
AUTH_SERVICE_URL=https://auth.your-neurallog-instance.com
AUTH_CLIENT_ID=your-m2m-client-id
AUTH_CLIENT_SECRET=your-m2m-client-secret
TENANT_ID=your-tenant-id
```

#### Step 3: Configure Claude Desktop
Edit Claude Desktop configuration:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "neurallog": {
      "command": "neurallog-mcp-client",
      "env": {
        "WEB_SERVER_URL": "https://your-neurallog-instance.com",
        "AUTH_SERVICE_URL": "https://auth.your-neurallog-instance.com",
        "AUTH_CLIENT_ID": "your-m2m-client-id",
        "AUTH_CLIENT_SECRET": "your-m2m-client-secret",
        "TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

#### Step 4: Restart Claude Desktop
Restart Claude Desktop to load the NeuralLog MCP client. Claude will now have access to your NeuralLog data!

## 🛠️ Available MCP Tools

### `get_logs`
Retrieve available log names and metadata.

**Parameters:**
- `limit` (optional): Maximum number of logs to return (default: 1000)

### `search`
Search across logs with advanced filtering.

**Parameters:**
- `query` (optional): Text to search for
- `log_name` (optional): Specific log to search
- `start_time` (optional): Filter entries after timestamp (ISO format)
- `end_time` (optional): Filter entries before timestamp (ISO format)
- `field_filters` (optional): Filter by field values
- `limit` (optional): Maximum entries to return (default: 100)

### `append_to_log`
Add new data to a specific log.

**Parameters:**
- `log_name`: Name of the log
- `data`: Data to append (any JSON-serializable object)

### `clear_log`
Clear all entries from a specific log.

**Parameters:**
- `log_name`: Name of the log to clear

## 🔐 Security Features

### Zero-Knowledge Architecture
- Client-side encryption with your keys
- No plaintext access by NeuralLog servers
- Tenant isolation at infrastructure level
- Comprehensive audit logging

### Authentication
- M2M authentication with JWT tokens
- Automatic token refresh
- Custom error handling
- Rate limiting protection

## 🎯 Use Cases

### 1. Automated Incident Response
AI agents monitor logs and respond to incidents automatically.

### 2. Intelligent Log Analysis
AI agents analyze patterns and provide insights.

### 3. Proactive Monitoring
AI agents set up proactive monitoring and alerting.

## 🔧 Advanced Configuration

### Custom Agent Integration
```typescript
import { AuthenticatedHttpClient } from '@neurallog/mcp-client';

const client = new AuthenticatedHttpClient({
  authServiceUrl: 'https://auth.neurallog.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  tenantId: 'your-tenant'
}, 'https://api.neurallog.com');

const logs = await client.get('/logs');
```

### Error Handling
The client uses custom error types:
- `AuthConfigError` - Invalid credentials
- `AuthNetworkError` - Network issues
- `AuthServiceError` - Service problems
- `AuthTokenExpiredError` - Token expired
- `AuthRateLimitError` - Rate limiting

### Container Deployment
```bash
docker run -i --env-file .env neurallog-mcp-client
```

## 🚨 Troubleshooting

### Authentication Failures
1. Check credentials are correct
2. Verify network connectivity
3. Check auth service status
4. Review rate limiting

### Configuration Problems
1. Validate environment variables
2. Check JSON syntax in Claude config
3. Verify file permissions
4. Restart Claude Desktop

## 📚 Additional Resources

- [API Reference](./api-reference.md)
- [SDK Documentation](./sdk-documentation.md)
- [Security Guide](./security.md)
- [Deployment Guide](./deployment.md)

---

**🚀 Ready to integrate AI agents with NeuralLog?** Follow the quick start guide above or check our [complete documentation](./README.md)!
