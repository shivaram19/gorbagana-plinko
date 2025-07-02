#!/bin/bash

echo "🚀 Gorbagana Plinko Wars - Setup Script"
echo "========================================"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install missing wallet adapters (since Backpack adapter might not be available yet)
echo "🔧 Installing additional Solana wallet adapters..."
npm install @solana/wallet-adapter-phantom @solana/wallet-adapter-solflare @solana/wallet-adapter-wallets

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "📊 Running database migrations..."
npm run db:migrate

echo "✅ Setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Update your .env file with actual Gorbagana testnet RPC URL"
echo "2. Set your house wallet address in VITE_HOUSE_WALLET"
echo "3. Get test GOR tokens from Gorbagana faucet"
echo "4. Start the development server: npm run dev"
echo ""
echo "🔗 Important Links:"
echo "- Gorbagana Documentation: [Add Gorbagana docs URL]"
echo "- Testnet Faucet: [Add faucet URL]"
echo "- Wallet Setup Guide: [Add wallet setup guide]"