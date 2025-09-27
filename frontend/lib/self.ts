import { SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
import { getUniversalLink } from "@selfxyz/core";
import { ethers } from "ethers";
import { SELF_DISCLOSURES, SELF_APP_CONFIG, CONTRACT_ADDRESS } from "./disclosure-config";

export interface SelfVerificationData {
  age: number;
  gender: string;
  nationality: string;
  olderThan?: string;
}

export interface SelfDiscloseOutput {
  nationality?: string;
  gender?: "M" | "F";
  olderThan?: string;
  name?: string;
  date_of_birth?: string;
  passport_number?: string;
  expiry_date?: string;
  issuing_state?: string;
}

export class SelfService {
  private selfApp: SelfApp | null = null;
  
  constructor() {
    this.initializeSelfApp(ethers.ZeroAddress);
  }

  private initializeSelfApp(userId: string) {
    try {
      this.selfApp = new SelfAppBuilder({
        ...SELF_APP_CONFIG,
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || CONTRACT_ADDRESS,
        userId: userId,
        disclosures: SELF_DISCLOSURES
      }).build();
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      this.selfApp = null;
    }
  }

  updateUserId(walletAddress: string) {
    this.initializeSelfApp(walletAddress);
  }

  getSelfApp(): SelfApp | null {
    return this.selfApp;
  }

  getUniversalLink(): string {
    if (!this.selfApp) {
      return "";
    }
    return getUniversalLink(this.selfApp);
  }

  isInitialized(): boolean {
    return this.selfApp !== null;
  }
}

export const selfService = new SelfService();