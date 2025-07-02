#!/bin/bash

echo "🚀 Starting Gorbagana Plinko Development Environment"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Killing any existing server processes...${NC}"

# Kill processes on port 3001
pids=$(lsof -ti:3001 2>/dev/null)
if [ ! -z "$pids" ]; then
    echo "Found processes on port 3001: $pids"
    kill -9 $pids
    echo -e "${GREEN}✅ Killed processes on port 3001${NC}"
else
    echo "No processes found on port 3001"
fi

# Kill any gorbagana-related node processes
pkill -f "gorbagana" 2>/dev/null && echo -e "${GREEN}✅ Killed gorbagana processes${NC}"

echo -e "\n${YELLOW}Step 2: Checking environment...${NC}"

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Creating basic .env file..."
    cp .env.example .env 2>/dev/null || echo "DATABASE_URL=\"postgresql://user:password@localhost:5432/gorbagana_plinko\"" > .env
fi

echo -e "\n${YELLOW}Step 3: Installing dependencies...${NC}"
npm install --silent

echo -e "\n${YELLOW}Step 4: Starting development servers...${NC}"
echo "Frontend will be available at: http://localhost:5173 or http://localhost:5174"
echo "Backend will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers
npm run dev
