import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';

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
    expectedSender: string,
    expectedAmount: number
  ): Promise<boolean> {
    try {
      // Skip verification for demo transactions
      if (signature === 'demo-transaction-signature') {
        console.log('Demo transaction - skipping verification');
        return true;
      }

      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed'
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify transaction success
      if (transaction.meta?.err) {
        throw new Error('Transaction failed');
      }

      // Get transaction details
      const { message } = transaction.transaction;
      const accountKeys = message.accountKeys;
      
      // Find the transfer instruction
      const transferInstruction = message.instructions.find(instruction => {
        const programId = accountKeys[instruction.programIdIndex];
        return programId.equals(SystemProgram.programId);
      });

      if (!transferInstruction) {
        throw new Error('No transfer instruction found');
      }

      // Decode transfer instruction
      const decoded = SystemProgram.decodeTransfer(transferInstruction);
      
      // Verify sender
      if (decoded.fromPubkey.toString() !== expectedSender) {
        throw new Error('Sender mismatch');
      }

      // Verify recipient (house wallet)
      if (decoded.toPubkey.toString() !== this.houseWallet) {
        throw new Error('Recipient mismatch');
      }

      // Verify amount (convert lamports to GOR)
      const actualAmount = decoded.lamports / Math.pow(10, 9); // Assuming 9 decimals
      if (Math.abs(actualAmount - expectedAmount) > 0.001) {
        throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`);
      }

      return true;
    } catch (error) {
      console.error('Transaction verification failed:', error);
      return false;
    }
  }

  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / Math.pow(10, 9); // Convert to GOR
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }
}