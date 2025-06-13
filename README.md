# NeuralLog - Zero-Knowledge Telemetry and Logging Platform

Welcome to the NeuralLog monorepo! This repository contains all components of the NeuralLog ecosystem in a single, well-organized workspace powered by Turborepo.

## 🏗️ Repository Structure

```
neurallog/
├── apps/                    # Applications
│   ├── auth/                # Authentication service
│   ├── docs/                # Documentation site
│   ├── log-server/          # Main logging server
│   ├── marketing/           # Marketing website
│   └── web/                 # Web dashboard
├── packages/                # Shared packages
│   ├── mcp-client/          # Model Context Protocol client
│   ├── registry/            # Component registry
│   └── specs/               # Technical specifications
├── sdks/                    # Client SDKs
│   ├── csharp/              # C# SDK
│   ├── go/                  # Go SDK
│   ├── java-client-sdk/     # Java SDK
│   ├── python/              # Python SDK
│   ├── typescript-client-sdk/ # TypeScript SDK
│   └── typescript-logger/   # TypeScript logger
├── services/                # Microservices
│   └── java-logger/         # Java logging service
└── infra/                   # Infrastructure as code
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
npm install
```

### Development
```bash
# Start all apps in development mode
npm run dev

# Build all packages
npm run build

# Run tests across all packages
npm run test

# Lint all code
npm run lint
```

## 📦 Workspace Commands

Thanks to Turborepo, you can run commands across the entire workspace efficiently:

```bash
# Build everything (with intelligent caching)
npm run build

# Run development servers for all apps
npm run dev

# Test everything
npm run test

# Lint everything
npm run lint

# Clean all build artifacts
npm run clean

# Type check everything
npm run type-check

# Format code
npm run format
```

## 🎯 Working with Specific Packages

You can also run commands for specific packages:

```bash
# Build just the log-server
npm run build --workspace=apps/log-server

# Start development for just the web app
npm run dev --workspace=apps/web

# Test just the Python SDK
npm run test --workspace=sdks/python
```

## 🏭 Applications

### Log Server (`apps/log-server`)
The core NeuralLog server that handles log ingestion, processing, and storage.

### Web Dashboard (`apps/web`)
The main web interface for viewing and managing logs.

### Authentication Service (`apps/auth`)
Handles authentication and authorization for the NeuralLog platform.

### Documentation (`apps/docs`)
The official documentation site for NeuralLog.

### Marketing Site (`apps/marketing`)
The public marketing website for NeuralLog.

## 📚 Client SDKs

We provide SDKs for multiple programming languages:

- **C#** (`sdks/csharp`) - For .NET applications
- **Go** (`sdks/go`) - For Go applications  
- **Java** (`sdks/java-client-sdk`) - For Java applications
- **Python** (`sdks/python`) - For Python applications
- **TypeScript** (`sdks/typescript-client-sdk`) - For TypeScript/JavaScript applications
- **TypeScript Logger** (`sdks/typescript-logger`) - Lightweight logging library

## 🔧 Shared Packages

### Specifications (`packages/specs`)
Technical specifications and schemas for the NeuralLog platform.

### Registry (`packages/registry`)
Component registry for managing NeuralLog components and plugins.

### MCP Client (`packages/mcp-client`)
**🤖 AI Agent Integration**: Model Context Protocol client for seamless AI integration with Claude Desktop, ChatGPT, and custom AI agents. Enables AI assistants to securely access and analyze your zero-knowledge telemetry data.

**Key Features:**
- ✅ **Claude Desktop Integration**: Native support for Anthropic's Claude
- ✅ **Secure Authentication**: M2M authentication with automatic token refresh
- ✅ **Zero-Knowledge Compatible**: Maintains privacy while enabling AI analysis
- ✅ **Custom AI Agents**: SDK for building custom AI integrations
- ✅ **Production Ready**: Enterprise-grade security and reliability

**Quick Setup:**
```bash
npm install -g @neurallog/mcp-client
```

See our [**AI Agents Guide**](./docs/agents.md) for complete integration documentation.

## 🌩️ Infrastructure

### Infrastructure as Code (`infra/`)
Contains all infrastructure configuration files, Docker configurations, and deployment scripts.

## 🛠️ Development

### Adding a New Package

1. Create a new directory in the appropriate workspace (`apps/`, `packages/`, `sdks/`, or `services/`)
2. Add a `package.json` with the appropriate workspace configuration
3. Run `npm install` to update the workspace

### Build System

This monorepo uses Turborepo for:
- **Intelligent caching** - Only rebuild what's changed
- **Parallel execution** - Run tasks across packages simultaneously  
- **Dependency awareness** - Build packages in the correct order
- **Remote caching** - Share build cache across team members

### Git Workflow

With the monorepo, you can now:
- Make atomic commits across multiple packages
- Coordinate changes between client SDKs and server
- Maintain consistency across the entire platform
- Simplify release management

## 📖 Documentation

### 🎯 Getting Started
- [📖 Platform Overview](./docs/overview.md) - Complete platform overview and features
- [⚡ Quick Start Guide](./docs/quick-start.md) - Get started in 5 minutes
- [🔧 Configuration Guide](./packages/specs/docs/configuration.md) - Detailed configuration options

### 🤖 AI Integration
- [🤖 **AI Agents Guide**](./docs/agents.md) - **Comprehensive AI integration documentation**
- [🔌 MCP Integration](./packages/specs/07-mcp-integration-overview.md) - Model Context Protocol details
- [🧠 Custom AI Agents](./packages/specs/09-mcp-client-sdk.md) - Building custom AI integrations

### 🛠️ Development
- [📋 API Reference](./docs/api-reference.md) - Complete API documentation
- [📦 SDK Documentation](./docs/sdk-documentation.md) - Client SDK guides for all languages
- [🔐 Security Guide](./docs/security.md) - Security best practices and architecture
- [🚀 Deployment Guide](./docs/deployment.md) - Production deployment instructions

### 🏢 Enterprise & Architecture
- [🏗️ Technical Specifications](./packages/specs/) - Detailed technical specifications
- [📊 Monitoring & Observability](./packages/specs/23-monitoring-observability.md) - Monitoring setup
- [🔒 Compliance & Security](./packages/specs/10-security-model.md) - Security model details
- [📈 Scaling Guide](./packages/specs/25-scaling-performance.md) - Performance and scaling

### 🛠️ Infrastructure
- [🐳 Docker Setup](./infra/) - Container deployment
- [☸️ Kubernetes](./packages/specs/22-kubernetes-deployment.md) - Kubernetes deployment
- [☁️ Cloud Providers](./infra/docs/) - Cloud-specific deployment guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Official Website](https://neurallog.com)
- [Documentation](https://docs.neurallog.com)
- [GitHub Issues](https://github.com/NeuralLog/neurallog/issues)

---

**🎉 Welcome to the NeuralLog monorepo! No more managing 16 separate repositories!** 🎉

> Zero-Knowledge Telemetry and Logging Platform

NeuralLog is a comprehensive, privacy-first logging and telemetry platform that enables organizations to collect and analyze data without compromising user privacy through zero-knowledge architecture.

## 🤖 AI Integration Highlight

**NeuralLog now features comprehensive AI agent integration!** Connect Claude Desktop, ChatGPT, and custom AI agents to your zero-knowledge telemetry data.

```bash
# Install MCP Client for AI integration
npm install -g @neurallog/mcp-client

# Configure Claude Desktop (see docs/agents.md for details)
# Add to claude_desktop_config.json:
{
  "mcpServers": {
    "neurallog": {
      "command": "neurallog-mcp-client",
      "env": {
        "WEB_SERVER_URL": "https://your-neurallog-instance.com",
        "AUTH_CLIENT_ID": "your-client-id",
        "AUTH_CLIENT_SECRET": "your-client-secret",
        "TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

**✨ What AI agents can do with NeuralLog:**
- 🔍 **Intelligent Log Analysis**: AI-powered pattern detection and anomaly identification
- 🚨 **Automated Incident Response**: AI agents respond to critical issues automatically
- 📊 **Smart Dashboards**: AI-generated insights and recommendations
- 🔒 **Zero-Knowledge Privacy**: All analysis happens on encrypted data

👉 **[Complete AI Integration Guide](./docs/agents.md)**

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/NeuralLog/neurallog.git
cd neurallog

# Install dependencies
npm install

# Start development environment
npm run dev

# Build all packages
npm run build

# Run tests
npm run test
```

## 📁 Repository Structure

This monorepo contains all NeuralLog components organized by purpose:

```
neurallog/
├── apps/                           # Applications
│   ├── web/                        # Web dashboard interface
│   ├── log-server/                 # Main logging server
│   └── marketing/                  # Marketing website
├── packages/                       # Shared packages & services
│   ├── auth/                       # Authentication service
│   ├── registry/                   # Component registry
│   ├── specs/                      # Technical specifications
│   └── mcp-client/                 # Model Context Protocol client
├── sdks/                          # Client SDKs
│   ├── csharp/                     # C# SDK
│   ├── go/                         # Go SDK
│   ├── java-client-sdk/            # Java SDK
│   ├── python/                     # Python SDK
│   ├── typescript-client-sdk/      # TypeScript SDK
│   └── typescript-logger/          # TypeScript logger
├── services/                       # Microservices
│   └── java-logger/                # Java logging service
└── infra/                         # Infrastructure as code
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm 8+
- Git

### Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all packages and applications
- `npm run test` - Run test suites across all packages
- `npm run lint` - Lint all code
- `npm run clean` - Clean all build artifacts
- `npm run type-check` - Run TypeScript type checking

### Working with Packages

Each package can be developed independently:

```bash
# Work on a specific package
cd packages/auth
npm run dev

# Build a specific package
npm run build --filter=@neurallog/auth

# Test a specific package
npm run test --filter=@neurallog/auth
```

## 🏗️ Architecture

### Core Principles

- **Zero-Knowledge**: Data is processed without exposing raw content
- **Privacy-First**: Built-in privacy controls and data minimization
- **Scalable**: Designed to handle enterprise-scale logging needs
- **Multi-Language**: SDKs available for major programming languages
- **Real-time**: Live data streaming and analysis capabilities

### Key Components

#### Applications
- **Web Dashboard**: React-based interface for log analysis and visualization
- **Log Server**: High-performance logging ingestion and processing engine
- **Marketing Site**: Public-facing website and documentation

#### SDKs & Libraries
- **Multi-Language Support**: C#, Go, Java, Python, TypeScript
- **Consistent APIs**: Unified interface across all language SDKs
- **Zero-Knowledge Integration**: Built-in privacy controls

#### Services
- **Authentication**: Secure user and application authentication
- **Registry**: Service discovery and configuration management
- **MCP Integration**: AI-powered log analysis through Claude

## 🚦 Getting Started

### 1. Local Development Setup

```bash
# Install dependencies
npm install

# Start development environment
npm run dev
```

This will start:
- Log server on `http://localhost:8080`
- Web dashboard on `http://localhost:3000`
- Authentication service on `http://localhost:8081`

### 2. Using the SDKs

Choose your preferred language SDK:

```typescript
// TypeScript
import { NeuralLogger } from '@neurallog/typescript-sdk';

const logger = new NeuralLogger({
  apiKey: 'your-api-key',
  endpoint: 'https://api.neurallog.com'
});

logger.info('Hello, NeuralLog!', { userId: '12345' });
```

```python
# Python
from neurallog import NeuralLogger

logger = NeuralLogger(
    api_key='your-api-key',
    endpoint='https://api.neurallog.com'
)

logger.info('Hello, NeuralLog!', {'user_id': '12345'})
```

### 3. Deploy to Production

```bash
# Build for production
npm run build

# Deploy infrastructure
cd infra
terraform apply

# Deploy applications
npm run deploy
```

## 📖 Documentation

- [API Documentation](./docs/api/)
- [SDK Guides](./docs/sdks/)
- [Architecture Overview](./docs/architecture/)
- [Deployment Guide](./docs/deployment/)
- [Contributing Guide](./CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Testing requirements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@neurallog.com
- 💬 Discord: [NeuralLog Community](https://discord.gg/neurallog)
- 📚 Documentation: [docs.neurallog.com](https://docs.neurallog.com)
- 🐛 Issues: [GitHub Issues](https://github.com/NeuralLog/neurallog/issues)

---

**Built with ❤️ by the NeuralLog team**
