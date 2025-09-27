import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  localhost,
  celoSepolia
} from 'wagmi/chains';




export const config = getDefaultConfig({
  appName: 'Nomad Dating',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    localhost,
    celoSepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});