import { ethers } from "ethers";
import { getAccount, getWalletClient, getPublicClient } from 'wagmi/actions';
import { config } from './wagmi';
import { NOMAD_DATING_CONTRACT_ADDRESS, NOMAD_DATING_ABI } from "./contracts";

export interface UserData {
  address: string;
  isVerified: boolean;
  age?: number;
  gender?: string;
  nationality?: string;
}

export interface ContractDisclosureData {
  userIdentifier: string;
  nationality?: string;
  gender?: string;
  olderThan?: string;
  name?: string;
  date_of_birth?: string;
  passport_number?: string;
  expiry_date?: string;
  issuing_state?: string;
}

export class Web3Service {
  private contract: ethers.Contract | null = null;

  
  private async initializeContract(): Promise<ethers.Contract> {
    try {
      const account = getAccount(config);
      if (!account.isConnected || !account.address) {
        throw new Error("Wallet not connected");
      }

      const walletClient = await getWalletClient(config);
      if (!walletClient) {
        throw new Error("Wallet client not available");
      }

      
      const provider = new ethers.BrowserProvider(walletClient.transport, 'any');
      const signer = await provider.getSigner();

   
      const contract = new ethers.Contract(
        NOMAD_DATING_CONTRACT_ADDRESS,
        NOMAD_DATING_ABI,
        signer
      );

      return contract;
    } catch (error) {
      console.error("Error initializing contract:", error);
      throw error;
    }
  }

  
  private async getContract(): Promise<ethers.Contract> {
    if (!this.contract) {
      this.contract = await this.initializeContract();
    }
    return this.contract;
  }


  resetContract() {
    this.contract = null;
  }

  async getTotalUsers(): Promise<number> {
    try {
      const contract = await this.getContract();
      const totalUsers = await contract.totalUsers();
      return Number(totalUsers);
    } catch (error) {
      console.error("Error getting total users:", error);
      return 0;
    }
  }

  async isUserVerified(address: string): Promise<boolean> {
    try {
      const contract = await this.getContract();
      return await contract.verifiedHumans(address);
    } catch (error) {
      console.error("Error checking verification status:", error);
      return false;
    }
  }

 
  // Listen for UserVerified events with enhanced data extraction
  async onUserVerified(callback: (user: string, disclosedData: ContractDisclosureData) => void) {
    try {
      const contract = await this.getContract();
      
      contract.on("UserVerified", (user: string, output: any, userData: string) => {
        console.log("🎯 UserVerified event received!");
        console.log("User:", user);
        console.log("Output object:", output);
        console.log("Raw userData:", userData);
        
        try {
          // Parse the disclosed data from the contract event
          const disclosedData = this.parseDisclosedData(output, userData);
          console.log("📊 Parsed disclosed data from contract:", disclosedData);
          
          callback(user, disclosedData);
        } catch (error) {
          console.error("Error parsing disclosed data:", error);
          // Still call callback with basic data if parsing fails
          callback(user, { userIdentifier: user });
        }
      });
      
      console.log("✅ UserVerified event listener set up successfully");
    } catch (error) {
      console.error("Error setting up event listener:", error);
    }
  }

  // Parse disclosed data from contract event
  private parseDisclosedData(output: any, userData: string): ContractDisclosureData {
    const disclosedData: ContractDisclosureData = {
      userIdentifier: output.userIdentifier || ethers.ZeroAddress
    };

    try {
      // Try to extract from output object (Self Protocol standard format)
      if (output) {
        console.log("🔍 Parsing output object:", JSON.stringify(output, null, 2));
        
        // Handle different possible data structures
        if (output.disclosures || output.disclosed) {
          const disclosures = output.disclosures || output.disclosed;
          console.log("📋 Found disclosures object:", disclosures);
          
          // Extract each field if present
          if (disclosures.nationality !== undefined) disclosedData.nationality = disclosures.nationality;
          if (disclosures.gender !== undefined) disclosedData.gender = disclosures.gender;
          if (disclosures.olderThan !== undefined) disclosedData.olderThan = String(disclosures.olderThan);
          if (disclosures.name !== undefined) disclosedData.name = disclosures.name;
          if (disclosures.date_of_birth !== undefined) disclosedData.date_of_birth = disclosures.date_of_birth;
          if (disclosures.passport_number !== undefined) disclosedData.passport_number = disclosures.passport_number;
          if (disclosures.expiry_date !== undefined) disclosedData.expiry_date = disclosures.expiry_date;
          if (disclosures.issuing_state !== undefined) disclosedData.issuing_state = disclosures.issuing_state;
        }
        
        // Also check direct properties on output
        if (output.nationality !== undefined) disclosedData.nationality = output.nationality;
        if (output.gender !== undefined) disclosedData.gender = output.gender;
        if (output.olderThan !== undefined) disclosedData.olderThan = String(output.olderThan);
        if (output.name !== undefined) disclosedData.name = output.name;
        if (output.date_of_birth !== undefined) disclosedData.date_of_birth = output.date_of_birth;
      }

      // Try to parse userData if it contains JSON
      if (userData && userData !== '0x') {
        try {
          // If userData is hex, try to decode it
          let decodedUserData = userData;
          if (userData.startsWith('0x')) {
            // Try to decode as UTF-8 string
            const bytes = ethers.getBytes(userData);
            decodedUserData = ethers.toUtf8String(bytes);
          }
          
          console.log("🔧 Decoded userData:", decodedUserData);
          
          if (decodedUserData.startsWith('{')) {
            const parsedUserData = JSON.parse(decodedUserData);
            console.log("📦 Parsed userData JSON:", parsedUserData);
            
            // Merge with disclosed data
            Object.assign(disclosedData, parsedUserData);
          }
        } catch (e) {
          console.log("⚠️ Could not parse userData as JSON:", e);
        }
      }

    } catch (error) {
      console.error("Error in parseDisclosedData:", error);
    }

    console.log("✨ Final parsed disclosed data:", disclosedData);
    return disclosedData;
  }

  async removeAllListeners() {
    try {
      const contract = await this.getContract();
      contract.removeAllListeners();
    } catch (error) {
      console.error("Error removing event listeners:", error);
    }
  }


  async getCurrentAddress(): Promise<string | null> {
    try {
      const account = getAccount(config);
      return account.address || null;
    } catch (error) {
      console.error("Error getting address:", error);
      return null;
    }
  }
}


export const web3Service = new Web3Service();