'use client'

import React, { useState, useEffect } from 'react';

interface CompletionStats {
  totalVerified: number;
  completedProfiles: number;
  needsCompletion: number;
  completionRate: string;
}

interface UserStatus {
  address: string;
  isVerified: boolean;
  hasProfile: boolean;
  needsProfileCreation: boolean;
  status: 'complete' | 'needs-profile';
}

export default function ProfileCompletionStats() {
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchCompletionStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/profile/completion-status');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.summary);
        setUsers(result.users);
      } else {
        throw new Error(result.error || 'Failed to fetch completion stats');
      }
    } catch (err) {
      console.error('Error fetching completion stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletionStats();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchCompletionStats();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          <h3 className="font-bold text-lg mb-2">Error Loading Stats</h3>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Profile Registration Status</h3>
        <button
          onClick={handleRefresh}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalVerified}
            </div>
            <div className="text-sm text-blue-800">Total Verified</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedProfiles}
            </div>
            <div className="text-sm text-green-800">Completed Profiles</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.needsCompletion}
            </div>
            <div className="text-sm text-orange-800">Need Completion</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.completionRate}
            </div>
            <div className="text-sm text-purple-800">Completion Rate</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {showDetails ? 'Hide Details' : 'Show User Details'} 
          <span className="ml-1">{showDetails ? '▲' : '▼'}</span>
        </button>
        
        {stats && stats.needsCompletion > 0 && (
          <div className="text-sm text-orange-600 font-medium">
            ⚠️ {stats.needsCompletion} users need to complete registration
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {users.map((user, index) => (
            <div key={user.address} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.hasProfile 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {user.hasProfile ? 'Complete' : 'Needs Profile'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                User #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}