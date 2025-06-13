---
sidebar_position: 4
---

# C# SDK

The NeuralLog C# SDK provides a modern, async-first client for integrating zero-knowledge logging into .NET applications.

## Installation

Install the NeuralLog C# SDK via NuGet:

### Package Manager Console

```powershell
Install-Package NeuralLog.Client.Sdk
```

### .NET CLI

```bash
dotnet add package NeuralLog.Client.Sdk
```

### PackageReference

```xml
<PackageReference Include="NeuralLog.Client.Sdk" Version="1.0.0" />
```

## Quick Start

```csharp
using NeuralLog.Client;
using NeuralLog.Client.Configuration;

// Initialize the client
var config = new NeuralLogConfiguration
{
    ApiKey = "your-api-key",
    BaseUrl = "https://api.neurallog.com"
};

var client = new NeuralLogClient(config);

// Create a log
await client.Logs.CreateLogAsync("application-logs", new
{
    Level = "info",
    Message = "Application started successfully",
    Timestamp = DateTimeOffset.UtcNow
});
```

## Documentation Status

This SDK is currently in development. For more information about the implementation roadmap, see the [C# SDK Development Guide](../../development/csharp-sdk-development.md).

## Features

- Modern async/await patterns
- Strongly-typed API
- Integration with Microsoft.Extensions.Logging
- Client-side encryption
- Zero-knowledge architecture
- .NET Core and .NET Framework support

## Examples

Coming soon - comprehensive examples and integration guides.
