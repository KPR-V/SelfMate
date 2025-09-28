'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { web3Service, UserData } from '@/lib/web3';
import { selfService } from '@/lib/self';

export interface Profile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  nationality: string;
  verified: boolean;
}

export interface Match {
  id: string;
  profile: Profile;
  lastMessage?: {
    text: string;
    timestamp: Date;
    fromSelf: boolean;
  };
  unreadCount: number;
}

export interface DisclosedData {
  nationality?: string;
  gender?: "M" | "F";
  olderThan?: string;
  name?: string;
  date_of_birth?: string;
  passport_number?: string;
  expiry_date?: string;
  issuing_state?: string;
}

interface AppContextType {
  // User state
  user: (UserData & { disclosedData?: DisclosedData }) | null;
  isConnecting: boolean;
  isConnected: boolean;
  totalUsers: number;
  
  // App state
  currentView: 'landing' | 'swipe' | 'matches' | 'profile' | 'create-profile';
  
  // Functions
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  navigateTo: (view: 'landing' | 'swipe' | 'matches' | 'profile' | 'create-profile') => void;
  refreshUserData: () => Promise<void>;
  updateDisclosedData: (data: DisclosedData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [user, setUser] = useState<(UserData & { disclosedData?: DisclosedData }) | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentView, setCurrentView] = useState<'landing' | 'swipe' | 'matches' | 'profile' | 'create-profile'>('landing');

  const updateDisclosedData = (disclosedData: DisclosedData) => {
    console.log('Updating disclosed data:', disclosedData);
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        disclosedData,
        isVerified: true
      };
    });
  // Navigate to profile creation instead of directly to swipe
  setCurrentView('create-profile');
};

// Check if verified user has completed their profile registration
const checkProfileCompletion = async (userAddress: string) => {
  try {
    console.log('🔍 Checking profile completion for:', userAddress);
    
    const response = await fetch(`/api/profile/status?address=${userAddress}`);
    const result = await response.json();
    
    if (result.success) {
      if (result.needsProfileCreation) {
        console.log('⚠️ User needs to complete profile registration');
        setCurrentView('create-profile');
      } else {
        console.log('✅ User has completed profile registration');
        setCurrentView('swipe');
      }
    } else {
      console.error('❌ Failed to check profile status:', result.error);
      setCurrentView('swipe'); // Default to swipe if check fails
    }
  } catch (error) {
    console.error('❌ Error checking profile completion:', error);
    setCurrentView('swipe'); // Default to swipe if check fails
  }
};  // Handle wallet connection status changes
  useEffect(() => {
    const initializeUser = async () => {
      if (isConnected && address) {
        try {
          const isVerified = await web3Service.isUserVerified(address);
          const userData = {
            address,
            isVerified,
          };
          setUser(userData);
          selfService.updateUserId(address);
          
          if (isVerified) {
            // Check if verified user has completed profile registration
            console.log('🔍 Checking profile completion for verified user:', address);
            await checkProfileCompletion(address);
          } else {
            setCurrentView('landing');
          }
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      } else {
        setUser(null);
        setCurrentView('landing');
        web3Service.resetContract();
      }
    };

    initializeUser();
  }, [isConnected, address]);

  // Listen for contract verification events
  useEffect(() => {
    if (!isConnected || !address) return;

    const handleContractVerification = (userAddress: string, disclosedData: any) => {
      console.log("🎯 Contract verification event for:", userAddress);
      console.log("🎯 With disclosed data:", disclosedData);
      
      // Only handle events for the current user
      if (userAddress.toLowerCase() === address.toLowerCase()) {
        console.log("✅ Event matches current user, updating disclosed data");
        
        // Convert contract data to our DisclosedData format
        const formattedData: DisclosedData = {};
        
        if (disclosedData.nationality) formattedData.nationality = disclosedData.nationality;
        if (disclosedData.gender) formattedData.gender = disclosedData.gender;
        if (disclosedData.olderThan) formattedData.olderThan = disclosedData.olderThan;
        if (disclosedData.name) formattedData.name = disclosedData.name;
        if (disclosedData.date_of_birth) formattedData.date_of_birth = disclosedData.date_of_birth;
        if (disclosedData.passport_number) formattedData.passport_number = disclosedData.passport_number;
        if (disclosedData.expiry_date) formattedData.expiry_date = disclosedData.expiry_date;
        if (disclosedData.issuing_state) formattedData.issuing_state = disclosedData.issuing_state;
        
        console.log("📊 Formatted contract disclosed data:", formattedData);
        
        // Update context with contract event data
        updateDisclosedData(formattedData);
      }
    };

    // Set up contract event listener
    web3Service.onUserVerified(handleContractVerification);

    // Cleanup function
    return () => {
      web3Service.removeAllListeners();
    };
  }, [isConnected, address, updateDisclosedData]);

  useEffect(() => {
    const loadTotalUsers = async () => {
      try {
        const count = await web3Service.getTotalUsers();
        setTotalUsers(count);
      } catch (error) {
        console.error('Error loading total users:', error);
      }
    };

    loadTotalUsers();
  }, []);

  const connectWallet = async () => {
    try {
      // Handled by RainbowKit
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const disconnect = () => {
    wagmiDisconnect();
    setUser(null);
    setCurrentView('landing');
    web3Service.resetContract();
  };

  const navigateTo = (view: 'landing' | 'swipe' | 'matches' | 'profile' | 'create-profile') => {
    setCurrentView(view);
  };

  const refreshUserData = async () => {
    if (address) {
      try {
        const isVerified = await web3Service.isUserVerified(address);
        setUser(prev => prev ? { ...prev, isVerified } : null);
        
        const count = await web3Service.getTotalUsers();
        setTotalUsers(count);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const contextValue: AppContextType = {
    user,
    isConnecting,
    isConnected,
    totalUsers,
    currentView,
    connectWallet,
    disconnect,
    navigateTo,
    refreshUserData,
    updateDisclosedData,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}