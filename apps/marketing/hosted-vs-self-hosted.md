# NeuralLog: Hosted vs. Self-Hosted

NeuralLog offers two deployment options: NeuralLog Cloud (hosted) and Self-Hosted NeuralLog. Both provide the same zero-knowledge security guarantees and feature set, but with different operational models. This document helps you understand the differences and choose the right option for your organization.

## Deployment Options Overview

### NeuralLog Cloud

NeuralLog Cloud is our fully managed service:

- **Fully Managed**: We handle infrastructure, scaling, and maintenance
- **Global Availability**: Deploy in regions worldwide
- **Enterprise SLAs**: 99.99% uptime guarantee for enterprise plans
- **Dedicated Tenants**: Complete isolation for enterprise customers

### Self-Hosted NeuralLog

Self-Hosted NeuralLog gives you complete control:

- **Docker Containers**: Easy deployment with Docker and Kubernetes
- **On-Premises**: Keep everything within your network
- **Air-Gapped**: Support for completely disconnected environments
- **Hybrid Options**: Mix cloud and self-hosted components

## Equal Security Guarantees

Both deployment options provide the same zero-knowledge security:

### Client-Side Encryption

In both models, all encryption happens on your systems:

1. **Log Encryption**: Logs are encrypted before leaving your systems
2. **Key Management**: Encryption keys never leave your control
3. **Zero Server Knowledge**: Servers never possess keys or plaintext data

### Same Codebase

Both options use the same core codebase:

1. **Identical SDKs**: The same client libraries power both options
2. **Same Security Architecture**: Identical zero-knowledge protocols
3. **Feature Parity**: All security features available in both models

## Detailed Comparison

| Feature | NeuralLog Cloud | Self-Hosted |
|---------|----------------|-------------|
| **Setup & Maintenance** |
| Initial Setup Time | Minutes | Hours to days |
| Infrastructure Management | Fully managed | Self-managed |
| Updates & Patches | Automatic | Manual or CI/CD |
| Scaling | Automatic | Manual or K8s |
| Monitoring | Built-in | Self-implemented |
| **Performance & Reliability** |
| Geographic Distribution | 20+ regions | DIY |
| High Availability | Built-in | Self-implemented |
| Disaster Recovery | Built-in | Self-implemented |
| SLA | Up to 99.99% | DIY |
| **Security** |
| Zero-Knowledge Architecture | ✓ | ✓ |
| End-to-End Encryption | ✓ | ✓ |
| Infrastructure Security | Our responsibility | Your responsibility |
| Network Security | Our responsibility | Your responsibility |
| **Compliance** |
| SOC 2 | ✓ | Depends on implementation |
| HIPAA | ✓ | Depends on implementation |
| GDPR | ✓ | Depends on implementation |
| Custom Compliance | Limited customization | Full customization |
| **Cost Model** |
| Payment Structure | Subscription | Infrastructure + licenses |
| Scaling Costs | Pay as you grow | Infrastructure costs |
| Operational Overhead | Minimal | Significant |
| Total Cost of Ownership | Predictable | Variable |
| **Control & Customization** |
| Infrastructure Control | Limited | Complete |
| Network Control | Limited | Complete |
| Custom Integrations | API-based | Direct access |
| Customization | Configuration only | Code-level possible |

## Benefits of NeuralLog Cloud

### 1. Faster Time to Value

- **Immediate Setup**: Get started in minutes, not days or weeks
- **No Infrastructure Work**: Skip complex infrastructure setup
- **Automatic Updates**: Always on the latest version with no effort
- **Built-in Best Practices**: Optimized configuration out of the box

### 2. Reduced Operational Burden

- **No Infrastructure Management**: Focus on your core business
- **Automatic Scaling**: Handles traffic spikes without intervention
- **24/7 Monitoring**: Our team monitors the service around the clock
- **Guaranteed Uptime**: SLAs up to 99.99% availability

### 3. Predictable Costs

- **Subscription Model**: Predictable monthly or annual costs
- **No Hidden Expenses**: No surprise infrastructure costs
- **Efficient Resource Usage**: Pay only for what you use
- **Reduced Personnel Costs**: No dedicated operations team needed

### 4. Enterprise-Grade Security

- **Security Experts**: Our team of security professionals manages the infrastructure
- **Regular Audits**: Continuous security testing and audits
- **Immediate Patching**: Security updates applied immediately
- **Compliance Certifications**: SOC 2, HIPAA, GDPR compliance

## Benefits of Self-Hosted NeuralLog

### 1. Complete Control

- **Infrastructure Control**: Choose your own infrastructure provider
- **Network Control**: Keep everything within your network boundaries
- **Customization**: Modify and extend as needed
- **Integration**: Direct integration with internal systems

### 2. Data Locality

- **Geographic Control**: Keep data in specific jurisdictions
- **Air-Gapped Environments**: Run in completely isolated networks
- **Physical Security**: Control the physical location of servers
- **Custom Data Policies**: Implement custom data handling policies

### 3. Compliance Flexibility

- **Custom Compliance**: Meet specific regulatory requirements
- **Audit Control**: Direct access for auditors
- **Documentation Control**: Custom documentation for compliance
- **Policy Enforcement**: Enforce organization-specific policies

### 4. Cost Control for Large Scale

- **Infrastructure Optimization**: Optimize for your specific workloads
- **Resource Sharing**: Share infrastructure with other systems
- **License Efficiency**: Optimize license usage for large deployments
- **Long-term Cost Control**: Potential savings at very large scale

## Choosing the Right Option

### NeuralLog Cloud is ideal if:

- You want to get started quickly with minimal setup
- You prefer operational simplicity and managed services
- You want predictable costs with minimal operational overhead
- You need guaranteed SLAs and support

### Self-Hosted NeuralLog is ideal if:

- You require complete control over infrastructure and networking
- You have strict data locality or air-gapped requirements
- You have a specialized compliance regime not covered by our certifications
- You have existing infrastructure and operations teams

## Hybrid Approaches

Many organizations choose a hybrid approach:

1. **Development in Cloud, Production Self-Hosted**: Use NeuralLog Cloud for development and testing, self-hosted for production
2. **Geographic Mix**: Use NeuralLog Cloud in some regions, self-hosted in others
3. **Gradual Migration**: Start with NeuralLog Cloud and migrate to self-hosted as needs evolve
4. **Workload Split**: Critical workloads self-hosted, others in NeuralLog Cloud

## Getting Started

### NeuralLog Cloud

1. Sign up at [neurallog.com](https://neurallog.com)
2. Create your tenant
3. Generate API keys
4. Integrate the SDK into your applications

### Self-Hosted NeuralLog

1. Request self-hosted license at [neurallog.com/self-hosted](https://neurallog.com/self-hosted)
2. Download Docker images or Kubernetes manifests
3. Deploy to your infrastructure
4. Configure and integrate with your applications

## Migration Between Options

We provide tools and support for migrating between deployment options:

1. **Cloud to Self-Hosted**: Tools to export data and configurations
2. **Self-Hosted to Cloud**: Migration utilities for seamless transition
3. **Hybrid Operation**: Tools for synchronizing between environments

## Conclusion

Both NeuralLog Cloud and Self-Hosted NeuralLog provide the same zero-knowledge security guarantees and feature set. The choice between them depends on your specific operational requirements, compliance needs, and organizational preferences.

Regardless of which option you choose, you'll benefit from NeuralLog's revolutionary zero-knowledge architecture and powerful AI integration capabilities.
