#!/bin/bash

echo "🎒 Installing Backpack Wallet Integration for Gorbagana Plinko"
echo "==========================================================="

# Clean installation
echo "🧹 Cleaning up existing dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Install all dependencies
echo "📦 Installing dependencies with Backpack wallet support..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

echo ""
echo "✅ Backpack Integration Complete!"
echo ""
echo "🎯 What's New:"
echo "- ✅ Backpack wallet as primary option"
echo "- ✅ Custom Backpack adapter for Gorbagana"
echo "- ✅ No RPC configuration required"
echo "- ✅ Optimized for Solana-based networks"
echo "- ✅ Better UX for blockchain gaming"
echo ""
echo "🎒 Backpack Benefits:"
echo "- 🔄 Automatic network detection"
echo "- 🚀 Faster transaction signing"
echo "- 🎯 Native Solana support"
echo "- 🛡️ Enhanced security features"
echo ""
echo "🚀 Ready to test with Backpack:"
echo "npm run dev"
echo ""
echo "💡 Tips:"
echo "1. Install Backpack from: https://www.backpack.app"
echo "2. Backpack automatically works with Gorbagana testnet"
echo "3. No manual RPC setup needed!"
echo "4. Use Demo Mode if Backpack isn't available"