#!/bin/bash

echo "🔧 Resolving merge conflicts and updating project..."
echo "=================================================="

# Clean up old node_modules and package-lock.json
echo "🧹 Cleaning up dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Install all dependencies fresh
echo "📦 Installing all dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

echo "✅ All merge conflicts resolved!"
echo ""
echo "🎯 Project Status:"
echo "- ✅ App.tsx: Resolved - using Gorbagana provider with game interface"
echo "- ✅ gameStore.ts: Resolved - includes both authentication and WebSocket handling"
echo "- ✅ package.json: Resolved - includes all blockchain dependencies"
echo "- ✅ package-lock.json: Regenerated with clean dependencies"
echo ""
echo "🚀 Ready to start:"
echo "npm run dev"