---
sidebar_position: 5
---

# Python SDK

The NeuralLog Python SDK provides a Pythonic interface for integrating zero-knowledge logging into Python applications.

## Installation

Install the NeuralLog Python SDK via pip:

```bash
pip install neurallog-client-sdk
```

### Development Installation

```bash
pip install neurallog-client-sdk[dev]
```

## Quick Start

```python
from neurallog import NeuralLogClient
from datetime import datetime, timezone

# Initialize the client
client = NeuralLogClient(
    api_key="your-api-key",
    base_url="https://api.neurallog.com"
)

# Create a log
await client.logs.create_log(
    log_type="application-logs",
    data={
        "level": "info",
        "message": "Application started successfully",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
)
```

## Documentation Status

This SDK is currently in development. For more information about the implementation roadmap, see the [Python SDK Development Guide](../../development/python-sdk-development.md).

## Features

- Async/await support with asyncio
- Type hints and mypy compatibility
- Integration with Python's standard logging module
- Client-side encryption
- Zero-knowledge architecture
- Python 3.8+ support

## Integration with Python Logging

```python
import logging
from neurallog.handlers import NeuralLogHandler

# Configure logging
handler = NeuralLogHandler(
    api_key="your-api-key",
    log_type="application-logs"
)

logger = logging.getLogger(__name__)
logger.addHandler(handler)

# Now standard logging calls will be sent to NeuralLog
logger.info("This will be encrypted and sent to NeuralLog")
```

## Examples

Coming soon - comprehensive examples and integration guides.
