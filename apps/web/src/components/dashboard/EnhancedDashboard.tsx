'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FiCpu, FiShield, FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle,
  FiActivity, FiEye, FiBarChart, FiLock, FiUsers, FiServer, FiArrowRight
} from 'react-icons/fi';

interface QuickStat {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  href?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  isNew?: boolean;
}

const quickStats: QuickStat[] = [
  {
    label: 'AI Agents Active',
    value: '2',
    change: 100,
    trend: 'up',
    icon: FiCpu,
    color: 'text-blue-600',
    href: '/ai-agents'
  },
  {
    label: 'Security Score',
    value: '98%',
    change: 2,
    trend: 'up',
    icon: FiShield,
    color: 'text-green-600',
    href: '/security'
  },
  {
    label: 'Log Entries Today',
    value: '24.7K',
    change: 15,
    trend: 'up',
    icon: FiActivity,
    color: 'text-purple-600',
    href: '/logs'
  },
  {
    label: 'Error Rate',
    value: '0.8%',
    change: -12,
    trend: 'down',
    icon: FiAlertTriangle,
    color: 'text-orange-600',
    href: '/analytics'
  }
];

const quickActions: QuickAction[] = [
  {
    title: 'Connect AI Agent',
    description: 'Set up Claude Desktop or custom AI agent integration',
    icon: FiCpu,
    href: '/ai-agents',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    isNew: true
  },
  {
    title: 'View AI Insights',
    description: 'See AI-powered analysis and recommendations',
    icon: FiZap,
    href: '/ai-insights',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    isNew: true
  },
  {
    title: 'Security Dashboard',
    description: 'Monitor encryption status and security events',
    icon: FiShield,
    href: '/security',
    color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
  },
  {
    title: 'Analytics',
    description: 'View comprehensive analytics and custom metrics',
    icon: FiBarChart3,
    href: '/analytics',
    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  }
];

export function EnhancedDashboard() {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <FiTrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <FiTrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable':
        return <FiActivity className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable', change?: number) => {
    if (!trend || !change) return 'text-gray-600';
    if (trend === 'stable') return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section with AI Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiZap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                AI-Powered Telemetry Platform
              </h2>
              <p className="text-blue-700 dark:text-blue-300">
                Your zero-knowledge telemetry platform with intelligent AI analysis is ready.
              </p>
            </div>
          </div>
          <Link
            href="/ai-agents"
            className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/70"
          >
            Setup AI Agent
            <FiArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Link key={index} href={stat.href || '#'} className="block">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  {stat.change && stat.trend && (
                    <div className="flex items-center mt-2">
                      {getTrendIcon(stat.trend)}
                      <span className={`ml-1 text-sm font-medium ${getTrendColor(stat.trend, stat.change)}`}>
                        {stat.change > 0 ? '+' : ''}{stat.change}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="block">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  {action.isNew && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                      NEW
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                component: 'Zero-Knowledge Encryption',
                status: 'Operational',
                icon: FiLock,
                color: 'text-green-600',
                bgColor: 'bg-green-50 dark:bg-green-900/20'
              },
              {
                component: 'AI Agent Integration',
                status: 'Active',
                icon: FiCpu,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20'
              },
              {
                component: 'Real-time Analytics',
                status: 'Operational',
                icon: FiActivity,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20'
              }
            ].map((component, index) => (
              <div key={index} className={`${component.bgColor} border border-gray-200 dark:border-gray-700 rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <component.icon className={`w-5 h-5 ${component.color} mr-3`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {component.component}
                      </p>
                      <p className={`text-xs ${component.color}`}>
                        {component.status}
                      </p>
                    </div>
                  </div>
                  <FiCheckCircle className={`w-5 h-5 ${component.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
            <Link href="/logs" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 text-sm font-medium">
              View all logs
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                type: 'ai',
                message: 'AI agent analyzed error patterns and found 3 critical issues',
                time: '2 minutes ago',
                icon: FiZap,
                color: 'text-purple-600'
              },
              {
                type: 'security',
                message: 'Security scan completed - no vulnerabilities detected',
                time: '15 minutes ago',
                icon: FiShield,
                color: 'text-green-600'
              },
              {
                type: 'user',
                message: 'New user registered and completed onboarding',
                time: '1 hour ago',
                icon: FiUsers,
                color: 'text-blue-600'
              },
              {
                type: 'system',
                message: 'Database backup completed successfully',
                time: '2 hours ago',
                icon: FiServer,
                color: 'text-gray-600'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-1 rounded ${activity.color.replace('text-', 'bg-').replace('600', '100')} dark:bg-gray-700`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
