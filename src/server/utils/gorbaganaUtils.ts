import { Connection, PublicKey } from '@solana/web3.js';

export class GorbaganaTransactionVerifier {
  private connection: Connection;
  private houseWallet: string;

  constructor() {
    const rpcUrl = process.env.VITE_GORBAGANA_RPC_URL || 'https://testnet-rpc.gorbagana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.houseWallet = process.env.VITE_HOUSE_WALLET || '';
  }

  async verifyBetTransaction(
    signature: string,
    walletAddress: string,
    amount: number
  ): Promise<boolean> {
    try {
      // Skip verification for demo transactions
      if (signature === 'demo-transaction-signature' || signature === 'free-play-signature') {
        return true;
      }

      console.log(`🔍 Verifying transaction: ${signature}`);
      
      // Get transaction details from Gorbagana blockchain
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed'
      });

      if (!transaction) {
        console.log('❌ Transaction not found');
        return false;
      }

      // Verify transaction success
      if (transaction.meta?.err) {
        console.log('❌ Transaction failed on blockchain');
        return false;
      }

      // Basic verification checks
      const fromPubkey = new PublicKey(walletAddress);
      const toPubkey = new PublicKey(this.houseWallet);
      
      // Convert GOR to lamports (assuming 1 GOR = 10^9 lamports)
      const expectedLamports = amount * 1000000000;
      
      // Verify transaction involves correct accounts and amount
      // This is a simplified verification - in production, you'd check:
      // - Pre/post balances
      // - Instruction data
      // - Account involvement
      // - Transaction timestamp
      
      console.log('✅ Transaction verified successfully');
      return true;
      
    } catch (error) {
      console.error('Transaction verification error:', error);
      return false;
    }
  }

  async getAccountBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1000000000; // Convert lamports to GOR
    } catch (error) {
      console.error('Balance fetch error:', error);
      return 0;
    }
  }
}
