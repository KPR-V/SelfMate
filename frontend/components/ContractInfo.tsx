import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import ProfileCompletionStats from './ProfileCompletionStats';

interface ContractStats {
  totalUsers: number;
  currentScope: number;
  isPaused: boolean;
  configId: string;
  owner: string;
  contractAddress: string;
  chainId: string;
}

interface UserVerificationStatus {
  userAddress: string;
  isVerified: boolean;
  totalUsers: number;
  currentScope: number;
  contractPaused: boolean;
  status: string;
}

const ContractInfo: React.FC = () => {
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [userStatus, setUserStatus] = useState<UserVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();

  const fetchContractStats = async () => {
    try {
      const response = await fetch('/api/contract-stats');
      const result = await response.json();
      
      if (result.success) {
        setContractStats(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch contract stats');
      }
    } catch (err) {
      console.error('Error fetching contract stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contract stats');
    }
  };

  const fetchUserStatus = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/verification/status?userAddress=${address}`);
      const result = await response.json();
      
      if (result.success) {
        setUserStatus(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch user status');
      }
    } catch (err) {
      console.error('Error fetching user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user status');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await fetchContractStats();
        if (isConnected && address) {
          await fetchUserStatus();
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address, isConnected]);

  const refreshData = async () => {
    setLoading(true);
    await fetchContractStats();
    if (isConnected && address) {
      await fetchUserStatus();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contract Information</h3>
          <button
            onClick={refreshData}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {contractStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {contractStats.totalUsers}
              </div>
              <div className="text-sm text-blue-800">Total Verified Users</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {contractStats.currentScope}
              </div>
              <div className="text-sm text-green-800">Current Scope</div>
            </div>
            
            <div className={`rounded-lg p-4 ${contractStats.isPaused ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className={`text-2xl font-bold ${contractStats.isPaused ? 'text-red-600' : 'text-green-600'}`}>
                {contractStats.isPaused ? 'PAUSED' : 'ACTIVE'}
              </div>
              <div className={`text-sm ${contractStats.isPaused ? 'text-red-800' : 'text-green-800'}`}>
                Contract Status
              </div>
            </div>
            
            <div className="col-span-full bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium">Contract:</span> {contractStats.contractAddress}</div>
                <div><span className="font-medium">Chain ID:</span> {contractStats.chainId}</div>
                <div><span className="font-medium">Owner:</span> {contractStats.owner}</div>
                <div><span className="font-medium">Config ID:</span> {contractStats.configId}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Completion Stats */}
      <ProfileCompletionStats />

      {/* User Status */}
      {isConnected && address && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Verification Status</h3>
          
          {userStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Wallet Address:</span>
                <span className="text-sm text-gray-900 font-mono">
                  {userStatus.userAddress.slice(0, 6)}...{userStatus.userAddress.slice(-4)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Verification Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userStatus.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userStatus.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              
              {!userStatus.isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Complete the Self Protocol verification process to become a verified user.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractInfo;