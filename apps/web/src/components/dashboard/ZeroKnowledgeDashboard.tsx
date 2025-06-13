'use client';

import React, { useState, useEffect } from 'react';
// Using the existing CryptoProvider
import { LogSelector } from '@/components/logs/LogSelector';
import { ClientSideLogViewer } from '@/components/logs/ClientSideLogViewer';
import { ClientSideLogSearch } from '@/components/logs/ClientSideLogSearch';
import { EnterpriseAnalytics } from '@/components/dashboard/EnterpriseAnalytics';
import { UserManagement } from '@/components/admin/UserManagement';
import { BillingDashboard } from '@/components/billing/BillingDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MasterSecretInput } from '@/components/crypto/MasterSecretInput';
import { useAuth } from '@/hooks/useAuth';

export const ZeroKnowledgeDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [selectedLog, setSelectedLog] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Get tenant ID from user
  const tenantId = user?.tenantId || 'default';

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('admin');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please log in to view logs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
          {isAdmin && <TabsTrigger value="billing">Billing</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zero-Knowledge Encryption</CardTitle>
              <CardDescription>
                Set up your encryption keys to view logs securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MasterSecretInput />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('logs')}
                  className="p-4 border rounded-lg hover:bg-muted text-left"
                >
                  <h3 className="font-medium">View Logs</h3>
                  <p className="text-sm text-muted-foreground">Browse and search your encrypted logs</p>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 border rounded-lg hover:bg-muted text-left"
                >
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View insights and performance metrics</p>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 border rounded-lg hover:bg-muted text-left"
                  >
                    <h3 className="font-medium">Manage Users</h3>
                    <p className="text-sm text-muted-foreground">Invite and manage team members</p>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Log Explorer</CardTitle>
                <LogSelector
                  onSelectLog={setSelectedLog}
                  selectedLog={selectedLog}
                />
              </div>
            </CardHeader>
            <CardContent>
              {selectedLog ? (
                <Tabs defaultValue="view">
                  <TabsList className="mb-4">
                    <TabsTrigger value="view">View</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                  </TabsList>
                  <TabsContent value="view">
                    <ClientSideLogViewer logName={selectedLog} limit={100} />
                  </TabsContent>
                  <TabsContent value="search">
                    <ClientSideLogSearch logName={selectedLog} limit={100} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center p-4">
                  <p>Select a log to view or search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <EnterpriseAnalytics />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="billing">
            <BillingDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
