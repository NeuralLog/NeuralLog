import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FiRefreshCw, FiPlus, FiRotateCcw, FiKey } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import { KEKVersionTable } from './KEKVersionTable';
import { CreateKEKDialog } from './CreateKEKDialog';
import { RotateKEKDialog } from './RotateKEKDialog';
import { ReencryptLogsDialog } from './ReencryptLogsDialog';

/**
 * Component for displaying and managing KEK versions
 */
const KEKVersionList: React.FC = () => {
  const { client } = useAuth();
  
  const [kekVersions, setKekVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [reencryptDialogOpen, setReencryptDialogOpen] = useState(false);
  
  // Fetch KEK versions
  const fetchKEKVersions = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const versions = await client.getKEKVersions();
      setKekVersions(versions);
    } catch (err) {
      console.error('Error fetching KEK versions:', err);
      setError(`Failed to fetch KEK versions: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load KEK versions on mount
  useEffect(() => {
    if (client) {
      fetchKEKVersions();
    }
  }, [client]);
  
  // Handle dialog close with success message
  const handleSuccess = (message: string) => {
    setSuccess(message);
    fetchKEKVersions();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 5000);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Key Encryption Key (KEK) Versions
        </h2>

        <div className="flex gap-2">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Create Version
          </Button>

          <Button
            variant="secondary"
            onClick={() => setRotateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FiRotateCcw className="w-4 h-4" />
            Rotate KEK
          </Button>

          <Button
            variant="outline"
            onClick={() => setReencryptDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FiKey className="w-4 h-4" />
            Re-encrypt Logs
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchKEKVersions}
            disabled={loading}
            className="flex items-center gap-2"
            title="Refresh"
          >
            <FiRefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <KEKVersionTable 
        kekVersions={kekVersions} 
        loading={loading} 
      />
      
      <CreateKEKDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={(message) => {
          setCreateDialogOpen(false);
          handleSuccess(message);
        }}
      />
      
      <RotateKEKDialog
        open={rotateDialogOpen}
        onClose={() => setRotateDialogOpen(false)}
        onSuccess={(message) => {
          setRotateDialogOpen(false);
          handleSuccess(message);
        }}
      />
      
      <ReencryptLogsDialog
        open={reencryptDialogOpen}
        onClose={() => setReencryptDialogOpen(false)}
        onSuccess={(message) => {
          setReencryptDialogOpen(false);
          handleSuccess(message);
        }}
      />
    </div>
  );
};

export default KEKVersionList;
