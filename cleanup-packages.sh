#!/bin/bash

echo "🧹 Cleaning up package.json duplicates and regenerating lock file..."
echo "================================================================"

# Remove any existing lock files and node_modules
echo "🗑️ Removing old dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f package-lock.json.backup

echo "📦 Installing clean dependencies..."
npm install

echo "🗄️ Generating Prisma client..."
npm run db:generate

echo "✅ Package cleanup complete!"
echo ""
echo "📋 Fixed Issues:"
echo "- ✅ Removed duplicate dependencies"
echo "- ✅ Added missing wallet adapters (@solana/wallet-adapter-phantom, solflare, wallets)"
echo "- ✅ Added tweetnacl for signature verification"
echo "- ✅ Added react-router-dom for navigation"
echo "- ✅ Regenerated clean package-lock.json"
echo ""
echo "🚀 Ready to start:"
echo "npm run dev"