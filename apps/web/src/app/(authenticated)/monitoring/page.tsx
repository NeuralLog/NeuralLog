'use client';

import React, { useState } from 'react';
import { FiEye, FiActivity, FiPause, FiPlay, FiRefreshCw } from 'react-icons/fi';

export default function MonitoringPage() {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Real-time Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor your system metrics and events in real-time with live updates.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isLive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLive ? (
              <>
                <FiPause className="w-4 h-4 mr-2" />
                Pause Live Updates
              </>
            ) : (
              <>
                <FiPlay className="w-4 h-4 mr-2" />
                Resume Live Updates
              </>
            )}
          </button>
        </div>
      </div>

      <div className={`border rounded-lg p-4 ${
        isLive 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className={`text-sm font-medium ${
            isLive 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {isLive ? 'Live monitoring active' : 'Live monitoring paused'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Logs per Second', value: 45, unit: '/sec', icon: FiActivity },
          { name: 'Error Rate', value: 2.3, unit: '%', icon: FiActivity },
          { name: 'Response Time', value: 156, unit: 'ms', icon: FiActivity },
          { name: 'Active Users', value: 1247, unit: '', icon: FiEye }
        ].map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {metric.name}
              </h3>
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
              <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                {metric.unit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
