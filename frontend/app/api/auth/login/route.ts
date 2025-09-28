import { NextRequest, NextResponse } from 'next/server';
import { generateToken, createAuthCookie, UserPayload } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { address, walrusBlobId, nationality, gender, userId, isVerified } = body;

    // Validate required fields
    if (!address || !walrusBlobId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: address, walrusBlobId, userId' 
      }, { status: 400 });
    }

    // Create user payload
    const userPayload: UserPayload = {
      address,
      walrusBlobId,
      nationality,
      gender,
      userId: parseInt(userId),
      isVerified: Boolean(isVerified)
    };

    // Generate JWT token
    const token = generateToken(userPayload);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userPayload,
      token
    }, { status: 200 });

    // Set auth cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({
      error: 'Login failed',
      details: error.message
    }, { status: 500 });
  }
}