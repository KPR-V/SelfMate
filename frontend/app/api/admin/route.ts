import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '../../../lib/server-contract';

// Admin endpoints for contract management
export async function POST(request: NextRequest) {
  try {
    const { action, userAddress } = await request.json();
    const serverContract = getServerContract();
    
    // Simple authentication check - in production, implement proper auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'pause':
        result = await serverContract.pauseContract();
        break;
        
      case 'unpause':
        result = await serverContract.unpauseContract();
        break;
        
      case 'removeVerifiedHuman':
        if (!userAddress) {
          return NextResponse.json(
            { success: false, error: 'User address is required for removeVerifiedHuman action' },
            { status: 400 }
          );
        }
        result = await serverContract.removeVerifiedHuman(userAddress);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Wait for transaction confirmation
    const receipt = await result.wait();
    
    if (!receipt) {
      throw new Error('Transaction receipt not available');
    }
    
    return NextResponse.json({
      success: true,
      data: {
        action,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString()
      }
    });
    
  } catch (error) {
    console.error('Error in admin action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute admin action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}