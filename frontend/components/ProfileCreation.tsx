'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context';

interface ProfileCreationProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export default function ProfileCreation({ onComplete, onBack }: ProfileCreationProps) {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'walrus' | 'contract' | 'complete'>('form');
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    name: user?.disclosedData?.name || '',
    age: user?.disclosedData?.olderThan ? parseInt(user.disclosedData.olderThan) + 1 : 25,
    bio: '',
    nationality: user?.disclosedData?.nationality || '',
    photos: [] as string[],
    interests: [] as string[]
  });

  const predefinedInterests = [
    'Travel', 'Photography', 'Surfing', 'Yoga', 'Coffee', 'Technology',
    'Art', 'Music', 'Hiking', 'Cooking', 'Languages', 'Writing',
    'Meditation', 'Fitness', 'Dancing', 'Reading', 'Startups', 'Culture'
  ];

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleCreateProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('walrus');

      if (!user?.address) {
        throw new Error('Please connect your wallet first');
      }

      if (!profile.name.trim()) {
        throw new Error('Name is required');
      }

      console.log('🚀 Creating profile for user:', user.address);

      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: user.address,
          ...profile
        })
      });

      const result = await response.json();

      if (!result.success) {
        const errorMsg = result.error || 'Failed to create profile';
        
        // Handle specific Walrus errors with better user messaging
        if (errorMsg.includes('Walrus testnet is temporarily unavailable')) {
          throw new Error('The profile storage system is temporarily unavailable. Please try again in a few minutes.');
        } else if (errorMsg.includes('WAL coins') || errorMsg.includes('insufficient')) {
          throw new Error('Profile storage is temporarily unavailable due to network issues. Please try again later.');
        } else if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
          throw new Error('Network timeout. Please check your connection and try again.');
        }
        
        throw new Error(errorMsg);
      }

      console.log('✅ Profile creation API success:', result);

      if (result.walrusSuccess && result.nextStep) {
        setContractData(result.nextStep);
        setStep('contract');
      } else {
        throw new Error('Profile creation incomplete');
      }

    } catch (err: any) {
      console.error('❌ Profile creation error:', err);
      setError(err.message);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleContractCall = async () => {
    try {
      if (!contractData || !window.ethereum) {
        throw new Error('Wallet not available');
      }

      setLoading(true);
      setError(null);

      // Request wallet to call the contract
      const ethereum = (window as any).ethereum;
      const provider = ethereum.providers?.[0] || ethereum;
      await provider.request({ method: 'eth_requestAccounts' });

      const contractAddress = contractData.contractAddress;
      const txData = contractData.txData;

      console.log('📝 Calling IdentityStorage contract...');
      console.log('Contract:', contractAddress);
      console.log('Function:', contractData.functionName);
      console.log('Parameters:', contractData.parameters);

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          to: contractAddress,
          from: user?.address,
          data: txData,
        }],
      });

      console.log('✅ Transaction sent:', txHash);
      setStep('complete');

    } catch (err: any) {
      console.error('❌ Contract call error:', err);
      setError(err.message || 'Failed to call contract');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'walrus') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-2xl p-8 text-center max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="animate-spin text-4xl mb-4">🌀</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Storing Your Profile</h2>
          <p className="text-gray-600">
            Uploading your profile data to Walrus decentralized storage...
          </p>
        </motion.div>
      </div>
    );
  }

  if (step === 'contract') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-2xl p-8 text-center max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Registration</h2>
          <p className="text-gray-600 mb-6">
            Your profile is stored in Walrus! Now complete registration by storing your profile ID on the blockchain.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleContractCall}
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Calling Contract...' : 'Complete Registration'}
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            This will call storeBlobId() on the IdentityStorage contract
          </p>
        </motion.div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-2xl p-8 text-center max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Created!</h2>
          <p className="text-gray-600 mb-6">
            Your profile has been successfully created and stored. You'll now appear in the discovery feed for other verified users!
          </p>
          
          <button
            onClick={onComplete}
            className="w-full bg-pink-500 text-white py-3 rounded-full hover:bg-pink-600 transition-colors"
          >
            Start Discovering
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          className="bg-white rounded-2xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Profile</h1>
            <p className="text-gray-600">
              Complete your profile to start connecting with other verified nomads
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                min="18"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality *
              </label>
              <input
                type="text"
                value={profile.nationality}
                onChange={(e) => setProfile(prev => ({ ...prev, nationality: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Your nationality"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Tell others about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      profile.interests.includes(interest)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            {onBack && (
              <button
                onClick={onBack}
                className="flex-1 bg-gray-500 text-white py-3 rounded-full hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleCreateProfile}
              disabled={loading || !profile.name.trim()}
              className="flex-1 bg-pink-500 text-white py-3 rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}