import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getNetworkConfig } from '@/lib/network-config';

const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const DEMO_MODE = process.env.DEMO_MODE === 'true' || true; // Enable demo mode for testing

interface ProfileData {
  name: string;
  age: number;
  bio: string;
  nationality: string;
  photos: string[];
  interests: string[];
}

// Store profile data to Walrus and get blob ID
async function storeToWalrus(profileData: ProfileData): Promise<string | null> {
  try {
    console.log('📤 Storing profile to Walrus...');
    
    // Demo mode fallback when Walrus is unavailable
    if (DEMO_MODE) {
      console.log('🚧 Demo mode: Simulating Walrus storage...');
      const mockBlobId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('✅ Demo blob ID generated:', mockBlobId);
      
      // Simulate some delay to make it feel real
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBlobId;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const profileDataWithTimestamp = {
      ...profileData,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(`${WALRUS_PUBLISHER}/v1/blobs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: JSON.stringify(profileDataWithTimestamp),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Walrus store error:', response.status, errorText);
      
      // Parse the error response to provide better error messages
      let errorMessage = `Walrus storage failed: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = `Walrus error: ${errorData.error.message}`;
          
          // Handle specific Walrus errors
          if (errorData.error.message.includes('WAL coins')) {
            errorMessage = 'Walrus testnet is temporarily unavailable (insufficient funds). Please try again later.';
          }
        }
      } catch (parseError) {
        // Keep original message if JSON parsing fails
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Walrus store result:', result);
    
    if (result.newlyCreated) {
      return result.newlyCreated.blobObject.blobId;
    } else if (result.alreadyCertified) {
      return result.alreadyCertified.blobId;
    }
    
    return null;
  } catch (error: any) {
    console.error('❌ Walrus storage error:', error);
    throw error;
  }
}

// Store blob ID in IdentityStorage contract
async function storeBlobIdToContract(userAddress: string, blobId: string): Promise<string> {
  try {
    console.log(`📝 Storing blob ID to IdentityStorage contract for ${userAddress}`);
    
    // Use Ethereum Sepolia network for IdentityStorage contract
    const identityStorageConfig = getNetworkConfig('IDENTITY_STORAGE');
    const rpcUrl = identityStorageConfig.rpcUrl;
    const identityStorageAddress = identityStorageConfig.contractAddress;
    
    const identityStorageABI = [
        {
            "type": "constructor",
            "inputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getAllBlobIds",
            "inputs": [],
            "outputs": [
                {
                    "name": "addresses",
                    "type": "address[]",
                    "internalType": "address[]"
                },
                {
                    "name": "blobIds",
                    "type": "string[]",
                    "internalType": "string[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getAllUserAddresses",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "address[]",
                    "internalType": "address[]"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getTotalUsers",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "getUserBlobId",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "storeBlobId",
            "inputs": [
                {
                    "name": "blobId",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "userAddresses",
            "inputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "userToBlobId",
            "inputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "BlobIdStored",
            "inputs": [
                {
                    "name": "user",
                    "type": "address",
                    "indexed": true,
                    "internalType": "address"
                },
                {
                    "name": "blobId",
                    "type": "string",
                    "indexed": false,
                    "internalType": "string"
                }
            ],
            "anonymous": false
        }
    ]
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(identityStorageAddress, identityStorageABI, provider);
    
    
    
    
    const txData = contract.interface.encodeFunctionData('storeBlobId', [blobId]);
    
    return txData;
  } catch (error: any) {
    console.error('❌ Contract preparation error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userAddress, 
      name, 
      age, 
      bio, 
      nationality, 
      photos = [], 
      interests = [] 
    } = body;

    // Validate required fields
    if (!userAddress || !name || !age || !nationality) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userAddress, name, age, nationality' },
        { status: 400 }
      );
    }

    console.log('🚀 Creating complete profile for user:', userAddress);

    // Step 1: Store profile data to Walrus
    const profileData: ProfileData = {
      name,
      age: parseInt(age.toString()),
      bio: bio || `Hi, I'm ${name}! Digital nomad exploring the world.`,
      nationality,
      photos: Array.isArray(photos) ? photos : [],
      interests: Array.isArray(interests) ? interests : ['Travel']
    };

    const blobId = await storeToWalrus(profileData);
    
    if (!blobId) {
      throw new Error('Failed to store profile data to Walrus');
    }

    console.log('✅ Profile stored to Walrus with blob ID:', blobId);

    // Step 2: Prepare contract transaction for storing blob ID
    const contractTxData = await storeBlobIdToContract(userAddress, blobId);

    // Return success with instructions for frontend
    return NextResponse.json({
      success: true,
      profileData,
      blobId,
      walrusSuccess: true,
      demoMode: DEMO_MODE,
      nextStep: {
        description: DEMO_MODE ? 
          'Profile created in demo mode! In production, this would be stored on Walrus and blockchain.' :
          'Profile stored to Walrus. Now store blob ID in IdentityStorage contract.',
        contractAddress: process.env.IDENTITY_STORAGE_CONTRACT_ADDRESS,
        txData: contractTxData,
        functionName: 'storeBlobId',
        parameters: [blobId],
        instructions: DEMO_MODE ?
          'Demo mode: Profile creation complete!' :
          'Call storeBlobId() on the IdentityStorage contract from your wallet to complete registration'
      },
      message: DEMO_MODE ?
        'Profile created in demo mode! This simulates the full Walrus + blockchain flow.' :
        'Profile created successfully! Complete the blockchain step to appear in discovery.'
    });

  } catch (error: any) {
    console.error('❌ Profile creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create profile',
        details: error.stack
      },
      { status: 500 }
    );
  }
}