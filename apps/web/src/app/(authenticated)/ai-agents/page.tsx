'use client';

import React, { useState } from 'react';
import { 
  FiCpu, FiPlus, FiSettings, FiActivity, FiCheckCircle, FiAlertCircle, 
  FiClock, FiZap, FiEye, FiRefreshCw, FiExternalLink, FiDownload 
} from 'react-icons/fi';

interface AIAgent {
  id: string;
  name: string;
  type: 'claude' | 'chatgpt' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastActivity: string;
  capabilities: string[];
}

const mockAgents: AIAgent[] = [
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    type: 'claude',
    status: 'connected',
    lastActivity: '2 minutes ago',
    capabilities: ['Log Analysis', 'Incident Response', 'Pattern Detection', 'Automated Alerts']
  },
  {
    id: 'custom-agent-1',
    name: 'Custom Analytics Agent',
    type: 'custom',
    status: 'disconnected',
    lastActivity: '1 hour ago',
    capabilities: ['Custom Metrics', 'Business Intelligence', 'Predictive Analytics']
  }
];

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents);

  const getStatusIcon = (status: AIAgent['status']) => {
    switch (status) {
      case 'connected':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <FiAlertCircle className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case 'configuring':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AIAgent['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'configuring':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agents</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage AI agents that can analyze your logs, respond to incidents, and provide intelligent insights.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
            <FiPlus className="w-4 h-4 mr-2" />
            Add AI Agent
          </button>
        </div>
      </div>

      {/* Quick Setup Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <FiZap className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
              Quick Setup: Claude Desktop Integration
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Connect Claude Desktop to your NeuralLog instance in just a few steps.
            </p>
            <div className="mt-4 flex space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/70">
                <FiDownload className="w-4 h-4 mr-2" />
                Download MCP Client
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/70">
                <FiExternalLink className="w-4 h-4 mr-2" />
                Setup Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
                  <FiCpu className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {agent.type} Agent
                  </p>
                </div>
              </div>
              {getStatusIcon(agent.status)}
            </div>

            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Capabilities:</p>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <FiActivity className="w-4 h-4 mr-1" />
                Last activity: {agent.lastActivity}
              </div>
              <button className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                <FiSettings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Agent Card */}
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-brand-400 dark:hover:border-brand-500 transition-colors cursor-pointer">
          <div className="text-center">
            <FiPlus className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Add New AI Agent
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect Claude Desktop, ChatGPT, or create a custom AI agent integration.
            </p>
          </div>
        </div>
      </div>

      {/* AI Agent Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Agents', value: '2', icon: FiCpu, color: 'text-blue-600' },
          { label: 'Actions Today', value: '47', icon: FiZap, color: 'text-green-600' },
          { label: 'Issues Resolved', value: '12', icon: FiCheckCircle, color: 'text-purple-600' },
          { label: 'Insights Generated', value: '8', icon: FiEye, color: 'text-orange-600' }
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
    </div>
  );
}
