# NeuralLog: Hosted vs. Self-Hosted

## Choose the Deployment That Fits Your Needs

NeuralLog offers two deployment options: NeuralLog Cloud (hosted) and Self-Hosted NeuralLog. Both provide the same zero-knowledge security guarantees and feature set, but with different operational models. This guide helps you understand the differences and choose the right option for your organization.

## Same Security, Different Operations

The most important thing to understand is that both deployment options provide identical security guarantees:

- **Client-Side Encryption**: All encryption happens on your systems
- **Zero Server Knowledge**: Servers never possess keys or plaintext data
- **End-to-End Protection**: Complete privacy from data generation to viewing
- **Mathematical Guarantees**: Security based on cryptographic principles, not trust

The difference is not in security, but in who operates the infrastructure and how you pay for it.

## NeuralLog Cloud: Fully Managed Service

NeuralLog Cloud is our fully managed service where we handle all infrastructure, scaling, and maintenance.

### Key Benefits

- **Zero Operational Overhead**: We manage everything behind the scenes
- **Instant Setup**: Get started in minutes, not days or weeks
- **Automatic Updates**: Always on the latest version with no effort
- **Global Availability**: Deploy in 20+ regions worldwide
- **Guaranteed Uptime**: SLAs up to 99.99% availability
- **Predictable Costs**: Simple subscription model with no surprises

### Ideal For

- Organizations that want to focus on their core business
- Teams with limited infrastructure expertise
- Projects that need to get started quickly
- Global operations requiring multi-region presence
- Organizations with predictable logging needs

### Pricing Model

- **Free Developer Tier**:
  - 5GB storage
  - 10GB monthly ingestion
  - 30-day retention
  - No credit card required

- **Free Open Source Tier**:
  - 25GB storage
  - 50GB monthly ingestion
  - 90-day retention
  - Priority support

- **Production Tier**:
  - $49/month base price
  - 50GB storage included
  - 100GB monthly ingestion included
  - Additional storage: $0.05/GB/month
  - Additional ingestion: $0.20/GB beyond monthly allowance
  - Volume discounts available

## Self-Hosted NeuralLog: Complete Control

Self-Hosted NeuralLog gives you complete control over your environment, running on your own infrastructure.

### Key Benefits

- **Complete Control**: Your data, your infrastructure, your rules
- **Data Locality**: Keep everything within your network boundaries
- **Cost Control**: Optimize infrastructure for your specific needs
- **Integration Flexibility**: Direct integration with internal systems
- **Customization Options**: Modify and extend as needed
- **Air-Gap Support**: Run in completely isolated environments

### Ideal For

- Organizations with strict data locality requirements
- Teams with existing infrastructure and operations expertise
- Security-conscious organizations that need complete control
- Regulated industries with specific compliance requirements
- Organizations with unique integration or customization needs

### Operational Considerations

- **Infrastructure Management**: You provide and manage the servers
- **Scaling Responsibility**: You handle scaling for increased load
- **Update Management**: You control when and how to update
- **Monitoring & Alerting**: You set up monitoring and alerting
- **Backup & Recovery**: You implement backup and recovery procedures

### Support Options

- **Community Support**: Free via GitHub and community forums
- **Professional Support**: Starting at $499/month
- **Enterprise Support**: Custom SLAs and dedicated support team

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

## Hybrid Approaches

Many organizations choose a hybrid approach:

1. **Development in Cloud, Production Self-Hosted**: Use NeuralLog Cloud for development and testing, self-hosted for production
2. **Geographic Mix**: Use NeuralLog Cloud in some regions, self-hosted in others
3. **Gradual Migration**: Start with NeuralLog Cloud and migrate to self-hosted as needs evolve
4. **Workload Split**: Critical workloads self-hosted, others in NeuralLog Cloud

## Making the Right Choice

### Choose NeuralLog Cloud If:

- You want to get started quickly with minimal setup
- You prefer operational simplicity and managed services
- You want predictable costs with minimal operational overhead
- You need guaranteed SLAs and support
- You have limited infrastructure expertise or resources

### Choose Self-Hosted NeuralLog If:

- You require complete control over infrastructure and networking
- You have strict data locality or air-gapped requirements
- You have a specialized compliance regime not covered by our certifications
- You have existing infrastructure and operations teams
- You need deep customization or integration with internal systems

## Migration Between Options

We provide tools and support for migrating between deployment options:

1. **Cloud to Self-Hosted**: Tools to export data and configurations
2. **Self-Hosted to Cloud**: Migration utilities for seamless transition
3. **Hybrid Operation**: Tools for synchronizing between environments

## Getting Started

### NeuralLog Cloud

1. Sign up at [neurallog.com](https://neurallog.com)
2. Create your tenant
3. Generate API keys
4. Integrate the SDK into your applications

### Self-Hosted NeuralLog

1. Download Docker images or Kubernetes manifests
2. Deploy to your infrastructure
3. Configure and integrate with your applications
4. Set up monitoring and backup procedures

## Conclusion

Both NeuralLog Cloud and Self-Hosted NeuralLog provide the same zero-knowledge security guarantees and feature set. The choice between them depends on your specific operational requirements, compliance needs, and organizational preferences.

Regardless of which option you choose, you'll benefit from NeuralLog's revolutionary zero-knowledge architecture and powerful AI integration capabilities.
