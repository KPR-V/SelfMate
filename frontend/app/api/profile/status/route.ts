import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '@/lib/server-contract';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking profile completion for:', userAddress);

    const serverContract = getServerContract();
    
    // Step 1: Check if user is verified in nomaddating contract
    const isVerified = await serverContract.isUserVerified(userAddress);
    
    if (!isVerified) {
      return NextResponse.json({
        success: true,
        isVerified: false,
        hasProfile: false,
        needsProfileCreation: false,
        message: 'User is not verified'
      });
    }

    // Step 2: Check if user has stored a blob ID in IdentityStorage contract
    const profilesWithBlobIds = await serverContract.getAllProfilesWithBlobIds();
    const userProfile = profilesWithBlobIds.find(
      p => p.address.toLowerCase() === userAddress.toLowerCase()
    );

    const hasStoredBlobId = userProfile && userProfile.blobId && userProfile.blobId.length > 0;

    return NextResponse.json({
      success: true,
      userAddress,
      isVerified: true,
      hasProfile: hasStoredBlobId,
      blobId: userProfile?.blobId || null,
      needsProfileCreation: !hasStoredBlobId,
      message: hasStoredBlobId 
        ? 'User has completed profile registration'
        : 'User needs to complete profile registration'
    });

  } catch (error: any) {
    console.error('❌ Error checking profile status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to check profile status'
      },
      { status: 500 }
    );
  }
}