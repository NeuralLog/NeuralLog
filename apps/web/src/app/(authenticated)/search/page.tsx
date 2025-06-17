'use client';

import React, { useState } from 'react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search & Query</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search across your encrypted logs with advanced filtering and real-time results.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FiDownload className="w-4 h-4 mr-2" />
            Export Results
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs... (e.g., 'error database timeout')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
            <FiSearch className="w-4 h-4 mr-2" />
            Search
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {['error', 'warn', 'info', 'last-hour', 'last-day'].map((filter) => (
            <button
              key={filter}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiFilter className="w-3 h-3 mr-1" />
              {filter.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-12">
        <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Start searching your logs
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Enter a search query above to find specific log entries across your encrypted data.
        </p>
      </div>
    </div>
  );
}
