# SelfMate - Decentralized Dating Platform

A Web3-powered dating application that ensures verified, authentic connections through blockchain-based identity verification and decentralized data storage.

## 🌟 Features

### Core Features
- **🔐 Identity Verification**: Users must verify their identity using Self Protocol to access the platform
- **👥 Verified Matches**: Only interact with verified humans (18+ age verification with geographic restrictions)
- **🌍 Global Nomad Support**: Designed for digital nomads and travelers
- **💾 Decentralized Storage**: Profile data stored on Walrus Network for privacy and decentralization
- **🔗 Blockchain Integration**: Smart contracts ensure transparency and trust
- **📱 Mobile-First Design**: Responsive design optimized for mobile devices

### Security & Privacy
- **Age Verification**: Ensures all users are 18+ through Self Protocol
- **OFAC Compliance**: Built-in sanctions screening
- **Geographic Restrictions**: Configurable country-based access controls
- **Decentralized Data**: User data stored on Walrus Network, not centralized servers
- **JWT Authentication**: Secure session management for verified users

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Smart          │    │  Walrus         │
│   (Next.js)     │◄──►│  Contracts      │◄──►│  Storage        │
│                 │    │  (Ethereum)     │    │  Network        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Self          │    │  RainbowKit     │    │  API Routes     │
│   Protocol      │    │  (Wallet)       │    │  (Backend)      │
│   (Identity)    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- Metamask or compatible Web3 wallet
- Foundry (for smart contract development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KPR-V/SelfMate.git
   cd SelfMate
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure environment variables (see Frontend Configuration)
   npm run dev
   ```

3. **Setup Smart Contracts**
   ```bash
   cd contracts
   forge install
   # Configure .env file with private keys and RPC URLs
   forge build
   ```

### Environment Configuration

#### Frontend (.env.local)
```env
# Walrus Configuration
WALRUS_PUBLISHER_URL=https://publisher.walrus.site
WALRUS_AGGREGATOR_URL=https://aggregator.walrus.site

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

#### Contracts (.env)
```env
PRIVATE_KEY=your-private-key
SEPOLIA_RPC_URL=your-sepolia-rpc-url
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## 📁 Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages and API routes
│   │   ├── api/            # Backend API endpoints
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── profile/    # Profile management
│   │   │   ├── identity/   # Identity verification
│   │   │   └── walrus/     # Walrus storage integration
│   │   └── ...
│   ├── components/          # React components
│   │   ├── LandingPage.tsx # Welcome page
│   │   ├── DiscoverPage.tsx# Swipe/discover interface  
│   │   ├── ProfilePage.tsx # User profile management
│   │   ├── SwipeCard.tsx   # Tinder-like swipe cards
│   │   └── ...
│   └── lib/                # Utility libraries
│       ├── contracts.ts    # Smart contract integration
│       ├── web3.ts         # Web3 utilities
│       ├── self.ts         # Self Protocol integration
│       └── context.tsx     # React context/state management
├── contracts/               # Smart contracts (Foundry project)
│   ├── src/
│   │   ├── nomaddating.sol # Main dating contract
│   │   └── IdentityStorage.sol # Identity storage contract
│   ├── script/             # Deployment scripts
│   └── test/               # Contract tests
├── README.md
```

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 15.5.4 with React 19
- **Styling**: TailwindCSS 4.0
- **Web3**: Wagmi 2.17.5, RainbowKit, Viem
- **Animation**: Framer Motion
- **Identity**: Self Protocol (@selfxyz/core, @selfxyz/qrcode)
- **Storage**: Walrus Network (@mysten/walrus)
- **Authentication**: JWT
- **Code Quality**: Biome (linting & formatting)

### Smart Contracts
- **Framework**: Foundry
- **Language**: Solidity ^0.8.28
- **Standards**: OpenZeppelin contracts
- **Networks**: Ethereum Sepolia (testnet), Mainnet ready

### Storage & Identity
- **Identity Verification**: Self Protocol
- **Decentralized Storage**: Walrus Network

## 📱 App Flow

1. **Landing**: User arrives and connects wallet
2. **Identity Verification**: Complete Self Protocol verification (18+, OFAC, geographic checks)
3. **Profile Creation**: Upload photos and create profile (stored on Walrus)
4. **Discovery**: Swipe through verified users
5. **Matching**: Connect with mutual likes
6. **Messaging**: Chat with matches (future feature)

## 🔐 Smart Contracts

### NomadDating.sol
- **Address (CeloSepolia)**: `0xd5e4a7b1f649603fb87e5635b168c003e4face83`
- **Purpose**: Main verification and user management
- **Key Functions**:
  - `customVerificationHook()`: Handles Self Protocol verification
  - `verifiedHumans()`: Track verified users
  - Admin controls (pause, remove users)

### IdentityStorage.sol  
- **Purpose**: Store and manage Walrus blob IDs for user data
- **Key Functions**:
  - `storeIdentity()`: Link wallet to Walrus blob ID
  - `storeProfile()`: Store profile data blob ID
  - `getIdentity()` / `getProfile()`: Retrieve user data

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Create JWT session
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/verify` - Check auth status

### Identity Management
- `POST /api/identity/store` - Store identity to Walrus
- `GET /api/identity/retrieve` - Retrieve identity data

### Profile Management
- `POST /api/profile/create` - Create user profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Walrus Integration
- `POST /api/walrus/upload` - Upload data to Walrus
- `GET /api/walrus/retrieve` - Retrieve from Walrus

### Contract Interaction
- `GET /api/contract-stats` - Contract statistics
- `GET /api/verification/status` - User verification status
- `POST /api/admin` - Admin operations

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```

### Smart Contract Deployment
```bash
cd contracts
# Deploy to CeloSepolia
forge script script/deploy.s.sol --rpc-url $CELOSEPLOIA_RPC_URL --broadcast --verify

# Deploy Identity Storage to eth Sepolia
forge script script/DeployIdentityStorage.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

## 🧪 Development & Testing

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run lint         # Run linting
npm run format       # Format code
```

### Smart Contract Testing
```bash
cd contracts
forge test           # Run tests
forge test -vvv      # Verbose output
forge coverage       # Test coverage
```

## 🔒 Security Features

- **Identity Verification**: Mandatory Self Protocol verification
- **Age Verification**: 18+ age requirement enforced
- **Geographic Restrictions**: Configurable country blocking
- **OFAC Compliance**: Sanctions list screening
- **Smart Contract Security**: OpenZeppelin security patterns
- **Access Control**: Owner-only admin functions
- **Reentrancy Protection**: ReentrancyGuard implementation
- **Circuit Breakers**: Pausable contract functionality



## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.






## 📊 Project Status

- ✅ Smart Contract Development
- ✅ Identity Verification Integration
- ✅ Walrus Storage Integration
- ✅ Frontend Core Features
- ✅ Profile Management
- ✅ Swipe/Discovery Interface
- 🚧 Real-time Messaging
- 🚧 Push Notifications
- 🚧 Mobile App (React Native)
- 🚧 Mainnet Deployment

---

**Built with ❤️ for the decentralized future of dating**