'use client';

import React from 'react';
import { FiServer, FiCheckCircle, FiRefreshCw, FiDownload } from 'react-icons/fi';

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor system components, health checks, and performance metrics.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FiDownload className="w-4 h-4 mr-2" />
            Health Report
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
              All Systems Operational
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              All critical systems are running normally. Overall uptime: 99.8%
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">99.8%</p>
            <p className="text-sm text-green-700 dark:text-green-300">Uptime</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            component: 'Zero-Knowledge Encryption',
            status: 'Operational',
            uptime: '99.9%'
          },
          {
            component: 'AI Agent Integration',
            status: 'Active',
            uptime: '99.8%'
          },
          {
            component: 'Real-time Analytics',
            status: 'Operational',
            uptime: '99.7%'
          }
        ].map((component, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiServer className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {component.component}
                  </p>
                  <p className="text-xs text-green-600">
                    {component.status} • {component.uptime}
                  </p>
                </div>
              </div>
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
