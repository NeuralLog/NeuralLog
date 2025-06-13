'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Helper function to format retention period
const formatRetentionPeriod = (ms: number): string => {
  if (ms === -1) return 'Indefinitely';

  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (days >= 1) {
    return `${Math.floor(days)} ${Math.floor(days) === 1 ? 'day' : 'days'}`;
  } else if (hours >= 1) {
    return `${Math.floor(hours)} ${Math.floor(hours) === 1 ? 'hour' : 'hours'}`;
  } else if (minutes >= 1) {
    return `${Math.floor(minutes)} ${Math.floor(minutes) === 1 ? 'minute' : 'minutes'}`;
  } else {
    return `${Math.floor(seconds)} ${Math.floor(seconds) === 1 ? 'second' : 'seconds'}`;
  }
};

// Helper function to convert time unit to milliseconds
const timeUnitToMs = (value: number, unit: string): number => {
  switch (unit) {
    case 'seconds':
      return value * 1000;
    case 'minutes':
      return value * 60 * 1000;
    case 'hours':
      return value * 60 * 60 * 1000;
    case 'days':
      return value * 24 * 60 * 60 * 1000;
    case 'months':
      return value * 30 * 24 * 60 * 60 * 1000;
    case 'years':
      return value * 365 * 24 * 60 * 60 * 1000;
    default:
      return value;
  }
};

/**
 * Component for managing retention policies
 */
const RetentionPolicySettings: React.FC = () => {
  // State for default policy
  const [defaultPolicy, setDefaultPolicy] = useState<any>(null);
  const [newDefaultRetentionValue, setNewDefaultRetentionValue] = useState<number>(30);
  const [newDefaultRetentionUnit, setNewDefaultRetentionUnit] = useState<string>('days');

  // State for log-specific policies
  const [logPolicies, setLogPolicies] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<string>('');
  const [newLogRetentionValue, setNewLogRetentionValue] = useState<number>(30);
  const [newLogRetentionUnit, setNewLogRetentionUnit] = useState<string>('days');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock data for demo
  useEffect(() => {
    setDefaultPolicy({ retentionPeriodMs: 30 * 24 * 60 * 60 * 1000 }); // 30 days
    setLogs(['app-logs', 'error-logs', 'access-logs']);
    setLogPolicies([
      { logName: 'error-logs', retentionPeriodMs: 90 * 24 * 60 * 60 * 1000 }, // 90 days
    ]);
  }, []);

  // Update default policy
  const updateDefaultPolicy = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const retentionPeriodMs = timeUnitToMs(newDefaultRetentionValue, newDefaultRetentionUnit);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDefaultPolicy({ retentionPeriodMs });
      setSuccess('Default retention policy updated successfully');
    } catch (err) {
      setError(`Failed to update default policy: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Retention Policies</h2>
        <p className="text-muted-foreground">Manage how long your log data is retained</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Default Retention Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Default Retention Policy</CardTitle>
          <CardDescription>
            This policy applies to all logs that don't have a specific retention policy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {defaultPolicy && (
            <div>
              <h4 className="font-medium">Current Policy:</h4>
              <p className="text-sm text-muted-foreground">
                Logs are retained for {formatRetentionPeriod(defaultPolicy.retentionPeriodMs)}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Update Default Policy</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Retention Period</label>
                <Input
                  type="number"
                  value={newDefaultRetentionValue}
                  onChange={(e) => setNewDefaultRetentionValue(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time Unit</label>
                <Select value={newDefaultRetentionUnit} onValueChange={setNewDefaultRetentionUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={updateDefaultPolicy} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Policy'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log-Specific Retention Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Log-Specific Retention Policies</CardTitle>
          <CardDescription>
            Set different retention periods for specific logs. These override the default policy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing policies */}
          {logPolicies.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Current Log-Specific Policies:</h4>
              <div className="space-y-2">
                {logPolicies.map((policy) => (
                  <div key={policy.logName} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{policy.logName}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        - {formatRetentionPeriod(policy.retentionPeriodMs)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Add/Update Log-Specific Policy</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Select Log</label>
                <Select value={selectedLog} onValueChange={setSelectedLog}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a log" />
                  </SelectTrigger>
                  <SelectContent>
                    {logs.map((log) => (
                      <SelectItem key={log} value={log}>
                        {log}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Retention Period</label>
                <Input
                  type="number"
                  value={newLogRetentionValue}
                  onChange={(e) => setNewLogRetentionValue(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time Unit</label>
                <Select value={newLogRetentionUnit} onValueChange={setNewLogRetentionUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button disabled={loading || !selectedLog}>
                  {loading ? 'Setting...' : 'Set Policy'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetentionPolicySettings;
