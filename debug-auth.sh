#!/bin/bash

echo "🔍 Diagnosing Gorbagana Plinko Authentication Issue"
echo "================================================="

# Check if PostgreSQL is running
echo "🗄️ Checking PostgreSQL status..."
if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -q; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ PostgreSQL is not running"
        echo "🔧 Starting PostgreSQL..."
        brew services start postgresql || sudo service postgresql start
    fi
else
    echo "⚠️ PostgreSQL not found. Please install it first."
fi

echo ""
echo "🧪 Testing database connection..."

# Test database connection
npm run db:generate 2>/dev/null

# Check if database exists
echo "📊 Testing database connectivity..."
psql -d gorbagana_plinko -c "SELECT 1;" 2>/dev/null || {
    echo "❌ Database connection failed"
    echo "🔧 Creating database if it doesn't exist..."
    createdb gorbagana_plinko 2>/dev/null || echo "Database might already exist"
}

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate || {
    echo "❌ Migration failed"
    echo "🔧 Trying to push schema..."
    npm run db:push
}

echo ""
echo "🚀 Restarting servers with debug logging..."

# Kill existing processes
pkill -f "tsx watch" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start with debug logging
echo "📡 Starting backend with enhanced logging..."
npm run dev:server &
BACKEND_PID=$!

sleep 3

echo "🌐 Starting frontend..."
npm run dev:client &
FRONTEND_PID=$!

echo ""
echo "✅ Diagnostic setup complete!"
echo ""
echo "🎯 Test Steps:"
echo "1. Open http://localhost:5173"
echo "2. Click 'Demo Mode (Testing)'"
echo "3. Check terminal for detailed logs"
echo "4. Look for specific error messages"
echo ""
echo "📋 What to look for in logs:"
echo "- 🔐 Authentication request received"
echo "- 🗄️ Database connection test"
echo "- 👤 Player creation/update"
echo "- 🔑 Token generation"
echo "- Any specific error messages"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait