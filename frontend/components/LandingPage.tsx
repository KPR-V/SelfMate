'use client'

import React from 'react';
import { Heart, Shield, Users } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useApp } from '@/lib/context';
import SelfQRCode from '@/components/SelfQRCode';

export default function LandingPage() {
  const { user, totalUsers } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          <h1 className="text-3xl font-bold text-gradient">Nomad Dating</h1>
        </div>
        <p className="text-text/70 text-lg">Verified Dating for Global Citizens</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-20">
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-text">
              Meet verified singles worldwide
            </h2>
            <p className="text-text/70">
              Connect with passport-verified users in a secure, authentic dating environment
            </p>
          </div>

          {/* Stats Card */}
          <div className="card text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Users className="w-6 h-6" />
              <span className="text-2xl font-bold">{totalUsers}</span>
            </div>
            <p className="text-text/70">Verified members worldwide</p>
          </div>

          {/* Connection Status */}
          {!user ? (
            <div className="space-y-4">
              <div className="card">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-text mb-2">Secure & Verified</h3>
                    <p className="text-sm text-text/70 mb-4">
                      All users verify their identity using government-issued passports
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <ConnectButton />
              </div>
            </div>
          ) : (
            <WalletConnected />
          )}

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-text">Why Choose Nomad Dating?</h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text">Passport Verification</p>
                  <p className="text-sm text-text/70">Age, nationality, and identity verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text">Smart Matching</p>
                  <p className="text-sm text-text/70">Connect with like-minded nomads</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text">Global Community</p>
                  <p className="text-sm text-text/70">Meet people from around the world</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function WalletConnected() {
  const { user } = useApp();
  
  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="font-semibold text-text">Wallet Connected</p>
            <p className="text-sm text-text/70 font-mono">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      {user.isVerified ? (
        <div className="card bg-success/5 border-success/20">
          <div className="text-center space-y-3">
            <div className="verified-badge mx-auto">
              ✅ Verified
            </div>
            <p className="text-text">You're ready to start dating!</p>
          </div>
        </div>
      ) : (
        <VerificationSection />
      )}
    </div>
  );
}

function VerificationSection() {
  const { navigateTo } = useApp();

  const handleVerificationSuccess = () => {
    // Navigate to swipe interface when verification is complete
    setTimeout(() => {
      navigateTo('swipe');
    }, 2000);
  };

  return (
    <div className="card border-primary/20">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-text">Verify Your Identity</h3>
        <p className="text-text/70 text-sm">
          Scan the QR code below with the Self app to verify your passport and start matching
        </p>
        
        <SelfQRCode 
          onSuccess={handleVerificationSuccess}
          onError={(error) => console.error('Verification error:', error)}
        />
        
        <div className="space-y-2">
          <p className="text-xs text-text/70">
            Don't have the Self app?
          </p>
          <a 
            href="https://www.self.xyz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary text-sm underline"
          >
            Download Self App →
          </a>
        </div>
      </div>
    </div>
  );
}