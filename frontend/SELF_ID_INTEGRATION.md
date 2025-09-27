# Self ID Verification Integration Guide

## Overview

This integration provides passport-based identity verification for the Nomad Dating app using Self Protocol. The configuration is precisely aligned with the deployed smart contract requirements.

## Contract Configuration Match

The frontend verification config **exactly matches** the deployed contract at `0xd5e4a7b1f649603fb87e5635b168c003e4face83`:

### Smart Contract Requirements:
```solidity
// From nomaddating.sol constructor
SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = SelfUtils
    .UnformattedVerificationConfigV2({
        olderThan: 18,                    // ✅ Frontend: minimumAge: 18
        forbiddenCountries: [             // ✅ Frontend: excludedCountries
            "PAK",  // Pakistan
            "AZE",  // Azerbaijan  
            "KAZ"   // Kazakhstan
        ],
        ofacEnabled: true                 // ✅ Frontend: ofac: true
    });
```

### Frontend Configuration:
```typescript
// lib/disclosure-config.ts
export const VERIFICATION_CONFIG = {
  minimumAge: 18,                       // ✅ Matches contract olderThan
  excludedCountries: [                  // ✅ Matches contract forbiddenCountries
    countries.PAKISTAN,    // "PAK"
    countries.AZERBAIJAN,  // "AZE" 
    countries.KAZAKHSTAN   // "KAZ"
  ],
  ofac: true                           // ✅ Matches contract ofacEnabled
};
```

## Components

### 1. **VerificationPage** (Complete solution)
Full-featured verification page with status indicators, error handling, and user guidance.

```tsx
import VerificationPage from '@/components/VerificationPage';

<VerificationPage 
  onSuccess={(disclosedData) => {
    console.log('User verified!', disclosedData);
    // disclosedData contains: nationality, gender, olderThan
  }}
  onError={(error) => {
    console.log('Verification failed:', error);
  }}
/>
```

### 2. **SelfQRCode** (Simple QR component)
Minimal QR code component for integration into existing UI.

```tsx
import SelfQRCode from '@/components/SelfQRCode';

<SelfQRCode 
  onSuccess={(disclosedData) => handleVerified(disclosedData)}
  onError={(error) => handleError(error)}
/>
```

## Verification Flow

```
1. User connects wallet → Updates userId in Self app
2. QR code displayed → User scans with Self mobile app  
3. Self app verifies → Checks age ≥18, country not excluded, OFAC clean
4. Proof generated → Sent to contract address (0xd5e4...face83)
5. Contract verifies → Calls customVerificationHook() 
6. User marked verified → verifiedHumans[userAddress] = true
7. Callback sent → API receives disclosed data
8. Frontend updated → onSuccess() triggered with disclosed data
```

## Disclosed Data

Users will share **only** the following information:

```typescript
interface DisclosedData {
  nationality: string;    // e.g., "USA", "GBR", "CAN"
  gender: "M" | "F";      // Gender from passport
  olderThan: string;      // "18" (confirms age ≥ 18 without revealing exact age)
}
```

**Privacy Protection:**
- Exact age/birthdate: ❌ Not disclosed
- Name: ❌ Not disclosed  
- Passport number: ❌ Not disclosed
- Other personal details: ❌ Not disclosed

## API Endpoints

### Verification Callback: `POST /api/verification/callback`
Receives verification results from Self Protocol.

### Status Check: `GET /api/verification/status?userId={address}`
Check verification status for a user.

### Config Info: `GET /api/verification/callback?info=config`
Returns current verification configuration and requirements.

## Environment Variables

```env
# Required in .env.local
NEXT_PUBLIC_SELF_APP_NAME="Nomad Dating"
NEXT_PUBLIC_SELF_SCOPE="nomad-dating"  
NEXT_PUBLIC_SELF_ENDPOINT="0xd5e4a7b1f649603fb87e5635b168c003e4face83"
```

## Integration with Your App Context

The components integrate with your existing `useApp()` context:

```typescript
// Assumes your context provides:
const { user, refreshUserData } = useApp();

// Where user contains:
interface User {
  address: string;     // Wallet address
  isVerified?: boolean; // Verification status
}
```

## Smart Contract Integration

After successful verification, users are marked in the contract:

```solidity
// Check if user is verified
bool isVerified = verifiedHumans[userAddress];

// Use the modifier in your functions
modifier onlyVerifiedHuman() {
    require(verifiedHumans[msg.sender], "Must be Self Protocol verified human");
    _;
}
```

## Error Handling

Common error scenarios handled:

- **Wallet not connected**: Shows connection prompt
- **Self app initialization failed**: Shows retry option
- **Verification failed**: Age/country/OFAC requirements not met
- **Network errors**: Automatic retry mechanisms
- **Config mismatch**: Logs warnings for debugging

## Development vs Production

### Development
- Debug information shown in UI
- Detailed console logging
- Configuration validation warnings

### Production  
- Clean user interface
- Essential logging only
- Graceful error handling

## Testing Verification

1. **Connect wallet** with valid Ethereum address
2. **Scan QR code** with Self mobile app
3. **Verify passport** (must meet age/country/OFAC requirements)
4. **Check callback** in API logs
5. **Confirm contract state** - user should be in `verifiedHumans` mapping

## Security Considerations

- **Frontend config MUST match contract**: Mismatched configs cause transaction failures
- **Contract address lowercase**: Required by Self Protocol
- **User data privacy**: Only minimal required data is disclosed
- **Proof verification**: Contract handles cryptographic proof validation
- **Sanctions compliance**: OFAC checking enabled automatically