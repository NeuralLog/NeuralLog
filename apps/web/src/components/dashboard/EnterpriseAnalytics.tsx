'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  Users,
  Activity
} from 'lucide-react';

interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface SecurityStatus {
  encryption: 'active' | 'inactive';
  compliance: 'compliant' | 'warning' | 'error';
  keyRotation: 'current' | 'due' | 'overdue';
  auditLogs: number;
}

export const EnterpriseAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock analytics data - in real app, this would come from API
  const analyticsMetrics: AnalyticsMetric[] = [
    {
      label: 'Log Volume',
      value: '2.4M',
      change: '+12.5%',
      trend: 'up',
      icon: <Database className="h-4 w-4" />
    },
    {
      label: 'Query Response Time',
      value: '45ms',
      change: '-8.2%',
      trend: 'down',
      icon: <Zap className="h-4 w-4" />
    },
    {
      label: 'Active Users',
      value: '127',
      change: '+5.1%',
      trend: 'up',
      icon: <Users className="h-4 w-4" />
    },
    {
      label: 'System Uptime',
      value: '99.97%',
      change: '+0.02%',
      trend: 'up',
      icon: <Activity className="h-4 w-4" />
    }
  ];

  const securityStatus: SecurityStatus = {
    encryption: 'active',
    compliance: 'compliant',
    keyRotation: 'current',
    auditLogs: 1247
  };

  const recentAlerts = [
    {
      id: 1,
      type: 'info',
      title: 'Anomaly Detected',
      description: 'Unusual pattern detected in user authentication logs',
      timestamp: '2 minutes ago',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'success',
      title: 'Key Rotation Complete',
      description: 'Encryption keys successfully rotated for tenant-prod',
      timestamp: '1 hour ago',
      severity: 'low'
    },
    {
      id: 3,
      type: 'warning',
      title: 'High Query Volume',
      description: 'Query volume 25% above normal for the past hour',
      timestamp: '3 hours ago',
      severity: 'medium'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enterprise Analytics</h2>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {metric.icon}
                  <span className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </span>
                </div>
                <Badge variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'secondary' : 'outline'}>
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{metric.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Log Volume Trends</CardTitle>
                <CardDescription>
                  Log ingestion over the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart visualization would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
                <CardDescription>
                  Average response times and throughput
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Response Time</span>
                      <span>45ms</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Query Success Rate</span>
                      <span>99.8%</span>
                    </div>
                    <Progress value={99.8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Throughput</span>
                      <span>1.2K/sec</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Zero-Knowledge Encryption</span>
                  <Badge variant={securityStatus.encryption === 'active' ? 'default' : 'destructive'}>
                    {securityStatus.encryption === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compliance Status</span>
                  <Badge variant={securityStatus.compliance === 'compliant' ? 'default' : 'destructive'}>
                    {securityStatus.compliance === 'compliant' ? 'Compliant' : 'Issues Found'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Key Rotation</span>
                  <Badge variant={securityStatus.keyRotation === 'current' ? 'default' : 'secondary'}>
                    {securityStatus.keyRotation === 'current' ? 'Current' : 'Due'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit Logs</span>
                  <span className="font-medium">{securityStatus.auditLogs.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
                <CardDescription>
                  Current compliance status and requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">SOC 2 Type II Ready</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">GDPR Compliant Architecture</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">HIPAA Certification In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Zero-Knowledge Architecture</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
              <CardDescription>
                Real-time performance monitoring and optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Performance charts would appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Including CPU, memory, network, and query performance metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                System alerts and anomaly detections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <Alert key={alert.id} className={
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    alert.type === 'success' ? 'border-green-200 bg-green-50' :
                    'border-blue-200 bg-blue-50'
                  }>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{alert.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.timestamp}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      {alert.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
