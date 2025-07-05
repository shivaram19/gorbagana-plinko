#!/bin/bash

echo "🧪 Testing TweetNaCl import fix..."
echo "================================"

# Kill any existing processes
echo "🛑 Stopping any running servers..."
pkill -f "tsx watch"
pkill -f "vite"

# Wait a moment
sleep 2

echo "🚀 Starting development servers..."
npm run dev