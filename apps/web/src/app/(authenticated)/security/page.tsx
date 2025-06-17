'use client';

import React, { useState } from 'react';
import { 
  FiShield, FiLock, FiKey, FiEye, FiAlertTriangle, FiCheckCircle, 
  FiClock, FiActivity, FiUsers, FiServer, FiRefreshCw, FiDownload 
} from 'react-icons/fi';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor security events, encryption status, and compliance metrics.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FiDownload className="w-4 h-4 mr-2" />
            Security Report
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Security Score', 
            value: '98%', 
            icon: FiShield, 
            color: 'text-green-600',
            status: 'Excellent',
            statusColor: 'text-green-600'
          },
          { 
            label: 'Encryption Status', 
            value: 'Active', 
            icon: FiLock, 
            color: 'text-blue-600',
            status: 'Zero-Knowledge',
            statusColor: 'text-blue-600'
          },
          { 
            label: 'Active Sessions', 
            value: '24', 
            icon: FiUsers, 
            color: 'text-purple-600',
            status: 'Normal',
            statusColor: 'text-green-600'
          },
          { 
            label: 'Threats Blocked', 
            value: '3', 
            icon: FiAlertTriangle, 
            color: 'text-orange-600',
            status: 'Last 24h',
            statusColor: 'text-gray-500'
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className={`text-xs font-medium ${stat.statusColor}`}>
                  {stat.status}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zero-Knowledge Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FiLock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
              Zero-Knowledge Encryption Active
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              All data is encrypted client-side with your keys. NeuralLog servers cannot access your plaintext data.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FiCheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Verified</span>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            standard: 'GDPR', 
            status: 'Compliant', 
            score: '100%',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
          },
          { 
            standard: 'SOC 2 Type II', 
            status: 'In Progress', 
            score: '85%',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
          },
          { 
            standard: 'HIPAA', 
            status: 'Ready', 
            score: '95%',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
          }
        ].map((compliance, index) => (
          <div key={index} className={`${compliance.bgColor} border border-gray-200 dark:border-gray-700 rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                {compliance.standard}
              </h4>
              <FiCheckCircle className={`w-6 h-6 ${compliance.color}`} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Status:</span>
                <span className={`font-medium ${compliance.color}`}>{compliance.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Score:</span>
                <span className={`font-medium ${compliance.color}`}>{compliance.score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
