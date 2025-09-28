import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isTokenExpired } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        message: 'No valid token found'
      }, { status: 401 });
    }

    if (isTokenExpired(user)) {
      return NextResponse.json({
        authenticated: false,
        message: 'Token expired'
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        address: user.address,
        walrusBlobId: user.walrusBlobId,
        nationality: user.nationality,
        gender: user.gender,
        userId: user.userId,
        isVerified: user.isVerified
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Authentication verification failed',
      details: error.message
    }, { status: 500 });
  }
}