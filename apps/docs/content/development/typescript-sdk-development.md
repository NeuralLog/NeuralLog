---
sidebar_position: 6
---

# TypeScript SDK Development

This guide covers the development setup and implementation details for the NeuralLog TypeScript SDK, which serves as the reference implementation for all other language SDKs.

## Development Status

The TypeScript SDK is the cornerstone of the NeuralLog client libraries and is actively developed. It serves as the reference implementation for all cryptographic operations and API interactions.

## Architecture Overview

The TypeScript SDK follows a modular architecture designed for both browser and Node.js environments:

```
src/
├── client/           # Main client classes
├── crypto/           # Cryptographic operations
├── auth/             # Authentication and authorization
├── logs/             # Log management
├── managers/         # Higher-level managers
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Core Components

#### NeuralLogClient
The main client class that orchestrates all operations:
- Configuration management
- API key handling
- Service coordination

#### CryptoService
Handles all cryptographic operations:
- Key derivation (PBKDF2, Argon2)
- Encryption/decryption (AES-GCM)
- Digital signatures
- Random value generation

#### KeyHierarchyManager
Manages the hierarchical key structure:
- Master secret derivation
- KEK (Key Encryption Key) management
- Tenant-specific key isolation

#### LogManager
High-level log operations:
- Log creation and encryption
- Log retrieval and decryption
- Search functionality

## Development Environment

### Prerequisites
- Node.js 18+ or browser environment
- TypeScript 5.0+
- Webpack or Vite for bundling

### Setup

```bash
# Clone the repository
git clone https://github.com/NeuralLog/typescript-client-sdk
cd typescript-client-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Project Structure

```
typescript-client-sdk/
├── src/
│   ├── client/
│   │   └── NeuralLogClient.ts
│   ├── crypto/
│   │   ├── CryptoService.ts
│   │   ├── KeyDerivation.ts
│   │   └── MnemonicService.ts
│   ├── auth/
│   │   ├── AuthManager.ts
│   │   ├── AuthService.ts
│   │   └── KekService.ts
│   ├── logs/
│   │   ├── LogManager.ts
│   │   └── LogsService.ts
│   └── managers/
│       └── KeyHierarchyManager.ts
├── tests/
├── docs/
└── examples/
```

## Key Features

### Zero-Knowledge Architecture
- Client-side encryption ensures server never sees plaintext
- Hierarchical key derivation for tenant isolation
- Forward secrecy through key rotation

### Cross-Platform Support
- Works in browsers and Node.js
- WebCrypto API for browser environments
- Node.js crypto module for server environments

### TypeScript Support
- Full type safety
- Comprehensive type definitions
- IntelliSense support

## Testing Strategy

### Unit Tests
- Jest for unit testing
- Comprehensive test coverage
- Cryptographic operation validation

### Integration Tests
- End-to-end testing with real server
- Cross-browser compatibility testing
- Performance benchmarks

### Security Testing
- Cryptographic primitive validation
- Key derivation testing
- Timing attack resistance

## Build Configuration

### Webpack Configuration
The SDK uses Webpack for building browser-compatible bundles:

```javascript
module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'neurallog-sdk.min.js',
    library: 'NeuralLog',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer')
    }
  }
};
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## API Design Principles

### Async/Await Pattern
All operations use modern async/await patterns:

```typescript
const client = new NeuralLogClient(config);
await client.logs.createLog('app-logs', logData);
```

### Error Handling
Comprehensive error handling with typed exceptions:

```typescript
try {
  await client.logs.searchLogs(query);
} catch (error) {
  if (error instanceof CryptoError) {
    // Handle cryptographic errors
  } else if (error instanceof NetworkError) {
    // Handle network errors
  }
}
```

### Configuration Management
Flexible configuration with sensible defaults:

```typescript
const config: NeuralLogConfig = {
  apiKey: 'your-api-key',
  baseUrl: 'https://api.neurallog.com',
  timeout: 30000,
  retryAttempts: 3
};
```

## Performance Considerations

### Lazy Loading
Components are loaded on-demand to reduce bundle size.

### Caching
- KEK caching for performance
- Intelligent cache invalidation
- Memory-efficient storage

### Batch Operations
Support for batch log operations to reduce API calls.

## Contributing

### Code Style
- ESLint for code linting
- Prettier for code formatting
- Conventional commits for git messages

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request with description

## Related Resources

- [Java SDK Development](./java-sdk-development.md) - Similar implementation for Java
- [C# SDK Development](./csharp-sdk-development.md) - .NET implementation
- [Zero-Knowledge Architecture](../security/zero-knowledge-architecture.md) - Core security concepts
