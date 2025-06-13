# Security Documentation - NeuralLog MCP Client

## Overview

The NeuralLog MCP Client implements comprehensive security measures to ensure secure communication with the NeuralLog platform. This document outlines the security features, best practices, and configuration requirements.

## Security Features

### 1. Authentication & Authorization

- **Machine-to-Machine (M2M) Authentication**: Uses OAuth2 client credentials flow
- **JWT Token Management**: Automatic token refresh with 5-minute buffer
- **Tenant-based Access Control**: Multi-tenant support with tenant ID validation
- **Custom Error Handling**: Specific error types for different failure scenarios

### 2. Secrets Management

- **Environment Variable Configuration**: No hardcoded credentials
- **Configuration Validation**: Input sanitization and format validation
- **Secure Defaults**: Minimum security requirements enforced
- **Secrets Exclusion**: Sensitive data excluded from logs and version control

### 3. Network Security

- **HTTPS Enforcement**: Only secure protocols allowed
- **Request Timeouts**: Configurable timeouts to prevent hanging connections
- **User-Agent Headers**: Proper client identification
- **Error Handling**: Comprehensive error classification and handling

### 4. Container Security

- **Non-root User**: Docker containers run as unprivileged user
- **Minimal Attack Surface**: Production-only dependencies
- **Health Checks**: Container health monitoring
- **Proper File Permissions**: Secure file system permissions

## Configuration

### Required Environment Variables

```bash
# Server URLs (HTTPS recommended for production)
WEB_SERVER_URL=https://your-neurallog-instance.com
AUTH_SERVICE_URL=https://your-auth-service.com

# Authentication Credentials
AUTH_CLIENT_ID=your-m2m-client-id
AUTH_CLIENT_SECRET=your-m2m-client-secret-minimum-32-chars
TENANT_ID=your-tenant-id

# Optional Configuration
LOG_LEVEL=INFO
REQUEST_TIMEOUT=30000
MAX_RETRIES=3
```

### Security Requirements

1. **Client Secret**: Must be at least 32 characters long
2. **URLs**: Must use HTTPS in production
3. **Client ID**: Alphanumeric characters, hyphens, and underscores only
4. **Tenant ID**: Alphanumeric characters, hyphens, and underscores only

## Error Handling

The client implements specific error types for better security and debugging:

### AuthConfigError
- **When**: Invalid credentials, malformed client ID
- **Retryable**: No
- **Action**: Fix configuration

### AuthNetworkError
- **When**: Network connectivity issues, DNS failures
- **Retryable**: Yes
- **Action**: Check network connectivity

### AuthServiceError
- **When**: Auth service errors, invalid responses
- **Retryable**: Depends on error type
- **Action**: Check service status

### AuthTokenExpiredError
- **When**: Token has expired
- **Retryable**: Yes
- **Action**: Automatic token refresh

### AuthRateLimitError
- **When**: Too many authentication requests
- **Retryable**: Yes (with delay)
- **Action**: Implement exponential backoff

## Security Best Practices

### Development

1. **Never commit `.env` files** to version control
2. **Use `.env.example`** for configuration templates
3. **Rotate credentials regularly** in all environments
4. **Use different credentials** for different environments
5. **Run security audits** before deployment

### Production

1. **Use HTTPS only** for all communications
2. **Implement proper logging** without exposing secrets
3. **Monitor authentication failures** for security incidents
4. **Set up alerts** for repeated authentication failures
5. **Use secrets management services** (e.g., HashiCorp Vault, AWS Secrets Manager)

### Container Deployment

1. **Scan images** for vulnerabilities before deployment
2. **Use minimal base images** (Alpine, distroless)
3. **Run as non-root user** always
4. **Implement resource limits** to prevent DoS
5. **Use read-only file systems** where possible

## Security Audit

Run the built-in security audit:

```bash
npm run security:check
```

This will check for:
- Hardcoded secrets in source code
- Insecure file permissions
- Missing environment variables
- Dependency vulnerabilities

## Incident Response

### Authentication Failures

1. **Check credentials** are correct and not expired
2. **Verify network connectivity** to auth service
3. **Check auth service status** and logs
4. **Review rate limiting** if applicable
5. **Rotate credentials** if compromise suspected

### Security Incidents

1. **Immediately rotate** all affected credentials
2. **Review logs** for unauthorized access attempts
3. **Check for** data exfiltration or unauthorized operations
4. **Update security measures** based on incident analysis
5. **Document lessons learned** and update procedures

## Compliance

This implementation follows:
- **OWASP Security Guidelines**
- **OAuth2 Security Best Practices**
- **Zero-Trust Architecture Principles**
- **Defense in Depth Strategy**

## Contact

For security issues or questions:
- Create a security issue in the repository
- Follow responsible disclosure practices
- Include detailed reproduction steps
- Do not include sensitive information in public issues
