import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId') || user.walrusBlobId;

    if (!blobId) {
      return NextResponse.json({ 
        error: 'No blob ID provided' 
      }, { status: 400 });
    }

    // Retrieve data from Walrus
    const walrusResponse = await fetch(`${request.nextUrl.origin}/api/walrus/retrieve?blobId=${blobId}`);

    if (!walrusResponse.ok) {
      const error = await walrusResponse.json();
      return NextResponse.json({ 
        error: 'Failed to retrieve identity data',
        details: error
      }, { status: 500 });
    }

    const walrusResult = await walrusResponse.json();
    
    // Parse the retrieved data
    let identityData;
    try {
      identityData = JSON.parse(walrusResult.data);
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid identity data format',
        details: parseError
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Identity data retrieved successfully',
      data: {
        blobId,
        ...identityData
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Retrieve identity error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve identity',
      details: error.message
    }, { status: 500 });
  }
}