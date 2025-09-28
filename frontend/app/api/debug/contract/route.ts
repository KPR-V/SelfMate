import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '@/lib/server-contract';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing contract connections...');
    
    const serverContract = getServerContract();
    
    // Test basic contract validation
    const isValid = await serverContract.validateContract();
    console.log('Contract validation:', isValid);
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Contract validation failed',
        details: {
          contractAddress: process.env.NOMAD_DATING_CONTRACT_ADDRESS,
          rpcUrl: process.env.RPC_URL
        }
      });
    }

    // Test getting total users
    const totalUsers = await serverContract.getTotalUsers();
    console.log('Total users:', totalUsers);
    
    // Test getting verified users
    const verifiedUsers = await serverContract.getAllVerifiedUsers();
    console.log('Verified users:', verifiedUsers);
    
    // Test getting profiles with blob IDs
    const profilesWithBlobIds = await serverContract.getAllProfilesWithBlobIds();
    console.log('Profiles with blob IDs:', profilesWithBlobIds);

    return NextResponse.json({
      success: true,
      debug: {
        contractValid: isValid,
        totalUsers: totalUsers,
        verifiedUsersCount: verifiedUsers.length,
        verifiedUsers: verifiedUsers,
        profilesWithBlobIds: profilesWithBlobIds,
        contractAddress: process.env.NOMAD_DATING_CONTRACT_ADDRESS,
        identityStorageAddress: process.env.IDENTITY_STORAGE_CONTRACT_ADDRESS,
        rpcUrl: process.env.RPC_URL
      }
    });

  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}