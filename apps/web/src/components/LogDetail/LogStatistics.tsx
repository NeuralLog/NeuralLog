'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LogStatisticsProps {
  logName: string;
  entryCount?: number;
  size?: number;
  firstEntry?: string;
  lastEntry?: string;
  averageEntrySize?: number;
}

const LogStatistics: React.FC<LogStatisticsProps> = ({
  logName,
  entryCount = 0,
  size = 0,
  firstEntry,
  lastEntry,
  averageEntrySize = 0
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Statistics</CardTitle>
          <CardDescription>
            Overview of {logName} log data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Total Entries</h4>
              <p className="text-2xl font-bold">{entryCount.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Total Size</h4>
              <p className="text-2xl font-bold">{formatBytes(size)}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Average Entry Size</h4>
              <p className="text-2xl font-bold">{formatBytes(averageEntrySize)}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">First Entry</h4>
              <p className="text-sm">{formatDate(firstEntry)}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Last Entry</h4>
              <p className="text-sm">{formatDate(lastEntry)}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Log Name</h4>
              <p className="text-sm font-mono">{logName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogStatistics;
export { LogStatistics };
