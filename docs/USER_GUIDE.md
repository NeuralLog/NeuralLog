# 📖 NeuralLog User Guide

Complete guide for using the NeuralLog platform, from getting started to advanced features and best practices.

## 📋 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [📊 Dashboard Overview](#-dashboard-overview)
- [📝 Log Management](#-log-management)
- [🔍 Search & Query](#-search--query)
- [🤖 AI-Powered Analytics](#-ai-powered-analytics)
- [📈 Monitoring & Alerts](#-monitoring--alerts)
- [👥 Team Management](#-team-management)
- [💰 Billing & Usage](#-billing--usage)
- [🔧 Integrations](#-integrations)
- [📚 Best Practices](#-best-practices)

---

## 🚀 Getting Started

### 🎯 Welcome to NeuralLog

NeuralLog is an AI-powered logging and analytics platform that helps you monitor, analyze, and gain insights from your application logs in real-time.

#### Key Features
- **🤖 AI-Powered Analytics** - Intelligent log analysis and anomaly detection
- **⚡ Real-Time Monitoring** - Live log streaming and instant alerts
- **🔍 Advanced Search** - Powerful query capabilities with full-text search
- **📊 Custom Dashboards** - Personalized monitoring dashboards
- **🔒 Enterprise Security** - Zero-knowledge encryption and compliance
- **📈 Usage Analytics** - Detailed insights into your application performance

### 📝 Account Setup

#### Creating Your Account
1. **Sign Up**: Visit [neurallog.com](https://neurallog.com) and click "Get Started"
2. **Choose Plan**: Select from Starter ($29), Professional ($99), or Enterprise ($299)
3. **Verify Email**: Check your email and click the verification link
4. **Complete Setup**: Add your organization details and payment information

#### First Login
```bash
# Access your dashboard
https://app.neurallog.com

# Login credentials
Email: your-email@company.com
Password: your-secure-password
```

### 🔑 API Keys & Authentication

#### Generating API Keys
1. Navigate to **Settings** → **API Keys**
2. Click **"Generate New Key"**
3. Choose permissions: `logs:write`, `logs:read`, `analytics:read`
4. Copy and securely store your API key

#### SDK Installation
```bash
# JavaScript/Node.js
npm install @neurallog/sdk

# Python
pip install neurallog-sdk

# Go
go get github.com/neurallog/go-sdk
```

#### Quick Integration
```javascript
// JavaScript example
import { NeuralLogClient } from '@neurallog/sdk';

const client = new NeuralLogClient({
  apiKey: 'nl_live_1234567890abcdef',
  tenantId: 'your-company'
});

// Send your first log
await client.logs.create({
  level: 'info',
  message: 'Hello, NeuralLog!',
  source: 'my-app',
  metadata: {
    userId: '12345',
    feature: 'onboarding'
  }
});
```

---

## 📊 Dashboard Overview

### 🏠 Main Dashboard

The main dashboard provides a comprehensive overview of your logging activity and system health.

#### Key Sections
1. **📈 Overview Metrics**
   - Total logs today
   - Error rate
   - Top sources
   - Response times

2. **📊 Real-Time Activity**
   - Live log stream
   - Recent errors
   - System alerts
   - Performance metrics

3. **🎯 Quick Actions**
   - Search logs
   - Create alert
   - View analytics
   - Generate report

#### Customizing Your Dashboard
```bash
# Add custom widgets
1. Click "Customize Dashboard"
2. Select widget type (Chart, Table, Metric)
3. Configure data source and filters
4. Save and arrange widgets
```

### 📱 Mobile Dashboard

Access your logs on the go with our mobile-optimized dashboard:
- **Real-time alerts** via push notifications
- **Quick search** with voice input
- **Critical metrics** at a glance
- **Incident response** tools

---

## 📝 Log Management

### 📤 Sending Logs

#### Structured Logging Format
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "source": "api-server",
  "metadata": {
    "userId": "user_12345",
    "requestId": "req_abc123",
    "database": "primary",
    "retryCount": 3
  },
  "tags": ["database", "critical", "infrastructure"]
}
```

#### Log Levels
- **🔴 Fatal**: System is unusable
- **🟠 Error**: Error conditions that need attention
- **🟡 Warn**: Warning conditions
- **🔵 Info**: Informational messages
- **🟢 Debug**: Debug-level messages
- **⚪ Trace**: Very detailed debug information

#### Batch Ingestion
```javascript
// Send multiple logs efficiently
await client.logs.createBatch([
  {
    level: 'info',
    message: 'User login successful',
    metadata: { userId: '123' }
  },
  {
    level: 'warn',
    message: 'Slow database query',
    metadata: { queryTime: 2500 }
  }
]);
```

### 📋 Log Organization

#### Sources
Organize logs by application or service:
- `web-app` - Frontend application logs
- `api-server` - Backend API logs
- `worker` - Background job logs
- `database` - Database logs

#### Tags
Use tags for categorization:
- **Environment**: `production`, `staging`, `development`
- **Component**: `auth`, `billing`, `analytics`
- **Priority**: `critical`, `high`, `medium`, `low`

#### Metadata Best Practices
```javascript
// Good metadata structure
{
  "userId": "user_12345",
  "sessionId": "session_abc123",
  "requestId": "req_xyz789",
  "feature": "user-registration",
  "environment": "production",
  "version": "1.2.3"
}
```

---

## 🔍 Search & Query

### 🔎 Basic Search

#### Simple Text Search
```bash
# Search for specific terms
database error

# Search with quotes for exact phrases
"connection timeout"

# Search in specific fields
level:error source:api-server
```

#### Time Range Filters
- **Last 15 minutes** - Recent activity
- **Last hour** - Short-term analysis
- **Last 24 hours** - Daily overview
- **Last 7 days** - Weekly trends
- **Custom range** - Specific time periods

### 🔍 Advanced Search

#### Query Syntax
```bash
# Boolean operators
level:error AND source:api-server
level:warn OR level:error
NOT source:test-*

# Wildcards
message:database*
source:api-*

# Field existence
_exists_:userId
_missing_:requestId

# Numeric ranges
responseTime:[100 TO 500]
timestamp:[2024-01-15 TO 2024-01-16]
```

#### Saved Searches
1. Create complex queries
2. Save with descriptive names
3. Share with team members
4. Set up alerts on saved searches

### 📊 Query Builder

#### Visual Query Interface
1. **Select Fields**: Choose log fields to search
2. **Add Conditions**: Set filters and operators
3. **Combine Logic**: Use AND/OR operators
4. **Preview Results**: See query results in real-time
5. **Save Query**: Store for future use

#### Example Queries
```bash
# High-priority errors in production
level:error AND tags:critical AND environment:production

# Slow API responses
source:api-server AND responseTime:>1000

# User authentication issues
source:auth-service AND (message:*login* OR message:*authentication*)

# Database performance problems
source:database AND (level:warn OR level:error) AND queryTime:>500
```

---

## 🤖 AI-Powered Analytics

### 🧠 Intelligent Insights

#### Anomaly Detection
NeuralLog automatically detects unusual patterns in your logs:
- **Volume Spikes**: Sudden increases in log volume
- **Error Bursts**: Unusual error rate increases
- **Performance Degradation**: Response time anomalies
- **Pattern Changes**: Shifts in log patterns

#### Natural Language Queries
Ask questions about your logs in plain English:
```bash
# Example queries
"What caused the spike in errors yesterday?"
"Show me all database timeouts in the last week"
"Which users experienced login failures today?"
"What are the most common error messages?"
```

### 📈 Predictive Analytics

#### Trend Analysis
- **Growth Patterns**: Predict future log volume
- **Error Trends**: Forecast potential issues
- **Performance Trends**: Anticipate bottlenecks
- **Capacity Planning**: Resource requirement predictions

#### Smart Alerts
AI-powered alerts that learn from your patterns:
- **Adaptive Thresholds**: Automatically adjust based on historical data
- **Context-Aware**: Consider time of day, day of week patterns
- **Noise Reduction**: Filter out false positives
- **Priority Scoring**: Rank alerts by importance

### 🔍 Log Classification

#### Automatic Categorization
- **Error Types**: Classify errors by root cause
- **Severity Assessment**: Automatically assign severity levels
- **Component Mapping**: Link logs to system components
- **User Impact**: Assess customer-facing impact

#### Custom Models
Train custom AI models for your specific use cases:
1. **Upload Training Data**: Provide labeled examples
2. **Model Training**: AI learns your patterns
3. **Validation**: Test model accuracy
4. **Deployment**: Apply to live logs

---

## 📈 Monitoring & Alerts

### 🚨 Alert Configuration

#### Creating Alerts
1. **Define Condition**: Set trigger criteria
2. **Choose Threshold**: Specify limits
3. **Set Time Window**: Define evaluation period
4. **Configure Actions**: Email, Slack, webhook
5. **Test Alert**: Verify configuration

#### Alert Types
```yaml
# Volume-based alerts
- name: "High Error Rate"
  condition: "error_rate > 5%"
  window: "5 minutes"
  
- name: "Log Volume Spike"
  condition: "log_count > 1000/minute"
  window: "1 minute"

# Content-based alerts
- name: "Database Errors"
  condition: "level:error AND source:database"
  threshold: "> 10 occurrences"
  
- name: "Critical System Failures"
  condition: "tags:critical"
  threshold: "> 0 occurrences"
```

### 📊 Custom Dashboards

#### Dashboard Components
- **Time Series Charts**: Trends over time
- **Bar Charts**: Comparisons and distributions
- **Tables**: Detailed log listings
- **Metrics**: Key performance indicators
- **Maps**: Geographic data visualization

#### Creating Dashboards
```bash
# Dashboard configuration
1. Click "Create Dashboard"
2. Add panels (charts, tables, metrics)
3. Configure data sources and queries
4. Set refresh intervals
5. Share with team members
```

### 📱 Notification Channels

#### Supported Integrations
- **📧 Email**: Individual and group notifications
- **💬 Slack**: Channel and direct messages
- **📱 PagerDuty**: Incident management
- **🔗 Webhooks**: Custom integrations
- **📞 SMS**: Critical alerts only

#### Notification Rules
```yaml
# Escalation rules
- Level 1: Slack notification (immediate)
- Level 2: Email notification (5 minutes)
- Level 3: PagerDuty alert (15 minutes)
- Level 4: SMS notification (30 minutes)
```

---

## 👥 Team Management

### 👤 User Roles

#### Role Definitions
- **👑 Admin**: Full access to all features
- **🔧 Developer**: Log access and basic analytics
- **👀 Viewer**: Read-only access to logs and dashboards
- **📊 Analyst**: Analytics and reporting access
- **🚨 On-Call**: Alert management and incident response

#### Permission Matrix
| Feature | Admin | Developer | Viewer | Analyst | On-Call |
|---------|-------|-----------|--------|---------|---------|
| View Logs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Alerts | ✅ | ✅ | ❌ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Billing Access | ✅ | ❌ | ❌ | ❌ | ❌ |
| API Keys | ✅ | ✅ | ❌ | ✅ | ✅ |

### 🔐 Access Control

#### Inviting Team Members
1. Navigate to **Settings** → **Team**
2. Click **"Invite Member"**
3. Enter email and select role
4. Send invitation
5. Member receives email with setup link

#### Single Sign-On (SSO)
Enterprise plans include SSO integration:
- **SAML 2.0**: Okta, Azure AD, Google Workspace
- **OAuth 2.0**: GitHub, GitLab, Bitbucket
- **LDAP**: Active Directory integration

---

## 💰 Billing & Usage

### 📊 Usage Monitoring

#### Current Usage
View real-time usage metrics:
- **📝 Logs Ingested**: Current month total
- **💾 Storage Used**: Data retention usage
- **🤖 AI Queries**: Analytics requests
- **👥 Active Users**: Team member count

#### Usage Alerts
Set up notifications for usage thresholds:
```bash
# Example usage alerts
- 75% of monthly log limit reached
- 90% of storage quota used
- AI query limit approaching
- Overage charges detected
```

### 💳 Subscription Management

#### Plan Comparison
| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| **Logs/Month** | 100K | 1M | Unlimited |
| **Retention** | 30 days | 90 days | 1 year |
| **AI Queries** | 100 | 1K | Unlimited |
| **Team Size** | 5 | 25 | Unlimited |
| **Support** | Email | Priority | Dedicated |

#### Upgrading Your Plan
1. Go to **Settings** → **Billing**
2. Click **"Change Plan"**
3. Select new plan
4. Review changes and costs
5. Confirm upgrade

### 📈 Cost Optimization

#### Usage Best Practices
- **Log Filtering**: Send only necessary logs
- **Retention Policies**: Adjust based on compliance needs
- **Sampling**: Use sampling for high-volume applications
- **Compression**: Enable log compression
- **Archiving**: Move old logs to cheaper storage

---

## 🔧 Integrations

### 📚 SDK Integration

#### Popular Frameworks
```javascript
// Express.js middleware
const neurallog = require('@neurallog/express-middleware');
app.use(neurallog({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: process.env.NEURALLOG_TENANT_ID
}));

// Winston logger
const winston = require('winston');
const { NeuralLogTransport } = require('@neurallog/winston');

const logger = winston.createLogger({
  transports: [
    new NeuralLogTransport({
      apiKey: process.env.NEURALLOG_API_KEY
    })
  ]
});
```

### 🔗 Third-Party Integrations

#### Monitoring Tools
- **📊 Grafana**: Custom dashboards and alerts
- **📈 Datadog**: Metrics correlation
- **🔍 New Relic**: Performance monitoring
- **📱 PagerDuty**: Incident management

#### Development Tools
- **🐙 GitHub**: Deployment tracking
- **🦊 GitLab**: CI/CD integration
- **🔄 Jenkins**: Build log collection
- **☁️ AWS CloudWatch**: Infrastructure logs

#### Communication Platforms
- **💬 Slack**: Real-time notifications
- **👥 Microsoft Teams**: Team alerts
- **📧 Email**: Digest reports
- **📱 SMS**: Critical alerts

---

## 📚 Best Practices

### 🎯 Logging Best Practices

#### Structured Logging
```javascript
// Good: Structured with consistent fields
logger.info('User login successful', {
  userId: '12345',
  email: 'user@example.com',
  loginMethod: 'oauth',
  timestamp: new Date().toISOString()
});

// Avoid: Unstructured text
logger.info('User user@example.com logged in via oauth at 2024-01-15T10:30:00Z');
```

#### Log Levels Usage
- **Fatal**: System crashes, data corruption
- **Error**: Failed operations, exceptions
- **Warn**: Deprecated features, performance issues
- **Info**: Business events, user actions
- **Debug**: Development information
- **Trace**: Detailed execution flow

### 🔍 Search Optimization

#### Effective Queries
```bash
# Specific and targeted
level:error AND source:payment-service AND timestamp:[now-1h TO now]

# Avoid overly broad searches
error  # Too generic, will return too many results
```

#### Index Strategy
- **High-cardinality fields**: userId, requestId, sessionId
- **Low-cardinality fields**: level, source, environment
- **Full-text search**: message, error descriptions

### 📊 Dashboard Design

#### Dashboard Principles
1. **Purpose-Driven**: Each dashboard serves a specific role
2. **Audience-Aware**: Tailored to viewer needs
3. **Actionable**: Enables quick decision making
4. **Performance-Optimized**: Fast loading times
5. **Regularly Updated**: Keep content current

#### Layout Best Practices
- **Top-Left**: Most important metrics
- **Logical Flow**: Related information grouped
- **Consistent Timeframes**: Aligned time ranges
- **Clear Labels**: Descriptive titles and legends

### 🚨 Alert Strategy

#### Alert Fatigue Prevention
- **Meaningful Thresholds**: Based on business impact
- **Proper Escalation**: Right person, right time
- **Alert Grouping**: Combine related alerts
- **Regular Review**: Tune and optimize alerts

#### Incident Response
1. **Acknowledge**: Confirm alert receipt
2. **Assess**: Determine severity and impact
3. **Communicate**: Update stakeholders
4. **Resolve**: Fix the underlying issue
5. **Document**: Record lessons learned

---

## 🆘 Getting Help

### 📞 Support Channels

#### Self-Service Resources
- **📖 Documentation**: Comprehensive guides and tutorials
- **❓ FAQ**: Common questions and answers
- **🎥 Video Tutorials**: Step-by-step walkthroughs
- **💬 Community Forum**: User discussions and tips

#### Direct Support
- **📧 Email Support**: support@neurallog.com
- **💬 Live Chat**: Available during business hours
- **📞 Phone Support**: Enterprise customers only
- **🎫 Ticket System**: Track support requests

#### Response Times
| Plan | Email | Chat | Phone |
|------|-------|------|-------|
| **Starter** | 24 hours | ❌ | ❌ |
| **Professional** | 4 hours | ✅ | ❌ |
| **Enterprise** | 1 hour | ✅ | ✅ |

### 🎓 Training & Onboarding

#### Getting Started Program
- **Welcome Session**: Platform overview (30 min)
- **Hands-On Training**: Interactive tutorials (1 hour)
- **Best Practices Workshop**: Optimization techniques (1 hour)
- **Q&A Session**: Address specific questions (30 min)

#### Advanced Training
- **Custom Dashboards**: Advanced visualization techniques
- **AI Analytics**: Leveraging machine learning features
- **Integration Patterns**: Best practices for common integrations
- **Performance Optimization**: Scaling and efficiency tips

---

This user guide provides comprehensive coverage of the NeuralLog platform. For technical implementation details, see the [API Documentation](API.md) and [Developer Guide](DEVELOPER.md).
