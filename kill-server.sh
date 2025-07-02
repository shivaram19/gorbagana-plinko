#!/bin/bash

echo "🔍 Finding processes using port 3001..."

# Find and kill processes using port 3001
pids=$(lsof -ti:3001)

if [ -z "$pids" ]; then
    echo "✅ No processes found using port 3001"
else
    echo "🎯 Found processes using port 3001: $pids"
    echo "💀 Killing processes..."
    
    for pid in $pids; do
        echo "Killing PID: $pid"
        kill -9 $pid
    done
    
    echo "✅ All processes killed"
fi

# Also check for any node processes related to gorbagana
echo "🔍 Checking for gorbagana-related node processes..."
ps aux | grep -i gorbagana | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    echo "Found gorbagana process: $pid"
    kill -9 $pid 2>/dev/null
done

echo "🧹 Cleanup complete!"
echo "🚀 You can now run: npm run dev"
