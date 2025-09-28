import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '@/lib/server-contract';
import axios from 'axios';

const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

interface WalrusProfile {
  name: string;
  age: number;
  bio: string;
  nationality: string;
  photos?: string[];
  interests?: string[];
}

interface VerifiedProfile {
  id: string;
  address: string;
  name: string;
  age: number;
  bio: string;
  nationality: string;
  photos: string[];
  interests: string[];
  verified: boolean;
  blobId: string;
}

async function retrieveFromWalrus(blobId: string): Promise<any | null> {
  try {
    const url = `${AGGREGATOR}/v1/blobs/${blobId}`;
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
      timeout: 10000 // 10 second timeout
    });

    const content = Buffer.from(response.data).toString('utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    console.error(`Error retrieving blob ${blobId}:`, error.message);
    return null;
  }
}



export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching verified profiles...');
    
    // Get server contract instance
    const serverContract = getServerContract();
    
    // Get all profiles with blob IDs
    const profilesWithBlobIds = await serverContract.getAllProfilesWithBlobIds();
    
    if (profilesWithBlobIds.length === 0) {
      console.log('ℹ️ No profiles found');
      return NextResponse.json({
        success: true,
        profiles: [],
        message: 'No verified profiles found'
      });
    }

    console.log(`📊 Found ${profilesWithBlobIds.length} profiles with blob IDs`);
    
    // Fetch profile data from Walrus for each blob ID
    const verifiedProfiles: VerifiedProfile[] = [];
    
    for (const { address, blobId } of profilesWithBlobIds) {
      try {
        // Check if user is verified
        const isVerified = await serverContract.isUserVerified(address);
        
        if (!isVerified) {
          console.log(`⚠️ User ${address} is not verified, skipping...`);
          continue;
        }

        console.log(`🔍 Retrieving profile data for ${address} with blob ID ${blobId}`);
        
        const profileData = await retrieveFromWalrus(blobId);
        
        if (profileData) {
          const profile: VerifiedProfile = {
            id: address, // Use address as unique ID
            address: address,
            name: profileData.name,
            age: profileData.age,
            bio: profileData.bio,
            nationality: profileData.nationality,
            photos: profileData.photos || [],
            interests: profileData.interests || [],
            verified: true,
            blobId: blobId
          };
          
          verifiedProfiles.push(profile);
          console.log(`✅ Added profile for ${profile.name} (${address})`);
        } else {
          console.log(`⚠️ Failed to retrieve profile data for ${address}, skipping...`);
        }
      } catch (error) {
        console.error(`❌ Error processing profile for ${address}:`, error);
      }
    }

    console.log(`✅ Successfully processed ${verifiedProfiles.length} verified profiles`);
    
    return NextResponse.json({
      success: true,
      profiles: verifiedProfiles,
      count: verifiedProfiles.length,
      message: `Found ${verifiedProfiles.length} verified profiles`
    });

  } catch (error: any) {
    console.error('❌ Error fetching verified profiles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch verified profiles',
        profiles: []
      },
      { status: 500 }
    );
  }
}