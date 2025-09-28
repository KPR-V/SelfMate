'use client'

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';

export default function ProfileCompletionBanner() {
  const { user, navigateTo } = useApp();
  const [needsCompletion, setNeedsCompletion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user?.address || !user?.isVerified) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/profile/status?address=${user.address}`);
        const result = await response.json();
        
        if (result.success && result.needsProfileCreation) {
          setNeedsCompletion(true);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfileStatus();
  }, [user?.address, user?.isVerified]);

  if (loading || !needsCompletion || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 mx-4 rounded-lg shadow-lg relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-white/80 hover:text-white text-xl leading-none"
      >
        ×
      </button>
      
      <div className="flex items-start gap-3 pr-8">
        <div className="text-2xl">🚀</div>
        <div>
          <h3 className="font-bold text-lg mb-1">Complete Your Profile!</h3>
          <p className="text-white/90 text-sm mb-3">
            You're verified but your profile isn't visible to other nomads yet. 
            Complete your registration to start discovering matches!
          </p>
          <button
            onClick={() => navigateTo('create-profile')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Complete Profile Registration
          </button>
        </div>
      </div>
    </div>
  );
}