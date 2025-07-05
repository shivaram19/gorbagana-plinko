import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter } from '../wallets/BackpackWalletAdapter';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

export const GorbaganaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Gorbagana testnet endpoint - Backpack will use this automatically
  const endpoint = useMemo(() => 
    import.meta.env.VITE_GORBAGANA_RPC_URL || 'https://testnet-rpc.gorbagana.com', 
    []
  );

  // Configure wallets with Backpack as the primary option
  const wallets = useMemo(() => [
    new BackpackWalletAdapter(), // 🎒 Backpack first (best for Gorbagana)
    new PhantomWalletAdapter(),   // 👻 Phantom fallback
    new SolflareWalletAdapter(),  // ☀️ Solflare fallback
  ], []);

  console.log('🎒 Gorbagana Provider initialized with Backpack wallet');
  console.log('🔗 RPC Endpoint:', endpoint);

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
        wsEndpoint: import.meta.env.VITE_GORBAGANA_WS_URL,
      }}
    >
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false} // Let user choose when to connect
        localStorageKey="gorbagana-wallet"
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};