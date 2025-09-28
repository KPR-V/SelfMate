import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '../../../lib/server-contract';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting contract statistics...');
    const serverContract = getServerContract();
    
    // First validate the contract
    const isValid = await serverContract.validateContract();
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Contract validation failed',
        details: 'Contract may not exist at the specified address'
      }, { status: 503 });
    }
    
    // Get contract statistics with individual error handling
    const [totalUsers, currentScope, isPaused, configId, owner] = await Promise.allSettled([
      serverContract.getTotalUsers(),
      serverContract.getCurrentScope(),
      serverContract.isPaused(),
      serverContract.getConfigId(),
      serverContract.getOwner()
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers.status === 'fulfilled' ? totalUsers.value : 0,
        currentScope: currentScope.status === 'fulfilled' ? currentScope.value : 0,
        isPaused: isPaused.status === 'fulfilled' ? isPaused.value : true,
        configId: configId.status === 'fulfilled' ? configId.value : 'unknown',
        owner: owner.status === 'fulfilled' ? owner.value : 'unknown',
        contractAddress: process.env.NOMAD_DATING_CONTRACT_ADDRESS || "0xd5e4a7b1f649603fb87e5635b168c003e4face83",
        chainId: process.env.CHAIN_ID || "11155111",
        errors: {
          totalUsers: totalUsers.status === 'rejected' ? totalUsers.reason?.message : null,
          currentScope: currentScope.status === 'rejected' ? currentScope.reason?.message : null,
          isPaused: isPaused.status === 'rejected' ? isPaused.reason?.message : null,
          configId: configId.status === 'rejected' ? configId.reason?.message : null,
          owner: owner.status === 'rejected' ? owner.reason?.message : null,
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting contract stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get contract stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}