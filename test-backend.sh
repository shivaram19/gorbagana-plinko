#!/bin/bash

echo "🧪 Testing Gorbagana Plinko Backend"
echo "=================================="

# Wait for server to start
echo "Waiting 3 seconds for server to start..."
sleep 3

# Test health endpoint
echo "🏥 Testing health endpoint..."
health_response=$(curl -s http://localhost:3001/api/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Health endpoint working: $health_response"
else
    echo "❌ Health endpoint failed"
    exit 1
fi

# Test authentication endpoint
echo ""
echo "🔐 Testing authentication endpoint..."
auth_response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST \
  http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x8a7416527807a",
    "signature": "demo-signature-1751487637943"
  }' 2>/dev/null)

# Extract status code
status=$(echo $auth_response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
body=$(echo $auth_response | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')

echo "Response Status: $status"

if [ "$status" -eq 200 ]; then
    echo "✅ Authentication endpoint working!"
    
    # Check if response contains proper fields
    if echo "$body" | grep -q '"player"' && echo "$body" | grep -q '"token"'; then
        echo "✅ Response contains player and token fields"
        
        # Check if totalWinnings is properly serialized
        if echo "$body" | grep -q '"totalWinnings":"'; then
            echo "✅ BigInt serialization working correctly"
        fi
    fi
    
    echo ""
    echo "📋 Full Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
else
    echo "❌ Authentication failed with status: $status"
    echo "Response: $body"
    
    if echo "$body" | grep -q "BigInt"; then
        echo "💥 BigInt serialization error still exists!"
    fi
fi

echo ""
echo "🎮 Frontend should be available at:"
echo "   http://localhost:5173 or http://localhost:5174"
echo ""
echo "📊 Backend is running on:"
echo "   http://localhost:3001"
