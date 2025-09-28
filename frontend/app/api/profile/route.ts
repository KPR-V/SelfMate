import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || !user.isVerified) {
      return NextResponse.json({ 
        error: 'Verified user authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { profileData } = body;

    if (!profileData) {
      return NextResponse.json({ 
        error: 'Profile data required' 
      }, { status: 400 });
    }

    // Step 1: Upload profile data to Walrus
    const walrusResponse = await fetch(`${request.nextUrl.origin}/api/walrus/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: JSON.stringify({
          ...profileData,
          userAddress: user.address,
          timestamp: Date.now(),
          version: '1.0'
        })
      })
    });

    if (!walrusResponse.ok) {
      const error = await walrusResponse.json();
      return NextResponse.json({ 
        error: 'Failed to store profile data',
        details: error
      }, { status: 500 });
    }

    const walrusResult = await walrusResponse.json();
    const profileBlobId = walrusResult.blobId;

    return NextResponse.json({
      success: true,
      message: 'Profile data stored successfully',
      profileBlobId,
      userAddress: user.address,
      instructions: {
        nextStep: 'Call smart contract updateProfile function',
        contractFunction: 'updateProfile',
        parameters: {
          profileBlobId
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Store profile error:', error);
    return NextResponse.json({
      error: 'Failed to store profile',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileBlobId = searchParams.get('profileBlobId');

    if (!profileBlobId) {
      return NextResponse.json({ 
        error: 'Profile blob ID required' 
      }, { status: 400 });
    }

    // Retrieve profile data from Walrus
    const walrusResponse = await fetch(`${request.nextUrl.origin}/api/walrus/retrieve?blobId=${profileBlobId}`);

    if (!walrusResponse.ok) {
      const error = await walrusResponse.json();
      return NextResponse.json({ 
        error: 'Failed to retrieve profile data',
        details: error
      }, { status: 500 });
    }

    const walrusResult = await walrusResponse.json();
    
    // Parse the retrieved profile data
    let profileData;
    try {
      profileData = JSON.parse(walrusResult.data);
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid profile data format',
        details: parseError
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile data retrieved successfully',
      data: {
        profileBlobId,
        ...profileData
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Retrieve profile error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve profile',
      details: error.message
    }, { status: 500 });
  }
}