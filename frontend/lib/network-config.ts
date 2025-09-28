// Network configurations for different contracts
export const NETWORK_CONFIG = {
  NOMADDATING: {
    chainId: 11142220, 
    rpcUrl: 'https://celo-sepolia.g.alchemy.com/v2/s3PEr8RVAHhn6_iToiOIhuAdMsFynrYi',
    contractAddress: '0xd5e4a7b1f649603fb87e5635b168c003e4face83',
    name: 'Celo Sepolia'
  },
  IDENTITY_STORAGE: {
    chainId: 11155111,
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/s3PEr8RVAHhn6_iToiOIhuAdMsFynrYi',
    contractAddress: '0x7b5910A44EC9CFA12d48911BfC36eB7C8500c720',
    name: 'Ethereum Sepolia'
  }
};

// Helper function to get correct network config for contract
export function getNetworkConfig(contractType: 'NOMADDATING' | 'IDENTITY_STORAGE') {
  return NETWORK_CONFIG[contractType];
}

// Check if an address exists on both networks
export async function checkAddressOnBothNetworks(address: string) {
  const results = {
    celoSepolia: false,
    ethSepolia: false
  };
  
  try {
    // This is a placeholder - you'd need to implement actual checks
    // For now, we'll assume the verification logic handles this
    console.log(`Checking address ${address} on both networks`);
    return results;
  } catch (error) {
    console.error('Error checking address on networks:', error);
    return results;
  }
}