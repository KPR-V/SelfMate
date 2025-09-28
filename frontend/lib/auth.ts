import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = '7d';

export interface UserPayload {
  address: string;
  walrusBlobId: string;
  nationality?: string;
  gender?: string;
  userId: number;
  isVerified: boolean;
}

export interface JWTPayload extends UserPayload {
  iat: number;
  exp: number;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token and return payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract JWT token from request headers
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Get user from request token
 */
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Create response with auth cookie
 */
export function createAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  return `auth-token=${token}; HttpOnly; Secure; SameSite=strict; Max-Age=${maxAge}; Path=/`;
}

/**
 * Create response to clear auth cookie
 */
export function clearAuthCookie(): string {
  return 'auth-token=; HttpOnly; Secure; SameSite=strict; Max-Age=0; Path=/';
}