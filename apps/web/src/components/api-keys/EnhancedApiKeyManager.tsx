'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Key,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
  permissions: string[];
  expiresAt?: string;
  usageCount: number;
}

interface NewApiKey {
  name: string;
  permissions: string[];
  expiresIn?: string;
}

export const EnhancedApiKeyManager: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'nl_prod_1234567890abcdef',
      createdAt: '2024-01-15T10:30:00Z',
      lastUsed: '2024-01-20T14:22:00Z',
      isActive: true,
      permissions: ['logs:read', 'logs:write'],
      usageCount: 15420
    },
    {
      id: '2',
      name: 'Development API',
      key: 'nl_dev_abcdef1234567890',
      createdAt: '2024-01-10T09:15:00Z',
      lastUsed: '2024-01-19T16:45:00Z',
      isActive: true,
      permissions: ['logs:read'],
      usageCount: 3240
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<NewApiKey>({
    name: '',
    permissions: ['logs:read']
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const availablePermissions = [
    { id: 'logs:read', label: 'Read Logs', description: 'View and search logs' },
    { id: 'logs:write', label: 'Write Logs', description: 'Send logs to the platform' },
    { id: 'logs:admin', label: 'Manage Logs', description: 'Delete and manage log data' },
    { id: 'analytics:read', label: 'View Analytics', description: 'Access analytics and insights' },
    { id: 'users:read', label: 'View Users', description: 'View team members' },
    { id: 'users:admin', label: 'Manage Users', description: 'Invite and manage users' }
  ];

  const expirationOptions = [
    { value: 'never', label: 'Never expires' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: '1y', label: '1 year' }
  ];

  const handleCreateApiKey = () => {
    if (!newApiKey.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive"
      });
      return;
    }

    if (newApiKey.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one permission",
        variant: "destructive"
      });
      return;
    }

    // Generate a new API key
    const generatedKey = `nl_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key: generatedKey,
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: newApiKey.permissions,
      usageCount: 0,
      expiresAt: newApiKey.expiresIn && newApiKey.expiresIn !== 'never' 
        ? new Date(Date.now() + (newApiKey.expiresIn === '30d' ? 30 : newApiKey.expiresIn === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000).toISOString()
        : undefined
    };

    setApiKeys([...apiKeys, newKey]);
    setNewlyCreatedKey(generatedKey);
    setNewApiKey({ name: '', permissions: ['logs:read'] });
    setIsCreateDialogOpen(false);

    toast({
      title: "API Key Created",
      description: "Your new API key has been created successfully",
    });
  };

  const handleRevokeApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast({
      title: "API Key Revoked",
      description: "The API key has been revoked and can no longer be used",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionColor = (permission: string) => {
    if (permission.includes('admin')) return 'bg-red-100 text-red-800';
    if (permission.includes('write')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access to your logs
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for accessing your logs programmatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Production API Key"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Permissions</Label>
                <div className="space-y-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={newApiKey.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewApiKey({
                              ...newApiKey,
                              permissions: [...newApiKey.permissions, permission.id]
                            });
                          } else {
                            setNewApiKey({
                              ...newApiKey,
                              permissions: newApiKey.permissions.filter(p => p !== permission.id)
                            });
                          }
                        }}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="expiration">Expiration</Label>
                <Select 
                  value={newApiKey.expiresIn || 'never'} 
                  onValueChange={(value) => setNewApiKey({ ...newApiKey, expiresIn: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    {expirationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateApiKey}>
                <Key className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* New API Key Alert */}
      {newlyCreatedKey && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>API Key Created Successfully</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Please copy your API key now. It won't be shown again.</p>
            <div className="flex items-center space-x-2 p-2 bg-white rounded border">
              <code className="flex-1 text-sm">{newlyCreatedKey}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(newlyCreatedKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="mt-2"
              onClick={() => setNewlyCreatedKey(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys ({apiKeys.length})</CardTitle>
          <CardDescription>
            Manage your API keys and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{key.name}</span>
                      {key.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm">
                        {visibleKeys.has(key.id) ? key.key : '••••••••••••••••'}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((permission) => (
                        <Badge key={permission} className={getPermissionColor(permission)}>
                          {permission.split(':')[1]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{key.usageCount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(key.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRevokeApiKey(key.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Store API keys securely and never commit them to version control</li>
            <li>• Use the principle of least privilege - only grant necessary permissions</li>
            <li>• Rotate API keys regularly and revoke unused keys</li>
            <li>• Monitor API key usage for unusual activity</li>
            <li>• Use environment variables to store API keys in production</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
