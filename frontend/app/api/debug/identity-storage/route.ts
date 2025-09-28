import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getNetworkConfig } from '@/lib/network-config';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking IdentityStorage contract directly...');
    
    // Use Ethereum Sepolia network for IdentityStorage contract  
    const identityStorageConfig = getNetworkConfig('IDENTITY_STORAGE');
    const rpcUrl = identityStorageConfig.rpcUrl;
    const identityStorageABI = [
      "function getAllBlobIds() external view returns (address[] memory addresses, string[] memory blobIds)",
      "function getUserBlobId(address user) external view returns (string memory)",
      "function getTotalUsers() external view returns (uint256)",
      "function getAllUserAddresses() external view returns (address[] memory)",
      "function storeBlobId(string memory blobId) external"
    ];
    
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract("0x7b5910A44EC9CFA12d48911BfC36eB7C8500c720", identityStorageABI, provider);
    
    // Get all blob IDs
    const [addresses, blobIds] = await contract.getAllBlobIds();
    const totalUsers = await contract.getTotalUsers();
    
    console.log(`📊 IdentityStorage has ${totalUsers} users with blob IDs`);
    console.log(`📝 Addresses: ${addresses}`);
    console.log(`🔗 Blob IDs: ${blobIds}`);
    
    // Get individual user data for the first few verified users
    const verifiedUsers = [
      "0x1c32A90A83511534F2582E631314569ff6C76875",
      "0xC50df0FE9a20Fd0e467592b358cd598334acc7Ea", 
      "0x5352b10D192475cA7Fa799e502c29Ab3AA28657F",
      "0x4bB1264FE54770d74aA0313ceBa6d9ed5c9C1417"
    ];
    
    const userChecks = [];
    for (const userAddress of verifiedUsers) {
      try {
        const blobId = await contract.getUserBlobId(userAddress);
        userChecks.push({
          address: userAddress,
          blobId: blobId || null,
          hasData: blobId && blobId.length > 0
        });
      } catch (error) {
        userChecks.push({
          address: userAddress,
          blobId: null,
          hasData: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      identityStorage: {
        contractAddress: "0x7b5910A44EC9CFA12d48911BfC36eB7C8500c720",
        totalUsers: Number(totalUsers),
        allAddresses: addresses,
        allBlobIds: blobIds,
        userChecks: userChecks
      },
      message: totalUsers > 0 
        ? `Found ${totalUsers} users with stored blob IDs`
        : 'No users have stored blob IDs yet'
    });

  } catch (error: any) {
    console.error('❌ Error checking IdentityStorage:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to check IdentityStorage contract',
        details: error.stack
      },
      { status: 500 }
    );
  }
}