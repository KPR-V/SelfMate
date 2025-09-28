import { NextRequest, NextResponse } from 'next/server';
import { getServerContract } from '../../../lib/server-contract';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Starting contract validation test...');
    const serverContract = getServerContract();
    
    // Test contract validation
    const isValid = await serverContract.validateContract();
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Contract validation failed',
        details: 'Contract may not exist at the specified address or network is incorrect'
      });
    }
    
    // If validation passed, try a simple read operation
    console.log('✅ Contract validation passed, testing basic functionality...');
    
    return NextResponse.json({
      success: true,
      message: 'Contract validation successful',
      data: {
        contractAddress: process.env.NOMAD_DATING_CONTRACT_ADDRESS || "0xd5e4a7b1f649603fb87e5635b168c003e4face83",
        chainId: process.env.CHAIN_ID || "11155111",
        rpcUrl: process.env.RPC_URL ? process.env.RPC_URL.replace(/\/v3\/.*/, '/v3/***') : 'not configured',
        hasPrivateKey: !!process.env.PRIVATE_KEY
      }
    });
    
  } catch (error) {
    console.error('❌ Contract test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Contract test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}