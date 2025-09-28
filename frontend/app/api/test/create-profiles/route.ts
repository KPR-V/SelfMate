import { NextRequest, NextResponse } from 'next/server';

const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";


async function storeToWalrus(data: any): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${PUBLISHER}/v1/store`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Walrus store error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Walrus store result:', result);
    
    if (result.newlyCreated) {
      return result.newlyCreated.blobObject.blobId;
    } else if (result.alreadyCertified) {
      return result.alreadyCertified.blobId;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error storing to Walrus:', error.message);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating test profiles...');

    const testProfiles = [
      {
        name: 'Sofia Martinez',
        age: 25,
        bio: 'Digital nomad exploring the world 🌍 Currently in Bali. Love surfing, coffee, and deep conversations. Looking for someone to share adventures with!',
        nationality: 'US',
        photos: [
          'https://images.unsplash.com/photo-1494790108755-2616b2e5e5d8?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'
        ],
        interests: ['Travel', 'Surfing', 'Photography', 'Coffee'],
        address: '0x1234567890123456789012345678901234567890'
      },
      {
        name: 'Elena Rodriguez',
        age: 28,
        bio: 'Photographer and travel writer 📸 Based in Barcelona but always on the move. Fluent in 4 languages. Let\'s explore together!',
        nationality: 'ES',
        photos: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'
        ],
        interests: ['Photography', 'Writing', 'Languages', 'Culture'],
        address: '0x2345678901234567890123456789012345678901'
      },
      {
        name: 'Priya Sharma',
        age: 26,
        bio: 'Tech entrepreneur and yoga instructor 🧘‍♀️ Building the future while staying mindful. Currently nomading through Southeast Asia.',
        nationality: 'IN',
        photos: [
          'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=600&fit=crop'
        ],
        interests: ['Technology', 'Yoga', 'Meditation', 'Startups'],
        address: '0x3456789012345678901234567890123456789012'
      }
    ];

    const results = [];

    for (const profile of testProfiles) {
      console.log(`📝 Creating profile for ${profile.name}...`);
      
      // Store profile to Walrus
      const blobId = await storeToWalrus(profile);
      
      if (blobId) {
        results.push({
          name: profile.name,
          address: profile.address,
          blobId: blobId,
          success: true
        });
        console.log(`✅ Created profile for ${profile.name} with blob ID: ${blobId}`);
      } else {
        results.push({
          name: profile.name,
          address: profile.address,
          blobId: null,
          success: false,
          error: 'Failed to store to Walrus'
        });
        console.log(`❌ Failed to create profile for ${profile.name}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test profiles created',
      results: results,
      note: 'Remember to store these blob IDs in the IdentityStorage contract manually'
    });

  } catch (error: any) {
    console.error('❌ Error creating test profiles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create test profiles'
      },
      { status: 500 }
    );
  }
}