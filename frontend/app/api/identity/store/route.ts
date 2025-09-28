import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { verificationData, nationality, gender } = body;

    if (!verificationData) {
      return NextResponse.json({ 
        error: 'Verification data required' 
      }, { status: 400 });
    }

    // Step 1: Upload identity data to Walrus
    const walrusResponse = await fetch(`${request.nextUrl.origin}/api/walrus/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: JSON.stringify({
          verificationData,
          nationality,
          gender,
          timestamp: Date.now(),
          userAddress: user.address
        })
      })
    });

    if (!walrusResponse.ok) {
      const error = await walrusResponse.json();
      return NextResponse.json({ 
        error: 'Failed to store identity data',
        details: error
      }, { status: 500 });
    }

    const walrusResult = await walrusResponse.json();
    const blobId = walrusResult.blobId;

    // Step 2: Store blob ID on blockchain (this would require contract interaction)
    // For now, we'll return the blob ID that should be stored on-chain
    
    return NextResponse.json({
      success: true,
      message: 'Identity data stored successfully',
      walrusBlobId: blobId,
      userAddress: user.address,
      nationality,
      gender,
      instructions: {
        nextStep: 'Call smart contract storeIdentity function',
        contractFunction: 'storeIdentity',
        parameters: {
          walrusBlobId: blobId,
          nationality,
          gender
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Store identity error:', error);
    return NextResponse.json({
      error: 'Failed to store identity',
      details: error.message
    }, { status: 500 });
  }
}