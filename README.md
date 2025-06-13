# NeuralLog

> Zero-Knowledge Telemetry and Logging Platform

NeuralLog is a comprehensive, privacy-first logging and telemetry platform that enables organizations to collect and analyze data without compromising user privacy through zero-knowledge architecture.

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
