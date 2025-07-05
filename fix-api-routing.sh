#!/bin/bash

echo "🔧 Fixing API Routing Issue for Gorbagana Plinko"
echo "=============================================="

# Stop any running servers
echo "🛑 Stopping existing servers..."
pkill -f "vite"
pkill -f "tsx watch"
sleep 2

echo "🚀 Starting development servers with API proxy..."
npm run dev &

# Wait a bit for servers to start
sleep 5

echo ""
echo "✅ Servers started with API routing fix!"
echo ""
echo "🎯 What was fixed:"
echo "- ✅ Added Vite proxy configuration"
echo "- ✅ API calls now route to localhost:3001"
echo "- ✅ Frontend (5173) -> Backend (3001) proxy"
echo "- ✅ Better error handling and logging"
echo ""
echo "🔗 API Routes:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3001/api"
echo "- Proxied: localhost:5173/api -> localhost:3001/api"
echo ""
echo "🎮 Test Your Fix:"
echo "1. Open http://localhost:5173"
echo "2. Click 'Demo Mode (Testing)'"
echo "3. Check browser console for API logs"
echo "4. Should see successful authentication!"
echo ""
echo "📋 Console logs to look for:"
echo "- 🔗 API Call: POST /api/auth/verify"
echo "- 🔐 Authenticating wallet: [address]"
echo "- ✅ Authentication successful"