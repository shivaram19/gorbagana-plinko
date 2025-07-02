import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect } from 'react';

const GOR_DECIMALS = 9; // Assuming GOR has 9 decimals like SOL
const LAMPORTS_PER_GOR = Math.pow(10, GOR_DECIMALS);

export const useGorbaganaWallet = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signMessage, connected, disconnect, wallet } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Check if Backpack wallet is connected
  const isBackpackWallet = wallet?.adapter?.name === 'Backpack';

  // Get GOR balance
  const fetchBalance = async (): Promise<number> => {
    if (!publicKey) return 0;
    
    try {
      setLoading(true);
      const balance = await connection.getBalance(publicKey);
      const gorBalance = balance / LAMPORTS_PER_GOR;
      setBalance(gorBalance);
      return gorBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  // Send GOR tokens
  const sendGOR = async (to: string, amount: number): Promise<string> => {
    if (!publicKey || !signTransaction) throw new Error('Wallet not connected');
    if (amount > balance) throw new Error('Insufficient balance');

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(to),
        lamports: amount * LAMPORTS_PER_GOR,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    // Refresh balance
    await fetchBalance();
    
    return signature;
  };

  // Sign authentication message (optimized for Backpack)
  const signAuthMessage = async (): Promise<string> => {
    if (!signMessage || !publicKey) throw new Error('Wallet not connected');
    
    const message = `Authenticate with Gorbagana Plinko Wars

Wallet: ${publicKey.toString()}
Network: Gorbagana Testnet
Timestamp: ${Date.now()}

🎒 Powered by Backpack Wallet`;
    
    const encodedMessage = new TextEncoder().encode(message);
    const signature = await signMessage(encodedMessage);
    
    return Buffer.from(signature).toString('base64');
  };

  // Auto-fetch balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      console.log(`🎒 ${isBackpackWallet ? 'Backpack' : 'Wallet'} connected:`, publicKey.toString());
      fetchBalance();
    } else {
      setBalance(0);
    }
  }, [connected, publicKey]);

  // Log Backpack-specific information
  useEffect(() => {
    if (isBackpackWallet && connected) {
      console.log('🎒 Backpack wallet detected - optimized for Gorbagana!');
    }
  }, [isBackpackWallet, connected]);

  return {
    publicKey: publicKey?.toString() || null,
    connected,
    balance,
    loading,
    fetchBalance,
    sendGOR,
    signAuthMessage,
    disconnect,
    isBackpackWallet,
    walletName: wallet?.adapter?.name || 'Unknown'
  };
};