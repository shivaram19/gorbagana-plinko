#!/bin/bash

echo "🧹 Complete Clean Installation for Gorbagana Plinko"
echo "=================================================="

# Clean everything
echo "🗑️ Removing all existing dependencies..."
rm -rf node_modules
rm -f package-lock.json*

echo "📦 Fresh installation of all dependencies..."
npm install

echo "🗄️ Generating Prisma client..."
npm run db:generate

echo "✅ Clean installation complete!"
echo ""
echo "📋 What was cleaned:"
echo "- ✅ Removed manually created package-lock.json"
echo "- ✅ Deleted node_modules for fresh install"
echo "- ✅ Generated new package-lock.json automatically"
echo "- ✅ Installed all Gorbagana blockchain dependencies"
echo ""
echo "🎯 Your project now has:"
echo "- 🔗 Solana Web3.js for blockchain integration"
echo "- 👛 Wallet adapters for Phantom/Solflare"
echo "- 🔐 Authentication with signature verification"
echo "- 💰 GOR token transaction handling"
echo ""
echo "🚀 Ready to start development:"
echo "npm run dev"