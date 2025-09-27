'use client';

import type React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../lib/wagmi';
import { celoSepolia } from 'viem/chains';

const queryClient = new QueryClient();

export function RainbowKitProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={celoSepolia}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}