'use client'

import React, { useEffect, useState } from 'react';
import { SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { selfService } from '@/lib/self';
import { useApp } from '@/lib/context';

interface SelfQRCodeProps {
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
}

export default function SelfQRCode({ onSuccess, onError }: SelfQRCodeProps) {
  const { user, refreshUserData } = useApp();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user?.address) {
      selfService.updateUserId(user.address);
      setIsInitialized(selfService.isInitialized());
    }
  }, [user?.address]);

  const handleSuccess = async (verificationData?: any) => {
    console.log('Self verification completed successfully:', verificationData);
    setVerificationStatus('success');
    
    try {
      // Refresh user data to get updated verification status
      await refreshUserData();
      onSuccess?.(verificationData);
    } catch (err) {
      console.error('Error refreshing user data after verification:', err);
    }
  };

  const handleError = (err: any) => {
    console.error('Self QR code error:', err);
    setVerificationStatus('error');
    setError(err.message || 'Verification failed');
    onError?.(err);
  };

  if (!user?.address) {
    return (
      <div className="w-full max-w-sm mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="aspect-square flex items-center justify-center p-4">
          <p className="text-gray-500 text-center text-sm">Connect wallet first</p>
        </div>
      </div>
    );
  }

  if (!isInitialized || !selfService.getSelfApp()) {
    return (
      <div className="w-full max-w-sm mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="aspect-square flex items-center justify-center p-4">
          <p className="text-gray-500 text-center text-sm">Initializing Self app...</p>
        </div>
      </div>
    );
  }

  const selfApp = selfService.getSelfApp();
  if (!selfApp) {
    return (
      <div className="w-full max-w-sm mx-auto bg-red-100 border-2 border-dashed border-red-300 rounded-lg">
        <div className="aspect-square flex items-center justify-center p-4">
          <p className="text-red-500 text-center text-sm">Failed to initialize Self app</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm mx-auto">
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="aspect-square flex items-center justify-center p-4 relative">
            {verificationStatus === 'pending' && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center space-y-3">
                  <div className="spinner w-8 h-8 mx-auto"></div>
                  <p className="text-sm text-text">Waiting for verification...</p>
                </div>
              </div>
            )}
            
            {verificationStatus === 'success' && (
              <div className="absolute inset-0 bg-success bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto">
                    <span className="text-success text-2xl">✓</span>
                  </div>
                  <p className="text-white font-semibold">Verified!</p>
                </div>
              </div>
            )}

            <div className="self-qr-wrapper">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          </div>
        </div>
      </div>

      {verificationStatus === 'pending' && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-primary">Verification in Progress</p>
          <p className="text-xs text-text/70">
            Complete the verification in the Self app. This may take a few moments.
          </p>
        </div>
      )}

      {verificationStatus === 'error' && error && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-error">Verification Failed</p>
          <p className="text-xs text-text/70">{error}</p>
          <button
            onClick={() => {
              setVerificationStatus('idle');
              setError(null);
            }}
            className="btn-secondary text-sm px-4 py-2"
          >
            Try Again
          </button>
        </div>
      )}

      {verificationStatus === 'idle' && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-text">Ready to Verify</p>
          <p className="text-xs text-text/70">
            Scan with the Self app to verify your passport
          </p>
        </div>
      )}
    </div>
  );
}