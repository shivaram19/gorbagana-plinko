import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';

export class GorbaganaAuth {
  private static JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  static verifyWalletSignature(
    walletAddress: string, 
    signature: string, 
    message: string
  ): boolean {
    try {
      const publicKey = new PublicKey(walletAddress);
      const messageUint8 = new TextEncoder().encode(message);
      const signatureUint8 = Buffer.from(signature, 'base64');
      
      return nacl.sign.detached.verify(
        messageUint8,
        signatureUint8,
        publicKey.toBytes()
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  static generateAuthToken(walletAddress: string): string {
    return jwt.sign(
      { 
        walletAddress,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      this.JWT_SECRET
    );
  }

  static verifyAuthToken(token: string): { walletAddress: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return { walletAddress: decoded.walletAddress };
    } catch (error) {
      return null;
    }
  }

  static extractMessageFromSignature(signature: string): string {
    // Extract timestamp from signature to verify message freshness
    // Implementation depends on your signature format
    return `Authenticate with Gorbagana Plinko\nWallet: ${signature}\nTimestamp: ${Date.now()}`;
  }
}