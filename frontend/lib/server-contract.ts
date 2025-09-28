import { ethers } from "ethers";
import { NOMAD_DATING_CONTRACT_ADDRESS, NOMAD_DATING_ABI } from "./contracts";

// Server-side contract instance for backend operations
class ServerContractService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract;
  private contractAddress: string;
  private fallbackMode: boolean = false;
  
  constructor() {
    const rpcUrl = process.env.RPC_URL || "https://forno.celo-sepolia.celo-testnet.org";
    const privateKey = process.env.PRIVATE_KEY;
    this.contractAddress = process.env.NOMAD_DATING_CONTRACT_ADDRESS || NOMAD_DATING_CONTRACT_ADDRESS;
    
    console.log('🔧 Initializing ServerContractService');
    console.log('📍 Contract Address:', this.contractAddress);
    console.log('🌐 RPC URL:', rpcUrl);
    console.log('🔑 Private Key provided:', !!privateKey);
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (privateKey) {
      try {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers.Contract(
          this.contractAddress,
          NOMAD_DATING_ABI,
          this.wallet
        );
        console.log('✅ Contract initialized with wallet');
      } catch (error) {
        console.error('❌ Failed to initialize wallet:', error);
        // Fall back to read-only contract
        this.contract = new ethers.Contract(
          this.contractAddress,
          NOMAD_DATING_ABI,
          this.provider
        );
        console.log('📖 Contract initialized as read-only');
      }
    } else {
      console.log('⚠️ No private key provided, initializing read-only contract');
      this.contract = new ethers.Contract(
        this.contractAddress,
        NOMAD_DATING_ABI,
        this.provider
      );
    }
  }

  // Check if contract exists and is valid
  async validateContract(): Promise<boolean> {
    try {
      console.log('🔍 Validating contract at:', this.contractAddress);
      
      // Check if there's code at the contract address
      const code = await this.provider.getCode(this.contractAddress);
      if (code === '0x') {
        console.error('❌ No contract code found at address:', this.contractAddress);
        return false;
      }
      
      console.log('✅ Contract code found, length:', code.length);
      
      // Try to get network info
      const network = await this.provider.getNetwork();
      console.log('🌐 Connected to network:', network.name, 'chainId:', network.chainId.toString());
      
      return true;
    } catch (error) {
      console.error('❌ Contract validation failed:', error);
      return false;
    }
  }

  // Get total number of verified users
  async getTotalUsers(): Promise<number> {
    try {
      console.log('📊 Getting total users from contract...');
      
      // Validate contract first
      const isValid = await this.validateContract();
      if (!isValid) {
        console.error('❌ Contract validation failed');
        return 0;
      }
      
      const totalUsers = await this.contract.totalUsers();
      console.log('✅ Total users retrieved:', totalUsers?.toString());
      return Number(totalUsers || 0);
    } catch (error) {
      console.error("❌ Error getting total users:", error);
      
      // Check if it's a decoding error
      if (error instanceof Error && error.message.includes('could not decode result data')) {
        console.error('🔍 Decode error - contract may not exist or ABI mismatch');
        console.error('📍 Contract address:', this.contractAddress);
      }
      
      return 0;
    }
  }

  // Check if a user is verified
  async isUserVerified(userAddress: string): Promise<boolean> {
    try {
      console.log('🔍 Checking verification for user:', userAddress);
      
      // Validate contract first
      const isValid = await this.validateContract();
      if (!isValid) {
        console.error('❌ Contract validation failed');
        return false;
      }
      
      // Validate address format
      if (!ethers.isAddress(userAddress)) {
        console.error('❌ Invalid address format:', userAddress);
        return false;
      }
      
      const isVerified = await this.contract.verifiedHumans(userAddress);
      console.log('✅ User verification status:', isVerified);
      return Boolean(isVerified);
    } catch (error) {
      console.error("❌ Error checking user verification:", error);
      
      // Check if it's a decoding error
      if (error instanceof Error && error.message.includes('could not decode result data')) {
        console.error('🔍 Decode error - contract may not exist or ABI mismatch');
        console.error('📍 Contract address:', this.contractAddress);
        console.error('👤 User address:', userAddress);
      }
      
      return false;
    }
  }

  // Get current scope
  async getCurrentScope(): Promise<number> {
    try {
      console.log('🔍 Getting current scope from contract...');
      
      const isValid = await this.validateContract();
      if (!isValid) {
        console.error('❌ Contract validation failed');
        return 0;
      }
      
      const scope = await this.contract.getCurrentScope();
      console.log('✅ Current scope retrieved:', scope?.toString());
      return Number(scope || 0);
    } catch (error) {
      console.error("❌ Error getting current scope:", error);
      return 0;
    }
  }

  // Get contract configuration ID
  async getConfigId(userDefinedData: string = "0x"): Promise<string> {
    try {
      console.log('🔍 Getting config ID from contract...');
      
      const isValid = await this.validateContract();
      if (!isValid) {
        console.error('❌ Contract validation failed');
        return ethers.ZeroHash;
      }
      
      const configId = await this.contract.getConfigId(
        ethers.ZeroHash,
        ethers.ZeroHash,
        userDefinedData
      );
      console.log('✅ Config ID retrieved:', configId);
      return configId || ethers.ZeroHash;
    } catch (error) {
      console.error("❌ Error getting config ID:", error);
      return ethers.ZeroHash;
    }
  }

  // Check if contract is paused
  async isPaused(): Promise<boolean> {
    try {
      console.log('🔍 Checking if contract is paused...');
      
      const isValid = await this.validateContract();
      if (!isValid) {
        console.error('❌ Contract validation failed');
        return true; // Assume paused if we can't connect
      }
      
      const paused = await this.contract.paused();
      console.log('✅ Contract pause status:', paused);
      return Boolean(paused);
    } catch (error) {
      console.error("❌ Error checking pause status:", error);
      return true; // Assume paused on error
    }
  }

  // Get contract owner (requires owner permissions)
  async getOwner(): Promise<string> {
    try {
      console.log('🔍 Getting contract owner...');
      
      const isValid = await this.validateContract();
      if (!isValid) {
        console.error('❌ Contract validation failed');
        return ethers.ZeroAddress;
      }
      
      const owner = await this.contract.owner();
      console.log('✅ Contract owner retrieved:', owner);
      return owner || ethers.ZeroAddress;
    } catch (error) {
      console.error("❌ Error getting owner:", error);
      return ethers.ZeroAddress;
    }
  }

  // Admin function to pause contract (requires owner permissions)
  async pauseContract(): Promise<ethers.TransactionResponse> {
    try {
      const tx = await this.contract.pause();
      return tx;
    } catch (error) {
      console.error("Error pausing contract:", error);
      throw error;
    }
  }

  // Admin function to unpause contract (requires owner permissions)
  async unpauseContract(): Promise<ethers.TransactionResponse> {
    try {
      const tx = await this.contract.unpause();
      return tx;
    } catch (error) {
      console.error("Error unpausing contract:", error);
      throw error;
    }
  }

  // Admin function to remove verified human (requires owner permissions)
  async removeVerifiedHuman(userAddress: string): Promise<ethers.TransactionResponse> {
    try {
      const tx = await this.contract.removeVerifiedHuman(userAddress);
      return tx;
    } catch (error) {
      console.error("Error removing verified human:", error);
      throw error;
    }
  }

  // Listen for UserVerified events
  onUserVerified(callback: (user: string, output: any, userData: string) => void) {
    this.contract.on("UserVerified", callback);
  }

  // Get past UserVerified events
  async getPastUserVerifiedEvents(fromBlock: number = 0) {
    try {
      const filter = this.contract.filters.UserVerified();
      const events = await this.contract.queryFilter(filter, fromBlock);
      return events;
    } catch (error) {
      console.error("Error getting past events:", error);
      throw error;
    }
  }

  // Get all verified users from UserVerified events
  async getAllVerifiedUsers(): Promise<string[]> {
    try {
      console.log('🔍 Getting all verified users from events...');
      
      const isValid = await this.validateContract();
      if (!isValid) {
        console.error('❌ Contract validation failed');
        return [];
      }

      const events = await this.getPastUserVerifiedEvents(0);
      const verifiedUsers = events.map((event: any) => event.args?.user).filter(Boolean);
      
      console.log('✅ Found verified users:', verifiedUsers);
      return verifiedUsers;
    } catch (error) {
      console.error("❌ Error getting verified users:", error);
      return [];
    }
  }

  // Get all profiles with blob IDs from IdentityStorage contract
  async getAllProfilesWithBlobIds(): Promise<Array<{ address: string; blobId: string }>> {
    try {
      console.log('🔍 Getting profiles with blob IDs from IdentityStorage...');
      
      const identityStorageAddress = process.env.IDENTITY_STORAGE_CONTRACT_ADDRESS || "0x6e83E0d533b97E6FCc6cf32Af9Ceb7C1aB99A03e";
      const identityStorageABI = [
        "function getAllBlobIds() external view returns (address[] memory addresses, string[] memory blobIds)",
        "function getUserBlobId(address user) external view returns (string memory)",
        "function getTotalUsers() external view returns (uint256)"
      ];
      
      const identityContract = new ethers.Contract(identityStorageAddress, identityStorageABI, this.provider);
      const [addresses, blobIds] = await identityContract.getAllBlobIds();
      
      const profiles = addresses.map((address: string, index: number) => ({
        address: address,
        blobId: blobIds[index]
      })).filter((profile: any) => profile.blobId && profile.blobId.length > 0);
      
      console.log('✅ Found profiles with blob IDs:', profiles);
      return profiles;
    } catch (error) {
      console.error("❌ Error getting profiles with blob IDs:", error);
      return [];
    }
  }

  // Get contract instance for custom operations
  getContract(): ethers.Contract {
    return this.contract;
  }

  // Get provider instance
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  // Get wallet instance
  getWallet(): ethers.Wallet | null {
    return this.wallet;
  }
}

// Singleton instance
let serverContractInstance: ServerContractService | null = null;

export function getServerContract(): ServerContractService {
  if (!serverContractInstance) {
    serverContractInstance = new ServerContractService();
  }
  return serverContractInstance;
}

export { ServerContractService };