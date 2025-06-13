'use client';

import React, { useState } from 'react';
import { 
  FiZap, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiClock, 
  FiBarChart3, FiEye, FiTarget, FiRefreshCw, FiDownload, FiFilter 
} from 'react-icons/fi';

interface Insight {
  id: string;
  type: 'anomaly' | 'pattern' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: string;
  source: string;
  actionable: boolean;
  tags: string[];
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'anomaly',
    title: 'Unusual Error Rate Spike',
    description: 'Database connection errors increased by 340% in the last hour, primarily affecting user authentication flows.',
    severity: 'critical',
    confidence: 95,
    timestamp: '5 minutes ago',
    source: 'Claude Desktop',
    actionable: true,
    tags: ['database', 'authentication', 'errors']
  },
  {
    id: '2',
    type: 'pattern',
    title: 'Weekly Performance Pattern Detected',
    description: 'API response times consistently degrade every Tuesday between 2-4 PM, likely due to scheduled maintenance tasks.',
    severity: 'medium',
    confidence: 87,
    timestamp: '1 hour ago',
    source: 'Custom Analytics Agent',
    actionable: true,
    tags: ['performance', 'api', 'scheduling']
  }
];

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>(mockInsights);

  const getSeverityColor = (severity: Insight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: Insight['type']) => {
    switch (type) {
      case 'anomaly':
        return <FiAlertTriangle className="w-5 h-5" />;
      case 'pattern':
        return <FiTrendingUp className="w-5 h-5" />;
      case 'prediction':
        return <FiTarget className="w-5 h-5" />;
      case 'recommendation':
        return <FiCheckCircle className="w-5 h-5" />;
      default:
        return <FiZap className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            AI-powered analysis, predictions, and recommendations for your telemetry data.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FiDownload className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh Insights
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Insights', value: insights.length.toString(), icon: FiZap, color: 'text-blue-600' },
          { label: 'Critical Issues', value: insights.filter(i => i.severity === 'critical').length.toString(), icon: FiAlertTriangle, color: 'text-red-600' },
          { label: 'Actionable Items', value: insights.filter(i => i.actionable).length.toString(), icon: FiTarget, color: 'text-green-600' },
          { label: 'Avg Confidence', value: `${Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%`, icon: FiBarChart3, color: 'text-purple-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                  {getTypeIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(insight.severity)}`}>
                      {insight.severity}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 capitalize">
                      {insight.type}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {insight.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <FiEye className="w-4 h-4 mr-1" />
                      Confidence: {insight.confidence}%
                    </div>
                    <div className="flex items-center">
                      <FiClock className="w-4 h-4 mr-1" />
                      {insight.timestamp}
                    </div>
                    <div className="flex items-center">
                      <FiZap className="w-4 h-4 mr-1" />
                      {insight.source}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {insight.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {insight.actionable && (
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700">
                    Take Action
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
