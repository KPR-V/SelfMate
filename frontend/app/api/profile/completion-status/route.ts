import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '@/lib/server-contract';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking all verified users for profile completion...');

    const serverContract = getServerContract();
    
    // Get all verified users
    const verifiedUsers = await serverContract.getAllVerifiedUsers();
    
    // Get users with stored blob IDs
    const profilesWithBlobIds = await serverContract.getAllProfilesWithBlobIds();
    const usersWithProfiles = new Set(
      profilesWithBlobIds
        .filter(p => p.blobId && p.blobId.length > 0)
        .map(p => p.address.toLowerCase())
    );

    // Categorize users
    const results = verifiedUsers.map(userAddress => {
      const hasProfile = usersWithProfiles.has(userAddress.toLowerCase());
      return {
        address: userAddress,
        isVerified: true,
        hasProfile: hasProfile,
        needsProfileCreation: !hasProfile,
        status: hasProfile ? 'complete' : 'needs-profile'
      };
    });

    const completedCount = results.filter(r => r.hasProfile).length;
    const needsCompletionCount = results.filter(r => r.needsProfileCreation).length;

    return NextResponse.json({
      success: true,
      summary: {
        totalVerified: verifiedUsers.length,
        completedProfiles: completedCount,
        needsCompletion: needsCompletionCount,
        completionRate: `${Math.round((completedCount / verifiedUsers.length) * 100)}%`
      },
      users: results,
      message: `${needsCompletionCount} out of ${verifiedUsers.length} verified users need to complete their profile registration`
    });

  } catch (error: any) {
    console.error('❌ Error checking all profiles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to check profile statuses'
      },
      { status: 500 }
    );
  }
}