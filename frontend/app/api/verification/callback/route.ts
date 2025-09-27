import { NextRequest, NextResponse } from 'next/server';
import { VERIFICATION_CONFIG, EXCLUDED_COUNTRY_NAMES } from '@/lib/disclosure-config';

interface SelfVerificationPayload {
  user_id: string;
  proof_data: {
    nationality?: string;
    gender?: "M" | "F";
    olderThan?: string;
    name?: string;
    date_of_birth?: string;
    passport_number?: string;
    expiry_date?: string;
    issuing_state?: string;
    [key: string]: any;
  };
  status: 'success' | 'failed';
  timestamp: string;
  verification_config?: {
    minimumAge?: number;
    excludedCountries?: string[];
    ofac?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SelfVerificationPayload = await request.json();
    
    console.log('Self ID verification callback received:', {
      userId: body.user_id,
      status: body.status,
      proofData: body.proof_data,
      timestamp: body.timestamp,
      verificationConfig: body.verification_config
    });

    // Validate the payload
    if (!body.user_id || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    // Validate that the verification config matches our contract requirements
    if (body.verification_config) {
      const configMatches = 
        body.verification_config.minimumAge === VERIFICATION_CONFIG.minimumAge &&
        body.verification_config.ofac === VERIFICATION_CONFIG.ofac;
      
      if (!configMatches) {
        console.warn('Verification config mismatch detected:', {
          received: body.verification_config,
          expected: VERIFICATION_CONFIG
        });
      }
    }

    if (body.status === 'success' && body.proof_data) {
      // Log the disclosed data we requested
      const disclosedData = {
        nationality: body.proof_data.nationality,
        gender: body.proof_data.gender,
        olderThan: body.proof_data.olderThan,
        hasPassedAgeVerification: body.proof_data.olderThan === String(VERIFICATION_CONFIG.minimumAge),
      };

      console.log('Verification successful for user:', body.user_id);
      console.log('Disclosed data:', disclosedData);

      // Here you would typically:
      // 1. Verify the proof cryptographically (if needed)
      // 2. Store the verification data in your database
      // 3. Call your contract to update user's verification status
      // 4. Emit events for real-time updates to frontend
      
      // For now, just acknowledge receipt
      return NextResponse.json({ 
        success: true, 
        message: 'Identity verification completed successfully',
        data: {
          userId: body.user_id,
          verified: true,
          disclosedData,
          verificationTimestamp: body.timestamp
        }
      });
    } else {
      console.log('Verification failed for user:', body.user_id);
      return NextResponse.json({ 
        success: true, 
        message: 'Verification failure acknowledged',
        data: {
          userId: body.user_id,
          verified: false,
          reason: body.status === 'failed' ? 'verification_failed' : 'unknown_status'
        }
      });
    }
    
  } catch (error) {
    console.error('Error processing Self ID verification callback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process verification callback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const info = searchParams.get('info');

  if (info === 'config') {
    return NextResponse.json({ 
      message: 'Self ID verification callback endpoint',
      status: 'active',
      version: '1.0.0',
      verificationConfig: VERIFICATION_CONFIG,
      excludedCountries: Object.entries(EXCLUDED_COUNTRY_NAMES).map(([code, name]) => ({ code, name })),
      supportedDisclosures: ['nationality', 'gender', 'olderThan']
    });
  }

  return NextResponse.json({ 
    message: 'Self ID verification callback endpoint',
    status: 'active',
    version: '1.0.0'
  });
}