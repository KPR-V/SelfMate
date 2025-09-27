# Self ID QR Code Troubleshooting Guide

## Common Issues and Solutions

### 1. **QR Code Not Appearing**

**Symptoms:**
- Empty div where QR code should be
- "Loading QR Code..." message persists
- Console errors during initialization

**Potential Causes & Solutions:**

#### A. Wallet Not Connected
```typescript
// Check if user.address exists
if (!user?.address) {
  // Show wallet connection prompt
  return <div>Connect wallet first</div>
}
```

#### B. Invalid Self App Configuration
```typescript
// Common configuration issues:
const app = new SelfAppBuilder({
  version: 2, // Must be 2
  endpoint: "0xcontractaddress", // Must be lowercase
  endpointType: "staging_https", // For contract endpoints
  userIdType: "hex", // For wallet addresses
  userId: user.address, // Must be valid wallet address
  // ... other config
}).build();
```

#### C. Missing Environment Variables
```bash
# Check .env.local exists and contains:
NEXT_PUBLIC_SELF_APP_NAME="Nomad Dating"
NEXT_PUBLIC_SELF_SCOPE="nomad-dating"
NEXT_PUBLIC_SELF_ENDPOINT="0xd5e4a7b1f649603fb87e5635b168c003e4face83"
```

### 2. **Self App Initialization Failures**

**Symptoms:**
- Console error: "Failed to initialize Self app"
- SelfApp is null after initialization

**Solutions:**

#### A. Check Country Code Import
```typescript
import { countries } from '@selfxyz/qrcode';

// Use proper country constants
excludedCountries: [countries.PAKISTAN, countries.AZERBAIJAN, countries.KAZAKHSTAN]

// NOT string literals like:
excludedCountries: ["PAK", "AZE", "KAZ"] // This might fail
```

#### B. Validate Disclosure Configuration
```typescript
disclosures: {
  // Verification requirements (must match contract exactly)
  minimumAge: 18,
  excludedCountries: [countries.PAKISTAN, countries.AZERBAIJAN, countries.KAZAKHSTAN],
  ofac: true,
  
  // Data requests
  nationality: true,
  gender: true,
}
```

### 3. **QR Code Appears But Scanning Fails**

**Symptoms:**
- QR code visible and scannable
- Self mobile app shows errors
- Verification doesn't complete

**Solutions:**

#### A. Frontend-Backend Config Mismatch
Ensure frontend disclosures **exactly match** contract verification config:

**Contract Config:**
```solidity
// nomaddating.sol
SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = SelfUtils
    .UnformattedVerificationConfigV2({
        olderThan: 18,                    // ✅ Frontend: minimumAge: 18
        forbiddenCountries: [             // ✅ Frontend: excludedCountries
            CountryCodes.PAKISTAN,        // countries.PAKISTAN
            CountryCodes.AZERBAIJAN,      // countries.AZERBAIJAN
            CountryCodes.KAZAKHSTAN       // countries.KAZAKHSTAN
        ],
        ofacEnabled: true                 // ✅ Frontend: ofac: true
    });
```

**Frontend Config:**
```typescript
disclosures: {
  minimumAge: 18,                       // Must match olderThan: 18
  excludedCountries: [                  // Must match forbiddenCountries exactly
    countries.PAKISTAN,
    countries.AZERBAIJAN, 
    countries.KAZAKHSTAN
  ],
  ofac: true,                          // Must match ofacEnabled: true
  nationality: true,
  gender: true,
}
```

#### B. Incorrect Endpoint Format
```typescript
// ✅ Correct - contract address in lowercase
endpoint: "0xd5e4a7b1f649603fb87e5635b168c003e4face83"

// ❌ Wrong - mixed case will fail
endpoint: "0xd5e4a7B1F649603fb87E5635B168c003E4FacE83"
```

### 4. **Component Implementation Issues**

**Symptoms:**
- Component renders but QR doesn't work
- TypeScript errors
- Event handlers not firing

**Solutions:**

#### A. Use Direct SelfAppBuilder Pattern
```typescript
// ✅ Direct pattern (like working example)
const [selfApp, setSelfApp] = useState<SelfApp | null>(null);

useEffect(() => {
  if (!user?.address) return;
  
  const app = new SelfAppBuilder({
    // config here
  }).build();
  
  setSelfApp(app);
}, [user?.address]);

// ❌ Avoid complex service abstractions that can fail
```

#### B. Proper Event Handler Types
```typescript
// ✅ Correct handler signature
const handleSuccess = () => {
  console.log('Verified!');
};

// ❌ Wrong - SelfQRcodeWrapper expects () => void
const handleSuccess = (data: any) => {
  console.log('Verified!', data);
};
```

### 5. **Network and Environment Issues**

#### A. Development vs Production
```typescript
// Different endpoints for different environments
const endpoint = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_SELF_ENDPOINT_PROD
  : process.env.NEXT_PUBLIC_SELF_ENDPOINT || "0xd5e4a7b1f649603fb87e5635b168c003e4face83";
```

#### B. CSP and CORS Issues
```typescript
// If running into CSP issues, check Next.js config
// Self ID might need specific CSP permissions
```

## Debugging Steps

### 1. **Check Console Output**
```javascript
// Look for these in browser console:
console.log('Self app initialized successfully');
console.error('Failed to initialize Self app:', error);
```

### 2. **Verify Configuration**
```typescript
// Add debug output
console.log('Configuration:', {
  userId: user.address,
  endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT,
  disclosures: SELF_DISCLOSURES
});
```

### 3. **Test with Simple Component**
Use the `SimpleSelfVerify` component that closely matches the working example.

### 4. **Check Package Versions**
```json
{
  "@selfxyz/core": "^1.1.0-beta.6",
  "@selfxyz/qrcode": "^1.0.15"
}
```

## Working Components Priority

1. **SimpleSelfVerify** - Closest to working example
2. **ImprovedVerificationPage** - Enhanced with better error handling
3. **VerificationPage** - Original with service abstraction
4. **SelfQRCode** - Service-based component

## Testing Checklist

- [ ] Wallet is connected
- [ ] Environment variables are set
- [ ] Contract address is lowercase
- [ ] Disclosure config matches contract exactly
- [ ] Country codes use `countries.COUNTRY_NAME` format
- [ ] Console shows successful Self app initialization
- [ ] QR code renders visually
- [ ] QR code is scannable with Self mobile app
- [ ] Verification completes without errors

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to initialize Self app" | Invalid config | Check all config parameters |
| "Connect wallet first" | No wallet connected | Connect wallet |
| "Invalid disclosure config" | Config mismatch | Ensure frontend matches contract |
| "Endpoint not found" | Bad contract address | Verify contract address format |
| "Country code invalid" | Wrong country format | Use `countries.COUNTRY_NAME` |

## Support

If issues persist:
1. Test with the `SimpleSelfVerify` component
2. Check all configuration matches exactly
3. Verify contract is deployed correctly
4. Test with a different wallet address
5. Check Self Protocol documentation for updates