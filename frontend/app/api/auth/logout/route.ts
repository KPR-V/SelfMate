import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    }, { status: 200 });

    // Clear auth cookie
    response.headers.set('Set-Cookie', clearAuthCookie());

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({
      error: 'Logout failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Allow GET requests for logout as well
  return POST(request);
}